import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { ListShimmerPlaceholder } from '../../components/primitives/ListShimmerPlaceholder';
import { ElevatedCard } from '../../components/ui/ElevatedCard';
import { EmptyStateIllustration } from '../../components/ui/EmptyStateIllustration';
import { EssRichListRow } from '../../components/ui/EssRichListRow';
import { FormField } from '../../components/ui/FormField';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { SegmentedTabBar } from '../../components/ui/SegmentedTabBar';
import { useAuth } from '../../context/AuthContext';
import { useOfflineWriteGuard } from '../../hooks/useOfflineWriteGuard';
import { readListRows } from '../../integrations/envelope';
import { hrmRequest } from '../../integrations/hrmApiClient';
import { formatHrmError, statusLabel } from '../../integrations/mapApiError';
import { vi } from '../../i18n/vi';
import { colors, radius, spacing, statusToneColor, typography } from '../../theme/tokens';
import { formatHrmDate } from '../../utils/formatHrm';
import { userFacingScopeError } from '../../utils/scopeError';
import {
  resolveOpsPriorityLabel,
  resolveServiceTypeLabel,
  resolveTaskStatusLabel,
} from '../../utils/operationsLabels';

type Task = {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  due_date: string | null;
};

type Svc = {
  id: string;
  service_type: string;
  employee_name: string;
  status: string;
  request_date: string;
};

type Tab = 'tasks' | 'services';

