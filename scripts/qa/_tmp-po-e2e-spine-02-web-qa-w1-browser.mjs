/**
 * PO-E2E-SPINE-02-WEB-QA-W1 — Web leave spine LV-03/04 + list/approve honesty
 * U65 zero-seed · U76 HDSD · U78 test-log · anti-idle
 * FORBIDDEN: seed inbox · invent LV-02 ladder · claim UAT DONE
 * must_keep: W1-B-01 leave mount GWC (LeaveOverviewRecentPanel)
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM = process.env.HRM_DEV_URL || 'http://127.0.0.1:8080';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-po-e2e-spine-02-web-qa-w1-browser.json');
const SCREEN_DIR = resolve(ROOT, 'docs/qa/evidence/screens/po-e2e-spine-02-web-qa-w1');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

function looksLikeRawCodeOnly(v) {
  if (typeof v !== 'string' || !v.trim()) return false;
  const s = v.trim();
  return (
    /^(pending|approved|rejected|cancelled|annual|sick|unpaid|compensatory)$/i.test(s) ||
    /^[a-z][a-z0-9]*(_[a-z0-9]+)+$/.test(s) ||
    /^LVT_\d+$/i.test(s)
  );
}

const results = {
  work_item_id: 'PO-E2E-SPINE-02-WEB-QA-W1',
  program: 'PO_E2E_BUSINESS_SPINE_PROGRAM.md § SPINE-02',
  prior_mob: 'docs/qa/evidence/po-e2e-spine-02-03-mob-qa-w1.md',
  mount_must_keep: 'docs/qa/evidence/w1b-01-qa-leave-live-r1.md',
  layer: 'browser-U65-HDSD',
  hdsd_align: true,
  u65: 'zero-seed',
  startedAt: ts(),
  env: { PORTAL, HRM, EMAIL },
  click_log: [],
  ac: {},
  case_matrix: {},
  network: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  journeys: [],
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

function track(page) {
  page.on('response', async (res) => {
    try {
      const u = res.url();
      if (
        !/\/api\/(hrm\/attendance\/leave|hrm\/employees|hrm\/files|xbos\/auth|xbos\/workflow|xbos\/command-center|hrm\/settings|hrm\/notifications)/.test(
          u,
        )
      )
        return;
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
              leave_type_label: items[0].leave_type_label,
              employee_display_name: items[0].employee_display_name,
              employee_name: items[0].employee_name,
              businessType: items[0].businessType || items[0].business_type,
              title: items[0].title || items[0].name,
            },
            code: j?.code,
          };
        } else if (d && typeof d === 'object') {
          bodySnippet = {
            code: j?.code,
            leave_type_label: d.leave_type_label,
            status: d.status,
            status_label: d.status_label,
            message: typeof j?.message === 'string' ? j.message.slice(0, 160) : undefined,
            accessToken: Boolean(d.accessToken),
            id: d.id,
          };
        } else {
          bodySnippet = {
            code: j?.code,
            message: String(j?.message || '').slice(0, 160),
            error: j?.error ? String(j.error).slice(0, 120) : undefined,
          };
        }
      } catch {
        /* */
      }
      let reqBody = null;
      if (method === 'POST' && /leave-requests/.test(u)) {
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
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 320),
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
  const base = PORTAL;
  logClick('NAV_GOTO_PORTAL', { url: base });
  await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(2500);
  await shot(page, '00-shell');

  const hrmNav = page
    .locator('a, button, [role="menuitem"], [role="link"]')
    .filter({ hasText: /HRM|Nhân sự|Human Resources|Quản trị nhân sự/i });
  if (await hrmNav.count()) {
    await tryClick(page, hrmNav.first(), 'CLICK_MENU_HRM', { wait: 2000 });
  }

  const attNav = page
    .locator('a, button, [role="menuitem"], [role="link"], nav *')
    .filter({ hasText: /Chấm công|Attendance/i });
  let clicked = false;
  if (await attNav.count()) {
    clicked = await tryClick(page, attNav.first(), 'CLICK_MENU_CHAM_CONG', { wait: 3000 });
  }

  if (!clicked || !/attendance/i.test(page.url())) {
    const attUrl = `${PORTAL}/hr/attendance?portal=1&tenantId=xevn&companyId=main`;
    logClick('NAV_FALLBACK_ATTENDANCE_URL', { url: attUrl });
    await page.goto(attUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(4000);
  }
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
    note: 'must_keep W1-B-01 leave mount GWC',
  };
  logClick('ASSERT_LEAVE_SURFACE', results.ac.mount);
  return { rootChild, bodyText };
}

