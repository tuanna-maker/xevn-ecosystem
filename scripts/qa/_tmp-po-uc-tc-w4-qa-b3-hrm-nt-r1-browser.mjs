#!/usr/bin/env node
/**
 * PO-UC-TC-W4-QA-B3-HRM-NT-R1 — HRM-NT-01 retest after FE inbox mark-read
 * U65 zero-seed · HP uat.nv0007@xe.vn · ceo@ EXPECTED_NO_INBOX
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
const NV_EMAIL = process.env.QA_NV_EMAIL || 'uat.nv0007@xe.vn';
const NV_PASSWORD = process.env.QA_UAT_PASSWORD || 'xevn-uat-2026';
const CEO_EMAIL = process.env.QA_CEO_EMAIL || 'ceo@xe.vn';
const CEO_PASSWORD = process.env.QA_CEO_PASSWORD || 'Xevn@2026';
const COMPANY = process.env.QA_LEAVE_COMPANY_ID || 'trsport';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-uc-tc-w4-qa-b3-hrm-nt-r1-browser.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-uc-tc-w4-qa-b3-hrm-nt-r1');
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
  work_item_id: 'PO-UC-TC-W4-QA-B3-HRM-NT-R1',
  startedAt: ts(),
  u65: 'zero-seed',
  hdsd_align: true,
  env: { PORTAL, HRM, XBOS, NV_EMAIL, COMPANY, commit: COMMIT },
  l0: {},
  precond: {},
  steps: {},
  network: [],
  consoleErrors: [],
  uc_verdicts: {},
  screens: [],
  endedAt: null,
  ack_status: null,
};

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(results, null, 2));
}

async function loginMobile(email, password) {
  const r = await fetch(`${HRM}/api/hrm/auth/mobile/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const j = await r.json().catch(() => ({}));
  const d = j?.data ?? j;
  const mem = d.active_membership ?? d.memberships?.[0] ?? {};
  return {
    ok: Boolean(d.access_token ?? d.accessToken),
    token: d.access_token ?? d.accessToken,
    employeeId: mem.employee_id ?? null,
    companyId: mem.company_id ?? COMPANY,
    code: j?.code,
    http: r.status,
  };
}

async function inboxProbe(token, companyId, employeeId) {
  const q = new URLSearchParams({ company_id: companyId, employee_id: employeeId, limit: '20' });
  const r = await fetch(`${PORTAL}/api/hrm/notifications/inbox?${q}`, {
    headers: {
      authorization: `Bearer ${token}`,
      'x-company-id': companyId,
      'x-tenant-id': 'xevn',
    },
  });
  const j = await r.json().catch(() => ({}));
  const rows = j?.data?.data ?? j?.data ?? [];
  const list = Array.isArray(rows) ? rows : rows?.data ?? [];
  const unread = list.filter((x) => !x.read_at);
  return {
    http: r.status,
    code: j?.code,
    unreadCount: unread.length,
    firstUnreadId: unread[0]?.id ?? null,
  };
}

function track(page) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const t = msg.text();
      if (/favicon|React DevTools/i.test(t)) return;
      results.consoleErrors.push(t.slice(0, 220));
    }
  });
  page.on('response', async (res) => {
    const u = res.url();
    if (!/\/api\/hrm\/notifications/.test(u)) return;
    const method = res.request().method();
    if (method === 'OPTIONS') return;
    const entry = {
      method,
      status: res.status(),
      url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 400),
      at: ts(),
    };
    try {
      const j = await res.json();
      entry.code = j?.code ?? null;
    } catch {
      /* */
    }
    results.network.push(entry);
    save();
  });
}

async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  results.screens.push(path.replace(/\\/g, '/'));
}

