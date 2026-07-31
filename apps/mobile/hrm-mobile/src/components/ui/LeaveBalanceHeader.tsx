/**
 * @CODE-MEMORY
 * Screen:     Requests → LeaveRequestsList (My Leaves) period header
 * UC:         UC-HRM-MOB-06c · J-MOB-25
 * BR:         BR-LEAVE-BAL-01 · BR-ESS-06
 * SRS:        docs/hrm/MOBILE_W7_SRS_DELTA.md §4.3 · MOBILE_HRM_ESS_UX_BENCHMARK §4.2
 * TechSpec:   docs/hrm/MOBILE_W7_TECHSPEC_DELTA.md §3.6
 * Purpose:    Two metric cards Còn lại / Đã dùng from GET leave-balance.
 * WorkItem:   PCOMP-W7-MOB-LEAVE-BAL · PCOMP-W8-MOB-ESS-LEAVE-01
 * Coded:      2026-06-08
 *
 * Callers: LeaveRequestsListScreen
 * Callees: formatLeaveBalanceDays · resolveLeaveBalanceDisplayDays
 *
 * must_keep:  No fake numbers on error; Kỳ nghỉ {year} label
 * SOLID:      Presentational — fetch owned by list screen
 * LastVerified: components/ui/__tests__/mobUx13d.test.ts · leaveBalanceChip.test.ts
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { LeaveBalancePayload } from '../../integrations/hrmLeaveBalance';
import {
  formatLeaveBalanceDays,
  LEAVE_BALANCE_MISSING_HR_MSG,
  resolveLeaveBalanceDisplayDays,
} from '../../integrations/hrmLeaveBalance';
import { groupedLayout } from '../../theme/groupedLayout';
import { colors, radius, spacing, statusToneColor, typography } from '../../theme/tokens';

type LeaveBalanceHeaderProps = {
  balance: LeaveBalancePayload | null;
  loading?: boolean;
  error?: string;
};

const successTone = statusToneColor('success');
const infoTone = statusToneColor('info');

export function LeaveBalanceHeader({ balance, loading, error }: LeaveBalanceHeaderProps) {
  const year = balance?.year ?? new Date().getFullYear();
  const available = balance
    ? formatLeaveBalanceDays(resolveLeaveBalanceDisplayDays(balance))
    : '—';
  const used = balance ? formatLeaveBalanceDays(balance.used_days) : '—';
  const errorText = error ? LEAVE_BALANCE_MISSING_HR_MSG : null;

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
      {errorText ? <Text style={styles.error}>{errorText}</Text> : null}
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
    backgroundColor: successTone.bg,
    borderColor: successTone.border,
  },
  cardUsed: {
    backgroundColor: infoTone.bg,
    borderColor: infoTone.border,
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
    fontSize: typography.fontSize.caption,
    color: colors.textSecondary,
  },
  error: {
    fontSize: typography.fontSize.footnote,
    color: colors.danger,
  },
});
