import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  attachPortalDialogA11yMirror,
  isDialogA11yMirrorElement,
  mirrorPortalDialogA11yIdsForRadixWarnings,
} from './hrmDialogPortalA11y';

describe('mirrorPortalDialogA11yIdsForRadixWarnings (D-HRM-EMP-SALARY-DIALOG-A11Y-01)', () => {
  afterEach(() => {
    document.querySelectorAll('[data-xevn-hrm-dialog-a11y-mirror]').forEach((el) => el.remove());
  });
  it('no-ops when content lives in the same document as the React app', () => {
    const content = document.createElement('div');
    content.setAttribute('aria-labelledby', 'radix-title-same');
    document.body.appendChild(content);
    const cleanup = mirrorPortalDialogA11yIdsForRadixWarnings(content);
    expect(document.getElementById('radix-title-same')).toBeNull();
    cleanup();
    content.remove();
  });
  it('mirrors labelledby + describedby into iframe document when content is foreign', () => {
    const foreignDoc = document.implementation.createHTMLDocument('parent-portal');
    const content = foreignDoc.createElement('div');
    content.setAttribute('aria-labelledby', 'radix-:r0:');
    content.setAttribute('aria-describedby', 'radix-:r1:');
    foreignDoc.body.appendChild(content);
    // Simulate ownerDocument !== iframe document (portal to parent).
    Object.defineProperty(content, 'ownerDocument', {
      configurable: true,
      get: () => foreignDoc,
    });
    const cleanup = mirrorPortalDialogA11yIdsForRadixWarnings(content);
    const titleMirror = document.getElementById('radix-:r0:');
    const descMirror = document.getElementById('radix-:r1:');
    expect(titleMirror).not.toBeNull();
    expect(descMirror).not.toBeNull();
    expect(isDialogA11yMirrorElement(titleMirror)).toBe(true);
    expect(isDialogA11yMirrorElement(descMirror)).toBe(true);
    cleanup();
    expect(document.getElementById('radix-:r0:')).toBeNull();
    expect(document.getElementById('radix-:r1:')).toBeNull();
  });
  it('does not duplicate when id already exists in iframe document', () => {
    const existing = document.createElement('h2');
    existing.id = 'radix-existing-title';
    document.body.appendChild(existing);
    const foreignDoc = document.implementation.createHTMLDocument('parent-portal');
    const content = foreignDoc.createElement('div');
    content.setAttribute('aria-labelledby', 'radix-existing-title');
    Object.defineProperty(content, 'ownerDocument', {
      configurable: true,
      get: () => foreignDoc,
    });
    const appendSpy = vi.spyOn(document.body, 'appendChild');
    const cleanup = mirrorPortalDialogA11yIdsForRadixWarnings(content);
    const mirrorAppends = appendSpy.mock.calls.filter(
      ([node]) => node instanceof HTMLElement && isDialogA11yMirrorElement(node),
    );
    expect(mirrorAppends).toHaveLength(0);
    cleanup();
    appendSpy.mockRestore();
    existing.remove();
  });
});

describe('attachPortalDialogA11yMirror (D-HRM-EMP-SALARY-DIALOG-A11Y-01 R2)', () => {
  afterEach(() => {
    document.querySelectorAll('[data-xevn-hrm-dialog-a11y-mirror]').forEach((el) => el.remove());
  });
  function foreignContent(attrs: { labelledby?: string; describedby?: string }): HTMLElement {
    const foreignDoc = document.implementation.createHTMLDocument('parent-portal');
    const content = foreignDoc.createElement('div');
    if (attrs.labelledby) content.setAttribute('aria-labelledby', attrs.labelledby);
    if (attrs.describedby) content.setAttribute('aria-describedby', attrs.describedby);
    foreignDoc.body.appendChild(content);
    Object.defineProperty(content, 'ownerDocument', {
      configurable: true,
      get: () => foreignDoc,
    });
    return content;
  }
  it('creates stubs on attach (simulates Presence callback-ref mount without parent re-render)', () => {
    const content = foreignContent({
      labelledby: 'radix-:rg:',
      describedby: 'radix-:rh:',
    });
    // No parent useLayoutEffect — only the attach that DialogContent callback ref runs.
    const cleanup = attachPortalDialogA11yMirror(content);
    expect(document.getElementById('radix-:rg:')).not.toBeNull();
    expect(document.getElementById('radix-:rh:')).not.toBeNull();
    expect(document.querySelectorAll('[data-xevn-hrm-dialog-a11y-mirror]')).toHaveLength(2);
    cleanup();
    expect(document.querySelectorAll('[data-xevn-hrm-dialog-a11y-mirror]')).toHaveLength(0);
  });
  it('MutationObserver mirrors attrs that appear after attach (empty → labelled)', async () => {
    const content = foreignContent({});
    const cleanup = attachPortalDialogA11yMirror(content);
    expect(document.querySelectorAll('[data-xevn-hrm-dialog-a11y-mirror]')).toHaveLength(0);
    content.setAttribute('aria-labelledby', 'radix-late-title');
    content.setAttribute('aria-describedby', 'radix-late-desc');
    await vi.waitFor(() => {
      expect(document.getElementById('radix-late-title')).not.toBeNull();
      expect(document.getElementById('radix-late-desc')).not.toBeNull();
    });
    cleanup();
  });
  it('queueMicrotask re-syncs before a simulated TitleWarning useEffect', async () => {
    const content = foreignContent({
      labelledby: 'radix-micro-title',
      describedby: 'radix-micro-desc',
    });
    attachPortalDialogA11yMirror(content);
    // TitleWarning uses useEffect (= after microtasks). Assert mirrors exist in a microtask
    // chain that runs after attach's queueMicrotask sync.
    await new Promise<void>((resolve) => {
      queueMicrotask(() => {
        expect(document.getElementById('radix-micro-title')).not.toBeNull();
        expect(document.getElementById('radix-micro-desc')).not.toBeNull();
        resolve();
      });
    });
  });
});
