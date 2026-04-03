import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  CascadeAllocationStatus,
  CascadePeriodType,
  CalculationRun,
  CategoryDefinition,
  CategoryItem,
  KpiAssignment,
  KpiActualValue,
  KpiCascadeAllocationHeader,
  KpiCascadeAllocationLine,
  KpiDefinition,
  MetadataAttribute,
  Period,
  PolicyDefinition,
  PolicyGroup,
  PolicyOrgScope,
  PolicyTariffRange,
  PositionQuotaPolicy,
  OrgUnit,
  RewardPenaltyResult,
  Staff,
  StaffLevelCode,
  Tenant,
} from '@/types';
import {
  seedCategoryDefinitions,
  seedCategoryItems,
  seedCalculationRuns,
  seedKpiActualValues,
  seedKpiCascadeHeaders,
  seedKpiCascadeLines,
  seedKpiDefinitions,
  seedKpiAssignments,
  seedMetadataAttributes,
  seedPeriods,
  seedPolicyGroups,
  seedPolicyTariffRanges,
  seedPolicies,
  seedPositionQuotaPolicies,
  seedOrgUnits,
  seedRewardPenaltyResults,
  seedStaffs,
  seedTenants,
} from './seed';

const STORAGE_KEY = 'x-bos-kpi-waterfall-v1';

interface XbosState {
  tenants: Tenant[];
  orgUnits: OrgUnit[];
  metadataAttributes: MetadataAttribute[];
  categoryDefinitions: CategoryDefinition[];
  categoryItems: CategoryItem[];

  // KPI & Chính sách (mock FE)
  periods: Period[];
  staffs: Staff[];
  kpiDefinitions: KpiDefinition[];
  kpiAssignments: KpiAssignment[];
  kpiCascadeHeaders: KpiCascadeAllocationHeader[];
  kpiCascadeLines: KpiCascadeAllocationLine[];
  positionQuotaPolicies: PositionQuotaPolicy[];
  policyGroups: PolicyGroup[];
  policies: PolicyDefinition[];
  policyTariffRanges: PolicyTariffRange[];
  kpiActualValues: KpiActualValue[];
  calculationRuns: CalculationRun[];
  rewardPenaltyResults: RewardPenaltyResult[];

  /** Tìm kiếm hội tụ — header */
  globalSearch: string;

  setGlobalSearch: (q: string) => void;

  addOrgUnit: (o: Omit<OrgUnit, 'id' | 'updatedAt'> & { id?: string }) => OrgUnit;
  updateOrgUnit: (id: string, patch: Partial<OrgUnit>) => void;
  setOrgParent: (id: string, parentId: string | null) => void;

  addMetadataAttribute: (m: Omit<MetadataAttribute, 'id'> & { id?: string }) => MetadataAttribute;
  updateMetadataAttribute: (id: string, patch: Partial<MetadataAttribute>) => void;

  addCategoryItem: (c: Omit<CategoryItem, 'id'> & { id?: string }) => CategoryItem;
  updateCategoryItem: (id: string, patch: Partial<CategoryItem>) => void;
  removeCategoryItem: (id: string) => void;
  addCategoryDefinition: (d: Omit<CategoryDefinition, 'id'> & { id?: string }) => CategoryDefinition;
  removeCategoryDefinition: (id: string) => void;

  getItemsByCategory: (categoryCode: string, tenantId: string) => CategoryItem[];

  // KPI & Chính sách (mock FE)
  addOrUpdateKpiDefinition: (
    payload: Omit<KpiDefinition, 'id' | 'version' | 'updatedAt' | 'status'> & {
      status?: KpiDefinition['status'];
    }
  ) => KpiDefinition;
  deleteKpiByCode: (tenantId: string, kpiCode: string) => void;

  replaceKpiAssignmentsForPeriod: (
    tenantId: string,
    periodCode: string,
    orgScope: PolicyOrgScope,
    rows: Array<{ staffLevelCode: StaffLevelCode; kpiCode: string }>
  ) => void;
  upsertKpiCascadeHeader: (payload: {
    tenantId: string;
    periodCode: string;
    periodType: CascadePeriodType;
    parentOrgUnitId: string;
    kpiCode: string;
    parentKpiValue: number;
    effectiveDate: string;
  }) => KpiCascadeAllocationHeader;
  replaceKpiCascadeLines: (
    tenantId: string,
    headerId: string,
    mode: 'weight' | 'target',
    rows: Array<{
      staffId: string;
      positionCode: StaffLevelCode;
      allocationWeight: number | null;
      targetValue: number | null;
      workloadPercent: number | null;
    }>
  ) => KpiCascadeAllocationLine[];
  updateKpiCascadeStatus: (
    tenantId: string,
    headerId: string,
    nextStatus: CascadeAllocationStatus
  ) => void;

