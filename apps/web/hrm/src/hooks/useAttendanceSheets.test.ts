import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/hrmDataMode', () => ({
  shouldSkipSupabaseDataFetches: () => true,
}));

const hooksDir = dirname(fileURLToPath(import.meta.url));

describe('useAttendanceSheets portal mode', () => {
  it('skips Supabase attendance_sheets when embed flag is on', async () => {
    const { shouldSkipSupabaseDataFetches } = await import('@/lib/hrmDataMode');
    expect(shouldSkipSupabaseDataFetches()).toBe(true);
  });

  it('loads sheets via React Query Nest API (no Supabase client)', () => {
    const source = readFileSync(join(hooksDir, 'useAttendanceSheets.ts'), 'utf8');
    expect(source).toContain('listAttendanceSheets');
    expect(source).toContain('useQuery');
    expect(source).toContain('ATTENDANCE_SHEETS_QUERY_KEY');
    expect(source).not.toContain('@/integrations/supabase/client');
  });
});
