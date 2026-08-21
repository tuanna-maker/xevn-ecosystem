const PORTAL = 'http://127.0.0.1:5173';
const HRM = 'http://127.0.0.1:28001';
const contractId = '17d1a4d4-e7d9-4ab5-bdcb-0908b112f25f';
const vid = '67e17dee-dd67-42c9-bbab-b9aa87b3c4e3';
const clauseId = 'dbfc8137-7311-4988-aff0-bafa8b7b8f66';
const code = 'CL_IS_CLQA3-KMJRGF';

const lr = await fetch(`${PORTAL}/api/xbos/auth/login`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ email: 'ceo@xe.vn', password: 'Xevn@2026' }),
});
const lj = await lr.json();
const data = lj.data ?? lj;
const token = data.accessToken ?? data.access_token;
if (!token) {
  console.error('login fail', lr.status);
  process.exit(1);
}

const gv = await fetch(
  `${HRM}/api/hrm/contracts-insurance/contracts/${contractId}/print-versions/${vid}?company_id=main`,
  { headers: { Authorization: `Bearer ${token}` } },
);
const gj = await gv.json();
const snap = gj.data?.clauses_snapshot_json ?? gj.clauses_snapshot_json;
const codes = Array.isArray(snap) ? snap.map((c) => c.code) : [];
const has = codes.some((c) => String(c).toLowerCase() === code.toLowerCase());
let bodyV1 = null;
if (Array.isArray(snap)) {
  const row = snap.find((c) => String(c?.code ?? '').toLowerCase() === code.toLowerCase());
  bodyV1 = row?.body_vi?.slice(0, 80);
}

const patch = await fetch(
  `${HRM}/api/hrm/contracts-insurance/contract-clauses/${clauseId}?company_id=main`,
  {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ body_vi: `Freeze marker V3 RETEST QA04 ${Date.now()}` }),
  },
);
const pjs = await patch.json().catch(() => ({}));

const gv2 = await fetch(
  `${HRM}/api/hrm/contracts-insurance/contracts/${contractId}/print-versions/${vid}?company_id=main`,
  { headers: { Authorization: `Bearer ${token}` } },
);
const gj2 = await gv2.json();
const snap2 = gj2.data?.clauses_snapshot_json ?? gj.clauses_snapshot_json;
const snapUnchanged = JSON.stringify(snap) === JSON.stringify(snap2);

console.log(
  JSON.stringify(
    {
      getPv: { status: gv.status, code: gj.code },
      codesInSnap: codes,
      hasClauseCode: has,
      bodyV1InSnap: bodyV1,
      snapLen: snap ? JSON.stringify(snap).length : 0,
      patch: { status: patch.status, code: pjs.code, message: pjs.message },
      ac03_snapUnchangedAfterPatchAttempt: snapUnchanged,
    },
    null,
    2,
  ),
);
