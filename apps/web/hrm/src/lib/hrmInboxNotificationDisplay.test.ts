import { describe, expect, it } from 'vitest';
import type { HrmInboxNotification } from '@/integrations/hrmApi';
import {
  canMarkHrmInboxPersonalRead,
  isHrmInboxUnread,
} from './hrmInboxNotificationDisplay';

function row(partial: Partial<HrmInboxNotification>): HrmInboxNotification {
  return {
    id: 'n1',
    company_id: '10000000-0000-4000-8000-000000000002',
    event_type: 'leave_request.created',
    payload: {},
    recipient_employee_id: 'emp-1',
    read_at: null,
    created_at: '2026-08-04T00:00:00.000Z',
    ...partial,
  };
}

describe('canMarkHrmInboxPersonalRead — AC-NT01-MARK-01', () => {
  it('allows unread personal recipient', () => {
    expect(canMarkHrmInboxPersonalRead(row({ recipient_employee_id: 'emp-1', read_at: null }))).toBe(
      true,
    );
  });

  it('hides broadcast NULL recipient', () => {
    expect(canMarkHrmInboxPersonalRead(row({ recipient_employee_id: null }))).toBe(false);
  });

  it('hides already-read personal row', () => {
    expect(
      canMarkHrmInboxPersonalRead(
        row({ recipient_employee_id: 'emp-1', read_at: '2026-08-04T01:00:00.000Z' }),
      ),
    ).toBe(false);
    expect(isHrmInboxUnread(row({ read_at: '2026-08-04T01:00:00.000Z' }))).toBe(false);
  });
});
