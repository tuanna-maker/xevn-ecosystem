/**
 * @CODE-MEMORY
 * Screen:     EmployeeProfile → tab Tài sản (E20) · checklist thu hồi CORE-06
 * UC:         UC-BP-CORE-05 · UC-BP-CORE-06 · FR-UC-BP-CORE-05 · FR-UC-BP-CORE-06
 * BR:         BR-BP-AST-01 · BR-BP-AST-02 · BR-CORE-05-* · AC-CORE-05-* · AC-CORE-06-*
 * SRS:        SRS_HRM_ENTERPRISE.md FR-UC-BP-CORE-05/06 Luồng #1–#4 · Diễn biến #1–#2
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-CORE-05-CLUSTER-API-01.md F-CORE-AST-01 · F-CORE-AST-BB-01
 *             docs/program/specs/PO-HRM-MVP-GD1-CORE-06-CLUSTER-API-01.md F-CORE-AST-02 · R-CORE-06-TERM-CHK-01 · R-CORE-06-CLOSED-01
 * Purpose:    Hook cấp phát + thu hồi tài sản — bind display-ready từ /employees/:id/assets*;
 *             CTA BB confirm · soft return / lost · FE-derive asset_checklist_closed;
 *             cấm Nest /core · invent Asset/PAY SoT · claim soft=CORE-06 DONE.
 * WorkItem:   PO-HRM-MVP-GD1-CORE-05-CLUSTER-FE-01 · PO-HRM-MVP-GD1-CORE-06-CLUSTER-FE-01
 * Coded:      2026-08-09
 * Callers:    EmployeeAssets · EmployeeAssetReturnChecklist
 * Callees:    hrmApi list/create/update/deleteEmployeeAsset · empCoreAstRing
 * must_keep:  Physical assets* · notes ≠ BB · U65 · honesty false · C-SLICE · soft≠DONE · CORE-07 OUT
 * LastVerified: poHrmMvpGd1Core06ClusterFe01.source.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-CORE-05-CLUSTER-FE-01
 * change_mode: ADD
 * What: Map statusLabelVi + handoverConfirmed* · confirmHandover · softReturnAsset · serial toast
 * Why: API-01 F-CORE-AST-BB-01 · AC-CORE-05-04/05/07/08 · O1 Network /employees/:id/assets*
 * must_keep: SoftDel prefer · Nest /core DENY · no Asset ledger invent · no e-sign · no CORE-06 DONE
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-CORE-05-CLUSTER-FE-02
 * change_mode: FIX
 * What: addAsset/updateAsset → buildAssetWritePayload (omit blank assigned_date/return_date)
 * Why: QA-01 FAIL stamp CORE05QA-MSLGFOXU · "" DATE → POST 500 HRM-SYS-001
 * must_keep: BB CTA · serial 409 · soft status · Nest /core DENY · honesty false · C-SLICE
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-CORE-06-CLUSTER-FE-01
 * change_mode: ADD
 * What: markLostAsset · assignedAssets FE-filter · deriveAssetChecklistClosed · soft termination_context_id
 * Why: F-CORE-AST-02 RETAIN · R-CORE-06-TERM-CHK-01 · R-CORE-06-CLOSED-01 FE-derive · soft≠DONE
 * must_keep: Nest /core AST/TERM 0 · CORE-05 BB/serial · no PAY invent · no /return dual · CORE-07 QUEUED
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { toErrorMessage } from '@/lib/apiError';
import {
  AST_BB_CONFIRM_GATE_DEFAULT_ON,
  buildAssetWritePayload,
  buildHandoverConfirmPatch,
  buildLostAssetPatch,
  buildSoftReturnPatch,
  deriveAssetChecklistClosed,
  filterAssignedAssets,
  isFullyInUse,
  parseHandoverConfirmed,
  prefersSoftDisposition,
  resolveAstStatusLabel,
} from '@/lib/empCoreAstRing';
import {
  createEmployeeAsset,
  deleteEmployeeAsset,
  listEmployeeAssets,
  updateEmployeeAsset,
} from '@/integrations/hrmApi';

export interface EmployeeAsset {
  id: string;
  employee_id: string;
  company_id: string;
  asset_code: string;
  asset_name: string;
  category: string;
  brand: string | null;
  model: string | null;
  serial_number: string | null;
  specifications: string | null;
  condition: string;
  assigned_date: string | null;
  return_date: string | null;
  value: number;
  status: string;
  /** Display-ready VI (BE prefer) — fallback «Đang sử dụng» map. */
  status_label_vi: string;
  notes: string | null;
  /** F-CORE-AST-BB-01 — true when handover_confirmed_at set. */
  handover_confirmed: boolean;
  handover_confirmed_at: string | null;
  handover_confirmed_by: string | null;
  handover_receiver_name: string | null;
  /** Paper alias — id when confirmed else null. */
  handover_doc_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface AssetFormData {
  asset_code: string;
  asset_name: string;
  category: string;
  brand: string;
  model: string;
  serial_number: string;
  specifications: string;
  condition: string;
  assigned_date: string;
  return_date: string;
  value: number;
  status: string;
  notes: string;
}

