/**
 * empCoreActRing — PO-HRM-MVP-GD1-CORE-07-CLUSTER-FE-01
 */
import { describe, expect, it } from 'vitest';
import {
  CORE_07_ACT_NE_DONE_FOOTER_VI,
  CORE_07_UAT_HONESTY,
  CORE_ACT_ENABLED_STATUS,
  CORE_ACT_PENDING_STATUS,
  HRM_EMP_ACT_CHECKLIST_INCOMPLETE_CODE,
  actStatusLabelFallback,
  buildActivatePostBody,
  buildGatedActivatePatchBody,
  deriveBlockingItemsFromChecklist,
  deriveCanActivateFromChecklist,
  formatActivatedAtDisplay,
  isActivateEligibleStatus,
  isCoreActPhysicalActivatePath,
  isForbiddenCoreActSotPath,
  isValidViDdMmYyyy,
  isoDateToViDdMmYyyy,
  pickActivateEnvelope,
  validateActivateEffectiveDateIso,
} from './empCoreActRing';

describe('empCoreActRing CORE-07', () => {
  it('path helpers — physical activate · Nest /core DENY', () => {
    expect(
      isCoreActPhysicalActivatePath('/api/hrm/employees/abc/activate?company_id=main'),
    ).toBe(true);
    expect(isForbiddenCoreActSotPath('/api/hrm/core/employees/abc/activate')).toBe(true);
    expect(isForbiddenCoreActSotPath('/api/hrm/employees/abc/activate')).toBe(false);
  });

  it('status spine pending_docs → active', () => {
    expect(isActivateEligibleStatus(CORE_ACT_PENDING_STATUS)).toBe(true);
    expect(isActivateEligibleStatus('active')).toBe(false);
    expect(actStatusLabelFallback('pending_docs')).toBe('Chờ hoàn thiện');
    expect(actStatusLabelFallback(CORE_ACT_ENABLED_STATUS)).toBe('Hoạt động');
  });

  it('effective_date ISO → dd/MM/yyyy · validate', () => {
    expect(isoDateToViDdMmYyyy('2026-08-09')).toBe('09/08/2026');
    expect(isValidViDdMmYyyy('09/08/2026')).toBe(true);
    expect(isValidViDdMmYyyy('32/08/2026')).toBe(false);
    expect(validateActivateEffectiveDateIso('')).toMatch(/ngày hiệu lực/i);
    expect(validateActivateEffectiveDateIso('2026-08-09')).toBeNull();
    expect(buildActivatePostBody('2026-08-09')).toEqual({ effective_date: '09/08/2026' });
    expect(buildGatedActivatePatchBody('2026-08-09')).toEqual({
      status: 'active',
      effective_date: '09/08/2026',
    });
  });

  it('formatActivatedAtDisplay — null → — · no epoch junk', () => {
    expect(formatActivatedAtDisplay(null)).toBe('—');
    expect(formatActivatedAtDisplay('')).toBe('—');
    expect(formatActivatedAtDisplay('1970-01-01')).toBe('—');
    expect(formatActivatedAtDisplay('2026-08-09')).toBe('09/08/2026');
    expect(formatActivatedAtDisplay('09/08/2026')).toBe('09/08/2026');
  });

  it('FE-derive can_activate / blocking_items from checklist', () => {
    const incomplete = [
      {
        documentTypeKey: 'CCCD',
        nameVi: 'CCCD',
        status: 'submitted',
        required: true,
        blocksActivation: true,
      },
      {
        documentTypeKey: 'CV',
        nameVi: 'CV',
        status: 'approved',
        required: false,
      },
    ];
    expect(deriveCanActivateFromChecklist(incomplete)).toBe(false);
    expect(deriveBlockingItemsFromChecklist(incomplete)).toEqual([
      { documentTypeKey: 'CCCD', nameVi: 'CCCD', status: 'submitted' },
    ]);

    const complete = [
      {
        documentTypeKey: 'CCCD',
        nameVi: 'CCCD',
        status: 'approved',
        required: true,
        blocksActivation: true,
      },
    ];
    expect(deriveCanActivateFromChecklist(complete)).toBe(true);
    expect(deriveBlockingItemsFromChecklist(complete)).toEqual([]);
  });

  it('pickActivateEnvelope prefers BE fields · falls back to checklist derive', () => {
    const fromBe = pickActivateEnvelope({
      status: 'pending_docs',
      statusLabelVi: 'Chờ hoàn thiện',
      can_activate: false,
      checklist_complete: false,
      blocking_items: [
        { documentTypeKey: 'X', nameVi: 'Giấy X', status: 'missing' },
      ],
      activated_at: null,
    });
    expect(fromBe.can_activate).toBe(false);
    expect(fromBe.blocking_items[0]?.documentTypeKey).toBe('X');

    const derived = pickActivateEnvelope({
      status: 'pending_docs',
      checklistItems: [
        { documentTypeKey: 'Y', nameVi: 'Giấy Y', status: 'approved', required: true },
      ],
    });
    expect(derived.can_activate).toBe(true);
    expect(derived.checklist_complete).toBe(true);
  });

  it('honesty footer · codes · flags false', () => {
    expect(HRM_EMP_ACT_CHECKLIST_INCOMPLETE_CODE).toBe('HRM-EMP-ACT-CHECKLIST-INCOMPLETE');
    expect(CORE_07_ACT_NE_DONE_FOOTER_VI).toMatch(/≠ CORE-07 DONE/);
    expect(CORE_07_ACT_NE_DONE_FOOTER_VI).toMatch(/≠ CORE-06 DONE/);
    expect(CORE_07_UAT_HONESTY.hrm_personnel_uat_ready).toBe(false);
    expect(CORE_07_UAT_HONESTY.contracts_printable_ready).toBe(false);
  });
});
