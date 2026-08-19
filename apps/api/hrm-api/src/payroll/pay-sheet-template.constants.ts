/** Error codes — PO-HRM-AMIS-PARITY-PAY-TPL-API-01 §9 */
export const HRM_PAY_TPL_CODE_INVALID = 'HRM-PAY-TPL-CODE-INVALID';
export const HRM_PAY_TPL_409_CODE = 'HRM-PAY-TPL-409-CODE';
export const HRM_PAY_TPL_409_LINE = 'HRM-PAY-TPL-409-LINE';
export const HRM_PAY_TPL_404_COMPONENT = 'HRM-PAY-TPL-404-COMPONENT';
export const HRM_PAY_TPL_404 = 'HRM-PAY-TPL-404';
export const HRM_PAY_TPL_412_TEMPLATE = 'HRM-PAY-TPL-412-TEMPLATE';
export const HRM_PAY_TPL_409_IMMUTABLE = 'HRM-PAY-TPL-409-IMMUTABLE';

/** Open-catalog slug — NOT a closed business-code enum. */
export const PAY_SHEET_TPL_CODE_FORMAT = /^[a-z][a-z0-9_-]{0,63}$/;

export const PAY_SHEET_TPL_STATUSES = ['draft', 'active', 'retired'] as const;
export type PaySheetTemplateStatus = (typeof PAY_SHEET_TPL_STATUSES)[number];

/** PO-HRM-PAY-SHEET-TEMPLATE-SPEC-01 §2.1 — 'province' ADD, recommended value, KHÔNG phải closed enum. */
export const PAY_SHEET_TPL_APPLICABILITY = [
  'company',
  'ou',
  'position',
  'employee',
  'province',
] as const;
export type PaySheetApplicabilityScope = (typeof PAY_SHEET_TPL_APPLICABILITY)[number];

/** PO-HRM-PAY-SHEET-TEMPLATE-SPEC-01 §6 — province EXPAND error taxonomy (4 code, ADD). */
export const HRM_PAY_TPL_400_PROVINCE_SCOPE = 'HRM-PAY-TPL-400-PROVINCE-SCOPE';
export const HRM_PAY_TPL_409_PROVINCE_DUP = 'HRM-PAY-TPL-409-PROVINCE-DUP';
export const HRM_PAY_TPL_PROVINCE_MISMATCH = 'HRM-PAY-TPL-PROVINCE-MISMATCH';
export const HRM_PAY_TPL_412_NO_PROVINCE_MATCH = 'HRM-PAY-TPL-412-NO-PROVINCE-MATCH';

/** PO-HRM-PAY-TPL-RESOLVE-BIND-WIRE-BE-01 — thiếu employee_id khi autoResolve=true tại bind kỳ. */
export const HRM_PAY_TPL_400_AUTO_RESOLVE_INPUT = 'HRM-PAY-TPL-400-AUTO-RESOLVE-INPUT';
