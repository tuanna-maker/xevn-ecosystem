/**
 * QA-HDSD-BF-INT02-01 — BF-01 TC-ECO-INT-02 headcount rollup (U65 zero-seed)
 * HRM headcount card ↔ company scope · XBOS org dashboard cross-nav · J-HRM-CO-01 spot
 */
import puppeteer from 'puppeteer';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM_API = process.env.HRM_API_URL || 'http://127.0.0.1:28001';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_DIR = resolve(ROOT, 'docs/qa/evidence');
const RUNTIME = resolve(OUT_DIR, '_tmp-qa-hdsd-bf-int02-01-runtime.json');
const SCREEN_DIR = resolve(OUT_DIR, 'screens/hdsd-bf-int02-01-20260801');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const qPortal = (path) =>
  `${PORTAL}${path}${path.includes('?') ? '&' : '?'}portal=1&tenantId=xevn&companyId=main`;

const results = {
  work_item_id: 'QA-HDSD-BF-INT02-01',
  program: 'P-HDSD-ECOSYSTEM-03 · BF-01',
  startedAt: new Date().toISOString(),
  env: { PORTAL, EMAIL, u65: 'zero-seed' },
  l0: {},
  cases: [],
  network: [],
  consoleErrors: [],
  screens: [],
  ui: {},
  apiProbe: {},
};

function save() {
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(RUNTIME, JSON.stringify(results, null, 2));
}

function recordCase(id, verdict, detail, extra = {}) {
  const row = { id, verdict, detail, at: new Date().toISOString(), ...extra };
  results.cases.push(row);
  console.log(`[${verdict}] ${id} — ${detail.slice(0, 140)}`);
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
  page.on('response', async (res) => {
    try {
      const u = res.url();
      if (!/\/api\/(hrm|xbos)\//.test(u)) return;
      const method = res.request().method();
      if (method === 'OPTIONS') return;
      const entry = {
        method,
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 280),
        at: new Date().toISOString(),
      };
      if (u.includes('/employees/summary')) {
        try {
          const body = await res.json();
          const data = body?.data ?? body;
          entry.response_total = data?.total;
          entry.response_company_id = data?.company_id;
          entry.by_company_len = Array.isArray(data?.by_company) ? data.by_company.length : 0;
        } catch {
          /* ignore */
        }
      }
      results.network.push(entry);
    } catch {
      /* */
    }
  });
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const t = msg.text();
      if (!/favicon|404.*\.map|ResizeObserver|devtools/i.test(t)) {
        results.consoleErrors.push(t.slice(0, 240));
      }
    }
  });
}

function lastNet(pred) {
  for (let i = results.network.length - 1; i >= 0; i--) {
    if (pred(results.network[i])) return results.network[i];
  }
  return null;
}

async function waitForNet(pred, timeoutMs = 18000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const hit = lastNet(pred);
    if (hit) return hit;
    await sleep(200);
  }
  return null;
}

async function bodyHasError(page) {
  return page.evaluate(() => {
    const t = (document.body?.innerText || '').slice(0, 2000);
    return {
      banner:
        /HRM API Sync ERROR|409|403 Forbidden|500 Internal|companyId mismatches/i.test(t) ||
        !!document.querySelector('[class*="error-banner"], [data-testid*="error"]'),
      excerpt: t.slice(0, 400),
    };
  });
}

async function loginApi() {
  for (const url of [
    `${PORTAL}/api/xbos/auth/login`,
    'http://127.0.0.1:28002/api/xbos/auth/login',
  ]) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
      });
      const j = await r.json();
      const data = j?.data ?? j;
      const token = data?.accessToken ?? data?.access_token ?? j?.accessToken;
      if (token) return { token, user: data?.user ?? { email: EMAIL }, raw: data };
    } catch {
      /* try next */
    }
  }
  throw new Error('login failed');
}

async function probeSummary(token) {
  const url = `${HRM_API}/api/hrm/employees/summary?company_id=main`;
  const r = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'x-tenant-id': 'xevn',
      'content-type': 'application/json',
    },
  });
  const j = await r.json();
  const data = j?.data ?? j;
  results.apiProbe = {
    url,
    status: r.status,
    total: data?.total,
    company_id: data?.company_id,
    by_company_len: Array.isArray(data?.by_company) ? data.by_company.length : 0,
  };
  return data;
}

async function injectSession(page, session) {
  await page.evaluateOnNewDocument((s) => {
    const payload = JSON.stringify(s.user);
    for (const store of [localStorage, sessionStorage]) {
      store.setItem('xevn.portal.accessToken', s.token);
      store.setItem('xevn.portal.tokenExpiresAt', String(Date.now() + 8 * 3600_000));
      store.setItem('xevn.portal.user', payload);
      store.setItem('xevn.portal.tenantId', 'xevn');
      store.setItem('xevn.portal.companyId', 'main');
    }
  }, session);
}

