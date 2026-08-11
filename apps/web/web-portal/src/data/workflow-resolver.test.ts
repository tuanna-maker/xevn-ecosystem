import { describe, expect, it } from 'vitest';
import {
  WORKFLOW_RESOLVER_TYPES,
  defaultResolverConfig,
  isWorkflowResolverType,
  normalizeResolverType,
  workflowResolverLabel,
} from './workflow-resolver';

describe('workflow-resolver (AC-CD-F4-06 / ADR §5)', () => {
  it('exposes pilot types direct_manager, position_template, parallel_group', () => {
    const ids = WORKFLOW_RESOLVER_TYPES.map((t) => t.id);
    expect(ids).toContain('direct_manager');
    expect(ids).toContain('position_template');
    expect(ids).toContain('parallel_group');
  });

  it('normalizes known types and rejects unknown', () => {
    expect(normalizeResolverType('direct_manager')).toBe('direct_manager');
    expect(normalizeResolverType('unknown')).toBeUndefined();
    expect(isWorkflowResolverType('parallel_group')).toBe(true);
  });

  it('defaults parallel_policy to all', () => {
    const cfg = defaultResolverConfig('parallel_group');
    expect(cfg.parallel_policy).toBe('all');
    expect(cfg.resolver_types).toEqual(['direct_manager', 'position_template']);
  });

  it('labels legacy when type absent', () => {
    expect(workflowResolverLabel(undefined)).toMatch(/Legacy/i);
    expect(workflowResolverLabel('direct_manager')).toMatch(/trực tiếp/i);
  });
});
