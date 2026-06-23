import { describe, expect, it, vi, afterEach } from 'vitest';

import {
  isExecutiveDashboardDemoLayoutEnabled,
  resolveCustomersPageFailure,
  resolveExpenseCategoriesSettingsFailure,
  resolveHrPageEmployeesOnFailure,
  resolveKpiDashboardSnapshotFailure,
  resolveKpiMetricsSettingsFailure,
  resolvePartnersPageFailure,
  resolvePositionsSettingsFailure,
  resolveVehicleTypesSettingsFailure,
  resolveVendorsSettingsFailure,
} from './portalStrictMode';

describe('portalStrictMode (M-CC-07..10)', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('M-CC-07: strict HR page failure → empty rows + loadFailed', () => {
    vi.stubEnv('DEV', 'true');
    vi.stubEnv('VITE_ALLOW_MOCK_FALLBACK', 'false');
    const result = resolveHrPageEmployeesOnFailure('all');
    expect(result.rows).toEqual([]);
    expect(result.usingMockFallback).toBe(false);
    expect(result.loadFailed).toBe(true);
  });

  it('M-CC-07: dev mock flag returns employee seed rows', () => {
    vi.stubEnv('DEV', 'true');
    vi.stubEnv('VITE_ALLOW_MOCK_FALLBACK', 'true');
    const result = resolveHrPageEmployeesOnFailure('all');
    expect(result.rows.length).toBeGreaterThan(0);
    expect(result.usingMockFallback).toBe(true);
    expect(result.loadFailed).toBe(false);
  });

  it('M-CC-08: demo cockpit layout disabled in strict mode', () => {
    vi.stubEnv('DEV', 'true');
    vi.stubEnv('VITE_ALLOW_MOCK_FALLBACK', 'false');
    expect(isExecutiveDashboardDemoLayoutEnabled()).toBe(false);
  });

  it('M-CC-09: strict settings failure → empty + loadFailed', () => {
    vi.stubEnv('DEV', 'true');
    vi.stubEnv('VITE_ALLOW_MOCK_FALLBACK', 'false');
    expect(resolvePositionsSettingsFailure()).toEqual({
      rows: [],
      usingMockFallback: false,
      loadFailed: true,
    });
    expect(resolveKpiMetricsSettingsFailure().rows).toEqual([]);
    expect(resolveVendorsSettingsFailure().rows).toEqual([]);
    expect(resolveExpenseCategoriesSettingsFailure().rows).toEqual([]);
  });

  it('M-CC-10: strict KPI snapshot failure → empty + loadFailed', () => {
    vi.stubEnv('DEV', 'true');
    vi.stubEnv('VITE_ALLOW_MOCK_FALLBACK', 'false');
    const result = resolveKpiDashboardSnapshotFailure('all');
    expect(result.rows).toEqual([]);
    expect(result.usingMockFallback).toBe(false);
    expect(result.loadFailed).toBe(true);
  });

  it('M-CC-10: dev mock flag returns KPI dashboard seed', () => {
    vi.stubEnv('DEV', 'true');
    vi.stubEnv('VITE_ALLOW_MOCK_FALLBACK', 'true');
    const result = resolveKpiDashboardSnapshotFailure('all');
    expect(result.rows.length).toBeGreaterThan(0);
    expect(result.usingMockFallback).toBe(true);
  });

  it('M-CC-14: strict customers/partners failure → empty + loadFailed', () => {
    vi.stubEnv('DEV', 'true');
    vi.stubEnv('VITE_ALLOW_MOCK_FALLBACK', 'false');
    expect(resolveCustomersPageFailure()).toEqual({
      rows: [],
      usingMockFallback: false,
      loadFailed: true,
    });
    expect(resolvePartnersPageFailure()).toEqual({
      rows: [],
      usingMockFallback: false,
      loadFailed: true,
    });
  });

  it('M-CC-14: dev mock flag returns customers/partners seed', () => {
    vi.stubEnv('DEV', 'true');
    vi.stubEnv('VITE_ALLOW_MOCK_FALLBACK', 'true');
    expect(resolveCustomersPageFailure().rows.length).toBeGreaterThan(0);
    expect(resolvePartnersPageFailure().rows.length).toBeGreaterThan(0);
  });

  it('M-CC-15: strict vehicle types failure → empty + loadFailed', () => {
    vi.stubEnv('DEV', 'true');
    vi.stubEnv('VITE_ALLOW_MOCK_FALLBACK', 'false');
    expect(resolveVehicleTypesSettingsFailure()).toEqual({
      rows: [],
      usingMockFallback: false,
      loadFailed: true,
    });
  });

  it('M-CC-15: dev mock flag returns vehicle types seed', () => {
    vi.stubEnv('DEV', 'true');
    vi.stubEnv('VITE_ALLOW_MOCK_FALLBACK', 'true');
    const result = resolveVehicleTypesSettingsFailure();
    expect(result.rows.length).toBeGreaterThan(0);
    expect(result.usingMockFallback).toBe(true);
    expect(result.loadFailed).toBe(false);
  });
});
