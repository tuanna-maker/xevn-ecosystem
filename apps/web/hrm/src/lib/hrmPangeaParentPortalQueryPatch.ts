/**
 * @CODE-MEMORY
 * Screen:     HRM CC embed — parent-portaled dialog + @hello-pangea/dnd
 * Purpose:    hello-pangea queries iframe `document`; drag handles live in parent portal DOM.
 *             Patch iframe document query APIs to fall back to parent for RFD selectors.
 * WorkItem:   PO-HRM-CTR-CREATE-REDESIGN-FE-04-DND-PARENT-02
 * must_keep:  Idempotent install; no-op standalone / non-portal embed
 * SOLID:      Bootstrap-only — no React
 * LastVerified: hrmPangeaParentPortalQueryPatch.test.ts
 */

import { getHrmPortalMode, isHrmPortalEmbedFrame } from '@/lib/hrmPortalMode';

function shouldInstallParentPortalQueryPatch(): boolean {
  if (!isHrmPortalEmbedFrame()) return false;
  return getHrmPortalMode(typeof window !== 'undefined' ? window.location.search : '');
}

const PATCH_FLAG = '__xevnHrmPangeaParentPortalQsaPatch';

const RFD_SELECTOR_RE = /data-rfd-|rfd-/i;

function shouldFallbackToParent(selector: string): boolean {
  return RFD_SELECTOR_RE.test(selector);
}

/**
 * Install once per iframe document when HRM runs embedded (?portal=1).
 * Enables DnD validation + drag inside parent-portaled DialogContent (Path A / SA-02).
 */
export function installHrmPangeaParentPortalQueryPatch(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (window.parent === window) return;
  if (!shouldInstallParentPortalQueryPatch()) return;

  const doc = document as Document & { [PATCH_FLAG]?: boolean };
  if (doc[PATCH_FLAG]) return;

  let parentDoc: Document | null = null;
  try {
    parentDoc = window.parent.document;
  } catch {
    return;
  }
  if (!parentDoc) return;

  doc[PATCH_FLAG] = true;

  const origQuerySelectorAll = doc.querySelectorAll.bind(doc);
  doc.querySelectorAll = function patchedQuerySelectorAll(
    selectors: string,
  ): NodeListOf<Element> {
    const local = origQuerySelectorAll(selectors);
    if (local.length > 0 || !shouldFallbackToParent(selectors)) {
      return local;
    }
    try {
      const remote = parentDoc!.querySelectorAll(selectors);
      if (remote.length > 0) return remote;
    } catch {
      /* cross-origin guard */
    }
    return local;
  };

  const origQuerySelector = doc.querySelector.bind(doc);
  doc.querySelector = function patchedQuerySelector<E extends Element>(
    selectors: string,
  ): E | null {
    const local = origQuerySelector<E>(selectors);
    if (local || !shouldFallbackToParent(selectors)) return local;
    try {
      return parentDoc!.querySelector<E>(selectors);
    } catch {
      return null;
    }
  };

  const origGetElementById = doc.getElementById.bind(doc);
  doc.getElementById = function patchedGetElementById(elementId: string): HTMLElement | null {
    const local = origGetElementById(elementId);
    if (local || !RFD_SELECTOR_RE.test(elementId)) return local;
    try {
      return parentDoc!.getElementById(elementId);
    } catch {
      return null;
    }
  };
}
