/**
 * QA-HRM-CO-01-INDUSTRY-01 — UC-HRM-CO-01 industry + headcount regression
 * AC-CO-IND-01..04 · AC-CO-IND-06 F5 · AC-CO-EMP card/column regression
 * U65 zero-seed · ceo@xe.vn · Portal :5173 embed Công ty · J-HRM-CO-01
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
  `COINDQA1-${Date.now().toString(36).toUpperCase().slice(-8)}`;

const __dir = dirname(fileURLToPath(import.meta.url));
const EVIDENCE = resolve(__dir, '../../docs/qa/evidence');
const OUT = resolve(EVIDENCE, '_tmp-qa-hrm-co-01-industry-01-runtime.json');
const SHOT_LIST = resolve(EVIDENCE, '_tmp-qa-hrm-co-01-industry-01-list.png');
const SHOT_DETAIL = resolve(EVIDENCE, '_tmp-qa-hrm-co-01-industry-01-detail.png');
const SHOT_F5 = resolve(EVIDENCE, '_tmp-qa-hrm-co-01-industry-01-f5.png');

const FORBIDDEN_RAW = new Set(['subsidiary', 'holding', 'parent', 'member', 'branch']);
const RAW_CATALOG_KEYS = new Set([
  'tourism',
  'logistics',
  'finance',
  'services',
  'transport',
  'trsport',
]);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const results = {
  work_item_id: 'QA-HRM-CO-01-INDUSTRY-01',
  stamp: STAMP,
  startedAt: new Date().toISOString(),
  env: { PORTAL, HRM_API, XBOS_API, EMAIL, seed: false },
  network: { groupMemberUnits: [], legalEntities: [], summary: [] },
  verdicts: {},
  ui: {},
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
  page.on('response', async (res) => {
    const url = res.url();
    const status = res.status();
    if (url.includes('group-member-units')) {
      let hasBusinessLines = false;
      try {
        const body = await res.json();
        const members = body?.data?.members || body?.data?.items || body?.members || [];
        const list = Array.isArray(members) ? members : [];
        hasBusinessLines = list.some(
          (m) => m?.business_lines != null && String(m.business_lines).trim() !== '',
        );
      } catch {
        /* ignore */
      }
      results.network.groupMemberUnits.push({ url: url.slice(0, 200), status, hasBusinessLines });
      save();
    }
    if (url.includes('/legal-entities') || url.includes('legal-entities')) {
      results.network.legalEntities.push({ url: url.slice(0, 200), status });
      save();
    }
    if (url.includes('/api/hrm/employees/summary')) {
      results.network.summary.push({ url: url.slice(0, 200), status });
      save();
    }
  });
}

