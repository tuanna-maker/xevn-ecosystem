/**
 * PO-E2E-SPINE-01-QA-W3 — HP-03 Inbox this-wave stamp → Duyệt → F5
 * Prior BE: po-e2e-spine-01-be-inbox-01.md (subjectTitle / display_title enrichment)
 * U65 zero-seed · no prior-task approve · U78 chronological
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

let PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const LEGACY_STAMP = process.env.QA_LEGACY_STAMP || 'SP2SDD8FM8';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-po-e2e-spine-01-qa-w3-browser.json');
const SCREEN_DIR = resolve(ROOT, 'docs/qa/evidence/screens/po-e2e-spine-01-qa-w3-20260803');
const NEW_STAMP = `SP3${Date.now().toString(36).slice(-7).toUpperCase()}`;
const NEW_TITLE = `YCTD HireToPay ${NEW_STAMP}`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

const results = {
  work_item_id: 'PO-E2E-SPINE-01-QA-W3',
  program: 'PO-E2E-BIZ-SPINE-01',
  spine: 'E2E-SPINE-01',
  focus: 'HP-03 · J-REC-WF-03 · UF-XBOS-08',
  startedAt: ts(),
  env: {
    PORTAL,
    EMAIL,
    u65: 'zero-seed',
    companyId: 'main',
    legacyStamp: LEGACY_STAMP,
    newStamp: NEW_STAMP,
    prior_be: 'PO-E2E-SPINE-01-BE-INBOX-01',
  },
  l0: {},
  click_log: [],
  steps: {},
  network: [],
  taskGetSamples: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  ids: { requisitionId: null, workflowInstanceId: null, approvedTaskId: null },
  stampSource: null, // legacy | new_fe_submit | absent
  matchedStamp: null,
  inboxThisWave: false,
  approveOk: false,
  seed_used: false,
};

function save() {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(results, null, 2));
}

function logClick(action, detail = {}) {
  const entry = { at: ts(), action, ...detail };
  results.click_log.push(entry);
  console.error(`[CLICK ${results.click_log.length}] ${entry.at} ${action}`, detail.url || detail.text || '');
  return entry;
}

function recordStep(id, verdict, detail) {
  results.steps[id] = { ...detail, verdict, at: ts() };
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 260)}`);
  save();
}

async function shot(page, name) {
  mkdirSync(SCREEN_DIR, { recursive: true });
  const path = join(SCREEN_DIR, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  results.screens.push({ at: ts(), name, path: path.replace(/\\/g, '/') });
  return path;
}

function track(page) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') results.consoleErrors.push(String(msg.text()).slice(0, 240));
  });
  page.on('pageerror', (err) => results.pageErrors.push(String(err).slice(0, 240)));
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
        at: ts(),
      };
      if (method === 'GET' && /workflow-engine\/tasks/i.test(u) && res.status() === 200) {
        try {
          const j = await res.json();
          const rows = j?.data?.data ?? j?.data ?? j?.items ?? j;
          const list = Array.isArray(rows) ? rows : Array.isArray(rows?.items) ? rows.items : [];
          const sample = list.slice(0, 12).map((r) => ({
            id: r.id,
            assignee: r.assignee_user_id || r.assigneeUserId,
            company_id: r.company_id,
            status: r.status,
            workflow_name: r.workflow_name || r.workflowName,
            subject_title: r.subject_title || r.subjectTitle,
            display_title: r.display_title || r.displayTitle,
            instance_id: r.instance_id || r.instanceId,
          }));
          entry.taskCount = list.length;
          entry.hasLegacy = list.some((r) =>
            [r.workflow_name, r.subject_title, r.display_title, r.title]
              .filter(Boolean)
              .some((t) => String(t).includes(LEGACY_STAMP) || /YCTD HireToPay/i.test(String(t))),
          );
          entry.hasNew = list.some((r) =>
            [r.workflow_name, r.subject_title, r.display_title, r.title]
              .filter(Boolean)
              .some((t) => String(t).includes(NEW_STAMP)),
          );
          results.taskGetSamples.push({ at: ts(), url: entry.url, status: entry.status, count: list.length, sample });
          entry.sampleTitles = sample.map((s) => s.display_title || s.subject_title || s.workflow_name).slice(0, 8);
        } catch {
          /* */
        }
      }
      if (method === 'POST' && /\/requisitions(\?|$)/.test(u) && !/submit-workflow/.test(u)) {
        try {
          const j = await res.json();
          const row = j?.data ?? j;
          if (row?.id) results.ids.requisitionId = row.id;
          entry.createdId = row?.id || null;
          entry.code = j?.code || null;
        } catch {
          /* */
        }
      }
      if (method === 'POST' && /submit-workflow/.test(u)) {
        try {
          const j = await res.json();
          results.ids.workflowInstanceId =
            j?.data?.workflowInstanceId || j?.data?.workflow_instance_id || null;
          entry.code = j?.code || null;
        } catch {
          /* */
        }
      }
      if (
        (method === 'POST' || method === 'PATCH') &&
        /workflow-engine\/tasks|complete|approve/i.test(u)
      ) {
        entry.approvePath = true;
        try {
          const j = await res.json();
          entry.code = j?.code || null;
          const tid = j?.data?.id || j?.data?.taskId;
          if (tid) results.ids.approvedTaskId = tid;
        } catch {
          /* */
        }
      }
      results.network.push(entry);
      if (results.network.length > 600) results.network.shift();
    } catch {
      /* */
    }
  });
}

