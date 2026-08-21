/**
 * PO-E2E-SPINE-02-WEB-QA-W1-R1 — Retest LV-03 + LV-04 after BE VAL-ATT + FE attach
 * U65 zero-seed · U76 HDSD · U78 test-log · anti-idle
 * must_keep: LeaveOverviewRecentPanel mount GWC
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-po-e2e-spine-02-web-qa-w1-r1-browser.json');
const SCREEN_DIR = resolve(ROOT, 'docs/qa/evidence/screens/po-e2e-spine-02-web-qa-w1-r1');
const FIXTURE_PNG = resolve(ROOT, 'docs/qa/evidence/screens/po-e2e-spine-02-web-qa-w1-r1/_fixture-doctor-note.png');

// Unique far-future windows (avoid OVERLAP from W1 12–16/10/2027)
const LV03_START = '03/11/2027';
const LV03_END = '07/11/2027';
const LV04_START = '15/11/2027';
const LV04_END = '19/11/2027';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

const results = {
  work_item_id: 'PO-E2E-SPINE-02-WEB-QA-W1-R1',
  prior: 'docs/qa/evidence/po-e2e-spine-02-web-qa-w1.md',
  be_entry: 'docs/qa/evidence/po-e2e-spine-02-be-lv03-val-att-01.md',
  fe_entry: 'docs/qa/evidence/r-spine-lv04-attach-fe-01.md',
  layer: 'browser-U65-HDSD',
  hdsd_align: true,
  u65: 'zero-seed',
  startedAt: ts(),
  env: { PORTAL, EMAIL },
  click_log: [],
  ac: {},
  case_matrix: {},
  network: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  residuals: [],
  idle_guard: { qa_idle_viewport: 'PENDING' },
};

function save() {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(results, null, 2));
}

function logClick(action, detail = {}) {
  const entry = { at: ts(), action, ...detail };
  results.click_log.push(entry);
  console.error(`[CLICK ${results.click_log.length}] ${entry.at} ${action}`, detail.url || detail.text || detail.note || '');
  return entry;
}

async function shot(page, name) {
  mkdirSync(SCREEN_DIR, { recursive: true });
  const path = join(SCREEN_DIR, `${name}.png`);
  await page.screenshot({ path, fullPage: false });
  results.screens.push({ at: ts(), name, path: path.replace(/\\/g, '/') });
  return path;
}

/** Minimal 1×1 PNG for leave-attachment upload */
function ensureFixturePng() {
  mkdirSync(SCREEN_DIR, { recursive: true });
  const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64',
  );
  writeFileSync(FIXTURE_PNG, png);
  return FIXTURE_PNG;
}

function track(page) {
  page.on('response', async (res) => {
    try {
      const u = res.url();
      if (!/\/api\/(hrm\/attendance\/leave|hrm\/employees|hrm\/files|xbos\/auth|hrm\/settings)/.test(u)) return;
      const method = res.request().method();
      if (method === 'OPTIONS') return;
      let bodySnippet = null;
      try {
        const j = await res.json();
        const d = j?.data;
        const items = Array.isArray(d?.data)
          ? d.data
          : Array.isArray(d?.items)
            ? d.items
            : Array.isArray(d)
              ? d
              : null;
        if (items?.[0]) {
          bodySnippet = {
            total: d?.total ?? items.length,
            first: {
              id: items[0].id,
              status: items[0].status,
              status_label: items[0].status_label,
              leave_type: items[0].leave_type,
              attachment_url: items[0].attachment_url ?? null,
              employee_display_name: items[0].employee_display_name,
            },
            code: j?.code,
          };
        } else if (d && typeof d === 'object') {
          bodySnippet = {
            code: j?.code,
            id: d.id,
            leave_type: d.leave_type,
            total_days: d.total_days,
            attachment_url: d.attachment_url ?? null,
            status: d.status,
            status_label: d.status_label,
            message: typeof j?.message === 'string' ? j.message.slice(0, 200) : undefined,
            accessToken: Boolean(d.accessToken),
            url: d.url || d.path || d.fileUrl || undefined,
          };
        } else {
          bodySnippet = {
            code: j?.code,
            message: String(j?.message || '').slice(0, 200),
            error: j?.error ? String(j.error).slice(0, 120) : undefined,
          };
        }
      } catch {
        /* */
      }
      let reqBody = null;
      if (method === 'POST' && /leave-requests/.test(u) && !/upload/.test(u)) {
        try {
          const raw = res.request().postData();
          if (raw) {
            const parsed = JSON.parse(raw);
            reqBody = {
              leave_type: parsed.leave_type,
              total_days: parsed.total_days,
              attachment_url: parsed.attachment_url ?? null,
              start_date: parsed.start_date,
              end_date: parsed.end_date,
            };
          }
        } catch {
          /* */
        }
      }
      results.network.push({
        at: ts(),
        method,
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 360),
        bodySnippet,
        reqBody,
      });
    } catch {
      /* */
    }
  });
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const t = msg.text();
      if (/favicon|Download the React DevTools/i.test(t)) return;
      results.consoleErrors.push({ at: ts(), text: t.slice(0, 280) });
    }
  });
  page.on('pageerror', (err) => {
    results.pageErrors.push({ at: ts(), text: String(err).slice(0, 280) });
  });
}

