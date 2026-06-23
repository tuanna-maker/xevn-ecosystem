import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, layout, radius, spacing, typography } from '../../theme/tokens';
import {
  formatJourneyEventDate,
  type JourneyTimelineEvent,
} from '../../utils/journeyTimeline';
import { HomeSectionHeader } from './HomeSectionHeader';

type JourneyTimelineCardProps = {
  events: JourneyTimelineEvent[];
  onViewAll: () => void;
  embedded?: boolean;
};

const KIND_ICON: Record<JourneyTimelineEvent['kind'], keyof typeof Ionicons.glyphMap> = {
  tenure_join: 'flag-outline',
  tenure_milestone: 'ribbon-outline',
  birthday: 'gift-outline',
  attendance: 'time-outline',
  payslip: 'wallet-outline',
  workflow: 'document-text-outline',
};

function JourneyTimelineRow({ event }: { event: JourneyTimelineEvent }) {
  const icon = KIND_ICON[event.kind] ?? 'ellipse-outline';
  return (
    <View style={styles.row} accessibilityRole="text">
      <View style={styles.iconWrap} accessibilityElementsHidden>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle} numberOfLines={2}>
          {event.title}
        </Text>
        <Text style={styles.rowSubtitle} numberOfLines={2}>
          {event.subtitle}
        </Text>
      </View>
      <Text style={styles.rowDate}>{formatJourneyEventDate(event.dateIso)}</Text>
    </View>
  );
}

/** MOB-UX-13g — grouped inset preview of tenure + feed milestones on Home. */
export function JourneyTimelineCard({ events, onViewAll, embedded = false }: JourneyTimelineCardProps) {
  if (events.length === 0) return null;

  return (
    <View style={embedded ? styles.embedded : styles.wrap} testID="home-journey-timeline-card">
      {!embedded ? (
        <HomeSectionHeader title="Hành trình" actionLabel="Xem tất cả" onActionPress={onViewAll} />
      ) : null}
      <View style={styles.card}>
        {events.map((event, index) => (
          <React.Fragment key={event.id}>
            {index > 0 ? <View style={styles.divider} /> : null}
            <JourneyTimelineRow event={event} />
          </React.Fragment>
        ))}
        <Pressable
          onPress={onViewAll}
          style={styles.footerLink}
          accessibilityRole="button"
          accessibilityLabel="Xem toàn bộ hành trình"
        >
          <Text style={styles.footerText}>Xem toàn bộ hành trình</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.primary} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: layout.itemGap,
    marginBottom: layout.sectionGap,
  },
  embedded: {
    gap: layout.itemGap,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingHorizontal: layout.cardPadding,
    paddingVertical: spacing.md,
    minHeight: layout.listRowMinHeight,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  rowBody: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    lineHeight: typography.lineHeight.body,
  },
  rowSubtitle: {
    fontSize: typography.fontSize.footnote,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.footnote,
  },
  rowDate: {
    fontSize: typography.fontSize.footnote,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.footnote,
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: layout.cardPadding + 36 + spacing.sm,
  },
  footerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    minHeight: 44,
  },
  footerText: {
    fontSize: typography.fontSize.subhead,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
});
