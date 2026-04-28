import React, { useMemo, useState } from 'react';
import { Card, DataTable } from '../../../../components/common';
import { SETTINGS_CONTROL_TEXT } from '../../../../pages/command-center/settings-form-pattern';
import { HRM_MOCK_PROCESSES } from '../../mock-data';
import { CenteredModal } from '../shared/CenteredModal';

type TabKey = 'processes' | 'policies';

type ProcessStatus = 'active' | 'draft' | 'review' | 'archived';

type ProcessItem = {
  id: string;
  type: 'process' | 'policy';
  name: string;
  code: string | null;
  category: string | null;
  department: string | null;
  description: string | null;
  content: string | null;
  status: ProcessStatus;
  effective_date: string | null;
  expiry_date: string | null;
  version: number | null;
  issuing_authority: string | null;
  file_urls: string[];
  updated_at: string;
};

const statusLabel: Record<ProcessStatus, { label: string; cls: string }> = {
  active: { label: 'Đang áp dụng', cls: 'text-emerald-700 font-medium' },
  draft: { label: 'Bản nháp', cls: 'text-slate-600' },
  review: { label: 'Đang xét duyệt', cls: 'text-amber-700' },
  archived: { label: 'Đã lưu trữ', cls: 'text-rose-700' },
};

const emptyForm = (type: ProcessItem['type']) => ({
  type,
  name: '',
  code: '',
  category: '',
  department: '',
  description: '',
  content: '',
  status: 'draft' as ProcessStatus,
  effective_date: '',
  expiry_date: '',
  version: 1,
  issuing_authority: '',
  file_urls: [] as string[],
});

