import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { essStatRowLayout } from '../../../theme/essStatRowLayout';

const HOME_SRC = path.resolve(__dirname, '..');

function readHome(relativePath: string): string {
  return fs.readFileSync(path.join(HOME_SRC, relativePath), 'utf8');
}

describe('MOB-UX-14c — compact EssStatRow list on Home', () => {
  it('EssStatRow places label left and tabular-nums value right', () => {
    const row = readHome('EssStatRow.tsx');
    expect(row).toContain('flex: 1');
    expect(row).toContain("fontVariant: ['tabular-nums']");
    expect(row).toContain('textAlign: \'right\'');
    expect(row).toContain('essStatRowLayout.labelFontSize');
    expect(row).toContain('essStatRowLayout.valueFontSize');
  });

  it('DashboardStatCards renders grouped list with hairline separators', () => {
    const cards = readHome('DashboardStatCards.tsx');
    expect(cards).toContain('EssStatRow');
    expect(cards).toContain('essStatRowLayout.maxRows');
    expect(cards).toContain('showSeparator={index < rows.length - 1}');
    expect(cards).toContain('StyleSheet.hairlineWidth');
    expect(cards).not.toContain('flexWrap');
    expect(cards).not.toContain('width: \'48%\'');
    expect(cards).toContain('buildDefaultEssStatCards');
    expect(cards).not.toMatch(/if \(rows\.length === 0\)[\s\S]*return null/);
  });

  it('DashboardScreen still wires stat card press handlers', () => {
    const screen = fs.readFileSync(
      path.resolve(__dirname, '../../../features/dashboard/DashboardScreen.tsx'),
      'utf8',
    );
    expect(screen).toContain('DashboardStatCards');
    expect(screen).toContain('handleStatCardPress');
    expect(screen).toContain('essSnap.statCards');
  });

  it('layout constants match MOBILE_HOME_RESPONSIVE_PROGRAM stat row spec', () => {
    expect(essStatRowLayout.maxRows).toBe(4);
    expect(essStatRowLayout.labelFontSize).toBe(15);
    expect(essStatRowLayout.valueFontSize).toBe(17);
    expect(essStatRowLayout.sectionGapBelow).toBe(12);
  });
});
