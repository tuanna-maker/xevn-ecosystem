/**
 * @CODE-MEMORY
 * Screen:     EmployeeProfile → tab Tài sản (E20)
 * UC:         UC-BP-CORE-05 · FR-UC-BP-CORE-05 · E20
 * BR:         BR-BP-AST-01 · BR-CORE-05-PATH · BR-CORE-05-BB · BR-CORE-05-SERIAL · AC-CORE-05-*
 * SRS:        SRS_HRM_ENTERPRISE.md FR-UC-BP-CORE-05 Luồng #1–#4 · Diễn biến #1–#2
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-CORE-05-CLUSTER-API-01.md F-CORE-AST-01 · F-CORE-AST-BB-01
 * Purpose:    Tài sản cấp phát nhân sự — bind display-ready /employees/:id/assets*;
 *             CTA Xác nhận nhận (BB) · VI «Đang sử dụng» gate CFG on · soft thu hồi · serial 409 toast.
 * WorkItem:   PO-HRM-MVP-GD1-CORE-05-CLUSTER-FE-01
 * Coded:      2026-08-09
 * Callers:    EmployeeProfile activeTab=assets
 * Callees:    useEmployeeAssets · empCoreAstRing
 * must_keep: SoftDel prefer · navigate employees/:id · Nest /core DENY · no Asset SoT invent ·
 *            notes ≠ BB · no e-sign · no CORE-06/07 DONE · honesty false · C-SLICE
 * ADR:        docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md §8–§10 · ADR Q-ASSET-MODULE stub
 * LastVerified: poHrmMvpGd1Core05ClusterFe01.source.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W3-EMP-C
 * change_mode: UPGRADE
 * What: Labels/empty → text-xevn-textSecondary; blue/purple AI chrome → xevn DNA; KPI ops-dense
 * Why: ADR-20260805 §8–§10 · inventory W3-EMP-C
 * must_keep: SoftDel; navigate(/employees/:id); stub honesty; no OCR/QR invent; no Nest/seed; no Employees CLOSED
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-CORE-05-CLUSTER-FE-01
 * change_mode: ADD
 * What: BB CTA Xác nhận nhận · status_label_vi · filter đang giữ + pending confirm · soft thu hồi · hdsd hooks
 * Why: API-01 F-CORE-AST-BB-01 · AC-CORE-05-01..08 · O1 Network MUST /employees/:id/assets*
 * must_keep: Nest /core DENY · notes-only ≠ BB · no Asset ledger/e-sign invent · CORE-03/02b/09d..01 seals · U65
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-CORE-05-CLUSTER-FE-02
 * change_mode: FIX
 * What: Form still holds "" dates for UI; write path omits via hook buildAssetWritePayload (peer)
 * Why: QA-01 CORE05QA-MSLGFOXU · empty date POST 500 — RETAIN BB/serial/soft UI
 * must_keep: Nest /core DENY · honesty false · C-SLICE · no CORE-05/06/07 DONE claim
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-CORE-06-CLUSTER-FE-01
 * change_mode: ADD
 * What: Embed EmployeeAssetReturnChecklist · soft≠DONE footer · must_keep BB/serial soft-return
 * Why: R-CORE-06-TERM-CHK-01 · CLOSED FE-derive · F-CORE-AST-02 RETAIN · Nest /core 0
 * must_keep: CORE-05 BB/serial/DELETE-FORBIDDEN · soft≠CORE-06 DONE · CORE-05≠personnel · CORE-07 QUEUED
 */

