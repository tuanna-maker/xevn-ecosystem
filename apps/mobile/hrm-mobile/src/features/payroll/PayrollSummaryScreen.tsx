import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { readListRows } from '../../integrations/envelope';
import { hrmRequest } from '../../integrations/hrmApiClient';
import { formatHrmError } from '../../integrations/mapApiError';
import { vi } from '../../i18n/vi';

type Period = {
  id: string;
  period_label: string;
  start_date: string;
  end_date: string;
  status: string;
};

export function PayrollSummaryScreen() {
  const auth = useAuth();
  const [rows, setRows] = useState<Period[]>([]);
  const [err, setErr] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const cid = auth.getAttendanceCompanyId();
    if (!cid) {
      setErr('Cần UUID công ty để gọi UC-HRM-MOB-09.');
      setRows([]);
      return;
    }
    const q = new URLSearchParams({ company_id: cid });
    const res = await hrmRequest<unknown>(auth.getHrmAuth(), `/payroll/periods?${q.toString()}`, { method: 'GET' });
    if (res.ok) {
      setRows(readListRows<Period>(res.data));
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
    <View style={styles.wrap}>
      <Text style={styles.title}>UC-HRM-MOB-09 — {vi.payroll}</Text>
      {err ? <Text style={styles.err}>{err}</Text> : null}
      <FlatList
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 32 }}
        data={rows}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} tintColor="#38bdf8" />}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.main}>{item.period_label}</Text>
            <Text style={styles.sub}>
              {item.start_date} → {item.end_date} · {item.status}
            </Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Chưa có kỳ lương trong phạm vi</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#0f172a', padding: 16 },
  title: { color: '#f8fafc', fontSize: 18, fontWeight: '700', marginBottom: 12 },
  err: { color: '#f87171', marginBottom: 8 },
  row: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  main: { color: '#e2e8f0', fontSize: 16, fontWeight: '600' },
  sub: { color: '#94a3b8', fontSize: 13, marginTop: 4 },
  empty: { color: '#64748b', marginTop: 24 },
});
