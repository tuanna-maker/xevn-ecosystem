#!/usr/bin/env node
/** PO-HRM-MVP-GD1-PAY-09-CLUSTER-BE-02 — live SQL fix probes (U65, no seed) */
const HRM = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const COMPANY = process.env.QA_COMPANY_ID || 'main';
const TENANT = process.env.QA_TENANT_ID || 'xevn';

async function login() {
  const r = await fetch(`${XBOS}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const j = await r.json();
  const d = j?.data ?? j;
  return d?.accessToken ?? d?.access_token;
}

async function api(token, method, path, body) {
  const headers = {
    authorization: `Bearer ${token}`,
    'x-company-id': COMPANY,
    'x-tenant-id': TENANT,
    'content-type': 'application/json',
  };
  const init = { method, headers };
  if (body !== undefined) init.body = JSON.stringify(body);
  const res = await fetch(`${HRM}/api/hrm${path}`, init);
  const parsed = await res.json().catch(() => ({}));
  return { status: res.status, code: parsed?.code ?? parsed?.error?.code, data: parsed?.data ?? parsed };
}

const token = await login();
if (!token) {
  console.error('login failed');
  process.exit(1);
}

const uniq = `B02${Date.now().toString(36).toUpperCase()}`;
const group = await api(token, 'POST', '/payroll/groups', {
  company_id: COMPANY,
  code: uniq,
  name_vi: `Probe ${uniq}`,
  priority: 10,
  match_rule_json: { position_keys: ['NV_KD'] },
});
const groupId = group.data?.id;
const list = await api(token, 'GET', `/payroll/periods?company_id=${COMPANY}`);
const stamp = Date.now();
const year = 2090 + Math.floor((stamp / 1000) % 8);
const month = String(1 + (stamp % 12)).padStart(2, '0');
const dayEnd = month === '02' ? '28' : '30';
const create = await api(token, 'POST', '/payroll/periods', {
  company_id: COMPANY,
  period_label: `BE02-${stamp}`,
  start_date: `${year}-${month}-01`,
  end_date: `${year}-${month}-${dayEnd}`,
  payroll_group_id: groupId,
});
const periodId = create.data?.id;
const elig = periodId
  ? await api(token, 'GET', `/payroll/periods/${periodId}/eligibility?payroll_group_id=${groupId}`)
  : { status: 0, code: 'NO_PERIOD' };
const members = groupId && periodId
  ? await api(token, 'GET', `/payroll/groups/${groupId}/members?period_id=${periodId}`)
  : { status: 0, code: 'NO_GROUP' };

const out = {
  group_create: { status: group.status, code: group.code, id: groupId },
  periods_list: { status: list.status, code: list.code },
  period_create: { status: create.status, code: create.code, id: periodId },
  eligibility: { status: elig.status, code: elig.code },
  members: { status: members.status, code: members.code },
};
console.log(JSON.stringify(out, null, 2));
const ok =
  group.status === 201 &&
  list.status === 200 &&
  create.status === 201 &&
  elig.status === 200 &&
  members.status === 200;
process.exit(ok ? 0 : 1);
