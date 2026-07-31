/**
 * @CODE-MEMORY
 * Screen:     HRM AlertDialog primitive (shadcn / Radix)
 * UC:         confirm delete / destructive confirms across HRM
 * BR:         Parent-portal AlertDialog must satisfy TitleWarning via iframe id mirror
 * Purpose:    AlertDialogContent portals to parent when embed; mirrors a11y ids like Dialog
 * WorkItem:   D-FE-CONSOLE-A11Y-DIALOG-RR-01
 * Coded:      2026-07-20
 * Callers:    LeaveTab / Employees / Contracts / … AlertDialog*
 * Callees:    hrmDialogPortal · hrmDialogPortalA11y
 * must_keep:  AlertDialogTitle + AlertDialogDescription in consumer trees
 * SOLID:      SRP — portal chrome only
 * LastVerified: dialogA11yPrimitive.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-22
 * WorkItem: FE-XEVN-BRAND-TOKENS-L1-01
 * change_mode: ADD
 * What: AlertDialogContent → border-xevn-border + rounded-card + shadow-overlay
 * Why: Same popup DNA as DialogContent (AC-BRAND-DNA-02 L1 bootstrap)
 * must_keep: portal a11y mirror; Title+Description in consumers
 *
 * @CODE-MEMORY-CHANGE 2026-07-22
 * WorkItem: FE-XEVN-BRAND-PRIMITIVES-L2-01
 * change_mode: ADD
 * What: AlertDialogAction/Cancel inherit button token CTA (accent focus + outline
 *       border-xevn-border); Description → text-xevn-textSecondary
 * Why: Finish L1 leftover — confirm CTAs match brand DNA
 * must_keep: buttonVariants(); portal a11y; Title+Description in consumers
 */

import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";

import { cn } from "@/lib/utils";
import { getDialogPortalContainer, syncHrmStylesheetsToParentForPortalDialogs } from "@/lib/hrmDialogPortal";
import { attachPortalDialogA11yMirror } from "@/lib/hrmDialogPortalA11y";
import { buttonVariants } from "@/components/ui/button";

const AlertDialog = AlertDialogPrimitive.Root;

const AlertDialogTrigger = AlertDialogPrimitive.Trigger;

const AlertDialogPortal = AlertDialogPrimitive.Portal;

const AlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
    ref={ref}
  />
));
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;

const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(({ className, ...props }, ref) => {
  const portalContainer = getDialogPortalContainer();
  if (portalContainer) {
    syncHrmStylesheetsToParentForPortalDialogs();
  }
  const useParentPortal = !!portalContainer;
  const a11yMirrorCleanupRef = React.useRef<(() => void) | null>(null);

  const assignContentRef = React.useCallback(
    (node: React.ElementRef<typeof AlertDialogPrimitive.Content> | null) => {
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;

      a11yMirrorCleanupRef.current?.();
      a11yMirrorCleanupRef.current = null;

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
    <AlertDialogPortal {...(useParentPortal ? { container: portalContainer! } : {})}>
      <AlertDialogOverlay className={cn(useParentPortal && "z-[100000]")} />
      <AlertDialogPrimitive.Content
        ref={assignContentRef}
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 rounded-card border border-xevn-border bg-background p-6 shadow-overlay duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
          useParentPortal && "z-[100000]",
          className,
        )}
        {...props}
      />
    </AlertDialogPortal>
  );
});
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;

const AlertDialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
);
AlertDialogHeader.displayName = "AlertDialogHeader";

const AlertDialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
);
AlertDialogFooter.displayName = "AlertDialogFooter";

const AlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title ref={ref} className={cn("text-lg font-semibold", className)} {...props} />
));
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName;

const AlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description ref={ref} className={cn("text-sm text-xevn-textSecondary", className)} {...props} />
));
AlertDialogDescription.displayName = AlertDialogPrimitive.Description.displayName;

const AlertDialogAction = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Action
    ref={ref}
    className={cn(buttonVariants({ variant: "default" }), className)}
    {...props}
  />
));
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName;

const AlertDialogCancel = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel
    ref={ref}
    className={cn(buttonVariants({ variant: "outline" }), "mt-2 sm:mt-0", className)}
    {...props}
  />
));
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName;

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
