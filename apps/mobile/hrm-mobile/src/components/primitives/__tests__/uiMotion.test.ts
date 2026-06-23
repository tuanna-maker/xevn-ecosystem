import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  UI_MOTION_HOME_SHIMMER_CARDS,
  UI_MOTION_LIST_SHIMMER_ROWS,
  UI_MOTION_PRESS_DURATION_MS,
  UI_MOTION_PRESS_SCALE,
} from '../uiMotion';

const srcRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

function readSrc(relativePath: string): string {
  return readFileSync(path.join(srcRoot, relativePath), 'utf8');
}

/** AC-UI-MOTION-01..02 — MOB-UX-11f global motion + skeleton contract */
describe('uiMotion — MOB-UX-11f AC-UI-MOTION', () => {
  it('AC-UI-MOTION-01: press scale 0.98 for 150ms', () => {
    expect(UI_MOTION_PRESS_SCALE).toBe(0.98);
    expect(UI_MOTION_PRESS_DURATION_MS).toBe(150);
  });

  it('AC-UI-MOTION-01: list skeleton defaults to 3 shimmer rows', () => {
    expect(UI_MOTION_LIST_SHIMMER_ROWS).toBe(3);
    expect(UI_MOTION_HOME_SHIMMER_CARDS).toBeGreaterThanOrEqual(2);
  });

  it('AC-UI-MOTION-02: PressableScale respects reduce motion via AccessibilityInfo', () => {
    const source = readSrc('components/primitives/PressableScale.tsx');
    expect(source).toContain('isReduceMotionEnabled');
    expect(source).toContain('reduceMotionChanged');
    expect(source).toContain('UI_MOTION_PRESS_SCALE');
  });

  it('FilterChipRow and SegmentedTabBar use PressableScale', () => {
    expect(readSrc('components/ui/FilterChipRow.tsx')).toContain('PressableScale');
    expect(readSrc('components/ui/SegmentedTabBar.tsx')).toContain('PressableScale');
  });

  it('key list screens wire ListShimmerPlaceholder or AttendanceHistoryShimmer', () => {
    const screens = [
      'features/dashboard/DashboardScreen.tsx',
      'features/attendance/LeaveRequestsListScreen.tsx',
      'features/payroll/PayslipListScreen.tsx',
      'features/team/TeamDirectoryScreen.tsx',
      'features/attendance/ManagerApprovalsScreen.tsx',
      'features/attendance/AttendanceHistoryScreen.tsx',
      'features/attendance/UpdateRequestsScreen.tsx',
      'features/contracts/ContractsScreen.tsx',
      'features/operations/OperationsScreen.tsx',
      'features/payroll/PayrollSummaryScreen.tsx', // under src/features
    ];
    for (const screen of screens) {
      const source = readSrc(screen);
      expect(
        source.includes('ListShimmerPlaceholder') ||
          source.includes('DashboardHomeShimmer') ||
          source.includes('AttendanceHistoryShimmer'),
      ).toBe(true);
    }
  });
});
