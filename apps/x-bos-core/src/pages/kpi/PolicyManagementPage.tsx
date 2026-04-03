import { useEffect, useMemo, useState } from 'react';
import { Check, ChevronDown, Edit3, Plus, Trash2 } from 'lucide-react';
import { DrawerShell } from '@/components/drawers/DrawerShell';
import { useXbosStore } from '@/store/useXbosStore';
import type { KpiDefinition, PolicyDefinition, PolicyGroup, StaffLevelCode } from '@/types';

const DEFAULT_TENANT = 'tenant-xevn-holding';

type GroupDrawerMode = 'create' | 'edit';
type PolicyDrawerMode = 'create' | 'edit';

const STAFF_LEVELS: { code: StaffLevelCode; label: string }[] = [
  { code: 'KINH_DOANH', label: 'Kinh doanh' },
  { code: 'LAI_XE', label: 'Lái xe' },
];

type TriggerSource = 'KPI' | 'SATELLITE_EVENT' | 'SLA';

const TRIGGER_SOURCES: TriggerSource[] = ['KPI', 'SATELLITE_EVENT', 'SLA'];

function parseJsonOrThrow<T = unknown>(s: string, fieldName: string): T {
  try {
    return JSON.parse((s ?? '').trim() || '{}') as T;
  } catch {
    throw new Error(`${fieldName} không hợp lệ. Vui lòng nhập JSON hợp lệ.`);
  }
}

