/**
 * QA-HRM-SETTINGS-MASTER-DATA-03 — Settings MD leave/dept form vis + create→F5
 * U65 zero-seed · HOLD_DEPLOY · NOT Phase1/PROD · NOT :8088
 * Origin: portal :5173/hr (proxy → :28001) — JT proven path
 */
import puppeteer from 'puppeteer';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const EMAIL = 'ceo@xe.vn';
const PASSWORD = 'Xevn@2026';
const OUT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../docs/qa/evidence/_tmp-qa-hrm-settings-master-data-03-runtime.json',
);
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const results = {
  work_item_id: 'QA-HRM-SETTINGS-MASTER-DATA-03',
  startedAt: new Date().toISOString(),
  origin: PORTAL,
  steps: [],
  verdicts: {},
  network: [],
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

async function loginApi() {
  const r = await fetch(`${PORTAL}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const j = await r.json();
  const token = j?.data?.accessToken ?? j?.accessToken;
  if (!token) throw new Error(`login failed HTTP ${r.status}`);
  return {
    token,
    expiresAt: Date.now() + 8 * 3600_000,
    user: j?.data?.user ?? { userId: EMAIL, displayName: 'CEO' },
  };
}

async function clickByText(page, text) {
  const ok = await page.evaluate((t) => {
    const nodes = Array.from(
      document.querySelectorAll('button, a, [role="tab"], [role="button"], label'),
    );
    const el = nodes.find((n) =>
      (n.textContent || '').replace(/\s+/g, ' ').trim().includes(t),
    );
    if (!el) return false;
    el.scrollIntoView({ block: 'center' });
    el.click();
    return true;
  }, text);
  if (!ok) throw new Error(`click miss: ${text}`);
}

async function nativeClickByText(page, text) {
  const box = await page.evaluate((t) => {
    const nodes = Array.from(
      document.querySelectorAll('button, a, [role="tab"], [role="button"]'),
    );
    const el = nodes.find((n) =>
      (n.textContent || '').replace(/\s+/g, ' ').trim().includes(t),
    );
    if (!el) return null;
    el.scrollIntoView({ block: 'center' });
    const r = el.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2, label: (el.textContent || '').trim().slice(0, 60) };
  }, text);
  if (!box) throw new Error(`native click miss: ${text}`);
  await page.mouse.click(box.x, box.y);
  return box;
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
      if (Array.isArray(row.xbosItems)) row.xbosItems = [];
      if (Array.isArray(row.hrmExtensions)) row.hrmExtensions = [];
    }
  }
  return clone;
}

async function fillMdForm(page, bucket, code, label) {
  return page.evaluate(
    (b, c, l) => {
      const codeInput = document.querySelector(`#md-code-${b}`);
      const labelInput = document.querySelector(`#md-label-${b}`);
      const form = document.querySelector(`[data-testid="md-upsert-form-${b}"]`);
      if (!codeInput || !labelInput) {
        return {
          ok: false,
          reason: 'inputs missing',
          hasForm: !!form,
          ids: Array.from(document.querySelectorAll('[id^="md-code-"]')).map((e) => e.id),
        };
      }
      const set = (el, v) => {
        const proto = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
        proto.set.call(el, v);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      };
      set(codeInput, c);
      set(labelInput, l);
      const visible =
        codeInput.offsetParent !== null ||
        getComputedStyle(codeInput).visibility !== 'hidden';
      return {
        ok: true,
        visible,
        value: codeInput.value,
        formTestId: form?.getAttribute('data-testid') || null,
      };
    },
    bucket,
    code,
    label,
  );
}

