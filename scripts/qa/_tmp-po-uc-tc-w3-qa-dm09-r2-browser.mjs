#!/usr/bin/env node
/**
 * PO-UC-TC-W3-QA-DM09-R2 — Browser U65 retest XBOS-DM-09 after FE CloneCatalogPanel wire
 * HDSD: CC → Cài đặt → Sao chép bộ danh mục → POST …/catalog/{key}/clone
 * FORBIDDEN: seed · claim apply-to-members as DM-09 · invent Leave L2 · apps/**
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const MEMBER_EMAIL = process.env.QA_MEMBER_EMAIL || 'du-lich.ceo@xe.vn';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const CATALOG_TRY = [
  'recruitment_channels',
  'job_grades',
  'departments',
  'employment_types',
  'pay_types',
  'shifts',
  'decision_types',
  'contract_types',
  'leave_types',
  'job_titles',
];

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-uc-tc-w3-qa-dm09-r2-browser.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-uc-tc-w3-qa-dm09-r2');
mkdirSync(SCREEN, { recursive: true });

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

const results = {
  work_item_id: 'PO-UC-TC-W3-QA-DM09-R2',
  uc_id: 'XBOS-DM-09',
  startedAt: ts(),
  u65: 'zero-seed',
  hdsd_align: true,
  env: { PORTAL, XBOS, EMAIL, MEMBER_EMAIL, commit: COMMIT },
  hdsd_inventory: [
    'Login ceo@xe.vn',
    'Command Center → Cài đặt → Sao chép bộ danh mục',
    'Chọn bộ danh mục + ĐVTV đích → Sao chép bộ danh mục',
    'Confirm dialog → Sao chép',
    'Network POST …/catalog/{key}/clone',
    'FE toast/result CFG-206 + dest verify / F5',
    'FD: retry same → CFG-409',
    'AU: du-lich.ceo menu hidden or panel forbidden',
  ],
  steps: {},
  click_log: [],
  network: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  hp: { catalogKey: null, destId: null, http: null, code: null },
  fd: { http: null, code: null, uiText: null },
  au: { menuVisible: null, deepLinkBlocked: null },
  must_keep: { applyPanelNotUsed: true, leaveL2Untouched: true },
  residuals: [],
  endedAt: null,
  overall: null,
};

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(results, null, 2));
}
function log(msg, extra = {}) {
  const row = { at: ts(), msg, ...extra };
  results.click_log.push(row);
  console.error(`[${results.click_log.length}] ${msg}`, extra.note || extra.url || '');
  return row;
}
function recordStep(id, verdict, detail = {}) {
  results.steps[id] = { ...detail, verdict, at: ts() };
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 320)}`);
  save();
}

async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  results.screens.push(path.replace(/\\/g, '/'));
  return path;
}

async function loginApi(email, password) {
  const r = await fetch(`${PORTAL}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const j = await r.json().catch(() => ({}));
  const data = j?.data ?? j;
  const token = data?.accessToken ?? data?.access_token ?? j?.accessToken;
  if (!token) throw new Error(`login failed ${email} HTTP ${r.status} ${j?.code || ''}`);
  const memberships = data?.memberships || data?.user?.memberships || [];
  const mem = memberships[0] || {};
  const u = data?.user ?? {};
  const companyId = mem.companyId || mem.company_id || data?.companyId || 'main';
  const tenantId = mem.tenantId || mem.tenant_id || data?.tenantId || 'xevn';
  return {
    token,
    expiresAt: Date.now() + 8 * 3600_000,
    email,
    companyId,
    tenantId,
    roleCode: mem.roleCode || mem.role_code || null,
    user: {
      userId: u.userId || u.id || email,
      email: u.email || email,
      displayName: u.displayName || u.fullName || u.name || email,
      roles: u.roles || [mem.roleCode || 'user'],
    },
    raw: {
      ...data,
      refreshToken: data?.refreshToken || data?.refresh_token,
      defaultMembershipId: mem.id || mem.membershipId || mem.membership_id,
      loginCode: j?.code || null,
      http: r.status,
    },
  };
}

async function injectPortalAuth(page, session) {
  await page.addInitScript(
    (s) => {
      const payload = JSON.stringify(s.user);
      for (const store of [localStorage, sessionStorage]) {
        store.setItem('xevn.portal.accessToken', s.token);
        store.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
        store.setItem('xevn.portal.user', payload);
        store.setItem('xevn.portal.tenantId', s.tenantId || 'xevn');
        store.setItem('xevn.portal.companyId', s.companyId);
        store.setItem('hrm_portal_mode', '1');
        store.setItem('hrm_current_company_id', s.companyId);
        store.setItem('hrm_current_tenant_id', s.tenantId || 'xevn');
        if (s.raw?.refreshToken) store.setItem('xevn.portal.refreshToken', s.raw.refreshToken);
        if (s.raw?.defaultMembershipId) {
          store.setItem('xevn.portal.membershipId', s.raw.defaultMembershipId);
        }
      }
    },
    session,
  );
}

function track(page) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') results.consoleErrors.push(String(msg.text()).slice(0, 280));
  });
  page.on('pageerror', (err) => results.pageErrors.push(String(err).slice(0, 280)));
  page.on('response', async (res) => {
    try {
      const u = res.url();
      if (!/\/api\/xbos\//.test(u)) return;
      const method = res.request().method();
      if (method === 'OPTIONS') return;
      const entry = {
        method,
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, ''),
        at: ts(),
      };
      if (/\/clone/.test(u) || /config-sync\/catalog/.test(u)) {
        try {
          const body = await res.json();
          entry.code = body?.code || null;
          entry.message = String(body?.message || '').slice(0, 200);
          if (body?.data) {
            entry.dataSummary = {
              catalogKey: body.data.catalogKey,
              itemCount: body.data.dest?.itemCount ?? body.data.itemCount,
              version: body.data.dest?.version ?? body.data.version,
            };
          }
        } catch {
          /* */
        }
      }
      results.network.push(entry);
    } catch {
      /* */
    }
  });
}

