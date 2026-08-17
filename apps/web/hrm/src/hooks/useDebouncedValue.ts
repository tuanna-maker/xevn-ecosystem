import { useEffect, useState } from 'react';

/**
 * @CODE-MEMORY
 * Screen:     shared — debounce giá trị UI (search list)
 * UC:         UX-03
 * BR:         Debounce ≥300ms cho search list (recognition / error prevention)
 * SRS:        docs/program/UX-UI-ERP-ANALYSIS.md UX-03
 * TechSpec:   docs/program/UX-UI-ERP-PEER-DIVISION-PLAN.md C1
 * Purpose:    Hook debounce generic — Input cập nhật tức thì; giá trị lọc/API sau delayMs.
 * WorkItem:   D-UX-UX03-DEBOUNCE-01
 * Coded:      2026-07-28
 * must_keep:  delay mặc định 300; cleanup clearTimeout; không gọi API trong hook
 * SOLID:      Tách khỏi useEmployeePicker — dùng cho list search không phải picker
 *
 * @CODE-MEMORY-CHANGE 2026-08-03 W1-B-01-FE-LEAVE-ATTENDANCE-MOUNT
 * change_mode: FIX
 * What: Restore from git 43c479a — Attendance.tsx import after Leave/ClockIn restore
 * Why: Vite Failed to resolve @/hooks/useDebouncedValue (shifts search debounce)
 * must_keep: delay 300 default; LeaveTab create/list untouched; U65 no seed
 */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}
