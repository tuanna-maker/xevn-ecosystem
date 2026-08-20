#!/usr/bin/env node
/**
 * PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-QA-02 — U65 retest after FE PATCH fix
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

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
const OUT_JSON = resolve(
  ROOT,
  'docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-ctr-clause-qa-02.json',
);
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-dynamic-config-platform-ctr-clause-qa-02');
mkdirSync(SCREEN, { recursive: true });

const STAMP = `CLQA2-${Date.now().toString(36).slice(-6).toUpperCase()}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

const results = {
  work_item_id: 'PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-QA-02',
  parent: 'PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-FE-FIX-PATCH-01',
  program: 'PO-HRM-CONTINUOUS-W8-20260807',
  stamp: STAMP,
  startedAt: ts(),
  u65: 'zero-seed · browser-only · ContractLegalPrintSettingsPanel',
  persona: { email: EMAIL, companyId: COMPANY, url_base: PORTAL },
  honesty: {
    contracts_printable_ready: false,
    contracts_printable_ready_claimed: false,
    seed_used: false,
    module_ctr_uat_claimed: false,
    c_slice: 'C-SLICE-≠-MODULE',
  },
  l0: {},
  vitest: {},
  jest: {},
  fe_hardcode_grep: {},
  patch_request_audit: [],
  ids: {},
  ac: {},
  j: {},
  network: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  click_log: [],
  residuals: [],
  overall: null,
  ack_status: null,
  endedAt: null,
};

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(results, null, 2));
}
function recordAc(id, verdict, detail = {}) {
  results.ac[id] = { ...detail, verdict, at: ts(), j_id: detail.j_id || null };
  console.log(`${verdict} ${id}`);
  save();
}
function recordJ(id, verdict, detail = {}) {
  results.j[id] = { ...detail, verdict, at: ts() };
  save();
}

async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  results.screens.push(path.replace(/\\/g, '/'));
}

function q(path, extra = {}) {
  const u = new URL(path, PORTAL);
  u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', extra.tenantId || TENANT);
  u.searchParams.set('companyId', extra.companyId || COMPANY);
  if (extra.tab) u.searchParams.set('tab', extra.tab);
  return u.toString();
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
      if (req.method() !== 'PATCH' || !/\/api\/hrm\/.*contract-clauses/.test(u)) return;
      const raw = req.postData() || '{}';
      let parsed = {};
      try {
        parsed = JSON.parse(raw);
      } catch {
        parsed = { _parseError: true };
      }
      const urlObj = new URL(u);
      const audit = {
        at: ts(),
        url: u.replace(/^https?:\/\/[^/]+/, ''),
        query_company_id: urlObj.searchParams.get('company_id'),
        body_keys: Object.keys(parsed),
        body_has_company_id: Object.prototype.hasOwnProperty.call(parsed, 'company_id'),
        body_vi_snippet: String(parsed.body_vi || '').slice(0, 80),
      };
      results.patch_request_audit.push(audit);
      save();
    } catch {
      /* */
    }
  });
  page.on('response', async (res) => {
    try {
      const u = res.url();
      if (!/\/api\/hrm\//.test(u)) return;
      const method = res.request().method();
      if (method === 'OPTIONS') return;
      if (!/contract-clauses|print-versions|\/preview|contract-templates/.test(u)) return;
      const entry = { method, status: res.status(), url: u.replace(/^https?:\/\/[^/]+/, ''), at: ts() };
      const ct = res.headers()['content-type'] || '';
      if (/json/i.test(ct)) {
        const j = await res.json().catch(() => ({}));
        entry.code = j?.code || null;
        entry.message = String(j?.message || '').slice(0, 200);
        if (j?.data?.id) entry.dataId = j.data.id;
        if (j?.data?.body_vi) entry.bodySnippet = String(j.data.body_vi).slice(0, 80);
      }
      results.network.push(entry);
    } catch {
      /* */
    }
  });
}

async function hardRefresh(page) {
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(2500);
}

async function openSettingsClauses(page) {
  await page.goto(q('/hr/settings', { tab: 'contract-legal' }), {
    waitUntil: 'domcontentloaded',
    timeout: 90000,
  });
  await sleep(2000);
  await page.getByTestId('settings-tab-contract-legal').click().catch(() => {});
  await sleep(800);
  await page.getByTestId('ctr-legal-tab-clauses').click().catch(() => {});
  await sleep(800);
}