async function openClonePanelViaHdsd(page) {
  // Prefer HDSD click path; fallback deep link
  await page.goto(`${PORTAL}/command-center`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(1500);
  const settingsBtn = page
    .locator('button, a, [role="button"]')
    .filter({ hasText: /Cài đặt|Settings/i })
    .first();
  if (await settingsBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await settingsBtn.click();
    log('CLICK_SETTINGS');
    await sleep(800);
  }
  const menuItem = page
    .locator('button, a, [role="menuitem"], [role="button"], li, span')
    .filter({ hasText: /^Sao chép bộ danh mục$/ })
    .first();
  if (await menuItem.isVisible({ timeout: 4000 }).catch(() => false)) {
    await menuItem.click();
    log('CLICK_MENU_CLONE_DM09');
    await sleep(1000);
  } else {
    log('FALLBACK_DEEPLINK', { note: 'settings=hrm_catalog_clone' });
    await page.goto(`${PORTAL}/command-center?settings=hrm_catalog_clone`, {
      waitUntil: 'domcontentloaded',
      timeout: 90000,
    });
    await sleep(1500);
  }
  const panel = page.getByTestId('clone-catalog-panel');
  const forbidden = page.getByTestId('clone-catalog-panel-forbidden');
  const visible = await panel.isVisible({ timeout: 8000 }).catch(() => false);
  const blocked = await forbidden.isVisible({ timeout: 1000 }).catch(() => false);
  return { visible, blocked };
}

async function confirmClone(page) {
  const dlg = page.locator('[role="alertdialog"]');
  await dlg.waitFor({ state: 'visible', timeout: 8000 });
  const confirm = dlg.getByRole('button', { name: /^Sao chép$/ });
  await confirm.click();
  log('CONFIRM_CLONE');
}

async function waitCloneResponse(page, timeoutMs = 25000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const hits = results.network.filter(
      (n) => n.method === 'POST' && /\/catalog\/[^/]+\/clone/.test(n.url),
    );
    if (hits.length) {
      return hits[hits.length - 1];
    }
    await sleep(200);
  }
  return null;
}

function lastClonePosts() {
  return results.network.filter((n) => n.method === 'POST' && /\/catalog\/[^/]+\/clone/.test(n.url));
}

