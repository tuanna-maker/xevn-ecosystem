/**
 * PO-UC-TC-W3-QA-LOG09-DEST-RELOAD-01 — dest reload only (U65)
 * After BE scope FIX: Group CEO main may GET catalog?companyId=logistics
 * FORBIDDEN: seed · full HP/FD/AU matrix · Leave L2 · Phase1 DONE claim
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const CEO_EMAIL = 'ceo@xe.vn';
const PASSWORD = 'Xevn@2026';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const WORK_ITEM = 'PO-UC-TC-W3-QA-LOG09-DEST-RELOAD-01';
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-po-uc-tc-w3-qa-log09-dest-reload-01-runtime.json');
const SCREEN_DIR = resolve(ROOT, 'docs/qa/evidence/screens/po-uc-tc-w3-qa-log09-dest-reload-01');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

const results = {
  work_item_id: WORK_ITEM,
  uc_id: 'XBOS-DM-LOG-09',
  layer: 'browser-U65-dest-reload',
  hdsd_align: true,
  u65: 'zero-seed',
  startedAt: ts(),
  env: { PORTAL, CEO_EMAIL },
  l0: {},
  clicks: [],
  steps: [],
  network: [],
  catalogGets: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  uat_done: false,
  phase1_done: false,
};

function save() {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(results, null, 2));
}

function click(action, detail = {}) {
  const row = { at: ts(), action, ...detail };
  results.clicks.push(row);
  console.log(`CLICK  ${results.clicks.length}  ${action}`, JSON.stringify(detail).slice(0, 220));
  save();
}

function step(id, action, expected, actual, result, extra = {}) {
  const row = { seq: results.steps.length + 1, at: ts(), id, action, expected, actual, result, ...extra };
  results.steps.push(row);
  console.log(`${String(result).toUpperCase()}  ${id}  ${String(actual).slice(0, 280)}`);
  save();
  return row;
}

async function shot(page, name) {
  mkdirSync(SCREEN_DIR, { recursive: true });
  const path = join(SCREEN_DIR, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  results.screens.push({ at: ts(), name, path: path.replace(/\\/g, '/') });
  return path;
}

function track(page) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      results.consoleErrors.push({ at: ts(), text: String(msg.text()).slice(0, 280) });
    }
  });
  page.on('pageerror', (err) => {
    results.pageErrors.push({ at: ts(), text: String(err).slice(0, 280) });
  });
  page.on('response', async (res) => {
    try {
      const u = res.url();
      const method = res.request().method();
      if (method === 'OPTIONS') return;
      if (!/\/api\/xbos\/(auth\/login|config-sync)/.test(u) && !/clone-bundle|\/catalog\//.test(u)) {
        return;
      }
      const entry = {
        method,
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 420),
        at: ts(),
      };
      try {
        const j = await res.json();
        entry.code = j?.code;
        entry.message = typeof j?.message === 'string' ? j.message.slice(0, 180) : undefined;
        if (j?.data && typeof j.data === 'object') {
          if (typeof j.data.copiedCount === 'number') entry.copiedCount = j.data.copiedCount;
          if (j.data.dest?.companyId) entry.destCompanyId = j.data.dest.companyId;
          if (j.data.catalogKey || j.data.key) entry.catalogKey = j.data.catalogKey || j.data.key;
          if (j.data.companyId) entry.dataCompanyId = j.data.companyId;
        }
      } catch {
        /* non-json */
      }
      results.network.push(entry);
      if (/\/config-sync\/catalog\//.test(entry.url) && method === 'GET') {
        results.catalogGets.push(entry);
      }
      if (results.network.length > 400) results.network.shift();
      save();
    } catch {
      /* */
    }
  });
}

async function probeL0() {
  const urls = {
    hrm: 'http://127.0.0.1:28001/api/hrm',
    xbos: 'http://127.0.0.1:28002/api/xbos',
    portal: PORTAL,
  };
  for (const [k, url] of Object.entries(urls)) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(5000) });
      results.l0[k] = r.status;
    } catch (e) {
      results.l0[k] = `FAIL:${String(e.message || e).slice(0, 80)}`;
    }
  }
  save();
}

