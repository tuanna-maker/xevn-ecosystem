/**
 * PO-HRM-MVP-GD1-REC-01-CLUSTER-FE-01 — headcount cell normalize (O1 · VAL-REC-HC-15)
 */
import { describe, expect, it } from 'vitest';
import {
  bodyHasLegacyDualEditors,
  countOverHeadcountCells,
  detectQtyDrift,
  emptyHeadcountYear,
  formatSpawnFeedback,
  parseMonthsData,
  serializeMonthsForApi,
  withNeedHireAt,
} from './recruitmentPlanHeadcount';

describe('recruitmentPlanHeadcount O1', () => {
  it('maps legacy ns/dx → headcount_current + need_hire', () => {
    const cells = parseMonthsData([{ ns: 3, dx: 2 }, { ns: 0, dx: 0 }]);
    expect(cells).toHaveLength(12);
    expect(cells[0]).toMatchObject({
      month: 1,
      headcount_current: 3,
      need_hire: 2,
      cell_status: 'need_hire',
    });
    expect(cells[1]).toMatchObject({
      month: 2,
      headcount_current: 0,
      need_hire: 0,
      cell_status: 'current',
    });
  });

  it('prefers canonical need_hire over legacy dx', () => {
    const cells = parseMonthsData([
      { month: 3, need_hire: 5, headcount_current: 1, ns: 9, dx: 9 },
    ]);
    expect(cells[2]).toMatchObject({
      month: 3,
      need_hire: 5,
      headcount_current: 1,
      cell_status: 'need_hire',
    });
  });

  it('serializeMonthsForApi never emits ns/dx dual SoT', () => {
    const months = withNeedHireAt(emptyHeadcountYear(), 2, 4);
    const wire = serializeMonthsForApi(months);
    expect(wire).toHaveLength(12);
    expect(wire[2]).toMatchObject({
      month: 3,
      need_hire: 4,
      cell_status: 'need_hire',
    });
    for (const cell of wire) {
      expect(cell).not.toHaveProperty('ns');
      expect(cell).not.toHaveProperty('dx');
    }
  });

  it('detects legacy dual editors in write body', () => {
    expect(
      bodyHasLegacyDualEditors({
        departments: [{ positions: [{ months: [{ ns: 1, dx: 2 }] }] }],
      }),
    ).toBe(true);
    expect(
      bodyHasLegacyDualEditors({
        departments: [
          {
            department_key: 'SALES',
            positions: [{ position_key: 'NVKD', months: serializeMonthsForApi(emptyHeadcountYear()) }],
          },
        ],
      }),
    ).toBe(false);
  });

  it('formatSpawnFeedback covers created + skipped idempotent', () => {
    const skip = formatSpawnFeedback({
      created: [],
      skipped_duplicate: [{ headcount_cell_id: 'c1', existing_requisition_id: 'r1' }],
    });
    expect(skip.title).toMatch(/trùng/i);
    expect(skip.description).toMatch(/1/);

    const ok = formatSpawnFeedback({
      created: [{ requisition_id: 'r2', headcount_cell_id: 'c2', headcount: 2 }],
      skipped_duplicate: [],
    });
    expect(ok.title).toMatch(/YCTD/);
    expect(ok.description).toMatch(/tạo mới 1/);
  });

  it('detectQtyDrift flags locked cell SL change (O3)', () => {
    const baseline = emptyHeadcountYear();
    baseline[2] = {
      ...baseline[2],
      need_hire: 2,
      cell_status: 'need_hire',
      lifecycle_status: 'need_hire_approved',
      cell_id: 'c-m3',
    };
    const next = withNeedHireAt(baseline, 2, 5);
    const hits = detectQtyDrift(baseline, next);
    expect(hits).toHaveLength(1);
    expect(hits[0]).toMatchObject({ month: 3, from: 2, to: 5, cell_id: 'c-m3' });
    expect(detectQtyDrift(baseline, baseline)).toHaveLength(0);
  });

  it('countOverHeadcountCells warns when need_hire > headcount_current (O4)', () => {
    const months = emptyHeadcountYear();
    months[0] = {
      ...months[0],
      need_hire: 3,
      headcount_current: 1,
      cell_status: 'need_hire',
    };
    expect(countOverHeadcountCells([{ positions: [{ months }] }])).toBe(1);
    months[0] = { ...months[0], need_hire: 1, headcount_current: 1 };
    expect(countOverHeadcountCells([{ positions: [{ months }] }])).toBe(0);
  });
});
