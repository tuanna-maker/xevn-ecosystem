import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const SRC = path.resolve(__dirname, '../../..');

function readSrc(relativePath: string): string {
  return fs.readFileSync(path.join(SRC, relativePath), 'utf8');
}

describe('MOB-UX-12a employee detail UX (SET G-1)', () => {
  it('TeamColleagueDetailScreen uses hero, sections, shimmer — not flat DetailRow stack', () => {
    const screen = readSrc('features/team/TeamColleagueDetailScreen.tsx');
    expect(screen).toContain('EmployeeHeroCard');
    expect(screen).toContain('ProfileSectionCard');
    expect(screen).toContain('IconDetailRow');
    expect(screen).toContain('QuickActionRow');
    expect(screen).toContain('TeamColleagueDetailShimmer');
    expect(screen).toContain('Liên hệ');
    expect(screen).toContain('Công việc');
    expect(screen).toContain('Chấm công hôm nay');
    expect(screen).not.toContain("from '../../components/ui/DetailRow'");
    expect(screen).not.toContain("from '../../components/ui/SurfaceCard'");
  });

  it('EmployeeHeroCard uses LinearGradient hero band and shared avatar ring', () => {
    const hero = readSrc('components/ui/EmployeeHeroCard.tsx');
    expect(hero).toContain('expo-linear-gradient');
    expect(hero).toContain('LinearGradient');
    expect(hero).toContain('EmployeeAvatarRing');
    expect(hero).toContain('StatusBadge');
  });

  it('QuickActionRow uses PressableScale and tel/mailto handlers', () => {
    const quick = readSrc('components/ui/QuickActionRow.tsx');
    expect(quick).toContain('PressableScale');
    expect(quick).toContain('Linking.openURL');
    expect(quick).toContain('Gọi');
  });
});
