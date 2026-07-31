#!/usr/bin/env node
/**
 * P1-HRM-SCALE-W3-T-CONC — staged read-only concurrency probe for HRM hot paths.
 *
 * Safety: GET-only (employees paged list + summary + health). No seed, no writes.
 * Does NOT claim UF/browser acceptance (U65).
 *
 * Usage:
 *   node scripts/load/hrm-t-conc-load.mjs
 *   PORTAL_DEV_URL=http://14.225.217.232:8088 node scripts/load/hrm-t-conc-load.mjs --stages 1,10,50,100
 *   HRM_API_BASE=http://14.225.217.232:3001/api/hrm ... (direct API, bypass portal proxy)
 *
 * Abort when rolling error rate > abortErrorRate or health fails between stages.
 */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const clientTimeoutMs = Number(process.env.T_CONC_CLIENT_TIMEOUT_MS || 30_000);

const PORTAL = (process.env.PORTAL_DEV_URL || 'http://14.225.217.232:8088').replace(/\/+$/, '');
const HRM_BASE = (process.env.HRM_API_BASE || `${PORTAL}/api/hrm`).replace(/\/+$/, '');
const EMAIL = process.env.XEVN_PROBE_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.XEVN_PROBE_PASSWORD || 'Xevn@2026';
const COMPANY = process.env.XEVN_PROBE_COMPANY || 'main';
const TENANT = process.env.XEVN_PROBE_TENANT || 'xevn';

const STAGE_HOLD_MS = Number(process.env.T_CONC_STAGE_HOLD_MS || 60_000);
const THINK_MS = Number(process.env.T_CONC_THINK_MS || 1000);
const ABORT_ERROR_RATE = Number(process.env.T_CONC_ABORT_ERROR_RATE || 0.05);
const TARGET_P95_MS = Number(process.env.T_CONC_TARGET_P95_MS || 2000);
const TARGET_ERROR_RATE = Number(process.env.T_CONC_TARGET_ERROR_RATE || 0.01);

function parseStages() {
  const i = process.argv.indexOf('--stages');
  const raw = i >= 0 ? process.argv[i + 1] : process.env.T_CONC_STAGES || '1,10,25,50,100,200,400';
  return raw
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n) && n > 0);
}

function percentile(sorted, p) {
  if (sorted.length === 0) return null;
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return sorted[idx];
}

function summarize(latenciesMs, statusCounts, startedAt, endedAt) {
  const sorted = [...latenciesMs].sort((a, b) => a - b);
  const total = latenciesMs.length;
  const ok = (statusCounts[200] || 0) + (statusCounts[201] || 0);
  const err429 = statusCounts[429] || 0;
  const err5xx = Object.entries(statusCounts)
    .filter(([c]) => Number(c) >= 500)
    .reduce((s, [, n]) => s + n, 0);
  const errOther = total - ok - err429;
  const failed = total - ok;
  const durationSec = Math.max(0.001, (endedAt - startedAt) / 1000);
  return {
    total,
    ok,
    failed,
    errorRate: total ? failed / total : 0,
    rate429: total ? err429 / total : 0,
    rate5xx: total ? err5xx / total : 0,
    statusCounts: { ...statusCounts },
    p50_ms: percentile(sorted, 50),
    p95_ms: percentile(sorted, 95),
    p99_ms: percentile(sorted, 99),
    max_ms: sorted.length ? sorted[sorted.length - 1] : null,
    min_ms: sorted.length ? sorted[0] : null,
    throughput_rps: total / durationSec,
    duration_sec: Number(durationSec.toFixed(2)),
  };
}

