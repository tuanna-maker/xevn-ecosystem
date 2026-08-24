import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { TenantPathPrefixRedirect } from './TenantPathPrefixRedirect';

describe('TenantPathPrefixRedirect', () => {
  it('strips /:tenantId path prefix and moves tenant to query param', () => {
    render(
      <MemoryRouter initialEntries={['/visun/command-center/hrm/settings']}>
        <Routes>
          <Route path="/:tenantId/command-center/*" element={<TenantPathPrefixRedirect />} />
          <Route
            path="/command-center/hrm/settings"
            element={<div data-testid="canonical-hrm-settings">ok</div>}
          />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByTestId('canonical-hrm-settings')).toBeTruthy();
  });
});
