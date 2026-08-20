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
 * Callees:    resolveHrmListScope / persist → employee_contracts · employee_insurances (enrollment SoT)
 * FE-Actions: Lưu HĐ/BH → INSERT; List/F5 → SELECT scoped
 * BE-Chain:   ensureSchema → INSERT/SELECT/UPDATE/DELETE
 * Impact:     Sai ngày kỳ → phá Diễn biến #5; scope lệch → 404 get-by-id
 * must_keep:  BR-CD-F5-01; list/get cùng resolveHrmListScope; ONE SI enrollment SoT
 * SOLID:      Service owns SQL; compensation tách EmployeeCompensationService
 * LastVerified: contracts-insurance.service.spec.ts · po-hrm-e2e-link-emp-be-02.spec.ts
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
 * @CODE-MEMORY-CHANGE 2026-08-11 PO-HRM-CTR-WORKSPACE-G4-CREATE-START-DATE-FIX-01
 * change_mode: FIX
 * What: resolveContractStartDateForCreate — optional start_date / effective_from alias; default today HCM
 * Why: QA DEF-CTR-G4-CREATE-START-DATE-400 — NV-first Step1→2 POST HRM-VAL-001
 * must_keep: G-CI-01 end_date; scope parity; GET layout expand
 *
 * @CODE-MEMORY-CHANGE 2026-08-11 PO-HRM-CTR-WORKSPACE-G4-SUBJECT-REC-NV-FIRST-01
 * change_mode: FIX
 * What: createContract — bỏ assertEmployeeRecTrace khi subject_type=employee (NV-first BA-03)
 * Why: AC-CTR-SUBJECT-02 · BR-CTR-CREATE-06/08 AMEND — legacy NV không REC trace vẫn POST 2xx; UV path giữ assertCandidateInScope
 * must_keep: G-CI-01; start_date default HCM; contracts_printable_ready=false; candidate path HRM-CTR-SUBJECT-400/CANDIDATE-404
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
 *
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-E2E-LINK-EMP-BE-02
 * change_mode: FIX
 * What: list/create/get/update/expiring insurance → employee_insurances ONE SoT + legacy bridge from records
 * Why: R-EMP-SI-DUAL-SOT — natural list rows must be POST …/employee-insurances/:id/actions targets
 * must_keep: WH/HTP/CI contracts paths; scope_parity main; U65 no seed; no invent amounts; records ≠ enrollment SoT
 *
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-CONTRACT-LEGAL-PRINT-BE-01
 * change_mode: ADD
 * What: EXPAND employee_contracts print overlay cols + archived_at soft-delete; salary ignore kept
 * Why: DATA-01 §2.1 · TechSpec §2.3 · UF-HRM-02 must_keep registry
 * must_keep: CRUD AS-IS; BR-CD-F5-01; print spine in ContractLegalPrintService
 *
 * @CODE-MEMORY-CHANGE 2026-08-08 PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-BE-01
 * change_mode: ADD
 * What: assertInsuranceTypeKey → Nest F-SI-CAT-EFF-01 when count>0 (HRM-INS-TYPE-KEY); MD alone not sole SoT
 * Why: SA Option B · AC-PLT-SI-INS-01b · VAL-SI-CNS-01 · L-SI-INS-02
 * must_keep: insurers MD path; enrollment ONE SoT; CTR seals; U65 empty soft-allow
 *
 * @CODE-MEMORY-CHANGE 2026-08-08 PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-BE-01
 * change_mode: ADD
 * What: assertInsurerKey → Nest F-SI-CAT-INS-EFF-01 when count>0 (HRM-INS-INSURER-KEY); MD alone not sole SoT
 * Why: SA Option B · AC-PLT-SI-INSURER-01b · VAL-SI-INR-CNS-01 · L-SI-INR-02
 * must_keep: SI type L1 RETAIN · enrollment ONE SoT · CTR seals · U65 empty soft-allow · KEY ≠ TYPE-KEY
 *
 * @CODE-MEMORY-CHANGE 2026-08-11 D-BE-HRM-CTR-WORK-ARRANGEMENT-EMP-EFF-01
 * change_mode: FIX
 * What: assertWorkArrangementCode + resolveWorkFormLabelVi → EMP effective union (F-EMP-CAT-EFF-02) trước work_arrangements legacy
 * Why: AC-SET-CONSUMER-ET-CTR-01 · FE posts employmentTypeKey (*emp) · HRM-CTR-WORK-FORM-400
 * must_keep: QACONPAYSTQC1 · work_arrangements fallback · U65 EFF=0 soft-allow · BR-CD-F5-01
 *
 * @CODE-MEMORY-CHANGE 2026-08-11 PO-HRM-CTR-WORKSPACE-BE-LAYOUT-01
 * change_mode: EXPAND
 * What: getContractById → clause_ids alias + clause_layout[] + can_issue + preview_summary via ContractLegalPrintService
 * Why: SA-01 §4.1 G-CTR-GET-LAYOUT-01 — ContractWorkspace view shell one round-trip
 * must_keep: list/get scope parity; registry fields; print-overlay only mutate clause order; contracts_printable_ready=false
 */
import { HttpStatus, Injectable, Optional } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
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
import {
  bridgeLegacyInsuranceRecordsToEnrollments,
  ensureEmployeeInsuranceEnrollmentSchema,
} from '../employee-insurances/insurance-enrollment-bridge';
import { SettingsCatalogsService } from '../settings-catalogs/settings-catalogs.service';
import {
  assertContractEndDateForCreate,
  resolveContractStartDateForCreate,
} from './contract-end-date-policy';
import { ContractLegalPrintService } from './contract-legal-print.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { CreateInsurancePolicyDto } from './dto/create-insurance-policy.dto';
import { CreateInsuranceRecordDto } from './dto/create-insurance-record.dto';
import { ListExpiringQueryDto } from './dto/list-expiring.query.dto';
import { ListInsurancePoliciesQueryDto } from './dto/list-insurance-policies.query.dto';
import { ListContractsQueryDto } from './dto/list-contracts.query.dto';
import { ContractCreateContextQueryDto } from './dto/contract-create-context.query.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import {
  CompensationPackageDetail,
  EmployeeCompensationService,
} from './employee-compensation.service';
import { UpdateInsurancePolicyDto } from './dto/update-insurance-policy.dto';
import { UpdateInsuranceRecordDto } from './dto/update-insurance-record.dto';
import { SiInsuranceTypeService } from './si-insurance-type.service';
import { SiInsurerService } from './si-insurer.service';
import { EmpEmploymentTypeService } from '../employees/emp-employment-type.service';
import { HRM_EMP_ET_UNKNOWN } from '../employees/emp-employment-type.constants';

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
/** PO-HRM-CTR-CREATE-REDESIGN-BE-SUBJ-01 — wizard subject + GĐ1 validation. */
export const HRM_CTR_SIGN_REQ_400 = 'HRM-CTR-SIGN-REQ-400';
export const HRM_CTR_SUBJECT_400 = 'HRM-CTR-SUBJECT-400';
export const HRM_CTR_CANDIDATE_404 = 'HRM-CTR-CANDIDATE-404';
export const HRM_CTR_SUBJECT_REC_400 = 'HRM-CTR-SUBJECT-REC-400';
export const HRM_CTR_WORK_FORM_400 = 'HRM-CTR-WORK-FORM-400';
export const HRM_CTR_SALARY_RATIO_400 = 'HRM-CTR-SALARY-RATIO-400';