async function authTokenPresent(page) {
  return page.evaluate(() => {
    for (const k of Object.keys(localStorage)) {
      const s = localStorage.getItem(k) || '';
      if (s.split('.').length === 3 && s.length > 40) return true;
      try {
        const v = JSON.parse(s);
        const t = v?.token || v?.accessToken || v?.data?.accessToken;
        if (typeof t === 'string' && t.split('.').length === 3) return true;
      } catch {
        /* */
      }
    }
    return false;
  });
}

async function fillLogin(page, email) {
  await page.goto(`${PORTAL}/login`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(700);
  click('goto-login', { email });
  await page.evaluate(() => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      /* */
    }
  });
  await page.goto(`${PORTAL}/login`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(500);
  await page
    .locator('input[type="email"], input[name="email"], input[autocomplete="username"]')
    .first()
    .fill(email);
  await page.locator('input[type="password"]').first().fill(PASSWORD);
  click('fill-login', { email });
  await page.getByRole('button', { name: /Đăng nhập|Login|Sign in/i }).first().click();
  click('submit-login', { email });
  await page.waitForURL(/command-center|membership|select/i, { timeout: 60000 }).catch(() => {});
  const membershipBtn = page
    .getByRole('button', { name: /tiếp tục|chọn|holding|tập đoàn|xe\.vn|main/i })
    .first();
  if (await membershipBtn.isVisible({ timeout: 2500 }).catch(() => false)) {
    await membershipBtn.click().catch(() => {});
    click('pick-membership');
    await sleep(1200);
  }
  for (let i = 0; i < 24; i++) {
    if ((await authTokenPresent(page)) && /command-center/.test(page.url())) break;
    if (!/command-center/.test(page.url()) && (await authTokenPresent(page))) {
      await page.goto(`${PORTAL}/command-center`, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});
    }
    await sleep(300);
  }
  click('login-done', { email, url: page.url(), token: await authTokenPresent(page) });
  await shot(page, '01-login-ceo');
}

async function gotoLog09(page) {
  const url = `${PORTAL}/command-center?settings=log_catalog_clone_bundle`;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(1200);
  click('goto-log09', { url: page.url() });
  await shot(page, '02-log09-panel');
}

async function selectLogisticsDest(page) {
  const list = page.getByTestId('clone-bundle-dest-list');
  await list.waitFor({ state: 'visible', timeout: 20000 });
  const byId = page.getByTestId('clone-bundle-dest-logistics');
  if (await byId.isVisible({ timeout: 8000 }).catch(() => false)) {
    await byId.click();
    click('select-dest-logistics', { via: 'testid-logistics' });
  } else {
    const byWire = page
      .locator('button[data-testid^="clone-bundle-dest-"]', { hasText: /xevn\/logistics/i })
      .first();
    if (!(await byWire.isVisible({ timeout: 3000 }).catch(() => false))) {
      throw new Error('Dest logistics not found');
    }
    await byWire.click();
    click('select-dest-logistics', { via: 'wire-text' });
  }
  await sleep(400);
}

async function confirmCloneDialog(page) {
  const confirm = page.getByRole('button', { name: /^Sao chép bộ$/ }).first();
  if (await confirm.isVisible({ timeout: 8000 }).catch(() => false)) {
    await confirm.click();
    click('confirm-dialog-sao-chep-bo');
    return true;
  }
  const alt = page.getByRole('button', { name: /Sao chép bộ|Xác nhận|Confirm/i }).last();
  if (await alt.isVisible({ timeout: 3000 }).catch(() => false)) {
    await alt.click();
    click('confirm-dialog-fallback');
    return true;
  }
  return false;
}