export function OperationsScreen() {
  const auth = useAuth();
  const blockIfOffline = useOfflineWriteGuard();
  const [tab, setTab] = useState<Tab>('tasks');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [services, setServices] = useState<Svc[]>([]);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newTitle, setNewTitle] = useState('Việc từ mobile');
  const [busy, setBusy] = useState(false);

  const cid = auth.getAttendanceCompanyId();

  const load = useCallback(async () => {
    if (!cid) {
      setErr(userFacingScopeError('company'));
      setTasks([]);
      setServices([]);
      return;
    }
    const tq = new URLSearchParams({ company_id: cid, page: '1', page_size: '30' });
    const [tRes, sRes] = await Promise.all([
      hrmRequest<unknown>(auth.getHrmAuth(), `/operations/tasks?${tq.toString()}`, { method: 'GET' }),
      hrmRequest<unknown>(
        auth.getHrmAuth(),
        `/operations/service-requests?${new URLSearchParams({ company_id: cid }).toString()}`,
        { method: 'GET' },
      ),
    ]);
    const parts: string[] = [];
    if (tRes.ok) setTasks(readListRows<Task>(tRes.data));
    else {
      setTasks([]);
      parts.push(`Tasks: ${formatHrmError(tRes)}`);
    }
    if (sRes.ok) setServices(readListRows<Svc>(sRes.data));
    else {
      setServices([]);
      parts.push(`Dịch vụ: ${formatHrmError(sRes)}`);
    }
    setErr(parts.join('\n'));
  }, [auth, cid]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      void refresh();
    }, [refresh]),
  );

  const createTask = async () => {
    const off = blockIfOffline();
    if (off) {
      Alert.alert(vi.error, `${off}`);
      return;
    }
    if (!cid) return;
    setBusy(true);
    try {
      const res = await hrmRequest<unknown>(auth.getHrmAuth(), '/operations/tasks', {
        method: 'POST',
        body: JSON.stringify({
          company_id: cid,
          title: newTitle.trim() || 'Task',
          priority: 'medium',
        }),
      });
      if (res.ok) {
        setNewTitle('Việc từ mobile');
        void load();
      } else Alert.alert(vi.error, formatHrmError(res));
    } finally {
      setBusy(false);
    }
  };

  const patchTaskDone = async (taskId: string) => {
    const off = blockIfOffline();
    if (off) {
      Alert.alert(vi.error, `${off}`);
      return;
    }
    const res = await hrmRequest<unknown>(auth.getHrmAuth(), `/operations/tasks/${taskId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'done' }),
    });
    if (res.ok) void load();
    else Alert.alert(vi.error, formatHrmError(res));
  };

  const decideService = async (requestId: string, kind: 'approve' | 'reject') => {
    const off = blockIfOffline();
    if (off) {
      Alert.alert(vi.error, `${off}`);
      return;
    }
    const path =
      kind === 'approve'
        ? `/operations/service-requests/${requestId}/approve`
        : `/operations/service-requests/${requestId}/reject`;
    const res = await hrmRequest<unknown>(auth.getHrmAuth(), path, {
      method: 'POST',
      body: JSON.stringify(
        kind === 'approve'
          ? { approved_by: 'Mobile Ops' }
          : { approved_by: 'Mobile Ops', rejected_reason: 'Từ chối mobile' },
      ),
    });
    if (res.ok) void load();
    else Alert.alert(vi.error, formatHrmError(res));
  };

  const listHeader = (
    <View style={styles.headerBlock}>
      <Text style={styles.headerTitle}>{vi.operations}</Text>
      <Text style={styles.headerSub}>Quản lý việc và yêu cầu dịch vụ</Text>

      {err ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{err}</Text>
        </View>
      ) : null}

      <SegmentedTabBar
        value={tab}
        options={[
          { key: 'tasks', label: 'Việc' },
          { key: 'services', label: 'Yêu cầu DV' },
        ]}
        onChange={setTab}
      />

      {tab === 'tasks' ? (
        <ElevatedCard style={styles.createBox}>
          <FormField label="Tạo việc nhanh" value={newTitle} onChangeText={setNewTitle} />
          <PrimaryButton
            label={busy ? vi.loading : 'Thêm task'}
            onPress={() => void createTask()}
            disabled={busy}
            loading={busy}
            size="sm"
          />
        </ElevatedCard>
      ) : null}
    </View>
  );

  if (loading && tasks.length === 0 && services.length === 0 && !err) {
    return (
      <View style={styles.root}>
        {listHeader}
        <ListShimmerPlaceholder testID="operations-list-shimmer" />
      </View>
    );
  }

  if (tab === 'tasks') {
    return (
      <View style={styles.root}>
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshing={refreshing}
          onRefresh={() => void refresh()}
          ListHeaderComponent={listHeader}
          renderItem={({ item }) => (
            <ElevatedCard style={styles.rowCard}>
              <EssRichListRow
                icon="checkbox-outline"
                iconTone={item.status === 'done' ? 'success' : 'primary'}
                title={item.title}
                subtitle={`${resolveTaskStatusLabel(item.status)} · ${resolveOpsPriorityLabel(item.priority)}${
                  item.due_date ? ` · hạn ${formatHrmDate(item.due_date)}` : ''
                }`}
                status={item.status}
                statusLabel={resolveTaskStatusLabel(item.status)}
                actions={
                  item.status !== 'done' ? (
                    <PrimaryButton
                      label="Xong"
                      onPress={() => void patchTaskDone(item.id)}
                      size="sm"
                      variant="secondary"
                    />
                  ) : undefined
                }
              />
            </ElevatedCard>
          )}
          ListEmptyComponent={
            !err ? (
              <EmptyStateIllustration
                testID="operations-tasks-empty"
                title="Không có task"
                hint="Tạo việc mới hoặc kéo xuống để làm mới."
                icon="list-outline"
              />
            ) : null
          }
        />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshing={refreshing}
        onRefresh={() => void refresh()}
        ListHeaderComponent={listHeader}
        renderItem={({ item }) => (
          <ElevatedCard style={styles.rowCard}>
            <EssRichListRow
              icon="construct"
              iconTone={item.status === 'approved' ? 'success' : item.status === 'rejected' ? 'warning' : 'accent'}
              title={resolveServiceTypeLabel(item.service_type)}
              subtitle={`${item.employee_name} · ${formatHrmDate(item.request_date)}`}
              status={item.status}
              statusLabel={statusLabel(item.status)}
              actions={
                item.status === 'pending' ? (
                  <View style={styles.actionRow}>
                    <PrimaryButton
                      label="Duyệt"
                      onPress={() => void decideService(item.id, 'approve')}
                      size="sm"
                    />
                    <PrimaryButton
                      label="Từ chối"
                      onPress={() => void decideService(item.id, 'reject')}
                      size="sm"
                      variant="danger"
                    />
                  </View>
                ) : undefined
              }
            />
          </ElevatedCard>
        )}
        ListEmptyComponent={
          !err ? (
            <EmptyStateIllustration
              testID="operations-services-empty"
              title="Không có yêu cầu"
              hint="Kéo xuống để làm mới."
              icon="construct-outline"
            />
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.iosGroupedBackground },
  headerBlock: { gap: spacing.sm, marginBottom: spacing.sm },
  headerTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  headerSub: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  errorBanner: {
    backgroundColor: statusToneColor('danger').bg,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: statusToneColor('danger').border,
    padding: spacing.md,
  },
  errorText: {
    color: statusToneColor('danger').text,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  createBox: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  list: { padding: spacing.md, paddingBottom: spacing.xl },
  rowCard: { marginBottom: spacing.sm },
  actionRow: { flexDirection: 'row', gap: spacing.sm, flex: 1 },
});
