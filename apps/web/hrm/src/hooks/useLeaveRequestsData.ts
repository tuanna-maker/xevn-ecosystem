import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface LeaveRequestData {
  id: string;
  employee_id: string;
  employee_name: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string | null;
  status: string;
}

export function useLeaveRequestsData(statusFilter?: string) {
  const { currentCompanyId } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequestData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentCompanyId) {
      setLeaveRequests([]);
      setIsLoading(false);
      return;
    }

    const fetchLeaveRequests = async () => {
      setIsLoading(true);
      try {
        let query = supabase
          .from('leave_requests')
          .select('*')
          .eq('company_id', currentCompanyId)
          .order('created_at', { ascending: false });

        if (statusFilter) {
          query = query.eq('status', statusFilter);
        }

        const { data, error } = await query;
        if (error) throw error;
        setLeaveRequests(data || []);
      } catch (error) {
        console.error('Error fetching leave requests:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaveRequests();
  }, [currentCompanyId, statusFilter]);

  return { leaveRequests, isLoading };
}
