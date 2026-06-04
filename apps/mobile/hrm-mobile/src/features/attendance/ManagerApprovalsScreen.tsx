import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
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

type AttReq = { id: string; employee_name: string; update_type: string };
type LeaveReq = { id: string; employee_name: string | null; leave_type: string; start_date: string; end_date: string };

type RejectState = { kind: 'att' | 'leave'; id: string } | null;

const REVIEWER = 'Mobile Manager';

export function ManagerApprovalsScreen() {
  const auth = useAuth();
  const blockIfOffline = useOfflineWriteGuard();
  const [attRows, setAttRows] = useState<AttReq[]>([]);
  const [leaveRows, setLeaveRows] = useState<LeaveReq[]>([]);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectState, setRejectState] = useState<RejectState>(null);
  const [rejectReason, setRejectReason] = useState('');

  const load = useCallback(async () => {
    const cid = auth.getAttendanceCompanyId();
    if (!cid) {
      setAttRows([]);
      setLeaveRows([]);
      return;
    }
    const q = new URLSearchParams({ company_id: cid, status: 'pending' });
    const mid = auth.employeeId.trim();
    if (mid) q.set('manager_employee_id', mid);
    const [attRes, leaveRes] = await Promise.all([
      hrmRequest<unknown>(auth.getHrmAuth(), `/attendance/update-requests?${q.toString()}`, { method: 'GET' }),
      hrmRequest<unknown>(auth.getHrmAuth(), `/attendance/leave-requests?${q.toString()}`, { method: 'GET' }),
    ]);
    if (attRes.ok) setAttRows(readListRows<AttReq>(attRes.data));
    else setAttRows([]);
    if (leaveRes.ok) setLeaveRows(readListRows<LeaveReq>(leaveRes.data));
    else setLeaveRows([]);
  }, [auth]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const openReject = (kind: 'att' | 'leave', id: string) => {
    setRejectState({ kind, id });
    setRejectReason('');
    setRejectOpen(true);
  };

  const approveAtt = async (id: string) => {
    const off = blockIfOffline();
    if (off) {
      Alert.alert(vi.error, `${off}`);
      return;
    }
    const res = await hrmRequest<unknown>(auth.getHrmAuth(), `/attendance/update-requests/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ approver_name: REVIEWER }),
    });
    if (res.ok) {
      Alert.alert('OK', res.code);
      void load();
    } else Alert.alert(vi.error, formatHrmError(res));
  };

  const approveLeave = async (id: string) => {
    const off = blockIfOffline();
    if (off) {
      Alert.alert(vi.error, `${off}`);
      return;
    }
    const body: Record<string, string | undefined> = { reviewer_name: REVIEWER };
    const eid = auth.employeeId.trim();
    if (eid) body.reviewer_employee_id = eid;
    const res = await hrmRequest<unknown>(auth.getHrmAuth(), `/attendance/leave-requests/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    if (res.ok) {
      Alert.alert('OK', res.code);
      void load();
    } else Alert.alert(vi.error, formatHrmError(res));
  };

  const confirmReject = async () => {
    const off = blockIfOffline();
    if (off) {
      Alert.alert(vi.error, `${off}`);
      return;
    }
    if (!rejectState) return;
    const { kind, id } = rejectState;
    let res: Awaited<ReturnType<typeof hrmRequest<unknown>>>;
    if (kind === 'att') {
      res = await hrmRequest<unknown>(auth.getHrmAuth(), `/attendance/update-requests/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({
          approver_name: REVIEWER,
          rejected_reason: rejectReason.trim() || 'Từ chối từ mobile',
        }),
      });
    } else {
      const body: Record<string, string | undefined> = {
        reviewer_name: REVIEWER,
        rejected_reason: rejectReason.trim() || 'Từ chối từ mobile',
      };
      const eid = auth.employeeId.trim();
      if (eid) body.reviewer_employee_id = eid;
      res = await hrmRequest<unknown>(auth.getHrmAuth(), `/attendance/leave-requests/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
    }
    setRejectOpen(false);
    setRejectState(null);
    if (res.ok) {
      Alert.alert('OK', res.code);
      void load();
    } else Alert.alert(vi.error, formatHrmError(res));
  };

  return (
    <View style={styles.root}>
      <Text style={styles.title}>UC-HRM-MOB-08 — {vi.approvals}</Text>
      <ScrollView contentContainerStyle={styles.scrollPad}>
        <Text style={styles.section}>Chỉnh sửa chấm công</Text>
        {attRows.map((r) => (
          <View key={r.id} style={styles.card}>
            <Text style={styles.name}>
              {r.employee_name} — {r.update_type}
            </Text>
            <View style={styles.row}>
              <Pressable style={styles.approve} onPress={() => void approveAtt(r.id)}>
                <Text style={styles.approveText}>Duyệt</Text>
              </Pressable>
              <Pressable style={styles.reject} onPress={() => openReject('att', r.id)}>
                <Text style={styles.rejectText}>Từ chối</Text>
              </Pressable>
            </View>
          </View>
        ))}
        {attRows.length === 0 ? <Text style={styles.empty}>Không có đơn chấm công chờ duyệt</Text> : null}

        <Text style={[styles.section, styles.sectionGap]}>Nghỉ phép</Text>
        {leaveRows.map((r) => (
          <View key={r.id} style={styles.card}>
            <Text style={styles.name}>
              {(r.employee_name ?? '?') as string} — {r.leave_type} ({r.start_date} → {r.end_date})
            </Text>
            <View style={styles.row}>
              <Pressable style={styles.approve} onPress={() => void approveLeave(r.id)}>
                <Text style={styles.approveText}>Duyệt</Text>
              </Pressable>
              <Pressable style={styles.reject} onPress={() => openReject('leave', r.id)}>
                <Text style={styles.rejectText}>Từ chối</Text>
              </Pressable>
            </View>
          </View>
        ))}
        {leaveRows.length === 0 ? <Text style={styles.empty}>Không có đơn nghỉ chờ duyệt</Text> : null}
      </ScrollView>

      <Modal visible={rejectOpen} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Lý do từ chối</Text>
            <TextInput
              style={styles.modalInput}
              value={rejectReason}
              onChangeText={setRejectReason}
              placeholder="Nhập lý do…"
              placeholderTextColor="#64748b"
            />
            <View style={styles.modalRow}>
              <Pressable
                style={styles.modalCancel}
                onPress={() => {
                  setRejectOpen(false);
                  setRejectState(null);
                }}
              >
                <Text style={styles.modalCancelText}>Huỷ</Text>
              </Pressable>
              <Pressable style={styles.modalOk} onPress={() => void confirmReject()}>
                <Text style={styles.modalOkText}>Gửi</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0f172a' },
  scrollPad: { padding: 16, paddingBottom: 40, gap: 12 },
  title: { color: '#f8fafc', fontSize: 18, fontWeight: '700', paddingHorizontal: 16, paddingTop: 16 },
  section: { color: '#94a3b8', fontSize: 13, fontWeight: '700', textTransform: 'uppercase' },
  sectionGap: { marginTop: 8 },
  card: { backgroundColor: '#1e293b', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#334155' },
  name: { color: '#e2e8f0', marginBottom: 10 },
  row: { flexDirection: 'row', gap: 10 },
  approve: { flex: 1, backgroundColor: '#059669', padding: 10, borderRadius: 8, alignItems: 'center' },
  approveText: { color: '#ecfdf5', fontWeight: '700' },
  reject: { flex: 1, backgroundColor: '#7f1d1d', padding: 10, borderRadius: 8, alignItems: 'center' },
  rejectText: { color: '#fecaca', fontWeight: '700' },
  empty: { color: '#64748b' },
  modalBg: { flex: 1, backgroundColor: '#000a', justifyContent: 'center', padding: 24 },
  modalBox: { backgroundColor: '#1e293b', borderRadius: 12, padding: 16, gap: 12 },
  modalTitle: { color: '#f8fafc', fontWeight: '700', fontSize: 16 },
  modalInput: {
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    padding: 12,
    color: '#f8fafc',
  },
  modalRow: { flexDirection: 'row', gap: 10, justifyContent: 'flex-end' },
  modalCancel: { paddingVertical: 10, paddingHorizontal: 16 },
  modalCancelText: { color: '#94a3b8' },
  modalOk: { backgroundColor: '#0ea5e9', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  modalOkText: { color: '#0f172a', fontWeight: '700' },
});
