/**
 * QA-HDSD-BF-03-BH-POL-DTO-RET-01
 * After D-HDSD-BF-03-BH-POL-DTO-01 — master create/SM DTO + TC-049 smoke
 * U65 zero-seed · portal :5173 · ceo@xe.vn · companyId=main
 *
 * AC:
 * 1) POST insurance-policies → 201 · request body KHÔNG có insurer_label
 * 2) PATCH draft→active → 200 · body status-only · company_id trên query
 * 3) TC-049 smoke: Thêm BH → picker (enroll 201 nếu đủ thời gian)
 * must_keep: SoftDel TC-025 · TC-041 · no archive · no demote TC-049
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
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-qa-hdsd-bf-03-bh-pol-dto-ret-01-runtime.json');
const SCREEN_DIR = resolve(ROOT, 'docs/qa/evidence/screens/hdsd-bf-03-bh-pol-dto-ret-01-20260801');
const STAMP = `DTO${Date.now().toString(36).slice(-6).toUpperCase()}`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const q = (path) =>
  `${PORTAL}${path}${path.includes('?') ? '&' : '?'}portal=1&tenantId=xevn&companyId=main`;

const results = {
  work_item_id: 'QA-HDSD-BF-03-BH-POL-DTO-RET-01',
  program: 'P-HDSD-ECOSYSTEM-03 · R-INS-POL-CREATE-LABEL-01 + R-INS-POL-SM-COMPANYID-01',
  startedAt: new Date().toISOString(),
  env: { PORTAL, EMAIL, u65: 'zero-seed', stamp: STAMP, companyId: 'main' },
  l0: {},
  preflight: {},
  postflight: {},
  tc: [],
  journeys: [],
  network: [],
  policyCreateRequests: [],
  policyCreateBodies: [],
  policyPatchRequests: [],
  policyPatchBodies: [],
  postRequests: [],
  postBodies: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  checks: {},
  must_keep: {
    preserved: ['TC-HRM-HDSD-025', 'TC-HRM-HDSD-041', 'TC-HRM-HDSD-049', 'SoftDel'],
    note: 'No SoftDel / HĐ delete mutate this wave',
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
    `${verdict === '🟢' ? 'PASS' : verdict === '🟡' ? 'DEFER' : 'FAIL'}  ${id}  ${detail.slice(0, 320)}`,
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
  page.on('request', (req) => {
    try {
      const u = req.url();
      const method = req.method();
      if (method === 'OPTIONS') return;
      if (method === 'POST' && /insurance-policies/.test(u) && !/participants/.test(u)) {
        let bodyPreview = null;
        try {
          const raw = req.postData();
          if (raw) bodyPreview = JSON.parse(raw);
        } catch {
          /* */
        }
        results.policyCreateRequests.push({
          method,
          url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 280),
          bodyPreview,
          has_insurer_label:
            bodyPreview && Object.prototype.hasOwnProperty.call(bodyPreview, 'insurer_label'),
          at: new Date().toISOString(),
        });
      }
      if (method === 'PATCH' && /insurance-policies\//.test(u) && !/participants/.test(u)) {
        let bodyPreview = null;
        try {
          const raw = req.postData();
          if (raw) bodyPreview = JSON.parse(raw);
        } catch {
          /* */
        }
        const qs = (() => {
          try {
            return new URL(u).searchParams;
          } catch {
            return null;
          }
        })();
        const keys = bodyPreview && typeof bodyPreview === 'object' ? Object.keys(bodyPreview) : [];
        results.policyPatchRequests.push({
          method,
          url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 320),
          bodyPreview,
          bodyKeys: keys,
          has_company_id_in_body: keys.includes('company_id'),
          company_id_query: qs?.get('company_id') ?? null,
          status_only: keys.length === 1 && keys[0] === 'status',
          at: new Date().toISOString(),
        });
      }
      if (method === 'POST' && /insurance-policy-participants/.test(u)) {
        let bodyPreview = null;
        let policyId = null;
        try {
          const raw = req.postData();
          if (raw) {
            bodyPreview = JSON.parse(raw);
            policyId = bodyPreview?.policy_id ?? null;
          }
        } catch {
          /* */
        }
        results.postRequests.push({
          method,
          url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 240),
          policy_id: policyId,
          bodyPreview,
          at: new Date().toISOString(),
        });
      }
    } catch {
      /* */
    }
  });
  page.on('response', async (res) => {
    try {
      const u = res.url();
      if (!/\/api\/(hrm|xbos)\//.test(u)) return;
      const method = res.request().method();
      if (method === 'OPTIONS') return;
      const entry = {
        method,
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 320),
        at: new Date().toISOString(),
      };
      results.network.push(entry);
      if (method === 'POST' && /insurance-policies/.test(u) && !/participants/.test(u)) {
        try {
          const body = await res.json();
          results.policyCreateBodies.push({
            status: res.status(),
            code: body?.code ?? null,
            message: String(body?.message || '').slice(0, 400),
            id: body?.data?.id ?? body?.id ?? null,
          });
        } catch {
          /* */
        }
      }
      if (method === 'PATCH' && /insurance-policies\//.test(u) && !/participants/.test(u)) {
        try {
          const body = await res.json();
          results.policyPatchBodies.push({
            status: res.status(),
            code: body?.code ?? null,
            message: String(body?.message || '').slice(0, 400),
            statusField: body?.data?.status ?? body?.status ?? null,
          });
        } catch {
          /* */
        }
      }
      if (method === 'POST' && /insurance-policy-participants/.test(u)) {
        try {
          const body = await res.json();
          const data = body?.data ?? body;
          results.postBodies.push({
            status: res.status(),
            code: body?.code ?? null,
            message: String(body?.message || '').slice(0, 240),
            policy_id: data?.policy_id ?? null,
            id: data?.id ?? null,
          });
        } catch {
          results.postBodies.push({ status: res.status(), code: null, message: 'non-json' });
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
  for (const [name, url] of [
    ['hrm', `${HRM}/api/hrm`],
    ['xbos', 'http://127.0.0.1:28002/api/xbos'],
    ['portal', PORTAL],
  ]) {
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
  try {
    const r = await fetch(polUrl, { headers, signal: AbortSignal.timeout(12000) });
    const j = await r.json().catch(() => ({}));
    const data = j?.data?.data ?? j?.data ?? j?.items ?? [];
    const rows = Array.isArray(data) ? data : [];
    const active = rows.filter((row) => String(row.status || '').toLowerCase() === 'active');
    const draft = rows.filter((row) => String(row.status || '').toLowerCase() === 'draft');
    results.preflight = {
      policies: {
        http: r.status,
        code: j?.code ?? null,
        total: j?.data?.total ?? j?.total ?? rows.length,
        rows: rows.length,
        active: active.length,
        draft: draft.length,
        sample: rows.slice(0, 5).map((row) => ({
          id: row.id,
          status: row.status,
          policy_code: row.policy_code,
        })),
      },
    };
  } catch (e) {
    results.preflight = { policies: { http: 0, error: String(e).slice(0, 120) } };
  }
  console.log('preflight', JSON.stringify(results.preflight));
  save();
  return results.preflight;
}

async function upsertMdItem(page, bucket, code, label) {
  const tab = page.locator(`[data-testid="md-tab-${bucket}"]`);
  if (await tab.count()) {
    await tab.click({ force: true }).catch(() => {});
    await sleep(600);
  } else {
    await page
      .getByRole('tab', { name: bucket === 'insurers' ? /Nhà bảo hiểm/i : /Loại bảo hiểm/i })
      .first()
      .click({ force: true })
      .catch(() => {});
    await sleep(600);
  }

  const filled = await page.evaluate(
    ({ b, c, l }) => {
      const codeInput = document.querySelector(`#md-code-${b}`);
      const labelInput = document.querySelector(`#md-label-${b}`);
      if (!codeInput || !labelInput) return { ok: false };
      const set = (el, v) => {
        const proto = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
        proto.set.call(el, v);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      };
      set(codeInput, c);
      set(labelInput, l);
      return { ok: true };
    },
    { b: bucket, c: code, l: label },
  );
  if (!filled.ok) return { ok: false, http: null };

  const before = results.network.length;
  const saveBtn = page.locator(`[data-testid="md-save-${bucket}"]`);
  if (await saveBtn.count()) await saveBtn.click({ force: true });
  await sleep(3500);
  const post = netsSince(
    before,
    (n) => n.method === 'POST' && /settings-catalogs\/items/.test(n.url),
  ).pop();
  return { ok: !!post && post.status >= 200 && post.status < 300, http: post?.status ?? null };
}

async function ensureInsuranceCatalogsViaSettings(page) {
  const insurerCode = `bv_${STAMP.toLowerCase()}`;
  const typeCode = `bhxh_${STAMP.toLowerCase()}`;
  await page.goto(q('/hr/settings'), { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(3000);
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
    const el =
      tabs.find((t) => /Danh mục nghiệp vụ/i.test(t.textContent || '')) ||
      tabs.find((t) => (t.getAttribute('value') || '') === 'master-data');
    if (el) {
      el.scrollIntoView({ block: 'nearest', inline: 'center' });
      el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    }
  });
  await sleep(2000);
  await page.getByRole('tab', { name: /Danh mục nghiệp vụ/i }).first().click({ force: true }).catch(() => {});
  await sleep(1500);
  await shot(page, '01-settings-md');
  const insurer = await upsertMdItem(page, 'insurers', insurerCode, `Bảo Việt QA ${STAMP}`);
  const type = await upsertMdItem(page, 'insuranceTypes', typeCode, `BHXH QA ${STAMP}`);
  return {
    insurerCode,
    typeCode,
    ok: insurer.ok && type.ok,
    insurerHttp: insurer.http,
    typeHttp: type.http,
  };
}

async function fillCatalogPickers(page, root) {
  const pickers = root.locator('button').filter({ hasText: /Chọn|Select|Tìm|Nhà|Loại|Bảo|BH/i });
  const pickerN = await pickers.count();
  for (let i = 0; i < Math.min(pickerN, 6); i++) {
    try {
      await pickers.nth(i).click({ timeout: 2000 });
      await sleep(600);
      const stampOpt = page
        .locator('[role="option"], [cmdk-item]')
        .filter({ hasText: new RegExp(STAMP, 'i') })
        .first();
      if (await stampOpt.isVisible().catch(() => false)) {
        await stampOpt.click();
      } else {
        const opt = page.locator('[role="option"], [cmdk-item]').first();
        if (await opt.isVisible().catch(() => false)) await opt.click();
        else await page.keyboard.press('Escape').catch(() => {});
      }
      await sleep(300);
    } catch {
      /* */
    }
  }
}

/** Open CatalogSearchPicker by aria-label and pick stamp (or first) option. */
async function pickCatalogByAria(page, root, ariaLabel, preferStamp) {
  const trigger = root.locator(`[aria-label="${ariaLabel}"]`).first();
  if (!(await trigger.count())) {
    // fallback: button near FormLabel text
    const btn = root.locator('button').filter({ hasText: /Chọn/i }).first();
    if (!(await btn.count())) return { ok: false, reason: 'no_trigger' };
    await btn.click({ timeout: 3000 }).catch(() => {});
  } else {
    await trigger.click({ timeout: 3000 });
  }
  await sleep(700);
  // type to filter if combobox/input appears
  if (preferStamp) {
    await page.keyboard.type(preferStamp.slice(0, 8), { delay: 30 }).catch(() => {});
    await sleep(500);
  }
  const stampOpt = preferStamp
    ? page
        .locator('[role="option"], [cmdk-item]')
        .filter({ hasText: new RegExp(preferStamp, 'i') })
        .first()
    : null;
  if (stampOpt && (await stampOpt.isVisible().catch(() => false))) {
    await stampOpt.click();
    await sleep(400);
    return { ok: true, picked: 'stamp' };
  }
  const any = page.locator('[role="option"], [cmdk-item]').first();
  if (await any.isVisible().catch(() => false)) {
    await any.click();
    await sleep(400);
    return { ok: true, picked: 'first' };
  }
  await page.keyboard.press('Escape').catch(() => {});
  return { ok: false, reason: 'no_option' };
}

async function createAndActivatePolicy(page, catalog) {
  await page.goto(q('/hr/insurance'), { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(4000);
  const panel = page.locator('[data-testid="insurance-policy-master-e3"]');
  await panel.scrollIntoViewIfNeeded().catch(() => {});
  await shot(page, '02-policy-master');

  const code = `QA-DTO-${STAMP}`;
  const name = `Chính sách QA DTO ${STAMP}`;
  await panel.locator('input').nth(0).fill(code);
  await panel.locator('input').nth(1).fill(name);

  // Explicit insurer + type picks (prior run: type left empty → validation blocked POST)
  const insurerPick = await pickCatalogByAria(
    page,
    panel,
    'Nhà bảo hiểm',
    catalog?.insurerCode || STAMP,
  );
  const typePick = await pickCatalogByAria(
    page,
    panel,
    'Loại bảo hiểm',
    catalog?.typeCode || STAMP,
  );
  // Fallback sweep if either missed
  if (!insurerPick.ok || !typePick.ok) {
    await fillCatalogPickers(page, panel);
  }

  const dateInput = panel.locator('input[type="date"]').first();
  if (await dateInput.count()) await dateInput.fill('2026-01-01');

  // Capture form validation before submit
  const formBefore = await panel.evaluate((el) => (el.innerText || '').slice(0, 800));

  const beforeCreate = results.policyCreateRequests.length;
  const beforeNet = results.network.length;
  const submit = panel
    .locator('button[type="submit"]')
    .filter({ hasText: /Tạo chính sách|Lưu chính sách/i })
    .first();
  if (await submit.count()) await submit.click();
  else await panel.locator('button').filter({ hasText: /Tạo chính sách/i }).first().click();
  await sleep(4500);
  await shot(page, '03-policy-created');

  const formAfter = await panel.evaluate((el) => (el.innerText || '').slice(0, 800));
  results.checks.createForm = {
    insurerPick,
    typePick,
    formBefore: formBefore.slice(0, 400),
    formAfter: formAfter.slice(0, 400),
    validationHint: /Chọn loại|Chọn nhà|bắt buộc|required/i.test(formAfter),
  };

  const createReq = results.policyCreateRequests.slice(beforeCreate).pop() || null;
  const createRes = netsSince(
    beforeNet,
    (n) => n.method === 'POST' && /insurance-policies/.test(n.url) && !/participants/.test(n.url),
  ).pop();
  const createBody = results.policyCreateBodies.slice(-1)[0] || null;

  let targetRow = panel.locator('[data-testid="ins-policy-row"]').filter({ hasText: STAMP }).first();
  let rowVisible = await targetRow.isVisible().catch(() => false);
  if (!rowVisible) {
    const withActive = panel.locator('[data-testid="ins-policy-row"]').filter({
      has: page.locator('[data-testid="ins-policy-sm-active"]'),
    });
    if ((await withActive.count()) > 0) {
      targetRow = withActive.first();
      rowVisible = true;
    }
  }

  const beforePatch = results.policyPatchRequests.length;
  const beforeSmNet = results.network.length;
  const activeBtn = targetRow.locator('[data-testid="ins-policy-sm-active"]');
  let smClicked = false;
  if (await activeBtn.isVisible().catch(() => false)) {
    await activeBtn.click();
    smClicked = true;
    await sleep(3500);
  }
  await shot(page, '04-policy-sm-active');

  const patchReq = results.policyPatchRequests.slice(beforePatch).pop() || null;
  const smRes = netsSince(
    beforeSmNet,
    (n) =>
      n.method === 'PATCH' &&
      /insurance-policies\//.test(n.url) &&
      !/participants/.test(n.url),
  ).pop();
  const patchBody = results.policyPatchBodies.slice(-1)[0] || null;

  return {
    code,
    name,
    catalog,
    createReq,
    createRes,
    createBody,
    smClicked,
    patchReq,
    smRes,
    patchBody,
    rowVisible,
    createOk: !!createRes && createRes.status === 201,
    noInsurerLabel: createReq ? createReq.has_insurer_label === false : false,
    smOk: !!smRes && smRes.status === 200,
    statusOnly: patchReq ? patchReq.status_only === true : false,
    companyIdOnQuery: patchReq ? !!patchReq.company_id_query : false,
    noCompanyIdInBody: patchReq ? patchReq.has_company_id_in_body === false : false,
  };
}

async function openAddDialog(page) {
  const addBtn = page.locator('button').filter({ hasText: /Thêm bảo hiểm/i }).first();
  if (await addBtn.count()) await addBtn.click();
  else {
    const clicked = await page.evaluate(() => {
      const nodes = Array.from(document.querySelectorAll('button, a, [role="button"]'));
      const el = nodes.find((n) => /Thêm bảo hiểm|Thêm BH/i.test((n.textContent || '').trim()));
      if (!el) return false;
      el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      return true;
    });
    if (!clicked) return { dialog: null, open: false };
  }
  await sleep(2500);
  const dialog = page.locator('[role="dialog"]').first();
  const open = await dialog.isVisible().catch(() => false);
  return { dialog, open };
}

async function smokeTc049(page) {
  const { dialog, open } = await openAddDialog(page);
  if (!open) {
    return { dialogOpen: false, pickerVisible: false, enroll: null, reason: 'dialog miss' };
  }
  await sleep(2000);
  await shot(page, '05-enroll-dialog');

  const picker = dialog.locator('[data-testid="ins-participant-policy-picker"]');
  const empty = dialog.locator('[data-testid="ins-participant-policy-empty"]');
  const pickerVisible = await picker.isVisible().catch(() => false);
  const stillEmpty = await empty.isVisible().catch(() => false);

  // Try full enroll when picker available
  let enroll = null;
  if (pickerVisible) {
    const empInput = dialog.locator('input').first();
    if (await empInput.count()) {
      await empInput.fill('a');
      await sleep(1500);
      const empOpt = page.locator('[role="option"]').first();
      if (await empOpt.isVisible().catch(() => false)) await empOpt.click();
    }
    await fillCatalogPickers(page, dialog);
    const si = dialog.locator('input[name="social_insurance_number"]');
    if (await si.count()) await si.fill(`SI${STAMP}`);

    const beforeNet = results.network.length;
    const beforeBodies = results.postBodies.length;
    const saveBtn = dialog.locator('[data-testid="ins-participant-save"]');
    const saveDisabled = await saveBtn.isDisabled().catch(() => true);
    if (!saveDisabled) {
      await saveBtn.click();
      await sleep(5000);
    }
    await shot(page, '06-enroll-after-save');
    const post = netsSince(
      beforeNet,
      (n) => n.method === 'POST' && /insurance-policy-participants/.test(n.url),
    ).pop();
    const body = results.postBodies.slice(beforeBodies).pop() || null;
    const stillOpen = await dialog.isVisible().catch(() => false);
    if (stillOpen) await page.keyboard.press('Escape').catch(() => {});
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(3000);
    const f5Err = await bodyHasError(page);
    await shot(page, '07-enroll-f5');
    enroll = {
      saveDisabled,
      post,
      body,
      stillOpen,
      f5Clean: !f5Err.banner,
      ok: !!post && post.status === 201,
    };
  } else {
    await page.keyboard.press('Escape').catch(() => {});
  }

  return {
    dialogOpen: true,
    pickerVisible,
    stillEmpty,
    enroll,
    reason: pickerVisible ? null : stillEmpty ? 'empty_cta' : 'no_picker',
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
    await page.goto(q('/hr/insurance'), { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(3500);
    await shot(page, '00-insurance-mount');

    // Catalog via Settings FE (U65 — not seed)
    let catalog;
    try {
      catalog = await ensureInsuranceCatalogsViaSettings(page);
    } catch (e) {
      catalog = { ok: false, error: String(e).slice(0, 200) };
    }
    results.checks.catalog = catalog;

    const createSm = await createAndActivatePolicy(page, catalog);
    results.checks.createSm = createSm;

    const createPass =
      createSm.createOk &&
      createSm.noInsurerLabel &&
      (createSm.createBody?.code === 'HRM-INS-POL-201' || createSm.createRes?.status === 201);
    recordTc(
      'R-INS-POL-CREATE-LABEL-01',
      createPass ? '🟢' : '🔴',
      `POST status=${createSm.createRes?.status} code=${createSm.createBody?.code} has_insurer_label=${createSm.createReq?.has_insurer_label} bodyKeys=${JSON.stringify(createSm.createReq?.bodyPreview ? Object.keys(createSm.createReq.bodyPreview) : null)}`,
      { createReq: createSm.createReq, createBody: createSm.createBody },
    );

    const smPass =
      createSm.smOk &&
      createSm.statusOnly &&
      createSm.companyIdOnQuery &&
      createSm.noCompanyIdInBody &&
      (createSm.patchBody?.code === 'HRM-INS-POL-200' || createSm.smRes?.status === 200);
    recordTc(
      'R-INS-POL-SM-COMPANYID-01',
      smPass ? '🟢' : createSm.smClicked ? '🔴' : '🟡',
      `PATCH status=${createSm.smRes?.status} code=${createSm.patchBody?.code} status_only=${createSm.patchReq?.status_only} company_id_query=${createSm.patchReq?.company_id_query} bodyKeys=${JSON.stringify(createSm.patchReq?.bodyKeys)} has_company_id_body=${createSm.patchReq?.has_company_id_in_body}`,
      { patchReq: createSm.patchReq, patchBody: createSm.patchBody },
    );

    // TC-049 smoke
    let smoke;
    try {
      smoke = await smokeTc049(page);
    } catch (e) {
      smoke = { dialogOpen: false, reason: String(e).slice(0, 200) };
    }
    results.checks.tc049 = smoke;

    const enrollOk = smoke.enroll?.ok === true;
    const pickerSmoke = smoke.dialogOpen && smoke.pickerVisible;
    const tc049Verdict = enrollOk ? '🟢' : pickerSmoke ? '🟢' : smoke.dialogOpen ? '🟡' : '🔴';
    recordTc(
      'TC-HRM-HDSD-049-SMOKE',
      tc049Verdict,
      `dialog=${smoke.dialogOpen} picker=${smoke.pickerVisible} empty=${smoke.stillEmpty} enroll201=${enrollOk} post=${smoke.enroll?.post?.status ?? 'n/a'} code=${smoke.enroll?.body?.code ?? 'n/a'} ${smoke.reason || ''}`,
      { smoke },
    );

    results.journeys.push({
      id: 'J-HRM-04',
      verdict: createPass && smPass && (enrollOk || pickerSmoke) ? '🟢' : '🟡',
      detail: 'master create→SM→dialog picker/enroll',
    });

    // must_keep SoftDel — no archive this wave
    const archivePosts = results.network.filter(
      (n) => n.method === 'POST' && /\/archive/.test(n.url),
    );
    const contractDeletes = results.network.filter(
      (n) => n.method === 'DELETE' && /contracts/.test(n.url) && !/insurance/.test(n.url),
    );
    results.checks.mustKeep = {
      archivePosts: archivePosts.length,
      contractDeletes: contractDeletes.length,
      softDelUntouched: archivePosts.length === 0,
      tc041Untouched: contractDeletes.length === 0,
    };
    recordTc(
      'MUST-KEEP-SOFTDEL-041',
      archivePosts.length === 0 && contractDeletes.length === 0 ? '🟢' : '🔴',
      `archivePosts=${archivePosts.length} contractDeletes=${contractDeletes.length}`,
    );

    // postflight
    await preflightPolicies(session.token).then((p) => {
      results.postflight = p;
    });

    const overall =
      createPass &&
      smPass &&
      (enrollOk || pickerSmoke) &&
      archivePosts.length === 0 &&
      contractDeletes.length === 0;

    results.verdict = overall ? 'PASS' : 'FAIL';
    results.residuals_closed = overall
      ? ['R-INS-POL-CREATE-LABEL-01', 'R-INS-POL-SM-COMPANYID-01']
      : [];
    results.finishedAt = new Date().toISOString();
    results.consoleErrorCount = results.consoleErrors.length;
    save();

    console.log(
      `\n=== VERDICT ${results.verdict} · create=${createPass} sm=${smPass} tc049=${tc049Verdict} softDel=${archivePosts.length === 0} ===\n`,
    );
    await browser.close();
    process.exit(overall ? 0 : 1);
  } catch (e) {
    results.fatal = String(e).slice(0, 500);
    results.verdict = 'FAIL';
    results.finishedAt = new Date().toISOString();
    save();
    console.error(e);
    await browser.close().catch(() => {});
    process.exit(1);
  }
}

main();
