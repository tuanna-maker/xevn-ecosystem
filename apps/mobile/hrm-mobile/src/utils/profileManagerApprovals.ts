import { readListRows } from '../integrations/envelope';
import { hrmRequest } from '../integrations/hrmApiClient';
import type { HrmAuthConfig } from '../integrations/types';
import { formatManagerCardTitle } from './dashboardHub';

/** QA / HDSD J-MOB-05 â€” profile default tab entry to manager inbox. */
export const PROFILE_APPROVALS_ENTRY_TEST_ID = 'profile-approvals-entry';

export type ManagerPendingSnapshot = {
  pendingAtt: number;
  pendingLeave: number;
  total: number;
};

export function resolveManagerPendingTotal(snapshot: ManagerPendingSnapshot): number {
  return Math.max(0, snapshot.pendingAtt + snapshot.pendingLeave);
}

export function formatProfileApprovalsEntryLabel(count: number): string {
  return formatManagerCardTitle(count);
}

/** Same query contract as RootNavigator manager tab badge â€” manager_employee_id scope. */
export async function fetchManagerPendingSnapshot(
  auth: HrmAuthConfig,
  attendanceCompanyId: string,
  managerEmployeeId: string,
): Promise<ManagerPendingSnapshot> {
  const cid = attendanceCompanyId.trim();
  const mid = managerEmployeeId.trim();
  if (!cid || !mid) {
    return { pendingAtt: 0, pendingLeave: 0, total: 0 };
  }

  const q = new URLSearchParams({
    company_id: cid,
    status: 'pending',
    manager_employee_id: mid,
  });

  const [attRes, leaveRes] = await Promise.all([
    hrmRequest<unknown>(auth, `/attendance/update-requests?${q.toString()}`, { method: 'GET' }),
    hrmRequest<unknown>(auth, `/attendance/leave-requests?${q.toString()}`, { method: 'GET' }),
  ]);

  const pendingAtt = attRes.ok ? readListRows(attRes.data).length : 0;
  const pendingLeave = leaveRes.ok ? readListRows(leaveRes.data).length : 0;
  const total = pendingAtt + pendingLeave;

  return { pendingAtt, pendingLeave, total };
}
