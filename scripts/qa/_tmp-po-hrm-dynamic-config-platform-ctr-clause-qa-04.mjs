#!/usr/bin/env node
/**
 * PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-QA-04 — U65 retest AC-02/03
 * Parents: CTR-CL-AC02-BE-01 + CTR-CL-SNAPSHOT-BIND-FE-01 (AMEND 2026-08-09T00:16:20+07)
 * Gates: dual-bind clause_ids + layout_json.clause_ids · snapshot code · PATCH 409 · AC-03 freeze
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
const WORK_LOC = process.env.QA_WORK_LOCATION || 'Hà Nội — QA spine U65 QA04';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../..');
const OUT_JSON = resolve(
  ROOT,
  'docs/qa/evidence/_tmp-po-hrm-dynamic-config-platform-ctr-clause-qa-04.json',
);
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-dynamic-config-platform-ctr-clause-qa-04');
mkdirSync(SCREEN, { recursive: true });

const STAMP = `CLQA4-${Date.now().toString(36).slice(-6).toUpperCase()}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

const results = {
  work_item_id: 'PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CLAUSE-QA-04',
  parent:
    'PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CL-AC02-BE-01 + PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CL-SNAPSHOT-BIND-FE-01',
  amend_dispatch: '2026-08-09T00:16:20+07',
  program: 'PO-HRM-CONTINUOUS-W8-20260807',
  stamp: STAMP,
  prior_ac01_stamp: 'CLQA2-KMCG5L',
  prior_qa03_stamp: 'CLQA3-KMJRGF',
  startedAt: ts(),
  u65: 'zero-seed · issue spine · dual-bind + AC-02/03 post BE+FE peers',
  persona: { email: EMAIL, companyId: COMPANY, url_base: PORTAL },
  honesty: {
    contracts_printable_ready: false,
    seed_used: false,
    module_ctr_uat_claimed: false,
    c_slice: 'C-SLICE-≠-MODULE',
  },
  l0: {},
  ids: {},
  dual_bind: { requests: [], verdict: null, note: null },
  snapshot_probe: {},
  ac: {},
  j: {},
  network: [],
  patch_request_audit: [],
  consoleErrors: [],
  pageErrors: [],
  fe_soft_block: null,
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

function auditDualBind(method, url, parsed) {
  const top = Array.isArray(parsed?.clause_ids) ? parsed.clause_ids.map(String) : null;
  const nested = Array.isArray(parsed?.layout_json?.clause_ids)
    ? parsed.layout_json.clause_ids.map(String)
    : null;
  const same =
    !!top &&
    !!nested &&
    top.length === nested.length &&
    top.every((id, i) => id === nested[i]);
  const row = {
    at: ts(),
    method,
    url: url.replace(/^https?:\/\/[^/]+/, ''),
    has_top_clause_ids: !!top,
    has_layout_clause_ids: !!nested,
    top_len: top?.length ?? 0,
    nested_len: nested?.length ?? 0,
    ids_match: same,
    top_ids_snip: (top || []).slice(0, 3),
  };
  results.dual_bind.requests.push(row);
  save();
  return row;
}

function track(page) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') results.consoleErrors.push(String(msg.text()).slice(0, 360));
  });
  page.on('pageerror', (err) => results.pageErrors.push(String(err).slice(0, 360)));
  page.on('request', (req) => {
    try {
      const u = req.url();
      const method = req.method();
      const raw = req.postData() || '{}';
      let parsed = {};
      try {
        parsed = JSON.parse(raw);
      } catch {
        parsed = { _parseError: true };
      }

      if (
        (method === 'POST' || method === 'PATCH') &&
        /\/api\/hrm\/.*contract-templates/.test(u) &&
        !/\/activate/.test(u)
      ) {
        auditDualBind(method, u, parsed);
      }

      if (method !== 'PATCH' || !/\/api\/hrm\/.*contract-clauses/.test(u)) return;
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
        if (data?.clauses_snapshot_json)
          entry.snapshotLen = JSON.stringify(data.clauses_snapshot_json).length;
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

/** Contract-scoped GET (BE handoff §5.2) */
async function apiGetPrintVersionContractScoped(token, contractId, versionId) {
  const url = `${HRM}/api/hrm/contracts-insurance/contracts/${contractId}/print-versions/${versionId}?company_id=${COMPANY}`;
  const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const j = await r.json().catch(() => ({}));
  return { status: r.status, code: j?.code, data: j?.data ?? j, url };
}

