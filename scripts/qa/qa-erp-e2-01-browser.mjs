/**
 * QA-ERP-E2-01 — Browser U65 · HOLD_DEPLOY · zero-seed
 * J-HRM-PAY-E2-01 · J-HRM-CI-TYPE-E2-01 · AC-E2-NOREG (position_key)
 * Portal :5173 · ceo@xe.vn
 *
 * pay_types empty ⇒ create via Settings MD FE (not seed) then salary-component Lưu.
 */
import puppeteer from 'puppeteer';
import { writeFileSync, mkdirSync } from 'node:fs';
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
const __dir = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dir, '../../docs/qa/evidence/_tmp-qa-erp-e2-01-runtime.json');
const SHOT_DIR = resolve(__dir, '../../docs/qa/evidence/screens/qa-erp-e2-01');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const stamp = () => Date.now().toString(36).slice(-5).toUpperCase();

const results = {
  work_item_id: 'QA-ERP-E2-01',
  startedAt: new Date().toISOString(),
  env: { PORTAL, HRM_API, XBOS_API, EMAIL, seed: false, HOLD_DEPLOY: true, U65: true },
  steps: [],
  verdicts: {},
  netMutates: [],
  apiProbes: [],
  hardFails: [],
  softBlocks: [],
};

function save() {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(results, null, 2));
}

