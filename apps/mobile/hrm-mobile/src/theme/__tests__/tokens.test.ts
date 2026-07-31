import { describe, expect, it } from 'vitest';

import {
  borderWidth,
  colors,
  layout,
  radius,
  resolveStatusTone,
  spacing,
  textStyles,
  tokens,
  typography,
} from '../tokens';

/**
 * ADR-XEVN-THEME-SHARP-OPS-20260722 §4.1 (Accepted) — runtime token law.
 * Brand: docs/program/XEVN_BRAND_UIUX_PROPOSAL.md §3.1
 * L1m: MOB-XEVN-BRAND-TOKENS-L1-01
 */
const BRAND_CORE_TOKENS = {
  primary: '#1E40AF',
  accent: '#06B6D4',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
  neutral: '#6B7280',
  background: '#F9FAFB',
  surface: '#FFFFFF',
  text: '#111827',
  textSecondary: '#4B5563',
  textMuted: '#6B7280',
  border: '#E5E7EB',
} as const;

describe('design tokens — brand SoT / sharp contrast', () => {
  it('maps xevn color palette with contrast locks', () => {
    for (const [key, hex] of Object.entries(BRAND_CORE_TOKENS)) {
      expect(colors[key as keyof typeof BRAND_CORE_TOKENS]).toBe(hex);
    }
  });

  it('bans ADR AS-IS drift and pale AI gray for readable text', () => {
    expect(colors.text).not.toBe('#9CA3AF');
    expect(colors.textSecondary).not.toBe('#9CA3AF');
    // ADR §1 AS-IS — must not ship Gray-800 / Gray-500 as primary readable pair
    expect(colors.text).not.toBe('#1F2937');
    expect(colors.textSecondary).not.toBe('#6B7280');
    expect(colors.textMuted).toBe('#6B7280');
  });

  it('uses symmetrical grid radius for cards, inputs, and modals', () => {
    expect(radius.input).toBe(8);
    expect(radius.card).toBe(12);
    expect(radius.modal).toBe(12);
  });

  it('exports borderWidth for Modal/Card/Input L2 consumers', () => {
    expect(borderWidth.hairline).toBe(0.5);
    expect(borderWidth.thin).toBe(1);
    expect(borderWidth.focus).toBe(2);
    expect(tokens.borderWidth).toEqual(borderWidth);
  });

  it('uses 4px spacing scale base', () => {
    expect(spacing.xs).toBe(4);
    expect(spacing.md).toBe(16);
  });

  it('resolves status tones for badges', () => {
    expect(resolveStatusTone('pending')).toBe('pending');
    expect(resolveStatusTone('approved')).toBe('success');
    expect(resolveStatusTone('rejected')).toBe('danger');
  });

  it('exports splash glow from primary brand', () => {
    expect(colors.splashGlow).toBe('rgba(30, 64, 175, 0.18)');
    expect(colors.brandShell).toBe('#000000');
  });
});

describe('design tokens — MOBILE_XEVN_DESIGN_SYSTEM_DIRECTION §1–3 + L-TYPE', () => {
  it('uses iOS body ≥17pt and footnote 13pt', () => {
    expect(typography.fontSize.body).toBeGreaterThanOrEqual(17);
    expect(typography.fontSize.footnote).toBe(13);
    expect(typography.fontSize.base).toBe(17);
  });

  it('keeps titles clear (≥20 title3, title2 22)', () => {
    expect(typography.fontSize.title3).toBeGreaterThanOrEqual(20);
    expect(typography.fontSize.title2).toBe(22);
    expect(typography.fontSize.largeTitle).toBe(34);
  });

  it('defines layout ergonomics tokens', () => {
    expect(layout.screenPaddingH).toBe(16);
    expect(layout.listRowMinHeight).toBe(56);
    expect(layout.primaryButtonHeight).toBe(48);
  });

  it('exports semantic textStyles with sharp text colors', () => {
    expect(textStyles.body.fontSize).toBe(17);
    expect(textStyles.body.color).toBe('#111827');
    expect(textStyles.footnoteLabel.fontSize).toBe(13);
    expect(textStyles.footnoteLabel.color).toBe('#4B5563');
    expect(textStyles.mutedPlaceholder.color).toBe('#6B7280');
    expect(textStyles.sectionTitle.fontSize).toBe(22);
    expect(textStyles.screenTitle.color).toBe('#111827');
    expect(textStyles.tabularAmount.fontVariant).toEqual(['tabular-nums']);
  });
});

