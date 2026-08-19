/**
 * D-HRM-FE-REQUISITION-EDIT-CRASH-FIX-01 — source lock: dialog "Sua" (editRow) khong
 * duoc dung <FormLabel> (can useFormContext -> null neu khong co <Form> Provider bao
 * ngoai -> TypeError getFieldState -> crash trang toan app, QA P0
 * docs/qa/evidence/qa-uc-hrm-22-u65-01.md muc 3.1). Dialog nay dung state thuong
 * (useState: editRow/editMode/...), khong phai react-hook-form, nen phai dung <Label>
 * thuong tu '@/components/ui/label' — khong phu thuoc form context.
 *
 * Test nay khong the mount full component (JobRequisitionsTab phu thuoc useAuth,
 * useHrmOperatingUnitFilter, useLocation, useJobRequisitions,
 * useSettingsCatalogsOverview, useEmpEmploymentTypesEffective — moi hook goi API/context
 * that; vitest.config include chi "src/**\/*.test.ts", khong co .test.tsx nao dang chay
 * trong workspace nay, dung pattern source-lock nhu cac file *.source.test.ts khac trong
 * cung thu muc). Bang chung crash-fix that: browser verify that trong
 * docs/qa/evidence/d-hrm-fe-requisition-edit-crash-fix-01.md.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const tabSrc = readFileSync(resolve(__dirname, './JobRequisitionsTab.tsx'), 'utf8');

function sliceBetween(src: string, startMarker: string, endMarker: string): string {
  const start = src.indexOf(startMarker);
  const end = src.indexOf(endMarker, start);
  expect(start).toBeGreaterThan(-1);
  expect(end).toBeGreaterThan(start);
  return src.slice(start, end);
}

const createDialogBlock = sliceBetween(
  tabSrc,
  '<Dialog open={createOpen}',
  '<Dialog open={editRow != null}',
);
const editDialogBlock = sliceBetween(
  tabSrc,
  '<Dialog open={editRow != null}',
  '<Dialog open={detailRow != null}',
);

describe('D-HRM-FE-REQUISITION-EDIT-CRASH-FIX-01 — edit dialog no longer uses FormLabel without Provider', () => {
  it('Label imported from ui/label (edit dialog no longer depends on react-hook-form context)', () => {
    expect(tabSrc).toContain("import { Label } from '@/components/ui/label';");
  });

  it('edit dialog (editRow) block has ZERO <FormLabel> — the P0 crash source', () => {
    expect(editDialogBlock).not.toContain('<FormLabel');
  });

  it('edit dialog block uses plain <Label> for every field previously on <FormLabel> (7 fields)', () => {
    const labelMatches = editDialogBlock.match(/<Label\b/g) ?? [];
    expect(labelMatches.length).toBe(7);
    expect(editDialogBlock).toContain('Trong / ngoài định biên *');
    expect(editDialogBlock).toContain('Lý do ngoài ĐB *');
    expect(editDialogBlock).toContain('Lý do tuyển');
    expect(editDialogBlock).toContain('NV thay thế *');
    expect(editDialogBlock).toContain('Ngạch/bậc');
    expect(editDialogBlock).toContain('Số lượng *');
  });

  it('edit dialog still has NO <Form {...}> react-hook-form Provider (uses useState, by design)', () => {
    expect(editDialogBlock).not.toMatch(/<Form\s+\{\.\.\./);
  });

  it('REGRESSION GUARD: create dialog (createForm) untouched — still wrapped by <Form {...createForm}> Provider with FormLabel', () => {
    expect(createDialogBlock).toContain('<Form {...createForm}>');
    expect(createDialogBlock).toContain('</Form>');
    const createLabelMatches = createDialogBlock.match(/<FormLabel\b/g) ?? [];
    expect(createLabelMatches.length).toBeGreaterThan(0);
  });
});
