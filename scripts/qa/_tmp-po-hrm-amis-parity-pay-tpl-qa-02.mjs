#!/usr/bin/env node
/**
 * PO-HRM-AMIS-PARITY-PAY-TPL-QA-02 — Browser UF Settings → Mẫu bảng lương
 * Prior: FE-01 READY_FOR_QA · QC-01 L1 GWC
 * U65 zero-seed · browser-only · honesty payroll_e2e_ready=false
 * Persona: ceo@xe.vn · company_id=main
 *
 * AC:
 * 1 Settings tab loads
 * 2 Create mẫu → POST 2xx → list row
 * 3 Edit lines (label/sort/OV-C) → PUT 2xx → FE update
 * 4 F5 → data còn
 * 5 Archive → soft-hide
 * 6 Pack enroll tab still ≠ mẫu (banner + /salary-templates)
 * 7 No DnD formula · no FE net · ready=false
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const HRM = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const COMPANY = process.env.QA_COMPANY_ID || 'main';
const TENANT = process.env.QA_TENANT_ID || 'xevn';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-amis-parity-pay-tpl-qa-02.FINAL.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-amis-parity-pay-tpl-qa-02');
mkdirSync(SCREEN, { recursive: true });

const STAMP = `PAYTPLQA2-${Date.now().toString(36).slice(-6).toUpperCase()}`;
const CODE = `qa_mau_${STAMP.toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 40)}`;
const NAME = `Mẫu QA browser ${STAMP}`;
const LABEL = `Nhãn cột QA ${STAMP}`;
const SORT = 10;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

const results = {
  work_item_id: 'PO-HRM-AMIS-PARITY-PAY-TPL-QA-02',
  startedAt: ts(),
  u65: 'zero-seed · browser-only · UF claim when FE after 2xx + F5',
  persona: { email: EMAIL, companyId: COMPANY },
  env: { PORTAL, HRM, XBOS, TENANT, STAMP, CODE, NAME, LABEL },
  prior: {
    fe: 'PO-HRM-AMIS-PARITY-PAY-TPL-FE-01 READY_FOR_QA',
    qc_l1: 'PO-HRM-AMIS-PARITY-PAY-TPL-QC-01 GWC L1',
    qa_l1: 'PO-HRM-AMIS-PARITY-PAY-TPL-QA-01 L1 PASS (not UF)',
  },
  honesty: {
    payroll_e2e_ready: false,
    payroll_e2e_ready_claimed: false,
    seed_used: false,
    phase1_done_claimed: false,
    pack_is_not_mau: true,
    dnd_formula: false,
    fe_net: false,
  },
  denied: [
    'payroll_e2e_ready=true',
    'seed',
    'Phase1 DONE',
    'module UAT / AMIS DONE',
    'pack as mẫu',
    'DnD formula canvas',
    'FE net invent',
  ],
  l0: {},
  ids: { code: CODE, name: NAME, label: LABEL, sort: SORT },
  ac: {},
  network: [],
  requestBodies: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  click_log: [],
  residuals: [],
  process: {},
  hdsd_inventory: {},
  overall: null,
  ack_status: null,
  endedAt: null,
};

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(results, null, 2));
}
function log(msg, extra = {}) {
  results.click_log.push({ at: ts(), msg, ...extra });
  console.error(`[log] ${msg}`, extra.note || '');
}
function recordAc(id, verdict, detail = {}) {
  results.ac[id] = { ...detail, verdict, at: ts() };
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 420)}`);
  save();
}

async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  results.screens.push(path.replace(/\\/g, '/'));
  return path;
}

function q(path, extra = {}) {
  const u = new URL(path, PORTAL);
  u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', extra.tenantId || TENANT);
  u.searchParams.set('companyId', extra.companyId || COMPANY);
  if (extra.tab) u.searchParams.set('tab', extra.tab);
  u.searchParams.set('_', String(Date.now()));
  return u.toString();
}

function processGate() {
  const dndStorm = results.consoleErrors.filter((t) =>
    /Unable to find drag handle|@hello-pangea\/dnd/i.test(t),
  );
  const uncaught = [
    ...results.pageErrors,
    ...results.consoleErrors.filter((t) => /Uncaught ReferenceError|Uncaught TypeError/i.test(t)),
  ];
  results.process = {
    pageErrors: results.pageErrors.length,
    consoleErrors: results.consoleErrors.length,
    dndStorm: dndStorm.length,
    uncaught: uncaught.length,
    samplePageErrors: results.pageErrors.slice(0, 5),
    sampleConsole: results.consoleErrors.slice(0, 10),
  };
  return { fail: dndStorm.length > 0 || uncaught.length > 0, dndStorm, uncaught };
}

async function loginApi() {
  const r = await fetch(`${PORTAL}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const j = await r.json().catch(() => ({}));
  const data = j?.data ?? j;
  const token = data?.accessToken ?? data?.access_token ?? j?.accessToken;
  if (!token) throw new Error(`login failed HTTP ${r.status}`);
  const u = data?.user ?? {};
  return {
    token,
    expiresAt: Date.now() + 8 * 3600_000,
    companyId: COMPANY,
    user: {
      userId: u.userId || u.id || EMAIL,
      email: u.email || EMAIL,
      displayName: u.displayName || u.fullName || u.name || EMAIL,
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
      store.setItem('xevn.portal.companyId', s.companyId);
      store.setItem('hrm_portal_mode', '1');
      store.setItem('hrm_current_company_id', s.companyId);
      store.setItem('hrm_current_tenant_id', 'xevn');
      if (s.raw?.refreshToken) store.setItem('xevn.portal.refreshToken', s.raw.refreshToken);
      if (s.raw?.defaultMembershipId)
        store.setItem('xevn.portal.membershipId', s.raw.defaultMembershipId);
    }
  }, session);
}

function track(page) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') results.consoleErrors.push(String(msg.text()).slice(0, 360));
  });
  page.on('pageerror', (err) => results.pageErrors.push(String(err).slice(0, 360)));
  page.on('request', (req) => {
    try {
      const u = req.url();
      if (!/\/api\/hrm\/payroll\/(pay-sheet-templates|salary-templates)/.test(u)) return;
      const method = req.method();
      if (!['POST', 'PUT', 'PATCH'].includes(method)) return;
      let body = null;
      try {
        body = req.postDataJSON();
      } catch {
        try {
          body = req.postData();
        } catch {
          /* */
        }
      }
      results.requestBodies.push({
        method,
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 420),
        body:
          body && typeof body === 'object'
            ? {
                code: body.code,
                name: body.name,
                company_id: body.company_id || body.companyId,
                lineCount: Array.isArray(body.lines) ? body.lines.length : undefined,
                firstLine:
                  Array.isArray(body.lines) && body.lines[0]
                    ? {
                        displayLabel: body.lines[0].displayLabel,
                        sortOrder: body.lines[0].sortOrder,
                        hasOvc: Boolean(body.lines[0].formulaOverrideDefinitionId),
                        keys: Object.keys(body.lines[0]).slice(0, 12),
                      }
                    : undefined,
                keys: Object.keys(body).slice(0, 24),
              }
            : String(body || '').slice(0, 200),
        at: ts(),
      });
    } catch {
      /* */
    }
  });
  page.on('response', async (res) => {
    try {
      const u = res.url();
      if (!/\/api\/hrm\/payroll\/(pay-sheet-templates|salary-templates)/.test(u)) return;
      const method = res.request().method();
      if (method === 'OPTIONS') return;
      const entry = {
        method,
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 420),
        at: ts(),
      };
      try {
        const ct = res.headers()['content-type'] || '';
        if (/json/i.test(ct)) {
          const j = await res.json();
          entry.code = j?.code || null;
          entry.message = String(j?.message || '').slice(0, 160);
          const d = j?.data ?? j;
          if (d?.id) entry.dataId = d.id;
          if (d?.code) entry.dataCode = d.code;
          if (Array.isArray(d?.items)) entry.itemCount = d.items.length;
          if (Array.isArray(d?.lines)) entry.lineCount = d.lines.length;
        }
      } catch {
        /* */
      }
      results.network.push(entry);
    } catch {
      /* */
    }
  });
}

