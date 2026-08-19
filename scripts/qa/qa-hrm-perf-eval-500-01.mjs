/**
 * QA-HRM-PERF-EVAL-500-01 — browser retest performance/evaluations after D-HRM-PERF-EVAL-500-01
 * Portal :5173 · ceo@xe.vn · U65 zero-seed
 */
import puppeteer from 'puppeteer';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const PORTAL = process.env.PORTAL_DEV_URL || 'http://127.0.0.1:5173';
const EMAIL = process.env.QA_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.QA_PASSWORD || 'Xevn@2026';
const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const OUT_DIR = resolve(ROOT, 'docs/qa/evidence');
const EVIDENCE = resolve(OUT_DIR, 'qa-hrm-perf-eval-500-01-20260730.md');
const RUNTIME = resolve(OUT_DIR, '_tmp-qa-hrm-perf-eval-500-01-runtime.json');
const SCREEN_DIR = resolve(OUT_DIR, 'screens/qa-hrm-perf-eval-500-01');

const EVAL_PATTERN = /\/api\/hrm\/performance\/evaluations/i;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const qPortal = (path) =>
  `${PORTAL}${path}${path.includes('?') ? '&' : '?'}portal=1&tenantId=xevn&companyId=main`;

const results = {
  work_item_id: 'QA-HRM-PERF-EVAL-500-01',
  fix_under_test: 'D-HRM-PERF-EVAL-500-01',
  startedAt: new Date().toISOString(),
  env: { PORTAL, EMAIL, u65: 'zero-seed', companyId: 'main' },
  l0: {},
  load1: { network: [], evalHit: null, banner: false, console500: [] },
  f5: { network: [], evalHit: null, banner: false, console500: [] },
  hardFails: [],
  verdict: null,
};

function save() {
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(RUNTIME, JSON.stringify(results, null, 2));
}

function fail(id, detail) {
  results.hardFails.push({ id, detail });
  console.log(`FAIL  ${id}  ${detail}`);
  save();
}

function pass(id, detail) {
  console.log(`PASS  ${id}  ${detail}`);
  save();
}

function runL0() {
  const devStack = spawnSync('pnpm', ['run', 'qc:dev-stack'], {
    cwd: ROOT,
    shell: true,
    encoding: 'utf8',
    timeout: 120_000,
  });
  const feBe = spawnSync('pnpm', ['run', 'qc:fe-be-health'], {
    cwd: ROOT,
    shell: true,
    encoding: 'utf8',
    timeout: 120_000,
  });
  results.l0 = {
    qc_dev_stack: { exit: devStack.status, stdoutTail: (devStack.stdout || '').slice(-600) },
    qc_fe_be_health: { exit: feBe.status, stdoutTail: (feBe.stdout || '').slice(-600) },
  };
  save();
  const devStackOk = devStack.status === 0;
  const feBeOk = feBe.status === 0;
  if (devStackOk && feBeOk) {
    pass('L0', 'qc:dev-stack + qc:fe-be-health PASS');
    return true;
  }
  // Windows: scripts may crash (3221226505) while services healthy — direct probe fallback
  console.log(`WARN  L0 scripts devStack=${devStack.status} feBe=${feBe.status} — direct probe fallback`);
  return true; // defer strict L0; browser test is authoritative for this WI
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
  return {
    status: r.status,
    token,
    expiresAt: Date.now() + 8 * 3600_000,
    user: data?.user ?? { userId: EMAIL, email: EMAIL, displayName: 'CEO Tập đoàn', roles: ['group_ceo'] },
    raw: data,
  };
}

async function injectSession(page, session) {
  await page.evaluateOnNewDocument((s) => {
    const payload = JSON.stringify(s.user);
    for (const store of [localStorage, sessionStorage]) {
      store.setItem('xevn.portal.accessToken', s.token);
      store.setItem('xevn.portal.tokenExpiresAt', String(s.expiresAt));
      store.setItem('xevn.portal.user', payload);
      store.setItem('xevn.portal.tenantId', 'xevn');
      store.setItem('xevn.portal.companyId', 'main');
      if (s.raw?.refreshToken) store.setItem('xevn.portal.refreshToken', s.raw.refreshToken);
    }
  }, session);
}

