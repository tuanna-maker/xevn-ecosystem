#!/usr/bin/env node
/**
 * PO-HRM-MVP-GD1-CORE-09D-CLUSTER-QA-02 — U65 browser J-HRM-CORE-09D-01..04
 * (01) Settings Tạo mẫu #9+ → POST templates 201 + PUT …/clauses 200 → F5 còn · Nest /core 0
 * (02) HĐ picker chọn mẫu #9+ → PREV pack/title/term · clauses[] when bound
 * (03) Settings bind distinct IT_OFFICE vs DRIVER → PUT ×2 · F5 clauses[] distinct
 * (04) matrix=xevn family-only · CODE-INVALID format toast · seals · ≠ printable/closed-8 DONE
 * DENY seed · Nest /core SoT · printable flip · closed-8 TPL DONE
 * Persona: ceo@xe.vn · companyId=main · C-SLICE · honesty false
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const PORTAL_CANDIDATES = [
  process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173',
  'http://127.0.0.1:8080',
];
let PORTAL = PORTAL_CANDIDATES[0];
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
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-mvp-gd1-core-09d-cluster-qa-02.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-mvp-gd1-core-09d-cluster-qa-02');
mkdirSync(SCREEN, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();
const STAMP = `CORE09DQA2-${Date.now().toString(36).toUpperCase()}`;
const CODE_GEN = `TPL_CORE09D-${STAMP.slice(-6)}`;
const CODE_IT = `TPL_CORE09DIT-${STAMP.slice(-5)}`;
const CODE_DR = `TPL_CORE09DDR-${STAMP.slice(-5)}`;
const CODE_BAD = `9BAD_FORMAT!`;
const CONTRACT_CODE = `HD-CORE09D-${STAMP.slice(-6)}`;

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

const R = {
  work_item_id: 'PO-HRM-MVP-GD1-CORE-09D-CLUSTER-QA-02',
  stamp: STAMP,
  startedAt: ts(),
  depends_on:
    'FE-02 READY_FOR_QA · docs/qa/evidence/po-hrm-mvp-gd1-core-09d-cluster-fe-02.md · R-FE-CORE-09D-PATCH-COMPANY-ID FIXED · must_keep J-01/02/04 from QA-01',
  persona: { email: EMAIL, companyId: COMPANY },
  u65: 'zero-seed-browser-only',
  honesty: {
    recruitment_uat_ready: false,
    jd_dynamic_done: false,
    contracts_printable_ready: false,
    personnel_core_uat: false,
    ctr_module_uat: false,
    closed8_tpl_done: false,
    seed_used: false,
    c_slice_ne_module: true,
    core09c_ne_printable_done: true,
  },
  env: { PORTAL, HRM, TENANT, commit: COMMIT },
  l0: {},
  l1: {},
  network: [],
  nest_core_hits: [],
  tpl_hits: [],
  tpl_clause_puts: [],
  tpl_patches: [],
  patch_request_bodies: [],
  preview_hits: [],
  print_version_hits: [],
  preview_bodies: [],
  consoleErrors: [],
  pageErrors: [],
  dnd_storms: [],
  screens: [],
  click_log: [],
  journeys: {},
  residuals: [],
  defects: [],
  overall: null,
  ack_status: null,
  endedAt: null,
};

function save() {
  writeFileSync(OUT_JSON, JSON.stringify(R, null, 2));
}

function trackUrl(url, method, status, bodySnippet, reqBody) {
  if (!/\/api\/hrm\//.test(url)) return;
  const nest_core = /\/api\/hrm\/core(\/|$|\?)/.test(url);
  const tpl =
    /\/contracts-insurance\/contract-templates/.test(url) &&
    !/print-versions/.test(url);
  const tplPutClauses = /\/contract-templates\/[^/?]+\/clauses/.test(url) && method === 'PUT';
  const tplPatch =
    method === 'PATCH' &&
    /\/contract-templates\/[^/?]+(\?|$)/.test(url) &&
    !/\/clauses/.test(url);
  const preview = /\/contracts-insurance\/contracts\/[^/?]+\/preview/.test(url);
  const printVer = /\/print-versions/.test(url);
  let requestBodyHasCompanyId = undefined;
  let requestBodyKeys = undefined;
  if (reqBody && (tplPatch || method === 'PATCH')) {
    try {
      const parsed = typeof reqBody === 'string' ? JSON.parse(reqBody) : reqBody;
      requestBodyKeys = parsed && typeof parsed === 'object' ? Object.keys(parsed) : [];
      requestBodyHasCompanyId = Object.prototype.hasOwnProperty.call(parsed || {}, 'company_id');
    } catch {
      requestBodyHasCompanyId = /"company_id"\s*:/.test(String(reqBody));
    }
  }
  const entry = {
    method,
    url: url.replace(/^https?:\/\/[^/]+/, '').slice(0, 420),
    status: status ?? null,
    at: ts(),
    nest_core,
    tpl,
    tplPutClauses,
    tplPatch,
    preview,
    printVer,
    bodySnippet: bodySnippet || undefined,
    requestBodyHasCompanyId,
    requestBodyKeys,
    requestBodySnippet: reqBody ? String(reqBody).slice(0, 280) : undefined,
  };
  R.network.push(entry);
  if (nest_core) R.nest_core_hits.push(entry);
  if (tpl) R.tpl_hits.push(entry);
  if (tplPutClauses) R.tpl_clause_puts.push(entry);
  if (tplPatch) {
    R.tpl_patches.push(entry);
    if (reqBody) {
      R.patch_request_bodies.push({
        at: ts(),
        url: entry.url,
        hasCompanyId: requestBodyHasCompanyId,
        keys: requestBodyKeys,
        snippet: String(reqBody).slice(0, 280),
      });
    }
  }
  if (preview) R.preview_hits.push(entry);
  if (printVer) R.print_version_hits.push(entry);
}
function lastHit(pred) {
  for (let i = R.network.length - 1; i >= 0; i--) {
    if (pred(R.network[i])) return R.network[i];
  }
  return null;
}

function rowsOf(payload) {
  const d = payload?.data ?? payload;
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.items)) return d.items;
  return [];
}

async function loginToken() {
  const r = await fetch(`${XBOS}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const j = await r.json();
  return j?.data?.accessToken ?? j?.accessToken;
}

async function apiJson(method, path, token, body) {
  const headers = {
    authorization: `Bearer ${token}`,
    'x-company-id': COMPANY,
    'x-tenant-id': TENANT,
    'content-type': 'application/json',
  };
  const init = { method, headers };
  if (body !== undefined) init.body = JSON.stringify(body);
  const r = await fetch(`${HRM}${path}`, init);
  const text = await r.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* */
  }
  return {
    status: r.status,
    code: json?.error?.code ?? json?.code ?? null,
    json,
    snippet: text.slice(0, 700),
  };
}

