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
});