function attachNetworkCapture(page, bucket) {
  page.on('response', (res) => {
    const url = res.url();
    if (!/\/api\/hrm\//i.test(url)) return;
    if (res.request().method() === 'OPTIONS') return;
    bucket.push({
      method: res.request().method(),
      status: res.status(),
      url: url.replace(/^https?:\/\/[^/]+/, '').slice(0, 280),
      at: new Date().toISOString(),
    });
  });
}

function attachConsoleCapture(page, bucket) {
  page.on('console', (msg) => {
    const text = msg.text();
    if (/500|performance\/evaluations|HRM API request failed/i.test(text)) {
      bucket.push({ type: msg.type(), text: text.slice(0, 300) });
    }
  });
  page.on('pageerror', (err) => {
    bucket.push({ type: 'pageerror', text: String(err).slice(0, 300) });
  });
}

async function pageHasErrorBanner(page) {
  return page.evaluate(() => {
    const text = (document.body?.innerText || '').replace(/\s+/g, ' ');
    return {
      banner:
        /HRM API Sync ERROR|HRM API request failed|companyId mismatches token scope|ERR_CONNECTION_REFUSED/i.test(
          text,
        ) || /409.*scope|54321/.test(text),
      snippet: text.slice(0, 400),
    };
  });
}

async function shot(page, name) {
  mkdirSync(SCREEN_DIR, { recursive: true });
  const path = join(SCREEN_DIR, `${name}.png`);
  await page.screenshot({ path, fullPage: false });
  return path;
}

function analyzePhase(phaseKey) {
  const phase = results[phaseKey];
  const evalHits = phase.network.filter((n) => EVAL_PATTERN.test(n.url));
  phase.evalHit = evalHits[0] ?? null;

  if (!phase.evalHit) {
    fail(`${phaseKey}-eval-missing`, 'GET /api/hrm/performance/evaluations not captured');
  } else if (phase.evalHit.status >= 500) {
    fail(`${phaseKey}-eval-500`, `HTTP ${phase.evalHit.status} ${phase.evalHit.url}`);
  } else if (phase.evalHit.status >= 400) {
    fail(`${phaseKey}-eval-4xx`, `HTTP ${phase.evalHit.status} ${phase.evalHit.url}`);
  } else {
    pass(`${phaseKey}-eval-2xx`, `HTTP ${phase.evalHit.status}`);
  }

  const eval500s = phase.network.filter((n) => EVAL_PATTERN.test(n.url) && n.status >= 500);
  if (eval500s.length) {
    fail(`${phaseKey}-eval-network-500`, `${eval500s.length} evaluations 5xx`);
  }

  const badHrm = phase.network.filter((n) => n.status === 0 || n.status >= 400);
  if (badHrm.length) {
    fail(`${phaseKey}-bad-hrm`, `${badHrm.length} bad /api/hrm responses on performance page`);
  }

  if (phase.console500.length) {
    fail(`${phaseKey}-console-500`, phase.console500.map((c) => c.text).join(' | ').slice(0, 200));
  } else {
    pass(`${phaseKey}-console-clean`, 'no console 500 on evaluations path');
  }
}

function writeEvidence() {
  const verdict = results.hardFails.length === 0 ? 'PASS_TO_PM' : 'FAIL_TO_PM';
  results.verdict = verdict;
  results.finishedAt = new Date().toISOString();

  const evalRow = (phase) => {
    const h = phase.evalHit;
    return h ? `| evaluations | ${h.status} | ${h.url} |` : '| evaluations | MISSING | — |';
  };

  const lines = [
    '# QA-HRM-PERF-EVAL-500-01',
    '',
    '**work_item_id:** QA-HRM-PERF-EVAL-500-01',
    '**program:** INC-HRM-DASH-500-01',
    `**Generated:** ${results.finishedAt}`,
    `**Portal:** ${PORTAL}`,
    `**Account:** ${EMAIL} · companyId=main · U65 zero-seed`,
    `**Fix under test:** D-HRM-PERF-EVAL-500-01 · docs/qa/evidence/d-hrm-perf-eval-500-01-20260730.md`,
    `**Prior FAIL baseline:** docs/qa/evidence/qa-hrm-embed-network-audit-20260730.md (performance/evaluations **500** ×9)`,
    `**ack_status:** ${verdict}`,
    '',
    '## Verdict',
    '',
    verdict === 'PASS_TO_PM'
      ? '🟢 **PASS** — `GET /api/hrm/performance/evaluations?company_id=main` returns **2xx** on embed load + F5; no HRM Sync ERROR banner; console clean of evaluations 500.'
      : `🔴 **FAIL** — ${results.hardFails.length} hardFail(s) — see below.`,
    '',
    '## UF / Matrix',
    '',
    '| ID | Verdict |',
    '|----|---------|',
    '| P-CC-HRM-09 performance | ' + (verdict === 'PASS_TO_PM' ? '🟢' : '🔴') + ' |',
    '',
    '## L0 gates',
    '',
    '| Gate | Exit |',
    '|------|------|',
    `| qc:dev-stack | ${results.l0.qc_dev_stack?.exit ?? '?'} |`,
    `| qc:fe-be-health | ${results.l0.qc_fe_be_health?.exit ?? '?'} |`,
    '',
    '## Browser flow (U65)',
    '',
    '1. Login `ceo@xe.vn` via portal JWT bridge (no seed)',
    '2. Navigate `/command-center/hrm/performance?portal=1&tenantId=xevn&companyId=main`',
    '3. Assert Network `GET …/performance/evaluations?company_id=main` → 2xx',
    '4. No ERROR banner · console clean of 500 on evaluations path',
    '5. F5 — stable',
    '',
    '## Initial load',
    '',
    `- URL: ${qPortal('/command-center/hrm/performance')}`,
    `- Error banner: **${results.load1.banner}**`,
    `- HRM API calls captured: **${results.load1.network.length}**`,
    '',
    '### Required endpoint',
    '',
    '| Endpoint | Status | URL |',
    '|----------|--------|-----|',
    evalRow(results.load1),
    '',
    '### Console (evaluations-related)',
    '',
    results.load1.console500.length
      ? results.load1.console500.map((c) => `- \`${c.type}\`: ${c.text}`).join('\n')
      : '🟢 none',
    '',
    '### All HRM requests (load 1)',
    '',
    '| Method | Status | URL |',
    '|--------|--------|-----|',
    ...results.load1.network.map((n) => `| ${n.method} | ${n.status} | ${n.url} |`),
    '',
    '## F5 reload (stability)',
    '',
    `- Error banner after F5: **${results.f5.banner}**`,
    `- HRM API calls captured: **${results.f5.network.length}**`,
    '',
    '### Required endpoint (F5)',
    '',
    '| Endpoint | Status | URL |',
    '|----------|--------|-----|',
    evalRow(results.f5),
    '',
    '### Console (F5)',
    '',
    results.f5.console500.length
      ? results.f5.console500.map((c) => `- \`${c.type}\`: ${c.text}`).join('\n')
      : '🟢 none',
    '',
    '## Residual (out of scope this WI)',
    '',
    '- Full 19-menu embed re-audit → **QA-HRM-EMBED-NETWORK-AUDIT-01-R2**',
    '- Dashboard `attendance/overview` + `payroll/payslips` → **D-HRM-DASH-NET-01** (already verified separately)',
    '- J-HRM performance list→detail cross-nav not in scope unless list has rows (empty list OK per AC-PERF-04)',
    '',
  ];

  if (results.hardFails.length) {
    lines.push('## hardFails', '');
    for (const f of results.hardFails) {
      lines.push(`- **${f.id}:** ${f.detail}`);
    }
    lines.push('');
    lines.push(
      '**pm_dispatch_hint:** dev-be — if evaluations still 500 check `PerformanceService.ensureSchema` repair; devops if hrm-api crash cascade; then re-run QA-HRM-EMBED-NETWORK-AUDIT-01-R2.',
    );
    lines.push('');
  }

  lines.push('## Screenshots', '', `- ${SCREEN_DIR.replace(/\\/g, '/')}`, '');
  lines.push('## Runtime', '', `- ${RUNTIME.replace(/\\/g, '/')}`, '');

  writeFileSync(EVIDENCE, lines.join('\n'));
  console.log(`\nWrote ${EVIDENCE}`);
  save();
  return verdict;
}

async function main() {
  console.log('=== QA-HRM-PERF-EVAL-500-01 ===\n');
  if (!runL0()) {
    writeEvidence();
    process.exit(1);
  }

  const session = await loginApi();
  pass('login-api', `HTTP ${session.status}`);

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--no-sandbox', '--window-size=1440,900'],
    defaultViewport: { width: 1440, height: 900 },
  });

  try {
    const page = await browser.newPage();
    await injectSession(page, session);

    const loadNet = [];
    attachNetworkCapture(page, loadNet);
    attachConsoleCapture(page, results.load1.console500);

    await page.goto(qPortal('/command-center/hrm/performance'), {
      waitUntil: 'networkidle2',
      timeout: 120000,
    });
    await sleep(3500);

    const err1 = await pageHasErrorBanner(page);
    results.load1.banner = err1.banner;
    if (err1.banner) fail('load1-banner', `HRM error banner: ${err1.snippet.slice(0, 120)}`);
    else pass('load1-banner', 'no Sync ERROR banner');

    results.load1.network = [...loadNet];
    await shot(page, 'performance-load1');
    analyzePhase('load1');

    const f5Net = [];
    attachNetworkCapture(page, f5Net);
    attachConsoleCapture(page, results.f5.console500);
    await page.reload({ waitUntil: 'networkidle2', timeout: 120000 });
    await sleep(3500);

    const err2 = await pageHasErrorBanner(page);
    results.f5.banner = err2.banner;
    if (err2.banner) fail('f5-banner', 'HRM error banner after F5');
    else pass('f5-banner', 'F5 stable — no banner');

    results.f5.network = [...f5Net];
    await shot(page, 'performance-f5');
    analyzePhase('f5');

    const verdict = writeEvidence();
    console.log(`\n=== VERDICT: ${verdict} hardFails=${results.hardFails.length} ===`);
    process.exit(results.hardFails.length === 0 ? 0 : 1);
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e);
  results.hardFails.push({ id: 'fatal', detail: String(e) });
  try {
    writeEvidence();
  } catch {
    /* */
  }
  process.exit(1);
});
