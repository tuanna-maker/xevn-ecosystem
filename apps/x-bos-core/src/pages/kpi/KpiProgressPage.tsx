import { useEffect, useMemo, useState } from 'react';
import { Save, Sparkles } from 'lucide-react';
import { useXbosStore } from '@/store/useXbosStore';
import type {
  PenaltyFormCode,
  PenaltyFormItem,
  PolicyDefinition,
  PolicyTariffRange,
  Staff,
} from '@/types';

const DEFAULT_TENANT = 'tenant-xevn-holding';
const PENALTY_FORM_ORDER: PenaltyFormCode[] = ['TRU_TIEN', 'TRU_DIEM', 'CANH_BAO'];

function findTariffMatchLocal(ranges: PolicyTariffRange[], value: number): PolicyTariffRange | null {
  const sorted = [...ranges].sort((a, b) => {
    const av = a.fromValue ?? Number.NEGATIVE_INFINITY;
    const bv = b.fromValue ?? Number.NEGATIVE_INFINITY;
    return av - bv;
  });

  for (const r of sorted) {
    const fromOk = r.fromValue == null ? true : value >= r.fromValue;
    const toOk = r.toValue == null ? true : value < r.toValue; // [from, to)
    if (fromOk && toOk) return r;
  }
  return null;
}

function effectiveMatchesPeriodLocal(
  effectiveFrom: string | null,
  effectiveTo: string | null,
  periodStart: Date,
  periodEnd: Date
): boolean {
  const fromTime = effectiveFrom ? new Date(effectiveFrom).getTime() : null;
  const toTime = effectiveTo ? new Date(effectiveTo).getTime() : null;
  const effectiveFromOk = fromTime == null ? true : fromTime <= periodEnd.getTime();
  const effectiveToOk = toTime == null ? true : toTime >= periodStart.getTime();
  return effectiveFromOk && effectiveToOk;
}

function policyOrgScopeMatchesLocal(
  orgUnits: { id: string; parentId: string | null }[],
  staffOrgUnitId: string,
  scope: { scopeType: 'TENANT' | 'ORG_UNIT'; orgUnitId?: string }
): boolean {
  if (scope.scopeType === 'TENANT') return true;
  const rootId = scope.orgUnitId;
  if (!rootId) return true;
  const byId = new Map(orgUnits.map((u) => [u.id, u]));
  let cur: string | null = staffOrgUnitId;
  while (cur) {
    if (cur === rootId) return true;
    cur = byId.get(cur)?.parentId ?? null;
  }
  return false;
}

function mergePenaltyForms(forms: PenaltyFormItem[]): Record<PenaltyFormCode, number> {
  const out: Record<PenaltyFormCode, number> = { TRU_TIEN: 0, TRU_DIEM: 0, CANH_BAO: 0 };
  for (const f of forms) {
    if (!PENALTY_FORM_ORDER.includes(f.formCode)) continue;
    out[f.formCode] += Number(f.value);
  }
  return out;
}

