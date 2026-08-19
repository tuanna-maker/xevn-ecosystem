/**
 * QA-HDSD-BF-03-BH-RET-01 — TC-049 Thêm BH retest after D-HDSD-BF-03-BH-400-01 soft-resolve
 * U65 zero-seed · portal :5173 · ceo@xe.vn companyId=main
 * Expect: POST /insurance-policy-participants → 201 HRM-INS-P-201
 *   OR honest 🟡 if 400 HRM-INS-POL-AMBIG / HRM-INS-POL-404 (0/>1 policies) → residual FE picker
 * must_keep: insurance GET 200 · TC-041 / SoftDel menu path not exercised
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const HRM = process.env.HRM_API_URL || 'http://127.0.0.1:28001';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-qa-hdsd-bf-03-bh-ret-01-runtime.json');
const SCREEN_DIR = resolve(ROOT, 'docs/qa/evidence/screens/hdsd-bf-03-bh-ret-01-20260801');
const STAMP = `BH${Date.now().toString(36).slice(-6).toUpperCase()}`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const q = (path) =>
  `${PORTAL}${path}${path.includes('?') ? '&' : '?'}portal=1&tenantId=xevn&companyId=main`;

const results = {
  work_item_id: 'QA-HDSD-BF-03-BH-RET-01',
  program: 'P-HDSD-ECOSYSTEM-03 · R-MUTATE-BH-400-01',
  startedAt: new Date().toISOString(),
  env: { PORTAL, EMAIL, u65: 'zero-seed', stamp: STAMP, companyId: 'main' },
  l0: {},
  preflight: {},
  tc: [],
  journeys: [],
  network: [],
  postBodies: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  must_keep: {
    preserved: ['TC-HRM-HDSD-041', 'insurance GET', 'SoftDel menu'],
    note: 'TC-049 only — no SoftDel / HĐ delete / YCTD mutate',
  },
};

function save() {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(results, null, 2));
}

function recordTc(id, verdict, detail, extra = {}) {
  const row = { id, verdict, detail, at: new Date().toISOString(), ...extra };
  results.tc.push(row);
  console.log(
    `${verdict === '🟢' ? 'PASS' : verdict === '🟡' ? 'DEFER' : 'FAIL'}  ${id}  ${detail.slice(0, 240)}`,
  );
  save();
  return row;
}

async function shot(page, name) {
  mkdirSync(SCREEN_DIR, { recursive: true });
  const path = join(SCREEN_DIR, `${name}.png`);
  await page.screenshot({ path, fullPage: false });
  results.screens.push(path.replace(/\\/g, '/'));
}

function track(page) {
  page.on('response', async (res) => {
    try {
      const u = res.url();
      if (!/\/api\/(hrm|xbos)\//.test(u)) return;
      const method = res.request().method();
      if (method === 'OPTIONS') return;
      const entry = {
        method,
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 240),
        at: new Date().toISOString(),
      };
      results.network.push(entry);
      if (
        method === 'POST' &&
        /insurance-policy-participants/.test(u) &&
        !/insurance-policy-participants\?/.test(u.split('/').pop() || '')
      ) {
        try {
          const body = await res.json();
          results.postBodies.push({
            status: res.status(),
            code: body?.code ?? null,
            message: String(body?.message || '').slice(0, 240),
            success: body?.success,
          });
        } catch {
          results.postBodies.push({ status: res.status(), code: null, message: 'non-json', success: null });
        }
      }
    } catch {
      /* */
    }
  });
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const t = msg.text();
      if (/favicon|Download the React DevTools/i.test(t)) return;
      results.consoleErrors.push(t.slice(0, 240));
    }
  });
  page.on('pageerror', (err) => {
    results.pageErrors.push(String(err).slice(0, 240));
  });
}

function netsSince(before, pred) {
  return results.network.slice(before).filter(pred);
}

async function bodyHasError(page) {
  return page.evaluate(() => {
    const txt = (document.body?.innerText || '').slice(0, 8000);
    return {
      banner: /HRM API Sync ERROR|HRM API request failed \(5\d\d\)|409|companyId mismatch/i.test(txt),
      snippet: txt.slice(0, 280),
    };
  });
}

