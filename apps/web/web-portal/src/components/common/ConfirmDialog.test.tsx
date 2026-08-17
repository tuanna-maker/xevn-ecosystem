import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ConfirmDialog } from './ConfirmDialog';

describe('ConfirmDialog (G-UX-01 foundation)', () => {
  it('renders Vietnamese title and description when open', () => {
    render(
      <ConfirmDialog
        open
        title="Xóa cổ đông"
        description="Bạn có chắc muốn xóa cổ đông này?"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByRole('alertdialog')).toBeTruthy();
    expect(screen.getByRole('alertdialog').className).toContain('xevn-dialog-surface');
    expect(document.querySelector('.xevn-dialog-header-glass')).toBeTruthy();
    expect(document.querySelector('.xevn-dialog-wordmark')).toBeTruthy();
    expect(screen.getByText('Xóa cổ đông')).toBeTruthy();
    expect(screen.getByText('Bạn có chắc muốn xóa cổ đông này?')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Hủy' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Xác nhận' })).toBeTruthy();
  });

  it('calls onCancel when Hủy is clicked', () => {
    const onCancel = vi.fn();
    render(
      <ConfirmDialog
        open
        title="Xóa tài liệu"
        description="Mô tả"
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Hủy' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onConfirm when Xác nhận is clicked', () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog
        open
        title="Xóa"
        description="Mô tả"
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Xác nhận' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('renders nothing when closed', () => {
    const { container } = render(
      <ConfirmDialog
        open={false}
        title="Xóa"
        description="Mô tả"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(container.firstChild).toBeNull();
  });
});
