import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { EmployeeHeroCard } from '../../components/profile/EmployeeHeroCard';
import { IconDetailRow } from '../../components/profile/IconDetailRow';
import { ProfileDocumentCard } from '../../components/profile/ProfileDocumentCard';
import { ProfileQuickActionGrid } from '../../components/profile/ProfileQuickActionGrid';
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
import { fetchEmployeeById, patchEmployeeAvatarUrl, type EmployeeRow } from '../../integrations/hrmEmployees';
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
} from '../../navigation/profileStackNav';
import { groupedLayout } from '../../theme/groupedLayout';
import { colors, typography } from '../../theme/tokens';
import { formatHrmCurrency, formatHrmDate } from '../../utils/formatHrm';
import type { ProfileQuickActionId } from '../../utils/profileQuickActions';
import {
  buildProfileInfoSections,
  buildProfileWorkSections,
  PROFILE_TAB_OPTIONS,
  resolveContractTypeLabel,
  resolveProfileDepartment,
  sanitizeProfileDisplay,
  type ProfileContractDoc,
  type ProfileTabKey,
} from '../../utils/profileTabs';
import { canHrFullEmployeePatch } from '../../utils/profileEssFields';
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
  const [avatarUploading, setAvatarUploading] = useState(false);

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
    const row = await fetchEmployeeById(auth.getHrmAuth(), id);
    if (!row) {
      setSubtitle('Không tìm thấy hồ sơ. Thử làm mới hoặc liên hệ HR.');
      setEmployee(null);
      return;
    }
    applyRow(row);
    const companyId = auth.getAttendanceCompanyId();
    if (companyId) {
      await loadPendingTask(companyId, id);
    } else {
      setCurrentTask(null);
      setPendingLeaveCount(0);
      setPendingUpdateCount(0);
    }
    await Promise.all([loadDocuments(id), loadWorkMetrics(id)]);
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

  const infoSections = useMemo(() => (employee ? buildProfileInfoSections(employee) : []), [employee]);
  const workSections = useMemo(() => (employee ? buildProfileWorkSections(employee) : []), [employee]);

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
    [checkInAt, employee?.status, hasAttendanceToday, leaveBalance, pendingLeaveCount, pendingUpdateCount],
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

  const save = async () => {
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
              fullName={fullName}
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
            {infoSections.map((section) => (
              <ProfileSectionCard
                key={section.title}
                title={section.title}
                icon="mail"
                testID={`profile-info-section-${section.title}`}
              >
                {section.rows.map((row) => (
                  <IconDetailRow
                    key={`${section.title}-${row.label}`}
                    icon={row.label === 'Email' ? 'mail-outline' : 'id-card-outline'}
                    label={row.label}
                    value={row.value}
                    numeric={row.numeric}
                  />
                ))}
              </ProfileSectionCard>
            ))}
            {hrCanEditProfile ? (
              <ProfileSectionCard title="Cập nhật hồ sơ (HR)" icon="create-outline">
                <FormField label="Họ tên" value={fullName} onChangeText={setFullName} />
                <FormField label="Chức danh" value={jobTitle} onChangeText={setJobTitle} />
                <PrimaryButton
                  label={saving ? vi.loading : vi.save}
                  onPress={() => void save()}
                  disabled={saving}
                  loading={saving}
                />
              </ProfileSectionCard>
            ) : (
              <ProfileSectionCard title="Cập nhật hồ sơ" icon="information-circle-outline">
                <Text style={styles.emptyHint}>
                  Bạn có thể đổi ảnh đại diện ở trên. Các thông tin khác — liên hệ HR để chỉnh sửa.
                </Text>
              </ProfileSectionCard>
            )}
          </View>
        ) : null}

        {tab === 'work' ? (
          <View testID="profile-tab-work">
            <StatusMetricGrid metrics={statusMetrics} />
            <ProfileQuickActionGrid onAction={onQuickAction} />
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
