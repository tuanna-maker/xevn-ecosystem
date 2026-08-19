/**
 * @CODE-MEMORY
 * Screen:     /contracts wizard Bước 1 — AMIS Thông tin chung grid
 * WorkItem:   PO-HRM-CTR-CREATE-REDESIGN-FE-01 · FE-03
 *
 * @CODE-MEMORY-CHANGE 2026-08-10 HRM-CTR-CREATE-REDESIGN-FE-02
 * What: UV + NV picker inline search (CC parent portal) · default tab Nhân viên (BA-03 NV-first)
 *
 * @CODE-MEMORY-CHANGE 2026-08-11 PO-HRM-EMPLOYMENT-TYPES-CONSUMER-CTR-FE-01
 * What: Hình thức làm việc — CatalogSearchPicker + useEmpEmploymentTypesEffective (BR-SET-CONSUMER-ET-DUAL-01)
 * UC: AC-SET-CONSUMER-ET-CTR-01 · POST work_arrangement = catalog snake code
 * must_keep: QACONPAYSTQC1 dept+contract_type pickers; settings_catalog_e2e_ready=false
 *
 * @CODE-MEMORY-CHANGE 2026-08-11 PO-HRM-EMPLOYMENT-TYPES-CONSUMER-CTR-FE-02-HARNESS-01
 * What: searchPlacement inline on ctr-create-work-arrangement (CC iframe harness)
 * Why: QA ETCTRQA1 popover/stacking on mutate leg
 *
 * @CODE-MEMORY-CHANGE 2026-08-11 PO-HRM-CTR-WORKSPACE-G4-BR-CTR-CREATE-08-BANNER-FE-01
 * What: Banner «Mở tuyển dụng» khi NV.candidate_id null — không chặn Tiếp
 * UC: BR-CTR-CREATE-08 · UI-HRM-CTR-WORKSPACE §4.1
 *
 * @CODE-MEMORY-CHANGE 2026-08-12 PO-HRM-CTR-CREATE-PICKER-INLINE-PORTAL-CONDITIONAL-01
 * What: searchPlacement điều kiện theo getHrmPortalMode(window.location.search) — inline chỉ khi portal-embed (?portal=1/companyId), popover khi standalone
 * Why: Sponsor báo browser thật /hr/contracts standalone bị lộ ô tìm sẵn dưới mọi select (đúng ra chỉ hiện khi bấm) — root cause: 4 chỗ hardcode searchPlacement="inline" áp cả standalone lẫn portal
 * must_keep: portal-embed (DEF-CTR-PICKER-INLINE-PORTAL-01 / ETCTRQA1) vẫn giữ inline — không xoá mode inline khỏi CatalogSearchPicker
 */
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { hrmPathWithEmbedSearch } from '@/lib/hrmEmbedNavigation';
import { vi } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import type { HrmContractTemplateRecord } from '@/integrations/hrmApi';
import { CatalogSearchPicker } from '@/components/common/CatalogSearchPicker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { HDSD_MUTATE_TEST_IDS } from '@/lib/hdsdMutateTestIds';
import type { CatalogPickerOption } from '@/lib/catalogSearchPicker';
import {
  activeTemplatesForPicker,
  formatTemplatePickerLabel,
  CONTRACT_TERM_TYPE_LABELS,
} from '@/lib/contractTemplateCatalog';
import { packLabelVi } from '@/lib/contractPackPreviewUx';
import {
  applyTemplateDurationHint,
  visibleBlocksForTemplate,
} from '@/lib/contractCreateFieldManifest';
import type { ContractCreateContextSnapshot, ContractCbBootstrapDraft } from '@/lib/contractCreateApi';
import { isContractCbBootstrapState } from '@/lib/contractCreateApi';
import type { ContractWizardExtraFields, ContractWizardFormSlice, ContractWizardSubjectState } from '@/lib/contractCreateWizardState';
import { ContractCbReadOnlyCard } from '@/components/contracts/ContractCbReadOnlyCard';
import { ContractPartyBReadOnlyCard } from '@/components/contracts/ContractPartyBReadOnlyCard';
import { ContractEmployerSignatoryBlock } from '@/components/contracts/ContractEmployerSignatoryBlock';
import { PORTAL_HRM_MENU_PATH } from '@/lib/hrmEmbedPortalNav';
import {
  CTR_CREATE_EMPLOYEE_REC_BANNER_LINK_LABEL,
  CTR_CREATE_EMPLOYEE_REC_BANNER_TEST_ID,
  shouldShowEmployeeRecruitmentBanner,
} from '@/lib/contractEmployeeRecBanner';
import { useEmpEmploymentTypesEffective } from '@/hooks/useEmpEmploymentTypesEffective';
import { getHrmPortalMode } from '@/lib/hrmPortalMode';

