/**
 * @CODE-MEMORY
 * Screen:     Auth — BrandedLoginCard (white inset form over login hero)
 * UC:         AC-BRAND-DNA-01 / AC-BRAND-DNA-06
 * BR:         Card DNA — radius.card 12 · borderWidth.hairline · colors.border
 * SRS:        docs/program/XEVN_BRAND_FULL_FE_REMASTER_PROGRAM.md §3 L3m
 * TechSpec:   docs/program/XEVN_BRAND_UIUX_PROPOSAL.md §3 · THEME_USAGE § L3
 * Purpose:    Thẻ form đăng nhập XeVN trên gradient hero — stroke/radius từ L1 tokens.
 * WorkItem:   MOB-XEVN-BRAND-SHELL-L3-01
 * Coded:      2026-07-22
 * Callers:    LoginScreen → BrandedLoginCard
 * Callees:    colors.surface / colors.border / radius.card / borderWidth.hairline / shadow.soft
 * Impact:     Đổi radius.lg hoặc StyleSheet.hairlineWidth → lệch L2 Card DNA / brand SoT card=12
 * must_keep:  borderRadius = radius.card (12); borderWidth = borderWidth.hairline; borderColor = colors.border
 * SOLID:      Shell card tách khỏi LoginScreen fields
 * LastVerified: src/theme/__tests__/mobL3Shell.test.ts
 */
import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { borderWidth, colors, layout, radius, shadow, spacing } from '../../theme/tokens';

export type BrandedLoginCardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * SET F-1 white inset form card — radius.card (12), elevation soft, pad 24pt.
 * Sits over gradient hero on LoginScreen (MOB-UX-11a · L3m shell).
 */
export function BrandedLoginCard({ children, style, testID = 'branded-login-card' }: BrandedLoginCardProps) {
  return (
    <View style={[styles.card, style]} testID={testID}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.lg,
    gap: spacing.md,
    marginHorizontal: layout.screenPaddingH,
    marginTop: -spacing['2xl'],
    ...shadow.soft,
    borderWidth: borderWidth.hairline,
    borderColor: colors.border,
  },
});
