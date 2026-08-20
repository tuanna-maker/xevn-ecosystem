"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeCompensationService = void 0;
const common_1 = require("@nestjs/common");
const node_crypto_1 = require("node:crypto");
const api_exception_1 = require("../common/api.exception");
const hrm_list_scope_1 = require("../common/hrm-list-scope");
const hrm_db_service_1 = require("../db/hrm-db.service");
let EmployeeCompensationService = class EmployeeCompensationService {
    db;
    compensationSchemaReady = null;
    constructor(db) {
        this.db = db;
    }
    resolvePage(value, fallback) {
        const parsed = Number(value ?? fallback);
        if (!Number.isFinite(parsed) || parsed < 1)
            return fallback;
        return Math.trunc(parsed);
    }
    resolvePageSize(value, fallback) {
        const parsed = Number(value ?? fallback);
        if (!Number.isFinite(parsed) || parsed < 1)
            return fallback;
        return Math.min(100, Math.trunc(parsed));
    }
    resolveListScope(authorization, requestedCompanyId, scopeContext) {
        const scopeCompanyId = (0, hrm_list_scope_1.normalizePayrollListCompanyId)(authorization, requestedCompanyId);
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, scopeCompanyId, scopeContext);
        const expandedCompanyIds = (0, hrm_list_scope_1.expandHrmTextCompanyIds)(scope, authorization, requestedCompanyId);
        return { scope, expandedCompanyIds };
    }
    isIgnorableSchemaRace(error) {
        const pg = error;
        const message = String(pg.message ?? (error instanceof Error ? error.message : error));
        if (pg.code === '42P07' || pg.code === '42710')
            return true;
        if (pg.code === '23505' && /pg_type_typname_nsp_index|already exists/i.test(message)) {
            return true;
        }
        return /duplicate key.*pg_type_typname_nsp_index/i.test(message);
    }
    async runCompensationDdl(sql) {
        try {
            await this.db.query(sql);
        }
        catch (error) {
            if (this.isIgnorableSchemaRace(error))
                return;
            throw error;
        }
    }
    async ensureCompensationSchema() {
        if (!this.compensationSchemaReady) {
            this.compensationSchemaReady = this.applyCompensationSchema().catch((error) => {
                this.compensationSchemaReady = null;
                throw error;
            });
        }
        await this.compensationSchemaReady;
    }
    async applyCompensationSchema() {
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
    validateLines(lines) {
        const types = new Set(lines.map((l) => l.line_type));
        if (!types.has('base')) {
            throw new api_exception_1.ApiException('HRM-COMP-001', 'Compensation package requires at least one base line', common_1.HttpStatus.BAD_REQUEST);
        }
        for (const line of lines) {
            if (line.line_type === 'allowance') {
                const code = line.allowance_code?.trim();
                if (!code) {
                    throw new api_exception_1.ApiException('HRM-COMP-003', 'allowance_code is required for allowance lines (XBOS DM §33)', common_1.HttpStatus.BAD_REQUEST);
                }
            }
            else if (line.allowance_code != null && String(line.allowance_code).trim() !== '') {
                throw new api_exception_1.ApiException('HRM-COMP-003', 'allowance_code is only valid for allowance lines', common_1.HttpStatus.BAD_REQUEST);
            }
        }
    }
    async assertEmployeeInScope(employeeId, companyId, authorization) {
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, companyId);
        const filters = ['e.id = $1::uuid', 'e.archived_at IS NULL'];
        const values = [employeeId];
        (0, hrm_list_scope_1.pushCompanyIdFilter)(filters, values, (0, hrm_list_scope_1.expandHrmTextCompanyIds)(scope, authorization, companyId));
        const res = await this.db.query(`
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
      `, values);
        const row = res.rows[0];
        if (!row) {
            throw new api_exception_1.ApiException('HRM-COMP-404', 'Employee not found in scope', common_1.HttpStatus.NOT_FOUND);
        }
        return row;
    }
    async isEmployeeProbation(employeeId, companyId, authorization, contractId) {
        const employee = await this.assertEmployeeInScope(employeeId, companyId, authorization);
        const statusHints = [employee.status, employee.employment_status]
            .filter(Boolean)
            .map((s) => String(s).toLowerCase());
        if (statusHints.some((s) => s.includes('probation') || s.includes('thử việc') || s.includes('thu viec'))) {
            return true;
        }
        if (contractId) {
            const contract = await this.db.query(`SELECT contract_type FROM public.employee_contracts WHERE id = $1::uuid LIMIT 1;`, [contractId]);
            const type = (contract.rows[0]?.contract_type ?? '').toLowerCase();
            if (type.includes('probation') || type.includes('thử việc') || type.includes('thu viec')) {
                return true;
            }
        }
        return false;
    }
    async assertProbationLinesAllowed(lines, employeeId, companyId, authorization, contractId) {
        const hasProbation = lines.some((l) => l.line_type === 'probation');
        if (!hasProbation)
            return;
        const ok = await this.isEmployeeProbation(employeeId, companyId, authorization, contractId);
        if (!ok) {
            throw new api_exception_1.ApiException('HRM-COMP-002', 'probation line only allowed when employee/contract is in probation', common_1.HttpStatus.BAD_REQUEST);
        }
    }
    mapLine(row) {
        return {
            ...row,
            amount: Number(row.amount),
            created_at: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
        };
    }
    mapPackage(row) {
        return {
            ...row,
            created_at: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
            updated_at: row.updated_at instanceof Date ? row.updated_at.toISOString() : String(row.updated_at),
        };
    }
    async insertLines(packageId, lines, defaultCurrency) {
        const inserted = [];
        let sort = 0;
        for (const line of lines) {
            const id = (0, node_crypto_1.randomUUID)();
            const sortOrder = line.sort_order ?? sort;
            sort += 1;
            const res = await this.db.query(`
          INSERT INTO public.employee_compensation_lines
            (id, package_id, line_type, amount, currency, allowance_code, taxable, note, sort_order)
          VALUES ($1::uuid, $2::uuid, $3, $4, $5, $6, $7, $8, $9)
          RETURNING id, package_id, line_type, amount, currency, allowance_code, taxable, note, sort_order, created_at;
        `, [
                id,
                packageId,
                line.line_type,
                line.amount,
                line.currency?.trim() || defaultCurrency,
                line.line_type === 'allowance' ? line.allowance_code.trim() : null,
                line.taxable ?? true,
                line.note?.trim() ?? null,
                sortOrder,
            ]);
            inserted.push(this.mapLine(res.rows[0]));
        }
        return inserted;
    }
    async appendHistory(input) {
        await this.db.query(`
        INSERT INTO public.employee_compensation_history
          (id, company_id, employee_id, package_id, previous_package_id, version, change_reason, snapshot)
        VALUES ($1::uuid, $2, $3::uuid, $4::uuid, $5::uuid, $6, $7, $8::jsonb);
      `, [
            (0, node_crypto_1.randomUUID)(),
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
        ]);
    }
    async loadLines(packageId) {
        const res = await this.db.query(`
        SELECT id, package_id, line_type, amount, currency, allowance_code, taxable, note, sort_order, created_at
        FROM public.employee_compensation_lines
        WHERE package_id = $1::uuid
        ORDER BY sort_order ASC, created_at ASC;
      `, [packageId]);
        return res.rows.map((r) => this.mapLine(r));
    }
    async loadPackageRow(packageId, expandedCompanyIds, scope) {
        const filters = ['p.id = $1::uuid'];
        const values = [packageId];
        (0, hrm_list_scope_1.pushCompanyIdFilter)(filters, values, expandedCompanyIds);
        (0, hrm_list_scope_1.pushWorkforceEmployeeScopeFilter)(filters, values, scope, 'employee_id');
        const qualified = filters.map((clause) => {
            if (clause.includes('FROM public.employees')) {
                return clause.replace(/^(\s*)employee_id\b/, '$1p.employee_id');
            }
            return clause
                .replace(/(?<!p\.)\bcompany_id\b/g, 'p.company_id')
                .replace(/(?<!p\.)\bemployee_id\b/g, 'p.employee_id');
        });
        const res = await this.db.query(`
        SELECT
          p.id, p.company_id, p.employee_id, p.contract_id, p.version, p.supersedes_package_id,
          p.effective_from::text AS effective_from,
          p.effective_to::text AS effective_to,
          p.currency, p.change_reason, p.created_at, p.updated_at
        FROM public.employee_compensation_packages p
        WHERE ${qualified.join(' AND ')}
        LIMIT 1;
      `, values);
        return res.rows[0] ? this.mapPackage(res.rows[0]) : null;
    }
    async createPackage(payload, authorization) {
        await this.ensureCompensationSchema();
        this.validateLines(payload.lines);
        const companyId = (0, hrm_list_scope_1.resolveHrmPersistCompanyIdText)(authorization, payload.company_id);
        await this.assertEmployeeInScope(payload.employee_id, companyId, authorization);
        await this.assertProbationLinesAllowed(payload.lines, payload.employee_id, companyId, authorization, payload.contract_id);
        if (payload.effective_to &&
            new Date(payload.effective_from).getTime() > new Date(payload.effective_to).getTime()) {
            throw new api_exception_1.ApiException('HRM-COMP-001', 'effective_from must be <= effective_to', common_1.HttpStatus.BAD_REQUEST);
        }
        if (payload.contract_id) {
            const contract = await this.db.query(`SELECT id, company_id::text AS company_id, employee_id::text AS employee_id
         FROM public.employee_contracts WHERE id = $1::uuid LIMIT 1;`, [payload.contract_id]);
            const row = contract.rows[0];
            if (!row) {
                throw new api_exception_1.ApiException('HRM-CON-404', 'Contract not found', common_1.HttpStatus.NOT_FOUND);
            }
            const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, companyId);
            (0, hrm_list_scope_1.assertResourceInHrmScope)(row, scope, {
                notFoundCode: 'HRM-CON-404',
                mismatchCode: 'HRM-CON-409',
            });
            if (row.employee_id !== payload.employee_id) {
                throw new api_exception_1.ApiException('HRM-COMP-001', 'contract_id employee mismatch', common_1.HttpStatus.BAD_REQUEST);
            }
        }
        const packageId = (0, node_crypto_1.randomUUID)();
        const currency = payload.currency?.trim() || 'VND';
        const changeReason = payload.change_reason?.trim() ?? 'initial';
        const pkgRes = await this.db.query(`
        INSERT INTO public.employee_compensation_packages
          (id, company_id, employee_id, contract_id, version, supersedes_package_id,
           effective_from, effective_to, currency, change_reason)
        VALUES ($1::uuid, $2, $3::uuid, $4::uuid, 1, NULL, $5::date, $6::date, $7, $8)
        RETURNING
          id, company_id, employee_id, contract_id, version, supersedes_package_id,
          effective_from::text AS effective_from, effective_to::text AS effective_to,
          currency, change_reason, created_at, updated_at;
      `, [
            packageId,
            companyId,
            payload.employee_id,
            payload.contract_id ?? null,
            payload.effective_from,
            payload.effective_to ?? null,
            currency,
            changeReason,
        ]);
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
            await this.db.query(`
          UPDATE public.employee_contracts
          SET compensation_package_id = $1::uuid, updated_at = NOW()
          WHERE id = $2::uuid;
        `, [packageId, payload.contract_id]);
        }
        return { ...this.mapPackage(pkgRes.rows[0]), lines };
    }
    async revisePackage(packageId, payload, requestedCompanyId, authorization, scopeContext) {
        await this.ensureCompensationSchema();
        this.validateLines(payload.lines);
        const { scope, expandedCompanyIds } = this.resolveListScope(authorization, requestedCompanyId, scopeContext);
        const existing = await this.loadPackageRow(packageId, expandedCompanyIds, scope);
        if (!existing) {
            throw new api_exception_1.ApiException('HRM-COMP-404', 'Compensation package not found', common_1.HttpStatus.NOT_FOUND);
        }
        await this.assertProbationLinesAllowed(payload.lines, existing.employee_id, existing.company_id, authorization, existing.contract_id);
        if (payload.effective_to &&
            new Date(payload.effective_from).getTime() > new Date(payload.effective_to).getTime()) {
            throw new api_exception_1.ApiException('HRM-COMP-001', 'effective_from must be <= effective_to', common_1.HttpStatus.BAD_REQUEST);
        }
        const priorEnd = new Date(payload.effective_from);
        priorEnd.setUTCDate(priorEnd.getUTCDate() - 1);
        const priorEndIso = priorEnd.toISOString().slice(0, 10);
        await this.db.query(`
        UPDATE public.employee_compensation_packages
        SET effective_to = LEAST(
              COALESCE(effective_to, $1::date),
              $1::date
            ),
            updated_at = NOW()
        WHERE id = $2::uuid;
      `, [priorEndIso, packageId]);
        const newId = (0, node_crypto_1.randomUUID)();
        const currency = payload.currency?.trim() || existing.currency || 'VND';
        const changeReason = payload.change_reason?.trim() ?? 'revise';
        const nextVersion = Number(existing.version) + 1;
        const pkgRes = await this.db.query(`
        INSERT INTO public.employee_compensation_packages
          (id, company_id, employee_id, contract_id, version, supersedes_package_id,
           effective_from, effective_to, currency, change_reason)
        VALUES ($1::uuid, $2, $3::uuid, $4::uuid, $5, $6::uuid, $7::date, $8::date, $9, $10)
        RETURNING
          id, company_id, employee_id, contract_id, version, supersedes_package_id,
          effective_from::text AS effective_from, effective_to::text AS effective_to,
          currency, change_reason, created_at, updated_at;
      `, [
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
        ]);
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
            await this.db.query(`
          UPDATE public.employee_contracts
          SET compensation_package_id = $1::uuid, updated_at = NOW()
          WHERE id = $2::uuid;
        `, [newId, existing.contract_id]);
        }
        return { ...this.mapPackage(pkgRes.rows[0]), lines };
    }
    async getPackageById(packageId, requestedCompanyId, authorization, scopeContext) {
        await this.ensureCompensationSchema();
        const { scope, expandedCompanyIds } = this.resolveListScope(authorization, requestedCompanyId, scopeContext);
        const row = await this.loadPackageRow(packageId, expandedCompanyIds, scope);
        if (!row) {
            throw new api_exception_1.ApiException('HRM-COMP-404', 'Compensation package not found', common_1.HttpStatus.NOT_FOUND);
        }
        const lines = await this.loadLines(packageId);
        return { ...row, lines };
    }
    async listPackages(query, authorization, scopeContext) {
        await this.ensureCompensationSchema();
        const { scope, expandedCompanyIds } = this.resolveListScope(authorization, query.company_id, scopeContext);
        const page = this.resolvePage(query.page, 1);
        const pageSize = this.resolvePageSize(query.page_size, 20);
        const filters = [];
        const values = [];
        (0, hrm_list_scope_1.pushCompanyIdFilter)(filters, values, expandedCompanyIds);
        (0, hrm_list_scope_1.pushWorkforceEmployeeScopeFilter)(filters, values, scope, 'employee_id');
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
        const res = await this.db.query(`
        SELECT
          p.id, p.company_id, p.employee_id, p.contract_id, p.version, p.supersedes_package_id,
          p.effective_from::text AS effective_from,
          p.effective_to::text AS effective_to,
          p.currency, p.change_reason, p.created_at, p.updated_at
        FROM public.employee_compensation_packages p
        WHERE ${qualified.join(' AND ')}
        ORDER BY p.effective_from DESC, p.version DESC;
      `, values);
        const slice = res.rows.slice((page - 1) * pageSize, page * pageSize).map((r) => this.mapPackage(r));
        const data = [];
        for (const pkg of slice) {
            data.push({ ...pkg, lines: await this.loadLines(pkg.id) });
        }
        return { total: res.rows.length, page, page_size: pageSize, data };
    }
    async getActivePackage(query, authorization, scopeContext) {
        await this.ensureCompensationSchema();
        if (!query.employee_id) {
            throw new api_exception_1.ApiException('HRM-COMP-001', 'employee_id is required for active package lookup', common_1.HttpStatus.BAD_REQUEST);
        }
        const { scope, expandedCompanyIds } = this.resolveListScope(authorization, query.company_id, scopeContext);
        const asOf = query.as_of ?? new Date().toISOString().slice(0, 10);
        const filters = [];
        const values = [];
        (0, hrm_list_scope_1.pushCompanyIdFilter)(filters, values, expandedCompanyIds);
        (0, hrm_list_scope_1.pushWorkforceEmployeeScopeFilter)(filters, values, scope, 'employee_id');
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
            if (clause.startsWith('p.'))
                return clause;
            return clause
                .replace(/(?<!p\.)\bcompany_id\b/g, 'p.company_id')
                .replace(/(?<!p\.)\bemployee_id\b/g, 'p.employee_id');
        });
        const res = await this.db.query(`
        SELECT
          p.id, p.company_id, p.employee_id, p.contract_id, p.version, p.supersedes_package_id,
          p.effective_from::text AS effective_from,
          p.effective_to::text AS effective_to,
          p.currency, p.change_reason, p.created_at, p.updated_at
        FROM public.employee_compensation_packages p
        WHERE ${qualified.join(' AND ')}
        ORDER BY p.version DESC, p.effective_from DESC
        LIMIT 1;
      `, values);
        const row = res.rows[0];
        if (!row)
            return null;
        return { ...this.mapPackage(row), lines: await this.loadLines(row.id) };
    }
    async listHistory(query, authorization, scopeContext) {
        await this.ensureCompensationSchema();
        const { scope, expandedCompanyIds } = this.resolveListScope(authorization, query.company_id, scopeContext);
        const page = this.resolvePage(query.page, 1);
        const pageSize = this.resolvePageSize(query.page_size, 20);
        const filters = [];
        const values = [];
        (0, hrm_list_scope_1.pushCompanyIdFilter)(filters, values, expandedCompanyIds);
        (0, hrm_list_scope_1.pushWorkforceEmployeeScopeFilter)(filters, values, scope, 'employee_id');
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
        const res = await this.db.query(`
        SELECT
          h.id, h.company_id, h.employee_id, h.package_id, h.previous_package_id,
          h.version, h.change_reason, h.snapshot, h.created_at
        FROM public.employee_compensation_history h
        WHERE ${qualified.join(' AND ')}
        ORDER BY h.created_at DESC, h.version DESC;
      `, values);
        const data = res.rows.slice((page - 1) * pageSize, page * pageSize).map((row) => ({
            ...row,
            created_at: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
            snapshot: typeof row.snapshot === 'string'
                ? JSON.parse(row.snapshot)
                : row.snapshot,
        }));
        return { total: res.rows.length, page, page_size: pageSize, data };
    }
};
exports.EmployeeCompensationService = EmployeeCompensationService;
exports.EmployeeCompensationService = EmployeeCompensationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [hrm_db_service_1.HrmDbService])
], EmployeeCompensationService);
//# sourceMappingURL=employee-compensation.service.js.map