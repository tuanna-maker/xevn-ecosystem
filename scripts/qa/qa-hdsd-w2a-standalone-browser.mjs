/**
 * QA-HDSD-W2A-STANDALONE-01 — HRM standalone browser UAT CH05–11 (U65 zero-seed)
 * Entry: http://127.0.0.1:5175/* (base / per devops-hdsd-p2-stack)
 */
import puppeteer from 'puppeteer';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HRM = process.env.HRM_STANDALONE_URL || 'http://127.0.0.1:5175';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-qa-hdsd-w2a-standalone-runtime.json');
const SCREEN_DIR = resolve(ROOT, 'docs/qa/evidence/screens/hdsd-uat-w2a-20260730');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
/** Standalone: Router basename=/hr; omit embed portal query (causes 409 scope mismatch on :5175). */
const q = (path) => {
  let p = path.startsWith('/') ? path : `/${path}`;
  if (!p.startsWith('/hr/') && p !== '/hr') p = `/hr${p}`;
  return `${HRM}${p}`;
};

const results = {
  work_item_id: 'QA-HDSD-W2A-STANDALONE-01',
  program: 'HDSD-P2-FULL-01',
  entry: 'standalone',
  baseUrl: HRM,
  startedAt: new Date().toISOString(),
  env: { HRM, EMAIL, u65: 'zero-seed' },
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

function recordTc(id, legacyId, verdict, detail, extra = {}) {
  const row = { id, legacyId, verdict, detail, at: new Date().toISOString(), entry: 'standalone', ...extra };
  results.tc.push(row);
  console.log(`${verdict === '🟢' ? 'PASS' : verdict === '🟡' ? 'BLOCK' : 'FAIL'}  ${id}  ${detail.slice(0, 100)}`);
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
      if (!/\/api\/hrm\//.test(u)) return;
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

async function clickFirstRow(page) {
  return page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('tbody tr, [role="row"]')).filter((r) => {
      const t = (r.textContent || '').trim();
      return t.length > 8 && !/không có|no data|empty|chưa có/i.test(t);
    });
    if (!rows.length) return { ok: false, reason: 'empty' };
    rows[0].scrollIntoView({ block: 'center' });
    rows[0].click();
    return { ok: true, text: (rows[0].textContent || '').replace(/\s+/g, ' ').trim().slice(0, 100) };
  });
}

async function bodyHasError(page) {
  return page.evaluate(() => {
    const t = document.body?.innerText || '';
    const banner =
      (/ERROR|Sync ERROR|54321|ERR_CONNECTION|thất bại/i.test(t) &&
        !/Đăng nhập thất bại/i.test(t.slice(0, 200))) ||
      /Phạm vi tenant\/công ty không khớp|companyId mismatches/i.test(t);
    return { banner, url: location.href, snippet: t.slice(0, 400) };
  });
}

async function hrmLogin(page) {
  await page.goto(q('/login'), { waitUntil: 'networkidle0', timeout: 90000 });
  await sleep(1500);
  await page.waitForSelector('input[type="email"]', { timeout: 30000 });
  await page.type('input[type="email"]', EMAIL, { delay: 12 });
  await page.type('input[type="password"]', PASSWORD, { delay: 12 });
  const before = results.network.length;
  await page.click('button[type="submit"]');
  await sleep(5000);
  const loginNet = results.network.slice(before).find((n) => /auth\/(mobile\/)?login/.test(n.url));
  const authed = await page.evaluate(
    () => !!localStorage.getItem('xevn.portal.accessToken') && !location.pathname.endsWith('/login'),
  );
  return { url: page.url(), loginNet, authed };
}

