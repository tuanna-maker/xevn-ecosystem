import { Test, TestingModule } from '@nestjs/testing';
import { createHmac } from 'node:crypto';
import { RecruitmentController } from './recruitment.controller';
import { RecruitmentCatalogService } from './recruitment-catalog.service';
import { RecruitmentService } from './recruitment.service';

function createInternalJwt(payload: Record<string, unknown>) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const secret = process.env.SERVICE_JWT_SECRET ?? 'xevn-dev-jwt-secret';
  const sig = createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

/** UC: HRM-RC-01..06 · embed UC-HRM-22 */
describe('RecruitmentController (HRM-RC-01..06)', () => {
  let controller: RecruitmentController;

  const serviceMock = {
    createJobRequisition: jest.fn().mockResolvedValue({ id: 'req-1' }),
    listJobRequisitions: jest.fn().mockResolvedValue({ total: 1, data: [{ id: 'req-1' }] }),
    createCandidate: jest.fn().mockResolvedValue({ id: 'cand-1' }),
    listCandidates: jest.fn().mockResolvedValue({ total: 1, data: [{ id: 'cand-1' }] }),
    scheduleInterview: jest.fn().mockResolvedValue({ id: 'int-1' }),
    updateInterviewStatus: jest.fn().mockResolvedValue({ id: 'int-1', status: 'passed' }),
  };

  const catalogMock = {
    listJobPostings: jest.fn().mockResolvedValue({ total: 0, data: [] }),
    createJobPosting: jest.fn().mockResolvedValue({ id: 'jp-1' }),
    deleteJobPosting: jest.fn().mockResolvedValue({ id: 'jp-1' }),
    listCandidatesTable: jest.fn().mockResolvedValue({ total: 0, data: [] }),
    createCandidatePool: jest.fn().mockResolvedValue({ id: 'cp-1' }),
    updateCandidatePool: jest.fn().mockResolvedValue({ id: 'cp-1' }),
    deleteCandidatePool: jest.fn().mockResolvedValue({ id: 'cp-1' }),
    listCandidateApplications: jest.fn().mockResolvedValue({ total: 0, data: [] }),
    listRecruitmentPlans: jest.fn().mockResolvedValue({ total: 0, data: [] }),
    updateRecruitmentPlanStatus: jest.fn().mockResolvedValue({ id: 'plan-1', status: 'approved' }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.INTERNAL_API_KEY = 'test-key';
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecruitmentController],
      providers: [
        { provide: RecruitmentService, useValue: serviceMock },
        { provide: RecruitmentCatalogService, useValue: catalogMock },
      ],
    }).compile();

    controller = module.get<RecruitmentController>(RecruitmentController);
  });

  it('HRM-RC-02 list HRM-RC-03 create HRM-RC-04 list HRM-RC-05 schedule HRM-RC-06 update interview codes', async () => {
    const createReqRes = await controller.createJobRequisition(undefined, 'test-key', 'xevn', undefined, {
      company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      title: 'Backend Engineer',
      department: 'Engineering',
      employment_type: 'full_time',
    });
    const listReqRes = await controller.listJobRequisitions(undefined, 'test-key', 'xevn', undefined, {
      company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
    });
    const createCandidateRes = await controller.createCandidate(undefined, 'test-key', 'xevn', undefined, {
      company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      requisition_id: 'f76f23f7-3683-4120-81b7-5126ee997b8e',
      full_name: 'Nguyen Van A',
      email: 'a@xe.vn',
      source: 'linkedin',
    });
    const listCandidateRes = await controller.listCandidates(undefined, 'test-key', 'xevn', undefined, {
      company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
    });
    const scheduleRes = await controller.scheduleInterview(undefined, 'test-key', 'xevn', undefined, {
      company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      candidate_id: 'f76f23f7-3683-4120-81b7-5126ee997b8e',
      scheduled_at: '2026-04-25T09:00:00.000Z',
      interviewer: 'HR Lead',
    });
    const updateRes = await controller.updateInterviewStatus(
      'f76f23f7-3683-4120-81b7-5126ee997b8e',
      undefined,
      'test-key',
      'xevn',
      '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      { status: 'passed' },
    );

    expect(createReqRes.code).toBe('HRM-REC-201');
    expect(listReqRes.code).toBe('HRM-REC-200');
    expect(createCandidateRes.code).toBe('HRM-REC-202');
    expect(listCandidateRes.code).toBe('HRM-REC-200');
    expect(scheduleRes.code).toBe('HRM-REC-203');
    expect(updateRes.code).toBe('HRM-REC-204');
  });

  it('accepts internal API key and forwards recruitment payloads', async () => {
    const requisitionBody = {
      company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      title: 'QA Engineer',
      department: 'Quality',
      employment_type: 'full_time',
    };
    const requisitionQuery = {
      company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      page: 2,
      page_size: 5,
    };
    const candidateBody = {
      company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      requisition_id: 'f76f23f7-3683-4120-81b7-5126ee997b8e',
      full_name: 'Tran Thi B',
      email: 'b@xe.vn',
      source: 'referral',
    };
    const candidateQuery = {
      company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      requisition_id: 'f76f23f7-3683-4120-81b7-5126ee997b8e',
      page: 1,
      page_size: 10,
    };
    const interviewBody = {
      company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      candidate_id: 'f76f23f7-3683-4120-81b7-5126ee997b8e',
      scheduled_at: '2026-04-26T09:00:00.000Z',
      interviewer: 'Tech Lead',
    };
    const statusBody = { status: 'failed' as const };

    await controller.createJobRequisition(undefined, 'test-key', 'xevn', undefined, requisitionBody);
    await controller.listJobRequisitions(undefined, 'test-key', 'xevn', undefined, requisitionQuery);
    await controller.createCandidate(undefined, 'test-key', 'xevn', undefined, candidateBody);
    await controller.listCandidates(undefined, 'test-key', 'xevn', undefined, candidateQuery);
    await controller.scheduleInterview(undefined, 'test-key', 'xevn', undefined, interviewBody);
    await controller.updateInterviewStatus('int-1', undefined, 'test-key', 'xevn', '78b8a663-f5e5-4f4d-a020-b8f950ec2037', statusBody);

    expect(serviceMock.createJobRequisition).toHaveBeenCalledWith(requisitionBody, undefined);
    expect(serviceMock.listJobRequisitions).toHaveBeenCalledWith(requisitionQuery, undefined, { tenantId: 'xevn' });
    expect(serviceMock.createCandidate).toHaveBeenCalledWith(candidateBody, undefined);
    expect(serviceMock.listCandidates).toHaveBeenCalledWith(candidateQuery, undefined, { tenantId: 'xevn' });
    expect(serviceMock.scheduleInterview).toHaveBeenCalledWith(interviewBody, undefined);
    expect(serviceMock.updateInterviewStatus).toHaveBeenCalledWith(
      'int-1',
      statusBody,
      '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      undefined,
    );
  });

  it('blocks unauthorized recruitment access', async () => {
    expect(() =>
      controller.listJobRequisitions(undefined, undefined, undefined, undefined, {
        company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      }),
    ).toThrow('Unauthorized recruitment access');
    expect(serviceMock.listJobRequisitions).not.toHaveBeenCalled();
  });

  it('rejects missing tenant scope before create candidate', async () => {
    expect(() =>
      controller.createCandidate(undefined, 'test-key', undefined, undefined, {
        company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
        requisition_id: 'f76f23f7-3683-4120-81b7-5126ee997b8e',
        full_name: 'Tran Thi B',
        email: 'b@xe.vn',
        source: 'referral',
      }),
    ).toThrow('tenantId is required');
    expect(serviceMock.createCandidate).not.toHaveBeenCalled();
  });

  it('creates candidate pool row when requisition_id is omitted', async () => {
    const res = await controller.createCandidate(undefined, 'test-key', 'xevn', undefined, {
      company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      full_name: 'Pool Candidate',
      email: 'pool@xe.vn',
      source: 'career_page',
    });
    expect(res.code).toBe('HRM-REC-CP-201');
    expect(catalogMock.createCandidatePool).toHaveBeenCalledWith(
      expect.objectContaining({ full_name: 'Pool Candidate' }),
      undefined,
    );
    expect(serviceMock.createCandidate).not.toHaveBeenCalled();
  });

  it('updates and deletes candidate-pool rows', async () => {
    const updated = await controller.updateCandidatePool(
      'f76f23f7-3683-4120-81b7-5126ee997b8e',
      undefined,
      'test-key',
      '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      { stage: 'interview' },
    );
    const deleted = await controller.deleteCandidatePool(
      'f76f23f7-3683-4120-81b7-5126ee997b8e',
      undefined,
      'test-key',
      '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
    );
    expect(updated.code).toBe('HRM-REC-CP-200');
    expect(deleted.code).toBe('HRM-REC-CP-200');
    expect(catalogMock.updateCandidatePool).toHaveBeenCalled();
    expect(catalogMock.deleteCandidatePool).toHaveBeenCalled();
  });

  it('lists job requisitions when company_id is slug main (portal pilot)', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'main',
    });
    const res = await controller.listJobRequisitions(`Bearer ${token}`, undefined, 'xevn', undefined, {
      company_id: 'main',
    });
    expect(res.code).toBe('HRM-REC-200');
    expect(serviceMock.listJobRequisitions).toHaveBeenCalledWith(
      expect.objectContaining({ company_id: 'main' }),
      `Bearer ${token}`,
      { tenantId: 'xevn' },
    );
  });

  it('rejects tenant scope mismatch against token', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
    });
    expect(() =>
      controller.listCandidates(`Bearer ${token}`, undefined, 'xevn-alt', undefined, {
        company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      }),
    ).toThrow('tenantId mismatches token scope');
    expect(serviceMock.listCandidates).not.toHaveBeenCalled();
  });

  it('accepts x-access-token fallback header for list requisitions', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'main',
    });
    const res = await controller.listJobRequisitions(
      undefined,
      undefined,
      'xevn',
      undefined,
      { company_id: 'main' },
      { 'x-access-token': token },
    );
    expect(res.code).toBe('HRM-REC-200');
    expect(serviceMock.listJobRequisitions).toHaveBeenCalledWith(
      { company_id: 'main' },
      `Bearer ${token}`,
      { tenantId: 'xevn' },
    );
  });
});
