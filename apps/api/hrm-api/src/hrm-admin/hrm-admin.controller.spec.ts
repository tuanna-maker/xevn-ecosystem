import { Test, TestingModule } from '@nestjs/testing';
import { HrmAdminController } from './hrm-admin.controller';
import { HrmAdminService } from './hrm-admin.service';

describe('HrmAdminController', () => {
  let controller: HrmAdminController;

  const serviceMock = {
    createPlatformAdmin: jest.fn().mockResolvedValue({ user_id: 'u1' }),
    createCompanyAdmin: jest.fn().mockResolvedValue({ user_id: 'u2', is_existing_user: false }),
    inviteEmployees: jest.fn().mockResolvedValue({ total: 1, invited: 1, failed: 0, results: [] }),
    resetUserPassword: jest.fn().mockResolvedValue({ success: true }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HrmAdminController],
      providers: [{ provide: HrmAdminService, useValue: serviceMock }],
    }).compile();
    controller = module.get<HrmAdminController>(HrmAdminController);
  });

  it('wraps platform admin response with deterministic code', async () => {
    const result = await controller.createPlatformAdmin('Bearer t', {
      email: 'a@x.com',
      password: '12345678',
      full_name: 'A',
    });
    expect(result.success).toBe(true);
    expect(result.code).toBe('HRM-ADMIN-201');
  });

  it('wraps company admin response with deterministic code', async () => {
    const result = await controller.createCompanyAdmin('Bearer t', {
      email: 'a@x.com',
      password: '12345678',
      company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      full_name: 'A',
      role: 'admin',
    });
    expect(result.success).toBe(true);
    expect(result.code).toBe('HRM-ADMIN-202');
  });

  it('wraps invite response with deterministic code', async () => {
    const result = await controller.inviteEmployees('Bearer t', {
      company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      employees: [{ email: 'e@x.com' }],
    });
    expect(result.success).toBe(true);
    expect(result.code).toBe('HRM-ADMIN-203');
  });

  it('wraps reset response with deterministic code', async () => {
    const result = await controller.resetUserPassword('Bearer t', {
      user_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      new_password: 'newpass123',
    });
    expect(result.success).toBe(true);
    expect(result.code).toBe('HRM-ADMIN-204');
  });
});
