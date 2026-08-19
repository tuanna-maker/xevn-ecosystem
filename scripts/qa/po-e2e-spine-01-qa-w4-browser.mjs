/**
 * PO-E2E-SPINE-01-QA-W4 — HP-04 candidates + hire FE after Inbox approve
 * Prior: W3 PASS HP-03 stamp SP2SDD8FM8 · requisition 34a421e7
 * U65 zero-seed · U76 HDSD CH07 §6/§13 · U78 chronological · anti-idle
 * Continues HP-05 emp/contract only if hire 2xx
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

let PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const LEGACY_STAMP = process.env.QA_LEGACY_STAMP || 'SP2SDD8FM8';
const REQ_HINT = process.env.QA_REQ_ID_HINT || '34a421e7';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-po-e2e-spine-01-qa-w4-browser.json');
const SCREEN_DIR = resolve(ROOT, 'docs/qa/evidence/screens/po-e2e-spine-01-qa-w4-20260803');
const STAMP = `SP4${Date.now().toString(36).slice(-7).toUpperCase()}`;
const CAND_NAME = `Nguyen Hire Pay ${STAMP}`;
const CAND_EMAIL = `hire.pay.${Date.now()}@example.vn`;
const CAND_POSITION = `UV HireToPay ${LEGACY_STAMP} ${STAMP}`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

const q = (path, extra = {}) => {
  const u = new URL(path, PORTAL);
  u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', extra.tenantId || 'xevn');
  u.searchParams.set('companyId', extra.companyId || 'main');
  if (extra.tab) u.searchParams.set('tab', extra.tab);
  return u.toString();
};

const results = {
  work_item_id: 'PO-E2E-SPINE-01-QA-W4',
  program: 'PO-E2E-BIZ-SPINE-01',
  spine: 'E2E-SPINE-01',
  focus: 'HP-04 · J-REC-WF-04 · UF-HRM-12 · HP-05 if hire 2xx',
  startedAt: ts(),
  env: {
    PORTAL,
    EMAIL,
    u65: 'zero-seed',
    companyId: 'main',
    legacyStamp: LEGACY_STAMP,
    requisitionHint: REQ_HINT,
    candStamp: STAMP,
    prior: 'PO-E2E-SPINE-01-QA-W3',
  },
  l0: {},
  click_log: [],
  steps: {},
  network: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  ids: {
    requisitionId: null,
    candidateId: null,
    employeeId: null,
    hirePatchStatus: null,
    hirePatchCode: null,
  },
  createOk: false,
  hireOk: false,
  hireDialogSeen: false,
  empStampSeen: false,
  contractSurface: null,
  seed_used: false,
  gap: null,
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
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 280)}`);
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
      const interesting =
        /recruitment|candidates|candidates-pool|employees|contracts|job-templates|requisitions|auth\/login/.test(
          u,
        );
      if (!interesting) return;

      if (method === 'POST' && /\/recruitment\/candidates(\?|$|\/)/.test(u) && !/stage|pipeline/.test(u)) {
        try {
          const j = await res.json();
          const row = j?.data ?? j;
          if (row?.id) results.ids.candidateId = row.id;
          entry.createdId = row?.id || null;
          entry.code = j?.code || null;
          entry.message = typeof j?.message === 'string' ? j.message.slice(0, 400) : null;
          entry.bodyStage = row?.stage || null;
          if (res.status() >= 400) {
            results.createError = { status: res.status(), code: j?.code, message: entry.message };
          }
        } catch {
          /* */
        }
      }
      if (
        (method === 'PATCH' || method === 'PUT' || method === 'POST') &&
        /candidates-pool|\/stage|candidates\//.test(u)
      ) {
        try {
          const j = await res.json();
          entry.code = j?.code || null;
          const row = j?.data ?? j;
          if (row?.employee_id || row?.employeeId) {
            results.ids.employeeId = row.employee_id || row.employeeId;
            entry.employeeId = results.ids.employeeId;
          }
          if (row?.id && !results.ids.candidateId) results.ids.candidateId = row.id;
          if (/stage|hired|employee/i.test(u) || row?.stage === 'hired') {
            results.ids.hirePatchStatus = res.status();
            results.ids.hirePatchCode = j?.code || null;
          }
        } catch {
          /* */
        }
      }
      if (method === 'GET' && /\/requisitions(\?|$)/.test(u) && res.status() === 200) {
        try {
          const j = await res.json();
          const data = j?.data?.data ?? j?.data ?? j?.items ?? [];
          const rows = Array.isArray(data) ? data : [];
          entry.rowCount = rows.length;
          entry.hasLegacy = rows.some(
            (r) =>
              String(r.title || '').includes(LEGACY_STAMP) ||
              String(r.id || '').startsWith(REQ_HINT),
          );
          const hit = rows.find(
            (r) =>
              String(r.title || '').includes(LEGACY_STAMP) ||
              String(r.id || '').startsWith(REQ_HINT),
          );
          if (hit?.id) results.ids.requisitionId = hit.id;
        } catch {
          /* */
        }
      }
      results.network.push(entry);
      if (results.network.length > 800) results.network.shift();
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
    .locator('button, a, [role="button"], [role="tab"], [role="menuitem"], [role="row"], tr, div, span')
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
      document.querySelectorAll(
        'button, a, [role="button"], [role="tab"], [role="menuitem"], [role="row"], tr, span, div',
      ),
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

