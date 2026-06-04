import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { readListRows } from '../../integrations/envelope';
import { hrmRequest } from '../../integrations/hrmApiClient';
import { formatHrmError, statusLabel } from '../../integrations/mapApiError';
import type { RequestsStackParamList } from '../../navigation/types';

type LeaveRow = {
  id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  status: string;
  reason: string | null;
  rejected_reason: string | null;
  requested_at: string;
  reviewed_at: string | null;
};

export function LeaveRequestDetailScreen() {
  const auth = useAuth();
  const route = useRoute<RouteProp<RequestsStackParamList, 'LeaveRequestDetail'>>();
  const [row, setRow] = useState<LeaveRow | null>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    void (async () => {
      const cid = auth.getAttendanceCompanyId();
      const eid = auth.employeeId.trim();
      if (!cid) {
        setErr('Thiếu UUID công ty.');
        return;
      }
      const q = new URLSearchParams({ company_id: cid });
      if (eid) q.set('employee_id', eid);
      const res = await hrmRequest<unknown>(auth.getHrmAuth(), `/attendance/leave-requests?${q.toString()}`, {
        method: 'GET',
      });
      if (!res.ok) {
        setErr(formatHrmError(res));
        return;
      }
      const found = readListRows<LeaveRow>(res.data).find((x) => x.id === route.params.id) ?? null;
      setRow(found);
      if (!found) setErr('Không tìm thấy đơn.');
    })();
  }, [auth, route.params.id]);

  if (err) return <Text style={styles.err}>{err}</Text>;
  if (!row) return <Text style={styles.muted}>Đang tải…</Text>;

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.pad}>
      <Text style={styles.title}>{row.leave_type}</Text>
      <Row label="Trạng thái" value={statusLabel(row.status)} />
      <Row label="Từ ngày" value={row.start_date} />
      <Row label="Đến ngày" value={row.end_date} />
      <Row label="Lý do" value={row.reason ?? '—'} />
      <Row label="Gửi lúc" value={row.requested_at} />
      {row.reviewed_at ? <Row label="Duyệt lúc" value={row.reviewed_at} /> : null}
      {row.rejected_reason ? <Row label="Lý do từ chối" value={row.rejected_reason} /> : null}
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
