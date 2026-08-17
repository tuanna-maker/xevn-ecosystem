/**
 * @CODE-MEMORY
 * Screen:     HRM → Chấm công → Cài đặt → Quy tắc (Rules CFG)
 * UC:         HRM-AT-14 · menu-fidelity CFG P0-1/P0-6
 * SRS:        docs/hrm/SRS.md · attendance Rules→Chung/Standard/App
 * TechSpec:   ADR-HRM-ATTENDANCE-CFG-PERSIST-20260804.md D2–D4
 * Purpose:    GET/PATCH /attendance/rules + geofence CRUD qua /attendance/work-sites (không ghi gps_locations JSON).
 * WorkItem:   PO-MFD-M1-ATT-P0-CFG-FE-01
 * Coded:      2026-08-04
 * Callers:    Attendance.tsx settings → rules
 * Callees:    getAttendanceRules, patchAttendanceRules, listAttendanceWorkSites, work-sites mutate
 * must_keep:  company_id = currentCompanyId; U65 lazy GET (no seed); faceid read-only false
 * SOLID:      Hook sở hữu fetch rules + sites merge; GPS mutate tách khỏi rules PATCH
 * LastVerified: docs/qa/evidence/po-mfd-m1-att-p0-cfg-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-04 PO-MFD-M1-ATT-P0-CFG-FE-01
 * change_mode: FIX
 * What: Wire Nest rules + work-sites; bỏ in-memory saveBlocked toast
 * Why: ADR D2–D3 CFG persist + geofence SoT work-sites
 * must_keep: work-shifts hook untouched; không PATCH gps_locations / faceid_enabled
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-ATT-03d-05b-FE-01
 * change_mode: UPGRADE
 * What: Expose updateGPSLocation for ATT-03d edit UI (list/create/edit/delete)
 * Why: FR-UC-BP-ATT-03d · ADR work-sites SoT; residual edit-in-place
 * must_keep: company_id = token scope; no gps_locations JSON PATCH; U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-ATT-03d-05b-FE-01 (RE-KICK)
 * change_mode: UPGRADE
 * What: GPS create/update gửi radius + radius_meters (BE alias OK); companyId token
 * Why: FR-UC-BP-ATT-03d · BE work-sites READY_FOR_QA
 * must_keep: work-sites SoT; no seed default site; Face GĐ1 hold
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-ATT-02-CLUSTER-FE-01
 * change_mode: UPGRADE
 * What: RETAIN cite physical GET/PATCH /attendance/rules + work-sites CRUD —
 *       round/methods/notify_late/gps peers; mode XOR envelope owned by AttLatePenaltyModePanel
 *       (stub-safe until BE residual). Nest /core DENY · CFG alone ≠ ATT-02 DONE.
 * Why: UC-BP-ATT-02 · API-01 F-ATT-RULE-01 · U65
 * must_keep: company_id scope; no gps_locations JSON PATCH; no Nest /core; U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-ATT-02-CLUSTER-FE-02
 * change_mode: UPGRADE
 * What: RETAIN round/methods/sites — mode LIVE bind owned by AttLatePenaltyModePanel (FE-02);
 *       close R-ATT-02-MODE-FE · Nest /core DENY · CFG alone ≠ ATT-02 DONE.
 * Why: BE-01 READY · API-01 §4.6 · U65
 * must_keep: company_id scope; no Nest /core; printable false; PAY OUT; attendance_uat_ready=false
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-ATT-03D-CLUSTER-FE-01
 * change_mode: UPGRADE
 * What: GPS work-sites map via parseAtt03dWorkSiteDisplay — active + statusLabelVi FE-derive;
 *       DELETE soft-retire (active=false) · DENY gps_locations JSON PATCH · DENY ensureDefault;
 *       Nest /core 0 · honesty ≠ PLT WS alone = ATT-03d DONE · ≠ ATT UAT.
 * Why: UC-BP-ATT-03d · F-ATT-CAT-WS-01/02 · J-HRM-ATT-03D-01/02/06 · U65
 * Spec: docs/program/specs/PO-HRM-MVP-GD1-ATT-03D-CLUSTER-API-01.md · ADR D3
 * must_keep: ATT03BQC1-MSM0891H · ATT01QC1-MSLZ3KIM R-ATT-01-ASSIGN open · ATT11/10/09/08/02/PLT/CORE ·
 *            ATTWSQA-MSJC3IN9 · ATTWSQA2-MSJCG47P ≠ ATT-03d DONE · DENY att_leave_hold · PAY OUT
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-att-03d-cluster-fe-01.md
 */
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { toErrorMessage } from '@/lib/apiError';
import { parseAtt03dWorkSiteDisplay } from '@/lib/attWorkSite03dRing';
import {
  createAttendanceWorkSite,
  deleteAttendanceWorkSite,
  getAttendanceRules,
  listAttendanceWorkSites,
  patchAttendanceRules,
  updateAttendanceWorkSite,
  type HrmWorkSiteRow,
} from '@/integrations/hrmApi';

