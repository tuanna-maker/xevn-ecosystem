/**
 * @CODE-MEMORY
 * Screen:     /hr/recruitment — JD writer DnD helpers
 * UC:         UC-BP-REC-00g · AC-JD-GRP-02..05
 * BR:         Q1 DnD @ Thư viện
 * SRS:        docs/program/specs/PO-HRM-JD-GROUP-SPEC-01.md UC-00g
 * TechSpec:   docs/program/specs/PO-HRM-JD-GROUP-ARCH-01.md §1 runtime
 * Purpose:    Merge hello-pangea Draggable innerRef + draggableProps + dragHandleProps
 *             onto one DOM node (Strict Mode–safe; avoids button-only handle ref loss).
 * WorkItem:   PO-HRM-UI-HEADER-JD-DND-FE-01
 * Coded:      2026-08-06
 * Callers:    JdTemplateWriterDialog palette + canvas; ContractLegalPrintSettingsPanel
 * Callees:    @hello-pangea/dnd DraggableProvided
 * must_keep:  Same-node handle option; parent-portal dialog + sameNode (Contract create step2 pattern)
 *             — dndReady double rAF when portaling to CC parent
 * SOLID:      Pure props merge — no React tree
 * LastVerified: docs/qa/evidence/po-uat-rec-jd-dnd-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-UAT-REC-JD-DND-FE-01
 * What: Callers include JD canvas (same-node) — nested header handle retired for storm=0.
 * must_keep: throw when dragHandleProps missing; parent-portal writer + defer rAF on open
 * @CODE-MEMORY-CHANGE 2026-08-10 PO-HRM-UI-DIALOG-FULL-VIEWPORT-FE-01
 * What: JSDoc — iframe portalScope retired on JD/CTR composer dialogs; sameNode + rAF retained.
 * What: JSDoc — callers must pass full DraggableProvided (not dragHandleProps alone).
 * must_keep: throw when dragHandleProps null on disabled draggable; isDropDisabled palette OK when bind correct
 */

import type { DraggableProvided, DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';

export type SameNodeDragBind = {
  ref: DraggableProvided['innerRef'];
  props: DraggableProvided['draggableProps'] & DraggableProvidedDragHandleProps;
};

/**
 * Bind for a single host element: `ref={bind.ref}` + `{...bind.props}`.
 * Prefer `<div>` host (not nested `<button>` handle) for React 18 + hello-pangea.
 * @param provided — full `DraggableProvided` from render props (never `dragHandleProps` alone).
 */
export function sameNodeDragBind(provided: DraggableProvided): SameNodeDragBind {
  const handle = provided.dragHandleProps;
  if (!handle) {
    throw new Error('sameNodeDragBind: dragHandleProps missing (isEnabled=false?)');
  }
  return {
    ref: provided.innerRef,
    props: {
      ...provided.draggableProps,
      ...handle,
    },
  };
}
