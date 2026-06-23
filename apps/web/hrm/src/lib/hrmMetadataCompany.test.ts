import { describe, expect, it } from 'vitest';
import {
  HRM_HOLDING_COMPANY_UUID,
  resolveHrmMetadataCompanyUuid,
  serializeMetadataJsonValue,
} from './hrmMetadataCompany';

describe('hrmMetadataCompany', () => {
  it('maps portal rollup main to holding UUID for metadata submit', () => {
    expect(resolveHrmMetadataCompanyUuid('main')).toBe(HRM_HOLDING_COMPANY_UUID);
    expect(resolveHrmMetadataCompanyUuid('holding')).toBe(HRM_HOLDING_COMPANY_UUID);
  });

  it('passes through UUID company_id', () => {
    const uuid = '10000000-0000-4000-8000-000000000002';
    expect(resolveHrmMetadataCompanyUuid(uuid)).toBe(uuid);
  });

  it('serializes metadata JSON once for Nest IsJSON validator', () => {
    expect(serializeMetadataJsonValue({ code: 'QA' })).toBe('{"code":"QA"}');
    expect(serializeMetadataJsonValue('{"code":"QA"}')).toBe('{"code":"QA"}');
    expect(serializeMetadataJsonValue(null)).toBe('null');
  });
});
