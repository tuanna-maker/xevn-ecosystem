/**
 * @CODE-MEMORY
 * Screen:      PortalEmbedRouterSync (unit)
 * UC:          J-HRM-02 / C-CD-FB-09-01 soft-nav leave Attendance
 * WorkItem:    D-HRM-ATT-NAV-STALL-01 / CD-FB-09-SOFT-NAV
 * Purpose:     Regression — postMessage soft-nav preserves embed QS and navigates away from attendance
 * LastVerified: vitest this file
 *
 * @CODE-MEMORY-CHANGE 2026-07-19
 * work_item: CD-FB-09-SOFT-NAV
 * what: Add Attendance → /recruitment soft-nav case (C-CD-FB-09-01)
 * why: QC GWC condition — soft click Tuyển dụng must leave Attendance without F5
 */
import React from 'react';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { PortalEmbedRouterSync } from '@/components/layout/PortalEmbedRouterSync';
import { PORTAL_EMBED_NAVIGATE } from '@/lib/portalEmbedNavBridge';

/** Match App.tsx RR v7 future flags — silence Future Flag Warning in unit runs. */
const RR_V7_FUTURE = { v7_startTransition: true, v7_relativeSplatPath: true } as const;

function LocationProbe({ onLocation }: { onLocation: (path: string, search: string) => void }) {
  const location = useLocation();
  onLocation(location.pathname, location.search);
  return React.createElement('div', { 'data-testid': 'view' }, location.pathname);
}

describe('PortalEmbedRouterSync soft-nav', () => {
  beforeEach(() => {
    sessionStorage.setItem('hrm_portal_mode', '1');
  });

  afterEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  it('leaves /attendance for /employees and keeps embed search (D-HRM-ATT-NAV-STALL-01)', async () => {
    const seen: Array<{ path: string; search: string }> = [];
    const embedSearch = '?portal=1&companyId=main&_v=42';

    render(
      React.createElement(
        MemoryRouter,
        { initialEntries: [`/attendance${embedSearch}`], future: RR_V7_FUTURE },
        React.createElement(PortalEmbedRouterSync),
        React.createElement(
          Routes,
          null,
          React.createElement(Route, {
            path: '/attendance',
            element: React.createElement(LocationProbe, {
              onLocation: (p, s) => seen.push({ path: p, search: s }),
            }),
          }),
          React.createElement(Route, {
            path: '/employees',
            element: React.createElement(LocationProbe, {
              onLocation: (p, s) => seen.push({ path: p, search: s }),
            }),
          }),
          React.createElement(Route, {
            path: '/contracts',
            element: React.createElement(LocationProbe, {
              onLocation: (p, s) => seen.push({ path: p, search: s }),
            }),
          }),
          React.createElement(Route, {
            path: '/recruitment',
            element: React.createElement(LocationProbe, {
              onLocation: (p, s) => seen.push({ path: p, search: s }),
            }),
          }),
        ),
      ),
    );

    window.dispatchEvent(
      new MessageEvent('message', {
        origin: window.location.origin,
        data: { type: PORTAL_EMBED_NAVIGATE, v: 1, path: '/employees' },
      }),
    );

    await waitFor(() => {
      const last = seen[seen.length - 1];
      expect(last?.path).toBe('/employees');
      expect(last?.search).toBe(embedSearch);
    });

    window.dispatchEvent(
      new MessageEvent('message', {
        origin: window.location.origin,
        data: { type: PORTAL_EMBED_NAVIGATE, v: 1, path: '/contracts' },
      }),
    );

    await waitFor(() => {
      const last = seen[seen.length - 1];
      expect(last?.path).toBe('/contracts');
      expect(last?.search).toBe(embedSearch);
    });
  });

  it('leaves /attendance for /recruitment and keeps embed search (CD-FB-09-SOFT-NAV)', async () => {
    const seen: Array<{ path: string; search: string }> = [];
    const embedSearch = '?portal=1&tenantId=xevn&companyId=main&_v=99';

    render(
      React.createElement(
        MemoryRouter,
        { initialEntries: [`/attendance${embedSearch}`], future: RR_V7_FUTURE },
        React.createElement(PortalEmbedRouterSync),
        React.createElement(
          Routes,
          null,
          React.createElement(Route, {
            path: '/attendance',
            element: React.createElement(LocationProbe, {
              onLocation: (p, s) => seen.push({ path: p, search: s }),
            }),
          }),
          React.createElement(Route, {
            path: '/recruitment',
            element: React.createElement(LocationProbe, {
              onLocation: (p, s) => seen.push({ path: p, search: s }),
            }),
          }),
        ),
      ),
    );

    window.dispatchEvent(
      new MessageEvent('message', {
        origin: window.location.origin,
        data: { type: PORTAL_EMBED_NAVIGATE, v: 1, path: '/recruitment' },
      }),
    );

    await waitFor(() => {
      const last = seen[seen.length - 1];
      expect(last?.path).toBe('/recruitment');
      expect(last?.search).toBe(embedSearch);
    });
  });
});
