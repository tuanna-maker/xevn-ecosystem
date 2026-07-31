/**
 * @CODE-MEMORY
 * Screen:     Tab Đội nhóm → TeamDirectory (list + search)
 * UC:         UC-HRM-MOB-16 (W7-5)
 * BR:         BR-DIR-01 · BR-DIR-03 · R1–R6
 * SRS:        docs/hrm/MOBILE_W7_SRS_DELTA.md §4.4
 * TechSpec:   docs/hrm/MOBILE_W7_TECHSPEC_DELTA.md §4.2 EmployeeDirectoryScreen · NFR-W7-04
 * Data:       docs/hrm/MOBILE_W7_DATA_CONTRACTS.md §5
 * Purpose:    Directory list grouped by department; search debounce 300ms;
 *             server `q` when ≥2 chars; row tap → TeamColleagueDetail; touch ≥44px.
 * WorkItem:   PCOMP-W7-MOB-DIRECTORY
 * Coded:      2026-07-19
 *
 * Callers: RootNavigator AttendanceStack TeamDirectory
 * Callees: loadTeamDirectoryWithAttendance · applyTeamDirectoryFilters (chips) · TeamDirectoryRow
 *
 * FE-Actions:
 *   | User action | Handler | Lib / RPC |
 *   |-------------|---------|-----------|
 *   | Open tab | load | GET /employees?view=directory |
 *   | Type search | debounce → load(q) + client filter | GET …&q= |
 *   | Tap row | goColleagueDetail | TeamColleagueDetail |
 *   | Chip filter | applyTeamDirectoryFilters | client |
 *
 * Impact:     Missing debounce/stale cancel → NFR-W7-04 FAIL; no detail nav → AC-DIR-02
 * must_keep:  empty «Không tìm thấy nhân viên»; search minHeight 44; status=active
 * SOLID:      Screen orchestration — fetch in hrmTeamDirectory
 * LastVerified: components/ui/__tests__/teamDirectoryUx.test.ts · hrmTeamDirectory.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-19 PCOMP-W7-MOB-DIRECTORY-SEARCH-01
 * What: Client accent-fold filter on debouncedSearch + chip counts from search set;
 *       dedicated useEffect reload on search (not only useFocusEffect).
 * Why: qa-device AC-DIR-01/R2 FAIL — input accepted but list/chip stayed Tất cả (213);
 *      empty copy never shown for ZzzNoMatch999 (server-only path lag/miss).
 * must_keep: leave-doc/bal, J-MOB-12, list→detail J-MOB-16/30 unchanged.
 *
 * @CODE-MEMORY-CHANGE 2026-07-28 PCOMP-W7-MOB-DIRECTORY-01
 * What: listCompanyId = resolveDirectoryQueryCompanyId (Plane B slug / main rollup).
 * Why: resolveHrmCompanyHeaderId sent LE UUID when companyId=main — dual-plane GWC.
 * must_keep: leave/auth; client fold search; J-MOB-16/30 detail nav.
 */
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, SectionList, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ListShimmerPlaceholder } from '../../components/primitives/ListShimmerPlaceholder';
import { FilterChipRow } from '../../components/ui/FilterChipRow';
import { TeamDirectoryRow } from '../../components/team/TeamDirectoryRow';
import { useAuth } from '../../context/AuthContext';
import { resolveDirectoryQueryCompanyId } from '../../integrations/companyWireScope';
import { loadTeamDirectoryWithAttendance } from '../../integrations/hrmTeamDirectory';
import { vi } from '../../i18n/vi';
import type { AttendanceStackParamList } from '../../navigation/types';
import { colors, layout, radius, spacing, typography } from '../../theme/tokens';
import {
  applyTeamDirectoryFilters,
  countTeamDirectoryFilterOptions,
  DIRECTORY_SEARCH_DEBOUNCE_MS,
  groupTeamDirectoryByDepartment,
  normalizeDirectorySearchQuery,
  type TeamDirectoryFilter,
  type TeamDirectoryMember,
} from '../../utils/teamDirectory';

