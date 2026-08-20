#!/usr/bin/env node
/**
 * PO-UC-TC-W4-QA-SELF-FD-02 — Browser BR-WF-04 self-approve FD
 * LOCKS: U65 zero-seed · U76 HDSD · cấm invent Leave L2 · cấm seed inbox · uat_done false
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
const HRM = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-PO-UC-TC-W4-QA-SELF-FD-02-browser.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/PO-UC-TC-W4-QA-SELF-FD-02');
mkdirSync(SCREEN, { recursive: true });

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();
const ACTOR = EMAIL.toLowerCase();

const results = {
  work_item_id: 'PO-UC-TC-W4-QA-SELF-FD-02',
  startedAt: ts(),
  u65: 'zero-seed',
  hdsd_align: true,
  uat_done: false,
  leave_l2_invented: false,
  env: { PORTAL, XBOS, HRM, EMAIL, commit: COMMIT },
  hdsd_inventory: [
    'Login portal (ceo@xe.vn) — clear session',
    'Hộp thư /command-center/inbox (UF-XBOS-08)',
    'Mở chi tiết task — chứng minh submitter.userId === actor',
    'Duyệt / complete → expect 4xx XBOS-WF-422 BR-WF-04 · F5 still pending',
    'Control: Duyệt task non-self → 201 XBOS-WF-200',
  ],
  be_cite: 'docs/qa/evidence/po-uc-tc-w4-be-wf-self-fd-02.md · Jest workflow-engine 17/17',
  l0: {},
  uc: {},
  steps: {},
  click_log: [],
  network: [],
  requestHeaders: [],
  as_is: {},
  residuals: [],
  screens: [],
  consoleErrors: [],
  pageErrors: [],
  endedAt: null,
  overall: null,
};

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(results, null, 2));
}
function log(msg, extra = {}) {
  const row = { at: ts(), msg, ...extra };
  results.click_log.push(row);
  console.error(`[${results.click_log.length}] ${msg}`, extra.note || '');
  return row;
}
function recordStep(id, verdict, detail = {}) {
  results.steps[id] = { ...detail, verdict, at: ts() };
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 480)}`);
  save();
}
function setUc(ucId, payload) {
  results.uc[ucId] = { ...(results.uc[ucId] || {}), ...payload, at: ts() };
  save();
}
async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  results.screens.push(path.replace(/\\/g, '/'));
  return path;
}

function track(page) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') results.consoleErrors.push(String(msg.text()).slice(0, 280));
  });
  page.on('pageerror', (err) => results.pageErrors.push(String(err).slice(0, 280)));
  page.on('request', (req) => {
    try {
      const u = req.url();
      if (!/\/api\/(xbos|hrm)\//.test(u)) return;
      if (req.method() === 'OPTIONS') return;
      const h = req.headers();
      const entry = {
        method: req.method(),
        url: u.replace(/^https?:\/\/[^/]+/, ''),
        xCompanyId: h['x-company-id'] || h['X-Company-Id'] || null,
        at: ts(),
        postUserId: null,
      };
      if (req.method() === 'POST' && /complete|approve/.test(u)) {
        try {
          const raw = req.postData();
          if (raw) {
            const j = JSON.parse(raw);
            entry.postUserId = j.userId || j.user_id || null;
            entry.postKeys = Object.keys(j);
          }
        } catch {
          /* */
        }
      }
      results.requestHeaders.push(entry);
    } catch {
      /* */
    }
  });
  page.on('response', async (res) => {
    try {
      const u = res.url();
      if (!/\/api\/(xbos|hrm)\//.test(u)) return;
      const method = res.request().method();
      if (method === 'OPTIONS') return;
      if (!/workflow-engine|auth\/login|leave-requests|attendance\/leave/.test(u)) return;
      const entry = {
        method,
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, ''),
        at: ts(),
      };
      try {
        const body = await res.json();
        entry.code = body?.code || null;
        entry.message = String(body?.message || '').slice(0, 240);
        const d = body?.data;
        if (d && typeof d === 'object') {
          const sub =
            d.instance?.context?.submitter ||
            d.context?.submitter ||
            null;
          if (sub) {
            entry.submitterUserId = sub.userId || sub.user_id || null;
          }
          if (Array.isArray(d.items)) entry.itemsCount = d.items.length;
          if (Array.isArray(d)) entry.arrLen = d.length;
          if (d.id) entry.dataId = d.id;
          if (d.status) entry.dataStatus = d.status;
        }
      } catch {
        /* */
      }
      results.network.push(entry);
    } catch {
      /* */
    }
  });
}

