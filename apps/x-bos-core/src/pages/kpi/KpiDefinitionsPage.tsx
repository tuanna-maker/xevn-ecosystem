import { useMemo, useState } from 'react';
import { Edit3, Plus, Trash2 } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { DrawerShell } from '@/components/drawers/DrawerShell';
import { useXbosStore } from '@/store/useXbosStore';
import type { KpiDefinition, KpiFrequency } from '@/types';

const DEFAULT_TENANT = 'tenant-xevn-holding';
const KPI_VALUE_TYPE_CATEGORY_CODE = 'KPI_VALUE_TYPE';
const DEFAULT_VALUE_TYPE_ITEM_CODE = 'POINT';

type DrawerMode = 'create' | 'edit';

export function KpiDefinitionsPage() {
  const kpiDefinitions = useXbosStore((s) => s.kpiDefinitions);
  const addOrUpdateKpiDefinition = useXbosStore((s) => s.addOrUpdateKpiDefinition);
  const deleteKpiByCode = useXbosStore((s) => s.deleteKpiByCode);
  // Tránh selector trả về mảng mới liên tục gây loop re-render (Zustand getSnapshot warning).
  const valueTypeItems = useXbosStore(
    useShallow((s) => s.getItemsByCategory(KPI_VALUE_TYPE_CATEGORY_CODE, DEFAULT_TENANT))
  );

  function unitFromValueTypeItemCode(itemCode: string) {
    const item = valueTypeItems.find((i) => i.code === itemCode);
    const unit = (item?.payloadJson as any)?.unit;
    return typeof unit === 'string' && unit.trim() ? unit : '';
  }

  function inferValueTypeItemCodeByUnit(unit: string) {
    const hit = valueTypeItems.find((i) => (i.payloadJson as any)?.unit === unit);
    return hit?.code ?? DEFAULT_VALUE_TYPE_ITEM_CODE;
  }

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mode, setMode] = useState<DrawerMode>('create');
  const [error, setError] = useState<string>('');

  const [form, setForm] = useState({
    kpiCode: '',
    kpiName: '',
    valueTypeItemCode: DEFAULT_VALUE_TYPE_ITEM_CODE,
    unit: unitFromValueTypeItemCode(DEFAULT_VALUE_TYPE_ITEM_CODE) || 'điểm',
    frequency: 'monthly' as KpiFrequency,
    effectiveFrom: '',
    effectiveTo: '',
    status: 'active' as KpiDefinition['status'],
  });

  const rows = useMemo(() => {
    const list = kpiDefinitions.filter((k) => k.tenantId === DEFAULT_TENANT);
    const byCode = new Map<string, KpiDefinition[]>();
    for (const k of list) {
      const arr = byCode.get(k.kpiCode) ?? [];
      arr.push(k);
      byCode.set(k.kpiCode, arr);
    }

    const out: KpiDefinition[] = [];
    for (const [, versions] of byCode) {
      const active = versions.find((x) => x.status === 'active');
      if (active) out.push(active);
      else out.push(versions.reduce((m, x) => (x.version > m.version ? x : m), versions[0]));
    }

    return out.sort((a, b) => a.kpiCode.localeCompare(b.kpiCode));
  }, [kpiDefinitions]);

  function openCreate() {
    setError('');
    setMode('create');
    setForm({
      kpiCode: '',
      kpiName: '',
      valueTypeItemCode: DEFAULT_VALUE_TYPE_ITEM_CODE,
      unit: unitFromValueTypeItemCode(DEFAULT_VALUE_TYPE_ITEM_CODE) || 'điểm',
      frequency: 'monthly',
      effectiveFrom: '',
      effectiveTo: '',
      status: 'active',
    });
    setDrawerOpen(true);
  }

  function openEdit(row: KpiDefinition) {
    setError('');
    setMode('edit');
    const inferredValueTypeItemCode = row.valueTypeItemCode ?? inferValueTypeItemCodeByUnit(row.unit);
    setForm({
      kpiCode: row.kpiCode,
      kpiName: row.kpiName,
      unit: row.unit,
      valueTypeItemCode: inferredValueTypeItemCode,
      frequency: row.frequency,
      effectiveFrom: row.effectiveFrom ?? '',
      effectiveTo: row.effectiveTo ?? '',
      status: row.status,
    });
    setDrawerOpen(true);
  }

  function onSubmit() {
    setError('');
    try {
      const payload = {
        tenantId: DEFAULT_TENANT,
        kpiCode: form.kpiCode.trim().toUpperCase(),
        kpiName: form.kpiName.trim(),
        unit: form.unit.trim(),
        frequency: form.frequency,
        valueTypeCategoryCode: KPI_VALUE_TYPE_CATEGORY_CODE,
        valueTypeItemCode: form.valueTypeItemCode,
        formulaSpec: {},
        effectiveFrom: form.effectiveFrom.trim() ? form.effectiveFrom.trim() : null,
        effectiveTo: form.effectiveTo.trim() ? form.effectiveTo.trim() : null,
        status: form.status,
      };

      if (!payload.kpiCode) throw new Error('Thiếu mã KPI');
      if (!payload.kpiName) throw new Error('Thiếu tên KPI');
      if (!payload.unit) throw new Error('Thiếu đơn vị đo');

      if (payload.effectiveFrom && payload.effectiveTo) {
        const from = new Date(payload.effectiveFrom);
        const to = new Date(payload.effectiveTo);
        if (to.getTime() < from.getTime()) throw new Error('Khoảng hiệu lực không hợp lệ');
      }

      addOrUpdateKpiDefinition(payload as any);
      setDrawerOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lỗi không xác định');
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-xevn-text">KPI</h2>
            <p className="mt-1 text-sm text-xevn-muted">
              Lưu KPI sẽ tạo phiên bản mới.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-2xl bg-xevn-primary px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-xevn-primary/25 transition hover:bg-blue-800"
          >
            <Plus className="h-4 w-4" />
            Thêm KPI
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white/80 shadow-glass backdrop-blur-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-black/[0.06] bg-black/[0.02] text-xs uppercase tracking-wide text-xevn-muted">
              <th className="px-4 py-3 font-medium w-32">Mã KPI</th>
              <th className="px-4 py-3 font-medium">Tên</th>
              <th className="px-4 py-3 font-medium w-28">Đơn vị</th>
              <th className="px-4 py-3 font-medium w-24">Tần suất</th>
              <th className="px-4 py-3 font-medium w-24">Phiên bản</th>
              <th className="px-4 py-3 font-medium w-24">Trạng thái</th>
              <th className="px-4 py-3 font-medium w-44">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-black/[0.04] last:border-0 hover:bg-black/[0.02]"
              >
                <td className="px-4 py-3 font-mono text-xs">{row.kpiCode}</td>
                <td className="px-4 py-3 font-medium">{row.kpiName}</td>
                <td className="px-4 py-3 text-xevn-muted">{row.unit}</td>
                <td className="px-4 py-3 text-xevn-muted">{row.frequency}</td>
                <td className="px-4 py-3">{row.version}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      row.status === 'active'
                        ? 'rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700'
                        : row.status === 'draft'
                          ? 'rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-700'
                          : 'rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600'
                    }
                  >
                    {row.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(row)}
                      className="rounded-xl px-3 py-2 text-sm font-medium text-xevn-primary hover:bg-xevn-primary/10"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Edit3 className="h-4 w-4" />
                        Sửa
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!window.confirm(`Xóa toàn bộ KPI ${row.kpiCode}?`)) return;
                        deleteKpiByCode(DEFAULT_TENANT, row.kpiCode);
                      }}
                      className="rounded-xl px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-500/10"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Trash2 className="h-4 w-4" />
                        Xóa
                      </span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-xevn-muted">
                  Chưa có KPI.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <DrawerShell
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={mode === 'create' ? 'Thêm KPI' : 'Sửa KPI'}
        widthClassName="max-w-lg"
      >
        <div className="space-y-5">
          {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700">{error}</div>}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit();
            }}
            className="space-y-5"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Mã KPI" required>
                <input
                  required
                  className="input-apple font-mono text-xs"
                  value={form.kpiCode}
                  onChange={(e) => setForm((f) => ({ ...f, kpiCode: e.target.value }))}
                  placeholder="VD: KPI_SALES"
                  disabled={mode === 'edit'}
                />
              </Field>
              <Field label="Tần suất đo" required>
                <select
                  className="input-apple"
                  value={form.frequency}
                  onChange={(e) => setForm((f) => ({ ...f, frequency: e.target.value as KpiFrequency }))}
                >
                  <option value="daily">daily</option>
                  <option value="weekly">weekly</option>
                  <option value="monthly">monthly</option>
                </select>
              </Field>
            </div>

            <Field label="Tên KPI" required>
              <input
                required
                className="input-apple"
                value={form.kpiName}
                onChange={(e) => setForm((f) => ({ ...f, kpiName: e.target.value }))}
                placeholder="VD: Điểm doanh số"
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Loại giá trị KPI" required>
                <select
                  className="input-apple"
                  value={form.valueTypeItemCode}
                  onChange={(e) => {
                    const itemCode = e.target.value;
                    const unit = unitFromValueTypeItemCode(itemCode);
                    setForm((f) => ({ ...f, valueTypeItemCode: itemCode, unit: unit || f.unit }));
                  }}
                >
                  {valueTypeItems.map((i) => (
                    <option key={i.id} value={i.code}>
                      {i.label} ({i.code})
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Trạng thái" required>
                <select
                  className="input-apple"
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as KpiDefinition['status'] }))}
                >
                  <option value="draft">draft</option>
                  <option value="active">active</option>
                  <option value="inactive">inactive</option>
                </select>
              </Field>
            </div>

            <Field label="Đơn vị đo" required>
              <input
                required
                className="input-apple"
                value={form.unit}
                disabled
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Hiệu lực từ">
                <input
                  className="input-apple"
                  type="date"
                  value={form.effectiveFrom}
                  onChange={(e) => setForm((f) => ({ ...f, effectiveFrom: e.target.value }))}
                />
              </Field>
              <Field label="Hiệu lực đến">
                <input
                  className="input-apple"
                  type="date"
                  value={form.effectiveTo}
                  onChange={(e) => setForm((f) => ({ ...f, effectiveTo: e.target.value }))}
                />
              </Field>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="rounded-xl px-4 py-2 text-sm font-medium text-xevn-muted hover:bg-black/[0.04]"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="rounded-xl bg-xevn-primary px-5 py-2 text-sm font-medium text-white shadow-md"
              >
                Lưu KPI
              </button>
            </div>
          </form>

          <div className="rounded-2xl border border-black/[0.06] bg-black/[0.02] p-4 text-sm">
            <div className="font-semibold text-xevn-text">Ghi chú</div>
            <div className="mt-1 text-xevn-muted">
              Khi bạn bấm “Lưu”, hệ thống tạo phiên bản mới cho KPI. Phiên bản có trạng thái `active` sẽ được dùng khi chạy tính thưởng/phạt.
            </div>
          </div>
        </div>
      </DrawerShell>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-xevn-text/90">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      {children}
    </label>
  );
}

