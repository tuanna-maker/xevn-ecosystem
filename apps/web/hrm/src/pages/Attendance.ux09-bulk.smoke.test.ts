/**
 * Source smoke: UX-09 Shifts bulk toolbar wired in Attendance (no browser).
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const src = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'Attendance.tsx'), 'utf8');

describe('Attendance UX-09 shifts bulk (source smoke)', () => {
  it('wires selection helpers + bulk toolbar + confirm dialogs', () => {
    expect(src).toContain('D-UX-UX09-SHIFTS-BULK-01');
    expect(src).toContain('selectedShifts');
    expect(src).toContain('bulkDeleteShifts');
    expect(src).toContain('shifts-bulk-delete');
    expect(src).toContain('shiftsConfirmBulkDelete');
    expect(src).toContain('toggleSelectAllShifts');
    expect(src).toContain('shiftPendingDelete');
  });

  it('keeps UX-03 search debounce + Clock-In must_keep', () => {
    expect(src).toContain('debouncedShiftsSearch');
    expect(src).toContain('shiftsSearchQuery');
    expect(src).toContain('CLOCK_IN_ATTENDANCE_TYPE');
    expect(src).toContain('openClockInWizard');
  });
});
