/**
 * @CODE-MEMORY
 * Screen:     /insurance — policy master form (Zod)
 * UC:         FR-HRM-INS-DEPTH-E3-01 · AC-E3-ZOD-I-01 · AC-INS-01..03
 * BR:         BR-HRM-INS-E3-01 · BR-HRM-ZOD-E3-01
 * SRS:        docs/program/deltas/BA_ERP_E3_SRS_01_20260728.md §3.4
 * TechSpec:   docs/hrm/API_DESIGN_HRM_ERP_E3.md §7/§9
 * Purpose:    Schema Zod policy — required code/name/insurer_key/insurance_type/effective_date; catalog refine.
 * WorkItem:   D-FE-ERP-E3-01
 * Coded:      2026-07-28
 * Callers:    InsurancePolicyMasterPanel · vitest
 * Callees:    zod
 * must_keep:  Pure factory; empty catalog → chặn Lưu khi required; cấm HARDCODE SoT
 * SOLID:      Pure schema factory
 * LastVerified: docs/qa/evidence/d-fe-erp-e3-01-20260728.md
 */

import { z } from 'zod';

export type InsurancePolicyFormMessages = {
  codeRequired: string;
  nameRequired: string;
  insurerRequired: string;
  insurerNotInCatalog: string;
  typeRequired: string;
  typeNotInCatalog: string;
  effectiveRequired: string;
  dateOrder: string;
};

export function createInsurancePolicyFormSchema(
  messages: InsurancePolicyFormMessages,
  getAllowedInsurerCodes: () => readonly string[] = () => [],
  getAllowedTypeCodes: () => readonly string[] = () => [],
) {
  return z
    .object({
      policy_code: z.string().trim().min(1, messages.codeRequired),
      policy_name: z.string().trim().min(1, messages.nameRequired),
      insurer_key: z.string().trim().min(1, messages.insurerRequired),
      insurance_type: z.string().trim().min(1, messages.typeRequired),
      effective_date: z.string().trim().min(1, messages.effectiveRequired),
      expiry_date: z.string().trim().optional().or(z.literal('')),
      notes: z.string().trim().optional().or(z.literal('')),
    })
    .superRefine((val, ctx) => {
      const insurers = getAllowedInsurerCodes();
      const insurer = val.insurer_key.trim();
      if (insurers.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: messages.insurerNotInCatalog,
          path: ['insurer_key'],
        });
      } else if (!insurers.includes(insurer)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: messages.insurerNotInCatalog,
          path: ['insurer_key'],
        });
      }
      const types = getAllowedTypeCodes();
      const type = val.insurance_type.trim();
      if (types.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: messages.typeNotInCatalog,
          path: ['insurance_type'],
        });
      } else if (!types.includes(type)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: messages.typeNotInCatalog,
          path: ['insurance_type'],
        });
      }
      const exp = val.expiry_date?.trim() ?? '';
      if (exp && val.effective_date && exp < val.effective_date) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: messages.dateOrder, path: ['expiry_date'] });
      }
    });
}

export type InsurancePolicyFormValues = z.infer<ReturnType<typeof createInsurancePolicyFormSchema>>;
