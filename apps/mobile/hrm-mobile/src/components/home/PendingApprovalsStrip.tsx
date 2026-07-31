import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { formatManagerCardTitle, type ManagerPreviewRow } from '../../utils/dashboardHub';
import { colors, layout, radius, shadow, spacing, statusToneColor, typography } from '../../theme/tokens';

export const PENDING_APPROVALS_STRIP_TEST_ID = 'home-pending-approvals-strip';

const warnTone = statusToneColor('warning');

type PendingApprovalsStripProps = {
  pendingCount: number;
  preview: ManagerPreviewRow[];
  onViewAll: () => void;
  onRowPress: (row: ManagerPreviewRow) => void;
};

/**
 * ZenHR-style pending approvals strip — visible above fold on Home (J-MOB-31 / MOB-UX-10-P0).
 */
export function PendingApprovalsStrip({
  pendingCount,
  preview,
  onViewAll,
  onRowPress,
}: PendingApprovalsStripProps) {
  if (pendingCount <= 0) return null;

  return (
    <View style={styles.wrap} testID={PENDING_APPROVALS_STRIP_TEST_ID}>
      <Pressable
        onPress={onViewAll}
        accessibilityRole="button"
        accessibilityLabel={formatManagerCardTitle(pendingCount)}
        style={({ pressed }) => [styles.header, pressed && styles.headerPressed]}
      >
        <View style={styles.headerLeft}>
          <View style={styles.headerIcon}>
            <Ionicons name="notifications" size={18} color={colors.warning} accessibilityElementsHidden />
          </View>
          <Text style={styles.headerTitle}>{formatManagerCardTitle(pendingCount)}</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{pendingCount > 99 ? '99+' : pendingCount}</Text>
          </View>
          <Text style={styles.viewAll}>Xem tất cả</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.primary} accessibilityElementsHidden />
        </View>
      </Pressable>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        accessibilityRole="list"
      >
        {preview.map((row) => (
          <Pressable
            key={row.key}
            onPress={() => onRowPress(row)}
            accessibilityRole="button"
            accessibilityLabel={`${row.title}, ${row.subtitle}`}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          >
            <Text style={styles.cardTitle} numberOfLines={1}>
              {row.title}
            </Text>
            <Text style={styles.cardSubtitle} numberOfLines={2}>
              {row.subtitle}
            </Text>
            <View style={styles.cardFooter}>
              <View style={styles.pendingPill}>
                <Text style={styles.pendingPillText}>Chờ duyệt</Text>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: layout.sectionGap,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPaddingH,
    minHeight: 44,
  },
  headerPressed: {
    opacity: 0.85,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: warnTone.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  countBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: radius.full,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  countBadgeText: {
    fontSize: typography.fontSize.caption,
    lineHeight: typography.lineHeight.caption,
    color: colors.surface,
    fontWeight: typography.fontWeight.bold,
  },
  viewAll: {
    fontSize: typography.fontSize.footnote,
    lineHeight: typography.lineHeight.footnote,
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  scrollContent: {
    paddingHorizontal: layout.screenPaddingH,
    gap: spacing.sm,
    paddingBottom: spacing.xs,
  },
  card: {
    width: 200,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.xs,
    ...shadow.sm,
  },
  cardPressed: {
    backgroundColor: colors.iosGroupedBackground,
  },
  cardTitle: {
    fontSize: typography.fontSize.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  cardSubtitle: {
    fontSize: typography.fontSize.footnote,
    lineHeight: typography.lineHeight.footnote,
    color: colors.textSecondary,
    minHeight: 32,
  },
  cardFooter: {
    marginTop: spacing.xs,
  },
  pendingPill: {
    alignSelf: 'flex-start',
    backgroundColor: warnTone.bg,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  pendingPillText: {
    fontSize: typography.fontSize.caption,
    lineHeight: typography.lineHeight.caption,
    color: warnTone.text,
    fontWeight: typography.fontWeight.semibold,
  },
});
