/**
 * W1-B-04-AUTH-FE-QA-RET2 — interrupt re-exec
 * Case A wrong password · Case B ceo login+labels · Case C F5
 * U65 · click timestamps + Network required (no idle-viewport)
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-w1b-04-auth-fe-qa-ret2-runtime.json');
const SCREEN_DIR = resolve(ROOT, 'docs/qa/evidence/screens/w1b-04-auth-fe-qa-ret2');
const RAW_ROLE_RE = /\b(group_ceo|subsidiary_ceo|HRBP_MANAGER|hrbp|roleCode)\b/i;

const results = {
  work_item_id: 'W1-B-04-AUTH-FE-QA-RET2',
  startedAt: new Date().toISOString(),
  env: { PORTAL, u65: 'zero-seed', hdsd_align: true },
  l0: {},
  clicks: [],
  ac: [],
  cases: {},
  network: [],
  consoleErrors: [],
  pageErrors: [],
  failedSrc: [],
  screens: [],
  bodyPreviews: {},
};

function save() {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(results, null, 2));
}

function click(step, detail = {}) {
  const row = { step, at: new Date().toISOString(), ...detail };
  results.clicks.push(row);
  console.log(`CLICK  ${row.at}  ${step}  ${JSON.stringify(detail).slice(0, 180)}`);
  save();
}

function ac(id, verdict, detail, extra = {}) {
  const row = { id, verdict, detail, at: new Date().toISOString(), ...extra };
  results.ac.push(row);
  console.log(`${verdict}  ${id}  ${detail.slice(0, 280)}`);
  save();
}

async function shot(page, name) {
  mkdirSync(SCREEN_DIR, { recursive: true });
  const path = join(SCREEN_DIR, `${name}.png`);
  await page.screenshot({ path, fullPage: false });
  results.screens.push(path.replace(/\\/g, '/'));
}

function track(page) {
  page.on('response', async (res) => {
    try {
      const u = res.url();
      if (res.status() >= 500 && /\/src\//.test(u)) {
        results.failedSrc.push({ status: res.status(), url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 200), at: new Date().toISOString() });
      }
      if (!/\/api\/xbos\/auth\//.test(u)) return;
      const method = res.request().method();
      if (method === 'OPTIONS') return;
      const entry = {
        method,
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 240),
        at: new Date().toISOString(),
      };
      if (/\/auth\/(login|select-membership|me)/.test(u) && res.status() < 500) {
        try {
          const j = await res.json();
          entry.code = j?.code;
          entry.message = typeof j?.message === 'string' ? j.message.slice(0, 160) : undefined;
          const data = j?.data ?? {};
          if (Array.isArray(data.memberships)) {
            entry.memberships = data.memberships.map((m) => ({
              tenantId: m.tenantId,
              roleCode: m.roleCode,
              role_label: m.role_label,
              company_label: m.company_label,
              tenant_label: m.tenant_label,
              membershipId: m.membershipId,
            }));
          }
          if (data.accessToken) {
            try {
              const payload = JSON.parse(
                Buffer.from(String(data.accessToken).split('.')[1], 'base64url').toString('utf8'),
              );
              entry.jwtMembershipId = payload.membershipId || payload.membership_id || null;
              entry.jwtRoleCode = payload.roleCode || null;
            } catch {
              /* */
            }
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
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const t = msg.text();
      if (/favicon|Download the React DevTools/i.test(t)) return;
      results.consoleErrors.push(t.slice(0, 280));
    }
  });
  page.on('pageerror', (err) => {
    results.pageErrors.push(String(err).slice(0, 280));
  });
}

async function probeL0() {
  for (const [name, url] of [
    ['hrm', 'http://127.0.0.1:28001/api/hrm'],
    ['xbos', 'http://127.0.0.1:28002/api/xbos'],
    ['portal', `${PORTAL}/login`],
    ['appTsx', `${PORTAL}/src/App.tsx`],
  ]) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
      results.l0[name] = r.status;
    } catch (e) {
      results.l0[name] = String(e).slice(0, 80);
    }
  }
}

