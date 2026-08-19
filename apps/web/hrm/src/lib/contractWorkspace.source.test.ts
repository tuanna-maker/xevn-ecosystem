/**
 * PO-HRM-CTR-WORKSPACE-WAVE-G3 — unified workspace source lock
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  buildContractWorkspacePath,
  mergePortalParentWorkspaceSearch,
  parseContractWorkspaceSearch,
  resolveContractWorkspaceSearch,
  subjectStateFromPrefill,
} from './contractWorkspaceDeepLink';

const root = join(__dirname, '..');

function read(rel: string): string {
  return readFileSync(join(root, rel), 'utf8');
}

function codeOnly(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '');
}

describe('PO-HRM-CTR-WORKSPACE-WAVE-G3', () => {
  it('NV-first default subject_type employee', () => {
    expect(subjectStateFromPrefill(undefined).subject_type).toBe('employee');
    const state = read('lib/contractCreateWizardState.ts');
    expect(state).toContain("subject_type: 'employee'");
  });

  it('deep-link parse create with employee prefill', () => {
    const parsed = parseContractWorkspaceSearch(
      '?workspace=create&employee_id=emp-1&subject_type=employee',
    );
    expect(parsed.mode).toBe('create');
    expect(parsed.prefill.employee_id).toBe('emp-1');
    expect(buildContractWorkspacePath('view', { contractId: 'ctr-9' })).toContain(
      'workspace=view',
    );
    expect(buildContractWorkspacePath('view', { contractId: 'ctr-9' })).toContain(
      'contractId=ctr-9',
    );
  });

  it('Contracts mounts ContractWorkspaceDialog (replaces split view dialog)', () => {
    const page = codeOnly(read('pages/Contracts.tsx'));
    expect(page).toContain('ContractWorkspaceDialog');
    expect(page).not.toContain('viewDialogOpen');
    expect(page).toContain('workspaceMode');
    expect(page).toContain('resolveContractWorkspaceSearch');
    expect(page).not.toMatch(/contracts_printable_ready\s*=\s*true/);
  });

  it('deep-link merge — parent portal workspace params (G4 edit)', () => {
    expect(typeof mergePortalParentWorkspaceSearch).toBe('function');
    expect(typeof resolveContractWorkspaceSearch).toBe('function');
    const merged = mergePortalParentWorkspaceSearch(
      '?portal=1&workspace=view&contractId=ctr-9',
    );
    expect(merged).toContain('workspace=view');
    expect(merged).toContain('contractId=ctr-9');
  });

  it('ContractWorkspaceDialog — create|edit|view modes + HDSD testids', () => {
    const dlg = read('components/contracts/ContractWorkspaceDialog.tsx');
    expect(dlg).toContain("ContractWorkspaceMode");
    expect(dlg).toContain('data-ctr-workspace-mode={mode}');
    expect(dlg).toContain('HDSD_MUTATE_TEST_IDS.contractsViewDialog');
    expect(dlg).toContain('HDSD_MUTATE_TEST_IDS.contractsFormDialog');
    expect(dlg).toContain('ContractWorkspaceViewBody');
  });

  it('useContractPrintSpine hook + panel re-export', () => {
    const hook = read('hooks/useContractPrintSpine.ts');
    expect(hook).toContain('previewContractPrint');
    expect(hook).toContain('fetchContractPrintPdf');
    const panel = read('components/contracts/ContractPrintSpinePanel.tsx');
    expect(panel).toContain("export { useContractPrintSpine }");
  });

  it('EmployeeContracts deep-links workspace with employee_id', () => {
    const ec = read('components/employee/EmployeeContracts.tsx');
    expect(ec).toContain('openContractWorkspace');
    expect(ec).toContain('buildContractWorkspacePath');
    expect(ec).toContain('employee_id: employeeId');
  });

  it('REC hire CTA Tạo HĐ deep-link', () => {
    const rec = read('components/recruitment/CandidateAcceptOfferDialog.tsx');
    expect(rec).toContain('rec-accept-offer-create-contract');
    expect(rec).toContain('Tạo HĐ');
    expect(rec).toContain('buildContractWorkspacePath');
    const detail = read('components/recruitment/CandidateDetailView.tsx');
    expect(detail).toContain('ContractHireCreateCta');
    const hireCtaCmp = read('components/contracts/ContractHireCreateCta.tsx');
    expect(hireCtaCmp).toContain('rec-hire-cta-create-contract');
    const hireCta = read('lib/contractWorkspaceHireCta.ts');
    expect(hireCta).toContain('lock_subject_employee: true');
  });

  it('Step1 NV tab before UV tab (BA-03 NV-first)', () => {
    const step1 = read('components/contracts/ContractCreateStep1GeneralGrid.tsx');
    const empIdx = step1.indexOf('ctr-create-subject-tab-employee');
    const candIdx = step1.indexOf('ctr-create-subject-tab-candidate');
    expect(empIdx).toBeGreaterThan(-1);
    expect(candIdx).toBeGreaterThan(empIdx);
    expect(step1).toContain('hideCandidateSubject');
  });

  it('BR-CTR-CREATE-08 — NV candidate_id null shows non-blocking REC banner (G4)', () => {
    const step1 = codeOnly(read('components/contracts/ContractCreateStep1GeneralGrid.tsx'));
    const banner = read('lib/contractEmployeeRecBanner.ts');
    expect(step1).toContain('shouldShowEmployeeRecruitmentBanner');
    expect(step1).toContain('CTR_CREATE_EMPLOYEE_REC_BANNER_TEST_ID');
    expect(step1).toContain('ctr-create-employee-rec-link');
    expect(step1).toContain('CTR_CREATE_EMPLOYEE_REC_BANNER_LINK_LABEL');
    expect(step1).not.toContain('!contextSnapshot');
    expect(banner).toContain("ctr-create-employee-rec-hint");
    expect(banner).toContain('candidate_id');
    expect(banner).toContain("subjectType !== 'employee'");
  });

  it('Step2 readOnly for workspace view', () => {
    const step2 = read('components/contracts/ContractCreateStep2ClausePreview.tsx');
    expect(step2).toContain('readOnly?: boolean');
    expect(step2).toContain('initialClauseLayout');
    expect(step2).toContain('chỉ xem');
    const viewBody = read('components/contracts/ContractWorkspaceViewBody.tsx');
    expect(viewBody).toContain('initialClauseLayout={contract.clause_layout}');
    expect(viewBody).toContain('ctr-workspace-view-issue-blocked-hint');
    expect(viewBody).toContain('formatContractPreviewSummaryVi');
  });

  it('GET layout bind — types + mapper (PO-HRM-CTR-WORKSPACE-FE-LAYOUT-BIND-01)', () => {
    const api = read('integrations/hrmApi.ts');
    expect(api).toContain('HrmContractClauseLayoutItem');
    expect(api).toContain('clause_layout?: HrmContractClauseLayoutItem[]');
    expect(api).toContain('preview_summary?: HrmContractPreviewSummary');
    const mapper = read('lib/contractWorkspaceLayoutBind.ts');
    expect(mapper).toContain('clauseLayoutToLibraryRecords');
    expect(mapper).toContain('formatContractPreviewSummaryVi');
    const contracts = read('hooks/useContracts.ts');
    expect(contracts).toContain('clause_layout: row.clause_layout');
    expect(contracts).toContain('can_issue: row.can_issue');
  });

  it('profile URL sync — iframe workspace params to parent portal (G4 P2)', () => {
    const sync = read('lib/hrmPortalUrlSync.ts');
    expect(sync).toContain('applyIframeWorkspaceParamsToParent');
    const portalSync = read('components/layout/PortalEmbedRouterSync.tsx');
    expect(portalSync).toContain('location.search');
    const deepLink = read('lib/contractWorkspaceDeepLink.ts');
    expect(deepLink).toContain('applyIframeWorkspaceParamsToParent');
  });
});
