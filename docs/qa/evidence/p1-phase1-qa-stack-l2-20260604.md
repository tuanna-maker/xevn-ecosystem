# QA evidence — P1-PHASE1-QA-STACK-L2-01 (2026-06-04)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-PHASE1-QA-STACK-L2-01` |
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **executed_at** | 2026-06-04 |
| **environment** | HTTPS pilot `https://14-225-217-232.nip.io` |
| **account** | `ceo@xe.vn` / `Xevn@2026` (group CEO, `company_id=main`) |
| **matrix SoT** | `docs/qa/PILOT_BUSINESS_FLOW_MATRIX.md` |
| **journey SoT** | `docs/program/PROGRAM_JOURNEY_MAP.md` |
| **closes** | QC GWC **C-STACKQC-02** (L2 + L2.5 on pilot for group CEO slice) |
| **parent slice** | `P1-PHASE1-QC-STACK-L0-01` / `p1-phase1-qc-stack-l0-20260604.md` |

**Explicitly NOT claimed:** Phase 1 DONE · PROD-READY · full program QC GO · mobile L2.5 (J-MOB-03..05).

---

## Executive verdict

| Layer | Scope | Verdict |
|-------|--------|---------|
| **L2** | P-CC-01..09 (group CEO, nip.io API via portal proxy) | **PASS** — probe **23/23** |
| **L2.5** | J-CC-03 + J-HRM-01..07 (in-matrix) | **PASS** — probe **7/7** |
| **L2.5 shell** | J-CC-01, J-CC-02 (journey map) | **PASS** — mapped to probe `P-CC-01-login`, `P-CC-02` |
| **L2.5 cat-gov** | J-HRM-08 (P-CC-09) | **PASS** — `P-CC-09` inbox **200** `XBOS-CAT-212` |
| **Gap fill** | P-CC-03 catalog-sync CONNECTED | **PASS** — `GET /api/hrm/catalog-sync/status?company_id=main` **200**, `state=connected` |
| **C-STACKQC-02** | L2/L2.5 stack promotion condition | **CLOSED** (this wave) |

**Overall:** **PASS_TO_PM** — group CEO Command Center + HRM embed matrix and J-* audit **PASS** on pilot HTTPS.

---

## Reuse (valid without re-browser)

| Artifact | Reused for | Fresh run this wave |
|----------|------------|---------------------|
| `docs/qa/evidence/p1-ex-qa-https-p-cc-01-jwt-01-20260604.md` | Same probe script + account; JWT **86400** | Yes — full probe re-executed |
| `docs/qa/evidence/p1-phase1-qa-stack-l0-20260604.md` | L0/L1 stack slice parent | Referenced only — L2 out of L0 scope |
| `docs/qa/evidence/p1-phase1-qa-member-ceo-crud-20260604.md` | Member negatives / `du-lich.ceo` | Probe `member-kpi-negative` **409** (re-run) |
| `docs/qa/evidence/p1-phase1-qa-crud-journey-03-20260604.md` | Member J-HRM-01/02 CRUD | Out of scope — group CEO only |

---

## A) Independent L2 + L2.5 probe (primary)

```powershell
$env:PORTAL_DEV_URL='https://14-225-217-232.nip.io'
node scripts/tmp-p1-ex-qa-https-01-probe.mjs
```

**Exit code:** `0`  
**Timestamp:** 2026-06-04 (QA workstation)

**Stdout (full):**

