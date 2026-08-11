/**

 * @CODE-MEMORY

 * Screen:     HRM embed Dialog (portal → parent document)

 * UC:         UF-HRM-06 (salary add/edit allowance) + all DialogContent in portal=1

 * BR:         Radix a11y warnings must not false-positive when title exists in parent doc

 * SRS:        docs/hrm/SRS.md · employee salary / dialog a11y

 * TechSpec:   @radix-ui/react-dialog TitleWarning uses document.getElementById

 * Purpose:    Mirror aria-labelledby / aria-describedby ids into the iframe document

 *             so Radix TitleWarning / DescriptionWarning (which query iframe `document`)

 *             find nodes when DialogPortal mounts into window.parent.document.body.

 * WorkItem:   D-HRM-EMP-SALARY-DIALOG-A11Y-01

 * Coded:      2026-07-20

 * Callers:    components/ui/dialog.tsx DialogContent (callback ref + microtask)

 * Callees:    none (DOM only)

 * must_keep:  real DialogTitle / DialogDescription still required in React tree

 * SOLID:      SRP — portal a11y mirror only; portal container stays in hrmDialogPortal.ts

 * LastVerified: hrmDialogPortalA11y.test.ts

 *

 * @CODE-MEMORY-CHANGE 2026-07-20

 * WorkItem: D-HRM-EMP-SALARY-DIALOG-A11Y-01 (R2)

 * change_mode: FIX

 * What: attachPortalDialogA11yMirror — sync on ref attach + MutationObserver + microtask

 * Why: QA R2 — Radix Presence mounts Content on child-only re-render; parent useLayoutEffect

 *       saw contentRef=null and never re-ran → 0 iframe stubs before TitleWarning useEffect

 * must_keep: Invalid time / formatPayrollPayDateCell untouched

 */



const MIRROR_ATTR = 'data-xevn-hrm-dialog-a11y-mirror';



function readA11yIds(contentEl: HTMLElement): string[] {

  return [contentEl.getAttribute('aria-labelledby'), contentEl.getAttribute('aria-describedby')].filter(

    (id): id is string => typeof id === 'string' && id.length > 0,

  );

}



function ensureMirror(id: string, owned: Map<string, HTMLElement>): void {

  if (owned.has(id)) return;

  const existing = document.getElementById(id);

  if (existing) return;

  const mirror = document.createElement('span');

  mirror.id = id;

  mirror.setAttribute(MIRROR_ATTR, 'true');

  mirror.setAttribute('aria-hidden', 'true');

  mirror.hidden = true;

  document.body.appendChild(mirror);

  owned.set(id, mirror);

}



/**

 * One-shot sync (tests / callers that already have attrs on a foreign-document node).

 * Prefer `attachPortalDialogA11yMirror` from DialogContent — Presence can attach the node

 * without re-rendering the parent wrapper.

 */

export function mirrorPortalDialogA11yIdsForRadixWarnings(contentEl: HTMLElement): () => void {

  if (typeof document === 'undefined') return () => undefined;

  // Same document as React app → Radix lookup already sees Title/Description.

  if (contentEl.ownerDocument === document) return () => undefined;



  const owned = new Map<string, HTMLElement>();

  for (const id of readA11yIds(contentEl)) {

    ensureMirror(id, owned);

  }



  return () => {

    for (const el of owned.values()) {

      el.remove();

    }

    owned.clear();

  };

}



/**

 * Keep iframe mirrors in sync for the lifetime of a parent-portaled DialogContent node.

 * Call from the **content callback ref** (fires when Radix Presence mounts ContentImpl)

 * so stubs exist before TitleWarning / DescriptionWarning `useEffect`.

 *

 * Also: MutationObserver (attrs may appear/change) + queueMicrotask (before paint/useEffect).

 */

export function attachPortalDialogA11yMirror(contentEl: HTMLElement): () => void {

  if (typeof document === 'undefined') return () => undefined;

  if (contentEl.ownerDocument === document) return () => undefined;



  const owned = new Map<string, HTMLElement>();



  const sync = (): void => {

    const wanted = new Set(readA11yIds(contentEl));

    for (const [id, el] of owned) {

      if (!wanted.has(id)) {

        el.remove();

        owned.delete(id);

      }

    }

    for (const id of wanted) {

      ensureMirror(id, owned);

    }

  };



  sync();



  const observer = new MutationObserver(() => {

    sync();

  });

  observer.observe(contentEl, {

    attributes: true,

    attributeFilter: ['aria-labelledby', 'aria-describedby'],

  });



  // Microtask runs after commit / layout effects, before paint + TitleWarning useEffect.

  let cancelled = false;

  queueMicrotask(() => {

    if (!cancelled) sync();

  });



  return () => {

    cancelled = true;

    observer.disconnect();

    for (const el of owned.values()) {

      el.remove();

    }

    owned.clear();

  };

}



export function isDialogA11yMirrorElement(el: Element | null): boolean {

  return !!el && el.getAttribute(MIRROR_ATTR) === 'true';

}