const FILTER_OPTIONS: { key: TeamDirectoryFilter; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'checked_in', label: 'Đã chấm' },
  { key: 'off', label: 'Chưa chấm' },
];

/** SRS R2 empty copy */
const DIRECTORY_EMPTY_MSG = 'Không tìm thấy nhân viên';

export function TeamDirectoryScreen() {
  const auth = useAuth();
  const nav = useNavigation<NativeStackNavigationProp<AttendanceStackParamList>>();
  const [members, setMembers] = useState<TeamDirectoryMember[]>([]);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filter, setFilter] = useState<TeamDirectoryFilter>('all');
  const [todayLabel, setTodayLabel] = useState('');
  const loadGenRef = useRef(0);

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(normalizeDirectorySearchQuery(searchInput));
    }, DIRECTORY_SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [searchInput]);

  const load = useCallback(
    async (searchTerm: string) => {
      const gen = ++loadGenRef.current;
      const cfg = auth.getHrmAuth();
      // Plane B TEXT slug for directory query (API_DESIGN · dual-plane GWC) — not header UUID.
      const listCompanyId = resolveDirectoryQueryCompanyId({
        companyUuid: cfg.companyUuid,
        companyId: cfg.companyId || auth.companyId,
        accessToken: cfg.accessToken,
        memberships: cfg.memberships,
        employeeId: cfg.employeeId || auth.employeeId,
        tenantId: cfg.tenantId || auth.tenantId,
      });
      const attendanceCompanyId = auth.getAttendanceCompanyId();
      const eid = auth.employeeId.trim();

      if (!listCompanyId) {
        if (gen !== loadGenRef.current) return;
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
        search: searchTerm,
      });

      if (gen !== loadGenRef.current) return;

      setTodayLabel(result.date);
      if (result.ok) {
        setMembers(result.members);
        setErr('');
      } else {
        setMembers(result.members);
        setErr(result.message);
      }
    },
    [auth],
  );

  // AC-DIR-01 / R2 — reload on debounced search even when tab stays focused
  // (useFocusEffect alone was insufficient on device: list/chip never updated).
  useEffect(() => {
    let active = true;
    setLoading((prev) => (members.length === 0 ? true : prev));
    void load(debouncedSearch).finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
      loadGenRef.current += 1;
    };
    // members.length intentionally omitted — avoid reload loop after first paint
    // eslint-disable-next-line react-hooks/exhaustive-deps -- shimmer only when empty
  }, [load, debouncedSearch]);

  const debouncedSearchRef = useRef(debouncedSearch);
  debouncedSearchRef.current = debouncedSearch;

  useFocusEffect(
    useCallback(() => {
      let active = true;
      // Focus only — search reloads via useEffect above (avoid double cancel on each keystroke)
      void load(debouncedSearchRef.current).finally(() => {
        if (active) setLoading(false);
      });
      return () => {
        active = false;
        loadGenRef.current += 1;
      };
    }, [load]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load(debouncedSearch);
    } finally {
      setRefreshing(false);
    }
  }, [load, debouncedSearch]);

  // Client refine (accent-fold) + chips — guarantees AC-DIR-01/R2 before/without server `q`.
  const filtered = useMemo(
    () => applyTeamDirectoryFilters(members, filter, debouncedSearch),
    [members, filter, debouncedSearch],
  );

  const sections = useMemo(() => groupTeamDirectoryByDepartment(filtered), [filtered]);

  const counts = useMemo(
    () =>
      countTeamDirectoryFilterOptions(
        applyTeamDirectoryFilters(members, 'all', debouncedSearch),
      ),
    [members, debouncedSearch],
  );

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
          placeholderTextColor={colors.textMuted}
          value={searchInput}
          onChangeText={setSearchInput}
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
            {DIRECTORY_EMPTY_MSG}
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
    minHeight: 44,
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
    minHeight: 44,
  },
  checkInLinkText: {
    fontSize: typography.fontSize.callout,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
});
