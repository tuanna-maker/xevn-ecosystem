/**
 * QA-HRM-CO-01-HEADCOUNT-01 — UC-HRM-CO-01 headcount bind (Plane B slug)
 * AC-CO-EMP-01 · AC-CO-EMP-02 · AC-CO-EMP-06 · J-HRM-CO-01
 * U65 zero-seed · ceo@xe.vn · Portal :5173/hr embed Công ty
 */
import puppeteer from 'puppeteer';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const XBOS_API = process.env.XBOS_API_URL || 'http://127.0.0.1:28002';
const HRM_API = process.env.HRM_API_URL || 'http://127.0.0.1:28001';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const CHROME =
  process.env.CHROME_PATH ||
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const STAMP =
  process.env.QA_STAMP ||
  `COHCQA1-${Date.now().toString(36).toUpperCase().slice(-8)}`;

const __dir = dirname(fileURLToPath(import.meta.url));
const EVIDENCE = resolve(__dir, '../../docs/qa/evidence');
const OUT = resolve(EVIDENCE, '_tmp-qa-hrm-co-01-headcount-01-runtime.json');
const SHOT_LIST = resolve(EVIDENCE, '_tmp-qa-hrm-co-01-headcount-01-list.png');
const SHOT_F5 = resolve(EVIDENCE, '_tmp-qa-hrm-co-01-headcount-01-f5.png');

/** Mirror apps/web/hrm/src/lib/hrmCompanyEmployeeCount.ts FALLBACK_DISPLAY_NAME_TO_SLUG */
const FALLBACK_DISPLAY_NAME_TO_SLUG = {
  'tap doan xevn': 'holding',
  'cong ty co phan thuong mai va dich vu x.e': 'trsport',
  'cong ty tnhh du lich visun': 'logistics',
  'cong ty tnhh du lich x.e viet nam': 'finance',
  'cong ty tnhh x.e viet nam': 'services',
};

