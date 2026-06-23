import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { groupedLayout } from '../../../theme/groupedLayout';

const SRC = path.resolve(__dirname, '../../..');

function readSrc(relativePath: string): string {
  return fs.readFileSync(path.join(SRC, relativePath), 'utf8');
}

describe('MOB-UX-13d grouped spacing on leave + approvals', () => {
  it('LeaveRequestsListScreen uses groupedLayout + resolveScrollPaddingBottom', () => {
    const screen = readSrc('features/attendance/LeaveRequestsListScreen.tsx');
    expect(screen).toContain('groupedLayout');
    expect(screen).toContain('resolveScrollPaddingBottom');
    expect(screen).toContain('useBottomTabBarHeight');
    expect(screen).toContain('paddingBottom: tabBarHeight');
    expect(screen).toContain('groupedLayout.belowBalanceCards');
    expect(screen).toContain('groupedLayout.listSectionTop');
    expect(screen).toContain('groupedLayout.emptyVertical');
    expect(screen).not.toContain('paddingBottom: 120');
  });

  it('ManagerApprovalsScreen hides duplicate title when stack header present', () => {
    const screen = readSrc('features/attendance/ManagerApprovalsScreen.tsx');
    expect(screen).toContain('stackHeaderPresent');
    expect(screen).not.toContain('title="Duyệt đơn"');
    expect(screen).toContain('groupedLayout.belowSubtitle');
    expect(screen).toContain('groupedLayout.emptyVertical');
    expect(screen).toContain('compact');
  });

  it('AppScreenLayout supports stackHeaderPresent flag', () => {
    const layoutSrc = readSrc('components/ui/AppScreenLayout.tsx');
    expect(layoutSrc).toContain('stackHeaderPresent');
    expect(layoutSrc).toContain('showInlineTitle');
  });

  it('LeaveBalanceHeader respects belowStackHeader spacing', () => {
    const header = readSrc('components/ui/LeaveBalanceHeader.tsx');
    expect(header).toContain('groupedLayout.belowStackHeader');
    expect(header).toContain('groupedLayout.belowBalanceCards');
  });

  it('groupedLayout constants match sponsor 12/16/24pt spec', () => {
    expect(groupedLayout.belowStackHeader).toBe(16);
    expect(groupedLayout.belowBalanceCards).toBe(12);
    expect(groupedLayout.listSectionTop).toBe(16);
    expect(groupedLayout.belowSubtitle).toBe(12);
    expect(groupedLayout.emptyVertical).toBe(24);
  });
});