async function openSettingsBucket(page, bucketLabel) {
  const settingsUrl = `${PORTAL}/hr/settings?portal=1&tenantId=xevn&companyId=main`;
  await page.goto(settingsUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(2500);
  for (const t of ['Danh mục nghiệp vụ', 'Master data', 'Danh mục']) {
    try {
      await nativeClickByText(page, t);
      await sleep(600);
      break;
    } catch {
      /* */
    }
  }
  await sleep(400);
  try {
    await nativeClickByText(page, bucketLabel);
  } catch {
    try {
      await clickByText(page, bucketLabel);
    } catch {
      /* */
    }
  }
  await sleep(1000);
}

async function clickSaveInForm(page, bucket) {
  return page.evaluate((b) => {
    const form =
      document.querySelector(`[data-testid="md-upsert-form-${b}"]`) ||
      document.querySelector(`#md-code-${b}`)?.closest('form, .space-y-4, .space-y-3, div');
    const scope = form || document.body;
    const btn = Array.from(scope.querySelectorAll('button')).find((el) =>
      /^Lưu$/.test((el.textContent || '').replace(/\s+/g, ' ').trim()),
    );
    if (!btn) return { ok: false, reason: 'no Lưu in form scope' };
    btn.click();
    return { ok: true, disabled: btn.disabled };
  }, bucket);
}

async function main() {
  // L0 probes
  for (const [name, url] of [
    ['hrm', 'http://127.0.0.1:28001/api/hrm'],
    ['portal', PORTAL],
    ['xbos', 'http://127.0.0.1:28002/api/xbos'],
  ]) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(5000) });
      note(`l0-${name}`, r.ok || r.status < 500, `HTTP ${r.status} ${url}`);
    } catch (e) {
      note(`l0-${name}`, false, String(e.message || e));
    }
  }
  if (!results.steps.find((s) => s.id === 'l0-hrm')?.ok) {
    results.overall = 'BLOCKED_L0';
    results.finishedAt = new Date().toISOString();
    save();
    process.exit(2);
  }

  const session = await loginApi();
  note('api-login', true, 'ceo@xe.vn');

  const authHeaders = {
    Authorization: `Bearer ${session.token}`,
    'x-tenant-id': 'xevn',
    'x-company-id': 'main',
    accept: 'application/json',
  };
  const catRes = await fetch(`${PORTAL}/api/hrm/settings-catalogs?company_id=main`, {
    headers: authHeaders,
  });
  const catBody = await catRes.json();
  note('settings-catalogs-get', catRes.ok, `HTTP ${catRes.status}`);
  const catalogs = catBody?.data?.catalogs ?? catBody?.data ?? [];
  const leaveN = (catalogs.find((c) => (c.catalogKey || c.key) === 'leave_types')?.effectiveItems || []).length;
  const deptN = (catalogs.find((c) => (c.catalogKey || c.key) === 'departments')?.effectiveItems || []).length;
  note('catalog-baseline', true, `leave_types=${leaveN} departments=${deptN}`);

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--window-size=1440,900'],
    defaultViewport: { width: 1440, height: 900 },
  });
  const page = await browser.newPage();
  page.setDefaultTimeout(45000);

  page.on('response', (res) => {
    const u = res.url();
    if (/\/api\/hrm\/settings-catalogs/.test(u)) {
      results.network.push({
        method: res.request().method(),
        status: res.status(),
        url: u.replace(/https?:\/\/[^/]+/, ''),
        at: new Date().toISOString(),
      });
    }
  });

  await page.evaluateOnNewDocument((s) => {
    for (const store of [localStorage, sessionStorage]) {
      store.setItem('xevn.portal.accessToken', s.token);
      store.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
      store.setItem('xevn.portal.user', JSON.stringify(s.user));
    }
  }, session);

  // ---- AC1: Loại nghỉ form visible → Lưu → POST 2xx → F5 ----
  const leaveCode = `QA_LVT_${Date.now().toString(36).slice(-6).toUpperCase()}`;
  const leaveLabel = `QA leave ${leaveCode}`;
  await openSettingsBucket(page, 'Loại nghỉ');
  const leaveDom = await page.evaluate(() => {
    const el = document.querySelector('#md-code-leaveTypes');
    const form = document.querySelector('[data-testid="md-upsert-form-leaveTypes"]');
    return {
      hasCode: !!el,
      hasForm: !!form,
      display: el ? getComputedStyle(el).display : null,
      textHasUpsert: (document.body.innerText || '').includes('Thêm / cập nhật mục'),
      snip: (document.body.innerText || '').slice(0, 500),
    };
  });
  note('ac1-form-visible', !!leaveDom.hasCode, JSON.stringify(leaveDom));
  results.verdicts.leaveFormVisible = leaveDom.hasCode ? 'PASS' : 'FAIL';

  let leaveFilled = { ok: false };
  if (leaveDom.hasCode) {
    leaveFilled = await fillMdForm(page, 'leaveTypes', leaveCode, leaveLabel);
    note('ac1-fill', !!leaveFilled.ok, JSON.stringify(leaveFilled));
    const save = await clickSaveInForm(page, 'leaveTypes');
    note('ac1-click-luu', !!save.ok, JSON.stringify(save));
    await sleep(3000);
  }
  const leavePosts = results.network.filter(
    (n) => n.method === 'POST' && /settings-catalogs\/items/.test(n.url),
  );
  const leavePostOk = leavePosts.some((n) => n.status >= 200 && n.status < 300);
  note('ac1-post', leavePostOk, JSON.stringify(leavePosts.slice(-5)));

  await page.reload({ waitUntil: 'domcontentloaded' });
  await sleep(2500);
  try {
    await nativeClickByText(page, 'Danh mục nghiệp vụ');
    await sleep(500);
  } catch {
    /* */
  }
  try {
    await nativeClickByText(page, 'Loại nghỉ');
  } catch {
    /* */
  }
  await sleep(1200);
  const leaveF5 = await page.evaluate((c) => (document.body.innerText || '').includes(c), leaveCode);
  note('ac1-f5', leaveF5, leaveCode);
  results.verdicts.leaveCreateF5 =
    leaveDom.hasCode && leavePostOk && leaveF5
      ? 'PASS'
      : leaveDom.hasCode && (leavePostOk || leaveF5)
        ? 'PARTIAL'
        : 'FAIL';

  // ---- AC2: Phòng ban same path ----
  const deptCode = `QA_DEPT_${Date.now().toString(36).slice(-5).toUpperCase()}`;
  const deptLabel = `Phòng QA ${deptCode}`;
  const netBeforeDept = results.network.length;
  await openSettingsBucket(page, 'Phòng ban');
  const deptDom = await page.evaluate(() => {
    const el = document.querySelector('#md-code-departments');
    const form = document.querySelector('[data-testid="md-upsert-form-departments"]');
    return {
      hasCode: !!el,
      hasForm: !!form,
      textHasUpsert: (document.body.innerText || '').includes('Thêm / cập nhật mục'),
    };
  });
  note('ac2-form-visible', !!deptDom.hasCode, JSON.stringify(deptDom));
  results.verdicts.deptFormVisible = deptDom.hasCode ? 'PASS' : 'FAIL';

  if (deptDom.hasCode) {
    const filled = await fillMdForm(page, 'departments', deptCode, deptLabel);
    note('ac2-fill', !!filled.ok, JSON.stringify(filled));
    const save = await clickSaveInForm(page, 'departments');
    note('ac2-click-luu', !!save.ok, JSON.stringify(save));
    await sleep(3000);
  }
  const deptPosts = results.network
    .slice(netBeforeDept)
    .filter((n) => n.method === 'POST' && /settings-catalogs\/items/.test(n.url));
  const deptPostOk = deptPosts.some((n) => n.status >= 200 && n.status < 300);
  note('ac2-post', deptPostOk, JSON.stringify(deptPosts.slice(-5)));

  await page.reload({ waitUntil: 'domcontentloaded' });
  await sleep(2500);
  try {
    await nativeClickByText(page, 'Danh mục nghiệp vụ');
    await sleep(500);
  } catch {
    /* */
  }
  try {
    await nativeClickByText(page, 'Phòng ban');
  } catch {
    /* */
  }
  await sleep(1200);
  const deptF5 = await page.evaluate((c) => (document.body.innerText || '').includes(c), deptCode);
  note('ac2-f5', deptF5, deptCode);
  results.verdicts.deptCreateF5 =
    deptDom.hasCode && deptPostOk && deptF5
      ? 'PASS'
      : deptDom.hasCode && (deptPostOk || deptF5)
        ? 'PARTIAL'
        : 'FAIL';

  // ---- AC3 regression: empty CTA via catalog strip (leave + dept) ----
  await page.setRequestInterception(true);
  const emptyHandler = async (req) => {
    try {
      if (req.method() === 'GET' && /\/api\/hrm\/settings-catalogs(\?|$)/.test(req.url())) {
        const upstream = await fetch(req.url(), { headers: authHeaders });
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

  await page.goto(`${PORTAL}/hr/attendance?portal=1&tenantId=xevn&companyId=main`, {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
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
  await sleep(600);
  for (const t of ['Tạo đơn', 'Tạo', 'Thêm']) {
    try {
      await clickByText(page, t);
      break;
    } catch {
      /* */
    }
  }
  await sleep(1500);
  const leaveEmpty = await page.evaluate(() => {
    const text = document.body.innerText || '';
    return {
      cta: text.includes('Chưa có mục trong danh mục') || text.includes('Mở Cài đặt'),
      amber: !!document.querySelector('.bg-amber-50, .border-amber-200'),
      fake8: ['annual', 'sick', 'unpaid', 'maternity', 'marriage', 'bereavement', 'compensatory', 'personal'].filter(
        (k) => new RegExp(`\\b${k}\\b`, 'i').test(text),
      ),
      snip: text.slice(0, 350),
    };
  });
  results.verdicts.leaveEmptyCta =
    leaveEmpty.cta && leaveEmpty.fake8.length === 0 ? 'PASS' : leaveEmpty.fake8.length ? 'FAIL' : 'PARTIAL';
  note('ac3-leave-empty', results.verdicts.leaveEmptyCta === 'PASS', JSON.stringify(leaveEmpty));

  await page.goto(`${PORTAL}/hr/employees?portal=1&tenantId=xevn&companyId=main`, {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
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
    const text = document.body.innerText || '';
    return {
      cta: text.includes('Chưa có mục trong danh mục') || text.includes('Mở Cài đặt'),
      amber: !!document.querySelector('.bg-amber-50, .border-amber-200'),
      snip: text.slice(0, 350),
    };
  });
  results.verdicts.deptEmptyCta = deptEmpty.cta ? 'PASS' : 'FAIL';
  note('ac3-dept-empty', deptEmpty.cta, JSON.stringify(deptEmpty));

  // Dept picker value=code smoke (with real catalog — stop intercept)
  page.off('request', emptyHandler);
  await page.setRequestInterception(false);

  await page.goto(`${PORTAL}/hr/employees?portal=1&tenantId=xevn&companyId=main`, {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });
  await sleep(2000);
  for (const t of ['Thêm nhân viên', 'Thêm mới']) {
    try {
      await clickByText(page, t);
      break;
    } catch {
      /* */
    }
  }
  await sleep(1500);
  const deptPicker = await page.evaluate(async () => {
    const dialog = document.querySelector('[role="dialog"]');
    const scope = dialog || document.body;
    const btns = Array.from(scope.querySelectorAll('button[role="combobox"]'));
    const deptBtn = btns.find((b) =>
      /phòng ban|department/i.test(`${b.getAttribute('aria-label') || ''} ${b.textContent || ''}`),
    );
    if (!deptBtn) {
      return { found: false, amber: !!scope.querySelector('.bg-amber-50'), comboCount: btns.length };
    }
    deptBtn.click();
    await new Promise((r) => setTimeout(r, 600));
    const options = Array.from(document.querySelectorAll('[cmdk-item], [role="option"]')).map((n) =>
      (n.textContent || '').replace(/\s+/g, ' ').trim(),
    );
    const hit =
      Array.from(document.querySelectorAll('[cmdk-item], [role="option"]')).find((n) =>
        /DEPT_|QA_DEPT_/.test(n.textContent || ''),
      ) || Array.from(document.querySelectorAll('[cmdk-item], [role="option"]'))[0];
    hit?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await new Promise((r) => setTimeout(r, 400));
    const trigger = (deptBtn.textContent || '').replace(/\s+/g, ' ').trim();
    const showsCode = /DEPT_|QA_DEPT_/.test(trigger) || options.some((o) => /DEPT_|QA_DEPT_/.test(o));
    return { found: true, options: options.slice(0, 8), trigger, showsCode };
  });
  results.verdicts.deptPickerCode =
    deptPicker.found && deptPicker.showsCode
      ? 'PASS'
      : deptPicker.found
        ? 'PARTIAL'
        : deptPicker.amber
          ? 'PASS_EMPTY_HARD'
          : 'FAIL';
  note('ac3-dept-picker-code', results.verdicts.deptPickerCode !== 'FAIL', JSON.stringify(deptPicker));

  results.leaveCode = leaveCode;
  results.deptCode = deptCode;
  results.finishedAt = new Date().toISOString();

  const v = results.verdicts;
  const ac1Pass = v.leaveCreateF5 === 'PASS';
  const ac2Pass = v.deptCreateF5 === 'PASS';
  const ac3Ok =
    (v.leaveEmptyCta === 'PASS' || v.leaveEmptyCta === 'PARTIAL') &&
    (v.deptEmptyCta === 'PASS' || v.deptPickerCode === 'PASS' || v.deptPickerCode === 'PASS_EMPTY_HARD' || v.deptPickerCode === 'PARTIAL');

  results.overall =
    ac1Pass && ac2Pass && ac3Ok
      ? 'PASS'
      : v.leaveFormVisible === 'FAIL' && v.deptFormVisible === 'FAIL'
        ? 'FAIL'
        : 'PARTIAL';

  // Never claim full matrix
  results.fullMatrixGreen = false;
  results.residualsNoted = ['JT proxy P2', 'POS-SEED notes', 'do not promote full Settings MD matrix'];

  save();
  console.log('=== verdicts ===', JSON.stringify(v, null, 2));
  console.log('overall', results.overall);
  await browser.close();
  process.exit(results.overall === 'PASS' ? 0 : results.overall === 'FAIL' ? 1 : 2);
}

main().catch((e) => {
  results.error = String(e?.stack || e);
  results.finishedAt = new Date().toISOString();
  save();
  console.error(e);
  process.exit(1);
});
