import type { MobileMembership } from '../context/AuthContext';
import type { HrmOperatingUnitRow } from '../integrations/hrmOperatingUnits';
import { resolveCompanyDisplayVi } from './companyDisplayVi';
import { sanitizeProfileDisplay } from './profileTabs';

const ROLE_LABELS_VI: Record<string, string> = {
  employee: 'Nhân viên',
  manager: 'Quản lý',
  hr_manager: 'Quản lý nhân sự',
  hr_staff: 'Nhân viên nhân sự',
  ceo: 'Giám đốc điều hành',
  admin: 'Quản trị viên',
};

/** Settings card — Vietnamese role list (no raw JWT role keys). */
export function resolveAuthRolesVi(roles: string[]): string {
  if (!roles.length) return 'Chưa có';
  return roles
    .map((role) => {
      const key = role.trim().toLowerCase();
      return ROLE_LABELS_VI[key] ?? 'Nhân viên';
    })
    .join(', ');
}

export function resolveScopeScreenSubtitle(showOperatingUnits: boolean): string {
  if (showOperatingUnits) {
    return 'Chọn đơn vị vận hành hoặc xem toàn tập đoàn.';
  }
  return 'Chọn công ty kiêm nhiệm — chỉ phạm vi công ty của bạn.';
}

export function resolveOperatingUnitsSectionTitle(): string {
  return 'Đơn vị vận hành';
}

export function resolveRollupOperatingUnitSubtitle(): string {
  return 'Xem dữ liệu toàn tập đoàn';
}

export function resolveRollupOperatingUnitMeta(): string {
  return 'Phạm vi tập đoàn';
}

export function resolveOperatingUnitRowSubtitle(unit: HrmOperatingUnitRow): string {
  return `Lọc danh sách theo ${unit.display_name_vi}`;
}

export function resolveOperatingUnitRowMeta(unit: HrmOperatingUnitRow): string {
  return `Thứ tự hiển thị: ${unit.rollup_order}`;
}

export function resolveMembershipSectionTitle(multi: boolean): string {
  return multi ? 'Kiêm nhiệm' : 'Phạm vi nhân viên';
}

export function resolveMembershipRowTitle(
  membership: MobileMembership,
  operatingUnits?: HrmOperatingUnitRow[],
): string {
  return resolveCompanyDisplayVi(membership.company_id, {
    membershipCompanyDisplay: membership.company_display,
    operatingUnits,
  });
}

export function resolveMembershipRowSubtitle(membership: MobileMembership): string {
  const name = sanitizeProfileDisplay(membership.employee_name);
  const code = sanitizeProfileDisplay(membership.employee_code);
  if (name !== '—' && code !== '—') return `${name} · ${code}`;
  if (name !== '—') return name;
  if (code !== '—') return code;
  return 'Nhân viên';
}

export function resolveMembershipRowMeta(membership: MobileMembership): string {
  return membership.is_primary ? 'Kiêm nhiệm chính' : 'Kiêm nhiệm phụ';
}
