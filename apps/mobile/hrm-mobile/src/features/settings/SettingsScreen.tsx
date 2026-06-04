import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { isBiometricEnabled, promptBiometricIfEnabled, setBiometricEnabled } from '../../integrations/biometricUnlock';
import { vi } from '../../i18n/vi';
import { STORAGE } from '../../storage/keys';

export function SettingsScreen() {
  const auth = useAuth();
  const nav = useNavigation<NavigationProp<ParamListBase>>();
  const [companyUuid, setCompanyUuid] = useState(auth.companyUuid);
  const [employeeId, setEmployeeId] = useState(auth.employeeId);
  const [biometric, setBiometric] = useState(false);

  useEffect(() => {
    void isBiometricEnabled().then(setBiometric);
  }, []);

  const persist = async () => {
    const ok = await promptBiometricIfEnabled();
    if (!ok) return;
    await SecureStore.setItemAsync(STORAGE.COMPANY_UUID, companyUuid.trim());
    await SecureStore.setItemAsync(STORAGE.EMPLOYEE_ID, employeeId.trim());
    auth.updateLocal({ companyUuid: companyUuid.trim(), employeeId: employeeId.trim() });
    Alert.alert('Đã lưu', 'Phạm vi local đã cập nhật.');
  };

  const toggleBiometric = async () => {
    const next = !biometric;
    await setBiometricEnabled(next);
    setBiometric(next);
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.pad}>
      <Text style={styles.title}>UC-HRM-MOB-02 — Phạm vi đang dùng</Text>
      <Text style={styles.scope}>
        tenant: {auth.tenantId}
        {'\n'}
        company (header): {auth.companyId}
        {'\n'}
        roles: {auth.roles.join(', ') || '(chưa có)'}
        {'\n'}
        manager UI: {auth.isManager ? 'bật' : 'ẩn'}
      </Text>
      <Text style={styles.title}>{vi.settings}</Text>
      <Text style={styles.label}>UUID công ty (attendance / payroll)</Text>
      <TextInput style={styles.input} value={companyUuid} onChangeText={setCompanyUuid} autoCapitalize="none" placeholderTextColor="#64748b" />
      <Text style={styles.label}>employeeId</Text>
      <TextInput style={styles.input} value={employeeId} onChangeText={setEmployeeId} autoCapitalize="none" placeholderTextColor="#64748b" />
      <Pressable style={styles.btn} onPress={() => void persist()}>
        <Text style={styles.btnText}>Lưu vào SecureStore</Text>
      </Pressable>
      <Pressable style={[styles.btn, styles.btnSecondary]} onPress={() => void toggleBiometric()}>
        <Text style={styles.btnTextSecondary}>
          {biometric ? 'Tắt' : 'Bật'} mở khóa sinh trắc học (MOB-403)
        </Text>
      </Pressable>
      <Pressable style={[styles.btn, styles.logout]} onPress={() => void auth.signOut()}>
        <Text style={styles.logoutText}>{vi.logout} (UC-HRM-MOB-15)</Text>
      </Pressable>
      <Text style={styles.section}>Điều hướng nhanh</Text>
      <NavLink nav={nav} title={vi.scope} screen="Scope" />
      {auth.isManager ? <NavLink nav={nav} title={vi.approvals} screen="ManagerApprovals" /> : null}
      <NavLink nav={nav} title={vi.payroll} screen="PayrollSummary" />
      <NavLink nav={nav} title={vi.contracts} screen="Contracts" />
      {auth.isManager ? <NavLink nav={nav} title={vi.operations} screen="Operations" /> : null}
      <NavLink nav={nav} title={vi.profile} screen="Profile" />
      <NavLink nav={nav} title={vi.notifications} screen="Notifications" />
    </ScrollView>
  );
}

function NavLink({
  nav,
  title,
  screen,
}: {
  nav: NavigationProp<ParamListBase>;
  title: string;
  screen: string;
}) {
  return (
    <Pressable style={styles.link} onPress={() => nav.navigate(screen as never)}>
      <Text style={styles.linkText}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0f172a' },
  pad: { padding: 16, gap: 10, paddingBottom: 40 },
  title: { color: '#f8fafc', fontSize: 20, fontWeight: '700' },
  scope: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#1e293b',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
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
    marginTop: 8,
    backgroundColor: '#0ea5e9',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnSecondary: { backgroundColor: '#334155' },
  btnText: { color: '#0f172a', fontWeight: '700' },
  btnTextSecondary: { color: '#e2e8f0', fontWeight: '600' },
  logout: { backgroundColor: '#334155', marginTop: 24 },
  logoutText: { color: '#fecaca', fontWeight: '700' },
  section: { color: '#94a3b8', marginTop: 20, marginBottom: 6, fontSize: 13 },
  link: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#334155' },
  linkText: { color: '#38bdf8', fontSize: 16 },
});
