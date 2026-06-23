import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';
import { ListShimmerPlaceholder } from '../../components/primitives/ListShimmerPlaceholder';
import { AppScreenLayout } from '../../components/ui/AppScreenLayout';
import { ElevatedCard } from '../../components/ui/ElevatedCard';
import { EmptyStateIllustration } from '../../components/ui/EmptyStateIllustration';
import { EssRichListRow } from '../../components/ui/EssRichListRow';
import { useAuth } from '../../context/AuthContext';
import { hrmRequest } from '../../integrations/hrmApiClient';
import { formatHrmError } from '../../integrations/mapApiError';
import { vi } from '../../i18n/vi';
import type { ProfileStackParamList } from '../../navigation/types';
import { groupedLayout } from '../../theme/groupedLayout';
import { radius, spacing } from '../../theme/tokens';
import {
  mapInboxToHomeTask,
  type HomeTaskNav,
  type InboxHubRow,
} from '../../utils/dashboardHub';
import {
  resolveInboxNotificationCopy,
  type InboxNotificationRow,
} from '../../utils/inboxNotificationCopy';

type ProfileNav = NativeStackNavigationProp<ProfileStackParamList, 'Notifications'>;

function navigateInboxTask(
  nav: ProfileNav,
  target: HomeTaskNav,
): void {
  switch (target.target) {
    case 'LeaveRequestDetail':
      nav.navigate('LeaveRequestDetail', { id: target.id });
      break;
    case 'UpdateRequestDetail':
      nav.navigate('UpdateRequestDetail', { id: target.id });
      break;
    case 'ManagerApprovals':
      nav.navigate('ManagerApprovals');
      break;
    case 'LeaveRequestsList':
      nav.navigate('LeaveRequestsList');
      break;
    case 'UpdateRequests':
      nav.navigate('UpdateRequests');
      break;
    case 'PayslipList':
      nav.getParent()?.navigate('TabPayslip', { screen: 'PayslipList' });
      break;
    case 'Operations':
      nav.navigate('Operations');
      break;
    case 'InAppNotifications':
      break;
    default:
      break;
  }
}

export function InAppNotificationsScreen() {
  const auth = useAuth();
  const nav = useNavigation<ProfileNav>();
  const [rows, setRows] = useState<InboxNotificationRow[]>([]);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setErr('');
    const cid = auth.getAttendanceCompanyId();
    const eid = auth.employeeId.trim();
    if (!cid || !eid) {
      setRows([]);
      setErr('Không thể tải thông báo. Vui lòng đăng nhập lại.');
      return;
    }

    const inbox = await hrmRequest<{ total: number; data: InboxNotificationRow[] }>(
      auth.getHrmAuth(),
      `/notifications/inbox?${new URLSearchParams({ company_id: cid, employee_id: eid, limit: '50' }).toString()}`,
      { method: 'GET' },
    );

    if (!inbox.ok) {
      setRows([]);
      setErr(formatHrmError(inbox));
      return;
    }

    setRows(inbox.data.data ?? []);
  }, [auth]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      void load().finally(() => setLoading(false));
    }, [load]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  const markRead = useCallback(
    async (row: InboxNotificationRow) => {
      const cid = auth.getAttendanceCompanyId();
      const eid = auth.employeeId.trim();
      if (!cid || !eid || row.read_at) return;
      const res = await hrmRequest<unknown>(
        auth.getHrmAuth(),
        `/notifications/inbox/${row.id}/read?${new URLSearchParams({ company_id: cid }).toString()}`,
        { method: 'PATCH', body: JSON.stringify({ viewer_employee_id: eid }) },
      );
      if (res.ok) {
        setRows((prev) =>
          prev.map((item) =>
            item.id === row.id ? { ...item, read_at: new Date().toISOString() } : item,
          ),
        );
      } else {
        Alert.alert(vi.error, formatHrmError(res));
      }
    },
    [auth],
  );

  const onRowPress = useCallback(
    (row: InboxNotificationRow) => {
      void markRead(row);
      const hubRow: InboxHubRow = row;
      const task = mapInboxToHomeTask(hubRow, auth.isManager);
      if (task?.navigate) {
        navigateInboxTask(nav, task.navigate);
      }
    },
    [auth.isManager, markRead, nav],
  );

  const renderRow = useCallback(
    ({ item }: { item: InboxNotificationRow }) => {
      const copy = resolveInboxNotificationCopy(item, auth.isManager);
      return (
        <ElevatedCard style={styles.rowCard}>
          <EssRichListRow
            icon={copy.icon}
            iconTone={copy.iconTone}
            title={copy.title}
            subtitle={`${copy.subtitle}\n${copy.timeLabel}`}
            status="neutral"
            statusLabel={copy.readLabel}
            statusTone={copy.readTone}
            onPress={() => onRowPress(item)}
            testID={`inbox-row-${item.id}`}
          />
        </ElevatedCard>
      );
    },
    [auth.isManager, onRowPress],
  );

  const empty = !loading && rows.length === 0 && !err;

  return (
    <AppScreenLayout
      title={vi.notifications}
      stackHeaderPresent
      grouped
      scroll={false}
      loading={loading}
      error={err || undefined}
      onRefresh={onRefresh}
      refreshing={refreshing}
    >
      {loading && rows.length === 0 ? (
        <ListShimmerPlaceholder count={5} />
      ) : empty ? (
        <View style={styles.emptyWrap}>
          <EmptyStateIllustration
            title="Chưa có thông báo"
            hint="Kéo xuống để làm mới."
            icon="notifications-outline"
            testID="inbox-empty-state"
          />
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => item.id}
          renderItem={renderRow}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListFooterComponent={<View style={styles.footerSpacer} />}
          refreshing={refreshing}
          onRefresh={() => void onRefresh()}
        />
      )}
    </AppScreenLayout>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingTop: groupedLayout.listSectionTop,
    paddingHorizontal: spacing.md,
  },
  rowCard: {
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  separator: {
    height: spacing.sm,
  },
  emptyWrap: {
    paddingVertical: groupedLayout.emptyVertical,
  },
  footerSpacer: {
    height: spacing.xl,
  },
});
