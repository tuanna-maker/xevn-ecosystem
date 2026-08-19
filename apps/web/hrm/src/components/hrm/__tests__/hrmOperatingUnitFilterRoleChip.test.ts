import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { EMBED_ANNOTATION_FORBIDDEN_SNIPPETS } from '@/lib/embedWorkingContext';

/** Drop block comments so CODE-MEMORY may mention historical bans without failing UI contract. */
function stripBlockComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '');
}

describe('HrmOperatingUnitFilter source contract (BM-FE-ROLE-SWITCH-01)', () => {
  it('keeps compact role chip testids and never restores annotation strip strings in UI code', () => {
    const raw = readFileSync(join(__dirname, '../HrmOperatingUnitFilter.tsx'), 'utf8');
    const src = stripBlockComments(raw);
    expect(src).toContain('hrm-embed-role-chip');
    expect(src).toContain('hrm-operating-unit-viewing-banner');
    expect(src).toContain('hrm-embed-working-context');
    expect(src).toContain('resolveEmbedWorkingContext');
    for (const forbidden of EMBED_ANNOTATION_FORBIDDEN_SNIPPETS) {
      expect(src).not.toContain(forbidden);
    }
  });

  it('AppLayout still mounts OU filter and does not re-import PortalEmbedScopeBar', () => {
    const layout = stripBlockComments(
      readFileSync(join(__dirname, '../../layout/AppLayout.tsx'), 'utf8'),
    );
    expect(layout).toContain('HrmOperatingUnitFilter');
    expect(layout).not.toContain('PortalEmbedScopeBar');
    expect(layout).not.toContain('Ngữ cảnh');
  });

  it('OU Select uses iframe portalScope and does not duplicate SelectItem value=all for loading', () => {
    const raw = readFileSync(join(__dirname, '../HrmOperatingUnitFilter.tsx'), 'utf8');
    const src = stripBlockComments(raw);
    expect(src).toContain('portalScope="iframe"');
    expect(src).toContain('hrm-operating-unit-loading');
    const allValueMatches = src.match(/SelectItem\s+value="all"/g) ?? [];
    expect(allValueMatches.length).toBe(1);
  });
});
