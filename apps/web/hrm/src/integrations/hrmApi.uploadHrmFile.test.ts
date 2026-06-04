import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiClientError } from '@/lib/apiError';

const getPortalAccessToken = vi.fn();
const getPortalSessionUser = vi.fn();
const waitForPortalAccessToken = vi.fn();

vi.mock('@/lib/portalAuthBridge', () => ({
  getPortalAccessToken: () => getPortalAccessToken(),
  getPortalSessionUser: () => getPortalSessionUser(),
  waitForPortalAccessToken: (...args: unknown[]) => waitForPortalAccessToken(...args),
  hasPortalSession: () => true,
}));

import { uploadHrmFile } from './hrmApi';

describe('uploadHrmFile', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    history.replaceState(null, '', '/');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    getPortalAccessToken.mockReset();
    getPortalSessionUser.mockReset();
    waitForPortalAccessToken.mockReset();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('appends company_id=main from portal JWT for group CEO scope (P1-RESID-C01)', async () => {
    const payload = btoa(JSON.stringify({ company_id: 'main', tenant_id: 'xevn' }));
    getPortalAccessToken.mockReturnValue(`hdr.${payload}.sig`);
    getPortalSessionUser.mockReturnValue({ userId: 'ceo-1' });

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({
        success: true,
        code: 'HRM-FILE-201',
        message: 'File uploaded',
        data: { url: '/api/hrm/files/main/upload-1.pdf', company_id: 'main' },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('crypto', { randomUUID: () => 'rid-upload-main' } as Crypto);

    const file = new File(['resume'], 'resume.pdf', { type: 'application/pdf' });
    const url = await uploadHrmFile(file, 'employee-resume');

    expect(url).toContain('/api/hrm/files/main/upload-1.pdf');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const requestUrl = String(fetchMock.mock.calls[0]?.[0]);
    expect(requestUrl).toContain('company_id=main');
    expect(requestUrl).toContain('feature=employee-resume');
    const options = fetchMock.mock.calls[0]?.[1] as RequestInit | undefined;
    const headers = (options?.headers ?? {}) as Record<string, string>;
    expect(headers['x-company-id']).toBe('main');
    expect(headers.Authorization).toBe(`Bearer hdr.${payload}.sig`);
  });

  it('appends member company_id from stored scope (P1-RESID-C01)', async () => {
    getPortalAccessToken.mockReturnValue(null);
    getPortalSessionUser.mockReturnValue(null);
    localStorage.setItem('hrm_current_company_id', 'logistics');
    localStorage.setItem('hrm_current_tenant_id', 'xevn');

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({
        success: true,
        code: 'HRM-FILE-201',
        message: 'File uploaded',
        data: { url: '/api/hrm/files/logistics/avatar.png', company_id: 'logistics' },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('crypto', { randomUUID: () => 'rid-upload-member' } as Crypto);

    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' });
    await uploadHrmFile(file, 'candidate-avatar');

    const requestUrl = String(fetchMock.mock.calls[0]?.[0]);
    expect(requestUrl).toContain('company_id=logistics');
    const options = fetchMock.mock.calls[0]?.[1] as RequestInit | undefined;
    const headers = (options?.headers ?? {}) as Record<string, string>;
    expect(headers['x-company-id']).toBe('logistics');
  });

  it('coerces holding alias to main on upload query', async () => {
    getPortalAccessToken.mockReturnValue(null);
    localStorage.setItem('hrm_current_company_id', 'holding');

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({
        success: true,
        code: 'HRM-FILE-201',
        message: 'File uploaded',
        data: { url: '/api/hrm/files/main/doc.pdf' },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('crypto', { randomUUID: () => 'rid-upload-coerce' } as Crypto);

    await uploadHrmFile(new File(['x'], 'doc.pdf'), 'contracts-file');

    const requestUrl = String(fetchMock.mock.calls[0]?.[0]);
    expect(requestUrl).toContain('company_id=main');
    expect(requestUrl).not.toContain('company_id=holding');
  });

  it('throws HRM-FILE-400 when operating company scope is missing', async () => {
    getPortalAccessToken.mockReturnValue(null);
    getPortalSessionUser.mockReturnValue(null);

    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(
      uploadHrmFile(new File(['x'], 'x.pdf'), 'employee-resume'),
    ).rejects.toMatchObject({
      code: 'HRM-FILE-400',
    } satisfies Partial<ApiClientError>);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
