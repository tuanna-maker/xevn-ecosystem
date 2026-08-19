/**
 * @CODE-MEMORY
 * Screen:     BrandDialogChrome — 4px brand bar + wordmark + title (Precision Motion mobile)
 * UC:         BR-UI-BRAND-B2 · MOB-01/05/04b dialog chrome
 * BR:         Viền 4px #1E40AF · wordmark XeVN · title ≥20px display
 * SRS:        docs/client-delivery/hrm-enterprise-blueprint/SPONSOR_UI_BRAND_OPEN_QUESTIONS.md B2/Q1
 * TechSpec:   docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md §15.4 · §16
 * Purpose:    Neo modal/card header giống web `.xevn-dialog-surface` — mobile Face MVP + login + FAB sheet.
 * WorkItem:   PO-HRM-UI-BRAND-W4-MOB-A
 * Coded:      2026-08-05
 * Callers:    BrandedLoginCard · FabPrimaryActionSheet · FaceEnrollChromePanel · LoginScreen header
 * Callees:    XevnLogo · brandTypography · tokens brand.barWidth
 * Impact:     Thiếu bar → lệch W4 parity web portal login
 * must_keep:  barWidth brand.barWidth (4); colors.primary; face_live=false honesty on Face screens
 * SOLID:      Presentational chrome — không API
 * LastVerified: src/components/brand/__tests__/brandDialogChrome.test.ts
 */

import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { brandDisplayText, brandBodyText } from '../../theme/brandTypography';
import { borderWidth, brand, colors, layout, radius, spacing, typography } from '../../theme/tokens';
import { XevnLogo } from './XevnLogo';

export type BrandDialogChromeProps = {
  title: string;
  subtitle?: string;
  /** When false, only wordmark row (login card top). */
  showTitle?: boolean;
  testID?: string;
  style?: StyleProp<ViewStyle>;
};

export function BrandDialogChrome({
  title,
  subtitle,
  showTitle = true,
  testID = 'brand-dialog-chrome',
  style,
}: BrandDialogChromeProps) {
  return (
    <View style={[styles.wrap, style]} testID={testID}>
      <View style={styles.brandBar} accessibilityElementsHidden />
      <View style={styles.glassHeader}>
        <View style={styles.wordmarkRow}>
          <XevnLogo size={32} testID="brand-dialog-wordmark-logo" />
          <Text style={styles.wordmark} testID="brand-dialog-wordmark">
            XeVN
          </Text>
        </View>
        {showTitle ? (
          <>
            <Text style={styles.title} testID="brand-dialog-title">
              {title}
            </Text>
            {subtitle ? (
              <Text style={styles.subtitle} testID="brand-dialog-subtitle">
                {subtitle}
              </Text>
            ) : null}
          </>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card,
    marginHorizontal: -layout.cardPadding,
    marginTop: -layout.cardPadding,
    marginBottom: spacing.sm,
  },
  brandBar: {
    height: brand.barWidth,
    width: '100%',
    backgroundColor: colors.primary,
  },
  glassHeader: {
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: layout.cardPadding,
    paddingVertical: spacing.md,
    gap: spacing.xs,
    borderBottomWidth: borderWidth.hairline,
    borderBottomColor: colors.border,
  },
  wordmarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: layout.touchTargetMin,
  },
  wordmark: {
    ...brandDisplayText({ fontWeight: '700' }),
    fontSize: typography.fontSize.title3,
    lineHeight: typography.lineHeight.title3,
    color: colors.primary,
  },
  title: {
    ...brandDisplayText({ fontWeight: '700' }),
    fontSize: typography.fontSize.title3,
    lineHeight: typography.lineHeight.title3,
    color: colors.text,
  },
  subtitle: {
    ...brandBodyText(),
    fontSize: typography.fontSize.footnote,
    lineHeight: typography.lineHeight.footnote,
    color: colors.textSecondary,
  },
});
