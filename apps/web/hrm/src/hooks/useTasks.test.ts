import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const hooksDir = dirname(fileURLToPath(import.meta.url));

describe('useTasks portal API mode', () => {
  it('uses listOperationsTasks from hrmApi', () => {
    const source = readFileSync(join(hooksDir, 'useTasks.ts'), 'utf8');
    expect(source).toContain('listOperationsTasks');
    expect(source).not.toContain('@/integrations/supabase/client');
  });
});
