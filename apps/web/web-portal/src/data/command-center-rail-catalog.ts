import type { PersonaRole, RailModuleItem } from './command-center-types';

/**
 * Static Command Center left-rail navigation catalog (not API mock fallback).
 * M-CC-13 — lives outside command-center-dev-seed.ts.
 */
export const commandCenterRailModules: RailModuleItem[] = [
  {
    moduleCode: 'group',
    label: 'GROUP',
    href: '/command-center',
    allowedRoles: ['bod', 'manager', 'employee'],
  },
  {
    moduleCode: 'finance',
    label: 'TÀI CHÍNH',
    href: '/dashboard/customers',
    allowedRoles: ['bod', 'manager'],
  },
  {
    moduleCode: 'accounting',
    label: 'KẾ TOÁN',
    href: '/dashboard/kpi-dashboard',
    allowedRoles: ['bod', 'manager'],
  },
  {
    moduleCode: 'hrm',
    label: 'NHÂN SỰ',
    href: '/dashboard/hr',
    allowedRoles: ['bod', 'manager'],
  },
  {
    moduleCode: 'business',
    label: 'KINH DOANH',
    href: '/dashboard/kpi-dashboard',
    allowedRoles: ['bod', 'manager', 'employee'],
  },
  {
    moduleCode: 'fleet',
    label: 'VẬN HÀNH',
    href: '/dashboard/organization',
    allowedRoles: ['bod', 'manager', 'employee'],
  },
  {
    moduleCode: 'system',
    label: 'CÀI ĐẶT HỆ THỐNG',
    href: '/command-center',
    allowedRoles: ['bod', 'manager', 'employee'],
  },
];

export function filterRailByRole(modules: RailModuleItem[], persona: PersonaRole): RailModuleItem[] {
  return modules.map((m) => {
    const allowed = m.allowedRoles.includes(persona);
    if (!allowed) {
      return {
        ...m,
        disabled: true,
        disabledReason: 'Bạn không có quyền truy cập phân hệ này',
      };
    }
    return { ...m };
  });
}
