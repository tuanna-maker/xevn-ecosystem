# QC Gate — DOC-ENT-QC-DOCS-01

| Field | Value |
|-------|--------|
| **work_item_id** | `DOC-ENT-QC-DOCS-01` |
| **role** | qc (governance) |
| **date** | 2026-08-03 |
| **scope** | Enterprise lean pack — 5 `*_NEW.md` only under `docs/brand-new-documents-20270801/` |
| **prior** | Member PASS: BRD/SRS/TS/DB/API · PM HOTFIX `DOC-ENT-RESTORE-01` (15:33) |
| **ack_status** | `PASS_TO_PM` |
| **verdict** | **GO WITH CONDITIONS** |

---

## Gate checklist (independent audit)

| # | Criterion | Result | Proof |
|---|-----------|--------|-------|
| 1 | Pack SoT = only 5 `*_NEW.md` | **PASS** (clutter flagged) | SoT: `BRD_NEW` · `SRS_NEW` · `TECH_SPEC_NEW` · `DB_DESIGN_NEW` · `API_CONTRACT_NEW`. **NON-SoT clutter:** `*_VN.md`, `gen_*.py`, `_build_brd.py`, `_gen_brd.py`, `_sec3.py`, `build_brd.py`, `test_*`, `scratchpad.txt`, `B.txt`, `S7_KICKOFF.md` — residual cleanup optional |
| 2 | BRD not EN stub; §9 HRM completeness | **PASS** | Header VI · **v1.2** · `XEVN/BRD-XEVN-OS-001` · ~16.7 KB · `## 9. Yêu cầu hoàn thiện nghiệp vụ Nhân sự` (embed 8, BH, list→detail, mobile, stub 27, trace) |
| 3 | SRS FR-UC-H01 + AC-HRM-EMBED + 6-ch | **PASS** | **v1.1** VI · `#### FR-UC-H01` · §3.3 `AC-HRM-EMBED-01..05` · chapters **1–6** (Intro→Overview→Functional→NFR→External UI→BR) |
| 4 | TECH_SPEC `ref_srs` matrix 11 P0 FR | **PASS** | **v1.1** · header `ref_srs: SRS_NEW.md v1.1` · §1 table rows B03/B04/H01/H03/H04/HRM-21/25/27/M01/M03/M06 · §4.1–4.11 API×Diễn biến |
| 5 | DB_DESIGN physical + Nest name alignment | **PASS** | **v1.1** · Nest `ensureSchema` · no Prisma · §1.3 alias logic→physical · PK/FK/index tables · ERD · FR→table §6 |
| 6 | API_CONTRACT F.1 for P0 | **PASS** | **v1.1** · ≥40 `Mục đích` blocks · per FR: Mục đích / Nghiệp vụ / bước SRS / DTO↔cột · honest payroll 3-status |
| 7 | Trace pack ↔ member evidence | **PASS** | `doc-ent-brd-01` · `doc-ent-srs-01` · `doc-ent-ts-01` · `doc-ent-db-01` · `doc-ent-api-01` all present; versions align with disk after restore |
| 8 | Drift D-SRS / D-TS | **CLOSED** | Bus `DOC-ENT-RESTORE-01` 15:33 + QC disk verify 15:34: BRD/SRS/TS are VI lean (not EN stubs). DB/API were never wiped |

---

## Restore verification (mandatory)

| File | Size (approx) | Version / language | Stub EN? |
|------|---------------|--------------------|----------|
| `BRD_NEW.md` | 16 707 B · 15:34 | **v1.2** VI | **No** |
| `SRS_NEW.md` | 39 145 B · 15:34 | **v1.1** VI · FR-UC-* | **No** |
| `TECH_SPEC_NEW.md` | 15 269 B · 15:34 | **v1.1** · `ref_srs` | **No** |
| `DB_DESIGN_NEW.md` | 26 435 B · 15:27 | **v1.1** physical | **No** (untouched by wipe) |
| `API_CONTRACT_NEW.md` | 31 871 B · 15:31 | **v1.1** F.1 | **No** (untouched by wipe) |

Markers confirmed: `FR-UC-H01`, `AC-HRM-EMBED`, `ref_srs`, Nest alias table, F.1 tables.

---

## Classification

| Class | Items |
|-------|--------|
| **ENV** | N/A — docs-only gate; no stack required |
| **PROCESS** | Folder NON-SoT generators/stubs remain; API meta still *mentions* pre-restore drift (stale footnote) |
| **PRODUCT / SPEC residual** | Q-INS-01 · D-EMP-JSON-01 · D-PAY-SM-01 · D-DEC-SOFT-01 · R-API-DTO-DEC-01 (P2) |
| **PROGRAM** | **NOT** Phase 1 product DONE · **NOT** e2e_pass · **NOT** PROD-READY |

---

## Residuals (bounded GWC)

