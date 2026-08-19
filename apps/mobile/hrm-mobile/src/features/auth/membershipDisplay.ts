/**
 * @CODE-MEMORY
 * Screen:     Auth — LoginScreen / ScopeScreen membership labels
 * UC:         FR-UC-M01 · UC-M01 · UC-HRM-MOB-02
 * BR:         OS 28 display-ready — FE bind *_label từ BE
 * SRS:        docs/brand-new-documents-20270801/SRS_NEW.md v1.1 §3.2 · FR-UC-M01
 * TechSpec:   docs/brand-new-documents-20270801/API_CONTRACT_NEW.md §8.4–8.5
 * Purpose:    Bind nhãn membership từ HRM mobile auth (company_label, tenant_label,
 *             role_label, job_title_label). Không invent slug→label trên FE.
 * WorkItem:   W1-B-04-AUTH-MOB
 * Coded:      2026-08-03
 * Callers:    LoginScreen · ScopeScreen
 * Callees:    MobileMembership (AuthContext)
 * Impact:     Dùng lại resolveCompanyDisplayVi slug map → lộ raw slug / lệch BE
 * must_keep:  Ưu tiên company_label; company_display chỉ khi đã là label BE; không fallback company_id
 * SOLID:      SRP hiển thị tách khỏi AuthContext persist/JWT
 * LastVerified: membershipDisplay.test.ts
 */

import type { MobileMembership } from '../../context/AuthContext';

type CompanyLabelSource = Pick<MobileMembership, 'company_label' | 'company_display'> | null | undefined;
type TenantLabelSource = Pick<MobileMembership, 'tenant_label'> | null | undefined;
type RoleLabelSource = Pick<MobileMembership, 'role_label'> | null | undefined;
type JobTitleLabelSource = Pick<MobileMembership, 'job_title_label'> | null | undefined;

/** Công ty — BE company_label / company_display; không fallback slug. */
export function resolveMembershipCompanyLabel(m: CompanyLabelSource): string {
  const fromLabel = (m?.company_label ?? '').trim();
  if (fromLabel) return fromLabel;
  const fromDisplay = (m?.company_display ?? '').trim();
  if (fromDisplay) return fromDisplay;
  return '—';
}

/** Tenant — chỉ tenant_label từ BE; thiếu → «—» (cấm raw tenant_id). */
export function resolveMembershipTenantLabel(m: TenantLabelSource): string {
  const label = (m?.tenant_label ?? '').trim();
  return label || '—';
}

/** Vai trò — role_label từ BE. */
export function resolveMembershipRoleLabel(m: RoleLabelSource): string {
  const label = (m?.role_label ?? '').trim();
  return label || '—';
}

/** Chức danh — job_title_label từ BE. */
export function resolveMembershipJobTitleLabel(m: JobTitleLabelSource): string {
  const label = (m?.job_title_label ?? '').trim();
  return label || '—';
}

/** Meta hàng Scope — role + kiêm nhiệm; không map JWT role keys. */
export function resolveMembershipScopeMeta(
  m: Pick<MobileMembership, 'role_label' | 'is_primary'> | null | undefined,
): string {
  const role = resolveMembershipRoleLabel(m);
  const primary = m?.is_primary ? 'Kiêm nhiệm chính' : 'Kiêm nhiệm phụ';
  if (role === '—') return primary;
  return `${role} · ${primary}`;
}
