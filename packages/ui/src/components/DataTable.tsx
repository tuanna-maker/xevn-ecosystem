import React from 'react';
import { cn } from '../lib/utils';

export interface DataTableProps<T> {
  columns: { key: string; header: string; render?: (item: T) => React.ReactNode }[];
  data: T[];
  emptyMessage?: string;
  className?: string;
}

export const DataTable: React.FC<DataTableProps<any>> = ({
  columns,
  data,
  emptyMessage = 'Không tìm thấy dữ liệu',
  className,
}) => {
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
    <div className={cn('overflow-x-auto', className)}>
      <table className="min-w-full divide-y divide-xevn-border">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-6 py-3 text-left text-xs font-medium text-xevn-textSecondary uppercase tracking-wider"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-xevn-border">
          {data.map((row, index) => (
            <tr key={index} className="hover:bg-xevn-surface/50 transition-colors">
              {columns.map((column) => (
                <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-xevn-text">
                  {column.render ? column.render(row) : row[column.key as keyof typeof row]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
