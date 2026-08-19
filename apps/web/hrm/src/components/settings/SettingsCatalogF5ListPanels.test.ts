import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const dir = __dirname;

function readPanel(name: string): string {
  return readFileSync(join(dir, name), 'utf8');
}

const W3_F5_PANELS = [
  'AttAttendanceCodeSettingsPanel.tsx',
  'AttOtTypeSettingsPanel.tsx',
  'AttOtCompTypeSettingsPanel.tsx',
  'EmpDocumentTypeSettingsPanel.tsx',
  'EmpEmploymentTypeSettingsPanel.tsx',
  'SiInsuranceTypeSettingsPanel.tsx',
  'SiInsurerSettingsPanel.tsx',
  'RecPipelineStageSettingsPanel.tsx',
] as const;

const SETTINGS_PAGE = join(dir, '..', '..', 'pages', 'Settings.tsx');

describe('W3 F5 catalog panels — query/page sync gate (FE-04)', () => {
  it('Settings.tsx merges parent CC ?tab= on iframe remount (FE-07)', () => {
    const src = readFileSync(SETTINGS_PAGE, 'utf8');
    expect(src).toContain('resolveEffectiveSettingsTab');
    expect(src).toContain('readPortalParentSearchParam(\'tab\')');
  });

  it.each(W3_F5_PANELS)('%s uses focus hook + skips mount page reset on q', (file) => {
    const src = readPanel(file);
    expect(src).toContain('useSettingsCatalogFocusPage');
    expect(src).toContain('resolveSettingsCatalogInitialSearchQuery');
    expect(src).toContain('useSettingsCatalogQueryPageSync');
    expect(src).toContain('bootstrapFocusQuery');
    expect(src).toContain('catalogPageForKey');
    expect(src).not.toMatch(/useEffect\(\(\) => \{\s*setPage\(1\);\s*\}, \[q\]\)/);
  });
});
