/**
 * @CODE-MEMORY
 * Screen:     /contracts — unified workspace dialog (create|edit|view)
 * UC:         FR-UC-BP-CORE-09 · UF-HRM-02 · J-HRM-03
 * WorkItem:   PO-HRM-CTR-WORKSPACE-WAVE-G3
 * Purpose:    Single parent-portal shell for create wizard, edit, and read-only view + preview/PDF.
 * must_keep:  HDSD testids · PAT-DIALOG-FULL-VIEWPORT-CC-01 · AC-CTR-XEVN-08 · printable=false
 *
 * @CODE-MEMORY-CHANGE 2026-08-11 PO-HRM-CTR-WORKSPACE-WAVE-G3
 * What: Gộp create/edit/view; thay registry-only view dialog; NV-first subject_type employee
 * Why: ADR ContractWorkspace G2 · BA G1 hire CTA · view clause+PDF parity
 */
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import type { Contract } from '@/hooks/useContracts';
import { mapApiContract } from '@/hooks/useContracts';
import { getEmployeeContractById } from '@/integrations/hrmApi';
import { toErrorMessage } from '@/lib/apiError';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  HRM_DIALOG_FULL_VIEWPORT_BODY_CLASS,
  HRM_DIALOG_FULL_VIEWPORT_CONTENT_CLASS,
} from '@/lib/hrmDialogFullViewport';
import { HDSD_MUTATE_TEST_IDS } from '@/lib/hdsdMutateTestIds';
import { ContractCreateWizardDialog } from '@/components/contracts/ContractCreateWizardDialog';
import { ContractWorkspaceViewBody } from '@/components/contracts/ContractWorkspaceViewBody';
import type { ContractWorkspaceMode, ContractWorkspacePrefill } from '@/lib/contractWorkspaceDeepLink';
import type { CatalogPickerOption } from '@/lib/catalogSearchPicker';
import type { ContractWizardFormSlice } from '@/lib/contractCreateWizardState';
import type { ContractFormFieldKey } from '@/components/contracts/contractFormFieldResolver';

export type ContractWorkspaceDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: ContractWorkspaceMode;
  companyId: string;
  companyIdsForScope: string[];
  /** create | edit */
  editingContract?: Contract | null;
  prefill?: ContractWorkspacePrefill;
  form: ContractWizardFormSlice;
  onFormChange: (patch: Partial<ContractWizardFormSlice>) => void;
  contractTypeOptions: CatalogPickerOption[];
  positionOptions: CatalogPickerOption[];
  departmentOptions: CatalogPickerOption[];
  statusOptions: { value: string; label: string }[];
  employeesList: Array<{
    id: string;
    full_name: string;
    employee_code: string;
    job_title_key?: string;
    candidate_id?: string | null;
  }>;
  onEmployeeSelect: (employeeId: string) => void;
  hasContractField: (field: ContractFormFieldKey) => boolean;
  catalogsLoading: boolean;
  catalogsError: boolean;
  isCreateFormReady: boolean;
  packCode: string;
  templateId: string;
  templateCode: string;
  onPackCodeChange: (v: string) => void;
  onTemplateIdChange: (v: string) => void;
  onTemplateCodeChange: (v: string) => void;
  onClose: () => void;
  onSaved: () => void;
  isSubmitting: boolean;
  setIsSubmitting: (v: boolean) => void;
  /** view */
  viewContractId?: string | null;
  displayContractType: (code: string | null | undefined) => string;
  renderStatusBadge: (contract: Contract) => React.ReactNode;
  onEditFromView?: (contract: Contract) => void;
  dialogOpenGuardUntilRef?: React.MutableRefObject<number>;
};

