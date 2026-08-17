/**
 * @CODE-MEMORY
 * Screen:     /payroll · tab Thành phần lương
 * UC:         UC-HRM-PAY · salary components
 * BR:         L-OPS · zero-tolerance mã/tên/loại (compliance lương/thuế)
 * SRS:        docs/hrm/SRS.md § lương
 * TechSpec:   docs/program/UX-UI-ERP-ANALYSIS.md D5 Zod + RHF
 * Purpose:    Tab live danh mục thành phần lương — list/filter + dialog Thêm/Sửa/Xóa.
 * WorkItem:   D-UX-D5-ZOD-LIVE-WIRE-01
 * Coded:      2026-07-28
 * Callers:    pages/Payroll.tsx (tab Thành phần lương)
 * Callees:    useSalaryComponents · createSalaryComponentFormSchema · FormulaInput
 * FE-Actions: | Thêm mới | setShowAddDialog + RHF handleSubmit | createComponent |
 *             | Sửa / Xóa | formData + validateEditForm | update/delete |
 * Impact:     Zod không gắn dialog live → QA D5 FAIL (orphan Payroll Dialog);
 *             message sai namespace → lệch payroll.salaryComponents.*
 * must_keep:  taxSettlementFloatingUi C1 (Payroll); API create/update path;
 *             không seed/deploy; UX-03 debounce không đụng
 * SOLID:      Tab owns live Add dialog — schema factory inject messages từ useTranslation
 * LastVerified: docs/qa/evidence/d-ux-d5-zod-live-wire-01-20260728.md
 *
 * @CODE-MEMORY-CHANGE 2026-07-28
 * WorkItem: D-UX-D5-ZOD-LIVE-WIRE-01
 * change_mode: FIX
 * What: Dialog Thêm — wire createSalaryComponentFormSchema + RHF FormMessage
 *       (keys payroll.salaryComponents.*); bỏ validateForm thủ công trên Add;
 *       map Zod values → SalaryComponentFormData (appliedUnits default ['all'] → applied_to)
 * Why: QA-UX-D5-01 FAIL — Zod chỉ nằm Dialog orphan Payroll.tsx không setShow(true)
 * must_keep: Edit/Delete dialogs; createComponent API; C1/Clock-In/UX-03 debounce ngoài scope
 *
 * @CODE-MEMORY-CHANGE 2026-07-28
 * WorkItem: D-FE-ERP-E2-01
 * change_mode: ADD
 * What: Bản chất TP = CatalogSearchPicker pay_types (code); Zod allowed codes; U72 label
 * Why: FR-HRM-PAY-CLEAN-E2-01 · AC-E2-PAY-NATURE-01 — cấm HARDCODE componentTypes SoT
 * must_keep: nature accounting axis; createComponent API; E1-A/E1-B untouched
 *
 * @CODE-MEMORY-CHANGE 2026-08-05
 * WorkItem: PO-HRM-UI-BRAND-W4-PAY-A
 * change_mode: UPGRADE
 * What: Precision Motion P02/P16 — DNA badges; dialog sm:max-w-[920px] + compact code/name;
 *       DialogTitle ≥20; FormulaInput chrome kept GĐ1 Form (P18)
 * Why: ADR §16 · FE-PAY P0 · modal brand bar/glass via Dialog foundation
 * must_keep: Zod+RHF create/update/delete wires; CatalogSearchPicker; no formula/API invent
 *
 * @CODE-MEMORY-CHANGE 2026-08-10 PO-HRM-MVP-GD1-PAY-02-CLUSTER-FE-BROWSER-01
 * change_mode: ADD
 * What: QA testids hdsd-pay-salary-component-* · pay_types picker id; cmdk interaction via CatalogSearchPicker
 * Why: J-HRM-PAY-02-01 browser harness
 * must_keep: Zod+RHF · N+1 admin CREATE · payroll_e2e_ready=false
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-DYNAMIC-CONFIG-PLATFORM-PAY-CATALOG-CNS-FE-01
 * change_mode: ADD
 * What: Admin CREATE code = open free-text N+1 (L-PAY-AC-01 / BR-PLT-05) — bỏ Settings
 *       salary_components CatalogSearchPicker làm ceiling; display label từ Nest list;
 *       pay_types REF giữ; consumers rebind Nest riêng (useSalaryComponentsEffective).
 * Why: BA-01 Option B — Settings ≠ sole SoT; AC-PLT-PAY-01c retain open admin
 * must_keep: payroll_e2e_ready=false · DENY formula LIVE · U65 · pay_types picker · Nest CRUD
 *
 * @CODE-MEMORY-CHANGE 2026-08-11 D-FE-HRM-PAY-PAY-TYPE-CONSUMER-REG-01
 * change_mode: FIX
 * What: AC-SET-CONSUMER-PT-PAY-01 — CTA Cài đặt master-data (pay_types bucket) embed-safe;
 *       source locks vitest po-hrm-pay-types-consumer-pay-fe-01
 * Why: BA-HRM-PAY-TYPES-CONSUMER-PAY-01 · BR-SET-CONSUMER-PT-SOT-02 · peer ET-CTR CTA
 * must_keep: payTypeOptionsFromCatalog · Zod allowedPayTypeCodes · filter by catalog code · JGRECQC1 seals
 */
import { useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CatalogSearchPicker } from '@/components/common/CatalogSearchPicker';
import { useSettingsCatalogsOverview } from '@/hooks/useSettingsCatalogsOverview';
import {
  payTypeOptionsFromCatalog,
  resolvePayTypeLabel,
} from '@/lib/catalogSearchPicker';
import {
  nestSalaryComponentsToPickerOptions,
  resolveNestSalaryComponentLabel,
  PAY_SALARY_COMPONENT_SETTINGS_NOT_SOT_NOTE,
} from '@/lib/salaryComponentCatalog';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  MoreHorizontal,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  X,
  ClipboardList,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { FormulaInput } from '@/components/payroll/FormulaInput';
import {
  createSalaryComponentFormSchema,
  DEFAULT_SALARY_COMPONENT_FORM_VALUES,
  type SalaryComponentFormMessages,
  type SalaryComponentFormValues,
} from '@/components/payroll/salaryComponentFormSchema';
import {
  useSalaryComponents,
  SalaryComponent,
  SalaryComponentFormData,
  systemSalaryComponents,
} from '@/hooks/useSalaryComponents';
import { Skeleton } from '@/components/ui/skeleton';
import { hrmPathWithEmbedSearch } from '@/lib/hrmEmbedNavigation';

const PAY_TYPES_SETTINGS_HREF = hrmPathWithEmbedSearch('/settings?tab=master-data');

const initialFormData: SalaryComponentFormData = {
  code: '',
  name: '',
  component_type: '',
  nature: 'income',
  value_type: 'currency',
  is_taxable: true,
  is_insurance_base: false,
  formula: '',
  default_value: 0,
  applied_to: 'all',
  is_active: true,
  sort_order: 0,
};

/** Live tab defaults: schema requires appliedUnits min(1); API uses applied_to string. */
const ADD_FORM_DEFAULTS: SalaryComponentFormValues = {
  ...DEFAULT_SALARY_COMPONENT_FORM_VALUES,
  appliedUnits: ['all'],
};

function mapZodValuesToFormData(values: SalaryComponentFormValues): SalaryComponentFormData {
  const applied =
    values.appliedUnits.length === 0 || values.appliedUnits.includes('all')
      ? 'all'
      : values.appliedUnits.join(',');
  return {
    code: values.code.trim(),
    name: values.name.trim(),
    component_type: values.componentType,
    nature: values.nature,
    value_type: values.valueType,
    is_taxable: values.isTaxable,
    is_insurance_base: false,
    formula: values.formula || '',
    default_value: 0,
    description: values.description || undefined,
    applied_to: applied,
    is_active: true,
    sort_order: 0,
  };
}