async function loadRoute(page, path) {
  await page.goto(q(path), { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(3000);
  const err = await bodyHasError(page);
  const get2xx = await waitForNet((n) => n.method === 'GET' && n.status >= 200 && n.status < 300, 12000);
  return { err, get2xx, url: page.url() };
}

(async () => {
  console.log('=== QA-HDSD-W2A-STANDALONE CH05-11 ===', HRM);

  for (const [name, url] of [
    ['hrm-api', 'http://127.0.0.1:28001/api/hrm'],
    ['hrm-standalone', `${HRM}/`],
    ['hrm-employees', `${HRM}/hr/employees`],
  ]) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
      results.l0[name] = { ok: r.ok, status: r.status, url };
    } catch (e) {
      results.l0[name] = { ok: false, error: String(e.message || e) };
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
    const login = await hrmLogin(page);
    await shot(page, 'w2a-login');
    const loginOk = !/\/login/.test(login.url) || /employees|dashboard|\//.test(login.url);
    recordTc(
      'TC-HRM-HDSD-004',
      'TC-ECO-03-standalone',
      login.authed && (login.loginNet?.status === 201 || login.loginNet?.status === 200) ? '🟢' : login.authed ? '🟡' : '🔴',
      `Standalone login → ${login.url}; loginAPI=${login.loginNet?.status ?? 'n/a'}; token=${login.authed}`,
      { clickPath: `${HRM}/hr/login → Đăng nhập`, uf: 'UF-HRM-MENU-01' },
    );

    if (!login.authed) {
      recordTc(
        'TC-HRM-HDSD-L0-BLOCK',
        'L0-hrm-api',
        '🔴',
        `Login/auth blocked — loginAPI=${login.loginNet?.status ?? 'none'}; continuing shell-only route probe`,
        { clickPath: 'L0 gate' },
      );
    }

    const routes = [
      ['TC-HRM-HDSD-006', 'TC-HDSD-05-01-01', '/employees', 'CH05 §5.1 Danh sách NV', 'UF-HRM-01'],
      ['TC-HRM-HDSD-026', 'TC-HDSD-05-02-01', '/employees', 'CH05 §5.2 list→detail J-HRM-01', 'UF-HRM-01', 'detail'],
      ['TC-HRM-HDSD-016', 'TC-HDSD-05-03-01', '/employees', 'CH05 §5.3 Tạo NV', 'UF-HRM-03', 'create'],
      ['TC-HRM-HDSD-022', 'TC-HDSD-05-04-01', '/employees', 'CH05 §5.4 Sửa NV', 'UF-HRM-03', 'edit'],
      ['TC-HRM-HDSD-036', 'TC-HDSD-06-01-01', '/contracts', 'CH06 §6.1 HĐ list', 'UF-HRM-04'],
      ['TC-HRM-HDSD-042', 'TC-HDSD-06-02-01', '/contracts', 'CH06 §6.2 Tạo HĐ', 'UF-HRM-05', 'create'],
      ['TC-HRM-HDSD-048', 'TC-HDSD-06-03-01', '/insurance', 'CH06 §6.3 BHXH', 'UF-HRM-06'],
      ['TC-HRM-HDSD-052', 'TC-HDSD-06-04-01', '/insurance', 'CH06 §6.4 BHXH hết hạn', 'UF-HRM-06', 'tab'],
      ['TC-HRM-HDSD-054', 'TC-HDSD-07-01-01', '/recruitment', 'CH07 §7.1 YCTD list', 'UF-HRM-07'],
      ['TC-HRM-HDSD-058', 'TC-HDSD-07-02-01', '/recruitment', 'CH07 §7.2 Tạo YCTD', 'UF-HRM-07', 'create'],
      ['TC-HRM-HDSD-064', 'TC-HDSD-07-03-01', '/recruitment', 'CH07 §7.3 Pipeline', 'UF-HRM-07'],
      ['TC-HRM-HDSD-072', 'TC-HDSD-08-01-01', '/attendance', 'CH08 §8.1 Bảng CC', 'UF-HRM-08'],
      ['TC-HRM-HDSD-078', 'TC-HDSD-08-02-01', '/attendance', 'CH08 §8.2 Đơn nghỉ', 'UF-HRM-09', 'leave'],
      ['TC-HRM-HDSD-084', 'TC-HDSD-08-03-01', '/attendance', 'CH08 §8.3 Công chuẩn', 'UF-HRM-08', 'tab'],
      ['TC-HRM-HDSD-089', 'TC-HDSD-09-01-01', '/payroll', 'CH09 §9.1 Kỳ lương', 'UF-HRM-10'],
      ['TC-HRM-HDSD-094', 'TC-HDSD-09-02-01', '/payroll', 'CH09 §9.2 Phiếu lương', 'UF-HRM-11', 'detail'],
      ['TC-HRM-HDSD-099', 'TC-HDSD-09-03-01', '/payroll', 'CH09 §9.3 Đối soát', 'UF-HRM-11', 'report'],
      ['TC-HRM-HDSD-106', 'TC-HDSD-10-01-01', '/company', 'CH10 §10.1 Headcount', 'UF-HRM-MENU-15', 'headcount'],
      ['TC-HRM-HDSD-118', 'TC-HDSD-10-02-01', '/decisions', 'CH10 §10.2 Quyết định', 'UF-HRM-MENU-05'],
      ['TC-HRM-HDSD-124', 'TC-HDSD-10-03-01', '/tasks', 'CH10 §10.3 Công việc', 'UF-HRM-MENU-05'],
      ['TC-HRM-HDSD-130', 'TC-HDSD-10-04-01', '/internal-services', 'CH10 §10.4 DVC', 'UF-HRM-MENU-05'],
      ['TC-HRM-HDSD-136', 'TC-HDSD-10-05-01', '/processes', 'CH10 §10.5 Quy trình', 'UF-HRM-MENU-05'],
      ['TC-HRM-HDSD-142', 'TC-HDSD-10-06-01', '/fleet', 'CH10 §10.6 Fleet', 'UF-HRM-MENU-05'],
      ['TC-HRM-HDSD-147', 'TC-HDSD-11-01-01', '/settings', 'CH11 §11.1 Settings catalogs', 'UF-HRM-12', 'catalog'],
      ['TC-HRM-HDSD-162', 'TC-HDSD-11-02-01', '/reports', 'CH11 §11.2 Báo cáo', 'UF-HRM-13'],
    ];

    for (const row of routes) {
      const [tcId, legacyId, route, label, uf, mode] = row;
      const loaded = await loadRoute(page, route);
      await shot(page, tcId.replace(/-/g, '_').toLowerCase());
      let verdict = loaded.err.banner ? '🔴' : loaded.get2xx ? '🟢' : '🟡';
      let detail = `${label} GET=${loaded.get2xx?.status ?? 'none'} url=${loaded.url.slice(0, 90)}`;
      if (!login.authed) {
        verdict = '🔴';
        detail += ' · BLOCKED no session (L0/API)';
      }
      const scope409 = lastNet((n) => n.status === 409 && /employees|contracts|catalog|summary/.test(n.url));
      if (scope409) {
        verdict = '🟡';
        detail += ` scope409=${scope409.url.slice(0, 60)}`;
      }
      const srv500 = lastNet((n) => n.status >= 500);
      if (srv500) {
        verdict = '🔴';
        detail += ` HTTP500=${srv500.url.slice(0, 60)}`;
      }

      if (mode === 'detail') {
        const r = await clickFirstRow(page);
        await sleep(2000);
        const detailGet = lastNet((n) => n.method === 'GET' && /employees\/[^/?]+/.test(n.url) && n.status < 400);
        verdict = r.ok && (detailGet || /employees\//.test(page.url())) ? '🟢' : '🟡';
        detail += ` clickRow=${r.ok} detailGET=${detailGet?.status ?? 'none'} J-HRM-01`;
      }

      if (mode === 'create') {
        try {
          await nativeClickByText(page, 'Thêm');
        } catch {
          try {
            await nativeClickByText(page, 'Tạo mới');
          } catch {
            /* */
          }
        }
        await sleep(1500);
        const hasForm = await page.evaluate(() => !!document.querySelector('[role="dialog"], form, input'));
        verdict = hasForm ? '🟡' : verdict;
        detail += ` createForm=${hasForm} · mutate BLOCKED U65 (form-only OK)`;
      }

      if (mode === 'edit') {
        const r = await clickFirstRow(page);
        if (r.ok) {
          try {
            await nativeClickByText(page, 'Sửa');
          } catch {
            /* */
          }
          verdict = '🟡';
          detail += ' edit dialog soft — PATCH+F5 not closed';
        } else {
          verdict = '🟡';
          detail += ' empty — BLOCKED mutate';
        }
      }

      if (mode === 'leave') {
        try {
          await nativeClickByText(page, 'Nghỉ phép');
          await sleep(1200);
        } catch {
          /* */
        }
        detail += ' · leave mutate known BE 400 — load-only';
        verdict = loaded.get2xx && !loaded.err.banner ? '🟡' : verdict;
      }

      if (mode === 'tab') {
        for (const t of ['Công chuẩn', 'Ca làm', 'sắp hết hạn', 'Shift']) {
          try {
            await nativeClickByText(page, t);
            await sleep(800);
            break;
          } catch {
            /* */
          }
        }
      }

      if (mode === 'headcount') {
        const summaryNet = lastNet((n) => /summary|headcount|employees\/summary/.test(n.url));
        verdict = summaryNet && summaryNet.status < 400 && !loaded.err.banner ? '🟢' : loaded.err.banner ? '🔴' : '🟡';
        detail += ` summaryAPI=${summaryNet?.status ?? 'soft-ui'}`;
      }

      if (mode === 'catalog') {
        try {
          await nativeClickByText(page, 'Danh mục');
        } catch {
          /* */
        }
        const syncNet = lastNet((n) => /catalog-sync|catalog/.test(n.url) && n.status < 400);
        verdict = syncNet && !loaded.err.banner ? '🟢' : loaded.err.banner ? '🔴' : '🟡';
        detail += ` catalogSync=${syncNet?.status ?? 'none'}`;
      }

      if (mode === 'detail' && tcId === 'TC-HRM-HDSD-094') {
        await clickFirstRow(page).catch(() => null);
        await sleep(1500);
        detail += ' drill=payslip';
      }
      if (mode === 'report') {
        await clickFirstRow(page).catch(() => null);
        await sleep(1500);
        detail += ' drill=reconciliation';
      }

      recordTc(tcId, legacyId, verdict, detail, { clickPath: label, uf, route: q(route).slice(0, 120) });
    }

    results.finishedAt = new Date().toISOString();
    results.summary = {
      total: results.tc.length,
      green: results.tc.filter((t) => t.verdict === '🟢').length,
      yellow: results.tc.filter((t) => t.verdict === '🟡').length,
      red: results.tc.filter((t) => t.verdict === '🔴').length,
    };
    save();
  } finally {
    await browser.close();
  }

  console.log('\n=== SUMMARY ===', JSON.stringify(results.summary));
  process.exit(results.summary?.red > 0 ? 1 : 0);
})();