function foldCompanyDisplayKey(name) {
  return (name ?? '')
    .normalize('NFC')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const results = {
  work_item_id: 'QA-HRM-CO-01-HEADCOUNT-01',
  stamp: STAMP,
  startedAt: new Date().toISOString(),
  env: { PORTAL, HRM_API, XBOS_API, EMAIL, seed: false },
  network: { summary: [] },
  verdicts: {},
  ui: {},
  api: {},
  overall: null,
};

function save() {
  mkdirSync(EVIDENCE, { recursive: true });
  writeFileSync(OUT, JSON.stringify(results, null, 2));
}

function setVerdict(id, ok, detail, extra = {}) {
  results.verdicts[id] = { ok, detail, ...extra };
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${id}  ${detail}`);
  save();
  return ok;
}

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

async function injectSession(page, session) {
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
}

function trackNetwork(page) {
  page.on('response', (res) => {
    const url = res.url();
    if (url.includes('/api/hrm/employees/summary')) {
      results.network.summary.push({ url: url.slice(0, 220), status: res.status() });
      save();
    }
  });
}

async function resolveHrmFrame(page) {
  for (let i = 0; i < 24; i++) {
    for (const f of page.frames()) {
      const u = f.url() || '';
      if (!(u.includes('/hr/') || u.includes('company'))) continue;
      try {
        await f.waitForSelector('table', { timeout: 2000 });
        const ok = await f.evaluate(
          () =>
            document.body?.innerText?.includes('Số nhân viên') ||
            document.body?.innerText?.includes('Tổng nhân viên') ||
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

async function scrapeTable(frame) {
  return frame.evaluate(() => {
    const text = (el) => (el?.textContent || '').replace(/\s+/g, ' ').trim();
    const tables = Array.from(document.querySelectorAll('table'));
    for (const table of tables) {
      const headers = Array.from(table.querySelectorAll('th')).map((th) => text(th));
      const empIdx = headers.findIndex((h) => h.includes('Số nhân viên') || /employee/i.test(h));
      const nameIdx = headers.findIndex(
        (h) => h.includes('Tên') || h.includes('Công ty') || h.includes('Đơn vị'),
      );
      const rows = [];
      for (const tr of Array.from(table.querySelectorAll('tbody tr'))) {
        const cells = Array.from(tr.querySelectorAll('td'));
        if (!cells.length) continue;
        rows.push({
          name: nameIdx >= 0 ? text(cells[nameIdx]) : text(cells[1] || cells[0]),
          employee_count: empIdx >= 0 ? text(cells[empIdx]) : '',
        });
      }
      return { headers, empIdx, rows, href: location.href };
    }
    return { headers: [], rows: [], href: location.href };
  });
}

async function scrapeCardTotal(frame) {
  return frame.evaluate(() => {
    const text = (el) => (el?.textContent || '').replace(/\s+/g, ' ').trim();
    const body = text(document.body);
    const m = body.match(/([0-9]{1,6})\s*Tổng nhân viên/);
    if (m) return { raw: m[1], num: Number(m[1].replace(/[.\s]/g, '')) };
    const testId = document.querySelector('[data-testid="co-total-headcount"]');
    if (testId) {
      const n = Number(text(testId).replace(/[.\s]/g, ''));
      if (Number.isFinite(n)) return { raw: text(testId), num: n, via: 'testid' };
    }
    return { raw: null, num: null };
  });
}

function guessSlug(name) {
  const folded = foldCompanyDisplayKey(name);
  if (folded.includes('tap doan') && folded.includes('xevn')) return 'holding';
  return FALLBACK_DISPLAY_NAME_TO_SLUG[folded] ?? null;
}

function parseCountCell(raw) {
  const v = String(raw || '').trim();
  if (!v || v === '—' || v === '-') return { kind: 'dash', num: null };
  const n = Number(v.replace(/[.\s,]/g, ''));
  if (!Number.isFinite(n)) return { kind: 'bad', num: null };
  return { kind: 'num', num: n };
}

async function fetchSummary(token) {
  const headers = { Authorization: `Bearer ${token}`, 'x-tenant-id': 'xevn' };
  const portalUrl = `${PORTAL}/api/hrm/employees/summary?company_id=main`;
  const directUrl = `${HRM_API}/api/hrm/employees/summary?company_id=main`;
  const [portalR, directR] = await Promise.all([
    fetch(portalUrl, { headers }),
    fetch(directUrl, { headers }),
  ]);
  const portalJ = portalR.ok ? await portalR.json() : null;
  const directJ = directR.ok ? await directR.json() : null;
  const data = directJ?.data ?? directJ ?? portalJ?.data ?? portalJ;
  const byCompany = Array.isArray(data?.by_company) ? data.by_company : [];
  const slugMap = Object.fromEntries(
    byCompany.map((row) => [String(row.company_id), Number(row.total ?? 0)]),
  );
  return {
    portalStatus: portalR.status,
    directStatus: directR.status,
    total: Number(data?.total ?? 0),
    byCompany,
    slugMap,
  };
}

async function main() {
  const session = await loginApi();
  setVerdict('login', true, 'xbos auth token ok');

  const summary = await fetchSummary(session.token);
  results.api = summary;
  const summary2xx = summary.portalStatus >= 200 && summary.portalStatus < 300;
  setVerdict(
    'network-summary-2xx',
    summary2xx && summary.directStatus >= 200 && summary.directStatus < 300,
    `portal=${summary.portalStatus} direct=${summary.directStatus} total=${summary.total} slugs=${Object.keys(summary.slugMap).join(',')}`,
  );

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--window-size=1440,900'],
    defaultViewport: { width: 1440, height: 900 },
  });

  try {
    const page = await browser.newPage();
    trackNetwork(page);
    await injectSession(page, session);

    const companyUrl = `${PORTAL}/command-center/hrm/company`;
    await page.goto(companyUrl, { waitUntil: 'networkidle2', timeout: 90_000 });
    await sleep(4500);
    let frame = await resolveHrmFrame(page);
    results.ui.iframe = frame.url();

    let scrape = await scrapeTable(frame);
    if (!scrape.rows?.length) {
      await sleep(5000);
      frame = await resolveHrmFrame(page);
      scrape = await scrapeTable(frame);
    }
    results.ui.list_initial = scrape;
    const card = await scrapeCardTotal(frame);
    results.ui.card = card;
    await page.screenshot({ path: SHOT_LIST, fullPage: true });

    const rows = scrape.rows || [];
    const browserSummary2xx = results.network.summary.some((s) => s.status >= 200 && s.status < 300);

    const cardMatchesApi =
      typeof card.num === 'number' &&
      card.num === summary.total &&
      summary.total >= 0 &&
      (summary.total > 0 || card.num === 0);
    setVerdict(
      'AC-CO-EMP-01',
      rows.length > 0 && cardMatchesApi && browserSummary2xx,
      `card=${card.raw} apiTotal=${summary.total} rows=${rows.length} browserSummary2xx=${browserSummary2xx}`,
    );

    const rowChecks = [];
    let slugMismatches = 0;
    let dashWhenApiHasCount = 0;
    for (const row of rows) {
      const slug = guessSlug(row.name);
      const cell = parseCountCell(row.employee_count);
      const expected = slug != null ? summary.slugMap[slug] : undefined;
      let ok = true;
      let note = '';
      if (slug && expected !== undefined) {
        if (cell.kind === 'dash' && expected > 0) {
          ok = false;
          dashWhenApiHasCount++;
          note = 'dash but api>0';
        } else if (cell.kind === 'num' && cell.num !== expected) {
          ok = false;
          slugMismatches++;
          note = `ui=${cell.num} api=${expected}`;
        }
      }
      rowChecks.push({ name: row.name?.slice(0, 50), slug, ui: row.employee_count, expected, ok, note });
    }
    results.ui.rowChecks = rowChecks;
    const emp02Ok =
      rows.length > 0 &&
      slugMismatches === 0 &&
      dashWhenApiHasCount === 0 &&
      rowChecks.filter((r) => r.slug).length >= Math.min(3, rows.length);
    setVerdict(
      'AC-CO-EMP-02',
      emp02Ok,
      `slugMismatches=${slugMismatches} dashWhenApiHasCount=${dashWhenApiHasCount} mapped=${rowChecks.filter((r) => r.slug).length} sample=${JSON.stringify(rowChecks.slice(0, 5))}`,
    );

    const snapshotBefore = JSON.stringify(
      rows.map((r) => ({ n: r.name, e: r.employee_count })),
    );
    const cardBefore = card.num;
    await page.reload({ waitUntil: 'networkidle2', timeout: 90_000 });
    await sleep(4500);
    frame = await resolveHrmFrame(page);
    const scrapeF5 = await scrapeTable(frame);
    const cardF5 = await scrapeCardTotal(frame);
    results.ui.list_f5 = scrapeF5;
    results.ui.card_f5 = cardF5;
    await page.screenshot({ path: SHOT_F5, fullPage: true });

    const snapshotAfter = JSON.stringify(
      (scrapeF5.rows || []).map((r) => ({ n: r.name, e: r.employee_count })),
    );
    const f5Stable = snapshotBefore === snapshotAfter && cardBefore === cardF5.num;
    const summaryAfter2xx = results.network.summary.filter((s) => s.status >= 200 && s.status < 300).length >= 2;
    setVerdict(
      'AC-CO-EMP-06',
      f5Stable && summaryAfter2xx && (scrapeF5.rows || []).length > 0,
      `f5Stable=${f5Stable} cardBefore=${cardBefore} cardF5=${cardF5.num} summaryCalls2xx=${summaryAfter2xx}`,
    );

    const mustPass = ['network-summary-2xx', 'AC-CO-EMP-01', 'AC-CO-EMP-02', 'AC-CO-EMP-06'];
    const allOk = mustPass.every((k) => results.verdicts[k]?.ok);
    results.overall = allOk ? 'PASS_TO_PM' : 'FAIL_TO_PM';
    results.finishedAt = new Date().toISOString();
    save();
    console.log(`\n=== ${results.overall} stamp=${STAMP} ===\nruntime=${OUT}`);
    process.exitCode = allOk ? 0 : 1;
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e);
  results.overall = 'FAIL_TO_PM';
  results.error = String(e);
  save();
  process.exit(1);
});
