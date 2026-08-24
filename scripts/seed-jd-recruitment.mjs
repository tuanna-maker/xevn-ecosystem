import pg from 'pg';
const { Client } = pg;
const client = new Client({
  user: 'postgres',
  password: '5^S0CEpvYwC1(#YN1UoJ',
  host: '113.20.107.184',
  port: 5432,
  database: 'xevn_hrm'
});
client.connect().then(async () => {
  console.log('Connected to DB. Seeding JDs into job_description_templates...');

  const jdTemplates = [
    { code: 'JD_DRIVER_01', name: 'Lái xe tiêu chuẩn (Hạng B2)' },
    { code: 'JD_DRIVER_02', name: 'Lái xe tải (Hạng C)' },
    { code: 'JD_DRIVER_03', name: 'Lái xe nâng' },
    { code: 'JD_DRIVER_04', name: 'Lái xe khách (Hạng D)' },
    { code: 'JD_DRIVER_05', name: 'Lái xe container (Hạng FC)' }
  ];

  for (const jd of jdTemplates) {
    await client.query(
      'INSERT INTO public.job_description_templates (id, company_id, code, title, is_active, status, created_at, updated_at) VALUES (gen_random_uuid(), ''main'', \, \, true, ''active'', NOW(), NOW()) ON CONFLICT ON CONSTRAINT uq_job_description_templates_company_code DO NOTHING;',
      [jd.code, jd.name]
    );
  }

  console.log('Successfully seeded job_description_templates!');
  await client.end();
}).catch(console.error);