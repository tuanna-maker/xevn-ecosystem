# P1-PHASE1-QC-MOB-P5-JWT-01 — C-W12QC-01 formal closure (2026-06-05)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-PHASE1-QC-MOB-P5-JWT-01` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **entry** | QA `P1-PHASE1-QA-MOB-P5-JWT-01` — `docs/qa/evidence/p1-phase1-mob-p5-jwt-qa-20260605.md` |
| **prior_dev** | `docs/qa/evidence/p1-phase1-mob-p5-jwt-20260605.md` (dev-mobile) |
| **prior_qc** | `docs/qa/evidence/p1-p100-w12-qc-final-20260531.md` — **C-W12QC-01** OPEN (L1 **36/37**) |
| **environment_authoritative** | Local L0 — HRM `:28001`, XBOS `:28002`; shared DB `xevn_hrm` @ `113.20.107.184` |
| **decision** | **GO** — **C-W12QC-01 CLOSED** (scoped condition register) |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |
| **ack_status** | **PASS_TO_PM** |

---

## Scope

**In scope:** Formal QC sign-off that **C-W12QC-01** (`test:system:uat` **37/0** with `mobile-jwt-attendance-record-uuid-scope` **PASS**) is **CLOSED** after dev-mobile P5 JWT/scope fix + QA independent L1 retest; affirm no regression to historical **36/37**.

**Out of scope (must not be claimed):** Phase 1 program DONE; corporate **PROD-READY**; **G8** zero-defect closure; nip.io APK rebuild; fresh J-MOB-03/05 device tap on new APK (GWC deferred); full L2/L2.5 browser matrix; `phase1:gate --strict` rerun.

---

## Evidence consumed

| # | Artifact | Role |
|---|----------|------|
| 1 | `docs/qa/evidence/p1-phase1-mob-p5-jwt-qa-20260605.md` | QA — primary retest |
| 2 | `docs/qa/evidence/p1-phase1-mob-p5-jwt-20260605.md` | Dev-mobile — root cause + fix |
| 3 | `docs/qa/evidence/system-integration-uat-report.json` | L1 SoT — **37/0** `verdict: PASS` |
| 4 | `docs/qa/evidence/p1-p100-w12-qc-final-20260531.md` | W12 FINAL — original **C-W12QC-01** condition |
| 5 | `docs/program/SERVICE_READINESS_UAT_PRODUCTION.md` | SVC-05 row — PM refresh target |
| 6 | `docs/program/PROJECT_STATUS_REPORT.md` | C-W12QC-01 row — PM refresh target |

---

## Evidence pack gate (Layer B)

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-phase1-mob-p5-jwt-qa-20260605.md
```

| Result | Detail |
|--------|--------|
| Exit **1** | **2/8** — missing `portal_url`, `crud_or_matrix` |
| QC adjudication | **Process GWC** — mobile L1-only narrow wave; substantive L1 table, vitest/smoke commands, classification, residuals, and handoff fields present. `portal_url` / CRUD matrix are **out of slice** (no portal UI probe; attendance write validated via L1 P5 phase + vitest `p1-phase1-mob-p5-jwt.test.ts`). Same pattern as `p1-phase1-qc-contracts-ratio-20260605.md` (**1/8**). **Does not** block **C-W12QC-01** closure adjudication. |

---

## QC independent spot-check

```bash
pnpm run test:hrm-mobile
```

**Exit code:** **0** (`2026-06-05` QC session)

```text
Test Files  9 passed (9)
     Tests  37 passed (37)
