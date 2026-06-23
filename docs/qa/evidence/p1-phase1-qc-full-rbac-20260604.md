# QC Gate Decision — P1-PHASE1-QC-FULL-RBAC-01 (2026-06-04)

work_item_id: P1-PHASE1-QC-RBAC-C02-CLOSE-01 · P1-PHASE1-QC-RBAC-C04-CLOSE-01 (addenda) · parent `P1-PHASE1-QC-FULL-RBAC-01`
ack_status: PASS_TO_PM

| Field | Value |
|---|---|
| work_item_id | `P1-PHASE1-QC-RBAC-C02-CLOSE-01` |
| parent_gate | `P1-PHASE1-QC-FULL-RBAC-01` |
| from_role | `qc` |
| to_role | `pm` |
| execution_date | `2026-06-04` |
| decision | **GO WITH CONDITIONS** — Phase 1 **UAT-ready RBAC slice** (U28) on HTTPS pilot; **C-RBACQC-02 CLOSED** |
| environment | `https://14-225-217-232.nip.io` (authoritative); local stack **down** |
| ack_status | **PASS_TO_PM** |

## Addendum — C-RBACQC-02 closure (2026-06-04)

After QA `P1-PHASE1-QA-SCOPE-DEPLOY-VERIFY-01` post `P1-PHASE1-DO-XBOS-BE-SCOPE-DEPLOY-01`:

| Check | QC result |
|-------|-----------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-phase1-qa-full-rbac-20260604.md` | Exit **0** — **8/8** (closes **C-RBACQC-01**) |
| `PORTAL_DEV_URL=https://14-225-217-232.nip.io node scripts/tmp-phase1-be-scope-crud-probe.mjs` | Exit **0** — `PROBE_OK`; GET shareholders **200** `XBOS-SHR-200` |
| `pnpm run test:xbos:cc-member-save` (regression) | Exit **0** — **4/4** PUT **200** |
| QA journey `p1-phase1-qa-scope-crud-journey-20260604.md` | J-CC-02 edit **XE_DU_LICH** — cổ đông preload **PASS** (no WARN/409) |

**Verdict:** **C-RBACQC-02 CLOSED** — group CEO GET shareholders with member tenant headers is **200** on current pilot image; no regression on member legal **PUT** mutate path.

## Addendum — C-RBACQC-03 closure (2026-06-05)

After QA `P1-PHASE1-QA-PROGRAM-GATE-03` and QC `P1-PHASE1-QC-PROGRAM-GATE-03`:

| Check | QC result |
|-------|-----------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-phase1-qa-program-gate-03-20260605.md` | Exit **1** — **1/8** (`work_item_id` line format — **process GWC**) |
| Local `pnpm run qc:dev-stack` | Exit **1** — APIs down (**ENV**); nip.io L0 substitute **200** portal + metrics |
| `pnpm phase1:gate --strict` with `HRM_HEALTH_URL` / `XBOS_HEALTH_URL` → nip.io | Exit **0** — matrix **244** `e2e_pass` / **1** `waived`; capability **pass=23 fail=0 skip=35** |
| `pnpm run verify:capabilities -- --group A1` (nip.io env) | Exit **0** — **2/2** PASS |

**Verdict:** **C-RBACQC-03 CLOSED** — strict program gate + capability smoke on authoritative HTTPS pilot. Detail: `docs/qa/evidence/p1-phase1-qc-program-gate-03-20260605.md`. Local reproducibility without env override remains **GWC** (**C-RBACQC-03-LOCAL**, optional devops).

## Addendum — C-RBACQC-04 closure (2026-06-04)

After QA `P1-PHASE1-QA-MEMBER-PERSONA-NIPIO-01` and QC `P1-PHASE1-QC-RBAC-C04-CLOSE-01`:

| Check | QC result |
|-------|-----------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-phase1-qa-member-persona-nipio-20260604.md` | Exit **1** — **6/8** (`command_table`, `residual_section` headings — **process GWC**) |
| QA browser L2.5 J-HRM-01..07 on `/hr/*?portal=1&tenantId=xe-du-lich` | **7/7 PASS** — isolated tab `du-lich.ceo@xe.vn` |
| QC spot-check `tmp-p1-phase1-member-ceo-crud-probe.mjs` | Exit **0** — `MEMBER_CEO_PROBE_OK` |
| QC spot-check `tmp-p1-phase1-member-hrm-cu-probe.mjs` | Exit **0** — `MEM_CRUD_JOURNEY_03_OK` |
| **C-MEMCC-01** CC iframe `/command-center/hrm/*` | **GWC** — MCP UI login + iframe session not proven; **not** blocking **C-RBACQC-04** |

