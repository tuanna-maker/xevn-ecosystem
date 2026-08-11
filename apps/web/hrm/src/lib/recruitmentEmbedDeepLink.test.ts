import { describe, expect, it, vi, afterEach } from 'vitest';
import {
  mergePortalParentRecruitmentSearch,
  resolveRecruitmentEmbedSearchParams,
  resolveRecruitmentTabFromSearch,
} from './recruitmentEmbedDeepLink';

describe('recruitmentEmbedDeepLink — PO-HRM-CTR-WORKSPACE-G4-REC-ACCEPT-OFFER-CTA-FE-02', () => {
  const originalParent = window.parent;

  afterEach(() => {
    Object.defineProperty(window, 'parent', { value: originalParent, configurable: true });
    vi.restoreAllMocks();
  });

  it('returns iframe search when not embedded', () => {
    expect(mergePortalParentRecruitmentSearch('?portal=1&tab=candidates')).toBe(
      '?portal=1&tab=candidates',
    );
  });

  it('merges parent tab + candidateId when iframe search lacks them', () => {
    const parentLocation = {
      search: '?tab=candidates&candidateId=uv-offer-1',
    };
    Object.defineProperty(window, 'parent', {
      value: { location: parentLocation },
      configurable: true,
    });

    const merged = mergePortalParentRecruitmentSearch('?portal=1&companyId=main');
    const params = new URLSearchParams(merged.startsWith('?') ? merged.slice(1) : merged);
    expect(params.get('tab')).toBe('candidates');
    expect(params.get('candidateId')).toBe('uv-offer-1');
    expect(params.get('portal')).toBe('1');
  });

  it('resolveRecruitmentTabFromSearch reads merged embed params', () => {
    const parentLocation = {
      search: '?tab=candidates&candidateId=uv-offer-1',
    };
    Object.defineProperty(window, 'parent', {
      value: { location: parentLocation },
      configurable: true,
    });

    expect(resolveRecruitmentTabFromSearch('?portal=1')).toBe('candidates');
    expect(resolveRecruitmentEmbedSearchParams('?portal=1').get('candidateId')).toBe('uv-offer-1');
  });
});
