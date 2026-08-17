/**
 * @CODE-MEMORY
 * Screen:     EmployeeProfile → BH / tài chính (E17)
 * WorkItem:   PO-HRM-UI-BRAND-W3-EMP-B
 * Purpose:    Precision Motion remaster — sharp ops chrome.
 * must_keep:  SoftDel; no Nest/seed; no OCR/QR invent; stub honesty
 * ADR:        docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md §8–§10
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W3-EMP-B
 * change_mode: UPGRADE
 * What: Labels/empty → text-xevn-textSecondary; purple AI chrome → xevn primary/accent
 * Why: ADR-20260805 §8–§10 · inventory W3-EMP-B
 * must_keep: SoftDel; navigate employees/:id; stub honesty; no Nest/seed; no OCR/QR invent
 * ADR: docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-E2E-LINK-EMP-FE-01
 * change_mode: ADD
 * What: Wire InsuranceTimelineActionsPanel (close|stop|suspend|change_rate|resume); periods[]; status expand
 * Why: AC-SI-TL-01..05 · F-CORE-SI-03 · EMP-SPEC-01 §D.5 · DB-01 action map
 * must_keep: No FE payroll formulas; display-ready only; U65; CRUD insurance preserve
 *
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-E2E-LINK-EMP-FE-03
 * change_mode: FIX
 * What: hdsd-insurance-enrollments-root; row enrollment_id; always mount timeline panel when rows exist
 * Why: R-EMP-SI-FE-ACTION-UI — QA R2 timelineRoot=false when enrollments exist but tab/list unbound
 * must_keep: SoftDel CRUD; D2 WH / D6 HTP / FE-02 QSĐ; no invent amounts; U65
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-UAT-EMP-SOFT-OBS-FE-01
 * change_mode: FIX
 * What: Card start/end dates via formatInsurancePeriodDateVi (dd/MM/yyyy)
 * Why: OBS-SI-DATE-ISO — SI card raw ISO leak
 * must_keep: timeline panel D5 company_id; SoftDel; U65
 *
 * @CODE-MEMORY-CHANGE 2026-08-08 PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-FE-01
 * change_mode: FIX
 * What: enrollment type CatalogSearchPicker binds Nest F-SI-CAT-EFF; empty CTA Settings Loại BH
 * Why: AC-PLT-SI-INS-ENR · VAL-SI-CNS-02/04 — cấm hardcode social|health|… SoT khi EFF live
 * must_keep: timeline F-CORE-SI-03 · SoftDel · enrollment ONE SoT · U65 · printable/personnel false
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-CORE-02-CLUSTER-FE-01
 * change_mode: UPGRADE
 * What: Edit enrollment amount delta → actions change_rate via hook (not silent PATCH contrib)
 * Why: API-01 SI PATCH fail-closed · AC-CORE-02-07 · O1 employee-insurances*
 * must_keep: timeline panel · SoftDel · Nest /core DENY · U65 · honesty false · CORE-01≠C&B DONE
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-CORE-10-CLUSTER-FE-01
 * change_mode: UPGRADE
 * What: statusLabelVi bind · honesty footer catalog/CRUD/LIVE≠DONE · BH≠CORE-07 · printable false
 * Why: API-01 CONFIRMED RETAIN · UC-BP-CORE-10 · R-CORE-10-DISP FE-derive · O6–O10
 * must_keep: timeline F-CORE-SI-03 · SoftDel · Nest /core DENY · CORE-09/07 seals · soft≠CORE-06 DONE · U65
 */
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ViMoneyInput } from '@/components/ui/ViMoneyInput';
import { ViDateField } from '@/components/ui/ViDateField';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { formatInsurancePeriodDateVi } from '@/lib/insuranceTimelineActions';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, MoreHorizontal, Pencil, Trash2, Shield, Heart, Umbrella, Gift, Building, Calendar, DollarSign, PackageOpen } from 'lucide-react';
import { useEmployeeInsurance, InsuranceItem, BenefitItem, InsuranceFormData, BenefitFormData } from '@/hooks/useEmployeeInsurance';
import { useSiInsuranceTypesEffective } from '@/hooks/useSiInsuranceTypesEffective';
import { CatalogSearchPicker } from '@/components/common/CatalogSearchPicker';
import { isCatalogPickerValueAllowed } from '@/lib/catalogSearchPicker';
import { hrmPathWithEmbedSearch } from '@/lib/hrmEmbedNavigation';
import { InsuranceTimelineActionsPanel } from '@/components/employee/InsuranceTimelineActionsPanel';
import { HDSD_MUTATE_TEST_IDS } from '@/lib/hdsdMutateTestIds';
import {
  core10HonestyBannerText,
  resolveInsuranceStatusLabelVi,
} from '@/lib/empCoreSiRing';

