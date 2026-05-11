import pg from 'pg';

const { Client } = pg;

function dbConfig() {
  return {
    host: process.env.DB_HOST ?? '113.20.107.184',
    port: Number(process.env.DB_PORT ?? '6432'),
    user: process.env.DB_USER ?? 'app1',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? 'xevn_xbos',
    ssl: false,
  };
}

async function main() {
  const client = new Client(dbConfig());
  await client.connect();
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.xbos_infrastructure_rollups (
      tenant_id TEXT NOT NULL,
      company_id TEXT NOT NULL,
      foundation_categories_count INT NOT NULL DEFAULT 0,
      sites_count INT NOT NULL DEFAULT 0,
      custom_fields_count INT NOT NULL DEFAULT 0,
      source_updated_at TIMESTAMPTZ NULL,
      rolled_up_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (tenant_id, company_id)
    );
  `);
  await client.query(`
    INSERT INTO public.xbos_infrastructure_rollups (
      tenant_id,
      company_id,
      foundation_categories_count,
      sites_count,
      custom_fields_count,
      source_updated_at,
      rolled_up_at
    )
    SELECT
      tenant_id,
      company_id,
      GREATEST(COALESCE(foundation_categories_count, 0), COALESCE(jsonb_array_length(foundation_categories), 0)),
      GREATEST(COALESCE(sites_count, 0), COALESCE(jsonb_array_length(sites), 0)),
      GREATEST(
        COALESCE(custom_fields_count, 0),
        COALESCE(
          (
            SELECT SUM(CASE WHEN jsonb_typeof(value) = 'array' THEN jsonb_array_length(value) ELSE 0 END)::int
            FROM jsonb_each(COALESCE(custom_field_defs_by_entity, '{}'::jsonb))
          ),
          0
        )
      ),
      updated_at,
      NOW()
    FROM public.xbos_infrastructure_settings
    ON CONFLICT (tenant_id, company_id)
    DO UPDATE SET
      foundation_categories_count = EXCLUDED.foundation_categories_count,
      sites_count = EXCLUDED.sites_count,
      custom_fields_count = EXCLUDED.custom_fields_count,
      source_updated_at = EXCLUDED.source_updated_at,
      rolled_up_at = NOW();
  `);
  const result = await client.query(`
    SELECT tenant_id, company_id, foundation_categories_count, sites_count, custom_fields_count, rolled_up_at
    FROM public.xbos_infrastructure_rollups
    ORDER BY rolled_up_at DESC
    LIMIT 20;
  `);
  await client.end();
  console.log(JSON.stringify({ rows: result.rows, rowCount: result.rowCount }, null, 2));
}

main().catch((error) => {
  console.error('[rollup-infra-summary] failed:', error?.message ?? error);
  process.exit(1);
});

