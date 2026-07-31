/**
 * @CODE-MEMORY
 * Screen:     /hr/insurance — Thêm BH participant payload
 * UC:         UF-HRM-04 · AC-E3-INS-PART · TC-HRM-HDSD-049
 * BR:         BR-HRM-INS-E3 · no orphan policy_id NULL
 * SRS:        docs/hrm/API_DESIGN_HRM_ERP_E3.md §13 DOC-DELTA soft-resolve
 * TechSpec:   API_DESIGN §13 · policy_id explicit when 0/AMBIG
 * Purpose:    Build POST/PATCH participant body; resolve active policy picker options;
 *             cấm orphan khi 0 active — FE gửi policy_id khi user chọn.
 * WorkItem:   D-HDSD-BF-03-BH-FE-PICKER-01
 * Coded:      2026-08-01
 * Callers:    AddInsuranceDialog · vitest
 * Callees:    —
 * Impact:     Thiếu policy_id khi 0/>1 active → BE 404/AMBIG
 * must_keep:  soft-resolve omit khi đúng 1 active vẫn hợp lệ; U65 no seed
 * SOLID:      Pure helpers tách khỏi Dialog
 * LastVerified: docs/qa/evidence/d-hdsd-bf-03-bh-fe-picker-01-20260801.md
 */
import type { InsuranceListItem } from '@/hooks/useInsuranceList';

/** ACTION_BUTTON_INVENTORY §10 — Link NV / Lưu participation (UF-HRM-04). */
export const ACT_HRM_INS_LINK_CAPABILITY = 'ACT-HRM-INS-LINK' as const;

/** Anchor CTA «Tạo chính sách BH» → InsurancePolicyMasterPanel. */
export const INSURANCE_POLICY_MASTER_ANCHOR_ID = 'insurance-policy-master-e3' as const;

export type InsuranceParticipantMutateMode = 'create' | 'update';

export type InsuranceParticipantMutateTarget = {
  mode: InsuranceParticipantMutateMode;
  participantId?: string;
};

/** Minimal policy shape for enroll picker (active-only). */
export type InsurancePolicyPickerRow = {
  id: string;
  policy_code: string;
  policy_name: string;
  insurer_key: string;
  insurance_type?: string;
  status: string;
};

export type InsuranceParticipantFormPayload = {
  employee_id?: string;
  employee_code: string;
  employee_name: string;
  department?: string;
  /** E3 — FK chính sách active; bắt buộc khi 0 soft-resolve / AMBIG. */
  policy_id?: string;
  /** E3 — catalog code (`insurance_types`); fallback legacy `all` when unset. */
  insurance_type?: string;
  /** E3 — catalog code (`insurers`). */
  insurer_key?: string;
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

/** Active policies only — enroll BE rejects draft/expired. */
export function filterActiveInsurancePolicies<T extends { status: string }>(
  rows: readonly T[],
): T[] {
  return rows.filter((row) => String(row.status).toLowerCase() === 'active');
}

/**
 * Picker options: prefer insurer_key match; fallback all active (AMBIG / no match).
 * Empty → FE must CTA create policy (cấm POST orphan).
 */
export function resolveInsurancePolicyPickerOptions<T extends InsurancePolicyPickerRow>(
  rows: readonly T[],
  insurerKey?: string | null,
): T[] {
  const active = filterActiveInsurancePolicies(rows);
  const key = insurerKey?.trim() ?? '';
  if (!key) return active;
  const matched = active.filter((row) => row.insurer_key === key);
  return matched.length > 0 ? matched : active;
}

/** True when FE must block Lưu / show CTA (0 active in picker scope). */
export function isInsuranceParticipantPolicyBlocked(
  pickerOptions: readonly { id: string }[],
): boolean {
  return pickerOptions.length === 0;
}

/** True when >1 candidates — must send explicit policy_id (BE AMBIG). */
export function isInsuranceParticipantPolicyAmbig(
  pickerOptions: readonly { id: string }[],
): boolean {
  return pickerOptions.length > 1;
}

export function formatInsurancePolicyPickerLabel(row: InsurancePolicyPickerRow): string {
  const code = row.policy_code?.trim() || '—';
  const name = row.policy_name?.trim() || code;
  return `${code} — ${name}`;
}

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
  const policyId = data.policy_id?.trim() || '';
  const body: Record<string, unknown> = {
    company_id: companyId,
    employee_id: data.employee_id ?? null,
    employee_code: data.employee_code,
    employee_name: data.employee_name,
    department: data.department ?? null,
    insurance_type: data.insurance_type?.trim() || 'all',
    insurer_key: data.insurer_key?.trim() || null,
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
  // Explicit policy_id only — cấm gửi null orphan; omit → BE soft-resolve khi đúng 1 active
  if (policyId) {
    body.policy_id = policyId;
  }
  return body;
}
