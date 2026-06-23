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
import { CreateContractDto } from './dto/create-contract.dto';
import { CreateInsuranceRecordDto } from './dto/create-insurance-record.dto';
import { ListExpiringQueryDto } from './dto/list-expiring.query.dto';
import { ListContractsQueryDto } from './dto/list-contracts.query.dto';
import { UpdateContractDto } from './dto/update-contract.dto';

type ContractRow = {
  id: string;
  company_id: string;
  employee_id: string;
  contract_code?: string | null;
  contract_type: string;
  start_date: string;
  end_date: string;
  status: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  employee_name?: string | null;
  employee_code?: string | null;
  department?: string | null;
};

type InsuranceRow = {
  id: string;
  company_id: string;
  employee_id: string;
  provider: string;
  policy_number: string;
  expiry_date: string;
  status: string;
  created_at: string | Date;
  updated_at: string | Date;
};

/** BR-INS-01 — BHXH-shaped fields for embed / Insurance tab (Nest API mode). */
export type InsuranceListItemDto = InsuranceRow & {
  employee_name?: string | null;
  employee_code?: string | null;
  department?: string | null;
  social_insurance_number: string;
  health_insurance_number: string | null;
  unemployment_insurance_number: string | null;
  social_insurance_rate: number | null;
  health_insurance_rate: number | null;
  unemployment_insurance_rate: number | null;
  base_salary: number | null;
  effective_date: string | null;
};

@Injectable()
export class ContractsInsuranceService {
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

  /** Mobile sends legal company_uuid; map to JWT slug + expand slug/uuid TEXT for list filters. */
  private resolveContractsListScope(
    authorization: string | undefined,
    requestedCompanyId: string,
    scopeContext?: HrmListScopeContext,
  ): { scope: HrmListScope; expandedCompanyIds: string[] } {
    const scopeCompanyId = normalizePayrollListCompanyId(authorization, requestedCompanyId);
    const scope = resolveHrmListScope(authorization, scopeCompanyId, scopeContext);
    const expandedCompanyIds = expandHrmTextCompanyIds(scope, authorization, requestedCompanyId);
    return { scope, expandedCompanyIds };
  }

  /** J-HRM-01/04: list rows only when employee_id resolves like GET /employees/{id}. */
  private pushResolvableEmployeeScope(
    filters: string[],
    values: unknown[],
    scope: HrmListScope,
    employeeIdColumn: string,
  ): void {
    pushWorkforceEmployeeScopeFilter(filters, values, scope, employeeIdColumn);
  }

  private qualifyContractInsuranceFilters(
    filters: string[],
    tableAlias: 'ec' | 'ir',
  ): string[] {
    const unqualifiedColumn = (column: string) =>
      new RegExp(`(?<!${tableAlias}\\.)\\b${column}\\b`, 'g');

    return filters.map((clause) => {
      if (clause.includes('FROM public.employees')) {
        // Workforce scope IN-subquery — qualify only the outer employee_id predicate.
        return clause.replace(
          new RegExp(`^(\\s*)(?<!${tableAlias}\\.)employee_id\\b`),
          `$1${tableAlias}.employee_id`,
        );
      }
      return clause
        .replace(unqualifiedColumn('company_id'), `${tableAlias}.company_id`)
        .replace(unqualifiedColumn('employee_id'), `${tableAlias}.employee_id`)
        .replace(unqualifiedColumn('status'), `${tableAlias}.status`);
    });
  }

