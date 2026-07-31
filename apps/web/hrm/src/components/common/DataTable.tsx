/**
 * @CODE-MEMORY
 * Screen:     HRM shared DataTable (Employees list + other tables)
 * UC:         J-HRM-02 list→profile · TC-HRM-HDSD-025 soft-delete
 * BR:         Row click navigates; row actions must not steal navigation
 * SRS:        docs/hrm/SRS.md · employee list mutate
 * TechSpec:   HRM employees list + archive confirm
 * Purpose:    Bảng generic; onRowClick chỉ khi click vùng dữ liệu, không khi
 *             button / menu / input (kể cả Radix portal menuitem bubble React tree).
 * WorkItem:   D-HDSD-BF-03-SOFTDEL-FE-01
 * Coded:      2026-07-31
 * Callers:    Employees.tsx · other HRM list pages
 * Callees:    cn util
 * FEActions:  row click → onRowClick · action cell / menuitem → ignore
 * must_keep:  True data-cell click still calls onRowClick; empty state message
 * SOLID:      Single responsibility — row interaction isolation in table shell
 * LastVerified: DataTable.test.tsx
 *
 * @CODE-MEMORY-CHANGE 2026-07-31 D-HDSD-BF-03-SOFTDEL-FE-01
 * change_mode: FIX
 * What: Skip onRowClick when event target is interactive (button/a/input/menuitem/…)
 * Why: QA TC-025 — menu «Xóa» bubbled to tr → navigate profile; AlertDialog never mounted
 * must_keep: Profile navigate on plain row click; soft-delete path from list menu
 */
import { ReactNode, type MouseEvent } from 'react';
import { cn } from '@/lib/utils';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  className?: string;
  /** Hide this column on mobile screens */
  hideOnMobile?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  className?: string;
}

/** Selectors that must not trigger row navigation (incl. Radix portal menuitems). */
export const DATA_TABLE_ROW_ACTION_SELECTOR = [
  'button',
  'a',
  'input',
  'select',
  'textarea',
  'label',
  '[role="button"]',
  '[role="menuitem"]',
  '[role="menuitemcheckbox"]',
  '[role="menuitemradio"]',
  '[role="option"]',
  '[role="checkbox"]',
  '[role="switch"]',
  '[role="combobox"]',
  '[data-radix-collection-item]',
  '[data-stop-row-click]',
].join(', ');

/**
 * Returns true when the click originated from a control / menu item
 * (including portaled Radix content whose React event still bubbles to <tr>).
 */
export function isDataTableRowActionTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) {
    return false;
  }
  return Boolean(target.closest(DATA_TABLE_ROW_ACTION_SELECTOR));
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  emptyMessage = 'Không có dữ liệu',
  className,
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  const handleRowClick = (item: T, event: MouseEvent<HTMLTableRowElement>) => {
    if (!onRowClick) {
      return;
    }
    if (isDataTableRowActionTarget(event.target)) {
      return;
    }
    onRowClick(item);
  };

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="saas-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  col.className,
                  col.hideOnMobile && 'hidden md:table-cell'
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={keyExtractor(item)}
              onClick={(event) => handleRowClick(item, event)}
              className={cn(onRowClick && 'cursor-pointer')}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn(
                    col.className,
                    col.hideOnMobile && 'hidden md:table-cell'
                  )}
                >
                  {col.render
                    ? col.render(item)
                    : (item as Record<string, unknown>)[col.key] as ReactNode}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
