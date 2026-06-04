import { Test, TestingModule } from '@nestjs/testing';
import { createHmac } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import { PositionRbacController } from './position-rbac.controller';
import { PositionRbacService } from './position-rbac.service';

function createInternalJwt(payload: Record<string, unknown>) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const secret = process.env.SERVICE_JWT_SECRET ?? 'xevn-dev-jwt-secret';
  const sig = createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

describe('PositionRbacController (UC-XBOS-11/12, ADR scope)', () => {
  let controller: PositionRbacController;

  const serviceMock = {
    listTemplates: jest.fn().mockResolvedValue([]),
    upsertTemplate: jest.fn().mockResolvedValue({ id: 'tpl-1' }),
    listAssignments: jest.fn().mockResolvedValue([]),
    upsertAssignment: jest.fn().mockResolvedValue({ id: 'asg-1' }),
    listPermissionDefinitions: jest.fn().mockResolvedValue([]),
    upsertPermissionDefinition: jest.fn().mockResolvedValue({ id: 'perm-1' }),
    checkGrantConflicts: jest.fn().mockResolvedValue([]),
    grantPermission: jest.fn().mockResolvedValue({ id: 'grant-1' }),
    getPermissionMatrix: jest.fn().mockResolvedValue([]),
    savePermissionMatrix: jest.fn().mockResolvedValue([]),
    upsertJobDescription: jest.fn().mockResolvedValue({ id: 'jd-1' }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.INTERNAL_API_KEY = 'test-key';
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PositionRbacController],
      providers: [{ provide: PositionRbacService, useValue: serviceMock }],
    }).compile();
    controller = module.get<PositionRbacController>(PositionRbacController);
  });

  it('rejects unauthenticated template list', async () => {
    await expect(controller.listTemplates(undefined, undefined, undefined)).rejects.toMatchObject<
      ApiException
    >({ code: 'XBOS-AUTH-001' });
    expect(serviceMock.listTemplates).not.toHaveBeenCalled();
  });

  it('UC-CC-P0-04: lists templates with tenant-only scope (no companyId gate)', async () => {
    const result = await controller.listTemplates('xevn', undefined, 'test-key');
    expect(result.code).toBe('XBOS-POS-200');
    expect(serviceMock.listTemplates).toHaveBeenCalledWith('xevn');
  });

  it('rejects assignments when JWT main mismatches header holding', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xe-du-lich',
      companyId: 'main',
    });
    await expect(
      controller.listAssignments('xe-du-lich', 'holding', `Bearer ${token}`, undefined),
    ).rejects.toMatchObject<ApiException>({ code: 'SCOPE_CONTEXT_MISMATCH' });
    expect(serviceMock.listAssignments).not.toHaveBeenCalled();
  });

  it('lists assignments when JWT and headers align on main', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xe-du-lich',
      companyId: 'main',
    });
    const result = await controller.listAssignments('xe-du-lich', 'main', `Bearer ${token}`, 'test-key');
    expect(result.code).toBe('XBOS-POS-200');
    expect(serviceMock.listAssignments).toHaveBeenCalledWith('xe-du-lich', 'main');
  });

  it('loads permission matrix with tenant-only scope', async () => {
    const result = await controller.getMatrix('role-ceo', 'xevn', undefined, 'test-key');
    expect(result.code).toBe('XBOS-POS-200');
    expect(serviceMock.getPermissionMatrix).toHaveBeenCalledWith('xevn', 'role-ceo');
  });

  it('UC-XBOS-12: grants assignment and checks permission conflicts', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xe-du-lich',
      companyId: 'main',
    });
    const createRes = await controller.createAssignment(
      { templateId: 'tpl-ceo', employeeId: 'emp-1' },
      'xe-du-lich',
      'main',
      `Bearer ${token}`,
      'test-key',
    );
    expect(createRes.code).toBe('XBOS-POS-201');
    expect(serviceMock.upsertAssignment).toHaveBeenCalled();
    const conflictRes = await controller.conflicts(
      'perm-read',
      'asg-1',
      'xe-du-lich',
      'main',
      `Bearer ${token}`,
      'test-key',
    );
    expect(conflictRes.code).toBe('XBOS-POS-200');
    expect(serviceMock.checkGrantConflicts).toHaveBeenCalledWith('xe-du-lich', 'main', 'perm-read', 'asg-1');
  });

  it('requires roleId for matrix GET', async () => {
    await expect(controller.getMatrix('', 'xevn', undefined, 'test-key')).rejects.toMatchObject<ApiException>({
      code: 'XBOS-POS-400',
    });
    expect(serviceMock.getPermissionMatrix).not.toHaveBeenCalled();
  });
});
