#!/usr/bin/env node
/** P4 — seed department_catalog, geographic_regions, kpi_formulas for xevn. */
import { loadDeployEnv, xbosBase, xbosHeaders } from './seed-env-loader.mjs';

loadDeployEnv();

const TENANT = 'xevn';
const COMPANY = 'xevn';

async function upsert(domain, itemId, payload) {
  const url = `${xbosBase()}/api/xbos/business-master/${encodeURIComponent(domain)}/items/${encodeURIComponent(itemId)}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: { ...xbosHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`${domain}/${itemId} ${res.status}`);
}

const departments = [
  { id: 'dept-hcns', code: 'HCNS', nameVi: 'Phòng Nhân sự tập đoàn', description: 'HR shared services', status: 'active' },
  { id: 'dept-ops', code: 'OPS', nameVi: 'Phòng Vận hành', description: 'Điều phối vận tải', status: 'active' },
  { id: 'dept-fin', code: 'FIN', nameVi: 'Phòng Tài chính', description: 'Kế toán tập đoàn', status: 'active' },
];

const regions = [
  { id: 'reg-north', code: 'MB', nameVi: 'Miền Bắc', country: 'VN', status: 'active' },
  { id: 'reg-south', code: 'MN', nameVi: 'Miền Nam', country: 'VN', status: 'active' },
  { id: 'reg-central', code: 'MT', nameVi: 'Miền Trung', country: 'VN', status: 'active' },
];

const formulas = [
  {
    id: 'f-otif',
    code: 'F-OTIF',
    nameVi: 'OTIF = giao đúng / tổng đơn',
    expression: 'delivered_on_time / total_shipments * 100',
    linkedMetricCodes: ['OTIF'],
    status: 'active',
  },
  {
    id: 'f-abs',
    code: 'F-ABS',
    nameVi: 'Vắng mặt = ngày vắng / ngày công',
    expression: 'absence_days / work_days * 100',
    linkedMetricCodes: ['ABSENCE'],
    status: 'active',
  },
];

async function main() {
  for (const row of departments) {
    const { id, ...p } = row;
    await upsert('department_catalog', id, p);
  }
  for (const row of regions) {
    const { id, ...p } = row;
    await upsert('geographic_regions', id, p);
  }
  for (const row of formulas) {
    const { id, ...p } = row;
    await upsert('kpi_formulas', id, p);
  }
  console.log('✓ P4 settings master data seeded');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
