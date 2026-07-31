/**
 * @CODE-MEMORY
 * Screen:     HRM → Quản trị → Đặt lại mật khẩu / email (FR-HRM-05)
 * UC:         UC-HRM-05 · FR-HRM-05
 * BR:         sensitive credential · no plaintext echo
 * SRS:        docs/client-delivery/hrm/SRS_HRM_KHACH.md §3.27 · FR-HRM-05
 * TechSpec:   docs/hrm/TECHSPEC.md §16.2 · HRM-ADMIN-204
 * Purpose:    DTO reset nhạy cảm — user_id bắt buộc UUID (profiles.user_id), khác XBOS Auth TEXT email user_id.
 * WorkItem:   BE-HRM-ADMIN-DTO-01
 * Coded:      2026-07-27
 * Callers:    hrm-admin.controller.ts → resetUserPassword
 * Callees:    class-validator · HrmAdminService.resetUserPassword → profiles (+ cascade email)
 * FEActions:  Chọn tài khoản → Lưu → không hiện mật khẩu
 * BEChain:    ValidationPipe → UPDATE password_hash / email cascade
 * Impact:     Đổi user_id sang email TEXT sẽ phá plane HRM admin vs Auth must_keep
 * must_keep:  @IsUUID user_id · Auth/Tenant cite · G-ADM-01 audit residual · U65 · HOLD_DEPLOY
 * SOLID:      SRP — sensitive shape tách create admin DTOs
 * LastVerified: hrm-admin.dto.spec.ts · BE-HRM-ADMIN-DTO-01 2026-07-27
 *
 * @CODE-MEMORY-CHANGE 2026-07-27
 * WorkItem: BE-HRM-ADMIN-DTO-01
 * change_mode: ADD
 * What: Khẳng định user_id @IsUUID (plane A HRM); không đổi sang email TEXT Auth
 * Why: G-ADM-DTO-01 = company TEXT vs user UUID consistency, không unify Auth
 * SRS: FR-HRM-05 Diễn biến #2
 * TechSpec: docs/hrm/API_DESIGN_HRM_ADMIN.md §D · docs/xbos/API_DESIGN_XBOS_AUTH_TENANT.md (cite)
 * must_keep: ValidateIf password/email; MinLength(8); Auth dual-plane
 */
import { IsEmail, IsOptional, IsString, IsUUID, MinLength, ValidateIf } from 'class-validator';

export class ResetUserPasswordDto {
  /** HRM admin plane profiles.user_id — UUID (≠ XBOS Auth TEXT email user_id). */
  @IsUUID()
  user_id!: string;

  @ValidateIf((obj: ResetUserPasswordDto) => !obj.new_email)
  @IsOptional()
  @IsString()
  @MinLength(8)
  new_password?: string;

  @ValidateIf((obj: ResetUserPasswordDto) => !obj.new_password)
  @IsOptional()
  @IsEmail()
  new_email?: string;
}