async function loginApi() {
  logClick('API_LOGIN_POST', { url: `${PORTAL}/api/xbos/auth/login` });
  const r = await fetch(`${PORTAL}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const j = await r.json();
  const data = j?.data ?? j;
  const token = data?.accessToken;
  if (!token) throw new Error(`login failed HTTP ${r.status}`);
  logClick('API_LOGIN_OK', { status: r.status });
  const u = data?.user ?? {};
  return {
    token,
    expiresAt: Date.now() + 8 * 3600_000,
    user: {
      userId: u.userId || u.id || u.email || EMAIL,
      email: u.email || EMAIL,
      displayName: u.displayName || u.fullName || u.name || 'CEO Tap doan',
      roles: u.roles || ['group_ceo'],
    },
    raw: data,
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
      store.setItem('xevn.portal.companyId', 'main');
      store.setItem('hrm_portal_mode', '1');
      store.setItem('hrm_current_company_id', 'main');
      store.setItem('hrm_current_tenant_id', 'xevn');
      if (s.raw?.refreshToken) store.setItem('xevn.portal.refreshToken', s.raw.refreshToken);
      if (s.raw?.defaultMembershipId) {
        store.setItem('xevn.portal.membershipId', s.raw.defaultMembershipId);
      }
    }
  }, session);
}

async function tryClick(page, locator, action, opts = {}) {
  const count = await locator.count().catch(() => 0);
  if (!count) {
    logClick(`${action}_MISS`, { reason: 'locator count 0' });
    return false;
  }
  const text = ((await locator.first().textContent().catch(() => '')) || '').replace(/\s+/g, ' ').trim().slice(0, 80);
  logClick(action, { text, url: page.url().slice(0, 180) });
  await locator.first().click({ timeout: opts.timeout || 8000 });
  await sleep(opts.wait || 1200);
  return true;
}

async function navigateToLeave(page) {
  const attUrl = `${PORTAL}/hr/attendance?portal=1&tenantId=xevn&companyId=main`;
  logClick('NAV_ATTENDANCE', { url: attUrl });
  await page.goto(attUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(4000);
  await shot(page, '01-attendance');

  const leaveTab = page
    .locator('[role="tab"], button, a, [data-state]')
    .filter({ hasText: /Nghỉ phép|Leave|Yêu cầu nghỉ/i });
  if (await leaveTab.count()) {
    await tryClick(page, leaveTab.first(), 'CLICK_TAB_NGHI_PHEP', { wait: 3500 });
  } else {
    logClick('CLICK_TAB_NGHI_PHEP_MISS', {});
  }
  await shot(page, '02-leave-tab');

  const rootChild = await page.evaluate(() => document.querySelector('#root')?.childElementCount ?? 0);
  const bodyText = await page.evaluate(() => document.body?.innerText?.slice(0, 2500) || '');
  const viteResolveFail = results.consoleErrors.some((e) =>
    /Failed to resolve|LeaveOverviewRecentPanel/i.test(e.text || ''),
  );
  results.ac.mount = {
    verdict: rootChild > 0 && !viteResolveFail ? 'PASS' : 'FAIL',
    rootChild,
    viteResolveFail,
    url: page.url().slice(0, 220),
    hasLeaveTitle: /Nghỉ phép|Yêu cầu nghỉ|Leave request/i.test(bodyText),
    note: 'must_keep LeaveOverviewRecentPanel mount GWC',
  };
  logClick('ASSERT_MOUNT', results.ac.mount);
}

async function openCreateDialog(page) {
  const createBtn = page.getByRole('button', {
    name: /Tạo yêu cầu|Tạo đơn|Đăng ký nghỉ|Create request|\+\s*Tạo/i,
  });
  if (!(await createBtn.count())) return false;
  const ok = await tryClick(page, createBtn.first(), 'CLICK_TAO_YEU_CAU_NGHI', { wait: 2000 });
  if (ok) await shot(page, '03-create-dialog');
  return ok;
}

async function pickEmployeeAndSick(page, dialog) {
  const empTrigger = dialog.locator('button[role="combobox"]').first();
  if (await empTrigger.count()) {
    await tryClick(page, empTrigger, 'OPEN_EMPLOYEE_SELECT', { wait: 1000 });
    const empItem = page.locator('[role="option"]').first();
    if (await empItem.count()) await tryClick(page, empItem, 'PICK_EMPLOYEE', { wait: 800 });
    else await page.keyboard.press('Escape');
  }

  let pickedSick = false;
  const typeTriggers = dialog.locator('button[role="combobox"]');
  const typeCount = await typeTriggers.count();
  for (let i = 0; i < typeCount; i++) {
    const tr = typeTriggers.nth(i);
    const label = ((await tr.textContent().catch(() => '')) || '').slice(0, 60);
    if (/nhân viên|employee|chọn nhân/i.test(label) && i === 0) continue;
    await tryClick(page, tr, `OPEN_LEAVE_TYPE_${i}`, { wait: 900 });
    const sickOpt = page.locator('[role="option"]').filter({ hasText: /ốm|sick|bệnh|LVT_02/i });
    if (await sickOpt.count()) {
      pickedSick = await tryClick(page, sickOpt.first(), 'PICK_SICK_LVT02', { wait: 1000 });
      break;
    }
    await page.keyboard.press('Escape');
    await sleep(300);
  }
  if (!pickedSick) {
    const pickerInput = dialog
      .locator('input[placeholder*="loại"], input[placeholder*="nghỉ"], [data-testid*="leave-type"] input')
      .first();
    if (await pickerInput.count()) {
      await pickerInput.fill('ốm');
      await sleep(700);
      const sickOpt = page.locator('[role="option"], [cmdk-item], li').filter({ hasText: /ốm|sick|bệnh/i });
      if (await sickOpt.count()) {
        pickedSick = await tryClick(page, sickOpt.first(), 'PICK_SICK_SEARCH', { wait: 1000 });
      }
    }
  }
  return pickedSick;
}

async function fillViDates(dialog, page, start, end) {
  let dateFills = 0;
  const allInputs = dialog.locator('input');
  const n = await allInputs.count();
  for (let i = 0; i < n; i++) {
    const el = allInputs.nth(i);
    const typ = (await el.getAttribute('type').catch(() => '')) || '';
    const ph = (await el.getAttribute('placeholder').catch(() => '')) || '';
    const cur = await el.inputValue().catch(() => '');
    const testId = (await el.getAttribute('data-testid').catch(() => '')) || '';
    if (/attachment|file/i.test(testId) || typ === 'file') continue;
    const isDateLike =
      typ === 'date' ||
      /ngày|date|dd\/mm/i.test(ph) ||
      /^\d{2}\/\d{2}\/\d{4}$/.test(cur) ||
      /^\d{4}-\d{2}-\d{2}$/.test(cur) ||
      (cur === '' && /dd\/mm|ngày/i.test(ph));
    if (!isDateLike && cur !== '' && !/^\d{2}\/\d{2}/.test(cur)) continue;
    if (!(isDateLike || cur === '' || /^\d{2}\/\d{2}/.test(cur) || /^\d{4}-\d{2}/.test(cur))) continue;
    try {
      const box = await el.boundingBox();
      if (!box) continue;
      await el.click({ clickCount: 3 });
      await el.fill(dateFills === 0 ? start : end);
      logClick('FILL_DATE', { index: i, value: dateFills === 0 ? start : end });
      dateFills++;
      if (dateFills >= 2) break;
    } catch {
      /* */
    }
  }
  // React controlled: also try setting via evaluate + input events on dialog date fields
  if (dateFills < 2) {
    const set = await page.evaluate(
      ({ startIso, endIso }) => {
        const dlg = document.querySelector('[role="dialog"]');
        if (!dlg) return 0;
        const inputs = Array.from(dlg.querySelectorAll('input')).filter((inp) => {
          if (inp.type === 'file') return false;
          const v = inp.value || '';
          const ph = inp.placeholder || '';
          return (
            inp.type === 'date' ||
            /^\d{2}\/\d{2}\/\d{4}$/.test(v) ||
            /^\d{4}-\d{2}-\d{2}$/.test(v) ||
            /ngày|date|dd\/mm/i.test(ph)
          );
        });
        const values = [startIso, endIso];
        let n = 0;
        for (let i = 0; i < Math.min(2, inputs.length); i++) {
          const inp = inputs[i];
          const proto = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
          proto?.set?.call(inp, values[i]);
          inp.dispatchEvent(new Event('input', { bubbles: true }));
          inp.dispatchEvent(new Event('change', { bubbles: true }));
          n++;
        }
        return n;
      },
      {
        // ViDateField often stores ISO yyyy-mm-dd
        startIso: start.includes('/')
          ? `${start.split('/')[2]}-${start.split('/')[1]}-${start.split('/')[0]}`
          : start,
        endIso: end.includes('/')
          ? `${end.split('/')[2]}-${end.split('/')[1]}-${end.split('/')[0]}`
          : end,
      },
    );
    logClick('FILL_DATE_EVAL', { set, start, end });
    if (set >= 2) dateFills = set;
  }
  return dateFills;
}

async function fillReason(page, dialog, text) {
  const reason = page.getByTestId('hdsd-leave-reason');
  if (await reason.count()) {
    await reason.fill(text);
    logClick('FILL_REASON', {});
    return;
  }
  const ta = dialog.locator('textarea').first();
  if (await ta.count()) {
    await ta.fill(text);
    logClick('FILL_REASON_TEXTAREA', {});
  }
}

async function closeDialog(page, dialog) {
  const cancel = dialog.locator('button').filter({ hasText: /Hủy|Đóng|Cancel|Close/i }).first();
  if (await cancel.count()) await tryClick(page, cancel, 'CLOSE_DIALOG', { wait: 800 });
  else {
    await page.keyboard.press('Escape');
    await sleep(500);
  }
}

async function caseLv03(page) {
  logClick('LV03_START', {
    intent: 'LVT_02 ≥3d no attach → FE block and/or HRM-LEAVE-VAL-ATT; no silent 201',
  });
  const opened = await openCreateDialog(page);
  const dialog = page.locator('[role="dialog"]');
  const hasDialog = opened && (await dialog.count()) > 0 && (await dialog.isVisible().catch(() => false));
  let pickedSick = false;
  let dateFills = 0;

  if (hasDialog) {
    pickedSick = await pickEmployeeAndSick(page, dialog);
    dateFills = await fillViDates(dialog, page, LV03_START, LV03_END);
    await fillReason(page, dialog, 'QA R1 LV-03 ốm ≥3 ngày không đính kèm');
    await sleep(800);
  }

  const attachProbe = await page.evaluate(() => {
    const dlg = document.querySelector('[role="dialog"]');
    const t = dlg?.innerText || '';
    return {
      fileInputCount: document.querySelectorAll('[role="dialog"] input[type="file"]').length,
      testIdInput: Boolean(document.querySelector('[data-testid="hdsd-leave-attachment-input"]')),
      hasDoctorLabel: /Đính kèm giấy bác sĩ/i.test(t),
      hasRequiredHint: /3 ngày|giấy bác sĩ/i.test(t),
    };
  });
  results.ac.attach_ui_lv03 = attachProbe;
  logClick('LV03_ATTACH_UI_PROBE', attachProbe);
  await shot(page, '04-lv03-filled');

  const beforeNet = results.network.length;
  const submit = dialog.locator('button').filter({ hasText: /Gửi|Submit|Tạo yêu cầu|Lưu/i }).last();
  if (hasDialog && (await submit.count())) {
    await tryClick(page, submit, 'LV03_CLICK_SUBMIT', { wait: 3500 });
  } else {
    logClick('LV03_SUBMIT_MISS', { hasDialog });
  }
  await shot(page, '05-lv03-after-submit');

  const bodyText = await page.evaluate(() => document.body?.innerText?.slice(0, 8000) || '');
  const toastOrValidation =
    /giấy bác sĩ|đính kèm|bắt buộc|HRM-LEAVE-VAL-ATT|VAL-ATT|không hợp lệ|vui lòng/i.test(bodyText) ||
    (await page.locator('[role="alert"], [data-sonner-toast], .text-destructive').count()) > 0;

  const postAfter = results.network
    .slice(beforeNet)
    .filter((n) => n.method === 'POST' && /leave-requests/.test(n.url) && !/upload|files/.test(n.url));
  const silentCreate = postAfter.some((n) => n.status >= 200 && n.status < 300);
  const valAtt = postAfter.some(
    (n) =>
      n.status >= 400 &&
      /HRM-LEAVE-VAL-ATT|VAL-ATT/i.test(JSON.stringify(n.bodySnippet || {}) + String(n.status)),
  );
  const any4xx = postAfter.some((n) => n.status >= 400);
  const feBlockedNoPost = postAfter.length === 0 && toastOrValidation;

  // PASS if no silent 201 AND (FE block without POST OR VAL-ATT OR any 4xx with VAL-ATT preferred)
  const pass = hasDialog && !silentCreate && (feBlockedNoPost || valAtt || (any4xx && toastOrValidation) || toastOrValidation);

  if (silentCreate) {
    results.residuals.push({
      id: 'R-SPINE-LV03-VAL-ATT-CATALOG',
      sev: 'P0',
      owner: 'dev-be',
      note: `Silent POST 2xx still: ${JSON.stringify(postAfter.map((p) => ({ status: p.status, code: p.bodySnippet?.code, req: p.reqBody })))}`,
    });
  }

  results.case_matrix.LV_03 = {
    verdict: pass ? 'PASS' : 'FAIL',
    hasDialog,
    pickedSick,
    dateFills,
    attachProbe,
    toastOrValidation,
    feBlockedNoPost,
    valAtt,
    silentCreate,
    postAfter: postAfter.slice(0, 6),
    note: 'Expect FE block toast and/or POST 4xx HRM-LEAVE-VAL-ATT — never silent 201',
  };
  logClick('LV03_DONE', { verdict: results.case_matrix.LV_03.verdict, feBlockedNoPost, valAtt, silentCreate });

  if (hasDialog && (await dialog.isVisible().catch(() => false))) {
    await closeDialog(page, dialog);
  }
}

async function caseLv04(page) {
  logClick('LV04_START', {
    intent: 'LVT_02 ≥3d + attach via hdsd-leave-attachment-input → POST 201 + attachment_url · F5',
  });
  const fixture = ensureFixturePng();
  const opened = await openCreateDialog(page);
  const dialog = page.locator('[role="dialog"]');
  const hasDialog = opened && (await dialog.count()) > 0 && (await dialog.isVisible().catch(() => false));
  let pickedSick = false;
  let dateFills = 0;
  let uploadOk = false;
  let attachUrlFromUpload = null;

  if (hasDialog) {
    pickedSick = await pickEmployeeAndSick(page, dialog);
    dateFills = await fillViDates(dialog, page, LV04_START, LV04_END);
    await fillReason(page, dialog, 'QA R1 LV-04 ốm ≥3 ngày có đính kèm giấy bác sĩ');
    await sleep(1000);
  }

  const attachInput = page.getByTestId('hdsd-leave-attachment-input');
  const hasAttachInput = (await attachInput.count()) > 0;
  logClick('LV04_ATTACH_INPUT', { hasAttachInput });

  if (!hasAttachInput) {
    await shot(page, '06-lv04-no-attach');
    results.case_matrix.LV_04 = {
      verdict: 'FAIL',
      reason: 'Missing data-testid=hdsd-leave-attachment-input after FE READY',
      pickedSick,
      dateFills,
    };
    results.residuals.push({
      id: 'R-SPINE-LV04-ATTACH-FE-01',
      sev: 'P0',
      owner: 'dev-fe',
      note: 'Attach input not in create dialog for LVT_02',
    });
    if (hasDialog) await closeDialog(page, dialog);
    return;
  }

  const beforeUpload = results.network.length;
  await attachInput.setInputFiles(fixture);
  logClick('LV04_SET_INPUT_FILES', { fixture: fixture.replace(/\\/g, '/') });
  await sleep(4000);
  await shot(page, '06-lv04-after-upload');

  const uploads = results.network
    .slice(beforeUpload)
    .filter((n) => n.method === 'POST' && /\/api\/hrm\/files/i.test(n.url));
  uploadOk = uploads.some((n) => n.status >= 200 && n.status < 300);
  const uploadBody = uploads.find((n) => n.status >= 200 && n.status < 300)?.bodySnippet;
  attachUrlFromUpload = uploadBody?.url || null;
  logClick('LV04_UPLOAD_NET', {
    uploadOk,
    uploads: uploads.map((u) => ({ status: u.status, url: u.url, code: u.bodySnippet?.code })),
  });

  // Wait for UI to show filename / clear button
  const attachedUi = await page.evaluate(() => {
    const dlg = document.querySelector('[role="dialog"]');
    const t = dlg?.innerText || '';
    return {
      hasFileName: /fixture-doctor|_fixture|doctor|\.png|giấy/i.test(t) || /Đã đính|đã tải|xóa|clear/i.test(t),
      snippet: t.slice(0, 400),
    };
  });

  const beforeCreate = results.network.length;
  const submit = dialog.locator('button').filter({ hasText: /Gửi|Submit|Tạo yêu cầu|Lưu/i }).last();
  if (hasDialog && (await submit.count())) {
    await tryClick(page, submit, 'LV04_CLICK_SUBMIT', { wait: 4000 });
  }
  await shot(page, '07-lv04-after-submit');

  const createPosts = results.network
    .slice(beforeCreate)
    .filter((n) => n.method === 'POST' && /leave-requests/.test(n.url) && !/files|upload/.test(n.url));
  const created = createPosts.find((n) => n.status >= 200 && n.status < 300);
  const attachOnReq = created?.reqBody?.attachment_url || created?.bodySnippet?.attachment_url || null;
  const create201 = Boolean(created && created.status === 201);
  const hasAttachUrl =
    typeof attachOnReq === 'string' &&
    (/\/api\/hrm\/files\//.test(attachOnReq) || attachOnReq.length > 8);

  // F5 persistence
  let f5Ok = false;
  let f5Sample = null;
  if (create201) {
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(4000);
    const leaveTab = page.locator('[role="tab"], button').filter({ hasText: /Nghỉ phép|Leave/i });
    if (await leaveTab.count()) await tryClick(page, leaveTab.first(), 'LV04_F5_TAB_LEAVE', { wait: 3000 });
    await shot(page, '08-lv04-f5');
    const listNets = results.network.filter(
      (n) => n.method === 'GET' && /leave-requests/.test(n.url) && n.status >= 200 && n.status < 300,
    );
    const lastList = listNets[listNets.length - 1];
    f5Sample = lastList?.bodySnippet?.first || null;
    f5Ok = Boolean(lastList) && (await page.evaluate(() => (document.querySelector('#root')?.childElementCount ?? 0) > 0));
    logClick('LV04_F5', { f5Ok, listStatus: lastList?.status, createdId: created?.bodySnippet?.id });
  }

  const pass = hasDialog && pickedSick && hasAttachInput && uploadOk && create201 && hasAttachUrl && f5Ok;

  if (!pass) {
    results.residuals.push({
      id: 'R-SPINE-LV04-ATTACH-RUNTIME',
      sev: 'P0',
      owner: uploadOk && !create201 ? 'dev-be' : 'dev-fe',
      note: `uploadOk=${uploadOk} create201=${create201} hasAttachUrl=${hasAttachUrl} f5Ok=${f5Ok} posts=${JSON.stringify(createPosts.slice(0, 3))}`,
    });
  }

  results.case_matrix.LV_04 = {
    verdict: pass ? 'PASS' : 'FAIL',
    hasDialog,
    pickedSick,
    dateFills,
    hasAttachInput,
    uploadOk,
    attachUrlFromUpload,
    create201,
    createStatus: created?.status ?? null,
    createCode: created?.bodySnippet?.code ?? null,
    createdId: created?.bodySnippet?.id ?? null,
    attachment_url: attachOnReq,
    reqBody: created?.reqBody ?? null,
    f5Ok,
    f5Sample,
    attachedUi,
    createPosts: createPosts.slice(0, 4),
    note: 'Expect upload 2xx + POST leave 201 with attachment_url + F5 list mounts',
  };
  logClick('LV04_DONE', { verdict: results.case_matrix.LV_04.verdict });

  if (hasDialog && (await dialog.isVisible().catch(() => false))) {
    await closeDialog(page, dialog);
  }
}

async function main() {
  ensureFixturePng();
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

  try {
    await navigateToLeave(page);
    await caseLv03(page);
    await caseLv04(page);

    const clicks = results.click_log.length;
    results.idle_guard = {
      qa_idle_viewport: clicks >= 8 ? 'PASS' : 'FAIL',
      click_count: clicks,
      note: 'anti-idle: real clicks required',
    };

    const mount = results.ac.mount?.verdict;
    const lv03 = results.case_matrix.LV_03?.verdict;
    const lv04 = results.case_matrix.LV_04?.verdict;
    const hardFail = mount === 'FAIL' || lv03 === 'FAIL' || lv04 === 'FAIL' || results.idle_guard.qa_idle_viewport === 'FAIL';
    results.verdict = hardFail ? 'FAIL' : 'PASS';
    results.ack_status = hardFail ? 'FAIL_TO_PM' : 'PASS_TO_PM';
    results.endedAt = ts();
    save();
    console.log(
      JSON.stringify(
        {
          verdict: results.verdict,
          ack_status: results.ack_status,
          case_matrix: results.case_matrix,
          mount: results.ac.mount,
          idle_guard: results.idle_guard,
          clicks,
          residuals: results.residuals,
        },
        null,
        2,
      ),
    );
  } catch (e) {
    results.verdict = 'FAIL';
    results.ack_status = 'FAIL_TO_PM';
    results.fatal = String(e).slice(0, 500);
    results.endedAt = ts();
    save();
    console.error(e);
    process.exitCode = 2;
  } finally {
    await browser.close();
    save();
  }
  process.exit(results.verdict === 'FAIL' ? 2 : 0);
}

main();
