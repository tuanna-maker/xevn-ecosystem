/**
 * QA-HDSD-W4-INT-03-R2 — TC-ECO-INT-03 leave POST from FE + CC workflow inbox
 * U65 zero-seed · portal :5173 · ceo@xe.vn
 */
import puppeteer from 'puppeteer';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const XBOS_API = process.env.XBOS_API_URL || 'http://127.0.0.1:28002';
const HRM_API = process.env.HRM_API_URL || 'http://127.0.0.1:28001';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const CHROME =
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const CACHE_BUST = process.env.QA_INT03_R2 || '_int03r2=20260730';
const MARKER = `QA-INT03-R2-${Date.now().toString(36).toUpperCase()}`;

const __dir = dirname(fileURLToPath(import.meta.url));
const EVID = resolve(__dir, '../../docs/qa/evidence');
const RUNTIME = join(EVID, '_tmp-qa-hdsd-w4-int-03-r2-runtime.json');
const SCREEN_DIR = join(EVID, 'screens/hdsd-uat-w4-int03-r2-20260730');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const results = {
  work_item_id: 'QA-HDSD-W4-INT-03-R2',
  program: 'HDSD-P2-FULL-01',
  startedAt: new Date().toISOString(),
  env: { PORTAL, EMAIL, u65: 'zero-seed', marker: MARKER },
  steps: [],
  net: [],
  postBodies: [],
  wfTasks: null,
  verdicts: {},
  ownerHint: null,
};

function note(id, ok, detail) {
  const row = { id, ok, detail, at: new Date().toISOString() };
  results.steps.push(row);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${id}  ${detail}`);
  return ok;
}

function viDate(d) {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()}`;
}

function pickLeaveWindow() {
  const start = new Date();
  start.setMonth(start.getMonth() + 6);
  const day = 4 + ((Date.now() / 60_000) | 0) % 24;
  start.setDate(day);
  return { startVi: viDate(start), endVi: viDate(start), startIso: start.toISOString().slice(0, 10) };
}

async function loginApi() {
  for (const url of [`${XBOS_API}/api/xbos/auth/login`, `${PORTAL}/api/xbos/auth/login`]) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
      });
      const j = await r.json();
      const data = j?.data ?? j;
      const token = data?.accessToken ?? data?.access_token ?? j?.accessToken;
      if (token) return { token, expiresAt: Date.now() + 8 * 3600_000, user: data?.user ?? { email: EMAIL }, raw: data, loginUrl: url };
    } catch {
      /* try next */
    }
  }
  throw new Error('login failed');
}

async function injectSession(page, session) {
  await page.evaluateOnNewDocument((s) => {
    const payload = JSON.stringify(s.user);
    for (const store of [localStorage, sessionStorage]) {
      store.setItem('xevn.portal.accessToken', s.token);
      store.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
      store.setItem('xevn.portal.user', payload);
      store.setItem('xevn.portal.tenantId', 'xevn');
      store.setItem('xevn.portal.companyId', 'main');
      if (s.raw?.refreshToken) store.setItem('xevn.portal.refreshToken', s.raw.refreshToken);
    }
  }, session);
}

function attachNet(page) {
  page.on('response', async (res) => {
    try {
      const u = res.url();
      if (!/\/api\/(hrm|xbos)\//.test(u)) return;
      const method = res.request().method();
      const entry = {
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 280),
        status: res.status(),
        method,
      };
      results.net.push(entry);
      if (method === 'POST' && /leave-requests/.test(u) && !/approve|reject/.test(u)) {
        let bodyText = '';
        try {
          bodyText = await res.text();
        } catch {
          bodyText = '';
        }
        let parsed = null;
        try {
          parsed = bodyText ? JSON.parse(bodyText) : null;
        } catch {
          parsed = { raw: bodyText.slice(0, 2000) };
        }
        results.postBodies.push({
          status: res.status(),
          url: entry.url,
          requestBody: res.request().postData()?.slice(0, 2000) || null,
          responseBody: parsed,
        });
      }
    } catch {
      /* ignore */
    }
  });
}

