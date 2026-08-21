#!/usr/bin/env node
const PORTAL = 'http://127.0.0.1:5173';
const HRM = 'http://127.0.0.1:28001';
const HOLDING_UUID = '10000000-0000-4000-8000-000000000001';

function serialize(value) {
  if (typeof value === 'string') {
    const t = value.trim();
    if (!t) return 'null';
    try {
      JSON.parse(t);
      return t;
    } catch {
      return JSON.stringify(value);
    }
  }
  return JSON.stringify(value ?? null);
}

const variants = [
  { label: 'fe-style', mk: (emp) => ({
    company_id: HOLDING_UUID,
    employee_id: emp.id,
    field_key: 'job_title',
    requested_value: serialize('QA-MD-PROBE'),
    current_value: serialize(null),
    reason: 'probe',
  })},
  { label: 'no-current', mk: (emp) => ({
    company_id: HOLDING_UUID,
    employee_id: emp.id,
    field_key: 'job_title',
    requested_value: serialize('QA-MD-PROBE'),
    reason: 'probe',
  })},
  { label: 'obj-string', mk: (emp) => ({
    company_id: HOLDING_UUID,
    employee_id: emp.id,
    field_key: 'job_title',
    requested_value: JSON.stringify({ code: 'OPS_MANAGER' }),
    reason: 'probe',
  })},
  { label: 'holding-slug', mk: (emp) => ({
    company_id: 'holding',
    employee_id: emp.id,
    field_key: 'job_title',
    requested_value: JSON.stringify({ code: 'OPS_MANAGER' }),
    reason: 'probe',
  })},
  { label: 'double-encoded', mk: (emp) => ({
    company_id: HOLDING_UUID,
    employee_id: emp.id,
    field_key: 'job_title',
    requested_value: JSON.stringify(JSON.stringify('QA')),
    reason: 'probe',
  })},
  { label: 'obj+current-null', mk: (emp) => ({
    company_id: HOLDING_UUID,
    employee_id: emp.id,
    field_key: 'job_title',
    requested_value: JSON.stringify({ code: 'OPS_MANAGER2' }),
    current_value: 'null',
    reason: 'probe',
  })},
  { label: 'obj+current-omit-fe', mk: (emp) => ({
    company_id: HOLDING_UUID,
    employee_id: emp.id,
    field_key: 'job_title',
    requested_value: JSON.stringify({ title: 'QA-MD-APPR-PROBE' }),
    current_value: serialize(null),
    reason: 'Yêu cầu thay đổi metadata từ Cài đặt HRM',
    actor_user_id: 'ceo@xe.vn',
    actor_name: 'ceo@xe.vn',
  })},
];

const login = await fetch(`${PORTAL}/api/xbos/auth/login`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ email: 'ceo@xe.vn', password: 'Xevn@2026' }),
});
const lj = await login.json();
const d = lj.data || lj;
const tok = d.accessToken || d.access_token;
const er = await fetch(`${HRM}/api/hrm/employees?company_id=main&page_size=1`, {
  headers: { authorization: `Bearer ${tok}`, 'x-company-id': 'main' },
});
const ej = await er.json();
const emp = (ej.data?.data || ej.data || [])[0];
console.log('emp', { id: emp?.id, company_id: emp?.company_id });

for (const v of variants) {
  const body = v.mk(emp);
  const p = await fetch(`${HRM}/api/hrm/employee-metadata/change-requests`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${tok}`,
      'content-type': 'application/json',
      'x-company-id': 'main',
      'x-tenant-id': 'xevn',
    },
    body: JSON.stringify(body),
  });
  const pj = await p.json().catch(() => ({}));
  console.log(v.label, p.status, pj.code, pj.message, body.requested_value);
}
