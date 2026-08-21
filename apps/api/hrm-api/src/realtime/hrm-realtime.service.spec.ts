import type { Server } from 'socket.io';
import { HrmRealtimeService } from './hrm-realtime.service';

describe('HrmRealtimeService', () => {
  const sampleRequest = {
    id: 'req-1',
    company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
    employee_id: 'f76f23f7-3683-4120-81b7-5126ee997b8e',
    employee_code: 'E001',
    employee_name: 'Test',
    status: 'pending',
    attendance_date: '2026-04-22',
    update_type: 'check_in',
    created_at: '2026-04-22T00:00:00.000Z',
    updated_at: '2026-04-22T00:00:00.000Z',
  };

  it('publishes created only to company room', () => {
    const emit = jest.fn();
    const to = jest.fn().mockReturnValue({ emit });
    const server = { to } as unknown as Server;
    const svc = new HrmRealtimeService();
    svc.attachServer(server);
    svc.publishAttendanceEvent({
      type: 'attendance_update_request.created',
      at: '2026-04-22T00:00:00.000Z',
      request: sampleRequest,
    });
    expect(to).toHaveBeenCalledWith(
      'company:78b8a663-f5e5-4f4d-a020-b8f950ec2037',
    );
    expect(emit).toHaveBeenCalledTimes(1);
    expect(emit.mock.calls[0][0]).toBe('hrm:event');
    expect(emit.mock.calls[0][1]).toMatchObject({
      type: 'attendance_update_request.created',
      request: sampleRequest,
    });
  });

  it('publishes decided to company and employee rooms', () => {
    const emit = jest.fn();
    const to = jest.fn().mockReturnValue({ emit });
    const server = { to } as unknown as Server;
    const svc = new HrmRealtimeService();
    svc.attachServer(server);
    svc.publishAttendanceEvent({
      type: 'attendance_update_request.approved',
      at: '2026-04-22T00:00:00.000Z',
      request: { ...sampleRequest, status: 'approved' },
    });
    expect(to).toHaveBeenCalledWith(
      'company:78b8a663-f5e5-4f4d-a020-b8f950ec2037',
    );
    expect(to).toHaveBeenCalledWith(
      'employee:f76f23f7-3683-4120-81b7-5126ee997b8e',
    );
    expect(emit).toHaveBeenCalledTimes(2);
  });
});
