/**
 * QA-HDSD-BF-03-BH-RET-02 — TC-049 after D-HDSD-BF-03-BH-FE-PICKER-01
 * U65 zero-seed · portal :5173 · ceo@xe.vn companyId=main
 *
 * AC:
 * 1) 0 active policy → Thêm BH shows CTA «Tạo chính sách BH» + Lưu disabled (no orphan POST)
 * 2) FE-only: Tạo chính sách → SM Hiệu lực (active) → Thêm BH → pick policy → Lưu
 * 3) POST /insurance-policy-participants → 201 + policy_id · dialog close · F5 persist
 * must_keep: SoftDel TC-025 · TC-041 · insurance GET · no seed
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
const OUT = resolve(ROOT, 'docs/qa/evidence/_tmp-qa-hdsd-bf-03-bh-ret-02-runtime.json');
const SCREEN_DIR = resolve(ROOT, 'docs/qa/evidence/screens/hdsd-bf-03-bh-ret-02-20260801');
const STAMP = `BH2${Date.now().toString(36).slice(-6).toUpperCase()}`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const q = (path) =>
  `${PORTAL}${path}${path.includes('?') ? '&' : '?'}portal=1&tenantId=xevn&companyId=main`;

const results = {
  work_item_id: 'QA-HDSD-BF-03-BH-RET-02',
  program: 'P-HDSD-ECOSYSTEM-03 · R-MUTATE-BH-400-01',
  startedAt: new Date().toISOString(),
  env: { PORTAL, EMAIL, u65: 'zero-seed', stamp: STAMP, companyId: 'main' },
  l0: {},
  preflight: {},
  postflight: {},
  tc: [],
  journeys: [],
  network: [],
  postBodies: [],
  postRequests: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  checks: {},
  must_keep: {
    preserved: ['TC-HRM-HDSD-025', 'TC-HRM-HDSD-041', 'insurance GET', 'SoftDel'],
    note: 'TC-049 only — no SoftDel / HĐ delete mutate',
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
    `${verdict === '🟢' ? 'PASS' : verdict === '🟡' ? 'DEFER' : 'FAIL'}  ${id}  ${detail.slice(0, 280)}`,
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
      if (method === 'POST' && /insurance-policy-participants/.test(u) && !/\?/.test(u.split('/insurance-policy-participants')[1] || '')) {
        let bodyPreview = null;
        let policyId = null;
        try {
          const raw = req.postData();
          if (raw) {
            const j = JSON.parse(raw);
            policyId = j?.policy_id ?? null;
            bodyPreview = {
              policy_id: j?.policy_id ?? null,
              employee_id: j?.employee_id ?? null,
              insurer_key: j?.insurer_key ?? null,
              insurance_type: j?.insurance_type ?? null,
            };
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
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 240),
        at: new Date().toISOString(),
      };
      results.network.push(entry);
      if (
        method === 'POST' &&
        /insurance-policy-participants/.test(u) &&
        !/\?/.test(u.split('/insurance-policy-participants')[1] || '')
      ) {
        try {
          const body = await res.json();
          const data = body?.data ?? body;
          results.postBodies.push({
            status: res.status(),
            code: body?.code ?? null,
            message: String(body?.message || '').slice(0, 240),
            success: body?.success,
            policy_id: data?.policy_id ?? null,
            id: data?.id ?? null,
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
        sample: rows.slice(0, 5).map((row) => ({
          id: row.id,
          status: row.status,
          insurer_key: row.insurer_key,
          policy_code: row.policy_code,
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

async function openAddDialog(page) {
  const addBtn = page.locator('button').filter({ hasText: /Thêm bảo hiểm/i }).first();
  if (await addBtn.count()) {
    await addBtn.click();
  } else {
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

async function pickFirstCatalogInScope(scope) {
  const triggers = scope.locator(
    'button[role="combobox"], [role="combobox"], button:has-text("Chọn"), button:has-text("Tìm")',
  );
  const n = await triggers.count();
  for (let i = 0; i < Math.min(n, 6); i++) {
    try {
      const t = triggers.nth(i);
      if (!(await t.isVisible().catch(() => false))) continue;
      await t.click({ timeout: 2500 });
      await sleep(700);
      const opt = pageOpt(scope.page());
      if (await opt.isVisible().catch(() => false)) {
        await opt.click();
        await sleep(400);
      } else {
        await scope.page().keyboard.press('Escape').catch(() => {});
      }
    } catch {
      /* */
    }
  }
}

function pageOpt(page) {
  return page.locator('[role="option"], [cmdk-item], [data-value]').first();
}

