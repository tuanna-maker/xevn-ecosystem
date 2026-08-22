/**
 * Resolve mount + z-index cho Select/Popover/Dropdown trong Dialog/Sheet embed.
 * WorkItem: DEF-FLOATING-IN-DIALOG-Z-INDEX-01
 *
 * - Dialog parent (CC embed): overlay z-[100000], floating z-[100010]
 * - Dialog iframe / standalone: overlay z-50, floating z-[100] (cao hơn dialog)
 */
import {
  getRadixPortalContainer,
  isHrmDialogMountedToPortalParent,
  syncHrmStylesheetsToParentForPortalDialogs,
} from '@/lib/hrmDialogPortal';
import type { HrmOverlayPortalScope } from '@/lib/hrmOverlayPortalScope';

export const HRM_FLOATING_Z_IFRAME_CLASS = 'z-[100]';
export const HRM_FLOATING_Z_PARENT_CLASS = 'z-[100010]';

export function resolveHrmFloatingPortalScope(
  explicitScope: HrmOverlayPortalScope | undefined,
  overlayScope: HrmOverlayPortalScope | null,
): HrmOverlayPortalScope {
  if (explicitScope === 'iframe' || explicitScope === 'parent') return explicitScope;
  if (overlayScope === 'iframe') return 'iframe';
  if (overlayScope === 'parent') return 'parent';
  // Top-level page chrome (filters, toolbars): always iframe body — parent portal sits
  // under the CC iframe element and dropdowns look "z-index broken".
  return 'iframe';
}

export function prepareHrmFloatingPortal(
  explicitScope: HrmOverlayPortalScope | undefined,
  overlayScope: HrmOverlayPortalScope | null,
) {
  const effectiveScope = resolveHrmFloatingPortalScope(explicitScope, overlayScope);
  const useParent = isHrmDialogMountedToPortalParent(effectiveScope);
  if (useParent) {
    syncHrmStylesheetsToParentForPortalDialogs();
  }
  return {
    mount: getRadixPortalContainer(effectiveScope),
    floatingZClass: useParent ? HRM_FLOATING_Z_PARENT_CLASS : HRM_FLOATING_Z_IFRAME_CLASS,
  };
}
