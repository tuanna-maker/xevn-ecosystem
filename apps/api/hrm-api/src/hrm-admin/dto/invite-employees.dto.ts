/**
 * @CODE-MEMORY
 * Screen:     HRM → Quản trị → Mời nhân viên lô (FR-HRM-04)
 * UC:         UC-HRM-04 · FR-HRM-04
 * BR:         per-row success/fail · soft employee_id
 * SRS:        docs/client-delivery/hrm/SRS_HRM_KHACH.md §3.26 · FR-HRM-04
 * TechSpec:   docs/hrm/TECHSPEC.md §16.2 · HRM-ADMIN-203
 * Purpose:    DTO lô mời — company_id TEXT Plane B; employee_id optional UUID soft link; không dừng lô khi 1 dòng lỗi.
 * WorkItem:   BE-HRM-ADMIN-DTO-01
 * Coded:      2026-07-27
 * Callers:    hrm-admin.controller.ts → inviteEmployees
 * Callees:    class-validator · HrmAdminService.inviteEmployees → profiles + memberships
 * FEActions:  Nhập list → POST /admin/invite-employee → hiển thị results[]
 * BEChain:    ValidationPipe → loop findOrCreate + UPSERT role=employee
 * Impact:     @IsUUID company_id chặn slug → 400 cả lô; lệch leave/fleet TEXT ladder
 * must_keep:  FR-02..05 · path singular invite-employee · Auth/Tenant · U65 · HOLD_DEPLOY · G-ADM-04 temp pwd ở service
 * SOLID:      SRP — item DTO tách batch envelope
 * LastVerified: hrm-admin.dto.spec.ts · BE-HRM-ADMIN-DTO-01 2026-07-27
 *
 * @CODE-MEMORY-CHANGE 2026-07-27
 * WorkItem: BE-HRM-ADMIN-DTO-01
 * change_mode: ADD
 * What: company_id TEXT MaxLength(64); employee_id optional @IsUUID (cột soft UUID)
 * Why: Đóng G-ADM-DTO-01 plane UUID user vs TEXT company
 * SRS: FR-HRM-04 Diễn biến #2/#3
 * TechSpec: docs/hrm/API_DESIGN_HRM_ADMIN.md §C · DB_DESIGN §3.3
 * must_keep: empty employees reject; Auth dual-plane cite
 */
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';

class InviteEmployeeItemDto {
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  full_name?: string;

  /** Soft link → employees.id (UUID column); omit when account-only invite. */
  @IsOptional()
  @IsUUID()
  employee_id?: string;
}

export class InviteEmployeesDto {
  /** Plane B operating slug or UUID-as-text — membership.company_id TEXT. */
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  company_id!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => InviteEmployeeItemDto)
  employees!: InviteEmployeeItemDto[];
}
