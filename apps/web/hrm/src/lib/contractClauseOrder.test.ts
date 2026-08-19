import { describe, expect, it } from 'vitest';
import {
  buildTemplateClauseBindPayload,
  clauseIdsFromTemplate,
  filterClausesForPack,
  parseTemplateLayoutJson,
  placeClauseOnCanvas,
  removeClauseFromCanvas,
  reorderByIndex,
} from './contractClauseOrder';

describe('contractClauseOrder (PO-HRM-CONTRACT-LEGAL-PRINT-FE-01)', () => {
  it('reorderByIndex moves item and keeps others', () => {
    expect(reorderByIndex(['a', 'b', 'c'], 0, 2)).toEqual(['b', 'c', 'a']);
    expect(reorderByIndex(['a', 'b', 'c'], 2, 0)).toEqual(['c', 'a', 'b']);
    expect(reorderByIndex(['a', 'b'], 0, 0)).toEqual(['a', 'b']);
    expect(reorderByIndex(['a'], 5, 0)).toEqual(['a']);
  });

  it('placeClauseOnCanvas inserts new and reorders existing', () => {
    expect(placeClauseOnCanvas(['a', 'b'], 'c', 1)).toEqual(['a', 'c', 'b']);
    expect(placeClauseOnCanvas(['a', 'b', 'c'], 'a', 2)).toEqual(['b', 'c', 'a']);
    expect(placeClauseOnCanvas([], 'x', 99)).toEqual(['x']);
    expect(placeClauseOnCanvas(['a'], '  ', 0)).toEqual(['a']);
  });

  it('removeClauseFromCanvas drops id', () => {
    expect(removeClauseFromCanvas(['a', 'b', 'a'], 'a')).toEqual(['b']);
  });

  it('buildTemplateClauseBindPayload mirrors layout_json.clause_ids for API bind', () => {
    const { layout_json, clause_ids } = buildTemplateClauseBindPayload([
      'uuid-a',
      '  ',
      'uuid-b',
    ]);
    expect(clause_ids).toEqual(['uuid-a', 'uuid-b']);
    expect(layout_json.clause_ids).toEqual(['uuid-a', 'uuid-b']);
    expect(layout_json.chrome?.show_quoc_hieu).toBe(true);
  });

  it('parseTemplateLayoutJson reads clause_ids safely', () => {
    expect(parseTemplateLayoutJson(null).clause_ids).toEqual([]);
    expect(parseTemplateLayoutJson({ clause_ids: ['x', 1, ''] }).clause_ids).toEqual(['x']);
    expect(parseTemplateLayoutJson({ clause_ids: ['z'], chrome: { show_quoc_hieu: true } }).chrome)
      .toEqual({ show_quoc_hieu: true });
  });

  it('clauseIdsFromTemplate prefers ordered clauses[] over layout_json (CORE-09d)', () => {
    expect(
      clauseIdsFromTemplate({
        clauses: [{ id: 'j1' }, { id: 'j2' }],
        layout_json: { clause_ids: ['legacy-a'] },
      }),
    ).toEqual(['j1', 'j2']);
    expect(
      clauseIdsFromTemplate({
        clauses: [],
        layout_json: { clause_ids: ['legacy-a', 'legacy-b'] },
      }),
    ).toEqual(['legacy-a', 'legacy-b']);
    expect(clauseIdsFromTemplate({})).toEqual([]);
  });

  it('filterClausesForPack respects * and pack + activeOnly', () => {
    const rows = [
      { id: '1', apply_to_packs: ['*'], status: 'active' },
      { id: '2', apply_to_packs: ['DRIVER'], status: 'active' },
      { id: '3', apply_to_packs: ['IT_OFFICE'], status: 'draft' },
      { id: '4', apply_to_packs: ['GENERAL'], status: 'active' },
    ];
    expect(filterClausesForPack(rows, 'DRIVER').map((r) => r.id)).toEqual(['1', '2']);
    expect(filterClausesForPack(rows, 'IT_OFFICE', { activeOnly: true }).map((r) => r.id)).toEqual([
      '1',
    ]);
  });
});