type ContractRow = {
  id: string;
  company_id: string;
  employee_id: string | null;
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
  pack_code?: string | null;
  template_id?: string | null;
  template_code?: string | null;
  signed_at?: string | null;
  contract_name?: string | null;
  work_arrangement?: string | null;
  salary_ratio_percent?: number | string | null;
  print_overlay_clause_ids?: string[] | null;
  term_type?: string | null;
  work_location?: string | null;
  work_location_scope?: string | null;
  job_description_text?: string | null;
  probation_days?: number | null;
  probation_end?: string | null;
  license_class?: string | null;
  driver_license_number?: string | null;
  driver_license_issued_on?: string | null;
  driver_license_issued_place?: string | null;
  vehicle_plate?: string | null;
  route_or_region?: string | null;
  archived_at?: string | null;
  created_at: string;
  updated_at: string;
  employee_name?: string | null;
  employee_code?: string | null;
  subject_type?: string | null;
  candidate_id?: string | null;
  requisition_id?: string | null;
  contract_abstract?: string | null;
  candidate_name?: string | null;
  candidate_label?: string | null;
  signing_date?: string | null;
  work_form_label_vi?: string | null;
  /** PO-HRM-CTR-WORKSPACE-BE-LAYOUT-01 — effective clause order for workspace canvas. */
  clause_ids?: string[];
  clause_layout?: Array<{
    id: string;
    code: string;
    title_vi: string;
    body_vi: string;
    clause_group: string;
    mandatory: boolean;
    sort_order: number;
  }>;
  can_issue?: boolean;
  preview_summary?: {
    pack_code: string | null;
    template_code: string | null;
    missing_fields: Array<{ field: string; message: string }>;
    missing_clauses: Array<{ code: string; title_vi: string }>;
  };
};

