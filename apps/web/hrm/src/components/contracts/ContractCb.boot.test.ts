/**
 * Unit — D-FE-CTR-CB-BOOT-01 · bootstrap C&B helpers
 * SA-CTR-INSURANCE-SALARY-SOURCE-01 §3.3 · §4 · §5 · sponsor §10b (2 ô riêng)
 */
import { describe, expect, it } from 'vitest';
import { ApiClientError } from '@/lib/apiError';
import {
  buildContractCbBootstrapPayload,
  isContractCbBootstrapState,
  mapContractCbBootstrapError,
  resolveContractCbBootstrapEffectiveFrom,
  validateContractCbBootstrapDraft,
  type ContractCreateContextSnapshot,
} from '@/lib/contractCreateApi';

function mkCtx(
  comp: Partial<ContractCreateContextSnapshot['compensation_snapshot']>,
  cb_masked = false,
): ContractCreateContextSnapshot {
  return {
    employee_party_b: {
      full_name: 'NV mới',
      id_number: '—',
      phone: '—',
      dob_display: '—',
      job_title: '—',
    },
    compensation_snapshot: {
      base_salary_vnd: null,
      insurance_salary_vnd: null,
      salary_ratio_percent: null,
      allowances: [],
      ...comp,
    },
    employer_party_a: { legal_name: '—', unit_label: 'main' },
    suggested_signatory: { signer_name: '', signer_position: '' },
    source: 'api',
    cb_masked,
  };
}

