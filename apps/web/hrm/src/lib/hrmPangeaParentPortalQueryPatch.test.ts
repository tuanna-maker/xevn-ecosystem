import { describe, expect, it, beforeEach, vi } from 'vitest';
import * as portalMode from './hrmPortalMode';
import { installHrmPangeaParentPortalQueryPatch } from './hrmPangeaParentPortalQueryPatch';

describe('installHrmPangeaParentPortalQueryPatch', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('falls back to parent document for data-rfd selectors when iframe has no match', () => {
    const parentHandle = document.createElement('div');
    parentHandle.setAttribute('data-rfd-drag-handle-context-id', 'ctx-test');
    parentHandle.setAttribute('data-rfd-drag-handle-draggable-id', 'cpal-abc');

    const parentDoc = document.implementation.createHTMLDocument('parent');
    parentDoc.body.appendChild(parentHandle);

    const iframeDoc = document.implementation.createHTMLDocument('iframe');

    vi.spyOn(portalMode, 'getHrmPortalMode').mockReturnValue(true);
    vi.spyOn(portalMode, 'isHrmPortalEmbedFrame').mockReturnValue(true);

    const parentWin = { document: parentDoc } as Window;
    const iframeWin = {
      document: iframeDoc,
      parent: parentWin,
      location: { search: '?portal=1' },
    } as Window & typeof globalThis;

    vi.stubGlobal('window', iframeWin);
    vi.stubGlobal('document', iframeDoc);

    installHrmPangeaParentPortalQueryPatch();

    const found = iframeDoc.querySelectorAll(
      '[data-rfd-drag-handle-context-id="ctx-test"]',
    );
    expect(found.length).toBe(1);
    expect(found[0]).toBe(parentHandle);
  });
});
