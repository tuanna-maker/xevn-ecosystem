import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SALARY_COMPONENT_FORM_VALUES,
  parseSalaryComponentForm,
  type SalaryComponentFormMessages,
} from '../salaryComponentFormSchema';

const messages: SalaryComponentFormMessages = {
  codeRequired: 'codeRequired',
  codeMinLength: 'codeMinLength',
  codeFormat: 'codeFormat',
  codeExists: 'codeExists',
  nameRequired: 'nameRequired',
  nameMinLength: 'nameMinLength',
  nameMaxLength: 'nameMaxLength',
  unitRequired: 'unitRequired',
  typeRequired: 'typeRequired',
};

const valid = {
  ...DEFAULT_SALARY_COMPONENT_FORM_VALUES,
  code: 'LUONG_CO_BAN',
  name: 'Lương cơ bản',
  appliedUnits: ['Văn phòng Hà Nội'],
  componentType: 'salary',
};

describe('salaryComponentFormSchema (D-UX-D5-ZOD-TAX-01)', () => {
  it('accepts a valid salary component payload', () => {
    const result = parseSalaryComponentForm(valid, messages);
    expect(result.success).toBe(true);
  });

  it('rejects empty / short / invalid code', () => {
    expect(parseSalaryComponentForm({ ...valid, code: '' }, messages).success).toBe(false);
    expect(
      parseSalaryComponentForm({ ...valid, code: 'AB' }, messages).error?.flatten().fieldErrors
        .code?.[0],
    ).toBe('codeMinLength');
    expect(
      parseSalaryComponentForm({ ...valid, code: 'luong' }, messages).error?.flatten().fieldErrors
        .code?.[0],
    ).toBe('codeFormat');
  });

  it('rejects duplicate code via existingCodes', () => {
    const result = parseSalaryComponentForm(valid, messages, ['LUONG_CO_BAN']);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.code?.[0]).toBe('codeExists');
    }
  });

  it('rejects name / units / type required rules', () => {
    expect(
      parseSalaryComponentForm({ ...valid, name: '' }, messages).error?.flatten().fieldErrors
        .name?.[0],
    ).toBe('nameRequired');
    expect(
      parseSalaryComponentForm({ ...valid, name: 'ab' }, messages).error?.flatten().fieldErrors
        .name?.[0],
    ).toBe('nameMinLength');
    expect(
      parseSalaryComponentForm({ ...valid, name: 'x'.repeat(101) }, messages).error?.flatten()
        .fieldErrors.name?.[0],
    ).toBe('nameMaxLength');
    expect(
      parseSalaryComponentForm({ ...valid, appliedUnits: [] }, messages).error?.flatten()
        .fieldErrors.appliedUnits?.[0],
    ).toBe('unitRequired');
    expect(
      parseSalaryComponentForm({ ...valid, componentType: '' }, messages).error?.flatten()
        .fieldErrors.componentType?.[0],
    ).toBe('typeRequired');
  });

  it('rejects componentType outside allowed pay_types codes (E2)', () => {
    const result = parseSalaryComponentForm(
      { ...valid, componentType: 'invent' },
      { ...messages, typeNotInCatalog: 'typeNotInCatalog' },
      [],
      ['salary', 'allowance'],
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.componentType?.[0]).toBe('typeNotInCatalog');
    }
  });

  it('accepts componentType when in allowed pay_types codes', () => {
    expect(
      parseSalaryComponentForm(
        { ...valid, componentType: 'salary' },
        messages,
        [],
        ['salary', 'allowance'],
      ).success,
    ).toBe(true);
  });

  it('rejects code outside Nest/catalog set when getAllowedCatalogCodes non-empty (consumer invent-ban helper)', () => {
    const result = parseSalaryComponentForm(
      { ...valid, code: 'INVENT_TX' },
      { ...messages, codeNotInCatalog: 'codeNotInCatalog' },
      [],
      [],
      ['LUONG_CB', 'PC_AN'],
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.code?.[0]).toBe('codeNotInCatalog');
    }
  });

  it('accepts code when in allowed catalog set (consumer helper)', () => {
    expect(
      parseSalaryComponentForm(
        { ...valid, code: 'LUONG_CB' },
        messages,
        [],
        [],
        ['LUONG_CB', 'PC_AN'],
      ).success,
    ).toBe(true);
  });

  it('admin open N+1 — empty getAllowedCatalogCodes allows new slug (L-PAY-AC-01 / AC-PLT-PAY-01c)', () => {
    expect(parseSalaryComponentForm(valid, messages, [], [], []).success).toBe(true);
    expect(
      parseSalaryComponentForm({ ...valid, code: 'CUSTOM_NPLUS1' }, messages, [], [], []).success,
    ).toBe(true);
  });

  it('allows free-text code format when catalog empty (backward compat)', () => {
    expect(parseSalaryComponentForm(valid, messages, [], [], []).success).toBe(true);
    expect(
      parseSalaryComponentForm({ ...valid, code: 'luong' }, messages, [], [], []).success,
    ).toBe(false);
  });

  it('trims code and name before length checks', () => {
    const result = parseSalaryComponentForm(
      { ...valid, code: '  LUONG_CO_BAN  ', name: '  Lương cơ bản  ' },
      messages,
    );
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.code).toBe('LUONG_CO_BAN');
      expect(result.data.name).toBe('Lương cơ bản');
    }
  });
});