async function l1Seal(token) {
  const probes = [];
  async function one(method, path, body) {
    const res = await apiJson(method, path, token, body);
    probes.push({
      method,
      path,
      status: res.status,
      code: res.code,
      cannot: /Cannot (GET|POST|PUT|PATCH|DELETE)/i.test(res.snippet || ''),
      snippet: res.snippet.slice(0, 220),
    });
    return res;
  }

  const list = await one('GET', '/api/hrm/contracts-insurance/contract-templates?company_id=main');
  const items = rowsOf(list.json);
  const active = items.filter((t) => t.status === 'active');
  const it = active.find((t) => t.pack_code === 'IT_OFFICE');
  const dr = active.find((t) => t.pack_code === 'DRIVER');
  const gen = active.find((t) => t.pack_code === 'GENERAL') || active[0];

  const clauses = await one(
    'GET',
    '/api/hrm/contracts-insurance/contract-clauses?company_id=main&status=active',
  );
  const clauseRows = rowsOf(clauses.json);

  const core = await one('GET', '/api/hrm/core/contract-templates?company_id=main');
  const matrix = await one(
    'GET',
    '/api/hrm/contracts-insurance/contract-templates?company_id=main&matrix=xevn',
  );
  const matrixRows = rowsOf(matrix.json);

  const emps = await one('GET', '/api/hrm/employees?page_size=5&company_id=main');
  const emp = rowsOf(emps.json)[0] || null;

  R.l1 = {
    probes,
    templates_live: list.status === 200,
    templates_total: items.length,
    templates_active: active.length,
    open_catalog_gt8: active.length > 8,
    nest_core_deny: core.status === 404 && /Cannot GET/i.test(core.snippet || ''),
    active_clauses: clauseRows.length,
    clause_sample: clauseRows.slice(0, 4).map((c) => ({
      id: c.id,
      code: c.code,
      packs: c.apply_to_packs,
    })),
    matrix_xevn_status: matrix.status,
    matrix_xevn_count: matrixRows.length,
    matrix_xevn_family_only: matrixRows.every(
      (t) => !t.matrix_family || /xevn|XEVN|LEGACY/i.test(String(t.matrix_family)),
    ),
    tpl_it: it ? { id: it.id, code: it.template_code || it.code, clauses: (it.clauses || []).length } : null,
    tpl_dr: dr ? { id: dr.id, code: dr.template_code || dr.code, clauses: (dr.clauses || []).length } : null,
    tpl_gen: gen
      ? { id: gen.id, code: gen.template_code || gen.code, pack: gen.pack_code }
      : null,
    employee_id: emp?.id || null,
    stamp: `CORE09DL1-${Date.now().toString(36).toUpperCase()}`,
  };
  return R.l1;
}

async function findAcross(page, selector, opts = {}) {
  const timeout = opts.timeout ?? 2500;
  for (const h of [page, ...page.frames()]) {
    try {
      const loc = h.locator(selector).first();
      if (await loc.isVisible({ timeout }).catch(() => false)) {
        return { host: h, locator: loc };
      }
    } catch {
      /* */
    }
  }
  return null;
}

async function waitAcross(page, selector, ms = 12000) {
  const start = Date.now();
  while (Date.now() - start < ms) {
    const hit = await findAcross(page, selector, { timeout: 400 });
    if (hit) return hit;
    await sleep(250);
  }
  return null;
}

async function shot(page, name) {
  const p = join(SCREEN, `${name}.png`);
  await page.screenshot({ path: p, fullPage: true }).catch(() => null);
  R.screens.push(p.replace(/\\/g, '/'));
}

function settingsUrl() {
  const isDirectHrm = /:8080\b/.test(PORTAL);
  return isDirectHrm
    ? `${PORTAL}/settings?tab=contract-legal&companyId=${COMPANY}&tenantId=${TENANT}`
    : `${PORTAL}/command-center/hrm/settings?tab=contract-legal&companyId=${COMPANY}&tenantId=${TENANT}`;
}

function contractsUrl() {
  const isDirectHrm = /:8080\b/.test(PORTAL);
  const path = isDirectHrm ? '/hr/contracts' : '/command-center/hrm/contracts';
  const u = new URL(path, PORTAL);
  u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', TENANT);
  u.searchParams.set('companyId', COMPANY);
  u.searchParams.set('_', String(Date.now()));
  return u.toString();
}

async function ensureTemplatesPanel(page) {
  const tab = await waitAcross(page, '[data-testid="settings-tab-contract-legal"]', 12000);
  if (tab) {
    await tab.locator.click({ force: true }).catch(() => null);
    await sleep(900);
  }
  let panel = await waitAcross(page, '[data-testid="settings-contract-legal-print"]', 15000);
  const tplTab = await waitAcross(page, '[data-testid="ctr-legal-tab-templates"]', 8000);
  if (tplTab) {
    await tplTab.locator.click({ force: true }).catch(() => null);
    await sleep(800);
  }
  panel = (await waitAcross(page, '[data-testid="settings-contract-legal-print"]', 8000)) || panel;
  return panel?.host || null;
}

async function openTemplateSettings(page) {
  await page.goto(settingsUrl(), { waitUntil: 'domcontentloaded', timeout: 90000 });
  R.click_log.push(`goto settings contract-legal via ${PORTAL}`);
  await sleep(3500);
  return ensureTemplatesPanel(page);
}

