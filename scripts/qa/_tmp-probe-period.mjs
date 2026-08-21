const X = 'http://127.0.0.1:28002';
const H = 'http://127.0.0.1:28001';
const id = process.argv[2] || 'f9f87915-7bcc-4591-9fb1-24fa4713a910';
const lr = await fetch(`${X}/api/xbos/auth/login`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ email: 'ceo@xe.vn', password: 'Xevn@2026' }),
});
const t = (await lr.json()).data.accessToken;
const h = { Authorization: `Bearer ${t}`, 'x-company-id': 'main', 'x-tenant-id': 'xevn' };
const r = await fetch(`${H}/api/hrm/payroll/periods/${id}?company_id=main`, { headers: h });
console.log('GET period', r.status, await r.text());
const e = await fetch(`${H}/api/hrm/payroll/periods/${id}/eligibility?company_id=main`, { headers: h });
console.log('GET eligibility', e.status, (await e.text()).slice(0, 300));
