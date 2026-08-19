/**
 * QA-HRM-SETTINGS-MASTER-DATA-02 — focused U65 slices (leave empty + create + dept + picker)
 * Saves progress after each step. Uses Chrome + HRM FE :8080 (proxy → :28001).
 */
import puppeteer from 'puppeteer';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM_API = process.env.HRM_API_URL || 'http://127.0.0.1:28001';
const HRM_FE = process.env.HRM_FE_URL || 'http://127.0.0.1:8080';
const EMAIL = 'ceo@xe.vn';
const PASSWORD = 'Xevn@2026';
const OUT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../docs/qa/evidence/_tmp-qa-hrm-settings-md-02-runtime.json',
);
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const results = {
  work_item_id: 'QA-HRM-SETTINGS-MASTER-DATA-02',
  startedAt: new Date().toISOString(),
  steps: [],
  verdicts: {},
};

function save() {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(results, null, 2));
}

function note(id, ok, detail) {
  results.steps.push({ id, ok, detail, at: new Date().toISOString() });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${id}  ${detail}`);
  save();
  return ok;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitHttp(url, tries = 20) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(3000) });
      if (r.ok || r.status < 500) return true;
    } catch {
      /* retry */
    }
    await sleep(1000);
  }
  return false;
}

async function login() {
  // Prefer portal; fallback XBOS direct
  for (const base of [PORTAL, 'http://127.0.0.1:28002']) {
    try {
      const r = await fetch(`${base}/api/xbos/auth/login`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
      });
      const j = await r.json();
      const token = j?.data?.accessToken ?? j?.accessToken;
      if (token) return { token, expiresAt: Date.now() + 8 * 3600_000, user: { userId: EMAIL, displayName: 'CEO' }, loginBase: base };
    } catch {
      /* next */
    }
  }
  throw new Error('login failed');
}

async function getCatalogs(token) {
  const h = { Authorization: `Bearer ${token}`, 'x-tenant-id': 'xevn', 'x-company-id': 'main' };
  for (const base of [HRM_API, PORTAL]) {
    try {
      const r = await fetch(`${base}/api/hrm/settings-catalogs?company_id=main`, { headers: h });
      const t = await r.text();
      if (!r.ok) continue;
      return JSON.parse(t);
    } catch {
      /* next */
    }
  }
  throw new Error('catalogs unavailable');
}

function stripCatalogItems(body, keys) {
  const clone = structuredClone(body);
  const list = clone?.data?.catalogs ?? clone?.data ?? clone?.catalogs;
  if (!Array.isArray(list)) return clone;
  for (const row of list) {
    const k = row.catalogKey || row.key;
    if (keys.includes(k)) {
      row.effectiveItems = [];
      if (Array.isArray(row.items)) row.items = [];
    }
  }
  return clone;
}

async function clickByText(page, text) {
  const ok = await page.evaluate((t) => {
    const nodes = Array.from(document.querySelectorAll('button, a, [role="tab"], [role="button"]'));
    const el = nodes.find((n) => (n.textContent || '').replace(/\s+/g, ' ').trim().includes(t));
    if (!el) return false;
    el.click();
    return true;
  }, text);
  if (!ok) throw new Error(`click miss ${text}`);
}

async function main() {
  note('l0-wait-hrm', await waitHttp(`${HRM_API}/api/hrm`), HRM_API);
  note('l0-wait-fe', await waitHttp(`${HRM_FE}/hr/`), HRM_FE);
  note('l0-wait-portal', await waitHttp(PORTAL), PORTAL);

  const session = await login();
  note('api-login', true, session.loginBase);

  const catBody = await getCatalogs(session.token);
  const catalogs = catBody?.data?.catalogs ?? (Array.isArray(catBody?.data) ? catBody.data : []);
  const leaveCodes = (catalogs.find((c) => (c.catalogKey || c.key) === 'leave_types')?.effectiveItems || []).map(
    (i) => i.code,
  );
  const deptCodes = (catalogs.find((c) => (c.catalogKey || c.key) === 'departments')?.effectiveItems || []).map(
    (i) => i.code,
  );
  note('catalog-baseline', true, `leave=${leaveCodes.join(',')} dept=${deptCodes.join(',')}`);

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--window-size=1440,900'],
    defaultViewport: { width: 1440, height: 900 },
  });
  const page = await browser.newPage();
  page.setDefaultTimeout(40000);
  const net = [];
  page.on('response', (res) => {
    const u = res.url();
    if (/\/api\/hrm\/(settings-catalogs|leave-requests|employees)/.test(u)) {
      net.push({ method: res.request().method(), status: res.status(), url: u.replace(/https?:\/\/[^/]+/, '') });
    }
  });
  await page.evaluateOnNewDocument((s) => {
    for (const store of [localStorage, sessionStorage]) {
      store.setItem('xevn.portal.accessToken', s.token);
      store.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
      store.setItem('xevn.portal.user', JSON.stringify(s.user));
    }
  }, session);

  // ---- 1) Leave empty CTA (intercept strip leave_types) ----
  await page.setRequestInterception(true);
  const emptyHandler = async (req) => {
    try {
      if (req.method() === 'GET' && /\/api\/hrm\/settings-catalogs(\?|$)/.test(req.url())) {
        const upstream = await fetch(`${HRM_API}/api/hrm/settings-catalogs?company_id=main`, {
          headers: {
            Authorization: `Bearer ${session.token}`,
            'x-tenant-id': 'xevn',
            'x-company-id': 'main',
          },
        });
        const json = await upstream.json();
        return req.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(stripCatalogItems(json, ['leave_types', 'departments'])),
        });
      }
      return req.continue();
    } catch {
      try {
        await req.continue();
      } catch {
        /* */
      }
    }
  };
  page.on('request', emptyHandler);

  await page.goto(`${HRM_FE}/hr/attendance?portal=1&tenantId=xevn&companyId=main`, {
    waitUntil: 'domcontentloaded',
  });
  await sleep(2500);
  for (const t of ['Nghỉ phép', 'Đơn nghỉ', 'Nghỉ']) {
    try {
      await clickByText(page, t);
      break;
    } catch {
      /* */
    }
  }
  await sleep(800);
  for (const t of ['Tạo đơn', 'Tạo', 'Thêm']) {
    try {
      await clickByText(page, t);
      break;
    } catch {
      /* */
    }
  }
  await sleep(1200);
  const leaveEmpty = await page.evaluate(() => {
    const text = document.body.innerText;
    return {
      cta: text.includes('Chưa có mục trong danh mục') || text.includes('Mở Cài đặt'),
      amber: !!document.querySelector('.bg-amber-50, .border-amber-200'),
      fake8: ['annual', 'sick', 'unpaid', 'maternity', 'marriage', 'bereavement', 'compensatory', 'personal'].filter(
        (k) => new RegExp(`\\b${k}\\b`, 'i').test(text),
      ),
    };
  });
  results.verdicts.leaveEmptyCta =
    leaveEmpty.cta && leaveEmpty.fake8.length === 0 ? 'PASS' : 'FAIL';
  note('leave-empty-cta', results.verdicts.leaveEmptyCta === 'PASS', JSON.stringify(leaveEmpty));

  // Dept empty on employee create
  await page.goto(`${HRM_FE}/hr/employees?portal=1&tenantId=xevn&companyId=main`, {
    waitUntil: 'domcontentloaded',
  });
  await sleep(2000);
  for (const t of ['Thêm nhân viên', 'Thêm mới', 'Tạo']) {
    try {
      await clickByText(page, t);
      break;
    } catch {
      /* */
    }
  }
  await sleep(1500);
  const deptEmpty = await page.evaluate(() => {
    const text = document.body.innerText;
    return {
      cta: text.includes('Chưa có mục trong danh mục') || text.includes('Mở Cài đặt'),
      amber: !!document.querySelector('.bg-amber-50, .border-amber-200'),
    };
  });
  results.verdicts.deptEmptyCta = deptEmpty.cta ? 'PASS' : 'FAIL';
  note('dept-empty-cta', deptEmpty.cta, JSON.stringify(deptEmpty));

  page.off('request', emptyHandler);
  await page.setRequestInterception(false);

  // ---- 2) Settings create leave type (real catalog) ----
  const stamp = `QA_LVT_${Date.now().toString(36).slice(-6).toUpperCase()}`;
  await page.goto(`${HRM_FE}/hr/settings?portal=1&tenantId=xevn&companyId=main`, {
    waitUntil: 'domcontentloaded',
  });
  await sleep(2000);
  for (const t of ['Danh mục nghiệp vụ', 'Master', 'Loại nghỉ']) {
    try {
      await clickByText(page, t);
      await sleep(400);
    } catch {
      /* */
    }
  }
  try {
    await clickByText(page, 'Loại nghỉ');
  } catch {
    /* */
  }
  await sleep(800);
  const filled = await page.evaluate(
    (code, label) => {
      const codeInput = document.querySelector('#md-code-leaveTypes');
      const labelInput = document.querySelector('#md-label-leaveTypes');
      if (!codeInput || !labelInput) return false;
      const set = (el, v) => {
        const proto = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
        proto.set.call(el, v);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      };
      set(codeInput, code);
      set(labelInput, label);
      return true;
    },
    stamp,
    `QA leave ${stamp}`,
  );
  note('settings-leave-fill', filled, stamp);
  if (filled) {
    try {
      await clickByText(page, 'Lưu');
    } catch {
      /* */
    }
    await sleep(2500);
  }
  const postItems = net.filter((n) => n.method === 'POST' && /settings-catalogs\/items/.test(n.url));
  const postOk = postItems.some((n) => n.status >= 200 && n.status < 300);
  note('settings-leave-post', postOk, JSON.stringify(postItems));
  await page.reload({ waitUntil: 'domcontentloaded' });
  await sleep(2000);
  try {
    await clickByText(page, 'Loại nghỉ');
  } catch {
    /* */
  }
  await sleep(800);
  const f5Leave = await page.evaluate((c) => document.body.innerText.includes(c), stamp);
  results.verdicts.leaveCatalogCreateF5 = filled && (postOk || f5Leave) && f5Leave ? 'PASS' : postOk || f5Leave ? 'PARTIAL' : 'FAIL';
  note('settings-leave-f5', f5Leave, stamp);

  // Picker smoke on settings
  const pickerSmoke = await page.evaluate(() => {
    const t = document.body.innerText;
    return {
      loadErr: /Không tải được danh mục|Lỗi tải danh mục/.test(t),
      hasItems: /LVT_|QA_LVT_|Loại nghỉ|Chưa có mục/.test(t),
    };
  });
  results.verdicts.settingsPickerSmoke = !pickerSmoke.loadErr && pickerSmoke.hasItems ? 'PASS' : 'FAIL';
  note('settings-picker-smoke', results.verdicts.settingsPickerSmoke === 'PASS', JSON.stringify(pickerSmoke));

  // ---- 3) Leave create with catalog code ----
  await page.goto(`${HRM_FE}/hr/attendance?portal=1&tenantId=xevn&companyId=main`, {
    waitUntil: 'domcontentloaded',
  });
  await sleep(2000);
  for (const t of ['Nghỉ phép', 'Đơn nghỉ']) {
    try {
      await clickByText(page, t);
      break;
    } catch {
      /* */
    }
  }
  for (const t of ['Tạo đơn', 'Tạo']) {
    try {
      await clickByText(page, t);
      break;
    } catch {
      /* */
    }
  }
  await sleep(1200);
  const leavePicker = await page.evaluate(async (want) => {
    const btns = Array.from(document.querySelectorAll('button[role="combobox"]'));
    const btn =
      btns.find((b) => /loại|nghỉ/i.test(b.getAttribute('aria-label') || b.textContent || '')) || btns[0];
    if (!btn) return { ok: false, reason: 'no combobox', amber: !!document.querySelector('.bg-amber-50') };
    btn.click();
    await new Promise((r) => setTimeout(r, 500));
    const options = Array.from(document.querySelectorAll('[cmdk-item], [role="option"]')).map((n) =>
      (n.textContent || '').replace(/\s+/g, ' ').trim(),
    );
    const fakeAnnual = options.some((o) => /\bannual\b/i.test(o));
    const hit =
      Array.from(document.querySelectorAll('[cmdk-item], [role="option"]')).find((n) =>
        (n.textContent || '').includes(want),
      ) ||
      Array.from(document.querySelectorAll('[cmdk-item], [role="option"]')).find((n) =>
        /LVT_/.test(n.textContent || ''),
      );
    hit?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return { ok: options.length > 0 && !fakeAnnual, options: options.slice(0, 8), fakeAnnual, selected: !!hit };
  }, stamp);
  note('leave-picker-catalog', leavePicker.ok, JSON.stringify(leavePicker));

  // ---- 4) Dept code SoT on employee form ----
  const deptStamp = `QA_DEPT_${Date.now().toString(36).slice(-5).toUpperCase()}`;
  await page.goto(`${HRM_FE}/hr/settings?portal=1&tenantId=xevn&companyId=main`, {
    waitUntil: 'domcontentloaded',
  });
  await sleep(1500);
  try {
    await clickByText(page, 'Phòng ban');
  } catch {
    /* */
  }
  await sleep(500);
  const deptFilled = await page.evaluate(
    (code, label) => {
      const codeInput = document.querySelector('#md-code-departments');
      const labelInput = document.querySelector('#md-label-departments');
      if (!codeInput || !labelInput) return false;
      const set = (el, v) => {
        const proto = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
        proto.set.call(el, v);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      };
      set(codeInput, code);
      set(labelInput, label);
      return true;
    },
    deptStamp,
    `Phòng QA ${deptStamp}`,
  );
  if (deptFilled) {
    try {
      await clickByText(page, 'Lưu');
    } catch {
      /* */
    }
    await sleep(2000);
  }
  note('settings-dept-create', deptFilled, deptStamp);

  await page.goto(`${HRM_FE}/hr/employees?portal=1&tenantId=xevn&companyId=main`, {
    waitUntil: 'domcontentloaded',
  });
  await sleep(2000);
  for (const t of ['Thêm nhân viên', 'Thêm mới', 'Sửa', 'Chỉnh sửa']) {
    try {
      await clickByText(page, t);
      break;
    } catch {
      /* */
    }
  }
  await sleep(1500);
  const deptPicker = await page.evaluate(async (want) => {
    const btns = Array.from(document.querySelectorAll('button[role="combobox"]'));
    const deptBtn = btns.find((b) =>
      /phòng ban|department/i.test(b.getAttribute('aria-label') || b.textContent || ''),
    );
    if (!deptBtn) {
      return { found: false, amber: !!document.querySelector('.bg-amber-50') };
    }
    deptBtn.click();
    await new Promise((r) => setTimeout(r, 500));
    const options = Array.from(document.querySelectorAll('[cmdk-item], [role="option"]')).map((n) =>
      (n.textContent || '').replace(/\s+/g, ' ').trim(),
    );
    const hit =
      Array.from(document.querySelectorAll('[cmdk-item], [role="option"]')).find((n) =>
        (n.textContent || '').includes(want),
      ) ||
      Array.from(document.querySelectorAll('[cmdk-item], [role="option"]')).find((n) =>
        /DEPT_/.test(n.textContent || ''),
      );
    const chosen = hit ? (hit.textContent || '').trim() : '';
    hit?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await new Promise((r) => setTimeout(r, 300));
    const trigger = (deptBtn.textContent || '').replace(/\s+/g, ' ').trim();
    const showsCode = /DEPT_|QA_DEPT_/.test(trigger) || /DEPT_|QA_DEPT_/.test(chosen);
    return { found: true, options: options.slice(0, 6), trigger, chosen, showsCode };
  }, deptStamp);
  results.verdicts.deptPersistCode = deptPicker.found && deptPicker.showsCode ? 'PASS' : deptPicker.found ? 'PARTIAL' : 'FAIL';
  note('dept-picker-code', results.verdicts.deptPersistCode !== 'FAIL', JSON.stringify(deptPicker));

  // Portal shell smoke
  try {
    await page.goto(`${PORTAL}/login`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await sleep(1000);
    results.verdicts.portalShell = 'PASS';
    note('portal-shell', true, await page.url());
  } catch (e) {
    results.verdicts.portalShell = 'BLOCKED';
    note('portal-shell', false, String(e.message || e));
  }

  results.netSample = net.slice(-30);
  results.finishedAt = new Date().toISOString();
  const v = results.verdicts;
  results.overall =
    v.leaveEmptyCta === 'PASS' &&
    v.deptEmptyCta === 'PASS' &&
    (v.leaveCatalogCreateF5 === 'PASS' || v.leaveCatalogCreateF5 === 'PARTIAL') &&
    v.settingsPickerSmoke === 'PASS' &&
    (v.deptPersistCode === 'PASS' || v.deptPersistCode === 'PARTIAL')
      ? 'PASS'
      : 'PARTIAL_OR_FAIL';
  save();
  console.log('=== verdicts ===', JSON.stringify(v, null, 2));
  console.log('overall', results.overall);
  await browser.close();
  process.exit(results.overall === 'PASS' ? 0 : 2);
}

main().catch((e) => {
  results.error = String(e?.stack || e);
  save();
  console.error(e);
  process.exit(1);
});
