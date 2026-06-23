import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, layout, radius, shadow, spacing, typography } from '../../theme/tokens';

export const LEADER_PULSE_TEST_ID = 'home-leader-pulse';

export type LeaderPulseMetrics = {
  activeHeadcount: string;
  attendanceRate: string;
  pendingRollup: string;
  companyLabel?: string;
};

type LeaderPulseCardProps = {
  metrics: LeaderPulseMetrics;
  onPress?: () => void;
};

/**
 * Leader «Pulse tập đoàn» KPI row — P1 stub with rollup counters (MOB-UX-13e / AC-PERS-LDR-01).
 */
export function LeaderPulseCard({ metrics, onPress }: LeaderPulseCardProps) {
  const subtitle = metrics.companyLabel?.trim()
    ? `Phạm vi: ${metrics.companyLabel.trim()}`
    : 'Tổng quan tập đoàn';

  return (
    <Pressable
      testID={LEADER_PULSE_TEST_ID}
      accessibilityRole="summary"
      accessibilityLabel="Pulse tập đoàn"
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.wrap, pressed && onPress ? styles.pressed : null]}
    >
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="pulse" size={20} color={colors.primary} accessibilityElementsHidden />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>Pulse tập đoàn</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{metrics.activeHeadcount}</Text>
          <Text style={styles.metricLabel}>NV active</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{metrics.attendanceRate}</Text>
          <Text style={styles.metricLabel}>% có mặt</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{metrics.pendingRollup}</Text>
          <Text style={styles.metricLabel}>Đơn chờ</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: layout.screenPaddingH,
    marginBottom: layout.sectionGap,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
    ...shadow.sm,
  },
  pressed: {
    opacity: 0.92,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: typography.fontSize.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  subtitle: {
    fontSize: typography.fontSize.footnote,
    lineHeight: typography.lineHeight.footnote,
    color: colors.textSecondary,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  metric: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  metricValue: {
    fontSize: typography.fontSize.title2,
    lineHeight: typography.lineHeight.title2,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    fontVariant: ['tabular-nums'],
  },
  metricLabel: {
    fontSize: typography.fontSize.caption,
    lineHeight: typography.lineHeight.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  metricDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
});
