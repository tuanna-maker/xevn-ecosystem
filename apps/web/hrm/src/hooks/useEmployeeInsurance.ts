/**

 * @CODE-MEMORY

 * Screen:     EmployeeProfile → BH / tài chính — enrollment list hook

 * UC:         FR-UC-BP-CORE-10 · AC-SI-TL-01..05

 * BR:         enrollment id === list id; amounts display-ready only (no FE invent)

 * SRS:        docs/program/specs/PO-HRM-E2E-LINK-EMP-SPEC-01.md §D.5

 * TechSpec:   docs/program/specs/PO-HRM-E2E-LINK-EMP-SA-01.md F-CORE-SI-02/03

 * Purpose:    Load employee-insurances SoT + map enrollment_id; enrich periods via get-by-id.

 * WorkItem:   PO-HRM-E2E-LINK-EMP-FE-03

 * Coded:      2026-08-06

 * Callers:    EmployeeInsurance.tsx

 * Callees:    listEmployeeInsurances · getEmployeeInsurance · CRUD helpers

 * FEActions:  Tab Insurance → list → timeline actions → refetch

 * BEChain:    GET /employee-insurances · GET /:id (periods) · POST /:id/actions

 * Impact:     Wrong id → actions 404; invent amounts → OS 28 FAIL

 * must_keep:  SoftDel CRUD; U65; D2/D6/FE-02 QSĐ untouched

 * SOLID:      Hook owns fetch+map; panel owns action UI

 * LastVerified: docs/qa/evidence/po-hrm-e2e-link-emp-fe-03.md

 *

 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-E2E-LINK-EMP-FE-03

 * change_mode: FIX

 * What: enrollment_id===id map; get-by-id periods enrich; export mapInsuranceEnrollmentRow

 * Why: R-EMP-SI-FE-ACTION-UI — profile must bind enrollment SoT for CORE-10 actions

 * must_keep: CRUD benefit/insurance; no FE formulas; U65

 *

 * @CODE-MEMORY-CHANGE 2026-08-08 PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-FE-01

 * change_mode: FIX

 * What: InsuranceItem.type = open string (Nest EFF key); preserve raw type on map (no coerce to social enum)

 * Why: AC-PLT-SI-INS-ENR · VAL-SI-CNS-02 — enrollment type ∈ F-SI-CAT-EFF

 * must_keep: SoftDel CRUD; timeline F-CORE-SI-03; U65; printable/personnel false

 *

 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-CORE-02-CLUSTER-FE-01

 * change_mode: UPGRADE

 * What: updateInsurance — contribution delta → POST …/actions change_rate; PATCH omits contrib keys

 * Why: API-01 SI PATCH fail-closed prefer · F-CORE-SI-RATE · AC-CORE-02-07/08

 * must_keep: SoftDel · employee-insurances SoT · no Nest /core · U65 · honesty false · CORE-01≠C&B DONE

 *

 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-CORE-10-CLUSTER-FE-01

 * change_mode: UPGRADE

 * What: mapInsuranceEnrollmentRow → statusLabelVi FE-derive (R-CORE-10-DISP); BH «Hoạt động»=enrollment active

 * Why: API-01 CONFIRMED RETAIN · UC-BP-CORE-10 · DENY Nest /core · DENY conflate CORE-07 activate

 * must_keep: SoftDel · employee-insurances SoT · CORE-09 printable false · CORE-07 GATE/ACT · soft≠CORE-06 DONE · U65

 */

import { useState, useEffect, useCallback } from 'react';

import { format } from 'date-fns';

import { toast } from 'sonner';

import { useAuth } from '@/contexts/AuthContext';

import { toErrorMessage } from '@/lib/apiError';

import { splitSiEnrollmentUpdate } from '@/lib/empCoreCbRing';

import { resolveInsuranceStatusLabelVi } from '@/lib/empCoreSiRing';

import { buildInsuranceActionBody } from '@/lib/insuranceTimelineActions';

import {

  createEmployeeBenefit,

  createEmployeeInsurance,

  deleteEmployeeBenefit,

  deleteEmployeeInsurance,

  getEmployeeInsurance,

  listEmployeeBenefits,

  listEmployeeInsurances,

  postEmployeeInsuranceAction,

  updateEmployeeBenefit,

  updateEmployeeInsurance,

  type HrmEmployeeBenefitRow,

  type HrmEmployeeInsuranceRow,

} from '@/integrations/hrmApi';



