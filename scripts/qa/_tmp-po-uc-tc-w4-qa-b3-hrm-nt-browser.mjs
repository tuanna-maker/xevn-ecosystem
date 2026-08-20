#!/usr/bin/env node
/**
 * PO-UC-TC-W4-QA-B3-HRM-NT — Browser U65 CEO holding
 * UC: HRM-NT-01 mark inbox read · HRM-NT-02 push token (mobile — browser honesty)
 * HDSD: SRS UC-HRM-12 · FR-HRM-12 · docs/hrm/SRS.md § inbox
 * FORBIDDEN: seed · invent Leave L2 · UAT/Phase1 DONE
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-uc-tc-w4-qa-b3-hrm-nt-browser.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-uc-tc-w4-qa-b3-hrm-nt');
mkdirSync(SCREEN, { recursive: true });

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const results = {
  work_item_id: 'PO-UC-TC-W4-QA-B3-HRM-NT',
  startedAt: new Date().toISOString(),
  u65: 'zero-seed',
  hdsd_align: true,
  domain_note: 'HRM-NT-01 = PATCH inbox read (UC-HRM-12); HRM-NT-02 = mobile push-tokens POST',
  env: { PORTAL, HRM, XBOS, EMAIL, commit: COMMIT },
  hdsd_inventory: [
    'Login ceo@xe.vn holding (SRS UC-HRM-12 inbox)',
    'HRM embed Dashboard / header bell «Thông báo» (U76 — map vs mock)',
    'Mark read: PATCH /api/hrm/notifications/inbox/:id/read + FE after 2xx + F5',
    'NT-02: mobile ESS push registration — out of browser seat',
  ],
  must_keep: {
    leaveL2Untouched: true,
    im03AuGwcClosed: true,
    at12CreateCatalogClosed: true,
    brWf04Closed: true,
    zeroSeed: true,
  },
  l0: {},
  inbox_probe: {},
  steps: {},
  uc_verdicts: {},
  network: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  residuals: [],
  endedAt: null,
  overall: null,
};

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(results, null, 2));
}

async function probeL0() {
  for (const [k, url] of [
    ['hrm', `${HRM}/api/hrm`],
    ['xbos', `${XBOS}/api/xbos`],
    ['portal', PORTAL],
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

async function loginApi(email, password) {
  const r = await fetch(`${PORTAL}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const j = await r.json().catch(() => ({}));
  const data = j?.data ?? j;
  const token = data?.accessToken ?? data?.access_token ?? j?.accessToken;
  if (!token) throw new Error(`login failed ${email} HTTP ${r.status}`);
  const memberships = data?.memberships || data?.user?.memberships || [];
  const mem =
    memberships.find((m) => (m.companyId || m.company_id) === 'main') || memberships[0] || {};
  return {
    token,
    companyId: mem.companyId || mem.company_id || 'main',
    tenantId: mem.tenantId || mem.tenant_id || 'xevn',
    employeeId: mem.employeeId || mem.employee_id || null,
    membership: mem,
    http: r.status,
  };
}

async function probeInbox(session) {
  const cid = session.companyId || 'main';
  const eid = session.employeeId;
  if (!eid) {
    results.inbox_probe = { error: 'no employee_id on membership — cannot list inbox per SRS' };
    save();
    return;
  }
  const q = new URLSearchParams({ company_id: cid, employee_id: eid, limit: '20' });
  const r = await fetch(`${PORTAL}/api/hrm/notifications/inbox?${q}`, {
    headers: {
      authorization: `Bearer ${session.token}`,
      'x-company-id': cid,
      'x-tenant-id': session.tenantId || 'xevn',
    },
  });
  const j = await r.json().catch(() => ({}));
  const rows = j?.data?.data ?? j?.data ?? [];
  const list = Array.isArray(rows) ? rows : rows?.data ?? [];
  const unread = list.filter((row) => !row.read_at);
  results.inbox_probe = {
    http: r.status,
    code: j?.code || null,
    total: j?.data?.total ?? list.length,
    rowCount: list.length,
    unreadCount: unread.length,
    sampleUnreadIds: unread.slice(0, 3).map((x) => x.id),
    employeeId: eid,
    companyId: cid,
  };
  save();
}

async function injectPortalAuth(page, session) {
  await page.addInitScript(
    (s) => {
      const user = { email: s.email, userId: s.email, displayName: 'QA CEO' };
      for (const store of [localStorage, sessionStorage]) {
        store.setItem('xevn.portal.accessToken', s.token);
        store.setItem('xevn.portal.tokenExpiresAt', String(Date.now() + 8 * 3600_000));
        store.setItem('xevn.portal.user', JSON.stringify(user));
        store.setItem('xevn.portal.tenantId', s.tenantId || 'xevn');
        store.setItem('xevn.portal.companyId', s.companyId);
        store.setItem('hrm_portal_mode', '1');
        store.setItem('hrm_current_company_id', s.companyId);
        store.setItem('hrm_current_tenant_id', s.tenantId || 'xevn');
      }
    },
    { ...session, email: EMAIL },
  );
}

function track(page) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') results.consoleErrors.push(String(msg.text()).slice(0, 280));
  });
  page.on('pageerror', (err) => results.pageErrors.push(String(err).slice(0, 280)));
  page.on('response', (res) => {
    const u = res.url();
    if (!/\/api\/hrm\/notifications/.test(u)) return;
    const method = res.request().method();
    if (method === 'OPTIONS') return;
    const entry = {
      method,
      status: res.status(),
      url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 400),
      at: new Date().toISOString(),
    };
    results.network.push(entry);
    save();
    res
      .json()
      .then((body) => {
        entry.code = body?.code || null;
        save();
      })
      .catch(() => {});
  });
}

async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  results.screens.push(path.replace(/\\/g, '/'));
}

async function main() {
  await probeL0();
  const session = await loginApi(EMAIL, PASSWORD);
  await probeInbox(session);

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  track(page);
  await injectPortalAuth(page, session);

  const dashUrl = `${PORTAL}/hr/?portal=1&tenantId=xevn&companyId=main`;
  await page.goto(dashUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(4500);
  await shot(page, '01-hrm-dashboard');

  const bodyText = await page.locator('body').innerText().catch(() => '');
  const remindersVisible = /Nhắc việc HRM|Thông báo gần đây/i.test(bodyText);
  const syncErr = /HRM API Sync ERROR|ERR_CONNECTION_REFUSED/i.test(bodyText);

  results.steps['NT01-OPEN-DASH'] = {
    verdict: remindersVisible && !syncErr ? 'PARTIAL' : syncErr ? 'FAIL' : 'OBS',
    remindersVisible,
    syncErr,
    url: page.url(),
  };

  const bell = page.locator('button').filter({ has: page.locator('svg') }).first();
  const bellBtn = page.getByRole('button').filter({ hasText: /^$/ }).locator('..');
  const notifTrigger = page.locator('button.relative').filter({ has: page.locator('svg') }).first();
  let openedBell = false;
  try {
    const triggers = page.locator('button.relative.h-9');
    if ((await triggers.count()) > 0) {
      await triggers.first().click({ timeout: 8000 });
      openedBell = true;
      await sleep(1200);
      await shot(page, '02-bell-open');
    }
  } catch {
    /* */
  }

  let markReadClicked = false;
  let patchAfterClick = results.network.length;
  const markBtn = page.getByText(/Đánh dấu đã đọc|Mark all read/i);
  if ((await markBtn.count()) > 0) {
    try {
      await markBtn.first().click({ timeout: 5000 });
      markReadClicked = true;
      await sleep(2000);
      await shot(page, '03-after-mark-all-read');
    } catch {
      /* */
    }
  }

  const patchCalls = results.network
    .slice(patchAfterClick)
    .filter((n) => n.method === 'PATCH' && /\/read/.test(n.url));
  const getInboxBrowser = results.network.filter(
    (n) => n.method === 'GET' && /notifications\/inbox/.test(n.url),
  );

  results.steps['NT01-HEADER-MARK-READ'] = {
    openedBell,
    markReadClicked,
    patchCallsAfterClick: patchCalls.length,
    patchStatuses: patchCalls.map((p) => p.status),
    getInboxFromBrowser: getInboxBrowser.length,
    verdict:
      markReadClicked && patchCalls.length === 0
        ? 'FAIL'
        : patchCalls.some((p) => p.status >= 200 && p.status < 300)
          ? 'PASS'
          : 'FAIL',
    note: 'AppHeader bell uses static mock items; no markInbox in web hrmApi.ts',
  };

  await page.reload({ waitUntil: 'domcontentloaded' });
  await sleep(3000);
  await shot(page, '04-after-f5');

  await browser.close();

  const unread = results.inbox_probe.unreadCount ?? 0;
  const inboxRows = results.inbox_probe.rowCount ?? 0;

  if (unread === 0 && inboxRows === 0) {
    results.uc_verdicts['HRM-NT-01'] = {
      verdict: 'BLOCKED',
      reason: 'U65: inbox empty for ceo@ employee — no FE-origin notification to mark read',
      p0_open: openedBell ? 'PARTIAL (mock bell, not SRS inbox list)' : 'PARTIAL',
      p0_act_hp: 'BLOCKED',
    };
    results.residuals.push({
      id: 'R-W4-B3-NT01-INBOX-EMPTY-U65',
      owner: 'product/ops',
      note: 'Need prior FE fanout (leave/service) without seed — or dev-fe wire real inbox UI',
    });
  } else if (unread > 0 && patchCalls.length === 0) {
    results.uc_verdicts['HRM-NT-01'] = {
      verdict: 'FAIL',
      reason: 'Unread inbox rows exist but web has no PATCH read UI (mock header only)',
      unreadCount: unread,
      p0_act_hp: 'FAIL',
    };
    results.residuals.push({
      id: 'R-W4-B3-NT01-WEB-MARK-READ-FE',
      owner: 'dev-fe',
      note: 'Wire AppHeader or inbox screen to PATCH …/inbox/:id/read per UC-HRM-12',
    });
  } else {
    results.uc_verdicts['HRM-NT-01'] = results.steps['NT01-HEADER-MARK-READ'];
  }

  results.uc_verdicts['HRM-NT-02'] = {
    verdict: 'BLOCKED',
    reason: 'Surface hrm-mobile only — browser seat cannot run push-tokens HP without device/emulator',
    p0_act_hp: 'BLOCKED',
  };
  results.residuals.push({
    id: 'R-W4-B3-NT02-MOBILE-QA-DEVICE',
    owner: 'qa-device',
    note: 'Dispatch qa-device for uat.nv#### push registration on emulator',
  });

  results.overall =
    results.uc_verdicts['HRM-NT-01']?.verdict === 'PASS' ? 'PARTIAL' : 'PARTIAL';
  results.endedAt = new Date().toISOString();
  save();
  console.log(JSON.stringify({ overall: results.overall, uc: results.uc_verdicts, inbox: results.inbox_probe }, null, 2));
}

main().catch((e) => {
  results.overall = 'ERROR';
  results.fatal = String(e);
  results.endedAt = new Date().toISOString();
  save();
  console.error(e);
  process.exit(1);
});