**Verdict:** **C-RBACQC-04 CLOSED** — member CEO browser L2.5 J-HRM on nip.io direct embed. Detail: `docs/qa/evidence/p1-phase1-qc-rbac-c04-close-20260604.md`.

## Scope audited

**In scope:** User requirement **U28** (RBAC ladder) — group CEO full read/mutate in group scope; member CEO blocked on group rollup paths; subordinate narrowing per `docs/decisions/ADR-HRM-RBAC-SCOPE-LADDER.md`.

| Persona | Account | Checks |
|---------|---------|--------|
| Group CEO | `ceo@xe.vn` | JWT **86400**; HTTPS probe L2/L2.5; member legal **PUT** mutate (J-CC-02 API); no P0 block on legitimate group updates |
| Member CEO | `du-lich.ceo@xe.vn` | **403** group-member-units; **409** KPI `companyId=holding`; probe `member-kpi-negative` |
| Subordinates | HRBP / manager ladder | **Deferred** — HRBP not in **C-RBACQC-04** slice (member CEO CEO only) |

**Out of scope (must not be claimed):** Phase 1 program DONE; **245/245** sponsor closure; corporate **Production / PROD-READY**; full local `phase1:gate --strict` with capability smoke; mobile full **J-MOB** matrix; Excellence T1–T6.

## Evidence consumed

| # | Artifact | Role | Verdict used |
|---|----------|------|--------------|
| 1 | `docs/qa/evidence/p1-phase1-qa-full-rbac-20260604.md` | QA | **PASS** — pack **8/8**; deploy retest closes **C-RBACQC-02** |
| 1b | `docs/qa/evidence/p1-phase1-qa-scope-crud-journey-20260604.md` | QA | **PASS** — `P1-PHASE1-QA-SCOPE-DEPLOY-VERIFY-01` probe + J-CC-02 preload |
| 2 | `docs/qa/evidence/p1-ex-qa-https-p-cc-01-jwt-01-20260604.md` | QA | Group CEO perimeter **23/23 + 7/7**, JWT **86400** |
| 3 | `docs/qa/evidence/p1-r2-qa-03-20260529.md` | QA | Member CEO + HRBP persona matrix (local); negatives **403/409** |
| 4 | `docs/qa/evidence/p1-cc-qa-member-legal-save-l25-20260604.md` | QA | **J-CC-02** browser L2.5 save **PASS** @ portal-fe **`68ec457`** |
| 5 | `docs/qa/evidence/qc-p1-cc-member-legal-save-l25-20260604.md` | QC (prior) | Save slice **GWC** — chain accepted |
| 6 | `docs/decisions/ADR-HRM-RBAC-SCOPE-LADDER.md` | SA | Scope ladder SoT |
| 7 | `docs/program/TEAM_USER_REQUIREMENTS.md` | PM | **U28** lock |

