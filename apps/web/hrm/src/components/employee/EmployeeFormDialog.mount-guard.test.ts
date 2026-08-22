/**
 * R-8088-FE-SOFTDEL-EMP-FORM-MAP-01 — mount guard regression.
 * QA Dev8088: departments.map when prop undefined → empty Employees page → SoftDel blocked.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { departmentOptionsFromCatalog } from '@/lib/catalogSearchPicker';

const dialogSrc = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), 'EmployeeFormDialog.tsx'),
  'utf8',
);

describe('EmployeeFormDialog mount guard — SoftDel EMP-FORM-MAP', () => {
  it('must not use departments.map (undefined prop crash class)', () => {
    expect(dialogSrc).not.toMatch(/departments\.map\s*\(/);
  });

  it('must resolve dept options via departmentOptionsFromCatalog(catalogs ?? [])', () => {
    expect(dialogSrc).toMatch(/departmentOptionsFromCatalog\s*\(\s*catalogs\s*\?\?\s*\[\s*\]\s*\)/);
  });

  it('props interface must not require departments array', () => {
    expect(dialogSrc).not.toMatch(/departments:\s*\{\s*id:\s*string;\s*name:\s*string\s*\}\[\]/);
  });

  it('nullish catalogs coerced with ?? [] never throws', () => {
    const catalogs = undefined as unknown as [];
    expect(() => departmentOptionsFromCatalog(catalogs ?? [])).not.toThrow();
    expect(departmentOptionsFromCatalog(catalogs ?? [])).toEqual([]);
  });

  it('empty catalogs → [] (honest empty, no invent)', () => {
    expect(departmentOptionsFromCatalog([])).toEqual([]);
  });

  it('R-PLT-EMP-ST-FE-02 — status forced into required basic fields so Nest status Select always mounts', () => {
    const requiredBlock = dialogSrc.match(
      /const REQUIRED_BASIC_FIELDS: EmployeeBasicFieldKey\[\] = \[([\s\S]*?)\];/,
    );
    expect(requiredBlock).not.toBeNull();
    const requiredList = requiredBlock?.[1] ?? '';
    expect(requiredList).toMatch(/'employee_code'/);
    expect(requiredList).toMatch(/'full_name'/);
    expect(requiredList).toMatch(/'status'/);
    expect(dialogSrc).toContain('data-testid="emp-employment-status-select"');
  });

  it('R-PLT-EMP-POS-FE-02 — position forced into required basic fields so job_titles picker always mounts', () => {
    const requiredBlock = dialogSrc.match(
      /const REQUIRED_BASIC_FIELDS: EmployeeBasicFieldKey\[\] = \[([\s\S]*?)\];/,
    );
    expect(requiredBlock).not.toBeNull();
    const requiredList = requiredBlock?.[1] ?? '';
    expect(requiredList).toMatch(/'position'/);
    expect(dialogSrc).toMatch(/hasBasicField\('position'\)/);
  });

  it('R-PLT-EMP-DEPT-FE-02 — department forced into required basic fields so departments picker always mounts', () => {
    const requiredBlock = dialogSrc.match(
      /const REQUIRED_BASIC_FIELDS: EmployeeBasicFieldKey\[\] = \[([\s\S]*?)\];/,
    );
    expect(requiredBlock).not.toBeNull();
    const requiredList = requiredBlock?.[1] ?? '';
    expect(requiredList).toMatch(/'department'/);
    expect(requiredList).toMatch(/'status'/);
    expect(requiredList).toMatch(/'position'/);
    expect(dialogSrc).toMatch(/hasBasicField\('department'\)/);
    expect(dialogSrc).toMatch(/options=\{departmentOptions\}/);
    expect(dialogSrc).toContain('HRM_EMP_DEPT_EMPTY_CATALOG_CODE');
  });

  it('uses REQUIRED_BASIC_FIELDS in buildActiveFieldSet for basic spine', () => {
    expect(dialogSrc).toMatch(
      /buildActiveFieldSet<EmployeeBasicFieldKey>\([\s\S]*REQUIRED_BASIC_FIELDS/,
    );
  });
});