export function ContractWorkspaceDialog({
  open,
  onOpenChange,
  mode,
  companyId,
  companyIdsForScope,
  editingContract = null,
  prefill,
  form,
  onFormChange,
  contractTypeOptions,
  positionOptions,
  departmentOptions,
  statusOptions,
  employeesList,
  onEmployeeSelect,
  hasContractField,
  catalogsLoading,
  catalogsError,
  isCreateFormReady,
  packCode,
  templateId,
  templateCode,
  onPackCodeChange,
  onTemplateIdChange,
  onTemplateCodeChange,
  onClose,
  onSaved,
  isSubmitting,
  setIsSubmitting,
  viewContractId,
  displayContractType,
  renderStatusBadge,
  onEditFromView,
  dialogOpenGuardUntilRef,
}: ContractWorkspaceDialogProps) {
  const { t } = useTranslation();
  const isView = mode === 'view';
  const resolvedViewId = viewContractId ?? editingContract?.id ?? null;

  const {
    data: viewingContract,
    isLoading: viewDetailLoading,
    isError: viewDetailError,
    error: viewDetailErrorRaw,
  } = useQuery({
    queryKey: ['contract-workspace-view', resolvedViewId, companyId],
    queryFn: async () => {
      if (!resolvedViewId || !companyId) {
        throw new Error('Thiếu phạm vi công ty hoặc mã hợp đồng');
      }
      const row = await getEmployeeContractById(resolvedViewId, companyId);
      return mapApiContract(row);
    },
    enabled: open && isView && !!resolvedViewId && !!companyId,
    staleTime: 0,
  });

  const title = useMemo(() => {
    if (isView) return t('contracts.viewTitle');
    if (mode === 'edit' || editingContract) return t('contracts.editTitle');
    return t('contracts.createTitle');
  }, [isView, mode, editingContract, t]);

  const description = isView
    ? undefined
    : editingContract
      ? t('contracts.editDesc')
      : t('contracts.createDesc');

  const dialogTestId = isView
    ? HDSD_MUTATE_TEST_IDS.contractsViewDialog
    : HDSD_MUTATE_TEST_IDS.contractsFormDialog;

  const latchTestId = isView
    ? HDSD_MUTATE_TEST_IDS.contractsViewDialogOpen
    : 'hdsd-contracts-form-dialog-open';

  return (
    <>
      {open ? (
        <span
          data-testid={latchTestId}
          data-hrm-dialog-portal="parent"
          className="sr-only"
          aria-hidden
        >
          {isView ? 'view-dialog-open' : 'dialog-open'}
        </span>
      ) : null}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className={HRM_DIALOG_FULL_VIEWPORT_CONTENT_CLASS}
          data-testid={dialogTestId}
          data-hrm-dialog-portal="parent"
          data-ctr-workspace-mode={mode}
          onPointerDownOutside={(event) => {
            if (dialogOpenGuardUntilRef && Date.now() < dialogOpenGuardUntilRef.current) {
              event.preventDefault();
            }
          }}
          onInteractOutside={(event) => {
            if (dialogOpenGuardUntilRef && Date.now() < dialogOpenGuardUntilRef.current) {
              event.preventDefault();
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description ? <DialogDescription>{description}</DialogDescription> : null}
          </DialogHeader>

          {isView ? (
            <div className={HRM_DIALOG_FULL_VIEWPORT_BODY_CLASS}>
              {viewDetailLoading ? (
                <p className="text-sm text-muted-foreground" data-testid="hdsd-contracts-view-loading">
                  Đang tải chi tiết hợp đồng…
                </p>
              ) : null}
              {viewDetailError ? (
                <p className="text-sm text-destructive" data-testid="hdsd-contracts-view-error">
                  {toErrorMessage(viewDetailErrorRaw)}
                </p>
              ) : null}
              {viewingContract ? (
                <ContractWorkspaceViewBody
                  companyId={companyId}
                  contract={viewingContract}
                  displayContractType={displayContractType}
                  statusBadge={renderStatusBadge(viewingContract)}
                  onEdit={onEditFromView ? () => onEditFromView(viewingContract) : undefined}
                />
              ) : null}
            </div>
          ) : companyId ? (
            <div className={HRM_DIALOG_FULL_VIEWPORT_BODY_CLASS}>
              <ContractCreateWizardDialog
                companyId={companyId}
                companyIdsForScope={companyIdsForScope}
                editingContract={editingContract}
                prefill={prefill}
                form={form}
                onFormChange={onFormChange}
                contractTypeOptions={contractTypeOptions}
                positionOptions={positionOptions}
                departmentOptions={departmentOptions}
                statusOptions={statusOptions}
                employeesList={employeesList}
                onEmployeeSelect={onEmployeeSelect}
                hasContractField={hasContractField}
                catalogsLoading={catalogsLoading}
                catalogsError={catalogsError}
                isCreateFormReady={isCreateFormReady}
                packCode={packCode}
                templateId={templateId}
                templateCode={templateCode}
                onPackCodeChange={onPackCodeChange}
                onTemplateIdChange={onTemplateIdChange}
                onTemplateCodeChange={onTemplateCodeChange}
                onClose={onClose}
                onSaved={onSaved}
                isSubmitting={isSubmitting}
                setIsSubmitting={setIsSubmitting}
              />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
