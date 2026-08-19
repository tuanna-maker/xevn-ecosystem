/**
 * @CODE-MEMORY
 * Screen:     HRM → Bảng công — scope parity header (UC-BP-ATT-11)
 * UC:         UC-BP-ATT-11
 * BR:         BR-BP-TS-02 · scope list↔get↔sign (ADR §13)
 * SRS:        docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-ATT-11
 * TechSpec:   TECHSPEC_HRM_ENTERPRISE.md §6.4 · TR-CM-16
 * Purpose:    Một cổng scope cho attendance_sheets header — list, GET-by-id, ký, close/reopen.
 * WorkItem:   PO-HRM-BP-ATT-SIGN-BE-01
 * Coded:      2026-08-05
 * Callers:    AttendanceCatalogService · AttendanceSheetSignService
 * Callees:    resolveHrmListScope · assertResourceInHrmScope
 * must_keep:  Cùng chain với PATCH sheet (HRM-AS-404/409); không widen rollup
 * SOLID:      Tách helper để một chỗ đổi parity
 * LastVerified: attendance-sheet-scope-parity.spec.ts SP-ATT-SIGN-01..04 · PO-HRM-BP-ATT-SIGN-BE-RUNTIME-01 build+smoke
 *
 * @CODE-MEMORY-CHANGE 2026-08-05
 * WorkItem: PO-HRM-BP-ATT-SIGN-BE-RUNTIME-01
 * change_mode: FIX
 * What: Narrow unknown row to scope resource shape before assertResourceInHrmScope (TS2345 / watch compile)
 * Why: start:dev blocked → stale :28001 without submit/sign routes
 * must_keep: HRM-AS-404/409 codes; parity chain unchanged
 */
import { assertResourceInHrmScope, resolveHrmListScope } from '../common/hrm-list-scope';

export type AttendanceSheetHeaderRow = {
  id: string;
  company_id: string;
  status: string;
  [key: string]: unknown;
};

/** Scope gate — dùng sau SELECT header by id (parity với updateAttendanceSheet). */
/** Shape accepted by assertResourceInHrmScope — narrow unknown DB rows without widening scope. */
type AttendanceSheetScopeResource = {
  company_id?: string | null;
  custom_fields?: Record<string, unknown> | null;
};

export function assertAttendanceSheetHeaderInScope(
  row: unknown,
  companyId: string,
  authorization?: string,
): asserts row is AttendanceSheetHeaderRow {
  const scope = resolveHrmListScope(authorization, companyId);
  const resource: AttendanceSheetScopeResource | null | undefined =
    row === null || row === undefined
      ? row
      : typeof row === 'object'
        ? (row as AttendanceSheetScopeResource)
        : undefined;
  assertResourceInHrmScope(resource, scope, {
    notFoundCode: 'HRM-AS-404',
    mismatchCode: 'HRM-AS-409',
  });
}
