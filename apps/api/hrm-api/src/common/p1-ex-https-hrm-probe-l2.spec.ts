import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { createHmac } from 'node:crypto';
import request from 'supertest';
import { ContractsInsuranceController } from '../contracts-insurance/contracts-insurance.controller';
import { ContractsInsuranceService } from '../contracts-insurance/contracts-insurance.service';
import { EmployeeCompensationService } from '../contracts-insurance/employee-compensation.service';
import { RecruitmentController } from '../recruitment/recruitment.controller';
import { RecruitmentCatalogService } from '../recruitment/recruitment-catalog.service';
import { RecruitmentService } from '../recruitment/recruitment.service';
import { AttendanceController } from '../attendance/attendance.controller';
import { AttendanceCatalogService } from '../attendance/attendance-catalog.service';
import { AttendanceOverviewService } from '../attendance/attendance-overview.service';
import { AttendanceRequestsService } from '../attendance/attendance-requests.service';
import { AttendanceService } from '../attendance/attendance.service';
import { LeaveRequestsService } from '../attendance/leave-requests.service';
import { PayrollCatalogService } from '../payroll/payroll-catalog.service';
import { PayrollController } from '../payroll/payroll.controller';
import { PayrollService } from '../payroll/payroll.service';
import { GlobalHttpExceptionFilter } from './http-exception.filter';

function createInternalJwt(payload: Record<string, unknown>) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const secret = process.env.SERVICE_JWT_SECRET ?? 'xevn-dev-jwt-secret';
  const sig = createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

async function createProbeApp(controllers: unknown[], providers: unknown[]) {
  const moduleRef = await Test.createTestingModule({
    controllers: controllers as never[],
    providers: providers as never[],
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

/** P1-EX-BE-HTTPS-HRM-PROBE-01 — L2 paths from scripts/tmp-p1-ex-qa-https-01-probe.mjs */
describe('P1-EX HTTPS HRM probe L2 (HTTP)', () => {
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

  it('P-CC-05 GET contracts-insurance/insurance?company_id=main', async () => {
    const app = await createProbeApp(
      [ContractsInsuranceController],
      [
        {
          provide: ContractsInsuranceService,
          useValue: {
            listInsurance: jest.fn().mockResolvedValue({ total: 1, data: [{ id: 'ins-1', employee_id: 'emp-1' }] }),
          },
        },
        { provide: EmployeeCompensationService, useValue: {} },
      ],
    );
    await request(app.getHttpServer())
      .get('/api/hrm/contracts-insurance/insurance?company_id=main')
      .set('Authorization', auth)
      .set('x-tenant-id', 'xevn')
      .set('x-company-id', 'main')
      .expect(200)
      .expect((res) => expect(res.body.code).toBe('HRM-CON-200'));
    await app.close();
  });

  it('P-CC-06 GET recruitment/requisitions?company_id=main&page_size=100', async () => {
    const app = await createProbeApp(
      [RecruitmentController],
      [
        { provide: RecruitmentService, useValue: { listJobRequisitions: jest.fn().mockResolvedValue({ total: 1, data: [] }) } },
        { provide: RecruitmentCatalogService, useValue: {} },
      ],
    );
    await request(app.getHttpServer())
      .get('/api/hrm/recruitment/requisitions?company_id=main&page_size=100')
      .set('Authorization', auth)
      .set('x-tenant-id', 'xevn')
      .expect(200)
      .expect((res) => expect(res.body.code).toBe('HRM-REC-200'));
    await app.close();
  });

  it('P-CC-07 GET attendance/records?company_id=main&page_size=100', async () => {
    const app = await createProbeApp(
      [AttendanceController],
      [
        { provide: AttendanceService, useValue: { listRecords: jest.fn().mockResolvedValue({ total: 1, data: [] }) } },
        { provide: AttendanceCatalogService, useValue: {} },
        { provide: LeaveRequestsService, useValue: {} },
        { provide: AttendanceRequestsService, useValue: {} },
        { provide: AttendanceOverviewService, useValue: {} },
      ],
    );
    await request(app.getHttpServer())
      .get('/api/hrm/attendance/records?company_id=main&page_size=100')
      .set('Authorization', auth)
      .set('x-tenant-id', 'xevn')
      .expect(200)
      .expect((res) => expect(res.body.code).toBe('HRM-ATT-200'));
    await app.close();
  });

  it('P-CC-08 GET payroll/payslips?company_id=main&page_size=100', async () => {
    const app = await createProbeApp(
      [PayrollController],
      [
        { provide: PayrollService, useValue: { listPayslips: jest.fn().mockResolvedValue({ total: 1, data: [] }) } },
        { provide: PayrollCatalogService, useValue: {} },
      ],
    );
    await request(app.getHttpServer())
      .get('/api/hrm/payroll/payslips?company_id=main&page_size=100')
      .set('Authorization', auth)
      .set('x-tenant-id', 'xevn')
      .expect(200)
      .expect((res) => expect(res.body.code).toBe('HRM-PAY-200'));
    await app.close();
  });
});
