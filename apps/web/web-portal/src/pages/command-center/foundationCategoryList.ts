import type { InfrastructureFoundationCategory } from '../../data/infrastructure-foundation-catalog';

/** Row is eligible for the saved list table (no empty draft pollution). */
export function isFoundationCategoryDisplayable(row: InfrastructureFoundationCategory): boolean {
  return Boolean(row.code.trim() && row.nameVi.trim());
}

export function filterDisplayableFoundationCategories(
  rows: InfrastructureFoundationCategory[],
): InfrastructureFoundationCategory[] {
  return rows.filter(isFoundationCategoryDisplayable);
}

export function mergeFoundationCategoryIntoList(
  list: InfrastructureFoundationCategory[],
  form: InfrastructureFoundationCategory,
): InfrastructureFoundationCategory[] {
  const idx = list.findIndex((c) => c.id === form.id);
  if (idx < 0) return [...list, form];
  const next = list.slice();
  next[idx] = form;
  return next;
}

/** Drop empty draft row left in list by legacy «Thêm» (P0 list bug). */
export function removeUnsavedFoundationDraft(
  list: InfrastructureFoundationCategory[],
  draftId: string,
): InfrastructureFoundationCategory[] {
  const row = list.find((c) => c.id === draftId);
  if (!row || isFoundationCategoryDisplayable(row)) return list;
  return list.filter((c) => c.id !== draftId);
}

export function resolveFoundationFieldsPreviewEntityId(
  appliesToCompanyIds: string[],
  current: string | null,
): string | null {
  if (current && appliesToCompanyIds.includes(current)) return current;
  return appliesToCompanyIds[0] ?? null;
}
