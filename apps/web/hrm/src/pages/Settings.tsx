/**
 * @CODE-MEMORY-CHANGE 2026-08-09
 * WorkItem: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-OT-FE-ADMIN-BUILD-FE-01
 * change_mode: ADD
 * What: Tabs «Mã chấm công / Loại OT / Loại chi trả OT» → Att*SettingsPanel (F-ATT-CAT-CODE/OT/OTC)
 * Why: Sponsor unlock R-PLT-ATT-FE-ADMIN-01 ABSENT twin · Nest KEY LIVE L1 RETAIN
 * must_keep: attendance_uat_ready=false · consumer EFF CLOSED · LVRULE HOLD · U65 · C-SLICE≠module
 *
 * @CODE-MEMORY-CHANGE 2026-08-09
 * WorkItem: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-FE-ADMIN-BUILD-FE-01
 * change_mode: ADD
 * What: Tab «Trạng thái NV EMP» → EmpEmploymentStatusSettingsPanel (F-EMP-CAT-ST/STR)
 * Why: Sponsor UNLOCK R-PLT-EMP-ST-FE-ADMIN ABSENT twin · L1 EMPSTQA-MSK20G7H RETAIN
 * must_keep: Nest KEY sealed · no dual writer · pos/dept Nest DENY · honesty false · C-SLICE · U65
 *
 * @CODE-MEMORY-CHANGE 2026-08-08
 * WorkItem: PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-FE-01
 * change_mode: ADD
 * What: Tab «Nhà BH / Insurers» → SiInsurerSettingsPanel (F-SI-CAT-INS/EFF)
 * Why: R-PLT-SI-INR-03 · BA AC-PLT-SI-INSURER-01d · BE READY_FOR_QA
 * must_keep: printable/personnel false · SI type L1 RETAIN · enrollment/CTR seals · U65 · C-SLICE≠module
 *
 * @CODE-MEMORY-CHANGE 2026-08-08
 * WorkItem: PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-FE-01
 * change_mode: ADD
 * What: Tab «Loại BH / SI type» → SiInsuranceTypeSettingsPanel (F-SI-CAT-TYP/EFF)
 * Why: R-PLT-SI-INS-03 · BA AC-PLT-SI-INS-01d · BE READY_FOR_QA
 * must_keep: printable/personnel false · enrollment/CTR seals · insurers OUT · U65 · C-SLICE≠module
 *
 * @CODE-MEMORY-CHANGE 2026-08-07
 * WorkItem: PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-FE-01
 * change_mode: ADD
 * What: Tab «Loại quyết định DEC» → DecDecisionTypeSettingsPanel (F-DEC-CAT-TYP/EFF)
 * Why: QC-01 GWC CONDITION R-PLT-DEC-FE-01 · L1 SEAL DECPLATQA-MSJ1FB3D
 * must_keep: decisions UAT=false · F-CORE-DEC create/approve/WH · EMP/ATT/REC · U65
 *
 * @CODE-MEMORY-CHANGE 2026-08-07
 * WorkItem: PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-FE-01
 * change_mode: ADD
 * What: Tabs «Loại giấy tờ EMP» + «Loại hình thuê EMP» → Emp*SettingsPanel (F-EMP-CAT-DOC/ET)
 * Why: QC-01 GWC CONDITION R-PLT-EMP-FE · L1 SEAL EMPPLATQA-MSIZXHIM
 * must_keep: hrm_personnel_uat_ready=false · AC-PLT-EMP-01 XBOS position · soft-delete · U65
 *
 * @CODE-MEMORY-CHANGE 2026-08-07
 * WorkItem: PO-HRM-SETTINGS-DEFAULTS-FE-01
 * change_mode: ADD
 * What: Tab «Mặc định thuế/BH/PC» → SettingsDefaultsPanel (F-SET-TAX/SI/POS)
 * Why: QC-02 CONDITION FE Settings UF deferred · K6.3
 * must_keep: payroll_e2e_ready=false · existing Settings tabs · U65
 *
 * @CODE-MEMORY-CHANGE 2026-08-07
 * WorkItem: PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-FE-01
 * change_mode: ADD
 * What: Tab «Giai đoạn REC» → RecPipelineStageSettingsPanel (F-REC-CAT-STG)
 * Why: QC-01 GWC CONDITION browser AC-PLT-REC-02..05 · K6.2e
 * must_keep: recruitment_uat_ready=false · JD/IV/YCTD · U65 · existing Settings tabs
 */
