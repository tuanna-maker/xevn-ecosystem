import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { readListRows } from '../../integrations/envelope';
import { hrmRequest } from '../../integrations/hrmApiClient';
import { formatHrmError, statusLabel } from '../../integrations/mapApiError';
import type { MoreStackParamList } from '../../navigation/types';

type Payslip = {
  id: string;
  period_label: string;
  employee_name: string;
  gross_amount: number;
  deduction_amount: number;
  net_amount: number;
  status: string;
  currency: string;
};

export function PayslipListScreen() {
  const auth = useAuth();
  const route = useRoute<RouteProp<MoreStackParamList, 'PayslipList'>>();
  const nav = useNavigation<NativeStackNavigationProp<MoreStackParamList>>();
  const [rows, setRows] = useState<Payslip[]>([]);
  const [err, setErr] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const cid = auth.getPayrollQueryCompanyId();
    const eid = auth.employeeId.trim();
    if (!cid || !eid) {
      setErr('Cần phạm vi công ty và employeeId.');
      setRows([]);
      return;
    }
    const q = new URLSearchParams({ company_id: cid, period_id: route.params.periodId, employee_id: eid });
    const res = await hrmRequest<unknown>(auth.getHrmAuth(), `/payroll/payslips?${q.toString()}`, { method: 'GET' });
    if (res.ok) {
      setRows(readListRows<Payslip>(res.data));
      setErr('');
    } else {
      setRows([]);
      setErr(formatHrmError(res));
    }
  }, [auth, route.params.periodId]);

  React.useEffect(() => {
    void load();
  }, [load]);

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
      <Text style={styles.title}>{route.params.periodLabel}</Text>
      {err ? <Text style={styles.err}>{err}</Text> : null}
      <FlatList
        data={rows}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} tintColor="#38bdf8" />}
        renderItem={({ item }) => (
          <Pressable
            style={styles.row}
            onPress={() =>
              nav.navigate('PayslipDetail', {
                payslipId: item.id,
                periodLabel: item.period_label,
              })
            }
          >
            <Text style={styles.main}>{item.period_label}</Text>
            <Text style={styles.sub}>
              Net {item.net_amount} {item.currency} · {statusLabel(item.status)}
            </Text>
          </Pressable>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Chưa có phiếu lương</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0f172a', padding: 16 },
  title: { color: '#f8fafc', fontSize: 18, fontWeight: '700', marginBottom: 8 },
  err: { color: '#f87171', marginBottom: 8 },
  row: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#334155' },
  main: { color: '#e2e8f0', fontSize: 15 },
  sub: { color: '#94a3b8', fontSize: 12, marginTop: 4 },
  empty: { color: '#64748b', marginTop: 24 },
});
