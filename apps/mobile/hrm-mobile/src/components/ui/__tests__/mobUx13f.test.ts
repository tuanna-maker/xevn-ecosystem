import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const SRC = path.resolve(__dirname, '../../..');

function readSrc(relativePath: string): string {
  return fs.readFileSync(path.join(SRC, relativePath), 'utf8');
}

describe('MOB-UX-13f swipe gestures', () => {
  it('SwipeableRow uses RNGH Swipeable + haptic on open', () => {
    const row = readSrc('components/ui/SwipeableRow.tsx');
    expect(row).toContain("from 'react-native-gesture-handler'");
    expect(row).toContain('Swipeable');
    expect(row).toContain('triggerSwipeOpenHaptic');
    expect(row).toContain('onSwipeableOpen');
  });

  it('ManagerApprovalsScreen defers SwipeableRow until focus (R4)', () => {
    const screen = readSrc('features/attendance/ManagerApprovalsScreen.tsx');
    expect(screen).toContain('useDeferredSwipeMount');
    expect(screen).toContain('manager-approvals-screen');
    expect(screen).toContain('GestureHandlerRootView');
  });

  it('ManagerApprovalsScreen wraps cards in SwipeableRow', () => {
    const screen = readSrc('features/attendance/ManagerApprovalsScreen.tsx');
    expect(screen).toContain('SwipeableRow');
    expect(screen).toContain('resolveManagerApprovalSwipeActions');
    expect(screen).toContain('handleManagerSwipeAction');
  });

  it('LeaveRequestsListScreen wraps rows in SwipeableRow', () => {
    const screen = readSrc('features/attendance/LeaveRequestsListScreen.tsx');
    expect(screen).toContain('SwipeableRow');
    expect(screen).toContain('resolveLeaveListSwipeActions');
    expect(screen).toContain('handleLeaveSwipeAction');
    expect(screen).toContain('tryCancelLeaveRequest');
  });

  it('hapticFeedback uses expo-haptics impact light', () => {
    const haptic = readSrc('utils/hapticFeedback.ts');
    expect(haptic).toContain('expo-haptics');
    expect(haptic).toContain('ImpactFeedbackStyle.Light');
  });
});
