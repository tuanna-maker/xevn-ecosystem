import { describe, expect, it } from 'vitest';
import { isAllVisibleSelected, selectAllOrClear, toggleIdInSelection } from './shiftSelection';

describe('shiftSelection (UX-09)', () => {
  it('toggles id in and out of selection', () => {
    expect(toggleIdInSelection([], 'a')).toEqual(['a']);
    expect(toggleIdInSelection(['a', 'b'], 'a')).toEqual(['b']);
    expect(toggleIdInSelection(['b'], 'a')).toEqual(['b', 'a']);
  });

  it('selectAllOrClear selects all visible then clears only those', () => {
    expect(selectAllOrClear([], ['a', 'b'])).toEqual(['a', 'b']);
    expect(selectAllOrClear(['a', 'b'], ['a', 'b'])).toEqual([]);
    expect(selectAllOrClear(['x'], ['a', 'b'])).toEqual(['x', 'a', 'b']);
    expect(selectAllOrClear(['x', 'a', 'b'], ['a', 'b'])).toEqual(['x']);
  });

  it('isAllVisibleSelected', () => {
    expect(isAllVisibleSelected(['a', 'b'], ['a', 'b'])).toBe(true);
    expect(isAllVisibleSelected(['a'], ['a', 'b'])).toBe(false);
    expect(isAllVisibleSelected([], [])).toBe(false);
  });
});
