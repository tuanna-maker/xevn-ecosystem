# QC Gate Decision — P1-PROD-INT-QC-03 R2 (2026-06-07)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-PROD-INT-QC-03` |
| **from_role** | `qc` |
| **to_role** | `pm` |
| **environment** | `http://127.0.0.1:5173` (portal) · `:28001` hrm-api · `:28002` xbos-api |
| **accounts** | `ceo@xe.vn` / `Xevn@2026` (`company_id=main`); negative `du-lich.ceo@xe.vn` |
| **executed_at** | `2026-06-07` |
| **program** | `docs/program/HRM_XBOS_PRODUCT_INTEGRITY_PROGRAM.md` (U39) |
| **prior_gate** | `docs/qa/evidence/qc-p1-prod-int-gate-20260607.md` — **GO WITH CONDITIONS** (W1 localhost baseline) |
| **qa_input** | `docs/qa/evidence/p1-prod-int-qa-03-20260607.md` — **PASS_TO_PM** |
| **decision** | **GO WITH CONDITIONS** (reduced) — BE-03 slice promotable localhost U32 |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |
| **integrity_program_exit** | **NO** (W3–W5 open) |
| **ack_status** | **PASS_TO_PM** |

---

## Executive summary

QC R2 re-gates **P1-PROD-INT** after QA-03 retest post **P1-PROD-INT-BE-03**. Audited QA chain + probe JSON + QC independent spot-checks. **Promotes:** **AC-INT-SW-02 CLOSED**, **J-HRM-INT-02 CLOSED**, **G-INT-04 CLOSED** (HRM scope parity — reaffirmed QA-02 + integrity script **0 gaps**). **Also closed this wave:** **J-HRM-INT-05** API 4-tab `holding` sweep **0×409** (partial **G-INT-06** progress).

**Remaining GWC (blocking PROD / program exit):** **G-INT-03** bridge table (XBOS 4 tenants vs HRM 5 slugs), **G-INT-06** full J-HRM-INT-01..05 journeys (INT-01 PASS prior; INT-03/04 not executed; browser L2.5 not re-run), **SA P0-1..P0-4** (XBOS legal GET IDOR, HRM restore, catalog-sync company id, settings batch GET).

**NOT** Phase 1 DONE · **NOT** PROD-READY · **NOT** `HRM-XBOS-INTEGRITY` program exit.

---

## Evidence chain audited

| Wave | Artifact | Role | ack_status | QC R2 |
|------|----------|------|------------|-------|
| W1 | `docs/qa/evidence/qc-p1-prod-int-gate-20260607.md` | qc | PASS_TO_PM | Baseline GWC — superseded promotions below |
| W2 | `docs/qa/evidence/p1-prod-int-be-02-20260607.md` | dev-be | READY_FOR_QA | Input — G-INT-04 decisions/payroll |
| W3 | `docs/qa/evidence/p1-prod-int-fe-01-20260607.md` | dev-fe | READY_FOR_QA | Input — G-INT-01 mock sweep |
| W4 | `docs/qa/evidence/p1-prod-int-qa-02-20260607.md` | qa | PASS_TO_PM | **G-INT-04 CLOSED**; INT-SW-02/CON-500 OPEN |
| W5 | `docs/qa/evidence/p1-prod-int-be-03-20260607.md` | dev-be | READY_FOR_QA | Fix INT-SW-02 + INT-CON-500 |
| W6 | `docs/qa/evidence/p1-prod-int-qa-03-20260607.md` | qa | PASS_TO_PM | **AC-INT-SW-02 / J-HRM-INT-02 / J-HRM-INT-05 PASS** |
| Probe | `docs/qa/evidence/p1-prod-int-qa-03-probe-20260607.json` | qa | — | `summary.pass=true`, `fail=0` |

---

