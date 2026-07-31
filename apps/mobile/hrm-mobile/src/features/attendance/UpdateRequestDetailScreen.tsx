import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { AppScreenLayout } from '../../components/ui/AppScreenLayout';
import { DetailRow } from '../../components/ui/DetailRow';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { SurfaceCard } from '../../components/ui/SurfaceCard';
import { useAuth } from '../../context/AuthContext';
import { readListRows } from '../../integrations/envelope';
import { hrmRequest } from '../../integrations/hrmApiClient';
import { formatHrmError, statusLabel } from '../../integrations/mapApiError';
import type { RequestsStackParamList } from '../../navigation/types';
import { resolveAttendanceChangeTypeVi } from '../../utils/attendanceUpdateTypes';
import { formatHrmDate, sanitizeSeedDisplay } from '../../utils/formatHrm';
import { userFacingScopeError } from '../../utils/scopeError';

/**
 * @CODE-MEMORY-CHANGE 2026-07-27
 * WorkItem: D-MOB-U72-LABEL-FE-01
 * change_mode: FIX
 * What: StatusBadge label=statusLabel(VI); unknown → —
 * Why: U72 M-F-03 UpdateRequestDetail raw status
 * must_keep: resolveAttendanceChangeTypeVi; U65 · HOLD_DEPLOY
 */

type Req = {
  id: string;
  employee_name: string;
  update_type: string;
  attendance_date: string;
  status: string;
  reason: string;
  approver_name: string | null;
  rejected_reason: string | null;
};

export function UpdateRequestDetailScreen() {
  const auth = useAuth();
  const route = useRoute<RouteProp<RequestsStackParamList, 'UpdateRequestDetail'>>();
  const [row, setRow] = useState<Req | null>(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      const cid = auth.getAttendanceCompanyId();
      if (!cid) {
        setErr(userFacingScopeError('company'));
        setLoading(false);
        return;
      }
      const q = new URLSearchParams({ company_id: cid });
      const eid = auth.employeeId.trim();
      if (eid) q.set('employee_id', eid);
      const res = await hrmRequest<unknown>(auth.getHrmAuth(), `/attendance/update-requests?${q.toString()}`, {
        method: 'GET',
      });
      if (!res.ok) {
        setErr(formatHrmError(res));
        setLoading(false);
        return;
      }
      const found = readListRows<Req>(res.data).find((x) => x.id === route.params.id) ?? null;
      setRow(found);
      if (!found) setErr('Không tìm thấy đơn công.');
      setLoading(false);
    })();
  }, [auth, route.params.id]);

  return (
    <AppScreenLayout
      title={row ? resolveAttendanceChangeTypeVi(row.update_type) : 'Đơn công'}
      subtitle={row?.employee_name}
      loading={loading && !row && !err}
      error={err || undefined}
      empty={!loading && !row && !err}
      emptyMessage="Không tìm thấy đơn công"
      grouped
      scroll
    >
      {row ? (
        <>
          <StatusBadge status={row.status} label={statusLabel(row.status)} />

          <SurfaceCard title="Thông tin">
            <DetailRow label="Nhân viên" value={row.employee_name} />
            <DetailRow label="Ngày công" value={formatHrmDate(row.attendance_date)} />
            <DetailRow label="Lý do" value={sanitizeSeedDisplay(row.reason)} />
            {row.approver_name ? <DetailRow label="Người duyệt" value={row.approver_name} /> : null}
            {row.rejected_reason ? (
              <DetailRow label="Lý do từ chối" value={sanitizeSeedDisplay(row.rejected_reason)} />
            ) : null}
          </SurfaceCard>
        </>
      ) : null}
    </AppScreenLayout>
  );
}
