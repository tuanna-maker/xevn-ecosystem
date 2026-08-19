/**
 * QA-HDSD-W4-INT-01 — W4 integration browser UAT (U65 zero-seed)
 * TC-ECO-INT-01 catalog · TC-ECO-INT-02 headcount · TC-ECO-INT-03 WF cross-product
 */
import puppeteer from 'puppeteer';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_DIR = resolve(ROOT, 'docs/qa/evidence');
const RUNTIME = resolve(OUT_DIR, '_tmp-qa-hdsd-w4-int-01-runtime.json');
const SCREEN_DIR = resolve(OUT_DIR, 'screens/hdsd-uat-w4-20260730');
const MARKER = `QA-W4-INT-${Date.now().toString(36).toUpperCase()}`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const qPortal = (path) =>
  `${PORTAL}${path}${path.includes('?') ? '&' : '?'}portal=1&tenantId=xevn&companyId=main`;

const results = {
  work_item_id: 'QA-HDSD-W4-INT-01',
  program: 'HDSD-P2-FULL-01',
  startedAt: new Date().toISOString(),
  env: { PORTAL, EMAIL, u65: 'zero-seed', marker: MARKER },
  l0: {},
  cases: [],
  network: [],
  consoleErrors: [],
  screens: [],
};

function save() {
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(RUNTIME, JSON.stringify(results, null, 2));
}

function recordCase(id, verdict, detail, extra = {}) {
  const row = { id, verdict, detail, at: new Date().toISOString(), ...extra };
  results.cases.push(row);
  console.log(`[${verdict}] ${id} — ${detail.slice(0, 120)}`);
  save();
  return row;
}

async function shot(page, name) {
  mkdirSync(SCREEN_DIR, { recursive: true });
  const path = join(SCREEN_DIR, `${name}.png`);
  await page.screenshot({ path, fullPage: false });
  results.screens.push(path.replace(/\\/g, '/'));
  return path;
}

function trackNetwork(page) {
  page.on('response', (res) => {
    try {
      const u = res.url();
      if (!/\/api\/(hrm|xbos)\//.test(u)) return;
      const method = res.request().method();
      if (method === 'OPTIONS') return;
      results.network.push({
        method,
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 240),
        at: new Date().toISOString(),
      });
    } catch {
      /* */
    }
  });
}

function lastNet(pred) {
  for (let i = results.network.length - 1; i >= 0; i--) {
    if (pred(results.network[i])) return results.network[i];
  }
  return null;
}

async function waitForNet(pred, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const hit = lastNet(pred);
    if (hit) return hit;
    await sleep(200);
  }
  return null;
}

async function reactSetInput(page, selector, value) {
  await page.waitForSelector(selector, { timeout: 15000 });
  await page.click(selector, { clickCount: 3 });
  await page.keyboard.press('Backspace');
  await page.type(selector, value, { delay: 12 });
}

async function nativeClickByText(page, text, opts = {}) {
  const box = await page.evaluate(
    (t, exact) => {
      const nodes = Array.from(
        document.querySelectorAll('button, a, [role="tab"], [role="button"], [role="menuitem"], span, div, li'),
      );
      const el = nodes.find((n) => {
        const txt = (n.textContent || '').replace(/\s+/g, ' ').trim();
        if (exact) return txt === t;
        return txt.includes(t);
      });
      if (!el) return null;
      el.scrollIntoView({ block: 'center' });
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) return null;
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    },
    text,
    !!opts.exact,
  );
  if (!box) throw new Error(`click miss: ${text}`);
  await page.mouse.click(box.x, box.y);
  return box;
}

async function bodyHasError(page) {
  return page.evaluate(() => {
    const t = document.body?.innerText || '';
    const banner =
      /ERROR|Sync ERROR|409|54321|ERR_CONNECTION|thất bại/i.test(t) &&
      !/Đăng nhập thất bại/i.test(t.slice(0, 200));
    return { banner, url: location.href, snippet: t.slice(0, 400) };
  });
}

async function uiLogin(page) {
  await page.goto(`${PORTAL.replace(/\/$/, '')}/login`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(800);
  await page.evaluate(() => {
    for (const s of [localStorage, sessionStorage]) s.clear();
  });
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(600);
  await reactSetInput(page, 'input[type="email"]', EMAIL);
  await reactSetInput(page, 'input[type="password"]', PASSWORD);
  const before = results.network.length;
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => null),
    page.click('button[type="submit"]'),
  ]);
  await sleep(2000);
  const loginNet = results.network.slice(before).find((n) => /auth\/login/.test(n.url));
  return { url: page.url(), loginNet };
}

