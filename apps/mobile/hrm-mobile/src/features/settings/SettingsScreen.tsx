import type { NavigationProp } from '@react-navigation/native';
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
import type { MainTabParamList } from '../../navigation/types';
import {
  navigateToCreateUpdateRequest,
  navigateToScope,
} from '../../navigation/profileStackNav';
import { STORAGE } from '../../storage/keys';
import { colors, spacing, typography } from '../../theme/tokens';
import {
  fetchHrmOperatingUnits,
  type HrmOperatingUnitRow,
} from '../../integrations/hrmOperatingUnits';
import { resolveCompanyDisplayVi } from '../../utils/companyDisplayVi';
import { sanitizeProfileDisplay } from '../../utils/profileTabs';
import {
  SETTINGS_SCOPE_LINK_TEST_ID,
  SETTINGS_SCREEN_TEST_ID,
} from '../../utils/profileSettingsNav';
import { resolveAuthRolesVi } from '../../utils/scopeScreenCopy';

/**
 * @CODE-MEMORY
 * Screen:     ProfileStack → Settings (Cài đặt)
 * UC:         UC-HRM-MOB-02 · HDSD §12.9 · AT-01
 * SRS:        docs/hrm/MOBILE_W7_SRS_DELTA.md · HDSD Ch.12 mobile
 * TechSpec:   MOBILE_W7_TECHSPEC_DELTA · scope + biometric local
 * Purpose:    Phạm vi đang dùng, bảo mật sinh trắc, điều hướng nhanh tới Scope và stack con.
 * WorkItem:   MOB-NAV-SETTINGS-01
 * Coded:      2026-08-01
 * Callers:    ProfileSettingsEntry · RootNavigator ProfileStack
 * Callees:    navigateToScope · navigateToCreateUpdateRequest · fetchHrmOperatingUnits · auth.signOut
 * Impact:     Thiếu entry Profile → màn này unreachable (TC-MOB-032 FAIL)
 * must_keep:  testID settings-screen · settings-scope-link; vi.scope «Phạm vi công ty»
 * LastVerified: docs/qa/evidence/r-spine-at-nav-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-03 R-SPINE-AT-NAV-01
 * change_mode: ADD
 * What: Điều hướng nhanh «Đơn công» → CreateUpdateRequest (testID settings-create-update-request)
 * Why: AT-01 — Settings không có entry tạo đi muộn / đơn công
 * must_keep: settings-scope-link; leave FAB path không đụng
 */
export function SettingsScreen() {
  const auth = useAuth();
  const nav = useNavigation<NavigationProp<MainTabParamList>>();
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

  const openQuickNav = useCallback(
    (screen: string) => {
      if (screen === 'PayrollSummary') {
        nav.navigate('TabPayslip', { screen: 'PayrollSummary' });
        return;
      }
      nav.navigate('TabProfile', { screen: screen as never });
    },
    [nav],
  );

  const navLinks: { title: string; screen: string; show?: boolean; testID?: string; onPress?: () => void }[] = [
    {
      title: vi.scope,
      screen: 'Scope',
      testID: SETTINGS_SCOPE_LINK_TEST_ID,
      onPress: () => navigateToScope(nav),
    },
    { title: vi.approvals, screen: 'ManagerApprovals', show: auth.isManager },
    {
      title: vi.requests,
      screen: 'CreateUpdateRequest',
      testID: 'settings-create-update-request',
      onPress: () => navigateToCreateUpdateRequest(nav),
    },
    { title: vi.payroll, screen: 'PayrollSummary' },
    { title: vi.contracts, screen: 'Contracts' },
    { title: vi.operations, screen: 'Operations', show: auth.isManager },
    { title: vi.profile, screen: 'Profile' },
    { title: vi.notifications, screen: 'Notifications' },
  ];

  return (
    <View testID={SETTINGS_SCREEN_TEST_ID} style={styles.root}>
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

      <PrimaryButton
        label={vi.logout}
        onPress={() => void auth.signOut()}
        variant="danger"
        testID="settings-logout"
      />

      <Text style={styles.sectionTitle}>Điều hướng nhanh</Text>
      <View style={styles.navList}>
        {navLinks
          .filter((l) => l.show !== false)
          .map((l) => (
            <ListRow
              key={l.screen}
              title={l.title}
              testID={l.testID}
              onPress={l.onPress ?? (() => openQuickNav(l.screen))}
            />
          ))}
      </View>
    </AppScreenLayout>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scopeText: {
    color: colors.text,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.fontSize.title2,
    fontWeight: typography.fontWeight.semibold,
    marginTop: spacing.sm,
  },
  navList: { gap: spacing.sm },
});
