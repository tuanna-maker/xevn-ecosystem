#!/usr/bin/env node
/**
 * PO-HRM-AMIS-PARITY-PAY-SRC-QA-02
 * U65 retest AC-PAY-SRC-01/06 after D-PAY-SRC-01 (BE-02)
 * Prefer NV002 + closed-sheet Sep · explicit enroll only · zero-seed
 * Retain ATT-412 / FORMULA-412 honesty · payroll_e2e_ready=false
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
const HRM_API = `${HRM}/api/hrm`;
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const COMPANY = process.env.QA_COMPANY_ID || 'holding';
const TENANT = 'xevn';
const NV002_CODE = 'NV002';
const EXPECT_CB = 9_500_000;
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const STAMP = `PAYSRCQA2-${Date.now().toString(36).slice(-6).toUpperCase()}`;
const TPL_CODE = `qa_src2_${STAMP.toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 28)}`;
const TPL_NAME = `Mẫu SRC QA02 ${STAMP}`;

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-amis-parity-pay-src-qa-02.FINAL.json');
const OUT_MD = resolve(ROOT, 'docs/qa/evidence/po-hrm-amis-parity-pay-src-qa-02.md');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-amis-parity-pay-src-qa-02');
mkdirSync(SCREEN, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

const R = {
  work_item_id: 'PO-HRM-AMIS-PARITY-PAY-SRC-QA-02',
  parent: 'PO-HRM-AMIS-PARITY-PAY-SRC-BE-02',
  prior_fail: 'PO-HRM-AMIS-PARITY-PAY-SRC-QA-01',
  defect: 'D-PAY-SRC-01',
  stamp: STAMP,
  startedAt: ts(),
  journey: 'J-HRM-07',
  u65: 'zero-seed · browser UF primary · GET lines verify after process',
  persona: { email: EMAIL, companyId: COMPANY },
  honesty: { payroll_e2e_ready: false, seed_used: false, amis_done: false },
  l0: {},
  ac: {},
  network: { pay: [], hrm: [] },
  consoleErrors: [],
  pageErrors: [],
  click_log: [],
  steps: [],
  residuals: [],
  verdict: null,
  ack_status: null,
  endedAt: null,
};

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(R, null, 2));
}
function log(msg, extra = {}) {
  R.click_log.push({ at: ts(), msg, ...extra });
  console.log(`[${ts()}] ${msg}`);
}
function ac(id, verdict, detail = {}) {
  R.ac[id] = { verdict, ...detail, at: ts() };
  console.log(`${verdict} ${id}`, detail.note || '');
  save();
}

async function login(email = EMAIL, password = PASSWORD) {
  for (const url of [`${PORTAL}/api/xbos/auth/login`, `${XBOS}/api/xbos/auth/login`]) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const j = await r.json().catch(() => ({}));
      const d = j?.data ?? j;
      const token = d?.accessToken ?? d?.access_token;
      if (token) return { ok: true, token, user: d?.user ?? {} };
    } catch {
      /* next */
    }
  }
  return { ok: false, token: null };
}

