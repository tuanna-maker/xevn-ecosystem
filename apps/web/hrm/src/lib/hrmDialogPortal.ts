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
 * @param portalScope `'iframe'` — luôn gắn vào iframe body (top-level chrome như OU filter).
 *   `'parent'` / omit — parent body khi embed portal (Select trong Dialog/Sheet đã portal).
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
