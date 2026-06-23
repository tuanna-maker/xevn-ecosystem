import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatPayslipHeroNet } from '../../integrations/payrollPayslips';
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
  const statusLabel = status?.trim() || '';

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
          {statusLabel ? (
            <Text style={styles.status} numberOfLines={1}>
              {statusLabel}
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
    textTransform: 'capitalize',
  },
  chevronWrap: {
    marginLeft: spacing.sm,
    alignSelf: 'center',
  },
});
