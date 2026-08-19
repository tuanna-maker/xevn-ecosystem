/**
 * Phân trang danh sách catalog Cài đặt HRM.
 * WorkItem: PO-HRM-SETTINGS-IA-UX-REMasters-SPONSOR-01
 */
import { Button } from '@/components/ui/button';

export type SettingsCatalogPaginationProps = {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  testId?: string;
};

export function SettingsCatalogPagination({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
  testId = 'settings-catalog-pagination',
}: SettingsCatalogPaginationProps) {
  if (total === 0) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div
      className="flex flex-wrap items-center justify-between gap-2 border-t border-xevn-border pt-3"
      data-testid={testId}
    >
      <p className="text-sm text-xevn-textSecondary">
        {total <= pageSize
          ? `Tổng ${total} dòng`
          : `Hiển thị ${from}–${to} / ${total} dòng`}
      </p>
      {totalPages > 1 ? (
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 shrink-0"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            data-testid={`${testId}-prev`}
          >
            Trước
          </Button>
          <span className="min-w-[5.5rem] text-center text-sm tabular-nums text-xevn-text">
            Trang {page}/{totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 shrink-0"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            data-testid={`${testId}-next`}
          >
            Sau
          </Button>
        </div>
      ) : null}
    </div>
  );
}
