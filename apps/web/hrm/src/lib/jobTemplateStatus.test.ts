/**
 * @CODE-MEMORY
 * Screen:     Vitest — JD library status helpers (UC-BP-REC-00 O2)
 * WorkItem:   PO-HRM-MVP-GD1-REC-00-CLUSTER-FE-01
 */
import { describe, expect, it } from 'vitest';
import {
  filterJdTemplatesByStatus,
  isJdTemplateDraft,
  jdTemplateStatusLabelVi,
  resolveJdTemplateStatus,
} from './jobTemplateStatus';

describe('jobTemplateStatus — O2 display-ready chips', () => {
  it('prefers DTO status over is_active bridge', () => {
    expect(resolveJdTemplateStatus({ status: 'draft', is_active: true })).toBe('draft');
    expect(resolveJdTemplateStatus({ status: 'active', is_active: false })).toBe('active');
    expect(resolveJdTemplateStatus({ status: 'retired', is_active: true })).toBe('retired');
  });

  it('bridges is_active when status absent (migrate dual-assert)', () => {
    expect(resolveJdTemplateStatus({ is_active: true })).toBe('active');
    expect(resolveJdTemplateStatus({ is_active: false })).toBe('draft');
    expect(resolveJdTemplateStatus({})).toBe('draft');
  });

  it('maps VI labels Nháp / Hiệu lực / Ngừng (EX-12 distinct)', () => {
    expect(jdTemplateStatusLabelVi('draft')).toBe('Nháp');
    expect(jdTemplateStatusLabelVi('active')).toBe('Hiệu lực');
    expect(jdTemplateStatusLabelVi('retired')).toBe('Ngừng');
    expect(jdTemplateStatusLabelVi('draft')).not.toBe(jdTemplateStatusLabelVi('retired'));
  });

  it('filters library rows by status', () => {
    const rows = [
      { id: '1', status: 'draft' as const },
      { id: '2', status: 'active' as const },
      { id: '3', status: 'retired' as const },
    ];
    expect(filterJdTemplatesByStatus(rows, 'active').map((r) => r.id)).toEqual(['2']);
    expect(filterJdTemplatesByStatus(rows, 'all')).toHaveLength(3);
    expect(isJdTemplateDraft(rows[0])).toBe(true);
  });
});
