/**
 * @CODE-MEMORY
 * Screen:     REC hire → ContractWorkspace create deep-link
 * UC:         FR-HRM-INT-01 · J-HRM-CTR-HIRE-CTA-01
 * WorkItem:   PO-HRM-CTR-WORKSPACE-WAVE-G3
 * Purpose:    Build CC contracts URL with NV + optional probation template prefill after hire.
 * must_keep:  U65 no seed · contracts_printable_ready=false
 */
import { buildContractWorkspacePath } from '@/lib/contractWorkspaceDeepLink';
import { hrmPathWithEmbedSearch } from '@/lib/hrmEmbedNavigation';

export function resolveProbationTemplateCode(
  templates: Array<{ template_code?: string | null; code?: string | null; status?: string | null }>,
): string | undefined {
  const active = templates.filter((t) => (t.status ?? 'active') === 'active');
  const hit = active.find((t) => {
    const code = (t.template_code ?? t.code ?? '').trim().toUpperCase();
    return code.startsWith('XEVN_PROBATION');
  });
  const code = (hit?.template_code ?? hit?.code ?? '').trim();
  return code || undefined;
}

export function buildContractHireCtaPath(
  employeeId: string,
  opts: { templateCode?: string; embedSearch?: string } = {},
): string {
  const prefill = {
    subject_type: 'employee' as const,
    employee_id: employeeId.trim(),
    lock_subject_employee: true,
    ...(opts.templateCode?.trim() ? { template_code: opts.templateCode.trim() } : {}),
  };
  const path = buildContractWorkspacePath('create', { prefill });
  return hrmPathWithEmbedSearch(path, opts.embedSearch);
}
