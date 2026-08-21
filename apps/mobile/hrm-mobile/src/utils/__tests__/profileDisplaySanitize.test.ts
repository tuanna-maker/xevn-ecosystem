import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { sanitizeProfileDisplay } from '../profileDisplaySanitize';

const utilsDir = join(dirname(fileURLToPath(import.meta.url)), '..');

function sourceOf(name: string): string {
  return readFileSync(join(utilsDir, name), 'utf8');
}

describe('sanitizeProfileDisplay', () => {
  it('masks seed / UUID / HRM wire codes', () => {
    expect(sanitizeProfileDisplay('seed:p1-hrm-emp-001')).toBe('Dữ liệu mẫu UAT');
    expect(sanitizeProfileDisplay('6c887177-0000-4000-8000-000000000001')).toBe('—');
    expect(sanitizeProfileDisplay('HRM-EMP-200')).toBe('—');
    expect(sanitizeProfileDisplay('Phòng Kỹ thuật')).toBe('Phòng Kỹ thuật');
  });
});

describe('D-MOB-DIR-TOAST-01 require-cycle hygiene', () => {
  it('teamDirectory does not import teamDirectoryDetail (breaks list↔detail cycle)', () => {
    const src = sourceOf('teamDirectory.ts');
    expect(src).not.toMatch(/from ['"]\.\/teamDirectoryDetail['"]/);
    expect(src).toContain('export function resolveColleagueHeroSubtitle');
  });

  it('teamDirectoryDetail imports hero subtitle from teamDirectory only', () => {
    const src = sourceOf('teamDirectoryDetail.ts');
    expect(src).toMatch(/resolveColleagueHeroSubtitle[\s\S]*from ['"]\.\/teamDirectory['"]/);
    expect(src).not.toMatch(/export function resolveColleagueHeroSubtitle/);
  });

  it('profileEssFields does not import profileTabs (breaks tabs↔ess cycle)', () => {
    const src = sourceOf('profileEssFields.ts');
    expect(src).not.toMatch(/from ['"]\.\/profileTabs['"]/);
    expect(src).toMatch(/from ['"]\.\/profileDisplaySanitize['"]/);
  });
});
