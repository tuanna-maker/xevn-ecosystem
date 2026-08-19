/**
 * PO-HRM-E2E-LINK-EMP-FE-J03-01 — J-HRM-03 Eye / view dialog HDSD wiring lock.
 * PO-HRM-CTR-WORKSPACE-WAVE-G3 — view mode moved to ContractWorkspaceDialog.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const contractsPage = readFileSync(resolve(__dirname, './Contracts.tsx'), 'utf8');
const workspaceDialog = readFileSync(
  resolve(__dirname, '../components/contracts/ContractWorkspaceDialog.tsx'),
  'utf8',
);
const viewBody = readFileSync(
  resolve(__dirname, '../components/contracts/ContractWorkspaceViewBody.tsx'),
  'utf8',
);

describe('Contracts view dialog J-HRM-03 wiring', () => {
  it('wires Eye open control + workspace mount + iframe latch HDSD testids', () => {
    expect(contractsPage).toContain('HDSD_MUTATE_TEST_IDS.contractsViewBtn');
    expect(workspaceDialog).toContain('HDSD_MUTATE_TEST_IDS.contractsViewDialog');
    expect(workspaceDialog).toContain('HDSD_MUTATE_TEST_IDS.contractsViewDialogOpen');
    expect(contractsPage).toContain('ContractWorkspaceDialog');
  });

  it('keeps accessible Chi tiết text on Eye (harness hasText)', () => {
    expect(contractsPage).toContain("t('contracts.viewTitle')");
    expect(contractsPage).toContain('className="sr-only"');
    expect(contractsPage).toMatch(/handleOpenView\(contract\)/);
  });

  it('marks view DialogContent as parent-portaled (CC embed)', () => {
    expect(workspaceDialog).toContain('data-hrm-dialog-portal="parent"');
    expect(workspaceDialog).toContain('data-testid={dialogTestId}');
    expect(workspaceDialog).toContain('HDSD_MUTATE_TEST_IDS.contractsViewDialog');
  });

  it('D-PO-HRM-CTR-VIEW-SYNC-01 — GET-by-id + ~90vw shell (not max-w-lg snapshot)', () => {
    expect(workspaceDialog).toContain('getEmployeeContractById');
    expect(workspaceDialog).toContain("queryKey: ['contract-workspace-view'");
    expect(workspaceDialog).toContain('HRM_DIALOG_FULL_VIEWPORT_CONTENT_CLASS');
    expect(workspaceDialog).not.toContain('className="max-w-lg"');
    expect(viewBody).toContain('hdsd-contracts-view-party');
    expect(viewBody).toContain('hdsd-contracts-view-abstract');
  });

  it('must_keep UF-HRM-02 create/edit form dialog ids', () => {
    expect(workspaceDialog).toContain('HDSD_MUTATE_TEST_IDS.contractsFormDialog');
    expect(contractsPage).toContain('HDSD_MUTATE_TEST_IDS.contractsCreateBtn');
    const wizard = readFileSync(
      resolve(__dirname, '../components/contracts/ContractCreateWizardDialog.tsx'),
      'utf8',
    );
    expect(wizard).toContain('HDSD_MUTATE_TEST_IDS.contractsFormSubmit');
  });
});
