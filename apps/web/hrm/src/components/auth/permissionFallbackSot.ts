/**
 * @CODE-MEMORY
 * Screen:     HRM — PermissionFallback SoT (UX-07 / Wave B)
 * UC:         UX-07 · Lane B PermissionFallback
 * BR:         Không silent-null khi thiếu view_salary / PII gated
 * SRS:        docs/program/UX-UI-ERP-ANALYSIS.md §9 PermissionFallback
 * Purpose:    Hằng số copy VI + CTA «Liên hệ HR» dùng chung component + vitest.
 * WorkItem:   D-UX-PERMISSION-FALLBACK-FE-01
 * Coded:      2026-07-28
 * Callers:    PermissionFallback.tsx · PermissionFallback.test.ts
 * must_keep:  title/message/cta VI; mailto CTA; i18n key path employeeProfile.permissionFallback.*
 * LastVerified: docs/qa/evidence/d-ux-permission-fallback-fe-01-20260728.md
 */

export const PERMISSION_FALLBACK_I18N = {
  title: 'employeeProfile.permissionFallback.title',
  message: 'employeeProfile.permissionFallback.message',
  contactHr: 'employeeProfile.permissionFallback.contactHr',
} as const;

/** SoT Vietnamese defaults — must match vi.json leaves */
export const PERMISSION_FALLBACK_VI = {
  title: 'Không có quyền xem nội dung này',
  message:
    'Nội dung lương / bảo mật bị hạn chế theo phân quyền. Liên hệ HR nếu bạn cần được cấp quyền.',
  contactHr: 'Liên hệ HR',
} as const;

/** SoT English defaults — must match en.json leaves */
export const PERMISSION_FALLBACK_EN = {
  title: 'You do not have permission to view this content',
  message:
    'Salary / sensitive content is restricted by your role. Contact HR if you need access.',
  contactHr: 'Contact HR',
} as const;

/** Default CTA target — mailbox placeholder; product may override via contactHref prop */
export const PERMISSION_FALLBACK_DEFAULT_CONTACT_HREF =
  'mailto:hr@xe.vn?subject=' +
  encodeURIComponent('Yêu cầu cấp quyền xem nội dung HRM');

export const PERMISSION_FALLBACK_TEST_IDS = {
  root: 'permission-fallback',
  contactHr: 'permission-fallback-contact-hr',
} as const;

export type PermissionFallbackVariant = 'default' | 'compact';