  addPolicyGroup: (payload: Omit<PolicyGroup, 'id'> & { id?: string }) => PolicyGroup;
  updatePolicyGroup: (id: string, patch: Partial<PolicyGroup>) => void;
  deletePolicyGroup: (id: string) => void;

  addOrUpdatePolicyDefinition: (
    payload: Omit<PolicyDefinition, 'id' | 'version' | 'updatedAt' | 'status'> & {
      status?: PolicyDefinition['status'];
    }
  ) => PolicyDefinition;
  deletePolicyByCode: (tenantId: string, policyCode: string) => void;

  replacePolicyTariffRanges: (
    tenantId: string,
    policyCode: string,
    policyVersion: number,
    ranges: Array<
      Omit<PolicyTariffRange, 'id' | 'tenantId' | 'policyCode' | 'policyVersion' | 'updatedAt'>
    >
  ) => void;

  upsertKpiActualValue: (payload: Omit<KpiActualValue, 'id' | 'updatedAt'>) => KpiActualValue;
  seedMockKpiActualValuesForPeriod: (tenantId: string, periodCode: string) => void;

  runRewardPenaltyCalc: (tenantId: string, periodCode: string) => CalculationRun;
  recalcRewardPenalty: (tenantId: string, periodCode: string) => CalculationRun;

  reset: () => void;
}

function nowIso() {
  return new Date().toISOString();
}

function genId() {
  return crypto.randomUUID();
}

const initialState = {
  tenants: seedTenants,
  orgUnits: seedOrgUnits,
  metadataAttributes: seedMetadataAttributes,
  categoryDefinitions: seedCategoryDefinitions,
  categoryItems: seedCategoryItems,

  periods: seedPeriods,
  staffs: seedStaffs,
  kpiDefinitions: seedKpiDefinitions,
  kpiAssignments: seedKpiAssignments,
  kpiCascadeHeaders: seedKpiCascadeHeaders,
  kpiCascadeLines: seedKpiCascadeLines,
  positionQuotaPolicies: seedPositionQuotaPolicies,
  policyGroups: seedPolicyGroups,
  policies: seedPolicies,
  policyTariffRanges: seedPolicyTariffRanges,
  kpiActualValues: seedKpiActualValues,
  calculationRuns: seedCalculationRuns,
  rewardPenaltyResults: seedRewardPenaltyResults,

  globalSearch: '',
};

