/**
 * @CODE-MEMORY
 * Screen:     HRM → Hồ sơ nhân viên (service)
 * UC:         UC-HRM-20 · UC-HRM-21 · HRM-EM-01
 * BR:         BR-HRM-SCOPE-LIST · ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · BR-EMP-COL-01
 * SRS:        docs/client-delivery/hrm/SRS_HRM_KHACH.md §3.1 · FR-HRM-EM-01
 * SRS bước:   Diễn biến #5 Trùng mã NV · #7 Lưu thành công · #8 Tải lại (list/get/cursor)
 * TechSpec:   docs/hrm/TECHSPEC.md §14.1 (ref_srs: FR-HRM-EM-01) · ADR-HRM-SCALE §5.4
 * Purpose:    CRUD + list/summary theo scope; keyset cursor tránh storm OFFSET khi export.
 * WorkItem:   BE-HRM-CODE-MEMORY-SRS-STEP-01
 * Coded:      2026-07-21
 *
 * Callers:
 *   - employees.controller.ts → createEmployee / listEmployees / getEmployeesSummary / …
 *
 * Callees:
 *   - resolveHrmListScope → pushEmployeeListScopeFilters → public.employees
 *   - encode/decodeEmployeeListCursor → keyset WHERE
 *   - resolveCompanyDisplayNameVi → company_display_name (ĐVTV/LE SoT; never Khối)
 *
 * FE-Actions:
 *   | Thao tác          | Handler             | Lib / RPC                |
 *   |-------------------|---------------------|--------------------------|
 *   | Lưu hồ sơ         | createEmployee      | INSERT employees         |
 *   | Trang danh sách   | listEmployees       | GET /employees?page=     |
 *   | Export walk       | listEmployees+cursor| GET /employees?cursor=   |
 *
 * BE-Chain:
 *   createEmployee → INSERT employees (23505 → HRM-EMP-DUPLICATE)
 *   listEmployees → OFFSET hoặc keyset → employees
 *
 * Impact:      Scope lệch → 404/empty; cursor lỗi → 400; trùng mã → mất Diễn biến #5
 * must_keep:   leave/recruit/F5; OFFSET khi không cursor; empty list trung thực
 * SOLID:       Service domain; cursor codec tách file
 * LastVerified: be-hrm-co-emp-count-01.spec.ts · p1-hrm-perf-be-01.spec.ts · cd-fb-05-perf-be.spec.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-22 BE-HRM-EMP-COMPANY-COL-01
 * change_mode: ADD
 * What: mapEmployee / list/get expose company_display_name via resolveCompanyDisplayNameVi (LE SoT)
 * Why: BA-HRM-EMP-COMPANY-COL-01 AC-EMP-COL-01..03 — cột «Thông tin công ty» ≠ Khối registry
 * must_keep: scope_parity; cursor; slug map sync stays in OperatingUnitsService (AC-EMP-COL-04)
 *
 * @CODE-MEMORY-CHANGE 2026-07-21
 * WorkItem: BE-HRM-CODE-MEMORY-SRS-STEP-01
 * change_mode: ADD
 * What: Map Diễn biến FR-HRM-EM-01 + TechSpec §14.1; comment nhánh then (không đổi logic)
 * Why: Sponsor lock CODE-MEMORY ↔ SRS bước
 * must_keep: cursor ISO · summary · duplicate 409
 *
 * @CODE-MEMORY-CHANGE 2026-07-19
 * WorkItem: CD-FB-05-PERF-BE
 * What: Additive keyset cursor on listEmployees (next_cursor); summary unchanged
 * Why: CD-FB-03 audit — stop ~12 OFFSET page storm on export/full walk
 * SRS/BR: ADR-HRM-SCALE §5.4 Cursor stretch promoted for CD-FB-05
 *
 * @CODE-MEMORY-CHANGE 2026-07-20
 * WorkItem: D-C-P1-HRM-PERF-02-CURSOR-TZ
 * What: ISO-8601 cursor encode (no Date.toString); SQL created_at_cursor (US) for keyset precision
 * Why: QA FAIL page-2+ 500 gmt+0700; JS Date ms truncation skipped rows (~200/1108 walk)
 * SRS/BR: ADR-HRM-SCALE §5.4 — cursor must cast to timestamptz and not skip same-ms rows
 *
 * @CODE-MEMORY-CHANGE 2026-07-23
 * WorkItem: D-HRM-SETTINGS-MD-CRUD-BE-01
 * change_mode: ADD
 * What: create/update validate job_title_key ∈ job_titles when set (VAL-SET-MD-01 / FR-HRM-SC-POS-01)
 * must_keep: company_display_name LE SoT; cursor; scope_parity; no Khối
 *
 * @CODE-MEMORY-CHANGE 2026-07-25
 * WorkItem: D-HRM-SETTINGS-MD-COMPILE-BE-01
 * change_mode: UPGRADE
 * What: assertJobTitleKeyInCatalog reads scopeContext.tenantId (HrmListScopeContext), not HrmListScope fields
 * Why: nest compile TS2339 blocked :28001 / Settings master-data QA
 * must_keep: company_display_name LE SoT; list scope RBAC ladder; catalog assert when key set
 *
 * @CODE-MEMORY-CHANGE 2026-07-27
 * WorkItem: D-HRM-CO-EMP-COUNT-BE-01
 * change_mode: ADD
 * What: GET /employees/summary → by_company[{company_id slug, total, active_count, …}] same resolveHrmListScope
 * Why: Company Management employee_count=0 — FE needs per-slug Plane B counts (not XBOS LE UUID)
 * must_keep: scope_parity list↔summary; rollup main zero-fills 5 slugs; no legal-entity UUID keys
 *
 * @CODE-MEMORY-CHANGE 2026-08-03
 * WorkItem: W1-B-02-EMP
 * change_mode: UPGRADE
 * What: list/get/create/patch/archive/restore expose display-ready status_label / department /
 *       job_title_label / display_name / phone_number (OS 28 — FE không join name/dept);
 *       updateEmployee nhận scopeContext — parity list↔get-by-id↔patch (FR-UC-HRM-21)
 * Why: API_CONTRACT_NEW §3 · FR-UC-H01 · FR-UC-HRM-21 · OS 28
 * must_keep: company_display_name LE SoT; cursor; pushEmployeeListScopeFilters list↔get; no raw key label
 *
 * @CODE-MEMORY-CHANGE 2026-08-03
 * WorkItem: R-SPINE-MGR-HIER-01-BE
 * change_mode: ADD
 * What: create/update write manager_id (DTO + assertManagerAssignment: ≠self, same company, no cycle, null clear)
 * Why: Option B UC-H01 product path — J-MOB-05 L1 direct_manager; U65 cấm seed manager_id
 * SRS/TechSpec: FR-UC-H01 · FR-UC-H03 · TECH_SPEC_NEW §4.4 · DB_DESIGN employees.manager_id
 * must_keep: leave list SQL manager_employee_id filter; soft-delete; scope parity list↔get↔patch
 *
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-E2E-LINK-EMP-BE-01
 * change_mode: ADD
 * What: GET hire-readiness (F-CORE-HTP-05) — active contract same company_id + date window; blockers no 500
 * Why: REC-07 AC-HTP-05 · DB-01 CONFIRMED employee_contracts.status=active
 * must_keep: scope_parity getEmployeeById; U65 no seed; honesty UAT flags false
 *
 * @CODE-MEMORY-CHANGE 2026-08-08 PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-CUSTOM-FIELD-BE-01
 * change_mode: ADD
 * What: F-EMP-CF-CNS-01 — create/update assertEmpCustomFieldsAgainstEffectiveCatalog when EFF>0
 *       → HRM-EMP-CUSTOM-FIELD-KEY; EFF=0 soft skip (AC-01d); no Nest emp_custom_field; no token register
 * Why: BA-01 AC-PLT-EMP-CUSTOM-01c · CNS-GAP EMPCFCNSGAP-MSJCUBJB FAIL_GAP invent 200
 * must_keep: F-EMP-TOK-03 · Settings extension admin CREATE · EXT-04c value≠register · ESS phone ·
 *            scope_parity list↔get↔patch · personnel/e2e ready=false · C-SLICE-≠-MODULE
 *
 * @CODE-MEMORY-CHANGE 2026-08-08 PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-BE-01
 * change_mode: ADD
 * What: DROP closed chk_employees_status; create/update status ∈ F-EMP-CAT-ST-EFF → HRM-EMP-STATUS-KEY;
 *       status_reason_key ∈ STR-EFF when required → HRM-EMP-STATUS-REASON-KEY; status_label from catalog
 * Why: DATA/BA/SA Option B CONFIRMED · AC-PLT-EMP-STATUS-01b/e · BR-PLT-05 DROP CHECK
 * must_keep: DOC/ET · EMP-CUSTOM CNS · MergeToken EXT · ATT/SI/CTR · U65 no seed · personnel ready=false
 *
 * @CODE-MEMORY-CHANGE 2026-08-08 PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-BE-01
 * change_mode: FIX
 * What: assertJobTitleKeyInCatalog → HRM-EMP-POSITION-KEY when EFF>0 invent; EFF=0 soft skip (AC-01c);
 *       EmployeesModule imports SettingsCatalogsModule so DI is live (closes Optional no-op R-PLT-EMP-POS-BE-01)
 * Why: QA FAIL invent PATCH 200 · BA AC-PLT-EMP-01b · SA Option A LOCK · F-EMP-POS-CNS-02
 * must_keep: Option A job_titles SoT · no Nest emp_position · HRM-CON-POS-KEY / WH-PICK retain ·
 *            EMP DOC/ET·STATUS·CUSTOM·EXT seals · U65 no seed · personnel ready=false
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-CORE-01-CLUSTER-BE-01
 * change_mode: UPGRADE
 * What: F-CORE-EMP-01 mapPublicEmployee strip DATA §4.3 · CB deny → HRM-CORE-CB-403 (no silent strip);
 *       soft candidate_id display; summary gate include=compensation_summary (VAL-D-06 option c);
 *       update/archive load raw row so filtered GET cannot wipe legacy CF on write
 * Why: API-01 CONFIRMED · UC-BP-CORE-01 O1–O3 · BR-BP-SEC-01 · U19 list=get=patch=deps
 * must_keep: HTP-05 · REC-07 soft candidate_id · CF/STATUS consumers · Nest /employees only ·
 *            no Nest /core dual · no CORE-02 write · no seed · honesty false · hire ≠ CORE DONE
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-CORE-07-CLUSTER-BE-01
 * change_mode: ADD
 * What: F-CORE-ACT-01 POST …/activate + gated PATCH status→active — GATE from LIVE CHK+DOC flags
 *       → 409 HRM-EMP-ACT-CHECKLIST-INCOMPLETE · EFF dd/MM/yyyy display activated_at (HOLD invent col)
 *       · emit employee.activated · display-ready statusLabelVi/checklist_complete/blocking_items/can_activate
 * Why: API-01 CONFIRMED · UC-BP-CORE-07 · BR-BP-LC-02 · U19 list=get=activate
 * must_keep: CORE-06 soft≠DONE · CORE-05 AST/BB/serial/DELETE-FORBIDDEN · CORE-03 DOC/ET/CHK ·
 *            CORE-02b · CORE-09d..01 · Nest /core DENY · checklist≠DONE · free PATCH≠DONE ·
 *            OUT invent PAY/ATT enroll/completeness table/typed activated_at · U65 no seed · honesty false
 */
