/**
 * QA-HRM-SETTINGS-MD-POS-BROWSER-01 — Settings Chức danh (positions→job_titles)
 * AC-SET-FS-01/03/05 · FR-HRM-SC-POS-01 / FR-HRM-SC-MD-01
 * U65 zero-seed · HOLD_DEPLOY · NOT Phase1/PROD · NOT :8088
 * Do NOT reopen POS-SEED (expect 403 HRM-CAT-POS-SEED-FORBIDDEN)
 * Origin: portal :5173/hr (proxy → :28001)
 */
import puppeteer from 'puppeteer';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM_API = process.env.HRM_API_URL || 'http://127.0.0.1:28001/api/hrm';
const EMAIL = 'ceo@xe.vn';
const PASSWORD = 'Xevn@2026';
const OUT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../docs/qa/evidence/_tmp-qa-hrm-settings-md-pos-browser-01-runtime.json',
);
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const results = {
  work_item_id: 'QA-HRM-SETTINGS-MD-POS-BROWSER-01',
  startedAt: new Date().toISOString(),
  origin: PORTAL,
  steps: [],
  verdicts: {},
  network: [],
  sot_note:
    'Settings UI bucket Chức danh (MdBucket=positions) writeKey=job_titles — NOT N/A JT-only; JT consumer closed separately',
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
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
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
      return {
        ok: true,
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
    /* */
  }
  await sleep(1000);
}

async function clickSaveInForm(page, bucket) {
  return page.evaluate((b) => {
    const btn =
      document.querySelector(`[data-testid="md-save-${b}"]`) ||
      (() => {
        const form = document.querySelector(`[data-testid="md-upsert-form-${b}"]`);
        const scope = form || document.body;
        return Array.from(scope.querySelectorAll('button')).find((el) =>
          /^Lưu$/.test((el.textContent || '').replace(/\s+/g, ' ').trim()),
        );
      })();
    if (!btn) return { ok: false, reason: 'no Lưu' };
    btn.click();
    return { ok: true, disabled: btn.disabled };
  }, bucket);
}