export const SalaryComponentsTab = () => {
  const { t } = useTranslation();
  const {
    components,
    isLoading,
    createComponent,
    updateComponent,
    deleteComponent,
    toggleComponentStatus,
    initializeDefaultComponents,
  } = useSalaryComponents();
  const {
    catalogs,
    isLoading: catalogsLoading,
    isError: catalogsError,
  } = useSettingsCatalogsOverview();
  const payTypeOptions = useMemo(
    () => payTypeOptionsFromCatalog(catalogs ?? []),
    [catalogs],
  );
  /** Nest TX list — display labels only (admin CREATE remains open slug N+1). */
  const nestDisplayOptions = useMemo(
    () => nestSalaryComponentsToPickerOptions(components, { includeInactive: true }),
    [components],
  );
  const allowedPayTypeCodesRef = useRef<string[]>([]);
  allowedPayTypeCodesRef.current = payTypeOptions.map((o) => o.value);
  /** L-PAY-AC-01 — admin CREATE must NOT apply consumer invent ban / Settings ceiling. */
  const allowedCatalogCodesRef = useRef<string[]>([]);
  allowedCatalogCodesRef.current = [];

  const [activeTab, setActiveTab] = useState<'custom' | 'system'>('custom');
  const [searchTerm, setSearchTerm] = useState('');
  const [componentTypeFilter, setComponentTypeFilter] = useState<string>('all');
  const [natureFilter, setNatureFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(true);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [componentToEdit, setComponentToEdit] = useState<SalaryComponent | null>(null);
  const [componentToDelete, setComponentToDelete] = useState<SalaryComponent | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit dialog — controlled form (Add uses RHF)
  const [formData, setFormData] = useState<SalaryComponentFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const existingCodesRef = useRef<string[]>([]);
  existingCodesRef.current = components.map((c) => c.code);

  const salaryComponentFormMessages = useMemo(
    (): SalaryComponentFormMessages => ({
      codeRequired: t('payroll.salaryComponents.codeRequired'),
      codeMinLength: t('payroll.salaryComponents.codeMinLength'),
      codeFormat: t('payroll.salaryComponents.codeFormat'),
      codeExists: t('payroll.salaryComponents.codeExists'),
      nameRequired: t('payroll.salaryComponents.nameRequired'),
      nameMinLength: t('payroll.salaryComponents.nameMinLength'),
      nameMaxLength: t('payroll.salaryComponents.nameMaxLength'),
      unitRequired: t('payroll.salaryComponents.unitRequired'),
      typeRequired: t('payroll.salaryComponents.typeRequired'),
      typeNotInCatalog: t(
        'payroll.salaryComponents.typeNotInCatalog',
        'Chọn bản chất từ danh mục pay_types (Cài đặt).',
      ),
      codeNotInCatalog: t(
        'payroll.salaryComponents.codeNotInCatalog',
        'Mã thành phần không hợp lệ (admin path: format/UQ only — không ceiling Settings).',
      ),
    }),
    [t],
  );

  const addFormSchema = useMemo(
    () =>
      createSalaryComponentFormSchema(
        salaryComponentFormMessages,
        () => existingCodesRef.current,
        () => allowedPayTypeCodesRef.current,
        () => allowedCatalogCodesRef.current,
      ),
    [salaryComponentFormMessages],
  );

  const addForm = useForm<SalaryComponentFormValues>({
    resolver: zodResolver(addFormSchema),
    defaultValues: ADD_FORM_DEFAULTS,
    mode: 'onSubmit',
  });

  const filteredComponents = useMemo(() => {
    return components.filter((comp) => {
      const matchesSearch =
        comp.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comp.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType =
        componentTypeFilter === 'all' || comp.component_type === componentTypeFilter;
      const matchesNature = natureFilter === 'all' || comp.nature === natureFilter;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && comp.is_active) ||
        (statusFilter === 'inactive' && !comp.is_active);
      return matchesSearch && matchesType && matchesNature && matchesStatus;
    });
  }, [components, searchTerm, componentTypeFilter, natureFilter, statusFilter]);

  const filteredSystemComponents = useMemo(() => {
    return systemSalaryComponents.filter((comp) => {
      const matchesSearch =
        comp.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comp.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType =
        componentTypeFilter === 'all' || comp.componentType === componentTypeFilter;
      const matchesNature = natureFilter === 'all' || comp.nature === natureFilter;
      return matchesSearch && matchesType && matchesNature;
    });
  }, [searchTerm, componentTypeFilter, natureFilter]);

  const formulaAvailableComponents = useMemo(() => {
    return [
      ...components.map((c) => ({ code: c.code, name: c.name })),
      ...systemSalaryComponents.map((c) => ({ code: c.code, name: c.name })),
    ];
  }, [components]);

  const stats = useMemo(() => {
    const total = components.length;
    const active = components.filter((c) => c.is_active).length;
    const income = components.filter((c) => c.nature === 'income').length;
    const deduction = components.filter((c) => c.nature === 'deduction').length;
    return { total, active, income, deduction };
  }, [components]);

  const openAddDialog = () => {
    addForm.reset(ADD_FORM_DEFAULTS);
    setShowAddDialog(true);
  };

  const closeAddDialog = () => {
    setShowAddDialog(false);
    addForm.reset(ADD_FORM_DEFAULTS);
  };

  const handleAddSubmit = addForm.handleSubmit(async (values) => {
    setIsSubmitting(true);
    const result = await createComponent(mapZodValuesToFormData(values));
    setIsSubmitting(false);
    if (result) {
      closeAddDialog();
    }
  });

  const validateEditForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) {
      errors.name = t('salaryComponents.validation.nameRequired');
    }
    if (!formData.component_type) {
      errors.component_type = t('salaryComponents.validation.typeRequired');
    } else if (
      payTypeOptions.length > 0 &&
      !payTypeOptions.some((o) => o.value === formData.component_type)
    ) {
      errors.component_type = t(
        'payroll.salaryComponents.typeNotInCatalog',
        'Chọn bản chất từ danh mục pay_types (Cài đặt).',
      );
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenEdit = (component: SalaryComponent) => {
    setComponentToEdit(component);
    setFormData({
      code: component.code,
      name: component.name,
      category_id: component.category_id,
      component_type: component.component_type,
      nature: component.nature,
      value_type: component.value_type,
      is_taxable: component.is_taxable,
      is_insurance_base: component.is_insurance_base,
      formula: component.formula || '',
      default_value: component.default_value,
      min_value: component.min_value,
      max_value: component.max_value,
      description: component.description,
      applied_to: component.applied_to,
      is_active: component.is_active,
      sort_order: component.sort_order,
    });
    setFormErrors({});
    setShowEditDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!componentToEdit || !validateEditForm()) return;

    setIsSubmitting(true);
    const success = await updateComponent(componentToEdit.id, formData);
    setIsSubmitting(false);

    if (success) {
      setShowEditDialog(false);
      setComponentToEdit(null);
      setFormData(initialFormData);
      setFormErrors({});
    }
  };

  const handleOpenDelete = (component: SalaryComponent) => {
    setComponentToDelete(component);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!componentToDelete) return;

    setIsSubmitting(true);
    const success = await deleteComponent(componentToDelete.id);
    setIsSubmitting(false);

    if (success) {
      setShowDeleteDialog(false);
      setComponentToDelete(null);
    }
  };

  const handleInitializeDefaults = async () => {
    if (components.length > 0) {
      if (!confirm(t('salaryComponents.dialogs.confirmInitialize'))) {
        return;
      }
    }
    await initializeDefaultComponents();
  };

  const getNatureBadge = (nature: string) => {
    switch (nature) {
      case 'income':
        return (
          <Badge className="bg-success/10 text-success border-success/30">
            {t('salaryComponents.nature.income')}
          </Badge>
        );
      case 'deduction':
        return (
          <Badge className="bg-destructive/10 text-destructive border-destructive/30">
            {t('salaryComponents.nature.deduction')}
          </Badge>
        );
      default:
        return <Badge variant="secondary">{t('salaryComponents.nature.other')}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 flex-1" />
          ))}
        </div>
        <Skeleton className="h-12 w-full" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-120px)]">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-[20px] font-bold font-display text-xevn-text" data-testid="pay-components-precision">
              {t('salaryComponents.title')}
            </h1>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t('salaryComponents.searchPlaceholder')}
                  className="pl-10 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" onClick={handleInitializeDefaults}>
                <ClipboardList className="w-4 h-4 mr-2" />
                {t('salaryComponents.initializeDefaults')}
              </Button>
              <Button className="bg-primary gap-2" onClick={openAddDialog} data-testid="hdsd-pay-salary-component-add">
                <Plus className="w-4 h-4" />
                {t('salaryComponents.addNew')}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">{t('salaryComponents.stats.total')}</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">{t('salaryComponents.stats.active')}</p>
                <p className="text-2xl font-bold text-success">{stats.active}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">{t('salaryComponents.stats.income')}</p>
                <p className="text-2xl font-bold text-blue-600">{stats.income}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">
                  {t('salaryComponents.stats.deduction')}
                </p>
                <p className="text-2xl font-bold text-destructive">{stats.deduction}</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center gap-6 border-b -mx-6 px-6">
            <button
              className={cn(
                'pb-3 text-sm font-medium border-b-2 transition-colors',
                activeTab === 'custom'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
              onClick={() => setActiveTab('custom')}
            >
              {t('salaryComponents.tabs.company')} ({components.length})
            </button>
            <button
              className={cn(
                'pb-3 text-sm font-medium border-b-2 transition-colors',
                activeTab === 'system'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
              onClick={() => setActiveTab('system')}
            >
              {t('salaryComponents.tabs.system')} ({systemSalaryComponents.length})
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full">
            <thead className="bg-muted/50 sticky top-0">
              <tr>
                <th className="w-12 p-3 text-center text-xs font-medium text-muted-foreground">#</th>
                <th className="p-3 text-left text-xs font-medium text-muted-foreground">
                  {t('salaryComponents.table.code')}
                </th>
                <th className="p-3 text-left text-xs font-medium text-muted-foreground">
                  {t('salaryComponents.table.name')}
                </th>
                <th className="p-3 text-left text-xs font-medium text-muted-foreground">
                  {t('salaryComponents.table.type')}
                </th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">
                  {t('salaryComponents.table.nature')}
                </th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">
                  {t('salaryComponents.table.valueType')}
                </th>
                <th className="p-3 text-center text-xs font-medium text-muted-foreground">
                  {t('salaryComponents.table.taxable')}
                </th>
                {activeTab === 'custom' && (
                  <>
                    <th className="p-3 text-center text-xs font-medium text-muted-foreground">
                      {t('salaryComponents.table.status')}
                    </th>
                    <th className="p-3 text-center text-xs font-medium text-muted-foreground w-24" />
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {activeTab === 'custom' ? (
                filteredComponents.length > 0 ? (
                  filteredComponents.map((component, index) => (
                    <tr key={component.id} className="border-b hover:bg-muted/30">
                      <td className="p-3 text-center text-muted-foreground">
                        {String(index + 1).padStart(2, '0')}
                      </td>
                      <td className="p-3">
                        <code className="text-sm bg-muted px-2 py-1 rounded text-primary font-medium">
                          {component.code}
                        </code>
                      </td>
                      <td className="p-3 font-medium">
                        {resolveNestSalaryComponentLabel(nestDisplayOptions, component.code) !== '—'
                          ? resolveNestSalaryComponentLabel(nestDisplayOptions, component.code)
                          : component.name}
                      </td>
                      <td className="p-3">
                        <Badge variant="outline">
                          {resolvePayTypeLabel(payTypeOptions, component.component_type) !== '—'
                            ? resolvePayTypeLabel(payTypeOptions, component.component_type)
                            : component.component_type}
                        </Badge>
                      </td>
                      <td className="p-3 text-center">{getNatureBadge(component.nature)}</td>
                      <td className="p-3 text-center">
                        <span className="text-sm text-muted-foreground">
                          {component.value_type === 'currency'
                            ? t('salaryComponents.valueTypes.currency')
                            : component.value_type === 'number'
                              ? t('salaryComponents.valueTypes.number')
                              : t('salaryComponents.valueTypes.percentage')}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        {component.is_taxable ? (
                          <CheckCircle2 className="w-5 h-5 text-success mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-muted-foreground mx-auto" />
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <Badge
                          variant={component.is_active ? 'default' : 'secondary'}
                          className={cn(
                            component.is_active
                              ? 'bg-success/10 text-success'
                              : 'bg-muted text-muted-foreground',
                          )}
                        >
                          {component.is_active
                            ? t('salaryComponents.status.active')
                            : t('salaryComponents.status.inactive')}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenEdit(component)}>
                              <Pencil className="w-4 h-4 mr-2" />
                              {t('salaryComponents.actions.edit')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                toggleComponentStatus(component.id, !component.is_active)
                              }
                            >
                              {component.is_active
                                ? t('salaryComponents.actions.deactivate')
                                : t('salaryComponents.actions.activate')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleOpenDelete(component)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              {t('salaryComponents.actions.delete')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <ClipboardList className="w-12 h-12 text-muted-foreground/50" />
                        <p>{t('salaryComponents.empty.message')}</p>
                        <Button size="sm" onClick={openAddDialog}>
                          <Plus className="w-4 h-4 mr-2" />
                          {t('salaryComponents.empty.addFirst')}
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              ) : (
                filteredSystemComponents.map((component, index) => (
                  <tr key={component.code} className="border-b hover:bg-muted/30">
                    <td className="p-3 text-center text-muted-foreground">
                      {String(index + 1).padStart(2, '0')}
                    </td>
                    <td className="p-3">
                      <code className="text-sm bg-muted px-2 py-1 rounded text-primary font-medium">
                        {component.code}
                      </code>
                    </td>
                    <td className="p-3 font-medium">{component.name}</td>
                    <td className="p-3">
                      <Badge variant="outline">{component.componentType}</Badge>
                    </td>
                    <td className="p-3 text-center">{getNatureBadge(component.nature)}</td>
                    <td className="p-3 text-center">
                      <span className="text-sm text-muted-foreground">
                        {t('salaryComponents.valueTypes.currency')}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {component.isTaxable ? (
                        <CheckCircle2 className="w-5 h-5 text-success mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-muted-foreground mx-auto" />
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t bg-card">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="default" size="sm" className="h-8 w-8 p-0">
              1
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <span className="text-sm text-muted-foreground">
            {t('salaryComponents.showingResults', {
              count:
                activeTab === 'custom'
                  ? filteredComponents.length
                  : filteredSystemComponents.length,
            })}
          </span>
        </div>
      </div>

      <Collapsible open={showFilters} onOpenChange={setShowFilters}>
        <CollapsibleContent className="w-72 border-l p-4 bg-muted/30 overflow-y-auto">
          <div className="mb-6">
            <h4 className="text-sm font-medium mb-3 text-muted-foreground">
              {t('salaryComponents.filters.componentType')}
            </h4>
            <Select value={componentTypeFilter} onValueChange={setComponentTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t('common.all')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                {payTypeOptions.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mb-6">
            <h4 className="text-sm font-medium mb-3 text-muted-foreground">
              {t('salaryComponents.filters.nature')}
            </h4>
            <RadioGroup value={natureFilter} onValueChange={setNatureFilter} className="space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="nature-all" />
                <Label htmlFor="nature-all" className="font-normal cursor-pointer text-sm">
                  {t('common.all')}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="income" id="nature-income" />
                <Label htmlFor="nature-income" className="font-normal cursor-pointer text-sm">
                  {t('salaryComponents.nature.income')}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="deduction" id="nature-deduction" />
                <Label htmlFor="nature-deduction" className="font-normal cursor-pointer text-sm">
                  {t('salaryComponents.nature.deduction')}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="nature-other" />
                <Label htmlFor="nature-other" className="font-normal cursor-pointer text-sm">
                  {t('salaryComponents.nature.other')}
                </Label>
              </div>
            </RadioGroup>
          </div>

          {activeTab === 'custom' && (
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-3 text-muted-foreground">
                {t('salaryComponents.filters.status')}
              </h4>
              <RadioGroup
                value={statusFilter}
                onValueChange={setStatusFilter}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="status-all" />
                  <Label htmlFor="status-all" className="font-normal cursor-pointer text-sm">
                    {t('common.all')}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="active" id="status-active" />
                  <Label htmlFor="status-active" className="font-normal cursor-pointer text-sm">
                    {t('salaryComponents.filters.activeOnly')}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="inactive" id="status-inactive" />
                  <Label htmlFor="status-inactive" className="font-normal cursor-pointer text-sm">
                    {t('salaryComponents.filters.inactiveOnly')}
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>

      {/* Add Dialog — Zod + RHF (D-UX-D5-ZOD-LIVE-WIRE-01) */}
      <Dialog
        open={showAddDialog}
        onOpenChange={(open) => {
          if (open) openAddDialog();
          else closeAddDialog();
        }}
      >
        <DialogContent className="sm:max-w-[920px]" data-testid="pay-salary-component-add-dialog-precision">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[20px] font-bold font-display">
              <Plus className="w-5 h-5 text-xevn-primary" />
              {t('salaryComponents.form.addTitle')}
            </DialogTitle>
          </DialogHeader>
          <Form {...addForm}>
            <form
              className="space-y-4 py-4"
              onSubmit={(e) => {
                e.preventDefault();
                void handleAddSubmit();
              }}
            >
              <FormField
                control={addForm.control}
                name="code"
                render={({ field, fieldState }) => (
                  <FormItem className="grid grid-cols-[150px_1fr] items-start gap-4 space-y-0">
                    <Label className="text-right pt-2">
                      {t('salaryComponents.form.code')} <span className="text-destructive">*</span>
                    </Label>
                    <div className="space-y-1">
                      <FormControl>
                        <Input
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '');
                            field.onChange(value);
                          }}
                          placeholder={t('salaryComponents.form.codePlaceholder')}
                          className={cn(
                            'xevn-field-code',
                            fieldState.error ? 'border-destructive' : '',
                          )}
                          data-testid="pay-salary-component-code-input"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                      <p className="text-xs text-xevn-textSecondary">
                        {t('salaryComponents.form.codeHint')}
                      </p>
                      <p className="text-[11px] text-xevn-textSecondary">
                        {PAY_SALARY_COMPONENT_SETTINGS_NOT_SOT_NOTE}
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={addForm.control}
                name="name"
                render={({ field, fieldState }) => (
                  <FormItem className="grid grid-cols-[150px_1fr] items-start gap-4 space-y-0">
                    <Label className="text-right pt-2">
                      {t('salaryComponents.form.name')} <span className="text-destructive">*</span>
                    </Label>
                    <div className="space-y-1">
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={t('salaryComponents.form.namePlaceholder')}
                          className={cn(
                            'xevn-field-name',
                            fieldState.error ? 'border-destructive' : '',
                          )}
                          data-testid="pay-salary-component-name-input"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={addForm.control}
                name="componentType"
                render={({ field, fieldState }) => (
                  <FormItem className="grid grid-cols-[150px_1fr] items-start gap-4 space-y-0">
                    <Label className="text-right pt-2">
                      {t('salaryComponents.form.componentType')}{' '}
                      <span className="text-destructive">*</span>
                    </Label>
                    <div className="space-y-1">
                      <FormControl>
                        <CatalogSearchPicker
                          options={payTypeOptions}
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder={t('salaryComponents.form.selectType')}
                          loading={catalogsLoading}
                          data-testid="hdsd-pay-salary-component-type"
                          errorText={
                            catalogsError ? t('settings.catalogs.loadError') : undefined
                          }
                          emptyHint={
                            <Link
                              to={PAY_TYPES_SETTINGS_HREF}
                              className="text-primary underline text-xs font-medium"
                              data-testid="pay-salary-component-type-settings-cta"
                            >
                              Mở Cài đặt → Danh mục nghiệp vụ (pay_types)
                            </Link>
                          }
                          triggerClassName={
                            fieldState.error ? 'border-destructive' : undefined
                          }
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={addForm.control}
                name="nature"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-[150px_1fr] items-center gap-4 space-y-0">
                    <Label className="text-right">{t('salaryComponents.form.nature')}</Label>
                    <div className="flex items-center gap-4">
                      <Select
                        value={field.value}
                        onValueChange={(value: 'income' | 'deduction' | 'other') =>
                          field.onChange(value)
                        }
                      >
                        <FormControl>
                          <SelectTrigger className="w-[150px]">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="income">
                            {t('salaryComponents.nature.income')}
                          </SelectItem>
                          <SelectItem value="deduction">
                            {t('salaryComponents.nature.deduction')}
                          </SelectItem>
                          <SelectItem value="other">
                            {t('salaryComponents.nature.other')}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormField
                        control={addForm.control}
                        name="isTaxable"
                        render={({ field: taxField }) => (
                          <RadioGroup
                            value={taxField.value ? 'taxable' : 'nontaxable'}
                            onValueChange={(value) => taxField.onChange(value === 'taxable')}
                            className="flex items-center gap-4"
                          >
                            <div className="flex items-center gap-2">
                              <RadioGroupItem value="taxable" id="add-taxable" />
                              <Label
                                htmlFor="add-taxable"
                                className="font-normal cursor-pointer"
                              >
                                {t('salaryComponents.form.taxable')}
                              </Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <RadioGroupItem value="nontaxable" id="add-nontaxable" />
                              <Label
                                htmlFor="add-nontaxable"
                                className="font-normal cursor-pointer"
                              >
                                {t('salaryComponents.form.nonTaxable')}
                              </Label>
                            </div>
                          </RadioGroup>
                        )}
                      />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={addForm.control}
                name="valueType"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-[150px_1fr] items-center gap-4 space-y-0">
                    <Label className="text-right">{t('salaryComponents.form.valueType')}</Label>
                    <Select
                      value={field.value}
                      onValueChange={(value: 'currency' | 'number' | 'percentage') =>
                        field.onChange(value)
                      }
                    >
                      <FormControl>
                        <SelectTrigger className="w-[150px]">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="currency">
                          {t('salaryComponents.valueTypes.currency')}
                        </SelectItem>
                        <SelectItem value="number">
                          {t('salaryComponents.valueTypes.number')}
                        </SelectItem>
                        <SelectItem value="percentage">
                          {t('salaryComponents.valueTypes.percentage')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={addForm.control}
                name="formula"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-[150px_1fr] items-start gap-4 space-y-0">
                    <Label className="text-right pt-2">
                      {t('salaryComponents.form.formula')}
                    </Label>
                    <FormulaInput
                      value={field.value || ''}
                      onChange={field.onChange}
                      availableComponents={formulaAvailableComponents}
                      placeholder={t('salaryComponents.form.formulaPlaceholder')}
                    />
                  </FormItem>
                )}
              />

              <FormField
                control={addForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-[150px_1fr] items-start gap-4 space-y-0">
                    <Label className="text-right pt-2">
                      {t('salaryComponents.form.description')}
                    </Label>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t('salaryComponents.form.descriptionPlaceholder')}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={closeAddDialog}>
                  {t('salaryComponents.dialogs.cancel')}
                </Button>
                <Button type="submit" disabled={isSubmitting} data-testid="hdsd-pay-salary-component-save">
                  {isSubmitting
                    ? t('salaryComponents.dialogs.saving')
                    : t('salaryComponents.dialogs.add')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={showEditDialog}
        onOpenChange={(open) => {
          setShowEditDialog(open);
          if (!open) {
            setComponentToEdit(null);
            setFormData(initialFormData);
            setFormErrors({});
          }
        }}
      >
        <DialogContent className="sm:max-w-[920px]" data-testid="pay-salary-component-edit-dialog-precision">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[20px] font-bold font-display">
              <Pencil className="w-5 h-5 text-xevn-primary" />
              {t('salaryComponents.form.editTitle')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-[150px_1fr] items-start gap-4">
              <Label className="text-right pt-2">{t('salaryComponents.form.code')}</Label>
              <Input value={formData.code} disabled className="bg-muted" />
            </div>

            <div className="grid grid-cols-[150px_1fr] items-start gap-4">
              <Label className="text-right pt-2">
                {t('salaryComponents.form.name')} <span className="text-destructive">*</span>
              </Label>
              <div className="space-y-1">
                <Input
                  value={formData.name}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, name: e.target.value }));
                    if (formErrors.name) setFormErrors((prev) => ({ ...prev, name: '' }));
                  }}
                  className={formErrors.name ? 'border-destructive' : ''}
                />
                {formErrors.name && (
                  <p className="text-xs text-destructive">{formErrors.name}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-[150px_1fr] items-start gap-4">
              <Label className="text-right pt-2">
                {t('salaryComponents.form.componentType')}
              </Label>
              <div className="space-y-1">
                <CatalogSearchPicker
                  options={payTypeOptions}
                  value={formData.component_type}
                  onValueChange={(value) => {
                    setFormData((prev) => ({ ...prev, component_type: value }));
                    if (formErrors.component_type) {
                      setFormErrors((prev) => ({ ...prev, component_type: '' }));
                    }
                  }}
                  placeholder={t('salaryComponents.form.selectType')}
                  loading={catalogsLoading}
                  errorText={catalogsError ? t('settings.catalogs.loadError') : undefined}
                  emptyHint={
                    <Link
                      to={PAY_TYPES_SETTINGS_HREF}
                      className="text-primary underline text-xs font-medium"
                      data-testid="pay-salary-component-type-settings-cta"
                    >
                      Mở Cài đặt → Danh mục nghiệp vụ (pay_types)
                    </Link>
                  }
                />
                {formErrors.component_type && (
                  <p className="text-xs text-destructive">{formErrors.component_type}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-[150px_1fr] items-center gap-4">
              <Label className="text-right">{t('salaryComponents.form.nature')}</Label>
              <div className="flex items-center gap-4">
                <Select
                  value={formData.nature}
                  onValueChange={(value: 'income' | 'deduction' | 'other') =>
                    setFormData((prev) => ({ ...prev, nature: value }))
                  }
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">{t('salaryComponents.nature.income')}</SelectItem>
                    <SelectItem value="deduction">
                      {t('salaryComponents.nature.deduction')}
                    </SelectItem>
                    <SelectItem value="other">{t('salaryComponents.nature.other')}</SelectItem>
                  </SelectContent>
                </Select>
                <RadioGroup
                  value={formData.is_taxable ? 'taxable' : 'nontaxable'}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, is_taxable: value === 'taxable' }))
                  }
                  className="flex items-center gap-4"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="taxable" id="edit-taxable" />
                    <Label htmlFor="edit-taxable" className="font-normal cursor-pointer">
                      {t('salaryComponents.form.taxable')}
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="nontaxable" id="edit-nontaxable" />
                    <Label htmlFor="edit-nontaxable" className="font-normal cursor-pointer">
                      {t('salaryComponents.form.nonTaxable')}
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div className="grid grid-cols-[150px_1fr] items-center gap-4">
              <Label className="text-right">{t('salaryComponents.form.valueType')}</Label>
              <Select
                value={formData.value_type}
                onValueChange={(value: 'currency' | 'number' | 'percentage') =>
                  setFormData((prev) => ({ ...prev, value_type: value }))
                }
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="currency">
                    {t('salaryComponents.valueTypes.currency')}
                  </SelectItem>
                  <SelectItem value="number">{t('salaryComponents.valueTypes.number')}</SelectItem>
                  <SelectItem value="percentage">
                    {t('salaryComponents.valueTypes.percentage')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-[150px_1fr] items-start gap-4">
              <Label className="text-right pt-2">{t('salaryComponents.form.formula')}</Label>
              <FormulaInput
                value={formData.formula || ''}
                onChange={(value) => setFormData((prev) => ({ ...prev, formula: value }))}
                availableComponents={formulaAvailableComponents}
                placeholder={t('salaryComponents.form.formulaPlaceholder')}
              />
            </div>

            <div className="grid grid-cols-[150px_1fr] items-start gap-4">
              <Label className="text-right pt-2">
                {t('salaryComponents.form.description')}
              </Label>
              <Input
                value={formData.description || ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder={t('salaryComponents.form.descriptionPlaceholder')}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              {t('salaryComponents.dialogs.cancel')}
            </Button>
            <Button onClick={handleSaveEdit} disabled={isSubmitting}>
              {isSubmitting
                ? t('salaryComponents.dialogs.saving')
                : t('salaryComponents.dialogs.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md" data-testid="pay-salary-component-delete-dialog-precision">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive text-[20px] font-bold font-display">
              <AlertCircle className="w-5 h-5" />
              {t('salaryComponents.dialogs.deleteTitle')}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4">
              <p className="text-sm text-destructive">
                {t('salaryComponents.dialogs.deleteWarning')}
              </p>
            </div>
            {componentToDelete && (
              <div className="space-y-2 bg-muted/50 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <span className="text-sm text-muted-foreground w-32 shrink-0">
                    {t('salaryComponents.form.code')}:
                  </span>
                  <code className="text-sm font-medium text-primary">
                    {componentToDelete.code}
                  </code>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-sm text-muted-foreground w-32 shrink-0">
                    {t('salaryComponents.form.name')}:
                  </span>
                  <span className="text-sm font-medium">{componentToDelete.name}</span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              {t('salaryComponents.dialogs.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isSubmitting}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isSubmitting
                ? t('salaryComponents.dialogs.deleting')
                : t('salaryComponents.dialogs.confirmDelete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