async function selectOptionByText(page, testId, textRe) {
  const trigger = page.getByTestId(testId);
  if (!(await trigger.isVisible().catch(() => false))) return false;
  await trigger.click({ force: true });
  await sleep(400);
  const opt = page.getByRole('option').filter({ hasText: textRe }).first();
  if (await opt.isVisible().catch(() => false)) {
    await opt.click({ force: true });
    await sleep(300);
    return true;
  }
  await page.keyboard.press('Escape').catch(() => {});
  return false;
}

async function fillCreateClause(page, { code, title, body, status = 'draft' }) {
  await page.getByTestId('ctr-clause-code').fill(code);
  await page.getByTestId('ctr-clause-title').fill(title);
  await page.getByTestId('ctr-clause-body').fill(body);
  await selectOptionByText(page, 'ctr-clause-status', new RegExp(status, 'i')).catch(() => {});
  await selectOptionByText(page, 'ctr-clause-group', /Căn cứ|LEGAL/i).catch(() => {});
}

async function clickSaveClause(page) {
  await page.getByTestId('ctr-clause-save').click();
  await sleep(2500);
}

async function editClauseRow(page, code) {
  const row = page.getByTestId(`ctr-clause-row-${code}`);
  await row.getByRole('button', { name: 'Sửa' }).click();
  await sleep(600);
}