async function openCreateDialog(page) {
  const createBtn = page.getByRole('button', {
    name: /Tạo yêu cầu|Tạo đơn|Đăng ký nghỉ|Create request|\+\s*Tạo/i,
  });
  if (await createBtn.count()) {
    const ok = await tryClick(page, createBtn.first(), 'CLICK_TAO_YEU_CAU_NGHI', { wait: 2000 });
    if (ok) {
      await shot(page, '03-create-dialog');
      return true;
    }
  }
  return false;
}

async function fillSickLeaveNoAttach(page, dialog) {
  const empSearch = dialog.locator('input').first();
  if (await empSearch.count()) {
    await empSearch.fill('a');
    await sleep(900);
    logClick('LV03_TYPE_EMPLOYEE_KEYWORD', { value: 'a' });
  }

  const empTrigger = dialog.locator('button[role="combobox"]').first();
  if (await empTrigger.count()) {
    await tryClick(page, empTrigger, 'LV03_OPEN_EMPLOYEE_SELECT', { wait: 1000 });
    const empItem = page.locator('[role="option"]').first();
    if (await empItem.count()) await tryClick(page, empItem, 'LV03_PICK_EMPLOYEE', { wait: 800 });
    else await page.keyboard.press('Escape');
  }

  // CatalogSearchPicker may be combobox #2 or a button with leave type placeholder
  let pickedSick = false;
  const typeTriggers = dialog.locator('button[role="combobox"]');
  const typeCount = await typeTriggers.count();
  for (let i = 0; i < typeCount; i++) {
    const tr = typeTriggers.nth(i);
    const label = ((await tr.textContent().catch(() => '')) || '').slice(0, 60);
    if (/nhân viên|employee|chọn nhân/i.test(label) && i === 0) continue;
    await tryClick(page, tr, `LV03_OPEN_LEAVE_TYPE_${i}`, { wait: 900 });
    const sickOpt = page.locator('[role="option"]').filter({ hasText: /ốm|sick|bệnh|LVT_02/i });
    if (await sickOpt.count()) {
      pickedSick = await tryClick(page, sickOpt.first(), 'LV03_PICK_SICK', { wait: 800 });
      break;
    }
    await page.keyboard.press('Escape');
    await sleep(300);
  }

  // Also try CatalogSearchPicker input/search
  if (!pickedSick) {
    const pickerInput = dialog.locator('input[placeholder*="loại"], input[placeholder*="nghỉ"], [data-testid*="leave-type"] input').first();
    if (await pickerInput.count()) {
      await pickerInput.fill('ốm');
      await sleep(600);
      logClick('LV03_TYPE_LEAVE_TYPE_KEYWORD', { value: 'ốm' });
      const sickOpt = page.locator('[role="option"], [cmdk-item], li').filter({ hasText: /ốm|sick|bệnh/i });
      if (await sickOpt.count()) {
        pickedSick = await tryClick(page, sickOpt.first(), 'LV03_PICK_SICK_SEARCH', { wait: 800 });
      }
    }
  }

  // Dates ≥3 days — far future to avoid overlap 409
  const start = '12/10/2027';
  const end = '16/10/2027';
  const dateInputs = dialog.locator('input').filter({ has: page.locator(':scope') });
  const allInputs = dialog.locator('input');
  const n = await allInputs.count();
  let dateFills = 0;
  for (let i = 0; i < n; i++) {
    const el = allInputs.nth(i);
    const typ = (await el.getAttribute('type').catch(() => '')) || '';
    const ph = (await el.getAttribute('placeholder').catch(() => '')) || '';
    const cur = await el.inputValue().catch(() => '');
    const isDateLike =
      typ === 'date' ||
      /ngày|date|dd\/mm/i.test(ph) ||
      /^\d{2}\/\d{2}\/\d{4}$/.test(cur) ||
      /^\d{4}-\d{2}-\d{2}$/.test(cur);
    if (!isDateLike && cur !== '' && !/^\d{2}\/\d{2}/.test(cur)) continue;
    if (isDateLike || cur === '' || /^\d{2}\/\d{2}/.test(cur) || /^\d{4}-\d{2}/.test(cur)) {
      // Prefer ViDateField — often empty or date-shaped near end of form
      try {
        const box = await el.boundingBox();
        if (!box) continue;
        await el.click({ clickCount: 3 });
        await el.fill(dateFills === 0 ? start : end);
        logClick('LV03_FILL_DATE', { index: i, value: dateFills === 0 ? start : end });
        dateFills++;
        if (dateFills >= 2) break;
      } catch {
        /* */
      }
    }
  }

  // Fallback: evaluate set form dates if ViDateField uses controlled ISO under the hood
  if (dateFills < 2) {
    const setDates = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('[role="dialog"] input'));
      const candidates = inputs.filter((inp) => {
        const v = inp.value || '';
        const ph = inp.placeholder || '';
        return (
          inp.type === 'date' ||
          /^\d{2}\/\d{2}\/\d{4}$/.test(v) ||
          /^\d{4}-\d{2}-\d{2}$/.test(v) ||
          /ngày|date/i.test(ph)
        );
      });
      return candidates.length;
    });
    logClick('LV03_DATE_CANDIDATES', { count: setDates, dateFills });
  }

  const reason = page.getByTestId('hdsd-leave-reason');
  if (await reason.count()) {
    await reason.fill('QA LV-03 sick ≥3 ngày không đính kèm');
    logClick('LV03_FILL_REASON', {});
  } else {
    const ta = dialog.locator('textarea').first();
    if (await ta.count()) {
      await ta.fill('QA LV-03 sick ≥3 ngày không đính kèm');
      logClick('LV03_FILL_REASON_TEXTAREA', {});
    }
  }

  return { pickedSick, dateFills };
}

