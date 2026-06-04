/**
 * Seed cơ cấu tổ chức từ apps/api/xbos-api/data/org-seed-member-companies.json
 * (đồng bộ với docs/danh sách công ty và vai trò.md — BRD công ty / phòng / chức danh).
 *
 * Usage:
 *   cd apps/api/xbos-api && npx ts-node scripts/seed-org-foundation.ts
 *   SEED_EXCEL_PATH="/path/to/file.xlsx" npx ts-node scripts/seed-org-foundation.ts --from-excel
 */
import './load-env';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { Pool } from 'pg';

type SeedPosition = { code: string; name: string };
type SeedDepartment = { code: string; name: string; orgType: string; positions: SeedPosition[] };
type SeedSubsidiary = {
  companyId: string;
  code: string;
  name: string;
  shortName: string;
  entityType: string;
  departments: SeedDepartment[];
};
type SeedFile = {
  tenantId: string;
  holding: { companyId: string; code: string; name: string; entityType: string };
  subsidiaries: SeedSubsidiary[];
};

function poolFromEnv(): Pool {
  if (process.env.DATABASE_URL_XBOS) {
    return new Pool({ connectionString: process.env.DATABASE_URL_XBOS, ssl: false });
  }
  return new Pool({
    host: process.env.DB_HOST ?? '127.0.0.1',
    port: Number(process.env.DB_PORT ?? 5432),
    user: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD,
    database: 'xevn_xbos',
    ssl: false,
  });
}

async function ensureSchema(pool: Pool) {
  await pool.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');
  const ddl = [
    `CREATE TABLE IF NOT EXISTS public.xbos_legal_entity (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id TEXT NOT NULL, company_id TEXT NOT NULL, code TEXT NOT NULL, name TEXT NOT NULL,
      entity_type TEXT NOT NULL DEFAULT 'subsidiary', status TEXT NOT NULL DEFAULT 'active',
      payload JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (tenant_id, company_id, code)
    )`,
    `ALTER TABLE public.xbos_legal_entity ADD COLUMN IF NOT EXISTS tax_code TEXT`,
    `ALTER TABLE public.xbos_legal_entity ADD COLUMN IF NOT EXISTS established_at DATE`,
    `ALTER TABLE public.xbos_legal_entity ADD COLUMN IF NOT EXISTS address TEXT`,
    `ALTER TABLE public.xbos_legal_entity ADD COLUMN IF NOT EXISTS business_lines TEXT`,
    `ALTER TABLE public.xbos_legal_entity ADD COLUMN IF NOT EXISTS charter_capital NUMERIC`,
    `ALTER TABLE public.xbos_legal_entity ADD COLUMN IF NOT EXISTS legal_representative TEXT`,
    `CREATE TABLE IF NOT EXISTS public.xbos_org_unit (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id TEXT NOT NULL, company_id TEXT NOT NULL, parent_id UUID REFERENCES public.xbos_org_unit(id) ON DELETE SET NULL,
      legal_entity_id UUID REFERENCES public.xbos_legal_entity(id) ON DELETE SET NULL,
      org_type TEXT NOT NULL, code TEXT NOT NULL, name TEXT NOT NULL, sort_order INT NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active', payload JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (tenant_id, company_id, code)
    )`,
    `CREATE TABLE IF NOT EXISTS public.xbos_business_master_entries (
      id BIGSERIAL PRIMARY KEY,
      tenant_id TEXT NOT NULL, company_id TEXT NOT NULL, domain TEXT NOT NULL, item_id TEXT NOT NULL,
      payload JSONB NOT NULL DEFAULT '{}'::jsonb, status TEXT NOT NULL DEFAULT 'active',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (tenant_id, company_id, domain, item_id)
    )`,
    `CREATE TABLE IF NOT EXISTS public.xbos_position_template (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id TEXT NOT NULL, code TEXT NOT NULL, name TEXT NOT NULL,
      level_scope TEXT NOT NULL DEFAULT 'group', org_type_hint TEXT, status TEXT NOT NULL DEFAULT 'active',
      payload JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (tenant_id, code)
    )`,
    `CREATE TABLE IF NOT EXISTS public.xbos_tenant_registry (
      tenant_id TEXT PRIMARY KEY, name TEXT NOT NULL, short_name TEXT NOT NULL,
      tenant_kind TEXT NOT NULL DEFAULT 'member', default_company_id TEXT NOT NULL DEFAULT 'main',
      modules JSONB NOT NULL DEFAULT '[]'::jsonb, status TEXT NOT NULL DEFAULT 'active',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS public.xbos_user_tenant_membership (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL, tenant_id TEXT NOT NULL, role_code TEXT NOT NULL,
      is_default BOOLEAN NOT NULL DEFAULT false, status TEXT NOT NULL DEFAULT 'active',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (user_id, tenant_id)
    )`,
  ];
  for (const sql of ddl) await pool.query(sql);
}

