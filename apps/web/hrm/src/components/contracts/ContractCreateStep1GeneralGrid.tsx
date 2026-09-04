/**
 * @CODE-MEMORY
 * Screen:     /contracts wizard Bước 1 — Interactive A4 Paper Contract Document Template Sheet
 * WorkItem:   PO-HRM-CTR-CREATE-REDESIGN-FE-01 · FE-03 · HRM-CTR-CREATE-REDESIGN-FE-02
 *
 * @CODE-MEMORY-CHANGE 2026-08-10 HRM-CTR-CREATE-REDESIGN-FE-02
 * What: UV + NV picker inline search (CC parent portal) · default tab Nhân viên (BA-03 NV-first)
 *
 * @CODE-MEMORY-CHANGE 2026-08-11 PO-HRM-EMPLOYMENT-TYPES-CONSUMER-CTR-FE-01
 * What: Hình thức làm việc — CatalogSearchPicker + useEmpEmploymentTypesEffective (BR-SET-CONSUMER-ET-DUAL-01)
 * UC: AC-SET-CONSUMER-ET-CTR-01 · POST work_arrangement = catalog snake code
 * must_keep: QACONPAYSTQC1 dept+contract_type pickers; settings_catalog_e2e_ready=false
 *
 * @CODE-MEMORY-CHANGE 2026-09-04 PO-HRM-CTR-CREATE-PAPER-TEMPLATE-REDESIGN-01
 * What: Redesign into interactive A4 Paper Document Canvas matching real contract Excel benchmark (HĐTV Khối VP)
 * Why: User requested paper document template view with clean inline controls & signature section
 *
 * @CODE-MEMORY-CHANGE 2026-09-04 PO-HRM-CTR-CREATE-TYPE-ONLY-EDITABLE-NAME-SETTINGS-CLAUSES-01
 * What: Type-only contract selection (remove template dropdown), editable contract name textbox, dynamic Settings clauses with auto-increment numbers
 */