async function login() {
  const r = await fetch(`${PORTAL}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-request-id': `t-conc-login-${Date.now()}` },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`login HTTP ${r.status}: ${text.slice(0, 200)}`);
  const j = JSON.parse(text);
  const token = j?.data?.accessToken ?? j?.accessToken;
  if (!token) throw new Error('login: no accessToken');
  return token;
}

async function healthCheck(token) {
  const headers = {
    Authorization: `Bearer ${token}`,
    'x-tenant-id': TENANT,
    'x-company-id': COMPANY,
    'x-request-id': `t-conc-health-${Date.now()}`,
  };
  const healthUrl = HRM_BASE.endsWith('/') ? HRM_BASE : `${HRM_BASE}/`;
  const listUrl = `${HRM_BASE}/employees?page=1&page_size=5&company_id=${COMPANY}`;
  const checks = [];
  for (const url of [healthUrl, listUrl]) {
    try {
      const t0 = Date.now();
      const r = await fetch(url, { headers, signal: AbortSignal.timeout(15_000) });
      checks.push({ url, status: r.status, ms: Date.now() - t0, ok: r.ok || r.status === 200 });
    } catch (e) {
      checks.push({ url, status: 0, ms: null, ok: false, error: e instanceof Error ? e.message : String(e) });
    }
  }
  return checks;
}

async function oneRead(token, vu, iter) {
  const headers = {
    Authorization: `Bearer ${token}`,
    'x-tenant-id': TENANT,
    'x-company-id': COMPANY,
    'x-request-id': `t-conc-vu${vu}-i${iter}-${Date.now()}`,
  };
  // Alternate list / summary like Employees mount (bounded page_size=50)
  const path =
    iter % 3 === 0
      ? `/employees/summary?company_id=${COMPANY}`
      : `/employees?page=1&page_size=50&company_id=${COMPANY}`;
  const url = `${HRM_BASE}${path}`;
  const t0 = Date.now();
  try {
    // Client timeout aligns with undici Agent bodyTimeout / nginx proxy_read_timeout.
    const r = await fetch(url, { headers, signal: AbortSignal.timeout(clientTimeoutMs) });
    return { status: r.status, ms: Date.now() - t0, path };
  } catch (e) {
    return {
      status: 0,
      ms: Date.now() - t0,
      path,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

async function runStage(token, vus, holdMs) {
  const latencies = [];
  const statusCounts = {};
  const pathStats = { list: [], summary: [] };
  let stop = false;
  const startedAt = Date.now();
  const endAt = startedAt + holdMs;

  const workers = Array.from({ length: vus }, (_, vu) =>
    (async () => {
      let iter = 0;
      while (Date.now() < endAt && !stop) {
        const res = await oneRead(token, vu + 1, iter);
        latencies.push(res.ms);
        statusCounts[res.status] = (statusCounts[res.status] || 0) + 1;
        if (res.path.includes('/summary')) pathStats.summary.push(res.ms);
        else pathStats.list.push(res.ms);
        iter += 1;
        if (THINK_MS > 0) await new Promise((r) => setTimeout(r, THINK_MS));
      }
    })(),
  );

  // Mid-stage abort watcher (every 5s)
  const watcher = (async () => {
    while (Date.now() < endAt && !stop) {
      await new Promise((r) => setTimeout(r, 5000));
      const total = latencies.length;
      if (total < 20) continue;
      const failed = total - ((statusCounts[200] || 0) + (statusCounts[201] || 0));
      if (failed / total > ABORT_ERROR_RATE) {
        stop = true;
      }
    }
  })();

  await Promise.all([...workers, watcher]);
  const endedAt = Date.now();
  const overall = summarize(latencies, statusCounts, startedAt, endedAt);
  const listSorted = [...pathStats.list].sort((a, b) => a - b);
  const sumSorted = [...pathStats.summary].sort((a, b) => a - b);
  return {
    vus,
    hold_ms: holdMs,
    aborted: stop,
    overall,
    list: {
      n: listSorted.length,
      p50_ms: percentile(listSorted, 50),
      p95_ms: percentile(listSorted, 95),
      p99_ms: percentile(listSorted, 99),
    },
    summary: {
      n: sumSorted.length,
      p50_ms: percentile(sumSorted, 50),
      p95_ms: percentile(sumSorted, 95),
      p99_ms: percentile(sumSorted, 99),
    },
  };
}

function gateStage(stage) {
  const er = stage.overall.errorRate;
  const p95 = stage.list.p95_ms ?? stage.overall.p95_ms;
  return {
    error_budget_ok: er < TARGET_ERROR_RATE,
    p95_list_ok: p95 != null && p95 < TARGET_P95_MS,
    abort_triggered: stage.aborted,
  };
}

async function main() {
  const stages = parseStages();
  console.log(
    JSON.stringify(
      {
        work_item_id: 'P1-HRM-SCALE-W3-T-CONC',
        portal: PORTAL,
        hrm_base: HRM_BASE,
        stages,
        stage_hold_ms: STAGE_HOLD_MS,
        think_ms: THINK_MS,
        targets: { error_rate: TARGET_ERROR_RATE, p95_list_ms: TARGET_P95_MS },
        abort_error_rate: ABORT_ERROR_RATE,
      },
      null,
      2,
    ),
  );

  const token = await login();
  console.log('login: OK');

  const preHealth = await healthCheck(token);
  console.log('pre_health:', JSON.stringify(preHealth));
  if (!preHealth.every((c) => c.ok)) {
    console.error('FAIL pre-health');
    process.exit(2);
  }

  const results = [];
  let measuredCeiling = null;
  let blockedReason = null;

  for (const vus of stages) {
    console.log(`\n=== STAGE ${vus} VU × ${STAGE_HOLD_MS}ms ===`);
    const stage = await runStage(token, vus, STAGE_HOLD_MS);
    const gates = gateStage(stage);
    const row = { ...stage, gates };
    results.push(row);
    console.log(
      JSON.stringify(
        {
          vus,
          errorRate: Number(stage.overall.errorRate.toFixed(4)),
          rate429: Number(stage.overall.rate429.toFixed(4)),
          rate5xx: Number(stage.overall.rate5xx.toFixed(4)),
          p50: stage.overall.p50_ms,
          p95: stage.overall.p95_ms,
          p99: stage.overall.p99_ms,
          rps: Number(stage.overall.throughput_rps.toFixed(2)),
          list_p95: stage.list.p95_ms,
          summary_p95: stage.summary.p95_ms,
          gates,
          statusCounts: stage.overall.statusCounts,
        },
        null,
        2,
      ),
    );

    const post = await healthCheck(token);
    row.post_health = post;
    if (!post.every((c) => c.ok)) {
      measuredCeiling = vus;
      blockedReason = `post-stage health FAIL at ${vus} VU`;
      console.error(blockedReason, post);
      break;
    }

    if (stage.aborted || stage.overall.errorRate > ABORT_ERROR_RATE) {
      measuredCeiling = vus;
      blockedReason = `abort: errorRate=${stage.overall.errorRate.toFixed(4)} at ${vus} VU (threshold ${ABORT_ERROR_RATE})`;
      console.error(blockedReason);
      break;
    }

    // Soft ceiling: if list p95 collapses > 5× target, stop before higher stages
    if ((stage.list.p95_ms ?? 0) > TARGET_P95_MS * 5) {
      measuredCeiling = vus;
      blockedReason = `soft-abort: list p95=${stage.list.p95_ms}ms > 5× target at ${vus} VU`;
      console.error(blockedReason);
      break;
    }
  }

  const postAll = await healthCheck(token);
  const maxPassing = [...results]
    .reverse()
    .find((r) => r.gates.error_budget_ok && r.gates.p95_list_ok && !r.aborted);

  const reached1000 = stages.includes(1000) && results.some((r) => r.vus === 1000 && r.gates.error_budget_ok && r.gates.p95_list_ok);
  const tConcPass =
    reached1000 ||
    (maxPassing &&
      maxPassing.vus >= 1000 &&
      maxPassing.gates.error_budget_ok &&
      maxPassing.gates.p95_list_ok);

  const report = {
    work_item_id: 'P1-HRM-SCALE-W3-T-CONC',
    generatedAt: new Date().toISOString(),
    target: PORTAL,
    hrm_base: HRM_BASE,
    adr_targets: {
      T_CONC: '1000 VU × 5min, error <1%, list p95 <2s',
      T_P95_LIST_ms: TARGET_P95_MS,
      T_P95_SUM_ms: 1000,
    },
    stages: results,
    measured_ceiling_vu: measuredCeiling ?? (maxPassing?.vus ?? null),
    max_passing_vu: maxPassing?.vus ?? null,
    blocked_reason: blockedReason,
    t_conc_met: Boolean(tConcPass),
    post_test_health: postAll,
    u65_note: 'NFR probe only — not UF browser acceptance',
  };

  const outPath = resolve('docs/qa/evidence/_p1-hrm-scale-w3-t-conc-raw.json');
  writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(`\nWrote ${outPath}`);
  console.log(
    JSON.stringify(
      {
        t_conc_met: report.t_conc_met,
        max_passing_vu: report.max_passing_vu,
        measured_ceiling_vu: report.measured_ceiling_vu,
        blocked_reason: report.blocked_reason,
      },
      null,
      2,
    ),
  );

  // Exit 0 = ran safely with evidence; T-CONC may still be unmet (caller reads JSON)
  process.exit(0);
}

main().catch((e) => {
  console.error('FATAL', e instanceof Error ? e.message : e);
  process.exit(1);
});
