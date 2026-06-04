#!/usr/bin/env node
/** P1-QUAL-BE-SEED-01 — verify catalog-extensions list routes (ceo@xe.vn / main). */
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadDeployEnv, repoRoot } from './seed-env-loader.mjs';
import { authHeaders, hrmReq, portalLogin } from './lib/uat-http.mjs';

loadDeployEnv();

const email = process.env.UAT_PORTAL_EMAIL ?? 'ceo@xe.vn';
const password = process.env.PORTAL_DEV_PASSWORD ?? 'Xevn@2026';
const COMPANY = 'main';

const session = await portalLogin(email, password);
const headers = authHeaders(session);

const probes = [];

async function probe(name, path, expectStatus = 200) {
  const { status, body } = await hrmReq(path, { headers });
  const data = body?.data ?? body;
  const total = data?.total ?? (Array.isArray(data?.data) ? data.data.length : null);
  const code = body?.code ?? null;
  const ok = status === expectStatus;
  probes.push({ name, path, status, code, total, ok });
  return ok;
}

let pass = true;
pass = (await probe('sales-data-list', `/sales-data?company_id=${COMPANY}`)) && pass;
pass = (await probe('bonus-policies-list', `/bonus-policies?company_id=${COMPANY}`)) && pass;

const policyId = probes.find((p) => p.name === 'bonus-policies-list')?.total
  ? (
      await hrmReq(`/bonus-policies?company_id=${COMPANY}`, { headers })
    ).body?.data?.data?.[0]?.id
  : null;

if (policyId) {
  pass =
    (await probe(
      'bonus-participants-list',
      `/bonus-policies/${policyId}/participants?company_id=${COMPANY}`,
    )) && pass;
}

const out = {
  work_item_id: 'P1-QUAL-BE-SEED-01',
  date: '2026-05-30',
  account: email,
  company_id: COMPANY,
  pass,
  probes,
};

const outPath = resolve(repoRoot, 'docs/qa/evidence/p1-qual-be-seed-01-probe-20260530.json');
mkdirSync(resolve(repoRoot, 'docs/qa/evidence'), { recursive: true });
writeFileSync(outPath, JSON.stringify(out, null, 2));

console.log(JSON.stringify({ pass, probes }, null, 2));
process.exit(pass ? 0 : 1);
