/**
 * @CODE-MEMORY
 * Screen:     HRM Dialog primitive (shadcn / Radix)
 * UC:         UF-HRM-06 + all DialogContent surfaces
 * BR:         Radix TitleWarning / DescriptionWarning must not spam console
 * SRS:        docs/hrm/SRS.md · dialog a11y
 * TechSpec:   @radix-ui/react-dialog TitleWarning uses document.getElementById
 * Purpose:    Shared DialogContent — parent-portal container + iframe a11y id mirror;
 *             default aria-describedby={undefined} silences DescriptionWarning globally.
 * WorkItem:   D-FE-CONSOLE-A11Y-DIALOG-RR-01
 * Coded:      2026-07-20
 * Callers:    all apps/web/hrm Dialog* consumers
 * Callees:    hrmDialogPortal · hrmDialogPortalA11y
 * must_keep:  attachPortalDialogA11yMirror from content callback ref (Presence-safe);
 *             consumer DialogTitle still required for real a11y labels
 * SOLID:      SRP — chrome + portal a11y; business copy stays in callers
 * LastVerified: employeeSalaryDialogA11y.test.ts · dialogA11yPrimitive.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-20
 * WorkItem: D-HRM-EMP-SALARY-DIALOG-A11Y-01 / R2
 * change_mode: FIX
 * What: attachPortalDialogA11yMirror from content callback ref (+ microtask/MO)
 * Why: Parent-portaled Title/Description ids invisible to iframe document.getElementById
 * must_keep: Invalid time / UF-HRM-06 payDate formatters untouched
 *
 * @CODE-MEMORY-CHANGE 2026-07-20
 * WorkItem: D-FE-CONSOLE-A11Y-DIALOG-RR-01
 * change_mode: FIX
 * What: Default aria-describedby={undefined} on DialogContent (Radix opt-out);
 *       AlertDialog portal mirror; CommandDialog sr-only DialogTitle;
 *       HRM BrowserRouter v7_startTransition + v7_relativeSplatPath
 * Why: Sponsor console — Missing Description + RR Future Flag every run
 * must_keep: portal a11y mirror; flushSync soft-nav; no ScopeBar remount
 *
 * @CODE-MEMORY-CHANGE 2026-07-22
 * WorkItem: FE-XEVN-BRAND-TOKENS-L1-01
 * change_mode: ADD
 * What: DialogContent border/radius/shadow → xevn tokens (border-xevn-border,
 *       rounded-card, shadow-overlay); close focus ring → ring-xevn-accent
 * Why: L1 bootstrap AC-BRAND-DNA-02 — popup DNA trước full L2 primitive wave
 * must_keep: portal a11y mirror; default aria-describedby undefined; no UF change
 *
 * @CODE-MEMORY-CHANGE 2026-07-22
 * WorkItem: FE-XEVN-BRAND-PRIMITIVES-L2-01
 * change_mode: ADD
 * What: DialogDescription → text-xevn-textSecondary (sharp-ops secondary floor)
 * Why: Finish L1 leftover — description muted ≠ pale body
 * must_keep: portal a11y; Title required in consumers
 *
 * @CODE-MEMORY-CHANGE 2026-08-05
 * WorkItem: PO-HRM-UI-BRAND-FE-FOUND-01
 * change_mode: UPGRADE
 * What: DialogContent + `xevn-dialog-surface` (ADR §10 thin primary brand bar)
 * Why: Shared modal chrome baseline — ops-dense; no per-screen redesign
 * must_keep: portal a11y mirror; Description text-xevn-textSecondary; no UF change
 *
 * @CODE-MEMORY-CHANGE 2026-08-05
 * WorkItem: PO-HRM-UI-BRAND-FE-FOUND-01-R1
 * change_mode: FIX
 * What: DialogTitle drop `text-xl` (1.25rem→17.5px @14px root); rely `.xevn-type-title`
 *       absolute ≥20px + font-bold 700 + text-xevn-text #111827
 * Why: QA FAIL Import DialogTitle computed 17.5px — ADR §7/§10 modal title ≥20 bold
 * ADR: ADR-XEVN-PRECISION-MOTION-TOKENS-20260805 §7 type floors · §10
 * must_keep: primary bar #1E40AF; portal a11y; no Nest/API; no W3 rewrite
 * LastVerified: docs/qa/evidence/po-hrm-ui-brand-fe-found-01-r1.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-05
 * WorkItem: PO-HRM-UI-BRAND-FE-DIALOG-01
 * change_mode: UPGRADE
 * What: DialogHeader glass + wordmark left; brand bar 4px via surface; Montserrat title
 * Why: ADR §16 LOCKED Montserrat+Source Sans 3 · S3=A · B4 cấm AI · ui-neo dialog-leave|ot
 * must_keep: portal a11y mirror; leave/OT mutate wires; Face HOLD; no Nest/API; no remaster DONE
 * LastVerified: docs/qa/evidence/po-hrm-ui-brand-fe-dialog-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-06
 * WorkItem: PO-HRM-UI-DIALOG-CENTER-01
 * change_mode: FIX
 * What: DialogContent center via fixed inset-0 + m-auto + h-fit + max-h-[90vh] overflow-y-auto;
 *       drop top/left 50% + translate (broken when tall form / parent portal); fade+zoom only
 * Why: Sponsor — «Tạo tin tuyển dụng» top mid-viewport, bottom cut off in CC embed
 * must_keep: DialogHeader glass/wordmark; Escape/close; focus trap; portal a11y mirror
 * LastVerified: docs/qa/evidence/po-hrm-ui-dialog-center-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-06
 * WorkItem: PO-HRM-UI-DIALOG-CENTER-01-R2
 * change_mode: FIX
 * What: Rely on index.css `.xevn-dialog-surface:not(.fixed)` — base surface no longer sets
 *       position:relative / overflow:hidden (DEF-DIALOG-CENTER-CSS-OVERRIDE). Content keeps
 *       class `fixed inset-0 m-auto … overflow-y-auto`; ::before bar still absolute on fixed box.
 * Why: QA FAIL — computed position stayed relative in CC parent portal → panel y≈vh off-screen
 * must_keep: DialogHeader glass/wordmark; Escape/close; portal a11y mirror; JobPostings mutate;
 *            LOGO-02 white pad untouched
 * LastVerified: docs/qa/evidence/po-hrm-ui-dialog-center-01-r2.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-06
 * WorkItem: PO-HRM-UI-P0-LOGO-FONT-TITLE-01
 * change_mode: FIX
 * What: DialogHeader wordmark `!bg-white` — pad SURFACE (CSS was brand-shell #000)
 * Why: Sponsor — logo popup nền đen; login LOGO-02 already white
 * must_keep: dialog center R2; glass header; Escape/close; portal a11y; no invent gradient
 * LastVerified: docs/qa/evidence/po-hrm-ui-p0-logo-font-title-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-06
 * WorkItem: PO-HRM-UI-HEADER-JD-DND-FE-01
 * change_mode: FIX
 * What: DialogContent `portalScope?: 'iframe'|'parent'` — JD DnD needs iframe document
 *       (hello-pangea findDragHandle queries iframe `document`, not parent portal DOM).
 * Why: Sponsor P0 — Unable to find drag handle on canvas-SEC_* / pal-SEC_* in CC embed
 * must_keep: default omit = parent portal (center over CC chrome); dialog center R2; a11y mirror
 * LastVerified: docs/qa/evidence/po-hrm-ui-header-jd-dnd-fe-01.md
 */

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  getRadixPortalContainer,
  isHrmDialogMountedToPortalParent,
  syncHrmStylesheetsToParentForPortalDialogs,
} from "@/lib/hrmDialogPortal";
import { attachPortalDialogA11yMirror } from "@/lib/hrmDialogPortalA11y";
import {
  HrmOverlayPortalScopeContext,
  type HrmOverlayPortalScope,
} from "@/lib/hrmOverlayPortalScope";

