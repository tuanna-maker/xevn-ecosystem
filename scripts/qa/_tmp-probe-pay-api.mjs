const X = 'http://127.0.0.1:28002';
const H = 'http://127.0.0.1:28001';
const lr = await fetch(`${X}/api/xbos/auth/login`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ email: 'ceo@xe.vn', password: 'Xevn@2026' }),
});
const t = (await lr.json()).data.accessToken;
const h = { Authorization: `Bearer ${t}`, 'x-company-id': 'main', 'x-tenant-id': 'xevn', 'content-type': 'application/json' };

const create = await fetch(`${H}/api/hrm/payroll/periods`, {
  method: 'POST',
  headers: h,
  body: JSON.stringify({
    company_id: 'main',
    period_label: `QA-ATT412-${Date.now()}`,
    start_date: '2026-11-01',
    end_date: '2026-11-30',
  }),
});
const cj = await create.json();
console.log('create', create.status, cj.code, JSON.stringify(cj.data));
const id = cj.data?.id;
if (!id) process.exit(1);

const elig = await fetch(`${H}/api/hrm/payroll/periods/${id}/eligibility?company_id=main`, { headers: h });
console.log('eligibility', elig.status, (await elig.json()).code);

const proc = await fetch(`${H}/api/hrm/payroll/periods/${id}/process`, { method: 'POST', headers: h, body: '{}' });
const pj = await proc.json();
console.log('process', proc.status, pj.code, pj.message);

const enroll = await fetch(`${H}/api/hrm/payroll/periods/${id}/enroll`, {
  method: 'POST',
  headers: h,
  body: JSON.stringify({ mode: 'auto_eligible' }),
});
const ej = await enroll.json();
console.log('enroll', enroll.status, ej.code, ej.message);
