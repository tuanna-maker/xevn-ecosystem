#!/usr/bin/env node
/**
 * PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-CNS-QA-01 — kanban EFF spot (VAL-REC-CNS-04)
 * FE READY · U65 zero-seed · recruitment_uat_ready=false
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const COMPANY = process.env.QA_COMPANY_ID || 'main';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT = resolve(
  ROOT,
  'docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-rec-stage-catalog-cns-qa-01-kanban.json',
);
const SCREEN = resolve(
  ROOT,
  'docs/qa/evidence/screens/po-hrm-dynamic-config-platform-rec-stage-catalog-cns-qa-01',
);
mkdirSync(SCREEN, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const STARTER_SIX = new Set(['applied', 'screening', 'interview', 'offer', 'hired', 'rejected']);

const R = {
  work_item_id: 'PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-STAGE-CATALOG-CNS-QA-01',
  surface: 'VAL-REC-CNS-04-kanban',
  stamp: `RECCNSKAN-${Date.now().toString(36).toUpperCase()}`,
  persona: EMAIL,
  companyId: COMPANY,
  steps: [],
  network: [],
  consoleErrors: [],
  pageErrors: [],
  ac: {},
  overall: {},
};

function q(path) {
  const u = new URL(path, PORTAL);
  u.searchParams.set('companyId', COMPANY);
  return u.toString();
}

async function loginApi() {
  for (const url of [`${PORTAL}/api/xbos/auth/login`, 'http://127.0.0.1:28002/api/xbos/auth/login']) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
      });
      const j = await r.json().catch(() => ({}));
      const d = j.data || j;
      const token = d.accessToken || d.access_token;
      if (r.ok && token) return { ok: true, token, via: url };
    } catch {
      /* */
    }
  }
  return { ok: false };
}

