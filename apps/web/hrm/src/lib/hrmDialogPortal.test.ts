import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/hrmPortalMode", () => ({
  getHrmPortalMode: vi.fn(),
}));

import { getHrmPortalMode } from "@/lib/hrmPortalMode";
import {
  getDialogPortalContainer,
  getRadixPortalContainer,
  isHrmDialogMountedToPortalParent,
  syncHrmStylesheetsToParentForPortalDialogs,
} from "@/lib/hrmDialogPortal";

describe("getDialogPortalContainer", () => {
  let parentRef: Window;

  beforeEach(() => {
    vi.mocked(getHrmPortalMode).mockReset();
    parentRef = window;
    Object.defineProperty(window, "parent", {
      value: parentRef,
      configurable: true,
    });
  });

  it("returns null when not in HRM portal mode", () => {
    vi.mocked(getHrmPortalMode).mockReturnValue(false);
    expect(getDialogPortalContainer()).toBeNull();
  });

  it("returns null in portal mode but top-level (no iframe)", () => {
    vi.mocked(getHrmPortalMode).mockReturnValue(true);
    expect(getDialogPortalContainer()).toBeNull();
  });

  it("returns parent document body when portal mode, embedded, and same-origin", () => {
    vi.mocked(getHrmPortalMode).mockReturnValue(true);
    const parentDoc = document.implementation.createHTMLDocument("portal");
    const body = parentDoc.body;
    const fakeParent = { document: parentDoc } as Window;
    Object.defineProperty(window, "parent", { value: fakeParent, configurable: true });
    expect(getDialogPortalContainer()).toBe(body);
  });

  it("returns null when parent document is cross-origin (access throws)", () => {
    vi.mocked(getHrmPortalMode).mockReturnValue(true);
    const fakeParent = {
      get document() {
        throw new DOMException("Blocked a frame with origin", "SecurityError");
      },
    } as Window;
    Object.defineProperty(window, "parent", { value: fakeParent, configurable: true });
    expect(getDialogPortalContainer()).toBeNull();
  });
});

describe("getRadixPortalContainer portalScope (D-HRM-OU-FILTER-EMBED-01)", () => {
  beforeEach(() => {
    vi.mocked(getHrmPortalMode).mockReset();
    Object.defineProperty(window, "parent", {
      value: window,
      configurable: true,
    });
  });

  it("portalScope=iframe always returns iframe document.body even when parent portal available", () => {
    vi.mocked(getHrmPortalMode).mockReturnValue(true);
    const parentDoc = document.implementation.createHTMLDocument("portal");
    const fakeParent = { document: parentDoc } as Window;
    Object.defineProperty(window, "parent", { value: fakeParent, configurable: true });
    expect(getRadixPortalContainer("iframe")).toBe(document.body);
    expect(isHrmDialogMountedToPortalParent("iframe")).toBe(false);
  });

  it("default / parent scope uses parent body when embed portal available", () => {
    vi.mocked(getHrmPortalMode).mockReturnValue(true);
    const parentDoc = document.implementation.createHTMLDocument("portal");
    const body = parentDoc.body;
    const fakeParent = { document: parentDoc } as Window;
    Object.defineProperty(window, "parent", { value: fakeParent, configurable: true });
    expect(getRadixPortalContainer()).toBe(body);
    expect(getRadixPortalContainer("parent")).toBe(body);
    expect(isHrmDialogMountedToPortalParent()).toBe(true);
  });
});

describe("syncHrmStylesheetsToParentForPortalDialogs", () => {
  beforeEach(() => {
    document.head.querySelectorAll('link[rel="stylesheet"]').forEach((n) => n.remove());
    Object.defineProperty(window, "parent", { value: window, configurable: true });
  });

  it("clones iframe stylesheet links into parent head once per href", () => {
    const parentDoc = document.implementation.createHTMLDocument("portal");
    const fakeParent = { document: parentDoc } as Window;
    Object.defineProperty(window, "parent", { value: fakeParent, configurable: true });

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/hr/assets/app.css";
    document.head.appendChild(link);

    syncHrmStylesheetsToParentForPortalDialogs();
    syncHrmStylesheetsToParentForPortalDialogs();

    const synced = parentDoc.head.querySelectorAll('link[rel="stylesheet"][data-xevn-hrm-portal-href]');
    expect(synced.length).toBe(1);
    expect(synced[0].getAttribute("href")).toContain("app.css");
  });
});
