import { describe, expect, it } from 'vitest';
import type { HrmJobRequisition } from '@/integrations/hrmApi';

function mapRequisitionStatus(status: HrmJobRequisition['status']): string {
  if (status === 'open') return 'active';
  if (status === 'on_hold') return 'paused';
  return 'closed';
}

function nestStatusMatchesFilter(
  nestStatus: HrmJobRequisition['status'],
  filter: string,
): boolean {
  return mapRequisitionStatus(nestStatus) === filter;
}

describe('JobPostingsTab Nest mapping', () => {
  it('maps open requisition to active UI status', () => {
    expect(mapRequisitionStatus('open')).toBe('active');
  });

  it('filters active rows for UI status filter', () => {
    expect(nestStatusMatchesFilter('open', 'active')).toBe(true);
    expect(nestStatusMatchesFilter('closed', 'active')).toBe(false);
  });
});