async function main() {
  const auth = await loginApi();
  R.steps.push({ name: 'login', ok: auth.ok });
  if (!auth.ok) {
    R.overall = { verdict: 'FAIL', reason: 'login' };
    writeFileSync(OUT, JSON.stringify(R, null, 2));
    process.exit(2);
  }

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('console', (msg) => {
    if (msg.type() === 'error') R.consoleErrors.push(String(msg.text()).slice(0, 300));
  });
  page.on('pageerror', (err) => R.pageErrors.push(String(err).slice(0, 300)));

  let effPayload = null;
  page.on('response', async (res) => {
    try {
      const u = res.url();
      if (!/pipeline-stages\/effective/.test(u)) return;
      const j = await res.json().catch(() => null);
      const rows = Array.isArray(j?.data?.data)
        ? j.data.data
        : Array.isArray(j?.data)
          ? j.data
          : [];
      effPayload = {
        status: res.status(),
        total: j?.data?.total ?? rows.length,
        keys: rows.map((r) => r.stageKey || r.stage_key).filter(Boolean),
        url: u.replace(/^https?:\/\/[^/]+/, ''),
      };
      R.network.push(effPayload);
    } catch {
      /* */
    }
  });

  await page.addInitScript(
    (s) => {
      const payload = JSON.stringify({
        userId: s.email,
        email: s.email,
        displayName: s.email,
        roles: ['group_ceo'],
      });
      for (const store of [localStorage, sessionStorage]) {
        store.setItem('xevn.portal.accessToken', s.token);
        store.setItem('xevn.portal.tokenExpiresAt', String(Date.now() + 8 * 3600_000));
        store.setItem('xevn.portal.user', payload);
        store.setItem('xevn.portal.tenantId', 'xevn');
        store.setItem('xevn.portal.companyId', s.companyId);
        store.setItem('hrm_portal_mode', '1');
        store.setItem('hrm_current_company_id', s.companyId);
        store.setItem('hrm_current_tenant_id', 'xevn');
      }
    },
    { token: auth.token, email: EMAIL, companyId: COMPANY },
  );

  await page.goto(q('/hr/recruitment?tab=dashboard'), {
    waitUntil: 'domcontentloaded',
    timeout: 90_000,
  });
  await sleep(2500);

  // Outer = Dashboard · inner TabsTrigger «Board tuyển dụng» (VAL-REC-CNS-04)
  await page.waitForSelector('text=Board tuyển dụng', { timeout: 30_000 }).catch(() => {});
  const tabTexts = await page.locator('[role="tab"]').allInnerTexts().catch(() => []);
  R.steps.push({ name: 'tabs_inventory', tabTexts: tabTexts.slice(0, 20) });

  const boardTab = page.locator('[role="tab"]', { hasText: 'Board tuyển dụng' }).first();
  await boardTab.scrollIntoViewIfNeeded().catch(() => {});
  await boardTab.click({ force: true });
  await sleep(1500);
  // Retry if still dashboard content
  if (!(await page.locator('[data-testid="rec-kanban-board"]').isVisible().catch(() => false))) {
    await page.getByText('Board tuyển dụng', { exact: true }).click({ force: true }).catch(() => {});
    await sleep(1500);
  }
  // Radix: click via evaluate if needed
  if (!(await page.locator('[data-testid="rec-kanban-board"]').isVisible().catch(() => false))) {
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
      const hit = tabs.find((t) => /Board tuyển dụng/i.test(t.textContent || ''));
      if (hit) hit.click();
    }).catch(() => {});
    await sleep(2000);
  }

  // Wait for board or empty CTA
  for (let i = 0; i < 25; i++) {
    const bv = await page.locator('[data-testid="rec-kanban-board"]').isVisible().catch(() => false);
    const ev = await page.locator('[data-testid="rec-kanban-stages-empty"]').isVisible().catch(() => false);
    if (bv || ev) break;
    await sleep(400);
  }

  const board = page.locator('[data-testid="rec-kanban-board"]');
  const empty = page.locator('[data-testid="rec-kanban-stages-empty"]');
  const loading = page.locator('[data-testid="rec-kanban-stages-loading"]');
  const boardVisible = await board.isVisible().catch(() => false);
  const emptyVisible = await empty.isVisible().catch(() => false);
  const loadingVisible = await loading.isVisible().catch(() => false);

  const colCount = boardVisible
    ? await page.locator('[data-testid="rec-kanban-board"] .kanban-column').count()
    : 0;
  const labels = boardVisible
    ? await page
        .locator('[data-testid="rec-kanban-board"] .kanban-column h3')
        .allInnerTexts()
        .catch(() => [])
    : [];

  const shot = join(SCREEN, 'kanban-board.png');
  await page.screenshot({ path: shot, fullPage: true }).catch(() => {});
  R.steps.push({
    name: 'kanban_ui',
    boardVisible,
    emptyVisible,
    loadingVisible,
    colCount,
    labels: labels.slice(0, 20),
    screenshot: shot,
    url: page.url(),
  });

  const effOk = Boolean(effPayload && effPayload.status === 200 && effPayload.total > 0);
  const hasN1 =
    effOk &&
    Array.isArray(effPayload.keys) &&
    effPayload.keys.some((k) => !STARTER_SIX.has(String(k).toLowerCase()));
  const colsMatchEff =
    boardVisible &&
    effOk &&
    colCount === Number(effPayload.total);

  // Soft: column count matches EFF total OR labels include at least one Nest N+1 key label from network
  const notSixOnly =
    boardVisible &&
    (colsMatchEff ||
      (hasN1 && colCount === effPayload.keys.length) ||
      (effOk && colCount > 0 && colCount === effPayload.keys.length));

  R.ac.val_rec_cns_04 = {
    pass: Boolean(effOk && boardVisible && notSixOnly && !emptyVisible),
    note: effOk
      ? `GET effective 200 total=${effPayload.total} keys=${(effPayload.keys || []).join(',')} · board cols=${colCount} · sixOnlyBlocked=${hasN1 || colCount !== 6}`
      : `eff missing · board=${boardVisible} empty=${emptyVisible}`,
    effPayload,
    colsMatchEff,
    hasN1,
  };

  // Hardcode-six FAIL if EFF>0 but UI only shows starter six while EFF has N+1
  if (effOk && hasN1 && colCount === 6 && !colsMatchEff) {
    R.ac.val_rec_cns_04.pass = false;
    R.ac.val_rec_cns_04.note += ' · FAIL hardcode-six vs EFF N+1';
  }

  R.overall = {
    verdict: R.ac.val_rec_cns_04.pass ? 'PASS' : 'FAIL',
    ack_slice: R.ac.val_rec_cns_04.pass ? 'VAL-REC-CNS-04 PASS' : 'VAL-REC-CNS-04 FAIL',
    stamp: R.stamp,
    consoleErrors: R.consoleErrors.length,
  };

  writeFileSync(OUT, JSON.stringify(R, null, 2));
  console.log(JSON.stringify({ overall: R.overall, ac: R.ac }, null, 2));
  await browser.close();
  process.exit(R.ac.val_rec_cns_04.pass ? 0 : 2);
}

main().catch((e) => {
  R.overall = { verdict: 'FAIL', reason: String(e?.stack || e) };
  writeFileSync(OUT, JSON.stringify(R, null, 2));
  console.error(e);
  process.exit(2);
});
