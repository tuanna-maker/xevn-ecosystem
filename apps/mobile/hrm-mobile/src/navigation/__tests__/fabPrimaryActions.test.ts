import { describe, expect, it } from 'vitest';

import {
  FAB_ACTION_SHEET_TITLE,
  CHECK_IN_FAB_ACCESSIBILITY_LABEL,
  resolveFabPrimaryActions,
} from '../fabPrimaryActions';

describe('fabPrimaryActions — MOB-UX-10-P0 persona sheet', () => {
  it('employee gets check-in + create leave + create update-request', () => {
    const actions = resolveFabPrimaryActions({ persona: 'employee' });
    expect(actions.map((a) => a.id)).toEqual([
      'check_in',
      'create_leave',
      'create_update_request',
    ]);
    expect(actions[0].label).toBe('Chấm công');
    expect(actions[1].label).toBe('Tạo đơn nghỉ');
    expect(actions[2].label).toBe('Tạo đơn công');
  });

  it('manager adds approvals row after primary actions', () => {
    const actions = resolveFabPrimaryActions({ persona: 'manager', managerPendingCount: 0 });
    expect(actions.map((a) => a.id)).toEqual([
      'check_in',
      'create_leave',
      'create_update_request',
      'manager_approvals',
    ]);
    expect(actions[3].badgeCount).toBeUndefined();
  });

  it('leader hides check-in — BR-PERS-02', () => {
    const actions = resolveFabPrimaryActions({ persona: 'leader', managerPendingCount: 3 });
    expect(actions.map((a) => a.id)).toEqual([
      'create_leave',
      'create_update_request',
      'manager_approvals',
    ]);
    expect(actions.find((a) => a.id === 'manager_approvals')?.badgeCount).toBe(3);
  });

  it('manager approvals row shows badge when pending > 0', () => {
    const actions = resolveFabPrimaryActions({ persona: 'manager', managerPendingCount: 5 });
    const approvals = actions.find((a) => a.id === 'manager_approvals');
    expect(approvals?.badgeCount).toBe(5);
    expect(approvals?.accessibilityLabel).toContain('5');
  });

  it('FAB accessibility opens sheet — not direct check-in label', () => {
    expect(CHECK_IN_FAB_ACCESSIBILITY_LABEL).toBe('Thao tác nhanh');
    expect(FAB_ACTION_SHEET_TITLE).toBe('Thao tác nhanh');
  });

  it('exposes stable testIDs for device QA', () => {
    const actions = resolveFabPrimaryActions({ persona: 'manager', managerPendingCount: 2 });
    expect(actions[0].testID).toBe('fab-action-check-in');
    expect(actions[1].testID).toBe('fab-action-create-leave');
    expect(actions[2].testID).toBe('fab-action-create-update-request');
    expect(actions[3].testID).toBe('fab-action-manager-approvals');
  });

  it('keeps create_leave path for AT-01 must_keep (R-SPINE-AT-NAV-01)', () => {
    const emp = resolveFabPrimaryActions({ persona: 'employee' });
    const leave = emp.find((a) => a.id === 'create_leave');
    expect(leave?.testID).toBe('fab-action-create-leave');
    expect(leave?.label).toBe('Tạo đơn nghỉ');
  });
});
