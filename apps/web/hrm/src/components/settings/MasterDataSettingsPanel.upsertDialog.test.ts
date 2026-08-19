/**
 * @CODE-MEMORY
 * Screen:     Vitest RTL — Settings master-data upsert popup (14 bucket, MasterDataBucketPanel)
 * UC:         FR-HRM-SC-POS-01 · FR-HRM-SC-POS-01 (departments alias)
 * What:       "Thêm / cập nhật mục" giờ là Dialog — không hiện sẵn dưới bảng; nút "Thêm mới"
 *             (create rỗng) + click dòng bảng (sửa, điền sẵn) đều mở Dialog đúng testid cũ.
 * Why:        PO-HRM-SETTINGS-MD-PANEL-UPSERT-DIALOG-01 — sponsor UX: form không nên hiện cố
 *             định, phải popup theo chuẩn hệ thống (đối chiếu EmployeeSkills.tsx dialogOpen).
 * WorkItem:   PO-HRM-SETTINGS-MD-PANEL-UPSERT-DIALOG-01
 * must_keep:  md-code-* / md-label-* / md-save-* / md-upsert-form-* testid nguyên vẹn; mutation call
 *             shape (companyId/catalogKey/code/label/status) không đổi
 * LastVerified: docs/qa/evidence/po-hrm-settings-md-panel-upsert-dialog-01.md
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { createElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const upsertSettingsCatalogItemMock = vi.fn().mockResolvedValue({});

vi.mock('@/hooks/useSettingsCatalogsOverview', () => ({
  SETTINGS_CATALOGS_QUERY_KEY: 'hrm-settings-catalogs',
  useSettingsCatalogsOverview: () => ({
    scope: { tenantId: 'tenant-1', companyId: 'company-1' },
    isLoading: false,
    isError: false,
    catalogs: [
      {
        catalogKey: 'departments',
        name: 'Departments',
        domain: null,
        xbosVersion: null,
        xbosSyncedAt: null,
        effectiveItems: [
          { code: 'phong_hcns', label: 'Ph\u00f2ng HCNS', unit: null, status: 'active', origin: 'hrm' },
        ],
      },
    ],
  }),
}));

vi.mock('@/integrations/hrmApi', async () => {
  const actual = await vi.importActual<any>('@/integrations/hrmApi');
  return {
    ...actual,
    upsertSettingsCatalogItem: upsertSettingsCatalogItemMock,
    syncSettingsCatalogsFromXbos: vi.fn().mockResolvedValue({ pulledKeys: [] }),
  };
});

afterEach(() => {
  cleanup();
  upsertSettingsCatalogItemMock.mockClear();
});

async function renderPanel() {
  const { MasterDataSettingsPanel } = await import('./MasterDataSettingsPanel');
  const queryClient = new QueryClient();
  return render(
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(MemoryRouter, {}, createElement(MasterDataSettingsPanel)),
    ),
  );
}

describe('PO-HRM-SETTINGS-MD-PANEL-UPSERT-DIALOG-01 \u2014 positions (create flow)', () => {
  it('form khong hien san; bam "Them moi" moi mo Dialog rong; Luu goi dung mutation', async () => {
    await renderPanel();

    // Mac dinh tab positions active — form KHONG duoc render san duoi bang.
    expect(screen.queryByTestId('md-upsert-form-positions')).toBeNull();
    expect(screen.getByTestId('md-add-new-positions')).toBeTruthy();

    fireEvent.click(screen.getByTestId('md-add-new-positions'));

    const dialog = await screen.findByTestId('md-upsert-form-positions');
    expect(dialog).toBeTruthy();

    const codeInput = screen.getByTestId('md-code-positions') as HTMLInputElement;
    const labelInput = screen.getByTestId('md-label-positions') as HTMLInputElement;
    expect(codeInput.value).toBe('');
    expect(labelInput.value).toBe('');

    fireEvent.change(codeInput, { target: { value: 'nv_kd' } });
    fireEvent.change(labelInput, { target: { value: 'Nhan vien Kinh doanh' } });

    fireEvent.click(screen.getByTestId('md-save-positions'));

    await waitFor(() => {
      expect(upsertSettingsCatalogItemMock).toHaveBeenCalledTimes(1);
    });
    const [payload] = upsertSettingsCatalogItemMock.mock.calls[0];
    expect(payload).toMatchObject({
      companyId: 'company-1',
      code: 'nv_kd',
      label: 'Nhan vien Kinh doanh',
      status: 'active',
    });

    // Dialog dong lai sau khi Luu thanh cong (onSuccess setOpen(false)).
    await waitFor(() => {
      expect(screen.queryByTestId('md-upsert-form-positions')).toBeNull();
    });
  });

  it('dong Dialog khong Luu (nut Huy) reset code/label — mo lai van rong', async () => {
    await renderPanel();

    fireEvent.click(screen.getByTestId('md-add-new-positions'));
    await screen.findByTestId('md-upsert-form-positions');

    fireEvent.change(screen.getByTestId('md-code-positions'), { target: { value: 'tam_thoi' } });

    // Nut Huy trong DialogFooter.
    const cancelButtons = screen.getAllByRole('button', { name: 'H\u1ee7y' });
    fireEvent.click(cancelButtons[0]);

    await waitFor(() => {
      expect(screen.queryByTestId('md-upsert-form-positions')).toBeNull();
    });

    fireEvent.click(screen.getByTestId('md-add-new-positions'));
    const codeInput = await screen.findByTestId('md-code-positions');
    expect((codeInput as HTMLInputElement).value).toBe('');
  });
});

describe('PO-HRM-SETTINGS-MD-PANEL-UPSERT-DIALOG-01 \u2014 departments (edit flow)', () => {
  it('bam 1 dong trong bang mo Dialog voi code/label dien san (che do sua)', async () => {
    await renderPanel();

    fireEvent.click(screen.getByTestId('md-tab-departments'));

    const row = await screen.findByTestId('md-row-phong_hcns');
    fireEvent.click(row);

    const dialog = await screen.findByTestId('md-upsert-form-departments');
    expect(dialog).toBeTruthy();

    const codeInput = screen.getByTestId('md-code-departments') as HTMLInputElement;
    const labelInput = screen.getByTestId('md-label-departments') as HTMLInputElement;
    expect(codeInput.value).toBe('phong_hcns');
    expect(labelInput.value).toBe('Ph\u00f2ng HCNS');
  });
});
