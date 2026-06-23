import { describe, expect, it } from 'vitest';
import {
  MISSING_EMPLOYEE_META_MESSAGE,
  OFFLINE_CHECKIN_QUEUED_MESSAGE,
  userFacingScopeError,
} from '../scopeError';

describe('scopeError (MOB-UX-15b)', () => {
  it('returns Vietnamese company scope without UUID jargon', () => {
    const msg = userFacingScopeError('company');
    expect(msg).toMatch(/phạm vi công ty/i);
    expect(msg).not.toMatch(/UUID/i);
  });

  it('returns combined company+employee message', () => {
    const msg = userFacingScopeError('companyAndEmployee');
    expect(msg).not.toMatch(/UUID|employeeId/i);
  });

  it('offline check-in message has no MOB-* codes', () => {
    expect(OFFLINE_CHECKIN_QUEUED_MESSAGE).not.toMatch(/MOB-/);
    expect(OFFLINE_CHECKIN_QUEUED_MESSAGE).toMatch(/mạng/i);
  });

  it('employee meta message has no API path jargon', () => {
    expect(MISSING_EMPLOYEE_META_MESSAGE).not.toMatch(/GET \/employees|UUID/i);
  });
});
