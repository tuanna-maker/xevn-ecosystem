# QC — P1-PROD-INT-QC-01 (HRM↔XBOS Integrity W1 localhost gate)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-PROD-INT-QC-01` |
| **from_role** | qc |
| **to_role** | pm |
| **program** | `HRM-XBOS-INTEGRITY` (U39) |
| **date** | 2026-06-07 |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | This file |

---

## Verdict

**GO WITH CONDITIONS** — **localhost U32 integrity baseline (W1)** promotable for:

- W1 governance chain (SA + BA-P + BA-D) published and aligned
- Persona isolation matrix: group CEO rollup **1107** NV / **5/5** operating slugs; member CEO **18** NV / `main` only; group APIs **403/409**
- L0 stack + `verify:hrm:xbos-integrity` **exit 0** (cardinality PASS; static HRM scope-parity **0 gaps**)
- J-HRM-01/02 API list→detail scope parity **PASS** (probe JSON)
- 1OFFICE runtime incident **CLOSED** (grep + prior DQ audit); recruitment dashboard post-reload clean

**Explicitly NOT:**

- **NOT Phase 1 DONE**
- **NOT PROD-READY / NOT PROD cutover**
- **NOT** `HRM-XBOS-INTEGRITY` program exit (W2–W5 open)
- **NOT** J-HRM-INT-* cross-module journeys tested this wave
- **NOT** company switcher (G-INT-05) or full mock sweep (G-INT-01)

---

## Evidence chain audited

| Wave | Artifact | Role | ack_status |
|------|----------|------|------------|
| W1 | `docs/program/governance/p1-prod-int-sa-01-20260607.md` | sa | PASS_TO_PM |
| W1 | `docs/program/governance/p1-prod-int-ba-p-01-20260607.md` | ba-process | PASS_TO_PM |
| W1 | `docs/program/governance/p1-prod-int-ba-d-01-20260607.md` | ba-data | PASS_TO_PM |
| W2 | `docs/qa/evidence/p1-prod-int-be-01-20260607.md` | dev-be | READY_FOR_QA |
| W4 | `docs/qa/evidence/p1-prod-int-qa-01-20260607.md` | qa | PASS_TO_PM |
| Probe | `docs/qa/evidence/p1-prod-int-qa-01-probe-20260607.json` | qa | — |

---

## Layer B — evidence pack (process)

```bash
pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-prod-int-qa-01-20260607.md
# exit 1 — 1/8 checks (work_item_id line format)
```

**Adjudication:** Process **GO WITH CONDITIONS** — pack incomplete on `work_item_id` header convention only; QA body contains full `work_item_id`, persona matrix, G-INT table, commands, residual. **Not** product NO-GO. **C-INTQC-01:** QA normalize pack format before next integrity QC regate.

---

## Layer C — QC independent spot-check (2026-06-07)

| Command | Result | Classification |
|---------|--------|----------------|
| `pnpm run qc:dev-stack` | **exit 0** — hrm-api + xbos-api + portal **200** | PRODUCT OK |
| `pnpm run verify:hrm:xbos-integrity` | **exit 0** — cardinality PASS; scope_parity **0 gaps**; P0=0 P1=0 | PRODUCT OK |
| Probe JSON cross-check | `summary.pass=true`; member isolation `pass=true` | Concurs QA |

**Note:** QA evidence cited **2 P1 scope gaps** (decisions/payroll get-by-id) at probe time; QC spot on same script reports **gaps: 0** — concurs BE evidence `p1-prod-int-be-01-20260607.md`. Residual **SA P0-1..P0-4** (XBOS legal GET, restore, catalog-sync, settings batch) remain **outside** integrity script scope → tracked under **G-INT-04 extended**.

---

## Promoted (localhost U32 only)

| Slice | Criteria | Status |
|-------|----------|--------|
| **UC-HRM-SCOPE-01** rollup API | Group CEO ≥1000 NV, 5 slugs | **PASS** (1107) |
| **UC-HRM-SCOPE-02** member isolation | 403 GMU; 18 vs 1107; no group slugs | **PASS** |
| **BR-INT-01/02** persona scope | Probe + member CRUD probe OK | **PASS** |
| **BR-INT-05** cardinality script | `verify:hrm:xbos-integrity` exit 0 | **PASS** (documented Plane A≠B drift) |
| **J-HRM-01/02** L2.5 API | List→GET **200**, slug match | **PASS** |
| **G-INT-07** SRS delta | SRS §1.1 + §15; BA-P trace | **CLOSED** (governance W1) |
| **1OFFICE / recruitment mock** | Runtime + grep | **CLOSED** |

---

## Deferred / open — G-INT-* register (owners)

