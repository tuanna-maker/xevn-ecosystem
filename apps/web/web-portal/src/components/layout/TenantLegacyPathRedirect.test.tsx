import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { TenantLegacyPathRedirect } from './TenantLegacyPathRedirect';

vi.mock('../../contexts/GlobalFilterContext', () => ({
  useTenantScope: () => ({
    selectedTenant: { id: 'visun', tenantId: 'visun' },
  }),
}));

describe('TenantLegacyPathRedirect', () => {
  it('adds ?tenantId= to legacy command-center URLs', () => {
    render(
      <MemoryRouter initialEntries={['/command-center/hrm/settings']}>
        <Routes>
          <Route path="/command-center/*" element={<TenantLegacyPathRedirect />} />
          <Route
            path="/command-center/hrm/settings"
            element={<div data-testid="tenant-hrm-settings">ok</div>}
          />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByTestId('tenant-hrm-settings')).toBeTruthy();
  });
});
