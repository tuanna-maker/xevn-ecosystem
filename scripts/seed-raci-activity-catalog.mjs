#!/usr/bin/env node
/**
 * Import ma trận RACI từ docs/ma trận chức năng RACI.md → JSON seed + PostgreSQL.
 * Usage: pnpm seed:raci:catalog
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { loadMigrateEnv, effectiveDatabaseUrl } from './migrate-env-loader.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

/** Khớp apps/web/web-portal/src/data/xevn-raci-catalog.ts */
const ORG_COLUMN_IDS = [
  'dhcd',
  'hdqt',
  'ceo',
  'ban_kiem_soat',
  'giam_sat_an_toan',
  'ptgd_noi_chinh',
  'tckt',
  'hcns',
  'ptgd_van_hanh',
  'xuong_sua_chua',
  'coo',
  'van_tai_hanh_khach',
  'van_tai_hang_hoa',
  'kho_phan_phoi',
  'ptgd_kinh_doanh',
  'kinh_doanh',
  'marketing',
  'cong_ty_thanh_vien',
];

const DOMAIN_MAP = [
  { pattern: /^BAN QUẢN TRỊ/i, code: 'ban_quan_tri', label: 'Ban Quản trị', prefix: 'BQT' },
  { pattern: /^BAN ĐIỀU HÀNH/i, code: 'ban_dieu_hanh', label: 'Ban Điều hành', prefix: 'BDH' },
  { pattern: /^PHÒNG KINH DOANH/i, code: 'phong_kinh_doanh', label: 'Phòng Kinh doanh', prefix: 'PKD' },
  { pattern: /^PHÒNG VẬN TẢI/i, code: 'phong_van_tai', label: 'Phòng Vận tải', prefix: 'PVT' },
  { pattern: /^PHÒNG KSNB/i, code: 'phong_ksnb', label: 'Phòng KSNB', prefix: 'KSNB' },
  { pattern: /^Phòng TCKT/i, code: 'phong_tckt', label: 'Phòng TCKT', prefix: 'TCKT' },
  { pattern: /^Phòng HCNS/i, code: 'phong_hcns', label: 'Phòng HCNS', prefix: 'HCNS' },
  { pattern: /^Phòng Maketing/i, code: 'phong_marketing', label: 'Phòng Marketing', prefix: 'MKT' },
  { pattern: /^Phòng SHE/i, code: 'phong_she', label: 'Phòng SHE', prefix: 'SHE' },
];

const SOURCE_REF = 'docs/ma trận chức năng RACI.md';
const CANONICAL_SOURCE = 'apps/api/xbos-api/data/raci-matrix-source.md';
const VERSION_LABEL = '2026-05-xevn-v1';
const DEFAULT_TENANT =
  process.env.SEED_TENANT_ID?.trim() ||
  process.env.MASTER_TENANT_ID?.trim() ||
  'xevn';

function parseMarkdown(content) {
  const lines = content.split(/\r?\n/);
  let domain = DOMAIN_MAP[0];
  const domainCounters = {};
  const activities = [];

  for (const raw of lines) {
    const line = raw.replace(/\r$/, '');
    const trimmed = line.trim();
    if (!trimmed) continue;

    const domainHit = DOMAIN_MAP.find((d) => d.pattern.test(trimmed));
    if (domainHit && !/^\d+\t/.test(line) && !/^\d+(\t|$)/.test(trimmed)) {
      domain = domainHit;
      continue;
    }

    const parts = line.split('\t');
    const seqToken = (parts[0] ?? '').trim();
    if (!/^\d+$/.test(seqToken)) continue;

    const seq = Number(seqToken);
    const name = (parts[1] ?? '').trim();
    if (!name) continue;

    const colValues = parts.slice(2).map((c) => c.trim().replace(/\s+/g, ''));
    while (colValues.length < ORG_COLUMN_IDS.length) colValues.push('');
    const matrix = {};
    ORG_COLUMN_IDS.forEach((colId, i) => {
      const letters = colValues[i] ?? '';
      if (letters) matrix[colId] = letters;
    });

    domainCounters[domain.code] = (domainCounters[domain.code] ?? 0) + 1;
    const seqInDomain = domainCounters[domain.code];
    const activityCode = `${domain.prefix}-${String(seqInDomain).padStart(3, '0')}`;

    activities.push({
      activity_code: activityCode,
      domain_code: domain.code,
      domain_label: domain.label,
      seq_no: seq,
      name,
      default_matrix: matrix,
    });
  }

  return activities;
}

