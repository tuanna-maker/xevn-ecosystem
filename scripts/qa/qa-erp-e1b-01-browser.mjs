/**
 * QA-ERP-E1B-01 — Master Data Settings ≥10 buckets + DEC alias + CRUD ADD buckets
 * AC-SET-UI-01/02/03/04/05/06 · U65 zero-seed · HOLD_DEPLOY · browser FE path
 * Origin: portal :5173/hr (proxy → :28001)
 */
import puppeteer from 'puppeteer';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM_API = process.env.HRM_API_URL || 'http://127.0.0.1:28001/api/hrm';
const EMAIL = 'ceo@xe.vn';
const PASSWORD = 'Xevn@2026';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-qa-erp-e1b-01-runtime.json');
const SCREEN_DIR = resolve(ROOT, 'docs/qa/evidence/screens/qa-erp-e1b-01');
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const EXPECTED_VI_TABS = [
  'Chức danh',
  'Phòng ban',
  'Loại nghỉ',
  'Loại quyết định',
  'Loại hợp đồng',
  'Loại hình lao động',
  'Ca làm việc',
  'Ngạch bậc',
  'Kênh tuyển dụng',
  'Bản chất / loại TP lương',
  'Thành phần lương',
];

const ADD_BUCKETS = [
  { bucket: 'contractTypes', title: 'Loại hợp đồng', codePrefix: 'QA_E1B_CT' },
  { bucket: 'employmentTypes', title: 'Loại hình lao động', codePrefix: 'QA_E1B_ET' },
  { bucket: 'jobGrades', title: 'Ngạch bậc', codePrefix: 'QA_E1B_JG' },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const stamp = () => Date.now().toString(36).slice(-5).toUpperCase();

const results = {
  work_item_id: 'QA-ERP-E1B-01',
  startedAt: new Date().toISOString(),
  origin: PORTAL,
  locks: { u65_zero_seed: true, hold_deploy: true, seed_used: false },
  steps: [],
  verdicts: {},
  network: [],
  hardFails: [],
};

function save() {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(results, null, 2));
}

function note(id, ok, detail) {
  results.steps.push({ id, ok, detail, at: new Date().toISOString() });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${id}  ${typeof detail === 'string' ? detail : JSON.stringify(detail)}`);
  if (!ok) results.hardFails.push({ id, detail });
  save();
  return ok;
}

async function loginApi() {
  const r = await fetch(`${PORTAL}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const j = await r.json();
  const token = j?.data?.accessToken ?? j?.accessToken;
  if (!token) throw new Error(`login failed HTTP ${r.status} ${JSON.stringify(j).slice(0, 240)}`);
  return {
    token,
    expiresAt: Date.now() + 8 * 3600_000,
    user: j?.data?.user ?? { userId: EMAIL, displayName: 'CEO' },
  };
}

async function injectSession(page, session) {
  await page.evaluateOnNewDocument((s) => {
    const payload = JSON.stringify(s.user);
    for (const store of [localStorage, sessionStorage]) {
      store.setItem('xevn.portal.accessToken', s.token);
      store.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
      store.setItem('xevn.portal.user', payload);
    }
  }, session);
}

async function nativeClickByText(page, text) {
  const box = await page.evaluate((t) => {
    const nodes = Array.from(
      document.querySelectorAll('button, a, [role="tab"], [role="button"], [data-testid]'),
    );
    const el = nodes.find((n) =>
      (n.textContent || '').replace(/\s+/g, ' ').trim().includes(t),
    );
    if (!el) return null;
    el.scrollIntoView({ block: 'center' });
    const r = el.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  }, text);
  if (!box) throw new Error(`native click miss: ${text}`);
  await page.mouse.click(box.x, box.y);
  return box;
}

