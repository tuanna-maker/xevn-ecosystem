/**
 * @CODE-MEMORY
 * Screen:     EmployeeProfile → tab Giấy tờ (checklist)
 * UC:         UC-BP-CORE-03 · FR-UC-BP-CORE-03
 * BR:         BR-BP-DOC-01 · BR-PLT-02 · AC-CORE-03-06..08
 * SRS:        SRS_HRM_ENTERPRISE.md FR-UC-BP-CORE-03 Diễn biến #1–#2
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-CORE-03-CLUSTER-API-01.md F-CORE-CHK-01
 * Purpose:    Hook checklist — GET/POST/PATCH …/document-checklist*; Nộp→submitted ·
 *             Xác nhận→approved; toast invent KEY; empty [] OK U65; no Nest /core.
 * WorkItem:   PO-HRM-MVP-GD1-CORE-03-CLUSTER-FE-01
 * Coded:      2026-08-09
 * Callers:    EmployeeDocumentChecklist
 * Callees:    hrmApi document-checklist* · useEmpDocumentTypesEffective · empCoreChkRing · toErrorMessage
 * must_keep:  Physical path O1 · DOC catalog picker EFF · no FE invent DOC SoT · no required starter
 * LastVerified: poHrmMvpGd1Core03ClusterFe01.source.test.ts
 */

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  archiveEmployeeDocumentChecklistItem,
  createEmployeeDocumentChecklistItem,
  listEmployeeDocumentChecklist,
  updateEmployeeDocumentChecklistItem,
  type HrmDocumentChecklistItem,
} from '@/integrations/hrmApi';
import { toErrorMessage } from '@/lib/apiError';
import {
  validateChkCreateGate,
} from '@/lib/empCoreChkRing';
import { toast } from 'sonner';

export type DocumentChecklistFormData = {
  documentTypeKey: string;
  fileRef: string;
  /** Explicit override only — omit on create so BE defaults from required_by_default. */
  required?: boolean;
};

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

export function useEmployeeDocumentChecklist(employeeId: string) {
  const { currentCompanyId } = useAuth();
  const [items, setItems] = useState<HrmDocumentChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);

  const fetchData = useCallback(async () => {
    if (!employeeId || !currentCompanyId) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await listEmployeeDocumentChecklist(employeeId, currentCompanyId);
      setItems((res.data ?? []).map((row) => mapChkRow(row)));
    } catch (error: unknown) {
      console.error('Error fetching document checklist:', error);
      toast.error(toErrorMessage(error, 'Không thể tải checklist giấy tờ'));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [employeeId, currentCompanyId]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const addItem = async (form: DocumentChecklistFormData): Promise<boolean> => {
    if (!employeeId || !currentCompanyId) return false;
    const gate = validateChkCreateGate({ documentTypeKey: form.documentTypeKey });
    if (gate) {
      toast.error(gate);
      return false;
    }
    setMutating(true);
    try {
      const body: Record<string, unknown> = {
        documentTypeKey: form.documentTypeKey.trim(),
      };
      if (form.fileRef.trim()) body.fileRef = form.fileRef.trim();
      // Do NOT invent required — BE defaults from catalog required_by_default when omitted.
      if (typeof form.required === 'boolean') body.required = form.required;

      await createEmployeeDocumentChecklistItem(employeeId, currentCompanyId, body);
      toast.success('Đã thêm dòng checklist (Thiếu / chờ nộp)');
      await fetchData();
      return true;
    } catch (error: unknown) {
      toast.error(toErrorMessage(error, 'Không thể thêm dòng checklist'));
      return false;
    } finally {
      setMutating(false);
    }
  };

  const submitItem = async (itemId: string, fileRef?: string): Promise<boolean> => {
    if (!employeeId || !currentCompanyId) return false;
    setMutating(true);
    try {
      const body: Record<string, unknown> = { status: 'submitted' };
      if ((fileRef ?? '').trim()) body.fileRef = fileRef!.trim();
      await updateEmployeeDocumentChecklistItem(employeeId, itemId, currentCompanyId, body);
      toast.success('Đã nộp giấy tờ (submitted)');
      await fetchData();
      return true;
    } catch (error: unknown) {
      toast.error(toErrorMessage(error, 'Không thể nộp giấy tờ'));
      return false;
    } finally {
      setMutating(false);
    }
  };

  const approveItem = async (itemId: string): Promise<boolean> => {
    if (!employeeId || !currentCompanyId) return false;
    setMutating(true);
    try {
      await updateEmployeeDocumentChecklistItem(employeeId, itemId, currentCompanyId, {
        status: 'approved',
      });
      toast.success('Đã xác nhận giấy tờ (approved)');
      await fetchData();
      return true;
    } catch (error: unknown) {
      toast.error(toErrorMessage(error, 'Không thể xác nhận giấy tờ'));
      return false;
    } finally {
      setMutating(false);
    }
  };

  const reopenItem = async (itemId: string): Promise<boolean> => {
    if (!employeeId || !currentCompanyId) return false;
    setMutating(true);
    try {
      await updateEmployeeDocumentChecklistItem(employeeId, itemId, currentCompanyId, {
        status: 'missing',
      });
      toast.success('Đã yêu cầu nộp lại (missing)');
      await fetchData();
      return true;
    } catch (error: unknown) {
      toast.error(toErrorMessage(error, 'Không thể yêu cầu nộp lại'));
      return false;
    } finally {
      setMutating(false);
    }
  };

  const archiveItem = async (itemId: string): Promise<boolean> => {
    if (!employeeId || !currentCompanyId) return false;
    setMutating(true);
    try {
      await archiveEmployeeDocumentChecklistItem(employeeId, itemId, currentCompanyId);
      toast.success('Đã ẩn dòng checklist (soft-archive)');
      await fetchData();
      return true;
    } catch (error: unknown) {
      toast.error(toErrorMessage(error, 'Không thể ẩn dòng checklist'));
      return false;
    } finally {
      setMutating(false);
    }
  };

  return {
    items,
    loading,
    mutating,
    refetch: fetchData,
    addItem,
    submitItem,
    approveItem,
    reopenItem,
    archiveItem,
  };
}
