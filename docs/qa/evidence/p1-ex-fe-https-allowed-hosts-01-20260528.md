# P1-EX-FE-HTTPS-ALLOWED-HOSTS-01 — HRM embed on HTTPS pilot

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-EX-FE-HTTPS-ALLOWED-HOSTS-01` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **date** | `2026-05-28` |
| **entry** | `P1-EX-QA-HTTPS-BROWSER-01` FAIL — `docs/qa/evidence/p1-ex-qa-https-browser-01-20260528.md` |
| **ack_status** | **READY_FOR_QA** |
| **retest** | `P1-EX-QA-HTTPS-BROWSER-01` |

---

## Summary

| Fix | File(s) | Intent |
|-----|---------|--------|
| Explicit Vite `allowedHosts` + preview | `apps/web/hrm/vite.config.ts` | Allow `hrm-fe`, `xevn-hrm-fe-dev`, `.nip.io`, pilot host; `HRM_VITE_ALLOW_ALL_HOSTS=true` escape hatch |
| Portal `/hr` proxy preserves browser Host | `apps/web/web-portal/vite.config.ts` | `changeOrigin: false` — stops forcing `Host: hrm-fe` through portal-fe → hrm-fe hop |
| Master JWT `companyId=xevn` → `main` | `apps/web/web-portal/src/integrations/identityScope.ts` | Embed iframe query never emits tenant slug as company |
| Regression tests | `identityScope.test.ts` | HTTPS pilot tenant-slug guard |

Embed URL path (`paths.ts` + `resolveHrmOperationalCompanyId`) unchanged — already maps `xevn` → `main`; identity scope now fixes upstream JWT mistake.

---

## Manual verify (QA — browser L2.5)

**Prerequisite:** restart `hrm-fe` + `portal-fe` containers after pull (Vite reads config at startup).

| Step | URL / action | PASS when |
|------|----------------|-----------|
| 1 | `https://14-225-217-232.nip.io/login` — `ceo@xe.vn` / `Xevn@2026` | Command Center loads |
| 2 | `/command-center/hrm/employees` | iframe **no** Vite “host hrm-fe not allowed” banner |
| 3 | Inspect iframe `src` | Query contains `companyId=main` (not `companyId=xevn`) |
| 4 | `/command-center/hrm/contracts` | Same — list renders or API error banner (not host block) |
| 5 | CC dashboard | KPI rollup **no** console 409 (prod build uses `main`; dev holding only with flag) |

**J-*** retest after L2 PASS: `J-HRM-01..07` per `docs/program/PROGRAM_JOURNEY_MAP.md`.

---

## Verification (automated)

| Command | Result |
|---------|--------|
| `pnpm --dir apps/web/hrm exec vitest run` | **129/129 PASS** |
| `pnpm --dir apps/web/web-portal exec vitest run src/integrations/identityScope.test.ts src/integrations/commandCenterScope.test.ts src/modules/hrm/paths.test.ts` | **15/15 PASS** |

---

## Ops note (devops companion)

If perimeter nginx proxies `/hr/` directly to `hrm-fe:8080` with `Host: $host`, HRM `allowedHosts` must include nip.io (now explicit). If traffic goes portal-fe → hrm-fe, both this FE fix and container restart are required.

---

## Handoff

```yaml
work_item_id: P1-EX-FE-HTTPS-ALLOWED-HOSTS-01
from_role: dev-fe
to_role: qa
ack_status: READY_FOR_QA
entry_criteria: P1-EX-QA-HTTPS-BROWSER-01 FAIL evidence read
exit_criteria: hrm-fe allowedHosts + portal /hr proxy Host + embed companyId=main — vitest PASS
evidence_path: docs/qa/evidence/p1-ex-fe-https-allowed-hosts-01-20260528.md
pm_dispatch_hint: Re-run P1-EX-QA-HTTPS-BROWSER-01 on https://14-225-217-232.nip.io after hrm-fe + portal-fe restart
```
