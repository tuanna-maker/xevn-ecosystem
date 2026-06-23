# QC Gate Decision — P1-EX-QC-HTTPS-POST-DEPLOY-01 (2026-06-03)

| Field | Value |
|---|---|
| work_item_id | `P1-EX-QC-HTTPS-POST-DEPLOY-01` |
| from_role | `qc` |
| to_role | `pm` |
| execution_date | `2026-06-04` |
| decision | **GO WITH CONDITIONS** — HTTPS pilot perimeter **L2 P-CC-01..09** + **L2.5 J-*** (API proxy) |
| environment | `https://14-225-217-232.nip.io` |
| account | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| ack_status | **PASS_TO_PM** |

## Scope audited

Post-VPS deploy `P1-EX-DEVOPS-VPS-DEPLOY-03` (`HEAD d2c9715`) and QA rerun `P1-EX-QA-HTTPS-01-RERUN`.

**In scope:** HTTPS pilot **L2** rows **P-CC-01..09** (23 probe sub-checks) and **L2.5** journeys **J-CC-03**, **J-HRM-01..07**, **J-XBOS-01-tasks** on nip.io via `scripts/tmp-p1-ex-qa-https-01-probe.mjs`.

**Explicitly out of scope (must not be claimed by this gate):** Phase 1 program DONE; corporate **Production / PROD-READY**; L1 `test:system:uat` on local stack; full browser CC iframe hydration and click-path UAT; member CEO full **J-HRM** matrix; Excellence T1–T6 closure.

## Evidence consumed

| # | Artifact | Role | Verdict used |
|---|----------|------|--------------|
| 1 | `docs/qa/evidence/p1-ex-qa-https-post-deploy-20260603.md` | QA | **Authoritative** — `PASS_TO_PM`; probe exit **0** |
| 2 | `docs/ops/evidence/vps-deploy-20260603.md` | DevOps | Deploy chain **ACCEPTED** — `570b117` + `d2c9715`; remote + workspace probe **0** |
| 3 | `docs/qa/evidence/p1-ex-qc-https-p-cc-01-jwt-01-20260603.md` | QC (prior) | **C-JCC03-01** scoped **CLOSED** — **confirmed** by full probe |
| 4 | `docs/qa/PILOT_BUSINESS_FLOW_MATRIX.md` | Matrix | P-CC-01..09 reference |
| 5 | `docs/program/PROGRAM_JOURNEY_MAP.md` | Journeys | L2.5 J-* reference |

## Evidence pack gate (Layer B)

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-ex-qa-https-post-deploy-20260603.md
```

| Result | Detail |
|--------|--------|
| Exit **1** | **3/8** checks: `work_item_id:` line format, command table pattern, CRUD matrix section |
| QC adjudication | **Process GWC only** — substantive runtime evidence is complete (full probe stdout, L2/L2.5 tables, classification in § Residual). **Not** product NO-GO. QA should align next pack to `.cursor/templates/QC_EVIDENCE_PACK_TEMPLATE.md`. |

## Classification (ENV vs PRODUCT)

| Signal | Class | Gate impact |
|--------|-------|-------------|
| Probe **exit 0** — L2 **23/23**, L2.5 **7/7** | **PRODUCT — PASS** | Promotes HTTPS pilot API perimeter |
| `P-CC-01-jwt` **86400** | **PRODUCT — CLOSED** | **C-JCC03-01** remains closed |
| Member KPI `du-lich.ceo@xe.vn` → **409** `SCOPE_CONTEXT_MISMATCH` | **PRODUCT — PASS (negative)** | Expected scope guard |
| VPS `NODE_ENV=development` | **ENV / deploy policy** | Dev pilot only — **not** Production parity |
| Browser iframe / CC shell UX | **PRODUCT — deferred** | P2 GWC — not exercised |
| Pack verify cosmetic **3/8** | **PROCESS** | Condition C-HTTPSQC-PACK-01 |

## QC reproduction (2026-06-04)

| Check | Method | Result |
|-------|--------|--------|
| HTTPS probe | `PORTAL_DEV_URL=https://14-225-217-232.nip.io node scripts/tmp-p1-ex-qa-https-01-probe.mjs` | Exit **0** — L2 **23/23**, L2.5 **7/7** |
| JWT row | Probe `P-CC-01-jwt` | **PASS** |
| Negative scope | `member-kpi-negative` | **409** — expected |

