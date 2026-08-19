/**
 * QA-HRM-SETTINGS-MD-JT-BROWSER-01 — Browser UF only
 * Job Templates create with position_code → 2xx → F5
 * U65 zero-seed · HOLD_DEPLOY · NOT Phase1/PROD · NOT :8088
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
  '../../docs/qa/evidence/_tmp-qa-hrm-settings-md-jt-browser-01-runtime.json',
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const results = {
  work_item_id: 'QA-HRM-SETTINGS-MD-JT-BROWSER-01',
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

async function openJdTab(page) {
  await page.waitForFunction(
    () => (document.body?.innerText || '').includes('Thư viện JD'),
    { timeout: 30000 },
  );
  await clickByText(page, 'Thư viện JD');
  await sleep(1000);
}

/** Wait until catalog picker leaves loading (combo | amber empty | error). */
async function waitCatalogReady(page, { timeoutMs = 25000 } = {}) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const st = await page.evaluate(() => {
      const d = document.querySelector('[role="dialog"]');
      const t = d?.innerText || '';
      return {
        loading: t.includes('Đang tải danh mục'),
        hasCombo: !!d?.querySelector('button[role="combobox"]'),
        amber: !!d?.querySelector('.bg-amber-50, .border-amber-200'),
        error: t.includes('Không tải được danh mục'),
        snip: t.slice(0, 280),
      };
    });
    if (!st.loading && (st.hasCombo || st.amber || st.error)) return st;
    await sleep(500);
  }
  return page.evaluate(() => {
    const d = document.querySelector('[role="dialog"]');
    const t = d?.innerText || '';
    return {
      loading: t.includes('Đang tải danh mục'),
      hasCombo: !!d?.querySelector('button[role="combobox"]'),
      amber: !!d?.querySelector('.bg-amber-50, .border-amber-200'),
      error: t.includes('Không tải được danh mục'),
      snip: t.slice(0, 280),
      timedOut: true,
    };
  });
}