| ID | Class | QC status | Owner | Condition / expiry |
|----|-------|-----------|-------|-------------------|
| **G-INT-01** | FE mock ≠ API | **OPEN (P2)** | **dev-fe** | GPS HCM (`Attendance.tsx`), `defaultSkillsData`, attendance chart const arrays — before W3 QC regate |
| **G-INT-02** | Label join (`Khác`) | **GWC** | **dev-fe** + **dev-be** | Operating-unit display names + chart resolver; re-browser J-HRM-05 after FE-01 |
| **G-INT-03** | Cardinality drift | **OPEN (documented)** | **dev-be** + **ba-data** | XBOS **4** member tenants vs HRM **5** operating slugs; bridge table §3.3 BA-D; extra UUID slugs informational — acceptable UAT; block **PROD** claim until bridge PASS |
| **G-INT-04** | Scope parity | **GWC** | **dev-be** | HRM static audit **PASS** (QC spot); **SA P0-1..P0-4** still open (legal GET IDOR, restore, catalog-sync, settings batch) — close before PROD |
| **G-INT-05** | UI company switcher | **OPEN** | **dev-fe** + **qa** | UC-HRM-SCOPE-03 / AC-INT-SW-* — W3 FE wave; not tested W1 |
| **G-INT-06** | Cross-module FK | **OPEN (partial)** | **dev-be** + **qa** | J-HRM-INT-01..05 not executed; persona counts OK only |
| **G-INT-07** | SRS/BRD lag | **GWC CLOSED (W1)** | **ba-docs** | Client HTML SRS sync remains — **ba-docs** after PM promotes |
| **G-INT-08** | Stale embed bundle | **GWC** | **dev-fe** | First-paint stale bundle (`D-HRM-DQ-REC-GWC-01` class); post-reload OK |

### Process conditions (non-product)

| ID | Note | Owner |
|----|------|-------|
| **C-INTQC-01** | QA pack verify **1/8** — fix `work_item_id` header for next gate | **qa** |
| **GWC-INT-01** | hrm-api not in default `pnpm dev` — L0 initial FAIL until manual start | **devops** |
| **GWC-INT-02** | RBAC probe pagination edge (contracts crossEmployee=5) — same class AC-FID-14 | **dev-be** (P2) |
| **GWC-INT-03** | `page_size>100` → **400** — probe scripts must cap at 100 | **qa** |

---

## L2.5 journey coverage (U19)

| Journey set | Tested | Verdict |
|-------------|--------|---------|
| J-HRM-01/02 API cross-nav | Yes | **PASS** |
| J-HRM-INT-01..05 | No | **Deferred** — W4+ after FE switcher |
| J-CC-02 browser L2.5 | No | Out of W1 slice |

**U19 concurrence:** W1 gate is **persona + cardinality baseline**, not full L2.5 program — GWC acceptable with explicit J-HRM-INT deferral.

---

## Classification

| Finding | ENV vs PRODUCT |
|---------|----------------|
| Initial L0 FAIL (hrm-api down) | **ENV** — resolved; documented GWC-INT-01 |
| XBOS 4 vs HRM 5 slugs | **PRODUCT (documented seed)** — not persona leak |
| Mock grep hits | **PRODUCT P2** — non-blocking localhost W1 |
| Pack format 1/8 | **PROCESS** |

---

## Reopen triggers

- Member CEO sees group slug or group API **200**
- `verify:hrm:xbos-integrity` exit **≠ 0**
- `1OFFICE` or banned fiction returns in production HRM paths without waiver
- PROD promotion attempted while **G-INT-03** bridge or **G-INT-05** switcher open

---

## Handoff packet

**completion_report:** QC gate **P1-PROD-INT-QC-01** — **GO WITH CONDITIONS** for localhost U32 W1 integrity baseline: governance W1 closed; persona matrix PASS; cardinality script PASS; J-HRM-01/02 PASS. **G-INT-01/03/05/06** remain open with owners; **G-INT-04** GWC (HRM static PASS, SA P0-1..4 extended open); **NOT Phase 1 DONE / NOT PROD**.

**next_owner:** **pm**

**next_dispatch_prompt:**

```text
PM — Intake P1-PROD-INT-QC-01 PASS_TO_PM (GO WITH CONDITIONS localhost U32 W1).

Dispatch W2–W3 execution (parallel max 2):
1) dev-be P1-PROD-INT-BE-02 — Close SA P0-1..P0-4 (legal-entity GET IDOR, employee restore, catalog-sync company id, settings batch GET); extend company_slug_map display_name per ba-d-01 §5; evidence docs/qa/evidence/p1-prod-int-be-02-20260607.md; ack_status READY_FOR_QA.
2) dev-fe P1-PROD-INT-FE-01 — G-INT-01 mock sweep (GPS/skills/attendance arrays); G-INT-05 shared company switcher all embed tabs; G-INT-02 label join from operating-units/slug map; entry SRS §15 + sa-01 §3.2; exit AC-INT-SW-01..03 grep + browser J-HRM-INT-05 smoke; ack_status READY_FOR_QA.

Then qa P1-PROD-INT-QA-02 — J-HRM-INT-01..05 L2.5 + regate G-INT-04 after BE-02; pack verify 8/8.

Do NOT update SERVICE_READINESS PROD columns or claim Phase 1 DONE.
```

**evidence_path:** `docs/qa/evidence/qc-p1-prod-int-gate-20260607.md`

**ack_status:** **PASS_TO_PM**
