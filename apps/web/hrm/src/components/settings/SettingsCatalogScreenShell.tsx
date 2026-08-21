/**
 * Khung list catalog chuẩn Cài đặt HRM — search mã/tên · toolbar đồng bộ.
 * WorkItem: PO-HRM-SETTINGS-IA-UX-REMasters-SPONSOR-01
 */
import { RefreshCw, Plus } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export type SettingsCatalogScreenShellProps = {
  title: string;
  description?: ReactNode;
  testId?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  onRefresh?: () => void;
  refreshing?: boolean;
  onAdd?: () => void;
  addLabel?: string;
  filterSlot?: ReactNode;
  honestySlot?: ReactNode;
  footerSlot?: ReactNode;
  /** Giảm padding — tối đa không gian bảng (embed CC). */
  compact?: boolean;
  children: ReactNode;
};

export function SettingsCatalogScreenShell({
  title,
  description,
  testId,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Tìm theo mã hoặc tên…',
  onRefresh,
  refreshing,
  onAdd,
  addLabel = 'Thêm mới',
  filterSlot,
  honestySlot,
  footerSlot,
  compact = false,
  children,
}: SettingsCatalogScreenShellProps) {
  return (
    <Card
      className="w-full max-w-none rounded-card border-xevn-border bg-white text-slate-900 shadow-soft dark:bg-white dark:text-slate-900 dark:border-slate-200"
      data-testid={testId}
    >
      <CardHeader className={compact ? 'space-y-1 p-4 pb-2' : 'space-y-1 p-5 pb-3'}>
        <div className="flex min-h-10 flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-lg font-bold text-slate-900 sm:text-[20px]">{title}</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            {onRefresh ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 shrink-0 whitespace-nowrap border-slate-200 bg-white px-3 text-slate-800 hover:bg-slate-50"
                disabled={refreshing}
                onClick={onRefresh}
                data-testid={testId ? `${testId}-refresh` : undefined}
              >
                <RefreshCw className={`mr-1.5 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Làm mới
              </Button>
            ) : null}
            {onAdd ? (
              <Button
                type="button"
                size="sm"
                className="h-9 shrink-0 whitespace-nowrap px-3"
                onClick={onAdd}
                data-testid={testId ? `${testId}-add` : undefined}
              >
                <Plus className="mr-1.5 h-4 w-4" />
                {addLabel}
              </Button>
            ) : null}
          </div>
        </div>
        {description ? (
          <CardDescription className="text-sm text-slate-600 sm:text-[15px]">
            {description}
          </CardDescription>
        ) : null}
        {honestySlot}
      </CardHeader>
      <CardContent className={compact ? 'space-y-3 p-4 pt-0' : 'space-y-4 p-5 pt-0'}>
        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-12 space-y-1 lg:col-span-7">
            <Label htmlFor={`${testId ?? 'settings'}-search`} className="text-slate-700">
              Tìm kiếm
            </Label>
            <Input
              id={`${testId ?? 'settings'}-search`}
              className="h-9 w-full rounded-input border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              data-testid={testId ? `${testId}-search` : 'settings-catalog-search'}
            />
          </div>
          {filterSlot ? <div className="col-span-12 lg:col-span-5">{filterSlot}</div> : null}
        </div>
        <div className="min-w-0 overflow-x-auto text-slate-900">{children}</div>
        {footerSlot}
      </CardContent>
    </Card>
  );
}
