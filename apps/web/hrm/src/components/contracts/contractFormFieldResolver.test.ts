import { describe, expect, it } from 'vitest';
import {
  buildActiveContractFormFields,
  isContractCreateWizardFormReady,
} from './contractFormFieldResolver';
import type { HrmSettingsCatalogOverviewRow } from '@/integrations/hrmApi';

function catalogWithActive(codes: string[]): HrmSettingsCatalogOverviewRow {
  return {
    catalogKey: 'hrm_contract_form_fields',
    name: null,
    domain: null,
    xbosVersion: null,
    xbosSyncedAt: null,
    xbosItems: [],
    hrmExtensionItems: [],
    effectiveItems: codes.map((code) => ({
      code,
      label: code,
      status: 'active' as const,
      unit: null,
      origin: 'hrm' as const,
    })),
  };
}

describe('buildActiveContractFormFields — PO-HRM-SETTINGS-FIDELITY-FE-03', () => {
  it('empty catalog → full defaults including department', () => {
    const set = buildActiveContractFormFields(undefined);
    expect(set.has('department')).toBe(true);
    expect(set.size).toBe(9);
  });

  it('partial catalog without department row → still includes department', () => {
    const set = buildActiveContractFormFields(
      catalogWithActive(['contract_type', 'effective_date', 'status']),
    );
    expect(set.has('department')).toBe(true);
    expect(set.has('contract_code')).toBe(true);
    expect(set.has('employee_name')).toBe(true);
    expect(set.has('contract_type')).toBe(true);
    expect(set.has('notes')).toBe(false);
  });

  it('catalog with department active → department present', () => {
    const set = buildActiveContractFormFields(catalogWithActive(['department', 'notes']));
    expect(set.has('department')).toBe(true);
    expect(set.has('notes')).toBe(true);
  });

  it('inactive department row → department still required on wizard', () => {
    const catalog: HrmSettingsCatalogOverviewRow = {
      catalogKey: 'hrm_contract_form_fields',
      name: null,
      domain: null,
      xbosVersion: null,
      xbosSyncedAt: null,
      xbosItems: [],
      hrmExtensionItems: [],
      effectiveItems: [
        { code: 'department', label: 'Phòng ban', status: 'inactive', unit: null, origin: 'hrm' },
        { code: 'contract_type', label: 'Loại', status: 'active', unit: null, origin: 'hrm' },
      ],
    };
    const set = buildActiveContractFormFields(catalog);
    expect(set.has('department')).toBe(true);
    expect(set.has('contract_type')).toBe(true);
  });
});

describe('isContractCreateWizardFormReady — HRM-CTR-CREATE-REDESIGN-FE-03', () => {
  it('create waits only for catalogs — not employee or template list', () => {
    expect(
      isContractCreateWizardFormReady({ editing: false, catalogsLoading: true }),
    ).toBe(false);
    expect(
      isContractCreateWizardFormReady({ editing: false, catalogsLoading: false }),
    ).toBe(true);
  });

  it('edit mode is always ready', () => {
    expect(
      isContractCreateWizardFormReady({ editing: true, catalogsLoading: true }),
    ).toBe(true);
  });
});