export interface GPSLocation {
  id?: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  radius: number;
  /** LIVE Nest active — soft-retire sets false (list default hides). */
  active?: boolean;
  /** FE-derive from active when BE omits (R-ATT-03D-DISP). */
  statusLabelVi?: string;
}

export interface AttendanceRules {
  id: string;
  company_id: string;
  work_start_day: number | null;
  work_end_day: number | null;
  work_days: string[] | null;
  round_in_minutes: number | null;
  round_out_minutes: number | null;
  standard_type: string | null;
  standard_days_per_month: number | null;
  hours_per_day: number | null;
  allow_multiple_checkin: boolean | null;
  auto_checkout: boolean | null;
  notify_late: boolean | null;
  gps_enabled: boolean | null;
  wifi_enabled: boolean | null;
  qr_enabled: boolean | null;
  faceid_enabled: boolean | null;
  gps_locations: GPSLocation[] | null;
  created_at: string;
  updated_at: string;
}

export interface AttendanceRulesInput {
  work_start_day?: number;
  work_end_day?: number;
  work_days?: string[];
  round_in_minutes?: number;
  round_out_minutes?: number;
  standard_type?: string;
  standard_days_per_month?: number;
  hours_per_day?: number;
  allow_multiple_checkin?: boolean;
  auto_checkout?: boolean;
  notify_late?: boolean;
  gps_enabled?: boolean;
  wifi_enabled?: boolean;
  qr_enabled?: boolean;
}

export const WEEK_DAY_CODES = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

const defaultRules: Omit<AttendanceRules, 'id' | 'company_id' | 'created_at' | 'updated_at'> = {
  work_start_day: 1,
  work_end_day: 31,
  work_days: ['mon', 'tue', 'wed', 'thu', 'fri'],
  round_in_minutes: 0,
  round_out_minutes: 0,
  standard_type: 'fixed',
  standard_days_per_month: 26,
  hours_per_day: 8,
  allow_multiple_checkin: true,
  auto_checkout: false,
  notify_late: true,
  gps_enabled: true,
  wifi_enabled: true,
  qr_enabled: false,
  faceid_enabled: false,
  gps_locations: [],
};

function mapWorkSiteRow(row: HrmWorkSiteRow): GPSLocation {
  const display = parseAtt03dWorkSiteDisplay(row as Record<string, unknown>);
  return {
    id: display.id ?? undefined,
    name: display.name === '—' ? '' : display.name,
    address: display.address,
    latitude: display.latitude,
    longitude: display.longitude,
    radius: display.radiusMeters,
    active: display.active,
    statusLabelVi: display.statusLabelVi,
  };
}