QC spot-check stdout matches QA evidence (no drift vs 2026-06-03 VPS deploy table).

**Authoritative:** QA file for journey notes; QC concurs on exit code and row counts.

## Gate matrix — HTTPS pilot perimeter

| Layer | Expected | Actual (QA + DevOps + QC) | Verdict |
|-------|----------|---------------------------|---------|
| **L2 P-CC-01..09** | No in-scope **409** on CEO `main` paths | **23/23 PASS** | **PASS** |
| **L2.5 J-CC-03** | KPI rollup `companyId=holding` + `x-company-id: main` → **200** | **PASS** | **PASS** |
| **L2.5 J-HRM-01..07** | List→GET detail **200** | **7/7 PASS** | **PASS** |
| **L2.5 J-XBOS-01-tasks** | Workflow tasks **200**, no **409** | **PASS** | **PASS** |
| **C-JCC03-01** | `expiresInSec=86400` on pilot | **PASS** (probe + prior QC) | **CLOSED** |
| **L1** `test:system:uat` | Not required this wave | Not run on HTTPS | **Deferred** |
| **L0** local `qc:dev-stack` | Out of slice | Not run | **Deferred** |
| **Browser L2.5** | Real click paths in CC iframe | Not run | **GWC P2** |
| **Production** | PROD-READY column | Dev VPS `NODE_ENV=development` | **NOT MET** |
| **Phase 1 DONE** | Program closure | Open program gates | **NOT MET** |

## L2.5 journey coverage audit (U19)

| Journey | Tested | Verdict | Notes |
|---------|--------|---------|-------|
| J-CC-03 | **Yes** (API) | **PASS** | |
| J-HRM-01 | **Yes** | **PASS** | contracts → employee GET |
| J-HRM-02 | **Yes** | **PASS** | employees → profile GET |
| J-HRM-03 | **Yes** | **PASS** | |
| J-HRM-04 | **Yes** | **PASS** | |
| J-HRM-05 | **Yes** | **PASS** | |
| J-HRM-06 | **Yes** | **PASS** | |
| J-HRM-07 | **Yes** | **PASS** | |
| J-XBOS-01-tasks | **Yes** | **PASS** | |
| J-HRM-* browser clicks | **No** | **Deferred** | API parity only this wave |

**NO-GO avoided:** QA PASS is not list-only green — mandatory J-* rows executed with list→detail **200**.

## Regression vs prior gates

| Prior | State before deploy | After this gate |
|-------|---------------------|-----------------|
| `P1-EX-QC-HTTPS-P-CC-01-JWT-01` (2026-06-03) | **GO** scoped JWT; probe exit **1** (HRM residuals) | **C-JCC03-01** unchanged **CLOSED**; full probe **0** |
| `P1-EX-QA-HTTPS-P-CC-01-JWT-01` | HRM **404/400** on probe | **Resolved** — all in-scope rows **PASS** |
| VPS `570b117` / `d2c9715` | — | Aligns with QA + QC repro |

## Conditions — closed vs remaining

### Closed by this gate

| ID | Source | Closure |
|----|--------|---------|
| **C-JCC03-01** | `qc-https-j-cc-03-01-20260529.md` + `p1-ex-qc-https-p-cc-01-jwt-01-20260603.md` | **CLOSED** — confirmed with full probe **`P-CC-01-jwt` PASS** and exit **0** |
| HTTPS HRM probe residuals (`P-CC-05..08`, `J-HRM-*`) | 2026-06-03 JWT wave | **CLOSED** on deployed stack |
| **P1-EX-HTTPS perimeter API slice** (group CEO `main`, nip.io) | PM partner-prep | **MET** at L2 + L2.5 API layer |

