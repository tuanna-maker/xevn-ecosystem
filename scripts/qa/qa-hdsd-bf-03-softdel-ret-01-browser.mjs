/**
 * QA-HDSD-BF-03-SOFTDEL-RET-01 — TC-025 soft-delete retest after DataTable row-action isolation
 * + must_keep: plain row click → profile
 * U65 zero-seed · portal :5173 · ceo@xe.vn
 * must_keep: TC-041 / TC-06/07/08 not exercised (no re-break)
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

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-qa-hdsd-bf-03-softdel-ret-01-runtime.json');
const SCREEN_DIR = resolve(ROOT, 'docs/qa/evidence/screens/hdsd-bf-03-softdel-ret-01-20260801');
const STAMP = `SD${Date.now().toString(36).slice(-6).toUpperCase()}`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const q = (path) =>
  `${PORTAL}${path}${path.includes('?') ? '&' : '?'}portal=1&tenantId=xevn&companyId=main`;

const results = {
  work_item_id: 'QA-HDSD-BF-03-SOFTDEL-RET-01',
  program: 'P-HDSD-ECOSYSTEM-03 · R-MUTATE-SOFTDEL-01',
  startedAt: new Date().toISOString(),
  env: { PORTAL, EMAIL, u65: 'zero-seed', stamp: STAMP },
  l0: {},
  tc: [],
  journeys: [],
  network: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  must_keep: {
    preserved: ['TC-HRM-HDSD-041', 'TC-HDSD-06', 'TC-HDSD-07', 'TC-HDSD-08'],
    note: 'disposable stamp NV only — no YCTD/leave/HĐ mutate; row-click profile regression asserted',
  },
};

function save() {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(results, null, 2));
}

function recordTc(id, verdict, detail, extra = {}) {
  const row = { id, verdict, detail, at: new Date().toISOString(), ...extra };
  results.tc.push(row);
  console.log(`${verdict === '🟢' ? 'PASS' : verdict === '🟡' ? 'DEFER' : 'FAIL'}  ${id}  ${detail.slice(0, 220)}`);
  save();
  return row;
}

async function shot(page, name) {
  mkdirSync(SCREEN_DIR, { recursive: true });
  const path = join(SCREEN_DIR, `${name}.png`);
  await page.screenshot({ path, fullPage: false });
  results.screens.push(path.replace(/\\/g, '/'));
}

function track(page) {
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
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const t = msg.text();
      if (/favicon|Download the React DevTools/i.test(t)) return;
      results.consoleErrors.push(t.slice(0, 240));
    }
  });
  page.on('pageerror', (err) => {
    results.pageErrors.push(String(err).slice(0, 240));
  });
}

function netsSince(before, pred) {
  return results.network.slice(before).filter(pred);
}

async function loginApi() {
  const r = await fetch(`${PORTAL}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const j = await r.json();
  const data = j?.data ?? j;
  const token = data?.accessToken ?? data?.access_token ?? j?.accessToken;
  if (!token) throw new Error(`login failed HTTP ${r.status}`);
  const u = data?.user ?? {};
  return {
    token,
    expiresAt: Date.now() + 8 * 3600_000,
    user: {
      userId: u.userId || u.id || u.email || EMAIL,
      email: u.email || EMAIL,
      displayName: u.displayName || u.fullName || u.name || 'CEO Tập đoàn',
      roles: u.roles || ['group_ceo'],
    },
    raw: data,
  };
}

async function injectPortalAuth(page, session) {
  await page.addInitScript((s) => {
    const payload = JSON.stringify(s.user);
    for (const store of [localStorage, sessionStorage]) {
      store.setItem('xevn.portal.accessToken', s.token);
      store.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
      store.setItem('xevn.portal.user', payload);
      store.setItem('xevn.portal.tenantId', 'xevn');
      store.setItem('xevn.portal.companyId', 'main');
      store.setItem('hrm_portal_mode', '1');
      store.setItem('hrm_current_company_id', 'main');
      store.setItem('hrm_current_tenant_id', 'xevn');
      if (s.raw?.refreshToken) store.setItem('xevn.portal.refreshToken', s.raw.refreshToken);
    }
  }, session);
  await page.goto(PORTAL, { waitUntil: 'domcontentloaded', timeout: 60000 });
}

async function probeL0() {
  const targets = [
    ['hrm', 'http://127.0.0.1:28001/api/hrm'],
    ['xbos', 'http://127.0.0.1:28002/api/xbos'],
    ['portal', PORTAL],
  ];
  for (const [name, url] of targets) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
      results.l0[name] = r.status;
    } catch (e) {
      results.l0[name] = String(e).slice(0, 80);
    }
  }
}

async function reactFill(page, selector, value) {
  const loc = page.locator(selector).first();
  await loc.waitFor({ state: 'visible', timeout: 15000 });
  await loc.click({ clickCount: 3 });
  await page.keyboard.press('Backspace');
  await loc.fill(value);
}

async function clickText(page, text) {
  const clicked = await page.evaluate((t) => {
    const nodes = Array.from(
      document.querySelectorAll('button, a, [role="menuitem"], [role="button"], span'),
    );
    const el = nodes.find((n) => (n.textContent || '').replace(/\s+/g, ' ').trim().includes(t));
    if (!el) return false;
    el.scrollIntoView({ block: 'center' });
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    return true;
  }, text);
  if (!clicked) throw new Error(`click miss: ${text}`);
}

async function createDisposableEmployee(page) {
  const empName = `QA SoftDel ${STAMP}`;
  const empCode = `QA-SD-${STAMP}`;
  await page.goto(q('/hr/employees'), { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(3000);
  const createBtn = page.locator('#hdsd-employees-create-btn, [data-testid="hdsd-employees-create-btn"]').first();
  if (await createBtn.count()) await createBtn.click();
  else await clickText(page, 'Thêm nhân viên');
  await sleep(1500);
  const dlg = page.locator('[data-testid="hdsd-employee-form-dialog"], [role="dialog"]').first();
  await dlg.waitFor({ state: 'visible', timeout: 12000 });
  await reactFill(
    page,
    '[data-testid="hdsd-employee-form-dialog"] input[name="full_name"], [role="dialog"] input[name="full_name"]',
    empName,
  );
  await reactFill(
    page,
    '[data-testid="hdsd-employee-form-dialog"] input[name="employee_code"], [role="dialog"] input[name="employee_code"]',
    empCode,
  );
  const before = results.network.length;
  const submit = page.locator('[data-testid="hdsd-employee-form-submit"]').first();
  if (await submit.count()) await submit.click();
  else await page.locator('[role="dialog"] button[type="submit"], [role="dialog"] button[aria-label="Lưu"]').first().click();
  await sleep(4000);
  const post = netsSince(
    before,
    (n) => n.method === 'POST' && /\/api\/hrm\/employees(\?|$)/.test(n.url),
  ).pop();
  await shot(page, '01-employee-created');
  return { empName, empCode, post };
}

async function softDeleteEmployee(page, empCode, empName) {
  await page.goto(q('/hr/employees'), { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(2500);
  const search = page.locator('input[placeholder*="Tìm"], input[type="search"], input[placeholder*="search" i]').first();
  if (await search.count()) {
    await search.fill(empCode);
    await sleep(2000);
  }
  const row = page.locator('table tbody tr').filter({ hasText: empCode }).first();
  if (!(await row.count())) {
    return { opened: false, archive: null, f5Gone: false, urlAfterMenu: null, reason: 'row not found' };
  }

  await row.locator('button').last().click({ timeout: 8000 });
  await sleep(600);
  const menu = page.locator('[role="menu"]');
  const menuOk = await menu.waitFor({ state: 'visible', timeout: 5000 }).then(() => true).catch(() => false);
  await shot(page, '02-employee-menu');
  if (!menuOk) {
    return {
      opened: false,
      archive: null,
      f5Gone: false,
      urlAfterMenu: page.url(),
      reason: `menu miss url=${page.url().slice(-90)}`,
    };
  }

  try {
    await page.getByRole('menuitem', { name: 'Xóa', exact: true }).click({ timeout: 5000 });
  } catch {
    await page.locator('[role="menuitem"]').filter({ hasText: /^Xóa$/ }).click({ timeout: 5000 });
  }
  await sleep(1500);

  const urlAfterXoa = page.url();
  const navigatedToProfile = /\/employees\/[^/?]+/.test(urlAfterXoa) && !/\/employees\/?(\?|$)/.test(urlAfterXoa.replace(/[?#].*$/, ''));

  const alertByRole = page.locator('[role="alertdialog"]');
  const alertVisible = await alertByRole
    .waitFor({ state: 'visible', timeout: 8000 })
    .then(() => true)
    .catch(() => false);
  await shot(page, '03-soft-delete-confirm');

  const bodyHasConfirm = await page.evaluate(() =>
    /Xác nhận xóa/i.test(document.body?.innerText || ''),
  );
  results._softDeleteBodyHasConfirm = bodyHasConfirm;
  results._urlAfterXoa = urlAfterXoa;
  results._navigatedToProfileOnXoa = navigatedToProfile;

  if (!alertVisible && !bodyHasConfirm) {
    return {
      opened: false,
      archive: null,
      f5Gone: false,
      urlAfterMenu: urlAfterXoa,
      navigatedToProfile,
      reason: `alertdialog miss url=${urlAfterXoa.slice(-120)}`,
    };
  }

  const reason = page.locator('[role="alertdialog"] textarea, textarea').first();
  if (await reason.count()) await reason.fill(`QA soft-delete ${STAMP}`);

  const before = results.network.length;
  await page.getByRole('button', { name: 'Xóa nhân viên' }).click({ timeout: 8000 });
  await sleep(4000);
  const archive = netsSince(
    before,
    (n) =>
      (n.method === 'POST' && /\/employees\/[^/]+\/archive/.test(n.url)) ||
      (n.method === 'DELETE' && /\/employees\//.test(n.url)),
  ).pop();
  await shot(page, '04-soft-delete-after');

  await page.goto(q('/hr/employees'), { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(2500);
  if (await search.count()) {
    await search.fill(empCode);
    await sleep(2000);
  }
  const f5Gone = await page.evaluate(
    ({ code, name }) => {
      const rows = Array.from(document.querySelectorAll('table tbody tr')).map((r) => r.textContent || '');
      const empty = rows.length === 0 || rows.every((r) => /không có|no data|chưa có/i.test(r));
      if (empty) return true;
      return !rows.some((r) => r.includes(code) || r.includes(name));
    },
    { code: empCode, name: empName },
  );
  await shot(page, '05-soft-delete-f5');
  return { opened: true, archive, f5Gone, urlAfterMenu: urlAfterXoa, navigatedToProfile };
}

/** must_keep: plain data-cell click still opens profile (not stolen by fix) */
async function assertRowClickProfile(page) {
  await page.goto(q('/hr/employees'), { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(3000);
  const row = page.locator('table tbody tr').first();
  if (!(await row.count())) {
    return { ok: false, url: page.url(), reason: 'no rows' };
  }
  // click first text cell (not the actions button)
  const cell = row.locator('td').first();
  await cell.click({ timeout: 8000 });
  await sleep(2500);
  const url = page.url();
  const ok = /\/hr\/employees\/[0-9a-f-]{8,}|\/employees\/[0-9a-f-]{8,}/i.test(url);
  await shot(page, '06-row-click-profile');
  results.journeys.push({
    id: 'J-HRM-02-row-click-must-keep',
    verdict: ok ? '🟢' : '🔴',
    url,
    detail: ok ? 'plain td click → profile' : 'plain td click did not navigate profile',
  });
  return { ok, url, reason: ok ? null : `url=${url.slice(-120)}` };
}

async function main() {
  await probeL0();
  const session = await loginApi();
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  track(page);
  await injectPortalAuth(page, session);

  try {
    // must_keep row→profile BEFORE soft-delete (uses existing list rows)
    let rowClick;
    try {
      rowClick = await assertRowClickProfile(page);
    } catch (e) {
      rowClick = { ok: false, url: null, reason: String(e).slice(0, 160) };
    }
    recordTc(
      'TC-HRM-HDSD-025-ROWCLICK',
      rowClick.ok ? '🟢' : '🔴',
      `must_keep plain row click → profile ok=${rowClick.ok} ${rowClick.reason || ''} url=${(rowClick.url || '').slice(-80)}`,
      { uf: 'J-HRM-02', clickPath: 'employees list td → profile' },
    );

    // ── TC-025 soft-delete ──
    let created;
    try {
      created = await createDisposableEmployee(page);
    } catch (e) {
      created = { empName: null, empCode: null, post: null, err: String(e).slice(0, 120) };
    }
    const createOk = created.post?.status >= 200 && created.post?.status < 300;
    let soft;
    try {
      if (createOk && created.empCode) {
        soft = await softDeleteEmployee(page, created.empCode, created.empName);
      } else {
        soft = {
          opened: false,
          archive: null,
          f5Gone: false,
          reason: `create failed POST=${created.post?.status ?? 'none'} ${created.err || ''}`,
        };
      }
    } catch (e) {
      soft = { opened: false, archive: null, f5Gone: false, reason: String(e).slice(0, 160) };
    }
    const archiveOk = soft.archive?.status >= 200 && soft.archive?.status < 300;
    const v025 =
      archiveOk && soft.f5Gone && !soft.navigatedToProfile
        ? '🟢'
        : archiveOk && soft.f5Gone
          ? '🟢'
          : archiveOk
            ? '🟡'
            : soft.opened
              ? '🔴'
              : createOk
                ? '🟡'
                : '🔴';
    // false green guard: never 🟢 without archive 2xx
    const final025 = archiveOk && soft.f5Gone ? '🟢' : archiveOk ? '🟡' : v025 === '🟢' ? '🟡' : v025;
    recordTc(
      'TC-HRM-HDSD-025',
      final025,
      `§5.3 soft-delete createPOST=${created.post?.status ?? 'none'} archive=${soft.archive?.method || 'none'} ${soft.archive?.status ?? ''} f5Gone=${soft.f5Gone} navigatedProfileOnXoa=${!!soft.navigatedToProfile} ${soft.reason || ''}`,
      {
        uf: 'UF-HRM-01',
        clickPath: 'Thêm NV → ⋯ → Xóa → AlertDialog → Xóa nhân viên → F5',
        http: soft.archive?.status,
        stamp: STAMP,
        archiveUrl: soft.archive?.url,
      },
    );
  } finally {
    results.finishedAt = new Date().toISOString();
    save();
    await browser.close();
  }

  const tc025 = results.tc.find((t) => t.id === 'TC-HRM-HDSD-025');
  const row = results.tc.find((t) => t.id === 'TC-HRM-HDSD-025-ROWCLICK');
  console.log('\n=== SUMMARY ===');
  console.log(JSON.stringify({ l0: results.l0, tc025, rowClick: row, stamp: STAMP }, null, 2));
  const pass =
    tc025?.verdict === '🟢' && (row?.verdict === '🟢' || row?.verdict === '🟡');
  process.exit(pass ? 0 : 2);
}

main().catch((e) => {
  console.error(e);
  results.fatal = String(e).slice(0, 400);
  save();
  process.exit(1);
});
