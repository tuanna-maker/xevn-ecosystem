import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useOfflineWriteGuard } from '../../hooks/useOfflineWriteGuard';
import { fetchEmployeeById } from '../../integrations/hrmEmployees';
import { hrmRequest } from '../../integrations/hrmApiClient';
import { formatHrmError } from '../../integrations/mapApiError';
import { vi } from '../../i18n/vi';

export function CreateLeaveRequestScreen() {
  const auth = useAuth();
  const blockIfOffline = useOfflineWriteGuard();
  const [leaveType, setLeaveType] = useState('annual');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [totalDays, setTotalDays] = useState('1');
  const [reason, setReason] = useState('Xin nghỉ từ mobile');
  const [employeeCode, setEmployeeCode] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [department, setDepartment] = useState('');
  const [position, setPosition] = useState('');
  const [handoverTo, setHandoverTo] = useState('');
  const [handoverTasks, setHandoverTasks] = useState('');
  const [busy, setBusy] = useState(false);

  const cid = auth.getAttendanceCompanyId();
  const eid = auth.employeeId.trim();

  useEffect(() => {
    void (async () => {
      if (!eid) return;
      const row = await fetchEmployeeById(auth.getHrmAuth(), eid);
      if (row) {
        setEmployeeCode(row.employee_code);
        setEmployeeName(row.full_name);
        setDepartment(row.job_title_key ?? '');
      }
    })();
  }, [auth, eid]);

  const submit = async () => {
    const off = blockIfOffline();
    if (off) {
      Alert.alert(vi.error, `${off}: không gửi đơn khi ngoại tuyến.`);
      return;
    }
    if (!cid || !eid) {
      Alert.alert(vi.error, 'Cần UUID công ty + employeeId.');
      return;
    }
    if (!employeeCode.trim() || !employeeName.trim()) {
      Alert.alert(vi.error, 'Thiếu mã/tên nhân viên.');
      return;
    }
    const days = Number(totalDays.replace(',', '.'));
    if (!Number.isFinite(days) || days < 0.5) {
      Alert.alert(vi.error, 'total_days tối thiểu 0.5');
      return;
    }
    setBusy(true);
    try {
      const res = await hrmRequest<unknown>(auth.getHrmAuth(), '/attendance/leave-requests', {
        method: 'POST',
        body: JSON.stringify({
          company_id: cid,
          employee_id: eid,
          employee_code: employeeCode.trim(),
          employee_name: employeeName.trim(),
          department: department.trim() || undefined,
          position: position.trim() || undefined,
          leave_type: leaveType.trim(),
          start_date: startDate.trim(),
          end_date: endDate.trim(),
          total_days: days,
          reason: reason.trim() || undefined,
          handover_to: handoverTo.trim() || undefined,
          handover_tasks: handoverTasks.trim() || undefined,
        }),
      });
      if (res.ok) Alert.alert('Thành công', res.code);
      else Alert.alert(vi.error, formatHrmError(res));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.pad}>
      <Text style={styles.title}>Đơn nghỉ phép (HRM API)</Text>
      <Text style={styles.hint}>Gửi lên Postgres; quản lý xem inbox + duyệt trên web hoặc màn Phê duyệt.</Text>
      <Text style={styles.label}>employee_code</Text>
      <TextInput
        style={styles.input}
        value={employeeCode}
        onChangeText={setEmployeeCode}
        placeholderTextColor="#64748b"
        autoCapitalize="none"
      />
      <Text style={styles.label}>employee_name</Text>
      <TextInput style={styles.input} value={employeeName} onChangeText={setEmployeeName} placeholderTextColor="#64748b" />
      <Text style={styles.label}>department (tuỳ chọn)</Text>
      <TextInput style={styles.input} value={department} onChangeText={setDepartment} placeholderTextColor="#64748b" />
      <Text style={styles.label}>position (tuỳ chọn)</Text>
      <TextInput style={styles.input} value={position} onChangeText={setPosition} placeholderTextColor="#64748b" />
      <Text style={styles.label}>leave_type</Text>
      <TextInput style={styles.input} value={leaveType} onChangeText={setLeaveType} placeholderTextColor="#64748b" />
      <Text style={styles.label}>start_date (YYYY-MM-DD)</Text>
      <TextInput style={styles.input} value={startDate} onChangeText={setStartDate} placeholderTextColor="#64748b" />
      <Text style={styles.label}>end_date</Text>
      <TextInput style={styles.input} value={endDate} onChangeText={setEndDate} placeholderTextColor="#64748b" />
      <Text style={styles.label}>total_days</Text>
      <TextInput style={styles.input} value={totalDays} onChangeText={setTotalDays} keyboardType="decimal-pad" placeholderTextColor="#64748b" />
      <Text style={styles.label}>reason</Text>
      <TextInput style={styles.input} value={reason} onChangeText={setReason} placeholderTextColor="#64748b" />
      <Text style={styles.label}>handover_to (tuỳ chọn)</Text>
      <TextInput style={styles.input} value={handoverTo} onChangeText={setHandoverTo} placeholderTextColor="#64748b" />
      <Text style={styles.label}>handover_tasks (tuỳ chọn)</Text>
      <TextInput style={styles.input} value={handoverTasks} onChangeText={setHandoverTasks} placeholderTextColor="#64748b" />
      <Pressable style={styles.btn} onPress={() => void submit()} disabled={busy}>
        <Text style={styles.btnText}>{busy ? vi.loading : 'Gửi đơn nghỉ'}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0f172a' },
  pad: { padding: 16, paddingBottom: 32, gap: 8 },
  title: { color: '#f8fafc', fontSize: 18, fontWeight: '700' },
  hint: { color: '#64748b', fontSize: 12, marginBottom: 8 },
  label: { color: '#94a3b8', fontSize: 12, marginTop: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    padding: 12,
    color: '#f8fafc',
    backgroundColor: '#1e293b',
  },
  btn: { marginTop: 16, backgroundColor: '#0ea5e9', padding: 14, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#0f172a', fontWeight: '800' },
});