function pickStr(row: Record<string, unknown>, ...keys: string[]): string {
  for (const k of keys) {
    const v = row[k];
    if (v != null && String(v).trim() !== '') return String(v);
  }
  return '';
}

function pickStrOrNull(row: Record<string, unknown>, ...keys: string[]): string | null {
  const s = pickStr(row, ...keys);
  return s || null;
}

export function mapAsset(row: Record<string, unknown>, employeeId: string): EmployeeAsset {
  const status = pickStr(row, 'status') || 'assigned';
  const statusLabelVi = resolveAstStatusLabel(
    status,
    pickStrOrNull(row, 'statusLabelVi', 'status_label_vi', 'status_label'),
  );
  const handoverConfirmed = parseHandoverConfirmed({
    handoverConfirmed: row.handoverConfirmed,
    handover_confirmed: row.handover_confirmed,
    handoverConfirmedAt: row.handoverConfirmedAt,
    handover_confirmed_at: row.handover_confirmed_at,
  });
  const id = String(row.id ?? '');
  const handoverDocIdRaw = row.handoverDocId ?? row.handover_doc_id;
  let handoverDocId: string | null = null;
  if (handoverDocIdRaw != null && String(handoverDocIdRaw).trim() !== '') {
    handoverDocId = String(handoverDocIdRaw);
  } else if (handoverConfirmed && id) {
    handoverDocId = id;
  }

  return {
    id,
    employee_id: String(row.employeeId ?? row.employee_id ?? employeeId),
    company_id: String(row.companyId ?? row.company_id ?? ''),
    asset_code: pickStr(row, 'assetCode', 'asset_code'),
    asset_name: pickStr(row, 'assetName', 'asset_name'),
    category: pickStr(row, 'category'),
    brand: pickStrOrNull(row, 'brand'),
    model: pickStrOrNull(row, 'model'),
    serial_number: pickStrOrNull(row, 'serialNumber', 'serial_number'),
    specifications: pickStrOrNull(row, 'specifications'),
    condition: pickStr(row, 'condition'),
    assigned_date: pickStrOrNull(row, 'assignedDate', 'assigned_date'),
    return_date: pickStrOrNull(row, 'returnDate', 'return_date'),
    value: Number(row.value ?? 0),
    status,
    status_label_vi: statusLabelVi,
    notes: pickStrOrNull(row, 'notes'),
    handover_confirmed: handoverConfirmed,
    handover_confirmed_at: pickStrOrNull(row, 'handoverConfirmedAt', 'handover_confirmed_at'),
    handover_confirmed_by: pickStrOrNull(row, 'handoverConfirmedBy', 'handover_confirmed_by'),
    handover_receiver_name: pickStrOrNull(row, 'handoverReceiverName', 'handover_receiver_name'),
    handover_doc_id: handoverDocId,
    created_at: pickStr(row, 'createdAt', 'created_at'),
    updated_at: pickStr(row, 'updatedAt', 'updated_at'),
  };
}