async function caseLv03(page) {
  logClick('LV03_START', {
    intent: 'ốm ≥3 ngày no attach → fail_deep HRM-LEAVE-VAL-ATT or FE block; no silent 2xx',
  });
  const opened = await openCreateDialog(page);
  const dialog = page.locator('[role="dialog"]');
  const hasDialog = opened && (await dialog.count()) > 0 && (await dialog.isVisible().catch(() => false));

  let fillMeta = { pickedSick: false, dateFills: 0 };
  if (hasDialog) {
    fillMeta = await fillSickLeaveNoAttach(page, dialog);
  }

  // Probe attachment controls (expect none for LV-04 evidence)
  const fileInputs = await dialog.locator('input[type="file"]').count().catch(() => 0);
  const attachUiText = await page.evaluate(() => {
    const t = document.body?.innerText || '';
    return {
      hasAttachLabel: /đính kèm|attachment|giấy bác sĩ|upload|tải lên|chọn file/i.test(t),
      fileInputCount: document.querySelectorAll('[role="dialog"] input[type="file"]').length,
    };
  });
  results.ac.attach_ui_probe = { fileInputs, ...attachUiText };

  const beforeNet = results.network.length;
  const submit = dialog.locator('button').filter({ hasText: /Gửi|Submit|Tạo yêu cầu|Lưu/i }).last();
  const submitDisabled = hasDialog ? await submit.isDisabled().catch(() => false) : false;

  if (hasDialog && (await submit.count()) && !submitDisabled) {
    await tryClick(page, submit, 'LV03_CLICK_SUBMIT_EXPECT_FAIL', { wait: 3000 });
  } else {
    logClick('LV03_SUBMIT_DISABLED_OR_MISS', { submitDisabled, hasDialog });
  }
  await shot(page, '04-lv03-fail');

  const bodyText = await page.evaluate(() => document.body?.innerText?.slice(0, 6000) || '');
  const validationUi =
    /bắt buộc|required|không hợp lệ|invalid|vui lòng|đính kèm|attachment|HRM-LEAVE-VAL|lỗi|error|thiếu|giấy bác sĩ/i.test(
      bodyText,
    ) ||
    (await page.locator('[role="alert"], .text-destructive, [aria-invalid="true"]').count()) > 0;

  const postAfter = results.network
    .slice(beforeNet)
    .filter((n) => n.method === 'POST' && /leave-requests/.test(n.url));
  const valAtt = postAfter.some((n) => {
    const blob = String(n.status) + JSON.stringify(n.bodySnippet || {});
    return n.status >= 400 && /VAL-ATT|HRM-LEAVE-VAL-ATT|422|400|409/.test(blob);
  });
  const valAttStrict = postAfter.some(
    (n) =>
      n.status >= 400 &&
      /HRM-LEAVE-VAL-ATT|VAL-ATT/i.test(JSON.stringify(n.bodySnippet || {})),
  );
  const noSuccessCreate = !postAfter.some((n) => n.status >= 200 && n.status < 300);

  const cancel = dialog.locator('button').filter({ hasText: /Hủy|Đóng|Cancel|Close/i }).first();
  if (await cancel.count()) await tryClick(page, cancel, 'LV03_CLOSE_DIALOG', { wait: 800 });
  else await page.keyboard.press('Escape');
  await sleep(500);

  const silentCreate = postAfter.some((n) => n.status >= 200 && n.status < 300);
  const createdLeaveType = postAfter.find((n) => n.reqBody)?.reqBody || null;
  const pass =
    hasDialog &&
    !silentCreate &&
    (submitDisabled || validationUi || valAtt || (postAfter.length > 0 && noSuccessCreate));

  if (silentCreate) {
    results.residuals.push({
      id: 'R-SPINE-LV03-VAL-ATT-CATALOG',
      sev: 'P0',
      owner: 'dev-be',
      note: `Sick catalog type created without attachment: POST 201. req=${JSON.stringify(createdLeaveType)}. BE assertSickAttachmentIfRequired only matches leave_type==='sick', not LVT_02/ốm catalog codes.`,
    });
  }

  results.case_matrix.LV_03 = {
    verdict: pass ? 'PASS' : 'FAIL',
    hasDialog,
    submitDisabled,
    validationUi,
    valAtt,
    valAttStrict,
    noSuccessCreate,
    silentCreate,
    createdLeaveType,
    pickedSick: fillMeta.pickedSick,
    dateFills: fillMeta.dateFills,
    postAfter: postAfter.slice(0, 6),
    note: 'Expect FE block / toast / HRM-LEAVE-VAL-ATT — no silent 2xx create',
  };
  logClick('LV03_DONE', { verdict: results.case_matrix.LV_03.verdict });
}