const fieldLabel = 'text-base font-medium text-foreground';
const fieldControl = 'h-10 text-base';

export type ContractCreateStep1GeneralGridProps = {
  isEdit: boolean;
  form: ContractWizardFormSlice;
  extra: ContractWizardExtraFields;
  onFormChange: (patch: Partial<ContractWizardFormSlice>) => void;
  onExtraChange: (patch: Partial<ContractWizardExtraFields>) => void;
  contractTypeOptions: CatalogPickerOption[];
  departmentOptions: CatalogPickerOption[];
  statusOptions: { value: string; label: string }[];
  employeesList: Array<{
    id: string;
    full_name: string;
    employee_code: string;
    candidate_id?: string | null;
  }>;
  candidatesList: Array<{
    id: string;
    full_name: string;
    requisition_id: string;
    position_key?: string | null;
    position_name?: string | null;
    yctd_code?: string | null;
  }>;
  candidatesLoading: boolean;
  subject: ContractWizardSubjectState;
  onSubjectChange: (patch: Partial<ContractWizardSubjectState>) => void;
  derivedContractName: string;
  onEmployeeSelect: (employeeId: string) => void;
  templates: HrmContractTemplateRecord[];
  templatesLoading: boolean;
  templateCode: string;
  packCode: string;
  onTemplatePick: (tpl: HrmContractTemplateRecord | null) => void;
  contextSnapshot: ContractCreateContextSnapshot | null;
  contextLoading: boolean;
  hasContractField: (field: string) => boolean;
  catalogsLoading: boolean;
  catalogsError: boolean;
  onRegistryOnly: () => void;
  /** D-FE-CTR-CB-BOOT-01 — draft 2 mức lương bootstrap C&B (wizard sở hữu). */
  cbBootstrap: ContractCbBootstrapDraft;
  onCbBootstrapChange: (patch: Partial<ContractCbBootstrapDraft>) => void;
  /** Profile / REC hire — hide UV tab; NV path only */
  hideCandidateSubject?: boolean;
};

