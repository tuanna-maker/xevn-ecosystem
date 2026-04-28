import React, { useMemo, useState } from 'react';
import { Card, DataTable } from '../../../../components/common';
import { SETTINGS_CONTROL_TEXT } from '../../../../pages/command-center/settings-form-pattern';
import { HRM_MOCK_TASKS } from '../../mock-data';

export const TasksView: React.FC = () => {
  const [q, setQ] = useState('');

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return HRM_MOCK_TASKS;
    return HRM_MOCK_TASKS.filter((r) => String(r.title ?? r.name ?? '').toLowerCase().includes(query));
  }, [q]);

  return (
    <>
      <Card className="mt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-xevn-text">Công việc</div>
            <div className="mt-1 text-sm text-xevn-textSecondary">Danh sách công việc (list view) theo chuẩn HRM.</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm kiếm..."
                className="h-10 w-64 max-w-[70vw] rounded-lg border border-xevn-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-xevn-primary/20"
              />
            </div>
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-xevn-primary px-4 text-sm font-semibold text-white shadow-soft transition active:scale-95 hover:opacity-90"
            >
              Tạo công việc
            </button>
          </div>
        </div>
      </Card>

      <Card className="mt-4 p-0 overflow-hidden">
        <DataTable
          columns={[
            { key: 'title', header: 'Tiêu đề', render: (row: any) => <span className="font-medium">{row.title ?? row.name ?? '—'}</span> },
            { key: 'assignee', header: 'Phụ trách', render: (row: any) => <span className="text-slate-700">{row.assignee ?? row.owner ?? '—'}</span> },
            { key: 'department', header: 'Phòng/Ban', render: (row: any) => <span className="text-slate-600">{row.department ?? '—'}</span> },
            { key: 'status', header: 'Trạng thái', render: (row: any) => <span className="text-slate-600">{row.status ?? '—'}</span> },
            { key: 'due', header: 'Hạn', render: (row: any) => <span className="text-slate-600">{row.due ?? row.deadline ?? '—'}</span> },
          ]}
          data={rows as any}
          emptyMessage="Không có dữ liệu công việc"
          className={SETTINGS_CONTROL_TEXT}
        />
      </Card>
    </>
  );
};

