/**
 * @CODE-MEMORY
 * Screen:     unit — contract end_date policy (G-CI-01)
 * UC:         FR-HRM-CI-01
 * WorkItem:   BE-HRM-G-CI-01
 * Purpose:    Cover open-ended detection + assert branches without DB.
 * LastVerified: 2026-07-22
 */
import { ApiException } from '../common/api.exception';
import {
  assertContractEndDateForCreate,
  contractTypeRequiresEndDate,
  isOpenEndedContractType,
} from './contract-end-date-policy';

describe('contract-end-date-policy (G-CI-01)', () => {
  it.each([
    'indefinite',
    'permanent',
    'HDLD_KTH',
    'Hợp đồng không thời hạn',
    'Hợp đồng lao động không xác định thời hạn',
  ])('treats %s as open-ended (end_date optional)', (type) => {
    expect(isOpenEndedContractType(type)).toBe(true);
    expect(contractTypeRequiresEndDate(type)).toBe(false);
  });

  it.each(['fixed_term', 'HDLD_XDHN_12', 'HĐ thử việc', 'Hợp đồng 1 năm'])(
    'requires end_date for %s',
    (type) => {
      expect(contractTypeRequiresEndDate(type)).toBe(true);
    },
  );

  it('assert: open-ended without end_date passes', () => {
    expect(() =>
      assertContractEndDateForCreate({
        contractType: 'indefinite',
        startDate: '2026-01-01',
      }),
    ).not.toThrow();
  });

  it('assert: fixed_term without end_date → HRM-CON-002', () => {
    try {
      assertContractEndDateForCreate({
        contractType: 'fixed_term',
        startDate: '2026-01-01',
      });
      fail('expected HRM-CON-002');
    } catch (err) {
      expect(err).toMatchObject<ApiException>({ code: 'HRM-CON-002' });
    }
  });

  it('assert: range violation → HRM-CON-001 even for open-ended', () => {
    try {
      assertContractEndDateForCreate({
        contractType: 'permanent',
        startDate: '2026-06-01',
        endDate: '2026-05-01',
      });
      fail('expected HRM-CON-001');
    } catch (err) {
      expect(err).toMatchObject<ApiException>({ code: 'HRM-CON-001' });
    }
  });
});
