import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface InsuranceItem {
  id: string;
  employee_id: string;
  company_id: string;
  type: 'social' | 'health' | 'unemployment' | 'accident' | 'life';
  provider: string;
  policy_number: string | null;
  start_date: string | null;
  end_date: string | null;
  contribution: number;
  employer_contribution: number;
  status: 'active' | 'expired' | 'pending';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BenefitItem {
  id: string;
  employee_id: string;
  company_id: string;
  name: string;
  category: 'allowance' | 'bonus' | 'leave' | 'health' | 'education' | 'other';
  value: number;
  unit: string;
  frequency: 'monthly' | 'quarterly' | 'yearly' | 'one-time';
  start_date: string | null;
  end_date: string | null;
  status: 'active' | 'inactive';
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface InsuranceFormData {
  type: InsuranceItem['type'];
  provider: string;
  policy_number?: string;
  start_date?: string;
  end_date?: string;
  contribution?: number;
  employer_contribution?: number;
  status?: InsuranceItem['status'];
  notes?: string;
}

export interface BenefitFormData {
  name: string;
  category: BenefitItem['category'];
  value: number;
  unit?: string;
  frequency?: BenefitItem['frequency'];
  start_date?: string;
  end_date?: string;
  status?: BenefitItem['status'];
  description?: string;
}

export function useEmployeeInsurance(employeeId: string | undefined) {
  const { currentCompanyId } = useAuth();
  const [insurances, setInsurances] = useState<InsuranceItem[]>([]);
  const [benefits, setBenefits] = useState<BenefitItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!employeeId || !currentCompanyId) {
      setInsurances([]);
      setBenefits([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const [insuranceRes, benefitRes] = await Promise.all([
        supabase
          .from('employee_insurances')
          .select('*')
          .eq('employee_id', employeeId)
          .eq('company_id', currentCompanyId)
          .order('created_at', { ascending: false }),
        supabase
          .from('employee_benefits')
          .select('*')
          .eq('employee_id', employeeId)
          .eq('company_id', currentCompanyId)
          .order('created_at', { ascending: false }),
      ]);

      if (insuranceRes.error) throw insuranceRes.error;
      if (benefitRes.error) throw benefitRes.error;

      setInsurances((insuranceRes.data || []) as InsuranceItem[]);
      setBenefits((benefitRes.data || []) as BenefitItem[]);
    } catch (error: any) {
      console.error('Error fetching insurance data:', error);
      toast.error('Không thể tải dữ liệu bảo hiểm');
    } finally {
      setIsLoading(false);
    }
  }, [employeeId, currentCompanyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Insurance CRUD
  const createInsurance = async (data: InsuranceFormData): Promise<boolean> => {
    if (!employeeId || !currentCompanyId) return false;

    try {
      const { error } = await supabase
        .from('employee_insurances')
        .insert([{
          ...data,
          employee_id: employeeId,
          company_id: currentCompanyId,
        }]);

      if (error) throw error;
      toast.success('Thêm bảo hiểm thành công');
      await fetchData();
      return true;
    } catch (error: any) {
      console.error('Error creating insurance:', error);
      toast.error('Không thể thêm bảo hiểm');
      return false;
    }
  };

  const updateInsurance = async (id: string, data: Partial<InsuranceFormData>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('employee_insurances')
        .update(data)
        .eq('id', id);

      if (error) throw error;
      toast.success('Cập nhật bảo hiểm thành công');
      await fetchData();
      return true;
    } catch (error: any) {
      console.error('Error updating insurance:', error);
      toast.error('Không thể cập nhật bảo hiểm');
      return false;
    }
  };

  const deleteInsurance = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('employee_insurances')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Đã xóa bảo hiểm');
      await fetchData();
      return true;
    } catch (error: any) {
      console.error('Error deleting insurance:', error);
      toast.error('Không thể xóa bảo hiểm');
      return false;
    }
  };

  // Benefits CRUD
  const createBenefit = async (data: BenefitFormData): Promise<boolean> => {
    if (!employeeId || !currentCompanyId) return false;

    try {
      const { error } = await supabase
        .from('employee_benefits')
        .insert([{
          ...data,
          employee_id: employeeId,
          company_id: currentCompanyId,
        }]);

      if (error) throw error;
      toast.success('Thêm phúc lợi thành công');
      await fetchData();
      return true;
    } catch (error: any) {
      console.error('Error creating benefit:', error);
      toast.error('Không thể thêm phúc lợi');
      return false;
    }
  };

  const updateBenefit = async (id: string, data: Partial<BenefitFormData>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('employee_benefits')
        .update(data)
        .eq('id', id);

      if (error) throw error;
      toast.success('Cập nhật phúc lợi thành công');
      await fetchData();
      return true;
    } catch (error: any) {
      console.error('Error updating benefit:', error);
      toast.error('Không thể cập nhật phúc lợi');
      return false;
    }
  };

  const deleteBenefit = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('employee_benefits')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Đã xóa phúc lợi');
      await fetchData();
      return true;
    } catch (error: any) {
      console.error('Error deleting benefit:', error);
      toast.error('Không thể xóa phúc lợi');
      return false;
    }
  };

  return {
    insurances,
    benefits,
    isLoading,
    createInsurance,
    updateInsurance,
    deleteInsurance,
    createBenefit,
    updateBenefit,
    deleteBenefit,
    refetch: fetchData,
  };
}
