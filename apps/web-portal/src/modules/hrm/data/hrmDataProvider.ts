import { isSupabaseConfigured, supabase } from '../../../integrations/supabase/client';

export type HrmApiMode = 'supabase' | 'rest';

type EmployeeRow = {
  id: string;
  company_id: string;
  employee_code: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  position: string | null;
  department: string | null;
  status: string;
  start_date: string | null;
  salary: number | null;
  avatar_url: string | null;
  gender: string | null;
  birth_date: string | null;
  id_number: string | null;
  id_issue_date: string | null;
  id_issue_place: string | null;
  permanent_address: string | null;
  temporary_address: string | null;
  emergency_contact: string | null;
  emergency_phone: string | null;
  employment_type: string | null;
  work_location: string | null;
  bank_name: string | null;
  bank_account: string | null;
  tax_code: string | null;
  social_insurance_number: string | null;
  health_insurance_number: string | null;
};

export type EmployeeUpsert = Omit<EmployeeRow, 'id'> & { id?: string };

type AttendanceRow = {
  id: string;
  attendance_date: string;
  employee_name: string;
  status: string;
  actual_hours: number | null;
  late_minutes: number | null;
};

type PayrollBatchRow = {
  id: string;
  name: string;
  salary_period: string;
  status: string;
  employee_count: number | null;
  total_gross: number | null;
};

type ContractRow = {
  id: string;
  employee_name: string | null;
  employee_code: string | null;
  contract_type: string | null;
  status: string;
  effective_date: string | null;
  expiry_date: string | null;
};

type InsuranceRow = {
  id: string;
  employee_name: string;
  insurance_type: string;
  status: string;
  effective_date: string | null;
};

type DecisionRow = {
  id: string;
  decision_number: string | null;
  decision_date: string | null;
  decision_type: string;
  employee_name: string | null;
  status: string;
};

function envTrim(v: unknown): string {
  if (typeof v !== 'string') return '';
  return v.trim();
}

export function getMode(): HrmApiMode {
  const raw = envTrim(import.meta.env.VITE_HRM_API_MODE);
  return raw === 'rest' ? 'rest' : 'supabase';
}

function getRestBaseUrl(): string {
  return envTrim(import.meta.env.VITE_HRM_API_BASE_URL);
}

async function restJson<T>(path: string, init?: RequestInit): Promise<T> {
  const base = getRestBaseUrl();
  if (!base) {
    throw new Error('Missing VITE_HRM_API_BASE_URL');
  }
  const res = await fetch(`${base.replace(/\/+$/, '')}${path}`, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`REST ${res.status} ${res.statusText}: ${text}`);
  }
  return (await res.json()) as T;
}

