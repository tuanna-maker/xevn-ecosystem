/**
 * @CODE-MEMORY
 * Screen:     HRM → Hợp đồng & Bảo hiểm (service)
 * UC:         UC-HRM-25 · HRM-CI-01 · HRM-CI-02
 * BR:         BR-CD-F5-01 — không yêu cầu salary trên body HĐ
 * SRS:        docs/client-delivery/hrm/SRS_HRM_KHACH.md §3.2 · §3.3
 * SRS bước:   CI-01 #5 Thời hạn sai · #7 Lưu · #8 F5 · CI-02 #6 Lưu · #8 F5
 * TechSpec:   docs/hrm/TECHSPEC.md §14.2 · §14.3 (ref_srs: FR-HRM-CI-01 · FR-HRM-CI-02)
 * Purpose:    Persist HĐ/BH theo scope; list/get parity U19; salary → compensation package.
 * WorkItem:   BE-HRM-CODE-MEMORY-SRS-STEP-01
 * Coded:      2026-07-21
 * Callers:    contracts-insurance.controller.ts
 * Callees:    resolveHrmListScope / persist → employee_contracts · employee_insurance_records
 * FE-Actions: Lưu HĐ/BH → INSERT; List/F5 → SELECT scoped
 * BE-Chain:   ensureSchema → INSERT/SELECT/UPDATE/DELETE
 * Impact:     Sai ngày kỳ → phá Diễn biến #5; scope lệch → 404 get-by-id
 * must_keep:  BR-CD-F5-01; list/get cùng resolveHrmListScope
 * SOLID:      Service owns SQL; compensation tách EmployeeCompensationService
 * LastVerified: contracts-insurance.service.spec.ts (G-CI-01)
 *
 * @CODE-MEMORY-CHANGE 2026-07-21
 * WorkItem: BE-HRM-CODE-MEMORY-SRS-STEP-01
 * change_mode: ADD
 * What: CODE-MEMORY + map Diễn biến FR-HRM-CI-01/02 (không đổi nghiệp vụ)
 * Why: Sponsor lock W1 spine
 * must_keep: AC HĐ/BH hiện tại
 *
 * @CODE-MEMORY-CHANGE 2026-07-22
 * WorkItem: BE-HRM-G-CI-01
 * change_mode: ADD
 * What: end_date optional theo loại HĐ (open-ended); DB NULL + HRM-CON-002
 * Why: TechSpec §16.9 G-CI-01 · SRS §3.2 «Ngày kết thúc | Theo loại»
 * must_keep: BR-CD-F5-01; G-AT10/G-RC/JWT/G-DEC CLOSED — không reopen
 *
 * @CODE-MEMORY-CHANGE 2026-07-28 D-BE-ERP-E1A-POS-KEY-01
 * change_mode: ADD
 * What: employee_contracts position_key / signer_position_key (+ snapshots); assert job_titles
 * Why: E1-A MD-BIND FR-CI-01 · DB_DESIGN §7 · API_DESIGN CI-C/U · AC-E1A-CI-POS-01
 * must_keep: G-CI-01 end_date; BR-CD-F5-01; Plane B slug; no salary SoT; U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-07-28 D-BE-ERP-E2-01
 * change_mode: ADD
 * What: assertCodeInEffectiveCatalog(contract_types) on create/update → HRM-CON-TYPE-KEY
 * Why: FR-HRM-CI-TYPE-E2-01 · AC-E2-CI-BE-01 · closes R-E1A-A8-CTYPE · API_DESIGN_HRM_ERP_E2 §6–7
 * must_keep: E1-A position_key / signer asserts; G-CI-01; BR-CD-F5-01; U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-07-28 D-BE-ERP-E3-01
 * change_mode: ADD
 * What: hrm_insurance_policies CRUD; insurer/type KEY asserts; insurance PATCH/GET-by-id;
 *   insurer_key/policy_id on employee_insurance_records; assertStatusTransition policy/record
 * Why: FR-HRM-INS-DEPTH-E3-01 · AC-INS-01..05 · API_DESIGN_HRM_ERP_E3 §§6–12 · SA path freeze
 * must_keep: E1/E2 CI paths; OpenAPI /contracts-insurance/insurance-policies only; U65; HOLD_DEPLOY
 *
 * @CODE-MEMORY-CHANGE 2026-07-30
 * WorkItem: D-HDSD-MUTATE-BE-01
 * change_mode: FIX
 * What: ensureSchema — sửa HĐ start>end trước khi ADD chk_contract_date_range; không DROP mỗi request
 * Why: HDSD TC-HDSD-06-03-01 insurance list transient 500 constraint noise
 * must_keep: G-CI-01 validation create/update; BR-CD-F5-01; U65 no seed evidence
 *
 * @CODE-MEMORY-CHANGE 2026-08-01
 * WorkItem: D-HDSD-MUTATE-BE-01
 * change_mode: FIX
 * What: resolveContractPositionKey — explicit → employee.job_title_key → first job_titles catalog
 * Why: UF-HRM-05 Contracts.tsx POST thiếu position_key → 400 (TC-HDSD-06-02-01)
 * must_keep: E1-A assert khi có key; invent free-text vẫn HRM-CON-POS-KEY
 *
 * @CODE-MEMORY-CHANGE 2026-08-01
 * WorkItem: D-HDSD-MUTATE-BE-02
 * change_mode: FIX
 * What: resolveContractPositionKey — explicit key chỉ dùng khi ∈ job_titles; pass-through employee_code → fallback chain
 * Why: TC-HDSD-06-02-01 POST 400 HRM-CON-POS-KEY khi FE gửi position_key=QAHDSDTLAAV (FE-10 fallback)
 * must_keep: E1-A assertConPositionKey; invent free-text vẫn HRM-CON-POS-KEY; catalog-valid explicit giữ nguyên
 */
