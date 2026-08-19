/**
 * @CODE-MEMORY
 * Screen:     ATT attendance-code (ký hiệu công) open catalog constants
 * UC:         AC-PLT-ATT-CODE-01* · BR-PLT-02/04/05/06 · L-ATT-CODE-01..14
 * BR:         DYNAMIC-LOCK — format-only code · no closed pending|present|absent|leave enum CHECK
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-BA-01.md §3
 * TechSpec:   docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-SA-01.md §5–§6
 * DB_DESIGN:  docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-DATA-01.md §2
 * API_DESIGN: F-ATT-CAT-CODE-* · F-ATT-CODE-CNS-01 · HRM-ATT-CODE-KEY
 * Purpose:    Status/source/counts_as sets + error codes — FORBIDDEN code IN (pending,present,…).
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-BE-01
 * Coded:      2026-08-08
 * must_keep:  soft-delete · dual SoT attendance_codes REF · U65 no seed · leave/worksite/shifts seals ·
 *             L-ATT-CODE-07 aggregate sealed · FORBIDDEN fold into att_leave_type
 * SOLID:      Constants SRP — no I/O
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-att-code-catalog-be-01.md
 */

export const ATT_ATTENDANCE_CODE_STATUSES = ['active', 'retired'] as const;
export type AttAttendanceCodeRowStatus = (typeof ATT_ATTENDANCE_CODE_STATUSES)[number];

/** Format-only — FORBIDDEN closed code enum (BR-PLT-05 · L-ATT-CODE-04). */
export const ATT_ATTENDANCE_CODE_KEY_FORMAT = /^[a-z][a-z0-9_]*$/;

/** Typed semantic class — ≠ code key ceiling (DATA §2.3 · L-ATT-CODE-07 GĐ2 metadata). */
export const ATT_ATTENDANCE_CODE_COUNTS_AS = [
  'work',
  'paid_leave',
  'unpaid_leave',
  'holiday',
  'absent',
  'other',
] as const;
export type AttAttendanceCodeCountsAs = (typeof ATT_ATTENDANCE_CODE_COUNTS_AS)[number];

export const ATT_ATTENDANCE_CODE_CATALOG_KIND = 'att_attendance_code' as const;

export type AttAttendanceCodeSource = 'att_native' | 'group_ref' | 'att_override';

/** Platform taxonomy. */
export const HRM_PLT_CAT_CODE_INVALID = 'HRM-PLT-CAT-CODE-INVALID';
export const HRM_PLT_CAT_CODE_CONFLICT = 'HRM-PLT-CAT-CODE-CONFLICT';
export const HRM_ATT_CODE_404 = 'HRM-ATT-CODE-404';
/** Attendance day-code ∉ effective when catalog >0 (F-ATT-CODE-CNS-01 · VAL-ATT-CODE-CNS-01). */
export const HRM_ATT_CODE_KEY = 'HRM-ATT-CODE-KEY';
/** Alias documented in SA/BA — same semantic as HRM_ATT_CODE_KEY. */
export const HRM_ATT_CODE_UNKNOWN = 'HRM-ATT-CODE-UNKNOWN';

/** Settings group REF partition keys — dual SoT merge-read (BR-PLT-06 · L-ATT-CODE-03). */
export const ATT_ATTENDANCE_CODE_GROUP_REF_KEYS = ['attendance_codes'] as const;

/**
 * Docs-only bootstrap examples — NOT a product ceiling; NEVER enforce IN (…).
 * U65: ensureSchema does NOT seed these.
 */
export const ATT_ATTENDANCE_CODE_STARTER_KEYS = [
  'pending',
  'present',
  'absent',
  'leave',
  'business_trip',
  'half_day',
  'wfh',
  'holiday',
  'unpaid',
] as const;
