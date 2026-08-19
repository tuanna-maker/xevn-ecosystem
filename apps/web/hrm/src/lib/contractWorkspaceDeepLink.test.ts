/**
 * PO-HRM-CTR-WORKSPACE-G4-EDIT-DEEPLINK-FE-01
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  applyIframeWorkspaceParamsToParent,
  mergePortalParentWorkspaceSearch,
  parseContractWorkspaceSearch,
  resolveContractWorkspaceSearch,
} from './contractWorkspaceDeepLink';

describe('contractWorkspaceDeepLink — CC embed parent merge', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('keeps iframe search when workspace mode already present', () => {
    const search = '?portal=1&companyId=main&workspace=edit&contractId=ctr-1';
    expect(mergePortalParentWorkspaceSearch(search)).toBe(search);
  });

  it('merges workspace params from parent portal when iframe lacks them', () => {
    const parent = {
      location: {
        search:
          '?portal=1&tenantId=xevn&companyId=main&workspace=edit&contractId=aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2',
      },
    };
    const originalParent = window.parent;
    Object.defineProperty(window, 'parent', { value: parent, configurable: true });
    try {
      const merged = mergePortalParentWorkspaceSearch('?portal=1&tenantId=xevn&companyId=main');
      const parsed = parseContractWorkspaceSearch(merged);
      expect(parsed.mode).toBe('edit');
      expect(parsed.contractId).toBe('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2');
    } finally {
      Object.defineProperty(window, 'parent', { value: originalParent, configurable: true });
    }
  });

  it('resolveContractWorkspaceSearch parses create prefill from iframe search', () => {
    const parsed = resolveContractWorkspaceSearch(
      '?workspace=create&employee_id=emp-1&subject_type=employee',
    );
    expect(parsed.mode).toBe('create');
    expect(parsed.prefill.employee_id).toBe('emp-1');
  });

  it('does not merge when not embedded (parent === self)', () => {
    const iframeOnly = '?portal=1&companyId=main';
    expect(mergePortalParentWorkspaceSearch(iframeOnly)).toBe(iframeOnly);
  });

  it('applyIframeWorkspaceParamsToParent — profile create lock on contracts route', () => {
    const parentParams = new URLSearchParams('tab=contract');
    applyIframeWorkspaceParamsToParent(
      parentParams,
      '?portal=1&workspace=create&employee_id=emp-1&subject_type=employee&lock_subject_employee=1',
      true,
    );
    expect(parentParams.get('workspace')).toBe('create');
    expect(parentParams.get('employee_id')).toBe('emp-1');
    expect(parentParams.get('lock_subject_employee')).toBe('1');
    expect(parentParams.get('tab')).toBe('contract');
  });

  it('applyIframeWorkspaceParamsToParent — clears workspace keys off contracts route', () => {
    const parentParams = new URLSearchParams(
      'tab=contract&workspace=create&employee_id=emp-1&lock_subject_employee=1',
    );
    applyIframeWorkspaceParamsToParent(
      parentParams,
      '?portal=1&workspace=create&employee_id=emp-1&lock_subject_employee=1',
      false,
    );
    expect(parentParams.get('workspace')).toBeNull();
    expect(parentParams.get('employee_id')).toBeNull();
    expect(parentParams.get('lock_subject_employee')).toBeNull();
    expect(parentParams.get('tab')).toBe('contract');
  });
});
