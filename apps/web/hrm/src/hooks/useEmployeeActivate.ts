/**
 * @CODE-MEMORY
 * Screen:     EmployeeProfile → CTA «Kích hoạt Hoạt động»
 * UC:         UC-BP-CORE-07 · FR-UC-BP-CORE-07
 * BR:         BR-BP-LC-02 · AC-CORE-07-01..05 · ≠-CHK-DONE · ≠-PATCH-DONE
 * SRS:        SRS_HRM_ENTERPRISE.md FR-UC-BP-CORE-07 Diễn biến #1–#2
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-CORE-07-CLUSTER-API-01.md F-CORE-ACT-01
 * Purpose:    Load checklist + bind can_activate/blocking_items; POST …/activate with
 *             effective_date; toast GATE 409 incomplete; Nest /core DENY; checklist≠DONE.
 * WorkItem:   PO-HRM-MVP-GD1-CORE-07-CLUSTER-FE-01
 * Coded:      2026-08-09
 * Callers:    EmployeeActivatePanel
 * Callees:    hrmApi activateEmployee · listEmployeeDocumentChecklist · empCoreActRing · toErrorMessage
 * must_keep:  Physical POST activate O1 · U19 company · U65 · honesty false · soft≠CORE-06 DONE
 * LastVerified: poHrmMvpGd1Core07ClusterFe01.source.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-08-10 PO-HRM-MVP-GD1-ATT-12-CLUSTER-FE-01
 * change_mode: UPGRADE
 * What: After activate 2xx invalidate leave-balance/panel + activate_default shift queries
 * Why: AC-ATT-12-FE-CONFIRM F5 parity · J-HRM-ATT-12-05
 * must_keep: POST activate path · CORE-07 boundary
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import {
  activateEmployee,
  listEmployeeDocumentChecklist,
  type HrmDocumentChecklistItem,
  type HrmEmployeeRecord,
} from '@/integrations/hrmApi';
import { toErrorMessage } from '@/lib/apiError';
import {
  buildActivatePostBody,
  deriveCanActivateFromChecklist,
  pickActivateEnvelope,
  type CoreActEnvelope,
  validateActivateEffectiveDateIso,
} from '@/lib/empCoreActRing';
import { toast } from 'sonner';
import { LEAVE_BALANCE_PANEL_QUERY_KEY } from '@/hooks/useLeaveBalancesByType';
import { ACTIVATE_DEFAULT_SHIFT_QUERY_KEY } from '@/hooks/useActivateDefaultShift';
import { LEAVE_BALANCE_QUERY_KEY } from '@/hooks/useLeaveBalance';

function mapChkRow(row: HrmDocumentChecklistItem | Record<string, unknown>): HrmDocumentChecklistItem {
  const r = row as Record<string, unknown>;
  const pick = (camel: string, snake: string) =>
    r[camel] !== undefined && r[camel] !== null ? r[camel] : r[snake];

  return {
    id: String(pick('id', 'id') ?? ''),
    employeeId: String(pick('employeeId', 'employee_id') ?? ''),
    companyId: String(pick('companyId', 'company_id') ?? ''),
    documentTypeKey: String(pick('documentTypeKey', 'document_type_key') ?? ''),
    required: Boolean(pick('required', 'required')),
    status: String(pick('status', 'status') ?? 'missing'),
    statusLabel: (pick('statusLabel', 'status_label') as string | null | undefined) ?? null,
    fileRef: (pick('fileRef', 'file_ref') as string | null | undefined) ?? null,
    archivedAt: (pick('archivedAt', 'archived_at') as string | null | undefined) ?? null,
    nameVi:
      (pick('nameVi', 'name_vi') as string | null | undefined) ??
      (pick('documentTypeNameVi', 'document_type_name_vi') as string | null | undefined) ??
      null,
    sortOrder:
      typeof pick('sortOrder', 'sort_order') === 'number'
        ? (pick('sortOrder', 'sort_order') as number)
        : null,
    requiredByDefault:
      pick('requiredByDefault', 'required_by_default') === undefined
        ? null
        : Boolean(pick('requiredByDefault', 'required_by_default')),
    blocksActivation:
      pick('blocksActivation', 'blocks_activation') === undefined
        ? null
        : Boolean(pick('blocksActivation', 'blocks_activation')),
    requiresExpiry:
      pick('requiresExpiry', 'requires_expiry') === undefined
        ? null
        : Boolean(pick('requiresExpiry', 'requires_expiry')),
    catalogStatus: (pick('catalogStatus', 'catalog_status') as string | null | undefined) ?? null,
    source: (pick('source', 'source') as string | null | undefined) ?? null,
    catalogKind: (pick('catalogKind', 'catalog_kind') as string | null | undefined) ?? null,
    tokenKey: (pick('tokenKey', 'token_key') as string | null | undefined) ?? null,
    createdAt: String(pick('createdAt', 'created_at') ?? ''),
    updatedAt: String(pick('updatedAt', 'updated_at') ?? ''),
  };
}

function normalizeBlocking(
  items:
    | HrmEmployeeRecord['blocking_items']
    | HrmEmployeeRecord['blockingItems']
    | null
    | undefined,
) {
  if (!items || !Array.isArray(items)) return null;
  return items.map((it) => ({
    documentTypeKey:
      (it.documentTypeKey ?? it.document_type_key ?? '').trim() || '—',
    nameVi: (it.nameVi ?? it.name_vi ?? '').trim() || '—',
    status: (it.status ?? 'missing').trim() || 'missing',
  }));
}

export type UseEmployeeActivateOptions = {
  employeeId: string;
  /** Current profile status (pending_docs eligible). */
  status: string;
  /** Optional BE envelope from getEmployeeById when LIVE. */
  employeeRecord?: Partial<HrmEmployeeRecord> | null;
  onActivated?: () => void | Promise<void>;
};