async function pickFirstOption(page) {
  await sleep(400);
  const opt = page
    .locator('[role="option"]:not([data-disabled]), [role="option"]:not([aria-disabled="true"]), [cmdk-item]')
    .filter({ hasNotText: /Chưa có hồ sơ|__empty/i })
    .first();
  if (await opt.isVisible().catch(() => false)) {
    const text = (await opt.innerText().catch(() => '')).slice(0, 80);
    await opt.click();
    logClick('pick_option', { text });
    await sleep(300);
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
    if (await el.isVisible().catch(() => false)) {
      await el.fill('').catch(() => {});
      await el.fill(value);
      logClick('fill', { sel, value: String(value).slice(0, 60) });
      return true;
    }
  }
  return false;
}

async function gotoRecruitment(page, tab) {
  const url = q('/hr/recruitment', { tab });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  logClick('goto_recruitment', { url, tab });
  await sleep(3500);
  // ensure candidates chrome if tab param ignored
  if (tab === 'candidates') {
    await clickText(page, /^Ứng viên$|Ứng viên/i, { role: 'tab' });
    await sleep(1500);
  }
  return page.url();
}

async function stepContext(page) {
  const url = await gotoRecruitment(page, 'requisitions');
  await shot(page, '00-requisitions-context');
  const body = await page.locator('body').innerText().catch(() => '');
  const hasStamp = body.includes(LEGACY_STAMP) || body.includes(REQ_HINT);
  const reqGets = results.network.filter((n) => n.method === 'GET' && /requisitions/i.test(n.url));
  const last = reqGets[reqGets.length - 1];
  recordStep('HP04_CTX', hasStamp || last?.hasLegacy ? '🟢' : '🟡', {
    url,
    clickPath: ['/hr/recruitment?tab=requisitions', 'observe YCTD SP2SDD8FM8 / 34a421e7'],
    hasStampUi: hasStamp,
    requisitionId: results.ids.requisitionId,
    network: last || null,
    summary: `legacyUi=${hasStamp} reqId=${results.ids.requisitionId || 'n/a'} apiHasLegacy=${Boolean(last?.hasLegacy)}`,
  });
}