| ID | Severity | Owner | Note |
|----|----------|-------|------|
| **C-DOC-META-DRIFT-01** | P2 | sa (hygiene) | `API_CONTRACT_NEW.md` header/§0 still says disk SRS/TS «EN stub» / `D-SRS-DRIFT-01` — **false after RESTORE**. Patch footnotes only (no rewrite spine). |
| **C-DOC-CLUTTER-01** | P3 | pm / devops optional | `gen_*.py`, `*_VN.md`, `test_*`, scratch — **not SoT**; delete or quarantine; **cấm** re-run generators over pack 5 |
| **C-DOC-ECHO-01** | P3 | ba-process optional | Client SRS/TS still use slang «mồ côi» (OS 13 §3.8–3.9); BRD body clean |
| **Q-INS-01** | Product | BA / Product | Insurance list FE completeness vs waiver — docs SoT ready; blocks «UC-HRM-25 đủ» product claim only |
| **D-EMP-JSON-01** | Spec/BE later | sa / dev-be | CCCD/DOB/salary in `custom_fields` JSONB — documented honest |
| **D-PAY-SM-01** | Spec honesty | sa (closed in text) | DB 3-status vs SRS multi-step approval — API/DB already honest; no fake columns |
| **D-DEC-SOFT-01** | P3 | ba-data optional | `hr_decisions` thiếu `deleted_at` |
| **R-API-DTO-DEC-01** | P2 | ba-data spot | `decision_date` / `reason` DTO↔column map |
| **D-SRS-DRIFT-01** | — | — | **CLOSED** (RESTORE + QC verify) |
| **D-TS-DRIFT-01** | — | — | **CLOSED** (RESTORE + QC verify) |

---

## Explicit non-claims

- **NOT** Phase 1 product DONE  
- **NOT** UAT-PASS / PROD-READY  
- **NOT** unlock Dev code without sponsor confirm of pack (governance docs gate only)  
- **NOT** waive Q-INS-01 or JSONB typed-column decisions  

---

## Verdict

### **GO WITH CONDITIONS**

**Accepted (bounded):** Enterprise lean pack 5 files as SoT for BRD/SRS/TechSpec/DB/API remaster — Vietnamese client BRD/SRS restored, TechSpec `ref_srs` 11 P0, DB physical Nest-aligned, API F.1 P0 complete; member evidence chain intact; disk drift **CLOSED**.

**Conditions before claiming «docs pack clean GO» (optional hygiene, non-blocking sponsor read):**

1. sa: clear stale drift footnotes in `API_CONTRACT_NEW.md` (`C-DOC-META-DRIFT-01`).  
2. pm: keep generators/`*_VN` out of SoT; optional clutter cleanup (`C-DOC-CLUTTER-01`).  
3. Product residuals (Q-INS-01, JSONB, payroll SM honesty) remain program backlog — **do not** reopen docs NO-GO.

**Reopen → NO-GO if:** any of the 5 `*_NEW.md` regresses to EN stub / wipe; F.1 or `ref_srs` matrix removed; BRD §9 stripped.

---

## completion_report

**Closed:** L3 docs gate `DOC-ENT-QC-DOCS-01` — independent verify of 5-file lean pack + RESTORE success + member evidence trace; drift D-SRS/D-TS **CLOSED**; verdict **GO WITH CONDITIONS**; residuals listed; **no** Phase 1 DONE.

**Residual:** see table (meta drift footnote, clutter, Q-INS-01, JSONB, payroll SM, decision DTO, soft-delete decisions).

---

## next_owner

`pm`

## next_dispatch_prompt

```text
work_item_id: DOC-ENT-PM-CLOSE-01
role: pm
Mission: Intake DOC-ENT-QC-DOCS-01 GO WITH CONDITIONS. Update TEAM_WORKING_NOW / PROJECT_STATUS_REPORT: enterprise lean pack 5 *_NEW.md APPROVED bounded (BRD v1.2 · SRS/TS/DB/API v1.1). State D-SRS-DRIFT-01 + D-TS-DRIFT-01 CLOSED after RESTORE. Do NOT claim Phase 1 product DONE.

Optional same-session (P2 hygiene, not blocking sponsor BRD read):
- Task sa DOC-ENT-API-META-01: remove stale «EN stub / D-SRS-DRIFT» footnotes from API_CONTRACT_NEW.md only (C-DOC-META-DRIFT-01). allowed_paths: API_CONTRACT_NEW.md + evidence.
- Optional clutter quarantine: do not run gen_*.py; *_VN.md / test_* NON-SoT (C-DOC-CLUTTER-01).

Product residuals stay backlog: Q-INS-01 · D-EMP-JSON-01 · D-PAY-SM-01 · R-API-DTO-DEC-01 — not docs NO-GO.

evidence: docs/qa/evidence/doc-ent-qc-docs-01.md
ack: PASS_TO_PM from qc already filed — pm INTAKE + status update.
```

**evidence_path:** `docs/qa/evidence/doc-ent-qc-docs-01.md`  
**ack_status:** `PASS_TO_PM`
