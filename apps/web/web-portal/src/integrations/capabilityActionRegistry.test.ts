import { describe, expect, it } from 'vitest';
import {
  COMMAND_CENTER_CAPABILITY_ACTIONS,
  resolveCapabilityActionState,
  resolveExecModuleAccessRoute,
} from './capabilityActionRegistry';

describe('capabilityActionRegistry', () => {
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
