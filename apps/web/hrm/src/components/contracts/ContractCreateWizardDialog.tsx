/**
 * @CODE-MEMORY
 * Screen:     /contracts — 2-step create/edit wizard shell
 * UC:         FR-UC-BP-CORE-09 · UF-HRM-02 · AC-CTR-UX-01
 * WorkItem:   PO-HRM-CTR-CREATE-REDESIGN-FE-01 · FE-03 · HRM-CTR-CREATE-REDESIGN-FE-02
 * must_keep:  registry CRUD · AC-CTR-XEVN-08 · cấm ContractPrintSpinePanel in dialog · parent portal DnD Path A
 *
 * @CODE-MEMORY-CHANGE 2026-08-11 PO-HRM-EMPLOYMENT-TYPES-CONSUMER-CTR-FE-02-HARNESS-01
 * What: wizardExtraFieldsFromEditingContract · inline WA picker · hydrate work_arrangement on Sửa
 * Why: QA ETCTRQA1 — F5 edit showed «Chọn hình thức»; mutate PATCH work_arrangement
 *
 * @CODE-MEMORY-CHANGE 2026-08-10 HRM-CTR-CREATE-REDESIGN-FE-02
 * What: listCompanyId normalize cho UV/mẫu catalog · wire clauseOrderDirty từ Step2
 * Why: U2 CC embed scope parity · template đổi confirm khi đã kéo điều khoản
 *
 * @CODE-MEMORY-CHANGE 2026-08-11 PO-HRM-CTR-WORKSPACE-WAVE-G3
 * What: NV-first default subject_type employee · prefill from workspace deep-link
 * Why: BA G1 AMEND · EmployeeContracts / REC hire CTA prefill employee_id
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { normalizeHrmApiListCompanyId } from '@/lib/hrmListScope';
import type { ContractWorkspacePrefill } from '@/lib/contractWorkspaceDeepLink';
import { subjectStateFromPrefill } from '@/lib/contractWorkspaceDeepLink';
import type { Contract } from '@/hooks/useContracts';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { HDSD_MUTATE_TEST_IDS } from '@/lib/hdsdMutateTestIds';
import type { CatalogPickerOption } from '@/lib/catalogSearchPicker';
import { listContractTemplates, listRecruitmentCandidates, updateEmployeeContract } from '@/integrations/hrmApi';
import { toErrorMessage } from '@/lib/apiError';
import { toast } from 'sonner';
import {
  bootstrapContractCompensationPackage,
  createEmployeeContract,
  INITIAL_CONTRACT_CB_BOOTSTRAP_DRAFT,
  isContractCbBootstrapState,
  loadContractCreateContext,
  mapContractCbBootstrapError,
  resolveContractCbBootstrapEffectiveFrom,
  validateContractCbBootstrapDraft,
  type ContractCbBootstrapDraft,
  type ContractCreateContextSnapshot,
} from '@/lib/contractCreateApi';
import {
  buildRegistrySubmitPayload,
  initialWizardExtraFields,
  initialWizardSubjectState,
  wizardExtraFieldsFromEditingContract,
  type ContractWizardExtraFields,
  type ContractWizardFormSlice,
  type ContractWizardStep,
  type ContractWizardSubjectState,
} from '@/lib/contractCreateWizardState';
import { deriveContractDisplayName } from '@/lib/contractCreateDisplayName';
import { ContractCreateStep1GeneralGrid } from '@/components/contracts/ContractCreateStep1GeneralGrid';
import { ContractCreateStep2ClausePreview } from '@/components/contracts/ContractCreateStep2ClausePreview';
import { cn } from '@/lib/utils';

export type ContractCreateWizardDialogProps = {
  companyId: string;
  companyIdsForScope: string[];
  editingContract: Contract | null;
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
  hasContractField: (field: string) => boolean;
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
};

export function ContractCreateWizardDialog({
  companyId,
  companyIdsForScope,
  editingContract,
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
}: ContractCreateWizardDialogProps) {
  const listCompanyId = useMemo(() => normalizeHrmApiListCompanyId(companyId), [companyId]);
  const [step, setStep] = useState<ContractWizardStep>(1);
  const [extra, setExtra] = useState<ContractWizardExtraFields>(initialWizardExtraFields);
  const [subject, setSubject] = useState<ContractWizardSubjectState>(initialWizardSubjectState);
  const [candidatesList, setCandidatesList] = useState<
    Array<{ id: string; full_name: string; requisition_id: string; position_key?: string | null; position_name?: string | null; yctd_code?: string | null }>
  >([]);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const [sessionContractId, setSessionContractId] = useState<string | null>(
    editingContract?.id ?? null,
  );
  const [templates, setTemplates] = useState<Awaited<ReturnType<typeof listContractTemplates>>['items']>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [contextSnapshot, setContextSnapshot] = useState<ContractCreateContextSnapshot | null>(null);
  const [contextLoading, setContextLoading] = useState(false);
  const [clauseOrderDirty, setClauseOrderDirty] = useState(false);
  const [cbBootstrap, setCbBootstrap] = useState<ContractCbBootstrapDraft>(
    INITIAL_CONTRACT_CB_BOOTSTRAP_DRAFT,
  );

  useEffect(() => {
    setSessionContractId(editingContract?.id ?? null);
    setStep(1);
    setClauseOrderDirty(false);
    if (editingContract) {
      setExtra(wizardExtraFieldsFromEditingContract(editingContract));
      setSubject({
        subject_type: 'employee',
        candidate_id: '',
        requisition_id: '',
      });
    } else {
      setExtra(initialWizardExtraFields);
      setSubject(subjectStateFromPrefill(prefill));
    }
  }, [editingContract, companyId, prefill]);

  useEffect(() => {
    if (editingContract || !prefill?.employee_id?.trim()) return;
    onEmployeeSelect(prefill.employee_id.trim());
  }, [editingContract, prefill?.employee_id, onEmployeeSelect]);

  useEffect(() => {
    let cancelled = false;
    setCandidatesLoading(true);
    listRecruitmentCandidates({ company_id: listCompanyId, page: 1, page_size: 500 })
      .then((res) => {
        if (cancelled) return;
        setCandidatesList(
          res.data.map((c) => ({
            id: c.id,
            full_name: c.full_name,
            requisition_id: c.requisition_id,
            position_key: c.position_key,
            position_name: c.position_name,
            yctd_code: c.yctd_code,
          })),
        );
      })
      .catch(() => {
        if (!cancelled) setCandidatesList([]);
      })
      .finally(() => {
        if (!cancelled) setCandidatesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [listCompanyId]);

  useEffect(() => {
    let cancelled = false;
    setTemplatesLoading(true);
    listContractTemplates({ company_id: listCompanyId, status: 'active' })
      .then((res) => {
        if (!cancelled) setTemplates(res.items);
      })
      .catch(() => {
        if (!cancelled) setTemplates([]);
      })
      .finally(() => {
        if (!cancelled) setTemplatesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [listCompanyId]);

  useEffect(() => {
    if (editingContract || !prefill?.template_code?.trim() || templatesLoading) return;
    const want = prefill.template_code.trim().toUpperCase();
    if (templateCode.trim().toUpperCase() === want) return;
    const hit = templates.find(
      (t) => ((t.template_code ?? t.code) || '').trim().toUpperCase() === want,
    );
    if (!hit) return;
    onTemplateCodeChange((hit.template_code ?? hit.code).trim());
    onTemplateIdChange(hit.id);
    if (hit.pack_code) onPackCodeChange(hit.pack_code);
  }, [
    editingContract,
    prefill?.template_code,
    templates,
    templatesLoading,
    templateCode,
    onTemplateCodeChange,
    onTemplateIdChange,
    onPackCodeChange,
  ]);

  useEffect(() => {
    setCbBootstrap(INITIAL_CONTRACT_CB_BOOTSTRAP_DRAFT);
    if (subject.subject_type !== 'employee' || !form.employee_id || !companyId) {
      setContextSnapshot(null);
      return;
    }
    const cancelled = false;
    setContextLoading(true);
    loadContractCreateContext(companyId, form.employee_id, companyIdsForScope)
      .then((snap) => {
        if (!cancelled) setContextSnapshot(snap);
      })
      .catch(() => {
        if (!cancelled) setContextSnapshot(null);
      })
      .finally(() => {
        if (!cancelled) setContextLoading(false);
      });
  }, [companyId, form.employee_id, companyIdsForScope, subject.subject_type]);

  const selectedEmp = employeesList.find((e) => e.id === form.employee_id);
  const selectedCandidate = candidatesList.find((c) => c.id === subject.candidate_id);

  const derivedContractName = deriveContractDisplayName(
    form.contract_code,
    form.contract_type,
    contractTypeOptions,
  );

  const persistRegistry = useCallback(
    async (registryOnly: boolean): Promise<string | null> => {
      const built = buildRegistrySubmitPayload({
        companyId,
        form,
        extra,
        subject,
        packCode: registryOnly ? '' : packCode,
        templateId: registryOnly ? '' : templateId,
        templateCode: registryOnly ? '' : templateCode,
        registryOnly,
        contractTypeOptions,
        positionOptions,
        departmentOptions,
        employeeJobTitleKey: selectedEmp?.job_title_key,
        employeeCode: selectedEmp?.employee_code,
        candidatePositionKey: selectedCandidate?.position_key,
        candidatePositionName: selectedCandidate?.position_name ?? selectedCandidate?.full_name,
      });
      if (!built.ok) {
        toast.error(built.message);
        return null;
      }
      setIsSubmitting(true);
      try {
        if (sessionContractId) {
          await updateEmployeeContract(sessionContractId, {
            contract_type: built.payload.contract_type,
            start_date: built.payload.start_date,
            end_date: built.payload.end_date,
            ...(built.payload.pack_code ? { pack_code: built.payload.pack_code } : {}),
            ...(built.payload.template_id ? { template_id: built.payload.template_id } : {}),
            ...(built.payload.template_code ? { template_code: built.payload.template_code } : {}),
            work_location: built.payload.work_location,
            notes: built.payload.notes,
            ...(built.payload.signed_at ? { signed_at: built.payload.signed_at } : {}),
            ...(built.payload.contract_name ? { contract_name: built.payload.contract_name } : {}),
            ...(built.payload.work_arrangement ? { work_arrangement: built.payload.work_arrangement } : {}),
            ...(built.payload.salary_ratio_percent != null
              ? { salary_ratio_percent: built.payload.salary_ratio_percent }
              : {}),
          });
          toast.success(registryOnly ? 'Đã lưu sổ đăng ký' : 'Đã lưu hợp đồng');
          return sessionContractId;
        }
        const created = await createEmployeeContract(built.payload);
        setSessionContractId(created.id);
        toast.success(registryOnly ? 'Đã lưu sổ đăng ký' : 'Đã lưu hợp đồng');
        return created.id;
      } catch (err: unknown) {
        toast.error(toErrorMessage(err, 'Không lưu hợp đồng'));
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      companyId,
      form,
      extra,
      subject,
      packCode,
      templateId,
      templateCode,
      contractTypeOptions,
      positionOptions,
      selectedEmp,
      selectedCandidate,
      sessionContractId,
      setIsSubmitting,
    ],
  );

  /**
   * D-FE-CTR-CB-BOOT-01 — trước Tiếp/Lưu (không registry-only): nếu NV chưa có gói C&B
   * thì POST compensation-packages (base + si_base) rồi refresh context → card RO.
   * Trả false nếu chặn (thiếu số / ≤0 / AuthZ / lỗi thật); true nếu không cần bootstrap
   * hoặc bootstrap 2xx (kể cả overlap race = gói đã tồn tại).
   */
  const maybeBootstrapCb = useCallback(async (): Promise<boolean> => {
    const empId = form.employee_id?.trim();
    const needsBootstrap =
      isContractCbBootstrapState({
        subjectType: subject.subject_type,
        employeeId: empId,
        snapshot: contextSnapshot,
      }) && Boolean(empId);
    if (!needsBootstrap || !empId) return true;

    const validation = validateContractCbBootstrapDraft(cbBootstrap);
    if (!validation.ok) {
      toast.error(validation.message);
      return false;
    }

    const effectiveFrom = resolveContractCbBootstrapEffectiveFrom(
      form.effective_date,
      extra.signing_date,
    );

    setIsSubmitting(true);
    try {
      await bootstrapContractCompensationPackage({
        companyId,
        employeeId: empId,
        effectiveFrom,
        amounts: validation.amounts,
        contractId: sessionContractId,
      });
      const refreshed = await loadContractCreateContext(companyId, empId, companyIdsForScope);
      setContextSnapshot(refreshed);
      toast.success('Đã tạo gói lương & bảo hiểm cho nhân viên.');
      return true;
    } catch (err: unknown) {
      const outcome = mapContractCbBootstrapError(err);
      if (outcome.treatAsExisting) {
        try {
          const refreshed = await loadContractCreateContext(companyId, empId, companyIdsForScope);
          setContextSnapshot(refreshed);
        } catch {
          /* keep prior snapshot */
        }
        toast.message(outcome.message);
        return true;
      }
      toast.error(outcome.message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [
    companyId,
    companyIdsForScope,
    form.employee_id,
    form.effective_date,
    extra.signing_date,
    subject.subject_type,
    contextSnapshot,
    cbBootstrap,
    sessionContractId,
    setIsSubmitting,
  ]);

  const handleTemplatePick = (tpl: { id: string; pack_code: string; template_code?: string; code: string } | null) => {
    if (!tpl) {
      onTemplateCodeChange('');
      onTemplateIdChange('');
      onPackCodeChange('');
      return;
    }
    if (clauseOrderDirty && templateCode && templateCode !== (tpl.template_code ?? tpl.code)) {
      const ok = window.confirm(
        'Đổi mẫu sẽ gợi ý lại điều khoản mặc định — thứ tự đã kéo có thể thay đổi. Tiếp tục?',
      );
      if (!ok) return;
    }
    onTemplateCodeChange((tpl.template_code ?? tpl.code).trim().toUpperCase());
    onTemplateIdChange(tpl.id);
    onPackCodeChange(tpl.pack_code);
    setClauseOrderDirty(false);
  };

  const goStep2 = async () => {
    if (!templateCode.trim()) {
      toast.error('Chọn mẫu in trước khi sang bước điều khoản.');
      return;
    }
    const bootstrapped = await maybeBootstrapCb();
    if (!bootstrapped) return;
    const id = await persistRegistry(false);
    if (id) setStep(2);
  };

  useEffect(() => {
    if (step === 2 && sessionContractId) return;
    if (step === 2 && !sessionContractId) setStep(1);
  }, [step, sessionContractId]);

  const driverOverrides = {
    driver_license_number: extra.driver_license_number,
    driver_license_class: extra.driver_license_class,
    license_class: extra.driver_license_class,
    driver_license_issued_on: extra.driver_license_issued_on,
    driver_license_issued_place: extra.driver_license_issued_place,
  };

  return (
  <div
    className="flex min-h-0 flex-1 flex-col"
    data-testid="ctr-create-wizard-root"
    data-company-id={companyId}
    data-list-company-id={listCompanyId}
  >
      <div
        className="flex items-center h-10 gap-4 border-b pb-2 mb-4 shrink-0"
        data-testid="ctr-create-wizard-stepper"
        role="tablist"
        aria-label="Các bước tạo hợp đồng"
      >
        <StepChip
          active={step === 1}
          label="1. Thông tin & mẫu"
          tabId="ctr-create-step-tab-1"
          onActivate={() => {
            if (step === 2) setStep(1);
          }}
        />
        <StepChip
          active={step === 2}
          label="2. Điều khoản & xem trước"
          tabId="ctr-create-step-tab-2"
          disabled={step === 1 && (isSubmitting || !templateCode.trim())}
          title={
            step === 1 && !templateCode.trim()
              ? 'Chọn mẫu in ở bước 1 — hệ thống lưu nháp rồi mở điều khoản (cùng nút Tiếp).'
              : undefined
          }
          onActivate={() => {
            if (step === 2) return;
            void goStep2();
          }}
        />
      </div>

      {isCreateFormReady && !templatesLoading ? (
        <span
          data-testid={HDSD_MUTATE_TEST_IDS.contractsFormReady}
          className="sr-only"
          aria-hidden
        >
          Form ready
        </span>
      ) : null}

      {step === 1 ? (
        <ContractCreateStep1GeneralGrid
          isEdit={Boolean(editingContract)}
          form={form}
          extra={extra}
          onFormChange={onFormChange}
          onExtraChange={(patch) => setExtra((prev) => ({ ...prev, ...patch }))}
          contractTypeOptions={contractTypeOptions}
          departmentOptions={departmentOptions}
          statusOptions={statusOptions}
          employeesList={employeesList}
          candidatesList={candidatesList}
          candidatesLoading={candidatesLoading}
          subject={subject}
          onSubjectChange={(patch) => setSubject((prev) => ({ ...prev, ...patch }))}
          derivedContractName={derivedContractName}
          onEmployeeSelect={onEmployeeSelect}
          templates={templates}
          templatesLoading={templatesLoading}
          templateCode={templateCode}
          packCode={packCode}
          onTemplatePick={handleTemplatePick}
          contextSnapshot={contextSnapshot}
          contextLoading={contextLoading}
          hasContractField={hasContractField}
          catalogsLoading={catalogsLoading}
          catalogsError={catalogsError}
          onRegistryOnly={async () => {
            const id = await persistRegistry(true);
            if (id) onSaved();
          }}
          cbBootstrap={cbBootstrap}
          onCbBootstrapChange={(patch) => setCbBootstrap((prev) => ({ ...prev, ...patch }))}
          hideCandidateSubject={Boolean(prefill?.lock_subject_employee)}
        />
      ) : sessionContractId ? (
        <div className="min-h-0 flex-1 overflow-y-auto">
        <ContractCreateStep2ClausePreview
          companyId={companyId}
          contractId={sessionContractId}
          employeeId={form.employee_id}
          packCode={packCode}
          templateId={templateId}
          templateCode={templateCode}
          workLocation={form.work_location}
          driverOverrides={driverOverrides}
          onCanvasChange={() => setClauseOrderDirty(true)}
        />
        </div>
      ) : null}

      <DialogFooter className="gap-2 sm:gap-0 shrink-0 border-t pt-3 mt-2">
        <Button type="button" variant="outline" onClick={onClose} data-testid="ctr-create-cancel-btn">
          Hủy
        </Button>
        {step === 2 ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep(1)}
            data-testid="ctr-create-back-btn"
          >
            Quay lại
          </Button>
        ) : null}
        {step === 1 ? (
          <>
            <Button
              type="button"
              variant="secondary"
              disabled={isSubmitting}
              onClick={async () => {
                const bootstrapped = await maybeBootstrapCb();
                if (!bootstrapped) return;
                const id = await persistRegistry(false);
                if (id) onSaved();
              }}
              data-testid={HDSD_MUTATE_TEST_IDS.contractsFormSubmit}
            >
              Lưu
            </Button>
            <Button
              type="button"
              disabled={isSubmitting || !templateCode.trim()}
              onClick={() => void goStep2()}
              data-testid="ctr-create-next-btn"
            >
              Tiếp
            </Button>
          </>
        ) : (
          <Button
            type="button"
            disabled={isSubmitting}
            onClick={async () => {
              const id = await persistRegistry(false);
              if (id) onSaved();
            }}
            data-testid={HDSD_MUTATE_TEST_IDS.contractsFormSubmit}
          >
            Lưu
          </Button>
        )}
      </DialogFooter>
  </div>
  );
}

function StepChip({
  active,
  label,
  tabId,
  disabled,
  title,
  onActivate,
}: {
  active: boolean;
  label: string;
  tabId: string;
  disabled?: boolean;
  title?: string;
  onActivate?: () => void;
}) {
  return (
    <button
      type="button"
      id={tabId}
      role="tab"
      aria-selected={active}
      disabled={disabled}
      title={title}
      onClick={() => onActivate?.()}
      data-testid={tabId}
      className={cn(
        'text-sm font-medium px-3 py-1 rounded-full border-0',
        active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-90',
      )}
    >
      {label}
    </button>
  );
}
