/**
 * QA-ERP-E1B-ALIAS-KEYS-01 — DEC alias L1 + browser AC-SET-UI-05 / AC-SC-DEC-ALIAS-*
 * U65 zero-seed · HOLD_DEPLOY · no mutate except optional XBOS pull probe
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
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-qa-erp-e1b-alias-keys-01-runtime.json');
const SCREEN_DIR = resolve(ROOT, 'docs/qa/evidence/screens/qa-erp-e1b-alias-keys-01');
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const results = {
  work_item_id: 'QA-ERP-E1B-ALIAS-KEYS-01',
  dev_handoff: 'docs/qa/evidence/d-be-erp-e1b-alias-keys-01-20260728.md',
  startedAt: new Date().toISOString(),
  locks: { u65_zero_seed: true, hold_deploy: true, seed_used: false },
  steps: [],
  hardFails: [],
  network: [],
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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
    signal: AbortSignal.timeout(20000),
  });
  const j = await r.json();
  const token = j?.data?.accessToken ?? j?.accessToken ?? j?.data?.token;
  if (!token) throw new Error(`login failed ${r.status} ${JSON.stringify(j).slice(0, 200)}`);
  return {
    token,
    status: r.status,
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

async function main() {
  for (const [name, url] of [
    ['hrm', `${HRM_API}`],
    ['xbos', 'http://127.0.0.1:28002/api/xbos'],
    ['portal', PORTAL],
  ]) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
      note(`l0-${name}`, r.ok || r.status < 500, `HTTP ${r.status}`);
    } catch (e) {
      note(`l0-${name}`, false, String(e.message || e));
    }
  }

  const session = await loginApi();
  note('api-login', session.status === 201 || session.status === 200, `HTTP ${session.status}`);

  const authHeaders = {
    Authorization: `Bearer ${session.token}`,
    'x-tenant-id': 'xevn',
    'x-company-id': 'main',
  };

  let decisionApi = {};
  for (const key of ['decision_types', 'hr_decision_types']) {
    const r = await fetch(`${HRM_API}/settings-catalogs/${key}/items`, {
      headers: authHeaders,
      signal: AbortSignal.timeout(15000),
    });
    const j = await r.json().catch(() => ({}));
    const items = j?.data?.data ?? j?.data?.items ?? j?.data?.effectiveItems ?? [];
    const arr = Array.isArray(items) ? items : [];
    decisionApi[key] = {
      status: r.status,
      count: arr.length,
      catalog_key: j?.data?.catalog_key ?? j?.data?.catalogKey,
      aliases: j?.data?.aliases,
      sample: arr.slice(0, 3).map((i) => i.code || i.key),
    };
  }
  results.decisionApi = decisionApi;

  const dec = decisionApi.decision_types;
  const hr = decisionApi.hr_decision_types;
  const aliasMergePass =
    dec?.status === 200 &&
    hr?.status === 200 &&
    dec.count > 0 &&
    dec.count === hr.count &&
    (dec.catalog_key === 'hr_decision_types' ||
      (dec.aliases || []).includes('hr_decision_types'));
  note('l1-ac-sc-dec-alias-get', aliasMergePass, { dec, hr });

  for (const key of ['job_titles', 'leave_types']) {
    const r = await fetch(`${HRM_API}/settings-catalogs/${key}/items`, {
      headers: authHeaders,
      signal: AbortSignal.timeout(15000),
    });
    const j = await r.json().catch(() => ({}));
    const items = j?.data?.data ?? j?.data?.items ?? [];
    const arr = Array.isArray(items) ? items : [];
    note(`l1-regression-${key}`, r.status === 200 && arr.length >= 0, {
      status: r.status,
      count: arr.length,
    });
  }

  let pullProbe = null;
  try {
    const r = await fetch(`${HRM_API}/catalog-sync/pull/decision_types`, {
      method: 'POST',
      headers: authHeaders,
      signal: AbortSignal.timeout(30000),
    });
    const j = await r.json().catch(() => ({}));
    pullProbe = {
      status: r.status,
      code: j?.code ?? j?.data?.code,
      resolvedFrom: j?.data?.resolvedFrom ?? j?.data?.data?.resolvedFrom,
      storageKey: j?.data?.catalogKey ?? j?.data?.storageKey ?? j?.data?.key,
    };
    results.pullProbe = pullProbe;
    const pullOk =
      r.status === 200 || r.status === 201 || (r.status === 404 && j?.code === 'HRM-SYNC-002');
    note(
      'l1-pull-decision_types-resolve',
      pullOk,
      pullProbe,
    );
  } catch (e) {
    note('l1-pull-decision_types-resolve', false, String(e.message || e));
  }

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--no-sandbox', '--window-size=1440,900'],
    defaultViewport: { width: 1440, height: 900 },
  });
  const page = await browser.newPage();
  page.on('response', (res) => {
    const u = res.url();
    if (/settings-catalogs|decision_types|hr_decision_types/i.test(u)) {
      results.network.push({
        url: u.slice(0, 240),
        status: res.status(),
        method: res.request().method(),
      });
    }
  });

  await injectSession(page, session);
  const opened = await openMasterData(page);
  note('open-md-panel', opened.panelReady, opened);
  await page.click('[data-testid="md-tab-decisionTypes"]').catch(() =>
    nativeClickByText(page, 'Loại quyết định'),
  );
  await sleep(1200);
  mkdirSync(SCREEN_DIR, { recursive: true });
  await page.screenshot({ path: resolve(SCREEN_DIR, '01-decision-types-alias.png'), fullPage: true });

  const decUi = await page.evaluate(() => {
    const bucket = document.querySelector('[data-testid="md-bucket-decisionTypes"]');
    const rows = Array.from(
      document.querySelectorAll('[data-testid="md-bucket-decisionTypes"] [data-testid^="md-row-"]'),
    );
    return {
      rowCount: rows.length,
      sample: rows.slice(0, 3).map((r) => (r.querySelector('td')?.textContent || '').trim()),
      fr: (bucket?.textContent || '').includes('FR-HRM-SC-DEC-01'),
    };
  });
  note('ac-set-ui-05-dec-settings', decUi.rowCount > 0 && decUi.fr, decUi);

  await injectSession(page, session);
  await page.goto(`${PORTAL}/hr/decisions?portal=1&tenantId=xevn&companyId=main`, {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });
  await sleep(2000);
  for (const t of ['Thêm quyết định', 'Thêm mới', 'Tạo quyết định']) {
    try {
      await nativeClickByText(page, t);
      break;
    } catch {
      /* next */
    }
  }
  await sleep(1200);
  let pickerProbe = { dialogOpen: false, pickerOptions: [] };
  try {
    const dialog = await page.$('[role="dialog"]');
    pickerProbe.dialogOpen = !!dialog;
    const combo = await page.$('[role="dialog"] [role="combobox"]');
    if (combo) {
      await combo.click();
      await sleep(800);
      pickerProbe = await page.evaluate(() => {
        const opts = [...document.querySelectorAll('[role="option"], [cmdk-item]')].map((n) =>
          (n.textContent || '').trim(),
        );
        const hasHrd = opts.some((o) => /HRD_01|Bổ nhiệm/i.test(o));
        return {
          dialogOpen: !!document.querySelector('[role="dialog"]'),
          pickerOptions: opts.slice(0, 12),
          hasHrdOption: hasHrd,
        };
      });
    }
  } catch (e) {
    pickerProbe.error = String(e.message || e);
  }
  await page.screenshot({ path: resolve(SCREEN_DIR, '02-decisions-picker.png'), fullPage: true });
  note(
    'ac-sc-dec-alias-02-decisions-picker',
    pickerProbe.dialogOpen && pickerProbe.hasHrdOption === true,
    pickerProbe,
  );

  await browser.close();

  results.finishedAt = new Date().toISOString();
  results.overall = results.hardFails.length === 0 ? 'PASS' : 'FAIL';
  save();
  console.log(`\n=== VERDICT ${results.overall} hardFails=${JSON.stringify(results.hardFails.map((h) => h.id))} ===`);
  process.exit(results.hardFails.length ? 1 : 0);
}

main().catch((e) => {
  note('fatal', false, String(e.stack || e));
  process.exit(2);
});
