#!/usr/bin/env node
/**
 * PO-UC-TC-W4-QA-E1-P1-L2-SELF — Browser U65 P1 residual
 * Canvas tab «Sơ đồ luồng» + 2-level step config (if UI allows) + FE spawn + self-approve FD
 * LOCKS: zero-seed · hdsd_align · cấm invent Leave L2 PASS · cấm seed inbox · uat_done false
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
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-uc-tc-w4-qa-e1-p1-l2-self-browser.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-uc-tc-w4-qa-e1-p1-l2-self');
mkdirSync(SCREEN, { recursive: true });

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();
// Avoid "L2" substring in stamp — loose inbox /L2/ match was a false-positive in R1
const stamp = `W4E1-${Date.now().toString(36).slice(-6).toUpperCase()}`;

const results = {
  work_item_id: 'PO-UC-TC-W4-QA-E1-P1-L2-SELF',
  startedAt: ts(),
  u65: 'zero-seed',
  hdsd_align: true,
  uat_done: false,
  leave_l2_invented: false,
  env: { PORTAL, XBOS, HRM, EMAIL, commit: COMMIT, stamp },
  hdsd_inventory: [
    'Login portal (ceo@xe.vn)',
    'Cài đặt → Hệ thống quy trình (?settings=workflow) → Chỉnh sửa',
    'Tab Cấu hình bước & luồng → Thêm nút bước (2-level if UI allows)',
    'Tab Sơ đồ luồng → quan sát canvas dots → Lưu quy trình → F5',
    'FE business submit (HRM leave) → inbox → L2 path if present',
    'Self-approve FD (submitter≠approver BR) — expect reject/block',
  ],
  l0: {},
  uc: {},
  steps: {},
  click_log: [],
  network: [],
  as_is: {
    canvas_tab_is_visual: true,
    step_edit_on_graph_tab: true,
    leave_uses_fixed_code: 'hrm_leave_approval',
    leave_l2_spec_gap: true,
  },
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
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 420)}`);
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
  page.on('response', async (res) => {
    try {
      const u = res.url();
      if (!/\/api\/(xbos|hrm)\//.test(u)) return;
      const method = res.request().method();
      if (method === 'OPTIONS') return;
      if (!/workflow-engine|leave-requests|auth\/login|attendance\/leave/.test(u)) return;
      const entry = {
        method,
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, ''),
        at: ts(),
      };
      try {
        const body = await res.json();
        entry.code = body?.code || null;
        entry.message = String(body?.message || '').slice(0, 200);
        if (body?.data && typeof body.data === 'object') {
          const d = body.data;
          if (d.workflow_instance_id || d.workflowInstanceId) {
            entry.workflow_instance_id = d.workflow_instance_id || d.workflowInstanceId;
          }
          if (Array.isArray(d.steps)) entry.stepsCount = d.steps.length;
          if (Array.isArray(d.items)) entry.itemsCount = d.items.length;
          if (Array.isArray(d)) entry.arrLen = d.length;
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

function lastNet(pred) {
  const hits = results.network.filter(pred);
  return hits[hits.length - 1] || null;
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

async function l0() {
  const checks = {};
  for (const [k, u] of [
    ['hrm', `${HRM}/api/hrm`],
    ['xbos', `${XBOS}/api/xbos`],
    ['portal', `${PORTAL}/`],
  ]) {
    try {
      const r = await fetch(u);
      checks[k] = r.status;
    } catch (e) {
      checks[k] = `FAIL ${String(e).slice(0, 80)}`;
    }
  }
  results.l0 = checks;
  const ok = checks.hrm === 200 && checks.xbos === 200 && checks.portal === 200;
  recordStep('L0', ok ? 'PASS' : 'FAIL', { summary: JSON.stringify(checks) });
  if (!ok) throw new Error(`L0 FAIL ${JSON.stringify(checks)}`);
}

async function countApproveSteps(page) {
  // Count step rows by «Tên đầu việc» aria labels / Hành động selects
  const nameBoxes = page.locator('textarea[aria-label^="Tên đầu việc"], textarea[aria-label*="Tên đầu việc"]');
  const n = await nameBoxes.count().catch(() => 0);
  if (n > 0) return n;
  const actionSelects = page.locator('select[aria-label="Hành động"]');
  return await actionSelects.count().catch(() => 0);
}

async function runCanvasL2(page) {
  const uc = 'UC-XBOS-CC-06';
  const tcs = {};
  try {
    await page.goto(`${PORTAL}/command-center?settings=workflow`, {
      waitUntil: 'domcontentloaded',
      timeout: 90000,
    });
    await sleep(2500);
    let body = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
    if (!/Hệ thống quy trình|Thêm quy trình mới/i.test(body)) {
      throw new Error('Workflow settings list not reached');
    }
    await shot(page, '01-wf-list');

    const editBtn = page.locator('button').filter({ hasText: /^Chỉnh sửa$/i }).first();
    if (!(await editBtn.isVisible({ timeout: 8000 }).catch(() => false))) {
      tcs['TC-DM-CC-06-CV-L2-HP-001'] = 'BLOCKED';
      tcs['TC-DM-CC-06-CV-SELF-FD-001'] = 'BLOCKED';
      recordStep('CV-EDIT', 'BLOCKED', { summary: 'No Chỉnh sửa button on workflow list' });
      setUc(uc, { execution: 'BLOCKED', tcs });
      return { verdict: 'BLOCKED', stepsAfter: 0, savedL2: false };
    }
    await editBtn.click();
    log('CLICK_CHINH_SUA');
    await sleep(2000);
    await shot(page, '02-wf-detail-graph');

    // Prefer graph tab for step edit (Sơ đồ is visual)
    const graphTab = page.getByRole('tab', { name: /Cấu hình bước/i }).first();
    if (await graphTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await graphTab.click();
      log('CLICK_TAB_GRAPH');
      await sleep(800);
    }

    const stepsBefore = await countApproveSteps(page);
    log('STEPS_BEFORE', { note: String(stepsBefore) });

    const addBtn = page.locator('button').filter({ hasText: /Thêm nút bước/i }).first();
    const addVisible = await addBtn.isVisible({ timeout: 4000 }).catch(() => false);
    let addedSecond = false;
    if (addVisible && stepsBefore < 2) {
      await addBtn.click();
      log('CLICK_THEM_NUT_BUOC');
      await sleep(1000);
      const stepsMid = await countApproveSteps(page);
      if (stepsMid >= 2) {
        // Name both approve steps for sticky proof
        const names = page.locator('textarea[aria-label^="Tên đầu việc"], textarea[aria-label*="Tên đầu việc"]');
        const c = await names.count();
        if (c >= 1) {
          await names.nth(0).fill(`QA L1 duyệt ${stamp}`);
        }
        if (c >= 2) {
          await names.nth(1).fill(`QA L2 duyệt ${stamp}`);
          // Ensure second action = Phê duyệt
          const actions = page.locator('select[aria-label="Hành động"]');
          if ((await actions.count()) >= 2) {
            await actions.nth(1).selectOption({ label: 'Phê duyệt' }).catch(async () => {
              await actions.nth(1).selectOption('approve').catch(() => {});
            });
          }
          addedSecond = true;
        }
      }
    } else if (stepsBefore >= 2) {
      addedSecond = true;
      log('ALREADY_TWO_STEPS', { note: String(stepsBefore) });
      const names = page.locator('textarea[aria-label^="Tên đầu việc"], textarea[aria-label*="Tên đầu việc"]');
      if ((await names.count()) >= 2) {
        const cur = await names.nth(1).inputValue().catch(() => '');
        await names.nth(1).fill(`${String(cur || 'L2').replace(/\s*·L2S-\w+$/, '')} ·${stamp}`);
      }
    }

    const stepsAfterGraph = await countApproveSteps(page);
    await shot(page, '03-wf-two-steps-graph');

    // Tab Sơ đồ luồng — visual canvas
    const canvasTab = page.getByRole('tab', { name: /Sơ đồ luồng/i }).first();
    let canvasDots = false;
    let canvasTabOk = false;
    if (await canvasTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await canvasTab.click();
      log('CLICK_TAB_SO_DO');
      await sleep(1200);
      canvasTabOk = true;
      canvasDots =
        (await page.locator('.bg-workflow-canvas-dots, [data-testid="workflow-canvas"]').count()) > 0;
      await shot(page, '04-wf-canvas-sodo');
      const canvasBody = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
      results.as_is.canvas_body_hint = /Sơ đồ luồng|QA L1|QA L2|Phê duyệt/i.test(canvasBody);
    } else {
      recordStep('CV-GRAPH-TAB', 'BLOCKED', { summary: 'Tab Sơ đồ luồng not visible' });
    }

    tcs['TC-DM-CC-06-CV-OPEN-HP-001'] = canvasTabOk && canvasDots ? 'PASS' : canvasTabOk ? 'PARTIAL' : 'FAIL';
    recordStep('CV-CANVAS-TAB', tcs['TC-DM-CC-06-CV-OPEN-HP-001'], {
      summary: `canvasTabOk=${canvasTabOk} dots=${canvasDots} stepsGraph=${stepsAfterGraph} addedSecond=${addedSecond}`,
    });

    // Save from either tab
    const saveBtn = page.locator('button').filter({ hasText: /Lưu quy trình/i }).first();
    const saveVisible = await saveBtn.isVisible({ timeout: 4000 }).catch(() => false);
    let savedL2 = false;
    if (saveVisible) {
      // mild name stamp
      const nameBox = page.getByLabel(/Tên quy trình/i).first();
      if (await nameBox.isVisible({ timeout: 1500 }).catch(() => false)) {
        const cur = await nameBox.inputValue().catch(() => '');
        await nameBox.fill(`${String(cur || 'WF').replace(/\s*·L2S-\w+$/, '')} ·${stamp}`);
      }
      const before = results.network.length;
      await saveBtn.click();
      log('CV_SAVE');
      await sleep(3000);
      const saveNet = results.network
        .slice(before)
        .filter(
          (n) =>
            /workflow-engine\/definitions/.test(n.url) &&
            (n.method === 'POST' || n.method === 'PUT'),
        )
        .pop();
      const saveOk = !!(saveNet && saveNet.status >= 200 && saveNet.status < 300);
      tcs['TC-DM-CC-06-CV-SAVE-HP-001'] = saveOk ? 'PASS' : saveNet ? 'FAIL' : 'PARTIAL';
      recordStep('CV-SAVE', tcs['TC-DM-CC-06-CV-SAVE-HP-001'], {
        summary: `save=${saveNet?.status} code=${saveNet?.code} steps=${stepsAfterGraph}`,
      });

      if (saveOk) {
        await page.goto(`${PORTAL}/command-center?settings=workflow`, {
          waitUntil: 'domcontentloaded',
          timeout: 90000,
        });
        await sleep(2000);
        await shot(page, '05-wf-f5');
        // Re-open to verify step count sticky
        const edit2 = page.locator('button').filter({ hasText: /^Chỉnh sửa$/i }).first();
        if (await edit2.isVisible({ timeout: 5000 }).catch(() => false)) {
          await edit2.click();
          await sleep(1800);
          const graphTab2 = page.getByRole('tab', { name: /Cấu hình bước/i }).first();
          if (await graphTab2.isVisible({ timeout: 2000 }).catch(() => false)) {
            await graphTab2.click();
            await sleep(600);
          }
          const stickySteps = await countApproveSteps(page);
          savedL2 = stickySteps >= 2;
          await shot(page, '06-wf-reopen-steps');
          recordStep('CV-L2-STICKY', savedL2 ? 'PASS' : 'PARTIAL', {
            summary: `stickySteps=${stickySteps} stamp=${stamp}`,
          });
        }
      }
    } else {
      tcs['TC-DM-CC-06-CV-SAVE-HP-001'] = 'BLOCKED';
      recordStep('CV-SAVE', 'BLOCKED', { summary: 'Lưu quy trình not visible' });
    }

    // L2 HP for canvas = 2 approve steps persisted via FE (not Leave L2)
    if (savedL2 || (addedSecond && tcs['TC-DM-CC-06-CV-SAVE-HP-001'] === 'PASS')) {
      tcs['TC-DM-CC-06-CV-L2-HP-001'] = savedL2 ? 'PASS' : 'PARTIAL';
    } else if (!addVisible && stepsBefore < 2) {
      tcs['TC-DM-CC-06-CV-L2-HP-001'] = 'BLOCKED';
      results.residuals.push({
        id: 'R-W4E1-CV-L2-UI',
        owner: 'dev-fe',
        note: 'UI does not expose Thêm nút bước / 2-level config on AS-IS path',
      });
    } else {
      tcs['TC-DM-CC-06-CV-L2-HP-001'] = 'BLOCKED';
      results.residuals.push({
        id: 'R-W4E1-CV-L2-PERSIST',
        owner: 'dev-fe',
        note: `2-level add attempted (before=${stepsBefore} after=${stepsAfterGraph}) but sticky <2 or save failed`,
      });
    }
    tcs['TC-DM-CC-06-CV-L2-FD-001'] = 'BLOCKED'; // not forced empty L2 resolver this seat
    recordStep('CV-L2', tcs['TC-DM-CC-06-CV-L2-HP-001'], {
      summary: `addedSecond=${addedSecond} savedL2=${savedL2} stepsBefore=${stepsBefore} stepsAfter=${stepsAfterGraph}`,
    });

    const fail = Object.values(tcs).some((v) => v === 'FAIL');
    const hasPass = Object.values(tcs).some((v) => v === 'PASS');
    const verdict = fail ? 'FAIL' : hasPass ? (Object.values(tcs).some((v) => v === 'BLOCKED' || v === 'PARTIAL') ? 'PARTIAL' : 'PASS') : 'BLOCKED';
    setUc(uc, {
      execution: verdict,
      tcs,
      note: `canvas L2 config=${tcs['TC-DM-CC-06-CV-L2-HP-001']} (WF definition UI; NOT Leave L2)`,
    });
    return { verdict, stepsAfter: stepsAfterGraph, savedL2, tcs };
  } catch (e) {
    setUc(uc, { execution: 'FAIL', tcs, note: String(e).slice(0, 240) });
    recordStep('CV-ERR', 'FAIL', { summary: String(e) });
    return { verdict: 'FAIL', stepsAfter: 0, savedL2: false, tcs };
  }
}

async function runFeSpawnAndInbox(page) {
  const uc = 'UC-CC-P0-06';
  const tcs = {};
  try {
    // FE business submit: HRM leave create as CEO (U65 — no seed)
    const leaveUrls = [
      `${PORTAL}/hr/attendance/leave`,
      `${PORTAL}/hr/attendance?tab=leave`,
      `${PORTAL}/command-center/hr/attendance/leave`,
    ];
    let leaveUi = false;
    for (const u of leaveUrls) {
      await page.goto(u, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});
      await sleep(2000);
      const body = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
      if (/Nghỉ phép|Đơn nghỉ|Tạo đơn|Leave/i.test(body) && !/404|Not Found/i.test(body)) {
        leaveUi = true;
        log('LEAVE_UI', { note: u });
        await shot(page, '07-leave-ui');
        break;
      }
    }

    let spawned = false;
    let spawnNet = null;
    if (leaveUi) {
      const createBtn = page
        .locator('button, a')
        .filter({ hasText: /Tạo đơn|Thêm đơn|New leave|Xin nghỉ/i })
        .first();
      if (await createBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
        await createBtn.click();
        log('CLICK_CREATE_LEAVE');
        await sleep(1500);
        await shot(page, '08-leave-form');
      }
      // Fill minimal fields if form present
      const start = page
        .locator('input[type="date"], input[name*="start"], input[aria-label*="Từ"]')
        .first();
      const end = page
        .locator('input[type="date"], input[name*="end"], input[aria-label*="Đến"]')
        .nth(1);
      const today = new Date();
      const d1 = new Date(today.getTime() + 7 * 86400000);
      const d2 = new Date(today.getTime() + 8 * 86400000);
      const iso = (d) => d.toISOString().slice(0, 10);
      if (await start.isVisible({ timeout: 2500 }).catch(() => false)) {
        await start.fill(iso(d1)).catch(() => {});
      }
      if (await end.isVisible({ timeout: 1500 }).catch(() => false)) {
        await end.fill(iso(d2)).catch(() => {});
      }
      const reason = page
        .locator('textarea, input[name*="reason"], input[aria-label*="Lý do"]')
        .first();
      if (await reason.isVisible({ timeout: 1500 }).catch(() => false)) {
        await reason.fill(`QA L2-SELF FE spawn ${stamp}`);
      }
      const submit = page
        .locator('button')
        .filter({ hasText: /Gửi|Lưu|Tạo đơn|Submit/i })
        .first();
      if (await submit.isVisible({ timeout: 3000 }).catch(() => false)) {
        const before = results.network.length;
        await submit.click();
        log('LEAVE_SUBMIT');
        await sleep(3500);
        spawnNet = results.network
          .slice(before)
          .filter(
            (n) =>
              n.method === 'POST' &&
              /leave-requests|workflow-engine\/instances/.test(n.url),
          )
          .pop();
        spawned = !!(spawnNet && spawnNet.status >= 200 && spawnNet.status < 300);
        await shot(page, '09-leave-after-submit');
        recordStep('FE-SPAWN', spawned ? 'PASS' : spawnNet ? 'FAIL' : 'BLOCKED', {
          summary: `leaveUi post=${spawnNet?.status} code=${spawnNet?.code} wf=${spawnNet?.workflow_instance_id || 'n/a'}`,
        });
      } else {
        recordStep('FE-SPAWN', 'BLOCKED', {
          summary: 'Leave form submit control not found — AS-IS FE path incomplete for CEO',
        });
      }
    } else {
      recordStep('FE-SPAWN', 'BLOCKED', {
        summary: 'Leave UI route not reached for CEO — will use existing FE-origin inbox cards only',
      });
    }

    // Inbox
    await page.goto(`${PORTAL}/command-center/inbox`, {
      waitUntil: 'domcontentloaded',
      timeout: 90000,
    });
    await sleep(2500);
    await shot(page, '10-inbox');
    const cards = page.locator('[data-testid="cc-inbox-task-card"]');
    const cardCount = await cards.count().catch(() => 0);
    tcs['TC-CC-P0-06-INB-LIST-HP-001'] = cardCount > 0 ? 'PASS' : 'BLOCKED';
    recordStep('INB-LIST', tcs['TC-CC-P0-06-INB-LIST-HP-001'], {
      summary: `cards=${cardCount} spawned=${spawned}`,
    });

    // Detect L2 markers in cards (level / cấp 2) — honest
    let l2CardIdx = -1;
    let selfCardIdx = -1;
    let feIdx = -1;
    for (let i = 0; i < Math.min(cardCount, 30); i++) {
      const card = cards.nth(i);
      const biz = await card.getAttribute('data-business-type').catch(() => null);
      const txt = ((await card.innerText().catch(() => '')) || '').replace(/\s+/g, ' ');
      const level = await card.getAttribute('data-approval-level').catch(() => null);
      if (
        feIdx < 0 &&
        (biz === 'hrm_leave' || /Phê duyệt đơn nghỉ|Nghỉ phép|xbos-workflow/i.test(txt))
      ) {
        feIdx = i;
      }
      // Strict L2: data-approval-level=2 OR explicit «cấp 2» / «bước 2» (not bare "L2" — false-positive)
      if (
        l2CardIdx < 0 &&
        (level === '2' || /cấp\s*2|bước\s*2|level\s*[:=]?\s*2\b/i.test(txt))
      ) {
        l2CardIdx = i;
      }
      // Self probe only when our FE-spawn stamp appears on card (not WF step rename alone)
      if (selfCardIdx < 0 && spawned && new RegExp(stamp, 'i').test(txt)) {
        selfCardIdx = i;
      }
    }

    // L2 path — inbox 2nd-level card only; Leave L2 remains SPEC_GAP (do not invent)
    if (l2CardIdx >= 0) {
      const target = cards.nth(l2CardIdx);
      const biz = await target.getAttribute('data-business-type').catch(() => null);
      const txt = ((await target.innerText().catch(() => '')) || '').replace(/\s+/g, ' ').slice(0, 220);
      results.as_is.l2_card = { idx: l2CardIdx, biz, txt };
      await target.scrollIntoViewIfNeeded().catch(() => {});
      await shot(page, '11-inbox-l2-card');
      // Exercise Duyệt only for non-leave OR explicit level=2 — still not Leave-ladder PASS
      const approveBtn = target.getByTestId(/hdsd-cc-leave-approve|cc-inbox-task-approve/);
      const before = results.network.length;
      if (await approveBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await approveBtn.click();
        log('CLICK_L2_APPROVE', { note: String(biz || 'unknown') });
      } else {
        await target.locator('button').filter({ hasText: /Duyệt/i }).first().click().catch(() => {});
        log('CLICK_L2_APPROVE_TEXT', { note: String(biz || 'unknown') });
      }
      await sleep(3000);
      const completeNet = results.network
        .slice(before)
        .filter((n) => n.method === 'POST' && /complete|approve/.test(n.url))
        .pop();
      const ok = !!(completeNet && completeNet.status < 300);
      // Inbox L2 HP = WF 2nd pending step complete — NOT Leave ladder
      tcs['TC-CC-P0-06-INB-L2-HP-001'] = ok ? 'PASS' : completeNet ? 'FAIL' : 'PARTIAL';
      if (biz === 'hrm_leave') {
        results.as_is.leave_l2_card_seen = true;
        results.residuals.push({
          id: 'R-W4E1-LEAVE-L2-SPEC_GAP',
          owner: 'ba-process',
          sev: 'P1',
          note: 'hrm_leave card matched cấp/level 2 UI — still Leave ladder SPEC_GAP until dedicated leave L1→L2 AC; do not claim Leave L2 UAT',
        });
      }
      recordStep('INB-L2', tcs['TC-CC-P0-06-INB-L2-HP-001'], {
        summary: `idx=${l2CardIdx} biz=${biz || 'n/a'} complete=${completeNet?.status} code=${completeNet?.code} leaveLadderNotClaimed=true`,
      });
      await shot(page, '11-inbox-l2');
    } else {
      tcs['TC-CC-P0-06-INB-L2-HP-001'] = 'BLOCKED';
      recordStep('INB-L2', 'BLOCKED', {
        summary:
          'No L2 inbox card (cấp 2 / level=2) after FE path — AS-IS leave ladder separate SPEC_GAP; cấm invent Leave L2 PASS',
      });
      results.residuals.push({
        id: 'R-W4E1-INB-L2-ASIS',
        owner: 'ba-process',
        sev: 'P1',
        note: 'Leave uses hrm_leave_approval bridge; canvas 2-step on other defs ≠ Leave L2. SPEC_GAP until leave definition has 2 pending steps from FE spawn.',
      });
    }

    // Self-approve FD — only mutate when submitter=approver is proven (stamp spawn or detail hint)
    const probeIdx = selfCardIdx >= 0 ? selfCardIdx : feIdx;
    if (probeIdx < 0) {
      tcs['TC-CC-P0-06-INB-SELF-FD-001'] = 'BLOCKED';
      tcs['TC-DM-CC-06-CV-SELF-FD-001'] = 'BLOCKED';
      recordStep('INB-SELF', 'BLOCKED', {
        summary: 'No FE-origin inbox card to probe self-approve — U65 cấm seed',
      });
      results.residuals.push({
        id: 'R-W4E1-SELF-NO-CARD',
        owner: 'qa',
        note: 'Inbox has no FE-origin card for self FD; create leave/WF from FE as same user who receives task',
      });
    } else {
      const target = cards.nth(probeIdx);
      await target.scrollIntoViewIfNeeded().catch(() => {});
      const detail = target.locator('a, button').filter({ hasText: /Mở chi tiết/i }).first();
      if (await detail.isVisible({ timeout: 2000 }).catch(() => false)) {
        await detail.click();
        log('CLICK_DETAIL_SELF_PROBE');
        await sleep(2000);
        await shot(page, '12-self-detail');
      }
      const body = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
      const submitterIsCeo =
        /Người gửi|Submitter|Người nộp|Người tạo/i.test(body) &&
        /ceo@xe\.vn/i.test(body);
      const provenSelf = (selfCardIdx >= 0 && spawned) || submitterIsCeo;
      results.as_is.self_probe = {
        probeIdx,
        selfCardIdx,
        spawned,
        submitterHint: submitterIsCeo,
        provenSelf,
        bodySlice: body.slice(0, 400),
      };

      if (!provenSelf) {
        tcs['TC-CC-P0-06-INB-SELF-FD-001'] = 'BLOCKED';
        tcs['TC-DM-CC-06-CV-SELF-FD-001'] = 'BLOCKED';
        recordStep('INB-SELF', 'BLOCKED', {
          summary:
            'submitter=approver not proven — no Duyệt click (avoid false FAIL); BR-WF-04 UI FD OPEN; resolver unit-only; completeStepTask no submitter guard',
        });
        results.residuals.push({
          id: 'R-W4E1-SELF-FD-EVIDENCE',
          owner: 'qa',
          sev: 'P1',
          note: 'Need FE spawn where submitter userId equals assignee; R1 false-FAIL superseded (stamp L2S-* /L2/ match)',
        });
      } else {
        await page.goto(`${PORTAL}/command-center/inbox`, {
          waitUntil: 'domcontentloaded',
          timeout: 90000,
        });
        await sleep(1500);
        const cards2 = page.locator('[data-testid="cc-inbox-task-card"]');
        const target2 = cards2.nth(probeIdx);
        const approveBtn = target2.getByTestId(/hdsd-cc-leave-approve|cc-inbox-task-approve/);
        const before = results.network.length;
        let clicked = false;
        if (await approveBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
          await approveBtn.click();
          clicked = true;
          log('CLICK_SELF_APPROVE_PROBE');
        } else {
          const btn = target2.locator('button').filter({ hasText: /Duyệt/i }).first();
          if (await btn.isVisible({ timeout: 2000 }).catch(() => false)) {
            await btn.click();
            clicked = true;
            log('CLICK_SELF_APPROVE_TEXT');
          }
        }
        await sleep(3000);
        await shot(page, '13-self-after');
        const completeNet = results.network
          .slice(before)
          .filter((n) => n.method === 'POST' && /complete|approve/.test(n.url))
          .pop();
        if (!clicked) {
          tcs['TC-CC-P0-06-INB-SELF-FD-001'] = 'BLOCKED';
          recordStep('INB-SELF', 'BLOCKED', {
            summary: 'Proven self path but approve control not visible',
          });
        } else if (completeNet && completeNet.status >= 400) {
          tcs['TC-CC-P0-06-INB-SELF-FD-001'] = 'PASS';
          recordStep('INB-SELF', 'PASS', {
            summary: `BR block evidenced status=${completeNet.status} code=${completeNet.code}`,
          });
        } else if (completeNet && completeNet.status < 300) {
          tcs['TC-CC-P0-06-INB-SELF-FD-001'] = 'FAIL';
          recordStep('INB-SELF', 'FAIL', {
            summary: `Self-approve allowed status=${completeNet.status} code=${completeNet.code} — BR-WF-04 not enforced on complete`,
          });
          results.residuals.push({
            id: 'R-W4E1-SELF-BR-WF-04',
            owner: 'dev-be',
            sev: 'P0',
            note: 'complete/approve 2xx when submitter=approver proven — BR-WF-04 expected reject/block',
          });
        } else {
          tcs['TC-CC-P0-06-INB-SELF-FD-001'] = 'PARTIAL';
          recordStep('INB-SELF', 'PARTIAL', {
            summary: 'Click done but no complete network captured',
          });
        }
        tcs['TC-DM-CC-06-CV-SELF-FD-001'] = tcs['TC-CC-P0-06-INB-SELF-FD-001'];
      }
      if (!tcs['TC-DM-CC-06-CV-SELF-FD-001']) {
        tcs['TC-DM-CC-06-CV-SELF-FD-001'] = tcs['TC-CC-P0-06-INB-SELF-FD-001'];
      }
    }

    const fail = Object.values(tcs).some((v) => v === 'FAIL');
    const hasPass = Object.values(tcs).some((v) => v === 'PASS');
    const blocked = Object.values(tcs).filter((v) => v === 'BLOCKED' || v === 'PARTIAL').length;
    const verdict = fail ? 'FAIL' : hasPass && blocked > 0 ? 'PARTIAL' : hasPass ? 'PASS' : 'BLOCKED';
    setUc(uc, {
      execution: verdict,
      tcs,
      note: `L2=${tcs['TC-CC-P0-06-INB-L2-HP-001']} self=${tcs['TC-CC-P0-06-INB-SELF-FD-001']} leaveL2Invented=false`,
    });
    // Mirror canvas self TC onto UC-XBOS-CC-06
    if (results.uc['UC-XBOS-CC-06']) {
      results.uc['UC-XBOS-CC-06'].tcs = {
        ...(results.uc['UC-XBOS-CC-06'].tcs || {}),
        'TC-DM-CC-06-CV-SELF-FD-001': tcs['TC-DM-CC-06-CV-SELF-FD-001'],
      };
    }
    return verdict;
  } catch (e) {
    setUc(uc, { execution: 'FAIL', tcs, note: String(e).slice(0, 240) });
    recordStep('INB-ERR', 'FAIL', { summary: String(e) });
    return 'FAIL';
  }
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
    const cv = await runCanvasL2(page);
    const inb = await runFeSpawnAndInbox(page);
    results.overall =
      cv.verdict === 'FAIL' || inb === 'FAIL'
        ? 'FAIL'
        : cv.verdict === 'PASS' && inb === 'PASS'
          ? 'PASS'
          : 'PARTIAL';
    // Residual: canvas L2 sticky may close graph half; self FD + inbox Leave L2 stay honest
    const canvasL2 =
      results.uc['UC-XBOS-CC-06']?.tcs?.['TC-DM-CC-06-CV-L2-HP-001'] === 'PASS';
    const selfV = results.uc['UC-CC-P0-06']?.tcs?.['TC-CC-P0-06-INB-SELF-FD-001'];
    const selfClosed = selfV === 'PASS' || selfV === 'FAIL';
    results.residual_closed = {
      'R-W4E1-CV-L2-SELF': canvasL2 && selfClosed ? 'CLOSED' : 'PARTIAL_OPEN',
      canvas_l2_sticky: canvasL2,
      self_fd_evidenced: selfClosed,
      leave_l2: 'SPEC_GAP_NOT_INVENTED',
      r1_superseded:
        'R1 INB-L2/SELF false via stamp L2S-* matching /L2/; R2 strict match',
    };
    recordStep('OVERALL', results.overall, {
      summary: `CV=${cv.verdict} INB=${inb} residual=${results.residual_closed['R-W4E1-CV-L2-SELF']}`,
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
        residual_closed: results.residual_closed,
        residuals: results.residuals,
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
  results.residuals.push({ id: 'R-W4E1-L2-SELF-HARNESS', owner: 'qa', note: String(e).slice(0, 240) });
  save();
  process.exit(1);
});