## Evidence pack gate (Layer B)

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-prod-int-qa-03-20260607.md
# exit 1 — 2/8 checks (work_item_id header format, ## Residual section)
```

**Adjudication:** **PROCESS GO WITH CONDITIONS** — QA body contains `work_item_id` table field, gap table with owners, commands, probe JSON, handoff packet. Format gaps **non-blocking** for product gate. **C-INTQC-01** carries — QA normalize pack before next integrity QC regate.

---

## Layer C — QC independent spot-check (2026-06-07)

| Command | Result | Classification |
|---------|--------|----------------|
| `pnpm run qc:dev-stack` | **exit 0** — hrm-api + xbos-api + portal **200** | PRODUCT OK |
| `pnpm run verify:hrm:xbos-integrity` | **exit 0** — cardinality PASS; scope_parity **0 gaps**; P0=0 P1=0 | PRODUCT OK — **G-INT-04** |
| Probe JSON cross-check | All probes `pass=true`; member `NEG-member-holding` **409** | Concurs QA-03 |

**Note:** Integrity script documents XBOS **4** member tenants vs HRM **5** operating slugs (expected pilot drift) → **G-INT-03** remains open; not persona leak.

---

## Promoted / CLOSED (localhost U32 only)

| ID | Slice | Prior QC-01 | QA-03 / R2 | Status |
|----|-------|-------------|------------|--------|
| **AC-INT-SW-02** | Group CEO operating slug in query (`trsport`/`holding`/all 5) with JWT `main` | OPEN (QA-02 **409**) | Live **200** all 5 slugs; member CEO **409** preserved | **CLOSED** |
| **J-HRM-INT-02** | Employee → contracts by `employee_id` | FAIL (**500** QA-02) | **200** `HRM-CON-200`; jest corroboration | **CLOSED** |
| **G-INT-04** | HRM scope parity (list vs get-by-id) | GWC (static PASS; SA P0 extended) | QA-02 BE-02 **CLOSED** + integrity **0 gaps** reaffirmed | **CLOSED** (HRM static audit) |
| **J-HRM-INT-05** | 4-tab slug sweep `holding` 0×409 | DEFER (blocked by INT-SW-02) | employees/contracts/insurance/attendance all **200** | **CLOSED** (API L2.5) |
| **INT-SW-02** | Defect alias | P1 OPEN | Same as AC-INT-SW-02 | **CLOSED** |
| **INT-CON-500** | Defect alias | P2 OPEN | Same as J-HRM-INT-02 | **CLOSED** |

### Reaffirmed from prior waves (unchanged)

| ID | Status |
|----|--------|
| **G-INT-01** FE mock sweep | **CLOSED** (QA-02) |
| **G-INT-07** SRS delta W1 | **CLOSED** (governance) |
| **J-HRM-01/02** API cross-nav | **PASS** (W1 + QA-02) |
| **J-HRM-INT-01** requisitions list→detail | **PASS** (QA-02) |

---

## GO WITH CONDITIONS — remaining register

| ID | Class | QC status | Owner | Condition / trigger |
|----|-------|-----------|-------|-------------------|
| **G-INT-03** | Cardinality / bridge table | **OPEN** | **ba-data** + **dev-be** | XBOS **4** `group-member-units` vs HRM **5** `GROUP_MEMBER_SLUGS`; bridge table §3.3 BA-D; extra UUID slugs informational — acceptable UAT; **block PROD** until bridge PASS |
| **G-INT-06** | Cross-module FK journeys | **GWC (partial)** | **dev-be** + **qa** | **J-HRM-INT-03/04** not executed; **INT-01/02/05** API PASS only — full **01..05** browser L2.5 + FK depth before program exit |
| **SA P0-1** | XBOS legal-entity GET IDOR | **OPEN** | **dev-be** | `assertJwtMayReadLegalEntityPartition` on `getLegalEntityById` |
| **SA P0-2** | HRM employee restore cross-scope | **OPEN** | **dev-be** | `resolveHrmListScope` + `assertResourceInHrmScope` on restore |
| **SA P0-3** | HRM catalog-sync company id | **OPEN** | **dev-be** | `resolveHrmSettingsCatalogCompanyId` on catalog-sync controller |
| **SA P0-4** | HRM settings batch GET unscoped | **OPEN** | **dev-be** | Scope filter on `batches/:batchId` |
| **G-INT-05** | UI company switcher E2E | **GWC** | **dev-fe** + **qa** | API path unblocked post BE-03; browser combobox E2E **not** re-run QA-03 |
| **G-INT-08** | Stale embed iframe | **GWC** | **dev-fe** + **qa** | CC iframe blank intermittent (QA-02 class) |

### Process conditions (non-product)

| ID | Note | Owner |
|----|------|-------|
| **C-INTQC-01** | QA pack verify **2/8** on QA-03 — normalize `work_item_id` header + `## Residual` | **qa** |
| **GWC-INT-01** | hrm-api not in default `pnpm dev` | **devops** |
| **GWC-INT-03** | Probe scripts cap `page_size` at **100** | **qa** |

---

## L2.5 journey coverage (U19)

