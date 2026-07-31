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
 */

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { getDialogPortalContainer, syncHrmStylesheetsToParentForPortalDialogs } from "@/lib/hrmDialogPortal";
import { attachPortalDialogA11yMirror } from "@/lib/hrmDialogPortalA11y";

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
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
  // Default undefined = Radix DescriptionWarning opt-out when no DialogDescription.
  // Callers may pass an explicit string id to associate a custom description node.
>(({ className, children, "aria-describedby": ariaDescribedBy = undefined, ...props }, ref) => {
  const portalContainer = getDialogPortalContainer();
  if (portalContainer) {
    syncHrmStylesheetsToParentForPortalDialogs();
  }
  const useParentPortal = !!portalContainer;
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
    <DialogPortal {...(useParentPortal ? { container: portalContainer! } : {})}>
      <DialogOverlay className={cn(useParentPortal && "z-[100000]")} />
      <DialogPrimitive.Content
        ref={assignContentRef}
        className={cn(
          // Brand DNA (L1): token border + card radius + overlay shadow — keep bg-background for dark/light shadcn bridge
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 rounded-card border border-xevn-border bg-background p-6 shadow-overlay duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
          useParentPortal && "z-[100000]",
          className,
        )}
        aria-describedby={ariaDescribedBy}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity data-[state=open]:bg-accent data-[state=open]:text-muted-foreground hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-xevn-accent focus:ring-offset-2 disabled:pointer-events-none">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
);
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
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
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
