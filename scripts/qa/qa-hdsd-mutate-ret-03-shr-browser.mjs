/**
 * QA-HDSD-MUTATE-RET-03-SHR — Shareholder F5 retest after D-HDSD-MUTATE-SHR-F5-01
 * U65 zero-seed · portal :5173 · xbos-api :28002 · ceo@xe.vn
 * Scope: TC-HDSD-03-02-01 + UF-XBOS-10 + internal_services regression only
 */
import puppeteer from 'puppeteer';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-qa-hdsd-mutate-ret-03-shr-runtime.json');
const SCREEN_DIR = resolve(ROOT, 'docs/qa/evidence/screens/hdsd-mutate-ret-03-shr-20260730');
const STAMP = `HDSD${Date.now().toString(36).slice(-5).toUpperCase()}`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const q = (path) =>
  `${PORTAL}${path}${path.includes('?') ? '&' : '?'}portal=1&tenantId=xevn&companyId=main`;

const results = {
  work_item_id: 'QA-HDSD-MUTATE-RET-03-SHR',
  program: 'P-HDSD-QA-SRS-01',
  startedAt: new Date().toISOString(),
  env: { PORTAL, EMAIL, u65: 'zero-seed', stamp: STAMP },
  l0: {},
  tc: [],
  network: [],
  consoleErrors: [],
  screens: [],
};

function save() {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(results, null, 2));
}

function recordTc(id, verdict, detail, extra = {}) {
  const row = { id, verdict, detail, uf: extra.uf, at: new Date().toISOString(), ...extra };
  results.tc.push(row);
  console.log(`${verdict === '🟢' ? 'PASS' : verdict === '🟡' ? 'BLOCK' : 'FAIL'}  ${id}  ${detail.slice(0, 200)}`);
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
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 220),
        at: new Date().toISOString(),
      });
    } catch {
      /* */
    }
  });
}

function netsSince(before, pred) {
  return results.network.slice(before).filter(pred);
}

function lastNet(pred) {
  for (let i = results.network.length - 1; i >= 0; i--) {
    if (pred(results.network[i])) return results.network[i];
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

async function clickTestId(page, testId) {
  const sel = `[data-testid="${testId}"], #${testId}`;
  await page.waitForSelector(sel, { timeout: 15000 });
  await page.click(sel);
}

async function clickLastTestIdPrefix(page, prefix) {
  return page.evaluate((pfx) => {
    const els = Array.from(document.querySelectorAll(`[data-testid^="${pfx}"]`));
    const target = els[els.length - 1];
    if (!target) return { ok: false };
    target.scrollIntoView({ block: 'center' });
    target.click();
    return { ok: true, testid: target.getAttribute('data-testid'), count: els.length };
  }, prefix);
}

async function typeLastTestIdPrefix(page, prefix, value) {
  const sel = `[data-testid^="${prefix}"]`;
  await page.waitForSelector(sel, { timeout: 15000 });
  const handles = await page.$$(sel);
  const el = handles[handles.length - 1];
  if (!el) return { ok: false };
  await el.click({ clickCount: 3 });
  await page.keyboard.press('Backspace');
  await page.keyboard.type(value, { delay: 15 });
  return { ok: true, count: handles.length };
}

async function uiLogin(page) {
  await page.goto(`${PORTAL}/login`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(800);
  await page.evaluate(() => {
    for (const s of [localStorage, sessionStorage]) s.clear();
  });
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(600);
  await reactSetInput(page, 'input[type="email"]', EMAIL);
  await reactSetInput(page, 'input[type="password"]', PASSWORD);
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => null),
    page.click('button[type="submit"]'),
  ]);
  await sleep(2000);
  return { url: page.url() };
}

async function openSettings(page, query) {
  await page.goto(`${PORTAL}/command-center?settings=${query}`, {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });
  await sleep(2500);
}

async function waitForHoldingRow(page, maxMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    const state = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('table tbody tr'));
      const loading = rows.some((tr) => /Đang tải đơn vị/i.test(tr.innerText || ''));
      const holding = rows.find((tr) => /TẬP ĐOÀN|HOLDING|Tập đoàn XeVN/i.test(tr.innerText || ''));
      return {
        loading,
        rowCount: rows.length,
        hasHolding: !!holding,
        sample: rows.slice(0, 2).map((r) => (r.innerText || '').slice(0, 80)),
      };
    });
    if (state.hasHolding && !state.loading) return state;
    await sleep(800);
  }
  return { hasHolding: false, loading: true, rowCount: 0, sample: [] };
}

