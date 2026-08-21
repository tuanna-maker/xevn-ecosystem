#!/usr/bin/env node
/**
 * PO-HRM-E2E-LINK-PAY-ATT-412-QA-01 — U65 browser Khóa / process after att-close + enroll
 * Expect with closed Jan sheet: POST …/process → 2xx; else 412 HRM-PAY-ATT-412 → FAIL
 * cấm seed · cấm claim payroll module UAT
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL_CANDIDATES = [
  process.env.PORTAL_DEV_URL,
  'http://127.0.0.1:5175',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:8088',
].filter(Boolean);

const HRM = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
const EMAIL = 'ceo@xe.vn';
const PASSWORD = process.env.PORTAL_DEV_PASSWORD || 'Xevn@2026';
const COMPANY = 'main';
const TENANT = 'xevn';
const TARGET_PERIOD_ID = 'dffbb1fe-05b7-4f6e-91f1-0a6c6e739ad8';
const PAY_MONTH = 1;
const PAY_YEAR = 2026;
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-e2e-link-pay-att-412-qa-01-browser.json');
const OUT_MD = resolve(ROOT, 'docs/qa/evidence/po-hrm-e2e-link-pay-att-412-qa-01.md');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-e2e-link-pay-att-412-qa-01');
mkdirSync(SCREEN, { recursive: true });

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const R = {
  work_item_id: 'PO-HRM-E2E-LINK-PAY-ATT-412-QA-01',
  parent: 'PO-HRM-E2E-LINK-PAY-ATT-CLOSE-QC-01 GWC — CONDITION R-PAY-HIRE-ATT-412-BROWSER OPEN',
  u65: 'zero-seed · browser-only · cấm seed',
  hdsd_align: 'Tiền lương → Path A Jan draft → Khóa bảng lương → confirm → F5',
  honesty: {
    payroll_e2e_ready: 'narrow (prior AC-04∧05; this seat = ATT-412 browser only)',
    payroll_module_uat: 'DENIED',
    product_go: 'DENIED',
  },
  env: { PORTAL: null, HRM, XBOS, EMAIL, commit: COMMIT, targetPeriodId: TARGET_PERIOD_ID },
  l0: {},
  clicks: [],
  pathA: {},
  preLock: {},
  lock: {},
  network: { pay: [], process: [], processBodies: [] },
  consoleErrors: [],
  pageErrors: [],
  criteria: {},
  residuals: [],
  verdict: null,
  ack_status: null,
  startedAt: new Date().toISOString(),
  endedAt: null,
};

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(R, null, 2));
}

function click(step, detail) {
  R.clicks.push({ step, detail, at: new Date().toISOString() });
  save();
}

async function pickPortal() {
  for (const url of PORTAL_CANDIDATES) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(6000) });
      if (r.status === 200) return url.replace(/\/$/, '');
    } catch {
      /* */
    }
  }
  return PORTAL_CANDIDATES[0]?.replace(/\/$/, '') || 'http://127.0.0.1:5175';
}

function q(portal, path) {
  const u = new URL(path, portal);
  u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', TENANT);
  u.searchParams.set('companyId', COMPANY);
  return u.toString();
}

async function loginApi(portal) {
  for (const url of [`${portal}/api/xbos/auth/login`, `${XBOS}/api/xbos/auth/login`]) {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
    });
    const j = await r.json().catch(() => ({}));
    const data = j?.data ?? j;
    const token = data?.accessToken ?? data?.access_token;
    if (token) {
      const u = data?.user ?? {};
      return {
        token,
        email: EMAIL,
        expiresAt: Date.now() + 8 * 3600_000,
        companyId: COMPANY,
        user: {
          userId: u.userId || u.id || EMAIL,
          email: u.email || EMAIL,
          displayName: u.displayName || u.fullName || EMAIL,
          roles: u.roles || ['group_ceo'],
        },
      };
    }
  }
  throw new Error('loginApi failed');
}

async function injectPortalAuth(page, session) {
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
    { s: session },
  );
}

