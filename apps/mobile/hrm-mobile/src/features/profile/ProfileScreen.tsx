/**
 * @CODE-MEMORY
 * Screen:     TabProfile → Profile (Thông tin / Công việc / Tài liệu)
 * UC:         UC-HRM-MOB-12 · UC-HRM-MOB-12 full (W7-6) · J-AVT-02
 * BR:         BR-ESS-01 · BR-BDAY-01 · avatar self PATCH
 * SRS:        docs/hrm/MOBILE_W7_SRS_DELTA.md §4.5 · SRS_MOBILE UC-HRM-MOB-12
 * TechSpec:   MOBILE_W7_TECHSPEC_DELTA DynamicProfileForm · avatar baseline
 * Purpose:    ESS profile: hero+avatar, catalog-driven DynamicProfileForm (phone self-edit),
 *             work metrics, documents. Self PATCH custom_fields allowlist (phone).
 * WorkItem:   PCOMP-W7-MOB-PROFILE-FULL-01
 * Coded:      2026-06-09
 * @CODE-MEMORY-CHANGE 2026-07-19 — W7-6 DynamicProfileForm + settings-catalogs fields + ESS save
 * @CODE-MEMORY-CHANGE 2026-07-28 PCOMP-W7-MOB-PROFILE-FULL-01
 * What: Catalog + employee GET use resolveDirectoryQueryCompanyId (Plane B ≡ directory).
 * must_keep: directory Plane B GWC; dual-plane JWT …0001; attendance write UUID paths untouched
 * @CODE-MEMORY-CHANGE 2026-07-28 D-UX-R3-WCAG-MOBILE-01
 * What: Profile ESS sample WCAG 2.4.12 — SegmentedTabBar ≥44; AppScreenLayout scroll clears tab/home indicator; ESS save ≥44.
 * must_keep: touch ≥44; testID profile-screen / dynamic-profile-form / profile-ess-save
 *
 * Callers: RootNavigator TabProfile stack · Dashboard navigateToProfileRoot
 * Callees: fetchEmployeeById · fetchEmployeeFieldsCatalog · patchEmployeeCustomFields · upload avatar
 * @CODE-MEMORY-CHANGE 2026-08-01 MOB-NAV-SETTINGS-01 — ProfileSettingsEntry → SettingsScreen (TC-MOB-032/006)
 * must_keep: profile-settings-entry testID; Profile hero/form testIDs unchanged
 * LastVerified: docs/qa/evidence/d-ux-r3-wcag-mobile-01-20260728.md
 */
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { DynamicProfileForm } from '../../components/profile/DynamicProfileForm';
import { EmployeeHeroCard } from '../../components/profile/EmployeeHeroCard';
import { IconDetailRow } from '../../components/profile/IconDetailRow';
import { ProfileDocumentCard } from '../../components/profile/ProfileDocumentCard';
import { ProfileManagerApprovalsEntry } from '../../components/profile/ProfileManagerApprovalsEntry';
import { ProfileQuickActionGrid } from '../../components/profile/ProfileQuickActionGrid';
import { ProfileSettingsEntry } from '../../components/profile/ProfileSettingsEntry';
import { ProfileSectionCard } from '../../components/profile/ProfileSectionCard';
import { ProfileTaskCard } from '../../components/profile/ProfileTaskCard';
import { StatusMetricGrid } from '../../components/profile/StatusMetricGrid';
import { AppScreenLayout } from '../../components/ui/AppScreenLayout';
import { FormField } from '../../components/ui/FormField';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { SegmentedTabBar } from '../../components/ui/SegmentedTabBar';
import { useAuth } from '../../context/AuthContext';
import { useOfflineWriteGuard } from '../../hooks/useOfflineWriteGuard';
import { readListRows } from '../../integrations/envelope';
import { fetchLeaveBalance, type LeaveBalancePayload } from '../../integrations/hrmLeaveBalance';
import { getDefaultBaseUrl, hrmRequest } from '../../integrations/hrmApiClient';
import { resolveAvatarUploadCompanyId, uploadHrmAvatarFile } from '../../integrations/hrmFileUpload';
import {
  fetchEmployeeById,
  patchEmployeeAvatarUrl,
  patchEmployeeCustomFields,
  type EmployeeRow,
} from '../../integrations/hrmEmployees';
import { resolveDirectoryQueryCompanyId } from '../../integrations/companyWireScope';
import { fetchEmployeeFieldsCatalog } from '../../integrations/hrmEmployeeFieldsCatalog';
import {
  buildEmployeePayslipQuery,
  type PayslipListRow,
} from '../../integrations/payrollPayslips';
import { vi } from '../../i18n/vi';
import type { MainTabParamList } from '../../navigation/types';
import {
  navigateToContracts,
  navigateToLeaveRequestsList,
  navigateToManagerApprovals,
  navigateToSettings,
} from '../../navigation/profileStackNav';
import { groupedLayout } from '../../theme/groupedLayout';
import { colors, typography } from '../../theme/tokens';
import { formatHrmCurrency, formatHrmDate } from '../../utils/formatHrm';
import type { ProfileQuickActionId } from '../../utils/profileQuickActions';
import {
  buildProfileWorkSections,
  PROFILE_TAB_OPTIONS,
  resolveContractTypeLabel,
  resolveProfileDepartment,
  sanitizeProfileDisplay,
  type ProfileContractDoc,
  type ProfileTabKey,
} from '../../utils/profileTabs';
import { canHrFullEmployeePatch, readEmployeeCustomFields } from '../../utils/profileEssFields';
import {
  buildDynamicProfileFields,
  buildSelfEssCustomFieldsPatch,
  draftFromDynamicFields,
  type EmployeeFieldCatalogItem,
} from '../../utils/dynamicProfileForm';
import { fetchManagerPendingSnapshot } from '../../utils/profileManagerApprovals';
import { resolveProfileCurrentTask, type ProfileCurrentTask } from '../../utils/profileTask';
import { buildProfileStatusMetrics } from '../../utils/profileWorkMetrics';
import { resolveRoleSubtitle } from '../../utils/dashboardEss';
import { formatHrmError, statusLabel } from '../../integrations/mapApiError';

