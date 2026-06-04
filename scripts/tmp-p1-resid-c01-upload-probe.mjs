#!/usr/bin/env node
/**
 * P1-RESID-C-QA-01 — live upload scope: main 201, cross-tenant 409
 */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadDeployEnv, repoRoot } from './seed-env-loader.mjs';
import { portalLogin, authHeaders, hrmApiBase } from './lib/uat-http.mjs';

loadDeployEnv();

async function upload(companyId, session) {
  const headers = authHeaders(session);
  const fd = new FormData();
  fd.append('file', new Blob(['qa-probe'], { type: 'application/pdf' }), 'p1-resid-c01-probe.pdf');
  const url = `${hrmApiBase()}/files/upload?${new URLSearchParams({
    company_id: companyId,
    feature: 'resume',
  })}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: headers.Authorization,
      'x-tenant-id': headers['x-tenant-id'],
      'x-company-id': headers['x-company-id'],
    },
    body: fd,
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, code: body?.code, company_id: body?.data?.company_id, url: body?.data?.url };
}

async function main() {
  const session = await portalLogin('ceo@xe.vn', process.env.PORTAL_PILOT_PASSWORD ?? 'Xevn@2026');
  const mainUpload = await upload('main', session);
  const crossUpload = await upload('logistics', session);
  const out = {
    work_item_id: 'P1-RESID-C01',
    date: '2026-05-30',
    account: 'ceo@xe.vn',
    probes: [
      {
        case: 'company_id=main',
        expect: 201,
        ...mainUpload,
        pass: mainUpload.status === 201 && mainUpload.code === 'HRM-FILE-201',
      },
      {
        case: 'company_id=logistics (cross-tenant)',
        expect: 409,
        ...crossUpload,
        pass:
          crossUpload.status === 409 &&
          (crossUpload.code === 'HRM-FILE-409' || crossUpload.code === 'SCOPE_CONTEXT_MISMATCH'),
      },
    ],
    pass: mainUpload.status === 201 && crossUpload.status === 409,
  };
  writeFileSync(
    resolve(repoRoot, 'docs/qa/evidence/p1-resid-c01-upload-probe-20260530.json'),
    `${JSON.stringify(out, null, 2)}\n`,
  );
  console.log(JSON.stringify(out, null, 2));
  process.exit(out.pass ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
