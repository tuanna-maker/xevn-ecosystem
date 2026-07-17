import { describe, expect, it } from 'vitest';
import {
  hrmAppPath,
  hrmPortalPath,
  hrmProxyPath,
  hrmProxyPathFromSuffix,
  hrmPortalSuffixFromPathname,
  HRM_PORTAL_BASE,
} from './paths';

describe('hrmProxyPath (Command Center embed)', () => {
  it('maps pilot views to /hr paths with portal scope query', () => {
    expect(hrmProxyPath('employees', { portal: true, tenantId: 'xevn', companyId: 'main' })).toBe(
      '/hr/employees?portal=1&tenantId=xevn&companyId=main',
    );
    expect(hrmProxyPath('reports', { portal: true, companyId: 'main' })).toBe(
      '/hr/reports?portal=1&companyId=main',
    );
    expect(hrmProxyPath('tasks', { portal: true, companyId: 'main' })).toBe(
      '/hr/tasks?portal=1&companyId=main',
    );
    expect(hrmProxyPath('processes', { portal: true, companyId: 'main' })).toBe(
      '/hr/processes?portal=1&companyId=main',
    );
    expect(hrmProxyPath('internal_services', { portal: true, companyId: 'main' })).toBe(
      '/hr/internal-services?portal=1&companyId=main',
    );
    expect(hrmProxyPath('insurance', { portal: true, companyId: 'main' })).toBe(
      '/hr/insurance?portal=1&companyId=main',
    );
    expect(hrmProxyPath('attendance', { portal: true, companyId: 'main' })).toBe(
      '/hr/attendance?portal=1&companyId=main',
    );
    expect(hrmProxyPath('payroll', { portal: true, companyId: 'main' })).toBe(
      '/hr/payroll?portal=1&companyId=main',
    );
    expect(hrmProxyPath('performance', { portal: true, companyId: 'main' })).toBe(
      '/hr/performance?portal=1&companyId=main',
    );
  });

  it('optionally appends cache-bust query when explicitly requested (legacy G-INT-08)', () => {
    const url = hrmProxyPathFromSuffix('employees', {
      portal: true,
      tenantId: 'xevn',
      companyId: 'main',
      cacheBust: 1717756800000,
    });
    expect(url).toContain('_v=1717756800000');
    expect(url).toContain('companyId=main');
  });

  it('maps holding embed hint to main in iframe query (EX-SA01-P1-03)', () => {
    expect(hrmProxyPath('employees', { portal: true, tenantId: 'xevn', companyId: 'holding' })).toBe(
      '/hr/employees?portal=1&tenantId=xevn&companyId=main',
    );
  });

  it('maps tenant slug mistaken as companyId to main in iframe query (HTTPS pilot)', () => {
    expect(hrmProxyPath('employees', { portal: true, tenantId: 'xevn', companyId: 'xevn' })).toBe(
      '/hr/employees?portal=1&tenantId=xevn&companyId=main',
    );
  });

  it('omits companyId when scope is all', () => {
    expect(hrmProxyPath('contracts', { portal: true, companyId: 'all' })).toBe(
      '/hr/contracts?portal=1',
    );
  });

  it('exposes command-center base for workspace routes', () => {
    expect(hrmPortalPath('employees')).toBe(`${HRM_PORTAL_BASE}/employees`);
  });

  it('hrmAppPath prefers same-origin /hr without default :8080 origin', () => {
    expect(hrmAppPath('employees', { portal: true, companyId: 'main' })).toBe(
      '/hr/employees?portal=1&companyId=main',
    );
  });

  it('dashboard iframe uses /hr/ trailing slash (Vite base)', () => {
    expect(hrmProxyPath('dashboard', { portal: true, tenantId: 'xevn', companyId: 'main' })).toBe(
      '/hr/?portal=1&tenantId=xevn&companyId=main',
    );
    expect(
      hrmProxyPathFromSuffix('dashboard', { portal: true, tenantId: 'xevn', companyId: 'main' }),
    ).toBe('/hr/?portal=1&tenantId=xevn&companyId=main');
  });

  it('member CEO iframe carries xe-du-lich tenant + main company (C-MEMCC-01)', () => {
    expect(
      hrmProxyPathFromSuffix('employees', {
        portal: true,
        tenantId: 'xe-du-lich',
        companyId: 'main',
      }),
    ).toBe('/hr/employees?portal=1&tenantId=xe-du-lich&companyId=main');
    expect(
      hrmProxyPath('dashboard', { portal: true, tenantId: 'xe-du-lich', companyId: 'main' }),
    ).toBe('/hr/?portal=1&tenantId=xe-du-lich&companyId=main');
  });

  it('maps internal_services portal suffix to hyphenated iframe path (D-HRM-INTSVC-404-01)', () => {
    expect(
      hrmProxyPathFromSuffix('internal_services', { portal: true, companyId: 'main' }),
    ).toBe('/hr/internal-services?portal=1&companyId=main');
    expect(
      hrmProxyPathFromSuffix('tools_equipment', { portal: true, companyId: 'main' }),
    ).toBe('/hr/tools-equipment?portal=1&companyId=main');
  });

  it('maps performance portal suffix to /hr/performance embed (COND-PF-PORTAL-01)', () => {
    expect(
      hrmProxyPathFromSuffix('performance', { portal: true, tenantId: 'xevn', companyId: 'main' }),
    ).toBe('/hr/performance?portal=1&tenantId=xevn&companyId=main');
  });

  it('supports deep link employees/:id via suffix', () => {
    expect(
      hrmProxyPathFromSuffix('employees/emp-uuid-1', {
        portal: true,
        companyId: 'main',
      }),
    ).toBe('/hr/employees/emp-uuid-1?portal=1&companyId=main');
    expect(hrmPortalPath('employees/emp-uuid-1')).toBe(
      `${HRM_PORTAL_BASE}/employees/emp-uuid-1`,
    );
    expect(hrmPortalSuffixFromPathname(`${HRM_PORTAL_BASE}/employees/emp-uuid-1`)).toBe(
      'employees/emp-uuid-1',
    );
  });
});