function trackNetwork(page) {
  page.on('request', (req) => {
    const url = req.url();
    if (/\/api\/hrm\/payroll\/periods\/[^/]+\/process/.test(url) && req.method() === 'POST') {
      let body = null;
      let parseErr = null;
      try {
        body = JSON.parse(req.postData() || '{}');
      } catch (e) {
        parseErr = String(e?.message || e).slice(0, 80);
      }
      R.network.processBodies.push({
        url: url.slice(0, 240),
        bodySnippet: body ? JSON.stringify(body).slice(0, 240) : (req.postData() || '').slice(0, 120),
        parseErr,
      });
      save();
    }
  });
  page.on('response', async (res) => {
    const u = res.url();
    const status = res.status();
    const method = res.request().method();
    if (/\/api\/hrm\/payroll\//.test(u)) {
      const entry = { method, status, url: u.slice(0, 240) };
      try {
        if (method !== 'GET') {
          const j = await res.json().catch(() => ({}));
          entry.code = j?.code ?? j?.data?.code;
          entry.message = String(j?.message || j?.data?.message || '').slice(0, 200);
          if (method === 'POST' && /\/process/.test(u)) {
            entry.bodySnippet = JSON.stringify(j).slice(0, 400);
          }
        }
      } catch {
        /* */
      }
      R.network.pay.push(entry);
      if (method === 'POST' && /\/process/.test(u)) {
        R.network.process.push(entry);
      }
      save();
    }
  });
}

async function shot(page, name) {
  await page.screenshot({ path: join(SCREEN, name), fullPage: false });
}

async function waitPayrollDetail(page) {
  const addBtn = page.locator('[data-testid="pay-batch-add-emp-btn"]');
  const lockBtn = page.getByRole('button', { name: /Khóa bảng lương/i });
  for (let i = 0; i < 24; i++) {
    if ((await addBtn.isVisible().catch(() => false)) || (await lockBtn.isVisible().catch(() => false))) {
      return true;
    }
    const calcTab = page.getByRole('tab', { name: /Tính lương/i }).or(page.getByText(/Tính lương/i)).first();
    if (await calcTab.isVisible().catch(() => false)) {
      await calcTab.click().catch(() => {});
    }
    await sleep(500);
  }
  return (await addBtn.isVisible().catch(() => false)) || (await lockBtn.isVisible().catch(() => false));
}