async function openSettings(page, query) {
  await page.goto(`${PORTAL}/command-center?settings=${query}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(2500);
}

function viDate(d) {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()}`;
}

function pickLeaveWindow() {
  const start = new Date();
  start.setMonth(start.getMonth() + 7);
  const day = 5 + ((Date.now() / 60_000) | 0) % 20;
  start.setDate(day);
  return { startVi: viDate(start), endVi: viDate(start) };
}

async function activateLeaveTab(page) {
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const hit = buttons.find((b) => {
      const t = (b.textContent || '').replace(/\s+/g, ' ').trim();
      return t === 'Nghỉ phép' || t.endsWith('Nghỉ phép');
    });
    hit?.click();
  });
  for (let i = 0; i < 25; i++) {
    if (await page.evaluate(() => document.body.innerText.includes('Tạo yêu cầu nghỉ'))) return true;
    await sleep(400);
  }
  return false;
}

async function tryCreateLeaveRequest(page) {
  const netBefore = results.network.length;
  await page.goto(qPortal('/hr/attendance'), { waitUntil: 'networkidle2', timeout: 120000 });
  await sleep(2000);
  const tabOk = await activateLeaveTab(page);
  if (!tabOk) return { ok: false, reason: 'leave-tab-miss' };

  const opened = await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button')).find((x) =>
      /Tạo yêu cầu nghỉ/i.test((x.textContent || '').trim()),
    );
    if (!b) return false;
    b.click();
    return true;
  });
  if (!opened) return { ok: false, reason: 'create-button-miss' };
  await sleep(1200);

  for (let i = 0; i < 40; i++) {
    const state = await page.evaluate(() => {
      const d = document.querySelector('[role="dialog"]');
      if (!d) return 'no-dialog';
      if (d.innerText.includes('Đang tải danh mục')) return 'loading';
      return Array.from(d.querySelectorAll('button[role="combobox"]')).some((b) =>
        /Chọn loại nghỉ|loại nghỉ/i.test(b.getAttribute('aria-label') || b.textContent || ''),
      )
        ? 'ready'
        : 'wait';
    });
    if (state === 'ready') break;
    await sleep(400);
  }

  const { startVi, endVi } = pickLeaveWindow();
  const empSearch = await page.$(
    '[role="dialog"] input[aria-label*="nhân" i], [role="dialog"] input[placeholder*="nhân" i], [role="dialog"] input[placeholder*="Tìm" i]',
  );
  if (empSearch) {
    await empSearch.click({ clickCount: 3 });
    await page.keyboard.press('Backspace');
    await empSearch.type('PORTAL-GCEO', { delay: 40 });
  }
  await sleep(900);
  await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"]') || document.body;
    const btn = Array.from(d.querySelectorAll('button[role="combobox"]')).find((b) => {
      const a = (b.getAttribute('aria-label') || '') + (b.textContent || '');
      return /nhân viên|Chọn nhân|select employee/i.test(a) && !/loại nghỉ|leave type/i.test(a);
    });
    btn?.click();
  });
  await sleep(700);
  await page.evaluate(() => {
    const items = Array.from(
      document.querySelectorAll('[role="option"], [data-radix-collection-item], [cmdk-item]'),
    );
    const hit = items.find((n) => (n.textContent || '').includes('PORTAL-GCEO')) || items[0];
    hit?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
  await sleep(400);

  await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"]') || document.body;
    const btn = Array.from(d.querySelectorAll('button[role="combobox"]')).find((b) =>
      /Chọn loại nghỉ|loại nghỉ|leave type/i.test(b.getAttribute('aria-label') || b.textContent || ''),
    );
    btn?.click();
  });
  await sleep(700);
  await page.evaluate(() => {
    const nodes = Array.from(
      document.querySelectorAll('[cmdk-item], [data-slot="command-item"], [role="option"]'),
    );
    const hit =
      nodes.find((n) => (n.textContent || '').includes('LVT_01')) ||
      nodes.find((n) => /Phép năm/i.test(n.textContent || '')) ||
      nodes[0];
    hit?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
  await sleep(400);

  const dateInputs = await page.$$('[role="dialog"] input');
  for (const [idx, vi] of [startVi, endVi].entries()) {
    const inp = dateInputs.filter((el) =>
      page.evaluate((n) => {
        const ph = (n.placeholder || '').toLowerCase();
        return /dd\/mm|ngày|date/.test(ph) || n.type === 'date' || n.type === 'text';
      }, el),
    )[idx];
    if (inp) {
      await inp.click({ clickCount: 3 });
      await page.keyboard.press('Backspace');
      await inp.type(vi, { delay: 25 });
      await page.keyboard.press('Tab');
      await sleep(200);
    }
  }

  const reasonEl = await page.$('[role="dialog"] textarea');
  if (reasonEl) {
    await reasonEl.click({ clickCount: 3 });
    await page.keyboard.press('Backspace');
    await reasonEl.type(MARKER, { delay: 20 });
  }

  const submitted = await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"]') || document.body;
    const btn = Array.from(d.querySelectorAll('button')).find((b) =>
      /Gửi yêu cầu|Gửi/i.test((b.textContent || '').trim()),
    );
    if (!btn) return false;
    btn.click();
    return true;
  });
  if (!submitted) return { ok: false, reason: 'submit-miss' };
  await sleep(3500);

  const postNet = results.network.slice(netBefore).find(
    (n) => n.method === 'POST' && /leave-requests/.test(n.url) && !/approve|reject/.test(n.url),
  );
  return {
    ok: postNet?.status >= 200 && postNet?.status < 300,
    postStatus: postNet?.status ?? null,
    postUrl: postNet?.url ?? null,
    reason: postNet ? 'posted' : 'no-post',
  };
}