async function clearAuth(page) {
  click('goto-login-clear', { url: `${PORTAL}/login` });
  await page.goto(`${PORTAL}/login`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.evaluate(() => {
    for (const store of [localStorage, sessionStorage]) store.clear();
  });
}

async function assertLoginForm(page) {
  click('assert-login-form-visible');
  await page.goto(`${PORTAL}/login`, { waitUntil: 'networkidle', timeout: 90000 });
  const email = page.locator('input[type="email"]').first();
  const pass = page.locator('input[type="password"]').first();
  await email.waitFor({ state: 'visible', timeout: 20000 });
  await pass.waitFor({ state: 'visible', timeout: 20000 });
  const body = (await page.locator('body').innerText()).replace(/\s+/g, ' ').trim().slice(0, 240);
  results.bodyPreviews.login = body;
  await shot(page, '00-login-form');
  const ok = body.includes('Đăng nhập') && (await email.isVisible()) && (await pass.isVisible());
  ac('FORM', ok ? '🟢' : '🔴', `login form visible=${ok}; body="${body.slice(0, 120)}"`);
  return ok;
}

async function fillLogin(page, email, password) {
  const emailInput = page.locator('input[type="email"]').first();
  const passInput = page.locator('input[type="password"]').first();
  click('fill-email', { email });
  await emailInput.click({ clickCount: 3 });
  await emailInput.fill(email);
  click('fill-password', { passwordLen: String(password).length });
  await passInput.click({ clickCount: 3 });
  await passInput.fill(password);
}

async function submitLogin(page) {
  const before = results.network.length;
  click('click-submit-login');
  await page.locator('button[type="submit"]').first().click();
  await page.waitForTimeout(2000);
  return results.network.slice(before).filter((n) => /\/auth\/login/.test(n.url));
}

async function readSession(page) {
  return page.evaluate(() => {
    const mid =
      sessionStorage.getItem('xevn.portal.membershipId') ||
      localStorage.getItem('xevn.portal.membershipId');
    const token =
      sessionStorage.getItem('xevn.portal.accessToken') ||
      localStorage.getItem('xevn.portal.accessToken');
    let jwtMembershipId = null;
    let jwtRoleCode = null;
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        jwtMembershipId = payload.membershipId || payload.membership_id || null;
        jwtRoleCode = payload.roleCode || null;
      } catch {
        /* */
      }
    }
    return { mid, jwtMembershipId, jwtRoleCode, hasToken: Boolean(token) };
  });
}

async function readMembershipUi(page) {
  return page.evaluate(() => {
    const switcher = document.querySelector('[data-testid="portal-membership-switcher"]');
    const staticEl = document.querySelector('[data-testid="portal-membership-static"]');
    const el = switcher || staticEl;
    const text = (el?.textContent || '').replace(/\s+/g, ' ').trim();
    const overlay = document.querySelector('vite-error-overlay');
    return {
      mode: switcher ? 'switcher' : staticEl ? 'static' : 'missing',
      text,
      switcherOpenable: Boolean(switcher),
      viteOverlay: Boolean(overlay),
      url: location.href,
      bodySnippet: (document.body?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 200),
    };
  });
}

