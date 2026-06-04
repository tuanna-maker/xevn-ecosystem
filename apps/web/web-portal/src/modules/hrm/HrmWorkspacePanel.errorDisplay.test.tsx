import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GlobalFilterProvider } from '../../contexts/GlobalFilterContext';
import { HrmWorkspacePanel } from './HrmWorkspacePanel';
import { minimalScopeJwt } from '../../test/jwtTestUtils';

vi.mock('../../contexts/AuthContext', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../contexts/AuthContext')>();
  return {
    ...actual,
    useAuth: () => ({
      user: { userId: 'u-test', displayName: 'QA User', email: 'ceo@xe.vn' },
      accessToken: 'test-token',
      memberships: [
        {
          tenantId: 'xevn',
          companyId: 'main',
          companyName: 'Main',
          roleCode: 'group_ceo',
        },
      ],
      loading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    }),
  };
});

vi.mock('../../integrations/tenantScopeApi', () => ({
  fetchAccessibleTenants: vi.fn().mockResolvedValue([
    {
      tenantId: 'xevn',
      companyId: 'main',
      companyName: 'Main',
      roleCode: 'group_ceo',
    },
  ]),
  fetchGroupMemberUnitsForCommandCenter: vi.fn().mockResolvedValue([]),
}));

function renderDashboard() {
  return render(
    <MemoryRouter>
      <GlobalFilterProvider>
        <HrmWorkspacePanel view="dashboard" />
      </GlobalFilterProvider>
    </MemoryRouter>,
  );
}

describe('HrmWorkspacePanel deterministic error UX', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_SERVICE_JWT_TOKEN', minimalScopeJwt('tenant-ui', 'lgts'));
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.reject(new Error('simulated offline')),
      ),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('shows NETWORK_ERROR and details when metadata queue fetch fails', async () => {
    renderDashboard();
    await waitFor(
      () => {
        expect(screen.getByText(/Không tải được hàng chờ metadata/)).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
    expect(screen.getByText(/\[NETWORK_ERROR\]/)).toBeInTheDocument();
    expect(screen.getByText(/simulated offline/)).toBeInTheDocument();
  });

  it('shows backend code and details on HTTP error envelope', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          success: false,
          code: 'HRM-META-403',
          message: 'Denied',
          details: { rule: 'approval' },
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } },
      ),
    );
    renderDashboard();
    await waitFor(
      () => {
        expect(screen.getByText(/\[HRM-META-403\]/)).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
    expect(screen.getByText(/"rule":"approval"/)).toBeInTheDocument();
  });

  it('shows SCOPE_TENANT_REQUIRED when JWT scope is missing', async () => {
    vi.stubEnv('VITE_STRICT_IDENTITY', 'true');
    vi.stubEnv('VITE_SERVICE_JWT_TOKEN', '');
    vi.mocked(fetch).mockImplementation(() => Promise.reject(new Error('should not run')));
    renderDashboard();
    await waitFor(
      () => {
        expect(screen.getByText(/\[SCOPE_TENANT_REQUIRED\]/)).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
  });
});
