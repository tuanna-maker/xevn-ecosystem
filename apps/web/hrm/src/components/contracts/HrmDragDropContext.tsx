/**
 * @CODE-MEMORY
 * Screen:     HRM embed DnD — parent-portaled dialogs
 * WorkItem:   PO-HRM-CTR-CREATE-REDESIGN-FE-04-DND-PARENT-02
 * Purpose:    Ensures pangea parent-portal query patch before DragDropContext mounts.
 * must_keep:  Re-export DragDropContext props; install patch idempotent
 */
import { DragDropContext, type DragDropContextProps } from '@hello-pangea/dnd';
import { installHrmPangeaParentPortalQueryPatch } from '@/lib/hrmPangeaParentPortalQueryPatch';

installHrmPangeaParentPortalQueryPatch();

export function HrmDragDropContext(props: DragDropContextProps) {
  return <DragDropContext {...props} />;
}