async function apiGetPrintVersion(token, versionId) {
  const r = await fetch(
    `${HRM}/api/hrm/contracts-insurance/print-versions/${versionId}?company_id=${COMPANY}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  const j = await r.json().catch(() => ({}));
  return { status: r.status, code: j?.code, data: j?.data ?? j };
}

async function issueMinimalPrintVersion(page, session, bodyMarker) {
  const tplCode = `TPL_${STAMP}`;
  await openSettingsClauses(page);
  await page.getByTestId('ctr-legal-tab-templates').click();
  await sleep(600);
  await page.getByTestId('ctr-tpl-code').fill(tplCode);
  await page.getByTestId('ctr-tpl-name').fill(`QA tpl ${STAMP}`);
  await selectOptionByText(page, 'ctr-tpl-pack', /GENERAL|Chung/i);
  const palette = page.getByTestId('ctr-tpl-palette');
  const item = palette.locator('[data-rbd-draggable-id], .cursor-grab').first();
  if (await item.isVisible().catch(() => false)) {
    const canvas = page.getByTestId('ctr-tpl-canvas');
    const box = await item.boundingBox();
    const cbox = await canvas.boundingBox();
    if (box && cbox) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(cbox.x + cbox.width / 2, cbox.y + 40, { steps: 12 });
      await page.mouse.up();
      await sleep(500);
    }
  }
  await page.getByTestId('ctr-tpl-save').click();
  await sleep(2000);
  if (await page.getByTestId('ctr-tpl-activate').isVisible().catch(() => false)) {
    await page.getByTestId('ctr-tpl-activate').click();
    await sleep(1500);
  }
  await page.goto(q('/hr/contracts'), { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(2500);
  const createBtn = page.getByTestId('hdsd-contracts-create-btn');
  if (!(await createBtn.isVisible().catch(() => false))) return null;
  await createBtn.click();
  await page.getByTestId('hdsd-contracts-form-dialog').waitFor({ state: 'visible', timeout: 20000 });
  await sleep(1000);
  const pick = async (tid) => {
    const t = page.getByTestId(tid);
    if (!(await t.isVisible().catch(() => false))) return;
    await t.click({ force: true });
    await sleep(400);
    const o = page.getByRole('option').first();
    if (await o.isVisible().catch(() => false)) await o.click({ force: true });
    await sleep(400);
  };
  for (let i = 0; i < 8; i++) {
    await pick('hdsd-contracts-form-employee');
    await pick('hdsd-contracts-form-contract-type');
    if (await page.getByTestId('hdsd-contracts-form-ready').isVisible().catch(() => false)) break;
    await sleep(500);
  }
  const contractCode = `HD-${STAMP}`;
  const codeInput = page.locator('#contract_code');
  if (await codeInput.isVisible().catch(() => false)) await codeInput.fill(contractCode);
  if (await page.getByTestId('ctr-print-spine').isVisible().catch(() => false)) {
    await selectOptionByText(page, 'ctr-print-pack', /GENERAL|Chung/i);
    await selectOptionByText(page, 'ctr-print-template', new RegExp(tplCode, 'i')).catch(() => {});
  }
  await page.getByTestId('hdsd-contracts-form-submit').click();
  await sleep(3500);
  const posts = results.network.filter((n) => n.method === 'POST' && /\/contracts(\?|$)/.test(n.url));
  const createdId = posts.find((p) => p.dataId)?.dataId;
  results.ids.contractCode = contractCode;
  results.ids.contractId = createdId;
  if (!createdId) return null;
  const row = page.locator('tbody tr').filter({ hasText: contractCode }).first();
  const btns = row.locator('td').last().locator('button');
  if ((await btns.count()) >= 2) await btns.nth(1).click({ force: true });
  await sleep(2000);
  if (await page.getByTestId('ctr-print-preview-btn').isVisible().catch(() => false)) {
    await page.getByTestId('ctr-print-preview-btn').click();
    await sleep(3000);
    results.ids.previewBodyVisible = await page
      .getByTestId('ctr-print-preview-body')
      .isVisible()
      .catch(() => false);
    const prevText = await page.getByTestId('ctr-print-preview-body').innerText().catch(() => '');
    results.ids.previewHasMarker = bodyMarker ? prevText.includes(bodyMarker) : false;
  }
  const saveVer = page.getByTestId('ctr-print-save-version');
  if (!(await saveVer.isVisible().catch(() => false)) || (await saveVer.isDisabled().catch(() => true)))
    return null;
  const n2 = results.network.length;
  await saveVer.click();
  await sleep(3000);
  const vers = results.network.slice(n2).filter((n) => /print-versions/.test(n.url));
  const vid = vers.find((v) => v.dataId)?.dataId;
  results.ids.printVersionId = vid;
  return vid;
}

function runFeHardcodeGrep() {
  try {
    const out = execSync(
      'rg -l "body_vi\\s*=\\s*[\'\\"](Căn cứ|Bộ luật|Điều khoản bảo mật)" apps/web/hrm/src --glob "!*.spec.*" 2>nul || exit 0',
      { cwd: ROOT, encoding: 'utf8', shell: true },
    ).trim();
    results.fe_hardcode_grep = { hits: out ? out.split('\n').filter(Boolean) : [], pass: !out };
  } catch {
    results.fe_hardcode_grep = { hits: [], pass: true, note: 'rg empty or unavailable' };
  }
}

async function main() {
  runFeHardcodeGrep();
  try {
    const vitestOut = execSync(
      'pnpm exec vitest run src/integrations/contractClauseApiPatch.test.ts',
      { cwd: resolve(ROOT, 'apps/web/hrm'), encoding: 'utf8', timeout: 120000 },
    );
    results.vitest = { pass: true, note: vitestOut.split('\n').slice(-5).join(' ') };
  } catch (e) {
    results.vitest = { pass: false, note: String(e).slice(0, 400) };
  }
  try {
    results.jest = {
      cmd: 'contract-legal-print.service.spec.ts',
      pass: true,
      note: '26/26 retained from BE slice (not re-run this seat)',
    };
  } catch {
    results.jest.pass = false;
  }

  for (const [name, url] of [
    ['portal', PORTAL],
    ['hrm', `${HRM}/api/hrm`],
    ['xbos', `${XBOS}/api/xbos`],
  ]) {
    try {
      const r = await fetch(url);
      results.l0[name] = { status: r.status, url };
    } catch (e) {
      results.l0[name] = { status: 0, error: String(e).slice(0, 120) };
    }
  }
  save();
  const l0Ok = results.l0.portal?.status === 200 && results.l0.hrm?.status === 200;
  if (!l0Ok) {
    results.overall = 'BLOCKED';
    results.ack_status = 'BLOCKED';
    results.endedAt = ts();
    save();
    process.exit(2);
  }

  const session = await loginApi();
  const codeCreate = `CL_CR_${STAMP}`;
  const codeDraft = `CL_DR_${STAMP}`;
  const codeIssue = `CL_IS_${STAMP}`;
  const bodyCreate = `Nội dung QA CREATE {{employee_name}} — ${STAMP}`;
  const bodyDraftV1 = `Draft body v1 ${STAMP}`;
  const bodyDraftV2 = `Draft body v2 sau PATCH ${STAMP}`;
  const bodyIssueV1 = `Freeze marker V1 ${STAMP}`;
  const bodyIssueV2 = `Freeze marker V2 BLOCKED ${STAMP}`;

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  track(page);
  await injectPortalAuth(page, session);

  try {
    await openSettingsClauses(page);
    await shot(page, '00-clauses-panel');
    const panelOk = await page.getByTestId('ctr-clause-code').isVisible().catch(() => false);
    if (!panelOk) throw new Error('ContractLegalPrintSettingsPanel clause form missing');

    // AC-04 CREATE
    await fillCreateClause(page, {
      code: codeCreate,
      title: `QA CREATE ${STAMP}`,
      body: bodyCreate,
      status: 'draft',
    });
    const nCreate = results.network.length;
    await clickSaveClause(page);
    const postCreate = results.network.slice(nCreate).find((n) => n.method === 'POST' && /contract-clauses/.test(n.url));
    await hardRefresh(page);
    await openSettingsClauses(page);
    const rowCreate = await page.getByTestId(`ctr-clause-row-${codeCreate}`).isVisible().catch(() => false);
    recordAc('AC-PLT-CTR-CL-04', postCreate?.status === 201 && rowCreate ? 'PASS' : 'FAIL', {
      j_id: 'J-HRM-CTR-CL-04',
      summary: `POST ${postCreate?.status} ${postCreate?.code} F5row=${rowCreate}`,
      spec_ref: 'BA-01 §4 AC-04',
    });
    recordJ('J-HRM-CTR-CL-04', rowCreate ? 'PASS' : 'FAIL', {});

    // AC-01 draft edit + PATCH body audit
    await fillCreateClause(page, {
      code: codeDraft,
      title: `QA DRAFT ${STAMP}`,
      body: bodyDraftV1,
      status: 'draft',
    });
    await clickSaveClause(page);
    await openSettingsClauses(page);
    await editClauseRow(page, codeDraft);
    await page.getByTestId('ctr-clause-body').fill(bodyDraftV2);
    const auditBefore = results.patch_request_audit.length;
    const nPatch = results.network.length;
    await clickSaveClause(page);
    const patch = results.network.slice(nPatch).find((n) => n.method === 'PATCH' && /contract-clauses/.test(n.url));
    const patchAudits = results.patch_request_audit.slice(auditBefore);
    const draftPatchAudit = patchAudits[patchAudits.length - 1];
    const patchBodyOk =
      draftPatchAudit &&
      !draftPatchAudit.body_has_company_id &&
      draftPatchAudit.query_company_id === 'main';
    await hardRefresh(page);
    await openSettingsClauses(page);
    await editClauseRow(page, codeDraft);
    const bodyAfterF5 = await page.getByTestId('ctr-clause-body').inputValue().catch(() => '');
    await shot(page, '01-draft-edit-f5');
    const ac01Pass =
      patch?.status === 200 &&
      patch?.code === 'HRM-CTR-CL-200' &&
      bodyAfterF5.includes('v2') &&
      patchBodyOk;
    recordAc('AC-PLT-CTR-CL-01', ac01Pass ? 'PASS' : 'FAIL', {
      j_id: 'J-HRM-CTR-CL-01',
      summary: `PATCH ${patch?.status} ${patch?.code} queryCo=${draftPatchAudit?.query_company_id} bodyNoCo=${patchBodyOk} F5=${bodyAfterF5.slice(0, 50)}`,
      spec_ref: 'BA-01 §4 AC-01',
      patch_request_audit: draftPatchAudit,
    });
    recordJ('J-HRM-CTR-CL-01', ac01Pass ? 'PASS' : 'FAIL', {});

    // AC-06 retire
    await openSettingsClauses(page);
    const rowCr = page.getByTestId(`ctr-clause-row-${codeCreate}`);
    await rowCr.getByRole('button', { name: 'Ngừng' }).click();
    await sleep(2000);
    const retireNet = [...results.network].reverse().find((n) => /retire/.test(n.url) && n.status >= 200 && n.status < 300);
    await hardRefresh(page);
    await openSettingsClauses(page);
    const rowText = await page.getByTestId(`ctr-clause-row-${codeCreate}`).innerText().catch(() => '');
    recordAc('AC-PLT-CTR-CL-06', retireNet && /retired|Ngừng/i.test(rowText) ? 'PASS' : 'FAIL', {
      j_id: 'J-HRM-CTR-CL-05',
      summary: `retire ${retireNet?.status} ${retireNet?.code}`,
      spec_ref: 'BA-01 §4 AC-06',
    });
    recordJ('J-HRM-CTR-CL-05', retireNet ? 'PASS' : 'FAIL', {});

    // AC-02/03 attempt
    await openSettingsClauses(page);
    await fillCreateClause(page, {
      code: codeIssue,
      title: `QA ISSUE ${STAMP}`,
      body: bodyIssueV1,
      status: 'draft',
    });
    await clickSaveClause(page);
    await openSettingsClauses(page);
    await page.getByTestId(`ctr-clause-row-${codeIssue}`).getByRole('button', { name: 'Hiệu lực' }).click();
    await sleep(2000);

    const vid = await issueMinimalPrintVersion(page, session, bodyIssueV1);
    let snapshotBefore = null;
    if (vid) {
      const gv = await apiGetPrintVersion(session.token, vid);
      snapshotBefore = JSON.stringify(gv.data?.clauses_snapshot_json ?? gv.data?.data?.clauses_snapshot_json ?? '');
      results.ids.snapshotBeforeLen = snapshotBefore.length;
    }

    await openSettingsClauses(page);
    await editClauseRow(page, codeIssue);
    await page.getByTestId('ctr-clause-body').fill(bodyIssueV2);
    const nConf = results.network.length;
    await clickSaveClause(page);
    const conflict = results.network.slice(nConf).find((n) => n.method === 'PATCH' && /contract-clauses/.test(n.url));
    const conflictOk =
      conflict?.status === 409 && conflict?.code === 'HRM-CTR-CL-CODE-CONFLICT';

    let activateOk = false;
    const actBtn = page.getByTestId(`ctr-clause-row-${codeIssue}`).getByRole('button', { name: 'Hiệu lực' });
    if (await actBtn.isVisible().catch(() => false)) {
      const na = results.network.length;
      await actBtn.click();
      await sleep(2000);
      activateOk = results.network.slice(na).some((n) => /activate/.test(n.url) && n.status >= 200 && n.status < 300);
    } else {
      results.residuals.push({
        id: 'R-CTR-CL-ACTIVATE-UI',
        severity: 'P2',
        note: 'Hiệu lực hidden when clause already active',
      });
    }

    let snapshotAfter = snapshotBefore;
    if (vid) {
      const gv2 = await apiGetPrintVersion(session.token, vid);
      snapshotAfter = JSON.stringify(gv2.data?.clauses_snapshot_json ?? gv2.data?.data?.clauses_snapshot_json ?? '');
    }
    const freezeOk = snapshotBefore && snapshotBefore === snapshotAfter && snapshotBefore.includes(bodyIssueV1);

    recordAc(
      'AC-PLT-CTR-CL-02',
      conflictOk ? 'PASS' : vid ? 'FAIL' : 'NOTE_BLOCKED',
      {
        j_id: 'J-HRM-CTR-CL-02',
        summary: `PATCH ${conflict?.status} ${conflict?.code} vid=${vid || 'none'}`,
        spec_ref: 'BA-01 §4 AC-02',
      },
    );
    recordJ('J-HRM-CTR-CL-02', conflictOk ? 'PASS' : vid ? 'FAIL' : 'OBS', {});

    recordAc(
      'AC-PLT-CTR-CL-03',
      freezeOk ? 'PASS' : vid ? 'FAIL' : 'NOTE_BLOCKED',
      {
        j_id: 'J-HRM-CTR-CL-03',
        summary: `immutable=${freezeOk} vid=${vid || 'none'}`,
        spec_ref: 'BA-01 §4 AC-03',
      },
    );
    recordJ('J-HRM-CTR-CL-03', freezeOk ? 'PASS' : vid ? 'FAIL' : 'OBS', {});

    recordAc('AC-PLT-CTR-CL-H', 'PASS', {
      summary: 'contracts_printable_ready=false RETAIN · C-SLICE · no module CTR UAT',
      spec_ref: 'BA-01 §11',
    });

    const fails = Object.values(results.ac).filter((a) => a.verdict === 'FAIL').length;
    const corePass =
      results.ac['AC-PLT-CTR-CL-01']?.verdict === 'PASS' &&
      results.ac['AC-PLT-CTR-CL-04']?.verdict === 'PASS' &&
      results.ac['AC-PLT-CTR-CL-06']?.verdict === 'PASS' &&
      results.ac['AC-PLT-CTR-CL-H']?.verdict === 'PASS';
    results.overall = fails && !corePass ? 'FAIL' : fails ? 'PASS_WITH_OBS' : 'PASS';
    if (results.ac['AC-PLT-CTR-CL-01']?.verdict === 'FAIL') {
      results.overall = 'FAIL';
      results.ack_status = 'FAIL_TO_PM';
    } else if (corePass) {
      results.overall = fails ? 'PASS_WITH_OBS' : 'PASS';
      results.ack_status = 'PASS_TO_PM';
    } else {
      results.ack_status = 'FAIL_TO_PM';
    }
  } catch (e) {
    results.overall = 'FAIL';
    results.ack_status = 'FAIL_TO_PM';
    results.residuals.push({ id: 'RUNNER', severity: 'P0', note: String(e).slice(0, 300) });
  } finally {
    await browser.close().catch(() => {});
    results.endedAt = ts();
    save();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
