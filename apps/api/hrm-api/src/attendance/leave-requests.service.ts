/**
 * @CODE-MEMORY
 * Screen:     HRM → Đơn nghỉ phép
 * UC:         UC-HRM-10 · HRM-AT-10
 * BR:         fanout leave_request.* · attachment path under /api/hrm/files
 * SRS:        docs/client-delivery/hrm/SRS_HRM_KHACH.md §3.5 · FR-HRM-AT-10
 * SRS bước:   Diễn biến #3–#6 validate · #7 Gửi thành công · #8 Thông báo duyệt
 * TechSpec:   docs/hrm/TECHSPEC.md §14.5 (ref_srs: FR-HRM-AT-10)
 * Purpose:    Tạo/list/approve/reject leave_requests + fanout + workflow bridge.
 * WorkItem:   BE-HRM-CODE-MEMORY-SRS-STEP-01
 * Coded:      2026-07-21
 * Callers:    attendance.controller.ts · leave-workflow.controller.ts
 * Callees:    AttendanceEventFanoutService · LeaveWorkflowBridge · public.leave_requests
 * must_keep:  leave-workflow bridge / terminal callback; không phá AC-ATT-SHEET
 * SOLID:      Leave tách AttendanceService records
 * LastVerified: leave-requests.service.spec.ts · leave-balance.service.spec.ts (33/33 · W1-B-01)
 *
 * @CODE-MEMORY-CHANGE 2026-07-21
 * WorkItem: BE-HRM-CODE-MEMORY-SRS-STEP-01
 * change_mode: ADD
 * What: CODE-MEMORY map Diễn biến AT-10 (không đổi logic)
 *
 * @CODE-MEMORY-CHANGE 2026-07-21
 * WorkItem: BE-HRM-G-DB-03-LEAVE-CREATE-01
 * change_mode: ADD
 * What: ensureSchema CREATE TABLE IF NOT EXISTS leave_requests (G-DB-03) trước ALTER cột mở rộng
 * must_keep: leave-workflow bridge; AC-ATT-SHEET
 * TechSpec: docs/hrm/TECHSPEC.md §17.3 G-DB-03 · §14.5 FR-HRM-AT-10
 *
 * @CODE-MEMORY-CHANGE 2026-07-21
 * WorkItem: BE-HRM-G-AT10-01-SCOPE-SLUG-01
 * change_mode: ADD
 * What: company_id TEXT + resolveHrmPersistCompanyIdText on create (G-AT10-01); INSERT $2::text
 * must_keep: G-DB-03 CREATE IF NOT EXISTS; leave-workflow bridge; không đụng G-AT10-02
 * TechSpec: docs/hrm/TECHSPEC.md §14.5 · §14.9 G-AT10-01
 *
 * @CODE-MEMORY-CHANGE 2026-07-21
 * WorkItem: BE-HRM-G-AT10-02-LEAVE-OVERLAP-01
 * change_mode: ADD
 * What: createLeaveRequest Diễn biến #5/#6 — overlap + insufficient balance reject codes
 * must_keep: G-DB-03 CREATE; G-AT10-01 TEXT persist; leave-workflow bridge; happy path 201 khi không track số dư
 * TechSpec: docs/hrm/TECHSPEC.md §14.5 · §14.9 G-AT10-02 · ref_srs FR-HRM-AT-10
 *
 * @CODE-MEMORY-CHANGE 2026-07-22
 * WorkItem: BE-HRM-G-AT10-01
 * change_mode: ADD
 * What: AT-12/13 approve/reject — normalizePayrollListCompanyId trước resolveHrmListScope (UUID→slug); must_keep create TEXT + G-AT10-02
 * TechSpec: docs/hrm/TECHSPEC.md §14.5 · §16.9 G-AT10-01 · AT-10/12/13
 *
 * @CODE-MEMORY-CHANGE 2026-07-23
 * WorkItem: D-HRM-SETTINGS-MD-CRUD-BE-01
 * change_mode: ADD
 * What: createLeaveRequest asserts leave_type ∈ leave_types catalog (BR-HRM-MD-01 / VAL-SET-MD-02)
 * SRS: FR-HRM-SC-LEAVE-01 · delta Cài đặt §4
 * must_keep: G-AT10-01 TEXT · G-AT10-02 overlap/balance · leave-workflow bridge
 *
 * @CODE-MEMORY-CHANGE 2026-07-27
 * WorkItem: D-HRM-LEAVE-REQ-CREATE-BE-01
 * change_mode: FIX
 * What: assert leave_type via resolveHrmSettingsCatalogCompanyId (main|holding UUID→holding);
 *       pass tenantId from controller; persist TEXT slug (UUID→holding) — no ::uuid on leave_requests
 * must_keep: G-AT10-01 TEXT · G-AT10-02 · leave-workflow bridge · VAL-SET-MD-02 catalog SoT
 * TechSpec: docs/hrm/TECHSPEC.md §14.5 FR-HRM-AT-10 · G-AT10-01
 *
 * @CODE-MEMORY-CHANGE 2026-07-28
 * WorkItem: D-BE-ERP-E3-01
 * change_mode: ADD
 * What: approve/reject via assertStatusTransition('leave') → HRM-SM-001 on illegal reverse
 * Why: AC-E3-SM-01 · FR-HRM-CONSTRAINT-E3-01 · DB_DESIGN_HRM_ERP_E3 §2.2 leave cite
 * must_keep: G-AT10-* · leave-workflow bridge · HRM-LEAVE-404 when not pending
 *
 * @CODE-MEMORY-CHANGE 2026-07-30
 * WorkItem: D-HDSD-WF-LEAVE-BIND-01
 * change_mode: FIX
 * What: createLeaveRequest trả workflow_instance_id sau bridge spawn; forward authorization + submitterUserId
 * Why: QA-HDSD-W4-INT-03-R2 POST 201 nhưng workflow_instance_id null — row trả về trước UPDATE bridge
 * must_keep: G-AT10-* · leave-workflow bridge · fanout · U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-07-30
 * WorkItem: D-HDSD-WF-LEAVE-RESP-01
 * change_mode: FIX
 * What: createLeaveRequest reload row sau bridge; merge workflow_instance_id từ DB hoặc bridge result
 * Why: QA-HDSD-W4-INT-03-R3 POST 201 vẫn null dù GET sau đó có id — response phải đồng bộ
 * must_keep: G-AT10-* · leave-workflow bridge · fanout · U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-03
 * WorkItem: W1-B-01-TC-LEAVE
 * change_mode: UPGRADE
 * What: display-ready status_label/leave_type_label/employee_display_name trên list/create/approve/reject;
 *       khóa pending_days khi create (row balance tồn tại); approve pending→used; reject nhả pending;
 *       sick ≥3 ngày bắt buộc attachment_url (API_CONTRACT §4.2)
 * Why: API_CONTRACT_NEW §4 · DB_DESIGN leave_requests note · OS 28 FE không join
 * SRS: docs/brand-new-documents-20270801/SRS_NEW.md · FR-UC-H03 · Diễn biến #3–#5
 * TechSpec: docs/brand-new-documents-20270801/API_CONTRACT_NEW.md §4.1–4.5
 * must_keep: G-AT10-* · leave-workflow bridge · soft balance (không track → không khóa) · mã lỗi ổn định
 *
 * @CODE-MEMORY-CHANGE 2026-08-03
 * WorkItem: R-SPINE-MGR-HIER-01-BE
 * change_mode: FIX
 * What: resolveIsSickLeaveType — companySlug fallback 'holding' (TS2345 narrow; no leave SQL change)
 * must_keep: manager_employee_id list filter semantics; G-AT10-* · leave-workflow bridge
 *
 * @CODE-MEMORY-CHANGE 2026-08-03
 * WorkItem: PO-E2E-SPINE-02-BE-LV03-VAL-ATT-01
 * change_mode: FIX
 * What: assertSickAttachmentIfRequired nhận diện catalog ốm (LVT_02 / label Ốm / metadata is_sick|category)
 *       → HRM-LEAVE-VAL-ATT khi total_days≥3 và thiếu attachment_url (không chỉ leave_type==='sick')
 * Why: QA LV-03 POST LVT_02 5d no attach → 201 bypass BR-LEAVE-ATT-01
 * SRS: FR-UC-H03 · BR-LEAVE-ATT-01 · Diễn biến #2 chứng từ nghỉ ốm
 * API: API_CONTRACT_NEW §4.2 · mã HRM-LEAVE-VAL-ATT
 * must_keep: G-AT10-* · leave-workflow bridge · classic sick · leave mount GWC · U65 no seed · HOLD L2 ladder Dev
 *
 * @CODE-MEMORY-CHANGE 2026-08-04
 * WorkItem: PO-MFD-M2-ATT-SCOPE-01
 * change_mode: FIX
 * What: Controller passes resolveScopeContext().companyId into approve/reject (U78 parity); service ladder unchanged.
 * Why:  Member portal x-company-id=main caused 409 on valid mgr approve when row TEXT slug = JWT OU.
 * must_keep: normalizePayrollListCompanyId · BR-WF-04 · AT-12 L2 SPEC_GAP not invented
 *
 * @CODE-MEMORY-CHANGE 2026-08-06
 * WorkItem: PO-HRM-ATT-LEAVE-FUNNEL-BE-01
 * change_mode: ADD
 * What: After approve (L1 / internal) → LeaveAttendanceFunnelService materialize records;
 *       cancel after approved → reverse by leave_request_id; echo materialized_days.
 * Why: F-ATT-LEAVE-FUNNEL-01/02 · AC-ATT-LV-SHEET-01..03 · Option A P0
 * must_keep: G-AT10-* · leave-workflow bridge · WAIVE_L2 · no AGG · U65 zero-seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-07
 * WorkItem: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-BE-01
 * change_mode: ADD
 * What: createLeaveRequest asserts leave_type ∈ F-ATT-CAT-EFF-01 effective union (ATT wins);
 *       error HRM-LEAVE-TYPE-UNKNOWN when catalog >0 (R-PLT-ATT-01 · BR-PLT-02).
 * Why: Platform Option B ATT vertical · dual SoT att_leave_type + settings leave_types REF
 * must_keep: G-AT10-* · leave-workflow bridge · funnel · soft empty catalog · U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-09
 * WorkItem: PO-HRM-MVP-GD1-ATT-08-CLUSTER-BE-01
 * change_mode: ADD
 * What: F-ATT-LEAVE-01 previewDeduction BR-BP-LV-05 · HOL-MISS CHẶN · Q-LEAVE-UNIT ·
 *       ALIGN create reject calendar inflate · persist working_days/deductible_units/calendar_days/unit;
 *       RETAIN F-ATT-LEAVE-02/03 · expand ≠ engine SoT.
 * SRS: FR-UC-BP-ATT-08 Diễn biến #1–#4 · BR-BP-LV-05 · API-01 §4
 * must_keep: G-AT10-* · funnel · Nest /core DENY · ≠ ATT-09/03b DONE · CFG≠ATT-02 ·
 *            ATT02QC1-MSLQZUK7 · PLT01QC1-MSLPUQIU · CORE10/09/07 · PAY OUT · honesty false
 *
 * @CODE-MEMORY-CHANGE 2026-08-09
 * WorkItem: PO-HRM-MVP-GD1-ATT-09-CLUSTER-BE-02
 * change_mode: FIX
 * What: approve defer ATT-10 funnel when HRM-ATT-SHEET-LOCKED — settle pending→used vẫn 2xx (FR-09)
 * Why:  QA R-ATT-09-APPROVE-SHEET-LOCKED · funnel ≠ block F-ATT-LEAVE-03 settle AC
 * must_keep: funnel CONFLICT still throws · reverse/cancel unchanged · Nest /core DENY
 *
 * @CODE-MEMORY-CHANGE 2026-08-10
 * WorkItem: PO-HRM-MVP-GD1-ATT-07-CLUSTER-BE-01
 * change_mode: ADD
 * What: Sick submit/approve hook F-ATT-SICK-DAY-BRANCH — allocator §6.2 + annual pending_days only;
 *       reject/cancel void branches; GET/PUT fund-order peer service.
 * SRS: FR-UC-BP-ATT-07 Diễn biến #1–#2 · BR-BP-LV-04 · DV-16
 * must_keep: VAL-ATT · pending_days · DENY att_leave_hold · ATT06QC1 compensatory separate
 */
