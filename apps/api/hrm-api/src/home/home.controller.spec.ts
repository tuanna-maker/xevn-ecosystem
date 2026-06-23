import { Test, TestingModule } from '@nestjs/testing';
import { signServiceJwt } from '../common/jwt-sign';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';

describe('HomeController (PCOMP-W4-BE-HUB-04a)', () => {
  let controller: HomeController;

  const holdingUuid = '6efaa5d6-a4a8-4bfd-805a-3c4f003e4013';
  const managerId = 'ea430f27-74f3-4f03-99ee-1e44cb407bd9';

  const serviceMock = {
    getSummary: jest.fn().mockResolvedValue({
      viewer: {
        employee_id: managerId,
        display_name: 'UAT Manager',
        is_manager: true,
        is_birthday_today: false,
      },
      tasks: { total_count: 1, unread_inbox_count: 1, own_pending_count: 0, items: [] },
      manager_pending: { total_count: 3, leave_count: 2, update_count: 1, preview: [] },
      celebrations: { total_count: 0, items: [] },
      whos_out: { total_count: 0, items: [] },
      attendance_today: { checked_in: true, check_in_at: '2026-06-07T08:02:00+07:00', status: 'present' },
      generated_at: '2026-06-07T09:00:00+07:00',
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.INTERNAL_API_KEY = 'test-key';
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HomeController],
      providers: [{ provide: HomeService, useValue: serviceMock }],
    }).compile();
    controller = module.get<HomeController>(HomeController);
  });

  it('requires bearer or internal key', () => {
    expect(() =>
      controller.getSummary(undefined, undefined, undefined, undefined, {
        company_id: 'holding',
        employee_id: managerId,
      }),
    ).toThrow('Unauthorized home access');
    expect(serviceMock.getSummary).not.toHaveBeenCalled();
  });

  it('GET home/summary returns HRM-HOME-200 envelope for manager JWT', async () => {
    const token = signServiceJwt({
      sub: 'uat.manager@xe.vn',
      tenantId: 'xevn',
      companyId: 'holding',
      company_uuid: holdingUuid,
      employee_id: managerId,
      roles: ['employee', 'manager'],
    });
    const result = await controller.getSummary(`Bearer ${token}`, undefined, 'xevn', holdingUuid, {
      company_id: 'holding',
      employee_id: managerId,
    });
    expect(result.success).toBe(true);
    expect(result.code).toBe('HRM-HOME-200');
    expect(result.data.manager_pending.total_count).toBe(3);
    expect(serviceMock.getSummary).toHaveBeenCalledWith(
      expect.objectContaining({ company_id: 'holding', employee_id: managerId }),
      `Bearer ${token}`,
      'xevn',
    );
  });

  it('D-MOB-HOME-SUMMARY-400-01: holding query normalizes to trsport for member JWT', async () => {
    const trsportUuid = '32a3cdcb-c534-4e47-80f9-d2f156e65094';
    const cooId = '293b5900-8f99-4a97-878b-26270fb01827';
    const token = signServiceJwt({
      sub: 'uat.nv0002@xe.vn',
      tenantId: 'xevn',
      companyId: 'trsport',
      company_uuid: trsportUuid,
      employee_id: cooId,
      roles: ['employee', 'manager'],
    });
    await controller.getSummary(`Bearer ${token}`, undefined, 'xevn', 'trsport', {
      company_id: 'holding',
      employee_id: cooId,
    });
    expect(serviceMock.getSummary).toHaveBeenCalledWith(
      expect.objectContaining({ company_id: 'trsport', employee_id: cooId }),
      `Bearer ${token}`,
      'xevn',
    );
  });

  it('409 when company_id mismatches JWT scope (HRM-ERR-SCOPE-INVALID path via resolveScopeContext)', () => {
    const token = signServiceJwt({
      sub: 'uat.nv0001@xe.vn',
      tenantId: 'xevn',
      companyId: 'holding',
      company_uuid: holdingUuid,
      employee_id: managerId,
      roles: ['employee'],
    });
    expect(() =>
      controller.getSummary(`Bearer ${token}`, undefined, 'xevn', holdingUuid, {
        company_id: 'trsport',
        employee_id: managerId,
      }),
    ).toThrow('companyId mismatches token scope');
    expect(serviceMock.getSummary).not.toHaveBeenCalled();
  });

  it('allows internal API key without JWT', async () => {
    const result = await controller.getSummary(undefined, 'test-key', 'xevn', 'holding', {
      company_id: 'holding',
      employee_id: managerId,
    });
    expect(result.success).toBe(true);
    expect(serviceMock.getSummary).toHaveBeenCalled();
  });
});