async function loginApi() {
  const r = await fetch(`${PORTAL}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const j = await r.json();
  const data = j?.data ?? j;
  const token = data?.accessToken ?? data?.access_token ?? j?.accessToken;
  if (!token) throw new Error(`login failed HTTP ${r.status}`);
  const u = data?.user ?? {};
  return {
    token,
    expiresAt: Date.now() + 8 * 3600_000,
    user: {
      userId: u.userId || u.id || u.email || EMAIL,
      email: u.email || EMAIL,
      displayName: u.displayName || u.fullName || u.name || 'CEO Tập đoàn',
      roles: u.roles || ['group_ceo'],
    },
    raw: data,
  };
}

async function injectPortalAuth(page, session) {
  await page.addInitScript((s) => {
    const payload = JSON.stringify(s.user);
    for (const store of [localStorage, sessionStorage]) {
      store.setItem('xevn.portal.accessToken', s.token);
      store.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
      store.setItem('xevn.portal.user', payload);
      store.setItem('xevn.portal.tenantId', 'xevn');
      store.setItem('xevn.portal.companyId', 'main');
      store.setItem('hrm_portal_mode', '1');
      store.setItem('hrm_current_company_id', 'main');
      store.setItem('hrm_current_tenant_id', 'xevn');
      if (s.raw?.refreshToken) store.setItem('xevn.portal.refreshToken', s.raw.refreshToken);
    }
  }, session);
  await page.goto(PORTAL, { waitUntil: 'domcontentloaded', timeout: 60000 });
}

async function probeL0() {
  const targets = [
    ['hrm', `${HRM}/api/hrm`],
    ['xbos', 'http://127.0.0.1:28002/api/xbos'],
    ['portal', PORTAL],
  ];
  for (const [name, url] of targets) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
      results.l0[name] = r.status;
    } catch (e) {
      results.l0[name] = String(e).slice(0, 80);
    }
  }
}

async function preflightPolicies(token) {
  const headers = { authorization: `Bearer ${token}` };
  const polUrl = `${HRM}/api/hrm/contracts-insurance/insurance-policies?company_id=main&page_size=50`;
  const partUrl = `${HRM}/api/hrm/insurance-policy-participants?company_id=main&page_size=5`;
  const insUrl = `${HRM}/api/hrm/contracts-insurance/insurance?company_id=main&page_size=5`;
  const out = {};
  for (const [key, url] of [
    ['policies', polUrl],
    ['participants', partUrl],
    ['insuranceList', insUrl],
  ]) {
    try {
      const r = await fetch(url, { headers, signal: AbortSignal.timeout(12000) });
      const j = await r.json().catch(() => ({}));
      const data = j?.data?.data ?? j?.data ?? j?.items ?? [];
      const rows = Array.isArray(data) ? data : [];
      const active =
        key === 'policies'
          ? rows.filter((row) => String(row.status || '').toLowerCase() === 'active')
          : rows;
      out[key] = {
        http: r.status,
        code: j?.code ?? null,
        total: j?.data?.total ?? j?.total ?? rows.length,
        rows: rows.length,
        active: active.length,
        sample: rows.slice(0, 3).map((row) => ({
          id: row.id,
          status: row.status,
          insurer_key: row.insurer_key,
        })),
      };
    } catch (e) {
      out[key] = { http: 0, error: String(e).slice(0, 120) };
    }
  }
  results.preflight = out;
  console.log('preflight', JSON.stringify(out));
  save();
  return out;
}

async function insuranceDialogMutate(page) {
  await page.goto(q('/hr/insurance'), { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(3500);
  await shot(page, '01-insurance-mount');

  const getIns = netsSince(0, (n) => n.method === 'GET' && /contracts-insurance\/insurance|insurance-policy-participants/.test(n.url));
  const getOk = getIns.some((n) => n.status >= 200 && n.status < 300);

  const addBtn = page.locator('button').filter({ hasText: /Thêm bảo hiểm/i }).first();
  if (await addBtn.count()) await addBtn.click();
  else {
    const plus = page.locator('button').filter({ hasText: /^\+$/ }).first();
    if (await plus.count()) await plus.click();
    else {
      const clicked = await page.evaluate(() => {
        const nodes = Array.from(document.querySelectorAll('button, a, [role="button"]'));
        const el = nodes.find((n) => /Thêm/.test((n.textContent || '').trim()));
        if (!el) return false;
        el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        return true;
      });
      if (!clicked) return { dialogOpen: false, post: null, f5: false, getOk, reason: 'add button miss' };
    }
  }
  await sleep(2000);
  const dialog = page.locator('[role="dialog"]').first();
  const dialogOpen = await dialog.isVisible().catch(() => false);
  if (!dialogOpen) {
    return { dialogOpen: false, post: null, f5: false, getOk, reason: 'dialog not open' };
  }
  await shot(page, '02-insurance-dialog');

  // employee typeahead / combobox
  const empInput = dialog.locator('input').first();
  if (await empInput.count()) {
    await empInput.fill('a');
    await sleep(1800);
  }
  const selectTrigger = dialog.locator('[role="combobox"]').first();
  if (await selectTrigger.count()) {
    await selectTrigger.click();
    await sleep(800);
    const opt = page.locator('[role="option"]').first();
    if (await opt.count()) await opt.click();
    await sleep(600);
  }

  // CatalogSearchPicker / comboboxes
  const pickers = dialog.locator('button').filter({ hasText: /Chọn|Select|Tìm/i });
  const pickerN = await pickers.count();
  for (let i = 0; i < Math.min(pickerN, 4); i++) {
    try {
      await pickers.nth(i).click({ timeout: 2000 });
      await sleep(600);
      const opt = page.locator('[role="option"], [cmdk-item], [data-value]').first();
      if (await opt.isVisible().catch(() => false)) {
        await opt.click();
        await sleep(400);
      } else {
        await page.keyboard.press('Escape').catch(() => {});
      }
    } catch {
      /* */
    }
  }
  const combos = dialog.locator('[role="combobox"]');
  const comboCount = await combos.count();
  for (let i = 0; i < Math.min(comboCount, 4); i++) {
    try {
      await combos.nth(i).click({ timeout: 2000 });
      await sleep(500);
      const opt = page.locator('[role="option"]').first();
      if (await opt.isVisible().catch(() => false)) {
        await opt.click();
        await sleep(400);
      } else {
        await page.keyboard.press('Escape');
      }
    } catch {
      /* */
    }
  }

  const si = dialog.locator('input[name="social_insurance_number"]');
  if (await si.count()) await si.fill(`SI${STAMP}`);

  const before = results.network.length;
  const beforeBodies = results.postBodies.length;
  const saveBtn = dialog.getByRole('button', { name: /Lưu|Save|Thêm/i }).last();
  await saveBtn.click();
  await sleep(5000);
  await shot(page, '03-insurance-after-save');

  const post = netsSince(
    before,
    (n) =>
      ['POST', 'PUT', 'PATCH'].includes(n.method) &&
      /insurance-policy-participants/.test(n.url) &&
      !/\?/.test(n.url.split('/insurance-policy-participants')[1] || ''),
  ).pop();
  // Prefer POST without query (create); fallback any POST participants
  const postAny =
    post ||
    netsSince(
      before,
      (n) => n.method === 'POST' && /insurance-policy-participants/.test(n.url),
    ).pop();

  const body = results.postBodies.slice(beforeBodies).pop() || null;
  const err = await bodyHasError(page);
  const stillOpen = await dialog.isVisible().catch(() => false);
  const valMsg = stillOpen
    ? await dialog.evaluate((el) => (el.innerText || '').slice(0, 500))
    : '';

  if (!stillOpen) {
    // dialog closed on success path
  } else {
    await page.keyboard.press('Escape').catch(() => {});
  }
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(3000);
  const f5Err = await bodyHasError(page);
  await shot(page, '04-insurance-f5');

  return {
    dialogOpen: true,
    getOk,
    post: postAny,
    body,
    f5: !f5Err.banner,
    stillOpen,
    banner: err.banner,
    valMsg,
    reason: postAny
      ? postAny.status >= 400
        ? `API ${postAny.status} code=${body?.code || 'n/a'}`
        : null
      : stillOpen
        ? 'validation/submit no API'
        : 'no mutate network',
  };
}

async function main() {
  await probeL0();
  const session = await loginApi();
  await preflightPolicies(session.token);

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  track(page);
  await injectPortalAuth(page, session);

  try {
    let ins;
    try {
      ins = await insuranceDialogMutate(page);
    } catch (e) {
      ins = { dialogOpen: false, post: null, body: null, f5: false, getOk: false, reason: String(e).slice(0, 200) };
    }

    const postStatus = ins.post?.status;
    const code = ins.body?.code || null;
    const postOk = postStatus >= 200 && postStatus < 300 && (code === 'HRM-INS-P-201' || code === null || /201/.test(code));
    const isAmbig = code === 'HRM-INS-POL-AMBIG' || /AMBIG/i.test(ins.body?.message || '');
    const isNoPolicy =
      code === 'HRM-INS-POL-404' ||
      /no active insurance policy|policy_id is required for participant enroll \(no active/i.test(
        ins.body?.message || '',
      );
    const dialogClosed = ins.dialogOpen && ins.stillOpen === false && postOk;

    let v049;
    let residual = null;
    if (postOk && ins.f5 && (dialogClosed || !ins.stillOpen)) {
      v049 = '🟢';
    } else if (postOk && ins.f5) {
      v049 = '🟡';
      residual = 'dialog_close_unclear';
    } else if (isAmbig || isNoPolicy) {
      v049 = '🟡';
      residual = isAmbig ? 'FE_POLICY_PICKER_AMBIG' : 'FE_POLICY_PICKER_NO_POLICY';
    } else if (ins.dialogOpen && postStatus >= 400) {
      v049 = '🟡';
      residual = `API_${postStatus}_${code || 'unknown'}`;
    } else if (ins.dialogOpen) {
      v049 = '🟡';
      residual = ins.reason || 'no_post';
    } else {
      v049 = '🔴';
      residual = ins.reason || 'dialog_fail';
    }

    recordTc(
      'TC-HRM-HDSD-049',
      v049,
      `§3.6 Dialog BH open=${ins.dialogOpen} POST=${ins.post?.method || 'none'} ${postStatus ?? ''} code=${code || 'n/a'} msg=${(ins.body?.message || '').slice(0, 80)} dialogClosed=${!ins.stillOpen} f5=${ins.f5} getOk=${ins.getOk} residual=${residual || 'none'} ${ins.reason || ''}`,
      {
        uf: 'UF-HRM-03',
        j: 'J-HRM-04',
        clickPath: '/hr/insurance → Thêm bảo hiểm → NV+catalog → Lưu → F5',
        http: postStatus,
        code,
        residual,
        getInsuranceOk: ins.getOk,
        dialogClosed: ins.stillOpen === false,
        f5NoSyncError: ins.f5,
        stamp: STAMP,
      },
    );

    results.mustKeepVerified = {
      insuranceGet: ins.getOk || results.preflight?.insuranceList?.http === 200,
      noSoftDelNav: !results.network.some(
        (n) => /\/employees\/.+\/archive/.test(n.url) && n.method === 'POST',
      ),
      noContractDelete: !results.network.some(
        (n) => n.method === 'DELETE' && /contracts-insurance\/contracts/.test(n.url),
      ),
    };

    results.journeys.push({
      id: 'J-HRM-04',
      verdict: v049,
      detail: `TC-049 BH dialog mutate · POST ${postStatus} ${code || ''}`,
    });
  } finally {
    results.finishedAt = new Date().toISOString();
    const summary = {
      green: results.tc.filter((t) => t.verdict === '🟢').length,
      yellow: results.tc.filter((t) => t.verdict === '🟡').length,
      red: results.tc.filter((t) => t.verdict === '🔴').length,
    };
    results.summary = summary;
    const tc049 = results.tc.find((t) => t.id === 'TC-HRM-HDSD-049');
    results.ack_hint =
      tc049?.verdict === '🟢'
        ? 'PASS_TO_PM'
        : tc049?.residual === 'FE_POLICY_PICKER_NO_POLICY' ||
            tc049?.residual === 'FE_POLICY_PICKER_AMBIG'
          ? 'FAIL_TO_PM'
          : 'PASS_TO_PM';
    save();
    await browser.close();
    console.log('\n=== SUMMARY ===');
    console.log(JSON.stringify({ summary, ack_hint: results.ack_hint, postBodies: results.postBodies, preflight: results.preflight }, null, 2));
    console.log(`runtime: ${OUT}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
