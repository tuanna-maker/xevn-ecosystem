import React, { useMemo, useState } from 'react';
import { Card, DataTable } from '../../../../components/common';
import { SETTINGS_CONTROL_TEXT } from '../../../../pages/command-center/settings-form-pattern';
import { HRM_MOCK_SERVICE_REQUESTS } from '../../mock-data';
import { CenteredModal } from '../shared/CenteredModal';

type TabKey = 'meal' | 'vehicle' | 'supply';

export const InternalServicesView: React.FC = () => {
  const [tab, setTab] = useState<TabKey>('meal');
  const [q, setQ] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(() => ({
    employee_name: '',
    department: '',
    status: 'pending',
    notes: '',
  }));

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    const base = HRM_MOCK_SERVICE_REQUESTS.filter((r: any) => r.service_type === tab);
    if (!query) return base;
    return base.filter((r: any) => String(r.employee_name ?? '').toLowerCase().includes(query));
  }, [tab, q]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ employee_name: '', department: '', status: 'pending', notes: '' });
    setModalOpen(true);
  };

  const openEdit = (row: any) => {
    setEditingId(String(row.id ?? ''));
    setForm({
      employee_name: row.employee_name ?? '',
      department: row.department ?? '',
      status: row.status ?? 'pending',
      notes: row.notes ?? '',
    });
    setModalOpen(true);
  };

  return (
    <>
      <Card className="mt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-xevn-text">Dịch vụ nội bộ</div>
            <div className="mt-1 text-sm text-xevn-textSecondary">Báo cơm / đặt xe / văn phòng phẩm (FE trước).</div>
          </div>
          <div className="flex items-center gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm theo nhân sự..."
              className="h-10 w-64 max-w-[70vw] rounded-lg border border-xevn-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-xevn-primary/20"
            />
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-xevn-primary px-4 text-sm font-semibold text-white shadow-soft transition active:scale-95 hover:opacity-90"
            >
              Tạo yêu cầu
            </button>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            { key: 'meal', label: 'Báo cơm' },
            { key: 'vehicle', label: 'Đặt xe' },
            { key: 'supply', label: 'Văn phòng phẩm' },
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
            { key: 'employee_name', header: 'Nhân sự', render: (row: any) => <span className="font-medium">{row.employee_name}</span> },
            { key: 'department', header: 'Phòng/Ban', render: (row: any) => <span className="text-slate-600">{row.department ?? '—'}</span> },
            { key: 'status', header: 'Trạng thái', render: (row: any) => <span className="text-slate-600">{row.status ?? '—'}</span> },
            { key: 'created_at', header: 'Ngày tạo', render: (row: any) => <span className="text-slate-600">{row.created_at ?? '—'}</span> },
            {
              key: 'actions',
              header: 'Thao tác',
              render: (row: any) => (
                <div className="flex items-center justify-end gap-3">
                  <button type="button" className="text-[15px] font-semibold text-xevn-primary hover:underline" onClick={() => openEdit(row)}>
                    Sửa
                  </button>
                </div>
              ),
            },
          ]}
          data={rows as any}
          emptyMessage="Không có dữ liệu"
          className={SETTINGS_CONTROL_TEXT}
        />
      </Card>

      <CenteredModal
        open={modalOpen}
        title={editingId ? 'Chỉnh sửa yêu cầu' : 'Tạo yêu cầu'}
        onClose={() => setModalOpen(false)}
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-xevn-border bg-white px-4 text-sm font-semibold text-xevn-text transition active:scale-95 hover:bg-slate-50"
              onClick={() => setModalOpen(false)}
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={!form.employee_name.trim()}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-xevn-primary px-4 text-sm font-semibold text-white shadow-soft transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 hover:opacity-90"
              onClick={() => setModalOpen(false)}
            >
              Lưu (FE)
            </button>
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <label className="space-y-1">
            <div className="text-xs font-semibold text-slate-500">Nhân sự *</div>
            <input
              value={form.employee_name}
              onChange={(e) => setForm((s) => ({ ...s, employee_name: e.target.value }))}
              className="h-10 w-full rounded-lg border border-xevn-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-xevn-primary/20"
            />
          </label>
          <label className="space-y-1">
            <div className="text-xs font-semibold text-slate-500">Phòng/Ban</div>
            <input
              value={form.department}
              onChange={(e) => setForm((s) => ({ ...s, department: e.target.value }))}
              className="h-10 w-full rounded-lg border border-xevn-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-xevn-primary/20"
            />
          </label>
          <label className="space-y-1">
            <div className="text-xs font-semibold text-slate-500">Trạng thái</div>
            <select
              value={form.status}
              onChange={(e) => setForm((s) => ({ ...s, status: e.target.value }))}
              className="h-10 w-full rounded-lg border border-xevn-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-xevn-primary/20"
            >
              <option value="pending">Chờ duyệt</option>
              <option value="approved">Đã duyệt</option>
              <option value="rejected">Từ chối</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </label>
          <label className="space-y-1 md:col-span-2">
            <div className="text-xs font-semibold text-slate-500">Ghi chú</div>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((s) => ({ ...s, notes: e.target.value }))}
              className="min-h-24 w-full rounded-lg border border-xevn-border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-xevn-primary/20"
            />
          </label>
        </div>
      </CenteredModal>
    </>
  );
};

