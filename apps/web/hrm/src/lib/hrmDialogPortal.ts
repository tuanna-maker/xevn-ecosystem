/**
 * @CODE-MEMORY
 * Screen:     HRM embed — Radix dialog/floating portal → parent document
 * UC:         UF-HRM dialogs in Command Center (?portal=1)
 * BR:         Overlay must cover full browser viewport; HRM styles mirrored to parent
 * SRS:        docs/hrm/SRS.md · dialog a11y / embed chrome
 * TechSpec:   parent portal + stylesheet sync for Tailwind/shadcn in parent head
 * Purpose:    Resolve parent body container; clone link/style into parent so portaled
 *             Dialog/Select classes resolve outside iframe.
 * WorkItem:   D-FE-CONSOLE-A11Y-DIALOG-RR-01
 * Coded:      2026-07-20
 * Callers:    dialog.tsx · alert-dialog.tsx · sheet · select · popover · dropdown
 * Callees:    getHrmPortalMode
 * must_keep:  idempotent stylesheet sync; same-origin only; floating z > overlay z
 * SOLID:      Portal/DOM sync only — geometry/chrome live in CSS + DialogContent
 * LastVerified: hrmDialogPortal.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-08-06
 * WorkItem: PO-HRM-UI-DIALOG-CENTER-01-R2
 * change_mode: FIX
 * What: No portal-helper geometry change — DEF-DIALOG-CENTER-CSS-OVERRIDE fixed in
 *       index.css (HRM + web-portal) `.xevn-dialog-surface:not(.fixed)`. Sync still
 *       mirrors stylesheets; parent portal CSS must not force position:relative on
 *       DialogContent that carries Tailwind `fixed`.
 * Why: QA FAIL — class string had fixed but getComputedStyle(position)=relative
 * must_keep: sync idempotent; a11y mirror callers; LOGO-02 untouched
 * LastVerified: docs/qa/evidence/po-hrm-ui-dialog-center-01-r2.md
 */

import { getHrmPortalMode } from '@/lib/hrmPortalMode';

const PORTAL_STYLESHEET_HREF_ATTR = 'data-xevn-hrm-portal-href';
const PORTAL_STYLE_HASH_ATTR = 'data-xevn-hrm-portal-style-hash';

/** z-index lớp dialog/sheet/alert gắn trên document cha (iframe portal). */
export const HRM_PORTAL_OVERLAY_Z = 100_000;
/** z-index popover/select/dropdown mở từ nội dung dialog đã portal — phải cao hơn overlay. */
export const HRM_PORTAL_FLOATING_Z = 100_010;

function shortHash(text: string): string {
  let h = 0;
  for (let i = 0; i < text.length; i++) {
    h = (Math.imul(31, h) + text.charCodeAt(i)) | 0;
  }
  return `${h}:${text.length}`;
}