export const ProcessesView: React.FC = () => {
  const [tab, setTab] = useState<TabKey>('processes');
  const [q, setQ] = useState('');
  const [items, setItems] = useState<ProcessItem[]>(() => {
    const now = new Date().toISOString();
    return (HRM_MOCK_PROCESSES as any[]).map((p) => ({
      id: String(p.id ?? crypto.randomUUID()),
      type: (p.type === 'policy' ? 'policy' : 'process') as ProcessItem['type'],
      name: String(p.name ?? p.title ?? '—'),
      code: p.code ?? null,
      category: p.category ?? null,
      department: p.department ?? null,
      description: p.description ?? null,
      content: p.content ?? null,
      status: (p.status ?? 'draft') as ProcessStatus,
      effective_date: p.effective_date ?? null,
      expiry_date: p.expiry_date ?? null,
      version: p.version ?? 1,
      issuing_authority: p.issuing_authority ?? null,
      file_urls: Array.isArray(p.file_urls) ? p.file_urls : [],
      updated_at: p.updated_at ?? now,
    }));
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewItem, setViewItem] = useState<ProcessItem | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(() => emptyForm('process'));

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    const base = items.filter((p) => (tab === 'processes' ? p.type === 'process' : p.type === 'policy'));
    if (!query) return base;
    return base.filter((p) => String(p.name ?? '').toLowerCase().includes(query));
  }, [items, tab, q]);

  const openAdd = () => {
    const type: ProcessItem['type'] = tab === 'policies' ? 'policy' : 'process';
    setEditingId(null);
    setForm(emptyForm(type));
    setDialogOpen(true);
  };

  const openEdit = (item: ProcessItem) => {
    setEditingId(item.id);
    setForm({
      type: item.type,
      name: item.name,
      code: item.code ?? '',
      category: item.category ?? '',
      department: item.department ?? '',
      description: item.description ?? '',
      content: item.content ?? '',
      status: item.status,
      effective_date: item.effective_date ?? '',
      expiry_date: item.expiry_date ?? '',
      version: item.version ?? 1,
      issuing_authority: item.issuing_authority ?? '',
      file_urls: item.file_urls ?? [],
    });
    setDialogOpen(true);
  };

  const save = () => {
    if (!form.name.trim()) return;
    const now = new Date().toISOString();
    if (editingId) {
      setItems((prev) =>
        prev.map((it) =>
          it.id !== editingId
            ? it
            : {
                ...it,
                type: form.type,
                name: form.name.trim(),
                code: form.code.trim() || null,
                category: form.category.trim() || null,
                department: form.department.trim() || null,
                description: form.description.trim() || null,
                content: form.content.trim() || null,
                status: form.status,
                effective_date: form.effective_date || null,
                expiry_date: form.expiry_date || null,
                version: form.version || 1,
                issuing_authority: form.issuing_authority.trim() || null,
                file_urls: form.file_urls,
                updated_at: now,
              }
        )
      );
    } else {
      setItems((prev) => [
        {
          id: crypto.randomUUID(),
          type: form.type,
          name: form.name.trim(),
          code: form.code.trim() || null,
          category: form.category.trim() || null,
          department: form.department.trim() || null,
          description: form.description.trim() || null,
          content: form.content.trim() || null,
          status: form.status,
          effective_date: form.effective_date || null,
          expiry_date: form.expiry_date || null,
          version: form.version || 1,
          issuing_authority: form.issuing_authority.trim() || null,
          file_urls: form.file_urls,
          updated_at: now,
        },
        ...prev,
      ]);
    }
    setDialogOpen(false);
  };

  const remove = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  return (
    <>
      <Card className="mt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-xevn-text">Quy trình & Quy định</div>
            <div className="mt-1 text-sm text-xevn-textSecondary">Danh mục quy trình/quy định nội bộ (FE trước).</div>
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
              onClick={openAdd}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-xevn-primary px-4 text-sm font-semibold text-white shadow-soft transition active:scale-95 hover:opacity-90"
            >
              Thêm mới
            </button>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            { key: 'processes', label: 'Quy trình' },
            { key: 'policies', label: 'Quy định' },
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
            { key: 'name', header: 'Tên', render: (row: any) => <span className="font-medium">{row.name}</span> },
            { key: 'code', header: 'Mã', render: (row: any) => <span className="font-mono text-sm text-xevn-primary">{row.code ?? '—'}</span> },
            { key: 'department', header: 'Phòng/Ban', render: (row: any) => <span className="text-slate-600">{row.department ?? '—'}</span> },
            {
              key: 'status',
              header: 'Trạng thái',
              render: (row: any) => {
                const s = statusLabel[(row.status ?? 'draft') as ProcessStatus] ?? statusLabel.draft;
                return <span className={s.cls}>{s.label}</span>;
              },
            },
            { key: 'effective_date', header: 'Hiệu lực', render: (row: any) => <span className="text-slate-600">{row.effective_date ?? '—'}</span> },
            {
              key: 'actions',
              header: 'Thao tác',
              render: (row: any) => (
                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    className="text-[15px] font-semibold text-xevn-primary hover:underline"
                    onClick={() => setViewItem(row as ProcessItem)}
                  >
                    Xem
                  </button>
                  <button
                    type="button"
                    className="text-[15px] font-semibold text-xevn-primary hover:underline"
                    onClick={() => openEdit(row as ProcessItem)}
                  >
                    Sửa
                  </button>
                  <button
                    type="button"
                    className="text-[15px] font-semibold text-rose-700 hover:underline"
                    onClick={() => remove(String((row as ProcessItem).id))}
                  >
                    Xóa
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
        open={dialogOpen}
        title={editingId ? 'Chỉnh sửa' : 'Thêm mới'}
        onClose={() => setDialogOpen(false)}
        footer={
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-xevn-border bg-white px-4 text-sm font-semibold text-xevn-text transition active:scale-95 hover:bg-slate-50"
              onClick={() => setDialogOpen(false)}
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={!form.name.trim()}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-xevn-primary px-4 text-sm font-semibold text-white shadow-soft transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 hover:opacity-90"
              onClick={save}
            >
              Lưu
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
                    onChange={(e) => setForm((s) => ({ ...s, status: e.target.value as ProcessStatus }))}
                    className="h-10 w-full rounded-lg border border-xevn-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-xevn-primary/20"
                  >
                    <option value="draft">Bản nháp</option>
                    <option value="review">Đang xét duyệt</option>
                    <option value="active">Đang áp dụng</option>
                    <option value="archived">Đã lưu trữ</option>
                  </select>
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
                  <div className="text-xs font-semibold text-slate-500">Danh mục</div>
                  <input
                    value={form.category}
                    onChange={(e) => setForm((s) => ({ ...s, category: e.target.value }))}
                    className="h-10 w-full rounded-lg border border-xevn-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-xevn-primary/20"
                  />
                </label>
                <label className="space-y-1">
                  <div className="text-xs font-semibold text-slate-500">Hiệu lực</div>
                  <input
                    type="date"
                    value={form.effective_date}
                    onChange={(e) => setForm((s) => ({ ...s, effective_date: e.target.value }))}
                    className="h-10 w-full rounded-lg border border-xevn-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-xevn-primary/20"
                  />
                </label>
                <label className="space-y-1">
                  <div className="text-xs font-semibold text-slate-500">Hết hạn</div>
                  <input
                    type="date"
                    value={form.expiry_date}
                    onChange={(e) => setForm((s) => ({ ...s, expiry_date: e.target.value }))}
                    className="h-10 w-full rounded-lg border border-xevn-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-xevn-primary/20"
                  />
                </label>
                <label className="space-y-1">
                  <div className="text-xs font-semibold text-slate-500">Phiên bản</div>
                  <input
                    type="number"
                    value={form.version}
                    onChange={(e) => setForm((s) => ({ ...s, version: Number(e.target.value || 1) }))}
                    className="h-10 w-full rounded-lg border border-xevn-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-xevn-primary/20"
                  />
                </label>
                <label className="space-y-1">
                  <div className="text-xs font-semibold text-slate-500">Cơ quan ban hành</div>
                  <input
                    value={form.issuing_authority}
                    onChange={(e) => setForm((s) => ({ ...s, issuing_authority: e.target.value }))}
                    className="h-10 w-full rounded-lg border border-xevn-border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-xevn-primary/20"
                  />
                </label>
                <label className="space-y-1 md:col-span-2">
                  <div className="text-xs font-semibold text-slate-500">Mô tả</div>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
                    className="min-h-24 w-full rounded-lg border border-xevn-border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-xevn-primary/20"
                  />
                </label>
                <label className="space-y-1 md:col-span-2">
                  <div className="text-xs font-semibold text-slate-500">Nội dung</div>
                  <textarea
                    value={form.content}
                    onChange={(e) => setForm((s) => ({ ...s, content: e.target.value }))}
                    className="min-h-32 w-full rounded-lg border border-xevn-border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-xevn-primary/20"
                  />
                </label>
              </div>
      </CenteredModal>

      <CenteredModal open={!!viewItem} title="Chi tiết" onClose={() => setViewItem(null)}>
        {viewItem ? (
          <div className="space-y-3">
              <div className="text-base font-semibold text-xevn-text">{viewItem.name}</div>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2 text-sm text-slate-700">
                <div>
                  <span className="text-slate-500">Mã:</span> <span className="font-mono">{viewItem.code ?? '—'}</span>
                </div>
                <div>
                  <span className="text-slate-500">Trạng thái:</span>{' '}
                  <span className={(statusLabel[viewItem.status] ?? statusLabel.draft).cls}>
                    {(statusLabel[viewItem.status] ?? statusLabel.draft).label}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Phòng/Ban:</span> {viewItem.department ?? '—'}
                </div>
                <div>
                  <span className="text-slate-500">Hiệu lực:</span> {viewItem.effective_date ?? '—'}
                </div>
              </div>
              {viewItem.description ? <div className="text-sm text-slate-600">{viewItem.description}</div> : null}
              {viewItem.content ? (
                <div className="rounded-lg border border-xevn-border bg-white p-3 text-sm text-slate-700 whitespace-pre-wrap">
                  {viewItem.content}
                </div>
              ) : null}
          </div>
        ) : null}
      </CenteredModal>
    </>
  );
};

