import { useFocusEffect, useNavigation } from '@react-navigation/native';

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import React, { useCallback, useMemo, useState } from 'react';

import { Pressable, SectionList, StyleSheet, Text, TextInput, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { ListShimmerPlaceholder } from '../../components/primitives/ListShimmerPlaceholder';

import { FilterChipRow } from '../../components/ui/FilterChipRow';

import { TeamDirectoryRow } from '../../components/team/TeamDirectoryRow';

import { useAuth } from '../../context/AuthContext';

import { resolveHrmCompanyHeaderId } from '../../integrations/hrmApiClient';

import { loadTeamDirectoryWithAttendance } from '../../integrations/hrmTeamDirectory';

import { vi } from '../../i18n/vi';

import type { AttendanceStackParamList } from '../../navigation/types';

import { colors, layout, radius, spacing, typography } from '../../theme/tokens';

import {

  applyTeamDirectoryFilters,

  countTeamDirectoryFilterOptions,

  groupTeamDirectoryByDepartment,

  type TeamDirectoryFilter,

  type TeamDirectoryMember,

} from '../../utils/teamDirectory';



const FILTER_OPTIONS: { key: TeamDirectoryFilter; label: string }[] = [

  { key: 'all', label: 'Tất cả' },

  { key: 'checked_in', label: 'Đã chấm' },

  { key: 'off', label: 'Chưa chấm' },

];



export function TeamDirectoryScreen() {

  const auth = useAuth();

  const nav = useNavigation<NativeStackNavigationProp<AttendanceStackParamList>>();

  const [members, setMembers] = useState<TeamDirectoryMember[]>([]);

  const [err, setErr] = useState('');

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState('');

  const [filter, setFilter] = useState<TeamDirectoryFilter>('all');

  const [todayLabel, setTodayLabel] = useState('');



  const load = useCallback(async () => {

    const cfg = auth.getHrmAuth();

    const listCompanyId =

      resolveHrmCompanyHeaderId(cfg.companyUuid, cfg.companyId) || auth.companyId.trim();

    const attendanceCompanyId = auth.getAttendanceCompanyId();

    const eid = auth.employeeId.trim();



    if (!listCompanyId) {

      setErr('Cần phạm vi công ty.');

      setMembers([]);

      return;

    }



    const result = await loadTeamDirectoryWithAttendance({

      auth: cfg,

      listCompanyId,

      attendanceCompanyId,

      isManager: auth.isManager,

      employeeId: eid,

    });



    setTodayLabel(result.date);

    if (result.ok) {

      setMembers(result.members);

      setErr('');

    } else {

      setMembers(result.members);

      setErr(result.message);

    }

  }, [auth]);



  useFocusEffect(

    useCallback(() => {

      let active = true;

      const shouldShowLoader = members.length === 0;

      if (shouldShowLoader) setLoading(true);

      void load().finally(() => {

        if (active && shouldShowLoader) setLoading(false);

      });

      return () => {

        active = false;

      };

    }, [load, members.length]),

  );



  const onRefresh = useCallback(async () => {

    setRefreshing(true);

    try {

      await load();

    } finally {

      setRefreshing(false);

    }

  }, [load]);



  const filtered = useMemo(

    () => applyTeamDirectoryFilters(members, filter, search),

    [members, filter, search],

  );



  const sections = useMemo(() => groupTeamDirectoryByDepartment(filtered), [filtered]);



  const counts = useMemo(() => countTeamDirectoryFilterOptions(members), [members]);



  const chipOptions = useMemo(

    () =>

      FILTER_OPTIONS.map((opt) => ({

        ...opt,

        count: counts[opt.key],

      })),

    [counts],

  );



  const goCheckIn = () => nav.navigate('CheckIn');



  const goColleagueDetail = useCallback(

    (employeeId: string) => {

      const id = employeeId.trim();

      if (!id) return;

      nav.navigate('TeamColleagueDetail', { employeeId: id });

    },

    [nav],

  );



  const listHeader = (

    <View style={styles.headerBlock}>

      <View style={styles.searchWrap}>

        <Ionicons name="search-outline" size={20} color={colors.textSecondary} style={styles.searchIcon} />

        <TextInput

          testID="team-directory-search"

          accessibilityLabel="Tìm kiếm nhân viên"

          placeholder="Tìm theo tên, mã, phòng ban…"

          placeholderTextColor={colors.neutral}

          value={search}

          onChangeText={setSearch}

          style={styles.searchInput}

          returnKeyType="search"

          clearButtonMode="while-editing"

        />

      </View>

      <FilterChipRow value={filter} options={chipOptions} onChange={setFilter} />

      {todayLabel ? (

        <Text style={styles.dateHint} testID="team-directory-date">

          Trạng thái chấm công hôm nay ({todayLabel})

        </Text>

      ) : null}

      {err && filtered.length === 0 ? (

        <Text style={styles.errorText} testID="team-directory-error">

          {err}

        </Text>

      ) : null}

    </View>

  );



  if (loading && members.length === 0) {

    return (

      <View style={styles.root} testID="team-directory-screen">

        {listHeader}

        <ListShimmerPlaceholder count={8} />

      </View>

    );

  }



  return (

    <View style={styles.root} testID="team-directory-screen">

      <SectionList

        sections={sections}

        keyExtractor={(item) => item.employee.id}

        contentContainerStyle={styles.listContent}

        ListHeaderComponent={listHeader}

        stickySectionHeadersEnabled

        ListEmptyComponent={

          <Text style={styles.emptyText} testID="team-directory-empty">

            {search.trim() ? 'Không có kết quả phù hợp.' : 'Chưa có nhân viên trong danh sách.'}

          </Text>

        }

        renderSectionHeader={({ section }) => (

          <View style={styles.sectionHeaderWrap} testID={`team-directory-section-${section.title}`}>

            <View style={[styles.sectionStrip, { backgroundColor: section.colorStrip }]} />

            <Text style={styles.sectionHeader}>{section.title}</Text>

            <Text style={styles.sectionCount}>{section.data.length}</Text>

          </View>

        )}

        renderItem={({ item, index, section }) => (

          <TeamDirectoryRow

            member={item}

            baseUrl={auth.baseUrl}

            deptColorStrip={section.colorStrip}

            testID={`team-directory-row-${section.title}-${index}`}

            onPress={() => goColleagueDetail(item.employee.id)}

          />

        )}

        ItemSeparatorComponent={() => <View style={styles.separator} />}

        SectionSeparatorComponent={() => <View style={styles.sectionGap} />}

        refreshing={refreshing}

        onRefresh={() => void onRefresh()}

      />

      <Pressable

        testID="team-directory-checkin-link"

        accessibilityRole="button"

        accessibilityLabel={vi.attendance}

        onPress={goCheckIn}

        style={styles.checkInLink}

      >

        <Ionicons name="time-outline" size={18} color={colors.primary} />

        <Text style={styles.checkInLinkText}>Chấm công của tôi</Text>

      </Pressable>

    </View>

  );

}



const styles = StyleSheet.create({

  root: {

    flex: 1,

    backgroundColor: colors.iosGroupedBackground,

  },

  listContent: {

    paddingHorizontal: layout.screenPaddingH,

    paddingBottom: layout.screenPaddingH + 48,

  },

  headerBlock: {

    gap: spacing.sm,

    paddingTop: spacing.sm,

    paddingBottom: spacing.md,

  },

  searchWrap: {

    flexDirection: 'row',

    alignItems: 'center',

    backgroundColor: colors.surface,

    borderRadius: radius.md,

    borderWidth: 1,

    borderColor: colors.border,

    paddingHorizontal: spacing.sm,

    minHeight: 44,

  },

  searchIcon: {

    marginRight: spacing.xs,

  },

  searchInput: {

    flex: 1,

    fontSize: typography.fontSize.body,

    color: colors.text,

    paddingVertical: spacing.sm,

  },

  dateHint: {

    fontSize: typography.fontSize.footnote,

    color: colors.textSecondary,

    lineHeight: typography.lineHeight.footnote,

  },

  errorText: {

    fontSize: typography.fontSize.callout,

    color: colors.danger,

  },

  emptyText: {

    fontSize: typography.fontSize.body,

    color: colors.textSecondary,

    textAlign: 'center',

    paddingVertical: spacing.xl,

  },

  sectionHeaderWrap: {

    flexDirection: 'row',

    alignItems: 'center',

    gap: spacing.sm,

    paddingTop: spacing.md,

    paddingBottom: spacing.xs,

    backgroundColor: colors.iosGroupedBackground,

  },

  sectionStrip: {

    width: 4,

    height: 18,

    borderRadius: 2,

  },

  sectionHeader: {

    flex: 1,

    fontSize: typography.fontSize.title2,

    fontWeight: typography.fontWeight.semibold,

    color: colors.text,

    lineHeight: typography.lineHeight.title2,

  },

  sectionCount: {

    fontSize: typography.fontSize.footnote,

    fontWeight: typography.fontWeight.semibold,

    color: colors.textSecondary,

    lineHeight: typography.lineHeight.footnote,

  },

  separator: {

    height: spacing.sm,

  },

  sectionGap: {

    height: spacing.xs,

  },

  checkInLink: {

    position: 'absolute',

    bottom: spacing.md,

    alignSelf: 'center',

    flexDirection: 'row',

    alignItems: 'center',

    gap: spacing.xs,

    backgroundColor: colors.surface,

    borderRadius: radius.full,

    borderWidth: 1,

    borderColor: colors.border,

    paddingHorizontal: spacing.md,

    paddingVertical: spacing.sm,

  },

  checkInLinkText: {

    fontSize: typography.fontSize.callout,

    fontWeight: typography.fontWeight.semibold,

    color: colors.primary,

  },

});