const MASTER = process.env.MASTER_TENANT_ID?.trim() || 'xevn';
const MEMBER_COMPANY = 'main';
const DEV_USER = process.env.DEV_DEFAULT_USER_ID?.trim() || 'admin@xe.vn';

async function seedTenantOrg(pool: Pool, tenantId: string, companyId: string, sub: SeedSubsidiary) {
  await clearTenantOrg(pool, tenantId);
  const le = await pool.query(
    `INSERT INTO public.xbos_legal_entity (tenant_id, company_id, code, name, entity_type, payload)
     VALUES ($1,$2,$3,$4,'subsidiary',$5::jsonb)
     ON CONFLICT (tenant_id, company_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW()
     RETURNING id`,
    [tenantId, companyId, sub.code, sub.name, JSON.stringify({ shortName: sub.shortName })],
  );
  const legalEntityId = le.rows[0].id as string;
  const root = await pool.query(
    `INSERT INTO public.xbos_org_unit (tenant_id, company_id, code, name, org_type, legal_entity_id, sort_order, payload)
     VALUES ($1,$2,$3,$4,'subsidiary',$5::uuid,0,$6::jsonb)
     ON CONFLICT (tenant_id, company_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW()
     RETURNING id`,
    [tenantId, companyId, 'root', sub.shortName, legalEntityId, JSON.stringify({ employees: sub.departments.reduce((n, d) => n + d.positions.length, 0) })],
  );
  const rootId = root.rows[0].id as string;
  let sort = 1;
  for (const dept of sub.departments) {
    await pool.query(
      `INSERT INTO public.xbos_org_unit (tenant_id, company_id, code, name, org_type, parent_id, legal_entity_id, sort_order, payload)
       VALUES ($1,$2,$3,$4,'department',$5::uuid,$6::uuid,$7,$8::jsonb)
       ON CONFLICT (tenant_id, company_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW()`,
      [tenantId, companyId, dept.code, dept.name, rootId, legalEntityId, sort++, JSON.stringify({ positionCount: dept.positions.length })],
    );
    for (const pos of dept.positions) {
      await pool.query(
        `INSERT INTO public.xbos_position_template (tenant_id, code, name, level_scope, org_type_hint, payload)
         VALUES ($1,$2,$3,'subsidiary',$4,$5::jsonb)
         ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW()`,
        [tenantId, pos.code, pos.name, dept.name, JSON.stringify({ departmentCode: dept.code })],
      );
    }
  }
}

/** UC-XBOS-10 — promotable segment under holding for group CEO live probes. */
async function seedHoldingPilotBusinessSegments(pool: Pool) {
  const res = await pool.query<{ id: string }>(
    `INSERT INTO public.xbos_org_unit (tenant_id, company_id, code, name, org_type, status, payload)
     VALUES ($1, $2, 'pilot-segment-tourism', 'Mảng Du lịch (UAT pilot)', 'segment', 'active', $3::jsonb)
     ON CONFLICT (tenant_id, company_id, code)
     DO UPDATE SET org_type = 'segment', status = 'active', name = EXCLUDED.name, updated_at = NOW()
     RETURNING id`,
    [MASTER, 'holding', JSON.stringify({ pilot: true, segmentKey: 'tourism', source: 'p1-close-be-w1b' })],
  );
  const segmentId = res.rows[0]?.id;
  if (segmentId) {
    console.log(`  ✓ UC-XBOS-10 pilot segment (holding): id=${segmentId} code=pilot-segment-tourism`);
  }
}

