/**
 * QA-HRM-LEAVE-REQ-CREATE-FE-SLUG-01 — light smoke
 * Assert POST leave-requests body company_id === TEXT slug "holding" (not holding UUID).
 * Portal :5173 · U65 zero-seed · HOLD_DEPLOY · NOT :8088
 *
 * Reuses flow of qa-hrm-leave-req-create-01.mjs with portal origin + slug gate.
 */
import puppeteer from 'puppeteer';
import { writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const XBOS_API = process.env.XBOS_API_URL || 'http://127.0.0.1:28002';
const HRM_API = process.env.HRM_API_URL || 'http://127.0.0.1:28001';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const CHROME =
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const HOLDING_UUID = '10000000-0000-4000-8000-000000000001';
const __dir = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dir, '../../docs/qa/evidence/_tmp-qa-hrm-leave-req-create-fe-slug-01-runtime.json');
const SHOT = resolve(__dir, '../../docs/qa/evidence/_tmp-qa-hrm-leave-req-create-fe-slug-01-f5.png');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const results = {
  work_item_id: 'QA-HRM-LEAVE-REQ-CREATE-FE-SLUG-01',
  startedAt: new Date().toISOString(),
  env: { PORTAL, EMAIL, seed: false, HOLD_DEPLOY: true },
  steps: [],
  verdicts: {},
  net: [],
  postBodies: [],
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
  const day = 3 + ((Date.now() / 60_000) | 0) % 25;
  start.setDate(day);
  return { startVi: viDate(start), endVi: viDate(start), startIso: start.toISOString().slice(0, 10) };
}

function parseReqCompanyId(requestBody) {
  if (!requestBody) return null;
  try {
    const j = JSON.parse(requestBody);
    return j?.company_id ?? null;
  } catch {
    const m = String(requestBody).match(/"company_id"\s*:\s*"([^"]+)"/);
    return m ? m[1] : null;
  }
}

async function loginApi() {
  const bases = [
    `${XBOS_API}/api/xbos/auth/login`,
    `${PORTAL}/api/xbos/auth/login`,
  ];
  let lastErr = '';
  for (const url of bases) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
      });
      const text = await r.text();
      const j = text ? JSON.parse(text) : {};
      const data = j?.data ?? j;
      const token = data?.accessToken ?? data?.access_token ?? j?.accessToken;
      if (token) {
        return {
          token,
          expiresAt: Date.now() + 8 * 3600_000,
          user: data?.user ?? {
            userId: EMAIL,
            email: EMAIL,
            displayName: 'CEO Tập đoàn',
            roles: ['group_ceo', 'portal'],
          },
          raw: data,
          loginUrl: url,
        };
      }
      lastErr = `HTTP ${r.status} via ${url}`;
    } catch (e) {
      lastErr = `${url}: ${String(e).slice(0, 160)}`;
    }
  }
  throw new Error(`login failed — ${lastErr}`);
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

async function fetchJson(url, headers) {
  const r = await fetch(url, { headers });
  const text = await r.text();
  try {
    return { ok: r.ok, status: r.status, body: text ? JSON.parse(text) : {}, raw: text };
  } catch {
    return { ok: false, status: r.status, body: null, raw: text };
  }
}

