import type { InsuranceListItem } from '@/hooks/useInsuranceList';

/** ACTION_BUTTON_INVENTORY §10 — Link NV / Lưu participation (UF-HRM-04). */
export const ACT_HRM_INS_LINK_CAPABILITY = 'ACT-HRM-INS-LINK' as const;

export type InsuranceParticipantMutateMode = 'create' | 'update';

export type InsuranceParticipantMutateTarget = {
  mode: InsuranceParticipantMutateMode;
  participantId?: string;
};

export type InsuranceParticipantFormPayload = {
  employee_id?: string;
  employee_code: string;
  employee_name: string;
  department?: string;
  social_insurance_number?: string;
  health_insurance_number?: string;
  unemployment_insurance_number?: string;
  social_insurance_rate?: number;
  health_insurance_rate?: number;
  unemployment_insurance_rate?: number;
  base_salary: number;
  effective_date?: string;
  expiry_date?: string;
  status: 'active' | 'inactive' | 'expired' | 'pending';
  notes?: string;
};

/** Map employee_code → policy participant row id (ACT-HRM-INS-LINK PATCH target). */
export function buildPolicyParticipantIdByCode(
  rows: Record<string, unknown>[],
): Map<string, string> {
  const map = new Map<string, string>();
  for (const row of rows) {
    const code = String(row.employee_code ?? '').trim().toUpperCase();
    const id = String(row.id ?? '').trim();
    if (code && id) {
      map.set(code, id);
    }
  }
  return map;
}

export function resolveParticipantIdForListItem(
  item: Pick<InsuranceListItem, 'participant_id' | 'employee_code'>,
  participantIdsByCode: Map<string, string>,
): string | undefined {
  if (item.participant_id?.trim()) {
    return item.participant_id.trim();
  }
  const code = item.employee_code.trim().toUpperCase();
  if (!code || code === '—') return undefined;
  return participantIdsByCode.get(code);
}

export function attachParticipantIdToListItem(
  item: InsuranceListItem,
  participantIdsByCode: Map<string, string>,
): InsuranceListItem {
  const participantId = resolveParticipantIdForListItem(item, participantIdsByCode);
  if (!participantId || participantId === item.participant_id) {
    return participantId ? { ...item, participant_id: participantId } : item;
  }
  return { ...item, participant_id: participantId };
}

export function resolveInsuranceParticipantMutateTarget(
  editing: Pick<InsuranceListItem, 'participant_id' | 'employee_code'> | null | undefined,
  participantIdsByCode: Map<string, string>,
): InsuranceParticipantMutateTarget {
  if (!editing) {
    return { mode: 'create' };
  }
  const participantId = resolveParticipantIdForListItem(editing, participantIdsByCode);
  if (participantId) {
    return { mode: 'update', participantId };
  }
  return { mode: 'create' };
}

export function buildInsuranceParticipantApiPayload(
  companyId: string,
  data: InsuranceParticipantFormPayload,
): Record<string, unknown> {
  const status =
    data.status === 'pending' ? 'active' : data.status;
  return {
    company_id: companyId,
    employee_id: data.employee_id ?? null,
    employee_code: data.employee_code,
    employee_name: data.employee_name,
    department: data.department ?? null,
    insurance_type: 'all',
    social_insurance_number: data.social_insurance_number || null,
    health_insurance_number: data.health_insurance_number || null,
    unemployment_insurance_number: data.unemployment_insurance_number || null,
    social_insurance_rate: data.social_insurance_rate ?? null,
    health_insurance_rate: data.health_insurance_rate ?? null,
    unemployment_insurance_rate: data.unemployment_insurance_rate ?? null,
    base_salary: data.base_salary ?? 0,
    effective_date: data.effective_date?.slice(0, 10) ?? null,
    expiry_date: data.expiry_date?.slice(0, 10) ?? null,
    status,
    notes: data.notes ?? null,
  };
}
