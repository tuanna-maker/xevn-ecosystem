/**
 * QA-HDSD-BF-01-JRECWF03-01 — J-REC-WF-03 inbox approve → HRM sync (BF-01 GWC closure)
 * U65 zero-seed · portal :5173 · ceo@xe.vn · existing inbox OR YCTD→submit same session
 */
import puppeteer from 'puppeteer';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM_API = process.env.HRM_API_URL || 'http://127.0.0.1:28001';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-qa-hdsd-bf-01-jrecwf03-01-runtime.json');
const SCREEN_DIR = resolve(ROOT, 'docs/qa/evidence/screens/hdsd-bf-01-jrecwf03-01-20260801');
const STAMP = `JRW3${Date.now().toString(36).slice(-5).toUpperCase()}`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const q = (path) =>
  `${PORTAL}${path}${path.includes('?') ? '&' : '?'}portal=1&tenantId=xevn&companyId=main`;

const results = {
  work_item_id: 'QA-HDSD-BF-01-JRECWF03-01',
  program: 'P-HDSD-ECOSYSTEM-03 · BF-01 · C-BF01-JRECWF03',
  startedAt: new Date().toISOString(),
  env: { PORTAL, EMAIL, u65: 'zero-seed', stamp: STAMP },
  l0: {},
  spots: [],
  network: [],
  approvePosts: [],
  consoleErrors: [],
  screens: [],
  recSource: null,
  requisitionId: null,
  ack_status: null,
};

function save() {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(results, null, 2));
}

function record(id, verdict, detail, extra = {}) {
  const row = { id, verdict, detail, at: new Date().toISOString(), ...extra };
  results.spots.push(row);
  console.log(`${verdict === '🟢' ? 'PASS' : verdict === '🟡' ? 'BLOCK' : 'FAIL'}  ${id}  ${detail.slice(0, 260)}`);
  save();
  return row;
}

async function shot(page, name) {
  mkdirSync(SCREEN_DIR, { recursive: true });
  const path = join(SCREEN_DIR, `${name}.png`);
  await page.screenshot({ path, fullPage: false });
  results.screens.push(path.replace(/\\/g, '/'));
  return path;
}

function trackNetwork(page) {
  page.on('response', async (res) => {
    try {
      const u = res.url();
      if (!/\/api\/(hrm|xbos)\//.test(u)) return;
      const method = res.request().method();
      if (method === 'OPTIONS') return;
      const entry = {
        method,
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 320),
        at: new Date().toISOString(),
      };
      if (u.includes('/requisitions') && method === 'GET') {
        try {
          const body = await res.json();
          const data = body?.data ?? body;
          const row = Array.isArray(data?.data) ? data.data[0] : data;
          if (row?.status) entry.reqStatus = row.status;
          if (row?.id) entry.reqId = row.id;
        } catch {
          /* */
        }
      }
      results.network.push(entry);
      if (method === 'POST' && /workflow-engine\/tasks\/[^/]+\/complete/.test(u)) {
        let parsed = null;
        try {
          parsed = await res.json();
        } catch {
          parsed = null;
        }
        results.approvePosts.push({
          status: res.status(),
          url: entry.url,
          responseBody: parsed,
        });
      }
    } catch {
      /* */
    }
  });
}

function lastNet(pred) {
  for (let i = results.network.length - 1; i >= 0; i--) {
    if (pred(results.network[i])) return results.network[i];
  }
  return null;
}

function netsSince(before, pred) {
  return results.network.slice(before).filter(pred);
}

async function reactSetInput(page, selector, value) {
  await page.waitForSelector(selector, { timeout: 15000 });
  await page.click(selector, { clickCount: 3 });
  await page.keyboard.press('Backspace');
  await page.type(selector, value, { delay: 12 });
}

async function nativeClickByText(page, text, opts = {}) {
  const box = await page.evaluate(
    (t, exact) => {
      const nodes = Array.from(
        document.querySelectorAll('button, a, [role="tab"], [role="button"], [role="menuitem"]'),
      );
      const el = nodes.find((n) => {
        const txt = (n.textContent || '').replace(/\s+/g, ' ').trim();
        if (exact) return txt === t;
        return txt.includes(t);
      });
      if (!el) return null;
      el.scrollIntoView({ block: 'center' });
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) return null;
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
    },
    text,
    !!opts.exact,
  );
  if (!box) throw new Error(`click miss: ${text}`);
  await page.mouse.click(box.x, box.y);
}

