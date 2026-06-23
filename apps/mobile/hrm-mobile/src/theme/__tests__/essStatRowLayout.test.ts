import { describe, expect, it } from 'vitest';
import { essStatRowLayout } from '../essStatRowLayout';
import { layout, spacing, typography } from '../tokens';

describe('essStatRowLayout — MOB-UX-14c Apple Settings stat row', () => {
  it('caps Home stat list at four rows', () => {
    expect(essStatRowLayout.maxRows).toBe(4);
  });

  it('maps label/value typography to 15pt subhead + body semibold (MOB-UX-16a)', () => {
    expect(essStatRowLayout.labelFontSize).toBe(typography.fontSize.subhead);
    expect(essStatRowLayout.labelFontSize).toBe(15);
    expect(essStatRowLayout.valueFontSize).toBe(typography.fontSize.body);
    expect(essStatRowLayout.valueFontSize).toBe(17);
  });

  it('uses compact 44pt row height and 12pt section gap below', () => {
    expect(essStatRowLayout.rowMinHeight).toBe(44);
    expect(essStatRowLayout.rowMinHeight).toBeLessThan(layout.listRowMinHeight);
    expect(essStatRowLayout.sectionGapBelow).toBe(layout.itemGap);
    expect(essStatRowLayout.sectionGapBelow).toBe(12);
  });

  it('aligns horizontal padding with screen inset tokens', () => {
    expect(essStatRowLayout.horizontalPadding).toBe(layout.screenPaddingH);
    expect(essStatRowLayout.rowPaddingVertical).toBe(spacing.xs);
  });
});
