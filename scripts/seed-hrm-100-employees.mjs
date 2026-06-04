import pg from 'pg';

const { Client } = pg;

const required = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD'];
for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing required env: ${key}`);
}

const config = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.HRM_DB_NAME || 'xevn_hrm',
  ssl: false,
};

const companies = ['holding', 'trsport', 'logistics', 'finance', 'services'];
const departments = [
  'Ban Điều hành',
  'Nhân sự',
  'Tài chính',
  'Vận hành',
  'Kho vận',
  'Kinh doanh',
  'CNTT',
  'Pháp chế',
  'An toàn',
  'Chăm sóc khách hàng',
];
const roles = [
  'CEO',
  'COO',
  'CFO',
  'CHRO',
  'CTO',
  'HRBP_MANAGER',
  'HR_SPECIALIST',
  'PAYROLL_SPECIALIST',
  'RECRUITER',
  'OPS_MANAGER',
  'DISPATCH_SUPERVISOR',
  'FLEET_SUPERVISOR',
  'WAREHOUSE_SUP',
  'WAREHOUSE_STAFF',
  'DRIVER_LEAD',
  'DRIVER',
  'ACCOUNTANT',
  'FINANCE_ANALYST',
  'SALES_MANAGER',
  'SALES_EXECUTIVE',
  'LEGAL_SPECIALIST',
  'SAFETY_OFFICER',
  'IT_ADMIN',
  'DATA_ANALYST',
  'CUSTOMER_SUCCESS',
];

function pad(n, width = 4) {
  return String(n).padStart(width, '0');
}

function buildEmployee(i) {
  const seq = i + 1;
  const companyId = companies[i % companies.length];
  const role = roles[i % roles.length];
  const dept = departments[i % departments.length];
  const hiredAt = new Date(Date.UTC(2022 + (i % 4), (i * 3) % 12, ((i * 7) % 27) + 1))
    .toISOString()
    .slice(0, 10);
  const status = i % 12 === 0 ? 'inactive' : 'active';
  const first = `NhanSu${pad(seq)}`;
  const fullName = `Nguyen ${first}`;

  return {
    id: `00000000-0000-4000-8000-${pad(seq, 12)}`,
    company_id: companyId,
    employee_code: `NV${pad(seq)}`,
    email: `nhansu${pad(seq)}@xe.vn`,
    full_name: fullName,
    job_title_key: role,
    status,
    hired_at: hiredAt,
    custom_fields: {
      department: dept,
      cost_center: `CC-${companyId.toUpperCase()}`,
      grade: `G${(i % 7) + 1}`,
      shift_group: i % 2 === 0 ? 'Ca hành chính' : 'Ca xoay',
      phone: `09${String(10000000 + seq).slice(-8)}`,
    },
  };
}

async function main() {
  const client = new Client(config);
  await client.connect();
  try {
    await client.query('BEGIN');
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.employees (
        id UUID PRIMARY KEY,
        company_id TEXT NOT NULL,
        employee_code TEXT NOT NULL,
        email TEXT NOT NULL,
        full_name TEXT NOT NULL,
        job_title_key TEXT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        hired_at DATE NULL,
        archived_at TIMESTAMPTZ NULL,
        custom_fields JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT chk_employees_status CHECK (status IN ('active', 'inactive'))
      );
    `);
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_employees_company_code
      ON public.employees (company_id, employee_code);
    `);

    await client.query('DELETE FROM public.employees WHERE company_id = ANY($1::text[])', [companies]);

    for (let i = 0; i < 100; i += 1) {
      const e = buildEmployee(i);
      await client.query(
        `
          INSERT INTO public.employees (
            id, company_id, employee_code, email, full_name, job_title_key, status, hired_at, custom_fields, archived_at, updated_at
          ) VALUES ($1::uuid, $2, $3, $4, $5, $6, $7, $8::date, $9::jsonb, NULL, NOW())
          ON CONFLICT (company_id, employee_code)
          DO UPDATE SET
            email = EXCLUDED.email,
            full_name = EXCLUDED.full_name,
            job_title_key = EXCLUDED.job_title_key,
            status = EXCLUDED.status,
            hired_at = EXCLUDED.hired_at,
            custom_fields = EXCLUDED.custom_fields,
            archived_at = NULL,
            updated_at = NOW();
        `,
        [
          e.id,
          e.company_id,
          e.employee_code,
          e.email,
          e.full_name,
          e.job_title_key,
          e.status,
          e.hired_at,
          JSON.stringify(e.custom_fields),
        ],
      );
    }

    const countRes = await client.query(
      `SELECT COUNT(*)::int AS c FROM public.employees WHERE company_id = ANY($1::text[])`,
      [companies],
    );
    const roleRes = await client.query(
      `
      SELECT COUNT(DISTINCT job_title_key)::int AS role_count
      FROM public.employees
      WHERE company_id = ANY($1::text[])
      `,
      [companies],
    );
    await client.query('COMMIT');

    console.log(
      JSON.stringify(
        {
          success: true,
          seeded_employees: countRes.rows[0].c,
          distinct_roles: roleRes.rows[0].role_count,
          companies,
        },
        null,
        2,
      ),
    );
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(JSON.stringify({ success: false, error: error.message }, null, 2));
  process.exit(1);
});

