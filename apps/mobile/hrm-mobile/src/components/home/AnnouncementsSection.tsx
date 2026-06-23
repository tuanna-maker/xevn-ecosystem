import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ListRow } from '../ui/ListRow';
import type { AnnouncementRow } from '../../utils/dashboardEss';
import { colors, layout, spacing, typography } from '../../theme/tokens';
import { HomeSectionHeader } from './HomeSectionHeader';

type AnnouncementsSectionProps = {
  items: AnnouncementRow[];
  error?: string;
  onItemPress: (id: string) => void;
  onViewAll?: () => void;
};

export function AnnouncementsSection({ items, error, onItemPress, onViewAll }: AnnouncementsSectionProps) {
  return (
    <View style={styles.section}>
      <HomeSectionHeader
        title="Thông báo"
        badgeCount={items.length > 0 ? items.length : undefined}
        actionLabel={items.length > 0 && onViewAll ? 'Xem tất cả' : undefined}
        onActionPress={onViewAll}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {items.length === 0 && !error ? (
        <Text style={styles.empty}>Chưa có thông báo mới</Text>
      ) : (
        items.map((row) => (
          <ListRow
            key={row.id}
            title={row.title}
            subtitle={row.dateLabel}
            onPress={() => onItemPress(row.id)}
          />
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: layout.itemGap,
    marginBottom: layout.sectionGap,
  },
  error: {
    fontSize: typography.fontSize.footnote,
    color: colors.danger,
    lineHeight: typography.lineHeight.footnote,
  },
  empty: {
    fontSize: typography.fontSize.subhead,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.subhead,
    paddingVertical: spacing.sm,
  },
});
