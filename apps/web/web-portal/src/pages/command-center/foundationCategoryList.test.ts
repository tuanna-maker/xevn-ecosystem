import { describe, expect, it } from 'vitest';
import type { InfrastructureFoundationCategory } from '../../data/infrastructure-foundation-catalog';
import {
  filterDisplayableFoundationCategories,
  isFoundationCategoryDisplayable,
  mergeFoundationCategoryIntoList,
  removeUnsavedFoundationDraft,
  resolveFoundationFieldsPreviewEntityId,
} from './foundationCategoryList';

const savedRow: InfrastructureFoundationCategory = {
  id: 'fcat-1',
  code: 'HT-01',
  nameVi: 'Danh mục logistics',
  appliesToCompanyIds: ['comp-001'],
};

const emptyDraft: InfrastructureFoundationCategory = {
  id: 'fcat-draft',
  code: '',
  nameVi: '',
  appliesToCompanyIds: [],
};

describe('foundationCategoryList', () => {
  it('isFoundationCategoryDisplayable rejects empty draft rows', () => {
    expect(isFoundationCategoryDisplayable(savedRow)).toBe(true);
    expect(isFoundationCategoryDisplayable(emptyDraft)).toBe(false);
  });

  it('filterDisplayableFoundationCategories hides unsaved drafts', () => {
    expect(filterDisplayableFoundationCategories([savedRow, emptyDraft])).toEqual([savedRow]);
  });

  it('mergeFoundationCategoryIntoList upserts by id', () => {
    const updated = { ...savedRow, nameVi: 'Đổi tên' };
    expect(mergeFoundationCategoryIntoList([savedRow], updated)).toEqual([updated]);
    expect(mergeFoundationCategoryIntoList([], savedRow)).toEqual([savedRow]);
  });

  it('removeUnsavedFoundationDraft drops only empty draft id', () => {
    expect(removeUnsavedFoundationDraft([savedRow, emptyDraft], emptyDraft.id)).toEqual([savedRow]);
    expect(removeUnsavedFoundationDraft([savedRow], savedRow.id)).toEqual([savedRow]);
  });

  it('resolveFoundationFieldsPreviewEntityId prefers valid current', () => {
    expect(resolveFoundationFieldsPreviewEntityId(['a', 'b'], 'b')).toBe('b');
    expect(resolveFoundationFieldsPreviewEntityId(['a', 'b'], 'z')).toBe('a');
    expect(resolveFoundationFieldsPreviewEntityId([], 'a')).toBe(null);
  });

  it('resolveFoundationFieldsPreviewEntityId matches holding aliases (AC-INF-KEY-05)', () => {
    expect(
      resolveFoundationFieldsPreviewEntityId(['main'], 'xbos-group-holding-root'),
    ).toBe('xbos-group-holding-root');
    expect(
      resolveFoundationFieldsPreviewEntityId(['holding', 'eb3fb3fc-0081-446b-8d99-2b398dddc709'], 'xbos-group-holding-root'),
    ).toBe('xbos-group-holding-root');
  });
});