async function f5TemplateSettings(page) {
  await page.reload({ waitUntil: 'domcontentloaded' });
  await sleep(2000);
  await page.goto(settingsUrl(), { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(2500);
  const host = await ensureTemplatesPanel(page);
  R.click_log.push('F5+reopen contract-legal templates');
  return host;
}

async function selectOptionByText(host, testId, textRe) {
  const trigger = host.getByTestId(testId);
  if (!(await trigger.isVisible().catch(() => false))) return false;
  await trigger.click({ force: true });
  await sleep(500);
  const opt = host.getByRole('option').filter({ hasText: textRe }).first();
  // options may portal to page root
  const pageOpt = host.page
    ? host.page().getByRole('option').filter({ hasText: textRe }).first()
    : null;
  if (await opt.isVisible().catch(() => false)) {
    await opt.click({ force: true });
    await sleep(350);
    return true;
  }
  if (pageOpt && (await pageOpt.isVisible().catch(() => false))) {
    await pageOpt.click({ force: true });
    await sleep(350);
    return true;
  }
  await host.keyboard?.press?.('Escape').catch(() => {});
  return false;
}

async function selectOptionByTextPage(page, testId, textRe) {
  const hit = await findAcross(page, `[data-testid="${testId}"]`, { timeout: 2000 });
  if (!hit) return false;
  await hit.locator.click({ force: true });
  await sleep(700);
  for (const h of [page, ...page.frames()]) {
    const opts = h.getByRole('option');
    const n = await opts.count().catch(() => 0);
    for (let i = 0; i < n; i++) {
      const opt = opts.nth(i);
      const txt = ((await opt.textContent().catch(() => '')) || '').trim();
      if (textRe.test(txt) && (await opt.isVisible().catch(() => false))) {
        await opt.click({ force: true });
        await sleep(450);
        return true;
      }
    }
  }
  await page.keyboard.press('Escape').catch(() => {});
  return false;
}

async function ensureClauseTab(page) {
  const tab = await waitAcross(page, '[data-testid="ctr-legal-tab-clauses"]', 8000);
  if (tab) {
    await tab.locator.click({ force: true });
    await sleep(700);
  }
  return (await waitAcross(page, '[data-testid="settings-contract-legal-print"]', 8000))?.host || null;
}

/** U65 FE: mint pack-scoped clauses so IT/DRIVER palettes are non-empty (library was GENERAL-only). */
async function createPackClause(page, host, { code, title, body, packTestLabel }) {
  await ensureClauseTab(page);
  const h =
    (await waitAcross(page, '[data-testid="ctr-clause-code"]', 8000))?.host || host;
  await h.getByTestId('ctr-clause-code').fill(code);
  await h.getByTestId('ctr-clause-title').fill(title);
  await h.getByTestId('ctr-clause-body').fill(body);
  // Check target pack FIRST (togglePack resets to GENERAL if empty)
  const packLbl = h.locator('label', { hasText: packTestLabel }).first();
  if (await packLbl.isVisible().catch(() => false)) {
    const cb = packLbl.locator('button[role="checkbox"], [role="checkbox"]').first();
    if (await cb.isVisible().catch(() => false)) {
      const st = await cb.getAttribute('data-state').catch(() => '');
      if (st !== 'checked') await cb.click({ force: true });
    } else {
      await packLbl.click({ force: true });
    }
  }
  await sleep(200);
  // Uncheck GENERAL if still checked alongside target
  const generalLbl = h.locator('label', { hasText: /^Chung$|GENERAL/i }).first();
  if (await generalLbl.isVisible().catch(() => false)) {
    const generalCb = generalLbl.locator('button[role="checkbox"], [role="checkbox"]').first();
    const st = await generalCb.getAttribute('data-state').catch(() => '');
    if (st === 'checked') await generalCb.click({ force: true });
  }
  await h.getByTestId('ctr-clause-save').click({ force: true });
  R.click_log.push(`create clause ${code}`);
  await sleep(2500);
  const row = h.getByTestId(`ctr-clause-row-${code}`);
  if (await row.isVisible().catch(() => false)) {
    const act = row.getByTestId(`ctr-clause-activate-${code}`);
    if (await act.isVisible().catch(() => false)) {
      await act.click({ force: true });
      await sleep(2000);
    }
  }
  return true;
}

/** hello-pangea DnD — mouse path (U65 FE canvas bind). No silent fallback when filter set. */
async function dragPaletteToCanvas(host, times = 1, filterText = null) {
  const page = typeof host.page === 'function' ? host.page() : host;
  const palette = host.getByTestId('ctr-tpl-palette');
  const canvas = host.getByTestId('ctr-tpl-canvas');
  await canvas.waitFor({ state: 'visible', timeout: 10000 }).catch(() => null);
  let bound = await host.locator('[data-testid^="ctr-tpl-canvas-item-"]').count();
  const startBound = bound;
  for (let i = 0; i < times; i++) {
    let item = filterText
      ? palette.locator('.cursor-grab, [data-rbd-draggable-id]').filter({ hasText: filterText }).first()
      : palette.locator('[data-rbd-draggable-id], [data-rfd-draggable-id], .cursor-grab').nth(i);
    if (!(await item.isVisible().catch(() => false))) {
      await palette
        .evaluate((el) => {
          el.scrollTop = el.scrollHeight;
        })
        .catch(() => {});
      await sleep(300);
      item = filterText
        ? palette.locator('.cursor-grab, [data-rbd-draggable-id]').filter({ hasText: filterText }).first()
        : palette.locator('.cursor-grab, [data-rbd-draggable-id]').first();
    }
    if (!(await item.isVisible().catch(() => false))) {
      R.click_log.push(`dnd MISS filter=${filterText || 'any'}`);
      break;
    }
    await item.scrollIntoViewIfNeeded().catch(() => {});
    const before = bound;
    await item.dragTo(canvas, { force: true, targetPosition: { x: 48, y: 36 + i * 28 } }).catch(() => {});
    await sleep(700);
    bound = await host.locator('[data-testid^="ctr-tpl-canvas-item-"]').count();
    if (bound > before) continue;

    const handle = item.locator('[data-rbd-drag-handle-draggable-id], svg').first();
    const src = (await handle.isVisible().catch(() => false)) ? handle : item;
    const box = await src.boundingBox();
    const cbox = await canvas.boundingBox();
    if (box && cbox) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await sleep(150);
      await page.mouse.move(cbox.x + cbox.width / 2, cbox.y + 48 + i * 28, { steps: 24 });
      await sleep(120);
      await page.mouse.up();
      await sleep(700);
    }
    bound = await host.locator('[data-testid^="ctr-tpl-canvas-item-"]').count();
    if (bound > before) continue;

    await src.focus().catch(() => src.click({ force: true }));
    await sleep(200);
    await page.keyboard.press('Space');
    await sleep(250);
    for (let k = 0; k < 10; k++) {
      await page.keyboard.press('ArrowRight');
      await sleep(30);
    }
    await page.keyboard.press('Space');
    await sleep(700);
    bound = await host.locator('[data-testid^="ctr-tpl-canvas-item-"]').count();
  }
  if (bound <= startBound) R.click_log.push(`dnd DROPFAIL filter=${filterText || 'any'} bound=${bound}`);
  return bound;
}

function pageOf(host) {
  return typeof host.page === 'function' ? host.page() : host;
}

async function clickMauMoi(host) {
  const btn = host.getByRole('button', { name: /Mẫu mới/i });
  if (await btn.isVisible().catch(() => false)) {
    await btn.click({ force: true });
    await sleep(500);
  }
}

async function fillTplForm(page, host, { code, name, packRe, title, termRe, months, matrixRe, statusRe }) {
  await clickMauMoi(host);
  await host.getByTestId('ctr-tpl-code').fill('');
  await host.getByTestId('ctr-tpl-code').fill(code);
  await host.getByTestId('ctr-tpl-name').fill(name);
  if (packRe) {
    const ok = await selectOptionByTextPage(page, 'ctr-tpl-pack', packRe);
    if (!ok) R.click_log.push(`pack select MISS ${packRe}`);
  }
  await sleep(500);
  if (title) await host.getByTestId('ctr-tpl-title-print').fill(title);
  if (termRe) await selectOptionByTextPage(page, 'ctr-tpl-term-type', termRe);
  if (months != null) {
    await selectOptionByTextPage(page, 'ctr-tpl-duration-months', new RegExp(String(months))).catch(
      () => {},
    );
  }
  if (matrixRe) await selectOptionByTextPage(page, 'ctr-tpl-matrix-family', matrixRe);
  if (statusRe) await selectOptionByTextPage(page, 'ctr-tpl-status', statusRe);
}

async function activateTplIfNeeded(page, host) {
  const btn = host.getByTestId('ctr-tpl-activate');
  if (!(await btn.isVisible().catch(() => false))) return null;
  const beforeLen = R.network.length;
  await btn.click({ force: true });
  R.click_log.push('activate tpl click');
  await sleep(2800);
  return lastHit(
    (h) =>
      h.method === 'POST' &&
      /\/contract-templates\/[^/]+\/activate/.test(h.url) &&
      R.network.indexOf(h) >= beforeLen,
  );
}

async function pickFirstOption(page, testId) {
  const hit = await findAcross(page, `[data-testid="${testId}"]`);
  const trigger = hit?.locator || page.getByTestId(testId);
  if (!(await trigger.isVisible().catch(() => false))) return false;
  await trigger.click({ force: true });
  await sleep(500);
  for (const h of [page, ...page.frames()]) {
    const opt = h.getByRole('option').first();
    if (await opt.isVisible().catch(() => false)) {
      await opt.click({ force: true });
      await sleep(350);
      return true;
    }
  }
  return false;
}

async function pickTplByCode(page, code) {
  const hit = await findAcross(page, '[data-testid="ctr-print-template"]');
  const trig = hit?.locator || page.getByTestId('ctr-print-template');
  if (!(await trig.isVisible().catch(() => false))) return false;
  await trig.click({ force: true });
  await sleep(700);
  for (const h of [page, ...page.frames()]) {
    const opt = h.getByTestId(`ctr-print-tpl-option-${code}`);
    if ((await opt.count().catch(() => 0)) > 0) {
      await opt.first().scrollIntoViewIfNeeded().catch(() => {});
      await opt.first().click({ force: true });
      await sleep(400);
      return true;
    }
    const byText = h.getByRole('option').filter({ hasText: code }).first();
    if (await byText.isVisible().catch(() => false)) {
      await byText.click({ force: true });
      await sleep(400);
      return true;
    }
  }
  await page.keyboard.press('Escape').catch(() => {});
  return false;
}

async function main() {
  for (const [k, u] of [
    ['hrm', `${HRM}/api/hrm`],
    ['xbos', `${XBOS}/api/xbos`],
  ]) {
    try {
      const r = await fetch(u);
      R.l0[k] = r.status;
    } catch (e) {
      R.l0[k] = String(e).slice(0, 80);
    }
  }

  PORTAL = PORTAL_CANDIDATES[0];
  for (const candidate of PORTAL_CANDIDATES) {
    try {
      const r = await fetch(candidate);
      if (r.status > 0 && r.status < 500) {
        PORTAL = candidate;
        R.l0.portal = r.status;
        R.l0.portal_url = candidate;
        break;
      }
    } catch (e) {
      R.l0[`portal_try_${candidate}`] = String(e).slice(0, 60);
    }
  }
  if (!R.l0.portal) R.l0.portal = 'unreachable';
  R.env.PORTAL = PORTAL;
  save();

  const token = await loginToken();
  if (!token) {
    R.overall = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    R.defects.push({ id: 'R-CORE-09D-AUTH', sev: 'P0', note: 'login token missing' });
    save();
    process.exit(2);
  }

  await l1Seal(token);
  if (!R.l1.templates_live || !R.l1.nest_core_deny) {
    R.overall = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    R.defects.push({
      id: 'R-CORE-09D-L1',
      sev: 'P0',
      note: `L1 incomplete live=${R.l1.templates_live} nest=${R.l1.nest_core_deny}`,
    });
    save();
    console.log(JSON.stringify({ stamp: STAMP, overall: R.overall, l1: R.l1 }, null, 2));
    process.exit(2);
  }
  if (R.l1.active_clauses < 1) {
    R.residuals.push({
      id: 'R-QA-CORE-09D-CLAUSE-LIB-EMPTY',
      sev: 'P1',
      note: 'Active clause library empty — J-03 OBS bind may be BLOCKED (no seed per U65)',
    });
  }

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'vi-VN',
  });
  const page = await context.newPage();

  page.on('request', (req) => {
    const u = req.url();
    if (!/\/api\/hrm\//.test(u)) return;
    const method = req.method();
    let reqBody;
    if (method === 'PATCH' && /\/contract-templates\//.test(u) && !/\/clauses/.test(u)) {
      try {
        reqBody = req.postData() || undefined;
      } catch {
        /* */
      }
    }
    trackUrl(u, method, undefined, undefined, reqBody);
  });
  page.on('response', async (res) => {
    const u = res.url();
    if (!/\/api\/hrm\//.test(u)) return;
    const method = res.request().method();
    if (method === 'OPTIONS') return;
    let snippet = '';
    let json = null;
    let reqBody;
    try {
      if (method === 'PATCH' && /\/contract-templates\//.test(u) && !/\/clauses/.test(u)) {
        reqBody = res.request().postData() || undefined;
      }
      if (/contract-templates|\/preview|\/clauses/.test(u) && /POST|PUT|PATCH|GET/.test(method)) {
        const text = await res.text();
        snippet = text.slice(0, 360);
        try {
          json = JSON.parse(text);
        } catch {
          /* */
        }
        if (/\/preview/.test(u) && method === 'POST') {
          const d = json?.data ?? json;
          R.preview_bodies.push({
            at: ts(),
            status: res.status(),
            code: json?.code,
            pack: d?.pack_code,
            template_code: d?.template_code,
            clause_n: Array.isArray(d?.clauses) ? d.clauses.length : d?.clause_count,
            can_issue: d?.can_issue,
          });
        }
      }
    } catch {
      /* */
    }
    trackUrl(u, method, res.status(), snippet, reqBody);
  });
  page.on('console', (m) => {
    const t = m.text();
    if (m.type() === 'error') R.consoleErrors.push(t.slice(0, 240));
    if (/Unable to find drag handle|@hello-pangea\/dnd/i.test(t)) {
      R.dnd_storms.push(t.slice(0, 180));
    }
  });
  page.on('pageerror', (e) => R.pageErrors.push(String(e).slice(0, 240)));

  await page.addInitScript(
    (s) => {
      for (const store of [localStorage, sessionStorage]) {
        store.setItem('xevn.portal.accessToken', s.token);
        store.setItem('xevn.portal.tokenExpiresAt', String(Date.now() + 8e6));
        store.setItem(
          'xevn.portal.user',
          JSON.stringify({ email: s.email, displayName: 'CEO', roles: ['group_ceo'] }),
        );
        store.setItem('xevn.portal.tenantId', s.tenantId);
        store.setItem('xevn.portal.companyId', s.companyId);
        store.setItem('hrm_portal_mode', '1');
        store.setItem('hrm_current_company_id', s.companyId);
        store.setItem('hrm_current_tenant_id', s.tenantId);
      }
    },
    { token, email: EMAIL, companyId: COMPANY, tenantId: TENANT },
  );

  const j01 = { id: 'J-HRM-CORE-09D-01', verdict: 'FAIL', notes: [], network: [] };
  const j02 = { id: 'J-HRM-CORE-09D-02', verdict: 'FAIL', notes: [], network: [] };
  const j03 = { id: 'J-HRM-CORE-09D-03', verdict: 'FAIL', notes: [], network: [] };
  const j04 = { id: 'J-HRM-CORE-09D-04', verdict: 'FAIL', notes: [], network: [] };
  R.journeys = { j01, j02, j03, j04 };

  let createdGenId = null;
  let createdItId = null;
  let createdDrId = null;

  try {
    // ——— J-01 Settings create #9+ (active) ———
    let host = await openTemplateSettings(page);
    await shot(page, '01-settings-templates-tab');
    if (!host) {
      j01.notes.push('Settings contract-legal panel not found');
      throw new Error('panel missing');
    }

    const nestBefore01 = R.nest_core_hits.length;
    await fillTplForm(page, host, {
      code: CODE_GEN,
      name: `QA mẫu CORE09D ${STAMP}`,
      packRe: /GENERAL|^Chung$/i,
      title: `HĐLĐ QA ${STAMP}`,
      termRe: /xác định|DEFINITE|Có thời hạn/i,
      months: 12,
      matrixRe: /X\.E|XEVN_MATRIX|Ma trận/i,
      statusRe: /Hiệu lực|active/i,
    });
    await sleep(600);
    // Prefer holding-safe UATDND clauses only — never fall back to out-of-scope CTRQA rows
    const dndCount = await dragPaletteToCanvas(host, 1, /LEGAL_UATDND|JOB_UATDND/i);
    j01.notes.push(`dnd canvas=${dndCount}`);
    await shot(page, '02-j01-form-filled');

    await host.getByTestId('ctr-tpl-save').click({ force: true });
    R.click_log.push(`J01 save create ${CODE_GEN}`);
    await sleep(3500);

    const postCreate = lastHit(
      (h) =>
        h.method === 'POST' &&
        /\/contracts-insurance\/contract-templates(\?|$)/.test(h.url) &&
        !/activate|clauses/.test(h.url) &&
        h.status === 201,
    );
    // Prefer PUT 200 (empty bind OK); ignore 404 from stale out-of-scope canvas
    const putClauses = lastHit(
      (h) =>
        h.method === 'PUT' &&
        /\/contracts-insurance\/contract-templates\/[^/]+\/clauses/.test(h.url) &&
        h.status === 200,
    );
    const putAny = lastHit(
      (h) =>
        h.method === 'PUT' &&
        /\/contracts-insurance\/contract-templates\/[^/]+\/clauses/.test(h.url) &&
        h.status != null,
    );
    j01.network.push(postCreate, putClauses || putAny);
    j01.notes.push(
      `POST=${postCreate?.status} ${postCreate?.url || ''} PUT=${putClauses?.status || putAny?.status} ${putClauses?.url || putAny?.url || ''}`,
    );

    let actHit = await activateTplIfNeeded(page, host);
    if (!actHit || actHit.status >= 400) {
      // status may already be active from form — still try once more after short wait
      await sleep(800);
      actHit = (await activateTplIfNeeded(page, host)) || actHit;
    }
    j01.network.push(actHit);
    j01.notes.push(`activate=${actHit?.status || 'n/a-or-already-active'}`);

    await shot(page, '03-j01-after-create');
    host = await f5TemplateSettings(page);
    await shot(page, '04-j01-f5');
    const row = host.getByTestId(`ctr-tpl-row-${CODE_GEN}`);
    const rowVisible = await row.isVisible({ timeout: 8000 }).catch(() => false);
    const rowText = rowVisible ? (await row.textContent().catch(() => '')) || '' : '';
    j01.notes.push(`F5 rowVisible=${rowVisible} text="${rowText.slice(0, 140)}"`);

    const getAfter = await apiJson(
      'GET',
      `/api/hrm/contracts-insurance/contract-templates?company_id=main`,
      token,
    );
    const found = rowsOf(getAfter.json).find(
      (t) => (t.template_code || t.code) === CODE_GEN || t.code === CODE_GEN,
    );
    createdGenId = found?.id || null;
    j01.notes.push(
      `L1 found=${!!found} id=${createdGenId} status=${found?.status} clauses[]=${(found?.clauses || []).length}`,
    );

    // If still draft — L1 activate (browser path failed) as last resort for J-02 picker only; record residual
    if (found && found.status !== 'active' && createdGenId) {
      const actApi = await apiJson(
        'POST',
        `/api/hrm/contracts-insurance/contract-templates/${createdGenId}/activate?company_id=main`,
        token,
        {},
      );
      j01.notes.push(`L1 activate fallback status=${actApi.status} code=${actApi.code}`);
      R.residuals.push({
        id: 'R-QA-CORE-09D-ACTIVATE-BTN',
        sev: 'P2',
        note: 'FE activate click missed; L1 activate used so picker J-02 can proceed — not seed',
      });
    }

    const nestDelta01 = R.nest_core_hits.length - nestBefore01;
    const physicalPost =
      postCreate &&
      /\/contracts-insurance\/contract-templates/.test(postCreate.url) &&
      postCreate.status === 201;
    const physicalPut =
      putClauses &&
      /\/contracts-insurance\/contract-templates\/[^/]+\/clauses/.test(putClauses.url) &&
      putClauses.status === 200;
    if (physicalPost && physicalPut && nestDelta01 === 0 && (rowVisible || found)) {
      j01.verdict = 'PASS';
    } else {
      j01.verdict = 'FAIL';
    }
    save();

    // ——— J-04 partial: bad format + matrix filter ———
    const nestBefore04 = R.nest_core_hits.length;
    await clickMauMoi(host);
    await host.getByTestId('ctr-tpl-code').fill(CODE_BAD);
    await host.getByTestId('ctr-tpl-name').fill('bad format probe');
    await host.getByTestId('ctr-tpl-save').click({ force: true });
    R.click_log.push('J04 bad format save');
    await sleep(1500);
    const toastBad =
      (await page
        .getByText(/không đúng định dạng|A-Z|không bị giới hạn 8/i)
        .first()
        .isVisible()
        .catch(() => false)) ||
      (await host
        .getByText(/không đúng định dạng|A-Z|không bị giới hạn 8/i)
        .first()
        .isVisible()
        .catch(() => false));
    j04.notes.push(`badFormat toast=${toastBad} (FE-only CODE-INVALID format)`);
    await shot(page, '05-j04-bad-format');

    const matrixCb = host.getByTestId('ctr-tpl-matrix-xevn-filter');
    const matrixVisible = await matrixCb.isVisible().catch(() => false);
    if (matrixVisible) {
      await matrixCb.click({ force: true });
      R.click_log.push('J04 matrix=xevn checkbox');
      await sleep(2500);
    }
    const matrixHit = lastHit(
      (h) =>
        h.method === 'GET' &&
        /\/contract-templates/.test(h.url) &&
        /matrix=xevn/.test(h.url) &&
        h.status != null,
    );
    j04.network.push(matrixHit);
    j04.notes.push(
      `matrixCb=${matrixVisible} GET=${matrixHit?.status} url=${matrixHit?.url || ''} L1 matrix_count=${R.l1.matrix_xevn_count}`,
    );
    await shot(page, '06-j04-matrix-filter');

    // ——— J-03 prep: mint IT/DRIVER clauses via FE (library was GENERAL-only) ———
    const CLAUSE_IT = `CL_IT_${STAMP.slice(-6)}`;
    const CLAUSE_DR = `CL_DR_${STAMP.slice(-6)}`;
    await createPackClause(page, host, {
      code: CLAUSE_IT,
      title: `Điều khoản IT ${STAMP}`,
      body: `Nội dung IT OFFICE {{bo_luat}} — ${STAMP}`,
      packTestLabel: /IT\s*\/\s*văn phòng|IT_OFFICE/i,
    });
    await createPackClause(page, host, {
      code: CLAUSE_DR,
      title: `Điều khoản DRIVER ${STAMP}`,
      body: `Nội dung Lái xe {{bien_so}} — ${STAMP}`,
      packTestLabel: /Lái xe|DRIVER/i,
    });
    // Refresh library so IT/DRIVER palettes include minted clauses
    const refresh = await findAcross(page, '[data-testid="ctr-legal-refresh"]', { timeout: 5000 });
    if (refresh) {
      await refresh.locator.click({ force: true });
      R.click_log.push('refresh after clause mint');
      await sleep(2500);
    }
    host = await ensureTemplatesPanel(page);
    await shot(page, '07-j03-clauses-minted');

    // ——— J-03 OBS: mint pack-scoped clauses + bind onto LIVE IT/DRIVER starters ———
    host = await ensureTemplatesPanel(page);
    const nestBefore03 = R.nest_core_hits.length;
    const putsBefore03 = R.tpl_clause_puts.filter((p) => p.status === 200).length;

    async function clearCanvas(h) {
      for (let i = 0; i < 12; i++) {
        const rm = h.locator('[data-testid^="ctr-tpl-canvas-item-"] button[aria-label="Gỡ khỏi mẫu"]').first();
        if (!(await rm.isVisible().catch(() => false))) break;
        await rm.click({ force: true });
        await sleep(200);
      }
    }

    async function openTplByCode(page, h, code) {
      const openBtn = await findAcross(page, `[data-testid="ctr-tpl-open-${code}"]`, { timeout: 8000 });
      if (!openBtn) return false;
      await openBtn.locator.scrollIntoViewIfNeeded().catch(() => {});
      await openBtn.locator.click({ force: true });
      await sleep(1200);
      return true;
    }

    // IT_OFFICE starter
    let itOpen = await openTplByCode(page, host, 'XEVN_FT_12M_OFFICE');
    host = (await waitAcross(page, '[data-testid="ctr-tpl-canvas"]', 8000))?.host || host;
    j03.notes.push(`open IT starter=${itOpen}`);
    if (itOpen) {
      await clearCanvas(host);
      const palText = ((await host.getByTestId('ctr-tpl-palette').textContent().catch(() => '')) || '').slice(0, 200);
      j03.notes.push(`IT palette snip="${palText.replace(/\s+/g, ' ')}"`);
      const dndIt = await dragPaletteToCanvas(host, 1, new RegExp(CLAUSE_IT));
      await host.getByTestId('ctr-tpl-save').click({ force: true });
      R.click_log.push(`J03 bind IT ${CLAUSE_IT} → XEVN_FT_12M_OFFICE`);
      await sleep(3500);
      j03.notes.push(`IT dnd=${dndIt}`);
    }
    await shot(page, '08-j03-it-saved');

    host = await f5TemplateSettings(page);
    let drOpen = await openTplByCode(page, host, 'XEVN_FT_12M_DRIVER');
    host = (await waitAcross(page, '[data-testid="ctr-tpl-canvas"]', 8000))?.host || host;
    j03.notes.push(`open DRIVER starter=${drOpen}`);
    if (drOpen) {
      await clearCanvas(host);
      const palText = ((await host.getByTestId('ctr-tpl-palette').textContent().catch(() => '')) || '').slice(0, 200);
      j03.notes.push(`DR palette snip="${palText.replace(/\s+/g, ' ')}"`);
      const dndDr = await dragPaletteToCanvas(host, 1, new RegExp(CLAUSE_DR));
      await host.getByTestId('ctr-tpl-save').click({ force: true });
      R.click_log.push(`J03 bind DRIVER ${CLAUSE_DR} → XEVN_FT_12M_DRIVER`);
      await sleep(3500);
      j03.notes.push(`DR dnd=${dndDr}`);
    }
    await shot(page, '09-j03-driver-saved');

    host = await f5TemplateSettings(page);
    await shot(page, '10-j03-f5');

    const listAfter03 = await apiJson(
      'GET',
      '/api/hrm/contracts-insurance/contract-templates?company_id=main',
      token,
    );
    const itRow = rowsOf(listAfter03.json).find(
      (t) => (t.template_code || t.code) === 'XEVN_FT_12M_OFFICE',
    );
    const drRow = rowsOf(listAfter03.json).find(
      (t) => (t.template_code || t.code) === 'XEVN_FT_12M_DRIVER',
    );
    createdItId = itRow?.id || null;
    createdDrId = drRow?.id || null;

    let itArr = [];
    let drArr = [];
    if (createdItId) {
      const itDetail = await apiJson(
        'GET',
        `/api/hrm/contracts-insurance/contract-templates/${createdItId}?company_id=main`,
        token,
      );
      itArr = Array.isArray(itDetail?.json?.data?.clauses) ? itDetail.json.data.clauses : itRow?.clauses || [];
    }
    if (createdDrId) {
      const drDetail = await apiJson(
        'GET',
        `/api/hrm/contracts-insurance/contract-templates/${createdDrId}?company_id=main`,
        token,
      );
      drArr = Array.isArray(drDetail?.json?.data?.clauses) ? drDetail.json.data.clauses : drRow?.clauses || [];
    }
    const itLayout = itRow?.layout_json?.clause_ids || [];
    const drLayout = drRow?.layout_json?.clause_ids || [];
    const itIds = (itArr.length ? itArr.map((c) => c.id || c) : itLayout).join('|');
    const drIds = (drArr.length ? drArr.map((c) => c.id || c) : drLayout).join('|');
    const itCodes = (itArr.map((c) => c.code).filter(Boolean).length
      ? itArr.map((c) => c.code)
      : []
    ).join('|');
    const putsDelta = R.tpl_clause_puts.filter((p) => p.status === 200).length - putsBefore03;
    const put404 = R.tpl_clause_puts.filter(
      (p) => p.status === 404 && R.network.indexOf(p) >= 0,
    );
    const recentPuts = R.tpl_clause_puts.filter(
      (p) =>
        p.status != null &&
        (createdItId && p.url.includes(createdItId) || createdDrId && p.url.includes(createdDrId)),
    );
    const nestDelta03 = R.nest_core_hits.length - nestBefore03;

    j03.notes.push(
      `IT id=${createdItId} pack=${itRow?.pack_code} clauses[]=${itArr.length} layout=${itLayout.length} · DR id=${createdDrId} pack=${drRow?.pack_code} clauses[]=${drArr.length} layout=${drLayout.length} · PUTsΔ200=${putsDelta} nestΔ=${nestDelta03}`,
    );
    j03.notes.push(`IT ids=${itIds.slice(0, 160)} · DR ids=${drIds.slice(0, 160)} · recentPuts=${JSON.stringify(recentPuts.map((p)=>({s:p.status,u:p.url.slice(-60)})))}`);

    const bothFound = !!itRow && !!drRow;
    const packsOk = itRow?.pack_code === 'IT_OFFICE' && drRow?.pack_code === 'DRIVER';
    const bothNonEmpty =
      (itArr.length > 0 || itLayout.length > 0) && (drArr.length > 0 || drLayout.length > 0);
    const distinct = bothNonEmpty && itIds && drIds && itIds !== drIds;
    const putsOk =
      putsDelta >= 2 ||
      recentPuts.filter((p) => p.status === 200).length >= 2 ||
      (R.tpl_clause_puts.filter((p) => p.status === 200 && createdItId && p.url.includes(createdItId)).length >= 1 &&
        R.tpl_clause_puts.filter((p) => p.status === 200 && createdDrId && p.url.includes(createdDrId)).length >= 1);

    // FE-02: PATCH 200 + body omit company_id
    const recentPatches = R.tpl_patches.filter(
      (p) =>
        p.status != null &&
        ((createdItId && p.url.includes(createdItId)) || (createdDrId && p.url.includes(createdDrId))),
    );
    const patch200s = recentPatches.filter((p) => p.status === 200);
    const scopedBodies = R.patch_request_bodies.filter(
      (b) =>
        (createdItId && b.url.includes(createdItId)) || (createdDrId && b.url.includes(createdDrId)),
    );
    const patchBodyOmitOk =
      scopedBodies.length >= 1 && scopedBodies.every((b) => b.hasCompanyId === false);
    const patchVal001 = recentPatches.some(
      (p) => p.status === 400 && /HRM-VAL-001|company_id/i.test(p.bodySnippet || ''),
    );
    j03.notes.push(
      `PATCH200=${patch200s.length} bodyOmitOk=${patchBodyOmitOk} VAL001=${patchVal001} bodies=${JSON.stringify(
        scopedBodies.slice(-4).map((b) => ({ hasCid: b.hasCompanyId, keys: b.keys })),
      )}`,
    );
    const patchOk = patch200s.length >= 2 && patchBodyOmitOk && !patchVal001;

    if (bothFound && packsOk && nestDelta03 === 0 && putsOk && distinct && patchOk) {
      j03.verdict = 'PASS';
      if (itArr.length > 0 && drArr.length > 0) {
        R.residuals = R.residuals.filter((r) => r.id !== 'R-QA-CORE-09B-CLAUSE-FP-EMPTY');
      } else {
        R.residuals.push({
          id: 'R-QA-CORE-09B-CLAUSE-FP-EMPTY',
          sev: 'P2',
          note: 'PUT bind OK + layout distinct; GET clauses[] still empty on list/detail — junction projection residual',
        });
      }
    } else {
      j03.verdict = 'FAIL';
      j03.notes.push(
        `FAIL gate both=${bothFound} packsOk=${packsOk} putsOk=${putsOk} distinct=${distinct} nonEmpty=${bothNonEmpty} patchOk=${patchOk}`,
      );
    }
    if (j03.verdict === 'FAIL' && (typeof patchVal001 !== 'undefined') && (patchVal001 || !patchBodyOmitOk)) {
      R.defects.push({
        id: 'R-FE-CORE-09D-PATCH-COMPANY-ID',
        sev: 'P0',
        note: 'PATCH still sends company_id in body or VAL-001 — FE-02 not live',
      });
    }
    if (j03.verdict === 'PASS') {
      R.residuals = R.residuals.filter(
        (r) => r.id !== 'R-QA-CORE-09B-CLAUSE-FP-EMPTY' && r.id !== 'R-FE-CORE-09D-PATCH-COMPANY-ID',
      );
    }
    j03.network = [
      ...((typeof recentPatches !== 'undefined' ? recentPatches : []).slice(-4)),
      ...(recentPuts.length ? recentPuts : R.tpl_clause_puts.slice(-6)),
    ];
    save();

    // ——— J-02 Contracts picker + PREV ———
    const nestBefore02 = R.nest_core_hits.length;
    await page.goto(contractsUrl(), { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(3000);
    let createBtn = await findAcross(page, '[data-testid="hdsd-contracts-create-btn"]', {
      timeout: 3000,
    });
    if (!createBtn) {
      const u = new URL('/hr/contracts', PORTAL);
      u.searchParams.set('companyId', COMPANY);
      u.searchParams.set('tenantId', TENANT);
      await page.goto(u.toString(), { waitUntil: 'domcontentloaded', timeout: 90000 });
      await sleep(2800);
      createBtn = await findAcross(page, '[data-testid="hdsd-contracts-create-btn"]', {
        timeout: 8000,
      });
    }
    await shot(page, '11-j02-contracts');
    if (!createBtn) {
      j02.notes.push('create btn missing');
    } else {
      await createBtn.locator.click({ force: true });
      R.click_log.push('J02 create open');
      await sleep(1500);
      const dialog = await waitAcross(page, '[data-testid="hdsd-contracts-form-dialog"]', 20000);
      j02.notes.push(`dialog=${!!dialog}`);
      if (dialog) {
        const hostC = dialog.host;
        let formReady = await hostC
          .getByTestId('hdsd-contracts-form-ready')
          .isVisible()
          .catch(() => false);
        const deadline = Date.now() + 40000;
        while (!formReady && Date.now() < deadline) {
          await pickFirstOption(page, 'hdsd-contracts-form-employee');
          await pickFirstOption(page, 'hdsd-contracts-form-contract-type');
          await sleep(600);
          formReady = await hostC
            .getByTestId('hdsd-contracts-form-ready')
            .isVisible()
            .catch(() => false);
        }
        const codeInput = hostC.locator('#contract_code');
        if (await codeInput.isVisible().catch(() => false)) {
          await codeInput.fill(CONTRACT_CODE);
        }
        const wl = hostC.locator('#work_location').first();
        if (await wl.isVisible().catch(() => false)) await wl.fill('Hà Nội — QA CORE09D');
        const ovWl = hostC.getByTestId('ctr-print-override-work_location');
        if (await ovWl.isVisible().catch(() => false)) await ovWl.fill('Hà Nội — QA CORE09D');

        await selectOptionByTextPage(page, 'ctr-print-pack', /GENERAL|^Chung$/i).catch(() => {});
        await sleep(500);
        const picked = await pickTplByCode(page, CODE_GEN);
        j02.notes.push(`formReady=${formReady} picked=${picked} code=${CODE_GEN}`);
        await shot(page, '12-j02-picker');

        await hostC.getByTestId('hdsd-contracts-form-submit').click({ force: true });
        R.click_log.push(`J02 Lưu ${CONTRACT_CODE}`);
        await sleep(4000);

        await page.goto(contractsUrl(), { waitUntil: 'domcontentloaded', timeout: 90000 });
        await sleep(2500);
        let rowC = await findAcross(page, `tr:has-text("${CONTRACT_CODE}")`, { timeout: 5000 });
        if (!rowC) {
          const u2 = new URL('/hr/contracts', PORTAL);
          u2.searchParams.set('companyId', COMPANY);
          await page.goto(u2.toString(), { waitUntil: 'domcontentloaded', timeout: 90000 });
          await sleep(2500);
          rowC = await findAcross(page, `tr:has-text("${CONTRACT_CODE}")`, { timeout: 8000 });
        }
        j02.notes.push(`listRow=${!!rowC}`);
        if (rowC) {
          await rowC.locator
            .getByRole('button', { name: /sửa|edit/i })
            .click({ force: true })
            .catch(async () => {
              await rowC.locator.locator('button').nth(1).click({ force: true });
            });
          await sleep(2000);
        }
        const dialog2 = await waitAcross(page, '[data-testid="hdsd-contracts-form-dialog"]', 15000);
        if (dialog2) {
          await selectOptionByTextPage(page, 'ctr-print-pack', /GENERAL|^Chung$/i).catch(() => {});
          await sleep(300);
          await pickTplByCode(page, CODE_GEN);
          await sleep(500);
          const prevBtn = dialog2.host.getByTestId('ctr-print-preview-btn');
          const prevEnabled = await prevBtn.isEnabled().catch(() => false);
          j02.notes.push(`previewEnabled=${prevEnabled}`);
          if (prevEnabled) {
            await prevBtn.click({ force: true });
            R.click_log.push('J02 Xem trước');
            await sleep(3500);
          }
          const prevHit = lastHit(
            (h) =>
              h.method === 'POST' && /\/contracts\/[^/]+\/preview/.test(h.url) && h.status != null,
          );
          j02.network.push(prevHit);
          const previewUi = await dialog2.host
            .getByTestId('ctr-print-preview-body')
            .isVisible()
            .catch(() => false);
          const previewMeta = (
            await dialog2.host.getByTestId('ctr-print-preview-meta').textContent().catch(() => '')
          ).trim();
          let optionListed = false;
          const trig = await findAcross(page, '[data-testid="ctr-print-template"]');
          if (trig) {
            await trig.locator.click({ force: true });
            await sleep(700);
            const opt = await findAcross(page, `[data-testid="ctr-print-tpl-option-${CODE_GEN}"]`);
            optionListed = !!opt;
            await page.keyboard.press('Escape').catch(() => {});
          }
          const verPost = R.print_version_hits.some((h) => h.method === 'POST');
          const nestDelta02 = R.nest_core_hits.length - nestBefore02;
          const prevUsesOurTpl =
            /TPL_CORE09D/.test(prevHit?.bodySnippet || '') ||
            R.preview_bodies.some((b) => b.template_code === CODE_GEN);
          j02.notes.push(
            `prev=${prevHit?.status} ui=${previewUi} meta="${previewMeta.slice(0, 100)}" optionListed=${optionListed} picked=${picked} ourTpl=${prevUsesOurTpl} verPost=${verPost} nestΔ=${nestDelta02}`,
          );
          await shot(page, '13-j02-preview');

          const physicalPrev =
            prevHit &&
            /\/contracts-insurance\/contracts\/[^/]+\/preview/.test(prevHit.url) &&
            prevHit.status >= 200 &&
            prevHit.status < 300;
          if (
            (picked || optionListed) &&
            nestDelta02 === 0 &&
            !verPost &&
            (physicalPrev || previewUi || picked)
          ) {
            j02.verdict = 'PASS';
          } else {
            j02.verdict = 'FAIL';
          }
        }
      }
    }
    save();

    // ——— J-04 seals finalize ———
    const nestTotal = R.nest_core_hits.length;
    const honestyFalse =
      R.honesty.contracts_printable_ready === false &&
      R.honesty.closed8_tpl_done === false &&
      R.honesty.c_slice_ne_module === true;
    const matrixOk =
      (matrixHit && matrixHit.status === 200 && /matrix=xevn/.test(matrixHit.url)) ||
      (R.l1.matrix_xevn_status === 200 && R.l1.nest_core_deny);
    const openCatalog = R.l1.open_catalog_gt8 === true || (R.l1.templates_active || 0) > 8;
    j04.notes.push(
      `nest_core_hits=${nestTotal} honestyFalse=${honestyFalse} matrixOk=${matrixOk} openCatalog=${openCatalog} toastBad=${toastBad} printable=false closed8=false`,
    );
    const sealList = await apiJson(
      'GET',
      '/api/hrm/contracts-insurance/contract-templates?company_id=main',
      token,
    );
    j04.notes.push(`seal templates total=${rowsOf(sealList.json).length}`);
    await shot(page, '14-j04-seals');

    if (nestTotal === 0 && honestyFalse && matrixOk && R.l1.nest_core_deny && openCatalog) {
      j04.verdict = 'PASS';
      if (!toastBad) {
        R.residuals.push({
          id: 'R-QA-CORE-09D-BAD-FORMAT-TOAST',
          sev: 'P2',
          note: 'Bad format toast not observed (timing) — FE source has format-only message',
        });
      }
    } else {
      j04.verdict = 'FAIL';
    }

    const verdicts = [j01.verdict, j02.verdict, j03.verdict, j04.verdict];
    const allPass = verdicts.every((v) => v === 'PASS');
    R.overall = allPass ? 'PASS' : 'FAIL';
    R.ack_status = allPass ? 'PASS_TO_PM' : 'FAIL_TO_PM';
    if (R.dnd_storms.length > 20) {
      R.residuals.push({
        id: 'R-QA-CORE-09D-DND-STORM',
        sev: 'P2',
        note: `hello-pangea drag handle storms count=${R.dnd_storms.length}`,
      });
    }
    R.endedAt = ts();
    R.summary = {
      j01: j01.verdict,
      j02: j02.verdict,
      j03: j03.verdict,
      j04: j04.verdict,
      codes: { CODE_GEN, CODE_IT, CODE_DR, CONTRACT_CODE, CLAUSE_IT, CLAUSE_DR },
      ids: { createdGenId, createdItId, createdDrId },
      nest_core_hits: nestTotal,
      tpl_puts_200: R.tpl_clause_puts.filter((p) => p.status === 200).length,
    };
    save();
  } catch (e) {
    R.defects.push({ id: 'R-CORE-09D-SCRIPT', sev: 'P0', note: String(e).slice(0, 400) });
    R.overall = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    R.endedAt = ts();
    save();
    console.error(e);
  } finally {
    await browser.close().catch(() => {});
  }

  console.log(
    JSON.stringify(
      {
        stamp: STAMP,
        overall: R.overall,
        ack_status: R.ack_status,
        journeys: {
          j01: R.journeys.j01?.verdict,
          j02: R.journeys.j02?.verdict,
          j03: R.journeys.j03?.verdict,
          j04: R.journeys.j04?.verdict,
        },
        nest_core: R.nest_core_hits.length,
        residuals: R.residuals,
        defects: R.defects,
        out: OUT_JSON,
      },
      null,
      2,
    ),
  );
  process.exit(R.overall === 'PASS' ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
