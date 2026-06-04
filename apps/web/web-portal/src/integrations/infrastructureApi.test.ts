import { describe, expect, it } from 'vitest';
import { INITIAL_INFRASTRUCTURE_FOUNDATION_CATEGORIES } from '../data/infrastructure-foundation-catalog';
import {
  infrastructureCatalogErrorMessage,
  resolveInfrastructureFoundationLoad,
} from './infrastructureApi';

describe('infrastructureApi — UC-XBOS-CC-07', () => {
  it('resolveInfrastructureFoundationLoad prefers API rows', () => {
    const apiRows = [{ id: 'fc-1', code: 'HT-1', nameVi: 'Kho', description: '', appliesToCompanyIds: ['main'] }];
    const resolved = resolveInfrastructureFoundationLoad(apiRows, false, INITIAL_INFRASTRUCTURE_FOUNDATION_CATEGORIES);
    expect(resolved.source).toBe('api');
    expect(resolved.categories).toHaveLength(1);
    expect(resolved.loadFailed).toBe(false);
  });

  it('strict mode returns empty on API fail', () => {
    const resolved = resolveInfrastructureFoundationLoad([], false, INITIAL_INFRASTRUCTURE_FOUNDATION_CATEGORIES, true);
    expect(resolved.source).toBe('empty');
    expect(resolved.categories).toHaveLength(0);
    expect(resolved.loadFailed).toBe(true);
  });

  it('mock fallback when flag set', () => {
    const resolved = resolveInfrastructureFoundationLoad([], true, INITIAL_INFRASTRUCTURE_FOUNDATION_CATEGORIES, true);
    expect(resolved.source).toBe('mock');
    expect(resolved.categories.length).toBeGreaterThan(0);
  });

  it('infrastructureCatalogErrorMessage only on fail', () => {
    expect(infrastructureCatalogErrorMessage(false)).toBeNull();
    expect(infrastructureCatalogErrorMessage(true)).toMatch(/infrastructure\/settings/);
  });
});
