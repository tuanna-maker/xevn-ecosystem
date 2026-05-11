import pg from 'pg';

const { Client } = pg;

const required = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD'];
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required env: ${key}`);
  }
}

const baseConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: false,
};

const xbosCatalogs = [
  {
    key: 'job_titles',
    name: 'Danh muc chuc danh tap doan XeVN',
    domain: 'human_resources',
    assignedSystems: ['hrm', 'xbos'],
    items: [
      { code: 'CEO', label: 'Tong giam doc', status: 'active', unit: null },
      { code: 'CHRO', label: 'Giam doc Nhan su', status: 'active', unit: null },
      { code: 'OPS_MANAGER', label: 'Quan ly Van hanh Vung', status: 'active', unit: null },
      { code: 'WAREHOUSE_SUP', label: 'Giam sat Kho Tong', status: 'active', unit: null },
      { code: 'DRIVER_LEAD', label: 'Truong nhom Tai xe', status: 'active', unit: null },
    ],
  },
  {
    key: 'cost_centers',
    name: 'Danh muc trung tam chi phi XeVN',
    domain: 'finance_control',
    assignedSystems: ['hrm', 'xbos', 'web-portal'],
    items: [
      { code: 'CC-HN-OPS', label: 'Van hanh Ha Noi', status: 'active', unit: null },
      { code: 'CC-HCM-OPS', label: 'Van hanh TP HCM', status: 'active', unit: null },
      { code: 'CC-DN-WHS', label: 'Kho trung chuyen Da Nang', status: 'active', unit: null },
      { code: 'CC-TECH-PLT', label: 'Nen tang Cong nghe', status: 'active', unit: null },
    ],
  },
  {
    key: 'kpi_library',
    name: 'Thu vien KPI van hanh va nhan su',
    domain: 'performance_management',
    assignedSystems: ['xbos', 'hrm'],
    items: [
      { code: 'KPI_OTIF', label: 'Ty le giao dung han OTIF', status: 'active', unit: '%' },
      { code: 'KPI_ABSENCE', label: 'Ty le vang mat dot xuat', status: 'active', unit: '%' },
      { code: 'KPI_LABOR_COST', label: 'Chi phi nhan cong tren don', status: 'active', unit: 'VND/order' },
    ],
  },
];

async function seedXbos() {
  const client = new Client({ ...baseConfig, database: 'xevn_xbos' });
  await client.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.config_catalogs (
        id BIGSERIAL PRIMARY KEY,
        catalog_key TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        domain TEXT NOT NULL,
        assigned_systems JSONB NOT NULL DEFAULT '[]'::jsonb,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.config_catalog_items (
        id BIGSERIAL PRIMARY KEY,
        catalog_key TEXT NOT NULL REFERENCES public.config_catalogs(catalog_key) ON DELETE CASCADE,
        code TEXT NOT NULL,
        label TEXT NOT NULL,
        unit TEXT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        UNIQUE (catalog_key, code)
      );
    `);

    for (const catalog of xbosCatalogs) {
      await client.query(
        `
          INSERT INTO public.config_catalogs (catalog_key, name, domain, assigned_systems, updated_at)
          VALUES ($1, $2, $3, $4::jsonb, NOW())
          ON CONFLICT (catalog_key)
          DO UPDATE SET
            name = EXCLUDED.name,
            domain = EXCLUDED.domain,
            assigned_systems = EXCLUDED.assigned_systems,
            updated_at = NOW();
        `,
        [catalog.key, catalog.name, catalog.domain, JSON.stringify(catalog.assignedSystems)],
      );

      for (const item of catalog.items) {
        await client.query(
          `
            INSERT INTO public.config_catalog_items (catalog_key, code, label, unit, status)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (catalog_key, code)
            DO UPDATE SET
              label = EXCLUDED.label,
              unit = EXCLUDED.unit,
              status = EXCLUDED.status;
          `,
          [catalog.key, item.code, item.label, item.unit, item.status],
        );
      }
    }

    const countRes = await client.query(
      `SELECT COUNT(*)::int AS catalog_count FROM public.config_catalogs;`,
    );
    return { catalog_count: countRes.rows[0].catalog_count };
  } finally {
    await client.end();
  }
}

async function seedHrmSnapshot() {
  const client = new Client({ ...baseConfig, database: 'xevn_hrm' });
  await client.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.synced_catalogs (
        id BIGSERIAL PRIMARY KEY,
        catalog_key TEXT NOT NULL UNIQUE,
        source_system TEXT NOT NULL,
        payload JSONB NOT NULL,
        synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    for (const catalog of xbosCatalogs) {
      const payload = {
        key: catalog.key,
        name: catalog.name,
        domain: catalog.domain,
        assignedTo: catalog.assignedSystems,
        updatedAt: new Date().toISOString(),
        items: catalog.items,
      };
      await client.query(
        `
          INSERT INTO public.synced_catalogs (catalog_key, source_system, payload, synced_at)
          VALUES ($1, 'xbos', $2::jsonb, NOW())
          ON CONFLICT (catalog_key)
          DO UPDATE SET
            source_system = EXCLUDED.source_system,
            payload = EXCLUDED.payload,
            synced_at = NOW();
        `,
        [catalog.key, JSON.stringify(payload)],
      );
    }

    const countRes = await client.query(
      `SELECT COUNT(*)::int AS synced_count FROM public.synced_catalogs;`,
    );
    return { synced_count: countRes.rows[0].synced_count };
  } finally {
    await client.end();
  }
}

async function main() {
  const xbos = await seedXbos();
  const hrm = await seedHrmSnapshot();
  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify(
      {
        success: true,
        xbos_catalog_count: xbos.catalog_count,
        hrm_synced_catalog_count: hrm.synced_count,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(JSON.stringify({ success: false, error: error.message }, null, 2));
  process.exit(1);
});
