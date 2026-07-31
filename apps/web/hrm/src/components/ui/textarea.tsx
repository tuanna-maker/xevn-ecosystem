/**
 * @CODE-MEMORY
 * Screen:     HRM Textarea primitive
 * UC:         Multi-line form fields
 * BR:         AC-BRAND-DNA-01 — rounded-input + token border/focus
 * SRS:        docs/program/XEVN_BRAND_UIUX_PROPOSAL.md §3
 * TechSpec:   docs/program/XEVN_BRAND_FULL_FE_REMASTER_PROGRAM.md L2
 * Purpose:    Textarea cùng DNA input (border-xevn-border + ring-xevn-accent).
 * WorkItem:   FE-XEVN-BRAND-PRIMITIVES-L2-01
 * Coded:      2026-07-22
 * Callers:    leave / notes / job desc forms
 * Callees:    @/lib/utils cn
 * must_keep:  rounded-input; border-xevn-border; ring-xevn-accent
 * SOLID:      Presentational only
 * LastVerified: brandPrimitivesL2.test.ts
 */

import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-input border border-xevn-border bg-background px-3 py-2 text-base ring-offset-background placeholder:text-xevn-textMuted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-xevn-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
