export type SwipeActionKind = 'approve' | 'decline' | 'detail' | 'cancel';

export type SwipeActionTone = 'success' | 'danger' | 'primary' | 'warning';

export type SwipeActionSpec = {
  key: string;
  kind: SwipeActionKind;
  label: string;
  tone: SwipeActionTone;
};

export type MyLeavesTab = 'review' | 'approved' | 'rejected';

/** Manager pending inbox — swipe reveals Duyệt / Từ chối (MOB-UX-13f). */
export function resolveManagerApprovalSwipeActions(): SwipeActionSpec[] {
  return [
    { key: 'decline', kind: 'decline', label: 'Từ chối', tone: 'danger' },
    { key: 'approve', kind: 'approve', label: 'Duyệt', tone: 'success' },
  ];
}

/** My leave list — detail always; cancel only on pending tab (MOB-UX-13f). */
export function resolveLeaveListSwipeActions(tab: MyLeavesTab, status: string): SwipeActionSpec[] {
  const detail: SwipeActionSpec = {
    key: 'detail',
    kind: 'detail',
    label: 'Chi tiết',
    tone: 'primary',
  };

  if (tab === 'review' && status === 'pending') {
    return [
      { key: 'cancel', kind: 'cancel', label: 'Hủy đơn', tone: 'warning' },
      detail,
    ];
  }

  return [detail];
}

export function handleManagerSwipeAction(
  kind: SwipeActionKind,
  handlers: { onApprove: () => void; onDecline: () => void },
): void {
  if (kind === 'approve') handlers.onApprove();
  else if (kind === 'decline') handlers.onDecline();
}

export function handleLeaveSwipeAction(
  kind: SwipeActionKind,
  handlers: { onDetail: () => void; onCancel: () => void },
): void {
  if (kind === 'detail') handlers.onDetail();
  else if (kind === 'cancel') handlers.onCancel();
}
