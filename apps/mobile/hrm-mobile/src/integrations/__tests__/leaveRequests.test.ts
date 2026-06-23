import { describe, expect, it } from 'vitest';
import { tryCancelLeaveRequest } from '../leaveRequests';

describe('leaveRequests integration', () => {
  it('cancel is fail-closed without DELETE API', async () => {
    const result = await tryCancelLeaveRequest(
      { baseUrl: 'http://127.0.0.1:28001', accessToken: 't', companyUuid: 'u' },
      'req-1',
    );
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/chưa hỗ trợ hủy/i);
  });
});
