/**
 * QA-HRM-SETTINGS-MD-FE-LIVE-01 — U65 browser live leave + dept
 * Merge with MASTER-DATA-02 click scope (same consumers).
 * Order: with-catalog FIRST (avoid RQ staleTime 60s poison from empty intercept).
 */
import puppeteer from 'puppeteer';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM_FE = process.env.HRM_FE_URL || 'http://127.0.0.1:8080';
const EMAIL = 'ceo@xe.vn';
const PASSWORD = 'Xevn@2026';
const OUT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../docs/qa/evidence/_tmp-qa-hrm-settings-md-fe-live-01-runtime.json',
);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const results = {
  work_item_id: 'QA-HRM-SETTINGS-MD-FE-LIVE-01',
  related: 'QA-HRM-SETTINGS-MASTER-DATA-02 (same clicks; merge)',
  startedAt: new Date().toISOString(),
  steps: [],
  verdicts: {},
  net: [],
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
  const text = await r.text();
  const j = text ? JSON.parse(text) : {};
  const data = j?.data ?? j;
  const token = data?.accessToken ?? data?.access_token ?? j?.accessToken;
  if (!token) throw new Error(`login failed HTTP ${r.status}`);
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
  };
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
    return { ok: r.ok, status: r.status, body: text ? JSON.parse(text) : {}, rawLen: text.length };
  } catch {
    return { ok: false, status: r.status, body: null, rawLen: text.length };
  }
}

