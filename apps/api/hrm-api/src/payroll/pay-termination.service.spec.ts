import { buildSoftTerminationCaseId } from './pay-termination.service';

describe('PayTerminationService helpers', () => {
  it('buildSoftTerminationCaseId is stable (O3)', () => {
    const a = buildSoftTerminationCaseId({
      companyId: 'holding',
      employeeId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      terminationDate: '2026-04-15',
      decisionId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    });
    const b = buildSoftTerminationCaseId({
      companyId: 'holding',
      employeeId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      terminationDate: '2026-04-15',
      decisionId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    });
    expect(a).toBe(b);
    expect(a).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });
});
