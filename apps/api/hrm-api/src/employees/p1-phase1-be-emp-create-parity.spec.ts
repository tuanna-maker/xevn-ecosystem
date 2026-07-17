import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { createHmac } from 'node:crypto';
import request from 'supertest';
import { GlobalHttpExceptionFilter } from '../common/http-exception.filter';
import { HrmDbService } from '../db/hrm-db.service';
import { EmployeeProfileService } from './employee-profile.service';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';

function createInternalJwt(payload: Record<string, unknown>) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const secret = process.env.SERVICE_JWT_SECRET ?? 'xevn-dev-jwt-secret';
  const sig = createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

type EmployeeRow = {
  id: string;
  company_id: string;
  employee_code: string;
  email: string;
  full_name: string;
  job_title_key: string | null;
  manager_id: string | null;
  status: string;
  hired_at: string | null;
  archived_at: string | null;
  custom_fields: Record<string, string>;
  created_at: string;
  updated_at: string;
};

function createInMemoryHrmDb() {
  const rows: EmployeeRow[] = [];
  return {
    query: jest.fn(async (sql: string, params?: unknown[]) => {
      const text = sql.replace(/\s+/g, ' ').trim();
      if (text.startsWith('CREATE TABLE') || text.startsWith('CREATE UNIQUE') || text.startsWith('CREATE INDEX') || text.startsWith('ALTER TABLE') || text.startsWith('INSERT INTO public.employees (id, company_id, employee_code, email, full_name, job_title_key, status')) {
        return { rows: [] };
      }
      if (text.includes('SELECT COUNT(*)') && text.includes('FROM public.employees WHERE')) {
        const matched = filterRows(rows, params ?? []);
        return { rows: [{ total: String(matched.length) }] };
      }
      if (text.includes('INSERT INTO public.employees') && text.includes('RETURNING')) {
        const row: EmployeeRow = {
          id: String(params?.[0]),
          company_id: String(params?.[1]),
          employee_code: String(params?.[2]),
          email: String(params?.[3]),
          full_name: String(params?.[4]),
          job_title_key: (params?.[5] as string | null) ?? null,
          manager_id: null,
          status: 'active',
          hired_at: (params?.[6] as string | null) ?? null,
          archived_at: null,
          custom_fields: JSON.parse(String(params?.[8] ?? '{}')) as Record<string, string>,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        rows.push(row);
        return { rows: [row] };
      }
      if (text.includes('FROM public.employees') && text.includes('WHERE id =')) {
        const matched = filterRows(rows, params ?? []);
        return { rows: matched.slice(0, 1) };
      }
      if (
        text.includes('FROM public.employees') &&
        text.includes('ORDER BY created_at DESC') &&
        text.includes('id DESC')
      ) {
        const matched = filterRows(rows, params ?? []);
        const pageSize = Number(params?.[params.length - 2]);
        const offset = Number(params?.[params.length - 1]);
        return {
          rows: matched.slice(offset, offset + pageSize).map((row) => ({
            ...row,
            list_total: String(matched.length),
          })),
        };
      }
      if (text.startsWith('UPDATE public.employees')) {
        const id = String(params?.[params.length - 1]);
        const row = rows.find((r) => r.id === id);
        if (!row) return { rows: [] };
        if (params?.[0] && typeof params[0] === 'string' && String(params[0]).includes('@')) {
          row.email = String(params[0]);
        }
        if (typeof params?.[0] === 'string' && !String(params[0]).includes('@')) {
          row.full_name = String(params[0]);
        }
        row.updated_at = new Date().toISOString();
        return { rows: [row] };
      }
      return { rows: [] };
    }),
    onModuleDestroy: jest.fn(),
  };

  function filterRows(store: EmployeeRow[], params: unknown[]): EmployeeRow[] {
    let list = [...store].filter((r) => r.archived_at === null);
    const id = params[0];
    if (typeof id === 'string' && id.includes('-')) {
      list = list.filter((r) => r.id === id);
    }
    const companyFilter = params.find(
      (p) => typeof p === 'string' && ['main', 'holding', 'trsport', 'logistics', 'finance', 'services'].includes(p),
    );
    const companyAny = params.find((p) => Array.isArray(p));
    if (companyAny) {
      const slugs = companyAny as string[];
      list = list.filter((r) => slugs.includes(r.company_id));
    } else if (companyFilter) {
      list = list.filter((r) => r.company_id === companyFilter);
    }
    const tenantId = params.find((p) => p === 'xevn' || p === 'xe-du-lich');
    if (tenantId === 'xe-du-lich') {
      list = list.filter((r) => r.custom_fields?.tenant_id === 'xe-du-lich');
    }
    if (tenantId === 'xevn') {
      list = list.filter(
        (r) => !r.custom_fields?.tenant_id?.trim() || r.custom_fields.tenant_id === 'xevn',
      );
    }
    return list;
  }
}

describe('P1-PHASE1-BE-EMP-CREATE-PARITY-01 (HTTP)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.INTERNAL_API_KEY = 'test-key';
    process.env.NODE_ENV = 'test';
    const moduleRef = await Test.createTestingModule({
      controllers: [EmployeesController],
      providers: [
        EmployeesService,
        { provide: HrmDbService, useFactory: createInMemoryHrmDb },
        {
          provide: EmployeeProfileService,
          useValue: {
            listDegrees: jest.fn(),
            listTraining: jest.fn(),
            listAssets: jest.fn(),
          },
        },
      ],
    }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/hrm');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    app.useGlobalFilters(new GlobalHttpExceptionFilter());
    await app.init();
    const service = moduleRef.get(EmployeesService);
    await service.onModuleInit();
  });

  afterAll(async () => {
    await app.close();
  });

  it('member CEO: POST main → GET/PATCH 200 (scope parity)', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xe-du-lich',
      companyId: 'main',
      roleCode: 'subsidiary_ceo',
    });
    const stamp = Date.now();
    const created = await request(app.getHttpServer())
      .post('/api/hrm/employees')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', 'xe-du-lich')
      .set('x-company-id', 'main')
      .send({
        company_id: 'main',
        employee_code: `M${stamp}`,
        email: `mem.${stamp}@xe-du-lich.local`,
        full_name: `Member ${stamp}`,
      })
      .expect(201);
    const id = created.body.data?.id as string;
    expect(created.body.code).toBe('HRM-EMP-201');
    expect(created.body.data?.company_id).toBe('main');

    await request(app.getHttpServer())
      .get(`/api/hrm/employees/${id}?company_id=main`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', 'xe-du-lich')
      .set('x-company-id', 'main')
      .expect(200)
      .expect((res) => expect(res.body.code).toBe('HRM-EMP-200'));

    await request(app.getHttpServer())
      .patch(`/api/hrm/employees/${id}?company_id=main`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', 'xe-du-lich')
      .set('x-company-id', 'main')
      .send({ full_name: `Member UPD ${stamp}` })
      .expect(200)
      .expect((res) => expect(res.body.code).toBe('HRM-EMP-202'));

    const list = await request(app.getHttpServer())
      .get('/api/hrm/employees?company_id=main&page_size=100')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', 'xe-du-lich')
      .set('x-company-id', 'main')
      .expect(200);
    const found = (list.body.data?.data ?? []).some((r: { id: string }) => r.id === id);
    expect(found).toBe(true);
  });

  it('group CEO: POST main persists holding → GET 200', async () => {
    const token = createInternalJwt({
      iss: 'xevn-internal',
      aud: 'xevn-api',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const stamp = Date.now();
    const created = await request(app.getHttpServer())
      .post('/api/hrm/employees')
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', 'xevn')
      .set('x-company-id', 'main')
      .send({
        company_id: 'main',
        employee_code: `G${stamp}`,
        email: `grp.${stamp}@xe.vn`,
        full_name: `Group ${stamp}`,
      })
      .expect(201);
    const id = created.body.data?.id as string;
    expect(created.body.data?.company_id).toBe('holding');

    await request(app.getHttpServer())
      .get(`/api/hrm/employees/${id}?company_id=main`)
      .set('Authorization', `Bearer ${token}`)
      .set('x-tenant-id', 'xevn')
      .set('x-company-id', 'main')
      .expect(200);
  });
});
