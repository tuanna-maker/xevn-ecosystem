/**
 * D-HRM-MD-DUAL-PLANE-GUARD-01 — anti-join XBOS LE UUID on Metadata persist/list/audit/decide.
 * Happy path: slug → HRM_COMPANY_UUID_BY_SLUG unchanged (G-MD-PLANE-01).
 */
import { HttpStatus } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { HRM_COMPANY_UUID_BY_SLUG } from '../common/hrm-list-scope';
import { EmployeeMetadataRepository } from './employee-metadata.repository';
import { EmployeeMetadataService } from './employee-metadata.service';

/** Representative XBOS legal-entity UUID — NOT in HRM_COMPANY_UUID_BY_SLUG. */
const XBOS_LE_UUID = '78b8a663-f5e5-4f4d-a020-b8f950ec2037';

const EMP_ID = '11111111-1111-4111-8111-111111111111';

describe('D-HRM-MD-DUAL-PLANE-GUARD-01', () => {
  let service: EmployeeMetadataService;
  let repository: {
    submitChange: jest.Mock;
    listChangeRequests: jest.Mock;
    listAuditLogs: jest.Mock;
    getChangeRequestById: jest.Mock;
    approveChangeRequest: jest.Mock;
    rejectChangeRequest: jest.Mock;
  };

  beforeEach(() => {
    repository = {
      submitChange: jest.fn().mockResolvedValue({ id: 'req-1', status: 'pending' }),
      listChangeRequests: jest.fn().mockResolvedValue({ total: 0, page: 1, page_size: 20, data: [] }),
      listAuditLogs: jest.fn().mockResolvedValue([]),
      getChangeRequestById: jest.fn(),
      approveChangeRequest: jest.fn(),
      rejectChangeRequest: jest.fn(),
    };
    service = new EmployeeMetadataService(repository as unknown as EmployeeMetadataRepository);
  });

  describe('persist happy slug + anti-join LE', () => {
    it('slug finance → map UUID before submitChange', async () => {
      await service.submitChangeRequest({
        company_id: 'finance',
        employee_id: EMP_ID,
        field_key: 'job_title',
        requested_value: JSON.stringify({ code: 'QA_MD' }),
      });
      expect(repository.submitChange).toHaveBeenCalledWith(
        expect.objectContaining({
          company_id: HRM_COMPANY_UUID_BY_SLUG.finance,
        }),
      );
    });

    it('slug holding → map UUID', async () => {
      await service.submitChangeRequest({
        company_id: 'holding',
        employee_id: EMP_ID,
        field_key: 'job_title',
        requested_value: JSON.stringify({ code: 'QA_HOLD' }),
      });
      expect(repository.submitChange).toHaveBeenCalledWith(
        expect.objectContaining({
          company_id: HRM_COMPANY_UUID_BY_SLUG.holding,
        }),
      );
    });

    it('slug main → holding mapped UUID', async () => {
      await service.submitChangeRequest({
        company_id: 'main',
        employee_id: EMP_ID,
        field_key: 'job_title',
        requested_value: JSON.stringify({ code: 'QA_MAIN' }),
      });
      expect(repository.submitChange).toHaveBeenCalledWith(
        expect.objectContaining({
          company_id: HRM_COMPANY_UUID_BY_SLUG.holding,
        }),
      );
    });

    it('mapped Plane B′ UUID persist accepted', async () => {
      await service.submitChangeRequest({
        company_id: HRM_COMPANY_UUID_BY_SLUG.trsport,
        employee_id: EMP_ID,
        field_key: 'job_title',
        requested_value: JSON.stringify({ code: 'QA_MAP' }),
      });
      expect(repository.submitChange).toHaveBeenCalledWith(
        expect.objectContaining({
          company_id: HRM_COMPANY_UUID_BY_SLUG.trsport,
        }),
      );
    });

    it('LE UUID persist → HRM-PLANE-409 (no INSERT)', async () => {
      await expect(
        service.submitChangeRequest({
          company_id: XBOS_LE_UUID,
          employee_id: EMP_ID,
          field_key: 'job_title',
          requested_value: JSON.stringify({ code: 'LE_REJECT' }),
        }),
      ).rejects.toMatchObject<ApiException>({
        code: 'HRM-PLANE-409',
        status: HttpStatus.CONFLICT,
      });
      expect(repository.submitChange).not.toHaveBeenCalled();
    });

    it('unknown slug still HRM-VAL-001', async () => {
      await expect(
        service.submitChangeRequest({
          company_id: 'unknown-slug',
          employee_id: EMP_ID,
          field_key: 'job_title',
          requested_value: JSON.stringify({ code: 'QA' }),
        }),
      ).rejects.toMatchObject({ code: 'HRM-VAL-001', status: HttpStatus.BAD_REQUEST });
      expect(repository.submitChange).not.toHaveBeenCalled();
    });
  });

  describe('list / audit / decide wire', () => {
    it('listChangeRequests LE → HRM-PLANE-409 (no silent empty)', async () => {
      await expect(
        service.listChangeRequests({ company_id: XBOS_LE_UUID }),
      ).rejects.toMatchObject<ApiException>({ code: 'HRM-PLANE-409' });
      expect(repository.listChangeRequests).not.toHaveBeenCalled();
    });

    it('listChangeRequests slug holding reaches repository', async () => {
      await service.listChangeRequests({ company_id: 'holding', status: 'pending' });
      expect(repository.listChangeRequests).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'pending', page: 1, page_size: 20 }),
        undefined,
        'holding',
      );
    });

    it('listAuditLogs LE → HRM-PLANE-409', async () => {
      await expect(service.listAuditLogs(XBOS_LE_UUID, undefined)).rejects.toMatchObject<ApiException>({
        code: 'HRM-PLANE-409',
      });
      expect(repository.listAuditLogs).not.toHaveBeenCalled();
    });

    it('listAuditLogs slug finance reaches repository', async () => {
      await service.listAuditLogs('finance', EMP_ID);
      expect(repository.listAuditLogs).toHaveBeenCalledWith('finance', EMP_ID, undefined);
    });

    it('approveChangeRequest LE wire → HRM-PLANE-409 before load', async () => {
      await expect(
        service.approveChangeRequest('req-1', { actor_user_id: 'u-1' }, XBOS_LE_UUID),
      ).rejects.toMatchObject<ApiException>({ code: 'HRM-PLANE-409' });
      expect(repository.getChangeRequestById).not.toHaveBeenCalled();
    });

    it('rejectChangeRequest LE wire → HRM-PLANE-409 before load', async () => {
      await expect(
        service.rejectChangeRequest('req-1', { actor_user_id: 'u-1', note: 'x' }, XBOS_LE_UUID),
      ).rejects.toMatchObject<ApiException>({ code: 'HRM-PLANE-409' });
      expect(repository.getChangeRequestById).not.toHaveBeenCalled();
    });
  });
});
