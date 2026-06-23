import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

import { useFocusEffect, useNavigation } from '@react-navigation/native';

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react';

import { Alert, SectionList, StyleSheet, Text, View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Ionicons } from '@expo/vector-icons';

import { EmptyLeaveIllustration } from '../../components/ui/EmptyLeaveIllustration';

import { ListShimmerPlaceholder } from '../../components/primitives/ListShimmerPlaceholder';

import { ElevatedCard } from '../../components/ui/ElevatedCard';

import { EssRichListRow } from '../../components/ui/EssRichListRow';

import { LeaveBalanceHeader } from '../../components/ui/LeaveBalanceHeader';

import { SegmentedTabBar } from '../../components/ui/SegmentedTabBar';

import { SwipeableRow } from '../../components/ui/SwipeableRow';

import { useAuth } from '../../context/AuthContext';

import { useHrmRealtimeSummary } from '../../context/RealtimeContext';

import { readListRows } from '../../integrations/envelope';

import { fetchLeaveBalance, type LeaveBalancePayload } from '../../integrations/hrmLeaveBalance';

import { tryCancelLeaveRequest } from '../../integrations/leaveRequests';

import { hrmRequest } from '../../integrations/hrmApiClient';

import { formatHrmError } from '../../integrations/mapApiError';

import { resolveLeaveTypeLabel } from '../../i18n/leaveTypes';

import type { RequestsStackParamList } from '../../navigation/types';

import { groupedLayout } from '../../theme/groupedLayout';

import { resolveScrollPaddingBottom } from '../../theme/layoutInsets';

import { colors, spacing, typography } from '../../theme/tokens';

import { formatHrmDateRange } from '../../utils/formatHrm';

import { groupLeaveRowsBySubmissionDate } from '../../utils/leaveListGrouping';

import {
  handleLeaveSwipeAction,
  resolveLeaveListSwipeActions,
} from '../../utils/swipeRowActions';



type LeaveRow = {

  id: string;

  leave_type: string;

  start_date: string;

  end_date: string;

  status: string;

  employee_name: string | null;

  requested_at?: string | null;

  created_at?: string | null;

};



type MyLeavesTab = 'review' | 'approved' | 'rejected';



const TAB_OPTIONS: { key: MyLeavesTab; label: string; status: string }[] = [

  { key: 'review', label: 'Đang xét', status: 'pending' },

  { key: 'approved', label: 'Đã duyệt', status: 'approved' },

  { key: 'rejected', label: 'Từ chối', status: 'rejected' },

];



