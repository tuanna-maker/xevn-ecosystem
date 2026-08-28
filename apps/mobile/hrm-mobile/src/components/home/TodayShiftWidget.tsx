import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { borderWidth, colors, layout, radius, spacing, typography, statusToneColor } from '../../theme/tokens';
import { formatHrmDate } from '../../utils/formatHrm';

export function TodayShiftWidget() {
  const today = new Date();
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.dateText}>{formatHrmDate(today.toISOString())}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Sắp diễn ra</Text>
        </View>
      </View>
      
      <View style={styles.shiftDetails}>
        <Ionicons name="time-outline" size={24} color={colors.primary} style={styles.icon} />
        <View style={styles.timeInfo}>
          <Text style={styles.shiftName}>Ca Sáng</Text>
          <Text style={styles.timeRange}>08:00 - 12:00</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: layout.itemGap,
    marginHorizontal: layout.screenPaddingH,
    marginBottom: layout.itemGap,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  dateText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.subhead,
  },
  badge: {
    backgroundColor: statusToneColor('neutral').bg,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  badgeText: {
    color: statusToneColor('neutral').text,
    fontSize: typography.fontSize.footnote,
    fontWeight: 'bold',
  },
  shiftDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  icon: {
    marginRight: spacing.sm,
  },
  timeInfo: {
    flexDirection: 'column',
  },
  shiftName: {
    color: colors.text,
    fontSize: typography.fontSize.body,
    fontWeight: '600',
  },
  timeRange: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.subhead,
  }
});
