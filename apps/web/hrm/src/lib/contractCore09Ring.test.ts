/**
 * Unit — PO-HRM-MVP-GD1-CORE-09-CLUSTER-FE-01 · contractCore09Ring
 */
import { describe, expect, it } from 'vitest';
import {
  CORE_09_HONESTY_FOOTER,
  CORE_09_ZERO_TPL_CTA,
  CORE_CTR_09_PATH_ASSERT,
  CORE_CTR_STATUS_LABEL_VI,
  assertCore09PrintableHonesty,
  contractStatusLabelFallback,
  core09HonestyBannerText,
  core09HonestyFooterLines,
  isNestCoreCtrPath,
  isPhysicalContractsInsurancePath,
  isPreviewMandatoryBlocked,
  omitBlankContractTemplateFields,
  resolveContractStatusLabelVi,
} from '@/lib/contractCore09Ring';
import { CONTRACTS_PRINTABLE_READY } from '@/lib/contractLegalPrintConstants';

describe('contractCore09Ring — R-CORE-09-DISP-01 FE-derive', () => {
  it('maps active/expired/terminated per API-01', () => {
    expect(contractStatusLabelFallback('active')).toBe(CORE_CTR_STATUS_LABEL_VI.active);
    expect(contractStatusLabelFallback('expired')).toBe(CORE_CTR_STATUS_LABEL_VI.expired);
    expect(contractStatusLabelFallback('terminated')).toBe(CORE_CTR_STATUS_LABEL_VI.terminated);
    expect(CORE_CTR_STATUS_LABEL_VI.active).toBe('Hiệu lực');
    expect(CORE_CTR_STATUS_LABEL_VI.expired).toBe('Hết hạn');
    expect(CORE_CTR_STATUS_LABEL_VI.terminated).toBe('Chấm dứt');
  });

  it('prefers BE statusLabelVi over FE fallback', () => {
    expect(resolveContractStatusLabelVi('active', 'Đang hiệu lực (BE)')).toBe(
      'Đang hiệu lực (BE)',
    );
    expect(resolveContractStatusLabelVi('active', null)).toBe('Hiệu lực');
    expect(resolveContractStatusLabelVi('terminated', '  ')).toBe('Chấm dứt');
  });
});

describe('contractCore09Ring — path + ZERO-TPL + mandatory + honesty', () => {
  it('locks physical contracts-insurance · DENY Nest /core CTR', () => {
    expect(CORE_CTR_09_PATH_ASSERT.preview).toContain('/contracts-insurance/');
    expect(CORE_CTR_09_PATH_ASSERT.nestCoreDenied).toBe('/api/hrm/core/');
    expect(isPhysicalContractsInsurancePath('/api/hrm/contracts-insurance/contracts')).toBe(
      true,
    );
    expect(isNestCoreCtrPath('/api/hrm/core/contracts')).toBe(true);
    expect(isNestCoreCtrPath('/api/hrm/contracts-insurance/contracts/x/preview')).toBe(false);
  });

  it('ZERO-TPL CTA constants + omit blank template (AC-CTR-XEVN-08)', () => {
    expect(CORE_09_ZERO_TPL_CTA.code).toBe('HRM-CTR-TPL-NONE');
    expect(CORE_09_ZERO_TPL_CTA.settingsHref).toContain('/hr/settings');
    expect(omitBlankContractTemplateFields({ template_id: '', template_code: '  ' })).toEqual(
      {},
    );
    expect(
      omitBlankContractTemplateFields({
        template_id: ' tpl-1 ',
        template_code: 'xe_it',
        pack_code: 'IT_OFFICE',
      }),
    ).toEqual({
      template_id: 'tpl-1',
      template_code: 'XE_IT',
      pack_code: 'IT_OFFICE',
    });
  });

  it('mandatory block when can_issue=false or missing lists', () => {
    expect(isPreviewMandatoryBlocked({ can_issue: false })).toBe(true);
    expect(
      isPreviewMandatoryBlocked({
        can_issue: true,
        missing_fields: ['work_location'],
      }),
    ).toBe(true);
    expect(
      isPreviewMandatoryBlocked({
        can_issue: true,
        missing_fields: [],
        missing_clauses: [],
      }),
    ).toBe(false);
  });

  it('honesty printable false · footer cites 09a–d≠DONE · CORE-07 RETAIN', () => {
    expect(CONTRACTS_PRINTABLE_READY).toBe(false);
    expect(assertCore09PrintableHonesty()).toBe(true);
    const lines = core09HonestyFooterLines();
    expect(lines).toContain(CORE_09_HONESTY_FOOTER.peersAddNeDone);
    expect(lines).toContain(CORE_09_HONESTY_FOOTER.registryNeDone);
    expect(lines.some((l) => l.includes('GATE 409'))).toBe(true);
    expect(core09HonestyBannerText()).toContain('09a–d ADD ≠ CORE-09 DONE');
    expect(core09HonestyBannerText()).toContain('CORE-07 GATE/ACT RETAIN');
  });
});
