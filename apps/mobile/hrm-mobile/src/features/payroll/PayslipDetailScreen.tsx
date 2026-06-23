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
import { buildEmployeePayslipQuery, type PayslipListRow } from '../../integrations/payrollPayslips';
import type { PayslipStackParamList } from '../../navigation/types';
import { formatHrmCurrency } from '../../utils/formatHrm';
import { resolvePayslipPeriodLabelVi } from '../../utils/payslipDisplayVi';

type Payslip = PayslipListRow & { employee_code?: string };

export function PayslipDetailScreen() {
  const auth = useAuth();
  const route = useRoute<RouteProp<PayslipStackParamList, 'PayslipDetail'>>();
  const [row, setRow] = useState<Payslip | null>(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      const cid = auth.getPayrollQueryCompanyId();
      const eid = auth.employeeId.trim();
      if (!cid || !eid) {
        setErr('Thiếu phạm vi.');
        setLoading(false);
        return;
      }
      try {
        const q = buildEmployeePayslipQuery(cid, eid);
        const res = await hrmRequest<unknown>(auth.getHrmAuth(), `/payroll/payslips?${q}`, { method: 'GET' });
        if (!res.ok) {
          setErr(formatHrmError(res));
          setLoading(false);
          return;
        }
        const found = readListRows<Payslip>(res.data).find((x) => x.id === route.params.payslipId) ?? null;
        setRow(found);
        if (!found) setErr('Không tìm thấy phiếu lương.');
      } catch (e) {
        setErr(e instanceof Error ? e.message : 'Không tải được phiếu lương');
      } finally {
        setLoading(false);
      }
    })();
  }, [auth, route.params.payslipId]);

  const periodTitle = resolvePayslipPeriodLabelVi(
    route.params.periodLabel || row?.period_label,
    {
      membershipCompanyDisplay: auth.memberships.find((m) => m.employee_id === auth.employeeId)
        ?.company_display,
    },
  );

  return (
    <AppScreenLayout
      title={periodTitle || 'Phiếu lương'}
      subtitle="Chi tiết phiếu lương"
      loading={loading && !row && !err}
      error={err || undefined}
      empty={!loading && !row && !err}
      emptyMessage="Không tìm thấy phiếu lương"
      grouped
      scroll
    >
      {row ? (
        <>
          <StatusBadge status={row.status} label={statusLabel(row.status)} />

          <SurfaceCard title="Nhân viên">
            <DetailRow
              label="Họ tên"
              value={`${row.employee_name}${row.employee_code ? ` (${row.employee_code})` : ''}`}
            />
          </SurfaceCard>

          <SurfaceCard title="Thu nhập & khấu trừ">
            <DetailRow label="Tổng gross" value={formatHrmCurrency(row.gross_amount, row.currency)} numeric />
            <DetailRow label="Khấu trừ" value={formatHrmCurrency(row.deduction_amount, row.currency)} numeric />
            <DetailRow label="Thực lĩnh" value={formatHrmCurrency(row.net_amount, row.currency)} numeric />
          </SurfaceCard>
        </>
      ) : null}
    </AppScreenLayout>
  );
}
