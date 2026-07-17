import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const hooksDir = dirname(fileURLToPath(import.meta.url));
const hookSource = readFileSync(join(hooksDir, 'useDecisions.ts'), 'utf8');
const pageSource = readFileSync(join(hooksDir, '..', 'pages', 'Decisions.tsx'), 'utf8');

describe('useDecisions request lifecycle', () => {
  it('uses a stable React Query key to coalesce duplicate decisions reads', () => {
    expect(hookSource).toContain("queryKey: ['hrm-decisions', currentCompanyId, selectedType]");
    expect(hookSource).toContain('staleTime: 30_000');
    expect(hookSource).not.toContain('Promise.all([');
  });

  it('defers the large employee picker request until the decision dialog opens', () => {
    expect(hookSource).toContain('enabled: Boolean(currentCompanyId) && loadEmployees');
    expect(pageSource).toContain(
      'useDecisions(selectedType, { loadEmployees: dialogOpen })',
    );
  });
});