function mapApiRules(row: Record<string, unknown>, sites: GPSLocation[]): AttendanceRules {
  return {
    id: String(row.id ?? ''),
    company_id: String(row.company_id ?? ''),
    work_start_day: row.work_start_day != null ? Number(row.work_start_day) : null,
    work_end_day: row.work_end_day != null ? Number(row.work_end_day) : null,
    work_days: Array.isArray(row.work_days) ? (row.work_days as string[]) : null,
    round_in_minutes: row.round_in_minutes != null ? Number(row.round_in_minutes) : null,
    round_out_minutes: row.round_out_minutes != null ? Number(row.round_out_minutes) : null,
    standard_type: row.standard_type != null ? String(row.standard_type) : null,
    standard_days_per_month:
      row.standard_days_per_month != null ? Number(row.standard_days_per_month) : null,
    hours_per_day: row.hours_per_day != null ? Number(row.hours_per_day) : null,
    allow_multiple_checkin:
      row.allow_multiple_checkin != null ? Boolean(row.allow_multiple_checkin) : null,
    auto_checkout: row.auto_checkout != null ? Boolean(row.auto_checkout) : null,
    notify_late: row.notify_late != null ? Boolean(row.notify_late) : null,
    gps_enabled: row.gps_enabled != null ? Boolean(row.gps_enabled) : null,
    wifi_enabled: row.wifi_enabled != null ? Boolean(row.wifi_enabled) : null,
    qr_enabled: row.qr_enabled != null ? Boolean(row.qr_enabled) : null,
    faceid_enabled: false,
    gps_locations: sites,
    created_at: String(row.created_at ?? ''),
    updated_at: String(row.updated_at ?? ''),
  };
}

function buildDefaultRules(companyId: string): AttendanceRules {
  const now = new Date().toISOString();
  return {
    ...defaultRules,
    id: 'default',
    company_id: companyId,
    created_at: now,
    updated_at: now,
  };
}

