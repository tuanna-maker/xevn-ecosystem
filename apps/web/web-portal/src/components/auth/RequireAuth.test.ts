import { describe, expect, it } from 'vitest';
import {
  allowDevBypass,
  isCommandCenterPath,
  isProtectedPortalPath,
} from './RequireAuth';

describe('RequireAuth — UC-ECO-SCOPE-01', () => {
  it('marks command-center and dashboard as protected', () => {
    expect(isCommandCenterPath('/command-center')).toBe(true);
    expect(isCommandCenterPath('/command-center/hrm/employees')).toBe(true);
    expect(isCommandCenterPath('/visun/command-center/hrm/employees')).toBe(true);
    expect(isProtectedPortalPath('/cockpit')).toBe(true);
    expect(isProtectedPortalPath('/visun/cockpit')).toBe(true);
    expect(isProtectedPortalPath('/dashboard/kpi-dashboard')).toBe(true);
    expect(isProtectedPortalPath('/visun/dashboard/kpi-dashboard')).toBe(true);
    expect(isProtectedPortalPath('/')).toBe(true);
  });

  it('blocks dev bypass on protected portal paths', () => {
    expect(allowDevBypass('/command-center')).toBe(false);
    expect(allowDevBypass('/cockpit')).toBe(false);
    expect(allowDevBypass('/dashboard/kpi-policy')).toBe(false);
    expect(allowDevBypass('/')).toBe(false);
  });
});