import { HttpStatus, Injectable, Optional } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import { assertStatusTransition } from '../common/assert-status-transition';
import {
  assertResourceInHrmScope,
  expandHrmTextCompanyIds,
  HrmListScope,
  HrmListScopeContext,
  MASTER_TENANT_ID,
  normalizePayrollListCompanyId,
  pushCompanyIdFilter,
  pushWorkforceEmployeeScopeFilter,
  resolveHrmListScope,
  resolveHrmPersistCompanyIdText,
} from '../common/hrm-list-scope';
import { masterTenantIdFromEnv } from '../common/tenant-scope-env';
import { HrmDbService } from '../db/hrm-db.service';
import { SettingsCatalogsService } from '../settings-catalogs/settings-catalogs.service';
import { assertContractEndDateForCreate } from './contract-end-date-policy';
import { CreateContractDto } from './dto/create-contract.dto';
import { CreateInsurancePolicyDto } from './dto/create-insurance-policy.dto';
import { CreateInsuranceRecordDto } from './dto/create-insurance-record.dto';
import { ListExpiringQueryDto } from './dto/list-expiring.query.dto';
import { ListInsurancePoliciesQueryDto } from './dto/list-insurance-policies.query.dto';
import { ListContractsQueryDto } from './dto/list-contracts.query.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { UpdateInsurancePolicyDto } from './dto/update-insurance-policy.dto';
import { UpdateInsuranceRecordDto } from './dto/update-insurance-record.dto';

export const HRM_CON_POS_KEY = 'HRM-CON-POS-KEY';
export const HRM_CON_SIGNER_POS_KEY = 'HRM-CON-SIGNER-POS-KEY';
/** E2 — contract_type ∈ effective contract_types (closes R-E1A-A8-CTYPE). */
export const HRM_CON_TYPE_KEY = 'HRM-CON-TYPE-KEY';
/** E3 — insurer / insurance_type catalog soft-ref */
export const HRM_INS_INSURER_KEY = 'HRM-INS-INSURER-KEY';
export const HRM_INS_TYPE_KEY = 'HRM-INS-TYPE-KEY';
export const HRM_INS_POL_001 = 'HRM-INS-POL-001';
export const HRM_INS_POL_002 = 'HRM-INS-POL-002';
export const HRM_INS_POL_404 = 'HRM-INS-POL-404';
export const HRM_INS_POL_STATUS = 'HRM-INS-POL-STATUS';
export const HRM_INS_POL_DEL_BLOCK = 'HRM-INS-POL-DEL-BLOCK';
export const HRM_INS_EMP_404 = 'HRM-INS-EMP-404';
export const HRM_INS_P_DUP = 'HRM-INS-P-DUP';
export const HRM_INS_DUP = 'HRM-INS-DUP';

type ContractRow = {
  id: string;
  company_id: string;
  employee_id: string;
  contract_code?: string | null;
  contract_type: string;
  start_date: string;
  end_date: string | null;
  status: string;
  notes?: string | null;
  position?: string | null;
  position_key?: string | null;
  department?: string | null;
  department_key?: string | null;
  signer_name?: string | null;
  signer_position?: string | null;
  signer_position_key?: string | null;
  /** F5 — optional link to compensation package (salary/allowances live on package). */
  compensation_package_id?: string | null;
  created_at: string;
  updated_at: string;
  employee_name?: string | null;
  employee_code?: string | null;
};

type InsuranceRow = {
  id: string;
  company_id: string;
  employee_id: string;
  provider: string;
  policy_number: string;
  expiry_date: string;
  status: string;
  insurer_key?: string | null;
  policy_id?: string | null;
  created_at: string | Date;
  updated_at: string | Date;
};

