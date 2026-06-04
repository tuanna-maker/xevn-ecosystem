import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { readListRows } from '../../integrations/envelope';
import { hrmRequest } from '../../integrations/hrmApiClient';
import { formatHrmError, statusLabel } from '../../integrations/mapApiError';
import type { MoreStackParamList } from '../../navigation/types';

type Payslip = {
  id: string;
  period_label: string;
  employee_name: string;
  employee_code: string;
  gross_amount: number;
  deduction_amount: number;
  net_amount: number;
  status: string;
  currency: string;
};

export function PayslipDetailScreen() {
  const auth = useAuth();
  const route = useRoute<RouteProp<MoreStackParamList, 'PayslipDetail'>>();
  const [row, setRow] = useState<Payslip | null>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    void (async () => {
      const cid = auth.getPayrollQueryCompanyId();
      const eid = auth.employeeId.trim();
      if (!cid || !eid) {
        setErr('Thiếu phạm vi.');
        return;
      }
      const q = new URLSearchParams({ company_id: cid, employee_id: eid });
      const res = await hrmRequest<unknown>(auth.getHrmAuth(), `/payroll/payslips?${q.toString()}`, { method: 'GET' });
      if (!res.ok) {
        setErr(formatHrmError(res));
        return;
      }
      const found = readListRows<Payslip>(res.data).find((x) => x.id === route.params.payslipId) ?? null;
      setRow(found);
      if (!found) setErr('Không tìm thấy phiếu lương.');
    })();
  }, [auth, route.params.payslipId]);

  if (err) return <Text style={styles.err}>{err}</Text>;
  if (!row) return <Text style={styles.muted}>Đang tải…</Text>;

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.pad}>
      <Text style={styles.title}>{route.params.periodLabel || row.period_label}</Text>
      <Row label="Nhân viên" value={`${row.employee_name} (${row.employee_code})`} />
      <Row label="Trạng thái" value={statusLabel(row.status)} />
      <Row label="Tổng gross" value={`${row.gross_amount} ${row.currency}`} />
      <Row label="Khấu trừ" value={`${row.deduction_amount} ${row.currency}`} />
      <Row label="Thực lĩnh" value={`${row.net_amount} ${row.currency}`} />
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0f172a' },
  pad: { padding: 16, gap: 12 },
  title: { color: '#f8fafc', fontSize: 20, fontWeight: '700' },
  row: { gap: 4 },
  label: { color: '#94a3b8', fontSize: 12 },
  value: { color: '#e2e8f0', fontSize: 15 },
  err: { color: '#f87171', padding: 16 },
  muted: { color: '#64748b', padding: 16 },
});
