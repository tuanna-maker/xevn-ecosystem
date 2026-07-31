/**
 * @CODE-MEMORY
 * Screen:     /hr/employee-metadata — Hàng chờ metadata nhân sự
 * UC:         UC-HRM-26 · UF-HRM-11
 * BR:         BRD §5.3 (workflow_code tham chiếu XBOS — UI chỉ nhãn nghiệp vụ)
 * SRS:        docs/hrm/SRS.md §13 · UC-HRM-26
 * TechSpec:   docs/hrm/TECHSPEC.md § metadata queue
 * Purpose:    Bảng duyệt yêu cầu thay đổi metadata; gửi yêu cầu mới từ Cài đặt HRM.
 * WorkItem:   D-HRM-METADATA-WORKFLOW-ID-HUMANIZE-01
 * Coded:      2026-07-20
 *
 * Callers:
 *   - pages/EmployeeMetadataPage.tsx → MetadataQueueTab
 *
 * Callees:
 *   - useMetadataQueue → hrmApi employee-metadata/*
 *   - formatMetadataWorkflowLabel → nhãn VI cột Quy trình
 *
 * FE-Actions:
 *   | Thao tác | Handler | Lib |
 *   |----------|---------|-----|
 *   | Duyệt / Từ chối | onDecide | useMetadataQueue.decide |
 *   | Gửi yêu cầu | onSubmitNew | useMetadataQueue.submit |
 *
 * Impact:     Hiện raw workflow_code → lộ mã kỹ thuật (QC C-HRM-MENU-SWEEP-01)
 * must_keep:  Approve/reject + submit payloads; không seed; không hiện xbos.*
 * SOLID:      Tab = presentation; label map tách lib
 * LastVerified: lib/metadataWorkflowLabel.test.ts · d-hrm-metadata-workflow-id-humanize-01-fe-20260720.md
 *
 * @CODE-MEMORY-CHANGE 2026-07-20
 * WorkItem: D-HRM-METADATA-WORKFLOW-ID-HUMANIZE-01
 * change_mode: UPGRADE
 * What: Cột Quy trình dùng formatMetadataWorkflowLabel; header VI (không "Workflow")
 * Why: QC GWC P3 — humanize/hide xbos.employee_metadata.default
 * must_keep: decide/submit flows; formatMetadataDisplayValue
 */
import { Loader2, Plus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { listEmployees } from '@/integrations/hrmApi';
import { normalizeHrmApiListCompanyId } from '@/lib/hrmListScope';
import { formatMetadataWorkflowLabel } from '@/lib/metadataWorkflowLabel';
import { formatMetadataDisplayValue, useMetadataQueue } from '@/hooks/useMetadataQueue';
import type { HrmEmployeeMetadataChangeRequest } from '@/integrations/hrmApi';

export function MetadataQueueTab() {
  const { currentCompanyId } = useAuth();
  const { rows, total, isLoading, fetchError, decide, submit, useApiMode, refetch } = useMetadataQueue('pending');
  const [submitting, setSubmitting] = useState(false);
  const [fieldKey, setFieldKey] = useState('job_title');
  const [requestedValue, setRequestedValue] = useState('');

  const onDecide = async (id: string, action: 'approve' | 'reject', row: HrmEmployeeMetadataChangeRequest) => {
    try {
      await decide(id, action, row);
      toast.success(action === 'approve' ? 'Đã duyệt yêu cầu metadata' : 'Đã từ chối yêu cầu metadata');
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Không cập nhật được yêu cầu');
    }
  };

  const onSubmitNew = async () => {
    if (!currentCompanyId || !fieldKey.trim() || !requestedValue.trim()) return;
    setSubmitting(true);
    try {
      const list = await listEmployees({
        company_id: normalizeHrmApiListCompanyId(currentCompanyId),
        page_size: 1,
      });
      const emp = list.data?.[0];
      if (!emp?.id) {
        toast.error('Không tìm thấy nhân viên để gửi yêu cầu metadata');
        return;
      }
      await submit({
        employee_id: emp.id,
        company_id: emp.company_id,
        field_key: fieldKey.trim(),
        requested_value: requestedValue.trim(),
        reason: 'Yêu cầu thay đổi metadata từ Cài đặt HRM',
      });
      toast.success('Đã gửi yêu cầu metadata — chờ duyệt');
      setRequestedValue('');
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Không gửi được yêu cầu metadata');
    } finally {
      setSubmitting(false);
    }
  };

  if (!useApiMode) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Hàng chờ metadata</CardTitle>
          <CardDescription>
            Chế độ kết nối chưa sẵn sàng — mở HRM từ Command Center để duyệt metadata.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
        <MetadataQueueHeader total={total} />
        <Button variant="outline" size="sm" onClick={() => void refetch()} disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Tải lại'}
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {fetchError ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            {fetchError}
          </div>
        ) : null}
        <MetadataQueueTable isLoading={isLoading} rows={rows} onDecide={onDecide} />
        <MetadataSubmitPanel
          fieldKey={fieldKey}
          requestedValue={requestedValue}
          submitting={submitting}
          onFieldKeyChange={setFieldKey}
          onRequestedValueChange={setRequestedValue}
          onSubmit={() => void onSubmitNew()}
        />
      </CardContent>
    </Card>
  );
}

