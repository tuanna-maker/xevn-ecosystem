/**
 * @CODE-MEMORY
 * Screen:     Requests â†’ CreateLeaveRequest (wizard) Â· ESS leave surfaces
 * UC:         UC-HRM-MOB-06c (W7-4)
 * BR:         BR-LEAVE-BAL-01 Â· BR-LEAVE-BAL-02
 * SRS:        docs/hrm/MOBILE_W7_SRS_DELTA.md Â§4.3
 * TechSpec:   docs/hrm/MOBILE_W7_TECHSPEC_DELTA.md Â§3.6 Â· Â§4.2 LeaveBalanceChip
 * Data:       docs/hrm/MOBILE_W7_DATA_CONTRACTS.md Â§4 leave_balance
 * Purpose:    Read-only leave balance chip â€” remaining/entitled + year;
 *             missing-config HR copy; touch target â‰¥44px.
 * WorkItem:   PCOMP-W7-MOB-LEAVE-BAL Â· PCOMP-W7-MOB-LEAVE-BAL-02
 * Coded:      2026-07-19
 *
 * Callers: CreateLeaveRequestScreen (steps 0â€“1)
 * Callees: formatLeaveBalanceChipText Â· LEAVE_BALANCE_MISSING_HR_MSG (hrmLeaveBalance)
 *
 * FE-Actions:
 *   | User action | Handler | Lib / RPC |
 *   |-------------|---------|-----------|
 *   | (display)   | â€”       | GET /attendance/leave-balance |
 *
 * Impact:     Wrong format â†’ AC-LEAVE-BAL-01 FAIL; fake numbers â†’ BR-ESS-06 FAIL
 * must_keep:  SRS copy Â«CĂ²n láº¡i: R / E ngĂ y phĂ©p nÄƒm YÂ»; testID leave-balance-chip; no invent balance
 * SOLID:      Presentational only â€” fetch/warn policy owned by screen + helpers
 * LastVerified: components/ui/__tests__/leaveBalanceChip.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-28 PCOMP-W7-MOB-LEAVE-BAL-02 â€” confirm step-0 wire + default testID
 *             (qa-device 2026-07-19 FAIL = stale APK missing chip markers, not missing source)
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { LeaveBalancePayload } from '../../integrations/hrmLeaveBalance';
import {
  formatLeaveBalanceChipText,
  LEAVE_BALANCE_MISSING_HR_MSG,
} from '../../integrations/hrmLeaveBalance';
import { colors, radius, spacing, statusToneColor, typography } from '../../theme/tokens';

const successTone = statusToneColor('success');

export type LeaveBalanceChipProps = {
  balance: LeaveBalancePayload | null;
  loading?: boolean;
  /** True when API 404 / not configured â€” SRS B1 */
  notConfigured?: boolean;
  /** Other API / parse errors (non-404) â€” still do not invent numbers */
  error?: string | null;
  testID?: string;
};

export function LeaveBalanceChip({
  balance,
  loading = false,
  notConfigured = false,
  error = null,
  testID = 'leave-balance-chip',
}: LeaveBalanceChipProps) {
  let body: string;
  if (loading) {
    body = 'Äang táº£i sá»‘ dÆ°â€¦';
  } else if (notConfigured || error) {
    body = LEAVE_BALANCE_MISSING_HR_MSG;
  } else if (balance) {
    body = formatLeaveBalanceChipText(balance);
  } else {
    body = 'â€”';
  }

  const muted = Boolean(loading || notConfigured || error || !balance);

  return (
    <View
      style={[styles.chip, muted && styles.chipMuted]}
      testID={testID}
      accessibilityRole="text"
      accessibilityLabel={body}
    >
      <Text style={styles.label}>Sá»‘ dÆ° phĂ©p</Text>
      <Text style={[styles.value, muted && styles.valueMuted]} testID={`${testID}-value`}>
        {body}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 44,
    paddingHorizontal: spacing.md - 4,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: successTone.border,
    backgroundColor: successTone.bg,
    gap: 2,
    justifyContent: 'center',
  },
  chipMuted: {
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  label: {
    fontSize: typography.fontSize.footnote,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  value: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
  valueMuted: {
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
});
