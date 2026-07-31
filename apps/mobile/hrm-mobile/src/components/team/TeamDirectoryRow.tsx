/**
 * @CODE-MEMORY
 * Screen:     TeamDirectory row card
 * UC:         UC-HRM-MOB-16 (W7-5) · AC-DIR-03
 * BR:         BR-DIR-01
 * SRS:        docs/hrm/MOBILE_W7_SRS_DELTA.md §4.4
 * TechSpec:   docs/hrm/MOBILE_W7_TECHSPEC_DELTA.md §4.2 EmployeeDirectoryScreen
 * Purpose:    Avatar + name + job + dept + attendance badge; press → detail (≥44px).
 * WorkItem:   PCOMP-W7-MOB-DIRECTORY
 * Coded:      2026-07-19
 * Callers: TeamDirectoryScreen
 * Callees: EmployeeAvatarRing · StatusBadge · PressableScale
 * must_keep: minHeight list row; onPress navigation to detail
 * LastVerified: components/ui/__tests__/teamDirectoryUx.test.ts
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PressableScale } from '../primitives/PressableScale';
import { EmployeeAvatarRing } from '../ui/EmployeeAvatarRing';
import { StatusBadge } from '../ui/StatusBadge';
import { colors, layout, radius, shadow, spacing, typography } from '../../theme/tokens';
import {
  TEAM_CHECK_IN_BADGE,
  type TeamDirectoryMember,
} from '../../utils/teamDirectory';

const AVATAR_SIZE = 48;
const STRIP_WIDTH = 4;

type TeamDirectoryRowProps = {
  member: TeamDirectoryMember;
  baseUrl: string;
  deptColorStrip: string;
  testID?: string;
  onPress?: () => void;
};

/** Rich directory row — dept strip, avatar ring, attendance dot, localized job title (MOB-UX-12b). */
export function TeamDirectoryRow({
  member,
  baseUrl,
  deptColorStrip,
  testID,
  onPress,
}: TeamDirectoryRowProps) {
  const { employee, department, jobTitle, checkInStatus } = member;
  const badge = TEAM_CHECK_IN_BADGE[checkInStatus];
  const name = employee.full_name?.trim() || employee.employee_code?.trim() || '—';
  const code = employee.employee_code?.trim();
  const checkedIn = checkInStatus === 'checked_in';

  const card = (
    <View style={styles.card} testID={testID}>
      <View style={[styles.strip, { backgroundColor: deptColorStrip }]} />
      <EmployeeAvatarRing
        size={AVATAR_SIZE}
        fullName={name}
        avatarUrl={employee.avatar_url}
        baseUrl={baseUrl}
        ringWidth={2}
        attendanceCheckedIn={checkedIn}
        showAttendanceDot
        testID={testID ? `${testID}-avatar` : undefined}
      />
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          <StatusBadge
            status={badge.status}
            tone={badge.tone}
            label={badge.label}
            testID={testID ? `${testID}-badge` : undefined}
          />
        </View>
        <Text style={styles.jobTitle} numberOfLines={1} testID={testID ? `${testID}-job` : undefined}>
          {jobTitle}
        </Text>
        <Text style={styles.dept} numberOfLines={1}>
          {department}
        </Text>
        {code ? (
          <Text style={styles.code} numberOfLines={1}>
            {code}
          </Text>
        ) : null}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <PressableScale
        testID={testID ? `${testID}-press` : undefined}
        accessibilityRole="button"
        accessibilityLabel={`Xem thông tin ${name}`}
        onPress={onPress}
        style={styles.pressWrap}
      >
        {card}
      </PressableScale>
    );
  }

  return card;
}

const styles = StyleSheet.create({
  pressWrap: {
    borderRadius: radius.card,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    paddingRight: layout.screenPaddingH,
    paddingVertical: spacing.sm + 2,
    minHeight: layout.listRowMinHeight + 8,
    overflow: 'hidden',
    ...shadow.sm,
  },
  strip: {
    width: STRIP_WIDTH,
    alignSelf: 'stretch',
    borderTopLeftRadius: radius.card,
    borderBottomLeftRadius: radius.card,
  },
  body: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  name: {
    flex: 1,
    fontSize: typography.fontSize.title3,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    lineHeight: typography.lineHeight.title3,
  },
  jobTitle: {
    fontSize: typography.fontSize.callout,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
    lineHeight: typography.lineHeight.callout,
  },
  dept: {
    fontSize: typography.fontSize.footnote,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.footnote,
  },
  code: {
    fontSize: typography.fontSize.footnote,
    color: colors.textMuted,
    lineHeight: typography.lineHeight.footnote,
  },
});