function MetadataQueueHeader({ total }: { total: number }) {
  return (
    <div>
      <CardTitle>Hàng chờ metadata nhân sự</CardTitle>
      <CardDescription>{total} hồ sơ chờ duyệt</CardDescription>
    </div>
  );
}

function MetadataQueueTable({
  isLoading,
  rows,
  onDecide,
}: {
  isLoading: boolean;
  rows: HrmEmployeeMetadataChangeRequest[];
  onDecide: (id: string, action: 'approve' | 'reject', row: HrmEmployeeMetadataChangeRequest) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nhân sự</TableHead>
            <TableHead>Trường dữ liệu</TableHead>
            <TableHead>Giá trị đề nghị</TableHead>
            <TableHead>Lý do</TableHead>
            <TableHead>Quy trình</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                <Loader2 className="mx-auto h-5 w-5 animate-spin" />
              </TableCell>
            </TableRow>
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                Không có yêu cầu metadata đang chờ duyệt.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.actor_name ?? row.employee_id}</TableCell>
                <TableCell className="font-mono text-xs">{row.field_key}</TableCell>
                <TableCell>{formatMetadataDisplayValue(row.requested_value)}</TableCell>
                <TableCell>{row.reason ?? '—'}</TableCell>
                <TableCell data-testid="metadata-workflow-label">
                  {formatMetadataWorkflowLabel(row.workflow_code)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-emerald-700"
                      onClick={() => void onDecide(row.id, 'approve', row)}
                    >
                      Duyệt
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-rose-700"
                      onClick={() => void onDecide(row.id, 'reject', row)}
                    >
                      Từ chối
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function MetadataSubmitPanel({
  fieldKey,
  requestedValue,
  submitting,
  onFieldKeyChange,
  onRequestedValueChange,
  onSubmit,
}: {
  fieldKey: string;
  requestedValue: string;
  submitting: boolean;
  onFieldKeyChange: (value: string) => void;
  onRequestedValueChange: (value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="rounded-lg border border-dashed p-4 space-y-3">
      <p className="text-sm font-medium">Gửi yêu cầu metadata mới</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="meta-field-key">Mã trường</Label>
          <Input
            id="meta-field-key"
            value={fieldKey}
            onChange={(e) => onFieldKeyChange(e.target.value)}
            placeholder="job_title"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="meta-requested-value">Giá trị đề nghị</Label>
          <Input
            id="meta-requested-value"
            value={requestedValue}
            onChange={(e) => onRequestedValueChange(e.target.value)}
            placeholder="Chuyên viên QA"
          />
        </div>
      </div>
      <Button type="button" size="sm" disabled={submitting || !requestedValue.trim()} onClick={onSubmit}>
        <Plus className="mr-2 h-4 w-4" />
        Gửi yêu cầu
      </Button>
    </div>
  );
}