async function run() {
  // L0 quick
  try {
    const x = await fetch(`${XBOS}/api/xbos`);
    const p = await fetch(PORTAL);
    recordStep('L0', x.ok && p.ok ? 'PASS' : 'FAIL', {
      summary: `xbos=${x.status} portal=${p.status}`,
    });
  } catch (e) {
    recordStep('L0', 'FAIL', { summary: String(e) });
  }

  const ceo = await loginApi(EMAIL, PASSWORD);
  recordStep('LOGIN_CEO', 'PASS', {
    summary: `HTTP ${ceo.raw.http} code=${ceo.raw.loginCode} role=${ceo.roleCode} company=${ceo.companyId}`,
  });

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  track(page);
  await injectPortalAuth(page, ceo);

  try {
    const opened = await openClonePanelViaHdsd(page);
    await shot(page, '01-open-panel');
    if (!opened.visible) {
      recordStep('TC-DM09-OPEN-HP-001', 'FAIL', {
        summary: `Panel not visible blocked=${opened.blocked}`,
      });
      throw new Error('CloneCatalogPanel not visible for Group CEO');
    }
    recordStep('TC-DM09-OPEN-HP-001', 'PASS', {
      summary: 'Panel Sao chép bộ danh mục visible (data-testid=clone-catalog-panel)',
    });

    // must_keep: ensure we are NOT on apply-to-members panel
    const applyHint = await page
      .locator('text=Áp dụng danh mục HRM')
      .first()
      .isVisible()
      .catch(() => false);
    const dm09Subtitle = await page
      .locator('text=XBOS-DM-09')
      .first()
      .isVisible()
      .catch(() => false);
    results.must_keep.applyPanelNotUsed = dm09Subtitle && !applyHint;
    recordStep('MUST_KEEP_NOT_APPLY', results.must_keep.applyPanelNotUsed ? 'PASS' : 'FAIL', {
      summary: `dm09Subtitle=${dm09Subtitle} applyHint=${applyHint}`,
    });

    // Wait members + source
    await page.getByTestId('clone-catalog-key').waitFor({ state: 'visible', timeout: 15000 });
    await sleep(2000);

    // Prefer Du lịch member if present
    const destButtons = page.locator('[data-testid^="clone-dest-"]');
    const destCount = await destButtons.count();
    if (destCount === 0) {
      recordStep('TC-DM09-CPY-HP-001', 'FAIL', { summary: 'No ĐVTV dest candidates' });
      throw new Error('No dest candidates');
    }
    let destBtn = destButtons.first();
    for (let i = 0; i < destCount; i++) {
      const t = (await destButtons.nth(i).innerText().catch(() => '')) || '';
      if (/du lịch|du-lich|xe-du-lich|DL/i.test(t)) {
        destBtn = destButtons.nth(i);
        break;
      }
    }
    const destTestId = await destBtn.getAttribute('data-testid');
    results.hp.destId = destTestId;
    await destBtn.click();
    log('SELECT_DEST', { note: destTestId });
    await sleep(500);

    let hpOk = false;
    for (const key of CATALOG_TRY) {
      const beforePosts = lastClonePosts().length;
      await page.getByTestId('clone-catalog-key').selectOption(key);
      log('SELECT_KEY', { note: key });
      await sleep(1200);
      // ensure source loaded
      const sourceOk = await page
        .getByTestId('clone-catalog-source-summary')
        .isVisible({ timeout: 8000 })
        .catch(() => false);
      if (!sourceOk) {
        log('SOURCE_MISSING', { note: key });
        continue;
      }
      const submit = page.getByTestId('clone-catalog-submit');
      if (await submit.isDisabled()) {
        log('SUBMIT_DISABLED', { note: key });
        continue;
      }
      await submit.click();
      log('CLICK_SUBMIT', { note: key });
      await confirmClone(page);
      const resp = await waitCloneResponse(page);
      // wait until new post appears
      let post = resp;
      for (let w = 0; w < 40 && lastClonePosts().length <= beforePosts; w++) {
        await sleep(250);
      }
      const posts = lastClonePosts();
      post = posts[posts.length - 1] || post;
      log('CLONE_RESP', {
        note: `${key} status=${post?.status} code=${post?.code}`,
      });
      if (post && post.status >= 200 && post.status < 300 && post.code === 'XBOS-CFG-206') {
        results.hp = {
          catalogKey: key,
          destId: destTestId,
          http: post.status,
          code: post.code,
          dataSummary: post.dataSummary || null,
        };
        hpOk = true;
        break;
      }
      if (post && (post.status === 409 || post.code === 'XBOS-CFG-409')) {
        log('HP_KEY_CONFLICT_TRY_NEXT', { note: key });
        // dismiss error and try next key
        continue;
      }
      log('HP_UNEXPECTED', { note: JSON.stringify(post || {}) });
    }

    await shot(page, '02-after-hp-attempt');

    if (!hpOk) {
      recordStep('TC-DM09-CPY-HP-001', 'FAIL', {
        summary: `No CFG-206 after trying keys; last posts=${JSON.stringify(lastClonePosts().slice(-3))}`,
      });
    } else {
      // FE feedback
      const statusText =
        (await page.getByTestId('clone-catalog-status').innerText().catch(() => '')) ||
        (await page.getByTestId('clone-catalog-result').innerText().catch(() => ''));
      const resultVisible = await page
        .getByTestId('clone-catalog-result')
        .isVisible()
        .catch(() => false);
      const destVerify =
        (await page.getByTestId('clone-catalog-dest-verify').innerText().catch(() => '')) ||
        (await page.getByTestId('clone-catalog-dest-verify-note').innerText().catch(() => ''));

      // F5 deep link reload
      await page.goto(`${PORTAL}/command-center?settings=hrm_catalog_clone`, {
        waitUntil: 'domcontentloaded',
        timeout: 90000,
      });
      await sleep(2000);
      await page.getByTestId('clone-catalog-key').selectOption(results.hp.catalogKey);
      await sleep(1500);
      // re-select dest
      const destAfter = page.locator(`[data-testid="${results.hp.destId}"]`);
      if (await destAfter.isVisible().catch(() => false)) await destAfter.click();
      await shot(page, '03-f5-panel');

      const feOk =
        /XBOS-CFG-206|sao chép thành công|Kết quả: XBOS-CFG-206/i.test(statusText) || resultVisible;
      recordStep('TC-DM09-CPY-HP-001', feOk ? 'PASS' : 'PARTIAL', {
        summary: `POST ${results.hp.http} ${results.hp.code} key=${results.hp.catalogKey}; FE status="${statusText.slice(0, 160)}"; destVerify="${String(destVerify).slice(0, 120)}"; resultVisible=${resultVisible}`,
      });
      recordStep('TC-DM09-VER-HP-001', destVerify || resultVisible ? 'PASS' : 'PARTIAL', {
        summary: `dest verify/note after clone: ${String(destVerify || statusText).slice(0, 200)}`,
      });
    }

    // FD — re-clone same key (or job_titles known overlap)
    const fdKey = results.hp.catalogKey || 'job_titles';
    const beforeFd = lastClonePosts().length;
    await page.getByTestId('clone-catalog-key').selectOption(fdKey);
    await sleep(1200);
    if (results.hp.destId) {
      const d = page.locator(`[data-testid="${results.hp.destId}"]`);
      if (await d.isVisible().catch(() => false)) await d.click();
    } else {
      await destButtons.first().click();
    }
    await sleep(400);
    const submitFd = page.getByTestId('clone-catalog-submit');
    if (!(await submitFd.isDisabled())) {
      await submitFd.click();
      await confirmClone(page);
      for (let w = 0; w < 50 && lastClonePosts().length <= beforeFd; w++) await sleep(200);
    }
    const fdPost = lastClonePosts().slice(-1)[0] || null;
    const errText = (await page.getByTestId('clone-catalog-error').innerText().catch(() => '')) || '';
    results.fd = {
      http: fdPost?.status ?? null,
      code: fdPost?.code ?? null,
      uiText: errText.slice(0, 280),
    };
    await shot(page, '04-fd-conflict');
    const fdUiOk = /XBOS-CFG-409/.test(errText) || /XBOS-CFG-409/.test(fdPost?.code || '');
    const fdNetOk = fdPost?.status === 409 || fdPost?.code === 'XBOS-CFG-409';
    recordStep('TC-DM09-CPY-FD-001', fdNetOk && fdUiOk ? 'PASS' : fdNetOk ? 'PARTIAL' : 'FAIL', {
      summary: `Network ${fdPost?.status} ${fdPost?.code}; UI="${errText.slice(0, 180)}"`,
    });

    // AU — member CEO
    await context.clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    const member = await loginApi(MEMBER_EMAIL, PASSWORD);
    recordStep('LOGIN_MEMBER', 'PASS', {
      summary: `HTTP ${member.raw.http} role=${member.roleCode} tenant=${member.tenantId} company=${member.companyId}`,
    });
    // new context page for clean inject
    await browser.close();
    const browser2 = await chromium.launch({
      headless: true,
      executablePath: CHROME,
      args: ['--disable-dev-shm-usage'],
    });
    const ctx2 = await browser2.newContext({ viewport: { width: 1440, height: 900 } });
    const page2 = await ctx2.newPage();
    track(page2);
    await injectPortalAuth(page2, member);
    await page2.goto(`${PORTAL}/command-center`, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(1500);
    const settings2 = page2
      .locator('button, a, [role="button"]')
      .filter({ hasText: /Cài đặt|Settings/i })
      .first();
    if (await settings2.isVisible({ timeout: 5000 }).catch(() => false)) {
      await settings2.click();
      await sleep(800);
    }
    const menuClone = page2
      .locator('button, a, [role="menuitem"], [role="button"]')
      .filter({ hasText: /^Sao chép bộ danh mục$/ });
    const menuVisible = await menuClone.first().isVisible({ timeout: 3000 }).catch(() => false);
    results.au.menuVisible = menuVisible;
    await shot(page2, '05-au-menu');

    await page2.goto(`${PORTAL}/command-center?settings=hrm_catalog_clone`, {
      waitUntil: 'domcontentloaded',
      timeout: 90000,
    });
    await sleep(1500);
    const auBlocked = await page2
      .getByTestId('clone-catalog-au-blocked')
      .isVisible({ timeout: 8000 })
      .catch(() => false);
    const auForbidden = await page2
      .getByTestId('clone-catalog-panel-forbidden')
      .isVisible()
      .catch(() => false);
    const auPanel = await page2.getByTestId('clone-catalog-panel').isVisible().catch(() => false);
    results.au.deepLinkBlocked = auBlocked || auForbidden;
    await shot(page2, '06-au-deeplink');

    const auPass = !menuVisible || results.au.deepLinkBlocked;
    // Prefer: menu hidden OR deep-link blocked; FAIL if runnable clone panel
    const auVerdict = auPanel && !results.au.deepLinkBlocked ? 'FAIL' : auPass ? 'PASS' : 'FAIL';
    recordStep('TC-DM09-OPEN-AU-001', auVerdict, {
      summary: `menuVisible=${menuVisible} deepLinkBlocked=${results.au.deepLinkBlocked} runnablePanel=${auPanel}`,
    });
    recordStep('TC-DM09-CPY-AU-001', auVerdict, {
      summary: 'Member cannot run clone UI (hidden menu and/or AU blocked banner)',
    });

    await browser2.close();
  } catch (e) {
    results.residuals.push({ id: 'R-DM09-R2-RUNTIME', note: String(e).slice(0, 400) });
    recordStep('RUNTIME', 'FAIL', { summary: String(e).slice(0, 400) });
    try {
      await shot(page, '99-error');
    } catch {
      /* */
    }
    try {
      await browser.close();
    } catch {
      /* */
    }
  }

  const p0 = [
    'L0',
    'TC-DM09-OPEN-HP-001',
    'TC-DM09-CPY-HP-001',
    'TC-DM09-CPY-FD-001',
    'TC-DM09-OPEN-AU-001',
  ];
  const fails = p0.filter((id) => results.steps[id]?.verdict === 'FAIL');
  const partials = p0.filter((id) => results.steps[id]?.verdict === 'PARTIAL');
  results.overall = fails.length
    ? 'FAIL'
    : partials.length
      ? 'PASS_WITH_PARTIAL'
      : 'PASS';
  results.endedAt = ts();
  save();
  console.log('\nOVERALL', results.overall);
  console.log('JSON', OUT_JSON);
  process.exit(fails.length ? 1 : 0);
}

run().catch((e) => {
  console.error(e);
  results.residuals.push({ id: 'FATAL', note: String(e) });
  results.overall = 'FAIL';
  results.endedAt = ts();
  save();
  process.exit(1);
});