export function KpiProgressPage() {
  const orgUnits = useXbosStore((s) => s.orgUnits);
  const periods = useXbosStore((s) => s.periods);
  const staffs = useXbosStore((s) => s.staffs);
  const kpiDefinitions = useXbosStore((s) => s.kpiDefinitions);
  const policies = useXbosStore((s) => s.policies);
  const policyTariffRanges = useXbosStore((s) => s.policyTariffRanges);
  const kpiActualValues = useXbosStore((s) => s.kpiActualValues);
  const kpiAssignments = useXbosStore((s) => s.kpiAssignments);

  const seedMockKpiActualValuesForPeriod = useXbosStore((s) => s.seedMockKpiActualValuesForPeriod);
  const upsertKpiActualValue = useXbosStore((s) => s.upsertKpiActualValue);

  const activeKpis = useMemo(() => {
    return kpiDefinitions
      .filter((k) => k.tenantId === DEFAULT_TENANT && k.status === 'active')
      .sort((a, b) => a.kpiCode.localeCompare(b.kpiCode));
  }, [kpiDefinitions]);

  const periodRows = useMemo(() => {
    return periods.filter((p) => p.tenantId === DEFAULT_TENANT).sort((a, b) => b.periodCode.localeCompare(a.periodCode));
  }, [periods]);

  const [selectedPeriodCode, setSelectedPeriodCode] = useState<string>(periodRows[0]?.periodCode ?? '');
  useEffect(() => {
    if (!selectedPeriodCode && periodRows.length > 0) setSelectedPeriodCode(periodRows[0].periodCode);
  }, [periodRows, selectedPeriodCode]);

  const [selectedKpiCode, setSelectedKpiCode] = useState<string>(activeKpis[0]?.kpiCode ?? '');
  useEffect(() => {
    if (!selectedKpiCode && activeKpis.length > 0) setSelectedKpiCode(activeKpis[0].kpiCode);
  }, [activeKpis, selectedKpiCode]);

  const period = useMemo(() => {
    return periods.find((p) => p.tenantId === DEFAULT_TENANT && p.periodCode === selectedPeriodCode) ?? null;
  }, [periods, selectedPeriodCode]);

  const staffList = useMemo(() => staffs.filter((s) => s.tenantId === DEFAULT_TENANT), [staffs]);

  const orgLabelById = useMemo(() => {
    const m = new Map<string, string>();
    for (const o of orgUnits) m.set(o.id, `${o.code} — ${o.name}`);
    return m;
  }, [orgUnits]);

  const orgTree = useMemo(() => orgUnits.map((o) => ({ id: o.id, parentId: o.parentId })), [orgUnits]);

  function isKpiAssignedToStaff(st: Staff, kpiCode: string) {
    return kpiAssignments.some((a) => {
      if (a.tenantId !== DEFAULT_TENANT) return false;
      if (a.periodCode !== selectedPeriodCode) return false;
      if (a.staffLevelCode !== st.levelCode) return false;
      if (a.kpiCode !== kpiCode) return false;
      const aScope = a.orgScope ?? { scopeType: 'TENANT' as const };
      return policyOrgScopeMatchesLocal(orgTree, st.orgUnitId, aScope);
    });
  }

  const kpiActualValueByStaffId = useMemo(() => {
    const m = new Map<string, number>();
    for (const a of kpiActualValues) {
      if (a.tenantId !== DEFAULT_TENANT) continue;
      if (a.periodCode !== selectedPeriodCode) continue;
      if (a.kpiCode !== selectedKpiCode) continue;
      m.set(a.staffId, a.value);
    }
    return m;
  }, [kpiActualValues, selectedPeriodCode, selectedKpiCode]);

  const [draftValues, setDraftValues] = useState<Record<string, string>>({});
  useEffect(() => {
    const next: Record<string, string> = {};
    for (const st of staffList) {
      const assigned = isKpiAssignedToStaff(st, selectedKpiCode);
      if (!assigned) continue;
      const v = kpiActualValueByStaffId.get(st.id);
      next[st.id] = v == null ? '' : String(v);
    }
    setDraftValues(next);
  }, [staffList, selectedKpiCode, kpiActualValueByStaffId, kpiAssignments, orgTree]);

  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

  const assignedStaffCount = useMemo(() => {
    let n = 0;
    for (const st of staffList) {
      if (isKpiAssignedToStaff(st, selectedKpiCode)) n++;
    }
    return n;
  }, [staffList, selectedKpiCode, kpiAssignments, orgTree]);

  function refreshDraft() {
    const next: Record<string, string> = {};
    for (const st of staffList) {
      if (!isKpiAssignedToStaff(st, selectedKpiCode)) continue;
      const v = kpiActualValueByStaffId.get(st.id);
      next[st.id] = v == null ? '' : String(v);
    }
    setDraftValues(next);
  }

  function saveKpiActual() {
    setEditError('');
    setEditSuccess('');
    try {
      if (!period) throw new Error('Chưa chọn kỳ tính');
      if (!selectedKpiCode) throw new Error('Chưa chọn KPI');

      for (const st of staffList) {
        if (!isKpiAssignedToStaff(st, selectedKpiCode)) continue;

        const raw = (draftValues[st.id] ?? '').trim();
        if (!raw) continue;
        const value = Number(raw);
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

  function computeExpectedForStaff(st: Staff) {
    const assigned = isKpiAssignedToStaff(st, selectedKpiCode);
    if (!assigned) return null;

    const actual = kpiActualValueByStaffId.get(st.id);
    if (actual == null) {
      return { status: 'Thiếu dữ liệu', rewardAmount: 0, penaltyForms: { TRU_TIEN: 0, TRU_DIEM: 0, CANH_BAO: 0 } };
    }
    if (!period) {
      return { status: 'Thiếu kỳ tính', rewardAmount: 0, penaltyForms: { TRU_TIEN: 0, TRU_DIEM: 0, CANH_BAO: 0 } };
    }

    const periodStart = new Date(period.startDate);
    const periodEnd = new Date(period.endDate);

    const applicablePolicies: PolicyDefinition[] = policies.filter((p) => {
      if (p.tenantId !== DEFAULT_TENANT) return false;
      if (p.status !== 'active') return false;
      if (p.kpiCode !== selectedKpiCode) return false;
      if (!p.targetStaffLevelCodes.includes(st.levelCode)) return false;
      if (!policyOrgScopeMatchesLocal(orgTree, st.orgUnitId, p.orgScope)) return false;
      if (!effectiveMatchesPeriodLocal(p.effectiveFrom, p.effectiveTo, periodStart, periodEnd)) return false;
      return true;
    });

    if (applicablePolicies.length === 0) {
      return { status: 'Chưa có chính sách', rewardAmount: 0, penaltyForms: { TRU_TIEN: 0, TRU_DIEM: 0, CANH_BAO: 0 } };
    }

    let totalReward = 0;
    const allPenaltyForms: PenaltyFormItem[] = [];

    for (const pol of applicablePolicies) {
      const tariffs = policyTariffRanges.filter(
        (t) =>
          t.tenantId === DEFAULT_TENANT &&
          t.policyCode === pol.policyCode &&
          t.policyVersion === pol.version
      );
      if (tariffs.length === 0) continue;
      const match = findTariffMatchLocal(tariffs, actual);
      if (!match) continue;

      totalReward += match.rewardAmount;
      allPenaltyForms.push(...(match.penaltyForms ?? []));
    }

    const merged = mergePenaltyForms(allPenaltyForms);
    const hasPenalty = PENALTY_FORM_ORDER.some((fc) => merged[fc] > 0);
    const isPass = !hasPenalty && totalReward > 0;
    return {
      status: isPass ? 'Đạt' : 'Không đạt',
      rewardAmount: totalReward,
      penaltyForms: merged,
    };
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-xevn-text">Theo dõi tiến độ KPI</h2>
        <p className="mt-1 text-sm text-xevn-muted">
          Hiển thị trạng thái Đạt/Không đạt theo KPI đã gán và khoảng mức trong chính sách.
        </p>
      </div>

      <div className="space-y-4 rounded-2xl border border-black/[0.06] bg-white/85 p-5 shadow-glass backdrop-blur-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-wrap items-end gap-3">
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-xevn-muted">Kỳ tính</span>
              <select
                className="input-apple w-[260px]"
                value={selectedPeriodCode}
                onChange={(e) => setSelectedPeriodCode(e.target.value)}
              >
                {periodRows.map((p) => (
                  <option key={p.id} value={p.periodCode}>
                    {p.name} ({p.periodCode})
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-medium text-xevn-muted">KPI</span>
              <select
                className="input-apple w-[320px]"
                value={selectedKpiCode}
                onChange={(e) => setSelectedKpiCode(e.target.value)}
              >
                {activeKpis.map((k) => (
                  <option key={k.id} value={k.kpiCode}>
                    {k.kpiName} ({k.kpiCode})
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
                refreshDraft();
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-black/[0.08] bg-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-black/[0.02]"
            >
              <Sparkles className="h-4 w-4" />
              Tạo dữ liệu KPI
            </button>
            <button
              type="button"
              onClick={saveKpiActual}
              className="inline-flex items-center gap-2 rounded-xl bg-xevn-primary px-4 py-2 text-sm font-medium text-white shadow-md"
              disabled={assignedStaffCount === 0}
            >
              <Save className="h-4 w-4" />
              Lưu KPI thực tế
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <div className="rounded-2xl border border-black/[0.06] bg-white/70 px-4 py-3 text-sm">
            <div className="text-xs text-xevn-muted">Số nhân sự có KPI đã gán</div>
            <div className="mt-1 font-mono text-xevn-text">{assignedStaffCount}</div>
          </div>
        </div>
      </div>

      {editError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700">
          {editError}
        </div>
      )}
      {editSuccess && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700">
          {editSuccess}
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-black/[0.06] bg-white/90 shadow-glass backdrop-blur-sm">
        <table className="min-w-[1000px] w-full text-left text-sm">
          <thead>
            <tr className="border-b border-black/[0.06] bg-black/[0.02] text-xs uppercase text-xevn-muted">
              <th className="px-4 py-3 w-32">Mã</th>
              <th className="px-4 py-3 w-56">Tên</th>
              <th className="px-4 py-3 w-24">Cấp</th>
              <th className="px-4 py-3 w-64">Tổ chức</th>
              <th className="px-4 py-3 w-32">Giá trị KPI</th>
              <th className="px-4 py-3 w-36">Trạng thái</th>
              <th className="px-4 py-3 w-40">Thưởng</th>
              <th className="px-4 py-3 w-56">Phạt (nhiều hình thức)</th>
            </tr>
          </thead>
          <tbody>
            {staffList.map((st) => {
              const assigned = isKpiAssignedToStaff(st, selectedKpiCode);
              const expected = computeExpectedForStaff(st);
              const penalty = expected?.penaltyForms ?? { TRU_TIEN: 0, TRU_DIEM: 0, CANH_BAO: 0 };
              const reward = expected?.rewardAmount ?? 0;
              const status = expected?.status ?? '—';
              return (
                <tr key={st.id} className="border-b border-black/[0.04] last:border-0 hover:bg-black/[0.02]">
                  <td className="px-4 py-3 font-mono text-xs">{st.code}</td>
                  <td className="px-4 py-3 font-medium">{st.name}</td>
                  <td className="px-4 py-3 text-xevn-muted text-xs">{st.levelCode}</td>
                  <td className="px-4 py-3 text-xevn-muted text-xs">{orgLabelById.get(st.orgUnitId) ?? st.orgUnitId}</td>
                  <td className="px-4 py-3">
                    <input
                      className="input-apple font-mono text-xs"
                      type="number"
                      disabled={!assigned}
                      value={draftValues[st.id] ?? ''}
                      onChange={(e) => setDraftValues((m) => ({ ...m, [st.id]: e.target.value }))}
                      placeholder={assigned ? '(nhập)' : '—'}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        status === 'Đạt'
                          ? 'rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700'
                          : status === 'Không đạt'
                            ? 'rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-700'
                            : 'rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600'
                      }
                    >
                      {assigned ? status : 'Chưa gán KPI'}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-emerald-700">{reward > 0 ? `${reward.toLocaleString('vi-VN')} VND` : '0'}</td>
                  <td className="px-4 py-3 text-xs">
                    <div className="space-y-1">
                      <div className="font-mono text-red-700">TRỪ TIỀN: {penalty.TRU_TIEN.toLocaleString('vi-VN')} VND</div>
                      <div className="font-mono text-red-700">TRỪ ĐIỂM: {penalty.TRU_DIEM.toLocaleString('vi-VN')} điểm</div>
                      <div className="font-mono text-red-700">CẢNH BÁO: {penalty.CANH_BAO.toLocaleString('vi-VN')} lần</div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

