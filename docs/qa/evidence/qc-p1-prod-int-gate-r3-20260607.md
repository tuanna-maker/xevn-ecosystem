# QC Gate Decision — P1-PROD-INT-QC-R3 (2026-06-07)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-PROD-INT-QC-R3` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **environment** | `http://127.0.0.1:5173` (portal) · `:28001` hrm-api · `:28002` xbos-api |
| **accounts** | `ceo@xe.vn` / `Xevn@2026` (`company_id=main`); negative `du-lich.ceo@xe.vn` |
| **executed_at** | `2026-06-07` |
| **program** | `docs/program/HRM_XBOS_PRODUCT_INTEGRITY_PROGRAM.md` (U39) |
| **prior_gate** | `docs/qa/evidence/qc-p1-prod-int-gate-r2-20260607.md` — **GO WITH CONDITIONS (reduced)** |
| **decision** | **GO WITH CONDITIONS (further reduced)** — localhost U32 integrity slice |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |
| **integrity_program_exit** | **NO** (G-INT-02/05/06/08 + Plane A drift open) |
| **ack_status** | **PASS_TO_PM** |

---

## Executive summary

QC R3 re-gates **P1-PROD-INT** after **PCOMP-W3-BE-04** (G-INT-03 Plane B bridge), **PCOMP-W3-QA-03** (SA P0-1..P0-4 closure), and cross-program mock waves **PCOMP-W1-QC-02** + **PCOMP-W2-QA-01**.

**Newly CLOSED vs R2:** **G-INT-03 Plane B** (`company_slug_map.display_name` ×5 + `slug_map_bridge=PASS`); **SA P0-1..P0-4** (live probes **15/15**, jest **67/67**, integrity `scope_parity` **0 gaps**).

**Reaffirmed CLOSED (unchanged):** **G-INT-04**, **G-INT-07**, **AC-INT-SW-02**, **J-HRM-INT-02**, **J-HRM-INT-05** (API), **G-INT-01** (integrity + W1/W2 mock depth).

**Remaining only (blocking program exit / PROD):** **G-INT-02** FE label join; **G-INT-03 Plane A** (XBOS 4 tenants vs HRM 5 slugs — documented UAT drift); **G-INT-05** browser switcher E2E; **G-INT-06** J-HRM-INT-03/04 + full L2.5; **G-INT-08** stale embed.

**NOT** Phase 1 DONE · **NOT** PROD-READY · **NOT** `HRM-XBOS-INTEGRITY` program exit.

---

## Evidence chain audited

| Wave | Artifact | Role | ack_status | QC R3 |
|------|----------|------|------------|-------|
| Prior | `docs/qa/evidence/qc-p1-prod-int-gate-r2-20260607.md` | qc | PASS_TO_PM | Baseline — delta below |
| W3 BE | `docs/qa/evidence/pcomp-w3-be-04-20260607.md` | dev-be | READY_FOR_QA | **G-INT-03 Plane B CLOSED** (seed + integrity) |
| W3 QA | `docs/qa/evidence/pcomp-w3-qa-03-20260607.md` | qa | PASS_TO_PM | **SA P0-1..P0-4 CLOSED** |
| Probe | `docs/qa/evidence/pcomp-w3-qa-03-probe-20260607.json` | qa | — | `failed=0` |
| W1 QC | `docs/qa/evidence/pcomp-w1-qc-02-20260607.md` | qc | PASS_TO_PM | **M-HRM-02,04,05,09,10,11** + **C-PCOMPQC-03 CLOSED** |
| W2 QA | `docs/qa/evidence/pcomp-w2-qa-01-20260607.md` | qa | PASS_TO_PM | **M-CC-01/02 CLOSED** |

---

## Evidence pack gate (Layer B)

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/pcomp-w3-qa-03-20260607.md
# exit 1 — 4/8 checks (work_item_id colon format, ack_status line, crud_or_matrix, residual_section header)

pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/pcomp-w3-be-04-20260607.md
# exit 1 — 3/8 checks (work_item_id colon, portal_url, journey_l25 — BE slice out-of-scope)
```

**Adjudication:** **PROCESS GO WITH CONDITIONS** — QA-03 body contains substantive L0 tables, P0 probe matrix, probe JSON, handoff packet. Format gaps **non-blocking** for product gate. **C-INTQC-01** carries — QA normalize pack before next regate.

---

## Layer C — QC independent spot-check (2026-06-07)

| Command | Result | Classification |
|---------|--------|----------------|
| `pnpm run qc:dev-stack` | **exit 0** — hrm-api + xbos-api + portal **200** | PRODUCT OK |
| `pnpm run verify:hrm:xbos-integrity` | **exit 0** — cardinality PASS; **slug_map_bridge=PASS** (5/5 display_name); scope_parity **0 gaps**; P0=0 P1=0 | PRODUCT OK |
| Probe JSON cross-check | QA-03 `failed=0`; member negatives **409** concurred | Concurs QA-03 |

---

## G-INT status register (close what's done — remaining only)

### CLOSED (localhost U32 — promotable this slice)

| ID | Closure evidence | Notes |
|----|------------------|-------|
| **G-INT-01** | QA-02 + **PCOMP-W1-QC-02** + **PCOMP-W2-QA-01** | FE mock P0 cluster: M-HRM **7/7** + M-CC-01/02; grep/runtime PASS on tested routes |
| **G-INT-03 Plane B** | **PCOMP-W3-BE-04** + QC integrity spot | `company_slug_map` ×5 Vietnamese `display_name`; VAL-INT-03-03 **PASS** |
| **G-INT-04** | QA-02 + QA-03 reaffirm | HRM scope parity **0 gaps**; P0 register live |
| **G-INT-07** | W1 governance | SRS/BRD delta published (prior wave) |
| **SA P0-1** | **PCOMP-W3-QA-03** | XBOS legal GET isolation — member **409** `SCOPE_CONTEXT_MISMATCH` |
| **SA P0-2** | **PCOMP-W3-QA-03** | Employee restore scope — cross-restore **404** |
| **SA P0-3** | **PCOMP-W3-QA-03** | Catalog-sync partition parity **200** |
| **SA P0-4** | **PCOMP-W3-QA-03** | Settings batch GET scope — cross-partition **409** `HRM-SET-409` |
| **AC-INT-SW-02** | R2 + reaffirmed | Operating slug queries **200** (prior BE-03 chain) |
| **J-HRM-INT-02** | R2 | Employee → contracts **200** |
| **J-HRM-INT-05** | R2 | 4-tab slug sweep API **0×409** |

### REMAINING (program / PROD blockers)

| ID | QC status | Owner | Condition / trigger |
|----|-----------|-------|-------------------|
| **G-INT-02** | **OPEN** | dev-fe + dev-be | Chart aggregators must resolve Plane B `display_name` via operating-units / slug map — no `Khác` fiction |
| **G-INT-03 Plane A** | **GWC** | ba-data | XBOS **4** `group-member-units` vs HRM **5** operating slugs — documented pilot drift; **block PROD** until 1:1 matrix or signed waiver |
| **G-INT-05** | **GWC** | dev-fe + qa | API path unblocked; browser combobox E2E across tabs **not** executed R3 |
| **G-INT-06** | **GWC (partial)** | dev-be + qa | **J-HRM-INT-03/04** not executed; INT-01/02/05 API only — full **01..05** browser L2.5 before exit |
| **G-INT-08** | **GWC** | dev-fe + qa | CC iframe blank / stale first paint (QA-02 class) — not retested R3 |

### Process (non-product)

| ID | Note | Owner |
|----|------|-------|
| **C-INTQC-01** | QA pack **4/8** on PCOMP-W3-QA-03 — normalize header format + `## Residual` | qa |
| **C-INTQC-02** | PCOMP-W3-BE-04 slug bridge — no dedicated QA-04 artifact; closed on BE + QC integrity spot | qa (optional PCOMP-W3-QA-04) |

---

## L2.5 journey coverage (U19)

| Journey | R3 tested | Verdict |
|---------|-----------|---------|
| **J-HRM-01/02** API list→detail | Prior + reaffirmed | **PASS** |
| **J-HRM-INT-01** requisitions | QA-02 | **PASS** |
| **J-HRM-INT-02** employee→contracts | R2 | **PASS — CLOSED** |
| **J-HRM-INT-03** | No | **OPEN** — G-INT-06 |
| **J-HRM-INT-04** | No | **OPEN** — G-INT-06 |
| **J-HRM-INT-05** 4-tab slug sweep | R2 API | **PASS — CLOSED** (API) |
| **AC-INT-SW-02** operating slug filter | R2 | **PASS — CLOSED** |

**U19 concurrence:** R3 closes security P0 register + Plane B cardinality bridge. **Cannot** claim **G-INT-06** program exit or PROD without INT-03/04 + G-INT-02/05 browser depth.

---

## Cross-program mock waves (W1/W2 — G-INT-01 depth)

