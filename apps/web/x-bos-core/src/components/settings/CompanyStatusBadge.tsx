// @CODE-MEMORY WorkItem: XBOS-TENANT-PROVISION-FE-01
// Badge hiển thị trạng thái tenant — tiếng Việt, không dùng jargon dev

import type { TenantStatus } from '@/integrations/xbosApi';

const STATUS_CONFIG: Record<
  TenantStatus,
  { label: string; className: string }
> = {
  provisioning: {
    label: 'Đang cấp phép',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  active: {
    label: 'Hoạt động',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  suspended: {
    label: 'Tạm ngưng',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  archived: {
    label: 'Lưu trữ',
    className: 'bg-gray-100 text-gray-500 border-gray-200',
  },
};

type Props = {
  status: TenantStatus;
};

export function CompanyStatusBadge({ status }: Props) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    className: 'bg-gray-100 text-gray-500 border-gray-200',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
