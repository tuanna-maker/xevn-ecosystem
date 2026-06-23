import { HttpStatus } from '@nestjs/common';
import { EmployeeMetadataService } from './employee-metadata.service';
import { EmployeeMetadataRepository } from './employee-metadata.repository';
import { ApiException } from '../common/api.exception';

/** UF-HRM-11 — metadata submit accepts slug company_id; employees expose company_uuid */
describe('P1-WEB-ACCEPTANCE-FIX-WAVE-02 UF-HRM-11 metadata company_uuid', () => {
  const repository = {
    submitChange: jest.fn().mockResolvedValue({ id: 'req-1', status: 'pending' }),
  } as unknown as EmployeeMetadataRepository;

  let service: EmployeeMetadataService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new EmployeeMetadataService(repository);
  });

  it('maps finance slug to pilot UUID before submitChange', async () => {
    await service.submitChangeRequest({
      company_id: 'finance',
      employee_id: '11111111-1111-4111-8111-111111111111',
      field_key: 'job_title',
      requested_value: JSON.stringify({ code: 'QA_UF11' }),
    });

    expect(repository.submitChange).toHaveBeenCalledWith(
      expect.objectContaining({
        company_id: '10000000-0000-4000-8000-000000000004',
      }),
    );
  });

  it('rejects unknown slug with HRM-VAL-001', async () => {
    await expect(
      service.submitChangeRequest({
        company_id: 'unknown-slug',
        employee_id: '11111111-1111-4111-8111-111111111111',
        field_key: 'job_title',
        requested_value: JSON.stringify({ code: 'QA' }),
      }),
    ).rejects.toBeInstanceOf(ApiException);
    await expect(
      service.submitChangeRequest({
        company_id: 'unknown-slug',
        employee_id: '11111111-1111-4111-8111-111111111111',
        field_key: 'job_title',
        requested_value: JSON.stringify({ code: 'QA' }),
      }),
    ).rejects.toMatchObject({ code: 'HRM-VAL-001', status: HttpStatus.BAD_REQUEST });
  });
});
