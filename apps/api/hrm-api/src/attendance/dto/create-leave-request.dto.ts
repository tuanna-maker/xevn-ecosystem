/**
 * @CODE-MEMORY
 * Screen:     HRM → Chấm công → Đơn nghỉ → Tạo
 * UC:         UC-HRM-10 · FR-HRM-AT-10 / HRM-AT-10
 * BR:         fanout leave_request.* · attachment path under /api/hrm/files
 * SRS:        docs/client-delivery/hrm/SRS_HRM_KHACH.md §3.5 · FR-HRM-AT-10
 * TechSpec:   docs/hrm/TECHSPEC.md §14.5 · §14.9 G-AT10-01
 * Purpose:    DTO tạo đơn nghỉ — company_id slug/TEXT ladder (giống OT/requisition), không khóa UUID.
 * WorkItem:   BE-HRM-G-AT10-01
 * Coded:      2026-07-21
 * Callers:    attendance.controller.ts → createLeaveRequest
 * Callees:    class-validator · LeaveRequestsService.createLeaveRequest → public.leave_requests
 * FEActions:  Form Gửi → POST /attendance/leave-requests → list đơn chờ
 * BEChain:    ValidationPipe → resolveHrmPersistCompanyIdText → INSERT TEXT company_id
 * Impact:     @IsUUID chặn slug holding/main → 400; lệch module khác
 * must_keep:  leave-workflow bridge; attachment_url path; G-AT10-02 codes ở service (không DTO)
 * SOLID:      SRP — create shape tách DecideLeaveRequestDto
 * LastVerified: leave-requests.service.spec.ts · BE-HRM-G-AT10-01 2026-07-22
 *
 * @CODE-MEMORY-CHANGE 2026-07-21
 * WorkItem: BE-HRM-G-AT10-01-SCOPE-SLUG-01
 * change_mode: ADD
 * What: company_id @IsString @MaxLength(64) — đóng G-AT10-01 (bỏ @IsUUID)
 *
 * @CODE-MEMORY-CHANGE 2026-07-21
 * WorkItem: BE-HRM-G-AT10-02-LEAVE-OVERLAP-01
 * change_mode: ADD
 * What: must_keep ghi nhận overlap/balance enforce ở LeaveRequestsService (không đổi shape DTO)
 *
 * @CODE-MEMORY-CHANGE 2026-07-22
 * WorkItem: BE-HRM-G-AT10-01
 * change_mode: ADD
 * What: Re-verify DTO slug ladder + TechSpec G-AT10-01 CLOSED; approve/reject scope normalize ở service
 */
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class CreateLeaveRequestDto {
  /** Operating slug (`holding`, member) or UUID text — persist via resolveHrmPersistCompanyIdText. */
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsUUID()
  employee_id!: string;

  @IsString()
  employee_code!: string;

  @IsString()
  employee_name!: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsString()
  leave_type!: string;

  @IsString()
  start_date!: string;

  @IsString()
  end_date!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0.5)
  total_days!: number;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  handover_to?: string;

  @IsOptional()
  @IsString()
  handover_tasks?: string;

  /** W7-3 — relative `/api/hrm/files/{scope}/...` from leave_attachment upload */
  @IsOptional()
  @IsString()
  attachment_url?: string;
}
