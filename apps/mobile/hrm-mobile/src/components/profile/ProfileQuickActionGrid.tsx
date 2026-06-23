import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PressableScale } from '../primitives/PressableScale';
import { colors, layout, radius, spacing, typography } from '../../theme/tokens';
import { PROFILE_QUICK_ACTIONS, type ProfileQuickActionId } from '../../utils/profileQuickActions';

type ProfileQuickActionGridProps = {
  onAction: (id: ProfileQuickActionId) => void;
  badgeCounts?: Partial<Record<ProfileQuickActionId, number>>;
  testID?: string;
};

/** 4-tile quick entry grid — Beisen 快捷入口 / MOB-UX-12c. */
export function ProfileQuickActionGrid({
  onAction,
  badgeCounts,
  testID = 'profile-quick-action-grid',
}: ProfileQuickActionGridProps) {
  return (
    <View style={styles.grid} testID={testID}>
      {PROFILE_QUICK_ACTIONS.map((action) => {
        const badge = badgeCounts?.[action.id] ?? 0;
        return (
          <PressableScale
            key={action.id}
            style={styles.tile}
            onPress={() => onAction(action.id)}
            accessibilityRole="button"
            accessibilityLabel={action.label}
            testID={action.testID}
          >
            <View style={styles.iconWrap}>
              <View style={[styles.iconCircle, { backgroundColor: action.tileColor }]}>
                <Ionicons name={action.icon} size={22} color={action.iconColor} />
              </View>
              {badge > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.label} numberOfLines={2}>
              {action.label}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: layout.sectionGap,
  },
  tile: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    minWidth: 72,
  },
  iconWrap: {
    position: 'relative',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: radius.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  badgeText: {
    color: colors.surface,
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
  },
  label: {
    fontSize: typography.fontSize.caption,
    color: colors.text,
    textAlign: 'center',
    lineHeight: typography.lineHeight.caption,
  },
});
