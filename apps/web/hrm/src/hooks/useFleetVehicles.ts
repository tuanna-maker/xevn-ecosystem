/**
 * @CODE-MEMORY
 * Screen:     /fleet · Hồ sơ xe list query
 * UC:         FR-HRM-FL-01 #2/#3/#4
 * BR:         FL-01 list-only · G-FL-02 keyword/q · no spinner storm
 * SRS:        docs/client-delivery/hrm/SRS_HRM_KHACH.md §3.49
 * TechSpec:   docs/hrm/TECHSPEC.md §16.5 · API_DESIGN_HRM_FLEET §A
 * Purpose:    GET /api/hrm/fleet/vehicles with optional q; share settings-catalogs cache for G-FL-07.
 * WorkItem:   D-FE-HRM-FLEET-CATALOG-UX-01
 * Coded:      2026-07-27
 * Callers:    pages/Fleet.tsx
 * Callees:    listFleetVehicles · useSettingsCatalogsOverview
 * FEActions:  Open list · search keyword → q
 * Impact:     refetchOnWindowFocus storm / invent upsert
 * must_keep:  FL-01 GET only · U65 · HOLD_DEPLOY · no create mutate
 * SOLID:      Hook owns server state; page owns presentation
 * LastVerified: lib/fleetCatalogUx.test.ts
 */
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { listFleetVehicles, type HrmFleetVehicleRow } from '@/integrations/hrmApi';
import { coerceHrmListCompanyId } from '@/lib/hrmListScope';
import { useDebouncedPickerKeyword } from '@/hooks/useEmployeePicker';
import { useSettingsCatalogsOverview } from '@/hooks/useSettingsCatalogsOverview';
import {
  buildFleetFieldLabelMap,
  isFleetCatalogMissing,
} from '@/lib/fleetCatalogUx';

export const FLEET_VEHICLES_QUERY_KEY = 'hrm-fleet-vehicles';

export type UseFleetVehiclesOptions = {
  /** Raw search box value — debounced inside hook before API `q`. */
  keyword?: string;
  enabled?: boolean;
  limit?: number;
};

export function useFleetVehicles(opts?: UseFleetVehiclesOptions) {
  const { currentCompanyId } = useAuth();
  const keyword = opts?.keyword ?? '';
  const debouncedKeyword = useDebouncedPickerKeyword(keyword, 300);
  const limit = opts?.limit ?? 500;
  const enabled = opts?.enabled !== false && !!currentCompanyId;

  const companyId = currentCompanyId ? coerceHrmListCompanyId(currentCompanyId) : null;

  const vehiclesQuery = useQuery({
    queryKey: [FLEET_VEHICLES_QUERY_KEY, companyId, debouncedKeyword.trim(), limit],
    queryFn: async () => {
      if (!companyId) return { total: 0, data: [] as HrmFleetVehicleRow[] };
      return listFleetVehicles({
        company_id: companyId,
        q: debouncedKeyword.trim() || undefined,
        limit,
      });
    },
    enabled,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const catalogsQuery = useSettingsCatalogsOverview({ enabled });

  const catalogs = catalogsQuery.catalogs;
  const catalogMissing = isFleetCatalogMissing(catalogs, {
    catalogsSettled: catalogsQuery.isFetched && !catalogsQuery.isFetching,
  });
  const fieldLabelMap = useMemo(() => buildFleetFieldLabelMap(catalogs), [catalogs]);

  return {
    vehicles: vehiclesQuery.data?.data ?? [],
    total: vehiclesQuery.data?.total ?? 0,
    isLoading: vehiclesQuery.isLoading || (enabled && catalogsQuery.isLoading && !vehiclesQuery.isFetched),
    isFetching: vehiclesQuery.isFetching,
    isError: vehiclesQuery.isError,
    error: vehiclesQuery.error,
    refetch: vehiclesQuery.refetch,
    debouncedKeyword,
    catalogMissing,
    catalogsLoading: catalogsQuery.isLoading,
    catalogsSettled: catalogsQuery.isFetched && !catalogsQuery.isFetching,
    fieldLabelMap,
  };
}

export type { HrmFleetVehicleRow };
