import React from 'react';
import { cn } from '../lib/utils';

type ColumnRender<T, V = T[keyof T]> = {
  bivarianceHack(value: V, item: T): React.ReactNode;
}['bivarianceHack'];

export interface Column<T> {
  key: Extract<keyof T, string>;
  header: string;
  render?: ColumnRender<T>;
  sortable?: boolean;
  width?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  className?: string;
  keyExtractor?: (item: T, index: number) => React.Key;
  onRowClick?: (item: T) => void;
  searchPlaceholder?: string;
  actions?: React.ReactNode;
}

const renderCellValue = (value: unknown): React.ReactNode => {
  if (React.isValidElement(value)) {
    return value;
  }

  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return String(value);
  }

  if (value == null) {
    return '';
  }

  return JSON.stringify(value);
};

export const DataTable = <T extends object>({
  columns,
  data,
  emptyMessage = 'Không tìm thấy dữ liệu',
  className,
  keyExtractor,
  onRowClick,
  actions,
}: DataTableProps<T>) => {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 bg-xevn-surface rounded-xl border border-xevn-border">
        <div className="mx-auto w-16 h-16 bg-xevn-neutral/10 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-xevn-neutral" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
          </svg>
        </div>
        <h3 className="text-lg font-medium text-xevn-text mb-1">{emptyMessage}</h3>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {actions && <div className="flex justify-end">{actions}</div>}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-xevn-border">
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-xevn-textSecondary uppercase tracking-wider"
                  style={column.width ? { width: column.width } : undefined}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-xevn-border">
            {data.map((row, index) => (
              <tr
                key={keyExtractor ? keyExtractor(row, index) : index}
                className={cn(
                  'hover:bg-xevn-surface/50 transition-colors',
                  onRowClick && 'cursor-pointer'
                )}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-xevn-text">
                    {column.render
                      ? column.render(row[column.key], row)
                      : renderCellValue(row[column.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
