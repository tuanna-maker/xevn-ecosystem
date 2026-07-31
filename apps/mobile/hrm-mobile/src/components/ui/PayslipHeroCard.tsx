/**
 * @CODE-MEMORY
 * Screen:     Payslip list — hero net salary card
 * UC:         ZenHR Z-P10 · M-F-02 · AC-U72-MOB-GLOBAL
 * BR:         BR-ZEN-03/05 · U72
 * SRS:        d-mob-u72-label-scan-01 §3 M-F-02
 * TechSpec:   display-label-no-raw-key.mdc
 * Purpose:    Hero thực lĩnh + kỳ; status qua statusLabel VI (cấm raw draft/paid).
 * WorkItem:   D-MOB-U72-LABEL-FE-01
 * Coded:      2026-07-27
 * Callers:    PayslipListScreen
 * Callees:    formatPayslipHeroNet · statusLabel
 * must_keep:  resolvePayslipPeriodLabelVi at call site; U65
 * LastVerified: integrations/__tests__/mapApiError.u72.test.ts (status) + payslip hero smoke
 *
 * @CODE-MEMORY-CHANGE 2026-07-27
 * WorkItem: D-MOB-U72-LABEL-FE-01
 * change_mode: FIX
 * What: Hero status text uses statusLabel VI; hide when «—»
 * Why: U72 M-F-02 raw capitalize status on gradient
 * must_keep: period/net display; U65 · HOLD_DEPLOY
 */

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatPayslipHeroNet } from '../../integrations/payrollPayslips';
import { statusLabel as resolvePayslipStatusVi } from '../../integrations/mapApiError';
import { colors, layout, radius, spacing, typography } from '../../theme/tokens';
import { PAYSLIP_HERO_TEST_ID } from '../../utils/payslipHero';

type PayslipHeroCardProps = {
  periodLabel: string;
  netAmount: number | null | undefined;
  currency: string;
  status?: string;
  onPress: () => void;
};

/** ZenHR Z-P10 — latest net salary hero (BR-ZEN-03/05). */
export function PayslipHeroCard({
  periodLabel,
  netAmount,
  currency,
  status,
  onPress,
}: PayslipHeroCardProps) {
  const netDisplay = formatPayslipHeroNet(netAmount, currency);
  const statusText = status?.trim() ? resolvePayslipStatusVi(status) : '';
  const showStatus = Boolean(statusText) && statusText !== '—';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Thực lĩnh ${netDisplay}, kỳ ${periodLabel}`}
      accessibilityHint="Mở chi tiết phiếu lương mới nhất"
      testID={PAYSLIP_HERO_TEST_ID}
      style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
    >
      <LinearGradient
        colors={[colors.payslipHeroGradientStart, colors.payslipHeroGradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Text style={styles.eyebrow}>Thực lĩnh mới nhất</Text>
          <Text style={styles.amount} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
            {netDisplay}
          </Text>
          <Text style={styles.period} numberOfLines={2}>
            {periodLabel}
          </Text>
          {showStatus ? (
            <Text style={styles.status} numberOfLines={1}>
              {statusText}
            </Text>
          ) : null}
        </View>
        <View style={styles.chevronWrap} accessibilityElementsHidden>
          <Ionicons name="chevron-forward" size={22} color="rgba(255,255,255,0.9)" />
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    borderRadius: radius.card,
    overflow: 'hidden',
    marginBottom: layout.sectionGap,
  },
  pressed: { opacity: 0.92 },
  gradient: {
    minHeight: 148,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderRadius: radius.card,
  },
  content: {
    flex: 1,
    gap: spacing.xs,
  },
  eyebrow: {
    fontSize: typography.fontSize.footnote,
    fontWeight: typography.fontWeight.medium,
    color: 'rgba(255,255,255,0.88)',
    lineHeight: typography.lineHeight.footnote,
  },
  amount: {
    fontSize: typography.fontSize.title1,
    fontWeight: typography.fontWeight.bold,
    color: '#FFFFFF',
    lineHeight: typography.lineHeight.title1,
  },
  period: {
    fontSize: typography.fontSize.subhead,
    fontWeight: typography.fontWeight.medium,
    color: 'rgba(255,255,255,0.95)',
    lineHeight: typography.lineHeight.subhead,
  },
  status: {
    fontSize: typography.fontSize.footnote,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: typography.lineHeight.footnote,
  },
  chevronWrap: {
    marginLeft: spacing.sm,
    alignSelf: 'center',
  },
});
