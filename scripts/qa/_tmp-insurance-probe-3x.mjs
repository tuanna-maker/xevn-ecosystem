/** One-off probe for TC-HDSD-06-03-01 — insurance list 3×200 */
const XBOS = 'http://127.0.0.1:28002';
const HRM = 'http://127.0.0.1:28001';
const EMAIL = 'ceo@xe.vn';
const PASSWORD = 'Xevn@2026';

async function login() {
  const r = await fetch(`${XBOS}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const j = await r.json();
  const token = j?.data?.accessToken ?? j?.accessToken;
  if (!token) throw new Error(`login fail ${r.status}`);
  return token;
}

async function probe(token, run) {
  const headers = {
    Authorization: `Bearer ${token}`,
    'x-tenant-id': 'xevn',
    'x-company-id': 'main',
  };
  const url = `${HRM}/api/hrm/contracts-insurance/insurance?company_id=main&page=1&page_size=20`;
  const r = await fetch(url, { headers });
  const text = await r.text();
  return { run, status: r.status, ok: r.ok, snippet: text.slice(0, 120) };
}

const token = await login();
const runs = [];
for (let i = 1; i <= 3; i++) {
  runs.push(await probe(token, i));
  await new Promise((r) => setTimeout(r, 500));
}
const all200 = runs.every((x) => x.status === 200);
console.log(JSON.stringify({ all200, runs }, null, 2));
process.exit(all200 ? 0 : 2);
