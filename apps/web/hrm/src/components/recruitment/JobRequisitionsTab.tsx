import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, RefreshCw, Pencil } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  createJobRequisition,
  updateJobRequisition,
  type HrmJobRequisition,
} from '@/integrations/hrmApi';
import { toErrorMessage } from '@/lib/apiError';
import {
  EMPLOYMENT_TYPE_OPTIONS,
  REQUISITION_STATUS_LABEL_VI,
} from '@/lib/jobRequisitionUi';
import { useJobRequisitions } from '@/hooks/useJobRequisitions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { PermissionGate } from '@/components/auth/PermissionGate';

const createSchema = z.object({
  title: z.string().min(1, 'Nhập tiêu đề yêu cầu').max(200),
  department: z.string().min(1, 'Nhập phòng ban').max(50),
  employment_type: z.string().min(1, 'Chọn loại hình'),
});

type CreateFormValues = z.infer<typeof createSchema>;

const REQUISITION_STATUSES = ['open', 'closed', 'on_hold'] as const;

function statusBadgeVariant(status: HrmJobRequisition['status']) {
  if (status === 'open') return 'default';
  if (status === 'on_hold') return 'secondary';
  return 'outline';
}

export function JobRequisitionsTab() {
  const { currentCompanyId } = useAuth();
  const { requisitions, isLoading, fetchError, refetch, useApiMode } = useJobRequisitions();
  const [createOpen, setCreateOpen] = useState(false);
  const [editRow, setEditRow] = useState<HrmJobRequisition | null>(null);
  const [editStatus, setEditStatus] = useState<HrmJobRequisition['status']>('open');
  const [submitting, setSubmitting] = useState(false);

  const createForm = useForm<CreateFormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      title: '',
      department: '',
      employment_type: 'full_time',
    },
  });

  const onCreate = async (values: CreateFormValues) => {
    if (!currentCompanyId) {
      toast({ title: 'Lỗi', description: 'Chưa xác định phạm vi công ty.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      await createJobRequisition({
        company_id: currentCompanyId,
        title: values.title.trim(),
        department: values.department.trim(),
        employment_type: values.employment_type,
      });
      toast({ title: 'Đã tạo yêu cầu tuyển dụng', description: 'POST /recruitment/requisitions — HRM-REC-201' });
      setCreateOpen(false);
      createForm.reset();
      await refetch();
    } catch (error: unknown) {
      toast({
        title: 'Không tạo được yêu cầu',
        description: toErrorMessage(error, 'Kiểm tra HRM API và quyền truy cập.'),
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const onUpdateStatus = async () => {
    if (!editRow || !currentCompanyId) return;
    setSubmitting(true);
    try {
      await updateJobRequisition(editRow.id, editRow.company_id || currentCompanyId, { status: editStatus });
      toast({ title: 'Đã cập nhật trạng thái', description: 'PATCH/PUT /recruitment/requisitions — HRM-REC-200' });
      setEditRow(null);
      await refetch();
    } catch (error: unknown) {
      toast({
        title: 'Không cập nhật được',
        description: toErrorMessage(error, 'Kiểm tra scope company_id và quyền.'),
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (row: HrmJobRequisition) => {
    setEditRow(row);
    setEditStatus(row.status);
  };

  if (!useApiMode) {
    return (
      <Card className="p-6 text-sm text-muted-foreground">
        Chế độ API HRM chưa bật — bật <code className="font-mono text-xs">VITE_HRM_USE_API</code> trên portal để
        quản lý yêu cầu tuyển dụng (UF-HRM-12).
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Yêu cầu tuyển dụng</h2>
          <p className="text-sm text-muted-foreground">
            UC-HRM-22 — tạo / sửa trạng thái requisition qua HRM API (F5 xác minh danh sách).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => void refetch()} disabled={isLoading}>
            <RefreshCw className="mr-1.5 h-4 w-4" />
            Làm mới
          </Button>
          <PermissionGate module="recruitment" action="create">
            <Button type="button" size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" />
              Thêm yêu cầu
            </Button>
          </PermissionGate>
        </div>
      </div>

      {fetchError ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {fetchError}
        </div>
      ) : null}

      <Card>
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">Đang tải…</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tiêu đề</TableHead>
                <TableHead>Phòng/Ban</TableHead>
                <TableHead>Loại hình</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requisitions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                    Chưa có yêu cầu — bấm «Thêm yêu cầu» để tạo mới.
                  </TableCell>
                </TableRow>
              ) : (
                requisitions.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.title}</TableCell>
                    <TableCell>{row.department}</TableCell>
                    <TableCell>{row.employment_type}</TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariant(row.status)}>
                        {REQUISITION_STATUS_LABEL_VI[row.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <PermissionGate module="recruitment" action="update">
                        <Button type="button" variant="ghost" size="sm" onClick={() => openEdit(row)}>
                          <Pencil className="mr-1 h-4 w-4" />
                          Sửa
                        </Button>
                      </PermissionGate>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tạo yêu cầu tuyển dụng</DialogTitle>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onCreate)} className="space-y-4">
              <FormField
                control={createForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tiêu đề *</FormLabel>
                    <FormControl>
                      <Input placeholder="VD: Tuyển chuyên viên kinh doanh" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phòng/Ban *</FormLabel>
                    <FormControl>
                      <Input placeholder="VD: Kinh doanh miền Nam" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="employment_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loại hình *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn loại hình" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {EMPLOYMENT_TYPE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" disabled={submitting}>
                  Lưu yêu cầu
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={editRow != null} onOpenChange={(open) => !open && setEditRow(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Sửa trạng thái yêu cầu</DialogTitle>
          </DialogHeader>
          {editRow ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{editRow.title}</span>
              </p>
              <Select
                value={editStatus}
                onValueChange={(v) => setEditStatus(v as HrmJobRequisition['status'])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REQUISITION_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {REQUISITION_STATUS_LABEL_VI[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditRow(null)}>
                  Hủy
                </Button>
                <Button type="button" onClick={() => void onUpdateStatus()} disabled={submitting}>
                  Lưu thay đổi
                </Button>
              </DialogFooter>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