async function waitNetwork(predicate, timeoutMs, afterAtIso = null) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const hit = [...results.network].reverse().find((n) => {
      if (afterAtIso && n.at <= afterAtIso) return false;
      return predicate(n);
    });
    if (hit) return hit;
    await sleep(400);
  }
  return null;
}

async function main() {
  await probeL0();
  const l0ok = results.l0.hrm === 200 && results.l0.xbos === 200 && results.l0.portal === 200;
  step('L0', 'Stack health', 'hrm+xbos+portal 200', JSON.stringify(results.l0), l0ok ? 'pass' : 'fail');
  if (!l0ok) {
    results.ack_status = 'FAIL_TO_PM';
    results.endedAt = ts();
    save();
    process.exit(2);
  }

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--ignore-certificate-errors'],
  });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  track(page);

  try {
    await fillLogin(page, CEO_EMAIL);
    const loginOk = /command-center/.test(page.url()) && (await authTokenPresent(page));
    step('LOGIN-CEO', 'Login ceo@xe.vn', 'command-center + token', `url=${page.url()}`, loginOk ? 'pass' : 'fail');
    if (!loginOk) throw new Error('CEO login failed');

    await gotoLog09(page);
    const panel = page.getByTestId('clone-catalog-bundle-panel');
    const panelVisible = await panel.isVisible({ timeout: 15000 }).catch(() => false);
    const hdsd = await panel.getAttribute('data-hdsd').catch(() => null);
    step(
      'HDSD-PANEL',
      'Deep link settings=log_catalog_clone_bundle',
      'panel + data-hdsd=sao-chep-bo-danh-muc-log',
      `visible=${panelVisible} hdsd=${hdsd}`,
      panelVisible && hdsd === 'sao-chep-bo-danh-muc-log' ? 'pass' : 'fail',
    );
    if (!panelVisible) throw new Error('LOG-09 panel not visible');

    // Setup: ensure CFG-205 result panel so reload button exists (dest already populated → overwrite OK)
    await selectLogisticsDest(page);
    await page.getByTestId('clone-bundle-on-conflict').selectOption('overwrite');
    click('set-onConflict', { value: 'overwrite' });
    const setupMark = ts();
    await page.getByTestId('clone-bundle-submit').click();
    click('setup-overwrite-submit');
    await confirmCloneDialog(page);
    const setupNet = await waitNetwork(
      (n) =>
        /clone-bundle/.test(n.url || '') &&
        ((n.status >= 200 && n.status < 300) || n.status >= 400),
      180000,
      setupMark,
    );
    await sleep(1200);
    const setupStatus = ((await page.getByTestId('clone-bundle-status').textContent().catch(() => '')) || '').trim();
    const resultVisible = await page.getByTestId('clone-bundle-result').isVisible({ timeout: 8000 }).catch(() => false);
    const setupOk =
      resultVisible &&
      (setupNet?.code === 'XBOS-CFG-205' || /XBOS-CFG-205/.test(setupStatus)) &&
      (setupNet?.destCompanyId === 'logistics' || /logistics/i.test(setupStatus));
    step(
      'SETUP-CFG-205',
      'Overwrite setup for result panel (dest already has keys — not full HP re-prove)',
      'XBOS-CFG-205 + result panel + dest logistics',
      `status="${setupStatus.slice(0, 160)}" net=${JSON.stringify({
        status: setupNet?.status,
        code: setupNet?.code,
        copiedCount: setupNet?.copiedCount,
        destCompanyId: setupNet?.destCompanyId,
      })} resultVisible=${resultVisible}`,
      setupOk ? 'pass' : 'fail',
      { attachment: await shot(page, '03-setup-cfg-205') },
    );
    if (!setupOk) throw new Error('CFG-205 setup failed — cannot exercise dest reload');

    // Clear prior catalog GETs from auto-reload after clone so we measure button click
    const reloadMark = ts();
    const getsBefore = results.catalogGets.length;
    const reloadBtn = page.getByTestId('clone-bundle-reload-dest');
    const reloadVisible = await reloadBtn.isVisible({ timeout: 8000 }).catch(() => false);
    if (!reloadVisible) throw new Error('Reload button clone-bundle-reload-dest not visible');
    await reloadBtn.click();
    click('reload-dest-keys', { hdsd: 'tai-lai-khoa-dich' });

    // Wait for spot GETs after click
    const startWait = Date.now();
    while (Date.now() - startWait < 45000) {
      const after = results.catalogGets.filter((g) => g.at > reloadMark);
      if (after.length >= 1) break;
      await sleep(400);
    }
    await sleep(1500);

    const getsAfterClick = results.catalogGets.filter((g) => g.at > reloadMark);
    const logisticsGets = getsAfterClick.filter((g) => /companyId=logistics/i.test(g.url || ''));
    const scope409 = getsAfterClick.filter(
      (g) =>
        g.status === 409 ||
        /SCOPE_CONTEXT_MISMATCH/i.test(g.code || '') ||
        /SCOPE_CONTEXT_MISMATCH|mismatches token scope/i.test(g.message || ''),
    );
    const ok2xx = logisticsGets.filter((g) => g.status >= 200 && g.status < 300);
    const sampleOk = ok2xx.slice(0, 5).map((g) => ({
      status: g.status,
      code: g.code,
      url: g.url,
      catalogKey: g.catalogKey,
      dataCompanyId: g.dataCompanyId,
    }));

    const destKeysText = ((await page.getByTestId('clone-bundle-dest-keys').textContent().catch(() => '')) || '').trim();
    const destKeysError = (
      (await page.getByTestId('clone-bundle-dest-keys-error').textContent().catch(() => '')) || ''
    ).trim();
    const destKeysOk =
      /log_dm_/i.test(destKeysText) &&
      /Khóa trên đích sau sao chép:\s*[1-9]/i.test(destKeysText) &&
      !destKeysError;

    const noScope409 = scope409.length === 0;
    const hasLogistics2xx = ok2xx.length > 0;
    const destReloadPass = destKeysOk && noScope409 && hasLogistics2xx;

    step(
      'DEST-RELOAD',
      'Click Tải lại khóa đích (F5) → spot GET companyId=logistics',
      '2xx XBOS-CFG-201 (or BE success) · dest keys non-empty · NOT 409 SCOPE',
      JSON.stringify({
        reloadVisible,
        getsBefore,
        getsAfterClick: getsAfterClick.length,
        logisticsGets: logisticsGets.length,
        ok2xx: ok2xx.length,
        scope409: scope409.length,
        sampleOk,
        scope409Sample: scope409.slice(0, 3),
        destKeysText: destKeysText.slice(0, 220),
        destKeysError: destKeysError.slice(0, 180) || null,
      }),
      destReloadPass ? 'pass' : 'fail',
      { attachment: await shot(page, '04-dest-reload') },
    );

    results.verdict = {
      l0ok,
      loginOk,
      setupOk,
      destReloadPass,
      noScope409,
      hasLogistics2xx,
      destKeysOk,
      logisticsGet2xxCount: ok2xx.length,
      scope409Count: scope409.length,
      sampleCodes: [...new Set(ok2xx.map((g) => g.code).filter(Boolean))],
      uat_done: false,
      phase1_done: false,
    };
    results.ack_status = destReloadPass ? 'PASS_TO_PM' : 'FAIL_TO_PM';
    results.endedAt = ts();
    save();
    console.log('\nVERDICT', JSON.stringify(results.verdict, null, 2));
  } catch (e) {
    results.fatal = String(e?.stack || e).slice(0, 1200);
    results.ack_status = 'FAIL_TO_PM';
    results.endedAt = ts();
    save();
    console.error('FATAL', results.fatal);
  } finally {
    await browser.close().catch(() => {});
  }

  process.exit(results.ack_status === 'PASS_TO_PM' ? 0 : 2);
}

main();
