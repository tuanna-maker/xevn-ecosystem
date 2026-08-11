import { describe, expect, it } from 'vitest';
import {
  METADATA_DATA_TYPE_OPTIONS_VI,
  resolveMetadataDataTypeDisplayLabel,
} from './metadataDataTypeDisplayLabels';

describe('resolveMetadataDataTypeDisplayLabel (D-FE-U72-SOFT-P2-01)', () => {
  it('maps wire keys to Vietnamese labels (not EN Text/Number/Date)', () => {
    expect(resolveMetadataDataTypeDisplayLabel('text')).toBe('Văn bản');
    expect(resolveMetadataDataTypeDisplayLabel('number')).toBe('Số');
    expect(resolveMetadataDataTypeDisplayLabel('date')).toBe('Ngày');
    expect(resolveMetadataDataTypeDisplayLabel('select')).toBe('Lựa chọn');
    expect(resolveMetadataDataTypeDisplayLabel('phone')).toBe('Điện thoại');
    expect(resolveMetadataDataTypeDisplayLabel('email')).toBe('Email');
    expect(resolveMetadataDataTypeDisplayLabel('boolean')).toBe('Đúng/Sai');
  });

  it('is case-insensitive and never echoes unknown raw keys', () => {
    expect(resolveMetadataDataTypeDisplayLabel('TEXT')).toBe('Văn bản');
    expect(resolveMetadataDataTypeDisplayLabel('unknown_type')).toBe('—');
    expect(resolveMetadataDataTypeDisplayLabel('')).toBe('—');
    expect(resolveMetadataDataTypeDisplayLabel(null)).toBe('—');
    expect(resolveMetadataDataTypeDisplayLabel(undefined)).toBe('—');
  });

  it('options expose VI labels while keeping wire values', () => {
    expect(METADATA_DATA_TYPE_OPTIONS_VI.map((o) => o.value)).toEqual([
      'text',
      'number',
      'date',
      'select',
      'phone',
      'email',
    ]);
    expect(METADATA_DATA_TYPE_OPTIONS_VI.every((o) => !/^(Text|Number|Date|Select|Phone)$/.test(o.label))).toBe(
      true,
    );
    expect(METADATA_DATA_TYPE_OPTIONS_VI.find((o) => o.value === 'text')?.label).toBe('Văn bản');
  });
});
