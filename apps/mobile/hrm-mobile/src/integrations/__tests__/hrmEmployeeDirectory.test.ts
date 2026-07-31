import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchEmployeeDirectoryDetail } from '../hrmEmployeeDirectory';

const hrmRequest = vi.fn();

vi.mock('../hrmApiClient', () => ({
  hrmRequest: (...args: unknown[]) => hrmRequest(...args),
}));

vi.mock('../mapApiError', () => ({
  formatHrmError: (res: { message?: string }) => res.message ?? 'API error',
}));

const auth = {
  baseUrl: 'http://127.0.0.1:28001',
  accessToken: 'tok',
  companyId: 'holding',
  companyUuid: 'uuid-holding',
};

describe('fetchEmployeeDirectoryDetail', () => {
  beforeEach(() => {
    hrmRequest.mockReset();
  });

  it('calls GET /employees/:id with view=directory and include_attendance_today', async () => {
    hrmRequest.mockResolvedValueOnce({
      ok: true,
      data: {
        id: 'emp-1',
        employee_code: 'NV0002',
        full_name: 'UAT NV0002',
        job_title_key: 'engineer',
        department: 'Váº­n táº£i',
        avatar_url: null,
        status: 'active',
        manager_id: null,
        phone_number: '0901234567',
        email: 'u***@xe.vn',
        attendance_today: { checked_in: true, check_in_at: '2026-06-09T08:00:00Z', status: 'present' },
      },
    });

    const result = await fetchEmployeeDirectoryDetail(auth, 'emp-1');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.row.full_name).toBe('UAT NV0002');
      expect(result.row.department).toBe('Váº­n táº£i');
    }
    expect(hrmRequest).toHaveBeenCalledTimes(1);
    const [, path] = hrmRequest.mock.calls[0];
    expect(path).toContain('/employees/emp-1?');
    expect(path).toContain('view=directory');
    expect(path).toContain('include_attendance_today=true');
    expect(path).toContain('company_id=holding');
  });

  it('returns message when API fails', async () => {
    hrmRequest.mockResolvedValueOnce({
      ok: false,
      code: 'HRM-404',
      message: 'KhĂ´ng tĂ¬m tháº¥y nhĂ¢n viĂªn.',
      requestId: 'r1',
    });

    const result = await fetchEmployeeDirectoryDetail(auth, 'missing');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toContain('KhĂ´ng tĂ¬m tháº¥y');
    }
  });

  it('rejects empty employee id', async () => {
    const result = await fetchEmployeeDirectoryDetail(auth, '  ');
    expect(result.ok).toBe(false);
    expect(hrmRequest).not.toHaveBeenCalled();
  });
});
