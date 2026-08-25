/**
 * @CODE-MEMORY
 * Screen:     HRM → Chấm công (HTTP /attendance)
 * UC:         HRM-AT-14 · HRM-AT-10 · HRM-AT-01..03
 * BR:         BR-ATT-SHEET-01..07 · AC-ATT-SHEET-01..06
 * SRS:        docs/client-delivery/hrm/SRS_HRM_KHACH.md §3.4 FR-HRM-AT-14 · §3.5 FR-HRM-AT-10 · §3.9 FR-HRM-AT-01
 * SRS bước:   AT-14 #1/#3/#8 list/create sheet · AT-10 #1/#7 leave · AT-01 #7 record
 * TechSpec:   docs/hrm/TECHSPEC.md §14.4 · §14.5 · §12.1/§13 (ref_srs: FR-HRM-AT-14 · FR-HRM-AT-10)
 * Purpose:    Surface bảng công / điểm danh / đơn nghỉ — empty trung thực, không storm.
 * WorkItem:   BE-HRM-CODE-MEMORY-SRS-STEP-01
 * Coded:      2026-07-21
 * Callers:    apps/web/hrm attendance tabs · mobile leave
 * Callees:    AttendanceCatalogService (sheets) · AttendanceService (records) · LeaveRequestsService
 * FE-Actions: Tạo bảng → POST attendance-sheets; Ghi công → POST records; Đơn nghỉ → POST leave-requests
 * BE-Chain:   controller → catalog/service → attendance_sheets / attendance_records / leave_requests
 * Impact:     Phá AC-ATT-SHEET → empty giả / storm reload
 * must_keep:  AC-ATT-SHEET-01..06 · leave-workflow bridge · empty honesty
 * SOLID:      Catalog sheets tách records/leave
 * LastVerified: attendance leave/sheet jest suites
 *
 * @CODE-MEMORY-CHANGE 2026-07-21
 * WorkItem: BE-HRM-CODE-MEMORY-SRS-STEP-01
 * change_mode: ADD
 * What: Map Diễn biến AT-14/AT-10/AT-01 lên handlers (không đổi nghiệp vụ)
 * Why: Sponsor lock CODE-MEMORY ↔ SRS
 * must_keep: AC-ATT-SHEET · G-RC-01 không đụng
 *
 * @CODE-MEMORY-CHANGE 2026-07-21
 * WorkItem: BE-HRM-C-CONV-AS-01
 * change_mode: ADD
 * What: Wire CreateAttendanceSheetDto / UpdateAttendanceSheetDto on POST/PATCH sheets
 * Why: TechSpec §15.1 DTO at edge — ValidationPipe whitelist (C-CONV-AS-01)
 * must_keep: AC-ATT-SHEET-01..06 empty honesty / no auto-seed roster
 *
 * @CODE-MEMORY-CHANGE 2026-08-04
 * WorkItem: U78-U84-ATT-ADJ-TMDV-SCOPE-PARITY-01
 * change_mode: FIX
 * What: update-requests mutate handlers pass resolveScopeContext().companyId (member
 *       portal main→JWT slug) into service guard — not raw x-company-id header.
 * Why:  QA R1 mgr Duyệt SCOPE_CONTEXT_MISMATCH when FE spreadsheet scope forces main.
 * must_keep: leave approve paths; list query company_id ?? header; U65
 *
 * @CODE-MEMORY-CHANGE 2026-08-04
 * WorkItem: PO-MFD-M2-ATT-SCOPE-01
 * change_mode: FIX
 * What: leave/OT mutate pass resolveScopeContext().companyId (U78 parity update-requests).
 * Why:  Member mgr x-company-id=main → 409 when row stored under JWT OU slug.
 * must_keep: U78 update-requests; BR-WF-04; AT-12 SPEC_GAP not invented
 *
 * @CODE-MEMORY-CHANGE 2026-08-05
 * WorkItem: PO-HRM-ATT-03d-05b-BE-01
 * change_mode: ADD
 * What: GET leave-balance/panel (ATT-05b); work-sites CRUD đã sẵn — giữ surface cho FE wire.
 * Why:  SRS v0.8 MVP panel quỹ + GPS điểm.
 * must_keep: single leave-balance; work_shifts wins; Face GĐ2; no PROP-03e
 *
 * @CODE-MEMORY-CHANGE 2026-08-05
 * WorkItem: PO-HRM-BP-ATT-SIGN-BE-01
 * change_mode: ADD
 * What: GET sheet/{id} · GET/POST signatures · POST close/reopen · resolveScopeContext on sheet mutate
 * Why:  UC-BP-ATT-11 · TR-CM-16
 * must_keep: path attendance/attendance-sheets; scope.companyId on mutate (PO-MFD-M2)
 *
 * @CODE-MEMORY-CHANGE 2026-08-07
 * WorkItem: PO-HRM-PAYROLL-FORMULA-RUN-GAP-BE-ATT-LINE-01
 * change_mode: ADD
 * What: POST attendance-sheets/:sheetId/aggregate (F-ATT-SHEET-AGG-01 · OPEN-Q2 Option C)
 * Why:  Materialize att_timesheet_line trước ký; submit cũng gọi AGG
 * must_keep: sign/close/reopen · scope.companyId · soft-delete
 *
 * @CODE-MEMORY-CHANGE 2026-08-07
 * WorkItem: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-BE-01
 * change_mode: ADD
 * What: Surface F-ATT-CAT-LVT-01/02 + F-ATT-CAT-EFF-01 under /attendance/leave-types*
 * Why: Platform Option B ATT vertical · open leave catalog
 * must_keep: work-sites AS-IS · work_shifts ops · sheet/sign · U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-08
 * WorkItem: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-WORKSITE-CATALOG-BE-01
 * change_mode: UPGRADE
 * What: F-ATT-CAT-WS-01 include_inactive query; DELETE work-sites soft-retire (+ hard=true residual)
 * Why: BA CNS-03b/04 · BR-PLT-04 · SA Option B
 * must_keep: leave-types · work_shifts · sheet/sign · U65 · SITE-UNKNOWN HOLD
 *
 * @CODE-MEMORY-CHANGE 2026-08-08
 * WorkItem: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-BE-01
 * change_mode: ADD
 * What: Surface F-ATT-CAT-OTC-01/02 + EFF under /attendance/ot-comp-types* (OT compensation catalog)
 * Why: Platform Option B ATT OT-compensation catalog · open N+1 · invent KEY HRM-ATT-OT-COMP-KEY on OT create
 * must_keep: orthogonal vs ot-types (att_ot_type SEAL) · leave / code / worksite / shifts seals ·
 *            formula HOLD · U65 no seed · KEEP overtime_requests.compensation_type TEXT
 *
 * @CODE-MEMORY-CHANGE 2026-08-08
 * WorkItem: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-BE-01
 * change_mode: ADD
 * What: Surface F-ATT-CAT-CODE-01..04 + F-ATT-CAT-CODE-EFF-01 under /attendance/attendance-codes*
 * Why: Platform Option B ATT day-code catalog · open N+1 · invent KEY on records
 * must_keep: leave-types · work-sites · work_shifts · sheet/sign · L-ATT-CODE-07 · U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-08
 * WorkItem: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-BE-01
 * change_mode: FIX
 * What: F-ATT-CAT-SHIFT-01 include_inactive + /effective + get-by-id; DELETE soft-retire (?hard=true)
 * Why: BA VAL-CNS-03b/04 · AC-01e · SA Option B ADR D1
 * must_keep: leave-types · work-sites · ATT-CODE · sheet/sign · U65 · no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-08
 * WorkItem: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-BE-01
 * change_mode: ADD
 * What: Surface F-ATT-LVRULE-01..04 under /attendance/leave-accrual-policies*
 * Why: Option B Nest rule schema · invent KEY · engine LIVE HOLD
 * must_keep: att_leave_type L1 · ATT-CODE/WS/SHIFT · ledger · U65 · no seed · no engine LIVE
 *
 * @CODE-MEMORY-CHANGE 2026-08-08 · PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-BALANCE-BE-02
 * change_mode: ADD
 * What: POST leave-accrual-policies/assert-consumer wires assertLeaveAccrualPolicyForConsumer
 *       so Network emits 4xx HRM-ATT-LVRULE-KEY on consumer invent (active policy>0).
 * Why: QC Condition R-PLT-ATT-LVRULE-CNS-WIRE — helper+jest LIVE nhưng HTTP surface ABSENT.
 * must_keep: engine HOLD (no F-ATT-LEAVE-04 LIVE) · admin CREATE untouched · orthogonal TYPE/UNKNOWN
 *
 * @CODE-MEMORY-CHANGE 2026-08-08
 * WorkItem: PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-BE-01
 * change_mode: ADD
 * What: Surface F-ATT-CAT-OT-01/02 + EFF under /attendance/ot-types*
 * Why: Platform Option B ATT OT-type catalog · open N+1 · invent KEY on OT create
 * must_keep: leave-types · work-sites · ATT-CODE · work_shifts · LVRULE HOLD · formula HOLD · U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-09
 * WorkItem: PO-HRM-MVP-GD1-ATT-02-CLUSTER-BE-01
 * change_mode: ADD
 * What: PATCH /attendance/rules/late-penalty (same family) · GET rules department_id/shift_id
 * Why: FR-UC-BP-ATT-02 · F-ATT-RULE-01 API-01 · Nest /core DENY
 * must_keep: peers work-sites/shifts/late_early/punch/funnel · CFG ≠ ATT-02 DONE · U65
 *
 * @CODE-MEMORY-CHANGE 2026-08-09
 * WorkItem: PO-HRM-MVP-GD1-ATT-08-CLUSTER-BE-01
 * change_mode: ADD
 * What: POST leave-requests/preview-deduction · GET/PUT holiday-calendars/:year (thin F-ATT-HOL-01)
 * Why: FR-UC-BP-ATT-08 BR-BP-LV-05 · API-01 F.1 · Nest /core DENY
 * must_keep: leave-requests RETAIN · ATT02QC1-MSLQZUK7 CFG≠DONE · ≠ ATT-09/03b DONE · PAY OUT
 *
 * @CODE-MEMORY-CHANGE 2026-08-09
 * WorkItem: PO-HRM-MVP-GD1-ATT-09-CLUSTER-BE-02
 * change_mode: ADD
 * What: PUT leave-balance/tracked-entitlement — HR upsert employee_leave_balances (U65 product path)
 * Why:  UC-BP-ATT-09 tracked hold · QA R-ATT-09-NO-TRACKED-BALANCE · ≠ pnpm seed:*
 * must_keep: GET leave-balance/panel · pending_days hold SoT · Nest /core DENY · ≠ ATT-09 DONE
 *
 * @CODE-MEMORY-CHANGE 2026-08-09
 * WorkItem: PO-HRM-MVP-GD1-ATT-03B-CLUSTER-BE-01
 * change_mode: UPGRADE
 * What: GET/PUT holiday-calendars/:year deepen residual lunar/type/publish on LIVE att_holiday_*
 * Why:  UC-BP-ATT-03b · API-01 RETAIN · DATA stamped closable · Nest /core DENY
 * must_keep: ATT08 HOL-MISS · ≠ thin alone=ATT-03b DONE · sheet HOL OUT · PAY OUT · printable false
 */
