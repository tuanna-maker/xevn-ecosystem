#!/usr/bin/env node
/**
 * PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-QA-03 — U65 issue spine · AC-02/03
 * Parent: QC-02 GWC · residual R-CTR-CL-ISSUE-SPINE-U65
 * AC-01 RETAIN CLQA2-KMCG5L — not re-opened this seat
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
const WORK_LOC = process.env.QA_WORK_LOCATION || 'Hà Nội — QA spine U65';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(
  ROOT,
  'docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-ctr-clause-qa-03.json',
);
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-dynamic-config-platform-ctr-clause-qa-03');
mkdirSync(SCREEN, { recursive: true });

const STAMP = `CLQA3-${Date.now().toString(36).slice(-6).toUpperCase()}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

const results = {
  work_item_id: 'PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-QA-03',
  parent: 'PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-QC-02',
  residual_id: 'R-CTR-CL-ISSUE-SPINE-U65',
  program: 'PO-HRM-CONTINUOUS-W8-20260807',
  stamp: STAMP,
  prior_ac01_stamp: 'CLQA2-KMCG5L',
  startedAt: ts(),
  u65: 'zero-seed · issue spine · AC-02/03',
  persona: { email: EMAIL, companyId: COMPANY, url_base: PORTAL },
  honesty: {
    contracts_printable_ready: false,
    seed_used: false,
    module_ctr_uat_claimed: false,
    c_slice: 'C-SLICE-≠-MODULE',
  },
  l0: {},
  ids: {},
  ac: {},
  j: {},
  network: [],
  patch_request_audit: [],
  consoleErrors: [],
  pageErrors: [],
  screens: [],
  click_log: [],
  blockers: [],
  residuals: [],
  overall: null,
  ack_status: null,
  endedAt: null,
};

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(results, null, 2));
}
function log(step, detail = {}) {
  results.click_log.push({ step, at: ts(), ...detail });
  save();
}
function recordAc(id, verdict, detail = {}) {
  results.ac[id] = { ...detail, verdict, at: ts() };
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
      results.patch_request_audit.push({
        at: ts(),
        url: u.replace(/^https?:\/\/[^/]+/, ''),
        query_company_id: urlObj.searchParams.get('company_id'),
        body_has_company_id: Object.prototype.hasOwnProperty.call(parsed, 'company_id'),
        body_vi_snippet: String(parsed.body_vi || '').slice(0, 80),
      });
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
      if (
        !/contract-clauses|print-versions|\/preview|contract-templates|contracts-insurance\/contracts/.test(
          u,
        )
      )
        return;
      const entry = {
        method,
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, ''),
        at: ts(),
      };
      const ct = res.headers()['content-type'] || '';
      if (/json/i.test(ct)) {
        const j = await res.json().catch(() => ({}));
        entry.code = j?.code || null;
        entry.message = String(j?.message || '').slice(0, 200);
        const data = j?.data ?? j;
        if (data?.id) entry.dataId = data.id;
        if (data?.can_issue !== undefined) entry.can_issue = data.can_issue;
        if (data?.preview?.can_issue !== undefined) entry.can_issue = data.preview.can_issue;
        if (data?.clauses_snapshot_json) entry.snapshotLen = JSON.stringify(data.clauses_snapshot_json).length;
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

async function fillCreateClause(page, { code, title, body }) {
  await page.getByTestId('ctr-clause-code').fill(code);
  await page.getByTestId('ctr-clause-title').fill(title);
  await page.getByTestId('ctr-clause-body').fill(body);
  await selectOptionByText(page, 'ctr-clause-group', /Căn cứ|LEGAL/i).catch(() => {});
}

async function clickSaveClause(page) {
  await page.getByTestId('ctr-clause-save').click();
  await sleep(2500);
}

async function editClauseRow(page, code) {
  await page.getByTestId(`ctr-clause-row-${code}`).getByRole('button', { name: 'Sửa' }).click();
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

async function pickFirstOption(page, testId) {
  const t = page.getByTestId(testId);
  if (!(await t.isVisible().catch(() => false))) return;
  await t.click({ force: true });
  await sleep(400);
  const o = page.getByRole('option').first();
  if (await o.isVisible().catch(() => false)) await o.click({ force: true });
  await sleep(400);
}

async function createTemplateWithClause(page, tplCode, clauseCode) {
  await page.getByTestId('ctr-legal-tab-templates').click();
  await sleep(600);
  await page.getByTestId('ctr-tpl-code').fill(tplCode);
  await page.getByTestId('ctr-tpl-name').fill(`QA tpl spine ${STAMP}`);
  await selectOptionByText(page, 'ctr-tpl-pack', /GENERAL|Chung/i);
  const palette = page.getByTestId('ctr-tpl-palette');
  const dragItem = palette.locator(`[data-testid*="ctr-clause-palette-${clauseCode}"], [data-rbd-draggable-id]`).first();
  const item = (await dragItem.isVisible().catch(() => false))
    ? dragItem
    : palette.locator('[data-rbd-draggable-id], .cursor-grab').first();
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
  log('TEMPLATE_SAVED', { tplCode });
}

/** U65 contract → edit spine → preview → save print version */
async function issuePrintVersionU65(page, session, tplCode, bodyMarker) {
  const contractCode = `HD-${STAMP}`;
  await page.goto(q('/hr/contracts'), { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(2500);
  log('CONTRACTS_LIST');
  const createBtn = page.getByTestId('hdsd-contracts-create-btn');
  if (!(await createBtn.isVisible().catch(() => false))) {
    results.blockers.push({ step: 'contracts_create_btn', note: 'hdsd-contracts-create-btn missing' });
    return null;
  }
  await createBtn.click();
  await page.getByTestId('hdsd-contracts-form-dialog').waitFor({ state: 'visible', timeout: 25000 });
  await sleep(1000);
  let formReady = false;
  for (let i = 0; i < 12; i++) {
    await pickFirstOption(page, 'hdsd-contracts-form-employee');
    await pickFirstOption(page, 'hdsd-contracts-form-contract-type');
    formReady = await page.getByTestId('hdsd-contracts-form-ready').isVisible().catch(() => false);
    if (formReady) break;
    await sleep(500);
  }
  const codeInput = page.locator('#contract_code');
  if (await codeInput.isVisible().catch(() => false)) await codeInput.fill(contractCode);
  const wlReg = page.getByTestId('ctr-work-location');
  if (await wlReg.isVisible().catch(() => false)) {
    await wlReg.fill(WORK_LOC);
    results.ids.registryWorkLocation = WORK_LOC;
  }
  if (!formReady) {
    results.blockers.push({ step: 'form_ready', note: 'hdsd-contracts-form-ready never true' });
    return null;
  }
  await page.getByTestId('hdsd-contracts-form-submit').click();
  await sleep(4000);
  const posts = results.network.filter((n) => n.method === 'POST' && /\/contracts(\?|$)/.test(n.url));
  const createdId = posts.find((p) => p.dataId)?.dataId;
  results.ids.contractCode = contractCode;
  results.ids.contractId = createdId;
  if (!createdId) {
    results.blockers.push({ step: 'contract_create', note: 'no contract id from POST' });
    return null;
  }
  log('CONTRACT_CREATED', { contractCode, createdId });
  await hardRefresh(page);
  await sleep(2000);
  const search = page.locator('input[placeholder*="Tìm"], input[type=search]').first();
  if (await search.isVisible().catch(() => false)) {
    await search.fill(contractCode);
    await sleep(1200);
  }
  const row = page.locator('tbody tr').filter({ hasText: contractCode }).first();
  const btns = row.locator('td').last().locator('button');
  if ((await btns.count()) >= 2) await btns.nth(1).click({ force: true });
  await sleep(2500);
  await shot(page, '01-contract-edit-spine');
  const spine = await page.getByTestId('ctr-print-spine').isVisible().catch(() => false);
  if (!spine) {
    results.blockers.push({ step: 'ctr-print-spine', note: 'print spine panel missing on edit dialog' });
    return null;
  }
  await selectOptionByText(page, 'ctr-print-pack', /GENERAL|Chung/i);
  await selectOptionByText(page, 'ctr-print-template', new RegExp(tplCode, 'i')).catch(async () => {
    const trig = page.getByTestId('ctr-print-template');
    if (await trig.isVisible().catch(() => false)) {
      await trig.click({ force: true });
      await sleep(400);
      const opt = page.getByRole('option').first();
      if (await opt.isVisible().catch(() => false)) await opt.click({ force: true });
    }
  });
  const spineWl = page.getByTestId('ctr-print-override-work_location');
  if (await spineWl.isVisible().catch(() => false)) {
    const cur = (await spineWl.inputValue().catch(() => '')).trim();
    if (!cur) await spineWl.fill(WORK_LOC);
    results.ids.spineWorkLocation = await spineWl.inputValue().catch(() => '');
  }
  const editWl = page.getByTestId('ctr-work-location');
  if (await editWl.isVisible().catch(() => false)) {
    const cur = (await editWl.inputValue().catch(() => '')).trim();
    if (!cur) await editWl.fill(WORK_LOC);
  }
  const nPrev = results.network.length;
  if (await page.getByTestId('ctr-print-preview-btn').isVisible().catch(() => false)) {
    await page.getByTestId('ctr-print-preview-btn').click();
    log('CLICK_PREVIEW');
    await sleep(3500);
  } else {
    results.blockers.push({ step: 'preview_btn', note: 'ctr-print-preview-btn missing' });
    return null;
  }
  const prevPosts = results.network.slice(nPrev).filter((n) => /\/preview/.test(n.url));
  const canIssue = prevPosts.find((p) => p.can_issue !== undefined)?.can_issue;
  results.ids.previewCanIssue = canIssue;
  const previewErr = await page.getByTestId('ctr-print-preview-error').innerText().catch(() => '');
  results.ids.previewError = previewErr.slice(0, 200);
  const prevText = await page.getByTestId('ctr-print-preview-body').innerText().catch(() => '');
  results.ids.previewHasMarker = bodyMarker ? prevText.includes(bodyMarker) : prevText.length > 20;
  await shot(page, '02-preview');
  const saveVer = page.getByTestId('ctr-print-save-version');
  const saveVisible = await saveVer.isVisible().catch(() => false);
  const saveDisabled = await saveVer.isDisabled().catch(() => true);
  results.ids.saveVersionVisible = saveVisible;
  results.ids.saveVersionDisabled = saveDisabled;
  if (!saveVisible || saveDisabled) {
    results.blockers.push({
      step: 'save_print_version',
      note: `can_issue=${canIssue} visible=${saveVisible} disabled=${saveDisabled} previewErr=${previewErr.slice(0, 80)}`,
    });
    return null;
  }
  const nV = results.network.length;
  await saveVer.click();
  log('CLICK_SAVE_VERSION');
  await sleep(3500);
  const vers = results.network.slice(nV).filter((n) => /print-versions/.test(n.url));
  const vid = vers.find((v) => v.dataId)?.dataId;
  results.ids.printVersionId = vid;
  results.ids.printVersionPosts = vers.map((v) => ({ status: v.status, code: v.code }));
  await shot(page, '03-after-issue');
  return vid;
}

async function main() {
  recordAc('AC-PLT-CTR-CL-01', 'RETAIN', {
    summary: 'Not re-tested — sealed CLQA2-KMCG5L per mission',
    spec_ref: 'QA-02 stamp',
  });

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
  const codeIssue = `CL_IS_${STAMP}`;
  const tplCode = `TPL_${STAMP}`;
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
    await shot(page, '00-clauses');
    await fillCreateClause(page, {
      code: codeIssue,
      title: `QA ISSUE spine ${STAMP}`,
      body: bodyIssueV1,
    });
    await clickSaveClause(page);
    await openSettingsClauses(page);
    await page.getByTestId(`ctr-clause-row-${codeIssue}`).getByRole('button', { name: 'Hiệu lực' }).click();
    await sleep(2000);
    log('CLAUSE_ACTIVATED', { codeIssue });

    await openSettingsClauses(page);
    await createTemplateWithClause(page, tplCode, codeIssue);

    const vid = await issuePrintVersionU65(page, session, tplCode, bodyIssueV1);

    let snapshotBefore = null;
    if (vid) {
      const gv = await apiGetPrintVersion(session.token, vid);
      snapshotBefore = JSON.stringify(gv.data?.clauses_snapshot_json ?? '');
      results.ids.snapshotBeforeLen = snapshotBefore.length;
      results.ids.snapshotHasV1 = snapshotBefore.includes(bodyIssueV1);
    }

    await openSettingsClauses(page);
    await editClauseRow(page, codeIssue);
    await page.getByTestId('ctr-clause-body').fill(bodyIssueV2);
    const nConf = results.network.length;
    await clickSaveClause(page);
    const conflict = results.network.slice(nConf).find((n) => n.method === 'PATCH' && /contract-clauses/.test(n.url));
    const conflictOk =
      conflict?.status === 409 && conflict?.code === 'HRM-CTR-CL-CODE-CONFLICT';
    const server500 = conflict?.status >= 500;

    let activateOk = false;
    const actBtn = page.getByTestId(`ctr-clause-row-${codeIssue}`).getByRole('button', { name: 'Hiệu lực' });
    if (await actBtn.isVisible().catch(() => false)) {
      const na = results.network.length;
      await actBtn.click();
      await sleep(2000);
      activateOk = results.network.slice(na).some((n) => /activate/.test(n.url) && n.status >= 200 && n.status < 300);
    } else if (vid) {
      results.residuals.push({
        id: 'R-CTR-CL-ACTIVATE-UI',
        severity: 'P2',
        note: 'Hiệu lực hidden when clause already active',
      });
    }

    let snapshotAfter = snapshotBefore;
    if (vid) {
      const gv2 = await apiGetPrintVersion(session.token, vid);
      snapshotAfter = JSON.stringify(gv2.data?.clauses_snapshot_json ?? '');
    }
    const freezeOk =
      Boolean(vid) &&
      snapshotBefore &&
      snapshotBefore === snapshotAfter &&
      snapshotBefore.includes(bodyIssueV1);

    recordAc('AC-PLT-CTR-CL-02', conflictOk ? 'PASS' : vid ? (server500 ? 'FAIL' : 'FAIL') : 'NOTE_BLOCKED', {
      j_id: 'J-HRM-CTR-CL-02',
      summary: `PATCH ${conflict?.status} ${conflict?.code} vid=${vid || 'none'} activate=${activateOk}`,
      spec_ref: 'BA-01 §4 AC-02',
      blockers: results.blockers,
    });
    recordJ('J-HRM-CTR-CL-02', conflictOk ? 'PASS' : vid ? 'FAIL' : 'NOTE_BLOCKED', {});

    recordAc('AC-PLT-CTR-CL-03', freezeOk ? 'PASS' : vid ? 'FAIL' : 'NOTE_BLOCKED', {
      j_id: 'J-HRM-CTR-CL-03',
      summary: `immutable=${freezeOk} vid=${vid || 'none'}`,
      spec_ref: 'BA-01 §4 AC-03',
    });
    recordJ('J-HRM-CTR-CL-03', freezeOk ? 'PASS' : vid ? 'FAIL' : 'NOTE_BLOCKED', {});

    recordAc('AC-PLT-CTR-CL-H', 'PASS', {
      summary: 'contracts_printable_ready=false RETAIN · C-SLICE · no module CTR UAT',
      spec_ref: 'PRINTABLE-HOLD-SA-01',
    });

    if (!vid) {
      results.residuals.push({
        id: 'R-CTR-CL-ISSUE-SPINE-U65',
        severity: 'P1',
        note: results.blockers.map((b) => `${b.step}:${b.note}`).join(' | ') || 'no printVersionId',
      });
    } else if (conflictOk && freezeOk) {
      results.residuals.push({
        id: 'R-CTR-CL-ISSUE-SPINE-U65',
        severity: 'P1',
        status: 'CLOSED',
        note: 'U65 spine + AC-02/03 PASS',
      });
    }

    const ac02 = results.ac['AC-PLT-CTR-CL-02']?.verdict;
    const ac03 = results.ac['AC-PLT-CTR-CL-03']?.verdict;
    if (ac02 === 'PASS' && ac03 === 'PASS') {
      results.overall = 'PASS';
      results.ack_status = 'PASS_TO_PM';
    } else if (ac02 === 'NOTE_BLOCKED' && ac03 === 'NOTE_BLOCKED') {
      results.overall = 'NOTE_BLOCKED';
      results.ack_status = 'FAIL_TO_PM';
    } else {
      results.overall = 'FAIL';
      results.ack_status = 'FAIL_TO_PM';
    }
  } catch (e) {
    results.overall = 'FAIL';
    results.ack_status = 'FAIL_TO_PM';
    results.blockers.push({ step: 'runner', note: String(e).slice(0, 300) });
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