async function resolveHrmFrame(page) {
  for (let i = 0; i < 24; i++) {
    const hit = page.frames().find((f) => {
      const u = f.url() || '';
      return u.includes('/hr/company') || u.includes('/hr/') || u.includes('company');
    });
    if (hit) {
      try {
        const hasUi = await hit.evaluate(
          () =>
            document.body?.innerText?.includes('Tổng nhân viên') ||
            document.body?.innerText?.includes('Số nhân viên') ||
            !!document.querySelector('table'),
        );
        if (hasUi) return hit;
      } catch {
        /* retry */
      }
    }
    await sleep(500);
  }
  return page.frames().find((f) => f !== page.mainFrame()) || page.mainFrame();
}

async function scrapeHeadcount(frame) {
  return frame.evaluate(() => {
    const text = (el) => (el?.textContent || '').replace(/\s+/g, ' ').trim();
    const bodyText = text(document.body);
    let cardTotal = null;
    const all = Array.from(document.querySelectorAll('p, span, div, h2, h3'));
    for (let i = 0; i < all.length; i++) {
      if (text(all[i]) !== 'Tổng nhân viên') continue;
      const parent = all[i].parentElement;
      if (parent) {
        const m = text(parent).match(/\b([0-9]{2,6})\b/);
        if (m) cardTotal = m[1];
      }
      if (!cardTotal) {
        for (let j = i - 1; j >= Math.max(0, i - 6); j--) {
          const u = text(all[j]);
          if (/^[0-9]{1,3}(?:[.\s]?[0-9]{3})*$/.test(u)) {
            cardTotal = u.replace(/[.\s]/g, '');
            break;
          }
        }
      }
      if (cardTotal) break;
    }
    if (!cardTotal) {
      const m = bodyText.match(/([0-9]{3,5})\s*Tổng nhân viên/);
      if (m) cardTotal = m[1];
    }
    const rows = [];
    for (const table of Array.from(document.querySelectorAll('table'))) {
      const headers = Array.from(table.querySelectorAll('th')).map((th) => text(th));
      const empIdx = headers.findIndex((h) => h.includes('Số nhân viên'));
      const nameIdx = headers.findIndex((h) => h.includes('Tên') || h.includes('Công ty') || h.includes('Đơn vị'));
      if (empIdx < 0) continue;
      for (const tr of Array.from(table.querySelectorAll('tbody tr'))) {
        const cells = Array.from(tr.querySelectorAll('td'));
        if (!cells.length) continue;
        rows.push({
          name: nameIdx >= 0 ? text(cells[nameIdx]) : text(cells[0]),
          count: text(cells[empIdx]).replace(/[.\s]/g, ''),
        });
      }
    }
    return { cardTotal, rows, hasHeadcountLabel: /Tổng nhân viên/i.test(bodyText) };
  });
}

