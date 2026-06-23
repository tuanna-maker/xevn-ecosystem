import { useFocusEffect } from '@react-navigation/native';

import React, { useCallback, useMemo, useState } from 'react';

import { Alert, Modal, StyleSheet, Text, TextInput, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { ProfileSectionCard } from '../../components/profile/ProfileSectionCard';
import { AppScreenLayout } from '../../components/ui/AppScreenLayout';
import { ConfirmActionModal } from '../../components/ui/ConfirmActionModal';
import { EmptyStateIllustration } from '../../components/ui/EmptyStateIllustration';
import { ListShimmerPlaceholder } from '../../components/primitives/ListShimmerPlaceholder';
import { FilterChipRow } from '../../components/ui/FilterChipRow';
import { ManagerAttendanceCard } from '../../components/ui/ManagerAttendanceCard';
import { ManagerLeaveCard } from '../../components/ui/ManagerLeaveCard';

import { PrimaryButton } from '../../components/ui/PrimaryButton';

import { SwipeableRow } from '../../components/ui/SwipeableRow';

import { UndoSnackbar } from '../../components/ui/UndoSnackbar';

import { useAuth } from '../../context/AuthContext';

import { useDeferredSwipeMount } from '../../hooks/useDeferredSwipeMount';
import { useOfflineWriteGuard } from '../../hooks/useOfflineWriteGuard';

import { readListRows } from '../../integrations/envelope';

import { formatHrmError, formatHrmSuccess } from '../../integrations/mapApiError';

import { resolveLeaveTypeLabel } from '../../i18n/leaveTypes';

import { vi } from '../../i18n/vi';

import { groupedLayout } from '../../theme/groupedLayout';
import { colors, radius, spacing, typography } from '../../theme/tokens';

import { resolveAttendanceChangeTypeVi } from '../../utils/attendanceUpdateTypes';
import { formatHrmDateRange } from '../../utils/formatHrm';

import {
  handleManagerSwipeAction,
  resolveManagerApprovalSwipeActions,
} from '../../utils/swipeRowActions';



type AttReq = { id: string; employee_name: string; update_type: string };

type LeaveReq = { id: string; employee_name: string | null; leave_type: string; start_date: string; end_date: string };



type InboxFilter = 'all' | 'att' | 'leave';

type PendingAction = { kind: 'att' | 'leave'; id: string; action: 'approve' | 'decline' } | null;

type RejectState = { kind: 'att' | 'leave'; id: string } | null;



type InboxItem =

  | { kind: 'att'; id: string; title: string; subtitle: string }

  | { kind: 'leave'; id: string; title: string; subtitle: string; leaveType: string; startDate: string; endDate: string };



const REVIEWER = 'Mobile Manager';



const FILTER_OPTIONS: { key: InboxFilter; label: string }[] = [

  { key: 'all', label: 'Tất cả' },

  { key: 'att', label: 'Chỉnh sửa CC' },

  { key: 'leave', label: 'Nghỉ phép' },

];



export function ManagerApprovalsScreen() {

  const auth = useAuth();

  const blockIfOffline = useOfflineWriteGuard();

  const swipeReady = useDeferredSwipeMount();

  const [attRows, setAttRows] = useState<AttReq[]>([]);

  const [leaveRows, setLeaveRows] = useState<LeaveReq[]>([]);

  const [inboxFilter, setInboxFilter] = useState<InboxFilter>('leave');

  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const [rejectOpen, setRejectOpen] = useState(false);

  const [rejectState, setRejectState] = useState<RejectState>(null);

  const [rejectReason, setRejectReason] = useState('');

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState('');

  const [snackbar, setSnackbar] = useState<{ message: string } | null>(null);



  const load = useCallback(async () => {

    const cid = auth.getAttendanceCompanyId();

    if (!cid) {

      setAttRows([]);

      setLeaveRows([]);

      setError('Cần phạm vi công ty để tải đơn chờ duyệt.');

      return;

    }

    try {

      const q = new URLSearchParams({ company_id: cid, status: 'pending' });

      const mid = auth.employeeId.trim();

      if (mid) q.set('manager_employee_id', mid);

      const [attRes, leaveRes] = await Promise.all([

        auth.requestHrm<unknown>(`/attendance/update-requests?${q.toString()}`, { method: 'GET' }),

        auth.requestHrm<unknown>(`/attendance/leave-requests?${q.toString()}`, { method: 'GET' }),

      ]);

      if (attRes.ok) setAttRows(readListRows<AttReq>(attRes.data));

      else setAttRows([]);

      if (leaveRes.ok) setLeaveRows(readListRows<LeaveReq>(leaveRes.data));

      else setLeaveRows([]);



      if (!attRes.ok && !leaveRes.ok) {

        setError(formatHrmError(attRes.ok ? leaveRes : attRes));

      } else {

        setError('');

      }

    } catch (e) {

      setAttRows([]);

      setLeaveRows([]);

      setError(e instanceof Error ? e.message : 'Không tải được danh sách phê duyệt');

    }

  }, [auth]);



  const refresh = useCallback(async () => {

    setRefreshing(true);

    try {

      await load();

    } finally {

      setRefreshing(false);

      setLoading(false);

    }

  }, [load]);



  useFocusEffect(

    useCallback(() => {

      setLoading(true);

      void refresh().catch(() => undefined);

    }, [refresh]),

  );



  const inboxItems = useMemo((): InboxItem[] => {

    const att = attRows.map((r) => ({

      kind: 'att' as const,

      id: r.id,

      title: r.employee_name,

      subtitle: `Chỉnh sửa chấm công · ${resolveAttendanceChangeTypeVi(r.update_type)}`,

    }));

    const leave = leaveRows.map((r) => ({

      kind: 'leave' as const,

      id: r.id,

      title: (r.employee_name ?? 'Nhân viên') as string,

      subtitle: `Nghỉ phép · ${resolveLeaveTypeLabel(r.leave_type)} · ${formatHrmDateRange(r.start_date, r.end_date)}`,

      leaveType: r.leave_type,

      startDate: r.start_date,

      endDate: r.end_date,

    }));

    if (inboxFilter === 'att') return att;

    if (inboxFilter === 'leave') return leave;

    return [...att, ...leave];

  }, [attRows, leaveRows, inboxFilter]);



  const totalPending = attRows.length + leaveRows.length;

  const visibleCount = inboxItems.length;

  const isEmpty = !loading && visibleCount === 0 && !error;



  const emptyMessage = useMemo(() => {

    if (inboxFilter === 'att') return 'Không có đơn chỉnh sửa chờ duyệt';

    if (inboxFilter === 'leave') return 'Không có đơn nghỉ phép chờ duyệt';

    return 'Không có đơn chờ duyệt';

  }, [inboxFilter]);



  const chipOptions = useMemo(

    () =>

      FILTER_OPTIONS.map((opt) => ({

        ...opt,

        count: opt.key === 'all' ? totalPending : opt.key === 'att' ? attRows.length : leaveRows.length,

      })),

    [attRows.length, leaveRows.length, totalPending],

  );



  const showSuccess = (message: string) => {

    setSnackbar({ message });

  };



  const approveAtt = async (id: string) => {

    const off = blockIfOffline();

    if (off) {

      Alert.alert(vi.error, `${off}`);

      return;

    }

    try {

      const res = await auth.requestHrm<unknown>(`/attendance/update-requests/${id}/approve`, {

        method: 'POST',

        body: JSON.stringify({ approver_name: REVIEWER }),

      });

      if (res.ok) {

        showSuccess(formatHrmSuccess(res.code) || 'Đã duyệt đơn chỉnh sửa chấm công');

        await load();

      } else Alert.alert(vi.error, formatHrmError(res));

    } catch (e) {

      Alert.alert(vi.error, e instanceof Error ? e.message : 'Không duyệt được đơn');

    }

  };



  const approveLeave = async (id: string) => {

    const off = blockIfOffline();

    if (off) {

      Alert.alert(vi.error, `${off}`);

      return;

    }

    try {

      const body: Record<string, string | undefined> = { reviewer_name: REVIEWER };

      const eid = auth.employeeId.trim();

      if (eid) body.reviewer_employee_id = eid;

      const res = await auth.requestHrm<unknown>(`/attendance/leave-requests/${id}/approve`, {

        method: 'POST',

        body: JSON.stringify(body),

      });

      if (res.ok) {

        showSuccess(formatHrmSuccess(res.code) || 'Đã duyệt đơn nghỉ phép');

        await load();

      } else Alert.alert(vi.error, formatHrmError(res));

    } catch (e) {

      Alert.alert(vi.error, e instanceof Error ? e.message : 'Không duyệt được đơn');

    }

  };



  const confirmReject = async () => {

    const off = blockIfOffline();

    if (off) {

      Alert.alert(vi.error, `${off}`);

      return;

    }

    if (!rejectState) return;

    const { kind, id } = rejectState;

    try {

      let res: Awaited<ReturnType<typeof auth.requestHrm<unknown>>>;

      if (kind === 'att') {

        res = await auth.requestHrm<unknown>(`/attendance/update-requests/${id}/reject`, {

          method: 'POST',

          body: JSON.stringify({

            approver_name: REVIEWER,

            rejected_reason: rejectReason.trim() || 'Từ chối từ mobile',

          }),

        });

      } else {

        const body: Record<string, string | undefined> = {

          reviewer_name: REVIEWER,

          rejected_reason: rejectReason.trim() || 'Từ chối từ mobile',

        };

        const eid = auth.employeeId.trim();

        if (eid) body.reviewer_employee_id = eid;

        res = await auth.requestHrm<unknown>(`/attendance/leave-requests/${id}/reject`, {

          method: 'POST',

          body: JSON.stringify(body),

        });

      }

      setRejectOpen(false);

      setRejectState(null);

      if (res.ok) {

        showSuccess(formatHrmSuccess(res.code) || 'Đã từ chối đơn');

        await load();

      } else Alert.alert(vi.error, formatHrmError(res));

    } catch (e) {

      setRejectOpen(false);

      setRejectState(null);

      Alert.alert(vi.error, e instanceof Error ? e.message : 'Không từ chối được đơn');

    }

  };



  const runPendingAction = () => {

    if (!pendingAction) return;

    const { kind, id, action } = pendingAction;

    setPendingAction(null);

    if (action === 'decline') {

      openReject(kind, id);

      return;

    }

    if (kind === 'att') void approveAtt(id).catch(() => undefined);

    else void approveLeave(id).catch(() => undefined);

  };



  const openReject = (kind: 'att' | 'leave', id: string) => {

    setRejectState({ kind, id });

    setRejectReason('');

    setRejectOpen(true);

  };



  const requestAction = (kind: 'att' | 'leave', id: string, action: 'approve' | 'decline') => {

    setPendingAction({ kind, id, action });

  };



  const managerSwipeActions = useMemo(() => resolveManagerApprovalSwipeActions(), []);



  const wrapManagerSwipe = (

    kind: 'att' | 'leave',

    id: string,

    card: React.ReactNode,

  ) => {
    const rowKey = `${kind}-${id}`;
    if (!swipeReady) {
      return <React.Fragment key={rowKey}>{card}</React.Fragment>;
    }

    return (
      <SwipeableRow
        key={rowKey}
        testID={`manager-swipe-${kind}-${id}`}
        actions={managerSwipeActions.map((spec) => ({
          ...spec,
          onPress: () =>
            handleManagerSwipeAction(spec.kind, {
              onApprove: () => requestAction(kind, id, 'approve'),
              onDecline: () => requestAction(kind, id, 'decline'),
            }),
        }))}
      >
        {card}
      </SwipeableRow>
    );
  };



  const confirmModal = pendingAction ? (

    <ConfirmActionModal

      visible

      kind={pendingAction.action === 'approve' ? 'approve' : 'decline'}

      title={pendingAction.action === 'approve' ? 'Duyệt đơn?' : 'Từ chối đơn?'}

      message={

        pendingAction.action === 'approve'

          ? 'Xác nhận duyệt đơn này. Nhân viên sẽ nhận thông báo ngay.'

          : 'Xác nhận từ chối đơn này. Bạn có thể nhập lý do ở bước tiếp theo.'

      }

      confirmLabel={pendingAction.action === 'approve' ? 'Duyệt' : 'Tiếp tục'}

      onConfirm={runPendingAction}

      onCancel={() => setPendingAction(null)}

    />

  ) : null;



  return (

    <GestureHandlerRootView style={styles.gestureRoot} testID="manager-approvals-screen">

      <AppScreenLayout
        subtitle="Đơn chỉnh sửa chấm công và nghỉ phép đang chờ"
        stackHeaderPresent
        loading={false}
        error={error || undefined}
        empty={false}
        onRefresh={refresh}
        refreshing={refreshing}
        grouped
        contentStyle={styles.screenContent}
      >
        <View style={styles.chipWrap}>
          <FilterChipRow
            value={inboxFilter}
            options={chipOptions}
            onChange={(key) => setInboxFilter(key)}
          />
        </View>

        {loading && visibleCount === 0 ? (
          <ListShimmerPlaceholder testID="manager-approvals-shimmer" />
        ) : null}

        {isEmpty ? (
          <View style={styles.emptyWrap}>
            <EmptyStateIllustration
              testID="manager-approvals-empty"
              title={emptyMessage}
              hint="Khi có đơn mới, chúng sẽ hiển thị tại đây."
              icon="checkmark-done-outline"
              useLottie
              compact
            />
          </View>
        ) : null}

        {inboxFilter === 'all' && visibleCount > 0 ? (
          <>
            {leaveRows.length > 0 ? (
              <ProfileSectionCard title="Nghỉ phép" icon="calendar-outline">
                {leaveRows.map((r) =>
                  wrapManagerSwipe(
                    'leave',
                    r.id,
                    <ManagerLeaveCard
                      key={`leave-${r.id}`}
                      employeeName={(r.employee_name ?? 'Nhân viên') as string}
                      leaveType={r.leave_type}
                      startDate={r.start_date}
                      endDate={r.end_date}
                      online={false}
                      onAccept={() => requestAction('leave', r.id, 'approve')}
                      onDecline={() => requestAction('leave', r.id, 'decline')}
                    />,
                  ),
                )}
              </ProfileSectionCard>
            ) : null}
            {attRows.length > 0 ? (
              <ProfileSectionCard title="Chỉnh sửa chấm công" icon="time-outline">
                {attRows.map((r) =>
                  wrapManagerSwipe(
                    'att',
                    r.id,
                    <ManagerAttendanceCard
                      key={`att-${r.id}`}
                      employeeName={r.employee_name}
                      updateType={r.update_type}
                      onAccept={() => requestAction('att', r.id, 'approve')}
                      onDecline={() => requestAction('att', r.id, 'decline')}
                    />,
                  ),
                )}
              </ProfileSectionCard>
            ) : null}
          </>
        ) : (
          inboxItems.map((item) => {
            if (item.kind === 'leave') {
              return wrapManagerSwipe(
                'leave',
                item.id,
                <ManagerLeaveCard
                  key={`leave-${item.id}`}
                  employeeName={item.title}
                  leaveType={item.leaveType}
                  startDate={item.startDate}
                  endDate={item.endDate}
                  online={false}
                  onAccept={() => requestAction('leave', item.id, 'approve')}
                  onDecline={() => requestAction('leave', item.id, 'decline')}
                />,
              );
            }

            const attRow = attRows.find((r) => r.id === item.id);
            return wrapManagerSwipe(
              'att',
              item.id,
              <ManagerAttendanceCard
                key={`att-${item.id}`}
                employeeName={item.title}
                updateType={attRow?.update_type ?? 'check_in'}
                onAccept={() => requestAction('att', item.id, 'approve')}
                onDecline={() => requestAction('att', item.id, 'decline')}
              />,
            );
          })
        )}

      </AppScreenLayout>



      {confirmModal}



      <Modal visible={rejectOpen} transparent animationType="fade">

        <View style={styles.modalBg}>

          <View style={styles.modalBox}>

            <Text style={styles.modalTitle}>Lý do từ chối</Text>

            <TextInput

              style={styles.modalInput}

              value={rejectReason}

              onChangeText={setRejectReason}

              placeholder="Nhập lý do…"

              placeholderTextColor={colors.textSecondary}

            />

            <View style={styles.modalRow}>

              <PrimaryButton

                label="Huỷ"

                onPress={() => {

                  setRejectOpen(false);

                  setRejectState(null);

                }}

                variant="ghost"

                size="sm"

              />

              <PrimaryButton
                label="Gửi"
                onPress={() => void confirmReject().catch(() => undefined)}
                size="sm"
              />

            </View>

          </View>

        </View>

      </Modal>



      <UndoSnackbar

        visible={snackbar != null}

        message={snackbar?.message ?? ''}

        onUndo={() => {

          Alert.alert(

            'Hoàn tác',

            'Hoàn tác tự động chưa khả dụng (BR-ESS-UNDO-01). Liên hệ HR nếu cần điều chỉnh.',

          );

        }}

        onDismiss={() => setSnackbar(null)}

      />

    </GestureHandlerRootView>

  );

}



const styles = StyleSheet.create({
  gestureRoot: {
    flex: 1,
  },
  screenContent: {
    gap: groupedLayout.belowSubtitle,
  },
  chipWrap: {
    paddingTop: groupedLayout.belowSubtitle,
  },
  emptyWrap: {
    paddingVertical: groupedLayout.emptyVertical,
  },
  modalBg: {

    flex: 1,

    backgroundColor: 'rgba(15, 23, 42, 0.45)',

    justifyContent: 'center',

    padding: spacing.lg,

  },

  modalBox: {

    backgroundColor: colors.surface,

    borderRadius: radius.card,

    padding: spacing.lg,

    gap: spacing.md,

    borderWidth: 1,

    borderColor: colors.border,

  },

  modalTitle: {

    color: colors.text,

    fontWeight: typography.fontWeight.semibold,

    fontSize: typography.fontSize.title2,

    lineHeight: typography.lineHeight.title2,

  },

  modalInput: {

    borderWidth: 1,

    borderColor: colors.border,

    borderRadius: radius.input,

    padding: spacing.md - 4,

    color: colors.text,

    fontSize: typography.fontSize.body,

    lineHeight: typography.lineHeight.body,

  },

  modalRow: {

    flexDirection: 'row',

    gap: spacing.sm,

    justifyContent: 'flex-end',

  },

});