async function clickTestId(page, testId) {
  const sel = `[data-testid="${testId}"]`;
  await page.waitForSelector(sel, { timeout: 15000 });
  await page.click(sel);
}

async function waitForFormReady(page, testId, timeoutMs = 22000) {
  try {
    await page.waitForSelector(`[data-testid="${testId}"]`, { timeout: timeoutMs });
    return true;
  } catch {
    return false;
  }
}

async function uiLogin(page) {
  await page.goto(`${PORTAL}/login`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(800);
  await page.evaluate(() => {
    for (const s of [localStorage, sessionStorage]) s.clear();
  });
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(600);
  await reactSetInput(page, 'input[type="email"]', EMAIL);
  await reactSetInput(page, 'input[type="password"]', PASSWORD);
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => null),
    page.click('button[type="submit"]'),
  ]);
  await sleep(2000);
  return { url: page.url() };
}

async function loginApi() {
  for (const url of [`${PORTAL}/api/xbos/auth/login`, `http://127.0.0.1:28002/api/xbos/auth/login`]) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
      });
      const j = await r.json();
      const data = j?.data ?? j;
      const token = data?.accessToken ?? data?.access_token ?? j?.accessToken;
      if (token) return { token, user: data?.user ?? { email: EMAIL } };
    } catch {
      /* */
    }
  }
  return null;
}

async function readInboxUi(page) {
  return page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('[data-testid="cc-inbox-task-card"]'));
    const text = document.body?.innerText || '';
    return {
      cardCount: cards.length,
      cards: cards.map((c, idx) => ({
        idx,
        text: (c.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 200),
        isRecruitment:
          /tuyển dụng|requisition|YCTD|yêu cầu tuyển|hrm_requisition|Phê duyệt yêu cầu/i.test(
            c.textContent || '',
          ),
      })),
      recIdx: cards.findIndex((c) =>
        /tuyển dụng|requisition|YCTD|yêu cầu tuyển|hrm_requisition|Phê duyệt yêu cầu/i.test(
          c.textContent || '',
        ),
      ),
      hasError: /ERROR|409|500|Sync ERROR|HRM API/i.test(text),
      hasSuccess: /Đã hoàn thành|Hoàn thành/i.test(text),
      snippet: text.slice(0, 600),
    };
  });
}

async function ensureJdTemplateFromFe(page) {
  await page.goto(q('/hr/recruitment?tab=jd-library'), { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(2500);
  const hasRows = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('tbody tr')).filter((r) => (r.textContent || '').trim().length > 10);
    return rows.length;
  });
  if (hasRows > 0) return { ok: true, via: 'existing', count: hasRows };

  try {
    await nativeClickByText(page, 'Thêm JD');
  } catch {
    return { ok: false, reason: 'no-add-jd-btn' };
  }
  await sleep(1500);
  const jdCode = `JD-${STAMP}`;
  await page.evaluate(
    (code, title) => {
      const d = document.querySelector('[role="dialog"]');
      if (!d) return;
      const inputs = Array.from(d.querySelectorAll('input'));
      const codeInp = inputs[0];
      const titleInp = inputs[1];
      if (codeInp) {
        codeInp.value = code;
        codeInp.dispatchEvent(new Event('input', { bubbles: true }));
      }
      if (titleInp) {
        titleInp.value = title;
        titleInp.dispatchEvent(new Event('input', { bubbles: true }));
      }
    },
    jdCode,
    `QA JD ${STAMP}`,
  );
  await sleep(400);
  await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"]');
    const combo = Array.from(d?.querySelectorAll('button[role="combobox"]') || [])[0];
    combo?.click();
  });
  await sleep(800);
  await page.evaluate(() => {
    const opt = Array.from(document.querySelectorAll('[role="option"], [cmdk-item]')).find(Boolean);
    opt?.click();
  });
  await sleep(500);
  const beforeSave = results.network.length;
  await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"]');
    const btn = Array.from(d?.querySelectorAll('button') || []).find((b) =>
      /Lưu|Thêm|Tạo/i.test((b.textContent || '').trim()),
    );
    btn?.click();
  });
  await sleep(4000);
  const postJd = netsSince(beforeSave, (n) => n.method === 'POST' && /job-templates/.test(n.url)).find(
    (n) => n.status >= 200 && n.status < 300,
  );
  return { ok: !!postJd, via: 'created', postStatus: postJd?.status, code: jdCode };
}