export function ContractCreateStep1GeneralGrid({
  isEdit,
  form,
  extra,
  onFormChange,
  onExtraChange,
  contractTypeOptions,
  departmentOptions,
  statusOptions,
  employeesList,
  candidatesList,
  candidatesLoading,
  subject,
  onSubjectChange,
  derivedContractName,
  onEmployeeSelect,
  templates,
  templatesLoading,
  templateCode,
  packCode,
  onTemplatePick,
  contextSnapshot,
  contextLoading,
  hasContractField,
  catalogsLoading,
  catalogsError,
  onRegistryOnly,
  cbBootstrap,
  onCbBootstrapChange,
  hideCandidateSubject = false,
}: ContractCreateStep1GeneralGridProps) {
  const catalogSearchPlacement: 'popover' | 'inline' =
    typeof window !== 'undefined' && getHrmPortalMode(window.location.search) ? 'inline' : 'popover';
  const templateSettingsHref = hrmPathWithEmbedSearch('/settings?tab=contract-templates');
  const employmentTypesSettingsHref = hrmPathWithEmbedSearch('/settings?tab=emp-employment-types');
  const {
    employmentTypeOptions: workArrangementOptions,
    isLoading: workArrangementLoading,
    isError: workArrangementError,
  } = useEmpEmploymentTypesEffective({
    currentValue: extra.work_arrangement,
  });
  const activeTemplates = activeTemplatesForPicker(templates);
  const templateOptions: CatalogPickerOption[] = activeTemplates.map((t) => ({
    value: (t.template_code ?? t.code).trim(),
    label: formatTemplatePickerLabel(t),
  }));

  const employeeOptions: CatalogPickerOption[] = employeesList.map((emp) => ({
    value: emp.id,
    label: `${emp.full_name} — ${emp.employee_code}`,
  }));

  const candidateOptions: CatalogPickerOption[] = candidatesList.map((c) => {
    const code = (c.yctd_code ?? '').trim();
    const suffix = code || c.full_name.trim().slice(0, 24);
    return {
      value: c.id,
      label: `${c.full_name} — ${suffix}`,
      ...(code ? { code } : {}),
    };
  });

  const selectedEmployee = employeesList.find((emp) => emp.id === form.employee_id);
  const showEmployeeRecBanner = shouldShowEmployeeRecruitmentBanner({
    isEdit,
    subjectType: subject.subject_type,
    employeeId: form.employee_id,
    selectedEmployee,
  });

  const blocks = visibleBlocksForTemplate(templateCode, packCode);
  const selectedTpl = activeTemplates.find(
    (t) => (t.template_code ?? t.code).trim().toUpperCase() === templateCode.trim().toUpperCase(),
  );

  const applyDuration = () => {
    const next = applyTemplateDurationHint(form.effective_date, templateCode, packCode);
    if (next) onFormChange({ expiry_date: next });
  };

  const cbMasked = contextSnapshot?.cb_masked === true;
  const cbBootstrapEligible = isContractCbBootstrapState({
    subjectType: subject.subject_type,
    employeeId: form.employee_id,
    snapshot: contextSnapshot,
  });
  const cbSnapshot = contextSnapshot?.compensation_snapshot ?? null;
  const cbHasNumbers =
    cbSnapshot != null &&
    (cbSnapshot.base_salary_vnd != null || cbSnapshot.insurance_salary_vnd != null);
  const cbOpenHref =
    cbHasNumbers && form.employee_id?.trim()
      ? hrmPathWithEmbedSearch(`/employees/${form.employee_id.trim()}?tab=salary`)
      : undefined;

  return (
    <div className="space-y-3 text-base" data-testid="ctr-create-step-1">
      {!isEdit ? (
        <div className="space-y-2" data-testid="ctr-create-subject-tabs">
          <Label className={fieldLabel}>Đối tượng hợp đồng *</Label>
          {!hideCandidateSubject ? (
            <div className="flex gap-2">
              <Button
                type="button"
                variant={subject.subject_type === 'employee' ? 'default' : 'outline'}
                className="h-10 text-base"
                data-testid="ctr-create-subject-tab-employee"
                onClick={() => onSubjectChange({ subject_type: 'employee' })}
              >
                Nhân viên
              </Button>
              <Button
                type="button"
                variant={subject.subject_type === 'candidate' ? 'default' : 'outline'}
                className="h-10 text-base"
                data-testid="ctr-create-subject-tab-candidate"
                onClick={() => onSubjectChange({ subject_type: 'candidate', candidate_id: subject.candidate_id })}
              >
                Ứng viên
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground" data-testid="ctr-create-subject-employee-locked">
              Nhân viên (đã gắn hồ sơ)
            </p>
          )}
          {subject.subject_type === 'candidate' && !hideCandidateSubject ? (
            <CatalogSearchPicker
              options={candidateOptions}
              value={subject.candidate_id}
              onValueChange={(id) => {
                const row = candidatesList.find((c) => c.id === id);
                onSubjectChange({
                  candidate_id: id,
                  requisition_id: row?.requisition_id ?? '',
                });
              }}
              loading={candidatesLoading}
              placeholder="Gõ tên hoặc mã YCTD để tìm ứng viên…"
              searchPlacement={catalogSearchPlacement}
              data-testid="ctr-create-candidate-picker"
              emptyHint={<span className="text-sm">Không khớp UV trong phạm vi công ty.</span>}
            />
          ) : hideCandidateSubject && form.employee_id ? (
            <p className="text-sm font-medium" data-testid={HDSD_MUTATE_TEST_IDS.contractsFormEmployee}>
              {form.employee_name || form.employee_id}
            </p>
          ) : employeesList.length > 0 ? (
            <CatalogSearchPicker
              options={employeeOptions}
              value={form.employee_id ?? ''}
              onValueChange={onEmployeeSelect}
              placeholder="Gõ tên hoặc mã NV để tìm…"
              searchPlacement={catalogSearchPlacement}
              data-testid={HDSD_MUTATE_TEST_IDS.contractsFormEmployee}
              emptyHint={<span className="text-sm">Không khớp NV trong phạm vi công ty.</span>}
            />
          ) : (
            <p className="text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
              Chưa có nhân viên trong phạm vi — tạo hồ sơ NV hoặc chọn tab <strong>Ứng viên</strong>.
            </p>
          )}
          {showEmployeeRecBanner ? (
            <p
              className="text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-md px-3 py-2"
              data-testid={CTR_CREATE_EMPLOYEE_REC_BANNER_TEST_ID}
              role="status"
            >
              Nhân viên chưa có liên kết hồ sơ ứng viên tuyển dụng. Bạn vẫn có thể nhấn{' '}
              <strong>Tiếp</strong> để tạo HĐ, hoặc{' '}
              <a
                className="underline font-medium"
                href={PORTAL_HRM_MENU_PATH.recruitment}
                data-testid="ctr-create-employee-rec-link"
              >
                {CTR_CREATE_EMPLOYEE_REC_BANNER_LINK_LABEL}
              </a>
              .
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="grid grid-cols-12 gap-3">
        {hasContractField('contract_code') && (
          <div className="col-span-12 sm:col-span-4 space-y-1.5">
            <Label className={fieldLabel}>Số hợp đồng *</Label>
            <Input
              className={fieldControl}
              value={form.contract_code}
              onChange={(e) => onFormChange({ contract_code: e.target.value })}
              data-testid="ctr-create-contract-code"
            />
          </div>
        )}
        <div className="col-span-12 sm:col-span-8 space-y-1.5">
          <Label className={fieldLabel}>Tên hợp đồng</Label>
          <Input
            className={cn(fieldControl, 'bg-muted/50')}
            readOnly
            value={derivedContractName || '—'}
            data-testid="ctr-create-contract-name-readonly"
            title="Tự sinh từ số HĐ và loại HĐ"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className={fieldLabel}>Mẫu in (catalog mở)</Label>
        {!templatesLoading && activeTemplates.length === 0 ? (
          <div
            className="text-base text-amber-900 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 space-y-2"
            data-testid="ctr-create-no-active-template-banner"
          >
            <p>
              Chưa có mẫu HĐ <strong>active</strong> trong phạm vi công ty. Tạo hoặc kích hoạt mẫu trong
              Cài đặt, sau đó quay lại chọn mẫu → <strong>Tiếp</strong> (bước điều khoản).
            </p>
            <Button variant="outline" size="sm" className="h-9" asChild>
              <Link to={templateSettingsHref} data-testid="ctr-create-template-settings-cta">
                Mở Cài đặt — Mẫu / điều khoản HĐ
              </Link>
            </Button>
          </div>
        ) : null}
        <CatalogSearchPicker
          options={templateOptions}
          value={templateCode}
          onValueChange={(code) => {
            const tpl =
              activeTemplates.find(
                (t) => (t.template_code ?? t.code).trim().toUpperCase() === code.trim().toUpperCase(),
              ) ?? null;
            onTemplatePick(tpl);
          }}
          loading={templatesLoading}
          placeholder="Chọn template_code active"
          data-testid="ctr-create-template-combobox"
          emptyHint={
            <span className="text-sm">
              Chưa có mẫu active.{' '}
              <Link to={templateSettingsHref} className="text-primary font-medium underline">
                Tạo mẫu trong Cài đặt
              </Link>
              .
            </span>
          }
        />
        {templateCode ? (
          <div className="flex flex-wrap gap-2 items-center text-sm">
            <Badge variant="secondary">{packLabelVi(packCode) || packCode}</Badge>
            {selectedTpl?.default_term_type ? (
              <Badge variant="outline">
                {CONTRACT_TERM_TYPE_LABELS[selectedTpl.default_term_type as keyof typeof CONTRACT_TERM_TYPE_LABELS] ??
                  selectedTpl.default_term_type}
              </Badge>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Chọn mẫu để sang bước điều khoản & xem trước — hoặc chỉ lưu sổ đăng ký.
          </p>
        )}
      </div>

      <div className="grid grid-cols-12 gap-3">
        {hasContractField('contract_type') && (
          <div className="col-span-12 sm:col-span-4 space-y-1.5">
            <Label className={fieldLabel}>Loại hợp đồng *</Label>
            <CatalogSearchPicker
              options={contractTypeOptions}
              value={form.contract_type}
              onValueChange={(value) => onFormChange({ contract_type: value })}
              loading={catalogsLoading}
              errorText={catalogsError ? 'Không tải danh mục' : undefined}
              data-testid={HDSD_MUTATE_TEST_IDS.contractsFormContractType}
            />
          </div>
        )}
        {hasContractField('status') && (
          <div className="col-span-6 sm:col-span-4 space-y-1.5">
            <Label className={fieldLabel}>Trạng thái</Label>
            <Select value={form.status} onValueChange={(v) => onFormChange({ status: v })}>
              <SelectTrigger className={fieldControl}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((s) => (
                  <SelectItem key={s.value} value={s.value} className="text-base">
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        {hasContractField('department') && (
          <div className="col-span-6 sm:col-span-4 space-y-1.5">
            <Label className={fieldLabel}>Phòng ban</Label>
            <CatalogSearchPicker
              options={departmentOptions}
              value={form.department}
              onValueChange={(value) => onFormChange({ department: value })}
              loading={catalogsLoading}
              errorText={catalogsError ? 'Không tải danh mục' : undefined}
              searchPlacement={catalogSearchPlacement}
              data-testid="ctr-create-department-picker"
              emptyHint={
                <a href="/settings" className="text-primary underline text-xs font-medium">
                  Mở Cài đặt → Danh mục nghiệp vụ
                </a>
              }
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-12 gap-3">
        {hasContractField('effective_date') && (
          <div className="col-span-6 sm:col-span-3 space-y-1.5">
            <Label className={fieldLabel}>Ngày hiệu lực *</Label>
            <DatePickerButton
              date={form.effective_date}
              onSelect={(d) => onFormChange({ effective_date: d })}
              controlClass={fieldControl}
            />
          </div>
        )}
        {blocks.showEffectiveTo && hasContractField('expiry_date') && (
          <div className="col-span-6 sm:col-span-3 space-y-1.5">
            <Label className={fieldLabel}>Ngày hết hạn{blocks.effectiveToRequired ? ' *' : ''}</Label>
            <DatePickerButton
              date={form.expiry_date}
              onSelect={(d) => onFormChange({ expiry_date: d })}
              controlClass={fieldControl}
            />
          </div>
        )}
        <div className="col-span-6 sm:col-span-3 space-y-1.5">
          <Label className={fieldLabel}>Ngày ký *</Label>
          <DatePickerButton
            date={extra.signing_date}
            onSelect={(d) => onExtraChange({ signing_date: d })}
            controlClass={fieldControl}
            testId="ctr-create-signing-date"
          />
        </div>
        <div className="col-span-6 sm:col-span-3 space-y-1.5">
          <Label className={fieldLabel}>Hình thức làm việc *</Label>
          <CatalogSearchPicker
            options={workArrangementOptions}
            value={extra.work_arrangement}
            onValueChange={(v) => onExtraChange({ work_arrangement: v })}
            placeholder="Chọn hình thức"
            loading={workArrangementLoading}
            errorText={workArrangementError ? 'Không tải được catalog loại hình.' : undefined}
            searchPlacement={catalogSearchPlacement}
            data-testid="ctr-create-work-arrangement"
            emptyHint={
              <Link
                to={employmentTypesSettingsHref}
                className="text-primary underline text-xs font-medium"
                data-testid="ctr-create-work-arrangement-settings-cta"
              >
                Mở Cài đặt → Loại hình thuê EMP
              </Link>
            }
          />
        </div>
        <div className="col-span-6 sm:col-span-3 space-y-1.5">
          <Label className={fieldLabel}>Tỉ lệ hưởng lương % *</Label>
          <Input
            className={fieldControl}
            inputMode="decimal"
            value={extra.salary_ratio_percent}
            onChange={(e) => onExtraChange({ salary_ratio_percent: e.target.value.replace(/[^\d.,]/g, '') })}
            placeholder="0–100"
            data-testid="ctr-create-salary-ratio"
          />
        </div>
        <div className="col-span-12 sm:col-span-3 flex items-end">
          <Button type="button" variant="outline" onClick={applyDuration} className="w-full h-10 text-base">
            Gợi ý thời hạn từ mẫu
          </Button>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className={fieldLabel}>Nơi làm việc</Label>
        <Input
          className={fieldControl}
          data-testid="ctr-work-location"
          value={form.work_location}
          onChange={(e) => onFormChange({ work_location: e.target.value })}
          placeholder="Ví dụ: Hà Nội — trụ sở chính"
        />
      </div>

      <ContractCbReadOnlyCard
        snapshot={cbSnapshot}
        cbMasked={cbMasked}
        bootstrapEligible={cbBootstrapEligible}
        bootstrap={cbBootstrap}
        onBootstrapChange={onCbBootstrapChange}
        openCbHref={cbOpenHref}
      />

      {contextLoading ? (
        <p className="text-base text-muted-foreground">Đang tải snapshot NV / C&B…</p>
      ) : contextSnapshot ? (
        <details
          className="rounded-lg border border-border/80 bg-slate-50/60 open:pb-2"
          data-testid="ctr-create-context-details"
        >
          <summary className="cursor-pointer select-none px-3 py-2 text-base font-medium">
            Thông tin NV & C&B (read-only — thu gọn)
          </summary>
          <div className="space-y-2 px-2 pb-1 [&_[data-testid=ctr-create-party-b-card]]:p-2">
            <ContractPartyBReadOnlyCard party={contextSnapshot.employee_party_b} />
            <ContractEmployerSignatoryBlock
              employer={contextSnapshot.employer_party_a}
              signerName={extra.signer_name || contextSnapshot.suggested_signatory.signer_name}
              signerPosition={
                extra.signer_position || contextSnapshot.suggested_signatory.signer_position
              }
              onSignerNameChange={(v) => onExtraChange({ signer_name: v })}
              onSignerPositionChange={(v) => onExtraChange({ signer_position: v })}
            />
          </div>
        </details>
      ) : null}

      {blocks.showDriverBlock && (
        <div className="grid grid-cols-12 gap-2 rounded-lg border p-3" data-testid="ctr-create-driver-block">
          <p className="col-span-12 text-base font-medium">GPLX (gói Lái xe)</p>
          <div className="col-span-6 sm:col-span-3 space-y-1">
            <Label className="text-sm">Số GPLX</Label>
            <Input className="h-9" value={extra.driver_license_number} onChange={(e) => onExtraChange({ driver_license_number: e.target.value })} />
          </div>
          <div className="col-span-6 sm:col-span-3 space-y-1">
            <Label className="text-sm">Hạng</Label>
            <Input className="h-9" value={extra.driver_license_class} onChange={(e) => onExtraChange({ driver_license_class: e.target.value })} />
          </div>
          <div className="col-span-6 sm:col-span-3 space-y-1">
            <Label className="text-sm">Ngày cấp</Label>
            <Input className="h-9" value={extra.driver_license_issued_on} onChange={(e) => onExtraChange({ driver_license_issued_on: e.target.value })} placeholder="dd/MM/yyyy" />
          </div>
          <div className="col-span-6 sm:col-span-3 space-y-1">
            <Label className="text-sm">Nơi cấp</Label>
            <Input className="h-9" value={extra.driver_license_issued_place} onChange={(e) => onExtraChange({ driver_license_issued_place: e.target.value })} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 sm:col-span-6 space-y-1.5">
          <Label className={fieldLabel}>Trích yếu</Label>
          <Textarea
            className="text-base min-h-[4rem]"
            rows={2}
            value={extra.abstract_text}
            onChange={(e) => onExtraChange({ abstract_text: e.target.value })}
            data-testid="ctr-create-abstract"
          />
        </div>
        {hasContractField('notes') && (
          <div className="col-span-12 sm:col-span-6 space-y-1.5">
            <Label className={fieldLabel}>Ghi chú</Label>
            <Textarea
              className="text-base min-h-[4rem]"
              rows={2}
              value={form.notes}
              onChange={(e) => onFormChange({ notes: e.target.value })}
            />
          </div>
        )}
      </div>

      <button
        type="button"
        className="text-base text-primary underline"
        data-testid="ctr-create-registry-only-link"
        onClick={onRegistryOnly}
      >
        Chỉ lưu sổ đăng ký (không mẫu in)
      </button>
    </div>
  );
}

function DatePickerButton({
  date,
  onSelect,
  controlClass,
  testId,
}: {
  date: Date | undefined;
  onSelect: (d: Date | undefined) => void;
  controlClass?: string;
  testId?: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            controlClass,
            !date && 'text-muted-foreground',
          )}
          data-testid={testId}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          {date ? format(date, 'dd/MM/yyyy') : 'Chọn ngày'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={date} onSelect={onSelect} locale={vi} initialFocus />
      </PopoverContent>
    </Popover>
  );
}
