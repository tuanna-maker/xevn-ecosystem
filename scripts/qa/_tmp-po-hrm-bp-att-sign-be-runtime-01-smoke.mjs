#!/usr/bin/env node
/** PO-HRM-BP-ATT-SIGN-BE-RUNTIME-01 — route registration smoke (not 404). U65: no seed. */
const HRM = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const COMPANY = process.env.QA_COMPANY_ID || 'main';
const TENANT = process.env.QA_TENANT_ID || 'xevn';

async function login() {
  for (const url of [`${XBOS}/api/xbos/auth/login`]) {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
    });
    const j = await r.json().catch(() => ({}));
    const data = j?.data ?? j;
    const token = data?.accessToken ?? data?.access_token;
    if (token) return token;
  }
  throw new Error('login failed');
}

async function main() {
  const token = await login();
  const headers = {
    authorization: `Bearer ${token}`,
    'x-tenant-id': TENANT,
    'content-type': 'application/json',
  };

  const listUrl = `${HRM}/api/hrm/attendance/attendance-sheets?company_id=${COMPANY}`;
  const listRes = await fetch(listUrl, { headers });
  const listJson = await listRes.json().catch(() => ({}));
  const rows = listJson?.data?.data ?? listJson?.data?.items ?? listJson?.data ?? [];
  const draft = (Array.isArray(rows) ? rows : []).find((r) => r?.status === 'draft') ?? rows[0];
  const sheetId = draft?.id;
  if (!sheetId) {
    console.log(JSON.stringify({ ok: false, reason: 'no_sheet_id', listStatus: listRes.status }, null, 2));
    process.exit(1);
  }

  const sigUrl = `${HRM}/api/hrm/attendance/attendance-sheets/${sheetId}/signatures?company_id=${COMPANY}`;
  const sigRes = await fetch(sigUrl, { headers });
  const submitUrl = `${HRM}/api/hrm/attendance/attendance-sheets/${sheetId}/submit?company_id=${COMPANY}`;
  const submitRes = await fetch(submitUrl, { method: 'POST', headers });

  const out = {
    work_item_id: 'PO-HRM-BP-ATT-SIGN-BE-RUNTIME-01',
    sheetId,
    listStatus: listRes.status,
    getSignatures: { status: sigRes.status, not404: sigRes.status !== 404 },
    postSubmit: { status: submitRes.status, not404: submitRes.status !== 404 },
    pass: sigRes.status !== 404 && submitRes.status !== 404,
  };
  console.log(JSON.stringify(out, null, 2));
  process.exit(out.pass ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
