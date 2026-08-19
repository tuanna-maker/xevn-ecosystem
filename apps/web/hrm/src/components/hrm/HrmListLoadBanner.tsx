import { AlertCircle, Info, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type HrmListLoadBannerProps = {
  isLoading?: boolean;
  loadFailed?: boolean;
  errorMessage?: string | null;
  loadingMessage?: string;
  className?: string;
};

/** Aligns with portal `ApiLoadBanner` — visible load/error for embed pilot (no silent empty). */
export function HrmListLoadBanner({
  isLoading = false,
  loadFailed = false,
  errorMessage,
  loadingMessage = 'Đang tải dữ liệu…',
  className,
}: HrmListLoadBannerProps) {
  if (!isLoading && !loadFailed) return null;

  if (isLoading && !loadFailed) {
    return (
      <div
        className={cn(
          'mb-3 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/90 px-4 py-2.5 text-sm text-slate-700',
          className,
        )}
        role="status"
      >
        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" aria-hidden />
        <span>{loadingMessage}</span>
      </div>
    );
  }

  const message =
    errorMessage?.trim() ||
    'Không tải được dữ liệu. Kiểm tra kết nối HRM, phiên đăng nhập và phạm vi công ty.';

  return (
    <div
      className={cn(
        'mb-3 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-950',
        className,
      )}
      role="alert"
    >
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0  hidden " aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="font-semibold">Lỗi tải dữ liệu</p>
        <p className="mt-1 text-xs leading-relaxed">{message}</p>
      </div>
      <Info className="h-4 w-4 shrink-0 text-amber-600 opacity-60" aria-hidden />
    </div>
  );
}
