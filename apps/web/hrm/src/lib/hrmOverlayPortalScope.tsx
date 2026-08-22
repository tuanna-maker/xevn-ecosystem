/**
 * Portal scope của overlay (Dialog/Sheet) — Select/Popover/Dropdown đọc để mount + z-index đúng.
 * WorkItem: DEF-FLOATING-IN-DIALOG-Z-INDEX-01
 */
import * as React from 'react';

export type HrmOverlayPortalScope = 'iframe' | 'parent';

export const HrmOverlayPortalScopeContext = React.createContext<HrmOverlayPortalScope | null>(null);

export function useHrmOverlayPortalScope(): HrmOverlayPortalScope | null {
  return React.useContext(HrmOverlayPortalScopeContext);
}
