/**
 * @CODE-MEMORY
 * Screen:     /hr/insurance — policy master create/SM PATCH bodies
 * UC:         FR-HRM-INS-DEPTH-E3-01 · AC-INS-01 · AC-E3-INS-SM · TC-049 path
 * BR:         BR-HRM-INS-E3-01 · DTO whitelist Create/UpdateInsurancePolicyDto
 * SRS:        docs/hrm/API_DESIGN_HRM_ERP_E3.md §7 Create · §9 PATCH
 * TechSpec:   CreateInsurancePolicyDto (no insurer_label) · UpdateInsurancePolicyDto (no company_id)
 * Purpose:    Build POST/PATCH bodies khớp BE class-validator forbidNonWhitelisted;
 *             BE snapshot insurer_label từ catalog; company_id PATCH = query, không body.
 * WorkItem:   D-HDSD-BF-03-BH-POL-DTO-01
 * Coded:      2026-08-01
 * Callers:    InsurancePolicyMasterPanel · vitest
 * Callees:    —
 * Impact:     Gửi insurer_label / company_id body → 400 HRM-VAL-001
 * must_keep:  TC-049 enroll · SoftDel · AddInsuranceDialog picker · BE soft-resolve
 * SOLID:      Pure builders tách panel
 * LastVerified: docs/qa/evidence/d-hdsd-bf-03-bh-pol-dto-01-20260801.md
 */

import type { InsurancePolicyFormValues } from '@/lib/insurancePolicyFormSchema';
import type { InsurancePolicyStatus } from '@/lib/statusMachineE3';

/** POST body — CreateInsurancePolicyDto only (cấm insurer_label). */
export type InsurancePolicyCreateBody = {
  company_id: string;
  policy_code: string;
  policy_name: string;
  insurer_key: string;
  insurance_type: string;
  effective_date: string;
  expiry_date?: string;
  notes?: string;
  status?: 'draft' | 'active' | 'expired' | 'cancelled';
};

/** PATCH field body — UpdateInsurancePolicyDto (cấm company_id / insurer_label). */
export type InsurancePolicyUpdateBody = {
  policy_code?: string;
  policy_name?: string;
  insurer_key?: string;
  insurance_type?: string;
  effective_date?: string;
  expiry_date?: string | null;
  notes?: string | null;
  status?: InsurancePolicyStatus;
};

export function buildInsurancePolicyCreateBody(
  companyId: string,
  values: InsurancePolicyFormValues,
): InsurancePolicyCreateBody {
  const body: InsurancePolicyCreateBody = {
    company_id: companyId,
    policy_code: values.policy_code.trim(),
    policy_name: values.policy_name.trim(),
    insurer_key: values.insurer_key.trim(),
    insurance_type: values.insurance_type.trim(),
    effective_date: values.effective_date.trim(),
  };
  const expiry = values.expiry_date?.trim() ?? '';
  if (expiry) body.expiry_date = expiry;
  const notes = values.notes?.trim() ?? '';
  if (notes) body.notes = notes;
  return body;
}

/** Full-form PATCH (Sửa) — no company_id in body. */
export function buildInsurancePolicyUpdateBody(
  values: InsurancePolicyFormValues,
): InsurancePolicyUpdateBody {
  const body: InsurancePolicyUpdateBody = {
    policy_code: values.policy_code.trim(),
    policy_name: values.policy_name.trim(),
    insurer_key: values.insurer_key.trim(),
    insurance_type: values.insurance_type.trim(),
    effective_date: values.effective_date.trim(),
  };
  const expiry = values.expiry_date?.trim() ?? '';
  body.expiry_date = expiry || null;
  const notes = values.notes?.trim() ?? '';
  body.notes = notes || null;
  return body;
}

/** SM transition — status only (QA: {company_id,status} → 400; {status} → 200). */
export function buildInsurancePolicyStatusPatchBody(
  status: InsurancePolicyStatus,
): Pick<InsurancePolicyUpdateBody, 'status'> {
  return { status };
}
