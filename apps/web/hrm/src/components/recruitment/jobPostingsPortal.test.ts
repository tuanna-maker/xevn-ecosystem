import { describe, expect, it } from 'vitest';
import {
  mapRequisitionStatus,
  nestStatusMatchesFilter,
} from '@/lib/jobRequisitionUi';

describe('JobPostingsTab Nest mapping', () => {
  it('maps open requisition to active UI status', () => {
    expect(mapRequisitionStatus('open')).toBe('active');
  });

  it('filters active rows for UI status filter', () => {
    expect(nestStatusMatchesFilter('open', 'active')).toBe(true);
    expect(nestStatusMatchesFilter('closed', 'active')).toBe(false);
  });
});
