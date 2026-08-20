const XBOS = 'http://127.0.0.1:28002';
const HRM = 'http://127.0.0.1:28001';
const PORTAL = 'http://127.0.0.1:5173';

const login = await (
  await fetch(`${XBOS}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'ceo@xe.vn', password: 'Xevn@2026' }),
  })
).json();
const token = login?.data?.accessToken || login?.accessToken;
console.log('login', login.code, !!token);
console.log('userKeys', Object.keys(login?.data?.user || {}));
console.log('user.company', login?.data?.user?.companyId, login?.data?.user?.company_id);

const headers = {
  authorization: `Bearer ${token}`,
  'content-type': 'application/json',
  'x-company-id': 'main',
};

for (const q of [
  '/api/hrm/employees?page=1&limit=5',
  '/api/hrm/employees?page=1&pageSize=5',
  '/api/hrm/employees?companyId=main&page=1&limit=5',
  '/api/hrm/employees?companyId=holding&page=1&limit=5',
  '/api/hrm/employees?company_id=holding&page=1&limit=5',
]) {
  const r = await fetch(`${HRM}${q}`, { headers });
  const t = await r.text();
  console.log(r.status, q, t.slice(0, 280));
}

for (const p of ['/hr/', '/hr/decisions', '/hr/employees', '/command-center/hrm/decisions']) {
  const r = await fetch(`${PORTAL}${p}`);
  const t = await r.text();
  console.log(
    'portal',
    p,
    r.status,
    'len',
    t.length,
    'title',
    (t.match(/<title>([^<]*)/) || [])[1],
    'iframe',
    /iframe/i.test(t),
  );
}
