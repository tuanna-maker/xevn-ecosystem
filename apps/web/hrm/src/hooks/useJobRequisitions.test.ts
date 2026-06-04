import { describe, expect, it } from 'vitest';
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
