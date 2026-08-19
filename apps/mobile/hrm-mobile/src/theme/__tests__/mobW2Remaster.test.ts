/**
 * XEVN-THM-MOB-W2 — remaster gate: no pale/AS-IS readable text hex in features/UI.
 * ADR-XEVN-THEME-SHARP-OPS-20260722 §4.1
 */
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { colors } from '../tokens';

const SRC_ROOT = path.resolve(__dirname, '../..');

const FORBIDDEN_ASSIGN = [
  /(?:backgroundColor|color|borderColor|placeholderTextColor)\s*[:=]\s*['"]#1F2937['"]/i,
  /(?:backgroundColor|color|borderColor|placeholderTextColor)\s*[:=]\s*['"]#9CA3AF['"]/i,
  /(?:color|placeholderTextColor)\s*[:=]\s*['"]#6B7280['"]/i,
];

function walkTsx(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '__tests__' || entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkTsx(full, out);
    else if (/\.(tsx|ts)$/.test(entry.name) && !entry.name.endsWith('.test.ts')) out.push(full);
  }
  return out;
}

describe('XEVN-THM-MOB-W2 remaster gate', () => {
  it('UndoSnackbar uses colors.text inverse chrome (not AS-IS Gray-800)', () => {
    expect(colors.text).toBe('#111827');
    const src = fs.readFileSync(
      path.join(SRC_ROOT, 'components/ui/UndoSnackbar.tsx'),
      'utf8',
    );
    expect(src).toMatch(/backgroundColor:\s*colors\.text/);
    expect(src).not.toMatch(/backgroundColor:\s*['"]#1F2937['"]/);
    expect(src).toMatch(/color:\s*colors\.primaryDisabled/);
    expect(src).toMatch(/minHeight:\s*44/);
  });

  it('features + components ban pale/AS-IS hex assignments for text chrome', () => {
    const files = [
      ...walkTsx(path.join(SRC_ROOT, 'features')),
      ...walkTsx(path.join(SRC_ROOT, 'components')),
      path.join(SRC_ROOT, 'navigation/fabPrimaryActions.ts'),
      path.join(SRC_ROOT, 'i18n/leaveTypes.ts'),
    ].filter((f) => fs.existsSync(f));

    const violations: string[] = [];
    for (const file of files) {
      const raw = fs.readFileSync(file, 'utf8');
      const code = raw
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/^\s*\/\/.*$/gm, '');
      for (const re of FORBIDDEN_ASSIGN) {
        if (re.test(code)) {
          violations.push(`${path.relative(SRC_ROOT, file)} ~ ${re}`);
        }
      }
    }
    expect(violations).toEqual([]);
  });

  it('ADR sharp text tokens remain locked', () => {
    expect(colors.text).toBe('#111827');
    expect(colors.textSecondary).toBe('#4B5563');
    expect(colors.textMuted).toBe('#6B7280');
  });

  it('App root wires ThemeProvider', () => {
    const appSrc = fs.readFileSync(path.resolve(SRC_ROOT, '../App.tsx'), 'utf8');
    expect(appSrc).toMatch(/ThemeProvider/);
    expect(appSrc).toMatch(/from ['"]\.\/src\/theme\/Theme['"]/);
  });
});
