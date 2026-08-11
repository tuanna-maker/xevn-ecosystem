import { describe, expect, it } from 'vitest';
import {
  HDSD_SHAREHOLDER_TEST_IDS,
  hdsdShareholderSaveTestId,
} from './hdsdMutateTestIds';

describe('hdsdMutateTestIds portal (D-HDSD-MUTATE-FE-02)', () => {
  it('exposes shareholder add-row hook', () => {
    expect(HDSD_SHAREHOLDER_TEST_IDS.addRow).toBe('hdsd-shareholder-add-row');
    expect(hdsdShareholderSaveTestId('row-a')).toBe('hdsd-shareholder-save-row-a');
  });
});
