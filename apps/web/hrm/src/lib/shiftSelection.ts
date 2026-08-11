/**
 * Pure helpers for Shifts list multi-select (UX-09 bulk toolbar).
 * Keep UI logic out of Attendance.tsx where possible for unit coverage.
 */

export function toggleIdInSelection(selected: string[], id: string): string[] {
  return selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id];
}

/** Select all visible ids, or clear when already fully selected. */
export function selectAllOrClear(selected: string[], visibleIds: string[]): string[] {
  if (visibleIds.length === 0) return selected;
  const allSelected = visibleIds.every((id) => selected.includes(id));
  if (allSelected) {
    return selected.filter((id) => !visibleIds.includes(id));
  }
  const set = new Set(selected);
  for (const id of visibleIds) set.add(id);
  return Array.from(set);
}

export function isAllVisibleSelected(selected: string[], visibleIds: string[]): boolean {
  return visibleIds.length > 0 && visibleIds.every((id) => selected.includes(id));
}
