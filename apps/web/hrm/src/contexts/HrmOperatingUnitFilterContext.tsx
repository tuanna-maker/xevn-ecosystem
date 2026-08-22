/**
 * @CODE-MEMORY
 * Screen:     HRM embed — Đơn vị thành viên filter state
 * UC:         BM-AC-02 · AC-CD-F3-03 · U39 operating units
 * BR:         BR-CD-F3-03 — OU filter ≠ JWT company mutate
 * SRS:        docs/decisions/ADR-HRM-RBAC-SCOPE-LADDER.md §3 / U39
 * TechSpec:   HrmOperatingUnitFilter.tsx BM-AC-02 / AC-CD-F3-03
 * Purpose:    Group CEO OU selection for list query scope; fetch operating-units;
 *             keepPreviousData + scoped invalidate so embed dropdown không fail-closed [].
 * WorkItem:   D-HRM-OU-FILTER-EMBED-01
 * Coded:      2026-07-27
 * Callers:    HrmOperatingUnitFilter · list hooks via listCompanyId / Auth currentCompanyId
 * Callees:    fetchHrmOperatingUnits · portalAuthBridge · react-query
 * must_keep:  Không mutate JWT companyId; chỉ setCurrentCompanyId query scope
 * SOLID:      Context owns filter state; presentational chip in HrmOperatingUnitFilter
 * LastVerified: HrmOperatingUnitFilterContext.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-27 D-HRM-OU-FILTER-EMBED-01
 * what: keepPreviousData, refetchOnWindowFocus false, portal session gate, scoped invalidate, coerce slug
 * why: CC embed — invalidateQueries() + fail-closed [] làm Select chỉ còn «Tất cả»
 * must_keep: member compact chip; OU không đụng JWT
 *
 * @CODE-MEMORY-CHANGE 2026-08-22
 * WorkItem: SA-HRM-TENANT-ONLY-SCOPE-01
 * change_mode: SPEC_ACK · DEPRECATE scheduled Phase 3
 * What: OU filter context superseded by portal GlobalFilterContext tenant switcher;
 *       list scope will use tenant_id not company_id=trsport|logistics.
 * Why:  ADR-HRM-TENANT-ONLY-SCOPE — bỏ OU; tenant_id partition + phân quyền.
 * Ref:  docs/program/specs/SA-HRM-TENANT-ONLY-SCOPE-SPEC-01.md Phase 3 P3-1
 * must_keep: Không mutate JWT companyId until FE WI HRM-TENANT-ONLY-SCOPE-FE-01
 *
 * @CODE-MEMORY-CHANGE 2026-08-22
 * WorkItem: HRM-TENANT-ONLY-SCOPE-FE-01
 * change_mode: UPGRADE
 * What: FE tenant-only — operating-units API returns tenant_id rows when BE flag ON;
 *       hrmListScope accepts tenant ids in filter (VITE_HRM_TENANT_ONLY_SCOPE).
 * Why:  Phase 3 — bỏ OU slug filter; dropdown shows công ty theo tenant_id.
 * Ref:  SA-HRM-TENANT-ONLY-SCOPE-SPEC-01.md Phase 3
 * must_keep: listCompanyId still via resolveHrmOperatingUnitQueryCompanyId; no JWT mutate
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getHrmPortalMode } from '@/lib/hrmPortalMode';
import {
  buildOperatingUnitLabelMap,
  fetchHrmOperatingUnits,
  readStoredOperatingUnitFilter,
  resolveHrmOperatingUnitQueryCompanyId,
  writeStoredOperatingUnitFilter,
  type HrmOperatingUnitRow,
  type HrmOperatingUnitSlug,
} from '@/lib/hrmOperatingUnits';
import { HRM_MASTER_TENANT_ID } from '@/lib/hrmListScope';
import { getPortalJwtTenantId } from '@/lib/hrmSpreadsheetScope';
import {
  hasPortalSession,
  PORTAL_SESSION_READY_EVENT,
} from '@/lib/portalAuthBridge';

export type OperatingUnitFilterSelection = 'all' | HrmOperatingUnitSlug;

type HrmOperatingUnitFilterContextValue = {
  showFilter: boolean;
  units: HrmOperatingUnitRow[];
  unitsLoading: boolean;
  operatingUnitLabelMap: Map<string, string>;
  selectedSlug: OperatingUnitFilterSelection;
  listCompanyId: string;
  setSelectedSlug: (slug: OperatingUnitFilterSelection) => void;
};

const HrmOperatingUnitFilterContext = createContext<HrmOperatingUnitFilterContextValue | undefined>(
  undefined,
);

const FILTER_HIDDEN_PATH_PREFIXES = ['/settings', '/company'];

export const HRM_OPERATING_UNITS_QUERY_KEY = ['hrm-operating-units'] as const;

/** Pure — coerce stale slug not present in loaded units to rollup `all`. */
export function coerceOperatingUnitSelection(
  selected: OperatingUnitFilterSelection,
  units: HrmOperatingUnitRow[],
): OperatingUnitFilterSelection {
  if (selected === 'all') return 'all';
  if (units.some((unit) => unit.operating_slug === selected)) return selected;
  return 'all';
}

/** Pure — OU change must refresh list queries but never wipe operating-units cache. */
export function shouldInvalidateQueryOnOuChange(queryKey: readonly unknown[]): boolean {
  return queryKey[0] !== HRM_OPERATING_UNITS_QUERY_KEY[0];
}

