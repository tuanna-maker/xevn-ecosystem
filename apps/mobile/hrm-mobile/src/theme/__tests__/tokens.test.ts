import { describe, expect, it } from 'vitest';

import { colors, layout, radius, resolveStatusTone, spacing, textStyles, typography } from '../tokens';



/** Parity with apps/web/web-portal/tailwind.config.cjs xevn.* */

const WEB_PORTAL_TOKENS = {

  primary: '#1E40AF',

  accent: '#06B6D4',

  success: '#10B981',

  warning: '#F59E0B',

  danger: '#EF4444',

  info: '#3B82F6',

  neutral: '#6B7280',

  background: '#F9FAFB',

  surface: '#FFFFFF',

  text: '#1F2937',

  textSecondary: '#6B7280',

  border: '#E5E7EB',

};



describe('design tokens — web-portal parity', () => {

  it('maps xevn color palette', () => {

    for (const [key, hex] of Object.entries(WEB_PORTAL_TOKENS)) {

      expect(colors[key as keyof typeof WEB_PORTAL_TOKENS]).toBe(hex);

    }

  });



  it('uses symmetrical grid radius for cards and inputs', () => {

    expect(radius.input).toBe(8);

    expect(radius.card).toBe(12);

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

});



describe('design tokens — MOBILE_XEVN_DESIGN_SYSTEM_DIRECTION §1–3', () => {

  it('uses iOS body 17pt and footnote 13pt', () => {

    expect(typography.fontSize.body).toBe(17);

    expect(typography.fontSize.footnote).toBe(13);

    expect(typography.fontSize.base).toBe(17);

  });



  it('defines layout ergonomics tokens', () => {

    expect(layout.screenPaddingH).toBe(16);

    expect(layout.listRowMinHeight).toBe(56);

    expect(layout.primaryButtonHeight).toBe(48);

  });



  it('maps section title to title2 22pt', () => {

    expect(typography.fontSize.title2).toBe(22);

    expect(typography.fontSize.largeTitle).toBe(34);

  });



  it('exports semantic textStyles for global typography', () => {

    expect(textStyles.body.fontSize).toBe(17);

    expect(textStyles.footnoteLabel.fontSize).toBe(13);

    expect(textStyles.sectionTitle.fontSize).toBe(22);

    expect(textStyles.tabularAmount.fontVariant).toEqual(['tabular-nums']);

  });

});


