/**
 * QA-HDSD-BF-02-CC-INT03-01 — BF-02 portal CC inbox approve leave (TC-ECO-INT-03)
 * U65 zero-seed · portal :5173 · ceo@xe.vn
 * Uses existing pending hrm_leave inbox card OR creates leave from portal FE if empty.
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
const CACHE_BUST = process.env.QA_BF02_INT03 || '_bf02int03=20260801';
const MARKER = `QA-BF02-INT03-${Date.now().toString(36).toUpperCase()}`;

const __dir = dirname(fileURLToPath(import.meta.url));
const EVID = resolve(__dir, '../../docs/qa/evidence');
const RUNTIME = join(EVID, '_tmp-qa-hdsd-bf-02-cc-int03-01-runtime.json');
const SCREEN_DIR = join(EVID, 'screens/hdsd-bf-02-cc-int03-01-20260801');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const results = {
  work_item_id: 'QA-HDSD-BF-02-CC-INT03-01',
  program: 'HDSD-BF-02',
  startedAt: new Date().toISOString(),
  env: { PORTAL, EMAIL, u65: 'zero-seed', marker: MARKER },
  leaveSource: null,
  steps: [],
  net: [],
  approvePosts: [],
  wfTasksBefore: null,
  wfTasksAfter: null,
  inboxBefore: null,
  inboxAfter: null,
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
  start.setMonth(start.getMonth() + 8);
  const day = 12 + ((Date.now() / 60_000) | 0) % 15;
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
      const entry = { url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 320), status: res.status(), method };
      results.net.push(entry);
      if (method === 'POST' && /workflow-engine\/tasks\/[^/]+\/complete/.test(u)) {
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
        results.approvePosts.push({
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

async function shot(page, name) {
  mkdirSync(SCREEN_DIR, { recursive: true });
  const path = join(SCREEN_DIR, `${name}.png`);
  await page.screenshot({ path, fullPage: false });
  return path;
}

async function fetchWfTasks(authHeaders) {
  const r = await fetch(
    `${PORTAL}/api/xbos/workflow-engine/tasks?status=pending&pageSize=50&assigneeUserId=${encodeURIComponent(EMAIL)}`,
    { headers: authHeaders },
  );
  const text = await r.text();
  let j = {};
  try {
    j = text ? JSON.parse(text) : {};
  } catch {
    j = { raw: text.slice(0, 500) };
  }
  const rows = j?.data?.items ?? j?.data?.tasks ?? j?.data?.data ?? j?.data ?? [];
  const list = Array.isArray(rows) ? rows : [];
  const leaveTasks = list.filter((t) =>
    /hrm_leave|leave|nghỉ/i.test(String(t.business_type || t.businessType || t.title || '')),
  );
  return { http: r.status, count: list.length, leaveCount: leaveTasks.length, leaveTasks, all: list };
}

async function readInboxUi(page) {
  return page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('[data-testid="cc-inbox-task-card"]'));
    const text = document.body?.innerText || '';
    return {
      cardCount: cards.length,
      leaveCards: cards.filter((c) => /nghỉ phép|hrm_leave|leave/i.test(c.textContent || '')).length,
      cards: cards.map((c) => ({
        text: (c.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 180),
        hasLeave: /nghỉ phép|hrm_leave|leave/i.test(c.textContent || ''),
      })),
      hasNotice: /Đã hoàn thành/i.test(text),
      hasError: /ERROR|409|500|Sync ERROR|Không xử lý được/i.test(text),
      snippet: text.slice(0, 600),
    };
  });
}

async function createLeaveFromPortal(page, empSample) {
  const attendanceUrl = `${PORTAL}/hr/attendance?portal=1&tenantId=xevn&companyId=main&${CACHE_BUST}`;
  await page.goto(attendanceUrl, { waitUntil: 'networkidle2', timeout: 120_000 });
  await sleep(2000);

  await page.evaluate(() => {
    const hit = Array.from(document.querySelectorAll('button')).find((b) =>
      /Nghỉ phép/.test((b.textContent || '').replace(/\s+/g, ' ').trim()),
    );
    hit?.click();
  });
  for (let i = 0; i < 25; i++) {
    if (await page.evaluate(() => document.body.innerText.includes('Tạo yêu cầu nghỉ'))) break;
    await sleep(400);
  }

  await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button')).find((x) =>
      /Tạo yêu cầu nghỉ/i.test((x.textContent || '').trim()),
    );
    b?.click();
  });
  await sleep(1200);

  for (let i = 0; i < 40; i++) {
    const state = await page.evaluate(() => {
      const d = document.querySelector('[role="dialog"]');
      if (!d) return 'no-dialog';
      if (d.innerText.includes('Đang tải danh mục')) return 'loading';
      return Array.from(d.querySelectorAll('button[role="combobox"]')).some((b) =>
        /Chọn loại nghỉ|loại nghỉ/i.test(b.getAttribute('aria-label') || b.textContent || ''),
      )
        ? 'ready'
        : 'wait';
    });
    if (state === 'ready') break;
    await sleep(400);
  }

  const window = pickLeaveWindow();
  results.leaveWindow = window;
  const searchKw = empSample?.employee_code || 'PORTAL-GCEO';

  const empSearch = await page.$(
    '[role="dialog"] input[aria-label*="nhân" i], [role="dialog"] input[placeholder*="nhân" i], [role="dialog"] input[placeholder*="Tìm" i]',
  );
  if (empSearch) {
    await empSearch.click({ clickCount: 3 });
    await page.keyboard.press('Backspace');
    await empSearch.type(String(searchKw).slice(0, 24), { delay: 40 });
  }
  await sleep(1200);

  await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"]') || document.body;
    const btn = Array.from(d.querySelectorAll('button[role="combobox"]')).find((b) => {
      const a = (b.getAttribute('aria-label') || '') + (b.textContent || '');
      return /nhân viên|Chọn nhân/i.test(a) && !/loại nghỉ/i.test(a);
    });
    btn?.click();
  });
  await sleep(900);
  await page.evaluate((wantCode) => {
    const items = Array.from(document.querySelectorAll('[role="option"], [data-radix-collection-item], [cmdk-item]'));
    const hit = items.find((n) => wantCode && (n.textContent || '').includes(wantCode)) || items[0];
    hit?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  }, searchKw);
  await sleep(400);

  await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"]') || document.body;
    const btn = Array.from(d.querySelectorAll('button[role="combobox"]')).find((b) =>
      /Chọn loại nghỉ|loại nghỉ/i.test(b.getAttribute('aria-label') || b.textContent || ''),
    );
    btn?.click();
  });
  await sleep(700);
  await page.evaluate(() => {
    const nodes = Array.from(document.querySelectorAll('[cmdk-item], [data-slot="command-item"], [role="option"]'));
    const hit =
      nodes.find((n) => (n.textContent || '').includes('LVT_01')) ||
      nodes.find((n) => /Phép năm/i.test(n.textContent || '')) ||
      nodes[0];
    hit?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
  await sleep(300);

  const dateInputs = await page.$$(
    '[role="dialog"] input[placeholder*="dd/MM/yyyy" i], [role="dialog"] input[placeholder*="dd/mm/yyyy" i]',
  );
  if (dateInputs.length >= 2) {
    for (const [idx, vi] of [[0, window.startVi], [1, window.endVi]]) {
      await dateInputs[idx].click({ clickCount: 3 });
      await page.keyboard.press('Backspace');
      await dateInputs[idx].type(vi, { delay: 25 });
      await page.keyboard.press('Tab');
      await sleep(200);
    }
  }

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

  await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"]') || document.body;
    const btn = Array.from(d.querySelectorAll('button')).find((b) =>
      /Gửi yêu cầu|^Gửi$|^Lưu$/i.test((b.textContent || '').trim()),
    );
    if (btn && !btn.disabled) btn.click();
  });
  await sleep(6000);
  return true;
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

  results.wfTasksBefore = await fetchWfTasks(authHeaders);
  note(
    'wf-pending-before',
    results.wfTasksBefore.http === 200,
    `HTTP ${results.wfTasksBefore.http} pending=${results.wfTasksBefore.count} leave=${results.wfTasksBefore.leaveCount}`,
  );

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
    defaultViewport: { width: 1440, height: 900 },
  });

  const page = await browser.newPage();
  attachNet(page);
  await injectSession(page, session);

  await page.goto(`${PORTAL}/command-center/inbox?${CACHE_BUST}`, {
    waitUntil: 'networkidle2',
    timeout: 120_000,
  }).catch(() =>
    page.goto(`${PORTAL}/command-center/inbox?${CACHE_BUST}`, { waitUntil: 'domcontentloaded', timeout: 120_000 }),
  );
  await sleep(5000);

  results.inboxBefore = await readInboxUi(page);
  note(
    'inbox-load-before',
    !results.inboxBefore.hasError,
    `cards=${results.inboxBefore.cardCount} leaveCards=${results.inboxBefore.leaveCards}`,
  );
  await shot(page, '01-inbox-before');

  if (results.inboxBefore.leaveCards === 0) {
    results.leaveSource = 'portal-create-fallback';
    note('leave-source', true, 'No pending leave card — creating from portal FE (BF-02 mobile parallel may supply uat.nv0001)');
    const empRes = await fetch(`${HRM_API}/api/hrm/employees?company_id=main&page=1&page_size=5`, { headers: authHeaders });
    const empJson = await empRes.json();
    const empRows = empJson?.data?.data ?? empJson?.data?.items ?? empJson?.data ?? [];
    const empList = Array.isArray(empRows) ? empRows : [];
    const empSample = empList.find((e) => /ceo@xe\.vn/i.test(e.email || '')) || empList[0] || null;
    await createLeaveFromPortal(page, empSample);
    await page.goto(`${PORTAL}/command-center/inbox?${CACHE_BUST}`, { waitUntil: 'networkidle2', timeout: 120_000 });
    await sleep(5000);
    results.inboxBefore = await readInboxUi(page);
    note('inbox-after-create', results.inboxBefore.leaveCards > 0, `leaveCards=${results.inboxBefore.leaveCards}`);
  } else {
    results.leaveSource = 'existing-pending';
    note('leave-source', true, `Using existing pending leave cards (${results.inboxBefore.leaveCards})`);
  }

  const cardCountBeforeApprove = results.inboxBefore.cardCount;
  const leaveCardIdx = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('[data-testid="cc-inbox-task-card"]'));
    const idx = cards.findIndex((c) => /nghỉ phép|hrm_leave|Phê duyệt đơn nghỉ/i.test(c.textContent || ''));
    return idx >= 0 ? idx : cards.length > 0 ? 0 : -1;
  });

  if (cardCountBeforeApprove === 0 || leaveCardIdx < 0) {
    note('leave-card-present', false, 'No inbox card to approve');
    results.ownerHint = 'dev-fe';
    results.verdicts.overall = 'FAIL';
    await browser.close();
    results.endedAt = new Date().toISOString();
    writeFileSync(RUNTIME, JSON.stringify(results, null, 2));
    process.exit(2);
  }

  note('leave-card-present', true, `cardIndex=${leaveCardIdx} total=${cardCountBeforeApprove}`);

  const approveClick = await page.evaluate((idx) => {
    const cards = Array.from(document.querySelectorAll('[data-testid="cc-inbox-task-card"]'));
    const card = cards[idx];
    if (!card) return { ok: false, reason: 'no-card' };
    const cardText = (card.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 120);
    const btn = Array.from(card.querySelectorAll('button')).find((b) =>
      /Xử lý nhanh|Đang xử lý/i.test((b.textContent || '').trim()),
    );
    if (!btn) return { ok: false, reason: 'no-quick-btn', cardText };
    if (btn.disabled) return { ok: false, reason: 'disabled', cardText };
    btn.click();
    return { ok: true, cardText, btnText: (btn.textContent || '').trim() };
  }, leaveCardIdx);

  note('approve-click', !!approveClick.ok, JSON.stringify(approveClick));
  await sleep(5000);
  await shot(page, '02-after-approve-click');

  const approvePost = results.approvePosts[results.approvePosts.length - 1];
  const approve2xx = approvePost && approvePost.status >= 200 && approvePost.status < 300;
  note(
    'approve-post-2xx',
    !!approve2xx,
    approvePost
      ? `POST ${approvePost.url} status=${approvePost.status}`
      : 'no POST /workflow-engine/tasks/.../complete captured',
  );
  if (!approve2xx) results.ownerHint = results.ownerHint || 'dev-be';

  const feAfterApprove = await page.evaluate(() => ({
    hasSuccessNotice: /Đã hoàn thành/i.test(document.body?.innerText || ''),
    hasError: /Không xử lý được|ERROR|409|500/i.test(document.body?.innerText || ''),
  }));
  note(
    'fe-after-approve-2xx',
    approve2xx && feAfterApprove.hasSuccessNotice && !feAfterApprove.hasError,
    JSON.stringify(feAfterApprove),
  );

  await page.reload({ waitUntil: 'networkidle2', timeout: 120_000 }).catch(() =>
    page.reload({ waitUntil: 'domcontentloaded', timeout: 120_000 }),
  );
  await sleep(4000);
  results.inboxAfter = await readInboxUi(page);
  await shot(page, '03-inbox-f5');

  const cardReduced = results.inboxAfter.cardCount < cardCountBeforeApprove;
  note(
    'f5-inbox-persist',
    cardReduced || results.inboxAfter.leaveCards < results.inboxBefore.leaveCards,
    `before=${cardCountBeforeApprove} after=${results.inboxAfter.cardCount} leaveBefore=${results.inboxBefore.leaveCards} leaveAfter=${results.inboxAfter.leaveCards}`,
  );

  results.wfTasksAfter = await fetchWfTasks(authHeaders);
  note(
    'wf-pending-after',
    results.wfTasksAfter.http === 200,
    `HTTP ${results.wfTasksAfter.http} pending=${results.wfTasksAfter.count} (was ${results.wfTasksBefore.count})`,
  );

  const int03Pass =
    !!approve2xx &&
    feAfterApprove.hasSuccessNotice &&
    !feAfterApprove.hasError &&
    (cardReduced || results.inboxAfter.leaveCards < results.inboxBefore.leaveCards);

  results.verdicts = {
    leaveSourceReady: results.inboxBefore.leaveCards > 0 || results.leaveSource === 'portal-create-fallback' ? 'PASS' : 'FAIL',
    approvePost2xx: approve2xx ? 'PASS' : 'FAIL',
    feAfterApprove: feAfterApprove.hasSuccessNotice && !feAfterApprove.hasError ? 'PASS' : 'FAIL',
    f5InboxPersist: cardReduced || results.inboxAfter.leaveCards < results.inboxBefore.leaveCards ? 'PASS' : 'FAIL',
    TC_ECO_INT_03_BF02: int03Pass ? 'PASS' : 'FAIL',
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
