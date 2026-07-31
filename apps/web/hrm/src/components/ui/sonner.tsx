/**
 * @CODE-MEMORY
 * Screen:     HRM Sonner toaster wrapper
 * UC:         sonner toast notifications
 * BR:         AC-BRAND-DNA-02 — border token + soft shadow on toast chrome
 * SRS:        docs/program/XEVN_BRAND_UIUX_PROPOSAL.md §3
 * TechSpec:   docs/program/XEVN_BRAND_FULL_FE_REMASTER_PROGRAM.md L2
 * Purpose:    Sonner classNames map border-xevn-border + shadow-soft (+ rounded via toast CSS).
 * WorkItem:   FE-XEVN-BRAND-PRIMITIVES-L2-01
 * Coded:      2026-07-22
 * Callers:    App root Toaster
 * Callees:    sonner · next-themes
 * must_keep:  border-xevn-border; shadow-soft; no API change
 * SOLID:      Thin theme bridge
 * LastVerified: brandPrimitivesL2.test.ts
 */

import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-xevn-border group-[.toaster]:shadow-soft group-[.toaster]:rounded-card",
          description: "group-[.toast]:text-xevn-textSecondary",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-input",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-xevn-textSecondary group-[.toast]:rounded-input group-[.toast]:border group-[.toast]:border-xevn-border",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