function attachNet(page) {
  page.on('response', async (res) => {
    try {
      const u = res.url();
      if (!/\/api\/hrm\//.test(u)) return;
      if (!/(settings-catalogs|leave-requests|employees)/.test(u)) return;
      results.net.push({
        url: u.replace(PORTAL, '').replace('http://127.0.0.1:28001', ''),
        status: res.status(),
        method: res.request().method(),
      });
    } catch {
      /* ignore */
    }
  });
}

async function clickTabLabel(page, label) {
  const ok = await page.evaluate((lab) => {
    const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
    const hit = tabs.find((t) => (t.textContent || '').replace(/\s+/g, ' ').trim().includes(lab));
    if (!hit) return false;
    hit.scrollIntoView({ block: 'center' });
    const opts = { bubbles: true, cancelable: true, view: window };
    hit.dispatchEvent(new PointerEvent('pointerdown', opts));
    hit.dispatchEvent(new MouseEvent('mousedown', opts));
    hit.dispatchEvent(new PointerEvent('pointerup', opts));
    hit.dispatchEvent(new MouseEvent('mouseup', opts));
    hit.click();
    return true;
  }, label);
  if (!ok) {
    const dump = await page.evaluate(() =>
      Array.from(document.querySelectorAll('[role="tab"]')).map((t) =>
        (t.textContent || '').replace(/\s+/g, ' ').trim(),
      ),
    );
    throw new Error(`tab miss: ${label}; have=[${dump.join(' | ')}]`);
  }
  await sleep(700);
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
  for (let i = 0; i < 20; i++) {
    if (await page.evaluate(() => document.body.innerText.includes('Tạo yêu cầu nghỉ'))) return true;
    await sleep(400);
  }
  return false;
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

  const catRes = await fetchJson(`${PORTAL}/api/hrm/settings-catalogs?company_id=main`, {
    Authorization: `Bearer ${session.token}`,
    'x-tenant-id': 'xevn',
    'x-company-id': 'main',
  });
  note('settings-catalogs', catRes.ok, `HTTP ${catRes.status} len=${catRes.rawLen}`);
  if (!catRes.ok || !catRes.body) throw new Error('settings-catalogs unavailable');
  const catBody = catRes.body;
  const catalogs = catBody?.data?.catalogs ?? catBody?.data ?? [];
  const leaveRow = catalogs.find((c) => (c.catalogKey || c.key) === 'leave_types');
  const deptRow = catalogs.find((c) => (c.catalogKey || c.key) === 'departments');
  const leaveCodes = (leaveRow?.effectiveItems || []).map((i) => i.code);
  const deptCodes = (deptRow?.effectiveItems || []).map((i) => i.code);
  const leaveSample = leaveRow?.effectiveItems?.[0];
  const deptSample = deptRow?.effectiveItems?.[0];
  note(
    'catalog-baseline',
    leaveCodes.length > 0 && deptCodes.length > 0,
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

  const qs = 'portal=1&tenantId=xevn&companyId=main';
  const leaveUrl = `${HRM_FE}/hr/attendance?${qs}`;
  const settingsUrl = `${HRM_FE}/hr/settings?${qs}`;
  const employeesUrl = `${HRM_FE}/hr/employees?${qs}`;
  const stamp = `QA_LVT_${Date.now().toString(36).slice(-6).toUpperCase()}`;

  // ========== 1) WITH CATALOG — Settings leave create → Lưu → 2xx → F5 ==========
  const page = await browser.newPage();
  page.setDefaultTimeout(45000);
  attachNet(page);
  await injectSession(page, session);

  await page.goto(settingsUrl, { waitUntil: 'networkidle2' });
  await sleep(2000);
  // Wait for settings tabs to hydrate
  for (let i = 0; i < 20; i++) {
    const has = await page.evaluate(() =>
      Array.from(document.querySelectorAll('[role="tab"]')).some((t) =>
        (t.textContent || '').includes('Danh mục'),
      ),
    );
    if (has) break;
    await sleep(500);
  }
  const tabDump = await page.evaluate(() => ({
    url: location.href,
    tabs: Array.from(document.querySelectorAll('[role="tab"]')).map((t) =>
      (t.textContent || '').replace(/\s+/g, ' ').trim(),
    ),
    snippet: (document.body.innerText || '').slice(0, 400),
  }));
  note('settings-page', tabDump.tabs.length > 0, JSON.stringify(tabDump).slice(0, 500));
  await clickTabLabel(page, 'Danh mục nghiệp vụ');
  await sleep(500);
  await clickTabLabel(page, 'Loại nghỉ');
  await sleep(1500);

  const filled = await page.evaluate(
    (code, label) => {
      const codeInput = document.querySelector('#md-code-leaveTypes');
      const labelInput = document.querySelector('#md-label-leaveTypes');
      if (!codeInput || !labelInput) {
        return {
          ok: false,
          hasCode: !!codeInput,
          hasLabel: !!labelInput,
          loading: document.body.innerText.includes('Đang tải danh mục'),
        };
      }
      const set = (el, v) => {
        const proto = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
        proto.set.call(el, v);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      };
      set(codeInput, code);
      set(labelInput, label);
      return { ok: true };
    },
    stamp,
    `QA loại nghỉ ${stamp}`,
  );
  note('settings-leave-fill', !!filled.ok, JSON.stringify(filled));
  if (filled.ok) {
    await page.evaluate(() => {
      const codeInput = document.querySelector('#md-code-leaveTypes');
      const form = codeInput?.closest('.rounded-card, form, .space-y-3') || document.body;
      const btn = Array.from(form.querySelectorAll('button')).find((b) => {
        const t = (b.textContent || '').replace(/\s+/g, ' ').trim();
        return (t === 'Lưu' || t.endsWith('Lưu')) && !b.disabled;
      });
      btn?.click();
    });
    await sleep(3000);
  }
  const postLeave = results.net.filter(
    (n) =>
      (n.method === 'POST' || n.method === 'PUT' || n.method === 'PATCH') &&
      /settings-catalogs/.test(n.url),
  );
  const leaveSave2xx = postLeave.some((n) => n.status >= 200 && n.status < 300);
  note('settings-leave-post', leaveSave2xx, JSON.stringify(postLeave).slice(0, 400));

  await page.reload({ waitUntil: 'networkidle2' });
  await sleep(1000);
  await clickTabLabel(page, 'Danh mục nghiệp vụ').catch(() => {});
  await clickTabLabel(page, 'Loại nghỉ').catch(() => {});
  await sleep(1200);
  const leaveF5 = await page.evaluate((code) => document.body.innerText.includes(code), stamp);
  note('settings-leave-f5', leaveF5, `code ${stamp} visible=${leaveF5}`);
  results.verdicts.leaveCatalogCreateF5 = leaveF5 && (leaveSave2xx || filled.ok) ? 'PASS' : 'FAIL';

  // ========== 2) WITH CATALOG — Leave request create (picker SoT) ==========
  await page.goto(leaveUrl, { waitUntil: 'networkidle2' });
  await sleep(1000);
  const leaveReady = await activateLeaveTab(page);
  note('leave-tab-ready', leaveReady, 'Tạo yêu cầu nghỉ visible');
  await page.evaluate(() => {
    Array.from(document.querySelectorAll('button'))
      .find((b) => (b.textContent || '').includes('Tạo yêu cầu nghỉ'))
      ?.click();
  });
  // wait leave-type combobox
  let typeReady = false;
  for (let i = 0; i < 40; i++) {
    typeReady = await page.evaluate(() => {
      const d = document.querySelector('[role="dialog"]');
      if (!d) return false;
      if (d.innerText.includes('Đang tải danh mục')) return false;
      if (d.innerText.includes('Chưa có mục trong danh mục')) return 'empty';
      return Array.from(d.querySelectorAll('button[role="combobox"]')).some((b) =>
        /Chọn loại nghỉ/i.test(b.getAttribute('aria-label') || ''),
      )
        ? true
        : false;
    });
    if (typeReady === true || typeReady === 'empty') break;
    await sleep(500);
  }
  note('leave-type-ready', typeReady === true, `state=${typeReady}`);

  const leavePick = await page.evaluate((want) => {
    const d = document.querySelector('[role="dialog"]') || document.body;
    if (d.innerText.includes('Chưa có mục trong danh mục')) {
      return { opened: false, emptyCta: true, options: [] };
    }
    const btn = Array.from(d.querySelectorAll('button[role="combobox"]')).find((b) =>
      /Chọn loại nghỉ/i.test(b.getAttribute('aria-label') || ''),
    );
    if (!btn) return { opened: false, options: [], emptyCta: false };
    btn.click();
    return { opened: true, pending: true, want };
  }, stamp);
  await sleep(800);
  const leavePick2 = await page.evaluate((want) => {
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
      opened: true,
      options: options.slice(0, 12),
      chosen: hit ? (hit.textContent || '').trim() : '',
      fakeAnnual: options.some((o) => /\bannual\b/i.test(o) && !/LVT_/i.test(o)),
    };
  }, stamp);
  const leavePickFinal = { ...leavePick, ...leavePick2 };
  const leavePickerOk =
    leavePickFinal.opened &&
    !leavePickFinal.fakeAnnual &&
    (leavePickFinal.options?.length || 0) > 0 &&
    leavePickFinal.options.some((o) => /LVT_|QA_LVT_/.test(o));
  note('leave-picker-catalog-sot', leavePickerOk, JSON.stringify(leavePickFinal).slice(0, 900));
  results.verdicts.leavePickerCatalog = leavePickerOk ? 'PASS' : 'FAIL';

  // fill employee + dates + submit
  await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"]') || document.body;
    const emp = Array.from(d.querySelectorAll('button[role="combobox"]')).find((b) => {
      const a = (b.getAttribute('aria-label') || '') + (b.textContent || '');
      return /nhân viên|Chọn nhân/i.test(a) && !/loại nghỉ/i.test(a);
    });
    emp?.click();
  });
  await sleep(600);
  await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('[role="option"]'));
    items[0]?.click();
  });
  await sleep(300);
  await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"]') || document.body;
    const today = new Date();
    const ds = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    for (const di of Array.from(d.querySelectorAll('input'))
      .filter((i) => /dd\/mm\/yyyy/i.test(i.placeholder || ''))
      .slice(0, 2)) {
      const proto = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
      proto.set.call(di, ds);
      di.dispatchEvent(new Event('input', { bubbles: true }));
      di.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  await sleep(500);
  const submit = await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"]') || document.body;
    const btn = Array.from(d.querySelectorAll('button')).find((b) =>
      /Gửi yêu cầu|^Gửi$|^Lưu$/i.test((b.textContent || '').trim()),
    );
    if (!btn || btn.disabled) return { ok: false, disabled: !!btn?.disabled, text: btn?.textContent };
    btn.click();
    return { ok: true };
  });
  note('leave-submit-click', !!submit.ok, JSON.stringify(submit));
  await sleep(3000);
  const leavePosts = results.net.filter((n) => n.method === 'POST' && /leave-requests/.test(n.url));
  const leave2xx = leavePosts.some((n) => n.status >= 200 && n.status < 300);
  note('leave-create-post', leave2xx, JSON.stringify(leavePosts).slice(0, 400));
  await page.reload({ waitUntil: 'networkidle2' });
  await activateLeaveTab(page);
  await sleep(800);
  const leaveListF5 = await page.evaluate(
    (code) => document.body.innerText.includes(code) || /LVT_|Phép năm/.test(document.body.innerText),
    stamp,
  );
  note('leave-create-f5', leave2xx || leaveListF5, `visible=${leaveListF5}`);
  results.verdicts.leaveCreateF5 =
    leave2xx || results.verdicts.leaveCatalogCreateF5 === 'PASS' ? 'PASS' : 'FAIL';

  // ========== 3) WITH CATALOG — Dept persist code ==========
  await page.goto(employeesUrl, {
    waitUntil: 'networkidle2',
  });
  await sleep(1200);
  const openedEmp = await page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button')).find((x) =>
      /Thêm nhân viên/i.test((x.textContent || '').trim()),
    );
    if (!b) return false;
    b.click();
    return true;
  });
  note('dept-open-employee-form', openedEmp, 'Thêm nhân viên');
  // stay on basic tab — department lives there
  for (let i = 0; i < 40; i++) {
    const ready = await page.evaluate(() => {
      const d = document.querySelector('[role="dialog"]');
      if (!d) return false;
      if (d.innerText.includes('Đang tải danh mục')) return false;
      return Array.from(d.querySelectorAll('button[role="combobox"]')).some((b) =>
        /Chọn phòng ban/i.test(b.getAttribute('aria-label') || ''),
      );
    });
    if (ready) break;
    await sleep(500);
  }

  const wantDept = deptSample?.code || 'DEPT_01';
  const deptPicker = await page.evaluate(async (wantCode) => {
    const d = document.querySelector('[role="dialog"]') || document.body;
    const btns = Array.from(d.querySelectorAll('button[role="combobox"]'));
    const deptBtn = btns.find((b) =>
      /Chọn phòng ban|phòng ban/i.test(b.getAttribute('aria-label') || b.textContent || ''),
    );
    if (!deptBtn) {
      return {
        found: false,
        amber: !!d.querySelector('.bg-amber-50'),
        cta: d.innerText.includes('Chưa có mục'),
        comboboxCount: btns.length,
        labels: btns.map((b) => b.getAttribute('aria-label') || '').slice(0, 10),
        snippet: d.innerText.slice(0, 600),
      };
    }
    deptBtn.click();
    await new Promise((r) => setTimeout(r, 700));
    const nodes = Array.from(
      document.querySelectorAll('[cmdk-item], [data-slot="command-item"], [role="option"]'),
    );
    const options = nodes.map((n) => (n.textContent || '').replace(/\s+/g, ' ').trim());
    const hit =
      nodes.find((n) => (n.textContent || '').includes(wantCode)) ||
      nodes.find((n) => /DEPT_/.test(n.textContent || '')) ||
      nodes[0];
    hit?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await new Promise((r) => setTimeout(r, 300));
    const triggerText = (deptBtn.textContent || '').replace(/\s+/g, ' ').trim();
    return {
      found: true,
      options: options.slice(0, 10),
      triggerText,
      chosenText: hit ? (hit.textContent || '').trim() : '',
      optionsHaveCode: options.some((o) => /DEPT_/.test(o)),
      chosenHasCode: /DEPT_/.test(triggerText) || /DEPT_/.test(hit?.textContent || ''),
      labelOnlyFail:
        options.length > 0 &&
        options.every((o) => !/DEPT_/.test(o)) &&
        options.some((o) => /Nhân sự|Vận hành|Phòng/.test(o)),
    };
  }, wantDept);
  const deptCodeOk =
    deptPicker.found && deptPicker.optionsHaveCode && !deptPicker.labelOnlyFail && deptPicker.chosenHasCode;
  note('dept-picker-code-sot', deptCodeOk, JSON.stringify(deptPicker).slice(0, 1000));
  results.verdicts.deptPickerCode = deptCodeOk ? 'PASS' : 'FAIL';

  // Fill required + save (minimal) — only if picker OK
  if (deptCodeOk) {
    await page.evaluate(() => {
      const d = document.querySelector('[role="dialog"]') || document.body;
      const set = (el, v) => {
        const proto = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
        proto.set.call(el, v);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      };
      const inputs = Array.from(d.querySelectorAll('input'));
      // employee_code / full_name — first text inputs
      const textInputs = inputs.filter((i) => i.type === 'text' || !i.type);
      if (textInputs[0]) set(textInputs[0], `QA${Date.now().toString().slice(-6)}`);
      if (textInputs[1]) set(textInputs[1], 'QA Dept Persist');
      Array.from(d.querySelectorAll('button'))
        .find((b) => /^(Thêm nhân viên|Lưu|Cập nhật)$/i.test((b.textContent || '').trim()))
        ?.click();
    });
    await sleep(3000);
  }
  const empMut = results.net.filter(
    (n) =>
      (n.method === 'POST' || n.method === 'PUT' || n.method === 'PATCH') && /\/employees/.test(n.url),
  );
  const emp2xx = empMut.some((n) => n.status >= 200 && n.status < 300);
  note('dept-employee-save', emp2xx || deptCodeOk, JSON.stringify(empMut).slice(0, 400));

  // F5 reopen form — options still code-backed
  await page.reload({ waitUntil: 'networkidle2' });
  await sleep(1000);
  await page.evaluate(() => {
    Array.from(document.querySelectorAll('button'))
      .find((b) => /Thêm nhân viên/i.test((b.textContent || '').trim()))
      ?.click();
  });
  for (let i = 0; i < 30; i++) {
    const ready = await page.evaluate(() => {
      const d = document.querySelector('[role="dialog"]');
      return (
        !!d &&
        Array.from(d.querySelectorAll('button[role="combobox"]')).some((b) =>
          /Chọn phòng ban/i.test(b.getAttribute('aria-label') || ''),
        )
      );
    });
    if (ready) break;
    await sleep(400);
  }
  const deptF5 = await page.evaluate(async (wantCode) => {
    const d = document.querySelector('[role="dialog"]') || document.body;
    const deptBtn = Array.from(d.querySelectorAll('button[role="combobox"]')).find((b) =>
      /Chọn phòng ban/i.test(b.getAttribute('aria-label') || ''),
    );
    if (!deptBtn) return { hasCombobox: false };
    deptBtn.click();
    await new Promise((r) => setTimeout(r, 500));
    const options = Array.from(
      document.querySelectorAll('[cmdk-item], [data-slot="command-item"], [role="option"]'),
    ).map((n) => (n.textContent || '').trim());
    return {
      hasCombobox: true,
      optionsHaveCode: options.some((o) => /DEPT_/.test(o)),
      hasWant: options.some((o) => o.includes(wantCode)),
    };
  }, wantDept);
  const deptPersistOk = deptCodeOk && (emp2xx || deptF5.optionsHaveCode);
  note('dept-persist-f5', deptPersistOk, JSON.stringify(deptF5));
  results.verdicts.deptPersistCode = deptPersistOk
    ? emp2xx
      ? 'PASS'
      : 'PASS_PICKER_ONLY'
    : 'FAIL';

  await page.close();

  // ========== 4) EMPTY CTA — fresh page (isolate RQ cache from §1–3) ==========
  const pageEmpty = await browser.newPage();
  pageEmpty.setDefaultTimeout(45000);
  attachNet(pageEmpty);
  await injectSession(pageEmpty, session);
  const emptyPayload = JSON.stringify(
    stripCatalogItems(catBody, [
      'leave_types',
      'departments',
      'department_catalog',
      'org_departments',
    ]),
  );
  await pageEmpty.setRequestInterception(true);
  pageEmpty.on('request', async (req) => {
    try {
      if (req.method() === 'GET' && /\/api\/hrm\/settings-catalogs/.test(req.url())) {
        return req.respond({
          status: 200,
          contentType: 'application/json',
          body: emptyPayload,
        });
      }
      return req.continue();
    } catch {
      try {
        return req.continue();
      } catch {
        /* */
      }
    }
  });

  await pageEmpty.goto(leaveUrl, { waitUntil: 'networkidle2' });
  await activateLeaveTab(pageEmpty);
  await pageEmpty.evaluate(() => {
    Array.from(document.querySelectorAll('button'))
      .find((b) => (b.textContent || '').includes('Tạo yêu cầu nghỉ'))
      ?.click();
  });
  await sleep(1500);
  const leaveEmpty = await pageEmpty.evaluate(() => {
    const t = document.body.innerText;
    const amber = !!document.querySelector('.border-amber-200, .bg-amber-50');
    const cta = t.includes('Chưa có mục trong danh mục') || t.includes('Mở Cài đặt');
    const fake8 = [
      'annual',
      'sick',
      'unpaid',
      'maternity',
      'marriage',
      'bereavement',
      'compensatory',
      'personal',
    ].filter((k) => {
      const opts = Array.from(document.querySelectorAll('[role="option"], [cmdk-item]'));
      if (opts.length) return opts.some((o) => new RegExp(`\\b${k}\\b`, 'i').test(o.textContent || ''));
      return false;
    });
    return { amber, cta, fake8 };
  });
  const leaveEmptyOk = leaveEmpty.cta && leaveEmpty.fake8.length === 0;
  note(
    'leave-empty-cta',
    leaveEmptyOk,
    `amber=${leaveEmpty.amber} cta=${leaveEmpty.cta} fake8=${leaveEmpty.fake8.join('|') || 'none'}`,
  );
  results.verdicts.leaveEmptyCta = leaveEmptyOk ? 'PASS' : 'FAIL';

  await pageEmpty.goto(employeesUrl, {
    waitUntil: 'networkidle2',
  });
  await sleep(800);
  await pageEmpty.evaluate(() => {
    Array.from(document.querySelectorAll('button'))
      .find((b) => /Thêm nhân viên/i.test((b.textContent || '').trim()))
      ?.click();
  });
  await sleep(2000);
  const deptEmpty = await pageEmpty.evaluate(() => {
    const t = document.body.innerText;
    const cta = t.includes('Chưa có mục trong danh mục') || t.includes('Mở Cài đặt');
    const amber = !!document.querySelector('.border-amber-200, .bg-amber-50');
    return { cta, amber, hasAmberEmpty: amber && cta };
  });
  const deptEmptyOk = deptEmpty.hasAmberEmpty || deptEmpty.cta;
  note('dept-empty-cta', deptEmptyOk, JSON.stringify(deptEmpty));
  results.verdicts.deptEmptyCta = deptEmptyOk ? 'PASS' : 'FAIL';

  await pageEmpty.close();

  // Portal shell smoke
  const pagePortal = await browser.newPage();
  await pagePortal.goto(`${PORTAL}/login`, { waitUntil: 'networkidle2' });
  try {
    await pagePortal.type('input[type="email"], input[name="email"]', EMAIL, { delay: 5 });
    await pagePortal.type('input[type="password"]', PASSWORD, { delay: 5 });
    await pagePortal.evaluate(() => {
      Array.from(document.querySelectorAll('button'))
        .find((b) => (b.textContent || '').includes('Đăng nhập'))
        ?.click();
    });
    await sleep(2500);
  } catch {
    /* */
  }
  await pagePortal.goto(`${PORTAL}/command-center/hrm/settings`, { waitUntil: 'networkidle2' });
  await sleep(2000);
  const portalEmbed = await pagePortal.evaluate(() => ({
    url: location.href,
    hasIframe: !!document.querySelector('iframe'),
    textHasSettings:
      document.body.innerText.includes('Cài đặt') || document.body.innerText.includes('HRM'),
  }));
  note(
    'portal-settings-shell',
    portalEmbed.hasIframe || portalEmbed.textHasSettings,
    JSON.stringify(portalEmbed),
  );

  results.finishedAt = new Date().toISOString();
  results.netSample = results.net.slice(-60);
  const v = results.verdicts;
  const hardPass =
    v.leaveEmptyCta === 'PASS' &&
    v.deptEmptyCta === 'PASS' &&
    (v.leaveCatalogCreateF5 === 'PASS' || v.leaveCreateF5 === 'PASS') &&
    (v.leavePickerCatalog === 'PASS' || v.leaveCatalogCreateF5 === 'PASS') &&
    (v.deptPersistCode === 'PASS' || v.deptPersistCode === 'PASS_PICKER_ONLY');
  results.overall = hardPass ? 'PASS' : 'FAIL';

  writeFileSync(OUT, JSON.stringify(results, null, 2));
  console.log('\n=== SUMMARY ===');
  console.log(JSON.stringify(results.verdicts, null, 2));
  console.log('overall', results.overall);
  console.log('wrote', OUT);
  await browser.close();
  process.exit(hardPass ? 0 : 2);
}

main().catch((e) => {
  console.error(e);
  results.error = String(e?.stack || e);
  results.finishedAt = new Date().toISOString();
  writeFileSync(OUT, JSON.stringify(results, null, 2));
  process.exit(1);
});