```text
P1-EX-QA-HTTPS-01 probe — https://14-225-217-232.nip.io

PASS  P-CC-01-login HTTP 201 XBOS-AUTH-200
PASS  P-CC-01-jwt
PASS  P-CC-02 HTTP 200 XBOS-TENANT-200
PASS  P-CC-03 HTTP 200 HRM-EMP-200
PASS  P-CC-04a HTTP 200 HRM-SET-200
PASS  P-CC-04b HTTP 200 HRM-CON-200
PASS  J-CC-03 HTTP 200 XBOS-KPI-202 — KPI rollup companyId=holding + x-company-id main
PASS  P-CC-04c HTTP 200 XBOS-KPI-202
PASS  P-CC-04
PASS  P-CC-05 HTTP 200 HRM-CON-200
PASS  P-CC-06 HTTP 200 HRM-REC-200
PASS  P-CC-07 HTTP 200 HRM-ATT-200
PASS  P-CC-08 HTTP 200 HRM-PAY-200
PASS  P-CC-09 HTTP 200 XBOS-CAT-212
PASS  J-HRM-01
PASS  J-HRM-02
PASS  J-HRM-03
PASS  J-HRM-04
PASS  J-HRM-05
PASS  J-HRM-06
PASS  J-HRM-07
PASS  J-XBOS-01-tasks HTTP 200 XBOS-WF-203
PASS  member-kpi-negative HTTP 409 SCOPE_CONTEXT_MISMATCH — du-lich.ceo@xe.vn — expect 403/409 on group rollup

=== L2 checks: 23/23 PASS ===
=== L2.5 journeys: 7/7 PASS ===
```

---

## B) Matrix row audit — P-CC-* (explicit IDs)

| ID | Route / check | Matrix criterion | Verdict | Probe / note |
|----|---------------|------------------|---------|--------------|
| **P-CC-01** | `/login` → CC | JWT **86400**, redirect path | **PASS** | `P-CC-01-login`, `P-CC-01-jwt` |
| **P-CC-02** | settings / member units | `group-member-units` **200**, ≥1 row | **PASS** | `P-CC-02` |
| **P-CC-03** | `/command-center/hrm/employees` | Sync CONNECTED; employees **200**; no 409/54321 | **PASS** | `P-CC-03` + gap **B)** `catalog-sync` **connected** |
| **P-CC-04** | `/command-center/hrm/contracts` | catalogs + contracts **200**; no rollup 409 | **PASS** | `P-CC-04a/b/c`, `P-CC-04` |
| **P-CC-05** | insurance | Nest **200**; no 409 load | **PASS** | `P-CC-05` |
| **P-CC-06** | recruitment | requisitions **200** | **PASS** | `P-CC-06` |
| **P-CC-07** | attendance | records **200**; no 409 | **PASS** | `P-CC-07` |
| **P-CC-08** | payroll | payslips **200** | **PASS** | `P-CC-08` |
| **P-CC-09** | catalog governance inbox | inbox **200** `XBOS-CAT-212`; no 409 | **PASS** | `P-CC-09` |

---

## C) Journey audit — J-* (explicit IDs)

| J-ID | Maps from | Steps (API L2.5) | Verdict | Evidence |
|------|-----------|------------------|---------|----------|
| **J-CC-01** | P-CC-01 | Login **201** → session | **PASS** | `P-CC-01-login` |
| **J-CC-02** | P-CC-02 | `group-member-units` **200** | **PASS** | `P-CC-02` |
| **J-CC-03** | CC dashboard KPI | rollup `companyId=holding` + `x-company-id: main` **200** | **PASS** | `J-CC-03` |
| **J-HRM-01** | P-CC-04 | contract row → `GET /employees/:id?company_id=main` **200** | **PASS** | scope parity |
| **J-HRM-02** | P-CC-03 | list row → employee detail **200** | **PASS** | scope parity |
| **J-HRM-03** | P-CC-04 | contract id + employee_id present | **PASS** | drawer/modal data path |
| **J-HRM-04** | P-CC-05 | insurance row → employee **200** | **PASS** | linked NV |
| **J-HRM-05** | P-CC-06 | requisitions + candidates **200** | **PASS** | recruitment detail APIs |
| **J-HRM-06** | P-CC-07 | attendance row → employee **200** | **PASS** | [prior R6](p1-ex-qa-https-j-hrm-06-01-r6-20260529.md) concurred |
| **J-HRM-07** | P-CC-08 | payslip row → employee **200** | **PASS** | payroll scope |
| **J-HRM-08** | P-CC-09 | inbox load (approve E2E seed optional) | **PASS** | inbox **200**; write approve not re-run |
| **J-XBOS-01** | partial | workflow tasks **200** | **PASS** | `J-XBOS-01-tasks` (partial per journey map) |