export const hrmDataProvider = {
  async listEmployees(params: { companyId: string | null; limit?: number }): Promise<EmployeeRow[]> {
    const limit = params.limit ?? 200;
    if (getMode() === 'rest') {
      // Convention: GET /employees?companyId=&limit=
      const qs = new URLSearchParams();
      if (params.companyId) qs.set('companyId', params.companyId);
      qs.set('limit', String(limit));
      return await restJson<EmployeeRow[]>(`/employees?${qs.toString()}`);
    }

    if (!isSupabaseConfigured) return [];
    let q = supabase
      .from('employees')
      .select(
        'id, company_id, employee_code, full_name, email, phone, position, department, status, start_date, salary, avatar_url, gender, birth_date, id_number, id_issue_date, id_issue_place, permanent_address, temporary_address, emergency_contact, emergency_phone, employment_type, work_location, bank_name, bank_account, tax_code, social_insurance_number, health_insurance_number, deleted_at, created_at'
      )
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (params.companyId) q = q.eq('company_id', params.companyId);
    const { data, error } = await q;
    if (error) return [];
    return (data ?? []) as any;
  },

  async getEmployee(id: string): Promise<EmployeeRow | null> {
    if (getMode() === 'rest') {
      return await restJson<EmployeeRow>(`/employees/${encodeURIComponent(id)}`);
    }

    if (!isSupabaseConfigured) return null;
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .maybeSingle();
      
    if (error) throw error;
    return data as any;
  },

  async createEmployee(input: EmployeeUpsert): Promise<void> {
    if (getMode() === 'rest') {
      await restJson<void>(`/employees`, { method: 'POST', body: JSON.stringify(input) });
      return;
    }
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.from('employees').insert([input as any]);
    if (error) throw error;
  },

  async updateEmployee(id: string, input: Partial<EmployeeUpsert>): Promise<void> {
    if (getMode() === 'rest') {
      await restJson<void>(`/employees/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(input) });
      return;
    }
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.from('employees').update(input as any).eq('id', id);
    if (error) throw error;
  },
  
  async deleteEmployee(id: string): Promise<void> {
    if (getMode() === 'rest') {
      await restJson<void>(`/employees/${encodeURIComponent(id)}`, { method: 'DELETE' });
      return;
    }
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.from('employees').update({ deleted_at: new Date().toISOString() } as any).eq('id', id);
    if (error) throw error;
  },

  async listAttendance(params: { companyId: string | null; limit?: number }): Promise<AttendanceRow[]> {
    const limit = params.limit ?? 200;
    if (getMode() === 'rest') {
      const qs = new URLSearchParams();
      if (params.companyId) qs.set('companyId', params.companyId);
      qs.set('limit', String(limit));
      return await restJson<AttendanceRow[]>(`/attendance-records?${qs.toString()}`);
    }
    if (!isSupabaseConfigured) return [];
    let q = supabase
      .from('attendance_records')
      .select('id, attendance_date, employee_name, status, actual_hours, late_minutes, company_id')
      .order('attendance_date', { ascending: false })
      .limit(limit);
    if (params.companyId) q = q.eq('company_id', params.companyId);
    const { data, error } = await q;
    if (error) return [];
    return (data ?? []) as any;
  },

  async listPayrollBatches(params: { companyId: string | null; limit?: number }): Promise<PayrollBatchRow[]> {
    const limit = params.limit ?? 200;
    if (getMode() === 'rest') {
      const qs = new URLSearchParams();
      if (params.companyId) qs.set('companyId', params.companyId);
      qs.set('limit', String(limit));
      return await restJson<PayrollBatchRow[]>(`/payroll-batches?${qs.toString()}`);
    }
    if (!isSupabaseConfigured) return [];
    let q = supabase
      .from('payroll_batches')
      .select('id, name, salary_period, status, employee_count, total_gross, company_id')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (params.companyId) q = q.eq('company_id', params.companyId);
    const { data, error } = await q;
    if (error) return [];
    return (data ?? []) as any;
  },

  async listContracts(params: { companyId: string | null; limit?: number }): Promise<ContractRow[]> {
    const limit = params.limit ?? 200;
    if (getMode() === 'rest') {
      const qs = new URLSearchParams();
      if (params.companyId) qs.set('companyId', params.companyId);
      qs.set('limit', String(limit));
      return await restJson<ContractRow[]>(`/employee-contracts?${qs.toString()}`);
    }
    if (!isSupabaseConfigured) return [];
    let q = supabase
      .from('employee_contracts')
      .select('id, employee_name, employee_code, contract_type, status, effective_date, expiry_date, company_id')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (params.companyId) q = q.eq('company_id', params.companyId);
    const { data, error } = await q;
    if (error) return [];
    return (data ?? []) as any;
  },

  async listInsurance(params: { companyId: string | null; limit?: number }): Promise<InsuranceRow[]> {
    const limit = params.limit ?? 200;
    if (getMode() === 'rest') {
      const qs = new URLSearchParams();
      if (params.companyId) qs.set('companyId', params.companyId);
      qs.set('limit', String(limit));
      return await restJson<InsuranceRow[]>(`/insurance?${qs.toString()}`);
    }
    if (!isSupabaseConfigured) return [];
    let q = supabase
      .from('insurance')
      .select('id, employee_name, insurance_type, status, effective_date, company_id')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (params.companyId) q = q.eq('company_id', params.companyId);
    const { data, error } = await q;
    if (error) return [];
    return (data ?? []) as any;
  },

  async listDecisions(params: { companyId: string | null; limit?: number }): Promise<DecisionRow[]> {
    const limit = params.limit ?? 200;
    if (getMode() === 'rest') {
      const qs = new URLSearchParams();
      if (params.companyId) qs.set('companyId', params.companyId);
      qs.set('limit', String(limit));
      return await restJson<DecisionRow[]>(`/hr-decisions?${qs.toString()}`);
    }
    if (!isSupabaseConfigured) return [];
    let q = supabase
      .from('hr_decisions')
      .select('id, decision_number, decision_date, decision_type, employee_name, status, company_id')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (params.companyId) q = q.eq('company_id', params.companyId);
    const { data, error } = await q;
    if (error) return [];
    return (data ?? []) as any;
  },
};

