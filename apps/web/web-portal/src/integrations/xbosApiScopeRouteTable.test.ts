import { describe, expect, it } from 'vitest';
import {
  isXbosStrictApiPath,
  matchXbosApiScopeMode,
  normalizeXbosApiPath,
} from './xbosApiScopeRouteTable';

describe('xbosApiScopeRouteTable (EX-SA01-P1-04)', () => {
  it('normalizes proxy and absolute paths', () => {
    expect(normalizeXbosApiPath('/api/xbos/workflow-engine/instances')).toBe(
      '/workflow-engine/instances',
    );
    expect(normalizeXbosApiPath('workflow-engine/tasks')).toBe('/workflow-engine/tasks');
  });

  it('classifies strict workflow/assets modules', () => {
    expect(matchXbosApiScopeMode('/workflow-engine/definitions')).toBe('strict');
    expect(matchXbosApiScopeMode('/assets')).toBe('strict');
    expect(matchXbosApiScopeMode('/asset-requests')).toBe('strict');
    expect(matchXbosApiScopeMode('/position-rbac/matrix')).toBe('strict');
    expect(isXbosStrictApiPath('/workflow-engine/instances/x/detail')).toBe(true);
  });

  it('classifies KPI rollup paths separately from strict evaluate-batch', () => {
    expect(matchXbosApiScopeMode('/kpi-engine/rollup')).toBe('kpi-rollup');
    expect(matchXbosApiScopeMode('/kpi-engine/portal-alerts')).toBe('kpi-rollup');
    expect(matchXbosApiScopeMode('/kpi-engine/evaluate-batch')).toBe('strict');
  });

  it('classifies group legal-read surfaces', () => {
    expect(matchXbosApiScopeMode('/org-foundation/legal-entities')).toBe('group-legal-read');
    expect(matchXbosApiScopeMode('/business-master/dept_system_templates/items')).toBe(
      'group-legal-read',
    );
    expect(matchXbosApiScopeMode('/command-center/workspace-meta')).toBe('group-legal-read');
  });

  it('defaults unknown paths to strict (safe)', () => {
    expect(matchXbosApiScopeMode('/unknown-module')).toBe('strict');
  });
});
