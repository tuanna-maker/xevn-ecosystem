/**
 * @CODE-MEMORY
 * Screen:     HRM Input primitive
 * UC:         Form controls HRM embed
 * BR:         AC-BRAND-DNA-01 — rounded-input 8 + border/focus token
 * SRS:        docs/program/XEVN_BRAND_UIUX_PROPOSAL.md §3
 * TechSpec:   docs/program/XEVN_BRAND_FULL_FE_REMASTER_PROGRAM.md L2
 * Purpose:    Text field border-xevn-border + focus ring-xevn-accent; placeholder muted floor.
 * WorkItem:   FE-XEVN-BRAND-PRIMITIVES-L2-01
 * Coded:      2026-07-22
 * Callers:    forms · dialogs · filters
 * Callees:    @/lib/utils cn
 * must_keep:  rounded-input; border-xevn-border; ring-xevn-accent
 * SOLID:      Presentational only
 * LastVerified: brandPrimitivesL2.test.ts
 */

import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-input border border-xevn-border bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-xevn-textMuted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-xevn-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
