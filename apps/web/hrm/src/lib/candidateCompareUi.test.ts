import { describe, expect, it } from 'vitest';
import {
  REC_COMPARE_MAX_N,
  buildCompareApplicationsFromEvaluations,
  buildCompareCriteriaTableRows,
  buildCompareYctdPickerFromCandidates,
  buildCompareYctdPickerFromEvaluations,
  buildRadarFromCompareMatrix,
  compareMatrixHasScoredData,
  canAddCandidateToCompare,
  compareEvalBadgeLabel,
  dedupeCompareCandidatesById,
  formatCompareCandidateSubtitle,
  isCompareEvalMissing,
  mapApplicationItemToCompareCandidate,
  mergeCompareMatrixIntoCandidates,
  normalizeCompareListRows,
  resolveCompareMatrixCandidateIds,
  resolveCompareSpineCandidateId,
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

  it('prefers recruitment_candidate_id (Lane A spine) over pool candidate_id for compare', () => {
    const mapped = mapApplicationItemToCompareCandidate({
      candidate_id: 'pool-legacy',
      recruitment_candidate_id: 'spine-uuid',
      full_name: 'UV A',
      eval_status: 'none',
    });
    expect(mapped.id).toBe('spine-uuid');
  });

  it('maps FE score shape criterion_name/actual_score without inventing fake scores', () => {
    const mapped = mapApplicationItemToCompareCandidate({
      candidate_id: 'c1',
      full_name: 'Nguyễn Văn A',
      eval_status: 'scored',
      weighted_score: 4.2,
      scores: [{ criterion_name: 'Giao tiếp', actual_score: 4 }],
    });
    expect(mapped.evaluation?.scores[0]?.criterion_name).toBe('Giao tiếp');
    expect(mapped.evaluation?.scores[0]?.actual_score).toBe(4);
    expect(mapped.evaluation?.weighted_score).toBe(4.2);
  });

  it('merges matrix rows into cards when list eval was missing', () => {
    const base = mapApplicationItemToCompareCandidate({
      candidate_id: 'c1',
      full_name: 'A',
      eval_status: 'none',
    });
    const merged = mergeCompareMatrixIntoCandidates([base], {
      requisition_id: 'y1',
      criteria: [{ name: 'Giao tiếp' }],
      rows: [
        {
          candidate_id: 'c1',
          full_name: 'A',
          eval_status: 'scored',
          weighted_score: 3.5,
          scores: { 'Giao tiếp': 3 },
        },
      ],
    });
    expect(merged[0].evaluation?.weighted_score).toBe(3.5);
    expect(merged[0].evaluation?.scores[0]?.actual_score).toBe(3);
  });

  it('builds radar from BE matrix criteria only', () => {
    const matrix = {
      requisition_id: 'y1',
      criteria: [{ name: 'Giao tiếp' }, { name: 'Chuyên môn' }],
      rows: [
        { candidate_id: 'c1', full_name: 'A', scores: { 'Giao tiếp': 4, 'Chuyên môn': 3 } },
        { candidate_id: 'c2', full_name: 'B', scores: { 'Giao tiếp': 2, 'Chuyên môn': null } },
      ],
    };
    expect(compareMatrixHasScoredData(matrix, ['c1', 'c2'])).toBe(true);
    const radar = buildRadarFromCompareMatrix(matrix, ['c1', 'c2']);
    expect(radar).toHaveLength(2);
    expect(radar[0].candidate0).toBe(4);
    expect(radar[1].candidate1).toBe(0);
  });

  it('returns empty radar for template-only matrix (AC-REC-CMP-05 «chưa đánh giá»)', () => {
    const matrix = {
      requisition_id: 'y1',
      criteria: [{ id: 'tpl-1', name: 'Giao tiếp' }],
      rows: [
        {
          candidate_id: 'c1',
          full_name: 'A',
          eval_status: 'none',
          scores: { 'Giao tiếp': null, 'tpl-1': null },
        },
        {
          candidate_id: 'c2',
          full_name: 'B',
          eval_status: 'none',
          scores: { 'Giao tiếp': null, 'tpl-1': null },
        },
      ],
    };
    expect(compareMatrixHasScoredData(matrix, ['c1', 'c2'])).toBe(false);
    expect(buildRadarFromCompareMatrix(matrix, ['c1', 'c2'])).toEqual([]);
    const table = buildCompareCriteriaTableRows(matrix, ['c1', 'c2']);
    expect(table).toHaveLength(1);
    expect(table[0].candidate0).toBeNull();
    expect(table[0].candidate1).toBeNull();
  });

  it('builds radar series index aligned to selectedCandidateIds order', () => {
    const radar = buildRadarFromCompareMatrix(
      {
        requisition_id: 'y1',
        criteria: [{ name: 'Giao tiếp' }],
        rows: [
          { candidate_id: 'c2', full_name: 'B', scores: { 'Giao tiếp': 2 } },
          { candidate_id: 'c1', full_name: 'A', scores: { 'Giao tiếp': 5 } },
        ],
      },
      ['c1', 'c2'],
    );
    expect(radar[0].candidate0).toBe(5);
    expect(radar[0].candidate1).toBe(2);
  });

  it('formats UV subtitle with email + stage for same-name disambiguation', () => {
    expect(
      formatCompareCandidateSubtitle({
        email: 'a@xe.vn',
        stage: 'interview',
        position: 'NV',
      }),
    ).toBe('a@xe.vn · interview');
  });

  it('dedupes compare candidates by id', () => {
    expect(
      dedupeCompareCandidatesById([
        { id: 'c1', full_name: 'A' },
        { id: 'c1', full_name: 'dup' },
        { id: 'c2', full_name: 'B' },
      ]),
    ).toEqual([
      { id: 'c1', full_name: 'A' },
      { id: 'c2', full_name: 'B' },
    ]);
  });

  it('builds YCTD picker + UV list from evaluations when requisitions list empty', () => {
    const evalRows = [
      {
        requisition_id: 'req-1',
        recruitment_candidate_id: 'uv-1',
        yctd_title: 'Tuyển lái xe',
        yctd_company_id: 'main',
        candidate_name: 'Nguyễn Văn A',
        candidate_email: 'a@xe.vn',
        weighted_score: 4.5,
        created_at: '2026-08-22T10:00:00.000Z',
      },
      {
        requisition_id: 'req-1',
        recruitment_candidate_id: 'uv-2',
        yctd_title: 'Tuyển lái xe',
        candidate_name: 'Trần B',
        created_at: '2026-08-22T09:00:00.000Z',
      },
    ];
    const picker = buildCompareYctdPickerFromEvaluations(evalRows);
    expect(picker).toHaveLength(1);
    expect(picker[0].id).toBe('req-1');
    expect(picker[0].candidate_count).toBe(2);
    const apps = buildCompareApplicationsFromEvaluations(evalRows, 'req-1');
    expect(apps).toHaveLength(2);
    expect(apps[0].full_name).toBe('Nguyễn Văn A');
  });

  it('skips eval fallback rows without recruitment_candidate_id (pool-only neo)', () => {
    const apps = buildCompareApplicationsFromEvaluations(
      [
        {
          requisition_id: 'req-1',
          candidate_id: 'pool-only-id',
          candidate_name: 'Pool UV',
        },
        {
          requisition_id: 'req-1',
          recruitment_candidate_id: 'uv-spine',
          candidate_name: 'Spine UV',
        },
      ],
      'req-1',
    );
    expect(apps).toHaveLength(1);
    expect(apps[0].candidate_id).toBe('uv-spine');
  });

  it('resolveCompareMatrixCandidateIds maps aliases to Lane A spine ids', () => {
    expect(
      resolveCompareMatrixCandidateIds(
        [
          { id: 'spine-1', application_id: 'app-1' },
          { id: 'spine-2', application_id: 'spine-2' },
        ],
        ['app-1', 'spine-2'],
      ),
    ).toEqual(['spine-1', 'spine-2']);
  });

  it('resolveCompareSpineCandidateId prefers recruitment_candidate_id', () => {
    expect(
      resolveCompareSpineCandidateId({
        candidate_id: 'pool-1',
        recruitment_candidate_id: 'spine-1',
      }),
    ).toBe('spine-1');
  });

  it('builds YCTD picker from spine candidates grouped by requisition_id', () => {
    const picker = buildCompareYctdPickerFromCandidates([
      {
        requisition_id: 'req-a',
        company_id: 'main',
        yctd_title: 'Tuyển lái xe',
        status: 'interview',
      },
      {
        requisition_id: 'req-a',
        company_id: 'main',
        yctd_title: 'Tuyển lái xe',
        status: 'screening',
      },
    ]);
    expect(picker).toHaveLength(1);
    expect(picker[0].candidate_count).toBe(2);
  });
});
