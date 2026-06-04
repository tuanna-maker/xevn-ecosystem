import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useHrmRealtimeSummary, useRealtime } from '../../context/RealtimeContext';
import { readListRows } from '../../integrations/envelope';
import { hrmRequest } from '../../integrations/hrmApiClient';
import { formatHrmError } from '../../integrations/mapApiError';
import { vi } from '../../i18n/vi';

function formatRealtimeLine(raw: unknown): string {
  if (!raw || typeof raw !== 'object') return String(raw);
  const o = raw as Record<string, unknown>;
  const type = typeof o.type === 'string' ? o.type : 'hrm:event';
  const at = typeof o.at === 'string' ? o.at : '';
  return at ? `${type} @ ${at}` : type;
}

type InboxRow = { id: string; event_type: string; payload: unknown; read_at: string | null; created_at: string };

function formatInboxLine(row: InboxRow): string {
  const read = row.read_at ? '✓' : '○';
  return `${read} ${row.event_type} @ ${row.created_at.slice(0, 19)}`;
}

type Line = { id: string; text: string };

export function InAppNotificationsScreen() {
  const auth = useAuth();
  const rt = useRealtime();
  const rtSummary = useHrmRealtimeSummary();
  const [lines, setLines] = useState<Line[]>([]);
  const [inboxRows, setInboxRows] = useState<InboxRow[]>([]);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setErr('');
    try {
      const cfg = auth.getHrmAuth();
    const cid = auth.getAttendanceCompanyId();
    const out: Line[] = [];

    const h = await hrmRequest<{ service?: string }>(cfg, '/', { method: 'GET' });
    out.push({
      id: 'health',
      text: h.ok ? `API: ${h.data?.service ?? 'hrm'} (${h.code})` : `API: ${formatHrmError(h)}`,
    });

    if (cid) {
      const ur = await hrmRequest<unknown>(
        cfg,
        `/attendance/update-requests?${new URLSearchParams({ company_id: cid, status: 'pending' }).toString()}`,
        { method: 'GET' },
      );
      if (ur.ok) {
        const n = readListRows(ur.data).length;
        out.push({ id: 'ur', text: `Đơn công chờ duyệt: ${n}` });
      } else out.push({ id: 'ur', text: `Đơn công: ${formatHrmError(ur)}` });

      const sr = await hrmRequest<unknown>(
        cfg,
        `/operations/service-requests?${new URLSearchParams({ company_id: cid }).toString()}`,
        { method: 'GET' },
      );
      if (sr.ok) {
        const pend = readListRows<{ status: string }>(sr.data).filter((x) => x.status === 'pending').length;
        out.push({ id: 'svc', text: `Yêu cầu dịch vụ chờ: ${pend}` });
      } else out.push({ id: 'svc', text: `Dịch vụ: ${formatHrmError(sr)}` });

      const payrollCid = auth.getPayrollQueryCompanyId();
      const pr = await hrmRequest<unknown>(
        cfg,
        `/payroll/periods?${new URLSearchParams({ company_id: payrollCid || cid }).toString()}`,
        { method: 'GET' },
      );
      if (pr.ok) {
        const drafts = readListRows<{ status: string }>(pr.data).filter((x) => x.status === 'draft').length;
        out.push({ id: 'pay', text: `Kỳ lương draft: ${drafts}` });
      } else out.push({ id: 'pay', text: `Lương: ${formatHrmError(pr)}` });

      const eid = auth.employeeId.trim();
      if (eid) {
        const inbox = await hrmRequest<{ total: number; data: InboxRow[] }>(
          cfg,
          `/notifications/inbox?${new URLSearchParams({ company_id: cid, employee_id: eid, limit: '12' }).toString()}`,
          { method: 'GET' },
        );
        if (inbox.ok) {
          setInboxRows(inbox.data.data);
          const unread = inbox.data.data.filter((x) => !x.read_at).length;
          out.push({ id: 'inbox-h', text: `Hộp thư: ${inbox.data.data.length} tin · ${unread} chưa đọc` });
        } else {
          setInboxRows([]);
          out.push({ id: 'inbox', text: `Hộp thư: ${formatHrmError(inbox)}` });
        }
      } else {
        setInboxRows([]);
        out.push({ id: 'inbox-skip', text: 'Hộp thư: cần employee UUID trong phiên để lọc tin.' });
      }
    } else {
      out.push({ id: 'scope', text: 'Thiếu UUID công ty — bỏ qua đếm đơn/lương/dịch vụ theo UUID.' });
    }

    setLines(out);
    } finally {
      setLoading(false);
    }
  }, [auth]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const markRead = async (row: InboxRow) => {
    const cid = auth.getAttendanceCompanyId();
    const eid = auth.employeeId.trim();
    if (!cid || !eid || row.read_at) return;
    const res = await hrmRequest<unknown>(
      auth.getHrmAuth(),
      `/notifications/inbox/${row.id}/read?${new URLSearchParams({ company_id: cid }).toString()}`,
      { method: 'PATCH', body: JSON.stringify({ viewer_employee_id: eid }) },
    );
    if (res.ok) void load();
    else Alert.alert(vi.error, formatHrmError(res));
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.pad}>
      <Text style={styles.title}>UC-HRM-MOB-13 — {vi.notifications}</Text>
      <Text style={styles.hint}>
        In-app + Socket.IO realtime + hộp thư lưu DB; đăng ký Expo push (dev build / EAS projectId). Webhook & FCM cấu
        hình phía server.
      </Text>
      <Text style={styles.rtLine}>{rtSummary || 'Realtime: —'}</Text>
      {rt.feed.slice(0, 5).map((item) => (
        <View key={item.id} style={styles.rtCard}>
          <Text style={styles.rtCardText}>{formatRealtimeLine(item.raw)}</Text>
        </View>
      ))}
      <Pressable style={styles.btn} onPress={() => void load()} disabled={loading}>
        <Text style={styles.btnText}>{loading ? 'Đang tải…' : 'Làm mới'}</Text>
      </Pressable>
      <Pressable style={styles.btn} onPress={() => rt.clearFeed()} disabled={rt.feed.length === 0}>
        <Text style={styles.btnText}>Xoá log realtime</Text>
      </Pressable>
      {err ? <Text style={styles.err}>{err}</Text> : null}
      {lines.map((l) => (
        <View key={l.id} style={styles.card}>
          <Text style={styles.cardText}>{l.text}</Text>
        </View>
      ))}
      {inboxRows.length > 0 ? <Text style={styles.section}>Hộp thư — chạm để đánh dấu đã đọc</Text> : null}
      {inboxRows.map((row) => (
        <Pressable
          key={row.id}
          style={[styles.card, !row.read_at && styles.cardUnread]}
          onPress={() => void markRead(row)}
        >
          <Text style={styles.cardText}>{formatInboxLine(row)}</Text>
        </Pressable>
      ))}
      <Text style={styles.footer}>
        Biến server: HRM_EVENT_WEBHOOK_URLS, HRM_EVENT_WEBHOOK_SECRET, FIREBASE_SERVICE_ACCOUNT_JSON, EXPO_ACCESS_TOKEN
        (tuỳ chọn).
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0f172a' },
  pad: { padding: 16, gap: 10, paddingBottom: 40 },
  title: { color: '#f8fafc', fontSize: 18, fontWeight: '700' },
  hint: { color: '#94a3b8', fontSize: 13, lineHeight: 18 },
  btn: {
    alignSelf: 'flex-start',
    backgroundColor: '#1e293b',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  btnText: { color: '#e2e8f0', fontWeight: '600' },
  err: { color: '#f87171' },
  rtLine: { color: '#38bdf8', fontSize: 13, fontWeight: '600' },
  rtCard: {
    backgroundColor: '#0f172a',
    borderRadius: 6,
    padding: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  rtCardText: { color: '#cbd5e1', fontSize: 12 },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardText: { color: '#e2e8f0', fontSize: 14 },
  cardUnread: { borderColor: '#38bdf8' },
  section: { color: '#94a3b8', fontSize: 13, marginTop: 8 },
  footer: { color: '#64748b', fontSize: 12, marginTop: 16 },
});