async function stepCreateCandidate(page) {
  const url = await gotoRecruitment(page, 'candidates');
  await shot(page, '01-candidates');
  const body0 = await page.locator('body').innerText().catch(() => '');
  const mountOk =
    /Ứng viên|Thêm ứng viên|Candidates/i.test(body0) && !/Failed to fetch dynamically imported|JobTemplatesTab/i.test(body0);
  if (!mountOk) {
    recordStep('HP04_CREATE', '🔴', {
      url,
      summary: 'Candidates tab mount fail',
      gap: 'candidates_mount',
    });
    return false;
  }

  const net0 = results.network.length;
  // Avoid clickText here — it presses Escape and would dismiss an open dialog later.
  const addBtn = page.getByRole('button', { name: /Thêm ứng viên/i }).first();
  let open = false;
  if (await addBtn.isVisible().catch(() => false)) {
    await addBtn.click({ force: true });
    logClick('click_add_candidate', { url: page.url() });
    open = true;
  } else {
    open = await clickText(page, /Thêm ứng viên/i);
  }
  await sleep(1500);

  if (!open) {
    recordStep('HP04_CREATE', '🔴', {
      url,
      summary: 'Thêm ứng viên CTA not found',
      gap: 'add_candidate_cta_missing',
      hdsd: 'CH07 §6 Thêm ứng viên',
    });
    return false;
  }

  const dialog = page.locator('[role="dialog"]').filter({ hasText: /Thêm ứng viên|ứng viên mới/i }).last();
  await dialog.waitFor({ state: 'visible', timeout: 8000 }).catch(() => {});

  const nameInput = dialog.locator('input[name="full_name"]').first();
  const emailInput = dialog.locator('input[name="email"], input[type="email"]').first();
  const posInput = dialog.locator('input[name="position"]').first();
  await nameInput.click({ force: true }).catch(() => {});
  await nameInput.fill(CAND_NAME);
  logClick('fill', { sel: 'full_name', value: CAND_NAME });
  await emailInput.click({ force: true }).catch(() => {});
  await emailInput.fill(CAND_EMAIL);
  logClick('fill', { sel: 'email', value: CAND_EMAIL });
  if (await posInput.isVisible().catch(() => false)) {
    await posInput.fill(CAND_POSITION);
    logClick('fill', { sel: 'position', value: CAND_POSITION.slice(0, 60) });
  }
  const nameFilled = (await nameInput.inputValue().catch(() => '')) === CAND_NAME;
  const emailFilled = (await emailInput.inputValue().catch(() => '')) === CAND_EMAIL;
  await shot(page, '02-create-dialog-filled');

  // DO NOT use clickText for Lưu — Escape closes dialog before submit.
  const saveNet = results.network.length;
  const saveBtn = dialog
    .locator('button[type="submit"]')
    .or(dialog.getByRole('button', { name: /^(Lưu|Tạo|Save)/i }))
    .first();
  if (await saveBtn.isVisible().catch(() => false)) {
    await saveBtn.click({ force: true });
    logClick('click_save_no_escape', {});
  } else {
    await dialog.locator('form').evaluate((f) => f.requestSubmit?.() || f.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
    logClick('form_requestSubmit', {});
  }
  await sleep(4500);
  const validationText = await dialog.locator('.text-destructive, [role="alert"], p.text-sm').allInnerTexts().catch(() => []);
  const dialogStillOpen = await dialog.isVisible().catch(() => false);
  await shot(page, '03-after-create');
  results.createValidation = validationText.slice(0, 8);
  results.createDialogStillOpen = dialogStillOpen;

  const posts = netsSince(saveNet, (n) => n.method === 'POST' && /candidate/i.test(n.url));
  const createOk = posts.some((p) => p.status >= 200 && p.status < 300);
  results.createOk = createOk;

  // F5 list
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
  logClick('f5_after_create', {});
  await sleep(3000);
  await gotoRecruitment(page, 'candidates');
  const after = await page.locator('body').innerText().catch(() => '');
  const stampOnList = after.includes(STAMP) || after.includes(CAND_NAME.slice(0, 20));
  await shot(page, '04-f5-list');

  const verdict = createOk && stampOnList ? '🟢' : createOk || stampOnList ? '🟡' : '🔴';
  recordStep('HP04_CREATE', verdict, {
    url,
    clickPath: [
      'Tuyển dụng → Ứng viên (CH07 §6)',
      'Thêm ứng viên',
      'Họ tên + email + vị trí',
      'Lưu (no Escape)',
      'F5',
    ],
    hdsd: 'CH07 §6 Thêm ứng viên',
    open,
    nameFilled,
    emailFilled,
    dialogStillOpenAfterSave: results.createDialogStillOpen,
    validation: results.createValidation,
    createOk,
    stampOnList,
    candidateId: results.ids.candidateId,
    network: posts.slice(-3),
    summary: `createOk=${createOk} stampOnList=${stampOnList} nameOk=${nameFilled} emailOk=${emailFilled} candId=${results.ids.candidateId || 'n/a'} posts=${posts.map((p) => `${p.status}:${p.code || ''}`).join(',')}`,
    gap: createOk ? null : 'candidate_create_post_not_2xx',
  });
  return createOk || stampOnList;
}

async function stepHire(page) {
  await gotoRecruitment(page, 'candidates');
  await sleep(1500);
  // search stamp if search box present
  const search = page.locator('input[placeholder*="Tìm" i], input[type="search"]').first();
  if (await search.isVisible().catch(() => false)) {
    await search.fill(STAMP);
    logClick('search_stamp', { stamp: STAMP });
    await sleep(1000);
  }

  const stageNet = results.network.length;
  // open stage select on row containing stamp
  const row = page.locator('tr, [role="row"]').filter({ hasText: STAMP }).first();
  let stageOpened = false;
  if (await row.isVisible().catch(() => false)) {
    const trigger = row.locator('[role="combobox"], button').first();
    if (await trigger.isVisible().catch(() => false)) {
      await trigger.click({ force: true });
      logClick('open_stage_select', {});
      stageOpened = true;
      await sleep(600);
    }
  }
  if (!stageOpened) {
    // eval fallback
    stageOpened = await page.evaluate((stamp) => {
      const rows = Array.from(document.querySelectorAll('tr, [role="row"]'));
      const hit = rows.find((n) => (n.textContent || '').includes(stamp));
      const combo = hit?.querySelector('[role="combobox"], button');
      if (!combo) return false;
      combo.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      return true;
    }, STAMP);
    if (stageOpened) logClick('open_stage_eval', {});
    await sleep(600);
  }

  const lockedHint = await page.locator('body').innerText().catch(() => '');
  const wfLocked = /QT XBOS · không đổi tay/i.test(lockedHint) && !(await page.locator('[role="option"]').first().isVisible().catch(() => false));

  // Pick stage option without Escape (clickText would dismiss select/dialog).
  let hiredOpt = false;
  const hiredOption = page.getByRole('option', { name: /Đã tuyển/i }).first();
  if (await hiredOption.isVisible().catch(() => false)) {
    await hiredOption.click({ force: true });
    logClick('pick_stage_hired', {});
    hiredOpt = true;
  } else {
    hiredOpt = await page.evaluate(() => {
      const opts = Array.from(document.querySelectorAll('[role="option"]'));
      const el = opts.find((n) => /Đã tuyển/i.test(n.textContent || ''));
      if (!el) return false;
      el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      return true;
    });
    if (hiredOpt) logClick('pick_stage_hired_eval', {});
  }
  await sleep(1500);
  await shot(page, '05-hire-stage');

  const hireDlg = page
    .locator('[role="dialog"]')
    .filter({ hasText: /Gắn hồ sơ nhân viên|Xác nhận chốt tuyển|Hồ sơ nhân viên/i })
    .last();
  let dialogVisible = await hireDlg.isVisible().catch(() => false);
  results.hireDialogSeen = dialogVisible;

  let confirmOk = false;
  if (dialogVisible) {
    const pick = hireDlg.locator('#hire-employee-select, [role="combobox"]').first();
    if (await pick.isVisible().catch(() => false)) {
      await pick.click({ force: true });
      logClick('open_emp_picker', {});
      await sleep(1200);
      await pickFirstOption(page);
      await sleep(500);
    }
    const confirmBtn = hireDlg.getByRole('button', { name: /Xác nhận chốt tuyển/i }).first();
    if (await confirmBtn.isVisible().catch(() => false)) {
      await confirmBtn.click({ force: true });
      logClick('confirm_hire_link', {});
      confirmOk = true;
    }
    await sleep(3500);
  } else if (hiredOpt) {
    results.gap = results.gap || 'hire_dialog_not_shown_after_stage_hired';
  } else if (wfLocked) {
    results.gap = 'stage_locked_qt_xbos_manual_hire_blocked';
  } else {
    results.gap = 'stage_hired_option_not_reachable';
  }

  await shot(page, '06-after-hire-confirm');
  const patches = netsSince(
    stageNet,
    (n) =>
      /candidate|stage|hire/i.test(n.url) &&
      ['PATCH', 'PUT', 'POST'].includes(n.method),
  );
  const hire2xx = patches.some((p) => p.status >= 200 && p.status < 300);
  const hireHired = patches.some(
    (p) =>
      p.status >= 200 &&
      p.status < 300 &&
      (/stage/i.test(p.url) || p.code),
  );
  results.hireOk = hire2xx && (results.hireDialogSeen || hireHired || Boolean(results.ids.employeeId));

  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
  logClick('f5_after_hire', {});
  await sleep(3000);
  await gotoRecruitment(page, 'candidates');
  // filter hired submenu
  await clickText(page, /Đã tuyển/i, { role: 'tab' });
  await sleep(1500);
  const after = await page.locator('body').innerText().catch(() => '');
  const hiredShown = after.includes(STAMP) || /Đã tuyển/i.test(after);
  await shot(page, '07-f5-hired');

  const verdict =
    results.hireOk && (Boolean(results.ids.employeeId) || hiredShown)
      ? '🟢'
      : results.hireDialogSeen || hire2xx
        ? '🟡'
        : '🔴';

  if (!results.hireOk && !results.gap) {
    results.gap = 'hire_patch_not_2xx_or_incomplete';
  }

  recordStep('HP04_HIRE', verdict, {
    clickPath: [
      'Ứng viên row stamp',
      'Chuyển giai đoạn → Đã tuyển (CH07 §6)',
      'HireEmployeeLinkDialog · Gắn hồ sơ (CH07 §13)',
      'Xác nhận chốt tuyển',
      'F5 · filter Đã tuyển',
    ],
    hdsd: 'CH07 §6 Chuyển giai đoạn · §13 Liên kết nhân viên',
    spec_ref: 'J-REC-WF-04 · UF-HRM-12 · FR-HRM-INT-01',
    stageOpened,
    hiredOpt,
    hireDialogSeen: results.hireDialogSeen,
    confirmOk,
    hire2xx,
    employeeId: results.ids.employeeId,
    hirePatchStatus: results.ids.hirePatchStatus,
    hirePatchCode: results.ids.hirePatchCode,
    hiredShown,
    network: patches.slice(-5),
    gap: results.gap,
    summary: `dialog=${results.hireDialogSeen} hire2xx=${hire2xx} empId=${results.ids.employeeId || 'n/a'} status=${results.ids.hirePatchStatus} hiredShown=${hiredShown}`,
  });
  return results.hireOk;
}

async function stepEmpContract(page) {
  if (!results.hireOk) {
    recordStep('HP05', '⬜', {
      summary: 'Skipped — hire not 2xx this wave',
      gap: 'blocked_upstream_hp04',
    });
    return;
  }
  const empUrl = q('/hr/employees');
  await page.goto(empUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
  logClick('goto_employees', { url: empUrl });
  await sleep(3500);
  await shot(page, '08-employees');
  const empBody = await page.locator('body').innerText().catch(() => '');
  const banner = /Sync ERROR|HRM API request failed|409|54321/i.test(empBody);
  // linked employee may be existing picker emp — stamp may be on candidate only
  const stampSeen = empBody.includes(STAMP) || empBody.includes(CAND_NAME.slice(0, 16));
  results.empStampSeen = stampSeen;

  let detailOk = false;
  if (results.ids.employeeId) {
    const row = page.locator('tr, [role="row"]').filter({ hasText: /.+/ }).first();
    if (await row.isVisible().catch(() => false)) {
      await row.click({ force: true }).catch(() => {});
      logClick('click_emp_row', {});
      await sleep(2500);
      detailOk = !/404|PermissionFallback|Không tìm thấy/i.test(
        await page.locator('body').innerText().catch(() => ''),
      );
    }
  }
  await shot(page, '09-emp-detail');

  const cUrl = q('/hr/contracts');
  await page.goto(cUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
  logClick('goto_contracts', { url: cUrl });
  await sleep(3000);
  const cBody = await page.locator('body').innerText().catch(() => '');
  const contractsOk = /Hợp đồng|Contracts|Không có|Chưa có/i.test(cBody) && !banner;
  results.contractSurface = contractsOk ? 'present' : 'weak';
  await shot(page, '10-contracts');

  const verdict = !banner && detailOk ? '🟡' : !banner ? '🟡' : '🔴';
  recordStep('HP05', verdict, {
    clickPath: ['/hr/employees', 'row', '/hr/contracts'],
    spec_ref: 'J-HRM-01/02/03 · HP-05',
    hdsd: 'HRM NV / HĐ after hire link',
    banner,
    stampSeen,
    detailOk,
    employeeId: results.ids.employeeId,
    contracts: results.contractSurface,
    note: 'Hire links existing employee_id — new-hire stamp on emp list may be absent (soft link, not create-employee)',
    summary: `banner=${banner} stampSeen=${stampSeen} detailOk=${detailOk} contracts=${results.contractSurface}`,
    gap: stampSeen ? null : 'emp_list_no_candidate_stamp_soft_link',
  });
}

async function main() {
  await probeL0();
  const l0Ok = results.l0.portal === 200 && results.l0.hrm_api === 200 && results.l0.xbos_api === 200;
  recordStep('L0', l0Ok ? '🟢' : '🔴', { summary: JSON.stringify(results.l0) });
  if (!l0Ok) {
    results.endedAt = ts();
    save();
    process.exitCode = 2;
    return;
  }

  const session = await loginApi();
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  track(page);
  await injectPortalAuth(page, session);

  await page.goto(PORTAL, { waitUntil: 'domcontentloaded', timeout: 90000 });
  logClick('open_portal', { url: PORTAL });
  await sleep(2000);
  await shot(page, '00-shell');

  try {
    await stepContext(page);
    const created = await stepCreateCandidate(page);
    if (created) {
      await stepHire(page);
    } else {
      recordStep('HP04_HIRE', '⬜', { summary: 'Skipped — create failed', gap: 'blocked_create' });
      recordStep('HP05', '⬜', { summary: 'Skipped — create failed' });
    }
    await stepEmpContract(page);
  } catch (e) {
    recordStep('FATAL', '🔴', { summary: String(e).slice(0, 300) });
    results.gap = results.gap || 'fatal_harness';
  }

  results.endedAt = ts();
  results.clickCount = results.click_log.length;
  results.idle_guard = results.click_log.length >= 6 ? 'PASS' : 'FAIL';
  const steps = Object.values(results.steps);
  results.summary = {
    clicks: results.click_log.length,
    idle_guard: results.idle_guard,
    seed_used: false,
    createOk: results.createOk,
    hireOk: results.hireOk,
    hireDialogSeen: results.hireDialogSeen,
    employeeId: results.ids.employeeId,
    candidateId: results.ids.candidateId,
    gap: results.gap,
    pass: steps.filter((s) => s.verdict === '🟢').length,
    warn: steps.filter((s) => s.verdict === '🟡').length,
    fail: steps.filter((s) => s.verdict === '🔴').length,
    skip: steps.filter((s) => s.verdict === '⬜').length,
  };
  save();
  await browser.close();
  console.log(JSON.stringify({ summary: results.summary, ids: results.ids, gap: results.gap }, null, 2));
}

main().catch((e) => {
  console.error(e);
  results.endedAt = ts();
  results.fatal = String(e);
  save();
  process.exit(1);
});
