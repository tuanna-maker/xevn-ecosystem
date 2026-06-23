import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { resolveUpdateTypeLabel } from '../../utils/profileTask';
import { colors, layout, spacing, typography } from '../../theme/tokens';
import { ElevatedCard } from './ElevatedCard';
import { HrmAvatar } from './HrmAvatar';
import { PrimaryButton } from './PrimaryButton';
import { StatusBadge } from './StatusBadge';

export type ManagerAttendanceCardProps = {
  employeeName: string;
  updateType: string;
  onAccept: () => void;
  onDecline: () => void;
  onPress?: () => void;
};

/** Manager inbox card for attendance update requests — SET G-4 / Personio pattern. */
export function ManagerAttendanceCard({
  employeeName,
  updateType,
  onAccept,
  onDecline,
  onPress,
}: ManagerAttendanceCardProps) {
  const typeLabel = resolveUpdateTypeLabel(updateType);

  return (
    <ElevatedCard onPress={onPress} style={styles.card}>
      <View style={styles.header}>
        <HrmAvatar size={44} fullName={employeeName} />
        <View style={styles.meta}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {employeeName}
            </Text>
            <StatusBadge status="pending" label="Chờ duyệt" />
          </View>
          <Text style={styles.subtitle} numberOfLines={2}>
            Chỉnh sửa chấm công · {typeLabel}
          </Text>
        </View>
      </View>
      <View style={styles.actions}>
        <PrimaryButton label="Từ chối" variant="secondary" onPress={onDecline} size="sm" style={styles.actionBtn} />
        <PrimaryButton label="Duyệt" onPress={onAccept} size="sm" style={styles.actionBtn} />
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
  meta: { flex: 1, gap: 4 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
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