function createPgClient() {
  const database = process.env.DB_NAME_XBOS?.trim() || process.env.DB_NAME?.trim() || 'xevn_xbos';
  const url =
    effectiveDatabaseUrl(process.env.DATABASE_URL_XBOS) ||
    effectiveDatabaseUrl(process.env.DATABASE_URL);
  if (url) return new pg.Client({ connectionString: url, ssl: false });
  if (process.env.DB_HOST?.trim() && process.env.DB_PORT?.trim() && process.env.DB_USER?.trim()) {
    return new pg.Client({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD ?? '',
      database,
      ssl: false,
    });
  }
  return null;
}

async function upsertPostgres(tenantId, activities) {
  const client = createPgClient();
  if (!client) {
    console.warn('⚠ Thiếu DB_HOST/DB_PORT/DB_USER hoặc DATABASE_URL_XBOS — bỏ qua ghi PostgreSQL (chỉ ghi JSON).');
    return false;
  }
  await client.connect();
  try {
    await client.query('BEGIN');
    const ver = await client.query(
      `INSERT INTO public.raci_catalog_version (tenant_id, version_label, source_ref, status)
       VALUES ($1, $2, $3, 'active')
       ON CONFLICT (tenant_id, version_label) DO UPDATE SET source_ref = EXCLUDED.source_ref
       RETURNING id`,
      [tenantId, VERSION_LABEL, SOURCE_REF],
    );
    const versionId = ver.rows[0].id;

    await client.query(
      `UPDATE public.raci_catalog_version SET status = 'archived'
       WHERE tenant_id = $1 AND id <> $2 AND status = 'active'`,
      [tenantId, versionId],
    );

    for (const a of activities) {
      await client.query(
        `INSERT INTO public.raci_activity_catalog (
          tenant_id, catalog_version_id, activity_code, domain_code, domain_label,
          seq_no, name, default_matrix
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb)
        ON CONFLICT (tenant_id, catalog_version_id, activity_code) DO UPDATE SET
          domain_code = EXCLUDED.domain_code,
          domain_label = EXCLUDED.domain_label,
          seq_no = EXCLUDED.seq_no,
          name = EXCLUDED.name,
          default_matrix = EXCLUDED.default_matrix,
          updated_at = NOW()`,
        [
          tenantId,
          versionId,
          a.activity_code,
          a.domain_code,
          a.domain_label,
          a.seq_no,
          a.name,
          JSON.stringify(a.default_matrix),
        ],
      );
    }

    await client.query('COMMIT');
    console.log(`✓ PostgreSQL: ${activities.length} activities (tenant=${tenantId}, version=${VERSION_LABEL})`);
    return true;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    await client.end();
  }
}

function resolveSourceContent() {
  const candidates = [
    resolve(root, CANONICAL_SOURCE),
    resolve(root, SOURCE_REF),
    resolve(root, 'docs/raci/ma-tran-chuc-nang-raci.md'),
  ];
  for (const p of candidates) {
    if (!existsSync(p)) continue;
    const content = readFileSync(p, 'utf8');
    if (content.includes('MA CHỨC NĂNG (RACI)')) {
      return { content, sourceRef: p.replace(`${root}/`, '') };
    }
  }
  throw new Error(
    'Không tìm thấy ma trận RACI. Lưu file docs/ma trận chức năng RACI.md (266 dòng) hoặc copy sang ' +
      CANONICAL_SOURCE,
  );
}

async function main() {
  loadMigrateEnv('xbos');
  const { content, sourceRef } = resolveSourceContent();
  const activities = parseMarkdown(content);

  const payload = {
    version_label: VERSION_LABEL,
    source_ref: sourceRef,
    org_column_ids: ORG_COLUMN_IDS,
    activities,
    generated_at: new Date().toISOString(),
  };

  const outDir = resolve(root, 'apps/api/xbos-api/data');
  mkdirSync(outDir, { recursive: true });
  const jsonPath = resolve(outDir, 'raci-catalog.seed.json');
  writeFileSync(jsonPath, JSON.stringify(payload, null, 2), 'utf8');
  console.log(`✓ JSON: ${jsonPath} (${activities.length} activities)`);

  const byDomain = activities.reduce((acc, a) => {
    acc[a.domain_code] = (acc[a.domain_code] ?? 0) + 1;
    return acc;
  }, {});
  console.log('  Domains:', byDomain);

  await upsertPostgres(DEFAULT_TENANT, activities);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