export const useXbosStore = create<XbosState>()(
  persist(
    (set, get) => ({
      ...initialState,
      globalSearch: '',

      setGlobalSearch: (q) => set({ globalSearch: q }),

      addOrgUnit: (o) => {
        const row: OrgUnit = {
          ...o,
          id: o.id ?? genId(),
          updatedAt: nowIso(),
        };
        set((s) => ({ orgUnits: [...s.orgUnits, row] }));
        return row;
      },

      updateOrgUnit: (id, patch) =>
        set((s) => ({
          orgUnits: s.orgUnits.map((u) =>
            u.id === id ? { ...u, ...patch, updatedAt: nowIso() } : u
          ),
        })),

      setOrgParent: (id, parentId) => {
        const { orgUnits } = get();
        if (parentId && wouldCreateCycle(orgUnits, id, parentId)) {
          throw new Error('ORG_CYCLE_DETECTED');
        }
        get().updateOrgUnit(id, { parentId });
      },

      addMetadataAttribute: (m) => {
        const row: MetadataAttribute = {
          ...m,
          id: m.id ?? genId(),
        };
        set((s) => ({ metadataAttributes: [...s.metadataAttributes, row] }));
        return row;
      },

      updateMetadataAttribute: (id, patch) =>
        set((s) => ({
          metadataAttributes: s.metadataAttributes.map((x) =>
            x.id === id ? { ...x, ...patch } : x
          ),
        })),

      addCategoryItem: (c) => {
        const row: CategoryItem = {
          ...c,
          id: c.id ?? genId(),
        };
        set((s) => ({ categoryItems: [...s.categoryItems, row] }));
        return row;
      },

      updateCategoryItem: (id, patch) =>
        set((s) => ({
          categoryItems: s.categoryItems.map((x) =>
            x.id === id ? { ...x, ...patch } : x
          ),
        })),

      removeCategoryItem: (id) =>
        set((s) => ({
          categoryItems: s.categoryItems.filter((x) => x.id !== id),
        })),

      addCategoryDefinition: (d) => {
        const row: CategoryDefinition = {
          ...d,
          id: d.id ?? genId(),
        };
        set((s) => ({ categoryDefinitions: [...s.categoryDefinitions, row] }));
        return row;
      },

      removeCategoryDefinition: (id) => {
        const def = get().categoryDefinitions.find((d) => d.id === id);
        if (!def) return;
        set((s) => ({
          categoryDefinitions: s.categoryDefinitions.filter((d) => d.id !== id),
          categoryItems: s.categoryItems.filter((i) => i.categoryCode !== def.code),
        }));
      },

      getItemsByCategory: (categoryCode, tenantId) =>
        get().categoryItems.filter(
          (i) => i.categoryCode === categoryCode && i.tenantId === tenantId
        ),

      // =========================
      // KPI & Chính sách (mock FE)
      // =========================

      addOrUpdateKpiDefinition: (payload) => {
        const status: KpiDefinition['status'] = payload.status ?? 'active';
        const tenantId = payload.tenantId;
        const kpiCode = payload.kpiCode.trim().toUpperCase();

        const existing = get().kpiDefinitions.filter(
          (k) => k.tenantId === tenantId && k.kpiCode === kpiCode
        );
        const maxVersion = existing.reduce((m, x) => Math.max(m, x.version), 0);
        const version = maxVersion + 1;

        const row: KpiDefinition = {
          id: genId(),
          ...payload,
          kpiCode,
          version,
          status,
          formulaSpec: payload.formulaSpec ?? {},
          updatedAt: nowIso(),
        };

        set((s) => {
          const kpiDefinitions = s.kpiDefinitions.map((k) => {
            if (k.tenantId !== tenantId || k.kpiCode !== kpiCode) return k;
            if (status === 'active') {
              return { ...k, status: 'inactive' as KpiDefinition['status'] };
            }
            return k;
          });
          return { kpiDefinitions: [...kpiDefinitions, row] };
        });

        return row;
      },

      deleteKpiByCode: (tenantId, kpiCode) => {
        const code = kpiCode.trim().toUpperCase();
        set((s) => {
          const kpiDefinitions = s.kpiDefinitions.filter(
            (k) => !(k.tenantId === tenantId && k.kpiCode === code)
          );
          const kpiActualValues = s.kpiActualValues.filter(
            (a) => !(a.tenantId === tenantId && a.kpiCode === code)
          );

          const policiesToDelete = s.policies
            .filter((p) => p.tenantId === tenantId && p.kpiCode === code)
            .map((p) => p.policyCode);

          const policyCodes = Array.from(new Set(policiesToDelete));

          const policies = s.policies.filter(
            (p) => !(p.tenantId === tenantId && policyCodes.includes(p.policyCode))
          );
          const policyTariffRanges = s.policyTariffRanges.filter(
            (t) => !(t.tenantId === tenantId && policyCodes.includes(t.policyCode))
          );
          const rewardPenaltyResults = s.rewardPenaltyResults.filter(
            (r) => !(r.tenantId === tenantId && policyCodes.includes(r.policyCode))
          );
          const calculationRuns = s.calculationRuns.filter((run) => {
            // giữ run tổng; FE chỉ hiển thị kết quả theo trạng thái mới
            return run.tenantId === tenantId ? true : true;
          });

          return {
            kpiDefinitions,
            kpiActualValues,
            policies,
            policyTariffRanges,
            rewardPenaltyResults,
            calculationRuns,
          };
        });
      },

      replaceKpiAssignmentsForPeriod: (tenantId, periodCode, orgScope, rows) => {
        const code = periodCode.trim();
        const normalized = rows
          .map((r) => ({
            staffLevelCode: r.staffLevelCode,
            kpiCode: r.kpiCode.trim().toUpperCase(),
          }))
          .filter((r) => !!r.kpiCode);

        const uniq = Array.from(
          new Map(
            normalized.map((r) => [`${r.staffLevelCode}::${r.kpiCode}`, r] as const)
          ).values()
        );

        set((s) => {
          const kpiAssignments = s.kpiAssignments.filter((a) => {
            if (a.tenantId !== tenantId || a.periodCode !== code) return true;
            // Chỉ xóa những assignment thuộc cùng một phạm vi orgScope (để UI có thể chỉnh từng nhánh).
            const aScope = a.orgScope ?? { scopeType: 'TENANT' as const };
            if (aScope.scopeType !== orgScope.scopeType) return true;
            if (orgScope.scopeType === 'TENANT') return false;
            return aScope.orgUnitId !== orgScope.orgUnitId;
          });
          const toAdd: KpiAssignment[] = uniq.map((r) => ({
            id: genId(),
            tenantId,
            periodCode: code,
            staffLevelCode: r.staffLevelCode,
            kpiCode: r.kpiCode,
            orgScope,
            updatedAt: nowIso(),
          }));
          return { kpiAssignments: kpiAssignments.concat(toAdd) };
        });
      },

      upsertKpiCascadeHeader: (payload) => {
        if (!(payload.parentKpiValue > 0)) {
          throw new Error('CA-VAL-001: Giá trị KPI cấp cha phải lớn hơn 0.');
        }
        const kpi = get()
          .kpiDefinitions
          .filter(
            (k) =>
              k.tenantId === payload.tenantId &&
              k.kpiCode === payload.kpiCode &&
              k.status === 'active'
          )
          .sort((a, b) => b.version - a.version)[0];
        if (!kpi) {
          throw new Error('CA-VAL-KPI: KPI không tồn tại hoặc chưa active.');
        }
        if (!effectiveDateMatchesKpi(payload.effectiveDate, kpi.effectiveFrom, kpi.effectiveTo)) {
          throw new Error('CA-VAL-005: Ngày hiệu lực phải nằm trong khoảng hiệu lực của KPI cha.');
        }

        const existing = get().kpiCascadeHeaders.find(
          (h) =>
            h.tenantId === payload.tenantId &&
            h.periodCode === payload.periodCode &&
            h.periodType === payload.periodType &&
            h.parentOrgUnitId === payload.parentOrgUnitId &&
            h.kpiCode === payload.kpiCode
        );

        const nextRow: KpiCascadeAllocationHeader = {
          id: existing?.id ?? genId(),
          tenantId: payload.tenantId,
          periodCode: payload.periodCode,
          periodType: payload.periodType,
          parentOrgUnitId: payload.parentOrgUnitId,
          kpiCode: payload.kpiCode.trim().toUpperCase(),
          parentKpiValue: payload.parentKpiValue,
          effectiveDate: payload.effectiveDate,
          status: existing?.status ?? 'draft',
          updatedAt: nowIso(),
        };

        set((s) => ({
          kpiCascadeHeaders: existing
            ? s.kpiCascadeHeaders.map((h) => (h.id === existing.id ? nextRow : h))
            : s.kpiCascadeHeaders.concat(nextRow),
        }));
        return nextRow;
      },

      replaceKpiCascadeLines: (tenantId, headerId, mode, rows) => {
        const header = get().kpiCascadeHeaders.find((h) => h.id === headerId && h.tenantId === tenantId);
        if (!header) throw new Error('CA-HDR-404: Không tìm thấy bản phân bổ.');
        if (header.status === 'frozen') {
          throw new Error('CA-VAL-006: Dữ liệu đã khóa, không thể chỉnh sửa.');
        }
        const staffs = get().staffs.filter((s) => s.tenantId === tenantId);
        const headerKpi = get().kpiDefinitions
          .filter((k) => k.tenantId === tenantId && k.kpiCode === header.kpiCode && k.status === 'active')
          .sort((a, b) => b.version - a.version)[0];
        if (!headerKpi) throw new Error('IKPI-VAL-003: Không tìm thấy KPI cha active.');

        const normalized = rows
          .filter((r) => !!r.staffId)
          .map((r) => {
            const st = staffs.find((s) => s.id === r.staffId);
            if (!st) throw new Error('IKPI-DATA-001: Không tìm thấy nhân sự trong Org Engine.');
            if (st.orgUnitId !== header.parentOrgUnitId) {
              throw new Error('IKPI-AUTH-001: Nhân sự không thuộc nút tổ chức hiện tại.');
            }
            if (st.levelCode !== r.positionCode) {
              throw new Error('IKPI-VAL-003: Chức vụ nhân sự không khớp positionCode dòng phân bổ.');
            }
            if (mode === 'weight') {
              const w = Number(r.allocationWeight ?? 0);
              if (!(w > 0)) throw new Error('CA-VAL-002: Tỷ trọng phân bổ phải là số dương.');
              const tv = Number((header.parentKpiValue * w).toFixed(4));
              const wp = r.workloadPercent == null ? 100 : Number(r.workloadPercent);
              if (!(wp > 0)) throw new Error('IKPI-MATRIX-001: Workload percent phải lớn hơn 0.');
              return {
                staffId: r.staffId,
                positionCode: r.positionCode,
                allocationWeight: w,
                targetValue: tv,
                workloadPercent: wp,
              };
            }
            const tv = Number(r.targetValue ?? 0);
            if (!(tv > 0)) throw new Error('CA-VAL-003: Chỉ tiêu phân bổ phải lớn hơn 0.');
            const wp = r.workloadPercent == null ? 100 : Number(r.workloadPercent);
            if (!(wp > 0)) throw new Error('IKPI-MATRIX-001: Workload percent phải lớn hơn 0.');
            return {
              staffId: r.staffId,
              positionCode: r.positionCode,
              allocationWeight: r.allocationWeight ?? null,
              targetValue: tv,
              workloadPercent: wp,
            };
          });

        // Rule kiêm nhiệm: nếu 1 nhân sự có nhiều dòng thì tổng workload phải = 100%.
        const workloadByStaff = new Map<string, number>();
        normalized.forEach((r) => {
          const cur = workloadByStaff.get(r.staffId) ?? 0;
          workloadByStaff.set(r.staffId, cur + (r.workloadPercent ?? 0));
        });
        for (const [staffId, total] of workloadByStaff.entries()) {
          const count = normalized.filter((x) => x.staffId === staffId).length;
          if (count > 1 && Math.abs(total - 100) > 0.0001) {
            throw new Error('IKPI-MATRIX-001: Tổng % công việc theo chức danh của nhân sự kiêm nhiệm phải bằng 100%.');
          }
        }

        // Quota theo chức danh: tổng target theo position không vượt trần.
        const sumByPosition = new Map<StaffLevelCode, number>();
        normalized.forEach((r) => {
          const cur = sumByPosition.get(r.positionCode) ?? 0;
          sumByPosition.set(r.positionCode, cur + r.targetValue);
        });
        for (const [pos, posTarget] of sumByPosition.entries()) {
          const quota = get().positionQuotaPolicies.find(
            (q) =>
              q.tenantId === tenantId &&
              q.positionCode === pos &&
              q.kpiCode === header.kpiCode &&
              q.periodType === header.periodType
          );
          if (quota && posTarget > quota.quotaCeiling + 1e-9) {
            throw new Error('IKPI-QUOTA-001: Tổng Target theo chức danh đã vượt mức trần quota cho phép.');
          }
        }

        const nextLines = normalized.map<KpiCascadeAllocationLine>((r) => ({
          id: genId(),
          tenantId,
          headerId,
          assigneeType: 'STAFF',
          assigneeId: r.staffId,
          positionCode: r.positionCode,
          allocationWeight: r.allocationWeight,
          targetValue: r.targetValue,
          workloadPercent: r.workloadPercent,
          updatedAt: nowIso(),
        }));

        set((s) => ({
          kpiCascadeLines: s.kpiCascadeLines
            .filter((l) => !(l.tenantId === tenantId && l.headerId === headerId))
            .concat(nextLines),
          kpiCascadeHeaders: s.kpiCascadeHeaders.map((h) =>
            h.id === headerId ? { ...h, status: 'draft', updatedAt: nowIso() } : h
          ),
        }));
        return nextLines;
      },

      updateKpiCascadeStatus: (tenantId, headerId, nextStatus) => {
        const header = get().kpiCascadeHeaders.find((h) => h.id === headerId && h.tenantId === tenantId);
        if (!header) throw new Error('CA-HDR-404: Không tìm thấy bản phân bổ.');
        const lines = get().kpiCascadeLines.filter((l) => l.tenantId === tenantId && l.headerId === headerId);

        if ((nextStatus === 'pending_approval' || nextStatus === 'approved' || nextStatus === 'frozen') && lines.length === 0) {
          throw new Error('CA-STATE-001: Không thể chuyển trạng thái khi chưa có dòng phân bổ.');
        }
        if (header.status === 'frozen' && nextStatus !== 'frozen') {
          throw new Error('CA-VAL-006: Dữ liệu đã khóa, không thể thay đổi trạng thái.');
        }

        set((s) => ({
          kpiCascadeHeaders: s.kpiCascadeHeaders.map((h) =>
            h.id === headerId ? { ...h, status: nextStatus, updatedAt: nowIso() } : h
          ),
        }));
      },

      addPolicyGroup: (payload) => {
        const row: PolicyGroup = {
          ...payload,
          id: payload.id ?? genId(),
          policyGroupCode: payload.policyGroupCode.trim().toUpperCase(),
          policyGroupName: payload.policyGroupName.trim(),
        };
        set((s) => ({ policyGroups: [...s.policyGroups, row] }));
        return row;
      },

      updatePolicyGroup: (id, patch) => {
        set((s) => ({
          policyGroups: s.policyGroups.map((g) => (g.id === id ? { ...g, ...patch } : g)),
        }));
      },

      deletePolicyGroup: (id) => {
        const group = get().policyGroups.find((g) => g.id === id);
        if (!group) return;
        set((s) => {
          const policyGroups = s.policyGroups.filter((g) => g.id !== id);
          const policyCodes = Array.from(
            new Set(
              s.policies
                .filter((p) => p.policyGroupCode === group.policyGroupCode)
                .map((p) => p.policyCode)
            )
          );
          const policies = s.policies.filter((p) => p.policyGroupCode !== group.policyGroupCode);
          const policyTariffRanges = s.policyTariffRanges.filter((t) => !policyCodes.includes(t.policyCode));
          const rewardPenaltyResults = s.rewardPenaltyResults.filter((r) => !policyCodes.includes(r.policyCode));
          return { policyGroups, policies, policyTariffRanges, rewardPenaltyResults };
        });
      },

      addOrUpdatePolicyDefinition: (payload) => {
        const status: PolicyDefinition['status'] = payload.status ?? 'active';
        const tenantId = payload.tenantId;
        const policyCode = payload.policyCode.trim().toUpperCase();
        const policyName = payload.policyName.trim();

        const existing = get().policies.filter(
          (p) => p.tenantId === tenantId && p.policyCode === policyCode
        );
        const maxVersion = existing.reduce((m, x) => Math.max(m, x.version), 0);
        const version = maxVersion + 1;

        const row: PolicyDefinition = {
          id: genId(),
          ...payload,
          policyCode,
          policyName,
          version,
          status,
          updatedAt: nowIso(),
        };

        set((s) => {
          // bump version => nếu active thì deactive các version cũ
          const policies = s.policies.map((p) => {
            if (p.tenantId !== tenantId || p.policyCode !== policyCode) return p;
            if (status === 'active') return { ...p, status: 'inactive' as PolicyDefinition['status'] };
            return p;
          });

          const newPolicies = [...policies, row];

          // clone tariff ranges từ version mới nhất trước đó (để UI không bị trống)
          if (status === 'active' && existing.length > 0) {
            const prevVersion = existing.reduce((m, x) => Math.max(m, x.version), 0);
            const prevTariffs = s.policyTariffRanges.filter(
              (t) => t.tenantId === tenantId && t.policyCode === policyCode && t.policyVersion === prevVersion
            );

            const clonedTariffs: PolicyTariffRange[] = prevTariffs.map((t) => ({
              ...t,
              id: genId(),
              policyVersion: version,
              updatedAt: nowIso(),
            }));

            const policyTariffRanges = [
              ...s.policyTariffRanges.filter(
                (t) =>
                  !(t.tenantId === tenantId && t.policyCode === policyCode && t.policyVersion === version)
              ),
              ...clonedTariffs,
            ];

            return { policies: newPolicies, policyTariffRanges };
          }

          return { policies: newPolicies };
        });

        return row;
      },

      deletePolicyByCode: (tenantId, policyCode) => {
        const code = policyCode.trim().toUpperCase();
        set((s) => ({
          policies: s.policies.filter((p) => !(p.tenantId === tenantId && p.policyCode === code)),
          policyTariffRanges: s.policyTariffRanges.filter(
            (t) => !(t.tenantId === tenantId && t.policyCode === code)
          ),
          rewardPenaltyResults: s.rewardPenaltyResults.filter(
            (r) => !(r.tenantId === tenantId && r.policyCode === code)
          ),
        }));
      },

      replacePolicyTariffRanges: (tenantId, policyCode, policyVersion, ranges) => {
        const code = policyCode.trim().toUpperCase();

        // validate
        const safeRanges = ranges.map((r) => ({
          ...r,
          rewardAmount: Number(r.rewardAmount),
          penaltyAmount: Number(r.penaltyAmount),
          penaltyForms: (r.penaltyForms ?? []).map((pf) => ({
            ...pf,
            value: Number(pf.value),
          })),
        }));
        const currency = safeRanges[0]?.currencyCode;
        if (!currency) throw new Error('TARIFF_CURRENCY_MISSING');
        if (safeRanges.some((r) => r.currencyCode !== currency)) throw new Error('TARIFF_CURRENCY_MISMATCH');

        for (const r of safeRanges) {
          if (r.rewardAmount < 0 || r.penaltyAmount < 0) throw new Error('TARIFF_AMOUNT_INVALID');
          if (r.fromValue != null && r.toValue != null && r.fromValue > r.toValue) {
            throw new Error('TARIFF_RANGE_INVALID');
          }
        }

        const sorted = [...safeRanges].sort((a, b) => {
          const av = a.fromValue ?? Number.NEGATIVE_INFINITY;
          const bv = b.fromValue ?? Number.NEGATIVE_INFINITY;
          return av - bv;
        });

        for (let i = 1; i < sorted.length; i++) {
          const prev = sorted[i - 1];
          const cur = sorted[i];
          const prevTo = prev.toValue ?? Number.POSITIVE_INFINITY;
          const curFrom = cur.fromValue ?? Number.NEGATIVE_INFINITY;
          if (curFrom < prevTo) {
            throw new Error('TARIFF_OVERLAP');
          }
        }

        set((s) => {
          const policyTariffRanges = s.policyTariffRanges
            .filter(
              (t) =>
                !(
                  t.tenantId === tenantId &&
                  t.policyCode === code &&
                  t.policyVersion === policyVersion
                )
            )
            .concat(
              sorted.map((r) => ({
                id: genId(),
                tenantId,
                policyCode: code,
                policyVersion,
                currencyCode: r.currencyCode,
                fromValue: r.fromValue,
                toValue: r.toValue,
                rewardAmount: r.rewardAmount,
                penaltyAmount: r.penaltyAmount,
                penaltyForms: r.penaltyForms,
                note: r.note,
                updatedAt: nowIso(),
              }))
            );
          return { policyTariffRanges };
        });
      },

      upsertKpiActualValue: (payload) => {
        const row: Omit<KpiActualValue, 'id' | 'updatedAt'> = {
          ...payload,
          kpiCode: payload.kpiCode.trim().toUpperCase(),
        };

        set((s) => {
          const existing = s.kpiActualValues.find(
            (a) =>
              a.tenantId === row.tenantId &&
              a.periodCode === row.periodCode &&
              a.staffId === row.staffId &&
              a.kpiCode === row.kpiCode
          );
          if (existing) {
            const kpiActualValues = s.kpiActualValues.map((a) =>
              a.id === existing.id ? { ...a, value: row.value, updatedAt: nowIso() } : a
            );
            return { kpiActualValues };
          }

          const kpiActualValues = s.kpiActualValues.concat({
            id: genId(),
            ...row,
            updatedAt: nowIso(),
          });
          return { kpiActualValues };
        });

        // return row hiện tại
        const after = get().kpiActualValues.find(
          (a) =>
            a.tenantId === row.tenantId &&
            a.periodCode === row.periodCode &&
            a.staffId === row.staffId &&
            a.kpiCode === row.kpiCode
        );
        if (!after) throw new Error('KPI_ACTUAL_UPSERT_FAILED');
        return after;
      },

      seedMockKpiActualValuesForPeriod: (tenantId, periodCode) => {
        const code = periodCode.trim();
        const staffList = get().staffs.filter((s) => s.tenantId === tenantId);

        const assigned = get().kpiAssignments.filter((a) => a.tenantId === tenantId && a.periodCode === code);

        set((s) => {
          let next = s.kpiActualValues.slice();
          const now = nowIso();

          for (const st of staffList) {
            // KpiSet được suy ra từ cả cấp + phạm vi orgScope của assignment.
            const kpiSet = new Set<string>();
            for (const a of assigned) {
              if (a.staffLevelCode !== st.levelCode) continue;
              const aScope = a.orgScope ?? { scopeType: 'TENANT' as const };
              if (!policyOrgScopeMatches(s.orgUnits, st.orgUnitId, aScope)) continue;
              kpiSet.add(a.kpiCode);
            }
            for (const kpiCode of kpiSet) {
              // Nếu KPI được gán nhưng chưa có policy active cho cấp này thì vẫn seed để UI test, calc sẽ fail.
              const kpiPolicyApplies = s.policies.some(
                (p) =>
                  p.tenantId === tenantId &&
                  p.status === 'active' &&
                  p.kpiCode === kpiCode &&
                  p.targetStaffLevelCodes.includes(st.levelCode)
              );
              if (!kpiPolicyApplies) continue;

              const value = Math.round(20 + Math.random() * 80); // 20..100 để có thưởng/phạt rõ ràng
              const existing = next.find(
                (a) =>
                  a.tenantId === tenantId &&
                  a.periodCode === code &&
                  a.staffId === st.id &&
                  a.kpiCode === kpiCode
              );

              if (existing) {
                next = next.map((a) =>
                  a.id === existing.id ? { ...a, value, updatedAt: now } : a
                );
              } else {
                next = next.concat({
                  id: genId(),
                  tenantId,
                  periodCode: code,
                  staffId: st.id,
                  kpiCode,
                  value,
                  updatedAt: now,
                });
              }
            }
          }

          return { kpiActualValues: next };
        });
      },

      runRewardPenaltyCalc: (tenantId, periodCode) => {
        const period = get().periods.find((p) => p.tenantId === tenantId && p.periodCode === periodCode);
        if (!period) throw new Error('PERIOD_NOT_FOUND');

        const periodStart = new Date(period.startDate);
        const periodEnd = new Date(period.endDate);

        const activePolicies = get().policies.filter((p) => {
          if (p.tenantId !== tenantId) return false;
          if (p.status !== 'active') return false;
          if (!effectiveMatchesPeriod(p.effectiveFrom, p.effectiveTo, periodStart, periodEnd)) return false;
          return true;
        });

        const tariffsByPolicyVersion = new Map<string, PolicyTariffRange[]>();
        for (const t of get().policyTariffRanges) {
          if (t.tenantId !== tenantId) continue;
          const key = `${t.policyCode}::${t.policyVersion}`;
          const list = tariffsByPolicyVersion.get(key) ?? [];
          list.push(t);
          tariffsByPolicyVersion.set(key, list);
        }

        const staffList = get().staffs.filter((s) => s.tenantId === tenantId);

        let totalReward = 0;
        let totalPenalty = 0;
        let successCount = 0;
        let failureCount = 0;
        const runId = genId();
        const now = nowIso();

        const results: RewardPenaltyResult[] = [];

        for (const st of staffList) {
          const applicablePolicies = activePolicies.filter((p) => {
            if (!p.targetStaffLevelCodes.includes(st.levelCode)) return false;
            if (!policyOrgScopeMatches(get().orgUnits, st.orgUnitId, p.orgScope)) return false;
            return true;
          });

          let anyResultForStaff = false;

          for (const pol of applicablePolicies) {
            const assigned = get().kpiAssignments.some(
              (a) =>
                a.tenantId === tenantId &&
                a.periodCode === periodCode &&
                a.staffLevelCode === st.levelCode &&
                a.kpiCode === pol.kpiCode &&
                policyOrgScopeMatches(get().orgUnits, st.orgUnitId, a.orgScope ?? { scopeType: 'TENANT' as const })
            );
            if (!assigned) continue;

            const kpiActual = get().kpiActualValues.find(
              (a) =>
                a.tenantId === tenantId &&
                a.periodCode === periodCode &&
                a.staffId === st.id &&
                a.kpiCode === pol.kpiCode
            );
            if (!kpiActual) {
              failureCount++;
              continue;
            }

            const tariffs = tariffsByPolicyVersion.get(`${pol.policyCode}::${pol.version}`) ?? [];
            if (tariffs.length === 0) {
              failureCount++;
              continue;
            }

            const match = findTariffMatch(tariffs, kpiActual.value);
            if (!match) {
              failureCount++;
              continue;
            }

            anyResultForStaff = true;
            totalReward += match.rewardAmount;
            totalPenalty += match.penaltyAmount;
            results.push({
              id: genId(),
              tenantId,
              runId,
              periodCode,
              staffId: st.id,
              policyCode: pol.policyCode,
              policyVersion: pol.version,
              kpiCode: pol.kpiCode,
              kpiActualValue: kpiActual.value,
              rewardAmount: match.rewardAmount,
              penaltyAmount: match.penaltyAmount,
              penaltyForms: match.penaltyForms,
              createdAt: now,
            });
          }

          if (anyResultForStaff) successCount++;
        }

        const run: CalculationRun = {
          id: runId,
          tenantId,
          periodCode,
          createdAt: now,
          status: 'final',
          totalReward,
          totalPenalty,
          successCount,
          failureCount,
        };

        set((s) => ({
          calculationRuns: s.calculationRuns.concat(run),
          rewardPenaltyResults: s.rewardPenaltyResults.concat(results),
        }));

        return run;
      },

      recalcRewardPenalty: (tenantId, periodCode) => {
        // Xóa kết quả cũ theo kỳ rồi chạy lại
        set((s) => ({
          calculationRuns: s.calculationRuns.filter((r) => !(r.tenantId === tenantId && r.periodCode === periodCode)),
          rewardPenaltyResults: s.rewardPenaltyResults.filter(
            (x) => !(x.tenantId === tenantId && x.periodCode === periodCode)
          ),
        }));
        return get().runRewardPenaltyCalc(tenantId, periodCode);
      },

      reset: () => set({ ...initialState, globalSearch: '' }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        tenants: s.tenants,
        orgUnits: s.orgUnits,
        metadataAttributes: s.metadataAttributes,
        categoryDefinitions: s.categoryDefinitions,
        categoryItems: s.categoryItems,

        periods: s.periods,
        staffs: s.staffs,
        kpiDefinitions: s.kpiDefinitions,
        kpiAssignments: s.kpiAssignments,
        kpiCascadeHeaders: s.kpiCascadeHeaders,
        kpiCascadeLines: s.kpiCascadeLines,
        positionQuotaPolicies: s.positionQuotaPolicies,
        policyGroups: s.policyGroups,
        policies: s.policies,
        policyTariffRanges: s.policyTariffRanges,
        kpiActualValues: s.kpiActualValues,
        calculationRuns: s.calculationRuns,
        rewardPenaltyResults: s.rewardPenaltyResults,
      }),
    }
  )
);

