/**
 * @CODE-MEMORY
 * Screen:     HRM Contracts / Đãi ngộ tab (embed P-CC-04 + EmployeeProfile contracts)
 * UC:         UC-HRM-CI-08..11 · UC-HRM-25 · UC-HRM-INT-02/03
 * BR:         BR-CD-F5-01..07
 * SRS:        docs/program/deltas/CUSTOMER_DEMO_HRM_DELTA_20260620.md §5
 *             docs/hrm/SRS.md §13 UC-HRM-25 · §14 UC-HRM-28 · §15.3 UC-HRM-INT-02/03
 * TechSpec:   docs/api/openapi/hrm-api.yaml /contracts-insurance/compensation-*
 * Purpose:    Compensation packages separated from labor contract body: base salary,
 *             probation salary, allowance lines (XBOS DM §33), versioned revise +
 *             append-only history. Active package lookup for payroll consumers.
 * WorkItem:   CD-FB-08-CONTRACT
 * Coded:      2026-07-19
 *
 * Callers:
 *   - contracts-insurance.controller.ts → create/list/get/active/revise/history
 *
 * Callees:
 *   - HrmDbService.query → employee_compensation_packages|lines|history, employee_contracts, employees
 *   - resolveHrmListScope / pushCompanyIdFilter / assertResourceInHrmScope (scope parity)
 *
 * FE-Actions:
 *   | User action              | Handler (FE)              | API                                      |
 *   |--------------------------|---------------------------|------------------------------------------|
 *   | Tab Đãi ngộ → Lưu        | createCompensationPackage | POST .../compensation-packages           |
 *   | Tăng lương               | reviseCompensationPackage | POST .../compensation-packages/:id/revise|
 *   | Tab Lịch sử              | listCompensationHistory   | GET  .../compensation-history            |
 *   | Payroll kỳ               | getActiveCompensation     | GET  .../compensation-packages/active    |
 *
 * BE-Chain:
 *   create → INSERT package + lines + history; optional link contracts.compensation_package_id
 *   revise → close prior (effective_to); INSERT new version + lines + history (no destructive UPDATE)
 *   active → package where effective_from <= as_of AND (effective_to IS NULL OR effective_to >= as_of)
 *
 * Impact:     Breaking payroll if still reading contracts.salary; FE must stop requiring salary on HĐ form
 * must_keep:  Scope parity list/get; allowance_code required for allowance; versioning not overwrite
 * SOLID:      SRP — compensation versioning isolated from contract term CRUD
 * LastVerified: employee-compensation.service.spec.ts (CD-FB-08 · D-CD-FB-08-ACTIVE-COLD-500)
 *
 * @CODE-MEMORY-CHANGE 2026-07-19 D-CD-FB-08-ACTIVE-COLD-500
 * What: ensureCompensationSchema single-flight + swallow pg_type_typname_nsp_index (23505) race
 * Why:  Cold FE loads list+/active in parallel → concurrent CREATE TABLE IF NOT EXISTS → 500 before first create
 * must_keep: F5 ACs (create/revise/history/active window/scope parity) already PASS — no contract/salary overwrite
 */