/** Shared registry SELECT — list/get parity (PO-HRM-CTR-CREATE-REDESIGN-BE-01). */
const CONTRACT_REGISTRY_SELECT_SQL = `
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
          ec.pack_code,
          ec.template_id,
          ec.template_code,
          ec.signed_at::text AS signed_at,
          COALESCE(ec.contract_name, ec.job_description_text) AS contract_name,
          ec.work_arrangement,
          ec.salary_ratio_percent,
          ec.subject_type,
          ec.candidate_id,
          ec.requisition_id,
          ec.contract_abstract,
          ec.term_type,
          ec.work_location,
          ec.work_location_scope,
          ec.job_description_text,
          ec.probation_days,
          ec.probation_end,
          ec.license_class,
          ec.driver_license_number,
          ec.driver_license_issued_on::text AS driver_license_issued_on,
          ec.driver_license_issued_place,
          ec.vehicle_plate,
          ec.route_or_region,
          ec.created_at,
          ec.updated_at,
          e.full_name AS employee_name,
          e.employee_code AS employee_code,
          rc.full_name AS candidate_name`;

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
  /** Same as id — enrollment SoT usable by POST /employee-insurances/:id/actions. */
  enrollment_id: string;
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
    @Optional()
    private readonly siInsuranceTypeCatalog?: SiInsuranceTypeService,
    @Optional() private readonly siInsurerCatalog?: SiInsurerService,
    @Optional()
    private readonly empEmploymentTypeCatalog?: EmpEmploymentTypeService,
    @Optional() private readonly moduleRef?: ModuleRef,
    @Optional()
    private readonly employeeCompensation?: EmployeeCompensationService,
    @Optional() private readonly contractLegalPrint?: ContractLegalPrintService,
  ) {}

  private resolveSiInsuranceTypeCatalog(): SiInsuranceTypeService | undefined {
    if (this.siInsuranceTypeCatalog) {
      return this.siInsuranceTypeCatalog;
    }
    if (!this.moduleRef) {
      return undefined;
    }
    try {
      return this.moduleRef.get(SiInsuranceTypeService, { strict: false });
    } catch {
      return undefined;
    }
  }

  private resolveSiInsurerCatalog(): SiInsurerService | undefined {
    if (this.siInsurerCatalog) {
      return this.siInsurerCatalog;
    }
    if (!this.moduleRef) {
      return undefined;
    }
    try {
      return this.moduleRef.get(SiInsurerService, { strict: false });
    } catch {
      return undefined;
    }
  }

  private resolveEmpEmploymentTypeCatalog():
    | EmpEmploymentTypeService
    | undefined {
    if (this.empEmploymentTypeCatalog) {
      return this.empEmploymentTypeCatalog;
    }
    if (!this.moduleRef) {
      return undefined;
    }
    try {
      return this.moduleRef.get(EmpEmploymentTypeService, { strict: false });
    } catch {
      return undefined;
    }
  }

  private resolveContractLegalPrint(): ContractLegalPrintService | undefined {
    if (this.contractLegalPrint) {
      return this.contractLegalPrint;
    }
    if (!this.moduleRef) {
      return undefined;
    }
    try {
      return this.moduleRef.get(ContractLegalPrintService, { strict: false });
    } catch {
      return undefined;
    }
  }

  private normalizeWorkArrangementCode(code: string): string {
    return code.trim().replace(/-/g, '_').toLowerCase();
  }

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
    employeeId: string | null,
    explicitKey: string | null | undefined,
  ): Promise<string> {
    const trimmed = explicitKey?.trim() ?? '';
    if (trimmed) {
      const fromExplicit = await this.lookupActiveJobTitleCode(
        companyId,
        trimmed,
      );
      if (fromExplicit) return fromExplicit;
    }

    if (employeeId) {
      const emp = await this.db.query<{ job_title_key: string | null }>(
        `SELECT job_title_key
       FROM public.employees
       WHERE id = $1::uuid AND archived_at IS NULL
       LIMIT 1`,
        [employeeId],
      );
      const fromEmployeeRaw = emp.rows[0]?.job_title_key?.trim() ?? '';
      if (fromEmployeeRaw) {
        const fromEmployee = await this.lookupActiveJobTitleCode(
          companyId,
          fromEmployeeRaw,
        );
        if (fromEmployee) return fromEmployee;
        if (!this.settingsCatalogs) return fromEmployeeRaw;
      }
    }

    if (this.settingsCatalogs) {
      const items = await this.settingsCatalogs.getEffectiveItemsForKey(
        this.resolveCatalogTenantId(),
        companyId,
        'job_titles',
      );
      const firstActive = items.find(
        (item) =>
          item.status === 'active' && (item.code?.trim()?.length ?? 0) > 0,
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

  private normalizeGd1FieldAliases(
    payload: CreateContractDto | UpdateContractDto,
  ): {
    signed_at?: string | null;
    work_arrangement?: string | null;
    contract_abstract?: string | null;
  } {
    const signedAt =
      'signed_at' in payload && payload.signed_at !== undefined
        ? payload.signed_at
        : 'signing_date' in payload
          ? payload.signing_date
          : undefined;
    const workArrangement =
      'work_arrangement' in payload && payload.work_arrangement !== undefined
        ? payload.work_arrangement
        : 'work_form' in payload
          ? payload.work_form
          : undefined;
    const contractAbstract =
      'contract_abstract' in payload && payload.contract_abstract !== undefined
        ? payload.contract_abstract
        : 'abstract' in payload
          ? payload.abstract
          : undefined;
    return {
      signed_at: signedAt,
      work_arrangement: workArrangement,
      contract_abstract: contractAbstract,
    };
  }

  private async assertWorkArrangementCode(
    companyId: string,
    code: string | null | undefined,
    required: boolean,
    authorization?: string,
  ): Promise<string | null> {
    const trimmed = code?.trim() ?? '';
    if (!trimmed) {
      if (!required) return null;
      throw new ApiException(
        HRM_CTR_WORK_FORM_400,
        'work_arrangement is required (employment_types effective catalog code)',
        HttpStatus.BAD_REQUEST,
      );
    }
    const normalized = this.normalizeWorkArrangementCode(trimmed);
    const empCatalog = this.resolveEmpEmploymentTypeCatalog();
    if (empCatalog) {
      try {
        const hit = await empCatalog.assertEmploymentTypeInEffectiveCatalog({
          companyId,
          employmentType: normalized,
          authorization,
          tenantId: this.resolveCatalogTenantId(),
        });
        if (hit) {
          return hit.employmentTypeKey;
        }
        // EFF empty — U65 soft-allow (AC-SET-CONSUMER-ET-CTR-01); no work_arrangements-only sole SoT when Nest live.
        return normalized;
      } catch (err: unknown) {
        const apiErr = err as ApiException;
        if (apiErr?.code !== HRM_EMP_ET_UNKNOWN) {
          throw err;
        }
        // Fall through — legacy work_arrangements catalog codes (e.g. full_time) when not in EMP union.
      }
    }
    if (!this.settingsCatalogs) return normalized;
    const waItems = await this.settingsCatalogs.getEffectiveItemsForKey(
      this.resolveCatalogTenantId(),
      companyId,
      'work_arrangements',
    );
    if (!waItems.length) return normalized;
    const hit = await this.settingsCatalogs.assertCodeInEffectiveCatalog({
      tenantId: this.resolveCatalogTenantId(),
      companyId,
      catalogKey: 'work_arrangements',
      code: trimmed,
      errorCode: HRM_CTR_WORK_FORM_400,
      errorMessage: `work_arrangement '${trimmed}' is not in employment_types effective or work_arrangements catalog`,
    });
    return hit.code;
  }

  private async resolveWorkFormLabelVi(
    companyId: string,
    code: string | null | undefined,
    authorization?: string,
  ): Promise<string | null> {
    const trimmed = code?.trim() ?? '';
    if (!trimmed) return null;
    const normalized = this.normalizeWorkArrangementCode(trimmed);
    const empCatalog = this.resolveEmpEmploymentTypeCatalog();
    if (empCatalog) {
      try {
        const effective = await empCatalog.listEffective(
          { company_id: companyId, q: undefined },
          authorization,
          { tenantId: this.resolveCatalogTenantId() },
        );
        const empHit = effective.data.find(
          (r) => r.employmentTypeKey === normalized,
        );
        if (empHit?.nameVi?.trim()) {
          return empHit.nameVi.trim();
        }
      } catch {
        // EMP label optional — fall through to settings work_arrangements.
      }
    }
    if (!this.settingsCatalogs) return trimmed;
    const items = await this.settingsCatalogs.getEffectiveItemsForKey(
      this.resolveCatalogTenantId(),
      companyId,
      'work_arrangements',
    );
    const hit = items.find(
      (item) =>
        item.status === 'active' &&
        item.code?.trim()?.toLowerCase() === trimmed.toLowerCase(),
    );
    return hit?.label?.trim() || trimmed;
  }

  private async assertCandidateInScope(
    candidateId: string,
    companyId: string,
    authorization?: string,
  ): Promise<{ id: string; full_name: string; requisition_id: string | null }> {
    const scopeCompanyId = normalizePayrollListCompanyId(
      authorization,
      companyId,
    );
    const scope = resolveHrmListScope(authorization, scopeCompanyId);
    const expanded = expandHrmTextCompanyIds(scope, authorization, companyId);
    const res = await this.db.query<{
      id: string;
      company_id: string;
      full_name: string;
      requisition_id: string | null;
    }>(
      `SELECT id, company_id::text AS company_id, full_name, requisition_id::text AS requisition_id
       FROM public.recruitment_candidates
       WHERE id = $1::uuid
       LIMIT 1;`,
      [candidateId],
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException(
        HRM_CTR_CANDIDATE_404,
        'Candidate not found in scope',
        HttpStatus.NOT_FOUND,
      );
    }
    assertResourceInHrmScope({ company_id: row.company_id }, scope, {
      notFoundCode: HRM_CTR_CANDIDATE_404,
      mismatchCode: HRM_CTR_CANDIDATE_404,
    });
    if (!expanded.includes(row.company_id)) {
      throw new ApiException(
        HRM_CTR_CANDIDATE_404,
        'Candidate not found in scope',
        HttpStatus.NOT_FOUND,
      );
    }
    return row;
  }

  private resolveCreateSubjectBindings(payload: CreateContractDto): {
    subjectType: 'candidate' | 'employee';
    employeeId: string | null;
    candidateId: string | null;
  } {
    const explicitType = payload.subject_type;
    const hasCandidate = Boolean(payload.candidate_id?.trim());
    const hasEmployee = Boolean(
      payload.employee_id?.trim() || payload.employee_name?.trim(),
    );
    let subjectType: 'candidate' | 'employee';
    if (explicitType === 'candidate' || explicitType === 'employee') {
      subjectType = explicitType;
    } else if (hasCandidate && !hasEmployee) {
      subjectType = 'candidate';
    } else {
      subjectType = 'employee';
    }
    if (subjectType === 'candidate') {
      if (!payload.candidate_id?.trim()) {
        throw new ApiException(
          HRM_CTR_SUBJECT_400,
          'candidate_id is required when subject_type is candidate',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (payload.employee_id?.trim()) {
        throw new ApiException(
          HRM_CTR_SUBJECT_400,
          'employee_id must be null when subject_type is candidate',
          HttpStatus.BAD_REQUEST,
        );
      }
      return {
        subjectType,
        employeeId: null,
        candidateId: payload.candidate_id.trim(),
      };
    }
    return {
      subjectType: 'employee',
      employeeId: null,
      candidateId: null,
    };
  }

  private isWizardGd1Persist(payload: CreateContractDto): boolean {
    return Boolean(
      payload.subject_type ||
      payload.candidate_id?.trim() ||
      payload.signing_date?.trim() ||
      payload.signed_at?.trim() ||
      payload.work_form?.trim() ||
      payload.work_arrangement?.trim() ||
      payload.salary_ratio_percent != null ||
      payload.contract_abstract?.trim() ||
      payload.abstract?.trim(),
    );
  }

  private validateGd1WizardPersist(
    payload: CreateContractDto,
    registryOnly: boolean,
    aliases: { signed_at?: string | null; work_arrangement?: string | null },
  ): void {
    if (registryOnly || !this.isWizardGd1Persist(payload)) return;
    const signedAt =
      aliases.signed_at?.trim() ?? payload.signed_at?.trim() ?? '';
    if (!signedAt) {
      throw new ApiException(
        HRM_CTR_SIGN_REQ_400,
        'signed_at is required for wizard persist (Ngày ký)',
        HttpStatus.BAD_REQUEST,
      );
    }
    const ratio = payload.salary_ratio_percent;
    if (ratio == null || !Number.isFinite(Number(ratio))) {
      throw new ApiException(
        HRM_CTR_SALARY_RATIO_400,
        'salary_ratio_percent is required (0–100) for wizard persist',
        HttpStatus.BAD_REQUEST,
      );
    }
    const n = Number(ratio);
    if (n < 0 || n > 100) {
      throw new ApiException(
        HRM_CTR_SALARY_RATIO_400,
        'salary_ratio_percent must be between 0 and 100',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async deriveContractDisplayName(
    companyId: string,
    contractCode: string | null | undefined,
    contractTypeCode: string,
  ): Promise<string | null> {
    const code = contractCode?.trim() ?? '';
    let typeLabel = contractTypeCode;
    if (this.settingsCatalogs) {
      const items = await this.settingsCatalogs.getEffectiveItemsForKey(
        this.resolveCatalogTenantId(),
        companyId,
        'contract_types',
      );
      const hit = items.find(
        (item) =>
          item.code?.trim()?.toLowerCase() === contractTypeCode.toLowerCase(),
      );
      if (hit?.label?.trim()) typeLabel = hit.label.trim();
    }
    if (code && typeLabel) return `${code} — ${typeLabel}`;
    return code || typeLabel || null;
  }

  private enrichContractRegistryRow(
    row: ContractRow,
    workFormLabel: string | null,
  ): ContractRow {
    const candidateLabel =
      row.candidate_label ??
      (row.candidate_name?.trim()
        ? row.candidate_name.trim()
        : row.candidate_id
          ? `UV-${String(row.candidate_id).slice(0, 8)}`
          : null);
    return {
      ...row,
      signing_date: row.signed_at ?? row.signing_date ?? null,
      candidate_label: candidateLabel,
      work_form_label_vi: workFormLabel ?? row.work_form_label_vi ?? null,
    };
  }

  private async enrichContractRegistryRows(
    rows: ContractRow[],
    companyId: string,
    authorization?: string,
  ): Promise<ContractRow[]> {
    const labelCache = new Map<string, string | null>();
    const out: ContractRow[] = [];
    for (const row of rows) {
      const wa = row.work_arrangement?.trim() ?? '';
      let label: string | null = null;
      if (wa) {
        if (!labelCache.has(wa)) {
          labelCache.set(
            wa,
            await this.resolveWorkFormLabelVi(companyId, wa, authorization),
          );
        }
        label = labelCache.get(wa) ?? null;
      }
      out.push(this.enrichContractRegistryRow(row, label));
    }
    return out;
  }

  /** E3 — insurer_key ∈ Nest EFF insurers when count>0 (aliases via legacy_alias_keys). */
  private async assertInsurerKey(
    companyId: string,
    insurerKey: string | null | undefined,
    required: boolean,
    authorization?: string,
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
    const nestCatalog = this.resolveSiInsurerCatalog();
    if (nestCatalog) {
      const hit = await nestCatalog.assertInsurerInEffectiveCatalog({
        companyId,
        insurerKey: code,
        authorization,
        tenantId: this.resolveCatalogTenantId(),
      });
      if (hit) {
        return { code: hit.insurerKey, label: hit.nameVi };
      }
      // EFF empty — U65 soft-allow (AC-PLT-SI-INSURER-01c); no MD-alone sole SoT when Nest live.
      return { code, label: code };
    }
    // Legacy unit-test path without Nest catalog provider.
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
    authorization?: string,
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
    const nestCatalog = this.resolveSiInsuranceTypeCatalog();
    if (nestCatalog) {
      const hit = await nestCatalog.assertInsuranceTypeInEffectiveCatalog({
        companyId,
        insuranceType: code,
        authorization,
        tenantId: this.resolveCatalogTenantId(),
      });
      if (hit) {
        return hit.insuranceTypeKey;
      }
      // EFF empty — U65 soft-allow (AC-PLT-SI-INS-01c); no MD-alone sole SoT when Nest live.
      return code;
    }
    // Legacy unit-test path without Nest catalog provider.
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

  private resolvePage(
    value: number | string | undefined,
    fallback: number,
  ): number {
    const parsed = Number(value ?? fallback);
    if (!Number.isFinite(parsed) || parsed < 1) return fallback;
    return Math.trunc(parsed);
  }

  private resolvePageSize(
    value: number | string | undefined,
    fallback: number,
  ): number {
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
    const scopeCompanyId = normalizePayrollListCompanyId(
      authorization,
      requestedCompanyId,
    );
    const scope = resolveHrmListScope(
      authorization,
      scopeCompanyId,
      scopeContext,
    );
    const expandedCompanyIds = expandHrmTextCompanyIds(
      scope,
      authorization,
      requestedCompanyId,
    );
    return { scope, expandedCompanyIds };
  }

  /** J-HRM-01/04 + candidate-only rows (G-CTR-SUBJ-01). */
  private pushContractEmployeeScope(
    filters: string[],
    values: unknown[],
    scope: HrmListScope,
  ): void {
    const idxBefore = filters.length;
    this.pushResolvableEmployeeScope(filters, values, scope, 'employee_id');
    const clause = filters[idxBefore];
    if (clause?.startsWith('employee_id IN')) {
      filters[idxBefore] = `(ec.employee_id IS NULL OR ec.${clause})`;
    }
  }

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
    tableAlias: 'ec' | 'ir' | 'ei',
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
    // PO-HRM-CONTRACT-LEGAL-PRINT-BE-01 — EXPAND registry (ADD-only)
    const expandCols = [
      'signed_at DATE NULL',
      'work_location TEXT NULL',
      'work_location_scope TEXT NULL',
      'archived_at TIMESTAMPTZ NULL',
      'pack_code TEXT NULL',
      'template_id UUID NULL',
      'template_code TEXT NULL',
      'term_type TEXT NULL',
      'job_description_text TEXT NULL',
      'probation_days INT NULL',
      'probation_end DATE NULL',
      'license_class TEXT NULL',
      'driver_license_number TEXT NULL',
      'driver_license_issued_on DATE NULL',
      'driver_license_issued_place TEXT NULL',
      'vehicle_plate TEXT NULL',
      'route_or_region TEXT NULL',
      'contract_name TEXT NULL',
      'work_arrangement TEXT NULL',
      'salary_ratio_percent NUMERIC(6,2) NULL',
      'print_overlay_clause_ids JSONB NULL',
    ];
    for (const col of expandCols) {
      await this.db.query(
        `ALTER TABLE public.employee_contracts ADD COLUMN IF NOT EXISTS ${col};`,
      );
    }
    const subjectCols = [
      'candidate_id UUID NULL',
      'requisition_id UUID NULL',
      'subject_type TEXT NULL',
      'contract_abstract TEXT NULL',
    ];
    for (const col of subjectCols) {
      await this.db.query(
        `ALTER TABLE public.employee_contracts ADD COLUMN IF NOT EXISTS ${col};`,
      );
    }
    await this.db.query(`
      ALTER TABLE public.employee_contracts
      ALTER COLUMN employee_id DROP NOT NULL;
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_employee_contracts_candidate
      ON public.employee_contracts (company_id, candidate_id)
      WHERE candidate_id IS NOT NULL;
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_employee_contracts_employee_status
      ON public.employee_contracts (employee_id, status);
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
    const companyId = resolveHrmPersistCompanyIdText(
      authorization,
      payload.company_id,
    );
    const registryOnly = Boolean(payload.registry_only);
    const aliases = this.normalizeGd1FieldAliases(payload);
    this.validateGd1WizardPersist(payload, registryOnly, aliases);
    const contractTypeCode = await this.assertConContractType(
      companyId,
      payload.contract_type,
    );
    const startDate = resolveContractStartDateForCreate({
      startDate: payload.start_date,
      effectiveFrom: payload.effective_from,
    });
    assertContractEndDateForCreate({
      contractType: contractTypeCode,
      startDate,
      endDate: payload.end_date,
    });
    const endDate = payload.end_date?.trim() ? payload.end_date.trim() : null;
    const subjectBindings = this.resolveCreateSubjectBindings(payload);
    let employeeId: string | null = null;
    let candidateId: string | null = null;
    let requisitionId: string | null = payload.requisition_id?.trim() ?? null;
    if (subjectBindings.subjectType === 'candidate') {
      candidateId = subjectBindings.candidateId;
      const cand = await this.assertCandidateInScope(
        candidateId!,
        companyId,
        authorization,
      );
      if (!requisitionId && cand.requisition_id)
        requisitionId = cand.requisition_id;
    } else {
      employeeId =
        payload.employee_id?.trim() ??
        (await this.resolveEmployeeId(
          payload.employee_name,
          authorization,
          companyId,
        ));
      if (payload.candidate_id?.trim()) {
        throw new ApiException(
          HRM_CTR_SUBJECT_400,
          'candidate_id must be null when subject_type is employee',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    const workArrangementCode = await this.assertWorkArrangementCode(
      companyId,
      aliases.work_arrangement ?? payload.work_arrangement,
      !registryOnly && this.isWizardGd1Persist(payload),
      authorization,
    );
    const resolvedPositionKey = await this.resolveContractPositionKey(
      companyId,
      employeeId,
      payload.position_key,
    );
    // E1-A — Vị trí catalog SoT (AC-E1A-CI-POS-01).
    const pos = await this.assertConPositionKey(
      companyId,
      resolvedPositionKey,
      true,
    );
    const signerPresent = Boolean(
      payload.signer_name?.trim() ||
      payload.signer_position?.trim() ||
      payload.signer_position_key?.trim(),
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
    const licenseClass =
      payload.license_class?.trim() ||
      payload.driver_license_class?.trim() ||
      null;
    const signedAt =
      aliases.signed_at?.trim() ?? payload.signed_at?.trim() ?? null;
    const contractAbstract =
      aliases.contract_abstract?.trim() ??
      payload.contract_abstract?.trim() ??
      null;
    const contractName =
      payload.contract_name?.trim() ||
      (await this.deriveContractDisplayName(
        companyId,
        payload.contract_code,
        contractTypeCode,
      )) ||
      payload.job_description_text?.trim() ||
      null;
    const res = await this.db.query<ContractRow>(
      `INSERT INTO public.employee_contracts
        (id, company_id, employee_id, candidate_id, requisition_id, subject_type,
         contract_code, contract_type, start_date, end_date, status, notes,
         position, position_key, department, department_key, signer_name, signer_position, signer_position_key,
         pack_code, template_id, template_code, term_type, work_location, work_location_scope, job_description_text,
         contract_name, signed_at, work_arrangement, salary_ratio_percent, contract_abstract,
         probation_days, probation_end, license_class, driver_license_number, driver_license_issued_on,
         driver_license_issued_place, vehicle_plate, route_or_region, compensation_package_id)
       VALUES ($1, $2, $3::uuid, $4::uuid, $5::uuid, $6,
               $7, $8, $9::date, $10::date, 'active', $11,
               $12, $13, $14, $15, $16, $17, $18,
               $19, $20::uuid, $21, $22, $23, $24, $25,
               $26, $27::date, $28, $29, $30,
               $31, $32::date, $33, $34, $35::date, $36, $37, $38, $39::uuid)
       RETURNING id, company_id, employee_id, candidate_id, requisition_id, subject_type,
                 contract_code, contract_type, start_date, end_date, status, notes,
                 position, position_key, department, department_key, signer_name, signer_position, signer_position_key,
                 compensation_package_id, pack_code, template_id, template_code, signed_at::text AS signed_at,
                 contract_name, work_arrangement, salary_ratio_percent, contract_abstract, term_type, work_location, work_location_scope,
                 job_description_text, probation_days, probation_end, license_class, driver_license_number,
                 driver_license_issued_on::text AS driver_license_issued_on, driver_license_issued_place, vehicle_plate,
                 route_or_region, archived_at, created_at, updated_at;`,
      [
        randomUUID(),
        companyId,
        employeeId,
        candidateId,
        requisitionId,
        subjectBindings.subjectType,
        payload.contract_code?.trim() ?? null,
        contractTypeCode,
        startDate,
        endDate,
        payload.notes?.trim() ?? null,
        positionSnapshot,
        pos!.code,
        payload.department?.trim() ?? null,
        departmentKey,
        payload.signer_name?.trim() ?? null,
        signerPositionSnapshot,
        signerPos?.code ?? null,
        payload.pack_code?.trim()?.toUpperCase() ?? null,
        payload.template_id ?? null,
        payload.template_code?.trim()?.toUpperCase() ?? null,
        payload.term_type?.trim() ?? null,
        payload.work_location?.trim() ?? null,
        payload.work_location_scope?.trim() ?? null,
        payload.job_description_text?.trim() ?? null,
        contractName,
        signedAt,
        workArrangementCode,
        payload.salary_ratio_percent ?? null,
        contractAbstract,
        payload.probation_days ?? null,
        payload.probation_end ?? null,
        licenseClass,
        payload.driver_license_number?.trim() ?? null,
        payload.driver_license_issued_on ?? null,
        payload.driver_license_issued_place?.trim() ?? null,
        payload.vehicle_plate?.trim() ?? null,
        payload.route_or_region?.trim() ?? null,
        payload.compensation_package_id ?? null,
      ],
    );
    const workLabel = await this.resolveWorkFormLabelVi(
      companyId,
      workArrangementCode,
      authorization,
    );
    return this.enrichContractRegistryRow(res.rows[0], workLabel);
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
    const fallback = await this.db.query<{ id: string }>(
      fallbackSql,
      values.slice(0, filters.length),
    );
    if (!fallback.rows[0]?.id) {
      throw new ApiException(
        'HRM-CON-001',
        'No eligible employee found for contract',
        HttpStatus.BAD_REQUEST,
      );
    }
    return fallback.rows[0].id;
  }

  /**
   * @CODE-MEMORY method · FR-HRM-CI-02 · E3 insurer_key · EMP-BE-02 enrollment SoT
   * SRS bước: Diễn biến #6 Lưu thành công — ghi nhận BH
   * TechSpec: §14.3 ref_srs FR-HRM-CI-02 · API_DESIGN E3 §17 · F-CORE-SI-02
   */
  async createInsuranceRecord(
    payload: CreateInsuranceRecordDto,
    authorization?: string,
  ) {
    await this.ensureSchema();
    await ensureEmployeeInsuranceEnrollmentSchema(this.db);
    const companyId = resolveHrmPersistCompanyIdText(
      authorization,
      payload.company_id,
    );
    const insurer = await this.assertInsurerKey(
      companyId,
      payload.insurer_key,
      true,
      authorization,
    );
    const policyId: string | null = payload.policy_id?.trim() || null;
    if (policyId) {
      await this.assertPolicyInScope(policyId, companyId, authorization, {
        requireActive: false,
      });
    }
    const providerSnapshot = payload.provider?.trim() || insurer!.label;
    const id = randomUUID();
    // ONE enrollment SoT — write employee_insurances (not legacy records as SoT).
    const res = await this.db.query<InsuranceRow>(
      `INSERT INTO public.employee_insurances
        (id, company_id, employee_id, type, provider, policy_number, start_date, end_date,
         contribution, employer_contribution, status, policy_id)
       VALUES ($1::uuid, $2, $3::uuid, 'social', $4, $5, CURRENT_DATE, $6::date, 0, 0, 'active', $7::uuid)
       RETURNING id, company_id, employee_id, provider, policy_number,
                 end_date AS expiry_date, status, policy_id, created_at, updated_at;`,
      [
        id,
        companyId,
        payload.employee_id,
        providerSnapshot,
        payload.policy_number.trim(),
        payload.expiry_date,
        policyId,
      ],
    );
    const row = res.rows[0];
    // Thành công: Diễn biến #6 — khóa BH gắn hồ sơ (enrollment id = actions target).
    return {
      ...row,
      insurer_key: insurer!.code,
      policy_id: policyId,
    };
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
      throw new ApiException(
        HRM_INS_POL_404,
        'Insurance policy not found',
        HttpStatus.NOT_FOUND,
      );
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
         AND archived_at IS NULL
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
    const scopeCompanyId = normalizePayrollListCompanyId(
      authorization,
      query.company_id,
    );
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
    this.pushContractEmployeeScope(filters, values, scope);
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
          ${CONTRACT_REGISTRY_SELECT_SQL}
        FROM public.employee_contracts ec
        LEFT JOIN public.employees e ON e.id = ec.employee_id
        LEFT JOIN public.recruitment_candidates rc ON rc.id = ec.candidate_id
        WHERE ${ecFilters.join(' AND ')}
          AND ec.archived_at IS NULL
          AND (
            (ec.employee_id IS NOT NULL AND e.id IS NOT NULL AND e.archived_at IS NULL)
            OR (ec.candidate_id IS NOT NULL AND ec.employee_id IS NULL)
          )
        ORDER BY ec.created_at DESC;
      `,
      values,
    );
    const total = res.rows.length;
    const data = await this.enrichContractRegistryRows(
      res.rows.slice(offset, offset + pageSize),
      scopeCompanyId,
      authorization,
    );
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
    this.pushContractEmployeeScope(filters, values, scope);
    const ecFilters = this.qualifyContractInsuranceFilters(filters, 'ec');
    const res = await this.db.query<ContractRow>(
      `
        SELECT
          ${CONTRACT_REGISTRY_SELECT_SQL},
          ec.print_overlay_clause_ids
        FROM public.employee_contracts ec
        LEFT JOIN public.employees e ON e.id = ec.employee_id
        LEFT JOIN public.recruitment_candidates rc ON rc.id = ec.candidate_id
        WHERE ${ecFilters.join(' AND ')}
          AND ec.archived_at IS NULL
          AND (
            (ec.employee_id IS NOT NULL AND e.id IS NOT NULL AND e.archived_at IS NULL)
            OR (ec.candidate_id IS NOT NULL AND ec.employee_id IS NULL)
          )
        LIMIT 1;
      `,
      values,
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException(
        'HRM-CON-404',
        'Contract not found',
        HttpStatus.NOT_FOUND,
      );
    }
    const scopeCompanyId = normalizePayrollListCompanyId(
      authorization,
      requestedCompanyId,
    );
    const workLabel = await this.resolveWorkFormLabelVi(
      scopeCompanyId,
      row.work_arrangement,
      authorization,
    );
    const enriched = this.enrichContractRegistryRow(row, workLabel);
    const printSvc = this.resolveContractLegalPrint();
    if (!printSvc) {
      const overlayIds = this.parsePrintOverlayClauseIds(
        row.print_overlay_clause_ids,
      );
      return {
        ...enriched,
        print_overlay_clause_ids: overlayIds.length ? overlayIds : null,
        clause_ids: overlayIds,
        clause_layout: [],
        can_issue: false,
      };
    }
    const layout = await printSvc.resolveContractDetailLayout(
      {
        id: row.id,
        company_id: row.company_id,
        employee_id: row.employee_id,
        template_id: row.template_id,
        template_code: row.template_code,
        pack_code: row.pack_code,
        print_overlay_clause_ids: this.parsePrintOverlayClauseIds(
          row.print_overlay_clause_ids,
        ),
      },
      scopeCompanyId,
      authorization,
      scopeContext,
    );
    return {
      ...enriched,
      ...layout,
    };
  }

  private parsePrintOverlayClauseIds(raw: unknown): string[] {
    if (!raw) return [];
    if (Array.isArray(raw)) {
      return raw.map((x) => String(x)).filter((x) => x.length > 0);
    }
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw) as unknown;
        return this.parsePrintOverlayClauseIds(parsed);
      } catch {
        return [];
      }
    }
    return [];
  }

  private async loadContractScopeRow(
    contractId: string,
  ): Promise<{ company_id: string } | null> {
    const res = await this.db.query<{ company_id: string }>(
      `SELECT company_id::text AS company_id FROM public.employee_contracts
       WHERE id = $1::uuid AND archived_at IS NULL LIMIT 1;`,
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
      new Date(payload.start_date).getTime() >
        new Date(payload.end_date).getTime()
    ) {
      throw new ApiException(
        'HRM-CON-001',
        'start_date must be <= end_date',
        HttpStatus.BAD_REQUEST,
      );
    }
    const scopeCompanyId = normalizePayrollListCompanyId(
      authorization,
      requestedCompanyId,
    );
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
    if (
      payload.signer_position !== undefined &&
      payload.signer_position_key === undefined
    ) {
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
      const pos = await this.assertConPositionKey(
        existing!.company_id,
        payload.position_key,
        true,
      );
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
    const nextDeptKey = hasDeptKey
      ? payload.department_key?.trim() || null
      : null;
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
      nextContractType = await this.assertConContractType(
        existing!.company_id,
        payload.contract_type,
      );
    }
    const aliases = this.normalizeGd1FieldAliases(payload);
    const workArrangementRaw =
      payload.work_arrangement !== undefined
        ? payload.work_arrangement
        : aliases.work_arrangement !== undefined
          ? aliases.work_arrangement
          : undefined;
    let validatedWorkArrangement: string | null | undefined;
    if (workArrangementRaw !== undefined) {
      validatedWorkArrangement = await this.assertWorkArrangementCode(
        existing!.company_id,
        workArrangementRaw,
        false,
        authorization,
      );
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
      throw new ApiException(
        'HRM-CON-404',
        'Contract not found',
        HttpStatus.NOT_FOUND,
      );
    }
    // Print overlay ADD fields (nullable) — BR-CD-F5-01 salary still ignored
    const overlaySets: string[] = [];
    const overlayVals: unknown[] = [];
    const pushOverlay = (col: string, value: unknown) => {
      overlayVals.push(value);
      overlaySets.push(`${col} = $${overlayVals.length}`);
    };
    if (payload.pack_code !== undefined)
      pushOverlay(
        'pack_code',
        payload.pack_code?.trim()?.toUpperCase() ?? null,
      );
    if (payload.template_id !== undefined)
      pushOverlay('template_id', payload.template_id);
    if (payload.template_code !== undefined) {
      pushOverlay(
        'template_code',
        payload.template_code?.trim()?.toUpperCase() ?? null,
      );
    }
    if (payload.term_type !== undefined)
      pushOverlay('term_type', payload.term_type?.trim() ?? null);
    if (payload.work_location !== undefined)
      pushOverlay('work_location', payload.work_location?.trim() ?? null);
    if (payload.work_location_scope !== undefined) {
      pushOverlay(
        'work_location_scope',
        payload.work_location_scope?.trim() ?? null,
      );
    }
    if (payload.job_description_text !== undefined) {
      pushOverlay(
        'job_description_text',
        payload.job_description_text?.trim() ?? null,
      );
    }
    if (payload.probation_days !== undefined)
      pushOverlay('probation_days', payload.probation_days);
    if (payload.probation_end !== undefined)
      pushOverlay('probation_end', payload.probation_end);
    if (
      payload.license_class !== undefined ||
      payload.driver_license_class !== undefined
    ) {
      pushOverlay(
        'license_class',
        payload.license_class?.trim() ||
          payload.driver_license_class?.trim() ||
          null,
      );
    }
    if (payload.driver_license_number !== undefined) {
      pushOverlay(
        'driver_license_number',
        payload.driver_license_number?.trim() ?? null,
      );
    }
    if (payload.driver_license_issued_on !== undefined) {
      pushOverlay(
        'driver_license_issued_on',
        payload.driver_license_issued_on ?? null,
      );
    }
    if (payload.driver_license_issued_place !== undefined) {
      pushOverlay(
        'driver_license_issued_place',
        payload.driver_license_issued_place?.trim() ?? null,
      );
    }
    if (payload.vehicle_plate !== undefined)
      pushOverlay('vehicle_plate', payload.vehicle_plate?.trim() ?? null);
    if (payload.route_or_region !== undefined) {
      pushOverlay('route_or_region', payload.route_or_region?.trim() ?? null);
    }
    if (payload.signed_at !== undefined)
      pushOverlay('signed_at', payload.signed_at ?? null);
    if (payload.contract_name !== undefined) {
      pushOverlay('contract_name', payload.contract_name?.trim() ?? null);
    }
    if (payload.work_arrangement !== undefined) {
      pushOverlay(
        'work_arrangement',
        validatedWorkArrangement !== undefined
          ? (validatedWorkArrangement?.trim() ?? null)
          : (payload.work_arrangement?.trim() ?? null),
      );
    }
    if (payload.salary_ratio_percent !== undefined) {
      pushOverlay('salary_ratio_percent', payload.salary_ratio_percent);
    }
    const aliasesOverlay = this.normalizeGd1FieldAliases(payload);
    if (aliasesOverlay.contract_abstract !== undefined) {
      pushOverlay(
        'contract_abstract',
        aliasesOverlay.contract_abstract?.trim() ?? null,
      );
    }
    if (
      aliasesOverlay.signed_at !== undefined &&
      payload.signed_at === undefined
    ) {
      pushOverlay('signed_at', aliasesOverlay.signed_at ?? null);
    }
    if (
      aliasesOverlay.work_arrangement !== undefined &&
      payload.work_arrangement === undefined
    ) {
      pushOverlay(
        'work_arrangement',
        validatedWorkArrangement !== undefined
          ? (validatedWorkArrangement?.trim() ?? null)
          : (aliasesOverlay.work_arrangement?.trim() ?? null),
      );
    }
    if (payload.subject_type !== undefined)
      pushOverlay('subject_type', payload.subject_type);
    if (payload.candidate_id !== undefined)
      pushOverlay('candidate_id', payload.candidate_id);
    if (payload.requisition_id !== undefined)
      pushOverlay('requisition_id', payload.requisition_id);
    if (overlaySets.length) {
      overlayVals.push(contractId);
      await this.db.query(
        `UPDATE public.employee_contracts SET ${overlaySets.join(', ')}, updated_at = NOW()
         WHERE id = $${overlayVals.length}::uuid;`,
        overlayVals,
      );
      return this.getContractById(
        contractId,
        requestedCompanyId,
        authorization,
      );
    }
    return res.rows[0];
  }

  private parseEmployeeCustomFields(
    raw: Record<string, unknown> | string | null | undefined,
  ): Record<string, unknown> {
    if (!raw) return {};
    if (typeof raw === 'string') {
      try {
        return JSON.parse(raw) as Record<string, unknown>;
      } catch {
        return {};
      }
    }
    return raw;
  }

  private formatDobDisplayVi(value: unknown): string | null {
    const s = String(value ?? '').trim();
    if (!s) return null;
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
      const [y, m, d] = s.slice(0, 10).split('-');
      return `${d}/${m}/${y}`;
    }
    return s;
  }

  private buildCompensationSnapshotFromPackage(
    pkg: CompensationPackageDetail | null,
    cbMasked: boolean,
  ): {
    base_salary_vnd: number | null;
    insurance_salary_vnd: number | null;
    salary_ratio_percent: number | null;
    allowances: Array<{
      code: string;
      label_vi: string;
      amount_vnd: number | null;
    }>;
    cb_masked: boolean;
  } {
    if (!pkg || cbMasked) {
      return {
        base_salary_vnd: null,
        insurance_salary_vnd: null,
        salary_ratio_percent: null,
        allowances: [],
        cb_masked: true,
      };
    }
    const toNum = (v: string | number | undefined | null): number | null => {
      if (v == null || v === '') return null;
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };
    const baseLine = pkg.lines.find((l) => l.line_type === 'base');
    const insuranceLine =
      pkg.lines.find((l) => l.component_code === 'si_base') ??
      pkg.lines.find((l) => l.component_code === 'insurance_base') ??
      baseLine;
    const allowances = pkg.lines
      .filter((l) => l.line_type === 'allowance')
      .map((l) => ({
        code: l.allowance_code ?? l.component_code ?? 'allowance',
        label_vi:
          l.note?.trim() || l.allowance_code || l.component_code || 'Phụ cấp',
        amount_vnd: toNum(l.amount),
      }));
    return {
      base_salary_vnd: toNum(baseLine?.amount),
      insurance_salary_vnd: toNum(insuranceLine?.amount),
      salary_ratio_percent: 100,
      allowances,
      cb_masked: false,
    };
  }

  /** F-CORE-CTR-CREATE-CTX-01 — Step 1 AMIS read-only bundle (C&B + parties). */
  async getContractCreateContext(
    employeeId: string,
    query: ContractCreateContextQueryDto,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    await this.ensureSchema();
    const { scope, expandedCompanyIds } = this.resolveContractsListScope(
      authorization,
      query.company_id,
      scopeContext,
    );
    const filters: string[] = ['e.id = $1::uuid', 'e.archived_at IS NULL'];
    const values: unknown[] = [employeeId];
    const companyFilters: string[] = [];
    pushCompanyIdFilter(companyFilters, values, expandedCompanyIds);
    for (const clause of companyFilters) {
      filters.push(clause.replace(/\bcompany_id\b/, 'e.company_id'));
    }
    this.pushResolvableEmployeeScope(filters, values, scope, 'e.id');
    const empRes = await this.db.query<{
      id: string;
      company_id: string;
      full_name: string;
      employee_code: string;
      custom_fields: Record<string, unknown> | string | null;
      signer_name: string | null;
      signer_position: string | null;
      signer_position_key: string | null;
    }>(
      `SELECT e.id, e.company_id::text AS company_id, e.full_name, e.employee_code, e.custom_fields,
              ec.signer_name, ec.signer_position, ec.signer_position_key
       FROM public.employees e
       LEFT JOIN LATERAL (
         SELECT signer_name, signer_position, signer_position_key
         FROM public.employee_contracts
         WHERE employee_id = e.id AND archived_at IS NULL AND signer_name IS NOT NULL
         ORDER BY created_at DESC LIMIT 1
       ) ec ON TRUE
       WHERE ${filters.join(' AND ')}
       LIMIT 1;`,
      values,
    );
    const emp = empRes.rows[0];
    if (!emp) {
      throw new ApiException(
        'HRM-CON-404',
        'Employee not found in scope',
        HttpStatus.NOT_FOUND,
      );
    }
    assertResourceInHrmScope(
      {
        company_id: emp.company_id,
        custom_fields: this.parseEmployeeCustomFields(emp.custom_fields),
      },
      scope,
      {
        notFoundCode: 'HRM-CON-404',
        mismatchCode: 'HRM-CON-409',
      },
    );
    const cf = this.parseEmployeeCustomFields(emp.custom_fields);
    let cbMasked = false;
    let activePkg: CompensationPackageDetail | null = null;
    if (this.employeeCompensation) {
      try {
        activePkg = await this.employeeCompensation.getActivePackage(
          { company_id: query.company_id, employee_id: employeeId },
          authorization,
          scopeContext,
        );
      } catch (err: unknown) {
        const e = err as ApiException & { code?: string };
        if (
          e?.code === 'HRM-CORE-CB-AUTHZ-403' ||
          e?.code === 'HRM-CORE-CB-403'
        ) {
          cbMasked = true;
        } else {
          throw err;
        }
      }
    }
    const compensation_snapshot = this.buildCompensationSnapshotFromPackage(
      activePkg,
      cbMasked,
    );
    const unitLabels: Record<string, string> = {
      holding: 'Công ty CP Tập đoàn Xe Việt Nam',
      main: 'Công ty CP Tập đoàn Xe Việt Nam',
    };
    const unitLabel = unitLabels[emp.company_id] ?? emp.company_id;
    return {
      employee_party_b: {
        full_name: emp.full_name,
        employee_code: emp.employee_code,
        id_number: (cf.id_number as string) ?? (cf.cccd as string) ?? null,
        phone: (cf.phone as string) ?? (cf.mobile as string) ?? null,
        dob_display: this.formatDobDisplayVi(cf.date_of_birth ?? cf.dob),
        email: (cf.email as string) ?? null,
        residence_address:
          (cf.address as string) ?? (cf.residence_address as string) ?? null,
      },
      compensation_snapshot,
      employer_party_a: {
        legal_name: unitLabel,
        unit_label: unitLabel,
      },
      suggested_signatory: emp.signer_name
        ? {
            signer_name: emp.signer_name,
            signer_position: emp.signer_position,
            signer_position_key: emp.signer_position_key,
          }
        : null,
      cb_masked: cbMasked,
    };
  }

  async deleteContract(
    contractId: string,
    requestedCompanyId: string,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const scopeCompanyId = normalizePayrollListCompanyId(
      authorization,
      requestedCompanyId,
    );
    const scope = resolveHrmListScope(authorization, scopeCompanyId);
    const existing = await this.loadContractScopeRow(contractId);
    assertResourceInHrmScope(existing, scope, {
      notFoundCode: 'HRM-CON-404',
      mismatchCode: 'HRM-CON-409',
    });
    const filters: string[] = ['id = $1::uuid'];
    const values: unknown[] = [contractId];
    pushCompanyIdFilter(
      filters,
      values,
      expandHrmTextCompanyIds(scope, authorization, requestedCompanyId),
    );
    const res = await this.db.query<{ id: string }>(
      `UPDATE public.employee_contracts
       SET archived_at = NOW(), updated_at = NOW()
       WHERE ${filters.join(' AND ')} AND archived_at IS NULL
       RETURNING id;`,
      values,
    );
    if (!res.rows[0]) {
      throw new ApiException(
        'HRM-CON-404',
        'Contract not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return { id: contractId };
  }

  async listExpiringInsurance(
    query: ListExpiringQueryDto,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const { scope, expandedCompanyIds } = this.resolveContractsListScope(
      authorization,
      query.company_id,
    );
    await bridgeLegacyInsuranceRecordsToEnrollments(
      this.db,
      expandedCompanyIds,
    );
    const days = query.days ?? 30;
    const filters: string[] = ['archived_at IS NULL'];
    const values: unknown[] = [];
    pushCompanyIdFilter(filters, values, expandedCompanyIds);
    this.pushResolvableEmployeeScope(filters, values, scope, 'employee_id');
    values.push(days);
    const res = await this.db.query<InsuranceRow>(
      `SELECT id, company_id, employee_id, provider, policy_number,
              end_date AS expiry_date, status, created_at, updated_at
       FROM public.employee_insurances
       WHERE ${filters.join(' AND ')}
         AND end_date IS NOT NULL
         AND end_date <= (CURRENT_DATE + ($${values.length}::text || ' days')::interval)::date
       ORDER BY end_date ASC;`,
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
      enrollment_id: row.id,
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
    await bridgeLegacyInsuranceRecordsToEnrollments(
      this.db,
      expandedCompanyIds,
    );
    const page = this.resolvePage(query.page, 1);
    const pageSize = this.resolvePageSize(query.page_size, 20);
    const offset = (page - 1) * pageSize;
    const filters: string[] = ['ei.archived_at IS NULL'];
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
    const eiFilters = this.qualifyContractInsuranceFilters(filters, 'ei');
    const res = await this.db.query<
      InsuranceRow & {
        employee_name?: string | null;
        employee_code?: string | null;
        department?: string | null;
      }
    >(
      `
        SELECT
          ei.id,
          ei.company_id,
          ei.employee_id,
          ei.provider,
          ei.policy_number,
          ei.end_date AS expiry_date,
          ei.status,
          ei.policy_id,
          ei.created_at,
          ei.updated_at,
          e.full_name AS employee_name,
          e.employee_code AS employee_code,
          COALESCE(NULLIF(TRIM(e.custom_fields->>'department'), ''), e.job_title_key) AS department
        FROM public.employee_insurances ei
        LEFT JOIN public.employees e ON e.id = ei.employee_id
        WHERE ${eiFilters.join(' AND ')}
          AND e.id IS NOT NULL
          AND e.archived_at IS NULL
        ORDER BY ei.created_at DESC;
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

  async createInsurancePolicy(
    payload: CreateInsurancePolicyDto,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const companyId = resolveHrmPersistCompanyIdText(
      authorization,
      payload.company_id,
    );
    const insurer = await this.assertInsurerKey(
      companyId,
      payload.insurer_key,
      true,
      authorization,
    );
    const insuranceType = await this.assertInsuranceTypeKey(
      companyId,
      payload.insurance_type,
      true,
      authorization,
    );
    const effective = payload.effective_date;
    const expiry = payload.expiry_date?.trim() || null;
    if (expiry && new Date(effective).getTime() > new Date(expiry).getTime()) {
      throw new ApiException(
        HRM_INS_POL_001,
        'expiry_date must be >= effective_date',
        HttpStatus.BAD_REQUEST,
      );
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
        throw new ApiException(
          HRM_INS_POL_002,
          'Duplicate policy_code for company',
          HttpStatus.CONFLICT,
        );
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
    return row;
  }

  async updateInsurancePolicy(
    policyId: string,
    payload: UpdateInsurancePolicyDto,
    requestedCompanyId: string,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const current = await this.getInsurancePolicyById(
      policyId,
      requestedCompanyId,
      authorization,
    );
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
        ? await this.assertInsurerKey(
            current.company_id,
            payload.insurer_key,
            true,
            authorization,
          )
        : null;
    const insuranceType =
      payload.insurance_type !== undefined
        ? await this.assertInsuranceTypeKey(
            current.company_id,
            payload.insurance_type,
            true,
            authorization,
          )
        : null;
    const effective = payload.effective_date ?? current.effective_date;
    const expiry =
      payload.expiry_date === undefined
        ? current.expiry_date
        : payload.expiry_date === null
          ? null
          : payload.expiry_date;
    if (expiry && new Date(effective).getTime() > new Date(expiry).getTime()) {
      throw new ApiException(
        HRM_INS_POL_001,
        'expiry_date must be >= effective_date',
        HttpStatus.BAD_REQUEST,
      );
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
        throw new ApiException(
          HRM_INS_POL_002,
          'Duplicate policy_code for company',
          HttpStatus.CONFLICT,
        );
      }
      throw err;
    }
  }

  async deleteInsurancePolicy(
    policyId: string,
    requestedCompanyId: string,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const current = await this.getInsurancePolicyById(
      policyId,
      requestedCompanyId,
      authorization,
    );
    if (current.status !== 'draft' && current.status !== 'cancelled') {
      throw new ApiException(
        HRM_INS_POL_DEL_BLOCK,
        'Only draft or cancelled policies can be deleted',
        HttpStatus.CONFLICT,
      );
    }
    const participants = await this.db
      .query<{ total: string }>(
        `SELECT COUNT(*)::text AS total FROM public.hrm_insurance_policy_participants
       WHERE policy_id = $1::uuid;`,
        [policyId],
      )
      .catch(() => ({ rows: [{ total: '0' }] }));
    if (Number(participants.rows[0]?.total ?? 0) > 0) {
      throw new ApiException(
        HRM_INS_POL_DEL_BLOCK,
        'Policy has participants — cancel/end enrollments first',
        HttpStatus.CONFLICT,
      );
    }
    await this.db.query(
      `DELETE FROM public.hrm_insurance_policies WHERE id = $1::uuid;`,
      [policyId],
    );
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
    await bridgeLegacyInsuranceRecordsToEnrollments(
      this.db,
      expandedCompanyIds,
    );
    const filters: string[] = ['ei.id = $1::uuid', 'ei.archived_at IS NULL'];
    const values: unknown[] = [recordId];
    pushCompanyIdFilter(filters, values, expandedCompanyIds);
    const eiFilters = this.qualifyContractInsuranceFilters(filters, 'ei');
    const res = await this.db.query<InsuranceRow>(
      `SELECT ei.id, ei.company_id, ei.employee_id, ei.provider, ei.policy_number,
              ei.end_date AS expiry_date, ei.status,
              ei.policy_id, ei.created_at, ei.updated_at
       FROM public.employee_insurances ei
       WHERE ${eiFilters.join(' AND ')} LIMIT 1;`,
      values,
    );
    const row = res.rows[0];
    assertResourceInHrmScope(row, scope, {
      notFoundCode: 'HRM-CON-404',
      mismatchCode: 'HRM-CON-409',
    });
    return this.mapInsuranceListItem(row);
  }

  async updateInsuranceRecord(
    recordId: string,
    payload: UpdateInsuranceRecordDto,
    requestedCompanyId: string,
    authorization?: string,
  ) {
    await this.ensureSchema();
    const current = await this.getInsuranceRecordById(
      recordId,
      requestedCompanyId,
      authorization,
    );
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
        ? await this.assertInsurerKey(
            String(current.company_id),
            payload.insurer_key,
            true,
            authorization,
          )
        : null;
    if (payload.policy_id) {
      await this.assertPolicyInScope(
        payload.policy_id,
        requestedCompanyId,
        authorization,
        {
          requireActive: false,
        },
      );
    }
    const providerSnapshot =
      payload.provider?.trim() || (insurer ? insurer.label : null);
    const res = await this.db.query<InsuranceRow>(
      `UPDATE public.employee_insurances
       SET provider = COALESCE($2, provider),
           policy_number = COALESCE($3, policy_number),
           end_date = COALESCE($4::date, end_date),
           status = COALESCE($5, status),
           policy_id = COALESCE($6::uuid, policy_id),
           updated_at = NOW()
       WHERE id = $1::uuid AND archived_at IS NULL
       RETURNING id, company_id, employee_id, provider, policy_number,
                 end_date AS expiry_date, status, policy_id, created_at, updated_at;`,
      [
        recordId,
        providerSnapshot,
        payload.policy_number?.trim() ?? null,
        payload.expiry_date ?? null,
        payload.status ?? null,
        payload.policy_id ?? null,
      ],
    );
    return this.mapInsuranceListItem({
      ...res.rows[0],
      insurer_key: insurer?.code ?? current.insurer_key ?? null,
    });
  }
}
