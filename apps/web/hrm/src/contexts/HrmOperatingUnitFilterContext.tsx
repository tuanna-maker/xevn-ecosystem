import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
import { HRM_LIST_DEFAULT_COMPANY_ID, HRM_MASTER_TENANT_ID } from '@/lib/hrmListScope';
import { getPortalJwtTenantId } from '@/lib/hrmSpreadsheetScope';

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

  const showFilter =
    portalEmbed && isGroupCeoMasterTenant() && !isFilterHiddenPath(location.pathname);

  const shouldFetchOperatingUnits = portalEmbed && isGroupCeoMasterTenant();

  const unitsQuery = useQuery({
    queryKey: ['hrm-operating-units'],
    queryFn: fetchHrmOperatingUnits,
    enabled: shouldFetchOperatingUnits,
    staleTime: 5 * 60_000,
  });

  const operatingUnitLabelMap = useMemo(
    () => buildOperatingUnitLabelMap(unitsQuery.data ?? []),
    [unitsQuery.data],
  );

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
      void queryClient.invalidateQueries();
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
      units: unitsQuery.data ?? [],
      unitsLoading: unitsQuery.isLoading,
      operatingUnitLabelMap,
      selectedSlug,
      listCompanyId,
      setSelectedSlug,
    }),
    [
      showFilter,
      unitsQuery.data,
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
