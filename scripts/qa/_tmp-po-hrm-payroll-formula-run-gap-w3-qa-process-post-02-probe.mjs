#!/usr/bin/env node
/** Probe draft periods + closed ATT sheets for W3-QA-PROCESS-POST-02 */
const PORTAL = 'http://127.0.0.1:5173';
const HRM = 'http://127.0.0.1:28001';
const XBOS = 'http://127.0.0.1:28002';
const EMAIL = 'ceo@xe.vn';
const PASSWORD = 'Xevn@2026';
const COMPANY = 'main';
const TENANT = 'xevn';
const SKIP = 'd92d3bbb-f53a-4151-9b12-0ebe9dd27d25';

async function login() {
  for (const url of [`${PORTAL}/api/xbos/auth/login`, `${XBOS}/api/xbos/auth/login`]) {
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
  throw new Error('login fail');
}

async function api(token, path) {
  const r = await fetch(`${HRM}/api/hrm${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'x-tenant-id': TENANT,
      'x-company-id': COMPANY,
      Accept: 'application/json',
    },
  });
  const j = await r.json().catch(() => ({}));
  return { status: r.status, data: j?.data ?? j, code: j?.code, raw: j };
}

function vnMonthYear(iso) {
  if (!iso) return { month: null, year: null };
  const d = new Date(iso);
  const vn = new Date(d.getTime() + 7 * 3600_000);
  return { month: vn.getUTCMonth() + 1, year: vn.getUTCFullYear() };
}

const token = await login();
const periods = await api(token, `/payroll/periods?company_id=${COMPANY}`);
const periodList = periods.data?.data ?? (Array.isArray(periods.data) ? periods.data : []);
console.log('periods', periods.status, 'n=', periodList.length);

const sheets = await api(token, `/attendance/attendance-sheets?company_id=${COMPANY}&page_size=80`);
const sheetRows = sheets.data?.data ?? (Array.isArray(sheets.data) ? sheets.data : []);
const closedSheets = sheetRows.filter((s) => String(s.status || '').toLowerCase() === 'closed');
console.log('sheets', sheets.status, 'n=', sheetRows.length, 'closed=', closedSheets.length);

const closedKeys = new Set(
  closedSheets.map((s) => {
    const { month, year } = vnMonthYear(s.start_date || s.end_date);
    return `${year}-${month}`;
  }),
);

const candidates = [];
for (const p of periodList) {
  const { month, year } = vnMonthYear(p.start_date || p.end_date);
  const key = `${year}-${month}`;
  const row = {
    id: p.id,
    status: p.status,
    month,
    year,
    emp: p.employee_count,
    label: p.period_label,
    attClosed: closedKeys.has(key),
    skipSepProcessed: p.id === SKIP,
  };
  if (p.id === SKIP || String(p.status).toLowerCase() === 'draft') {
    candidates.push(row);
  }
}

console.log(
  JSON.stringify(
    {
      allBrief: periodList.map((p) => {
        const { month, year } = vnMonthYear(p.start_date || p.end_date);
        return {
          id8: p.id?.slice(0, 8),
          status: p.status,
          m: month,
          y: year,
          emp: p.employee_count,
        };
      }),
      closedSheetKeys: [...closedKeys],
      closedSample: closedSheets.slice(0, 12).map((s) => {
        const { month, year } = vnMonthYear(s.start_date || s.end_date);
        return { id8: s.id?.slice(0, 8), status: s.status, m: month, y: year, name: s.name };
      }),
      draftPlusAtt: candidates.filter(
        (c) =>
          String(c.status).toLowerCase() === 'draft' &&
          c.attClosed &&
          !c.skipSepProcessed,
      ),
      sepSkipStatus: candidates.find((c) => c.skipSepProcessed),
    },
    null,
    2,
  ),
);
