require('ts-node').register();
require('./apps/api/xbos-api/src/load-env.ts');

const { XbosDbService } = require('./apps/api/xbos-api/src/db/xbos-db.service.ts');

async function test() {
  console.log("DB_HOST:", process.env.DB_HOST);
  const db = new XbosDbService();
  try {
    const { rows } = await db.query(
      `SELECT m.tenant_id, m.role_code, t.name, t.short_name, t.tenant_kind, t.default_company_id
       FROM public.xbos_user_tenant_membership m
       JOIN public.xbos_tenant_registry t ON t.tenant_id = m.tenant_id
       WHERE m.user_id = 'admin@xe.vn' AND m.status = 'active' AND t.status = 'active'`
    );
    console.log("Query succeeded! Rows:", rows.length);
  } catch (err) {
    console.error("Query failed!", err);
  } finally {
    await db.onModuleDestroy();
  }
}

test();
