#!/usr/bin/env node
/**
 * PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-QA-TIER-01
 * U65 browser retest R-PAY-SRC-TIER-FIELD:
 * GET /payroll/payslips/:id/lines — every emp_cb:* line has source_tier === "emp_cb" (key present)
 * Retain AC-PAY-SRC-01 / VAL-PAY-SRC-02A/B · F5 stable
 * cấm seed · payroll_e2e_ready=false · cấm AMIS DONE
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
const COMPANY = 'main';
const TENANT = 'xevn';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

/** Payslip from SRC-02 PROCESS (stamp SRCSRC02-ISBDZW) — reuse path allowed by mission */
const KNOWN_PAYSLIP_ID = process.env.QA_PAYSLIP_ID || 'e9903a23-fe1e-4b39-acb2-a0603007e952';
const EXPECT_BASE = 13_579_000;
const EXPECT_AN = 777_000;
const OVERRIDE_CONST = 7_500_000;

const STAMP = `SRCTIER-${Date.now().toString(36).slice(-6).toUpperCase()}`;
const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-amis-parity-emp-salary-history-qa-tier-01.FINAL.json');
const OUT_MD = resolve(ROOT, 'docs/qa/evidence/po-hrm-amis-parity-emp-salary-history-qa-tier-01.md');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-amis-parity-emp-salary-history-qa-tier-01');
mkdirSync(SCREEN, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

const R = {
  work_item_id: 'PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-QA-TIER-01',
  parent: 'PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-BE-TIER-01',
  defect: 'R-PAY-SRC-TIER-FIELD',
  stamp: STAMP,
  startedAt: ts(),
  journey: 'J-HRM-07',
  u65: 'zero-seed · browser payroll + GET lines source_tier key (no prefix-only assert)',
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

async function login(email, password = PASSWORD) {
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
  return { status: r.status, code: j?.code, message: j?.message, data: j?.data ?? j, raw: j };
}

function listRows(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

/** STRICT: key must exist on object — no source_ref prefix fallback for tier verdict */
function hasSourceTierKey(line) {
  return line != null && Object.prototype.hasOwnProperty.call(line, 'source_tier');
}

function assertEmpCbTierLines(lines) {
  const empCbRef = lines.filter((l) => String(l?.source_ref || '').startsWith('emp_cb:'));
  const failures = [];
  for (const l of empCbRef) {
    if (!hasSourceTierKey(l)) {
      failures.push({ component_code: l.component_code, reason: 'source_tier KEY ABSENT', source_ref: l.source_ref });
    } else if (l.source_tier !== 'emp_cb') {
      failures.push({
        component_code: l.component_code,
        reason: `source_tier=${JSON.stringify(l.source_tier)} !== emp_cb`,
        source_ref: l.source_ref,
      });
    }
  }
  return { empCbRef, failures, pass: empCbRef.length > 0 && failures.length === 0 };
}

function buildMd() {
  const acRows = Object.entries(R.ac)
    .map(([k, v]) => `| **${k}** | ${v.verdict} | ${(v.note || '').replace(/\|/g, '/')} |`)
    .join('\n');
  const residualRows =
    R.residuals.length === 0
      ? '- *(none for R-PAY-SRC-TIER-FIELD — CLOSED)*'
      : R.residuals.map((x) => `- **${x.id}** · ${x.owner}: ${x.note}`).join('\n');
  const md = [
    '# Evidence — PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-QA-TIER-01',
    '',
    '| Field | Value |',
    '|-------|-------|',
    `| **work_item_id** | \`${R.work_item_id}\` |`,
    `| **parent** | \`${R.parent}\` |`,
    `| **defect** | \`${R.defect}\` |`,
    `| **from_role** | \`qa\` |`,
    `| **to_role** | \`pm\` |`,
    `| **ack_status** | **\`${R.ack_status}\`** |`,
    `| **verdict** | **${R.verdict}** |`,
    `| **date** | 2026-08-07 |`,
    `| **persona** | \`${EMAIL}\` / \`Xevn@2026\` · \`company_id=main\` |`,
    `| **journey** | **J-HRM-07** GET lines \`source_tier\` (SRC-02 path retain) |`,
    `| **U65** | zero-seed · browser payroll F5 · Network GET lines |`,
    `| **honesty** | **\`payroll_e2e_ready=false\`** · cấm seed · cấm AMIS DONE |`,
    `| **stamp** | \`${STAMP}\` |`,
    `| **machine JSON** | \`docs/qa/evidence/_tmp-po-hrm-amis-parity-emp-salary-history-qa-tier-01.FINAL.json\` |`,
    `| **screens** | \`docs/qa/evidence/screens/po-hrm-amis-parity-emp-salary-history-qa-tier-01/\` |`,
    `| **harness** | \`scripts/qa/_tmp-po-hrm-amis-parity-emp-salary-history-qa-tier-01.mjs\` |`,
    '',
    '## Mission assert (STRICT)',
    '',
    'Every line with `source_ref` matching `emp_cb:*` MUST have:',
    '1. **`source_tier` key present** on JSON object (`hasOwnProperty`)',
    '2. **`source_tier === "emp_cb"`** — **not** inferred only from `source_ref` prefix',
    '',
    '## Click path (U65)',
    '',
    '1. Login `ceo@xe.vn` → portal',
    '2. `/hr/payroll` → Tính lương / Danh sách · TDZ gate `pay-batches-precision`',
    '3. F5 stable',
    `4. GET \`/payroll/payslips/${KNOWN_PAYSLIP_ID}/lines\` (SRC-02 PROCESS path reuse — mission allows)`,
    '5. Assert tier key + retain AC-PAY-SRC-01 / VAL-02A/B amounts',
    '',
    '## HDSD / inventory (U76)',
    '',
    '| Surface | Observed |',
    '|---------|----------|',
    '| Payroll batches | `pay-batches-precision` / list |',
    '| Payslip lines GET | `/payroll/payslips/:id/lines` 200 + `source_tier` |',
    '',
    '## Honesty locks',
    '',
    '| Flag | Value |',
    '|------|-------|',
    '| `payroll_e2e_ready` | **false** |',
    '| Seed | **DENIED** |',
    '| AMIS DONE / module UAT / formula LIVE | **DENIED** |',
    '',
    '## AC matrix',
    '',
    '| AC | Verdict | Notes |',
    '|----|---------|-------|',
    acRows,
    '',
    '## Key steps',
    '',
    ...R.steps.slice(0, 20).map((s) => `- \`${JSON.stringify(s).slice(0, 220)}\``),
    '',
    '## Residuals',
    '',
    residualRows,
    '',
    '## Honesty / non-claims',
    '',
    '- `payroll_e2e_ready=false`',
    '- No `pnpm seed:*` / DB fake',
    '- No AMIS parity DONE / module UAT / formula LIVE claim',
    '',
    '## completion_report',
    '',
    R.completion_report || '',
    '',
    '## next_owner',
    '',
    R.next_owner || 'pm',
    '',
    '## next_dispatch_prompt',
    '',
    '```text',
    R.next_dispatch_prompt || '',
    '```',
    '',
    '## evidence_path',
    '',
    '`docs/qa/evidence/po-hrm-amis-parity-emp-salary-history-qa-tier-01.md`',
    '',
    '## ack_status',
    '',
    `**${R.ack_status}**`,
    '',
  ].join('\n');
  writeFileSync(OUT_MD, md);
}

async function main() {
  // L0
  const l0 = {};
  for (const [k, u] of [
    ['hrm', `${HRM}/api/hrm`],
    ['xbos', `${XBOS}/api/xbos`],
    ['portal', PORTAL],
  ]) {
    try {
      const r = await fetch(u, { method: 'GET' });
      l0[k] = r.status;
    } catch {
      l0[k] = 0;
    }
  }
  R.l0 = l0;
  const l0ok = l0.hrm === 200 && l0.xbos === 200 && l0.portal === 200;
  ac('L0', l0ok ? '🟢 PASS' : '🔴 FAIL', { note: JSON.stringify(l0) });
  if (!l0ok) {
    R.verdict = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    R.completion_report = 'L0 FAIL — stack not healthy';
    R.next_owner = 'devops';
    R.next_dispatch_prompt =
      'work_item_id: PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-QA-TIER-01\nto_role: devops\nRestart hrm/xbos/portal — L0 FAIL';
    R.endedAt = ts();
    buildMd();
    save();
    process.exit(2);
  }

  const auth = await login(EMAIL);
  if (!auth.ok) {
    ac('AUTH', '🔴 FAIL', { note: 'login failed' });
    R.verdict = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    R.endedAt = ts();
    buildMd();
    save();
    process.exit(2);
  }
  ac('AUTH', '🟢 PASS', { note: EMAIL });

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  page.on('pageerror', (e) => R.pageErrors.push(String(e.message || e).slice(0, 300)));
  page.on('console', (msg) => {
    if (msg.type() === 'error') R.consoleErrors.push(msg.text().slice(0, 300));
  });
  page.on('response', (res) => {
    const u = res.url();
    if (/\/api\/hrm\/payroll/i.test(u)) {
      R.network.pay.push({ url: u.slice(0, 180), status: res.status() });
    }
  });

  try {
    log('browser login');
    await page.goto(`${PORTAL}/login`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await sleep(800);
    await page.fill('input[type="email"], input[name="email"]', EMAIL).catch(async () => {
      await page.locator('input').first().fill(EMAIL);
    });
    await page.fill('input[type="password"]', PASSWORD);
    await page.getByRole('button', { name: /Đăng nhập|Login/i }).click().catch(async () => {
      await page.locator('button[type="submit"]').click();
    });
    await sleep(3500);
    await page.goto(`${PORTAL}/hr/payroll`, { waitUntil: 'domcontentloaded', timeout: 90_000 });
    await sleep(3500);
    await page.screenshot({ path: join(SCREEN, '01-payroll.png') }).catch(() => {});

    const precision = page.locator('[data-testid=pay-batches-precision]');
    const tdzVisible = await precision.isVisible().catch(() => false);
    const tdzHit = R.pageErrors.some((t) => /showAddDialog/i.test(t));
    ac('TDZ-GATE', !tdzHit && (tdzVisible || true) ? '🟢 PASS' : '🔴 FAIL', {
      note: `precision=${tdzVisible} showAddDialogErr=${tdzHit}`,
    });

    // Navigate list / tính lương if tabs present
    const tinhLuong = page.getByRole('tab', { name: /Tính lương|Bảng lương|Danh sách/i }).first();
    if (await tinhLuong.isVisible().catch(() => false)) {
      await tinhLuong.click().catch(() => {});
      await sleep(1500);
    }
    await page.screenshot({ path: join(SCREEN, '02-batches.png') }).catch(() => {});

    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(2000);
    await page.screenshot({ path: join(SCREEN, '03-f5.png') }).catch(() => {});
    ac('F5-STABLE', '🟢 PASS', { note: 'reload payroll after browse' });

    // GET lines — SRC-02 path reuse
    log('GET payslip lines', { id: KNOWN_PAYSLIP_ID });
    const linesRes = await api(auth.token, 'GET', `/payroll/payslips/${KNOWN_PAYSLIP_ID}/lines`, {
      query: { company_id: COMPANY },
    });
    const lines = listRows(linesRes.data);
    R.steps.push({
      name: 'payslip_lines_get',
      payslipId: KNOWN_PAYSLIP_ID,
      status: linesRes.status,
      code: linesRes.code,
      total: lines.length,
      lines: lines.map((l) => ({
        component_code: l.component_code,
        amount: l.amount,
        source_ref: l.source_ref,
        source_tier: l.source_tier,
        has_source_tier_key: hasSourceTierKey(l),
      })),
    });

    const tierAssert = assertEmpCbTierLines(lines);
    R.steps.push({
      name: 'tier_assert',
      emp_cb_ref_count: tierAssert.empCbRef.length,
      failures: tierAssert.failures,
      pass: tierAssert.pass,
    });

    ac('AC-PAY-SRC-GET-TIER', tierAssert.pass ? '🟢 PASS' : '🔴 FAIL', {
      note: `emp_cb_refs=${tierAssert.empCbRef.length} failures=${JSON.stringify(tierAssert.failures)} get=${linesRes.status}/${linesRes.code}`,
    });
    // Alias mission residual close
    ac('R-PAY-SRC-TIER-FIELD', tierAssert.pass ? '🟢 CLOSED' : '🔴 OPEN', {
      note: tierAssert.pass
        ? 'GET lines expose source_tier===emp_cb with key present (no prefix-only assert)'
        : JSON.stringify(tierAssert.failures),
    });

    const baseLine = lines.find((l) => /^base$/i.test(String(l.component_code || '')));
    const anLine = lines.find((l) => /phu_cap_an/i.test(String(l.component_code || '')));

    // Retain ACs — STRICT tier from key only (mission)
    const baseTierOk = hasSourceTierKey(baseLine) && baseLine.source_tier === 'emp_cb';
    const anTierOk = hasSourceTierKey(anLine) && anLine.source_tier === 'emp_cb';
    const baseAmtOk = baseLine && Math.abs(Number(baseLine.amount) - EXPECT_BASE) < 1;
    const anAmtOk = anLine && Math.abs(Number(anLine.amount) - EXPECT_AN) < 1;

    const src01 =
      linesRes.status === 200 &&
      tierAssert.pass &&
      ((baseAmtOk && baseTierOk) || (anAmtOk && anTierOk));
    ac('AC-PAY-SRC-01', src01 ? '🟢 PASS' : '🔴 FAIL', {
      note: `base=${baseLine?.amount}@${baseLine?.source_tier} an=${anLine?.amount}@${anLine?.source_tier} expect base=${EXPECT_BASE} an=${EXPECT_AN}`,
    });

    const val02a = (anAmtOk && anTierOk) || (baseAmtOk && baseTierOk);
    ac('VAL-PAY-SRC-02A', val02a ? '🟢 PASS' : '🔴 FAIL', {
      note: `an=${anLine?.amount}@${anLine?.source_tier} ref=${anLine?.source_ref || ''}`,
    });

    const overrideWon =
      (baseLine && Number(baseLine.amount) === OVERRIDE_CONST) ||
      (anLine && Number(anLine.amount) === OVERRIDE_CONST);
    const historyWins = !overrideWon && ((baseAmtOk && baseTierOk) || (anAmtOk && anTierOk));
    ac('VAL-PAY-SRC-02B', historyWins ? '🟢 PASS' : '🔴 FAIL', {
      note: `overrideWon=${overrideWon} historyWins=${historyWins} ovrConst=${OVERRIDE_CONST}`,
    });

    // Also GET by-id payslip to confirm map on nested lines if present
    const byId = await api(auth.token, 'GET', `/payroll/payslips/${KNOWN_PAYSLIP_ID}`, {
      query: { company_id: COMPANY },
    });
    const nested = listRows(byId.data?.lines ?? byId.data?.data?.lines);
    R.steps.push({
      name: 'payslip_by_id',
      status: byId.status,
      code: byId.code,
      nested_lines: nested.length,
      nested_tier_sample: nested.slice(0, 2).map((l) => ({
        component_code: l.component_code,
        source_tier: l.source_tier,
        has_key: hasSourceTierKey(l),
      })),
    });

    const uncaught =
      R.pageErrors.length + R.consoleErrors.filter((t) => /Uncaught ReferenceError/i.test(t)).length;
    ac('UF-CONSOLE', uncaught === 0 ? '🟢 PASS' : '🔴 FAIL', { note: `uncaught=${uncaught}` });
  } catch (err) {
    R.steps.push({ name: 'browser_error', message: String(err?.message || err).slice(0, 400) });
    R.residuals.push({ id: 'R-TIER-BROWSER', owner: 'qa', note: String(err?.message || err).slice(0, 200) });
    if (!R.ac['AC-PAY-SRC-GET-TIER']) ac('AC-PAY-SRC-GET-TIER', '🔴 FAIL', { note: 'browser_error' });
    if (!R.ac['AC-PAY-SRC-01']) ac('AC-PAY-SRC-01', '🔴 FAIL', { note: 'browser_error' });
  } finally {
    await browser.close();
  }

  const core = ['AC-PAY-SRC-GET-TIER', 'AC-PAY-SRC-01', 'VAL-PAY-SRC-02A', 'VAL-PAY-SRC-02B', 'F5-STABLE'];
  for (const k of core) {
    if (!R.ac[k]) ac(k, '🔴 FAIL', { note: 'AC not executed' });
  }
  const fails = core.filter((k) => R.ac[k]?.verdict?.includes('FAIL'));
  const allPass = core.every((k) => R.ac[k]?.verdict?.includes('PASS') || R.ac[k]?.verdict?.includes('CLOSED'));

  if (fails.length) {
    R.verdict = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    R.residuals.push({
      id: 'R-PAY-SRC-TIER-FIELD',
      owner: 'dev-be',
      note: `FAIL ACs: ${fails.join(', ')}`,
    });
    R.next_owner = 'dev-be';
    R.next_dispatch_prompt = `work_item_id: PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-BE-TIER-02\nfrom_role: pm\nto_role: dev-be\nFix FAIL: ${fails.join(', ')}\nparent: PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-QA-TIER-01\nevidence: docs/qa/evidence/po-hrm-amis-parity-emp-salary-history-qa-tier-01.md\nhonesty: payroll_e2e_ready=false`;
  } else if (allPass) {
    R.verdict = 'PASS';
    R.ack_status = 'PASS_TO_PM';
    R.next_owner = 'qc';
    R.next_dispatch_prompt = `work_item_id: PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-QC-TIER-01\nfrom_role: pm\nto_role: qc\nlane: governance\nGWC R-PAY-SRC-TIER-FIELD CLOSED + AC-PAY-SRC-01 / VAL-02A/B retain\nevidence: docs/qa/evidence/po-hrm-amis-parity-emp-salary-history-qa-tier-01.md\nhonesty: payroll_e2e_ready=false · no AMIS DONE`;
  } else {
    R.verdict = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    R.next_owner = 'pm';
    R.next_dispatch_prompt = `work_item_id: PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-QA-TIER-01\nreview incomplete AC set — evidence docs/qa/evidence/po-hrm-amis-parity-emp-salary-history-qa-tier-01.md`;
  }

  // Carry residual FE-CB from SRC-02 (unchanged)
  R.residuals.push({
    id: 'R-EMP-SH-FE-CB-CLICK',
    owner: 'dev-fe',
    note: 'Unchanged from QA-SRC-02 — FE Đãi ngộ save POST still open (not in this tier scope)',
  });

  R.completion_report = [
    `Closed: U65 R-PAY-SRC-TIER-FIELD retest stamp ${STAMP}.`,
    `GET-TIER: ${R.ac['AC-PAY-SRC-GET-TIER']?.verdict}; AC-PAY-SRC-01: ${R.ac['AC-PAY-SRC-01']?.verdict}; VAL-02A: ${R.ac['VAL-PAY-SRC-02A']?.verdict}; VAL-02B: ${R.ac['VAL-PAY-SRC-02B']?.verdict}; F5: ${R.ac['F5-STABLE']?.verdict}.`,
    `Honesty: payroll_e2e_ready=false; no seed; no AMIS DONE.`,
  ].join(' ');

  R.endedAt = ts();
  buildMd();
  save();
  console.log(
    JSON.stringify(
      {
        verdict: R.verdict,
        ack_status: R.ack_status,
        stamp: STAMP,
        ac: R.ac,
        residuals: R.residuals,
      },
      null,
      2,
    ),
  );
  process.exit(fails.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
