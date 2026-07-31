import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { resolveLeaveTypeLabel } from '../../i18n/leaveTypes';
import { colors, layout, spacing, typography } from '../../theme/tokens';
import { formatHrmDateRange } from '../../utils/formatHrm';
import { ElevatedCard } from './ElevatedCard';
import { HrmAvatar } from './HrmAvatar';
import { PrimaryButton } from './PrimaryButton';
import { StatusBadge } from './StatusBadge';

export type ManagerLeaveCardProps = {
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  online?: boolean;
  onAccept: () => void;
  onDecline: () => void;
  onPress?: () => void;
};

export function ManagerLeaveCard({
  employeeName,
  leaveType,
  startDate,
  endDate,
  online = false,
  onAccept,
  onDecline,
  onPress,
}: ManagerLeaveCardProps) {
  return (
    <ElevatedCard onPress={onPress} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatarWrap}>
          <HrmAvatar size={44} fullName={employeeName} />
          <View style={[styles.presenceDot, online ? styles.presenceOn : styles.presenceOff]} />
        </View>
        <View style={styles.meta}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {employeeName}
            </Text>
            <StatusBadge status="pending" label="Chờ duyệt" />
          </View>
          <Text style={styles.subtitle} numberOfLines={2}>
            {resolveLeaveTypeLabel(leaveType)} · {formatHrmDateRange(startDate, endDate)}
          </Text>
        </View>
      </View>
      <View style={styles.actions}>
        <PrimaryButton label="Từ chối" variant="secondary" onPress={onDecline} size="sm" style={styles.actionBtn} />
        <PrimaryButton
          label="Duyệt"
          onPress={onAccept}
          size="sm"
          style={styles.actionBtn}
          testID="manager-approve-button"
        />
      </View>
    </ElevatedCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
    padding: spacing.md,
    minHeight: layout.listRowMinHeight + spacing.md * 2,
    marginBottom: spacing.md,
  },
  header: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  avatarWrap: { position: 'relative' },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  presenceDot: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  presenceOn: { backgroundColor: colors.success },
  presenceOff: { backgroundColor: colors.neutral },
  meta: { flex: 1, gap: 2 },
  name: {
    flex: 1,
    minWidth: 100,
    fontSize: typography.fontSize.title3,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    lineHeight: typography.lineHeight.title3,
  },
  subtitle: {
    fontSize: typography.fontSize.callout,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.callout,
  },
  actions: { flexDirection: 'row', gap: spacing.sm },
  actionBtn: { flex: 1 },
});
