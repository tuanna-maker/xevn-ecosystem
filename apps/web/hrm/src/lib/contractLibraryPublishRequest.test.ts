import { describe, expect, it } from 'vitest';
import {
  buildContractLibraryApplyRequest,
  buildContractLibraryPublishRequest,
  buildContractLibraryPullRequest,
  contractLibraryOriginBadgeText,
  contractLibraryOriginDetailText,
  contractLibraryOriginLabel,
  isContractLibraryHoldingPartition,
} from './contractLibraryPublishRequest';

describe('contractLibraryPublishRequest (PO-HRM-CONTRACT-LEGAL-PRINT-FE-03)', () => {
  it('publish: company_id query only — no body company_id', () => {
    const { companyIdQuery, body } = buildContractLibraryPublishRequest({
      company_id: 'main',
      label_vi: '  Gói pháp lý Q3  ',
    });
    expect(companyIdQuery).toBe('main');
    expect(body).toEqual({ label_vi: 'Gói pháp lý Q3' });
    expect(Object.prototype.hasOwnProperty.call(body, 'company_id')).toBe(false);
    expect(JSON.stringify(body)).not.toContain('company_id');
  });

  it('publish: omits empty label_vi', () => {
    const { body } = buildContractLibraryPublishRequest({
      company_id: 'holding',
      label_vi: '   ',
    });
    expect(body).toEqual({});
    expect('label_vi' in body).toBe(false);
  });

  it('pull: query-only company_id + optional version/force', () => {
    const { companyIdQuery, body } = buildContractLibraryPullRequest({
      company_id: 'trsport',
      publish_version: 3,
      force: true,
    });
    expect(companyIdQuery).toBe('trsport');
    expect(body).toEqual({ publish_version: 3, force: true });
    expect('company_id' in body).toBe(false);
  });

  it('pull: omits force=false and invalid version', () => {
    const { body } = buildContractLibraryPullRequest({
      company_id: 'logistics',
      publish_version: 0,
      force: false,
    });
    expect(body).toEqual({});
  });

  it('apply: query-only company_id', () => {
    const { companyIdQuery, body } = buildContractLibraryApplyRequest({
      company_id: 'trsport',
      publish_version: 2,
    });
    expect(companyIdQuery).toBe('trsport');
    expect(body).toEqual({ publish_version: 2 });
    expect(JSON.stringify(body)).not.toContain('company_id');
  });

  it('holding partition detection for Publish vs Pull CTA', () => {
    expect(isContractLibraryHoldingPartition('main')).toBe(true);
    expect(isContractLibraryHoldingPartition('holding')).toBe(true);
    expect(isContractLibraryHoldingPartition('trsport')).toBe(false);
    expect(isContractLibraryHoldingPartition('logistics')).toBe(false);
  });

  it('origin badge labels', () => {
    expect(contractLibraryOriginLabel('group')).toBe('Tập đoàn');
    expect(contractLibraryOriginLabel('member_override')).toBe('Ghi đè TV');
    expect(contractLibraryOriginLabel('member')).toBe('Nội bộ');
    expect(contractLibraryOriginBadgeText({ origin: 'group', origin_publish_version: 4 })).toBe(
      'Tập đoàn · v4',
    );
    expect(contractLibraryOriginBadgeText({ origin: 'member' })).toBe('Nội bộ');
  });

  it('origin detail includes company_id + lineage_code (display-ready)', () => {
    expect(
      contractLibraryOriginDetailText({
        origin: 'group',
        origin_publish_version: 2,
        origin_company_id: 'holding',
        lineage_code: 'CL-LEGAL-01',
      }),
    ).toBe('Tập đoàn · v2 · holding · CL-LEGAL-01');
    expect(
      contractLibraryOriginDetailText({
        origin: 'member',
        origin_company_id: null,
        lineage_code: '  ',
      }),
    ).toBe('Nội bộ');
  });
});