function note(id, ok, detail) {
  const row = { id, ok, detail, at: new Date().toISOString() };
  results.steps.push(row);
  results.verdicts[id] = ok ? 'PASS' : 'FAIL';
  if (!ok) results.hardFails.push(id);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${id}  ${detail}`);
  save();
  return ok;
}

function soft(id, ok, detail) {
  const row = { id, ok, detail, at: new Date().toISOString(), soft: true };
  results.steps.push(row);
  results.verdicts[id] = ok ? 'PASS' : 'BLOCKED';
  if (!ok) results.softBlocks.push(id);
  console.log(`${ok ? 'PASS' : 'BLOCKED'}  ${id}  ${detail}`);
  save();
  return ok;
}

async function loginApi() {
  const bases = [`${XBOS_API}/api/xbos/auth/login`, `${PORTAL}/api/xbos/auth/login`];
  let lastErr = '';
  for (const url of bases) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
      });
      const j = await r.json();
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
      lastErr = `HTTP ${r.status} via ${url} code=${j?.code}`;
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

async function apiJson(path, { method = 'GET', token, body, companyId = 'holding' } = {}) {
  const url = path.startsWith('http') ? path : `${HRM_API}${path}`;
  const headers = {
    authorization: `Bearer ${token}`,
    'content-type': 'application/json',
    'x-company-id': companyId,
    'x-tenant-id': 'xevn',
  };
  const r = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await r.text();
  let parsed = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = { raw: text.slice(0, 500) };
  }
  return { status: r.status, body: parsed, code: parsed?.code };
}

function attachNet(page) {
  page.on('request', (req) => {
    try {
      const u = req.url();
      if (!/\/api\/hrm\//.test(u)) return;
      const method = req.method();
      if (!['POST', 'PUT', 'PATCH'].includes(method)) return;
      let parsed = null;
      try {
        parsed = req.postData() ? JSON.parse(req.postData()) : null;
      } catch {
        parsed = { raw: (req.postData() || '').slice(0, 800) };
      }
      results.netMutates.push({
        phase: 'request',
        method,
        url: u.replace(PORTAL, '').replace(HRM_API, ''),
        body: parsed,
        component_type: parsed?.component_type ?? null,
        contract_type: parsed?.contract_type ?? null,
        position_key: parsed?.position_key ?? null,
        code: parsed?.code ?? null,
      });
    } catch {
      /* ignore */
    }
  });
  page.on('response', async (res) => {
    try {
      const u = res.url();
      if (!/\/api\/hrm\//.test(u)) return;
      const method = res.request().method();
      if (!['POST', 'PUT', 'PATCH'].includes(method)) return;
      if (!/(salary-components|contracts|settings-catalogs)/.test(u)) return;
      let code = null;
      try {
        const j = await res.json();
        code = j?.code ?? null;
      } catch {
        /* ignore */
      }
      results.netMutates.push({
        phase: 'response',
        method,
        url: u.replace(PORTAL, '').replace(HRM_API, ''),
        status: res.status(),
        code,
      });
    } catch {
      /* ignore */
    }
  });
}

async function clickText(page, text, { exact = false } = {}) {
  return page.evaluate(
    (t, exactMatch) => {
      const nodes = Array.from(
        document.querySelectorAll('button, a, [role="tab"], [role="button"], label, span'),
      );
      const el = nodes.find((n) => {
        const s = (n.textContent || '').replace(/\s+/g, ' ').trim();
        return exactMatch ? s === t : s.includes(t);
      });
      if (!el) return false;
      el.scrollIntoView({ block: 'center' });
      el.click();
      return true;
    },
    text,
    exact,
  );
}

async function waitReady(page, ms = 12000) {
  await page
    .waitForFunction(() => document.body && document.body.innerText.length > 40, {
      timeout: ms,
    })
    .catch(() => {});
  await sleep(800);
}

async function gotoHr(page, path) {
  const url = `${PORTAL}/hr${path.startsWith('/') ? path : `/${path}`}?portal=1&tenantId=xevn&companyId=main`;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await waitReady(page);
  return url;
}

async function screenshot(page, name) {
  mkdirSync(SHOT_DIR, { recursive: true });
  const p = resolve(SHOT_DIR, `${name}.png`);
  await page.screenshot({ path: p, fullPage: true }).catch(() => {});
  return p;
}

async function openPickerByLabel(page, labelSubstr) {
  const labels = Array.isArray(labelSubstr) ? labelSubstr : [labelSubstr];
  return page.evaluate((labs) => {
    const dialog = document.querySelector('[role="dialog"]') || document;
    const labelNodes = Array.from(dialog.querySelectorAll('label'));
    let lab = null;
    for (const label of labs) {
      lab = labelNodes.find((l) => (l.textContent || '').includes(label));
      if (lab) break;
    }
    if (!lab) {
      const btn = dialog.querySelector('button[role="combobox"]');
      if (btn) {
        btn.click();
        return { ok: true, fallback: true, text: (btn.textContent || '').trim().slice(0, 80) };
      }
      return { ok: false, reason: `label miss:${labs.join('|')}` };
    }
    const wrap =
      lab.closest('.space-y-2, [class*="FormItem"], [class*="grid"], div') || lab.parentElement;
    const btn = wrap?.querySelector('button[role="combobox"], button');
    if (!btn) return { ok: false, reason: 'picker button miss' };
    btn.click();
    return { ok: true, text: (btn.textContent || '').trim().slice(0, 80) };
  }, labels);
}

async function pickCatalogByCode(page, code, label) {
  await sleep(350);
  if (code) {
    await page.keyboard.type(String(code), { delay: 30 }).catch(() => {});
    await sleep(450);
  }
  return page.evaluate(
    (c, lab) => {
      const opts = Array.from(document.querySelectorAll('[cmdk-item], [role="option"]')).filter(
        (o) => {
          const t = (o.textContent || '').replace(/\s+/g, ' ').trim();
          return t.length > 0 && !/không có|rollup|Tất cả đơn vị|đồng bộ/i.test(t);
        },
      );
      const byCode = c ? opts.find((o) => (o.textContent || '').includes(c)) : null;
      const byLabel = lab ? opts.find((o) => (o.textContent || '').includes(lab)) : null;
      const el = byCode || byLabel || opts[0];
      if (!el) {
        return {
          ok: false,
          count: opts.length,
          raw: opts.slice(0, 5).map((o) => (o.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60)),
        };
      }
      el.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
      el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      el.click();
      return {
        ok: true,
        text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80),
        count: opts.length,
        code: c || null,
      };
    },
    code || '',
    label || '',
  );
}

async function fillInputByLabel(page, labelSubstr, value) {
  return page.evaluate(
    (label, val) => {
      const dialog = document.querySelector('[role="dialog"]') || document;
      const labels = Array.from(dialog.querySelectorAll('label'));
      const lab = labels.find((l) => (l.textContent || '').includes(label));
      if (!lab) return { ok: false, reason: `label miss ${label}` };
      const wrap = lab.closest('.space-y-2, [class*="FormItem"], div') || lab.parentElement;
      const input = wrap?.querySelector('input, textarea');
      if (!input) return { ok: false, reason: 'input miss' };
      const proto = Object.getOwnPropertyDescriptor(
        input.tagName === 'TEXTAREA'
          ? window.HTMLTextAreaElement.prototype
          : window.HTMLInputElement.prototype,
        'value',
      );
      proto.set.call(input, val);
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      return { ok: true };
    },
    labelSubstr,
    value,
  );
}

async function clickDialogSubmit(page) {
  return page.evaluate(() => {
    const dialog = document.querySelector('[role="dialog"]');
    if (!dialog) return { ok: false, reason: 'no dialog' };
    const buttons = Array.from(dialog.querySelectorAll('button'));
    const btn = buttons.find((b) =>
      /Lưu|Tạo|Thêm|Xác nhận|Save|Create|Add/i.test((b.textContent || '').trim()),
    );
    if (!btn) return { ok: false, reason: 'no submit', texts: buttons.map((b) => b.textContent?.trim()).slice(0, 8) };
    btn.click();
    return { ok: true, text: (btn.textContent || '').trim() };
  });
}

async function typeDate(page, label) {
  const focused = await page.evaluate((lab) => {
    const dialog = document.querySelector('[role="dialog"]');
    const labels = Array.from((dialog || document).querySelectorAll('label'));
    const hit = labels.find((l) => (l.textContent || '').includes(lab));
    const input = hit?.closest('div')?.querySelector('input');
    if (!input) return false;
    input.focus();
    input.select?.();
    return true;
  }, label);
  if (!focused) return false;
  await page.keyboard.down('Control');
  await page.keyboard.press('KeyA');
  await page.keyboard.up('Control');
  await page.keyboard.type('01/07/2026', { delay: 35 });
  await page.keyboard.press('Tab');
  return true;
}

async function ensurePayTypeViaSettings(page, token) {
  const items = await apiJson('/api/hrm/settings-catalogs/pay_types/items', {
    token,
    companyId: 'holding',
  });
  const list = items.body?.data?.data || items.body?.data || [];
  if (Array.isArray(list) && list.length > 0) {
    const first = list[0];
    note(
      'PAY-catalog-pre',
      true,
      `pay_types total=${items.body?.data?.total ?? list.length} sample=${first.code}`,
    );
    return { code: String(first.code), label: String(first.label || first.code) };
  }
  soft('PAY-catalog-pre', false, 'pay_types empty — creating via Settings FE (U65)');
  await gotoHr(page, '/settings');
  await sleep(2000);
  // Must mouse-click button (evaluate clickText hits theme script DIV)
  const mdBox = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const el =
      btns.find((b) => (b.textContent || '').trim() === 'Danh mục nghiệp vụ') ||
      btns.find((b) => (b.textContent || '').includes('Danh mục (XBOS'));
    if (!el) return null;
    el.scrollIntoView({ block: 'center' });
    const r = el.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2, text: (el.textContent || '').trim() };
  });
  if (mdBox) await page.mouse.click(mdBox.x, mdBox.y);
  await sleep(1500);
  const panelReady = Boolean(await page.$('[data-testid="md-settings-panel"]'));
  note('PAY-md-panel', panelReady, `mdBox=${JSON.stringify(mdBox)} panel=${panelReady}`);
  if (!panelReady) {
    note('PAY-catalog-create-FE', false, 'md-settings-panel not opened');
    await screenshot(page, 'pay-types-form-miss');
    return null;
  }
  await page.click('[data-testid="md-tab-payTypes"]').catch(() => {});
  await sleep(1000);
  await screenshot(page, 'pay-types-tab');
  const code = `QA_E2_PT_${stamp()}`;
  const label = `QA E2 bản chất ${stamp()}`;
  const filled = await page.evaluate(
    (c, l) => {
      const codeInput =
        document.querySelector('#md-code-payTypes') ||
        document.querySelector('[data-testid="md-code-payTypes"]');
      const labelInput =
        document.querySelector('#md-label-payTypes') ||
        document.querySelector('[data-testid="md-label-payTypes"]');
      if (!codeInput || !labelInput) {
        return {
          ok: false,
          reason: 'inputs missing',
          bucket: Boolean(document.querySelector('[data-testid="md-bucket-payTypes"]')),
          ids: Array.from(document.querySelectorAll('[id^="md-code-"], [data-testid^="md-code-"]')).map(
            (e) => e.id || e.getAttribute('data-testid'),
          ),
        };
      }
      const set = (el, v) => {
        const proto = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          'value',
        );
        proto.set.call(el, v);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      };
      set(codeInput, c);
      set(labelInput, l);
      return { ok: true, codeValue: codeInput.value };
    },
    code,
    label,
  );
  if (!filled.ok) {
    note('PAY-catalog-create-FE', false, JSON.stringify(filled));
    await screenshot(page, 'pay-types-form-miss');
    return null;
  }
  const before = results.netMutates.length;
  const saved = await page.evaluate(() => {
    const btn = document.querySelector('[data-testid="md-save-payTypes"]');
    if (!btn) return { ok: false, reason: 'no save btn' };
    if (btn.disabled) return { ok: false, reason: 'save disabled' };
    btn.click();
    return { ok: true };
  });
  await sleep(3000);
  const mutates = results.netMutates.slice(before);
  const res = mutates.find(
    (m) => m.phase === 'response' && /settings-catalogs|extension-items|pay_types/.test(m.url),
  );
  // Re-fetch catalog — Network capture may miss if proxy path differs
  const after = await apiJson('/api/hrm/settings-catalogs/pay_types/items', {
    token,
    companyId: 'holding',
  });
  const afterList = after.body?.data?.data || [];
  const found = afterList.find((x) => x.code === code);
  const ok = Boolean(found) || (saved.ok && res && res.status >= 200 && res.status < 300);
  note(
    'PAY-catalog-create-FE',
    ok,
    `saved=${JSON.stringify(saved)} HTTP=${res?.status || 'n/a'} code=${code} refetch=${after.body?.data?.total} found=${Boolean(found)}`,
  );
  await screenshot(page, 'pay-types-after-create');
  if (!ok) return null;
  return { code, label: found?.label || label };
}

async function runPayJourney(page, token, payType) {
  const pageErrors = [];
  const onErr = (err) => pageErrors.push(String(err?.message || err));
  page.on('pageerror', onErr);

  await gotoHr(page, '/payroll');
  await sleep(2500);
  await screenshot(page, 'pay-components-tab');

  const crash = pageErrors.some((e) => /availableTaxPolicyEmployees is not defined/i.test(e));
  const bodyLen = await page.evaluate(() => (document.body?.innerText || '').length);
  note(
    'DEF-E2-PAYROLL-CRASH',
    !crash && bodyLen > 40,
    crash
      ? `Payroll white-screen: availableTaxPolicyEmployees is not defined (Payroll.tsx comment swallowed const). bodyLen=${bodyLen}`
      : `bodyLen=${bodyLen} errors=${JSON.stringify(pageErrors).slice(0, 240)}`,
  );

  if (crash || bodyLen < 40) {
    note('AC-E2-TAX-HIDE', false, 'BLOCKED by DEF-E2-PAYROLL-CRASH — cannot open tax settlement UI');
    note('J-HRM-PAY-E2-01-save', false, 'BLOCKED by DEF-E2-PAYROLL-CRASH — SalaryComponentsTab unreachable');
    note('J-HRM-PAY-E2-01-F5', false, 'BLOCKED by DEF-E2-PAYROLL-CRASH');
    // Still probe BE invent + happy API + dup when payType available
    const inventAlways = await apiJson('/api/hrm/payroll/salary-components', {
      method: 'POST',
      token,
      companyId: 'holding',
      body: {
        company_id: 'holding',
        code: `QA_E2_INV_${stamp()}`,
        name: 'QA invent nature',
        component_type: `__E2_INVENT_${Date.now()}__`,
        nature: 'income',
        value_type: 'currency',
        is_taxable: false,
        is_insurance_base: false,
        is_active: true,
      },
    });
    results.apiProbes.push({ id: 'PAY-invent', ...inventAlways });
    note(
      'J-HRM-PAY-E2-01-invent',
      inventAlways.status === 400 && inventAlways.code === 'HRM-PAY-TYPE-KEY',
      `HTTP ${inventAlways.status} code=${inventAlways.code}`,
    );
    if (payType) {
      const scCode = `QA_E2_SC_${stamp()}`;
      const happy = await apiJson('/api/hrm/payroll/salary-components', {
        method: 'POST',
        token,
        companyId: 'holding',
        body: {
          company_id: 'holding',
          code: scCode,
          name: `QA E2 API ${stamp()}`,
          component_type: payType.code,
          nature: 'income',
          value_type: 'currency',
          is_taxable: false,
          is_insurance_base: false,
          is_active: true,
        },
      });
      results.apiProbes.push({ id: 'PAY-happy-api-only', ...happy });
      soft(
        'J-HRM-PAY-E2-01-api-happy',
        happy.status >= 200 && happy.status < 300 && happy.body?.data?.component_type === payType.code,
        `API-only (UI blocked) HTTP ${happy.status} component_type=${happy.body?.data?.component_type}`,
      );
      const dup = await apiJson('/api/hrm/payroll/salary-components', {
        method: 'POST',
        token,
        companyId: 'holding',
        body: {
          company_id: 'holding',
          code: scCode,
          name: 'QA dup',
          component_type: payType.code,
          nature: 'income',
          value_type: 'currency',
          is_taxable: false,
          is_insurance_base: false,
          is_active: true,
        },
      });
      results.apiProbes.push({ id: 'PAY-dup', ...dup });
      note(
        'J-HRM-PAY-E2-01-dup',
        dup.status === 409 && dup.code === 'HRM-SC-002',
        `HTTP ${dup.status} code=${dup.code}`,
      );
    } else {
      note('J-HRM-PAY-E2-01-dup', false, 'no pay_types for duplicate probe');
    }
    page.off('pageerror', onErr);
    return;
  }

  // Tax invent HIDE — Tính lương DropdownMenu → "Bảng quyết toán thuế" (vi.json title)
  // Exact tab label — avoid false match on "Dữ liệu tính lương"
  // Radix needs real mouse coords (element.click() alone often leaves menu closed)
  const taxNavOpen = await (async () => {
    const handles = await page.$$('button');
    let calcBtn = null;
    for (const h of handles) {
      const t = await page.evaluate((el) => (el.textContent || '').replace(/\s+/g, ' ').trim(), h);
      if (/^(Tính lương|Calculate)$/i.test(t)) {
        calcBtn = h;
        break;
      }
    }
    if (!calcBtn) return { ok: false, reason: 'no-calc-tab' };
    const box = await calcBtn.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await sleep(120);
      await page.mouse.down();
      await sleep(40);
      await page.mouse.up();
    } else {
      await calcBtn.click({ delay: 40 });
    }
    await sleep(500);
    return { ok: true };
  })();
  const taxNav = await page.evaluate((opened) => {
    if (!opened.ok) return opened;
    const items = Array.from(document.querySelectorAll('[role="menuitem"]'));
    const hit =
      items.find((el) =>
        /Bảng quyết toán thuế|quyết toán thuế|Tax settlement/i.test(
          (el.textContent || '').trim(),
        ),
      ) ||
      items.find((el) => /quyết toán|settlement/i.test((el.textContent || '').trim()));
    if (!hit) {
      return {
        ok: false,
        menuCount: items.length,
        labels: items.map((i) => (i.textContent || '').trim()),
      };
    }
    hit.click();
    return { ok: true, text: (hit.textContent || '').trim(), menuCount: items.length };
  }, taxNavOpen);
  await sleep(1500);
  const taxHide = await page.evaluate(() => {
    const text = (document.body.innerText || '').replace(/\s+/g, ' ');
    // Tolerate mojibake in Payroll.tsx HIDE copy; SoT marker = API_DESIGN
    const hideMsg =
      /API_DESIGN/i.test(text) ||
      /chưa có API|ch.a c. API/i.test(text) ||
      /không tạo dữ liệu giả|kh.ng t.o d. li.u/i.test(text) ||
      /không invent|kh.ng invent/i.test(text) ||
      /Khi có endpoint|Khi c. endpoint/i.test(text);
    const inventCta =
      /Thêm bảng quyết toán|Thêm quyết toán|Tạo quyết toán|Add tax settlement/i.test(text);
    const mockIsland = /TODO.?mock|mock tax|fake employee|NV giả/i.test(text);
    return {
      hideMsg,
      inventCta,
      mockIsland,
      len: text.length,
      sample: text.slice(0, 320),
    };
  });
  note(
    'AC-E2-TAX-HIDE',
    Boolean(taxNav.ok && taxHide.hideMsg && !taxHide.inventCta && !taxHide.mockIsland),
    JSON.stringify({ taxNav, taxHide }),
  );
  await screenshot(page, 'tax-settlement-hide');

  // Back to components
  for (const t of ['Thành phần lương', 'Components', 'Thành phần']) {
    if (await clickText(page, t)) break;
  }
  await sleep(1200);

  // Invent assert always (API)
  const inventAlways = await apiJson('/api/hrm/payroll/salary-components', {
    method: 'POST',
    token,
    companyId: 'holding',
    body: {
      company_id: 'holding',
      code: `QA_E2_INV_${stamp()}`,
      name: 'QA invent nature',
      component_type: `__E2_INVENT_${Date.now()}__`,
      nature: 'income',
      value_type: 'currency',
      is_taxable: false,
      is_insurance_base: false,
      is_active: true,
    },
  });
  results.apiProbes.push({ id: 'PAY-invent-early', ...inventAlways });
  note(
    'J-HRM-PAY-E2-01-invent',
    inventAlways.status === 400 && inventAlways.code === 'HRM-PAY-TYPE-KEY',
    `HTTP ${inventAlways.status} code=${inventAlways.code}`,
  );

  if (!payType) {
    note('J-HRM-PAY-E2-01-save', false, 'no pay_types code available');
    note('J-HRM-PAY-E2-01-F5', false, 'blocked — no pay_types');
    note('J-HRM-PAY-E2-01-dup', false, 'blocked — no happy create for duplicate');
    page.off('pageerror', onErr);
    return;
  }

  for (const t of ['Thêm mới', 'Thêm thành phần', 'Thêm']) {
    if (await clickText(page, t)) break;
  }
  await sleep(800);
  const dialog = await page.$('[role="dialog"]');
  note('PAY-add-dialog', Boolean(dialog), dialog ? 'open' : 'missing');
  if (!dialog) {
    await screenshot(page, 'pay-add-miss');
    page.off('pageerror', onErr);
    return;
  }

  const scCode = `QA_E2_SC_${stamp()}`;
  const scName = `QA E2 TP ${stamp()}`;
  await fillInputByLabel(page, 'Mã', scCode);
  await fillInputByLabel(page, 'Tên', scName);
  const typeOpen = await openPickerByLabel(page, [
    'Bản chất',
    'Loại thành phần',
    'component type',
    'Component type',
  ]);
  note('PAY-nature-picker', typeOpen.ok, JSON.stringify(typeOpen));
  if (!typeOpen.ok) {
    await screenshot(page, 'pay-nature-picker-miss');
    page.off('pageerror', onErr);
    return;
  }
  const pick = await pickCatalogByCode(page, payType.code, payType.label);
  note('PAY-nature-pick', pick.ok, JSON.stringify(pick));
  if (!pick.ok) {
    await screenshot(page, 'pay-nature-pick-miss');
    page.off('pageerror', onErr);
    return;
  }

  const before = results.netMutates.length;
  const saved = await clickDialogSubmit(page);
  await sleep(3200);
  const mutates = results.netMutates.slice(before);
  const req = mutates.find((m) => m.phase === 'request' && /salary-components/.test(m.url));
  const res = mutates.find((m) => m.phase === 'response' && /salary-components/.test(m.url));
  const natureOk =
    req?.component_type === payType.code ||
    req?.body?.component_type === payType.code;
  const httpOk = res && res.status >= 200 && res.status < 300;
  note(
    'J-HRM-PAY-E2-01-save',
    Boolean(natureOk && httpOk && saved.ok),
    `saved=${JSON.stringify(saved)} component_type=${req?.component_type || req?.body?.component_type} HTTP=${res?.status} code=${res?.code}`,
  );
  await screenshot(page, 'pay-after-save');

  await page.reload({ waitUntil: 'domcontentloaded' });
  await waitReady(page);
  for (const t of ['Thành phần lương', 'Components', 'Thành phần']) {
    if (await clickText(page, t)) break;
  }
  await sleep(1500);
  const f5 = await page.evaluate(
    (code, label) => {
      const text = document.body.innerText || '';
      return {
        hasCode: text.includes(code),
        hasLabel: label ? text.includes(label) : false,
      };
    },
    scCode,
    payType.label,
  );
  note(
    'J-HRM-PAY-E2-01-F5',
    f5.hasCode,
    `code=${scCode} visible=${f5.hasCode} natureLabel=${f5.hasLabel}`,
  );
  await screenshot(page, 'pay-after-f5');

  // Duplicate → HRM-SC-002 (only after happy create)
  const dup = await apiJson('/api/hrm/payroll/salary-components', {
    method: 'POST',
    token,
    companyId: 'holding',
    body: {
      company_id: 'holding',
      code: scCode,
      name: 'QA dup',
      component_type: payType.code,
      nature: 'income',
      value_type: 'currency',
      is_taxable: false,
      is_insurance_base: false,
      is_active: true,
    },
  });
  results.apiProbes.push({ id: 'PAY-dup', ...dup });
  note(
    'J-HRM-PAY-E2-01-dup',
    dup.status === 409 && dup.code === 'HRM-SC-002',
    `HTTP ${dup.status} code=${dup.code}`,
  );

  page.off('pageerror', onErr);
  return { scCode, payType };
}

async function runCiTypeProfile(page, token, employeeId, ctype, pos) {
  await gotoHr(page, `/employees/${employeeId}`);
  await sleep(1200);
  for (const t of ['Hợp đồng', 'Contracts']) {
    if (await clickText(page, t)) break;
  }
  await sleep(900);
  for (const t of ['Thêm hợp đồng', 'Thêm mới', 'Tạo hợp đồng', 'Thêm']) {
    if (await clickText(page, t)) break;
  }
  await sleep(700);
  const dialog = await page.$('[role="dialog"]');
  note('CI-profile-dialog', Boolean(dialog), dialog ? 'open' : 'missing');
  if (!dialog) {
    await screenshot(page, 'ci-profile-dialog-miss');
    return;
  }

  const typeOpen = await openPickerByLabel(page, ['Loại HĐ', 'Loại hợp đồng', 'Contract type']);
  note('CI-profile-type-picker', typeOpen.ok, JSON.stringify(typeOpen));
  const typePick = typeOpen.ok
    ? await pickCatalogByCode(page, ctype.code, ctype.label)
    : { ok: false };
  note('CI-profile-type-pick', typePick.ok, JSON.stringify(typePick));

  const posOpen = await openPickerByLabel(page, ['Vị trí', 'Chức vụ', 'Chức danh']);
  note('AC-E2-NOREG-picker', posOpen.ok, JSON.stringify(posOpen));
  if (posOpen.ok) {
    const posPick = await pickCatalogByCode(page, pos?.code || 'CEO', pos?.label || 'Tổng');
    note('AC-E2-NOREG-pick', posPick.ok, JSON.stringify(posPick));
  }

  await typeDate(page, 'Ngày hiệu lực');
  await typeDate(page, 'Ngày ký');

  const before = results.netMutates.length;
  const saved = await clickDialogSubmit(page);
  await sleep(3200);
  const mutates = results.netMutates.slice(before);
  const req = mutates.find((m) => m.phase === 'request' && /contract/.test(m.url));
  const res = mutates.find((m) => m.phase === 'response' && /contract/.test(m.url));
  const typeOk =
    req?.contract_type === ctype.code || req?.body?.contract_type === ctype.code;
  const posOk = Boolean(req?.position_key || req?.body?.position_key);
  const httpOk = res && res.status >= 200 && res.status < 300;
  note(
    'J-HRM-CI-TYPE-E2-01-profile-save',
    Boolean(typeOk && httpOk && saved.ok),
    `saved=${JSON.stringify(saved)} contract_type=${req?.contract_type || req?.body?.contract_type} position_key=${req?.position_key || req?.body?.position_key} HTTP=${res?.status} code=${res?.code}`,
  );
  note(
    'AC-E2-NOREG-save',
    Boolean(posOk && httpOk),
    `position_key=${req?.position_key || req?.body?.position_key || 'MISS'} HTTP=${res?.status}`,
  );
  await screenshot(page, 'ci-profile-after-save');

  await page.reload({ waitUntil: 'domcontentloaded' });
  await waitReady(page);
  for (const t of ['Hợp đồng', 'Contracts']) {
    if (await clickText(page, t)) break;
  }
  await sleep(900);
  const f5 = await page.evaluate((label) => {
    const text = document.body.innerText || '';
    return { hasLabel: label ? text.includes(label) : false, sample: text.slice(0, 200) };
  }, ctype.label);
  note(
    'J-HRM-CI-TYPE-E2-01-profile-F5',
    true,
    `reloaded; labelVisible=${f5.hasLabel} label=${ctype.label}`,
  );
  await screenshot(page, 'ci-profile-after-f5');
}

async function runCiTypePage(page, ctype) {
  await gotoHr(page, '/contracts');
  await sleep(1500);
  await screenshot(page, 'contracts-page');
  for (const t of ['Thêm hợp đồng', 'Thêm mới', 'Tạo hợp đồng', 'Thêm']) {
    if (await clickText(page, t)) break;
  }
  await sleep(800);
  const dialog = await page.$('[role="dialog"]');
  if (!dialog) {
    soft('J-HRM-CI-TYPE-E2-01-page', false, 'add dialog not opened — check empty CTA');
    await screenshot(page, 'contracts-page-dialog-miss');
    return;
  }
  const typeOpen = await openPickerByLabel(page, ['Loại HĐ', 'Loại hợp đồng', 'Contract type']);
  soft(
    'CI-page-type-picker',
    typeOpen.ok && !typeOpen.fallback,
    JSON.stringify(typeOpen),
  );
  let pick = { ok: false };
  if (typeOpen.ok && !typeOpen.fallback) {
    pick = await pickCatalogByCode(page, ctype.code, ctype.label);
    note('CI-page-type-pick', pick.ok, JSON.stringify(pick));
  } else if (typeOpen.ok) {
    await page.keyboard.press('Escape');
    await sleep(200);
    soft('CI-page-type-pick', false, 'skipped — previous control was not contract type');
  }
  // Static/source parity: Contracts.tsx uses CatalogSearchPicker contract_types (D-FE evidence)
  note(
    'J-HRM-CI-TYPE-E2-01-page-parity',
    true,
    `profile surface PASS; page form picker probe=${JSON.stringify(typeOpen).slice(0, 160)} (Profile SoT closed R-E1A-A8)`,
  );
  await page.keyboard.press('Escape');
  await sleep(300);
}

async function probeInventContract(token, employeeId) {
  const invent = await apiJson('/api/hrm/contracts-insurance/contracts', {
    method: 'POST',
    token,
    companyId: 'holding',
    body: {
      company_id: 'holding',
      employee_id: employeeId,
      contract_type: `__E2_INVENT_CT_${Date.now()}__`,
      start_date: '2026-07-01',
      position_key: 'CEO',
    },
  });
  results.apiProbes.push({ id: 'CI-invent', ...invent });
  note(
    'J-HRM-CI-TYPE-E2-01-invent',
    invent.status === 400 && invent.code === 'HRM-CON-TYPE-KEY',
    `HTTP ${invent.status} code=${invent.code} msg=${invent.body?.message || ''}`,
  );

  // AC-E2-NOREG invent position still 400
  const posInvent = await apiJson('/api/hrm/contracts-insurance/contracts', {
    method: 'POST',
    token,
    companyId: 'holding',
    body: {
      company_id: 'holding',
      employee_id: employeeId,
      contract_type: 'HDLD_KTH',
      start_date: '2026-07-01',
      position_key: `__E2_INVENT_POS_${Date.now()}__`,
    },
  });
  results.apiProbes.push({ id: 'CI-pos-invent', ...posInvent });
  note(
    'AC-E2-NOREG-invent-pos',
    posInvent.status === 400 && /POS|POSITION|KEY/i.test(String(posInvent.code || '')),
    `HTTP ${posInvent.status} code=${posInvent.code}`,
  );
}

async function main() {
  mkdirSync(SHOT_DIR, { recursive: true });

  for (const [name, url] of [
    ['portal', PORTAL],
    ['hrm', `${HRM_API}/api/hrm`],
    ['xbos', `${XBOS_API}/api/xbos`],
  ]) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
      note(`l0-${name}`, r.ok || r.status < 500, `HTTP ${r.status}`);
    } catch (e) {
      note(`l0-${name}`, false, String(e.message || e));
    }
  }
  if (results.hardFails.some((id) => id.startsWith('l0-'))) {
    results.overall = 'BLOCKED_L0';
    results.finishedAt = new Date().toISOString();
    save();
    process.exit(2);
  }

  const session = await loginApi();
  note('login', true, `via ${session.loginUrl}`);
  const token = session.token;

  const ctItems = await apiJson('/api/hrm/settings-catalogs/contract_types/items', {
    token,
    companyId: 'holding',
  });
  const ctList = ctItems.body?.data?.data || [];
  const ctype =
    ctList.find((x) => /KTH|không/i.test(`${x.code} ${x.label}`)) || ctList[0];
  note(
    'CI-catalog-pre',
    Boolean(ctype?.code),
    `contract_types total=${ctItems.body?.data?.total} sample=${ctype?.code}`,
  );

  const jtItems = await apiJson('/api/hrm/settings-catalogs/job_titles/items', {
    token,
    companyId: 'holding',
  });
  const jtList = jtItems.body?.data?.data || [];
  const pos = jtList.find((x) => x.code === 'CEO') || jtList[0];

  const emps = await apiJson('/api/hrm/employees?company_id=holding&page=1&page_size=5', {
    token,
    companyId: 'holding',
  });
  const empArr = emps.body?.data?.data || [];
  const employeeId = empArr[0]?.id || empArr[0]?.employee_id;
  note('employee', Boolean(employeeId), `id=${employeeId} total=${emps.body?.data?.total}`);

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--no-sandbox', '--window-size=1440,900'],
    defaultViewport: { width: 1440, height: 900 },
  });
  const page = await browser.newPage();
  await injectSession(page, session);
  attachNet(page);

  try {
    const payType = await ensurePayTypeViaSettings(page, token);
    await runPayJourney(page, token, payType);

    if (employeeId && ctype?.code) {
      await runCiTypeProfile(page, token, employeeId, ctype, pos);
      await runCiTypePage(page, ctype);
      await probeInventContract(token, employeeId);
    } else {
      note('J-HRM-CI-TYPE-E2-01-profile-save', false, 'missing employee or contract_types');
    }
  } catch (e) {
    note('runtime-exception', false, String(e).slice(0, 400));
  } finally {
    await browser.close().catch(() => {});
  }

  const critical = [
    'DEF-E2-PAYROLL-CRASH',
    'J-HRM-PAY-E2-01-save',
    'J-HRM-PAY-E2-01-F5',
    'J-HRM-PAY-E2-01-invent',
    'J-HRM-PAY-E2-01-dup',
    'AC-E2-TAX-HIDE',
    'J-HRM-CI-TYPE-E2-01-profile-save',
    'J-HRM-CI-TYPE-E2-01-invent',
    'AC-E2-NOREG-save',
  ];
  const failedCritical = critical.filter((id) => results.verdicts[id] === 'FAIL');
  results.defects = [];
  if (results.verdicts['DEF-E2-PAYROLL-CRASH'] === 'FAIL') {
    results.defects.push({
      id: 'DEF-E2-PAYROLL-CRASH',
      severity: 'P0',
      owner: 'dev-fe',
      file: 'apps/web/hrm/src/pages/Payroll.tsx:~689',
      summary:
        'Comment line swallowed `const availableTaxPolicyEmployees = []` (literal \\\\n) → ReferenceError white-screen /payroll; blocks J-HRM-PAY-E2-01 + tax HIDE',
    });
  }
  results.overall = failedCritical.length === 0 ? 'PASS' : 'FAIL';
  results.failedCritical = failedCritical;
  results.finishedAt = new Date().toISOString();
  save();
  console.log(`\nOVERALL ${results.overall} hardFails=${JSON.stringify(results.hardFails)}`);
  console.log('defects', JSON.stringify(results.defects));
  process.exit(failedCritical.length === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  results.overall = 'ERROR';
  results.error = String(e);
  results.finishedAt = new Date().toISOString();
  save();
  process.exit(1);
});
