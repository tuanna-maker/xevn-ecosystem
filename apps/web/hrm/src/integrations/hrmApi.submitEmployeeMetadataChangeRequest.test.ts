import { afterEach, describe, expect, it, vi } from 'vitest';

const getPortalAccessToken = vi.fn();
const getPortalSessionUser = vi.fn();
const waitForPortalAccessToken = vi.fn();

vi.mock('@/lib/portalAuthBridge', () => ({
  getPortalAccessToken: () => getPortalAccessToken(),
  getPortalSessionUser: () => getPortalSessionUser(),
  waitForPortalAccessToken: (...args: unknown[]) => waitForPortalAccessToken(...args),
  hasPortalSession: () => true,
}));

import { submitEmployeeMetadataChangeRequest } from './hrmApi';

describe('submitEmployeeMetadataChangeRequest', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    getPortalAccessToken.mockReset();
    getPortalSessionUser.mockReset();
    waitForPortalAccessToken.mockReset();
  });

  it('omits current_value and wraps plain requested_value for Nest @IsJSON', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({
        success: true,
        code: 'HRM-META-201',
        message: 'Created',
        data: { id: 'cr-1', status: 'pending' },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('crypto', { randomUUID: () => 'rid-meta-1' } as Crypto);
    getPortalAccessToken.mockReturnValue('portal-token');
    getPortalSessionUser.mockReturnValue({ userId: 'user-1' });

    await submitEmployeeMetadataChangeRequest({
      company_id: 'main',
      employee_id: '10000000-0000-4000-8000-000000000099',
      field_key: 'job_title',
      requested_value: 'Chuyên viên QA',
      reason: 'Yêu cầu thay đổi metadata từ Cài đặt HRM',
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const options = fetchMock.mock.calls[0]?.[1] as RequestInit | undefined;
    const parsed = JSON.parse(String(options?.body)) as Record<string, unknown>;
    expect(parsed).not.toHaveProperty('current_value');
    expect(parsed.requested_value).toBe('{"value":"Chuyên viên QA"}');
    expect(parsed.company_id).toBe('10000000-0000-4000-8000-000000000001');
  });

  it('includes serialized current_value when provided', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({
        success: true,
        code: 'HRM-META-201',
        message: 'Created',
        data: { id: 'cr-2', status: 'pending' },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('crypto', { randomUUID: () => 'rid-meta-2' } as Crypto);
    getPortalAccessToken.mockReturnValue('portal-token');
    getPortalSessionUser.mockReturnValue({ userId: 'user-1' });

    await submitEmployeeMetadataChangeRequest({
      company_id: 'main',
      employee_id: '10000000-0000-4000-8000-000000000099',
      field_key: 'job_title',
      current_value: { code: 'OLD' },
      requested_value: { code: 'NEW' },
    });

    const options = fetchMock.mock.calls[0]?.[1] as RequestInit | undefined;
    const parsed = JSON.parse(String(options?.body)) as Record<string, unknown>;
    expect(parsed.current_value).toBe('{"code":"OLD"}');
    expect(parsed.requested_value).toBe('{"code":"NEW"}');
  });
});