type DialogHeaderProps = React.HTMLAttributes<HTMLDivElement> & {
  /** ADR §15.4 / B2 — logo + glass row (default on). Set false for sr-only shells. */
  brandChrome?: boolean;
};

type DialogContentProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
  /**
   * `'iframe'` — mount in HRM iframe body (required for @hello-pangea/dnd inside dialog).
   * omit / `'parent'` — parent body when embed portal (covers CC chrome).
   */
  portalScope?: "iframe" | "parent";
};

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
  // Default undefined = Radix DescriptionWarning opt-out when no DialogDescription.
  // Callers may pass an explicit string id to associate a custom description node.
>(
  (
    {
      className,
      children,
      portalScope,
      "aria-describedby": ariaDescribedBy = undefined,
      ...props
    },
    ref,
  ) => {
    const mount = getRadixPortalContainer(portalScope);
    const useParentPortal = isHrmDialogMountedToPortalParent(portalScope);
    const overlayPortalScope: HrmOverlayPortalScope = portalScope === "iframe" ? "iframe" : useParentPortal ? "parent" : "iframe";
    if (useParentPortal) {
      syncHrmStylesheetsToParentForPortalDialogs();
    }
    const a11yMirrorCleanupRef = React.useRef<(() => void) | null>(null);

    const assignContentRef = React.useCallback(
      (node: React.ElementRef<typeof DialogPrimitive.Content> | null) => {
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;

        a11yMirrorCleanupRef.current?.();
        a11yMirrorCleanupRef.current = null;

        // Callback ref fires when Radix Presence mounts ContentImpl — even if this wrapper
        // does not re-render. Must run before TitleWarning/DescriptionWarning useEffect.
        if (node && useParentPortal) {
          a11yMirrorCleanupRef.current = attachPortalDialogA11yMirror(node);
        }
      },
      [ref, useParentPortal],
    );

    React.useEffect(() => {
      return () => {
        a11yMirrorCleanupRef.current?.();
        a11yMirrorCleanupRef.current = null;
      };
    }, []);

    return (
      <DialogPortal container={mount}>
        <DialogOverlay className={cn(useParentPortal && "z-[100000]")} />
        <DialogPrimitive.Content
          ref={assignContentRef}
          className={cn(
            // Brand DNA (ADR §10) + viewport center (PO-HRM-UI-DIALOG-CENTER-01):
            // inset-0 + m-auto + h-fit centers without translate (avoids mid-viewport top when tall).
            // max-h + overflow-y-auto: long forms scroll inside panel; footer stays reachable.
            "xevn-dialog-surface fixed inset-0 z-50 m-auto grid h-fit max-h-[90vh] w-full max-w-lg gap-4 overflow-y-auto bg-background p-6 duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            useParentPortal && "z-[100000]",
            className,
          )}
          aria-describedby={ariaDescribedBy}
          {...props}
        >
          <HrmOverlayPortalScopeContext.Provider value={overlayPortalScope}>
            {children}
          </HrmOverlayPortalScopeContext.Provider>
          <DialogPrimitive.Close className="absolute right-4 top-5 z-20 rounded-sm opacity-70 ring-offset-background transition-opacity data-[state=open]:bg-accent data-[state=open]:text-muted-foreground hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-xevn-accent focus:ring-offset-2 disabled:pointer-events-none">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPortal>
    );
  },
);
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, brandChrome = true, children, ...props }: DialogHeaderProps) => {
  if (!brandChrome) {
    return (
      <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props}>
        {children}
      </div>
    );
  }
  return (
    <div
      className={cn(
        "xevn-dialog-header-glass -mx-6 -mt-6 mb-0 flex items-center gap-3 px-5 py-3.5 pr-12 text-left",
        className,
      )}
      {...props}
    >
      <img
        src="/xevn-logo.png"
        alt=""
        width={32}
        height={32}
        className="xevn-dialog-wordmark !bg-white"
        data-testid="xevn-dialog-wordmark"
        aria-hidden="true"
      />
      <div className="flex min-w-0 flex-1 flex-col space-y-1.5 text-left">{children}</div>
    </div>
  );
};
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "xevn-type-title font-display text-[20px] font-bold leading-none tracking-tight text-xevn-text",
      className,
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={cn("text-sm text-xevn-textSecondary", className)} {...props} />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
