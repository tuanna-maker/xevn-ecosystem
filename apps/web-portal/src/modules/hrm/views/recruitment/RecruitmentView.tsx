import React, { useMemo, useState } from 'react';
import { Card, DataTable } from '../../../../components/common';
import { SETTINGS_CONTROL_TEXT } from '../../../../pages/command-center/settings-form-pattern';
import { HRM_MOCK_RECRUITMENT } from '../../mock-data';

type TabKey = 'dashboard' | 'jobs' | 'candidates' | 'interviews';

export const RecruitmentView: React.FC<{ openHrmApp: (path: string) => void }> = ({ openHrmApp }) => {
  const [tab, setTab] = useState<TabKey>('dashboard');
  const [q, setQ] = useState('');

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return HRM_MOCK_RECRUITMENT;
    return HRM_MOCK_RECRUITMENT.filter((r) => String(r.campaign ?? '').toLowerCase().includes(query));
  }, [q]);

  return (
    <>
      <Card className="mt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-xevn-text">Tuyển dụng</div>
            <div className="mt-1 text-sm text-xevn-textSecondary">Tab structure theo `Recruitment` bên HRM (dashboard/jobs/candidates/interviews).</div>
          </div>
          <div className="flex items-center gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm chiến dịch..."
              className="h-10 w-64 max-w-[70vw] rounded-lg border border-xevn-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-xevn-primary/20"
            />
            <button
              type="button"
              onClick={() => openHrmApp('/hr/recruitment')}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-xevn-border bg-white px-3 text-sm font-semibold text-xevn-text transition active:scale-95 hover:bg-slate-50"
            >
              Mở HRM (tham chiếu)
            </button>
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-xevn-primary px-4 text-sm font-semibold text-white shadow-soft transition active:scale-95 hover:opacity-90"
            >
              Tạo chiến dịch
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[
            { key: 'dashboard', label: 'Dashboard' },
            { key: 'jobs', label: 'Jobs' },
            { key: 'candidates', label: 'Candidates' },
            { key: 'interviews', label: 'Interviews' },
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
            { key: 'campaign', header: 'Chiến dịch', render: (row: any) => <span className="font-medium">{row.campaign}</span> },
            { key: 'department', header: 'Phòng/Ban' },
            { key: 'need', header: 'Chỉ tiêu', render: (row: any) => <span className="tabular-nums">{row.need}</span> },
            { key: 'pipeline', header: 'Pipeline', render: (row: any) => <span className="tabular-nums">{row.pipeline}</span> },
            { key: 'status', header: 'Trạng thái' },
          ]}
          data={rows as any}
          emptyMessage="Không có dữ liệu tuyển dụng"
          className={SETTINGS_CONTROL_TEXT}
        />
      </Card>
    </>
  );
};

