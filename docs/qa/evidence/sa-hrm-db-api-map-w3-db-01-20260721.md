# SA-HRM-DB-API-MAP-W3-DB-01 — DB ↔ API ↔ SRS Diễn biến map

| Field | Value |
|-------|-------|
| **work_item_id** | `SA-HRM-DB-API-MAP-W3-DB-01` |
| **from_role** | pm |
| **to_role** | sa |
| **lane** | governance |
| **priority** | P0 |
| **date** | 2026-07-21 |
| **ack_status** | **PASS_TO_PM** |
| **change_mode** | ADD-only |
| **lock** | `docs/program/HRM_SPEC_TRACE_DB_API_CODE_LOCK.md` wave W3-DB |
| **prior** | `docs/qa/evidence/sa-hrm-techspec-align-w3-r2-20260721.md` (44 FR `ref_srs`) |
| **techspec** | `docs/hrm/TECHSPEC.md` **§17** (this wave) · §14/§16 unchanged except pointer via §17 |
| **khách SoT** | `docs/client-delivery/hrm/SRS_HRM_KHACH.md` v3.0-W2c (**44** FR) |
| **schema audit** | Nest `ensureSchema` under `apps/api/hrm-api/src/**` (read-only) — **no Prisma file** |
| **cấm tuân thủ** | wipe · Phase1/PROD · claim 120 UC · `apps/**` patch |

---

## 1. Entry criteria

| Artifact | Result |
|----------|--------|
| W3-R2 §14+§16 | 44/44 FR có `ref_srs` |
| Lock W3-DB | Matrix table↔FR + FK + gap register |
| Schema | Grepped `CREATE TABLE IF NOT EXISTS public.*` across hrm-api services |
| Menu linkage | `HRM_MENU_DATA_LINKAGE_MATRIX.md` used for density/FK intent — not FR invent |

---

## 2. Deliverables

| # | Deliverable | Path / section |
|---|-------------|----------------|
| 1 | TechSpec §17 master matrix Table/Column/FK → FR → Diễn biến # → API | `docs/hrm/TECHSPEC.md` §17.1 |
| 2 | INT spine logical FK chain + soft vs hard | §17.2 |
| 3 | Gap register G-DB-* (orphan / missing FK / leave DDL / dual catalog) | §17.3 |
| 4 | CODE-MEMORY fill order for W4-CM | §17.4 |
| 5 | Architecture option SELECT A | §17.5 |
| 6 | This evidence | this file |

**Không** sửa `apps/**`. **Không** claim 120 UC / Phase1 / PROD.

---

## 3. Audit summary (facts)

| Topic | Finding |
|-------|---------|
| Prisma | **Absent** in hrm-api — DDL = runtime SQL |
| Hard `REFERENCES` | Sparse: payslip→period, recruitment_candidates→requisitions, interviews→candidates, attendance_events→records, performance_evaluations→cycles, some catalog twins |
| Soft `employee_id` | Dominant on contracts, insurance, attendance_records, leave, payslips, metadata, service_requests — **app-enforced** |
| leave_requests | **No CREATE TABLE** in Nest — only ALTER (`attachment_url`, `workflow_instance_id`) → **G-DB-03** |
| Dual recruitment | `recruitment_*` (spine FR) vs `candidates`/`job_postings` (catalog) → **G-DB-04** |
| Orphans vs 44 FR | decisions, fleet, OT/trip, advances, many profile satellites → **G-DB-05/06** |
| ATT sheets | Header-only; no FK to records — **by design** AC-ATT-SHEET (**G-DB-07** Info) |

---

## 4. Coverage

| Check | Count |
|-------|-------|
| Khách FR | 44 |
| §14+§16 rows | 44 |
| §17.1 unique FR refs | **44** (incl. resolver/auth/preview/dashboard rows) |
| Claim 120 UC | **No** |

---

## 5. Gap register (executive)

