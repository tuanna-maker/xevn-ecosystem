#!/usr/bin/env node
/** BE-03 live smoke — J-04 compensatory balance after OT approve replay (ledger sync). */
const HRM = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
const EMAIL = 'ceo@xe.vn';
const PASSWORD = 'Xevn@2026';
const COMPANY = 'main';
const TENANT = 'xevn';
const EMP = '2b4cbc90-fb74-4a2d-9fef-d188d4e48d61';
const OT_ID = 'a7925db0-b6d1-4ea8-96c5-74ce9cfe86bc';

async function login() {
  const r = await fetch(`${XBOS}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const j = await r.json();
  const d = j?.data ?? j;
  const token = d?.accessToken ?? d?.access_token;
  if (!r.ok || !token) throw new Error(`login ${r.status}`);
  return token;
}

async function hrm(token, method, path, body, companyId = COMPANY) {
  const r = await fetch(`${HRM}/api/hrm${path}`, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      'x-tenant-id': TENANT,
      'x-company-id': companyId,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const j = await r.json().catch(() => ({}));
  return { status: r.status, body: j };
}

async function main() {
  const token = await login();
  const before = await hrm(
    token,
    'GET',
    `/attendance/leave-balance?employee_id=${EMP}&leave_type=compensatory&company_id=${COMPANY}`,
  );
  const approve = await hrm(
    token,
    'POST',
    `/attendance/overtime-requests/${OT_ID}/approve`,
    { reviewer_name: 'CEO XeVN · BE-03 smoke' },
    'holding',
  );
  const after = await hrm(
    token,
    'GET',
    `/attendance/leave-balance?employee_id=${EMP}&leave_type=compensatory&company_id=${COMPANY}`,
  );
  const out = {
    at: new Date().toISOString(),
    before: {
      status: before.status,
      entitled_days: before.body?.data?.entitled_days ?? before.body?.entitled_days,
      source: before.body?.data?.source ?? before.body?.source,
      raw: before.body,
    },
    approve: {
      status: approve.status,
      accrual: approve.body?.data?.accrual ?? approve.body?.accrual,
      raw: approve.body,
    },
    after: {
      status: after.status,
      entitled_days: after.body?.data?.entitled_days ?? after.body?.entitled_days,
      source: after.body?.data?.source ?? after.body?.source,
    },
    pass_j04:
      after.status === 200 &&
      Number(after.body?.data?.entitled_days ?? after.body?.entitled_days ?? 0) >= 0.5 &&
      (after.body?.data?.source ?? after.body?.source) === 'employee_leave_balances',
  };
  console.log(JSON.stringify(out, null, 2));
  process.exit(out.pass_j04 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
