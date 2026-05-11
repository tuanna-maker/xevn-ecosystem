import { useEffect, useMemo, useState } from 'react';
import { Lock, Save, Send, ShieldCheck, Sparkles } from 'lucide-react';
import { useXbosStore } from '@/store/useXbosStore';
import type { CascadePeriodType } from '@/types';

const DEFAULT_TENANT = 'tenant-xevn-holding';
const PERIOD_TYPES: CascadePeriodType[] = ['Q1', 'Q2', 'YEAR'];

export function KpiAssignmentsPage() {
  const periods = useXbosStore((s) => s.periods);
  const kpiDefinitions = useXbosStore((s) => s.kpiDefinitions);
  const orgUnits = useXbosStore((s) => s.orgUnits);
  const staffs = useXbosStore((s) => s.staffs);
  const kpiCascadeHeaders = useXbosStore((s) => s.kpiCascadeHeaders);
  const kpiCascadeLines = useXbosStore((s) => s.kpiCascadeLines);
  const positionQuotaPolicies = useXbosStore((s) => s.positionQuotaPolicies);
  const upsertKpiCascadeHeader = useXbosStore((s) => s.upsertKpiCascadeHeader);
  const replaceKpiCascadeLines = useXbosStore((s) => s.replaceKpiCascadeLines);
  const updateKpiCascadeStatus = useXbosStore((s) => s.updateKpiCascadeStatus);

  const activeKpis = useMemo(() => {
    return kpiDefinitions
      .filter((k) => k.tenantId === DEFAULT_TENANT && k.status === 'active')
      .sort((a, b) => a.kpiCode.localeCompare(b.kpiCode));
  }, [kpiDefinitions]);

  const periodRows = useMemo(() => {
    return periods
      .filter((p) => p.tenantId === DEFAULT_TENANT)
      .sort((a, b) => b.periodCode.localeCompare(a.periodCode));
  }, [periods]);

  const tenantOrgUnits = useMemo(
    () => orgUnits.filter((o) => o.tenantId === DEFAULT_TENANT),
    [orgUnits]
  );

  const [selectedPeriodCode, setSelectedPeriodCode] = useState<string>(periodRows[0]?.periodCode ?? '');
  const [periodType, setPeriodType] = useState<CascadePeriodType>('Q1');
  const [parentOrgUnitId, setParentOrgUnitId] = useState<string>(tenantOrgUnits[0]?.id ?? '');
  const [selectedKpiCode, setSelectedKpiCode] = useState<string>(activeKpis[0]?.kpiCode ?? '');
  const [parentKpiValueStr, setParentKpiValueStr] = useState<string>('100');
  const [effectiveDate, setEffectiveDate] = useState<string>('2026-01-01');
  const [mode, setMode] = useState<'weight' | 'target'>('weight');
  const [selectedHeaderId, setSelectedHeaderId] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  type DraftLine = {
    staffId: string;
    staffName: string;
    positionCode: 'KINH_DOANH' | 'LAI_XE';
    allocationWeightStr: string;
    targetValueStr: string;
    workloadPercentStr: string;
  };
  const [draftLines, setDraftLines] = useState<DraftLine[]>([]);

  const staffsInParentOrg = useMemo(
    () =>
      staffs
        .filter((s) => s.tenantId === DEFAULT_TENANT && s.orgUnitId === parentOrgUnitId)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [staffs, parentOrgUnitId]
  );

  const headers = useMemo(() => {
    return kpiCascadeHeaders
      .filter((h) => h.tenantId === DEFAULT_TENANT)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [kpiCascadeHeaders]);

  const selectedHeader = useMemo(
    () => headers.find((h) => h.id === selectedHeaderId) ?? null,
    [headers, selectedHeaderId]
  );

  const existingLines = useMemo(() => {
    if (!selectedHeaderId) return [];
    return kpiCascadeLines.filter((l) => l.tenantId === DEFAULT_TENANT && l.headerId === selectedHeaderId);
  }, [kpiCascadeLines, selectedHeaderId]);

  useEffect(() => {
    if (!selectedPeriodCode && periodRows.length > 0) setSelectedPeriodCode(periodRows[0].periodCode);
  }, [periodRows, selectedPeriodCode]);

  useEffect(() => {
    if (!parentOrgUnitId && tenantOrgUnits.length > 0) setParentOrgUnitId(tenantOrgUnits[0].id);
  }, [tenantOrgUnits, parentOrgUnitId]);

  useEffect(() => {
    if (!selectedKpiCode && activeKpis.length > 0) setSelectedKpiCode(activeKpis[0].kpiCode);
  }, [activeKpis, selectedKpiCode]);

  useEffect(() => {
    if (selectedHeader) {
      setSelectedPeriodCode(selectedHeader.periodCode);
      setPeriodType(selectedHeader.periodType);
      setParentOrgUnitId(selectedHeader.parentOrgUnitId);
      setSelectedKpiCode(selectedHeader.kpiCode);
      setParentKpiValueStr(String(selectedHeader.parentKpiValue));
      setEffectiveDate(selectedHeader.effectiveDate);
      setDraftLines(
        existingLines.map((l) => ({
          staffId: l.assigneeId,
          staffName: staffs.find((s) => s.id === l.assigneeId)?.name ?? l.assigneeId,
          positionCode: l.positionCode,
          allocationWeightStr: l.allocationWeight == null ? '' : String(l.allocationWeight),
          targetValueStr: String(l.targetValue),
          workloadPercentStr: l.workloadPercent == null ? '' : String(l.workloadPercent),
        }))
      );
    }
  }, [selectedHeader, existingLines, staffs]);

  useEffect(() => {
    if (selectedHeaderId) return;
    setDraftLines(
      staffsInParentOrg.map((s) => ({
        staffId: s.id,
        staffName: s.name,
        positionCode: s.levelCode,
        allocationWeightStr: '',
        targetValueStr: '',
        workloadPercentStr: '100',
      }))
    );
  }, [staffsInParentOrg, selectedHeaderId]);

  const parentKpiValue = Number(parentKpiValueStr || 0);

  const totalTarget = useMemo(() => {
    return draftLines.reduce((sum, r) => {
      if (mode === 'weight') {
        const w = Number(r.allocationWeightStr || 0);
        return sum + (Number.isFinite(w) ? parentKpiValue * w : 0);
      }
      const tv = Number(r.targetValueStr || 0);
      return sum + (Number.isFinite(tv) ? tv : 0);
    }, 0);
  }, [draftLines, mode, parentKpiValue]);

  function updateDraftLine(index: number, patch: Partial<DraftLine>) {
    setDraftLines((prev) => prev.map((x, i) => (i === index ? { ...x, ...patch } : x)));
  }

  function fillEqualWeight() {
    if (draftLines.length === 0) return;
    const w = Number((1 / draftLines.length).toFixed(4));
    setDraftLines((prev) => prev.map((x) => ({ ...x, allocationWeightStr: String(w) })));
  }

  function saveHeader() {
    setError('');
    setMessage('');
    try {
      const row = upsertKpiCascadeHeader({
        tenantId: DEFAULT_TENANT,
        periodCode: selectedPeriodCode,
        periodType,
        parentOrgUnitId,
        kpiCode: selectedKpiCode,
        parentKpiValue: parentKpiValue,
        effectiveDate,
      });
      setSelectedHeaderId(row.id);
      setMessage('Đã lưu thông tin bản phân bổ cấp cha.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lỗi không xác định');
    }
  }

  function saveLines() {
    setError('');
    setMessage('');
    try {
      if (!selectedHeaderId) throw new Error('Vui lòng lưu bản phân bổ cấp cha trước.');
      replaceKpiCascadeLines(
        DEFAULT_TENANT,
        selectedHeaderId,
        mode,
        draftLines.map((r) => ({
          staffId: r.staffId,
          positionCode: r.positionCode,
          allocationWeight: r.allocationWeightStr ? Number(r.allocationWeightStr) : null,
          targetValue: r.targetValueStr ? Number(r.targetValueStr) : null,
          workloadPercent: r.workloadPercentStr ? Number(r.workloadPercentStr) : null,
        }))
      );
      setMessage('Đã lưu phân bổ KPI cá nhân.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lỗi không xác định');
    }
  }

  function moveStatus(next: 'pending_approval' | 'approved' | 'frozen') {
    setError('');
    setMessage('');
    try {
      if (!selectedHeaderId) throw new Error('Vui lòng chọn bản phân bổ.');
      updateKpiCascadeStatus(DEFAULT_TENANT, selectedHeaderId, next);
      setMessage(`Đã chuyển trạng thái sang ${next}.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lỗi không xác định');
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-xevn-text">Phân bổ KPI đa tầng (Cascading Allocation)</h2>
        <p className="mt-1 text-sm text-xevn-muted">
          Tầng đáy Individual KPI: Manager giao KPI trực tiếp cho nhân sự thuộc đơn vị hiện tại, theo tỷ trọng đóng góp hoặc target riêng.
        </p>
      </div>

      <div className="space-y-4 rounded-2xl border border-black/[0.06] bg-white/85 p-5 shadow-glass backdrop-blur-sm">
        <div className="grid gap-3 md:grid-cols-3">
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-xevn-muted">Kỳ tính</span>
            <select className="input-apple" value={selectedPeriodCode} onChange={(e) => setSelectedPeriodCode(e.target.value)}>
              {periodRows.map((p) => (
                <option key={p.id} value={p.periodCode}>
                  {p.name} ({p.periodCode})
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-medium text-xevn-muted">Version kỳ</span>
            <select className="input-apple" value={periodType} onChange={(e) => setPeriodType(e.target.value as CascadePeriodType)}>
              {PERIOD_TYPES.map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-medium text-xevn-muted">Nút tổ chức hiện tại</span>
            <select className="input-apple" value={parentOrgUnitId} onChange={(e) => setParentOrgUnitId(e.target.value)}>
              {tenantOrgUnits.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.code} — {o.name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-xevn-muted">KPI cha</span>
            <select className="input-apple" value={selectedKpiCode} onChange={(e) => setSelectedKpiCode(e.target.value)}>
              {activeKpis.map((k) => (
                <option key={k.id} value={k.kpiCode}>
                  {k.kpiCode} — {k.kpiName}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-xevn-muted">Parent_KPI_Value</span>
            <input className="input-apple" type="number" value={parentKpiValueStr} onChange={(e) => setParentKpiValueStr(e.target.value)} />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-xevn-muted">Effective_Date</span>
            <input className="input-apple" type="date" value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-xevn-muted">Chế độ phân bổ</span>
            <select className="input-apple" value={mode} onChange={(e) => setMode(e.target.value as 'weight' | 'target')}>
              <option value="weight">Theo Allocation_Weight</option>
              <option value="target">Theo Target_Value</option>
            </select>
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={saveHeader} className="inline-flex items-center gap-2 rounded-xl bg-xevn-primary px-4 py-2 text-sm font-medium text-white shadow-md">
            <Save className="h-4 w-4" />
            Lưu bản phân bổ cha
          </button>
          <button type="button" onClick={fillEqualWeight} className="inline-flex items-center gap-2 rounded-xl border border-black/[0.08] bg-white px-4 py-2 text-sm font-medium shadow-sm" disabled={mode !== 'weight'}>
            <Sparkles className="h-4 w-4" />
            Chia đều trọng số
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-black/[0.06] bg-white/90 shadow-glass backdrop-blur-sm">
        <table className="min-w-[1100px] w-full text-left text-sm">
          <thead>
            <tr className="border-b border-black/[0.06] bg-black/[0.02] text-xs uppercase text-xevn-muted">
              <th className="px-4 py-3 w-64">Tên nhân viên</th>
              <th className="px-4 py-3 w-44">Chức vụ</th>
              <th className="px-4 py-3 w-36">Allocation_Weight</th>
              <th className="px-4 py-3 w-36">Workload_%</th>
              <th className="px-4 py-3 w-36">Target_Value</th>
            </tr>
          </thead>
          <tbody>
            {draftLines.map((row, idx) => {
              const calcTarget = mode === 'weight' ? Number((parentKpiValue * Number(row.allocationWeightStr || 0)).toFixed(4)) : Number(row.targetValueStr || 0);
              return (
                <tr key={`${row.staffId}-${idx}`} className="border-b border-black/[0.04] last:border-0 hover:bg-black/[0.02]">
                  <td className="px-4 py-3">
                    <div className="font-medium">{row.staffName}</div>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono">{row.positionCode}</td>
                  <td className="px-4 py-3">
                    <input
                      className="input-apple"
                      type="number"
                      step="0.0001"
                      value={row.allocationWeightStr}
                      onChange={(e) => updateDraftLine(idx, { allocationWeightStr: e.target.value })}
                      disabled={mode !== 'weight' || selectedHeader?.status === 'frozen'}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      className="input-apple"
                      type="number"
                      step="0.01"
                      value={row.workloadPercentStr}
                      onChange={(e) => updateDraftLine(idx, { workloadPercentStr: e.target.value })}
                      disabled={selectedHeader?.status === 'frozen'}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      className="input-apple"
                      type="number"
                      step="0.0001"
                      value={mode === 'weight' ? String(Number.isFinite(calcTarget) ? calcTarget : 0) : row.targetValueStr}
                      onChange={(e) => updateDraftLine(idx, { targetValueStr: e.target.value })}
                      disabled={mode !== 'target' || selectedHeader?.status === 'frozen'}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={saveLines} className="inline-flex items-center gap-2 rounded-xl bg-xevn-primary px-4 py-2 text-sm font-medium text-white shadow-md" disabled={selectedHeader?.status === 'frozen'}>
          <Save className="h-4 w-4" />
          Lưu phân bổ con
        </button>
        <button type="button" onClick={() => moveStatus('pending_approval')} className="inline-flex items-center gap-2 rounded-xl border border-black/[0.08] bg-white px-4 py-2 text-sm font-medium shadow-sm">
          <Send className="h-4 w-4" />
          Gửi duyệt
        </button>
        <button type="button" onClick={() => moveStatus('approved')} className="inline-flex items-center gap-2 rounded-xl border border-black/[0.08] bg-white px-4 py-2 text-sm font-medium shadow-sm">
          <ShieldCheck className="h-4 w-4" />
          Approved
        </button>
        <button type="button" onClick={() => moveStatus('frozen')} className="inline-flex items-center gap-2 rounded-xl border border-black/[0.08] bg-white px-4 py-2 text-sm font-medium shadow-sm">
          <Lock className="h-4 w-4" />
          Freeze
        </button>
      </div>

      {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700">{error}</div>}
      {message && <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700">{message}</div>}

      <div className="rounded-2xl border border-black/[0.06] bg-black/[0.02] p-4 text-sm text-xevn-muted space-y-1">
        <div>Parent_KPI_Value: <span className="font-mono">{parentKpiValue || 0}</span></div>
        <div>Tổng Target_Value cá nhân: <span className="font-mono">{Number(totalTarget.toFixed(4))}</span></div>
        <div>Ghi chú: tầng cá nhân không bắt buộc tổng target bằng Parent_KPI_Value.</div>
        <div>Chính sách quota theo chức danh: {positionQuotaPolicies.filter((q) => q.tenantId === DEFAULT_TENANT && q.kpiCode === selectedKpiCode && q.periodType === periodType).map((q) => `${q.positionCode}<=${q.quotaCeiling}`).join(' | ') || 'chưa cấu hình'}</div>
        <div>Trạng thái bản phân bổ: <span className="font-mono">{selectedHeader?.status ?? 'draft'}</span></div>
      </div>

      <div className="rounded-2xl border border-black/[0.06] bg-white/90 p-4">
        <div className="text-sm font-semibold text-xevn-text mb-2">Danh sách bản phân bổ đã lưu</div>
        <div className="grid gap-2">
          {headers.map((h) => {
            const org = tenantOrgUnits.find((o) => o.id === h.parentOrgUnitId);
            return (
              <button
                key={h.id}
                type="button"
                onClick={() => setSelectedHeaderId(h.id)}
                className={`text-left rounded-xl border px-3 py-2 text-sm ${selectedHeaderId === h.id ? 'border-xevn-primary bg-xevn-primary/5' : 'border-black/[0.08] bg-white'}`}
              >
                <div className="font-medium">{h.periodType} · {h.kpiCode} · {org?.name ?? h.parentOrgUnitId}</div>
                <div className="text-xs text-xevn-muted">Parent: {h.parentKpiValue} · Status: {h.status} · Effective: {h.effectiveDate}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

