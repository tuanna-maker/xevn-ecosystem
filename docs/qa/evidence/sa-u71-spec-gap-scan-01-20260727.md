# SA-U71-SPEC-GAP-SCAN-01 — Rescan physical DB_DESIGN + API_DESIGN (U71)

| Field | Value |
|-------|--------|
| **work_item_id** | `SA-U71-SPEC-GAP-SCAN-01` |
| **from_role** | `pm` (reclaim Claude LANE B · U71) |
| **to_role** | `sa` |
| **lane** | governance |
| **date** | 2026-07-27 |
| **gate** | `.cursor/rules/spec-db-api-design-gate.mdc` · OS `_vibe-team-os/13` §3.4.11.**F** / **F.1** |
| **index** | `docs/tech-spec/README.md` |
| **prior TM** | `docs/qa/evidence/tm-u71-physical-backlog-close-01-20260727.md` |
| **ack_status** | **PASS_TO_PM** |
| **verdict** | **CLOSED / no gap** — U71 listed physical F.1 backlog empty |

> **Note:** This file **supersedes** the early-day scan snapshot in the same path (then: 1 pair + open P0 backlog). Do not use the old §2 MISSING table for dispatch.

---

## 1. Executive verdict

| Decision | Result |
|----------|--------|
| TechSpec modules in U71 README §2 **missing** physical `DB_DESIGN_*` and/or `API_DESIGN_*` | **NONE** |
| Index COMPLETE F.1 pairs | **21** (14 HRM incl. IM-01 N/A-DB + 7 XBOS) |
| On-disk `Test-Path` canonical pairs | **21/21 PASS** |
| Thin pointers under `docs/tech-spec/` | **42/42 PASS** (21 DB + 21 API) |
| F.1 markers (UTF-8: Mục đích · Nghiệp vụ xử lý · Bước SRS / Diễn biến) | **21/21 PASS** |
| README §3 listed backlog open rows | **0** (all DONE / struck) |
| Align with TM-U71-PHYSICAL-BACKLOG-CLOSE-01 | **YES** — option (a) confirmed |
| Next SA physical-design WI | **NOT required** |
| Phase1 / PROD / `:8088` | **NOT claimed** |
| Admin / Fleet GWC reopen | **NOT opened** (no cause) |

**Summary:** Rescan confirms U71 scanned physical path is **complete**. `SA-U71-SPEC-GAP-SCAN-01` → **CLOSED / no gap**. Soft OpenAPI / DTO / runtime deepen remain **execution residuals** — not missing F.1 files.

---

## 2. Prioritized backlog (physical F.1)

| Slice | Path gap | Severity | Owner | Action |
|-------|----------|----------|-------|--------|
| *(empty)* | — | — | — | **No SA design WI** |

### 2.1 Explicit non-gaps (by design / covered by sibling)

| TechSpec FR / surface | Why **not** a U71 missing-pair |
|-----------------------|--------------------------------|
| FR-HRM-01 health · FR-HRM-BOOT-01 env | No physical table — TechSpec §16.5 / §17.1 |
| FR-HRM-SCOPE-01..03 | Cross-cutting resolver — Auth/Tenant + list APIs cite |
| FR-HRM-IM-01 preview | Pair COMPLETE — `DB_DESIGN_HRM_IMPORT_PREVIEW` **N/A table** + API F.1 |
| FR-HRM-11 service_requests | Twin cite in Operations pair (OP-04); full CRUD deepen = execution soft |
| FR-HRM-12 inbox | Fanout cited from Leave / Admin out-of-scope note; **not** in closed §3 list — optional future ADD only if PM expands F.1 inventory (Info) |
| AT records grid | Companion in ATT sheet pair; MOB cites ATT/Leave — no wipe / no duplicate pack |
| G-DB-05 leftover tables (`advance_requests`, …) | Orphan vs khách FR body — ba-docs leftover catalog; **≠** U71 F.1 path reopen |

### 2.2 Execution residuals (NOT SA physical reopen)

| Class | Sev | Owner | Note |
|-------|-----|-------|------|
| OpenAPI deepen / Nest DTO | P2–P3 | `dev-be` | Separate work_item when sponsor opens execution |
| Soft product gaps (G-OP-01/02, G-PR-03, G-SCOPE-01 on-touch, …) | P1–P2 | Dev/QA | Runtime / AC — files already exist |
| U72 HOLD_DEPLOY GWC local | Condition | `pm` | Orthogonal to U71 path close |