type InsurancePolicyRow = {
  id: string;
  company_id: string;
  policy_code: string;
  policy_name: string;
  insurer_key: string;
  insurer_label: string | null;
  insurance_type: string;
  effective_date: string;
  expiry_date: string | null;
  status: 'draft' | 'active' | 'expired' | 'cancelled';
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

const POLICY_SELECT = `id, company_id, policy_code, policy_name, insurer_key, insurer_label, insurance_type,
  effective_date, expiry_date, status, notes, created_by, created_at, updated_at`;

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
  constructor(
    private readonly db: HrmDbService,
    @Optional() private readonly settingsCatalogs?: SettingsCatalogsService,
  ) {}

  private resolveCatalogTenantId(): string {
    return masterTenantIdFromEnv() || MASTER_TENANT_ID;
  }

  private async assertConPositionKey(
    companyId: string,
    positionKey: string | null | undefined,
    required: boolean,
  ): Promise<{ code: string; label: string } | null> {
    const code = positionKey?.trim() ?? '';
    if (!code) {
      if (!required) return null;
      throw new ApiException(
        HRM_CON_POS_KEY,
        'position_key is required (catalog SoT; free-text position alone forbidden)',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!this.settingsCatalogs) return { code, label: code };
    const hit = await this.settingsCatalogs.assertCodeInEffectiveCatalog({
      tenantId: this.resolveCatalogTenantId(),
      companyId,
      catalogKey: 'job_titles',
      code,
      errorCode: HRM_CON_POS_KEY,
      errorMessage: `position_key '${code}' is not in job_titles catalog (free-text SoT forbidden)`,
    });
    return { code: hit.code, label: hit.label };
  }

  private async assertConSignerPositionKey(
    companyId: string,
    signerPositionKey: string | null | undefined,
    required: boolean,
  ): Promise<{ code: string; label: string } | null> {
    const code = signerPositionKey?.trim() ?? '';
    if (!code) {
      if (!required) return null;
      throw new ApiException(
        HRM_CON_SIGNER_POS_KEY,
        'signer_position_key is required when signer fields are set',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!this.settingsCatalogs) return { code, label: code };
    const hit = await this.settingsCatalogs.assertCodeInEffectiveCatalog({
      tenantId: this.resolveCatalogTenantId(),
      companyId,
      catalogKey: 'job_titles',
      code,
      errorCode: HRM_CON_SIGNER_POS_KEY,
      errorMessage: `signer_position_key '${code}' is not in job_titles catalog`,
    });
    return { code: hit.code, label: hit.label };
  }

  /** Lookup active job_titles code — null when absent or not in effective catalog. */
  private async lookupActiveJobTitleCode(
    companyId: string,
    code: string,
  ): Promise<string | null> {
    const trimmed = code.trim();
    if (!trimmed) return null;
    if (!this.settingsCatalogs) return trimmed;
    const items = await this.settingsCatalogs.getEffectiveItemsForKey(
      this.resolveCatalogTenantId(),
      companyId,
      'job_titles',
    );
    const hit = items.find(
      (item) =>
        item.status === 'active' &&
        item.code?.trim()?.toLowerCase() === trimmed.toLowerCase(),
    );
    return hit?.code?.trim() ?? null;
  }

  /**
   * UF-HRM-05 / Contracts list page — FE may omit position_key; derive before E1-A assert.
   * Order: catalog-valid body.position_key → employees.job_title_key (catalog-valid) → first active job_titles.
   * Pass-through keys (employee_code / dept snapshot from FE-10) skip when not ∈ job_titles.
   */
  private async resolveContractPositionKey(
    companyId: string,
    employeeId: string,
    explicitKey: string | null | undefined,
  ): Promise<string> {
    const trimmed = explicitKey?.trim() ?? '';
    if (trimmed) {
      const fromExplicit = await this.lookupActiveJobTitleCode(companyId, trimmed);
      if (fromExplicit) return fromExplicit;
    }

    const emp = await this.db.query<{ job_title_key: string | null }>(
      `SELECT job_title_key
       FROM public.employees
       WHERE id = $1::uuid AND archived_at IS NULL
       LIMIT 1`,
      [employeeId],
    );
    const fromEmployeeRaw = emp.rows[0]?.job_title_key?.trim() ?? '';
    if (fromEmployeeRaw) {
      const fromEmployee = await this.lookupActiveJobTitleCode(companyId, fromEmployeeRaw);
      if (fromEmployee) return fromEmployee;
      if (!this.settingsCatalogs) return fromEmployeeRaw;
    }

    if (this.settingsCatalogs) {
      const items = await this.settingsCatalogs.getEffectiveItemsForKey(
        this.resolveCatalogTenantId(),
        companyId,
        'job_titles',
      );
      const firstActive = items.find(
        (item) => item.status === 'active' && (item.code?.trim()?.length ?? 0) > 0,
      );
      if (firstActive?.code?.trim()) return firstActive.code.trim();
    }

    throw new ApiException(
      HRM_CON_POS_KEY,
      'position_key is required (send position_key, set employee job_title_key, or configure job_titles catalog)',
      HttpStatus.BAD_REQUEST,
    );
  }

  /** FR-HRM-CI-TYPE-E2-01 #2/#5 — loại HĐ ∈ effective contract_types. */
  private async assertConContractType(
    companyId: string,
    contractType: string | null | undefined,
  ): Promise<string> {
    const code = contractType?.trim() ?? '';
    if (!code) {
      throw new ApiException(
        HRM_CON_TYPE_KEY,
        'contract_type is required (contract_types catalog code; HARDCODE invent forbidden)',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!this.settingsCatalogs) return code;
    const hit = await this.settingsCatalogs.assertCodeInEffectiveCatalog({
      tenantId: this.resolveCatalogTenantId(),
      companyId,
      catalogKey: 'contract_types',
      code,
      errorCode: HRM_CON_TYPE_KEY,
      errorMessage: `contract_type '${code}' is not in contract_types catalog (free-text SoT forbidden)`,
    });
    return hit.code;
  }

  /** E3 — insurer_key ∈ insurers (aliases via resolveCatalogFamily). */
  private async assertInsurerKey(
    companyId: string,
    insurerKey: string | null | undefined,
    required: boolean,
  ): Promise<{ code: string; label: string } | null> {
    const code = insurerKey?.trim() ?? '';
    if (!code) {
      if (!required) return null;
      throw new ApiException(
        HRM_INS_INSURER_KEY,
        'insurer_key is required (insurers catalog code; free-text SoT forbidden)',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!this.settingsCatalogs) return { code, label: code };
    const hit = await this.settingsCatalogs.assertCodeInEffectiveCatalog({
      tenantId: this.resolveCatalogTenantId(),
      companyId,
      catalogKey: 'insurers',
      code,
      errorCode: HRM_INS_INSURER_KEY,
      errorMessage: `insurer_key '${code}' is not in insurers catalog`,
    });
    return { code: hit.code, label: hit.label };
  }

  private async assertInsuranceTypeKey(
    companyId: string,
    insuranceType: string | null | undefined,
    required: boolean,
  ): Promise<string | null> {
    const code = insuranceType?.trim() ?? '';
    if (!code) {
      if (!required) return null;
      throw new ApiException(
        HRM_INS_TYPE_KEY,
        'insurance_type is required (insurance_types catalog code)',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!this.settingsCatalogs) return code;
    const hit = await this.settingsCatalogs.assertCodeInEffectiveCatalog({
      tenantId: this.resolveCatalogTenantId(),
      companyId,
      catalogKey: 'insurance_types',
      code,
      errorCode: HRM_INS_TYPE_KEY,
      errorMessage: `insurance_type '${code}' is not in insurance_types catalog`,
    });
    return hit.code;
  }

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
    // E1-A MD-BIND — close FE↔BE orphan position/signer fields (DB_DESIGN §7).
    await this.db.query(`
      ALTER TABLE public.employee_contracts
      ADD COLUMN IF NOT EXISTS position TEXT NULL;
    `);
    await this.db.query(`
      ALTER TABLE public.employee_contracts
      ADD COLUMN IF NOT EXISTS position_key TEXT NULL;
    `);
    await this.db.query(`
      ALTER TABLE public.employee_contracts
      ADD COLUMN IF NOT EXISTS department TEXT NULL;
    `);
    await this.db.query(`
      ALTER TABLE public.employee_contracts
      ADD COLUMN IF NOT EXISTS department_key TEXT NULL;
    `);
    await this.db.query(`
      ALTER TABLE public.employee_contracts
      ADD COLUMN IF NOT EXISTS signer_name TEXT NULL;
    `);
    await this.db.query(`
      ALTER TABLE public.employee_contracts
      ADD COLUMN IF NOT EXISTS signer_position TEXT NULL;
    `);
    await this.db.query(`
      ALTER TABLE public.employee_contracts
      ADD COLUMN IF NOT EXISTS signer_position_key TEXT NULL;
    `);
    await this.db.query(`
      ALTER TABLE public.employee_contracts
      ALTER COLUMN company_id TYPE TEXT USING company_id::text;
    `);
    // G-CI-01 — open-ended contracts may omit end_date (SRS «Theo loại»).
    await this.db.query(`
      ALTER TABLE public.employee_contracts
      ALTER COLUMN end_date DROP NOT NULL;
    `);
    await this.db.query(`
      DO $$
      BEGIN
        UPDATE public.employee_contracts
        SET end_date = start_date, updated_at = NOW()
        WHERE end_date IS NOT NULL AND start_date > end_date;

        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint c
          INNER JOIN pg_class t ON c.conrelid = t.oid
          INNER JOIN pg_namespace n ON t.relnamespace = n.oid
          WHERE n.nspname = 'public'
            AND t.relname = 'employee_contracts'
            AND c.conname = 'chk_contract_date_range'
        ) THEN
          ALTER TABLE public.employee_contracts
          ADD CONSTRAINT chk_contract_date_range
          CHECK (end_date IS NULL OR start_date <= end_date);
        END IF;
      END $$;
    `);
    await this.db.query(`
      ALTER TABLE public.employee_insurance_records
      ALTER COLUMN company_id TYPE TEXT USING company_id::text;
    `);
    // E3 — insurer_key + policy_id soft link on employee records
    await this.db.query(
      `ALTER TABLE public.employee_insurance_records ADD COLUMN IF NOT EXISTS insurer_key TEXT NULL;`,
    );
    await this.db.query(
      `ALTER TABLE public.employee_insurance_records ADD COLUMN IF NOT EXISTS policy_id UUID NULL;`,
    );
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_employee_insurance_insurer_key
      ON public.employee_insurance_records (company_id, insurer_key);
    `);
    // E3 — policy master
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.hrm_insurance_policies (
        id UUID PRIMARY KEY,
        company_id TEXT NOT NULL,
        policy_code TEXT NOT NULL,
        policy_name TEXT NOT NULL,
        insurer_key TEXT NOT NULL,
        insurer_label TEXT NULL,
        insurance_type TEXT NOT NULL,
        effective_date DATE NOT NULL,
        expiry_date DATE NULL,
        status TEXT NOT NULL DEFAULT 'draft',
        notes TEXT NULL,
        created_by TEXT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT chk_hrm_insurance_policy_status
          CHECK (status IN ('draft','active','expired','cancelled')),
        CONSTRAINT chk_hrm_insurance_policy_dates
          CHECK (expiry_date IS NULL OR effective_date <= expiry_date)
      );
    `);
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_hrm_insurance_policies_company_code
      ON public.hrm_insurance_policies (company_id, lower(policy_code));
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_hrm_insurance_policies_company_status_expiry
      ON public.hrm_insurance_policies (company_id, status, expiry_date);
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

  /**
   * @CODE-MEMORY method · FR-HRM-CI-01 · G-CI-01
   * SRS bước: Diễn biến #5 Thời hạn sai · #7 Lưu thành công
   * TechSpec: §14.2 · §16.9 G-CI-01 — end_date theo loại HĐ
   */
  async createContract(payload: CreateContractDto, authorization?: string) {
    await this.ensureSchema();
    const companyId = resolveHrmPersistCompanyIdText(authorization, payload.company_id);
    // E2 — assert catalog type trước G-CI-01 để invent → HRM-CON-TYPE-KEY (không bị CON-002 che).
    const contractTypeCode = await this.assertConContractType(companyId, payload.contract_type);
    // G-CI-01: end_date optional cho HĐ không thời hạn; bắt buộc + HRM-CON-002 khi loại có hạn.
    // Diễn biến #5: nếu có end_date thì start <= end (HRM-CON-001).
    assertContractEndDateForCreate({
      contractType: contractTypeCode,
      startDate: payload.start_date,
      endDate: payload.end_date,
    });
    const endDate = payload.end_date?.trim() ? payload.end_date.trim() : null;
    const employeeId = payload.employee_id ?? (await this.resolveEmployeeId(payload.employee_name, authorization, companyId));
    const resolvedPositionKey = await this.resolveContractPositionKey(
      companyId,
      employeeId,
      payload.position_key,
    );
    // E1-A — Vị trí catalog SoT (AC-E1A-CI-POS-01).
    const pos = await this.assertConPositionKey(companyId, resolvedPositionKey, true);
    const signerPresent = Boolean(
      payload.signer_name?.trim() || payload.signer_position?.trim() || payload.signer_position_key?.trim(),
    );
    const signerPos = await this.assertConSignerPositionKey(
      companyId,
      payload.signer_position_key,
      signerPresent,
    );
    const positionSnapshot = payload.position?.trim() || pos!.label;
    const signerPositionSnapshot =
      payload.signer_position?.trim() || (signerPos ? signerPos.label : null);
    const departmentKey = payload.department_key?.trim() || null;
    if (departmentKey && this.settingsCatalogs) {
      await this.settingsCatalogs.assertCodeInEffectiveCatalog({
        tenantId: this.resolveCatalogTenantId(),
        companyId,
        catalogKey: 'departments',
        code: departmentKey,
        errorCode: HRM_CON_POS_KEY,
        errorMessage: `department_key '${departmentKey}' is not in departments catalog`,
      });
    }
    // BR-CD-F5-01: salary trên CreateContractDto bị bỏ qua — dùng compensation package APIs.
    const res = await this.db.query<ContractRow>(
      `INSERT INTO public.employee_contracts
        (id, company_id, employee_id, contract_code, contract_type, start_date, end_date, status, notes,
         position, position_key, department, department_key, signer_name, signer_position, signer_position_key)
       VALUES ($1, $2, $3::uuid, $4, $5, $6::date, $7::date, 'active', $8,
               $9, $10, $11, $12, $13, $14, $15)
       RETURNING id, company_id, employee_id, contract_code, contract_type, start_date, end_date, status, notes,
                 position, position_key, department, department_key, signer_name, signer_position, signer_position_key,
                 compensation_package_id, created_at, updated_at;`,
      [
        randomUUID(),
        companyId,
        employeeId,
        payload.contract_code?.trim() ?? null,
        contractTypeCode,
        payload.start_date,
        endDate,
        payload.notes?.trim() ?? null,
        positionSnapshot,
        pos!.code,
        payload.department?.trim() ?? null,
        departmentKey,
        payload.signer_name?.trim() ?? null,
        signerPositionSnapshot,
        signerPos?.code ?? null,
      ],
    );
    // Thành công: Diễn biến #7 — khóa HĐ + employee_id mang sang BH/lương.
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

  /**
   * @CODE-MEMORY method · FR-HRM-CI-02 · E3 insurer_key
   * SRS bước: Diễn biến #6 Lưu thành công — ghi nhận BH
   * TechSpec: §14.3 ref_srs FR-HRM-CI-02 · API_DESIGN E3 §17
   */
  async createInsuranceRecord(payload: CreateInsuranceRecordDto, authorization?: string) {
    await this.ensureSchema();
    const companyId = resolveHrmPersistCompanyIdText(authorization, payload.company_id);
    const insurer = await this.assertInsurerKey(companyId, payload.insurer_key, true);
    let policyId: string | null = payload.policy_id?.trim() || null;
    if (policyId) {
      await this.assertPolicyInScope(policyId, companyId, authorization, { requireActive: false });
    }
    const providerSnapshot = payload.provider?.trim() || insurer!.label;
    const res = await this.db.query<InsuranceRow>(
      `INSERT INTO public.employee_insurance_records
        (id, company_id, employee_id, provider, policy_number, expiry_date, status, insurer_key, policy_id)
       VALUES ($1, $2, $3::uuid, $4, $5, $6::date, 'active', $7, $8::uuid)
       RETURNING id, company_id, employee_id, provider, policy_number, expiry_date, status,
                 insurer_key, policy_id, created_at, updated_at;`,
      [
        randomUUID(),
        companyId,
        payload.employee_id,
        providerSnapshot,
        payload.policy_number.trim(),
        payload.expiry_date,
        insurer!.code,
        policyId,
      ],
    );
    // Thành công: Diễn biến #6 — khóa BH gắn hồ sơ.
    return res.rows[0];
  }

  private async assertPolicyInScope(
    policyId: string,
    requestedCompanyId: string,
    authorization: string | undefined,
    opts: { requireActive: boolean },
  ): Promise<InsurancePolicyRow> {
    const { scope, expandedCompanyIds } = this.resolveContractsListScope(
      authorization,
      requestedCompanyId,
    );
    const filters: string[] = ['id = $1::uuid'];
    const values: unknown[] = [policyId];
    pushCompanyIdFilter(filters, values, expandedCompanyIds);
    const res = await this.db.query<InsurancePolicyRow>(
      `SELECT ${POLICY_SELECT} FROM public.hrm_insurance_policies WHERE ${filters.join(' AND ')} LIMIT 1;`,
      values,
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException(HRM_INS_POL_404, 'Insurance policy not found', HttpStatus.NOT_FOUND);
    }
    assertResourceInHrmScope(row, scope, {
      notFoundCode: HRM_INS_POL_404,
      mismatchCode: 'HRM-INS-POL-409',
    });
    if (opts.requireActive && row.status !== 'active') {
      throw new ApiException(
        HRM_INS_POL_STATUS,
        'Policy must be active to enroll participants',
        HttpStatus.BAD_REQUEST,
      );
    }
    return row;
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
          ec.position,
          ec.position_key,
          COALESCE(ec.department, NULLIF(TRIM(e.custom_fields->>'department'), ''), e.job_title_key) AS department,
          ec.department_key,
          ec.signer_name,
          ec.signer_position,
          ec.signer_position_key,
          ec.compensation_package_id,
          ec.created_at,
          ec.updated_at,
          e.full_name AS employee_name,
          e.employee_code AS employee_code
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
          ec.position,
          ec.position_key,
          COALESCE(ec.department, NULLIF(TRIM(e.custom_fields->>'department'), ''), e.job_title_key) AS department,
          ec.department_key,
          ec.signer_name,
          ec.signer_position,
          ec.signer_position_key,
          ec.compensation_package_id,
          ec.created_at,
          ec.updated_at,
          e.full_name AS employee_name,
          e.employee_code AS employee_code
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
    const packageLinkProvided = payload.compensation_package_id !== undefined;
    if (payload.position !== undefined && payload.position_key === undefined) {
      throw new ApiException(
        HRM_CON_POS_KEY,
        'position_key is required when updating position (invent-only free-text forbidden)',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (payload.signer_position !== undefined && payload.signer_position_key === undefined) {
      throw new ApiException(
        HRM_CON_SIGNER_POS_KEY,
        'signer_position_key is required when updating signer_position',
        HttpStatus.BAD_REQUEST,
      );
    }
    let nextPositionKey: string | null = null;
    let nextPosition: string | null = null;
    const hasPositionKey = payload.position_key !== undefined;
    if (hasPositionKey) {
      const pos = await this.assertConPositionKey(existing!.company_id, payload.position_key, true);
      nextPositionKey = pos!.code;
      nextPosition = payload.position?.trim() || pos!.label;
    }
    let nextSignerKey: string | null = null;
    let nextSignerPos: string | null = null;
    const hasSignerKey = payload.signer_position_key !== undefined;
    if (hasSignerKey) {
      const signerPos = await this.assertConSignerPositionKey(
        existing!.company_id,
        payload.signer_position_key,
        true,
      );
      nextSignerKey = signerPos!.code;
      nextSignerPos = payload.signer_position?.trim() || signerPos!.label;
    }
    const hasDeptKey = payload.department_key !== undefined;
    const nextDeptKey = hasDeptKey ? payload.department_key?.trim() || null : null;
    if (nextDeptKey && this.settingsCatalogs) {
      await this.settingsCatalogs.assertCodeInEffectiveCatalog({
        tenantId: this.resolveCatalogTenantId(),
        companyId: existing!.company_id,
        catalogKey: 'departments',
        code: nextDeptKey,
        errorCode: HRM_CON_POS_KEY,
        errorMessage: `department_key '${nextDeptKey}' is not in departments catalog`,
      });
    }
    let nextContractType: string | null = null;
    if (payload.contract_type !== undefined) {
      nextContractType = await this.assertConContractType(existing!.company_id, payload.contract_type);
    }
    const hasSignerName = payload.signer_name !== undefined;
    const hasDeptSnap = payload.department !== undefined;
    const updateValues: unknown[] = [
      nextContractType,
      payload.start_date ?? null,
      payload.end_date ?? null,
      payload.status ?? null,
      notesProvided ? (payload.notes?.trim() ?? null) : null,
      notesProvided,
      packageLinkProvided ? payload.compensation_package_id : null,
      packageLinkProvided,
      hasPositionKey,
      nextPositionKey,
      nextPosition,
      hasSignerKey,
      nextSignerKey,
      nextSignerPos,
      hasDeptKey,
      nextDeptKey,
      hasSignerName ? (payload.signer_name?.trim() ?? null) : null,
      hasSignerName,
      hasDeptSnap ? (payload.department?.trim() ?? null) : null,
      hasDeptSnap,
      contractId,
    ];
    const updateFilters: string[] = ['id = $21::uuid'];
    pushCompanyIdFilter(
      updateFilters,
      updateValues,
      expandHrmTextCompanyIds(scope, authorization, requestedCompanyId),
    );
    const res = await this.db.query<ContractRow>(
      `
        UPDATE public.employee_contracts
        SET contract_type = COALESCE($1, contract_type),
            start_date = COALESCE($2::date, start_date),
            end_date = COALESCE($3::date, end_date),
            status = COALESCE($4, status),
            notes = CASE WHEN $6::boolean THEN $5 ELSE notes END,
            compensation_package_id = CASE WHEN $8::boolean THEN $7::uuid ELSE compensation_package_id END,
            position_key = CASE WHEN $9::boolean THEN $10 ELSE position_key END,
            position = CASE WHEN $9::boolean THEN $11 ELSE position END,
            signer_position_key = CASE WHEN $12::boolean THEN $13 ELSE signer_position_key END,
            signer_position = CASE WHEN $12::boolean THEN $14 ELSE signer_position END,
            department_key = CASE WHEN $15::boolean THEN $16 ELSE department_key END,
            signer_name = CASE WHEN $18::boolean THEN $17 ELSE signer_name END,
            department = CASE WHEN $20::boolean THEN $19 ELSE department END,
            updated_at = NOW()
        WHERE ${updateFilters.join(' AND ')}
        RETURNING id, company_id, employee_id, contract_code, contract_type, start_date, end_date, status, notes,
                  position, position_key, department, department_key, signer_name, signer_position, signer_position_key,
                  compensation_package_id, created_at, updated_at;
      `,
      updateValues,
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

  // --- E3 Insurance policy master CRUD (OpenAPI freeze: /contracts-insurance/insurance-policies) ---

  async listInsurancePolicies(
    query: ListInsurancePoliciesQueryDto,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    await this.ensureSchema();
    const { expandedCompanyIds } = this.resolveContractsListScope(
      authorization,
      query.company_id,
      scopeContext,
    );
    const filters: string[] = [];
    const values: unknown[] = [];
    pushCompanyIdFilter(filters, values, expandedCompanyIds);
    if (query.status) {
      filters.push(`status = $${values.length + 1}`);
      values.push(query.status.trim().toLowerCase());
    }
    if (query.q?.trim()) {
      values.push(`%${query.q.trim().toLowerCase()}%`);
      filters.push(
        `(lower(policy_code) LIKE $${values.length} OR lower(policy_name) LIKE $${values.length})`,
      );
    }
    const res = await this.db.query<InsurancePolicyRow>(
      `SELECT ${POLICY_SELECT} FROM public.hrm_insurance_policies
       WHERE ${filters.join(' AND ')}
       ORDER BY effective_date DESC, created_at DESC;`,
      values,
    );
    return { total: res.rows.length, data: res.rows };
  }

  async createInsurancePolicy(payload: CreateInsurancePolicyDto, authorization?: string) {
    await this.ensureSchema();
    const companyId = resolveHrmPersistCompanyIdText(authorization, payload.company_id);
    const insurer = await this.assertInsurerKey(companyId, payload.insurer_key, true);
    const insuranceType = await this.assertInsuranceTypeKey(companyId, payload.insurance_type, true);
    const effective = payload.effective_date;
    const expiry = payload.expiry_date?.trim() || null;
    if (expiry && new Date(effective).getTime() > new Date(expiry).getTime()) {
      throw new ApiException(HRM_INS_POL_001, 'expiry_date must be >= effective_date', HttpStatus.BAD_REQUEST);
    }
    let status: InsurancePolicyRow['status'] = 'draft';
    if (payload.status) {
      assertStatusTransition({
        domain: 'insurance_policy',
        from: 'draft',
        to: payload.status,
      });
      status = payload.status;
    }
    try {
      const res = await this.db.query<InsurancePolicyRow>(
        `INSERT INTO public.hrm_insurance_policies
          (id, company_id, policy_code, policy_name, insurer_key, insurer_label, insurance_type,
           effective_date, expiry_date, status, notes, created_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8::date,$9::date,$10,$11,$12)
         RETURNING ${POLICY_SELECT};`,
        [
          randomUUID(),
          companyId,
          payload.policy_code.trim(),
          payload.policy_name.trim(),
          insurer!.code,
          insurer!.label,
          insuranceType!,
          effective,
          expiry,
          status,
          payload.notes?.trim() ?? null,
          payload.created_by?.trim() ?? null,
        ],
      );
      return res.rows[0];
    } catch (err: unknown) {
      if ((err as { code?: string })?.code === '23505') {
        throw new ApiException(HRM_INS_POL_002, 'Duplicate policy_code for company', HttpStatus.CONFLICT);
      }
      throw err;
    }
  }

  async getInsurancePolicyById(
    policyId: string,
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
    const filters: string[] = ['id = $1::uuid'];
    const values: unknown[] = [policyId];
    pushCompanyIdFilter(filters, values, expandedCompanyIds);
    const res = await this.db.query<InsurancePolicyRow>(
      `SELECT ${POLICY_SELECT} FROM public.hrm_insurance_policies WHERE ${filters.join(' AND ')} LIMIT 1;`,
      values,
    );
    const row = res.rows[0];
    assertResourceInHrmScope(row, scope, {
      notFoundCode: HRM_INS_POL_404,
      mismatchCode: 'HRM-INS-POL-409',
    });
    return row!;
  }

  async updateInsurancePolicy(
    policyId: string,
    payload: UpdateInsurancePolicyDto,
    requestedCompanyId: string,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const current = await this.getInsurancePolicyById(policyId, requestedCompanyId, authorization);
    if (payload.status) {
      assertStatusTransition({
        domain: 'insurance_policy',
        from: current.status,
        to: payload.status,
        entityId: policyId,
      });
    }
    const insurer =
      payload.insurer_key !== undefined
        ? await this.assertInsurerKey(current.company_id, payload.insurer_key, true)
        : null;
    const insuranceType =
      payload.insurance_type !== undefined
        ? await this.assertInsuranceTypeKey(current.company_id, payload.insurance_type, true)
        : null;
    const effective = payload.effective_date ?? current.effective_date;
    const expiry =
      payload.expiry_date === undefined
        ? current.expiry_date
        : payload.expiry_date === null
          ? null
          : payload.expiry_date;
    if (expiry && new Date(effective).getTime() > new Date(expiry).getTime()) {
      throw new ApiException(HRM_INS_POL_001, 'expiry_date must be >= effective_date', HttpStatus.BAD_REQUEST);
    }
    try {
      const res = await this.db.query<InsurancePolicyRow>(
        `UPDATE public.hrm_insurance_policies
         SET policy_code = COALESCE($2, policy_code),
             policy_name = COALESCE($3, policy_name),
             insurer_key = COALESCE($4, insurer_key),
             insurer_label = COALESCE($5, insurer_label),
             insurance_type = COALESCE($6, insurance_type),
             effective_date = COALESCE($7::date, effective_date),
             expiry_date = CASE WHEN $8::text = '__KEEP__' THEN expiry_date ELSE $9::date END,
             status = COALESCE($10, status),
             notes = COALESCE($11, notes),
             updated_at = NOW()
         WHERE id = $1::uuid
         RETURNING ${POLICY_SELECT};`,
        [
          policyId,
          payload.policy_code?.trim() ?? null,
          payload.policy_name?.trim() ?? null,
          insurer?.code ?? null,
          insurer?.label ?? null,
          insuranceType,
          payload.effective_date ?? null,
          payload.expiry_date === undefined ? '__KEEP__' : 'SET',
          expiry,
          payload.status ?? null,
          payload.notes?.trim() ?? null,
        ],
      );
      return res.rows[0];
    } catch (err: unknown) {
      if ((err as { code?: string })?.code === '23505') {
        throw new ApiException(HRM_INS_POL_002, 'Duplicate policy_code for company', HttpStatus.CONFLICT);
      }
      throw err;
    }
  }

  async deleteInsurancePolicy(policyId: string, requestedCompanyId: string, authorization?: string) {
    await this.ensureSchema();
    const current = await this.getInsurancePolicyById(policyId, requestedCompanyId, authorization);
    if (current.status !== 'draft' && current.status !== 'cancelled') {
      throw new ApiException(
        HRM_INS_POL_DEL_BLOCK,
        'Only draft or cancelled policies can be deleted',
        HttpStatus.CONFLICT,
      );
    }
    const participants = await this.db.query<{ total: string }>(
      `SELECT COUNT(*)::text AS total FROM public.hrm_insurance_policy_participants
       WHERE policy_id = $1::uuid;`,
      [policyId],
    ).catch(() => ({ rows: [{ total: '0' }] }));
    if (Number(participants.rows[0]?.total ?? 0) > 0) {
      throw new ApiException(
        HRM_INS_POL_DEL_BLOCK,
        'Policy has participants — cancel/end enrollments first',
        HttpStatus.CONFLICT,
      );
    }
    await this.db.query(`DELETE FROM public.hrm_insurance_policies WHERE id = $1::uuid;`, [policyId]);
    return { id: policyId, deleted: true };
  }

  async getInsuranceRecordById(
    recordId: string,
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
    const filters: string[] = ['ir.id = $1::uuid'];
    const values: unknown[] = [recordId];
    pushCompanyIdFilter(filters, values, expandedCompanyIds);
    const irFilters = this.qualifyContractInsuranceFilters(filters, 'ir');
    const res = await this.db.query<InsuranceRow>(
      `SELECT ir.id, ir.company_id, ir.employee_id, ir.provider, ir.policy_number, ir.expiry_date, ir.status,
              ir.insurer_key, ir.policy_id, ir.created_at, ir.updated_at
       FROM public.employee_insurance_records ir
       WHERE ${irFilters.join(' AND ')} LIMIT 1;`,
      values,
    );
    const row = res.rows[0];
    assertResourceInHrmScope(row, scope, {
      notFoundCode: 'HRM-CON-404',
      mismatchCode: 'HRM-CON-409',
    });
    return this.mapInsuranceListItem(row!);
  }

  async updateInsuranceRecord(
    recordId: string,
    payload: UpdateInsuranceRecordDto,
    requestedCompanyId: string,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const current = await this.getInsuranceRecordById(recordId, requestedCompanyId, authorization);
    if (payload.status) {
      assertStatusTransition({
        domain: 'insurance_record',
        from: String(current.status),
        to: payload.status,
        entityId: recordId,
      });
    }
    const insurer =
      payload.insurer_key !== undefined
        ? await this.assertInsurerKey(String(current.company_id), payload.insurer_key, true)
        : null;
    if (payload.policy_id) {
      await this.assertPolicyInScope(payload.policy_id, requestedCompanyId, authorization, {
        requireActive: false,
      });
    }
    const providerSnapshot =
      payload.provider?.trim() || (insurer ? insurer.label : null);
    const res = await this.db.query<InsuranceRow>(
      `UPDATE public.employee_insurance_records
       SET provider = COALESCE($2, provider),
           policy_number = COALESCE($3, policy_number),
           expiry_date = COALESCE($4::date, expiry_date),
           status = COALESCE($5, status),
           insurer_key = COALESCE($6, insurer_key),
           policy_id = COALESCE($7::uuid, policy_id),
           updated_at = NOW()
       WHERE id = $1::uuid
       RETURNING id, company_id, employee_id, provider, policy_number, expiry_date, status,
                 insurer_key, policy_id, created_at, updated_at;`,
      [
        recordId,
        providerSnapshot,
        payload.policy_number?.trim() ?? null,
        payload.expiry_date ?? null,
        payload.status ?? null,
        insurer?.code ?? null,
        payload.policy_id ?? null,
      ],
    );
    return this.mapInsuranceListItem(res.rows[0]!);
  }
}
