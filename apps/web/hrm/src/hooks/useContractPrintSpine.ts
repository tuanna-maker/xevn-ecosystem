/**
 * @CODE-MEMORY
 * Screen:     /contracts workspace — preview / print-versions / PDF spine
 * UC:         FR-UC-BP-CORE-09b/c · AC-CTR-PRINT-01..08
 * WorkItem:   PO-HRM-CTR-WORKSPACE-WAVE-G3
 * Purpose:    Shared hook for ContractPrintSpinePanel + workspace view mode (preview/PDF honesty).
 * Callers:    ContractPrintSpinePanel · ContractWorkspaceViewBody
 * must_keep:  contracts_printable_ready=false · UF-HRM-02 registry · no FE invent body
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createContractPrintVersion,
  fetchContractPrintPdf,
  getContractPrintVersion,
  listContractPrintVersions,
  previewContractPrint,
  type HrmContractPreviewResult,
  type HrmContractPrintVersionRecord,
} from '@/integrations/hrmApi';
import { buildContractPrintFieldOverrides } from '@/lib/contractPrintFieldOverrides';
import {
  contractPrintPdfFilename,
  extractIssueBlockedDetails,
  formatIssueBlockedMissingSummary,
  isIssueGateErrorCode,
  isIssuedPrintVersion,
} from '@/lib/contractPrintVersionUx';
import { previewMergedSummaryRows } from '@/lib/contractPackPreviewUx';
import { ApiClientError, toErrorMessage } from '@/lib/apiError';
import { toast } from '@/hooks/use-toast';

export type UseContractPrintSpineInput = {
  companyId: string;
  contractId: string | null;
  packCode: string;
  templateId: string;
  templateCode: string;
  employeeId?: string | null;
  workLocation?: string | null;
  driverOverrides?: Record<string, string>;
  clauseIds?: string[];
};

export function useContractPrintSpine({
  companyId,
  contractId,
  packCode,
  templateId,
  templateCode,
  employeeId,
  workLocation,
  driverOverrides = {},
  clauseIds = [],
}: UseContractPrintSpineInput) {
  const [preview, setPreview] = useState<HrmContractPreviewResult | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [versions, setVersions] = useState<HrmContractPrintVersionRecord[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const fieldOverrides = useMemo(
    () =>
      buildContractPrintFieldOverrides({
        work_location: workLocation ?? '',
        ...driverOverrides,
      }),
    [workLocation, driverOverrides],
  );

  const previewSummaryRows = useMemo(
    () => previewMergedSummaryRows(preview?.merged_fields),
    [preview?.merged_fields],
  );

  const refreshVersions = useCallback(async () => {
    if (!contractId || !companyId) {
      setVersions([]);
      setSelectedVersionId(null);
      return;
    }
    try {
      const res = await listContractPrintVersions({
        contract_id: contractId,
        company_id: companyId,
      });
      setVersions(res.items);
      const issued = res.items.find((v) => isIssuedPrintVersion(v.status));
      setSelectedVersionId((prev) => {
        if (prev && res.items.some((v) => v.id === prev)) return prev;
        return issued?.id ?? res.items[0]?.id ?? null;
      });
    } catch {
      setVersions([]);
      setSelectedVersionId(null);
    }
  }, [contractId, companyId]);

  useEffect(() => {
    void refreshVersions();
  }, [refreshVersions]);

  const runPreview = useCallback(async () => {
    if (!contractId || !companyId) {
      setPreviewError('Chưa có mã hợp đồng trên sổ.');
      return;
    }
    if (!templateCode.trim() && !templateId.trim()) {
      setPreviewError('Chưa chọn mẫu in.');
      return;
    }
    setBusy(true);
    setPreviewError(null);
    try {
      const res = await previewContractPrint(contractId, {
        company_id: companyId,
        pack_code: packCode || undefined,
        template_id: templateId || undefined,
        template_code: templateCode.trim() || undefined,
        field_overrides: fieldOverrides,
      });
      setPreview(res);
    } catch (err: unknown) {
      setPreview(null);
      setPreviewError(toErrorMessage(err, 'Không xem trước được hợp đồng.'));
    } finally {
      setBusy(false);
    }
  }, [
    contractId,
    companyId,
    packCode,
    templateId,
    templateCode,
    employeeId,
    fieldOverrides,
    clauseIds,
  ]);

  const saveVersion = useCallback(async () => {
    if (!contractId || !companyId) return;
    if (!preview?.can_issue) {
      toast({
        title: 'Chưa đủ điều kiện phát hành',
        description: 'Hoàn thiện field/điều khoản thiếu trước khi lưu phiên bản in.',
        variant: 'destructive',
      });
      return;
    }
    setBusy(true);
    try {
      await createContractPrintVersion(contractId, {
        company_id: companyId,
        pack_code: packCode || preview.pack_code || 'GENERAL',
        template_id: templateId || undefined,
        template_code: templateCode.trim() || undefined,
        field_overrides: fieldOverrides,
      });
      toast({ title: 'Đã lưu phiên bản in' });
      await refreshVersions();
    } catch (err: unknown) {
      if (err instanceof ApiClientError && isIssueGateErrorCode(err.code)) {
        const details = extractIssueBlockedDetails(err.details);
        toast({
          title: 'Chưa phát hành được',
          description: formatIssueBlockedMissingSummary(details),
          variant: 'destructive',
        });
        return;
      }
      toast({
        title: 'Lỗi lưu phiên bản',
        description: toErrorMessage(err),
        variant: 'destructive',
      });
    } finally {
      setBusy(false);
    }
  }, [
    contractId,
    companyId,
    preview,
    packCode,
    templateId,
    templateCode,
    fieldOverrides,
    clauseIds,
    refreshVersions,
  ]);

  const downloadPdf = useCallback(async () => {
    if (!contractId || !companyId) return;
    const versionId = selectedVersionId;
    if (!versionId) {
      toast({
        title: 'Chưa có phiên bản in',
        description: 'Lưu phiên bản in trước khi tải PDF.',
        variant: 'destructive',
      });
      return;
    }
    setBusy(true);
    try {
      const detail = await getContractPrintVersion({
        contract_id: contractId,
        version_id: versionId,
        company_id: companyId,
      });
      if (!isIssuedPrintVersion(detail.status)) {
        toast({
          title: 'Phiên bản chưa phát hành',
          description: 'Chỉ tải PDF từ phiên bản đã phát hành.',
          variant: 'destructive',
        });
        return;
      }
      const blob = await fetchContractPrintPdf({
        version_id: versionId,
        company_id: companyId,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = contractPrintPdfFilename(contractId, detail.version_no);
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      toast({
        title: 'Không tải PDF',
        description: toErrorMessage(err),
        variant: 'destructive',
      });
    } finally {
      setBusy(false);
    }
  }, [contractId, companyId, selectedVersionId]);

  return {
    preview,
    previewError,
    previewSummaryRows,
    versions,
    selectedVersionId,
    setSelectedVersionId,
    busy,
    runPreview,
    saveVersion,
    downloadPdf,
    refreshVersions,
  };
}
