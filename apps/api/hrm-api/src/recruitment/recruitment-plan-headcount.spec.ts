/**
 * PO-HRM-MVP-GD1-REC-01-CLUSTER-BE-01 — headcount cell normalize + DENY dual ns/dx.
 */
import { ApiException } from '../common/api.exception';
import {
  assertNoLegacyDualSotWriters,
  firstOfMonthIso,
  HRM_HC_LEGACY_DUAL,
  lockNeedHireCells,
  normalizeHeadcountCell,
  normalizeMonthsData,
} from './recruitment-plan-headcount';

describe('recruitment-plan-headcount (O1 normalize)', () => {
  it('O1: dx → need_hire · ns → headcount_current · mint cell_id', () => {
    const cell = normalizeHeadcountCell({ ns: 5, dx: 2, month: 3 }, 3);
    expect(cell.headcount_need_hire).toBe(2);
    expect(cell.need_hire).toBe(2);
    expect(cell.headcount_current).toBe(5);
    expect(cell.cell_status).toBe('need_hire');
    expect(cell.lifecycle_status).toBe('open');
    expect(cell.cell_id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  it('O1: plan approved + need_hire → lifecycle need_hire_approved', () => {
    const cell = normalizeHeadcountCell({ need_hire: 3, month: 1 }, 1, { planApproved: true });
    expect(cell.lifecycle_status).toBe('need_hire_approved');
  });

  it('DENY dual ns+dx SoT writers (HRM-HC-LEGACY-DUAL)', () => {
    expect(() => assertNoLegacyDualSotWriters([{ ns: 1, dx: 2 }])).toThrow(ApiException);
    try {
      assertNoLegacyDualSotWriters({ departments: [{ positions: [{ months: [{ ns: 1, dx: 1 }] }] }] });
    } catch (e) {
      expect(e).toBeInstanceOf(ApiException);
      expect((e as ApiException).getResponse()).toEqual(
        expect.objectContaining({ code: HRM_HC_LEGACY_DUAL }),
      );
    }
  });

  it('VAL: need_hire status with qty < 1 → HRM-HC-VAL-400', () => {
    expect(() =>
      normalizeMonthsData([{ month: 1, cell_status: 'need_hire', need_hire: 0 }], {
        requireTwelve: false,
      }),
    ).toThrow(ApiException);
  });

  it('lockNeedHireCells sets lifecycle on need_hire cells', () => {
    const locked = lockNeedHireCells([
      normalizeHeadcountCell({ need_hire: 2, month: 1 }, 1),
      normalizeHeadcountCell({ headcount_current: 4, month: 2 }, 2),
    ]);
    expect(locked[0].lifecycle_status).toBe('need_hire_approved');
    expect(locked[1].lifecycle_status).toBe('open');
  });

  it('firstOfMonthIso aligns REC-01 spawn with YYYY-MM-01 (R-REC-02-TARGET-MONTH)', () => {
    expect(firstOfMonthIso(2026, 9)).toBe('2026-09-01');
    expect(firstOfMonthIso(2026, 1)).toBe('2026-01-01');
  });
});
