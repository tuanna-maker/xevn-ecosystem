/**
 * @CODE-MEMORY
 * Screen:     ATT leave type open catalog constants
 * UC:         AC-PLT-ATT-01..03 · BR-PLT-02/04/05/06
 * BR:         DYNAMIC-LOCK — format-only leave_type_key · no closed starter enum
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-DATA-01.md §2
 * API_DESIGN: docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-VERTICAL-SA-01.md §3 F-ATT-CAT-*
 * Purpose:    Category/status sets + error codes for att_leave_type — FORBIDDEN key IN (LVT_*).
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-BE-01
 * Coded:      2026-08-07
 * must_keep:  soft-delete · open catalog · U65 no seed · work_shifts ops untouched
 * SOLID:      Constants SRP — no I/O
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-att-be-01.md
 */

/** Typed category — not a leave_type_key ceiling. */
export const ATT_LEAVE_TYPE_CATEGORIES = [
  'annual',
  'seniority',
  'ot_comp',
  'carry_over',
  'advance',
  'sick',
  'other',
] as const;
export type AttLeaveTypeCategory = (typeof ATT_LEAVE_TYPE_CATEGORIES)[number];

export const ATT_LEAVE_TYPE_STATUSES = ['active', 'retired'] as const;
export type AttLeaveTypeStatus = (typeof ATT_LEAVE_TYPE_STATUSES)[number];

/** Format-only — FORBIDDEN closed leave_type_key enum (BR-PLT-05). */
export const ATT_LEAVE_TYPE_KEY_FORMAT = /^[a-z][a-z0-9_]*$/;

export const ATT_LEAVE_TYPE_CATALOG_KIND = 'att_leave_type' as const;

export type AttLeaveTypeSource = 'att_native' | 'group_ref' | 'att_override';

/** Reuse platform taxonomy (VAL-ATT-LVT-02/03). */
export const HRM_PLT_CAT_CODE_INVALID = 'HRM-PLT-CAT-CODE-INVALID';
export const HRM_PLT_CAT_CODE_CONFLICT = 'HRM-PLT-CAT-CODE-CONFLICT';
export const HRM_ATT_LVT_404 = 'HRM-ATT-LVT-404';
/** Submit leave_type ∉ effective when catalog >0 (VAL-ATT-LVT-08 · BR-PLT-02). */
export const HRM_LEAVE_TYPE_UNKNOWN = 'HRM-LEAVE-TYPE-UNKNOWN';

/** Settings group REF partition key — dual SoT read (BR-PLT-06). */
export const ATT_LEAVE_TYPES_GROUP_REF_KEY = 'leave_types';
