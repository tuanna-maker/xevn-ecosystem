import { describe, expect, it } from 'vitest';
import {
  COMMAND_CENTER_CAPABILITY_ACTIONS,
  resolveCapabilityActionState,
  resolveExecModuleAccessRoute,
} from './capabilityActionRegistry';

/** Unique capability_code values from ACTION_BUTTON_INVENTORY.md §1–§16 (BA catalog PASS). */
const CATALOG_CAPABILITY_CODES = [
  'ACT-CC-DEPT-DELETE',
  'ACT-CC-LEGAL-DOC-ADD',
  'ACT-CC-LEGAL-DOC-DELETE',
  'ACT-CC-SHR-DELETE',
  'ACT-CC-WF-REJECT',
  'ACT-HRM-ATT-CREATE',
  'ACT-HRM-DEC-READ',
  'ACT-HRM-EMP-ARCHIVE',
  'ACT-HRM-INS-LINK',
  'ACT-HRM-META-APPROVE',
  'ACT-HRM-META-REJECT',
  'ACT-HRM-REC-CREATE',
  'BTN-A1-INBOX-DETAIL',
  'BTN-A1-INBOX-QUICK',
  'BTN-A2-CATALOG-GOV-APPROVE',
  'BTN-A2-CATALOG-GOV-REJECT',
  'BTN-A3-GROUP-HR-DELETE-PRESET',
  'BTN-A3-GROUP-HR-SAVE-BLOCK',
  'BTN-A5-EXEC-MODULE-ACCESS',
  'BTN-A6-AUTH-LOGOUT',
  'BTN-A7-HR-ADD-EMPLOYEE',
  'BTN-A8-BUSINESS-MASTER-CRUD',
  'BTN-A9-HRM-EMBED-DEEP-LINK',
  'BTN-B1-EMPLOYEES-CREATE',
  'BTN-B2-PAYROLL-COMPONENTS',
  'BTN-B2-PAYROLL-PERIODS',
  'BTN-B3-ATTENDANCE-SAVE',
  'BTN-B4-RECRUITMENT-PLAN-APPROVE',
  'BTN-B4-RECRUITMENT-PLAN-REJECT',
  'BTN-B5-CONTRACTS-EDIT',
  'BTN-B6-HRM-SETTINGS-SAVE',
  'BTN-B7-LEAVE-UNIFY',
  'BTN-CC-P0-DEPT-SAVE',
  'BTN-CC-P0-LEGAL-DOC-UPLOAD',
  'BTN-CC-P0-LEGAL-DOC-VIEW',
  'BTN-CC-P0-LEGAL-ENTITY-SAVE',
  'BTN-CC-P0-METADATA-PREVIEW',
  'BTN-CC-P0-PERM-MATRIX',
  'BTN-CC-P0-SHAREHOLDER-SAVE',
  'CC-GROUP-HR-CATALOG-SYNC',
  'CC-GROUP-MEMBER-UNITS',
  'CC-KPI-SPARKLINE',
  'CC-WORKFLOW-INBOX',
  'CC-WORKSPACE-META',
  'G11-RACI-GOVERNANCE',
  'G19-CATALOG-GOVERNANCE-API',
  'G24-KPI-ROLLUP',
  'HRM-EMBED-OPERATIONS',
  'SETTINGS-DEPT-CATALOG',
] as const;

const DELTA_ACT_CODES = [
  'ACT-CC-SHR-DELETE',
  'ACT-CC-LEGAL-DOC-ADD',
  'ACT-CC-LEGAL-DOC-DELETE',
  'ACT-CC-WF-REJECT',
  'ACT-CC-DEPT-DELETE',
  'ACT-HRM-EMP-ARCHIVE',
  'ACT-HRM-INS-LINK',
  'ACT-HRM-ATT-CREATE',
  'ACT-HRM-REC-CREATE',
  'ACT-HRM-DEC-READ',
  'ACT-HRM-META-APPROVE',
  'ACT-HRM-META-REJECT',
] as const;

describe('capabilityActionRegistry', () => {
  it('covers all ACTION_BUTTON_INVENTORY §1–§16 capability codes', () => {
    for (const code of CATALOG_CAPABILITY_CODES) {
      expect(COMMAND_CENTER_CAPABILITY_ACTIONS[code], code).toBeDefined();
    }
    expect(Object.keys(COMMAND_CENTER_CAPABILITY_ACTIONS).length).toBeGreaterThanOrEqual(
      CATALOG_CAPABILITY_CODES.length,
    );
  });

  it('promotes delta ACT-* codes with apiRoute or client/disabled metadata', () => {
    for (const code of DELTA_ACT_CODES) {
      const def = COMMAND_CENTER_CAPABILITY_ACTIONS[code];
      expect(def?.capabilityCode).toBe(code);
      if (def?.wireMode === 'api') {
        expect(def.apiRoute, code).toBeTruthy();
      }
      if (code === 'ACT-HRM-DEC-READ') {
        expect(def?.wireMode).toBe('client');
      }
    }
  });

  it('covers Track A inventory codes', () => {
    expect(COMMAND_CENTER_CAPABILITY_ACTIONS['BTN-A1-INBOX-QUICK']?.wireMode).toBe('api');
    expect(COMMAND_CENTER_CAPABILITY_ACTIONS['BTN-A1-INBOX-DETAIL']?.wireMode).toBe('api');
    expect(COMMAND_CENTER_CAPABILITY_ACTIONS['BTN-CC-P0-SHAREHOLDER-SAVE']?.wireMode).toBe('api');
    expect(COMMAND_CENTER_CAPABILITY_ACTIONS['BTN-CC-P0-LEGAL-DOC-UPLOAD']?.wireMode).toBe('api');
    expect(COMMAND_CENTER_CAPABILITY_ACTIONS['BTN-CC-P0-DEPT-SAVE']?.wireMode).toBe('api');
    expect(COMMAND_CENTER_CAPABILITY_ACTIONS['BTN-CC-P0-METADATA-PREVIEW']?.wireMode).toBe('client');
    expect(COMMAND_CENTER_CAPABILITY_ACTIONS['BTN-A3-GROUP-HR-DELETE-PRESET']?.wireMode).toBe('client');
    expect(COMMAND_CENTER_CAPABILITY_ACTIONS['BTN-A5-EXEC-MODULE-ACCESS']?.wireMode).toBe('navigation');
  });

  it('blocks with explicit reason when runtime blocked', () => {
    const state = resolveCapabilityActionState('BTN-A1-INBOX-QUICK', {
      blocked: true,
      blockedReasonVi: 'Chọn một nhiệm vụ trong hộp thư.',
    });
    expect(state?.enabled).toBe(false);
    expect(state?.disabledReasonVi).toContain('Chọn một nhiệm vụ');
  });

  it('preset delete has documented disabled reason in registry', () => {
    const state = resolveCapabilityActionState('BTN-A3-GROUP-HR-DELETE-PRESET', {
      blocked: true,
      blockedReasonVi: COMMAND_CENTER_CAPABILITY_ACTIONS['BTN-A3-GROUP-HR-DELETE-PRESET']
        ?.disabledReasonVi,
    });
    expect(state?.enabled).toBe(false);
    expect(state?.disabledReasonVi).toMatch(/preset/i);
  });

  it('maps executive module routes', () => {
    expect(resolveExecModuleAccessRoute('hrm')).toBe('/command-center/hrm/dashboard');
    expect(resolveExecModuleAccessRoute('unknown')).toBe('/command-center');
  });
});