import { useMemo, useState } from 'react';
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  Plus, MoreHorizontal, Pencil, Trash2, Laptop, Smartphone, Monitor,
  Headphones, Key, CreditCard, Car, Package, Calendar, DollarSign,
  CheckCircle2, AlertTriangle, XCircle, RotateCcw, Loader2, ClipboardCheck,
} from 'lucide-react';
import {
  CORE_06_SOFT_NE_DONE_FOOTER_VI,
  needsHandoverConfirmCta,
  prefersSoftDisposition,
} from '@/lib/empCoreAstRing';
import { useEmployeeAssets, type AssetFormData } from '@/hooks/useEmployeeAssets';
import { EmployeeAssetReturnChecklist } from '@/components/employee/EmployeeAssetReturnChecklist';

interface EmployeeAssetsProps {
  employeeId: string;
}

const categoryIcons: Record<string, React.ReactNode> = {
  laptop: <Laptop className="h-5 w-5" />,
  phone: <Smartphone className="h-5 w-5" />,
  monitor: <Monitor className="h-5 w-5" />,
  accessory: <Headphones className="h-5 w-5" />,
  furniture: <Package className="h-5 w-5" />,
  vehicle: <Car className="h-5 w-5" />,
  card: <CreditCard className="h-5 w-5" />,
  key: <Key className="h-5 w-5" />,
  equipment: <Package className="h-5 w-5" />,
  other: <Package className="h-5 w-5" />,
};

const categoryColors: Record<string, string> = {
  laptop: 'bg-xevn-primary/10 dark:bg-xevn-primary/20 text-xevn-primary dark:text-xevn-accent',
  phone: 'bg-xevn-success/15 dark:bg-xevn-success/20 text-xevn-success',
  monitor: 'bg-xevn-accent/15 dark:bg-xevn-accent/20 text-xevn-primary dark:text-xevn-accent',
  accessory: 'bg-xevn-warning/15 dark:bg-xevn-warning/20 text-xevn-warning',
  furniture: 'bg-xevn-warning/15 dark:bg-xevn-warning/20 text-xevn-warning',
  vehicle: 'bg-xevn-danger/15 dark:bg-xevn-danger/20 text-xevn-danger',
  card: 'bg-xevn-accent/15 dark:bg-xevn-accent/20 text-xevn-accent',
  key: 'bg-xevn-accent/15 dark:bg-xevn-accent/20 text-xevn-primary',
  equipment: 'bg-xevn-primary/10 dark:bg-xevn-primary/20 text-xevn-primary dark:text-xevn-accent',
  other: 'bg-xevn-neutral/15 dark:bg-xevn-neutral/20 text-xevn-textSecondary dark:text-xevn-textMuted',
};

const statusIcons: Record<string, React.ReactNode> = {
  assigned: <CheckCircle2 className="h-4 w-4" />,
  returned: <RotateCcw className="h-4 w-4" />,
  maintenance: <AlertTriangle className="h-4 w-4" />,
  lost: <XCircle className="h-4 w-4" />,
};

type ListFilter = 'all' | 'in_use' | 'pending_confirm' | 'history';

function formatDisplayDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const raw = String(iso).trim();
  if (!raw) return '—';
  const d = new Date(raw.length <= 10 ? `${raw}T00:00:00` : raw);
  if (Number.isNaN(d.getTime())) return raw;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export const EmployeeAssets = ({ employeeId }: EmployeeAssetsProps) => {
  const { t, i18n } = useTranslation();
  const {
    assets,
    assignedAssets,
    assetChecklistClosed,
    openAssignedCount,
    terminationContextId,
    setTerminationContextId,
    loading,
    addAsset,
    updateAsset,
    confirmHandover,
    softReturnAsset,
    markLostAsset,
    loadAssignedChecklist,
    deleteAsset,
    getStats,
    bbConfirmGateOn,
  } = useEmployeeAssets(employeeId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [listFilter, setListFilter] = useState<ListFilter>('all');

  const categoryLabels: Record<string, string> = {
    laptop: t('assets.categories.laptop'),
    phone: t('assets.categories.phone'),
    monitor: t('assets.categories.monitor'),
    accessory: t('assets.categories.accessory'),
    furniture: t('assets.categories.furniture'),
    vehicle: t('assets.categories.vehicle'),
    card: t('assets.categories.card'),
    key: t('assets.categories.key'),
    equipment: t('assets.categories.equipment'),
    other: t('assets.categories.other'),
  };

  const conditionLabels: Record<string, string> = {
    new: t('assets.conditions.new'),
    good: t('assets.conditions.good'),
    fair: t('assets.conditions.fair'),
    poor: t('assets.conditions.poor'),
    damaged: t('assets.conditions.damaged'),
  };

  const statusLabels: Record<string, string> = {
    assigned: t('assets.status.assigned'),
    returned: t('assets.status.returned'),
    maintenance: t('assets.status.maintenance'),
    lost: t('assets.status.lost'),
  };

  const [form, setForm] = useState<AssetFormData>({
    asset_name: '',
    asset_code: '',
    category: 'equipment',
    brand: '',
    model: '',
    serial_number: '',
    assigned_date: '',
    return_date: '',
    condition: 'new',
    status: 'assigned',
    value: 0,
    specifications: '',
    notes: '',
  });

  const filteredAssets = useMemo(() => {
    if (listFilter === 'all') return assets;
    if (listFilter === 'in_use') {
      return assets.filter(
        (a) =>
          a.status === 'assigned' &&
          (!bbConfirmGateOn || a.handover_confirmed),
      );
    }
    if (listFilter === 'pending_confirm') {
      return assets.filter(
        (a) => a.status === 'assigned' && bbConfirmGateOn && !a.handover_confirmed,
      );
    }
    return assets.filter((a) => a.status !== 'assigned');
  }, [assets, listFilter, bbConfirmGateOn]);

  const handleOpenDialog = (assetId?: string) => {
    if (assetId) {
      const asset = assets.find((a) => a.id === assetId);
      if (asset) {
        setEditingId(assetId);
        setForm({
          asset_name: asset.asset_name,
          asset_code: asset.asset_code,
          category: asset.category,
          brand: asset.brand || '',
          model: asset.model || '',
          serial_number: asset.serial_number || '',
          assigned_date: asset.assigned_date || '',
          return_date: asset.return_date || '',
          condition: asset.condition,
          status: asset.status,
          value: asset.value,
          specifications: asset.specifications || '',
          notes: asset.notes || '',
        });
      }
    } else {
      setEditingId(null);
      setForm({
        asset_name: '',
        asset_code: '',
        category: 'equipment',
        brand: '',
        model: '',
        serial_number: '',
        assigned_date: '',
        return_date: '',
        condition: 'new',
        status: 'assigned',
        value: 0,
        specifications: '',
        notes: '',
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.asset_name.trim()) return;
    setSaving(true);
    try {
      const ok = editingId
        ? await updateAsset(editingId, form)
        : await addAsset(form);
      if (ok) setDialogOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmHandover = async (id: string) => {
    setConfirmingId(id);
    try {
      await confirmHandover(id);
    } finally {
      setConfirmingId(null);
    }
  };

  const handleSoftReturn = async (id: string) => {
    if (confirm(t('assets.confirmSoftReturn'))) {
      await softReturnAsset(id);
    }
  };

  const handleDelete = async (id: string) => {
    const row = assets.find((a) => a.id === id);
    if (row && prefersSoftDisposition(row)) {
      await handleSoftReturn(id);
      return;
    }
    if (confirm(t('assets.confirmDelete'))) {
      await deleteAsset(id);
    }
  };

  const formatCurrency = (value: number) => {
    const lang = i18n.language;
    const locale = lang === 'vi' ? 'vi-VN' : lang === 'zh' ? 'zh-CN' : 'en-US';
    const currency = lang === 'vi' ? 'VND' : lang === 'zh' ? 'CNY' : 'USD';
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12" data-hdsd="hdsd-emp-assets-loading">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-hdsd="hdsd-emp-assets">
      <EmployeeAssetReturnChecklist
        assignedAssets={assignedAssets}
        assetChecklistClosed={assetChecklistClosed}
        openAssignedCount={openAssignedCount}
        terminationContextId={terminationContextId}
        onSetTerminationContextId={setTerminationContextId}
        onLoadChecklist={loadAssignedChecklist}
        onSoftReturn={softReturnAsset}
        onMarkLost={markLostAsset}
      />

      {/* Summary Cards — ops-dense */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-xevn-border bg-xevn-surface shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-xevn-primary/10 dark:bg-xevn-primary/20">
                <Package className="h-5 w-5 text-xevn-primary dark:text-xevn-accent" />
              </div>
              <div>
                <p className="text-sm text-xevn-textSecondary">{t('assets.inUse')}</p>
                <p className="text-2xl font-bold text-xevn-text" data-hdsd="hdsd-emp-assets-in-use-count">
                  {stats.inUseCount}
                </p>
                {bbConfirmGateOn && stats.pendingConfirmCount > 0 ? (
                  <p className="text-xs text-xevn-warning mt-1">
                    {t('assets.pendingConfirmCount', { count: stats.pendingConfirmCount })}
                  </p>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-xevn-border bg-xevn-surface shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-xevn-success/15 dark:bg-xevn-success/20">
                <DollarSign className="h-5 w-5 text-xevn-success" />
              </div>
              <div>
                <p className="text-sm text-xevn-textSecondary">{t('assets.totalValue')}</p>
                <p className="text-xl font-bold text-xevn-text">{formatCurrency(stats.totalValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-xevn-border bg-xevn-surface shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-xevn-accent/15 dark:bg-xevn-accent/20">
                <Laptop className="h-5 w-5 text-xevn-primary dark:text-xevn-accent" />
              </div>
              <div>
                <p className="text-sm text-xevn-textSecondary">{t('assets.assetTypes')}</p>
                <p className="text-2xl font-bold text-xevn-text">{stats.categoryCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-xevn-border bg-xevn-surface shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-xevn-warning/15 dark:bg-xevn-warning/20">
                <AlertTriangle className="h-5 w-5 text-xevn-warning" />
              </div>
              <div>
                <p className="text-sm text-xevn-textSecondary">{t('assets.underMaintenance')}</p>
                <p className="text-2xl font-bold text-xevn-text">{stats.maintenanceCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assets List */}
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {t('assets.title')}
          </CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <Select
              value={listFilter}
              onValueChange={(v) => setListFilter(v as ListFilter)}
            >
              <SelectTrigger className="w-[200px] h-9" data-hdsd="hdsd-emp-assets-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('assets.filterAll')}</SelectItem>
                <SelectItem value="in_use">{t('assets.filterInUse')}</SelectItem>
                {bbConfirmGateOn ? (
                  <SelectItem value="pending_confirm">{t('assets.filterPendingConfirm')}</SelectItem>
                ) : null}
                <SelectItem value="history">{t('assets.filterHistory')}</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" onClick={() => handleOpenDialog()} data-hdsd="hdsd-emp-assets-add">
              <Plus className="h-4 w-4 mr-1" />
              {t('assets.add')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {bbConfirmGateOn ? (
            <p className="text-xs text-xevn-textSecondary mb-4" data-hdsd="hdsd-emp-assets-bb-hint">
              {t('assets.bbGateHint')}
            </p>
          ) : null}
          {filteredAssets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAssets.map((asset) => {
                const showConfirmCta = needsHandoverConfirmCta(
                  { status: asset.status, handoverConfirmed: asset.handover_confirmed },
                  bbConfirmGateOn,
                );
                const statusText = asset.status_label_vi || statusLabels[asset.status] || asset.status;
                return (
                  <div
                    key={asset.id}
                    className="p-4 border rounded-lg"
                    data-hdsd="hdsd-emp-assets-row"
                    data-asset-id={asset.id}
                    data-handover-confirmed={asset.handover_confirmed ? '1' : '0'}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2 rounded-lg ${categoryColors[asset.category] || categoryColors.other}`}>
                          {categoryIcons[asset.category] || categoryIcons.other}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div>
                            <h4 className="font-semibold">{asset.asset_name}</h4>
                            <p className="text-sm text-xevn-textSecondary">
                              {asset.asset_code || '—'}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline">
                              {categoryLabels[asset.category] || t('assets.categories.other')}
                            </Badge>
                            <Badge
                              variant={
                                asset.status === 'assigned'
                                  ? asset.handover_confirmed || !bbConfirmGateOn
                                    ? 'default'
                                    : 'outline'
                                  : asset.status === 'returned'
                                    ? 'secondary'
                                    : asset.status === 'maintenance'
                                      ? 'outline'
                                      : 'destructive'
                              }
                              className="gap-1"
                              data-hdsd="hdsd-emp-assets-status"
                            >
                              {statusIcons[asset.status]}
                              {statusText}
                            </Badge>
                            {showConfirmCta ? (
                              <Badge variant="outline" className="text-xevn-warning border-xevn-warning/40">
                                {t('assets.pendingConfirmBadge')}
                              </Badge>
                            ) : null}
                            {asset.handover_confirmed ? (
                              <Badge variant="secondary" className="gap-1" data-hdsd="hdsd-emp-assets-bb-done">
                                <ClipboardCheck className="h-3 w-3" />
                                {t('assets.bbConfirmedBadge')}
                              </Badge>
                            ) : null}
                            <Badge
                              variant={
                                asset.condition === 'new'
                                  ? 'default'
                                  : asset.condition === 'good'
                                    ? 'secondary'
                                    : asset.condition === 'fair'
                                      ? 'outline'
                                      : 'destructive'
                              }
                            >
                              {conditionLabels[asset.condition] || asset.condition}
                            </Badge>
                          </div>

                          {(asset.brand || asset.model) && (
                            <p className="text-sm">
                              <span className="font-medium">{asset.brand}</span>
                              {asset.brand && asset.model && ' - '}
                              <span>{asset.model}</span>
                            </p>
                          )}

                          {asset.serial_number && (
                            <p className="text-sm text-xevn-textSecondary">
                              S/N: {asset.serial_number}
                            </p>
                          )}

                          <div className="flex items-center gap-4 text-sm text-xevn-textSecondary">
                            {asset.assigned_date && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDisplayDate(asset.assigned_date)}
                              </span>
                            )}
                            {asset.value > 0 && (
                              <span className="font-medium text-foreground">
                                {formatCurrency(asset.value)}
                              </span>
                            )}
                          </div>

                          {asset.handover_confirmed_at ? (
                            <p className="text-xs text-xevn-textSecondary">
                              {t('assets.bbConfirmedAt', {
                                date: formatDisplayDate(asset.handover_confirmed_at),
                              })}
                            </p>
                          ) : null}

                          {asset.specifications && (
                            <p className="text-sm text-xevn-textSecondary italic">
                              {asset.specifications}
                            </p>
                          )}

                          {showConfirmCta ? (
                            <Button
                              size="sm"
                              className="mt-1"
                              disabled={confirmingId === asset.id}
                              onClick={() => void handleConfirmHandover(asset.id)}
                              data-hdsd="hdsd-emp-assets-confirm-bb"
                            >
                              {confirmingId === asset.id ? (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              ) : (
                                <ClipboardCheck className="h-4 w-4 mr-1" />
                              )}
                              {t('assets.confirmReceive')}
                            </Button>
                          ) : null}
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenDialog(asset.id)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            {t('assets.editAction')}
                          </DropdownMenuItem>
                          {prefersSoftDisposition(asset) ? (
                            <DropdownMenuItem
                              onClick={() => void handleSoftReturn(asset.id)}
                              data-hdsd="hdsd-emp-assets-soft-return"
                            >
                              <RotateCcw className="h-4 w-4 mr-2" />
                              {t('assets.softReturnAction')}
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => void handleDelete(asset.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {t('assets.deleteAction')}
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              className="text-center py-12 text-xevn-textSecondary"
              data-hdsd="hdsd-emp-assets-empty"
            >
              <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>{assets.length === 0 ? t('assets.empty') : t('assets.emptyFilter')}</p>
              {assets.length === 0 ? (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => handleOpenDialog()}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('assets.addFirst')}
                </Button>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-hdsd="hdsd-emp-assets-dialog">
          <DialogHeader>
            <DialogTitle>{editingId ? t('assets.edit') : t('assets.addNew')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('assets.assetName')} *</Label>
                <Input
                  value={form.asset_name}
                  onChange={(e) => setForm({ ...form, asset_name: e.target.value })}
                  placeholder={t('assets.assetNamePlaceholder')}
                  data-hdsd="hdsd-emp-assets-name"
                />
              </div>
              <div className="space-y-2">
                <Label>{t('assets.assetCode')}</Label>
                <Input
                  value={form.asset_code}
                  onChange={(e) => setForm({ ...form, asset_code: e.target.value })}
                  placeholder={t('assets.assetCodePlaceholder')}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('assets.category')}</Label>
                <Select value={form.category} onValueChange={(value) => setForm({ ...form, category: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('assets.brand')}</Label>
                <Input
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  placeholder={t('assets.brandPlaceholder')}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('assets.model')}</Label>
                <Input
                  value={form.model}
                  onChange={(e) => setForm({ ...form, model: e.target.value })}
                  placeholder={t('assets.modelPlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('assets.serialNumber')}</Label>
                <Input
                  value={form.serial_number}
                  onChange={(e) => setForm({ ...form, serial_number: e.target.value })}
                  placeholder={t('assets.serialPlaceholder')}
                  data-hdsd="hdsd-emp-assets-serial"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('assets.assignedDate')}</Label>
                <ViDateField
                  value={form.assigned_date}
                  onValueChange={(v) => setForm({ ...form, assigned_date: v })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('assets.returnDate')}</Label>
                <ViDateField
                  value={form.return_date}
                  onValueChange={(v) => setForm({ ...form, return_date: v })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{t('assets.condition')}</Label>
                <Select value={form.condition} onValueChange={(value) => setForm({ ...form, condition: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(conditionLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('assets.statusLabel')}</Label>
                <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('assets.valueLabel')}</Label>
                <ViMoneyInput
                  value={Number(form.value) || 0}
                  onValueChange={(n) => setForm({ ...form, value: n })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('assets.specifications')}</Label>
              <Input
                value={form.specifications}
                onChange={(e) => setForm({ ...form, specifications: e.target.value })}
                placeholder={t('assets.specPlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('assets.notes')}</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder={t('assets.notesPlaceholder')}
                rows={2}
                data-hdsd="hdsd-emp-assets-notes"
              />
              <p className="text-xs text-xevn-textSecondary">{t('assets.notesNotBb')}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              {t('assets.cancel')}
            </Button>
            <Button
              onClick={() => void handleSave()}
              disabled={saving || !form.asset_name.trim()}
              data-hdsd="hdsd-emp-assets-save"
            >
              {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : null}
              {editingId ? t('assets.update') : t('assets.add')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <p
        className="text-xs text-xevn-textSecondary px-1"
        data-hdsd="hdsd-emp-assets-profile-core06-footer"
        data-honesty-soft-ne-done="1"
        data-honesty-core05-ne-personnel="1"
      >
        {t('assets.core06HonestyFooter', { defaultValue: CORE_06_SOFT_NE_DONE_FOOTER_VI })}
      </p>
    </div>
  );
};