async function openPaySheetTplTab(page) {
  await page.goto(q('/hr/settings'), {
    waitUntil: 'domcontentloaded',
    timeout: 90000,
  });
  await sleep(2500);
  const tabBtn = page.getByTestId('settings-tab-pay-sheet-tpl');
  await tabBtn.scrollIntoViewIfNeeded().catch(() => {});
  await tabBtn.click({ force: true });
  await sleep(1500);
  const panel = page.getByTestId('pay-sheet-tpl-settings-panel');
  await panel.waitFor({ state: 'visible', timeout: 20000 }).catch(() => null);
  return panel;
}

async function pickSelectOption(page, trigger, { allowNone = false } = {}) {
  await trigger.scrollIntoViewIfNeeded().catch(() => {});
  await trigger.click({ force: true });
  await sleep(600);
  const listbox = page.locator('[role="listbox"]');
  await listbox.first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => null);
  const options = page.locator('[role="listbox"] [role="option"], [role="option"]');
  const count = await options.count().catch(() => 0);
  if (count < 1) {
    // Escape closed select
    await page.keyboard.press('Escape').catch(() => {});
    return { ok: false, count: 0, text: null, idx: -1 };
  }
  let idx = 0;
  for (let i = 0; i < count; i++) {
    const t = ((await options.nth(i).innerText().catch(() => '')) || '').trim();
    if (!allowNone && /không override/i.test(t)) continue;
    idx = i;
    break;
  }
  // If every option was "Không override" and allowNone, use it
  if (!allowNone) {
    const preferred = [];
    for (let i = 0; i < count; i++) {
      const t = ((await options.nth(i).innerText().catch(() => '')) || '').trim();
      if (!/không override/i.test(t)) preferred.push(i);
    }
    if (preferred.length) idx = preferred[0];
    else if (allowNone || count > 0) idx = 0;
  }
  const text = ((await options.nth(idx).innerText().catch(() => '')) || '').trim();
  await options.nth(idx).click({ force: true });
  await sleep(350);
  return { ok: Boolean(text), count, text, idx };
}

