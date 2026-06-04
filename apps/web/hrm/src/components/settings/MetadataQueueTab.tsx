import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { formatMetadataDisplayValue, useMetadataQueue } from '@/hooks/useMetadataQueue';
import type { HrmEmployeeMetadataChangeRequest } from '@/integrations/hrmApi';

export function MetadataQueueTab() {
  const { rows, total, isLoading, fetchError, decide, useApiMode, refetch } = useMetadataQueue('pending');

  const onDecide = async (id: string, action: 'approve' | 'reject') => {
    try {
      await decide(id, action);
      toast.success(action === 'approve' ? 'Đã duyệt yêu cầu metadata' : 'Đã từ chối yêu cầu metadata');
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Không cập nhật được yêu cầu');
    }
  };

  if (!useApiMode) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Hàng chờ metadata</CardTitle>
          <CardDescription>
            Chế độ API Nest (portal embed) chưa bật — bật VITE_HRM_USE_API và đăng nhập qua Command Center.
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
      </CardContent>
    </Card>
  );
}

function MetadataQueueHeader({ total }: { total: number }) {
  return (
    <div>
      <CardTitle>Hàng chờ metadata nhân sự</CardTitle>
      <CardDescription>
        UC-HRM-26 — GET /api/hrm/employee-metadata/change-requests · {total} hồ sơ chờ duyệt
      </CardDescription>
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
  onDecide: (id: string, action: 'approve' | 'reject') => void;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nhân sự</TableHead>
            <TableHead>Field</TableHead>
            <TableHead>Giá trị đề nghị</TableHead>
            <TableHead>Lý do</TableHead>
            <TableHead>Workflow</TableHead>
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
                <TableCell>{row.workflow_code ?? 'Mặc định'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-emerald-700"
                      onClick={() => void onDecide(row.id, 'approve')}
                    >
                      Duyệt
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-rose-700"
                      onClick={() => void onDecide(row.id, 'reject')}
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