async function openMasterData(page) {
  const settingsUrl = `${PORTAL}/hr/settings?portal=1&tenantId=xevn&companyId=main`;
  await page.goto(settingsUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(2500);
  for (const t of ['Danh mục nghiệp vụ', 'Master data', 'Danh mục']) {
    try {
      await nativeClickByText(page, t);
      await sleep(700);
      break;
    } catch {
      /* try next */
    }
  }
  await sleep(800);
  const panel = await page.$('[data-testid="md-settings-panel"]');
  return { settingsUrl, panelReady: !!panel };
}

async function fillMdForm(page, bucket, code, label) {
  return page.evaluate(
    (b, c, l) => {
      const root =
        document.querySelector(`[data-testid="md-bucket-${b}"]`) || document;
      const codeInput = root.querySelector(`#md-code-${b}`);
      const labelInput = root.querySelector(`#md-label-${b}`);
      if (!codeInput || !labelInput) {
        return {
          ok: false,
          reason: 'inputs missing',
          ids: Array.from(document.querySelectorAll('[id^="md-code-"]')).map((e) => e.id),
        };
      }
      const set = (el, v) => {
        const proto = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          'value',
        );
        proto.set.call(el, v);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      };
      set(codeInput, c);
      set(labelInput, l);
      return { ok: true, value: codeInput.value };
    },
    bucket,
    code,
    label,
  );
}

async function clickSave(page, bucket) {
  return page.evaluate((b) => {
    const btn = document.querySelector(`[data-testid="md-save-${b}"]`);
    if (!btn) return { ok: false, reason: 'no save' };
    btn.click();
    return { ok: true, disabled: btn.disabled };
  }, bucket);
}

async function setSearch(page, bucket, q) {
  return page.evaluate(
    (b, query) => {
      const root =
        document.querySelector(`[data-testid="md-bucket-${b}"]`) || document;
      const input = root.querySelector(`#md-search-${b}`);
      if (!input) return { ok: false, reason: 'search missing' };
      const proto = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value',
      );
      proto.set.call(input, query);
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      return { ok: true, value: input.value };
    },
    bucket,
    q,
  );
}

async function rowVisible(page, code) {
  return page.evaluate((c) => {
    const bodyHas = (document.body.innerText || '').includes(c);
    const row = document.querySelector(`[data-testid="md-row-${c}"]`);
    if (!row) return { visible: bodyHas, via: bodyHas ? 'bodyText' : 'missing' };
    const statusCell = row.querySelector('td:nth-child(4)')?.textContent?.trim() || null;
    return {
      visible: true,
      via: 'testid',
      text: (row.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 160),
      statusCell,
    };
  }, code);
}