### Remaining (GO WITH CONDITIONS)

| ID | Severity | Owner | Reopen trigger |
|----|----------|-------|----------------|
| **C-HTTPSQC-PACK-01** | Process P2 | `qa` | Next QC dispatch without `verify:qc:evidence-pack` exit **0** |
| **C-HTTPSQC-BROWSER-01** | P2 | `qa` / `dev-fe` | User reports iframe blank / sync banner on HTTPS CC |
| **C-HTTPSQC-L1-01** | — | `qa` | Release slice requires L1 UAT re-run |
| **C-JCC03-04** (if open) | Ops P2 | `devops` | VPS git drift / `deploy-dev-server.ps1` plink EOF |
| **Production cutover** | P0 program | `devops` | `NODE_ENV=production` + secrets + `verify:production-env` **0** |
| **Phase 1 / Excellence DONE** | Program | `pm` | `phase1:gate`, G4/G5, QC S5 — unchanged |

## Executive verdict

| Decision tier | Result |
|---------------|--------|
| **HTTPS pilot perimeter** (L2 **P-CC-01..09** + L2.5 **J-*** API on nip.io) | **GO WITH CONDITIONS** |
| **C-JCC03-01** (JWT 86400) | **CLOSED** |
| **Production / PROD-READY** | **NOT MET** |
| **Phase 1 program closure** | **NOT MET** |
| **Unconditional corporate GO** | **NOT APPROVED** |

**Sponsor line:** Group CEO HTTPS pilot API perimeter is **green** after VPS deploy `d2c9715` (23/23 L2, 7/7 L2.5, QC repro exit **0**). **Do not** claim Production ready, Phase 1 done, or full browser UAT without separate evidence.

## completion_report

- Audited QA post-deploy + DevOps VPS evidence; pack verify **3/8** cosmetic fail adjudicated as process-only.
- QC spot-check probe exit **0** on `https://14-225-217-232.nip.io` — concurs with QA.
- Issued **GO WITH CONDITIONS** for HTTPS pilot L2 **P-CC-01..09** + L2.5 **J-*** API slice.
- **C-JCC03-01** register: **CLOSED** (confirmed; supersedes scoped JWT-only closure).
- HRM probe residuals from 2026-06-03 JWT wave: **closed** on deployed stack.
- **Not** promoted: Production, Phase 1 DONE, browser L2.5, L1 UAT on HTTPS.

## next_owner

`pm`

## next_dispatch_prompt

PM: QC **GO WITH CONDITIONS** for HTTPS pilot perimeter — `docs/qa/evidence/p1-ex-qc-https-post-deploy-20260603.md`. Update `PROGRAM_JOURNEY_MAP` / `PILOT_BUSINESS_FLOW_MATRIX` / bus: nip.io L2 **P-CC-01..09** + L2.5 **J-*** API ✅ for `ceo@xe.vn`/`main`; **C-JCC03-01 CLOSED**. **Do not** claim Phase 1 DONE or Production. Residual auto-fix: (1) QA pack template + `verify:qc:evidence-pack` exit **0** on next HTTPS wave (`C-HTTPSQC-PACK-01`); (2) optional `qa` browser L2.5 on nip.io (`C-HTTPSQC-BROWSER-01`); (3) `devops` production parity when sponsor requests (`NODE_ENV`, `verify:production-env`). No dev-be dispatch unless probe regression on JWT or scope **409**.

## pm_dispatch_hint

P1-EX-PM-HTTPS-PARTNER-STATUS — refresh USER_SERVICE_STATUS / SERVICE_READINESS UAT column for HTTPS pilot API slice only.

## evidence_path

`docs/qa/evidence/p1-ex-qc-https-post-deploy-20260603.md`

## ack_status

**PASS_TO_PM**
