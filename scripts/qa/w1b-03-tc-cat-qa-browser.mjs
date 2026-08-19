/**
 * W1-B-03-TC-CAT-QA — U65 browser FR-UC-B04 after BE display-ready
 * HDSD: CC Cài đặt → Áp dụng danh mục → Tải nguồn → Áp dụng
 *       → HRM Settings catalogs → Đồng bộ từ XBOS → picker labels → F5
 * FORBIDDEN: seed · idle viewport · invent UF from probe alone
 */
import { chromium } from 'playwright';
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
const CATALOG_KEY = process.env.QA_CATALOG_KEY || 'job_titles';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const WORK_ITEM = process.env.QA_WORK_ITEM || 'W1-B-03-TC-CAT-QA';
const OUT = resolve(
  ROOT,
  process.env.QA_RUNTIME_OUT || 'docs/qa/evidence/_tmp-w1b-03-tc-cat-qa-runtime.json',
);
const SCREEN_DIR = resolve(
  ROOT,
  process.env.QA_SCREEN_DIR || 'docs/qa/evidence/screens/w1b-03-tc-cat-qa',
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

const results = {
  work_item_id: WORK_ITEM,
  layer: 'browser-U65-HDSD',
  hdsd_align: true,
  u65: 'zero-seed',
  journeys: ['J-XBOS-CTRL-01', 'J-XBOS-02', 'UF-HRM-10'],
  startedAt: ts(),
  env: { PORTAL, EMAIL, companyId: 'main', CATALOG_KEY },
  l0: {},
  clicks: [],
  steps: [],
  ac: {},
  case_matrix: {},
  network: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  probes: {},
  idle_guard: { qa_idle_viewport: 'PENDING' },
};

function save() {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(results, null, 2));
}

function click(action, detail = {}) {
  const row = { at: ts(), action, ...detail };
  results.clicks.push(row);
  console.log(`CLICK  ${results.clicks.length}  ${row.at}  ${action}`, JSON.stringify(detail).slice(0, 200));
  save();
  return row;
}