---

## 3. Audit method & evidence

### 3.1 Index vs disk (README §2)

| # | Slice | Canonical DB | Canonical API | Status |
|---|-------|--------------|---------------|--------|
| 1 | Company industry | `docs/hrm/DB_DESIGN_HRM_COMPANY_DISPLAY.md` | `docs/hrm/API_DESIGN_HRM_COMPANY_LIST.md` | COMPLETE |
| 2 | CO-HC dual-plane | `docs/hrm/DB_DESIGN_HRM_CO_HC.md` | `docs/hrm/API_DESIGN_HRM_EMPLOYEES_SUMMARY.md` | COMPLETE |
| 3 | Settings catalogs | `docs/hrm/DB_DESIGN_HRM_SETTINGS_CATALOG.md` | `docs/hrm/API_DESIGN_HRM_SETTINGS_CATALOG.md` | COMPLETE |
| 4 | Leave | `docs/hrm/DB_DESIGN_HRM_LEAVE.md` | `docs/hrm/API_DESIGN_HRM_LEAVE.md` | COMPLETE |
| 5 | Employees | `docs/hrm/DB_DESIGN_HRM_EMPLOYEES.md` | `docs/hrm/API_DESIGN_HRM_EMPLOYEES.md` | COMPLETE |
| 6 | Attendance sheets | `docs/hrm/DB_DESIGN_HRM_ATT_SHEET.md` | `docs/hrm/API_DESIGN_HRM_ATT_SHEET.md` | COMPLETE |
| 7 | Contracts + INS | `docs/hrm/DB_DESIGN_HRM_CONTRACTS_INS.md` | `docs/hrm/API_DESIGN_HRM_CONTRACTS_INS.md` | COMPLETE |
| 8 | Recruitment | `docs/hrm/DB_DESIGN_HRM_RECRUITMENT.md` | `docs/hrm/API_DESIGN_HRM_RECRUITMENT.md` | COMPLETE |
| 9 | Payroll | `docs/hrm/DB_DESIGN_HRM_PAYROLL.md` | `docs/hrm/API_DESIGN_HRM_PAYROLL.md` | COMPLETE |
| 10 | W2 slice (PF/DEC/META/MOB) | `docs/hrm/DB_DESIGN_HRM_W2_SLICE.md` | `docs/hrm/API_DESIGN_HRM_W2_SLICE.md` | COMPLETE |
| 11 | Operations | `docs/hrm/DB_DESIGN_HRM_OPERATIONS.md` | `docs/hrm/API_DESIGN_HRM_OPERATIONS.md` | COMPLETE |
| 12 | Fleet | `docs/hrm/DB_DESIGN_HRM_FLEET.md` | `docs/hrm/API_DESIGN_HRM_FLEET.md` | COMPLETE |
| 13 | Admin | `docs/hrm/DB_DESIGN_HRM_ADMIN.md` | `docs/hrm/API_DESIGN_HRM_ADMIN.md` | COMPLETE |
| 14 | Import preview | `docs/hrm/DB_DESIGN_HRM_IMPORT_PREVIEW.md` | `docs/hrm/API_DESIGN_HRM_IMPORT_PREVIEW.md` | COMPLETE (N/A DB) |
| 15 | XBOS Org/Legal | `docs/xbos/DB_DESIGN_XBOS_ORG_LEGAL.md` | `docs/xbos/API_DESIGN_XBOS_ORG_LEGAL.md` | COMPLETE |
| 16 | XBOS Shareholders | `docs/xbos/DB_DESIGN_XBOS_SHAREHOLDERS.md` | `docs/xbos/API_DESIGN_XBOS_SHAREHOLDERS.md` | COMPLETE |
| 17 | XBOS Catalog gov | `docs/xbos/DB_DESIGN_XBOS_CATALOG_GOV.md` | `docs/xbos/API_DESIGN_XBOS_CATALOG_GOV.md` | COMPLETE |
| 18 | XBOS Workflow | `docs/xbos/DB_DESIGN_XBOS_WORKFLOW.md` | `docs/xbos/API_DESIGN_XBOS_WORKFLOW.md` | COMPLETE |
| 19 | XBOS RACI/RBAC/CC | `docs/xbos/DB_DESIGN_XBOS_RACI_RBAC.md` | `docs/xbos/API_DESIGN_XBOS_RACI_RBAC.md` | COMPLETE |
| 20 | XBOS KPI | `docs/xbos/DB_DESIGN_XBOS_KPI.md` | `docs/xbos/API_DESIGN_XBOS_KPI.md` | COMPLETE |
| 21 | XBOS Auth/Tenant | `docs/xbos/DB_DESIGN_XBOS_AUTH_TENANT.md` | `docs/xbos/API_DESIGN_XBOS_AUTH_TENANT.md` | COMPLETE |

