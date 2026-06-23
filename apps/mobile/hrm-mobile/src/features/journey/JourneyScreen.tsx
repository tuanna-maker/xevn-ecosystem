import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { SectionList, StyleSheet, Text, View } from 'react-native';
import { AppScreenLayout } from '../../components/ui/AppScreenLayout';
import { colors, layout, radius, spacing, typography } from '../../theme/tokens';
import {
  buildJourneyEventsFromFeed,
  formatJourneyEventDate,
  groupJourneyEventsByYear,
  type JourneyTimelineEvent,
} from '../../utils/journeyTimeline';
import type { RouteProp } from '@react-navigation/native';
import type { ProfileStackParamList } from '../../navigation/types';

type JourneyScreenRoute = RouteProp<ProfileStackParamList, 'Journey'>;

type JourneyScreenProps = {
  route: JourneyScreenRoute;
};

const KIND_ICON: Record<JourneyTimelineEvent['kind'], keyof typeof Ionicons.glyphMap> = {
  tenure_join: 'flag-outline',
  tenure_milestone: 'ribbon-outline',
  birthday: 'gift-outline',
  attendance: 'time-outline',
  payslip: 'wallet-outline',
  workflow: 'document-text-outline',
};

function JourneyEventRow({ event }: { event: JourneyTimelineEvent }) {
  const icon = KIND_ICON[event.kind] ?? 'ellipse-outline';
  return (
    <View style={styles.eventRow}>
      <View style={styles.eventIcon} accessibilityElementsHidden>
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      <View style={styles.eventBody}>
        <Text style={styles.eventTitle}>{event.title}</Text>
        <Text style={styles.eventSubtitle}>{event.subtitle}</Text>
        <Text style={styles.eventDate}>{formatJourneyEventDate(event.dateIso)}</Text>
      </View>
    </View>
  );
}

/** MOB-UX-13g — full journey timeline grouped by year (read-only stub). */
export function JourneyScreen({ route }: JourneyScreenProps) {
  const feed = route.params?.feed;

  const sections = useMemo(() => {
    if (!feed) return [];
    const events = buildJourneyEventsFromFeed({
      displayName: feed.displayName,
      hiredAt: feed.hiredAt,
      checkInSummary: feed.checkInSummary,
      checkInStatus: feed.checkInStatus,
      checkInDateIso: feed.checkInDateIso,
      payslipTeaser: feed.payslipTeaser,
      inboxRows: feed.inboxRows,
      celebrations: feed.celebrations,
      tenureToday: feed.tenureToday,
    });
    return groupJourneyEventsByYear(events);
  }, [feed]);

  const displayName = feed?.displayName?.trim() || 'bạn';

  return (
    <AppScreenLayout grouped loading={false}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Hành trình làm việc</Text>
        <Text style={styles.heroSubtitle}>
          Cột mốc thâm niên và hoạt động gần đây của {displayName}
        </Text>
      </View>

      {sections.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Chưa có dữ liệu hành trình</Text>
          <Text style={styles.emptyHint}>
            Khi có thông tin thâm niên hoặc hoạt động mới, chúng sẽ hiển thị tại đây.
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          stickySectionHeadersEnabled
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionYear}>{section.title}</Text>
            </View>
          )}
          renderItem={({ item, index, section }) => (
            <View
              style={[
                styles.sectionCard,
                index === 0 ? styles.sectionCardFirst : null,
                index === section.data.length - 1 ? styles.sectionCardLast : null,
              ]}
            >
              <JourneyEventRow event={item} />
              {index < section.data.length - 1 ? <View style={styles.divider} /> : null}
            </View>
          )}
          SectionSeparatorComponent={() => <View style={styles.sectionGap} />}
          contentContainerStyle={styles.listContent}
        />
      )}
    </AppScreenLayout>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: spacing.xs,
    marginBottom: layout.sectionGap,
    paddingHorizontal: layout.screenPaddingH,
  },
  heroTitle: {
    fontSize: typography.fontSize.largeTitle,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    lineHeight: typography.lineHeight.largeTitle,
  },
  heroSubtitle: {
    fontSize: typography.fontSize.subhead,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.subhead,
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  sectionHeader: {
    backgroundColor: colors.iosGroupedBackground,
    paddingHorizontal: layout.screenPaddingH,
    paddingVertical: spacing.sm,
  },
  sectionYear: {
    fontSize: typography.fontSize.title3,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.title3,
  },
  sectionGap: {
    height: layout.sectionGap,
  },
  sectionCard: {
    marginHorizontal: layout.screenPaddingH,
    backgroundColor: colors.surface,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.border,
  },
  sectionCardFirst: {
    borderTopWidth: 1,
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card,
  },
  sectionCardLast: {
    borderBottomWidth: 1,
    borderBottomLeftRadius: radius.card,
    borderBottomRightRadius: radius.card,
    marginBottom: spacing.sm,
  },
  eventRow: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: layout.cardPadding,
    minHeight: layout.listRowMinHeight,
  },
  eventIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventBody: {
    flex: 1,
    gap: 2,
  },
  eventTitle: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    lineHeight: typography.lineHeight.body,
  },
  eventSubtitle: {
    fontSize: typography.fontSize.footnote,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.footnote,
  },
  eventDate: {
    fontSize: typography.fontSize.footnote,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: layout.cardPadding + 40 + spacing.md,
  },
  emptyCard: {
    marginHorizontal: layout.screenPaddingH,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: layout.cardPadding,
    gap: spacing.sm,
  },
  emptyTitle: {
    fontSize: typography.fontSize.title3,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  emptyHint: {
    fontSize: typography.fontSize.subhead,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.subhead,
  },
});
