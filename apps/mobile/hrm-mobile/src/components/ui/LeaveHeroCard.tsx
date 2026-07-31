/**
 * @CODE-MEMORY
 * Screen:     Leave detail — employee hero + status badge
 * UC:         Leave detail · M-F-03 · AC-U72-MOB-GLOBAL
 * BR:         U72
 * SRS:        d-mob-u72-label-scan-01 §3 M-F-03
 * TechSpec:   display-label-no-raw-key.mdc
 * Purpose:    Hero NV + StatusBadge với nhãn VI từ statusLabel (cancelled→Đã hủy).
 * WorkItem:   D-MOB-U72-LABEL-FE-01
 * Coded:      2026-07-27
 * Callers:    Leave detail screen
 * Callees:    StatusBadge · statusLabel · HrmAvatar
 * must_keep:  statusLabel hardened dictionary; U65
 * LastVerified: integrations/__tests__/mapApiError.u72.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-27
 * WorkItem: D-MOB-U72-LABEL-FE-01
 * change_mode: FIX
 * What: Pass explicit statusLabel VI into StatusBadge
 * Why: U72 M-F-03 LeaveHero raw unmapped status
 * must_keep: U65 · HOLD_DEPLOY
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { statusLabel } from '../../integrations/mapApiError';
import { colors, radius, spacing, typography } from '../../theme/tokens';
import { HrmAvatar } from './HrmAvatar';
import { StatusBadge } from './StatusBadge';

type LeaveHeroCardProps = {
  employeeName: string;
  employeeCode: string;
  department?: string | null;
  status: string;
  avatarUrl?: string | null;
  baseUrl?: string;
};

export function LeaveHeroCard({
  employeeName,
  employeeCode,
  department,
  status,
  avatarUrl,
  baseUrl,
}: LeaveHeroCardProps) {
  const dept = department?.trim() || '—';

  return (
    <View style={styles.hero} accessibilityRole="summary">
      <HrmAvatar size={48} fullName={employeeName} avatarUrl={avatarUrl} baseUrl={baseUrl} />
      <View style={styles.textCol}>
        <Text style={styles.name} numberOfLines={2}>
          {employeeName}
        </Text>
        <Text style={styles.meta} numberOfLines={2}>
          {employeeCode} · {dept}
        </Text>
      </View>
      <StatusBadge status={status} label={statusLabel(status)} />
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.background,
    borderRadius: radius.card,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textCol: { flex: 1, gap: 4 },
  name: {
    fontSize: typography.fontSize.title3,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    lineHeight: typography.lineHeight.title3,
  },
  meta: {
    fontSize: typography.fontSize.callout,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.callout,
  },
});
