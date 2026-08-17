/**
 * @CODE-MEMORY
 * Screen:     SurfaceCard — card tiêu đề + body + footer flat
 * UC:         AC-BRAND-DNA-01
 * BR:         XeVN Symmetrical Grid — radius.card 12 · borderWidth.thin · colors.border
 * SRS:        docs/program/XEVN_BRAND_FULL_FE_REMASTER_PROGRAM.md § L2m
 * TechSpec:   apps/mobile/hrm-mobile/src/theme/THEME_USAGE.md § L2 Card
 * Purpose:    Card mặt phẳng chuẩn form/section; stroke từ borderWidth.thin.
 * WorkItem:   MOB-XEVN-BRAND-PRIMITIVES-L2-01
 * Coded:      2026-07-22
 *
 * Callers: CreateLeaveRequestScreen, Settings, profile sections, …
 * Callees: PressableScale · theme/tokens
 *
 * FE-Actions:
 *   | Thao tác | Handler  | UI              |
 *   |----------|----------|-----------------|
 *   | Tap      | onPress? | PressableScale  |
 *
 * Impact:     Literal borderWidth: 1 → lệch L2 SoT khi đổi token.
 * must_keep:  radius.card; borderWidth.thin; colors.border
 * SOLID:      Presentational card — không chứa API
 * LastVerified: src/theme/__tests__/mobL2Primitives.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W4-MOB-A
 * What: brandAccentTop 4px primary bar MOB-13 · display typography on title
 */
import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { PressableScale } from '../primitives/PressableScale';
import { brandDisplayText } from '../../theme/brandTypography';
import { borderWidth, brand, colors, layout, radius, shadow, spacing, typography } from '../../theme/tokens';

type SurfaceCardProps = {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** When set, whole card is tappable with press-scale feedback. */
  onPress?: () => void;
  testID?: string;
  /** MOB-13 — 4px Precision Motion accent (optional). */
  brandAccentTop?: boolean;
};

export function SurfaceCard({
  title,
  children,
  footer,
  style,
  onPress,
  testID,
  brandAccentTop = false,
}: SurfaceCardProps) {
  const card = (
    <View style={[styles.card, brandAccentTop && styles.cardBrand, style]} testID={testID}>
      {brandAccentTop ? <View style={styles.brandBar} accessibilityElementsHidden /> : null}
      <Text style={styles.title}>{title}</Text>
      <View style={styles.body}>{children}</View>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </View>
  );

  if (onPress) {
    return (
      <PressableScale
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={title}
        style={styles.pressableWrap}
      >
        {card}
      </PressableScale>
    );
  }

  return card;
}

const styles = StyleSheet.create({
  pressableWrap: {
    width: '100%',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
    padding: layout.cardPadding,
    gap: spacing.sm,
    overflow: 'hidden',
    ...shadow.sm,
  },
  cardBrand: {
    borderColor: colors.primary,
    paddingTop: 0,
  },
  brandBar: {
    height: brand.barWidth,
    width: '100%',
    backgroundColor: colors.primary,
    marginBottom: spacing.sm,
  },
  title: {
    ...brandDisplayText({ fontWeight: '700' }),
    fontSize: typography.fontSize.title3,
    lineHeight: typography.lineHeight.title3,
    color: colors.text,
  },
  body: { gap: spacing.xs },
  footer: {
    borderTopWidth: borderWidth.thin,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
});
