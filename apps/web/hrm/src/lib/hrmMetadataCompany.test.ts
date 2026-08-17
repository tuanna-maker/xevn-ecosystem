import { describe, expect, it } from 'vitest';
import {
  HRM_HOLDING_COMPANY_UUID,
  resolveHrmCompanySlugForDisplay,
  resolveHrmLeaveCreateCompanyId,
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

  it('wraps plain text and JSON primitives as object for @IsJSON', () => {
    expect(serializeMetadataJsonValue('Chuyên viên QA')).toBe(
      '{"value":"Chuyên viên QA"}',
    );
    expect(serializeMetadataJsonValue('"scalar-json"')).toBe('{"value":"scalar-json"}');
    expect(serializeMetadataJsonValue(42)).toBe('{"value":42}');
  });
});

describe('D-HRM-LEAVE-REQ-CREATE-FE-01 resolveHrmLeaveCreateCompanyId', () => {
  it('maps main / holding / holding UUID to Settings partition holding', () => {
    expect(resolveHrmLeaveCreateCompanyId('main')).toBe('holding');
    expect(resolveHrmLeaveCreateCompanyId('holding')).toBe('holding');
    expect(resolveHrmLeaveCreateCompanyId(HRM_HOLDING_COMPANY_UUID)).toBe('holding');
  });

  it('maps member pilot UUID to operating slug', () => {
    expect(resolveHrmLeaveCreateCompanyId('10000000-0000-4000-8000-000000000002')).toBe(
      'trsport',
    );
  });

  it('passes known member slug and rejects unknown slug', () => {
    expect(resolveHrmLeaveCreateCompanyId('logistics')).toBe('logistics');
    expect(resolveHrmLeaveCreateCompanyId('unknown-slug')).toBeNull();
  });
});

describe('D-MOB-UUID-BPRIME-FE-01 resolveHrmCompanySlugForDisplay', () => {
  it('maps Plane B′ UUIDs and main to operating slug', () => {
    expect(resolveHrmCompanySlugForDisplay(HRM_HOLDING_COMPANY_UUID)).toBe('holding');
    expect(resolveHrmCompanySlugForDisplay('main')).toBe('holding');
    expect(resolveHrmCompanySlugForDisplay('10000000-0000-4000-8000-000000000005')).toBe(
      'services',
    );
  });

  it('never returns LE UUID for display lookup', () => {
    expect(resolveHrmCompanySlugForDisplay('78b8a663-1111-4111-8111-111111111111')).toBeNull();
  });
});
