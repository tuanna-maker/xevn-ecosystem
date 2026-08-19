import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createPayrollPeriodTimesheetBind,
  listPayrollPeriodTimesheetBinds,
} from '@/integrations/hrmApi';
import { ApiClientError } from '@/lib/apiError';
import { resolvePayAtt412UserMessage } from '@/lib/payPay01BindRing';

export const PAYROLL_TIMESHEET_BINDS_QUERY_KEY = 'payroll-timesheet-binds' as const;

export function usePayrollPeriodTimesheetBinds(periodId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: [PAYROLL_TIMESHEET_BINDS_QUERY_KEY, periodId],
    queryFn: () => listPayrollPeriodTimesheetBinds(periodId!),
    enabled: Boolean(periodId && enabled),
    staleTime: 15_000,
  });
}

export function useCreatePayrollPeriodTimesheetBind(periodId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (timesheetHeaderId: string) => {
      if (!periodId) throw new Error('Thiếu kỳ lương');
      return createPayrollPeriodTimesheetBind(periodId, { timesheetHeaderId });
    },
    onSuccess: (row) => {
      queryClient.invalidateQueries({ queryKey: [PAYROLL_TIMESHEET_BINDS_QUERY_KEY, periodId] });
      queryClient.invalidateQueries({ queryKey: ['payroll-eligibility', periodId] });
      toast.success('Đã gắn bảng chấm công với kỳ lương', {
        description:
          row.timesheetStatus === 'closed'
            ? `${row.timesheetDisplayLabel} · Đã chốt`
            : row.timesheetDisplayLabel,
      });
    },
    onError: (error: unknown) => {
      if (error instanceof ApiClientError) {
        const message = resolvePayAtt412UserMessage(error.code, error.message);
        toast.error(message, { description: error.code });
        return;
      }
      toast.error('Không gắn được bảng chấm công — thử lại sau.');
    },
  });
}