**Counts:** **21** COMPLETE F.1 pairs · pointers present · §3 open = **0**.

### 3.2 TechSpec matrices vs physical

| Root | Check |
|------|--------|
| `docs/hrm/TECHSPEC.md` §14 / §16 / §17.1 / §19 / §20 | Spine FR mapped; U71 pointers present on payroll/CO-HC/industry; matrices alone ≠ physical (gate respected) |
| `docs/xbos/TECHSPEC.md` §14.1–14.17 | Auth/Tenant + KPI cite physical pairs; W1/W2 FR covered by §2 XBOS pairs |
| Matrices inside TECHSPEC | **Do not** substitute for missing files — **and** no missing files for listed slices |

### 3.3 must_keep / cấm this WI

- **No wipe** of any COMPLETE pair content
- **No** invent full designs (backlog empty — nothing to write)
- **No** `apps/**` · **no** Phase1 / PROD / `:8088` claim
- **No** reopen Admin/Fleet GWC without new cause
- **No** invent import staging table

---

## 4. Counts (program metric)

| Metric | Value |
|--------|-------|
| README §2 COMPLETE rows | **21** |
| Canonical pairs on disk | **21/21** |
| HRM pairs (`docs/hrm/`) | **14** (incl. IM-01 N/A-DB) |
| XBOS pairs (`docs/xbos/`) | **7** |
| §3 open physical pointers | **0** |
| Missing F.1 path (listed U71) | **0** |
| G-RULE-11 (scanned U71 F.1) | **CLOSED** (TM + this rescan) |

---

## 5. completion_report

**Closed:** `SA-U71-SPEC-GAP-SCAN-01` rescan — verified index **21** COMPLETE F.1 pairs on disk (+ pointers + F.1 markers); README §3 listed backlog **empty**; TechSpec HRM/XBOS matrices cross-checked — **no** remaining missing physical `DB_DESIGN_*` / `API_DESIGN_*` for U71 scanned slices; aligns with `TM-U71-PHYSICAL-BACKLOG-CLOSE-01`; work item **CLOSED / no gap**.

**Residual:** Execution-only soft gaps (OpenAPI/DTO/runtime AC) and optional Info (dedicated inbox F.1 pack if PM expands inventory later) — **not** SA design dispatch now. U72 HOLD_DEPLOY unchanged. No Phase1/PROD claim.

**Artifacts:** this evidence (supersedes early MISSING backlog in same path) · README §3 status line refreshed to CLOSED rescan.

---

## 6. Handoff

| Field | Value |
|-------|--------|
| **ack_status** | **PASS_TO_PM** |
| **next_owner** | `pm` |
| **evidence_path** | `docs/qa/evidence/sa-u71-spec-gap-scan-01-20260727.md` |
| **pm_dispatch_hint** | **idle** on U71 physical-design lane — do **not** dispatch SA design WI; optional later execution WI separate |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PM-U71-SPEC-GAP-SCAN-INTAKE-01
from_role: pm
to_role: pm (intake / idle)
lane: governance
entry_criteria:
  - SA-U71-SPEC-GAP-SCAN-01 PASS_TO_PM
  - evidence: docs/qa/evidence/sa-u71-spec-gap-scan-01-20260727.md
  - verdict: CLOSED / no gap · index 21 COMPLETE F.1 pairs · §3 empty
  - TM-U71-PHYSICAL-BACKLOG-CLOSE-01 already CLOSED G-RULE-11 for scanned U71
exit_criteria:
  1) Bus INTAKE: U71 physical F.1 gap scan CLOSED — no SA design WI
  2) Do NOT dispatch SA wipe / invent staging / Admin-Fleet GWC reopen
  3) Keep HOLD_DEPLOY on U72 GWC local; NOT Phase1/PROD/:8088
  4) If sponsor opens execution later: separate work_item_ids (OpenAPI/DTO/soft AC) — not U71 path
evidence_path: docs/qa/evidence/sa-u71-spec-gap-scan-01-20260727.md
cấm: apps/** · seed · invent import staging · Phase1/PROD claim · SA reopen soft P2 without cause
```
