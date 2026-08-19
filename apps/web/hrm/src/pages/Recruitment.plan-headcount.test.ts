/**
 * PO-HRM-MVP-GD1-REC-01-CLUSTER-FE-01 — plan UI dual-column ABSENT + need_hire wire
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const pageSrc = readFileSync(join(__dirname, '../pages/Recruitment.tsx'), 'utf8');
const hookSrc = readFileSync(join(__dirname, '../hooks/useRecruitmentPlans.ts'), 'utf8');
const apiSrc = readFileSync(join(__dirname, '../integrations/hrmApi.ts'), 'utf8');

describe('REC-01 cluster FE-01 — single Cần tuyển column', () => {
  it('Recruitment plan editors no longer bind ns/dx dual SoT', () => {
    expect(pageSrc).not.toMatch(/updateMonthValue\([^)]*'ns'/);
    expect(pageSrc).not.toMatch(/updateMonthValue\([^)]*'dx'/);
    expect(pageSrc).not.toMatch(/months\[monthIdx\]\?\.ns/);
    expect(pageSrc).not.toMatch(/months\[monthIdx\]\?\.dx/);
    expect(pageSrc).not.toMatch(/Array\(12\)\.fill\(\{\s*ns:\s*0,\s*dx:\s*0\s*\}\)/);
    expect(pageSrc).toMatch(/need_hire/);
    expect(pageSrc).toMatch(/updateMonthNeedHire/);
    expect(pageSrc).toMatch(/CatalogSearchPicker/);
    expect(pageSrc).toMatch(/spawnPlanRequests/);
    expect(pageSrc).toMatch(/upsertPlan/);
    expect(pageSrc).toMatch(/rec-hc-need-hire-/);
    expect(pageSrc).toMatch(/detectQtyDriftInDepartments/);
    expect(pageSrc).toMatch(/countOverHeadcountCells/);
    expect(pageSrc).toMatch(/rec-hc-qty-drift-confirm/);
    expect(pageSrc).toMatch(/allow_override/);
    expect(pageSrc).toMatch(/HRM_HC_OVER_HC_WARN_VI/);
  });

  it('hook wires PUT upsert + spawn-requests physical paths', () => {
    expect(hookSrc).toMatch(/upsertRecruitmentPlan/);
    expect(hookSrc).toMatch(/spawnRecruitmentPlanRequests/);
    expect(hookSrc).toMatch(/serializeMonthsForApi/);
    expect(hookSrc).not.toMatch(/months: pos\.months(?!\))/); // months go through serialize
    expect(apiSrc).toMatch(/recruitment-plans\/\$\{encodeURIComponent\(planId\)\}\?/);
    expect(apiSrc).toMatch(/spawn-requests/);
    expect(apiSrc).toMatch(/method:\s*"PUT"/);
  });
});
