import React, { useMemo, useState } from 'react';
import { Card, DataTable } from '../../../../components/common';
import { SETTINGS_CONTROL_TEXT } from '../../../../pages/command-center/settings-form-pattern';
import { HRM_MOCK_GUIDE_CHAPTERS } from '../../mock-data';

export const GuideView: React.FC = () => {
  const [q, setQ] = useState('');

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return HRM_MOCK_GUIDE_CHAPTERS;
    return HRM_MOCK_GUIDE_CHAPTERS.filter((r: any) => String(r.title ?? '').toLowerCase().includes(query));
  }, [q]);

  return (
    <>
      <Card className="mt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-xevn-text">Hướng dẫn sử dụng</div>
            <div className="mt-1 text-sm text-xevn-textSecondary">Mục lục hướng dẫn theo phân hệ (FE trước).</div>
          </div>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm chương..."
            className="h-10 w-64 max-w-[70vw] rounded-lg border border-xevn-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-xevn-primary/20"
          />
        </div>
      </Card>

      <Card className="mt-4 p-0 overflow-hidden">
        <DataTable
          columns={[
            { key: 'title', header: 'Chương', render: (row: any) => <span className="font-medium">{row.title}</span> },
            { key: 'module', header: 'Phân hệ', render: (row: any) => <span className="text-slate-600">{row.module ?? '—'}</span> },
            { key: 'updatedAt', header: 'Cập nhật', render: (row: any) => <span className="text-slate-600">{row.updatedAt ?? '—'}</span> },
          ]}
          data={rows as any}
          emptyMessage="Không có dữ liệu hướng dẫn"
          className={SETTINGS_CONTROL_TEXT}
        />
      </Card>
    </>
  );
};

