/**
 * @CODE-MEMORY
 * Screen:     EmployeeProfile → Quá trình công tác (Work Timeline)
 * UC:         UC-HRM-21 · FR-HRM-MD-BIND-E1A-01 · AC-E1A-WH-01
 * BR:         BR-HRM-MD-E1A-01 — persist position_key / department_key; U72 label
 * SRS:        docs/program/deltas/BA_ERP_E1A_SRS_01_20260728.md §0.1 A1/A2
 * TechSpec:   docs/hrm/API_DESIGN_HRM_MD_BIND_E1A.md WH-C/WH-U · DB_DESIGN_HRM_MD_BIND_E1A
 * Purpose:    Tạo/sửa sự kiện lịch sử công tác; Vị trí + Phòng ban = CatalogSearchPicker;
 *             Network body gửi *_key + snapshot label (cấm free-text SoT).
 * WorkItem:   D-FE-ERP-E1A-PICKER-01
 * Coded:      2026-07-28
 * Callers:    EmployeeProfile.tsx tab work timeline
 * Callees:    create/update/listEmployeeWorkTimeline · useSettingsCatalogsOverview · CatalogSearchPicker
 * FEActions:  Thêm/Sửa → chọn vị trí/dept catalog → Lưu (POST/PATCH position_key)
 * BEChain:    POST/PATCH /api/hrm/employees/:id/work-timeline → assertCodeInEffectiveCatalog
 * Impact:     Free-text position → FAIL AC-E1A-WH-01; raw key trên UI → FAIL U72
 * must_keep:  EmployeeFormDialog JT/dept; LeaveTab; JobTemplates; U65 no seed; HOLD_DEPLOY
 * SOLID:      UI tab; catalog helpers pure ở catalogSearchPicker
 * LastVerified: docs/qa/evidence/d-fe-erp-e1a-picker-01-20260728.md
 *
 * @CODE-MEMORY-CHANGE 2026-07-28 D-FE-ERP-E1A-PICKER-01
 * change_mode: ADD
 * What: CatalogSearchPicker position_key + department_key; Network sends keys; U72 display
 * Why: Layer A MD-BIND — cấm Input free-text Vị trí / Select name-as-value dept
 * SRS/BR: FR-HRM-MD-BIND-E1A-01 · AC-E1A-PICKER-01 · AC-E1A-WIRE-01 · sa-erp-e1a-ack-01
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W3-EMP-A
 * change_mode: UPGRADE
 * What: Sharp secondary text on timeline empty/meta; contract chip cyan (no purple)
 * Why: Embedded on E11 general — ADR §8 pale ban · inventory W3-EMP-A
 * must_keep: CatalogSearchPicker keys; U72 labels; U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-E2E-LINK-EMP-FE-01
 * change_mode: ADD
 * What: Surface decision_id/decision_code/source_module badge; HDSD testids; mapWorkTimelineList
 * Why: AC-DEC-WH-02 F5 neo QSĐ→WH · AC-WH-PICK harness · F-CORE-WH-01 display-ready
 * SRS/TechSpec: EMP-SPEC-01 §D.2/D.3 · EMP-SA-01 F-CORE-WH-01/02 · DB-01 CONFIRMED
 * must_keep: CatalogSearchPicker position_key SoT; no free-text; U65; no C&B on WH
 *
 * @CODE-MEMORY-CHANGE 2026-08-08 PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-POSITION-CATALOG-FE-01-R2
 * change_mode: ADD
 * What: Invent KEY toast HRM-EMP-POSITION-KEY / HRM-WH-PICK-REQUIRED; empty EFF CTA CH06f class
 * Why: SA Option A · R-PLT-EMP-POS-FE-01 · AC-PLT-EMP-01b/01c · peer EMP-STATUS KEY toast
 * must_keep: POSITION KEY · CatalogSearchPicker position_key SoT; Nest emp_position DENY;
 *            EMP-STATUS FE CLOSED · LVRULE HOLD · EMP-CUSTOM · ATT · U65 · personnel=false
 *
 * @CODE-MEMORY-CHANGE 2026-08-08 PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-DEPT-CATALOG-FE-01
 * change_mode: ADD
 * What: Save catch surfaces DEPT invent KEY toast first (HRM-EMP-DEPT-KEY / WH alias HRM-WH-DEPT-KEY)
 *       via empDeptKeyToastFirst → then POSITION KEY; department_key picker SoT retained (Settings EFF).
 * Why: SA Option A · R-PLT-EMP-DEPT-FE-01 · AC-PLT-EMP-DEPT-01b — invent dept → 400 KEY + VI toast · no persist
 * must_keep: DEPT KEY · POSITION KEY · CatalogSearchPicker department_key/position_key SoT;
 *            Nest emp_department DENY · Nest emp_position DENY · EMP-STATUS FE CLOSED · LVRULE HOLD · U65
 *
 * @CODE-MEMORY-CHANGE 2026-08-11 D-FE-HRM-WH-POSITION-PICKER-01
 * change_mode: ADD
 * What: resolveWorkTimelinePositionFromCatalog on save; HDSD workTimelinePositionPicker retained
 * Why: AC-SET-CONSUMER-JT-WH-01 · UF-HRM-10 — job_titles CatalogSearchPicker → position_key Network
 * must_keep: settings_catalog_e2e_ready=false; sealed dept/REC-CH/CTR; att-leave-types SoT; U65
 */