async function resolveHrmFrame(page) {
  for (let i = 0; i < 24; i++) {
    for (const f of page.frames()) {
      const u = f.url() || '';
      if (!(u.includes('/hr/') || u.includes('/hrm/') || u.includes('company'))) continue;
      try {
        await f.waitForSelector('table', { timeout: 2000 });
        const ok = await f.evaluate(
          () =>
            document.body?.innerText?.includes('Ngành nghề') ||
            document.body?.innerText?.includes('Số nhân viên') ||
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
      const indIdx = headers.findIndex(
        (h) => h.includes('Ngành nghề') || /industry/i.test(h) || /ngành/i.test(h),
      );
      const empIdx = headers.findIndex(
        (h) => h.includes('Số nhân viên') || /employee/i.test(h),
      );
      const nameIdx = headers.findIndex(
        (h) => h.includes('Tên') || h.includes('Công ty') || h.includes('Đơn vị'),
      );
      const rows = [];
      for (const tr of Array.from(table.querySelectorAll('tbody tr'))) {
        const cells = Array.from(tr.querySelectorAll('td'));
        if (!cells.length) continue;
        rows.push({
          name: nameIdx >= 0 ? text(cells[nameIdx]) : text(cells[1] || cells[0]),
          industry: indIdx >= 0 ? text(cells[indIdx]) : text(cells[3] || ''),
          employee_count: empIdx >= 0 ? text(cells[empIdx]) : '',
        });
      }
      return { headers, indIdx, empIdx, rows, href: location.href };
    }
    return { headers: [], rows: [], href: location.href, body: text(document.body).slice(0, 400) };
  });
}

async function scrapeCardTotal(frame) {
  return frame.evaluate(() => {
    const text = (el) => (el?.textContent || '').replace(/\s+/g, ' ').trim();
    const body = text(document.body);
    const m = body.match(/([0-9]{2,6})\s*Tổng nhân viên/);
    if (m) return { raw: m[1], num: Number(m[1].replace(/[.\s]/g, '')) };
    const all = Array.from(document.querySelectorAll('p, span, div'));
    for (let i = 0; i < all.length; i++) {
      if (text(all[i]) !== 'Tổng nhân viên') continue;
      const parent = all[i].parentElement;
      if (parent) {
        for (const child of Array.from(parent.children)) {
          const u = text(child);
          if (/^[0-9]{1,3}(?:[.\s]?[0-9]{3})*$/.test(u)) {
            return { raw: u, num: Number(u.replace(/[.\s]/g, '')) };
          }
        }
      }
    }
    return { raw: null, num: null };
  });
}

async function openFirstRowDetail(page, frame) {
  const box = await frame.evaluate(() => {
    const tr = document.querySelector('table tbody tr');
    if (!tr) return null;
    const cells = Array.from(tr.querySelectorAll('td'));
    const btn = cells[cells.length - 1]?.querySelector('button');
    if (!btn) return null;
    btn.scrollIntoView({ block: 'center' });
    const r = btn.getBoundingClientRect();
    const name = (cells[1]?.textContent || cells[0]?.textContent || '').replace(/\s+/g, ' ').trim();
    const industry =
      cells.length >= 4 ? (cells[3]?.textContent || '').replace(/\s+/g, ' ').trim() : '';
    return { x: r.x + r.width / 2, y: r.y + r.height / 2, name, listIndustry: industry };
  });
  if (!box) return { ok: false, reason: 'no row action' };

  const iframeBox = await page.evaluate(() => {
    const iframe = document.querySelector('iframe');
    if (!iframe) return { left: 0, top: 0 };
    const r = iframe.getBoundingClientRect();
    return { left: r.left, top: r.top };
  });
  await page.mouse.click(iframeBox.left + box.x, iframeBox.top + box.y);
  await sleep(900);

  async function pickView(ctx) {
    return ctx.evaluate(() => {
      const items = Array.from(
        document.querySelectorAll('[role="menuitem"], [data-radix-collection-item]'),
      );
      const view = items.find((el) =>
        /xem chi tiết|view detail|viewDetail/i.test((el.textContent || '').trim()),
      );
      if (!view) return { ok: false, texts: items.map((i) => (i.textContent || '').trim()).slice(0, 8) };
      view.click();
      return { ok: true };
    });
  }
  let pick = await pickView(frame);
  if (!pick.ok) pick = await pickView(page);
  await sleep(1200);

  const detail = await frame.evaluate(() => {
    const text = (el) => (el?.textContent || '').replace(/\s+/g, ' ').trim();
    const body = text(document.body);
    const badges = Array.from(document.querySelectorAll('[class*="badge"], span, div'))
      .map((el) => text(el))
      .filter((t) => t && t.length < 80);
    const dialog = document.querySelector('[role="dialog"]');
    const dialogText = dialog ? text(dialog) : body.slice(0, 1200);
    return { dialogText, badges: badges.slice(0, 30) };
  });

  return {
    ok: pick.ok,
    listIndustry: box.listIndustry,
    companyName: box.name,
    detail,
  };
}

function industryCellOk(value) {
  const v = String(value || '').trim();
  if (!v || v === '—' || v === '-') return { kind: 'empty', ok: true };
  const lower = v.toLowerCase();
  if (FORBIDDEN_RAW.has(lower)) return { kind: 'forbidden', ok: false };
  if (RAW_CATALOG_KEYS.has(lower)) return { kind: 'raw_key', ok: false };
  if (/^[a-z_]+$/.test(lower) && lower.length < 24) return { kind: 'raw_ascii', ok: false };
  return { kind: 'vi_label', ok: true };
}

async function main() {
  const session = await loginApi();
  setVerdict('login', true, 'xbos auth token ok');

  const summaryR = await fetch(`${HRM_API}/api/hrm/employees/summary?company_id=main`, {
    headers: {
      Authorization: `Bearer ${session.token}`,
      'x-tenant-id': 'xevn',
    },
  });
  const summaryJ = await summaryR.json();
  const apiTotal = Number(summaryJ?.data?.total ?? summaryJ?.total ?? 0);
  results.ui.apiSummaryTotal = apiTotal;

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
    await page.screenshot({ path: SHOT_LIST, fullPage: true });

    const rows = scrape.rows || [];
    const badRaw = rows.filter((r) => {
      const check = industryCellOk(r.industry);
      return !check.ok;
    });
    const hasViOrDash = rows.some((r) => {
      const c = industryCellOk(r.industry);
      return c.kind === 'vi_label' || c.kind === 'empty';
    });
    const holdingRow = rows.find((r) => /tập đoàn|holding|xe\.vn/i.test(r.name || ''));
    const holdingIndustry = holdingRow?.industry ?? null;

    setVerdict(
      'AC-CO-IND-01',
      rows.length > 0 && hasViOrDash && badRaw.length === 0,
      `rows=${rows.length} hasLabelOrDash=${hasViOrDash} bad=${badRaw.length} sample=${JSON.stringify(rows.slice(0, 5).map((r) => ({ n: r.name?.slice(0, 40), i: r.industry })))}`,
    );

    setVerdict(
      'AC-CO-IND-02',
      badRaw.length === 0 && rows.length > 0,
      `forbidden/raw hits=${badRaw.length} ${JSON.stringify(badRaw.slice(0, 3))}`,
    );

    setVerdict(
      'AC-CO-IND-03',
      rows.length > 0 &&
        (holdingIndustry === '—' ||
          holdingIndustry === '-' ||
          holdingIndustry === '' ||
          industryCellOk(holdingIndustry).kind === 'empty' ||
          industryCellOk(holdingIndustry).kind === 'vi_label'),
      `holdingRow=${holdingRow?.name?.slice(0, 50) || 'n/a'} industry=${holdingIndustry}`,
    );

    const card = await scrapeCardTotal(frame);
    results.ui.card = card;
    const empNums = rows
      .map((r) => {
        const raw = r.employee_count;
        if (raw === '—' || !raw) return null;
        const n = Number(String(raw).replace(/[.\s,]/g, ''));
        return Number.isFinite(n) ? n : null;
      })
      .filter((n) => n != null);
    const rowSum = empNums.reduce((a, b) => a + b, 0);
    const cardNum = card.num ?? (rowSum > 0 ? rowSum : null);
    const empRegOk =
      (typeof cardNum === 'number' && cardNum > 0) ||
      (empNums.some((n) => n > 0) && apiTotal > 0);
    setVerdict(
      'AC-CO-EMP-regression',
      empRegOk,
      `card=${card.raw} cardNum=${cardNum} rowSum=${rowSum} apiTotal=${apiTotal} empCols=${empNums.length}`,
    );

    const detailOpen = await openFirstRowDetail(page, frame);
    results.ui.detail = detailOpen;
    await page.screenshot({ path: SHOT_DETAIL, fullPage: true });

    let ind04 = false;
    if (detailOpen.ok && detailOpen.listIndustry) {
      const dt = detailOpen.detail?.dialogText || '';
      const listInd = detailOpen.listIndustry;
      ind04 =
        listInd === '—'
          ? dt.includes('—') || !/subsidiary|holding/i.test(dt)
          : dt.includes(listInd);
    } else if (detailOpen.ok) {
      ind04 = true;
    }
    setVerdict(
      'AC-CO-IND-04',
      ind04,
      `detailOk=${detailOpen.ok} listIndustry=${detailOpen.listIndustry} dialogSnippet=${(detailOpen.detail?.dialogText || '').slice(0, 200)}`,
    );

    const snapshotBeforeF5 = JSON.stringify(
      rows.map((r) => ({ n: r.name, i: r.industry, e: r.employee_count })),
    );
    await page.reload({ waitUntil: 'networkidle2', timeout: 90_000 });
    await sleep(4500);
    frame = await resolveHrmFrame(page);
    const scrapeF5 = await scrapeTable(frame);
    results.ui.list_f5 = scrapeF5;
    await page.screenshot({ path: SHOT_F5, fullPage: true });

    const snapshotAfterF5 = JSON.stringify(
      (scrapeF5.rows || []).map((r) => ({ n: r.name, i: r.industry, e: r.employee_count })),
    );
    const gmu2xx = results.network.groupMemberUnits.some((c) => c.status >= 200 && c.status < 300);
    const legal2xx = results.network.legalEntities.some((c) => c.status >= 200 && c.status < 300);
    const f5IndustryStable = snapshotBeforeF5 === snapshotAfterF5;
    setVerdict(
      'AC-CO-IND-06',
      f5IndustryStable && (gmu2xx || legal2xx) && (scrapeF5.rows || []).length > 0,
      `f5Stable=${f5IndustryStable} gmu2xx=${gmu2xx} legal2xx=${legal2xx} rowsF5=${scrapeF5.rows?.length}`,
    );

    const mustPass = [
      'AC-CO-IND-01',
      'AC-CO-IND-02',
      'AC-CO-IND-03',
      'AC-CO-IND-04',
      'AC-CO-IND-06',
      'AC-CO-EMP-regression',
    ];
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
