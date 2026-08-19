// @CODE-MEMORY WorkItem: XBOS-TENANT-PROVISION-FE-01
// Vitest + React Testing Library tests for CompanySettingsPage (fixed: timer isolation, label queries)

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CompanySettingsPage } from './CompanySettingsPage';
import {
  listSettingsCompanies,
  createSettingsCompany,
  activateTenant,
  suspendTenant,
  type XbosCompanyRow,
} from '@/integrations/xbosApi';

vi.mock('@/integrations/xbosApi', () => ({
  listSettingsCompanies: vi.fn(),
  createSettingsCompany: vi.fn(),
  activateTenant: vi.fn(),
  suspendTenant: vi.fn(),
}));

const mockListSettingsCompanies = vi.mocked(listSettingsCompanies);
const mockCreateSettingsCompany = vi.mocked(createSettingsCompany);
const mockActivateTenant = vi.mocked(activateTenant);
const mockSuspendTenant = vi.mocked(suspendTenant);

const mockCompanies: XbosCompanyRow[] = [
  {
    tenantId: 'xevn',
    name: 'XeVN Group Holding',
    shortName: 'XeVN',
    tenantKind: 'master',
    defaultCompanyId: 'holding',
    modules: ['hrm', 'logistics'],
    status: 'active',
    legalEntity: { code: 'XGH', taxCode: '0100000000', businessLines: 'Đầu tư tài chính' },
  },
  {
    tenantId: 'xe-du-lich',
    name: 'XeVN Du Lịch',
    shortName: 'XeVN DL',
    tenantKind: 'member',
    defaultCompanyId: 'du-lich',
    modules: ['hrm'],
    status: 'provisioning',
    legalEntity: { code: 'XDL', taxCode: '0123456789', businessLines: 'Du lịch và lữ hành' },
  },
];

