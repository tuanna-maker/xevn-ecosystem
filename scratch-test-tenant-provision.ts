import { NestFactory } from '@nestjs/core';
import { AppModule } from './apps/api/hrm-api/src/app.module';
import { TenantProvisionService } from './apps/api/hrm-api/src/tenant-provision/tenant-provision.service';
import { HrmDbService } from './apps/api/hrm-api/src/db/hrm-db.service';

async function bootstrap() {
  console.log('Starting Nest context...');
  const app = await NestFactory.createApplicationContext(AppModule);
  const provisionService = app.get(TenantProvisionService);
  
  const tenantId = 'tnt-test-seed-01';
  const companyId = 'co-test-seed-01';
  
  console.log('Running handleTenantProvisioned...');
  await provisionService.handleTenantProvisioned({
    eventType: 'TENANT_PROVISIONED',
    tenantId,
    defaultCompanyId: companyId,
    modules: ['hrm'],
    activatedAt: new Date().toISOString(),
    issuedBy: 'system'
  });
  
  console.log('Verifying rec_pipeline_stage...');
  const db = app.get(HrmDbService);
  const res = await db.query('SELECT stage_key, name_vi FROM public.rec_pipeline_stage WHERE company_id = $1', [companyId]);
  console.log('Stages seeded:', res.rows);
  
  const resExt = await db.query('SELECT catalog_key, code, label FROM public.hrm_catalog_extension_items WHERE company_id = $1', [companyId]);
  console.log('Extension items seeded:', resExt.rows);
  
  await app.close();
}
bootstrap().catch(console.error);
