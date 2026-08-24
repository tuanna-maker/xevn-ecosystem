/**
 * @CODE-MEMORY
 * Screen:     HRM Popover primitive
 * UC:         Contextual overlays
 * BR:         AC-BRAND-DNA-02 — rounded-card + border token + soft shadow
 * SRS:        docs/program/XEVN_BRAND_UIUX_PROPOSAL.md §3
 * TechSpec:   docs/program/XEVN_BRAND_FULL_FE_REMASTER_PROGRAM.md L2
 * Purpose:    PopoverContent DNA popup (border-xevn-border / rounded-card / shadow-soft).
 * WorkItem:   FE-XEVN-BRAND-PRIMITIVES-L2-01
 * Coded:      2026-07-22
 * Callers:    date pickers · filters · help tips
 * Callees:    hrmDialogPortal · Tailwind xevn.*
 * must_keep:  parent portal; border-xevn-border; rounded-card
 * SOLID:      Chrome only
 * LastVerified: brandPrimitivesL2.test.ts
 */

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";

import { cn } from "../../lib/utils";



const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> & {
    portalScope?: 'iframe' | 'parent';
  }
>(({ className, align = "center", sideOffset = 4, portalScope, ...props }, ref) => {
  
  const mount = undefined; const floatingZClass = 'z-50';
  return (
  <PopoverPrimitive.Portal container={mount}>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "w-72 rounded-card border border-xevn-border bg-white p-4 text-black shadow-soft outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        floatingZClass,
        className,
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
  );
});
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverTrigger, PopoverContent };
