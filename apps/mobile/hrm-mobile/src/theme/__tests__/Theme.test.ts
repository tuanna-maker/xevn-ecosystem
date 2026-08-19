import { describe, expect, it } from 'vitest';

import { ThemeProvider, useTheme, tokens as themeExport } from '../Theme';
import { colors, tokens, typography } from '../tokens';

describe('ThemeProvider / Theme barrel', () => {
  it('re-exports SoT tokens with sharp contrast locks', () => {
    expect(themeExport).toBe(tokens);
    expect(typeof ThemeProvider).toBe('function');
    expect(typeof useTheme).toBe('function');
    expect(colors.text).toBe('#111827');
    expect(colors.textSecondary).toBe('#4B5563');
    expect(colors.textMuted).toBe('#6B7280');
    expect(typography.fontSize.body).toBeGreaterThanOrEqual(17);
  });
});
