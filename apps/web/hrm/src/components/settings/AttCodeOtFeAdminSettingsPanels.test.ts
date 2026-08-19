/**
 * @CODE-MEMORY
 * Screen:     Vitest — ATT FE-ADMIN panel source gate (CODE/OT/OTC)
 * UC:         R-PLT-ATT-FE-ADMIN-01 sponsor unlock
 * What:       Mount testids + Nest KEY CRUD wires (list/upsert/retire) — no dual-write
 * Why:        Dual-react RTL residual on full panel; source gate proves mount + CRUD contract
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-OT-FE-ADMIN-BUILD-FE-01
 *             PO-HRM-SETTINGS-W3-CAT-A-FE-01 — shell+dialog+pagination (refresh testid on shell)
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const dir = __dirname;

function readPanel(name: string): string {
  return readFileSync(join(dir, name), 'utf8');
}

function expectW3CatalogShell(src: string, prefix: string, dialogTestId: string) {
  expect(src).toContain('SettingsCatalogScreenShell');
  expect(src).toContain('compact');
  expect(src).toContain(`testId="${prefix}"`);
  expect(src).toContain('filterCatalogByCodeOrName');
  expect(src).toContain('SettingsCatalogPagination');
  expect(src).toContain('SettingsCatalogRowActions');
  expect(src).toContain(dialogTestId);
  expect(src).not.toMatch(/from '@\/components\/ui\/card'/);
}

describe('AttAttendanceCodeSettingsPanel — mount + CRUD gate', () => {
  const src = readPanel('AttAttendanceCodeSettingsPanel.tsx');

  it('mounts with Settings/ATT CFG testids', () => {
    expect(src).toContain('settings-att-attendance-codes');
    expect(src).toContain('settings-att-attendance-codes-table');
    expect(src).toContain('hdsd-att-attendance-code-save');
    expectW3CatalogShell(src, 'settings-att-attendance-codes', 'settings-att-attendance-codes-dialog');
    expect(src).toContain('onRefresh');
    expect(src).toContain('SettingsDialogSelectContent');
  });

  it('wires Nest KEY list / upsert / soft-retire only', () => {
    expect(src).toContain('listAttAttendanceCodes');
    expect(src).toContain('upsertAttAttendanceCode');
    expect(src).toContain('retireAttAttendanceCode');
    expect(src).toContain('ATT_ATTENDANCE_CODES_EFFECTIVE_QUERY_KEY');
    expect(src).toContain('rememberFocusForReload');
    expect(src).toContain('useSettingsCatalogQueryPageSync');
    expect(src).toContain('sortSettingsCatalogByOrderThenKey');
    expect(src).toContain('Ngừng');
    expect(src).not.toMatch(/dualWrite|master-data.*upsert/i);
  });
});

describe('AttOtTypeSettingsPanel — mount + CRUD gate', () => {
  const src = readPanel('AttOtTypeSettingsPanel.tsx');

  it('mounts with Settings/ATT CFG testids', () => {
    expect(src).toContain('settings-att-ot-types');
    expect(src).toContain('settings-att-ot-types-table');
    expect(src).toContain('hdsd-att-ot-type-save');
    expectW3CatalogShell(src, 'settings-att-ot-types', 'settings-att-ot-types-dialog');
    expect(src).toContain('onRefresh');
  });

  it('wires Nest KEY list / upsert / soft-retire only', () => {
    expect(src).toContain('listAttOtTypes');
    expect(src).toContain('upsertAttOtType');
    expect(src).toContain('retireAttOtType');
    expect(src).toContain('ATT_OT_TYPES_EFFECTIVE_QUERY_KEY');
    expect(src).toContain('rememberFocusForReload');
    expect(src).toContain('useSettingsCatalogQueryPageSync');
    expect(src).toContain('sortSettingsCatalogByOrderThenKey');
    expect(src).toContain('Ngừng');
    expect(src).not.toMatch(/dualWrite/i);
  });
});

describe('AttOtCompTypeSettingsPanel — mount + CRUD gate', () => {
  const src = readPanel('AttOtCompTypeSettingsPanel.tsx');

  it('mounts with Settings/ATT CFG testids', () => {
    expect(src).toContain('settings-att-ot-comp-types');
    expect(src).toContain('settings-att-ot-comp-types-table');
    expect(src).toContain('hdsd-att-ot-comp-type-save');
    expectW3CatalogShell(src, 'settings-att-ot-comp-types', 'settings-att-ot-comp-types-dialog');
    expect(src).toContain('onRefresh');
  });

  it('wires Nest KEY list / upsert / soft-retire only', () => {
    expect(src).toContain('listAttOtCompTypes');
    expect(src).toContain('upsertAttOtCompType');
    expect(src).toContain('retireAttOtCompType');
    expect(src).toContain('ATT_OT_COMP_TYPES_EFFECTIVE_QUERY_KEY');
    expect(src).toContain('rememberFocusForReload');
    expect(src).toContain('useSettingsCatalogQueryPageSync');
    expect(src).toContain('catalogPageForKey');
    expect(src).toContain('Ngừng');
    expect(src).not.toMatch(/dualWrite/i);
  });
});

describe('Settings + Attendance wiring — ATT FE-ADMIN tabs', () => {
  const settingsSrc = readFileSync(join(dir, '../../pages/Settings.tsx'), 'utf8');
  const attendanceSrc = readFileSync(join(dir, '../../pages/Attendance.tsx'), 'utf8');

  it('Settings mounts three ATT FE-ADMIN tabs + TabsContent', () => {
    expect(settingsSrc).toContain('att-attendance-codes');
    expect(settingsSrc).toContain('att-ot-types');
    expect(settingsSrc).toContain('att-ot-comp-types');
    expect(settingsSrc).toContain('AttAttendanceCodeSettingsPanel');
    expect(settingsSrc).toContain('AttOtTypeSettingsPanel');
    expect(settingsSrc).toContain('AttOtCompTypeSettingsPanel');
  });

  it('Attendance CFG sidebar mounts three panels (not stub redirect)', () => {
    expect(attendanceSrc).toContain("id: 'attendance-codes'");
    expect(attendanceSrc).toContain("id: 'ot-types'");
    expect(attendanceSrc).toContain("id: 'ot-comp-types'");
    expect(attendanceSrc).toContain('att-cfg-attendance-codes-precision');
    expect(attendanceSrc).toContain('att-cfg-ot-types-precision');
    expect(attendanceSrc).toContain('att-cfg-ot-comp-types-precision');
  });
});
