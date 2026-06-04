import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useLayoutEffect, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useHrmRealtimeSummary } from '../../context/RealtimeContext';
import { readListRows } from '../../integrations/envelope';
import { hrmRequest } from '../../integrations/hrmApiClient';
import { formatHrmError, statusLabel } from '../../integrations/mapApiError';
import { vi } from '../../i18n/vi';
import type { RequestsStackParamList } from '../../navigation/types';

type LeaveRow = {
  id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  status: string;
  employee_name: string | null;
};

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

export function LeaveRequestsListScreen() {
  const auth = useAuth();
  const nav = useNavigation<NativeStackNavigationProp<RequestsStackParamList>>();
  const rtSummary = useHrmRealtimeSummary();
  const [rows, setRows] = useState<LeaveRow[]>([]);
  const [err, setErr] = useState('');
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [refreshing, setRefreshing] = useState(false);

  useLayoutEffect(() => {
    nav.setOptions({
      headerRight: () => (
        <Pressable onPress={() => nav.navigate('CreateLeaveRequest')} style={{ paddingHorizontal: 12 }}>
          <Text style={{ color: '#a7f3d0', fontWeight: '600' }}>+ {vi.createLeave}</Text>
        </Pressable>
      ),
    });
  }, [nav]);

  const load = useCallback(async () => {
    const cid = auth.getAttendanceCompanyId();
    const eid = auth.employeeId.trim();
    if (!cid || !eid) {
      setErr('Cần UUID công ty và employeeId.');
      setRows([]);
      return;
    }
    const q = new URLSearchParams({ company_id: cid, employee_id: eid });
    if (filter !== 'all') q.set('status', filter);
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
  }, [auth, filter]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  useFocusEffect(
    useCallback(() => {
      if (rtSummary.includes('leave_request')) void load();
    }, [rtSummary, load]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  return (
    <View style={styles.root}>
      <View style={styles.chips}>
        {(['all', 'pending', 'approved', 'rejected'] as const).map((k) => (
          <Pressable key={k} style={[styles.chip, filter === k && styles.chipOn]} onPress={() => setFilter(k)}>
            <Text style={[styles.chipText, filter === k && styles.chipTextOn]}>{statusLabel(k === 'all' ? 'all' : k)}</Text>
          </Pressable>
        ))}
      </View>
      {err ? <Text style={styles.err}>{err}</Text> : null}
      <FlatList
        data={rows}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} tintColor="#38bdf8" />}
        renderItem={({ item }) => (
          <Pressable
            style={styles.row}
            onPress={() => nav.navigate('LeaveRequestDetail', { id: item.id })}
          >
            <Text style={styles.rowMain}>
              {item.leave_type} · {item.start_date} → {item.end_date}
            </Text>
            <Text style={styles.rowSub}>{statusLabel(item.status)}</Text>
          </Pressable>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Chưa có đơn nghỉ</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0f172a', padding: 16 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
  },
  chipOn: { borderColor: '#38bdf8', backgroundColor: '#0c4a6e' },
  chipText: { color: '#94a3b8', fontSize: 12 },
  chipTextOn: { color: '#e0f2fe', fontWeight: '700' },
  err: { color: '#f87171', marginBottom: 8 },
  row: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#334155' },
  rowMain: { color: '#e2e8f0', fontSize: 15 },
  rowSub: { color: '#94a3b8', fontSize: 12, marginTop: 4 },
  empty: { color: '#64748b', marginTop: 24 },
});