function isFilterHiddenPath(pathname: string): boolean {
  const normalized = pathname.replace(/^\/hr/, '').replace(/\/+$/, '') || '/';
  return FILTER_HIDDEN_PATH_PREFIXES.some(
    (prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`),
  );
}

function isGroupCeoMasterTenant(): boolean {
  const tenant = getPortalJwtTenantId()?.trim().toLowerCase();
  return tenant === HRM_MASTER_TENANT_ID;
}

export function HrmOperatingUnitFilterProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const queryClient = useQueryClient();
  const { setCurrentCompanyId } = useAuth();
  const portalEmbed = getHrmPortalMode(location.search);
  const [selectedSlug, setSelectedSlugState] = useState<OperatingUnitFilterSelection>(() =>
    readStoredOperatingUnitFilter(),
  );
  const [portalSessionReady, setPortalSessionReady] = useState(() => hasPortalSession());

  const showFilter =
    portalEmbed && isGroupCeoMasterTenant() && !isFilterHiddenPath(location.pathname);

  const shouldFetchOperatingUnits = portalEmbed && isGroupCeoMasterTenant();

  useEffect(() => {
    if (hasPortalSession()) {
      setPortalSessionReady(true);
      return;
    }
    const onReady = () => setPortalSessionReady(true);
    window.addEventListener(PORTAL_SESSION_READY_EVENT, onReady);
    return () => window.removeEventListener(PORTAL_SESSION_READY_EVENT, onReady);
  }, []);

  const unitsQuery = useQuery({
    queryKey: HRM_OPERATING_UNITS_QUERY_KEY,
    queryFn: fetchHrmOperatingUnits,
    enabled: shouldFetchOperatingUnits && portalSessionReady,
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
    retry: 2,
  });

  useEffect(() => {
    if (!shouldFetchOperatingUnits || !portalSessionReady) return;
    const onReady = () => {
      void queryClient.invalidateQueries({ queryKey: HRM_OPERATING_UNITS_QUERY_KEY });
    };
    window.addEventListener(PORTAL_SESSION_READY_EVENT, onReady);
    return () => window.removeEventListener(PORTAL_SESSION_READY_EVENT, onReady);
  }, [shouldFetchOperatingUnits, portalSessionReady, queryClient]);

  const units = unitsQuery.data ?? [];

  useEffect(() => {
    if (!shouldFetchOperatingUnits || !portalSessionReady) return;
    if (unitsQuery.isLoading || unitsQuery.isPending) return;
    const coerced = coerceOperatingUnitSelection(selectedSlug, units);
    if (coerced === selectedSlug) return;
    setSelectedSlugState(coerced);
    writeStoredOperatingUnitFilter(coerced);
    setCurrentCompanyId(resolveHrmOperatingUnitQueryCompanyId(coerced));
  }, [
    units,
    unitsQuery.isLoading,
    unitsQuery.isPending,
    selectedSlug,
    setCurrentCompanyId,
    shouldFetchOperatingUnits,
    portalSessionReady,
  ]);

  const operatingUnitLabelMap = useMemo(() => buildOperatingUnitLabelMap(units), [units]);

  const listCompanyId = useMemo(
    () => resolveHrmOperatingUnitQueryCompanyId(selectedSlug),
    [selectedSlug],
  );

  const setSelectedSlug = useCallback(
    (slug: OperatingUnitFilterSelection) => {
      setSelectedSlugState(slug);
      writeStoredOperatingUnitFilter(slug);
      const queryId = resolveHrmOperatingUnitQueryCompanyId(slug);
      setCurrentCompanyId(queryId);
      void queryClient.invalidateQueries({
        predicate: (query) => shouldInvalidateQueryOnOuChange(query.queryKey),
      });
    },
    [queryClient, setCurrentCompanyId],
  );

  useEffect(() => {
    if (!showFilter) {
      setCurrentCompanyId(resolveHrmOperatingUnitQueryCompanyId('all'));
      return;
    }
    setCurrentCompanyId(listCompanyId);
  }, [showFilter, listCompanyId, setCurrentCompanyId]);

  useEffect(() => {
    if (!showFilter) return;
    const stored = readStoredOperatingUnitFilter();
    if (stored !== selectedSlug) {
      setSelectedSlugState(stored);
    }
  }, [showFilter, selectedSlug]);

  const value = useMemo<HrmOperatingUnitFilterContextValue>(
    () => ({
      showFilter,
      units,
      unitsLoading: unitsQuery.isLoading,
      operatingUnitLabelMap,
      selectedSlug,
      listCompanyId,
      setSelectedSlug,
    }),
    [
      showFilter,
      units,
      unitsQuery.isLoading,
      operatingUnitLabelMap,
      selectedSlug,
      listCompanyId,
      setSelectedSlug,
    ],
  );

  return (
    <HrmOperatingUnitFilterContext.Provider value={value}>
      {children}
    </HrmOperatingUnitFilterContext.Provider>
  );
}

export function useHrmOperatingUnitFilter(): HrmOperatingUnitFilterContextValue {
  const ctx = useContext(HrmOperatingUnitFilterContext);
  if (!ctx) {
    return {
      showFilter: false,
      units: [],
      unitsLoading: false,
      operatingUnitLabelMap: new Map(),
      selectedSlug: 'all',
      listCompanyId: resolveHrmOperatingUnitQueryCompanyId('all'),
      setSelectedSlug: () => undefined,
    };
  }
  return ctx;
}
