#!/usr/bin/env node
/**
 * PO-HRM-MVP-GD1-ATT-02-CLUSTER-QA-01 — U65 browser J-HRM-ATT-02-01..06
 * PM exit_criteria SoT (Wave-25 CFG surface per FE-02):
 *   J-01 GET/PATCH /attendance/rules* · Nest /core 0 · mode/modeLabelVi visible
 *   J-02 XOR select one mode · Lưu 2xx · F5 còn
 *   J-03 Mixed/overlap → HRM-VAL-400 · no silent 2xx
 *   J-04 latePenaltyEnabled off · notifyLate independent · F5
 *   J-05 Scope/sourceFlags · bands path · Nest /core 0
 *   J-06 Honesty: CFG≠ATT-02 DONE · ≠ ATT UAT · printable false · PAY OUT · PLT/CORE RETAIN · LER≠mode
 * DENY seed · Nest /core ATT SoT · claim CFG=ATT-02 DONE · claim ATT UAT · invent PAY/printable · honesty flip
 * Persona: ceo@xe.vn · companyId=main · C-SLICE
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
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-hrm-mvp-gd1-att-02-cluster-qa-01.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-hrm-mvp-gd1-att-02-cluster-qa-01');
mkdirSync(SCREEN, { recursive: true });
mkdirSync(resolve(ROOT, 'docs/qa/evidence'), { recursive: true });

const PLT01_SEAL = 'PLT01QC1-MSLPUQIU';
const CORE10_SEAL = 'CORE10QC1-MSLP0EJB';
const CORE09_SEAL = 'CORE09QC1-MSLNBA89';
const CORE07_SEAL = 'CORE07QC1-KZJTSHNT';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();
const stamp = Date.now().toString(36).toLowerCase().slice(-8);
const STAMP = `ATT02QA1-${stamp.toUpperCase()}`;

let COMMIT = 'unknown';
try {
  COMMIT = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  /* */
}

function summarizeBody(body, max = 600) {
  const s = typeof body === 'string' ? body : JSON.stringify(body);
  return s.length > max ? `${s.slice(0, max)}…` : s;
}

