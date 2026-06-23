import { describe, expect, it } from 'vitest';
import { buildLayoutForEnabledLevels, moveGradeTitle, normalizeGradeTitleLayout } from './orgGradeLayout';

describe('orgGradeLayout', () => {
  it('normalizes gradeTitleLayout from API JSON', () => {
    expect(normalizeGradeTitleLayout({ '2': ['CEO'], '3': [] })).toEqual({ 2: ['CEO'] });
  });

  it('builds defaults for enabled levels', () => {
    const layout = buildLayoutForEnabledLevels([1, 2]);
    expect(layout[1]?.length).toBeGreaterThan(0);
    expect(layout[2]?.length).toBeGreaterThan(0);
  });

  it('moves title across levels', () => {
    const base = { 2: ['A', 'B'], 3: ['C'] };
    const next = moveGradeTitle(base, 2, 0, 3, 1);
    expect(next[2]).toEqual(['B']);
    expect(next[3]).toEqual(['C', 'A']);
  });
});
