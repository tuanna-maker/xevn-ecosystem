/**
 * @CODE-MEMORY
 * Screen:     HRM Button primitive (shadcn / CVA)
 * UC:         Shared CTA across HRM embed
 * BR:         AC-BRAND-DNA-01 — radius input 8 + focus accent
 * SRS:        docs/program/XEVN_BRAND_UIUX_PROPOSAL.md §3
 * TechSpec:   docs/program/XEVN_BRAND_FULL_FE_REMASTER_PROGRAM.md L2
 * Purpose:    Button variants dùng token border + focus ring accent (#06B6D4);
 *             outline border = xevn-border; radius = rounded-input.
 * WorkItem:   FE-XEVN-BRAND-PRIMITIVES-L2-01
 * Coded:      2026-07-22
 * Callers:    AlertDialogAction/Cancel · forms · toolbars
 * Callees:    ../../lib/utils cn · Tailwind xevn.*
 * must_keep:  focus-visible:ring-xevn-accent; outline border-xevn-border; asChild Slot
 * SOLID:      CVA variants only — no business copy
 * LastVerified: brandPrimitivesL2.test.ts
 */

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-input text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-xevn-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-soft hover:opacity-90 active:scale-95",
        destructive:
          "bg-destructive text-destructive-foreground shadow-soft hover:opacity-90 active:scale-95",
        outline:
          "border border-xevn-border bg-background hover:bg-accent hover:text-accent-foreground active:scale-95",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:opacity-95 active:scale-95",
        ghost: "hover:bg-accent hover:text-accent-foreground active:scale-95",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-input px-3",
        lg: "h-11 rounded-input px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
