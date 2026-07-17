import { describe, expect, it } from 'vitest';
import { resolveRequisitionMutateCompanyId } from '@/lib/jobRequisitionScope';
import { buildJobRequisitionsQuery } from './useJobRequisitions';

describe('buildJobRequisitionsQuery', () => {
  it('caps list page_size at 100 for Nest DTO', () => {
    expect(buildJobRequisitionsQuery('main')).toEqual({
      company_id: 'main',
      page: 1,
      page_size: 100,
    });
  });
});

describe('resolveRequisitionMutateCompanyId (GWC-HRM-REC-UF12-01)', () => {
  it('prefers row company_id for PATCH/detail scope parity', () => {
    expect(resolveRequisitionMutateCompanyId('holding', 'main', 'main')).toBe('holding');
  });

  it('falls back to operating-unit listCompanyId', () => {
    expect(resolveRequisitionMutateCompanyId(null, 'trsport', 'main')).toBe('trsport');
  });

  it('falls back to auth company id', () => {
    expect(resolveRequisitionMutateCompanyId(undefined, '', 'main')).toBe('main');
  });
});