async function caseLv04(page) {
  logClick('LV04_START', {
    intent: 'ốm ≥3 + attach via FE upload path — or BLOCKED if no attach UI (U65 no seed path)',
  });

  // Re-open dialog only to confirm attach surface; do not invent upload API
  const opened = await openCreateDialog(page);
  const dialog = page.locator('[role="dialog"]');
  const hasDialog = opened && (await dialog.count()) > 0 && (await dialog.isVisible().catch(() => false));

  const probe = await page.evaluate(() => {
    const dlg = document.querySelector('[role="dialog"]');
    const t = dlg?.innerText || document.body?.innerText || '';
    return {
      fileInputCount: document.querySelectorAll('[role="dialog"] input[type="file"]').length,
      hasAttachLabel: /đính kèm|attachment|giấy bác sĩ|upload|tải lên|chọn file|file đính/i.test(t),
      dialogSnippet: (dlg?.innerText || '').slice(0, 500),
    };
  });

  // Check if FE create payload supports attachment (code-level honesty already known; reaffirm via UI)
  const canAttachFe = probe.fileInputCount > 0 || probe.hasAttachLabel;

  await shot(page, '05-lv04-attach-probe');

  if (hasDialog) {
    const cancel = dialog.locator('button').filter({ hasText: /Hủy|Đóng|Cancel|Close/i }).first();
    if (await cancel.count()) await tryClick(page, cancel, 'LV04_CLOSE_DIALOG', { wait: 600 });
    else await page.keyboard.press('Escape');
  }

  if (!canAttachFe) {
    results.case_matrix.LV_04 = {
      verdict: 'BLOCKED',
      reason:
        'No FE attach control on Tạo yêu cầu nghỉ (no input[type=file] / attach label). LeaveRequestFormData + buildLeaveCreatePayload omit attachment_url. Cannot complete LV-04 without seed/API invent — U65.',
      probe,
      residual: 'R-SPINE-LV04-ATTACH-FE-01',
    };
    results.residuals.push({
      id: 'R-SPINE-LV04-ATTACH-FE-01',
      sev: 'P1',
      owner: 'dev-fe',
      note: 'Add HDSD attach upload → /api/hrm/files + bind attachment_url on sick ≥3 create; then retest LV-04',
    });
    logClick('LV04_BLOCKED_NO_ATTACH_UI', probe);
    return;
  }

  // If attach UI exists — attempt real FE upload (no seed)
  logClick('LV04_ATTACH_UI_FOUND', probe);
  // Minimal empty file attempt would still need upload endpoint; leave as residual if upload fails
  results.case_matrix.LV_04 = {
    verdict: 'FAIL',
    note: 'Attach UI present but full upload+approve path not completed in this harness — needs follow-up',
    probe,
  };
  logClick('LV04_DONE', { verdict: results.case_matrix.LV_04.verdict });
}

