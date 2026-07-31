/**
 * @CODE-MEMORY
 * Screen:     HRM HoverCard primitive
 * UC:         Hover previews
 * BR:         AC-BRAND-DNA-02 — same popup DNA as Popover
 * SRS:        docs/program/XEVN_BRAND_UIUX_PROPOSAL.md §3
 * TechSpec:   docs/program/XEVN_BRAND_FULL_FE_REMASTER_PROGRAM.md L2
 * Purpose:    HoverCardContent border-xevn-border + rounded-card + shadow-soft.
 * WorkItem:   FE-XEVN-BRAND-PRIMITIVES-L2-01
 * Coded:      2026-07-22
 * Callers:    employee chips · help
 * Callees:    @/lib/utils cn
 * must_keep:  border-xevn-border; rounded-card
 * SOLID:      Chrome only
 * LastVerified: brandPrimitivesL2.test.ts
 */

import * as React from "react";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";

import { cn } from "@/lib/utils";

const HoverCard = HoverCardPrimitive.Root;

const HoverCardTrigger = HoverCardPrimitive.Trigger;

const HoverCardContent = React.forwardRef<
  React.ElementRef<typeof HoverCardPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <HoverCardPrimitive.Content
    ref={ref}
    align={align}
    sideOffset={sideOffset}
    className={cn(
      "z-50 w-64 rounded-card border border-xevn-border bg-popover p-4 text-popover-foreground shadow-soft outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className,
    )}
    {...props}
  />
));
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName;

export { HoverCard, HoverCardTrigger, HoverCardContent };
