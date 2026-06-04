import type { HrmListScopeContext } from './hrm-list-scope';

/** Portal proxy often sends `x-tenant-id` when service JWT is absent or unsigned in dev/pilot. */
export function toHrmListScopeContext(tenantId?: string): HrmListScopeContext | undefined {
  const trimmed = tenantId?.trim();
  return trimmed ? { tenantId: trimmed } : undefined;
}
