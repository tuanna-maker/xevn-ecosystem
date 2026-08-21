/**
 * @CODE-MEMORY
 * Screen:     HRM → Quản trị → Gán quản trị đơn vị (FR-HRM-03)
 * UC:         UC-HRM-03 · FR-HRM-03
 * BR:         membership UPSERT · role admin default
 * SRS:        docs/client-delivery/hrm/SRS_HRM_KHACH.md §3.25 · FR-HRM-03
 * TechSpec:   docs/hrm/TECHSPEC.md §16.2 · HRM-ADMIN-202
 * Purpose:    DTO tạo/cập nhật quản trị ĐV — company_id TEXT Plane B (slug hoặc UUID-as-text), khớp cột membership.
 * WorkItem:   BE-HRM-ADMIN-DTO-01
 * Coded:      2026-07-27
 * Callers:    hrm-admin.controller.ts → createCompanyAdmin
 * Callees:    class-validator · HrmAdminService.createCompanyAdmin → user_company_memberships
 * FEActions:  Form Lưu → POST /admin/company-admin → toast + F5 list membership
 * BEChain:    ValidationPipe → findOrCreatePortalUser → UPSERT membership TEXT company_id
 * Impact:     @IsUUID chặn slug holding/main → 400 lệch DB TEXT / Auth-Tenant Plane B
 * must_keep:  FR-02..05 · XBOS Auth/Tenant JWT cite · Fleet/OP · U65 · HOLD_DEPLOY · password MinLength(8)
 * SOLID:      SRP — shape FR-03 tách InviteEmployeesDto / CreatePlatformAdminDto
 * LastVerified: hrm-admin.dto.spec.ts · BE-HRM-ADMIN-DTO-01 2026-07-27
 *
 * @CODE-MEMORY-CHANGE 2026-07-27
 * WorkItem: BE-HRM-ADMIN-DTO-01
 * change_mode: ADD
 * What: company_id @IsString @IsNotEmpty @MaxLength(64) — đóng G-ADM-DTO-01 (bỏ @IsUUID)
 * Why: Physical SoT TEXT Plane B; UUID DTO chặn slug hợp lệ
 * SRS: FR-HRM-03 Diễn biến #2/#4
 * TechSpec: docs/hrm/API_DESIGN_HRM_ADMIN.md §B · DB_DESIGN §3.3
 * must_keep: email/password validation; Auth/Tenant không unify user_id
 */
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateCompanyAdminDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsOptional()
  @IsString()
  full_name?: string;

  /** Plane B operating slug (`holding`, member) or UUID-as-text — DDL TEXT, not LE-only UUID. */
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  company_id!: string;

  @IsOptional()
  @IsString()
  role?: string;
}
