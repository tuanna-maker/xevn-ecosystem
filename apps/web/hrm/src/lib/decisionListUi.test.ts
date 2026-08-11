import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  DECISIONS_LIVE_EMPTY_VI,
  isForbiddenDecisionEmptyCopy,
  isHonestDecisionLiveEmptyCopy,
  resolveCreateDialogDecisionType,
  resolveListVisibilityAfterCreate,
} from './decisionListUi';

const libDir = dirname(fileURLToPath(import.meta.url));
const viLocale = JSON.parse(
  readFileSync(join(libDir, '..', 'i18n', 'locales', 'vi.json'), 'utf8'),
) as { decisions: { noData: string; emptyHint?: string } };
const pageSource = readFileSync(join(libDir, '..', 'pages', 'Decisions.tsx'), 'utf8');
const hookSource = readFileSync(join(libDir, '..', 'hooks', 'useDecisions.ts'), 'utf8');

describe('FE-HRM-G-DEC-01-DENSITY-01 — decisions empty honesty', () => {
  it('VI locale uses live-empty «Không có quyết định nào» (not stub undeployed)', () => {
    expect(viLocale.decisions.noData).toBe(DECISIONS_LIVE_EMPTY_VI);
    expect(isHonestDecisionLiveEmptyCopy(viLocale.decisions.noData)).toBe(true);
    expect(isForbiddenDecisionEmptyCopy(viLocale.decisions.noData)).toBe(false);
  });

  it('rejects forbidden stub empty copy fragments', () => {
    expect(isForbiddenDecisionEmptyCopy('chưa triển khai API')).toBe(true);
    expect(isForbiddenDecisionEmptyCopy('Chức năng chưa triển khai')).toBe(true);
    expect(isForbiddenDecisionEmptyCopy('Not implemented')).toBe(true);
    expect(isForbiddenDecisionEmptyCopy('Không có quyết định nào')).toBe(false);
  });

  it('page binds decisions.noData and has empty CTA create path', () => {
    expect(pageSource).toContain("t('decisions.noData')");
    expect(pageSource).toContain("t('decisions.emptyHint')");
    expect(pageSource).toContain('handleOpenCreate');
    // UI must not hardcode stub undeployed copy (CODE-MEMORY may mention the ban).
    expect(pageSource).not.toMatch(
      />[\s\S]{0,40}chưa triển khai[\s\S]{0,40}</,
    );
    expect(isForbiddenDecisionEmptyCopy(viLocale.decisions.noData)).toBe(false);
  });
});

describe('FE-HRM-G-DEC-01-DENSITY-01 — create→list visibility', () => {
  it('after create resets to all + page 1 + cleared filters', () => {
    expect(resolveListVisibilityAfterCreate('promotion')).toEqual({
      selectedType: 'all',
      searchQuery: '',
      filterStatus: [],
      currentPage: 1,
    });
  });

  it('prefill create dialog type from selected type tab', () => {
    expect(resolveCreateDialogDecisionType('all')).toBe('appointment');
    expect(resolveCreateDialogDecisionType('promotion')).toBe('promotion');
  });

  it('page applies visibility helper after successful create', () => {
    expect(pageSource).toContain('resolveListVisibilityAfterCreate');
    expect(pageSource).toContain('applyListVisibilityAfterCreate');
    expect(pageSource).toContain('resolveCreateDialogDecisionType');
  });

  it('hook invalidates decisions query after create (F5-safe persist path)', () => {
    expect(hookSource).toContain('createHrDecision');
    expect(hookSource).toContain("queryKey: ['hrm-decisions', currentCompanyId]");
    expect(hookSource).toContain('await refreshDecisions()');
  });
});
