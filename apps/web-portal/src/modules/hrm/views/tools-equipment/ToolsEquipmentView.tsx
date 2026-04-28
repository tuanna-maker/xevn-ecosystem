import React, { useMemo, useState } from 'react';
import { Card, DataTable } from '../../../../components/common';
import { SETTINGS_CONTROL_TEXT } from '../../../../pages/command-center/settings-form-pattern';
import { HRM_MOCK_TOOLS_EQUIPMENT } from '../../mock-data';
import { CenteredModal } from '../shared/CenteredModal';

export const ToolsEquipmentView: React.FC = () => {
  const [q, setQ] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(() => ({ name: '', code: '', status: 'in_use', owner: '', notes: '' }));

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return HRM_MOCK_TOOLS_EQUIPMENT;
    return HRM_MOCK_TOOLS_EQUIPMENT.filter((r: any) => String(r.name ?? r.title ?? '').toLowerCase().includes(query));
  }, [q]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ name: '', code: '', status: 'in_use', owner: '', notes: '' });
    setModalOpen(true);
  };

  const openEdit = (row: any) => {
    setEditingId(String(row.id ?? ''));
    setForm({
      name: row.name ?? row.title ?? '',
      code: row.code ?? '',
      status: row.status ?? 'in_use',
      owner: row.owner ?? '',
      notes: row.notes ?? '',
    });
    setModalOpen(true);
  };

  return (
    <>
      <Card className="mt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-xevn-text">Công cụ & thiết bị</div>
            <div className="mt-1 text-sm text-xevn-textSecondary">Danh sách CCDC/TSCĐ (FE trước).</div>
          </div>
          <div className="flex items-center gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm kiếm..."
              className="h-10 w-64 max-w-[70vw] rounded-lg border border-xevn-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-xevn-primary/20"
            />
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-xevn-primary px-4 text-sm font-semibold text-white shadow-soft transition active:scale-95 hover:opacity-90"
            >
              Thêm tài sản
            </button>
          </div>
        </div>
      </Card>

      <Card className="mt-4 p-0 overflow-hidden">
        <DataTable
          columns={[
            { key: 'name', header: 'Tên', render: (row: any) => <span className="font-medium">{row.name ?? row.title ?? '—'}</span> },
            { key: 'code', header: 'Mã', render: (row: any) => <span className="font-mono text-sm text-xevn-primary">{row.code ?? '—'}</span> },
            { key: 'owner', header: 'Người phụ trách', render: (row: any) => <span className="text-slate-600">{row.owner ?? '—'}</span> },
            { key: 'status', header: 'Trạng thái', render: (row: any) => <span className="text-slate-600">{row.status ?? '—'}</span> },
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
        title={editingId ? 'Chỉnh sửa tài sản' : 'Thêm tài sản'}
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
              disabled={!form.name.trim()}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-xevn-primary px-4 text-sm font-semibold text-white shadow-soft transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 hover:opacity-90"
              onClick={() => setModalOpen(false)}
            >
              Lưu (FE)
            </button>
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <label className="space-y-1 md:col-span-2">
            <div className="text-xs font-semibold text-slate-500">Tên *</div>
            <input
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              className="h-10 w-full rounded-lg border border-xevn-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-xevn-primary/20"
            />
          </label>
          <label className="space-y-1">
            <div className="text-xs font-semibold text-slate-500">Mã</div>
            <input
              value={form.code}
              onChange={(e) => setForm((s) => ({ ...s, code: e.target.value }))}
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
              <option value="in_use">Đang sử dụng</option>
              <option value="available">Sẵn sàng</option>
              <option value="maintenance">Bảo trì</option>
              <option value="lost">Mất/Thất lạc</option>
              <option value="disposed">Thanh lý</option>
            </select>
          </label>
          <label className="space-y-1">
            <div className="text-xs font-semibold text-slate-500">Người phụ trách</div>
            <input
              value={form.owner}
              onChange={(e) => setForm((s) => ({ ...s, owner: e.target.value }))}
              className="h-10 w-full rounded-lg border border-xevn-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-xevn-primary/20"
            />
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

