import { writeFileSync } from 'node:fs';

const login = await fetch('http://127.0.0.1:28002/api/xbos/auth/login', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ email: 'ceo@xe.vn', password: 'Xevn@2026' }),
});
const lj = await login.json();
const token = lj.data.accessToken;
const p = await fetch('http://127.0.0.1:28001/api/hrm/payroll/periods?company_id=main', {
  headers: {
    Authorization: `Bearer ${token}`,
    'x-tenant-id': 'xevn',
    'x-company-id': 'main',
  },
});
const b = await p.json();
const data = Array.isArray(b.data) ? b.data : [];
const occupied = new Set(
  data.map((x) => `${Number(x.period_month || x.month)}-${Number(x.period_year || x.year)}`),
);
const free = [];
for (const y of [2026, 2027]) {
  for (let m = 1; m <= 12; m++) {
    const k = `${m}-${y}`;
    if (!occupied.has(k)) free.push({ month: m, year: y });
  }
}
const out = {
  count: data.length,
  occupied: [...occupied].sort(),
  free: free.slice(0, 20),
  sample: data.slice(0, 5).map((x) => ({
    id: x.id,
    label: x.period_label,
    m: x.period_month || x.month,
    y: x.period_year || x.year,
    tpl: x.pay_sheet_template_id,
    snap: x.sheet_template_snapshot_json?.template_name,
  })),
};
writeFileSync('docs/qa/evidence/_tmp-paybind-qa02-months.json', JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
