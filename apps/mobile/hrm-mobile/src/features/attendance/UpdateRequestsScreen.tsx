import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useLayoutEffect, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import type { RequestsStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import { readListRows } from '../../integrations/envelope';
import { hrmRequest } from '../../integrations/hrmApiClient';
import { formatHrmError, statusLabel } from '../../integrations/mapApiError';
import { vi } from '../../i18n/vi';

type Req = { id: string; status: string; employee_name: string; update_type: string; attendance_date: string };

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

export function UpdateRequestsScreen() {
  const auth = useAuth();
  const nav = useNavigation<NativeStackNavigationProp<RequestsStackParamList>>();
  const [rows, setRows] = useState<Req[]>([]);
  const [err, setErr] = useState('');
  const [filter, setFilter] = useState<StatusFilter>('pending');
  const [refreshing, setRefreshing] = useState(false);

  useLayoutEffect(() => {
    nav.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingRight: 4 }}>
          <Pressable onPress={() => nav.navigate('LeaveRequestsList')} style={{ paddingHorizontal: 6 }}>
            <Text style={{ color: '#cbd5e1', fontWeight: '600', fontSize: 12 }}>{vi.leaveList}</Text>
          </Pressable>
          <Pressable onPress={() => nav.navigate('CreateLeaveRequest')} style={{ paddingHorizontal: 6 }}>
            <Text style={{ color: '#a7f3d0', fontWeight: '600' }}>+ {vi.createLeave}</Text>
          </Pressable>
          <Pressable onPress={() => nav.navigate('CreateUpdateRequest')} style={{ paddingHorizontal: 6 }}>
            <Text style={{ color: '#38bdf8', fontWeight: '600' }}>+ {vi.createRequest}</Text>
          </Pressable>
        </View>
      ),
    });
  }, [nav]);

  const load = useCallback(async () => {
    const cid = auth.getAttendanceCompanyId();
    if (!cid) {
      setErr('Cần UUID công ty.');
      setRows([]);
      return;
    }
    const q = new URLSearchParams({ company_id: cid });
    if (filter !== 'all') q.set('status', filter);
    const eid = auth.employeeId.trim();
    if (eid) q.set('employee_id', eid);
    const res = await hrmRequest<unknown>(auth.getHrmAuth(), `/attendance/update-requests?${q.toString()}`, {
      method: 'GET',
    });
    if (res.ok) {
      setRows(readListRows<Req>(res.data));
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
      <Text style={styles.sub}>UC-HRM-MOB-07 — kéo để làm mới</Text>
      <View style={styles.chips}>
        {(['all', 'pending', 'approved', 'rejected'] as const).map((k) => (
          <Pressable key={k} style={[styles.chip, filter === k && styles.chipOn]} onPress={() => setFilter(k)}>
            <Text style={[styles.chipText, filter === k && styles.chipTextOn]}>
              {k === 'all' ? 'Tất cả' : statusLabel(k)}
            </Text>
          </Pressable>
        ))}
      </View>
      {err ? <Text style={styles.err}>{err}</Text> : null}
      <FlatList
        data={rows}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} tintColor="#38bdf8" />}
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => nav.navigate('UpdateRequestDetail', { id: item.id })}>
            <Text style={styles.rowMain}>
              {item.employee_name} — {item.update_type}
            </Text>
            <Text style={styles.rowSub}>
              {item.attendance_date} — {statusLabel(item.status)}
            </Text>
          </Pressable>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Không có đơn</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0f172a', padding: 16 },
  sub: { color: '#64748b', marginBottom: 8 },
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
  chipText: { color: '#94a3b8', fontSize: 12, textTransform: 'capitalize' },
  chipTextOn: { color: '#e0f2fe', fontWeight: '700' },
  err: { color: '#f87171', marginBottom: 8 },
  row: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#334155' },
  rowMain: { color: '#e2e8f0', fontSize: 15 },
  rowSub: { color: '#94a3b8', fontSize: 12 },
  empty: { color: '#64748b', marginTop: 24 },
});