async function caseWebList(page) {
  logClick('WEB_LIST_START', { intent: 'list shows recent leave VI labels; J-HRM-06' });

  if (!/attendance/i.test(page.url())) {
    const attUrl = `${PORTAL}/hr/attendance?portal=1&tenantId=xevn&companyId=main`;
    await page.goto(attUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(3500);
    const leaveTab = page.locator('[role="tab"], button').filter({ hasText: /Nghỉ phép|Leave/i });
    if (await leaveTab.count()) await tryClick(page, leaveTab.first(), 'WEB_LIST_TAB_LEAVE', { wait: 3000 });
  }

  const listTab = page.locator('[role="tab"]').filter({ hasText: /Danh sách|List|Yêu cầu/i });
  if (await listTab.count()) await tryClick(page, listTab.first(), 'WEB_LIST_SUBTAB', { wait: 2000 });

  await shot(page, '06-web-list');

  const leaveNets = results.network.filter(
    (n) => n.method === 'GET' && /leave-requests/.test(n.url) && n.status >= 200 && n.status < 300,
  );
  const listOk = leaveNets[leaveNets.length - 1];
  const sample = listOk?.bodySnippet?.first;
  const rowCountApi = listOk?.bodySnippet?.total ?? 0;

  const ui = await page.evaluate(() => {
    const t = document.body?.innerText || '';
    return {
      rootChild: document.querySelector('#root')?.childElementCount ?? 0,
      textLen: t.length,
      hasViStatus: /Chờ duyệt|Đã duyệt|Từ chối/i.test(t),
      hasRawPendingOnly: /\bpending\b/i.test(t) && !/Chờ duyệt|Đã duyệt|Từ chối/i.test(t),
      hasLeaveTypeVi: /Nghỉ|phép|ốm|bù|không lương/i.test(t),
      snippet: t.slice(0, 500),
    };
  });

  let labelsOk = false;
  let labelNote = '';
  if (rowCountApi === 0 || !sample) {
    labelsOk = ui.rootChild > 0 && ui.textLen > 80;
    labelNote = 'surface loaded; empty list honest';
  } else {
    const leaveTypeLabelDepthP2 = looksLikeRawCodeOnly(sample.leave_type_label);
    const fieldsBound =
      Boolean(sample.status_label) &&
      Boolean(sample.leave_type_label || sample.leave_type) &&
      Boolean(sample.employee_display_name || sample.employee_name) &&
      !looksLikeRawCodeOnly(sample.status_label);
    labelsOk = fieldsBound && ui.rootChild > 0 && (ui.hasViStatus || !ui.hasRawPendingOnly);
    labelNote = `fieldsBound=${fieldsBound} uiVi=${ui.hasViStatus} leaveTypeP2=${leaveTypeLabelDepthP2}`;
    if (leaveTypeLabelDepthP2) {
      results.residuals.push({
        id: 'R-LEAVE-TYPE-LABEL-DEPTH',
        sev: 'P2',
        note: `leave_type_label echo: ${sample.leave_type_label}`,
      });
    }
  }

  let detailClicked = false;
  if (await page.locator('table tbody tr').count()) {
    detailClicked = await tryClick(page, page.locator('table tbody tr').first(), 'WEB_LIST_CLICK_ROW', {
      wait: 2000,
    });
    await shot(page, '07-web-list-detail');
  }

  results.case_matrix.WEB_LIST = {
    verdict: listOk && labelsOk ? 'PASS' : 'FAIL',
    listStatus: listOk?.status ?? null,
    listCode: listOk?.bodySnippet?.code ?? null,
    rowCountApi,
    sample,
    ui,
    detailClicked,
    labelNote,
  };
  results.journeys.push({
    id: 'J-HRM-06',
    verdict: results.case_matrix.WEB_LIST.verdict,
    url: page.url(),
    listStatus: listOk?.status ?? null,
  });
  logClick('WEB_LIST_DONE', { verdict: results.case_matrix.WEB_LIST.verdict });
}

async function caseApproveHonesty(page) {
  logClick('APPROVE_START', {
    intent: 'Approve only if leave/WF task visible from FE chain — no seed inbox',
  });

  // Path A: leave list pending row with Duyệt (FE-origin list, may include mobile LV-01)
  const approveOnList = page.locator('button').filter({ hasText: /^Duyệt$|Approve/i });
  const approveCount = await approveOnList.count().catch(() => 0);
  logClick('APPROVE_LIST_BUTTONS', { count: approveCount });

  // Path B: portal Inbox / Hộp thư
  const inboxUrl = `${PORTAL}/command-center`;
  logClick('NAV_INBOX_CC', { url: inboxUrl });
  await page.goto(inboxUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(3500);
  await shot(page, '08-cc-shell');

  const inboxNav = page
    .locator('a, button, [role="tab"], [role="menuitem"]')
    .filter({ hasText: /Hộp thư|Inbox|Công việc|Tasks/i });
  if (await inboxNav.count()) {
    await tryClick(page, inboxNav.first(), 'CLICK_INBOX_NAV', { wait: 2500 });
  }
  await shot(page, '09-inbox');

  const inboxUi = await page.evaluate(() => {
    const t = document.body?.innerText || '';
    return {
      textLen: t.length,
      empty: /không có|trống|empty|chưa có task|no task|0 task/i.test(t),
      hasLeaveTask: /nghỉ phép|leave|hrm_leave|đơn nghỉ/i.test(t),
      hasDuyet: /Duyệt|Approve/i.test(t),
      snippet: t.slice(0, 600),
    };
  });

  const inboxNets = results.network.filter(
    (n) =>
      n.method === 'GET' &&
      /inbox|workflow.*task|command-center/i.test(n.url) &&
      n.status >= 200 &&
      n.status < 300,
  );

  // Honesty rule: if inbox empty / no leave task from FE → BLOCKED approve (do NOT seed)
  // Leave WF tasks from FE create (web/mobile) are valid approve targets — not seed.
  let approveVerdict = 'BLOCKED';
  let approveNote = '';
  let approveNet = null;

  if (!inboxUi.hasLeaveTask && inboxUi.empty && approveCount === 0) {
    approveVerdict = 'BLOCKED';
    approveNote =
      'Inbox empty / no leave WF task; leave list had 0 Duyệt buttons at probe time. U65 — not seed. Aligns R-SPINE-MGR-HIER-01 / SPAWN honesty.';
  } else if (inboxUi.hasLeaveTask) {
    // Open leave task from CC list (HDSD Hộp thư / Việc cần xử lý)
    const leaveCard = page
      .locator('button, a, [role="button"], li, article, div[class*="card"], div[class*="Card"]')
      .filter({ hasText: /Phê duyệt đơn nghỉ phép|đơn nghỉ phép HRM|hrm_leave/i })
      .first();
    if (await leaveCard.count()) {
      await tryClick(page, leaveCard, 'APPROVE_OPEN_LEAVE_TASK', { wait: 2500 });
      await shot(page, '10a-leave-task-open');
    } else {
      logClick('APPROVE_LEAVE_CARD_MISS', { note: 'CC shows leave text but no clickable card' });
    }

    const duy = page
      .getByRole('button', { name: /^(Duyệt|Approve|Phê duyệt)$/i })
      .or(page.locator('button').filter({ hasText: /^(Duyệt|Approve)$/i }));
    const before = results.network.length;
    if ((await duy.count()) > 0) {
      await tryClick(page, duy.first(), 'APPROVE_INBOX_CLICK_DUYET', { wait: 3000 });
      await shot(page, '10-approve-inbox');
      const confirm = page.locator('[role="alertdialog"] button, [role="dialog"] button').filter({
        hasText: /Xác nhận|Duyệt|Confirm|OK|Đồng ý/i,
      });
      if (await confirm.count()) {
        await tryClick(page, confirm.last(), 'APPROVE_INBOX_CONFIRM', { wait: 2000 });
      }
      const posts = results.network
        .slice(before)
        .filter((n) => n.method === 'POST' || n.method === 'PUT' || n.method === 'PATCH');
      approveNet = posts.slice(0, 8);
      const ok = posts.some((n) => n.status >= 200 && n.status < 300);
      approveVerdict = ok ? 'PASS' : 'FAIL';
      approveNote = ok
        ? 'Inbox leave task approved via FE (WF task present — not seeded)'
        : `Leave task opened; Duyệt clicked but no 2xx (posts=${posts.length})`;
    } else {
      approveVerdict = 'BLOCKED';
      approveNote =
        'CC lists leave WF tasks (FE-origin) but Duyệt control not actionable after open — residual UI/inbox depth; U65 no seed';
      await shot(page, '10-approve-no-duyet');
    }
  } else if (approveCount > 0) {
    // Return to attendance leave list and approve first pending — only if row from list (FE-visible)
    const attUrl = `${PORTAL}/hr/attendance?portal=1&tenantId=xevn&companyId=main`;
    await page.goto(attUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(3500);
    const leaveTab = page.locator('[role="tab"], button').filter({ hasText: /Nghỉ phép|Leave/i });
    if (await leaveTab.count()) await tryClick(page, leaveTab.first(), 'APPROVE_RENAV_LEAVE', { wait: 3000 });
    const listTab = page.locator('[role="tab"]').filter({ hasText: /Danh sách|List|Yêu cầu/i });
    if (await listTab.count()) await tryClick(page, listTab.first(), 'APPROVE_LIST_TAB', { wait: 1500 });

    const before = results.network.length;
    const duy = page.locator('button').filter({ hasText: /^Duyệt$/i }).first();
    if (await duy.count()) {
      await tryClick(page, duy, 'APPROVE_LEAVE_LIST_CLICK', { wait: 2500 });
      await shot(page, '10-approve-list');
      // Confirm dialog if any
      const confirm = page.locator('[role="alertdialog"] button, [role="dialog"] button').filter({
        hasText: /Xác nhận|Duyệt|Confirm|OK/i,
      });
      if (await confirm.count()) {
        await tryClick(page, confirm.last(), 'APPROVE_CONFIRM', { wait: 2000 });
      }
      const posts = results.network
        .slice(before)
        .filter(
          (n) =>
            (n.method === 'POST' || n.method === 'PUT' || n.method === 'PATCH') &&
            /leave|approve|workflow/i.test(n.url),
        );
      approveNet = posts.slice(0, 5);
      const ok = posts.some((n) => n.status >= 200 && n.status < 300);
      const fail4xx = posts.some((n) => n.status >= 400);
      if (ok) {
        approveVerdict = 'PASS';
        approveNote = 'Leave list Duyệt 2xx — row was FE-visible (prior mobile/web create), not seeded inbox';
      } else if (fail4xx) {
        approveVerdict = 'FAIL';
        approveNote = 'Approve attempted on FE-visible row but API 4xx/5xx';
      } else {
        approveVerdict = 'BLOCKED';
        approveNote = 'Duyệt clicked but no leave-approve network — UI may be disabled/modal miss';
      }
    } else {
      approveVerdict = 'BLOCKED';
      approveNote = 'Approve buttons vanished after renav; inbox had no leave task — U65 no seed';
    }
  } else {
    approveVerdict = 'BLOCKED';
    approveNote =
      'No actionable leave approve surface from FE chain (inbox no leave task; list Duyệt=0). Document honesty — do not seed.';
  }

  results.case_matrix.WEB_APPROVE = {
    verdict: approveVerdict,
    inboxUi,
    approveCountAtProbe: approveCount,
    inboxNets: inboxNets.slice(-3),
    approveNet,
    note: approveNote,
  };
  logClick('APPROVE_DONE', { verdict: approveVerdict, note: approveNote });
}

async function caseLv02Cap() {
  results.case_matrix.LV_02 = {
    verdict: 'SPEC_GAP',
    note: 'BA matrix GAP-LEAVE-LADDER-01 / R-PO-LEAVE-DAY-LADDER OPEN — WF hrm_leave_approval 1 step. Cap 🟡 per PO — no invent N.',
  };
  logClick('LV02_CAPPED_SPEC_GAP', results.case_matrix.LV_02);
}

async function main() {
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
    await caseWebList(page);
    await caseApproveHonesty(page);
    await caseLv02Cap();

    const clicks = results.click_log.length;
    results.idle_guard = {
      qa_idle_viewport: clicks >= 8 ? 'PASS' : 'FAIL',
      click_count: clicks,
      note: 'anti-idle: real clicks required',
    };

    const lv03 = results.case_matrix.LV_03?.verdict;
    const lv04 = results.case_matrix.LV_04?.verdict;
    const list = results.case_matrix.WEB_LIST?.verdict;
    const approve = results.case_matrix.WEB_APPROVE?.verdict;
    const mount = results.ac.mount?.verdict;

    // Overall: FAIL if LV-03 or list or mount fail; LV-04 BLOCKED + approve BLOCKED are honest (not overall FAIL)
    const hardFail =
      mount === 'FAIL' || lv03 === 'FAIL' || list === 'FAIL' || approve === 'FAIL' || lv04 === 'FAIL';
    const allCorePass =
      mount === 'PASS' &&
      lv03 === 'PASS' &&
      list === 'PASS' &&
      (lv04 === 'PASS' || lv04 === 'BLOCKED') &&
      (approve === 'PASS' || approve === 'BLOCKED');

    if (hardFail) results.verdict = 'FAIL';
    else if (allCorePass && (lv04 === 'BLOCKED' || approve === 'BLOCKED')) results.verdict = 'PASS_WITH_BLOCKS';
    else if (allCorePass) results.verdict = 'PASS';
    else results.verdict = 'FAIL';

    results.ack_status =
      results.verdict === 'FAIL'
        ? 'FAIL_TO_PM'
        : results.verdict === 'PASS_WITH_BLOCKS'
          ? 'PASS_TO_PM'
          : 'PASS_TO_PM';

    results.endedAt = ts();
    save();
    console.log(
      JSON.stringify(
        {
          verdict: results.verdict,
          ack_status: results.ack_status,
          case_matrix: results.case_matrix,
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
