import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useOfflineWriteGuard } from '../../hooks/useOfflineWriteGuard';
import { readListRows } from '../../integrations/envelope';
import { hrmRequest } from '../../integrations/hrmApiClient';
import { formatHrmError } from '../../integrations/mapApiError';
import { vi } from '../../i18n/vi';

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
  const [refreshing, setRefreshing] = useState(false);
  const [newTitle, setNewTitle] = useState('Việc từ mobile');
  const [busy, setBusy] = useState(false);

  const cid = auth.getAttendanceCompanyId();

  const load = useCallback(async () => {
    if (!cid) {
      setErr('Cần UUID công ty (operations).');
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

  useFocusEffect(
    useCallback(() => {
      void load();
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

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>UC-HRM-MOB-11 — {vi.operations}</Text>
      {err ? <Text style={styles.err}>{err}</Text> : null}
      <View style={styles.tabs}>
        <Pressable style={[styles.tab, tab === 'tasks' && styles.tabOn]} onPress={() => setTab('tasks')}>
          <Text style={[styles.tabText, tab === 'tasks' && styles.tabTextOn]}>Việc</Text>
        </Pressable>
        <Pressable style={[styles.tab, tab === 'services' && styles.tabOn]} onPress={() => setTab('services')}>
          <Text style={[styles.tabText, tab === 'services' && styles.tabTextOn]}>Yêu cầu DV</Text>
        </Pressable>
      </View>

      {tab === 'tasks' ? (
        <>
          <Text style={styles.label}>Tạo việc nhanh</Text>
          <TextInput style={styles.input} value={newTitle} onChangeText={setNewTitle} placeholderTextColor="#64748b" />
          <Pressable style={styles.btn} onPress={() => void createTask()} disabled={busy}>
            <Text style={styles.btnText}>{busy ? vi.loading : 'Thêm task'}</Text>
          </Pressable>
          <FlatList
            style={{ flex: 1 }}
            data={tasks}
            keyExtractor={(item) => item.id}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} tintColor="#38bdf8" />}
            renderItem={({ item }) => (
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.main}>{item.title}</Text>
                  <Text style={styles.sub}>
                    {item.status} · {item.priority}
                    {item.due_date ? ` · hạn ${item.due_date}` : ''}
                  </Text>
                </View>
                {item.status !== 'done' ? (
                  <Pressable style={styles.smallBtn} onPress={() => void patchTaskDone(item.id)}>
                    <Text style={styles.smallBtnText}>Xong</Text>
                  </Pressable>
                ) : null}
              </View>
            )}
            ListEmptyComponent={<Text style={styles.empty}>Không có task</Text>}
          />
        </>
      ) : (
        <FlatList
          style={{ flex: 1 }}
          data={services}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} tintColor="#38bdf8" />}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.main}>{item.service_type}</Text>
                <Text style={styles.sub}>
                  {item.employee_name} · {item.request_date} · {item.status}
                </Text>
              </View>
              {item.status === 'pending' ? (
                <View style={{ gap: 6 }}>
                  <Pressable style={styles.approve} onPress={() => void decideService(item.id, 'approve')}>
                    <Text style={styles.approveTx}>OK</Text>
                  </Pressable>
                  <Pressable style={styles.reject} onPress={() => void decideService(item.id, 'reject')}>
                    <Text style={styles.rejectTx}>No</Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>Không có yêu cầu</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#0f172a', padding: 16 },
  title: { color: '#f8fafc', fontSize: 18, fontWeight: '700', marginBottom: 8 },
  err: { color: '#f87171', marginBottom: 8, fontSize: 13 },
  tabs: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
  },
  tabOn: { borderColor: '#38bdf8', backgroundColor: '#0c4a6e' },
  tabText: { color: '#94a3b8', fontWeight: '600' },
  tabTextOn: { color: '#e0f2fe' },
  label: { color: '#94a3b8', fontSize: 12, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    padding: 10,
    color: '#f8fafc',
    marginBottom: 8,
  },
  btn: {
    backgroundColor: '#0ea5e9',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  btnText: { color: '#0f172a', fontWeight: '700' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    gap: 8,
  },
  main: { color: '#e2e8f0', fontSize: 15 },
  sub: { color: '#94a3b8', fontSize: 12, marginTop: 2 },
  empty: { color: '#64748b', marginTop: 16 },
  smallBtn: { backgroundColor: '#334155', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  smallBtnText: { color: '#e2e8f0', fontSize: 12, fontWeight: '700' },
  approve: { backgroundColor: '#059669', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  approveTx: { color: '#ecfdf5', fontSize: 11, fontWeight: '700' },
  reject: { backgroundColor: '#7f1d1d', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  rejectTx: { color: '#fecaca', fontSize: 11, fontWeight: '700' },
});
