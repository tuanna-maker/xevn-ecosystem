/**
 * D-HDSD-BF-03-SOFTDEL-FE-01 — row action clicks must not fire onRowClick.
 */
import { createElement } from 'react';
import { describe, expect, it, vi, afterEach } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import {
  DataTable,
  isDataTableRowActionTarget,
} from './DataTable';

afterEach(() => {
  cleanup();
});

type Row = { id: string; name: string };

describe('isDataTableRowActionTarget', () => {
  it('detects button / menuitem / data-stop-row-click ancestors', () => {
    const root = document.createElement('div');
    root.innerHTML = `
      <div data-stop-row-click="">
        <button type="button">⋯</button>
        <div role="menuitem">Xóa</div>
      </div>
      <span class="cell-text">Nguyễn Văn A</span>
    `;
    document.body.appendChild(root);

    const button = root.querySelector('button');
    const menuitem = root.querySelector('[role="menuitem"]');
    const cell = root.querySelector('.cell-text');

    expect(isDataTableRowActionTarget(button)).toBe(true);
    expect(isDataTableRowActionTarget(menuitem)).toBe(true);
    expect(isDataTableRowActionTarget(cell)).toBe(false);

    root.remove();
  });
});

describe('DataTable onRowClick isolation — D-HDSD-BF-03-SOFTDEL-FE-01', () => {
  const rows: Row[] = [{ id: 'e1', name: 'QA SoftDel' }];

  it('fires onRowClick when clicking data cell text', () => {
    const onRowClick = vi.fn();
    render(
      createElement(DataTable, {
        data: rows,
        keyExtractor: (r: Row) => r.id,
        onRowClick,
        columns: [
          { key: 'name', header: 'Họ tên' },
          {
            key: 'actions',
            header: '',
            render: () =>
              createElement(
                'button',
                { type: 'button', 'aria-label': 'Thao tác' },
                '⋯',
              ),
          },
        ],
      }),
    );

    fireEvent.click(screen.getByText('QA SoftDel'));
    expect(onRowClick).toHaveBeenCalledTimes(1);
    expect(onRowClick).toHaveBeenCalledWith(rows[0]);
  });

  it('does not fire onRowClick when clicking row action button', () => {
    const onRowClick = vi.fn();
    render(
      createElement(DataTable, {
        data: rows,
        keyExtractor: (r: Row) => r.id,
        onRowClick,
        columns: [
          { key: 'name', header: 'Họ tên' },
          {
            key: 'actions',
            header: '',
            render: () =>
              createElement(
                'button',
                { type: 'button', 'aria-label': 'Thao tác' },
                '⋯',
              ),
          },
        ],
      }),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Thao tác' }));
    expect(onRowClick).not.toHaveBeenCalled();
  });

  it('does not fire onRowClick when clicking role=menuitem (portal-like bubble)', () => {
    const onRowClick = vi.fn();
    render(
      createElement(DataTable, {
        data: rows,
        keyExtractor: (r: Row) => r.id,
        onRowClick,
        columns: [
          { key: 'name', header: 'Họ tên' },
          {
            key: 'actions',
            header: '',
            // No stopPropagation — DataTable must ignore via role=menuitem closest()
            render: () => createElement('div', { role: 'menuitem' }, 'Xóa'),
          },
        ],
      }),
    );

    fireEvent.click(screen.getByRole('menuitem', { name: 'Xóa' }));
    expect(onRowClick).not.toHaveBeenCalled();
  });
});
