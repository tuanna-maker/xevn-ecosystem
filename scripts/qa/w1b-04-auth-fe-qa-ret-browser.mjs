/**
 * W1-B-04-AUTH-FE-QA-RET — Browser U65 FR-UC-M01 portal auth retest
 * Primary persona: ceo@xe.vn (mission)
 * Select-membership click: admin@xe.vn when ceo has single membership (switcher hidden)
 * U65: zero-seed · no API inject as UF PASS · UI login click path
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
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-w1b-04-auth-fe-qa-ret-runtime.json');
const SCREEN_DIR = resolve(ROOT, 'docs/qa/evidence/screens/w1b-04-auth-fe-qa-ret');

const RAW_ROLE_RE = /\b(group_ceo|subsidiary_ceo|HRBP_MANAGER|hrbp|roleCode)\b/i;

const results = {
  work_item_id: 'W1-B-04-AUTH-FE-QA-RET',
  startedAt: new Date().toISOString(),
  env: { PORTAL, u65: 'zero-seed' },
  l0: {},
  ac: [],
  journeys: [],
  network: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
};

function save() {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(results, null, 2));
}

function recordAc(id, verdict, detail, extra = {}) {
  const row = { id, verdict, detail, at: new Date().toISOString(), ...extra };
  results.ac.push(row);
  console.log(`${verdict}  ${id}  ${detail.slice(0, 260)}`);
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
  page.on('response', async (res) => {
    try {
      const u = res.url();
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
          /* body already consumed / non-json */
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
      results.consoleErrors.push(t.slice(0, 240));
    }
  });
  page.on('pageerror', (err) => {
    results.pageErrors.push(String(err).slice(0, 240));
  });
}

