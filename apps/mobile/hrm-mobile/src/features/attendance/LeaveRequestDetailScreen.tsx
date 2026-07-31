/**
 * @CODE-MEMORY-CHANGE 2026-07-19
 * WorkItem: PCOMP-W7-MOB-LEAVE-DOC
 * What: Detail SurfaceCard opens attachment_url via Linking (AC-LEAVE-DOC-01/03)
 * Why: UC-HRM-MOB-06b manager/owner read-only download
 * SRS/BR: MOBILE_W7_SRS_DELTA §4.2 D6 · TechSpec §5.2 step 6
 *
 * @CODE-MEMORY-CHANGE 2026-07-22
 * WorkItem: MOB-XEVN-BRAND-PRIMITIVES-L2-01
 * What: Hủy đơn chờ duyệt → ConfirmActionModal (decline) thay Alert.alert confirm
 * Why: L2 brand DNA — prefer branded modal for destructive confirm
 * must_keep: ConfirmActionModal for cancel confirm; runtime result Alert OK
 */
import { useNavigation, useRoute } from '@react-navigation/native';

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RouteProp } from '@react-navigation/native';

import React, { useCallback, useEffect, useState } from 'react';

import { Alert, Linking, StyleSheet, Text, View } from 'react-native';

import { AppScreenLayout } from '../../components/ui/AppScreenLayout';

import { ConfirmActionModal } from '../../components/ui/ConfirmActionModal';

import { DetailMetricGrid } from '../../components/ui/DetailMetricGrid';

import { DetailNoteBlock } from '../../components/ui/DetailNoteBlock';

import { LeaveHeroCard } from '../../components/ui/LeaveHeroCard';

import { PrimaryButton } from '../../components/ui/PrimaryButton';

import { SurfaceCard } from '../../components/ui/SurfaceCard';

import { useAuth } from '../../context/AuthContext';

import { readListRows } from '../../integrations/envelope';

import { tryCancelLeaveRequest } from '../../integrations/leaveRequests';

import { fetchEmployeeById } from '../../integrations/hrmEmployees';

import { getDefaultBaseUrl, hrmRequest } from '../../integrations/hrmApiClient';

import { resolveLeaveTypeLabel } from '../../i18n/leaveTypes';

import { formatHrmError } from '../../integrations/mapApiError';

import type { RequestsStackParamList } from '../../navigation/types';

import { spacing, typography, colors, layout } from '../../theme/tokens';

import { formatHrmDate, formatHrmDateTime, sanitizeSeedDisplay } from '../../utils/formatHrm';
import { resolveHrmAvatarUrl } from '../../utils/resolveHrmAvatarUrl';

import {
  buildLeaveDetailListQuery,
  resolveLeaveDetailEmployeeFilter,
} from '../../utils/leaveDetailLoad';
import { userFacingScopeError } from '../../utils/scopeError';



type LeaveRow = {

  id: string;

  employee_id?: string;

  leave_type: string;

  start_date: string;

  end_date: string;

  status: string;

  reason: string | null;

  rejected_reason: string | null;

  requested_at: string;

  reviewed_at: string | null;

  employee_code: string | null;

  employee_name: string | null;

  department: string | null;

  total_days: string | number | null;

  handover_to: string | null;

  handover_tasks: string | null;

  attachment_url?: string | null;

};



