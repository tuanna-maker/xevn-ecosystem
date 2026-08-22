import { describe, expect, it } from 'vitest';
import { resolveHrmFloatingPortalScope } from './hrmFloatingPortal';

describe('resolveHrmFloatingPortalScope', () => {
  it('respects explicit portalScope', () => {
    expect(resolveHrmFloatingPortalScope('iframe', 'parent')).toBe('iframe');
    expect(resolveHrmFloatingPortalScope('parent', 'iframe')).toBe('parent');
  });

  it('follows overlay scope when explicit omitted', () => {
    expect(resolveHrmFloatingPortalScope(undefined, 'iframe')).toBe('iframe');
    expect(resolveHrmFloatingPortalScope(undefined, 'parent')).toBe('parent');
  });

  it('defaults to iframe when no dialog overlay context (CC embed list filters)', () => {
    expect(resolveHrmFloatingPortalScope(undefined, null)).toBe('iframe');
  });
});
