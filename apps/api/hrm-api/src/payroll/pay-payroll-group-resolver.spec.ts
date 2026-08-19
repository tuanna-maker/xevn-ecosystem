import {
  employeeMatchesPayrollGroupRule,
  resolvePayrollGroupWinner,
  type EmployeePayrollGroupAttrs,
  type PayPayrollGroupCatalogRow,
} from './pay-payroll-group-resolver';

describe('pay-payroll-group-resolver', () => {
  const emp: EmployeePayrollGroupAttrs = {
    employee_id: 'e1',
    employee_code: 'NV001',
    employee_name: 'Test',
    department_id: 'dept-a',
    position_key: 'NV_KD',
  };

  it('explicit employee_ids override wins match_source', () => {
    const hit = employeeMatchesPayrollGroupRule(emp, {
      employee_ids: ['e1'],
      department_ids: ['other'],
    });
    expect(hit.match).toBe(true);
    expect(hit.match_source).toBe('explicit_list');
  });

  it('priority resolves dual match', () => {
    const groups: PayPayrollGroupCatalogRow[] = [
      {
        id: 'g-low',
        company_id: 'holding',
        code: 'A',
        name_vi: 'A',
        priority: 1,
        match_rule_json: { position_keys: ['NV_KD'] },
        status: 'active',
      },
      {
        id: 'g-high',
        company_id: 'holding',
        code: 'B',
        name_vi: 'B',
        priority: 10,
        match_rule_json: { department_ids: ['dept-a'] },
        status: 'active',
      },
    ];
    const resolved = resolvePayrollGroupWinner(groups, emp);
    expect(resolved.ambiguous).toBe(false);
    expect(resolved.winner_id).toBe('g-high');
  });

  it('equal priority → ambiguous', () => {
    const groups: PayPayrollGroupCatalogRow[] = [
      {
        id: 'g1',
        company_id: 'holding',
        code: 'A',
        name_vi: 'A',
        priority: 5,
        match_rule_json: { position_keys: ['NV_KD'] },
        status: 'active',
      },
      {
        id: 'g2',
        company_id: 'holding',
        code: 'B',
        name_vi: 'B',
        priority: 5,
        match_rule_json: { department_ids: ['dept-a'] },
        status: 'active',
      },
    ];
    const resolved = resolvePayrollGroupWinner(groups, emp);
    expect(resolved.ambiguous).toBe(true);
    expect(resolved.group_ids).toEqual(['g1', 'g2']);
  });
});