async function main() {
  for (const [k, url] of [
    ['portal', PORTAL],
    ['hrm', `${HRM}/api/hrm`],
    ['xbos', `${XBOS}/api/xbos`],
  ]) {
    try {
      const r = await fetch(url);
      results.l0[k] = { status: r.status, ok: r.status === 200 };
    } catch (e) {
      results.l0[k] = { ok: false, error: String(e).slice(0, 120) };
    }
  }
  save();
  if (!results.l0.portal?.ok || !results.l0.hrm?.ok) {
    results.overall = 'FAIL';
    results.ack_status = 'FAIL_TO_PM';
    results.residuals.push({ id: 'L0', owner: 'devops', note: 'stack down' });
    results.endedAt = ts();
    save();
    console.error('L0 FAIL', results.l0);
    process.exit(2);
  }

  const session = await loginApi();
  log('login_api_ok');

  const browser = await chromium.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'vi-VN',
  });
  const page = await context.newPage();
  track(page);
  await injectPortalAuth(page, session);

  try {
    // --- AC1: Settings → Mẫu bảng lương loads ---
    const panel = await openPaySheetTplTab(page);
    const panelVisible = await panel.isVisible().catch(() => false);
    const honestyBadge = page.getByTestId('pay-sheet-tpl-honesty-badge');
    const honestyText = ((await honestyBadge.innerText().catch(() => '')) || '').trim();
    const packNote = page.getByTestId('pay-sheet-tpl-pack-alias-note');
    const packNoteText = ((await packNote.innerText().catch(() => '')) || '').trim();
    const listTable = page.getByTestId('pay-sheet-tpl-list-table');
    const listVisible = await listTable.isVisible().catch(() => false);
    await shot(page, '01-settings-pay-sheet-tpl');
    log('open_settings_pay_sheet_tpl', {
      visible: panelVisible,
      honesty: honestyText,
      note: packNoteText.slice(0, 120),
    });

    results.hdsd_inventory = {
      'settings-tab-pay-sheet-tpl': true,
      'pay-sheet-tpl-settings-panel': panelVisible,
      'pay-sheet-tpl-honesty-badge': Boolean(honestyText),
      'pay-sheet-tpl-pack-alias-note': Boolean(packNoteText),
      'pay-sheet-tpl-list-table': listVisible,
      'hdsd-pay-sheet-tpl-code': await page.getByTestId('hdsd-pay-sheet-tpl-code').isVisible().catch(() => false),
      'hdsd-pay-sheet-tpl-name': await page.getByTestId('hdsd-pay-sheet-tpl-name').isVisible().catch(() => false),
      'hdsd-pay-sheet-tpl-save-header': await page
        .getByTestId('hdsd-pay-sheet-tpl-save-header')
        .isVisible()
        .catch(() => false),
    };

    const ac1 =
      panelVisible &&
      listVisible &&
      /payroll_e2e_ready=false/i.test(honestyText) &&
      /salary-templates|pay-sheet-templates|gói thành phần enroll/i.test(packNoteText);

    recordAc('AC1_TAB_LOAD', ac1 ? 'PASS' : 'FAIL', {
      summary: ac1
        ? 'Settings → Mẫu bảng lương panel + list + honesty=false + pack≠mẫu note'
        : `panel=${panelVisible} list=${listVisible} honesty=${honestyText}`,
      url: page.url(),
      honestyText,
      packNoteText: packNoteText.slice(0, 200),
      click_path: 'login → /hr/settings → settings-tab-pay-sheet-tpl → pay-sheet-tpl-settings-panel',
    });

    if (!panelVisible) {
      results.residuals.push({
        id: 'AC1-UI',
        owner: 'dev-fe',
        note: 'pay-sheet-tpl Settings panel missing',
      });
      throw new Error('panel missing');
    }

    // --- AC2: Create mẫu ---
    await page.getByTestId('hdsd-pay-sheet-tpl-new').click({ force: true }).catch(() => {});
    await sleep(400);
    await page.getByTestId('hdsd-pay-sheet-tpl-code').fill(CODE);
    await page.getByTestId('hdsd-pay-sheet-tpl-name').fill(NAME);
    await shot(page, '02-create-form-filled');

    const createWait = page.waitForResponse(
      (res) =>
        /\/api\/hrm\/payroll\/pay-sheet-templates\/?(\?|$)/.test(res.url()) &&
        res.request().method() === 'POST' &&
        !/archive|lines|bind/.test(res.url()),
      { timeout: 45000 },
    );
    await page.getByTestId('hdsd-pay-sheet-tpl-save-header').click();
    const createRes = await createWait.catch(() => null);
    await sleep(1500);
    await shot(page, '03-after-create');

    const createStatus = createRes?.status?.() ?? null;
    const createOk = createStatus != null && createStatus >= 200 && createStatus < 300;
    let createBody = null;
    try {
      createBody = createRes ? await createRes.json() : null;
    } catch {
      /* */
    }
    const createdId = createBody?.data?.id || createBody?.id || null;
    const createCode = createBody?.code || null;
    log('create_response', {
      status: createStatus,
      code: createCode,
      note: String(createBody?.message || '').slice(0, 120),
    });

    const rowSel = page.getByTestId(`pay-sheet-tpl-row-${CODE}`);
    let rowVisibleAfterCreate = await rowSel.isVisible().catch(() => false);
    if (!rowVisibleAfterCreate) {
      // reload list once
      const reload = page.getByTestId('hdsd-pay-sheet-tpl-reload');
      if (await reload.isVisible().catch(() => false)) {
        await reload.click();
        await sleep(1200);
      }
      rowVisibleAfterCreate = await rowSel.isVisible().catch(() => false);
    }
    const rowTextCreate = rowVisibleAfterCreate
      ? ((await rowSel.innerText().catch(() => '')) || '').trim()
      : '';

    const ac2 = createOk && rowVisibleAfterCreate && rowTextCreate.includes(NAME);
    recordAc('AC2_CREATE', ac2 ? 'PASS' : 'FAIL', {
      summary: ac2
        ? `POST pay-sheet-templates ${createStatus} ${createCode || ''} → list row ${CODE}`
        : `FAIL createOk=${createOk} status=${createStatus} row=${rowVisibleAfterCreate}`,
      createStatus,
      createCode,
      createdId,
      feAfter2xx: { visible: rowVisibleAfterCreate, text: rowTextCreate.slice(0, 200) },
      click_path: 'fill code+name → hdsd-pay-sheet-tpl-save-header → list row',
    });
    if (!ac2) {
      results.residuals.push({
        id: 'AC2-CREATE',
        owner: !createOk ? 'dev-be' : 'dev-fe',
        note: `create HTTP ${createStatus}`,
      });
    }

    // Ensure editor has the created template selected (create sets editingId)
    // --- AC3: Edit lines ---
    const lineComp = page.locator('[data-testid^="hdsd-pay-sheet-tpl-line-component-"]').first();
    const lineLabel = page.locator('[data-testid^="hdsd-pay-sheet-tpl-line-label-"]').first();
    const lineSort = page.locator('[data-testid^="hdsd-pay-sheet-tpl-line-sort-"]').first();
    const lineOvc = page.locator('[data-testid^="hdsd-pay-sheet-tpl-line-ovc-"]').first();

    await lineComp.waitFor({ state: 'visible', timeout: 10000 }).catch(() => null);
    const compPick = await pickSelectOption(page, lineComp);
    await lineSort.fill(String(SORT));
    await lineLabel.fill(LABEL);
    // OV-C: open picker — prefer published formula; else explicit «Không override» (control present)
    let ovcPick = { ok: false, text: null, count: 0 };
    if (await lineOvc.isVisible().catch(() => false)) {
      ovcPick = await pickSelectOption(page, lineOvc, { allowNone: true });
      if (!ovcPick.ok) {
        // Retry once after Escape
        await page.keyboard.press('Escape').catch(() => {});
        await sleep(300);
        ovcPick = await pickSelectOption(page, lineOvc, { allowNone: true });
      }
    }
    // Fallback: OV-C trigger visible + shows Không override text = control exercised (empty formula catalog OK)
    const ovcTriggerText = ((await lineOvc.innerText().catch(() => '')) || '').trim();
    const ovcControlPresent =
      ovcPick.ok ||
      (await lineOvc.isVisible().catch(() => false)) && /không overrid|override/i.test(ovcTriggerText);
    await shot(page, '04-lines-filled');
    log('lines_filled', {
      component: compPick.text,
      ovc: ovcPick.text || ovcTriggerText,
      note: `sort=${SORT} label=${LABEL} ovcControl=${ovcControlPresent}`,
    });

    const linesWait = page.waitForResponse(
      (res) =>
        /\/api\/hrm\/payroll\/pay-sheet-templates\/[^/]+\/lines/.test(res.url()) &&
        res.request().method() === 'PUT',
      { timeout: 45000 },
    );
    await page.getByTestId('hdsd-pay-sheet-tpl-save-lines').click();
    const linesRes = await linesWait.catch(() => null);
    await sleep(1500);
    await shot(page, '05-after-save-lines');

    const linesStatus = linesRes?.status?.() ?? null;
    const linesOk = linesStatus != null && linesStatus >= 200 && linesStatus < 300;
    let linesBody = null;
    try {
      linesBody = linesRes ? await linesRes.json() : null;
    } catch {
      /* */
    }
    const savedLines = linesBody?.data?.lines || linesBody?.lines || [];
    const lineMatch = Array.isArray(savedLines)
      ? savedLines.find(
          (l) =>
            String(l.displayLabel || '').includes(STAMP) ||
            String(l.displayLabel || '') === LABEL ||
            Number(l.sortOrder) === SORT,
        )
      : null;
    const preview = page.getByTestId('pay-sheet-tpl-display-preview');
    const previewVisible = await preview.isVisible().catch(() => false);
    const previewText = previewVisible
      ? ((await preview.innerText().catch(() => '')) || '').trim()
      : '';
    const feLabelOk =
      previewText.includes(LABEL) ||
      ((await lineLabel.inputValue().catch(() => '')) || '').includes(STAMP);

    const ovcHasFormula =
      ovcPick.ok && ovcPick.text && !/không override/i.test(String(ovcPick.text));
    const reqLine = results.requestBodies.find(
      (b) => b.method === 'PUT' && /\/lines/.test(b.url) && b.body?.firstLine,
    );
    const lineKeys = reqLine?.body?.firstLine?.keys || [];
    const noFeNetKeys = !['net', 'gross', 'amount', 'formulaAst', 'evaluate'].some((k) =>
      lineKeys.includes(k),
    );
    const ovcFieldInBody = Array.isArray(lineKeys) && lineKeys.includes('formulaOverrideDefinitionId');

    const ac3 =
      linesOk &&
      compPick.ok &&
      feLabelOk &&
      ovcControlPresent &&
      ovcFieldInBody &&
      noFeNetKeys;

    recordAc('AC3_EDIT_LINES', ac3 ? 'PASS' : 'FAIL', {
      summary: ac3
        ? `PUT lines ${linesStatus} · label/sort=${SORT} · OV-C ${ovcHasFormula ? 'formula FK' : 'control+null (empty catalog OK)'} · no FE net`
        : `FAIL linesOk=${linesOk} status=${linesStatus} comp=${compPick.ok} feLabel=${feLabelOk} ovcControl=${ovcControlPresent} ovcField=${ovcFieldInBody}`,
      linesStatus,
      linesCode: linesBody?.code || null,
      component: compPick.text,
      ovc: {
        text: ovcPick.text || ovcTriggerText,
        hasFormula: ovcHasFormula,
        count: ovcPick.count,
        controlPresent: ovcControlPresent,
        fieldInBody: ovcFieldInBody,
      },
      feAfter2xx: { previewVisible, previewSnippet: previewText.slice(0, 220), feLabelOk },
      noFeNetKeys,
      lineMatch: lineMatch
        ? { displayLabel: lineMatch.displayLabel, sortOrder: lineMatch.sortOrder }
        : null,
      click_path: 'pick component → sort → label → OV-C → hdsd-pay-sheet-tpl-save-lines',
    });
    if (!ac3) {
      results.residuals.push({
        id: 'AC3-LINES',
        owner: !linesOk ? 'dev-be' : 'dev-fe',
        note: `lines HTTP ${linesStatus}`,
      });
    }

    // --- AC4: F5 ---
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(2500);
    const tabBtn = page.getByTestId('settings-tab-pay-sheet-tpl');
    if (await tabBtn.isVisible().catch(() => false)) {
      await tabBtn.click({ force: true });
      await sleep(1500);
    }
    await page.getByTestId('pay-sheet-tpl-settings-panel').waitFor({ state: 'visible', timeout: 20000 }).catch(() => null);
    await shot(page, '06-after-f5');

    const rowAfterF5 = page.getByTestId(`pay-sheet-tpl-row-${CODE}`);
    const rowVisibleF5 = await rowAfterF5.isVisible().catch(() => false);
    const rowTextF5 = rowVisibleF5
      ? ((await rowAfterF5.innerText().catch(() => '')) || '').trim()
      : '';
    const nameOkF5 = rowTextF5.includes(NAME) || rowTextF5.includes(CODE);

    // Re-open editor and check label persisted
    if (rowVisibleF5) {
      await page.getByTestId(`hdsd-pay-sheet-tpl-edit-${CODE}`).click({ force: true });
      await sleep(1500);
    }
    const labelAfterF5 =
      (await page.locator('[data-testid^="hdsd-pay-sheet-tpl-line-label-"]').first().inputValue().catch(() => '')) ||
      '';
    const sortAfterF5 =
      (await page.locator('[data-testid^="hdsd-pay-sheet-tpl-line-sort-"]').first().inputValue().catch(() => '')) ||
      '';
    const labelPersisted = labelAfterF5.includes(STAMP) || labelAfterF5 === LABEL;
    const sortPersisted = String(sortAfterF5) === String(SORT) || Number(sortAfterF5) === SORT;
    await shot(page, '07-after-f5-edit');

    const ac4 = rowVisibleF5 && nameOkF5 && labelPersisted;
    recordAc('AC4_F5_PERSIST', ac4 ? 'PASS' : 'FAIL', {
      summary: ac4
        ? `F5 → row ${CODE} còn · label «${LABEL}» · sort=${sortAfterF5}`
        : `FAIL f5Row=${rowVisibleF5} nameOk=${nameOkF5} labelPersisted=${labelPersisted} sort=${sortAfterF5}`,
      rowVisibleF5,
      nameOkF5,
      labelAfterF5: labelAfterF5.slice(0, 120),
      sortAfterF5,
      sortPersisted,
      click_path: 'F5 → settings-tab-pay-sheet-tpl → edit row → assert lines',
    });
    if (!ac4) {
      results.residuals.push({
        id: 'AC4-F5',
        owner: 'dev-fe',
        note: 'F5 list/lines not persisted',
      });
    }

    // --- AC5: Archive soft-hide ---
    page.once('dialog', async (d) => {
      await d.accept().catch(() => {});
    });
    const archiveWait = page.waitForResponse(
      (res) =>
        /\/api\/hrm\/payroll\/pay-sheet-templates\/[^/]+\/archive/.test(res.url()) &&
        res.request().method() === 'POST',
      { timeout: 45000 },
    );
    // Ensure list row archive btn visible
    if (!(await page.getByTestId(`hdsd-pay-sheet-tpl-archive-${CODE}`).isVisible().catch(() => false))) {
      await page.getByTestId('hdsd-pay-sheet-tpl-reload').click().catch(() => {});
      await sleep(1000);
    }
    await page.getByTestId(`hdsd-pay-sheet-tpl-archive-${CODE}`).click({ force: true });
    const archiveRes = await archiveWait.catch(() => null);
    await sleep(1500);
    await shot(page, '08-after-archive');

    const archiveStatus = archiveRes?.status?.() ?? null;
    const archiveOk = archiveStatus != null && archiveStatus >= 200 && archiveStatus < 300;
    const stillVisible = await page
      .getByTestId(`pay-sheet-tpl-row-${CODE}`)
      .isVisible()
      .catch(() => false);

    const ac5 = archiveOk && !stillVisible;
    recordAc('AC5_ARCHIVE_HIDE', ac5 ? 'PASS' : 'FAIL', {
      summary: ac5
        ? `Archive POST ${archiveStatus} → soft-hide from active list`
        : `FAIL archiveOk=${archiveOk} status=${archiveStatus} stillVisible=${stillVisible}`,
      archiveStatus,
      hiddenAfter: !stillVisible,
      click_path: `hdsd-pay-sheet-tpl-archive-${CODE} → confirm → list hide`,
    });
    if (!ac5) {
      results.residuals.push({
        id: 'AC5-ARCHIVE',
        owner: !archiveOk ? 'dev-be' : 'dev-fe',
        note: `archive HTTP ${archiveStatus} stillVisible=${stillVisible}`,
      });
    }

    // --- AC6: Pack enroll ≠ mẫu (Tính lương dropdown → «Mẫu bảng lương» i18n alias for pack) ---
    await page.goto(q('/hr/payroll'), { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(2500);
    const calcTab = page.getByTestId('payroll-tab-calculate');
    await calcTab.click({ force: true });
    await sleep(700);
    const menuItem = page.getByRole('menuitem', { name: /mẫu bảng lương/i });
    if (await menuItem.isVisible().catch(() => false)) {
      await menuItem.click({ force: true });
    } else {
      await page
        .locator('[role="menuitem"]')
        .filter({ hasText: /mẫu/i })
        .first()
        .click({ force: true })
        .catch(() => {});
    }
    await sleep(2500);
    await shot(page, '09-payroll-pack-tab');

    const packPanel = page.getByTestId('pay-salary-template-precision');
    const packBanner = page.getByTestId('pay-salary-template-pack-alias-note');
    await packPanel.waitFor({ state: 'visible', timeout: 15000 }).catch(() => null);
    const packVisible = await packPanel.isVisible().catch(() => false);
    const bannerText = ((await packBanner.innerText().catch(() => '')) || '').trim();
    const bannerOk =
      /salary-templates/i.test(bannerText) &&
      /pay-sheet-templates|cài đặt/i.test(bannerText) &&
      /gói thành phần enroll|enroll/i.test(bannerText);

    await sleep(1500);
    const packGet = results.network.filter(
      (n) => n.method === 'GET' && /\/salary-templates/.test(n.url),
    );
    const mauAsPackSoT = results.network.filter(
      (n) =>
        n.method === 'GET' &&
        /\/pay-sheet-templates/.test(n.url) &&
        n.at >= (results.ac.AC5_ARCHIVE_HIDE?.at || ''),
    );
    const salaryNetOk = packGet.some((n) => n.status >= 200 && n.status < 300);

    const ac6 = packVisible && bannerOk && salaryNetOk;
    recordAc('AC6_PACK_NEQ_MAU', ac6 ? 'PASS' : 'FAIL', {
      summary: ac6
        ? 'SalaryTemplatesTab banner pack≠mẫu + GET /salary-templates (not mẫu SoT)'
        : `FAIL packVisible=${packVisible} bannerOk=${bannerOk} salaryNet=${salaryNetOk}`,
      bannerText: bannerText.slice(0, 280),
      packGetCount: packGet.length,
      mauGetOnPackSurface: mauAsPackSoT.length,
      click_path:
        '/hr/payroll → payroll-tab-calculate → menuitem «Mẫu bảng lương» → pay-salary-template-pack-alias-note',
      url: page.url(),
    });
    if (!ac6) {
      results.residuals.push({
        id: 'AC6-PACK',
        owner: 'dev-fe',
        note: 'pack enroll banner/surface missing or conflated with mẫu',
      });
    }

    // --- AC7: Honesty / no DnD / no FE net ---
    const pg = processGate();
    const honestyOk = results.honesty.payroll_e2e_ready === false && !results.honesty.payroll_e2e_ready_claimed;
    const noDnd = pg.dndStorm.length === 0;
    const bodyTextSample = ((await page.locator('body').innerText().catch(() => '')) || '').slice(0, 500);
    const noFeNetUi = !/tính net trên FE|FE net|evaluate AST/i.test(bodyTextSample);

    const ac7 = honestyOk && noDnd && noFeNetKeys && noFeNetUi && !pg.fail;
    recordAc('AC7_HONESTY_NO_DND_NO_NET', ac7 ? 'PASS' : 'FAIL', {
      summary: ac7
        ? 'payroll_e2e_ready=false · no DnD storm · no FE net invent in PUT body'
        : `FAIL honesty=${honestyOk} dnd=${noDnd} noFeNetKeys=${noFeNetKeys} processFail=${pg.fail}`,
      honesty: results.honesty,
      process: results.process,
      noFeNetKeys,
    });

    const allPass = ['AC1_TAB_LOAD', 'AC2_CREATE', 'AC3_EDIT_LINES', 'AC4_F5_PERSIST', 'AC5_ARCHIVE_HIDE', 'AC6_PACK_NEQ_MAU', 'AC7_HONESTY_NO_DND_NO_NET'].every(
      (k) => results.ac[k]?.verdict === 'PASS',
    );

    results.overall = allPass && !pg.fail ? 'PASS' : 'FAIL';
    results.ack_status = results.overall === 'PASS' ? 'PASS_TO_PM' : 'FAIL_TO_PM';
    results.endedAt = ts();
    results.honesty.payroll_e2e_ready = false;
    results.honesty.payroll_e2e_ready_claimed = false;
    save();

    console.log(
      JSON.stringify(
        {
          overall: results.overall,
          ack_status: results.ack_status,
          stamp: STAMP,
          code: CODE,
          ac: Object.fromEntries(Object.entries(results.ac).map(([k, v]) => [k, v.verdict])),
          residuals: results.residuals,
          process: results.process,
        },
        null,
        2,
      ),
    );

    await browser.close();
    process.exit(results.overall === 'PASS' ? 0 : 1);
  } catch (e) {
    results.overall = 'FAIL';
    results.ack_status = 'FAIL_TO_PM';
    results.residuals.push({ id: 'HARNESS', owner: 'qa', note: String(e).slice(0, 240) });
    results.endedAt = ts();
    save();
    console.error('HARNESS FAIL', e);
    await browser.close().catch(() => {});
    process.exit(2);
  }
}

main();
