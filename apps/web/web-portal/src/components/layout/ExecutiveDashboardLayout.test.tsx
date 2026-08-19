import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ExecutiveDashboardLayout, { isCommandCenterShellPath } from './ExecutiveDashboardLayout';

vi.mock('./TopHeader', () => ({
  default: () => <div data-testid="portal-membership-static">membership-chip</div>,
}));

describe('isCommandCenterShellPath', () => {
  it('matches /command-center and nested paths only', () => {
    expect(isCommandCenterShellPath('/command-center')).toBe(true);
    expect(isCommandCenterShellPath('/command-center/inbox')).toBe(true);
    expect(isCommandCenterShellPath('/command-center/hrm/employees')).toBe(true);
    expect(isCommandCenterShellPath('/')).toBe(false);
    expect(isCommandCenterShellPath('/cockpit')).toBe(false);
    expect(isCommandCenterShellPath('/dashboard/organization')).toBe(false);
  });
});

describe('ExecutiveDashboardLayout', () => {
  it('mounts TopHeader membership chip on /command-center', () => {
    render(
      <MemoryRouter initialEntries={['/command-center']}>
        <Routes>
          <Route element={<ExecutiveDashboardLayout />}>
            <Route path="command-center" element={<div>cc-page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByTestId('portal-membership-static')).toBeTruthy();
    expect(screen.getByText('cc-page')).toBeTruthy();
  });

  it('does not mount TopHeader on UnifiedShell /', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<ExecutiveDashboardLayout />}>
            <Route index element={<div>unified</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.queryByTestId('portal-membership-static')).toBeNull();
    expect(screen.getByText('unified')).toBeTruthy();
  });
});