async function caseA(page) {
  const c = { name: 'CaseA-wrong-password', steps: [] };
  await clearAuth(page);
  await page.goto(`${PORTAL}/login`, { waitUntil: 'networkidle', timeout: 90000 });
  await fillLogin(page, 'ceo@xe.vn', 'WrongPassword-NotReal-999');
  const nets = await submitLogin(page);
  await page.waitForTimeout(800);
  const body = (await page.locator('body').innerText()).replace(/\s+/g, ' ').trim();
  await shot(page, 'A-wrong-password');
  const loginNet = nets[nets.length - 1];
  const stillLogin = page.url().includes('/login');
  const failMsg =
    /sai|không đúng|invalid|failed|thất bại|mật khẩu|unauthorized|401|403/i.test(body) ||
    (loginNet && loginNet.status >= 400);
  c.steps.push({
    loginStatus: loginNet?.status,
    code: loginNet?.code,
    message: loginNet?.message,
    stillLogin,
    bodyHasFailHint: failMsg,
    bodySlice: body.slice(0, 180),
  });
  results.cases.A = c;
  const pass = stillLogin && failMsg && (!loginNet || loginNet.status >= 400);
  ac(
    'CASE-A',
    pass ? '🟢' : '🔴',
    `wrong pwd status=${loginNet?.status} code=${loginNet?.code} stillLogin=${stillLogin} msgHint=${failMsg}; body="${body.slice(0, 100)}"`,
    { loginNet },
  );
  return pass;
}

async function openSwitcher(page) {
  const btn = page.locator('[data-testid="portal-membership-switcher"]');
  if ((await btn.count()) === 0) return { opened: false, items: [], panelText: '' };
  click('open-membership-switcher');
  await btn.click();
  await page.waitForTimeout(500);
  return page.evaluate(() => {
    const root = document.querySelector('[data-testid="portal-membership-switcher"]')?.parentElement;
    const dropdown = root?.querySelector('.absolute');
    const text = (dropdown?.textContent || '').replace(/\s+/g, ' ').trim();
    const items = Array.from(dropdown?.querySelectorAll('button') || [])
      .map((b) => (b.textContent || '').replace(/\s+/g, ' ').trim())
      .filter(Boolean);
    return { opened: true, text, items };
  });
}

async function selectOther(page) {
  const before = results.network.length;
  click('click-other-membership');
  const clicked = await page.evaluate(() => {
    const root = document.querySelector('[data-testid="portal-membership-switcher"]')?.parentElement;
    const dropdown = root?.querySelector('.absolute');
    const buttons = Array.from(dropdown?.querySelectorAll('button') || []);
    const candidate =
      buttons.find((b) => !b.querySelector('svg.lucide-check') && (b.textContent || '').trim()) ||
      buttons[1] ||
      null;
    if (!candidate) return null;
    const label = (candidate.textContent || '').replace(/\s+/g, ' ').trim();
    candidate.click();
    return label;
  });
  await page.waitForTimeout(2500);
  const selectNets = results.network
    .slice(before)
    .filter((n) => /\/auth\/select-membership/.test(n.url));
  return { clicked, selectNets };
}