async function main() {
  for (const [name, url] of [
    ['hrm', `${HRM_API}`],
    ['portal', PORTAL],
    ['xbos', 'http://127.0.0.1:28002/api/xbos'],
  ]) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
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

  // POS-SEED must stay 403 — do not reopen
  const seedRes = await fetch(
    `${HRM_API}/settings-catalogs/seed/tenant-position-catalog`,
    { method: 'POST', headers: { ...authHeaders, 'content-type': 'application/json' }, body: '{}' },
  );
  let seedBody = {};
  try {
    seedBody = await seedRes.json();
  } catch {
    /* */
  }
  const seedCode =
    seedBody?.error?.code || seedBody?.code || seedBody?.data?.code || '';
  const seedOk = seedRes.status === 403 && String(seedCode).includes('POS-SEED');
  note(
    'pos-seed-403',
    seedOk || seedRes.status === 403,
    `HTTP ${seedRes.status} code=${seedCode || JSON.stringify(seedBody).slice(0, 180)}`,
  );
  results.verdicts.posSeedForbidden =
    seedOk || seedRes.status === 403 ? 'PASS' : 'FAIL';

  const catRes = await fetch(`${PORTAL}/api/hrm/settings-catalogs?company_id=main`, {
    headers: authHeaders,
  });
  const catBody = await catRes.json();
  note('settings-catalogs-get', catRes.ok, `HTTP ${catRes.status}`);
  const catalogs = catBody?.data?.catalogs ?? catBody?.data ?? [];
  const jtRow = catalogs.find((c) => (c.catalogKey || c.key) === 'job_titles');
  const posRow = catalogs.find((c) => (c.catalogKey || c.key) === 'positions');
  const jtN = (jtRow?.effectiveItems || []).length;
  const posN = (posRow?.effectiveItems || []).length;
  note('catalog-baseline', true, `job_titles=${jtN} positions=${posN}`);

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--window-size=1440,900'],
    defaultViewport: { width: 1440, height: 900 },
  });
  const page = await browser.newPage();
  page.setDefaultTimeout(45000);

  page.on('response', async (res) => {
    const u = res.url();
    if (/\/api\/hrm\/settings-catalogs/.test(u)) {
      let postBody = null;
      try {
        if (res.request().method() === 'POST') {
          postBody = res.request().postData()?.slice(0, 400) || null;
        }
      } catch {
        /* */
      }
      results.network.push({
        method: res.request().method(),
        status: res.status(),
        url: u.replace(/https?:\/\/[^/]+/, ''),
        postBody,
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

  // ---- AC: Chức danh form visible → Lưu → POST 2xx writeKey job_titles → F5 ----
  const posCode = `QA_POS_${Date.now().toString(36).slice(-6).toUpperCase()}`;
  const posLabel = `Chức danh QA ${posCode}`;
  await openSettingsBucket(page, 'Chức danh');
  const posDom = await page.evaluate(() => {
    const el = document.querySelector('#md-code-positions');
    const form = document.querySelector('[data-testid="md-upsert-form-positions"]');
    const bucket = document.querySelector('[data-testid="md-bucket-positions"]');
    return {
      hasCode: !!el,
      hasForm: !!form,
      hasBucket: !!bucket,
      textHasUpsert: (document.body.innerText || '').includes('Thêm / cập nhật mục'),
      textHasChucDanh: (document.body.innerText || '').includes('Chức danh'),
      frHint: (document.body.innerText || '').includes('FR-HRM-SC-POS-01'),
      snip: (document.body.innerText || '').slice(0, 600),
    };
  });
  note('ac-pos-form-visible', !!posDom.hasCode, JSON.stringify(posDom));
  results.verdicts.posFormVisible = posDom.hasCode ? 'PASS' : 'FAIL';

  const netBefore = results.network.length;
  if (posDom.hasCode) {
    const filled = await fillMdForm(page, 'positions', posCode, posLabel);
    note('ac-pos-fill', !!filled.ok, JSON.stringify(filled));
    const saveBtn = await clickSaveInForm(page, 'positions');
    note('ac-pos-click-luu', !!saveBtn.ok, JSON.stringify(saveBtn));
    await sleep(3500);
  }
  const posPosts = results.network
    .slice(netBefore)
    .filter((n) => n.method === 'POST' && /settings-catalogs\/items/.test(n.url));
  const posPostOk = posPosts.some((n) => n.status >= 200 && n.status < 300);
  const writeKeyHint = posPosts.some(
    (n) => n.postBody && /job_titles|"catalogKey"\s*:\s*"job_titles"/.test(n.postBody),
  );
  note(
    'ac-pos-post',
    posPostOk,
    JSON.stringify({ posts: posPosts.slice(-5), writeKeyHint }),
  );
  results.verdicts.posCreatePost = posPostOk ? 'PASS' : 'FAIL';
  results.verdicts.writeKeyJobTitles = writeKeyHint
    ? 'PASS'
    : posPostOk
      ? 'PARTIAL'
      : 'FAIL';

  await page.reload({ waitUntil: 'domcontentloaded' });
  await sleep(2500);
  try {
    await nativeClickByText(page, 'Danh mục nghiệp vụ');
    await sleep(500);
  } catch {
    /* */
  }
  try {
    await nativeClickByText(page, 'Chức danh');
  } catch {
    /* */
  }
  await sleep(1200);
  const posF5 = await page.evaluate((c) => (document.body.innerText || '').includes(c), posCode);
  note('ac-pos-f5', posF5, posCode);
  results.verdicts.posCreateF5 =
    posDom.hasCode && posPostOk && posF5
      ? 'PASS'
      : posDom.hasCode && (posPostOk || posF5)
        ? 'PARTIAL'
        : 'FAIL';

  // API confirm code in job_titles effectiveItems
  const catAfter = await fetch(`${PORTAL}/api/hrm/settings-catalogs?company_id=main`, {
    headers: authHeaders,
  });
  const catAfterBody = await catAfter.json();
  const catalogsAfter = catAfterBody?.data?.catalogs ?? catAfterBody?.data ?? [];
  const jtAfter = catalogsAfter.find((c) => (c.catalogKey || c.key) === 'job_titles');
  const codes = (jtAfter?.effectiveItems || []).map((i) => i.code || i.key);
  const apiHas = codes.includes(posCode);
  note('ac-pos-api-job-titles', apiHas, `code=${posCode} in job_titles=${apiHas} n=${codes.length}`);
  results.verdicts.apiJobTitlesHasCode = apiHas ? 'PASS' : 'FAIL';

  // Empty CTA — strip job_titles|positions|employee_positions
  await page.setRequestInterception(true);
  const emptyHandler = async (req) => {
    try {
      if (req.method() === 'GET' && /\/api\/hrm\/settings-catalogs(\?|$)/.test(req.url())) {
        const upstream = await fetch(req.url(), { headers: authHeaders });
        const json = await upstream.json();
        return req.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(
            stripCatalogItems(json, ['job_titles', 'positions', 'employee_positions']),
          ),
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

  await openSettingsBucket(page, 'Chức danh');
  const emptyUi = await page.evaluate(() => {
    const text = document.body.innerText || '';
    return {
      amberOrCta:
        /Chưa có mục|Đồng bộ từ XBOS|Đồng bộ XBOS|Thêm trong Cài đặt|chưa có snapshot/i.test(
          text,
        ),
      fakeBootstrap:
        /XE_TMDV|VISUN|positionsByDept|Giám đốc kinh doanh hardcode/i.test(text) === false
          ? false
          : true,
      snip: text.slice(0, 500),
    };
  });
  note(
    'ac-pos-empty-cta',
    !!emptyUi.amberOrCta && !emptyUi.fakeBootstrap,
    JSON.stringify(emptyUi),
  );
  results.verdicts.emptyCta = emptyUi.amberOrCta && !emptyUi.fakeBootstrap ? 'PASS' : 'FAIL';

  // Picker smoke on Settings panel (if present) or Employees
  await page.goto(
    `${PORTAL}/hr/employees?portal=1&tenantId=xevn&companyId=main`,
    { waitUntil: 'domcontentloaded', timeout: 60000 },
  );
  await sleep(2500);
  // remove intercept for live picker — need real catalog for SoT check after empty test
  page.off('request', emptyHandler);
  try {
    await page.setRequestInterception(false);
  } catch {
    /* */
  }
  await page.reload({ waitUntil: 'domcontentloaded' });
  await sleep(2500);

  let pickerOk = false;
  let pickerDetail = {};
  try {
    for (const t of ['Thêm nhân viên', 'Thêm NV', 'Tạo nhân viên', 'Thêm']) {
      try {
        await nativeClickByText(page, t);
        await sleep(800);
        break;
      } catch {
        /* */
      }
    }
    pickerDetail = await page.evaluate(() => {
      const triggers = Array.from(
        document.querySelectorAll('button, [role="combobox"]'),
      ).filter((el) =>
        /chức danh|job title|chọn chức danh/i.test(el.textContent || el.getAttribute('aria-label') || ''),
      );
      const allTriggers = Array.from(document.querySelectorAll('[role="combobox"]')).slice(0, 8);
      return {
        titledTriggers: triggers.map((t) => (t.textContent || '').trim().slice(0, 80)),
        comboboxN: allTriggers.length,
        labels: Array.from(document.querySelectorAll('label'))
          .map((l) => (l.textContent || '').trim())
          .filter((t) => /chức danh|chức vụ|vị trí/i.test(t))
          .slice(0, 5),
      };
    });
    pickerOk =
      pickerDetail.titledTriggers.length > 0 ||
      pickerDetail.labels.length > 0 ||
      pickerDetail.comboboxN > 0;
  } catch (e) {
    pickerDetail = { error: String(e.message || e) };
  }
  note('ac-pos-picker-smoke', pickerOk, JSON.stringify(pickerDetail));
  results.verdicts.pickerSmoke = pickerOk ? 'PASS' : 'PARTIAL';

  await browser.close();

  const corePass =
    results.verdicts.posFormVisible === 'PASS' &&
    results.verdicts.posCreatePost === 'PASS' &&
    results.verdicts.posCreateF5 === 'PASS' &&
    results.verdicts.posSeedForbidden === 'PASS';

  results.overall = corePass
    ? 'PASS'
    : results.verdicts.posFormVisible === 'FAIL'
      ? 'FAIL'
      : 'PARTIAL';
  results.finishedAt = new Date().toISOString();
  results.posCode = posCode;
  results.fullMatrixGreenClaimed = false;
  save();
  console.log('\nOVERALL', results.overall);
  console.log('verdicts', JSON.stringify(results.verdicts, null, 2));
  process.exit(corePass ? 0 : 1);
}

main().catch((e) => {
  results.overall = 'ERROR';
  results.error = String(e.stack || e);
  results.finishedAt = new Date().toISOString();
  save();
  console.error(e);
  process.exit(2);
});