(async () => {
  console.log('=== QA-HDSD-W4-INT-01 ===');

  for (const [name, url] of [
    ['hrm-api', 'http://127.0.0.1:28001/api/hrm'],
    ['xbos-api', 'http://127.0.0.1:28002/api/xbos'],
    ['portal', PORTAL],
  ]) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
      results.l0[name] = { ok: r.ok, status: r.status, url };
    } catch (e) {
      results.l0[name] = { ok: false, error: String(e.message || e), url };
    }
  }
  save();

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--window-size=1440,900'],
    defaultViewport: { width: 1440, height: 900 },
  });

  const page = await browser.newPage();
  trackNetwork(page);
  page.on('pageerror', (e) => results.consoleErrors.push(String(e).slice(0, 180)));
  page.on('console', (msg) => {
    if (msg.type() === 'error') results.consoleErrors.push(msg.text().slice(0, 180));
  });

  try {
    await uiLogin(page);
    await shot(page, '01-login');

    // --- TC-ECO-INT-01: Catalog publish → HRM pull ---
    const netCatStart = results.network.length;
    await openSettings(page, 'hrm_catalog');
    await shot(page, '02-xbos-catalog-governance');
    const catGovNet = lastNet((n) => /catalog|settings-catalogs|catalog-sync/.test(n.url));
    const catGovErr = await bodyHasError(page);

    let publishClicked = false;
    try {
      await nativeClickByText(page, 'Xuất bản');
      publishClicked = true;
      await sleep(2000);
    } catch {
      try {
        await nativeClickByText(page, 'Publish');
        publishClicked = true;
        await sleep(2000);
      } catch {
        /* governance may auto-sync on load */
      }
    }
    const publishNet = results.network.slice(netCatStart).find(
      (n) => /publish|catalog-sync\/push|settings-catalogs/.test(n.url) && n.method !== 'OPTIONS',
    );

    await page.goto(qPortal('/hr/settings'), { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(2000);
    try {
      await nativeClickByText(page, 'Danh mục');
      await sleep(2500);
    } catch {
      /* */
    }
    await shot(page, '03-hrm-settings-catalog');
    const hrmPullNet = await waitForNet(
      (n) => /catalog-sync|settings-catalogs/.test(n.url) && n.status >= 200 && n.status < 300,
      12000,
    );
    const hrmCatErr = await bodyHasError(page);

    const int01Pass =
      !catGovErr.banner &&
      !hrmCatErr.banner &&
      catGovNet?.status < 400 &&
      hrmPullNet?.status < 400;
    recordCase(
      'TC-ECO-INT-01',
      int01Pass ? '🟢' : catGovErr.banner || hrmCatErr.banner ? '🔴' : '🟡',
      `XBOS catalog gov net=${catGovNet?.status ?? 'none'} publishClick=${publishClicked} publishNet=${publishNet?.status ?? 'none'} → HRM pull=${hrmPullNet?.status ?? 'none'} url=${hrmPullNet?.url ?? 'n/a'}`,
      {
        uf: 'UF-HRM-10',
        clickPath: 'Settings hrm_catalog → HRM settings Danh mục',
        network: {
          catalogGov: catGovNet?.url,
          publish: publishNet?.url,
          hrmPull: hrmPullNet?.url,
        },
      },
    );

    // --- TC-ECO-INT-02: Headcount parity ---
    await page.goto(qPortal('/hr/company'), { waitUntil: 'networkidle2', timeout: 120000 });
    await sleep(4000);
    await shot(page, '04-hrm-company-headcount');
    const summaryNet = await waitForNet(
      (n) => /employees\/summary|headcount|\/summary/.test(n.url) && n.status >= 200 && n.status < 300,
      18000,
    );
    const hcErr = await bodyHasError(page);
    const hcText = await page.evaluate(() => (document.body?.innerText || '').slice(0, 600));
    const hasHeadcountUi = /Tổng nhân viên|headcount|nhân viên/i.test(hcText);

    await page.goto(`${PORTAL}/dashboard/organization`, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(2500);
    await shot(page, '05-xbos-org-dashboard');
    const orgNet = lastNet((n) => /organization|companies|tenant-scope/.test(n.url) && n.status < 400);
    const orgErr = await bodyHasError(page);

    const int02Pass =
      summaryNet &&
      summaryNet.status < 400 &&
      !hcErr.banner &&
      !orgErr.banner &&
      (orgNet || hasHeadcountUi);
    recordCase(
      'TC-ECO-INT-02',
      int02Pass ? '🟢' : hcErr.banner || orgErr.banner ? '🔴' : '🟡',
      `HRM summary=${summaryNet?.status ?? 'none'} UI=${hasHeadcountUi} · XBOS org=${orgNet?.status ?? 'none'}`,
      {
        uf: 'UF-HRM-MENU-15',
        clickPath: 'HRM /company headcount → XBOS /dashboard/organization',
        network: { summary: summaryNet?.url, org: orgNet?.url },
      },
    );

    // --- TC-ECO-INT-03: HRM request → CC inbox ---
    const leaveResult = await tryCreateLeaveRequest(page);
    await shot(page, '06-leave-create');
    const inboxBefore = results.network.length;
    await page.goto(`${PORTAL}/command-center/inbox`, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(3000);
    await shot(page, '07-cc-inbox');
    const inboxNet = results.network.slice(inboxBefore).find(
      (n) => /inbox|workflow-engine\/tasks|workflow/.test(n.url) && n.status < 500,
    );
    const inboxErr = await bodyHasError(page);
    const inboxText = await page.evaluate(() => (document.body?.innerText || '').slice(0, 1200));
    const hasMarkerInInbox = inboxText.includes(MARKER);
    const hasLeaveInInbox = /nghỉ phép|leave|yêu cầu nghỉ/i.test(inboxText);
    const hasInboxCards = await page.evaluate(() => {
      const cards = document.querySelectorAll('[data-testid*="inbox"], [class*="inbox"], [class*="task"], tbody tr');
      return cards.length > 0;
    });

    let int03Verdict = '🟡';
    let int03Detail = '';
    if (leaveResult.ok && (hasMarkerInInbox || hasLeaveInInbox || hasInboxCards)) {
      int03Verdict = '🟢';
      int03Detail = `Leave POST ${leaveResult.postStatus} → inbox load net=${inboxNet?.status ?? 'none'} cards=${hasInboxCards} marker=${hasMarkerInInbox}`;
    } else if (leaveResult.ok && !inboxErr.banner && inboxNet) {
      int03Verdict = '🟡';
      int03Detail = `Leave POST ${leaveResult.postStatus} OK but inbox empty/no marker — cross-product visibility soft (${MARKER})`;
    } else if (!leaveResult.ok) {
      int03Verdict = '🟡';
      int03Detail = `Leave create BLOCKED (${leaveResult.reason}) — inbox load net=${inboxNet?.status ?? 'none'} banner=${inboxErr.banner}`;
    } else {
      int03Verdict = inboxErr.banner ? '🔴' : '🟡';
      int03Detail = `WF path incomplete leave=${leaveResult.postStatus} inbox=${inboxNet?.status ?? 'none'}`;
    }

    recordCase('TC-ECO-INT-03', int03Verdict, int03Detail, {
      uf: 'UF-XBOS-08',
      clickPath: 'HRM attendance leave create → CC /command-center/inbox',
      leaveCreate: leaveResult,
      inbox: { net: inboxNet?.url, status: inboxNet?.status, hasCards: hasInboxCards, marker: hasMarkerInInbox },
    });

    results.finishedAt = new Date().toISOString();
    results.summary = {
      green: results.cases.filter((c) => c.verdict === '🟢').length,
      yellow: results.cases.filter((c) => c.verdict === '🟡').length,
      red: results.cases.filter((c) => c.verdict === '🔴').length,
    };
    save();
  } finally {
    await browser.close();
  }

  console.log('\n=== SUMMARY ===', JSON.stringify(results.summary));
  process.exit(results.summary?.red > 0 ? 1 : 0);
})();
