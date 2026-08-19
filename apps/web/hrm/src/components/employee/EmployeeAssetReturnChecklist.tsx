/**
 * @CODE-MEMORY
 * Screen:     EmployeeProfile → tab Tài sản → Checklist thu hồi (CORE-06 residual)
 * UC:         UC-BP-CORE-06 · FR-UC-BP-CORE-06
 * BR:         BR-BP-AST-02 · AC-CORE-06-01..08 · AC-CORE-06-≠-SOFT-DONE · AC-CORE-06-H
 * SRS:        SRS_HRM_ENTERPRISE.md FR-UC-BP-CORE-06 Luồng #1–#4 · Diễn biến #1–#2
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-CORE-06-CLUSTER-API-01.md
 *             F-CORE-AST-02 · R-CORE-06-TERM-CHK-01 · R-CORE-06-CLOSED-01 · R-CORE-06-EXCEPTION-01
 * Purpose:    Checklist entry loads GET assets filter assigned; mark returned/lost via PATCH;
 *             FE-derive asset_checklist_closed; soft Profile alone ≠ CORE-06 DONE footer.
 * WorkItem:   PO-HRM-MVP-GD1-CORE-06-CLUSTER-FE-01
 * Coded:      2026-08-09
 * Callers:    EmployeeAssets
 * Callees:    useEmployeeAssets · empCoreAstRing
 * must_keep:  Physical /employees/:id/assets* · Nest /core AST/TERM 0 · CORE-05 BB/serial ·
 *             no Asset ledger · no /return dual · no PAY settle · CORE-07 QUEUED · U65 · C-SLICE
 * LastVerified: poHrmMvpGd1Core06ClusterFe01.source.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-CORE-06-CLUSTER-FE-01
 * change_mode: ADD
 * What: TERM checklist panel · soft-return/lost CTAs · closed badge FE-derive · honesty footer
 * Why: API-01 CONFIRMED residual · J-HRM-CORE-06-01..05 DRAFT unlock
 * must_keep: soft≠DONE · CORE-05≠personnel · Nest /core DENY · no honesty flip
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Loader2,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import { CORE_06_SOFT_NE_DONE_FOOTER_VI } from '@/lib/empCoreAstRing';
import type { EmployeeAsset } from '@/hooks/useEmployeeAssets';

export interface EmployeeAssetReturnChecklistProps {
  assignedAssets: EmployeeAsset[];
  assetChecklistClosed: boolean;
  openAssignedCount: number;
  terminationContextId: string | null;
  onSetTerminationContextId: (id: string | null) => void;
  onLoadChecklist: (termCtxOverride?: string | null) => Promise<EmployeeAsset[]>;
  onSoftReturn: (assetId: string) => Promise<boolean>;
  onMarkLost: (assetId: string, notes: string) => Promise<boolean>;
}

export function EmployeeAssetReturnChecklist({
  assignedAssets,
  assetChecklistClosed,
  openAssignedCount,
  terminationContextId,
  onSetTerminationContextId,
  onLoadChecklist,
  onSoftReturn,
  onMarkLost,
}: EmployeeAssetReturnChecklistProps) {
  const { t } = useTranslation();
  const [loadingChecklist, setLoadingChecklist] = useState(false);
  const [actingId, setActingId] = useState<string | null>(null);
  const [lostDialogOpen, setLostDialogOpen] = useState(false);
  const [lostAssetId, setLostAssetId] = useState<string | null>(null);
  const [lostNotes, setLostNotes] = useState('');
  const [termCtxDraft, setTermCtxDraft] = useState(terminationContextId ?? '');

  const handleLoad = async () => {
    setLoadingChecklist(true);
    try {
      const trimmed = termCtxDraft.trim() || null;
      onSetTerminationContextId(trimmed);
      await onLoadChecklist(trimmed);
    } finally {
      setLoadingChecklist(false);
    }
  };

  const handleSoftReturn = async (id: string) => {
    if (!confirm(t('assets.confirmSoftReturnChecklist'))) return;
    setActingId(id);
    try {
      await onSoftReturn(id);
    } finally {
      setActingId(null);
    }
  };

  const openLostDialog = (id: string) => {
    setLostAssetId(id);
    setLostNotes('');
    setLostDialogOpen(true);
  };

  const handleMarkLost = async () => {
    if (!lostAssetId) return;
    setActingId(lostAssetId);
    try {
      const ok = await onMarkLost(lostAssetId, lostNotes);
      if (ok) setLostDialogOpen(false);
    } finally {
      setActingId(null);
    }
  };

  return (
    <Card
      className="border-xevn-border bg-xevn-surface shadow-soft"
      data-hdsd="hdsd-emp-assets-return-checklist"
      data-asset-checklist-closed={assetChecklistClosed ? '1' : '0'}
      data-open-assigned-count={String(openAssignedCount)}
    >
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 pb-2">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-base">
            <ClipboardList className="h-5 w-5 text-xevn-primary" />
            {t('assets.returnChecklistTitle')}
          </CardTitle>
          <p className="text-xs text-xevn-textSecondary" data-hdsd="hdsd-emp-assets-checklist-hint">
            {t('assets.returnChecklistHint')}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {assetChecklistClosed ? (
            <Badge
              variant="default"
              className="gap-1 bg-xevn-success text-white"
              data-hdsd="hdsd-emp-assets-checklist-closed"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              {t('assets.checklistClosedTrue')}
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="gap-1 border-xevn-warning/50 text-xevn-warning"
              data-hdsd="hdsd-emp-assets-checklist-open"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              {t('assets.checklistClosedFalse', { count: openAssignedCount })}
            </Badge>
          )}
          <Button
            size="sm"
            variant="outline"
            disabled={loadingChecklist}
            onClick={() => void handleLoad()}
            data-hdsd="hdsd-emp-assets-checklist-load"
          >
            {loadingChecklist ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <ClipboardList className="h-4 w-4 mr-1" />
            )}
            {t('assets.loadAssignedChecklist')}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-12 gap-3 items-end">
          <div className="col-span-12 md:col-span-4 space-y-1.5">
            <Label htmlFor="term-ctx" className="text-xs text-xevn-textSecondary">
              {t('assets.terminationContextOptional')}
            </Label>
            <Input
              id="term-ctx"
              value={termCtxDraft}
              onChange={(e) => setTermCtxDraft(e.target.value)}
              placeholder={t('assets.terminationContextPlaceholder')}
              className="h-9"
              data-hdsd="hdsd-emp-assets-term-ctx"
            />
          </div>
          <div className="col-span-12 md:col-span-8">
            <p className="text-xs text-xevn-textSecondary">{t('assets.terminationContextHint')}</p>
          </div>
        </div>

        {assignedAssets.length === 0 ? (
          <div
            className="text-center py-8 text-xevn-textSecondary"
            data-hdsd="hdsd-emp-assets-checklist-empty"
          >
            <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>{t('assets.checklistEmptyAssigned')}</p>
          </div>
        ) : (
          <ul className="space-y-3" data-hdsd="hdsd-emp-assets-checklist-list">
            {assignedAssets.map((asset) => (
              <li
                key={asset.id}
                className="flex flex-wrap items-center justify-between gap-3 p-3 border border-xevn-border rounded-[12px]"
                data-hdsd="hdsd-emp-assets-checklist-row"
                data-asset-id={asset.id}
                data-status={asset.status}
              >
                <div className="min-w-0 space-y-1">
                  <p className="font-medium text-xevn-text truncate">{asset.asset_name}</p>
                  <p className="text-sm text-xevn-textSecondary">
                    {asset.asset_code || '—'}
                    {asset.serial_number ? ` · S/N ${asset.serial_number}` : ''}
                  </p>
                  <Badge variant="outline" data-hdsd="hdsd-emp-assets-checklist-status">
                    {asset.status_label_vi || t('assets.status.assigned')}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={actingId === asset.id}
                    onClick={() => void handleSoftReturn(asset.id)}
                    data-hdsd="hdsd-emp-assets-checklist-return"
                  >
                    {actingId === asset.id ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <RotateCcw className="h-4 w-4 mr-1" />
                    )}
                    {t('assets.softReturnAction')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xevn-danger border-xevn-danger/40"
                    disabled={actingId === asset.id}
                    onClick={() => openLostDialog(asset.id)}
                    data-hdsd="hdsd-emp-assets-checklist-lost"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    {t('assets.markLostAction')}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <p
          className="text-xs text-xevn-textSecondary border-t border-xevn-border pt-3"
          data-hdsd="hdsd-emp-assets-core06-footer"
          data-honesty-soft-ne-done="1"
          data-honesty-core05-ne-personnel="1"
        >
          {t('assets.core06HonestyFooter', { defaultValue: CORE_06_SOFT_NE_DONE_FOOTER_VI })}
        </p>
      </CardContent>

      <Dialog open={lostDialogOpen} onOpenChange={setLostDialogOpen}>
        <DialogContent data-hdsd="hdsd-emp-assets-lost-dialog">
          <DialogHeader>
            <DialogTitle>{t('assets.markLostTitle')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label>{t('assets.lostNotesLabel')} *</Label>
            <Textarea
              value={lostNotes}
              onChange={(e) => setLostNotes(e.target.value)}
              placeholder={t('assets.lostNotesPlaceholder')}
              rows={3}
              data-hdsd="hdsd-emp-assets-lost-notes"
            />
            <p className="text-xs text-xevn-textSecondary">{t('assets.lostNotesHint')}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLostDialogOpen(false)}>
              {t('assets.cancel')}
            </Button>
            <Button
              disabled={!lostNotes.trim() || actingId === lostAssetId}
              onClick={() => void handleMarkLost()}
              data-hdsd="hdsd-emp-assets-lost-save"
            >
              {actingId === lostAssetId ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : null}
              {t('assets.markLostConfirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
