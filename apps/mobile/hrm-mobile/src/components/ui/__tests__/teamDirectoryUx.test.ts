import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const SRC = path.resolve(__dirname, '../../..');

function readSrc(relativePath: string): string {
  return fs.readFileSync(path.join(SRC, relativePath), 'utf8');
}

describe('MOB-UX-12b team directory UX (SET G-2)', () => {
  it('TeamDirectoryScreen uses SectionList grouped by department', () => {
    const screen = readSrc('features/team/TeamDirectoryScreen.tsx');
    expect(screen).toContain('SectionList');
    expect(screen).toContain('groupTeamDirectoryByDepartment');
    expect(screen).toContain('renderSectionHeader');
    expect(screen).not.toContain('@shopify/flash-list');
  });

  it('TeamDirectoryRow uses avatar ring, dept strip, attendance dot, localized job title', () => {
    const row = readSrc('components/team/TeamDirectoryRow.tsx');
    expect(row).toContain('EmployeeAvatarRing');
    expect(row).toContain('showAttendanceDot');
    expect(row).toContain('deptColorStrip');
    expect(row).toContain('jobTitle');
    expect(row).toContain('PressableScale');
    expect(row).not.toContain('job_title_key');
  });

  it('EmployeeHeroCard reuses EmployeeAvatarRing primitive', () => {
    const hero = readSrc('components/ui/EmployeeHeroCard.tsx');
    expect(hero).toContain('EmployeeAvatarRing');
    expect(hero).toContain('expo-linear-gradient');
  });

  it('EmployeeAvatarRing exposes gradient ring and attendance dot', () => {
    const ring = readSrc('components/ui/EmployeeAvatarRing.tsx');
    expect(ring).toContain('LinearGradient');
    expect(ring).toContain('showAttendanceDot');
    expect(ring).toContain('attendanceCheckedIn');
  });
});