export function useEmployeeAssets(employeeId: string) {
  const { currentCompanyId } = useAuth();
  const [assets, setAssets] = useState<EmployeeAsset[]>([]);
  const [loading, setLoading] = useState(true);
  /** Soft/ephemeral TERM context — HOLD invent Nest terminations primary. */
  const [terminationContextId, setTerminationContextId] = useState<string | null>(null);

  const fetchAssets = useCallback(async () => {
    if (!employeeId || !currentCompanyId) return;

    try {
      setLoading(true);
      // R-CORE-06-TERM-CHK-01 — one physical GET /employees/:id/assets* then FE-filter assigned.
      // Optional status=assigned on query for checklist Network assert; FE still derives closed.
      const response = await listEmployeeAssets(employeeId, currentCompanyId, {
        termination_context_id: terminationContextId,
      });
      setAssets((response.data ?? []).map((row) => mapAsset(row, employeeId)));
    } catch (error) {
      console.error('Error fetching assets:', error);
      toast.error(toErrorMessage(error, 'Không thể tải dữ liệu tài sản'));
      setAssets([]);
    } finally {
      setLoading(false);
    }
  }, [employeeId, currentCompanyId, terminationContextId]);

  useEffect(() => {
    void fetchAssets();
  }, [fetchAssets]);

  const assignedAssets = useMemo(() => filterAssignedAssets(assets), [assets]);
  const checklistClosed = useMemo(() => deriveAssetChecklistClosed(assets), [assets]);

  const addAsset = async (formData: AssetFormData) => {
    if (!currentCompanyId) return false;

    try {
      // R-CORE-05-EMPTY-DATE-500 — omit blank dates; never POST assigned_date/return_date as "".
      const payload = buildAssetWritePayload({ ...formData });
      await createEmployeeAsset(employeeId, currentCompanyId, payload);
      toast.success('Đã thêm cấp phát tài sản');
      await fetchAssets();
      return true;
    } catch (error) {
      console.error('Error adding asset:', error);
      toast.error(toErrorMessage(error, 'Không thể thêm tài sản'));
      return false;
    }
  };

  const updateAsset = async (id: string, formData: Partial<AssetFormData>) => {
    if (!currentCompanyId) return false;

    try {
      const payload = buildAssetWritePayload({ ...formData });
      await updateEmployeeAsset(employeeId, id, currentCompanyId, payload);
      toast.success('Đã cập nhật tài sản');
      await fetchAssets();
      return true;
    } catch (error) {
      console.error('Error updating asset:', error);
      toast.error(toErrorMessage(error, 'Không thể cập nhật tài sản'));
      return false;
    }
  };

  /**
   * F-CORE-AST-BB-01 — Xác nhận nhận (BB). notes-only ≠ BB DONE.
   * Network PATCH …/assets/:assetId with handoverConfirmed: true.
   */
  const confirmHandover = async (assetId: string, receiverName?: string) => {
    if (!currentCompanyId) return false;

    try {
      await updateEmployeeAsset(
        employeeId,
        assetId,
        currentCompanyId,
        buildHandoverConfirmPatch(receiverName),
      );
      toast.success('Đã xác nhận nhận tài sản (biên bản bàn giao)');
      await fetchAssets();
      return true;
    } catch (error) {
      console.error('Error confirming handover:', error);
      toast.error(toErrorMessage(error, 'Không thể xác nhận nhận tài sản'));
      return false;
    }
  };

  /** F-CORE-AST-02 soft thu hồi — PATCH status=returned (+ return_date). ≠ CORE-06 DONE alone. */
  const softReturnAsset = async (assetId: string, returnDateIso?: string) => {
    if (!currentCompanyId) return false;

    try {
      await updateEmployeeAsset(
        employeeId,
        assetId,
        currentCompanyId,
        buildSoftReturnPatch(returnDateIso),
      );
      toast.success('Đã thu hồi (đổi trạng thái) — soft Profile ≠ CORE-06 DONE');
      await fetchAssets();
      return true;
    } catch (error) {
      console.error('Error soft-returning asset:', error);
      toast.error(toErrorMessage(error, 'Không thể thu hồi tài sản'));
      return false;
    }
  };

  /** R-CORE-06-EXCEPTION-01 — PATCH status=lost + notes stub (no compensation ledger). */
  const markLostAsset = async (assetId: string, notes: string) => {
    if (!currentCompanyId) return false;
    const reason = (notes ?? '').trim();
    if (!reason) {
      toast.error('Nhập lý do mất/ghi nợ (notes) trước khi xác nhận');
      return false;
    }

    try {
      await updateEmployeeAsset(
        employeeId,
        assetId,
        currentCompanyId,
        buildLostAssetPatch(reason),
      );
      toast.success('Đã ghi mất/ghi nợ — stub notes; bồi thường kế toán OUT');
      await fetchAssets();
      return true;
    } catch (error) {
      console.error('Error marking asset lost:', error);
      toast.error(toErrorMessage(error, 'Không thể ghi mất tài sản'));
      return false;
    }
  };

  /**
   * Checklist entry — reload GET assigned feed (R-CORE-06-TERM-CHK-01).
   * Network asserts status=assigned query; state still FE-filtered from full list via refetch.
   */
  const loadAssignedChecklist = async (termCtxOverride?: string | null) => {
    if (!employeeId || !currentCompanyId) return [];

    const ctx =
      termCtxOverride !== undefined ? termCtxOverride : terminationContextId;

    try {
      const response = await listEmployeeAssets(employeeId, currentCompanyId, {
        status: 'assigned',
        termination_context_id: ctx,
      });
      const rows = (response.data ?? []).map((row) => mapAsset(row, employeeId));
      // Merge freshness: refetch full list so history + closed stay consistent.
      await fetchAssets();
      return filterAssignedAssets(rows);
    } catch (error) {
      console.error('Error loading assigned checklist:', error);
      toast.error(toErrorMessage(error, 'Không thể tải checklist đang giữ'));
      return [];
    }
  };

  const deleteAsset = async (id: string) => {
    if (!currentCompanyId) return false;

    const row = assets.find((a) => a.id === id);
    if (row && prefersSoftDisposition(row)) {
      toast.error(
        'Bản ghi đã cấp phát — dùng Thu hồi (đổi trạng thái). Không xóa cứng lịch sử (CORE-06).',
      );
      return false;
    }

    try {
      await deleteEmployeeAsset(employeeId, id, currentCompanyId);
      toast.success('Đã xóa bản ghi nháp');
      await fetchAssets();
      return true;
    } catch (error) {
      console.error('Error deleting asset:', error);
      toast.error(toErrorMessage(error, 'Không thể xóa tài sản'));
      return false;
    }
  };

  const getStats = () => {
    const gateOn = AST_BB_CONFIRM_GATE_DEFAULT_ON;
    const inUse = assets.filter((a) =>
      isFullyInUse(
        { status: a.status, handoverConfirmed: a.handover_confirmed },
        gateOn,
      ),
    );
    return {
      totalAssets: assets.length,
      inUseCount: inUse.length,
      pendingConfirmCount: assets.filter(
        (a) =>
          a.status === 'assigned' && gateOn && !a.handover_confirmed,
      ).length,
      totalValue: inUse.reduce((sum, a) => sum + (a.value || 0), 0),
      categoryCount: new Set(assets.map((a) => a.category).filter(Boolean)).size,
      maintenanceCount: assets.filter((a) => a.status === 'maintenance').length,
      openAssignedCount: checklistClosed.openAssignedCount,
      assetChecklistClosed: checklistClosed.asset_checklist_closed,
    };
  };

  return {
    assets,
    assignedAssets,
    assetChecklistClosed: checklistClosed.asset_checklist_closed,
    openAssignedCount: checklistClosed.openAssignedCount,
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
    refetch: fetchAssets,
    getStats,
    bbConfirmGateOn: AST_BB_CONFIRM_GATE_DEFAULT_ON,
  };
}
