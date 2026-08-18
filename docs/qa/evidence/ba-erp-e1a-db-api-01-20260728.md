# Evidence — BA-ERP-E1A-DB-API-01 (MD-BIND Layer A physical design)

| Field | Value |
|-------|--------|
| **work_item_id** | `BA-ERP-E1A-DB-API-01` |
| **from_role** | pm |
| **to_role** | ba-data |
| **lane** | governance G1 E1-A — U71 DB_DESIGN + API_DESIGN |
| **date** | 2026-07-28 |
| **ack_status** | **PASS_TO_PM** |
| **cấm verified** | No `apps/**` edits · no migration apply · no seed |

---

## 1. Inputs read

| # | Artifact | Used for |
|---|----------|----------|
| 1 | `docs/program/FIDELITY_PROGRAM_DISPATCH.md` Cohort E1-A | DoD FREE_TEXT→`*_key` + BE assert |
| 2 | `docs/hrm/DB_DESIGN_HRM_SETTINGS_CATALOG.md` | L0→L1→L2a · `job_titles` soft-ref §10 |
| 3 | `docs/hrm/API_DESIGN_HRM_SETTINGS_CATALOG.md` | Picker GET items (no new catalog API) |
| 4 | `docs/hrm/DB_DESIGN_HRM_EMPLOYEES.md` | `job_title_key` + `HRM-EMP-JOB-TITLE` pattern |
| 5 | `docs/hrm/DB_DESIGN_HRM_W2_SLICE.md` §B | `hr_decisions` baseline |
| 6 | `docs/hrm/DB_DESIGN_HRM_CONTRACTS_INS.md` | CI must_keep + gap FE position |
| 7 | Evidence MD/ERP matrices 20260728 | FREE_TEXT cluster WH/DEC/JP/CI |
| 8 | Runtime schema (read-only) | `employee_work_timeline` · `job_postings` · `headcount_proposals` · decisions DDL |

---

## 2. Deliverables created / APPEND

| Path | Mode | Content |
|------|------|---------|
| `docs/hrm/DB_DESIGN_HRM_MD_BIND_E1A.md` | **ADD** | Physical ADD `position_key` (+ signer/dept keys) for WH · Decisions · JobPostings · Headcount · Contracts; VAL matrix; DDL draft **not applied** |
| `docs/hrm/API_DESIGN_HRM_MD_BIND_E1A.md` | **ADD** | F.1 per endpoint: Mục đích · Nghiệp vụ · bước SRS · DTO↔DB · error codes |
| `docs/hrm/DB_DESIGN_HRM_SETTINGS_CATALOG.md` §10 | **APPEND** | Consumer rows → E1-A keys |
| `docs/hrm/DB_DESIGN_HRM_W2_SLICE.md` §B | **APPEND** | `position_key` / `signer_position_key` |
| `docs/hrm/DB_DESIGN_HRM_CONTRACTS_INS.md` §1.4 | **APPEND** | CI position key soft-refs + FE/BE schema gap note |

---

## 3. Exit criteria checklist

