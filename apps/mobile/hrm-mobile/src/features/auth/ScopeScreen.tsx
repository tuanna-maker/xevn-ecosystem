import * as SecureStore from 'expo-secure-store';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { getDefaultBaseUrl } from '../../integrations/hrmApiClient';
import { vi } from '../../i18n/vi';
import { STORAGE } from '../../storage/keys';

/**
 * UC-HRM-MOB-02 — chỉnh và xác nhận phạm vi tenant / công ty / UUID chấm công / nhân viên.
 * Không thay đổi token; lưu SecureStore giống luồng đăng nhập.
 */
export function ScopeScreen() {
  const auth = useAuth();
  const [baseUrl, setBaseUrl] = useState(auth.baseUrl || getDefaultBaseUrl());
  const [tenantId, setTenantId] = useState(auth.tenantId);
  const [companyId, setCompanyId] = useState(auth.companyId);
  const [companyUuid, setCompanyUuid] = useState(auth.companyUuid);
  const [employeeId, setEmployeeId] = useState(auth.employeeId);

  const persist = async () => {
    const next = {
      baseUrl: baseUrl.trim() || getDefaultBaseUrl(),
      tenantId: tenantId.trim(),
      companyId: companyId.trim(),
      companyUuid: companyUuid.trim(),
      employeeId: employeeId.trim(),
    };
    if (!next.tenantId || !next.companyId) {
      Alert.alert(vi.error, 'tenantId và companyId (header) là bắt buộc.');
      return;
    }
    await SecureStore.setItemAsync(STORAGE.BASE_URL, next.baseUrl);
    await SecureStore.setItemAsync(STORAGE.TENANT_ID, next.tenantId);
    await SecureStore.setItemAsync(STORAGE.COMPANY_ID, next.companyId);
    await SecureStore.setItemAsync(STORAGE.COMPANY_UUID, next.companyUuid);
    await SecureStore.setItemAsync(STORAGE.EMPLOYEE_ID, next.employeeId);
    auth.updateLocal(next);
    Alert.alert('Đã lưu', 'Phạm vi đã cập nhật (UC-HRM-MOB-02).');
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.pad}>
      <Text style={styles.title}>UC-HRM-MOB-02 — Phạm vi công ty</Text>
      <Text style={styles.hint}>
        Header x-tenant-id / x-company-id gửi kèm mọi request. UUID công ty dùng cho chấm công, lương, vận hành.
      </Text>
      <Field label="HRM_API_BASE_URL" value={baseUrl} onChangeText={setBaseUrl} />
      <Field label="tenantId" value={tenantId} onChangeText={setTenantId} />
      <Field label="companyId (header, ví dụ holding)" value={companyId} onChangeText={setCompanyId} />
      <Field label="UUID công ty (attendance / payroll / ops)" value={companyUuid} onChangeText={setCompanyUuid} />
      <Field label="employeeId (UUID)" value={employeeId} onChangeText={setEmployeeId} />
      <Pressable style={styles.btn} onPress={() => void persist()}>
        <Text style={styles.btnText}>Lưu phạm vi</Text>
      </Pressable>
    </ScrollView>
  );
}

function Field(props: { label: string; value: string; onChangeText: (t: string) => void }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{props.label}</Text>
      <TextInput
        style={styles.input}
        value={props.value}
        onChangeText={props.onChangeText}
        autoCapitalize="none"
        placeholderTextColor="#64748b"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0f172a' },
  pad: { padding: 16, gap: 10, paddingBottom: 40 },
  title: { color: '#f8fafc', fontSize: 20, fontWeight: '700' },
  hint: { color: '#94a3b8', fontSize: 13, lineHeight: 18, marginBottom: 8 },
  field: { gap: 4 },
  label: { color: '#cbd5e1', fontSize: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
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
  btnText: { color: '#0f172a', fontWeight: '700', fontSize: 16 },
});