/** DFS: id không được là tổ tiên của parentId */
function wouldCreateCycle(
  units: OrgUnit[],
  id: string,
  newParentId: string
): boolean {
  let cur: string | null = newParentId;
  const byId = new Map(units.map((u) => [u.id, u]));
  while (cur) {
    if (cur === id) return true;
    cur = byId.get(cur)?.parentId ?? null;
  }
  return false;
}

function effectiveMatchesPeriod(
  effectiveFrom: string | null,
  effectiveTo: string | null,
  periodStart: Date,
  periodEnd: Date
): boolean {
  // overlap giữa [effectiveFrom, effectiveTo] và [periodStart, periodEnd]
  const fromTime = effectiveFrom ? new Date(effectiveFrom).getTime() : null;
  const toTime = effectiveTo ? new Date(effectiveTo).getTime() : null;

  const effectiveFromOk = fromTime == null ? true : fromTime <= periodEnd.getTime();
  const effectiveToOk = toTime == null ? true : toTime >= periodStart.getTime();
  return effectiveFromOk && effectiveToOk;
}

function effectiveDateMatchesKpi(
  effectiveDate: string,
  kpiEffectiveFrom: string | null,
  kpiEffectiveTo: string | null
): boolean {
  const d = new Date(effectiveDate).getTime();
  if (!Number.isFinite(d)) return false;
  const from = kpiEffectiveFrom ? new Date(kpiEffectiveFrom).getTime() : null;
  const to = kpiEffectiveTo ? new Date(kpiEffectiveTo).getTime() : null;
  if (from != null && d < from) return false;
  if (to != null && d > to) return false;
  return true;
}

function policyOrgScopeMatches(
  orgUnits: OrgUnit[],
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

function findTariffMatch(ranges: PolicyTariffRange[], value: number): PolicyTariffRange | null {
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
