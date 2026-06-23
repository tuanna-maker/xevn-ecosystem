import { describe, expect, it, vi, afterEach } from 'vitest';

import {

  resolveAlertsStrictBanner,

  resolveCommandCenterApiErrorState,

  resolveCommandCenterEmptyApiSource,

  resolveCommandCenterInboxTasks,

  resolveCommandCenterPortalAlerts,

  resolveInboxStrictBanner,

  resolveWorkflowDefinitionsApiErrorState,

  resolveWorkflowDefinitionsLocalSeed,

  resolveWorkflowDefinitionsStrictBanner,

} from './commandCenterStrictMode';



describe('commandCenterStrictMode', () => {

  afterEach(() => {

    vi.unstubAllEnvs();

  });



  it('resolveCommandCenterInboxTasks: strict mode never returns mock rows', () => {

    vi.stubEnv('DEV', 'true');

    vi.stubEnv('VITE_ALLOW_MOCK_FALLBACK', 'false');

    const api: { id: string }[] = [];

    expect(resolveCommandCenterInboxTasks('api', api)).toEqual([]);

    expect(resolveCommandCenterInboxTasks('mock', api)).toEqual([]);

  });



  it('resolveCommandCenterInboxTasks: dev mock flag allows mock source rows', () => {

    vi.stubEnv('DEV', 'true');

    vi.stubEnv('VITE_ALLOW_MOCK_FALLBACK', 'true');

    const rows = resolveCommandCenterInboxTasks('mock', []);

    expect(rows.length).toBeGreaterThan(0);

    expect(rows[0]).toHaveProperty('cardId');

  });



  it('inbox strict: empty API inbox shows seed hint, not mock', () => {

    vi.stubEnv('DEV', 'true');

    vi.stubEnv('VITE_ALLOW_MOCK_FALLBACK', 'false');

    const state = resolveInboxStrictBanner('api', false, 0);

    expect(state.emptyStrictHint).toBe(true);

    expect(state.usingMockFallback).toBe(false);

  });



  it('inbox dev mock: shows mock fallback banner when rows present', () => {

    vi.stubEnv('DEV', 'true');

    vi.stubEnv('VITE_ALLOW_MOCK_FALLBACK', 'true');

    const state = resolveInboxStrictBanner('mock', false, 3);

    expect(state.usingMockFallback).toBe(true);

    expect(state.loadFailed).toBe(false);

  });



  it('inbox strict: API failure surfaces loadFailed', () => {

    vi.stubEnv('DEV', 'true');

    vi.stubEnv('VITE_ALLOW_MOCK_FALLBACK', 'false');

    const state = resolveInboxStrictBanner('api', true, 0);

    expect(state.loadFailed).toBe(true);

    expect(state.emptyStrictHint).toBe(false);

  });



  it('alerts strict: empty API shows loadFailed banner per UC-CC-P0-09', () => {

    vi.stubEnv('DEV', 'true');

    vi.stubEnv('VITE_ALLOW_MOCK_FALLBACK', 'false');

    const state = resolveAlertsStrictBanner('api', false, 0);

    expect(state.loadFailed).toBe(true);

    expect(state.usingMockFallback).toBe(false);

  });



  it('workflow definitions strict: empty API shows seed hint, not mock graph', () => {

    vi.stubEnv('DEV', 'true');

    vi.stubEnv('VITE_ALLOW_MOCK_FALLBACK', 'false');

    const state = resolveWorkflowDefinitionsStrictBanner('api', false, 0);

    expect(state.emptyStrictHint).toBe(true);

    expect(state.usingMockFallback).toBe(false);

  });



  it('workflow definitions strict: API failure surfaces loadFailed', () => {

    vi.stubEnv('DEV', 'true');

    vi.stubEnv('VITE_ALLOW_MOCK_FALLBACK', 'false');

    const state = resolveWorkflowDefinitionsStrictBanner('api', true, 0);

    expect(state.loadFailed).toBe(true);

  });



  it('resolveCommandCenterPortalAlerts: strict mode never returns mock alerts', () => {

    vi.stubEnv('DEV', 'true');

    vi.stubEnv('VITE_ALLOW_MOCK_FALLBACK', 'false');

    expect(resolveCommandCenterPortalAlerts('api', [])).toEqual([]);

    expect(resolveCommandCenterPortalAlerts('mock', [])).toEqual([]);

  });



  it('resolveCommandCenterPortalAlerts: dev mock flag allows mock alerts', () => {

    vi.stubEnv('DEV', 'true');

    vi.stubEnv('VITE_ALLOW_MOCK_FALLBACK', 'true');

    const rows = resolveCommandCenterPortalAlerts('mock', []);

    expect(rows.length).toBeGreaterThan(0);

    expect(rows[0]).toHaveProperty('id');

  });



  it('resolveCommandCenterEmptyApiSource: strict stays api on empty response', () => {

    vi.stubEnv('DEV', 'true');

    vi.stubEnv('VITE_ALLOW_MOCK_FALLBACK', 'false');

    expect(resolveCommandCenterEmptyApiSource()).toBe('api');

  });



  it('resolveCommandCenterApiErrorState: strict marks loadFailed', () => {

    vi.stubEnv('DEV', 'true');

    vi.stubEnv('VITE_ALLOW_MOCK_FALLBACK', 'false');

    expect(resolveCommandCenterApiErrorState()).toEqual({ source: 'api', loadFailed: true });

  });



  it('resolveWorkflowDefinitionsLocalSeed: strict → empty source', () => {

    vi.stubEnv('DEV', 'true');

    vi.stubEnv('VITE_ALLOW_MOCK_FALLBACK', 'false');

    const seeded = resolveWorkflowDefinitionsLocalSeed([{ id: 'wf-1' }]);

    expect(seeded).toEqual({ rows: [], source: 'empty', loadFailed: false });

  });



  it('resolveWorkflowDefinitionsApiErrorState: strict → empty + loadFailed', () => {

    vi.stubEnv('DEV', 'true');

    vi.stubEnv('VITE_ALLOW_MOCK_FALLBACK', 'false');

    const seeded = resolveWorkflowDefinitionsApiErrorState([{ id: 'wf-1' }]);

    expect(seeded).toEqual({ rows: [], source: 'empty', loadFailed: true });

  });

});