export function LeaveRequestDetailScreen() {

  const auth = useAuth();

  const nav = useNavigation<NativeStackNavigationProp<RequestsStackParamList>>();

  const route = useRoute<RouteProp<RequestsStackParamList, 'LeaveRequestDetail'>>();

  const [row, setRow] = useState<LeaveRow | null>(null);

  const [err, setErr] = useState('');

  const [loading, setLoading] = useState(true);

  const [cancelling, setCancelling] = useState(false);

  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);



  const load = useCallback(async () => {

    setLoading(true);

    const cid = auth.getAttendanceCompanyId();

    const leaveId = route.params.id.trim();

    if (!cid || !leaveId) {

      setErr(!cid ? userFacingScopeError('company') : userFacingScopeError('leaveId'));

      setLoading(false);

      return;

    }

    const cfg = auth.getHrmAuth();

    const scopedEmployeeId = resolveLeaveDetailEmployeeFilter({

      routeEmployeeId: route.params.employeeId,

      viewerEmployeeId: auth.employeeId,

    });

    const fetchScopedLeaves = async (employeeId?: string) => {

      const q = buildLeaveDetailListQuery(cid, employeeId);

      return hrmRequest<unknown>(cfg, `/attendance/leave-requests?${q.toString()}`, { method: 'GET' });

    };

    let res = await fetchScopedLeaves(scopedEmployeeId || undefined);

    if (!res.ok) {

      setErr(formatHrmError(res));

      setLoading(false);

      return;

    }

    let found = readListRows<LeaveRow>(res.data).find((x) => x.id === leaveId) ?? null;

    if (!found && scopedEmployeeId) {

      const fallbackRes = await fetchScopedLeaves();

      if (fallbackRes.ok) {

        found = readListRows<LeaveRow>(fallbackRes.data).find((x) => x.id === leaveId) ?? null;

      }

    }

    const avatarEmployeeId =

      found?.employee_id?.trim() || route.params.employeeId?.trim() || auth.employeeId.trim();

    const emp = avatarEmployeeId ? await fetchEmployeeById(cfg, avatarEmployeeId) : null;

    setAvatarUrl(emp?.avatar_url ?? null);

    setRow(found);

    if (!found) setErr('Không tìm thấy đơn.');

    setLoading(false);

  }, [auth, route.params.id, route.params.employeeId]);



  useEffect(() => {

    void load();

  }, [load]);



  const onEdit = () => {

    if (!row) return;

    nav.navigate('CreateLeaveRequest', {

      editId: row.id,

      prefill: {

        leaveType: row.leave_type,

        startDate: row.start_date,

        endDate: row.end_date,

        reason: row.reason ?? '',

        handoverTo: row.handover_to ?? '',

        handoverTasks: row.handover_tasks ?? '',

      },

    });

  };



  const onCancel = () => {
    if (!row || cancelling) return;
    setConfirmCancelOpen(true);
  };

  const confirmCancelLeave = () => {
    if (!row) return;
    setConfirmCancelOpen(false);
    void (async () => {
      setCancelling(true);
      try {
        const result = await tryCancelLeaveRequest(auth.getHrmAuth(), row.id);
        Alert.alert('Chưa khả dụng', result.message);
      } finally {
        setCancelling(false);
      }
    })();
  };



  const totalDays = row?.total_days != null ? String(row.total_days) : '—';

  const reasonText = row ? sanitizeSeedDisplay(row.reason) : '—';

  const rejectText = row?.rejected_reason ? sanitizeSeedDisplay(row.rejected_reason) : null;

  const apiBaseUrl = auth.getHrmAuth().baseUrl || getDefaultBaseUrl();



  return (

    <AppScreenLayout

      title={row ? resolveLeaveTypeLabel(row.leave_type) : 'Đơn nghỉ phép'}

      grouped

      loading={loading && !row && !err}

      error={err || undefined}

      empty={!loading && !row && !err}

      emptyMessage="Không tìm thấy đơn nghỉ"

      scroll

    >

      {row ? (

        <>

          <LeaveHeroCard

            employeeName={row.employee_name?.trim() || '—'}

            employeeCode={row.employee_code?.trim() || '—'}

            department={row.department}

            status={row.status}

            avatarUrl={avatarUrl}

            baseUrl={apiBaseUrl}

          />



          <SurfaceCard title="Thông tin nghỉ">

            <DetailMetricGrid

              metrics={[

                { label: 'Loại nghỉ', value: '', leaveTypeCode: row.leave_type },

                { label: 'Số ngày', value: `${totalDays} ngày` },

                { label: 'Từ ngày', value: formatHrmDate(row.start_date) },

                { label: 'Đến ngày', value: formatHrmDate(row.end_date) },

              ]}

            />

          </SurfaceCard>



          {(reasonText !== '—' || row.handover_to) && (

            <SurfaceCard title="Nội dung">

              {reasonText !== '—' ? <DetailNoteBlock label="Lý do" text={reasonText} /> : null}

              {row.handover_to ? (

                <DetailNoteBlock

                  label="Bàn giao"

                  text={[row.handover_to, row.handover_tasks].filter(Boolean).join(' — ')}

                />

              ) : null}

            </SurfaceCard>

          )}



          {rejectText ? (

            <SurfaceCard title="Phản hồi">

              <DetailNoteBlock label="Lý do từ chối" text={rejectText} variant="danger" />

            </SurfaceCard>

          ) : null}

          {row.attachment_url?.trim() ? (
            <SurfaceCard title="Giấy tờ đính kèm">
              <PrimaryButton
                label="Xem / tải giấy tờ"
                variant="secondary"
                testID="leave-attachment-open"
                onPress={() => {
                  const href =
                    resolveHrmAvatarUrl(apiBaseUrl, row.attachment_url!.trim()) ??
                    row.attachment_url!.trim();
                  void Linking.openURL(href).catch(() => {
                    Alert.alert('Lỗi', 'Không mở được tệp đính kèm.');
                  });
                }}
              />
            </SurfaceCard>
          ) : null}

          <View style={styles.timestamps}>

            <Text style={styles.timestampText}>Gửi: {formatHrmDateTime(row.requested_at)}</Text>

            {row.reviewed_at ? (

              <Text style={styles.timestampText}>Duyệt: {formatHrmDateTime(row.reviewed_at)}</Text>

            ) : null}

          </View>



          {row.status === 'pending' ? (

            <View style={styles.actionBar}>

              <PrimaryButton label="Sửa đơn" variant="secondary" onPress={onEdit} style={styles.actionBtn} />

              <PrimaryButton

                label={cancelling ? 'Đang xử lý…' : 'Hủy đơn'}

                variant="danger"

                onPress={onCancel}

                disabled={cancelling}

                loading={cancelling}

                style={styles.actionBtn}

              />

            </View>

          ) : null}

        </>

      ) : null}

      <ConfirmActionModal
        visible={confirmCancelOpen}
        kind="decline"
        title="Hủy đơn nghỉ"
        message="Bạn có chắc muốn hủy đơn đang chờ duyệt?"
        confirmLabel="Hủy đơn"
        cancelLabel="Không"
        onConfirm={confirmCancelLeave}
        onCancel={() => setConfirmCancelOpen(false)}
      />

    </AppScreenLayout>

  );

}



const styles = StyleSheet.create({

  timestamps: {

    gap: spacing.xs,

    paddingTop: spacing.sm,

    borderTopWidth: 1,

    borderTopColor: colors.border,

  },

  timestampText: {

    fontSize: typography.fontSize.footnote,

    lineHeight: typography.lineHeight.footnote,

    color: colors.textSecondary,

  },

  actionBar: {

    flexDirection: 'row',

    gap: spacing.sm,

    marginTop: layout.sectionGap - layout.itemGap,

  },

  actionBtn: { flex: 1 },

});

