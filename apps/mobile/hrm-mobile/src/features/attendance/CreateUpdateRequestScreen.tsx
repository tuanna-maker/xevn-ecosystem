import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useOfflineWriteGuard } from '../../hooks/useOfflineWriteGuard';
import { fetchEmployeeById } from '../../integrations/hrmEmployees';
import { hrmRequest } from '../../integrations/hrmApiClient';
import { formatHrmError } from '../../integrations/mapApiError';
import { vi } from '../../i18n/vi';

export function CreateUpdateRequestScreen() {
  const auth = useAuth();
  const blockIfOffline = useOfflineWriteGuard();
  const [updateType, setUpdateType] = useState('adjust_check_in');
  const [reason, setReason] = useState('Điều chỉnh giờ vào (mobile)');
  const [employeeCode, setEmployeeCode] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [department, setDepartment] = useState('');
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
      Alert.alert(
        vi.error,
        'Thiếu mã/tên nhân viên. Điền employeeId UUID trùng bản ghi GET /employees hoặc nhập tay.',
      );
      return;
    }
    setBusy(true);
    try {
      const res = await hrmRequest<unknown>(auth.getHrmAuth(), '/attendance/update-requests', {
        method: 'POST',
        body: JSON.stringify({
          company_id: cid,
          employee_id: eid,
          employee_code: employeeCode.trim(),
          employee_name: employeeName.trim(),
          department: department.trim() || undefined,
          position: undefined,
          attendance_date: new Date().toISOString().slice(0, 10),
          update_type: updateType.trim(),
          reason: reason.trim(),
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
      <Text style={styles.title}>UC-HRM-MOB-06</Text>
      <Text style={styles.hint}>
        Dữ liệu nhân viên lấy từ GET /employees khi đã cấu hình employeeId + companyId header khớp bản ghi.
      </Text>
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
      <Text style={styles.label}>update_type</Text>
      <TextInput style={styles.input} value={updateType} onChangeText={setUpdateType} placeholderTextColor="#64748b" />
      <Text style={styles.label}>reason</Text>
      <TextInput style={styles.input} value={reason} onChangeText={setReason} placeholderTextColor="#64748b" />
      <Pressable style={styles.btn} onPress={() => void submit()} disabled={busy}>
        <Text style={styles.btnText}>{busy ? vi.loading : 'Gửi đơn'}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0f172a' },
  pad: { padding: 16, gap: 10, paddingBottom: 40 },
  title: { color: '#f8fafc', fontSize: 18, fontWeight: '700' },
  hint: { color: '#64748b', fontSize: 12 },
  label: { color: '#94a3b8', fontSize: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    padding: 12,
    color: '#f8fafc',
    backgroundColor: '#1e293b',
  },
  btn: {
    marginTop: 12,
    backgroundColor: '#0ea5e9',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnText: { color: '#0f172a', fontWeight: '700' },
});
