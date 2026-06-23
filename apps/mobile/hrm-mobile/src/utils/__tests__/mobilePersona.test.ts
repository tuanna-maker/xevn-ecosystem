import { describe, expect, it } from 'vitest';

import {
  isLeaderJobTitle,
  isLeaderPersona,
  isManagerPersona,
  isRollupPersonaScope,
  personaHasManagerInbox,
  resolveMobilePersona,
  toMobilePersonaCode,
} from '../mobilePersona';

describe('mobilePersona — MOB-UX-13e resolver', () => {
  it('priority LDR > MGR > EMP', () => {
    expect(
      resolveMobilePersona({
        roles: ['manager'],
        jobTitleKey: 'CEO',
        companyId: 'main',
        summaryIsManager: true,
      }),
    ).toBe('leader');

    expect(
      resolveMobilePersona({
        roles: ['manager'],
        jobTitleKey: 'engineer',
        companyId: 'trsport',
        summaryIsManager: true,
      }),
    ).toBe('manager');

    expect(
      resolveMobilePersona({
        roles: [],
        jobTitleKey: 'engineer',
        companyId: 'holding',
        summaryIsManager: false,
      }),
    ).toBe('employee');
  });

  it('summaryIsManager=false forces EMP over JWT manager role', () => {
    expect(
      resolveMobilePersona({
        roles: ['manager', 'hr_manager'],
        jobTitleKey: 'engineer',
        companyId: 'holding',
        summaryIsManager: false,
      }),
    ).toBe('employee');
  });

  it('summaryIsManager=false forces EMP over executive title at rollup (uat.nv0001)', () => {
    expect(
      resolveMobilePersona({
        roles: ['manager'],
        jobTitleKey: 'CEO',
        companyId: 'holding',
        summaryIsManager: false,
      }),
    ).toBe('employee');

    expect(
      isLeaderPersona({
        jobTitleKey: 'CEO',
        companyId: 'main',
        summaryIsManager: false,
      }),
    ).toBe(false);
  });

  it('leader requires rollup scope and summaryIsManager=true', () => {
    expect(
      isLeaderPersona({
        jobTitleKey: 'CEO',
        companyId: 'trsport',
        summaryIsManager: true,
        memberships: [{ tenant_id: 't', company_id: 'trsport', company_uuid: 'u', employee_id: 'e' }],
      }),
    ).toBe(false);

    expect(
      isLeaderPersona({
        jobTitleKey: 'CEO',
        companyId: 'main',
        summaryIsManager: true,
      }),
    ).toBe(true);

    expect(
      isLeaderPersona({
        jobTitleKey: 'CEO',
        companyId: 'uuid-legal',
        summaryIsManager: true,
        memberships: [{ tenant_id: 't', company_id: 'holding', company_uuid: 'u', employee_id: 'e' }],
      }),
    ).toBe(true);

    expect(
      isLeaderPersona({
        jobTitleKey: 'CEO',
        companyId: 'main',
        summaryIsManager: null,
      }),
    ).toBe(false);
  });

  it('isManagerPersona falls back to JWT when summary unknown', () => {
    expect(isManagerPersona({ roles: ['manager'], summaryIsManager: null })).toBe(true);
    expect(isManagerPersona({ roles: [], summaryIsManager: null })).toBe(false);
  });

  it('maps persona codes and manager inbox scope', () => {
    expect(toMobilePersonaCode('leader')).toBe('LDR');
    expect(toMobilePersonaCode('manager')).toBe('MGR');
    expect(toMobilePersonaCode('employee')).toBe('EMP');
    expect(personaHasManagerInbox('leader')).toBe(true);
    expect(personaHasManagerInbox('employee')).toBe(false);
  });

  it('detects executive job titles case-insensitively', () => {
    expect(isLeaderJobTitle('coo')).toBe(true);
    expect(isLeaderJobTitle('DIRECTOR')).toBe(true);
    expect(isLeaderJobTitle('engineer')).toBe(false);
  });

  it('rollup scope accepts holding/main slugs', () => {
    expect(isRollupPersonaScope('holding')).toBe(true);
    expect(isRollupPersonaScope('main')).toBe(true);
    expect(isRollupPersonaScope('trsport')).toBe(false);
  });
});
