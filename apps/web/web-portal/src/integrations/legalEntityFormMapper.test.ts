import { describe, expect, it } from 'vitest';
import {
  coerceCharterCapital,
  isLegalEntityValidationHttpError,
  mapLegalEntityRowToCompanyForm,
  parseLegalEntitySaveFieldErrors,
} from './legalEntityFormMapper';
import type { LegalEntityApiRow } from './orgFoundationApi';

describe('legalEntityFormMapper', () => {
  it('maps API row and nested companyForm payload (UC-CC-03)', () => {
    const row: LegalEntityApiRow = {
      id: 'a1b2c3d4-e5f6-4789-a012-3456789abcde',
      tenant_id: 'xevn',
      company_id: 'main',
      code: 'XDL',
      name: 'Xe Du Lịch',
      entity_type: 'subsidiary',
      tax_code: '0123456789',
      charter_capital: 500000000000,
      legal_representative: 'Nguyễn A',
      address: 'Hà Nội',
      payload: {
        companyForm: {
          nameVi: 'Công ty Du Lịch',
          shortName: 'XDL',
          enterpriseCode: '0123456789',
          charterCapital: 500000000000,
        },
      },
    };
    const form = mapLegalEntityRowToCompanyForm(row);
    expect(form.nameVi).toBe('Công ty Du Lịch');
    expect(form.enterpriseCode).toBe('0123456789');
    expect(form.charterCapital).toBe(500000000000);
    expect(form.entityLevel).toBe('subsidiary');
  });

  it('coerces charter capital from comma-separated API strings (UC-CC-03 scale)', () => {
    expect(coerceCharterCapital('500,000,000,000')).toBe(500000000000);
    expect(coerceCharterCapital(' 900000000000 ')).toBe(900000000000);
    const row: LegalEntityApiRow = {
      id: 'b2c3d4e5-f6a7-4890-b123-456789abcdef0',
      tenant_id: 'xevn',
      company_id: 'main',
      code: 'HOLD',
      name: 'Holding',
      entity_type: 'holding',
      charter_capital: '750000000000' as unknown as number,
    };
    expect(mapLegalEntityRowToCompanyForm(row).charterCapital).toBe(750000000000);
    expect(mapLegalEntityRowToCompanyForm(row).entityLevel).toBe('parent');
  });

  it('parses validation errors for inline form (UC-CC-04)', () => {
    const errors = parseLegalEntitySaveFieldErrors(
      'legal entity create failed: Mã số thuế không hợp lệ (HTTP 400)',
    );
    expect(errors.taxCode).toBeTruthy();
    expect(errors.nameVi).toBeUndefined();
    expect(isLegalEntityValidationHttpError('failed (HTTP 400)')).toBe(true);
  });

  it('maps code/name validation to shortName and nameVi fields (UC-CC member save)', () => {
    const codeOnly = parseLegalEntitySaveFieldErrors('code must be a non-empty string (HTTP 400)');
    expect(codeOnly.shortName).toContain('code');
    expect(codeOnly.nameVi).toBeUndefined();

    const nameOnly = parseLegalEntitySaveFieldErrors('name is required (HTTP 400)');
    expect(nameOnly.nameVi).toContain('name');
    expect(nameOnly.shortName).toBeUndefined();

    const both = parseLegalEntitySaveFieldErrors('code and name validation failed (HTTP 400)');
    expect(both.shortName).toBeTruthy();
    expect(both.nameVi).toBeTruthy();
  });

  it('keeps row.code as shortName when nested shortName equals display name', () => {
    const row: LegalEntityApiRow = {
      id: '11d2bb7b-6190-4cb4-b0fe-03d43b5596b8',
      tenant_id: 'xevn',
      company_id: 'main',
      code: 'XE_DU_LICH',
      name: 'QA L25 browser save 20260604',
      entity_type: 'subsidiary',
      payload: {
        companyForm: {
          shortName: 'QA L25 browser save 20260604',
          nameVi: 'QA L25 browser save 20260604',
        },
      },
    };
    expect(mapLegalEntityRowToCompanyForm(row).shortName).toBe('XE_DU_LICH');
  });

  it('maps charter capital and generic validation messages (UC-CC-04)', () => {
    const charter = parseLegalEntitySaveFieldErrors('charter_capital must be positive (HTTP 400)');
    expect(charter.charterCapital).toBe('Vốn điều lệ không hợp lệ.');

    const generic = parseLegalEntitySaveFieldErrors('validation failed (HTTP 400)');
    expect(generic.enterpriseCode).toContain('MST');
  });
});
