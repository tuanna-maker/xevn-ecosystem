/**
 * @CODE-MEMORY
 * Screen:     Requests → CreateLeaveRequest (4-step wizard)
 * UC:         UC-HRM-MOB-06 · UC-HRM-MOB-06b (W7-3) · UC-HRM-MOB-06c (W7-4)
 * BR:         BR-LEAVE-DOC-01 · BR-LEAVE-BAL-01 · BR-LEAVE-BAL-02
 * SRS:        docs/hrm/MOBILE_W7_SRS_DELTA.md §4.2 · §4.3 · docs/hrm/SRS_MOBILE.md MOB-06
 * TechSpec:   docs/hrm/MOBILE_W7_TECHSPEC_DELTA.md §3.5 · §3.6 · §4.2 LeaveBalanceChip · §5.2
 * Data:       docs/hrm/MOBILE_W7_DATA_CONTRACTS.md §3 attachment · §4 leave_balance
 * Purpose:    ESS create leave wizard; medical attach when required; leave-balance
 *             chip on steps 0–1 with exceed/depleted warn (pilot: warn, không chặn).
 * WorkItem:   PCOMP-W7-MOB-LEAVE-DOC · PCOMP-W7-MOB-LEAVE-DOC-02 · PCOMP-W7-MOB-LEAVE-BAL
 * Coded:      2026-07-19
 *
 * Callers: navigation RequestsStack → CreateLeaveRequest
 * Callees:
 *   - uploadLeaveAttachmentFile → POST /files/upload?feature=leave-attachment
 *   - fetchLeaveBalance → GET /attendance/leave-balance
 *   - requestHrm POST /attendance/leave-requests
 *   - LeaveAttachmentPicker · LeaveBalanceChip
 *
 * FE-Actions:
 *   | User action        | Handler              | Lib / RPC                         |
 *   |--------------------|----------------------|-----------------------------------|
 *   | Mount / đổi loại   | loadBalance          | GET leave-balance                 |
 *   | Chọn sick/maternity| setLeaveType         | show LeaveAttachmentPicker        |
 *   | Đính kèm           | uploadLeaveAttachment| uploadLeaveAttachmentFile         |
 *   | Tiếp tục (Bước 2)  | goNext               | leaveCreateStep1NextBlocked       |
 *   | Gửi đơn            | submit               | POST leave-requests+attachment_url|
 *
 * Impact:     Missing attach → AC-LEAVE-DOC FAIL; balance «—» on 200 → AC-LEAVE-BAL-01 FAIL
 * must_keep:  Offline guard; scope; SRS chip copy; BR-LEAVE-BAL-02 no invent block;
 *             step-1 Tiếp tục blocked (disabled + Alert) when sick/maternity without valid uploadedUrl
 * SOLID:      Screen orchestrates; BR in leaveAttachment + hrmLeaveBalance helpers
 * LastVerified: leaveAttachment.test.ts · leaveDocUx.test.ts · leaveBalanceChip.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-19 PCOMP-W7-MOB-LEAVE-BAL — LeaveBalanceChip + warn B2/B3
 * @CODE-MEMORY-CHANGE 2026-07-19 PCOMP-W7-MOB-LEAVE-DOC-APK — dual gate: disable Tiếp tục + Alert
 *             when BR-LEAVE-DOC attachment missing on step 1 (qa-device stale-APK FAIL)
 * @CODE-MEMORY-CHANGE 2026-07-28 PCOMP-W7-MOB-LEAVE-BAL-02 — reaffirm LeaveBalanceChip on step 0
 *             (testID leave-balance-chip); Plane B via fetchLeaveBalance → resolveDirectoryQueryCompanyId
 * @CODE-MEMORY-CHANGE 2026-07-28 PCOMP-W7-MOB-LEAVE-DOC-02 — goNext uses leaveCreateStep1NextBlocked;
 *             onPress no-op when nextDisabled; valid /api/hrm/files URL required (not local pick)
 */
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppScreenLayout } from '../../components/ui/AppScreenLayout';
import { ConfirmActionModal } from '../../components/ui/ConfirmActionModal';
import { LeaveAttachmentPicker } from '../../components/ui/LeaveAttachmentPicker';
import { LeaveBalanceChip } from '../../components/ui/LeaveBalanceChip';
import { DetailMetricGrid } from '../../components/ui/DetailMetricGrid';
import { FormField } from '../../components/ui/FormField';
import { HrmDateRangeField } from '../../components/ui/HrmDateRangeField';
import { PrimaryButton } from '../../components/ui/PrimaryButton';
import { StickyFooter } from '../../components/ui/StickyFooter';
import { SurfaceCard } from '../../components/ui/SurfaceCard';
import { useAuth } from '../../context/AuthContext';
import { useOfflineWriteGuard } from '../../hooks/useOfflineWriteGuard';
import {
  hydrateEmployeeMetaForRequest,
  resolveEmployeeMetaFromMemberships,
} from '../../integrations/hrmEmployees';
import {
  resolveAvatarUploadCompanyId,
  uploadLeaveAttachmentFile,
} from '../../integrations/hrmFileUpload';
import {
  fetchLeaveBalance,
  isLeaveBalanceNotConfiguredError,
  leaveBalanceWarnBannerText,
  resolveLeaveBalanceDisplayDays,
  resolveLeaveBalanceWarnLevel,
  type LeaveBalancePayload,
} from '../../integrations/hrmLeaveBalance';
import { formatHrmError } from '../../integrations/mapApiError';
import { resolveLeaveTypeLabel } from '../../i18n/leaveTypes';
import { vi } from '../../i18n/vi';
import { userFacingScopeError } from '../../utils/scopeError';
import type { RequestsStackParamList } from '../../navigation/types';
import { colors, radius, spacing, statusToneColor, typography } from '../../theme/tokens';
import { formatHrmDate, formatHrmDateRange } from '../../utils/formatHrm';
import {
  leaveAttachmentSubmitBlocked,
  leaveCreateStep1NextBlocked,
  leaveTypeRequiresAttachment,
  resolveLeaveAttachmentUrlForSubmit,
  type LeaveAttachmentDraft,
} from '../../utils/leaveAttachment';
import {
  computeLeaveTotalDays,
  leaveTypeOptions,
  toIsoDateOnly,
  type LeaveTypeOption,
} from '../../utils/leaveRequest';

