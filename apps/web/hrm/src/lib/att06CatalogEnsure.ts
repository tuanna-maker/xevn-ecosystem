/**
 * @CODE-MEMORY
 * Screen:     ATT-06 — prerequisite catalogs (OT comp type · loại phép ot_comp) qua Nest admin API
 * UC:         UC-BP-ATT-06 · J-HRM-ATT-06-02 · J-HRM-ATT-06-05
 * Purpose:    U65 product path — upsert catalog khi tenant thiếu mã map accrual / ot_comp (không seed script).
 * WorkItem:   PO-HRM-MVP-GD1-ATT-06-CLUSTER-FE-02
 * Coded:      2026-08-10
 * Callers:    OvertimeRequestTab · LeaveTab · AttOtCompLeavePolicySettingsPanel
 * Callees:    upsertAttOtCompType · upsertAttLeaveType · listEffective*
 * must_keep:  ATT05BQC1 · ATT09 · attLeave06Ring path lock · ≠ FR-06 DONE
 * LastVerified: att06CatalogEnsure.test.ts
 */
import {
  listEffectiveAttLeaveTypes,
  listEffectiveAttOtCompTypes,
  upsertAttLeaveType,
  upsertAttOtCompType,
} from '@/integrations/hrmApi';
import {
  ATT_06_OT_COMP_CATEGORY,
  ATT_06_OT_COMP_LEAVE_TYPE_KEY,
  ATT_06_OT_COMP_LEAVE_TYPE_NAME_VI,
  ATT_06_OT_COMP_TYPE_CODE,
  ATT_06_OT_COMP_TYPE_NAME_VI,
  effectiveHasOtCompLeaveCategory,
  isOtCompAccrualMappableCode,
} from '@/lib/attLeave06Ring';

export type Att06CatalogEnsureResult = {
  otCompTypeCreated: boolean;
  otCompLeaveTypeCreated: boolean;
};

async function effectiveOtCompCodes(companyId: string): Promise<string[]> {
  const res = await listEffectiveAttOtCompTypes({ company_id: companyId });
  return (res.items ?? [])
    .map((row) => String(row.code ?? '').trim())
    .filter(Boolean);
}

/**
 * Upsert compensatory_leave trong catalog OT comp khi EFF chưa có mã map accrual.
 */
export async function ensureAtt06OtCompTypeForAccrual(companyId: string): Promise<boolean> {
  const codes = await effectiveOtCompCodes(companyId);
  if (codes.some((c) => isOtCompAccrualMappableCode(c))) return false;
  await upsertAttOtCompType({
    companyId,
    code: ATT_06_OT_COMP_TYPE_CODE,
    nameVi: ATT_06_OT_COMP_TYPE_NAME_VI,
    nameEn: 'OT compensatory leave payout',
    sortOrder: 50,
    status: 'active',
  });
  return true;
}

/**
 * Upsert loại phép category ot_comp khi effective chưa có (J-05 att-06-form-panel).
 */
export async function ensureAtt06OtCompLeaveType(companyId: string): Promise<boolean> {
  const res = await listEffectiveAttLeaveTypes({ company_id: companyId });
  if (effectiveHasOtCompLeaveCategory(res.items ?? [])) return false;
  await upsertAttLeaveType({
    companyId,
    leaveTypeKey: ATT_06_OT_COMP_LEAVE_TYPE_KEY,
    nameVi: ATT_06_OT_COMP_LEAVE_TYPE_NAME_VI,
    category: ATT_06_OT_COMP_CATEGORY,
    isPaid: true,
    allowsCarryOver: false,
    allowsAdvance: false,
    countsTowardTimesheet: true,
    status: 'active',
  });
  return true;
}

/** Gộp ensure OT comp + loại phép ot_comp (một lần trước journey ATT-06). */
export async function ensureAtt06CatalogPrereqs(companyId: string): Promise<Att06CatalogEnsureResult> {
  const otCompTypeCreated = await ensureAtt06OtCompTypeForAccrual(companyId);
  const otCompLeaveTypeCreated = await ensureAtt06OtCompLeaveType(companyId);
  return { otCompTypeCreated, otCompLeaveTypeCreated };
}
