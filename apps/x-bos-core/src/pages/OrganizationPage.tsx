import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useXbosStore } from '@/store/useXbosStore';
import { DynamicForm } from '@/components/dynamic/DynamicForm';
import { DrawerShell } from '@/components/drawers/DrawerShell';
import { OrgTabs } from '@/components/layout/OrgTabs';
import type { CategoryItem, OrgUnit } from '@/types';
import { cn } from '@/lib/cn';

const DEFAULT_TENANT = 'tenant-xevn-holding';

export function OrganizationPage() {
  const orgUnits = useXbosStore((s) => s.orgUnits);
  const metadataAttributes = useXbosStore((s) => s.metadataAttributes);
  const globalSearch = useXbosStore((s) => s.globalSearch);
  const addOrgUnit = useXbosStore((s) => s.addOrgUnit);
  const addCategoryItem = useXbosStore((s) => s.addCategoryItem);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [nestedOpen, setNestedOpen] = useState(false);
  const [quickCategoryCode, setQuickCategoryCode] = useState<string | null>(null);

  const orgFields = useMemo(
    () => metadataAttributes.filter((m) => m.entityType === 'org_unit'),
    [metadataAttributes]
  );

  const [form, setForm] = useState({
    code: '',
    name: '',
    orgTypeCode: 'department' as OrgUnit['orgTypeCode'],
    parentId: '' as string | '',
    taxCode: '',
    legalRep: '',
    customAttributes: {} as Record<string, unknown>,
  });

  const filtered = useMemo(() => {
    const q = globalSearch.trim().toLowerCase();
    if (!q) return orgUnits;
    return orgUnits.filter(
      (o) =>
        o.code.toLowerCase().includes(q) ||
        o.name.toLowerCase().includes(q)
    );
  }, [orgUnits, globalSearch]);

  const parentLabel = (id: string | null) => {
    if (!id) return '—';
    return orgUnits.find((o) => o.id === id)?.name ?? id;
  };

  function openDrawer() {
    setForm({
      code: '',
      name: '',
      orgTypeCode: 'department',
      parentId: '',
      taxCode: '',
      legalRep: '',
      customAttributes: Object.fromEntries(orgFields.map((f) => [f.key, ''])),
    });
    setDrawerOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    addOrgUnit({
      tenantId: DEFAULT_TENANT,
      parentId: form.parentId || null,
      orgTypeCode: form.orgTypeCode,
      code: form.code.trim(),
      name: form.name.trim(),
      taxCode: form.taxCode.trim() || undefined,
      legalRep: form.legalRep.trim() || undefined,
      customAttributes: { ...form.customAttributes },
      status: 'active',
    });
    setDrawerOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <OrgTabs />
        <div className="h-px w-full bg-black/[0.06]" />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-xevn-text">
              Quản trị đơn vị
            </h1>
            <p className="mt-1 text-sm text-xevn-muted">
              Cây tổ chức động — trường chuẩn và trường bổ sung.
            </p>
          </div>
          <button
            type="button"
            onClick={openDrawer}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-xevn-primary px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-xevn-primary/25 transition hover:bg-blue-800"
          >
            <Plus className="h-4 w-4" />
            Thêm mới
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white/80 shadow-glass backdrop-blur-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-black/[0.06] bg-black/[0.02] text-xs uppercase tracking-wide text-xevn-muted">
              <th className="px-4 py-3 font-medium">Mã</th>
              <th className="px-4 py-3 font-medium">Tên</th>
              <th className="px-4 py-3 font-medium">Loại</th>
              <th className="px-4 py-3 font-medium">Trực thuộc</th>
              <th className="px-4 py-3 font-medium">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id} className="border-b border-black/[0.04] last:border-0 hover:bg-black/[0.02]">
                <td className="px-4 py-3 font-mono text-xs">{row.code}</td>
                <td className="px-4 py-3 font-medium">{row.name}</td>
                <td className="px-4 py-3 text-xevn-muted">{row.orgTypeCode}</td>
                <td className="px-4 py-3 text-xevn-muted">{parentLabel(row.parentId)}</td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-xs font-medium',
                      row.status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-700'
                        : 'bg-slate-200 text-slate-600'
                    )}
                  >
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DrawerShell
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Thêm đơn vị"
        widthClassName="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Mã đơn vị" required>
              <input
                required
                className="input-apple"
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                placeholder="VD: LG-KD-2"
              />
            </Field>
            <Field label="Tên">
              <input
                required
                className="input-apple"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Loại đơn vị">
              <select
                className="input-apple"
                value={form.orgTypeCode}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    orgTypeCode: e.target.value as OrgUnit['orgTypeCode'],
                  }))
                }
              >
                <option value="holding">holding</option>
                <option value="subsidiary">subsidiary</option>
                <option value="division">division</option>
                <option value="department">department</option>
              </select>
            </Field>
            <Field label="Đơn vị cha">
              <select
                className="input-apple"
                value={form.parentId}
                onChange={(e) => setForm((f) => ({ ...f, parentId: e.target.value }))}
              >
                <option value="">— Gốc (Holding) —</option>
                {orgUnits.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.code} — {o.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Mã số thuế">
              <input
                className="input-apple"
                value={form.taxCode}
                onChange={(e) => setForm((f) => ({ ...f, taxCode: e.target.value }))}
              />
            </Field>
            <Field label="Người đại diện PL">
              <input
                className="input-apple"
                value={form.legalRep}
                onChange={(e) => setForm((f) => ({ ...f, legalRep: e.target.value }))}
              />
            </Field>
          </div>

          <div className="rounded-2xl border border-black/[0.06] bg-black/[0.02] p-4">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-xevn-muted">
              Trường bổ sung
            </div>
            <DynamicForm
              fields={orgFields}
              values={form.customAttributes}
              tenantId={DEFAULT_TENANT}
              onChange={(key, value) =>
                setForm((f) => ({
                  ...f,
                  customAttributes: { ...f.customAttributes, [key]: value },
                }))
              }
              onQuickAddCategory={(code) => {
                setQuickCategoryCode(code);
                setNestedOpen(true);
              }}
            />
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
              Lưu đơn vị
            </button>
          </div>
        </form>
      </DrawerShell>

      <DrawerShell
        open={nestedOpen}
        onClose={() => setNestedOpen(false)}
        title={quickCategoryCode ? `Thêm nhanh — ${quickCategoryCode}` : 'Danh mục'}
        layer="nested"
        widthClassName="max-w-sm"
      >
        <QuickCategoryForm
          categoryCode={quickCategoryCode ?? 'COST_CENTER'}
          tenantId={DEFAULT_TENANT}
          onSaved={() => {
            setNestedOpen(false);
            setQuickCategoryCode(null);
          }}
          addCategoryItem={addCategoryItem}
        />
      </DrawerShell>

    </div>
  );
}

function Field({
  label,
  children,
  required,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
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

function QuickCategoryForm({
  categoryCode,
  tenantId,
  onSaved,
  addCategoryItem,
}: {
  categoryCode: string;
  tenantId: string;
  onSaved: () => void;
  addCategoryItem: (item: Omit<CategoryItem, 'id'> & { id?: string }) => CategoryItem;
}) {
  const [code, setCode] = useState('');
  const [label, setLabel] = useState('');

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!code.trim() || !label.trim()) return;
        addCategoryItem({
          categoryCode,
          tenantId,
          code: code.trim(),
          label: label.trim(),
          payloadJson: {},
        });
        onSaved();
      }}
    >
      <Field label="Mã giá trị" required>
        <input
          required
          className="w-full rounded-xl border border-black/[0.06] bg-white px-3 py-2.5 text-sm"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
      </Field>
      <Field label="Nhãn hiển thị" required>
        <input
          required
          className="w-full rounded-xl border border-black/[0.06] bg-white px-3 py-2.5 text-sm"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
      </Field>
      <button
        type="submit"
        className="w-full rounded-xl bg-xevn-primary py-2.5 text-sm font-medium text-white"
      >
        Lưu & đóng
      </button>
    </form>
  );
}
