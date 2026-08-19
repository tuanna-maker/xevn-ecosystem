/**
 * PO-HRM-REC-IV-ONE-ACTIVE-BE-02 — ScheduleInterviewDto slug company_id + HTTP validation gate.
 * Residual BE-DTO-SCHEDULE-IV-COMPANY-SLUG from QA-01: POST must not fail HRM-VAL-001 on holding|main.
 */
import 'reflect-metadata';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { createHmac } from 'node:crypto';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import request from 'supertest';
import { ApiException } from '../common/api.exception';
import { GlobalHttpExceptionFilter } from '../common/http-exception.filter';
import { JdDynamicService } from './jd-dynamic.service';
import { RecPipelineStageService } from './rec-pipeline-stage.service';
import { ScheduleInterviewDto } from './dto/schedule-interview.dto';
import { RecruitmentCatalogService } from './recruitment-catalog.service';
import { RecruitmentController } from './recruitment.controller';
import { RecruitmentDashboardService } from './recruitment-dashboard.service';
import { RecruitmentService } from './recruitment.service';

const CANDIDATE_ID = '73a7f4e2-b327-4308-8b9b-570cf1b04eb6';

function createInternalJwt(payload: Record<string, unknown>) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const secret = process.env.SERVICE_JWT_SECRET ?? 'xevn-dev-jwt-secret';
  const sig = createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

async function createRecruitmentHttpApp(scheduleInterview: jest.Mock) {
  const moduleRef = await Test.createTestingModule({
    controllers: [RecruitmentController],
    providers: [
      { provide: RecruitmentService, useValue: { scheduleInterview } },
      { provide: RecruitmentCatalogService, useValue: {} },
      { provide: JdDynamicService, useValue: {} },
      { provide: RecPipelineStageService, useValue: {} },
      // REC-08 added RecruitmentDashboardService to the controller ctor — DI-only stub.
      { provide: RecruitmentDashboardService, useValue: {} },
    ],
  }).compile();
  const app = moduleRef.createNestApplication();
  app.setGlobalPrefix('api/hrm');
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  app.useGlobalFilters(new GlobalHttpExceptionFilter());
  await app.init();
  return app;
}

const SCHEDULE_BODY = {
  company_id: 'holding',
  candidate_id: CANDIDATE_ID,
  scheduled_at: '2026-08-07T09:00:00.000Z',
  interviewer: 'QA Probe',
};

describe('PO-HRM-REC-IV-ONE-ACTIVE-BE-02 ScheduleInterviewDto slug company_id', () => {
  it('accepts company_id slug holding|main (not UUID-only)', () => {
    for (const slug of ['holding', 'main']) {
      const dto = plainToInstance(ScheduleInterviewDto, { ...SCHEDULE_BODY, company_id: slug });
      const errors = validateSync(dto, { whitelist: true, forbidNonWhitelisted: true });
      expect(errors).toHaveLength(0);
    }
  });

  it('rejects company_id longer than 80 chars', () => {
    const dto = plainToInstance(ScheduleInterviewDto, {
      ...SCHEDULE_BODY,
      company_id: 'x'.repeat(81),
    });
    const errors = validateSync(dto, { whitelist: true, forbidNonWhitelisted: true });
    expect(errors.length).toBeGreaterThan(0);
    expect(JSON.stringify(errors)).toMatch(/company_id/);
  });
});

describe('PO-HRM-REC-IV-ONE-ACTIVE-BE-02 POST /recruitment/interviews HTTP', () => {
  const token = createInternalJwt({
    iss: 'xevn-internal',
    aud: 'xevn-api',
    tenantId: 'xevn',
    companyId: 'main',
    roleCode: 'group_ceo',
  });
  const auth = `Bearer ${token}`;

  beforeAll(() => {
    process.env.INTERNAL_API_KEY = 'test-key';
  });

  it('returns 201 HRM-REC-203 when slug company_id passes validation (not HRM-VAL-001)', async () => {
    const scheduleMock = jest.fn().mockResolvedValue({
      id: 'int-slug-1',
      company_id: 'holding',
      candidate_id: CANDIDATE_ID,
      status: 'scheduled',
    });
    const app = await createRecruitmentHttpApp(scheduleMock);

    await request(app.getHttpServer())
      .post('/api/hrm/recruitment/interviews')
      .set('Authorization', auth)
      .set('x-tenant-id', 'xevn')
      .send(SCHEDULE_BODY)
      .expect(201)
      .expect((res) => {
        expect(res.body.code).toBe('HRM-REC-203');
        expect(res.body.code).not.toBe('HRM-VAL-001');
      });

    expect(scheduleMock).toHaveBeenCalledWith(
      expect.objectContaining({ company_id: 'holding', candidate_id: CANDIDATE_ID }),
      auth,
    );
    await app.close();
  });

  it('returns 409 HRM-REC-IV-409-ACTIVE when one-active conflict (not HRM-VAL-001)', async () => {
    const scheduleMock = jest.fn().mockRejectedValue(
      new ApiException('HRM-REC-IV-409-ACTIVE', 'Candidate already has an active interview', HttpStatus.CONFLICT, {
        candidate_id: CANDIDATE_ID,
        active_interview_id: 'active-1',
        active_status: 'scheduled',
        active_at: '2026-08-06T09:30:00.000Z',
      }),
    );
    const app = await createRecruitmentHttpApp(scheduleMock);

    await request(app.getHttpServer())
      .post('/api/hrm/recruitment/interviews')
      .set('Authorization', auth)
      .set('x-tenant-id', 'xevn')
      .send(SCHEDULE_BODY)
      .expect(409)
      .expect((res) => {
        expect(res.body.code).toBe('HRM-REC-IV-409-ACTIVE');
        expect(res.body.code).not.toBe('HRM-VAL-001');
        expect(res.body.details).toEqual(
          expect.objectContaining({ candidate_id: CANDIDATE_ID }),
        );
      });

    await app.close();
  });
});
