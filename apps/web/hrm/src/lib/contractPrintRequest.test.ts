import { describe, expect, it } from 'vitest';
import { buildContractPrintMutateRequest } from './contractPrintRequest';

describe('buildContractPrintMutateRequest (PO-HRM-CONTRACT-LEGAL-PRINT-FE-02)', () => {
  it('puts company_id on query only — body has no company_id key', () => {
    const { companyIdQuery, body } = buildContractPrintMutateRequest({
      company_id: 'main',
      pack_code: 'GENERAL',
      template_id: '11111111-1111-4111-8111-111111111111',
    });
    expect(companyIdQuery).toBe('main');
    expect(body).toEqual({
      pack_code: 'GENERAL',
      template_id: '11111111-1111-4111-8111-111111111111',
    });
    expect(Object.prototype.hasOwnProperty.call(body, 'company_id')).toBe(false);
    expect(JSON.stringify(body)).not.toContain('company_id');
  });

  it('omits empty template_id and includes optional field_overrides / can_view_cb', () => {
    const { body } = buildContractPrintMutateRequest({
      company_id: 'holding',
      pack_code: 'DRIVER',
      template_id: '  ',
      field_overrides: { employee_name: 'Nguyễn Văn A' },
      can_view_cb: true,
    });
    expect(body).toEqual({
      pack_code: 'DRIVER',
      field_overrides: { employee_name: 'Nguyễn Văn A' },
      can_view_cb: true,
    });
    expect('template_id' in body).toBe(false);
    expect('company_id' in body).toBe(false);
  });

  it('trims pack_code', () => {
    const { body } = buildContractPrintMutateRequest({
      company_id: 'main',
      pack_code: '  IT_OFFICE  ',
    });
    expect(body.pack_code).toBe('IT_OFFICE');
  });

  it('EXPANDs template_code for open catalog (XEVN-TPL-FE-01)', () => {
    const { body } = buildContractPrintMutateRequest({
      company_id: 'main',
      pack_code: 'IT_OFFICE',
      template_id: 'uuid-9',
      template_code: 'xevn_custom_office_01',
    });
    expect(body.template_code).toBe('XEVN_CUSTOM_OFFICE_01');
    expect(body.template_id).toBe('uuid-9');
    expect(body).not.toHaveProperty('company_id');
  });

  it('allows template_code without pack when bound', () => {
    const { body } = buildContractPrintMutateRequest({
      company_id: 'main',
      template_code: 'XEVN_FT_12M_OFFICE',
    });
    expect(body.template_code).toBe('XEVN_FT_12M_OFFICE');
    expect(body).not.toHaveProperty('pack_code');
  });
});