const STEPS = ['Chọn ngày', 'Loại nghỉ', 'Xác nhận', 'Gửi đơn'] as const;
type StepIndex = 0 | 1 | 2 | 3;

export function CreateLeaveRequestScreen() {
  const auth = useAuth();
  const nav = useNavigation<NativeStackNavigationProp<RequestsStackParamList>>();
  const route = useRoute<RouteProp<RequestsStackParamList, 'CreateLeaveRequest'>>();
  const blockIfOffline = useOfflineWriteGuard();
  const isEdit = Boolean(route.params?.editId);
  const prefill = route.params?.prefill;

  const [step, setStep] = useState<StepIndex>(0);
  const [leaveType, setLeaveType] = useState<LeaveTypeOption>('annual');
  const [startDate, setStartDate] = useState(() => toIsoDateOnly(new Date()));
  const [endDate, setEndDate] = useState(() => toIsoDateOnly(new Date()));
  const [title, setTitle] = useState('Xin nghỉ từ mobile');
  const [reason, setReason] = useState('');
  const [employeeCode, setEmployeeCode] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [department, setDepartment] = useState('');
  const [position, setPosition] = useState('');
  const [contact, setContact] = useState('');
  const [handoverTasks, setHandoverTasks] = useState('');
  const [busy, setBusy] = useState(false);
  const [balance, setBalance] = useState<LeaveBalancePayload | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [balanceNotConfigured, setBalanceNotConfigured] = useState(false);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const [attachments, setAttachments] = useState<LeaveAttachmentDraft[]>([]);

  const cid = auth.getAttendanceCompanyId();
  const balanceQueryCid = auth.getLeaveBalanceQueryCompanyId();
  const eid = auth.employeeId.trim();
  const totalDays = useMemo(() => computeLeaveTotalDays(startDate, endDate), [startDate, endDate]);
  const remainingDays = balance ? resolveLeaveBalanceDisplayDays(balance) : null;
  const balanceWarnLevel = useMemo(
    () => resolveLeaveBalanceWarnLevel(remainingDays, totalDays),
    [remainingDays, totalDays],
  );
  const balanceWarnText = leaveBalanceWarnBannerText(balanceWarnLevel);

  useEffect(() => {
    if (prefill) {
      if (prefill.leaveType && leaveTypeOptions.includes(prefill.leaveType as LeaveTypeOption)) {
        setLeaveType(prefill.leaveType as LeaveTypeOption);
      }
      if (prefill.startDate) setStartDate(prefill.startDate);
      if (prefill.endDate) setEndDate(prefill.endDate);
      if (prefill.reason != null) {
        setTitle(prefill.reason);
        setReason(prefill.reason);
      }
      if (prefill.handoverTo != null) setContact(prefill.handoverTo);
      if (prefill.handoverTasks != null) setHandoverTasks(prefill.handoverTasks);
    }
  }, [prefill]);

  useEffect(() => {
    if (!eid) return;
    const fromMembership = resolveEmployeeMetaFromMemberships(auth.memberships, eid);
    if (fromMembership) {
      setEmployeeCode(fromMembership.employee_code);
      setEmployeeName(fromMembership.employee_name);
    }
    let cancelled = false;
    void (async () => {
      try {
        const meta = await hydrateEmployeeMetaForRequest(auth.getHrmAuth(), auth.memberships, eid);
        if (cancelled || !meta) return;
        setEmployeeCode(meta.employee_code);
        setEmployeeName(meta.employee_name);
        if (meta.department) setDepartment(meta.department);
      } catch {
        /* employee meta hydrate is best-effort — never surface as unhandled rejection */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [auth, eid]);

  useEffect(() => {
    if (endDate < startDate) setEndDate(startDate);
  }, [startDate, endDate]);

  useEffect(() => {
    // SRS UC-HRM-MOB-06c: on mount wizard GET leave-balance (TechSpec: chip step 0).
    if (!balanceQueryCid || !eid) return;
    let cancelled = false;
    setBalanceLoading(true);
    setBalanceNotConfigured(false);
    setBalanceError(null);
    void (async () => {
      try {
        const res = await fetchLeaveBalance(auth.getHrmAuth(), {
          employeeId: eid,
          leaveType,
        });
        if (cancelled) return;
        setBalanceLoading(false);
        if (res.ok) {
          setBalance(res.data);
          setBalanceNotConfigured(false);
          setBalanceError(null);
        } else if (isLeaveBalanceNotConfiguredError(res.code, res.httpStatus)) {
          setBalance(null);
          setBalanceNotConfigured(true);
          setBalanceError(null);
        } else {
          setBalance(null);
          setBalanceNotConfigured(false);
          setBalanceError(res.message || res.code || 'leave-balance-error');
        }
      } catch {
        if (!cancelled) {
          setBalanceLoading(false);
          setBalance(null);
          setBalanceNotConfigured(false);
          setBalanceError('leave-balance-error');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [auth, balanceQueryCid, eid, leaveType]);

  /** BR-LEAVE-DOC / AC-LEAVE-DOC-01: step 1 (Bước 2) must not advance to Bước 3 without valid uploaded URL. */
  const step1AttachmentBlock =
    step === 1 ? leaveCreateStep1NextBlocked(leaveType, attachments) : null;
  const nextBlockedByDates = step === 0 && totalDays < 0.5;
  const nextDisabled = Boolean(step1AttachmentBlock) || nextBlockedByDates;

  const goNext = () => {
    if (step === 0 && totalDays < 0.5) {
      Alert.alert(vi.error, 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.');
      return;
    }
    if (step === 1) {
      // AC-LEAVE-DOC-01 product gate — must not reach Bước 3 without valid uploadedUrl.
      const attachmentBlock = leaveCreateStep1NextBlocked(leaveType, attachments);
      if (attachmentBlock) {
        Alert.alert(vi.error, attachmentBlock);
        return;
      }
    }
    if (step < 3) setStep((s) => (s + 1) as StepIndex);
  };

  const goBack = () => {
    if (step > 0) setStep((s) => (s - 1) as StepIndex);
    else nav.goBack();
  };

  const submit = async () => {
    setConfirmSubmitOpen(false);
    const off = blockIfOffline();
    if (off) {
      Alert.alert(vi.error, `${off}: không gửi đơn khi ngoại tuyến.`);
      return;
    }
    if (!cid || !eid) {
      Alert.alert(vi.error, userFacingScopeError('companyAndEmployee'));
      return;
    }
    if (!employeeCode.trim() || !employeeName.trim()) {
      Alert.alert(vi.error, 'Thiếu mã/tên nhân viên.');
      return;
    }
    if (totalDays < 0.5) {
      Alert.alert(vi.error, 'Số ngày nghỉ tối thiểu 0.5.');
      return;
    }
    const attachmentBlock = leaveAttachmentSubmitBlocked(leaveType, attachments);
    if (attachmentBlock) {
      Alert.alert(vi.error, attachmentBlock);
      return;
    }
    setBusy(true);
    try {
      const reasonText = [title.trim(), reason.trim()].filter(Boolean).join(' — ') || undefined;
      // Wire SoT: DATA_CONTRACTS §3 / Nest DTO `attachment_url` (singular).
      // SRS §4.2 names `attachment_urls[]` — client may upload ≤3; BE persists first URL only.
      const attachmentUrl = resolveLeaveAttachmentUrlForSubmit(attachments);
      const body: Record<string, unknown> = {
        company_id: cid,
        employee_id: eid,
        employee_code: employeeCode.trim(),
        employee_name: employeeName.trim(),
        department: department.trim() || undefined,
        position: position.trim() || undefined,
        leave_type: leaveType,
        start_date: startDate,
        end_date: endDate,
        total_days: totalDays,
        reason: reasonText,
        handover_to: contact.trim() || undefined,
        handover_tasks: handoverTasks.trim() || undefined,
      };
      if (attachmentUrl) {
        body.attachment_url = attachmentUrl;
      }
      const res = await auth.requestHrm<unknown>('/attendance/leave-requests', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      if (res.ok) {
        Alert.alert(
          'Đã gửi đơn',
          isEdit
            ? 'Đơn mới đã được tạo. Đơn cũ vẫn chờ duyệt cho đến khi quản lý xử lý.'
            : 'Đơn nghỉ phép đã được gửi thành công.',
          [{ text: 'OK', onPress: () => nav.navigate('LeaveRequestsList') }],
        );
      } else {
        Alert.alert(vi.error, formatHrmError(res));
      }
    } catch (e) {
      Alert.alert(vi.error, e instanceof Error ? e.message : 'Không gửi được đơn nghỉ phép');
    } finally {
      setBusy(false);
    }
  };

  const uploadLeaveAttachment = async (draft: LeaveAttachmentDraft): Promise<LeaveAttachmentDraft | null> => {
    const cfg = auth.getHrmAuth();
    const companyId = resolveAvatarUploadCompanyId(cfg);
    const upload = await uploadLeaveAttachmentFile(cfg, draft, companyId);
    if (!upload.ok) {
      Alert.alert(vi.error, upload.message ?? 'Không tải được giấy tờ.');
      return null;
    }
    return { ...draft, uploadedUrl: upload.data.url };
  };

  const stepContent = () => {
    switch (step) {
      case 0:
        return (
          <SurfaceCard title="Bước 1 · Chọn ngày">
            <Text style={styles.hint}>Chọn khoảng thời gian nghỉ trên lịch.</Text>
            <LeaveBalanceChip
              balance={balance}
              loading={balanceLoading}
              notConfigured={balanceNotConfigured}
              error={balanceError}
            />
            <HrmDateRangeField
              label="Khoảng ngày nghỉ"
              startDate={startDate}
              endDate={endDate}
              onChange={(start, end) => {
                setStartDate(start);
                setEndDate(end);
              }}
            />
            <Text style={styles.meta}>Tổng: {totalDays} ngày · {formatHrmDateRange(startDate, endDate)}</Text>
            {balanceWarnText ? (
              <Text
                style={balanceWarnLevel === 'depleted' ? styles.warnDanger : styles.warn}
                testID="leave-balance-warn-step0"
              >
                {balanceWarnText}
              </Text>
            ) : null}
          </SurfaceCard>
        );
      case 1:
        return (
          <SurfaceCard title="Bước 2 · Loại nghỉ">
            <Text style={styles.hint}>Chọn loại nghỉ — số dư cập nhật theo loại đã chọn.</Text>
            <View style={styles.typeGrid}>
              {leaveTypeOptions.map((code) => {
                const on = leaveType === code;
                return (
                  <Pressable
                    key={code}
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                    onPress={() => {
                      setLeaveType(code);
                      if (!leaveTypeRequiresAttachment(code)) {
                        setAttachments([]);
                      }
                    }}
                    style={[styles.typeChip, on && styles.typeChipOn]}
                  >
                    <Text style={[styles.typeChipText, on && styles.typeChipTextOn]}>
                      {resolveLeaveTypeLabel(code)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <LeaveBalanceChip
              balance={balance}
              loading={balanceLoading}
              notConfigured={balanceNotConfigured}
              error={balanceError}
            />
            {balanceWarnText ? (
              <Text
                style={balanceWarnLevel === 'depleted' ? styles.warnDanger : styles.warn}
                testID="leave-balance-warn-step1"
              >
                {balanceWarnText}
              </Text>
            ) : null}
            {leaveTypeRequiresAttachment(leaveType) ? (
              <LeaveAttachmentPicker
                attachments={attachments}
                onChange={setAttachments}
                onUpload={uploadLeaveAttachment}
                disabled={busy}
              />
            ) : null}
          </SurfaceCard>
        );
      case 2:
        return (
          <>
            <SurfaceCard title="Bước 3 · Xác nhận">
              <DetailMetricGrid
                metrics={[
                  { label: 'Loại nghỉ', value: '', leaveTypeCode: leaveType },
                  { label: 'Số ngày', value: `${totalDays} ngày` },
                  { label: 'Từ ngày', value: formatHrmDate(startDate) },
                  { label: 'Đến ngày', value: formatHrmDate(endDate) },
                ]}
              />
              {balanceWarnText ? (
                <Text
                  style={balanceWarnLevel === 'depleted' ? styles.warnDanger : styles.warn}
                  testID="leave-balance-warn-step2"
                >
                  {balanceWarnText}
                </Text>
              ) : null}
              {totalDays > 5 ? (
                <Text style={styles.warn}>Cảnh báo: đơn nghỉ dài — vui lòng xác nhận số ngày với quản lý.</Text>
              ) : null}
            </SurfaceCard>
            <SurfaceCard title="Chi tiết bổ sung">
              <FormField label="Tiêu đề" value={title} onChangeText={setTitle} />
              <FormField label="Liên hệ" value={contact} onChangeText={setContact} placeholder="SĐT hoặc người liên hệ" />
              <FormField label="Mô tả" value={reason} onChangeText={setReason} multiline />
              <FormField
                label="Công việc bàn giao (tuỳ chọn)"
                value={handoverTasks}
                onChangeText={setHandoverTasks}
                multiline
              />
            </SurfaceCard>
          </>
        );
      case 3:
      default:
        return (
          <SurfaceCard title="Bước 4 · Gửi đơn">
            <Text style={styles.hint}>Kiểm tra lại trước khi gửi. Đơn sẽ ở trạng thái «Chờ duyệt».</Text>
            <DetailMetricGrid
              metrics={[
                { label: 'Nhân viên', value: employeeName || '—' },
                { label: 'Mã NV', value: employeeCode || '—' },
                { label: 'Loại nghỉ', value: '', leaveTypeCode: leaveType },
                { label: 'Thời gian', value: formatHrmDateRange(startDate, endDate) },
              ]}
            />
            {title.trim() ? <Text style={styles.reviewReason}>Tiêu đề: {title.trim()}</Text> : null}
            {reason.trim() ? <Text style={styles.reviewReason}>Mô tả: {reason.trim()}</Text> : null}
            {attachments.some((a) => a.uploadedUrl) ? (
              <Text style={styles.reviewReason}>
                Đính kèm: {attachments.filter((a) => a.uploadedUrl).map((a) => a.fileName).join(', ')}
              </Text>
            ) : null}
          </SurfaceCard>
        );
    }
  };

  const footer = (
    <StickyFooter>
      {step < 3 ? (
        <View style={styles.navRow}>
          <PrimaryButton label={step === 0 ? 'Huỷ' : 'Quay lại'} variant="secondary" onPress={goBack} style={styles.navBtn} />
          <PrimaryButton
            label="Tiếp tục"
            onPress={goNext}
            disabled={nextDisabled}
            testID="leave-create-next"
            accessibilityLabel={
              step1AttachmentBlock
                ? 'Tiếp tục — cần đính kèm giấy tờ y tế'
                : 'Tiếp tục'
            }
            style={styles.navBtn}
          />
        </View>
      ) : (
        <>
          <PrimaryButton
            label={busy ? vi.loading : 'Gửi đơn nghỉ'}
            onPress={() => setConfirmSubmitOpen(true)}
            disabled={busy}
            loading={busy}
          />
          <PrimaryButton label="Quay lại" variant="ghost" onPress={goBack} />
        </>
      )}
    </StickyFooter>
  );

  return (
    <>
      <AppScreenLayout
        title={isEdit ? 'Chỉnh sửa đơn' : 'Tạo đơn nghỉ'}
        subtitle="4 bước — ngày → loại → xác nhận → gửi"
        scroll
        grouped
        keyboardShouldPersistTaps="handled"
        footer={footer}
      >
        <View style={styles.stepper}>
          {STEPS.map((label, i) => {
            const active = i === step;
            const done = i < step;
            return (
              <View key={label} style={styles.stepItem}>
                <View style={[styles.stepDot, (active || done) && styles.stepDotOn]}>
                  <Text style={[styles.stepNum, (active || done) && styles.stepNumOn]}>{i + 1}</Text>
                </View>
                <Text style={[styles.stepLabel, active && styles.stepLabelOn]} numberOfLines={1}>
                  {label}
                </Text>
              </View>
            );
          })}
        </View>

        {isEdit ? (
          <Text style={styles.editNote}>
            Chỉnh sửa tạo đơn mới thay thế — API cập nhật đơn cũ chưa có; đơn cũ vẫn chờ duyệt.
          </Text>
        ) : null}

        {stepContent()}
      </AppScreenLayout>

      <ConfirmActionModal
        visible={confirmSubmitOpen}
        kind="submit"
        title="Gửi đơn nghỉ phép?"
        message={
          balanceWarnLevel === 'exceed' || balanceWarnLevel === 'depleted'
            ? `Đơn ${resolveLeaveTypeLabel(leaveType)} (${totalDays} ngày) vượt/không còn số dư. Xác nhận vẫn gửi cho quản lý duyệt?`
            : `Xác nhận gửi đơn ${resolveLeaveTypeLabel(leaveType)} (${totalDays} ngày) cho quản lý duyệt.`
        }
        confirmLabel="Gửi đơn"
        onConfirm={() => void submit()}
        onCancel={() => setConfirmSubmitOpen(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  stepper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  stepItem: { flex: 1, alignItems: 'center', gap: 4 },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotOn: { borderColor: colors.primary, backgroundColor: colors.primaryMuted },
  stepNum: {
    fontSize: typography.fontSize.caption,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.semibold,
  },
  stepNumOn: { color: colors.primary },
  stepLabel: {
    fontSize: typography.fontSize.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  stepLabelOn: { color: colors.primary, fontWeight: typography.fontWeight.semibold },
  editNote: {
    fontSize: typography.fontSize.footnote,
    color: statusToneColor('warning').text,
    backgroundColor: statusToneColor('warning').bg,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: statusToneColor('warning').border,
  },
  hint: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
  meta: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    fontWeight: typography.fontWeight.medium,
  },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  typeChip: {
    paddingHorizontal: spacing.md - 4,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    minHeight: 44,
    justifyContent: 'center',
  },
  typeChipOn: { borderColor: colors.primary, backgroundColor: colors.primaryMuted },
  typeChipText: { fontSize: typography.fontSize.sm, color: colors.textSecondary },
  typeChipTextOn: { color: colors.primary, fontWeight: typography.fontWeight.semibold },
  warn: {
    fontSize: typography.fontSize.sm,
    color: statusToneColor('warning').text,
    backgroundColor: statusToneColor('warning').bg,
    padding: spacing.sm,
    borderRadius: radius.md,
  },
  warnDanger: {
    fontSize: typography.fontSize.sm,
    color: statusToneColor('danger').text,
    backgroundColor: statusToneColor('danger').bg,
    padding: spacing.sm,
    borderRadius: radius.md,
  },
  reviewReason: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  navRow: { flexDirection: 'row', gap: spacing.sm },
  navBtn: { flex: 1 },
});