import { useState, useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { CalendarIcon, Building2, User, Sparkles, Plus, X, FileText, CheckCircle2 } from 'lucide-react';
import { hrmPathWithEmbedSearch } from '@/lib/hrmEmbedNavigation';
import { getEmployeeById, listContractClauses, type HrmContractClauseRecord, type HrmContractTemplateRecord } from '@/integrations/hrmApi';
import { useQuery } from '@tanstack/react-query';
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
import { cn } from '@/lib/utils';
import { HDSD_MUTATE_TEST_IDS } from '@/lib/hdsdMutateTestIds';
import type { CatalogPickerOption } from '@/lib/catalogSearchPicker';
import {
  activeTemplatesForPicker,
} from '@/lib/contractTemplateCatalog';
import {
  applyTemplateDurationHint,
  visibleBlocksForTemplate,
} from '@/lib/contractCreateFieldManifest';
import type { ContractCreateContextSnapshot, ContractCbBootstrapDraft } from '@/lib/contractCreateApi';
import { isContractCbBootstrapState } from '@/lib/contractCreateApi';
import type { ContractWizardExtraFields, ContractWizardFormSlice, ContractWizardSubjectState } from '@/lib/contractCreateWizardState';
import { ContractCbReadOnlyCard } from '@/components/contracts/ContractCbReadOnlyCard';
import {
  CTR_CREATE_EMPLOYEE_REC_BANNER_TEST_ID,
  shouldShowEmployeeRecruitmentBanner,
} from '@/lib/contractEmployeeRecBanner';
import { useEmpEmploymentTypesEffective } from '@/hooks/useEmpEmploymentTypesEffective';
import { getHrmPortalMode } from '@/lib/hrmPortalMode';

import {
  CONTRACT_CLAUSE_GROUP_LABELS,
  CONTRACT_CLAUSE_GROUPS,
} from '@/lib/contractLegalPrintConstants';
import {
  clauseGroupLabelVi,
  normalizeClauseGroupKey,
} from '@/lib/contractClauseLibraryUx';

const fieldLabel = 'text-xs font-semibold uppercase tracking-wider text-slate-700';
const fieldControl = 'h-9 text-xs';

const formatDateDisplay = (val?: string | null) => {
  if (!val) return '……/……/……';
  try {
    return format(new Date(val), 'dd/MM/yyyy');
  } catch {
    return val;
  }
};

function DatePickerButton({
  date,
  onSelect,
  disabled,
  controlClass = 'h-9 text-xs',
  testId,
}: {
  date: string | Date | undefined;
  onSelect: (date: string) => void;
  disabled?: boolean;
  controlClass?: string;
  testId?: string;
}) {
  const dateStr = date instanceof Date ? date.toISOString().split('T')[0] : date;
  const selected = dateStr ? new Date(dateStr) : undefined;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          data-testid={testId}
          className={cn(
            'w-full justify-start text-left font-normal bg-white/80 border-slate-300 hover:bg-white',
            !dateStr && 'text-muted-foreground',
            controlClass,
          )}
        >
          <CalendarIcon className="mr-2 h-3.5 w-3.5 shrink-0 opacity-60 text-blue-600" />
          {dateStr ? format(new Date(dateStr), 'dd/MM/yyyy') : <span>Chọn ngày</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 z-[100]" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(d) => {
            if (d) onSelect(format(d, 'yyyy-MM-dd'));
          }}
          locale={vi}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

export type DynamicClauseItem = {
  id: string;
  clauseId?: string;
  groupKey?: string;
  code: string;
  title: string;
  body: string;
};

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
  cbBootstrap: ContractCbBootstrapDraft;
  onCbBootstrapChange: (patch: Partial<ContractCbBootstrapDraft>) => void;
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
  employeesList,
  candidatesList,
  candidatesLoading,
  subject,
  onSubjectChange,
  derivedContractName,
  onEmployeeSelect,
  templates,
  templateCode,
  packCode,
  contextSnapshot,
  hasContractField,
  onRegistryOnly,
  cbBootstrap,
  onCbBootstrapChange,
  hideCandidateSubject = false,
}: ContractCreateStep1GeneralGridProps) {
  const portalMode = getHrmPortalMode(window.location.search);
  const catalogSearchPlacement: 'popover' | 'inline' = portalMode === 'embed' ? 'inline' : 'popover';
  const companyId = contextSnapshot?.employer_party_a?.id || 'main';

  const {
    employmentTypeOptions: workArrangementOptions,
  } = useEmpEmploymentTypesEffective({
    currentValue: extra.work_arrangement,
  });

  const DEFAULT_INITIAL_CLAUSES: DynamicClauseItem[] = [
    {
      id: 'default-dieu-2',
      clauseId: '',
      groupKey: 'WORKING_HOURS',
      code: 'CHE_DO_LAM_VIEC',
      title: 'CHẾ ĐỘ LÀM VIỆC',
      body: '- Thời gian: 08h/ngày, 06 ngày/tuần (hoặc theo ca nghiệp vụ).\n- Phương tiện & Dụng cụ: Cấp phát theo quy định Công ty.',
    },
    {
      id: 'default-dieu-3',
      clauseId: '',
      groupKey: 'COMPENSATION',
      code: 'QUYEN_LOI_MUC_LUONG',
      title: 'QUYỀN LỢI VÀ MỨC LƯƠNG',
      body: 'Được đóng BHXH, BHYT & khen thưởng theo chính sách Công ty.',
    },
  ];

  const [customClauses, setCustomClauses] = useState<DynamicClauseItem[]>(DEFAULT_INITIAL_CLAUSES);

  const [customGroupMap] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('xevn_contract_clause_custom_groups');
      return saved ? (JSON.parse(saved) as Record<string, string>) : {};
    } catch {
      return {};
    }
  });

  // Fetch active clauses from Master Settings
  const { data: settingsClauses = [] } = useQuery({
    queryKey: ['contract-clauses-settings-active', companyId],
    queryFn: async () => {
      const res = await listContractClauses({ company_id: companyId });
      const items = res.items || [];
      return items.filter((c) => !c.status || c.status.toLowerCase() === 'active');
    },
    staleTime: 60_000,
  });

  const allGroups = useMemo(() => {
    const set = new Set<string>([
      ...CONTRACT_CLAUSE_GROUPS,
      ...Object.keys(customGroupMap),
      ...settingsClauses.map((c) => normalizeClauseGroupKey(c.clause_group)).filter(Boolean),
    ]);
    return Array.from(set);
  }, [customGroupMap, settingsClauses]);

  const getGroupLabel = (key: string) => {
    return (
      customGroupMap[key] ??
      CONTRACT_CLAUSE_GROUP_LABELS[key] ??
      clauseGroupLabelVi(key, customGroupMap)
    );
  };

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

  const { data: employeeDetail } = useQuery({
    queryKey: ['contract-party-b-detail', form.employee_id],
    queryFn: () => getEmployeeById(form.employee_id ?? '', [companyId, 'main']),
    enabled: Boolean(form.employee_id?.trim()),
    staleTime: 60_000,
  });

  // Auto-fill department when employee detail or selection becomes available
  useEffect(() => {
    if (form.employee_id) {
      const deptVal =
        (employeeDetail as any)?.department_id ||
        (employeeDetail as any)?.department_key ||
        (employeeDetail as any)?.department_name ||
        (employeeDetail as any)?.department ||
        (selectedEmployee as any)?.department_id ||
        (selectedEmployee as any)?.department ||
        '';
      if (deptVal && !form.department) {
        onFormChange({ department: String(deptVal) });
      }
    }
  }, [form.employee_id, employeeDetail, selectedEmployee, form.department, onFormChange]);

  // Pre-fill contract_name if empty
  useEffect(() => {
    if (!form.contract_name && derivedContractName) {
      onFormChange({ contract_name: derivedContractName });
    }
  }, [form.contract_name, derivedContractName, onFormChange]);

  const empCode = selectedEmployee?.employee_code || (employeeDetail as any)?.employee_code || (employeeDetail as any)?.code || (form as any).employee_code || '—';
  const empName = selectedEmployee?.full_name || (employeeDetail as any)?.full_name || (employeeDetail as any)?.name || form.employee_name || '—';
  const birthDate = (employeeDetail as any)?.birth_date || (employeeDetail as any)?.dob || (employeeDetail as any)?.date_of_birth || null;
  const idNumber = (employeeDetail as any)?.id_number || (employeeDetail as any)?.identity_card_number || (employeeDetail as any)?.id_card_number || '—';
  const idIssueDate = (employeeDetail as any)?.id_issue_date || (employeeDetail as any)?.identity_card_issued_on || (employeeDetail as any)?.id_card_issued_on || null;
  const idIssuePlace = (employeeDetail as any)?.id_issue_place || (employeeDetail as any)?.identity_card_issued_place || (employeeDetail as any)?.id_card_issued_place || '—';
  const address = (employeeDetail as any)?.permanent_address || (employeeDetail as any)?.address || (employeeDetail as any)?.resident_address || '—';

  const blocks = visibleBlocksForTemplate(templateCode, packCode);

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
  const cbOpenHref =
    cbSnapshot != null && form.employee_id?.trim()
      ? typeof hrmPathWithEmbedSearch === 'function'
        ? hrmPathWithEmbedSearch(`/employees/${form.employee_id.trim()}?tab=salary`)
        : `/employees/${form.employee_id.trim()}?tab=salary`
      : undefined;

  const legalName = contextSnapshot?.employer_party_a?.legal_name || 'CÔNG TY TNHH X.E VIỆT NAM';
  const signerName = extra.signer_name || contextSnapshot?.suggested_signatory?.signer_name || 'Nguyễn Trọng Khánh';
  const signerPosition = extra.signer_position || contextSnapshot?.suggested_signatory?.signer_position || 'Giám đốc';

  const updateAbstractText = (clauses: DynamicClauseItem[]) => {
    const fullAbstract = clauses
      .map((c, idx) => `Điều ${idx + 2}. ${(c.title || 'ĐIỀU KHOẢN').toUpperCase()}\n${c.body}`)
      .join('\n\n');
    onExtraChange({ abstract_text: fullAbstract });
  };

  const handleAddNewClauseItem = () => {
    const newId = `clause-${Date.now()}`;
    const defaultGroup = allGroups[0] || 'LEGAL_BASIS';
    const groupClauses = settingsClauses.filter(
      (c) => normalizeClauseGroupKey(c.clause_group) === normalizeClauseGroupKey(defaultGroup),
    );
    const firstClause = groupClauses[0];

    const newItem: DynamicClauseItem = {
      id: newId,
      clauseId: firstClause?.id || '',
      groupKey: defaultGroup,
      code: firstClause?.code || '',
      title: firstClause?.title_vi || 'ĐIỀU KHOẢN BỔ SUNG',
      body: firstClause?.body_vi || '',
    };

    const nextClauses = [...customClauses, newItem];
    setCustomClauses(nextClauses);
    updateAbstractText(nextClauses);
  };

  const handleGroupChange = (itemId: string, newGroupKey: string) => {
    const groupClauses = settingsClauses.filter(
      (c) => normalizeClauseGroupKey(c.clause_group) === normalizeClauseGroupKey(newGroupKey),
    );
    const firstClause = groupClauses[0];

    setCustomClauses((prev) => {
      const next = prev.map((item) => {
        if (item.id !== itemId) return item;
        return {
          ...item,
          groupKey: newGroupKey,
          clauseId: firstClause?.id || '',
          code: firstClause?.code || '',
          title: firstClause?.title_vi || item.title || 'ĐIỀU KHOẢN BỔ SUNG',
          body: firstClause?.body_vi || '',
        };
      });
      updateAbstractText(next);
      return next;
    });
  };

  const handleClauseSelect = (itemId: string, clauseId: string) => {
    const targetClause = settingsClauses.find((c) => c.id === clauseId);
    if (!targetClause) return;

    setCustomClauses((prev) => {
      const next = prev.map((item) => {
        if (item.id !== itemId) return item;
        return {
          ...item,
          clauseId: targetClause.id,
          code: targetClause.code,
          groupKey: targetClause.clause_group || item.groupKey,
          title: targetClause.title_vi || targetClause.code,
          body: targetClause.body_vi || '',
        };
      });
      updateAbstractText(next);
      return next;
    });
  };

  const handleRemoveClause = (id: string) => {
    const nextClauses = customClauses.filter((c) => c.id !== id);
    setCustomClauses(nextClauses);
    updateAbstractText(nextClauses);
  };

  return (
    <div className="space-y-4 text-sm" data-testid="ctr-create-step-1">
      {/* 📄 INTERACTIVE A4 PAPER CONTRACT SHEET */}
      <div className="bg-white shadow-xl border border-slate-200 rounded-sm p-6 sm:p-10 max-w-4xl mx-auto space-y-6 text-slate-900 font-sans leading-relaxed">
        
        {/* HEADER BẢN HỢP ĐỒNG */}
        <div className="border-b border-slate-200 pb-5 space-y-4">
          <div className="grid grid-cols-12 gap-4 items-start text-xs text-center">
            <div className="col-span-12 sm:col-span-5 text-left space-y-1">
              <p className="font-bold uppercase text-slate-900 tracking-tight">{legalName}</p>
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-slate-500 font-medium">Số:</span>
                <Input
                  className="h-7 text-xs font-semibold w-40 bg-slate-50 border-slate-300"
                  value={form.contract_code}
                  onChange={(e) => onFormChange({ contract_code: e.target.value })}
                  placeholder="HĐTV-XE-001"
                  data-testid="ctr-create-contract-code"
                />
              </div>
            </div>
            <div className="col-span-12 sm:col-span-7 text-center space-y-0.5">
              <p className="font-bold uppercase tracking-tight text-slate-900">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
              <p className="font-semibold text-slate-800">Độc lập - Tự do - Hạnh phúc</p>
              <p className="text-slate-400 text-xs font-serif">─────────o0o─────────</p>
            </div>
          </div>

          {/* EDITABLE TÊN HỢP ĐỒNG TEXTBOX */}
          <div className="mt-4 text-center space-y-1">
            <div className="relative max-w-xl mx-auto">
              <Input
                className="text-lg font-bold uppercase tracking-wide text-slate-900 text-center border-b border-dashed border-slate-300 focus:border-blue-500 bg-transparent h-10 w-full"
                value={form.contract_name || ''}
                onChange={(e) => onFormChange({ contract_name: e.target.value })}
                placeholder={derivedContractName || 'HỢP ĐỒNG THỬ VIỆC'}
                title="Bấm để sửa lại Tên Hợp đồng"
              />
            </div>
            <p className="text-xs text-slate-500 italic">
              (Dự thảo mẫu in hợp đồng tương tác trực tiếp — Xuất chuẩn Word .docx / PDF)
            </p>
          </div>
        </div>

        {/* CHỌN LOẠI HỢP ĐỒNG (DUY NHẤT) */}
        <div className="p-3 bg-slate-50/90 border border-slate-200 rounded-md grid grid-cols-12 gap-3 text-xs items-center">
          <div className="col-span-12 sm:col-span-4 font-semibold text-slate-800">
            Cấu hình Loại Hợp đồng *
          </div>
          <div className="col-span-12 sm:col-span-8">
            <CatalogSearchPicker
              options={contractTypeOptions}
              value={form.contract_type}
              onValueChange={(val) => onFormChange({ contract_type: val })}
              placeholder="Chọn loại hợp đồng…"
              searchPlacement={catalogSearchPlacement}
              data-testid={HDSD_MUTATE_TEST_IDS.contractsFormContractType}
            />
          </div>
        </div>

        {/* THỎA THUẬN CÁC BÊN */}
        <div className="space-y-4">
          <p className="text-xs italic text-slate-600">
            Hôm nay, chúng tôi gồm có các bên ký kết hợp đồng lao động:
          </p>

          {/* 🏢 BÊN A: NGƯỜI SỬ DỤNG LAO ĐỘNG */}
          <div className="p-4 bg-blue-50/30 border border-blue-100 rounded-md space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs text-blue-900 uppercase tracking-wide">
              <Building2 className="w-4 h-4 text-blue-600" />
              BÊN A: NGƯỜI SỬ DỤNG LAO ĐỘNG (NSDLĐ)
            </div>
            <div className="grid grid-cols-12 gap-2 text-xs text-slate-800">
              <div className="col-span-12 sm:col-span-8">
                <span className="text-slate-500">Tên doanh nghiệp:</span> <strong>{legalName}</strong>
              </div>
              <div className="col-span-12 sm:col-span-4">
                <span className="text-slate-500">SĐT:</span> <span>{contextSnapshot?.employer_party_a?.phone || '024.3681.5722'}</span>
              </div>
              <div className="col-span-12 sm:col-span-6 flex items-center gap-2">
                <span className="text-slate-500 shrink-0">Người đại diện ký:</span>
                <Input
                  className="h-7 text-xs font-semibold bg-white border-slate-300"
                  value={extra.signer_name || signerName}
                  onChange={(e) => onExtraChange({ signer_name: e.target.value })}
                  placeholder="Họ tên người ký"
                />
              </div>
              <div className="col-span-12 sm:col-span-6 flex items-center gap-2">
                <span className="text-slate-500 shrink-0">Chức vụ:</span>
                <Input
                  className="h-7 text-xs font-semibold bg-white border-slate-300"
                  value={extra.signer_position || signerPosition}
                  onChange={(e) => onExtraChange({ signer_position: e.target.value })}
                  placeholder="Chức vụ"
                />
              </div>
              <div className="col-span-12">
                <span className="text-slate-500">Địa chỉ trụ sở:</span>{' '}
                <span>{contextSnapshot?.employer_party_a?.address || 'Số 4 đường Văn Chỉ, thôn Tam Đa, xã Tam Hưng, TP. Hà Nội'}</span>
              </div>
            </div>
          </div>

          {/* 👤 BÊN B: NGƯỜI LAO ĐỘNG */}
          <div className="p-4 bg-emerald-50/30 border border-emerald-100 rounded-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-xs text-emerald-900 uppercase tracking-wide">
                <User className="w-4 h-4 text-emerald-600" />
                BÊN B: NGƯỜI LAO ĐỘNG (NLD)
              </div>
              {!isEdit && !hideCandidateSubject && (
                <div className="flex gap-1" data-testid="ctr-create-subject-tabs">
                  <Button
                    type="button"
                    variant={subject.subject_type === 'employee' ? 'default' : 'outline'}
                    size="sm"
                    className="h-7 text-xs px-2.5"
                    data-testid="ctr-create-subject-tab-employee"
                    onClick={() => onSubjectChange({ subject_type: 'employee' })}
                  >
                    Nhân viên
                  </Button>
                  <Button
                    type="button"
                    variant={subject.subject_type === 'candidate' ? 'default' : 'outline'}
                    size="sm"
                    className="h-7 text-xs px-2.5"
                    data-testid="ctr-create-subject-tab-candidate"
                    onClick={() => onSubjectChange({ subject_type: 'candidate', candidate_id: subject.candidate_id })}
                  >
                    Ứng viên
                  </Button>
                </div>
              )}
            </div>

            {!isEdit ? (
              <div className="space-y-1.5">
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
                  />
                ) : hideCandidateSubject && form.employee_id ? (
                  <p className="text-xs font-semibold text-emerald-950" data-testid={HDSD_MUTATE_TEST_IDS.contractsFormEmployee}>
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
                  />
                ) : (
                  <p className="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                    Chưa có nhân viên trong phạm vi — tạo hồ sơ NV hoặc chọn tab <strong>Ứng viên</strong>.
                  </p>
                )}

                {showEmployeeRecBanner ? (
                  <p
                    className="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-md px-3 py-1.5"
                    data-testid={CTR_CREATE_EMPLOYEE_REC_BANNER_TEST_ID}
                    role="status"
                  >
                    Nhân viên chưa có liên kết hồ sơ ứng viên tuyển dụng. Vẫn có thể nhấn <strong>Tiếp</strong> để tạo HĐ.
                  </p>
                ) : null}
              </div>
            ) : null}

            {/* THÔNG TIN HÀNH CHÍNH NHÂN SỰ TỰ ĐỔ */}
            {form.employee_id || empName !== '—' ? (
              <div className="p-3 bg-white/90 border border-emerald-200/80 rounded-md grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-slate-500">Mã NV:</span> <strong>{empCode}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Họ và tên:</span> <strong>{empName}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Ngày sinh:</span> <span>{formatDateDisplay(birthDate)}</span>
                </div>
                <div>
                  <span className="text-slate-500">Số CCCD/Passport:</span> <span>{idNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500">Ngày cấp:</span> <span>{formatDateDisplay(idIssueDate)}</span>
                </div>
                <div>
                  <span className="text-slate-500">Nơi cấp:</span> <span>{idIssuePlace}</span>
                </div>
                <div className="sm:col-span-3">
                  <span className="text-slate-500">Thường trú:</span> <span>{address}</span>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* ĐIỀU KHOẢN HỢP ĐỒNG */}
        <div className="space-y-4 pt-2 border-t border-slate-200 text-xs sm:text-sm">
          <p className="font-bold text-slate-900">Hai bên đồng ý ký kết hợp đồng với các điều khoản sau đây:</p>

          {/* ĐIỀU 1: THỜI HẠN VÀ CÔNG VIỆC */}
          <div className="space-y-3 bg-amber-50/20 border border-amber-200/60 p-3.5 rounded-md">
            <h3 className="font-bold text-slate-900 flex items-center justify-between">
              <span>ĐIỀU 1. THỜI HẠN VÀ CÔNG VIỆC HỢP ĐỒNG:</span>
              {templateCode && (
                <button
                  type="button"
                  onClick={applyDuration}
                  className="text-xs text-blue-600 font-medium underline flex items-center gap-1 hover:text-blue-800"
                  data-testid="ctr-create-apply-duration-hint"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Gợi ý thời hạn mẫu
                </button>
              )}
            </h3>

            <div className="grid grid-cols-12 gap-3 text-xs">
              <div className="col-span-12 sm:col-span-6 space-y-1">
                <Label className={fieldLabel}>Ngày bắt đầu (Từ ngày) *</Label>
                <DatePickerButton
                  date={form.effective_date}
                  onSelect={(val) => {
                    onFormChange({ effective_date: val });
                    if (!form.expiry_date && templateCode) {
                      const next = applyTemplateDurationHint(val, templateCode, packCode);
                      if (next) onFormChange({ effective_date: val, expiry_date: next });
                    }
                  }}
                  testId="ctr-create-effective-date"
                />
              </div>

              <div className="col-span-12 sm:col-span-6 space-y-1">
                <Label className={fieldLabel}>Ngày kết thúc (Đến ngày)</Label>
                <DatePickerButton
                  date={form.expiry_date}
                  onSelect={(val) => onFormChange({ expiry_date: val })}
                  testId="ctr-create-expiry-date"
                />
              </div>

              <div className="col-span-12 sm:col-span-6 space-y-1">
                <Label className={fieldLabel}>Phòng ban *</Label>
                <CatalogSearchPicker
                  options={departmentOptions}
                  value={form.department}
                  onValueChange={(val) => onFormChange({ department: val })}
                  placeholder="Chọn phòng ban…"
                  searchPlacement={catalogSearchPlacement}
                  data-testid="ctr-create-department-picker"
                />
              </div>

              <div className="col-span-12 sm:col-span-6 space-y-1">
                <Label className={fieldLabel}>Địa điểm làm việc</Label>
                <Input
                  className={fieldControl}
                  data-testid="ctr-work-location"
                  value={form.work_location}
                  onChange={(e) => onFormChange({ work_location: e.target.value })}
                  placeholder="Ví dụ: Hà Nội — trụ sở chính"
                />
              </div>
            </div>
          </div>

          {/* ➕ NÚT THÊM ĐIỀU KHOẢN (ĐẶT SAU ĐIỀU 1) */}
          <div className="flex items-center justify-between py-2.5 px-3 border border-dashed border-blue-300 my-3 bg-blue-50/50 rounded-md">
            <span className="text-xs font-semibold text-blue-900">
              Các điều khoản tiếp theo (bắt đầu từ Điều 2, Điều 3, Điều 4...)
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5 border-blue-500 text-blue-700 bg-white hover:bg-blue-50 font-semibold shadow-xs"
              onClick={handleAddNewClauseItem}
              data-testid="ctr-create-add-clause-btn"
            >
              <Plus className="w-3.5 h-3.5" />
              + Thêm điều khoản
            </Button>
          </div>

          {/* DANH SÁCH ĐIỀU KHOẢN (ĐIỀU 2, ĐIỀU 3, ĐIỀU 4, ĐIỀU 5...) */}
          {customClauses.map((clauseItem, index) => {
            const clauseNumber = index + 2;
            const currentGroupKey = clauseItem.groupKey || 'WORKING_HOURS';
            const clausesInGroup = settingsClauses.filter(
              (c) => normalizeClauseGroupKey(c.clause_group) === normalizeClauseGroupKey(currentGroupKey),
            );

            return (
              <div
                key={clauseItem.id}
                className="space-y-3 bg-white border border-slate-300 p-4 rounded-md text-xs shadow-xs relative"
              >
                {/* HEADER ĐIỀU KHOẢN */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm uppercase tracking-wide">
                    ĐIỀU {clauseNumber}. {clauseItem.title ? clauseItem.title.toUpperCase() : 'CHỌN ĐIỀU KHOẢN...'}:
                  </h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-slate-400 hover:text-red-600"
                    onClick={() => handleRemoveClause(clauseItem.id)}
                    title="Gỡ điều khoản này"
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>

                {/* SELECTORS: CHỌN NHÓM & CHỌN TÊN ĐIỀU KHOẢN TỪ SETTINGS */}
                <div className="grid grid-cols-12 gap-3 p-2.5 bg-slate-50 border border-slate-200 rounded-md">
                  <div className="col-span-12 sm:col-span-6 space-y-1">
                    <Label className="text-[11px] font-semibold text-slate-600">
                      Chọn Nhóm điều khoản:
                    </Label>
                    <Select
                      value={currentGroupKey}
                      onValueChange={(groupKey) => handleGroupChange(clauseItem.id, groupKey)}
                    >
                      <SelectTrigger className="h-8 text-xs bg-white">
                        <SelectValue placeholder="Chọn nhóm…" />
                      </SelectTrigger>
                      <SelectContent>
                        {allGroups.map((g) => (
                          <SelectItem key={g} value={g}>
                            {getGroupLabel(g)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-12 sm:col-span-6 space-y-1">
                    <Label className="text-[11px] font-semibold text-slate-600">
                      Chọn Tên điều khoản (từ Cài đặt):
                    </Label>
                    <Select
                      value={clauseItem.clauseId || ''}
                      onValueChange={(clauseId) => handleClauseSelect(clauseItem.id, clauseId)}
                    >
                      <SelectTrigger className="h-8 text-xs bg-white">
                        <SelectValue placeholder="Chọn tên điều khoản…" />
                      </SelectTrigger>
                      <SelectContent>
                        {clausesInGroup.length === 0 ? (
                          <SelectItem value="_empty" disabled>
                            (Nhóm này chưa có điều khoản active trong Cài đặt)
                          </SelectItem>
                        ) : (
                          clausesInGroup.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.title_vi || c.code}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* TƯƠNG TÁC ĐẶC THÙ NẾU LÀ ĐIỀU KHOẢN CHẾ ĐỘ LÀM VIỆC HOẶC MỨC LƯƠNG */}
                {clauseItem.code === 'CHE_DO_LAM_VIEC' || currentGroupKey === 'WORKING_HOURS' ? (
                  <div className="grid grid-cols-12 gap-3 items-center pt-1">
                    <div className="col-span-12 sm:col-span-6 space-y-1">
                      <Label className={fieldLabel}>Hình thức làm việc</Label>
                      <CatalogSearchPicker
                        options={workArrangementOptions}
                        value={extra.work_arrangement}
                        onValueChange={(val) => onExtraChange({ work_arrangement: val })}
                        placeholder="Chọn hình thức làm việc…"
                        searchPlacement={catalogSearchPlacement}
                        data-testid="ctr-create-work-arrangement"
                      />
                    </div>
                    <div className="col-span-12 sm:col-span-6 text-slate-600">
                      <p>- Thời gian: 08h/ngày, 06 ngày/tuần (hoặc theo ca nghiệp vụ).</p>
                      <p>- Phương tiện & Dụng cụ: Cấp phát theo quy định Công ty.</p>
                    </div>
                  </div>
                ) : null}

                {clauseItem.code === 'QUYEN_LOI_MUC_LUONG' || currentGroupKey === 'COMPENSATION' ? (
                  <div className="space-y-3 pt-1">
                    <div className="grid grid-cols-12 gap-3">
                      <div className="col-span-12 sm:col-span-6 space-y-1">
                        <Label className={fieldLabel}>Tỉ lệ hưởng lương (%)</Label>
                        <Select
                          value={form.salary_percentage ? String(form.salary_percentage) : '100'}
                          onValueChange={(val) => onFormChange({ salary_percentage: Number(val) })}
                        >
                          <SelectTrigger className={fieldControl} data-testid="ctr-create-salary-ratio">
                            <SelectValue placeholder="Chọn tỉ lệ" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="100">100% (Chính thức)</SelectItem>
                            <SelectItem value="85">85% (Thử việc)</SelectItem>
                            <SelectItem value="80">80%</SelectItem>
                            <SelectItem value="75">75%</SelectItem>
                            <SelectItem value="50">50%</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-12 sm:col-span-6 space-y-1">
                        <Label className={fieldLabel}>Chế độ BHXH & Tiền thưởng</Label>
                        <p className="text-slate-600 pt-1">
                          Được đóng BHXH, BHYT & khen thưởng theo chính sách Công ty.
                        </p>
                      </div>
                    </div>
                    <ContractCbReadOnlyCard
                      snapshot={cbSnapshot}
                      cbMasked={cbMasked}
                      bootstrapEligible={cbBootstrapEligible}
                      bootstrap={cbBootstrap}
                      onBootstrapChange={onCbBootstrapChange}
                      openCbHref={cbOpenHref}
                    />
                  </div>
                ) : null}

                {/* NỘI DUNG MÔ TẢ ĐIỀU KHOẢN TỰ ĐỘNG HIỆN BÊN DƯỚI */}
                {clauseItem.body ? (
                  <div className="p-3 bg-slate-50/80 border border-slate-200 rounded-md">
                    <p className="text-slate-800 whitespace-pre-wrap leading-relaxed">
                      {clauseItem.body}
                    </p>
                  </div>
                ) : (
                  <p className="text-slate-400 italic">
                    (Chọn nhóm và tên điều khoản ở trên để hiển thị nội dung tự động)
                  </p>
                )}
              </div>
            );
          })}

          {/* CHẾ ĐỘ GPLX (GÓI LÁI XE NẾU CÓ) */}
          {blocks.showDriverBlock && (
            <div className="grid grid-cols-12 gap-2 rounded-lg border border-amber-300 p-3 bg-amber-50/40 text-xs" data-testid="ctr-create-driver-block">
              <p className="col-span-12 font-bold text-amber-950">Thông tin GPLX (Gói Lái xe)</p>
              <div className="col-span-6 sm:col-span-3 space-y-1">
                <Label className="text-xs">Số GPLX</Label>
                <Input className="h-8 text-xs bg-white" value={extra.driver_license_number} onChange={(e) => onExtraChange({ driver_license_number: e.target.value })} />
              </div>
              <div className="col-span-6 sm:col-span-3 space-y-1">
                <Label className="text-xs">Hạng</Label>
                <Input className="h-8 text-xs bg-white" value={extra.driver_license_class} onChange={(e) => onExtraChange({ driver_license_class: e.target.value })} />
              </div>
              <div className="col-span-6 sm:col-span-3 space-y-1">
                <Label className="text-xs">Ngày cấp</Label>
                <Input className="h-8 text-xs bg-white" value={extra.driver_license_issued_on} onChange={(e) => onExtraChange({ driver_license_issued_on: e.target.value })} placeholder="dd/MM/yyyy" />
              </div>
              <div className="col-span-6 sm:col-span-3 space-y-1">
                <Label className="text-xs">Nơi cấp</Label>
                <Input className="h-8 text-xs bg-white" value={extra.driver_license_issued_place} onChange={(e) => onExtraChange({ driver_license_issued_place: e.target.value })} />
              </div>
            </div>
          )}

          {/* TRÍCH YẾU & GHI CHÚ */}
          <div className="grid grid-cols-12 gap-3 pt-2 text-xs">
            <div className="col-span-12 sm:col-span-6 space-y-1">
              <Label className={fieldLabel}>Trích yếu hợp đồng</Label>
              <Textarea
                className="text-xs min-h-[3rem] bg-slate-50/50 border-slate-300"
                rows={2}
                value={extra.abstract_text}
                onChange={(e) => onExtraChange({ abstract_text: e.target.value })}
                placeholder="Trích yếu nội dung hợp đồng…"
                data-testid="ctr-create-abstract"
              />
            </div>
            {hasContractField('notes') && (
              <div className="col-span-12 sm:col-span-6 space-y-1">
                <Label className={fieldLabel}>Ghi chú nội bộ</Label>
                <Textarea
                  className="text-xs min-h-[3rem] bg-slate-50/50 border-slate-300"
                  rows={2}
                  value={form.notes}
                  onChange={(e) => onFormChange({ notes: e.target.value })}
                  placeholder="Ghi chú thêm…"
                />
              </div>
            )}
          </div>

          {/* ✍️ KHỐI CHỮ KÝ ĐẠI DIỆN TRÊN HỢP ĐỒNG */}
          <div className="pt-6 border-t border-slate-200 grid grid-cols-12 gap-4 text-center text-xs">
            <div className="col-span-6 space-y-8">
              <div>
                <p className="font-bold uppercase tracking-tight text-slate-900">NGƯỜI LAO ĐỘNG</p>
                <p className="italic text-slate-500 text-[11px]">(Ký và ghi rõ họ tên)</p>
              </div>
              <div className="pt-8">
                <p className="font-bold text-slate-900">{selectedEmployee?.full_name || '……………………'}</p>
              </div>
            </div>
            <div className="col-span-6 space-y-8">
              <div>
                <p className="font-bold uppercase tracking-tight text-slate-900">NGƯỜI SỬ DỤNG LAO ĐỘNG</p>
                <p className="italic text-slate-500 text-[11px]">(Ký, đóng dấu và ghi rõ họ tên)</p>
              </div>
              <div className="pt-8">
                <p className="font-bold text-slate-900">{(extra.signer_name || signerName).toUpperCase()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER OPTION LINK */}
      <div className="text-center pt-1">
        <button
          type="button"
          className="text-xs text-slate-600 underline hover:text-slate-900"
          data-testid="ctr-create-registry-only-link"
          onClick={onRegistryOnly}
        >
          Chỉ lưu sổ đăng ký (không tạo bản in hợp đồng)
        </button>
      </div>
    </div>
  );
}
