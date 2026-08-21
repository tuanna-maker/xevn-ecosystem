import type { HrmListScopeContext } from './hrm-list-scope';

/**
 * Portal proxy often sends `x-tenant-id` when service JWT is absent or unsigned in dev/pilot.
 * @CODE-MEMORY-CHANGE 2026-07-19 XHRM-REC-WF-BE-02
 * Guard typeof string — Nest `@Headers()` bag has no `.trim` (D-XHRM-REC-WF-SUBMIT-SCOPE → 500).
 * Call sites must pass `tenantId` from `@Headers('x-tenant-id')`, never the headers object.
 */
export function toHrmListScopeContext(
  tenantId?: string,
): HrmListScopeContext | undefined {
  if (typeof tenantId !== 'string') {
    return undefined;
  }
  const trimmed = tenantId.trim();
  return trimmed ? { tenantId: trimmed } : undefined;
}
