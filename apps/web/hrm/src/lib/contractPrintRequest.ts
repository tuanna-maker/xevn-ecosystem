/**
 * @CODE-MEMORY
 * Screen:     /contracts — spine preview / print-version / PDF
 * UC:         FR-UC-BP-CORE-09c · AC-CTR-PRINT-01..08
 * BR:         ContractPreviewDto / CreatePrintVersionDto forbidNonWhitelisted — no company_id in body
 * SRS:        docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-SPEC-01.md §D
 * TechSpec:   docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-TECHSPEC-01.md · DATA-01 §5.8–5.12
 * Purpose:    Build POST body + query scope for preview/print-versions —
 *             company_id chỉ trên ?company_id= (và header nếu có); cấm JSON body.
 * WorkItem:   PO-HRM-CONTRACT-LEGAL-PRINT-FE-02
 * Coded:      2026-08-06
 * Callers:    hrmApi previewContractPrint · createContractPrintVersion
 * Callees:    normalizeHrmApiListCompanyId
 * Impact:     Gửi company_id trong body → 400 HRM-VAL-001 (R-CTR-PREVIEW-COMPANY-ID-BODY)
 * must_keep:  SI InsuranceActionDto vẫn có body company_id — không đụng builders đó
 * SOLID:      Pure builder tách hrmApi / panel
 * LastVerified: contractPrintRequest.test.ts · docs/qa/evidence/po-hrm-contract-legal-print-fe-02.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-CONTRACT-LEGAL-PRINT-FE-02
 * What: Extract builder — strip company_id from POST JSON; keep on query
 * Why: QA-01 FAIL R-CTR-PREVIEW-COMPANY-ID-BODY P0
 * must_keep: UF-HRM-02 · Settings clause/template DnD FE-01 · SI body company_id elsewhere
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-FE-01
 * change_mode: EXPAND
 * What: Optional template_code on preview/print body (open catalog any active code)
 * Why: XEVN-TPL BE PREV/VER accept template_code; pack optional when template bound
 * must_keep: company_id query-only; no hardcode 8 codes
 */

import { normalizeHrmApiListCompanyId } from '@/lib/hrmListScope';
import { normalizeTemplateCode } from '@/lib/contractTemplateCatalog';

/** Params from UI — company_id is scope, never POST JSON. */
export type ContractPrintMutateInput = {
  company_id: string;
  /** Optional when template_id / template_code set (BE ValidateIf). */
  pack_code?: string;
  template_id?: string;
  /** Open catalog — any active HR-created code (not starter-8 enum). */
  template_code?: string;
  field_overrides?: Record<string, unknown>;
  can_view_cb?: boolean;
};

/** Matches ContractPreviewDto / CreatePrintVersionDto whitelist. */
export type ContractPrintMutateBody = {
  pack_code?: string;
  template_id?: string;
  template_code?: string;
  field_overrides?: Record<string, unknown>;
  can_view_cb?: boolean;
};

export type ContractPrintMutateRequest = {
  /** Normalized value for `?company_id=` */
  companyIdQuery: string;
  body: ContractPrintMutateBody;
};

/**
 * Preview / create-print-version: scope via query only.
 * Does not put `company_id` on the JSON body (BE forbidNonWhitelisted).
 */
export function buildContractPrintMutateRequest(
  input: ContractPrintMutateInput,
): ContractPrintMutateRequest {
  const companyIdQuery = normalizeHrmApiListCompanyId(input.company_id);
  const body: ContractPrintMutateBody = {};
  const pack = String(input.pack_code ?? '').trim();
  if (pack) body.pack_code = pack;
  const templateId = input.template_id?.trim();
  if (templateId) body.template_id = templateId;
  const templateCode = normalizeTemplateCode(input.template_code);
  if (templateCode) body.template_code = templateCode;
  if (input.field_overrides && typeof input.field_overrides === 'object') {
    body.field_overrides = input.field_overrides;
  }
  if (typeof input.can_view_cb === 'boolean') {
    body.can_view_cb = input.can_view_cb;
  }
  return { companyIdQuery, body };
}
