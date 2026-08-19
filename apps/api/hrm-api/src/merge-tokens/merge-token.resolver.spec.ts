/**
 * PO-HRM-DYNAMIC-CONFIG-PLATFORM-BE-01 — resolve order §5.2
 * VAL-PLT-TOK-01 registry wins · VAL-PLT-TOK-02 empty→keyword_map · VAL-PLT-TOK-03 braces
 */
import {
  normalizeTokenKey,
  parseKeywordMapBindings,
  resolveMergeTokens,
} from './merge-token.resolver';

describe('merge-token.resolver (DATA §5.2)', () => {
  it('normalizeTokenKey strips {{braces}} (VAL-PLT-TOK-03)', () => {
    expect(normalizeTokenKey('{{contract_number}}')).toBe('contract_number');
    expect(normalizeTokenKey('employee.full_name')).toBe('employee.full_name');
  });

  it('parseKeywordMapBindings normalizes braced keys', () => {
    const m = parseKeywordMapBindings({
      '{{contract_number}}': { source: 'employee_contracts.contract_code', ring: 'contract' },
      effective_from: { source: 'employee_contracts.start_date', ring: 'contract' },
    });
    expect(m.get('contract_number')?.sourcePath).toBe('employee_contracts.contract_code');
    expect(m.get('effective_from')?.ring).toBe('contract');
  });

  it('VAL-PLT-TOK-01 registry wins over keyword_map on same token_key', () => {
    const result = resolveMergeTokens({
      registry: [
        {
          tokenKey: 'contract_number',
          sourcePath: 'contract.contract_code',
          ring: 'contract',
          status: 'active',
        },
      ],
      keywordMap: {
        '{{contract_number}}': {
          source: 'employee_contracts.contract_code',
          ring: 'contract',
        },
      },
      valueBag: {
        contract_code: 'HD-REG-01',
        contract_number: 'HD-REG-01',
      },
      tokenKeys: ['contract_number'],
    });
    const tok = result.tokens.find((t) => t.tokenKey === 'contract_number');
    expect(tok?.source).toBe('registry');
    expect(tok?.value).toBe('HD-REG-01');
    expect(result.resolveOrder).toContain('registry');
  });

  it('VAL-PLT-TOK-02 empty registry falls back to keyword_map (print-spine operable)', () => {
    const result = resolveMergeTokens({
      registry: [],
      keywordMap: {
        '{{employee_full_name}}': { source: 'employee.full_name', ring: 'public' },
        '{{contract_number}}': {
          source: 'employee_contracts.contract_code',
          ring: 'contract',
        },
      },
      valueBag: {
        employee_full_name: 'Nguyễn A',
        contract_code: 'HD-KW-01',
        contract_number: 'HD-KW-01',
      },
      tokenKeys: ['employee_full_name', 'contract_number'],
    });
    expect(result.tokens.every((t) => t.source === 'keyword_map')).toBe(true);
    expect(result.mergedPreview.employee_full_name).toBe('Nguyễn A');
    expect(result.mergedPreview.contract_number).toBe('HD-KW-01');
    expect(result.resolveOrder).toContain('keyword_map');
  });

  it('VAL-PLT-TOK-05 masks ring=cb when canViewCb=false', () => {
    const result = resolveMergeTokens({
      registry: [
        {
          tokenKey: 'cb.base_salary',
          sourcePath: 'cb.base_salary',
          ring: 'cb',
          status: 'active',
        },
      ],
      valueBag: { base_salary_amount: 15_000_000 },
      tokenKeys: ['cb.base_salary'],
      canViewCb: false,
    });
    const tok = result.tokens.find((t) => t.tokenKey === 'cb.base_salary');
    expect(tok?.masked).toBe(true);
    expect(tok?.value).toBe('***');
  });

  it('issued snapshot short-circuits (BR-PLT-03)', () => {
    const result = resolveMergeTokens({
      registry: [
        {
          tokenKey: 'contract_number',
          sourcePath: 'contract.contract_code',
          ring: 'contract',
        },
      ],
      keywordMap: { '{{contract_number}}': { source: 'x', ring: 'contract' } },
      valueBag: { contract_number: 'LIVE' },
      issuedMergedFields: { contract_number: 'FROZEN-01' },
      tokenKeys: ['contract_number'],
    });
    expect(result.resolveOrder).toBe('issued');
    expect(result.mergedPreview.contract_number).toBe('FROZEN-01');
    expect(result.tokens[0]?.source).toBe('issued');
  });

  it('VAL-PLT-TOK-04 rejects dual #token# syntax', () => {
    expect(() =>
      resolveMergeTokens({
        registry: [],
        keywordMap: { '#legacy#': { source: 'x', ring: 'public' } },
        tokenKeys: ['legacy'],
      }),
    ).toThrow(/HRM-PLT-SCHEMA-INVALID|#token#/);
  });
});