async function l0() {
  const checks = {};
  for (const [k, u] of [
    ['hrm', `${HRM}/api/hrm`],
    ['xbos', `${XBOS}/api/xbos`],
    ['portal', `${PORTAL}/`],
  ]) {
    try {
      const r = await fetch(u);
      checks[k] = { status: r.status, ok: r.status === 200 };
    } catch (e) {
      checks[k] = { status: 0, ok: false, err: String(e).slice(0, 120) };
    }
  }
  results.l0 = checks;
  const ok = checks.hrm?.ok && checks.xbos?.ok && checks.portal?.ok;
  recordStep('L0', ok ? 'PASS' : 'FAIL', {
    summary: `hrm=${checks.hrm?.status} xbos=${checks.xbos?.status} portal=${checks.portal?.status}`,
  });
  if (!ok) throw new Error('L0 FAIL');
}

async function clearAuth(page) {
  await page.goto(`${PORTAL}/login`, { waitUntil: 'domcontentloaded', timeout: 90000 }).catch(() => {});
  await page.evaluate(() => {
    for (const store of [localStorage, sessionStorage]) store.clear();
  });
}

async function loginUi(page) {
  await clearAuth(page);
  await page.goto(`${PORTAL}/login`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(400);
  const emailInput = page
    .locator('input[type="email"], input[name="email"], input[autocomplete="username"]')
    .first();
  const passInput = page
    .locator('input[type="password"], input[name="password"], input[autocomplete="current-password"]')
    .first();
  await emailInput.waitFor({ state: 'visible', timeout: 20000 });
  await emailInput.fill('');
  await emailInput.fill(EMAIL);
  await passInput.fill('');
  await passInput.fill(PASSWORD);
  const before = results.network.length;
  await page
    .locator('button[type="submit"], button')
    .filter({ hasText: /Đăng nhập|Login/i })
    .first()
    .click();
  log('LOGIN_CEO');
  await sleep(2500);
  const loginNet = results.network
    .slice(before)
    .filter((n) => /\/auth\/login/.test(n.url) && n.method === 'POST')
    .pop();
  if (!loginNet || loginNet.status >= 400) {
    throw new Error(`CEO login fail status=${loginNet?.status} code=${loginNet?.code}`);
  }
  await page.goto(`${PORTAL}/command-center`, {
    waitUntil: 'domcontentloaded',
    timeout: 90000,
  });
  await sleep(1200);
  recordStep('LOGIN', 'PASS', {
    summary: `POST login ${loginNet.status} ${loginNet.code || ''}`,
  });
}

/** API probe (read-only) to locate proven self + non-self task ids for browser targeting */
async function probeCandidates(page) {
  const token = await page.evaluate(() => {
    const keys = Object.keys(localStorage);
    for (const k of keys) {
      try {
        const v = localStorage.getItem(k);
        if (!v) continue;
        if (v.startsWith('eyJ')) return v;
        const j = JSON.parse(v);
        const t =
          j?.accessToken ||
          j?.access_token ||
          j?.token ||
          j?.data?.accessToken ||
          j?.data?.access_token;
        if (typeof t === 'string' && t.startsWith('eyJ')) return t;
      } catch {
        /* */
      }
    }
    return null;
  });
  results.as_is.tokenFromStorage = !!token;
  if (!token) {
    // fallback login API
    const loginRes = await fetch(`${XBOS}/api/xbos/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
    });
    const lj = await loginRes.json();
    const t = lj?.data?.accessToken || lj?.data?.access_token;
    results.as_is.tokenFromApiLogin = !!t;
    return locateWithToken(t);
  }
  return locateWithToken(token);
}

async function locateWithToken(token) {
  if (!token) return { self: null, control: null, list: [] };
  const headers = {
    Authorization: `Bearer ${token}`,
    'x-company-id': 'main',
  };
  const tasksRes = await fetch(
    `${XBOS}/api/xbos/workflow-engine/tasks?status=pending&limit=80`,
    { headers },
  );
  const tj = await tasksRes.json();
  const data = tj?.data;
  const arr = Array.isArray(data)
    ? data
    : Array.isArray(data?.items)
      ? data.items
      : Array.isArray(data?.tasks)
        ? data.tasks
        : [];
  const enriched = [];
  for (const it of arr.slice(0, 45)) {
    const taskId = it.id || it.taskId;
    const instanceId = it.instance_id || it.instanceId;
    if (!instanceId || !taskId) continue;
    const detRes = await fetch(
      `${XBOS}/api/xbos/workflow-engine/instances/${instanceId}/detail`,
      { headers },
    );
    const det = await detRes.json();
    // Detail envelope: { instance, tasks } — submitter lives on instance.context
    const ctx = det?.data?.instance?.context || det?.data?.context || {};
    const subUid = String(ctx?.submitter?.userId || ctx?.submitter?.user_id || '')
      .trim()
      .toLowerCase();
    const assignee = String(it.assignee_user_id || it.assigneeUserId || '')
      .trim()
      .toLowerCase();
    const biz =
      it.business_type ||
      it.businessType ||
      det?.data?.business_type ||
      det?.data?.businessType ||
      null;
    enriched.push({
      taskId,
      instanceId,
      submitter: subUid || null,
      assignee: assignee || null,
      businessType: biz,
      title: String(it.title || it.subject || it.business_id || '').slice(0, 80),
    });
  }
  const self =
    enriched.find(
      (r) =>
        r.submitter === ACTOR &&
        r.assignee === ACTOR &&
        (r.businessType === 'hrm_leave' || r.businessType === 'hrm_candidate'),
    ) ||
    enriched.find((r) => r.submitter === ACTOR && r.assignee === ACTOR) ||
    null;
  // Prefer catalog/extension (null submitter) or leave with submitter ≠ actor — never self
  const control =
    enriched.find(
      (r) =>
        r.assignee === ACTOR &&
        r.submitter &&
        r.submitter !== ACTOR &&
        r.businessType === 'hrm_leave',
    ) ||
    enriched.find(
      (r) =>
        r.assignee === ACTOR &&
        !r.submitter &&
        r.businessType === 'hrm_catalog_extension',
    ) ||
    enriched.find(
      (r) =>
        r.assignee === ACTOR &&
        (!r.submitter || r.submitter !== ACTOR) &&
        r.taskId !== self?.taskId,
    ) ||
    null;
  results.as_is.probe = {
    pendingCount: arr.length,
    enrichedCount: enriched.length,
    self,
    control,
  };
  save();
  return { self, control, list: enriched };
}

async function openInbox(page) {
  await page.goto(`${PORTAL}/command-center/inbox`, {
    waitUntil: 'domcontentloaded',
    timeout: 90000,
  });
  await sleep(2500);
  await shot(page, '01-inbox');
  const cards = page.locator('[data-testid="cc-inbox-task-card"]');
  const cardCount = await cards.count().catch(() => 0);
  recordStep('INB-LIST', cardCount > 0 ? 'PASS' : 'BLOCKED', {
    summary: `cards=${cardCount}`,
  });
  return { cards, cardCount };
}

async function findCardIndexByTaskId(cards, cardCount, taskId) {
  const needle = String(taskId).toLowerCase();
  for (let i = 0; i < Math.min(cardCount, 60); i++) {
    const card = cards.nth(i);
    const attrs = [
      await card.getAttribute('data-task-id').catch(() => null),
      await card.getAttribute('data-id').catch(() => null),
      await card.getAttribute('data-instance-id').catch(() => null),
    ];
    const html = (await card.innerHTML().catch(() => '')) || '';
    if (attrs.some((a) => a && String(a).toLowerCase() === needle) || html.toLowerCase().includes(needle)) {
      return i;
    }
  }
  return -1;
}

async function clickApproveOnCard(page, cards, idx, label) {
  const target = cards.nth(idx);
  await target.scrollIntoViewIfNeeded().catch(() => {});
  await shot(page, `${label}-card`);
  const approveBtn = target.getByTestId(/hdsd-cc-leave-approve|cc-inbox-task-approve/);
  const before = results.network.length;
  let clicked = false;
  if (await approveBtn.isVisible({ timeout: 3500 }).catch(() => false)) {
    await approveBtn.click();
    clicked = true;
    log(`CLICK_APPROVE_${label}`, { note: 'testid' });
  } else {
    const btn = target.locator('button').filter({ hasText: /Duyệt|Xử lý nhanh/i }).first();
    if (await btn.isVisible({ timeout: 2500 }).catch(() => false)) {
      await btn.click();
      clicked = true;
      log(`CLICK_APPROVE_${label}`, { note: 'text' });
    }
  }
  // confirm dialog if any
  const confirm = page
    .locator('button')
    .filter({ hasText: /Xác nhận|Đồng ý|Duyệt|OK/i })
    .last();
  if (await confirm.isVisible({ timeout: 1500 }).catch(() => false)) {
    await confirm.click().catch(() => {});
    log(`CONFIRM_${label}`);
  }
  await sleep(3500);
  await shot(page, `${label}-after`);
  const completeNet = results.network
    .slice(before)
    .filter(
      (n) =>
        n.method === 'POST' &&
        /tasks\/.+\/(complete|approve)|leave.*approv|workflow-engine/.test(n.url),
    )
    .pop();
  return { clicked, completeNet };
}

async function openDetailProveSubmitter(page, cards, idx, expectedSubmitter) {
  const target = cards.nth(idx);
  await target.scrollIntoViewIfNeeded().catch(() => {});
  const detail = target.locator('a, button').filter({ hasText: /Mở chi tiết/i }).first();
  const before = results.network.length;
  if (await detail.isVisible({ timeout: 2500 }).catch(() => false)) {
    await detail.click();
    log('CLICK_DETAIL_SELF');
  } else {
    await target.click().catch(() => {});
    log('CLICK_CARD_SELF');
  }
  await sleep(2200);
  await shot(page, '02-self-detail');
  const detNet = results.network
    .slice(before)
    .filter((n) => n.method === 'GET' && /instances\/.+\/detail/.test(n.url))
    .pop();
  const body = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
  const uiHint =
    /ceo@xe\.vn/i.test(body) ||
    (/Người gửi|Submitter|Người nộp|Người tạo/i.test(body) && /ceo/i.test(body));
  const apiSubmitter = String(detNet?.submitterUserId || '').toLowerCase();
  const proven =
    apiSubmitter === expectedSubmitter ||
    (uiHint && expectedSubmitter === ACTOR);
  results.as_is.self_detail = {
    detStatus: detNet?.status,
    detCode: detNet?.code,
    apiSubmitter: apiSubmitter || null,
    uiHint,
    proven,
    bodySlice: body.slice(0, 360),
  };
  return { proven, detNet, apiSubmitter };
}

async function runSelfAndControl(page) {
  const tcsInb = {
    'TC-CC-P0-06-INB-SELF-FD-001': 'BLOCKED',
  };
  const tcsCv = {
    'TC-DM-CC-06-CV-SELF-FD-001': 'BLOCKED',
  };

  const { self, control } = await probeCandidates(page);
  const { cards, cardCount } = await openInbox(page);
  if (cardCount === 0) {
    recordStep('INB-SELF', 'BLOCKED', {
      summary: 'Inbox empty — U65 cấm seed; BE unit PASS cited',
    });
    results.residuals.push({
      id: 'R-W4E1-SELF-FD-EVIDENCE',
      owner: 'qa',
      sev: 'P1',
      status: 'OPEN',
      note: 'No inbox cards for browser FD; BE Jest XBOS-WF-422 PASS',
    });
    setUc('UC-CC-P0-06', { execution: 'BLOCKED', tcs: tcsInb });
    setUc('UC-XBOS-CC-06', { execution: 'BLOCKED', tcs: tcsCv, note: 'self FD only this seat' });
    return 'BLOCKED';
  }

  // --- SELF FD ---
  if (!self) {
    recordStep('INB-SELF', 'BLOCKED', {
      summary:
        'No pending task with submitter=assignee=actor proven via detail API — honest BLOCKED; BE unit PASS',
    });
    results.residuals.push({
      id: 'R-W4E1-SELF-FD-EVIDENCE',
      owner: 'qa',
      sev: 'P1',
      status: 'OPEN',
      note: 'FE cannot prove submitter=approver on visible assignee card; cite BE unit',
    });
    tcsInb['TC-CC-P0-06-INB-SELF-FD-001'] = 'BLOCKED';
    tcsCv['TC-DM-CC-06-CV-SELF-FD-001'] = 'BLOCKED';
  } else {
    let idx = await findCardIndexByTaskId(cards, cardCount, self.taskId);
    if (idx < 0) {
      // fallback: first hrm_leave card (probe said self leave exists for CEO)
      for (let i = 0; i < Math.min(cardCount, 40); i++) {
        const biz = await cards.nth(i).getAttribute('data-business-type').catch(() => null);
        if (biz === self.businessType || biz === 'hrm_leave') {
          idx = i;
          break;
        }
      }
    }
    results.as_is.self_card_idx = idx;
    if (idx < 0) {
      recordStep('INB-SELF', 'BLOCKED', {
        summary: `API self task ${self.taskId} not matched on FE cards=${cardCount}`,
      });
      tcsInb['TC-CC-P0-06-INB-SELF-FD-001'] = 'BLOCKED';
      tcsCv['TC-DM-CC-06-CV-SELF-FD-001'] = 'BLOCKED';
      results.residuals.push({
        id: 'R-W4E1-SELF-FD-EVIDENCE',
        owner: 'dev-fe',
        sev: 'P1',
        status: 'OPEN',
        note: 'Self candidate in API list but card not addressable by taskId on FE',
      });
    } else {
      const { proven, detNet } = await openDetailProveSubmitter(page, cards, idx, ACTOR);
      // Prefer API probe proof (submitter===actor) even if UI text sparse
      const provenSelf = proven || (self.submitter === ACTOR && self.assignee === ACTOR);
      results.as_is.provenSelf = provenSelf;

      await page.goto(`${PORTAL}/command-center/inbox`, {
        waitUntil: 'domcontentloaded',
        timeout: 90000,
      });
      await sleep(1800);
      const cards2 = page.locator('[data-testid="cc-inbox-task-card"]');
      let idx2 = await findCardIndexByTaskId(cards2, await cards2.count(), self.taskId);
      if (idx2 < 0) idx2 = idx;

      if (!provenSelf) {
        recordStep('INB-SELF', 'BLOCKED', {
          summary: 'submitter≠proven — no Duyệt (avoid invent FAIL); BE unit PASS',
        });
        tcsInb['TC-CC-P0-06-INB-SELF-FD-001'] = 'BLOCKED';
        tcsCv['TC-DM-CC-06-CV-SELF-FD-001'] = 'BLOCKED';
      } else {
        const { clicked, completeNet } = await clickApproveOnCard(page, cards2, idx2, '03-self');
        // F5 — task should remain pending if 422
        await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
        await sleep(1800);
        await shot(page, '04-self-f5');
        const stillPendingHint = await (async () => {
          const c = page.locator('[data-testid="cc-inbox-task-card"]');
          const n = await c.count().catch(() => 0);
          const byId = await findCardIndexByTaskId(c, n, self.taskId);
          return { cardCountAfter: n, stillVisibleIdx: byId };
        })();
        results.as_is.self_f5 = stillPendingHint;

        const blocked422 =
          completeNet &&
          completeNet.status >= 400 &&
          (completeNet.code === 'XBOS-WF-422' ||
            /BR-WF-04|Self-approve|submitter/i.test(completeNet.message || ''));
        const wronglyOk = completeNet && completeNet.status >= 200 && completeNet.status < 300;

        if (!clicked) {
          tcsInb['TC-CC-P0-06-INB-SELF-FD-001'] = 'BLOCKED';
          recordStep('INB-SELF', 'BLOCKED', {
            summary: `Proven self but Duyệt control missing; det=${detNet?.status}`,
          });
        } else if (blocked422) {
          tcsInb['TC-CC-P0-06-INB-SELF-FD-001'] = 'PASS';
          recordStep('INB-SELF', 'PASS', {
            summary: `POST complete ${completeNet.status} ${completeNet.code} msg=${(completeNet.message || '').slice(0, 120)} task=${self.taskId} f5Cards=${stillPendingHint.cardCountAfter}`,
          });
        } else if (wronglyOk) {
          tcsInb['TC-CC-P0-06-INB-SELF-FD-001'] = 'FAIL';
          recordStep('INB-SELF', 'FAIL', {
            summary: `Self-approve allowed ${completeNet.status} ${completeNet.code} — BR-WF-04 not enforced on browser complete`,
          });
          results.residuals.push({
            id: 'R-W4E1-SELF-BR-WF-04',
            owner: 'dev-be',
            sev: 'P0',
            status: 'OPEN',
            note: 'Browser complete 2xx when submitter=actor proven',
          });
        } else {
          tcsInb['TC-CC-P0-06-INB-SELF-FD-001'] = 'PARTIAL';
          recordStep('INB-SELF', 'PARTIAL', {
            summary: `clicked=${clicked} net=${completeNet?.status} code=${completeNet?.code || 'n/a'}`,
          });
        }
        tcsCv['TC-DM-CC-06-CV-SELF-FD-001'] = tcsInb['TC-CC-P0-06-INB-SELF-FD-001'];
      }
    }
  }

  // --- CONTROL non-self ---
  await page.goto(`${PORTAL}/command-center/inbox`, {
    waitUntil: 'domcontentloaded',
    timeout: 90000,
  });
  await sleep(1800);
  const cardsC = page.locator('[data-testid="cc-inbox-task-card"]');
  const countC = await cardsC.count().catch(() => 0);
  let controlVerdict = 'BLOCKED';
  if (!control) {
    recordStep('INB-CONTROL', 'BLOCKED', {
      summary: 'No non-self pending assignee=CEO for control 201',
    });
  } else {
    let cIdx = await findCardIndexByTaskId(cardsC, countC, control.taskId);
    if (cIdx < 0) {
      for (let i = 0; i < Math.min(countC, 40); i++) {
        const biz = await cardsC.nth(i).getAttribute('data-business-type').catch(() => null);
        if (biz && biz === control.businessType) {
          // skip if this might be the same self leave card
          const html = ((await cardsC.nth(i).innerHTML().catch(() => '')) || '').toLowerCase();
          if (self && html.includes(String(self.taskId).toLowerCase())) continue;
          cIdx = i;
          break;
        }
      }
    }
    results.as_is.control_card_idx = cIdx;
    if (cIdx < 0) {
      recordStep('INB-CONTROL', 'BLOCKED', {
        summary: `control task ${control.taskId} not on FE cards`,
      });
    } else {
      // Re-check submitter via detail — must NOT equal actor
      const { proven: ctrlIsSelf, apiSubmitter } = await openDetailProveSubmitter(
        page,
        cardsC,
        cIdx,
        ACTOR,
      );
      await page.goto(`${PORTAL}/command-center/inbox`, {
        waitUntil: 'domcontentloaded',
        timeout: 90000,
      });
      await sleep(1500);
      const cardsC2 = page.locator('[data-testid="cc-inbox-task-card"]');
      let cIdx2 = await findCardIndexByTaskId(cardsC2, await cardsC2.count(), control.taskId);
      if (cIdx2 < 0) cIdx2 = cIdx;

      const nonSelf =
        (control.submitter && control.submitter !== ACTOR) ||
        !control.submitter ||
        (apiSubmitter && apiSubmitter !== ACTOR) ||
        !apiSubmitter;
      results.as_is.control_nonSelf = { nonSelf, apiSubmitter, control };

      if (!nonSelf || (ctrlIsSelf && apiSubmitter === ACTOR)) {
        recordStep('INB-CONTROL', 'BLOCKED', {
          summary: 'Selected control still looks like self — skip approve to avoid false 422',
        });
      } else {
        const { clicked, completeNet } = await clickApproveOnCard(
          page,
          cardsC2,
          cIdx2,
          '05-control',
        );
        await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
        await sleep(1500);
        await shot(page, '06-control-f5');
        if (
          clicked &&
          completeNet &&
          completeNet.status >= 200 &&
          completeNet.status < 300 &&
          (completeNet.code === 'XBOS-WF-200' || !completeNet.code)
        ) {
          controlVerdict = 'PASS';
          recordStep('INB-CONTROL', 'PASS', {
            summary: `non-self complete ${completeNet.status} ${completeNet.code} task=${control.taskId} submitter=${control.submitter || 'null'}`,
          });
        } else if (clicked && completeNet && completeNet.code === 'XBOS-WF-422') {
          controlVerdict = 'FAIL';
          recordStep('INB-CONTROL', 'FAIL', {
            summary: `non-self wrongly 422 ${completeNet.message}`,
          });
        } else if (clicked && completeNet) {
          controlVerdict = completeNet.status < 300 ? 'PASS' : 'FAIL';
          recordStep('INB-CONTROL', controlVerdict, {
            summary: `complete ${completeNet.status} ${completeNet.code}`,
          });
        } else {
          recordStep('INB-CONTROL', 'BLOCKED', {
            summary: `clicked=${clicked} no complete net`,
          });
        }
      }
    }
  }
  tcsInb['TC-CC-P0-06-INB-SELF-HP-001'] = controlVerdict; // control mirror
  results.as_is.control_verdict = controlVerdict;

  // Residual update
  if (tcsInb['TC-CC-P0-06-INB-SELF-FD-001'] === 'PASS') {
    results.residuals.push({
      id: 'R-W4E1-SELF-FD-EVIDENCE',
      owner: 'qa',
      sev: 'P1',
      status: 'CLOSED',
      note: 'Browser POST complete → XBOS-WF-422 BR-WF-04 proven; control non-self recorded separately',
    });
    results.residuals.push({
      id: 'R-W4E1-SELF-BR-WF-04',
      owner: 'dev-be',
      sev: 'P0',
      status: 'CLOSED',
      note: 'PO-UC-TC-W4-QA-SELF-FD-02 browser: self → 422 XBOS-WF-422; prior FAIL closed after BE instance_context fix',
    });
  }

  const selfV = tcsInb['TC-CC-P0-06-INB-SELF-FD-001'];
  const fail = selfV === 'FAIL' || controlVerdict === 'FAIL';
  const overall =
    fail
      ? 'FAIL'
      : selfV === 'PASS' && controlVerdict === 'PASS'
        ? 'PASS'
        : selfV === 'PASS' || controlVerdict === 'PASS'
          ? 'PARTIAL'
          : 'BLOCKED';

  setUc('UC-CC-P0-06', {
    execution: overall === 'PASS' ? 'PARTIAL' : overall, // only SELF TCs this seat
    tcs: tcsInb,
    note: `SELF-FD=${selfV} CONTROL=${controlVerdict} leaveL2Invented=false`,
  });
  setUc('UC-XBOS-CC-06', {
    execution: tcsCv['TC-DM-CC-06-CV-SELF-FD-001'] === 'PASS' ? 'PARTIAL' : tcsCv['TC-DM-CC-06-CV-SELF-FD-001'],
    tcs: tcsCv,
    note: 'SELF-FD only (canvas OPEN/SAVE prior seats)',
  });
  return overall;
}

async function main() {
  await l0();
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'vi-VN',
  });
  const page = await context.newPage();
  track(page);
  try {
    await loginUi(page);
    const overall = await runSelfAndControl(page);
    results.overall = overall;
    recordStep('OVERALL', overall, {
      summary: `self=${results.uc['UC-CC-P0-06']?.tcs?.['TC-CC-P0-06-INB-SELF-FD-001']} control=${results.as_is.control_verdict}`,
    });
  } finally {
    results.endedAt = ts();
    save();
    await browser.close();
  }
  console.log('\n=== DONE ===');
  console.log(
    JSON.stringify(
      {
        overall: results.overall,
        uc: results.uc,
        residuals: results.residuals,
        as_is: {
          self: results.as_is.probe?.self,
          control: results.as_is.probe?.control,
          control_verdict: results.as_is.control_verdict,
          provenSelf: results.as_is.provenSelf,
        },
      },
      null,
      2,
    ),
  );
  if (results.overall === 'FAIL') process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  results.endedAt = ts();
  results.overall = 'FAIL';
  results.residuals.push({
    id: 'R-W4E1-SELF-FD-HARNESS',
    owner: 'qa',
    note: String(e).slice(0, 240),
  });
  save();
  process.exit(1);
});
