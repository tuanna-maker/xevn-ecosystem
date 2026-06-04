import { Test, TestingModule } from '@nestjs/testing';
import { createHmac } from 'node:crypto';
import { EmployeeMetadataController } from './employee-metadata.controller';
import { EmployeeMetadataService } from './employee-metadata.service';

function createInternalJwt(payload: Record<string, unknown>) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const secret = process.env.SERVICE_JWT_SECRET ?? 'xevn-dev-jwt-secret';
  const sig = createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

describe('EmployeeMetadataController', () => {
  let controller: EmployeeMetadataController;

  const serviceMock = {
    submitChangeRequest: jest.fn().mockResolvedValue({ id: 'meta-req-1' }),
    listChangeRequests: jest.fn().mockResolvedValue({ total: 1, data: [{ id: 'meta-req-1' }] }),
    approveChangeRequest: jest.fn().mockResolvedValue({ id: 'meta-req-1', status: 'approved' }),
    rejectChangeRequest: jest.fn().mockResolvedValue({ id: 'meta-req-1', status: 'rejected' }),
    listAuditLogs: jest.fn().mockResolvedValue({ total: 1, data: [{ id: 'audit-1' }] }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.INTERNAL_API_KEY = 'test-key';
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeeMetadataController],
      providers: [{ provide: EmployeeMetadataService, useValue: serviceMock }],
    }).compile();
    controller = module.get<EmployeeMetadataController>(EmployeeMetadataController);
  });

  it('HRM-MD-01 submit HRM-MD-02 list HRM-MD-03 approve HRM-MD-04 reject HRM-MD-05 audit metadata codes', async () => {
    const createRes = await controller.submitChangeRequest(undefined, 'test-key', 'xevn', undefined, {
      company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      employee_id: 'f76f23f7-3683-4120-81b7-5126ee997b8e',
      field_key: 'job_title',
      requested_value: JSON.stringify({ code: 'OPS_MANAGER' }),
      actor_user_id: 'u-1',
    });
    const listRes = await controller.listChangeRequests(undefined, 'test-key', 'xevn', undefined, {
      company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
    });
    const approveRes = await controller.approveChangeRequest(
      'meta-req-1',
      undefined,
      'test-key',
      'xevn',
      '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      { actor_user_id: 'u-1' },
    );
    const rejectRes = await controller.rejectChangeRequest(
      'meta-req-2',
      undefined,
      'test-key',
      'xevn',
      '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      { actor_user_id: 'u-1', note: 'invalid' },
    );
    const auditRes = await controller.listAuditLogs(
      undefined,
      'test-key',
      'xevn',
      '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      undefined,
    );

    expect(createRes.code).toBe('HRM-META-201');
    expect(listRes.code).toBe('HRM-META-200');
    expect(approveRes.code).toBe('HRM-META-202');
    expect(rejectRes.code).toBe('HRM-META-203');
    expect(auditRes.code).toBe('HRM-META-204');
  });

  it('rejects missing tenant scope before mutation', async () => {
    expect(() =>
      controller.submitChangeRequest(undefined, 'test-key', undefined, undefined, {
        company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
        employee_id: 'f76f23f7-3683-4120-81b7-5126ee997b8e',
        field_key: 'job_title',
        requested_value: JSON.stringify({ code: 'OPS_MANAGER' }),
      }),
    ).toThrow('tenantId is required');
    expect(serviceMock.submitChangeRequest).not.toHaveBeenCalled();
  });

  it('rejects scope mismatch against token', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
    });
    expect(() =>
      controller.listChangeRequests(`Bearer ${token}`, undefined, 'xevn', undefined, {
        company_id: 'a7d2dbec-75d7-4b2e-8c75-c53cd14f22aa',
      }),
    ).toThrow('companyId mismatches token scope');
    expect(serviceMock.listChangeRequests).not.toHaveBeenCalled();
  });

  it('UC-HRM-26 accepts portal slug company_id=main and optional tenant_id query', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const res = await controller.listChangeRequests(`Bearer ${token}`, undefined, 'xevn', 'main', {
      company_id: 'main',
      tenant_id: 'xevn',
      status: 'pending',
    });
    expect(res.code).toBe('HRM-META-200');
    expect(serviceMock.listChangeRequests).toHaveBeenCalledWith(
      expect.objectContaining({ company_id: 'main', status: 'pending', tenant_id: 'xevn' }),
      `Bearer ${token}`,
    );
  });
});