function escapeSelectorAttr(value: string): string {
  return typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
    ? CSS.escape(value)
    : value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

/**
 * When HRM runs embedded (?portal=1) in a same-origin iframe, Radix portals can mount
 * here so overlays cover the full browser viewport (Command Center chrome included).
 * Returns null if standalone, cross-origin parent, or parent document is unavailable.
 */
export function getDialogPortalContainer(): HTMLElement | null {
  if (typeof window === 'undefined' || typeof document === 'undefined') return null;
  if (window.parent === window) return null;
  if (!getHrmPortalMode(window.location.search)) return null;
  try {
    const body = window.parent.document?.body;
    return body ?? null;
  } catch {
    return null;
  }
}

/**
 * Container mặc định cho mọi Radix Portal (Select, Popover, Dropdown…):
 * cùng document với Dialog khi nhúng portal; nếu không thì `document.body` iframe.
 *
 * @param portalScope `'iframe'` — top-level page chrome (filter ngoài Dialog). `'parent'` — trong Dialog embed.
 *   Trong Dialog dùng `SettingsDialogSelectContent` (alias parent + z floating).
 */
export function getRadixPortalContainer(
  portalScope?: 'iframe' | 'parent',
): HTMLElement {
  if (portalScope === 'iframe') {
    return document.body;
  }
  return getDialogPortalContainer() ?? document.body;
}

export function isHrmDialogMountedToPortalParent(
  portalScope?: 'iframe' | 'parent',
): boolean {
  if (portalScope === 'iframe') return false;
  return getDialogPortalContainer() != null;
}

/**
 * HRM Tailwind/shadcn classes only exist in the iframe document unless we mirror stylesheet
 * links onto the parent. Idempotent per absolute href.
 */
export function syncHrmStylesheetsToParentForPortalDialogs(): void {
  if (typeof document === 'undefined' || window.parent === window) return;
  let parentDoc: Document;
  try {
    parentDoc = window.parent.document;
  } catch {
    return;
  }
  const head = parentDoc.head;
  if (!head) return;

  const links = document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]');
  links.forEach((link) => {
    const hrefAttr = link.getAttribute('href');
    if (!hrefAttr) return;
    let abs: string;
    try {
      abs = new URL(hrefAttr, window.location.href).href;
    } catch {
      return;
    }
    const sel = `link[rel="stylesheet"][${PORTAL_STYLESHEET_HREF_ATTR}="${escapeSelectorAttr(abs)}"]`;
    if (head.querySelector(sel)) return;
    const clone = parentDoc.createElement('link');
    clone.rel = 'stylesheet';
    clone.href = abs;
    clone.setAttribute(PORTAL_STYLESHEET_HREF_ATTR, abs);
    head.appendChild(clone);
  });

  document.querySelectorAll('style').forEach((styleEl) => {
    const text = styleEl.textContent ?? '';
    if (!text.trim()) return;
    const hash = shortHash(text);
    const sel = `style[${PORTAL_STYLE_HASH_ATTR}="${escapeSelectorAttr(hash)}"]`;
    if (head.querySelector(sel)) return;
    const clone = parentDoc.createElement('style');
    clone.setAttribute(PORTAL_STYLE_HASH_ATTR, hash);
    clone.textContent = text;
    head.appendChild(clone);
  });
}

/**
 * Radix Dialog + DropdownMenu (parent-portal CC embed) can leave
 * `pointer-events: none` / RemoveScroll styles on iframe or parent body after
 * the overlay closes — UI looks frozen until full reload.
 */
export function releaseHrmPortalBodyLock(): void {
  const clear = (doc: Document | null | undefined) => {
    if (!doc) return;
    const body = doc.body;
    const root = doc.documentElement;
    if (body) {
      if (body.style.pointerEvents === 'none') {
        body.style.pointerEvents = '';
      }
      body.style.removeProperty('pointer-events');
      if (body.style.overflow === 'hidden') {
        body.style.removeProperty('overflow');
      }
      body.style.removeProperty('padding-right');
      body.style.removeProperty('margin-right');
      body.removeAttribute('data-scroll-locked');
      body.removeAttribute('data-aria-hidden');
      if (body.hasAttribute('inert')) body.removeAttribute('inert');
      if (body.getAttribute('aria-hidden') === 'true') {
        body.removeAttribute('aria-hidden');
      }
    }
    if (root) {
      root.style.removeProperty('pointer-events');
      if (root.style.overflow === 'hidden') {
        root.style.removeProperty('overflow');
      }
    }
  };

  if (typeof document !== 'undefined') {
    clear(document);
  }
  try {
    if (typeof window !== 'undefined' && window.parent !== window) {
      clear(window.parent.document);
    }
  } catch {
    // cross-origin parent — ignore
  }
}

/** Call after Dialog/AlertDialog/Sheet closes — Radix Presence may restore lock briefly. */
export function scheduleReleaseHrmPortalBodyLock(): void {
  if (typeof window === 'undefined') return;
  queueMicrotask(() => releaseHrmPortalBodyLock());
  window.setTimeout(() => releaseHrmPortalBodyLock(), 0);
  window.setTimeout(() => releaseHrmPortalBodyLock(), 50);
  window.setTimeout(() => releaseHrmPortalBodyLock(), 320);
}

/**
 * Open a Dialog from a DropdownMenu item only after the menu has closed.
 * Prevents nested DismissableLayer leaving body `pointer-events: none`.
 */
export function deferOpenFromMenu(open: () => void): void {
  if (typeof window === 'undefined') {
    open();
    return;
  }
  window.setTimeout(open, 0);
}
