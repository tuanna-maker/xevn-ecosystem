import React, { useMemo, useState } from 'react';
import { Card, DataTable } from '../../../../components/common';
import { SETTINGS_CONTROL_TEXT } from '../../../../pages/command-center/settings-form-pattern';
import { HRM_MOCK_AI_SESSIONS } from '../../mock-data';

export const UniAIView: React.FC = () => {
  const [q, setQ] = useState('');

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return HRM_MOCK_AI_SESSIONS;
    return HRM_MOCK_AI_SESSIONS.filter((r: any) => String(r.topic ?? r.title ?? '').toLowerCase().includes(query));
  }, [q]);

  return (
    <>
      <Card className="mt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-xevn-text">UniAI</div>
            <div className="mt-1 text-sm text-xevn-textSecondary">Trợ lý HCNS: chat, soạn thảo, checklist (FE trước).</div>
          </div>
          <div className="flex items-center gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm session..."
              className="h-10 w-64 max-w-[70vw] rounded-lg border border-xevn-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-xevn-primary/20"
            />
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-xevn-primary px-4 text-sm font-semibold text-white shadow-soft transition active:scale-95 hover:opacity-90"
            >
              Tạo phiên chat
            </button>
          </div>
        </div>
      </Card>

      <Card className="mt-4 p-0 overflow-hidden">
        <DataTable
          columns={[
            { key: 'topic', header: 'Chủ đề', render: (row: any) => <span className="font-medium">{row.topic ?? row.title ?? '—'}</span> },
            { key: 'createdAt', header: 'Tạo lúc', render: (row: any) => <span className="text-slate-600">{row.createdAt ?? '—'}</span> },
            { key: 'status', header: 'Trạng thái', render: (row: any) => <span className="text-slate-600">{row.status ?? '—'}</span> },
          ]}
          data={rows as any}
          emptyMessage="Không có session"
          className={SETTINGS_CONTROL_TEXT}
        />
      </Card>
    </>
  );
};

