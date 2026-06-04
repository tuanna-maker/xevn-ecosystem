/**
 * P1-SUPA-FE-02 — profile embed paths use hrmApi only.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const hrmSrc = join(dirname(fileURLToPath(import.meta.url)), '..');

function readHrm(relPath: string): string {
  return readFileSync(join(hrmSrc, relPath), 'utf8');
}

const PROFILE_MODULES = [
  'hooks/useEmployee.ts',
  'pages/EmployeeProfile.tsx',
  'components/employee/EmployeeInsurance.tsx',
] as const;

describe('hrmProfileEmbedApiGuard', () => {
  for (const relPath of PROFILE_MODULES) {
    it(`${relPath} does not import supabase client`, () => {
      const source = readHrm(relPath);
      expect(source).not.toContain('@/integrations/supabase/client');
    });
  }

  it('useEmployee uses getEmployeeById from hrmApi', () => {
    const source = readHrm('hooks/useEmployee.ts');
    expect(source).toContain('getEmployeeById');
  });
});