import { HttpStatus, Injectable, Optional } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { randomUUID } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import { assertStatusTransition } from '../common/assert-status-transition';
import {
  assertResourceInHrmScope,
  normalizePayrollListCompanyId,
  pushWorkforceEmployeeScopeFilter,
  resolveHrmListScope,
  resolveHrmPersistCompanyIdText,
  resolveHrmSettingsCatalogCompanyId,
} from '../common/hrm-list-scope';
import { masterTenantIdFromEnv } from '../common/tenant-scope-env';
import { HrmDbService } from '../db/hrm-db.service';
import { AttendanceEventFanoutService } from '../notifications/attendance-event-fanout.service';
import type { LeaveRequestRealtimePayload } from '../realtime/hrm-realtime.service';
import {
  HRM_ATT_SHEET_LOCKED,
  LeaveAttendanceFunnelService,
  expandLeaveDateRange,
} from './leave-attendance-funnel.service';
import { LeaveWorkflowBridge } from './leave-workflow.bridge';
import { AttLeaveTypeService } from './att-leave-type.service';
import {
  AttHolidayCalendarService,
  HRM_LEAVE_HOL_MISSING,
} from './att-holiday-calendar.service';
import {
  computeLeaveDeduction,
  normalizeLeaveUnit,
  parseLeaveDateInput,
  type LeaveDeductionResult,
  type LeaveDeductionUnit,
} from './leave-deduction-engine';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { DecideLeaveRequestDto } from './dto/decide-leave-request.dto';
import { ListLeaveRequestsQueryDto } from './dto/list-leave-requests.query.dto';
import type { PreviewLeaveDeductionDto } from './dto/preview-leave-deduction.dto';
import { computeLeaveAvailableDays } from './leave-balance.service';
import {
  AttSickLeaveFundOrderService,
  type SickDayBranchDisplay,
  type SickLeaveTypeFlags,
} from './att-sick-leave-fund-order.service';

/** Settings catalog key — leave_types (API_CONTRACT / VAL-SET-MD-02). */
const HRM_SC_LEAVE_KEY = 'leave_types';

/** Narrow ports — resolved lazily via ModuleRef (avoid hard import of settings/catalog-sync at load time). */
type LeaveCatalogItemHint = {
  status: string;
  code?: string;
  label?: string;
  name?: string;
  metadata?: Record<string, unknown> | null;
};

type LeaveSettingsCatalogPort = {
  getEffectiveItemsForKey(
    tenantId: string,
    companyId: string,
    catalogKey: string,
  ): Promise<LeaveCatalogItemHint[]>;
  assertCodeInEffectiveCatalog(input: {
    tenantId: string;
    companyId: string;
    catalogKey: string;
    code: string;
    errorCode: string;
    errorMessage: string;
  }): Promise<void>;
};

type LeaveCatalogSyncPort = {
  pullCatalogFromXbos(
    catalogKey: string,
    tenantId: string,
    catalogCompanyId: string,
    authorization: string,
  ): Promise<unknown>;
};

type LeaveRow = {
  id: string;
  company_id: string;
  employee_id: string;
  employee_code: string | null;
  employee_name: string | null;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  status: string;
  requested_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  department: string | null;
  position: string | null;
  total_days: string;
  handover_to: string | null;
  handover_tasks: string | null;
  approver_employee_id: string | null;
  rejected_reason: string | null;
  attachment_url: string | null;
  workflow_instance_id?: string | null;
  working_days?: string | number | null;
  deductible_units?: string | number | null;
  calendar_days?: string | number | null;
  unit?: string | null;
};

/** OS 28 — FE bind labels without catalog/status join. */
export type LeaveDisplayRow = LeaveRow & {
  status_label: string;
  leave_type_label: string;
  employee_display_name: string;
  total_days_number: number;
  working_days_number?: number | null;
  deductible_units_number?: number | null;
  calendar_days_number?: number | null;
  unit?: string | null;
  materialized_days?: string[];
  materialized_record_ids?: string[];
  dayBranches?: SickDayBranchDisplay[];
};

const LEAVE_ATTACHMENT_URL_PATTERN = /^\/api\/hrm\/files\/[a-zA-Z0-9_-]+\/.+$/;

const LEAVE_STATUS_LABELS_VI: Record<string, string> = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
  cancelled: 'Đã hủy',
};

const LEAVE_TYPE_LABELS_VI: Record<string, string> = {
  annual: 'Phép năm',
  sick: 'Nghỉ ốm',
  maternity: 'Thai sản',
  unpaid: 'Không lương',
  compensatory: 'Nghỉ bù',
  annual_leave: 'Phép năm',
  sick_leave: 'Nghỉ ốm',
  /** XeVN catalog ốm — picker LVT_02 (BR-LEAVE-ATT-01). */
  lvt_02: 'Ốm',
};

