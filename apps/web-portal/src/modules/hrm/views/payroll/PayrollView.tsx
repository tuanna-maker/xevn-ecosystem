import React, { useEffect, useState } from 'react';
import { Card, DataTable } from '../../../../components/common';
import { isSupabaseConfigured, supabase } from '../../../../integrations/supabase/client';
import { useGlobalFilter } from '../../../../contexts/GlobalFilterContext';
import { SETTINGS_CONTROL_TEXT } from '../../../../pages/command-center/settings-form-pattern';
import { HRM_TABLE_CLASS, HRM_TABLE_SHELL, HRM_MOCK_PAYROLL } from '../../mock-data';

type PayrollBatchRow = {
  id: string;
  name: string;
  salary_period: string;
  status: string;
  employee_count: number | null;
  total_gross: number | null;
};

export const PayrollView: React.FC<{ openHrmApp: (path: string) => void }> = ({ openHrmApp }) => {
  const { selectedCompany } = useGlobalFilter();
  const [payrollBatchesDb, setPayrollBatchesDb] = useState<PayrollBatchRow[]>([]);
  const [payrollLoading, setPayrollLoading] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const companyId = selectedCompany?.id && selectedCompany.id !== 'all' ? selectedCompany.id : null;

    let cancelled = false;
    (async () => {
      setPayrollLoading(true);
      try {
        let q = supabase
          .from('payroll_batches')
          .select('id, name, salary_period, status, employee_count, total_gross, company_id')
          .order('created_at', { ascending: false })
          .limit(200);
        if (companyId) q = q.eq('company_id', companyId);
        const { data, error } = await q;
        if (cancelled) return;
        if (!error) {
          setPayrollBatchesDb(
            (data ?? []).map((row: any) => ({
              id: row.id,
              name: row.name ?? '—',
              salary_period: row.salary_period ?? '—',
              status: row.status ?? 'draft',
              employee_count: row.employee_count ?? null,
              total_gross: row.total_gross ?? null,
            }))
          );
        }
      } finally {
        if (!cancelled) setPayrollLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedCompany?.id]);

  return (
    <Card className="mt-4 p-0 overflow-hidden">
      {isSupabaseConfigured && (payrollLoading || payrollBatchesDb.length > 0) ? (
        <DataTable
          columns={[
            { key: 'salary_period', header: 'Kỳ lương' },
            { key: 'name', header: 'Tên kỳ' },
            { key: 'employee_count', header: 'Số nhân sự', render: (row: { employee_count: number | null }) => <span className="tabular-nums">{row.employee_count ?? '—'}</span> },
            { key: 'total_gross', header: 'Tổng gross', render: (row: { total_gross: number | null }) => <span className="tabular-nums">{row.total_gross ?? '—'}</span> },
            { key: 'status', header: 'Trạng thái' },
          ]}
          data={payrollLoading ? [] : payrollBatchesDb}
          emptyMessage={payrollLoading ? 'Đang tải dữ liệu...' : 'Không có dữ liệu kỳ lương'}
          className={SETTINGS_CONTROL_TEXT}
        />
      ) : (
        <div className={HRM_TABLE_SHELL}>
          <table className={HRM_TABLE_CLASS}>
            <thead className="bg-white/70 backdrop-blur-md">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Kỳ chi trả</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Phạm vi</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-slate-500">Tổng quỹ (gross)</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Duyệt</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Ngày chi</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Trạng thái</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-slate-500">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {HRM_MOCK_PAYROLL.map((row) => (
                <tr key={row.id} className="border-t border-xevn-border">
                  <td className="px-3 py-2 font-medium text-xevn-text">{row.period}</td>
                  <td className="px-3 py-2 text-slate-600">{row.entity}</td>
                  <td className="px-3 py-2 text-right font-medium tabular-nums text-xevn-text">{row.gross}</td>
                  <td className="px-3 py-2 text-slate-700">{row.approved}</td>
                  <td className="px-3 py-2 text-slate-600">{row.payDate}</td>
                  <td className="px-3 py-2">
                    <span
                      className={
                        row.status === 'Sẵn sàng chi' ? 'font-medium text-emerald-700' : row.status === 'Nháp' ? 'text-amber-700' : 'text-slate-600'
                      }
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      className="text-[15px] font-semibold text-xevn-primary hover:underline"
                      onClick={() => openHrmApp('/hr/payroll')}
                    >
                      Xem bảng lương
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};

