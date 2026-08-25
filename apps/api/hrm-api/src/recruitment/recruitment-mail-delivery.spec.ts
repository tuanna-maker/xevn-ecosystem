import {
  assertDeliverableRecipients,
  isDeliverableEmailAddress,
} from './recruitment-mail-delivery';

describe('recruitment-mail-delivery recipients', () => {
  it('rejects fixture / reserved domains that never hit a real inbox', () => {
    expect(isDeliverableEmailAddress('admin1@dev.local')).toBe(false);
    expect(isDeliverableEmailAddress('x@localhost')).toBe(false);
    expect(isDeliverableEmailAddress('a@foo.test')).toBe(false);
    expect(isDeliverableEmailAddress('a@foo.example')).toBe(false);
    expect(isDeliverableEmailAddress('not-an-email')).toBe(false);
  });

  it('accepts real mailbox domains', () => {
    expect(isDeliverableEmailAddress('thichlammau2025@gmail.com')).toBe(true);
    expect(isDeliverableEmailAddress('namnv@unicomhub.com')).toBe(true);
    expect(isDeliverableEmailAddress('pv@xe.vn')).toBe(true);
    expect(isDeliverableEmailAddress('ops@company.dev')).toBe(true);
  });

  it('assertDeliverableRecipients throws with clear VI message for .local', () => {
    expect(() =>
      assertDeliverableRecipients(['admin1@dev.local'], ['pv@xe.vn']),
    ).toThrow(/dev\.local|inbox thật/i);
  });
});