import { useMemo, useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ViDateField } from '@/components/ui/ViDateField';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Plus, Edit, Trash2, Loader2, Briefcase, FileSignature, ArrowUpRight, ArrowLeftRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import {
  createEmployeeWorkTimelineItem,
  deleteEmployeeWorkTimelineItem,
  listEmployeeWorkTimeline,
  updateEmployeeWorkTimelineItem,
} from '@/integrations/hrmApi';
import { toErrorMessage } from '@/lib/apiError';
import {
  HRM_WH_PICK_EMPTY_CATALOG_CODE,
  empPositionKeyToastMessage,
} from '@/lib/empPositionCatalog';
import { empDeptKeyToastFirst } from '@/lib/empDeptCatalog';
import { useSettingsCatalogsOverview } from '@/hooks/useSettingsCatalogsOverview';
import { CatalogSearchPicker } from '@/components/common/CatalogSearchPicker';
import {
  buildDepartmentKeyFields,
  departmentOptionsFromCatalog,
  isCatalogPickerValueAllowed,
  jobTitleOptionsFromCatalog,
  resolveDepartmentLabel,
  resolvePositionDisplayLabel,
  resolveWorkTimelinePositionFromCatalog,
} from '@/lib/catalogSearchPicker';
import {
  isDecisionSourcedWorkTimeline,
  mapWorkTimelineList,
  workTimelineDecisionLabel,
  type WorkTimelineDisplayItem,
} from '@/lib/employeeWorkTimelineUi';
import {
  HDSD_MUTATE_TEST_IDS,
  hdsdWorkTimelineDecisionTestId,
} from '@/lib/hdsdMutateTestIds';
import { Link } from 'react-router-dom';

interface EmployeeWorkTimelineProps {
  employeeId: string;
}

type WorkHistoryItem = WorkTimelineDisplayItem;

const emptyForm = {
  event_date: '',
  title: '',
  description: '',
  event_type: 'position',
  status: 'current',
  contract_code: '',
  department_key: '',
  position_key: '',
  notes: '',
};

const getEventTypeConfig = (t: (k: string) => string) => ({
  position: { label: t('workTimeline.eventTypes.position'), icon: Briefcase, color: 'bg-blue-500' },
  promotion: { label: t('workTimeline.eventTypes.promotion'), icon: ArrowUpRight, color: 'bg-green-500' },
  transfer: { label: t('workTimeline.eventTypes.transfer'), icon: ArrowLeftRight, color: 'bg-orange-500' },
  contract: { label: t('workTimeline.eventTypes.contract'), icon: FileSignature, color: 'bg-cyan-600' },
});

