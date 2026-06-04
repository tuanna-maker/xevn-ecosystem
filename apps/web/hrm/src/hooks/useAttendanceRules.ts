import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface GPSLocation { name: string; address: string; latitude: number; longitude: number; radius: number; }

export interface AttendanceRules {
  id: string; company_id: string; work_start_day: number | null; work_end_day: number | null;
  work_days: string[] | null; round_in_minutes: number | null; round_out_minutes: number | null;
  standard_type: string | null; standard_days_per_month: number | null; hours_per_day: number | null;
  allow_multiple_checkin: boolean | null; auto_checkout: boolean | null; notify_late: boolean | null;
  gps_enabled: boolean | null; wifi_enabled: boolean | null; qr_enabled: boolean | null;
  faceid_enabled: boolean | null; gps_locations: GPSLocation[] | null; created_at: string; updated_at: string;
}

export interface AttendanceRulesInput {
  work_start_day?: number; work_end_day?: number; work_days?: string[]; round_in_minutes?: number;
  round_out_minutes?: number; standard_type?: string; standard_days_per_month?: number; hours_per_day?: number;
  allow_multiple_checkin?: boolean; auto_checkout?: boolean; notify_late?: boolean; gps_enabled?: boolean;
  wifi_enabled?: boolean; qr_enabled?: boolean; faceid_enabled?: boolean; gps_locations?: GPSLocation[];
}

const defaultRules: Omit<AttendanceRules, 'id' | 'company_id' | 'created_at' | 'updated_at'> = {
  work_start_day: 1, work_end_day: 31, work_days: ['mon', 'tue', 'wed', 'thu', 'fri'],
  round_in_minutes: 0, round_out_minutes: 0, standard_type: 'fixed', standard_days_per_month: 26,
  hours_per_day: 8, allow_multiple_checkin: true, auto_checkout: false, notify_late: true,
  gps_enabled: true, wifi_enabled: true, qr_enabled: false, faceid_enabled: false, gps_locations: [],
};

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

/** Nest attendance-rules API not shipped yet — use in-memory defaults (no error toast on load). */
export function useAttendanceRules() {
  const [rules, setRules] = useState<AttendanceRules | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { currentCompanyId } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const h = (key: string): string => t(`hk.attendanceRules.${key}`) as string;

  const fetchRules = useCallback(async () => {
    if (!currentCompanyId) {
      setRules(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      setRules(buildDefaultRules(currentCompanyId));
    } catch (error: unknown) {
      console.error('Error fetching attendance rules:', error);
      setRules(buildDefaultRules(currentCompanyId));
    } finally {
      setIsLoading(false);
    }
  }, [currentCompanyId]);

  const saveRules = useCallback(
    async (input: AttendanceRulesInput): Promise<boolean> => {
      if (!currentCompanyId) {
        toast({ title: t('messages.error'), description: t('hk.noCompany'), variant: 'destructive' });
        return false;
      }
      try {
        const gps_locations = input.gps_locations ?? rules?.gps_locations ?? [];
        const merged: AttendanceRules = {
          ...(rules ?? buildDefaultRules(currentCompanyId)),
          ...defaultRules,
          ...input,
          company_id: currentCompanyId,
          gps_locations,
          updated_at: new Date().toISOString(),
        };
        setRules(merged);
        toast({ title: t('messages.success'), description: h('saveSuccess') });
        return true;
      } catch (error: unknown) {
        console.error('Error saving attendance rules:', error);
        toast({ title: t('messages.error'), description: h('saveError'), variant: 'destructive' });
        return false;
      }
    },
    [currentCompanyId, rules, toast, t, h],
  );

  const addGPSLocation = useCallback(
    async (location: GPSLocation): Promise<boolean> => {
      return saveRules({ gps_locations: [...(rules?.gps_locations || []), location] });
    },
    [rules, saveRules],
  );

  const removeGPSLocation = useCallback(
    async (index: number): Promise<boolean> => {
      return saveRules({ gps_locations: (rules?.gps_locations || []).filter((_, i) => i !== index) });
    },
    [rules, saveRules],
  );

  const updateGPSLocation = useCallback(
    async (index: number, location: GPSLocation): Promise<boolean> => {
      const updated = [...(rules?.gps_locations || [])];
      updated[index] = location;
      return saveRules({ gps_locations: updated });
    },
    [rules, saveRules],
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
    saveRules,
    addGPSLocation,
    removeGPSLocation,
    updateGPSLocation,
    refetch: fetchRules,
  };
}
