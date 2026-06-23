import { ORG_GRADE_LEVELS } from '../data/org-grade-reference';

export type GradeTitleLayout = Partial<Record<number, string[]>>;

export function normalizeGradeTitleLayout(raw: unknown): GradeTitleLayout {
  if (!raw || typeof raw !== 'object') return {};
  const out: GradeTitleLayout = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    const level = Number(k);
    if (!Number.isFinite(level) || !Array.isArray(v)) continue;
    const titles = v.map((x) => String(x).trim()).filter(Boolean);
    if (titles.length) out[level] = titles;
  }
  return out;
}

export function defaultTitlesForLevel(level: number): string[] {
  const ref = ORG_GRADE_LEVELS.find((r) => r.level === level);
  return ref?.titles?.length ? [...ref.titles] : [];
}

export function resolveLevelTitles(level: number, layout: GradeTitleLayout): string[] {
  const custom = layout[level];
  if (custom?.length) return [...custom];
  return defaultTitlesForLevel(level);
}

export function buildLayoutForEnabledLevels(
  enabledLevels: number[],
  saved?: GradeTitleLayout,
): GradeTitleLayout {
  const out: GradeTitleLayout = {};
  for (const level of enabledLevels) {
    out[level] = resolveLevelTitles(level, saved ?? {});
  }
  return out;
}

export function moveGradeTitle(
  layout: GradeTitleLayout,
  fromLevel: number,
  fromIndex: number,
  toLevel: number,
  toIndex: number,
): GradeTitleLayout {
  const from = [...(layout[fromLevel] ?? [])];
  const to = fromLevel === toLevel ? from : [...(layout[toLevel] ?? [])];
  if (fromIndex < 0 || fromIndex >= from.length) return layout;
  const [moved] = from.splice(fromIndex, 1);
  if (!moved) return layout;
  const insertAt = Math.max(0, Math.min(toIndex, to.length));
  to.splice(insertAt, 0, moved);
  if (fromLevel === toLevel) {
    return { ...layout, [fromLevel]: to };
  }
  return {
    ...layout,
    [fromLevel]: from,
    [toLevel]: to,
  };
}

export function addGradeTitle(layout: GradeTitleLayout, level: number, title: string): GradeTitleLayout {
  const trimmed = title.trim();
  if (!trimmed) return layout;
  const list = [...(layout[level] ?? resolveLevelTitles(level, layout))];
  list.push(trimmed);
  return { ...layout, [level]: list };
}

export function removeGradeTitle(layout: GradeTitleLayout, level: number, index: number): GradeTitleLayout {
  const list = [...(layout[level] ?? [])];
  if (index < 0 || index >= list.length) return layout;
  list.splice(index, 1);
  return { ...layout, [level]: list };
}