import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SettingsNavLayout } from '@/components/settings/SettingsNavLayout';
import {
  resolveEffectiveSettingsTab,
  resolveSettingsTab,
  type SettingsTabId,
} from '@/lib/settingsNavigation';
import {
  normalizeSettingsCatalogTabId,
  readSettingsCatalogFocus,
  readPortalParentSearchParam,
} from '@/lib/settingsCatalogPagination';
import { useTranslation } from 'react-i18next';
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Key,
  Users,
  Save,
  Image,
  DollarSign,
  Layers,
  FileText,
  ScrollText,
  Calculator,
  GitBranch,
  IdCard,
  Briefcase,
  FileSignature,
  UserCheck,
  ClipboardCheck,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { languages } from '@/i18n';
import { BrandingSettings } from '@/components/settings/BrandingSettings';
import { RolesPermissionsTab } from '@/components/settings/RolesPermissionsTab';
import { SubscriptionManagement } from '@/components/settings/SubscriptionManagement';
import { SettingsCatalogsTab } from '@/components/settings/SettingsCatalogsTab';
import { MasterDataSettingsPanel } from '@/components/settings/MasterDataSettingsPanel';
import { JdDynamicSettingsPanel } from '@/components/settings/JdDynamicSettingsPanel';
import { JdMasterLibrarySettingsPanel } from '@/components/settings/JdMasterLibrarySettingsPanel';
import { ContractLegalPrintSettingsPanel } from '@/components/settings/ContractLegalPrintSettingsPanel';
import { MergeTokenSettingsPanel } from '@/components/settings/MergeTokenSettingsPanel';
import { PaySheetTemplateSettingsPanel } from '@/components/settings/PaySheetTemplateSettingsPanel';

import { EmpDocumentTypeSettingsPanel } from '@/components/settings/EmpDocumentTypeSettingsPanel';
import { EmpEmploymentTypeSettingsPanel } from '@/components/settings/EmpEmploymentTypeSettingsPanel';
import { EmpEmploymentStatusSettingsPanel } from '@/components/settings/EmpEmploymentStatusSettingsPanel';
import { DecDecisionTypeSettingsPanel } from '@/components/settings/DecDecisionTypeSettingsPanel';
import { SiInsuranceTypeSettingsPanel } from '@/components/settings/SiInsuranceTypeSettingsPanel';
import { CatalogJobTitlesSettingsPanel } from '@/components/settings/CatalogJobTitlesSettingsPanel';
import { SiInsurerSettingsPanel } from '@/components/settings/SiInsurerSettingsPanel';
import { InsuranceRateSetupScreen } from '@/components/settings/InsuranceRateSetupScreen';
import { RecPipelineStageSettingsPanel } from '@/components/settings/RecPipelineStageSettingsPanel';
import { RecCandidateSourceSettingsPanel } from '@/components/settings/RecCandidateSourceSettingsPanel';
import { RecInterviewTypeSettingsPanel } from '@/components/settings/RecInterviewTypeSettingsPanel';
import { AttLeaveTypeSettingsPanel } from '@/components/settings/AttLeaveTypeSettingsPanel';
import { AttAttendanceCodeSettingsPanel } from '@/components/settings/AttAttendanceCodeSettingsPanel';
import { SettingsDefaultsPanel } from '@/components/settings/SettingsDefaultsPanel';
import { PaySalaryComponentList } from '@/components/settings/payroll/PaySalaryComponentList';
import { PayFormulaSettingsPanel } from '@/components/settings/payroll/PayFormulaSettingsPanel';