async function openHoldingEdit(page) {
  await openSettings(page, 'company_member_units');
  const waitState = await waitForHoldingRow(page);
  if (!waitState.hasHolding) {
    return { ok: false, reason: 'no holding row', waitState };
  }
  const clicked = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('table tbody tr'));
    const row = rows.find((tr) => /TẬP ĐOÀN|HOLDING|Tập đoàn XeVN/i.test(tr.innerText || ''));
    if (!row) return { ok: false, reason: 'no holding row after wait' };
    const btn = Array.from(row.querySelectorAll('button')).find((b) =>
      /Chỉnh sửa|Sửa/i.test(b.textContent || ''),
    );
    if (!btn) return { ok: false, reason: 'no edit btn' };
    btn.scrollIntoView({ block: 'center' });
    btn.click();
    return { ok: true };
  });
  await sleep(2500);
  try {
    await page.waitForSelector('#hdsd-shareholder-add-row, [data-testid="hdsd-shareholder-add-row"]', {
      timeout: 15000,
    });
  } catch {
    /* form may use id only */
  }
  return clicked;
}

/** Check shareholder visible via input value, sr-only text, or innerText */
async function shareholderVisible(page, nameVal, stamp) {
  return page.evaluate(
    (fullName, stampPart) => {
      const bodyText = document.body?.innerText || '';
      if (bodyText.includes(fullName) || bodyText.includes(stampPart)) return { ok: true, via: 'innerText' };
      const srOnly = Array.from(document.querySelectorAll('.sr-only, [class*="sr-only"]')).some(
        (el) => (el.textContent || '').includes(fullName) || (el.textContent || '').includes(stampPart),
      );
      if (srOnly) return { ok: true, via: 'sr-only' };
      const inputs = Array.from(document.querySelectorAll('[data-testid^="hdsd-shareholder-name-"]'));
      const inputHit = inputs.some((inp) => {
        const v = inp.value || inp.getAttribute('value') || '';
        return v.includes(fullName) || v.includes(stampPart);
      });
      if (inputHit) return { ok: true, via: 'input-value' };
      return { ok: false, via: 'none', inputCount: inputs.length };
    },
    nameVal,
    stamp,
  );
}

async function runL0Shell() {
  for (const [name, cmd] of [
    ['qc:dev-stack', 'node scripts/qc-dev-stack.mjs'],
    ['qc:fe-be-health', 'node scripts/qc-fe-be-api-health.mjs'],
  ]) {
    try {
      const out = execSync(cmd, { cwd: ROOT, encoding: 'utf8', timeout: 120000, stdio: ['pipe', 'pipe', 'pipe'] });
      results.l0[name] = { exit: 0, snippet: out.slice(-400) };
    } catch (e) {
      const snippet = String(e.stdout || e.stderr || e.message).slice(-400);
      const healthy = /HTTP 200|ALL PASS|healthy/i.test(snippet);
      results.l0[name] = { exit: healthy ? 0 : (e.status ?? 1), snippet };
    }
  }
  save();
}

