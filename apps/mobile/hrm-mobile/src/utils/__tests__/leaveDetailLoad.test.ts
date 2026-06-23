import { describe, expect, it } from 'vitest';
import {
  buildLeaveDetailListQuery,
  resolveLeaveDetailEmployeeFilter,
} from '../leaveDetailLoad';

describe('resolveLeaveDetailEmployeeFilter', () => {
  it('prefers route employeeId for whos-out colleague leave', () => {
    expect(
      resolveLeaveDetailEmployeeFilter({
        routeEmployeeId: '6c887177-2930-47a2-8d1f-4eba305556f8',
        viewerEmployeeId: 'viewer-emp',
      }),
    ).toBe('6c887177-2930-47a2-8d1f-4eba305556f8');
  });

  it('falls back to viewer employee for own leave list navigation', () => {
    expect(
      resolveLeaveDetailEmployeeFilter({
        routeEmployeeId: undefined,
        viewerEmployeeId: 'viewer-emp',
      }),
    ).toBe('viewer-emp');
  });
});

describe('buildLeaveDetailListQuery', () => {
  it('omits employee_id for scoped fallback lookup', () => {
    const q = buildLeaveDetailListQuery('holding');
    expect(q.get('company_id')).toBe('holding');
    expect(q.get('employee_id')).toBeNull();
  });

  it('includes employee_id when resolving colleague leave', () => {
    const q = buildLeaveDetailListQuery('holding', 'emp-huynh');
    expect(q.get('employee_id')).toBe('emp-huynh');
  });
});
