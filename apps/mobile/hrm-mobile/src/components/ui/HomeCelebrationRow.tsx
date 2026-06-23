import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, layout, spacing, typography } from '../../theme/tokens';
import type { CelebrationChipItem } from '../../utils/journeyTimeline';
import type { HomeCelebrationItem } from '../../utils/dashboardHubCelebrate';
import { HrmAvatar } from './HrmAvatar';

export type HomeCelebrationRowProps = {
  /** @deprecated Use chips — kept for migration tests. */
  items?: HomeCelebrationItem[];
  chips?: CelebrationChipItem[];
  baseUrl?: string;
  hasMore?: boolean;
};

function resolveChips(props: HomeCelebrationRowProps): CelebrationChipItem[] {
  if (props.chips && props.chips.length > 0) return props.chips;
  return (props.items ?? []).map((item) => ({
    employee_id: item.employee_id,
    display_name: item.display_name,
    avatar_url: item.avatar_url,
    avatar_initials: item.avatar_initials,
    kind: 'birthday' as const,
    chipLabel: 'Sinh nhật',
  }));
}

/** U49 + MOB-UX-13g — horizontal birthday + tenure avatars (max 10); Vietnamese only. */
export function HomeCelebrationRow({ chips, items, baseUrl, hasMore }: HomeCelebrationRowProps) {
  const resolved = resolveChips({ chips, items, baseUrl, hasMore });
  if (resolved.length === 0) return null;

  return (
    <View style={styles.wrap} testID="home-celebration-row">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {resolved.map((item) => {
          const a11y =
            item.kind === 'tenure'
              ? `Thâm niên ${item.display_name} ${item.chipLabel}`
              : `Sinh nhật ${item.display_name}`;
          return (
            <View key={`${item.kind}-${item.employee_id}`} style={styles.chip} accessibilityRole="text">
              <View style={styles.avatarWrap}>
                <HrmAvatar
                  size={56}
                  fullName={item.display_name}
                  avatarUrl={item.avatar_url}
                  baseUrl={baseUrl}
                  accessibilityLabel={a11y}
                />
                {item.kind === 'tenure' ? (
                  <View style={styles.tenureBadge} accessibilityElementsHidden>
                    <Text style={styles.tenureBadgeText}>★</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.name} numberOfLines={2}>
                {item.display_name}
              </Text>
              <Text style={styles.chipLabel} numberOfLines={1}>
                {item.chipLabel}
              </Text>
            </View>
          );
        })}
        {hasMore ? (
          <View style={styles.moreChip} accessibilityRole="text" accessibilityLabel="Còn thêm">
            <View style={styles.moreCircle}>
              <Text style={styles.moreText}>+</Text>
            </View>
            <Text style={styles.name}>Xem thêm</Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const AVATAR_SIZE = 56;

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: -layout.screenPaddingH,
  },
  scrollContent: {
    paddingHorizontal: layout.screenPaddingH,
    gap: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  chip: {
    width: AVATAR_SIZE + spacing.sm,
    alignItems: 'center',
    gap: spacing.xs,
  },
  avatarWrap: {
    position: 'relative',
  },
  tenureBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.warning,
    borderWidth: 2,
    borderColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tenureBadgeText: {
    fontSize: 10,
    color: colors.surface,
    fontWeight: typography.fontWeight.bold,
  },
  name: {
    fontSize: typography.fontSize.caption,
    lineHeight: typography.lineHeight.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: AVATAR_SIZE + spacing.md,
  },
  chipLabel: {
    fontSize: typography.fontSize.footnote,
    lineHeight: typography.lineHeight.footnote,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
    textAlign: 'center',
    maxWidth: AVATAR_SIZE + spacing.md,
  },
  moreChip: {
    width: AVATAR_SIZE + spacing.sm,
    alignItems: 'center',
    gap: spacing.xs,
  },
  moreCircle: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreText: {
    fontSize: typography.fontSize.title2,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
});