export function ProfileScreen() {
  const auth = useAuth();
  const navigation = useNavigation<NavigationProp<MainTabParamList>>();
  const blockIfOffline = useOfflineWriteGuard();

  const [tab, setTab] = useState<ProfileTabKey>('info');
  const [employee, setEmployee] = useState<EmployeeRow | null>(null);
  const [fieldCatalog, setFieldCatalog] = useState<EmployeeFieldCatalogItem[] | null>(null);
  const [essDraft, setEssDraft] = useState<Record<string, string>>({});
  const [fullName, setFullName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [employeeCode, setEmployeeCode] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [subtitle, setSubtitle] = useState('');
  const [currentTask, setCurrentTask] = useState<ProfileCurrentTask | null>(null);
  const [payslips, setPayslips] = useState<PayslipListRow[]>([]);
  const [contracts, setContracts] = useState<ProfileContractDoc[]>([]);
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalancePayload | null>(null);
  const [pendingLeaveCount, setPendingLeaveCount] = useState(0);
  const [pendingUpdateCount, setPendingUpdateCount] = useState(0);
  const [hasAttendanceToday, setHasAttendanceToday] = useState(false);
  const [checkInAt, setCheckInAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [essSaving, setEssSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [managerPendingTotal, setManagerPendingTotal] = useState(0);

  const baseUrl = auth.getHrmAuth().baseUrl || getDefaultBaseUrl();
  const hrCanEditProfile = canHrFullEmployeePatch(auth.roles);

  const applyRow = useCallback((row: EmployeeRow) => {
    setEmployee(row);
    setFullName(row.full_name);
    setJobTitle(row.job_title_key ?? '');
    setEmployeeCode(row.employee_code);
    setAvatarUrl(row.avatar_url ?? null);
    const dept = resolveProfileDepartment(row);
    const role = resolveRoleSubtitle(row.job_title_key);
    setSubtitle(dept && role ? `${dept} · ${role}` : role || dept);
  }, []);

  const loadPendingTask = useCallback(
    async (companyId: string, employeeId: string) => {
      const leaveQ = new URLSearchParams({
        company_id: companyId,
        employee_id: employeeId,
        status: 'pending',
      });
      const updateQ = new URLSearchParams({
        company_id: companyId,
        employee_id: employeeId,
        status: 'pending',
      });
      const cfg = auth.getHrmAuth();
      const [leaveRes, updateRes] = await Promise.all([
        hrmRequest<unknown>(cfg, `/attendance/leave-requests?${leaveQ.toString()}`, { method: 'GET' }),
        hrmRequest<unknown>(cfg, `/attendance/update-requests?${updateQ.toString()}`, { method: 'GET' }),
      ]);
      const leaveRows = leaveRes.ok
        ? readListRows<{
            id: string;
            leave_type: string;
            start_date: string;
            end_date: string;
            status: string;
          }>(leaveRes.data)
        : [];
      const updateRows = updateRes.ok
        ? readListRows<{ id: string; update_type: string; status: string }>(updateRes.data)
        : [];
      setPendingLeaveCount(leaveRows.length);
      setPendingUpdateCount(updateRows.length);
      setCurrentTask(resolveProfileCurrentTask(leaveRows, updateRows));
    },
    [auth],
  );

  const loadWorkMetrics = useCallback(
    async (employeeId: string) => {
      const cfg = auth.getHrmAuth();
      const cid = auth.getAttendanceCompanyId();
      const today = new Date().toISOString().slice(0, 10);

      const balancePromise = fetchLeaveBalance(cfg, { employeeId });
      const attPromise =
        cid && employeeId
          ? hrmRequest<unknown>(
              cfg,
              `/attendance/records?${new URLSearchParams({
                company_id: cid,
                employee_id: employeeId,
                from_date: today,
                to_date: today,
                page: '1',
                page_size: '10',
              }).toString()}`,
              { method: 'GET' },
            )
          : Promise.resolve(null);

      const [balanceRes, attRes] = await Promise.all([balancePromise, attPromise]);
      setLeaveBalance(balanceRes.ok ? balanceRes.data : null);

      if (attRes && attRes.ok) {
        const rows = readListRows<{ check_in_at?: string | null }>(attRes.data);
        setHasAttendanceToday(rows.length > 0);
        setCheckInAt(rows[0]?.check_in_at ?? null);
      } else {
        setHasAttendanceToday(false);
        setCheckInAt(null);
      }
    },
    [auth],
  );

  const loadDocuments = useCallback(
    async (employeeId: string) => {
      const payrollCid = auth.getPayrollQueryCompanyId();
      const attendanceCid = auth.getAttendanceCompanyId();
      const cfg = auth.getHrmAuth();
      const tasks: Promise<void>[] = [];

      if (payrollCid && employeeId) {
        tasks.push(
          (async () => {
            const q = buildEmployeePayslipQuery(payrollCid, employeeId);
            const res = await hrmRequest<unknown>(cfg, `/payroll/payslips?${q}`, { method: 'GET' });
            setPayslips(res.ok ? readListRows<PayslipListRow>(res.data) : []);
          })(),
        );
      } else {
        setPayslips([]);
      }

      if (attendanceCid && employeeId) {
        tasks.push(
          (async () => {
            const q = new URLSearchParams({ company_id: attendanceCid, employee_id: employeeId });
            const res = await hrmRequest<unknown>(
              cfg,
              `/contracts-insurance/contracts?${q.toString()}`,
              { method: 'GET' },
            );
            setContracts(res.ok ? readListRows<ProfileContractDoc>(res.data) : []);
          })(),
        );
      } else {
        setContracts([]);
      }

      await Promise.all(tasks);
    },
    [auth],
  );

  const load = useCallback(async () => {
    const id = auth.employeeId.trim();
    if (!id) {
      setSubtitle('Chưa có thông tin nhân viên.');
      setEmployee(null);
      setFieldCatalog(null);
      setEssDraft({});
      setFullName('');
      setJobTitle('');
      setEmployeeCode('');
      setAvatarUrl(null);
      setCurrentTask(null);
      setPayslips([]);
      setContracts([]);
      setLeaveBalance(null);
      setPendingLeaveCount(0);
      setPendingUpdateCount(0);
      setHasAttendanceToday(false);
      setCheckInAt(null);
      return;
    }
    // Plane B TEXT slug (holding/trsport/main) — same resolver as directory W7-5 GWC
    const hrmAuth = auth.getHrmAuth();
    const catalogCid = resolveDirectoryQueryCompanyId({
      companyUuid: hrmAuth.companyUuid,
      companyId: hrmAuth.companyId,
      accessToken: hrmAuth.accessToken,
      memberships: hrmAuth.memberships,
      employeeId: hrmAuth.employeeId ?? auth.employeeId,
      tenantId: hrmAuth.tenantId,
    });
    const catalogPromise = catalogCid
      ? fetchEmployeeFieldsCatalog(hrmAuth, catalogCid)
      : Promise.resolve(null);
    const [row, catalog] = await Promise.all([
      fetchEmployeeById(hrmAuth, id),
      catalogPromise,
    ]);
    setFieldCatalog(catalog);
    if (!row) {
      setSubtitle('Không tìm thấy hồ sơ. Thử làm mới hoặc liên hệ HR.');
      setEmployee(null);
      setEssDraft({});
      return;
    }
    applyRow(row);
    const dynamic = buildDynamicProfileFields(row, catalog, {
      isHr: canHrFullEmployeePatch(auth.roles),
    });
    setEssDraft(draftFromDynamicFields(dynamic));
    const companyId = auth.getAttendanceCompanyId();
    if (companyId) {
      await loadPendingTask(companyId, id);
    } else {
      setCurrentTask(null);
      setPendingLeaveCount(0);
      setPendingUpdateCount(0);
    }
    await Promise.all([loadDocuments(id), loadWorkMetrics(id)]);

    if (auth.isManager) {
      const attendanceCid = auth.getAttendanceCompanyId();
      if (attendanceCid) {
        const mgrPending = await fetchManagerPendingSnapshot(hrmAuth, attendanceCid, id);
        setManagerPendingTotal(mgrPending.total);
      } else {
        setManagerPendingTotal(0);
      }
    } else {
      setManagerPendingTotal(0);
    }
  }, [applyRow, auth, loadDocuments, loadPendingTask, loadWorkMetrics]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      await load();
    } finally {
      setLoading(false);
    }
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const dynamicFields = useMemo(
    () =>
      employee
        ? buildDynamicProfileFields(employee, fieldCatalog, { isHr: hrCanEditProfile })
        : [],
    [employee, fieldCatalog, hrCanEditProfile],
  );
  const workSections = useMemo(
    () => (employee ? buildProfileWorkSections(employee) : []),
    [employee],
  );

  const statusMetrics = useMemo(
    () =>
      buildProfileStatusMetrics({
        leaveBalance,
        pendingLeaveCount,
        pendingUpdateCount,
        hasAttendanceToday,
        checkInAt,
        employmentStatus: employee?.status,
      }),
    [
      checkInAt,
      employee?.status,
      hasAttendanceToday,
      leaveBalance,
      pendingLeaveCount,
      pendingUpdateCount,
    ],
  );

  const uploadAndPatchAvatar = useCallback(
    async (payload: { uri: string; fileName: string; mimeType: string; byteSize?: number }) => {
      const off = blockIfOffline();
      if (off) {
        Alert.alert(vi.error, `${off}`);
        return null;
      }
      const id = auth.employeeId.trim();
      if (!id) {
        Alert.alert(vi.error, 'Thiếu thông tin nhân viên.');
        return null;
      }

      setAvatarUploading(true);
      try {
        const cfg = auth.getHrmAuth();
        const companyId = resolveAvatarUploadCompanyId(cfg);
        const upload = await uploadHrmAvatarFile(cfg, payload, companyId);
        if (!upload.ok) {
          Alert.alert(vi.error, upload.message);
          return null;
        }

        const patch = await patchEmployeeAvatarUrl(cfg, id, upload.data.url);
        if (!patch.ok) {
          Alert.alert(vi.error, formatHrmError(patch));
          return null;
        }

        setAvatarUrl(upload.data.url);
        Alert.alert('Thành công', 'Đã cập nhật ảnh đại diện.');
        return upload.data.absoluteUrl;
      } finally {
        setAvatarUploading(false);
      }
    },
    [auth, blockIfOffline],
  );

  const removeAvatar = useCallback(async () => {
    const off = blockIfOffline();
    if (off) {
      Alert.alert(vi.error, `${off}`);
      return;
    }
    const id = auth.employeeId.trim();
    if (!id) return;

    setAvatarUploading(true);
    try {
      const patch = await patchEmployeeAvatarUrl(auth.getHrmAuth(), id, null);
      if (!patch.ok) {
        Alert.alert(vi.error, formatHrmError(patch));
        return;
      }
      setAvatarUrl(null);
      Alert.alert('Thành công', 'Đã xóa ảnh đại diện.');
    } finally {
      setAvatarUploading(false);
    }
  }, [auth, blockIfOffline]);

  const saveHrProfile = async () => {
    if (!hrCanEditProfile) {
      Alert.alert('Thông báo', 'Liên hệ HR để cập nhật họ tên và chức danh.');
      return;
    }
    const off = blockIfOffline();
    if (off) {
      Alert.alert(vi.error, `${off}`);
      return;
    }
    const id = auth.employeeId.trim();
    if (!id) {
      Alert.alert(vi.error, 'Thiếu thông tin nhân viên.');
      return;
    }
    if (!fullName.trim()) {
      Alert.alert(vi.error, 'Nhập họ tên.');
      return;
    }
    setSaving(true);
    try {
      const res = await hrmRequest<unknown>(auth.getHrmAuth(), `/employees/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          full_name: fullName.trim(),
          job_title_key: jobTitle.trim() || undefined,
        }),
      });
      if (res.ok) {
        Alert.alert('Thành công', 'Đã lưu hồ sơ.');
        void load();
      } else Alert.alert(vi.error, formatHrmError(res));
    } finally {
      setSaving(false);
    }
  };

  const saveEssFields = async () => {
    const off = blockIfOffline();
    if (off) {
      Alert.alert(vi.error, `${off}`);
      return;
    }
    const id = auth.employeeId.trim();
    if (!id || !employee) {
      Alert.alert(vi.error, 'Thiếu thông tin nhân viên.');
      return;
    }
    const existing = readEmployeeCustomFields(employee);
    const merged = buildSelfEssCustomFieldsPatch(existing, essDraft);
    if (!merged) {
      Alert.alert('Thông báo', 'Không có thay đổi số điện thoại để lưu.');
      return;
    }
    setEssSaving(true);
    try {
      const res = await patchEmployeeCustomFields(auth.getHrmAuth(), id, merged);
      if (res.ok) {
        Alert.alert('Thành công', 'Đã cập nhật thông tin liên hệ.');
        void load();
      } else {
        const code = 'code' in res ? String(res.code) : '';
        if (code === 'HRM-EMP-403') {
          Alert.alert(
            'Thông báo',
            'Hệ thống chưa mở quyền tự sửa số điện thoại. Vui lòng liên hệ HR để cập nhật.',
          );
        } else {
          Alert.alert(vi.error, formatHrmError(res));
        }
      }
    } finally {
      setEssSaving(false);
    }
  };

  const onQuickAction = useCallback(
    (id: ProfileQuickActionId) => {
      switch (id) {
        case 'payslip':
          navigation.navigate('TabPayslip', { screen: 'PayslipList' });
          break;
        case 'leave':
          navigateToLeaveRequestsList(navigation);
          break;
        case 'check_in':
          navigation.navigate('TabAttendance', { screen: 'CheckIn' });
          break;
        case 'approvals':
          navigateToManagerApprovals(navigation);
          break;
        default:
          break;
      }
    },
    [navigation],
  );

  const openPayslip = useCallback(
    (payslip: PayslipListRow) => {
      navigation.navigate('TabPayslip', {
        screen: 'PayslipDetail',
        params: {
          payslipId: payslip.id,
          periodLabel: sanitizeProfileDisplay(payslip.period_label) || 'Phiếu lương',
        },
      });
    },
    [navigation],
  );

  const openContracts = useCallback(() => {
    navigateToContracts(navigation);
  }, [navigation]);

  const essCanSave = useMemo(() => {
    if (!employee) return false;
    const existing = readEmployeeCustomFields(employee);
    return buildSelfEssCustomFieldsPatch(existing, essDraft) != null;
  }, [employee, essDraft]);

  const quickActionBadges = useMemo(
    () =>
      auth.isManager && managerPendingTotal > 0
        ? ({ approvals: managerPendingTotal } as Partial<Record<ProfileQuickActionId, number>>)
        : undefined,
    [auth.isManager, managerPendingTotal],
  );

  const goManagerApprovals = useCallback(() => {
    navigateToManagerApprovals(navigation);
  }, [navigation]);

  const goSettings = useCallback(() => {
    navigateToSettings(navigation);
  }, [navigation]);

  return (
    <AppScreenLayout
      subtitle={subtitle || 'Cập nhật thông tin cá nhân'}
      stackHeaderPresent
      loading={loading && !subtitle}
      onRefresh={refresh}
      refreshing={loading}
      grouped
      scroll
      keyboardShouldPersistTaps="handled"
    >
      <View testID="profile-screen">
        <View style={styles.tabWrap} testID="profile-tab-bar">
          <SegmentedTabBar value={tab} options={PROFILE_TAB_OPTIONS} onChange={setTab} />
        </View>

        {tab === 'info' ? (
          <View testID="profile-tab-info">
            <EmployeeHeroCard
              fullName={fullName || sanitizeProfileDisplay(employeeCode) || 'Hồ sơ'}
              subtitle={subtitle}
              employmentStatus={employee?.status ?? 'active'}
              avatar={{
                avatarUrl,
                baseUrl,
                uploading: avatarUploading,
                onPickAndUpload: uploadAndPatchAvatar,
                onRemove: removeAvatar,
              }}
            />
            <ProfileSettingsEntry onPress={goSettings} />
            {auth.isManager ? (
              <ProfileManagerApprovalsEntry
                pendingCount={managerPendingTotal}
                onPress={goManagerApprovals}
              />
            ) : null}
            {employee ? (
              <DynamicProfileForm
                fields={dynamicFields}
                draft={essDraft}
                onChangeField={(code, value) =>
                  setEssDraft((prev) => ({ ...prev, [code]: value }))
                }
                onSave={() => void saveEssFields()}
                saving={essSaving}
                canSave={essCanSave}
                hint={
                  hrCanEditProfile
                    ? undefined
                    : 'Bạn có thể sửa số điện thoại bên dưới (nếu được phép). Họ tên / mã NV do HR quản lý.'
                }
              />
            ) : (
              <ProfileSectionCard title="Hồ sơ" icon="alert-circle-outline">
                <Text style={styles.emptyHint} testID="profile-ess-missing">
                  {subtitle || 'Không tìm thấy hồ sơ. Thử làm mới hoặc liên hệ HR.'}
                </Text>
              </ProfileSectionCard>
            )}
            {hrCanEditProfile ? (
              <ProfileSectionCard title="Cập nhật hồ sơ (HR)" icon="create-outline">
                <FormField label="Họ tên" value={fullName} onChangeText={setFullName} />
                <FormField label="Chức danh" value={jobTitle} onChangeText={setJobTitle} />
                <PrimaryButton
                  label={saving ? vi.loading : vi.save}
                  onPress={() => void saveHrProfile()}
                  disabled={saving}
                  loading={saving}
                  testID="profile-hr-save"
                />
              </ProfileSectionCard>
            ) : null}
          </View>
        ) : null}

        {tab === 'work' ? (
          <View testID="profile-tab-work">
            <StatusMetricGrid metrics={statusMetrics} />
            <ProfileQuickActionGrid
              onAction={onQuickAction}
              isManager={auth.isManager}
              badgeCounts={quickActionBadges}
            />
            {currentTask ? <ProfileTaskCard task={currentTask} /> : null}
            {workSections.map((section) => (
              <ProfileSectionCard key={section.title} title={section.title} icon="briefcase-outline">
                {section.rows.map((row) => (
                  <IconDetailRow
                    key={`${section.title}-${row.label}`}
                    icon="ellipse-outline"
                    label={row.label}
                    value={row.value}
                    numeric={row.numeric}
                  />
                ))}
              </ProfileSectionCard>
            ))}
            {!currentTask && workSections.length === 0 ? (
              <Text style={styles.emptyHint}>Chưa có dữ liệu công việc.</Text>
            ) : null}
          </View>
        ) : null}

        {tab === 'documents' ? (
          <View testID="profile-tab-documents">
            {payslips.length > 0 ? (
              <ProfileSectionCard title="Phiếu lương gần đây" icon="wallet-outline">
                {payslips.slice(0, 5).map((p) => (
                  <ProfileDocumentCard
                    key={p.id}
                    kind="payslip"
                    title={sanitizeProfileDisplay(p.period_label) || 'Kỳ lương'}
                    subtitle="Phiếu lương"
                    amount={formatHrmCurrency(p.net_amount, p.currency)}
                    statusLabel={statusLabel(p.status)}
                    onPress={() => openPayslip(p)}
                    testID={`profile-doc-payslip-${p.id}`}
                  />
                ))}
              </ProfileSectionCard>
            ) : null}
            {contracts.length > 0 ? (
              <ProfileSectionCard title="Hợp đồng lao động" icon="document-text-outline">
                {contracts.slice(0, 5).map((c) => (
                  <ProfileDocumentCard
                    key={c.id}
                    kind="contract"
                    title={resolveContractTypeLabel(c.contract_type)}
                    subtitle={`${formatHrmDate(c.start_date)} – ${formatHrmDate(c.end_date)}`}
                    statusLabel={statusLabel(c.status)}
                    onPress={openContracts}
                    testID={`profile-doc-contract-${c.id}`}
                  />
                ))}
              </ProfileSectionCard>
            ) : null}
            {payslips.length === 0 && contracts.length === 0 ? (
              <ProfileSectionCard title="Tài liệu" icon="folder-open-outline">
                <Text style={styles.emptyHint}>Chưa có phiếu lương hoặc hợp đồng.</Text>
              </ProfileSectionCard>
            ) : null}
          </View>
        ) : null}
      </View>
    </AppScreenLayout>
  );
}

const styles = StyleSheet.create({
  tabWrap: {
    marginTop: groupedLayout.belowStackHeader,
    marginBottom: groupedLayout.belowBalanceCards,
  },
  emptyHint: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.footnote,
    lineHeight: typography.lineHeight.footnote,
    textAlign: 'center',
    paddingVertical: 8,
  },
});