**Out of scope (not promoted):** **J-MOB-01..05** (mobile device FAIL — `PROGRAM_JOURNEY_MAP.md`); browser iframe click UX (matrix notes P2 deferred).

---

## D) Gap fill — P-CC-03 catalog-sync

Probe covers `employees` **200** only. Matrix requires **Sync CONNECTED**.

```text
GET https://14-225-217-232.nip.io/api/hrm/catalog-sync/status?company_id=main
HTTP 200 — state connected
GET .../api/hrm/employees?company_id=main&page_size=5 → HTTP 200
```

---

## E) C-STACKQC-02 closure

| Condition | Prior (QC stack L0) | After this wave |
|-----------|---------------------|-----------------|
| **C-STACKQC-02** | OPEN — L2/L2.5 not audited for stack promotion | **CLOSED** — P-CC-01..09 + J-CC-01..03 + J-HRM-01..08 PASS on nip.io (`ceo@xe.vn`) |

**C-STACKQC-01** remains **CLOSED** per `p1-phase1-qa-stack-l0-20260604.md` § R1 (unchanged).

---

## Residual / not promoted

| ID | Item | Owner | Notes |
|----|------|-------|-------|
| R-L2-01 | Phase 1 program / UC matrix closure | pm / qc | **NOT Phase 1 DONE** |
| R-L2-02 | PROD-READY / security deploy evidence | devops / qc | Unchanged 🔴 |
| R-L2-03 | Mobile J-MOB-03..05 device L2.5 | dev-mobile / qa | HRM-AUTH-001 — separate wave |
| R-L2-04 | Browser iframe P-CC UI click paths | qa (optional) | API L2.5 sufficient for stack slice; UI deferred per matrix HTTPS note |
| R-L2-05 | J-XBOS-02 catalog publish → HRM sync E2E | dev-be | 🟡 partial on journey map |
| R-L2-06 | Member CEO browser L2.5 (C-RBACQC-04) | qa | API member negatives PASS; see `p1-phase1-qa-crud-journey-03-20260604.md` |

---

## completion_report

- **Closed:** **C-STACKQC-02** — audited `PILOT_BUSINESS_FLOW_MATRIX.md` P-CC-01..09 and `PROGRAM_JOURNEY_MAP.md` J-CC-01..03, J-HRM-01..08 on HTTPS pilot for `ceo@xe.vn`; probe exit **0** (**23/23** L2, **7/7** L2.5); catalog-sync **connected** gap filled.
- **Closed:** Stack slice L2/L2.5 promotion gate for group CEO Command Center + HRM embed (API path).
- **Open:** Phase 1 DONE, PROD, mobile J-MOB-03..05, full QC program GO, optional browser iframe L2.5.

## next_owner

`pm`

## next_dispatch_prompt

```
work_item_id: P1-PHASE1-QA-STACK-L2-01
from_role: pm
to_role: qc
entry_criteria: QA PASS_TO_PM — evidence docs/qa/evidence/p1-phase1-qa-stack-l2-20260604.md; C-STACKQC-02 closed (L2 23/23 + L2.5 7/7 on https://14-225-217-232.nip.io, ceo@xe.vn); parent C-STACKQC-01 already closed.
exit_criteria: QC concurs C-STACKQC-02 CLOSED on stack slice; update p1-phase1-qc-stack-l0-20260604.md condition table; ack PASS_TO_PM with GWC only for residuals R-L2-01..06; do NOT mark Phase 1 DONE or PROD-READY.
evidence_path: docs/qa/evidence/p1-phase1-qc-stack-l2-20260604.md (QC to create) referencing QA pack above.
ack_status: PASS_TO_PM
```

Alternate PM: dispatch governance **technical-manager** narrow audit scope_parity if promoting UAT-READY beyond stack — mobile and program gates still open.

## evidence_path

`docs/qa/evidence/p1-phase1-qa-stack-l2-20260604.md`

## ack_status

**PASS_TO_PM**
