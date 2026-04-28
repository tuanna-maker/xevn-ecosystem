import React, { useState } from 'react';
import { Card, DataTable } from '../../../../components/common';
import { SETTINGS_CONTROL_TEXT } from '../../../../pages/command-center/settings-form-pattern';
import { HRM_MOCK_REPORTS } from '../../mock-data';

type TabKey = 'overview' | 'recruitment' | 'contracts' | 'leave' | 'turnover' | 'services' | 'tools';

export const ReportsView: React.FC = () => {
  const [tab, setTab] = useState<TabKey>('overview');
  const [year, setYear] = useState(String(new Date().getFullYear()));

  return (
    <>
      <Card className="mt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-xevn-text">Báo cáo</div>
            <div className="mt-1 text-sm text-xevn-textSecondary">Tabs theo màn `Reports` bên HRM.</div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="h-10 rounded-lg border border-xevn-border bg-white px-3 text-sm font-semibold text-xevn-text outline-none focus:ring-2 focus:ring-xevn-primary/20"
            >
              {[0, 1, 2].map((d) => {
                const y = new Date().getFullYear() - d;
                return (
                  <option key={y} value={String(y)}>
                    {y}
                  </option>
                );
              })}
            </select>
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-xevn-border bg-white px-3 text-sm font-semibold text-xevn-text transition active:scale-95 hover:bg-slate-50"
            >
              Xuất báo cáo
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[
            { key: 'overview', label: 'Tổng quan' },
            { key: 'recruitment', label: 'Tuyển dụng' },
            { key: 'contracts', label: 'Hợp đồng' },
            { key: 'leave', label: 'Nghỉ phép' },
            { key: 'turnover', label: 'Biến động' },
            { key: 'services', label: 'Dịch vụ nội bộ' },
            { key: 'tools', label: 'CCDC' },
          ].map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key as TabKey)}
              className={
                tab === t.key
                  ? 'rounded-lg bg-xevn-primary px-3 py-2 text-sm font-semibold text-white'
                  : 'rounded-lg border border-xevn-border bg-white px-3 py-2 text-sm font-semibold text-xevn-text hover:bg-slate-50'
              }
            >
              {t.label}
            </button>
          ))}
        </div>
      </Card>

      <Card className="mt-4 p-0 overflow-hidden">
        <DataTable
          columns={[
            { key: 'name', header: 'Báo cáo', render: (row: any) => <span className="font-medium">{row.name}</span> },
            { key: 'cycle', header: 'Chu kỳ', render: (row: any) => <span className="text-slate-600">{row.cycle}</span> },
            { key: 'lastRun', header: 'Lần chạy', render: (row: any) => <span className="text-slate-600">{row.lastRun}</span> },
            { key: 'status', header: 'Trạng thái', render: (row: any) => <span className="text-slate-600">{row.status}</span> },
            { key: 'actions', header: 'Thao tác', render: () => <span className="text-xevn-primary font-semibold">Xem</span> },
          ]}
          data={HRM_MOCK_REPORTS as any}
          emptyMessage={`Không có dữ liệu báo cáo (${tab}, ${year})`}
          className={SETTINGS_CONTROL_TEXT}
        />
      </Card>
    </>
  );
};

