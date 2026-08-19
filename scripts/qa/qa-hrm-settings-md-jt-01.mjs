/**
 * QA-HRM-SETTINGS-MD-JT-01 — Job Templates position_code catalog SoT (browser UF)
 * U65 zero-seed · HOLD_DEPLOY · NOT Phase1/PROD · NOT :8088
 *
 * Exit: Recruitment → Thư viện JD → Thêm JD → pick job_titles → Lưu
 *       POST body has position_code → 2xx → F5 row still correct
 *       Empty job_titles → amber CTA + Lưu disabled (route intercept, no seed)
 */
import puppeteer from 'puppeteer';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const XBOS_API = process.env.XBOS_API_URL || 'http://127.0.0.1:28002';
const HRM_FE = process.env.HRM_FE_URL || 'http://127.0.0.1:8080';
const HRM_API = process.env.HRM_API_URL || 'http://127.0.0.1:28001';
const EMAIL = 'ceo@xe.vn';
const PASSWORD = 'Xevn@2026';
const OUT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../docs/qa/evidence/_tmp-qa-hrm-settings-md-jt-01-runtime.json',
);

const results = {
  work_item_id: 'QA-HRM-SETTINGS-MD-JT-01',
  startedAt: new Date().toISOString(),
  steps: [],
  verdicts: {},
  network: [],
};