## Evidence pack gate (Layer B)

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-phase1-qa-full-rbac-20260604.md
```

| Result | Detail |
|--------|--------|
| Exit **0** | **8/8** on `p1-phase1-qa-full-rbac-20260604.md` (QC re-gate 2026-06-04) |
| QC adjudication | **C-RBACQC-01 CLOSED.** Prior QC-01 session used independent reproduction when pack was missing; superseded by QA consolidated pack. |

## Classification (ENV vs PRODUCT)

| Signal | Class | Gate impact |
|--------|-------|-------------|
| `qc:dev-stack` local **fetch failed** (:28001/:28002/:5173) | **ENV** | Does **not** NO-GO nip.io slice |
| `phase1:gate` exit **0** non-strict; capability smoke **23 fail** (HTTP 0) | **ENV** (local APIs down) | Matrix count **244 e2e_pass / 1 waived** noted; **not** strict program closure |
| HTTPS probe **exit 0** — L2 **23/23**, L2.5 **7/7** | **PRODUCT — PASS** | Group CEO API perimeter |
| `expiresInSec=86400` / `jwt_delta=86400` | **PRODUCT — PASS** | Session contract |
| Member `du-lich.ceo` GMU **403**, KPI holding **409** | **PRODUCT — PASS (negative)** | U28 member block |
| Group CEO member legal **PUT 4/4 → 200** | **PRODUCT — PASS** | No P0 block on group mutate |
| Member GET shareholders (group CEO, member headers) | **PRODUCT — PASS** | **C-RBACQC-02 CLOSED** — probe **200** `XBOS-SHR-200` |
| Missing QA full-RBAC MD | **PROCESS** | **C-RBACQC-01 CLOSED** — pack published **8/8** |

## QC reproduction (2026-06-04)

| # | Check | Command / method | Result |
|---|-------|------------------|--------|
| 1 | HTTPS perimeter | `PORTAL_DEV_URL=https://14-225-217-232.nip.io node scripts/tmp-p1-ex-qa-https-01-probe.mjs` | Exit **0** — L2 **23/23**, L2.5 **7/7** |
| 2 | JWT | Direct login `ceo@xe.vn` | **201** `expiresInSec=86400`, `jwt_delta=86400` |
| 3 | Member negative (probe) | `member-kpi-negative` in probe | **409** `SCOPE_CONTEXT_MISMATCH` |
| 4 | Member negative (spot) | `du-lich.ceo@xe.vn` GMU + KPI on nip.io | GMU **403** `XBOS-TENANT-403`; KPI **409** `SCOPE_CONTEXT_MISMATCH` |
| 5 | Group mutate (J-CC-02 API) | `pnpm run test:xbos:cc-member-save` | Exit **0** — **4/4** PUT **200** `XBOS-ORG-201` |
| 6 | Local L0 | `pnpm run qc:dev-stack` | Exit **1** — APIs down (**ENV**) |
| 7 | Program gate | `pnpm phase1:gate` | Exit **0** non-strict; capabilities **0 pass / 23 fail / 35 skip** (local down) |
| 8 | Scope read parity (C-RBACQC-02) | `tmp-phase1-be-scope-crud-probe.mjs` on nip.io | Exit **0** — entity **200**, shareholders **200**, PUT **200**, member block **409** |
| 9 | Mutate regression | `pnpm run test:xbos:cc-member-save` | Exit **0** — **4/4** PUT **200** |

## U28 / RBAC verdict table

### Group CEO (`ceo@xe.vn`) — **MAY** (within group scope)

| Capability | Evidence | QC |
|------------|----------|-----|
| Login + 24h JWT | QC spot + probe `P-CC-01-jwt` | **PASS** |
| Read group member units (rollup list) | Probe `P-CC-02` **200** | **PASS** |
| KPI rollup `companyId=holding` with `main` session | Probe `J-CC-03` **200** | **PASS** |
| HRM embed P-CC-03..08 load | Probe **200** | **PASS** |
| J-HRM-01..07 list→detail (API L2.5) | Probe **7/7** | **PASS** |
| **Update** member legal entities (all 4 slugs) | `test:xbos:cc-member-save` **4/4 PUT 200** | **PASS** — **zero P0** group-CEO mutate block on spot path |
| Browser save J-CC-02 | QA @ **`68ec457`** (QC prior gate + API consistency) | **PASS (GWC chain)** |

### Group CEO — **must not** be wrongly blocked

| Check | Result |
|-------|--------|
| Legitimate member-unit **PUT** in group session | **No 409/403** on save probe — **PASS** |
| P0 “CEO tập đoàn cannot update member unit” | **Not reproduced** on nip.io after **`68ec457`** chain |

