/**
 * @CODE-MEMORY
 * Screen:     TeamColleagueDetail (read-only directory profile)
 * UC:         UC-HRM-MOB-16 (W7-5) · AC-DIR-02 · J-MOB-16 L2.5
 * BR:         BR-DIR-02
 * SRS:        docs/hrm/MOBILE_W7_SRS_DELTA.md §4.4 R6
 * TechSpec:   docs/hrm/MOBILE_W7_TECHSPEC_DELTA.md §4.2 EmployeeDirectoryDetailScreen
 * Data:       docs/hrm/MOBILE_W7_DATA_CONTRACTS.md §5 detail · VAL-W7-DIR-01/03
 * Purpose:    Read-only colleague detail from view=directory; contact + work + attendance.
 * WorkItem:   PCOMP-W7-MOB-DIRECTORY
 * Coded:      2026-07-19
 *
 * Callers: RootNavigator TeamColleagueDetail
 * Callees: fetchEmployeeDirectoryDetail · mapColleagueDetailFields · QuickActionRow
 *
 * FE-Actions:
 *   | User action | Handler | Lib / RPC |
 *   |-------------|---------|-----------|
 *   | Open from row | load | GET /employees/:id?view=directory |
 *   | Pull refresh | load | same |
 *
 * Impact:     Missing fields / wrong id → AC-DIR-02 FAIL
 * must_keep:  read-only; no invent PII; hero + sections
 * SOLID:      Screen only — fetch/map helpers elsewhere
 * LastVerified: components/ui/__tests__/employeeDetailUx.test.ts
 */
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { TeamColleagueDetailShimmer } from '../../components/primitives/TeamColleagueDetailShimmer';
import { AppScreenLayout } from '../../components/ui/AppScreenLayout';
import { EmployeeHeroCard } from '../../components/ui/EmployeeHeroCard';
import { IconDetailRow } from '../../components/ui/IconDetailRow';
import { ProfileSectionCard } from '../../components/ui/ProfileSectionCard';
import { QuickActionRow } from '../../components/ui/QuickActionRow';
import { useAuth } from '../../context/AuthContext';
import { fetchEmployeeDirectoryDetail } from '../../integrations/hrmEmployeeDirectory';
import type { AttendanceStackParamList } from '../../navigation/types';
import { layout } from '../../theme/tokens';
import {
  buildColleagueQuickActions,
  mapColleagueDetailFields,
} from '../../utils/teamDirectoryDetail';

type Route = RouteProp<AttendanceStackParamList, 'TeamColleagueDetail'>;

export function TeamColleagueDetailScreen() {
  const auth = useAuth();
  const route = useRoute<Route>();
  const employeeId = route.params.employeeId.trim();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fields, setFields] = useState<ReturnType<typeof mapColleagueDetailFields> | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!employeeId) {
      setError('Thiếu mã nhân viên.');
      setFields(null);
      return;
    }
    const result = await fetchEmployeeDirectoryDetail(auth.getHrmAuth(), employeeId);
    if (!result.ok) {
      setError(result.message);
      setFields(null);
      setAvatarUrl(null);
      return;
    }
    setFields(mapColleagueDetailFields(result.row));
    setAvatarUrl(result.row.avatar_url ?? null);
    setError('');
  }, [auth, employeeId]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    void load().finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [load]);

  const quickActions = useMemo(
    () => (fields ? buildColleagueQuickActions(fields.phone, fields.email) : []),
    [fields],
  );

  return (
    <AppScreenLayout
      scroll
      grouped
      loading={false}
      error={error || undefined}
      onRefresh={load}
      refreshing={loading && !fields}
    >
      <View style={styles.root} testID="team-colleague-detail">
        {loading && !fields ? (
          <TeamColleagueDetailShimmer />
        ) : fields ? (
          <>
            <EmployeeHeroCard
              name={fields.name}
              subtitle={fields.heroSubtitle}
              avatarUrl={avatarUrl}
              baseUrl={auth.baseUrl}
              attendanceLabel={fields.attendanceLabel}
              attendanceTone={fields.attendanceTone}
              testID="employee-detail"
            />

            <QuickActionRow actions={quickActions} testID="team-colleague-quick-actions" />

            <View style={styles.sections}>
              <ProfileSectionCard
                title="Liên hệ"
                icon="call-outline"
                testID="team-colleague-section-contact"
              >
                <IconDetailRow icon="mail-outline" label="Email" value={fields.email} />
                <IconDetailRow icon="call-outline" label="Điện thoại" value={fields.phone} />
              </ProfileSectionCard>

              <ProfileSectionCard
                title="Công việc"
                icon="briefcase-outline"
                testID="team-colleague-section-work"
              >
                <IconDetailRow icon="id-card-outline" label="Mã nhân viên" value={fields.code} />
                <IconDetailRow icon="business-outline" label="Phòng ban" value={fields.department} />
                <IconDetailRow icon="person-outline" label="Chức danh" value={fields.jobTitle} />
                <IconDetailRow icon="pulse-outline" label="Trạng thái" value={fields.statusLabel} />
              </ProfileSectionCard>

              <ProfileSectionCard
                title="Chấm công hôm nay"
                icon="time-outline"
                testID="team-colleague-section-attendance"
              >
                <IconDetailRow
                  icon="log-in-outline"
                  label="Giờ chấm công"
                  value={fields.checkInAt}
                  numeric
                />
                <IconDetailRow
                  icon="checkmark-circle-outline"
                  label="Trạng thái chấm công"
                  value={fields.attendanceLabel}
                />
              </ProfileSectionCard>
            </View>
          </>
        ) : null}
      </View>
    </AppScreenLayout>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    gap: layout.sectionGap,
    paddingBottom: layout.screenPaddingBottom,
  },
  sections: {
    gap: layout.sectionGap,
    paddingHorizontal: layout.screenPaddingH,
  },
});
