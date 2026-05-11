import { useEffect, useMemo, useState } from 'react';
import { Layers, Plus, Search, Settings2, Trash2 } from 'lucide-react';
import { useXbosStore } from '@/store/useXbosStore';

const DEFAULT_TENANT = 'tenant-xevn-holding';

export function MasterDataPage() {
  const categoryDefinitions = useXbosStore((s) => s.categoryDefinitions);
  const categoryItems = useXbosStore((s) => s.categoryItems);
  const addCategoryItem = useXbosStore((s) => s.addCategoryItem);
  const addCategoryDefinition = useXbosStore((s) => s.addCategoryDefinition);
  const removeCategoryDefinition = useXbosStore((s) => s.removeCategoryDefinition);
  const [activeCode, setActiveCode] = useState(categoryDefinitions[0]?.code ?? '');
  const [groupSearch, setGroupSearch] = useState('');

  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [groupDraftCode, setGroupDraftCode] = useState('');
  const [groupDraftName, setGroupDraftName] = useState('');
  const [groupDraftScope, setGroupDraftScope] = useState<'GROUP' | 'TENANT'>('GROUP');

  useEffect(() => {
    // Cho phép để trống lựa chọn (activeCode = '') để hiển thị đúng empty state ở cột phải.
    if (!activeCode) return;
    if (!categoryDefinitions.some((d) => d.code === activeCode)) setActiveCode(categoryDefinitions[0]?.code ?? '');
  }, [categoryDefinitions, activeCode]);

  useEffect(() => {
    if (!groupModalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setGroupModalOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [groupModalOpen]);

  const filteredGroups = useMemo(() => {
    const q = groupSearch.trim().toLowerCase();
    if (!q) return categoryDefinitions;
    return categoryDefinitions.filter((d) => d.code.toLowerCase().includes(q) || d.name.toLowerCase().includes(q));
  }, [categoryDefinitions, groupSearch]);

  const detailRows = useMemo(() => {
    if (!activeCode) return [];
    return categoryItems.filter((i) => i.categoryCode === activeCode && i.tenantId === DEFAULT_TENANT);
  }, [categoryItems, activeCode]);

  const activeGroup = useMemo(() => {
    if (!activeCode) return null;
    return categoryDefinitions.find((d) => d.code === activeCode) ?? null;
  }, [categoryDefinitions, activeCode]);

  return (
    <>
      <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-xevn-text">
          Danh mục tập trung
        </h1>
        <p className="mt-1 text-sm text-xevn-muted">
          Master-Detail: chọn nhóm ở cột trái, xem/sửa danh mục con ở cột phải.
        </p>
      </div>

      <div className="grid grid-cols-[320px_1fr] gap-8">
        {/* Left: Master Groups */}
        <div className="rounded-xl bg-white/85 shadow-soft backdrop-blur-sm border border-black/[0.06] p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Settings2 className="h-5 w-5 text-xevn-primary" />
                <div>
                  <div className="text-base font-semibold tracking-tight text-xevn-text">Nhóm danh mục</div>
                  <div className="text-xs text-xevn-muted">Chọn để xem danh mục con</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setGroupDraftCode('');
                  setGroupDraftName('');
                  setGroupDraftScope('GROUP');
                  setGroupModalOpen(true);
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-black/[0.08] bg-white/60 px-3 py-2 text-sm font-medium text-xevn-text hover:bg-white/90"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Thêm nhóm</span>
              </button>
            </div>

            {/* Search */}
            <div className="space-y-1.5">
              <div className="text-xs font-medium text-xevn-muted">Tìm nhanh</div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-xevn-neutral" />
                <input
                  className="input-apple pl-9 w-full"
                  value={groupSearch}
                  onChange={(e) => setGroupSearch(e.target.value)}
                  placeholder="Tìm theo mã hoặc tên..."
                />
              </div>
            </div>

            {/* Group list */}
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-xevn-muted">Danh sách</div>
              <div className="max-h-[520px] overflow-auto rounded-xl border border-black/[0.06] bg-white/60">
                {filteredGroups.length === 0 ? (
                  <div className="px-3 py-6 text-center text-sm text-xevn-muted">Không tìm thấy nhóm phù hợp.</div>
                ) : (
                  <div className="p-2 space-y-1">
                    {filteredGroups.map((d) => {
                      const isActive = d.code === activeCode;
                      return (
                        <div
                          key={d.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => setActiveCode((cur) => (cur === d.code ? '' : d.code))}
                          onKeyDown={(e) => {
                            if (e.key !== 'Enter' && e.key !== ' ') return;
                            setActiveCode((cur) => (cur === d.code ? '' : d.code));
                          }}
                          className={[
                            'flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-all cursor-pointer border',
                            isActive ? 'border-xevn-primary bg-xevn-primary/5' : 'border-transparent hover:bg-black/[0.02]',
                          ].join(' ')}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs text-xevn-muted">{d.code}</span>
                              {isActive && <span className="text-xs font-medium text-xevn-primary">Đang chọn</span>}
                            </div>
                            <div className="truncate text-xs text-xevn-text/80">{d.name}</div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeCategoryDefinition(d.id);
                              if (activeCode === d.code) setActiveCode('');
                            }}
                            className="rounded-lg p-2 text-xevn-muted hover:bg-red-500/10 hover:text-red-600"
                            aria-label="Xóa nhóm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Detail Items */}
        <div className="rounded-xl bg-white/85 shadow-soft backdrop-blur-sm border border-black/[0.06] p-4">
          {activeGroup == null ? (
            <div className="h-full min-h-[220px] flex items-center justify-center text-center">
              <div className="space-y-2">
                <div className="inline-flex items-center justify-center gap-2 rounded-xl border border-black/[0.06] bg-white/70 px-4 py-3 shadow-soft">
                  <Layers className="h-5 w-5 text-xevn-neutral" />
                  <div className="text-sm font-medium text-xevn-text">Danh mục con</div>
                </div>
                <div className="text-sm text-xevn-muted">Vui lòng chọn một Nhóm danh mục để xem chi tiết</div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Layers className="h-5 w-5 text-xevn-primary" />
                    <div className="text-base font-semibold tracking-tight text-xevn-text">Danh mục con</div>
                  </div>
                  <div className="mt-1 text-xs text-xevn-muted">
                    Nhóm: <span className="font-mono text-xs text-xevn-text">{activeGroup.code}</span> — {activeGroup.name}
                  </div>
                </div>

                {/* In-place creation */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!activeGroup) return;
                      addCategoryItem({
                        categoryCode: activeGroup.code,
                        tenantId: DEFAULT_TENANT,
                        code: `NEW-${Date.now().toString(36).toUpperCase()}`,
                        label: 'Giá trị mới',
                        payloadJson: {},
                      });
                    }}
                    disabled={!activeGroup}
                    className="inline-flex items-center gap-2 rounded-xl border border-black/[0.08] bg-white px-3 py-2 text-sm font-medium shadow-sm hover:bg-black/[0.02] disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />
                    Thêm dòng
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-black/[0.06] bg-white/90 shadow-soft backdrop-blur-sm">
                <table className="min-w-[640px] w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-black/[0.06] bg-white/70 backdrop-blur-md text-xs uppercase text-xevn-muted">
                      <th className="px-3 py-3 w-10" />
                      <th className="px-3 py-3">Mã</th>
                      <th className="px-3 py-3">Nhãn</th>
                      <th className="px-3 py-3">Payload (JSON)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailRows.map((row) => (
                      <MasterRow key={row.id} row={row} />
                    ))}
                    {detailRows.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-6 text-xevn-muted text-sm">
                          Chưa có danh mục con cho nhóm này.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

      {/* Modal: Add Group */}
      {groupModalOpen && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) setGroupModalOpen(false);
        }}
        role="dialog"
        aria-modal="true"
      >
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

        <div
          className="relative w-full max-w-md rounded-xl bg-white/95 shadow-overlay backdrop-blur-sm p-5"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-lg font-semibold tracking-tight text-xevn-text">Thêm nhóm danh mục mới</div>
              <div className="mt-1 text-sm text-xevn-muted">Tạo khung để sử dụng ở các form select.</div>
            </div>
            <button
              type="button"
              onClick={() => setGroupModalOpen(false)}
              className="rounded-xl px-3 py-2 text-sm font-medium text-xevn-muted hover:bg-black/[0.04]"
              aria-label="Đóng"
            >
              Hủy
            </button>
          </div>

          <div className="mt-4 space-y-4">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-xevn-text/90">
                Mã nhóm <span className="text-red-500">*</span>
              </span>
              <input
                className="input-apple font-mono text-xs w-full"
                value={groupDraftCode}
                onChange={(e) => setGroupDraftCode(e.target.value)}
                placeholder="VD: COST_CENTER"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-xevn-text/90">
                Tên nhóm <span className="text-red-500">*</span>
              </span>
              <input
                className="input-apple text-xs w-full"
                value={groupDraftName}
                onChange={(e) => setGroupDraftName(e.target.value)}
                placeholder="VD: Trung tâm chi phí"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-xevn-text/90">
                Phạm vi <span className="text-red-500">*</span>
              </span>
              <select
                className="input-apple text-xs w-full"
                value={groupDraftScope}
                onChange={(e) => setGroupDraftScope(e.target.value as 'GROUP' | 'TENANT')}
              >
                <option value="GROUP">Toàn tập đoàn</option>
                <option value="TENANT">Nội bộ</option>
              </select>
            </label>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setGroupModalOpen(false)}
              className="rounded-xl px-4 py-2 text-sm font-medium text-xevn-muted hover:bg-black/[0.04]"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={() => {
                const code = groupDraftCode.trim().toUpperCase();
                const name = groupDraftName.trim();
                if (!code || !name) return;

                const created = addCategoryDefinition({
                  code,
                  name,
                  tenantScope: groupDraftScope,
                });
                setActiveCode(created.code);
                setGroupModalOpen(false);
              }}
              className="rounded-xl bg-xevn-primary px-5 py-2 text-sm font-medium text-white shadow-md shadow-xevn-primary/25 hover:bg-blue-800"
            >
              Xác nhận thêm
            </button>
          </div>
        </div>
      </div>
    )}
      </>
  );
}

function MasterRow({ row }: { row: { id: string; code: string; label: string; payloadJson: Record<string, unknown> } }) {
  const update = useXbosStore((s) => s.updateCategoryItem);
  const remove = useXbosStore((s) => s.removeCategoryItem);
  const [payloadStr, setPayloadStr] = useState(() => JSON.stringify(row.payloadJson));

  useEffect(() => {
    setPayloadStr(JSON.stringify(row.payloadJson));
  }, [row.id, row.payloadJson]);

  return (
    <tr className="border-b border-black/[0.04] last:border-0 hover:bg-black/[0.02]">
      <td className="px-1 py-2 align-middle">
        <button
          type="button"
          onClick={() => remove(row.id)}
          className="rounded-lg p-2 text-xevn-muted hover:bg-red-500/10 hover:text-red-600"
          aria-label="Xóa"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </td>
      <td className="px-2 py-2 align-middle">
        <input
          className="input-apple font-mono text-xs"
          defaultValue={row.code}
          key={row.id + row.code}
          onBlur={(e) => {
            const v = e.target.value.trim();
            if (v && v !== row.code) update(row.id, { code: v });
          }}
        />
      </td>
      <td className="px-2 py-2 align-middle">
        <input
          className="input-apple"
          defaultValue={row.label}
          key={row.id + row.label}
          onBlur={(e) => {
            const v = e.target.value.trim();
            if (v !== row.label) update(row.id, { label: v });
          }}
        />
      </td>
      <td className="px-2 py-2 align-middle">
        <input
          className="input-apple font-mono text-xs"
          value={payloadStr}
          onChange={(e) => setPayloadStr(e.target.value)}
          onBlur={() => {
            try {
              const parsed = JSON.parse(payloadStr || '{}') as Record<string, unknown>;
              update(row.id, { payloadJson: parsed });
            } catch {
              setPayloadStr(JSON.stringify(row.payloadJson));
            }
          }}
        />
      </td>
    </tr>
  );
}