const insuranceTypeIcons: Record<string, React.ReactNode> = {
  social: <Shield className="h-5 w-5" />,
  health: <Heart className="h-5 w-5" />,
  unemployment: <Umbrella className="h-5 w-5" />,
  accident: <Shield className="h-5 w-5" />,
  life: <Heart className="h-5 w-5" />,
};

interface EmployeeInsuranceProps {
  employeeId?: string;
}

export const EmployeeInsurance = ({ employeeId: propEmployeeId }: EmployeeInsuranceProps) => {
  const { t } = useTranslation();
  const { id: paramEmployeeId } = useParams();
  const employeeId = propEmployeeId || paramEmployeeId;
  const {
    insurances,
    benefits,
    isLoading,
    createInsurance,
    updateInsurance,
    deleteInsurance,
    createBenefit,
    updateBenefit,
    deleteBenefit,
    refetch,
    fetchError,
  } = useEmployeeInsurance(employeeId);

  const [insuranceDialogOpen, setInsuranceDialogOpen] = useState(false);
  const [benefitDialogOpen, setBenefitDialogOpen] = useState(false);
  const [editingInsurance, setEditingInsurance] = useState<InsuranceItem | null>(null);
  const [editingBenefit, setEditingBenefit] = useState<BenefitItem | null>(null);

  const [insuranceForm, setInsuranceForm] = useState<InsuranceFormData>({
    type: '',
    provider: '',
    policy_number: '',
    start_date: '',
    end_date: '',
    contribution: 0,
    employer_contribution: 0,
    status: 'active',
    notes: '',
  });

  const [benefitForm, setBenefitForm] = useState<BenefitFormData>({
    name: '',
    category: 'allowance',
    value: 0,
    unit: 'VNĐ',
    frequency: 'monthly',
    start_date: '',
    end_date: '',
    status: 'active',
    description: '',
  });

  const {
    insuranceTypeOptions,
    isLoading: insuranceTypesLoading,
    insuranceTypeDisplayLabel,
  } = useSiInsuranceTypesEffective({
    enabled: true,
    historyKey: editingInsurance?.type ?? null,
  });
  const siTypeSettingsCta = hrmPathWithEmbedSearch('/settings?tab=si-insurance-types');

  const getInsuranceTypeLabel = (type: string) => {
    const fromEff = insuranceTypeDisplayLabel(type);
    if (fromEff && fromEff !== '—') return fromEff;
    return t(`ei.insTypes.${type}`, type);
  };
  /** R-CORE-10-DISP / O3 — prefer FE-derive statusLabelVi; BH Hoạt động ≠ CORE-07 activate. */
  const getInsuranceStatusLabel = (insurance: InsuranceItem) =>
    resolveInsuranceStatusLabelVi(insurance.status, insurance.statusLabelVi);
  const getBenefitCategoryLabel = (cat: string) => t(`ei.benCategories.${cat}`, cat);
  const getBenefitFrequencyLabel = (freq: string) =>
    t(`ei.benFrequencies.${freq === 'one-time' ? 'oneTime' : freq}`, freq);
  const getBenefitStatusLabel = (status: string) => t(`ei.benStatuses.${status}`, status);

  const handleOpenInsuranceDialog = (insurance?: InsuranceItem) => {
    if (insurance) {
      setEditingInsurance(insurance);
      setInsuranceForm({
        type: insurance.type,
        provider: insurance.provider,
        policy_number: insurance.policy_number || '',
        start_date: insurance.start_date || '',
        end_date: insurance.end_date || '',
        contribution: insurance.contribution,
        employer_contribution: insurance.employer_contribution,
        status: insurance.status,
        notes: insurance.notes || '',
      });
    } else {
      setEditingInsurance(null);
      setInsuranceForm({
        type: '',
        provider: '',
        policy_number: '',
        start_date: '',
        end_date: '',
        contribution: 0,
        employer_contribution: 0,
        status: 'active',
        notes: '',
      });
    }
    setInsuranceDialogOpen(true);
  };

  const handleOpenBenefitDialog = (benefit?: BenefitItem) => {
    if (benefit) {
      setEditingBenefit(benefit);
      setBenefitForm({ name: benefit.name, category: benefit.category, value: benefit.value, unit: benefit.unit, frequency: benefit.frequency, start_date: benefit.start_date || '', end_date: benefit.end_date || '', status: benefit.status, description: benefit.description || '' });
    } else {
      setEditingBenefit(null);
      setBenefitForm({ name: '', category: 'allowance', value: 0, unit: 'VNĐ', frequency: 'monthly', start_date: '', end_date: '', status: 'active', description: '' });
    }
    setBenefitDialogOpen(true);
  };

  const handleSaveInsurance = async () => {
    if (
      !isCatalogPickerValueAllowed(insuranceTypeOptions, insuranceForm.type, { allowEmpty: false })
    ) {
      return;
    }
    if (editingInsurance) {
      await updateInsurance(editingInsurance.id, insuranceForm);
    } else {
      await createInsurance(insuranceForm);
    }
    setInsuranceDialogOpen(false);
  };

  const handleSaveBenefit = async () => {
    if (editingBenefit) {
      await updateBenefit(editingBenefit.id, benefitForm);
    } else {
      await createBenefit(benefitForm);
    }
    setBenefitDialogOpen(false);
  };

  const handleDeleteInsurance = async (id: string) => { await deleteInsurance(id); };
  const handleDeleteBenefit = async (id: string) => { await deleteBenefit(id); };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const totalInsuranceContribution = insurances.reduce((sum, i) => sum + i.contribution, 0);
  const totalEmployerContribution = insurances.reduce((sum, i) => sum + i.employer_contribution, 0);
  const totalMonthlyBenefits = benefits
    .filter(b => b.status === 'active' && b.frequency === 'monthly' && b.unit === 'VNĐ')
    .reduce((sum, b) => sum + b.value, 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}><CardContent className="pt-6"><Skeleton className="h-12 w-full" /></CardContent></Card>
          ))}
        </div>
        <Card>
          <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (<Skeleton key={i} className="h-24 w-full" />))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const insStatuses = ['active', 'pending', 'expired', 'suspended', 'stopped', 'closed'] as const;
  const benCategories = ['allowance', 'bonus', 'leave', 'health', 'education', 'other'] as const;
  const benFrequencies = ['monthly', 'quarterly', 'yearly', 'one-time'] as const;
  const benStatuses = ['active', 'inactive'] as const;

  return (
    <div className="space-y-6" data-testid={HDSD_MUTATE_TEST_IDS.insuranceEnrollmentsRoot}>
      {fetchError ? (
        <p className="text-sm text-destructive" role="alert" data-testid="hdsd-insurance-fetch-error">
          {fetchError}
        </p>
      ) : null}
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-xevn-primary/10 dark:bg-xevn-primary/20">
                <Shield className="h-5 w-5 text-xevn-primary" />
              </div>
              <div>
                <p className="text-sm text-xevn-textSecondary">{t('ei.employeeContrib')}</p>
                <p className="text-xl font-bold">{formatCurrency(totalInsuranceContribution)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-xevn-success/15 dark:bg-xevn-success/25">
                <Building className="h-5 w-5 text-xevn-success" />
              </div>
              <div>
                <p className="text-sm text-xevn-textSecondary">{t('ei.employerContrib')}</p>
                <p className="text-xl font-bold">{formatCurrency(totalEmployerContribution)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-xevn-accent/15 dark:bg-xevn-accent/25">
                <Gift className="h-5 w-5 text-xevn-primary dark:text-xevn-accent" />
              </div>
              <div>
                <p className="text-sm text-xevn-textSecondary">{t('ei.monthlyBenefits')}</p>
                <p className="text-xl font-bold">{formatCurrency(totalMonthlyBenefits)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-xevn-warning/15 dark:bg-xevn-warning/25">
                <DollarSign className="h-5 w-5 text-xevn-warning" />
              </div>
              <div>
                <p className="text-sm text-xevn-textSecondary">{t('ei.totalBenefits')}</p>
                <p className="text-xl font-bold">{t('ei.benefitCount', { count: benefits.filter(b => b.status === 'active').length })}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insurance Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {t('ei.insuranceTitle')}
          </CardTitle>
          <Button size="sm" onClick={() => handleOpenInsuranceDialog()}>
            <Plus className="h-4 w-4 mr-1" />
            {t('ei.addInsurance')}
          </Button>
        </CardHeader>
        <CardContent>
          {insurances.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-xevn-textSecondary">
              <PackageOpen className="h-12 w-12 mb-2" />
              <p>{t('ei.noInsurance')}</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={() => handleOpenInsuranceDialog()}>
                <Plus className="h-4 w-4 mr-1" />
                {t('ei.addInsurance')}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {insurances.map((insurance) => (
                <div
                  key={insurance.enrollment_id}
                  className="flex items-start justify-between p-4 border rounded-lg"
                  data-testid={`hdsd-insurance-enrollment-row-${insurance.enrollment_id}`}
                  data-enrollment-id={insurance.enrollment_id}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${
                      insurance.type === 'social' ? 'bg-xevn-primary/10 dark:bg-xevn-primary/20 text-xevn-primary' :
                      insurance.type === 'health' ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400' :
                      insurance.type === 'unemployment' ? 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300' :
                      insurance.type === 'accident' ? 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400' :
                      'bg-xevn-accent/15 dark:bg-xevn-accent/25 text-xevn-primary dark:text-xevn-accent'
                    }`}>
                      {insuranceTypeIcons[insurance.type] ?? <Shield className="h-5 w-5" />}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{getInsuranceTypeLabel(insurance.type)}</h4>
                        <Badge variant={insurance.status === 'active' ? 'default' : insurance.status === 'pending' ? 'secondary' : 'destructive'}>
                          {getInsuranceStatusLabel(insurance)}
                        </Badge>
                      </div>
                      <p className="text-sm text-xevn-textSecondary">{insurance.provider}</p>
                      {insurance.policy_number && (
                        <p className="text-sm">{t('ei.cardNumber')}: <span className="font-medium">{insurance.policy_number}</span></p>
                      )}
                      <div className="flex gap-4 text-sm">
                        <span>{t('ei.employeePayLabel')}: <span className="font-medium text-primary">{formatCurrency(insurance.contribution)}</span></span>
                        <span>{t('ei.companyPayLabel')}: <span className="font-medium text-green-600">{formatCurrency(insurance.employer_contribution)}</span></span>
                      </div>
                      {(insurance.start_date || insurance.end_date) && (
                        <p className="text-sm text-xevn-textSecondary">
                          <Calendar className="h-3 w-3 inline mr-1" />
                          {formatInsurancePeriodDateVi(insurance.start_date)} -{' '}
                          {formatInsurancePeriodDateVi(insurance.end_date)}
                        </p>
                      )}
                      {insurance.notes && (
                        <p className="text-sm text-xevn-textSecondary italic">{insurance.notes}</p>
                      )}
                      <InsuranceTimelineActionsPanel
                        insurance={insurance}
                        onActionComplete={() => refetch()}
                      />
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenInsuranceDialog(insurance)}>
                        <Pencil className="h-4 w-4 mr-2" />{t('ei.edit')}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteInsurance(insurance.id)}>
                        <Trash2 className="h-4 w-4 mr-2" />{t('ei.delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
          <p
            className="mt-3 text-[11px] leading-snug text-xevn-textSecondary"
            data-testid="si-core10-honesty"
          >
            {core10HonestyBannerText()}
          </p>
        </CardContent>
      </Card>

      {/* Benefits Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            {t('ei.benefitsTitle')}
          </CardTitle>
          <Button size="sm" onClick={() => handleOpenBenefitDialog()}>
            <Plus className="h-4 w-4 mr-1" />
            {t('ei.addBenefit')}
          </Button>
        </CardHeader>
        <CardContent>
          {benefits.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-xevn-textSecondary">
              <PackageOpen className="h-12 w-12 mb-2" />
              <p>{t('ei.noBenefits')}</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={() => handleOpenBenefitDialog()}>
                <Plus className="h-4 w-4 mr-1" />
                {t('ei.addBenefit')}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {benefits.map((benefit) => (
                <div key={benefit.id} className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{benefit.name}</h4>
                      <Badge variant={benefit.status === 'active' ? 'default' : 'secondary'}>
                        {getBenefitStatusLabel(benefit.status)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{getBenefitCategoryLabel(benefit.category)}</Badge>
                      <Badge variant="outline">{getBenefitFrequencyLabel(benefit.frequency)}</Badge>
                    </div>
                    <p className="text-lg font-bold text-primary">
                      {benefit.unit === 'VNĐ' || benefit.unit === 'VNĐ/năm' ? formatCurrency(benefit.value) : `${benefit.value} ${benefit.unit}`}
                    </p>
                    {benefit.description && (
                      <p className="text-sm text-xevn-textSecondary">{benefit.description}</p>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenBenefitDialog(benefit)}>
                        <Pencil className="h-4 w-4 mr-2" />{t('ei.edit')}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteBenefit(benefit.id)}>
                        <Trash2 className="h-4 w-4 mr-2" />{t('ei.delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Insurance Dialog */}
      <Dialog open={insuranceDialogOpen} onOpenChange={setInsuranceDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingInsurance ? t('ei.editInsurance') : t('ei.addNewInsurance')}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('ei.insuranceType')}</Label>
                <CatalogSearchPicker
                  options={insuranceTypeOptions}
                  value={insuranceForm.type}
                  onValueChange={(v) => setInsuranceForm({ ...insuranceForm, type: v })}
                  loading={insuranceTypesLoading}
                  placeholder="Chọn loại BH…"
                  emptyHint={
                    <a
                      href={siTypeSettingsCta}
                      className="text-primary underline text-xs font-medium"
                      data-testid="hdsd-enrollment-open-si-insurance-types"
                    >
                      Mở Cài đặt → Loại BH / SI type (tạo mã mới)
                    </a>
                  }
                  aria-label={t('ei.insuranceType')}
                  data-testid="hdsd-enrollment-insurance-type-picker"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('ei.status')}</Label>
                <Select value={insuranceForm.status} onValueChange={(v) => setInsuranceForm({ ...insuranceForm, status: v as InsuranceFormData['status'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {insStatuses.map(s => (
                      <SelectItem key={s} value={s}>{getInsuranceStatusLabel(s)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('ei.provider')}</Label>
              <Input value={insuranceForm.provider} onChange={(e) => setInsuranceForm({ ...insuranceForm, provider: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>{t('ei.policyNumber')}</Label>
              <Input value={insuranceForm.policy_number} onChange={(e) => setInsuranceForm({ ...insuranceForm, policy_number: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('ei.startDate')}</Label>
                <ViDateField value={insuranceForm.start_date} onValueChange={(v) => setInsuranceForm({ ...insuranceForm, start_date: v })} />
              </div>
              <div className="space-y-2">
                <Label>{t('ei.endDate')}</Label>
                <ViDateField value={insuranceForm.end_date} onValueChange={(v) => setInsuranceForm({ ...insuranceForm, end_date: v })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('ei.employeeContribLabel')}</Label>
                <ViMoneyInput
                  value={Number(insuranceForm.contribution) || 0}
                  onValueChange={(n) => setInsuranceForm({ ...insuranceForm, contribution: n })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('ei.employerContribLabel')}</Label>
                <ViMoneyInput
                  value={Number(insuranceForm.employer_contribution) || 0}
                  onValueChange={(n) =>
                    setInsuranceForm({ ...insuranceForm, employer_contribution: n })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('ei.notes')}</Label>
              <Textarea value={insuranceForm.notes} onChange={(e) => setInsuranceForm({ ...insuranceForm, notes: e.target.value })} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInsuranceDialogOpen(false)}>{t('ei.cancel')}</Button>
            <Button
              onClick={handleSaveInsurance}
              disabled={
                insuranceTypeOptions.length === 0 ||
                !isCatalogPickerValueAllowed(insuranceTypeOptions, insuranceForm.type, {
                  allowEmpty: false,
                })
              }
            >
              {t('ei.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Benefit Dialog */}
      <Dialog open={benefitDialogOpen} onOpenChange={setBenefitDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingBenefit ? t('ei.editBenefit') : t('ei.addNewBenefit')}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>{t('ei.benefitName')}</Label>
              <Input value={benefitForm.name} onChange={(e) => setBenefitForm({ ...benefitForm, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('ei.category')}</Label>
                <Select value={benefitForm.category} onValueChange={(v) => setBenefitForm({ ...benefitForm, category: v as BenefitFormData['category'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {benCategories.map(cat => (
                      <SelectItem key={cat} value={cat}>{getBenefitCategoryLabel(cat)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('ei.frequency')}</Label>
                <Select value={benefitForm.frequency} onValueChange={(v) => setBenefitForm({ ...benefitForm, frequency: v as BenefitFormData['frequency'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {benFrequencies.map(freq => (
                      <SelectItem key={freq} value={freq}>{getBenefitFrequencyLabel(freq)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('ei.value')}</Label>
                <ViMoneyInput
                  value={Number(benefitForm.value) || 0}
                  onValueChange={(n) => setBenefitForm({ ...benefitForm, value: n })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('ei.unit')}</Label>
                <Input value={benefitForm.unit} onChange={(e) => setBenefitForm({ ...benefitForm, unit: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('ei.startDate')}</Label>
                <ViDateField value={benefitForm.start_date} onValueChange={(v) => setBenefitForm({ ...benefitForm, start_date: v })} />
              </div>
              <div className="space-y-2">
                <Label>{t('ei.status')}</Label>
                <Select value={benefitForm.status} onValueChange={(v) => setBenefitForm({ ...benefitForm, status: v as BenefitFormData['status'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {benStatuses.map(s => (
                      <SelectItem key={s} value={s}>{getBenefitStatusLabel(s)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('ei.description')}</Label>
              <Textarea value={benefitForm.description} onChange={(e) => setBenefitForm({ ...benefitForm, description: e.target.value })} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBenefitDialogOpen(false)}>{t('ei.cancel')}</Button>
            <Button onClick={handleSaveBenefit}>{t('ei.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