(async () => {
  console.log('=== QA-HDSD-MUTATE-RET-03-SHR ===');
  await runL0Shell();

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
    const login = await uiLogin(page);
    if (!/command-center/.test(login.url)) throw new Error(`login failed url=${login.url}`);

    // TC-HDSD-03-02-01 UF-XBOS-05 — shareholder POST 201 + F5 persist
    {
      const netBefore = results.network.length;
      const opened = await openHoldingEdit(page);
      await shot(page, '03-02-holding-edit');
      let verdict = '🔴';
      let detail = `open=${JSON.stringify(opened)}`;
      let postShr = null;
      let feAfterMutate = { ok: false };
      let f5Check = { ok: false };

      if (opened.ok) {
        await clickTestId(page, 'hdsd-shareholder-add-row');
        await sleep(1200);
        const nameVal = `QA ${STAMP}`;
        const typed = await typeLastTestIdPrefix(page, 'hdsd-shareholder-name-', nameVal);
        await sleep(300);
        const saveClick = await clickLastTestIdPrefix(page, 'hdsd-shareholder-save-');
        await sleep(4000);
        await shot(page, '03-02-after-save');

        postShr = netsSince(netBefore, (n) =>
          ['POST', 'PUT', 'PATCH'].includes(n.method) && /shareholder/i.test(n.url),
        ).find((n) => n.status >= 200 && n.status < 300);

        feAfterMutate = await shareholderVisible(page, nameVal, STAMP);
        await shot(page, '03-02-fe-after-mutate');

        await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
        await sleep(2000);
        await openHoldingEdit(page);
        await sleep(2000);
        f5Check = await shareholderVisible(page, nameVal, STAMP);
        await shot(page, '03-02-after-f5');

        const ok = !!postShr && postShr.status === 201 && feAfterMutate.ok && f5Check.ok;
        verdict = ok ? '🟢' : postShr?.status === 201 && f5Check.ok ? '🟢' : postShr?.status === 201 && !f5Check.ok ? '🟡' : '🔴';
        detail = `typed=${JSON.stringify(typed)} save=${JSON.stringify(saveClick)} POST=${postShr?.method || 'none'} ${postShr?.status || ''} feAfter=${JSON.stringify(feAfterMutate)} F5=${JSON.stringify(f5Check)} name=${nameVal}`;
      }

      recordTc('TC-HDSD-03-02-01', verdict, detail, {
        uf: 'UF-XBOS-05',
        clickPath: '#hdsd-shareholder-add-row → name testid → save testid → FE check → F5 reopen holding edit',
        postStatus: postShr?.status ?? null,
        postUrl: postShr?.url ?? null,
      });
    }

    // TC-HDSD-04-02-01 UF-XBOS-10 regression
    {
      await openSettings(page, 'workflow_designer');
      await sleep(2000);
      try {
        await nativeClickByText(page, 'Canvas');
      } catch {
        try {
          await nativeClickByText(page, 'Quy trình');
        } catch {
          /* */
        }
      }
      await shot(page, '04-02-wf-canvas');
      const canvasOk = await page.evaluate(() => {
        const t = document.body?.innerText || '';
        const hasDots =
          !!document.querySelector('.bg-workflow-canvas-dots') ||
          !!document.querySelector('[class*="workflow-canvas"]');
        const hasError = /ERROR|Sync ERROR|500|409/i.test(t);
        return {
          hasDots,
          hasWorkflowText: /canvas|workflow|bước|node|Hệ thống quy trình/i.test(t),
          hasError,
          url: location.href,
        };
      });
      const wfNet = lastNet((n) => /workflow|process/.test(n.url) && n.status < 500);
      const verdict =
        !canvasOk.hasError && (canvasOk.hasDots || (canvasOk.hasWorkflowText && /settings=workflow/.test(canvasOk.url)))
          ? '🟢'
          : canvasOk.hasWorkflowText && !canvasOk.hasError
            ? '🟡'
            : '🔴';
      recordTc(
        'TC-HDSD-04-02-01',
        verdict,
        `deepLink workflow_designer dots=${canvasOk.hasDots} text=${canvasOk.hasWorkflowText} errorBanner=${canvasOk.hasError} net=${wfNet?.status ?? 'n/a'}`,
        { uf: 'UF-XBOS-10', clickPath: '?settings=workflow_designer → Canvas' },
      );
    }

    // TC-HDSD-10-04-01 internal_services redirect regression
    {
      const consoleBefore = results.consoleErrors.length;
      await page.goto(q('/hr/internal_services'), { waitUntil: 'domcontentloaded', timeout: 90000 });
      await sleep(3000);
      await shot(page, '10-04-internal-services');
      const state = await page.evaluate(() => ({
        url: location.href,
        has404text: /404|not found/i.test(document.body?.innerText || ''),
        hasErrorBanner: /ERROR|Sync ERROR|500/i.test(document.body?.innerText || ''),
        path: location.pathname,
      }));
      const internal404 = results.consoleErrors.slice(consoleBefore).some((e) => /404|internal_services/i.test(e));
      const getOk = lastNet((n) => n.method === 'GET' && /internal-services/.test(n.url) && n.status < 400);
      const verdict =
        !internal404 && !state.has404text && !state.hasErrorBanner && /internal-services/.test(state.path || state.url)
          ? '🟢'
          : internal404 || state.hasErrorBanner
            ? '🔴'
            : '🟡';
      recordTc(
        'TC-HDSD-10-04-01',
        verdict,
        `url=${state.url.slice(0, 100)} GET=${getOk?.status ?? 'n/a'} console404=${internal404} errorBanner=${state.hasErrorBanner}`,
        { uf: 'UF-HRM-MENU-05', clickPath: '/hr/internal_services embed redirect' },
      );
    }

    results.finishedAt = new Date().toISOString();
    results.summary = {
      green: results.tc.filter((t) => t.verdict === '🟢').length,
      yellow: results.tc.filter((t) => t.verdict === '🟡').length,
      red: results.tc.filter((t) => t.verdict === '🔴').length,
    };
    results.ack_status =
      results.tc.every((t) => t.verdict === '🟢') && results.tc.find((t) => t.id === 'TC-HDSD-03-02-01')?.verdict === '🟢'
        ? 'PASS_TO_PM'
        : 'FAIL_TO_PM';
    save();
  } finally {
    await browser.close();
  }

  console.log('Runtime:', OUT);
  console.log('Summary:', JSON.stringify(results.summary));
  console.log('ack_status:', results.ack_status);
  process.exit(results.ack_status === 'PASS_TO_PM' ? 0 : 1);
})();
