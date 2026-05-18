/**
 * Mỗi tenant một tài khoản CEO (dev) — membership trên xbos_user_tenant_membership.
 * Không xóa admin@xevn.vn (super dev); CEO chỉ thuộc đúng một tenant.
 *
 * Usage: cd apps/api/xbos-api && npx ts-node scripts/seed-tenant-ceo-users.ts
 */
import './load-env';
import { Pool } from 'pg';

const MASTER = process.env.MASTER_TENANT_ID?.trim() || 'xevn';

const TENANT_CEOS: Array<{
  userId: string;
  tenantId: string;
  roleCode: string;
  displayName: string;
  companyId: string;
}> = [
  { userId: 'ceo@xevn.vn', tenantId: MASTER, roleCode: 'group_ceo', displayName: 'CEO Tập đoàn', companyId: 'holding' },
  { userId: 'ceo@xe-du-lich.vn', tenantId: 'xe-du-lich', roleCode: 'subsidiary_ceo', displayName: 'CEO Du lịch', companyId: 'main' },
  { userId: 'ceo@xe-vietnam.vn', tenantId: 'xe-vietnam', roleCode: 'subsidiary_ceo', displayName: 'CEO X.E Việt Nam', companyId: 'main' },
  { userId: 'ceo@xe-tmdv.vn', tenantId: 'xe-tmdv', roleCode: 'subsidiary_ceo', displayName: 'CEO TM-DV', companyId: 'main' },
  { userId: 'ceo@visun.vn', tenantId: 'visun', roleCode: 'subsidiary_ceo', displayName: 'CEO Visun', companyId: 'main' },
];

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

async function main() {
  const pool = poolFromEnv();
  try {
    for (const ceo of TENANT_CEOS) {
      const reg = await pool.query(`SELECT 1 FROM public.xbos_tenant_registry WHERE tenant_id = $1`, [ceo.tenantId]);
      if (!reg.rows[0]) {
        console.warn(`  skip ${ceo.userId}: tenant ${ceo.tenantId} not in registry`);
        continue;
      }
      await pool.query(
        `INSERT INTO public.xbos_user_tenant_membership (user_id, tenant_id, role_code, is_default, status)
         VALUES ($1,$2,$3,true,'active')
         ON CONFLICT (user_id, tenant_id) DO UPDATE SET
           role_code = EXCLUDED.role_code,
           is_default = true,
           status = 'active',
           updated_at = NOW()`,
        [ceo.userId, ceo.tenantId, ceo.roleCode],
      );
      console.log(`  ✓ ${ceo.userId} → ${ceo.tenantId} (${ceo.roleCode})`);
    }
    console.log('\nDev login (Portal/HRM header x-user-id hoặc JWT sub):');
    for (const ceo of TENANT_CEOS) {
      console.log(`  - ${ceo.userId}  |  ${ceo.displayName}  |  tenant=${ceo.tenantId}`);
    }
    console.log('\nSuper dev (đa tenant): admin@xevn.vn — giữ từ seed org.');
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
