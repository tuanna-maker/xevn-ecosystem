import { useCallback, useState } from 'react';
import { ConfirmDialog } from './ConfirmDialog';

export type ConfirmDialogRequest = {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void | Promise<void>;
};

export function useConfirmDialog() {
  const [request, setRequest] = useState<ConfirmDialogRequest | null>(null);
  const [confirming, setConfirming] = useState(false);

  const requestConfirm = useCallback((next: ConfirmDialogRequest) => {
    setRequest(next);
  }, []);

  const dismiss = useCallback(() => {
    if (!confirming) setRequest(null);
  }, [confirming]);

  const handleConfirm = useCallback(async () => {
    if (!request) return;
    setConfirming(true);
    try {
      await request.onConfirm();
      setRequest(null);
    } finally {
      setConfirming(false);
    }
  }, [request]);

  const confirmDialog = (
    <ConfirmDialog
      open={request !== null}
      title={request?.title ?? ''}
      description={request?.description ?? ''}
      confirmLabel={request?.confirmLabel}
      cancelLabel={request?.cancelLabel}
      destructive={request?.destructive}
      confirming={confirming}
      onConfirm={handleConfirm}
      onCancel={dismiss}
    />
  );

  return { requestConfirm, confirmDialog, confirming };
}