| # | Criterion | Status |
|---|-----------|--------|
| 1 | DB_DESIGN + API_DESIGN E1A with Mục đích / Nghiệp vụ / bước SRS per endpoint | **PASS** |
| 2 | Cover WH `position_key`, Decisions, JobPostings, Contracts position keys | **PASS** (+ Headcount Lane B) |
| 3 | Evidence this file | **PASS** |
| 4 | APPEND merge; PASS_TO_PM; Dev only after SRS+this+SA ack | **PASS** (handoff) |
| 5 | No apps/** · no migration apply | **PASS** |

---

## 4. Naming / assert summary (for SA + Dev)

| Consumer | Persist key | Snapshot | Assert code |
|----------|-------------|----------|-------------|
| Work timeline | `position_key` | `position` | `HRM-WH-POS-KEY` |
| Decisions | `position_key` · `signer_position_key` | TEXT cols | `HRM-DEC-POS-KEY` · `HRM-DEC-SIGNER-POS-KEY` |
| Job postings | `position_key` | `position` | `HRM-JP-POS-KEY` |
| Headcount proposals | `position_key` | `position_name` | `HRM-HCP-POS-KEY` |
| Employee contracts | `position_key` · `signer_position_key` | TEXT cols | `HRM-CON-POS-KEY` · `HRM-CON-SIGNER-POS-KEY` |
| Pattern (must_keep) | `employees.job_title_key` | — | `HRM-EMP-JOB-TITLE` |
| Pattern (must_keep) | JD `position_code` | `position_name` | `HRM-REC-JD-POS` |

Catalog family: **`job_titles`** (+ alias `positions`). Do **not** name timeline key `job_title_key`.

---

## 5. Residuals (not closed by this WI)

| Residual | Owner next |
|----------|------------|
| SA ack / TechSpec cite E1-A designs | `sa` |
| SRS delta Diễn biến WH/CI position picker if ba-process gaps | `ba-process` (only if SA flags) |
| Dev-BE `ensureSchema` + assert + DTO | `dev-be` after SA ack |
| Dev-FE CatalogSearchPicker bind | `dev-fe` after SA ack |
| Dept name→`department_key` P1 | same cohort or follow-on |
| CI FE bag beyond position (probation/file) | CI UX / E2 |
| Payroll component_type | E2 — out of E1-A |

---

## 6. Handoff

```yaml
work_item_id: BA-ERP-E1A-DB-API-01
from_role: ba-data
to_role: pm
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/ba-erp-e1a-db-api-01-20260728.md
completion_report: |
  Closed: U71 physical DB_DESIGN + API_DESIGN for E1-A MD-BIND Layer A
  (WH/DEC/JP/HCP/CI position_* keys, F.1 endpoints, APPEND merge to Settings/W2/CI).
  Residual: SA ack before Dev; no apps/migration in this WI.
next_owner: sa
next_dispatch_prompt: |
  work_item_id: SA-ERP-E1A-ACK-01
  from_role: pm
  to_role: sa
  lane: governance G1 E1-A
  read_first:
    - docs/hrm/DB_DESIGN_HRM_MD_BIND_E1A.md
    - docs/hrm/API_DESIGN_HRM_MD_BIND_E1A.md
    - docs/qa/evidence/ba-erp-e1a-db-api-01-20260728.md
    - docs/hrm/DB_DESIGN_HRM_EMPLOYEES.md (job_title_key pattern)
    - docs/hrm/TECHSPEC.md §17.6 Lane B lock
  exit_criteria:
    - ACK or delta: naming position_key vs job_title_key; error code table; Lane B must_keep
    - Confirm Dev may proceed on ensureSchema+assert without FR-RC-01 rebind
    - Evidence docs/qa/evidence/sa-erp-e1a-ack-01-YYYYMMDD.md
    - PASS_TO_PM; then PM may DISPATCH D-BE-ERP-E1A-POS-KEY-01 + D-FE-ERP-E1A-PICKER-01
  cấm: apps/** implement in SA WI; apply migration; seed
```

---

## completion_report

**Closed:** E1-A MD-BIND Layer A physical designs published — DB + API F.1 for Work History `position_key`, Decisions position/signer keys, JobPostings/Headcount keys, Contracts position/signer keys; APPEND merge to Settings/W2/CI designs; evidence filed. No product code or migration applied.

**Residual:** SA ack (`SA-ERP-E1A-ACK-01`) required before Dev-BE/FE; dept_key P1 and CI non-position FE bag remain follow-on.

**next_owner:** `sa` (then `pm` → `dev-be` + `dev-fe` after ack)

**ack_status:** `PASS_TO_PM`

**evidence_path:** `docs/qa/evidence/ba-erp-e1a-db-api-01-20260728.md`
