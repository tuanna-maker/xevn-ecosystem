import { describe, expect, it, vi, afterEach } from 'vitest';
import {
  resolveAlertsStrictBanner,
  resolveCommandCenterInboxTasks,
  resolveInboxStrictBanner,
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
    const mock = [{ id: 'mock-1' }];
    expect(resolveCommandCenterInboxTasks('api', api, mock)).toEqual([]);
    expect(resolveCommandCenterInboxTasks('mock', api, mock)).toEqual([]);
  });

  it('resolveCommandCenterInboxTasks: dev mock flag allows mock source rows', () => {
    vi.stubEnv('DEV', 'true');
    vi.stubEnv('VITE_ALLOW_MOCK_FALLBACK', 'true');
    const mock = [{ id: 'mock-1' }];
    expect(resolveCommandCenterInboxTasks('mock', [], mock)).toEqual(mock);
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
});
