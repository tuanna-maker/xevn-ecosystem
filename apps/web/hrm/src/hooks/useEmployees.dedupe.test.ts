import { describe, expect, it } from 'vitest';
import { dedupeEmployeesById } from '@/hooks/useEmployees';

describe('P1-HRM-EMP-DUP-KEY-FE — employee identity normalization', () => {
  it('keeps the first employee for each id without reordering unique rows', () => {
    const employees = [
      { id: 'employee-1', full_name: 'First version' },
      { id: 'employee-2', full_name: 'Second employee' },
      { id: 'employee-1', full_name: 'Duplicate version' },
      { id: 'employee-3', full_name: 'Third employee' },
    ];

    expect(dedupeEmployeesById(employees)).toEqual([
      { id: 'employee-1', full_name: 'First version' },
      { id: 'employee-2', full_name: 'Second employee' },
      { id: 'employee-3', full_name: 'Third employee' },
    ]);
  });

  it('does not mutate the merged API collection', () => {
    const employees = [
      { id: 'employee-1' },
      { id: 'employee-1' },
    ];

    dedupeEmployeesById(employees);

    expect(employees).toHaveLength(2);
  });
});
