const PORTAL = 'http://127.0.0.1:5173';
const HRM = 'http://127.0.0.1:28001';
const cid = '17d1a4d4-e7d9-4ab5-bdcb-0908b112f25f';
const vid = '67e17dee-dd67-42c9-bbab-b9aa87b3c4e3';
const code = 'CL_IS_CLQA3-KMJRGF';
const lr = await fetch(`${PORTAL}/api/xbos/auth/login`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ email: 'ceo@xe.vn', password: 'Xevn@2026' }),
});
const lrText = await lr.text();
let lj = {};
try {
  lj = JSON.parse(lrText);
} catch {
  console.log(JSON.stringify({ loginFail: lr.status, body: lrText.slice(0, 200) }));
  process.exit(1);
}
const t = (lj.data ?? lj).accessToken;
if (!t) {
  console.log(JSON.stringify({ loginFail: lr.status, lj: String(lrText).slice(0, 300) }));
  process.exit(1);
}
const r = await fetch(
  `${HRM}/api/hrm/contracts-insurance/contracts/${cid}/print-versions/${vid}?company_id=main`,
  { headers: { Authorization: `Bearer ${t}` } },
);
const j = await r.json();
const data = j?.data ?? j;
const snap = JSON.stringify(data?.clauses_snapshot_json ?? data);
console.log(
  JSON.stringify({
    status: r.status,
    apiCode: j?.code,
    snapLen: snap.length,
    hasClauseCode: snap.includes(code),
    hasV1: snap.includes('Freeze marker V1'),
    statusField: data?.status,
  }),
);
