import { describe, expect, it } from 'vitest';
import {
  mapRequisitionStatus,
  nestStatusMatchesFilter,
  REQUISITION_STATUS_LABEL_VI,
} from '@/lib/jobRequisitionUi';

describe('jobRequisitionUi', () => {
  it('maps open requisition to active UI status', () => {
    expect(mapRequisitionStatus('open')).toBe('active');
  });

  it('filters active rows for UI status filter', () => {
    expect(nestStatusMatchesFilter('open', 'active')).toBe(true);
    expect(nestStatusMatchesFilter('closed', 'active')).toBe(false);
  });

  it('labels Vietnamese status for UF-HRM-12 display', () => {
    expect(REQUISITION_STATUS_LABEL_VI.open).toBe('Đang tuyển');
    expect(REQUISITION_STATUS_LABEL_VI.on_hold).toBe('Tạm dừng');
  });
});
