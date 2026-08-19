/**
 * @CODE-MEMORY
 * Screen:     /contracts workspace — view mode read-only Step1+Step2 + preview/PDF
 * UC:         UF-HRM-02 · FR-UC-BP-CORE-09b/c
 * WorkItem:   PO-HRM-CTR-WORKSPACE-WAVE-G3 · PO-HRM-CTR-WORKSPACE-FE-LAYOUT-BIND-01
 * Purpose:    View parity — GET clause_layout bind + can_issue gate for In/PDF.
 * must_keep:  HDSD view testids; contracts_printable_ready=false; U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-11 PO-HRM-CTR-WORKSPACE-FE-LAYOUT-BIND-01
 * What: Step2 binds GET clause_layout (one GET); In/PDF disabled when can_issue=false + VI hints
 * Why: SA-01 §4.1 EXPAND GET detail — cấm registry-only view; no POST preview for canvas bind
 *
 * @CODE-MEMORY-CHANGE 2026-08-11 PO-HRM-CTR-WORKSPACE-G4-DOM-NESTING-FE-01
 * What: Mẫu in — pack Badge nằm trong div flex, không bọc bằng <p>
 * Why: Badge = div; validateDOMNesting warning DEF-CTR-G4-DOM-NESTING-P2 trên view workspace
 */
import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Eye, FileDown, Loader2, Save } from 'lucide-react';
import type { Contract } from '@/hooks/useContracts';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ContractCreateStep2ClausePreview } from '@/components/contracts/ContractCreateStep2ClausePreview';
import { restorePrintSpineFromContract } from '@/lib/contractPrintEditRestore';
import { useContractPrintSpine } from '@/hooks/useContractPrintSpine';
import { wizardExtraFieldsFromEditingContract } from '@/lib/contractCreateWizardState';
import { formatContractPreviewSummaryVi } from '@/lib/contractWorkspaceLayoutBind';
import { cn } from '@/lib/utils';
import { EM_DASH } from '@/lib/labelMaps';

export type ContractWorkspaceViewBodyProps = {
  companyId: string;
  contract: Contract;
  displayContractType: (code: string | null | undefined) => string;
  statusBadge: React.ReactNode;
  onEdit?: () => void;
};

