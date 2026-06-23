import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatManagerCardTitle, type ManagerPreviewRow } from '../../utils/dashboardHub';
import { colors, layout, radius, shadow, spacing, typography } from '../../theme/tokens';

export const MANAGER_INBOX_HERO_TEST_ID = 'home-manager-inbox-hero';

type ManagerInboxHeroProps = {
  pendingCount: number;
  preview: ManagerPreviewRow[];
  error?: string;
  onPress: () => void;
};

/**
 * Manager inbox hero — «Cần duyệt (n)» above action grid (MOB-UX-13e / AC-PERS-MGR-01).
 */
export function ManagerInboxHero({ pendingCount, preview, error, onPress }: ManagerInboxHeroProps) {
  const title = formatManagerCardTitle(pendingCount);
  const subtitle =
    error?.trim() ||
    (pendingCount === 0
      ? 'Không có đơn chờ duyệt từ cấp dưới'
      : preview[0]?.title?.trim() || 'Nhấn để mở hộp duyệt');

  return (
    <Pressable
      testID={MANAGER_INBOX_HERO_TEST_ID}
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [styles.wrap, pressed && styles.pressed]}
    >
      <View style={styles.iconWrap}>
        <Ionicons name="mail-unread" size={22} color={colors.warning} accessibilityElementsHidden />
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle} numberOfLines={2}>
          {subtitle}
        </Text>
      </View>
      {pendingCount > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{pendingCount > 99 ? '99+' : pendingCount}</Text>
        </View>
      ) : null}
      <Ionicons name="chevron-forward" size={20} color={colors.primary} accessibilityElementsHidden />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: layout.screenPaddingH,
    marginBottom: layout.sectionGap,
    backgroundColor: '#FFFBEB',
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: spacing.md,
    gap: spacing.sm,
    minHeight: layout.listRowMinHeight,
    ...shadow.sm,
  },
  pressed: {
    opacity: 0.9,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
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
  badge: {
    minWidth: 24,
    height: 24,
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
