import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { HrmInboxService } from './hrm-inbox.service';
import { PushOutboundService } from './push-outbound.service';

describe('NotificationsController (UC-HRM-12 / HRM-NT)', () => {
  let controller: NotificationsController;

  const inboxMock = {
    listInbox: jest.fn().mockResolvedValue({ items: [] }),
    markRead: jest.fn().mockResolvedValue({ id: 'n1', read: true }),
  };
  const pushMock = {
    upsertToken: jest.fn().mockResolvedValue({ id: 'tok-1' }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.INTERNAL_API_KEY = 'test-key';
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        { provide: HrmInboxService, useValue: inboxMock },
        { provide: PushOutboundService, useValue: pushMock },
      ],
    }).compile();
    controller = module.get<NotificationsController>(NotificationsController);
  });

  it('UC-HRM-12: inbox list returns HRM-NOTIF-200', async () => {
    const res = await controller.listInbox(
      'Bearer t',
      'test-key',
      'xevn',
      undefined,
      {
        company_id: 'holding',
        employee_id: '633e95b7-cf1b-469f-a0f8-4c91f3f35f80',
      },
    );
    expect(res.code).toBe('HRM-NOTIF-200');
    expect(inboxMock.listInbox).toHaveBeenCalledWith(
      'holding',
      '633e95b7-cf1b-469f-a0f8-4c91f3f35f80',
      40,
      'Bearer t',
      'xevn',
    );
  });

  it('HRM-NT-01: mark read returns HRM-NOTIF-202', async () => {
    const res = await controller.markInboxRead(
      'n1',
      'Bearer t',
      'test-key',
      { company_id: 'holding' },
      { viewer_employee_id: 'emp-1' },
    );
    expect(res.code).toBe('HRM-NOTIF-202');
    expect(inboxMock.markRead).toHaveBeenCalledWith('n1', 'holding', 'emp-1');
  });

  it('HRM-NT-02: register push token returns HRM-NOTIF-201', async () => {
    const res = await controller.registerPushToken('Bearer t', 'test-key', {
      company_id: 'holding',
      employee_id: 'emp-1',
      platform: 'ios',
      token: 'expo-push-token',
    });
    expect(res.code).toBe('HRM-NOTIF-201');
    expect(pushMock.upsertToken).toHaveBeenCalledWith(
      'holding',
      'emp-1',
      'ios',
      'expo-push-token',
    );
  });

  it('blocks unauthorized notifications access', () => {
    expect(() =>
      controller.listInbox(undefined, undefined, {
        company_id: 'holding',
        employee_id: 'e1',
      }),
    ).toThrow('Unauthorized notifications access');
    expect(inboxMock.listInbox).not.toHaveBeenCalled();
  });
});