  private async ensureSchema() {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.employee_contracts (
        id UUID PRIMARY KEY,
        company_id TEXT NOT NULL,
        employee_id UUID NOT NULL,
        contract_code TEXT NULL,
        contract_type TEXT NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT chk_employee_contract_status CHECK (status IN ('active', 'expired', 'terminated')),
        CONSTRAINT chk_contract_date_range CHECK (start_date <= end_date)
      );
    `);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.employee_insurance_records (
        id UUID PRIMARY KEY,
        company_id TEXT NOT NULL,
        employee_id UUID NOT NULL,
        provider TEXT NOT NULL,
        policy_number TEXT NOT NULL,
        expiry_date DATE NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT chk_employee_insurance_status CHECK (status IN ('active', 'expired', 'cancelled'))
      );
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_employee_contracts_company_end_date
      ON public.employee_contracts (company_id, end_date);
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_employee_insurance_company_expiry_date
      ON public.employee_insurance_records (company_id, expiry_date);
    `);
    await this.db.query(`
      ALTER TABLE public.employee_contracts
      ADD COLUMN IF NOT EXISTS contract_code TEXT NULL;
    `);
    await this.db.query(`
      ALTER TABLE public.employee_contracts
      ADD COLUMN IF NOT EXISTS notes TEXT NULL;
    `);
    await this.db.query(`
      ALTER TABLE public.employee_contracts
      ALTER COLUMN company_id TYPE TEXT USING company_id::text;
    `);
    await this.db.query(`
      ALTER TABLE public.employee_insurance_records
      ALTER COLUMN company_id TYPE TEXT USING company_id::text;
    `);
    await this.ensureSeedData();
  }

  private async ensureSeedData() {
    const contractCount = await this.db.query<{ total: string }>(
      `SELECT COUNT(*)::text AS total FROM public.employee_contracts WHERE company_id = 'holding';`,
    );
    if (Number(contractCount.rows[0]?.total ?? 0) === 0) {
      await this.db.query(
        `
        INSERT INTO public.employee_contracts
          (id, company_id, employee_id, contract_type, start_date, end_date, status)
        VALUES
          ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'holding', '11111111-1111-4111-8111-111111111111', 'Hợp đồng 3 năm', CURRENT_DATE - INTERVAL '120 days', CURRENT_DATE + INTERVAL '45 days', 'active'),
          ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', 'holding', '22222222-2222-4222-8222-222222222222', 'Hợp đồng 1 năm', CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '20 days', 'active');
        `,
      );
    }

    const insuranceCount = await this.db.query<{ total: string }>(
      `SELECT COUNT(*)::text AS total FROM public.employee_insurance_records WHERE company_id = 'holding';`,
    );
    if (Number(insuranceCount.rows[0]?.total ?? 0) === 0) {
      await this.db.query(
        `
        INSERT INTO public.employee_insurance_records
          (id, company_id, employee_id, provider, policy_number, expiry_date, status)
        VALUES
          ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1', 'holding', '11111111-1111-4111-8111-111111111111', 'Bao Viet', 'BV-2026-0001', CURRENT_DATE + INTERVAL '25 days', 'active'),
          ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2', 'holding', '22222222-2222-4222-8222-222222222222', 'PVI', 'PVI-2026-0002', CURRENT_DATE + INTERVAL '60 days', 'active');
        `,
      );
    }
  }

  async createContract(payload: CreateContractDto, authorization?: string) {
    await this.ensureSchema();
    if (new Date(payload.start_date).getTime() > new Date(payload.end_date).getTime()) {
      throw new ApiException('HRM-CON-001', 'start_date must be <= end_date', HttpStatus.BAD_REQUEST);
    }
    const companyId = resolveHrmPersistCompanyIdText(authorization, payload.company_id);
    const employeeId = payload.employee_id ?? (await this.resolveEmployeeId(payload.employee_name, authorization, companyId));
    const res = await this.db.query<ContractRow>(
      `INSERT INTO public.employee_contracts
        (id, company_id, employee_id, contract_code, contract_type, start_date, end_date, status, notes)
       VALUES ($1, $2, $3::uuid, $4, $5, $6::date, $7::date, 'active', $8)
       RETURNING id, company_id, employee_id, contract_code, contract_type, start_date, end_date, status, notes, created_at, updated_at;`,
      [
        randomUUID(),
        companyId,
        employeeId,
        payload.contract_code?.trim() ?? null,
        payload.contract_type.trim(),
        payload.start_date,
        payload.end_date,
        payload.notes?.trim() ?? null,
      ],
    );
    return res.rows[0];
  }

  private async resolveEmployeeId(
    employeeName: string | undefined,
    authorization: string | undefined,
    requestedCompanyId: string,
  ): Promise<string> {
    const scope = resolveHrmListScope(authorization, requestedCompanyId);
    const filters: string[] = [];
    const values: unknown[] = [];
    pushCompanyIdFilter(filters, values, scope.companyIds);
    if (employeeName?.trim()) {
      values.push(employeeName.trim());
      const sql = `
        SELECT e.id
        FROM public.employees e
        WHERE ${filters.join(' AND ')}
          AND e.archived_at IS NULL
          AND LOWER(COALESCE(e.full_name, '')) = LOWER($${values.length})
        ORDER BY e.created_at DESC
        LIMIT 1
      `;
      const exact = await this.db.query<{ id: string }>(sql, values);
      if (exact.rows[0]?.id) return exact.rows[0].id;
    }
    const fallbackSql = `
      SELECT e.id
      FROM public.employees e
      WHERE ${filters.join(' AND ')}
        AND e.archived_at IS NULL
      ORDER BY e.created_at DESC
      LIMIT 1
    `;
    const fallback = await this.db.query<{ id: string }>(fallbackSql, values.slice(0, filters.length));
    if (!fallback.rows[0]?.id) {
      throw new ApiException('HRM-CON-001', 'No eligible employee found for contract', HttpStatus.BAD_REQUEST);
    }
    return fallback.rows[0].id;
  }

  async createInsuranceRecord(payload: CreateInsuranceRecordDto, authorization?: string) {
    await this.ensureSchema();
    const companyId = resolveHrmPersistCompanyIdText(authorization, payload.company_id);
    const res = await this.db.query<InsuranceRow>(
      `INSERT INTO public.employee_insurance_records
        (id, company_id, employee_id, provider, policy_number, expiry_date, status)
       VALUES ($1, $2, $3::uuid, $4, $5, $6::date, 'active')
       RETURNING id, company_id, employee_id, provider, policy_number, expiry_date, status, created_at, updated_at;`,
      [
        randomUUID(),
        companyId,
        payload.employee_id,
        payload.provider.trim(),
        payload.policy_number.trim(),
        payload.expiry_date,
      ],
    );
    return res.rows[0];
  }

  async listExpiringContracts(
    query: ListExpiringQueryDto,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    await this.ensureSchema();
    const { scope, expandedCompanyIds } = this.resolveContractsListScope(
      authorization,
      query.company_id,
      scopeContext,
    );
    const days = query.days ?? 30;
    const filters: string[] = [];
    const values: unknown[] = [];
    pushCompanyIdFilter(filters, values, expandedCompanyIds);
    this.pushResolvableEmployeeScope(filters, values, scope, 'employee_id');
    values.push(days);
    const res = await this.db.query<ContractRow>(
      `SELECT id, company_id, employee_id, contract_type, start_date, end_date, status, notes, created_at, updated_at
       FROM public.employee_contracts
       WHERE ${filters.join(' AND ')}
         AND end_date <= (CURRENT_DATE + ($${values.length}::text || ' days')::interval)::date
       ORDER BY end_date ASC;`,
      values,
    );
    return { total: res.rows.length, days, data: res.rows };
  }

  async listContracts(
    query: ListContractsQueryDto,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    await this.ensureSchema();
    const { scope, expandedCompanyIds } = this.resolveContractsListScope(
      authorization,
      query.company_id,
      scopeContext,
    );
    const page = this.resolvePage(query.page, 1);
    const pageSize = this.resolvePageSize(query.page_size, 20);
    const offset = (page - 1) * pageSize;
    const filters: string[] = [];
    const values: unknown[] = [];
    pushCompanyIdFilter(filters, values, expandedCompanyIds);
    this.pushResolvableEmployeeScope(filters, values, scope, 'employee_id');
    if (query.employee_id) {
      filters.push(`employee_id = $${values.length + 1}::uuid`);
      values.push(query.employee_id);
    }
    if (query.status) {
      filters.push(`status = $${values.length + 1}`);
      values.push(query.status);
    }
    const ecFilters = this.qualifyContractInsuranceFilters(filters, 'ec');
    const res = await this.db.query<ContractRow>(
      `
        SELECT
          ec.id,
          ec.company_id,
          ec.employee_id,
          ec.contract_code,
          ec.contract_type,
          ec.start_date,
          ec.end_date,
          ec.status,
          ec.notes,
          ec.created_at,
          ec.updated_at,
          e.full_name AS employee_name,
          e.employee_code AS employee_code,
          COALESCE(NULLIF(TRIM(e.custom_fields->>'department'), ''), e.job_title_key) AS department
        FROM public.employee_contracts ec
        LEFT JOIN public.employees e ON e.id = ec.employee_id
        WHERE ${ecFilters.join(' AND ')}
          AND e.id IS NOT NULL
          AND e.archived_at IS NULL
        ORDER BY ec.created_at DESC;
      `,
      values,
    );
    const total = res.rows.length;
    const data = res.rows.slice(offset, offset + pageSize);
    return { total, page, page_size: pageSize, data };
  }

  async getContractById(
    contractId: string,
    requestedCompanyId: string,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    await this.ensureSchema();
    const { scope, expandedCompanyIds } = this.resolveContractsListScope(
      authorization,
      requestedCompanyId,
      scopeContext,
    );
    const filters: string[] = ['ec.id = $1::uuid'];
    const values: unknown[] = [contractId];
    pushCompanyIdFilter(filters, values, expandedCompanyIds);
    this.pushResolvableEmployeeScope(filters, values, scope, 'employee_id');
    const ecFilters = this.qualifyContractInsuranceFilters(filters, 'ec');
    const res = await this.db.query<ContractRow>(
      `
        SELECT
          ec.id,
          ec.company_id,
          ec.employee_id,
          ec.contract_code,
          ec.contract_type,
          ec.start_date,
          ec.end_date,
          ec.status,
          ec.notes,
          ec.created_at,
          ec.updated_at,
          e.full_name AS employee_name,
          e.employee_code AS employee_code,
          COALESCE(NULLIF(TRIM(e.custom_fields->>'department'), ''), e.job_title_key) AS department
        FROM public.employee_contracts ec
        LEFT JOIN public.employees e ON e.id = ec.employee_id
        WHERE ${ecFilters.join(' AND ')}
          AND e.id IS NOT NULL
          AND e.archived_at IS NULL
        LIMIT 1;
      `,
      values,
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException('HRM-CON-404', 'Contract not found', HttpStatus.NOT_FOUND);
    }
    return row;
  }

  private async loadContractScopeRow(contractId: string): Promise<{ company_id: string } | null> {
    const res = await this.db.query<{ company_id: string }>(
      `SELECT company_id::text AS company_id FROM public.employee_contracts WHERE id = $1::uuid LIMIT 1;`,
      [contractId],
    );
    return res.rows[0] ?? null;
  }

  async updateContract(
    contractId: string,
    payload: UpdateContractDto,
    requestedCompanyId: string,
    authorization?: string,
  ) {
    await this.ensureSchema();
    if (
      payload.start_date &&
      payload.end_date &&
      new Date(payload.start_date).getTime() > new Date(payload.end_date).getTime()
    ) {
      throw new ApiException('HRM-CON-001', 'start_date must be <= end_date', HttpStatus.BAD_REQUEST);
    }
    const scopeCompanyId = normalizePayrollListCompanyId(authorization, requestedCompanyId);
    const scope = resolveHrmListScope(authorization, scopeCompanyId);
    const existing = await this.loadContractScopeRow(contractId);
    assertResourceInHrmScope(existing, scope, {
      notFoundCode: 'HRM-CON-404',
      mismatchCode: 'HRM-CON-409',
    });
    const notesProvided = payload.notes !== undefined;
    const filters: string[] = ['id = $7::uuid'];
    const values: unknown[] = [
      payload.contract_type?.trim() ?? null,
      payload.start_date ?? null,
      payload.end_date ?? null,
      payload.status ?? null,
      notesProvided ? (payload.notes?.trim() ?? null) : null,
      notesProvided,
      contractId,
    ];
    pushCompanyIdFilter(filters, values, expandHrmTextCompanyIds(scope, authorization, requestedCompanyId));
    const res = await this.db.query<ContractRow>(
      `
        UPDATE public.employee_contracts
        SET contract_type = COALESCE($1, contract_type),
            start_date = COALESCE($2::date, start_date),
            end_date = COALESCE($3::date, end_date),
            status = COALESCE($4, status),
            notes = CASE WHEN $6::boolean THEN $5 ELSE notes END,
            updated_at = NOW()
        WHERE ${filters.join(' AND ')}
        RETURNING id, company_id, employee_id, contract_code, contract_type, start_date, end_date, status, notes, created_at, updated_at;
      `,
      values,
    );
    if (!res.rows[0]) {
      throw new ApiException('HRM-CON-404', 'Contract not found', HttpStatus.NOT_FOUND);
    }
    return res.rows[0];
  }

  async deleteContract(contractId: string, requestedCompanyId: string, authorization?: string) {
    await this.ensureSchema();
    const scopeCompanyId = normalizePayrollListCompanyId(authorization, requestedCompanyId);
    const scope = resolveHrmListScope(authorization, scopeCompanyId);
    const existing = await this.loadContractScopeRow(contractId);
    assertResourceInHrmScope(existing, scope, {
      notFoundCode: 'HRM-CON-404',
      mismatchCode: 'HRM-CON-409',
    });
    const filters: string[] = ['id = $1::uuid'];
    const values: unknown[] = [contractId];
    pushCompanyIdFilter(filters, values, expandHrmTextCompanyIds(scope, authorization, requestedCompanyId));
    const res = await this.db.query<{ id: string }>(
      `DELETE FROM public.employee_contracts WHERE ${filters.join(' AND ')} RETURNING id;`,
      values,
    );
    if (!res.rows[0]) {
      throw new ApiException('HRM-CON-404', 'Contract not found', HttpStatus.NOT_FOUND);
    }
    return { id: contractId };
  }

  async listExpiringInsurance(query: ListExpiringQueryDto, authorization?: string) {
    await this.ensureSchema();
    const { scope, expandedCompanyIds } = this.resolveContractsListScope(authorization, query.company_id);
    const days = query.days ?? 30;
    const filters: string[] = [];
    const values: unknown[] = [];
    pushCompanyIdFilter(filters, values, expandedCompanyIds);
    this.pushResolvableEmployeeScope(filters, values, scope, 'employee_id');
    values.push(days);
    const res = await this.db.query<InsuranceRow>(
      `SELECT id, company_id, employee_id, provider, policy_number, expiry_date, status, created_at, updated_at
       FROM public.employee_insurance_records
       WHERE ${filters.join(' AND ')}
         AND expiry_date <= (CURRENT_DATE + ($${values.length}::text || ' days')::interval)::date
       ORDER BY expiry_date ASC;`,
      values,
    );
    return { total: res.rows.length, days, data: res.rows };
  }

  /** PG driver may return TIMESTAMPTZ as Date; API consumers expect ISO strings. */
  private toDateOnly(value: string | Date | null | undefined): string | null {
    if (value == null) return null;
    if (value instanceof Date) {
      if (!Number.isFinite(value.getTime())) return null;
      return value.toISOString().slice(0, 10);
    }
    const raw = String(value).trim();
    if (!raw) return null;
    const iso = raw.includes('T') ? raw.split('T')[0] : raw.slice(0, 10);
    return iso || null;
  }

  private toIsoTimestamp(value: string | Date | null | undefined): string {
    if (value == null) return '';
    if (value instanceof Date) return value.toISOString();
    return String(value);
  }

  private mapInsuranceListItem(
    row: InsuranceRow & {
      employee_name?: string | null;
      employee_code?: string | null;
      department?: string | null;
    },
  ): InsuranceListItemDto {
    const policy = row.policy_number?.trim() ?? '';
    const provider = row.provider?.trim() ?? '';
    const isHealthProvider = /health|y tế|yte|bhyt/i.test(provider);
    return {
      ...row,
      created_at: this.toIsoTimestamp(row.created_at),
      updated_at: this.toIsoTimestamp(row.updated_at),
      social_insurance_number: policy,
      health_insurance_number: isHealthProvider ? policy : null,
      unemployment_insurance_number: null,
      social_insurance_rate: null,
      health_insurance_rate: null,
      unemployment_insurance_rate: null,
      base_salary: null,
      effective_date: this.toDateOnly(row.created_at),
    };
  }

  async listInsurance(
    query: ListContractsQueryDto,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    await this.ensureSchema();
    const { scope, expandedCompanyIds } = this.resolveContractsListScope(
      authorization,
      query.company_id,
      scopeContext,
    );
    const page = this.resolvePage(query.page, 1);
    const pageSize = this.resolvePageSize(query.page_size, 20);
    const offset = (page - 1) * pageSize;
    const filters: string[] = [];
    const values: unknown[] = [];
    pushCompanyIdFilter(filters, values, expandedCompanyIds);
    this.pushResolvableEmployeeScope(filters, values, scope, 'employee_id');
    if (query.employee_id) {
      filters.push(`employee_id = $${values.length + 1}::uuid`);
      values.push(query.employee_id);
    }
    if (query.status) {
      filters.push(`status = $${values.length + 1}`);
      values.push(query.status);
    }
    const irFilters = this.qualifyContractInsuranceFilters(filters, 'ir');
    const res = await this.db.query<
      InsuranceRow & {
        employee_name?: string | null;
        employee_code?: string | null;
        department?: string | null;
      }
    >(
      `
        SELECT
          ir.id,
          ir.company_id,
          ir.employee_id,
          ir.provider,
          ir.policy_number,
          ir.expiry_date,
          ir.status,
          ir.created_at,
          ir.updated_at,
          e.full_name AS employee_name,
          e.employee_code AS employee_code,
          COALESCE(NULLIF(TRIM(e.custom_fields->>'department'), ''), e.job_title_key) AS department
        FROM public.employee_insurance_records ir
        LEFT JOIN public.employees e ON e.id = ir.employee_id
        WHERE ${irFilters.join(' AND ')}
          AND e.id IS NOT NULL
          AND e.archived_at IS NULL
        ORDER BY ir.created_at DESC;
      `,
      values,
    );
    const allData = res.rows.map((row) => this.mapInsuranceListItem(row));
    return {
      total: allData.length,
      page,
      page_size: pageSize,
      data: allData.slice(offset, offset + pageSize),
    };
  }
}
