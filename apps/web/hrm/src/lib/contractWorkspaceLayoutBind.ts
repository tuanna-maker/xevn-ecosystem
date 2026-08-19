/**
 * @CODE-MEMORY
 * Screen:     /contracts workspace view — GET clause_layout + can_issue bind
 * UC:         FR-UC-BP-CORE-09a · PO-HRM-CTR-WORKSPACE-SA-01 §4.1
 * WorkItem:   PO-HRM-CTR-WORKSPACE-FE-LAYOUT-BIND-01
 * Purpose:    Map GET detail layout to canvas + VI missing hints for In/PDF gate.
 * must_keep:  contracts_printable_ready=false · no inline body_vi editor
 */
import type {
  HrmContractClauseLayoutItem,
  HrmContractClauseRecord,
  HrmContractPreviewSummary,
} from '@/integrations/hrmApi';
import { labelForPrintOverrideField } from '@/lib/contractPrintFieldOverrides';
import { missingClauseLabels } from '@/lib/contractPackPreviewUx';

export function clauseLayoutToLibraryRecords(
  layout: HrmContractClauseLayoutItem[],
  companyId: string,
): HrmContractClauseRecord[] {
  return layout.map((row) => ({
    id: row.id,
    company_id: companyId,
    code: row.code,
    title_vi: row.title_vi,
    body_vi: row.body_vi,
    clause_group: row.clause_group,
    apply_to_packs: [],
    sort_order: row.sort_order,
    mandatory: row.mandatory,
    status: 'active',
    version: 1,
  }));
}

export function clauseIdsFromLayout(layout: HrmContractClauseLayoutItem[]): string[] {
  const seen = new Set<string>();
  return layout
    .map((row) => row.id)
    .filter((id) => {
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
}

/** VI hint for disabled In/PDF when GET can_issue=false. */
export function formatContractPreviewSummaryVi(
  summary: HrmContractPreviewSummary | null | undefined,
): string {
  if (!summary) return 'Chưa đủ điều kiện phát hành — hoàn thiện thông tin hợp đồng và điều khoản.';
  const parts: string[] = [];
  const fields = summary.missing_fields ?? [];
  if (fields.length > 0) {
    parts.push(
      `Thiếu thông tin: ${fields
        .map((m) =>
          m.message
            ? `${labelForPrintOverrideField(m.field)} (${m.message})`
            : labelForPrintOverrideField(m.field),
        )
        .join(', ')}`,
    );
  }
  const clauses = missingClauseLabels(summary.missing_clauses);
  if (clauses.length > 0) {
    parts.push(`Thiếu điều khoản: ${clauses.join(', ')}`);
  }
  if (parts.length === 0) {
    return 'Chưa đủ điều kiện phát hành — kiểm tra mẫu in và thông tin hợp đồng.';
  }
  return parts.join(' · ');
}