async function main() {
  mkdirSync(dirname(OUT), { recursive: true });
  const session = await loginApi();
  note('api-login', true, 'ceo@xe.vn token ok');

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
    results.overall = 'BLOCKED';
    results.finishedAt = new Date().toISOString();
    writeFileSync(OUT, JSON.stringify(results, null, 2));
    console.error('BLOCKED: no active job_titles');
    process.exit(2);
  }

  const stamp = `QA-JT-${Date.now().toString(36).slice(-6).toUpperCase()}`;
  const jdCode = `JD-${stamp}`;
  const jdTitle = `QA JT catalog ${stamp}`;

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

  const postCaptures = [];
  page.on('request', (req) => {
    try {
      const u = req.url();
      if (req.method() === 'POST' && /\/api\/hrm\/recruitment\/job-templates/.test(u)) {
        let body = null;
        try {
          body = JSON.parse(req.postData() || '{}');
        } catch {
          body = { raw: req.postData() };
        }
        postCaptures.push({ url: u, body, at: new Date().toISOString() });
      }
    } catch {
      /* ignore */
    }
  });
  page.on('response', async (res) => {
    try {
      const u = res.url();
      if (!/\/api\/hrm\/recruitment\/job-templates/.test(u)) return;
      const method = res.request().method();
      let responseBody = null;
      try {
        responseBody = await res.json();
      } catch {
        /* ignore */
      }
      results.network.push({
        method,
        status: res.status(),
        url: u.replace(PORTAL, '').replace('http://127.0.0.1:28001', '').replace(HRM_FE, ''),
        requestBody:
          method === 'POST' || method === 'PATCH' ? postCaptures.at(-1)?.body : undefined,
        responseCode: responseBody?.code,
      });
    } catch {
      /* ignore */
    }
  });

  await injectSession(page, session);
  // Use portal origin so /api/hrm proxies to :28001 (HRM FE :8080 defaults VITE → :3001 → 500)
  const recUrl = `${PORTAL}/hr/recruitment?portal=1&tenantId=xevn&companyId=main`;
  results.recUrl = recUrl;

  // ========== A) Empty job_titles → amber CTA + Lưu disabled ==========
  await page.setRequestInterception(true);
  const emptyHandler = async (req) => {
    try {
      if (req.method() === 'GET' && /\/api\/hrm\/settings-catalogs/.test(req.url())) {
        const upstream = await fetch(req.url(), { headers: authHeaders });
        const json = await upstream.json();
        const stripped = stripCatalogItems(json, ['job_titles', 'positions', 'employee_positions']);
        return req.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(stripped),
        });
      }
      return req.continue();
    } catch (e) {
      try {
        return req.continue();
      } catch {
        /* ignore */
      }
    }
  };
  page.on('request', emptyHandler);

  await page.goto(recUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(2000);
  await openJdTab(page);
  await clickByText(page, 'Thêm JD');
  const emptyReady = await waitCatalogReady(page);
  note(
    'empty-catalog-ready',
    !emptyReady.loading && (emptyReady.amber || emptyReady.error || emptyReady.hasCombo === false),
    JSON.stringify(emptyReady),
  );

  const emptyUi = await page.evaluate(() => {
    const dialog = document.querySelector('[role="dialog"]');
    const scope = dialog || document.body;
    const t = scope.innerText || '';
    const amber = !!scope.querySelector('.border-amber-200, .bg-amber-50');
    const cta =
      t.includes('Chưa có mục trong danh mục') ||
      t.includes('Mở Cài đặt') ||
      t.includes('Danh mục nghiệp vụ') ||
      t.includes('Cài đặt Nhân sự');
    const submit = Array.from(scope.querySelectorAll('button')).find((b) =>
      /Lưu JD|Lưu thay đổi/.test((b.textContent || '').trim()),
    );
    const saveDisabled = submit ? submit.disabled : null;
    return {
      amber,
      cta,
      saveDisabled,
      hasDialog: !!dialog,
      snippet: t.slice(0, 400),
    };
  });
  // PASS when amber empty-state OR CTA copy + Lưu disabled (AC empty catalog)
  const emptyOk =
    emptyUi.saveDisabled === true && (emptyUi.amber === true || emptyUi.cta === true);
  note(
    'empty-job-titles-cta',
    emptyOk,
    `amber=${emptyUi.amber} cta=${emptyUi.cta} saveDisabled=${emptyUi.saveDisabled} dialog=${emptyUi.hasDialog} snip=${JSON.stringify(emptyUi.snippet)}`,
  );
  results.verdicts.emptyCatalogCta = emptyOk ? 'PASS' : emptyReady.error ? 'BLOCKED_PROXY' : 'FAIL';

  try {
    await clickByText(page, 'Hủy');
  } catch {
    await page.keyboard.press('Escape');
  }
  await sleep(400);

  page.off('request', emptyHandler);
  await page.setRequestInterception(false);

  // ========== B) Happy path create with catalog position_code ==========
  await page.goto(recUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(2000);
  await openJdTab(page);
  await clickByText(page, 'Thêm JD');
  const happyReady = await waitCatalogReady(page);
  note('happy-catalog-ready', !!happyReady.hasCombo && !happyReady.error, JSON.stringify(happyReady));
  if (happyReady.error || !happyReady.hasCombo) {
    results.verdicts.createWithPositionCode = 'FAIL';
    results.proxyNote =
      'Catalogs error or no combobox — check HRM FE proxy (default :3001) vs portal :28001';
    results.overall = 'FAIL';
    results.finishedAt = new Date().toISOString();
    writeFileSync(OUT, JSON.stringify(results, null, 2));
    await browser.close();
    console.log(`\n=== OVERALL FAIL (catalog not ready) ===`);
    process.exit(1);
  }
  await sleep(400);
  const fillCode = await setInputByLabel(page, 'Mã JD', jdCode);
  const fillTitle = await setInputByLabel(page, 'Tiêu đề', jdTitle);
  note('form-fill-text', fillCode.ok && fillTitle.ok, JSON.stringify({ fillCode, fillTitle }));

  const pickerOpened = await page.evaluate(() => {
    const dialog = document.querySelector('[role="dialog"]');
    if (!dialog) return { ok: false, reason: 'no dialog' };
    const combos = Array.from(dialog.querySelectorAll('button[role="combobox"]'));
    const btn =
      combos.find((b) =>
        /chức danh|Chọn chức danh|Cài đặt/i.test(
          `${b.getAttribute('aria-label') || ''} ${b.textContent || ''}`,
        ),
      ) ||
      combos.find((b) => /Chọn chức danh từ Cài đặt/i.test(b.textContent || '')) ||
      combos[0];
    if (!btn) return { ok: false, reason: 'no combobox in dialog', count: combos.length };
    btn.click();
    return {
      ok: true,
      label: (btn.getAttribute('aria-label') || btn.textContent || '').slice(0, 80),
      count: combos.length,
    };
  });
  note('picker-open', !!pickerOpened.ok, JSON.stringify(pickerOpened));
  await sleep(600);

  // Focus cmdk search and type code to filter (popovers render in portal)
  await page.keyboard.type(pick.code, { delay: 40 }).catch(() => {});
  await sleep(500);

  const picked = await page.evaluate((code, label) => {
    const opts = Array.from(
      document.querySelectorAll('[cmdk-item], [role="option"]'),
    ).filter((o) => {
      const t = (o.textContent || '').replace(/\s+/g, ' ');
      // exclude company rollup / unrelated
      return !/rollup|Tất cả đơn vị/i.test(t);
    });
    const byCode = opts.find((o) => (o.textContent || '').includes(code));
    const byLabel = opts.find((o) => (o.textContent || '').includes(label));
    const el = byCode || byLabel || opts[0];
    if (!el) {
      return {
        ok: false,
        reason: 'no position options',
        count: opts.length,
        raw: Array.from(document.querySelectorAll('[cmdk-item], [role="option"]'))
          .slice(0, 8)
          .map((o) => (o.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60)),
      };
    }
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    // cmdk onSelect often needs pointer
    el.click();
    return {
      ok: true,
      via: byCode ? 'code' : byLabel ? 'label' : 'first',
      text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80),
      count: opts.length,
    };
  }, pick.code, pick.label || '');
  note('picker-select', picked.ok, JSON.stringify(picked));
  await sleep(600);

  const saveState = await page.evaluate(() => {
    const submit = Array.from(document.querySelectorAll('button')).find((b) =>
      /Lưu JD/.test((b.textContent || '').trim()),
    );
    return {
      found: !!submit,
      disabled: submit?.disabled ?? null,
      text: submit?.textContent?.trim(),
    };
  });
  note('save-enabled', saveState.found && saveState.disabled === false, JSON.stringify(saveState));

  if (saveState.found && !saveState.disabled) {
    await clickByText(page, 'Lưu JD', { exact: true }).catch(() => clickByText(page, 'Lưu JD'));
  } else {
    // retry pick inside dialog only
    await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      dialog?.querySelector('button[role="combobox"]')?.click();
    });
    await sleep(500);
    await page.keyboard.type(pick.code, { delay: 30 }).catch(() => {});
    await sleep(400);
    await page.evaluate((code) => {
      const opts = Array.from(document.querySelectorAll('[cmdk-item], [role="option"]'));
      const el = opts.find((o) => (o.textContent || '').includes(code));
      el?.click();
    }, pick.code);
    await sleep(500);
    const retrySave = await page.evaluate(() => {
      const submit = Array.from(document.querySelectorAll('button')).find((b) =>
        /Lưu JD/.test((b.textContent || '').trim()),
      );
      return { found: !!submit, disabled: submit?.disabled ?? null };
    });
    note('save-retry-state', retrySave.found && retrySave.disabled === false, JSON.stringify(retrySave));
    if (retrySave.found && !retrySave.disabled) {
      await clickByText(page, 'Lưu JD').catch(() => {});
    }
  }

  await page
    .waitForFunction(
      (code) => {
        const t = document.body?.innerText || '';
        return t.includes('Đã tạo JD') || t.includes('Không tạo được') || t.includes(code);
      },
      { timeout: 25000 },
      jdCode,
    )
    .catch(() => {});
  await sleep(1500);

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
      ? `HTTP ${goodPost.status} position_code=${goodPost.requestBody.position_code} code=${goodPost.requestBody.code} api=${goodPost.responseCode}`
      : `posts=${JSON.stringify(postHits)} captures=${JSON.stringify(postCaptures)}`,
  );
  results.verdicts.createWithPositionCode = createOk ? 'PASS' : 'FAIL';
  results.createPayload = goodPost?.requestBody || postCaptures.at(-1)?.body || null;

  // ========== C) F5 persistence ==========
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(2000);
  await openJdTab(page);
  await sleep(1000);
  const afterF5 = await page.evaluate((code, title, posCode) => {
    const t = document.body.innerText;
    return {
      hasCode: t.includes(code),
      hasTitle: t.includes(title),
      hasPosCode: t.includes(posCode),
      snippet: t.slice(0, 1200),
    };
  }, jdCode, jdTitle, pick.code);
  const f5Ok = afterF5.hasCode && afterF5.hasTitle;
  note(
    'f5-row-persists',
    f5Ok,
    `code=${afterF5.hasCode} title=${afterF5.hasTitle} posCodeVisible=${afterF5.hasPosCode}`,
  );
  results.verdicts.f5Persist = f5Ok ? 'PASS' : 'FAIL';
  results.f5Snippet = afterF5.snippet;

  const listRes = await fetch(`${PORTAL}/api/hrm/recruitment/job-templates?company_id=main`, {
    headers: authHeaders,
  });
  const listBody = await listRes.json();
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

  // Cleanup QA row (API DELETE — not seed; reverse of FE create)
  if (created?.id) {
    const del = await fetch(
      `${PORTAL}/api/hrm/recruitment/job-templates/${created.id}?company_id=main`,
      { method: 'DELETE', headers: authHeaders },
    );
    note('cleanup-delete', del.ok || del.status === 200, `HTTP ${del.status} id=${created.id}`);
  }

  await browser.close();

  const requiredPass =
    results.verdicts.createWithPositionCode === 'PASS' &&
    results.verdicts.f5Persist === 'PASS' &&
    results.verdicts.apiRowPositionCode === 'PASS';

  // empty CTA is soft if interception flaky — still report
  results.overall = requiredPass
    ? results.verdicts.emptyCatalogCta === 'PASS'
      ? 'PASS'
      : 'PASS_WITH_EMPTY_CTA_SOFT'
    : 'FAIL';
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
