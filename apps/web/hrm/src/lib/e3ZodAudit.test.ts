import { describe, expect, it } from 'vitest';
import { E3_ZOD_AUDIT_SURFACES, scoreE3ZodAudit } from './e3ZodAudit';

describe('e3ZodAudit — AC-E3-ZOD-AUDIT-01', () => {
  it('scores ≥90% Zod coverage on audit set', () => {
    const score = scoreE3ZodAudit(E3_ZOD_AUDIT_SURFACES);
    expect(score.total).toBeGreaterThanOrEqual(10);
    expect(score.meets90).toBe(true);
    expect(score.ratio).toBeGreaterThanOrEqual(0.9);
  });

  it('includes E3 perf + ins surfaces as Zod PASS', () => {
    const ids = E3_ZOD_AUDIT_SURFACES.filter((s) => s.hasZodRequired).map((s) => s.id);
    expect(ids).toContain('perf-cycle');
    expect(ids).toContain('perf-eval');
    expect(ids).toContain('ins-policy');
    expect(ids).toContain('ins-participant');
  });
});
