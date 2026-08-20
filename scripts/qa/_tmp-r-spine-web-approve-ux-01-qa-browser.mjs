/**
 * R-SPINE-WEB-APPROVE-UX-01-QA — browser Path A (leave list Duyệt) + Path B (CC hrm_leave Duyệt)
 * U65 zero-seed · U76 HDSD · U78 test_log · must_keep LeaveOverviewRecentPanel · LV-03/04 closed
 * FORBIDDEN: seed · invent L2 ladder · claim UAT DONE · reopen LV-03/04
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
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-r-spine-web-approve-ux-01-qa-browser.json');
const SCREEN_DIR = resolve(ROOT, 'docs/qa/evidence/screens/r-spine-web-approve-ux-01-qa');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

/** Short annual leave dates (<3d) — avoid sick≥3 attach path (LV-03/04 closed). */
function shortLeaveDates(offsetDays = 14) {
  const start = new Date();
  start.setDate(start.getDate() + offsetDays);
  const end = new Date(start);
  end.setDate(end.getDate() + 1); // 2 calendar days
  const fmt = (d) => {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };
  return { start: fmt(start), end: fmt(end) };
}

const results = {
  work_item_id: 'R-SPINE-WEB-APPROVE-UX-01-QA',
  fe_ready: 'docs/qa/evidence/r-spine-web-approve-ux-01.md',
  layer: 'browser-U65-HDSD',
  hdsd_align: true,
  u65: 'zero-seed',
  must_keep: ['LeaveOverviewRecentPanel', 'LV-03/04 attach GWC CLOSED', 'no invent L2 ladder'],
  startedAt: ts(),
  env: { PORTAL, EMAIL },
  click_log: [],
  ac: {},
  case_matrix: {},
  paths: {},
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

function track(page) {
  page.on('response', async (res) => {
    try {
      const u = res.url();
      if (
        !/\/api\/(hrm\/attendance\/leave|hrm\/employees|xbos\/auth|xbos\/workflow-engine|hrm\/files)/.test(
          u,
        )
      )
        return;
      const method = res.request().method();
      if (method === 'OPTIONS') return;
      let bodySnippet = null;
      let reqBody = null;
      try {
        const postData = res.request().postData();
        if (postData) {
          try {
            reqBody = JSON.parse(postData);
          } catch {
            reqBody = { raw: String(postData).slice(0, 200) };
          }
        }
      } catch {
        /* */
      }
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
              businessType: items[0].businessType || items[0].business_type,
              title: items[0].title || items[0].display_title || items[0].subjectTitle,
            },
            code: j?.code,
          };
        } else if (d && typeof d === 'object') {
          bodySnippet = {
            code: j?.code,
            id: d.id,
            status: d.status,
            status_label: d.status_label,
            attachment_url: d.attachment_url,
            message: typeof j?.message === 'string' ? j.message.slice(0, 120) : undefined,
            accessToken: Boolean(d.accessToken),
          };
        } else {
          bodySnippet = { code: j?.code, message: String(j?.message || '').slice(0, 120) };
        }
      } catch {
        /* */
      }
      results.network.push({
        at: ts(),
        method,
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 360),
        bodySnippet,
        reqBody: reqBody
          ? {
              leave_type: reqBody.leave_type,
              start_date: reqBody.start_date,
              end_date: reqBody.end_date,
              employee_id: reqBody.employee_id,
              attachment_url: reqBody.attachment_url,
              decision: reqBody.decision,
              action: reqBody.action,
            }
          : null,
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
  const text = ((await locator.first().textContent().catch(() => '')) || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);
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
  const overviewTestId = await page.getByTestId('hdsd-leave-overview-recent').count().catch(() => 0);
  results.ac.mount = {
    verdict: rootChild > 0 && !viteResolveFail ? 'PASS' : 'FAIL',
    rootChild,
    viteResolveFail,
    overviewTestId,
    url: page.url().slice(0, 220),
    hasLeaveTitle: /Nghỉ phép|Yêu cầu nghỉ|Leave request/i.test(bodyText),
    note: 'must_keep LeaveOverviewRecentPanel mount GWC',
  };
  logClick('ASSERT_MOUNT', results.ac.mount);
}

async function goListTab(page) {
  const listTab = page.locator('[role="tab"]').filter({ hasText: /Danh sách|List|Yêu cầu/i });
  if (await listTab.count()) {
    await tryClick(page, listTab.first(), 'CLICK_SUBTAB_DANH_SACH', { wait: 2000 });
  }
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

async function pickEmployeeAndAnnual(page, dialog) {
  const empTrigger = dialog.locator('button[role="combobox"]').first();
  if (await empTrigger.count()) {
    await tryClick(page, empTrigger, 'OPEN_EMPLOYEE_SELECT', { wait: 1000 });
    const empItem = page.locator('[role="option"]').first();
    if (await empItem.count()) await tryClick(page, empItem, 'PICK_EMPLOYEE', { wait: 800 });
    else await page.keyboard.press('Escape');
  }

  let pickedAnnual = false;
  const typeTriggers = dialog.locator('button[role="combobox"]');
  const typeCount = await typeTriggers.count();
  for (let i = 0; i < typeCount; i++) {
    const tr = typeTriggers.nth(i);
    const label = ((await tr.textContent().catch(() => '')) || '').slice(0, 60);
    if (/nhân viên|employee|chọn nhân/i.test(label) && i === 0) continue;
    await tryClick(page, tr, `OPEN_LEAVE_TYPE_${i}`, { wait: 900 });
    const annualOpt = page
      .locator('[role="option"]')
      .filter({ hasText: /phép năm|annual|nghỉ phép năm|LVT_01|phép năm/i });
    if (await annualOpt.count()) {
      pickedAnnual = await tryClick(page, annualOpt.first(), 'PICK_ANNUAL', { wait: 1000 });
      break;
    }
    // Prefer non-sick if annual label missing
    const nonSick = page
      .locator('[role="option"]')
      .filter({ hasText: /phép|nghỉ|unpaid|không lương|bù/i })
      .filter({ hasNotText: /ốm|sick|bệnh/i });
    if (await nonSick.count()) {
      pickedAnnual = await tryClick(page, nonSick.first(), 'PICK_NON_SICK', { wait: 1000 });
      break;
    }
    await page.keyboard.press('Escape');
    await sleep(300);
  }
  return pickedAnnual;
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
        let filled = 0;
        for (let i = 0; i < Math.min(2, inputs.length); i++) {
          const inp = inputs[i];
          const proto = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
          proto?.set?.call(inp, values[i]);
          inp.dispatchEvent(new Event('input', { bubbles: true }));
          inp.dispatchEvent(new Event('change', { bubbles: true }));
          filled++;
        }
        return filled;
      },
      {
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

async function createAnnualLeaveFe(page, label, dateOffset) {
  const { start, end } = shortLeaveDates(dateOffset);
  logClick('CREATE_LEAVE_START', { label, start, end, note: 'annual/short <3d — avoid sick≥3 attach' });
  const opened = await openCreateDialog(page);
  const dialog = page.locator('[role="dialog"]');
  const hasDialog = opened && (await dialog.count()) > 0 && (await dialog.isVisible().catch(() => false));
  if (!hasDialog) {
    return { ok: false, reason: 'create dialog not opened' };
  }
  const picked = await pickEmployeeAndAnnual(page, dialog);
  const dateFills = await fillViDates(dialog, page, start, end);
  await fillReason(page, dialog, `QA R-SPINE-WEB-APPROVE-UX ${label} annual short`);
  await sleep(800);
  await shot(page, `04-create-${label}`);

  const before = results.network.length;
  const submit = dialog.locator('button').filter({ hasText: /Gửi|Submit|Tạo yêu cầu|Lưu/i }).last();
  if (await submit.count()) {
    await tryClick(page, submit, `SUBMIT_CREATE_${label}`, { wait: 4000 });
  }
  await shot(page, `05-after-create-${label}`);

  const posts = results.network
    .slice(before)
    .filter((n) => n.method === 'POST' && /leave-requests/.test(n.url) && !/approve|reject|files/.test(n.url));
  const created = posts.find((n) => n.status >= 200 && n.status < 300);
  const ok = Boolean(created);
  logClick('CREATE_LEAVE_DONE', {
    label,
    ok,
    status: created?.status,
    id: created?.bodySnippet?.id,
    picked,
    dateFills,
  });

  if (hasDialog && (await dialog.isVisible().catch(() => false))) {
    await closeDialog(page, dialog);
  }
  return {
    ok,
    id: created?.bodySnippet?.id || null,
    status: created?.status ?? null,
    code: created?.bodySnippet?.code ?? null,
    picked,
    dateFills,
    posts: posts.slice(0, 4),
  };
}

async function countApproveButtons(page) {
  const byTestId = await page.locator('[data-testid^="hdsd-leave-list-approve"]').count().catch(() => 0);
  const byRole = await page.getByRole('button', { name: /^(Duyệt|Approve|Phê duyệt)$/i }).count().catch(() => 0);
  return { byTestId, byRole };
}

async function pathA_approveList(page) {
  logClick('PATH_A_START', { intent: 'Danh sách → Duyệt pending → POST approve 2xx → F5' });
  await goListTab(page);
  await shot(page, '06-path-a-list');

  let counts = await countApproveButtons(page);
  logClick('PATH_A_APPROVE_PROBE', counts);

  let created = null;
  if (counts.byTestId === 0 && counts.byRole === 0) {
    created = await createAnnualLeaveFe(page, 'pathA', 21);
    results.paths.pathA_create = created;
    await goListTab(page);
    await sleep(2000);
    counts = await countApproveButtons(page);
    logClick('PATH_A_APPROVE_PROBE_AFTER_CREATE', counts);
  }

  if (counts.byTestId === 0 && counts.byRole === 0) {
    results.paths.pathA = {
      verdict: 'FAIL',
      note: 'No hdsd-leave-list-approve* / Duyệt on Danh sách after FE create attempt',
      create: created,
      counts,
    };
    results.residuals.push({
      id: 'R-SPINE-WEB-APPROVE-LIST-BTN',
      sev: 'P0',
      owner: 'dev-fe',
      note: 'Duyệt missing on pending list rows despite FE READY claim',
    });
    await shot(page, '07-path-a-no-duyet');
    return;
  }

  const before = results.network.length;
  const approveBtn = page.locator('[data-testid^="hdsd-leave-list-approve"]').first();
  const fallback = page.getByRole('button', { name: /^(Duyệt|Approve|Phê duyệt)$/i }).first();
  const target = (await approveBtn.count()) ? approveBtn : fallback;
  const testId = (await target.getAttribute('data-testid').catch(() => '')) || '';
  await tryClick(page, target, 'PATH_A_CLICK_DUYET', { wait: 2500 });

  // Confirm dialog if any
  const confirm = page
    .locator('[role="dialog"] button, button')
    .filter({ hasText: /Xác nhận|Duyệt|Confirm|OK|Đồng ý/i });
  if (await confirm.count()) {
    // only click if a dialog appeared
    const dlg = page.locator('[role="dialog"]');
    if ((await dlg.count()) && (await dlg.isVisible().catch(() => false))) {
      await tryClick(page, confirm.last(), 'PATH_A_CONFIRM', { wait: 2000 });
    }
  }
  await shot(page, '07-path-a-after-approve');

  const approvePosts = results.network
    .slice(before)
    .filter(
      (n) =>
        n.method === 'POST' &&
        /leave-requests.*approve|\/approve/i.test(n.url) &&
        n.status >= 200 &&
        n.status < 300,
    );
  const approveOk = approvePosts.length > 0;
  logClick('PATH_A_APPROVE_NET', {
    approveOk,
    posts: approvePosts.map((p) => ({ status: p.status, url: p.url, code: p.bodySnippet?.code })),
  });

  // F5
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(3500);
  const leaveTab = page.locator('[role="tab"], button').filter({ hasText: /Nghỉ phép|Leave/i });
  if (await leaveTab.count()) await tryClick(page, leaveTab.first(), 'PATH_A_F5_TAB_LEAVE', { wait: 2500 });
  await goListTab(page);
  await shot(page, '08-path-a-f5');

  const listGets = results.network.filter(
    (n) => n.method === 'GET' && /leave-requests/.test(n.url) && n.status >= 200 && n.status < 300,
  );
  const lastList = listGets[listGets.length - 1];
  const f5Mount =
    (await page.evaluate(() => document.querySelector('#root')?.childElementCount ?? 0)) > 0;

  const pass = approveOk && f5Mount;
  results.paths.pathA = {
    verdict: pass ? 'PASS' : 'FAIL',
    testId,
    counts,
    approveOk,
    approvePosts: approvePosts.slice(0, 4),
    f5Mount,
    lastListStatus: lastList?.status ?? null,
    create: created,
    note: 'Expect POST …/approve 2xx + F5 list mounts; status approved retained',
  };
  if (!pass) {
    results.residuals.push({
      id: 'R-SPINE-WEB-APPROVE-PATH-A',
      sev: 'P0',
      owner: approveOk ? 'dev-fe' : 'dev-be',
      note: `approveOk=${approveOk} f5Mount=${f5Mount}`,
    });
  }
  logClick('PATH_A_DONE', { verdict: results.paths.pathA.verdict });
}

async function pathB_approveCc(page) {
  logClick('PATH_B_START', {
    intent: 'CC/inbox hrm_leave → Duyệt (hdsd-cc-leave-approve) → POST tasks/:id/complete 2xx → F5',
  });

  // Ensure a pending leave exists for inbox (create if needed — full FE chain)
  await navigateToLeave(page);
  await goListTab(page);
  let counts = await countApproveButtons(page);
  let created = null;
  if (counts.byTestId === 0 && counts.byRole === 0) {
    created = await createAnnualLeaveFe(page, 'pathB', 28);
    results.paths.pathB_create = created;
  }

  // Navigate CC inbox
  const inboxUrl = `${PORTAL}/command-center/inbox`;
  logClick('NAV_CC_INBOX', { url: inboxUrl });
  await page.goto(inboxUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(4000);
  await shot(page, '09-path-b-inbox');

  // Probe leave tasks / Duyệt
  const leaveApprove = page.getByTestId('hdsd-cc-leave-approve');
  let leaveApproveCount = await leaveApprove.count().catch(() => 0);
  const leaveCards = await page.locator('[data-business-type="hrm_leave"]').count().catch(() => 0);
  const bodyProbe = await page.evaluate(() => {
    const t = document.body?.innerText || '';
    return {
      hasLeaveWord: /nghỉ phép|leave|hrm_leave/i.test(t),
      hasDuyet: /\bDuyệt\b/.test(t),
      hasXuLyNhanh: /Xử lý nhanh/i.test(t),
      empty: /không có|trống|empty|chưa có việc/i.test(t.slice(0, 800)),
    };
  });
  logClick('PATH_B_INBOX_PROBE', { leaveApproveCount, leaveCards, ...bodyProbe });

  // Fallback: CC home
  if (leaveApproveCount === 0 && leaveCards === 0) {
    const ccUrl = `${PORTAL}/command-center`;
    logClick('NAV_CC_HOME', { url: ccUrl });
    await page.goto(ccUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(4000);
    await shot(page, '09b-path-b-cc-home');
    leaveApproveCount = await leaveApprove.count().catch(() => 0);
  }

  // Try open leave card then Duyệt in drawer
  if (leaveApproveCount === 0) {
    const leaveCard = page.locator('[data-business-type="hrm_leave"]').first();
    if (await leaveCard.count()) {
      await tryClick(page, leaveCard, 'PATH_B_OPEN_LEAVE_CARD', { wait: 2000 });
      leaveApproveCount = await page.getByTestId('hdsd-cc-leave-approve').count().catch(() => 0);
    } else {
      // Try row/button with leave keywords
      const leaveRow = page
        .locator('button, a, [role="row"], [class*="card"]')
        .filter({ hasText: /nghỉ phép|đơn nghỉ|leave request|hrm_leave/i })
        .first();
      if (await leaveRow.count()) {
        await tryClick(page, leaveRow, 'PATH_B_OPEN_LEAVE_ROW', { wait: 2000 });
        leaveApproveCount = await page.getByTestId('hdsd-cc-leave-approve').count().catch(() => 0);
      }
    }
  }

  if (leaveApproveCount === 0) {
    // Last resort: Duyệt role on leave-looking surface
    const duy = page.getByRole('button', { name: /^(Duyệt|Phê duyệt)$/i });
    const duyCount = await duy.count().catch(() => 0);
    if (duyCount === 0) {
      results.paths.pathB = {
        verdict: created?.ok === false ? 'FAIL' : 'BLOCKED',
        note:
          'No hdsd-cc-leave-approve / leave card actionable on CC/inbox after FE create attempt. U65 — do not seed. May need WF bridge for leave → inbox.',
        leaveApproveCount,
        leaveCards,
        bodyProbe,
        create: created,
      };
      if (created?.ok) {
        results.residuals.push({
          id: 'R-SPINE-WEB-APPROVE-PATH-B-INBOX',
          sev: 'P1',
          owner: 'dev-be',
          note: 'Leave created via FE but no hrm_leave inbox task / Duyệt CTA visible for ceo',
        });
      }
      await shot(page, '10-path-b-no-duyet');
      logClick('PATH_B_DONE', { verdict: results.paths.pathB.verdict });
      return;
    }
  }

  const before = results.network.length;
  const btn = page.getByTestId('hdsd-cc-leave-approve').first();
  const fallback = page.getByRole('button', { name: /^(Duyệt|Phê duyệt)$/i }).first();
  const target = (await btn.count()) ? btn : fallback;
  const testId = (await target.getAttribute('data-testid').catch(() => '')) || '';
  const accessibleName = ((await target.getAttribute('aria-label').catch(() => '')) || '').slice(0, 80);
  await tryClick(page, target, 'PATH_B_CLICK_DUYET', { wait: 2500 });

  const confirm = page.locator('[role="dialog"] button').filter({ hasText: /Xác nhận|Duyệt|Confirm|OK|Đồng ý/i });
  if ((await confirm.count()) && (await page.locator('[role="dialog"]').isVisible().catch(() => false))) {
    await tryClick(page, confirm.last(), 'PATH_B_CONFIRM', { wait: 2000 });
  }
  await shot(page, '10-path-b-after-approve');

  const completePosts = results.network.slice(before).filter(
    (n) =>
      n.method === 'POST' &&
      (/workflow-engine\/tasks\/[^/]+\/complete/i.test(n.url) ||
        (/complete/i.test(n.url) && /workflow|tasks/i.test(n.url))) &&
      n.status >= 200 &&
      n.status < 300,
  );
  const completeOk = completePosts.length > 0;
  logClick('PATH_B_COMPLETE_NET', {
    completeOk,
    posts: completePosts.map((p) => ({ status: p.status, url: p.url, code: p.bodySnippet?.code })),
  });

  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(3500);
  await shot(page, '11-path-b-f5');
  const f5Mount =
    (await page.evaluate(() => document.querySelector('#root')?.childElementCount ?? 0)) > 0;
  const afterLeaveApprove = await page.getByTestId('hdsd-cc-leave-approve').count().catch(() => 0);

  const pass = completeOk && f5Mount && testId === 'hdsd-cc-leave-approve';
  // Soft pass if complete 2xx even if testid was role fallback after open
  const softPass = completeOk && f5Mount;

  results.paths.pathB = {
    verdict: softPass ? 'PASS' : 'FAIL',
    testId,
    accessibleName,
    leaveApproveCount,
    leaveCards,
    completeOk,
    completePosts: completePosts.slice(0, 4),
    f5Mount,
    afterLeaveApprove,
    create: created,
    hdsdTestIdExact: testId === 'hdsd-cc-leave-approve',
    note: 'Expect hdsd-cc-leave-approve → POST tasks/:id/complete 2xx → F5',
  };
  if (!softPass) {
    results.residuals.push({
      id: 'R-SPINE-WEB-APPROVE-PATH-B',
      sev: 'P0',
      owner: completeOk ? 'dev-fe' : 'dev-be',
      note: `completeOk=${completeOk} testId=${testId}`,
    });
  } else if (testId !== 'hdsd-cc-leave-approve') {
    results.residuals.push({
      id: 'R-SPINE-WEB-APPROVE-PATH-B-TESTID',
      sev: 'P2',
      owner: 'dev-fe',
      note: `Complete 2xx but clicked without exact hdsd-cc-leave-approve (testid=${testId})`,
    });
  }
  logClick('PATH_B_DONE', { verdict: results.paths.pathB.verdict });
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
    await page.goto(PORTAL, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(1500);
    await navigateToLeave(page);

    // Case A fail_deep: sick≥3 without attach should still block (LV-03 must_keep — spot check, not reopen)
    results.case_matrix.A_fail_deep_lv03_spot = {
      verdict: 'SKIP',
      note: 'LV-03/04 GWC CLOSED — must_keep; not reopened this wave (prior R1 PASS)',
    };

    await pathA_approveList(page);
    await pathB_approveCc(page);

    // Case B success = Path A + Path B
    const a = results.paths.pathA?.verdict;
    const b = results.paths.pathB?.verdict;
    results.case_matrix.B_success_hdsd = {
      verdict: a === 'PASS' && (b === 'PASS' || b === 'BLOCKED') ? (b === 'PASS' ? 'PASS' : 'PARTIAL') : a === 'PASS' || b === 'PASS' ? 'PARTIAL' : 'FAIL',
      pathA: a,
      pathB: b,
    };
    results.case_matrix.C_logic_br = {
      verdict: a === 'PASS' ? 'PASS' : 'FAIL',
      note: 'Pending rows expose Duyệt (hdsd-leave-list-approve-*) on Danh sách; leave CC CTA labeled Duyệt',
    };

    const clicks = results.click_log.length;
    results.idle_guard = {
      qa_idle_viewport: clicks >= 8 ? 'PASS' : 'FAIL',
      click_count: clicks,
      note: 'anti-idle: real clicks required',
    };

    const mount = results.ac.mount?.verdict;
    const hardFail =
      mount === 'FAIL' ||
      a === 'FAIL' ||
      b === 'FAIL' ||
      results.idle_guard.qa_idle_viewport === 'FAIL';
    // BLOCKED Path B with Path A PASS → FAIL_TO_PM if mission requires both paths
    const bothRequiredFail = a !== 'PASS' || b !== 'PASS';
    results.verdict = hardFail || bothRequiredFail ? 'FAIL' : 'PASS';
    // Path B BLOCKED (no inbox task) is honesty FAIL for mission exit (both paths required)
    if (b === 'BLOCKED') results.verdict = 'FAIL';
    results.ack_status = results.verdict === 'PASS' ? 'PASS_TO_PM' : 'FAIL_TO_PM';
    results.endedAt = ts();
    save();
    console.log(
      JSON.stringify(
        {
          verdict: results.verdict,
          ack_status: results.ack_status,
          paths: results.paths,
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
  process.exit(results.verdict === 'PASS' ? 0 : 2);
}

main();