export function useEmployeeActivate({
  employeeId,
  status,
  employeeRecord,
  onActivated,
}: UseEmployeeActivateOptions) {
  const { currentCompanyId } = useAuth();
  const queryClient = useQueryClient();
  const [checklist, setChecklist] = useState<HrmDocumentChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);
  const [effectiveDateIso, setEffectiveDateIso] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );

  const fetchChecklist = useCallback(async () => {
    if (!employeeId || !currentCompanyId) {
      setChecklist([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await listEmployeeDocumentChecklist(employeeId, currentCompanyId);
      setChecklist((res.data ?? []).map((row) => mapChkRow(row)));
    } catch (error: unknown) {
      console.error('Error fetching checklist for activate gate:', error);
      toast.error(toErrorMessage(error, 'Không thể tải checklist để kiểm tra kích hoạt'));
      setChecklist([]);
    } finally {
      setLoading(false);
    }
  }, [employeeId, currentCompanyId]);

  useEffect(() => {
    void fetchChecklist();
  }, [fetchChecklist]);

  const envelope: CoreActEnvelope = useMemo(
    () =>
      pickActivateEnvelope({
        status,
        statusLabelVi:
          employeeRecord?.statusLabelVi ??
          employeeRecord?.status_label_vi ??
          employeeRecord?.status_label,
        can_activate: employeeRecord?.can_activate ?? employeeRecord?.canActivate,
        checklist_complete:
          employeeRecord?.checklist_complete ?? employeeRecord?.checklistComplete,
        blocking_items: normalizeBlocking(
          employeeRecord?.blocking_items ?? employeeRecord?.blockingItems,
        ),
        activated_at: employeeRecord?.activated_at ?? employeeRecord?.activatedAt,
        checklistItems: checklist,
      }),
    [status, employeeRecord, checklist],
  );

  /** CTA enable — BE can_activate prefer; else FE-derive (≠ claim CORE-07 DONE). */
  const canActivateCta = useMemo(() => {
    if (typeof employeeRecord?.can_activate === 'boolean') {
      return employeeRecord.can_activate;
    }
    if (typeof employeeRecord?.canActivate === 'boolean') {
      return employeeRecord.canActivate;
    }
    return deriveCanActivateFromChecklist(checklist);
  }, [employeeRecord, checklist]);

  const activate = async (): Promise<boolean> => {
    if (!employeeId || !currentCompanyId) return false;
    const dateErr = validateActivateEffectiveDateIso(effectiveDateIso);
    if (dateErr) {
      toast.error(dateErr);
      return false;
    }
    if (!canActivateCta) {
      toast.error(
        toErrorMessage(
          {
            code: 'HRM-EMP-ACT-CHECKLIST-INCOMPLETE',
            message: 'Checklist chưa đủ — không thể kích hoạt.',
          },
          'Checklist chưa đủ — không thể kích hoạt.',
        ),
      );
      return false;
    }

    setMutating(true);
    try {
      const body = buildActivatePostBody(effectiveDateIso);
      // Network MUST hit POST …/employees/:id/activate — Nest /core = 0 · free PATCH ≠ DONE
      await activateEmployee(employeeId, currentCompanyId, body);
      toast.success('Đã kích hoạt hồ sơ sang Hoạt động');
      await queryClient.invalidateQueries({ queryKey: [LEAVE_BALANCE_PANEL_QUERY_KEY] });
      await queryClient.invalidateQueries({ queryKey: [LEAVE_BALANCE_QUERY_KEY] });
      await queryClient.invalidateQueries({ queryKey: [ACTIVATE_DEFAULT_SHIFT_QUERY_KEY] });
      await onActivated?.();
      await fetchChecklist();
      return true;
    } catch (error: unknown) {
      toast.error(toErrorMessage(error, 'Không thể kích hoạt hồ sơ'));
      return false;
    } finally {
      setMutating(false);
    }
  };

  return {
    checklist,
    loading,
    mutating,
    envelope,
    canActivateCta,
    effectiveDateIso,
    setEffectiveDateIso,
    refetch: fetchChecklist,
    activate,
  };
}