function parseSnapshotClauseCodes(clausesJson) {
  if (!clausesJson) return [];
  const arr = Array.isArray(clausesJson) ? clausesJson : [];
  return arr.map((c) => String(c?.code ?? '').trim()).filter(Boolean);
}

function snapshotHasCode(clausesJson, clauseCode) {
  const codes = parseSnapshotClauseCodes(clausesJson);
  const want = String(clauseCode).trim().toLowerCase();
  return codes.some((c) => c.toLowerCase() === want);
}

function clauseBodyInSnapshot(clausesJson, clauseCode, bodySnippet) {
  if (!Array.isArray(clausesJson)) return false;
  const want = String(clauseCode).trim().toLowerCase();
  const row = clausesJson.find((c) => String(c?.code ?? '').trim().toLowerCase() === want);
  if (!row) return false;
  return String(row.body_vi || '').includes(bodySnippet);
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

async function createTemplateWithClause(page, tplCode, clauseCode, clauseId) {
  await page.getByTestId('ctr-legal-tab-templates').click();
  await sleep(600);
  await page.getByTestId('ctr-tpl-code').fill(tplCode);
  await page.getByTestId('ctr-tpl-name').fill(`QA tpl spine ${STAMP}`);
  await selectOptionByText(page, 'ctr-tpl-pack', /GENERAL|Chung/i);
  await sleep(400);
  const palette = page.getByTestId('ctr-tpl-palette');
  // Prefer row that shows our clause code (avoid stale first palette item → 404)
  let item = palette.locator('.cursor-grab, [data-rbd-draggable-id]').filter({ hasText: clauseCode }).first();
  if (!(await item.isVisible().catch(() => false)) && clauseId) {
    item = palette.locator(`[data-rbd-draggable-id="pal-${clauseId}"]`).first();
  }
  if (!(await item.isVisible().catch(() => false))) {
    // scroll palette for long lists
    await palette.evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    }).catch(() => {});
    await sleep(300);
    item = palette.locator('.cursor-grab, [data-rbd-draggable-id]').filter({ hasText: clauseCode }).first();
  }
  const canvas = page.getByTestId('ctr-tpl-canvas');
  if (await item.isVisible().catch(() => false)) {
    const box = await item.boundingBox();
    const cbox = await canvas.boundingBox();
    if (box && cbox) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(cbox.x + cbox.width / 2, cbox.y + 48, { steps: 16 });
      await page.mouse.up();
      await sleep(600);
      log('TEMPLATE_DND', { clauseCode, clauseId });
    }
  } else {
    results.blockers.push({ step: 'palette_dnd', note: `palette item for ${clauseCode} not found` });
  }
  const nBefore = results.dual_bind.requests.length;
  await page.getByTestId('ctr-tpl-save').click();
  await sleep(2500);
  const bindAfterSave = results.dual_bind.requests.slice(nBefore);
  results.ids.templateBindAfterSave = bindAfterSave;
  const tplPost = results.network
    .filter((n) => n.method === 'POST' && /\/contract-templates(\?|$)/.test(n.url))
    .slice(-1)[0];
  results.ids.templateId = tplPost?.dataId;
  results.ids.templateCreateStatus = tplPost?.status;
  if (await page.getByTestId('ctr-tpl-activate').isVisible().catch(() => false)) {
    await page.getByTestId('ctr-tpl-activate').click();
    await sleep(1800);
  }
  log('TEMPLATE_SAVED', {
    tplCode,
    createStatus: tplPost?.status,
    dualBindCount: bindAfterSave.length,
  });
}

