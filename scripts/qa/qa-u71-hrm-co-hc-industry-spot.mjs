/**
 * QA-U71-HRM-CO-HC-REGRESSION-01 — industry column spot (AC-CO-IND-02)
 * Companion to qa-hrm-co-emp-count-01.mjs — U65 zero-seed
 */
import puppeteer from 'puppeteer';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const XBOS_API = process.env.XBOS_API_URL || 'http://127.0.0.1:28002';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const CHROME =
  process.env.CHROME_PATH ||
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dir, '../../docs/qa/evidence/_tmp-qa-u71-hrm-co-hc-industry-runtime.json');
const FORBIDDEN = new Set(['subsidiary', 'holding', 'parent', 'member', 'branch']);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function loginApi() {
  const url = `${XBOS_API}/api/xbos/auth/login`;
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const j = await r.json();
  const data = j?.data ?? j;
  const token = data?.accessToken ?? data?.access_token;
  if (!token) throw new Error(`login failed ${r.status}`);
  return {
    token,
    expiresAt: Date.now() + 8 * 3600_000,
    user: data?.user ?? {
      userId: EMAIL,
      email: EMAIL,
      displayName: 'CEO Tập đoàn',
      roles: ['group_ceo', 'portal'],
    },
    raw: data,
  };
}

async function main() {
  const session = await loginApi();
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--window-size=1440,900'],
    defaultViewport: { width: 1440, height: 900 },
  });
  const page = await browser.newPage();
  await page.evaluateOnNewDocument((s) => {
    const payload = JSON.stringify(s.user);
    for (const store of [localStorage, sessionStorage]) {
      store.setItem('xevn.portal.accessToken', s.token);
      store.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
      store.setItem('xevn.portal.user', payload);
      store.setItem('xevn.portal.tenantId', 'xevn');
      store.setItem('xevn.portal.companyId', 'main');
      if (s.raw?.refreshToken) store.setItem('xevn.portal.refreshToken', s.raw.refreshToken);
    }
  }, session);

  await page.goto(`${PORTAL}/command-center/hrm/company`, {
    waitUntil: 'networkidle2',
    timeout: 90_000,
  });

  async function resolveHrmFrame() {
    for (let i = 0; i < 24; i++) {
      for (const f of page.frames()) {
        const u = f.url() || '';
        if (!(u.includes('/hr/') || u.includes('/hrm/') || u.includes('company'))) continue;
        try {
          await f.waitForSelector('table', { timeout: 2000 });
          const ok = await f.evaluate(
            () =>
              document.body?.innerText?.includes('Số nhân viên') ||
              document.body?.innerText?.includes('Ngành nghề') ||
              !!document.querySelector('table tbody tr'),
          );
          if (ok) return f;
        } catch {
          /* retry */
        }
      }
      await sleep(500);
    }
    return page.frames().find((f) => f !== page.mainFrame()) || page.mainFrame();
  }

  const frame = await resolveHrmFrame();
  await sleep(1500);

  const scrape = await frame.evaluate(() => {
    const text = (el) => (el?.textContent || '').replace(/\s+/g, ' ').trim();
    const tables = Array.from(document.querySelectorAll('table'));
    for (const table of tables) {
      const headers = Array.from(table.querySelectorAll('th')).map((th) => text(th));
      const indIdx = headers.findIndex(
        (h) => h.includes('Ngành nghề') || h.toLowerCase().includes('industry'),
      );
      const nameIdx = headers.findIndex(
        (h) => h.includes('Tên') || h.includes('Công ty') || h.includes('Đơn vị'),
      );
      // Fallback: scan all header cells if «Ngành nghề» header uses i18n key
      let idx = indIdx;
      if (idx < 0) {
        idx = headers.findIndex((h) => /ngành|industry|business/i.test(h));
      }
      const rows = [];
      for (const tr of Array.from(table.querySelectorAll('tbody tr'))) {
        const cells = Array.from(tr.querySelectorAll('td'));
        if (!cells.length) continue;
        // Typical columns: checkbox?, name, code, industry, emp, status, actions — cellCount=7 from prior
        const industryCell =
          idx >= 0 ? text(cells[idx]) : cells.length >= 4 ? text(cells[3]) : '';
        rows.push({
          name: nameIdx >= 0 ? text(cells[nameIdx]) : text(cells[0]),
          industry: industryCell,
          allCells: cells.map((c) => text(c)).slice(0, 8),
        });
      }
      return { headers, rows, iframe: location.href, indIdx: idx };
    }
    return {
      headers: [],
      rows: [],
      iframe: location.href,
      bodySnippet: text(document.body).slice(0, 500),
    };
  });

  const bad = (scrape.rows || []).filter((r) => {
    const cells = [r.industry, ...(r.allCells || [])].map((x) =>
      String(x || '')
        .trim()
        .toLowerCase(),
    );
    return cells.some((v) => FORBIDDEN.has(v));
  });

  const result = {
    work_item_id: 'QA-U71-HRM-CO-HC-REGRESSION-01',
    finishedAt: new Date().toISOString(),
    iframe: scrape.iframe,
    scrape,
    forbiddenHits: bad,
    'AC-CO-IND-02': {
      ok: bad.length === 0 && (scrape.rows || []).length > 0,
      detail: `rows=${scrape.rows?.length} forbiddenRaw=${bad.length} headers=${JSON.stringify(scrape.headers)} sample=${JSON.stringify((scrape.rows || []).slice(0, 6))}`,
    },
  };
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result['AC-CO-IND-02'], null, 2));
  console.log(`runtime=${OUT}`);
  await browser.close();
  process.exitCode = result['AC-CO-IND-02'].ok ? 0 : 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