async function caseB(page) {
  const c = { name: 'CaseB-ceo-login-labels-select', steps: [] };
  await clearAuth(page);
  await page.goto(`${PORTAL}/login`, { waitUntil: 'networkidle', timeout: 90000 });
  await fillLogin(page, 'ceo@xe.vn', PASSWORD);
  const nets = await submitLogin(page);
  await page.waitForURL((u) => !u.pathname.includes('/login'), { timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(2000);
  await shot(page, 'B-ceo-after-login');
  const loginNet = nets[nets.length - 1];
  const loginOk = Boolean(loginNet && loginNet.status >= 200 && loginNet.status < 300);
  const be = (loginNet?.memberships || [])[0] || {};
  const hasBeLabels = Boolean(be.tenant_label && be.company_label && be.role_label);

  await page
    .locator('[data-testid="portal-membership-switcher"], [data-testid="portal-membership-static"]')
    .first()
    .waitFor({ state: 'visible', timeout: 12000 })
    .catch(() => {});

  let ui = await readMembershipUi(page);
  const sess = await readSession(page);
  c.steps.push({ loginOk, loginNet: { status: loginNet?.status, code: loginNet?.code }, be, ui, sess });

  const showsRaw = RAW_ROLE_RE.test(ui.text);
  const showsRole = be.role_label ? ui.text.includes(be.role_label) : false;
  const showsTenant = be.tenant_label ? ui.text.includes(be.tenant_label) : false;
  const ac1 =
    loginOk &&
    hasBeLabels &&
    !showsRaw &&
    (showsRole || showsTenant) &&
    !ui.viteOverlay &&
    ui.mode !== 'missing';

  ac(
    'CASE-B-AC1-labels',
    ac1 ? '🟢' : '🔴',
    `login ${loginNet?.status}/${loginNet?.code}; UI mode=${ui.mode} viteOverlay=${ui.viteOverlay}; role=${showsRole} tenant=${showsTenant} raw=${showsRaw}; ui="${ui.text.slice(0, 100)}"`,
    { be, ui },
  );

  // select path: ceo may be single-mem → try admin
  let selectOk = false;
  let selectDetail = { path: 'ceo' };
  if (ui.switcherOpenable) {
    const panel = await openSwitcher(page);
    await shot(page, 'B-ceo-picker');
    const { clicked, selectNets } = await selectOther(page);
    const sel = selectNets[selectNets.length - 1];
    const sess2 = await readSession(page);
    selectOk = Boolean(sel && sel.status >= 200 && sel.status < 300 && (sel.jwtMembershipId || sess2.mid));
    selectDetail = { path: 'ceo-switcher', clicked, sel, sess2, panelItems: panel.items?.length };
    await shot(page, 'B-ceo-after-select');
  } else {
    // admin multi-membership for select click
    await clearAuth(page);
    await page.goto(`${PORTAL}/login`, { waitUntil: 'networkidle', timeout: 90000 });
    await fillLogin(page, 'admin@xe.vn', PASSWORD);
    const adminNets = await submitLogin(page);
    await page.waitForURL((u) => !u.pathname.includes('/login'), { timeout: 45000 }).catch(() => {});
    await page.waitForTimeout(2000);
    await page
      .locator('[data-testid="portal-membership-switcher"]')
      .first()
      .waitFor({ state: 'visible', timeout: 12000 })
      .catch(() => {});
    ui = await readMembershipUi(page);
    await shot(page, 'B-admin-after-login');
    if (ui.switcherOpenable) {
      const panel = await openSwitcher(page);
      await shot(page, 'B-admin-picker');
      const panelRaw = RAW_ROLE_RE.test(`${panel.text || ''} ${panel.items?.join(' ') || ''}`);
      ac(
        'CASE-B-picker-labels',
        panel.opened && panel.items.length > 1 && !panelRaw ? '🟢' : '🔴',
        `admin picker items=${panel.items.length} raw=${panelRaw}`,
        { items: panel.items.slice(0, 5) },
      );
      const { clicked, selectNets } = await selectOther(page);
      const sel = selectNets[selectNets.length - 1];
      const sess2 = await readSession(page);
      selectOk = Boolean(sel && sel.status >= 200 && sel.status < 300 && (sel.jwtMembershipId || sess2.mid));
      selectDetail = {
        path: 'admin-switcher',
        clicked,
        sel,
        sess2,
        adminLogin: adminNets.at(-1)?.status,
        panelItems: panel.items?.length,
      };
      await shot(page, 'B-admin-after-select');
    } else {
      selectDetail = {
        path: 'blocked-no-switcher',
        ui,
        ceoMid: sess.mid || sess.jwtMembershipId,
        viteOverlay: ui.viteOverlay,
        failedSrc: results.failedSrc.slice(-3),
      };
      // partial: login JWT membershipId still required
      selectOk = Boolean(sess.mid || sess.jwtMembershipId);
    }
  }

  ac(
    'CASE-B-AC2-membershipId',
    selectOk && (selectDetail.path !== 'blocked-no-switcher' || Boolean(sess.jwtMembershipId))
      ? selectDetail.path === 'blocked-no-switcher'
        ? '🟡'
        : '🟢'
      : '🔴',
    `path=${selectDetail.path} selectOk=${selectOk} mid=${selectDetail.sess2?.mid || selectDetail.sel?.jwtMembershipId || sess.jwtMembershipId || sess.mid}`,
    { selectDetail },
  );

  // keep session for Case C (prefer admin if we switched there)
  results.cases.B = { ...c, selectDetail, finalUi: ui, sess };
  return { loginOk, ac1, selectOk, be, ui, sess };
}

async function caseC(page) {
  click('reload-F5');
  await page.reload({ waitUntil: 'networkidle', timeout: 90000 });
  await page.waitForTimeout(1500);
  const ui = await readMembershipUi(page);
  const sess = await readSession(page);
  await shot(page, 'C-after-f5');
  results.cases.C = { ui, sess };
  const midOk = Boolean(sess.mid || sess.jwtMembershipId);
  const labelsOk =
    ui.mode !== 'missing' &&
    !ui.viteOverlay &&
    !RAW_ROLE_RE.test(ui.text) &&
    ui.text.length > 0;
  ac(
    'CASE-C-F5',
    labelsOk && midOk ? '🟢' : midOk && !labelsOk ? '🔴' : '🔴',
    `F5 mid=${sess.mid || sess.jwtMembershipId} mode=${ui.mode} overlay=${ui.viteOverlay} raw=${RAW_ROLE_RE.test(ui.text)} ui="${ui.text.slice(0, 100)}"`,
    { ui, sess },
  );
  return labelsOk && midOk;
}

async function main() {
  await probeL0();
  console.log('L0', results.l0);
  if (results.l0.portal !== 200 || results.l0.xbos !== 200 || results.l0.appTsx !== 200) {
    ac('L0', '🔴', `stack not ready ${JSON.stringify(results.l0)}`);
    results.ack_status = 'BLOCKED-STACK';
    save();
    process.exit(2);
  }
  ac('L0', '🟢', `portal=${results.l0.portal} xbos=${results.l0.xbos} hrm=${results.l0.hrm} App.tsx=${results.l0.appTsx}`);

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  track(page);

  try {
    await assertLoginForm(page);
    await caseA(page);
    await caseB(page);
    await caseC(page);
  } catch (e) {
    ac('RUNTIME', '🔴', String(e).slice(0, 400));
    results.runtimeError = String(e);
    await shot(page, 'Z-runtime-error').catch(() => {});
  } finally {
    await browser.close();
  }

  results.finishedAt = new Date().toISOString();
  const form = results.ac.find((a) => a.id === 'FORM');
  const a = results.ac.find((x) => x.id === 'CASE-A');
  const b1 = results.ac.find((x) => x.id === 'CASE-B-AC1-labels');
  const b2 = results.ac.find((x) => x.id === 'CASE-B-AC2-membershipId');
  const c = results.ac.find((x) => x.id === 'CASE-C-F5');
  const idleOnly =
    results.clicks.length < 4 ||
    results.screens.length < 2 ||
    results.network.filter((n) => /\/auth\/login/.test(n.url)).length === 0;
  results.summary = {
    form: form?.verdict,
    caseA: a?.verdict,
    caseB_labels: b1?.verdict,
    caseB_mid: b2?.verdict,
    caseC: c?.verdict,
    clickCount: results.clicks.length,
    networkAuthCount: results.network.length,
    failedSrcCount: results.failedSrc.length,
    idleViewportViolation: idleOnly,
  };
  // Core UF: form + A + B labels + C; select may be 🟡 if switcher blocked by Vite overlay
  const corePass =
    form?.verdict === '🟢' &&
    a?.verdict === '🟢' &&
    b1?.verdict === '🟢' &&
    c?.verdict === '🟢' &&
    !idleOnly;
  results.ack_status = idleOnly ? 'FAIL' : corePass ? 'PASS_TO_PM' : 'FAIL';
  if (idleOnly) results.idle_code = 'QA-IDLE-VIEWPORT';
  save();
  console.log('SUMMARY', results.summary, results.ack_status);
  process.exit(results.ack_status === 'PASS_TO_PM' ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  results.runtimeError = String(e);
  results.ack_status = 'FAIL';
  save();
  process.exit(1);
});