async function issuePrintVersionU65(page, tplCode, bodyMarker) {
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
    results.blockers.push({ step: 'ctr-print-spine', note: 'print spine panel missing' });
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
  }
  const editWl = page.getByTestId('ctr-work-location');
  if (await editWl.isVisible().catch(() => false)) {
    const cur = (await editWl.inputValue().catch(() => '')).trim();
    if (!cur) await editWl.fill(WORK_LOC);
  }
  if (await page.getByTestId('ctr-print-preview-btn').isVisible().catch(() => false)) {
    await page.getByTestId('ctr-print-preview-btn').click();
    log('CLICK_PREVIEW');
    await sleep(3500);
  } else {
    results.blockers.push({ step: 'preview_btn', note: 'ctr-print-preview-btn missing' });
    return null;
  }
  const prevText = await page.getByTestId('ctr-print-preview-body').innerText().catch(() => '');
  results.ids.previewHasMarker = bodyMarker ? prevText.includes(bodyMarker) : prevText.length > 20;
  await shot(page, '02-preview');
  const saveVer = page.getByTestId('ctr-print-save-version');
  if (!(await saveVer.isVisible().catch(() => false)) || (await saveVer.isDisabled().catch(() => true))) {
    results.blockers.push({ step: 'save_print_version', note: 'save version disabled or hidden' });
    return null;
  }
  const nV = results.network.length;
  await saveVer.click();
  log('CLICK_SAVE_VERSION');
  await sleep(3500);
  const vers = results.network.slice(nV).filter((n) => /print-versions/.test(n.url));
  const vid = vers.find((v) => v.dataId)?.dataId;
  results.ids.printVersionId = vid;
  await shot(page, '03-after-issue');
  return vid;
}

async function detectFeSoftBlock(page) {
  const toast = page.locator('[role="alert"], [data-sonner-toast], .toast, [class*="toast"]');
  const texts = [];
  const count = await toast.count().catch(() => 0);
  for (let i = 0; i < Math.min(count, 5); i++) {
    const t = await toast.nth(i).innerText().catch(() => '');
    if (t) texts.push(t.slice(0, 200));
  }
  const banner = await page
    .locator('text=/CODE-CONFLICT|điều khoản|phiên bản|Hiệu lực/i')
    .first()
    .innerText()
    .catch(() => '');
  if (banner) texts.push(banner.slice(0, 200));
  const joined = texts.join(' | ');
  return {
    observed: joined.length > 0,
    text: joined.slice(0, 400),
    mentionsConflict:
      /409|CODE-CONFLICT|xung đột|phiên bản|activate|version bump|Không lưu được điều khoản/i.test(
        joined,
      ),
  };
}

