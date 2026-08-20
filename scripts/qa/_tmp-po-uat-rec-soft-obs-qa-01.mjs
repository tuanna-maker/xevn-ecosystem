#!/usr/bin/env node
/**
 * PO-UAT-REC-SOFT-OBS-QA-01 — Soft OBS retest (U65 zero-seed · browser-only)
 * Scope:
 *  P2 Compare YCTD — uvRows≥1 ⇒ compareNet non-empty + matrix FE (R-REC-CMP-NET-CAPTURE)
 *  P4 Interview one-active — POST 409 HRM-REC-IV-409-ACTIVE + toast; no console.error for that 409
 *  Process FAIL-immediate — dnd/mojibake/dup/Uncaught=0 on P2/P4 path
 * DENIED: seed · recruitment_uat_ready=true · jd_dynamic_done claim
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTAL_CANDIDATES = [
  process.env.PORTAL_DEV_URL,
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5175',
].filter(Boolean);
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
const OUT_JSON = resolve(ROOT, 'docs/qa/evidence/_tmp-po-uat-rec-soft-obs-qa-01.FINAL.json');
const SCREEN = resolve(ROOT, 'docs/qa/evidence/screens/po-uat-rec-soft-obs-qa-01');
mkdirSync(SCREEN, { recursive: true });

const STAMP = `SOFTOBS-${Date.now().toString(36).slice(-6).toUpperCase()}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ts = () => new Date().toISOString();

function hasMojibake(text) {
  if (!text) return false;
  return /Ã[¡¢£¤¥¦§¨©ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿À-ÿ]|Ä‘|Ä|á»[a-zA-Z0-9]|áº[a-zA-Z0-9]|â€[™œ]|ï¿½|Æ°á|NhÃ¢n|sá»±/.test(
    text,
  );
}

const results = {
  work_item_id: 'PO-UAT-REC-SOFT-OBS-QA-01',
  parent: 'PO-UAT-REC-SOFT-OBS-FE-01',
  module: 'Tuyển dụng soft OBS',
  startedAt: ts(),
  u65: 'zero-seed-browser-only',
  persona: { email: EMAIL, companyId: COMPANY },
  env: { PORTAL: null, HRM, XBOS, TENANT, STAMP },
  honesty: {
    recruitment_uat_ready: false,
    jd_dynamic_done: false,
  },
  denied: ['seed', 'recruitment_uat_ready=true', 'jd_dynamic_done=true'],
  soft_obs: {
    'R-REC-CMP-NET-CAPTURE': null,
    'R-REC-IV-409-CONSOLE': null,
  },
  l0: {},
  pack: {},
  process_gates: {
    dndStormHits: [],
    mojibakeHits: [],
    pageErrors: [],
    consoleErrors: [],
    consoleAll: [],
    uncaughtHits: [],
    duplicateShell: null,
  },
  network: [],
  screens: [],
  click_log: [],
  residuals: [],
  gaps: [],
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
function recordPack(id, verdict, detail = {}) {
  results.pack[id] = { ...detail, verdict, at: ts() };
  console.log(`${verdict} ${id} — ${(detail.summary || '').slice(0, 420)}`);
  save();
}

async function shot(page, name) {
  const path = join(SCREEN, `${name}.png`);
  await page.screenshot({ path, fullPage: false }).catch(() => {});
  results.screens.push(path.replace(/\\/g, '/'));
  return path;
}

async function pickPortal() {
  for (const base of PORTAL_CANDIDATES) {
    try {
      const r = await fetch(base, { signal: AbortSignal.timeout(5000) });
      if (r.status === 200 || r.status === 304) return base.replace(/\/$/, '');
    } catch {
      /* */
    }
  }
  return null;
}

function q(portal, path, extra = {}) {
  const u = new URL(path, portal);
  u.searchParams.set('portal', '1');
  u.searchParams.set('tenantId', extra.tenantId || TENANT);
  u.searchParams.set('companyId', extra.companyId || COMPANY);
  if (extra.tab) u.searchParams.set('tab', extra.tab);
  u.searchParams.set('_qa', String(Date.now()));
  return u.toString();
}