| Journey | Tested R2 | Verdict |
|---------|-----------|---------|
| **J-HRM-01/02** API list→detail | Prior + reaffirmed | **PASS** |
| **J-HRM-INT-01** requisitions | QA-02 | **PASS** |
| **J-HRM-INT-02** employee→contracts | QA-03 | **PASS** — **CLOSED** |
| **J-HRM-INT-03** | No | **OPEN** — G-INT-06 |
| **J-HRM-INT-04** | No | **OPEN** — G-INT-06 |
| **J-HRM-INT-05** 4-tab slug sweep | QA-03 API | **PASS** — **CLOSED** (API; browser optional GWC) |
| **AC-INT-SW-02** operating slug filter | QA-03 | **PASS** — **CLOSED** |

**U19 concurrence:** R2 closes API-layer INT switcher + contracts FK defects. **Cannot** claim full **G-INT-06** or program exit without INT-03/04 + SA P0 closure + G-INT-03 bridge.

---

## Classification

| Finding | ENV vs PRODUCT |
|---------|----------------|
| L0 stack | **PRODUCT OK** |
| Operating slug **409** → **200** (BE-03) | **PRODUCT CLOSED** |
| Contracts `employee_id` **500** → **200** | **PRODUCT CLOSED** |
| XBOS 4 vs HRM 5 slugs | **PRODUCT (documented seed)** — G-INT-03 |
| SA P0-1..4 outside integrity script | **PRODUCT SECURITY** — open |
| Pack format 2/8 | **PROCESS** |

---

## Reopen triggers

- Group CEO operating slug query returns **409** with JWT `main`
- `GET contracts-insurance/contracts?employee_id=` returns **500**
- Member CEO receives **200** on group operating slug (`holding`, etc.)
- `verify:hrm:xbos-integrity` exit **≠ 0** or scope_parity gaps **> 0**
- PROD promotion while **G-INT-03** bridge or **SA P0-1..4** open

---

## Delta vs QC-01 (`qc-p1-prod-int-gate-20260607.md`)

| Register row | QC-01 | QC R2 |
|--------------|-------|-------|
| **AC-INT-SW-02 / G-INT-05 API** | OPEN | **CLOSED** |
| **J-HRM-INT-02** | Deferred | **CLOSED** |
| **J-HRM-INT-05** | Deferred | **CLOSED** (API) |
| **G-INT-04** | GWC | **CLOSED** (HRM static) |
| **G-INT-03** | OPEN | **OPEN** (GWC) |
| **G-INT-06** | OPEN partial | **GWC partial** (3/5 API) |
| **SA P0-1..4** | Under G-INT-04 extended | **OPEN** explicit GWC |

---

## Handoff packet

**completion_report:** QC **P1-PROD-INT-QC-03** R2 — **GO WITH CONDITIONS (reduced)** localhost U32 after QA-03: **AC-INT-SW-02**, **J-HRM-INT-02**, **G-INT-04 CLOSED**; **J-HRM-INT-05** API CLOSED. **GWC:** **G-INT-03** bridge, **G-INT-06** full journeys, **SA P0-1..4**, **G-INT-05** browser E2E, **G-INT-08** stale embed, **C-INTQC-01** pack format. **NOT Phase 1 DONE / NOT PROD / NOT integrity program exit.**

**next_owner:** **pm**

**next_dispatch_prompt:**

```text
PM — Intake P1-PROD-INT-QC-03 R2 PASS_TO_PM (GO WITH CONDITIONS reduced localhost U32).

Closed: AC-INT-SW-02, J-HRM-INT-02, G-INT-04, J-HRM-INT-05 API.
Open GWC: G-INT-03 bridge, G-INT-06 full J-HRM-INT-01..05, SA P0-1..4.

Dispatch (parallel max 2):
1) dev-be P1-PROD-INT-BE-04 — Close SA P0-1..P0-4 per docs/program/governance/p1-prod-int-sa-01-20260607.md §5.2; G-INT-03 reconciliation script or documented bridge seed; evidence docs/qa/evidence/p1-prod-int-be-04-20260607.md; ack_status READY_FOR_QA.
2) qa P1-PROD-INT-QA-04 — J-HRM-INT-03/04 API L2.5 + optional G-INT-05 browser switcher E2E + G-INT-08 iframe retest; pack verify 8/8; evidence docs/qa/evidence/p1-prod-int-qa-04-20260607.md; ack_status PASS_TO_PM.

Do NOT update SERVICE_READINESS PROD columns or claim Phase 1 DONE / integrity program exit.
```

**evidence_path:** `docs/qa/evidence/qc-p1-prod-int-gate-r2-20260607.md`

**ack_status:** **PASS_TO_PM**
