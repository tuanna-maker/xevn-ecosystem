import { describe, expect, it } from 'vitest';
import {
  createEmptyAdvanceRequestFormData,
  resolveAdvanceAddDialogOpenChange,
  type AdvanceRequestFormData,
} from '../advanceRequestFormUi';

describe('advanceRequestFormUi (D-UX-P0C-ADVANCE-LIVE-WIRE-01 / UX-06 live)', () => {
  const monthPrefix = 'Tháng ';
  const fixedNow = new Date(2026, 6, 28); // July 2026

  it('createEmptyAdvanceRequestFormData returns empty name + default period', () => {
    const empty = createEmptyAdvanceRequestFormData(monthPrefix, fixedNow);
    expect(empty).toEqual({
      name: '',
      salary_period: 'Tháng 7/2026',
      department: '',
      position: '',
    });
  });

  it('CLOSE (cancel/Esc) clears stale typed values — no QA_P0C_ADV_STALE', () => {
    const stale: AdvanceRequestFormData = {
      name: 'QA_P0C_ADV_STALE',
      salary_period: '2099-99',
      department: 'HR',
      position: '',
    };
    expect(stale.name).toBe('QA_P0C_ADV_STALE');

    const closed = resolveAdvanceAddDialogOpenChange(false, monthPrefix, fixedNow);
    expect(closed.showAddDialog).toBe(false);
    expect(closed.formData.name).toBe('');
    expect(closed.formData.salary_period).toBe('Tháng 7/2026');
    expect(closed.formData.department).toBe('');
    expect(JSON.stringify(closed.formData)).not.toMatch(/QA_P0C_ADV_STALE|2099-99/);
  });

  it('OPEN also starts from empty form (atomic — mirror OPEN_ADD_ADVANCE)', () => {
    const opened = resolveAdvanceAddDialogOpenChange(true, monthPrefix, fixedNow);
    expect(opened.showAddDialog).toBe(true);
    expect(opened.formData).toEqual(createEmptyAdvanceRequestFormData(monthPrefix, fixedNow));
  });

  it('fill → close → reopen transition never retains prior inputs', () => {
    let formData = createEmptyAdvanceRequestFormData(monthPrefix, fixedNow);
    let showAddDialog = false;

    const apply = (open: boolean) => {
      const next = resolveAdvanceAddDialogOpenChange(open, monthPrefix, fixedNow);
      showAddDialog = next.showAddDialog;
      formData = next.formData;
    };

    apply(true);
    formData = {
      ...formData,
      name: 'QA_P0C_ADV_STALE',
      salary_period: '2099-99',
    };
    expect(showAddDialog).toBe(true);

    apply(false);
    expect(showAddDialog).toBe(false);
    expect(formData.name).toBe('');

    apply(true);
    expect(showAddDialog).toBe(true);
    expect(formData.name).toBe('');
    expect(formData.salary_period).toBe('Tháng 7/2026');
  });
});
