import { useEffect, useMemo, useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { useXbosStore } from '@/store/useXbosStore';
import type { PenaltyFormItem, PolicyDefinition, PolicyTariffRange } from '@/types';

const DEFAULT_TENANT = 'tenant-xevn-holding';

type DraftRange = {
  id: string;
  fromStr: string; // '' => null
  toStr: string; // '' => null
  rewardAmountStr: string;
  penaltyAmountStr: string;
  penaltyDiemStr: string; // TRU_DIEM
  penaltyCanhBaoStr: string; // CANH_BAO
  note: string;
};

function toNullableNumber(s: string): number | null {
  const t = s.trim();
  if (!t) return null;
  const n = Number(t);
  if (!Number.isFinite(n)) throw new Error('Giá trị số không hợp lệ');
  return n;
}

function findTariffMatchLocal(ranges: PolicyTariffRange[], value: number): PolicyTariffRange | null {
  const sorted = [...ranges].sort((a, b) => {
    const av = a.fromValue ?? Number.NEGATIVE_INFINITY;
    const bv = b.fromValue ?? Number.NEGATIVE_INFINITY;
    return av - bv;
  });
  for (const r of sorted) {
    const fromOk = r.fromValue == null ? true : value >= r.fromValue;
    const toOk = r.toValue == null ? true : value < r.toValue;
    if (fromOk && toOk) return r;
  }
  return null;
}

export function TariffRangesPage() {
  const policyDefinitions = useXbosStore((s) => s.policies);
  const policyTariffRanges = useXbosStore((s) => s.policyTariffRanges);
  const policyGroups = useXbosStore((s) => s.policyGroups);
  const replacePolicyTariffRanges = useXbosStore((s) => s.replacePolicyTariffRanges);

  const activePolicies = useMemo(() => {
    const list = policyDefinitions
      .filter((p) => p.tenantId === DEFAULT_TENANT && p.status === 'active')
      .sort((a, b) => b.version - a.version);
    const byCode = new Map<string, PolicyDefinition>();
    for (const p of list) {
      if (!byCode.has(p.policyCode)) byCode.set(p.policyCode, p);
    }
    return Array.from(byCode.values()).sort((a, b) => a.policyCode.localeCompare(b.policyCode));
  }, [policyDefinitions]);

  const [selectedPolicyCode, setSelectedPolicyCode] = useState<string>('');
  const selectedPolicy = useMemo(() => {
    return activePolicies.find((p) => p.policyCode === selectedPolicyCode) ?? null;
  }, [activePolicies, selectedPolicyCode]);

  useEffect(() => {
    if (!selectedPolicyCode && activePolicies.length > 0) setSelectedPolicyCode(activePolicies[0].policyCode);
  }, [selectedPolicyCode, activePolicies]);

  const selectedRanges = useMemo(() => {
    if (!selectedPolicy) return [];
    return policyTariffRanges
      .filter(
        (t) =>
          t.tenantId === DEFAULT_TENANT &&
          t.policyCode === selectedPolicy.policyCode &&
          t.policyVersion === selectedPolicy.version
      )
      .sort((a, b) => (a.fromValue ?? -Infinity) - (b.fromValue ?? -Infinity));
  }, [policyTariffRanges, selectedPolicy]);

  const selectedGroup = useMemo(() => {
    if (!selectedPolicy) return null;
    return policyGroups.find((g) => g.tenantId === DEFAULT_TENANT && g.policyGroupCode === selectedPolicy.policyGroupCode) ?? null;
  }, [policyGroups, selectedPolicy]);

  const [sampleValue, setSampleValue] = useState<number>(70);
  const [currencyCode, setCurrencyCode] = useState<string>('VND');
  const [draftRanges, setDraftRanges] = useState<DraftRange[]>([]);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  useEffect(() => {
    if (!selectedPolicy) return;
    const first = selectedRanges[0]?.currencyCode ?? selectedGroup?.defaultCurrencyCode ?? 'VND';
    setCurrencyCode(first);
    setDraftRanges(
      selectedRanges.map((r) => ({
        id: r.id,
        fromStr: r.fromValue == null ? '' : String(r.fromValue),
        toStr: r.toValue == null ? '' : String(r.toValue),
        rewardAmountStr: String(r.rewardAmount),
        penaltyAmountStr: String(r.penaltyAmount),
        penaltyDiemStr: String(r.penaltyForms.find((x) => x.formCode === 'TRU_DIEM')?.value ?? 0),
        penaltyCanhBaoStr: String(r.penaltyForms.find((x) => x.formCode === 'CANH_BAO')?.value ?? 0),
        note: r.note ?? '',
      }))
    );
    setSaveError('');
    setSaveSuccess('');
  }, [selectedPolicyCode]); // eslint-disable-line react-hooks/exhaustive-deps

  const draftRangesConverted = useMemo(() => {
    try {
      return draftRanges.map((d) => ({
        id: d.id,
        tenantId: DEFAULT_TENANT,
        policyCode: selectedPolicy?.policyCode ?? '',
        policyVersion: selectedPolicy?.version ?? 0,
        currencyCode,
        fromValue: toNullableNumber(d.fromStr),
        toValue: toNullableNumber(d.toStr),
        rewardAmount: Number(d.rewardAmountStr),
        penaltyAmount: Number(d.penaltyAmountStr),
        penaltyForms: [
          { formCode: 'TRU_TIEN', value: Number(d.penaltyAmountStr), unit: currencyCode },
          { formCode: 'TRU_DIEM', value: Number(d.penaltyDiemStr), unit: 'điểm' },
          { formCode: 'CANH_BAO', value: Number(d.penaltyCanhBaoStr), unit: 'lần' },
        ],
        note: d.note || undefined,
        updatedAt: new Date().toISOString(),
      })) as PolicyTariffRange[];
    } catch {
      return [];
    }
  }, [draftRanges, currencyCode, selectedPolicy]);

  const match = useMemo(() => {
    return findTariffMatchLocal(draftRangesConverted, sampleValue);
  }, [draftRangesConverted, sampleValue]);

  function addRow() {
    setDraftRanges((prev) =>
      prev.concat({
        id: `draft-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        fromStr: '',
        toStr: '',
        rewardAmountStr: '0',
        penaltyAmountStr: '0',
        penaltyDiemStr: '0',
        penaltyCanhBaoStr: '0',
        note: '',
      })
    );
  }

  function removeRow(id: string) {
    setDraftRanges((prev) => prev.filter((r) => r.id !== id));
  }

  function resetDraft() {
    if (!selectedPolicy) return;
    setCurrencyCode(selectedRanges[0]?.currencyCode ?? selectedGroup?.defaultCurrencyCode ?? 'VND');
    setDraftRanges(
      selectedRanges.map((r) => ({
        id: r.id,
        fromStr: r.fromValue == null ? '' : String(r.fromValue),
        toStr: r.toValue == null ? '' : String(r.toValue),
        rewardAmountStr: String(r.rewardAmount),
        penaltyAmountStr: String(r.penaltyAmount),
        penaltyDiemStr: String(r.penaltyForms.find((x) => x.formCode === 'TRU_DIEM')?.value ?? 0),
        penaltyCanhBaoStr: String(r.penaltyForms.find((x) => x.formCode === 'CANH_BAO')?.value ?? 0),
        note: r.note ?? '',
      }))
    );
    setSaveError('');
    setSaveSuccess('');
  }

  function save() {
    setSaveError('');
    setSaveSuccess('');
    try {
      if (!selectedPolicy) throw new Error('Chưa chọn chính sách');

      const ranges = draftRanges.map((d) => ({
        fromValue: toNullableNumber(d.fromStr),
        toValue: toNullableNumber(d.toStr),
        currencyCode,
        rewardAmount: Number(d.rewardAmountStr),
        penaltyAmount: Number(d.penaltyAmountStr),
        penaltyForms: [
          { formCode: 'TRU_TIEN' as const, value: Number(d.penaltyAmountStr), unit: currencyCode },
          { formCode: 'TRU_DIEM' as const, value: Number(d.penaltyDiemStr), unit: 'điểm' },
          { formCode: 'CANH_BAO' as const, value: Number(d.penaltyCanhBaoStr), unit: 'lần' },
        ] as PenaltyFormItem[],
        note: d.note || undefined,
      }));

      if (ranges.some((r) => !Number.isFinite(r.rewardAmount) || !Number.isFinite(r.penaltyAmount))) {
        throw new Error('Thưởng/phạt phải là số hợp lệ');
      }

      replacePolicyTariffRanges(DEFAULT_TENANT, selectedPolicy.policyCode, selectedPolicy.version, ranges);
      setSaveSuccess('Đã lưu khoảng mức thành công.');
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Lỗi không xác định');
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-xevn-text">Khoảng mức thưởng/phạt</h2>
        <p className="mt-1 text-sm text-xevn-muted">
          Mỗi khoảng dùng định dạng <span className="font-mono text-xs">[từ, đến)</span>. Null nghĩa là không giới hạn.
        </p>
      </div>

      <div className="space-y-4 rounded-2xl border border-black/[0.06] bg-white/85 p-5 shadow-glass backdrop-blur-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-wrap items-end gap-3">
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-xevn-muted">Chọn chính sách</span>
              <select
                className="input-apple min-w-[320px]"
                value={selectedPolicyCode}
                onChange={(e) => setSelectedPolicyCode(e.target.value)}
                disabled={activePolicies.length === 0}
              >
                {activePolicies.map((p) => (
                  <option key={p.id} value={p.policyCode}>
                    {p.policyName} ({p.policyCode}) - KPI {p.kpiCode} - v{p.version}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={resetDraft}
              className="rounded-xl px-4 py-2 text-sm font-medium text-xevn-muted hover:bg-black/[0.04]"
              disabled={!selectedPolicy}
            >
              Hoàn tác
            </button>
            <button
              type="button"
              onClick={addRow}
              className="inline-flex items-center gap-2 rounded-xl border border-black/[0.08] bg-white px-3 py-2 text-sm font-medium shadow-sm hover:bg-black/[0.02] disabled:opacity-50"
              disabled={!selectedPolicy}
            >
              <Plus className="h-4 w-4" />
              Thêm dòng
            </button>
            <button
              type="button"
              onClick={save}
              className="inline-flex items-center gap-2 rounded-xl bg-xevn-primary px-4 py-2 text-sm font-medium text-white shadow-md disabled:opacity-50"
              disabled={!selectedPolicy}
            >
              <Save className="h-4 w-4" />
              Lưu khoảng mức
            </button>
          </div>
        </div>

        {saveError && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700">{saveError}</div>
        )}
        {saveSuccess && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700">{saveSuccess}</div>
        )}

        {!selectedPolicy && (
          <div className="rounded-2xl border border-black/[0.06] bg-black/[0.02] p-5 text-xevn-muted">
            Chưa có chính sách active để tạo khoảng mức.
          </div>
        )}

        {selectedPolicy && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-black/[0.06] bg-white/70 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-xevn-text">Thông tin</div>
                  <div className="text-xs text-xevn-muted">version v{selectedPolicy.version}</div>
                </div>
                <div className="mt-2 text-sm text-xevn-muted">
                  Chính sách: <span className="font-mono text-xs">{selectedPolicy.policyCode}</span>
                  <br />
                  KPI: <span className="font-mono text-xs">{selectedPolicy.kpiCode}</span>
                </div>
              </div>

              <div className="rounded-2xl border border-black/[0.06] bg-white/70 p-4">
                <div className="text-sm font-semibold text-xevn-text">Ví dụ ánh xạ KPI</div>
                <div className="mt-2 flex items-end gap-3">
                  <label className="space-y-1.5">
                    <span className="text-xs font-medium text-xevn-muted">Giá trị KPI mẫu</span>
                    <input
                      className="input-apple w-40"
                      type="number"
                      value={sampleValue}
                      onChange={(e) => setSampleValue(Number(e.target.value))}
                    />
                  </label>
                </div>

                <div className="mt-3 text-sm">
                  {match ? (
                    <div className="rounded-xl border border-black/[0.06] bg-white p-3">
                      <div className="font-semibold text-xevn-text">Kết quả</div>
                      <div className="mt-1 text-xs text-xevn-muted">
                        Khoảng: [{match.fromValue ?? '-∞'}, {match.toValue ?? '+∞'})
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <div className="text-xs text-xevn-muted">Thưởng</div>
                        <div className="font-mono text-sm text-emerald-700">
                          {match.rewardAmount.toLocaleString('vi-VN')} {match.currencyCode}
                        </div>
                      </div>
                      <div className="mt-1 flex items-center justify-between gap-3">
                        <div className="text-xs text-xevn-muted">Phạt</div>
                        <div className="font-mono text-sm text-red-700">
                          {match.penaltyAmount.toLocaleString('vi-VN')} {match.currencyCode}
                        </div>
                      </div>
                      <div className="mt-1 flex items-center justify-between gap-3">
                        <div className="text-xs text-xevn-muted">Trừ điểm</div>
                        <div className="font-mono text-sm text-red-700">
                          {(match.penaltyForms.find((x) => x.formCode === 'TRU_DIEM')?.value ?? 0).toLocaleString('vi-VN')} điểm
                        </div>
                      </div>
                      <div className="mt-1 flex items-center justify-between gap-3">
                        <div className="text-xs text-xevn-muted">Cảnh báo</div>
                        <div className="font-mono text-sm text-red-700">
                          {(match.penaltyForms.find((x) => x.formCode === 'CANH_BAO')?.value ?? 0).toLocaleString('vi-VN')} lần
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-xevn-muted mt-2">Không tìm thấy khoảng phù hợp (hoặc dữ liệu draft chưa hợp lệ).</div>
                  )}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-black/[0.06] bg-white/90 shadow-glass backdrop-blur-sm">
              <table className="min-w-[980px] w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-black/[0.06] bg-black/[0.02] text-xs uppercase text-xevn-muted">
                    <th className="px-4 py-3 w-24" />
                    <th className="px-4 py-3 w-28">Từ</th>
                    <th className="px-4 py-3 w-28">Đến</th>
                    <th className="px-4 py-3 w-44">Đơn vị tiền</th>
                    <th className="px-4 py-3 w-36">Thưởng</th>
                    <th className="px-4 py-3 w-36">Phạt</th>
                    <th className="px-4 py-3 w-40">Trừ điểm</th>
                    <th className="px-4 py-3 w-40">Cảnh báo</th>
                    <th className="px-4 py-3">Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  {draftRanges.map((r) => (
                    <tr key={r.id} className="border-b border-black/[0.04] last:border-0 hover:bg-black/[0.02]">
                      <td className="px-4 py-3 align-middle">
                        <button
                          type="button"
                          className="rounded-lg p-2 text-xevn-muted hover:bg-red-500/10 hover:text-red-600"
                          onClick={() => removeRow(r.id)}
                          aria-label="Xóa dòng"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          className="input-apple font-mono text-xs"
                          type="number"
                          value={r.fromStr}
                          onChange={(e) => {
                            const v = e.target.value;
                            setDraftRanges((prev) => prev.map((x) => (x.id === r.id ? { ...x, fromStr: v } : x)));
                          }}
                          placeholder="(null)"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          className="input-apple font-mono text-xs"
                          type="number"
                          value={r.toStr}
                          onChange={(e) => {
                            const v = e.target.value;
                            setDraftRanges((prev) => prev.map((x) => (x.id === r.id ? { ...x, toStr: v } : x)));
                          }}
                          placeholder="(null)"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          className="input-apple font-mono text-xs"
                          value={currencyCode}
                          disabled
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          className="input-apple font-mono text-xs"
                          type="number"
                          value={r.rewardAmountStr}
                          onChange={(e) => {
                            const v = e.target.value;
                            setDraftRanges((prev) =>
                              prev.map((x) => (x.id === r.id ? { ...x, rewardAmountStr: v } : x))
                            );
                          }}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          className="input-apple font-mono text-xs"
                          type="number"
                          value={r.penaltyAmountStr}
                          onChange={(e) => {
                            const v = e.target.value;
                            setDraftRanges((prev) =>
                              prev.map((x) => (x.id === r.id ? { ...x, penaltyAmountStr: v } : x))
                            );
                          }}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          className="input-apple font-mono text-xs"
                          type="number"
                          value={r.penaltyDiemStr}
                          onChange={(e) => {
                            const v = e.target.value;
                            setDraftRanges((prev) =>
                              prev.map((x) => (x.id === r.id ? { ...x, penaltyDiemStr: v } : x))
                            );
                          }}
                          placeholder="0"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          className="input-apple font-mono text-xs"
                          type="number"
                          value={r.penaltyCanhBaoStr}
                          onChange={(e) => {
                            const v = e.target.value;
                            setDraftRanges((prev) =>
                              prev.map((x) => (x.id === r.id ? { ...x, penaltyCanhBaoStr: v } : x))
                            );
                          }}
                          placeholder="0"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          className="input-apple font-mono text-xs"
                          value={r.note}
                          onChange={(e) => {
                            const v = e.target.value;
                            setDraftRanges((prev) => prev.map((x) => (x.id === r.id ? { ...x, note: v } : x)));
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                  {draftRanges.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-4 py-10 text-center text-xevn-muted">
                        Chưa có khoảng mức. Hãy bấm “Thêm dòng”.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

