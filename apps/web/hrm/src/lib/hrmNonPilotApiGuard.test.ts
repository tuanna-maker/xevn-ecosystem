/**
 * P1-SUPA-FE-02 — non-pilot modules must not import supabase client.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const hrmSrc = join(dirname(fileURLToPath(import.meta.url)), '..');

function readHrm(relPath: string): string {
  return readFileSync(join(hrmSrc, relPath), 'utf8');
}

const NON_PILOT_MODULES = [
  'hooks/useReportsData.ts',
  'hooks/useTasks.ts',
  'hooks/useProcesses.ts',
  'hooks/useToolsEquipment.ts',
  'hooks/useAdvanceRequests.ts',
  'pages/Processes.tsx',
] as const;

describe('hrmNonPilotApiGuard', () => {
  for (const relPath of NON_PILOT_MODULES) {
    it(`${relPath} does not import supabase client`, () => {
      const source = readHrm(relPath);
      expect(source).not.toContain('@/integrations/supabase/client');
      expect(source).not.toMatch(/from ['"]@\/integrations\/supabase\/client['"]/);
    });
  }
});
