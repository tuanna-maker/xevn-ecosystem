/**
 * @CODE-MEMORY
 * Screen:     ATT OT compensation-type (hình thức bồi thường tăng ca) open catalog constants
 * UC:         AC-PLT-ATT-COMP-01* · BR-PLT-02/04/05/06 · L-ATT-OTC-01..16
 * BR:         DYNAMIC-LOCK · format-only code · no closed salary|compensatory_leave enum CHECK
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-BA-01.md §2..§7
 * TechSpec:   docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-SA-01.md Option B §5..§6
 * DB_DESIGN:  docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-DATA-01.md §2
 * API_DESIGN: F-ATT-CAT-OTC-01/02 · EFF · consumer HRM-ATT-OT-COMP-KEY
 * Purpose:    Status/source/error codes cho catalog att_ot_comp_type - format-only code, không enum đóng.
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-BE-01
 * Coded:      2026-08-08
 * Callers:    att-ot-comp-type.service · attendance.controller · attendance-requests.service
 * Callees:    (none - pure constants)
 * Impact:     Thêm CHECK code IN ('salary','compensatory_leave') = phá BR-PLT-05 (open catalog);
 *             trùng KEY HRM-ATT-OT-TYPE-KEY = phá orthogonality L-ATT-OTC-16.
 * must_keep:  soft-delete · open catalog · U65 no seed · KEY HRM-ATT-OT-COMP-KEY tách khỏi OT-TYPE ·
 *             FORBIDDEN fold vào att_ot_type · không cột payroll formula
 * SOLID:      Constants SRP - no I/O; tách khỏi peer att_ot_type (orthogonal OWN)
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-att-comp-type-catalog-be-01.md
 */

/** Row lifecycle - DATA §2.1 / chk_att_ot_comp_type_row_status. */
export const ATT_OT_COMP_TYPE_STATUSES = ['active', 'inactive'] as const;
export type AttOtCompTypeRowStatus = (typeof ATT_OT_COMP_TYPE_STATUSES)[number];

/** Format-only - FORBIDDEN closed code enum (BR-PLT-05 · L-ATT-OTC-04). */
export const ATT_OT_COMP_TYPE_KEY_FORMAT = /^[a-z][a-z0-9_]*$/;

export const ATT_OT_COMP_TYPE_CATALOG_KIND = 'att_ot_comp_type' as const;

export type AttOtCompTypeSource = 'att_native';

export const HRM_ATT_OTC_404 = 'HRM-ATT-OTC-404';
export const HRM_ATT_OTC_409 = 'HRM-ATT-OTC-409';
/** Admin validation (empty name, bad format). */
export const HRM_ATT_OTC_VAL = 'HRM-ATT-OTC-VAL';
/**
 * Consumer invent compensation_type when EFF > 0 (createOvertimeRequest · VAL-ATT-COMP-CNS-01).
 * MUST NOT be synonymised with HRM-ATT-OT-TYPE-KEY (L-ATT-OTC-16 orthogonal taxonomy).
 */
export const HRM_ATT_OT_COMP_KEY = 'HRM-ATT-OT-COMP-KEY';
export const HRM_PLT_CAT_CODE_CONFLICT = 'HRM-PLT-CAT-CODE-CONFLICT';

/**
 * Docs-only bootstrap examples (AS-IS FE SelectItem slugs) - NOT a product ceiling; NEVER enforce IN.
 * AS-IS FE codes = salary | compensatory_leave (i18n overtime.compensationTimeOff) - NOT time_off.
 * U65: ensureSchema does NOT seed these.
 */
export const ATT_OT_COMP_TYPE_STARTER_KEYS = [
  'salary',
  'compensatory_leave',
] as const;
