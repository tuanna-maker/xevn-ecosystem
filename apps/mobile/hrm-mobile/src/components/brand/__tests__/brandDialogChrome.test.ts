import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const SRC = path.resolve(__dirname, '..');

function readComponent(): string {
  return fs.readFileSync(path.join(SRC, 'BrandDialogChrome.tsx'), 'utf8');
}

describe('BrandDialogChrome — W4-MOB-A MOB-01/05/04b', () => {
  it('uses 4px primary brand bar and wordmark testIDs (ADR §15.4)', () => {
    const src = readComponent();
    expect(src).toContain('brand.barWidth');
    expect(src).toContain("backgroundColor: colors.primary");
    expect(src).toContain("testID = 'brand-dialog-chrome'");
    expect(src).toContain('testID={testID}');
    expect(src).toContain('testID="brand-dialog-wordmark"');
    expect(src).toContain('XevnLogo');
  });

  it('title uses display typography floor title3 (≥20px token)', () => {
    const src = readComponent();
    expect(src).toContain('brandDisplayText');
    expect(src).toContain('typography.fontSize.title3');
    expect(src).toContain('minHeight: layout.touchTargetMin');
  });
});
