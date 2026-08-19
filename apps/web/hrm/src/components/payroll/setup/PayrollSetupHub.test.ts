/**
 * @CODE-MEMORY
 * Screen: PayrollSetupHub — xem PayrollSetupHub.tsx đầu file cho spec đầy đủ.
 * Purpose: Test canonical cho hub route wiring — render root testid, click nav "Gói chính sách"
 *          thấy nội dung PolicyPackSetupScreen thật, click 1 mục khác thấy placeholder honesty
 *          (không fake PASS).
 * must_keep: Mock PolicyPackSetupScreen phụ thuộc (usePolicyPackApi) qua vi.mock module con —
 *            tránh gọi network thật trong test hub; dùng MemoryRouter bọc useSearchParams.
 * WorkItem: PO-HRM-PAY-STP-HUB-ROUTE-WIRE-01
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { createElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PayrollSetupHub } from './PayrollSetupHub';

vi.mock('../policy-pack/usePolicyPackApi', () => ({
  useListPolicyPacks: () => ({ data: [], isLoading: false, isError: false, error: null }),
  useCreatePolicyPack: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
    isSuccess: false,
  }),
  useUpdatePolicyPack: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
    isSuccess: false,
  }),
  useArchivePolicyPack: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
    isSuccess: false,
  }),
}));

afterEach(() => {
  cleanup();
});

function renderHub() {
  const queryClient = new QueryClient();
  return render(
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(MemoryRouter, { initialEntries: ['/payroll/setup'] }, createElement(PayrollSetupHub)),
    ),
  );
}
describe('PayrollSetupHub — route wiring (PO-HRM-PAY-STP-HUB-ROUTE-WIRE-01)', () => {
  it('renders root testid pay-stp-hub-root', () => {
    renderHub();
    expect(screen.getByTestId('pay-stp-hub-root')).toBeTruthy();
  });

  it('renders all 6 nav items from spec', () => {
    renderHub();
    expect(screen.getByTestId('pay-stp-nav-policy-pack')).toBeTruthy();
    expect(screen.getByTestId('pay-stp-nav-components')).toBeTruthy();
    expect(screen.getByTestId('pay-stp-nav-templates')).toBeTruthy();
    expect(screen.getByTestId('pay-stp-nav-import-profile')).toBeTruthy();
    expect(screen.getByTestId('pay-stp-nav-salary-groups')).toBeTruthy();
    expect(screen.getByTestId('pay-stp-nav-resolve-panel')).toBeTruthy();
  });

  it('defaults to Gói chính sách and shows PolicyPackSetupScreen content', () => {
    renderHub();
    expect(screen.getByTestId('pay-policy-pack-list')).toBeTruthy();
  });

  it('clicking Danh mục thành phần shows real PayrollComponentsSetupScreen', () => {
    renderHub();
    fireEvent.click(screen.getByTestId('pay-stp-nav-components'));
    expect(screen.getByTestId('payroll-components-setup-screen')).toBeTruthy();
    expect(screen.queryByTestId('pay-policy-pack-list')).toBeNull();
  });

  it('clicking Nhóm lương shows real PayrollGradeSetupScreen', () => {
    renderHub();
    fireEvent.click(screen.getByTestId('pay-stp-nav-salary-groups'));
    expect(screen.getByTestId('payroll-grade-setup-screen')).toBeTruthy();
  });

  it('clicking Loại quyết định shows real DecisionTypesSetupScreen', () => {
    renderHub();
    fireEvent.click(screen.getByTestId('pay-stp-nav-decision-types'));
    expect(screen.getByTestId('decision-types-setup-screen')).toBeTruthy();
  });

  it('clicking Loại HĐ & LHDL shows real ContractEmploymentTypesSetupScreen', () => {
    renderHub();
    fireEvent.click(screen.getByTestId('pay-stp-nav-contract-employment-types'));
    expect(screen.getByTestId('contract-employment-types-setup-screen')).toBeTruthy();
  });

  it('clicking Loại bảo hiểm & Tỷ lệ shows real InsuranceTypesSetupScreen', () => {
    renderHub();
    fireEvent.click(screen.getByTestId('pay-stp-nav-insurance-types'));
    expect(screen.getByTestId('insurance-types-setup-screen')).toBeTruthy();
  });

  it('clicking Loại OT & Loại trừ shows real OvertimeTypesSetupScreen', () => {
    renderHub();
    fireEvent.click(screen.getByTestId('pay-stp-nav-overtime-types'));
    expect(screen.getByTestId('overtime-types-setup-screen')).toBeTruthy();
  });

  it('shows honesty banner with payroll_e2e_ready=false copy', () => {
    renderHub();
    const banner = screen.getByTestId('pay-stp-honesty-banner');
    expect(banner.textContent).toContain('payroll_e2e_ready=false');
  });
});