const getStatusConfig = (t: (k: string) => string) => ({
  completed: { label: t('workTimeline.statuses.completed'), color: 'bg-green-500', badgeClass: 'bg-green-100 text-green-700' },
  current: { label: t('workTimeline.statuses.current'), color: 'bg-orange-500', badgeClass: 'bg-orange-100 text-orange-700' },
  pending: { label: t('workTimeline.statuses.pending'), color: 'bg-gray-300', badgeClass: 'bg-gray-100 text-gray-700' },
});

const settingsCatalogCta = (
  <span
    data-hrm-empty-catalog={HRM_WH_PICK_EMPTY_CATALOG_CODE}
    className="text-xs text-muted-foreground space-y-1 block"
  >
    <span className="block">
      Danh mục chức danh/phòng ban trống — cấu hình trong Cài đặt (CH06f). Không nhập tự do · không seed.
    </span>
    <a href="/settings" className="text-primary underline text-xs font-medium">
      Mở Cài đặt → Danh mục nghiệp vụ
    </a>
  </span>
);

export function EmployeeWorkTimeline({ employeeId }: EmployeeWorkTimelineProps) {
  const { currentCompanyId } = useAuth();
  const { t } = useTranslation();
  const eventTypeConfig = getEventTypeConfig(t);
  const statusConfig = getStatusConfig(t);
  const [items, setItems] = useState<WorkHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WorkHistoryItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  const {
    catalogs,
    isLoading: catalogsLoading,
    isError: catalogsError,
  } = useSettingsCatalogsOverview();

  const positionOptions = useMemo(
    () => jobTitleOptionsFromCatalog(catalogs ?? []),
    [catalogs],
  );
  const departmentOptions = useMemo(
    () => departmentOptionsFromCatalog(catalogs ?? []),
    [catalogs],
  );

  useEffect(() => {
    if (employeeId && currentCompanyId) {
      void fetchWorkHistory();
    }
  }, [employeeId, currentCompanyId]);

  const fetchWorkHistory = async () => {
    if (!currentCompanyId) return;
    try {
      const result = await listEmployeeWorkTimeline(employeeId, currentCompanyId);
      setItems(mapWorkTimelineList(result));
    } catch (error) {
      console.error('Error fetching work history:', error);
      toast.error(toErrorMessage(error, t('workTimeline.loadError')));
    } finally {
      setLoading(false);
    }
  };

  const openAddDialog = () => {
    setEditingItem(null);
    setFormData({
      ...emptyForm,
      event_date: new Date().toISOString().split('T')[0],
    });
    setDialogOpen(true);
  };

  const openEditDialog = (item: WorkHistoryItem) => {
    setEditingItem(item);
    setFormData({
      event_date: item.event_date,
      title: item.title,
      description: item.description || '',
      event_type: item.event_type,
      status: item.status,
      contract_code: item.contract_code || '',
      department_key: item.department_key?.trim() || '',
      position_key: item.position_key?.trim() || '',
      notes: item.notes || '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error(t('workTimeline.titleRequired'));
      return;
    }
    if (!formData.event_date) {
      toast.error(t('workTimeline.dateRequired'));
      return;
    }

    const positionFields = resolveWorkTimelinePositionFromCatalog(
      formData.position_key,
      positionOptions,
    );
    if (!positionFields) {
      toast.error('Chọn vị trí từ danh mục (không nhập tự do).');
      return;
    }

    let departmentFields: { department_key: string; department: string } | null = null;
    if (formData.department_key.trim()) {
      departmentFields = buildDepartmentKeyFields(formData.department_key, departmentOptions);
      if (!departmentFields) {
        toast.error('Chọn phòng ban từ danh mục (không dùng tên làm SoT).');
        return;
      }
    }

    const payload: Record<string, unknown> = {
      event_date: formData.event_date,
      title: formData.title.trim(),
      description: formData.description || null,
      event_type: formData.event_type,
      status: formData.status,
      contract_code: formData.contract_code || null,
      notes: formData.notes || null,
      position_key: positionFields.position_key,
      position: positionFields.position,
      ...(departmentFields
        ? {
            department_key: departmentFields.department_key,
            department: departmentFields.department,
          }
        : { department_key: null, department: null }),
    };

    setSaving(true);
    try {
      if (editingItem) {
        await updateEmployeeWorkTimelineItem(employeeId, editingItem.id, currentCompanyId, payload);
        toast.success(t('workTimeline.updateSuccess'));
      } else {
        await createEmployeeWorkTimelineItem(employeeId, currentCompanyId, payload);
        toast.success(t('workTimeline.addSuccess', 'Đã lưu'));
      }
      setDialogOpen(false);
      void fetchWorkHistory();
    } catch (error) {
      console.error('Error saving work history:', error);
      // DEPT invent KEY (HRM-EMP-DEPT-KEY / WH-DEPT) first, then POSITION KEY (peer).
      toast.error(
        empDeptKeyToastFirst(error, t('workTimeline.saveError'), empPositionKeyToastMessage),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('workTimeline.deleteConfirm'))) return;

    try {
      await deleteEmployeeWorkTimelineItem(employeeId, id, currentCompanyId);
      toast.success(t('workTimeline.deleteSuccess'));
      void fetchWorkHistory();
    } catch (error) {
      console.error('Error deleting work history:', error);
      toast.error(t('workTimeline.deleteError'));
    }
  };

  const canSave =
    isCatalogPickerValueAllowed(positionOptions, formData.position_key, { allowEmpty: false }) &&
    (!formData.department_key.trim() ||
      isCatalogPickerValueAllowed(departmentOptions, formData.department_key, { allowEmpty: false }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid={HDSD_MUTATE_TEST_IDS.workTimelineRoot}>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{t('workTimeline.title')}</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog} data-testid={HDSD_MUTATE_TEST_IDS.workTimelineAddBtn}>
              <Plus className="w-4 h-4 mr-2" />
              {t('workTimeline.addNew')}
            </Button>
          </DialogTrigger>
          <DialogContent
            className="max-w-lg"
            data-testid={HDSD_MUTATE_TEST_IDS.workTimelineFormDialog}
          >
            <DialogHeader>
              <DialogTitle>{editingItem ? t('workTimeline.editInfo') : t('workTimeline.addWorkHistory')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('workTimeline.date')} *</Label>
                  <ViDateField
                    value={formData.event_date}
                    onValueChange={(v) => setFormData({ ...formData, event_date: v })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('workTimeline.eventType')}</Label>
                  <Select
                    value={formData.event_type}
                    onValueChange={(value) => setFormData({ ...formData, event_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(eventTypeConfig).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('workTimeline.titleField')} *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder={t('workTimeline.titlePlaceholder')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('workTimeline.department')}</Label>
                  <CatalogSearchPicker
                    options={departmentOptions}
                    value={formData.department_key}
                    onValueChange={(value) => setFormData({ ...formData, department_key: value })}
                    placeholder={t('workTimeline.departmentPlaceholder')}
                    loading={catalogsLoading}
                    errorText={catalogsError ? t('settings.catalogs.loadError') : undefined}
                    emptyHint={settingsCatalogCta}
                    aria-label={t('workTimeline.department')}
                    data-testid={HDSD_MUTATE_TEST_IDS.workTimelineDepartmentPicker}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('workTimeline.position')} *</Label>
                  <CatalogSearchPicker
                    options={positionOptions}
                    value={formData.position_key}
                    onValueChange={(value) => setFormData({ ...formData, position_key: value })}
                    placeholder={t('workTimeline.positionPlaceholder')}
                    loading={catalogsLoading}
                    errorText={catalogsError ? t('settings.catalogs.loadError') : undefined}
                    emptyHint={settingsCatalogCta}
                    aria-label={t('workTimeline.position')}
                    data-testid={HDSD_MUTATE_TEST_IDS.workTimelinePositionPicker}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('workTimeline.contractCode')}</Label>
                  <Input
                    value={formData.contract_code}
                    onChange={(e) => setFormData({ ...formData, contract_code: e.target.value })}
                    placeholder={t('workTimeline.contractCodePlaceholder')}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('workTimeline.statusField')}</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusConfig).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('workTimeline.description')}</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t('workTimeline.descriptionPlaceholder')}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>{t('workTimeline.notes')}</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder={t('workTimeline.notesPlaceholder')}
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  {t('workTimeline.cancel')}
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving || !canSave}
                  data-testid={HDSD_MUTATE_TEST_IDS.workTimelineSubmit}
                >
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingItem ? t('workTimeline.update') : t('workTimeline.addNew')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Briefcase className="mb-4 h-12 w-12 text-xevn-textMuted" />
            <p className="text-xevn-textSecondary">{t('workTimeline.noData')}</p>
            <Button variant="outline" className="mt-4" onClick={openAddDialog}>
              <Plus className="w-4 h-4 mr-2" />
              {t('workTimeline.addWorkHistory')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-xevn-text">{t('workTimeline.workProcess')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {items.map((item, index) => {
                const eventConfig = eventTypeConfig[item.event_type as keyof typeof eventTypeConfig] || eventTypeConfig.position;
                const statusConf = statusConfig[item.status as keyof typeof statusConfig] || statusConfig.current;
                const IconComponent = eventConfig.icon;
                const positionLabel = resolvePositionDisplayLabel(
                  positionOptions,
                  item.position_key,
                  item.position,
                );
                const departmentLabel = item.department_key
                  ? resolveDepartmentLabel(departmentOptions, item.department_key)
                  : item.department?.trim() || '—';
                const deptShow = departmentLabel !== '—' ? departmentLabel : null;
                const posShow = positionLabel !== '—' ? positionLabel : null;

                return (
                  <div key={item.id} className="flex gap-4 pb-6 last:pb-0 group">
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white',
                        eventConfig.color
                      )}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      {index < items.length - 1 && (
                        <div className="w-0.5 flex-1 bg-border mt-2" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="mb-1 text-xs text-xevn-textSecondary">
                            {format(new Date(item.event_date), 'dd/MM/yyyy')}
                          </p>
                          <p className="text-sm font-medium text-xevn-text">{item.title}</p>
                          {item.description && (
                            <p className="mt-1 line-clamp-2 text-xs text-xevn-textSecondary">
                              {item.description}
                            </p>
                          )}
                          {(deptShow || posShow) && (
                            <p className="mt-1 text-xs text-xevn-textSecondary">
                              {[deptShow, posShow].filter(Boolean).join(' - ')}
                            </p>
                          )}
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {eventConfig.label}
                            </Badge>
                            <Badge className={cn('text-xs', statusConf.badgeClass)}>
                              {statusConf.label}
                            </Badge>
                            {item.contract_code && (
                              <span className="text-xs text-xevn-textSecondary">{item.contract_code}</span>
                            )}
                            {isDecisionSourcedWorkTimeline(item) && (
                              <Badge
                                variant="secondary"
                                className="text-xs"
                                data-testid={hdsdWorkTimelineDecisionTestId(item.id)}
                                data-decision-id={item.decision_id ?? undefined}
                                data-source-module={item.source_module ?? 'decision'}
                              >
                                {item.decision_id ? (
                                  <Link
                                    to={`/decisions`}
                                    className="hover:underline"
                                    title={item.decision_id}
                                  >
                                    {workTimelineDecisionLabel(item)}
                                  </Link>
                                ) : (
                                  workTimelineDecisionLabel(item)
                                )}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(item)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => void handleDelete(item.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
