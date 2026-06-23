import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, layout, spacing, typography } from '../../theme/tokens';
import { HomeSectionHeader } from './HomeSectionHeader';

export type HomeExpandableSectionProps = {
  title: string;
  badgeCount?: number;
  /** Collapsed by default — reduces above-fold clutter (MOB-UX-13c). */
  defaultExpanded?: boolean;
  actionLabel?: string;
  onActionPress?: () => void;
  testID?: string;
  children: React.ReactNode;
};

/** iOS-style collapsible home section — title2 header + 12pt gaps. */
export function HomeExpandableSection({
  title,
  badgeCount,
  defaultExpanded = false,
  actionLabel,
  onActionPress,
  testID,
  children,
}: HomeExpandableSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <View style={styles.wrap} testID={testID}>
      <View style={styles.headerRow}>
        <Pressable
          onPress={() => setExpanded((v) => !v)}
          accessibilityRole="button"
          accessibilityState={{ expanded }}
          accessibilityLabel={`${title}, ${expanded ? 'thu gọn' : 'mở rộng'}`}
          style={({ pressed }) => [styles.toggle, pressed && styles.togglePressed]}
          hitSlop={8}
        >
          <View style={styles.titleFlex}>
            <HomeSectionHeader title={title} badgeCount={badgeCount} />
          </View>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.textSecondary}
            accessibilityElementsHidden
          />
        </Pressable>
        {actionLabel && onActionPress ? (
          <Pressable onPress={onActionPress} accessibilityRole="button" hitSlop={8}>
            <Text style={styles.link}>{actionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
      {expanded ? <View style={styles.body}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: layout.itemGap,
    marginBottom: layout.sectionGap,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  toggle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 44,
  },
  togglePressed: {
    opacity: 0.88,
  },
  titleFlex: {
    flex: 1,
  },
  link: {
    fontSize: typography.fontSize.subhead,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  body: {
    gap: layout.itemGap,
  },
});
