import type { IdentityScopeContext } from './identityScope';

let activeScope: IdentityScopeContext | null = null;

export function setActiveTenantScope(scope: IdentityScopeContext | null): void {
  activeScope = scope;
}

export function getActiveTenantScope(): IdentityScopeContext | null {
  return activeScope;
}