function note(id, ok, detail) {
  const row = { id, ok, detail, at: new Date().toISOString() };
  results.steps.push(row);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${id}  ${detail}`);
  return ok;
}

async function loginApi() {
  const bases = [`${PORTAL}/api/xbos/auth/login`, `${XBOS_API}/api/xbos/auth/login`];
  let lastErr = null;
  for (const url of bases) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
      });
      const j = await r.json();
      const token = j?.data?.accessToken ?? j?.accessToken;
      if (token) {
        return {
          token,
          expiresAt: Date.now() + 8 * 3600_000,
          user: j?.data?.user ?? { userId: EMAIL, displayName: 'CEO' },
          loginUrl: url,
        };
      }
      lastErr = `HTTP ${r.status} no token from ${url}`;
    } catch (e) {
      lastErr = `${url}: ${e?.message || e}`;
    }
  }
  throw new Error(`login failed: ${lastErr}`);
}

async function injectSession(page, session) {
  await page.evaluateOnNewDocument((s) => {
    const payload = JSON.stringify(s.user);
    for (const store of [localStorage, sessionStorage]) {
      store.setItem('xevn.portal.accessToken', s.token);
      store.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
      store.setItem('xevn.portal.user', payload);
      store.setItem('hrm_current_company_id', 'main');
      store.setItem('hrm_current_tenant_id', 'xevn');
    }
  }, session);
}

async function waitText(page, text, timeout = 25000) {
  await page.waitForFunction(
    (t) => document.body?.innerText?.includes(t),
    { timeout },
    text,
  );
}

async function clickByText(page, text, { exact = false } = {}) {
  const clicked = await page.evaluate(
    (t, exactMatch) => {
      const nodes = Array.from(
        document.querySelectorAll('button, a, [role="tab"], [role="button"], label'),
      );
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

async function setInputByLabel(page, labelText, value) {
  return page.evaluate(
    (label, val) => {
      const labels = Array.from(document.querySelectorAll('label'));
      const lab = labels.find((l) => (l.textContent || '').includes(label));
      if (!lab) return { ok: false, reason: `label miss ${label}` };
      const item = lab.closest('.space-y-2, [class*="FormItem"], div') || lab.parentElement;
      const input = item?.querySelector('input, textarea');
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
    labelText,
    value,
  );
}

async function main() {
  mkdirSync(dirname(OUT), { recursive: true });
  const session = await loginApi();
  note('api-login', true, `ceo@xe.vn token ok via ${session.loginUrl}`);

  const authHeaders = {
    Authorization: `Bearer ${session.token}`,
    'x-tenant-id': 'xevn',
    'x-company-id': 'main',
    accept: 'application/json',
  };

  const apiBase = async (path, init = {}) => {
    const urls = [`${HRM_API}${path}`, `${PORTAL}${path}`, `${HRM_FE}${path}`];
    let last = null;
    for (const url of urls) {
      try {
        const res = await fetch(url, {
          ...init,
          headers: { ...authHeaders, ...(init.headers || {}) },
        });
        return { res, url };
      } catch (e) {
        last = e;
      }
    }
    throw last || new Error('all api bases failed');
  };

  // --- L1 spot: invent-only reject (missing/invalid position_code) ---
  async function readJsonSafe(res) {
    const text = await res.text();
    if (!text) return {};
    try {
      return JSON.parse(text);
    } catch {
      return { _raw: text.slice(0, 200) };
    }
  }
  const inventRes = await fetch(`${HRM_API}/api/hrm/recruitment/job-templates?company_id=main`, {
    method: 'POST',
    headers: { ...authHeaders, 'content-type': 'application/json' },
    body: JSON.stringify({
      company_id: 'main',
      code: `JD-INVENT-${Date.now().toString(36).slice(-5).toUpperCase()}`,
      title: 'Invent-only free SoT',
      position_name: 'Fake Role Invent',
      // omit position_code → BE must 400 HRM-REC-JD-POS (not invent free SoT)
    }),
  });
  const inventBody = await readJsonSafe(inventRes);
  const inventCode = String(inventBody?.code || inventBody?.error?.code || '');
  const inventMsg = String(inventBody?.message || inventBody?.error?.message || '');
  const inventOk =
    inventRes.status === 400 &&
    (inventCode.includes('JD-POS') ||
      inventCode === 'HRM-REC-JD-POS' ||
      /position_code|job_titles|catalog|required/i.test(inventMsg));
  note(
    'api-invent-reject',
    inventOk,
    `HTTP ${inventRes.status} code=${inventCode || '?'} msg=${inventMsg.slice(0, 160)}`,
  );
  results.verdicts.inventReject = inventOk ? 'PASS' : 'FAIL';

  // Invalid invent code (explicit fake code)
  const inventFakeRes = await fetch(`${HRM_API}/api/hrm/recruitment/job-templates?company_id=main`, {
    method: 'POST',
    headers: { ...authHeaders, 'content-type': 'application/json' },
    body: JSON.stringify({
      company_id: 'main',
      code: `JD-FAKE-${Date.now().toString(36).slice(-5).toUpperCase()}`,
      title: 'Fake catalog code',
      position_code: 'ZZZ_INVENT_ONLY_NOT_IN_CATALOG',
      position_name: 'Should reject',
    }),
  });
  const inventFakeBody = await readJsonSafe(inventFakeRes);
  const inventFakeOk =
    inventFakeRes.status === 400 &&
    (String(inventFakeBody?.code || '').includes('JD-POS') ||
      /not in job_titles|catalog|position_code/i.test(String(inventFakeBody?.message || '')));
  note(
    'api-invent-fake-code',
    inventFakeOk,
    `HTTP ${inventFakeRes.status} code=${inventFakeBody?.code || '?'} msg=${String(inventFakeBody?.message || '').slice(0, 120)}`,
  );
  results.verdicts.inventFakeCode = inventFakeOk ? 'PASS' : 'FAIL';

  // Catalog baseline (job_titles)
  const catRes = await fetch(`${HRM_API}/api/hrm/settings-catalogs?company_id=main`, {
    headers: authHeaders,
  });
  const catBody = await readJsonSafe(catRes);
  note('settings-catalogs', catRes.ok, `HTTP ${catRes.status}`);
  const catalogs = catBody?.data?.catalogs ?? catBody?.data ?? [];
  const jtRow = catalogs.find((c) => (c.catalogKey || c.key) === 'job_titles');
  const activeTitles = (jtRow?.effectiveItems || []).filter(
    (i) => !i.status || i.status === 'active',
  );
  const pick =
    activeTitles.find((i) => i.code === 'CHRO') ||
    activeTitles.find((i) => i.code === 'OPS_MANAGER') ||
    activeTitles[0];
  note(
    'job-titles-baseline',
    !!pick,
    `active=${activeTitles.length} pick=${pick?.code || 'NONE'} (${pick?.label || ''})`,
  );
  if (!pick) {
    results.verdicts.createUf = 'BLOCKED';
    results.finishedAt = new Date().toISOString();
    writeFileSync(OUT, JSON.stringify(results, null, 2));
    console.error('BLOCKED: no active job_titles — cannot create JD from catalog');
    process.exit(2);
  }

  const stamp = `QA-JT-${Date.now().toString(36).slice(-6).toUpperCase()}`;
  const jdCode = `JD-${stamp}`;
  const jdTitle = `QA JT catalog ${stamp}`;

  const chromePath =
    process.env.PUPPETEER_EXECUTABLE_PATH ||
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  console.log('Launching Chromium…');
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: chromePath,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--window-size=1440,900'],
    defaultViewport: { width: 1440, height: 900 },
  });
  console.log('Chromium ready');
  const page = await browser.newPage();
  page.setDefaultTimeout(45000);

  const postCaptures = [];
  page.on('request', (req) => {
    try {
      const u = req.url();
      if (req.method() === 'POST' && /\/api\/hrm\/recruitment\/job-templates/.test(u)) {
        let body = null;
        const raw = req.postData() || '';
        try {
          body = raw ? JSON.parse(raw) : {};
        } catch {
          body = { raw: raw.slice(0, 200) };
        }
        postCaptures.push({ url: u, body, at: new Date().toISOString() });
      }
    } catch {
      /* ignore */
    }
  });
  const catalogNet = [];
  page.on('response', (res) => {
    try {
      const u = res.url();
      if (/settings-catalogs|job-templates/.test(u)) {
        catalogNet.push({
          method: res.request().method(),
          status: res.status(),
          url: u.slice(0, 160),
        });
      }
      if (!/\/api\/hrm\/recruitment\/job-templates/.test(u)) return;
      const method = res.request().method();
      results.network.push({
        method,
        status: res.status(),
        url: u.replace(PORTAL, '').replace('http://127.0.0.1:28001', '').replace(HRM_FE, ''),
        requestBody: method === 'POST' || method === 'PATCH' ? postCaptures.at(-1)?.body : undefined,
      });
    } catch {
      /* ignore */
    }
  });
  results.catalogNet = catalogNet;

  await injectSession(page, session);
  page.on('pageerror', (err) => console.warn('pageerror', err?.message || err));
  page.on('error', (err) => console.warn('page error', err?.message || err));

  const recUrl = `${HRM_FE}/hr/recruitment?portal=1&tenantId=xevn&companyId=main`;

  // ========== A) Happy path FIRST (avoid RQ cache pollution from empty intercept) ==========
  console.log('Goto recruitment (happy path)…');
  await page.goto(recUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
  note('goto-recruitment-create', true, recUrl);
  await waitText(page, 'Tuyển', 30000).catch(() => waitText(page, 'JD', 10000));
  await new Promise((r) => setTimeout(r, 800));
  try {
    await clickByText(page, 'Thư viện JD');
  } catch {
    try {
      await clickByText(page, 'Thư viện');
    } catch {
      await clickByText(page, 'JD');
    }
  }
  await new Promise((r) => setTimeout(r, 1000));
  await clickByText(page, 'Thêm JD');
  // Wait for catalog combobox (not amber empty)
  await page
    .waitForFunction(
      () => {
        const dialog = document.querySelector('[role="dialog"]');
        if (!dialog) return false;
        const combo = dialog.querySelector('button[role="combobox"]');
        const amber = /Chưa có mục trong danh mục/.test(dialog.innerText || '');
        return !!combo || amber;
      },
      { timeout: 20000 },
    )
    .catch(() => {});
  await new Promise((r) => setTimeout(r, 500));

  const fillCode = await setInputByLabel(page, 'Mã JD', jdCode);
  const fillTitle = await setInputByLabel(page, 'Tiêu đề', jdTitle);
  note('form-fill-text', fillCode.ok && fillTitle.ok, JSON.stringify({ fillCode, fillTitle }));

  // Open chức danh picker inside dialog (not OU filter combobox)
  const pickerOpened = await page.evaluate(() => {
    const dialog =
      document.querySelector('[role="dialog"]') ||
      document.querySelector('[data-radix-dialog-content]');
    const root = dialog || document.body;
    const combos = Array.from(root.querySelectorAll('button[role="combobox"]'));
    const btn =
      combos.find((b) =>
        /chức danh|chọn chức danh|Cài đặt|danh mục/i.test(
          `${b.getAttribute('aria-label') || ''} ${b.textContent || ''}`,
        ),
      ) ||
      combos.find((b) => !/đơn vị|rollup|Tất cả/i.test(b.textContent || '')) ||
      combos[0];
    if (!btn) {
      return {
        ok: false,
        count: combos.length,
        dialogSnippet: (root.innerText || '').slice(0, 400),
      };
    }
    btn.click();
    return { ok: true, count: combos.length, text: (btn.textContent || '').slice(0, 60) };
  });
  note('picker-open', pickerOpened.ok, JSON.stringify(pickerOpened));
  await new Promise((r) => setTimeout(r, 700));

  const picked = await page.evaluate((code, label) => {
    const items = Array.from(document.querySelectorAll('[cmdk-item], [data-slot="command-item"]'));
    const byValue = items.find(
      (o) =>
        o.getAttribute('data-value') === code ||
        o.getAttribute('value') === code,
    );
    const byText = items.find((o) => {
      const t = (o.textContent || '').replace(/\s+/g, ' ').trim();
      return t.startsWith(code) || (label && t.includes(label) && t.includes(code));
    });
    const el = byValue || byText;
    if (!el) {
      return {
        ok: false,
        reason: 'no position cmdk item',
        count: items.length,
        sample: items.slice(0, 6).map((o) => ({
          value: o.getAttribute('data-value'),
          text: (o.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60),
        })),
      };
    }
    el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    el.click();
    return {
      ok: true,
      via: byValue ? 'data-value' : 'text',
      text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80),
      value: el.getAttribute('data-value'),
      count: items.length,
    };
  }, pick.code, pick.label || '');
  note('picker-select', !!(picked.ok && picked.value === pick.code), JSON.stringify(picked));
  await new Promise((r) => setTimeout(r, 600));

  // Verify trigger shows selected code
  const triggerAfter = await page.evaluate((code) => {
    const dialog = document.querySelector('[role="dialog"]');
    const combo = dialog?.querySelector('button[role="combobox"]');
    const t = (combo?.textContent || '').replace(/\s+/g, ' ').trim();
    return { text: t.slice(0, 80), hasCode: t.includes(code) };
  }, pick.code);
  note('picker-trigger', triggerAfter.hasCode, JSON.stringify(triggerAfter));

  // If not selected, type into CommandInput and click item
  if (!triggerAfter.hasCode) {
    await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]') || document.body;
      const btn = dialog.querySelector('button[role="combobox"]');
      if (btn) btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    await new Promise((r) => setTimeout(r, 400));
    const input = await page.$('[cmdk-input], input[placeholder*="Tìm"]');
    if (input) {
      await input.click({ clickCount: 3 });
      await page.keyboard.type(pick.code, { delay: 30 });
      await new Promise((r) => setTimeout(r, 400));
      await page.evaluate((code) => {
        const el =
          document.querySelector(`[cmdk-item][data-value="${code}"]`) ||
          Array.from(document.querySelectorAll('[cmdk-item]')).find((n) =>
            (n.textContent || '').includes(code),
          );
        if (!el) return;
        el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
        el.click();
      }, pick.code);
      await new Promise((r) => setTimeout(r, 400));
    }
  }

  let saveState = await page.evaluate(() => {
    const submit = Array.from(document.querySelectorAll('button')).find((b) =>
      /Lưu JD/.test((b.textContent || '').trim()),
    );
    return {
      found: !!submit,
      disabled: submit?.disabled ?? null,
      text: submit?.textContent?.trim(),
    };
  });
  // Re-check after retry select
  if (saveState.disabled) {
    await page.evaluate((code) => {
      const dialog = document.querySelector('[role="dialog"]') || document.body;
      const btn = dialog.querySelector('button[role="combobox"]');
      if (btn) btn.click();
      setTimeout(() => {
        const el = document.querySelector(`[cmdk-item][data-value="${code}"]`);
        if (el) el.click();
      }, 300);
    }, pick.code);
    await new Promise((r) => setTimeout(r, 800));
    saveState = await page.evaluate(() => {
      const submit = Array.from(document.querySelectorAll('button')).find((b) =>
        /Lưu JD/.test((b.textContent || '').trim()),
      );
      return {
        found: !!submit,
        disabled: submit?.disabled ?? null,
        text: submit?.textContent?.trim(),
      };
    });
  }
  note('save-enabled', saveState.found && saveState.disabled === false, JSON.stringify(saveState));

  if (saveState.found && !saveState.disabled) {
    await clickByText(page, 'Lưu JD', { exact: true }).catch(() => clickByText(page, 'Lưu JD'));
  } else {
    note('save-click', false, 'Lưu JD still disabled — cannot submit');
  }

  await page
    .waitForFunction(
      (code) => {
        const t = document.body?.innerText || '';
        return t.includes('Đã tạo JD') || t.includes('Không tạo được') || t.includes(code);
      },
      { timeout: 20000 },
      jdCode,
    )
    .catch(() => {});
  await new Promise((r) => setTimeout(r, 1500));

  const postHits = results.network.filter((n) => n.method === 'POST');
  const goodPost = postHits.find(
    (n) =>
      n.status >= 200 &&
      n.status < 300 &&
      n.requestBody &&
      typeof n.requestBody.position_code === 'string' &&
      n.requestBody.position_code.length > 0,
  );
  const createOk = !!goodPost;
  note(
    'create-post-position-code',
    createOk,
    goodPost
      ? `HTTP ${goodPost.status} position_code=${goodPost.requestBody.position_code} code=${goodPost.requestBody.code}`
      : `posts=${JSON.stringify(postHits)} captures=${JSON.stringify(postCaptures)}`,
  );
  results.verdicts.createWithPositionCode = createOk ? 'PASS' : 'FAIL';
  results.createPayload = goodPost?.requestBody || postCaptures.at(-1)?.body || null;

  // ========== B) F5 persistence ==========
  await page.reload({ waitUntil: 'domcontentloaded' });
  await new Promise((r) => setTimeout(r, 1200));
  try {
    await clickByText(page, 'Thư viện JD');
  } catch {
    await clickByText(page, 'Thư viện');
  }
  await new Promise((r) => setTimeout(r, 1000));
  const afterF5 = await page.evaluate((code, title, posCode) => {
    const t = document.body.innerText;
    return {
      hasCode: t.includes(code),
      hasTitle: t.includes(title),
      hasPosCode: t.includes(posCode),
    };
  }, jdCode, jdTitle, pick.code);
  const f5Ok = afterF5.hasCode && afterF5.hasTitle;
  note(
    'f5-row-persists',
    f5Ok,
    `code=${afterF5.hasCode} title=${afterF5.hasTitle} posCodeVisible=${afterF5.hasPosCode}`,
  );
  results.verdicts.f5Persist = f5Ok ? 'PASS' : 'FAIL';

  // API confirm row has position_code
  const listRes = await fetch(`${HRM_API}/api/hrm/recruitment/job-templates?company_id=main`, {
    headers: authHeaders,
  });
  const listBody = await readJsonSafe(listRes);
  const rows = listBody?.data?.data ?? listBody?.data ?? [];
  const created = Array.isArray(rows) ? rows.find((r) => r.code === jdCode) : null;
  const expectedCode = goodPost?.requestBody?.position_code || pick.code;
  const apiRowOk = !!created && created.position_code === expectedCode;
  note(
    'api-row-position-code',
    apiRowOk,
    created
      ? `id=${created.id} position_code=${created.position_code} position_name=${created.position_name}`
      : `row missing among ${Array.isArray(rows) ? rows.length : 0}`,
  );
  results.verdicts.apiRowPositionCode = apiRowOk ? 'PASS' : 'FAIL';
  results.createdRow = created || null;

  // ========== C) Empty job_titles on FRESH page (RQ cache isolation) ==========
  const emptyPage = await browser.newPage();
  emptyPage.setDefaultTimeout(45000);
  await injectSession(emptyPage, session);
  await emptyPage.setRequestInterception(true);
  const emptyHandler = async (req) => {
    try {
      if (req.method() === 'GET' && /\/api\/hrm\/settings-catalogs/.test(req.url())) {
        const upstream = await fetch(req.url(), { headers: authHeaders });
        const text = await upstream.text();
        let json = {};
        try {
          json = text ? JSON.parse(text) : {};
        } catch {
          return req.respond({
            status: 502,
            contentType: 'application/json',
            body: JSON.stringify({ success: false }),
          });
        }
        const stripped = stripCatalogItems(json, ['job_titles', 'positions', 'employee_positions']);
        return req.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(stripped),
        });
      }
      return req.continue();
    } catch (err) {
      console.warn('emptyHandler', err?.message || err);
      try {
        return req.continue();
      } catch {
        /* ignore */
      }
    }
  };
  emptyPage.on('request', emptyHandler);
  await emptyPage.goto(recUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
  note('goto-recruitment-empty', true, 'fresh page + intercept');
  await waitText(emptyPage, 'Tuyển', 30000).catch(() => {});
  await new Promise((r) => setTimeout(r, 800));
  try {
    await clickByText(emptyPage, 'Thư viện JD');
  } catch {
    await clickByText(emptyPage, 'Thư viện');
  }
  await new Promise((r) => setTimeout(r, 800));
  await clickByText(emptyPage, 'Thêm JD');
  await new Promise((r) => setTimeout(r, 1500));
  const emptyUi = await emptyPage.evaluate(() => {
    const t = document.body.innerText;
    const amber = !!document.querySelector('.border-amber-200, .bg-amber-50');
    const cta =
      t.includes('Chưa có mục trong danh mục') ||
      t.includes('Mở Cài đặt') ||
      t.includes('Danh mục nghiệp vụ');
    const submit = Array.from(document.querySelectorAll('button')).find((b) =>
      /Lưu JD|Lưu thay đổi/.test((b.textContent || '').trim()),
    );
    return {
      amber,
      cta,
      saveDisabled: submit ? submit.disabled : null,
      hasDialog: t.includes('Thêm JD template'),
    };
  });
  const emptyOk = emptyUi.cta && emptyUi.saveDisabled === true;
  note(
    'empty-job-titles-cta',
    emptyOk,
    `amber=${emptyUi.amber} cta=${emptyUi.cta} saveDisabled=${emptyUi.saveDisabled} dialog=${emptyUi.hasDialog}`,
  );
  results.verdicts.emptyCatalogCta = emptyOk ? 'PASS' : 'FAIL';
  await emptyPage.close();

  await browser.close();

  const requiredPass =
    results.verdicts.createWithPositionCode === 'PASS' &&
    results.verdicts.f5Persist === 'PASS' &&
    results.verdicts.apiRowPositionCode === 'PASS' &&
    results.verdicts.emptyCatalogCta === 'PASS';

  results.overall = requiredPass ? 'PASS' : 'FAIL';
  results.finishedAt = new Date().toISOString();
  writeFileSync(OUT, JSON.stringify(results, null, 2));
  console.log(`\n=== OVERALL ${results.overall} ===`);
  console.log(`runtime: ${OUT}`);
  process.exit(requiredPass ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  results.overall = 'ERROR';
  results.error = String(err?.stack || err);
  results.finishedAt = new Date().toISOString();
  try {
    writeFileSync(OUT, JSON.stringify(results, null, 2));
  } catch {
    /* ignore */
  }
  process.exit(1);
});
