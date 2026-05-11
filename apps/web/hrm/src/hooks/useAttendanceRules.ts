import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
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

export function useAttendanceRules() {
  const [rules, setRules] = useState<AttendanceRules | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { currentCompanyId } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const h = (key: string): string => t(`hk.attendanceRules.${key}`) as string;

  const fetchRules = useCallback(async () => {
    if (!currentCompanyId) { setRules(null); setIsLoading(false); return; }
    try {
      setIsLoading(true);
      const { data, error } = await supabase.from('attendance_rules').select('*').eq('company_id', currentCompanyId).maybeSingle();
      if (error) throw error;
      if (data) {
        setRules({ ...data, gps_locations: typeof data.gps_locations === 'string' ? JSON.parse(data.gps_locations) : data.gps_locations || [] });
      } else { setRules(null); }
    } catch (error: any) {
      console.error('Error fetching attendance rules:', error);
      toast({ title: t('messages.error'), description: h('fetchError'), variant: 'destructive' });
    } finally { setIsLoading(false); }
  }, [currentCompanyId, toast, t]);

  const saveRules = useCallback(async (input: AttendanceRulesInput): Promise<boolean> => {
    if (!currentCompanyId) { toast({ title: t('messages.error'), description: t('hk.noCompany'), variant: 'destructive' }); return false; }
    try {
      const dataToSave = { company_id: currentCompanyId, ...defaultRules, ...input, gps_locations: JSON.stringify(input.gps_locations || []) };
      if (rules) {
        const { error } = await supabase.from('attendance_rules').update({ ...input, gps_locations: JSON.stringify(input.gps_locations || rules.gps_locations || []) }).eq('id', rules.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('attendance_rules').insert(dataToSave);
        if (error) throw error;
      }
      toast({ title: t('messages.success'), description: h('saveSuccess') });
      await fetchRules(); return true;
    } catch (error: any) {
      console.error('Error saving attendance rules:', error);
      toast({ title: t('messages.error'), description: h('saveError'), variant: 'destructive' }); return false;
    }
  }, [currentCompanyId, rules, fetchRules, toast, t]);

  const addGPSLocation = useCallback(async (location: GPSLocation): Promise<boolean> => {
    return saveRules({ gps_locations: [...(rules?.gps_locations || []), location] });
  }, [rules, saveRules]);

  const removeGPSLocation = useCallback(async (index: number): Promise<boolean> => {
    return saveRules({ gps_locations: (rules?.gps_locations || []).filter((_, i) => i !== index) });
  }, [rules, saveRules]);

  const updateGPSLocation = useCallback(async (index: number, location: GPSLocation): Promise<boolean> => {
    const updated = [...(rules?.gps_locations || [])]; updated[index] = location;
    return saveRules({ gps_locations: updated });
  }, [rules, saveRules]);

  useEffect(() => { fetchRules(); }, [fetchRules]);

  const effectiveRules = rules || { ...defaultRules, id: '', company_id: currentCompanyId || '', created_at: '', updated_at: '' } as AttendanceRules;

  return { rules: effectiveRules, isLoading, saveRules, addGPSLocation, removeGPSLocation, updateGPSLocation, refetch: fetchRules };
}