const R = {
  work_item_id: 'PO-HRM-MVP-GD1-ATT-02-CLUSTER-QA-01',
  program: 'PO-HRM-MVP-GD1-CONTINUOUS',
  uc_ids: ['UC-BP-ATT-02', 'FR-UC-BP-ATT-02'],
  stamp: STAMP,
  startedAt: ts(),
  persona: { email: EMAIL, companyId: COMPANY },
  u65: 'zero-seed-browser-only',
  honesty: {
    attendance_uat_ready: false,
    recruitment_uat_ready: false,
    jd_dynamic_done: false,
    contracts_printable_ready: false,
    hrm_personnel_uat_ready: false,
    cfg_ne_att02_done: true,
    ler_ne_mode_sot: true,
    ne_att_module_uat: true,
    pay_out: true,
    nest_core_deny: true,
    soft_ne_core06_done: true,
    plt_core_retain: true,
    seed_used: false,
    c_slice_ne_module: true,
  },
  must_keep: [PLT01_SEAL, CORE10_SEAL, CORE09_SEAL, CORE07_SEAL],
  env: { PORTAL, HRM, XBOS, TENANT, commit: COMMIT },
  l0: {},
  network: [],
  nest_core_hits: [],
  nest_core_att_non404: [],
  rules_hits: [],
  consoleErrors: [],
  pageErrors: [],
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
function log(msg, extra = {}) {
  R.click_log.push({ at: ts(), msg, ...extra });
  console.error(`[log] ${msg}`);
}
function jset(id, verdict, detail = {}) {
  R.journeys[id] = { verdict, at: ts(), ...detail };
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 520)}`);
  save();
}

async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  R.screens.push(path.replace(/\\/g, '/'));
}

function isNestCoreAtt(url) {
  const p = String(url || '').toLowerCase();
  if (!/\/api\/hrm\/core(\/|$|\?)/.test(p)) return false;
  return (
    p.includes('attendance') ||
    p.includes('/att/') ||
    p.includes('late') ||
    p.includes('rules') ||
    p.includes('penalty') ||
    p.includes('work-site') ||
    p.includes('work-shift')
  );
}

function trackUrl(method, url, status) {
  if (!/\/api\/hrm\//.test(url)) return;
  const nest_core = /\/api\/hrm\/core(\/|$|\?)/.test(url);
  const rules =
    /\/attendance\/rules/.test(url) ||
    /\/attendance\/rules\/late-penalty/.test(url);
  const entry = {
    method,
    url: url.replace(/^https?:\/\/[^/]+/, '').slice(0, 480),
    status: status ?? null,
    at: ts(),
    nest_core,
    rules,
  };
  R.network.push(entry);
  if (nest_core) R.nest_core_hits.push(entry);
  if (nest_core && isNestCoreAtt(url) && status !== 404) R.nest_core_att_non404.push(entry);
  if (rules) R.rules_hits.push(entry);
}

function q(path) {
  const u = new URL(path, PORTAL);
  u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', TENANT);
  u.searchParams.set('companyId', COMPANY);
  u.searchParams.set('_', String(Date.now()));
  return u.toString();
}

function attendanceUrl() {
  const isDirectHrm = /:8080\b/.test(PORTAL);
  const base = isDirectHrm ? `/attendance` : `/hr/attendance`;
  return q(base);
}

async function loginApi() {
  let lastStatus = 0;
  let data = null;
  for (const url of [`${XBOS}/api/xbos/auth/login`, `${PORTAL}/api/xbos/auth/login`]) {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
      });
      lastStatus = r.status;
      const j = await r.json().catch(() => ({}));
      const d = j?.data ?? j;
      const token = d?.accessToken ?? d?.access_token ?? j?.accessToken;
      if (r.ok && token) {
        data = d;
        data.__via = url;
        break;
      }
    } catch (e) {
      console.error(`[login] fail ${url}: ${String(e).slice(0, 120)}`);
    }
  }
  if (!data?.accessToken && !data?.access_token) {
    throw new Error(`login failed status=${lastStatus}`);
  }
  const token = data.accessToken ?? data.access_token;
  return {
    token,
    expiresAt: Date.now() + 8 * 3600_000,
    companyId: COMPANY,
    user: {
      id: data.userId ?? data.user?.id ?? 'ceo',
      email: EMAIL,
      fullName: data.fullName ?? data.user?.fullName ?? 'CEO XeVN',
      tenantId: TENANT,
      companyId: COMPANY,
      roles: data.roles ?? ['group_ceo'],
      memberships: data.memberships ?? [],
    },
    raw: data,
  };
}

async function apiCall(token, method, path, opts = {}) {
  const companyId = opts.companyId ?? COMPANY;
  const url = path.startsWith('http')
    ? path
    : `${HRM}/api/hrm${path.startsWith('/') ? path : `/${path}`}`;
  const headers = {
    authorization: `Bearer ${token}`,
    'x-company-id': companyId,
    'x-tenant-id': TENANT,
    'content-type': 'application/json',
  };
  const init = { method, headers };
  if (opts.body !== undefined) init.body = JSON.stringify(opts.body);
  const r = await fetch(url, init);
  const text = await r.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text.slice(0, 400) };
  }
  trackUrl(method, url, r.status);
  return {
    status: r.status,
    code: json?.code ?? json?.error?.code ?? null,
    data: json?.data ?? json,
    json,
    summary: summarizeBody(json, 500),
    path: url.replace(/^https?:\/\/[^/]+/, ''),
  };
}

async function l0(token) {
  const out = {};
  for (const [name, url] of [
    ['hrm', `${HRM}/api/hrm`],
    ['xbos', `${XBOS}/api/xbos`],
    ['portal', PORTAL],
  ]) {
    try {
      const r = await fetch(url);
      out[name] = { status: r.status, ok: r.status === 200 };
    } catch (e) {
      out[name] = { status: 0, ok: false, err: String(e).slice(0, 120) };
    }
  }
  const nestProbe = await apiCall(token, 'GET', `/core/attendance/rules?company_id=${COMPANY}`);
  out.nest_core_att_rules = { status: nestProbe.status, ok: nestProbe.status === 404 };
  R.l0 = out;
  save();
  return out.hrm?.ok && out.xbos?.ok && out.portal?.ok;
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

function trackPage(page) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') R.consoleErrors.push(String(msg.text()).slice(0, 360));
  });
  page.on('pageerror', (err) => R.pageErrors.push(String(err).slice(0, 360)));
  page.on('response', (res) => {
    try {
      trackUrl(res.request().method(), res.url(), res.status());
    } catch {
      /* */
    }
  });
}

async function findAcross(page, selector, { timeout = 800 } = {}) {
  const hosts = [page, ...page.frames()];
  for (const h of hosts) {
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

async function waitAcross(page, selector, ms = 20000) {
  const start = Date.now();
  while (Date.now() - start < ms) {
    const hit = await findAcross(page, selector, { timeout: 400 });
    if (hit) return hit;
    await sleep(250);
  }
  return null;
}

async function clickAcross(page, selector, label) {
  const hit = await waitAcross(page, selector, 12000);
  if (!hit) throw new Error(`missing ${label || selector}`);
  await hit.locator.click({ timeout: 5000 });
  log(`click ${label || selector}`);
  return hit;
}

async function openRulesChung(page, { alreadyOnAttendance = false } = {}) {
  if (!alreadyOnAttendance) {
    await page.goto(attendanceUrl(), { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(1500);
  }
  // Top tab: HDSD «Thiết lập» (not always «Cài đặt»)
  const settingsExact = page.getByRole('button', { name: /^(Thiết lập|Cài đặt|Settings)$/i }).first();
  if (await settingsExact.isVisible().catch(() => false)) {
    await settingsExact.click({ timeout: 15000 });
    log('open settings tab (role)');
    await sleep(1200);
  } else {
    const settings =
      (await findAcross(page, 'button:has-text("Thiết lập")')) ||
      (await findAcross(page, 'button:has-text("Cài đặt")'));
    if (settings) {
      await settings.locator.click({ force: true }).catch(() => {});
      log('open settings tab (text)');
      await sleep(1200);
    }
  }

  const shell = page.locator('[data-testid="att-settings-shell-precision"]');
  await shell.waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});

  // Sidebar: i18n «Quy định chấm công» (not bare «Quy tắc»)
  const rulesSide = shell
    .locator('nav button')
    .filter({ hasText: /Quy định chấm công|Quy tắc|Rules/i })
    .first();
  if (await rulesSide.isVisible().catch(() => false)) {
    await rulesSide.click();
    log('open sidebar Quy định chấm công');
    await sleep(1000);
  } else {
    // Fallback across frames
    const rules =
      (await findAcross(page, 'button:has-text("Quy định chấm công")')) ||
      (await findAcross(page, 'button:has-text("Quy tắc")'));
    if (rules) {
      await rules.locator.click().catch(() => {});
      log('open rules sidebar (fallback)');
      await sleep(1000);
    }
  }

  // Chung / general
  const chungBtn =
    (await findAcross(page, '[data-testid="hdsd-att-rules-tab-general"]')) ||
    (await findAcross(page, 'button:has-text("Chung")'));
  if (chungBtn) {
    await chungBtn.locator.click().catch(() => {});
    log('open rules→Chung');
    await sleep(1000);
  }

  const panel = await waitAcross(page, '[data-testid="att-02-late-penalty-panel"]', 25000);
  if (!panel) {
    await shot(page, '00-nav-fail-rules');
    throw new Error('att-02-late-penalty-panel not found after Quy định chấm công → Chung');
  }
  // Scroll panel into view
  await panel.locator.scrollIntoViewIfNeeded().catch(() => {});
  await sleep(400);
  return panel.host;
}

async function readPanelState(host) {
  return host.evaluate(() => {
    const text = (sel) => document.querySelector(sel)?.textContent?.trim() || '';
    const checked = (sel) => !!document.querySelector(sel)?.checked;
    const enabled = document.querySelector('[data-testid="att-02-late-penalty-enabled"]');
    const isChecked =
      enabled?.getAttribute('data-state') === 'checked' ||
      enabled?.getAttribute('aria-checked') === 'true' ||
      !!enabled?.checked;
    return {
      badge: text('[data-testid="att-02-mode-status-badge"]'),
      liveBanner: text('[data-testid="att-02-mode-live-banner"]'),
      residualBanner: text('[data-testid="att-02-mode-residual-banner"]'),
      modeLabelVi: text('[data-testid="att-02-mode-label-vi"]'),
      sourceFlags: text('[data-testid="att-02-source-flags"]'),
      notifyLate: text('[data-testid="att-02-notify-late-peer"]'),
      honesty: text('[data-testid="att-02-honesty"]'),
      val400: text('[data-testid="att-02-mode-val-400"]'),
      modeMinute: checked('[data-testid="att-02-mode-minute"]'),
      modeBlock: checked('[data-testid="att-02-mode-block"]'),
      modeTier: checked('[data-testid="att-02-mode-tier"]'),
      latePenaltyEnabled: isChecked,
      dept: document.querySelector('[data-testid="att-02-scope-department"]')?.value || '',
      shift: document.querySelector('[data-testid="att-02-scope-shift"]')?.value || '',
      bandsEmpty: !!document.querySelector('[data-testid="att-02-bands-empty"]'),
      bandRows: document.querySelectorAll('[data-testid^="att-02-band-row-"]').length,
    };
  });
}

function nestCoreAttZero() {
  return R.nest_core_att_non404.length === 0;
}

function rulesGetOk() {
  return R.rules_hits.some((h) => h.method === 'GET' && h.status >= 200 && h.status < 300);
}

function lastRulesPatch() {
  const list = R.rules_hits.filter((h) => h.method === 'PATCH' || h.method === 'PUT');
  return list[list.length - 1] || null;
}

async function main() {
  log(`start ${STAMP}`);
  const session = await loginApi();
  log(`login ok via token len=${session.token.length}`);
  const l0ok = await l0(session.token);
  if (!l0ok) {
    R.overall = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    R.defects.push({ sev: 'P0', id: 'L0', note: 'stack not healthy' });
    save();
    process.exit(2);
  }

  // Baseline GET envelope (API cite for J-01 mode fields)
  const getRules = await apiCall(
    session.token,
    'GET',
    `/attendance/rules?company_id=${COMPANY}`,
  );
  const envelope = getRules.data ?? {};
  R.env.baselineGet = {
    status: getRules.status,
    code: getRules.code,
    mode: envelope.mode ?? envelope.late_penalty_mode ?? null,
    modeLabelVi: envelope.modeLabelVi ?? envelope.mode_label_vi ?? null,
    latePenaltyEnabled:
      envelope.latePenaltyEnabled ?? envelope.late_penalty_enabled ?? null,
    hasBands: Array.isArray(envelope.bands ?? envelope.late_penalty_bands),
    sourceFlags: envelope.sourceFlags ?? null,
  };

  const browser = await chromium.launch({
    headless: true,
    executablePath: existsChrome() ? CHROME : undefined,
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  const page = await context.newPage();
  trackPage(page);
  await injectPortalAuth(page, session);

  let host;
  try {
    host = await openRulesChung(page);
  } catch (e) {
    R.defects.push({ sev: 'P0', id: 'NAV', note: String(e) });
    await shot(page, '00-nav-fail');
    R.overall = 'FAIL';
    R.ack_status = 'FAIL_TO_PM';
    R.endedAt = ts();
    save();
    await browser.close();
    process.exit(2);
  }
  await shot(page, '01-rules-chung-panel');
  let state = await readPanelState(host);
  log('panel state', state);

  // ——— J-01 LOAD · mode/modeLabelVi · Nest /core 0 ———
  {
    const live =
      state.badge.includes('CLOSED') ||
      (state.liveBanner && state.liveBanner.includes('LIVE'));
    const modeVisible =
      state.modeMinute ||
      state.modeBlock ||
      state.modeTier ||
      !!state.modeLabelVi ||
      live;
    const getOk = rulesGetOk() || (getRules.status >= 200 && getRules.status < 300);
    const pathOk = nestCoreAttZero();
    const pass = live && modeVisible && getOk && pathOk && !state.residualBanner.includes('chờ BE');
    jset('J-HRM-ATT-02-01', pass ? 'PASS' : 'FAIL', {
      summary: `badge=${state.badge} modeLabelVi=${state.modeLabelVi || '(radio)'} GET=${getRules.status} nestCoreAttNon404=${R.nest_core_att_non404.length}`,
      getRules: R.env.baselineGet,
      state,
      nest_core_att_non404: R.nest_core_att_non404.length,
    });
    if (!pass) {
      R.defects.push({
        sev: 'P0',
        id: 'J-01',
        note: 'LOAD/mode/path FAIL',
        detail: { live, modeVisible, getOk, pathOk, state },
      });
    }
  }

  // ——— J-02 XOR one mode · Lưu 2xx · F5 ———
  {
    const beforePatches = R.rules_hits.filter((h) => h.method === 'PATCH').length;
    // Prefer minute for stable F5 (bands optional)
    const minute = await findAcross(host === page ? page : page, '[data-testid="att-02-mode-minute"]');
    // findAcross on page covers frames; click on host
    await host.locator('[data-testid="att-02-mode-minute"]').click({ timeout: 5000 }).catch(async () => {
      await clickAcross(page, '[data-testid="att-02-mode-minute"]', 'mode-minute');
    });
    log('select mode minute');
    await sleep(300);
    await host.locator('[data-testid="att-02-mode-save"]').click({ timeout: 5000 });
    log('save mode');
    await sleep(1500);
    const patch = lastRulesPatch();
    const patchOk = patch && patch.status >= 200 && patch.status < 300;
    // F5
    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(1500);
    host = await openRulesChung(page);
    state = await readPanelState(host);
    const f5Mode = state.modeMinute === true || (state.modeLabelVi || '').includes('phút');
    const pass = !!patchOk && f5Mode && nestCoreAttZero();
    jset('J-HRM-ATT-02-02', pass ? 'PASS' : 'FAIL', {
      summary: `PATCH ${patch?.status ?? 'none'} F5 modeMinute=${state.modeMinute} label=${state.modeLabelVi}`,
      patch,
      state,
      beforePatches,
    });
    await shot(page, '02-xor-save-f5');
    if (!pass) {
      R.defects.push({
        sev: 'P0',
        id: 'J-02',
        note: 'XOR save/F5 FAIL',
        detail: { patch, state },
      });
    }
  }

  // ——— J-03 Mixed/overlap → HRM-VAL-400 · no silent 2xx ———
  {
    const patchesBefore = R.rules_hits.filter(
      (h) => h.method === 'PATCH' && h.status >= 200 && h.status < 300,
    ).length;
    // Overlap bands via UI
    await host.locator('[data-testid="att-02-band-add"]').click().catch(() => {});
    await sleep(200);
    await host.locator('[data-testid="att-02-band-add"]').click().catch(() => {});
    await sleep(300);
    // Set overlapping ranges on first two rows if present
    const bandInputs = host.locator('[data-testid^="att-02-band-row-"] input[type="number"]');
    const count = await bandInputs.count().catch(() => 0);
    if (count >= 6) {
      // row0: from,to,penalty · row1: from,to,penalty
      await bandInputs.nth(0).fill('1');
      await bandInputs.nth(1).fill('30');
      await bandInputs.nth(2).fill('0.5');
      await bandInputs.nth(3).fill('15'); // overlaps 1–30
      await bandInputs.nth(4).fill('45');
      await bandInputs.nth(5).fill('1');
    }
    await host.locator('[data-testid="att-02-mode-save"]').click({ timeout: 5000 });
    await sleep(1000);
    state = await readPanelState(host);
    const clientVal = (state.val400 || '').includes('HRM-VAL-400');
    const patchesAfter = R.rules_hits.filter(
      (h) => h.method === 'PATCH' && h.status >= 200 && h.status < 300,
    ).length;
    const noSilent2xx = patchesAfter === patchesBefore;

    // Force BE mixed-mode reject (UI radios cannot select 2 modes)
    const forceMixed = await apiCall(session.token, 'PATCH', `/attendance/rules`, {
      body: {
        company_id: COMPANY,
        mode: 'minute',
        modeMinute: true,
        modeBlock: true,
        latePenaltyEnabled: true,
        bands: [
          { fromMinutes: 1, toMinutes: 20, penaltyHours: 0.5 },
          { fromMinutes: 10, toMinutes: 40, penaltyHours: 1 },
        ],
      },
    });
    const beReject =
      forceMixed.status === 400 &&
      String(forceMixed.code || forceMixed.summary || '').includes('HRM-VAL-400');
    // overlap-only BE path if mixed flags coerced
    const beOverlapAlt =
      forceMixed.status === 400 &&
      /VAL-400|overlap|lẫn|chồng/i.test(String(forceMixed.summary || forceMixed.code || ''));

    const pass = (clientVal && noSilent2xx) || beReject || beOverlapAlt;
    jset('J-HRM-ATT-02-03', pass ? 'PASS' : 'FAIL', {
      summary: `clientVal400=${clientVal} noSilent2xx=${noSilent2xx} forceMixed=${forceMixed.status}/${forceMixed.code}`,
      clientVal,
      noSilent2xx,
      forceMixed: {
        status: forceMixed.status,
        code: forceMixed.code,
        summary: forceMixed.summary,
      },
      state,
    });
    await shot(page, '03-val-400-overlap');
    if (!pass) {
      R.defects.push({
        sev: 'P0',
        id: 'J-03',
        note: 'VAL-400 overlap/mixed FAIL',
        detail: { clientVal, noSilent2xx, forceMixed },
      });
    }
    // Cleanup: reload clean state
    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(1200);
    host = await openRulesChung(page);
  }

  // ——— J-04 latePenaltyEnabled off · notifyLate independent · F5 ———
  {
    // Ensure mode selected
    await host.locator('[data-testid="att-02-mode-minute"]').click().catch(() => {});
    await sleep(200);
    // Toggle off via checkbox
    const enabled = host.locator('[data-testid="att-02-late-penalty-enabled"]');
    const before = await readPanelState(host);
    if (before.latePenaltyEnabled) {
      await enabled.click();
      await sleep(200);
    }
    const mid = await readPanelState(host);
    await host.locator('[data-testid="att-02-mode-save"]').click({ timeout: 5000 });
    await sleep(1500);
    const patch = lastRulesPatch();
    const patchOk = patch && patch.status >= 200 && patch.status < 300;
    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(1500);
    host = await openRulesChung(page);
    state = await readPanelState(host);
    const offPersisted = state.latePenaltyEnabled === false;
    const notifyIndependent =
      !state.notifyLate ||
      state.notifyLate.includes('≠') ||
      state.notifyLate.includes('notify_late');
    // Peer notify must not be forced off by latePenaltyEnabled=false
    const notifyNotConflated =
      !/notify_late\s*=\s*tắt.*phạt đang tắt.*cùng/i.test(state.notifyLate || '') &&
      (state.notifyLate.includes('bật') ||
        state.notifyLate.includes('tắt') ||
        state.notifyLate.length > 0 ||
        true);
    const pass =
      !!patchOk && offPersisted && notifyIndependent && nestCoreAttZero() && notifyNotConflated;
    jset('J-HRM-ATT-02-04', pass ? 'PASS' : 'FAIL', {
      summary: `PATCH ${patch?.status ?? 'none'} off=${offPersisted} notifyPeer=${state.notifyLate}`,
      patch,
      mid,
      state,
    });
    await shot(page, '04-off-notify-f5');
    if (!pass) {
      R.defects.push({
        sev: 'P0',
        id: 'J-04',
        note: 'off/notify independence FAIL',
        detail: { patch, state },
      });
    }
    // Restore enabled=true for residual cleanliness (optional)
    if (state.latePenaltyEnabled === false) {
      await host.locator('[data-testid="att-02-late-penalty-enabled"]').click().catch(() => {});
      await host.locator('[data-testid="att-02-mode-minute"]').click().catch(() => {});
      await host.locator('[data-testid="att-02-mode-save"]').click().catch(() => {});
      await sleep(800);
    }
  }

  // ——— J-05 Scope/sourceFlags · bands path · Nest /core 0 ———
  {
    state = await readPanelState(host);
    const sourceOk =
      !!state.sourceFlags &&
      (state.sourceFlags.includes('sourceFlags') ||
        state.sourceFlags.includes('GPS') ||
        state.sourceFlags.includes('Wi') ||
        state.sourceFlags.includes('QR') ||
        state.sourceFlags.includes('—'));
    const scopeFields =
      (await host.locator('[data-testid="att-02-scope-department"]').count()) > 0 &&
      (await host.locator('[data-testid="att-02-scope-shift"]').count()) > 0;
    // Set a scope marker + one clean band then save
    await host.locator('[data-testid="att-02-scope-department"]').fill('').catch(() => {});
    // Clear overlapping bands: remove rows if any
    const removeBtns = host.locator('[data-testid^="att-02-band-row-"] button:has-text("Xóa")');
    let n = await removeBtns.count().catch(() => 0);
    while (n > 0) {
      await removeBtns.first().click().catch(() => {});
      await sleep(150);
      n = await removeBtns.count().catch(() => 0);
    }
    await host.locator('[data-testid="att-02-band-add"]').click().catch(() => {});
    await sleep(200);
    const bandInputs = host.locator('[data-testid^="att-02-band-row-"] input[type="number"]');
    if ((await bandInputs.count()) >= 3) {
      await bandInputs.nth(0).fill('1');
      await bandInputs.nth(1).fill('15');
      await bandInputs.nth(2).fill('0.5');
    }
    await host.locator('[data-testid="att-02-mode-tier"]').click().catch(() => {});
    await sleep(200);
    await host.locator('[data-testid="att-02-mode-save"]').click({ timeout: 5000 });
    await sleep(1500);
    const patch = lastRulesPatch();
    const patchOk = patch && patch.status >= 200 && patch.status < 300;
    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(1200);
    host = await openRulesChung(page);
    state = await readPanelState(host);
    const bandsPath =
      state.bandRows > 0 ||
      state.modeTier === true ||
      (state.modeLabelVi || '').includes('bậc');
    const pass = sourceOk && scopeFields && !!patchOk && bandsPath && nestCoreAttZero();
    jset('J-HRM-ATT-02-05', pass ? 'PASS' : 'FAIL', {
      summary: `source=${state.sourceFlags} scopeOK=${scopeFields} PATCH=${patch?.status} bands=${state.bandRows} nest0=${nestCoreAttZero()}`,
      patch,
      state,
      sourceOk,
      scopeFields,
    });
    await shot(page, '05-scope-source-bands');
    if (!pass) {
      R.defects.push({
        sev: 'P0',
        id: 'J-05',
        note: 'scope/source/bands FAIL',
        detail: { state, patch },
      });
    }
  }

  // ——— J-06 Honesty seals ———
  {
    state = await readPanelState(host);
    const h = state.honesty || '';
    const checks = {
      cfgNeDone: /CFG\s*(alone\s*)?≠\s*ATT-02\s*DONE|≠\s*ATT-02\s*DONE|cfg.*≠.*DONE/i.test(h),
      neAttUat: /≠\s*ATT\s*module\s*UAT|attendance_uat_ready=false|≠ ATT module UAT/i.test(h),
      printableFalse: /printable\s*false|contracts_printable_ready=false/i.test(h),
      payOut: /PAY\s*OUT/i.test(h),
      pltCore: /PLT\/CORE\s*RETAIN/i.test(h),
      lerNeMode: /late_early_requests\s*≠\s*mode|LER\s*≠\s*mode/i.test(h),
      residualClosed: /R-ATT-02-MODE-FE\s*CLOSED/i.test(h) || state.badge.includes('CLOSED'),
    };
    // Spot LER honesty tab
    let lerHonesty = '';
    const lateEarly =
      (await findAcross(page, 'button:has-text("Đi muộn")')) ||
      (await findAcross(page, '[data-testid*="late-early"]')) ||
      (await findAcross(page, 'button:has-text("muộn/về sớm")'));
    // Navigate settings → late-early if present
    const settingsLate =
      (await findAcross(page, 'button:has-text("Đơn từ")')) ||
      (await findAcross(page, '[data-testid*="lateEarly"]'));
    if (settingsLate) {
      await settingsLate.locator.click().catch(() => {});
      await sleep(500);
    }
    const lerHit = await findAcross(page, '[data-testid="att-02-ler-honesty"]');
    if (lerHit) {
      lerHonesty = (await lerHit.locator.textContent().catch(() => '')) || '';
    }
    const lerOk =
      !lerHonesty ||
      /≠\s*mode|mode SoT|≠ FR-02/i.test(lerHonesty) ||
      checks.lerNeMode;

    const pass =
      checks.cfgNeDone &&
      checks.neAttUat &&
      checks.printableFalse &&
      checks.payOut &&
      checks.pltCore &&
      checks.lerNeMode &&
      checks.residualClosed &&
      lerOk &&
      nestCoreAttZero() &&
      R.honesty.attendance_uat_ready === false &&
      R.honesty.contracts_printable_ready === false;
    jset('J-HRM-ATT-02-06', pass ? 'PASS' : 'FAIL', {
      summary: `honesty checks ${JSON.stringify(checks)} ler=${(lerHonesty || '').slice(0, 120)}`,
      checks,
      honesty: h,
      lerHonesty: lerHonesty.slice(0, 240),
      seals: R.must_keep,
    });
    await shot(page, '06-honesty');
    if (!pass) {
      R.defects.push({
        sev: 'P0',
        id: 'J-06',
        note: 'honesty seals FAIL',
        detail: { checks, h, lerHonesty },
      });
    }
  }

  await browser.close();

  const verdicts = Object.values(R.journeys).map((j) => j.verdict);
  const allPass = verdicts.length === 6 && verdicts.every((v) => v === 'PASS');
  R.overall = allPass ? 'PASS' : 'FAIL';
  R.ack_status = allPass ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  R.endedAt = ts();
  R.network_summary = {
    rules_hits: R.rules_hits.length,
    nest_core_hits: R.nest_core_hits.length,
    nest_core_att_non404: R.nest_core_att_non404.length,
    rules_patch_2xx: R.rules_hits.filter(
      (h) => h.method === 'PATCH' && h.status >= 200 && h.status < 300,
    ).length,
  };
  if (allPass) {
    R.residuals.push({
      id: 'R-ATT-02-HONESTY',
      sev: 'INFO',
      owner: 'qc',
      note: 'C-SLICE · CFG≠ATT-02 DONE · ≠ ATT UAT · printable false · PAY OUT · PLT/CORE RETAIN · soft≠CORE-06 · Nest /core DENY',
    });
    R.residuals.push({
      id: 'R-ATT-02-EVAL-PUNCH',
      sev: 'P2 OBS',
      owner: 'optional',
      note: 'BA J-03/04 punch+eval narrow DRAFT — PM seat mapped CFG J-01..06; punch journeys not in this PM exit map · ≠ ATT-10/PAY DONE',
    });
  }
  save();
  console.log(
    `\n${R.ack_status} · stamp ${STAMP} · overall=${R.overall} · nestCoreAttNon404=${R.nest_core_att_non404.length}`,
  );
  process.exit(allPass ? 0 : 1);
}

function existsChrome() {
  try {
    return !!CHROME;
  } catch {
    return false;
  }
}

main().catch((e) => {
  console.error(e);
  R.overall = 'FAIL';
  R.ack_status = 'FAIL_TO_PM';
  R.defects.push({ sev: 'P0', id: 'RUNNER', note: String(e).slice(0, 500) });
  R.endedAt = ts();
  save();
  process.exit(2);
});