function netsSince(idx, pred) {
  return results.network.slice(idx).filter(pred);
}

async function loginApi() {
  const r = await fetch(`${PORTAL}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const j = await r.json().catch(() => ({}));
  const data = j?.data ?? j;
  const token = data?.accessToken ?? data?.access_token ?? j?.accessToken;
  if (!token) throw new Error(`login failed HTTP ${r.status}`);
  const u = data?.user ?? {};
  return {
    token,
    expiresAt: Date.now() + 8 * 3600_000,
    email: EMAIL,
    user: {
      userId: u.userId || u.id || u.email || EMAIL,
      email: u.email || EMAIL,
      displayName: u.displayName || u.fullName || u.name || EMAIL,
      roles: u.roles || ['group_ceo'],
    },
    raw: data,
    companyId: 'main',
  };
}

async function injectPortalAuth(page, session) {
  await page.addInitScript((s) => {
    const payload = JSON.stringify(s.user);
    for (const store of [localStorage, sessionStorage]) {
      store.setItem('xevn.portal.accessToken', s.token);
      store.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
      store.setItem('xevn.portal.user', payload);
      store.setItem('xevn.portal.tenantId', 'xevn');
      store.setItem('xevn.portal.companyId', s.companyId);
      store.setItem('hrm_portal_mode', '1');
      store.setItem('hrm_current_company_id', s.companyId);
      store.setItem('hrm_current_tenant_id', 'xevn');
      if (s.raw?.refreshToken) store.setItem('xevn.portal.refreshToken', s.raw.refreshToken);
    }
  }, session);
}

async function probeL0() {
  for (const [name, url] of [
    ['portal', PORTAL],
    ['hrm_api', 'http://127.0.0.1:28001/api/hrm'],
    ['xbos_api', 'http://127.0.0.1:28002/api/xbos'],
  ]) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(10000) });
      results.l0[name] = r.status;
    } catch (e) {
      results.l0[name] = String(e).slice(0, 120);
    }
  }
  save();
}

async function clickText(page, re, opts = {}) {
  await page.keyboard.press('Escape').catch(() => {});
  const loc = page.getByRole(opts.role || 'button', { name: re }).first();
  if (await loc.isVisible().catch(() => false)) {
    await loc.click({ timeout: opts.timeout || 5000, force: true }).catch(() => {});
    logClick('click_role', { text: String(re), url: page.url() });
    return true;
  }
  const any = page
    .locator('button, a, [role="button"], [role="tab"], [role="menuitem"], [role="row"], tr, div')
    .filter({ hasText: re })
    .first();
  if (await any.isVisible().catch(() => false)) {
    await any.click({ timeout: opts.timeout || 5000, force: true }).catch(() => {});
    logClick('click_locator', { text: String(re), url: page.url() });
    return true;
  }
  const ok = await page.evaluate((pattern) => {
    const rx = new RegExp(pattern, 'i');
    const nodes = Array.from(
      document.querySelectorAll('button, a, [role="button"], [role="tab"], [role="menuitem"], [role="row"], tr, span, div'),
    );
    const el = nodes.find(
      (n) => rx.test((n.textContent || '').trim()) && (n.offsetParent !== null || n.getClientRects().length),
    );
    if (!el) return false;
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    return true;
  }, re.source || String(re));
  if (ok) logClick('click_eval', { text: String(re), url: page.url() });
  return ok;
}

async function dismissOverlays(page) {
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press('Escape').catch(() => {});
    await sleep(120);
  }
}

async function pickFirstOption(page) {
  await sleep(400);
  const opt = page.locator('[role="option"], [cmdk-item], [data-radix-collection-item]').first();
  if (await opt.isVisible().catch(() => false)) {
    await opt.click();
    logClick('pick_option', {});
    await sleep(250);
    return true;
  }
  await page.keyboard.press('ArrowDown').catch(() => {});
  await page.keyboard.press('Enter').catch(() => {});
  await sleep(250);
  return false;
}

async function fillFirstVisible(page, selectors, value) {
  for (const sel of selectors) {
    const el = page.locator(sel).first();
    if (!(await el.isVisible().catch(() => false))) continue;
    const tag = await el.evaluate((n) => n.tagName.toLowerCase()).catch(() => '');
    if (tag === 'input' || tag === 'textarea') {
      await el.fill(value).catch(() => {});
      logClick('fill', { sel, value: String(value).slice(0, 40) });
      return true;
    }
    const inner = el.locator('input, textarea').first();
    if (await inner.isVisible().catch(() => false)) {
      await inner.fill(value).catch(() => {});
      logClick('fill_inner', { sel, value: String(value).slice(0, 40) });
      return true;
    }
  }
  return false;
}

async function gotoCc(page, path) {
  const url = `${PORTAL}${path}`;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  logClick('goto_cc', { url });
  await sleep(3500);
  return url;
}

async function gotoRecruitment(page, tab) {
  const u = new URL('/hr/recruitment', PORTAL);
  u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', 'xevn');
  u.searchParams.set('companyId', 'main');
  if (tab) u.searchParams.set('tab', tab);
  const url = u.toString();
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  logClick('goto_recruitment', { url, tab });
  await sleep(3000);
  if (tab === 'requisitions') {
    await clickText(page, /Yêu cầu tuyển dụng/i, { role: 'button' }).catch(() => {});
    await sleep(1000);
  }
  return url;
}

function detectStampInText(body) {
  if (body.includes(LEGACY_STAMP) || /YCTD HireToPay\s*SP2SDD8FM8/i.test(body)) {
    return { hit: true, source: 'legacy', stamp: LEGACY_STAMP };
  }
  if (body.includes(NEW_STAMP) || body.includes(NEW_TITLE.slice(0, 18))) {
    return { hit: true, source: 'new_fe_submit', stamp: NEW_STAMP };
  }
  if (/YCTD HireToPay/i.test(body)) {
    const m = body.match(/YCTD HireToPay\s+(SP[0-9A-Z]+)/i);
    return { hit: true, source: m ? 'yctd_hiretopay' : 'yctd_hiretopay', stamp: m?.[1] || 'YCTD HireToPay' };
  }
  // API samples may have stamp even if UI truncated
  for (const g of results.taskGetSamples) {
    for (const s of g.sample || []) {
      const blob = [s.display_title, s.subject_title, s.workflow_name].filter(Boolean).join(' ');
      if (blob.includes(LEGACY_STAMP)) return { hit: true, source: 'legacy_api', stamp: LEGACY_STAMP, apiOnly: true };
      if (blob.includes(NEW_STAMP)) return { hit: true, source: 'new_fe_api', stamp: NEW_STAMP, apiOnly: true };
      if (/YCTD HireToPay/i.test(blob)) {
        const m = blob.match(/YCTD HireToPay\s+(SP[0-9A-Z]+)/i);
        return { hit: true, source: 'yctd_api', stamp: m?.[1] || 'YCTD HireToPay', apiOnly: !body.includes('YCTD') };
      }
    }
  }
  return { hit: false, source: 'absent', stamp: null };
}

async function scanInbox(page, shotName) {
  const net0 = results.network.length;
  const url = await gotoCc(page, '/command-center/inbox');
  await shot(page, shotName);
  const body = await page.locator('body').innerText().catch(() => '');
  const det = detectStampInText(body);
  const hasPriorRec = /tuyển|requisition|YCTD|hrm_requisition|Yêu cầu tuyển|Phê duyệt yêu cầu tuyển/i.test(body);
  const emptyHint = /không có|trống|empty|chưa có task|không có công việc/i.test(body);
  const tasksGets = netsSince(net0, (n) => n.method === 'GET' && /workflow-engine\/tasks/i.test(n.url));
  return {
    url,
    bodySample: body.slice(0, 600),
    det,
    hasPriorRec,
    emptyHint,
    tasksGets,
    networkSlice: netsSince(net0, () => true).slice(-8),
  };
}

async function createAndSubmitThisWave(page) {
  await gotoRecruitment(page, 'jd-library');
  await shot(page, '02-jd');
  // optional JD create
  const openJd = await clickText(page, /Thêm|Tạo.*JD|Tạo mẫu|Thêm mẫu/i);
  if (openJd) {
    await sleep(800);
    await fillFirstVisible(
      page,
      ['[role="dialog"] input[name="title"]', '[role="dialog"] input[type="text"]'],
      `JD HireToPay ${NEW_STAMP}`,
    );
    await clickText(page, /Lưu|Tạo|Save/i);
    await sleep(2000);
    await dismissOverlays(page);
  }

  await gotoRecruitment(page, 'requisitions');
  await shot(page, '02-req-list');
  let createBtn = await clickText(page, /Thêm yêu cầu/i);
  if (!createBtn) createBtn = await clickText(page, /Thêm yêu cầu|Tạo yêu cầu|Thêm/i);
  await sleep(1800);
  await shot(page, '02-req-dialog');

  const jt = page.locator('[data-testid="hdsd-requisition-job-template"], [data-testid="requisition-job-template"]').first();
  if (await jt.isVisible().catch(() => false)) {
    await jt.click();
    await pickFirstOption(page);
  } else {
    const combo = page.locator('[role="dialog"] [role="combobox"]').first();
    if (await combo.isVisible().catch(() => false)) {
      await combo.click();
      await pickFirstOption(page);
    }
  }

  await fillFirstVisible(
    page,
    [
      '[data-testid="hdsd-requisition-title"]',
      '[data-testid="requisition-title"]',
      '[role="dialog"] input[name="title"]',
      '[role="dialog"] input[type="text"]',
    ],
    NEW_TITLE,
  );

  const dept = page
    .locator(
      '[data-testid="hdsd-requisition-department"], [data-testid="requisition-department"], [role="dialog"] [aria-label*="phòng ban" i]',
    )
    .first();
  if (await dept.isVisible().catch(() => false)) {
    await dept.click({ timeout: 4000 }).catch(() => {});
    logClick('open_department', {});
    await pickFirstOption(page);
    const itOpt = page.locator('[role="option"], [cmdk-item]').filter({ hasText: /Kỹ thuật|IT|Công nghệ/i }).first();
    if (await itOpt.isVisible().catch(() => false)) {
      await itOpt.click().catch(() => {});
      logClick('pick_department_it', {});
    }
  }

  await fillFirstVisible(
    page,
    [
      '[data-testid="hdsd-requisition-headcount"] input',
      '[data-testid="hdsd-requisition-headcount"]',
      'input[name="headcount"]',
      '[role="dialog"] input[type="number"]',
    ],
    '1',
  );
  const emp = page.locator('[data-testid="hdsd-requisition-employment-type"]').first();
  if (await emp.isVisible().catch(() => false)) {
    await emp.click().catch(() => {});
    await pickFirstOption(page);
  } else {
    const lastCombo = page.locator('[role="dialog"] [role="combobox"]').last();
    if (await lastCombo.isVisible().catch(() => false)) {
      await lastCombo.click().catch(() => {});
      await pickFirstOption(page);
    }
  }

  const saveNet = results.network.length;
  await clickText(page, /Lưu yêu cầu|Lưu/i);
  await sleep(4000);
  const posts = netsSince(saveNet, (n) => n.method === 'POST' && /requisitions/i.test(n.url) && !/submit-workflow/i.test(n.url));
  const createOk = posts.some((p) => p.status === 201 || p.status === 200);
  await dismissOverlays(page);
  await shot(page, '02-after-create');

  await gotoRecruitment(page, 'requisitions');
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
  logClick('f5_after_create', {});
  await sleep(3500);
  await shot(page, '02-f5-create');

  const submitNet = results.network.length;
  let submitted = await page.evaluate((stamp) => {
    const rows = Array.from(document.querySelectorAll('tr, [role="row"], div'));
    const row = rows.find((n) => (n.textContent || '').includes(stamp));
    if (!row) return false;
    const btn = Array.from(row.querySelectorAll('button, a')).find((b) => /Gửi duyệt/i.test(b.textContent || ''));
    if (!btn) return false;
    btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    return true;
  }, NEW_STAMP);
  if (submitted) logClick('submit_row', { stamp: NEW_STAMP });
  if (!submitted) submitted = await clickText(page, /Gửi duyệt QT|Gửi duyệt/i);
  await sleep(4500);
  const submits = netsSince(submitNet, (n) => /submit-workflow/i.test(n.url));
  const submitOk = submits.some((s) => s.status >= 200 && s.status < 300);
  await shot(page, '02-after-submit');

  recordStep('HP02_FE_SUBMIT', createOk && submitOk ? '🟢' : createOk ? '🟡' : '🔴', {
    url: page.url(),
    clickPath: ['/hr/recruitment requisitions', 'Thêm yêu cầu', 'Lưu', 'F5', 'Gửi duyệt'],
    network: [...posts.slice(-2), ...submits.slice(-2)],
    f5: true,
    spec_ref: 'UF-HRM-12 · J-REC-WF-02 (fallback this-wave)',
    summary: `create=${createOk} submit=${submitOk} stamp=${NEW_STAMP} req=${results.ids.requisitionId} inst=${results.ids.workflowInstanceId}`,
    createOk,
    submitOk,
  });
  return { createOk, submitOk };
}

async function approveThisWave(page, stamp) {
  const approveNet = results.network.length;
  const stampRe = new RegExp(
    `${stamp.slice(0, 8)}|HireToPay|YCTD HireToPay|${LEGACY_STAMP}|${NEW_STAMP}`,
    'i',
  );
  await clickText(page, stampRe);
  await sleep(1500);
  await shot(page, '03-inbox-detail');
  const approved = await clickText(page, /Duyệt|Phê duyệt|Approve|Hoàn thành|Xử lý/i);
  await sleep(3000);
  if (approved) {
    await clickText(page, /Xác nhận|Duyệt|OK|Đồng ý/i);
    await sleep(2500);
  }
  const approves = netsSince(
    approveNet,
    (n) =>
      (n.method === 'POST' || n.method === 'PATCH') &&
      /workflow-engine\/tasks|complete|approve/i.test(n.url),
  );
  const approveOk = approves.some((a) => a.status >= 200 && a.status < 300);
  results.approveOk = approveOk;
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
  logClick('f5_inbox', {});
  await sleep(2500);
  await shot(page, '03-inbox-f5');
  const after = await page.locator('body').innerText().catch(() => '');
  const stillPending = after.includes(stamp) && /Duyệt|Phê duyệt/i.test(after);
  return { approveOk, approves, stillPending, afterSample: after.slice(0, 400) };
}

function overallAck() {
  const hp03 = results.steps.HP03;
  if (!hp03) return 'FAIL_TO_PM';
  if (hp03.verdict === '🟢' && results.approveOk && results.inboxThisWave) return 'PASS_TO_PM';
  if (hp03.verdict === '🔴') return 'FAIL_TO_PM';
  // stamp absent after BE fix + optional FE submit = FAIL
  if (!results.inboxThisWave) return 'FAIL_TO_PM';
  if (results.inboxThisWave && !results.approveOk) return 'FAIL_TO_PM';
  return 'FAIL_TO_PM';
}

async function main() {
  await probeL0();
  if (results.l0.portal !== 200 || results.l0.xbos_api !== 200) {
    results.fatal = 'L0 FAIL';
    results.ack_status = 'FAIL_TO_PM';
    save();
    console.error('FATAL L0', results.l0);
    process.exit(2);
  }

  const session = await loginApi();
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  track(page);
  await injectPortalAuth(page, session);
  await page.goto(PORTAL, { waitUntil: 'domcontentloaded', timeout: 90000 });
  logClick('open_portal', { url: PORTAL });
  await sleep(2000);
  await shot(page, '00-shell');
  recordStep('L0', '🟢', {
    url: PORTAL,
    clickPath: ['probe'],
    network: [],
    f5: null,
    spec_ref: 'L0 stack',
    summary: `portal=${results.l0.portal} hrm=${results.l0.hrm_api} xbos=${results.l0.xbos_api}`,
  });

  // Pass 1 — look for legacy / existing this-wave stamp
  let scan = await scanInbox(page, '03-inbox-pass1');
  recordStep('HP03_SCAN1', scan.det.hit ? '🟢' : '🟡', {
    url: scan.url,
    clickPath: ['/command-center/inbox'],
    network: scan.tasksGets.slice(-3),
    f5: null,
    spec_ref: 'J-REC-WF-03 · UF-XBOS-08',
    summary: `hit=${scan.det.hit} source=${scan.det.source} stamp=${scan.det.stamp} priorRec=${scan.hasPriorRec} empty=${scan.emptyHint}`,
    taskSamples: results.taskGetSamples.slice(-1),
    bodySample: scan.bodySample,
  });

  // If legacy absent — FE create+submit new stamp (U65 allowed; not seed)
  if (!scan.det.hit) {
    try {
      await createAndSubmitThisWave(page);
    } catch (e) {
      recordStep('HP02_FE_SUBMIT', '🔴', {
        url: page.url(),
        clickPath: ['create submit exception'],
        network: [],
        f5: false,
        spec_ref: 'UF-HRM-12 fallback',
        gap: String(e?.message || e).slice(0, 200),
        summary: String(e?.message || e).slice(0, 160),
      });
    }
    scan = await scanInbox(page, '03-inbox-pass2');
    recordStep('HP03_SCAN2', scan.det.hit ? '🟢' : '🔴', {
      url: scan.url,
      clickPath: ['FE submit', '/command-center/inbox'],
      network: scan.tasksGets.slice(-3),
      f5: null,
      spec_ref: 'J-REC-WF-03 after FE submit',
      summary: `hit=${scan.det.hit} source=${scan.det.source} stamp=${scan.det.stamp}`,
      taskSamples: results.taskGetSamples.slice(-1),
      bodySample: scan.bodySample,
    });
  }

  results.stampSource = scan.det.source;
  results.matchedStamp = scan.det.stamp;
  results.inboxThisWave = Boolean(scan.det.hit) && !scan.det.apiOnly;

  // Prefer UI visibility for approve; if apiOnly but UI missing → still FAIL per mission (stamp visible)
  if (scan.det.hit && !scan.det.apiOnly) {
    const ap = await approveThisWave(page, scan.det.stamp);
    let verdict = '🔴';
    let gap = null;
    if (ap.approveOk) {
      verdict = '🟢';
    } else {
      gap = 'This-wave stamp visible but Duyệt 2xx not observed';
      verdict = '🔴';
    }
    recordStep('HP03', verdict, {
      url: scan.url,
      clickPath: ['/command-center/inbox', `open ${scan.det.stamp}`, 'Duyệt', 'F5'],
      network: ap.approves.slice(-4),
      f5: true,
      spec_ref: 'HP-03 · J-REC-WF-03 · UF-XBOS-08',
      gap,
      summary: `thisWave=true source=${scan.det.source} stamp=${scan.det.stamp} approveOk=${ap.approveOk} stillPending=${ap.stillPending}`,
      stampSource: scan.det.source,
      matchedStamp: scan.det.stamp,
      approveOk: ap.approveOk,
      stillPending: ap.stillPending,
    });
  } else {
    const lastSample = results.taskGetSamples.slice(-1)[0] || null;
    recordStep('HP03', '🔴', {
      url: scan.url,
      clickPath: ['/command-center/inbox', 'observe stamp absent — no Duyệt (U65)'],
      network: scan.tasksGets.slice(-5),
      f5: false,
      spec_ref: 'HP-03 · J-REC-WF-03 · UF-XBOS-08',
      gap: scan.det.apiOnly
        ? 'Stamp in GET tasks JSON but not visible on Inbox UI cards'
        : 'THIS-WAVE stamp SP2SDD8FM8 / YCTD HireToPay absent after BE fix (+ FE submit fallback) — U65 no seed/prior approve',
      summary: `thisWave=false source=${scan.det.source} apiOnly=${Boolean(scan.det.apiOnly)} priorRec=${scan.hasPriorRec}`,
      stampSource: scan.det.source,
      matchedStamp: scan.det.stamp,
      approveOk: false,
      taskGetEvidence: lastSample,
      blocked_u65: true,
    });
  }

  results.finishedAt = ts();
  results.click_count = results.click_log.length;
  results.idle_guard = {
    qa_idle_viewport: results.click_log.length >= 6 ? 'PASS' : 'FAIL',
    click_count: results.click_log.length,
  };
  results.ack_status = overallAck();
  save();
  console.log('ACK', results.ack_status);
  console.log(
    'SUMMARY',
    Object.fromEntries(Object.entries(results.steps).map(([k, v]) => [k, v.verdict])),
  );
  console.log(
    'STAMP',
    results.stampSource,
    results.matchedStamp,
    'APPROVE',
    results.approveOk,
    'CLICKS',
    results.click_count,
    'SEED',
    results.seed_used,
  );
  await browser.close();
  process.exit(results.ack_status === 'PASS_TO_PM' ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  results.fatal = String(e);
  results.ack_status = 'FAIL_TO_PM';
  results.finishedAt = ts();
  save();
  process.exit(1);
});
