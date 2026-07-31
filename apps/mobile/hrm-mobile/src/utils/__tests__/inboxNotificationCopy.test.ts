import { describe, expect, it } from 'vitest';
import { mapInboxToHomeTask } from '../dashboardHub';
import {
  formatInboxRelativeTime,
  formatInboxTimeLabel,
  KNOWN_INBOX_EVENT_TYPES,
  resolveInboxNotificationCopy,
  unwrapInboxPayload,
  type InboxNotificationRow,
} from '../inboxNotificationCopy';

const BASE_NOW = new Date('2026-06-09T12:00:00+07:00');

function sampleRow(eventType: string, payload: unknown = {}, read = false): InboxNotificationRow {
  return {
    id: `inbox-${eventType}`,
    event_type: eventType,
    payload,
    read_at: read ? '2026-06-09T08:00:00Z' : null,
    created_at: '2026-06-08T19:39:29.000Z',
  };
}

const LEAVE_PAYLOAD = {
  type: 'leave_request.created',
  request: {
    id: 'lr-1',
    employee_name: 'Huỳnh Văn An',
    leave_type: 'LVT_01',
    start_date: '2026-06-10',
    end_date: '2026-06-12',
  },
};

const ATT_PAYLOAD = {
  type: 'attendance_update_request.created',
  request: {
    id: 'aur-1',
    employee_name: 'Trần B',
    update_type: 'Quên check-out',
    attendance_date: '2026-06-08',
  },
};

describe('inboxNotificationCopy — MOB-UX-15a', () => {
  it('covers 100% KNOWN_INBOX_EVENT_TYPES with Vietnamese copy (no raw event keys)', () => {
    for (const eventType of KNOWN_INBOX_EVENT_TYPES) {
      const payload =
        eventType.startsWith('leave_request')
          ? LEAVE_PAYLOAD
          : eventType.startsWith('attendance_update_request')
            ? ATT_PAYLOAD
            : eventType === 'payslip.published'
              ? { period_label: 'Tháng 5/2026', net_amount: '15.000.000' }
              : { message: 'Nội dung thông báo công ty' };

      const mgr = resolveInboxNotificationCopy(sampleRow(eventType, payload), true, BASE_NOW);
      const emp = resolveInboxNotificationCopy(sampleRow(eventType, payload), false, BASE_NOW);

      for (const copy of [mgr, emp]) {
        expect(copy.title).not.toMatch(/leave_request|attendance_update_request|UC-HRM/);
        expect(copy.title.length).toBeGreaterThan(2);
        expect(copy.subtitle).not.toMatch(/leave_request\.|attendance_update_request\./);
        expect(copy.readLabel).toBe('Chưa đọc');
        expect(copy.readTone).toBe('info');
      }

      const readCopy = resolveInboxNotificationCopy(sampleRow(eventType, payload, true), false, BASE_NOW);
      expect(readCopy.readLabel).toBe('Đã đọc');
      expect(readCopy.readTone).toBe('neutral');
    }
  });

  it('leave_request.created uses employee name + localized date range in subtitle', () => {
    const copy = resolveInboxNotificationCopy(sampleRow('leave_request.created', LEAVE_PAYLOAD), true, BASE_NOW);
    expect(copy.title).toContain('Huỳnh Văn An');
    expect(copy.subtitle).toContain('10/06/2026');
    expect(copy.subtitle).toContain('12/06/2026');
    expect(copy.title).not.toContain('leave_request.created');
  });

  it('attendance_update_request.* includes employee + update type', () => {
    for (const eventType of [
      'attendance_update_request.created',
      'attendance_update_request.approved',
      'attendance_update_request.rejected',
    ] as const) {
      const copy = resolveInboxNotificationCopy(sampleRow(eventType, ATT_PAYLOAD), true, BASE_NOW);
      expect(copy.subtitle).toContain('Trần B');
      expect(copy.subtitle).toContain('Quên check-out');
      expect(copy.title).not.toContain('attendance_update_request');
    }
  });

  it('localizes check_in_out wire token in attendance subtitle (R-15a-COPY-01)', () => {
    const payload = {
      type: 'attendance_update_request.created',
      request: {
        id: 'aur-2',
        employee_name: 'Huỳnh Văn An',
        update_type: 'check_in_out',
        attendance_date: '2026-06-08',
      },
    };
    const copy = resolveInboxNotificationCopy(sampleRow('attendance_update_request.created', payload), true, BASE_NOW);
    expect(copy.subtitle).toContain('Huỳnh Văn An');
    expect(copy.subtitle).toContain('Giờ vào và ra');
    expect(copy.subtitle).not.toContain('check_in_out');
  });

  it('formatInboxTimeLabel uses dd/MM/yyyy HH:mm not raw ISO', () => {
    const label = formatInboxTimeLabel('2026-06-08T19:39:29.000Z', BASE_NOW);
    expect(label).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    expect(label).not.toContain('T19:39:29');
  });

  it('formatInboxRelativeTime returns Vietnamese relative phrases', () => {
    expect(formatInboxRelativeTime('2026-06-09T11:30:00+07:00', BASE_NOW)).toBe('30 phút trước');
    expect(formatInboxRelativeTime('2026-06-09T10:00:00+07:00', BASE_NOW)).toBe('2 giờ trước');
  });

  it('unwrapInboxPayload reads envelope.request fields', () => {
    const inner = unwrapInboxPayload(LEAVE_PAYLOAD);
    expect(inner.employee_name).toBe('Huỳnh Văn An');
    expect(inner.id).toBe('lr-1');
  });

  it('mapInboxToHomeTask navigates from envelope leave id', () => {
    const row = sampleRow('leave_request.approved', LEAVE_PAYLOAD);
    const task = mapInboxToHomeTask(row, false);
    expect(task?.navigate).toEqual({ target: 'LeaveRequestDetail', id: 'lr-1' });
  });

  it('mapInboxToHomeTask navigates attendance approved to update detail', () => {
    const row = sampleRow('attendance_update_request.approved', ATT_PAYLOAD);
    const task = mapInboxToHomeTask(row, false);
    expect(task?.navigate).toEqual({ target: 'UpdateRequestDetail', id: 'aur-1' });
  });

  it('mapInboxToHomeTask navigates payslip.published to PayslipList', () => {
    const row = sampleRow('payslip.published', { period_label: 'T5/2026' });
    const task = mapInboxToHomeTask(row, false);
    expect(task?.navigate).toEqual({ target: 'PayslipList' });
  });

  it('payslip.published subtitle formats raw net_amount with vi-VN currency (D-UX-VI-FORMAT-MOBILE-01)', () => {
    const copy = resolveInboxNotificationCopy(
      sampleRow('payslip.published', { period_label: 'Tháng 5/2026', net_amount: 15_000_000 }),
      false,
      BASE_NOW,
    );
    expect(copy.subtitle).toContain('Tháng 5/2026');
    expect(copy.subtitle).toMatch(/15/);
    expect(copy.subtitle).toMatch(/₫|VND|đ/i);
    expect(copy.subtitle).not.toMatch(/15000000(?!\.)/);
  });
});