/**
 * Classic + well-known catalog codes for nghỉ ốm (FR-UC-H03 / BR-LEAVE-ATT-01).
 * LVT_02 = catalog Ốm in pilot XBOS→HRM leave_types (QA LV-03).
 */
const SICK_LEAVE_TYPE_CODES = new Set(['sick', 'sick_leave', 'lvt_02']);

/** G-AT10-02 — deterministic reject codes (FR-HRM-AT-10 Diễn biến #5/#6). */
export const HRM_LEAVE_VAL_OVERLAP = 'HRM-LEAVE-VAL-OVERLAP';
export const HRM_LEAVE_VAL_BALANCE = 'HRM-LEAVE-VAL-BALANCE';
/** API_CONTRACT §4.2 / BR-LEAVE-ATT-01 — ốm ≥3 ngày thiếu giấy bác sĩ. */
export const HRM_LEAVE_VAL_ATT = 'HRM-LEAVE-VAL-ATT';

/** Strip VI diacritics for label matching (ốm → om). */
export function normalizeLeaveTypeToken(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/\s+/g, ' ');
}

/** True when label/name denotes nghỉ ốm (Ốm, Nghỉ ốm, sick, …). */
export function isSickLeaveLabel(label: string | null | undefined): boolean {
  const n = normalizeLeaveTypeToken(String(label ?? ''));
  if (!n) {
    return false;
  }
  if (n === 'om' || n === 'sick' || n === 'sick leave' || n === 'nghi om') {
    return true;
  }
  if (n.includes('nghi om') || n.includes('sick leave') || /\bsick\b/.test(n)) {
    return true;
  }
  // Word-boundary "om" — avoids false positives on unrelated tokens.
  return /(^|[^a-z0-9])om([^a-z0-9]|$)/.test(n);
}

/** True for classic sick codes or well-known catalog LVT_02 / label-as-code. */
export function isSickLeaveTypeCode(leaveType: string): boolean {
  const key = leaveType.trim().toLowerCase();
  if (!key) {
    return false;
  }
  if (SICK_LEAVE_TYPE_CODES.has(key)) {
    return true;
  }
  return isSickLeaveLabel(leaveType);
}

/** Catalog item → nghỉ ốm via code, VI label, or metadata flag (is_sick / category). */
export function catalogLeaveTypeIndicatesSick(item: LeaveCatalogItemHint): boolean {
  if (item.code && isSickLeaveTypeCode(item.code)) {
    return true;
  }
  if (isSickLeaveLabel(item.label) || isSickLeaveLabel(item.name)) {
    return true;
  }
  const meta = item.metadata ?? undefined;
  if (!meta || typeof meta !== 'object') {
    return false;
  }
  if (meta.is_sick === true || meta.sick === true) {
    return true;
  }
  if (meta.requires_doctor_note === true || meta.requires_medical_attachment === true) {
    return true;
  }
  const category = normalizeLeaveTypeToken(
    String(meta.category ?? meta.leave_category ?? meta.kind ?? ''),
  );
  if (category === 'sick' || category === 'om' || category === 'sick_leave') {
    return true;
  }
  if (isSickLeaveLabel(category)) {
    return true;
  }
  // Attachment-required flag alone only when category/label already smells like sick — avoid annual.
  if (meta.requires_attachment === true && (category.includes('sick') || isSickLeaveLabel(String(meta.label ?? '')))) {
    return true;
  }
  return false;
}

function toDayNumber(value: string | number | null | undefined): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function leaveStatusLabelVi(status: string | null | undefined): string {
  const raw = String(status ?? '').trim();
  const key = raw.toLowerCase();
  return LEAVE_STATUS_LABELS_VI[key] ?? (raw || '—');
}

export function leaveTypeLabelVi(leaveType: string | null | undefined): string {
  const raw = String(leaveType ?? '').trim();
  const key = raw.toLowerCase();
  return LEAVE_TYPE_LABELS_VI[key] ?? (raw || '—');
}

export function toLeaveDisplayRow(row: LeaveRow): LeaveDisplayRow {
  const name = (row.employee_name ?? '').trim();
  return {
    ...row,
    status_label: leaveStatusLabelVi(row.status),
    leave_type_label: leaveTypeLabelVi(row.leave_type),
    employee_display_name: name || (row.employee_code ?? '').trim() || String(row.employee_id ?? ''),
    total_days_number: toDayNumber(row.total_days),
    working_days_number:
      row.working_days == null || row.working_days === ''
        ? null
        : toDayNumber(row.working_days),
    deductible_units_number:
      row.deductible_units == null || row.deductible_units === ''
        ? null
        : toDayNumber(row.deductible_units),
    calendar_days_number:
      row.calendar_days == null || row.calendar_days === ''
        ? null
        : toDayNumber(row.calendar_days),
    unit: row.unit ?? null,
  };
}

function assertValidLeaveAttachmentUrl(url: string | undefined): string | null {
  const trimmed = url?.trim();
  if (!trimmed) {
    return null;
  }
  if (!LEAVE_ATTACHMENT_URL_PATTERN.test(trimmed)) {
    throw new ApiException(
      'HRM-LEAVE-VAL-ATT',
      'attachment_url must be a relative path under /api/hrm/files/{company_scope}/',
      HttpStatus.BAD_REQUEST,
    );
  }
  return trimmed;
}

/** Balance year from leave start_date (YYYY-MM-DD); fallback UTC year. */
function balanceYearFromStartDate(startDate: string): number {
  const match = /^(\d{4})-/.exec(startDate.trim());
  if (match) {
    return Number(match[1]);
  }
  return new Date().getUTCFullYear();
}

@Injectable()
export class LeaveRequestsService {
  constructor(
    private readonly db: HrmDbService,
    private readonly fanout: AttendanceEventFanoutService,
    private readonly leaveWorkflowBridge: LeaveWorkflowBridge,
    /** Test override — production resolves via ModuleRef. */
    @Optional() private readonly settingsCatalogs?: LeaveSettingsCatalogPort,
    @Optional() private readonly catalogSync?: LeaveCatalogSyncPort,
    @Optional() private readonly moduleRef?: ModuleRef,
    /** Option A leave→attendance funnel — optional so legacy unit tests keep 3-arg ctor. */
    @Optional() private readonly leaveAttendanceFunnel?: LeaveAttendanceFunnelService,
    /** F-ATT-CAT-EFF-01 — optional for legacy specs; production injects AttLeaveTypeService. */
    @Optional() private readonly attLeaveTypeCatalog?: AttLeaveTypeService,
    /** F-ATT-HOL-01 thin year set — optional for legacy specs. */
    @Optional() private readonly holidayCalendar?: AttHolidayCalendarService,
    /** F-ATT-SICK-DAY-BRANCH — optional for legacy specs. */
    @Optional() private readonly attSickLeaveFundOrder?: AttSickLeaveFundOrderService,
  ) {}

  private async materializeLeaveFunnel(row: LeaveRow): Promise<{
    materialized_days: string[];
    materialized_record_ids: string[];
    leave_funnel_deferred?: boolean;
    leave_funnel_deferred_code?: string;
  }> {
    if (!this.leaveAttendanceFunnel) {
      return { materialized_days: [], materialized_record_ids: [] };
    }
    try {
      return await this.leaveAttendanceFunnel.materializeApprovedLeave({
        id: row.id,
        company_id: row.company_id,
        employee_id: row.employee_id,
        leave_type: row.leave_type,
        start_date: row.start_date,
        end_date: row.end_date,
      });
    } catch (err) {
      if (err instanceof ApiException && err.code === HRM_ATT_SHEET_LOCKED) {
        return {
          materialized_days: [],
          materialized_record_ids: [],
          leave_funnel_deferred: true,
          leave_funnel_deferred_code: HRM_ATT_SHEET_LOCKED,
        };
      }
      throw err;
    }
  }

  private async reverseLeaveFunnel(leaveRequestId: string, companyId?: string): Promise<void> {
    if (!this.leaveAttendanceFunnel) {
      return;
    }
    await this.leaveAttendanceFunnel.reverseLeaveMarkers(leaveRequestId, companyId);
  }

  private resolveHolidayCalendar(): AttHolidayCalendarService | undefined {
    if (this.holidayCalendar) {
      return this.holidayCalendar;
    }
    if (!this.moduleRef) {
      return undefined;
    }
    try {
      return this.moduleRef.get(AttHolidayCalendarService, { strict: false });
    } catch {
      return undefined;
    }
  }

  private resolveAttLeaveTypeCatalog(): AttLeaveTypeService | undefined {
    if (this.attLeaveTypeCatalog) {
      return this.attLeaveTypeCatalog;
    }
    if (!this.moduleRef) {
      return undefined;
    }
    try {
      return this.moduleRef.get(AttLeaveTypeService, { strict: false });
    } catch {
      return undefined;
    }
  }

