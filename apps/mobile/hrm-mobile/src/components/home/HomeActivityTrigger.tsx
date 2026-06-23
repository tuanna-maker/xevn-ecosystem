import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { HOME_ACTIVITY_TRIGGER_TEST_ID } from '../../utils/homeScrollBudget';
import { colors, layout, radius, spacing, typography } from '../../theme/tokens';

type HomeActivityTriggerProps = {
  badgeCount?: number;
  subtitle?: string;
  onPress: () => void;
};

/** Single below-fold entry for consolidated activity sections (MOB-UX-14b). */
export function HomeActivityTrigger({ badgeCount, subtitle, onPress }: HomeActivityTriggerProps) {
  return (
    <Pressable
      testID={HOME_ACTIVITY_TRIGGER_TEST_ID}
      accessibilityRole="button"
      accessibilityLabel="Hoạt động, mở danh sách"
      onPress={onPress}
      collapsable={false}
      importantForAccessibility="yes"
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.iconWrap}>
        <Ionicons name="layers-outline" size={22} color={colors.primary} accessibilityElementsHidden />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>Hoạt động</Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle ?? 'Bảng lương, việc cần làm, lịch nghỉ'}
        </Text>
      </View>
      {badgeCount != null && badgeCount > 0 ? (
        <View style={styles.badge} accessibilityLabel={`${badgeCount} mục`}>
          <Text style={styles.badgeText}>{badgeCount > 99 ? '99+' : String(badgeCount)}</Text>
        </View>
      ) : null}
      <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} accessibilityElementsHidden />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: layout.listRowMinHeight,
    paddingVertical: spacing.sm,
    paddingHorizontal: layout.screenPaddingH,
    marginBottom: layout.itemGap,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.9,
    backgroundColor: colors.iosGroupedBackground,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.iosGroupedBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: typography.fontSize.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  subtitle: {
    fontSize: typography.fontSize.footnote,
    lineHeight: typography.lineHeight.footnote,
    color: colors.textSecondary,
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: radius.full,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: typography.fontSize.caption,
    lineHeight: typography.lineHeight.caption,
    color: '#FFFFFF',
    fontWeight: typography.fontWeight.bold,
  },
});
