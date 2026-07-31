/**
 * @CODE-MEMORY
 * Screen:     HRM → Quản trị → Tạo quản trị nền tảng (FR-HRM-02)
 * UC:         UC-HRM-02 · FR-HRM-02
 * BR:         profiles + platform_admins UPSERT
 * SRS:        docs/client-delivery/hrm/SRS_HRM_KHACH.md §3.24 · FR-HRM-02
 * TechSpec:   docs/hrm/TECHSPEC.md §16.2 · HRM-ADMIN-201
 * Purpose:    DTO tạo grant nền tảng — không có company_id; user_id sinh UUID ở service.
 * WorkItem:   BE-HRM-ADMIN-DTO-01
 * Coded:      2026-07-27
 * Callers:    hrm-admin.controller.ts → createPlatformAdmin
 * Callees:    class-validator · HrmAdminService.createPlatformAdmin
 * FEActions:  Form Lưu → POST /admin/platform-admin
 * BEChain:    ValidationPipe → findOrCreatePortalUser → UPSERT platform_admins
 * Impact:     Thêm company_id vào DTO này = invent ngoài FR-02
 * must_keep:  FR-02..05 · Auth/Tenant · password MinLength(8) · U65 · HOLD_DEPLOY
 * SOLID:      SRP — FR-02 shape không gộp FR-03
 * LastVerified: hrm-admin.controller.spec.ts · BE-HRM-ADMIN-DTO-01 2026-07-27
 *
 * @CODE-MEMORY-CHANGE 2026-07-27
 * WorkItem: BE-HRM-ADMIN-DTO-01
 * change_mode: ADD
 * What: CODE-MEMORY neo plane — FR-02 không đụng company_id TEXT
 * Why: Wave G-ADM-DTO-01 chỉ harden FR-03/04 company_id + FR-05 user_id UUID
 * must_keep: email/password; không seed admin
 */
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreatePlatformAdminDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsOptional()
  @IsString()
  full_name?: string;
}