export function PolicyManagementPage() {
  const orgUnits = useXbosStore((s) => s.orgUnits);
  const kpiDefinitions = useXbosStore((s) => s.kpiDefinitions);
  const policyGroups = useXbosStore((s) => s.policyGroups);
  const policies = useXbosStore((s) => s.policies);

  const addPolicyGroup = useXbosStore((s) => s.addPolicyGroup);
  const updatePolicyGroup = useXbosStore((s) => s.updatePolicyGroup);
  const deletePolicyGroup = useXbosStore((s) => s.deletePolicyGroup);

  const addOrUpdatePolicyDefinition = useXbosStore((s) => s.addOrUpdatePolicyDefinition);
  const deletePolicyByCode = useXbosStore((s) => s.deletePolicyByCode);

  const [selectedGroupCode, setSelectedGroupCode] = useState<string>('');

  const groups = useMemo(() => {
    return policyGroups.filter((g) => g.tenantId === DEFAULT_TENANT);
  }, [policyGroups]);

  const activeKpis = useMemo(() => {
    const list = kpiDefinitions.filter((k) => k.tenantId === DEFAULT_TENANT && k.status === 'active');
    const byCode = new Map<string, KpiDefinition>();
    for (const k of list) {
      const cur = byCode.get(k.kpiCode);
      if (!cur || k.version > cur.version) byCode.set(k.kpiCode, k);
    }
    return Array.from(byCode.values()).sort((a, b) => a.kpiCode.localeCompare(b.kpiCode));
  }, [kpiDefinitions]);

  const policyRows = useMemo(() => {
    const list = policies
      .filter((p) => p.tenantId === DEFAULT_TENANT)
      .filter((p) => (selectedGroupCode ? p.policyGroupCode === selectedGroupCode : true))
      .sort((a, b) => b.version - a.version);
    return list;
  }, [policies, selectedGroupCode]);

  useEffect(() => {
    if (!selectedGroupCode && groups.length > 0) {
      setSelectedGroupCode(groups[0].policyGroupCode);
    }
  }, [selectedGroupCode, groups]);

  // Group drawer
  const [groupDrawerOpen, setGroupDrawerOpen] = useState(false);
  const [groupMode, setGroupMode] = useState<GroupDrawerMode>('create');
  const [groupError, setGroupError] = useState('');
  const [groupForm, setGroupForm] = useState({
    policyGroupCode: '',
    policyGroupName: '',
    description: '',
    defaultTargetStaffLevelCodes: [] as StaffLevelCode[],
    defaultCurrencyCode: 'VND',
    status: 'active' as PolicyGroup['status'],
  });

  function openCreateGroup() {
    setGroupMode('create');
    setGroupError('');
    setGroupForm({
      policyGroupCode: '',
      policyGroupName: '',
      description: '',
      defaultTargetStaffLevelCodes: ['KINH_DOANH'],
      defaultCurrencyCode: 'VND',
      status: 'active',
    });
    setGroupDrawerOpen(true);
  }

  function openEditGroup(g: PolicyGroup) {
    setGroupMode('edit');
    setGroupError('');
    setGroupForm({
      policyGroupCode: g.policyGroupCode,
      policyGroupName: g.policyGroupName,
      description: g.description ?? '',
      defaultTargetStaffLevelCodes: g.defaultTargetStaffLevelCodes ?? [],
      defaultCurrencyCode: g.defaultCurrencyCode ?? 'VND',
      status: g.status,
    });
    setGroupDrawerOpen(true);
  }

  function saveGroup() {
    setGroupError('');
    try {
      const payload: Omit<PolicyGroup, 'id'> & { id?: string } = {
        tenantId: DEFAULT_TENANT,
        policyGroupCode: groupForm.policyGroupCode.trim().toUpperCase(),
        policyGroupName: groupForm.policyGroupName.trim(),
        description: groupForm.description.trim() || undefined,
        defaultTargetStaffLevelCodes: groupForm.defaultTargetStaffLevelCodes,
        defaultCurrencyCode: groupForm.defaultCurrencyCode.trim() || undefined,
        status: groupForm.status,
      };

      if (!payload.policyGroupCode) throw new Error('Thiếu mã nhóm chính sách');
      if (!payload.policyGroupName) throw new Error('Thiếu tên nhóm chính sách');

      if (groupMode === 'create') {
        const created = addPolicyGroup(payload as any);
        setSelectedGroupCode(created.policyGroupCode);
      } else {
        const group = groups.find((x) => x.policyGroupCode === groupForm.policyGroupCode);
        if (!group) throw new Error('Không tìm thấy nhóm để sửa');
        updatePolicyGroup(group.id, payload as any);
      }

      setGroupDrawerOpen(false);
    } catch (e) {
      setGroupError(e instanceof Error ? e.message : 'Lỗi không xác định');
    }
  }

  // Policy drawer
  const [policyDrawerOpen, setPolicyDrawerOpen] = useState(false);
  const [policyMode, setPolicyMode] = useState<PolicyDrawerMode>('create');
  const [policyError, setPolicyError] = useState('');

  const [policyForm, setPolicyForm] = useState({
    policyGroupCode: selectedGroupCode,
    policyCode: '',
    policyName: '',
    kpiCode: '',
    targetStaffLevelCodes: ['KINH_DOANH'] as StaffLevelCode[],
    orgScopeType: 'TENANT' as 'TENANT' | 'ORG_UNIT',
    orgUnitId: '',
    triggerSource: 'KPI' as TriggerSource,
    conditionLogicStr: '{"operator":">","metricKey":"kpiValue","value":0}',
    incentiveValueStr: '0',
    penaltyValueStr: '0',
    evidenceRequired: false,
    progressiveConfigStr: '{"enabled":true,"step":0.2,"cap":3}',
    exclusionRuleStr: '{"enabled":true}',
    limitZoneStr: '{}',
    effectiveFrom: '',
    effectiveTo: '',
    status: 'active' as PolicyDefinition['status'],
  });

  const selectedGroup = useMemo(() => groups.find((g) => g.policyGroupCode === selectedGroupCode) ?? null, [groups, selectedGroupCode]);

  function openCreatePolicy() {
    if (!selectedGroup) return;
    setPolicyMode('create');
    setPolicyError('');

    setPolicyForm({
      policyGroupCode: selectedGroup.policyGroupCode,
      policyCode: '',
      policyName: '',
      kpiCode: activeKpis[0]?.kpiCode ?? '',
      targetStaffLevelCodes: selectedGroup.defaultTargetStaffLevelCodes ?? ['KINH_DOANH'],
      orgScopeType: 'TENANT',
      orgUnitId: orgUnits[0]?.id ?? '',
      triggerSource: 'KPI',
      conditionLogicStr: '{"operator":">","metricKey":"kpiValue","value":0}',
      incentiveValueStr: '0',
      penaltyValueStr: '0',
      evidenceRequired: false,
      progressiveConfigStr: '{"enabled":true,"step":0.2,"cap":3}',
      exclusionRuleStr: '{"enabled":true}',
      limitZoneStr: '{}',
      effectiveFrom: '',
      effectiveTo: '',
      status: 'active',
    });
    setPolicyDrawerOpen(true);
  }

  function openEditPolicy(row: PolicyDefinition) {
    setPolicyMode('edit');
    setPolicyError('');

    const cond = row.conditionJson ?? {};
    const triggerSource = (cond.triggerSource as TriggerSource | undefined) ?? 'KPI';

    const conditionLogicStr = JSON.stringify(cond.conditionLogic ?? {}, null, 2);
    const progressiveConfigStr = JSON.stringify(cond.progressiveConfig ?? { enabled: true, step: 0.2, cap: 3 }, null, 2);
    const exclusionRuleStr = JSON.stringify(cond.exclusionRule ?? { enabled: true }, null, 2);
    const limitZoneStr = JSON.stringify(cond.limitZone ?? {}, null, 2);

    setPolicyForm({
      policyGroupCode: row.policyGroupCode,
      policyCode: row.policyCode,
      policyName: row.policyName,
      kpiCode: row.kpiCode,
      targetStaffLevelCodes: row.targetStaffLevelCodes,
      orgScopeType: row.orgScope.scopeType,
      orgUnitId: row.orgScope.orgUnitId ?? orgUnits[0]?.id ?? '',
      triggerSource,
      conditionLogicStr,
      incentiveValueStr: String((cond.incentiveValue ?? 0) as number),
      penaltyValueStr: String((cond.penaltyValue ?? 0) as number),
      evidenceRequired: Boolean(cond.evidenceRequired ?? false),
      progressiveConfigStr,
      exclusionRuleStr,
      limitZoneStr,
      effectiveFrom: row.effectiveFrom ?? '',
      effectiveTo: row.effectiveTo ?? '',
      status: row.status,
    });
    setPolicyDrawerOpen(true);
  }

  function savePolicy() {
    setPolicyError('');
    try {
      const conditionLogic = parseJsonOrThrow(policyForm.conditionLogicStr, 'Condition_Logic');
      const progressiveConfig = parseJsonOrThrow(policyForm.progressiveConfigStr, 'Progressive_Config');
      const exclusionRule = parseJsonOrThrow(policyForm.exclusionRuleStr, 'Exclusion_Rule');
      const limitZone = parseJsonOrThrow(policyForm.limitZoneStr, 'Limit_Zone');

      const incentiveValue = Number(policyForm.incentiveValueStr);
      const penaltyValue = Number(policyForm.penaltyValueStr);

      if (!Number.isFinite(incentiveValue) || incentiveValue < 0) {
        throw new Error('Giá trị Incentive_Value phải là số hợp lệ và >= 0.');
      }
      if (!Number.isFinite(penaltyValue) || penaltyValue < 0) {
        throw new Error('Giá trị Penalty_Value phải là số hợp lệ và >= 0.');
      }

      const operator = (conditionLogic as any)?.operator as string | undefined;
      if (!operator) throw new Error('Condition_Logic: Thiếu trường operator.');
      const allowed = ['>', '<', '=', 'contains'];
      if (!allowed.includes(operator)) {
        throw new Error('Condition_Logic: Operator không hợp lệ. Chỉ cho phép: >, <, =, contains.');
      }

      const conditionJson = {
        triggerSource: policyForm.triggerSource,
        conditionLogic,
        incentiveValue,
        penaltyValue,
        evidenceRequired: policyForm.evidenceRequired,
        progressiveConfig,
        exclusionRule,
        limitZone,
      };

      const payload = {
        tenantId: DEFAULT_TENANT,
        policyGroupCode: policyForm.policyGroupCode.trim().toUpperCase(),
        policyCode: policyForm.policyCode.trim().toUpperCase(),
        policyName: policyForm.policyName.trim(),
        kpiCode: policyForm.kpiCode.trim().toUpperCase(),
        targetStaffLevelCodes: policyForm.targetStaffLevelCodes,
        orgScope:
          policyForm.orgScopeType === 'TENANT'
            ? { scopeType: 'TENANT' }
            : { scopeType: 'ORG_UNIT', orgUnitId: policyForm.orgUnitId },
        conditionJson,
        effectiveFrom: policyForm.effectiveFrom.trim() ? policyForm.effectiveFrom.trim() : null,
        effectiveTo: policyForm.effectiveTo.trim() ? policyForm.effectiveTo.trim() : null,
        status: policyForm.status,
      };

      if (!payload.policyCode) throw new Error('Thiếu mã chính sách');
      if (!payload.policyName) throw new Error('Thiếu tên chính sách');
      if (!payload.kpiCode) throw new Error('Chưa chọn KPI');
      if (!payload.targetStaffLevelCodes.length) throw new Error('Chọn ít nhất 1 cấp nhân sự áp dụng');

      addOrUpdatePolicyDefinition(payload as any);
      setPolicyDrawerOpen(false);
    } catch (e) {
      setPolicyError(e instanceof Error ? e.message : 'Lỗi không xác định');
    }
  }

  const staffLevelLabels = useMemo(() => {
    const m = new Map<StaffLevelCode, string>();
    for (const x of STAFF_LEVELS) m.set(x.code, x.label);
    return m;
  }, []);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight text-xevn-text">Global Policy & Override</h2>
        <p className="mt-1 text-sm text-xevn-muted">
          Khai báo Trigger_Source, Condition_Logic, Evidence_Required, cấu hình lũy tiến, miễn trừ (Exclusion) và vùng giới hạn (Limit_Zone). Gán phạm vi áp dụng theo `TENANT` hoặc `ORG_UNIT`.
        </p>
      </div>

      {/* Groups */}
      <div className="space-y-4 rounded-2xl border border-black/[0.06] bg-white/85 p-5 shadow-glass backdrop-blur-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-base font-semibold tracking-tight text-xevn-text">Nhóm chính sách</h3>
            <p className="mt-1 text-sm text-xevn-muted">Chọn nhóm để xem danh sách chính sách bên dưới.</p>
          </div>
          <button
            type="button"
            onClick={openCreateGroup}
            className="inline-flex items-center gap-2 rounded-xl bg-xevn-primary px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-xevn-primary/25 hover:bg-blue-800"
          >
            <Plus className="h-4 w-4" />
            Thêm nhóm
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-black/[0.06] bg-white/90">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-black/[0.06] bg-black/[0.02] text-xs uppercase text-xevn-muted">
                <th className="px-4 py-3 w-10" />
                <th className="px-4 py-3">Mã nhóm</th>
                <th className="px-4 py-3">Tên nhóm</th>
                <th className="px-4 py-3 w-56">Mục tiêu mặc định</th>
                <th className="px-4 py-3 w-32">Trạng thái</th>
                <th className="px-4 py-3 w-56">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => (
                <tr
                  key={g.id}
                  className={
                    g.policyGroupCode === selectedGroupCode
                      ? 'border-b border-black/[0.04] bg-xevn-primary/5 last:border-0'
                      : 'border-b border-black/[0.04] last:border-0 hover:bg-black/[0.02]'
                  }
                >
                  <td className="px-2 py-2 align-middle">
                    <button
                      type="button"
                      onClick={() => setSelectedGroupCode(g.policyGroupCode)}
                      className="rounded-lg p-2 hover:bg-black/[0.04]"
                      aria-label="Chọn nhóm"
                    >
                      {g.policyGroupCode === selectedGroupCode ? <Check className="h-4 w-4 text-xevn-primary" /> : <ChevronDown className="h-4 w-4 text-xevn-muted" />}
                    </button>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{g.policyGroupCode}</td>
                  <td className="px-4 py-3 font-medium">{g.policyGroupName}</td>
                  <td className="px-4 py-3 text-xevn-muted text-xs">
                    {(g.defaultTargetStaffLevelCodes ?? []).map((c) => staffLevelLabels.get(c) ?? c).join(', ') || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        g.status === 'active'
                          ? 'rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700'
                          : 'rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600'
                      }
                    >
                      {g.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openEditGroup(g)}
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
                          if (!window.confirm(`Xóa nhóm ${g.policyGroupCode}?`)) return;
                          deletePolicyGroup(g.id);
                          setSelectedGroupCode((cur) => (cur === g.policyGroupCode ? '' : cur));
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
              {groups.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-xevn-muted">
                    Chưa có nhóm chính sách.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Policies */}
      <div className="space-y-4 rounded-2xl border border-black/[0.06] bg-white/85 p-5 shadow-glass backdrop-blur-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-base font-semibold tracking-tight text-xevn-text">Chính sách</h3>
            <p className="mt-1 text-sm text-xevn-muted">
              Tạo chính sách cho KPI và áp dụng theo cấp nhân sự. Khi lưu sẽ tạo phiên bản mới.
            </p>
          </div>
          <button
            type="button"
            disabled={!selectedGroupCode}
            onClick={openCreatePolicy}
            className="inline-flex items-center gap-2 rounded-xl bg-xevn-primary px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-xevn-primary/25 hover:bg-blue-800 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Thêm chính sách
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-black/[0.06] bg-white/90">
          <table className="min-w-[900px] w-full text-left text-sm">
            <thead>
              <tr className="border-b border-black/[0.06] bg-black/[0.02] text-xs uppercase text-xevn-muted">
                <th className="px-4 py-3">Mã</th>
                <th className="px-4 py-3">Tên</th>
                <th className="px-4 py-3 w-32">KPI</th>
                <th className="px-4 py-3 w-44">Trigger_Source</th>
                <th className="px-4 py-3 w-56">Cấp áp dụng</th>
                <th className="px-4 py-3 w-44">Phạm vi</th>
                <th className="px-4 py-3 w-24">Phiên bản</th>
                <th className="px-4 py-3 w-24">Trạng thái</th>
                <th className="px-4 py-3 w-64">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {policyRows.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-xevn-muted">
                    Chưa có chính sách cho nhóm này.
                  </td>
                </tr>
              )}
              {policyRows.map((p) => (
                <tr key={p.id} className="border-b border-black/[0.04] last:border-0 hover:bg-black/[0.02]">
                  <td className="px-4 py-3 font-mono text-xs">{p.policyCode}</td>
                  <td className="px-4 py-3 font-medium">{p.policyName}</td>
                  <td className="px-4 py-3 text-xevn-muted text-xs">{p.kpiCode}</td>
                  <td className="px-4 py-3 text-xevn-muted text-xs">
                    {((p.conditionJson?.triggerSource as TriggerSource | undefined) ?? 'KPI').toString()}
                  </td>
                  <td className="px-4 py-3 text-xevn-muted text-xs">
                    {p.targetStaffLevelCodes.map((c) => staffLevelLabels.get(c) ?? c).join(', ') || '—'}
                  </td>
                  <td className="px-4 py-3 text-xevn-muted text-xs">
                    {p.orgScope.scopeType === 'TENANT' ? 'Toàn tập đoàn' : orgUnits.find((o) => o.id === p.orgScope.orgUnitId)?.name ?? p.orgScope.orgUnitId}
                  </td>
                  <td className="px-4 py-3">{p.version}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        p.status === 'active'
                          ? 'rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700'
                          : 'rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600'
                      }
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openEditPolicy(p)}
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
                          if (!window.confirm(`Xóa toàn bộ chính sách ${p.policyCode}?`)) return;
                          deletePolicyByCode(DEFAULT_TENANT, p.policyCode);
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
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer: Group */}
      <DrawerShell
        open={groupDrawerOpen}
        onClose={() => setGroupDrawerOpen(false)}
        title={groupMode === 'create' ? 'Thêm nhóm chính sách' : 'Sửa nhóm chính sách'}
        widthClassName="max-w-lg"
      >
        <div className="space-y-4">
          {groupError && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700">{groupError}</div>}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveGroup();
            }}
            className="space-y-5"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Mã nhóm chính sách" required>
                <input
                  required
                  className="input-apple font-mono text-xs"
                  value={groupForm.policyGroupCode}
                  onChange={(e) => setGroupForm((f) => ({ ...f, policyGroupCode: e.target.value }))}
                  placeholder="VD: PG_KINH_DOANH"
                  disabled={groupMode === 'edit'}
                />
              </Field>
              <Field label="Trạng thái" required>
                <select
                  className="input-apple"
                  value={groupForm.status}
                  onChange={(e) => setGroupForm((f) => ({ ...f, status: e.target.value as PolicyGroup['status'] }))}
                >
                  <option value="draft">draft</option>
                  <option value="active">active</option>
                  <option value="inactive">inactive</option>
                </select>
              </Field>
            </div>

            <Field label="Tên nhóm chính sách" required>
              <input
                required
                className="input-apple"
                value={groupForm.policyGroupName}
                onChange={(e) => setGroupForm((f) => ({ ...f, policyGroupName: e.target.value }))}
                placeholder="VD: Chính sách cho khối kinh doanh"
              />
            </Field>

            <Field label="Mô tả">
              <textarea
                className="input-apple min-h-[90px] font-mono text-xs"
                value={groupForm.description}
                onChange={(e) => setGroupForm((f) => ({ ...f, description: e.target.value }))}
              />
            </Field>

            <Field label="Mục tiêu mặc định (cấp nhân sự)">
              <div className="space-y-2 rounded-2xl border border-black/[0.06] bg-white/70 p-3">
                {STAFF_LEVELS.map((x) => {
                  const checked = groupForm.defaultTargetStaffLevelCodes.includes(x.code);
                  return (
                    <label key={x.code} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          const next = e.target.checked
                            ? [...groupForm.defaultTargetStaffLevelCodes, x.code]
                            : groupForm.defaultTargetStaffLevelCodes.filter((v) => v !== x.code);
                          setGroupForm((f) => ({ ...f, defaultTargetStaffLevelCodes: next }));
                        }}
                      />
                      <span>{x.label}</span>
                    </label>
                  );
                })}
              </div>
            </Field>

            <Field label="Đơn vị tiền mặc định (currency)">
              <input
                className="input-apple"
                value={groupForm.defaultCurrencyCode}
                onChange={(e) => setGroupForm((f) => ({ ...f, defaultCurrencyCode: e.target.value }))}
                placeholder="VD: VND"
              />
            </Field>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setGroupDrawerOpen(false)}
                className="rounded-xl px-4 py-2 text-sm font-medium text-xevn-muted hover:bg-black/[0.04]"
              >
                Hủy
              </button>
              <button type="submit" className="rounded-xl bg-xevn-primary px-5 py-2 text-sm font-medium text-white shadow-md">
                Lưu nhóm
              </button>
            </div>
          </form>
        </div>
      </DrawerShell>

      {/* Drawer: Policy */}
      <DrawerShell
        open={policyDrawerOpen}
        onClose={() => setPolicyDrawerOpen(false)}
        title={policyMode === 'create' ? 'Thêm chính sách' : 'Sửa chính sách'}
        widthClassName="max-w-lg"
      >
        <div className="space-y-4">
          {policyError && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700">{policyError}</div>}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              savePolicy();
            }}
            className="space-y-5"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Mã chính sách" required>
                <input
                  required
                  className="input-apple font-mono text-xs"
                  value={policyForm.policyCode}
                  onChange={(e) => setPolicyForm((f) => ({ ...f, policyCode: e.target.value }))}
                  placeholder="VD: POL_SALES"
                  disabled={policyMode === 'edit'}
                />
              </Field>
              <Field label="Trạng thái" required>
                <select
                  className="input-apple"
                  value={policyForm.status}
                  onChange={(e) => setPolicyForm((f) => ({ ...f, status: e.target.value as PolicyDefinition['status'] }))}
                >
                  <option value="draft">draft</option>
                  <option value="active">active</option>
                  <option value="inactive">inactive</option>
                </select>
              </Field>
            </div>

            <Field label="Tên chính sách" required>
              <input
                required
                className="input-apple"
                value={policyForm.policyName}
                onChange={(e) => setPolicyForm((f) => ({ ...f, policyName: e.target.value }))}
                placeholder="VD: Thưởng/phạt theo điểm doanh số"
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="KPI gắn chính sách" required>
                <select
                  className="input-apple"
                  value={policyForm.kpiCode}
                  onChange={(e) => setPolicyForm((f) => ({ ...f, kpiCode: e.target.value }))}
                >
                  {activeKpis.map((k) => (
                    <option key={k.id} value={k.kpiCode}>
                      {k.kpiName} ({k.kpiCode})
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Nhóm chính sách" required>
                <input
                  className="input-apple font-mono text-xs"
                  value={policyForm.policyGroupCode}
                  disabled
                />
              </Field>
            </div>

            <Field label="Áp dụng theo cấp nhân sự" required>
              <div className="space-y-2 rounded-2xl border border-black/[0.06] bg-white/70 p-3">
                {STAFF_LEVELS.map((x) => {
                  const checked = policyForm.targetStaffLevelCodes.includes(x.code);
                  return (
                    <label key={x.code} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          const next = e.target.checked
                            ? [...policyForm.targetStaffLevelCodes, x.code]
                            : policyForm.targetStaffLevelCodes.filter((v) => v !== x.code);
                          setPolicyForm((f) => ({ ...f, targetStaffLevelCodes: next as StaffLevelCode[] }));
                        }}
                      />
                      <span>{x.label}</span>
                    </label>
                  );
                })}
              </div>
            </Field>

            <Field label="Phạm vi tổ chức">
              <div className="grid gap-4 sm:grid-cols-2">
                <select
                  className="input-apple"
                  value={policyForm.orgScopeType}
                  onChange={(e) => setPolicyForm((f) => ({ ...f, orgScopeType: e.target.value as any }))}
                >
                  <option value="TENANT">Toàn tập đoàn</option>
                  <option value="ORG_UNIT">Theo phòng ban</option>
                </select>
                <select
                  className="input-apple"
                  value={policyForm.orgUnitId}
                  onChange={(e) => setPolicyForm((f) => ({ ...f, orgUnitId: e.target.value }))}
                  disabled={policyForm.orgScopeType === 'TENANT'}
                >
                  {orgUnits.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.code} — {o.name}
                    </option>
                  ))}
                </select>
              </div>
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Trigger_Source" required>
                <select
                  className="input-apple"
                  value={policyForm.triggerSource}
                  onChange={(e) => setPolicyForm((f) => ({ ...f, triggerSource: e.target.value as TriggerSource }))}
                >
                  {TRIGGER_SOURCES.map((x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Evidence_Required">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={policyForm.evidenceRequired}
                    onChange={(e) => setPolicyForm((f) => ({ ...f, evidenceRequired: e.target.checked }))}
                  />
                  <span>Yêu cầu đính kèm bằng chứng khi đề xuất phạt sự kiện</span>
                </label>
              </Field>
            </div>

            <Field label="Condition_Logic (JSON)" required>
              <textarea
                className="input-apple min-h-[110px] font-mono text-xs"
                value={policyForm.conditionLogicStr}
                onChange={(e) => setPolicyForm((f) => ({ ...f, conditionLogicStr: e.target.value }))}
              />
              <div className="mt-2 text-xs text-xevn-muted">
                Ví dụ: {"{ \"operator\": \"contains\", \"metricKey\": \"route_id\", \"value\": \"RTE-12\" }"}
              </div>
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Incentive_Value">
                <input
                  className="input-apple"
                  type="number"
                  step="1"
                  value={policyForm.incentiveValueStr}
                  onChange={(e) => setPolicyForm((f) => ({ ...f, incentiveValueStr: e.target.value }))}
                />
              </Field>
              <Field label="Penalty_Value">
                <input
                  className="input-apple"
                  type="number"
                  step="1"
                  value={policyForm.penaltyValueStr}
                  onChange={(e) => setPolicyForm((f) => ({ ...f, penaltyValueStr: e.target.value }))}
                />
              </Field>
            </div>

            <Field label="Progressive_Config (JSON)">
              <textarea
                className="input-apple min-h-[90px] font-mono text-xs"
                value={policyForm.progressiveConfigStr}
                onChange={(e) => setPolicyForm((f) => ({ ...f, progressiveConfigStr: e.target.value }))}
              />
            </Field>

            <Field label="Exclusion_Rule (JSON)">
              <textarea
                className="input-apple min-h-[90px] font-mono text-xs"
                value={policyForm.exclusionRuleStr}
                onChange={(e) => setPolicyForm((f) => ({ ...f, exclusionRuleStr: e.target.value }))}
              />
            </Field>

            <Field label="Limit_Zone (JSON)">
              <textarea
                className="input-apple min-h-[90px] font-mono text-xs"
                value={policyForm.limitZoneStr}
                onChange={(e) => setPolicyForm((f) => ({ ...f, limitZoneStr: e.target.value }))}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Hiệu lực từ">
                <input
                  className="input-apple"
                  type="date"
                  value={policyForm.effectiveFrom}
                  onChange={(e) => setPolicyForm((f) => ({ ...f, effectiveFrom: e.target.value }))}
                />
              </Field>
              <Field label="Hiệu lực đến">
                <input
                  className="input-apple"
                  type="date"
                  value={policyForm.effectiveTo}
                  onChange={(e) => setPolicyForm((f) => ({ ...f, effectiveTo: e.target.value }))}
                />
              </Field>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPolicyDrawerOpen(false)}
                className="rounded-xl px-4 py-2 text-sm font-medium text-xevn-muted hover:bg-black/[0.04]"
              >
                Hủy
              </button>
              <button type="submit" className="rounded-xl bg-xevn-primary px-5 py-2 text-sm font-medium text-white shadow-md">
                Lưu chính sách
              </button>
            </div>
          </form>
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