async function createAndSubmitYctd(page) {
  const jdEnsure = await ensureJdTemplateFromFe(page);
  await page.goto(q('/hr/recruitment?tab=requisitions'), { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(2500);

  await clickTestId(page, 'hdsd-requisition-create-btn');
  await sleep(1500);
  try {
    await clickTestId(page, 'hdsd-requisition-job-template');
  } catch {
    await page.evaluate(() => {
      const d = document.querySelector('[data-testid="hdsd-requisition-form-dialog"]');
      const combo = Array.from(d?.querySelectorAll('button[role="combobox"]') || [])[0];
      combo?.click();
    });
  }
  await sleep(800);
  await page.evaluate(() => {
    const opt = Array.from(document.querySelectorAll('[role="option"], [cmdk-item]')).find(Boolean);
    opt?.click();
  });
  await sleep(800);
  const formReady = await waitForFormReady(page, 'hdsd-requisition-form-ready');
  if (!formReady) return { ok: false, reason: 'form-not-ready', jdEnsure };

  const beforeSave = results.network.length;
  try {
    await clickTestId(page, 'hdsd-requisition-form-submit');
  } catch {
    await page.click('[data-testid="hdsd-requisition-form-dialog"] button[aria-label="Lưu"]');
  }
  await sleep(4000);
  const postReq = netsSince(beforeSave, (n) => n.method === 'POST' && /requisition/.test(n.url)).pop();
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(2500);

  const beforeSubmit = results.network.length;
  const sendResult = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('tbody tr'));
    for (const row of rows) {
      const btn = Array.from(row.querySelectorAll('button')).find((b) =>
        /Gửi duyệt QT/i.test((b.textContent || '').trim()),
      );
      if (btn && !btn.disabled) {
        btn.scrollIntoView({ block: 'center' });
        btn.click();
        return { ok: true, rowText: (row.textContent || '').slice(0, 100) };
      }
    }
    return { ok: false };
  });
  await sleep(6000);
  const submitWf = netsSince(beforeSubmit, (n) => /submit-workflow|workflow-instances|spawn/.test(n.url)).pop();
  return {
    ok: postReq?.status >= 200 && postReq?.status < 300 && submitWf?.status >= 200 && submitWf?.status < 300,
    jdEnsure,
    formReady,
    postReq,
    submitWf,
    sendResult,
  };
}

async function approveRecInboxCard(page, recIdx) {
  const quickClick = await page.evaluate((idx) => {
    const cards = Array.from(document.querySelectorAll('[data-testid="cc-inbox-task-card"]'));
    const card = cards[idx];
    if (!card) return { ok: false, reason: 'no-card' };
    const cardText = (card.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 140);
    const quickBtn = Array.from(card.querySelectorAll('button')).find((b) =>
      /Xử lý nhanh/i.test((b.textContent || '').trim()),
    );
    if (quickBtn && !quickBtn.disabled) {
      quickBtn.click();
      return { ok: true, via: 'quick-complete', cardText };
    }
    const detailBtn = Array.from(card.querySelectorAll('button')).find((b) =>
      /Mở chi tiết/i.test((b.textContent || '').trim()),
    );
    if (detailBtn) {
      detailBtn.click();
      return { ok: true, via: 'open-detail', cardText };
    }
    return { ok: false, reason: 'no-action-btn', cardText };
  }, recIdx);

  if (!quickClick.ok) return quickClick;

  if (quickClick.via === 'open-detail') {
    await sleep(3500);
    const drawerApprove = await page.evaluate(() => {
      const drawer = document.querySelector('[role="dialog"], [data-testid="workflow-task-detail-drawer"]');
      const root = drawer || document.body;
      const btn = Array.from(root.querySelectorAll('button')).find((b) =>
        /Hoàn thành|Duyệt|Phê duyệt|Xử lý nhanh/i.test((b.textContent || '').trim()),
      );
      if (btn && !btn.disabled) {
        btn.click();
        return { ok: true, btnText: (btn.textContent || '').trim() };
      }
      return { ok: false, reason: 'no-drawer-approve' };
    });
    if (!drawerApprove.ok) return { ...quickClick, drawerApprove, ok: false };
    return { ...quickClick, drawerApprove, ok: true };
  }

  return quickClick;
}

