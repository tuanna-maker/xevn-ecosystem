#!/usr/bin/env node
/**
 * L1 probe for REC-04 — list open_for_hire + internal-scan route seal
 */
const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';

async function main() {
  const login = await fetch(`${PORTAL}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'ceo@xe.vn', password: 'Xevn@2026' }),
  });
  const lj = await login.json();
  const token = lj?.data?.accessToken || lj?.accessToken;
  if (!token) throw new Error(`login fail ${login.status}`);
  const h = {
    authorization: `Bearer ${token}`,
    'x-tenant-id': 'xevn',
    'x-company-id': 'main',
    'content-type': 'application/json',
  };

  const list = await fetch(`${HRM}/api/hrm/recruitment/requisitions?company_id=main&page_size=100`, {
    headers: h,
  });
  const j = await list.json();
  const rows = j?.data?.data || j?.data || [];
  const by = {};
  for (const r of rows) by[r.status] = (by[r.status] || 0) + 1;
  const open = rows.filter((r) => r.status === 'open_for_hire');
  console.log(JSON.stringify({ listStatus: list.status, count: rows.length, by, open: open.length }, null, 2));
  for (const r of open.slice(0, 12)) {
    console.log(
      'OPEN',
      JSON.stringify({
        id: r.id,
        title: r.title,
        company_id: r.company_id,
        position_key: r.position_key || r.req_position_key,
        flags: r.pipeline_flags,
      }),
    );
  }

  const nest = await fetch(`${HRM}/api/hrm/rec/candidates-pool?company_id=main`, { headers: h });
  console.log('NEST_REC', nest.status, (await nest.text()).slice(0, 200));

  const fakeScan = await fetch(
    `${HRM}/api/hrm/recruitment/requisitions/00000000-0000-4000-8000-000000000001/internal-scan?company_id=main`,
    { method: 'POST', headers: h, body: JSON.stringify({ action: 'complete' }) },
  );
  console.log('SCAN_ROUTE', fakeScan.status, (await fakeScan.text()).slice(0, 280));

  if (open[0]) {
    const rid = open[0].id;
    const company = open[0].company_id || 'main';
    const pos = open[0].position_key || open[0].req_position_key || 'driver';
    const pool = await fetch(
      `${HRM}/api/hrm/recruitment/candidates-pool?company_id=${encodeURIComponent(company)}&for=internal_scan&requisition_id=${rid}&position_code=${encodeURIComponent(pos)}&skill=logistics&page_size=5`,
      { headers: { ...h, 'x-company-id': company } },
    );
    console.log('POOL', pool.status, (await pool.text()).slice(0, 320));

    const pg = await fetch(
      `${HRM}/api/hrm/recruitment/requisitions/${rid}/pipeline-flags?company_id=${encodeURIComponent(company)}`,
      {
        method: 'PATCH',
        headers: { ...h, 'x-company-id': company },
        body: JSON.stringify({ posted: true }),
      },
    );
    console.log('POSTED_GATE', pg.status, (await pg.text()).slice(0, 320));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
