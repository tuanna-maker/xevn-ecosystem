/**
 * Source lock — PO-HRM-CTR-CREATE-REDESIGN-FE-01
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = join(__dirname, '..');

function read(rel: string): string {
  return readFileSync(join(root, rel), 'utf8');
}

function codeOnly(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '');
}

describe('PO-HRM-CTR-CREATE-REDESIGN-FE-01 source lock', () => {
  it('Contracts mounts wizard — no print spine / user honesty in create dialog', () => {
    const page = read('pages/Contracts.tsx');
    const body = codeOnly(page);
    expect(body).toContain('ContractWorkspaceDialog');
    expect(body).not.toContain('ContractPrintSpinePanel');
    expect(body).not.toContain('ctr-core09-registry-honesty');
    expect(body).not.toContain('core09HonestyBannerText');
    expect(body).not.toMatch(/contracts_printable_ready\s*=\s*true/);
    expect(body).toContain('ctr-create-list-hint');
    expect(body).toContain('AC-CTR-XEVN-08');
  });

  it('Step2 wizard cấm syncContractTemplateClauseBind', () => {
    const step2 = codeOnly(read('components/contracts/ContractCreateStep2ClausePreview.tsx'));
    expect(step2).not.toContain('syncContractTemplateClauseBind');
    expect(step2).toContain('ctr-create-clause-palette');
    expect(step2).toContain('ctr-create-clause-canvas');
    expect(step2).toContain('putContractPrintOverlay');
    expect(step2).toContain('previewContractCreatePrint');
    expect(step2).toContain('clause_ids');
  });

  it('FE-02 LIVE context + overlay default-on (PO-HRM-CTR-CREATE-REDESIGN-FE-02)', () => {
    const api = codeOnly(read('lib/contractCreateApi.ts'));
    expect(api).toContain('contract-create-context');
    expect(api).toContain('print-overlay');
    expect(api).toContain('previewContractCreatePrint');
    expect(api).not.toContain('QA BLOCKED: PUT print-overlay');
    expect(api).toContain('CONTRACT_PRINT_OVERLAY_LIVE');
  });

  it('Contracts create dialog — parent portal ~90% (FE-03)', () => {
    const page = codeOnly(read('pages/Contracts.tsx'));
    const workspace = codeOnly(read('components/contracts/ContractWorkspaceDialog.tsx'));
    expect(page).not.toContain('portalScope="iframe"');
    expect(workspace).toContain('data-hrm-dialog-portal="parent"');
    expect(workspace).toContain('HRM_DIALOG_FULL_VIEWPORT_CONTENT_CLASS');
    expect(read('lib/hrmDialogFullViewport.ts')).toContain('90vw');
    expect(read('lib/hrmDialogFullViewport.ts')).toContain('90vh');
  });

  it('Step1 BA-02 subject + GĐ1 fields (FE-03)', () => {
    const step1 = codeOnly(read('components/contracts/ContractCreateStep1GeneralGrid.tsx'));
    expect(step1).toContain('ctr-create-subject-tab-candidate');
    expect(step1).toContain('ctr-create-subject-tab-employee');
    expect(step1).toContain('ctr-create-contract-name-readonly');
    expect(step1).toContain('ctr-create-salary-ratio');
    expect(step1).toContain('ctr-create-abstract');
    expect(step1).not.toContain('ContractAllowancesSubGrid');
  });

  it('Step2 Gỡ mandatory confirm (FE-03)', () => {
    const step2 = codeOnly(read('components/contracts/ContractCreateStep2ClausePreview.tsx'));
    expect(step2).toContain('bắt buộc theo mẫu');
  });

  it('Step2 uses HrmDragDropContext for parent-portal CC (FE-04)', () => {
    const step2 = codeOnly(read('components/contracts/ContractCreateStep2ClausePreview.tsx'));
    expect(step2).toContain('HrmDragDropContext');
    expect(step2).toContain('ctr-create-clause-dnd-ready');
    expect(step2).not.toContain('setDndReady');
    expect(step2).not.toMatch(/<DragDropContext onDragEnd/);
    const dnd = read('components/contracts/HrmDragDropContext.tsx');
    expect(dnd).toContain('installHrmPangeaParentPortalQueryPatch');
  });

  it('main bootstraps pangea parent-portal query patch (FE-04)', () => {
    const main = read('main.tsx');
    expect(main).toContain('installHrmPangeaParentPortalQueryPatch');
  });

  it('Step1 UV picker inline search + always-visible C&B card (FE-04)', () => {
    const step1 = codeOnly(read('components/contracts/ContractCreateStep1GeneralGrid.tsx'));
    // PO-HRM-CTR-CREATE-PICKER-INLINE-PORTAL-CONDITIONAL-01: searchPlacement điều kiện theo portal mode,
    // không hardcode chết 1 mode — inline chỉ áp khi CC portal-embed, popover khi standalone.
    expect(step1).toContain('getHrmPortalMode');
    expect(step1).toContain("? 'inline' : 'popover'");
    expect(step1).toContain('searchPlacement={catalogSearchPlacement}');
    expect(step1).toContain('ctr-create-candidate-picker');
    expect(step1).toContain('<ContractCbReadOnlyCard');
  });

  it('HRM-CTR-CREATE-REDESIGN-FE-02 — wizard list scope + step2 canvas dirty wire', () => {
    const wizard = codeOnly(read('components/contracts/ContractCreateWizardDialog.tsx'));
    expect(wizard).toContain('normalizeHrmApiListCompanyId');
    expect(wizard).toContain('listCompanyId');
    expect(wizard).toContain('ctr-create-wizard-root');
    expect(wizard).toContain('onCanvasChange={() => setClauseOrderDirty(true)}');
    const step2 = codeOnly(read('components/contracts/ContractCreateStep2ClausePreview.tsx'));
    expect(step2).toContain('onCanvasChange?: () => void');
    expect(step2).toContain('data-company-id={companyId}');
  });

  it('CatalogSearchPicker inline — combobox testid + inline option list (PICKER-INLINE-PORTAL-01)', () => {
    const picker = read('components/common/CatalogSearchPicker.tsx');
    expect(picker).toContain('`${dataTestId}-combobox`');
    expect(picker).toContain('catalog-picker-option-');
    expect(picker).toContain('showInlineList');
  });

  it('Step1 AMIS grid testids', () => {
    const step1 = codeOnly(read('components/contracts/ContractCreateStep1GeneralGrid.tsx'));
    const cbCard = codeOnly(read('components/contracts/ContractCbReadOnlyCard.tsx'));
    expect(step1).toContain('ctr-create-step-1');
    expect(step1).toContain('ctr-create-template-combobox');
    expect(step1).toContain('ctr-create-registry-only-link');
    expect(step1).toContain('ctr-create-template-settings-cta');
    expect(cbCard).toContain('ctr-create-cb-card');
  });

  it('HRM-CTR-CREATE-REDESIGN-FE-03 — form-ready catalogs only + template empty CTA', () => {
    const resolver = read('components/contracts/contractFormFieldResolver.ts');
    expect(resolver).toContain('isContractCreateWizardFormReady');
    const page = codeOnly(read('pages/Contracts.tsx'));
    expect(page).toContain('isContractCreateWizardFormReady');
    const wizard = codeOnly(read('components/contracts/ContractCreateWizardDialog.tsx'));
    expect(wizard).toContain('!templatesLoading');
    const step1 = read('components/contracts/ContractCreateStep1GeneralGrid.tsx');
    expect(step1).toContain('ctr-create-no-active-template-banner');
    expect(step1).toContain('settings?tab=contract-templates');
  });

  it('PO-HRM-EMPLOYMENT-TYPES-CONSUMER-CTR-FE-01 — work_arrangement catalog picker', () => {
    const step1 = codeOnly(read('components/contracts/ContractCreateStep1GeneralGrid.tsx'));
    expect(step1).not.toContain('WORK_ARRANGEMENT_OPTIONS');
    expect(step1).toContain('useEmpEmploymentTypesEffective');
    expect(step1).toContain('ctr-create-work-arrangement');
    expect(step1).toContain('work_arrangement: v');
    expect(step1).toContain('ctr-create-work-arrangement-settings-cta');
    expect(step1).toContain('searchPlacement={catalogSearchPlacement}');
    const wizard = codeOnly(read('lib/contractCreateWizardState.ts'));
    expect(wizard).toContain('work_arrangement');
    expect(wizard).toContain('wizardExtraFieldsFromEditingContract');
  });

  it('PO-HRM-EMPLOYMENT-TYPES-CONSUMER-CTR-FE-02 — edit hydrate work_arrangement', () => {
    const wizard = read('lib/contractCreateWizardState.ts');
    expect(wizard).toContain('wizardExtraFieldsFromEditingContract');
    expect(wizard).toContain('work_arrangement: (contract.work_arrangement');
    const dialog = codeOnly(read('components/contracts/ContractCreateWizardDialog.tsx'));
    expect(dialog).toContain('wizardExtraFieldsFromEditingContract(editingContract)');
  });

  it('PO-HRM-EMPLOYMENT-TYPES-CONSUMER-CTR-FE-03 — contract_type code on PATCH', () => {
    const wizard = read('lib/contractCreateWizardState.ts');
    expect(wizard).toContain('resolveContractTypeEditValue');
    const page = codeOnly(read('pages/Contracts.tsx'));
    expect(page).toContain('resolveContractTypeEditValue');
  });

  it('D-FE-CTR-CB-BOOT-01 — C&B bootstrap card states + wizard orchestration', () => {
    const card = codeOnly(read('components/contracts/ContractCbReadOnlyCard.tsx'));
    // 3 trạng thái + 2 ô tiền riêng (sponsor §10b — không auto-copy) + CTA hồ sơ
    expect(card).toContain('ctr-create-cb-card');
    expect(card).toContain('ctr-create-cb-base-input');
    expect(card).toContain('ctr-create-cb-insurance-input');
    expect(card).toContain('ctr-create-cb-masked-banner');
    expect(card).toContain('ctr-create-cb-open-link');
    expect(card).toContain('ViMoneyInput');
    // AC-CTR-FIELD-04 — không «+ Thêm» phụ cấp GĐ1
    expect(card).not.toContain('+ Thêm');

    const api = codeOnly(read('lib/contractCreateApi.ts'));
    // Bootstrap = REUSE createCompensationPackage (SA Option A), không endpoint mới
    expect(api).toContain('createCompensationPackage');
    expect(api).toContain('ctr_workspace_bootstrap');
    expect(api).toContain('resolveContractCbBootstrapEffectiveFrom');
    expect(api).toContain('isContractCbBootstrapState');
    expect(api).toContain('validateContractCbBootstrapDraft');
    expect(api).toContain("allowance_code: 'si_base'");
    // DENY dual salary column on employee_contracts — không PATCH lương làm SoT
    expect(api).not.toContain('insurance_salary:');

    const wizard = codeOnly(read('components/contracts/ContractCreateWizardDialog.tsx'));
    expect(wizard).toContain('maybeBootstrapCb');
    expect(wizard).toContain('bootstrapContractCompensationPackage');
    // registry-only vẫn bỏ qua bootstrap (Q-S4) — chỉ Tiếp/Lưu mới bootstrap
    expect(wizard).toContain('persistRegistry(true)');
  });
});
