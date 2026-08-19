// @CODE-MEMORY WorkItem: XBOS-TENANT-PROVISION-FE-01
// Vitest + React Testing Library tests for SuspendConfirmDialog

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SuspendConfirmDialog } from './SuspendConfirmDialog';

describe('SuspendConfirmDialog', () => {
  const mockOnConfirm = vi.fn();
  const mockOnCancel = vi.fn();
  const companyName = 'XeVN Du Lịch';

  const defaultProps = {
    companyName,
    onConfirm: mockOnConfirm,
    onCancel: mockOnCancel,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function renderDialog(props = {}) {
    return render(<SuspendConfirmDialog {...defaultProps} {...props} />);
  }

  describe('Rendering', () => {
    it('renders dialog', () => {
      renderDialog();
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('shows title text', () => {
      renderDialog();
      const titles = screen.getAllByText('Xác nhận tạm ngưng');
      expect(titles.length).toBeGreaterThanOrEqual(1);
    });

    it('shows company name in confirm message', () => {
      renderDialog();
      expect(screen.getByText((content) => content.includes('XeVN Du Lịch'))).toBeInTheDocument();
    });

    it('shows warning about users unable to login', () => {
      renderDialog();
      expect(screen.getByText((content) => content.includes('không thể đăng nhập'))).toBeInTheDocument();
    });

    it('renders warning icon (AlertTriangle)', () => {
      renderDialog();
      // AlertTriangle from lucide-react renders as SVG - check for SVG presence
      const svgs = document.querySelectorAll('svg');
      expect(svgs.length).toBeGreaterThan(0);
    });

    it('renders amber warning icon container', () => {
      renderDialog();
      // Find the div with bg-amber-100 class
      const amberContainers = document.querySelectorAll('.bg-amber-100');
      expect(amberContainers.length).toBeGreaterThan(0);
    });

    it('renders Cancel button', () => {
      renderDialog();
      expect(screen.getByRole('button', { name: 'Hủy' })).toBeInTheDocument();
    });

    it('renders Confirm button with amber styling', () => {
      renderDialog();
      const confirmBtn = screen.getByRole('button', { name: 'Xác nhận tạm ngưng' });
      expect(confirmBtn).toBeInTheDocument();
      expect(confirmBtn).toHaveClass('bg-amber-600');
      expect(confirmBtn).toHaveClass('text-white');
    });
  });

  describe('Button interactions', () => {
    it('calls onConfirm when confirm button clicked', async () => {
      renderDialog();
      await fireEvent.click(screen.getByRole('button', { name: 'Xác nhận tạm ngưng' }));
      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel when cancel button clicked', async () => {
      renderDialog();
      await fireEvent.click(screen.getByRole('button', { name: 'Hủy' }));
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('Keyboard interactions', () => {
    it('calls onCancel on Escape key', () => {
      renderDialog();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('does not call onConfirm on Escape key', () => {
      renderDialog();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(mockOnConfirm).not.toHaveBeenCalled();
    });
  });

  describe('Overlay interactions', () => {
    it('calls onCancel on overlay click', () => {
      renderDialog();
      fireEvent.mouseDown(screen.getByRole('dialog'), { target: screen.getByRole('dialog') });
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('does not call onConfirm on overlay click', () => {
      renderDialog();
      fireEvent.mouseDown(screen.getByRole('dialog'), { target: screen.getByRole('dialog') });
      expect(mockOnConfirm).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has correct ARIA attributes', () => {
      renderDialog();
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'suspend-confirm-title');
    });

    it('has titled dialog', () => {
      renderDialog();
      const title = document.getElementById('suspend-confirm-title');
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent('Xác nhận tạm ngưng');
    });
  });

  describe('Different company names', () => {
    it('displays different company name correctly', () => {
      renderDialog({ companyName: 'XeVN Logistics' });
      expect(screen.getByText((content) => content.includes('XeVN Logistics'))).toBeInTheDocument();
    });

    it('handles special characters in company name', () => {
      renderDialog({ companyName: 'Công ty TNHH "XeVN" & Associates' });
      expect(screen.getByText((content) => content.includes('Công ty TNHH') && content.includes('XeVN'))).toBeInTheDocument();
    });
  });
});