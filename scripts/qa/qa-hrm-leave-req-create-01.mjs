/**
 * QA-HRM-LEAVE-REQ-CREATE-01 — U65 browser leave-request create → 2xx → F5
 * Residual close from qa-hrm-settings-md-fe-live-01 (POST leave-requests 400).
 * HOLD_DEPLOY · NOT :8088 · zero-seed
 */
import puppeteer from 'puppeteer';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM_FE = process.env.HRM_FE_URL || 'http://127.0.0.1:8080';
const XBOS_API = process.env.XBOS_API_URL || 'http://127.0.0.1:28002';
const HRM_API = process.env.HRM_API_URL || 'http://127.0.0.1:28001';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const CHROME =
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../docs/qa/evidence/_tmp-qa-hrm-leave-req-create-01-runtime.json',
);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const results = {
  work_item_id: 'QA-HRM-LEAVE-REQ-CREATE-01',
  startedAt: new Date().toISOString(),
  env: { PORTAL, HRM_FE, EMAIL, seed: false },
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
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

/** Far-future unique day — avoids overlap with prior L1/QA runs on fixed day-12. */
function pickLeaveWindow() {
  const start = new Date();
  start.setMonth(start.getMonth() + 5);
  // Unique day-of-month 3..27 from clock (stable within same second runs still collide — add minute).
  const day = 3 + ((Date.now() / 60_000) | 0) % 25;
  start.setDate(day);
  const end = new Date(start);
  end.setDate(start.getDate()); // 1 day
  return { startVi: viDate(start), endVi: viDate(end), startIso: start.toISOString().slice(0, 10) };
}

async function loginApi() {
  const bases = [
    `${XBOS_API}/api/xbos/auth/login`,
    `${PORTAL}/api/xbos/auth/login`,
    'http://14.225.217.232:8088/api/xbos/auth/login',
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
        const user = data?.user ?? {
          userId: EMAIL,
          email: EMAIL,
          displayName: 'CEO Tập đoàn',
          roles: ['group_ceo', 'portal'],
        };
        return {
          token,
          expiresAt: Date.now() + 8 * 3600_000,
          user,
          raw: data,
          loginUrl: url,
        };
      }
      lastErr = `HTTP ${r.status} via ${url}: ${text.slice(0, 200)}`;
    } catch (e) {
      lastErr = `${url}: ${String(e).slice(0, 200)}`;
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
      if (!/(leave-requests|employees|settings-catalogs|leave-balance)/.test(u)) return;
      const method = res.request().method();
      const entry = {
        url: u.replace(PORTAL, '').replace(HRM_FE, '').replace('http://127.0.0.1:28001', ''),
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
  await page.keyboard.press('Tab'); // blur → flushSync commit ISO
  await sleep(200);
}

async function main() {
  mkdirSync(dirname(OUT), { recursive: true });
  const session = await loginApi();
  note('api-login', true, `${EMAIL} token ok`);

  const authHeaders = {
    Authorization: `Bearer ${session.token}`,
    'x-tenant-id': 'xevn',
    'x-company-id': 'main',
  };
  note('login-url', true, session.loginUrl || 'n/a');

  const catRes = await fetchJson(`${HRM_API}/api/hrm/settings-catalogs?company_id=main`, authHeaders);
  note('settings-catalogs', catRes.ok, `HTTP ${catRes.status}`);
  const catalogs = catRes.body?.data?.catalogs ?? catRes.body?.data ?? [];
  const leaveRow = catalogs.find((c) => (c.catalogKey || c.key) === 'leave_types');
  const leaveItems = leaveRow?.effectiveItems || [];
  const leaveSample = leaveItems.find((i) => /LVT_|QA_LVT_/i.test(i.code)) || leaveItems[0];
  note(
    'leave-type-catalog',
    !!leaveSample,
    leaveSample
      ? `code=${leaveSample.code} label=${leaveSample.label || leaveSample.name || ''} count=${leaveItems.length}`
      : 'empty leave_types — cannot create request with catalog code',
  );
  if (!leaveSample) {
    results.verdicts.overall = 'FAIL';
    results.ownerHint = 'dev-be';
    results.endedAt = new Date().toISOString();
    writeFileSync(OUT, JSON.stringify(results, null, 2));
    process.exit(2);
  }

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
    empSample
      ? `id=${empSample.id} code=${empSample.employee_code} name=${empSample.full_name}`
      : `HTTP ${empRes.status}`,
  );

  const window = pickLeaveWindow();
  results.leaveWindow = window;
  results.leaveTypeCode = leaveSample.code;

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
    defaultViewport: { width: 1440, height: 900 },
  });

  const page = await browser.newPage();
  attachNet(page);
  await injectSession(page, session);

  const qs = 'portal=1&tenantId=xevn&companyId=main';
  // Prefer HRM FE under portal session (same as FE-LIVE SoT); portal :5173 L0 smoke separate.
  const attendanceUrl = `${HRM_FE}/hr/attendance?${qs}`;
  await page.goto(attendanceUrl, { waitUntil: 'networkidle2', timeout: 120_000 });
  await sleep(1500);

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

  // Baseline list text for F5 marker
  const markerReason = `QA-LEAVE-REQ-${Date.now().toString(36).toUpperCase()}`;
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

  // Wait for catalog picker (not empty CTA)
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
    if (state === 'empty') {
      note('leave-type-empty-cta', false, 'catalog empty in dialog');
      break;
    }
    await sleep(400);
  }
  note('leave-type-ready', typeReady, 'CatalogSearchPicker ready');

  // --- Employee typeahead ---
  const searchKw = empSample?.employee_code || empSample?.full_name?.split(/\s+/).pop() || 'NV';
  await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"]') || document.body;
    const inp = Array.from(d.querySelectorAll('input')).find((i) =>
      /Tìm nhân viên|search employee|nhân viên/i.test(i.getAttribute('aria-label') || i.placeholder || ''),
    );
    if (inp) {
      inp.focus();
      inp.value = '';
      inp.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
  const empSearch = await page.$(
    '[role="dialog"] input[aria-label*="nhân" i], [role="dialog"] input[placeholder*="nhân" i], [role="dialog"] input[placeholder*="Tìm" i]',
  );
  if (empSearch) {
    await empSearch.click({ clickCount: 3 });
    await page.keyboard.press('Backspace');
    await empSearch.type(String(searchKw).slice(0, 24), { delay: 40 });
  } else {
    // fallback: first text input in dialog
    const first = await page.$('[role="dialog"] input:not([placeholder*="dd"])');
    if (first) {
      await first.click({ clickCount: 3 });
      await first.type(String(searchKw).slice(0, 24), { delay: 40 });
    }
  }
  await sleep(900); // debounce 300 + fetch

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
    const texts = items.map((n) => (n.textContent || '').replace(/\s+/g, ' ').trim()).slice(0, 8);
    const hit =
      items.find((n) => wantCode && (n.textContent || '').includes(wantCode)) || items[0];
    hit?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return {
      count: items.length,
      texts,
      chosen: hit ? (hit.textContent || '').trim() : '',
    };
  }, empSample?.employee_code || '');
  note('employee-pick', empPick.count > 0 && !!empPick.chosen, JSON.stringify(empPick).slice(0, 500));
  await sleep(400);

  // --- Leave type catalog picker ---
  await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"]') || document.body;
    const btn = Array.from(d.querySelectorAll('button[role="combobox"]')).find((b) =>
      /Chọn loại nghỉ|loại nghỉ|leave type/i.test(b.getAttribute('aria-label') || b.textContent || ''),
    );
    btn?.click();
  });
  await sleep(700);
  const typePick = await page.evaluate((want) => {
    const nodes = Array.from(
      document.querySelectorAll('[cmdk-item], [data-slot="command-item"], [role="option"]'),
    );
    const options = nodes.map((n) => (n.textContent || '').replace(/\s+/g, ' ').trim());
    const hit =
      nodes.find((n) => (n.textContent || '').includes(want)) ||
      nodes.find((n) => /LVT_|QA_LVT_/.test(n.textContent || '')) ||
      nodes[0];
    hit?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return {
      options: options.slice(0, 12),
      chosen: hit ? (hit.textContent || '').trim() : '',
      catalogSot: options.some((o) => /LVT_|QA_LVT_/.test(o)),
    };
  }, leaveSample.code);
  note(
    'leave-type-pick',
    !!typePick.chosen && typePick.catalogSot,
    JSON.stringify(typePick).slice(0, 600),
  );
  await sleep(300);

  // --- Dates via real keyboard (ViDateInput commits ISO on complete draft) ---
  const dateInputs = await page.$$('[role="dialog"] input[placeholder*="dd/MM/yyyy" i], [role="dialog"] input[placeholder*="dd/mm/yyyy" i]');
  note('date-inputs', dateInputs.length >= 2, `count=${dateInputs.length}`);
  if (dateInputs.length >= 2) {
    await typeViDate(page, dateInputs[0], window.startVi);
    await typeViDate(page, dateInputs[1], window.endVi);
  }
  const dateValues = await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"]') || document.body;
    return Array.from(d.querySelectorAll('input'))
      .filter((i) => /dd\/mm\/yyyy/i.test(i.placeholder || ''))
      .map((i) => i.value);
  });
  note('date-filled', dateValues.length >= 2 && dateValues.every((v) => /\d{2}\/\d{2}\/\d{4}/.test(v)), JSON.stringify(dateValues));

  // Reason (marker for F5)
  await page.evaluate((reason) => {
    const d = document.querySelector('[role="dialog"]') || document.body;
    const ta =
      d.querySelector('textarea') ||
      Array.from(d.querySelectorAll('input')).find((i) =>
        /lý do|reason/i.test(i.getAttribute('aria-label') || i.placeholder || ''),
      );
    if (!ta) return;
    const proto = Object.getOwnPropertyDescriptor(
      ta.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype,
      'value',
    );
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
    if (btn.disabled) return { ok: false, reason: 'disabled', text: (btn.textContent || '').trim() };
    btn.click();
    return { ok: true, text: (btn.textContent || '').trim() };
  });
  note('submit-click', !!submit.ok, JSON.stringify(submit));
  await sleep(4000);

  const leavePosts = results.postBodies.filter((p) => true);
  const lastPost = leavePosts[leavePosts.length - 1];
  const post2xx = leavePosts.some((p) => p.status >= 200 && p.status < 300);
  note(
    'leave-create-post',
    post2xx,
    lastPost
      ? `status=${lastPost.status} body=${JSON.stringify(lastPost.responseBody).slice(0, 800)} req=${(lastPost.requestBody || '').slice(0, 400)}`
      : `no POST captured; net=${JSON.stringify(results.net.filter((n) => /leave-requests/.test(n.url)).slice(-5))}`,
  );

  if (!post2xx && lastPost) {
    const msg = JSON.stringify(lastPost.responseBody || {});
    if (/leave_type|HRM-ATT-LEAVE-TYPE|VAL-SET/i.test(msg)) results.ownerHint = 'dev-be';
    else if (/OVERLAP|HRM-LEAVE-VAL-OVERLAP/i.test(msg)) results.ownerHint = 'qa-retest-unique-dates';
    else if (/employee_id|IsUUID|validation|whitelis|DTO|start_date|end_date|total_days/i.test(msg)) {
      // Could be FE not sending fields → prefer FE if request body incomplete
      const req = lastPost.requestBody || '';
      if (!req || !/employee_id|start_date|leave_type/.test(req)) results.ownerHint = 'dev-fe';
      else results.ownerHint = 'dev-be';
    } else if (/balance|HRM-LEAVE-VAL-BALANCE/i.test(msg)) results.ownerHint = 'dev-be';
    else results.ownerHint = 'dev-fe';
  } else if (!post2xx) {
    results.ownerHint = 'dev-fe'; // submit did not fire network
  }

  const createdId =
    lastPost?.responseBody?.data?.id ||
    lastPost?.responseBody?.id ||
    null;
  results.createdId = createdId;

  // F5 / reload list — land on request list (calendar defaults to current month)
  await page.reload({ waitUntil: 'networkidle2', timeout: 120_000 });
  await activateLeaveTab(page);
  await sleep(1000);
  let switched = { ok: false, text: '' };
  try {
    const tabHandles = await page.$$('[role="tab"]');
    let target = null;
    for (const h of tabHandles) {
      const t = await page.evaluate((el) => (el.textContent || '').replace(/\s+/g, ' ').trim(), h);
      if (/Danh sách yêu cầu/i.test(t)) {
        target = h;
        switched = { ok: true, text: t };
        break;
      }
    }
    if (target) {
      await target.click({ delay: 40 });
      await sleep(500);
      // CDP fallback if still on calendar
      const stillCal = await page.evaluate(() => {
        const active = Array.from(document.querySelectorAll('[role="tab"]')).find(
          (t) => t.getAttribute('data-state') === 'active' || t.getAttribute('aria-selected') === 'true',
        );
        return /Lịch nghỉ|calendar/i.test(active?.textContent || '');
      });
      if (stillCal) {
        const box = await target.boundingBox();
        if (box) {
          await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2, { delay: 30 });
        }
      }
    }
  } catch (e) {
    switched = { ok: false, text: String(e).slice(0, 200) };
  }
  note('f5-switch-list-tab', !!switched.ok, JSON.stringify(switched).slice(0, 300));
  await sleep(2000);
  // Wait for table rows to render
  for (let i = 0; i < 20; i++) {
    const ready = await page.evaluate(() => {
      const text = document.body.innerText || '';
      const active = Array.from(document.querySelectorAll('[role="tab"]')).find(
        (t) => t.getAttribute('data-state') === 'active' || t.getAttribute('aria-selected') === 'true',
      );
      const onList = /Danh sách|request/i.test(active?.textContent || '');
      return onList && /PORTAL-GCEO|CEO Tập đoàn|Phép năm|LVT_01/i.test(text);
    });
    if (ready) break;
    await sleep(400);
  }
  const f5 = await page.evaluate((marker) => {
    const text = document.body.innerText || '';
    const activeTab = Array.from(document.querySelectorAll('[role="tab"]')).find(
      (t) => t.getAttribute('data-state') === 'active' || t.getAttribute('aria-selected') === 'true',
    );
    return {
      hasMarker: text.includes(marker),
      hasPending: /Chờ duyệt|pending/i.test(text),
      hasEmployee: /PORTAL-GCEO|CEO Tập đoàn/i.test(text),
      hasLeaveType: /Phép năm|LVT_01/i.test(text),
      activeTab: activeTab ? (activeTab.textContent || '').replace(/\s+/g, ' ').trim() : null,
      hasListTab: /Danh sách yêu cầu/i.test(text),
      tableRows: document.querySelectorAll('table.saas-table tbody tr, table tbody tr').length,
      snippet: text.replace(/\s+/g, ' ').slice(0, 800),
    };
  }, markerReason);

  // Persist via API (marker lives in handover_tasks; reason often null)
  // page_size max accepted ≈ 100 (200 → 400)
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
          (r.handover_tasks && String(r.handover_tasks).includes(markerReason)) ||
          (r.reason && String(r.reason).includes(markerReason)),
      )
    : null;
  // Persist = row in list after create
  const persistOk = post2xx && !!listHit;
  const uiOk = !!(
    f5.hasMarker ||
    (persistOk && f5.hasEmployee && /Danh sách|request/i.test(f5.activeTab || '')) ||
    (persistOk && f5.hasEmployee && f5.hasLeaveType) ||
    (persistOk && f5.tableRows > 0 && f5.hasEmployee)
  );
  note(
    'leave-create-f5',
    persistOk && uiOk,
    `uiMarker=${f5.hasMarker} uiEmp=${f5.hasEmployee} leaveType=${f5.hasLeaveType} activeTab=${f5.activeTab} rows=${f5.tableRows} apiHit=${!!listHit?.id || !!listHit} createdId=${createdId || 'n/a'} listHttp=${listRes.status} listCount=${Array.isArray(listRows) ? listRows.length : -1}`,
  );

  // Screenshot after F5 for evidence pack
  try {
    const shot = resolve(
      dirname(fileURLToPath(import.meta.url)),
      '../../docs/qa/evidence/_tmp-qa-hrm-leave-req-create-01-f5.png',
    );
    await page.screenshot({ path: shot, fullPage: false });
    results.screenshot = shot;
    note('screenshot-f5', true, shot);
  } catch (e) {
    note('screenshot-f5', false, String(e).slice(0, 200));
  }

  results.verdicts = {
    login: 'PASS',
    leaveTypeCatalog: leaveSample ? 'PASS' : 'FAIL',
    createPost2xx: post2xx ? 'PASS' : 'FAIL',
    f5Persist: persistOk && uiOk ? 'PASS' : 'FAIL',
    overall: post2xx && persistOk && uiOk ? 'PASS' : 'FAIL',
  };

  // Portal smoke (preferred origin) — login + redirect path only
  try {
    const pageP = await browser.newPage();
    await injectSession(pageP, session);
    await pageP.goto(`${PORTAL}/`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    const portalOk = await pageP.evaluate(() => !!document.body);
    note('portal-5173-smoke', portalOk, PORTAL);
    await pageP.close();
  } catch (e) {
    note('portal-5173-smoke', false, String(e).slice(0, 200));
  }

  await browser.close();
  results.endedAt = new Date().toISOString();
  writeFileSync(OUT, JSON.stringify(results, null, 2));
  console.log('\n--- SUMMARY ---');
  console.log(JSON.stringify(results.verdicts, null, 2));
  console.log('ownerHint=', results.ownerHint);
  console.log('wrote', OUT);
  process.exit(results.verdicts.overall === 'PASS' ? 0 : 2);
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