(async () => {
  save();
  const session = await loginApi();
  await probeSummary(session.token);

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
  });

  try {
    const page = await browser.newPage();
    trackNetwork(page);
    await injectSession(page, session);

    // --- HRM Company headcount ---
    await page.goto(qPortal('/command-center/hrm/company'), {
      waitUntil: 'networkidle2',
      timeout: 120000,
    });
    await sleep(3500);
    await shot(page, '01-hrm-company-embed');

    const summaryNet = await waitForNet(
      (n) => /employees\/summary/.test(n.url) && n.status >= 200 && n.status < 400,
      20000,
    );
    const hcErr = await bodyHasError(page);
    const frame = await resolveHrmFrame(page);
    const ui = await scrapeHeadcount(frame);
    results.ui.hrmCompany = ui;

    await page.evaluate(() => window.scrollTo(0, 0));
    await sleep(500);
    await shot(page, '02-hrm-headcount-card-table');

    const rowSum = ui.rows.reduce((s, r) => s + (Number(r.count) || 0), 0);
    const cardNum = Number(ui.cardTotal) || 0;
    const apiTotal = Number(results.apiProbe.total) || Number(summaryNet?.response_total) || 0;
    const allZeroRows = ui.rows.length > 0 && ui.rows.every((r) => !Number(r.count));
    const parityOk =
      cardNum > 0 &&
      apiTotal > 0 &&
      Math.abs(cardNum - apiTotal) <= Math.max(1, apiTotal * 0.01) &&
      !allZeroRows;

    // F5 stability
    await page.reload({ waitUntil: 'networkidle2', timeout: 90000 });
    await sleep(3000);
    const frameF5 = await resolveHrmFrame(page);
    const uiF5 = await scrapeHeadcount(frameF5);
    results.ui.hrmCompanyF5 = uiF5;
    await shot(page, '03-hrm-f5');

    const f5Stable = uiF5.cardTotal === ui.cardTotal;

    // --- XBOS org dashboard cross-nav ---
    await page.goto(`${PORTAL}/dashboard/organization`, {
      waitUntil: 'domcontentloaded',
      timeout: 90000,
    });
    await sleep(2500);
    await shot(page, '04-xbos-org-dashboard');
    const orgNet = lastNet(
      (n) =>
        /organization|legal-entities|tenant-scope|group-member-units/.test(n.url) &&
        n.status < 400,
    );
    const orgErr = await bodyHasError(page);

    // --- J-HRM-CO-01 spot: row detail if available ---
    await page.goto(qPortal('/command-center/hrm/company'), {
      waitUntil: 'networkidle2',
      timeout: 90000,
    });
    await sleep(3000);
    const frame2 = await resolveHrmFrame(page);
    let detailOk = false;
    let detailNote = 'no-detail-click';
    try {
      const clicked = await frame2.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button, [role="menuitem"], a')).find(
          (el) =>
            (el.getAttribute('aria-label') || '').includes('viewDetail') ||
            (el.textContent || '').includes('Xem chi tiết') ||
            (el.textContent || '').includes('Chi tiết'),
        );
        if (btn) {
          btn.click();
          return true;
        }
        const more = document.querySelector('button[aria-haspopup="menu"], [data-testid*="more"]');
        if (more) {
          more.click();
          return 'menu';
        }
        return false;
      });
      if (clicked === 'menu') {
        await sleep(600);
        await frame2.evaluate(() => {
          const item = Array.from(document.querySelectorAll('[role="menuitem"], button, a')).find(
            (el) => (el.textContent || '').includes('Xem') || (el.textContent || '').includes('Chi tiết'),
          );
          item?.click();
        });
      }
      if (clicked) {
        await sleep(1500);
        detailOk = await frame2.evaluate(() => {
          const t = document.body?.innerText || '';
          return /nhân viên|Thành lập|MST|Công ty/i.test(t) && !/404|403|500/.test(t);
        });
        detailNote = detailOk ? 'detail-dialog-open' : 'detail-no-content';
        await shot(page, '05-company-detail-dialog');
        await frame2.keyboard?.press('Escape').catch(() => {});
      }
    } catch (e) {
      detailNote = String(e).slice(0, 80);
    }

    const int02Pass =
      summaryNet &&
      summaryNet.status < 400 &&
      !hcErr.banner &&
      !orgErr.banner &&
      (orgNet || ui.hasHeadcountLabel) &&
      parityOk &&
      f5Stable;

    recordCase(
      'TC-ECO-INT-02',
      int02Pass ? '🟢' : hcErr.banner || orgErr.banner || !parityOk ? '🔴' : '🟡',
      `summary=${summaryNet?.status ?? 'none'} apiTotal=${apiTotal} card=${cardNum} rowSum=${rowSum} f5=${f5Stable} org=${orgNet?.status ?? 'none'} detail=${detailNote}`,
      {
        uf: 'UF-HRM-MENU-15 · UF-HRM headcount',
        j: 'J-HRM-CO-01',
        clickPath: 'CC /hr/company card+table → F5 → /dashboard/organization → company detail spot',
        network: {
          summary: summaryNet?.url,
          org: orgNet?.url,
        },
        parity: { cardNum, apiTotal, rowSum, allZeroRows, f5Stable },
        detail: { ok: detailOk, note: detailNote },
      },
    );

    recordCase(
      'J-HRM-CO-01-spot',
      detailOk || (parityOk && f5Stable) ? '🟢' : '🟡',
      `headcount card=${cardNum} detail=${detailNote}`,
      { uf: 'UF-HRM-MENU-15' },
    );

    results.finishedAt = new Date().toISOString();
    results.summary = {
      verdict: int02Pass ? 'PASS' : 'FAIL',
      green: results.cases.filter((c) => c.verdict === '🟢').length,
      yellow: results.cases.filter((c) => c.verdict === '🟡').length,
      red: results.cases.filter((c) => c.verdict === '🔴').length,
    };
    save();
  } finally {
    await browser.close();
  }

  console.log('\n=== SUMMARY ===', JSON.stringify(results.summary));
  process.exit(results.summary?.verdict === 'PASS' ? 0 : 1);
})();