import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { ok } from '../common/api-response';
import {
  isAuthorizedInternalRequest,
  resolveAuthorizationHeader,
  getVerifiedInternalJwtPayload,
} from '../common/internal-auth';
import { toHrmListScopeContext } from '../common/hrm-list-scope-context';
import { resolveScopeContext } from '../common/scope-context';
import { AttendanceService } from './attendance.service';
import { AttendanceCatalogService } from './attendance-catalog.service';
import { CreateAttendanceSheetDto } from './dto/create-attendance-sheet.dto';
import { UpdateAttendanceSheetDto } from './dto/update-attendance-sheet.dto';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { DecideLeaveRequestDto } from './dto/decide-leave-request.dto';
import { ListLeaveRequestsQueryDto } from './dto/list-leave-requests.query.dto';
import {
  GetHolidayCalendarQueryDto,
  PreviewLeaveDeductionDto,
  PutHolidayCalendarDto,
} from './dto/preview-leave-deduction.dto';
import { AttendanceRequestsService } from './attendance-requests.service';
import { LeaveRequestsService } from './leave-requests.service';
import { LeaveBalanceService } from './leave-balance.service';
import { AttHolidayCalendarService } from './att-holiday-calendar.service';
import { AttendanceOverviewService } from './attendance-overview.service';
import { GetLeaveBalancePanelQueryDto } from './dto/get-leave-balance-panel.query.dto';
import { GetLeaveBalanceQueryDto } from './dto/get-leave-balance.query.dto';
import { UpsertTrackedLeaveBalanceDto } from './dto/upsert-tracked-leave-balance.dto';
import {
  EnrollOnActivateDto,
  UpsertShiftAssignmentDto,
} from './dto/att-activate-enroll.dto';
import { AttActivateEnrollService } from './att-activate-enroll.service';
import { GetActivateDefaultShiftQueryDto } from './dto/get-activate-default-shift.query.dto';
import { AttendanceOverviewQueryDto } from './dto/attendance-overview.query.dto';
import { CreateBusinessTripRequestDto } from './dto/create-business-trip-request.dto';
import { CreateLateEarlyRequestDto } from './dto/create-late-early-request.dto';
import { CreateOvertimeRequestDto } from './dto/create-overtime-request.dto';
import { CreateShiftChangeRequestDto } from './dto/create-shift-change-request.dto';
import { ListAttendanceRequestsQueryDto } from './dto/list-attendance-requests.query.dto';
import { CreateAttendanceUpdateRequestDto } from './dto/create-attendance-update-request.dto';
import { DecideAttendanceUpdateRequestDto } from './dto/decide-attendance-update-request.dto';
import { CreateAttendanceRecordDto } from './dto/create-attendance-record.dto';
import { GetAttendanceRecordQueryDto } from './dto/get-attendance-record.query.dto';
import { ListAttendanceRecordsQueryDto } from './dto/list-attendance-records.query.dto';
import { ListAttendanceUpdateRequestsQueryDto } from './dto/list-attendance-update-requests.query.dto';
import { UpdateAttendanceUpdateRequestDto } from './dto/update-attendance-update-request.dto';
import { UpdateAttendanceStatusDto } from './dto/update-attendance-status.dto';
import { UpdateAttendanceRulesDto } from './dto/update-attendance-rules.dto';
import { CreateWorkSiteDto } from './dto/create-work-site.dto';
import { UpdateWorkSiteDto } from './dto/update-work-site.dto';
import { AttendanceConfigService } from './attendance-config.service';
import { AttLeaveTypeService } from './att-leave-type.service';
import { AttLeaveAccrualPolicyService } from './att-leave-accrual-policy.service';
import { AttAttendanceCodeService } from './att-attendance-code.service';
import { AttOtTypeService } from './att-ot-type.service';
import { AttOtCompTypeService } from './att-ot-comp-type.service';
import { AttOtCompLeavePolicyService } from './att-ot-comp-leave-policy.service';
import { AttSickLeaveFundOrderService } from './att-sick-leave-fund-order.service';
import { AttendanceSheetSignService } from './attendance-sheet-sign.service';
import { CreateAttendanceSheetSignatureDto } from './dto/create-attendance-sheet-signature.dto';
import { ReopenAttendanceSheetDto } from './dto/reopen-attendance-sheet.dto';
import {
  GetAttLeaveTypeQueryDto,
  ListAttLeaveTypesQueryDto,
  ListEffectiveAttLeaveTypesQueryDto,
  PatchAttLeaveTypeDto,
  UpsertAttLeaveTypeDto,
} from './dto/att-leave-type.dto';
import {
  AssertConsumerAttLeaveAccrualPolicyDto,
  CreateAttLeaveAccrualPolicyDto,
  GetAttLeaveAccrualPolicyQueryDto,
  ListAttLeaveAccrualPoliciesQueryDto,
  PatchAttLeaveAccrualPolicyDto,
  ResolveEffectiveAttLeaveAccrualPolicyQueryDto,
} from './dto/att-leave-accrual-policy.dto';
import {
  GetAttAttendanceCodeQueryDto,
  ListAttAttendanceCodesQueryDto,
  ListEffectiveAttAttendanceCodesQueryDto,
  PatchAttAttendanceCodeDto,
  UpsertAttAttendanceCodeDto,
} from './dto/att-attendance-code.dto';
import {
  GetAttOtTypeQueryDto,
  ListAttOtTypesQueryDto,
  ListEffectiveAttOtTypesQueryDto,
  PatchAttOtTypeDto,
  UpsertAttOtTypeDto,
} from './dto/att-ot-type.dto';
import {
  GetAttOtCompTypeQueryDto,
  ListAttOtCompTypesQueryDto,
  ListEffectiveAttOtCompTypesQueryDto,
  PatchAttOtCompTypeDto,
  UpsertAttOtCompTypeDto,
} from './dto/att-ot-comp-type.dto';
import {
  GetOtCompLeavePolicyQueryDto,
  PutOtCompLeavePolicyDto,
} from './dto/att-ot-comp-leave-policy.dto';
import {
  GetSickLeaveFundOrderQueryDto,
  PutSickLeaveFundOrderDto,
} from './dto/att-sick-leave-fund-order.dto';
import { AttShiftService } from './att-shift.service';
import { AttRuleService } from './att-rule.service';
import { AttScheduleService } from './att-schedule.service';
import {
  ListAttShiftRuleScheduleQueryDto,
  UpsertAttShiftDto,
  UpsertAttRuleDto,
  UpsertAttScheduleDto,
} from './dto/att-shift-schedule.dto';

