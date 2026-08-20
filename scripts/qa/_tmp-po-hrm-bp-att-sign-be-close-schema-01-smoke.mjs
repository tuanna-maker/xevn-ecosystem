#!/usr/bin/env node
/** PO-HRM-BP-ATT-SIGN-BE-CLOSE-SCHEMA-01 — close happy path smoke (U65 no seed). */
const HRM = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const COMPANY = process.env.QA_COMPANY_ID || 'main';
const TENANT = process.env.QA_TENANT_ID || 'xevn';
const SHEET_ID = process.env.QA_SHEET_ID || '642a4713-b0ee-4802-a1d9-2fe650cbc17f';

async function login() {
  const r = await fetch(`${XBOS}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const j = await r.json().catch(() => ({}));
  const data = j?.data ?? j;
  const token = data?.accessToken ?? data?.access_token;
  if (!token) throw new Error(`login failed ${r.status}`);
  return token;
}

const PERSONAS = [
  { step_code: 'sign_employee', persona_role: 'employee', outcome: 'approved' },
  { step_code: 'sign_direct_manager', persona_role: 'direct_manager', outcome: 'approved' },
  { step_code: 'sign_hr', persona_role: 'hr_admin', outcome: 'approved' },
];

async function main() {
  const token = await login();
  const headers = {
    authorization: `Bearer ${token}`,
    'x-tenant-id': TENANT,
    'content-type': 'application/json',
  };
  const base = `${HRM}/api/hrm/attendance/attendance-sheets/${SHEET_ID}`;

  const sigList = await fetch(`${base}/signatures?company_id=${COMPANY}`, { headers });
  const sigJson = await sigList.json().catch(() => ({}));

  for (const p of PERSONAS) {
    const existing = sigJson?.data?.steps ?? sigJson?.steps ?? [];
    if (Array.isArray(existing) && existing.some((s) => s.persona_role === p.persona_role && s.outcome === 'approved')) {
      continue;
    }
    const res = await fetch(`${base}/signatures?company_id=${COMPANY}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(p),
    });
    if (res.status === 409) continue;
    if (!res.ok && res.status !== 201) {
      const body = await res.text();
      console.log(JSON.stringify({ ok: false, phase: 'sign', status: res.status, body: body.slice(0, 400) }, null, 2));
      process.exit(1);
    }
  }

  const closeRes = await fetch(`${base}/close?company_id=${COMPANY}`, { method: 'POST', headers });
  const closeBody = await closeRes.text();
  let closeJson;
  try {
    closeJson = JSON.parse(closeBody);
  } catch {
    closeJson = { raw: closeBody.slice(0, 500) };
  }

  const out = {
    work_item_id: 'PO-HRM-BP-ATT-SIGN-BE-CLOSE-SCHEMA-01',
    sheetId: SHEET_ID,
    close: { status: closeRes.status, body: closeJson },
    pass: closeRes.status >= 200 && closeRes.status < 300,
    schema500: closeRes.status === 500 && String(closeBody).includes('closed_at'),
  };
  console.log(JSON.stringify(out, null, 2));
  process.exit(out.pass ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
