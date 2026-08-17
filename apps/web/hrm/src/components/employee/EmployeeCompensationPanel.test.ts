import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import {
  EmployeeCompensationPanel,
  compensationPackageLines,
} from '@/components/employee/EmployeeCompensationPanel';
import { useEmployeeCompensation } from '@/hooks/useEmployeeCompensation';

vi.mock('@/hooks/useEmployeeCompensation');
vi.mock('@/hooks/useSalaryComponentsEffective', () => ({
  useSalaryComponentsEffective: () => ({
    componentOptions: [
      { value: 'base', label: 'base', code: 'base' },
      { value: 'probation', label: 'probation', code: 'probation' },
      { value: 'PHU_CAP_AN', label: 'PHU_CAP_AN', code: 'PHU_CAP_AN' },
      { value: 'PHU_CAP_XANG', label: 'PHU_CAP_XANG', code: 'PHU_CAP_XANG' },
    ],
    hasEffectiveCatalog: true,
    isLoading: false,
    isError: false,
  }),
}));

const mockUseEmployeeCompensation = vi.mocked(useEmployeeCompensation);

const baseHookReturn = {
  packages: [],
  history: [],
  isLoading: false,
  isHistoryLoading: false,
  fetchError: null,
  useApi: true,
  refetch: vi.fn(),
  refetchHistory: vi.fn(),
  createPackage: vi.fn(),
  revisePackage: vi.fn(),
};

describe('D-UX-VI-COMP-PANEL-LINES-MAP-01 — compensation lines guard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('compensationPackageLines returns [] when lines missing or not array', () => {
    expect(compensationPackageLines(null)).toEqual([]);
    expect(compensationPackageLines(undefined)).toEqual([]);
    expect(compensationPackageLines({})).toEqual([]);
    expect(compensationPackageLines({ lines: undefined })).toEqual([]);
    expect(compensationPackageLines({ lines: null as unknown as [] })).toEqual([]);
    expect(
      compensationPackageLines({
        lines: [{ line_type: 'base', amount: 15_000_000 }],
      }),
    ).toHaveLength(1);
  });

  it('does not call active.lines.map without guard in implementation', () => {
    const src = readFileSync(
      join(process.cwd(), 'src/components/employee/EmployeeCompensationPanel.tsx'),
      'utf8',
    );
    const codeOnly = src.replace(/\/\*[\s\S]*?\*\//g, '');
    expect(codeOnly).not.toMatch(/active\.lines\.map/);
    expect(src).toContain('compensationPackageLines');
    expect(codeOnly).toContain('activeLines.map');
  });

  it('renders active package without lines without throwing', () => {
    mockUseEmployeeCompensation.mockReturnValue({
      ...baseHookReturn,
      active: {
        id: 'pkg-1',
        company_id: 'main',
        employee_id: 'emp-1',
        contract_id: null,
        version: 1,
        supersedes_package_id: null,
        effective_from: '2026-07-20',
        effective_to: null,
        currency: 'VND',
        change_reason: null,
        created_at: '2026-07-20T00:00:00.000Z',
        updated_at: '2026-07-20T00:00:00.000Z',
        lines: undefined as unknown as [],
      },
      packages: [
        {
          id: 'pkg-1',
          company_id: 'main',
          employee_id: 'emp-1',
          contract_id: null,
          version: 1,
          supersedes_package_id: null,
          effective_from: '2026-07-20',
          effective_to: null,
          currency: 'VND',
          change_reason: null,
          created_at: '2026-07-20T00:00:00.000Z',
          updated_at: '2026-07-20T00:00:00.000Z',
          lines: undefined as unknown as [],
        },
      ],
    });

    render(
      createElement(EmployeeCompensationPanel, {
        employeeId: 'emp-1',
        contracts: [{ id: 'c-1', contract_type: 'indefinite', status: 'active' }],
      }),
    );

    expect(screen.getByText(/Gói đãi ngộ hiện hành/i)).toBeTruthy();
    expect(screen.getByText(/chưa có chi tiết dòng lương/i)).toBeTruthy();
    expect(screen.getByText(/Điều chỉnh \/ tăng lương/i)).toBeTruthy();
    expect(screen.getByPlaceholderText('15.000.000')).toBeTruthy();
  });

  it('renders line rows when active.lines is populated', () => {
    mockUseEmployeeCompensation.mockReturnValue({
      ...baseHookReturn,
      active: {
        id: 'pkg-2',
        company_id: 'main',
        employee_id: 'emp-1',
        contract_id: null,
        version: 2,
        supersedes_package_id: 'pkg-1',
        effective_from: '2026-01-01',
        effective_to: null,
        currency: 'VND',
        change_reason: 'Tăng lương',
        created_at: '2026-01-01T00:00:00.000Z',
        updated_at: '2026-01-01T00:00:00.000Z',
        lines: [
          {
            id: 'line-base',
            package_id: 'pkg-2',
            line_type: 'base',
            amount: 20_000_000,
            allowance_code: null,
            component_code: 'base',
            taxable: true,
            note: null,
            sort_order: 0,
            created_at: '2026-01-01T00:00:00.000Z',
          },
        ],
      },
      packages: [],
    });

    render(
      createElement(EmployeeCompensationPanel, {
        employeeId: 'emp-1',
        contracts: [{ id: 'c-1', contract_type: 'indefinite', status: 'active' }],
      }),
    );

    expect(screen.getByText('20.000.000 ₫')).toBeTruthy();
    expect(screen.getByTestId('hdsd-emp-comp-revise')).toBeTruthy();
  });

  it('exposes HDSD create testid when no active package (U65 FE-CB click)', () => {
    mockUseEmployeeCompensation.mockReturnValue({
      ...baseHookReturn,
      active: null,
      packages: [],
    });

    render(
      createElement(EmployeeCompensationPanel, {
        employeeId: 'emp-1',
        contracts: [{ id: 'c-1', contract_type: 'indefinite', status: 'active' }],
      }),
    );

    expect(screen.getByTestId('hdsd-emp-comp-create')).toBeTruthy();
    expect(screen.getByTestId('hdsd-emp-comp-base')).toBeTruthy();
    expect(screen.getByTestId('hdsd-emp-comp-bank-tax')).toBeTruthy();
    expect(screen.getByTestId('hdsd-emp-comp-bank-account')).toBeTruthy();
    expect(screen.getByTestId('hdsd-emp-comp-tax-id')).toBeTruthy();
    expect(screen.getByTestId('hdsd-emp-comp-allowance-amount-0')).toBeTruthy();
    expect(screen.getByTestId('hdsd-emp-comp-allowance-amount-1')).toBeTruthy();
  });
});