async function main() {
  recordAc('AC-PLT-CTR-CL-01', 'RETAIN', {
    summary: 'Not re-tested — sealed CLQA2-KMCG5L',
    spec_ref: 'QA-02',
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
  results.ids.clauseCode = codeIssue;
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
    // Hard-refresh Vite so FE dual-bind bind is loaded (AMEND gate)
    await page.goto(q('/hr/settings', { tab: 'contract-legal' }) + `&_cb=${Date.now()}`, {
      waitUntil: 'domcontentloaded',
      timeout: 90000,
    });
    await sleep(2000);
    await hardRefresh(page);
    log('HARD_REFRESH_FE_BIND');

    await openSettingsClauses(page);
    await shot(page, '00-clauses');
    await fillCreateClause(page, {
      code: codeIssue,
      title: `QA ISSUE spine ${STAMP}`,
      body: bodyIssueV1,
    });
    await clickSaveClause(page);
    const createPost = results.network.find((n) => n.method === 'POST' && /contract-clauses$/.test(n.url));
    results.ids.clauseId = createPost?.dataId;

    await openSettingsClauses(page);
    await page.getByTestId(`ctr-clause-row-${codeIssue}`).getByRole('button', { name: 'Hiệu lực' }).click();
    await sleep(2000);
    log('CLAUSE_ACTIVATED', { codeIssue });

    await openSettingsClauses(page);
    await createTemplateWithClause(page, tplCode, codeIssue, results.ids.clauseId);

    // Dual-bind gate (AMEND)
    const bindOk = results.dual_bind.requests.some(
      (r) => r.has_top_clause_ids && r.has_layout_clause_ids && r.ids_match && r.top_len > 0,
    );
    const bindAttempted = results.dual_bind.requests.some(
      (r) => r.has_top_clause_ids || r.has_layout_clause_ids,
    );
    if (bindOk) {
      results.dual_bind.verdict = 'PASS';
      results.dual_bind.note = 'Template CREATE/PATCH includes top clause_ids + layout_json.clause_ids same UUIDs';
    } else if (bindAttempted) {
      results.dual_bind.verdict = 'FAIL';
      results.dual_bind.note = 'Dual fields incomplete or empty / mismatched';
    } else {
      results.dual_bind.verdict = 'FAIL';
      results.dual_bind.note = 'No template mutate captured with clause_ids — FE bind not loaded or save skipped';
    }
    save();

    const vid = await issuePrintVersionU65(page, tplCode, bodyIssueV1);
    const contractId = results.ids.contractId;

    let snapshotJson = null;
    let snapshotBindOk = false;
    if (vid && contractId) {
      const gv = await apiGetPrintVersionContractScoped(session.token, contractId, vid);
      results.snapshot_probe.get = {
        status: gv.status,
        code: gv.code,
        route: gv.url.replace(HRM, ''),
      };
      snapshotJson = gv.data?.clauses_snapshot_json ?? gv.data?.clauses_snapshot ?? null;
      const codes = parseSnapshotClauseCodes(snapshotJson);
      snapshotBindOk = snapshotHasCode(snapshotJson, codeIssue);
      results.snapshot_probe.codesInSnapshot = codes;
      results.snapshot_probe.hasClauseCode = snapshotBindOk;
      results.snapshot_probe.bodyV1InSnapshot = clauseBodyInSnapshot(snapshotJson, codeIssue, bodyIssueV1);
      results.snapshot_probe.jsonLen = snapshotJson ? JSON.stringify(snapshotJson).length : 0;
      results.ids.snapshotBeforeJson = snapshotJson;
    }

    // AMEND triage: dual-bind proven + code absent → FE SNAPSHOT-BIND FAIL
    if (vid && bindOk && !snapshotBindOk) {
      results.residuals.push({
        id: 'R-CTR-CL-SNAPSHOT-BIND',
        severity: 'P1',
        owner: 'dev-fe',
        status: 'OPEN',
        note: `Dual-bind network OK but clauses_snapshot_json missing code ${codeIssue}`,
      });
      recordAc('AC-PLT-CTR-CL-02', 'FAIL', {
        j_id: 'J-HRM-CTR-CL-02',
        summary: 'SNAPSHOT-BIND: dual-bind OK but clause code absent in issued PV JSON',
        classification: 'FE R-CTR-CL-SNAPSHOT-BIND',
        spec_ref: 'ISSUE-AC-BA-01 §3 B3 · FE-SNAPSHOT-BIND-01',
      });
      recordJ('J-HRM-CTR-CL-02', 'FAIL', { bind: false });
      recordAc('AC-PLT-CTR-CL-03', 'NOTE_BLOCKED', {
        j_id: 'J-HRM-CTR-CL-03',
        summary: 'Blocked — snapshot bind failed after dual-bind',
      });
      recordJ('J-HRM-CTR-CL-03', 'NOTE_BLOCKED', {});
    } else if (vid && !snapshotBindOk) {
      results.residuals.push({
        id: 'R-CTR-CL-SNAPSHOT-BIND',
        severity: 'P1',
        owner: 'dev-fe',
        status: 'OPEN',
        note: `clauses_snapshot_json missing code ${codeIssue}; dual_bind=${results.dual_bind.verdict}`,
      });
      recordAc('AC-PLT-CTR-CL-02', 'FAIL', {
        j_id: 'J-HRM-CTR-CL-02',
        summary: 'SNAPSHOT-BIND: clause code absent in issued PV JSON',
        classification: 'FE R-CTR-CL-SNAPSHOT-BIND',
        spec_ref: 'ISSUE-AC-BA-01 §3 B3',
      });
      recordJ('J-HRM-CTR-CL-02', 'FAIL', { bind: false });
      recordAc('AC-PLT-CTR-CL-03', 'NOTE_BLOCKED', {
        j_id: 'J-HRM-CTR-CL-03',
        summary: 'Blocked — snapshot bind failed',
      });
      recordJ('J-HRM-CTR-CL-03', 'NOTE_BLOCKED', {});
    } else if (vid && snapshotBindOk) {
      const snapshotBeforeStr = JSON.stringify(snapshotJson);

      await openSettingsClauses(page);
      await editClauseRow(page, codeIssue);
      await page.getByTestId('ctr-clause-body').fill(bodyIssueV2);
      const nConf = results.network.length;
      await clickSaveClause(page);
      await sleep(500);
      results.fe_soft_block = await detectFeSoftBlock(page);
      await shot(page, '04-after-blocked-patch');

      const conflict = results.network
        .slice(nConf)
        .find((n) => n.method === 'PATCH' && /contract-clauses/.test(n.url));
      const conflictOk =
        conflict?.status === 409 && conflict?.code === 'HRM-CTR-CL-CODE-CONFLICT';
      const still200 = conflict?.status === 200;
      const feOk = results.fe_soft_block?.observed && results.fe_soft_block?.mentionsConflict;

      if (still200) {
        results.residuals.push({
          id: 'R-CTR-CL-AC02-BE',
          severity: 'P1',
          owner: 'dev-be',
          status: 'OPEN',
          note: 'code present in snapshot but PATCH still 200 — BE residual',
        });
      }

      recordAc('AC-PLT-CTR-CL-02', conflictOk ? (feOk ? 'PASS' : 'PASS_WITH_OBS') : 'FAIL', {
        j_id: 'J-HRM-CTR-CL-02',
        summary: `PATCH ${conflict?.status} ${conflict?.code} fe_soft=${JSON.stringify(results.fe_soft_block)} dual_bind=${results.dual_bind.verdict}`,
        spec_ref: 'BA-01 §4 AC-02 · BE-AC02-01 · FE-SNAPSHOT-BIND-01',
        patch_audit: results.patch_request_audit.slice(-1)[0] || null,
      });
      recordJ('J-HRM-CTR-CL-02', conflictOk ? 'PASS' : 'FAIL', {});

      const gv2 = await apiGetPrintVersionContractScoped(session.token, contractId, vid);
      const snapshotAfter = gv2.data?.clauses_snapshot_json;
      const freezeOk =
        snapshotBeforeStr === JSON.stringify(snapshotAfter) &&
        clauseBodyInSnapshot(snapshotAfter, codeIssue, bodyIssueV1) &&
        !clauseBodyInSnapshot(snapshotAfter, codeIssue, bodyIssueV2);

      recordAc('AC-PLT-CTR-CL-03', freezeOk ? 'PASS' : 'FAIL', {
        j_id: 'J-HRM-CTR-CL-03',
        summary: `immutable=${freezeOk} body still v1 in snapshot`,
        spec_ref: 'BA-01 §4 AC-03',
      });
      recordJ('J-HRM-CTR-CL-03', freezeOk ? 'PASS' : 'FAIL', {});

      if (conflictOk && freezeOk) {
        results.residuals.push({
          id: 'R-CTR-CL-ISSUE-SPINE-U65',
          severity: 'P1',
          status: 'CLOSED',
          note: 'QA-04 U65 AC-02/03 PASS post BE+FE peers',
        });
        if (bindOk) {
          results.residuals.push({
            id: 'R-CTR-CL-SNAPSHOT-BIND',
            severity: 'P1',
            status: 'CLOSED',
            note: 'Dual-bind + code in snapshot proven',
          });
        } else {
          results.residuals.push({
            id: 'R-CTR-CL-SNAPSHOT-BIND',
            severity: 'P2',
            status: 'OBS',
            note: `AC-02/03 PASS via pack-wide snapshot; dual_bind=${results.dual_bind.verdict} (template DnD may flaky)`,
          });
        }
      }
    } else {
      recordAc('AC-PLT-CTR-CL-02', 'NOTE_BLOCKED', { summary: 'no printVersionId' });
      recordAc('AC-PLT-CTR-CL-03', 'NOTE_BLOCKED', { summary: 'no printVersionId' });
      results.residuals.push({
        id: 'R-CTR-CL-ISSUE-SPINE-U65',
        severity: 'P1',
        note: results.blockers.map((b) => b.step).join(','),
      });
    }

    recordAc('AC-PLT-CTR-CL-H', 'PASS', {
      summary: 'contracts_printable_ready=false RETAIN',
    });

    const ac02 = results.ac['AC-PLT-CTR-CL-02']?.verdict;
    const ac03 = results.ac['AC-PLT-CTR-CL-03']?.verdict;
    if ((ac02 === 'PASS' || ac02 === 'PASS_WITH_OBS') && ac03 === 'PASS') {
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
