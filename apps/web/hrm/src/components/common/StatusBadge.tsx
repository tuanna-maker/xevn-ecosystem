import { cn } from '@/lib/utils';

type StatusType = 
  | 'active' | 'inactive' | 'probation' 
  | 'pending' | 'approved' | 'rejected' 
  | 'paid' | 'draft'
  | 'present' | 'late' | 'early' | 'absent' | 'leave'
  | 'open' | 'closed';

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  active: { label: 'Đang làm việc', className: 'bg-success/10 text-success' },
  inactive: { label: 'Đã nghỉ việc', className: 'bg-muted text-muted-foreground' },
  probation: { label: 'Thử việc', className: 'bg-warning/10 text-warning' },
  pending: { label: 'Chờ duyệt', className: 'bg-warning/10 text-warning' },
  approved: { label: 'Đã duyệt', className: 'bg-success/10 text-success' },
  rejected: { label: 'Từ chối', className: 'bg-destructive/10 text-destructive' },
  paid: { label: 'Đã thanh toán', className: 'bg-success/10 text-success' },
  draft: { label: 'Nháp', className: 'bg-muted text-muted-foreground' },
  present: { label: 'Có mặt', className: 'bg-success/10 text-success' },
  late: { label: 'Đi muộn', className: 'bg-warning/10 text-warning' },
  early: { label: 'Về sớm', className: 'bg-warning/10 text-warning' },
  absent: { label: 'Vắng mặt', className: 'bg-destructive/10 text-destructive' },
  leave: { label: 'Nghỉ phép', className: 'bg-primary/10 text-primary' },
  open: { label: 'Đang tuyển', className: 'bg-success/10 text-success' },
  closed: { label: 'Đã đóng', className: 'bg-muted text-muted-foreground' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, className: 'bg-muted text-muted-foreground' };

  return (
    <span className={cn('status-badge', config.className, className)}>
      {config.label}
    </span>
  );
}
