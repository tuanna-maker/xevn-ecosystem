/**
 * @CODE-MEMORY
 * Screen: PolicyPackSetupScreen (STP-POLICY-PACK, CHUNG) — xem PolicyPackSetupScreen.tsx
 * Purpose: Vitest AC CHUNG — list/create/update/archive/validate KPI+date; mock usePolicyPackApi
 * WorkItem: PO-HRM-PAY-CNTT-FE-STP-01-POLICY-PACK-01
 * must_keep: vi.mock hoisted; fireEvent; .test.ts + createElement (vite include *.test.ts)
 *
 * @CODE-MEMORY-CHANGE 2026-08-12 D-PAY-STP-SEARCH-ARIA-P2-01
 * change_mode: ADD (thêm 1 case a11y, không sửa case AC cũ)
 * What: Case khóa nhãn trợ năng — matcher substring «Tên gói» / «Mã gói» chỉ khớp
 *       đúng một ô của form; ô tìm kiếm có nhãn riêng «Tìm kiếm trong danh sách gói».
 * Why: Chống tái diễn DEF-PAY-STP-SEARCH-ARIA-P2 (harness QA gõ nhầm ô tìm kiếm).
 * must_keep: 8 case AC cũ nguyên vẹn; không mock lại API khác
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { createElement } from 'react';
import { PolicyPackSetupScreen } from './PolicyPackSetupScreen';
import type { PolicyPack } from './usePolicyPackApi';

const listMock = vi.fn();
const createMock = vi.fn();
const updateMock = vi.fn();
const archiveMock = vi.fn();

vi.mock('./usePolicyPackApi', () => ({
  useListPolicyPacks: (scope: string) => listMock(scope),
  useCreatePolicyPack: () => ({
    mutateAsync: createMock,
    isPending: false,
    isError: false,
    error: null,
    isSuccess: false,
  }),
  useUpdatePolicyPack: () => ({
    mutateAsync: updateMock,
    isPending: false,
    isError: false,
    error: null,
    isSuccess: false,
  }),
  useArchivePolicyPack: () => ({
    mutateAsync: archiveMock,
    isPending: false,
    isError: false,
    error: null,
    isSuccess: false,
  }),
}));

const MOCK_CHUNG: PolicyPack[] = [
  {
    id: 'pp-1',
    code: 'POL_CHUNG_2A',
    nameVi: 'Thang bậc QĐ 2A',
    scope: 'CHUNG',
    status: 'active',
    effectiveFrom: '2026-01-01',
    rateParams: { kpi_threshold: 70, bcc_std: 5_000_000 },
  },
];

function mockListResult(data: PolicyPack[] = [], overrides: Partial<Record<string, unknown>> = {}) {
  listMock.mockReturnValue({ data, isLoading: false, isError: false, ...overrides });
}

function typeInto(el: HTMLElement, value: string) {
  fireEvent.change(el, { target: { value } });
}

beforeEach(() => {
  listMock.mockReset();
  createMock.mockReset();
  updateMock.mockReset();
  archiveMock.mockReset();
  mockListResult([]);
});

afterEach(() => {
  cleanup();
});

describe('PolicyPackSetupScreen — UC-BP-PAY-STP-01 (CHUNG)', () => {
  it('render danh sách CHUNG kèm dữ liệu (AC-PAY-STP-GLOBAL-01)', () => {
    mockListResult(MOCK_CHUNG);
    render(createElement(PolicyPackSetupScreen));
    expect(screen.getByTestId('pay-policy-pack-list')).toBeTruthy();
    expect(screen.getByText('POL_CHUNG_2A')).toBeTruthy();
    expect(screen.getByText('Thang bậc QĐ 2A')).toBeTruthy();
  });

  it('hiển thị empty state khi chưa có gói CHUNG nào', () => {
    mockListResult([]);
    render(createElement(PolicyPackSetupScreen));
    expect(screen.getByText(/Chưa có gói chính sách nào. Bấm "+ Thêm chính sách" để tạo mới./i)).toBeTruthy();
  });

  it('validate field bắt buộc — chặn submit khi thiếu mã/tên gói', async () => {
    mockListResult([]);
    render(createElement(PolicyPackSetupScreen));
    fireEvent.click(screen.getByText('Tạo mới gói'));
    await waitFor(() => expect(screen.getByText('Mã gói không được để trống.')).toBeTruthy());
    expect(createMock).not.toHaveBeenCalled();
  });

  it('AC-PAY-STP-01-01: tạo mới CHUNG hợp lệ → create payload đúng (2xx)', async () => {
    mockListResult([]);
    createMock.mockResolvedValue({
      id: 'pp-2',
      code: 'NEW-PACK',
      nameVi: 'Gói mới',
      scope: 'CHUNG',
    });

    render(createElement(PolicyPackSetupScreen));
    typeInto(screen.getByLabelText('Mã gói'), 'NEW-PACK');
    typeInto(screen.getByLabelText('Tên gói (VI)'), 'Gói mới');
    typeInto(screen.getByLabelText('Hiệu lực từ'), '2026-01-01');
    typeInto(screen.getByTestId('pay-params-kpi-threshold'), '70');
    typeInto(screen.getByTestId('pay-params-bcc-std'), '5.000.000');
    fireEvent.click(screen.getByText('Tạo mới gói'));

    await waitFor(() => expect(createMock).toHaveBeenCalledTimes(1));
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'NEW-PACK',
        nameVi: 'Gói mới',
        scope: 'CHUNG',
        effectiveFrom: '2026-01-01',
        rateParams: { kpi_threshold: 70, bcc_std: 5_000_000 },
      }),
    );
  });

  it('AC-PAY-STP-01-05: hiệu lực đến trước hiệu lực từ → chặn submit', async () => {
    mockListResult([]);
    render(createElement(PolicyPackSetupScreen));
    typeInto(screen.getByLabelText('Mã gói'), 'DATE-BAD');
    typeInto(screen.getByLabelText('Tên gói (VI)'), 'Gói ngày sai');
    typeInto(screen.getByLabelText('Hiệu lực từ'), '2026-06-01');
    typeInto(screen.getByLabelText('Hiệu lực đến'), '2026-01-01');
    fireEvent.click(screen.getByText('Tạo mới gói'));

    await waitFor(() =>
      expect(screen.getByText('Hiệu lực đến phải sau hiệu lực từ')).toBeTruthy(),
    );
    expect(createMock).not.toHaveBeenCalled();
  });

  it('AC-PAY-STP-03-01: KPI ngoài range → chặn submit', async () => {
    mockListResult([]);
    render(createElement(PolicyPackSetupScreen));
    typeInto(screen.getByLabelText('Mã gói'), 'KPI-BAD');
    typeInto(screen.getByLabelText('Tên gói (VI)'), 'Gói KPI sai');
    typeInto(screen.getByLabelText('Hiệu lực từ'), '2026-01-01');
    typeInto(screen.getByTestId('pay-params-kpi-threshold'), '150');
    fireEvent.click(screen.getByText('Tạo mới gói'));

    await waitFor(() =>
      expect(screen.getByText('KPI threshold phải từ 0 đến 100')).toBeTruthy(),
    );
    expect(createMock).not.toHaveBeenCalled();
  });

  it('AC-PAY-STP-01-02: sửa gói — PATCH rateParams KPI+BCC', async () => {
    mockListResult(MOCK_CHUNG);
    updateMock.mockResolvedValue({
      ...MOCK_CHUNG[0],
      rateParams: { kpi_threshold: 80, bcc_std: 6_000_000 },
    });

    render(createElement(PolicyPackSetupScreen));
    fireEvent.click(screen.getByTestId('pay-policy-pack-row-POL_CHUNG_2A'));

    expect(screen.getByText(/Cập nhật chính sách/)).toBeTruthy();
    const kpi = screen.getByTestId('pay-params-kpi-threshold') as HTMLInputElement;
    expect(kpi.value).toBe('70');
    typeInto(kpi, '80');
    fireEvent.click(screen.getByText('Lưu thay đổi'));

    await waitFor(() => expect(updateMock).toHaveBeenCalledTimes(1));
    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'pp-1',
        data: expect.objectContaining({
          rateParams: expect.objectContaining({ kpi_threshold: 80, bcc_std: 5_000_000 }),
        }),
      }),
    );
  });

  it('DEF-PAY-STP-SEARCH-ARIA-P2: nhãn ô tìm kiếm không trùng cụm «Tên gói»/«Mã gói»', () => {
    mockListResult(MOCK_CHUNG);
    render(createElement(PolicyPackSetupScreen));

    // Substring matcher (giống Playwright getByLabel) chỉ được trả về đúng ô của form.
    expect(screen.getAllByLabelText(/Tên gói/i)).toHaveLength(1);
    expect(screen.getAllByLabelText(/Mã gói/i)).toHaveLength(1);
    expect(screen.getByLabelText('Tên gói (VI)')).toBe(
      document.querySelector('#nameVi'),
    );
    expect(screen.getByLabelText('Tìm kiếm trong danh sách gói')).toBeTruthy();
  });

  it('AC-PAY-STP-01-03: Archive → POST archive', async () => {
    mockListResult(MOCK_CHUNG);
    archiveMock.mockResolvedValue({ ...MOCK_CHUNG[0], status: 'retired' });

    render(createElement(PolicyPackSetupScreen));
    fireEvent.click(screen.getByTestId('pay-policy-pack-row-POL_CHUNG_2A'));
    fireEvent.click(screen.getByTestId('pay-policy-pack-archive'));

    await waitFor(() => expect(archiveMock).toHaveBeenCalledWith('pp-1'));
  });
});
