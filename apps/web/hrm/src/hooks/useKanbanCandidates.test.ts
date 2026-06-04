import { describe, expect, it } from 'vitest';

describe('useKanbanCandidates portal contract', () => {
  it('documents page_size cap via shared HRM_API_MAX_PAGE_SIZE', async () => {
    const { HRM_API_MAX_PAGE_SIZE } = await import('@/lib/hrmDataMode');
    expect(HRM_API_MAX_PAGE_SIZE).toBe(100);
  });
});
