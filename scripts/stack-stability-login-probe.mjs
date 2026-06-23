#!/usr/bin/env node
/**
 * Stack stability — repeated XBOS login via portal/nginx path.
 * Detects 502 flaps during xbos-be restart (Nest start:dev on VPS).
 *
 * Usage:
 *   node scripts/stack-stability-login-probe.mjs
 *   PORTAL_DEV_URL=https://14-225-217-232.nip.io node scripts/stack-stability-login-probe.mjs --samples 30
 */
const PORTAL = (process.env.PORTAL_DEV_URL || 'https://14-225-217-232.nip.io').replace(/\/+$/, '');
const EMAIL = process.env.XEVN_PROBE_EMAIL || 'ceo@xe.vn';
const PASSWORD = process.env.XEVN_PROBE_PASSWORD || 'Xevn@2026';

function parseArgs() {
  const i = process.argv.indexOf('--samples');
  const samples = i >= 0 ? Number(process.argv[i + 1]) : 20;
  const gapMs = process.argv.includes('--fast') ? 50 : 150;
  return { samples: Number.isFinite(samples) && samples > 0 ? samples : 20, gapMs };
}

async function loginOnce() {
  const r = await fetch(`${PORTAL}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  return r.status;
}

async function main() {
  const { samples, gapMs } = parseArgs();
  const counts = {};
  let ok = 0;

  console.log(`stack-stability-login-probe  portal=${PORTAL}  samples=${samples}\n`);

  for (let i = 0; i < samples; i += 1) {
    const status = await loginOnce();
    counts[status] = (counts[status] || 0) + 1;
    if (status === 200 || status === 201) ok += 1;
    if (gapMs > 0 && i < samples - 1) await new Promise((r) => setTimeout(r, gapMs));
  }

  const f502 = counts[502] || 0;
  const summary = { portal: PORTAL, samples, ok, f502, counts };
  console.log(JSON.stringify(summary, null, 2));

  if (f502 > 0) {
    console.error(`\nFAIL: ${f502}/${samples} login returned 502 (nginx upstream down — wait for xbos-be boot or re-run after deploy warmup)`);
    process.exit(1);
  }
  if (ok < samples) {
    console.error(`\nFAIL: only ${ok}/${samples} login 200/201`);
    process.exit(1);
  }

  console.log(`\nPASS: ${ok}/${samples} login 200/201, zero 502`);
  process.exit(0);
}

main().catch((e) => {
  console.error('FAIL', e instanceof Error ? e.message : String(e));
  process.exit(1);
});
