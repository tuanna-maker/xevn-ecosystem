/** Resolve employee_id filter for leave detail list lookup (J-MOB-09 whos-out). */
export function resolveLeaveDetailEmployeeFilter(input: {
  routeEmployeeId?: string;
  viewerEmployeeId: string;
}): string {
  const routeId = input.routeEmployeeId?.trim() ?? '';
  if (routeId) return routeId;
  return input.viewerEmployeeId.trim();
}

/** Build query params for GET /attendance/leave-requests scoped lookup. */
export function buildLeaveDetailListQuery(companyId: string, employeeId?: string): URLSearchParams {
  const q = new URLSearchParams({ company_id: companyId });
  const eid = employeeId?.trim();
  if (eid) q.set('employee_id', eid);
  return q;
}
