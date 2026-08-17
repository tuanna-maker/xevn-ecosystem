/**
 * @CODE-MEMORY
 * Screen:     Portal ConfirmDialog (alertdialog overlay)
 * UC:         G-UX-01 · brand L1/L2 popup DNA
 * BR:         Escape cancel; focus trap; no seed
 * SRS:        docs/program/XEVN_BRAND_UIUX_PROPOSAL.md §3–§4 · AC-BRAND-DNA-02
 * TechSpec:   docs/program/XEVN_BRAND_FULL_FE_REMASTER_PROGRAM.md L1–L2
 * Purpose:    Confirm / destructive modal dùng token border + radius-card +
 *             shadow-overlay (`.xevn-dialog-surface`); CTA primary / danger DNA.
 * WorkItem:   FE-XEVN-BRAND-TOKENS-L1-01
 * Coded:      2026-07-22
 * Callers:    useConfirmDialog → CommandCenter / settings mutate flows
 * Callees:    index.css `.xevn-dialog-surface` · Tailwind xevn.*
 * must_keep:  role=alertdialog + Escape cancel; token border (không gray generic);
 *             destructive = xevn-danger (không rose marketing)
 * SOLID:      Presentational dialog; hook owns open state
 * LastVerified: ConfirmDialog.test.tsx
 *
 * @CODE-MEMORY-CHANGE 2026-08-05
 * WorkItem: PO-HRM-UI-BRAND-FE-DIALOG-01
 * change_mode: UPGRADE
 * What: Glass header + wordmark left; Montserrat title ≥20; Source Sans 3 body
 * Why: ADR §16 LOCKED Montserrat+Source Sans 3 · S3=A · portal shell parity ui-neo
 * must_keep: Escape cancel; focus trap; destructive = xevn-danger; no Nest
 * LastVerified: docs/qa/evidence/po-hrm-ui-brand-fe-dialog-01.md
 */

import { useCallback, useEffect, useId, useRef } from 'react';

export type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  confirming?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
};

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Hủy',
  destructive = false,
  confirming = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!open) return;
      if (event.key === 'Escape' && !confirming) {
        event.preventDefault();
        onCancel();
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;

      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((el) => el.offsetParent !== null);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [confirming, onCancel, open],
  );

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    document.addEventListener('keydown', handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [handleKeyDown, open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 px-4 py-8 backdrop-blur-sm"
      role="presentation"
      onClick={() => {
        if (!confirming) onCancel();
      }}
    >
      <div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="xevn-dialog-surface w-full max-w-md p-0"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="xevn-dialog-header-glass flex items-center gap-3 px-5 py-3.5">
          <img
            src="/xevn-logo.png"
            alt=""
            width={32}
            height={32}
            className="xevn-dialog-wordmark !bg-white"
            aria-hidden="true"
          />
          <h2 id={titleId} className="xevn-type-title font-display min-w-0 flex-1 text-xevn-text">
            {title}
          </h2>
        </div>
        <div className="px-6 pb-6 pt-4">
          <p id={descriptionId} className="text-sm leading-relaxed text-xevn-textSecondary">
            {description}
          </p>
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              ref={cancelRef}
              type="button"
              disabled={confirming}
              onClick={onCancel}
              className="rounded-input border border-xevn-border bg-xevn-surface px-4 py-2.5 text-sm font-medium text-xevn-text transition hover:bg-xevn-background disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-xevn-accent"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              disabled={confirming}
              onClick={() => void onConfirm()}
              className={`rounded-input px-4 py-2.5 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                destructive
                  ? 'bg-xevn-danger hover:opacity-90 focus:ring-xevn-danger'
                  : 'bg-xevn-primary hover:bg-xevn-primaryPressed focus:ring-xevn-primary'
              }`}
            >
              {confirming ? 'Đang xử lý…' : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