| Program slice | Evidence | QC concurrence |
|---------------|----------|----------------|
| W1 HRM embed P0 mocks | `pcomp-w1-qc-02-20260607.md` | **M-HRM-01..11** promotable localhost; **C-PCOMPQC-03 CLOSED** |
| W2 CC workspace mocks | `pcomp-w2-qa-01-20260607.md` | **M-CC-01/02 CLOSED** — error path empty not mock; grep **0** `HRM_MOCK_*` |

These strengthen **G-INT-01** for tested routes; **do not** substitute integrity program exit (`verify:product:completion`, nip.io).

---

## Classification

| Finding | ENV vs PRODUCT |
|---------|----------------|
| L0 stack | **PRODUCT OK** |
| `slug_map_bridge` ×5 display_name | **PRODUCT CLOSED** — G-INT-03 Plane B |
| XBOS 4 vs HRM 5 slugs | **PRODUCT (documented seed)** — G-INT-03 Plane A GWC |
| SA P0-1..4 live probes 15/15 | **PRODUCT SECURITY CLOSED** |
| Pack format 4/8 | **PROCESS** |
| W1/W2 mock removal | **PRODUCT** — G-INT-01 depth (bounded routes) |

---

## Delta vs QC R2

| Register row | QC R2 | QC R3 |
|--------------|-------|-------|
| **G-INT-03 Plane B bridge** | OPEN | **CLOSED** |
| **G-INT-03 Plane A drift** | OPEN (same row) | **GWC** (documented; UAT OK) |
| **SA P0-1..P0-4** | OPEN explicit | **CLOSED** |
| **G-INT-01** | CLOSED (QA-02) | **CLOSED** + W1/W2 depth |
| **G-INT-04** | CLOSED | Reaffirmed |
| **G-INT-06** | GWC partial | **Unchanged** |
| **G-INT-05 / G-INT-08** | GWC | **Unchanged** |
| **G-INT-02** | Implicit in program | **OPEN** explicit remaining |

---

## Reopen triggers

- `verify:hrm:xbos-integrity` exit **≠ 0** or `slug_map_bridge` FAIL
- `scope_parity` gaps **> 0** on any P0 module
- Member CEO **200** on cross-partition batch GET / legal GET / holding restore
- Group CEO operating slug query returns **409** with JWT `main`
- PROD promotion while **G-INT-03 Plane A**, **G-INT-06** full journeys, or **G-INT-02** label join open

---

## Handoff packet

**completion_report:** QC **P1-PROD-INT-QC-R3** — **GO WITH CONDITIONS (further reduced)** localhost U32. **CLOSED:** G-INT-03 Plane B, SA P0-1..P0-4, G-INT-04 reaffirmed, G-INT-01 + W1/W2 mock depth. **REMAINING:** G-INT-02, G-INT-03 Plane A, G-INT-05, G-INT-06 (INT-03/04), G-INT-08, C-INTQC-01 pack format. **NOT Phase 1 DONE / NOT PROD / NOT integrity program exit.**

**next_owner:** **pm**

**next_dispatch_prompt:**

```text
PM — Intake P1-PROD-INT-QC-R3 PASS_TO_PM (GO WITH CONDITIONS further reduced localhost U32).

Closed R3: G-INT-03 Plane B bridge, SA P0-1..P0-4, G-INT-01+W1/W2 mock depth reaffirmed.
Remaining: G-INT-02 label join, G-INT-03 Plane A matrix, G-INT-05 browser E2E, G-INT-06 INT-03/04 + L2.5, G-INT-08 stale embed.

Dispatch (parallel max 2):
1) dev-fe PCOMP-W3-FE-02 — G-INT-02 chart label join using operating-units/slug_map; grep VAL-INT-02; evidence docs/qa/evidence/pcomp-w3-fe-02-20260607.md; ack_status READY_FOR_QA.
2) qa P1-PROD-INT-QA-05 — J-HRM-INT-03/04 API L2.5 + G-INT-05 browser switcher + G-INT-08 iframe retest; pack verify 8/8; evidence docs/qa/evidence/p1-prod-int-qa-05-20260607.md; ack_status PASS_TO_PM.

Parallel governance: sa PCOMP-W3-SA-02 — promote PHASE1_SCOPE_PARITY_AUDIT P0-1..P0-4 → Y per pcomp-w3-qa-03.

Do NOT update SERVICE_READINESS PROD columns or claim Phase 1 DONE / integrity program exit.
```

**evidence_path:** `docs/qa/evidence/qc-p1-prod-int-gate-r3-20260607.md`

**ack_status:** **PASS_TO_PM**