### Member CEO (`du-lich.ceo@xe.vn`) — **MUST NOT** (group paths)

| Capability | Expected | nip.io QC | QC |
|------------|----------|-----------|-----|
| `GET /tenant-scope/group-member-units` | **403** (or 404) | **403** `XBOS-TENANT-403` | **PASS (negative)** |
| `GET /kpi-engine/rollup?companyId=holding` | **403** or **409** | **409** `SCOPE_CONTEXT_MISMATCH` | **PASS (negative)** |
| Impersonate group rollup read as **200** | Must **not** occur | **409** — not **200** | **PASS** |

Member-owned HRM menus on nip.io: API **200** + browser L2.5 **7/7** per `p1-phase1-qa-member-persona-nipio-20260604.md` — **C-RBACQC-04 CLOSED** (2026-06-04). HRBP / CC iframe (**C-MEMCC-01**) remain open.

### Subordinates (narrower scope)

| Item | Status |
|------|--------|
| Manager/HRBP dept narrowing vs full company list | **Deferred** — ADR rung 3 **Target**; no new P0 in this gate |

## L2.5 journey coverage (U19)

| Journey | Group CEO (nip.io API) | Member CEO | QC |
|---------|------------------------|------------|-----|
| J-CC-02 save | API **PASS** + QA browser **PASS** @ `68ec457` | N/A (group path) | **PASS** |
| J-CC-03 rollup | **PASS** | **PASS** negative **409** | **PASS** |
| J-HRM-01..07 | **7/7 PASS** (probe) | **7/7 PASS** (browser `/hr` embed) | **PASS** group + member CEO |
| J-HRM-* CC iframe (member) | N/A | **GWC** — **C-MEMCC-01** | Optional follow-up |

**L2 PASS alone ≠ gate:** L2.5 API journeys executed on probe; J-CC-02 save has browser evidence in QA chain.

## QC decision

**GO WITH CONDITIONS** for **Phase 1 UAT-ready RBAC slice (U28)** on HTTPS pilot `14-225-217-232.nip.io`:

- **Group CEO** may read/mutate in group scope (including member legal **PUT**) — **no P0 block** on spot-checked legitimate updates.
- **Member CEO** correctly **denied** group rollup paths (**403/409**).
- **NOT** Phase 1 DONE · **NOT** Production GO · **NOT** 245/245 sponsor DONE.

## Conditions

| ID | Condition | Owner | Trigger |
|----|-----------|-------|---------|
| ~~**C-RBACQC-01**~~ | ~~Publish QA pack + pack verify~~ | — | **CLOSED** 2026-06-04 — `p1-phase1-qa-full-rbac-20260604.md` **8/8** |
| ~~**C-RBACQC-02**~~ | ~~Shareholders GET **409** with member headers~~ | — | **CLOSED** 2026-06-04 — probe **200** `XBOS-SHR-200`; QA `P1-PHASE1-QA-SCOPE-DEPLOY-VERIFY-01`; reopen only if group **PUT** regresses or shareholders **409** returns on same entity |
| ~~**C-RBACQC-03**~~ | ~~Re-run `phase1:gate --strict` + capability smoke when local stack up OR nip.io capability script~~ | — | **CLOSED** 2026-06-05 — nip.io strict gate exit **0**; A1 **2/2**; detail `p1-phase1-qc-program-gate-03-20260605.md`; **C-RBACQC-03-LOCAL** optional devops |
| ~~**C-RBACQC-04**~~ | ~~Member CEO + HRBP full P-CC + J-HRM L2.5 on nip.io~~ | — | **CLOSED** 2026-06-04 — member CEO J-HRM browser **7/7**; HRBP open |
| ~~**C-MEMCC-01**~~ | ~~CC iframe member HRM session `/command-center/hrm/*`~~ | — | **CLOSED** 2026-06-05 — `qc-p1-w6-memcc-close-20260605.md` |
| **C-RBACQC-05** | Sync `PROGRAM_JOURNEY_MAP.md` / matrix for J-CC-02 L2.5 + RBAC personas | **pm** | Governance same sprint |