  private resolveSettingsCatalogs(): LeaveSettingsCatalogPort | undefined {
    if (this.settingsCatalogs) {
      return this.settingsCatalogs;
    }
    if (!this.moduleRef) {
      return undefined;
    }
    try {
      // Lazy require — keeps leave service loadable when settings master-keys file is absent.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mod = require('../settings-catalogs/settings-catalogs.service') as {
        SettingsCatalogsService: new (...args: never[]) => LeaveSettingsCatalogPort;
      };
      return this.moduleRef.get(mod.SettingsCatalogsService, { strict: false });
    } catch {
      return undefined;
    }
  }

  private resolveCatalogSync(): LeaveCatalogSyncPort | undefined {
    if (this.catalogSync) {
      return this.catalogSync;
    }
    if (!this.moduleRef) {
      return undefined;
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mod = require('../catalog-sync/catalog-sync.service') as {
        CatalogSyncService: new (...args: never[]) => LeaveCatalogSyncPort;
      };
      return this.moduleRef.get(mod.CatalogSyncService, { strict: false });
    } catch {
      return undefined;
    }
  }

  /**
   * Khi L1 leave_types trống — pull XBOS SoT một lần (UF-HRM-09 / Settings sync parity, không seed).
   */
  private async ensureLeaveTypeCatalogAvailable(
    authorization: string | undefined,
    tenantId: string,
    catalogCompanyId: string,
  ): Promise<void> {
    const settingsCatalogs = this.resolveSettingsCatalogs();
    const catalogSync = this.resolveCatalogSync();
    if (!settingsCatalogs || !catalogSync || !authorization?.trim()) {
      return;
    }
    const active = (
      await settingsCatalogs.getEffectiveItemsForKey(tenantId, catalogCompanyId, HRM_SC_LEAVE_KEY)
    ).filter((item) => item.status === 'active');
    if (active.length > 0) {
      return;
    }
    try {
      await catalogSync.pullCatalogFromXbos(
        HRM_SC_LEAVE_KEY,
        tenantId,
        catalogCompanyId,
        authorization,
      );
    } catch {
      // XBOS down — assertCodeInEffectiveCatalog trả 400 trung thực.
    }
  }

  /**
   * G-DB-03 — cold DB: CREATE khớp INSERT/UPDATE, rồi ALTER ADD cột mở rộng.
   * G-AT10-01 — company_id TEXT slug ladder (parity OT/requisition); ALTER UUID→TEXT khi baseline cũ.
   */
  private async ensureSchema() {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.leave_requests (
        id UUID PRIMARY KEY,
        company_id TEXT NOT NULL,
        employee_id UUID NOT NULL,
        leave_type TEXT NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        reason TEXT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        reviewed_at TIMESTAMPTZ NULL,
        reviewed_by TEXT NULL,
        employee_code TEXT NULL,
        employee_name TEXT NULL,
        department TEXT NULL,
        position TEXT NULL,
        total_days NUMERIC NOT NULL DEFAULT 1,
        handover_to TEXT NULL,
        handover_tasks TEXT NULL,
        approver_employee_id UUID NULL,
        rejected_reason TEXT NULL,
        attachment_url TEXT NULL,
        workflow_instance_id UUID NULL,
        CONSTRAINT chk_leave_date_range CHECK (start_date <= end_date),
        CONSTRAINT chk_leave_status CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled'))
      );
    `);
    await this.db.query(`
      CREATE INDEX IF NOT EXISTS idx_leave_requests_company_status
      ON public.leave_requests (company_id, status, requested_at DESC);
    `);
    // Upgrade path: baseline 0002_attendance only had core columns.
    const additiveColumns = [
      'employee_code TEXT NULL',
      'employee_name TEXT NULL',
      'department TEXT NULL',
      'position TEXT NULL',
      'total_days NUMERIC NULL',
      'handover_to TEXT NULL',
      'handover_tasks TEXT NULL',
      'approver_employee_id UUID NULL',
      'rejected_reason TEXT NULL',
      'attachment_url TEXT NULL',
      'workflow_instance_id UUID NULL',
      'working_days NUMERIC NULL',
      'deductible_units NUMERIC NULL',
      'calendar_days NUMERIC NULL',
      'unit TEXT NULL',
    ];
    for (const col of additiveColumns) {
      await this.db.query(`
        ALTER TABLE public.leave_requests
        ADD COLUMN IF NOT EXISTS ${col};
      `);
    }
    // G-AT10-01 — existing UUID column → TEXT (idempotent USING ::text).
    await this.db.query(`
      ALTER TABLE public.leave_requests
      ALTER COLUMN company_id TYPE TEXT USING company_id::text;
    `);
  }

  /**
   * Resolve leave_type.unit (Q-LEAVE-UNIT) from EFF catalog — default day.
   * Soft empty catalog → day (ALIGN still runs when holiday service present).
   */
  private async resolveLeaveTypeUnit(input: {
    companyId: string;
    leaveType: string;
    authorization?: string;
    tenantId?: string;
  }): Promise<LeaveDeductionUnit> {
    const att = this.resolveAttLeaveTypeCatalog();
    if (!att) {
      return 'day';
    }
    try {
      const hit = await att.assertLeaveTypeInEffectiveCatalog({
        companyId: input.companyId,
        leaveType: input.leaveType,
        authorization: input.authorization,
        tenantId: input.tenantId,
      });
      if (hit?.unit) {
        return normalizeLeaveUnit(hit.unit);
      }
      const metaUnit = hit?.metadata?.unit;
      return normalizeLeaveUnit(metaUnit ?? 'day');
    } catch (err) {
      if (err instanceof ApiException) {
        throw err;
      }
      return 'day';
    }
  }

  /**
   * F-ATT-LEAVE-01 / BR-BP-LV-05 — engine + HOL-MISS gate.
   * When holiday service ABSENT (legacy unit tests) → empty holidays + no HOL-MISS block.
   */
  private async runLeaveDeductionEngine(input: {
    companyId: string;
    startDate: string;
    endDate: string;
    unit: LeaveDeductionUnit;
    halfDay?: boolean;
    hours?: number;
    authorization?: string;
    tenantId?: string;
    requireHolidayCalendar: boolean;
  }): Promise<LeaveDeductionResult> {
    const start = parseLeaveDateInput(input.startDate);
    const end = parseLeaveDateInput(input.endDate);
    if (!start || !end) {
      throw new ApiException(
        'HRM-VAL-400',
        'startDate/endDate must be yyyy-MM-dd or dd/MM/yyyy',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (start > end) {
      throw new ApiException(
        'HRM-VAL-400',
        'endDate must be on or after startDate',
        HttpStatus.BAD_REQUEST,
      );
    }

    const holidaySvc = this.resolveHolidayCalendar();
    let holidayDates = new Set<string>();
    if (holidaySvc) {
      const hol = await holidaySvc.assertHolidayYearsPresent({
        companyId: input.companyId,
        startDate: start,
        endDate: end,
        authorization: input.authorization,
        tenantId: input.tenantId,
      });
      holidayDates = hol.holidayDates;
    } else if (input.requireHolidayCalendar) {
      throw new ApiException(
        HRM_LEAVE_HOL_MISSING,
        'Holiday calendar service unavailable — CHẶN NỘP',
        HttpStatus.BAD_REQUEST,
      );
    }

    return computeLeaveDeduction({
      startDate: start,
      endDate: end,
      holidayDates,
      unit: input.unit,
      halfDay: input.halfDay,
      hours: input.hours,
    });
  }

  /**
   * F-ATT-LEAVE-01 — POST …/leave-requests/preview-deduction (display-ready).
   * Gold T6→T2 working_days=2 · HOL-MISS CHẶN · Q-LEAVE-UNIT.
   */
  async previewDeduction(
    body: PreviewLeaveDeductionDto,
    authorization?: string,
    options?: { tenantId?: string; companySlug?: string },
  ) {
    await this.ensureSchema();
    const companyRaw =
      body.companyId?.trim() ||
      body.company_id?.trim() ||
      options?.companySlug?.trim() ||
      '';
    if (!companyRaw) {
      throw new ApiException(
        'HRM-VAL-400',
        'companyId is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    const leaveType = (body.leaveType ?? body.leave_type ?? '').trim();
    if (!leaveType) {
      throw new ApiException(
        'HRM-LEAVE-TYPE-UNKNOWN',
        'leaveType is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    const startRaw = body.startDate ?? body.start_date ?? '';
    const endRaw = body.endDate ?? body.end_date ?? '';
    const start = parseLeaveDateInput(startRaw);
    const end = parseLeaveDateInput(endRaw);
    if (!start || !end) {
      throw new ApiException(
        'HRM-VAL-400',
        'startDate/endDate must be yyyy-MM-dd or dd/MM/yyyy',
        HttpStatus.BAD_REQUEST,
      );
    }

    // U19 — same persist/list scope family as leave-requests mutate.
    const companyId = resolveHrmPersistCompanyIdText(authorization, companyRaw, {
      tenantId: options?.tenantId,
    });
    normalizePayrollListCompanyId(authorization, companyRaw);

    const attLeaveCatalog = this.resolveAttLeaveTypeCatalog();
    if (attLeaveCatalog) {
      await attLeaveCatalog.assertLeaveTypeInEffectiveCatalog({
        companyId: companyRaw,
        leaveType,
        authorization,
        tenantId: options?.tenantId,
      });
    }

    const unit = await this.resolveLeaveTypeUnit({
      companyId: companyRaw,
      leaveType,
      authorization,
      tenantId: options?.tenantId,
    });

    const engine = await this.runLeaveDeductionEngine({
      companyId: companyRaw,
      startDate: start,
      endDate: end,
      unit,
      halfDay: body.halfDay,
      hours: body.hours,
      authorization,
      tenantId: options?.tenantId,
      requireHolidayCalendar: true,
    });

    return {
      employeeId: body.employeeId,
      leaveType,
      unit: engine.unit,
      startDate: start,
      endDate: end,
      companyId,
      calendar_days: engine.calendar_days,
      working_days: engine.working_days,
      deductible_units: engine.deductible_units,
      excluded_days: engine.excluded_days,
      warnings: engine.warnings,
      labelsVi: {
        calendar_days: 'Ngày calendar',
        working_days: 'Ngày trừ quỹ',
        excluded_days: 'Ngày loại (T7/CN/Lễ)',
      },
    };
  }

  /** Reload leave row after workflow bridge UPDATE (POST 201 must include workflow_instance_id). */
  private async loadLeaveRequestById(requestId: string): Promise<LeaveRow | null> {
    const res = await this.db.query<LeaveRow>(
      `SELECT * FROM public.leave_requests WHERE id = $1::uuid LIMIT 1`,
      [requestId],
    );
    return res.rows[0] ?? null;
  }

  private toPayload(row: LeaveRow): LeaveRequestRealtimePayload {
    return {
      id: row.id,
      company_id: row.company_id,
      employee_id: row.employee_id,
      employee_code: row.employee_code ?? '',
      employee_name: row.employee_name ?? '',
      leave_type: row.leave_type,
      start_date: row.start_date,
      end_date: row.end_date,
      total_days: Number(row.total_days ?? 1),
      reason: row.reason,
      status: row.status,
      requested_at: row.requested_at,
      reviewed_at: row.reviewed_at,
      reviewed_by: row.reviewed_by,
      rejected_reason: row.rejected_reason,
    };
  }

  /** Soft balance table — chỉ enforce khi có bản ghi / custom_fields (SRS: nếu theo dõi số dư). */
  private async ensureLeaveBalanceSchema(): Promise<void> {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.employee_leave_balances (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id TEXT NOT NULL,
        employee_id UUID NOT NULL,
        leave_type TEXT NOT NULL DEFAULT 'annual',
        balance_year INT NOT NULL,
        entitled_days NUMERIC(5,1) NOT NULL DEFAULT 0,
        used_days NUMERIC(5,1) NOT NULL DEFAULT 0,
        pending_days NUMERIC(5,1) NOT NULL DEFAULT 0,
        advanced_days NUMERIC(5,1) NOT NULL DEFAULT 0,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT uq_employee_leave_balances UNIQUE (company_id, employee_id, leave_type, balance_year)
      );
    `);
    await this.db.query(`
      ALTER TABLE public.employee_leave_balances
        ADD COLUMN IF NOT EXISTS advanced_days NUMERIC(5,1) NOT NULL DEFAULT 0;
    `);
  }

  /**
   * G-AT10-02 / Diễn biến #5 — chồng pending|approved cùng NV (daterange inclusive).
   */
  private async assertNoLeaveOverlap(
    employeeId: string,
    startDate: string,
    endDate: string,
  ): Promise<void> {
    const res = await this.db.query<{ id: string; status: string }>(
      `
        SELECT id::text AS id, status
        FROM public.leave_requests
        WHERE employee_id = $1::uuid
          AND status IN ('pending', 'approved')
          AND daterange(start_date, end_date, '[]') && daterange($2::date, $3::date, '[]')
        LIMIT 1;
      `,
      [employeeId, startDate, endDate],
    );
    const hit = res.rows[0];
    if (hit) {
      // Thất bại: Diễn biến #5 — đã có đơn trùng ngày.
      throw new ApiException(
        HRM_LEAVE_VAL_OVERLAP,
        'Leave request overlaps an existing pending or approved leave',
        HttpStatus.CONFLICT,
        { conflicting_id: hit.id, conflicting_status: hit.status },
      );
    }
  }

  /**
   * G-AT10-02 / Diễn biến #6 — hết phép khi hệ thống theo dõi số dư.
   * Không có row balance + không custom_fields → không track → cho tạo (must_keep happy path).
   */
  private async assertSufficientLeaveBalance(input: {
    companyId: string;
    employeeId: string;
    leaveType: string;
    startDate: string;
    totalDays: number;
  }): Promise<void> {
    await this.ensureLeaveBalanceSchema();
    const leaveType = input.leaveType.trim() || 'annual';
    const balanceYear = balanceYearFromStartDate(input.startDate);

    const balRes = await this.db.query<{
      entitled_days: string;
      used_days: string;
      pending_days: string;
      advanced_days: string;
    }>(
      `
        SELECT entitled_days::text, used_days::text, pending_days::text, advanced_days::text
        FROM public.employee_leave_balances
        WHERE company_id = $1
          AND employee_id = $2::uuid
          AND leave_type = $3
          AND balance_year = $4
        LIMIT 1;
      `,
      [input.companyId, input.employeeId, leaveType, balanceYear],
    );

    let availableDays: number | null = null;
    let source: 'employee_leave_balances' | 'custom_fields' | null = null;

    const bal = balRes.rows[0];
    if (bal) {
      availableDays = computeLeaveAvailableDays(
        toDayNumber(bal.entitled_days),
        toDayNumber(bal.used_days),
        toDayNumber(bal.pending_days),
        toDayNumber(bal.advanced_days),
      );
      source = 'employee_leave_balances';
    } else {
      const empRes = await this.db.query<{ custom_fields: Record<string, unknown> | null }>(
        `
          SELECT custom_fields
          FROM public.employees
          WHERE id = $1::uuid AND archived_at IS NULL
          LIMIT 1;
        `,
        [input.employeeId],
      );
      const custom = empRes.rows[0]?.custom_fields ?? null;
      const raw = custom?.[`leave_balance_${leaveType}`];
      if (raw != null && raw !== '') {
        availableDays = Math.max(0, toDayNumber(String(raw)));
        source = 'custom_fields';
      }
    }

    // Không theo dõi số dư → bỏ qua (SRS: «nếu hệ thống theo dõi số dư»).
    if (availableDays == null || source == null) {
      return;
    }

    if (input.totalDays > availableDays) {
      // Thất bại: Diễn biến #6 — không đủ số dư phép.
      throw new ApiException(
        HRM_LEAVE_VAL_BALANCE,
        'Insufficient leave balance for requested total_days',
        HttpStatus.BAD_REQUEST,
        {
          leave_type: leaveType,
          balance_year: balanceYear,
          available_days: availableDays,
          requested_days: input.totalDays,
          source,
        },
      );
    }
  }

  /**
   * API_CONTRACT §4.2 / DB_DESIGN 4.2 — khóa pending khi có row employee_leave_balances.
   * Soft: không có row → no-op (parity assertSufficientLeaveBalance happy path).
   */
  private async lockPendingLeaveBalance(input: {
    companyId: string;
    employeeId: string;
    leaveType: string;
    startDate: string;
    totalDays: number;
  }): Promise<void> {
    await this.ensureLeaveBalanceSchema();
    const leaveType = input.leaveType.trim() || 'annual';
    const balanceYear = balanceYearFromStartDate(input.startDate);
    await this.db.query(
      `
        UPDATE public.employee_leave_balances
        SET pending_days = pending_days + $5::numeric,
            updated_at = NOW()
        WHERE company_id = $1
          AND employee_id = $2::uuid
          AND leave_type = $3
          AND balance_year = $4;
      `,
      [input.companyId, input.employeeId, leaveType, balanceYear, input.totalDays],
    );
  }

  /** §4.4 — pending → used khi duyệt (chỉ khi có row balance). */
  private async settleApprovedLeaveBalance(row: LeaveRow): Promise<void> {
    await this.ensureLeaveBalanceSchema();
    const leaveType = (row.leave_type ?? 'annual').trim() || 'annual';
    const balanceYear = balanceYearFromStartDate(String(row.start_date));
    const days = toDayNumber(row.total_days);
    await this.db.query(
      `
        UPDATE public.employee_leave_balances
        SET pending_days = GREATEST(0, pending_days - $5::numeric),
            used_days = used_days + $5::numeric,
            updated_at = NOW()
        WHERE company_id = $1
          AND employee_id = $2::uuid
          AND leave_type = $3
          AND balance_year = $4;
      `,
      [row.company_id, row.employee_id, leaveType, balanceYear, days],
    );
  }

  /** §4.5 — nhả khóa pending khi từ chối. */
  private async releasePendingLeaveBalance(row: LeaveRow): Promise<void> {
    await this.ensureLeaveBalanceSchema();
    const leaveType = (row.leave_type ?? 'annual').trim() || 'annual';
    const balanceYear = balanceYearFromStartDate(String(row.start_date));
    const days = toDayNumber(row.total_days);
    await this.db.query(
      `
        UPDATE public.employee_leave_balances
        SET pending_days = GREATEST(0, pending_days - $5::numeric),
            updated_at = NOW()
        WHERE company_id = $1
          AND employee_id = $2::uuid
          AND leave_type = $3
          AND balance_year = $4;
      `,
      [row.company_id, row.employee_id, leaveType, balanceYear, days],
    );
  }

  /**
   * Resolve whether leave_type is nghỉ ốm for BR-LEAVE-ATT-01:
   * code (sick / LVT_02) · ATT catalog category/flag · REF catalog label/metadata.
   */
  private async resolveIsSickLeaveType(
    leaveType: string,
    authorization: string | undefined,
    options?: { tenantId?: string; companySlug?: string },
  ): Promise<boolean> {
    if (isSickLeaveTypeCode(leaveType)) {
      return true;
    }
    const attCatalog = this.resolveAttLeaveTypeCatalog();
    if (attCatalog) {
      try {
        const effective = await attCatalog.listEffective(
          { company_id: options?.companySlug?.trim() || 'holding' },
          authorization,
          { tenantId: options?.tenantId },
        );
        const codeKey = leaveType.trim().toLowerCase();
        const match = effective.data.find((r) => r.leaveTypeKey === codeKey);
        if (match) {
          if (match.category === 'sick' || match.insuranceRegimeFlag) {
            return true;
          }
          const meta = match.metadata;
          if (meta && (meta.is_sick === true || meta.category === 'sick')) {
            return true;
          }
          if (isSickLeaveLabel(match.nameVi)) {
            return true;
          }
          return false;
        }
      } catch {
        /* fall through to settings REF */
      }
    }
    const settingsCatalogs = this.resolveSettingsCatalogs();
    if (!settingsCatalogs || typeof settingsCatalogs.getEffectiveItemsForKey !== 'function') {
      return false;
    }
    const tenantForCatalog =
      options?.tenantId?.trim() || masterTenantIdFromEnv() || 'xevn';
    // Narrow: companySlug optional on helper options; catalog resolver requires string.
    const catalogCompanyId = resolveHrmSettingsCatalogCompanyId(
      authorization,
      tenantForCatalog,
      options?.companySlug?.trim() || 'holding',
    );
    await this.ensureLeaveTypeCatalogAvailable(authorization, tenantForCatalog, catalogCompanyId);
    const itemsRaw = await settingsCatalogs.getEffectiveItemsForKey(
      tenantForCatalog,
      catalogCompanyId,
      HRM_SC_LEAVE_KEY,
    );
    const items = Array.isArray(itemsRaw) ? itemsRaw : [];
    const codeKey = leaveType.trim().toLowerCase();
    const match = items.find((item) => (item.code ?? '').trim().toLowerCase() === codeKey);
    if (!match) {
      return false;
    }
    return catalogLeaveTypeIndicatesSick(match);
  }

  /** §4.2 / BR-LEAVE-ATT-01 — ốm ≥ 3 ngày cần giấy bác sĩ (attachment_url). */
  private assertSickAttachmentIfRequired(
    isSick: boolean,
    totalDays: number,
    attachmentUrl: string | null,
  ): void {
    if (!isSick) {
      return;
    }
    if (totalDays >= 3 && !attachmentUrl) {
      throw new ApiException(
        HRM_LEAVE_VAL_ATT,
        'sick leave of 3 or more days requires attachment_url under /api/hrm/files/',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async resolveSickLeaveTypeFlags(
    leaveType: string,
    authorization: string | undefined,
    options?: { tenantId?: string; companySlug?: string },
  ): Promise<SickLeaveTypeFlags> {
    const attCatalog = this.resolveAttLeaveTypeCatalog();
    if (attCatalog) {
      try {
        const effective = await attCatalog.listEffective(
          { company_id: options?.companySlug?.trim() || 'holding' },
          authorization,
          { tenantId: options?.tenantId },
        );
        const codeKey = leaveType.trim().toLowerCase();
        const match = effective.data.find((r) => r.leaveTypeKey === codeKey);
        if (match) {
          return {
            insuranceRegimeFlag: Boolean(match.insuranceRegimeFlag),
            companyTopupFlag: Boolean(match.companyTopupFlag),
          };
        }
      } catch {
        /* fall through */
      }
    }
    return {
      insuranceRegimeFlag: isSickLeaveTypeCode(leaveType),
      companyTopupFlag: false,
    };
  }

  private async applySickDayBranchOnSubmit(input: {
    isSick: boolean;
    companyId: string;
    leaveRequestId: string;
    employeeId: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    persistDays: number;
    authorization?: string;
    tenantId?: string;
    companySlug?: string;
  }): Promise<SickDayBranchDisplay[] | undefined> {
    if (!input.isSick || !this.attSickLeaveFundOrder) {
      return undefined;
    }
    const typeFlags = await this.resolveSickLeaveTypeFlags(input.leaveType, input.authorization, {
      tenantId: input.tenantId,
      companySlug: input.companySlug,
    });
    const spanDays = expandLeaveDateRange(input.startDate, input.endDate).length;
    const unitPerDay =
      input.persistDays > 0 && spanDays > 0 ? input.persistDays / spanDays : 1;
    const branches = await this.attSickLeaveFundOrder.allocateAndPersistSickDayBranches({
      companyId: input.companyId,
      leaveRequestId: input.leaveRequestId,
      employeeId: input.employeeId,
      startDate: input.startDate,
      endDate: input.endDate,
      typeFlags,
      deductUnitsPerDay: unitPerDay,
    });
    const annualUnits = this.attSickLeaveFundOrder.sumAnnualBranchUnits(branches);
    if (annualUnits > 0) {
      await this.lockPendingLeaveBalance({
        companyId: input.companyId,
        employeeId: input.employeeId,
        leaveType: 'annual',
        startDate: input.startDate,
        totalDays: annualUnits,
      });
    }
    return branches;
  }

  private async releaseSickDayBranchHolds(
    leaveRequestId: string,
    row: LeaveRow,
    voidReason: string,
  ): Promise<void> {
    if (!this.attSickLeaveFundOrder) {
      return;
    }
    const branches = await this.attSickLeaveFundOrder.listDayBranchesForRequest(leaveRequestId);
    const annualUnits = this.attSickLeaveFundOrder.sumAnnualBranchUnits(branches);
    if (annualUnits > 0) {
      await this.ensureLeaveBalanceSchema();
      const balanceYear = balanceYearFromStartDate(String(row.start_date));
      await this.db.query(
        `
          UPDATE public.employee_leave_balances
          SET pending_days = GREATEST(0, pending_days - $5::numeric),
              updated_at = NOW()
          WHERE company_id = $1
            AND employee_id = $2::uuid
            AND leave_type = 'annual'
            AND balance_year = $4;
        `,
        [
          row.company_id,
          row.employee_id,
          balanceYear,
          annualUnits,
        ],
      );
    }
    await this.attSickLeaveFundOrder.voidDayBranchesForRequest(leaveRequestId, voidReason);
  }

  /**
   * @CODE-MEMORY method · FR-HRM-AT-10 · G-AT10-01 · G-AT10-02
   * SRS bước: Diễn biến #4 Ngày sai · #5 Chồng lịch · #6 Hết phép · #7 Gửi thành công (+ fanout #8)
   * TechSpec: §14.5 / §14.9 ref_srs FR-HRM-AT-10 — company_id TEXT slug ladder + overlap/balance codes
   */
  async createLeaveRequest(
    body: CreateLeaveRequestDto,
    authorization?: string,
    options?: { submitterUserId?: string; tenantId?: string; companySlug?: string },
  ) {
    await this.ensureSchema();
    // Thất bại: Diễn biến #4 — đến ngày trước từ ngày.
    if (body.start_date > body.end_date) {
      throw new ApiException(
        'HRM-LEAVE-VAL-DATES',
        'start_date must be on or before end_date',
        HttpStatus.BAD_REQUEST,
      );
    }
    // G-AT10-01: slug/main/UUID → holding TEXT (parity OT/requisition); không ép ::uuid.
    const companyId = resolveHrmPersistCompanyIdText(authorization, body.company_id, {
      tenantId: options?.tenantId,
    });
    const attachmentUrl = assertValidLeaveAttachmentUrl(body.attachment_url);
    const leaveType = body.leave_type.trim();

    // R-PLT-ATT-01 / BR-PLT-02 — effective union (ATT native wins over group REF).
    const attLeaveCatalog = this.resolveAttLeaveTypeCatalog();
    if (attLeaveCatalog) {
      await attLeaveCatalog.assertLeaveTypeInEffectiveCatalog({
        companyId: body.company_id,
        leaveType,
        authorization,
        tenantId: options?.tenantId,
      });
    } else {
      // Legacy fallback — settings-catalogs only (unit tests without AttLeaveTypeService).
      const settingsCatalogs = this.resolveSettingsCatalogs();
      if (settingsCatalogs) {
        const tenantForCatalog =
          options?.tenantId?.trim() || masterTenantIdFromEnv() || 'xevn';
        const catalogCompanyId = resolveHrmSettingsCatalogCompanyId(
          authorization,
          tenantForCatalog,
          body.company_id,
        );
        await this.ensureLeaveTypeCatalogAvailable(authorization, tenantForCatalog, catalogCompanyId);
        await settingsCatalogs.assertCodeInEffectiveCatalog({
          tenantId: tenantForCatalog,
          companyId: catalogCompanyId,
          catalogKey: HRM_SC_LEAVE_KEY,
          code: leaveType,
          errorCode: 'HRM-ATT-LEAVE-TYPE',
          errorMessage: `leave_type '${leaveType}' is not in leave_types catalog (free-text SoT forbidden)`,
        });
      }
    }

    // BR-LEAVE-ATT-01 — after catalog assert so label/metadata flags can classify LVT_* ốm.
    const isSick = await this.resolveIsSickLeaveType(leaveType, authorization, {
      tenantId: options?.tenantId,
      companySlug: body.company_id,
    });
    this.assertSickAttachmentIfRequired(isSick, body.total_days, attachmentUrl);

    // R-ATT-08-ALIGN / BR-BP-LV-05 — engine units; reject client calendar inflate when holiday SoT live.
    let engine: LeaveDeductionResult | null = null;
    const holidaySvc = this.resolveHolidayCalendar();
    if (holidaySvc) {
      const unit = await this.resolveLeaveTypeUnit({
        companyId: body.company_id,
        leaveType,
        authorization,
        tenantId: options?.tenantId,
      });
      engine = await this.runLeaveDeductionEngine({
        companyId: body.company_id,
        startDate: body.start_date,
        endDate: body.end_date,
        unit,
        authorization,
        tenantId: options?.tenantId,
        requireHolidayCalendar: true,
      });
      const clientDays = toDayNumber(body.total_days);
      if (Math.abs(clientDays - engine.deductible_units) > 0.001) {
        throw new ApiException(
          'HRM-VAL-400',
          `total_days ${clientDays} does not match engine deductible_units ${engine.deductible_units} (BR-BP-LV-05 — calendar inflate rejected)`,
          HttpStatus.BAD_REQUEST,
          {
            total_days: clientDays,
            deductible_units: engine.deductible_units,
            working_days: engine.working_days,
            calendar_days: engine.calendar_days,
            unit: engine.unit,
          },
        );
      }
    }

    const persistDays = engine ? engine.deductible_units : body.total_days;

    // Diễn biến #5 — chồng pending/approved.
    await this.assertNoLeaveOverlap(body.employee_id, body.start_date, body.end_date);
    // Diễn biến #6 — hết phép khi có số dư tracked.
    await this.assertSufficientLeaveBalance({
      companyId,
      employeeId: body.employee_id,
      leaveType,
      startDate: body.start_date,
      totalDays: persistDays,
    });

    const id = randomUUID();
    const res = await this.db.query<LeaveRow>(
      `
        INSERT INTO public.leave_requests (
          id, company_id, employee_id, leave_type, start_date, end_date, reason, status,
          employee_code, employee_name, department, position, total_days, handover_to, handover_tasks,
          attachment_url, working_days, deductible_units, calendar_days, unit, requested_at
        ) VALUES (
          $1::uuid, $2::text, $3::uuid, $4, $5::date, $6::date, $7, 'pending',
          $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, NOW()
        )
        RETURNING *;
      `,
      [
        id,
        companyId,
        body.employee_id,
        leaveType,
        body.start_date,
        body.end_date,
        body.reason?.trim() ?? null,
        body.employee_code.trim(),
        body.employee_name.trim(),
        body.department?.trim() ?? null,
        body.position?.trim() ?? null,
        persistDays,
        body.handover_to?.trim() ?? null,
        body.handover_tasks?.trim() ?? null,
        attachmentUrl,
        engine?.working_days ?? null,
        engine?.deductible_units ?? null,
        engine?.calendar_days ?? null,
        engine?.unit ?? null,
      ],
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException('HRM-LEAVE-500', 'Failed to create leave request', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    // Diễn biến #3 — khóa số dư tạm khi hệ thống theo dõi (row balance tồn tại).
    await this.lockPendingLeaveBalance({
      companyId,
      employeeId: body.employee_id,
      leaveType,
      startDate: body.start_date,
      totalDays: persistDays,
    });
    const payload = this.toPayload(row);
    await this.fanout.onLeaveRequestCreated(payload);
    const wfResult = await this.leaveWorkflowBridge.startLeaveWorkflowIfConfigured({
      leaveRequestId: row.id,
      companyId: row.company_id,
      employeeId: row.employee_id,
      submitterUserId: options?.submitterUserId,
      tenantId: options?.tenantId,
      companySlug: options?.companySlug ?? companyId,
      authorization,
    });
    const refreshed = await this.loadLeaveRequestById(row.id);
    const workflowInstanceId =
      refreshed?.workflow_instance_id?.trim() ||
      wfResult?.workflowInstanceId?.trim() ||
      null;
    const base = refreshed ?? row;
    const dayBranches = await this.applySickDayBranchOnSubmit({
      isSick,
      companyId,
      leaveRequestId: row.id,
      employeeId: body.employee_id,
      leaveType,
      startDate: body.start_date,
      endDate: body.end_date,
      persistDays,
      authorization,
      tenantId: options?.tenantId,
      companySlug: options?.companySlug ?? companyId,
    });
    const display = toLeaveDisplayRow({ ...base, workflow_instance_id: workflowInstanceId });
    return dayBranches?.length ? { ...display, dayBranches } : display;
  }

  async approveLeaveRequestInternal(requestId: string, body: DecideLeaveRequestDto) {
    const res = await this.db.query<LeaveRow>(
      `
        UPDATE public.leave_requests
        SET status = 'approved',
            reviewed_at = NOW(),
            reviewed_by = $2,
            approver_employee_id = COALESCE($3::uuid, approver_employee_id)
        WHERE id = $1::uuid AND status = 'pending'
        RETURNING *;
      `,
      [requestId, body.reviewer_name.trim(), body.reviewer_employee_id ?? null],
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException('HRM-LEAVE-404', 'Leave request not found or not pending', HttpStatus.NOT_FOUND);
    }
    await this.settleApprovedLeaveBalance(row);
    await this.fanout.onLeaveRequestDecided('approved', this.toPayload(row));
    const funnel = await this.materializeLeaveFunnel(row);
    return {
      ...toLeaveDisplayRow(row),
      materialized_days: funnel.materialized_days,
      materialized_record_ids: funnel.materialized_record_ids,
      ...(funnel.leave_funnel_deferred
        ? {
            leave_funnel_deferred: true,
            leave_funnel_deferred_code: funnel.leave_funnel_deferred_code,
          }
        : {}),
    };
  }

  async rejectLeaveRequestInternal(requestId: string, body: DecideLeaveRequestDto) {
    const res = await this.db.query<LeaveRow>(
      `
        UPDATE public.leave_requests
        SET status = 'rejected',
            reviewed_at = NOW(),
            reviewed_by = $2,
            rejected_reason = $3,
            approver_employee_id = COALESCE($4::uuid, approver_employee_id)
        WHERE id = $1::uuid AND status = 'pending'
        RETURNING *;
      `,
      [
        requestId,
        body.reviewer_name.trim(),
        body.rejected_reason?.trim() ?? null,
        body.reviewer_employee_id ?? null,
      ],
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException('HRM-LEAVE-404', 'Leave request not found or not pending', HttpStatus.NOT_FOUND);
    }
    await this.releasePendingLeaveBalance(row);
    await this.releaseSickDayBranchHolds(requestId, row, 'rejected');
    await this.fanout.onLeaveRequestDecided('rejected', this.toPayload(row));
    return toLeaveDisplayRow(row);
  }

  async listLeaveRequests(
    query: ListLeaveRequestsQueryDto,
    authorization?: string,
    tenantId?: string,
  ) {
    await this.ensureSchema();
    const scopeCompanyId = normalizePayrollListCompanyId(authorization, query.company_id);
    const scope = resolveHrmListScope(authorization, scopeCompanyId, { tenantId });
    const params: unknown[] = [];
    const filters: string[] = [];
    pushWorkforceEmployeeScopeFilter(filters, params, scope, 'lr.employee_id');
    let sql = `SELECT lr.* FROM public.leave_requests lr WHERE ${filters.join(' AND ')}`;
    if (query.status?.trim()) {
      params.push(query.status.trim());
      sql += ` AND lr.status = $${params.length}`;
    }
    if (query.employee_id) {
      params.push(query.employee_id);
      sql += ` AND lr.employee_id = $${params.length}::uuid`;
    }
    if (query.manager_employee_id) {
      params.push(query.manager_employee_id);
      sql += ` AND lr.employee_id IN (
        SELECT e.id FROM public.employees e
        WHERE e.manager_id = $${params.length}::uuid AND e.archived_at IS NULL
      )`;
    }
    sql += ` ORDER BY lr.requested_at DESC LIMIT 200`;
    const res = await this.db.query<LeaveRow>(sql, params);
    return { total: res.rows.length, data: res.rows.map((r) => toLeaveDisplayRow(r)) };
  }

  private async loadLeaveRequestCompany(
    requestId: string,
  ): Promise<{ company_id: string; status: string } | null> {
    const res = await this.db.query<{ company_id: string; status: string }>(
      `SELECT company_id::text AS company_id, status FROM public.leave_requests WHERE id = $1::uuid LIMIT 1;`,
      [requestId],
    );
    return res.rows[0] ?? null;
  }

  async approveLeaveRequest(
    requestId: string,
    body: DecideLeaveRequestDto,
    requestedCompanyId: string,
    authorization?: string,
    tenantId?: string,
  ) {
    // G-AT10-01 / AT-12 — UUID query → slug ladder (parity list); row.company_id is TEXT.
    const scopeCompanyId = normalizePayrollListCompanyId(authorization, requestedCompanyId);
    const scope = resolveHrmListScope(authorization, scopeCompanyId, { tenantId });
    const existing = await this.loadLeaveRequestCompany(requestId);
    assertResourceInHrmScope(existing, scope, {
      notFoundCode: 'HRM-LEAVE-404',
      mismatchCode: 'HRM-LEAVE-409',
    });
    assertStatusTransition({
      domain: 'leave',
      from: String(existing!.status ?? 'pending'),
      to: 'approved',
      entityId: requestId,
    });
    const res = await this.db.query<LeaveRow>(
      `
        UPDATE public.leave_requests
        SET status = 'approved',
            reviewed_at = NOW(),
            reviewed_by = $2,
            approver_employee_id = COALESCE($3::uuid, approver_employee_id)
        WHERE id = $1::uuid AND status = 'pending'
        RETURNING *;
      `,
      [requestId, body.reviewer_name.trim(), body.reviewer_employee_id ?? null],
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException('HRM-LEAVE-404', 'Leave request not found or not pending', HttpStatus.NOT_FOUND);
    }
    await this.settleApprovedLeaveBalance(row);
    await this.fanout.onLeaveRequestDecided('approved', this.toPayload(row));
    const funnel = await this.materializeLeaveFunnel(row);
    return {
      ...toLeaveDisplayRow(row),
      materialized_days: funnel.materialized_days,
      materialized_record_ids: funnel.materialized_record_ids,
      ...(funnel.leave_funnel_deferred
        ? {
            leave_funnel_deferred: true,
            leave_funnel_deferred_code: funnel.leave_funnel_deferred_code,
          }
        : {}),
    };
  }

  async rejectLeaveRequest(
    requestId: string,
    body: DecideLeaveRequestDto,
    requestedCompanyId: string,
    authorization?: string,
    tenantId?: string,
  ) {
    // G-AT10-01 / AT-13 — same slug/TEXT scope ladder as approve + list.
    const scopeCompanyId = normalizePayrollListCompanyId(authorization, requestedCompanyId);
    const scope = resolveHrmListScope(authorization, scopeCompanyId, { tenantId });
    const existing = await this.loadLeaveRequestCompany(requestId);
    assertResourceInHrmScope(existing, scope, {
      notFoundCode: 'HRM-LEAVE-404',
      mismatchCode: 'HRM-LEAVE-409',
    });
    assertStatusTransition({
      domain: 'leave',
      from: String(existing!.status ?? 'pending'),
      to: 'rejected',
      entityId: requestId,
    });
    const res = await this.db.query<LeaveRow>(
      `
        UPDATE public.leave_requests
        SET status = 'rejected',
            reviewed_at = NOW(),
            reviewed_by = $2,
            rejected_reason = $3,
            approver_employee_id = COALESCE($4::uuid, approver_employee_id)
        WHERE id = $1::uuid AND status = 'pending'
        RETURNING *;
      `,
      [
        requestId,
        body.reviewer_name.trim(),
        body.rejected_reason?.trim() ?? null,
        body.reviewer_employee_id ?? null,
      ],
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException('HRM-LEAVE-404', 'Leave request not found or not pending', HttpStatus.NOT_FOUND);
    }
    await this.releasePendingLeaveBalance(row);
    await this.releaseSickDayBranchHolds(requestId, row, 'rejected');
    await this.fanout.onLeaveRequestDecided('rejected', this.toPayload(row));
    return toLeaveDisplayRow(row);
  }

  /**
   * F-ATT-LEAVE-FUNNEL-02 — cancel pending or approved (after approve → reverse markers).
   * Approved→cancelled allowed (SM ADD); closed sheet overlap → 409 LOCKED from funnel.
   */
  async cancelLeaveRequest(
    requestId: string,
    body: DecideLeaveRequestDto,
    requestedCompanyId: string,
    authorization?: string,
    tenantId?: string,
  ) {
    const scopeCompanyId = normalizePayrollListCompanyId(authorization, requestedCompanyId);
    const scope = resolveHrmListScope(authorization, scopeCompanyId, { tenantId });
    const existing = await this.loadLeaveRequestCompany(requestId);
    assertResourceInHrmScope(existing, scope, {
      notFoundCode: 'HRM-LEAVE-404',
      mismatchCode: 'HRM-LEAVE-409',
    });
    const fromStatus = String(existing!.status ?? 'pending');
    assertStatusTransition({
      domain: 'leave',
      from: fromStatus,
      to: 'cancelled',
      entityId: requestId,
    });
    if (fromStatus === 'approved') {
      await this.reverseLeaveFunnel(requestId, existing!.company_id);
    }
    const res = await this.db.query<LeaveRow>(
      `
        UPDATE public.leave_requests
        SET status = 'cancelled',
            reviewed_at = NOW(),
            reviewed_by = $2,
            rejected_reason = COALESCE($3, rejected_reason)
        WHERE id = $1::uuid AND status IN ('pending', 'approved')
        RETURNING *;
      `,
      [requestId, body.reviewer_name.trim(), body.rejected_reason?.trim() ?? null],
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException('HRM-LEAVE-404', 'Leave request not found or not cancellable', HttpStatus.NOT_FOUND);
    }
    if (fromStatus === 'pending') {
      await this.releasePendingLeaveBalance(row);
      await this.releaseSickDayBranchHolds(requestId, row, 'cancelled');
    }
    await this.fanout.onLeaveRequestDecided('rejected', this.toPayload(row));
    return toLeaveDisplayRow(row);
  }
}
