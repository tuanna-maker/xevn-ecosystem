#!/usr/bin/env node
/** Seed kpi_metrics + kpi_policies + kpi_sparkline_snapshots for xevn tenant via HTTP. */
import { loadDeployEnv, xbosBase, xbosHeaders } from './seed-env-loader.mjs';

loadDeployEnv();

const TENANT = 'xevn';
const COMPANY = 'xevn';

const METRICS = [
  {
    id: 'kpi-otif',
    code: 'OTIF',
    name: 'Tỷ lệ giao đúng hạn',
    unit: '%',
    category: 'Vận hành',
    targetValue: 95,
    warningThreshold: 90,
    criticalThreshold: 80,
    applicableCompanies: ['all'],
    currentValue: 92,
  },
  {
    id: 'kpi-absence',
    code: 'ABSENCE',
    name: 'Tỷ lệ vắng mặt',
    unit: '%',
    category: 'Nhân sự',
    targetValue: 3,
    warningThreshold: 5,
    criticalThreshold: 8,
    applicableCompanies: ['all'],
    currentValue: 4.2,
  },
  {
    id: 'kpi-revenue',
    code: 'REV001',
    name: 'Doanh thu vận tải',
    unit: 'tỷ VND',
    category: 'Tài chính',
    targetValue: 100,
    warningThreshold: 85,
    criticalThreshold: 70,
    applicableCompanies: ['all'],
    currentValue: 88,
  },
];

const POLICIES = [
  {
    id: 'policy-1',
    code: 'CS-2026-001',
    name: 'Chính sách KPI vận hành tập đoàn',
    description: 'Ngưỡng OTIF và SLA logistics',
    status: 'approved',
    approvedDate: '2026-01-15',
    effectiveDate: '2026-01-01',
    applicableCompanies: ['all'],
    relatedKPIs: ['OTIF'],
  },
];

const SPARKLINE = {
  points: [
    { label: 'T1', value: 88 },
    { label: 'T2', value: 90 },
    { label: 'T3', value: 91 },
    { label: 'T4', value: 89 },
    { label: 'T5', value: 92 },
    { label: 'T6', value: 93 },
  ],
};

async function upsertDomain(domain, itemId, payload) {
  const url = `${xbosBase()}/api/xbos/business-master/${encodeURIComponent(domain)}/items/${encodeURIComponent(itemId)}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: { ...xbosHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`PUT ${domain}/${itemId} ${res.status}: ${t.slice(0, 200)}`);
  }
}

async function main() {
  for (const m of METRICS) {
    const { id, ...payload } = m;
    await upsertDomain('kpi_metrics', id, payload);
  }
  await upsertDomain('kpi_policies', 'active_rows', { rows: POLICIES });
  await upsertDomain('kpi_sparkline_snapshots', 'active_series', SPARKLINE);
  console.log(`✓ Seeded ${METRICS.length} kpi_metrics, policies, sparkline for ${TENANT}/${COMPANY}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
