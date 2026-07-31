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
    getJobRequisitionById: jest.fn().mockResolvedValue({ id: 'req-1', company_id: 'holding' }),
    updateJobRequisition: jest.fn().mockResolvedValue({ id: 'req-1', company_id: 'holding', status: 'on_hold' }),
    submitJobRequisitionForApproval: jest.fn().mockResolvedValue({
      id: 'req-1',
      company_id: 'holding',
      workflow_instance_id: null,
      spawn: null,
      spawnMissing: true,
    }),
    createCandidate: jest.fn().mockResolvedValue({ id: 'cand-1' }),
    listCandidates: jest.fn().mockResolvedValue({ total: 1, data: [{ id: 'cand-1' }] }),
    getCandidateById: jest.fn().mockResolvedValue({ id: 'cand-1', company_id: 'holding' }),
    scheduleInterview: jest.fn().mockResolvedValue({ id: 'int-1' }),
    updateInterviewStatus: jest.fn().mockResolvedValue({ id: 'int-1', status: 'passed' }),
  };

  const catalogMock = {
    listJobPostings: jest.fn().mockResolvedValue({ total: 0, data: [] }),
    createJobPosting: jest.fn().mockResolvedValue({ id: 'jp-1' }),
    deleteJobPosting: jest.fn().mockResolvedValue({ id: 'jp-1' }),
    listCandidatesTable: jest.fn().mockResolvedValue({ total: 0, data: [] }),
    getCandidatePoolById: jest.fn().mockResolvedValue({ id: 'cp-1', company_id: 'holding', stage: 'hired' }),
    createCandidatePool: jest.fn().mockResolvedValue({ id: 'cp-1' }),
    updateCandidatePool: jest.fn().mockResolvedValue({ id: 'cp-1' }),
    deleteCandidatePool: jest.fn().mockResolvedValue({ id: 'cp-1' }),
    listCandidateApplications: jest.fn().mockResolvedValue({ total: 0, data: [] }),
    listRecruitmentPlans: jest.fn().mockResolvedValue({ total: 0, data: [] }),
    updateRecruitmentPlanStatus: jest.fn().mockResolvedValue({ id: 'plan-1', status: 'approved' }),
    submitRecruitmentPlanForApproval: jest.fn().mockResolvedValue({
      id: 'plan-1',
      spawn: null,
      spawnMissing: true,
    }),
    startCandidatePipeline: jest.fn().mockResolvedValue({
      id: 'cp-1',
      spawn: null,
      spawnMissing: true,
    }),
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
      headcount: 2,
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
    const getCandidateRes = await controller.getCandidate(
      'f76f23f7-3683-4120-81b7-5126ee997b8e',
      undefined,
      'test-key',
      'xevn',
      undefined,
      '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
    );
    const getPoolRes = await controller.getCandidatePool(
      '289a9388-22c5-49be-a795-f498a0c72436',
      undefined,
      'test-key',
      'xevn',
      undefined,
      'main',
    );
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
    expect(getCandidateRes.code).toBe('HRM-REC-200');
    expect(getPoolRes.code).toBe('HRM-REC-CP-200');
    expect(scheduleRes.code).toBe('HRM-REC-203');
    expect(updateRes.code).toBe('HRM-REC-204');
    expect(catalogMock.getCandidatePoolById).toHaveBeenCalledWith(
      '289a9388-22c5-49be-a795-f498a0c72436',
      'main',
      undefined,
    );
    expect(serviceMock.getCandidateById).toHaveBeenCalled();
  });

  it('accepts internal API key and forwards recruitment payloads', async () => {
    const requisitionBody = {
      company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      title: 'QA Engineer',
      department: 'Quality',
      employment_type: 'full_time',
      headcount: 1,
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

  it('loads job requisition by id with scope context (J-HRM-05)', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'main',
    });
    const requisitionId = 'f76f23f7-3683-4120-81b7-5126ee997b8e';
    const res = await controller.getJobRequisition(
      requisitionId,
      `Bearer ${token}`,
      undefined,
      'xevn',
      undefined,
      { company_id: 'main' },
    );
    expect(res.code).toBe('HRM-REC-200');
    expect(serviceMock.getJobRequisitionById).toHaveBeenCalledWith(
      requisitionId,
      { company_id: 'main' },
      `Bearer ${token}`,
      { tenantId: 'xevn' },
    );
  });

  it('updates job requisition status with scope context (AC-CRUD-HRM-REC-G-U-01)', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'main',
    });
    const requisitionId = 'f76f23f7-3683-4120-81b7-5126ee997b8e';
    const res = await controller.updateJobRequisition(
      requisitionId,
      `Bearer ${token}`,
      undefined,
      'xevn',
      undefined,
      { company_id: 'main' },
      { status: 'on_hold' },
    );
    expect(res.code).toBe('HRM-REC-200');
    expect(serviceMock.updateJobRequisition).toHaveBeenCalledWith(
      requisitionId,
      { status: 'on_hold' },
      { company_id: 'main' },
      `Bearer ${token}`,
      { tenantId: 'xevn' },
    );
  });

  it('UF-HRM-12: PUT requisitions alias delegates to updateJobRequisition (PATCH proxy fallback)', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'main',
    });
    const requisitionId = 'f76f23f7-3683-4120-81b7-5126ee997b8e';
    const res = await controller.putJobRequisition(
      requisitionId,
      `Bearer ${token}`,
      undefined,
      'xevn',
      undefined,
      { company_id: 'main' },
      { status: 'on_hold' },
    );
    expect(res.code).toBe('HRM-REC-200');
    expect(serviceMock.updateJobRequisition).toHaveBeenCalledTimes(1);
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

  /**
   * XHRM-REC-WF-BE-02 / D-XHRM-REC-WF-SUBMIT-SCOPE
   * Regression: toHrmListScopeContext(headers) caused 500 tenantId?.trim is not a function.
   * Missing WF definition → 2xx + spawnMissing (not 500).
   * Asserts 4th arg is HrmListScopeContext ({ tenantId }), never a Nest headers bag.
   */
  it('submit-workflow returns HRM-REC-WF-200 with spawnMissing when definition missing (J-REC-WF-02)', async () => {
    const requisitionId = 'f76f23f7-3683-4120-81b7-5126ee997b8e';
    const query = { company_id: 'holding' };
    const res = await controller.submitJobRequisitionWorkflow(
      requisitionId,
      undefined,
      'test-key',
      'xevn',
      undefined,
      query,
      'ceo@xe.vn',
    );
    expect(res.code).toBe('HRM-REC-WF-200');
    expect(res.data).toEqual(
      expect.objectContaining({
        spawnMissing: true,
        workflow_instance_id: null,
      }),
    );
    const scopeArg = serviceMock.submitJobRequisitionForApproval.mock.calls[0]?.[3];
    expect(scopeArg).toEqual({ tenantId: 'xevn' });
    expect(typeof (scopeArg as { tenantId?: unknown })?.tenantId).toBe('string');
    expect(serviceMock.submitJobRequisitionForApproval).toHaveBeenCalledWith(
      requisitionId,
      query,
      undefined,
      { tenantId: 'xevn' },
      {
        submitterUserId: 'ceo@xe.vn',
        tenantId: 'xevn',
        companySlug: 'holding',
      },
    );
  });

  it('plan submit-workflow and candidate start-pipeline return 2xx spawnMissing without scope-context crash', async () => {
    const planId = 'f76f23f7-3683-4120-81b7-5126ee997b8e';
    const candidateId = 'a76f23f7-3683-4120-81b7-5126ee997b8e';
    const planRes = await controller.submitRecruitmentPlanWorkflow(
      planId,
      undefined,
      'test-key',
      'xevn',
      'holding',
      'ceo@xe.vn',
    );
    const pipelineRes = await controller.startCandidatePipeline(
      candidateId,
      undefined,
      'test-key',
      'xevn',
      'main',
      'ceo@xe.vn',
    );
    expect(planRes.code).toBe('HRM-REC-PLAN-WF-200');
    expect(planRes.data).toEqual(expect.objectContaining({ spawnMissing: true }));
    expect(pipelineRes.code).toBe('HRM-REC-CP-WF-200');
    expect(pipelineRes.data).toEqual(expect.objectContaining({ spawnMissing: true }));
  });
});