import { PaySalaryGroupSettingsPanel } from '@/components/settings/payroll/PaySalaryGroupSettingsPanel';
import { PayTaxTableSettingsPanel } from '@/components/settings/payroll/PayTaxTableSettingsPanel';
import { PayPaySlipTemplateSettingsPanel } from '@/components/settings/payroll/PayPayslipTemplateSettingsPanel';
import { ContractTypeSettingsPanel } from '@/components/settings/ContractTypeSettingsPanel';
import { ContractTerminationReasonSettingsPanel } from '@/components/settings/ContractTerminationReasonSettingsPanel';
import { WorkflowConfigSettingsPanel } from '@/components/settings/WorkflowConfigSettingsPanel';
import { PolicyPackSetupScreen } from '@/components/payroll/policy-pack/PolicyPackSetupScreen';
import { AttOtTypeSettingsPanel } from '@/components/settings/AttOtTypeSettingsPanel';
import { AttOtCompTypeSettingsPanel } from '@/components/settings/AttOtCompTypeSettingsPanel';
import { AttShiftSettingsPanel } from '@/components/settings/AttShiftSettingsPanel';
import { AttWorkRuleSettingsPanel } from '@/components/settings/AttWorkRuleSettingsPanel';
import { AttScheduleGroupSettingsPanel } from '@/components/settings/AttScheduleGroupSettingsPanel';



const currencies = [
  { code: 'VND', name: 'Việt Nam Đồng', symbol: '₫', flag: '🇻🇳' },
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'LAK', name: 'Lao Kip', symbol: '₭', flag: '🇱🇦' },
  { code: 'MMK', name: 'Myanmar Kyat', symbol: 'K', flag: '🇲🇲' },
];

