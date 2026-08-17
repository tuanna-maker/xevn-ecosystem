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
    // QA-FE-01 FAIL: Settings hrm_employee_basic_fields omitted `status` -> hasBasicField('status') false.
    // Required set is the buildActiveFieldSet<EmployeeBasicFieldKey> call for basicFieldsCatalog.
    const basicRequired = dialogSrc.match(
      /buildActiveFieldSet<EmployeeBasicFieldKey>\(basicFieldsCatalog,\s*DEFAULT_BASIC_FIELDS,\s*\[([\s\S]*?)\]/,
    );
    expect(basicRequired).not.toBeNull();
    const requiredList = basicRequired?.[1] ?? '';
    expect(requiredList).toMatch(/'employee_code'/);
    expect(requiredList).toMatch(/'full_name'/);
    expect(requiredList).toMatch(/'status'/);
    expect(dialogSrc).toContain('data-testid="emp-employment-status-select"');
  });

  it('R-PLT-EMP-POS-FE-02 — position forced into required basic fields so job_titles picker always mounts', () => {
    // QA-FE-01 FAIL (EMPPOSQAFE-MSKEVN7E): Settings hrm_employee_basic_fields omitted `position` ->
    // configured set >0 without position -> hasBasicField('position') false -> CatalogSearchPicker absent.
    const basicRequired = dialogSrc.match(
      /buildActiveFieldSet<EmployeeBasicFieldKey>\(basicFieldsCatalog,\s*DEFAULT_BASIC_FIELDS,\s*\[([\s\S]*?)\]/,
    );
    expect(basicRequired).not.toBeNull();
    const requiredList = basicRequired?.[1] ?? '';
    expect(requiredList).toMatch(/'position'/);
    // Position field render is still guarded by hasBasicField('position') using this required set.
    expect(dialogSrc).toMatch(/hasBasicField\('position'\)/);
  });

  it('R-PLT-EMP-DEPT-FE-02 — department forced into required basic fields so departments picker always mounts', () => {
    // SA Option A · R-PLT-EMP-DEPT-FE-01: Settings hrm_employee_basic_fields omitted `department` ->
    // configured set >0 without department -> hasBasicField('department') false -> CatalogSearchPicker absent.
    // Peer EMP-STATUS FE-02 / EMP-POSITION FE-02 pattern.
    const basicRequired = dialogSrc.match(
      /buildActiveFieldSet<EmployeeBasicFieldKey>\(basicFieldsCatalog,\s*DEFAULT_BASIC_FIELDS,\s*\[([\s\S]*?)\]/,
    );
    expect(basicRequired).not.toBeNull();
    const requiredList = basicRequired?.[1] ?? '';
    expect(requiredList).toMatch(/'department'/);
    // status + position must still remain required (must_keep — EMP-STATUS/POSITION FE CLOSED).
    expect(requiredList).toMatch(/'status'/);
    expect(requiredList).toMatch(/'position'/);
    // Department field render is still guarded by hasBasicField('department') using this required set.
    expect(dialogSrc).toMatch(/hasBasicField\('department'\)/);
    // Department picker binds Settings departments EFF (SoT) — not departments.map / free-text.
    expect(dialogSrc).toMatch(/options=\{departmentOptions\}/);
    // Empty EFF surfaces HRM-EMP-DEPT-EMPTY-CATALOG class (CH06g CTA · no seed).
    expect(dialogSrc).toContain('HRM_EMP_DEPT_EMPTY_CATALOG_CODE');
  });

  it('R-SPINE-MGR-HIER-01-FE — mounts EmployeeManagerPicker + submits manager_id', () => {
    expect(dialogSrc).toContain('EmployeeManagerPicker');
    expect(dialogSrc).toContain('manager_id');
    expect(dialogSrc).toMatch(/name=\"manager_id\"/);
  });
});