import { HttpStatus, Injectable, OnModuleInit, Optional } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import {
  assertResourceInHrmScope,
  HrmListScope,
  HrmListScopeContext,
  MASTER_TENANT_ID,
  pushEmployeeListScopeFilters,
  resolveHrmListScope,
  resolveHrmPersistCompanyIdText,
  resolveHrmCompanyUuidForSlug,
} from '../common/hrm-list-scope';
import { HrmDbService } from '../db/hrm-db.service';
import { resolveEmployeeCompanyDisplayNameVi } from '../operating-units/hrm-company-display-name';
import { HrmRealtimeService } from '../realtime/hrm-realtime.service';
import { SettingsCatalogsService } from '../settings-catalogs/settings-catalogs.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { ActivateEmployeeDto } from './dto/activate-employee.dto';
import { EmployeeSummaryQueryDto } from './dto/employee-summary.query.dto';
import { GetEmployeeQueryDto } from './dto/get-employee.query.dto';
import { ListEmployeesQueryDto } from './dto/list-employees.query.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import {
  decodeEmployeeListCursor,
  encodeEmployeeListCursorFromRow,
} from './employee-list-cursor';
import {
  buildEmployeeSummaryByCompany,
  buildEmployeeSummaryByTenant,
  buildSalaryRangesFromCounts,
  EMPLOYEE_SALARY_NUM_SQL,
} from './employee-summary';
import type { EmployeeSummaryResult } from './employee-summary.types';
import {
  directoryItemPassesAttendanceFilter,
  isDirectoryView,
  mapDirectoryDetail,
  mapDirectoryListItem,
  resolveDirectorySearchTerm,
  todayIsoInHoChiMinh,
} from './employee-directory';
import type { EmployeeRow } from './employee-directory.types';
import { buildEmployeeDisplayReadyFields } from './employee-display';
import { assertManagerAssignment } from './employee-manager.validation';
import {
  assertEmployeeUpdateAllowed,
  isSelfEmployeeTarget,
  mergeSelfEssCustomFields,
} from './employee-update-policy';
import { assertEmpCustomFieldsAgainstEffectiveCatalog } from './emp-custom-field-consumer-assert';
import { EmpEmploymentStatusService } from './emp-employment-status.service';
import { EmpStatusReasonService } from './emp-status-reason.service';
import {
  EmpDocumentChecklistService,
  type EmpActivationBlockingItem,
  type EmpActivationGateResult,
} from './emp-document-checklist.service';
import {
  assertNoCorePublicCbDenyKeys,
  filterPublicCustomFields,
  wantsCompensationSummary,
} from './employee-public-ring';
import {
  EMP_ACT_EFFECTIVE_DATE_RE,
  EMP_STATUS_ACTIVE,
  EMP_STATUS_PENDING_DOCS,
  EMPLOYEE_ACTIVATED_EVENT,
  HRM_EMP_ACT_400,
  HRM_EMP_ACT_CHECKLIST_INCOMPLETE,
  HRM_EMP_ACT_ILLEGAL_TRANSITION,
} from './emp-activate.constants';

/**
 * Platform invent taxonomy for employee job_title_key when EFF job_titles > 0 (AC-PLT-EMP-01b).
 * BA maps ≡ WH surface alias `HRM-WH-PICK-REQUIRED` (same invent class — not dual semantics).
 */
export const HRM_EMP_POSITION_KEY = 'HRM-EMP-POSITION-KEY';

/** BA alias — WH retain code; same invent/required class as HRM_EMP_POSITION_KEY. */
export const HRM_EMP_POSITION_KEY_WH_ALIAS = 'HRM-WH-PICK-REQUIRED';

/** CORE-07 spine labels (DATA-01) — catalog label wins when present. */
const CORE07_STATUS_LABEL_VI: Record<string, string> = {
  pending_docs: 'Chờ hoàn thiện',
  active: 'Hoạt động',
};

@Injectable()
export class EmployeesService implements OnModuleInit {
  constructor(
    private readonly db: HrmDbService,
    @Optional() private readonly settingsCatalogs?: SettingsCatalogsService,
    @Optional()
    private readonly empEmploymentStatus?: EmpEmploymentStatusService,
    @Optional() private readonly empStatusReason?: EmpStatusReasonService,
    @Optional()
    private readonly empDocumentChecklist?: EmpDocumentChecklistService,
    @Optional() private readonly realtime?: HrmRealtimeService,
  ) {}

  private async assertJobTitleKeyInCatalog(
    companyId: string,
    jobTitleKey: string | null | undefined,
    scopeContext?: HrmListScopeContext,
  ) {
    const code = jobTitleKey?.trim();
    if (!code || !this.settingsCatalogs) return;
    // HrmListScopeContext = { tenantId? } from toHrmListScopeContext — not HrmListScope.
    const tenantId = scopeContext?.tenantId?.trim() || MASTER_TENANT_ID;
    // AC-PLT-EMP-01c — EFF=0 soft skip (no seed); invent hard-block only when EFF>0 (01b).
    const items = await this.settingsCatalogs.getEffectiveItemsForKey(
      tenantId,
      companyId,
      'job_titles',
    );
    const activeCount = items.filter((i) => i.status === 'active').length;
    if (activeCount === 0) return;
    await this.settingsCatalogs.assertCodeInEffectiveCatalog({
      tenantId,
      companyId,
      catalogKey: 'job_titles',
      code,
      errorCode: HRM_EMP_POSITION_KEY,
      errorMessage: `job_title_key '${code}' is not in job_titles catalog (free-text SoT forbidden)`,
    });
  }

  async onModuleInit() {
    await this.ensureSchema();
  }

