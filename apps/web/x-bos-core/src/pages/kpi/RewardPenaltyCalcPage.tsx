import { useEffect, useMemo, useState } from 'react';
import { Play, RotateCcw, Save, Wrench } from 'lucide-react';
import { useXbosStore } from '@/store/useXbosStore';
import type { PolicyDefinition } from '@/types';

const DEFAULT_TENANT = 'tenant-xevn-holding';

function fmtMoney(n: number) {
  return `${n.toLocaleString('vi-VN')} VND`;
}

function staffOrgLabel(orgUnits: { id: string; name: string; code: string }[], orgUnitId: string) {
  return orgUnits.find((o) => o.id === orgUnitId)?.name ?? orgUnitId;
}

export function RewardPenaltyCalcPage() {
  const orgUnits = useXbosStore((s) => s.orgUnits);
  const periods = useXbosStore((s) => s.periods);
  const staffs = useXbosStore((s) => s.staffs);
  const kpiDefinitions = useXbosStore((s) => s.kpiDefinitions);
  const policies = useXbosStore((s) => s.policies);
  const calculationRuns = useXbosStore((s) => s.calculationRuns);
  const rewardPenaltyResults = useXbosStore((s) => s.rewardPenaltyResults);

  const kpiActualValues = useXbosStore((s) => s.kpiActualValues);
  const seedMockKpiActualValuesForPeriod = useXbosStore((s) => s.seedMockKpiActualValuesForPeriod);
  const upsertKpiActualValue = useXbosStore((s) => s.upsertKpiActualValue);
  const runRewardPenaltyCalc = useXbosStore((s) => s.runRewardPenaltyCalc);
  const recalcRewardPenalty = useXbosStore((s) => s.recalcRewardPenalty);

  const activeKpis = useMemo(() => {
    return kpiDefinitions
      .filter((k) => k.tenantId === DEFAULT_TENANT && k.status === 'active')
      .sort((a, b) => a.kpiCode.localeCompare(b.kpiCode));
  }, [kpiDefinitions]);

  const periodRows = useMemo(() => periods.filter((p) => p.tenantId === DEFAULT_TENANT).sort((a, b) => b.periodCode.localeCompare(a.periodCode)), [periods]);

  const [selectedPeriodCode, setSelectedPeriodCode] = useState<string>(periodRows[0]?.periodCode ?? '');

  useEffect(() => {
    if (!selectedPeriodCode && periodRows.length > 0) {
      setSelectedPeriodCode(periodRows[0].periodCode);
    }
  }, [periodRows, selectedPeriodCode]);

  const runsForPeriod = useMemo(() => calculationRuns.filter((r) => r.tenantId === DEFAULT_TENANT && r.periodCode === selectedPeriodCode).sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [calculationRuns, selectedPeriodCode]);

  const [selectedRunId, setSelectedRunId] = useState<string>('');
  useEffect(() => {
    if (runsForPeriod.length === 0) return;
    if (!selectedRunId || !runsForPeriod.some((r) => r.id === selectedRunId)) {
      setSelectedRunId(runsForPeriod[0].id);
    }
  }, [runsForPeriod, selectedRunId]);

  const selectedRun = runsForPeriod.find((r) => r.id === selectedRunId) ?? null;

  const resultsForSelectedRun = useMemo(() => {
    if (!selectedRunId) return [];
    return rewardPenaltyResults.filter((r) => r.tenantId === DEFAULT_TENANT && r.runId === selectedRunId);
  }, [rewardPenaltyResults, selectedRunId]);

  const staffList = useMemo(() => staffs.filter((s) => s.tenantId === DEFAULT_TENANT), [staffs]);

  const [selectedKpiCode, setSelectedKpiCode] = useState<string>(activeKpis[0]?.kpiCode ?? '');
  useEffect(() => {
    if (!selectedKpiCode && activeKpis.length > 0) {
      setSelectedKpiCode(activeKpis[0].kpiCode);
    }
  }, [activeKpis, selectedKpiCode]);

  const kpiActualByStaff = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of kpiActualValues) {
      if (a.tenantId !== DEFAULT_TENANT) continue;
      if (a.periodCode !== selectedPeriodCode) continue;
      if (a.kpiCode !== selectedKpiCode) continue;
      map.set(a.staffId, a.value);
    }
    return map;
  }, [kpiActualValues, selectedPeriodCode, selectedKpiCode]);

  const [draftValues, setDraftValues] = useState<Record<string, string>>({});
  useEffect(() => {
    if (!selectedKpiCode) return;
    if (staffList.length === 0) return;
    if (Object.keys(draftValues).length > 0) return;

    const next: Record<string, string> = {};
    for (const st of staffList) {
      const v = kpiActualByStaff.get(st.id);
      next[st.id] = v == null ? '' : String(v);
    }
    setDraftValues(next);
  }, [draftValues, kpiActualByStaff, selectedKpiCode, staffList]);

  function refreshDraftFromStore() {
    const next: Record<string, string> = {};
    for (const st of staffList) {
      const v = kpiActualByStaff.get(st.id);
      next[st.id] = v == null ? '' : String(v);
    }
    setDraftValues(next);
  }

  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

  function saveKpiActuals() {
    setEditError('');
    setEditSuccess('');
    try {
      if (!selectedKpiCode) throw new Error('Chưa chọn KPI');
      for (const st of staffList) {
        const raw = draftValues[st.id];
        const trimmed = (raw ?? '').trim();
        if (!trimmed) continue;
        const value = Number(trimmed);
        if (!Number.isFinite(value)) throw new Error('Giá trị KPI phải là số hợp lệ');
        upsertKpiActualValue({
          tenantId: DEFAULT_TENANT,
          periodCode: selectedPeriodCode,
          staffId: st.id,
          kpiCode: selectedKpiCode,
          value,
        });
      }
      setEditSuccess('Đã lưu KPI thực tế.');
    } catch (e) {
      setEditError(e instanceof Error ? e.message : 'Lỗi không xác định');
    }
  }

  type CandidateUI = {
    approved: boolean;
    excluded: boolean;
    exclusionReason: string;
    evidenceRef: string;
  };

  const [candidateUIById, setCandidateUIById] = useState<Record<string, CandidateUI>>({});
  const [executeError, setExecuteError] = useState('');
  const [executeSuccess, setExecuteSuccess] = useState('');
  const [executedAt, setExecutedAt] = useState<string | null>(null);

  const policyByKey = useMemo(() => {
    const m = new Map<string, PolicyDefinition>();
    for (const p of policies) {
      if (p.tenantId !== DEFAULT_TENANT) continue;
      m.set(`${p.policyCode}::${p.version}`, p);
    }
    return m;
  }, [policies]);

  const computedCandidates = useMemo(() => {
    const runCreatedAt = selectedRun?.createdAt ?? '';
    return resultsForSelectedRun.map((r) => {
      const policy = policyByKey.get(`${r.policyCode}::${r.policyVersion}`);
      const cond = policy?.conditionJson ?? {};

      const triggerSource = (cond.triggerSource as string | undefined) ?? 'KPI';
      const evidenceRequired = Boolean((cond.evidenceRequired as unknown) === true);

      const progressiveConfig = (cond.progressiveConfig as any) ?? {};
      const progressiveEnabled = Boolean(progressiveConfig.enabled);
      const step = Number(progressiveConfig.step ?? 0);
      const cap = progressiveConfig.cap == null ? null : Number(progressiveConfig.cap);

      let progressiveStep = 1;
      let penaltyMultiplier = 1;
      if (progressiveEnabled && Number.isFinite(step)) {
        const prevCount = rewardPenaltyResults.filter(
          (x) =>
            x.tenantId === DEFAULT_TENANT &&
            x.staffId === r.staffId &&
            x.policyCode === r.policyCode &&
            x.policyVersion === r.policyVersion &&
            x.createdAt < runCreatedAt &&
            x.penaltyAmount > 0
        ).length;

        const raw = prevCount + 1;
        const effective = cap == null || !Number.isFinite(cap) ? raw : Math.min(raw, cap);
        progressiveStep = effective;
        penaltyMultiplier = 1 + step * (effective - 1);
      }

      const penaltyAmountAdjusted = r.penaltyAmount * penaltyMultiplier;
      const penaltyFormsAdjusted = r.penaltyForms.map((f) => ({
        ...f,
        value: f.value * penaltyMultiplier,
      }));

      return {
        candidate: r,
        policy,
        triggerSource,
        evidenceRequired,
        progressiveEnabled,
        progressiveStep,
        penaltyAmountAdjusted,
        penaltyFormsAdjusted,
      };
    });
  }, [resultsForSelectedRun, policyByKey, selectedRun, rewardPenaltyResults]);

  useEffect(() => {
    if (!selectedRunId) {
      setCandidateUIById({});
      setExecuteError('');
      setExecuteSuccess('');
      setExecutedAt(null);
      return;
    }

    const next: Record<string, CandidateUI> = {};
    for (const c of computedCandidates) {
      next[c.candidate.id] = {
        approved: false,
        excluded: false,
        exclusionReason: '',
        evidenceRef: '',
      };
    }
    setCandidateUIById(next);
    setExecuteError('');
    setExecuteSuccess('');
    setExecutedAt(null);
  }, [selectedRunId, computedCandidates]);

  const approvedCandidates = useMemo(() => {
    return computedCandidates.filter((c) => candidateUIById[c.candidate.id]?.approved && !candidateUIById[c.candidate.id]?.excluded);
  }, [computedCandidates, candidateUIById]);

  const totalsApproved = useMemo(() => {
    let totalReward = 0;
    let totalPenalty = 0;
    for (const c of approvedCandidates) {
      totalReward += c.candidate.rewardAmount;
      totalPenalty += c.penaltyAmountAdjusted;
    }
    return { totalReward, totalPenalty, totalNet: totalReward - totalPenalty };
  }, [approvedCandidates]);

  function setCandidateApproved(candidateId: string, approved: boolean) {
    setCandidateUIById((prev) => {
      const cur = prev[candidateId] ?? { approved: false, excluded: false, exclusionReason: '', evidenceRef: '' };
      return {
        ...prev,
        [candidateId]: {
          ...cur,
          approved,
          excluded: approved ? false : cur.excluded,
        },
      };
    });
  }

  function setCandidateExcluded(candidateId: string, excluded: boolean) {
    setCandidateUIById((prev) => {
      const cur = prev[candidateId] ?? { approved: false, excluded: false, exclusionReason: '', evidenceRef: '' };
      return {
        ...prev,
        [candidateId]: {
          ...cur,
          excluded,
          approved: excluded ? false : cur.approved,
        },
      };
    });
  }

  function setCandidateEvidenceRef(candidateId: string, evidenceRef: string) {
    setCandidateUIById((prev) => {
      const cur = prev[candidateId] ?? { approved: false, excluded: false, exclusionReason: '', evidenceRef: '' };
      return { ...prev, [candidateId]: { ...cur, evidenceRef } };
    });
  }

  function setCandidateExclusionReason(candidateId: string, exclusionReason: string) {
    setCandidateUIById((prev) => {
      const cur = prev[candidateId] ?? { approved: false, excluded: false, exclusionReason: '', evidenceRef: '' };
      return { ...prev, [candidateId]: { ...cur, exclusionReason } };
    });
  }

  function executeApproved() {
    setExecuteError('');
    setExecuteSuccess('');
    if (!selectedRun) {
      setExecuteError('Chưa chọn lần scan đề xuất.');
      return;
    }
    const approved = approvedCandidates;
    if (approved.length === 0) {
      setExecuteError('Chưa có đề xuất được phê duyệt.');
      return;
    }

    for (const c of approved) {
      if (!c.evidenceRequired) continue;
      const ui = candidateUIById[c.candidate.id];
      if (!ui?.evidenceRef || !ui.evidenceRef.trim()) {
        setExecuteError(`Thiếu evidence cho candidate ${c.candidate.policyCode} · nhân sự ${c.candidate.staffId}.`);
        return;
      }
    }

    setExecutedAt(new Date().toISOString());
    setExecuteSuccess(
      `Đã thi hành đề xuất theo ${approved.length} dòng đã phê duyệt. (reward=${fmtMoney(totalsApproved.totalReward)}, penalty=${fmtMoney(
        totalsApproved.totalPenalty
      )})`
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-xevn-text">Scanning đề xuất thưởng/phạt</h2>
        <p className="mt-1 text-sm text-xevn-muted">
          Nhập KPI thực tế, chạy scanning để tạo danh sách đề xuất theo chính sách. Sau đó phê duyệt và thi hành.
        </p>
      </div>

      {/* Period & Run controls */}
      <div className="space-y-4 rounded-2xl border border-black/[0.06] bg-white/85 p-5 shadow-glass backdrop-blur-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-wrap items-end gap-3">
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-xevn-muted">Kỳ tính</span>
              <select
                className="input-apple w-[260px]"
                value={selectedPeriodCode}
                onChange={(e) => {
                  setSelectedPeriodCode(e.target.value);
                  setSelectedRunId('');
                  setDraftValues({});
                }}
              >
                {periodRows.map((p) => (
                  <option key={p.id} value={p.periodCode}>
                    {p.name} ({p.periodCode})
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-medium text-xevn-muted">Chọn lần chạy</span>
              <select
                className="input-apple w-[320px]"
                value={selectedRunId}
                onChange={(e) => setSelectedRunId(e.target.value)}
                disabled={runsForPeriod.length === 0}
              >
                {runsForPeriod.length === 0 && <option value="">Chưa có kết quả</option>}
                {runsForPeriod.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.status} · {r.createdAt.slice(0, 19).replace('T', ' ')}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                if (!selectedPeriodCode) return;
                seedMockKpiActualValuesForPeriod(DEFAULT_TENANT, selectedPeriodCode);
                setDraftValues({});
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-black/[0.08] bg-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-black/[0.02]"
            >
              <Wrench className="h-4 w-4" />
              Tạo dữ liệu KPI
            </button>

            <button
              type="button"
              onClick={() => {
                if (!selectedPeriodCode) return;
                const run = runRewardPenaltyCalc(DEFAULT_TENANT, selectedPeriodCode);
                setSelectedRunId(run.id);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-xevn-primary px-4 py-2 text-sm font-medium text-white shadow-md"
            >
              <Play className="h-4 w-4" />
              Chạy scanning đề xuất
            </button>

            <button
              type="button"
              onClick={() => {
                if (!selectedPeriodCode) return;
                const run = recalcRewardPenalty(DEFAULT_TENANT, selectedPeriodCode);
                setSelectedRunId(run.id);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-black/[0.04] px-4 py-2 text-sm font-medium text-xevn-text shadow-sm hover:bg-black/[0.06]"
            >
              <RotateCcw className="h-4 w-4" />
              Tính lại (xóa cũ)
            </button>
          </div>
        </div>
      </div>

      {/* KPI actual editing */}
      <div className="space-y-4 rounded-2xl border border-black/[0.06] bg-white/85 p-5 shadow-glass backdrop-blur-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-base font-semibold tracking-tight text-xevn-text">KPI thực tế</h3>
            <p className="mt-1 text-sm text-xevn-muted">
              Nhập giá trị KPI để hệ thống tạo thưởng/phạt theo khoảng mức. Chọn KPI ở dropdown bên dưới.
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-xevn-muted">KPI</span>
              <select
                className="input-apple w-[320px]"
                value={selectedKpiCode}
                onChange={(e) => {
                  setSelectedKpiCode(e.target.value);
                  setDraftValues({});
                  setEditError('');
                  setEditSuccess('');
                }}
              >
                {activeKpis.map((k) => (
                  <option key={k.id} value={k.kpiCode}>
                    {k.kpiName} ({k.kpiCode})
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={() => {
                refreshDraftFromStore();
                setEditError('');
                setEditSuccess('');
              }}
              className="rounded-xl px-4 py-2 text-sm font-medium text-xevn-muted hover:bg-black/[0.04]"
            >
              Làm mới
            </button>
            <button
              type="button"
              onClick={saveKpiActuals}
              className="inline-flex items-center gap-2 rounded-xl bg-xevn-primary px-4 py-2 text-sm font-medium text-white shadow-md"
            >
              <Save className="h-4 w-4" />
              Lưu giá trị KPI
            </button>
          </div>
        </div>

        {editError && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700">{editError}</div>}
        {editSuccess && <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700">{editSuccess}</div>}

        <div className="overflow-x-auto rounded-2xl border border-black/[0.06] bg-white/90 shadow-glass backdrop-blur-sm">
          <table className="min-w-[980px] w-full text-left text-sm">
            <thead>
              <tr className="border-b border-black/[0.06] bg-black/[0.02] text-xs uppercase text-xevn-muted">
                <th className="px-4 py-3 w-32">Mã</th>
                <th className="px-4 py-3">Tên</th>
                <th className="px-4 py-3 w-28">Cấp</th>
                <th className="px-4 py-3 w-56">Tổ chức</th>
                <th className="px-4 py-3 w-44">Giá trị KPI</th>
              </tr>
            </thead>
            <tbody>
              {staffList.map((st) => (
                <tr key={st.id} className="border-b border-black/[0.04] last:border-0 hover:bg-black/[0.02]">
                  <td className="px-4 py-3 font-mono text-xs">{st.code}</td>
                  <td className="px-4 py-3 font-medium">{st.name}</td>
                  <td className="px-4 py-3 text-xevn-muted text-xs">{st.levelCode}</td>
                  <td className="px-4 py-3 text-xevn-muted text-xs">{staffOrgLabel(orgUnits, st.orgUnitId)}</td>
                  <td className="px-4 py-3">
                    <input
                      className="input-apple font-mono text-xs"
                      type="number"
                      value={draftValues[st.id] ?? ''}
                      onChange={(e) => {
                        const v = e.target.value;
                        setDraftValues((m) => ({ ...m, [st.id]: v }));
                      }}
                      placeholder="(chưa có)"
                    />
                  </td>
                </tr>
              ))}
              {staffList.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-xevn-muted">
                    Chưa có nhân sự.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scanning đề xuất & phê duyệt */}
      <div className="space-y-4 rounded-2xl border border-black/[0.06] bg-white/85 p-5 shadow-glass backdrop-blur-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-base font-semibold tracking-tight text-xevn-text">Scanning đề xuất thưởng/phạt & phê duyệt</h3>
            <p className="mt-1 text-sm text-xevn-muted">
              Kết quả scanning tạo danh sách đề xuất theo chính sách, sau đó HR/Manager phê duyệt trước khi thi hành.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="rounded-2xl border border-black/[0.06] bg-white/70 p-4 text-sm">
              <div className="text-xs text-xevn-muted">Tổng thưởng (đã phê duyệt)</div>
              <div className="mt-1 font-mono text-xevn-text">{selectedRun ? fmtMoney(totalsApproved.totalReward) : '—'}</div>
            </div>
            <div className="rounded-2xl border border-black/[0.06] bg-white/70 p-4 text-sm">
              <div className="text-xs text-xevn-muted">Tổng phạt (đã điều chỉnh lũy tiến)</div>
              <div className="mt-1 font-mono text-xevn-text">{selectedRun ? fmtMoney(totalsApproved.totalPenalty) : '—'}</div>
            </div>
          </div>
        </div>

        {!selectedRun && (
          <div className="rounded-2xl border border-black/[0.06] bg-black/[0.02] p-5 text-xevn-muted">
            Chưa có lần scanning cho kỳ này. Hãy bấm “Chạy scanning đề xuất”.
          </div>
        )}

        {selectedRun && (
          <>
            <div className="flex flex-wrap gap-3">
              <div className="rounded-2xl border border-black/[0.06] bg-white/70 p-4 text-sm">
                <div className="text-xs text-xevn-muted">Số dòng đề xuất</div>
                <div className="mt-1 font-mono text-xevn-text">{computedCandidates.length}</div>
              </div>
              <div className="rounded-2xl border border-black/[0.06] bg-white/70 p-4 text-sm">
                <div className="text-xs text-xevn-muted">Số dòng đã chọn phê duyệt</div>
                <div className="mt-1 font-mono text-xevn-text">{approvedCandidates.length}</div>
              </div>
            </div>

            {executeError && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700">{executeError}</div>}
            {executeSuccess && <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700">{executeSuccess}</div>}

            <div className="overflow-x-auto rounded-2xl border border-black/[0.06] bg-white/90 shadow-glass backdrop-blur-sm">
              <table className="min-w-[1200px] w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-black/[0.06] bg-black/[0.02] text-xs uppercase text-xevn-muted">
                    <th className="px-4 py-3 w-12">Phê duyệt</th>
                    <th className="px-4 py-3 w-12">Miễn trừ</th>
                    <th className="px-4 py-3 w-44">Nhân sự</th>
                    <th className="px-4 py-3 w-44">Chức vụ</th>
                    <th className="px-4 py-3 w-60">Chính sách</th>
                    <th className="px-4 py-3 w-40">Trigger</th>
                    <th className="px-4 py-3 w-40">Lũy tiến</th>
                    <th className="px-4 py-3 w-40">Thưởng</th>
                    <th className="px-4 py-3 w-40">Phạt</th>
                    <th className="px-4 py-3 w-64">EvidenceRef</th>
                    <th className="px-4 py-3 w-80">Lý do miễn trừ</th>
                  </tr>
                </thead>
                <tbody>
                  {computedCandidates.length === 0 && (
                    <tr>
                      <td colSpan={11} className="px-4 py-10 text-center text-xevn-muted">
                        Chưa có đề xuất theo chính sách và dữ liệu KPI hiện tại.
                      </td>
                    </tr>
                  )}

                  {computedCandidates.map((c) => {
                    const ui = candidateUIById[c.candidate.id];
                    const evidenceRequired = c.evidenceRequired;
                    const disabled = executedAt != null;
                    const staff = staffs.find((s) => s.id === c.candidate.staffId) ?? null;
                    return (
                      <tr key={c.candidate.id} className="border-b border-black/[0.04] last:border-0 hover:bg-black/[0.02]">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={!!ui?.approved}
                            disabled={disabled}
                            onChange={(e) => setCandidateApproved(c.candidate.id, e.target.checked)}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={!!ui?.excluded}
                            disabled={disabled}
                            onChange={(e) => setCandidateExcluded(c.candidate.id, e.target.checked)}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium">{staff?.code} — {staff?.name}</div>
                          <div className="text-xs text-xevn-muted">{staff ? staffOrgLabel(orgUnits, staff.orgUnitId) : '—'}</div>
                        </td>
                        <td className="px-4 py-3 text-xs text-xevn-muted">{staff?.levelCode ?? '—'}</td>
                        <td className="px-4 py-3">
                          <div className="font-mono text-xs">
                            {c.candidate.policyCode} (v{c.candidate.policyVersion})
                          </div>
                          <div className="text-xs text-xevn-muted">{c.candidate.kpiCode}</div>
                        </td>
                        <td className="px-4 py-3 text-xs text-xevn-muted">{c.triggerSource}</td>
                        <td className="px-4 py-3 text-xs text-xevn-muted">{c.progressiveEnabled ? `Lần ${c.progressiveStep}` : '—'}</td>
                        <td className="px-4 py-3 font-mono text-emerald-700 text-xs">{fmtMoney(c.candidate.rewardAmount)}</td>
                        <td className="px-4 py-3 font-mono text-red-700 text-xs">{fmtMoney(c.penaltyAmountAdjusted)}</td>
                        <td className="px-4 py-3">
                          <input
                            className="input-apple w-full"
                            value={ui?.evidenceRef ?? ''}
                            disabled={disabled || !evidenceRequired || ui?.excluded}
                            placeholder={evidenceRequired ? '(bắt buộc)' : '—'}
                            onChange={(e) => setCandidateEvidenceRef(c.candidate.id, e.target.value)}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            className="input-apple w-full"
                            value={ui?.exclusionReason ?? ''}
                            disabled={disabled || !ui?.excluded}
                            placeholder={ui?.excluded ? 'Nhập lý do miễn trừ' : '—'}
                            onChange={(e) => setCandidateExclusionReason(c.candidate.id, e.target.value)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="rounded-2xl border border-black/[0.06] bg-black/[0.02] p-4 text-sm text-xevn-muted space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <div className="text-xs text-xevn-muted">Giá trị ròng (đã phê duyệt)</div>
                  <div className="mt-1 font-mono text-xevn-text">{fmtMoney(totalsApproved.totalNet)}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={executeApproved}
                    disabled={executedAt != null || approvedCandidates.length === 0}
                    className="inline-flex items-center gap-2 rounded-xl bg-xevn-primary px-4 py-2 text-sm font-medium text-white shadow-md disabled:opacity-50"
                  >
                    <span>Thi hành (Notification/Payroll)</span>
                  </button>
                </div>
              </div>

              {executedAt && (
                <div className="text-xs text-xevn-muted">
                  Đã thi hành cho {approvedCandidates.length} dòng đề xuất. Trạng thái được khóa để tránh chỉnh sửa sau khi phát hành.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

