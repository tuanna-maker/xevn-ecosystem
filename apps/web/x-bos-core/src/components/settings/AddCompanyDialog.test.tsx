// @CODE-MEMORY WorkItem: XBOS-TENANT-PROVISION-FE-01
// Vitest + React Testing Library tests for AddCompanyDialog

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddCompanyDialog } from './AddCompanyDialog';

describe('AddCompanyDialog', () => {
  const mockOnClose = vi.fn();
  const mockOnCreate = vi.fn();

  const defaultProps = {
    onClose: mockOnClose,
    onCreate: mockOnCreate,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnCreate.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function renderDialog(props = {}) {
    return render(<AddCompanyDialog {...defaultProps} {...props} />);
  }

  describe('Rendering', () => {
    it('renders dialog with title and description', () => {
      renderDialog();
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Thêm công ty mới')).toBeInTheDocument();
      expect(screen.getByText((content) => content.includes('Đang cấp phép') && content.includes('Kích hoạt'))).toBeInTheDocument();
    });

    it('renders all required fields', () => {
      renderDialog();

      // Mã tenant - label text split across spans
      expect(screen.getByText('Mã tenant')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('vd: xe-du-lich')).toBeInTheDocument();

      // Tên đầy đủ
      expect(screen.getByText('Tên đầy đủ')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('VD: XeVN Du Lịch')).toBeInTheDocument();

      // Tên ngắn
      expect(screen.getByText('Tên ngắn')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('VD: XeVN DL')).toBeInTheDocument();

      // Loại
      expect(screen.getByText('Loại')).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Thành viên' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Chủ sở hữu' })).toBeInTheDocument();

      // Phân hệ
      expect(screen.getByText('Phân hệ được phép')).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: 'HRM' })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: 'Logistics' })).toBeInTheDocument();

      // Thông tin pháp nhân (collapsible)
      expect(screen.getByText((content) => content.includes('Thông tin pháp nhân'))).toBeInTheDocument();
    });

    it('renders legal entity fields when expanded', () => {
      renderDialog();
      fireEvent.click(screen.getByText((content) => content.includes('Thông tin pháp nhân')));

      expect(screen.getByText('Mã')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('VD: XDL')).toBeInTheDocument();
      expect(screen.getByText('Tên pháp nhân')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('VD: Công ty CP XeVN Du Lịch')).toBeInTheDocument();
      expect(screen.getByText('Mã số thuế (MST)')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('VD: 0123456789')).toBeInTheDocument();
      expect(screen.getByText('Ngành nghề kinh doanh')).toBeInTheDocument();
      expect(screen.getByRole('combobox', { name: /Ngành nghề kinh doanh/ })).toBeInTheDocument();
    });

    it('renders submit and cancel buttons', () => {
      renderDialog();
      expect(screen.getByRole('button', { name: 'Hủy' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Xác nhận thêm' })).toBeInTheDocument();
    });
  });

  describe('Validation', () => {
    it('shows error when tenantCode is empty', async () => {
      renderDialog();
      await userEvent.click(screen.getByRole('button', { name: 'Xác nhận thêm' }));

      expect(await screen.findByText('Mã tenant không được để trống.')).toBeInTheDocument();
    });

    it('shows error when tenantCode format is invalid', async () => {
      renderDialog();
      await userEvent.type(screen.getByPlaceholderText('vd: xe-du-lich'), '1invalid-start'); // starts with digit
      await userEvent.click(screen.getByRole('button', { name: 'Xác nhận thêm' }));

      expect(await screen.findByText('Chỉ dùng chữ thường, số và dấu gạch ngang. VD: xe-du-lich')).toBeInTheDocument();
    });

    it('shows error when tenantCode has leading hyphen', async () => {
      renderDialog();
      await userEvent.type(screen.getByPlaceholderText('vd: xe-du-lich'), '-xe-du-lich');
      await userEvent.click(screen.getByRole('button', { name: 'Xác nhận thêm' }));

      expect(await screen.findByText('Chỉ dùng chữ thường, số và dấu gạch ngang. VD: xe-du-lich')).toBeInTheDocument();
    });

    it('shows error when tenantCode has trailing hyphen', async () => {
      renderDialog();
      await userEvent.type(screen.getByPlaceholderText('vd: xe-du-lich'), 'xe-du-lich-');
      await userEvent.click(screen.getByRole('button', { name: 'Xác nhận thêm' }));

      expect(await screen.findByText('Chỉ dùng chữ thường, số và dấu gạch ngang. VD: xe-du-lich')).toBeInTheDocument();
    });

    it('accepts valid tenantCode format', async () => {
      renderDialog();
      await userEvent.type(screen.getByPlaceholderText('vd: xe-du-lich'), 'xe-du-lich');
      await userEvent.type(screen.getByPlaceholderText('VD: XeVN Du Lịch'), 'XeVN Du Lịch');
      await userEvent.type(screen.getByPlaceholderText('VD: XeVN DL'), 'XeVN DL');
      await userEvent.click(screen.getByRole('button', { name: 'Xác nhận thêm' }));

      await waitFor(() => {
        expect(mockOnCreate).toHaveBeenCalled();
      });
    });

    it('shows error when name is empty', async () => {
      renderDialog();
      await userEvent.type(screen.getByPlaceholderText('vd: xe-du-lich'), 'xe-du-lich');
      await userEvent.click(screen.getByRole('button', { name: 'Xác nhận thêm' }));

      expect(await screen.findByText('Tên đầy đủ không được để trống.')).toBeInTheDocument();
    });

    it('shows error when shortName is empty', async () => {
      renderDialog();
      await userEvent.type(screen.getByPlaceholderText('vd: xe-du-lich'), 'xe-du-lich');
      await userEvent.type(screen.getByPlaceholderText('VD: XeVN Du Lịch'), 'XeVN Du Lịch');
      await userEvent.click(screen.getByRole('button', { name: 'Xác nhận thêm' }));

      expect(await screen.findByText('Tên ngắn không được để trống.')).toBeInTheDocument();
    });

    it('shows error when no modules selected', async () => {
      renderDialog();
      await userEvent.type(screen.getByPlaceholderText('vd: xe-du-lich'), 'xe-du-lich');
      await userEvent.type(screen.getByPlaceholderText('VD: XeVN Du Lịch'), 'XeVN Du Lịch');
      await userEvent.type(screen.getByPlaceholderText('VD: XeVN DL'), 'XeVN DL');

      // Uncheck HRM (Logistics is already unchecked by default)
      await userEvent.click(screen.getByRole('checkbox', { name: 'HRM' }));

      await userEvent.click(screen.getByRole('button', { name: 'Xác nhận thêm' }));

      expect(await screen.findByText('Chọn ít nhất một phân hệ.')).toBeInTheDocument();
    });

    it('shows multiple errors at once', async () => {
      renderDialog();
      await userEvent.click(screen.getByRole('button', { name: 'Xác nhận thêm' }));

      expect(await screen.findByText('Mã tenant không được để trống.')).toBeInTheDocument();
      expect(screen.getByText('Tên đầy đủ không được để trống.')).toBeInTheDocument();
      expect(screen.getByText('Tên ngắn không được để trống.')).toBeInTheDocument();
    });

    it('shows root error when onCreate throws', async () => {
      mockOnCreate.mockRejectedValue(new Error('API error'));
      renderDialog();

      await userEvent.type(screen.getByPlaceholderText('vd: xe-du-lich'), 'xe-du-lich');
      await userEvent.type(screen.getByPlaceholderText('VD: XeVN Du Lịch'), 'XeVN Du Lịch');
      await userEvent.type(screen.getByPlaceholderText('VD: XeVN DL'), 'XeVN DL');
      await userEvent.click(screen.getByRole('button', { name: 'Xác nhận thêm' }));

      expect(await screen.findByText('API error')).toBeInTheDocument();
    });
  });

  describe('Form submit', () => {
    it('calls onCreate with correct payload', async () => {
      renderDialog();

      await userEvent.type(screen.getByPlaceholderText('vd: xe-du-lich'), 'xe-du-lich');
      await userEvent.type(screen.getByPlaceholderText('VD: XeVN Du Lịch'), 'XeVN Du Lịch');
      await userEvent.type(screen.getByPlaceholderText('VD: XeVN DL'), 'XeVN DL');
      await userEvent.selectOptions(screen.getByRole('combobox', { name: /Loại/ }), 'master');

      // Uncheck HRM, check Logistics
      await userEvent.click(screen.getByRole('checkbox', { name: 'HRM' }));
      await userEvent.click(screen.getByRole('checkbox', { name: 'Logistics' }));

      // Expand legal entity and fill
      fireEvent.click(screen.getByText((content) => content.includes('Thông tin pháp nhân')));
      await userEvent.type(screen.getByText('Mã'), 'XDL');
      await userEvent.type(screen.getByText('Tên pháp nhân'), 'Công ty CP XeVN Du Lịch');
      await userEvent.type(screen.getByText('Mã số thuế (MST)'), '0123456789');
      await userEvent.selectOptions(
        screen.getByRole('combobox', { name: /Ngành nghề kinh doanh/ }),
        'tourism',
      );

      await userEvent.click(screen.getByRole('button', { name: 'Xác nhận thêm' }));

      await waitFor(() => {
        expect(mockOnCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            tenantCode: 'xe-du-lich',
            name: 'XeVN Du Lịch',
            shortName: 'XeVN DL',
            tenantKind: 'master',
            modules: ['logistics'],
            legalEntity: expect.objectContaining({
              code: 'XDL',
              name: 'Công ty CP XeVN Du Lịch',
              taxCode: '0123456789',
              businessLines: 'tourism',
            }),
          })
        );
      });
    });

    it('closes dialog on successful submit', async () => {
      renderDialog();

      await userEvent.type(screen.getByPlaceholderText('vd: xe-du-lich'), 'xe-du-lich');
      await userEvent.type(screen.getByPlaceholderText('VD: XeVN Du Lịch'), 'XeVN Du Lịch');
      await userEvent.type(screen.getByPlaceholderText('VD: XeVN DL'), 'XeVN DL');
      await userEvent.click(screen.getByRole('button', { name: 'Xác nhận thêm' }));

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('does not close dialog on submit error', async () => {
      mockOnCreate.mockRejectedValue(new Error('API error'));
      renderDialog();

      await userEvent.type(screen.getByPlaceholderText('vd: xe-du-lich'), 'xe-du-lich');
      await userEvent.type(screen.getByPlaceholderText('VD: XeVN Du Lịch'), 'XeVN Du Lịch');
      await userEvent.type(screen.getByPlaceholderText('VD: XeVN DL'), 'XeVN DL');
      await userEvent.click(screen.getByRole('button', { name: 'Xác nhận thêm' }));

      await waitFor(() => {
        expect(screen.getByText('API error')).toBeInTheDocument();
      });
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('shows submitting state', async () => {
      let resolveCreate: (value: unknown) => void;
      mockOnCreate.mockImplementation(() => new Promise((resolve) => { resolveCreate = resolve; }));

      renderDialog();

      await userEvent.type(screen.getByPlaceholderText('vd: xe-du-lich'), 'xe-du-lich');
      await userEvent.type(screen.getByPlaceholderText('VD: XeVN Du Lịch'), 'XeVN Du Lịch');
      await userEvent.type(screen.getByPlaceholderText('VD: XeVN DL'), 'XeVN DL');
      await userEvent.click(screen.getByRole('button', { name: 'Xác nhận thêm' }));

      expect(screen.getByRole('button', { name: 'Đang tạo...' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Đang tạo...' })).toBeDisabled();

      act(() => {
        resolveCreate!(undefined);
      });

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });
  });

  describe('Keyboard and overlay interactions', () => {
    it('closes on Escape key', () => {
      renderDialog();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('closes on overlay click', () => {
      renderDialog();
      fireEvent.mouseDown(screen.getByRole('dialog'), { target: screen.getByRole('dialog') });
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('does not close on panel click', () => {
      renderDialog();
      const panel = screen.getByText('Thêm công ty mới').closest('div')!.parentElement!;
      fireEvent.mouseDown(panel, { bubbles: true });
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Tenant module checkboxes', () => {
    it('has HRM checked by default', () => {
      renderDialog();
      expect(screen.getByRole('checkbox', { name: 'HRM' })).toBeChecked();
      expect(screen.getByRole('checkbox', { name: 'Logistics' })).not.toBeChecked();
    });

    it('can toggle Logistics checkbox', async () => {
      renderDialog();
      await userEvent.click(screen.getByRole('checkbox', { name: 'Logistics' }));
      expect(screen.getByRole('checkbox', { name: 'Logistics' })).toBeChecked();
    });

    it('can uncheck HRM checkbox', async () => {
      renderDialog();
      await userEvent.click(screen.getByRole('checkbox', { name: 'HRM' }));
      expect(screen.getByRole('checkbox', { name: 'HRM' })).not.toBeChecked();
    });
  });

  describe('Tenant kind select', () => {
    it('defaults to member', () => {
      renderDialog();
      expect(screen.getByRole('combobox', { name: /Loại/ })).toHaveValue('member');
    });

    it('can change to master', async () => {
      renderDialog();
      await userEvent.selectOptions(screen.getByRole('combobox', { name: /Loại/ }), 'master');
      expect(screen.getByRole('combobox', { name: /Loại/ })).toHaveValue('master');
    });
  });

  describe('Input normalization', () => {
    it('converts tenantCode to lowercase', async () => {
      renderDialog();
      await userEvent.type(screen.getByPlaceholderText('vd: xe-du-lich'), 'XE-DU-LICH');
      expect(screen.getByPlaceholderText('vd: xe-du-lich')).toHaveValue('xe-du-lich');
    });
  });
});