  private async ensureSchema() {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.employees (
        id UUID PRIMARY KEY,
        company_id TEXT NOT NULL,
        employee_code TEXT NOT NULL,
        email TEXT NOT NULL,
        full_name TEXT NOT NULL,
        job_title_key TEXT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        hired_at DATE NULL,
        archived_at TIMESTAMPTZ NULL,
        custom_fields JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    // DATA-01 / L-EMP-ST-04 — DROP closed product CHECK (active|inactive); status = open catalog key.
    await this.db.query(`
      ALTER TABLE public.employees DROP CONSTRAINT IF EXISTS chk_employees_status;
    `);
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_employees_company_code
      ON public.employees (company_id, employee_code);
    `);
    await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_employees_company_email_active
      ON public.employees (company_id, lower(email))
      WHERE archived_at IS NULL;
    `);
    // ADR-HRM-SCALE-1000-USERS §5.4 / P1-HRM-SCALE-BE-W1 — list ORDER BY created_at, id
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_employees_company_archived_created_id
      ON public.employees (company_id, archived_at, created_at DESC, id DESC);
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_employees_company_archived_name_code_id
      ON public.employees (company_id, archived_at, full_name ASC, employee_code ASC, id ASC);
    `);
    // P1-HRM-SCALE-BE-W2 — expression index matches master-tenant partition predicate
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_employees_tenant_co_arch_created_id
      ON public.employees (
        (COALESCE(NULLIF(TRIM(custom_fields->>'tenant_id'), ''), 'xevn')),
        company_id,
        archived_at,
        created_at DESC,
        id DESC
      );
    `);
    await this.db.query(
      `DROP INDEX IF EXISTS public.idx_employees_company_archived;`,
    );
    await this.db.query(
      `DROP INDEX IF EXISTS public.idx_employees_active_created_id;`,
    );
    await this.db.query(`
      ALTER TABLE public.employees
      ADD COLUMN IF NOT EXISTS custom_fields JSONB NOT NULL DEFAULT '{}'::jsonb;
    `);
    await this.db.query(`
      ALTER TABLE public.employees
      ALTER COLUMN company_id TYPE TEXT USING company_id::text;
    `);
    await this.db.query(`
      ALTER TABLE public.employees
      ADD COLUMN IF NOT EXISTS manager_id UUID NULL;
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_employees_manager
      ON public.employees (manager_id) WHERE manager_id IS NOT NULL;
    `);
    await this.db.query(`
      ALTER TABLE public.employees
      ADD COLUMN IF NOT EXISTS avatar_url TEXT NULL;
    `);
    // PO-HRM-MVP-GD1-REC-07-CLUSTER-BE-01 — soft reverse hire link (DATA-01 §5.1 · no hard FK).
    await this.db.query(`
      ALTER TABLE public.employees
      ADD COLUMN IF NOT EXISTS candidate_id UUID NULL;
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_employees_candidate_id_active
      ON public.employees (candidate_id)
      WHERE candidate_id IS NOT NULL AND archived_at IS NULL;
    `);
    await this.ensureSeedData();
  }

  private async ensureSeedData() {
    await this.db.query(
      `DELETE FROM public.employees WHERE email IN ('ceo@xe.vn', 'hr.manager@xe.vn', 'ops.manager@xe.vn')`,
    );
  }

  /**
   * F-CORE-EMP-01 — public-only serializer (DATA §4 allow + strip §4.3).
   * DENY raw custom_fields dump of salary/bank/tax/SI (AC-CORE-PUB-01/02 · O2).
   */
  private mapEmployee(
    row: EmployeeRow,
    options?: {
      statusLabelLookup?: Map<string, string>;
      activationGate?: EmpActivationGateResult | null;
      activatedAtDisplay?: string | null;
      events?: Array<Record<string, unknown>>;
    },
  ) {
    return this.mapPublicEmployee(row, options);
  }

  private resolveCore07StatusLabelVi(
    status: string | null | undefined,
    catalogLabel?: string | null,
  ): string {
    const fromCatalog = String(catalogLabel ?? '').trim();
    if (fromCatalog) return fromCatalog;
    const key = String(status ?? '')
      .trim()
      .replace(/-/g, '_')
      .toLowerCase();
    if (CORE07_STATUS_LABEL_VI[key]) return CORE07_STATUS_LABEL_VI[key];
    return key ? key : '—';
  }

  /**
   * R-CORE-07-EFF-01 — parse dd/MM/yyyy · reject invalid · DENY epoch junk display.
   * Returns locale string for display (HOLD invent typed activated_at col).
   */
  private assertEffectiveDateDdMmYyyy(raw: string | undefined | null): string {
    const text = String(raw ?? '').trim();
    if (!text) {
      throw new ApiException(
        HRM_EMP_ACT_400,
        'effective_date is required (dd/MM/yyyy)',
        HttpStatus.BAD_REQUEST,
      );
    }
    const m = EMP_ACT_EFFECTIVE_DATE_RE.exec(text);
    if (!m) {
      throw new ApiException(
        HRM_EMP_ACT_400,
        'effective_date must be dd/MM/yyyy',
        HttpStatus.BAD_REQUEST,
        { effective_date: text },
      );
    }
    const day = Number(m[1]);
    const month = Number(m[2]);
    const year = Number(m[3]);
    if (
      year < 1900 ||
      year > 2100 ||
      month < 1 ||
      month > 12 ||
      day < 1 ||
      day > 31
    ) {
      throw new ApiException(
        HRM_EMP_ACT_400,
        'effective_date is out of range',
        HttpStatus.BAD_REQUEST,
        { effective_date: text },
      );
    }
    const dt = new Date(Date.UTC(year, month - 1, day));
    if (
      dt.getUTCFullYear() !== year ||
      dt.getUTCMonth() !== month - 1 ||
      dt.getUTCDate() !== day
    ) {
      throw new ApiException(
        HRM_EMP_ACT_400,
        'effective_date is not a valid calendar date',
        HttpStatus.BAD_REQUEST,
        { effective_date: text },
      );
    }
    // Display = request locale (never epoch / ISO junk).
    return `${m[1]}/${m[2]}/${m[3]}`;
  }

  private async loadActivationGateForMutate(
    employeeId: string,
    companyId: string,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ): Promise<EmpActivationGateResult> {
    if (!this.empDocumentChecklist) {
      // DENY silent allow when GATE residual live but CHK service unwired.
      return {
        employeeId,
        companyId,
        checklist_complete: false,
        can_activate: false,
        blocking_items: [
          {
            documentTypeKey: '_gate_unavailable',
            nameVi: 'Checklist gate unavailable',
            status: 'missing',
          },
        ],
      };
    }
    return this.empDocumentChecklist.evaluateActivationGate(
      employeeId,
      companyId,
      authorization,
      scopeContext,
    );
  }

  private async loadActivationGateForDisplay(
    employeeId: string,
    companyId: string,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ): Promise<EmpActivationGateResult | null> {
    if (!this.empDocumentChecklist) return null;
    try {
      return await this.empDocumentChecklist.evaluateActivationGate(
        employeeId,
        companyId,
        authorization,
        scopeContext,
      );
    } catch {
      // Display enrich best-effort — never 500 GET list/get on gate/catalog miss.
      return null;
    }
  }

  private assertActivationGatePass(gate: EmpActivationGateResult): void {
    if (gate.checklist_complete && gate.can_activate) return;
    throw new ApiException(
      HRM_EMP_ACT_CHECKLIST_INCOMPLETE,
      'Employee activation checklist incomplete',
      HttpStatus.CONFLICT,
      {
        checklist_complete: false,
        can_activate: false,
        blocking_items: gate.blocking_items,
      },
    );
  }

  private emitEmployeeActivated(payload: {
    employee_id: string;
    company_id: string;
    effective_date: string;
  }): Record<string, unknown> {
    const envelope = {
      type: EMPLOYEE_ACTIVATED_EVENT,
      at: new Date().toISOString(),
      employee_id: payload.employee_id,
      company_id: payload.company_id,
      effective_date: payload.effective_date,
    };
    this.realtime?.publishEmployeeActivated({
      employee_id: payload.employee_id,
      company_id: payload.company_id,
      effective_date: payload.effective_date,
    });
    return envelope;
  }

  private mapPublicEmployee(
    row: EmployeeRow,
    options?: {
      statusLabelLookup?: Map<string, string>;
      activationGate?: EmpActivationGateResult | null;
      activatedAtDisplay?: string | null;
      events?: Array<Record<string, unknown>>;
    },
  ) {
    const companyUuid = resolveHrmCompanyUuidForSlug(row.company_id);
    // Plane A / ĐVTV LE SoT — never Khối* (AC-EMP-COL-01/03).
    // company_slug_map sync (upgrade Khối → LE) lives in OperatingUnitsService (AC-EMP-COL-04).
    const tenantId =
      typeof row.custom_fields?.tenant_id === 'string'
        ? row.custom_fields.tenant_id.trim()
        : '';
    const company_display_name = resolveEmployeeCompanyDisplayNameVi(
      row.company_id,
      { tenantId: tenantId || undefined },
    );
    const statusKey = String(row.status ?? '')
      .trim()
      .replace(/-/g, '_')
      .toLowerCase();
    const catalogLabel = options?.statusLabelLookup?.get(statusKey) ?? null;
    // OS 28 — flatten name/dept/status labels so FE does not join custom_fields/catalog.
    const display = buildEmployeeDisplayReadyFields(row, {
      statusCatalogLabel: catalogLabel,
    });
    const statusLabelVi = this.resolveCore07StatusLabelVi(
      row.status,
      catalogLabel,
    );
    const gate = options?.activationGate;
    const activatedAt =
      options?.activatedAtDisplay === undefined
        ? null
        : options.activatedAtDisplay === null ||
            options.activatedAtDisplay === ''
          ? '—'
          : options.activatedAtDisplay;
    return {
      id: row.id,
      company_id: row.company_id,
      company_uuid: companyUuid,
      company_display_name,
      employee_code: row.employee_code,
      email: row.email,
      full_name: row.full_name,
      display_name: display.display_name,
      job_title_key: row.job_title_key,
      job_title_label: display.job_title_label,
      department: display.department,
      phone_number: display.phone_number,
      manager_id: row.manager_id,
      status: row.status,
      status_label: display.status_label,
      statusLabelVi,
      hired_at: row.hired_at,
      archived_at: row.archived_at,
      avatar_url: row.avatar_url ?? null,
      candidate_id: row.candidate_id ?? null,
      custom_fields: filterPublicCustomFields(row.custom_fields),
      created_at: row.created_at,
      updated_at: row.updated_at,
      checklist_complete: gate?.checklist_complete ?? null,
      blocking_items: gate?.blocking_items ?? null,
      can_activate: gate?.can_activate ?? null,
      activated_at: activatedAt,
      ...(options?.events ? { events: options.events } : {}),
    };
  }

  private async resolveStatusLabelLookup(
    companyId: string,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ): Promise<Map<string, string> | undefined> {
    if (!this.empEmploymentStatus) {
      return undefined;
    }
    try {
      return await this.empEmploymentStatus.buildStatusLabelLookup(
        companyId,
        authorization,
        scopeContext?.tenantId ?? MASTER_TENANT_ID,
      );
    } catch {
      return undefined;
    }
  }

  /**
   * F-EMP-ST-CNS-01/02 — assert status ∈ EFF when count>0; reason when required / invent under EFF>0.
   * Returns canonical status key (alias resolved) for persist.
   */
  private async assertEmployeeStatusPayload(input: {
    companyId: string;
    status?: string | null;
    statusReasonKey?: string | null;
    authorization?: string;
    tenantId?: string;
  }): Promise<{ statusKey: string | null; requiresReason: boolean }> {
    const rawStatus = String(input.status ?? '').trim();
    if (!rawStatus) {
      if (input.statusReasonKey?.trim() && this.empStatusReason) {
        await this.empStatusReason.assertStatusReasonInEffectiveCatalog({
          companyId: input.companyId,
          reasonKey: input.statusReasonKey,
          authorization: input.authorization,
          tenantId: input.tenantId,
        });
      }
      return { statusKey: null, requiresReason: false };
    }

    let canonical = rawStatus.replace(/-/g, '_').toLowerCase();
    let requiresReason = false;
    if (this.empEmploymentStatus) {
      const hit = await this.empEmploymentStatus.assertStatusInEffectiveCatalog(
        {
          companyId: input.companyId,
          status: rawStatus,
          authorization: input.authorization,
          tenantId: input.tenantId,
        },
      );
      if (hit) {
        canonical = hit.statusKey;
        requiresReason = hit.requiresReason;
      }
    }
    if (this.empStatusReason) {
      await this.empStatusReason.assertStatusReasonInEffectiveCatalog({
        companyId: input.companyId,
        reasonKey: input.statusReasonKey,
        statusKey: canonical,
        requiresReason,
        authorization: input.authorization,
        tenantId: input.tenantId,
      });
    }
    return { statusKey: canonical, requiresReason };
  }

  /**
   * @CODE-MEMORY method · FR-HRM-EM-01
   * SRS bước: Diễn biến #5 Trùng mã NV · #7 Lưu thành công
   * TechSpec: §14.1 ref_srs FR-HRM-EM-01
   */
  async createEmployee(
    payload: CreateEmployeeDto,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    // O3 — CB deny keys → 403 HRM-CORE-CB-403 (no silent strip-and-200).
    assertNoCorePublicCbDenyKeys(payload as unknown as Record<string, unknown>);
    const scope = resolveHrmListScope(
      authorization,
      payload.company_id,
      scopeContext,
    );
    // Xử lý: persist company_id theo ladder (main→holding) — khóa đơn vị Diễn biến #7/#8.
    const companyId = resolveHrmPersistCompanyIdText(
      authorization,
      payload.company_id,
      scopeContext,
    );
    const customFields: Record<string, string> = {
      ...(payload.custom_fields ?? {}),
    };
    if (scope.memberTenantId && !customFields.tenant_id?.trim()) {
      customFields.tenant_id = scope.memberTenantId;
    } else if (scope.masterTenantPartition && !customFields.tenant_id?.trim()) {
      customFields.tenant_id = MASTER_TENANT_ID;
    }

    await this.assertJobTitleKeyInCatalog(
      companyId,
      payload.job_title_key,
      scopeContext,
    );
    // F-EMP-CF-CNS-01 — invent extension codes ∈ Settings EFF when count>0 (AC-01c); empty skip (AC-01d).
    await assertEmpCustomFieldsAgainstEffectiveCatalog({
      query: this.db.query.bind(this.db),
      companyId,
      customFields,
      authorization,
      tenantId: scopeContext?.tenantId ?? MASTER_TENANT_ID,
    });

    const statusAssert = await this.assertEmployeeStatusPayload({
      companyId,
      status: payload.status,
      statusReasonKey: payload.status_reason_key,
      authorization,
      tenantId: scopeContext?.tenantId ?? MASTER_TENANT_ID,
    });
    if (payload.status_reason_key?.trim()) {
      customFields.status_reason_key = payload.status_reason_key
        .trim()
        .replace(/-/g, '_')
        .toLowerCase();
    }

    const employeeId = randomUUID();
    // FR-UC-H01 — QL trực tiếp: null OK; ≠self N/A on create; same company + no cycle vs manager chain.
    const managerId =
      payload.manager_id === undefined
        ? null
        : await assertManagerAssignment(this.db, {
            employeeId: null,
            companyId,
            managerId: payload.manager_id,
            authorization,
            scopeContext,
          });
    try {
      const res = await this.db.query<EmployeeRow>(
        `
          INSERT INTO public.employees (
            id, company_id, employee_code, email, full_name, job_title_key, manager_id,
            status, hired_at, avatar_url, custom_fields
          ) VALUES ($1, $2, $3, $4, $5, $6, $7::uuid, COALESCE($8, 'active'), $9::date, $10, $11::jsonb)
          RETURNING
            id, company_id, employee_code, email, full_name, job_title_key, manager_id,
            status, hired_at, archived_at, avatar_url, candidate_id, custom_fields, created_at, updated_at;
        `,
        [
          employeeId,
          companyId,
          payload.employee_code.trim(),
          payload.email.toLowerCase().trim(),
          payload.full_name.trim(),
          payload.job_title_key?.trim() ?? null,
          managerId,
          statusAssert.statusKey,
          payload.hired_at ?? null,
          payload.avatar_url?.trim() || null,
          JSON.stringify(customFields),
        ],
      );
      const labelLookup = await this.resolveStatusLabelLookup(
        companyId,
        authorization,
        scopeContext,
      );
      // Thành công: Diễn biến #7 — trả hồ sơ mới (khóa id mang sang CI/AT).
      return this.mapEmployee(res.rows[0], { statusLabelLookup: labelLookup });
    } catch (error) {
      const pg = error as { code?: string };
      if (pg.code === '23505') {
        // Thất bại: Diễn biến #5 — trùng mã NV / email trong đơn vị.
        throw new ApiException(
          'HRM-EMP-DUPLICATE',
          'Duplicate employee code or email for this company',
          HttpStatus.CONFLICT,
        );
      }
      if (error instanceof ApiException) {
        throw error;
      }
      const message =
        error instanceof Error ? error.message : 'Cannot create employee';
      throw new ApiException('HRM-EMP-001', message, HttpStatus.BAD_REQUEST, {
        original: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private buildEmployeeListFilters(
    query: ListEmployeesQueryDto,
    authorization: string | undefined,
    scopeContext: HrmListScopeContext | undefined,
    options?: { directoryDefaults?: boolean },
  ) {
    const scope = resolveHrmListScope(
      authorization,
      query.company_id,
      scopeContext,
    );
    const filters: string[] = [];
    const values: unknown[] = [];
    pushEmployeeListScopeFilters(filters, values, scope);
    let idx = values.length + 1;

    if (!query.include_archived) {
      filters.push('archived_at IS NULL');
    }

    const status =
      query.status ?? (options?.directoryDefaults ? 'active' : undefined);
    if (status) {
      filters.push(`status = $${idx}`);
      values.push(status);
      idx += 1;
    }

    const searchTerm = resolveDirectorySearchTerm(query.keyword, query.q);
    if (searchTerm) {
      filters.push(
        `(full_name ILIKE $${idx} OR email ILIKE $${idx} OR employee_code ILIKE $${idx})`,
      );
      values.push(`%${searchTerm}%`);
      idx += 1;
    }

    return { scope, filters, values, idx };
  }

  private async loadAttendanceTodayByEmployeeIds(employeeIds: string[]) {
    if (employeeIds.length === 0) {
      return new Map<
        string,
        { check_in_at: string | null; status: string | null }
      >();
    }
    const today = todayIsoInHoChiMinh();
    const res = await this.db.query<{
      employee_id: string;
      check_in_at: string | null;
      status: string | null;
    }>(
      `
        SELECT employee_id::text AS employee_id, check_in_at, status
        FROM public.attendance_records
        WHERE employee_id = ANY($1::uuid[]) AND attendance_date = $2::date;
      `,
      [employeeIds, today],
    );
    return new Map(
      res.rows.map((row) => [
        row.employee_id,
        { check_in_at: row.check_in_at, status: row.status },
      ]),
    );
  }

  async listEmployeeDirectory(
    query: ListEmployeesQueryDto,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    const page = query.page ?? 1;
    const pageSize = query.page_size ?? 30;
    const offset = (page - 1) * pageSize;
    const includeAttendanceToday = query.include_attendance_today === true;
    const { filters, values, idx } = this.buildEmployeeListFilters(
      query,
      authorization,
      scopeContext,
      {
        directoryDefaults: true,
      },
    );

    const whereClause = filters.join(' AND ');
    // P1-HRM-SCALE-BE-W2 — single round-trip: window COUNT + page rows (ADR §5.4 COUNT strategy)
    const dataRes = await this.db.query<EmployeeRow & { list_total: string }>(
      `
        SELECT
          id, company_id, employee_code, email, full_name, job_title_key, manager_id,
          status, hired_at, archived_at, avatar_url, custom_fields, created_at, updated_at,
          COUNT(*) OVER()::text AS list_total
        FROM public.employees
        WHERE ${whereClause}
        ORDER BY full_name ASC, employee_code ASC, id ASC
        LIMIT $${idx} OFFSET $${idx + 1};
      `,
      [...values, pageSize, offset],
    );

    let total = Number(dataRes.rows[0]?.list_total ?? 0);
    if (dataRes.rows.length === 0 && page > 1) {
      const countRes = await this.db.query<{ total: string }>(
        `SELECT COUNT(*)::text AS total FROM public.employees WHERE ${whereClause};`,
        values,
      );
      total = Number(countRes.rows[0]?.total ?? 0);
    }

    const attendanceByEmployee = includeAttendanceToday
      ? await this.loadAttendanceTodayByEmployeeIds(
          dataRes.rows.map((row) => row.id),
        )
      : new Map<
          string,
          { check_in_at: string | null; status: string | null }
        >();

    let data = dataRes.rows.map((row) =>
      mapDirectoryListItem(
        row,
        attendanceByEmployee.get(row.id) ?? null,
        includeAttendanceToday,
      ),
    );

    if (includeAttendanceToday && query.attendance_filter) {
      data = data.filter((item) =>
        directoryItemPassesAttendanceFilter(item, query.attendance_filter),
      );
    }

    return {
      total,
      page,
      page_size: pageSize,
      data,
    };
  }

  /**
   * P1-HRM-PERF-BE-01 — single-call dashboard aggregates (same list scope filters).
   * Replaces ~N sequential GET /employees pages for count/stats on embed.
   */
  /**
   * @CODE-MEMORY method · AC-CO-EMP / D-HRM-CO-EMP-COUNT-BE-01
   * SRS bước: Company Management — cột Số nhân viên theo ĐVTV (Plane B slug)
   * TechSpec: GET /employees/summary · by_company · same resolveHrmListScope as list
   */
  async getEmployeesSummary(
    query: EmployeeSummaryQueryDto,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ): Promise<EmployeeSummaryResult> {
    const listQuery: ListEmployeesQueryDto = {
      company_id: query.company_id,
      keyword: query.keyword,
      status: query.status,
      include_archived: query.include_archived,
    };
    const { filters, values, scope } = this.buildEmployeeListFilters(
      listQuery,
      authorization,
      scopeContext,
    );
    const whereClause = filters.join(' AND ');
    // P1-HRM-SCALE-BE-W2 — one CTE scan for agg + dept + by_company + recent
    type SummaryAggregateRow = {
      total: string;
      active_count: string;
      inactive_count: string;
      archived_count: string;
      new_hires_last_30_days: string;
      total_payroll: string;
      employees_with_salary: string;
      salary_range_above_30m: string;
      salary_range_20_30m: string;
      salary_range_15_20m: string;
      salary_range_below_15m: string;
    };
    type SummaryDeptRow = {
      department: string;
      count: string;
      avg_salary: string | null;
    };
    type SummaryCompanyRow = {
      company_id: string;
      total: string;
      active_count: string;
      inactive_count: string;
      archived_count: string;
    };
    type SummaryRecentRow = {
      id: string;
      employee_code: string;
      full_name: string;
      status: string;
      hired_at: string | null;
      avatar_url: string | null;
    };

    const bundledRes = await this.db.query<{
      aggregate: SummaryAggregateRow | null;
      by_department: SummaryDeptRow[] | null;
      by_company: SummaryCompanyRow[] | null;
      recent: SummaryRecentRow[] | null;
    }>(
      `
        WITH scoped AS (
          SELECT
            id,
            company_id,
            employee_code,
            full_name,
            status,
            hired_at,
            archived_at,
            avatar_url,
            created_at,
            custom_fields,
            ${EMPLOYEE_SALARY_NUM_SQL} AS salary_num
          FROM public.employees
          WHERE ${whereClause}
        ),
        agg AS (
          SELECT
            COUNT(*)::text AS total,
            COUNT(*) FILTER (WHERE status = 'active')::text AS active_count,
            COUNT(*) FILTER (WHERE status = 'inactive')::text AS inactive_count,
            COUNT(*) FILTER (WHERE archived_at IS NOT NULL)::text AS archived_count,
            COUNT(*) FILTER (WHERE hired_at >= (CURRENT_DATE - INTERVAL '30 days'))::text AS new_hires_last_30_days,
            COALESCE(SUM(salary_num), 0)::text AS total_payroll,
            COUNT(*) FILTER (WHERE salary_num IS NOT NULL AND salary_num > 0)::text AS employees_with_salary,
            COUNT(*) FILTER (WHERE salary_num >= 30000000)::text AS salary_range_above_30m,
            COUNT(*) FILTER (WHERE salary_num >= 20000000 AND salary_num < 30000000)::text AS salary_range_20_30m,
            COUNT(*) FILTER (WHERE salary_num >= 15000000 AND salary_num < 20000000)::text AS salary_range_15_20m,
            COUNT(*) FILTER (WHERE salary_num > 0 AND salary_num < 15000000)::text AS salary_range_below_15m
          FROM scoped
        ),
        dept AS (
          SELECT
            COALESCE(NULLIF(TRIM(custom_fields->>'department'), ''), 'Khác') AS department,
            COUNT(*)::text AS count,
            AVG(salary_num)::text AS avg_salary
          FROM scoped
          GROUP BY 1
        ),
        by_company AS (
          SELECT
            company_id,
            COUNT(*)::text AS total,
            COUNT(*) FILTER (WHERE status = 'active')::text AS active_count,
            COUNT(*) FILTER (WHERE status = 'inactive')::text AS inactive_count,
            COUNT(*) FILTER (WHERE archived_at IS NOT NULL)::text AS archived_count
          FROM scoped
          GROUP BY company_id
        ),
        recent AS (
          SELECT
            id::text AS id,
            employee_code,
            full_name,
            status,
            hired_at::text AS hired_at,
            avatar_url
          FROM scoped
          ORDER BY COALESCE(hired_at, created_at::date) DESC, created_at DESC
          LIMIT 5
        )
        SELECT
          (SELECT row_to_json(a) FROM agg a) AS aggregate,
          COALESCE(
            (
              SELECT json_agg(row_to_json(d) ORDER BY d.count::int DESC, d.department ASC)
              FROM dept d
            ),
            '[]'::json
          ) AS by_department,
          COALESCE(
            (
              SELECT json_agg(row_to_json(c) ORDER BY c.company_id ASC)
              FROM by_company c
            ),
            '[]'::json
          ) AS by_company,
          COALESCE(
            (SELECT json_agg(row_to_json(r)) FROM recent r),
            '[]'::json
          ) AS recent;
      `,
      values,
    );

    const emptyAggregate: SummaryAggregateRow = {
      total: '0',
      active_count: '0',
      inactive_count: '0',
      archived_count: '0',
      new_hires_last_30_days: '0',
      total_payroll: '0',
      employees_with_salary: '0',
      salary_range_above_30m: '0',
      salary_range_20_30m: '0',
      salary_range_15_20m: '0',
      salary_range_below_15m: '0',
    };
    const payload = bundledRes.rows[0];
    const aggregate = payload?.aggregate ?? emptyAggregate;
    const departmentRows = payload?.by_department ?? [];
    const companyRows = payload?.by_company ?? [];
    const recentRows = payload?.recent ?? [];

    // VAL-CORE-PUB-D-06 option (c) — default public summary MUST NOT expose salary SoT;
    // unlock only with include=compensation_summary (C&B / CORE-02 peer bind).
    const includeCompensation = wantsCompensationSummary(query.include);
    const byDepartment = departmentRows.map((row) => ({
      department: row.department,
      count: Number(row.count),
      avg_salary: includeCompensation
        ? row.avg_salary == null
          ? null
          : Number(row.avg_salary)
        : null,
    }));

    return {
      company_id: query.company_id,
      total: Number(aggregate.total),
      active_count: Number(aggregate.active_count),
      inactive_count: Number(aggregate.inactive_count),
      archived_count: Number(aggregate.archived_count),
      compensation_summary_included: includeCompensation,
      payroll: includeCompensation
        ? {
            total: Number(aggregate.total_payroll),
            employees_with_salary: Number(aggregate.employees_with_salary),
          }
        : { total: 0, employees_with_salary: 0 },
      by_department: byDepartment,
      by_company: buildEmployeeSummaryByCompany(companyRows, scope.companyIds),
      ...(scope.tenantOnlyMode && scope.tenantIds?.length
        ? {
            by_tenant: buildEmployeeSummaryByTenant(
              companyRows,
              scope.tenantIds,
            ),
          }
        : {}),
      salary_ranges: includeCompensation
        ? buildSalaryRangesFromCounts(aggregate)
        : buildSalaryRangesFromCounts({
            salary_range_above_30m: 0,
            salary_range_20_30m: 0,
            salary_range_15_20m: 0,
            salary_range_below_15m: 0,
          }),
      new_hires: {
        last_30_days: Number(aggregate.new_hires_last_30_days),
        recent: recentRows.map((row) => ({
          id: row.id,
          employee_code: row.employee_code,
          full_name: row.full_name,
          status: row.status,
          hired_at: row.hired_at,
          avatar_url: row.avatar_url ?? null,
        })),
      },
    };
  }

  /**
   * @CODE-MEMORY method · FR-HRM-EM-01
   * SRS bước: Diễn biến #8 Tải lại trang — list scoped (+ cursor export)
   * TechSpec: §14.1 ref_srs FR-HRM-EM-01
   */
  async listEmployees(
    query: ListEmployeesQueryDto,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    const page = query.page ?? 1;
    const pageSize = query.page_size ?? 20;
    const cursorRaw =
      typeof query.cursor === 'string' ? query.cursor.trim() : '';
    const { filters, values, idx } = this.buildEmployeeListFilters(
      query,
      authorization,
      scopeContext,
    );
    const whereClause = filters.join(' AND ');
    const labelLookup = await this.resolveStatusLabelLookup(
      query.company_id,
      authorization,
      scopeContext,
    );
    const mapOpts = { statusLabelLookup: labelLookup };

    // CD-FB-05 — keyset cursor (ADR §5.4); OFFSET path must_keep when cursor absent
    if (cursorRaw) {
      if (isDirectoryView(query.view)) {
        throw new ApiException(
          'HRM-EMP-CURSOR-002',
          'cursor is not supported with view=directory',
          HttpStatus.BAD_REQUEST,
        );
      }
      let cursor: { createdAt: string; id: string };
      try {
        cursor = decodeEmployeeListCursor(cursorRaw);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'invalid cursor';
        throw new ApiException(
          'HRM-EMP-CURSOR-001',
          message,
          HttpStatus.BAD_REQUEST,
        );
      }

      const fetchSize = pageSize + 1;
      const dataRes = await this.db.query<
        EmployeeRow & { list_total: string; created_at_cursor: string }
      >(
        `
          WITH scoped AS (
            SELECT
              id, company_id, employee_code, email, full_name, job_title_key, manager_id,
              status, hired_at, archived_at, avatar_url, candidate_id, custom_fields, created_at, updated_at,
              to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS created_at_cursor,
              COUNT(*) OVER()::text AS list_total
            FROM public.employees
            WHERE ${whereClause}
          )
          SELECT *
          FROM scoped
          WHERE (created_at, id) < ($${idx}::timestamptz, $${idx + 1}::uuid)
          ORDER BY created_at DESC, id DESC
          LIMIT $${idx + 2};
        `,
        [...values, cursor.createdAt, cursor.id, fetchSize],
      );

      const hasMore = dataRes.rows.length > pageSize;
      const pageRows = hasMore ? dataRes.rows.slice(0, pageSize) : dataRes.rows;
      const total = Number(
        pageRows[0]?.list_total ?? dataRes.rows[0]?.list_total ?? 0,
      );
      const last = pageRows[pageRows.length - 1];
      const nextCursor =
        hasMore && last ? encodeEmployeeListCursorFromRow(last) : null;

      return {
        total,
        page,
        page_size: pageSize,
        next_cursor: nextCursor,
        data: pageRows.map((row) => this.mapEmployee(row, mapOpts)),
      };
    }

    const offset = (page - 1) * pageSize;
    // P1-HRM-SCALE-BE-W2 — single round-trip: window COUNT + page rows (ADR §5.4 COUNT strategy)
    const dataRes = await this.db.query<
      EmployeeRow & { list_total: string; created_at_cursor: string }
    >(
      `
        SELECT
          id, company_id, employee_code, email, full_name, job_title_key, manager_id,
          status, hired_at, archived_at, avatar_url, candidate_id, custom_fields, created_at, updated_at,
          to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS created_at_cursor,
          COUNT(*) OVER()::text AS list_total
        FROM public.employees
        WHERE ${whereClause}
        ORDER BY created_at DESC, id DESC
        LIMIT $${idx} OFFSET $${idx + 1};
      `,
      [...values, pageSize, offset],
    );

    let total = Number(dataRes.rows[0]?.list_total ?? 0);
    if (dataRes.rows.length === 0 && page > 1) {
      const countRes = await this.db.query<{ total: string }>(
        `SELECT COUNT(*)::text AS total FROM public.employees WHERE ${whereClause};`,
        values,
      );
      total = Number(countRes.rows[0]?.total ?? 0);
    }

    const last = dataRes.rows[dataRes.rows.length - 1];
    const nextCursor =
      dataRes.rows.length === pageSize &&
      last &&
      offset + dataRes.rows.length < total
        ? encodeEmployeeListCursorFromRow(last)
        : null;

    return {
      total,
      page,
      page_size: pageSize,
      next_cursor: nextCursor,
      data: dataRes.rows.map((row) => this.mapEmployee(row, mapOpts)),
    };
  }

  private async queryEmployeeById(
    employeeId: string,
    scope: HrmListScope,
    includeArchived: boolean | undefined,
    options?: { skipTenantPartition?: boolean },
  ): Promise<EmployeeRow | undefined> {
    const filters: string[] = ['id = $1::uuid'];
    const values: unknown[] = [employeeId];
    pushEmployeeListScopeFilters(filters, values, scope, options);
    if (!includeArchived) {
      filters.push('archived_at IS NULL');
    }
    const res = await this.db.query<EmployeeRow>(
      `
        SELECT
          id, company_id, employee_code, email, full_name, job_title_key,
          manager_id, status, hired_at, archived_at, avatar_url, candidate_id,
          custom_fields, created_at, updated_at
        FROM public.employees
        WHERE ${filters.join(' AND ')};
      `,
      values,
    );
    return res.rows[0];
  }

  async getEmployeeDirectoryById(
    employeeId: string,
    query: GetEmployeeQueryDto,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    const scope = resolveHrmListScope(
      authorization,
      query.company_id,
      scopeContext,
    );
    let row = await this.queryEmployeeById(
      employeeId,
      scope,
      query.include_archived,
    );
    if (!row && scope.masterTenantPartition) {
      row = await this.queryEmployeeById(
        employeeId,
        scope,
        query.include_archived,
        {
          skipTenantPartition: true,
        },
      );
    }
    if (!row) {
      throw new ApiException(
        'HRM-EMP-404',
        'Employee not found',
        HttpStatus.NOT_FOUND,
      );
    }
    const includeAttendanceToday = query.include_attendance_today === true;
    const attendanceByEmployee = includeAttendanceToday
      ? await this.loadAttendanceTodayByEmployeeIds([employeeId])
      : new Map<
          string,
          { check_in_at: string | null; status: string | null }
        >();
    return mapDirectoryDetail(
      row,
      authorization,
      attendanceByEmployee.get(employeeId) ?? null,
      includeAttendanceToday,
    );
  }

  /**
   * @CODE-MEMORY method · FR-HRM-EM-01
   * SRS bước: Diễn biến #8 — get-by-id cùng scope list (U19 parity)
   * TechSpec: §14.1 ref_srs FR-HRM-EM-01
   */
  async getEmployeeById(
    employeeId: string,
    query: GetEmployeeQueryDto,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    const scope = resolveHrmListScope(
      authorization,
      query.company_id,
      scopeContext,
    );
    let row = await this.queryEmployeeById(
      employeeId,
      scope,
      query.include_archived,
    );
    if (!row && scope.masterTenantPartition) {
      row = await this.queryEmployeeById(
        employeeId,
        scope,
        query.include_archived,
        {
          skipTenantPartition: true,
        },
      );
    }
    if (!row) {
      throw new ApiException(
        'HRM-EMP-404',
        'Employee not found',
        HttpStatus.NOT_FOUND,
      );
    }
    const labelLookup = await this.resolveStatusLabelLookup(
      row.company_id,
      authorization,
      scopeContext,
    );
    const gate = await this.loadActivationGateForDisplay(
      employeeId,
      row.company_id,
      authorization,
      scopeContext,
    );
    return this.mapEmployee(row, {
      statusLabelLookup: labelLookup,
      activationGate: gate,
      activatedAtDisplay: null,
    });
  }

  /**
   * F-CORE-ACT-01 — POST …/activate · pending_docs→active after GATE · EFF · ATT emit.
   * U19 same scope family as list/get. DENY invent completeness table / typed activated_at / Nest /core.
   */
  async activateEmployee(
    employeeId: string,
    payload: ActivateEmployeeDto,
    requestedCompanyId: string,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    const scope = resolveHrmListScope(
      authorization,
      requestedCompanyId,
      scopeContext,
    );
    let existing = await this.queryEmployeeById(employeeId, scope, false);
    if (!existing && scope.masterTenantPartition) {
      existing = await this.queryEmployeeById(employeeId, scope, false, {
        skipTenantPartition: true,
      });
    }
    if (!existing) {
      throw new ApiException(
        'HRM-EMP-404',
        'Employee not found',
        HttpStatus.NOT_FOUND,
      );
    }
    assertResourceInHrmScope(existing, scope, {
      notFoundCode: 'HRM-EMP-404',
      mismatchCode: 'HRM-SCOPE-409',
    });

    const currentStatus = String(existing.status ?? '')
      .trim()
      .replace(/-/g, '_')
      .toLowerCase();
    if (currentStatus !== EMP_STATUS_PENDING_DOCS) {
      throw new ApiException(
        HRM_EMP_ACT_ILLEGAL_TRANSITION,
        `Activate requires status ${EMP_STATUS_PENDING_DOCS}→${EMP_STATUS_ACTIVE}`,
        HttpStatus.CONFLICT,
        { status: existing.status },
      );
    }

    const effectiveDateDisplay = this.assertEffectiveDateDdMmYyyy(
      payload.effective_date,
    );
    const gate = await this.loadActivationGateForMutate(
      employeeId,
      existing.company_id,
      authorization,
      scopeContext,
    );
    this.assertActivationGatePass(gate);

    // Catalog assert when EFF>0 — RETAIN ST-CNS; activate spine key = active.
    await this.assertEmployeeStatusPayload({
      companyId: existing.company_id,
      status: EMP_STATUS_ACTIVE,
      authorization,
      tenantId: scopeContext?.tenantId ?? MASTER_TENANT_ID,
    });

    const res = await this.db.query<EmployeeRow>(
      `
        UPDATE public.employees
        SET status = $2, updated_at = NOW()
        WHERE id = $1::uuid AND archived_at IS NULL
        RETURNING
          id, company_id, employee_code, email, full_name, job_title_key, manager_id,
          status, hired_at, archived_at, avatar_url, candidate_id, custom_fields, created_at, updated_at;
      `,
      [employeeId, EMP_STATUS_ACTIVE],
    );
    const updated = res.rows[0];
    if (!updated) {
      throw new ApiException(
        'HRM-EMP-404',
        'Employee not found',
        HttpStatus.NOT_FOUND,
      );
    }

    const event = this.emitEmployeeActivated({
      employee_id: updated.id,
      company_id: updated.company_id,
      effective_date: effectiveDateDisplay,
    });
    const labelLookup = await this.resolveStatusLabelLookup(
      updated.company_id,
      authorization,
      scopeContext,
    );
    const gateAfter: EmpActivationGateResult = {
      ...gate,
      checklist_complete: true,
      can_activate: true,
      blocking_items: [],
    };
    return this.mapPublicEmployee(updated, {
      statusLabelLookup: labelLookup,
      activationGate: gateAfter,
      activatedAtDisplay: effectiveDateDisplay,
      events: [event],
    });
  }

  async updateEmployee(
    employeeId: string,
    payload: UpdateEmployeeDto,
    requestedCompanyId: string,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    // O3 — CB deny keys → 403 (no silent strip).
    assertNoCorePublicCbDenyKeys(payload as unknown as Record<string, unknown>);
    assertEmployeeUpdateAllowed(employeeId, payload, authorization);
    // U19 / FR-UC-HRM-21 — patch dùng cùng resolveHrmListScope + scopeContext như list/get-by-id.
    const scope = resolveHrmListScope(
      authorization,
      requestedCompanyId,
      scopeContext,
    );
    // Load RAW row for CF merge — public map strips CB keys; writing filtered CF would wipe legacy storage.
    let existing = await this.queryEmployeeById(employeeId, scope, false);
    if (!existing && scope.masterTenantPartition) {
      existing = await this.queryEmployeeById(employeeId, scope, false, {
        skipTenantPartition: true,
      });
    }
    if (!existing) {
      throw new ApiException(
        'HRM-EMP-404',
        'Employee not found',
        HttpStatus.NOT_FOUND,
      );
    }
    assertResourceInHrmScope(existing, scope, {
      notFoundCode: 'HRM-EMP-404',
      mismatchCode: 'HRM-EMP-409',
    });
    const updates: string[] = [];
    const values: unknown[] = [];
    let activatedAtDisplay: string | null = null;
    let activatedEvent: Record<string, unknown> | null = null;
    let activationGate: EmpActivationGateResult | null = null;
    if (payload.email !== undefined) {
      updates.push(`email = $${updates.length + 1}`);
      values.push(payload.email.toLowerCase().trim());
    }
    if (payload.full_name !== undefined) {
      updates.push(`full_name = $${updates.length + 1}`);
      values.push(payload.full_name.trim());
    }
    if (payload.job_title_key !== undefined) {
      await this.assertJobTitleKeyInCatalog(
        existing.company_id,
        payload.job_title_key,
        scopeContext,
      );
      updates.push(`job_title_key = $${updates.length + 1}`);
      values.push(payload.job_title_key.trim());
    }
    if (payload.hired_at !== undefined) {
      updates.push(`hired_at = $${updates.length + 1}::date`);
      values.push(payload.hired_at);
    }

    let nextCustomFields: Record<string, string> | undefined;
    if (payload.custom_fields !== undefined) {
      // Option A: self always merges phone keys only (even manager|hr_manager JWT).
      nextCustomFields = isSelfEmployeeTarget(employeeId, authorization)
        ? mergeSelfEssCustomFields(
            existing.custom_fields,
            payload.custom_fields,
          )
        : (payload.custom_fields ?? {});
    }

    if (
      payload.status !== undefined ||
      payload.status_reason_key !== undefined
    ) {
      const statusAssert = await this.assertEmployeeStatusPayload({
        companyId: existing.company_id,
        status: payload.status !== undefined ? payload.status : existing.status,
        statusReasonKey: payload.status_reason_key,
        authorization,
        tenantId: scopeContext?.tenantId ?? MASTER_TENANT_ID,
      });
      if (payload.status !== undefined && statusAssert.statusKey) {
        const nextStatus = statusAssert.statusKey;
        const currentStatus = String(existing.status ?? '')
          .trim()
          .replace(/-/g, '_')
          .toLowerCase();
        // O5 — unrestricted status→active without GATE = FAIL once residual live.
        if (
          nextStatus === EMP_STATUS_ACTIVE &&
          currentStatus !== EMP_STATUS_ACTIVE
        ) {
          if (currentStatus !== EMP_STATUS_PENDING_DOCS) {
            throw new ApiException(
              HRM_EMP_ACT_ILLEGAL_TRANSITION,
              `Activate requires status ${EMP_STATUS_PENDING_DOCS}→${EMP_STATUS_ACTIVE}`,
              HttpStatus.CONFLICT,
              { status: existing.status },
            );
          }
          const effectiveDateDisplay = this.assertEffectiveDateDdMmYyyy(
            payload.effective_date,
          );
          const gate = await this.loadActivationGateForMutate(
            employeeId,
            existing.company_id,
            authorization,
            scopeContext,
          );
          this.assertActivationGatePass(gate);
          updates.push(`status = $${updates.length + 1}`);
          values.push(nextStatus);
          activatedAtDisplay = effectiveDateDisplay;
          activationGate = {
            ...gate,
            checklist_complete: true,
            can_activate: true,
            blocking_items: [],
          };
        } else {
          updates.push(`status = $${updates.length + 1}`);
          values.push(nextStatus);
        }
      }
      if (payload.status_reason_key !== undefined) {
        nextCustomFields = {
          ...(nextCustomFields ??
            (typeof existing.custom_fields === 'object' &&
            existing.custom_fields
              ? { ...existing.custom_fields }
              : {})),
        };
        const rk = payload.status_reason_key
          .trim()
          .replace(/-/g, '_')
          .toLowerCase();
        if (rk) {
          nextCustomFields.status_reason_key = rk;
        } else {
          delete nextCustomFields.status_reason_key;
        }
      }
    }

    if (nextCustomFields !== undefined) {
      // F-EMP-CF-CNS-01 — HR invent KEY when EFF>0; ESS merge keeps phone builtins; history retain OK.
      await assertEmpCustomFieldsAgainstEffectiveCatalog({
        query: this.db.query.bind(this.db),
        companyId: existing.company_id,
        customFields: nextCustomFields,
        previousCustomFields: existing.custom_fields,
        authorization,
        tenantId: scopeContext?.tenantId ?? MASTER_TENANT_ID,
      });
      updates.push(`custom_fields = $${updates.length + 1}::jsonb`);
      values.push(JSON.stringify(nextCustomFields));
    }
    if (payload.avatar_url !== undefined) {
      updates.push(`avatar_url = $${updates.length + 1}`);
      values.push(payload.avatar_url?.trim() || null);
    }
    if (payload.manager_id !== undefined) {
      // FR-UC-H01 / FR-UC-H03 — set or clear QL trực tiếp (null OK); cycle/self/cross-company reject.
      const managerId = await assertManagerAssignment(this.db, {
        employeeId,
        companyId: existing.company_id,
        managerId: payload.manager_id,
        authorization,
        scopeContext,
      });
      updates.push(`manager_id = $${updates.length + 1}::uuid`);
      values.push(managerId);
    }

    if (updates.length === 0) {
      throw new ApiException(
        'HRM-EMP-002',
        'No fields to update',
        HttpStatus.BAD_REQUEST,
      );
    }

    const res = await this.db.query<EmployeeRow>(
      `
        UPDATE public.employees
        SET ${updates.join(', ')}, updated_at = NOW()
        WHERE id = $${updates.length + 1}::uuid
        RETURNING
          id, company_id, employee_code, email, full_name, job_title_key, manager_id,
          status, hired_at, archived_at, avatar_url, candidate_id, custom_fields, created_at, updated_at;
      `,
      [...values, employeeId],
    );
    const updated = res.rows[0];
    if (!updated) {
      throw new ApiException(
        'HRM-EMP-404',
        'Employee not found',
        HttpStatus.NOT_FOUND,
      );
    }
    const labelLookup = await this.resolveStatusLabelLookup(
      updated.company_id,
      authorization,
      scopeContext,
    );
    if (activatedAtDisplay) {
      activatedEvent = this.emitEmployeeActivated({
        employee_id: updated.id,
        company_id: updated.company_id,
        effective_date: activatedAtDisplay,
      });
    }
    return this.mapPublicEmployee(updated, {
      statusLabelLookup: labelLookup,
      activationGate,
      activatedAtDisplay,
      ...(activatedEvent ? { events: [activatedEvent] } : {}),
    });
  }

  async archiveEmployee(
    employeeId: string,
    requestedCompanyId: string,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    const scope = resolveHrmListScope(
      authorization,
      requestedCompanyId,
      scopeContext,
    );
    let existing = await this.queryEmployeeById(employeeId, scope, false);
    if (!existing && scope.masterTenantPartition) {
      existing = await this.queryEmployeeById(employeeId, scope, false, {
        skipTenantPartition: true,
      });
    }
    if (!existing) {
      throw new ApiException(
        'HRM-EMP-404',
        'Employee not found',
        HttpStatus.NOT_FOUND,
      );
    }
    assertResourceInHrmScope(existing, scope, {
      notFoundCode: 'HRM-EMP-404',
      mismatchCode: 'HRM-EMP-409',
    });
    const res = await this.db.query<EmployeeRow>(
      `
        UPDATE public.employees
        SET archived_at = NOW(), updated_at = NOW(), status = 'inactive'
        WHERE id = $1::uuid AND archived_at IS NULL
        RETURNING
          id, company_id, employee_code, email, full_name, job_title_key, manager_id,
          status, hired_at, archived_at, avatar_url, candidate_id, custom_fields, created_at, updated_at;
      `,
      [employeeId],
    );
    const archived = res.rows[0];
    if (!archived) {
      throw new ApiException(
        'HRM-EMP-404',
        'Employee not found or already archived',
        HttpStatus.NOT_FOUND,
      );
    }
    return this.mapPublicEmployee(archived);
  }

  async restoreEmployee(
    employeeId: string,
    requestedCompanyId: string,
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    const scope = resolveHrmListScope(
      authorization,
      requestedCompanyId,
      scopeContext,
    );
    let existing = await this.queryEmployeeById(employeeId, scope, true);
    if (!existing && scope.masterTenantPartition) {
      existing = await this.queryEmployeeById(employeeId, scope, true, {
        skipTenantPartition: true,
      });
    }
    if (!existing) {
      throw new ApiException(
        'HRM-EMP-404',
        'Employee not found',
        HttpStatus.NOT_FOUND,
      );
    }
    assertResourceInHrmScope(existing, scope, {
      notFoundCode: 'HRM-EMP-404',
      mismatchCode: 'HRM-EMP-409',
    });
    if (existing.archived_at === null) {
      throw new ApiException(
        'HRM-EMP-409',
        'Employee is already active',
        HttpStatus.CONFLICT,
      );
    }

    const filters: string[] = ['id = $1::uuid', 'archived_at IS NOT NULL'];
    const values: unknown[] = [employeeId];
    pushEmployeeListScopeFilters(filters, values, scope);
    const res = await this.db.query<EmployeeRow>(
      `
        UPDATE public.employees
        SET archived_at = NULL, updated_at = NOW(), status = 'active'
        WHERE ${filters.join(' AND ')}
        RETURNING
          id, company_id, employee_code, email, full_name, job_title_key, manager_id,
          status, hired_at, archived_at, avatar_url, candidate_id, custom_fields, created_at, updated_at;
      `,
      values,
    );
    const restored = res.rows[0];
    if (!restored) {
      throw new ApiException(
        'HRM-EMP-404',
        'Employee not found or not archived',
        HttpStatus.NOT_FOUND,
      );
    }
    return this.mapPublicEmployee(restored);
  }

  /**
   * F-CORE-HTP-05 — Hire-to-Pay bước 5 readiness (profile + active contract same company).
   * Missing contract → ready_for_payroll=false + blocker HRM-HTP-NO-ACTIVE-CONTRACT (not HTTP 500).
   */
  async getHireReadiness(
    employeeId: string,
    query: GetEmployeeQueryDto & { as_of?: string },
    authorization?: string,
    scopeContext?: HrmListScopeContext,
  ) {
    const employee = await this.getEmployeeById(
      employeeId,
      query,
      authorization,
      scopeContext,
    );
    const asOf = query.as_of?.trim() || new Date().toISOString().slice(0, 10);
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.employee_contracts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id UUID NOT NULL,
        company_id TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        start_date DATE,
        end_date DATE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    const contractRes = await this.db.query<{ id: string; status: string }>(
      `
        SELECT id, status
        FROM public.employee_contracts
        WHERE employee_id = $1::uuid
          AND company_id = $2::text
          AND status = 'active'
          AND (start_date IS NULL OR start_date <= $3::date)
          AND (end_date IS NULL OR end_date >= $3::date)
        ORDER BY start_date DESC NULLS LAST, updated_at DESC
        LIMIT 1;
      `,
      [employeeId, employee.company_id, asOf],
    );
    const active = contractRes.rows[0] ?? null;
    const blockers: string[] = [];
    if (!active) {
      blockers.push('HRM-HTP-NO-ACTIVE-CONTRACT');
    }
    const profileOk = Boolean(employee.id && employee.full_name);
    return {
      employee_id: employee.id,
      company_id: employee.company_id,
      profile_ok: profileOk,
      active_contract: active
        ? { contract_id: active.id, status: active.status }
        : null,
      ready_for_payroll: profileOk && active != null,
      blockers,
      as_of: asOf,
    };
  }
}
