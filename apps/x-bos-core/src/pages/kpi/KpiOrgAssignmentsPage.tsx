import { useMemo, useState } from 'react';
import { Save, Trash2 } from 'lucide-react';
import { useXbosStore } from '@/store/useXbosStore';
import type { PolicyOrgScope, StaffLevelCode } from '@/types';

const DEFAULT_TENANT = 'tenant-xevn-holding';
const STAFF_LEVEL_OPTIONS: ReadonlyArray<{ value: StaffLevelCode; label: string }> = [
  { value: 'KINH_DOANH', label: 'Nhân viên kinh doanh' },
  { value: 'LAI_XE', label: 'Tài xế' },
];

type DraftRow = {
  id: string;
  staffLevelCode: StaffLevelCode;
  kpiCode: string;
};

function createDraftRow(kpiCode: string): DraftRow {
  return {
    id: `org-kpi-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    staffLevelCode: 'KINH_DOANH',
    kpiCode,
  };
}

function scopeKey(scope: PolicyOrgScope): string {
  return scope.scopeType === 'TENANT' ? 'TENANT' : `ORG_UNIT:${scope.orgUnitId ?? ''}`;
}

export function KpiOrgAssignmentsPage() {
  const periods = useXbosStore((s) => s.periods);
  const orgUnits = useXbosStore((s) => s.orgUnits);
  const kpiDefinitions = useXbosStore((s) => s.kpiDefinitions);
  const kpiAssignments = useXbosStore((s) => s.kpiAssignments);
  const replaceKpiAssignmentsForPeriod = useXbosStore((s) => s.replaceKpiAssignmentsForPeriod);

  const periodRows = useMemo(
    () =>
      periods
        .filter((p) => p.tenantId === DEFAULT_TENANT)
        .sort((a, b) => b.periodCode.localeCompare(a.periodCode)),
    [periods],
  );
  const tenantOrgUnits = useMemo(
    () => orgUnits.filter((o) => o.tenantId === DEFAULT_TENANT),
    [orgUnits],
  );
  const activeKpis = useMemo(
    () =>
      kpiDefinitions
        .filter((k) => k.tenantId === DEFAULT_TENANT && k.status === 'active')
        .sort((a, b) => a.kpiCode.localeCompare(b.kpiCode)),
    [kpiDefinitions],
  );

  const [selectedPeriodCode, setSelectedPeriodCode] = useState(periodRows[0]?.periodCode ?? '');
  const [scopeType, setScopeType] = useState<PolicyOrgScope['scopeType']>('TENANT');
  const [orgUnitId, setOrgUnitId] = useState(tenantOrgUnits[0]?.id ?? '');
  const [draftRows, setDraftRows] = useState<DraftRow[]>(() => [
    createDraftRow(activeKpis[0]?.kpiCode ?? ''),
  ]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const selectedScope: PolicyOrgScope =
    scopeType === 'TENANT' ? { scopeType: 'TENANT' } : { scopeType: 'ORG_UNIT', orgUnitId };

  const currentAssignments = useMemo(() => {
    const key = scopeKey(selectedScope);
    return kpiAssignments
      .filter((a) => {
        if (a.tenantId !== DEFAULT_TENANT || a.periodCode !== selectedPeriodCode) return false;
        return scopeKey(a.orgScope) === key;
      })
      .sort((a, b) => `${a.staffLevelCode}-${a.kpiCode}`.localeCompare(`${b.staffLevelCode}-${b.kpiCode}`));
  }, [kpiAssignments, selectedPeriodCode, selectedScope]);

  function loadCurrentScope() {
    if (currentAssignments.length === 0) {
      setDraftRows([createDraftRow(activeKpis[0]?.kpiCode ?? '')]);
      setMessage('Phạm vi này chưa có KPI đã gán; đã mở một dòng trống.');
      setError('');
      return;
    }
    setDraftRows(
      currentAssignments.map((a) => ({
        id: a.id,
        staffLevelCode: a.staffLevelCode,
        kpiCode: a.kpiCode,
      })),
    );
    setMessage('Đã tải danh sách KPI đã gán cho phạm vi đang chọn.');
    setError('');
  }

  function saveAssignments() {
    setMessage('');
    setError('');
    if (!selectedPeriodCode) {
      setError('Chọn kỳ trước khi lưu gán KPI.');
      return;
    }
    if (scopeType === 'ORG_UNIT' && !orgUnitId) {
      setError('Chọn đơn vị tổ chức khi phạm vi là ORG_UNIT.');
      return;
    }
    const normalized = draftRows
      .map((row) => ({
        staffLevelCode: row.staffLevelCode,
        kpiCode: row.kpiCode.trim().toUpperCase(),
      }))
      .filter((row) => row.kpiCode);
    if (normalized.length === 0) {
      setError('Cần ít nhất một dòng KPI hợp lệ để lưu.');
      return;
    }
    const missingKpi = normalized.find(
      (row) => !activeKpis.some((kpi) => kpi.kpiCode === row.kpiCode),
    );
    if (missingKpi) {
      setError(`KPI ${missingKpi.kpiCode} không tồn tại hoặc chưa active.`);
      return;
    }

    replaceKpiAssignmentsForPeriod(DEFAULT_TENANT, selectedPeriodCode, selectedScope, normalized);
    setMessage(
      `Đã publish mock ${normalized.length} dòng gán KPI cho ${selectedPeriodCode} / ${scopeKey(selectedScope)}.`,
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-xevn-text">
          Gán KPI theo phạm vi tổ chức
        </h2>
        <p className="text-sm text-xevn-muted">
          Lấp use case F-KPI-ASSIGN: chọn kỳ, phạm vi TENANT/ORG_UNIT, cấp nhân sự và KPI active để tạo
          contract gán KPI cho dashboard theo dõi tiến độ.
        </p>
      </div>

      <div className="rounded-2xl border border-black/[0.06] bg-white/85 p-5 shadow-glass backdrop-blur-sm">
        <div className="grid gap-3 md:grid-cols-3">
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-xevn-muted">Kỳ áp dụng</span>
            <select className="input-apple" value={selectedPeriodCode} onChange={(e) => setSelectedPeriodCode(e.target.value)}>
              {periodRows.map((p) => (
                <option key={p.id} value={p.periodCode}>
                  {p.name} ({p.periodCode})
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-xevn-muted">Phạm vi orgScope</span>
            <select className="input-apple" value={scopeType} onChange={(e) => setScopeType(e.target.value as PolicyOrgScope['scopeType'])}>
              <option value="TENANT">TENANT — Toàn tập đoàn</option>
              <option value="ORG_UNIT">ORG_UNIT — Theo nhánh tổ chức</option>
            </select>
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-xevn-muted">Nút tổ chức</span>
            <select
              className="input-apple"
              value={orgUnitId}
              onChange={(e) => setOrgUnitId(e.target.value)}
              disabled={scopeType !== 'ORG_UNIT'}
            >
              {tenantOrgUnits.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.code} — {o.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={loadCurrentScope}
            className="rounded-xl border border-black/[0.08] bg-white px-4 py-2 text-sm font-medium shadow-sm"
          >
            Tải gán hiện tại
          </button>
          <button
            type="button"
            onClick={saveAssignments}
            className="inline-flex items-center gap-2 rounded-xl bg-xevn-primary px-4 py-2 text-sm font-medium text-white shadow-md"
          >
            <Save className="h-4 w-4" />
            Lưu / publish mock
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-black/[0.06] bg-white/90 shadow-glass backdrop-blur-sm">
        <table className="min-w-[760px] w-full text-left text-sm">
          <thead>
            <tr className="border-b border-black/[0.06] bg-black/[0.02] text-xs uppercase text-xevn-muted">
              <th className="px-4 py-3">Cấp nhân sự</th>
              <th className="px-4 py-3">KPI active</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {draftRows.map((row) => (
              <tr key={row.id} className="border-b border-black/[0.04] last:border-0">
                <td className="px-4 py-3">
                  <select
                    className="input-apple"
                    value={row.staffLevelCode}
                    onChange={(e) =>
                      setDraftRows((prev) =>
                        prev.map((x) => (x.id === row.id ? { ...x, staffLevelCode: e.target.value as StaffLevelCode } : x)),
                      )
                    }
                  >
                    {STAFF_LEVEL_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.value} — {opt.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <select
                    className="input-apple"
                    value={row.kpiCode}
                    onChange={(e) =>
                      setDraftRows((prev) =>
                        prev.map((x) => (x.id === row.id ? { ...x, kpiCode: e.target.value } : x)),
                      )
                    }
                  >
                    {activeKpis.map((kpi) => (
                      <option key={kpi.id} value={kpi.kpiCode}>
                        {kpi.kpiCode} — {kpi.kpiName}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => setDraftRows((prev) => prev.filter((x) => x.id !== row.id))}
                    className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
                    disabled={draftRows.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={() => setDraftRows((prev) => prev.concat(createDraftRow(activeKpis[0]?.kpiCode ?? '')))}
        className="rounded-xl border border-black/[0.08] bg-white px-4 py-2 text-sm font-medium shadow-sm"
      >
        + Thêm dòng KPI
      </button>

      {error ? <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700">{error}</div> : null}
      {message ? <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700">{message}</div> : null}

      <div className="rounded-2xl border border-black/[0.06] bg-black/[0.02] p-4 text-sm text-xevn-muted">
        Gán hiện tại cho phạm vi đang chọn:{' '}
        <span className="font-mono text-xevn-text">{currentAssignments.length}</span> dòng. Các dòng này được
        màn Theo dõi tiến độ đọc lại qua `kpiAssignments`.
      </div>
    </div>
  );
}
