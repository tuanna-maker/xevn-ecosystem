/**
 * PO-HRM-CTR-WORKSPACE-FE-LAYOUT-BIND-01 — vitest
 */
import { describe, expect, it } from 'vitest';
import {
  clauseIdsFromLayout,
  clauseLayoutToLibraryRecords,
  formatContractPreviewSummaryVi,
} from './contractWorkspaceLayoutBind';

describe('PO-HRM-CTR-WORKSPACE-FE-LAYOUT-BIND-01', () => {
  const layout = [
    {
      id: 'cl-1',
      code: 'CLA-01',
      title_vi: 'Điều 1',
      body_vi: 'Nội dung điều 1',
      clause_group: 'general',
      mandatory: true,
      sort_order: 0,
    },
    {
      id: 'cl-2',
      code: 'CLA-02',
      title_vi: 'Điều 2',
      body_vi: 'Nội dung điều 2',
      clause_group: 'general',
      mandatory: false,
      sort_order: 1,
    },
  ];

  it('maps clause_layout to library records for read-only canvas', () => {
    const records = clauseLayoutToLibraryRecords(layout, 'co-main');
    expect(records).toHaveLength(2);
    expect(records[0].title_vi).toBe('Điều 1');
    expect(records[0].body_vi).toBe('Nội dung điều 1');
    expect(records[0].mandatory).toBe(true);
  });

  it('clauseIdsFromLayout preserves order and dedupes', () => {
    expect(clauseIdsFromLayout(layout)).toEqual(['cl-1', 'cl-2']);
    expect(clauseIdsFromLayout([layout[0], layout[0]])).toEqual(['cl-1']);
  });

  it('formatContractPreviewSummaryVi — VI missing hints', () => {
    const hint = formatContractPreviewSummaryVi({
      pack_code: 'GENERAL',
      template_code: 'HDLD',
      missing_fields: [{ field: 'work_location', message: 'bắt buộc' }],
      missing_clauses: [{ code: 'CLA-M', title_vi: 'Điều bắt buộc' }],
    });
    expect(hint).toContain('Thiếu thông tin');
    expect(hint).toContain('Thiếu điều khoản');
    expect(hint).toContain('Điều bắt buộc');
  });
});
