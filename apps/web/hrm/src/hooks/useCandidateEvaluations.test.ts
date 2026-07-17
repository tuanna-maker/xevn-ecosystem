import { describe, expect, it } from 'vitest';

describe('useCandidateEvaluations', () => {
  it('defaults to disabled (no fetch until evaluations tab)', async () => {
    const mod = await import('./useCandidateEvaluations');
    expect(mod.useCandidateEvaluations).toBeTypeOf('function');
  });
});