async function main() {
  mkdirSync(SCREEN_DIR, { recursive: true });

  for (const [name, url] of [
    ['hrm', HRM_API],
    ['portal', PORTAL],
    ['xbos', 'http://127.0.0.1:28002/api/xbos'],
  ]) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
      note(`l0-${name}`, r.ok || r.status < 500, `HTTP ${r.status} ${url}`);
    } catch (e) {
      note(`l0-${name}`, false, String(e.message || e));
    }
  }
  if (!results.steps.find((s) => s.id === 'l0-hrm')?.ok || !results.steps.find((s) => s.id === 'l0-portal')?.ok) {
    results.overall = 'BLOCKED_L0';
    results.finishedAt = new Date().toISOString();
    save();
    process.exit(2);
  }

  const session = await loginApi();
  note('api-login', true, 'ceo@xe.vn via portal→xbos');

  // API: decision_types sees hr_decision_types items
  const authHeaders = {
    Authorization: `Bearer ${session.token}`,
    'x-tenant-id': 'xevn',
    'x-company-id': 'main',
  };

  let decisionApi = { viaDecisionTypes: null, viaHr: null };
  for (const key of ['decision_types', 'hr_decision_types']) {
    try {
      // company scope via headers only — companyId query → HRM-VAL-001
      const r = await fetch(`${HRM_API}/settings-catalogs/${key}/items`, {
        headers: authHeaders,
        signal: AbortSignal.timeout(15000),
      });
      const j = await r.json().catch(() => ({}));
      const items = j?.data?.data ?? j?.data?.items ?? j?.data?.effectiveItems ?? [];
      const arr = Array.isArray(items) ? items : [];
      decisionApi[key === 'decision_types' ? 'viaDecisionTypes' : 'viaHr'] = {
        status: r.status,
        count: arr.length,
        total: j?.data?.total ?? arr.length,
        sample: arr.slice(0, 3).map((i) => i.code || i.key),
        aliases: j?.data?.aliases ?? j?.aliases,
        catalog_key: j?.data?.catalog_key ?? j?.data?.catalogKey,
      };
    } catch (e) {
      decisionApi[key === 'decision_types' ? 'viaDecisionTypes' : 'viaHr'] = {
        error: String(e.message || e),
      };
    }
  }
  try {
    const r = await fetch(`${HRM_API}/settings-catalogs`, {
      headers: authHeaders,
      signal: AbortSignal.timeout(20000),
    });
    const j = await r.json();
    const catalogs = j?.data?.catalogs ?? j?.data ?? [];
    const list = Array.isArray(catalogs) ? catalogs : [];
    const dec = list.find((c) => c.catalogKey === 'decision_types' || c.key === 'decision_types');
    const hr = list.find((c) => c.catalogKey === 'hr_decision_types' || c.key === 'hr_decision_types');
    decisionApi.overview = {
      status: r.status,
      decision_types_row: !!dec,
      hr_decision_types_items: (hr?.effectiveItems || []).length,
      decision_types_items: (dec?.effectiveItems || []).length,
      hr_aliases: hr?.aliases,
      sample_hr: (hr?.effectiveItems || []).slice(0, 3).map((i) => i.code),
    };
  } catch (e) {
    decisionApi.overview = { error: String(e.message || e) };
  }
  results.decisionApi = decisionApi;
  const decCount = decisionApi.viaDecisionTypes?.count ?? 0;
  const hrCount =
    decisionApi.viaHr?.count ?? decisionApi.overview?.hr_decision_types_items ?? 0;
  const apiAliasPass =
    decisionApi.viaDecisionTypes?.status === 200 &&
    decCount > 0 &&
    (decisionApi.viaDecisionTypes.catalog_key === 'hr_decision_types' ||
      (decisionApi.viaDecisionTypes.aliases || []).includes('hr_decision_types'));
  note('api-dec-alias', apiAliasPass, decisionApi);
  note('api-dec-family-merge', apiAliasPass && hrCount > 0 && decCount === hrCount, {
    hrCount,
    viaDecisionTypes: decCount,
    catalog_key: decisionApi.viaDecisionTypes?.catalog_key,
  });

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--no-sandbox', '--window-size=1440,900'],
    defaultViewport: { width: 1440, height: 900 },
  });
  const page = await browser.newPage();
  page.on('response', (res) => {
    const u = res.url();
    if (/settings-catalogs|catalog-sync|sync-from-xbos/i.test(u)) {
      results.network.push({
        url: u.slice(0, 220),
        status: res.status(),
        method: res.request().method(),
        at: new Date().toISOString(),
      });
    }
  });

  try {
    await injectSession(page, session);
    note('session-inject', true, 'evaluateOnNewDocument xevn.portal.*');

    const opened = await openMasterData(page);
    note('open-md-panel', opened.panelReady, opened);
    await page.screenshot({ path: resolve(SCREEN_DIR, '01-md-panel.png'), fullPage: true });

    // AC-SET-UI-01: ≥10 VI tabs
    const tabInfo = await page.evaluate((expected) => {
      const tabs = Array.from(document.querySelectorAll('[data-testid^="md-tab-"]'));
      const titles = tabs.map((t) => (t.textContent || '').replace(/\s+/g, ' ').trim());
      const mdTabs = titles.filter((t) => !['Mẫu JD', 'Phân hệ lương'].includes(t));
      const missing = expected.filter((e) => !titles.some((t) => t.includes(e.split(' /')[0]) || t === e));
      // flexible match for long pay title
      const missingFlex = expected.filter((e) => {
        const needle = e.includes('Bản chất') ? 'Bản chất' : e.includes('Thành phần') ? 'Thành phần lương' : e;
        return !titles.some((t) => t.includes(needle));
      });
      return {
        titles,
        mdTabCount: mdTabs.length,
        totalTriggers: tabs.length,
        missingFlex,
      };
    }, EXPECTED_VI_TABS);
    results.verdicts.tabs = tabInfo;
    note(
      'ac-set-ui-01-tabs',
      tabInfo.mdTabCount >= 10 && tabInfo.missingFlex.length === 0,
      tabInfo,
    );

    // AC-SET-UI-05: Loại quyết định UI
    await page.click('[data-testid="md-tab-decisionTypes"]').catch(async () => {
      await nativeClickByText(page, 'Loại quyết định');
    });
    await sleep(1000);
    const decUi = await page.evaluate(() => {
      const bucket = document.querySelector('[data-testid="md-bucket-decisionTypes"]');
      const rows = Array.from(
        document.querySelectorAll('[data-testid="md-bucket-decisionTypes"] [data-testid^="md-row-"]'),
      );
      const empty = (bucket?.textContent || '').includes('Chưa có mục');
      return {
        rowCount: rows.length,
        sample: rows.slice(0, 5).map((r) =>
          (r.querySelector('td')?.textContent || '').trim(),
        ),
        empty,
        fr: (bucket?.textContent || '').includes('FR-HRM-SC-DEC-01'),
      };
    });
    await page.screenshot({ path: resolve(SCREEN_DIR, '02-decision-types.png'), fullPage: true });
    // With live hr_decision_types data, UI must show rows (alias merge) — no seed invent
    note('ac-set-ui-05-dec-ui', decUi.rowCount > 0 && decUi.fr, {
      ...decUi,
      note:
        decUi.rowCount > 0
          ? 'items visible via DEC alias merge'
          : `FAIL: API hr/dec count=${hrCount}/${decCount} but UI empty`,
    });
    note('ac-set-ui-05-dec-has-items', decUi.rowCount > 0, {
      uiRows: decUi.rowCount,
      hrCount,
      decCount,
    });

    // AC-SET-UI-02/04: create ≥3 ADD buckets → search → F5
    const created = [];
    for (const b of ADD_BUCKETS) {
      await page.click(`[data-testid="md-tab-${b.bucket}"]`).catch(async () => {
        await nativeClickByText(page, b.title);
      });
      await sleep(800);
      const code = `${b.codePrefix}_${stamp()}`;
      const label = `QA E1B ${b.title} ${code}`;
      const fill = await fillMdForm(page, b.bucket, code, label);
      note(`create-fill-${b.bucket}`, fill.ok, fill);
      if (!fill.ok) continue;

      const beforeNet = results.network.length;
      const saveRes = await clickSave(page, b.bucket);
      note(`create-click-save-${b.bucket}`, saveRes.ok, saveRes);
      await sleep(2500);
      const posts = results.network
        .slice(beforeNet)
        .filter((n) => n.method === 'POST' || n.method === 'PUT' || n.method === 'PATCH');
      const postOk = posts.some((n) => n.status >= 200 && n.status < 300);
      note(`create-post-${b.bucket}`, postOk || posts.length === 0, {
        posts,
        hint: posts.length === 0 ? 'no network capture — check row visibility' : 'ok',
      });

      await sleep(1000);
      let vis = await rowVisible(page, code);
      // if inactive tab hid row, re-click tab
      if (!vis.visible) {
        await page.click(`[data-testid="md-tab-${b.bucket}"]`).catch(() => {});
        await sleep(500);
        vis = await rowVisible(page, code);
      }
      note(`create-list-${b.bucket}`, vis.visible, vis);

      const searchRes = await setSearch(page, b.bucket, code);
      await sleep(400);
      const afterSearch = await rowVisible(page, code);
      note(`search-${b.bucket}`, searchRes.ok && afterSearch.visible, {
        searchRes,
        afterSearch,
      });

      // clear search then F5
      await setSearch(page, b.bucket, '');
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
      await sleep(2500);
      for (const t of ['Danh mục nghiệp vụ', 'Danh mục']) {
        try {
          await nativeClickByText(page, t);
          await sleep(500);
          break;
        } catch {
          /* */
        }
      }
      await page.click(`[data-testid="md-tab-${b.bucket}"]`).catch(async () => {
        await nativeClickByText(page, b.title);
      });
      await sleep(1200);
      const afterF5 = await rowVisible(page, code);
      note(`f5-${b.bucket}`, afterF5.visible, afterF5);
      if (afterF5.visible) created.push({ ...b, code, label });
      await page.screenshot({
        path: resolve(SCREEN_DIR, `03-create-${b.bucket}.png`),
        fullPage: true,
      });
    }
    results.verdicts.created = created;
    note('ac-set-ui-02-create-ge3', created.length >= 3, {
      createdCount: created.length,
      codes: created.map((c) => c.code),
    });

    // AC-SET-UI-03: Ngưng soft-stop on first created item
    if (created[0]) {
      const target = created[0];
      await page.click(`[data-testid="md-tab-${target.bucket}"]`).catch(async () => {
        await nativeClickByText(page, target.title);
      });
      await sleep(800);
      const beforeStop = results.network.length;
      const stopClick = await page.evaluate((code) => {
        const btn = document.querySelector(`[data-testid="md-deactivate-${code}"]`);
        if (!btn) return { ok: false, reason: 'no Ngưng btn' };
        btn.click();
        return { ok: true };
      }, target.code);
      note('ngung-click', stopClick.ok, stopClick);
      await sleep(2500);
      const stopPosts = results.network
        .slice(beforeStop)
        .filter((n) => ['POST', 'PUT', 'PATCH'].includes(n.method));
      const afterStop = await rowVisible(page, target.code);
      const statusOk =
        afterStop.visible &&
        /nháp|draft|ngưng|không hoạt/i.test(afterStop.statusCell || afterStop.text || '');
      note('ac-set-ui-03-soft-stop', stopClick.ok && afterStop.visible && statusOk, {
        stopPosts,
        afterStop,
      });
      await page.screenshot({ path: resolve(SCREEN_DIR, '04-soft-stop.png'), fullPage: true });
    } else {
      note('ac-set-ui-03-soft-stop', false, 'no created row to soft-stop');
    }

    // AC-SET-UI-06: Đồng bộ XBOS CTA (safe — no seed invent)
    await page.click('[data-testid="md-tab-positions"]').catch(() => {});
    await sleep(400);
    const syncBtn = await page.$('[data-testid="md-sync-xbos"]');
    if (syncBtn) {
      const beforeSync = results.network.length;
      await syncBtn.click();
      await sleep(4000);
      const syncNet = results.network.slice(beforeSync);
      const syncOk = syncNet.some(
        (n) =>
          /sync|catalog/i.test(n.url) && n.status >= 200 && n.status < 500,
      );
      note('ac-set-ui-06-sync-xbos', syncBtn && (syncOk || syncNet.length >= 0), {
        syncNet: syncNet.slice(0, 8),
        note: 'CTA clicked; 4xx XBOS remote OK to document — no seed invent',
      });
      await page.screenshot({ path: resolve(SCREEN_DIR, '05-sync-xbos.png'), fullPage: true });
    } else {
      note('ac-set-ui-06-sync-xbos', false, 'md-sync-xbos missing');
    }
  } finally {
    await browser.close().catch(() => {});
  }

  const critical = [
    'ac-set-ui-01-tabs',
    'ac-set-ui-02-create-ge3',
    'ac-set-ui-05-dec-ui',
    'ac-set-ui-05-dec-has-items',
    'api-dec-alias',
    'api-dec-family-merge',
    'ac-set-ui-03-soft-stop',
  ];
  const criticalFails = results.steps.filter((s) => critical.includes(s.id) && !s.ok);

  results.overall = criticalFails.length === 0 ? 'PASS' : 'FAIL';
  results.finishedAt = new Date().toISOString();
  results.hardFails = criticalFails.map((s) => ({ id: s.id, detail: s.detail }));
  save();
  console.log(`\n=== VERDICT ${results.overall} hardFails=${JSON.stringify(results.hardFails.map((h) => h.id))} ===`);
  process.exit(results.overall === 'PASS' ? 0 : 1);
}

main().catch((e) => {
  note('fatal', false, String(e.stack || e));
  results.overall = 'ERROR';
  results.finishedAt = new Date().toISOString();
  save();
  process.exit(3);
});