function attachNet(page) {
  page.on('response', async (res) => {
    try {
      const u = res.url();
      if (!/\/api\/hrm\//.test(u)) return;
      if (!/(leave-requests|employees|settings-catalogs)/.test(u)) return;
      const method = res.request().method();
      const entry = {
        url: u.replace(PORTAL, '').replace('http://127.0.0.1:28001', ''),
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

async function activateLeaveTab(page) {
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const hit = buttons.find((b) => {
      const t = (b.textContent || '').replace(/\s+/g, ' ').trim();
      return t === 'Nghỉ phép' || t.endsWith('Nghỉ phép');
    });
    hit?.click();
  });
  for (let i = 0; i < 25; i++) {
    if (await page.evaluate(() => document.body.innerText.includes('Tạo yêu cầu nghỉ'))) return true;
    await sleep(400);
  }
  return false;
}

async function typeViDate(page, inputHandle, vi) {
  await inputHandle.click({ clickCount: 3 });
  await page.keyboard.press('Backspace');
  await inputHandle.type(vi, { delay: 25 });
  await page.keyboard.press('Tab');
  await sleep(200);
}

async function main() {
  mkdirSync(dirname(OUT), { recursive: true });
  const session = await loginApi();
  note('api-login', true, `${EMAIL} via ${session.loginUrl}`);

  const authHeaders = {
    Authorization: `Bearer ${session.token}`,
    'x-tenant-id': 'xevn',
    'x-company-id': 'main',
  };

  const empRes = await fetchJson(
    `${HRM_API}/api/hrm/employees?company_id=main&page=1&page_size=5`,
    authHeaders,
  );
  const empRows =
    empRes.body?.data?.data ??
    empRes.body?.data?.items ??
    empRes.body?.data?.employees ??
    empRes.body?.data ??
    [];
  const empList = Array.isArray(empRows) ? empRows : [];
  const empSample =
    empList.find((e) => /ceo@xe\.vn/i.test(e.email || '') || e.employee_code === 'PORTAL-GCEO') ||
    empList[0] ||
    null;
  note(
    'employee-sample',
    !!empSample,
    empSample ? `code=${empSample.employee_code} company_id=${empSample.company_id}` : `HTTP ${empRes.status}`,
  );

  const window = pickLeaveWindow();
  results.leaveWindow = window;
  results.leaveTypeCode = 'LVT_01';

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
    defaultViewport: { width: 1440, height: 900 },
  });

  const page = await browser.newPage();
  attachNet(page);
  await injectSession(page, session);

  // AC: portal :5173 → Attendance
  const attendanceUrl = `${PORTAL}/hr/attendance?portal=1&tenantId=xevn&companyId=main`;
  await page.goto(attendanceUrl, { waitUntil: 'networkidle2', timeout: 120_000 });
  await sleep(2000);
  note('portal-attendance', true, attendanceUrl);

  const leaveReady = await activateLeaveTab(page);
  note('leave-tab', leaveReady, 'Nghỉ phép → Tạo yêu cầu nghỉ');
  if (!leaveReady) {
    results.verdicts.overall = 'FAIL';
    results.ownerHint = 'dev-fe';
    await browser.close();
    results.endedAt = new Date().toISOString();
    writeFileSync(OUT, JSON.stringify(results, null, 2));
    process.exit(2);
  }

  const markerReason = `QA-LEAVE-SLUG-${Date.now().toString(36).toUpperCase()}`;
  results.markerReason = markerReason;

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

  const searchKw = empSample?.employee_code || 'PORTAL-GCEO';
  const empSearch = await page.$(
    '[role="dialog"] input[aria-label*="nhân" i], [role="dialog"] input[placeholder*="nhân" i], [role="dialog"] input[placeholder*="Tìm" i]',
  );
  if (empSearch) {
    await empSearch.click({ clickCount: 3 });
    await page.keyboard.press('Backspace');
    await empSearch.type(String(searchKw).slice(0, 24), { delay: 40 });
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
  const empPick = await page.evaluate((wantCode) => {
    const items = Array.from(
      document.querySelectorAll('[role="option"], [data-radix-collection-item], [cmdk-item]'),
    );
    const hit =
      items.find((n) => wantCode && (n.textContent || '').includes(wantCode)) || items[0];
    hit?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return { count: items.length, chosen: hit ? (hit.textContent || '').trim() : '' };
  }, empSample?.employee_code || 'PORTAL-GCEO');
  note('employee-pick', empPick.count > 0 && !!empPick.chosen, JSON.stringify(empPick).slice(0, 400));
  await sleep(400);

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
      nodes.find((n) => /LVT_/.test(n.textContent || '')) ||
      nodes[0];
    hit?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return {
      chosen: hit ? (hit.textContent || '').trim() : '',
      catalogSot: nodes.some((n) => /LVT_/.test(n.textContent || '')),
    };
  });
  note('leave-type-pick', !!typePick.chosen && typePick.catalogSot, JSON.stringify(typePick).slice(0, 400));
  await sleep(300);

  const dateInputs = await page.$$(
    '[role="dialog"] input[placeholder*="dd/MM/yyyy" i], [role="dialog"] input[placeholder*="dd/mm/yyyy" i]',
  );
  note('date-inputs', dateInputs.length >= 2, `count=${dateInputs.length}`);
  if (dateInputs.length >= 2) {
    await typeViDate(page, dateInputs[0], window.startVi);
    await typeViDate(page, dateInputs[1], window.endVi);
  }

  await page.evaluate((reason) => {
    const d = document.querySelector('[role="dialog"]') || document.body;
    const ta = d.querySelector('textarea');
    if (!ta) return;
    const proto = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value');
    proto.set.call(ta, reason);
    ta.dispatchEvent(new Event('input', { bubbles: true }));
    ta.dispatchEvent(new Event('change', { bubbles: true }));
  }, markerReason);
  await sleep(200);

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
  await sleep(4000);

  const lastPost = results.postBodies[results.postBodies.length - 1];
  const post201 = lastPost && lastPost.status === 201;
  const reqCompanyId = parseReqCompanyId(lastPost?.requestBody);
  const isSlugHolding = reqCompanyId === 'holding';
  const isHoldingUuid = reqCompanyId === HOLDING_UUID || /^[0-9a-f-]{36}$/i.test(String(reqCompanyId || ''));
  results.requestCompanyId = reqCompanyId;
  results.slugAssert = { expected: 'holding', actual: reqCompanyId, isSlugHolding, isHoldingUuid };

  note(
    'leave-create-post-201',
    !!post201,
    lastPost
      ? `status=${lastPost.status} code=${lastPost.responseBody?.code || lastPost.responseBody?.data?.code || 'n/a'} reqCompanyId=${reqCompanyId}`
      : 'no POST captured',
  );
  note(
    'company-id-slug-holding',
    isSlugHolding && !isHoldingUuid,
    `request company_id=${JSON.stringify(reqCompanyId)} expected="holding" (NOT UUID)`,
  );

  if (!isSlugHolding) results.ownerHint = 'dev-fe';
  else if (!post201) results.ownerHint = 'dev-be';

  const createdId =
    lastPost?.responseBody?.data?.id || lastPost?.responseBody?.id || null;
  results.createdId = createdId;

  await page.reload({ waitUntil: 'networkidle2', timeout: 120_000 });
  await activateLeaveTab(page);
  await sleep(1000);
  try {
    const tabHandles = await page.$$('[role="tab"]');
    for (const h of tabHandles) {
      const t = await page.evaluate((el) => (el.textContent || '').replace(/\s+/g, ' ').trim(), h);
      if (/Danh sách yêu cầu/i.test(t)) {
        await h.click({ delay: 40 });
        break;
      }
    }
  } catch {
    /* ignore */
  }
  await sleep(2000);
  for (let i = 0; i < 20; i++) {
    const ready = await page.evaluate(() => {
      const text = document.body.innerText || '';
      return /PORTAL-GCEO|CEO Tập đoàn|Phép năm|LVT_01/i.test(text);
    });
    if (ready) break;
    await sleep(400);
  }
  const f5 = await page.evaluate(() => {
    const text = document.body.innerText || '';
    return {
      hasEmployee: /PORTAL-GCEO|CEO Tập đoàn/i.test(text),
      hasLeaveType: /Phép năm|LVT_01/i.test(text),
      hasPending: /Chờ duyệt|pending/i.test(text),
      tableRows: document.querySelectorAll('table.saas-table tbody tr, table tbody tr').length,
    };
  });

  const listRes = await fetchJson(
    `${HRM_API}/api/hrm/attendance/leave-requests?company_id=main&page_size=100`,
    authHeaders,
  );
  const listRows =
    listRes.body?.data?.data ??
    listRes.body?.data?.items ??
    listRes.body?.data?.requests ??
    listRes.body?.data ??
    [];
  const listHit = Array.isArray(listRows)
    ? listRows.find(
        (r) =>
          (createdId && r.id === createdId) ||
          (r.handover_tasks && String(r.handover_tasks).includes(markerReason)),
      )
    : null;
  const persistOk = !!post201 && !!listHit;
  const uiOk = !!(f5.hasEmployee && (f5.hasLeaveType || f5.tableRows > 0));
  note(
    'leave-create-f5',
    persistOk && uiOk,
    `uiEmp=${f5.hasEmployee} leaveType=${f5.hasLeaveType} rows=${f5.tableRows} apiHit=${!!listHit} createdId=${createdId || 'n/a'}`,
  );

  try {
    await page.screenshot({ path: SHOT, fullPage: false });
    results.screenshot = SHOT;
    note('screenshot-f5', true, SHOT);
  } catch (e) {
    note('screenshot-f5', false, String(e).slice(0, 200));
  }

  const slugPass = isSlugHolding && !isHoldingUuid;
  const overall = post201 && slugPass && persistOk && uiOk;
  results.verdicts = {
    login: 'PASS',
    createPost201: post201 ? 'PASS' : 'FAIL',
    companyIdSlugHolding: slugPass ? 'PASS' : 'FAIL',
    f5Persist: persistOk && uiOk ? 'PASS' : 'FAIL',
    overall: overall ? 'PASS' : 'FAIL',
  };

  await browser.close();
  results.endedAt = new Date().toISOString();
  writeFileSync(OUT, JSON.stringify(results, null, 2));
  try {
    copyFileSync(OUT, OUT.replace('_tmp-', '_tmp-copy-'));
  } catch {
    /* ignore */
  }
  console.log('\n--- SUMMARY ---');
  console.log(JSON.stringify(results.verdicts, null, 2));
  console.log('requestCompanyId=', reqCompanyId);
  console.log('ownerHint=', results.ownerHint);
  console.log('wrote', OUT);
  process.exit(overall ? 0 : 2);
}

main().catch((e) => {
  console.error(e);
  results.steps.push({ id: 'crash', ok: false, detail: String(e) });
  results.verdicts.overall = 'FAIL';
  results.ownerHint = results.ownerHint || 'devops';
  results.endedAt = new Date().toISOString();
  try {
    writeFileSync(OUT, JSON.stringify(results, null, 2));
  } catch {
    /* ignore */
  }
  process.exit(1);
});
