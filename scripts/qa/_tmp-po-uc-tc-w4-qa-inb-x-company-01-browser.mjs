#!/usr/bin/env node
/**
 * PO-UC-TC-W4-QA-INB-X-COMPANY-01 — Inbox complete x-company-id header smoke (U65)
 * LOCKS: zero-seed · no invent Leave L2 · no reopen DEPT · header-only mission
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
const HRM = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-uc-tc-w4-qa-inb-x-company-01-browser.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-uc-tc-w4-qa-inb-x-company-01');
mkdirSync(SCREEN, { recursive: true });

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

const results = {
  work_item_id: 'PO-UC-TC-W4-QA-INB-X-COMPANY-01',
  startedAt: ts(),
  u65: 'zero-seed',
  uat_done: false,
  evidence_dev: 'docs/qa/evidence/po-uc-tc-w4-dev-fe-inb-x-company-01.md',
  prior: 'docs/qa/evidence/po-uc-tc-w4-qa-e1-p1-inb-cv.md',
  env: { PORTAL, XBOS, HRM, EMAIL, commit: COMMIT },
  hdsd_inventory: [
    'Login portal (ceo@xe.vn)',
    'Hộp thư /command-center/inbox',
    'Mở chi tiết leave FE-origin (if any) → Duyệt',
    'Assert POST …/tasks/:id/complete header x-company-id=main + 2xx XBOS-WF-200',
  ],
  l0: {},
  steps: {},
  click_log: [],
  network: [],
  requestHeaders: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  residuals: [],
  capture: {
    listGet: null,
    completePost: null,
    listHeader: null,
    completeHeader: null,
  },
  endedAt: null,
  overall: null,
};

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(results, null, 2));
}
function log(msg, extra = {}) {
  const row = { at: ts(), msg, ...extra };
  results.click_log.push(row);
  console.error(`[${results.click_log.length}] ${msg}`, extra.note || '');
  return row;
}
function recordStep(id, verdict, detail = {}) {
  results.steps[id] = { ...detail, verdict, at: ts() };
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 400)}`);
  save();
}
async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  results.screens.push(path.replace(/\\/g, '/'));
  return path;
}

function track(page) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') results.consoleErrors.push(String(msg.text()).slice(0, 280));
  });
  page.on('pageerror', (err) => results.pageErrors.push(String(err).slice(0, 280)));
  page.on('request', (req) => {
    try {
      const u = req.url();
      if (!/\/api\/xbos\//.test(u)) return;
      if (req.method() === 'OPTIONS') return;
      if (!/workflow-engine/.test(u)) return;
      const h = req.headers();
      const allKeys = Object.keys(h || {});
      const companyKey = allKeys.find((k) => k.toLowerCase() === 'x-company-id');
      const tenantKey = allKeys.find((k) => k.toLowerCase() === 'x-tenant-id');
      results.requestHeaders.push({
        method: req.method(),
        url: u.replace(/^https?:\/\/[^/]+/, ''),
        xCompanyId: companyKey ? h[companyKey] : null,
        xTenantId: tenantKey ? h[tenantKey] : null,
        headerKeys: allKeys.filter((k) => /company|tenant|authorization/i.test(k)).slice(0, 8),
        at: ts(),
      });
    } catch {
      /* */
    }
  });
  page.on('response', async (res) => {
    try {
      const u = res.url();
      if (!/\/api\/xbos\//.test(u)) return;
      const method = res.request().method();
      if (method === 'OPTIONS') return;
      const entry = {
        method,
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, ''),
        at: ts(),
      };
      if (/\/auth\/login|\/workflow-engine/.test(u)) {
        try {
          const body = await res.json();
          entry.code = body?.code || null;
          entry.message = String(body?.message || '').slice(0, 180);
        } catch {
          /* */
        }
      }
      results.network.push(entry);
    } catch {
      /* */
    }
  });
}

async function l0() {
  for (const [key, url] of [
    ['hrm', `${HRM}/api/hrm`],
    ['xbos', `${XBOS}/api/xbos`],
    ['portal', PORTAL],
  ]) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
      results.l0[key] = r.status;
    } catch (e) {
      results.l0[key] = `ERR ${String(e).slice(0, 80)}`;
    }
  }
  const ok =
    results.l0.hrm === 200 && results.l0.xbos === 200 && Number(results.l0.portal) === 200;
  recordStep('L0', ok ? 'PASS' : 'FAIL', { summary: JSON.stringify(results.l0) });
  if (!ok) throw new Error(`L0 FAIL ${JSON.stringify(results.l0)}`);
}

async function clearAuth(page) {
  await page.goto(`${PORTAL}/login`, { waitUntil: 'domcontentloaded', timeout: 90000 }).catch(() => {});
  await page.evaluate(() => {
    for (const store of [localStorage, sessionStorage]) store.clear();
  });
}

