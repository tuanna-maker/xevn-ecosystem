import type {
  PersonaRole,
  PortalAlert,
  PortalStatusNormalized,
  UnifiedTask,
} from './command-center-types';
import { EMPLOYEE_ID, MANAGER_SCOPE_ROOT } from './command-center-dev-seed';

const IN_PROGRESS: PortalStatusNormalized[] = ['OPEN', 'IN_PROGRESS', 'PENDING_APPROVAL'];

function orgInManagerScope(orgUnitId: string): boolean {
  const underDispatch = ['dept-001', MANAGER_SCOPE_ROOT];
  return underDispatch.includes(orgUnitId);
}

export function filterTasksByPersona(tasks: UnifiedTask[], persona: PersonaRole): UnifiedTask[] {
  if (persona === 'bod') return tasks;
  if (persona === 'manager') {
    return tasks.filter((t) => orgInManagerScope(t.orgUnitId));
  }
  return tasks.filter((t) => t.assigneeUserId === EMPLOYEE_ID);
}

export function filterAlertsByPersona(alerts: PortalAlert[], persona: PersonaRole): PortalAlert[] {
  if (persona === 'bod') return alerts;
  if (persona === 'manager') {
    return alerts.filter((a) => orgInManagerScope(a.orgUnitId));
  }
  return alerts.filter((a) => a.orgUnitId === 'dept-001' && a.level !== 'info');
}

export function countInProgressByModule(
  tasks: UnifiedTask[],
  moduleCode: string | 'all',
): number {
  const list =
    moduleCode === 'all'
      ? tasks
      : tasks.filter((t) => t.moduleCode === moduleCode);
  return list.filter((t) => IN_PROGRESS.includes(t.statusNormalized)).length;
}
