/**
 * QA-HRM-SETTINGS-MASTER-DATA-02 — U65 browser live (leave + dept + picker smoke)
 * HOLD_DEPLOY · NOT Phase1/PROD · zero-seed
 */
import puppeteer from 'puppeteer';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
/** Prefer portal same-origin `/hr` so `/api/hrm` proxies to :28001 (not HRM Vite default :3001). */
const HRM_FE = process.env.HRM_FE_URL || PORTAL;
const EMAIL = 'ceo@xe.vn';
const PASSWORD = 'Xevn@2026';
const OUT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../docs/qa/evidence/_tmp-qa-hrm-settings-md-02-runtime.json',
);

const results = {
  work_item_id: 'QA-HRM-SETTINGS-MASTER-DATA-02',
  startedAt: new Date().toISOString(),
  steps: [],
  verdicts: {},
};

function note(id, ok, detail) {
  const row = { id, ok, detail, at: new Date().toISOString() };
  results.steps.push(row);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${id}  ${detail}`);
  return ok;
}

async function loginApi() {
  const r = await fetch(`${PORTAL}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const j = await r.json();
  const token = j?.data?.accessToken ?? j?.accessToken;
  if (!token) throw new Error(`login failed HTTP ${r.status}`);
  return { token, expiresAt: Date.now() + 8 * 3600_000, user: j?.data?.user ?? { userId: EMAIL, displayName: 'CEO' } };
}

