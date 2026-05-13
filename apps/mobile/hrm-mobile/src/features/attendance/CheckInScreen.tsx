import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  Alert,
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

type EmpRow = { id: string; employee_code: string; full_name: string };

export function CheckInScreen() {
  const auth = useAuth();
  const nav = useNavigation();
  const blockIfOffline = useOfflineWriteGuard();
  const [employeeId, setEmployeeId] = useState(auth.employeeId);
  const [employees, setEmployees] = useState<EmpRow[]>([]);
  const [busy, setBusy] = useState(false);

  const cid = auth.getAttendanceCompanyId();

  const loadEmployees = useCallback(async () => {
    const q = new URLSearchParams({ company_id: auth.companyId.trim(), page: '1', page_size: '40' });
    const res = await hrmRequest<unknown>(auth.getHrmAuth(), `/employees?${q.toString()}`, { method: 'GET' });
    if (res.ok) setEmployees(readListRows<EmpRow>(res.data));
    else setEmployees([]);
  }, [auth]);

  useFocusEffect(
    useCallback(() => {
      void loadEmployees();
    }, [loadEmployees]),
  );

  const pickEmployee = (row: EmpRow) => {
    setEmployeeId(row.id);
    auth.updateLocal({ employeeId: row.id });
  };

  const submit = async () => {
    const off = blockIfOffline();
    if (off) {
      Alert.alert(vi.error, `${off}: không gửi chấm công khi ngoại tuyến.`);
      return;
    }
    if (!cid) {
      Alert.alert('Thiếu UUID công ty', 'Nhập UUID công ty (chấm công) trên Phạm vi / Cài đặt.');
      return;
    }
    if (!employeeId.trim()) {
      Alert.alert(vi.error, 'Cần employeeId (UUID) — chọn từ danh sách hoặc nhập.');
      return;
    }
    const today = new Date().toISOString().slice(0, 10);
    setBusy(true);
    try {
      const res = await hrmRequest<unknown>(auth.getHrmAuth(), '/attendance/records', {
        method: 'POST',
        body: JSON.stringify({
          company_id: cid,
          employee_id: employeeId.trim(),
          attendance_date: today,
          check_in_at: new Date().toISOString(),
          status: 'present',
          note: 'XeVN HRM Mobile UC-HRM-MOB-04',
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
      <Text style={styles.title}>UC-HRM-MOB-04 — Ghi nhận điểm danh</Text>
      {!cid ? <Text style={styles.warn}>Chưa có UUID công ty hợp lệ cho attendance.</Text> : null}
      <Text style={styles.label}>Chọn nhân viên (GET /employees)</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
        {employees.map((e) => (
          <Pressable
            key={e.id}
            style={[styles.chip, employeeId === e.id && styles.chipOn]}
            onPress={() => pickEmployee(e)}
          >
            <Text style={[styles.chipText, employeeId === e.id && styles.chipTextOn]} numberOfLines={1}>
              {e.employee_code} · {e.full_name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      <Text style={styles.label}>employee_id (UUID)</Text>
      <TextInput
        style={styles.input}
        value={employeeId}
        onChangeText={setEmployeeId}
        onBlur={() => auth.updateLocal({ employeeId: employeeId.trim() })}
        autoCapitalize="none"
        placeholderTextColor="#64748b"
      />
      <Pressable style={styles.btn} onPress={() => void submit()} disabled={busy}>
        <Text style={styles.btnText}>{busy ? vi.loading : 'Ghi nhận check-in'}</Text>
      </Pressable>
      <Pressable style={styles.link} onPress={() => nav.navigate('AttendanceHistory' as never)}>
        <Text style={styles.linkText}>{vi.history} →</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0f172a' },
  pad: { padding: 16, gap: 10, paddingBottom: 32 },
  title: { color: '#f8fafc', fontSize: 18, fontWeight: '700' },
  warn: { color: '#fbbf24' },
  label: { color: '#94a3b8', fontSize: 12 },
  chipsScroll: { maxHeight: 44, marginBottom: 4 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    marginRight: 8,
    maxWidth: 220,
  },
  chipOn: { borderColor: '#38bdf8', backgroundColor: '#0c4a6e' },
  chipText: { color: '#94a3b8', fontSize: 12 },
  chipTextOn: { color: '#e0f2fe', fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    padding: 12,
    color: '#f8fafc',
    backgroundColor: '#1e293b',
  },
  btn: {
    marginTop: 8,
    backgroundColor: '#0ea5e9',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnText: { color: '#0f172a', fontWeight: '700' },
  link: { marginTop: 16 },
  linkText: { color: '#38bdf8' },
});