function buildMarkdown() {
  const c = R.criteria;
  const proc = R.network.process[0] || {};
  const lines = [
    '# Evidence — PO-HRM-E2E-LINK-PAY-ATT-412-QA-01',
    '',
    '| Field | Value |',
    '|-------|-------|',
    '| work_item_id | `PO-HRM-E2E-LINK-PAY-ATT-412-QA-01` |',
    '| from_role | qa |',
    '| to_role | pm |',
    `| ack_status | **\`${R.ack_status}\`** |`,
    `| verdict | **${R.verdict}** |`,
    `| date | ${new Date().toISOString().slice(0, 10)} |`,
    `| persona / URL | \`${EMAIL}\` / \`Xevn@2026\` · ${R.env.PORTAL}/hr · \`company_id=main\` |`,
    '| u65 | zero-seed · browser-only · cấm seed |',
    '| honesty | `payroll_e2e_ready` narrow prior AC-04∧05 · **module UAT DENIED** · product GO DENIED |',
    '| parent | `PO-HRM-E2E-LINK-PAY-ATT-CLOSE-QC-01` GWC CONDITION R-PAY-HIRE-ATT-412-BROWSER |',
    `| env | portal=${R.env.PORTAL} · hrm=${HRM} · xbos=${XBOS} · commit=${COMMIT} |`,
    '| machine | `docs/qa/evidence/_tmp-po-hrm-e2e-link-pay-att-412-qa-01-browser.json` |',
    '| screenshots | `docs/qa/evidence/screens/po-hrm-e2e-link-pay-att-412-qa-01/` |',
    '| period | `dffbb1fe-05b7-4f6e-91f1-0a6c6e739ad8` (Jan 2026) |',
    '',
    '## L0 stack',
    '',
    '| Service | Status |',
    '|---------|--------|',
    `| hrm-api | ${R.l0.hrm} |`,
    `| xbos-api | ${R.l0.xbos} |`,
    `| portal | ${R.l0.portal} |`,
    '',
    '## Executive summary',
    '',
    R.executive || '—',
    '',
    '## UF / Journey',
    '',
    '| ID | Click path | Result |',
    '|----|------------|--------|',
    `| **Path A** | deep-link month=1 year=2026 batch=${TARGET_PERIOD_ID} | ${c.pathA ?? '—'} |`,
    `| **Pre-lock** | emp row ≥1 + Khóa visible | ${c.preLock ?? '—'} |`,
    `| **ATT-412-BROWSER** | Khóa → confirm → POST /process | ${c.lockProcess ?? '—'} |`,
    `| **FE after 2xx + F5** | status / locked UI persists | ${c.feAfterF5 ?? '—'} |`,
    '',
    '## FE click path',
    '',
    '1. Login `ceo@xe.vn` · Path A deep-link Jan draft',
    '2. Assert employee row (UAT-0100 or count≥1) + «Khóa bảng lương» visible',
    '3. Click «Khóa bảng lương» → dialog → confirm «Khóa bảng lương»',
    '4. Capture Network POST `…/process`',
    '5. Observe FE after response · F5',
    '',
    '## Pre-lock state',
    '',
    '```json',
    JSON.stringify(R.preLock, null, 2),
    '```',
    '',
    '## Lock / process Network',
    '',
    '| Field | Value |',
    '|-------|-------|',
    `| POST /process status | **${proc.status ?? '—'}** |`,
    `| code | \`${proc.code ?? '—'}\` |`,
    `| message | ${proc.message || '—'} |`,
    `| url | ${proc.url || '—'} |`,
    '',
    '```json',
    JSON.stringify({ process: R.network.process, bodies: R.network.processBodies, lock: R.lock }, null, 2),
    '```',
    '',
    '## FE after mutate + F5',
    '',
    '```json',
    JSON.stringify(R.lock.feAfter || {}, null, 2),
    '```',
    '',
    '## Acceptance criteria',
    '',
    '| AC / Check | Verdict | Notes |',
    '|------------|---------|-------|',
    `| L0 stack | ${c.l0 ?? '—'} | |`,
    `| Path A detail open | ${c.pathA ?? '—'} | |`,
    `| Emp row ≥1 + Khóa visible | ${c.preLock ?? '—'} | |`,
    `| Click Khóa → confirm → POST process | ${c.lockClicked ?? '—'} | |`,
    `| Process **2xx** (closed att sheet) OR document **412** | ${c.lockProcess ?? '—'} | expect 2xx when sheet closed |`,
    `| FE after + F5 | ${c.feAfterF5 ?? '—'} | |`,
    `| U65 zero-seed | PASS | no seed in path |`,
    `| Module UAT claim | DENIED | honesty |`,
    '',
    '## Residual',
    '',
    '| Id | Status | Sev | Owner | Note |',
    '|----|--------|-----|-------|------|',
    ...(R.residuals.length
      ? R.residuals.map(
          (r) =>
            `| **${r.id}** | ${r.status} | ${r.sev || '—'} | ${r.owner || '—'} | ${r.note || ''} |`,
        )
      : ['| (none product) | — | — | — | — |']),
    '',
    '## not promoted',
    '',
    '| Item | Reason |',
    '|------|--------|',
    '| Payroll **module** UAT | C-SLICE-≠-MODULE |',
    '| Production GO | Out of scope |',
    '| Phase 1 DONE | Program gates open |',
    '',
    '## Screenshots',
    '',
    '| File | Meaning |',
    '|------|---------|',
    '| `01-path-a-detail.png` | Jan draft detail pre-lock |',
    '| `02-lock-dialog.png` | Confirm dialog |',
    '| `03-after-process.png` | FE after process response |',
    '| `04-after-f5.png` | F5 persistence |',
    '',
    '## Commands',
    '',
    '```bash',
    'pnpm run qc:dev-stack',
    'pnpm run qc:fe-be-health',
    'node scripts/qa/_tmp-po-hrm-e2e-link-pay-att-412-qa-01.mjs',
    '```',
    '',
    '| Check | Result |',
    '|-------|--------|',
    `| L0 | ${c.l0 ?? '—'} |`,
    `| Browser Khóa path | ${c.lockProcess ?? '—'} |`,
    '| Seed used | none |',
    '',
    '## completion_report',
    '',
    R.completion_report || '—',
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
    '## ack_status',
    '',
    `**${R.ack_status}**`,
    '',
  ];
  return lines.join('\n');
}