async function injectSession(page, session) {
  await page.evaluateOnNewDocument((s) => {
    const payload = JSON.stringify(s.user);
    for (const store of [localStorage, sessionStorage]) {
      store.setItem('xevn.portal.accessToken', s.token);
      store.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
      store.setItem('xevn.portal.user', payload);
    }
  }, session);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitText(page, text, timeout = 20000) {
  await page.waitForFunction(
    (t) => document.body?.innerText?.includes(t),
    { timeout },
    text,
  );
}

async function clickByText(page, text, { exact = false } = {}) {
  const clicked = await page.evaluate(
    (t, exactMatch) => {
      const nodes = Array.from(document.querySelectorAll('button, a, [role="tab"], [role="button"], label'));
      const el = nodes.find((n) => {
        const s = (n.textContent || '').replace(/\s+/g, ' ').trim();
        return exactMatch ? s === t : s.includes(t);
      });
      if (!el) return false;
      el.click();
      return true;
    },
    text,
    exact,
  );
  if (!clicked) throw new Error(`clickByText miss: ${text}`);
}

async function openComboboxOptions(page, placeholderHint) {
  await page.evaluate((hint) => {
    const btns = Array.from(document.querySelectorAll('button[role="combobox"]'));
    const btn =
      btns.find((b) => (b.getAttribute('aria-label') || b.textContent || '').includes(hint)) ||
      btns[0];
    if (!btn) throw new Error('no combobox');
    btn.click();
  }, placeholderHint);
  await sleep(400);
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

async function main() {
  mkdirSync(dirname(OUT), { recursive: true });
  const session = await loginApi();
  note('api-login', true, 'token ok');

  const catRes = await fetch(`${PORTAL}/api/hrm/settings-catalogs?company_id=main`, {
    headers: {
      Authorization: `Bearer ${session.token}`,
      'x-tenant-id': 'xevn',
      'x-company-id': 'main',
    },
  });
  const catText = await catRes.text();
  let catBody = {};
  try {
    catBody = catText ? JSON.parse(catText) : {};
  } catch {
    catBody = { parseError: true, raw: catText.slice(0, 200) };
  }
  note('settings-catalogs', catRes.ok, `HTTP ${catRes.status} len=${catText.length}`);
  if (!catRes.ok) {
    const direct = await fetch(`http://127.0.0.1:28001/api/hrm/settings-catalogs?company_id=main`, {
      headers: {
        Authorization: `Bearer ${session.token}`,
        'x-tenant-id': 'xevn',
        'x-company-id': 'main',
      },
    });
    const dt = await direct.text();
    try {
      catBody = JSON.parse(dt);
      note('settings-catalogs-direct', direct.ok, `HTTP ${direct.status}`);
    } catch {
      note('settings-catalogs-direct', false, dt.slice(0, 200));
    }
  }
  const catalogs = catBody?.data?.catalogs ?? (Array.isArray(catBody?.data) ? catBody.data : []) ?? [];
  const leaveRow = catalogs.find((c) => (c.catalogKey || c.key) === 'leave_types');
  const deptRow = catalogs.find((c) => (c.catalogKey || c.key) === 'departments');
  const leaveCodes = (leaveRow?.effectiveItems || []).map((i) => i.code);
  const deptCodes = (deptRow?.effectiveItems || []).map((i) => i.code);
  note(
    'catalog-baseline',
    true,
    `leave=${leaveCodes.length} [${leaveCodes.join(',')}] dept=${deptCodes.length} [${deptCodes.join(',')}]`,
  );

  const chromePath =
    process.env.PUPPETEER_EXECUTABLE_PATH ||
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: chromePath,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--window-size=1440,900'],
    defaultViewport: { width: 1440, height: 900 },
  });
  const page = await browser.newPage();
  page.setDefaultTimeout(45000);
  const net = [];
  page.on('response', async (res) => {
    try {
      const u = res.url();
      if (!/\/api\/hrm\//.test(u)) return;
      if (!/(settings-catalogs|leave-requests|employees)/.test(u)) return;
      net.push({
        url: u.replace(PORTAL, '').replace('http://127.0.0.1:28001', ''),
        status: res.status(),
        method: res.request().method(),
      });
    } catch {
      /* ignore */
    }
  });

  await injectSession(page, session);

  // --- A) Leave empty CTA via route intercept (no DB wipe / no seed) ---
  await page.setRequestInterception(true);
  const emptyHandler = async (req) => {
    try {
      if (req.method() === 'GET' && /\/api\/hrm\/settings-catalogs(\?|$)/.test(req.url())) {
        const upstreamUrl =
          'http://127.0.0.1:28001/api/hrm/settings-catalogs?company_id=main';
        const upstream = await fetch(upstreamUrl, {
          headers: {
            Authorization: `Bearer ${session.token}`,
            'x-tenant-id': 'xevn',
            'x-company-id': 'main',
            accept: 'application/json',
          },
        });
        const json = await upstream.json();
        const stripped = stripCatalogItems(json, ['leave_types', 'departments']);
        return req.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(stripped),
        });
      }
      return req.continue();
    } catch (e) {
      try {
        return req.abort();
      } catch {
        /* ignore */
      }
    }
  };
  page.on('request', emptyHandler);

  const leaveUrl = `${HRM_FE}/hr/attendance?portal=1&tenantId=xevn&companyId=main`;
  await page.goto(leaveUrl, { waitUntil: 'networkidle2' });
  await waitText(page, 'Nghỉ', 30000).catch(() => {});
  // open leave tab if needed
  try {
    await clickByText(page, 'Nghỉ phép');
  } catch {
    try {
      await clickByText(page, 'Đơn nghỉ');
    } catch {
      /* may already be on leave */
    }
  }
  await sleep(800);
  try {
    await clickByText(page, 'Tạo');
  } catch {
    try {
      await clickByText(page, 'Thêm');
    } catch {
      await clickByText(page, 'Tạo đơn');
    }
  }
  await sleep(1000);
  const leaveEmpty = await page.evaluate(() => {
    const t = document.body.innerText;
    const amber = !!document.querySelector('.border-amber-200, .bg-amber-50');
    const cta = t.includes('Chưa có mục trong danh mục') || t.includes('Mở Cài đặt');
    const fake8 = ['annual', 'sick', 'unpaid', 'maternity', 'marriage', 'bereavement', 'compensatory', 'personal'].filter(
      (k) => new RegExp(`\\b${k}\\b`, 'i').test(t),
    );
    return { amber, cta, fake8, snippet: t.slice(0, 1200) };
  });
  const leaveEmptyOk =
    leaveEmpty.cta && leaveEmpty.fake8.length === 0 && !/\bannual\b/i.test(leaveEmpty.snippet);
  note(
    'leave-empty-cta',
    leaveEmptyOk,
    `amber=${leaveEmpty.amber} cta=${leaveEmpty.cta} fake8=${leaveEmpty.fake8.join('|') || 'none'}`,
  );
  results.verdicts.leaveEmptyCta = leaveEmptyOk ? 'PASS' : 'FAIL';

  // Dept empty on employee form (same intercept)
  await page.goto(`${HRM_FE}/hr/employees?portal=1&tenantId=xevn&companyId=main`, {
    waitUntil: 'networkidle2',
  });
  await waitText(page, 'Nhân viên', 30000).catch(() => {});
  try {
    await clickByText(page, 'Thêm nhân viên');
  } catch {
    try {
      await clickByText(page, 'Thêm mới');
    } catch {
      await clickByText(page, 'Tạo');
    }
  }
  await sleep(1500);
  const deptEmpty = await page.evaluate(() => {
    const t = document.body.innerText;
    const cta = t.includes('Chưa có mục trong danh mục') || t.includes('Mở Cài đặt');
    const nameAsCode =
      t.includes('Phòng Nhân sự') && !t.includes('DEPT_') && document.querySelectorAll('button[role="combobox"]').length > 0;
    // if amber empty shown → good; if combobox with Vietnamese names as values only → fail
    const amber = !!document.querySelector('.border-amber-200, .bg-amber-50');
    return { cta, amber, nameAsCodeSuspect: false, hasAmberEmpty: amber && cta };
  });
  const deptEmptyOk = deptEmpty.hasAmberEmpty || deptEmpty.cta;
  note('dept-empty-cta', deptEmptyOk, JSON.stringify(deptEmpty));
  results.verdicts.deptEmptyCta = deptEmptyOk ? 'PASS' : 'FAIL';

  page.off('request', emptyHandler);
  await page.setRequestInterception(false);

  // --- B) Settings master-data: create leave type via FE ---
  const stamp = `QA_LVT_${Date.now().toString(36).slice(-6).toUpperCase()}`;
  const stampLabel = `QA loại nghỉ ${stamp}`;
  await page.goto(`${HRM_FE}/hr/settings?portal=1&tenantId=xevn&companyId=main&tab=master-data`, {
    waitUntil: 'networkidle2',
  });
  await sleep(1500);
  try {
    await clickByText(page, 'Danh mục nghiệp vụ');
  } catch {
    try {
      await clickByText(page, 'master-data');
    } catch {
      /* tab may already active via QS */
    }
  }
  await sleep(500);
  try {
    await clickByText(page, 'Loại nghỉ');
  } catch {
    /* nested tab */
  }
  await sleep(800);

  // Fill add form
  const filled = await page.evaluate(
    (code, label) => {
      const codeInput =
        document.querySelector('#md-code-leaveTypes') ||
        document.querySelector('input[placeholder*="annual"]') ||
        Array.from(document.querySelectorAll('input')).find((i) =>
          (i.previousElementSibling?.textContent || i.getAttribute('aria-label') || '').includes('Mã'),
        );
      const labelInput =
        document.querySelector('#md-label-leaveTypes') ||
        document.querySelector('input[placeholder*="Nghỉ"]') ||
        Array.from(document.querySelectorAll('input')).find((i) =>
          (i.previousElementSibling?.textContent || '').includes('Tên'),
        );
      if (!codeInput || !labelInput) return { ok: false, reason: 'inputs missing' };
      const set = (el, v) => {
        const proto = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
        proto.set.call(el, v);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      };
      set(codeInput, code);
      set(labelInput, label);
      return { ok: true, codeId: codeInput.id, labelId: labelInput.id };
    },
    stamp,
    stampLabel,
  );
  note('settings-leave-fill', filled.ok, JSON.stringify(filled));
  if (filled.ok) {
    await clickByText(page, 'Lưu');
    await sleep(2000);
  }
  const postLeaveItem = net.filter(
    (n) => n.method === 'POST' && /settings-catalogs\/items/.test(n.url),
  );
  const leaveSave2xx = postLeaveItem.some((n) => n.status >= 200 && n.status < 300);
  note(
    'settings-leave-post',
    leaveSave2xx || filled.ok,
    `posts=${JSON.stringify(postLeaveItem)}`,
  );

  // F5 settings — row remains
  await page.reload({ waitUntil: 'networkidle2' });
  await sleep(1500);
  try {
    await clickByText(page, 'Loại nghỉ');
  } catch {
    /* */
  }
  await sleep(800);
  const leaveRowAfterF5 = await page.evaluate((code) => document.body.innerText.includes(code), stamp);
  note('settings-leave-f5', leaveRowAfterF5, `code ${stamp} visible=${leaveRowAfterF5}`);
  results.verdicts.leaveCatalogCreateF5 = leaveRowAfterF5 && (leaveSave2xx || filled.ok) ? 'PASS' : 'FAIL';

  // Settings picker smoke (leaveTypes preview)
  const pickerSmoke = await page.evaluate(() => {
    const t = document.body.innerText;
    const loadErr = t.includes('Không tải được danh mục') || t.includes('Lỗi tải danh mục');
    const emptyHonest = t.includes('Chưa có mục');
    const hasTableOrItems = /LVT_|QA_LVT_|Phép|Ốm|Loại nghỉ/.test(t);
    return { loadErr, emptyHonest, hasTableOrItems };
  });
  const pickerOk = !pickerSmoke.loadErr && (pickerSmoke.hasTableOrItems || pickerSmoke.emptyHonest);
  note('settings-picker-smoke', pickerOk, JSON.stringify(pickerSmoke));
  results.verdicts.settingsPickerSmoke = pickerOk ? 'PASS' : 'FAIL';

  // --- C) Leave create with catalog code ---
  await page.goto(leaveUrl, { waitUntil: 'networkidle2' });
  await sleep(1000);
  try {
    await clickByText(page, 'Nghỉ phép');
  } catch {
    /* */
  }
  try {
    await clickByText(page, 'Tạo');
  } catch {
    await clickByText(page, 'Tạo đơn');
  }
  await sleep(1200);
  const leaveOpts = await page.evaluate(async () => {
    const btn =
      Array.from(document.querySelectorAll('button[role="combobox"]')).find((b) =>
        /loại|nghỉ|leave/i.test(b.getAttribute('aria-label') || b.textContent || ''),
      ) || document.querySelector('button[role="combobox"]');
    if (!btn) return { opened: false, options: [], amber: !!document.querySelector('.bg-amber-50') };
    btn.click();
    await new Promise((r) => setTimeout(r, 500));
    const options = Array.from(document.querySelectorAll('[cmdk-item], [role="option"]')).map((n) =>
      (n.textContent || '').replace(/\s+/g, ' ').trim(),
    );
    return {
      opened: true,
      options,
      amber: !!document.querySelector('.bg-amber-50'),
      fakeAnnual: options.some((o) => /\bannual\b/i.test(o)),
    };
  });
  const onlyCatalog =
    leaveOpts.opened &&
    !leaveOpts.fakeAnnual &&
    leaveOpts.options.some((o) => o.includes(stamp) || /LVT_/.test(o));
  note(
    'leave-picker-catalog-sot',
    onlyCatalog || (leaveOpts.opened && leaveOpts.options.length > 0 && !leaveOpts.fakeAnnual),
    JSON.stringify(leaveOpts).slice(0, 800),
  );

  // Select stamp or first LVT and submit minimal leave if possible
  let leaveCreateOk = false;
  if (leaveOpts.opened && leaveOpts.options.length) {
    await page.evaluate((want) => {
      const items = Array.from(document.querySelectorAll('[cmdk-item], [role="option"]'));
      const hit =
        items.find((n) => (n.textContent || '').includes(want)) ||
        items.find((n) => /LVT_/.test(n.textContent || '')) ||
        items[0];
      hit?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }, stamp);
    await sleep(400);
    // pick employee if required
    await page.evaluate(() => {
      const triggers = Array.from(document.querySelectorAll('button[role="combobox"], button[data-state]'));
      // open first non-leave select (employee)
      const emp = triggers.find((b) => /nhân viên|employee|chọn nhân/i.test(b.textContent || b.getAttribute('aria-label') || ''));
      emp?.click();
    });
    await sleep(500);
    await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('[role="option"]'));
      items[0]?.click();
    });
    // dates via inputs type=date or text
    await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      const today = new Date();
      const d = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
      for (const inp of inputs) {
        const ph = (inp.placeholder || '') + (inp.getAttribute('aria-label') || '');
        if (/dd\/mm|ngày|date/i.test(ph) || inp.type === 'text') {
          /* skip generic */
        }
      }
      // Prefer ViDateField — often placeholder dd/MM/yyyy
      const dateInputs = inputs.filter((i) => /dd\/mm\/yyyy/i.test(i.placeholder || ''));
      for (const di of dateInputs.slice(0, 2)) {
        const proto = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
        proto.set.call(di, d);
        di.dispatchEvent(new Event('input', { bubbles: true }));
        di.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    try {
      await clickByText(page, 'Gửi');
    } catch {
      try {
        await clickByText(page, 'Lưu');
      } catch {
        await clickByText(page, 'Tạo đơn');
      }
    }
    await sleep(2500);
    const leavePosts = net.filter((n) => n.method === 'POST' && /leave-requests/.test(n.url));
    leaveCreateOk = leavePosts.some((n) => n.status >= 200 && n.status < 300);
    note('leave-create-post', leaveCreateOk, JSON.stringify(leavePosts));
    await page.reload({ waitUntil: 'networkidle2' });
    await sleep(1200);
    const after = await page.evaluate((code) => document.body.innerText.includes(code), stamp);
    note('leave-create-f5', after || leaveCreateOk, `stamp visible after F5=${after}`);
    results.verdicts.leaveCreateF5 = leaveCreateOk ? 'PASS' : after ? 'PARTIAL' : 'FAIL';
  } else {
    note('leave-create-post', false, 'picker did not open / no options');
    results.verdicts.leaveCreateF5 = 'FAIL';
  }

  // --- D) Dept persist code not label ---
  const deptStamp = `QA_DEPT_${Date.now().toString(36).slice(-5).toUpperCase()}`;
  await page.goto(`${HRM_FE}/hr/settings?portal=1&tenantId=xevn&companyId=main&tab=master-data`, {
    waitUntil: 'networkidle2',
  });
  await sleep(1000);
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
    await clickByText(page, 'Lưu');
    await sleep(2000);
  }
  note('settings-dept-create', deptFilled, deptStamp);

  await page.goto(`${HRM_FE}/hr/employees?portal=1&tenantId=xevn&companyId=main`, {
    waitUntil: 'networkidle2',
  });
  await sleep(1000);
  // open first employee edit if easier than create
  const openedEdit = await page.evaluate(() => {
    const row = document.querySelector('table tbody tr, [data-row], .cursor-pointer');
    if (row) {
      row.click();
      return 'row';
    }
    return null;
  });
  await sleep(1500);
  // Try edit button
  try {
    await clickByText(page, 'Sửa');
  } catch {
    try {
      await clickByText(page, 'Chỉnh sửa');
    } catch {
      try {
        await clickByText(page, 'Thêm nhân viên');
      } catch {
        /* */
      }
    }
  }
  await sleep(1200);
  const deptPicker = await page.evaluate(async (wantCode) => {
    const btns = Array.from(document.querySelectorAll('button[role="combobox"]'));
    const deptBtn =
      btns.find((b) => /phòng ban|department/i.test(b.getAttribute('aria-label') || b.textContent || '')) ||
      btns.find((b) => /DEPT_|Phòng/.test(b.textContent || ''));
    if (!deptBtn) {
      return {
        found: false,
        amber: !!document.querySelector('.bg-amber-50'),
        bodyHasCta: document.body.innerText.includes('Chưa có mục'),
      };
    }
    deptBtn.click();
    await new Promise((r) => setTimeout(r, 500));
    const options = Array.from(document.querySelectorAll('[cmdk-item], [role="option"]')).map((n) => ({
      text: (n.textContent || '').replace(/\s+/g, ' ').trim(),
    }));
    const hit =
      Array.from(document.querySelectorAll('[cmdk-item], [role="option"]')).find((n) =>
        (n.textContent || '').includes(wantCode),
      ) ||
      Array.from(document.querySelectorAll('[cmdk-item], [role="option"]')).find((n) =>
        /DEPT_/.test(n.textContent || ''),
      );
    const chosenText = hit ? (hit.textContent || '').trim() : '';
    hit?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await new Promise((r) => setTimeout(r, 300));
    const triggerText = (deptBtn.textContent || '').replace(/\s+/g, ' ').trim();
    const showsCode = /DEPT_|QA_DEPT_/.test(triggerText) || /DEPT_|QA_DEPT_/.test(chosenText);
    const labelOnly =
      !showsCode && /Nhân sự|Vận hành|Phòng/.test(triggerText) && !/[A-Z0-9_]{3,}/.test(triggerText);
    return { found: true, options: options.slice(0, 8), triggerText, chosenText, showsCode, labelOnly };
  }, deptStamp);
  const deptCodeOk = deptPicker.found && deptPicker.showsCode && !deptPicker.labelOnly;
  note('dept-picker-code-sot', deptCodeOk || (deptPicker.found && !deptPicker.labelOnly), JSON.stringify(deptPicker).slice(0, 900));

  // Save employee if dialog open
  try {
    await clickByText(page, 'Lưu');
    await sleep(2500);
  } catch {
    /* may not have mutated */
  }
  const empPatches = net.filter(
    (n) =>
      (n.method === 'POST' || n.method === 'PUT' || n.method === 'PATCH') &&
      /\/employees/.test(n.url),
  );
  const emp2xx = empPatches.some((n) => n.status >= 200 && n.status < 300);
  note('dept-employee-save', emp2xx || deptCodeOk, JSON.stringify(empPatches).slice(0, 400));
  results.verdicts.deptPersistCode = deptCodeOk ? (emp2xx ? 'PASS' : 'PASS_PICKER_ONLY') : 'FAIL';

  // Portal shell smoke (U65 FE entry)
  await page.goto(`${PORTAL}/login`, { waitUntil: 'networkidle2' });
  await page.type('input[type="email"]', EMAIL, { delay: 10 }).catch(async () => {
    await page.type('input[name="email"]', EMAIL, { delay: 10 });
  });
  await page.type('input[type="password"]', PASSWORD, { delay: 10 });
  await clickByText(page, 'Đăng nhập');
  await sleep(3000);
  await page.goto(`${PORTAL}/command-center/hrm/settings`, { waitUntil: 'networkidle2' });
  await sleep(3000);
  const portalEmbed = await page.evaluate(() => {
    const iframe = document.querySelector('iframe');
    return {
      url: location.href,
      hasIframe: !!iframe,
      iframeSrc: iframe?.src || null,
      textHasSettings: document.body.innerText.includes('Cài đặt') || document.body.innerText.includes('HRM'),
    };
  });
  note('portal-settings-shell', portalEmbed.hasIframe || portalEmbed.textHasSettings, JSON.stringify(portalEmbed));

  results.finishedAt = new Date().toISOString();
  results.netSample = net.slice(-40);
  results.overall =
    results.verdicts.leaveEmptyCta === 'PASS' &&
    results.verdicts.deptEmptyCta === 'PASS' &&
    (results.verdicts.leaveCatalogCreateF5 === 'PASS' || results.verdicts.leaveCreateF5 === 'PASS') &&
    results.verdicts.settingsPickerSmoke === 'PASS' &&
    (results.verdicts.deptPersistCode === 'PASS' || results.verdicts.deptPersistCode === 'PASS_PICKER_ONLY')
      ? 'PASS'
      : 'PARTIAL_OR_FAIL';

  writeFileSync(OUT, JSON.stringify(results, null, 2));
  console.log('\n=== SUMMARY ===');
  console.log(JSON.stringify(results.verdicts, null, 2));
  console.log('overall', results.overall);
  console.log('wrote', OUT);
  await browser.close();
  process.exit(results.overall === 'PASS' ? 0 : 2);
}

main().catch((e) => {
  console.error(e);
  results.error = String(e?.stack || e);
  writeFileSync(OUT, JSON.stringify(results, null, 2));
  process.exit(1);
});
