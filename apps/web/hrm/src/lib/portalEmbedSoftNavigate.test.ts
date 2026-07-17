import { describe, expect, it, vi } from 'vitest';
import { applyPortalEmbedSoftNavigate } from './portalEmbedSoftNavigate';

describe('applyPortalEmbedSoftNavigate', () => {
  it('flushSync-navigates to pathname while preserving embed search', () => {
    const navigate = vi.fn();
    applyPortalEmbedSoftNavigate(navigate, '/employees', {
      pathname: '/attendance',
      search: '?portal=1&companyId=main&_v=1784270836056',
    });

    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith(
      {
        pathname: '/employees',
        search: '?portal=1&companyId=main&_v=1784270836056',
      },
      { flushSync: true },
    );
  });

  it('normalizes path without leading slash', () => {
    const navigate = vi.fn();
    applyPortalEmbedSoftNavigate(navigate, 'contracts', {
      pathname: '/attendance',
      search: '?portal=1&companyId=main',
    });

    expect(navigate).toHaveBeenCalledWith(
      {
        pathname: '/contracts',
        search: '?portal=1&companyId=main',
      },
      { flushSync: true },
    );
  });

  it('no-ops when pathname is already current (avoids remount churn)', () => {
    const navigate = vi.fn();
    applyPortalEmbedSoftNavigate(navigate, '/employees', {
      pathname: '/employees',
      search: '?portal=1&companyId=main',
    });
    expect(navigate).not.toHaveBeenCalled();
  });

  it('still navigates when leaving attendance to employees (stall repro path)', () => {
    const navigate = vi.fn();
    applyPortalEmbedSoftNavigate(navigate, '/employees', {
      pathname: '/attendance',
      search: '?portal=1&tenantId=xevn&companyId=main&_v=1',
    });
    applyPortalEmbedSoftNavigate(navigate, '/contracts', {
      pathname: '/attendance',
      search: '?portal=1&tenantId=xevn&companyId=main&_v=1',
    });

    expect(navigate).toHaveBeenNthCalledWith(
      1,
      {
        pathname: '/employees',
        search: '?portal=1&tenantId=xevn&companyId=main&_v=1',
      },
      { flushSync: true },
    );
    expect(navigate).toHaveBeenNthCalledWith(
      2,
      {
        pathname: '/contracts',
        search: '?portal=1&tenantId=xevn&companyId=main&_v=1',
      },
      { flushSync: true },
    );
  });
});
