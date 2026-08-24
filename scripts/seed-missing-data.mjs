import pg from 'pg';
import crypto from 'crypto';
import { loadDeployEnv } from './seed-env-loader.mjs';

loadDeployEnv();
const { Client } = pg;
const client = new Client({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: "5^S0CEpvYwC1(#YN1UoJ",
  database: process.env.DB_NAME_HRM || 'xevn_hrm',
  ssl: false,
});

async function main() {
  await client.connect();
  const tenantId = process.env.MASTER_TENANT_ID ?? 'xevn';
  const companyId = process.env.DEFAULT_COMPANY_ID ?? 'holding';

  console.log('Connected to DB. Seeding missing employees...');
  const emps = [
    { id: 'f9355446-266e-48df-8639-8cff9f0fb49c', code: 'EMP-T1', email: 'longpv@xe.vn', name: 'Phạm Văn Long' },
    { id: 'f3a8eb2e-23eb-4820-862c-5ef7627fdc26', code: 'EMP-T2', email: 'hant@xe.vn', name: 'Nguyễn Thu Hà' },
    { id: 'e538c31d-d68d-408b-8169-c73a15c029b4', code: 'EMP-T3', email: 'binhlq@xe.vn', name: 'Lê Quốc Bình' },
    { id: 'e92a0ef1-04e5-4b42-8626-bc540035840f', code: 'EMP-T4', email: 'anht@xe.vn', name: 'Trần Minh An' },
  ];

  for (const e of emps) {
    try {
      await client.query(`
        INSERT INTO public.employees (id, company_id, employee_code, email, full_name, status, hired_at, updated_at)
        VALUES ($1::uuid, $2, $3, $4, $5, 'active', NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name
      `, [e.id, 'main', e.code, e.email, e.name]);
    } catch (err) {
      console.error(`Failed to insert employee ${e.id}:`, err.message);
    }
  }

  console.log('Seeding JD templates...');
  const mockJDs = [
    { id: 'ba587a26-2200-4188-bb55-682326e25ee4', name: 'JD Lái xe tải tiêu chuẩn', code: 'JD_DRV_STD', active: true, parent_id: null },
    { id: 'jd-2', name: 'JD Nhân viên kinh doanh', code: 'JD_SALE', active: true, parent_id: null },
    { id: 'jd-3', name: 'JD Chuyên viên tuyển dụng', code: 'JD_HR', active: true, parent_id: null },
    { id: 'jd-4', name: 'JD Trưởng phòng nhân sự', code: 'JD_HRM', active: true, parent_id: null },
    { id: 'jd-5', name: 'JD Giám đốc tài chính', code: 'JD_CFO', active: true, parent_id: null },
  ];

  for (const targetCompany of [companyId, 'main']) {
    try {
      let res = await client.query(`SELECT payload FROM public.synced_catalogs WHERE catalog_key = 'jd_templates' AND tenant_id = $1 AND company_id = $2`, [tenantId, targetCompany]);
      
      let payload = res.rows[0]?.payload || { items: [] };
      if (typeof payload === 'string') payload = JSON.parse(payload);
      
      const items = payload.items || [];
      for (const jd of mockJDs) {
        if (!items.find(i => i.id === jd.id)) {
          items.push(jd);
        }
      }
      payload.items = items;

      await client.query(`
        INSERT INTO public.synced_catalogs (tenant_id, company_id, catalog_key, source_system, payload, version, checksum, synced_at)
        VALUES ($1, $2, 'jd_templates', 'xbos', $3::jsonb, 1, '', NOW())
        ON CONFLICT (tenant_id, company_id, catalog_key) DO UPDATE SET payload = EXCLUDED.payload, synced_at = NOW()
      `, [tenantId, targetCompany, JSON.stringify(payload)]);

      // Also insert into physical recruitment table for the Thư viện JD screen
      for (const jd of mockJDs) {
        await client.query(`
          INSERT INTO public.job_description_templates (
            id, tenant_id, company_id, code, title, is_active, status, created_at, updated_at
          ) VALUES (
            $1::uuid, $2, $3, $4, $5, true, 'active', NOW(), NOW()
          ) ON CONFLICT ON CONSTRAINT uq_job_description_templates_company_code DO NOTHING
        `, [crypto.randomUUID(), tenantId, targetCompany, jd.code, jd.name]);
      }
    } catch (err) {
      console.error(`Failed to insert JDs for company ${targetCompany}:`, err.message);
    }
  }

  await client.end();
  console.log('Successfully seeded missing data to DB!');
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});

