import { Test, TestingModule } from '@nestjs/testing';
import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import { BusinessMasterController } from './business-master.controller';
import { BusinessMasterService } from './business-master.service';

describe('BusinessMasterController (UC-XBOS-08 / MD)', () => {
  let controller: BusinessMasterController;
  const serviceMock = {
    list: jest.fn().mockResolvedValue([{ id: '1', code: 'CEO' }]),
    listDomainCatalog: jest.fn().mockReturnValue([{ domain: 'companies', readPath: '/business-master/companies/items' }]),
    upsert: jest.fn().mockResolvedValue({ id: '1' }),
    remove: jest.fn().mockResolvedValue({ deleted: true }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.INTERNAL_API_KEY = 'test-key';
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BusinessMasterController],
      providers: [{ provide: BusinessMasterService, useValue: serviceMock }],
    }).compile();
    controller = module.get(BusinessMasterController);
  });

  it('UC-XBOS-MD-01 UC-XBOS-MD-02 UC-XBOS-MD-03 UC-XBOS-MD-04 UC-XBOS-MD-05 UC-XBOS-MD-06 UC-XBOS-MD-07: list domain catalog with tenant+company scope', async () => {
    const res = await controller.listDomains('xevn', 'main', undefined, 'test-key');
    expect(res.code).toBe('XBOS-MASTER-200');
    expect(res.data.total).toBe(1);
    expect(serviceMock.listDomainCatalog).toHaveBeenCalled();
  });

  it('UC-ECO-MASTER-01: :domain shortcut resolves literal domains to catalog', async () => {
    const res = await controller.listDomainShortcut(
      'domains',
      'xevn',
      'main',
      undefined,
      'test-key',
    );
    expect(res.code).toBe('XBOS-MASTER-200');
    expect(serviceMock.listDomainCatalog).toHaveBeenCalled();
    expect(serviceMock.list).not.toHaveBeenCalled();
  });

  it('UC-ECO-MASTER-01: rejects domains list without scope', () => {
    expect(() => controller.listDomains(undefined, undefined, undefined, 'test-key')).toThrow(
      expect.objectContaining({ code: 'SCOPE_TENANT_REQUIRED' }),
    );
  });

  it('UC-ECO-MASTER-01 / SRS §8.1: rejects domains list without companyId', () => {
    expect(() => controller.listDomains('xevn', undefined, undefined, 'test-key')).toThrow(
      expect.objectContaining({ code: 'SCOPE_COMPANY_REQUIRED' }),
    );
  });

  it('UC-ECO-MASTER-01 / SRS §8.1: group CEO JWT main maps read scope to holding', async () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const res = await controller.listDomains('xevn', 'main', `Bearer ${token}`, 'test-key');
    expect(res.code).toBe('XBOS-MASTER-200');
    expect(res.data.tenantId).toBe('xevn');
    expect(res.data.companyId).toBe('holding');
    expect(serviceMock.listDomainCatalog).toHaveBeenCalled();
  });

  it('UC-ECO-MASTER-01 / SRS §8.1: group CEO JWT main lists vendors under holding partition', async () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const res = await controller.list('vendors', 'xevn', 'main', `Bearer ${token}`, 'test-key');
    expect(res.code).toBe('XBOS-MASTER-200');
    expect(res.data.tenantId).toBe('xevn');
    expect(res.data.companyId).toBe('holding');
    expect(serviceMock.list).toHaveBeenCalledWith('xevn', 'holding', 'vendors');
  });

  it('UC-ECO-MASTER-01 / SRS §8.1: rejects list when JWT holding scope mismatches query main', async () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'holding',
    });
    await expect(
      controller.list('vendors', 'xevn', 'main', `Bearer ${token}`, 'test-key'),
    ).rejects.toMatchObject<ApiException>({ code: 'SCOPE_CONTEXT_MISMATCH' });
    expect(serviceMock.list).not.toHaveBeenCalled();
  });

  it('UC-ECO-MASTER-01 / SRS §8.1: rejects list when JWT tenant mismatches query tenant', async () => {
    const token = signServiceJwt({
      sub: 'du-lich.ceo@xe.vn',
      tenantId: 'xe-du-lich',
      companyId: 'main',
      roleCode: 'company_ceo',
    });
    await expect(
      controller.list('vendors', 'xevn', 'main', `Bearer ${token}`, 'test-key'),
    ).rejects.toMatchObject<ApiException>({ code: 'SCOPE_CONTEXT_MISMATCH' });
    expect(serviceMock.list).not.toHaveBeenCalled();
  });

  it('UC-XBOS-08: list domain items with internal key', async () => {
    const res = await controller.list('job_titles', 'xevn', 'holding', undefined, 'test-key');
    expect(res.code).toBe('XBOS-MASTER-200');
    expect(serviceMock.list).toHaveBeenCalledWith('xevn', 'holding', 'job_titles');
  });

  it('UC-XBOS-08: accepts departments domain path (resolved in service)', async () => {
    const res = await controller.list('departments', 'xevn', 'holding', undefined, 'test-key');
    expect(res.code).toBe('XBOS-MASTER-200');
    expect(serviceMock.list).toHaveBeenCalledWith('xevn', 'holding', 'departments');
  });

  it('rejects list without internal auth', async () => {
    await expect(controller.list('job_titles', 'xevn', 'holding', undefined, undefined)).rejects.toThrow(
      'Unauthorized internal access',
    );
  });
});
