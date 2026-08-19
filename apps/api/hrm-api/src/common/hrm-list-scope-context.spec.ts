import { toHrmListScopeContext } from './hrm-list-scope-context';

/** XHRM-REC-WF-BE-02 — D-XHRM-REC-WF-SUBMIT-SCOPE regression */
describe('toHrmListScopeContext', () => {
  it('returns trimmed tenantId for non-empty string', () => {
    expect(toHrmListScopeContext('  xevn  ')).toEqual({ tenantId: 'xevn' });
  });

  it('returns undefined for empty / whitespace / undefined', () => {
    expect(toHrmListScopeContext(undefined)).toBeUndefined();
    expect(toHrmListScopeContext('')).toBeUndefined();
    expect(toHrmListScopeContext('   ')).toBeUndefined();
  });

  it('does not throw when Nest headers bag is passed by mistake (no .trim)', () => {
    const headersBag = { 'x-tenant-id': 'xevn', authorization: 'Bearer x' } as unknown as string;
    expect(() => toHrmListScopeContext(headersBag)).not.toThrow();
    expect(toHrmListScopeContext(headersBag)).toBeUndefined();
  });
});