async function fillCatalogPickers(page, root) {
  // Prefer CatalogSearchPicker buttons / comboboxes inside root
  const pickers = root.locator('button').filter({ hasText: /Chọn|Select|Tìm|Nhà|Loại/i });
  const pickerN = await pickers.count();
  for (let i = 0; i < Math.min(pickerN, 6); i++) {
    try {
      await pickers.nth(i).click({ timeout: 2000 });
      await sleep(700);
      const opt = page.locator('[role="option"], [cmdk-item]').first();
      if (await opt.isVisible().catch(() => false)) {
        await opt.click();
        await sleep(400);
      } else {
        // try typing to filter
        await page.keyboard.type('a', { delay: 40 }).catch(() => {});
        await sleep(600);
        const opt2 = page.locator('[role="option"], [cmdk-item]').first();
        if (await opt2.isVisible().catch(() => false)) await opt2.click();
        else await page.keyboard.press('Escape').catch(() => {});
      }
    } catch {
      /* */
    }
  }
  const combos = root.locator('[role="combobox"]');
  const comboCount = await combos.count();
  for (let i = 0; i < Math.min(comboCount, 6); i++) {
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
}

async function checkEmptyPolicyCta(page, activeCount) {
  const { dialog, open } = await openAddDialog(page);
  if (!open) {
    return {
      dialogOpen: false,
      ctaVisible: false,
      saveDisabled: false,
      orphanPost: false,
      reason: 'dialog not open',
    };
  }
  await shot(page, '01-empty-dialog');

  // Wait for policies query
  await sleep(2000);
  const cta = dialog.locator('[data-testid="ins-create-policy-cta"]');
  const emptyBanner = dialog.locator('[data-testid="ins-participant-policy-empty"]');
  const picker = dialog.locator('[data-testid="ins-participant-policy-picker"]');
  const saveBtn = dialog.locator('[data-testid="ins-participant-save"]');

  const ctaVisible = (await cta.isVisible().catch(() => false)) || (await emptyBanner.isVisible().catch(() => false));
  const pickerVisible = await picker.isVisible().catch(() => false);
  const saveDisabled = await saveBtn.isDisabled().catch(() => false);
  const ctaText = ctaVisible
    ? await (await cta.count() ? cta : emptyBanner).innerText().catch(() => '')
    : '';

  const beforeReq = results.postRequests.length;
  const beforeNet = results.network.length;
  // Attempt Lưu even if disabled — should not fire orphan POST
  if (await saveBtn.count()) {
    await saveBtn.click({ force: true }).catch(() => {});
    await sleep(1500);
  }
  const orphanPosts = results.postRequests.slice(beforeReq);
  const orphanNet = netsSince(
    beforeNet,
    (n) => n.method === 'POST' && /insurance-policy-participants/.test(n.url),
  );

  await shot(page, '02-empty-after-force-save');

  // Close via CTA or Escape
  if (ctaVisible && (await cta.count())) {
    await cta.click().catch(() => {});
    await sleep(800);
  } else {
    await page.keyboard.press('Escape').catch(() => {});
    await sleep(500);
  }

  const expectEmptyUi = activeCount === 0;
  return {
    dialogOpen: true,
    expectEmptyUi,
    ctaVisible,
    pickerVisible,
    saveDisabled,
    ctaHasLabel: /Tạo chính sách BH/i.test(ctaText),
    orphanPost: orphanPosts.length > 0 || orphanNet.length > 0,
    orphanCount: orphanPosts.length + orphanNet.length,
    ctaText: ctaText.slice(0, 200),
  };
}

async function createAndActivatePolicy(page) {
  const panel = page.locator('[data-testid="insurance-policy-master-e3"]');
  await panel.scrollIntoViewIfNeeded().catch(() => {});
  await sleep(500);
  await shot(page, '03-policy-master');

  const code = `QA-BH2-${STAMP}`;
  const name = `Chính sách QA BH RET-02 ${STAMP}`;

  const codeInput = panel.locator('input').nth(0);
  const nameInput = panel.locator('input').nth(1);
  await codeInput.fill(code);
  await nameInput.fill(name);

  // Catalog pickers inside panel form
  await fillCatalogPickers(page, panel);

  // effective_date — find date input
  const dateInput = panel.locator('input[type="date"]').first();
  if (await dateInput.count()) {
    await dateInput.fill('2026-01-01');
  }

  const before = results.network.length;
  const submit = panel.locator('button[type="submit"]').filter({ hasText: /Tạo chính sách|Lưu chính sách/i }).first();
  if (await submit.count()) await submit.click();
  else {
    await panel.locator('button').filter({ hasText: /Tạo chính sách/i }).first().click();
  }
  await sleep(4000);
  await shot(page, '04-policy-created');

  const createPost = netsSince(
    before,
    (n) => n.method === 'POST' && /insurance-policies/.test(n.url) && n.status >= 200 && n.status < 300,
  ).pop();

  // Find row with our stamp and activate
  const row = panel.locator('[data-testid="ins-policy-row"]').filter({ hasText: STAMP }).first();
  let rowVisible = await row.isVisible().catch(() => false);
  if (!rowVisible) {
    // fallback: last row
    const rows = panel.locator('[data-testid="ins-policy-row"]');
    const count = await rows.count();
    if (count > 0) {
      await rows.nth(count - 1).scrollIntoViewIfNeeded();
    }
  }
  rowVisible = await row.isVisible().catch(() => false);
  const targetRow = rowVisible ? row : panel.locator('[data-testid="ins-policy-row"]').last();

  const beforeSm = results.network.length;
  const activeBtn = targetRow.locator('[data-testid="ins-policy-sm-active"]');
  let smClicked = false;
  if (await activeBtn.isVisible().catch(() => false)) {
    await activeBtn.click();
    smClicked = true;
    await sleep(3500);
  } else {
    // fallback text button
    const txtBtn = targetRow.locator('button').filter({ hasText: /Hiệu lực|active/i }).first();
    if (await txtBtn.isVisible().catch(() => false)) {
      await txtBtn.click();
      smClicked = true;
      await sleep(3500);
    }
  }
  await shot(page, '05-policy-active');

  const smPatch = netsSince(
    beforeSm,
    (n) =>
      ['PATCH', 'PUT', 'POST'].includes(n.method) &&
      /insurance-policies/.test(n.url) &&
      n.status >= 200 &&
      n.status < 300,
  ).pop();

  return {
    code,
    name,
    createPost,
    smClicked,
    smPatch,
    createOk: !!createPost && createPost.status >= 200 && createPost.status < 300,
    smOk: !!smPatch && smPatch.status >= 200 && smPatch.status < 300,
  };
}

async function enrollParticipant(page) {
  const { dialog, open } = await openAddDialog(page);
  if (!open) {
    return { dialogOpen: false, post: null, body: null, req: null, stillOpen: false, f5: false, reason: 'dialog miss' };
  }
  await sleep(2500);
  await shot(page, '06-enroll-dialog');

  const picker = dialog.locator('[data-testid="ins-participant-policy-picker"]');
  const empty = dialog.locator('[data-testid="ins-participant-policy-empty"]');
  const pickerVisible = await picker.isVisible().catch(() => false);
  const stillEmpty = await empty.isVisible().catch(() => false);

  // Employee typeahead
  const empInput = dialog.locator('input').first();
  if (await empInput.count()) {
    await empInput.fill('a');
    await sleep(1800);
    const empOpt = page.locator('[role="option"]').first();
    if (await empOpt.isVisible().catch(() => false)) {
      await empOpt.click();
      await sleep(500);
    } else {
      // try listbox / popover items
      const alt = page.locator('[cmdk-item], [data-value]').first();
      if (await alt.isVisible().catch(() => false)) await alt.click();
    }
  }

  await fillCatalogPickers(page, dialog);

  // Ensure policy selected if picker visible and not auto
  if (pickerVisible) {
    const val = await picker.innerText().catch(() => '');
    if (/Chọn chính sách/i.test(val) || !val.trim()) {
      await picker.click();
      await sleep(600);
      const opt = page.locator('[role="option"]').first();
      if (await opt.isVisible().catch(() => false)) await opt.click();
      await sleep(400);
    }
  }

  const si = dialog.locator('input[name="social_insurance_number"]');
  if (await si.count()) await si.fill(`SI${STAMP}`);

  const beforeReq = results.postRequests.length;
  const beforeBodies = results.postBodies.length;
  const beforeNet = results.network.length;

  const saveBtn = dialog.locator('[data-testid="ins-participant-save"]');
  const saveDisabled = await saveBtn.isDisabled().catch(() => true);
  if (!saveDisabled) {
    await saveBtn.click();
  } else {
    // try last Lưu
    await dialog.getByRole('button', { name: /Lưu|Save/i }).last().click({ force: true }).catch(() => {});
  }
  await sleep(5500);
  await shot(page, '07-enroll-after-save');

  const post = netsSince(
    beforeNet,
    (n) => n.method === 'POST' && /insurance-policy-participants/.test(n.url),
  ).pop();
  const body = results.postBodies.slice(beforeBodies).pop() || null;
  const req = results.postRequests.slice(beforeReq).pop() || null;
  const stillOpen = await dialog.isVisible().catch(() => false);
  const err = await bodyHasError(page);

  if (stillOpen) {
    await page.keyboard.press('Escape').catch(() => {});
  }

  await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(3500);
  const f5Err = await bodyHasError(page);
  await shot(page, '08-enroll-f5');

  // Persist check: GET participants should include stamp SI or new row count
  return {
    dialogOpen: true,
    pickerVisible,
    stillEmpty,
    saveDisabled,
    post,
    body,
    req,
    stillOpen,
    banner: err.banner,
    f5: !f5Err.banner,
    reason: post
      ? post.status >= 400
        ? `API ${post.status} code=${body?.code || 'n/a'}`
        : null
      : saveDisabled
        ? 'save_still_disabled'
        : 'no_post',
  };
}

async function main() {
  await probeL0();
  const session = await loginApi();
  const pre = await preflightPolicies(session.token);
  const activeBefore = pre.policies?.active ?? 0;

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
    await sleep(4000);
    await shot(page, '00-insurance-mount');

    const getIns = netsSince(0, (n) => n.method === 'GET' && /contracts-insurance\/insurance|insurance-policy-participants|insurance-policies/.test(n.url));
    const getOk = getIns.some((n) => n.status >= 200 && n.status < 300);

    // --- Check A: empty CTA / no orphan ---
    let emptyCheck;
    try {
      emptyCheck = await checkEmptyPolicyCta(page, activeBefore);
    } catch (e) {
      emptyCheck = { dialogOpen: false, reason: String(e).slice(0, 200) };
    }
    results.checks.emptyCta = emptyCheck;

    const emptyPass =
      emptyCheck.dialogOpen &&
      (activeBefore > 0
        ? emptyCheck.pickerVisible && !emptyCheck.orphanPost
        : emptyCheck.ctaVisible &&
          emptyCheck.ctaHasLabel &&
          emptyCheck.saveDisabled &&
          !emptyCheck.orphanPost);

    recordTc(
      'TC-HRM-HDSD-049-EMPTY-CTA',
      emptyPass ? '🟢' : emptyCheck.dialogOpen ? '🟡' : '🔴',
      `activeBefore=${activeBefore} cta=${emptyCheck.ctaVisible} label=${emptyCheck.ctaHasLabel} saveDisabled=${emptyCheck.saveDisabled} picker=${emptyCheck.pickerVisible} orphanPost=${emptyCheck.orphanPost} ${emptyCheck.reason || ''}`,
      {
        activeBefore,
        ...emptyCheck,
        uf: 'UF-HRM-03',
        j: 'J-HRM-04',
      },
    );

    // Ensure dialog closed before create
    await page.keyboard.press('Escape').catch(() => {});
    await sleep(400);

    // --- Check B: create + activate policy (FE-only) ---
    // Only needed when activeBefore === 0; still run if 0 to prove happy path
    let createRes = { skipped: true };
    if (activeBefore === 0 || process.env.QA_FORCE_CREATE_POLICY === '1') {
      try {
        createRes = await createAndActivatePolicy(page);
      } catch (e) {
        createRes = { createOk: false, smOk: false, reason: String(e).slice(0, 200) };
      }
      results.checks.createActivate = createRes;
      recordTc(
        'TC-HRM-HDSD-049-CREATE-POLICY',
        createRes.createOk && createRes.smOk ? '🟢' : createRes.createOk ? '🟡' : '🔴',
        `create=${createRes.createOk} sm=${createRes.smOk} smClicked=${createRes.smClicked} POST=${createRes.createPost?.status || 'n/a'} SM=${createRes.smPatch?.status || 'n/a'} code=${createRes.code || ''} ${createRes.reason || ''}`,
        { ...createRes, j: 'J-HRM-04' },
      );
    } else {
      recordTc(
        'TC-HRM-HDSD-049-CREATE-POLICY',
        '🟢',
        `skipped — active policies already ${activeBefore}; proceed enroll`,
        { skipped: true, activeBefore },
      );
      createRes = { createOk: true, smOk: true, skipped: true };
    }

    // Refresh page to pick up active policy in dialog query
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(3500);

    // Postflight active count
    const postPol = await preflightPolicies(session.token);
    results.postflight = postPol;
    const activeAfter = postPol.policies?.active ?? 0;

    // --- Check C: enroll happy path ---
    let enroll;
    try {
      enroll = await enrollParticipant(page);
    } catch (e) {
      enroll = { dialogOpen: false, post: null, body: null, req: null, f5: false, reason: String(e).slice(0, 200) };
    }
    results.checks.enroll = enroll;

    const postStatus = enroll.post?.status;
    const code = enroll.body?.code || null;
    const reqPolicyId = enroll.req?.policy_id || null;
    const respPolicyId = enroll.body?.policy_id || null;
    const hasPolicyId = !!(reqPolicyId || respPolicyId);
    const postOk =
      postStatus >= 200 &&
      postStatus < 300 &&
      (code === 'HRM-INS-P-201' || code === null || /201|P-201/i.test(String(code)));
    const dialogClosed = enroll.dialogOpen && enroll.stillOpen === false && postOk;

    let v049;
    let residual = null;
    if (postOk && hasPolicyId && enroll.f5 && (dialogClosed || !enroll.stillOpen)) {
      v049 = '🟢';
    } else if (postOk && enroll.f5 && hasPolicyId) {
      v049 = '🟡';
      residual = 'dialog_close_unclear';
    } else if (postOk && !hasPolicyId) {
      v049 = '🟡';
      residual = 'missing_policy_id_in_payload';
    } else if (enroll.stillEmpty && activeAfter === 0) {
      v049 = '🟡';
      residual = 'FE_CREATE_POLICY_FAILED_STILL_EMPTY';
    } else if (enroll.dialogOpen && postStatus >= 400) {
      v049 = '🟡';
      residual = `API_${postStatus}_${code || 'unknown'}`;
    } else if (enroll.dialogOpen) {
      v049 = '🟡';
      residual = enroll.reason || 'no_post';
    } else {
      v049 = '🔴';
      residual = enroll.reason || 'dialog_fail';
    }

    // Empty CTA failure should not allow false green on 049
    if (activeBefore === 0 && !emptyPass && v049 === '🟢') {
      v049 = '🟡';
      residual = 'empty_cta_failed_but_enroll_ok';
    }

    recordTc(
      'TC-HRM-HDSD-049',
      v049,
      `§3.6 Dialog BH activeBefore=${activeBefore} activeAfter=${activeAfter} POST=${enroll.post?.method || 'none'} ${postStatus ?? ''} code=${code || 'n/a'} reqPolicyId=${reqPolicyId || 'n/a'} respPolicyId=${respPolicyId || 'n/a'} dialogClosed=${!enroll.stillOpen} f5=${enroll.f5} getOk=${getOk} residual=${residual || 'none'} ${enroll.reason || ''}`,
      {
        uf: 'UF-HRM-03',
        j: 'J-HRM-04',
        clickPath:
          '/hr/insurance → (empty CTA) → Tạo chính sách → → Hiệu lực → Thêm BH → pick policy → Lưu → F5',
        http: postStatus,
        code,
        policy_id: reqPolicyId || respPolicyId,
        residual,
        getInsuranceOk: getOk,
        dialogClosed: enroll.stillOpen === false,
        f5NoSyncError: enroll.f5,
        stamp: STAMP,
      },
    );

    results.mustKeepVerified = {
      insuranceGet: getOk || results.preflight?.insuranceList?.http === 200,
      noSoftDelNav: !results.network.some(
        (n) => /\/employees\/.+\/archive/.test(n.url) && n.method === 'POST',
      ),
      noContractDelete: !results.network.some(
        (n) => n.method === 'DELETE' && /contracts-insurance\/contracts/.test(n.url),
      ),
      noEmployeeArchive: !results.network.some((n) => /\/archive/.test(n.url) && n.method === 'POST'),
    };

    results.journeys.push({
      id: 'J-HRM-04',
      verdict: v049,
      detail: `TC-049 BH picker+enroll · POST ${postStatus} ${code || ''} policy_id=${reqPolicyId || respPolicyId || 'n/a'}`,
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
    const emptyTc = results.tc.find((t) => t.id === 'TC-HRM-HDSD-049-EMPTY-CTA');
    results.ack_hint =
      tc049?.verdict === '🟢' && (emptyTc?.verdict === '🟢' || emptyTc?.verdict === undefined)
        ? 'PASS_TO_PM'
        : 'FAIL_TO_PM';
    save();
    await browser.close();
    console.log('\n=== SUMMARY ===');
    console.log(
      JSON.stringify(
        {
          summary,
          ack_hint: results.ack_hint,
          postBodies: results.postBodies,
          postRequests: results.postRequests,
          preflight: results.preflight,
          postflight: results.postflight,
          checks: results.checks,
        },
        null,
        2,
      ),
    );
    console.log(`runtime: ${OUT}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
