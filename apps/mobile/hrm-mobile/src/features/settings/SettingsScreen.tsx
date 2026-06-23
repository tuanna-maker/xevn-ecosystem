import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { AppScreenLayout } from '../../components/ui/AppScreenLayout';
import { FormField } from '../../components/ui/FormField';
import { ListRow } from '../../components/ui/ListRow';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { SurfaceCard } from '../../components/ui/SurfaceCard';
import { isQaDevLoginEnabled } from '../../config/qaLogin';
import { useAuth } from '../../context/AuthContext';
import { isBiometricEnabled, promptBiometricIfEnabled, setBiometricEnabled } from '../../integrations/biometricUnlock';
import { vi } from '../../i18n/vi';
import { STORAGE } from '../../storage/keys';
import { colors, spacing, typography } from '../../theme/tokens';
import {
  fetchHrmOperatingUnits,
  type HrmOperatingUnitRow,
} from '../../integrations/hrmOperatingUnits';
import { resolveCompanyDisplayVi } from '../../utils/companyDisplayVi';
import { sanitizeProfileDisplay } from '../../utils/profileTabs';
import { resolveAuthRolesVi } from '../../utils/scopeScreenCopy';

export function SettingsScreen() {
  const auth = useAuth();
  const nav = useNavigation<NavigationProp<ParamListBase>>();
  const showScopeOverride = (typeof __DEV__ !== 'undefined' && __DEV__) || isQaDevLoginEnabled();
  const activeMembership = auth.memberships.find(
    (m) => m.employee_id === auth.employeeId && m.tenant_id === auth.tenantId,
  );
  const [operatingUnits, setOperatingUnits] = useState<HrmOperatingUnitRow[]>([]);

  const loadOperatingUnits = useCallback(async () => {
    if (!auth.signedIn) {
      setOperatingUnits([]);
      return;
    }
    try {
      const rows = await fetchHrmOperatingUnits(auth.getHrmAuth());
      setOperatingUnits(rows);
    } catch {
      setOperatingUnits([]);
    }
  }, [auth]);

  useEffect(() => {
    void loadOperatingUnits();
  }, [loadOperatingUnits]);

  const companyLabel = resolveCompanyDisplayVi(auth.companyId, {
    membershipCompanyDisplay: activeMembership?.company_display,
    operatingUnits,
  });
  const rolesLabel = resolveAuthRolesVi(auth.roles);
  const employeeCodeLabel =
    sanitizeProfileDisplay(activeMembership?.employee_code) !== '—'
      ? sanitizeProfileDisplay(activeMembership?.employee_code)
      : sanitizeProfileDisplay(auth.employeeId);
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

  const navLinks: { title: string; screen: string; show?: boolean }[] = [
    { title: vi.scope, screen: 'Scope' },
    { title: vi.approvals, screen: 'ManagerApprovals', show: auth.isManager },
    { title: vi.payroll, screen: 'PayrollSummary' },
    { title: vi.contracts, screen: 'Contracts' },
    { title: vi.operations, screen: 'Operations', show: auth.isManager },
    { title: vi.profile, screen: 'Profile' },
    { title: vi.notifications, screen: 'Notifications' },
  ];

  return (
    <AppScreenLayout title={vi.settings} subtitle="Phạm vi, bảo mật và điều hướng nhanh" largeTitle scroll>
      <SurfaceCard title="Phạm vi đang dùng">
        <Text style={styles.scopeText}>
          Công ty (phạm vi): {companyLabel}
          {'\n'}
          Mã nhân viên: {employeeCodeLabel}
          {'\n'}
          Vai trò: {rolesLabel}
          {'\n'}
          Giao diện quản lý: {auth.isManager ? 'bật' : 'ẩn'}
        </Text>
      </SurfaceCard>

      {showScopeOverride ? (
        <SurfaceCard title="Cấu hình phạm vi (UAT)">
          <FormField
            label="Công ty (phạm vi)"
            value={companyUuid}
            onChangeText={setCompanyUuid}
            autoCapitalize="none"
          />
          <FormField label="Mã nhân viên" value={employeeId} onChangeText={setEmployeeId} autoCapitalize="none" />
          <PrimaryButton label="Lưu vào SecureStore" onPress={() => void persist()} />
        </SurfaceCard>
      ) : null}

      <PrimaryButton
        label={biometric ? 'Tắt mở khóa sinh trắc học' : 'Bật mở khóa sinh trắc học'}
        onPress={() => void toggleBiometric()}
        variant="secondary"
      />

      <PrimaryButton label={vi.logout} onPress={() => void auth.signOut()} variant="danger" />

      <Text style={styles.sectionTitle}>Điều hướng nhanh</Text>
      <View style={styles.navList}>
        {navLinks
          .filter((l) => l.show !== false)
          .map((l) => (
            <ListRow key={l.screen} title={l.title} onPress={() => nav.navigate(l.screen as never)} />
          ))}
      </View>
    </AppScreenLayout>
  );
}

const styles = StyleSheet.create({
  scopeText: {
    color: colors.text,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
  },
  sectionTitle: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.title2,
    fontWeight: typography.fontWeight.semibold,
    marginTop: spacing.sm,
  },
  navList: { gap: spacing.sm },
});
