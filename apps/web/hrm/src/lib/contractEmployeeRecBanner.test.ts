import { describe, expect, it } from 'vitest';
import { shouldShowEmployeeRecruitmentBanner } from './contractEmployeeRecBanner';

describe('PO-HRM-CTR-WORKSPACE-G4-BR-CTR-CREATE-08-BANNER-FE-01', () => {
  const base = {
    isEdit: false,
    subjectType: 'employee' as const,
    employeeId: 'emp-1',
    selectedEmployee: { id: 'emp-1', candidate_id: null as string | null },
  };

  it('shows banner when NV selected and candidate_id is null (legacy NV)', () => {
    expect(shouldShowEmployeeRecruitmentBanner(base)).toBe(true);
  });

  it('shows banner when candidate_id is empty string', () => {
    expect(
      shouldShowEmployeeRecruitmentBanner({
        ...base,
        selectedEmployee: { id: 'emp-1', candidate_id: '' },
      }),
    ).toBe(true);
  });

  it('hides banner when NV has candidate_id trace', () => {
    expect(
      shouldShowEmployeeRecruitmentBanner({
        ...base,
        selectedEmployee: { id: 'emp-1', candidate_id: 'cand-uuid' },
      }),
    ).toBe(false);
  });

  it('hides banner on edit mode, UV tab, or no selection', () => {
    expect(shouldShowEmployeeRecruitmentBanner({ ...base, isEdit: true })).toBe(false);
    expect(
      shouldShowEmployeeRecruitmentBanner({ ...base, subjectType: 'candidate' }),
    ).toBe(false);
    expect(shouldShowEmployeeRecruitmentBanner({ ...base, employeeId: '' })).toBe(false);
    expect(
      shouldShowEmployeeRecruitmentBanner({ ...base, selectedEmployee: undefined }),
    ).toBe(false);
  });
});
