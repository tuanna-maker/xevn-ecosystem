/**
 * @CODE-MEMORY-CHANGE 2026-08-10
 * WorkItem: PO-HRM-MVP-GD1-PAY-09-CLUSTER-FE-01
 * change_mode: ADD
 * What: PATCH payroll_group_id scope on period — display-ready labels · retired 409
 * Why: AC-PAY-GROUP-PERIOD-SCOPE · J-HRM-PAY-09-03 · F-PAY-GROUP-01 §4.3
 * must_keep: PAY08 payslip lifecycle · payroll_e2e_ready=false · ≠ PAY-09 DONE · no FE resolve SoT
 */
import { useEffect, useState } from 'react';
import { Users, Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { updatePayrollPeriod } from '@/integrations/hrmApi';
import { usePayrollGroups } from '@/hooks/usePayrollGroups';
import { ApiClientError, toErrorMessage } from '@/lib/apiError';
import {
  PAY09_GROUP_HONESTY_FOOTER,
  formatPayrollGroupStatusLabelVi,
  resolvePayGroup409UserMessage,
} from '@/lib/payPay09GroupRing';
import { toast } from 'sonner';

const NONE_SCOPE = '__none__';

type Props = {
  periodId: string;
  editable: boolean;
  payrollGroupId?: string | null;
  payrollGroupCode?: string | null;
  payrollGroupNameVi?: string | null;
  companyId: string;
};

export function PayrollPeriodGroupScopePanel({
  periodId,
  editable,
  payrollGroupId,
  payrollGroupCode,
  payrollGroupNameVi,
  companyId,
}: Props) {
  const queryClient = useQueryClient();
  const { groups, isLoading: groupsLoading } = usePayrollGroups({ status: 'active' });
  const [selected, setSelected] = useState<string>(payrollGroupId ?? NONE_SCOPE);

  useEffect(() => {
    setSelected(payrollGroupId ?? NONE_SCOPE);
  }, [payrollGroupId, periodId]);

  const saveMutation = useMutation({
    mutationFn: async (nextGroupId: string | null) =>
      updatePayrollPeriod(periodId, { payroll_group_id: nextGroupId }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['payroll-batches', companyId] });
      toast.success('Đã cập nhật phạm vi nhóm cho kỳ lương');
    },
    onError: (error: unknown) => {
      if (error instanceof ApiClientError) {
        toast.error(resolvePayGroup409UserMessage(error.code, error.message));
        return;
      }
      toast.error(toErrorMessage(error, 'Không thể gắn nhóm cho kỳ'));
    },
  });

  const handleSave = () => {
    const next = selected === NONE_SCOPE ? null : selected;
    void saveMutation.mutateAsync(next);
  };

  const displayLabel =
    payrollGroupNameVi && payrollGroupCode
      ? `${payrollGroupCode} — ${payrollGroupNameVi}`
      : payrollGroupNameVi || payrollGroupCode || '—';

  return (
    <Card data-testid="pay-period-group-scope">
      <CardContent className="p-4 space-y-4">
        <div>
          <h3 className="font-medium flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Phạm vi nhóm bảng lương (kỳ)
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Tùy chọn — lọc đăng ký/chạy theo nhóm đã cấu hình. Không thay đổi số tiền phiếu lương (PAY-06/08).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted-foreground">Đang gắn:</span>
          <Badge variant="secondary">{displayLabel}</Badge>
        </div>

        {editable ? (
          <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
            <div className="flex-1 min-w-[200px]">
              <Select value={selected} onValueChange={setSelected} disabled={groupsLoading || saveMutation.isPending}>
                <SelectTrigger data-testid="pay-period-group-scope-select">
                  <SelectValue placeholder={groupsLoading ? 'Đang tải nhóm…' : 'Chọn nhóm (hoặc toàn công ty)'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_SCOPE}>Không giới hạn nhóm</SelectItem>
                  {groups.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.code} — {g.name_vi} ({formatPayrollGroupStatusLabelVi(g.status)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              onClick={handleSave}
              disabled={saveMutation.isPending || groupsLoading}
              data-testid="pay-period-group-scope-save"
            >
              {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Lưu phạm vi'}
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Kỳ đã khóa/duyệt — chỉ xem phạm vi nhóm.</p>
        )}

        <p className="text-xs text-muted-foreground" data-testid="pay09-group-honesty-footer">
          {PAY09_GROUP_HONESTY_FOOTER}
        </p>
      </CardContent>
    </Card>
  );
}
