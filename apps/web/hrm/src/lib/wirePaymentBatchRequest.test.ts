import { describe, expect, it } from 'vitest';
import { buildWirePaymentBatchBody } from './wirePaymentBatchRequest';

describe('buildWirePaymentBatchBody (PO-HRM-AMIS-PARITY-PAY-PAYMENT-WIRE-FE-01)', () => {
  it('requires company_id in body (WirePaymentBatchDto)', () => {
    expect(buildWirePaymentBatchBody({ company_id: 'main' })).toEqual({ company_id: 'main' });
  });

  it('trims company_id and optional name / payment_method / bank_name', () => {
    expect(
      buildWirePaymentBatchBody({
        company_id: '  main  ',
        name: '  Chi trả T07  ',
        payment_method: ' bank_transfer ',
        bank_name: '  Vietcombank  ',
      }),
    ).toEqual({
      company_id: 'main',
      name: 'Chi trả T07',
      payment_method: 'bank_transfer',
      bank_name: 'Vietcombank',
    });
  });

  it('omits empty optional fields and only sets require_ess_confirm when true', () => {
    const body = buildWirePaymentBatchBody({
      company_id: 'holding',
      name: '   ',
      payment_method: null,
      bank_name: '',
      require_ess_confirm: false,
    });
    expect(body).toEqual({ company_id: 'holding' });
    expect(body).not.toHaveProperty('name');
    expect(body).not.toHaveProperty('require_ess_confirm');

    expect(
      buildWirePaymentBatchBody({
        company_id: 'holding',
        require_ess_confirm: true,
      }),
    ).toEqual({ company_id: 'holding', require_ess_confirm: true });
  });
});