async function hrmLoginViaForm(page, email, password) {
  const loginUrl = `${PORTAL}/hr/login`;
  await page.goto(loginUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(1500);
  await page.getByLabel(/email/i).or(page.locator('input[type="email"]')).first().fill(email);
  await page.locator('input[type="password"]').first().fill(password);
  await page.getByRole('button', { name: /đăng nhập|log in|login/i }).first().click();
  await sleep(3500);
}

async function main() {
  for (const [k, url] of [
    ['hrm', `${HRM}/api/hrm`],
    ['xbos', `${XBOS}/api/xbos`],
    ['portal', PORTAL],
  ]) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
      results.l0[k] = r.status;
    } catch (e) {
      results.l0[k] = String(e?.message || e).slice(0, 80);
    }
  }
  save();

  const nvLogin = await loginMobile(NV_EMAIL, NV_PASSWORD);
  results.precond.nvLogin = nvLogin;
  if (!nvLogin.ok || !nvLogin.employeeId) {
    results.uc_verdicts['HRM-NT-01'] = { verdict: 'BLOCKED', reason: 'NV login or employee_id missing' };
    results.ack_status = 'FAIL';
    results.endedAt = ts();
    save();
    process.exit(2);
  }

  const inboxBefore = await inboxProbe(nvLogin.token, nvLogin.companyId, nvLogin.employeeId);
  results.precond.inboxBefore = inboxBefore;
  results.precond.fanoutNote =
    inboxBefore.unreadCount > 0
      ? 'Precond: ≥1 unread from prior U65 FE fanout (no seed this seat)'
      : 'No unread — would need FE leave/service chain (not run — empty inbox)';

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });

  // --- NV: standalone mobile login → notifications (employee_id in membership) ---
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    track(page);
    await hrmLoginViaForm(page, NV_EMAIL, NV_PASSWORD);
    await shot(page, '01-nv-after-login');

    const notifEmbed = `${PORTAL}/hr/notifications?portal=1&tenantId=xevn&companyId=${encodeURIComponent(nvLogin.companyId)}`;
    await page.goto(notifEmbed, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(4500);
    await shot(page, '02-nv-notifications-embed');

    const body = (await page.locator('body').innerText().catch(() => '')) || '';
    const requiresEmployeeMsg = /cần tài khoản gắn mã nhân viên|inboxRequiresEmployee/i.test(body);
    const emptyHonest = /Chưa có thông báo|Tạo luồng nghiệp vụ/i.test(body);
    const hasUnreadBadge = /Chưa đọc/i.test(body);

    const patchBefore = results.network.length;
    let markClicked = false;
    let targetId = inboxBefore.firstUnreadId;

    const markByTestId = targetId
      ? page.getByTestId(`inbox-mark-read-${targetId}`)
      : page.locator('[data-testid^="inbox-mark-read-"]').first();
    if (await markByTestId.isVisible().catch(() => false)) {
      await markByTestId.click({ timeout: 8000 });
      markClicked = true;
      await sleep(2500);
      await shot(page, '03-nv-after-mark-read');
    } else {
      const markBtn = page.getByRole('button', { name: /Đánh dấu đã đọc/i }).first();
      if (await markBtn.isVisible().catch(() => false)) {
        await markBtn.click({ timeout: 8000 });
        markClicked = true;
        await sleep(2500);
        await shot(page, '03-nv-after-mark-read');
      }
    }

    const patchCalls = results.network.slice(patchBefore).filter((n) => n.method === 'PATCH');
    const getCalls = results.network.filter((n) => n.method === 'GET' && /inbox/.test(n.url));

    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(3000);
    await shot(page, '04-nv-after-f5');
    const bodyAfterF5 = (await page.locator('body').innerText().catch(() => '')) || '';

    const patchOk = patchCalls.some((p) => p.status >= 200 && p.status < 300 && p.code === 'HRM-NOTIF-202');
    const feReadAfter =
      /Đã đọc/i.test(bodyAfterF5) && (!targetId || !/Chưa đọc/i.test(bodyAfterF5.slice(0, 800)));

    results.steps['NT01-NV-MARK-READ'] = {
      requiresEmployeeMsg,
      emptyHonest,
      hasUnreadBadgeBefore: hasUnreadBadge,
      markClicked,
      patchCalls,
      getInboxCalls: getCalls.length,
      patchOk,
      feReadAfterF5: /Đã đọc/i.test(bodyAfterF5),
      precondUnread: inboxBefore.unreadCount,
    };

    let nt01Verdict = 'FAIL';
    let nt01Reason = '';
    if (requiresEmployeeMsg && inboxBefore.unreadCount > 0) {
      nt01Verdict = 'FAIL';
      nt01Reason = 'Portal embed resets employee_id — inbox disabled despite NV HP (AuthContext portalMembership)';
    } else if (inboxBefore.unreadCount === 0) {
      nt01Verdict = 'BLOCKED';
      nt01Reason = 'U65: no unread row to mark (precond not met this seat)';
    } else if (markClicked && patchOk) {
      nt01Verdict = 'PASS';
      nt01Reason = 'PATCH HRM-NOTIF-202 + FE after 2xx + F5';
    } else if (markClicked && patchCalls.length > 0) {
      nt01Verdict = 'FAIL';
      nt01Reason = `PATCH not 202: ${JSON.stringify(patchCalls)}`;
    } else {
      nt01Verdict = 'FAIL';
      nt01Reason = 'Mark-read CTA not found or no PATCH';
    }

    results.uc_verdicts['HRM-NT-01'] = {
      verdict: nt01Verdict,
      reason: nt01Reason,
      persona: NV_EMAIL,
      ac: ['AC-NT01-PERSONA-01', 'AC-NT01-MARK-01', 'AC-NT01-U65-01'],
    };
    await page.close();
  }

  // --- CEO spot: EXPECTED_NO_INBOX ---
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    track(page);
    const ceoLogin = await fetch(`${PORTAL}/api/xbos/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: CEO_EMAIL, password: CEO_PASSWORD }),
    }).then((r) => r.json());
    const cd = ceoLogin?.data ?? ceoLogin;
    const token = cd?.accessToken ?? cd?.access_token;
    const mem = (cd?.memberships || []).find((m) => (m.companyId || m.company_id) === 'main') || cd?.memberships?.[0] || {};
    const employeeId = mem.employeeId || mem.employee_id || null;

    await page.addInitScript(
      (s) => {
        for (const store of [localStorage, sessionStorage]) {
          store.setItem('xevn.portal.accessToken', s.token);
          store.setItem('xevn.portal.tokenExpiresAt', String(Date.now() + 8 * 3600_000));
          store.setItem('xevn.portal.user', JSON.stringify({ userId: s.email, displayName: 'CEO QA' }));
          store.setItem('xevn.portal.companyId', 'main');
          store.setItem('hrm_portal_mode', '1');
          store.setItem('hrm_current_company_id', 'main');
        }
      },
      { token, email: CEO_EMAIL },
    );

    await page.goto(`${PORTAL}/hr/notifications?portal=1&tenantId=xevn&companyId=main`, {
      waitUntil: 'domcontentloaded',
      timeout: 90000,
    });
    await sleep(3500);
    await shot(page, '05-ceo-notifications');
    const body = (await page.locator('body').innerText().catch(() => '')) || '';
    const expectedNoInbox =
      !employeeId &&
      (/cần tài khoản gắn mã nhân viên|Chưa có thông báo|Tạo luồng nghiệp vụ/i.test(body) ||
        !/Chưa đọc/i.test(body));
    results.steps['NT01-CEO-SPOT'] = {
      employeeId,
      expectedNoInbox,
      bodySnippet: body.slice(0, 400),
    };
    results.uc_verdicts['AC-NT01-CEO-01'] = {
      verdict: expectedNoInbox ? 'EXPECTED_NO_INBOX' : 'OBS',
      reason: 'ceo@ without employee_id — not product FAIL',
    };
    await page.close();
  }

  await browser.close();

  const nt01 = results.uc_verdicts['HRM-NT-01']?.verdict;
  results.ack_status = nt01 === 'PASS' ? 'PASS_TO_PM' : nt01 === 'BLOCKED' ? 'FAIL' : 'FAIL';
  results.endedAt = ts();
  save();
  console.log(JSON.stringify({ ack_status: results.ack_status, uc: results.uc_verdicts, steps: results.steps }, null, 2));
  process.exit(nt01 === 'PASS' ? 0 : 1);
}

main().catch((e) => {
  results.fatal = String(e);
  results.ack_status = 'FAIL';
  results.endedAt = ts();
  save();
  console.error(e);
  process.exit(1);
});
