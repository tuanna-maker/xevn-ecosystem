/**
 * @CODE-MEMORY
 * Screen:     HRM → Cài đặt → Danh mục phụ cấp / khấu trừ
 * UC:         UC-SET-DEF-03 · AC-AMIS-SET-PC-CAT-01
 * BR:         BR-AMIS-SET-DEF-03 · BR-PLT-01/04/05
 * SRS:        docs/program/specs/PO-HRM-ALLOWANCE-CATALOG-SYNC-01.md §3–§5
 * TechSpec:   docs/program/specs/PO-HRM-ALLOWANCE-CATALOG-SYNC-API-01.md F-ALLOW-CAT-*
 * Purpose:    Error taxonomy + PC/KT component-type guard set — open catalog N+1, no closed code enum.
 * WorkItem:   PO-HRM-ALLOWANCE-CATALOG-SYNC-BE-01
 * Coded:      2026-08-07
 * Callers:    allowance-catalog-sync.service · payroll-catalog.service (dual-write guard)
 * must_keep:  soft-delete · PAY-native LUONG_CO_BAN not in PC/KT set · U65 no seed
 * SOLID:      Constants SRP — no I/O
 * LastVerified: docs/qa/evidence/po-hrm-allowance-catalog-sync-be-01.md
 */

import { SALARY_COMPONENT_CODE_FORMAT } from '../payroll/payroll-catalog.constants';

/** Re-export open slug format — same as salary_components (BR-PLT-05). */
export const ALLOWANCE_CATALOG_CODE_FORMAT = SALARY_COMPONENT_CODE_FORMAT;

/** Default PAY component_type for PC/KT entry_kind (pay_types REF). */
export const PAY_PC_KT_COMPONENT_TYPES = ['phu_cap', 'khau_tru'] as const;
export type PayPcKtComponentType = (typeof PAY_PC_KT_COMPONENT_TYPES)[number];

export const ALLOWANCE_ENTRY_KINDS = ['allowance', 'deduction'] as const;
export type AllowanceEntryKind = (typeof ALLOWANCE_ENTRY_KINDS)[number];

export const ALLOWANCE_NATURES = ['income', 'deduction', 'other'] as const;
export type AllowanceNature = (typeof ALLOWANCE_NATURES)[number];

export const ALLOWANCE_VALUE_TYPES = ['currency', 'number', 'percent'] as const;
export const ALLOWANCE_CALC_MODES = ['fixed', 'formula', 'rate'] as const;
export const ALLOWANCE_STATUSES = ['draft', 'active', 'retired'] as const;

export const HRM_ALLOW_CAT_201 = 'HRM-ALLOW-CAT-201';
export const HRM_ALLOW_CAT_200 = 'HRM-ALLOW-CAT-200';
export const HRM_ALLOW_CAT_404 = 'HRM-ALLOW-CAT-404';
export const HRM_ALLOW_CAT_409_CODE = 'HRM-ALLOW-CAT-409-CODE';
export const HRM_ALLOW_CAT_409_DUAL_WRITE = 'HRM-ALLOW-CAT-409-DUAL-WRITE';
export const HRM_ALLOW_CAT_409_LINKED = 'HRM-ALLOW-CAT-409-LINKED';
export const HRM_ALLOW_CAT_CODE_INVALID = 'HRM-ALLOW-CAT-CODE-INVALID';
export const HRM_ALLOW_CAT_NATURE_MISMATCH = 'HRM-ALLOW-CAT-NATURE-MISMATCH';
export const HRM_ALLOW_CAT_500_SYNC = 'HRM-ALLOW-CAT-500-SYNC';
export const HRM_PAY_FORMULA_404_DEF = 'HRM-PAY-FORMULA-404-DEF';

export const ALLOWANCE_CATALOG_DUAL_WRITE_VI =
  'Tạo phụ cấp/khấu trừ qua Cài đặt → Danh mục PC/KT';
export const ALLOWANCE_CATALOG_LINKED_VI =
  'Sửa/ngừng theo dõi thành phần đã liên kết PC/KT qua Cài đặt → Danh mục PC/KT';

export function isAllowanceDeductionComponentType(
  componentType: string | null | undefined,
): boolean {
  const t = (componentType ?? '').trim().toLowerCase();
  return (PAY_PC_KT_COMPONENT_TYPES as readonly string[]).includes(t);
}

export function defaultComponentTypeForEntryKind(
  entryKind: AllowanceEntryKind,
): PayPcKtComponentType {
  return entryKind === 'deduction' ? 'khau_tru' : 'phu_cap';
}

export function defaultNatureForEntryKind(
  entryKind: AllowanceEntryKind,
): AllowanceNature {
  return entryKind === 'deduction' ? 'deduction' : 'income';
}

export function mergeTokenKeyForEntry(
  entryKind: AllowanceEntryKind,
  code: string,
): string {
  const lower = code.trim().toLowerCase();
  return entryKind === 'deduction'
    ? `cb.deduction_${lower}`
    : `cb.allowance_${lower}`;
}

export function mergeTokenSourcePathForEntry(
  entryKind: AllowanceEntryKind,
  code: string,
): string {
  const c = code.trim();
  return entryKind === 'deduction'
    ? `cb.deductions.${c}`
    : `cb.allowances.${c}`;
}