export interface InsuranceItem {

  id: string;

  /** Always equals enrollment SoT PK (enrollment_id ?? id). */

  enrollment_id: string;

  employee_id: string;

  company_id: string;

  type: string;

  provider: string;

  policy_number: string | null;

  start_date: string | null;

  end_date: string | null;

  contribution: number;

  employer_contribution: number;

  status: 'active' | 'expired' | 'pending' | 'suspended' | 'stopped' | 'closed';

  /** R-CORE-10-DISP — FE-derive; BH «Hoạt động» = enrollment active (≠ CORE-07). */
  statusLabelVi: string;

  notes: string | null;

  created_at: string;

  updated_at: string;

  periods?: unknown;

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



/** Map enrollment SoT row — id for actions = enrollment_id ?? id (BE-02 parity). */

export function mapInsuranceEnrollmentRow(row: HrmEmployeeInsuranceRow): InsuranceItem {

  const enrollmentId = String(row.enrollment_id ?? row.id ?? '').trim() || row.id;

  const type = row.type as InsuranceItem['type'];

  const status = row.status as InsuranceItem['status'];

  const statusOk = (

    ['active', 'expired', 'pending', 'suspended', 'stopped', 'closed'] as const

  ).includes(status as InsuranceItem['status']);

  const resolvedStatus = statusOk ? status : 'active';

  const beLabel =

    (row as { statusLabelVi?: string | null; status_label_vi?: string | null })

      .statusLabelVi ??

    (row as { status_label_vi?: string | null }).status_label_vi ??

    null;

  return {

    id: enrollmentId,

    enrollment_id: enrollmentId,

    employee_id: row.employee_id,

    company_id: row.company_id,

    type: String(type || '').trim() || 'social',

    provider: row.provider,

    policy_number: row.policy_number,

    start_date: row.start_date,

    end_date: row.end_date,

    contribution: Number(row.contribution ?? 0),

    employer_contribution: Number(row.employer_contribution ?? 0),

    status: resolvedStatus,

    statusLabelVi: resolveInsuranceStatusLabelVi(resolvedStatus, beLabel),

    notes: row.notes,

    created_at: row.created_at,

    updated_at: row.updated_at,

    periods: row.periods,

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

      const listed = (insuranceRes.data ?? []).map(mapInsuranceEnrollmentRow);

      // List may omit periods[] — enrich via get-by-id (display-ready only).

      const enriched = await Promise.all(

        listed.map(async (row) => {

          try {

            const detail = await getEmployeeInsurance(row.id, currentCompanyId);

            return mapInsuranceEnrollmentRow(detail);

          } catch {

            return row;

          }

        }),

      );

      setInsurances(enriched);

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

    const previous = insurances.find((row) => row.id === id);

    const { metaOnly, rateChange } = splitSiEnrollmentUpdate({

      previous: {

        contribution: previous?.contribution,

        employer_contribution: previous?.employer_contribution,

      },

      next: data as Record<string, unknown> & {

        contribution?: number | null;

        employer_contribution?: number | null;

      },

    });

    try {

      if (rateChange) {

        const built = buildInsuranceActionBody({

          company_id: currentCompanyId,

          action: 'change_rate',

          effective_from: format(new Date(), 'yyyy-MM-dd'),

          contribution: rateChange.contribution,

          employer_contribution: rateChange.employer_contribution,

          notes: typeof data.notes === 'string' ? data.notes : undefined,

        });

        if (!built.ok) {

          const msg = built.message;

          setFetchError(msg);

          toast.error(msg);

          return false;

        }

        await postEmployeeInsuranceAction(id, currentCompanyId, built.body);

      }

      const metaPayload: Record<string, unknown> = { company_id: currentCompanyId };

      for (const [key, value] of Object.entries(metaOnly)) {

        if (value !== undefined) metaPayload[key] = value;

      }

      const metaKeys = Object.keys(metaPayload).filter((k) => k !== 'company_id');

      if (metaKeys.length > 0) {

        await updateEmployeeInsurance(id, metaPayload as Parameters<typeof updateEmployeeInsurance>[1]);

      }

      await fetchData();

      return true;

    } catch (error: unknown) {

      console.error('updateInsurance:', error);

      const message = toErrorMessage(error, 'Không thể cập nhật bảo hiểm');

      setFetchError(message);

      toast.error(message);

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