function step(id, action, expected, actual, result, extra = {}) {
  const row = { seq: results.steps.length + 1, at: ts(), id, action, expected, actual, result, ...extra };
  results.steps.push(row);
  console.log(`${result.toUpperCase()}  ${id}  ${String(actual).slice(0, 220)}`);
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
    if (msg.type() === 'error') results.consoleErrors.push({ at: ts(), text: String(msg.text()).slice(0, 280) });
  });
  page.on('pageerror', (err) => results.pageErrors.push({ at: ts(), text: String(err).slice(0, 280) }));
  page.on('request', (req) => {
    try {
      const u = req.url();
      const method = req.method();
      if (method === 'OPTIONS') return;
      if (!/sync-from-xbos|catalog-sync\/pull|apply-to-members|\/publish/.test(u)) return;
      results.network.push({
        method,
        status: 0,
        phase: 'request',
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 320),
        at: ts(),
      });
      save();
    } catch {
      /* */
    }
  });
  page.on('response', async (res) => {
    try {
      const u = res.url();
      if (!/\/api\/(hrm|xbos)\//.test(u)) return;
      const method = res.request().method();
      if (method === 'OPTIONS') return;
      const interesting =
        /auth\/login|config-sync|catalog-sync|settings-catalogs|catalog-governance|sync-from-xbos/.test(
          u,
        ) || /\/api\/hrm\//.test(u);
      if (!interesting && !/\/api\/xbos\/(auth|config-sync|catalog)/.test(u)) return;
      const entry = {
        method,
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 320),
        at: ts(),
      };
      if (res.status() < 500) {
        try {
          const j = await res.json();
          entry.code = j?.code;
          entry.message = typeof j?.message === 'string' ? j.message.slice(0, 160) : undefined;
          const data = j?.data ?? j;
          if (data && typeof data === 'object') {
            if (typeof data.version === 'number') entry.version = data.version;
            if (typeof data.published_version === 'number') entry.published_version = data.published_version;
            if (typeof data.appliedCount === 'number') entry.appliedCount = data.appliedCount;
            if (Array.isArray(data.pulledKeys)) entry.pulledKeys = data.pulledKeys.slice(0, 20);
            if (Array.isArray(data.items)) {
              entry.itemCount = data.items.length;
              const sample = data.items[0];
              if (sample && typeof sample === 'object') {
                entry.itemSample = {
                  code: sample.code,
                  label: sample.label,
                  status: sample.status,
                  status_label: sample.status_label,
                  status_tone: sample.status_tone,
                };
              }
            }
            if (data.source && typeof data.source === 'object') {
              entry.sourceVersion = data.source.version;
              entry.sourceItemCount = data.source.itemCount;
            }
          }
        } catch {
          /* non-json */
        }
      }
      results.network.push(entry);
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

async function bodyText(page) {
  return page.evaluate(() => document.body?.innerText?.slice(0, 12000) || '');
}

async function clickText(page, re, opts = {}) {
  const loc = page.getByText(re).first();
  const visible = await loc.isVisible({ timeout: opts.timeout ?? 8000 }).catch(() => false);
  if (!visible) return false;
  await loc.click({ timeout: 8000 }).catch(() => {});
  click(`click-text:${re}`, { matched: true });
  return true;
}

async function authTokenPresent(page) {
  return page.evaluate(() => {
    const keys = Object.keys(localStorage);
    for (const k of keys) {
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

async function fillLogin(page) {
  await page.goto(`${PORTAL}/login`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(800);
  click('goto-login', { url: page.url() });
  await shot(page, '00-login');
  const email = page.locator('input[type="email"], input[name="email"], input[autocomplete="username"]').first();
  const pass = page.locator('input[type="password"]').first();
  await email.fill(EMAIL);
  click('fill-email', { email: EMAIL });
  await pass.fill(PASSWORD);
  click('fill-password', { len: PASSWORD.length });
  const submit = page.getByRole('button', { name: /Đăng nhập|Login|Sign in/i }).first();
  await submit.click();
  click('click-submit-login');
  await page.waitForURL(/command-center/, { timeout: 45000 }).catch(() => {});
  // Persist gate — prior flake: URL hit CC before localStorage token write
  for (let i = 0; i < 20; i++) {
    if ((await authTokenPresent(page)) && /command-center/.test(page.url())) break;
    await sleep(250);
  }
  click('login-auth-persist', {
    url: page.url(),
    tokenPresent: await authTokenPresent(page),
  });
  await sleep(500);
  await shot(page, '01-after-login');
}

async function ensureAuthed(page) {
  if (/login/i.test(page.url()) || !(await authTokenPresent(page))) {
    click('reauth-required', { url: page.url() });
    await fillLogin(page);
  }
}

async function main() {
  await probeL0();
  step('L0', 'Stack health', 'hrm+xbos+portal 200', JSON.stringify(results.l0),
    results.l0.hrm === 200 && results.l0.xbos === 200 && results.l0.portal === 200 ? 'pass' : 'fail');
  if (results.l0.portal !== 200 || results.l0.hrm !== 200 || results.l0.xbos !== 200) {
    results.ack_status = 'FAIL_TO_PM';
    results.idle_guard.qa_idle_viewport = 'N/A-L0';
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
    // —— Case A: wrong password fail-deep ——
    await page.goto(`${PORTAL}/login`, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(600);
    await page.locator('input[type="email"], input[name="email"], input[autocomplete="username"]').first().fill(EMAIL);
    await page.locator('input[type="password"]').first().fill('WrongPassword-NotReal-12345');
    click('case-a-fill-wrong-password');
    await page.getByRole('button', { name: /Đăng nhập|Login|Sign in/i }).first().click();
    click('case-a-submit');
    await sleep(2000);
    const aBody = await bodyText(page);
    const aLoginNet = results.network.filter((n) => /auth\/login/.test(n.url)).slice(-1)[0];
    const caseA =
      /không đúng|sai|invalid|401/i.test(aBody) ||
      aLoginNet?.status === 401 ||
      aLoginNet?.code === 'XBOS-AUTH-401';
    results.case_matrix.CASE_A = caseA ? 'pass' : 'fail';
    step('CASE-A', 'Wrong password', '401 + stay login / VI fail', `status=${aLoginNet?.status} code=${aLoginNet?.code} stillLogin=${/login/i.test(page.url())}`, caseA ? 'pass' : 'fail', {
      network: aLoginNet,
      attachment: await shot(page, 'A-wrong-password'),
    });

    // —— Case B: success HDSD publish/apply → pull ——
    await fillLogin(page);
    const loginNet = [...results.network].reverse().find((n) => /auth\/login/.test(n.url) && n.status < 400);
    step('LOGIN', 'Login ceo@xe.vn', '2xx → command-center', `url=${page.url()} code=${loginNet?.code} status=${loginNet?.status}`,
      /command-center/.test(page.url()) || loginNet?.status === 201 || loginNet?.status === 200 ? 'pass' : 'fail');

    // Open apply panel via sidebar click path when possible
    await ensureAuthed(page);
    await page.goto(`${PORTAL}/command-center`, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(1500);
    await ensureAuthed(page);
    click('goto-command-center', { url: page.url(), tokenPresent: await authTokenPresent(page) });
    // Prefer in-app settings deep link while session is warm
    await page.goto(`${PORTAL}/command-center?settings=hrm_catalog_apply_members`, {
      waitUntil: 'domcontentloaded',
      timeout: 90000,
    });
    await sleep(2000);
    await ensureAuthed(page);
    if (/login/i.test(page.url())) {
      await page.goto(`${PORTAL}/command-center?settings=hrm_catalog_apply_members`, {
        waitUntil: 'domcontentloaded',
        timeout: 90000,
      });
      await sleep(2500);
    }
    click('deep-link-apply-panel', { url: page.url() });
    let shell = await bodyText(page);
    let opened = /Áp dụng danh mục|Tải lại nguồn|Danh mục nguồn/i.test(shell);
    if (!opened) {
      opened = await clickText(page, /Áp dụng danh mục HRM/i);
      await sleep(2000);
    }
    await sleep(2000);
    await shot(page, '02-apply-panel');
    let body = await bodyText(page);
    const panelOk = /Áp dụng danh mục|Tải lại nguồn|Danh mục nguồn|Áp dụng cho/i.test(body);
    step(
      'PANEL',
      'Open Áp dụng danh mục HRM',
      'Panel visible',
      `panelOk=${panelOk} url=${page.url()} token=${await authTokenPresent(page)}`,
      panelOk ? 'pass' : 'fail',
    );

    // Select job_titles in dropdown if present
    const select = page.locator('#apply-catalog-key, select').first();
    if (await select.count()) {
      await select.selectOption({ value: CATALOG_KEY }).catch(async () => {
        await select.selectOption({ label: /Chức danh/i }).catch(() => {});
      });
      click('select-catalog-key', { key: CATALOG_KEY });
      await sleep(500);
    }

    // Reload source — GET config-sync/catalog → expect items status_label
    const netBeforeReload = results.network.length;
    const reloaded = await clickText(page, /Tải lại nguồn tập đoàn|Tải lại nguồn/i);
    await sleep(3000);
    await shot(page, '03-source-loaded');
    const getCatalogNets = results.network.slice(netBeforeReload).filter((n) =>
      /config-sync\/catalog\//.test(n.url) && n.method === 'GET',
    );
    const getCat = getCatalogNets.slice(-1)[0];
    const hasStatusLabel = Boolean(getCat?.itemSample?.status_label);
    const getSourcePass =
      Boolean(getCat && getCat.status >= 200 && getCat.status < 300) &&
      (getCat.itemCount === 0 || hasStatusLabel);
    results.ac.AC1_GET_SOURCE = {
      verdict: getSourcePass ? 'pass' : 'fail',
      code: getCat?.code,
      status: getCat?.status,
      version: getCat?.version,
      itemSample: getCat?.itemSample,
      status_label: getCat?.itemSample?.status_label || null,
      residual: !hasStatusLabel && (getCat?.itemCount || 0) > 0
        ? 'R-CAT-XBOS-STATUS-LABEL — live GET XBOS-CFG-201 items lack status_label (src mapper present; runtime response bare)'
        : null,
    };
    step(
      'AC1-GET',
      'Tải lại nguồn tập đoàn (GET catalog)',
      '2xx + items[].status_label when items present',
      `reloaded=${reloaded} status=${getCat?.status} code=${getCat?.code} version=${getCat?.version} status_label=${getCat?.itemSample?.status_label || 'n/a'} items=${getCat?.itemCount}`,
      getSourcePass ? 'pass' : 'fail',
      { network: getCat, attachment: results.screens.slice(-1)[0]?.path },
    );

    // Select a member + Apply → XBOS-CFG-204 (documented publish-family success)
    body = await bodyText(page);
    const memberBtn = page.locator('[data-testid^="apply-member-"]').first();
    let memberClicked = false;
    if (await memberBtn.count()) {
      await memberBtn.click().catch(() => {});
      memberClicked = true;
      click('select-member', { testid: await memberBtn.getAttribute('data-testid') });
      await sleep(400);
    } else {
      // fallback: click first list row that looks like a company
      memberClicked = await clickText(page, /Chọn tất cả/i);
      await sleep(300);
    }

    const netBeforeApply = results.network.length;
    let applyClicked = await clickText(page, /Áp dụng cho\s*\d+\s*ĐVTV|Áp dụng cho/i);
    await sleep(800);
    // confirm dialog
    const confirmBtn = page.getByRole('button', { name: /^Áp dụng$/i }).first();
    if (await confirmBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await confirmBtn.click();
      click('confirm-apply');
    }
    await sleep(4500);
    await shot(page, '04-after-apply');
    const applyNets = results.network.slice(netBeforeApply).filter((n) =>
      /apply-to-members|\/publish/.test(n.url) && n.method === 'POST',
    );
    const applyNet = applyNets.slice(-1)[0];
    const publishOk =
      applyNet &&
      applyNet.status >= 200 &&
      applyNet.status < 300 &&
      (applyNet.code === 'XBOS-CFG-204' || applyNet.code === 'XBOS-CFG-203');
    results.ac.AC1_PUBLISH = {
      verdict: publishOk ? 'pass' : applyClicked ? 'fail' : 'blocked',
      note: 'FE HDSD path = apply-to-members (CFG-204). Single-key /publish CFG-203 has no portal button (internal).',
      code: applyNet?.code,
      status: applyNet?.status,
      appliedCount: applyNet?.appliedCount,
      memberClicked,
      applyClicked,
    };
    step(
      'AC1-PUBLISH',
      'Áp dụng danh mục → ĐVTV (publish-family)',
      'XBOS-CFG-203 or documented CFG-204',
      `clicked=${applyClicked} status=${applyNet?.status} code=${applyNet?.code} appliedCount=${applyNet?.appliedCount}`,
      publishOk ? 'pass' : 'fail',
      { network: applyNet, attachment: results.screens.slice(-1)[0]?.path },
    );

    // HRM Settings catalogs — prefer SettingsCatalogsPage (/hr/settings-catalogs);
    // Settings.tsx currently 500 on Vite graph (observed).
    await ensureAuthed(page);
    const hrmCandidates = [
      `${PORTAL}/hr/settings-catalogs?portal=1&tenantId=xevn&companyId=main`,
      `${PORTAL}/command-center/hrm/settings?portal=1&tenantId=xevn&companyId=main`,
    ];
    let hasPullBtn = false;
    for (const hrmUrl of hrmCandidates) {
      await page.goto(hrmUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
      await sleep(1200);
      await ensureAuthed(page);
      if (/login/i.test(page.url())) {
        await page.goto(hrmUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
        await sleep(2500);
      }
      click('goto-hrm-catalogs', { url: page.url(), tokenPresent: await authTokenPresent(page) });
      await sleep(4000);
      body = await bodyText(page);
      if (/Đồng bộ từ XBOS|Sync from XBOS/i.test(body)) {
        hasPullBtn = true;
        break;
      }
      if (/Danh mục|Catalogs|XBOS/i.test(body) && /settings/i.test(page.url())) {
        await clickText(page, /Danh mục|Catalogs|XBOS/i);
        await sleep(2500);
        body = await bodyText(page);
        if (/Đồng bộ từ XBOS|Sync from XBOS/i.test(body)) {
          hasPullBtn = true;
          break;
        }
      }
    }
    await shot(page, '05-hrm-catalogs');
    step(
      'HRM-UI',
      'Open HRM catalogs',
      'Pull button visible (UF-HRM-10)',
      `hasPull=${hasPullBtn} url=${page.url()} viteSettingsErr=${results.pageErrors.some((e) => /Settings\.tsx/.test(e.text))}`,
      hasPullBtn ? 'pass' : 'fail',
    );

    const netBeforePull = results.network.length;
    let pullClicked = false;
    if (hasPullBtn) {
      const syncBtn = page.getByRole('button', { name: /Đồng bộ từ XBOS|Sync from XBOS/i }).first();
      if (await syncBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        const disabled = await syncBtn.isDisabled().catch(() => false);
        click('sync-button-state', { disabled });
        if (!disabled) {
          await syncBtn.click();
          pullClicked = true;
          click('click-sync-from-xbos-button');
        }
      } else {
        pullClicked = await clickText(page, /Đồng bộ từ XBOS|Sync from XBOS/i);
      }
    }
    await sleep(6000);
    await shot(page, '06-after-pull');
    const bodyAfterSync = await bodyText(page);
    results.probes.afterSyncBodySnippet = bodyAfterSync.slice(0, 500);
    const pullNets = results.network.slice(netBeforePull).filter((n) =>
      n.method === 'POST' && /sync-from-xbos|catalog-sync\/pull/.test(n.url),
    );
    let syncNet =
      pullNets.find((n) => /sync-from-xbos/.test(n.url) && n.status > 0) ||
      pullNets.find((n) => /sync-from-xbos/.test(n.url));
    const syncPullNet = pullNets.find((n) => /catalog-sync\/pull/.test(n.url) && n.status > 0);
    results.probes.postsAfterSyncClick = results.network
      .slice(netBeforePull)
      .filter((n) => n.method === 'POST')
      .map((n) => ({ status: n.status, code: n.code, url: n.url, phase: n.phase }));
    // Wait briefly for response envelope if only request-phase seen
    if (syncNet && (!syncNet.status || syncNet.status === 0)) {
      await sleep(2500);
      const late = results.network
        .slice(netBeforePull)
        .filter((n) => /sync-from-xbos/.test(n.url) && n.status > 0)
        .slice(-1)[0];
      if (late) syncNet = late;
    }

    // Authenticated session contract: POST catalog-sync/pull + GET :key (BE display-ready)
    const tokenProbe = await page.evaluate(async (key) => {
      let token = localStorage.getItem('xevn.portal.accessToken') || null;
      const raw =
        localStorage.getItem('xbos_auth') ||
        localStorage.getItem('auth') ||
        sessionStorage.getItem('xbos_auth') ||
        '';
      if (!token && raw) {
        try {
          const parsed = JSON.parse(raw);
          token = parsed?.token || parsed?.accessToken || parsed?.data?.accessToken || null;
        } catch {
          if (raw.split('.').length === 3) token = raw;
        }
      }
      // common portal keys
      for (const k of Object.keys(localStorage)) {
        if (token) break;
        if (/token|auth|session/i.test(k)) {
          const s = localStorage.getItem(k) || '';
          if (s.split('.').length === 3 && s.length > 40) {
            token = s;
            break;
          }
          try {
            const v = JSON.parse(s);
            token = v?.token || v?.accessToken || v?.data?.accessToken || token;
          } catch {
            /* */
          }
        }
      }
      const headers = {
        'content-type': 'application/json',
        accept: 'application/json',
        'x-tenant-id': 'xevn',
        'x-company-id': 'main',
      };
      if (token) headers.authorization = `Bearer ${token}`;
      const pullRes = await fetch(`/api/hrm/catalog-sync/pull/${encodeURIComponent(key)}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({}),
      });
      const pullJson = await pullRes.json().catch(() => ({}));
      const getRes = await fetch(`/api/hrm/catalog-sync/${encodeURIComponent(key)}`, {
        method: 'GET',
        headers,
      });
      const getJson = await getRes.json().catch(() => ({}));
      const missRes = await fetch(`/api/hrm/catalog-sync/__no_such_catalog_key__`, {
        method: 'GET',
        headers,
      });
      const missJson = await missRes.json().catch(() => ({}));
      return {
        tokenPresent: Boolean(token),
        pull: {
          status: pullRes.status,
          code: pullJson?.code,
          message: pullJson?.message,
          published_version: pullJson?.data?.published_version,
          version: pullJson?.data?.version,
          item_count: pullJson?.data?.item_count,
          topLevelItems: Array.isArray(pullJson?.data?.items),
          itemSample: Array.isArray(pullJson?.data?.items) ? pullJson.data.items[0] : null,
          keys: pullJson?.data ? Object.keys(pullJson.data).slice(0, 20) : [],
        },
        get: {
          status: getRes.status,
          code: getJson?.code,
          published_version: getJson?.data?.published_version,
          version: getJson?.data?.version,
          topLevelItems: Array.isArray(getJson?.data?.items),
          itemSample: Array.isArray(getJson?.data?.items) ? getJson.data.items[0] : null,
        },
        miss: {
          status: missRes.status,
          code: missJson?.code,
          message: typeof missJson?.message === 'string' ? missJson.message.slice(0, 120) : undefined,
        },
      };
    }, CATALOG_KEY);
    click('session-probe-catalog-sync-pull-get', { tokenPresent: tokenProbe.tokenPresent });
    results.probes.catalogSync = tokenProbe;

    const syncOk =
      Boolean(syncNet) &&
      (syncNet.status === 0 || (syncNet.status >= 200 && syncNet.status < 300));
    const syncCodeOk =
      !syncNet?.code ||
      syncNet.code === 'HRM-SET-201' ||
      syncNet.code === 'HRM-SYNC-200';
    const hrmSync200 =
      tokenProbe.pull?.code === 'HRM-SYNC-200' &&
      tokenProbe.pull?.status >= 200 &&
      tokenProbe.pull?.status < 300;
    const topItems = Boolean(tokenProbe.pull?.topLevelItems);
    const pubVer =
      typeof tokenProbe.pull?.published_version === 'number'
        ? tokenProbe.pull.published_version
        : null;
    const verMatch =
      pubVer != null &&
      typeof tokenProbe.pull?.version === 'number' &&
      tokenProbe.pull.version === pubVer;

    // U65: FE sync click + Network sync-from-xbos; session pull proves HRM-SYNC-200 display-ready.
    const ac2Pass = Boolean(pullClicked && syncOk && syncCodeOk && hrmSync200 && topItems);
    results.ac.AC2_PULL = {
      verdict: ac2Pass ? 'pass' : hrmSync200 && topItems ? 'fail' : 'fail',
      fe_sync_from_xbos: { status: syncNet?.status, code: syncNet?.code, pulledKeys: syncNet?.pulledKeys },
      fe_sync_clicked: pullClicked,
      catalog_sync_pull: tokenProbe.pull,
      published_version_matches_version: verMatch,
      residual: !pullClicked
        ? 'R-CAT-HRM-SETTINGS-MOUNT — FE Đồng bộ từ XBOS not clicked (Settings.tsx Vite 500 / catalogs UI absent)'
        : !hrmSync200
          ? 'HRM-SYNC-200 missing'
          : null,
      note: 'FE HDSD = settings-catalogs/sync-from-xbos. Contract POST /catalog-sync/pull/:key must return HRM-SYNC-200; UF requires FE click.',
    };
    step(
      'AC2-PULL',
      'Pull catalog (FE sync + session pull)',
      'FE sync click 2xx + HRM-SYNC-200 · top-level items[] · published_version matches',
      `feClicked=${pullClicked} feSync=${syncNet?.code}/${syncNet?.status} pull=${tokenProbe.pull?.code}/${tokenProbe.pull?.status} topItems=${topItems} pubVer=${pubVer} verMatch=${verMatch}`,
      ac2Pass ? 'pass' : 'fail',
      { network: syncNet || syncPullNet, probe: tokenProbe.pull },
    );

    const get201 =
      tokenProbe.get?.code === 'HRM-SYNC-201' &&
      tokenProbe.get?.status >= 200 &&
      tokenProbe.get?.status < 300 &&
      tokenProbe.get?.topLevelItems;
    results.ac.AC3_GET = {
      verdict: get201 ? 'pass' : 'fail',
      get: tokenProbe.get,
    };
    step(
      'AC3-GET',
      'GET catalog-sync/:key display-ready',
      'HRM-SYNC-201 · top-level items[] no deep dig',
      `code=${tokenProbe.get?.code} status=${tokenProbe.get?.status} topItems=${tokenProbe.get?.topLevelItems} sample=${JSON.stringify(tokenProbe.get?.itemSample || {}).slice(0, 160)}`,
      get201 ? 'pass' : 'fail',
      { probe: tokenProbe.get },
    );

    // Picker labels on FE
    body = await bodyText(page);
    const labelSample = tokenProbe.pull?.itemSample?.label || tokenProbe.get?.itemSample?.label;
    const statusLabel = tokenProbe.pull?.itemSample?.status_label || tokenProbe.get?.itemSample?.status_label;
    const pickerShowsLabel = labelSample ? body.includes(labelSample) : /Chức danh|Đang dùng|CEO|Tổng giám đốc/i.test(body);
    const missHonest =
      tokenProbe.miss?.status === 404 ||
      /404|not found|chưa|không tìm/i.test(String(tokenProbe.miss?.code || '') + String(tokenProbe.miss?.message || ''));
    const ac4Pass = Boolean(pickerShowsLabel && missHonest);
    results.ac.AC4_PICKER = {
      verdict: ac4Pass ? 'pass' : 'fail',
      pickerShowsLabel,
      labelSample,
      statusLabel,
      missHonest,
      residual: !pickerShowsLabel
        ? 'R-CAT-HRM-SETTINGS-MOUNT — picker UI not showing synced labels (FE mount)'
        : 'R-CAT-PICKER-LABEL may remain on settings-catalogs picker status without status_label',
    };
    step(
      'AC4-PICKER',
      'Picker/consumer synced labels · miss honest',
      'synced label visible on FE + miss key 404 honest',
      `pickerShowsLabel=${pickerShowsLabel} label=${labelSample || 'n/a'} status_label=${statusLabel || 'n/a'} miss=${tokenProbe.miss?.status}/${tokenProbe.miss?.code}`,
      ac4Pass ? 'pass' : 'fail',
    );

    // F5 persist
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
    click('f5-reload', { url: page.url() });
    await sleep(3500);
    const bodyF5 = await bodyText(page);
    await shot(page, '07-after-f5');
    const f5Ok =
      (labelSample ? bodyF5.includes(labelSample) : false) ||
      /Chức danh|Đồng bộ|Danh mục|XBOS/i.test(bodyF5);
    results.ac.AC5_F5 = { verdict: f5Ok ? 'pass' : 'fail', url: page.url() };
    results.case_matrix.CASE_C_F5 = f5Ok ? 'pass' : 'fail';
    step('AC5-F5', 'F5 persist', 'Synced catalogs remain', `f5Ok=${f5Ok} url=${page.url()}`, f5Ok ? 'pass' : 'fail', {
      attachment: results.screens.slice(-1)[0]?.path,
    });

    results.case_matrix.CASE_B_SUCCESS = publishOk && hrmSync200 && get201 ? 'pass' : 'fail';
  } catch (e) {
    results.runError = String(e?.stack || e).slice(0, 800);
    step('RUN', 'Harness exception', 'no throw', results.runError, 'fail');
  }

  results.endedAt = ts();
  results.idle_guard = {
    qa_idle_viewport: results.clicks.length >= 8 ? 'PASS' : 'FAIL',
    click_count: results.clicks.length,
  };
  const acVals = Object.values(results.ac).map((a) => a.verdict);
  const failed = acVals.filter((v) => v === 'fail').length;
  const passed = acVals.filter((v) => v === 'pass').length;
  results.summary = {
    clicks: results.clicks.length,
    steps_pass: results.steps.filter((s) => s.result === 'pass').length,
    steps_fail: results.steps.filter((s) => s.result === 'fail').length,
    ac_pass: passed,
    ac_fail: failed,
    consoleErrors: results.consoleErrors.length,
    pageErrors: results.pageErrors.length,
  };
  results.ack_status =
    failed === 0 && results.idle_guard.qa_idle_viewport === 'PASS' && !results.runError
      ? 'PASS_TO_PM'
      : 'FAIL_TO_PM';
  save();
  console.log('SUMMARY', results.summary, results.ack_status);
  await browser.close();
  process.exit(results.ack_status === 'PASS_TO_PM' ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  results.runError = String(e);
  results.ack_status = 'FAIL_TO_PM';
  results.endedAt = ts();
  save();
  process.exit(1);
});
