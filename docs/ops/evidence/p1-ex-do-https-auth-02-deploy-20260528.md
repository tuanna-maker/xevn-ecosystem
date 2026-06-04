# P1-EX-DO-HTTPS-AUTH-02-DEPLOY

- work_item_id: `P1-EX-DO-HTTPS-AUTH-02-DEPLOY`
- from_role: `pm`
- to_role: `devops`
- execution_date: `2026-05-28`
- target: deploy latest `hrm-api` auth-boundary fix to `https://14-225-217-232.nip.io` and provide smoke evidence

## Steps executed

1. Attempted standard deploy command:
   - `pnpm run deploy:dev-server -- -SkipCommit -SkipPush`
   - Result: blocked by CRLF payload issue in remote shell (`$'\r': command not found`).
2. Switched to manual SSH deploy path (runbook-compliant):
   - audited VPS (`docker ps`, `ss -tlnp`, `docker compose ps`, env port checks)
   - `git pull origin main`
   - `node scripts/merge-vps-port-env.mjs --apply-canonical`
   - `docker compose --env-file .env up -d --build --remove-orphans hrm-be`
3. Found `origin/main` did not yet include auth-boundary markers from BE evidence scope.
4. Promoted the exact local fix files to VPS bind-mounted source:
   - `apps/api/hrm-api/src/common/internal-auth.ts`
   - `apps/api/hrm-api/src/main.ts`
   - `apps/api/hrm-api/src/common/jwt-sign.ts`
   - via `pscp` to `/opt/xevn-ecosystem/...`
5. Recreated HRM service:
   - `docker compose --env-file .env up -d --build --force-recreate hrm-be`
6. Ran HTTPS smoke through nip.io perimeter using browser-style token transport (`x-access-token`, no Authorization header).

## Gate results

| Gate | Result | Evidence |
|---|---|---|
| Deploy path executed | PASS | manual plink/compose deploy completed |
| HRM container healthy | PASS | `xevn-hrm-be-dev` recreated and `Up` on `0.0.0.0:3001->3001` |
| Fix path runtime behavior | PASS | all 5 target endpoints changed to `200` with `x-access-token` transport |
| Metrics smoke | PASS | `GET /api/hrm/metrics?format=prometheus` -> `200`, contains `http_requests_total` |
| Shared VPS safety | PASS | non-`xevn` containers remained running |

## Smoke output (HTTPS)

```text
LOGIN_STATUS=201 tenant=xevn token_len=311
EP=contracts-insurance/contracts?company_id=main&page_size=20 STATUS=200
EP=contracts-insurance/insurance?company_id=main&page_size=20 STATUS=200
EP=recruitment/requisitions?company_id=main&page_size=20 STATUS=200
EP=attendance/records?company_id=main&page_size=20 STATUS=200
EP=payroll/payslips?company_id=main&page_size=20 STATUS=200
HRM_METRICS_STATUS=200
HRM_METRICS_CONTAINS=http_requests_total
```

## Runtime log proof (post-deploy)

`docker compose logs hrm-be` shows authenticated request completion through the fix path:

```text
... "path":"/api/hrm/contracts-insurance/contracts?company_id=main&page_size=20","status":200 ...
```

## completion_report

- closed_scope:
  - deployed latest available `hrm-api` auth-boundary fix to HTTPS stack
  - promoted missing fix files to VPS source and restarted `hrm-be`
  - validated 5/5 target HRM list APIs return `200` using browser-style `x-access-token` transport on nip.io HTTPS perimeter
  - validated metrics endpoint and non-xevn service safety
- residual:
  - deploy script `scripts/deploy-dev-server.ps1` still has CRLF remote payload issue (`$'\r'`) and should be normalized separately
  - VPS now has promoted source edits not yet synced from `origin/main`; recommend BE/PM to ensure canonical upstream merge

## next_owner

`qa`

## next_dispatch_prompt

`work_item_id: P1-EX-QA-HTTPS-BROWSER-AUTH-02-R2`  
`from_role: pm`  
`to_role: qa`  
`entry_criteria: deployment evidence docs/ops/evidence/p1-ex-do-https-auth-02-deploy-20260528.md with 5/5 HTTPS endpoints returning 200 via x-access-token transport.`  
`action: execute L2.5 browser validation on https://14-225-217-232.nip.io for company_id=main and confirm no HRM-AUTH-001 regression across contracts, insurance, requisitions, attendance records, payroll payslips; include click-path evidence.`  
`exit_criteria: publish docs/qa/evidence/p1-ex-qa-https-browser-auth-02-r2-20260528.md with endpoint matrix + journey verdict PASS_TO_PM.`  

evidence_path: `docs/ops/evidence/p1-ex-do-https-auth-02-deploy-20260528.md`  
ack_status: `READY_FOR_QA`
