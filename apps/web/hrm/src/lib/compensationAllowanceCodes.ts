/**
 * @CODE-MEMORY
 * Screen:     EmployeeProfile → Contracts → tab Đãi ngộ (allowance pickers)
 * UC:         UC-HRM-CI-08 · AC-CD-F5-03
 * BR:         BR-CD-F5-03
 * SRS:        docs/program/deltas/CUSTOMER_DEMO_HRM_DELTA_20260620.md §5
 * TechSpec:   docs/hrm/DANH_MUC_XBOS_CHO_HRM.md §33 Loại phụ cấp
 * Purpose:    Canonical XBOS DM §33 allowance codes for compensation lines.
 * WorkItem:   CD-FB-08-CONTRACT
 * Coded:      2026-07-19
 * Callers:    EmployeeCompensationPanel.tsx
 * Callees:    N/A (static catalog mirror until settings-catalog pull wired)
 * Impact:     AC-CD-F5-03 requires ≥2 distinct allowance_code on package
 * must_keep:  Codes match BE test fixtures (PHU_CAP_AN / PHU_CAP_XANG)
 * SOLID:      SRP — catalog constant separate from API client
 * LastVerified: compensationLines.test.ts
 */

export type XbosAllowanceCodeOption = {
  code: string;
  label: string;
};

/** XBOS DM §33 — Loại phụ cấp (codes accepted by HRM-COMP-003). */
export const XBOS_ALLOWANCE_CODE_OPTIONS: readonly XbosAllowanceCodeOption[] = [
  { code: 'PHU_CAP_AN', label: 'Phụ cấp ăn' },
  { code: 'PHU_CAP_XANG', label: 'Phụ cấp xăng xe' },
  { code: 'PHU_CAP_DIEN_THOAI', label: 'Phụ cấp điện thoại' },
  { code: 'PHU_CAP_NHA_O', label: 'Phụ cấp nhà ở' },
  { code: 'PHU_CAP_TRACH_NHIEM', label: 'Phụ cấp trách nhiệm' },
] as const;
