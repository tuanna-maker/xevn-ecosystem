import { describe, expect, it } from 'vitest';
import {
  REC_COMPARE_MAX_N,
  buildRadarFromCompareMatrix,
  canAddCandidateToCompare,
  compareEvalBadgeLabel,
  isCompareEvalMissing,
  mapApplicationItemToCompareCandidate,
  normalizeCompareListRows,
} from './candidateCompareUi';

describe('candidateCompareUi (PO-HRM-REC-UV-YCTD-CMP-FE-01)', () => {
  it('locks default max-N at 4 (AC-REC-CMP-04)', () => {
    expect(REC_COMPARE_MAX_N).toBe(4);
    expect(canAddCandidateToCompare(3)).toBe(true);
    expect(canAddCandidateToCompare(4)).toBe(false);
  });

  it('treats eval_status none as «chưa đánh giá» (AC-REC-CMP-05)', () => {
    expect(isCompareEvalMissing('none')).toBe(true);
    expect(isCompareEvalMissing(null)).toBe(true);
    expect(isCompareEvalMissing('complete')).toBe(false);
    expect(compareEvalBadgeLabel('none', 'Chưa đánh giá')).toBe('Chưa đánh giá');
  });

  it('normalizes data|items|array envelopes (empty 200[])', () => {
    expect(normalizeCompareListRows([])).toEqual([]);
    expect(normalizeCompareListRows({ items: [{ id: 'a' }] })).toEqual([{ id: 'a' }]);
    expect(normalizeCompareListRows({ data: [{ id: 'b' }] })).toEqual([{ id: 'b' }]);
  });

  it('maps application row without inventing fake scores', () => {
    const mapped = mapApplicationItemToCompareCandidate({
      candidate_id: 'c1',
      full_name: 'Nguyễn Văn A',
      eval_status: 'none',
    });
    expect(mapped.evaluation).toBeNull();
    expect(mapped.eval_status).toBe('none');
  });

  it('builds radar from BE matrix criteria only', () => {
    const radar = buildRadarFromCompareMatrix(
      {
        requisition_id: 'y1',
        criteria: [{ name: 'Giao tiếp' }, { name: 'Chuyên môn' }],
        rows: [
          { candidate_id: 'c1', full_name: 'A', scores: { 'Giao tiếp': 4, 'Chuyên môn': 3 } },
          { candidate_id: 'c2', full_name: 'B', scores: { 'Giao tiếp': 2, 'Chuyên môn': null } },
        ],
      },
      ['c1', 'c2'],
    );
    expect(radar).toHaveLength(2);
    expect(radar[0].candidate0).toBe(4);
    expect(radar[1].candidate1).toBe(0);
  });
});