async function clearTenantOrg(pool: Pool, tenantId: string) {
  const optionalDeletes = [
    `DELETE FROM public.xbos_permission_grant WHERE tenant_id = $1`,
    `DELETE FROM public.xbos_position_assignment WHERE tenant_id = $1`,
  ];
  for (const sql of optionalDeletes) {
    try {
      await pool.query(sql, [tenantId]);
    } catch (e: unknown) {
      if ((e as { code?: string }).code !== '42P01') throw e;
    }
  }
  await pool.query(
    `DELETE FROM public.xbos_job_description WHERE position_template_id IN (
      SELECT id FROM public.xbos_position_template WHERE tenant_id = $1
    )`,
    [tenantId],
  ).catch((e: unknown) => {
    if ((e as { code?: string }).code !== '42P01') throw e;
  });
  await pool.query(`DELETE FROM public.xbos_position_template WHERE tenant_id = $1`, [tenantId]);
  await pool.query(`DELETE FROM public.xbos_org_unit WHERE tenant_id = $1`, [tenantId]);
  await pool.query(`DELETE FROM public.xbos_legal_entity WHERE tenant_id = $1`, [tenantId]);
}

async function seed(pool: Pool, data: SeedFile) {
  await pool.query(`DELETE FROM public.xbos_user_tenant_membership`);
  await pool.query(`DELETE FROM public.xbos_tenant_registry`);

  await pool.query(
    `INSERT INTO public.xbos_tenant_registry (tenant_id, name, short_name, tenant_kind, default_company_id, modules)
     VALUES ($1,$2,$3,'master',$4,$5::jsonb)
     ON CONFLICT (tenant_id) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW()`,
    [MASTER, data.holding.name, 'Tập đoàn', MEMBER_COMPANY, JSON.stringify(['x-bos-group', 'cockpit'])],
  );

  await pool.query(
    `INSERT INTO public.xbos_user_tenant_membership (user_id, tenant_id, role_code, is_default)
     VALUES ($1,$2,'group_ceo',true)
     ON CONFLICT (user_id, tenant_id) DO UPDATE SET role_code = EXCLUDED.role_code, updated_at = NOW()`,
    [DEV_USER, MASTER],
  );

  await clearTenantOrg(pool, MASTER);
  await seedHoldingPilotBusinessSegments(pool);

  await pool.query(
    `INSERT INTO public.xbos_legal_entity (tenant_id, company_id, code, name, entity_type, payload)
     VALUES ($1, 'holding', 'xevn-holding', $2, 'holding', $3::jsonb)
     ON CONFLICT (tenant_id, company_id, code) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW()`,
    [MASTER, data.holding.name, JSON.stringify({ pilot: true, source: 'p1-close-be-w5' })],
  );

  for (const sub of data.subsidiaries) {
    const memberTenantId = sub.companyId;
    await pool.query(
      `INSERT INTO public.xbos_tenant_registry (tenant_id, name, short_name, tenant_kind, default_company_id, modules)
       VALUES ($1,$2,$3,'member',$4,$5::jsonb)
       ON CONFLICT (tenant_id) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW()`,
      [
        memberTenantId,
        sub.name,
        sub.shortName,
        MEMBER_COMPANY,
        JSON.stringify(['settings', 'hrm', 'finance', 'accounting', 'operations']),
      ],
    );

    await pool.query(
      `INSERT INTO public.xbos_user_tenant_membership (user_id, tenant_id, role_code, is_default)
       VALUES ($1,$2,'subsidiary_ceo',false)
       ON CONFLICT (user_id, tenant_id) DO UPDATE SET role_code = EXCLUDED.role_code, updated_at = NOW()`,
      [DEV_USER, memberTenantId],
    );

    await seedTenantOrg(pool, memberTenantId, MEMBER_COMPANY, sub);
    console.log(
      `  ✓ tenant ${memberTenantId} (${sub.shortName}): ${sub.departments.length} phòng, ${sub.departments.reduce((n, d) => n + d.positions.length, 0)} chức danh`,
    );
  }
}

async function main() {
  const dataPath = path.join(__dirname, '../data/org-seed-member-companies.json');
  if (!fs.existsSync(dataPath)) {
    console.error('Missing', dataPath, '- run generate script first');
    process.exit(1);
  }
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8')) as SeedFile;
  const pool = poolFromEnv();
  try {
    await ensureSchema(pool);
    console.log('Seeding org foundation for tenant', process.env.MASTER_TENANT_ID ?? data.tenantId);
    await seed(pool, data);
    console.log('Done.');
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