async function readYctdListUi(page) {
  return page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('tbody tr')).filter((r) => (r.textContent || '').trim().length > 20);
    return {
      rowCount: rows.length,
      rows: rows.slice(0, 5).map((r) => ({
        text: (r.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 160),
        isOpen: /Đang tuyển|open/i.test(r.textContent || ''),
        isPending: /Chờ duyệt|pending_approval|QT XBOS đang chạy/i.test(r.textContent || ''),
      })),
      hasSyncError: /HRM API Sync ERROR|409|500/i.test(document.body?.innerText || ''),
    };
  });
}

async function fetchPendingRecTasks(token) {
  const headers = {
    Authorization: `Bearer ${token}`,
    'x-tenant-id': 'xevn',
    'x-company-id': 'main',
  };
  const r = await fetch(
    `${PORTAL}/api/xbos/workflow-engine/tasks?status=pending&pageSize=100&assigneeUserId=${encodeURIComponent(EMAIL)}`,
    { headers },
  );
  const j = await r.json();
  const rows = j?.data?.items ?? j?.data?.tasks ?? j?.data ?? [];
  const list = Array.isArray(rows) ? rows : [];
  const recTasks = list.filter((t) =>
    /hrm_requisition|requisition|tuyển dụng|recruitment/i.test(
      String(t.workflow_code || t.workflowCode || t.business_type || t.title || ''),
    ),
  );
  return { http: r.status, recTasks, all: list };
}

async function runL0Shell() {
  for (const [name, cmd] of [
    ['qc:dev-stack', 'node scripts/qc-dev-stack.mjs'],
    ['qc:fe-be-health', 'node scripts/qc-fe-be-api-health.mjs'],
  ]) {
    try {
      const out = execSync(cmd, { cwd: ROOT, encoding: 'utf8', timeout: 120000, stdio: ['pipe', 'pipe', 'pipe'] });
      results.l0[name] = { exit: 0, snippet: out.slice(-500) };
    } catch (e) {
      const snippet = String(e.stdout || e.stderr || e.message).slice(-500);
      const healthy = /HTTP 200|ALL PASS|healthy/i.test(snippet);
      results.l0[name] = { exit: healthy ? 0 : (e.status ?? 1), snippet };
    }
  }
  save();
}

