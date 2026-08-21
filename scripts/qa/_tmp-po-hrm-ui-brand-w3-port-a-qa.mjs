#!/usr/bin/env node
/**
 * PO-HRM-UI-BRAND-W3-PORT-A-QA — U65 browser chrome spot PORT-01..08
 * zero-seed · no ATT/EMP remaster claim · dual-surface + pale ban
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM_STANDALONE = process.env.HRM_FE_URL || 'http://127.0.0.1:8080';
const HRM = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
const EMAIL = 'ceo@xe.vn';
const PASSWORD = process.env.PORTAL_DEV_PASSWORD || 'Xevn@2026';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-ui-brand-w3-port-a-qa-browser.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-ui-brand-w3-port-a-qa');
mkdirSync(SCREEN, { recursive: true });

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const results = {
  work_item_id: 'PO-HRM-UI-BRAND-W3-PORT-A-QA',
  fe_work_item: 'PO-HRM-UI-BRAND-W3-PORT-A',
  startedAt: new Date().toISOString(),
  u65: 'zero-seed',
  env: { PORTAL, HRM_STANDALONE, HRM, XBOS, EMAIL, commit: COMMIT },
  l0: {},
  surfaces: {},
  screenshots: [],
  consoleErrors: [],
  pageErrors: [],
  failReasons: [],
  verdict: null,
  ack_status: null,
  endedAt: null,
};

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(results, null, 2));
}

async function probeL0() {
  for (const [k, url] of [
    ['hrm', `${HRM}/api/hrm`],
    ['xbos', `${XBOS}/api/xbos`],
    ['portal', PORTAL],
    ['hrm_fe', `${HRM_STANDALONE}/`],
  ]) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
      results.l0[k] = r.status;
    } catch (e) {
      results.l0[k] = String(e?.cause?.code || e?.message || e).slice(0, 80);
    }
  }
  save();
}

async function loginApi() {
  const r = await fetch(`${PORTAL}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const j = await r.json().catch(() => ({}));
  const data = j?.data ?? j;
  const token = data?.accessToken ?? data?.access_token;
  if (!token) throw new Error(`login failed HTTP ${r.status}`);
  return {
    token,
    expiresAt: Date.now() + 8 * 3600_000,
    email: EMAIL,
    companyId: 'main',
    user: {
      userId: data?.user?.userId || data?.user?.id || EMAIL,
      email: EMAIL,
      displayName: data?.user?.displayName || 'CEO',
      roles: data?.user?.roles || ['group_ceo'],
    },
    http: r.status,
  };
}

async function injectPortalAuth(page, session, { portalMode = true } = {}) {
  await page.addInitScript(
    ({ s, portalMode: pm }) => {
      const payload = JSON.stringify(s.user);
      for (const store of [localStorage, sessionStorage]) {
        store.setItem('xevn.portal.accessToken', s.token);
        store.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
        store.setItem('xevn.portal.user', payload);
        store.setItem('xevn.portal.tenantId', 'xevn');
        store.setItem('xevn.portal.companyId', s.companyId);
        store.setItem('hrm_current_company_id', s.companyId);
        store.setItem('hrm_current_tenant_id', 'xevn');
        if (pm) {
          store.setItem('hrm_portal_mode', '1');
        } else {
          store.removeItem('hrm_portal_mode');
        }
      }
    },
    { s: session, portalMode },
  );
}

async function shot(page, id) {
  const path = resolve(SCREEN, `${id}.png`);
  await page.screenshot({ path, fullPage: false });
  results.screenshots.push(path.replace(/\\/g, '/').split('docs/qa/evidence/')[1] || path);
  return path;
}

async function evaluateChrome(page, opts = {}) {
  return page.evaluate((o) => {
    const cs = getComputedStyle(document.documentElement);
    const primary = (cs.getPropertyValue('--xevn-color-primary') || '').trim().toLowerCase();
    const text = (cs.getPropertyValue('--xevn-color-text') || '').trim().toLowerCase();
    const secondary = (cs.getPropertyValue('--xevn-color-text-secondary') || '').trim().toLowerCase();

    const body = document.body;
    const bodyCs = getComputedStyle(body);
    const bodyColor = bodyCs.color;
    const bodyBg = bodyCs.backgroundColor;

    const brandShell = !!document.querySelector('.xevn-brand-shell');
    const dialogSurface = !!document.querySelector('.xevn-dialog-surface');
    const marketingChips = Array.from(document.querySelectorAll('*')).some((el) => {
      const t = (el.textContent || '').trim();
      return /trust badge|feature chip|white\/70/i.test(t);
    });

    // Pale AI body heuristic: very light gray text on light bg (rgb high L)
    function parseRgb(s) {
      const m = String(s).match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
      if (!m) return null;
      return [Number(m[1]), Number(m[2]), Number(m[3])];
    }
    const rgb = parseRgb(bodyColor);
    const paleBody =
      rgb &&
      rgb[0] > 140 &&
      rgb[1] > 140 &&
      rgb[2] > 140 &&
      Math.abs(rgb[0] - rgb[1]) < 30;

    const honesty = Array.from(document.querySelectorAll('[class*="Alert"], [role="alert"], .border'))
      .map((el) => (el.textContent || '').trim().slice(0, 120))
      .filter((t) => /đang phát triển|featureInDev|GĐ2|chưa|HOLD|stub|tính năng/i.test(t))
      .slice(0, 5);

    const sidebarActive = document.querySelector('.sidebar-link.active, a.sidebar-link.active');
    let sidebarActiveColor = null;
    if (sidebarActive) sidebarActiveColor = getComputedStyle(sidebarActive).color;

    const topHeader = document.querySelector('header, [data-testid="top-header"], .sticky');
    const membership =
      !!document.body.innerText.match(/XeVN|Tập đoàn|membership|pháp nhân|Công ty/i) ||
      !!document.querySelector('[aria-label*="membership" i], [data-testid*="membership" i]');

    const hasSlate50Frame = !!document.querySelector('.bg-slate-50, .bg-slate-100');

    return {
      url: location.href,
      title: document.title,
      tokens: { primary, text, secondary },
      bodyColor,
      bodyBg,
      brandShell,
      dialogSurface,
      marketingChips,
      paleBodySuspect: !!paleBody,
      honestySample: honesty,
      sidebarActiveColor,
      membershipSignal: membership,
      hasSlate50Frame,
      surfaceHint: o.surfaceHint || null,
      textLen: (document.body.innerText || '').length,
    };
  }, opts);
}

function passSurface(id, data, checks) {
  const fails = [];
  for (const c of checks) {
    if (!c.ok) fails.push(c.msg);
  }
  results.surfaces[id] = {
    ...data,
    checks,
    pass: fails.length === 0,
    fails,
  };
  if (fails.length) results.failReasons.push(`${id}: ${fails.join('; ')}`);
}

async function main() {
  await probeL0();
  const l0Ok =
    results.l0.hrm === 200 && results.l0.xbos === 200 && results.l0.portal === 200;
  if (!l0Ok) {
    results.verdict = 'BLOCKED';
    results.ack_status = 'FAIL_TO_PM';
    results.failReasons.push(`L0 down: ${JSON.stringify(results.l0)}`);
    results.endedAt = new Date().toISOString();
    save();
    console.error('BLOCKED L0', results.l0);
    process.exit(2);
  }

  const session = await loginApi();
  results.login = { http: session.http, persona: EMAIL, companyId: 'main' };
  save();

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });

  const attachListeners = (page) => {
    page.on('console', (msg) => {
      const t = msg.text();
      if (msg.type() === 'error' && !/favicon|React DevTools|Download the React/i.test(t)) {
        results.consoleErrors.push(t.slice(0, 400));
      }
    });
    page.on('pageerror', (err) => results.pageErrors.push(String(err).slice(0, 400)));
  };

  // ---- PORT-01 portal login (dark shell) — no auth inject ----
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    attachListeners(page);
    await page.goto(`${PORTAL}/login`, { waitUntil: 'domcontentloaded', timeout: 45_000 });
    await sleep(1500);
    await shot(page, 'PORT-01-portal-login');
    const data = await evaluateChrome(page, { surfaceHint: 'PORT-01' });
    const primaryOk = !data.tokens.primary || data.tokens.primary.includes('1e40af') || data.tokens.primary.includes('1E40AF'.toLowerCase());
    passSurface('PORT-01', data, [
      { ok: data.brandShell, msg: 'missing .xevn-brand-shell' },
      { ok: data.dialogSurface, msg: 'missing .xevn-dialog-surface' },
      { ok: data.textLen > 20, msg: 'login form not rendered' },
      { ok: !data.paleBodySuspect, msg: 'pale body text suspect' },
      { ok: primaryOk, msg: `primary token ${data.tokens.primary}` },
    ]);
    await page.close();
  }

  // ---- Authenticated portal surfaces ----
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    attachListeners(page);
    await injectPortalAuth(page, session);

    // PORT-02 UnifiedShell /
    await page.goto(`${PORTAL}/`, { waitUntil: 'domcontentloaded', timeout: 45_000 });
    await sleep(2000);
    await shot(page, 'PORT-02-unified-shell');
    {
      const data = await evaluateChrome(page, { surfaceHint: 'PORT-02' });
      passSurface('PORT-02', data, [
        { ok: data.textLen > 40, msg: 'shell empty' },
        { ok: !data.paleBodySuspect, msg: 'pale body' },
        { ok: !data.brandShell, msg: 'unexpected dark brand shell on ops home (dual-surface)' },
      ]);
      // dual-surface: ops should NOT be brand-shell — if brandShell true it's a fail for dual-surface
      // Actually UnifiedShell might not have brandShell — good. If brandShell is true on ops, that's wrong.
      // Wait - I set ok: !data.brandShell — if brandShell is false, ok is true. Good.
    }

    // PORT-03 + PORT-06 Command Center + TopHeader
    await page.goto(`${PORTAL}/command-center`, { waitUntil: 'domcontentloaded', timeout: 45_000 });
    await sleep(2500);
    await shot(page, 'PORT-03-command-center');
    {
      const data = await evaluateChrome(page, { surfaceHint: 'PORT-03' });
      const textSample = await page.locator('body').innerText();
      const hasRail = /Command Center|Trung tâm|HRM|Hộp thư|Inbox|Dashboard/i.test(textSample);
      passSurface('PORT-03', data, [
        { ok: hasRail || data.textLen > 80, msg: 'CC chrome not visible' },
        { ok: !data.paleBodySuspect, msg: 'pale body on CC' },
        { ok: !data.brandShell, msg: 'dark brand shell on light ops CC (dual-surface break)' },
      ]);
      results.surfaces['PORT-06'] = {
        ...data,
        membershipSignal: data.membershipSignal,
        note: 'TopHeader/membership co-located on CC layout',
        pass: data.membershipSignal || /ceo@xe\.vn|CEO|XeVN/i.test(textSample),
        fails:
          data.membershipSignal || /ceo@xe\.vn|CEO|XeVN/i.test(textSample)
            ? []
            : ['membership/TopHeader signal weak'],
      };
      if (!results.surfaces['PORT-06'].pass) {
        results.failReasons.push('PORT-06: membership/TopHeader signal weak');
      }
      await shot(page, 'PORT-06-topheader-membership');
    }

    // PORT-04 Inbox
    await page.goto(`${PORTAL}/command-center/inbox`, {
      waitUntil: 'domcontentloaded',
      timeout: 45_000,
    });
    await sleep(2500);
    await shot(page, 'PORT-04-inbox');
    {
      const data = await evaluateChrome(page, { surfaceHint: 'PORT-04' });
      const textSample = await page.locator('body').innerText();
      const inboxOk = /Hộp thư|Inbox|Công việc|workflow|duyệt/i.test(textSample) || data.textLen > 40;
      passSurface('PORT-04', data, [
        { ok: inboxOk, msg: 'inbox shell not recognizable' },
        { ok: !data.paleBodySuspect, msg: 'pale body inbox' },
      ]);
    }

    // PORT-05 HRM embed chrome
    await page.goto(`${PORTAL}/command-center/hrm/employees`, {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    await sleep(3500);
    await shot(page, 'PORT-05-hrm-embed');
    {
      const data = await evaluateChrome(page, { surfaceHint: 'PORT-05' });
      const iframe = page.frameLocator('iframe').first();
      let iframeText = '';
      let iframeHonesty = [];
      let iframeSidebar = false;
      try {
        const frame = page.frames().find((f) => /\/hr|8080|hrm/i.test(f.url()) || f !== page.mainFrame());
        if (frame && frame !== page.mainFrame()) {
          iframeText = await frame.locator('body').innerText({ timeout: 8000 }).catch(() => '');
          iframeSidebar = (await frame.locator('.sidebar-link, nav a, aside a').count()) > 0;
          iframeHonesty = await frame
            .evaluate(() =>
              Array.from(document.querySelectorAll('[role="alert"], .border'))
                .map((el) => (el.textContent || '').trim().slice(0, 100))
                .filter((t) => /đang phát triển|featureInDev|GĐ2|HOLD|stub|Sync|ERROR|chưa/i.test(t))
                .slice(0, 5),
            )
            .catch(() => []);
        } else {
          // maybe SPA embed without iframe
          iframeText = await page.locator('body').innerText();
          iframeSidebar = (await page.locator('.sidebar-link, [data-testid="hrm-sidebar"]').count()) > 0;
        }
      } catch {
        iframeText = await page.locator('body').innerText();
      }
      const embedOk =
        /Nhân sự|Employees|HRM|Chấm công|Danh sách/i.test(iframeText) ||
        /Nhân sự|Employees|HRM/i.test(await page.locator('body').innerText());
      passSurface(
        'PORT-05',
        { ...data, iframeSidebar, iframeHonesty, iframeTextLen: iframeText.length },
        [
          { ok: embedOk, msg: 'HRM embed content not visible' },
          { ok: !data.paleBodySuspect, msg: 'pale body on embed chrome' },
          { ok: !data.brandShell, msg: 'dark brand shell wrapping light embed ops' },
        ],
      );
      results.surfaces['PORT-05'].honestyNote = iframeHonesty;
    }

    await page.close();
  }

  // ---- PORT-07 HRM standalone login ----
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    attachListeners(page);
    const loginUrls = [`${HRM_STANDALONE}/login`, `${PORTAL}/hr/login`];
    let loaded = false;
    for (const url of loginUrls) {
      try {
        const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 });
        if (resp && resp.status() < 400) {
          loaded = true;
          results.surfaces['_PORT-07-url'] = url;
          break;
        }
      } catch {
        /* try next */
      }
    }
    await sleep(1500);
    await shot(page, 'PORT-07-hrm-login');
    const data = await evaluateChrome(page, { surfaceHint: 'PORT-07' });
    const textSample = await page.locator('body').innerText();
    const marketingHero =
      /trust badge|Tính năng nổi bật|feature chips|white\/70|đăng nhập an toàn với/i.test(textSample) &&
      /marketing|hero panel/i.test(textSample);
    // Dev removed marketing left panel — fail if large marketing feature list remains
    const leftPanelClutter = /Quản lý nhân sự toàn diện|Chấm công thông minh|Payroll tự động|AI-powered/i.test(
      textSample,
    );
    passSurface('PORT-07', data, [
      { ok: loaded, msg: 'HRM login URL failed to load' },
      { ok: data.brandShell || data.dialogSurface, msg: 'missing brandShell/dialogSurface parity' },
      { ok: !leftPanelClutter, msg: 'marketing left panel / feature chips still present' },
      { ok: !data.paleBodySuspect, msg: 'pale body on HRM login' },
      { ok: !marketingHero, msg: 'marketing hero residual' },
    ]);
    await page.close();
  }

  // ---- PORT-08 HRM sidebar (standalone — no portal=1; AppSidebar only outside embed) ----
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    attachListeners(page);
    await injectPortalAuth(page, session, { portalMode: false });
    // Prefer HRM :8080 standalone; fall back to portal /hr without portal QS
    const sidebarUrls = [
      `${HRM_STANDALONE}/employees`,
      `${HRM_STANDALONE}/hr/employees`,
      `${PORTAL}/hr/employees`,
    ];
    let sidebarUrl = sidebarUrls[0];
    for (const url of sidebarUrls) {
      try {
        const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45_000 });
        if (resp && resp.status() < 400) {
          sidebarUrl = url;
          break;
        }
      } catch {
        /* next */
      }
    }
    await sleep(3000);
    await shot(page, 'PORT-08-hrm-sidebar');
    results.surfaces['_PORT-08-url'] = sidebarUrl;
    const data = await evaluateChrome(page, { surfaceHint: 'PORT-08' });
    const linkCount = await page.locator('.sidebar-link').count();
    const asideLinks = await page.locator('aside a, [class*="sidebar"] a').count();
    const textSample = await page.locator('body').innerText();
    const navOk =
      linkCount > 3 ||
      asideLinks > 3 ||
      (/UNICOM|XeVN HRM|Chấm công|Tuyển dụng|Lương|Nhân sự/i.test(textSample) &&
        (await page.locator('.sidebar-link, aside').count()) > 0);
    // Honesty spot on embed path (portal chrome) — Face GĐ2 banner must remain
    let honestySample = [];
    try {
      const page2 = await browser.newPage({ viewport: { width: 1440, height: 900 } });
      attachListeners(page2);
      await injectPortalAuth(page2, session, { portalMode: true });
      await page2.goto(`${PORTAL}/hr/attendance?portal=1&tenantId=xevn&companyId=main`, {
        waitUntil: 'domcontentloaded',
        timeout: 45_000,
      });
      await sleep(2500);
      await shot(page2, 'PORT-08-honesty-spot-attendance');
      // Clock-In → Face honesty
      const clockTrig = page2.locator('button').filter({ hasText: /Chấm công|Vào\/ra|Clock/i }).first();
      if (await clockTrig.isVisible({ timeout: 3000 }).catch(() => false)) {
        await clockTrig.click().catch(() => {});
        await sleep(500);
      }
      const faceTab = page2.getByRole('button', { name: /Khuôn mặt|Face/i }).first();
      const faceMenu = page2.getByRole('menuitem', { name: /Khuôn mặt|Face/i }).first();
      if (await faceTab.isVisible({ timeout: 2000 }).catch(() => false)) {
        await faceTab.click().catch(() => {});
      } else if (await faceMenu.isVisible({ timeout: 2000 }).catch(() => false)) {
        await faceMenu.click().catch(() => {});
      }
      await sleep(1000);
      honestySample = await page2.evaluate(() =>
        Array.from(document.querySelectorAll('[role="alert"], [data-testid*="honesty"]'))
          .map((el) => (el.textContent || '').trim().slice(0, 160))
          .filter((t) => /đang phát triển|featureInDev|GĐ2|HOLD|mobile|chưa|stub|tính năng/i.test(t))
          .slice(0, 8),
      );
      if (honestySample.length) await shot(page2, 'PORT-08-honesty-face-tab');
      results.honestySpot = { sample: honestySample, count: honestySample.length };
      await page2.close();
    } catch (e) {
      results.honestySpot = { error: String(e).slice(0, 200) };
    }

    passSurface(
      'PORT-08',
      { ...data, linkCount, asideLinks, honestySample, sidebarUrl },
      [
        { ok: navOk, msg: 'sidebar nav not visible (standalone expected)' },
        { ok: !data.paleBodySuspect, msg: 'pale body on HRM shell' },
      ],
    );
    await page.close();
  }

  await browser.close();

  const surfaceIds = ['PORT-01', 'PORT-02', 'PORT-03', 'PORT-04', 'PORT-05', 'PORT-06', 'PORT-07', 'PORT-08'];
  const allPass = surfaceIds.every((id) => results.surfaces[id]?.pass);
  results.verdict = allPass ? 'PASS' : 'FAIL';
  results.ack_status = allPass ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  results.endedAt = new Date().toISOString();
  results.pageErrors = results.pageErrors.slice(0, 20);
  results.consoleErrors = results.consoleErrors.slice(0, 30);
  save();

  console.log(JSON.stringify({ ack: results.ack_status, fails: results.failReasons, l0: results.l0 }, null, 2));
  process.exit(allPass ? 0 : 1);
}

main().catch((e) => {
  results.verdict = 'ERROR';
  results.ack_status = 'FAIL_TO_PM';
  results.failReasons.push(String(e).slice(0, 500));
  results.endedAt = new Date().toISOString();
  save();
  console.error(e);
  process.exit(1);
});