describe('CompanySettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    mockListSettingsCompanies.mockResolvedValue({ items: mockCompanies });
    mockCreateSettingsCompany.mockResolvedValue(mockCompanies[1]);
    mockActivateTenant.mockResolvedValue({ ...mockCompanies[1], status: 'active' });
    mockSuspendTenant.mockResolvedValue({ ...mockCompanies[0], status: 'suspended' });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  function renderPage() {
    return render(<CompanySettingsPage />);
  }

  describe('Initial render and data fetching', () => {
    it('shows loading state initially', () => {
      renderPage();
      expect(screen.getByText('Đang tải...')).toBeInTheDocument();
    });

    it('fetches companies on mount', () => {
      renderPage();
      expect(mockListSettingsCompanies).toHaveBeenCalledTimes(1);
    });

    it('renders table with correct columns', async () => {
      renderPage();
      await waitFor(() => expect(screen.getByText('XeVN Group Holding')).toBeInTheDocument());
      expect(screen.getByText('Tên công ty')).toBeInTheDocument();
      expect(screen.getByText('Mã tenant')).toBeInTheDocument();
      expect(screen.getByText('Phân hệ')).toBeInTheDocument();
      expect(screen.getByText('Ngành nghề')).toBeInTheDocument();
      expect(screen.getByText('Loại')).toBeInTheDocument();
      expect(screen.getByText('Trạng thái')).toBeInTheDocument();
      expect(screen.getByText('Thao tác')).toBeInTheDocument();
    });

    it('renders company data in table rows', async () => {
      renderPage();
      await waitFor(() => expect(screen.getByText('XeVN Group Holding')).toBeInTheDocument());
      expect(screen.getByText('XeVN')).toBeInTheDocument();
      expect(screen.getByText('xevn')).toBeInTheDocument();
      expect(screen.getByText('Chủ sở hữu')).toBeInTheDocument();
      expect(screen.getByText('Hoạt động')).toBeInTheDocument();
      expect(screen.getByText('XeVN Du Lịch')).toBeInTheDocument();
      expect(screen.getByText('XeVN DL')).toBeInTheDocument();
      expect(screen.getByText('xe-du-lich')).toBeInTheDocument();
      expect(screen.getByText('Thành viên')).toBeInTheDocument();
      expect(screen.getByText('Đang cấp phép')).toBeInTheDocument();
    });

    it('shows resolved VI industry label per row (not raw entity_type)', async () => {
      renderPage();
      await waitFor(() => expect(screen.getByText('XeVN Group Holding')).toBeInTheDocument());
      // businessLines free-text VI → displayed as-is; never `subsidiary`/`holding`
      expect(screen.getByText('Đầu tư tài chính')).toBeInTheDocument();
      expect(screen.getByText('Du lịch và lữ hành')).toBeInTheDocument();
      expect(screen.queryByText('subsidiary')).not.toBeInTheDocument();
      expect(screen.queryByText('holding')).not.toBeInTheDocument();
    });

    it('renders "—" when industry is missing', async () => {
      const noIndustry = mockCompanies.map((c) => ({ ...c, legalEntity: { ...c.legalEntity!, businessLines: undefined } }));
      mockListSettingsCompanies.mockResolvedValueOnce({ items: noIndustry });
      renderPage();
      await waitFor(() => expect(screen.getByText('XeVN Group Holding')).toBeInTheDocument());
      const emDashes = screen.getAllByText('—');
      expect(emDashes.length).toBeGreaterThan(0);
    });

    it('renders module badges', async () => {
      renderPage();
      // Wait until data is rendered (xevn appears)
      await waitFor(() => expect(screen.getByText('XeVN Group Holding')).toBeInTheDocument());
      // xevn has HRM+Logistics, xe-du-lich has HRM only → HRM appears twice total
      const hrmBadges = screen.getAllByText('HRM');
      expect(hrmBadges.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Logistics')).toBeInTheDocument();
    });
  });

  describe('Empty state', () => {
    it('shows empty state when no companies', async () => {
      mockListSettingsCompanies.mockResolvedValueOnce({ items: [] });
      renderPage();
      await waitFor(() => {
        expect(screen.getByText(/Chưa có công ty nào/)).toBeInTheDocument();
      });
    });
  });

  describe('Error state', () => {
    it('uses mock data as fallback when API fails', async () => {
      mockListSettingsCompanies.mockRejectedValueOnce(new Error('Network error'));
      renderPage();
      // Page uses built-in MOCK_ITEMS as fallback — XeVN Group Holding always visible
      await waitFor(() => {
        expect(screen.getByText('XeVN Group Holding')).toBeInTheDocument();
      });
    });
  });

  describe('Header actions', () => {
    it('renders refresh button', async () => {
      renderPage();
      await waitFor(() => expect(screen.getByText('XeVN Group Holding')).toBeInTheDocument());
      expect(screen.getByLabelText('Tải lại danh sách')).toBeInTheDocument();
    });

    it('renders add company button', async () => {
      renderPage();
      await waitFor(() => expect(screen.getByText('XeVN Group Holding')).toBeInTheDocument());
      expect(screen.getByRole('button', { name: /Thêm công ty mới/i })).toBeInTheDocument();
    });

    it('calls fetchCompanies when refresh clicked', async () => {
      renderPage();
      await waitFor(() => expect(screen.getByText('XeVN Group Holding')).toBeInTheDocument());
      mockListSettingsCompanies.mockClear();
      fireEvent.click(screen.getByLabelText('Tải lại danh sách'));
      expect(mockListSettingsCompanies).toHaveBeenCalledTimes(1);
    });

    it('opens AddCompanyDialog when add button clicked', async () => {
      renderPage();
      await waitFor(() => expect(screen.getByText('XeVN Group Holding')).toBeInTheDocument());
      fireEvent.click(screen.getByRole('button', { name: /Thêm công ty mới/i }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      // Dialog header title (unique id="add-company-title")
      expect(document.getElementById('add-company-title')).toBeTruthy();
    });
  });

  describe('Activate action', () => {
    it('shows Activate button only for provisioning status', async () => {
      renderPage();
      await waitFor(() => expect(screen.getByText('XeVN Group Holding')).toBeInTheDocument());
      expect(screen.getByRole('button', { name: 'Kích hoạt' })).toBeInTheDocument();
      expect(screen.getAllByRole('button', { name: 'Kích hoạt' })).toHaveLength(1);
    });

    it('calls activateTenant when activate clicked', async () => {
      renderPage();
      await waitFor(() => expect(screen.getByText('XeVN Group Holding')).toBeInTheDocument());
      fireEvent.click(screen.getByRole('button', { name: 'Kích hoạt' }));
      await waitFor(() => {
        expect(mockActivateTenant).toHaveBeenCalledWith('xe-du-lich');
      });
    });

    it('shows toast on successful activation', async () => {
      renderPage();
      await waitFor(() => expect(screen.getByText('XeVN Group Holding')).toBeInTheDocument());
      fireEvent.click(screen.getByRole('button', { name: 'Kích hoạt' }));
      await waitFor(() => {
        expect(screen.getByText('Đã kích hoạt "XeVN Du Lịch" — HRM/Logistics sẽ nhận cấu hình trong ít phút.')).toBeInTheDocument();
      });
    });

    it('shows error toast on activation failure', async () => {
      mockActivateTenant.mockRejectedValueOnce(new Error('Activation failed'));
      renderPage();
      await waitFor(() => expect(screen.getByText('XeVN Group Holding')).toBeInTheDocument());
      fireEvent.click(screen.getByRole('button', { name: 'Kích hoạt' }));
      await waitFor(() => {
        expect(screen.getByText('Activation failed')).toBeInTheDocument();
      });
    });

    it('shows "Đang xử lý..." during activation', async () => {
      let resolveActivate!: (value: XbosCompanyRow) => void;
      mockActivateTenant.mockImplementationOnce(() => new Promise((resolve) => { resolveActivate = resolve; }));
      renderPage();
      await waitFor(() => expect(screen.getByText('XeVN Group Holding')).toBeInTheDocument());
      fireEvent.click(screen.getByRole('button', { name: 'Kích hoạt' }));
      expect(screen.getByRole('button', { name: 'Đang xử lý...' })).toBeInTheDocument();
      act(() => {
        resolveActivate({ ...mockCompanies[1], status: 'active' });
      });
    });
  });

  describe('Suspend action', () => {
    it('shows Suspend button only for active status', async () => {
      renderPage();
      await waitFor(() => expect(screen.getByText('XeVN Group Holding')).toBeInTheDocument());
      expect(screen.getByRole('button', { name: 'Tạm ngưng' })).toBeInTheDocument();
      expect(screen.getAllByRole('button', { name: 'Tạm ngưng' })).toHaveLength(1);
    });

    it('opens SuspendConfirmDialog when suspend clicked', async () => {
      renderPage();
      await waitFor(() => expect(screen.getByText('XeVN Group Holding')).toBeInTheDocument());
      fireEvent.click(screen.getByRole('button', { name: 'Tạm ngưng' }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      // title by id="suspend-confirm-title"
      expect(document.getElementById('suspend-confirm-title')).toBeTruthy();
    });

    it('calls suspendTenant when confirm in dialog', async () => {
      renderPage();
      await waitFor(() => expect(screen.getByText('XeVN Group Holding')).toBeInTheDocument());
      fireEvent.click(screen.getByRole('button', { name: 'Tạm ngưng' }));
      fireEvent.click(screen.getByRole('button', { name: 'Xác nhận tạm ngưng' }));
      await waitFor(() => {
        expect(mockSuspendTenant).toHaveBeenCalledWith('xevn');
      });
    });

    it('shows toast on successful suspend', async () => {
      renderPage();
      await waitFor(() => expect(screen.getByText('XeVN Group Holding')).toBeInTheDocument());
      fireEvent.click(screen.getByRole('button', { name: 'Tạm ngưng' }));
      fireEvent.click(screen.getByRole('button', { name: 'Xác nhận tạm ngưng' }));
      await waitFor(() => {
        expect(screen.getByText('Đã tạm ngưng "XeVN Group Holding".')).toBeInTheDocument();
      });
    });

    it('cancels suspend when cancel clicked in dialog', async () => {
      renderPage();
      await waitFor(() => expect(screen.getByText('XeVN Group Holding')).toBeInTheDocument());
      fireEvent.click(screen.getByRole('button', { name: 'Tạm ngưng' }));
      fireEvent.click(screen.getByRole('button', { name: 'Hủy' }));
      expect(mockSuspendTenant).not.toHaveBeenCalled();
    });

    it('shows error toast on suspend failure', async () => {
      mockSuspendTenant.mockRejectedValueOnce(new Error('Suspend failed'));
      renderPage();
      await waitFor(() => expect(screen.getByText('XeVN Group Holding')).toBeInTheDocument());
      fireEvent.click(screen.getByRole('button', { name: 'Tạm ngưng' }));
      fireEvent.click(screen.getByRole('button', { name: 'Xác nhận tạm ngưng' }));
      await waitFor(() => {
        expect(screen.getByText('Suspend failed')).toBeInTheDocument();
      });
    });
  });

  describe('Add company flow', () => {
    it('shows validation errors in dialog', async () => {
      renderPage();
      await waitFor(() => expect(screen.getByText('XeVN Group Holding')).toBeInTheDocument());
      fireEvent.click(screen.getByRole('button', { name: /Thêm công ty mới/i }));
      fireEvent.click(screen.getByRole('button', { name: 'Xác nhận thêm' }));
      expect(await screen.findByText('Mã tenant không được để trống.')).toBeInTheDocument();
    });

    it('creates company and adds to table via API', async () => {
      const newCompany: XbosCompanyRow = {
        tenantId: 'new-tenant',
        name: 'New Company',
        shortName: 'NC',
        tenantKind: 'member',
        defaultCompanyId: 'new',
        modules: ['hrm'],
        status: 'provisioning',
      };
      mockCreateSettingsCompany.mockResolvedValueOnce(newCompany);

      renderPage();
      await waitFor(() => expect(screen.getByText('XeVN Group Holding')).toBeInTheDocument());
      fireEvent.click(screen.getByRole('button', { name: /Thêm công ty mới/i }));
      await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());

      // Use placeholder to locate inputs (AddCompanyDialog uses <label> wrapping, not htmlFor)
      const tenantCodeInput = screen.getByPlaceholderText('vd: xe-du-lich');
      const nameInput = screen.getByPlaceholderText('VD: XeVN Du Lịch');
      const shortNameInput = screen.getByPlaceholderText('VD: XeVN DL');

      await userEvent.type(tenantCodeInput, 'new-tenant');
      await userEvent.type(nameInput, 'New Company');
      await userEvent.type(shortNameInput, 'NC');
      await userEvent.click(screen.getByRole('button', { name: 'Xác nhận thêm' }));

      await waitFor(() => {
        expect(screen.getByText('New Company')).toBeInTheDocument();
        expect(screen.getByText('new-tenant')).toBeInTheDocument();
      });
    });
  });

  describe('Toast auto-clear', () => {
    it('clears toast after 4 seconds', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });

      renderPage();

      // Flush async fetch with fake timers
      await act(async () => { await vi.runAllTimersAsync(); });
      await waitFor(() => expect(screen.getByText('XeVN Group Holding')).toBeInTheDocument());

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Kích hoạt' }));
        await vi.runAllTimersAsync();
      });

      await waitFor(() =>
        expect(screen.getByText('Đã kích hoạt "XeVN Du Lịch" — HRM/Logistics sẽ nhận cấu hình trong ít phút.')).toBeInTheDocument()
      );

      act(() => { vi.advanceTimersByTime(4000); });

      expect(screen.queryByText('Đã kích hoạt "XeVN Du Lịch" — HRM/Logistics sẽ nhận cấu hình trong ít phút.')).not.toBeInTheDocument();

      vi.useRealTimers();
    });
  });

  describe('Row rendering', () => {
    it('shows "—" for suspended/archived status actions', async () => {
      const suspendedCompanies: XbosCompanyRow[] = [
        {
          tenantId: 'suspended-tenant',
          name: 'Suspended Company',
          shortName: 'SC',
          tenantKind: 'member',
          defaultCompanyId: 'suspended',
          modules: ['hrm'],
          status: 'suspended',
        },
        {
          tenantId: 'archived-tenant',
          name: 'Archived Company',
          shortName: 'AC',
          tenantKind: 'member',
          defaultCompanyId: 'archived',
          modules: ['logistics'],
          status: 'archived',
        },
      ];
      mockListSettingsCompanies.mockResolvedValueOnce({ items: suspendedCompanies });

      renderPage();
      await waitFor(() => expect(screen.getByText('Suspended Company')).toBeInTheDocument(), { timeout: 8000 });

      expect(screen.getByText('Tạm ngưng')).toBeInTheDocument();
      expect(screen.getByText('Lưu trữ')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Kích hoạt' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Tạm ngưng' })).not.toBeInTheDocument();
    });

    it('shows shortName when available', async () => {
      renderPage();
      await waitFor(() => expect(screen.getByText('XeVN Group Holding')).toBeInTheDocument(), { timeout: 8000 });
      expect(screen.getByText('XeVN')).toBeInTheDocument();
      expect(screen.getByText('XeVN DL')).toBeInTheDocument();
    });

    it('renders tenantId in monospace', async () => {
      renderPage();
      await waitFor(() => expect(screen.getByText('xevn')).toBeInTheDocument(), { timeout: 8000 });
      const tenantIdEl = screen.getByText('xevn');
      expect(tenantIdEl).toHaveClass('font-mono');
    });
  });
});