async function main() {
  R.env.PORTAL = await pickPortal();
  for (const [k, url] of [
    ['hrm', `${HRM}/api/hrm`],
    ['xbos', `${XBOS}/api/xbos`],
    ['portal', R.env.PORTAL],
  ]) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
      R.l0[k] = r.status;
    } catch (e) {
      R.l0[k] = `ERR ${String(e?.message || e).slice(0, 60)}`;
    }
  }
  R.criteria.l0 =
    R.l0.hrm === 200 && R.l0.xbos === 200 && R.l0.portal === 200 ? 'PASS' : 'FAIL';
  save();

  if (R.criteria.l0 !== 'PASS') {
    R.verdict = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    R.executive = 'L0 FAIL — stack not healthy; browser not run.';
    R.residuals.push({ id: 'L0-STACK', status: 'OPEN', sev: 'P0', owner: 'devops', note: JSON.stringify(R.l0) });
    writeFileSync(OUT_MD, buildMarkdown());
    save();
    process.exit(2);
  }

  const session = await loginApi(R.env.PORTAL);
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  page.on('console', (msg) => {
    if (msg.type() === 'error') R.consoleErrors.push(String(msg.text()).slice(0, 200));
  });
  page.on('pageerror', (err) => R.pageErrors.push(String(err?.message || err).slice(0, 200)));
  trackNetwork(page);
  await injectPortalAuth(page, session);

  const deep = q(
    R.env.PORTAL,
    `/hr/payroll?pay_period_month=${PAY_MONTH}&pay_period_year=${PAY_YEAR}&pay_batch_id=${TARGET_PERIOD_ID}`,
  );
  click('PathA', deep);
  await page.goto(deep, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await sleep(2500);
  const detailOk = await waitPayrollDetail(page);
  await shot(page, '01-path-a-detail.png');

  R.pathA = {
    url: page.url(),
    detailOk,
    hrefHasBatch: page.url().includes(TARGET_PERIOD_ID),
  };
  R.criteria.pathA = detailOk && R.pathA.hrefHasBatch ? 'PASS' : 'FAIL';

  const uatRow = await page.getByText(/UAT-0100/i).first().isVisible().catch(() => false);
  const emptyHint = await page.getByText(/Chưa có nhân viên/i).isVisible().catch(() => false);
  const empCountText = await page
    .locator('text=/Số nhân viên/i')
    .locator('xpath=..')
    .innerText()
    .catch(() => '');
  const empCountMatch = empCountText.match(/(\d+)/);
  const empCount = empCountMatch ? Number(empCountMatch[1]) : uatRow ? 1 : emptyHint ? 0 : -1;
  const lockVisible = await page.getByRole('button', { name: /Khóa bảng lương/i }).first().isVisible().catch(() => false);

  R.preLock = { uatRow, emptyHint, empCount, empCountText: empCountText.slice(0, 80), lockVisible };
  R.criteria.preLock = (uatRow || empCount >= 1) && lockVisible ? 'PASS' : 'FAIL';
  save();

  if (R.criteria.preLock !== 'PASS') {
    R.verdict = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    R.executive = `Pre-lock FAIL — empCount=${empCount} uatRow=${uatRow} lockVisible=${lockVisible}. Cannot exercise Khóa.`;
    R.residuals.push({
      id: 'R-PAY-HIRE-ATT-412-BROWSER',
      status: 'OPEN',
      sev: 'P2',
      owner: 'dev-fe',
      note: 'Khóa or enrolled emp missing on Path A detail',
    });
    writeFileSync(OUT_MD, buildMarkdown());
    save();
    await browser.close();
    process.exit(1);
  }

  // Click Khóa → confirm
  const procBefore = R.network.process.length;
  click('lock-open', 'Khóa bảng lương');
  await page.getByRole('button', { name: /Khóa bảng lương/i }).first().click({ timeout: 15_000 });
  await sleep(600);
  await shot(page, '02-lock-dialog.png');
  const dialogTitle = await page.getByRole('heading', { name: /Khóa bảng lương/i }).isVisible().catch(() => false);
  const confirmBtn = page.locator('[role="dialog"]').getByRole('button', { name: /^Khóa bảng lương$/ });
  const confirmVisible = await confirmBtn.isVisible().catch(() => false);
  click('lock-confirm', `dialog=${dialogTitle} confirm=${confirmVisible}`);
  if (confirmVisible) {
    await confirmBtn.click();
  } else {
    // fallback: last matching button (dialog footer)
    await page.getByRole('button', { name: /^Khóa bảng lương$/ }).last().click();
  }
  await sleep(4500);
  await shot(page, '03-after-process.png');

  const procPosts = R.network.process.slice(procBefore);
  const proc = procPosts[0] || null;
  R.lock = {
    dialogTitle,
    confirmVisible,
    procPosts,
    processStatus: proc?.status ?? null,
    processCode: proc?.code ?? null,
    processMessage: proc?.message ?? null,
  };
  R.criteria.lockClicked = proc ? 'PASS' : 'FAIL';

  const status = proc?.status;
  const code = String(proc?.code || '');
  let lockProcessVerdict = 'FAIL';
  if (status >= 200 && status < 300) {
    lockProcessVerdict = 'PASS';
  } else if (status === 412 || code.includes('ATT-412') || code === 'HRM-PAY-ATT-412') {
    lockProcessVerdict = 'FAIL';
    R.residuals.push({
      id: 'R-PAY-HIRE-ATT-412',
      status: 'OPEN',
      sev: 'P0',
      owner: 'dev-be',
      note: `Browser POST process → ${status} ${code} — same-month/OU gate despite closed sheet (prior API ATT-412 baseline)`,
    });
  } else if (!proc) {
    lockProcessVerdict = 'FAIL';
    R.residuals.push({
      id: 'R-PAY-HIRE-ATT-412-BROWSER',
      status: 'OPEN',
      sev: 'P1',
      owner: 'dev-fe',
      note: 'Khóa confirm clicked but no POST /process captured',
    });
  } else {
    lockProcessVerdict = 'FAIL';
    R.residuals.push({
      id: 'R-PAY-PROCESS-UNEXPECTED',
      status: 'OPEN',
      sev: 'P0',
      owner: 'dev-be',
      note: `POST process → ${status} ${code} ${proc?.message || ''}`,
    });
  }
  R.criteria.lockProcess = lockProcessVerdict;

  // FE after
  const lockedBadge = await page.getByText(/Đã khóa|processed|Đã xử lý/i).first().isVisible().catch(() => false);
  const errorToast = await page
    .getByText(/Lỗi khi khóa|Attendance sheet must be closed|chưa chốt|412|HRM-PAY-ATT|NO_CLOSED/i)
    .first()
    .isVisible()
    .catch(() => false);
  const successToast = await page
    .getByText(/Đã khóa|khóa thành công|xử lý thành công|đã tính lương/i)
    .first()
    .isVisible()
    .catch(() => false);
  const lockStillEditable = await page.getByRole('button', { name: /Khóa bảng lương/i }).first().isVisible().catch(() => false);

  R.lock.feAfter = {
    lockedBadge,
    errorToast,
    successToast,
    lockStillEditable,
    beforeF5: true,
  };

  // F5 — do not wait for editable controls (processed/closed has no Khóa/add-emp)
  click('F5', 'reload');
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 60_000 });
  await sleep(3500);
  await shot(page, '04-after-f5.png');

  const bodyText = await page.locator('body').innerText().catch(() => '');
  const afterF5 = {
    lockedBadge: await page.getByText(/Đã khóa|processed|Đã xử lý|Đã đóng/i).first().isVisible().catch(() => false),
    lockStillEditable: await page.getByRole('button', { name: /Khóa bảng lương/i }).first().isVisible().catch(() => false),
    uatRow: await page.getByText(/UAT-0100/i).first().isVisible().catch(() => false),
    bodyHasProcessed: /Đã khóa|processed|Đã xử lý|Đã đóng/i.test(bodyText),
    url: page.url(),
  };
  R.lock.feAfter.f5 = afterF5;

  if (lockProcessVerdict === 'PASS') {
    R.criteria.feAfterF5 =
      afterF5.lockedBadge || !afterF5.lockStillEditable || successToast || lockedBadge ? 'PASS' : 'PARTIAL';
    R.residuals.push({
      id: 'R-PAY-HIRE-ATT-412-BROWSER',
      status: 'CLOSED',
      sev: 'P2',
      owner: 'qa',
      note: `Browser Khóa → process ${status} ${code || '2xx'} · recommend QC delta close CONDITION`,
    });
  } else {
    R.criteria.feAfterF5 = errorToast || status === 412 ? 'PASS (error path observed)' : 'N/A';
  }

  const allPass =
    R.criteria.l0 === 'PASS' &&
    R.criteria.pathA === 'PASS' &&
    R.criteria.preLock === 'PASS' &&
    R.criteria.lockClicked === 'PASS' &&
    R.criteria.lockProcess === 'PASS';

  R.verdict = allPass ? 'PASS' : 'FAIL';
  R.ack_status = allPass ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  R.executive = allPass
    ? `U65 browser Khóa on Jan draft dffbb1fe… (UAT-0100 enrolled) → POST process **${status}** ${code || ''} · FE after + F5 observed. Recommend close R-PAY-HIRE-ATT-412-BROWSER. Module UAT DENIED.`
    : `U65 browser Khóa FAIL — process status=${status ?? 'none'} code=${code || '—'} msg=${proc?.message || '—'}. PreLock=${R.criteria.preLock} lockClicked=${R.criteria.lockClicked}.`;

  R.completion_report = allPass
    ? `- **Closed:** Browser Path A → emp≥1 → Khóa → confirm → POST /process **${status}** · FE+F5. Residual R-PAY-HIRE-ATT-412-BROWSER **CLOSED** (recommend QC delta).\n- **NOT claimed:** payroll module UAT · production GO · Phase 1 DONE.\n- **Honesty:** payroll_e2e_ready remains narrow (AC-04∧05 + ATT-412 browser); ≠ module UAT.`
    : `- **Open:** ATT-412 browser path FAIL (see residuals).\n- **Captured:** process=${status} code=${code} body=${(proc?.bodySnippet || '').slice(0, 120)}\n- **NOT claimed:** module UAT.`;

  R.next_owner = allPass ? 'qc' : code.includes('ATT-412') || status === 412 ? 'dev-be' : 'pm';
  R.next_dispatch_prompt = allPass
    ? `work_item_id: PO-HRM-E2E-LINK-PAY-ATT-412-QC-01
from_role: pm
to_role: qc
lane: governance
parent: PO-HRM-E2E-LINK-PAY-ATT-412-QA-01 PASS_TO_PM
read_first: docs/qa/evidence/po-hrm-e2e-link-pay-att-412-qa-01.md
entry: browser Khóa → POST process 2xx on period dffbb1fe… with closed att + UAT-0100 enrolled
exit: GWC/GO delta — close CONDITION R-PAY-HIRE-ATT-412-BROWSER; cấm module UAT / production GO
evidence_path: docs/qa/evidence/po-hrm-e2e-link-pay-att-412-qc-01.md`
    : `work_item_id: PO-HRM-E2E-LINK-PAY-ATT-412-BE-01
from_role: pm
to_role: ${R.next_owner === 'dev-be' ? 'dev-be' : 'dev-fe'}
lane: execution
parent: PO-HRM-E2E-LINK-PAY-ATT-412-QA-01 FAIL_TO_PM
read_first: docs/qa/evidence/po-hrm-e2e-link-pay-att-412-qa-01.md
facts: POST process status=${status} code=${code} message=${(proc?.message || '').slice(0, 120)}
entry: Jan att sheet closed (QA-02) + enroll UAT-0100 (QA-03); expect process 2xx
exit: process 2xx with closed sheet OR documented same-month/OU gate fix + READY_FOR_QA
evidence_path: docs/qa/evidence/po-hrm-e2e-link-pay-att-412-be-01.md
cấm: seed · claim module UAT`;

  writeFileSync(OUT_MD, buildMarkdown());
  R.endedAt = new Date().toISOString();
  save();
  await browser.close();
  console.log(JSON.stringify({ verdict: R.verdict, ack: R.ack_status, process: proc, criteria: R.criteria }, null, 2));
  process.exit(allPass ? 0 : 1);
}

main().catch((e) => {
  R.verdict = 'FAIL';
  R.ack_status = 'FAIL_TO_PM';
  R.executive = `Harness crash: ${String(e?.message || e).slice(0, 200)}`;
  R.residuals.push({ id: 'HARNESS', status: 'OPEN', sev: 'P0', owner: 'qa', note: String(e?.stack || e).slice(0, 300) });
  try {
    writeFileSync(OUT_MD, buildMarkdown());
    save();
  } catch {
    /* */
  }
  console.error(e);
  process.exit(2);
});
