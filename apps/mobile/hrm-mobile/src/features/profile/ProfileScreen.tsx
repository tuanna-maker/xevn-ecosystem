import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useOfflineWriteGuard } from '../../hooks/useOfflineWriteGuard';
import { fetchEmployeeById } from '../../integrations/hrmEmployees';
import { hrmRequest } from '../../integrations/hrmApiClient';
import { formatHrmError } from '../../integrations/mapApiError';
import { vi } from '../../i18n/vi';

export function ProfileScreen() {
  const auth = useAuth();
  const blockIfOffline = useOfflineWriteGuard();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [meta, setMeta] = useState('');

  const load = useCallback(async () => {
    const id = auth.employeeId.trim();
    if (!id) {
      setMeta('Chưa có employeeId.');
      setEmail('');
      setFullName('');
      setJobTitle('');
      return;
    }
    const row = await fetchEmployeeById(auth.getHrmAuth(), id);
    if (!row) {
      setMeta('Không tìm thấy nhân viên (GET /employees). Kiểm tra companyId header + employeeId.');
      return;
    }
    setEmail(row.email);
    setFullName(row.full_name);
    setJobTitle(row.job_title_key ?? '');
    setMeta(`id: ${row.id} · mã ${row.employee_code} · ${row.status}`);
  }, [auth]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const save = async () => {
    const off = blockIfOffline();
    if (off) {
      Alert.alert(vi.error, `${off}`);
      return;
    }
    const id = auth.employeeId.trim();
    if (!id) {
      Alert.alert(vi.error, 'Thiếu employeeId.');
      return;
    }
    if (!fullName.trim()) {
      Alert.alert(vi.error, 'Nhập họ tên.');
      return;
    }
    const res = await hrmRequest<unknown>(auth.getHrmAuth(), `/employees/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        full_name: fullName.trim(),
        job_title_key: jobTitle.trim() || undefined,
      }),
    });
    if (res.ok) {
      Alert.alert('Thành công', res.code);
      void load();
    } else Alert.alert(vi.error, formatHrmError(res));
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.pad}>
      <Text style={styles.title}>UC-HRM-MOB-12 — {vi.profile}</Text>
      <Text style={styles.meta}>{meta}</Text>
      <Text style={styles.label}>Email (đọc từ API)</Text>
      <TextInput style={[styles.input, styles.readonly]} value={email} editable={false} placeholderTextColor="#64748b" />
      <Text style={styles.label}>Họ tên</Text>
      <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholderTextColor="#64748b" />
      <Text style={styles.label}>Chức danh (job_title_key)</Text>
      <TextInput style={styles.input} value={jobTitle} onChangeText={setJobTitle} placeholderTextColor="#64748b" />
      <Pressable style={styles.btn} onPress={() => void save()}>
        <Text style={styles.btnText}>{vi.save}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0f172a' },
  pad: { padding: 16, gap: 10, paddingBottom: 40 },
  title: { color: '#f8fafc', fontSize: 18, fontWeight: '700' },
  meta: { color: '#94a3b8', fontSize: 13 },
  label: { color: '#94a3b8', fontSize: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    padding: 12,
    color: '#f8fafc',
    backgroundColor: '#1e293b',
  },
  readonly: { opacity: 0.75 },
  btn: {
    marginTop: 8,
    backgroundColor: '#0ea5e9',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnText: { color: '#0f172a', fontWeight: '700' },
});