export function ContractWorkspaceViewBody({
  companyId,
  contract,
  displayContractType,
  statusBadge,
  onEdit,
}: ContractWorkspaceViewBodyProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const printRestore = useMemo(() => restorePrintSpineFromContract(contract), [contract]);
  const extra = useMemo(() => wizardExtraFieldsFromEditingContract(contract), [contract]);

  const spine = useContractPrintSpine({
    companyId,
    contractId: contract.id,
    packCode: printRestore.packCode,
    templateId: printRestore.templateId,
    templateCode: printRestore.templateCode,
    employeeId: contract.employee_id,
    workLocation: contract.work_location,
    clauseIds: contract.clause_ids ?? undefined,
  });

  const canIssue = Boolean(contract.can_issue ?? spine.preview?.can_issue);
  const issueBlockedHint = useMemo(
    () => formatContractPreviewSummaryVi(contract.preview_summary),
    [contract.preview_summary],
  );

  const driverOverrides = {
    driver_license_number: extra.driver_license_number,
    driver_license_class: extra.driver_license_class,
    license_class: extra.driver_license_class,
    driver_license_issued_on: extra.driver_license_issued_on,
    driver_license_issued_place: extra.driver_license_issued_place,
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col" data-testid="ctr-workspace-view-root">
      <div
        className="flex items-center h-10 gap-4 border-b pb-2 mb-4 shrink-0"
        data-testid="ctr-workspace-view-stepper"
        role="tablist"
      >
        <StepChip active={step === 1} label="1. Thông tin & mẫu" onActivate={() => setStep(1)} />
        <StepChip active={step === 2} label="2. Điều khoản & xem trước" onActivate={() => setStep(2)} />
      </div>

      {step === 1 ? (
        <div className="space-y-4" data-testid="hdsd-contracts-view-body">
          {contract.contract_name ? (
            <div>
              <Label className="text-muted-foreground">Tên hợp đồng</Label>
              <p className="font-medium" data-testid="hdsd-contracts-view-name">
                {contract.contract_name}
              </p>
            </div>
          ) : null}
          <div className="grid grid-cols-12 gap-4">
            <ReadOnlyField
              className="col-span-4"
              label="Mã hợp đồng"
              testId="hdsd-contracts-view-code"
              value={contract.contract_code}
            />
            <ReadOnlyField
              className="col-span-4"
              label={
                contract.subject_type === 'candidate' ? 'Ứng viên' : 'Nhân viên'
              }
              testId="hdsd-contracts-view-party"
              value={contract.employee_name}
            />
            <ReadOnlyField
              className="col-span-4"
              label="Phòng ban"
              testId="hdsd-contracts-view-department"
              value={contract.department?.trim() || EM_DASH}
            />
          </div>
          <div className="grid grid-cols-12 gap-4">
            <ReadOnlyField
              className="col-span-4"
              label="Loại hợp đồng"
              value={displayContractType(contract.contract_type)}
            />
            <ReadOnlyField
              className="col-span-4"
              label="Ngày ký"
              testId="hdsd-contracts-view-signing-date"
              value={
                contract.signing_date
                  ? format(new Date(contract.signing_date), 'dd/MM/yyyy')
                  : EM_DASH
              }
            />
            <div className="col-span-4">
              <Label className="text-muted-foreground">Trạng thái</Label>
              <div className="mt-1">{statusBadge}</div>
            </div>
          </div>
          <div className="grid grid-cols-12 gap-4">
            <ReadOnlyField
              className="col-span-4"
              label="Hiệu lực từ"
              value={
                contract.effective_date
                  ? format(new Date(contract.effective_date), 'dd/MM/yyyy')
                  : EM_DASH
              }
            />
            <ReadOnlyField
              className="col-span-4"
              label="Hết hạn"
              value={
                contract.expiry_date
                  ? format(new Date(contract.expiry_date), 'dd/MM/yyyy')
                  : EM_DASH
              }
            />
            {contract.work_form_label_vi || contract.work_arrangement ? (
              <ReadOnlyField
                className="col-span-4"
                label="Hình thức làm việc"
                value={contract.work_form_label_vi || contract.work_arrangement || EM_DASH}
              />
            ) : null}
          </div>
          {contract.contract_abstract ? (
            <div>
              <Label className="text-muted-foreground">Trích yếu</Label>
              <p
                className="font-medium whitespace-pre-wrap"
                data-testid="hdsd-contracts-view-abstract"
              >
                {contract.contract_abstract}
              </p>
            </div>
          ) : null}
          {contract.notes ? (
            <ReadOnlyField label="Ghi chú" value={contract.notes} />
          ) : null}
          <div className="rounded-card border p-3 bg-muted/30">
            <p className="text-sm font-medium mb-1">Mẫu in</p>
            <div
              className="text-sm flex flex-wrap items-center gap-2"
              data-testid="hdsd-contracts-view-print-template"
            >
              <span>{printRestore.templateCode || EM_DASH}</span>
              {printRestore.packCode ? (
                <Badge variant="outline">{printRestore.packCode}</Badge>
              ) : null}
            </div>
          </div>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto space-y-4">
          <ContractCreateStep2ClausePreview
            companyId={companyId}
            contractId={contract.id}
            employeeId={contract.employee_id}
            packCode={printRestore.packCode}
            templateId={printRestore.templateId}
            templateCode={printRestore.templateCode}
            workLocation={contract.work_location || ''}
            driverOverrides={driverOverrides}
            readOnly
            initialClauseLayout={contract.clause_layout}
          />
          {!canIssue ? (
            <p
              className="text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-md p-3"
              data-testid="ctr-workspace-view-issue-blocked-hint"
            >
              {issueBlockedHint}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2 border-t pt-3">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={spine.busy}
              onClick={() => void spine.runPreview()}
              data-testid="ctr-workspace-view-preview-btn"
            >
              <Eye className="h-4 w-4 mr-1" />
              Xem trước
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={spine.busy || !canIssue}
              onClick={() => void spine.saveVersion()}
              data-testid="ctr-workspace-view-issue-btn"
              title={!canIssue ? issueBlockedHint : undefined}
            >
              <Save className="h-4 w-4 mr-1" />
              Lưu phiên bản in
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={spine.busy || !canIssue}
              onClick={() => void spine.downloadPdf()}
              data-testid="ctr-workspace-view-pdf-btn"
              title={!canIssue ? issueBlockedHint : undefined}
            >
              <FileDown className="h-4 w-4 mr-1" />
              Tải PDF
            </Button>
          </div>
          {spine.previewError ? (
            <p className="text-sm text-destructive">{spine.previewError}</p>
          ) : null}
          {spine.busy ? (
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang xử lý…
            </p>
          ) : null}
        </div>
      )}

      <div className="flex justify-end gap-2 border-t pt-3 mt-2 shrink-0">
        {onEdit ? (
          <Button type="button" variant="default" onClick={onEdit} data-testid="ctr-workspace-view-edit-btn">
            Chỉnh sửa
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function ReadOnlyField({
  label,
  value,
  testId,
  className,
}: {
  label: string;
  value: string;
  testId?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="text-muted-foreground">{label}</Label>
      <p className="font-medium" data-testid={testId}>
        {value}
      </p>
    </div>
  );
}

function StepChip({
  active,
  label,
  onActivate,
}: {
  active: boolean;
  label: string;
  onActivate: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onActivate}
      className={cn(
        'text-sm font-medium px-3 py-1 rounded-full border-0 cursor-pointer',
        active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
      )}
    >
      {label}
    </button>
  );
}
