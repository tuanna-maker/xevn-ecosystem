#!/usr/bin/env node
/**
 * PO-HRM-MVP-GD1-REC-05-CLUSTER-QA-01 — L1 seal only (no seed)
 * Probes: transitions / stage-history / EFF / Nest /rec DENY
 */
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HRM = process.env.HRM_HOST_API || 'http://127.0.0.1:28001';
const XBOS = process.env.XBOS_HOST_API || 'http://127.0.0.1:28002';
const EMAIL = 'ceo@xe.vn';
const PASS = 'Xevn@2026';
const COMPANY = 'main';
const FAKE = '00000000-0000-4000-8000-000000000001';

const __dir = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dir, '../../docs/qa/evidence/_tmp-po-hrm-mvp-gd1-rec-05-l1-seal.json');
const stamp = `REC05L1-${Date.now().toString(36).toUpperCase()}`;

async function login() {
  const r = await fetch(`${XBOS}/api/xbos/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASS }),
  });
  const j = await r.json();
  return j?.data?.accessToken ?? j?.accessToken ?? j?.data?.access_token;
}

async function probe(method, path, token, body) {
  const headers = {
    authorization: `Bearer ${token}`,
    'x-company-id': COMPANY,
    'content-type': 'application/json',
  };
  const r = await fetch(`${HRM}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await r.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* */
  }
  const code =
    json?.error?.code ??
    json?.code ??
    json?.message ??
    (text.includes('Cannot ') ? text.slice(0, 120) : null);
  return {
    method,
    path,
    status: r.status,
    code: typeof code === 'string' ? code.slice(0, 180) : code,
    snippet: text.slice(0, 220),
  };
}

const token = await login();
const out = {
  work_item_id: 'PO-HRM-MVP-GD1-REC-05-CLUSTER-QA-01',
  stamp,
  startedAt: new Date().toISOString(),
  token_ok: Boolean(token),
  probes: [],
};

if (!token) {
  out.overall = 'FAIL_NO_TOKEN';
  writeFileSync(OUT, JSON.stringify(out, null, 2));
  console.log(JSON.stringify(out, null, 2));
  process.exit(2);
}

out.probes.push(
  await probe('GET', '/api/hrm/recruitment/pipeline-stages/effective?company_id=main', token),
);
out.probes.push(
  await probe('POST', `/api/hrm/recruitment/candidates/${FAKE}/transitions`, token, {
    to_stage: 'screening',
  }),
);
out.probes.push(
  await probe('GET', `/api/hrm/recruitment/candidates/${FAKE}/stage-history?company_id=main`, token),
);
out.probes.push(
  await probe('POST', `/api/hrm/rec/candidates/${FAKE}/transitions`, token, {
    to_stage: 'screening',
  }),
);
out.probes.push(
  await probe('GET', `/api/hrm/rec/candidates/${FAKE}/stage-history`, token),
);

const postT = out.probes.find((p) => p.path.includes('/recruitment/') && p.method === 'POST');
const getH = out.probes.find((p) => p.path.includes('stage-history') && p.path.includes('/recruitment/'));
const nest = out.probes.filter((p) => p.path.includes('/rec/'));

/** Route mapped = NOT Nest "Cannot *" (resource 404 HRM-REC-* is LIVE OK — BE-02). */
function isMappedRoute(probe, cannotRe) {
  if (!probe) return false;
  const snippet = typeof probe.snippet === 'string' ? probe.snippet : '';
  const code = typeof probe.code === 'string' ? probe.code : '';
  if (cannotRe.test(snippet) || cannotRe.test(code)) return false;
  if (probe.status === 404) {
    return code.startsWith('HRM-REC') || /Candidate not found/i.test(snippet);
  }
  return probe.status > 0 && probe.status < 500;
}

const postLive = isMappedRoute(postT, /Cannot POST/i);
const histLive = isMappedRoute(getH, /Cannot GET/i);
const nestDeny = nest.every((p) => p.status === 404);

out.seal = {
  transitions_route_live: Boolean(postLive),
  stage_history_route_live: Boolean(histLive),
  nest_rec_deny: nestDeny,
  eff_ok: out.probes[0]?.status === 200,
};
out.overall =
  out.seal.transitions_route_live && out.seal.stage_history_route_live && out.seal.nest_rec_deny
    ? 'L1_ROUTES_LIVE'
    : 'L1_STALE_OR_ABSENT';

writeFileSync(OUT, JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
process.exit(out.overall === 'L1_ROUTES_LIVE' ? 0 : 2);