import { HttpStatus, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import {
  assertResourceInHrmScope,
  expandHrmTextCompanyIds,
  HrmListScope,
  HrmListScopeContext,
  normalizePayrollListCompanyId,
  pushCompanyIdFilter,
  pushWorkforceEmployeeScopeFilter,
  resolveHrmListScope,
  resolveHrmPersistCompanyIdText,
} from '../common/hrm-list-scope';
import { HrmDbService } from '../db/hrm-db.service';
import {
  CompensationLineDto,
  CreateCompensationPackageDto,
  ReviseCompensationPackageDto,
} from './dto/create-compensation-package.dto';
import { ListCompensationQueryDto } from './dto/list-compensation.query.dto';

export type CompensationLineType = 'base' | 'probation' | 'allowance';

export type CompensationLineRow = {
  id: string;
  package_id: string;
  line_type: CompensationLineType;
  amount: string | number;
  currency: string;
  allowance_code: string | null;
  taxable: boolean;
  note: string | null;
  sort_order: number;
  created_at: string | Date;
};

export type CompensationPackageRow = {
  id: string;
  company_id: string;
  employee_id: string;
  contract_id: string | null;
  version: number;
  supersedes_package_id: string | null;
  effective_from: string;
  effective_to: string | null;
  currency: string;
  change_reason: string | null;
  created_at: string | Date;
  updated_at: string | Date;
};

export type CompensationPackageDetail = CompensationPackageRow & {
  lines: CompensationLineRow[];
};

export type CompensationHistoryRow = {
  id: string;
  company_id: string;
  employee_id: string;
  package_id: string;
  previous_package_id: string | null;
  version: number;
  change_reason: string | null;
  snapshot: Record<string, unknown>;
  created_at: string | Date;
};

@Injectable()
export class EmployeeCompensationService {
  /** Single-flight: cold list+/active parallel must not race CREATE TABLE → pg_type_typname_nsp_index. */
  private compensationSchemaReady: Promise<void> | null = null;

  constructor(private readonly db: HrmDbService) {}

  private resolvePage(value: number | string | undefined, fallback: number): number {
    const parsed = Number(value ?? fallback);
    if (!Number.isFinite(parsed) || parsed < 1) return fallback;
    return Math.trunc(parsed);
  }

  private resolvePageSize(value: number | string | undefined, fallback: number): number {
    const parsed = Number(value ?? fallback);
    if (!Number.isFinite(parsed) || parsed < 1) return fallback;
    return Math.min(100, Math.trunc(parsed));
  }

  private resolveListScope(
    authorization: string | undefined,
    requestedCompanyId: string,
    scopeContext?: HrmListScopeContext,
  ): { scope: HrmListScope; expandedCompanyIds: string[] } {
    const scopeCompanyId = normalizePayrollListCompanyId(authorization, requestedCompanyId);
    const scope = resolveHrmListScope(authorization, scopeCompanyId, scopeContext);
    const expandedCompanyIds = expandHrmTextCompanyIds(scope, authorization, requestedCompanyId);
    return { scope, expandedCompanyIds };
  }

  /** True when concurrent CREATE TABLE IF NOT EXISTS lost the pg_type race (still idempotent). */
  private isIgnorableSchemaRace(error: unknown): boolean {
    const pg = error as { code?: string; message?: string };
    const message = String(pg.message ?? (error instanceof Error ? error.message : error));
    if (pg.code === '42P07' || pg.code === '42710') return true;
    if (pg.code === '23505' && /pg_type_typname_nsp_index|already exists/i.test(message)) {
      return true;
    }
    return /duplicate key.*pg_type_typname_nsp_index/i.test(message);
  }

  private async runCompensationDdl(sql: string): Promise<void> {
    try {
      await this.db.query(sql);
    } catch (error) {
      if (this.isIgnorableSchemaRace(error)) return;
      throw error;
    }
  }

  /**
   * Idempotent bootstrap for compensation tables (migration 0017 + runtime ensure).
   * Single-flight + swallow pg_type duplicate so cold GET /active never 500 before first create.
   */
  async ensureCompensationSchema(): Promise<void> {
    if (!this.compensationSchemaReady) {
      this.compensationSchemaReady = this.applyCompensationSchema().catch((error) => {
        this.compensationSchemaReady = null;
        throw error;
      });
    }
    await this.compensationSchemaReady;
  }

  private async applyCompensationSchema(): Promise<void> {
    await this.runCompensationDdl(`
      CREATE TABLE IF NOT EXISTS public.employee_compensation_packages (
        id UUID PRIMARY KEY,
        company_id TEXT NOT NULL,
        employee_id UUID NOT NULL,
        contract_id UUID NULL,
        version INTEGER NOT NULL DEFAULT 1,
        supersedes_package_id UUID NULL,
        effective_from DATE NOT NULL,
        effective_to DATE NULL,
        currency TEXT NOT NULL DEFAULT 'VND',
        change_reason TEXT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.runCompensationDdl(`
      CREATE TABLE IF NOT EXISTS public.employee_compensation_lines (
        id UUID PRIMARY KEY,
        package_id UUID NOT NULL,
        line_type TEXT NOT NULL,
        amount NUMERIC(18, 2) NOT NULL,
        currency TEXT NOT NULL DEFAULT 'VND',
        allowance_code TEXT NULL,
        taxable BOOLEAN NOT NULL DEFAULT TRUE,
        note TEXT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.runCompensationDdl(`
      CREATE TABLE IF NOT EXISTS public.employee_compensation_history (
        id UUID PRIMARY KEY,
        company_id TEXT NOT NULL,
        employee_id UUID NOT NULL,
        package_id UUID NOT NULL,
        previous_package_id UUID NULL,
        version INTEGER NOT NULL,
        change_reason TEXT NULL,
        snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await this.runCompensationDdl(`
      ALTER TABLE public.employee_contracts
      ADD COLUMN IF NOT EXISTS compensation_package_id UUID NULL;
    `);
    await this.runCompensationDdl(`
      CREATE INDEX IF NOT EXISTS idx_comp_packages_employee_effective
      ON public.employee_compensation_packages (company_id, employee_id, effective_from DESC);
    `);
    await this.runCompensationDdl(`
      CREATE INDEX IF NOT EXISTS idx_comp_lines_package
      ON public.employee_compensation_lines (package_id, sort_order ASC);
    `);
    await this.runCompensationDdl(`
      CREATE INDEX IF NOT EXISTS idx_comp_history_employee
      ON public.employee_compensation_history (company_id, employee_id, created_at DESC);
    `);
  }

  private validateLines(lines: CompensationLineDto[]): void {
    const types = new Set(lines.map((l) => l.line_type));
    if (!types.has('base')) {
      throw new ApiException(
        'HRM-COMP-001',
        'Compensation package requires at least one base line',
        HttpStatus.BAD_REQUEST,
      );
    }
    for (const line of lines) {
      if (line.line_type === 'allowance') {
        const code = line.allowance_code?.trim();
        if (!code) {
          throw new ApiException(
            'HRM-COMP-003',
            'allowance_code is required for allowance lines (XBOS DM §33)',
            HttpStatus.BAD_REQUEST,
          );
        }
      } else if (line.allowance_code != null && String(line.allowance_code).trim() !== '') {
        throw new ApiException(
          'HRM-COMP-003',
          'allowance_code is only valid for allowance lines',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }

  private async assertEmployeeInScope(
    employeeId: string,
    companyId: string,
    authorization: string | undefined,
  ): Promise<{
    id: string;
    company_id: string;
    status: string;
    employment_status: string | null;
  }> {
    const scope = resolveHrmListScope(authorization, companyId);
    const filters: string[] = ['e.id = $1::uuid', 'e.archived_at IS NULL'];
    const values: unknown[] = [employeeId];
    pushCompanyIdFilter(filters, values, expandHrmTextCompanyIds(scope, authorization, companyId));
    const res = await this.db.query<{
      id: string;
      company_id: string;
      status: string;
      employment_status: string | null;
    }>(
      `
        SELECT
          e.id,
          e.company_id::text AS company_id,
          e.status,
          COALESCE(
            NULLIF(TRIM(e.custom_fields->>'employment_status'), ''),
            NULLIF(TRIM(e.custom_fields->>'labor_status'), ''),
            NULLIF(TRIM(e.custom_fields->>'status'), '')
          ) AS employment_status
        FROM public.employees e
        WHERE ${filters.join(' AND ')}
        LIMIT 1;
      `,
      values,
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException('HRM-COMP-404', 'Employee not found in scope', HttpStatus.NOT_FOUND);
    }
    return row;
  }

  private async isEmployeeProbation(
    employeeId: string,
    companyId: string,
    authorization: string | undefined,
    contractId?: string | null,
  ): Promise<boolean> {
    const employee = await this.assertEmployeeInScope(employeeId, companyId, authorization);
    const statusHints = [employee.status, employee.employment_status]
      .filter(Boolean)
      .map((s) => String(s).toLowerCase());
    if (statusHints.some((s) => s.includes('probation') || s.includes('thử việc') || s.includes('thu viec'))) {
      return true;
    }
    if (contractId) {
      const contract = await this.db.query<{ contract_type: string }>(
        `SELECT contract_type FROM public.employee_contracts WHERE id = $1::uuid LIMIT 1;`,
        [contractId],
      );
      const type = (contract.rows[0]?.contract_type ?? '').toLowerCase();
      if (type.includes('probation') || type.includes('thử việc') || type.includes('thu viec')) {
        return true;
      }
    }
    return false;
  }

  private async assertProbationLinesAllowed(
    lines: CompensationLineDto[],
    employeeId: string,
    companyId: string,
    authorization: string | undefined,
    contractId?: string | null,
  ): Promise<void> {
    const hasProbation = lines.some((l) => l.line_type === 'probation');
    if (!hasProbation) return;
    const ok = await this.isEmployeeProbation(employeeId, companyId, authorization, contractId);
    if (!ok) {
      throw new ApiException(
        'HRM-COMP-002',
        'probation line only allowed when employee/contract is in probation',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private mapLine(row: CompensationLineRow): CompensationLineRow {
    return {
      ...row,
      amount: Number(row.amount),
      created_at:
        row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
    };
  }

  private mapPackage(row: CompensationPackageRow): CompensationPackageRow {
    return {
      ...row,
      created_at:
        row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
      updated_at:
        row.updated_at instanceof Date ? row.updated_at.toISOString() : String(row.updated_at),
    };
  }

  private async insertLines(
    packageId: string,
    lines: CompensationLineDto[],
    defaultCurrency: string,
  ): Promise<CompensationLineRow[]> {
    const inserted: CompensationLineRow[] = [];
    let sort = 0;
    for (const line of lines) {
      const id = randomUUID();
      const sortOrder = line.sort_order ?? sort;
      sort += 1;
      const res = await this.db.query<CompensationLineRow>(
        `
          INSERT INTO public.employee_compensation_lines
            (id, package_id, line_type, amount, currency, allowance_code, taxable, note, sort_order)
          VALUES ($1::uuid, $2::uuid, $3, $4, $5, $6, $7, $8, $9)
          RETURNING id, package_id, line_type, amount, currency, allowance_code, taxable, note, sort_order, created_at;
        `,
        [
          id,
          packageId,
          line.line_type,
          line.amount,
          line.currency?.trim() || defaultCurrency,
          line.line_type === 'allowance' ? line.allowance_code!.trim() : null,
          line.taxable ?? true,
          line.note?.trim() ?? null,
          sortOrder,
        ],
      );
      inserted.push(this.mapLine(res.rows[0]));
    }
    return inserted;
  }

  private async appendHistory(input: {
    companyId: string;
    employeeId: string;
    packageId: string;
    previousPackageId: string | null;
    version: number;
    changeReason: string | null;
    lines: CompensationLineRow[];
    effectiveFrom: string;
    effectiveTo: string | null;
    currency: string;
  }): Promise<void> {
    await this.db.query(
      `
        INSERT INTO public.employee_compensation_history
          (id, company_id, employee_id, package_id, previous_package_id, version, change_reason, snapshot)
        VALUES ($1::uuid, $2, $3::uuid, $4::uuid, $5::uuid, $6, $7, $8::jsonb);
      `,
      [
        randomUUID(),
        input.companyId,
        input.employeeId,
        input.packageId,
        input.previousPackageId,
        input.version,
        input.changeReason,
        JSON.stringify({
          effective_from: input.effectiveFrom,
          effective_to: input.effectiveTo,
          currency: input.currency,
          lines: input.lines.map((l) => ({
            line_type: l.line_type,
            amount: Number(l.amount),
            currency: l.currency,
            allowance_code: l.allowance_code,
            taxable: l.taxable,
            note: l.note,
          })),
        }),
      ],
    );
  }

  private async loadLines(packageId: string): Promise<CompensationLineRow[]> {
    const res = await this.db.query<CompensationLineRow>(
      `
        SELECT id, package_id, line_type, amount, currency, allowance_code, taxable, note, sort_order, created_at
        FROM public.employee_compensation_lines
        WHERE package_id = $1::uuid
        ORDER BY sort_order ASC, created_at ASC;
      `,
      [packageId],
    );
    return res.rows.map((r) => this.mapLine(r));
  }

  private async loadPackageRow(
    packageId: string,
    expandedCompanyIds: string[],
    scope: HrmListScope,
  ): Promise<CompensationPackageRow | null> {
    const filters: string[] = ['p.id = $1::uuid'];
    const values: unknown[] = [packageId];
    pushCompanyIdFilter(filters, values, expandedCompanyIds);
    pushWorkforceEmployeeScopeFilter(filters, values, scope, 'employee_id');
    const qualified = filters.map((clause) => {
      if (clause.includes('FROM public.employees')) {
        return clause.replace(/^(\s*)employee_id\b/, '$1p.employee_id');
      }
      return clause
        .replace(/(?<!p\.)\bcompany_id\b/g, 'p.company_id')
        .replace(/(?<!p\.)\bemployee_id\b/g, 'p.employee_id');
    });
    const res = await this.db.query<CompensationPackageRow>(
      `
        SELECT
          p.id, p.company_id, p.employee_id, p.contract_id, p.version, p.supersedes_package_id,
          p.effective_from::text AS effective_from,
          p.effective_to::text AS effective_to,
          p.currency, p.change_reason, p.created_at, p.updated_at
        FROM public.employee_compensation_packages p
        WHERE ${qualified.join(' AND ')}
        LIMIT 1;
      `,
      values,
    );
    return res.rows[0] ? this.mapPackage(res.rows[0]) : null;
  }

  async createPackage(
    payload: CreateCompensationPackageDto,
    authorization?: string,
  ): Promise<CompensationPackageDetail> {
    await this.ensureCompensationSchema();
    this.validateLines(payload.lines);
    const companyId = resolveHrmPersistCompanyIdText(authorization, payload.company_id);
    await this.assertEmployeeInScope(payload.employee_id, companyId, authorization);
    await this.assertProbationLinesAllowed(
      payload.lines,
      payload.employee_id,
      companyId,
      authorization,
      payload.contract_id,
    );

    if (
      payload.effective_to &&
      new Date(payload.effective_from).getTime() > new Date(payload.effective_to).getTime()
    ) {
      throw new ApiException(
        'HRM-COMP-001',
        'effective_from must be <= effective_to',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (payload.contract_id) {
      const contract = await this.db.query<{ id: string; company_id: string; employee_id: string }>(
        `SELECT id, company_id::text AS company_id, employee_id::text AS employee_id
         FROM public.employee_contracts WHERE id = $1::uuid LIMIT 1;`,
        [payload.contract_id],
      );
      const row = contract.rows[0];
      if (!row) {
        throw new ApiException('HRM-CON-404', 'Contract not found', HttpStatus.NOT_FOUND);
      }
      const scope = resolveHrmListScope(authorization, companyId);
      assertResourceInHrmScope(row, scope, {
        notFoundCode: 'HRM-CON-404',
        mismatchCode: 'HRM-CON-409',
      });
      if (row.employee_id !== payload.employee_id) {
        throw new ApiException(
          'HRM-COMP-001',
          'contract_id employee mismatch',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    const packageId = randomUUID();
    const currency = payload.currency?.trim() || 'VND';
    const changeReason = payload.change_reason?.trim() ?? 'initial';
    const pkgRes = await this.db.query<CompensationPackageRow>(
      `
        INSERT INTO public.employee_compensation_packages
          (id, company_id, employee_id, contract_id, version, supersedes_package_id,
           effective_from, effective_to, currency, change_reason)
        VALUES ($1::uuid, $2, $3::uuid, $4::uuid, 1, NULL, $5::date, $6::date, $7, $8)
        RETURNING
          id, company_id, employee_id, contract_id, version, supersedes_package_id,
          effective_from::text AS effective_from, effective_to::text AS effective_to,
          currency, change_reason, created_at, updated_at;
      `,
      [
        packageId,
        companyId,
        payload.employee_id,
        payload.contract_id ?? null,
        payload.effective_from,
        payload.effective_to ?? null,
        currency,
        changeReason,
      ],
    );
    const lines = await this.insertLines(packageId, payload.lines, currency);
    await this.appendHistory({
      companyId,
      employeeId: payload.employee_id,
      packageId,
      previousPackageId: null,
      version: 1,
      changeReason,
      lines,
      effectiveFrom: payload.effective_from,
      effectiveTo: payload.effective_to ?? null,
      currency,
    });

    if (payload.link_to_contract && payload.contract_id) {
      await this.db.query(
        `
          UPDATE public.employee_contracts
          SET compensation_package_id = $1::uuid, updated_at = NOW()
          WHERE id = $2::uuid;
        `,
        [packageId, payload.contract_id],
      );
    }

    return { ...this.mapPackage(pkgRes.rows[0]), lines };
  }

  async revisePackage(
    packageId: string,
    payload: ReviseCompensationPackageDto,
    requestedCompanyId: string,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ): Promise<CompensationPackageDetail> {
    await this.ensureCompensationSchema();
    this.validateLines(payload.lines);
    const { scope, expandedCompanyIds } = this.resolveListScope(
      authorization,
      requestedCompanyId,
      scopeContext,
    );
    const existing = await this.loadPackageRow(packageId, expandedCompanyIds, scope);
    if (!existing) {
      throw new ApiException('HRM-COMP-404', 'Compensation package not found', HttpStatus.NOT_FOUND);
    }
    await this.assertProbationLinesAllowed(
      payload.lines,
      existing.employee_id,
      existing.company_id,
      authorization,
      existing.contract_id,
    );

    if (
      payload.effective_to &&
      new Date(payload.effective_from).getTime() > new Date(payload.effective_to).getTime()
    ) {
      throw new ApiException(
        'HRM-COMP-001',
        'effective_from must be <= effective_to',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Close prior version the day before new effective_from (BR-CD-F5-04/05 — no destructive UPDATE of lines).
    const priorEnd = new Date(payload.effective_from);
    priorEnd.setUTCDate(priorEnd.getUTCDate() - 1);
    const priorEndIso = priorEnd.toISOString().slice(0, 10);
    await this.db.query(
      `
        UPDATE public.employee_compensation_packages
        SET effective_to = LEAST(
              COALESCE(effective_to, $1::date),
              $1::date
            ),
            updated_at = NOW()
        WHERE id = $2::uuid;
      `,
      [priorEndIso, packageId],
    );

    const newId = randomUUID();
    const currency = payload.currency?.trim() || existing.currency || 'VND';
    const changeReason = payload.change_reason?.trim() ?? 'revise';
    const nextVersion = Number(existing.version) + 1;
    const pkgRes = await this.db.query<CompensationPackageRow>(
      `
        INSERT INTO public.employee_compensation_packages
          (id, company_id, employee_id, contract_id, version, supersedes_package_id,
           effective_from, effective_to, currency, change_reason)
        VALUES ($1::uuid, $2, $3::uuid, $4::uuid, $5, $6::uuid, $7::date, $8::date, $9, $10)
        RETURNING
          id, company_id, employee_id, contract_id, version, supersedes_package_id,
          effective_from::text AS effective_from, effective_to::text AS effective_to,
          currency, change_reason, created_at, updated_at;
      `,
      [
        newId,
        existing.company_id,
        existing.employee_id,
        existing.contract_id,
        nextVersion,
        packageId,
        payload.effective_from,
        payload.effective_to ?? null,
        currency,
        changeReason,
      ],
    );
    const lines = await this.insertLines(newId, payload.lines, currency);
    await this.appendHistory({
      companyId: existing.company_id,
      employeeId: existing.employee_id,
      packageId: newId,
      previousPackageId: packageId,
      version: nextVersion,
      changeReason,
      lines,
      effectiveFrom: payload.effective_from,
      effectiveTo: payload.effective_to ?? null,
      currency,
    });

    if (existing.contract_id) {
      await this.db.query(
        `
          UPDATE public.employee_contracts
          SET compensation_package_id = $1::uuid, updated_at = NOW()
          WHERE id = $2::uuid;
        `,
        [newId, existing.contract_id],
      );
    }

    return { ...this.mapPackage(pkgRes.rows[0]), lines };
  }

  async getPackageById(
    packageId: string,
    requestedCompanyId: string,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ): Promise<CompensationPackageDetail> {
    await this.ensureCompensationSchema();
    const { scope, expandedCompanyIds } = this.resolveListScope(
      authorization,
      requestedCompanyId,
      scopeContext,
    );
    const row = await this.loadPackageRow(packageId, expandedCompanyIds, scope);
    if (!row) {
      throw new ApiException('HRM-COMP-404', 'Compensation package not found', HttpStatus.NOT_FOUND);
    }
    const lines = await this.loadLines(packageId);
    return { ...row, lines };
  }

  async listPackages(
    query: ListCompensationQueryDto,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ): Promise<{ total: number; page: number; page_size: number; data: CompensationPackageDetail[] }> {
    await this.ensureCompensationSchema();
    const { scope, expandedCompanyIds } = this.resolveListScope(
      authorization,
      query.company_id,
      scopeContext,
    );
    const page = this.resolvePage(query.page, 1);
    const pageSize = this.resolvePageSize(query.page_size, 20);
    const filters: string[] = [];
    const values: unknown[] = [];
    pushCompanyIdFilter(filters, values, expandedCompanyIds);
    pushWorkforceEmployeeScopeFilter(filters, values, scope, 'employee_id');
    if (query.employee_id) {
      filters.push(`employee_id = $${values.length + 1}::uuid`);
      values.push(query.employee_id);
    }
    const qualified = filters.map((clause) => {
      if (clause.includes('FROM public.employees')) {
        return clause.replace(/^(\s*)employee_id\b/, '$1p.employee_id');
      }
      return clause
        .replace(/(?<!p\.)\bcompany_id\b/g, 'p.company_id')
        .replace(/(?<!p\.)\bemployee_id\b/g, 'p.employee_id');
    });
    const res = await this.db.query<CompensationPackageRow>(
      `
        SELECT
          p.id, p.company_id, p.employee_id, p.contract_id, p.version, p.supersedes_package_id,
          p.effective_from::text AS effective_from,
          p.effective_to::text AS effective_to,
          p.currency, p.change_reason, p.created_at, p.updated_at
        FROM public.employee_compensation_packages p
        WHERE ${qualified.join(' AND ')}
        ORDER BY p.effective_from DESC, p.version DESC;
      `,
      values,
    );
    const slice = res.rows.slice((page - 1) * pageSize, page * pageSize).map((r) => this.mapPackage(r));
    const data: CompensationPackageDetail[] = [];
    for (const pkg of slice) {
      data.push({ ...pkg, lines: await this.loadLines(pkg.id) });
    }
    return { total: res.rows.length, page, page_size: pageSize, data };
  }

  async getActivePackage(
    query: ListCompensationQueryDto,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ): Promise<CompensationPackageDetail | null> {
    await this.ensureCompensationSchema();
    if (!query.employee_id) {
      throw new ApiException(
        'HRM-COMP-001',
        'employee_id is required for active package lookup',
        HttpStatus.BAD_REQUEST,
      );
    }
    const { scope, expandedCompanyIds } = this.resolveListScope(
      authorization,
      query.company_id,
      scopeContext,
    );
    const asOf = query.as_of ?? new Date().toISOString().slice(0, 10);
    const filters: string[] = [];
    const values: unknown[] = [];
    pushCompanyIdFilter(filters, values, expandedCompanyIds);
    pushWorkforceEmployeeScopeFilter(filters, values, scope, 'employee_id');
    values.push(query.employee_id);
    filters.push(`p.employee_id = $${values.length}::uuid`);
    values.push(asOf);
    const asOfIdx = values.length;
    filters.push(`p.effective_from <= $${asOfIdx}::date`);
    filters.push(`(p.effective_to IS NULL OR p.effective_to >= $${asOfIdx}::date)`);
    const qualified = filters.map((clause) => {
      if (clause.includes('FROM public.employees')) {
        return clause.replace(/^(\s*)employee_id\b/, '$1p.employee_id');
      }
      if (clause.startsWith('p.')) return clause;
      return clause
        .replace(/(?<!p\.)\bcompany_id\b/g, 'p.company_id')
        .replace(/(?<!p\.)\bemployee_id\b/g, 'p.employee_id');
    });

    const res = await this.db.query<CompensationPackageRow>(
      `
        SELECT
          p.id, p.company_id, p.employee_id, p.contract_id, p.version, p.supersedes_package_id,
          p.effective_from::text AS effective_from,
          p.effective_to::text AS effective_to,
          p.currency, p.change_reason, p.created_at, p.updated_at
        FROM public.employee_compensation_packages p
        WHERE ${qualified.join(' AND ')}
        ORDER BY p.version DESC, p.effective_from DESC
        LIMIT 1;
      `,
      values,
    );
    const row = res.rows[0];
    if (!row) return null;
    return { ...this.mapPackage(row), lines: await this.loadLines(row.id) };
  }

  async listHistory(
    query: ListCompensationQueryDto,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ): Promise<{ total: number; page: number; page_size: number; data: CompensationHistoryRow[] }> {
    await this.ensureCompensationSchema();
    const { scope, expandedCompanyIds } = this.resolveListScope(
      authorization,
      query.company_id,
      scopeContext,
    );
    const page = this.resolvePage(query.page, 1);
    const pageSize = this.resolvePageSize(query.page_size, 20);
    const filters: string[] = [];
    const values: unknown[] = [];
    pushCompanyIdFilter(filters, values, expandedCompanyIds);
    pushWorkforceEmployeeScopeFilter(filters, values, scope, 'employee_id');
    if (query.employee_id) {
      filters.push(`employee_id = $${values.length + 1}::uuid`);
      values.push(query.employee_id);
    }
    if (query.package_id) {
      filters.push(`package_id = $${values.length + 1}::uuid`);
      values.push(query.package_id);
    }
    const qualified = filters.map((clause) => {
      if (clause.includes('FROM public.employees')) {
        return clause.replace(/^(\s*)employee_id\b/, '$1h.employee_id');
      }
      return clause
        .replace(/(?<!h\.)\bcompany_id\b/g, 'h.company_id')
        .replace(/(?<!h\.)\bemployee_id\b/g, 'h.employee_id')
        .replace(/(?<!h\.)\bpackage_id\b/g, 'h.package_id');
    });
    const res = await this.db.query<CompensationHistoryRow>(
      `
        SELECT
          h.id, h.company_id, h.employee_id, h.package_id, h.previous_package_id,
          h.version, h.change_reason, h.snapshot, h.created_at
        FROM public.employee_compensation_history h
        WHERE ${qualified.join(' AND ')}
        ORDER BY h.created_at DESC, h.version DESC;
      `,
      values,
    );
    const data = res.rows.slice((page - 1) * pageSize, page * pageSize).map((row) => ({
      ...row,
      created_at:
        row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
      snapshot:
        typeof row.snapshot === 'string'
          ? (JSON.parse(row.snapshot) as Record<string, unknown>)
          : (row.snapshot as Record<string, unknown>),
    }));
    return { total: res.rows.length, page, page_size: pageSize, data };
  }
}