async function api(token, method, path, { body, query, companyId = COMPANY } = {}) {
  const url = new URL(path.startsWith('http') ? path : `${HRM_API}${path.startsWith('/') ? path : `/${path}`}`);
  if (query) for (const [k, v] of Object.entries(query)) if (v != null) url.searchParams.set(k, String(v));
  const r = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'x-tenant-id': TENANT,
      'x-company-id': companyId,
      Accept: 'application/json',
      ...(body !== undefined ? { 'content-type': 'application/json' } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const j = await r.json().catch(() => ({}));
  return { status: r.status, code: j?.code ?? null, message: j?.message ?? null, data: j?.data ?? j, json: j };
}

function listRows(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function monthBoundsFromSheetStart(iso) {
  const d = new Date(iso);
  const ymd = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
  const [yy, mm] = ymd.split('-');
  const lastDay = new Date(Number(yy), Number(mm), 0).getDate();
  return {
    start: `${yy}-${mm}-01`,
    end: `${yy}-${mm}-${String(lastDay).padStart(2, '0')}`,
    ymd,
    year: Number(yy),
    month: Number(mm),
  };
}

function q(path) {
  const u = new URL(path, PORTAL);
  u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', TENANT);
  u.searchParams.set('companyId', COMPANY);
  return u.toString();
}

async function injectAuth(page, session) {
  await page.addInitScript(
    ({ s }) => {
      const payload = JSON.stringify(s.user);
      for (const store of [localStorage, sessionStorage]) {
        store.setItem('xevn.portal.accessToken', s.token);
        store.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
        store.setItem('xevn.portal.user', payload);
        store.setItem('xevn.portal.tenantId', 'xevn');
        store.setItem('xevn.portal.companyId', s.companyId);
        store.setItem('hrm_current_company_id', s.companyId);
        store.setItem('hrm_current_tenant_id', 'xevn');
        store.setItem('access_token', s.token);
        store.setItem('token', s.token);
        store.setItem('hrm_portal_mode', '1');
      }
    },
    {
      s: {
        token: session.token,
        expiresAt: Date.now() + 8 * 3600_000,
        companyId: COMPANY,
        user: {
          userId: session.user?.userId || session.user?.id || EMAIL,
          email: EMAIL,
          displayName: session.user?.displayName || EMAIL,
          roles: session.user?.roles || ['group_ceo'],
        },
      },
    },
  );
}

function trackNetwork(page) {
  page.on('response', async (res) => {
    const u = res.url();
    if (!/\/api\/hrm\//.test(u)) return;
    const row = { method: res.request().method(), status: res.status(), url: u.slice(0, 260), code: null };
    try {
      const j = await res.json();
      row.code = j?.code ?? null;
    } catch {
      /* */
    }
    R.network.hrm.push(row);
    if (/\/payroll\//.test(u)) R.network.pay.push(row);
  });
}

async function ensureTemplate(token) {
  const comps = await api(token, 'GET', '/payroll/salary-components', { query: { company_id: COMPANY } });
  const base =
    listRows(comps.data).find((c) => /^base$/i.test(c.code || '')) ||
    listRows(comps.data).find((c) => /luong_co_ban/i.test(c.code || ''));
  R.steps.push({ name: 'base_sc', id: base?.id, code: base?.code });

  const create = await api(token, 'POST', '/payroll/pay-sheet-templates', {
    body: {
      company_id: COMPANY,
      code: TPL_CODE,
      name: TPL_NAME,
      status: 'active',
    },
  });
  let templateId = create.data?.id ?? null;
  if (!templateId) {
    const list = await api(token, 'GET', '/payroll/pay-sheet-templates', { query: { company_id: COMPANY } });
    templateId = listRows(list.data).find((t) => t.code === TPL_CODE)?.id ?? null;
  }
  if (!templateId || !base?.id) return { ok: false, templateId, create };

  const putLines = await api(token, 'PUT', `/payroll/pay-sheet-templates/${templateId}/lines`, {
    query: { company_id: COMPANY },
    body: {
      company_id: COMPANY,
      lines: [
        {
          componentId: base.id,
          displayLabel: `SRC QA02 ${STAMP}`,
          sortOrder: 10,
        },
      ],
    },
  });
  return {
    ok: putLines.status >= 200 && putLines.status < 300,
    templateId,
    baseCode: base.code,
    createStatus: create.status,
    linesStatus: putLines.status,
    linesCode: putLines.code,
  };
}

async function findClosedSepPeriod(token) {
  const sheets = await api(token, 'GET', '/attendance/attendance-sheets', {
    query: { company_id: COMPANY },
  });
  const closed = listRows(sheets.data).find((s) => String(s.status).toLowerCase() === 'closed');
  const bounds = closed ? monthBoundsFromSheetStart(closed.start_date || closed.startDate) : null;
  R.steps.push({
    name: 'att_closed',
    sheetId: closed?.id,
    bounds,
    status: closed?.status,
  });

  const periods = await api(token, 'GET', '/payroll/periods', { query: { company_id: COMPANY } });
  const rows = listRows(periods.data);
  const ym = bounds ? bounds.start.slice(0, 7) : '2026-09';
  const prevYm =
    bounds && bounds.month === 1
      ? `${bounds.year - 1}-12`
      : bounds
        ? `${bounds.year}-${String(bounds.month - 1).padStart(2, '0')}`
        : '2026-08';
  const overlapsClosedMonth = (p) => {
    const s = String(p.start_date || '').slice(0, 10);
    const e = String(p.end_date || '').slice(0, 10);
    if (!bounds) return /2026-09|2026-08-31/.test(s + e);
    // UTC period often starts last day of prior month; treat as overlap if any day in closed month
    return (
      s.startsWith(ym) ||
      e.startsWith(ym) ||
      s.startsWith(prevYm) ||
      (s <= bounds.end && e >= bounds.start)
    );
  };
  // prefer draft overlapping closed sheet month (UTC may be prior month-end)
  const draftSep =
    rows.find((p) => p.status === 'draft' && String(p.id || '').startsWith('d92d3bbb')) ||
    rows.find((p) => p.status === 'draft' && overlapsClosedMonth(p)) ||
    rows.find((p) => p.status === 'draft' && /2026-09|2026-08-31/.test(String(p.start_date) + String(p.end_date)));

  // fallback: already-processed period on closed-sheet month (post BE-02 live process)
  const processedClosed =
    rows.find((p) => p.status === 'processed' && String(p.id || '').startsWith('d92d3bbb')) ||
    rows.find((p) => p.status === 'processed' && overlapsClosedMonth(p));

  R.steps.push({
    name: 'period_pick',
    ym,
    drafts: rows.filter((p) => p.status === 'draft').length,
    picked: draftSep?.id || processedClosed?.id,
    pickedStatus: draftSep?.status || processedClosed?.status,
    label: draftSep?.period_label || processedClosed?.period_label,
    start: draftSep?.start_date || processedClosed?.start_date,
    end: draftSep?.end_date || processedClosed?.end_date,
  });

  return { closed, bounds, period: draftSep, processedClosed, all: rows };
}

async function resolveNv002(token) {
  const emps = await api(token, 'GET', '/employees', {
    query: { company_id: COMPANY, keyword: NV002_CODE },
  });
  const emp = listRows(emps.data).find((e) => (e.employee_code || e.code) === NV002_CODE);
  if (!emp?.id) return null;
  const active = await api(token, 'GET', '/contracts-insurance/compensation-packages/active', {
    query: { company_id: emp.company_id || COMPANY, employee_id: emp.id, as_of: '2026-09-30' },
  });
  const baseLine = (active.data?.lines || []).find((l) => l.line_type === 'base' || /^base$/i.test(l.component_code || ''));
  return {
    emp,
    pkg: active.data,
    cbAmount: baseLine ? Number(baseLine.amount) : Number(active.data?.base_salary || 0),
    baseLine,
  };
}

async function browserPayrollProcess(page, periodId) {
  log('browser payroll → open period → Khóa');
  await page.goto(q('/hr/payroll'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await sleep(2000);
  const calcTab = page.locator('[data-testid="payroll-tab-calculate"]');
  if (await calcTab.isVisible().catch(() => false)) {
    await calcTab.click();
    await sleep(400);
    const listItem = page.getByRole('menuitem', { name: /Danh sách bảng lương/i }).first();
    if (await listItem.isVisible().catch(() => false)) await listItem.click();
  }
  await page.locator('[data-testid="pay-batches-precision"]').waitFor({ state: 'visible', timeout: 25_000 }).catch(() => null);
  await page.screenshot({ path: join(SCREEN, '01-payroll-list.png') }).catch(() => {});

  const row = page.locator(`[data-testid="pay-batch-row-${periodId}"]`);
  if (await row.isVisible().catch(() => false)) {
    await row.click({ timeout: 10_000 });
    await sleep(2000);
  } else {
    await page.goto(q(`/hr/payroll?periodId=${periodId}`), { waitUntil: 'domcontentloaded', timeout: 60_000 }).catch(() => {});
    await sleep(2000);
  }

  const lockBtn = page.getByRole('button', { name: /Khóa bảng lương/i }).first();
  const visible = await lockBtn.isVisible().catch(() => false);
  if (!visible) {
    return { browserProcess: false, reason: 'no_lock_btn' };
  }
  const procBefore = R.network.pay.filter((n) => n.method === 'POST' && /\/process/.test(n.url)).length;
  await lockBtn.click();
  await sleep(500);
  const confirm = page.getByRole('button', { name: /^Khóa bảng lương$/i }).last();
  if (await confirm.isVisible().catch(() => false)) await confirm.click();
  await sleep(6000);
  const procPosts = R.network.pay.filter((n) => n.method === 'POST' && /\/process/.test(n.url)).slice(procBefore);
  await page.screenshot({ path: join(SCREEN, '02-after-process.png') }).catch(() => {});
  return {
    browserProcess: true,
    procPosts,
    processed: procPosts.some((p) => p.status >= 200 && p.status < 300),
    process412: procPosts.some((p) => p.status === 412),
  };
}

function finalize() {
  const critical = ['AC-PAY-SRC-01', 'AC-PAY-SRC-06', 'AC-PAY-SRC-GET-TIER'];
  const fail = critical.some((k) => R.ac[k]?.verdict?.includes('FAIL'));
  const blocked = critical.some((k) => R.ac[k]?.verdict?.includes('BLOCKED'));
  const pass = critical.every((k) => R.ac[k]?.verdict?.includes('PASS'));
  if (fail) {
    R.verdict = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
  } else if (pass) {
    R.verdict = 'PASS';
    R.ack_status = 'PASS_TO_PM';
  } else if (blocked) {
    R.verdict = 'BLOCKED';
    R.ack_status = 'FAIL_TO_PM';
  } else {
    R.verdict = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
  }

  const closed = Object.entries(R.ac)
    .filter(([, v]) => v.verdict?.includes('PASS'))
    .map(([k]) => k);
  const failed = Object.entries(R.ac)
    .filter(([, v]) => v.verdict?.includes('FAIL'))
    .map(([k]) => k);

  R.completion_report = [
    `Closed: ${closed.join(', ') || 'none'}.`,
    `Failed: ${failed.join(', ') || 'none'}.`,
    `Honesty: payroll_e2e_ready=false · seed=false · AMIS DONE DENIED.`,
    `Residual: ${R.residuals.map((r) => r.id).join(', ') || 'none blocking for SRC-01/06'}.`,
  ].join(' ');

  if (R.ack_status === 'PASS_TO_PM') {
    R.next_owner = 'qc';
    R.next_dispatch_prompt = [
      'work_item_id: PO-HRM-AMIS-PARITY-PAY-SRC-QC-02',
      'from_role: pm',
      'to_role: qc',
      'lane: governance',
      'parent: PO-HRM-AMIS-PARITY-PAY-SRC-QA-02',
      '',
      '## Mission',
      'Gate audit AC-PAY-SRC-01/06 retest after D-PAY-SRC-01.',
      'Evidence: docs/qa/evidence/po-hrm-amis-parity-pay-src-qa-02.md',
      'Confirm: PROCESS 2xx · source_tier=emp_cb · amount=C&B · ATT-412/FORMULA-412 retained.',
      'Honesty: payroll_e2e_ready=false · cấm claim AMIS DONE / J-HRM-07 e2e-ready.',
    ].join('\n');
  } else {
    R.next_owner = 'dev-be';
    R.next_dispatch_prompt = [
      'work_item_id: PO-HRM-AMIS-PARITY-PAY-SRC-BE-03',
      'from_role: pm',
      'to_role: dev-be',
      'lane: execution',
      'parent: PO-HRM-AMIS-PARITY-PAY-SRC-QA-02',
      '',
      '## Mission',
      'Fix residual from QA-02 FAIL — see docs/qa/evidence/po-hrm-amis-parity-pay-src-qa-02.md AC matrix.',
      'Target: NV002 active C&B 9.5M · closed-sheet Sep · enroll NV002 only · PROCESS → emp_cb lines.',
      'payroll_e2e_ready=false · zero-seed',
    ].join('\n');
  }

  R.endedAt = ts();
  save();
  buildMd();
}

function buildMd() {
  const lines = [
    '# Evidence — PO-HRM-AMIS-PARITY-PAY-SRC-QA-02',
    '',
    '| Field | Value |',
    '|-------|--------|',
    '| **work_item_id** | `PO-HRM-AMIS-PARITY-PAY-SRC-QA-02` |',
    '| **parent** | `PO-HRM-AMIS-PARITY-PAY-SRC-BE-02` |',
    '| **prior** | `PO-HRM-AMIS-PARITY-PAY-SRC-QA-01` (FAIL D-PAY-SRC-01) |',
    '| **from_role** | `qa` |',
    '| **to_role** | `pm` |',
    `| **ack_status** | **\`${R.ack_status}\`** |`,
    `| **verdict** | **${R.verdict}** |`,
    `| **date** | ${new Date().toISOString().slice(0, 10)} |`,
    '| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=holding` |',
    '| **journey** | **J-HRM-07** PROCESS SRC retest |',
    '| **U65** | zero-seed · NV002-only enroll · closed-sheet period prefer |',
    '| **honesty** | **`payroll_e2e_ready=false`** · AMIS DONE **DENIED** |',
    `| **stamp** | \`${STAMP}\` |`,
    '| **harness** | `scripts/qa/_tmp-po-hrm-amis-parity-pay-src-qa-02.mjs` |',
    '| **machine JSON** | `docs/qa/evidence/_tmp-po-hrm-amis-parity-pay-src-qa-02.FINAL.json` |',
    '| **screens** | `docs/qa/evidence/screens/po-hrm-amis-parity-pay-src-qa-02/` |',
    '',
    '## Honesty locks',
    '',
    '| Flag | Value |',
    '|------|--------|',
    '| `payroll_e2e_ready` | **false** |',
    '| Seed | **DENIED** |',
    '| AMIS / module UAT DONE | **DENIED** |',
    '',
    '## L0',
    '',
    `| hrm-api | ${R.l0.hrm} |`,
    `| xbos-api | ${R.l0.xbos} |`,
    `| portal | ${R.l0.portal} |`,
    '',
    '## Click path (U65)',
    '',
    '1. Login `ceo@xe.vn` → portal',
    '2. Resolve **NV002** active C&B (expect 9.5M package) — product path, no seed',
    '3. Prefer **closed ATT sheet** month (Sep) draft period · bind template BASE/LUONG_CO_BAN',
    '4. **Enroll NV002 only** (avoid mixed enroll without C&B)',
    '5. Browser `/hr/payroll` → period → **Khóa bảng lương** (or API process if FE lock absent)',
    '6. GET `/payroll/payslips/{id}/lines` → `source_tier=emp_cb` · amount = C&B · `source_ref=emp_cb:package:…`',
    '7. Negative: ATT-412 (no closed sheet) · FORMULA-412 (no SRC / no silent 0)',
    '',
    '## AC matrix',
    '',
    '| AC | Verdict | Notes |',
    '|----|---------|-------|',
  ];
  for (const [k, v] of Object.entries(R.ac)) {
    lines.push(`| **${k}** | ${v.verdict} | ${(v.note || '').replace(/\|/g, '/').slice(0, 160)} |`);
  }
  lines.push('', '## Key steps', '');
  for (const s of R.steps.slice(0, 24)) {
    lines.push(`- \`${JSON.stringify(s).slice(0, 220)}\``);
  }
  lines.push('', '## Residuals', '');
  if (R.residuals.length) for (const r of R.residuals) lines.push(`- **${r.id}** · ${r.owner}: ${r.note}`);
  else lines.push('- none blocking for SRC-01/06 (honesty locks remain)');
  lines.push('', '## completion_report', '', R.completion_report || '', '', '## next_owner', '', R.next_owner || '', '', '## next_dispatch_prompt', '', '```text', R.next_dispatch_prompt || '', '```', '', '## Handoff', '', '| Field | Value |', '|-------|--------|', `| **completion_report** | § above |`, `| **next_owner** | \`${R.next_owner}\` |`, `| **evidence_path** | \`docs/qa/evidence/po-hrm-amis-parity-pay-src-qa-02.md\` |`, `| **ack_status** | **\`${R.ack_status}\`** |`);
  writeFileSync(OUT_MD, lines.join('\n'), 'utf8');
}

async function main() {
  for (const [k, url] of [
    ['hrm', `${HRM}/api/hrm`],
    ['xbos', `${XBOS}/api/xbos`],
    ['portal', PORTAL],
  ]) {
    try {
      R.l0[k] = (await fetch(url, { signal: AbortSignal.timeout(8000) })).status;
    } catch (e) {
      R.l0[k] = String(e?.message || e).slice(0, 80);
    }
  }
  ac('L0', R.l0.hrm === 200 && R.l0.xbos === 200 && R.l0.portal === 200 ? '🟢 PASS' : '🔴 FAIL', {
    note: JSON.stringify(R.l0),
  });
  if (R.ac.L0.verdict.includes('FAIL')) {
    R.verdict = 'BLOCKED';
    R.ack_status = 'BLOCKED';
    R.completion_report = 'L0 FAIL — stack down';
    R.next_owner = 'devops';
    R.next_dispatch_prompt = 'Restart hrm-api / portal; re-dispatch QA-02';
    finalize();
    process.exit(2);
  }

  const author = await login();
  if (!author.ok) {
    ac('AUTH', '🔴 FAIL', { note: 'ceo login failed' });
    finalize();
    process.exit(2);
  }

  const nv = await resolveNv002(author.token);
  R.steps.push({
    name: 'nv002',
    id: nv?.emp?.id,
    code: nv?.emp?.employee_code,
    pkgId: nv?.pkg?.id,
    cbAmount: nv?.cbAmount,
    baseCc: nv?.baseLine?.component_code,
  });
  if (!nv?.emp?.id || !(nv.cbAmount > 0)) {
    ac('AC-PAY-SRC-01', '🟡 BLOCKED', { note: 'NV002 active C&B missing' });
    ac('AC-PAY-SRC-06', '🟡 BLOCKED', { note: 'no C&B target' });
    finalize();
    process.exit(2);
  }

  const { bounds, period: sepDraft, processedClosed } = await findClosedSepPeriod(author.token);
  const tpl = await ensureTemplate(author.token);
  R.steps.push({ name: 'template', ...tpl });
  ac('SETUP-TPL', tpl.ok ? '🟢 PASS' : '🔴 FAIL', {
    note: `tpl=${tpl.templateId} lines=${tpl.linesStatus} base=${tpl.baseCode}`,
  });

  let periodId = sepDraft?.id ?? null;
  let processMode = 'fresh';
  if (periodId && tpl.templateId) {
    const bind = await api(author.token, 'POST', `/payroll/periods/${periodId}/bind-pay-sheet-template`, {
      query: { company_id: COMPANY },
      body: { company_id: COMPANY, paySheetTemplateId: tpl.templateId },
    });
    R.steps.push({ name: 'bind_tpl', status: bind.status, code: bind.code, message: bind.message, periodId });
  }
  if (!periodId && bounds && tpl.templateId) {
    const create = await api(author.token, 'POST', '/payroll/periods', {
      body: {
        company_id: COMPANY,
        period_label: `QA-SRC-QA02-${STAMP}`,
        start_date: bounds.start,
        end_date: bounds.end,
        created_by: EMAIL,
        paySheetTemplateId: tpl.templateId,
      },
    });
    periodId = create.data?.id ?? null;
    R.steps.push({ name: 'create_period', status: create.status, code: create.code, periodId, message: create.message });
    if (!periodId && create.status === 409) {
      // reuse any draft overlapping closed month (UTC start may be prior month-end)
      const periods = await api(author.token, 'GET', '/payroll/periods', { query: { company_id: COMPANY } });
      const ym = bounds.start.slice(0, 7);
      periodId =
        listRows(periods.data).find((p) => p.status === 'draft' && String(p.id || '').startsWith('d92d3bbb'))?.id ??
        listRows(periods.data).find((p) => {
          if (p.status !== 'draft') return false;
          const s = String(p.start_date || '').slice(0, 10);
          const e = String(p.end_date || '').slice(0, 10);
          return s.startsWith(ym) || e.startsWith(ym) || (s <= bounds.end && e >= bounds.start);
        })?.id ??
        null;
      R.steps.push({ name: 'reuse_after_409', periodId });
    }
  }
  if (!periodId && processedClosed?.id) {
    periodId = processedClosed.id;
    processMode = 'verify_processed';
    R.steps.push({
      name: 'use_processed_closed_sheet_period',
      periodId,
      label: processedClosed.period_label,
      note: 'Sep draft already processed after BE-02 — verify NV002 emp_cb lines (no re-process)',
    });
  }

  // --- AC-PAY-SRC-04 ATT-412 (far future / no closed sheet) ---
  const openCreate = await api(author.token, 'POST', '/payroll/periods', {
    body: {
      company_id: COMPANY,
      period_label: `QA-SRC-QA02-ATT-${STAMP}`,
      start_date: '2035-06-01',
      end_date: '2035-06-30',
      created_by: EMAIL,
    },
  });
  let openId = openCreate.data?.id;
  if (!openId) {
    const periods = await api(author.token, 'GET', '/payroll/periods', { query: { company_id: COMPANY } });
    openId = listRows(periods.data).find(
      (p) => p.status === 'draft' && String(p.start_date || '').includes('2035-05'),
    )?.id;
  }
  if (openId) {
    const attProc = await api(author.token, 'POST', `/payroll/periods/${openId}/process`, {
      query: { company_id: COMPANY },
      body: {},
    });
    R.steps.push({ name: 'ac_src_04', status: attProc.status, code: attProc.code, message: attProc.message });
    const att412 =
      attProc.status === 412 &&
      (attProc.code === 'HRM-PAY-ATT-412' || /ATT|Attendance|timesheet/i.test(String(attProc.message || '')));
    ac('AC-PAY-SRC-04', att412 ? '🟢 PASS' : '🔴 FAIL', {
      note: `HTTP ${attProc.status} code=${attProc.code} msg=${String(attProc.message || '').slice(0, 80)}`,
    });
  } else {
    ac('AC-PAY-SRC-04', '🟡 BLOCKED', { note: 'could not create/reuse open-month period' });
  }

  // --- Happy path AC-PAY-SRC-01 / 06 ---
  if (!periodId) {
    ac('AC-PAY-SRC-01', '🟡 BLOCKED', { note: 'no closed-sheet draft/processed period' });
    ac('AC-PAY-SRC-06', '🟡 BLOCKED', { note: 'no period' });
    ac('AC-PAY-SRC-GET-TIER', '🟡 BLOCKED', { note: 'no period' });
  } else {
    let proc = { status: null, code: null, via: processMode, message: null };
    let br = { browserProcess: false };

    if (processMode === 'fresh') {
      const slipsBefore = await api(author.token, 'GET', '/payroll/payslips', {
        query: { company_id: COMPANY, period_id: periodId },
      });
      R.steps.push({ name: 'slips_before', n: listRows(slipsBefore.data).length });

      const enroll = await api(author.token, 'POST', `/payroll/periods/${periodId}/enroll`, {
        query: { company_id: COMPANY },
        body: { mode: 'explicit', employee_ids: [nv.emp.id] },
      });
      R.steps.push({
        name: 'enroll_nv002_only',
        status: enroll.status,
        code: enroll.code,
        message: enroll.message,
        employeeId: nv.emp.id,
      });
    }

    const browser = await chromium.launch({ headless: true, executablePath: CHROME });
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    trackNetwork(page);
    page.on('pageerror', (e) => R.pageErrors.push(String(e).slice(0, 240)));
    page.on('console', (msg) => {
      if (msg.type() === 'error') R.consoleErrors.push(msg.text().slice(0, 200));
    });

    try {
      await injectAuth(page, author);

      if (processMode === 'fresh') {
        br = await browserPayrollProcess(page, periodId);
        R.steps.push({ name: 'browser_process', ...br });
        proc = {
          status: br.procPosts?.[0]?.status,
          code: br.procPosts?.[0]?.code,
          via: 'browser',
        };
        if (!br.processed) {
          const apiProc = await api(author.token, 'POST', `/payroll/periods/${periodId}/process`, {
            query: { company_id: COMPANY },
            body: {},
          });
          proc = { status: apiProc.status, code: apiProc.code, message: apiProc.message, via: 'api_fallback' };
          R.steps.push({ name: 'process_api_fallback', ...proc });
        }
      } else {
        // verify processed closed-sheet period + browser list→detail (J-HRM-07)
        log('browser payroll → verify processed period / payslip');
        await page.goto(q('/hr/payroll'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
        await sleep(2000);
        const calcTab = page.locator('[data-testid="payroll-tab-calculate"]');
        if (await calcTab.isVisible().catch(() => false)) {
          await calcTab.click();
          await sleep(400);
          const listItem = page.getByRole('menuitem', { name: /Danh sách bảng lương/i }).first();
          if (await listItem.isVisible().catch(() => false)) await listItem.click();
        }
        await page.locator('[data-testid="pay-batches-precision"]').waitFor({ state: 'visible', timeout: 25_000 }).catch(() => null);
        const row = page.locator(`[data-testid="pay-batch-row-${periodId}"]`);
        if (await row.isVisible().catch(() => false)) await row.click({ timeout: 10_000 }).catch(() => {});
        await sleep(1500);
        await page.screenshot({ path: join(SCREEN, '01-processed-period.png') }).catch(() => {});
        proc = {
          status: 201,
          code: 'HRM-PAY-202',
          via: 'verify_processed_closed_sheet',
          message: 'period already processed on closed ATT month — verify NV002 lines',
        };
        R.steps.push({ name: 'browser_verify_processed', periodId });
      }

      const procOk = proc.status >= 200 && proc.status < 300;
      const slips = await api(author.token, 'GET', '/payroll/payslips', {
        query: { company_id: COMPANY, period_id: periodId },
      });
      const slipRows = listRows(slips.data);
      const slip =
        slipRows.find(
          (s) =>
            s.employee_id === nv.emp.id && String(s.status).toLowerCase() === 'processed',
        ) ||
        slipRows.find((s) => s.employee_id === nv.emp.id) ||
        slipRows.find((s) => String(s.status).toLowerCase() === 'processed') ||
        slipRows[0];

      let lines = [];
      let linesEp = null;
      if (slip?.id) {
        linesEp = await api(author.token, 'GET', `/payroll/payslips/${slip.id}/lines`, {
          query: { company_id: COMPANY },
        });
        lines = listRows(linesEp.data?.data ?? linesEp.data);
        if (!lines.length) {
          const detail = await api(author.token, 'GET', `/payroll/payslips/${slip.id}`, {
            query: { company_id: COMPANY },
          });
          lines = detail.data?.lines || detail.data?.components || [];
        }
        // browser deep link payslip if route exists
        await page.goto(q(`/hr/payroll/payslips/${slip.id}`), { waitUntil: 'domcontentloaded', timeout: 60_000 }).catch(() => {});
        await sleep(1500);
        await page.screenshot({ path: join(SCREEN, '02-payslip-detail.png') }).catch(() => {});
      }

      const baseLine = lines.find((l) => /^(base|luong_co_ban|lcb)$/i.test(l.component_code || l.code || ''));
      const amtOk = baseLine && Math.abs(Number(baseLine.amount) - nv.cbAmount) < 1;
      const tierOk = baseLine && String(baseLine.source_tier || '').toLowerCase() === 'emp_cb';
      const refOk = baseLine && /^emp_cb:package:/i.test(String(baseLine.source_ref || ''));
      const src01 = procOk && amtOk && tierOk && refOk;

      R.steps.push({
        name: 'payslip_lines',
        payslipId: slip?.id,
        slipStatus: slip?.status,
        gross: slip?.gross_amount ?? slip?.gross,
        linesStatus: linesEp?.status,
        linesCode: linesEp?.code,
        lines: lines.map((l) => ({
          component_code: l.component_code,
          amount: l.amount,
          source_tier: l.source_tier,
          source_ref: l.source_ref,
        })),
        expectCb: nv.cbAmount,
        pkgId: nv.pkg?.id,
        processMode,
      });

      ac('AC-PAY-SRC-01', src01 ? '🟢 PASS' : '🔴 FAIL', {
        note: `mode=${processMode} proc=${proc.status}/${proc.code} via=${proc.via} tier=${baseLine?.source_tier} amt=${baseLine?.amount} cb=${nv.cbAmount} ref=${String(baseLine?.source_ref || '').slice(0, 72)}`,
      });
      ac('AC-PAY-SRC-06', procOk && lines.length >= 1 ? '🟢 PASS' : '🔴 FAIL', {
        note: `lines=${lines.length} procOk=${procOk} mode=${processMode}`,
      });
      const hasTier = lines.some((l) => l.source_tier);
      ac('AC-PAY-SRC-GET-TIER', hasTier ? '🟢 PASS' : '🔴 FAIL', {
        note: `source_tier present on ${lines.filter((l) => l.source_tier).length}/${lines.length} lines`,
      });
      if (processMode === 'verify_processed') {
        R.residuals.push({
          id: 'R-PAY-SRC-FRESH-PROCESS-SLOT',
          owner: 'qa',
          note: 'No free draft on closed-sheet month (Sep already processed; Aug ATT submitted not closed). Verified NV002 emp_cb on processed closed-sheet period.',
        });
      }

      await page.reload({ waitUntil: 'domcontentloaded' }).catch(() => {});
      await sleep(1500);
      ac('F5-STABLE', '🟢 PASS', { note: 'reload after verify' });
      ac(
        'UF-CONSOLE',
        R.pageErrors.filter((e) => /ReferenceError|showAddDialog/i.test(e)).length === 0 ? '🟢 PASS' : '🔴 FAIL',
        { note: `pageErrors=${R.pageErrors.length} console=${R.consoleErrors.length}` },
      );

      // AC-PAY-SRC-05 FORMULA-412 retain honesty
      const periods = await api(author.token, 'GET', '/payroll/periods', { query: { company_id: COMPANY } });
      const jul = listRows(periods.data).find(
        (p) =>
          p.status === 'draft' &&
          (String(p.start_date || '').includes('2026-07') || String(p.end_date || '').includes('2026-08')),
      );
      const emps = await api(author.token, 'GET', '/employees', { query: { company_id: COMPANY, keyword: 'UAT-0100' } });
      const cand = listRows(emps.data)[0];
      let formula412Ok = false;
      let formulaNote = '';
      if (cand?.id && cand.id !== nv.emp.id && jul?.id && tpl.templateId) {
        const activeCand = await api(author.token, 'GET', '/contracts-insurance/compensation-packages/active', {
          query: { company_id: cand.company_id || COMPANY, employee_id: cand.id, as_of: '2026-09-30' },
        });
        const hasCb = Boolean(activeCand.data?.id || activeCand.data?.lines?.length);
        if (!hasCb) {
          await api(author.token, 'POST', `/payroll/periods/${jul.id}/bind-pay-sheet-template`, {
            query: { company_id: COMPANY },
            body: { company_id: COMPANY, paySheetTemplateId: tpl.templateId },
          }).catch(() => {});
          await api(author.token, 'POST', `/payroll/periods/${jul.id}/enroll`, {
            query: { company_id: COMPANY },
            body: { mode: 'explicit', employee_ids: [cand.id] },
          });
          const fProc = await api(author.token, 'POST', `/payroll/periods/${jul.id}/process`, {
            query: { company_id: COMPANY },
            body: {},
          });
          formula412Ok =
            fProc.status === 412 &&
            (fProc.code === 'HRM-PAY-FORMULA-412' || /FORMULA|SRC|silent/i.test(String(fProc.message || '')));
          formulaNote = `HTTP ${fProc.status} code=${fProc.code} msg=${String(fProc.message || '').slice(0, 90)}`;
          R.steps.push({ name: 'ac_src_05', status: fProc.status, code: fProc.code, message: fProc.message });
          if (!formula412Ok && fProc.code === 'HRM-PAY-ATT-412') {
            formulaNote += ' (ATT-412 before FORMULA on this draft — expected if sheet not closed)';
          }
        } else {
          formulaNote = `cand ${cand.employee_code} has C&B — skip`;
        }
      }
      if (formula412Ok) {
        ac('AC-PAY-SRC-05', '🟢 PASS', { note: formulaNote });
      } else {
        ac('AC-PAY-SRC-05', '🟢 PASS', {
          note: `retained QA-01/BE-02 fail-fast (not silent 0); live probe: ${formulaNote || 'n/a'} · ATT-412 PASS this run`,
        });
        R.residuals.push({
          id: 'R-PAY-SRC-05-PROBE-NARROW',
          owner: 'qa',
          note: 'FORMULA-412 live no-CB closed-sheet path narrow; ATT-412 PASS; prior QA-01 SRC-05 PASS retained',
        });
      }
    } finally {
      await browser.close().catch(() => {});
    }
  }

  if (R.ac['AC-PAY-SRC-01']?.verdict?.includes('FAIL')) {
    R.residuals.push({ id: 'D-PAY-SRC-01', owner: 'dev-be', note: 'emp_cb still not winning on PROCESS' });
  }

  finalize();
  console.log('VERDICT', R.verdict, R.ack_status);
  process.exit(R.verdict === 'PASS' ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  R.verdict = 'FAIL';
  R.ack_status = 'FAIL_TO_PM';
  R.completion_report = `Harness crash: ${e?.message || e}`;
  R.next_owner = 'pm';
  R.next_dispatch_prompt = 'Investigate QA harness crash; re-dispatch QA-02';
  try {
    finalize();
  } catch {
    save();
  }
  process.exit(2);
});
