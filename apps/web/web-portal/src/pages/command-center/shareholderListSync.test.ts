import { describe, expect, it } from 'vitest';
import { mapShareholderApiRowToUiRow, mapShareholderApiRowsToUiRows } from './shareholderListSync';

describe('shareholderListSync (UF-XBOS-05 · D-HDSD-MUTATE-SHR-F5-01)', () => {
  it('maps API snake_case to UI holderName', () => {
    const ui = mapShareholderApiRowToUiRow({
      id: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
      holder_name: 'QA HDSDNGT1N',
      identity_code: '079188001235',
      ratio_percent: 10,
      contributed_value: 1_000_000,
    });
    expect(ui.holderName).toBe('QA HDSDNGT1N');
    expect(ui.submitted).toBe(true);
    expect(ui.ratioPercent).toBe(10);
    expect(ui.contributedValue).toBe(1_000_000);
  });

  it('maps empty list without mock fallback (U65 zero-seed)', () => {
    expect(mapShareholderApiRowsToUiRows([])).toEqual([]);
  });

  it('preserves persisted UUID id for row key stability after POST', () => {
    const id = 'bbbbbbbb-bbbb-4ccc-8ddd-eeeeeeeeeeee';
    const ui = mapShareholderApiRowToUiRow({ id, holder_name: 'Co dong moi' });
    expect(ui.id).toBe(id);
  });
});