| Pri | ID | One-liner | Next |
|-----|-----|-----------|------|
| P0 | G-DB-01 | Hire INT-01 thiếu enforce employee link | BE + QA J-HRM-INT-01 |
| P0 | G-DB-02 | Soft FK spine no REFERENCES | Optional migration wave |
| P0/P1 | G-DB-03 | leave_requests DDL ensure missing | BE ensure CREATE + G-AT10-01 |
| P1 | G-DB-04 | Dual recruitment catalogs | Document; CM cấm bind nhầm |
| P1 | G-DB-05/06 | Tables/APIs ngoài 44 FR | ba-docs optional / annex |
| — | §16.9 inherit | G-RC-01 VERIFY, G-AT10-01, G-SCOPE-01, … | existing owners |

---

## 6. Architecture decision

| Option | Verdict |
|--------|---------|
| A — ADD §17 + honest soft-FK + G-DB register | **SELECT** |
| B — Prisma rewrite now | Reject |
| C — Hard FK all employees now | Defer (backfill risk) |
| D — Fake-map orphans into FR | **cấm** |

---

## 7. completion_report

**Closed:**
- TechSpec **§17** published: table/column/FK → `ref_srs` FR → Diễn biến # → API for **44** FR.
- Gap register **G-DB-01..08** + orphan honesty; INT spine diagram.
- W4-CM CODE-MEMORY fill order (§17.4).
- Evidence this file; no apps patch; no Phase1/PROD/120 claim.

**Residual:**
1. BE W4-CM fill CODE-MEMORY P0 paths (§17.4).
2. BE G-DB-01 / G-DB-03 (+ inherited §16.9 P0/P1).
3. Optional ba-data cardinality on soft FK; optional hard-FK migration (G-DB-02).
4. TM/QC may sample §17 vs live DDL on gate W5.

**Not claimed:** Phase 1 DONE · PROD-READY · 120 UC · product UF 🟢 closure.

---

## 8. Handoff

- **next_owner:** `pm` → dispatch **`dev-be`**
- **ack_status:** `PASS_TO_PM`
- **evidence_path:** `docs/qa/evidence/sa-hrm-db-api-map-w3-db-01-20260721.md`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: BE-HRM-CODE-MEMORY-SRS-STEP-01
from_role: pm
to_role: dev-be
lane: execution
priority: P0

## Entry
SA W3-DB PASS: docs/qa/evidence/sa-hrm-db-api-map-w3-db-01-20260721.md
TechSpec: docs/hrm/TECHSPEC.md §17 (matrix) + §14/§16 ref_srs + §17.4 fill order
Lock: docs/program/HRM_SPEC_TRACE_DB_API_CODE_LOCK.md W4-CM
Khách: docs/client-delivery/hrm/SRS_HRM_KHACH.md — Diễn biến # per FR
Template: ~/.cursor/templates/CODE_MEMORY_BLOCK.md
cấm: wipe FR · seed U65 · Phase1/PROD claim · claim 120 UC · bind FR-RC vào job_postings/candidates catalog twin (G-DB-04)

## Job
1. ADD/append @CODE-MEMORY (VI) trên P0 handlers §17.4:
   - recruitment.service/controller (RC-01, INT-01 Diễn biến #7)
   - leave-requests.service + leave-workflow.bridge (AT-10/12/13)
   - attendance-catalog sheets (AT-14 #8–11) — must_keep AC-ATT-SHEET
2. Each block must include: SRS bước Diễn biến #k · FR-… · TechSpec §17.1 / §14|§16
3. Close or ticket G-DB-03: ensure CREATE for leave_requests aligned with INSERT + company_id TEXT parity (coord G-AT10-01 if touching DTO)
4. Do NOT invent hard REFERENCES employees on all soft FKs (G-DB-02 = separate wave)
5. Evidence: docs/qa/evidence/be-hrm-code-memory-srs-step-01-20260721.md
6. ack_status READY_FOR_QA (spot-check CM present) or PASS_TO_PM if only docs/CM with residual G-DB listed
7. next_dispatch_prompt: QA sample 3 FR CM+U65 or Dev P1 employees/contracts/payroll CM fill

entry_criteria: SA §17 present; no Prisma required
exit_criteria: P0 CM blocks + evidence; G-DB-03 status noted; ack handoff complete
```