async function loginApi(portal) {
  const r = await fetch(`${portal}/api/xbos/auth/login`, {
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
    email: EMAIL,
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
  await page.addInitScript(
    (s) => {
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
    },
    session,
  );
}

function track(page) {
  page.on('console', (msg) => {
    const t = String(msg.text());
    const type = msg.type();
    results.process_gates.consoleAll.push({ type, text: t.slice(0, 320), at: ts() });
    if (type === 'error') results.process_gates.consoleErrors.push(t.slice(0, 280));
    if (/Unable to find (any )?drag handle|@hello-pangea\/dnd|Invariant failed.*[Dd]rag/i.test(t)) {
      results.process_gates.dndStormHits.push(t.slice(0, 200));
    }
    if (/Uncaught/i.test(t)) results.process_gates.uncaughtHits.push(t.slice(0, 200));
  });
  page.on('pageerror', (err) => {
    const t = String(err?.message || err);
    results.process_gates.pageErrors.push(t.slice(0, 280));
    if (/ReferenceError|TypeError|Uncaught/i.test(t)) {
      results.process_gates.uncaughtHits.push(t.slice(0, 200));
    }
  });
  page.on('response', async (res) => {
    try {
      const u = res.url();
      if (!/\/api\/hrm\//.test(u)) return;
      const method = res.request().method();
      if (method === 'OPTIONS') return;
      const entry = {
        method,
        status: res.status(),
        url: u.replace(/^https?:\/\/[^/]+/, '').slice(0, 420),
        at: ts(),
      };
      const interesting =
        /requisitions|candidates|compare|interviews|applications|evaluations/i.test(u) ||
        (method === 'POST' && /recruitment/.test(u));
      if (!interesting) return;

      if (method === 'POST' && /\/interviews(\?|$)/.test(u)) {
        try {
          const j = await res.json().catch(() => ({}));
          entry.code = j?.code || j?.error?.code || null;
          entry.message = String(j?.message || j?.error?.message || '').slice(0, 200);
          results.lastInterviewPost = entry;
        } catch {
          /* */
        }
      }
      if (method === 'GET' && /\/compare/.test(u)) {
        entry.compare = true;
        results.lastCompare = entry;
      }
      results.network.push(entry);
    } catch {
      /* */
    }
  });
}

async function findInFrames(page, locatorFn) {
  for (const h of [page, ...page.frames()]) {
    try {
      const loc = locatorFn(h);
      if (await loc.first().isVisible({ timeout: 800 }).catch(() => false)) return h;
    } catch {
      /* */
    }
  }
  return page;
}

async function checkShell(page) {
  const shell = await page.evaluate(() => {
    const brandMarks = document.querySelectorAll('[data-testid="portal-brand-mark"]');
    const duplicateStrips = [];
    const walker = document.body?.innerText || '';
    const titleHits = [...document.querySelectorAll('h1, [class*="brand"], header')].filter((el) => {
      const t = (el.textContent || '').trim();
      return /XeVN OS|Command Center/i.test(t) && !el.closest('[data-testid="portal-brand-mark"]');
    });
    for (const el of titleHits.slice(0, 5)) {
      duplicateStrips.push({ text: (el.textContent || '').trim().slice(0, 80) });
    }
    return {
      brandMarkCount: brandMarks.length,
      duplicateStrips,
      bodyHasMojibake: /Ã[¡-ÿ]|Ä‘|Ä|á»[a-zA-Z]|áº[a-zA-Z]|â€[™œ]|ï¿½|NhÃ¢n|sá»±/.test(walker),
    };
  });
  results.process_gates.duplicateShell = shell;
  if (shell.bodyHasMojibake) results.process_gates.mojibakeHits.push('shell_body');
  return shell;
}

async function openSelectOptions(host, testId) {
  const trigger = host.getByTestId(testId).first();
  if (!(await trigger.isVisible({ timeout: 3000 }).catch(() => false))) return null;
  await trigger.click({ force: true });
  await sleep(500);
  return host.locator('[role="option"]');
}

async function selectFirstOption(host, testId) {
  const opts = await openSelectOptions(host, testId);
  if (!opts) return null;
  const n = await opts.count();
  for (let i = 0; i < n; i++) {
    const opt = opts.nth(i);
    const t = (await opt.innerText().catch(() => '')).trim();
    const val = (await opt.getAttribute('data-value').catch(() => '')) || '';
    if (!t || /Chọn|__none__/i.test(t) || val === '__none__') continue;
    await opt.click({ force: true });
    await sleep(600);
    return { text: t, value: val, count: n };
  }
  return { text: null, value: null, count: n };
}

/** Try YCTD options until UV rows appear (U65 — first option may be empty). */
async function selectYctdWithUvRows(page, dlgHost, maxTries = 12) {
  const tried = [];
  for (let attempt = 0; attempt < maxTries; attempt++) {
    const opts = await openSelectOptions(dlgHost, 'hdsd-rec-compare-yctd-picker');
    if (!opts) return { text: null, value: null, tried, uvRows: 0 };
    const n = await opts.count();
    let picked = null;
    for (let i = 0; i < n; i++) {
      const opt = opts.nth(i);
      const t = (await opt.innerText().catch(() => '')).trim();
      const val = (await opt.getAttribute('data-value').catch(() => '')) || '';
      if (!t || /Chọn|__none__/i.test(t) || val === '__none__') continue;
      const already =
        tried.some((x) => x.text === t) ||
        (Boolean(val) && tried.some((x) => x.value === val));
      if (already) continue;
      await opt.click({ force: true });
      await sleep(3500);
      picked = { text: t, value: val, index: i, count: n };
      break;
    }
    if (!picked) {
      await page.keyboard.press('Escape').catch(() => {});
      return { text: null, value: null, tried, uvRows: 0 };
    }
    tried.push(picked);
    const uvRows = await dlgHost.getByTestId('hdsd-rec-compare-uv-row').count().catch(() => 0);
    if (uvRows >= 1) return { ...picked, uvRows, tried };
  }
  const lastUv = await dlgHost.getByTestId('hdsd-rec-compare-uv-row').count().catch(() => 0);
  return { ...(tried[tried.length - 1] || {}), uvRows: lastUv, tried };
}

async function pack2_compare(page, portal) {
  log('PACK2_COMPARE_start');
  const netBefore = results.network.length;
  const url = q(portal, '/hr/recruitment', { tab: 'evaluations' });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(4000);
  await shot(page, '02-evaluations');
  await checkShell(page);
  const body = await page.locator('body').innerText().catch(() => '');
  if (hasMojibake(body)) results.process_gates.mojibakeHits.push('evaluations');

  let host = await findInFrames(page, (h) => h.getByTestId('hdsd-rec-compare-open-btn'));
  let openBtn = host.getByTestId('hdsd-rec-compare-open-btn').first();
  let reachable = await openBtn.isVisible({ timeout: 4000 }).catch(() => false);
  if (!reachable) {
    host = await findInFrames(page, (h) => h.getByRole('button', { name: /So sánh/i }));
    openBtn = host.getByRole('button', { name: /So sánh/i }).first();
    reachable = await openBtn.isVisible({ timeout: 3000 }).catch(() => false);
  }
  if (!reachable) {
    recordPack('P2_COMPARE_YCTD', 'FAIL', {
      summary: 'So sánh button not reachable',
      journey: 'J-HRM-REC-CMP-01',
    });
    results.gaps.push('P2 compare UI not reachable');
    results.soft_obs['R-REC-CMP-NET-CAPTURE'] = 'FAIL_UNREACHABLE';
    return;
  }
  await openBtn.click({ force: true });
  await sleep(2000);
  const dlgHost = await findInFrames(page, (h) => h.getByTestId('hdsd-rec-compare-dialog'));
  const dlgVis = await dlgHost.getByTestId('hdsd-rec-compare-dialog').isVisible().catch(() => false);
  await shot(page, '02b-compare-dialog');
  const dlgText = await dlgHost
    .getByTestId('hdsd-rec-compare-dialog')
    .innerText()
    .catch(() => '');
  if (hasMojibake(dlgText)) results.process_gates.mojibakeHits.push('compare_dialog');

  const picker = await selectYctdWithUvRows(page, dlgHost);
  // Extra wait for auto-select → GET /compare after UV rows land
  await sleep(2500);
  await shot(page, '02c-compare-yctd');

  const uvRows =
    typeof picker?.uvRows === 'number'
      ? picker.uvRows
      : await dlgHost.getByTestId('hdsd-rec-compare-uv-row').count().catch(() => 0);
  const matrix = await dlgHost
    .getByTestId('hdsd-rec-compare-matrix')
    .isVisible()
    .catch(() => false);
  const compareNet = results.network
    .slice(netBefore)
    .filter((n) => n.method === 'GET' && /\/compare/.test(n.url));
  const compareOk = compareNet.some((n) => n.status >= 200 && n.status < 300);
  const jobPostingsSot = results.network
    .slice(netBefore)
    .some((n) => /job.postings|job_postings|job-postings/i.test(n.url));

  // Soft OBS close criteria: uvRows≥1 ⇒ compareNet non-empty + matrix
  let pass = false;
  let softClosed = false;
  if (!dlgVis) {
    results.gaps.push('P2 dialog not visible');
  } else if (uvRows < 1) {
    // U65: no UV under any tried YCTD — cannot prove soft OBS; mark BLOCKED not invent pass
    recordPack('P2_COMPARE_YCTD', 'BLOCKED', {
      summary: `dialog=${dlgVis} tried=${picker?.tried?.length || 0} uvRows=0 — cannot prove R-REC-CMP-NET-CAPTURE under U65`,
      journey: 'J-HRM-REC-CMP-01',
      compareNet,
      matrix,
      tried: picker?.tried || [],
    });
    results.gaps.push('P2 uvRows=0 BLOCKED soft OBS prove');
    results.soft_obs['R-REC-CMP-NET-CAPTURE'] = 'BLOCKED_NO_UV';
    return;
  } else {
    softClosed = compareNet.length > 0 && matrix;
    pass = softClosed && Boolean(picker?.text) && !jobPostingsSot;
    results.soft_obs['R-REC-CMP-NET-CAPTURE'] = softClosed ? 'CLOSED' : 'OPEN';
  }

  recordPack('P2_COMPARE_YCTD', pass ? 'PASS' : 'FAIL', {
    summary: `dialog=${dlgVis} picker=${picker?.text || 'empty'} uvRows=${uvRows} matrix=${matrix} compareNetLen=${compareNet.length} compareOk=${compareOk} softClosed=${softClosed} jobPostingsSot=${jobPostingsSot} tried=${picker?.tried?.length || 0}`,
    journey: 'J-HRM-REC-CMP-01',
    compareNet,
    soft_obs: results.soft_obs['R-REC-CMP-NET-CAPTURE'],
  });
  if (!pass) results.gaps.push('P2 compare soft OBS FAIL — compareNet empty or matrix missing');
}

async function pack4_interview(page, portal) {
  log('PACK4_INTERVIEW_start');
  const consoleBefore = results.process_gates.consoleAll.length;
  const errBefore = results.process_gates.consoleErrors.length;
  const url = q(portal, '/hr/recruitment', { tab: 'candidates' });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(4000);
  await shot(page, '04-candidates');
  await checkShell(page);

  const host = await findInFrames(page, (h) => h.locator('table tbody tr').first());
  let row = host.locator('table tbody tr').filter({ hasText: /Tuấn/i }).first();
  let rowVis = await row.isVisible({ timeout: 2000 }).catch(() => false);
  let target = 'Tuấn';
  if (!rowVis) {
    // Prefer row with active interview badge
    const badgeHost = await findInFrames(page, (h) =>
      h.locator('[data-testid="candidate-active-interview-badge"]'),
    );
    const badgeRow = badgeHost
      .locator('table tbody tr')
      .filter({ has: badgeHost.locator('[data-testid="candidate-active-interview-badge"]') })
      .first();
    if (await badgeRow.isVisible({ timeout: 1500 }).catch(() => false)) {
      row = badgeRow;
      rowVis = true;
      target = 'badge-row';
    }
  }
  if (!rowVis) {
    row = host.locator('table tbody tr').first();
    rowVis = await row.isVisible({ timeout: 1500 }).catch(() => false);
    target = 'first-row';
  }
  if (!rowVis) {
    recordPack('P4_INTERVIEW_SCHEDULE', 'FAIL', {
      summary: 'no candidate row reachable under U65',
    });
    results.gaps.push('P4 no candidate row');
    results.soft_obs['R-REC-IV-409-CONSOLE'] = 'FAIL_UNREACHABLE';
    return;
  }

  const cal = row.locator('button').filter({ has: host.locator('.lucide-calendar-clock') }).first();
  let opened = false;
  if (await cal.isVisible({ timeout: 1500 }).catch(() => false)) {
    await cal.click({ force: true });
    opened = true;
  } else {
    const btns = row.locator('button');
    const n = await btns.count();
    for (let i = 0; i < Math.min(n, 6); i++) {
      await btns.nth(i).click({ force: true });
      await sleep(700);
      const dlg = await findInFrames(page, (h) =>
        h.locator('[data-testid="schedule-interview-dialog"]'),
      );
      if (
        await dlg
          .locator('[data-testid="schedule-interview-dialog"]')
          .isVisible()
          .catch(() => false)
      ) {
        opened = true;
        break;
      }
    }
  }
  await sleep(1200);
  const dlgHost = await findInFrames(page, (h) =>
    h.locator('[data-testid="schedule-interview-dialog"]'),
  );
  const dlgVis = await dlgHost
    .locator('[data-testid="schedule-interview-dialog"]')
    .isVisible()
    .catch(() => false);
  await shot(page, '04b-interview-dialog');
  if (!dlgVis) {
    recordPack('P4_INTERVIEW_SCHEDULE', opened ? 'FAIL' : 'SKIP', {
      summary: `schedule dialog not visible · target=${target}`,
    });
    results.gaps.push('P4 interview dialog not visible');
    results.soft_obs['R-REC-IV-409-CONSOLE'] = 'FAIL_NO_DIALOG';
    return;
  }
  const dlgText = await dlgHost
    .locator('[data-testid="schedule-interview-dialog"]')
    .innerText()
    .catch(() => '');
  if (hasMojibake(dlgText)) results.process_gates.mojibakeHits.push('interview_dialog');
  const utfOk =
    /Lên lịch phỏng vấn|Ngày|Giờ|Thời lượng|Hình thức|Địa điểm/i.test(dlgText) &&
    !hasMojibake(dlgText);

  const postsBefore = results.network.filter((n) => n.method === 'POST' && /\/interviews/.test(n.url))
    .length;
  await dlgHost
    .locator('[data-testid="schedule-interview-submit"]')
    .click({ force: true })
    .catch(() => {});
  await sleep(3500);
  await shot(page, '04c-after-schedule');

  const posts = results.network
    .filter((n) => n.method === 'POST' && /\/interviews/.test(n.url))
    .slice(postsBefore);
  const conflict409 = posts.find(
    (p) => p.status === 409 && /HRM-REC-IV-409-ACTIVE/i.test(String(p.code || '')),
  );
  const any409 = posts.find((p) => p.status === 409);

  // Toast: sonner / schedule-interview-error-toast
  const toastHost = await findInFrames(page, (h) =>
    h.locator('[data-testid="schedule-interview-error-toast"], [data-sonner-toast]'),
  );
  const toastVis =
    (await toastHost
      .locator('[data-testid="schedule-interview-error-toast"]')
      .first()
      .isVisible()
      .catch(() => false)) ||
    (await toastHost
      .locator('[data-sonner-toast]')
      .filter({ hasText: /phỏng vấn|lịch|active|đã có/i })
      .first()
      .isVisible()
      .catch(() => false));

  const badgeHost = await findInFrames(page, (h) =>
    h.locator('[data-testid="candidate-active-interview-badge"]'),
  );
  const badgeVis = await badgeHost
    .locator('[data-testid="candidate-active-interview-badge"]')
    .first()
    .isVisible()
    .catch(() => false);

  const consoleSlice = results.process_gates.consoleAll.slice(consoleBefore);
  const scheduleConsoleError = consoleSlice.filter(
    (c) =>
      c.type === 'error' &&
      /Error scheduling interview/i.test(c.text),
  );
  const softConsoleClosed = scheduleConsoleError.length === 0;

  // Prefer proving 409 ACTIVE path (Tuấn / badge row). If 201 on first-row without active — not soft OBS close.
  let pass = false;
  if (conflict409) {
    results.soft_obs['R-REC-IV-409-CONSOLE'] = softConsoleClosed ? 'CLOSED' : 'OPEN';
    pass = utfOk && softConsoleClosed && (toastVis || badgeVis);
  } else if (any409) {
    results.soft_obs['R-REC-IV-409-CONSOLE'] = softConsoleClosed ? 'CLOSED_PARTIAL' : 'OPEN';
    pass = utfOk && softConsoleClosed;
    results.gaps.push(`P4 409 without HRM-REC-IV-409-ACTIVE code=${any409.code}`);
  } else {
    results.soft_obs['R-REC-IV-409-CONSOLE'] = 'BLOCKED_NO_409';
    results.gaps.push('P4 no 409 ACTIVE — cannot prove console soft OBS (U65 no cancel seed)');
    pass = false;
  }

  recordPack('P4_INTERVIEW_SCHEDULE', pass ? 'PASS' : 'FAIL', {
    summary: `target=${target} utfOk=${utfOk} posts=${JSON.stringify(posts.map((p) => ({ s: p.status, c: p.code })))} toast=${toastVis} badge=${badgeVis} scheduleConsoleError=${scheduleConsoleError.length} soft=${results.soft_obs['R-REC-IV-409-CONSOLE']}`,
    journey: 'REC-IV one-active',
    scheduleConsoleError,
    soft_obs: results.soft_obs['R-REC-IV-409-CONSOLE'],
    consoleErrorsDelta: results.process_gates.consoleErrors.length - errBefore,
  });
  if (!pass) results.gaps.push('P4 interview soft OBS FAIL');
}

function evaluateProcessGates() {
  const dnd = results.process_gates.dndStormHits.length;
  const moji = results.process_gates.mojibakeHits.length;
  const unc = results.process_gates.uncaughtHits.length;
  const pe = results.process_gates.pageErrors.filter((e) =>
    /ReferenceError|TypeError|Uncaught/i.test(e),
  ).length;
  const shell = results.process_gates.duplicateShell;
  const dupShell = shell && shell.brandMarkCount > 1;
  const dndStorm = dnd >= 10;
  const fail = dndStorm || moji > 0 || unc > 0 || pe > 0 || dupShell === true;
  results.process_gates.verdict = fail ? 'FAIL' : 'PASS';
  results.process_gates.summary = {
    dndHits: dnd,
    dndStorm,
    mojibakeHits: moji,
    uncaughtHits: unc,
    pageErrorsRefType: pe,
    dupShell: Boolean(dupShell),
    brandMarkCount: shell?.brandMarkCount ?? null,
  };
  if (dndStorm) results.gaps.push(`PROCESS: DnD storm hits=${dnd}`);
  if (moji > 0) results.gaps.push(`PROCESS: mojibake ${results.process_gates.mojibakeHits.join(',')}`);
  if (unc > 0) results.gaps.push(`PROCESS: Uncaught=${unc}`);
  if (pe > 0) results.gaps.push(`PROCESS: pageErrors Ref/Type=${pe}`);
  if (dupShell) results.gaps.push('PROCESS: duplicate shell');
  return !fail;
}

function finalize() {
  const p2 = results.pack.P2_COMPARE_YCTD?.verdict;
  const p4 = results.pack.P4_INTERVIEW_SCHEDULE?.verdict;
  const processOk = evaluateProcessGates();
  const cmpClosed = results.soft_obs['R-REC-CMP-NET-CAPTURE'] === 'CLOSED';
  const ivClosed = results.soft_obs['R-REC-IV-409-CONSOLE'] === 'CLOSED';

  let overall;
  if (!processOk || p2 === 'FAIL' || p4 === 'FAIL') {
    overall = 'FAIL_TO_PM';
  } else if (p2 === 'PASS' && p4 === 'PASS' && cmpClosed && ivClosed && processOk) {
    overall = 'PASS_TO_PM';
  } else if (p2 === 'BLOCKED' || p4 === 'SKIP' || results.soft_obs['R-REC-IV-409-CONSOLE'] === 'BLOCKED_NO_409') {
    overall = 'FAIL_TO_PM'; // soft OBS not proved under U65 → not invent PASS
  } else {
    overall = 'FAIL_TO_PM';
  }

  results.overall = overall;
  results.ack_status = overall;
  results.honesty.recruitment_uat_ready = false;
  results.honesty.jd_dynamic_done = false;
  results.endedAt = ts();
  save();
  console.log('\n=== PO-UAT-REC-SOFT-OBS-QA-01 FINAL ===');
  console.log(
    JSON.stringify(
      {
        overall,
        soft_obs: results.soft_obs,
        pack: results.pack,
        process: results.process_gates.summary,
        gaps: results.gaps,
        honesty: results.honesty,
      },
      null,
      2,
    ),
  );
}

async function main() {
  const portal = await pickPortal();
  results.env.PORTAL = portal;
  async function probe(url) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
      return r.status;
    } catch (e) {
      return String(e).slice(0, 80);
    }
  }
  results.l0 = {
    portal: portal ? await probe(portal) : 'missing',
    hrm: await probe(`${HRM}/api/hrm`),
    xbos: await probe(`${XBOS}/api/xbos`),
  };
  save();
  if (results.l0.portal !== 200 || results.l0.hrm !== 200) {
    results.overall = 'FAIL_TO_PM';
    results.ack_status = 'FAIL_TO_PM';
    results.gaps.push('L0 FAIL');
    results.endedAt = ts();
    save();
    console.error('L0 FAIL', results.l0);
    process.exit(2);
  }

  const session = await loginApi(portal);
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--disable-dev-shm-usage'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  track(page);
  await injectPortalAuth(page, session);

  try {
    await pack2_compare(page, portal);
    await pack4_interview(page, portal);
  } catch (e) {
    results.residuals.push({ fatal: String(e).slice(0, 400) });
    results.gaps.push(`harness exception: ${String(e).slice(0, 200)}`);
    console.error(e);
  } finally {
    finalize();
    await browser.close().catch(() => {});
  }

  process.exit(results.overall === 'FAIL_TO_PM' ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  results.overall = 'FAIL_TO_PM';
  results.ack_status = 'FAIL_TO_PM';
  results.gaps.push(String(e).slice(0, 300));
  results.endedAt = ts();
  save();
  process.exit(2);
});