async function clickByText(page, text, selector = 'button, a, [role="tab"], [role="button"]') {
  const box = await page.evaluate(
    (t, sel) => {
      const nodes = Array.from(document.querySelectorAll(sel));
      const el = nodes.find((n) => {
        const txt = (n.textContent || '').replace(/\s+/g, ' ').trim();
        return txt === t || txt.includes(t);
      });
      if (!el) return null;
      el.scrollIntoView({ block: 'center' });
      const r = el.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    },
    text,
    selector,
  );
  if (!box) return false;
  await page.mouse.click(box.x, box.y);
  return true;
}

async function typeViDate(page, inputHandle, vi) {
  await inputHandle.click({ clickCount: 3 });
  await page.keyboard.press('Backspace');
  await inputHandle.type(vi, { delay: 25 });
  await page.keyboard.press('Tab');
  await sleep(200);
}

async function shot(page, name) {
  mkdirSync(SCREEN_DIR, { recursive: true });
  const path = join(SCREEN_DIR, `${name}.png`);
  await page.screenshot({ path, fullPage: false });
  return path;
}

async function main() {
  mkdirSync(EVID, { recursive: true });
  const session = await loginApi();
  note('api-login', true, `${EMAIL} via ${session.loginUrl}`);

  const authHeaders = {
    Authorization: `Bearer ${session.token}`,
    'x-tenant-id': 'xevn',
    'x-company-id': 'main',
  };

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
    defaultViewport: { width: 1440, height: 900 },
  });

  const page = await browser.newPage();
  attachNet(page);
  await injectSession(page, session);

  const attendanceUrl = `${PORTAL}/hr/attendance?portal=1&tenantId=xevn&companyId=main&${CACHE_BUST}`;
  await page.goto(attendanceUrl, { waitUntil: 'domcontentloaded', timeout: 120_000 });
  await sleep(5000);

  const pageSnap = await page.evaluate(() => ({
    href: location.href,
    hasSyncError: /HRM API Sync ERROR|500|Internal Server Error/i.test(document.body?.innerText || ''),
    hasLeave: /Nghỉ phép/i.test(document.body?.innerText || ''),
    hasCreate: /Tạo yêu cầu nghỉ/i.test(document.body?.innerText || ''),
    snippet: (document.body?.innerText || '').slice(0, 500),
  }));
  note('portal-attendance-load', !pageSnap.hasSyncError, JSON.stringify(pageSnap).slice(0, 500));
  if (pageSnap.hasSyncError) results.ownerHint = 'devops';

  const leaveTab = await clickByText(page, 'Nghỉ phép');
  await sleep(2500);
  let leaveReady = pageSnap.hasCreate;
  if (!leaveReady) {
    for (let i = 0; i < 20; i++) {
      leaveReady = await page.evaluate(() => document.body.innerText.includes('Tạo yêu cầu nghỉ'));
      if (leaveReady) break;
      await sleep(400);
    }
  }
  note('leave-tab', leaveTab && leaveReady, `tabClick=${leaveTab} createVisible=${leaveReady}`);
  if (!leaveReady) {
    await shot(page, '01-leave-tab-fail');
    results.verdicts.overall = 'FAIL';
    results.ownerHint = results.ownerHint || 'dev-fe';
    await browser.close();
    results.endedAt = new Date().toISOString();
    writeFileSync(RUNTIME, JSON.stringify(results, null, 2));
    process.exit(2);
  }

  const opened = await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button')).find((x) =>
      /Tạo yêu cầu nghỉ/i.test((x.textContent || '').trim()),
    );
    if (!b) return false;
    b.click();
    return true;
  });
  note('open-create-dialog', opened, 'Tạo yêu cầu nghỉ');
  await sleep(1200);

  let typeReady = false;
  for (let i = 0; i < 40; i++) {
    const state = await page.evaluate(() => {
      const d = document.querySelector('[role="dialog"]');
      if (!d) return 'no-dialog';
      if (d.innerText.includes('Đang tải danh mục')) return 'loading';
      if (d.innerText.includes('Chưa có mục trong danh mục')) return 'empty';
      return Array.from(d.querySelectorAll('button[role="combobox"]')).some((b) =>
        /Chọn loại nghỉ|loại nghỉ/i.test(b.getAttribute('aria-label') || b.textContent || ''),
      )
        ? 'ready'
        : 'wait';
    });
    if (state === 'ready') {
      typeReady = true;
      break;
    }
    if (state === 'empty') break;
    await sleep(400);
  }
  note('leave-type-ready', typeReady, 'CatalogSearchPicker');

  const window = pickLeaveWindow();
  results.leaveWindow = window;

  const empSearch = await page.$(
    '[role="dialog"] input[aria-label*="nhân" i], [role="dialog"] input[placeholder*="nhân" i], [role="dialog"] input[placeholder*="Tìm" i]',
  );
  if (empSearch) {
    await empSearch.click({ clickCount: 3 });
    await page.keyboard.press('Backspace');
    await empSearch.type('PORTAL-GCEO', { delay: 40 });
  }
  await sleep(900);
  await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"]') || document.body;
    const btn = Array.from(d.querySelectorAll('button[role="combobox"]')).find((b) => {
      const a = (b.getAttribute('aria-label') || '') + (b.textContent || '');
      return /nhân viên|Chọn nhân|select employee/i.test(a) && !/loại nghỉ|leave type/i.test(a);
    });
    btn?.click();
  });
  await sleep(700);
  const empPick = await page.evaluate(() => {
    const items = Array.from(
      document.querySelectorAll('[role="option"], [data-radix-collection-item], [cmdk-item]'),
    );
    const hit = items.find((n) => (n.textContent || '').includes('PORTAL-GCEO')) || items[0];
    hit?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return { count: items.length, chosen: hit ? (hit.textContent || '').trim().slice(0, 80) : '' };
  });
  note('employee-pick', empPick.count > 0 && !!empPick.chosen, JSON.stringify(empPick));

  await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"]') || document.body;
    const btn = Array.from(d.querySelectorAll('button[role="combobox"]')).find((b) =>
      /Chọn loại nghỉ|loại nghỉ|leave type/i.test(b.getAttribute('aria-label') || b.textContent || ''),
    );
    btn?.click();
  });
  await sleep(700);
  const typePick = await page.evaluate(() => {
    const nodes = Array.from(
      document.querySelectorAll('[cmdk-item], [data-slot="command-item"], [role="option"]'),
    );
    const hit =
      nodes.find((n) => (n.textContent || '').includes('LVT_01')) ||
      nodes.find((n) => /Phép năm/i.test(n.textContent || '')) ||
      nodes[0];
    hit?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return { chosen: hit ? (hit.textContent || '').trim().slice(0, 80) : '' };
  });
  note('leave-type-pick', !!typePick.chosen, JSON.stringify(typePick));

  const dateInputs = await page.$$(
    '[role="dialog"] input[placeholder*="dd/MM/yyyy" i], [role="dialog"] input[placeholder*="dd/mm/yyyy" i]',
  );
  if (dateInputs.length >= 2) {
    await typeViDate(page, dateInputs[0], window.startVi);
    await typeViDate(page, dateInputs[1], window.endVi);
  }
  note('date-inputs', dateInputs.length >= 2, `count=${dateInputs.length}`);

  await page.evaluate((reason) => {
    const d = document.querySelector('[role="dialog"]') || document.body;
    const ta = d.querySelector('textarea');
    if (!ta) return;
    const proto = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value');
    proto.set.call(ta, reason);
    ta.dispatchEvent(new Event('input', { bubbles: true }));
    ta.dispatchEvent(new Event('change', { bubbles: true }));
  }, MARKER);
  await sleep(200);

  await shot(page, '02-leave-dialog-filled');

  const submit = await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"]') || document.body;
    const btn = Array.from(d.querySelectorAll('button')).find((b) =>
      /Gửi yêu cầu|^Gửi$|^Lưu$/i.test((b.textContent || '').trim()),
    );
    if (!btn) return { ok: false, reason: 'no-button' };
    if (btn.disabled) return { ok: false, reason: 'disabled' };
    btn.click();
    return { ok: true, text: (btn.textContent || '').trim() };
  });
  note('submit-click', !!submit.ok, JSON.stringify(submit));
  await sleep(5000);

  const lastPost = results.postBodies[results.postBodies.length - 1];
  const post2xx = lastPost && lastPost.status >= 200 && lastPost.status < 300;
  const createdId = lastPost?.responseBody?.data?.id || lastPost?.responseBody?.id || null;
  results.createdId = createdId;
  note(
    'leave-create-post',
    !!post2xx,
    lastPost
      ? `status=${lastPost.status} code=${lastPost.responseBody?.code || lastPost.responseBody?.data?.code || 'n/a'} id=${createdId || 'n/a'}`
      : 'no POST captured',
  );
  if (!post2xx) results.ownerHint = results.ownerHint || (submit.ok ? 'dev-be' : 'dev-fe');

  await shot(page, '03-after-submit');

  // CC inbox + workflow-engine/tasks
  const netBeforeInbox = results.net.length;
  await page.goto(`${PORTAL}/command-center/inbox?${CACHE_BUST}`, {
    waitUntil: 'domcontentloaded',
    timeout: 120_000,
  });
  await sleep(4000);

  const wfNet = results.net.slice(netBeforeInbox).find((n) => /workflow-engine\/tasks/.test(n.url));
  note('wf-tasks-net', !!wfNet && wfNet.status === 200, wfNet ? `${wfNet.method} ${wfNet.url} ${wfNet.status}` : 'no wf tasks call');

  const wfApi = await fetch(
    `${PORTAL}/api/xbos/workflow-engine/tasks?status=pending&pageSize=50&assigneeUserId=${encodeURIComponent(EMAIL)}`,
    { headers: authHeaders },
  );
  const wfText = await wfApi.text();
  let wfJson = {};
  try {
    wfJson = wfText ? JSON.parse(wfText) : {};
  } catch {
    wfJson = { raw: wfText.slice(0, 500) };
  }
  const wfRows =
    wfJson?.data?.items ??
    wfJson?.data?.tasks ??
    wfJson?.data?.data ??
    wfJson?.data ??
    [];
  const wfList = Array.isArray(wfRows) ? wfRows : [];
  const wfHit =
    wfList.find(
      (t) =>
        (createdId && String(t.businessId || t.business_id || '').includes(createdId)) ||
        /leave|nghỉ/i.test(String(t.businessType || t.business_type || t.title || '')),
    ) || null;
  results.wfTasks = { http: wfApi.status, count: wfList.length, hit: wfHit ? { id: wfHit.id, title: wfHit.title } : null };
  note('wf-tasks-api', wfApi.status === 200, `HTTP ${wfApi.status} pending=${wfList.length} hit=${!!wfHit}`);

  const inboxUi = await page.evaluate((marker) => {
    const text = document.body?.innerText || '';
    return {
      hasLeave: /nghỉ phép|leave|yêu cầu nghỉ/i.test(text),
      hasMarker: marker && text.includes(marker),
      hasCards: document.querySelectorAll('[data-testid*="inbox"], tbody tr, [class*="task"]').length > 0,
      hasError: /ERROR|409|500|Sync ERROR/i.test(text),
      snippet: text.slice(0, 800),
    };
  }, MARKER);
  note(
    'cc-inbox-ui',
    !inboxUi.hasError && (inboxUi.hasLeave || inboxUi.hasMarker || inboxUi.hasCards),
    JSON.stringify(inboxUi).slice(0, 400),
  );
  await shot(page, '04-cc-inbox');

  const int03Pass =
    post2xx &&
    wfApi.status === 200 &&
    !inboxUi.hasError &&
    (wfHit || inboxUi.hasLeave || inboxUi.hasMarker || inboxUi.hasCards);

  results.verdicts = {
    leavePost2xx: post2xx ? 'PASS' : 'FAIL',
    wfTasks200: wfApi.status === 200 ? 'PASS' : 'FAIL',
    inboxVisible: wfHit || inboxUi.hasLeave || inboxUi.hasMarker || inboxUi.hasCards ? 'PASS' : 'FAIL',
    TC_ECO_INT_03: int03Pass ? 'PASS' : 'FAIL',
    overall: int03Pass ? 'PASS' : 'FAIL',
  };

  await browser.close();
  results.endedAt = new Date().toISOString();
  writeFileSync(RUNTIME, JSON.stringify(results, null, 2));
  console.log('\n--- SUMMARY ---', JSON.stringify(results.verdicts, null, 2));
  process.exit(int03Pass ? 0 : 2);
}

main().catch((e) => {
  console.error(e);
  results.steps.push({ id: 'crash', ok: false, detail: String(e) });
  results.verdicts.overall = 'FAIL';
  results.ownerHint = results.ownerHint || 'devops';
  results.endedAt = new Date().toISOString();
  try {
    writeFileSync(RUNTIME, JSON.stringify(results, null, 2));
  } catch {
    /* ignore */
  }
  process.exit(1);
});