@Controller('attendance')
export class AttendanceController {
  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly attendanceCatalog: AttendanceCatalogService,
    private readonly attendanceConfig: AttendanceConfigService,
    private readonly attLeaveTypeService: AttLeaveTypeService,
    private readonly attLeaveAccrualPolicyService: AttLeaveAccrualPolicyService,
    private readonly attAttendanceCodeService: AttAttendanceCodeService,
    private readonly attOtTypeService: AttOtTypeService,
    private readonly attOtCompTypeService: AttOtCompTypeService,
    private readonly attOtCompLeavePolicyService: AttOtCompLeavePolicyService,
    private readonly attSickLeaveFundOrderService: AttSickLeaveFundOrderService,
    private readonly attShiftService: AttShiftService,
    private readonly attRuleService: AttRuleService,
    private readonly attScheduleService: AttScheduleService,
    private readonly leaveRequestsService: LeaveRequestsService,
    private readonly leaveBalanceService: LeaveBalanceService,
    private readonly attActivateEnrollService: AttActivateEnrollService,
    private readonly attHolidayCalendarService: AttHolidayCalendarService,
    private readonly attendanceRequestsService: AttendanceRequestsService,
    private readonly attendanceOverviewService: AttendanceOverviewService,
    private readonly attendanceSheetSign: AttendanceSheetSignService,
  ) {}

  private assertBusinessAccess(
    authorization?: string,
    internalApiKey?: string,
  ) {
    if (!isAuthorizedInternalRequest(authorization, internalApiKey)) {
      throw new ApiException(
        'HRM-AUTH-001',
        'Unauthorized attendance access',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  /**
   * @CODE-MEMORY method · FR-HRM-AT-01
   * SRS bước: Diễn biến #1 auth · #7 Lưu thành công — ghi bản ghi chấm công
   * TechSpec: §14.4 liên kết lưới · FR-HRM-AT-01 · POST records → HRM-ATT-201
   */
  @Post('records')
  createRecord(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: CreateAttendanceRecordDto,
  ) {
    // Xử lý: Diễn biến #1 — auth trước ghi điểm danh.
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: body.company_id ?? headerCompanyId,
    });
    return (
      this.attendanceService
        .createRecord(body, authorization, tenantId)
        // Thành công: Diễn biến #7 — bản ghi trên danh sách/lưới kỳ.
        .then((data) => ok(data, 'HRM-ATT-201', 'Attendance record created'))
    );
  }

  /**
   * @CODE-MEMORY method · FR-HRM-AT-02 / AT-14 #9–#10
   * SRS bước: Diễn biến list records — empty lưới trung thực khi chưa điểm danh
   * TechSpec: §14.4 · AC-ATT-SHEET-06 · GET records → HRM-ATT-200
   */
  @Get('records')
  listRecords(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: ListAttendanceRecordsQueryDto,
    @Headers() headers: Record<string, unknown> = {},
  ) {
    const authHeader = resolveAuthorizationHeader(authorization, headers);
    this.assertBusinessAccess(authHeader, internalApiKey);
    resolveScopeContext(authHeader, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.attendanceService
      .listRecords(query, authHeader, toHrmListScopeContext(tenantId))
      .then((data) => ok(data, 'HRM-ATT-200', 'Attendance records listed'));
  }

  @Get('records/:recordId')
  getRecord(
    @Param('recordId') recordId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: GetAttendanceRecordQueryDto,
    @Headers() headers: Record<string, unknown> = {},
  ) {
    const authHeader = resolveAuthorizationHeader(authorization, headers);
    this.assertBusinessAccess(authHeader, internalApiKey);
    resolveScopeContext(authHeader, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.attendanceService
      .getRecordById(
        recordId,
        query,
        authHeader,
        toHrmListScopeContext(tenantId),
      )
      .then((data) => ok(data, 'HRM-ATT-200', 'Attendance record loaded'));
  }

  @Patch('records/:recordId/status')
  updateStatus(
    @Param('recordId') recordId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
    @Body() body: UpdateAttendanceStatusDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.attendanceService
      .updateStatus(
        recordId,
        body,
        companyId ?? 'main',
        authorization,
        tenantId,
      )
      .then((data) => ok(data, 'HRM-ATT-202', 'Attendance status updated'));
  }

  @Post('update-requests')
  createUpdateRequest(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: CreateAttendanceUpdateRequestDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: body.company_id ?? headerCompanyId,
    });
    return this.attendanceService
      .createUpdateRequest(body, authorization, tenantId)
      .then((data) =>
        ok(data, 'HRM-ATT-REQ-201', 'Attendance update request created'),
      );
  }

  @Get('update-requests')
  listUpdateRequests(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: ListAttendanceUpdateRequestsQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.attendanceService
      .listUpdateRequests(query, authorization, tenantId)
      .then((data) =>
        ok(data, 'HRM-ATT-REQ-200', 'Attendance update requests listed'),
      );
  }

  @Patch('update-requests/:requestId')
  updateUpdateRequest(
    @Param('requestId') requestId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
    @Body() body: UpdateAttendanceUpdateRequestDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    // U78-U84 — use resolved scope.companyId (member portal main→JWT slug) for mutate guard.
    const scope = resolveScopeContext(authorization, { tenantId, companyId });
    return this.attendanceService
      .updateUpdateRequest(
        requestId,
        body,
        scope.companyId,
        authorization,
        tenantId,
      )
      .then((data) =>
        ok(data, 'HRM-ATT-REQ-202', 'Attendance update request updated'),
      );
  }

  @Post('update-requests/:requestId/approve')
  approveUpdateRequest(
    @Param('requestId') requestId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
    @Body() body: DecideAttendanceUpdateRequestDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId });
    return this.attendanceService
      .approveUpdateRequest(
        requestId,
        body,
        scope.companyId,
        authorization,
        tenantId,
      )
      .then((data) =>
        ok(data, 'HRM-ATT-REQ-203', 'Attendance update request approved'),
      );
  }

  @Post('update-requests/:requestId/reject')
  rejectUpdateRequest(
    @Param('requestId') requestId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
    @Body() body: DecideAttendanceUpdateRequestDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId });
    return this.attendanceService
      .rejectUpdateRequest(
        requestId,
        body,
        scope.companyId,
        authorization,
        tenantId,
      )
      .then((data) =>
        ok(data, 'HRM-ATT-REQ-204', 'Attendance update request rejected'),
      );
  }

  @Delete('update-requests/:requestId')
  deleteUpdateRequest(
    @Param('requestId') requestId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId });
    return this.attendanceService
      .deleteUpdateRequest(requestId, scope.companyId, authorization, tenantId)
      .then((data) =>
        ok(data, 'HRM-ATT-REQ-205', 'Attendance update request deleted'),
      );
  }

  /**
   * @CODE-MEMORY method · FR-HRM-AT-10
   * SRS bước: Diễn biến #1 auth · #7 Gửi thành công — tạo đơn nghỉ phép
   * TechSpec: §14.5 ref_srs FR-HRM-AT-10 · POST leave-requests → HRM-LEAVE-201
   *
   * @CODE-MEMORY-CHANGE 2026-07-27 · D-HRM-LEAVE-REQ-CREATE-BE-01
   * What: Pass x-tenant-id into createLeaveRequest for catalog partition + persist scope
   */
  @Post('leave-requests')
  createLeaveRequest(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: CreateLeaveRequestDto,
  ) {
    // Xử lý: Diễn biến #1 — auth; validate ngày/số dư ở service (#3–#6).
    this.assertBusinessAccess(authorization, internalApiKey);
    const jwtPayload = getVerifiedInternalJwtPayload(authorization);
    const submitterUserId =
      typeof jwtPayload?.sub === 'string' && jwtPayload.sub.trim()
        ? jwtPayload.sub.trim().toLowerCase()
        : undefined;
    const scope = resolveScopeContext(authorization, {
      tenantId,
      companyId: body.company_id ?? headerCompanyId,
    });
    return (
      this.leaveRequestsService
        .createLeaveRequest(body, authorization, {
          tenantId: scope.tenantId,
          companySlug: headerCompanyId ?? scope.companyId,
          submitterUserId,
        })
        // Thành công: Diễn biến #7 — đơn chờ duyệt trên list (+ workflow_instance_id khi spawn OK).
        .then((data) => ok(data, 'HRM-LEAVE-201', 'Leave request created'))
    );
  }

  /**
   * F-ATT-LEAVE-01 / FR-UC-BP-ATT-08 — preview BR-BP-LV-05 (T6→T2=2 · HOL-MISS · Q-LEAVE-UNIT).
   * Static path BEFORE :requestId/* — Nest /core DENY.
   */
  @Post('leave-requests/preview-deduction')
  previewLeaveDeduction(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: PreviewLeaveDeductionDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, {
      tenantId,
      companyId: body.companyId ?? body.company_id ?? headerCompanyId,
    });
    return this.leaveRequestsService
      .previewDeduction(body, authorization, {
        tenantId: scope.tenantId,
        companySlug: headerCompanyId ?? scope.companyId,
      })
      .then((data) =>
        ok(data, 'HRM-LEAVE-PREVIEW-200', 'Leave deduction preview'),
      );
  }

  /** F-ATT-HOL-01 thin — GET year holiday set (≠ ATT-03b admin DONE). */
  @Get('holiday-calendars/:year')
  getHolidayCalendar(
    @Param('year') yearRaw: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: GetHolidayCalendarQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    const year = Number(yearRaw);
    return this.attHolidayCalendarService
      .getYearCalendar(year, query.company_id, authorization, tenantId)
      .then((data) => ok(data, 'HRM-ATT-HOL-200', 'Holiday calendar loaded'));
  }

  /** F-ATT-HOL-01 thin — PUT year holiday set (≠ ATT-03b DONE). */
  @Put('holiday-calendars/:year')
  putHolidayCalendar(
    @Param('year') yearRaw: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: PutHolidayCalendarDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: body.companyId ?? headerCompanyId,
    });
    const year = Number(yearRaw);
    return this.attHolidayCalendarService
      .putYearCalendar(year, body, authorization, tenantId)
      .then((data) => ok(data, 'HRM-ATT-HOL-201', 'Holiday calendar saved'));
  }

  @Get('overview')
  getAttendanceOverview(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: AttendanceOverviewQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.attendanceOverviewService
      .getOverview(query, authorization, tenantId)
      .then((data) => ok(data, 'HRM-ATT-OVERVIEW-200', 'Attendance overview'));
  }

  /**
   * UC-BP-ATT-05b — panel quỹ 5 loại MVP (năm/thâm niên/bù/chuyển kỳ/ứng) một GET.
   * Đặt trước leave-balance exact để tránh nhầm path khi FE thêm segment.
   */
  @Get('leave-balance/panel')
  getLeaveBalancePanel(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: GetLeaveBalancePanelQueryDto,
    @Headers() headers: Record<string, unknown> = {},
  ) {
    const authHeader = resolveAuthorizationHeader(authorization, headers);
    this.assertBusinessAccess(authHeader, internalApiKey);
    resolveScopeContext(authHeader, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.leaveBalanceService
      .getLeaveBalancePanel(query, authHeader, tenantId)
      .then((data) =>
        ok(data, 'HRM-LEAVE-BAL-PANEL-200', 'Leave balance panel loaded'),
      );
  }

  /**
   * UC-BP-ATT-09 — cấp quỹ tracked trên employee_leave_balances (U65 · HR menu · không seed script).
   */
  @Put('leave-balance/tracked-entitlement')
  upsertTrackedLeaveEntitlement(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: UpsertTrackedLeaveBalanceDto,
    @Headers() headers: Record<string, unknown> = {},
  ) {
    const authHeader = resolveAuthorizationHeader(authorization, headers);
    this.assertBusinessAccess(authHeader, internalApiKey);
    resolveScopeContext(authHeader, {
      tenantId,
      companyId: body.company_id ?? headerCompanyId,
    });
    return this.leaveBalanceService
      .upsertTrackedEntitlement(body, authHeader, tenantId)
      .then((data) =>
        ok(data, 'HRM-LEAVE-BAL-201', 'Tracked leave entitlement upserted'),
      );
  }

  /**
   * FR-UC-BP-ATT-12 — enroll-on-activate (system / QA replay · ≠ HR manual tracked-entitlement).
   */
  @Post('leave-balance/enroll-on-activate')
  enrollOnActivate(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: EnrollOnActivateDto,
    @Headers() headers: Record<string, unknown> = {},
  ) {
    const authHeader = resolveAuthorizationHeader(authorization, headers);
    this.assertBusinessAccess(authHeader, internalApiKey);
    resolveScopeContext(authHeader, {
      tenantId,
      companyId: body.company_id ?? headerCompanyId,
    });
    return this.attActivateEnrollService
      .enrollOnActivate({
        employeeId: body.employee_id,
        companyId: body.company_id,
        effectiveDateDisplay: body.effective_date,
        activateEventRef: body.activate_event_ref,
        authorization: authHeader,
        tenantId,
      })
      .then((data) =>
        ok(data, 'HRM-ATT-ENROLL-200', 'Activate enroll processed'),
      );
  }

  /** F-ATT-SHIFT-02 narrow — activate_default shift bind. */
  @Get('shift-assignments/activate-default')
  getActivateDefaultShift(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: GetActivateDefaultShiftQueryDto,
    @Headers() headers: Record<string, unknown> = {},
  ) {
    const authHeader = resolveAuthorizationHeader(authorization, headers);
    this.assertBusinessAccess(authHeader, internalApiKey);
    resolveScopeContext(authHeader, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.attActivateEnrollService
      .getActivateDefaultShiftAssignment({
        employeeId: query.employee_id,
        companyId: query.company_id,
        authorization: authHeader,
        tenantId,
      })
      .then((data) =>
        ok(
          data ?? {
            assignmentId: null,
            shiftId: null,
            shiftCode: null,
            shiftName: null,
            effectiveFrom: null,
            source: null,
          },
          'HRM-ATT-SHIFT-ASSIGN-READ-200',
          'Activate default shift assignment',
        ),
      );
  }

  @Put('shift-assignments')
  upsertActivateDefaultShift(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: UpsertShiftAssignmentDto,
    @Headers() headers: Record<string, unknown> = {},
  ) {
    const authHeader = resolveAuthorizationHeader(authorization, headers);
    this.assertBusinessAccess(authHeader, internalApiKey);
    resolveScopeContext(authHeader, {
      tenantId,
      companyId: body.company_id ?? headerCompanyId,
    });
    return this.attActivateEnrollService
      .upsertActivateDefaultShift({
        employeeId: body.employee_id,
        companyId: body.company_id,
        shiftId: body.shift_id,
        effectiveFromDisplay: body.effective_from,
        departmentId: body.department_id,
        authorization: authHeader,
        tenantId,
      })
      .then((data) =>
        ok(data, 'HRM-ATT-SHIFT-ASSIGN-200', 'Shift assignment upserted'),
      );
  }

  @Get('leave-balance')
  getLeaveBalance(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: GetLeaveBalanceQueryDto,
    @Headers() headers: Record<string, unknown> = {},
  ) {
    const authHeader = resolveAuthorizationHeader(authorization, headers);
    this.assertBusinessAccess(authHeader, internalApiKey);
    resolveScopeContext(authHeader, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.leaveBalanceService
      .getLeaveBalance(query, authHeader, tenantId)
      .then((data) => ok(data, 'HRM-LEAVE-BAL-200', 'Leave balance loaded'));
  }

  /**
   * @CODE-MEMORY method · FR-HRM-AT-10
   * SRS bước: Diễn biến #7 sau gửi — list đơn nghỉ trong phạm vi
   * TechSpec: §14.5 ref_srs FR-HRM-AT-10 · GET leave-requests → HRM-LEAVE-200
   */
  @Get('leave-requests')
  listLeaveRequests(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: ListLeaveRequestsQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.leaveRequestsService
      .listLeaveRequests(query, authorization, tenantId)
      .then((data) => ok(data, 'HRM-LEAVE-200', 'Leave requests listed'));
  }

  @Post('leave-requests/:requestId/approve')
  approveLeaveRequest(
    @Param('requestId') requestId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
    @Body() body: DecideLeaveRequestDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId });
    return this.leaveRequestsService
      .approveLeaveRequest(
        requestId,
        body,
        scope.companyId,
        authorization,
        tenantId,
      )
      .then((data) => ok(data, 'HRM-LEAVE-203', 'Leave request approved'));
  }

  @Post('leave-requests/:requestId/reject')
  rejectLeaveRequest(
    @Param('requestId') requestId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
    @Body() body: DecideLeaveRequestDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId });
    return this.leaveRequestsService
      .rejectLeaveRequest(
        requestId,
        body,
        scope.companyId,
        authorization,
        tenantId,
      )
      .then((data) => ok(data, 'HRM-LEAVE-204', 'Leave request rejected'));
  }

  /** F-ATT-LEAVE-FUNNEL-02 — cancel pending/approved; reverse markers when leaving approved. */
  @Post('leave-requests/:requestId/cancel')
  cancelLeaveRequest(
    @Param('requestId') requestId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
    @Body() body: DecideLeaveRequestDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId });
    return this.leaveRequestsService
      .cancelLeaveRequest(
        requestId,
        body,
        scope.companyId,
        authorization,
        tenantId,
      )
      .then((data) => ok(data, 'HRM-LEAVE-205', 'Leave request cancelled'));
  }

  @Get('overtime-requests')
  listOvertimeRequests(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: ListAttendanceRequestsQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.attendanceRequestsService
      .listOvertimeRequests(query, authorization, tenantId)
      .then((data) => ok(data, 'HRM-OT-200', 'Overtime requests listed'));
  }

  @Post('overtime-requests')
  createOvertimeRequest(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: CreateOvertimeRequestDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, {
      tenantId,
      companyId: body.company_id ?? headerCompanyId,
    });
    return this.attendanceRequestsService
      .createOvertimeRequest(body, authorization, scope.companyId)
      .then((data) => ok(data, 'HRM-OT-201', 'Overtime request created'));
  }

  @Post('overtime-requests/:requestId/approve')
  approveOvertimeRequest(
    @Param('requestId') requestId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
    @Body() body: DecideLeaveRequestDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId });
    return this.attendanceRequestsService
      .approveOvertimeRequest(
        requestId,
        body,
        scope.companyId,
        authorization,
        tenantId,
      )
      .then((data) => ok(data, 'HRM-OT-203', 'Overtime request approved'));
  }

  @Post('overtime-requests/:requestId/reject')
  rejectOvertimeRequest(
    @Param('requestId') requestId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
    @Body() body: DecideLeaveRequestDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId });
    return this.attendanceRequestsService
      .rejectOvertimeRequest(
        requestId,
        body,
        scope.companyId,
        authorization,
        tenantId,
      )
      .then((data) => ok(data, 'HRM-OT-204', 'Overtime request rejected'));
  }

  @Delete('overtime-requests/:requestId')
  deleteOvertimeRequest(
    @Param('requestId') requestId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, { tenantId, companyId });
    return this.attendanceRequestsService
      .deleteOvertimeRequest(
        requestId,
        scope.companyId,
        authorization,
        tenantId,
      )
      .then((data) => ok(data, 'HRM-OT-205', 'Overtime request deleted'));
  }

  @Get('business-trip-requests')
  listBusinessTripRequests(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: ListAttendanceRequestsQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.attendanceRequestsService
      .listBusinessTripRequests(query, authorization, tenantId)
      .then((data) => ok(data, 'HRM-BT-200', 'Business trip requests listed'));
  }

  @Post('business-trip-requests')
  createBusinessTripRequest(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Body() body: CreateBusinessTripRequestDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    return this.attendanceRequestsService
      .createBusinessTripRequest(body, authorization)
      .then((data) => ok(data, 'HRM-BT-201', 'Business trip request created'));
  }

  @Post('business-trip-requests/:requestId/approve')
  approveBusinessTripRequest(
    @Param('requestId') requestId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
    @Body() body: DecideLeaveRequestDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.attendanceRequestsService
      .approveBusinessTripRequest(
        requestId,
        body,
        companyId ?? 'main',
        authorization,
        tenantId,
      )
      .then((data) => ok(data, 'HRM-BT-203', 'Business trip request approved'));
  }

  @Post('business-trip-requests/:requestId/reject')
  rejectBusinessTripRequest(
    @Param('requestId') requestId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
    @Body() body: DecideLeaveRequestDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.attendanceRequestsService
      .rejectBusinessTripRequest(
        requestId,
        body,
        companyId ?? 'main',
        authorization,
        tenantId,
      )
      .then((data) => ok(data, 'HRM-BT-204', 'Business trip request rejected'));
  }

  @Delete('business-trip-requests/:requestId')
  deleteBusinessTripRequest(
    @Param('requestId') requestId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.attendanceRequestsService
      .deleteBusinessTripRequest(
        requestId,
        companyId ?? 'main',
        authorization,
        tenantId,
      )
      .then((data) => ok(data, 'HRM-BT-205', 'Business trip request deleted'));
  }

  @Get('late-early-requests')
  listLateEarlyRequests(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: ListAttendanceRequestsQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.attendanceRequestsService
      .listLateEarlyRequests(query, authorization, tenantId)
      .then((data) => ok(data, 'HRM-LE-REQ-200', 'Late/early requests listed'));
  }

  @Post('late-early-requests')
  createLateEarlyRequest(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Body() body: CreateLateEarlyRequestDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    return this.attendanceRequestsService
      .createLateEarlyRequest(body, authorization)
      .then((data) => ok(data, 'HRM-LE-REQ-201', 'Late/early request created'));
  }

  @Post('late-early-requests/:requestId/approve')
  approveLateEarlyRequest(
    @Param('requestId') requestId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
    @Body() body: DecideLeaveRequestDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.attendanceRequestsService
      .approveLateEarlyRequest(
        requestId,
        body,
        companyId ?? 'main',
        authorization,
        tenantId,
      )
      .then((data) =>
        ok(data, 'HRM-LE-REQ-203', 'Late/early request approved'),
      );
  }

  @Post('late-early-requests/:requestId/reject')
  rejectLateEarlyRequest(
    @Param('requestId') requestId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
    @Body() body: DecideLeaveRequestDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.attendanceRequestsService
      .rejectLateEarlyRequest(
        requestId,
        body,
        companyId ?? 'main',
        authorization,
        tenantId,
      )
      .then((data) =>
        ok(data, 'HRM-LE-REQ-204', 'Late/early request rejected'),
      );
  }

  @Delete('late-early-requests/:requestId')
  deleteLateEarlyRequest(
    @Param('requestId') requestId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.attendanceRequestsService
      .deleteLateEarlyRequest(
        requestId,
        companyId ?? 'main',
        authorization,
        tenantId,
      )
      .then((data) => ok(data, 'HRM-LE-REQ-205', 'Late/early request deleted'));
  }

  @Get('shift-change-requests')
  listShiftChangeRequests(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: ListAttendanceRequestsQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.attendanceRequestsService
      .listShiftChangeRequests(query, authorization, tenantId)
      .then((data) => ok(data, 'HRM-SC-200', 'Shift change requests listed'));
  }

  @Post('shift-change-requests')
  createShiftChangeRequest(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Body() body: CreateShiftChangeRequestDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    return this.attendanceRequestsService
      .createShiftChangeRequest(body, authorization)
      .then((data) => ok(data, 'HRM-SC-201', 'Shift change request created'));
  }

  @Post('shift-change-requests/:requestId/approve')
  approveShiftChangeRequest(
    @Param('requestId') requestId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
    @Body() body: DecideLeaveRequestDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.attendanceRequestsService
      .approveShiftChangeRequest(
        requestId,
        body,
        companyId ?? 'main',
        authorization,
        tenantId,
      )
      .then((data) => ok(data, 'HRM-SC-203', 'Shift change request approved'));
  }

  @Post('shift-change-requests/:requestId/reject')
  rejectShiftChangeRequest(
    @Param('requestId') requestId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
    @Body() body: DecideLeaveRequestDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.attendanceRequestsService
      .rejectShiftChangeRequest(
        requestId,
        body,
        companyId ?? 'main',
        authorization,
        tenantId,
      )
      .then((data) => ok(data, 'HRM-SC-204', 'Shift change request rejected'));
  }

  @Get('rules')
  getAttendanceRules(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
    @Query('department_id') departmentId?: string,
    @Query('shift_id') shiftId?: string,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.attendanceConfig
      .getRules(companyId, authorization, tenantId, {
        departmentId: departmentId ?? null,
        shiftId: shiftId ?? null,
      })
      .then((data) => ok(data, 'HRM-ATT-RULES-200', 'Attendance rules loaded'));
  }

  /** Settings catalog «Quy tắc tính công» — separate from CFG /attendance/rules object. */
  @Get(['work-rules', 'att-rules'])
  listWorkRulesCatalog(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
    @Query('q') q?: string,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.attRuleService
      .listRules(companyId || 'main', q)
      .then((items) =>
        ok(
          { total: items.length, items, data: items },
          'HRM-ATT-WORK-RULES-200',
          'Work rules listed',
        ),
      );
  }

  @Post(['work-rules', 'att-rules'])
  upsertWorkRuleCatalog(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body()
    body: {
      company_id?: string;
      companyId?: string;
      code: string;
      name_vi?: string;
      nameVi?: string;
      rule_type?: string;
      ruleType?: string;
      formula_desc?: string | null;
      formulaDesc?: string | null;
      apply_to?: string | null;
      applyTo?: string | null;
      description?: string | null;
      status?: string;
    },
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    const companyId = body.company_id || body.companyId || 'main';
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.attRuleService
      .upsertRule({
        companyId,
        code: body.code,
        nameVi: body.name_vi || body.nameVi || '',
        ruleType: body.rule_type || body.ruleType || 'STANDARD_WORK',
        formulaDesc: body.formula_desc ?? body.formulaDesc,
        applyTo: body.apply_to ?? body.applyTo,
        description: body.description,
        status: body.status,
      })
      .then((data) => ok(data, 'HRM-ATT-WORK-RULES-200', 'Work rule saved'));
  }

  @Post(['work-rules/:id/retire', 'att-rules/:id/retire'])
  retireWorkRuleCatalog(
    @Param('id') id: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.attRuleService
      .retireRule(companyId || 'main', id)
      .then(() => ok({ retired: true }, 'HRM-ATT-WORK-RULES-200', 'Work rule retired'));
  }

  @Get(['schedules', 'schedule-groups'])
  listScheduleGroupsCatalog(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
    @Query('q') q?: string,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.attScheduleService
      .listSchedules(companyId || 'main', q)
      .then((items) =>
        ok(
          { total: items.length, items, data: items },
          'HRM-ATT-SCHEDULE-200',
          'Schedule groups listed',
        ),
      );
  }

  @Post(['schedules', 'schedule-groups'])
  upsertScheduleGroupCatalog(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body()
    body: {
      company_id?: string;
      companyId?: string;
      code: string;
      name_vi?: string;
      nameVi?: string;
      default_shift_code?: string | null;
      defaultShiftCode?: string | null;
      working_days?: string | null;
      workingDays?: string | null;
      apply_to?: string | null;
      applyTo?: string | null;
      description?: string | null;
      status?: string;
    },
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    const companyId = body.company_id || body.companyId || 'main';
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.attScheduleService
      .upsertSchedule({
        companyId,
        code: body.code,
        nameVi: body.name_vi || body.nameVi || '',
        defaultShiftCode: body.default_shift_code ?? body.defaultShiftCode,
        workingDays: body.working_days ?? body.workingDays,
        applyTo: body.apply_to ?? body.applyTo,
        description: body.description,
        status: body.status,
      })
      .then((data) =>
        ok(data, 'HRM-ATT-SCHEDULE-200', 'Schedule group saved'),
      );
  }

  @Post(['schedules/:id/retire', 'schedule-groups/:id/retire'])
  retireScheduleGroupCatalog(
    @Param('id') id: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.attScheduleService
      .retireSchedule(companyId || 'main', id)
      .then(() =>
        ok({ retired: true }, 'HRM-ATT-SCHEDULE-200', 'Schedule group retired'),
      );
  }

  @Patch('rules')
  patchAttendanceRules(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
    @Body() body: UpdateAttendanceRulesDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.attendanceConfig
      .patchRules(companyId, body, authorization, tenantId)
      .then((data) =>
        ok(data, 'HRM-ATT-RULES-200', 'Attendance rules updated'),
      );
  }

  /**
   * F-ATT-RULE-01 residual — optional thin path same @Controller('attendance') family.
   * Paper /att/rules/late-penalty + /core = alias only · Nest /core DENY.
   */
  @Patch('rules/late-penalty')
  patchAttendanceLatePenalty(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
    @Body() body: UpdateAttendanceRulesDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.attendanceConfig
      .patchLatePenalty(companyId, body, authorization, tenantId)
      .then((data) =>
        ok(data, 'HRM-ATT-RULES-200', 'Late-penalty rules updated'),
      );
  }

  @Get('leave-types/effective')
  listEffectiveLeaveTypes(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query() query: ListEffectiveAttLeaveTypesQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id,
    });
    return this.attLeaveTypeService
      .listEffective(query, authorization, { tenantId })
      .then((data) =>
        ok(data, 'HRM-ATT-LVT-200', 'Effective leave types listed'),
      );
  }

  /** F-ATT-LVRULE-04 — resolve before :policyId route. */
  @Get('leave-accrual-policies/effective')
  resolveEffectiveLeaveAccrualPolicy(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query() query: ResolveEffectiveAttLeaveAccrualPolicyQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id,
    });
    return this.attLeaveAccrualPolicyService
      .resolveEffective(query, authorization, tenantId)
      .then((data) =>
        ok(
          data,
          'HRM-ATT-LVRULE-200',
          'Effective leave accrual policy resolved',
        ),
      );
  }

  /** F-ATT-LVRULE-01 list — default active; include_inactive for admin. */
  @Get('leave-accrual-policies')
  listLeaveAccrualPolicies(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query() query: ListAttLeaveAccrualPoliciesQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id,
    });
    return this.attLeaveAccrualPolicyService
      .listPolicies(query, authorization, tenantId)
      .then((data) =>
        ok(data, 'HRM-ATT-LVRULE-200', 'Leave accrual policies listed'),
      );
  }

  /** F-ATT-LVRULE-02 admin CREATE open N+1. */
  @Post('leave-accrual-policies')
  createLeaveAccrualPolicy(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body() body: CreateAttLeaveAccrualPolicyDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: body.companyId });
    return this.attLeaveAccrualPolicyService
      .createPolicy(body, authorization, tenantId)
      .then((data) =>
        ok(data, 'HRM-ATT-LVRULE-201', 'Leave accrual policy created'),
      );
  }

  /**
   * F-ATT-LVRULE-CNS-01 — gated leave consumer (grant/adjust) invent guard.
   * When active policy set >0 and consumer sends invent policyId / ad-hoc mode|days →
   * Network 400 HRM-ATT-LVRULE-KEY. Empty active or no rule params → soft skip (U65).
   * NOT admin CREATE; NOT F-ATT-LEAVE-04 accrue engine (engine LIVE HOLD).
   */
  @Post('leave-accrual-policies/assert-consumer')
  assertConsumerLeaveAccrualPolicy(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body() body: AssertConsumerAttLeaveAccrualPolicyDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: body.companyId });
    return this.attLeaveAccrualPolicyService
      .assertLeaveAccrualPolicyForConsumer({
        companyId: body.companyId,
        leaveTypeKey: body.leaveTypeKey,
        policyId: body.policyId ?? null,
        accrualMode: body.accrualMode ?? null,
        annualDays: body.annualDays ?? null,
        authorization,
        tenantId,
      })
      .then((policy) =>
        ok(
          { policy, skipped: policy === null },
          'HRM-ATT-LVRULE-200',
          policy
            ? 'Consumer accrual policy binding resolved'
            : 'No active accrual policy binding — consumer invent skipped',
        ),
      );
  }

  @Get('leave-accrual-policies/:policyId')
  getLeaveAccrualPolicyById(
    @Param('policyId', new ParseUUIDPipe()) policyId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query() query: GetAttLeaveAccrualPolicyQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id,
    });
    return this.attLeaveAccrualPolicyService
      .getPolicyById(policyId, query.company_id, authorization, tenantId)
      .then((data) =>
        ok(data, 'HRM-ATT-LVRULE-200', 'Leave accrual policy loaded'),
      );
  }

  /** F-ATT-LVRULE-03 PATCH. */
  @Patch('leave-accrual-policies/:policyId')
  patchLeaveAccrualPolicy(
    @Param('policyId', new ParseUUIDPipe()) policyId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
    @Body() body: PatchAttLeaveAccrualPolicyDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.attLeaveAccrualPolicyService
      .patchPolicy(policyId, companyId, body, authorization, tenantId)
      .then((data) =>
        ok(data, 'HRM-ATT-LVRULE-200', 'Leave accrual policy updated'),
      );
  }

  /** Soft-retire — FORBIDDEN hard-delete. */
  @Post('leave-accrual-policies/:policyId/retire')
  retireLeaveAccrualPolicy(
    @Param('policyId', new ParseUUIDPipe()) policyId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.attLeaveAccrualPolicyService
      .retirePolicy(policyId, companyId, authorization, tenantId)
      .then((data) =>
        ok(data, 'HRM-ATT-LVRULE-200', 'Leave accrual policy retired'),
      );
  }

  @Get('attendance-codes/effective')
  listEffectiveAttendanceCodes(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query() query: ListEffectiveAttAttendanceCodesQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id,
    });
    return this.attAttendanceCodeService
      .listEffective(query, authorization, { tenantId })
      .then((data) =>
        ok(data, 'HRM-ATT-CODE-200', 'Effective attendance codes listed'),
      );
  }

  @Get('attendance-codes')
  listAttendanceCodes(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query() query: ListAttAttendanceCodesQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id,
    });
    return this.attAttendanceCodeService
      .listAttendanceCodes(query, authorization, tenantId)
      .then((data) => ok(data, 'HRM-ATT-CODE-200', 'Attendance codes listed'));
  }

  @Post('attendance-codes')
  createAttendanceCode(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body() body: UpsertAttAttendanceCodeDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: body.companyId });
    return this.attAttendanceCodeService
      .upsertAttendanceCode(body, authorization, tenantId)
      .then((data) => ok(data, 'HRM-ATT-CODE-201', 'Attendance code created'));
  }

  @Put('attendance-codes')
  upsertAttendanceCode(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body() body: UpsertAttAttendanceCodeDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: body.companyId });
    return this.attAttendanceCodeService
      .upsertAttendanceCode(body, authorization, tenantId)
      .then((data) => ok(data, 'HRM-ATT-CODE-200', 'Attendance code upserted'));
  }

  @Get('attendance-codes/:codeId')
  getAttendanceCodeById(
    @Param('codeId', new ParseUUIDPipe()) codeId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query() query: GetAttAttendanceCodeQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id,
    });
    return this.attAttendanceCodeService
      .getAttendanceCodeById(codeId, query.company_id, authorization, tenantId)
      .then((data) => ok(data, 'HRM-ATT-CODE-200', 'Attendance code loaded'));
  }

  @Patch('attendance-codes/:codeId')
  patchAttendanceCode(
    @Param('codeId', new ParseUUIDPipe()) codeId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
    @Body() body: PatchAttAttendanceCodeDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.attAttendanceCodeService
      .patchAttendanceCode(codeId, companyId, body, authorization, tenantId)
      .then((data) => ok(data, 'HRM-ATT-CODE-200', 'Attendance code updated'));
  }

  @Post('attendance-codes/:codeId/retire')
  retireAttendanceCode(
    @Param('codeId', new ParseUUIDPipe()) codeId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.attAttendanceCodeService
      .retireAttendanceCode(codeId, companyId, authorization, tenantId)
      .then((data) => ok(data, 'HRM-ATT-CODE-200', 'Attendance code retired'));
  }

  @Get('leave-types')
  listLeaveTypes(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query() query: ListAttLeaveTypesQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id,
    });
    return this.attLeaveTypeService
      .listLeaveTypes(query, authorization, tenantId)
      .then((data) => ok(data, 'HRM-ATT-LVT-200', 'Leave types listed'));
  }

  @Post('leave-types')
  createLeaveType(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body() body: UpsertAttLeaveTypeDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: body.companyId });
    return this.attLeaveTypeService
      .upsertLeaveType(body, authorization, tenantId)
      .then((data) => ok(data, 'HRM-ATT-LVT-201', 'Leave type created'));
  }

  @Put('leave-types')
  upsertLeaveType(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body() body: UpsertAttLeaveTypeDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: body.companyId });
    return this.attLeaveTypeService
      .upsertLeaveType(body, authorization, tenantId)
      .then((data) => ok(data, 'HRM-ATT-LVT-200', 'Leave type upserted'));
  }

  @Get('leave-types/:leaveTypeId')
  getLeaveTypeById(
    @Param('leaveTypeId', new ParseUUIDPipe()) leaveTypeId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query() query: GetAttLeaveTypeQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id,
    });
    return this.attLeaveTypeService
      .getLeaveTypeById(leaveTypeId, query.company_id, authorization, tenantId)
      .then((data) => ok(data, 'HRM-ATT-LVT-200', 'Leave type loaded'));
  }

  @Patch('leave-types/:leaveTypeId')
  patchLeaveType(
    @Param('leaveTypeId', new ParseUUIDPipe()) leaveTypeId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
    @Body() body: PatchAttLeaveTypeDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.attLeaveTypeService
      .patchLeaveType(leaveTypeId, companyId, body, authorization, tenantId)
      .then((data) => ok(data, 'HRM-ATT-LVT-200', 'Leave type updated'));
  }

  @Post('leave-types/:leaveTypeId/retire')
  retireLeaveType(
    @Param('leaveTypeId', new ParseUUIDPipe()) leaveTypeId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.attLeaveTypeService
      .retireLeaveType(leaveTypeId, companyId, authorization, tenantId)
      .then((data) => ok(data, 'HRM-ATT-LVT-200', 'Leave type retired'));
  }

  /** F-ATT-CAT-OT-01 effective picker — before :otTypeId. */
  @Get('ot-types/effective')
  listEffectiveOtTypes(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query() query: ListEffectiveAttOtTypesQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id,
    });
    return this.attOtTypeService
      .listEffective(query, authorization, { tenantId })
      .then((data) => ok(data, 'HRM-ATT-OT-200', 'Effective OT types listed'));
  }

  /** F-ATT-CAT-OT-01 list — default active; include_inactive audit. */
  @Get('ot-types')
  listOtTypes(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query() query: ListAttOtTypesQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id,
    });
    return this.attOtTypeService
      .listOtTypes(query, authorization, tenantId)
      .then((data) => ok(data, 'HRM-ATT-OT-200', 'OT types listed'));
  }

  /** F-ATT-CAT-OT-02 admin CREATE open N+1. */
  @Post('ot-types')
  createOtType(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body() body: UpsertAttOtTypeDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: body.companyId });
    return this.attOtTypeService
      .upsertOtType(body, authorization, tenantId)
      .then((data) => ok(data, 'HRM-ATT-OT-201', 'OT type created'));
  }

  @Put('ot-types')
  upsertOtType(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body() body: UpsertAttOtTypeDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: body.companyId });
    return this.attOtTypeService
      .upsertOtType(body, authorization, tenantId)
      .then((data) => ok(data, 'HRM-ATT-OT-200', 'OT type upserted'));
  }

  @Get('ot-types/:otTypeId')
  getOtTypeById(
    @Param('otTypeId', new ParseUUIDPipe()) otTypeId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query() query: GetAttOtTypeQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id,
    });
    return this.attOtTypeService
      .getOtTypeById(otTypeId, query.company_id, authorization, tenantId)
      .then((data) => ok(data, 'HRM-ATT-OT-200', 'OT type loaded'));
  }

  @Patch('ot-types/:otTypeId')
  patchOtType(
    @Param('otTypeId', new ParseUUIDPipe()) otTypeId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
    @Body() body: PatchAttOtTypeDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.attOtTypeService
      .patchOtType(otTypeId, companyId, body, authorization, tenantId)
      .then((data) => ok(data, 'HRM-ATT-OT-200', 'OT type updated'));
  }

  @Post('ot-types/:otTypeId/retire')
  retireOtType(
    @Param('otTypeId', new ParseUUIDPipe()) otTypeId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.attOtTypeService
      .retireOtType(otTypeId, companyId, authorization, tenantId)
      .then((data) => ok(data, 'HRM-ATT-OT-200', 'OT type retired'));
  }

  /** Soft-delete alias — FORBIDDEN hard delete (VAL-ATT-OT-CAT-05). */
  @Delete('ot-types/:otTypeId')
  deleteOtTypeSoft(
    @Param('otTypeId', new ParseUUIDPipe()) otTypeId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
    @Query('hard') hard?: string,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    if (hard === 'true' || hard === '1') {
      throw new ApiException(
        'HRM-ATT-OT-VAL',
        'Hard delete OT type forbidden — use soft-retire (history overtime_requests may reference code)',
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    }
    return this.attOtTypeService
      .retireOtType(otTypeId, companyId, authorization, tenantId)
      .then((data) => ok(data, 'HRM-ATT-OT-200', 'OT type soft-retired'));
  }

  // ── F-ATT-OT-COMP-POLICY — OT comp leave toggle + hours→days (FR-UC-BP-ATT-06) ──

  @Get('ot-comp-leave-policy')
  getOtCompLeavePolicy(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: GetOtCompLeavePolicyQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.attOtCompLeavePolicyService
      .getPolicy(query.company_id ?? headerCompanyId, authorization, tenantId)
      .then((data) =>
        ok(data, 'HRM-ATT-OT-COMP-POLICY-200', 'OT comp leave policy read'),
      );
  }

  @Put('ot-comp-leave-policy')
  putOtCompLeavePolicy(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: PutOtCompLeavePolicyDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, {
      tenantId,
      companyId: body.company_id ?? headerCompanyId,
    });
    const payload = { ...body, company_id: body.company_id ?? scope.companyId };
    return this.attOtCompLeavePolicyService
      .putPolicy(payload, authorization, tenantId)
      .then((data) =>
        ok(data, 'HRM-ATT-OT-COMP-POLICY-200', 'OT comp leave policy saved'),
      );
  }

  // ── F-ATT-SICK-POLICY-ORDER — sick fund sequence (FR-UC-BP-ATT-07) ──

  @Get('sick-leave-fund-order')
  getSickLeaveFundOrder(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query() query: GetSickLeaveFundOrderQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id ?? headerCompanyId,
    });
    return this.attSickLeaveFundOrderService
      .getFundOrder(
        query.company_id ?? headerCompanyId,
        authorization,
        tenantId,
      )
      .then((data) =>
        ok(data, 'HRM-ATT-SICK-FUND-ORDER-200', 'Sick leave fund order read'),
      );
  }

  @Put('sick-leave-fund-order')
  putSickLeaveFundOrder(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Body() body: PutSickLeaveFundOrderDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, {
      tenantId,
      companyId: body.company_id ?? headerCompanyId,
    });
    const payload = { ...body, company_id: body.company_id ?? scope.companyId };
    return this.attSickLeaveFundOrderService
      .putFundOrder(payload, authorization, tenantId)
      .then((data) =>
        ok(data, 'HRM-ATT-SICK-FUND-ORDER-200', 'Sick leave fund order saved'),
      );
  }

  // ── F-ATT-CAT-OTC — OT compensation-type open catalog (orthogonal vs ot-types) ──

  /** F-ATT-CAT-OTC-01 effective picker — before :compTypeId. */
  @Get('ot-comp-types/effective')
  listEffectiveOtCompTypes(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query() query: ListEffectiveAttOtCompTypesQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id,
    });
    return this.attOtCompTypeService
      .listEffective(query, authorization, { tenantId })
      .then((data) =>
        ok(data, 'HRM-ATT-OTC-200', 'Effective OT compensation types listed'),
      );
  }

  /** F-ATT-CAT-OTC-01 list — default active; include_inactive audit. */
  @Get('ot-comp-types')
  listOtCompTypes(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query() query: ListAttOtCompTypesQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id,
    });
    return this.attOtCompTypeService
      .listOtCompTypes(query, authorization, tenantId)
      .then((data) =>
        ok(data, 'HRM-ATT-OTC-200', 'OT compensation types listed'),
      );
  }

  /** F-ATT-CAT-OTC-02 admin CREATE open N+1. */
  @Post('ot-comp-types')
  createOtCompType(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body() body: UpsertAttOtCompTypeDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: body.companyId });
    return this.attOtCompTypeService
      .upsertOtCompType(body, authorization, tenantId)
      .then((data) =>
        ok(data, 'HRM-ATT-OTC-201', 'OT compensation type created'),
      );
  }

  @Put('ot-comp-types')
  upsertOtCompType(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body() body: UpsertAttOtCompTypeDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId: body.companyId });
    return this.attOtCompTypeService
      .upsertOtCompType(body, authorization, tenantId)
      .then((data) =>
        ok(data, 'HRM-ATT-OTC-200', 'OT compensation type upserted'),
      );
  }

  @Get('ot-comp-types/:compTypeId')
  getOtCompTypeById(
    @Param('compTypeId', new ParseUUIDPipe()) compTypeId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query() query: GetAttOtCompTypeQueryDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: query.company_id,
    });
    return this.attOtCompTypeService
      .getOtCompTypeById(compTypeId, query.company_id, authorization, tenantId)
      .then((data) =>
        ok(data, 'HRM-ATT-OTC-200', 'OT compensation type loaded'),
      );
  }

  @Patch('ot-comp-types/:compTypeId')
  patchOtCompType(
    @Param('compTypeId', new ParseUUIDPipe()) compTypeId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
    @Body() body: PatchAttOtCompTypeDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.attOtCompTypeService
      .patchOtCompType(compTypeId, companyId, body, authorization, tenantId)
      .then((data) =>
        ok(data, 'HRM-ATT-OTC-200', 'OT compensation type updated'),
      );
  }

  @Post('ot-comp-types/:compTypeId/retire')
  retireOtCompType(
    @Param('compTypeId', new ParseUUIDPipe()) compTypeId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.attOtCompTypeService
      .retireOtCompType(compTypeId, companyId, authorization, tenantId)
      .then((data) =>
        ok(data, 'HRM-ATT-OTC-200', 'OT compensation type retired'),
      );
  }

  /** Soft-delete alias — FORBIDDEN hard delete (VAL-ATT-COMP-CAT-05). */
  @Delete('ot-comp-types/:compTypeId')
  deleteOtCompTypeSoft(
    @Param('compTypeId', new ParseUUIDPipe()) compTypeId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
    @Query('hard') hard?: string,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    if (
      String(hard ?? '').toLowerCase() === 'true' ||
      String(hard ?? '') === '1'
    ) {
      throw new ApiException(
        'HRM-ATT-OTC-405',
        'Hard delete forbidden — use soft-retire (BR-PLT-04)',
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    }
    return this.attOtCompTypeService
      .retireOtCompType(compTypeId, companyId, authorization, tenantId)
      .then((data) =>
        ok(data, 'HRM-ATT-OTC-200', 'OT compensation type soft-retired'),
      );
  }

  @Get('work-sites')
  listWorkSites(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
    @Query('include_inactive') includeInactive?: string,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    const include =
      includeInactive === 'true' ||
      includeInactive === '1' ||
      includeInactive === 'yes';
    return this.attendanceConfig
      .listWorkSites(companyId, authorization, tenantId, {
        includeInactive: include,
      })
      .then((data) => ok(data, 'HRM-ATT-SITE-200', 'Work sites listed'));
  }

  @Post('work-sites')
  createWorkSite(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Body() body: CreateWorkSiteDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, {
      tenantId,
      companyId: body.company_id,
    });
    return this.attendanceConfig
      .createWorkSite(body, authorization, tenantId)
      .then((data) => ok(data, 'HRM-ATT-SITE-201', 'Work site created'));
  }

  @Patch('work-sites/:siteId')
  updateWorkSite(
    @Param('siteId') siteId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
    @Body() body: UpdateWorkSiteDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.attendanceConfig
      .updateWorkSite(siteId, companyId, body, authorization, tenantId)
      .then((data) => ok(data, 'HRM-ATT-SITE-200', 'Work site updated'));
  }

  @Delete('work-sites/:siteId')
  deleteWorkSite(
    @Param('siteId') siteId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
    @Query('hard') hard?: string,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    const hardDelete = hard === 'true' || hard === '1' || hard === 'yes';
    return this.attendanceConfig
      .deleteWorkSite(siteId, companyId, authorization, tenantId, {
        hard: hardDelete,
      })
      .then((data) =>
        ok(
          data,
          'HRM-ATT-SITE-200',
          hardDelete ? 'Work site hard-deleted' : 'Work site soft-retired',
        ),
      );
  }

  @Get('work-shifts')
  listWorkShifts(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
    @Query('include_inactive') includeInactive?: string,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    const include =
      includeInactive === 'true' ||
      includeInactive === '1' ||
      includeInactive === 'yes';
    return this.attendanceCatalog
      .listWorkShifts(companyId, authorization, { includeInactive: include })
      .then((data) => ok(data, 'HRM-WS-200', 'Work shifts listed'));
  }

  /** Picker contract — active-only (VAL-ATT-SHIFT-CNS-02 FE bind). */
  @Get('work-shifts/effective')
  listEffectiveWorkShifts(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.attendanceCatalog
      .listEffectiveWorkShifts(companyId, authorization)
      .then((data) => ok(data, 'HRM-WS-200', 'Effective work shifts listed'));
  }

  @Get('work-shifts/:shiftId')
  getWorkShiftById(
    @Param('shiftId', new ParseUUIDPipe()) shiftId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.attendanceCatalog
      .getWorkShiftById(shiftId, companyId, authorization)
      .then((data) => ok(data, 'HRM-WS-200', 'Work shift loaded'));
  }

  @Post('work-shifts')
  createWorkShift(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Body() body: Record<string, unknown>,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    return this.attendanceCatalog
      .createWorkShift(body, authorization)
      .then((data) => ok(data, 'HRM-WS-201', 'Work shift created'));
  }

  @Patch('work-shifts/:shiftId')
  updateWorkShift(
    @Param('shiftId') shiftId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Query('company_id') companyId: string,
    @Body() body: Record<string, unknown>,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    return this.attendanceCatalog
      .updateWorkShift(shiftId, body, companyId, authorization)
      .then((data) => ok(data, 'HRM-WS-200', 'Work shift updated'));
  }

  @Delete('work-shifts/:shiftId')
  deleteWorkShift(
    @Param('shiftId') shiftId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Query('company_id') companyId: string,
    @Query('hard') hard?: string,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    const hardDelete = hard === 'true' || hard === '1' || hard === 'yes';
    return this.attendanceCatalog
      .deleteWorkShift(shiftId, companyId, authorization, { hard: hardDelete })
      .then((data) =>
        ok(
          data,
          'HRM-WS-200',
          hardDelete ? 'Work shift hard-deleted' : 'Work shift soft-retired',
        ),
      );
  }

  /**
   * @CODE-MEMORY method · FR-HRM-AT-14
   * SRS bước: Diễn biến #1 Mở danh sách · #3 Tải danh sách · #4 Empty trung thực
   * TechSpec: §14.4 · §12.1/§13 ref_srs FR-HRM-AT-14 · AC-ATT-SHEET-01..06
   * must_keep: không storm reload; empty 200 OK
   */
  @Get('attendance-sheets')
  listAttendanceSheets(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    // Xử lý: Diễn biến #1/#3 — list một lần ổn định; empty = #4.
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.attendanceCatalog
      .listAttendanceSheets(companyId, authorization)
      .then((data) => ok(data, 'HRM-AS-200', 'Attendance sheets listed'));
  }

  /**
   * @CODE-MEMORY method · FR-HRM-AT-14
   * SRS bước: Diễn biến #5 Nhập tạo · #6/#7 kỳ sai/trùng · #8 Lưu thành công · #11 F5
   * TechSpec: §14.4 ref_srs FR-HRM-AT-14 · POST attendance-sheets → HRM-AS-201
   * must_keep: AC-ATT-SHEET — không tự bịa bản ghi ngày
   */
  @Post('attendance-sheets')
  createAttendanceSheet(
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Body() body: CreateAttendanceSheetDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    return (
      this.attendanceCatalog
        .createAttendanceSheet(body, authorization)
        // Thành công: Diễn biến #8 — dòng bảng mới ngay (F5 = #11).
        .then((data) => ok(data, 'HRM-AS-201', 'Attendance sheet created'))
    );
  }

  @Patch('attendance-sheets/:sheetId')
  updateAttendanceSheet(
    @Param('sheetId') sheetId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query('company_id') companyId: string,
    @Body() body: UpdateAttendanceSheetDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, {
      tenantId,
      companyId: companyId ?? headerCompanyId,
    });
    return this.attendanceCatalog
      .updateAttendanceSheet(sheetId, body, scope.companyId, authorization)
      .then((data) => ok(data, 'HRM-AS-200', 'Attendance sheet updated'));
  }

  @Delete('attendance-sheets/:sheetId')
  deleteAttendanceSheet(
    @Param('sheetId') sheetId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, {
      tenantId,
      companyId: companyId ?? headerCompanyId,
    });
    return this.attendanceCatalog
      .deleteAttendanceSheet(sheetId, scope.companyId, authorization)
      .then((data) => ok(data, 'HRM-AS-200', 'Attendance sheet deleted'));
  }

  /** FR-UC-BP-ATT-11 · F-ATT-SHEET-04 — GET by id (scope parity list). */
  @Get('attendance-sheets/:sheetId')
  getAttendanceSheet(
    @Param('sheetId') sheetId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, {
      tenantId,
      companyId: companyId ?? headerCompanyId,
    });
    return this.attendanceSheetSign
      .getAttendanceSheetById(sheetId, scope.companyId, authorization)
      .then((data) => ok(data, 'HRM-AS-200', 'Attendance sheet loaded'));
  }

  /** F-ATT-WF-SIGN-02 */
  @Get('attendance-sheets/:sheetId/signatures')
  listAttendanceSheetSignatures(
    @Param('sheetId') sheetId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, {
      tenantId,
      companyId: companyId ?? headerCompanyId,
    });
    return this.attendanceSheetSign
      .listSignatures(sheetId, scope.companyId, authorization)
      .then((data) =>
        ok(data, 'HRM-ATT-SIGN-200', 'Attendance sheet signatures listed'),
      );
  }

  /** F-PAY-ATT-CLOSED-01 — read att_timesheet_line (payroll draft preview; no AGG on closed). */
  @Get('attendance-sheets/:sheetId/lines')
  listAttendanceSheetLines(
    @Param('sheetId') sheetId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, {
      tenantId,
      companyId: companyId ?? headerCompanyId,
    });
    return this.attendanceSheetSign
      .listAttendanceSheetLines(sheetId, scope.companyId, authorization)
      .then((data) =>
        ok(data, 'HRM-ATT-LINE-200', 'Attendance sheet lines listed'),
      );
  }

  /** F-ATT-SHEET-AGG-01 · FR-UC-BP-ATT-10 — tổng hợp dòng giờ (att_timesheet_line). */
  @Post('attendance-sheets/:sheetId/aggregate')
  aggregateAttendanceSheet(
    @Param('sheetId') sheetId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, {
      tenantId,
      companyId: companyId ?? headerCompanyId,
    });
    return this.attendanceSheetSign
      .aggregateAttendanceSheet(sheetId, scope.companyId, authorization)
      .then((data) => ok(data, 'HRM-AS-200', 'Attendance sheet aggregated'));
  }

  /** F-ATT-SHEET-01 · FR-UC-BP-ATT-10 — gửi chờ ký (draft|open → submitted). */
  @Post('attendance-sheets/:sheetId/submit')
  submitAttendanceSheetForSign(
    @Param('sheetId') sheetId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, {
      tenantId,
      companyId: companyId ?? headerCompanyId,
    });
    return this.attendanceSheetSign
      .submitAttendanceSheetForSign(sheetId, scope.companyId, authorization)
      .then((data) =>
        ok(data, 'HRM-AS-200', 'Attendance sheet submitted for sign-off'),
      );
  }

  /** F-ATT-WF-SIGN-01 */
  @Post('attendance-sheets/:sheetId/signatures')
  createAttendanceSheetSignature(
    @Param('sheetId') sheetId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query('company_id') companyId: string,
    @Body() body: CreateAttendanceSheetSignatureDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, {
      tenantId,
      companyId: companyId ?? headerCompanyId,
    });
    return this.attendanceSheetSign
      .createSignature(sheetId, body, scope.companyId, authorization)
      .then((data) =>
        ok(data, 'HRM-ATT-SIGN-201', 'Attendance sheet signature recorded'),
      );
  }

  /** F-ATT-SHEET-02 */
  @Post('attendance-sheets/:sheetId/close')
  closeAttendanceSheet(
    @Param('sheetId') sheetId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query('company_id') companyId: string,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, {
      tenantId,
      companyId: companyId ?? headerCompanyId,
    });
    return this.attendanceSheetSign
      .closeAttendanceSheet(sheetId, scope.companyId, authorization)
      .then((data) => ok(data, 'HRM-AS-200', 'Attendance sheet closed'));
  }

  /** F-ATT-SHEET-03 */
  @Post('attendance-sheets/:sheetId/reopen')
  reopenAttendanceSheet(
    @Param('sheetId') sheetId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') headerCompanyId: string | undefined,
    @Query('company_id') companyId: string,
    @Body() body: ReopenAttendanceSheetDto,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    const scope = resolveScopeContext(authorization, {
      tenantId,
      companyId: companyId ?? headerCompanyId,
    });
    return this.attendanceSheetSign
      .reopenAttendanceSheet(sheetId, body, scope.companyId, authorization)
      .then((data) => ok(data, 'HRM-AS-200', 'Attendance sheet reopened'));
  }

  @Delete('shift-change-requests/:requestId')
  deleteShiftChangeRequest(
    @Param('requestId') requestId: string,
    @Headers('authorization') authorization: string | undefined,
    @Headers('x-internal-api-key') internalApiKey: string | undefined,
    @Headers('x-tenant-id') tenantId: string | undefined,
    @Headers('x-company-id') companyId: string | undefined,
  ) {
    this.assertBusinessAccess(authorization, internalApiKey);
    resolveScopeContext(authorization, { tenantId, companyId });
    return this.attendanceRequestsService
      .deleteShiftChangeRequest(
        requestId,
        companyId ?? 'main',
        authorization,
        tenantId,
      )
      .then((data) => ok(data, 'HRM-SC-205', 'Shift change request deleted'));
  }
}
