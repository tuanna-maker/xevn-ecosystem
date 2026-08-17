/**
 * @CODE-MEMORY
 * Screen:     /attendance — Shifts multi-select helpers
 * UC:         UX-09
 * Purpose:    Pure select-all / toggle helpers cho bulk toolbar ca làm.
 * WorkItem:   D-UX-C1-ATTENDANCE-FE-01 · W1-B-01-FE-LEAVE-ATTENDANCE-MOUNT
 * Coded:      2026-07-28
 * must_keep:  Pure functions; no API; Attendance import path stable
 *
 * @CODE-MEMORY-CHANGE 2026-08-03 W1-B-01-FE-LEAVE-ATTENDANCE-MOUNT
 * change_mode: FIX
 * What: Restore from git 43c479a (Attendance.tsx shiftSelection import chain)
 * Why: Transitive restore with ClockIn / LeaveOverview mount fix
 * must_keep: LeaveTab create/list untouched; U65 no seed
 */

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