export default function Settings() {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const settingsTab = useMemo(
    () =>
      resolveEffectiveSettingsTab(
        searchParams.get('tab'),
        readPortalParentSearchParam('tab'),
      ),
    [searchParams],
  );

  useLayoutEffect(() => {
    const iframeTab = searchParams.get('tab')?.trim();
    if (iframeTab) return;
    const parentTab = readPortalParentSearchParam('tab')?.trim();
    if (!parentTab) return;
    const resolved = resolveSettingsTab(parentTab);
    const next = new URLSearchParams(searchParams);
    next.set('tab', resolved);
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const selectSettingsTab = (tab: SettingsTabId) => {
    const next = new URLSearchParams(searchParams);
    const prevTab = next.get('tab');
    next.set('tab', tab);
    if (prevTab && prevTab !== tab) {
      next.delete('focus');
    }
    setSearchParams(next, { replace: true });
  };

  useEffect(() => {
    const tabKey = normalizeSettingsCatalogTabId(settingsTab);
    const iframeFocus = searchParams.get('focus');
    const parentFocus = readPortalParentSearchParam('focus');
    const storeFocus = readSettingsCatalogFocus(tabKey);
    const focus = (iframeFocus || parentFocus || storeFocus)?.trim().toLowerCase();
    if (!focus) return;
    if (iframeFocus?.trim().toLowerCase() === focus) return;
    const next = new URLSearchParams(searchParams);
    next.set('focus', focus);
    setSearchParams(next, { replace: true });
  }, [settingsTab, searchParams, setSearchParams]);
  const [currency, setCurrency] = useState('VND');

  useEffect(() => {
    const savedCurrency = localStorage.getItem('currency');
    if (savedCurrency) {
      setCurrency(savedCurrency);
    }
  }, []);

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('language', code);
  };

  const changeCurrency = (code: string) => {
    setCurrency(code);
    localStorage.setItem('currency', code);
    toast.success(t('common.saved'));
  };

  return (
    <div className="settings-page flex min-h-0 flex-col gap-2 animate-fade-in md:gap-2.5" data-testid="settings-page">
      <PageHeader
        density="compact"
        title={t('settings.title')}
        subtitle={t('settings.subtitle')}
      />

      <SettingsNavLayout activeTab={settingsTab} onSelectTab={selectSettingsTab}>
{/* Account Settings */}
        {settingsTab === 'account' && (
          <Card className="settings-panel-card">
            <CardHeader className="settings-panel-card__header space-y-0.5 p-0">
              <CardTitle className="text-base font-semibold">{t('settings.account')}</CardTitle>
              <CardDescription className="text-xs">{t('settings.accountDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="settings-panel-card__content space-y-3 p-0 pt-0">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                  AD
                </div>
                <div>
                  <Button variant="outline" size="sm">{t('common.upload')}</Button>
                  <p className="mt-1 text-xs text-muted-foreground">
                    JPG, PNG max 2MB
                  </p>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                <div className="space-y-2">
                  <Label>{t('employees.fullName')}</Label>
                  <Input defaultValue="Admin" />
                </div>
                <div className="space-y-2">
                  <Label>{t('employees.email')}</Label>
                  <Input defaultValue="admin@company.vn" type="email" />
                </div>
                <div className="space-y-2">
                  <Label>{t('employees.phone')}</Label>
                  <Input defaultValue="0901234567" />
                </div>
                <div className="space-y-2">
                  <Label>{t('employees.position')}</Label>
                  <Input defaultValue="Admin" readOnly />
                </div>
              </div>
              <div className="flex justify-end border-t border-xevn-border pt-3">
                <Button size="sm">
                  <Save className="mr-2 h-4 w-4" />
                  {t('common.save')}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Branding Settings */}
        {settingsTab === 'branding' && (
          <Card className="settings-panel-card">
            <CardContent className="settings-panel-card__content p-0">
              <BrandingSettings />
            </CardContent>
          </Card>
        )}

        {/* Notification Settings */}
        {settingsTab === 'notifications' && (
          <Card className="settings-panel-card">
            <CardHeader className="settings-panel-card__header space-y-0.5 p-0">
              <CardTitle className="text-base font-semibold">{t('settings.notifications')}</CardTitle>
              <CardDescription className="text-xs">{t('settings.notificationsDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="settings-panel-card__content space-y-3 p-0 pt-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t('settings.emailNotifications')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('settings.emailNotificationsDesc')}
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t('settings.leaveNotifications')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('settings.leaveNotificationsDesc')}
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t('settings.recruitmentNotifications')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('settings.recruitmentNotificationsDesc')}
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t('settings.payrollNotifications')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('settings.payrollNotificationsDesc')}
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t('settings.attendanceNotifications')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('settings.attendanceNotificationsDesc')}
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Security Settings */}
        {settingsTab === 'security' && (
          <div className="space-y-2.5">
          <Card className="settings-panel-card">
            <CardHeader className="settings-panel-card__header space-y-0.5 p-0">
              <CardTitle className="text-base font-semibold">{t('settings.security')}</CardTitle>
              <CardDescription className="text-xs">{t('settings.securityDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="settings-panel-card__content space-y-3 p-0 pt-0">
              <div className="space-y-2">
                <Label>{t('common.currentPassword')}</Label>
                <Input type="password" />
              </div>
              <div className="space-y-2">
                <Label>{t('common.newPassword')}</Label>
                <Input type="password" />
              </div>
              <div className="space-y-2">
                <Label>{t('common.confirmPassword')}</Label>
                <Input type="password" />
              </div>
              <Button size="sm">{t('common.save')}</Button>
            </CardContent>
          </Card>

          <Card className="settings-panel-card">
            <CardHeader className="settings-panel-card__header space-y-0.5 p-0">
              <CardTitle className="text-base font-semibold">{t('common.twoFactorAuth')}</CardTitle>
              <CardDescription className="text-xs">{t('settings.securityDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="settings-panel-card__content p-0 pt-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">SMS</p>
                  <p className="text-sm text-muted-foreground">
                    {t('common.smsVerification')}
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
          </div>
        )}

        {/* Role Settings */}
        {settingsTab === 'roles' && (
          <Card className="settings-panel-card">
            <CardContent className="settings-panel-card__content p-0">
              <RolesPermissionsTab />
            </CardContent>
          </Card>
        )}

        {/* System Settings */}
        {settingsTab === 'system' && (
          <Card className="settings-panel-card">
            <CardHeader className="settings-panel-card__header space-y-0.5 p-0">
              <CardTitle className="text-base font-semibold">{t('settings.system')}</CardTitle>
              <CardDescription className="text-xs">{t('settings.systemDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="settings-panel-card__content space-y-3 p-0 pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('settings.language')}</Label>
                  <Select value={i18n.language} onValueChange={changeLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.flag} {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('common.timezone')}</Label>
                  <Select defaultValue="asia-ho-chi-minh">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asia-ho-chi-minh">
                        (UTC+7) Ho Chi Minh
                      </SelectItem>
                      <SelectItem value="asia-bangkok">
                        (UTC+7) Bangkok
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('common.dateFormat')}</Label>
                  <Select defaultValue="dd-mm-yyyy">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dd-mm-yyyy">DD/MM/YYYY</SelectItem>
                      <SelectItem value="mm-dd-yyyy">MM/DD/YYYY</SelectItem>
                      <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    {t('common.currency')}
                  </Label>
                  <Select value={currency} onValueChange={changeCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((curr) => (
                        <SelectItem key={curr.code} value={curr.code}>
                          <span className="flex items-center gap-2">
                            <span>{curr.flag}</span>
                            <span>{curr.code}</span>
                            <span className="text-muted-foreground">({curr.symbol})</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end border-t border-xevn-border pt-3">
                <Button size="sm">
                  <Save className="mr-2 h-4 w-4" />
                  {t('common.save')}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Subscription */}
        {settingsTab === 'subscription' && (
          <Card className="settings-panel-card">
            <CardContent className="settings-panel-card__content p-0">
              <SubscriptionManagement />
            </CardContent>
          </Card>
        )}

        {settingsTab === 'catalogs' && (<div className="space-y-4">
          <SettingsCatalogsTab />
        </div>)}

        {settingsTab === 'master-data' && (<div className="space-y-4">
          <MasterDataSettingsPanel />
        </div>)}

        {settingsTab === 'jd-master-library' && <JdMasterLibrarySettingsPanel />}

        {settingsTab === 'jd-dynamic' && (<div className="space-y-4">
          <JdDynamicSettingsPanel />
        </div>)}

        {settingsTab === 'contract-clauses' && (
          <ContractLegalPrintSettingsPanel view="clauses" />
        )}
        {settingsTab === 'contract-templates' && (
          <ContractLegalPrintSettingsPanel view="templates" />
        )}
        {settingsTab === 'contract-number-config' && (
          <ContractLegalPrintSettingsPanel view="number-config" />
        )}
        {settingsTab === 'contract-library-publish' && (
          <ContractLegalPrintSettingsPanel view="library-publish" />
        )}
        {settingsTab === 'merge-tokens' && <MergeTokenSettingsPanel />}

        {settingsTab === 'pay-sheet-tpl' && <PaySheetTemplateSettingsPanel />}



        {settingsTab === 'att-leave-types' && (<div className="space-y-4">
          <AttLeaveTypeSettingsPanel />
        </div>)}

        {settingsTab === 'att-attendance-codes' && (<div className="space-y-4">
          <AttAttendanceCodeSettingsPanel />
        </div>)}

        {settingsTab === 'emp-document-types' && (<div className="space-y-4">
          <EmpDocumentTypeSettingsPanel />
        </div>)}

        {settingsTab === 'emp-employment-types' && (<div className="space-y-4">
          <EmpEmploymentTypeSettingsPanel />
        </div>)}

        {settingsTab === 'emp-employment-statuses' && (<div className="space-y-4">
          <EmpEmploymentStatusSettingsPanel />
        </div>)}

        {settingsTab === 'dec-decision-types' && (<div className="space-y-4">
          <DecDecisionTypeSettingsPanel />
        </div>)}

        {settingsTab === 'si-insurance-types' && (<div className="space-y-4">
          <SiInsuranceTypeSettingsPanel />
        </div>)}

        {settingsTab === 'si-insurers' && (<div className="space-y-4">
          <SiInsurerSettingsPanel />
        </div>)}

        {settingsTab === 'att-ot-types' && (<div className="space-y-4">
          <AttOtTypeSettingsPanel />
        </div>)}

        {settingsTab === 'att-ot-comp-types' && (<div className="space-y-4">
          <AttOtCompTypeSettingsPanel />
        </div>)}

        {settingsTab === 'att-shifts' && (<div className="space-y-4">
          <AttShiftSettingsPanel />
        </div>)}

        {settingsTab === 'att-work-rules' && (<div className="space-y-4">
          <AttWorkRuleSettingsPanel />
        </div>)}

        {settingsTab === 'att-schedule-groups' && (<div className="space-y-4">
          <AttScheduleGroupSettingsPanel />
        </div>)}

        {settingsTab === 'payroll-insurance-rates' && (
          <InsuranceRateSetupScreen />
        )}

        {settingsTab === 'rec-pipeline-stages' && (<div className="space-y-4">
          <RecPipelineStageSettingsPanel />
        </div>)}

        {settingsTab === 'settings-defaults' && (<div className="space-y-4">
          <SettingsDefaultsPanel />
        </div>)}

        {/* --- Tab catalog-job-titles 2026-08-24 (PO-HRM-SETTINGS-JOB-TITLES-FE-01) --- */}
        {settingsTab === 'catalog-job-titles' && (
          <div className="space-y-4">
            <CatalogJobTitlesSettingsPanel />
          </div>
        )}
        {settingsTab === 'rec-sources' && (
          <div className="space-y-4">
             <RecCandidateSourceSettingsPanel />
          </div>
        )}
        {settingsTab === 'rec-interview-types' && (
          <div className="space-y-4">
             <RecInterviewTypeSettingsPanel />
          </div>
        )}
        {settingsTab === 'rec-rejection-reasons' && (
          <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
            <p className="text-sm font-medium">Tính năng đang được phát triển</p>
            <p className="text-xs">Sẽ có trong bản cập nhật tiếp theo</p>
          </div>
        )}
        {settingsTab === 'rec-positions' && (
          <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
            <p className="text-sm font-medium">Tính năng đang được phát triển</p>
            <p className="text-xs">Sẽ có trong bản cập nhật tiếp theo</p>
          </div>
        )}
        {settingsTab === 'rec-health-requirements' && (
          <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
            <p className="text-sm font-medium">Tính năng đang được phát triển</p>
            <p className="text-xs">Sẽ có trong bản cập nhật tiếp theo</p>
          </div>
        )}
        {settingsTab === 'contract-types' && (
          <ContractTypeSettingsPanel />
        )}
        {settingsTab === 'contract-termination-reasons' && (
          <ContractTerminationReasonSettingsPanel />
        )}

        {settingsTab === 'pay-salary-components' && (
          <PaySalaryComponentList />
        )}
        {settingsTab === 'pay-salary-formulas' && (
          <PayFormulaSettingsPanel />
        )}
        {settingsTab === 'pay-salary-groups' && (
          <PaySalaryGroupSettingsPanel />
        )}
        {settingsTab === 'pay-payslip-tpl' && (
          <PayPaySlipTemplateSettingsPanel />
        )}
        {settingsTab === 'pay-tax-tables' && (
          <PayTaxTableSettingsPanel />
        )}
        {settingsTab === 'workflow-config' && (
          <WorkflowConfigSettingsPanel />
        )}
        {settingsTab === 'pay-policy-packs' && (
          <PolicyPackSetupScreen />
        )}
      </SettingsNavLayout>
    </div>
  );
}
