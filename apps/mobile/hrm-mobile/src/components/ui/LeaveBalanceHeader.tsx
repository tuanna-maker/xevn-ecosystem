import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { LeaveBalancePayload } from '../../integrations/hrmLeaveBalance';
import {
  formatLeaveBalanceDays,
  resolveLeaveBalanceDisplayDays,
} from '../../integrations/hrmLeaveBalance';
import { groupedLayout } from '../../theme/groupedLayout';
import { colors, radius, spacing, typography } from '../../theme/tokens';

type LeaveBalanceHeaderProps = {
  balance: LeaveBalancePayload | null;
  loading?: boolean;
  error?: string;
};

export function LeaveBalanceHeader({ balance, loading, error }: LeaveBalanceHeaderProps) {
  const year = balance?.year ?? new Date().getFullYear();
  const available = balance
    ? formatLeaveBalanceDays(resolveLeaveBalanceDisplayDays(balance))
    : '—';
  const used = balance ? formatLeaveBalanceDays(balance.used_days) : '—';

  return (
    <View style={styles.wrap} testID="leave-balance-header">
      <Text style={styles.period}>Kỳ nghỉ {year}</Text>
      <View style={styles.cards}>
        <View style={[styles.card, styles.cardAvailable]}>
          <Text style={styles.cardLabel}>Còn lại</Text>
          <Text style={styles.cardValue}>{loading ? '…' : available}</Text>
          <Text style={styles.cardUnit}>ngày</Text>
        </View>
        <View style={[styles.card, styles.cardUsed]}>
          <Text style={styles.cardLabel}>Đã dùng</Text>
          <Text style={styles.cardValue}>{loading ? '…' : used}</Text>
          <Text style={styles.cardUnit}>ngày</Text>
        </View>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: groupedLayout.belowStackHeader,
    paddingBottom: groupedLayout.belowBalanceCards,
  },
  period: {
    fontSize: typography.fontSize.title2,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  cards: { flexDirection: 'row', gap: spacing.sm },
  card: {
    flex: 1,
    borderRadius: radius.card,
    padding: spacing.md,
    borderWidth: 1,
    gap: 2,
  },
  cardAvailable: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  cardUsed: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  cardLabel: {
    fontSize: typography.fontSize.footnote,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  cardValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  cardUnit: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  error: {
    fontSize: typography.fontSize.xs,
    color: colors.danger,
  },
});