export function LeaveRequestsListScreen() {

  const auth = useAuth();

  const nav = useNavigation<NativeStackNavigationProp<RequestsStackParamList>>();

  const rtSummary = useHrmRealtimeSummary();

  const insets = useSafeAreaInsets();

  const tabBarHeight = useBottomTabBarHeight();

  const listScrollPaddingBottom = resolveScrollPaddingBottom(insets, tabBarHeight);



  const [rows, setRows] = useState<LeaveRow[]>([]);

  const [err, setErr] = useState('');

  const [tab, setTab] = useState<MyLeavesTab>('review');

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [balance, setBalance] = useState<LeaveBalancePayload | null>(null);

  const [balanceLoading, setBalanceLoading] = useState(false);

  const [balanceErr, setBalanceErr] = useState('');



  useLayoutEffect(() => {

    nav.setOptions({ title: 'Nghỉ phép của tôi' });

  }, [nav]);



  const activeStatus = TAB_OPTIONS.find((t) => t.key === tab)?.status ?? 'pending';



  const loadBalance = useCallback(async () => {

    const cid = auth.getLeaveBalanceQueryCompanyId();

    const eid = auth.employeeId.trim();

    if (!cid || !eid) {

      setBalance(null);

      setBalanceErr('');

      return;

    }

    setBalanceLoading(true);

    try {

      const res = await fetchLeaveBalance(auth.getHrmAuth(), {

        employeeId: eid,

        leaveType: 'annual',

      });

      if (res.ok) {

        setBalance(res.data);

        setBalanceErr('');

      } else {

        setBalance(null);

        setBalanceErr(res.message);

      }

    } finally {

      setBalanceLoading(false);

    }

  }, [auth]);



  const load = useCallback(async () => {

    const cid = auth.getLeaveBalanceQueryCompanyId();

    const eid = auth.employeeId.trim();

    if (!cid || !eid) {

      setErr('Cần phạm vi công ty và mã nhân viên.');

      setRows([]);

      return;

    }

    const q = new URLSearchParams({ company_id: cid, employee_id: eid, status: activeStatus });

    const res = await hrmRequest<unknown>(auth.getHrmAuth(), `/attendance/leave-requests?${q.toString()}`, {

      method: 'GET',

    });

    if (res.ok) {

      setRows(readListRows<LeaveRow>(res.data));

      setErr('');

    } else {

      setRows([]);

      setErr(formatHrmError(res));

    }

  }, [auth, activeStatus]);



  const refresh = useCallback(async () => {

    setRefreshing(true);

    try {

      await Promise.all([load(), loadBalance()]);

    } finally {

      setRefreshing(false);

      setLoading(false);

    }

  }, [load, loadBalance]);



  useFocusEffect(

    useCallback(() => {

      setLoading(true);

      void refresh();

    }, [refresh]),

  );



  React.useEffect(() => {

    setLoading(true);

    void refresh();

  }, [tab, refresh]);



  useFocusEffect(

    useCallback(() => {

      if (rtSummary.includes('leave_request')) void refresh();

    }, [rtSummary, refresh]),

  );



  const sections = useMemo(() => groupLeaveRowsBySubmissionDate(rows), [rows]);



  const goCreate = () => nav.navigate('CreateLeaveRequest');



  const goDetail = useCallback(

    (id: string) => nav.navigate('LeaveRequestDetail', { id }),

    [nav],

  );



  const handleCancelLeave = useCallback(

    async (id: string) => {

      const result = await tryCancelLeaveRequest(auth.getHrmAuth(), id);

      Alert.alert('Hủy đơn nghỉ', result.message);

    },

    [auth],

  );



  const listFooter =

    rows.length === 0 && !err && !loading ? (

      <View style={styles.emptyWrap}>

        <EmptyLeaveIllustration compact onCtaPress={goCreate} />

      </View>

    ) : null;



  const headerBlock = (

    <>

      <LeaveBalanceHeader balance={balance} loading={balanceLoading} error={balanceErr} />

      <View style={styles.tabWrap}>

        <SegmentedTabBar value={tab} options={TAB_OPTIONS} onChange={setTab} />

      </View>

    </>

  );



  if (loading && rows.length === 0 && !err) {

    return (

      <View
        testID="leave-requests-list-screen"
        style={[styles.root, { paddingBottom: tabBarHeight }]}
      >

        {headerBlock}

        <ListShimmerPlaceholder testID="leave-list-shimmer" />

      </View>

    );

  }



  return (

    <View
      testID="leave-requests-list-screen"
      style={[styles.root, { paddingBottom: tabBarHeight }]}
    >

      {headerBlock}



      {err ? (

        <View style={styles.errWrap}>

          <View style={styles.errorBanner}>

            <Text style={styles.errorText}>{err}</Text>

          </View>

        </View>

      ) : null}



      <SectionList

        sections={sections}

        keyExtractor={(item) => item.id}

        contentContainerStyle={[styles.list, { paddingBottom: listScrollPaddingBottom }]}

        refreshing={refreshing}

        onRefresh={() => void refresh()}

        stickySectionHeadersEnabled={false}

        renderSectionHeader={({ section }) => (

          <View style={styles.sectionHeaderRow}>

            <Ionicons name="calendar-outline" size={18} color={colors.primary} />

            <Text style={styles.sectionHeader}>{section.title}</Text>

          </View>

        )}

        renderItem={({ item }) => {

          const swipeSpecs = resolveLeaveListSwipeActions(tab, item.status);

          return (

            <SwipeableRow

              testID={`leave-swipe-${item.id}`}

              actions={swipeSpecs.map((spec) => ({

                ...spec,

                onPress: () =>

                  handleLeaveSwipeAction(spec.kind, {

                    onDetail: () => goDetail(item.id),

                    onCancel: () => void handleCancelLeave(item.id).catch(() => undefined),

                  }),

              }))}

            >

              <ElevatedCard style={styles.listRow}>

                <EssRichListRow

                  icon="calendar"

                  iconTone={

                    item.status === 'approved' ? 'success' : item.status === 'rejected' ? 'warning' : 'primary'

                  }

                  title={resolveLeaveTypeLabel(item.leave_type)}

                  subtitle={formatHrmDateRange(item.start_date, item.end_date)}

                  status={item.status}

                  onPress={() => goDetail(item.id)}

                />

              </ElevatedCard>

            </SwipeableRow>

          );

        }}

        ListEmptyComponent={!err ? listFooter : null}

        ListFooterComponent={rows.length > 0 ? <View style={styles.footerSpacer} /> : null}

      />

    </View>

  );

}



const styles = StyleSheet.create({

  root: { flex: 1, backgroundColor: colors.iosGroupedBackground },

  tabWrap: {
    paddingHorizontal: spacing.md,
    marginTop: groupedLayout.belowBalanceCards,
    marginBottom: spacing.xs,
  },

  sectionHeaderRow: {

    flexDirection: 'row',

    alignItems: 'center',

    gap: spacing.sm,

    marginTop: spacing.sm,

    marginBottom: spacing.xs,

    paddingHorizontal: spacing.md,

  },

  sectionHeader: {

    fontSize: typography.fontSize.title2,

    fontWeight: typography.fontWeight.semibold,

    color: colors.textSecondary,

    lineHeight: typography.lineHeight.title2,

  },

  errWrap: { paddingHorizontal: spacing.md, paddingBottom: spacing.sm },

  errorBanner: {

    backgroundColor: '#FEE2E2',

    borderRadius: 12,

    borderWidth: 1,

    borderColor: '#FCA5A5',

    padding: spacing.md,

  },

  errorText: {

    color: '#991B1B',

    fontSize: typography.fontSize.subhead,

    fontWeight: typography.fontWeight.semibold,

    lineHeight: typography.lineHeight.subhead,

  },

  list: {

    paddingHorizontal: spacing.md,

    paddingTop: groupedLayout.listSectionTop,

    flexGrow: 1,

  },

  listRow: { marginBottom: spacing.sm },

  emptyWrap: { paddingVertical: groupedLayout.emptyVertical },

  footerSpacer: { height: spacing.xl },

});


