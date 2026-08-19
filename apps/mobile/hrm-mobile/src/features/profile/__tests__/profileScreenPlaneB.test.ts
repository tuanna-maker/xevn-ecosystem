import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/** Wire assert — Profile ESS load uses same Plane B resolver as directory (W7-5 GWC). */
describe('ProfileScreen Plane B — PCOMP-W7-MOB-PROFILE-FULL-01', () => {
  const src = readFileSync(join(__dirname, '../ProfileScreen.tsx'), 'utf8');

  it('imports and calls resolveDirectoryQueryCompanyId for catalog scope', () => {
    expect(src).toContain('resolveDirectoryQueryCompanyId');
    expect(src).toContain('fetchEmployeeFieldsCatalog(hrmAuth, catalogCid)');
  });

  it('loads employee via fetchEmployeeById (Plane B inside hrmEmployees)', () => {
    expect(src).toContain('fetchEmployeeById(hrmAuth, id)');
  });

  it('keeps DynamicProfileForm + ESS save testIDs for J-MOB-12', () => {
    expect(src).toContain('DynamicProfileForm');
    expect(src).toContain('saveEssFields');
  });
});