```

**L1 SoT cross-check** (`docs/qa/evidence/system-integration-uat-report.json`):

| Field | Value |
|-------|-------|
| `summary.pass` / `fail` | **37** / **0** |
| `verdict` | **PASS** |
| `executed_at` | `2026-06-05T05:02:57.964Z` → `2026-06-05T05:03:20.xxxZ` |
| P5 `mobile-jwt-attendance-record-uuid-scope` | **PASS** — `DRIVER` `HLD-0016`, `write_path: mobile-jwt-only`, `company_uuid` body + JWT Bearer |

**Concurrence:** Matches QA (`p1-phase1-mob-p5-jwt-qa-20260605.md`) and Dev-mobile handoff — historical **36/37** `HRM-VAL-001` / scope-header mismatch **resolved** on seeded env.

---

## Classification

| Signal | Type | QC adjudication |
|--------|------|-----------------|
| L1 **37/0** + P5 phase **PASS** | **PRODUCT** | **PASS** — **C-W12QC-01** criterion met |
| Vitest **37/37** + MOB smoke exit **0** | **PRODUCT** | **PASS** — client JWT TTL + scope header/body split |
| First UAT run **7/30 FAIL** (unseeded) | **ENV** | **Non-blocking** — workforce seed required; authoritative run post-seed **37/0** |
| `qc:dev-stack` FAIL before xbos boot | **ENV** | **Non-blocking** — xbos started for UAT P2/P6; P0 health **PASS** after boot |
| `adb devices` empty — J-MOB-03/05 skipped | **ENV / GWC** | **Non-blocking for C-W12QC-01** — condition is L1 UAT **37/0**, not device lane; prior R4 strict PASS retained |
| BE `ACCESS_TTL_SEC` **43200** | **PRODUCT (optional P2)** | **GWC** — client honors server `expires_in_sec`; portal default 86400 when absent; not blocking closure |
| Pack `portal_url` + `crud_or_matrix` gaps | **PROCESS** | **GWC** — out-of-slice for mobile L1 wave |

---

## U19 L2.5 journey audit (mobile slice)

| Journey | Status | QC |
|---------|--------|-----|
| J-MOB-03 check-in write | Prior R4 strict **PASS** (2026-06-04) | **GWC** — not re-run this wave (no adb); logic-only P5 fix |
| J-MOB-05 manager approve | Prior R4 strict **PASS** (2026-06-04) | **GWC** — same |
| J-MOB-01..05 device on **new APK** | Not in C-W12QC-01 closure criteria | **Deferred** — `qa-device` when emulator available |

**U19:** **C-W12QC-01** closure is **L1 API/integration** (`mobile-jwt-attendance-record-uuid-scope`), not full device cross-nav re-proof. Device retest is **parallel GWC**, not a reopen trigger for this condition.

---

## Fail-closed checklist

| # | Criterion | Result |
|---|-----------|--------|
| 1 | QA independent L1 **37/0** exit **0** | **PASS** |
| 2 | P5 `mobile-jwt-attendance-record-uuid-scope` **PASS** | **PASS** |
| 3 | QC spot-check `test:hrm-mobile` **37/37** | **PASS** |
| 4 | No regression to **36/37** | **PASS** — UAT JSON SoT **37/0** |
| 5 | Dev root cause documented (slug header + JWT TTL) | **PASS** |
| 6 | **C-W12QC-02** contracts-density | **UNCHANGED** — **CLOSED** per `p1-phase1-qc-contracts-ratio-20260605.md` |
| 7 | Phase 1 DONE / PROD claim | **NOT APPROVED** |

---

## Condition register delta

| ID | Prior (W12 FINAL / S5 chain) | QC verdict (2026-06-05) |
|----|------------------------------|-------------------------|
| **C-W12QC-01** | **OPEN** — L1 **36/37** `mobile-jwt-attendance-record-uuid-scope` FAIL | **CLOSED** — L1 **37/0**, P5 **PASS**, vitest **37/37** |
| **C-W12QC-02** | **CLOSED** (contracts-ratio 0.850) | **CLOSED** (unchanged) |
| **C-W12QC-04** | **OPEN** — DEVICE-03 / new APK | **OPEN** (unchanged) |
| **G6 MET** / mobile PROD slice | **GWC** — blocked by C-W12QC-01 | **GWC narrowed** — L1 P5 unblocked; PROD still blocked by **C-W12QC-04**, **PROD-READY**, **portal.xe.vn** |
| **SVC-05** | Not promoted | **PM refresh** → UAT promotable (L1 P5) with device GWC |

---

## Decision rationale

**GO (scoped) — C-W12QC-01 CLOSED**

- QA + Dev chain satisfies W12 FINAL fail-closed criterion: `test:system:uat` **37/0** with target phase **PASS**
- QC independent vitest **37/37** concurs; UAT JSON SoT reproducible
- Root cause (UUID on `x-company-id` + missing JWT refresh) addressed in dev-mobile handoff with contract tests
- No new P0 mobile API regression vs historical **36/37**

**Why not unconditional GO / G6 MET / PROD:**

- Device lane J-MOB-03/05 not re-proven post-P5 on hardware (GWC — prior R4 baseline)
- Corporate **PROD-READY** / **portal.xe.vn** / **G8** / program gates remain open per S5 + W12 chain
- BE mobile TTL **43200** optional follow-up (non-blocking)

**Why not NO-GO:**

- Pack **2/8** gaps are **process/out-of-slice**, not missing product proof
- Unseeded first-run FAIL correctly classified **ENV**, not product regression
- Condition definition is L1 **37/0**, not device APK rebuild

---

## Residual (post-closure)

| Item | Status | Owner | Trigger |
|------|--------|-------|---------|
| J-MOB-03/05 device tap on post-P5 APK | **GWC** | `qa-device` | Emulator/adb available |
| BE `ACCESS_TTL_SEC` **43200** → **86400** alignment | **Optional P2** | `dev-be` | PM prioritization |
| **C-W12QC-04** DEVICE-03 | **OPEN** | `qa-device` | Mobile sponsor sign-off |
| **PROD-READY** / **portal.xe.vn** | **OPEN** | `devops` + PM | W13–W14 chain |
| Phase 1 program DONE | **NOT MET** | PM + QC program gate | `phase1:gate` + G1–G9 |

---

## Handoff packet

- **completion_report:** **C-W12QC-01 CLOSED.** QC concurred QA L1 **37/0** (`mobile-jwt-attendance-record-uuid-scope` **PASS**), vitest **37/37** spot-check, Dev-mobile root-cause fix. Pack verify **2/8** adjudicated process GWC (out-of-slice). **NOT** Phase 1 DONE / **NOT** PROD. Residual: J-MOB device GWC, BE TTL optional, C-W12QC-04 open.
- **next_owner:** `pm`
- **next_dispatch_prompt:** `work_item_id: P1-PHASE1-PM-MOB-P5-CLOSE-01. Role: pm. Entry: QC PASS_TO_PM docs/qa/evidence/p1-phase1-qc-mob-p5-jwt-20260605.md — C-W12QC-01 CLOSED (L1 37/0, P5 PASS). Exit: Sync PROJECT_STATUS_REPORT C-W12QC-01 row CLOSED; SERVICE_READINESS SVC-05 → UAT promotable (L1 P5) with device GWC; TEAM_LIVE_STATUS + TEAM_WORKING_NOW remove C-W12QC-01 from P0 blockers; dispatch qa-device J-MOB-03/05 when adb available (optional, non-blocking PROD web runway). Do NOT claim Phase 1 DONE or PROD-READY. evidence_path: docs/program/PM_LIVE_PULSE.md or bus entry.`
- **evidence_path:** `docs/qa/evidence/p1-phase1-qc-mob-p5-jwt-20260605.md`
- **ack_status:** **PASS_TO_PM**
- **pm_dispatch_hint:** Refresh **SVC-05** + **PROJECT_STATUS_REPORT**; optional **qa-device** J-MOB-03/05; program gate (**G8**, **PROD**, **portal.xe.vn**) still P0 elsewhere
