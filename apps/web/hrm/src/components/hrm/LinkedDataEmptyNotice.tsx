import type { ReactNode } from 'react';
import { AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  getLinkedDataEmptyCopy,
  isLinkedDataGap,
  navigatePortalCatalogSync,
  type LinkedDataMenuKey,
} from '@/lib/hrmLinkedDataEmpty';
import { getHrmPortalMode } from '@/lib/hrmPortalMode';
import { cn } from '@/lib/utils';

export type LinkedDataEmptyNoticeProps = {
  menu: LinkedDataMenuKey;
  listCount: number;
  workforceTotal: number | null | undefined;
  apiMode: boolean;
  className?: string;
  /** Render inside table cell (compact). */
  compact?: boolean;
};

export function LinkedDataEmptyNotice({
  menu,
  listCount,
  workforceTotal,
  apiMode,
  className,
  compact = false,
}: LinkedDataEmptyNoticeProps) {
  if (!isLinkedDataGap(listCount, workforceTotal, apiMode)) {
    return null;
  }

  const copy = getLinkedDataEmptyCopy(menu);
  const portalEmbed =
    typeof window !== 'undefined' && getHrmPortalMode(window.location.search);

  const body = (
    <>
      <p className={compact ? 'text-sm' : 'text-sm leading-relaxed'}>{copy.body}</p>
      <p className="mt-2 text-xs text-muted-foreground">{copy.seedHint}</p>
      <p className="mt-1 text-xs text-muted-foreground">{copy.syncHint}</p>
      {portalEmbed ? (
        <Button
          type="button"
          variant="link"
          className="mt-2 h-auto p-0 text-xs font-semibold text-primary"
          onClick={() => navigatePortalCatalogSync()}
        >
          Mở đồng bộ danh mục HRM (Command Center)
          <ExternalLink className="ml-1 inline h-3 w-3" />
        </Button>
      ) : null}
      <p className="mt-2 text-xs tabular-nums text-slate-600">
        Nhân sự trong phạm vi: <strong>{workforceTotal}</strong> · Bản ghi menu: <strong>0</strong>
      </p>
    </>
  );

  if (compact) {
    return (
      <div className={cn('mx-auto max-w-lg space-y-1 text-left', className)}>
        <p className="font-medium text-amber-900">{copy.title}</p>
        {body}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-amber-950',
        className,
      )}
      role="status"
    >
      <div className="flex gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0  hidden " aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{copy.title}</p>
          {body}
        </div>
      </div>
    </div>
  );
}

/** Table empty row content: generic noData vs linked-data gap. */
export function renderListEmptyContent(
  menu: LinkedDataMenuKey,
  opts: {
    listCount: number;
    workforceTotal: number | null | undefined;
    apiMode: boolean;
    genericLabel: string;
  },
): ReactNode {
  if (isLinkedDataGap(opts.listCount, opts.workforceTotal, opts.apiMode)) {
    return (
      <LinkedDataEmptyNotice
        menu={menu}
        listCount={opts.listCount}
        workforceTotal={opts.workforceTotal}
        apiMode={opts.apiMode}
        compact
      />
    );
  }
  return opts.genericLabel;
}