describe('resolveContractCbBootstrapEffectiveFrom (SA §4 EF-BOOT)', () => {
  it('#1 ưu tiên ngày hiệu lực HĐ', () => {
    const eff = new Date(2026, 7, 20);
    const signed = new Date(2026, 7, 1);
    expect(resolveContractCbBootstrapEffectiveFrom(eff, signed)).toBe('2026-08-20');
  });

  it('#2 fallback ngày ký khi thiếu hiệu lực (không lấy min)', () => {
    const signed = new Date(2026, 7, 5);
    expect(resolveContractCbBootstrapEffectiveFrom(undefined, signed)).toBe('2026-08-05');
  });

  it('#3 fallback hôm nay khi thiếu cả hai', () => {
    const today = resolveContractCbBootstrapEffectiveFrom(undefined, undefined);
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('validateContractCbBootstrapDraft (BR-CTR-CB-BOOT-03)', () => {
  it('chặn khi ô trống / 0', () => {
    expect(validateContractCbBootstrapDraft({ base_salary_vnd: 0, insurance_salary_vnd: 0 }).ok).toBe(false);
  });

  it('chặn khi chỉ có lương cơ bản, thiếu lương BH (2 ô riêng)', () => {
    const r = validateContractCbBootstrapDraft({ base_salary_vnd: 12_000_000, insurance_salary_vnd: 0 });
    expect(r.ok).toBe(false);
  });

  it('chặn khi số âm', () => {
    expect(
      validateContractCbBootstrapDraft({ base_salary_vnd: -1, insurance_salary_vnd: 5_000_000 }).ok,
    ).toBe(false);
  });

  it('nhận khi cả hai > 0 (được phép khác nhau — không auto-copy)', () => {
    const r = validateContractCbBootstrapDraft({ base_salary_vnd: 12_000_000, insurance_salary_vnd: 10_000_000 });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.amounts.base_salary_vnd).toBe(12_000_000);
      expect(r.amounts.insurance_salary_vnd).toBe(10_000_000);
    }
  });
});

describe('buildContractCbBootstrapPayload (SA §3.3 canonical)', () => {
  it('2 lines base + si_base (allowance shape), change_reason + VND', () => {
    const body = buildContractCbBootstrapPayload({
      companyId: 'main',
      employeeId: 'emp-1',
      effectiveFrom: '2026-08-20',
      amounts: { base_salary_vnd: 12_000_000, insurance_salary_vnd: 10_000_000 },
      contractId: null,
    });
    expect(body.change_reason).toBe('ctr_workspace_bootstrap');
    expect(body.currency).toBe('VND');
    expect(body.effective_from).toBe('2026-08-20');
    expect(body.employee_id).toBe('emp-1');
    expect(body.lines).toHaveLength(2);
    const base = body.lines.find((l) => l.line_type === 'base');
    const si = body.lines.find((l) => l.line_type === 'allowance');
    expect(base?.component_code).toBe('base');
    expect(base?.amount).toBe(12_000_000);
    expect(si?.allowance_code).toBe('si_base');
    expect(si?.component_code).toBe('si_base');
    expect(si?.amount).toBe(10_000_000);
    expect('contract_id' in body).toBe(false);
  });

  it('soft-link contract_id + link_to_contract khi HĐ đã có id', () => {
    const body = buildContractCbBootstrapPayload({
      companyId: 'main',
      employeeId: 'emp-1',
      effectiveFrom: '2026-08-20',
      amounts: { base_salary_vnd: 12_000_000, insurance_salary_vnd: 10_000_000 },
      contractId: 'ctr-9',
    });
    expect((body as { contract_id?: string }).contract_id).toBe('ctr-9');
    expect((body as { link_to_contract?: boolean }).link_to_contract).toBe(true);
  });
});

describe('isContractCbBootstrapState (BR-CTR-CB-BOOT-01/05)', () => {
  it('NV + snapshot rỗng + không masked → true', () => {
    expect(
      isContractCbBootstrapState({ subjectType: 'employee', employeeId: 'emp-1', snapshot: mkCtx({}) }),
    ).toBe(true);
  });

  it('đã có gói (RO) → false', () => {
    expect(
      isContractCbBootstrapState({
        subjectType: 'employee',
        employeeId: 'emp-1',
        snapshot: mkCtx({ base_salary_vnd: 12_000_000, insurance_salary_vnd: 10_000_000 }),
      }),
    ).toBe(false);
  });

  it('cb_masked → false', () => {
    expect(
      isContractCbBootstrapState({ subjectType: 'employee', employeeId: 'emp-1', snapshot: mkCtx({}, true) }),
    ).toBe(false);
  });

  it('UV / candidate → false (không bootstrap)', () => {
    expect(
      isContractCbBootstrapState({ subjectType: 'candidate', employeeId: '', snapshot: mkCtx({}) }),
    ).toBe(false);
  });

  it('thiếu employee_id → false', () => {
    expect(
      isContractCbBootstrapState({ subjectType: 'employee', employeeId: '', snapshot: mkCtx({}) }),
    ).toBe(false);
  });

  it('snapshot chưa tải (null) → false', () => {
    expect(
      isContractCbBootstrapState({ subjectType: 'employee', employeeId: 'emp-1', snapshot: null }),
    ).toBe(false);
  });
});

describe('mapContractCbBootstrapError (SA §5)', () => {
  it('overlap 409 → treatAsExisting (gói đã có)', () => {
    const o1 = mapContractCbBootstrapError(new ApiClientError({ status: 409, code: 'HRM-COMP-409-OVERLAP' }));
    expect(o1.treatAsExisting).toBe(true);
    const o2 = mapContractCbBootstrapError(new ApiClientError({ status: 409, code: 'HRM-CORE-CB-OVERLAP-409' }));
    expect(o2.treatAsExisting).toBe(true);
  });

  it('AuthZ 403 → chặn (treatAsExisting false)', () => {
    const o = mapContractCbBootstrapError(
      new ApiClientError({ status: 403, code: 'HRM-CORE-CB-AUTHZ-403' }),
    );
    expect(o.treatAsExisting).toBe(false);
    expect(o.message).toContain('quyền');
  });

  it('VAL 400 → chặn', () => {
    const o = mapContractCbBootstrapError(
      new ApiClientError({ status: 400, code: 'HRM-CORE-CB-VAL-400' }),
    );
    expect(o.treatAsExisting).toBe(false);
    expect(o.message.length).toBeGreaterThan(0);
  });
});
