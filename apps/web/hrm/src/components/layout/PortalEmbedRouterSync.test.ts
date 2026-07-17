/**
 * @CODE-MEMORY
 * Screen:      PortalEmbedRouterSync (unit)
 * UC:          J-HRM-02 soft-nav leave Attendance
 * WorkItem:    D-HRM-ATT-NAV-STALL-01
 * Purpose:     Regression — postMessage soft-nav preserves embed QS and navigates away from attendance
 * LastVerified: vitest this file
 */
import React from 'react';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { PortalEmbedRouterSync } from '@/components/layout/PortalEmbedRouterSync';
import { PORTAL_EMBED_NAVIGATE } from '@/lib/portalEmbedNavBridge';

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
        { initialEntries: [`/attendance${embedSearch}`] },
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
});
