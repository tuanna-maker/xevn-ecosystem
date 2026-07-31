import { describe, expect, it } from 'vitest';
import { PORTAL_HRM_MENU_PATH } from './hrmEmbedPortalNav';

describe('PORTAL_HRM_MENU_PATH', () => {
  it('maps P-CC pilot embed menus to command-center routes', () => {
    expect(PORTAL_HRM_MENU_PATH.insurance).toBe('/command-center/hrm/insurance');
    expect(PORTAL_HRM_MENU_PATH.recruitment).toBe('/command-center/hrm/recruitment');
    expect(PORTAL_HRM_MENU_PATH.attendance).toBe('/command-center/hrm/attendance');
    expect(PORTAL_HRM_MENU_PATH.payroll).toBe('/command-center/hrm/payroll');
    expect(PORTAL_HRM_MENU_PATH.fleet).toBe('/command-center/hrm/fleet');
  });
});
