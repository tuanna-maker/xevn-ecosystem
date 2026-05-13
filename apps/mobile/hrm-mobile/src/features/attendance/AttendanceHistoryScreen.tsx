import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { readListRows } from '../../integrations/envelope';
import { hrmRequest } from '../../integrations/hrmApiClient';
import { formatHrmError } from '../../integrations/mapApiError';
import { vi } from '../../i18n/vi';

type Row = { id: string; attendance_date: string; status: string; check_in_at?: string | null };

export function AttendanceHistoryScreen() {
  const auth = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [err, setErr] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const cid = auth.getAttendanceCompanyId();
    const eid = auth.employeeId.trim();
    if (!cid || !eid) {
      setErr('Cần UUID công ty + employeeId.');
      setRows([]);
      return;
    }
    const from = new Date();
    from.setDate(from.getDate() - 14);
    const q = new URLSearchParams({
      company_id: cid,
      employee_id: eid,
      from_date: from.toISOString().slice(0, 10),
      to_date: new Date().toISOString().slice(0, 10),
      page: '1',
      page_size: '50',
    });
    const res = await hrmRequest<unknown>(auth.getHrmAuth(), `/attendance/records?${q.toString()}`, {
      method: 'GET',
    });
    if (res.ok) {
      setRows(readListRows<Row>(res.data));
      setErr('');
    } else {
      setRows([]);
      setErr(formatHrmError(res));
    }
  }, [auth]);

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
      <Text style={styles.title}>UC-HRM-MOB-05 — {vi.history}</Text>
      {err ? <Text style={styles.err}>{err}</Text> : null}
      <FlatList
        data={rows}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} tintColor="#38bdf8" />}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.rowMain}>
              {item.attendance_date} — {item.status}
            </Text>
            <Text style={styles.rowSub}>{item.check_in_at ?? '—'}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Không có dữ liệu</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0f172a', padding: 16 },
  title: { color: '#f8fafc', fontSize: 18, fontWeight: '700', marginBottom: 12 },
  err: { color: '#f87171', marginBottom: 8 },
  row: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  rowMain: { color: '#e2e8f0', fontSize: 15 },
  rowSub: { color: '#94a3b8', fontSize: 12 },
  empty: { color: '#64748b', marginTop: 24 },
});