(async () => {
  console.log('=== QA-HDSD-BF-01-JRECWF03-01 ===');
  await runL0Shell();

  const apiSession = await loginApi();
  results.apiLogin = !!apiSession;

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--window-size=1440,900'],
    defaultViewport: { width: 1440, height: 900 },
  });

  const page = await browser.newPage();
  trackNetwork(page);
  page.on('pageerror', (e) => results.consoleErrors.push(String(e).slice(0, 180)));
  page.on('console', (msg) => {
    if (msg.type() === 'error') results.consoleErrors.push(msg.text().slice(0, 180));
  });

  let inboxBefore = 0;
  let recIdx = -1;
  let approvePost = null;
  let yctdBefore = null;
  let yctdAfter = null;

  try {
    const login = await uiLogin(page);
    if (!/command-center/.test(login.url)) throw new Error(`login failed url=${login.url}`);

    // UF-XBOS-10 regression — load-only quick spot (must_keep)
    {
      await page.goto(`${PORTAL}/command-center?settings=workflow_designer`, {
        waitUntil: 'domcontentloaded',
        timeout: 90000,
      });
      await sleep(2000);
      const postSave = lastNet((n) => n.method === 'POST' && /workflow-engine\/definitions/.test(n.url));
      const wfNet = lastNet((n) => /workflow-engine\/definitions/.test(n.url) && n.status < 500);
      record(
        'UF-XBOS-10-regression',
        !postSave && wfNet?.status < 400 ? '🟢' : postSave ? '🔴' : '🟡',
        `load-only GETdefs=${wfNet?.status ?? 'none'} postSave=${postSave?.status ?? 'none'}`,
        { must_keep: true },
      );
    }

    // Inbox — find recruitment task or create YCTD chain
    {
      await page.goto(`${PORTAL}/command-center/inbox`, { waitUntil: 'domcontentloaded', timeout: 90000 });
      await sleep(4000);
      await shot(page, '01-inbox-before');
      let inboxUi = await readInboxUi(page);
      inboxBefore = inboxUi.cardCount;
      recIdx = inboxUi.recIdx;

      if (recIdx < 0) {
        results.recSource = 'yctd-create-submit-fallback';
        record('REC-TASK-SOURCE', '🟡', 'No recruitment inbox card — creating YCTD+Gửi duyệt same session (U65)');
        const created = await createAndSubmitYctd(page);
        results.yctdCreate = created;
        if (!created.ok) {
          record('YCTD-SUBMIT-CHAIN', '🔴', JSON.stringify(created).slice(0, 300));
        } else {
          record('YCTD-SUBMIT-CHAIN', '🟢', `POSTreq=${created.postReq?.status} submitWF=${created.submitWf?.status}`);
        }
        await page.goto(`${PORTAL}/command-center/inbox`, { waitUntil: 'domcontentloaded', timeout: 90000 });
        await sleep(5000);
        await shot(page, '02-inbox-after-yctd');
        inboxUi = await readInboxUi(page);
        recIdx = inboxUi.recIdx;
      } else {
        results.recSource = 'existing-inbox';
        record('REC-TASK-SOURCE', '🟢', `Using existing recruitment inbox card idx=${recIdx} cards=${inboxUi.cardCount}`);
      }

      if (recIdx < 0) {
        record('J-REC-WF-03-PRECONDITION', '🔴', `No recruitment inbox task after fallback cards=${inboxUi.cardCount}`);
      } else {
        record(
          'J-REC-WF-03-PRECONDITION',
          inboxUi.hasError ? '🔴' : '🟢',
          `recIdx=${recIdx} card="${inboxUi.cards[recIdx]?.text?.slice(0, 80)}" inboxErr=${inboxUi.hasError}`,
        );
      }
    }

    // HRM YCTD before approve
    {
      await page.goto(q('/hr/recruitment?tab=requisitions'), { waitUntil: 'domcontentloaded', timeout: 90000 });
      await sleep(3000);
      yctdBefore = await readYctdListUi(page);
      await shot(page, '03-yctd-before-approve');
      record(
        'HRM-YCTD-BEFORE',
        yctdBefore.hasSyncError ? '🔴' : '🟢',
        `rows=${yctdBefore.rowCount} pending=${yctdBefore.rows.filter((r) => r.isPending).length}`,
      );
    }

    // Approve inbox recruitment task
    if (recIdx >= 0) {
      await page.goto(`${PORTAL}/command-center/inbox`, { waitUntil: 'domcontentloaded', timeout: 90000 });
      await sleep(3500);
      const beforeApproveNet = results.network.length;
      const approveClick = await approveRecInboxCard(page, recIdx);
      results.approveClick = approveClick;
      await sleep(6000);
      await shot(page, '04-after-approve');

      approvePost = results.approvePosts[results.approvePosts.length - 1] || null;
      const completeNet = netsSince(beforeApproveNet, (n) =>
        /workflow-engine\/tasks\/[^/]+\/complete/.test(n.url),
      ).pop();

      const inboxAfter = await readInboxUi(page);
      const approve2xx =
        (approvePost?.status >= 200 && approvePost?.status < 300) ||
        (completeNet?.status >= 200 && completeNet?.status < 300);

      const instanceCompleted =
        approvePost?.responseBody?.data?.instanceCompleted === true ||
        approvePost?.responseBody?.data?.task?.status === 'completed';

      record(
        'J-REC-WF-03-INBOX-APPROVE',
        approve2xx && approveClick.ok ? '🟢' : approveClick.ok && !approve2xx ? '🟡' : '🔴',
        `click=${JSON.stringify(approveClick)} POST=${approvePost?.status ?? completeNet?.status ?? 'none'} instanceCompleted=${instanceCompleted}`,
        { j: 'J-REC-WF-03', ac: 'AC-REC-WF-03' },
      );

      record(
        'INBOX-AFTER-APPROVE',
        inboxAfter.hasError ? '🔴' : inboxAfter.hasSuccess || inboxAfter.cardCount < inboxBefore ? '🟢' : '🟡',
        `cards ${inboxBefore}→${inboxAfter.cardCount} success=${inboxAfter.hasSuccess}`,
      );
    }

    // HRM sync after approve + F5
    {
      await page.goto(q('/hr/recruitment?tab=requisitions'), { waitUntil: 'domcontentloaded', timeout: 90000 });
      await sleep(3500);
      yctdAfter = await readYctdListUi(page);
      await shot(page, '05-yctd-after-approve');

      const hasOpenRow = yctdAfter.rows.some((r) => r.isOpen);
      const noPendingQt = !yctdAfter.rows.some((r) => /QT XBOS đang chạy/i.test(r.text));
      const getReq = lastNet((n) => n.method === 'GET' && /recruitment\/requisitions/.test(n.url) && n.status === 200);

      record(
        'HRM-STATUS-SYNC',
        hasOpenRow && !yctdAfter.hasSyncError ? '🟢' : yctdAfter.hasSyncError ? '🔴' : '🟡',
        `openRow=${hasOpenRow} noQtBanner=${noPendingQt} getReq=${getReq?.status ?? 'none'} reqStatus=${getReq?.reqStatus ?? 'n/a'}`,
      );

      await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
      await sleep(3500);
      const yctdF5 = await readYctdListUi(page);
      await shot(page, '06-yctd-f5');
      const f5Open = yctdF5.rows.some((r) => r.isOpen);

      record(
        'HRM-F5-PERSIST',
        f5Open && !yctdF5.hasSyncError ? '🟢' : yctdF5.hasSyncError ? '🔴' : '🟡',
        `f5Open=${f5Open} rows=${yctdF5.rowCount}`,
      );
    }

    // Scope / sync error check
    {
      const scope409 = results.network.filter((n) => n.status === 409);
      const hrmSyncErr = results.consoleErrors.some((e) => /409|Sync ERROR|scope/i.test(e));
      record(
        'NETWORK-SCOPE-CLEAN',
        scope409.length === 0 && !hrmSyncErr ? '🟢' : '🔴',
        `409count=${scope409.length} consoleScope=${hrmSyncErr}`,
      );
    }

    // API probe pending rec tasks after
    if (apiSession?.token) {
      const afterTasks = await fetchPendingRecTasks(apiSession.token);
      results.wfTasksAfter = afterTasks;
    }

    const coreIds = [
      'J-REC-WF-03-PRECONDITION',
      'J-REC-WF-03-INBOX-APPROVE',
      'HRM-STATUS-SYNC',
      'HRM-F5-PERSIST',
      'NETWORK-SCOPE-CLEAN',
    ];
    const coreRed = coreIds.some((id) => results.spots.find((s) => s.id === id)?.verdict === '🔴');
    const coreYellow = coreIds.some((id) => results.spots.find((s) => s.id === id)?.verdict === '🟡');
    const ufRegression = results.spots.find((s) => s.id === 'UF-XBOS-10-regression')?.verdict === '🔴';

    results.ack_status = coreRed || ufRegression ? 'FAIL_TO_PM' : coreYellow ? 'FAIL_TO_PM' : 'PASS_TO_PM';
    results.finishedAt = new Date().toISOString();
    results.yctdBefore = yctdBefore;
    results.yctdAfter = yctdAfter;
    save();
    console.log(`\nack_status: ${results.ack_status}`);
  } finally {
    await browser.close();
    save();
  }

  process.exit(results.ack_status === 'PASS_TO_PM' ? 0 : 2);
})();
