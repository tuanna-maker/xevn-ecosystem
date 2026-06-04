import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toErrorMessage } from '@/lib/apiError';
import {
  createEmployeeBenefit,
  createEmployeeInsurance,
  deleteEmployeeBenefit,
  deleteEmployeeInsurance,
  listEmployeeBenefits,
  listEmployeeInsurances,
  updateEmployeeBenefit,
  updateEmployeeInsurance,
  type HrmEmployeeBenefitRow,
  type HrmEmployeeInsuranceRow,
} from '@/integrations/hrmApi';

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

function mapInsuranceRow(row: HrmEmployeeInsuranceRow): InsuranceItem {
  const type = row.type as InsuranceItem['type'];
  const status = row.status as InsuranceItem['status'];
  return {
    id: row.id,
    employee_id: row.employee_id,
    company_id: row.company_id,
    type: ['social', 'health', 'unemployment', 'accident', 'life'].includes(type) ? type : 'social',
    provider: row.provider,
    policy_number: row.policy_number,
    start_date: row.start_date,
    end_date: row.end_date,
    contribution: Number(row.contribution ?? 0),
    employer_contribution: Number(row.employer_contribution ?? 0),
    status: ['active', 'expired', 'pending'].includes(status) ? status : 'active',
    notes: row.notes,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function mapBenefitRow(row: HrmEmployeeBenefitRow): BenefitItem {
  const category = row.category as BenefitItem['category'];
  const frequency = row.frequency as BenefitItem['frequency'];
  const status = row.status as BenefitItem['status'];
  return {
    id: row.id,
    employee_id: row.employee_id,
    company_id: row.company_id,
    name: row.name,
    category: ['allowance', 'bonus', 'leave', 'health', 'education', 'other'].includes(category)
      ? category
      : 'other',
    value: Number(row.value ?? 0),
    unit: row.unit ?? '',
    frequency: ['monthly', 'quarterly', 'yearly', 'one-time'].includes(frequency)
      ? frequency
      : 'monthly',
    start_date: row.start_date,
    end_date: row.end_date,
    status: status === 'inactive' ? 'inactive' : 'active',
    description: row.description,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function useEmployeeInsurance(employeeId: string | undefined) {
  const { currentCompanyId } = useAuth();
  const [insurances, setInsurances] = useState<InsuranceItem[]>([]);
  const [benefits, setBenefits] = useState<BenefitItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!employeeId || !currentCompanyId) {
      setInsurances([]);
      setBenefits([]);
      setFetchError(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setFetchError(null);
    try {
      const [insuranceRes, benefitRes] = await Promise.all([
        listEmployeeInsurances({ company_id: currentCompanyId, employee_id: employeeId }),
        listEmployeeBenefits({ company_id: currentCompanyId, employee_id: employeeId }),
      ]);
      setInsurances((insuranceRes.data ?? []).map(mapInsuranceRow));
      setBenefits((benefitRes.data ?? []).map(mapBenefitRow));
    } catch (error: unknown) {
      console.error('Error fetching employee insurance/benefits:', error);
      setInsurances([]);
      setBenefits([]);
      setFetchError(toErrorMessage(error, 'Không thể tải bảo hiểm & phúc lợi nhân viên'));
    } finally {
      setIsLoading(false);
    }
  }, [employeeId, currentCompanyId]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const createInsurance = async (data: InsuranceFormData): Promise<boolean> => {
    if (!employeeId || !currentCompanyId) return false;
    try {
      await createEmployeeInsurance({
        company_id: currentCompanyId,
        employee_id: employeeId,
        ...data,
      });
      await fetchData();
      return true;
    } catch (error: unknown) {
      console.error('createInsurance:', error);
      setFetchError(toErrorMessage(error, 'Không thể tạo bảo hiểm'));
      return false;
    }
  };

  const updateInsurance = async (id: string, data: Partial<InsuranceFormData>): Promise<boolean> => {
    if (!currentCompanyId) return false;
    try {
      await updateEmployeeInsurance(id, { company_id: currentCompanyId, ...data });
      await fetchData();
      return true;
    } catch (error: unknown) {
      console.error('updateInsurance:', error);
      setFetchError(toErrorMessage(error, 'Không thể cập nhật bảo hiểm'));
      return false;
    }
  };

  const deleteInsurance = async (id: string): Promise<boolean> => {
    if (!currentCompanyId) return false;
    try {
      await deleteEmployeeInsurance(id, currentCompanyId);
      await fetchData();
      return true;
    } catch (error: unknown) {
      console.error('deleteInsurance:', error);
      setFetchError(toErrorMessage(error, 'Không thể xóa bảo hiểm'));
      return false;
    }
  };

  const createBenefit = async (data: BenefitFormData): Promise<boolean> => {
    if (!employeeId || !currentCompanyId) return false;
    try {
      await createEmployeeBenefit({
        company_id: currentCompanyId,
        employee_id: employeeId,
        name: data.name,
        category: data.category,
        value: data.value,
        unit: data.unit,
        frequency: data.frequency,
        start_date: data.start_date,
        end_date: data.end_date,
        status: data.status,
        description: data.description,
      });
      await fetchData();
      return true;
    } catch (error: unknown) {
      console.error('createBenefit:', error);
      setFetchError(toErrorMessage(error, 'Không thể tạo phúc lợi'));
      return false;
    }
  };

  const updateBenefit = async (id: string, data: Partial<BenefitFormData>): Promise<boolean> => {
    if (!currentCompanyId) return false;
    try {
      await updateEmployeeBenefit(id, { company_id: currentCompanyId, ...data });
      await fetchData();
      return true;
    } catch (error: unknown) {
      console.error('updateBenefit:', error);
      setFetchError(toErrorMessage(error, 'Không thể cập nhật phúc lợi'));
      return false;
    }
  };

  const deleteBenefit = async (id: string): Promise<boolean> => {
    if (!currentCompanyId) return false;
    try {
      await deleteEmployeeBenefit(id, currentCompanyId);
      await fetchData();
      return true;
    } catch (error: unknown) {
      console.error('deleteBenefit:', error);
      setFetchError(toErrorMessage(error, 'Không thể xóa phúc lợi'));
      return false;
    }
  };

  return {
    insurances,
    benefits,
    isLoading,
    fetchError,
    refetch: fetchData,
    createInsurance,
    updateInsurance,
    deleteInsurance,
    createBenefit,
    updateBenefit,
    deleteBenefit,
  };
}
