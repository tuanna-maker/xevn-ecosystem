// @CODE-MEMORY WorkItem: XBOS-TENANT-PROVISION-FE-01
// Badge phân hệ: HRM / Logistics

import type { TenantModule } from '@/integrations/xbosApi';

const MODULE_CONFIG: Record<TenantModule, { label: string; className: string }> = {
  hrm: {
    label: 'HRM',
    className: 'bg-xevn-primary/10 text-xevn-primary border-xevn-primary/20',
  },
  logistics: {
    label: 'Logistics',
    className: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  },
};

type Props = {
  module: TenantModule;
};

export function TenantModuleBadge({ module }: Props) {
  const config = MODULE_CONFIG[module] ?? {
    label: module,
    className: 'bg-gray-100 text-gray-600 border-gray-200',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold tracking-wide ${config.className}`}
    >
      {config.label}
    </span>
  );
}