async function probeL0() {
  for (const [name, url] of [
    ['hrm', 'http://127.0.0.1:28001/api/hrm'],
    ['xbos', 'http://127.0.0.1:28002/api/xbos'],
    ['portal', PORTAL],
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
  await page.goto(`${PORTAL}/login`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.evaluate(() => {
    for (const store of [localStorage, sessionStorage]) store.clear();
  });
}

async function uiLogin(page, email) {
  await page.goto(`${PORTAL}/login`, { waitUntil: 'networkidle', timeout: 90000 });
  const emailInput = page.locator('input[type="email"]').first();
  const passInput = page.locator('input[type="password"]').first();
  await emailInput.waitFor({ state: 'visible', timeout: 20000 });
  await emailInput.click({ clickCount: 3 });
  await emailInput.fill(email);
  await passInput.click({ clickCount: 3 });
  await passInput.fill(PASSWORD);
  const before = results.network.length;
  await page.locator('button[type="submit"]').first().click();
  await page.waitForURL((u) => !u.pathname.includes('/login'), { timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(1500);
  const loginNets = results.network.slice(before).filter((n) => /\/auth\/login/.test(n.url));
  return { loginNets, before };
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
    return {
      mode: switcher ? 'switcher' : staticEl ? 'static' : 'missing',
      text,
      switcherOpenable: Boolean(switcher),
    };
  });
}

async function openSwitcherAndCollect(page) {
  const btn = page.locator('[data-testid="portal-membership-switcher"]');
  if ((await btn.count()) === 0) return { opened: false, items: [], panelText: '' };
  await btn.click();
  await page.waitForTimeout(500);
  const panel = await page.evaluate(() => {
    const root = document.querySelector('[data-testid="portal-membership-switcher"]')?.parentElement;
    const dropdown = root?.querySelector('.absolute');
    const text = (dropdown?.textContent || '').replace(/\s+/g, ' ').trim();
    const items = Array.from(dropdown?.querySelectorAll('button') || [])
      .map((b) => (b.textContent || '').replace(/\s+/g, ' ').trim())
      .filter(Boolean);
    return { text, items };
  });
  return { opened: true, ...panel };
}

async function selectOtherMembership(page) {
  const before = results.network.length;
  const clicked = await page.evaluate(() => {
    const root = document.querySelector('[data-testid="portal-membership-switcher"]')?.parentElement;
    const dropdown = root?.querySelector('.absolute');
    const buttons = Array.from(dropdown?.querySelectorAll('button') || []);
    // skip header-ish; pick first non-selected (no check icon container with current border accent often first selected)
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

async function journeyCeo(page) {
  const j = { persona: 'ceo@xe.vn', steps: [] };
  await clearAuth(page);

  const { loginNets } = await uiLogin(page, 'ceo@xe.vn');
  const loginOk = loginNets.some((n) => n.status >= 200 && n.status < 300);
  const loginBody = loginNets[loginNets.length - 1];
  j.steps.push({ step: 'UI login', loginOk, status: loginBody?.status, code: loginBody?.code });
  await shot(page, '01-ceo-after-login');

  // wait membership chip
  await page
    .locator('[data-testid="portal-membership-switcher"], [data-testid="portal-membership-static"]')
    .first()
    .waitFor({ state: 'visible', timeout: 30000 })
    .catch(() => {});

  const ui = await readMembershipUi(page);
  const sess = await readSession(page);
  j.steps.push({ step: 'membership UI', ui, sess });

  const be = (loginBody?.memberships || [])[0] || {};
  const hasBeLabels = Boolean(be.tenant_label && be.company_label && be.role_label);
  const showsRaw = RAW_ROLE_RE.test(ui.text);
  const showsRoleLabel = be.role_label ? ui.text.includes(be.role_label) : false;
  const showsTenantLabel = be.tenant_label ? ui.text.includes(be.tenant_label) : false;
  const showsCompanyLabel = be.company_label ? ui.text.includes(be.company_label) : false;

  recordAc(
    'AC1',
    loginOk && hasBeLabels && !showsRaw && (showsRoleLabel || showsTenantLabel),
    `login ${loginBody?.status}/${loginBody?.code}; UI mode=${ui.mode}; shows role_label=${showsRoleLabel} tenant_label=${showsTenantLabel} company_label=${showsCompanyLabel}; rawRole=${showsRaw}; ui="${ui.text.slice(0, 120)}"`,
    { be, ui },
  );

  // single membership: switcher hidden — membershipId from login JWT/session
  const midOk = Boolean(sess.mid || sess.jwtMembershipId);
  j.steps.push({ step: 'membershipId after login', midOk, sess });

  let selectPath = { mode: 'n/a-single-membership', selectNets: [] };
  if (ui.switcherOpenable) {
    const panel = await openSwitcherAndCollect(page);
    await shot(page, '02-ceo-picker-open');
    const panelRaw = RAW_ROLE_RE.test(panel.panelText || panel.items.join(' '));
    recordAc(
      'AC1b-picker',
      panel.opened && !panelRaw,
      `picker opened items=${panel.items.length} rawRole=${panelRaw}`,
      { panel },
    );
    selectPath = await selectOtherMembership(page);
  } else {
    recordAc(
      'AC1b-picker',
      '🟡',
      'ceo@xe.vn single membership — portal-membership-static (switcher hidden); labels asserted on static chip',
      { ui },
    );
  }

  // F5
  await page.reload({ waitUntil: 'networkidle', timeout: 90000 });
  await page.waitForTimeout(1500);
  const uiAfter = await readMembershipUi(page);
  const sessAfter = await readSession(page);
  await shot(page, '03-ceo-after-f5');
  const f5Labels =
    !RAW_ROLE_RE.test(uiAfter.text) &&
    (showsRoleLabel ? uiAfter.text.includes(be.role_label) : uiAfter.text.length > 0) &&
    Boolean(sessAfter.mid || sessAfter.jwtMembershipId);
  recordAc(
    'AC3-F5',
    f5Labels ? '🟢' : '🔴',
    `F5 labels persist raw=${RAW_ROLE_RE.test(uiAfter.text)} mid=${sessAfter.mid || sessAfter.jwtMembershipId}; ui="${uiAfter.text.slice(0, 120)}"`,
    { uiAfter, sessAfter },
  );

  j.selectPath = selectPath;
  j.loginMembershipId = sess.jwtMembershipId || sess.mid;
  results.journeys.push(j);
  return { loginOk, midOk, loginBody, selectPath, ui };
}

async function journeyAdminSelect(page) {
  const j = { persona: 'admin@xe.vn', purpose: 'AC2 select-membership UI (multi-membership)', steps: [] };
  await clearAuth(page);

  const { loginNets } = await uiLogin(page, 'admin@xe.vn');
  const loginOk = loginNets.some((n) => n.status >= 200 && n.status < 300);
  j.steps.push({ step: 'login', loginOk, status: loginNets.at(-1)?.status });

  await page
    .locator('[data-testid="portal-membership-switcher"]')
    .first()
    .waitFor({ state: 'visible', timeout: 30000 })
    .catch(() => {});

  const ui = await readMembershipUi(page);
  const panel = await openSwitcherAndCollect(page);
  await shot(page, '04-admin-picker-open');
  const panelText = `${panel.panelText || ''} ${panel.items.join(' ')}`;
  const panelRaw = RAW_ROLE_RE.test(panelText);
  j.steps.push({ step: 'picker', ui, itemCount: panel.items.length, panelRaw, sample: panel.items.slice(0, 3) });

  recordAc(
    'AC1-admin-picker',
    panel.opened && panel.items.length > 1 && !panelRaw ? '🟢' : '🔴',
    `admin picker items=${panel.items.length} rawRole=${panelRaw}`,
    { items: panel.items.slice(0, 5) },
  );

  const { clicked, selectNets } = await selectOtherMembership(page);
  await shot(page, '05-admin-after-select');
  const sel = selectNets[selectNets.length - 1];
  const sess = await readSession(page);
  const selectOk =
    Boolean(sel && sel.status >= 200 && sel.status < 300) &&
    Boolean(sel.jwtMembershipId || sess.mid || sess.jwtMembershipId);

  recordAc(
    'AC2-select-membership',
    selectOk ? '🟢' : '🔴',
    `clicked="${(clicked || '').slice(0, 80)}" select status=${sel?.status} code=${sel?.code} jwtMid=${sel?.jwtMembershipId || sess.jwtMembershipId} storageMid=${sess.mid}`,
    { sel, sess, clicked },
  );

  await page.reload({ waitUntil: 'networkidle', timeout: 90000 });
  await page.waitForTimeout(1500);
  const uiAfter = await readMembershipUi(page);
  const sessAfter = await readSession(page);
  await shot(page, '06-admin-after-f5');
  recordAc(
    'AC3-admin-F5',
    !RAW_ROLE_RE.test(uiAfter.text) && Boolean(sessAfter.mid || sessAfter.jwtMembershipId)
      ? '🟢'
      : '🔴',
    `admin F5 mid=${sessAfter.mid || sessAfter.jwtMembershipId} ui="${uiAfter.text.slice(0, 120)}"`,
    { uiAfter, sessAfter },
  );

  results.journeys.push(j);
  return { selectOk, sel };
}

function normalizeVerdict(v) {
  if (v === true || v === '🟢') return '🟢';
  if (v === false || v === '🔴') return '🔴';
  return v;
}

async function main() {
  await probeL0();
  console.log('L0', results.l0);
  if (results.l0.portal !== 200 || results.l0.xbos !== 200) {
    recordAc('L0', '🔴', `stack not ready ${JSON.stringify(results.l0)}`);
    results.ack_status = 'BLOCKED-STACK';
    save();
    process.exit(2);
  }
  recordAc('L0', '🟢', `portal=${results.l0.portal} xbos=${results.l0.xbos} hrm=${results.l0.hrm}`);

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  track(page);

  try {
    const ceo = await journeyCeo(page);
    // login membershipId for ceo (AC2 partial when single membership)
    recordAc(
      'AC2-ceo-membershipId-login',
      ceo.midOk ? '🟢' : '🔴',
      `ceo login JWT/session membershipId present=${ceo.midOk} (select UI N/A — 1 membership)`,
    );

    await journeyAdminSelect(page);
  } catch (e) {
    recordAc('RUNTIME', '🔴', String(e).slice(0, 400));
    results.runtimeError = String(e);
  } finally {
    await browser.close();
  }

  results.finishedAt = new Date().toISOString();
  results.ac = results.ac.map((r) => ({ ...r, verdict: normalizeVerdict(r.verdict) }));
  const reds = results.ac.filter((a) => a.verdict === '🔴');
  const ac1 = results.ac.find((a) => a.id === 'AC1');
  const ac2 = results.ac.find((a) => a.id === 'AC2-select-membership');
  const ac3 = results.ac.find((a) => a.id === 'AC3-F5');
  const corePass =
    normalizeVerdict(ac1?.verdict) === '🟢' &&
    normalizeVerdict(ac2?.verdict) === '🟢' &&
    normalizeVerdict(ac3?.verdict) === '🟢' &&
    reds.filter((r) => !['AC1b-picker'].includes(r.id)).length === 0;

  // AC1 boolean may have been recorded as true/false before normalize in push — already remapped
  const ac1Pass = normalizeVerdict(ac1?.verdict) === '🟢' || ac1?.verdict === true;
  results.summary = {
    ac1: normalizeVerdict(ac1?.verdict),
    ac2_select: normalizeVerdict(ac2?.verdict),
    ac3_f5: normalizeVerdict(ac3?.verdict),
    redCount: reds.length,
    corePass: ac1Pass && normalizeVerdict(ac2?.verdict) === '🟢' && normalizeVerdict(ac3?.verdict) === '🟢',
  };
  results.ack_status = results.summary.corePass ? 'PASS_TO_PM' : 'FAIL';
  save();
  console.log('SUMMARY', results.summary, results.ack_status);
  process.exit(results.summary.corePass ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  results.runtimeError = String(e);
  results.ack_status = 'FAIL';
  save();
  process.exit(1);
});