async function loginUi(page) {
  await clearAuth(page);
  await page.goto(`${PORTAL}/login`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(500);
  const emailInput = page
    .locator('input[type="email"], input[name="email"], input[autocomplete="username"]')
    .first();
  const passInput = page
    .locator('input[type="password"], input[name="password"], input[autocomplete="current-password"]')
    .first();
  await emailInput.waitFor({ state: 'visible', timeout: 20000 });
  await emailInput.fill('');
  await emailInput.fill(EMAIL);
  await passInput.fill('');
  await passInput.fill(PASSWORD);
  const before = results.network.length;
  await page
    .locator('button[type="submit"], button')
    .filter({ hasText: /Đăng nhập|Login/i })
    .first()
    .click();
  log('LOGIN_CEO');
  await sleep(2500);
  const loginNet = results.network
    .slice(before)
    .filter((n) => /\/auth\/login/.test(n.url) && n.method === 'POST')
    .pop();
  if (!loginNet || loginNet.status >= 400) {
    throw new Error(`CEO login fail status=${loginNet?.status} code=${loginNet?.code}`);
  }
  recordStep('LOGIN', 'PASS', {
    summary: `POST login ${loginNet.status} ${loginNet.code || ''}`.trim(),
  });
  await page.goto(`${PORTAL}/command-center`, {
    waitUntil: 'domcontentloaded',
    timeout: 90000,
  });
  await sleep(1000);
  await shot(page, '01-cc');
}

async function runInboxHeaderSmoke(page) {
  await page.goto(`${PORTAL}/command-center/inbox`, {
    waitUntil: 'domcontentloaded',
    timeout: 90000,
  });
  await sleep(2500);
  await shot(page, '02-inbox');

  const listHdr = [...results.requestHeaders]
    .reverse()
    .find((h) => h.method === 'GET' && /workflow-engine\/tasks/.test(h.url) && !/\/complete|\/reject/.test(h.url));
  const listGet = [...results.network]
    .reverse()
    .find(
      (n) =>
        n.method === 'GET' &&
        /workflow-engine\/tasks/.test(n.url) &&
        !/\/complete|\/reject/.test(n.url),
    );
  results.capture.listHeader = listHdr || null;
  results.capture.listGet = listGet || null;

  const body = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
  const cards = page.locator('[data-testid="cc-inbox-task-card"]');
  const cardCount = await cards.count().catch(() => 0);
  const emptyUi =
    /Không có việc cần xử lý|không có tác vụ|Chưa có nhiệm vụ|Hộp thư trống|0 tác vụ/i.test(body);
  const empty = emptyUi || cardCount === 0;

  recordStep('INB-LIST', empty ? 'BLOCKED' : 'PASS', {
    summary: `empty=${empty} cards=${cardCount} get=${listGet?.status} code=${listGet?.code} x-company-id=${listHdr?.xCompanyId ?? 'null'}`,
  });

  if (listHdr?.xCompanyId === 'main') {
    recordStep('INB-LIST-HDR', 'PASS', { summary: 'GET tasks x-company-id=main' });
  } else if (listHdr) {
    recordStep('INB-LIST-HDR', 'FAIL', {
      summary: `GET tasks x-company-id=${listHdr.xCompanyId ?? 'null'} (expect main)`,
    });
  } else {
    recordStep('INB-LIST-HDR', 'PARTIAL', {
      summary: 'GET tasks header not captured',
    });
  }

  if (empty) {
    recordStep('INB-APPR-HDR', 'BLOCKED', {
      summary:
        'Inbox empty — 🟡 BLOCKED honest U65; need FE-spawn leave/WF first (cấm seed). Cannot assert POST complete header.',
    });
    results.residuals.push({
      id: 'R-W4-INB-XCO-SPAWN',
      owner: 'qa',
      note: 'Inbox empty — FE-spawn required before complete header smoke; U65 no seed',
    });
    results.overall = 'BLOCKED';
    return;
  }

  let feSpawnedIdx = -1;
  let feSpawnKind = null;
  for (let i = 0; i < Math.min(cardCount, 30); i++) {
    const card = cards.nth(i);
    const biz = await card.getAttribute('data-business-type').catch(() => null);
    const txt = ((await card.innerText().catch(() => '')) || '').replace(/\s+/g, ' ');
    if (
      biz === 'hrm_leave' ||
      /xbos-workflow/i.test(txt) ||
      /Phê duyệt đơn nghỉ phép|Nghỉ phép/i.test(txt)
    ) {
      feSpawnedIdx = i;
      feSpawnKind = biz || 'leave-text';
      break;
    }
  }

  if (feSpawnedIdx < 0) {
    recordStep('INB-APPR-HDR', 'BLOCKED', {
      summary: `cards=${cardCount} but no FE-origin leave/WF card; 🟡 BLOCKED honest (cấm seed)`,
    });
    results.residuals.push({
      id: 'R-W4-INB-XCO-SPAWN',
      owner: 'qa',
      note: `${cardCount} cards; no hrm_leave FE-origin — cannot smoke complete header without inventing Leave L2`,
    });
    results.overall = 'BLOCKED';
    return;
  }

  const target = cards.nth(feSpawnedIdx);
  await target.scrollIntoViewIfNeeded().catch(() => {});
  await shot(page, '03-target-card');

  const approveBtn = target.getByTestId(/hdsd-cc-leave-approve|cc-inbox-task-approve/);
  const before = results.network.length;
  const hdrBefore = results.requestHeaders.length;

  if (await approveBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
    await approveBtn.click();
    log('CLICK_INBOX_APPROVE', { note: String(feSpawnKind) });
  } else {
    const textBtn = target.locator('button').filter({ hasText: /Duyệt|Xử lý nhanh|Hoàn thành/i }).first();
    if (await textBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await textBtn.click();
      log('CLICK_INBOX_APPROVE_TEXT', { note: String(feSpawnKind) });
    } else {
      // open detail then Duyệt
      const detailLink = target.locator('a, button').filter({ hasText: /Mở chi tiết/i }).first();
      if (await detailLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        await detailLink.click();
        log('CLICK_INBOX_DETAIL');
        await sleep(2000);
        await shot(page, '04-detail');
        const detApprove = page
          .locator('button')
          .filter({ hasText: /Duyệt|Hoàn thành|Xác nhận/i })
          .first();
        if (await detApprove.isVisible({ timeout: 4000 }).catch(() => false)) {
          await detApprove.click();
          log('CLICK_DETAIL_APPROVE');
        } else {
          recordStep('INB-APPR-HDR', 'BLOCKED', {
            summary: 'Detail open but no Duyệt button visible',
          });
          results.overall = 'BLOCKED';
          return;
        }
      } else {
        recordStep('INB-APPR-HDR', 'BLOCKED', {
          summary: 'No Duyệt / Mở chi tiết control on FE-origin card',
        });
        results.overall = 'BLOCKED';
        return;
      }
    }
  }

  await sleep(3500);
  await shot(page, '05-after-approve');

  const completeNet = results.network
    .slice(before)
    .filter((n) => n.method === 'POST' && /tasks\/[^/]+\/complete/.test(n.url))
    .pop();
  const completeHdr = results.requestHeaders
    .slice(hdrBefore)
    .filter((h) => h.method === 'POST' && /tasks\/[^/]+\/complete/.test(h.url))
    .pop();

  results.capture.completePost = completeNet || null;
  results.capture.completeHeader = completeHdr || null;

  const hdrOk = completeHdr?.xCompanyId === 'main';
  const respOk =
    !!completeNet &&
    completeNet.status >= 200 &&
    completeNet.status < 300 &&
    (completeNet.code === 'XBOS-WF-200' || !completeNet.code);

  if (!completeNet) {
    recordStep('INB-APPR-HDR', 'FAIL', {
      summary: `No POST …/tasks/:id/complete captured; kind=${feSpawnKind}`,
    });
    results.residuals.push({
      id: 'R-W4-INB-XCO-NO-POST',
      owner: 'dev-fe',
      note: 'Duyệt clicked but complete POST not seen',
    });
    results.overall = 'FAIL';
    return;
  }

  if (hdrOk && respOk) {
    recordStep('INB-APPR-HDR', 'PASS', {
      summary: `POST ${completeNet.url} status=${completeNet.status} code=${completeNet.code} x-company-id=${completeHdr.xCompanyId}`,
    });
    results.overall = 'PASS';
    return;
  }

  if (!hdrOk) {
    recordStep('INB-APPR-HDR', 'FAIL', {
      summary: `POST complete status=${completeNet.status} code=${completeNet.code} x-company-id=${completeHdr?.xCompanyId ?? 'null'} (expect main)`,
    });
    results.residuals.push({
      id: 'R-W4E1-INB-X-COMPANY',
      owner: 'dev-fe',
      note: `complete header still ${completeHdr?.xCompanyId ?? 'null'} after FE fix`,
    });
    results.overall = 'FAIL';
    return;
  }

  recordStep('INB-APPR-HDR', 'FAIL', {
    summary: `header main OK but response not 2xx/WF-200: status=${completeNet.status} code=${completeNet.code}`,
  });
  results.residuals.push({
    id: 'R-W4-INB-XCO-RESP',
    owner: 'dev-be',
    note: `complete header main but status=${completeNet.status} code=${completeNet.code}`,
  });
  results.overall = 'FAIL';
}

async function main() {
  await l0();
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();
  track(page);
  try {
    await loginUi(page);
    await runInboxHeaderSmoke(page);
  } catch (e) {
    results.overall = results.overall || 'FAIL';
    recordStep('ERR', 'FAIL', { summary: String(e).slice(0, 400) });
    results.residuals.push({ id: 'R-W4-INB-XCO-ERR', owner: 'qa', note: String(e).slice(0, 240) });
    await shot(page, '99-error').catch(() => {});
  } finally {
    results.endedAt = ts();
    if (!results.overall) results.overall = 'FAIL';
    save();
    await browser.close().catch(() => {});
    console.log(`\nOVERALL=${results.overall}`);
    console.log(`JSON=${OUT_JSON}`);
    process.exit(results.overall === 'PASS' ? 0 : results.overall === 'BLOCKED' ? 2 : 1);
  }
}

main();