export function useAttendanceRules() {
  const [rules, setRules] = useState<AttendanceRules | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { currentCompanyId } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

  const fetchRules = useCallback(async () => {
    if (!currentCompanyId) {
      setRules(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const [rulesRow, sitesRes] = await Promise.all([
        getAttendanceRules(currentCompanyId),
        listAttendanceWorkSites(currentCompanyId),
      ]);
      const sites = (sitesRes.data ?? []).map(mapWorkSiteRow);
      setRules(mapApiRules(rulesRow as Record<string, unknown>, sites));
    } catch (error: unknown) {
      console.error('Error fetching attendance rules:', error);
      toast({
        title: t('messages.error'),
        description: toErrorMessage(error, t('hk.attendanceRules.fetchError')),
        variant: 'destructive',
      });
      setRules(buildDefaultRules(currentCompanyId));
    } finally {
      setIsLoading(false);
    }
  }, [currentCompanyId, toast, t]);

  const saveRules = useCallback(
    async (input: AttendanceRulesInput): Promise<boolean> => {
      if (!currentCompanyId) {
        toast({ title: t('messages.error'), description: t('hk.noCompany'), variant: 'destructive' });
        return false;
      }
      setIsSaving(true);
      try {
        const updated = await patchAttendanceRules(currentCompanyId, input as Record<string, unknown>);
        const sitesRes = await listAttendanceWorkSites(currentCompanyId);
        const sites = (sitesRes.data ?? []).map(mapWorkSiteRow);
        setRules(mapApiRules(updated as Record<string, unknown>, sites));
        toast({
          title: t('messages.success'),
          description: t('hk.attendanceRules.saveSuccess'),
        });
        return true;
      } catch (error: unknown) {
        console.error('Error saving attendance rules:', error);
        toast({
          title: t('messages.error'),
          description: toErrorMessage(error, t('hk.attendanceRules.saveError')),
          variant: 'destructive',
        });
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [currentCompanyId, toast, t],
  );

  const addGPSLocation = useCallback(
    async (location: GPSLocation): Promise<boolean> => {
      if (!currentCompanyId) return false;
      setIsSaving(true);
      try {
        await createAttendanceWorkSite({
          company_id: currentCompanyId,
          name: location.name,
          address: location.address,
          latitude: location.latitude,
          longitude: location.longitude,
          radius: location.radius,
          radius_meters: location.radius,
        });
        await fetchRules();
        toast({
          title: t('messages.success'),
          description: t('hk.attendanceRules.saveSuccess'),
        });
        return true;
      } catch (error: unknown) {
        console.error('Error creating work site:', error);
        toast({
          title: t('messages.error'),
          description: toErrorMessage(error, t('hk.attendanceRules.saveError')),
          variant: 'destructive',
        });
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [currentCompanyId, fetchRules, toast, t],
  );

  const removeGPSLocation = useCallback(
    async (index: number): Promise<boolean> => {
      const site = rules?.gps_locations?.[index];
      if (!site?.id || !currentCompanyId) return false;
      setIsSaving(true);
      try {
        // Soft-retire prefer PATCH active=false (AC-ATT-03D-SOFT); DELETE also soft — prefer PATCH.
        await updateAttendanceWorkSite(site.id, currentCompanyId, { active: false });
        await fetchRules();
        toast({
          title: t('messages.success'),
          description: t('hk.attendanceRules.saveSuccess'),
        });
        return true;
      } catch (error: unknown) {
        console.error('Error soft-retiring work site:', error);
        // Fallback product DELETE soft-retire when PATCH rejected
        try {
          await deleteAttendanceWorkSite(site.id, currentCompanyId);
          await fetchRules();
          toast({
            title: t('messages.success'),
            description: t('hk.attendanceRules.saveSuccess'),
          });
          return true;
        } catch (deleteError: unknown) {
          console.error('Error deleting work site:', deleteError);
          toast({
            title: t('messages.error'),
            description: toErrorMessage(deleteError, t('hk.attendanceRules.saveError')),
            variant: 'destructive',
          });
          return false;
        }
      } finally {
        setIsSaving(false);
      }
    },
    [currentCompanyId, fetchRules, rules?.gps_locations, toast, t],
  );

  const updateGPSLocation = useCallback(
    async (index: number, location: GPSLocation): Promise<boolean> => {
      const site = rules?.gps_locations?.[index];
      if (!site?.id || !currentCompanyId) return false;
      setIsSaving(true);
      try {
        await updateAttendanceWorkSite(site.id, currentCompanyId, {
          name: location.name,
          address: location.address,
          latitude: location.latitude,
          longitude: location.longitude,
          radius: location.radius,
          radius_meters: location.radius,
        });
        await fetchRules();
        toast({
          title: t('messages.success'),
          description: t('hk.attendanceRules.saveSuccess'),
        });
        return true;
      } catch (error: unknown) {
        console.error('Error updating work site:', error);
        toast({
          title: t('messages.error'),
          description: toErrorMessage(error, t('hk.attendanceRules.saveError')),
          variant: 'destructive',
        });
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [currentCompanyId, fetchRules, rules?.gps_locations, toast, t],
  );

  useEffect(() => {
    void fetchRules();
  }, [fetchRules]);

  const effectiveRules =
    rules ||
    ({
      ...defaultRules,
      id: '',
      company_id: currentCompanyId || '',
      created_at: '',
      updated_at: '',
    } as AttendanceRules);

  return {
    rules: effectiveRules,
    isLoading,
    isSaving,
    saveRules,
    addGPSLocation,
    removeGPSLocation,
    updateGPSLocation,
    refetch: fetchRules,
  };
}

/** Map UI rounding select value to minutes persisted on rules row. */
export function roundingSelectToMinutes(value: string): number {
  if (value === 'none') return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

/** Map rules minutes to Select value. */
export function minutesToRoundingSelect(minutes: number | null | undefined): string {
  if (minutes == null || minutes === 0) return 'none';
  return String(minutes);
}