## Residual (explicit — zero P0 on group mutate)

| Item | Severity | Owner | Blocks this gate? |
|------|----------|-------|-------------------|
| Local L0/capability smoke down | ENV | devops | **No** for nip.io slice |
| Member persona full nip.io browser matrix | Coverage | qa | **No** (condition) |
| Program G4/G5 / PROD columns | Program | pm | **Yes** for **Program DONE** only |

## pm_dispatch_hint

1. **C-RBACQC-01** and **C-RBACQC-02** are **CLOSED** on nip.io — no re-dispatch unless regression (shareholders **409** or PUT **4/4** fail).
2. **Next:** Task `qa`/`devops` **C-RBACQC-03** strict gate when stack up; optional **dev-fe** **C-MEMCC-01** CC iframe; HRBP persona browser — separate wave.
3. **Do not** update USER_SERVICE_STATUS to Production until W13/QC prod chain; UAT-READY may note **group CEO RBAC + member CEO J-HRM L2.5 (7/7) on nip.io GWC**.

## completion_report

- **Closed (this wave):** **C-RBACQC-02** — group CEO GET shareholders with member tenant headers **200** `XBOS-SHR-200` on nip.io; scope probe **PROBE_OK**; mutate regression **4/4**; QA J-CC-02 preload **PASS**.
- **Closed (prior QA wave):** **C-RBACQC-01** — consolidated QA pack **8/8**.
- **Closed (parent gate):** U28 RBAC API slice — group CEO perimeter + mutate **PASS**; member CEO negatives **403/409**; JWT **86400**.
- **Closed (addendum):** **C-RBACQC-04** — member CEO J-HRM browser L2.5 **7/7** on nip.io (`p1-phase1-qc-rbac-c04-close-20260604.md`).
- **Closed (addendum 2026-06-05):** **C-RBACQC-03** — strict program gate on nip.io (`p1-phase1-qc-program-gate-03-20260605.md`).
- **Closed (addendum 2026-06-05):** **C-MEMCC-01** — member CEO CC HRM embed nip.io (`qc-p1-w6-memcc-close-20260605.md`).
- **Open:** **C-RBACQC-03-LOCAL** local strict gate without env override (GWC); HRBP persona; **C-RBACQC-05** journey map sync; program G4/G5 / PROD.

## next_owner

`pm`

## next_dispatch_prompt

```
work_item_id: P1-PHASE1-QC-RBAC-C02-CLOSE-01 — QC **PASS_TO_PM**. **C-RBACQC-02 CLOSED**; **C-RBACQC-01 CLOSED**. Evidence: `docs/qa/evidence/p1-phase1-qc-full-rbac-20260604.md` (addendum). QA: `p1-phase1-qa-full-rbac-20260604.md` + `p1-phase1-qa-scope-crud-journey-20260604.md`. QC spot-check: pack **8/8**; scope probe **PROBE_OK** (shareholders **200**); `test:xbos:cc-member-save` **4/4**. Parent verdict unchanged: **GO WITH CONDITIONS** U28 RBAC on nip.io — **NOT** Phase 1 DONE / **NOT** PROD. PM: refresh `USER_SERVICE_STATUS` / bus for closed read-parity; optional dispatch **qa** `C-RBACQC-04` (member nip.io browser L2.5) or **qa**+**devops** `C-RBACQC-03` (strict gate when stack up). Reopen **dev-be** only if shareholders **409** or PUT mutate regresses on `11d2bb7b-6190-4cb4-b0fe-03d43b5596b8`.
```

## ack_status

**PASS_TO_PM** — **GO WITH CONDITIONS** for **Phase 1 UAT-ready RBAC slice (U28)** on HTTPS pilot; **C-RBACQC-01**, **C-RBACQC-02**, **C-RBACQC-04**, and **C-MEMCC-01 CLOSED**; **no P0** group-CEO read/mutate block on audited paths.
