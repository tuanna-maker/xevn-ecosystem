/**
 * P1-SUPA-FE-02 — guard: no runtime imports of supabase client in app src.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const hrmSrc = join(dirname(fileURLToPath(import.meta.url)), '..');

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (p.includes(`${join('integrations', 'supabase')}`)) continue;
      walk(p, out);
    } else if (/\.(tsx?)$/.test(name) && !name.endsWith('.test.ts') && !name.endsWith('.test.tsx')) {
      out.push(p);
    }
  }
  return out;
}

describe('hrm embed pilot — no supabase client imports', () => {
  it('has zero direct supabase client imports under src (except integrations/supabase folder)', () => {
    const offenders: string[] = [];
    for (const file of walk(hrmSrc)) {
      const source = readFileSync(file, 'utf8');
      if (
        source.includes('@/integrations/supabase/client') ||
        source.includes('integrations/supabase/client')
      ) {
        offenders.push(file.replace(hrmSrc + '/', '').replace(hrmSrc + '\\', ''));
      }
    }
    expect(offenders).toEqual([]);
  });
});

describe('hrmDataMode module exports', () => {
  it('exports embed guard helpers', async () => {
    const mod = await import('./hrmDataMode');
    expect(mod.isHrmApiDataMode()).toBe(true);
    expect(typeof mod.shouldSkipSupabaseDataFetches).toBe('function');
    expect(typeof mod.isPortalEmbedApiMode).toBe('function');
    expect(mod.clampHrmPageSize(500)).toBe(mod.HRM_API_MAX_PAGE_SIZE);
  });
});
