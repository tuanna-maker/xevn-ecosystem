/**
 * @CODE-MEMORY
 * Screen:     /notifications — Hộp thông báo HRM (inbox list + mark read)
 * UC:         UC-HRM-12 · HRM-NT-01
 * SRS:        docs/hrm/SRS.md · docs/qa/professional/by-uc/HRM-NT-01.md
 * Purpose:    List inbox by company_id + employee_id; row «Đánh dấu đã đọc» → PATCH 2xx → invalidate → F5-safe
 * WorkItem:   PO-UC-TC-W4-FE-NT01-INBOX-MARK-READ-01
 * Coded:      2026-08-04
 * must_keep:  U65 FE-only fanout; no seed; employee_id from membership
 *
 * @CODE-MEMORY-CHANGE 2026-08-04 PO-UC-TC-W4-FE-NT01-MARK-COMPANY-UUID-01
 * change_mode: FIX
 * What: mark CTA only when canMarkHrmInboxPersonalRead (recipient_employee_id set); hook sends UUID company_id
 * Why: QA R3 VAL-001 slug + BA personal-only mark; broadcast NULL SPEC_GAP
 * must_keep: GET inbox list; ceo@ EXPECTED_NO_INBOX; U65 no seed
 */
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { useHrmInboxNotifications } from '@/hooks/useHrmInboxNotifications';
import {
  canMarkHrmInboxPersonalRead,
  inboxNotificationSummary,
  isHrmInboxUnread,
} from '@/lib/hrmInboxNotificationDisplay';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function InboxNotifications() {
  const { t } = useTranslation();
  const { enabled, rows, isLoading, isError, markRead, isMarkingRead, refetch } = useHrmInboxNotifications({
    limit: 50,
  });

  const onMarkRead = async (id: string) => {
    const row = rows.find((r) => r.id === id);
    if (!row || !canMarkHrmInboxPersonalRead(row)) return;
    try {
      await markRead(row);
      toast.success(t('header.inboxMarkedRead', 'Đã đánh dấu đã đọc'));
      await refetch();
    } catch {
      /* toast from mutation */
    }
  };

  if (!enabled) {
    return (
      <Card className="rounded-card shadow-soft">
        <CardHeader>
          <CardTitle>{t('header.notifications')}</CardTitle>
          <CardDescription>
            {t(
              'header.inboxRequiresEmployee',
              'Thông báo HRM cần tài khoản gắn mã nhân viên trên công ty đang chọn.',
            )}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="xevn-safe-inline space-y-4 py-4">
      <div className="flex h-10 items-center justify-between gap-4">
        <h1 className="text-lg font-semibold text-foreground md:text-xl">{t('header.notifications')}</h1>
        <Button variant="outline" size="sm" className="h-10" onClick={() => void refetch()} disabled={isLoading}>
          {t('common.refresh', 'Tải lại')}
        </Button>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t('common.loading', 'Đang tải…')}
        </div>
      )}

      {isError && (
        <p className="text-sm text-destructive">
          {t('header.inboxLoadError', 'Không tải được thông báo. Thử Tải lại hoặc đăng nhập lại.')}
        </p>
      )}

      {!isLoading && !isError && rows.length === 0 && (
        <Card className="rounded-card shadow-soft">
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            {t('header.inboxEmpty', 'Chưa có thông báo. Tạo luồng nghiệp vụ từ màn hình (U65) để nhận thông báo mới.')}
          </CardContent>
        </Card>
      )}

      <ul className="space-y-2">
        {rows.map((row) => {
          const unread = isHrmInboxUnread(row);
          return (
            <li key={row.id}>
              <Card className={`rounded-card shadow-soft ${unread ? 'border-primary/30 bg-primary/5' : ''}`}>
                <CardContent className="flex flex-wrap items-start justify-between gap-3 py-4">
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium">{inboxNotificationSummary(row)}</p>
                      {unread ? (
                        <Badge variant="secondary" className="text-[10px]">
                          {t('header.unread', 'Chưa đọc')}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px]">
                          {t('header.read', 'Đã đọc')}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(row.created_at).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  {canMarkHrmInboxPersonalRead(row) && (
                    <Button
                      size="sm"
                      variant="default"
                      className="h-9 shrink-0"
                      disabled={isMarkingRead}
                      data-testid={`inbox-mark-read-${row.id}`}
                      onClick={() => void onMarkRead(row.id)}
                    >
                      {isMarkingRead ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        t('header.markRead', 'Đánh dấu đã đọc')
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
