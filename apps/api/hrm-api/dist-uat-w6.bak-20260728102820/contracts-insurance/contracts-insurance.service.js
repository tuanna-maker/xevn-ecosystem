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
exports.ContractsInsuranceService = void 0;
const common_1 = require("@nestjs/common");
const node_crypto_1 = require("node:crypto");
const api_exception_1 = require("../common/api.exception");
const hrm_list_scope_1 = require("../common/hrm-list-scope");
const hrm_db_service_1 = require("../db/hrm-db.service");
const contract_end_date_policy_1 = require("./contract-end-date-policy");
let ContractsInsuranceService = class ContractsInsuranceService {
    db;
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
    resolveContractsListScope(authorization, requestedCompanyId, scopeContext) {
        const scopeCompanyId = (0, hrm_list_scope_1.normalizePayrollListCompanyId)(authorization, requestedCompanyId);
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, scopeCompanyId, scopeContext);
        const expandedCompanyIds = (0, hrm_list_scope_1.expandHrmTextCompanyIds)(scope, authorization, requestedCompanyId);
        return { scope, expandedCompanyIds };
    }
    pushResolvableEmployeeScope(filters, values, scope, employeeIdColumn) {
        (0, hrm_list_scope_1.pushWorkforceEmployeeScopeFilter)(filters, values, scope, employeeIdColumn);
    }
    qualifyContractInsuranceFilters(filters, tableAlias) {
        const unqualifiedColumn = (column) => new RegExp(`(?<!${tableAlias}\\.)\\b${column}\\b`, 'g');
        return filters.map((clause) => {
            if (clause.includes('FROM public.employees')) {
                return clause.replace(new RegExp(`^(\\s*)(?<!${tableAlias}\\.)employee_id\\b`), `$1${tableAlias}.employee_id`);
            }
            return clause
                .replace(unqualifiedColumn('company_id'), `${tableAlias}.company_id`)
                .replace(unqualifiedColumn('employee_id'), `${tableAlias}.employee_id`)
                .replace(unqualifiedColumn('status'), `${tableAlias}.status`);
        });
    }
    async ensureSchema() {
        await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.employee_contracts (
        id UUID PRIMARY KEY,
        company_id TEXT NOT NULL,
        employee_id UUID NOT NULL,
        contract_code TEXT NULL,
        contract_type TEXT NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NULL,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT chk_employee_contract_status CHECK (status IN ('active', 'expired', 'terminated')),
        CONSTRAINT chk_contract_date_range CHECK (end_date IS NULL OR start_date <= end_date)
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
      ADD COLUMN IF NOT EXISTS compensation_package_id UUID NULL;
    `);
        await this.db.query(`
      ALTER TABLE public.employee_contracts
      ALTER COLUMN company_id TYPE TEXT USING company_id::text;
    `);
        await this.db.query(`
      ALTER TABLE public.employee_contracts
      ALTER COLUMN end_date DROP NOT NULL;
    `);
        await this.db.query(`
      ALTER TABLE public.employee_contracts
      DROP CONSTRAINT IF EXISTS chk_contract_date_range;
    `);
        await this.db.query(`
      ALTER TABLE public.employee_contracts
      ADD CONSTRAINT chk_contract_date_range
      CHECK (end_date IS NULL OR start_date <= end_date);
    `);
        await this.db.query(`
      ALTER TABLE public.employee_insurance_records
      ALTER COLUMN company_id TYPE TEXT USING company_id::text;
    `);
        await this.ensureSeedData();
    }
    async ensureSeedData() {
        const contractCount = await this.db.query(`SELECT COUNT(*)::text AS total FROM public.employee_contracts WHERE company_id = 'holding';`);
        if (Number(contractCount.rows[0]?.total ?? 0) === 0) {
            await this.db.query(`
        INSERT INTO public.employee_contracts
          (id, company_id, employee_id, contract_type, start_date, end_date, status)
        VALUES
          ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'holding', '11111111-1111-4111-8111-111111111111', 'Hợp đồng 3 năm', CURRENT_DATE - INTERVAL '120 days', CURRENT_DATE + INTERVAL '45 days', 'active'),
          ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', 'holding', '22222222-2222-4222-8222-222222222222', 'Hợp đồng 1 năm', CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '20 days', 'active');
        `);
        }
        const insuranceCount = await this.db.query(`SELECT COUNT(*)::text AS total FROM public.employee_insurance_records WHERE company_id = 'holding';`);
        if (Number(insuranceCount.rows[0]?.total ?? 0) === 0) {
            await this.db.query(`
        INSERT INTO public.employee_insurance_records
          (id, company_id, employee_id, provider, policy_number, expiry_date, status)
        VALUES
          ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1', 'holding', '11111111-1111-4111-8111-111111111111', 'Bao Viet', 'BV-2026-0001', CURRENT_DATE + INTERVAL '25 days', 'active'),
          ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2', 'holding', '22222222-2222-4222-8222-222222222222', 'PVI', 'PVI-2026-0002', CURRENT_DATE + INTERVAL '60 days', 'active');
        `);
        }
    }
    async createContract(payload, authorization) {
        await this.ensureSchema();
        (0, contract_end_date_policy_1.assertContractEndDateForCreate)({
            contractType: payload.contract_type,
            startDate: payload.start_date,
            endDate: payload.end_date,
        });
        const endDate = payload.end_date?.trim() ? payload.end_date.trim() : null;
        const companyId = (0, hrm_list_scope_1.resolveHrmPersistCompanyIdText)(authorization, payload.company_id);
        const employeeId = payload.employee_id ?? (await this.resolveEmployeeId(payload.employee_name, authorization, companyId));
        const res = await this.db.query(`INSERT INTO public.employee_contracts
        (id, company_id, employee_id, contract_code, contract_type, start_date, end_date, status, notes)
       VALUES ($1, $2, $3::uuid, $4, $5, $6::date, $7::date, 'active', $8)
       RETURNING id, company_id, employee_id, contract_code, contract_type, start_date, end_date, status, notes,
                 compensation_package_id, created_at, updated_at;`, [
            (0, node_crypto_1.randomUUID)(),
            companyId,
            employeeId,
            payload.contract_code?.trim() ?? null,
            payload.contract_type.trim(),
            payload.start_date,
            endDate,
            payload.notes?.trim() ?? null,
        ]);
        return res.rows[0];
    }
    async resolveEmployeeId(employeeName, authorization, requestedCompanyId) {
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, requestedCompanyId);
        const filters = [];
        const values = [];
        (0, hrm_list_scope_1.pushCompanyIdFilter)(filters, values, scope.companyIds);
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
            const exact = await this.db.query(sql, values);
            if (exact.rows[0]?.id)
                return exact.rows[0].id;
        }
        const fallbackSql = `
      SELECT e.id
      FROM public.employees e
      WHERE ${filters.join(' AND ')}
        AND e.archived_at IS NULL
      ORDER BY e.created_at DESC
      LIMIT 1
    `;
        const fallback = await this.db.query(fallbackSql, values.slice(0, filters.length));
        if (!fallback.rows[0]?.id) {
            throw new api_exception_1.ApiException('HRM-CON-001', 'No eligible employee found for contract', common_1.HttpStatus.BAD_REQUEST);
        }
        return fallback.rows[0].id;
    }
    async createInsuranceRecord(payload, authorization) {
        await this.ensureSchema();
        const companyId = (0, hrm_list_scope_1.resolveHrmPersistCompanyIdText)(authorization, payload.company_id);
        const res = await this.db.query(`INSERT INTO public.employee_insurance_records
        (id, company_id, employee_id, provider, policy_number, expiry_date, status)
       VALUES ($1, $2, $3::uuid, $4, $5, $6::date, 'active')
       RETURNING id, company_id, employee_id, provider, policy_number, expiry_date, status, created_at, updated_at;`, [
            (0, node_crypto_1.randomUUID)(),
            companyId,
            payload.employee_id,
            payload.provider.trim(),
            payload.policy_number.trim(),
            payload.expiry_date,
        ]);
        return res.rows[0];
    }
    async listExpiringContracts(query, authorization, scopeContext) {
        await this.ensureSchema();
        const { scope, expandedCompanyIds } = this.resolveContractsListScope(authorization, query.company_id, scopeContext);
        const days = query.days ?? 30;
        const filters = [];
        const values = [];
        (0, hrm_list_scope_1.pushCompanyIdFilter)(filters, values, expandedCompanyIds);
        this.pushResolvableEmployeeScope(filters, values, scope, 'employee_id');
        values.push(days);
        const res = await this.db.query(`SELECT id, company_id, employee_id, contract_type, start_date, end_date, status, notes, created_at, updated_at
       FROM public.employee_contracts
       WHERE ${filters.join(' AND ')}
         AND end_date <= (CURRENT_DATE + ($${values.length}::text || ' days')::interval)::date
       ORDER BY end_date ASC;`, values);
        return { total: res.rows.length, days, data: res.rows };
    }
    async listContracts(query, authorization, scopeContext) {
        await this.ensureSchema();
        const { scope, expandedCompanyIds } = this.resolveContractsListScope(authorization, query.company_id, scopeContext);
        const page = this.resolvePage(query.page, 1);
        const pageSize = this.resolvePageSize(query.page_size, 20);
        const offset = (page - 1) * pageSize;
        const filters = [];
        const values = [];
        (0, hrm_list_scope_1.pushCompanyIdFilter)(filters, values, expandedCompanyIds);
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
        const res = await this.db.query(`
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
          ec.compensation_package_id,
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
      `, values);
        const total = res.rows.length;
        const data = res.rows.slice(offset, offset + pageSize);
        return { total, page, page_size: pageSize, data };
    }
    async getContractById(contractId, requestedCompanyId, authorization, scopeContext) {
        await this.ensureSchema();
        const { scope, expandedCompanyIds } = this.resolveContractsListScope(authorization, requestedCompanyId, scopeContext);
        const filters = ['ec.id = $1::uuid'];
        const values = [contractId];
        (0, hrm_list_scope_1.pushCompanyIdFilter)(filters, values, expandedCompanyIds);
        this.pushResolvableEmployeeScope(filters, values, scope, 'employee_id');
        const ecFilters = this.qualifyContractInsuranceFilters(filters, 'ec');
        const res = await this.db.query(`
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
          ec.compensation_package_id,
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
      `, values);
        const row = res.rows[0];
        if (!row) {
            throw new api_exception_1.ApiException('HRM-CON-404', 'Contract not found', common_1.HttpStatus.NOT_FOUND);
        }
        return row;
    }
    async loadContractScopeRow(contractId) {
        const res = await this.db.query(`SELECT company_id::text AS company_id FROM public.employee_contracts WHERE id = $1::uuid LIMIT 1;`, [contractId]);
        return res.rows[0] ?? null;
    }
    async updateContract(contractId, payload, requestedCompanyId, authorization) {
        await this.ensureSchema();
        if (payload.start_date &&
            payload.end_date &&
            new Date(payload.start_date).getTime() > new Date(payload.end_date).getTime()) {
            throw new api_exception_1.ApiException('HRM-CON-001', 'start_date must be <= end_date', common_1.HttpStatus.BAD_REQUEST);
        }
        const scopeCompanyId = (0, hrm_list_scope_1.normalizePayrollListCompanyId)(authorization, requestedCompanyId);
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, scopeCompanyId);
        const existing = await this.loadContractScopeRow(contractId);
        (0, hrm_list_scope_1.assertResourceInHrmScope)(existing, scope, {
            notFoundCode: 'HRM-CON-404',
            mismatchCode: 'HRM-CON-409',
        });
        const notesProvided = payload.notes !== undefined;
        const packageLinkProvided = payload.compensation_package_id !== undefined;
        const filters = ['id = $9::uuid'];
        const values = [
            payload.contract_type?.trim() ?? null,
            payload.start_date ?? null,
            payload.end_date ?? null,
            payload.status ?? null,
            notesProvided ? (payload.notes?.trim() ?? null) : null,
            notesProvided,
            packageLinkProvided ? payload.compensation_package_id : null,
            packageLinkProvided,
            contractId,
        ];
        (0, hrm_list_scope_1.pushCompanyIdFilter)(filters, values, (0, hrm_list_scope_1.expandHrmTextCompanyIds)(scope, authorization, requestedCompanyId));
        const res = await this.db.query(`
        UPDATE public.employee_contracts
        SET contract_type = COALESCE($1, contract_type),
            start_date = COALESCE($2::date, start_date),
            end_date = COALESCE($3::date, end_date),
            status = COALESCE($4, status),
            notes = CASE WHEN $6::boolean THEN $5 ELSE notes END,
            compensation_package_id = CASE WHEN $8::boolean THEN $7::uuid ELSE compensation_package_id END,
            updated_at = NOW()
        WHERE ${filters.join(' AND ')}
        RETURNING id, company_id, employee_id, contract_code, contract_type, start_date, end_date, status, notes,
                  compensation_package_id, created_at, updated_at;
      `, values);
        if (!res.rows[0]) {
            throw new api_exception_1.ApiException('HRM-CON-404', 'Contract not found', common_1.HttpStatus.NOT_FOUND);
        }
        return res.rows[0];
    }
    async deleteContract(contractId, requestedCompanyId, authorization) {
        await this.ensureSchema();
        const scopeCompanyId = (0, hrm_list_scope_1.normalizePayrollListCompanyId)(authorization, requestedCompanyId);
        const scope = (0, hrm_list_scope_1.resolveHrmListScope)(authorization, scopeCompanyId);
        const existing = await this.loadContractScopeRow(contractId);
        (0, hrm_list_scope_1.assertResourceInHrmScope)(existing, scope, {
            notFoundCode: 'HRM-CON-404',
            mismatchCode: 'HRM-CON-409',
        });
        const filters = ['id = $1::uuid'];
        const values = [contractId];
        (0, hrm_list_scope_1.pushCompanyIdFilter)(filters, values, (0, hrm_list_scope_1.expandHrmTextCompanyIds)(scope, authorization, requestedCompanyId));
        const res = await this.db.query(`DELETE FROM public.employee_contracts WHERE ${filters.join(' AND ')} RETURNING id;`, values);
        if (!res.rows[0]) {
            throw new api_exception_1.ApiException('HRM-CON-404', 'Contract not found', common_1.HttpStatus.NOT_FOUND);
        }
        return { id: contractId };
    }
    async listExpiringInsurance(query, authorization) {
        await this.ensureSchema();
        const { scope, expandedCompanyIds } = this.resolveContractsListScope(authorization, query.company_id);
        const days = query.days ?? 30;
        const filters = [];
        const values = [];
        (0, hrm_list_scope_1.pushCompanyIdFilter)(filters, values, expandedCompanyIds);
        this.pushResolvableEmployeeScope(filters, values, scope, 'employee_id');
        values.push(days);
        const res = await this.db.query(`SELECT id, company_id, employee_id, provider, policy_number, expiry_date, status, created_at, updated_at
       FROM public.employee_insurance_records
       WHERE ${filters.join(' AND ')}
         AND expiry_date <= (CURRENT_DATE + ($${values.length}::text || ' days')::interval)::date
       ORDER BY expiry_date ASC;`, values);
        return { total: res.rows.length, days, data: res.rows };
    }
    toDateOnly(value) {
        if (value == null)
            return null;
        if (value instanceof Date) {
            if (!Number.isFinite(value.getTime()))
                return null;
            return value.toISOString().slice(0, 10);
        }
        const raw = String(value).trim();
        if (!raw)
            return null;
        const iso = raw.includes('T') ? raw.split('T')[0] : raw.slice(0, 10);
        return iso || null;
    }
    toIsoTimestamp(value) {
        if (value == null)
            return '';
        if (value instanceof Date)
            return value.toISOString();
        return String(value);
    }
    mapInsuranceListItem(row) {
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
    async listInsurance(query, authorization, scopeContext) {
        await this.ensureSchema();
        const { scope, expandedCompanyIds } = this.resolveContractsListScope(authorization, query.company_id, scopeContext);
        const page = this.resolvePage(query.page, 1);
        const pageSize = this.resolvePageSize(query.page_size, 20);
        const offset = (page - 1) * pageSize;
        const filters = [];
        const values = [];
        (0, hrm_list_scope_1.pushCompanyIdFilter)(filters, values, expandedCompanyIds);
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
        const res = await this.db.query(`
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
      `, values);
        const allData = res.rows.map((row) => this.mapInsuranceListItem(row));
        return {
            total: allData.length,
            page,
            page_size: pageSize,
            data: allData.slice(offset, offset + pageSize),
        };
    }
};
exports.ContractsInsuranceService = ContractsInsuranceService;
exports.ContractsInsuranceService = ContractsInsuranceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [hrm_db_service_1.HrmDbService])
], ContractsInsuranceService);
//# sourceMappingURL=contracts-insurance.service.js.map