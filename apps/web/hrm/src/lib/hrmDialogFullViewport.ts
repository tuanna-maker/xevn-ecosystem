/**
 * @CODE-MEMORY
 * Screen:     HRM CC embed — mutate dialogs (parent portal)
 * UC:         UF-HRM-* · Settings §16 · HRM-CI-01
 * SRS:        docs/hrm/ui-screens/PAT-DIALOG-FULL-VIEWPORT-CC-01.md
 * TechSpec:   Contracts.tsx create/view DialogContent (SA Option A)
 * Purpose:    Shared ~90vw×90vh shell when Dialog portals to Command Center parent document.
 * WorkItem:   PO-HRM-UI-DIALOG-FULL-VIEWPORT-FE-01
 * Coded:      2026-08-10
 * Callers:    JdTemplateWriterDialog · JdMasterLibrarySettingsPanel · ContractLegalPrintSettingsPanel · Contracts
 * must_keep:  Omit portalScope iframe on these dialogs; data-hrm-dialog-portal=parent for QA
 * SOLID:      Single string source — no duplicate magic class strings
 */

/** Create / composer / DnD — fixed shell, scroll inner body */
export const HRM_DIALOG_FULL_VIEWPORT_CONTENT_CLASS =
  'w-[min(96vw,110rem)] max-w-[min(96vw,110rem)] max-h-[95vh] h-[min(95vh,calc(100vh-1rem))] overflow-hidden flex flex-col gap-3 p-4 xevn-safe-inline text-base';

export const HRM_DIALOG_FULL_VIEWPORT_BODY_CLASS = 'min-h-0 flex-1 overflow-y-auto pr-1 -mr-1';

/** Read-only / lighter mutate — scroll on content shell */
export const HRM_DIALOG_FULL_VIEWPORT_SCROLL_CLASS =
  'w-[min(96vw,110rem)] max-w-[min(96vw,110rem)] max-h-[min(95vh,calc(100vh-1rem))] overflow-y-auto flex flex-col gap-3 p-4 xevn-safe-inline text-base';

/** Compact catalog form — parent portal, ~56rem cap (no DnD) */
export const HRM_DIALOG_PARENT_COMPACT_CLASS =
  'max-h-[min(90vh,760px)] w-[min(92vw,56rem)] max-w-[min(92vw,56rem)] overflow-y-auto flex flex-col gap-4 p-6 xevn-safe-inline text-base';
