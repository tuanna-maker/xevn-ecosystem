# Evidence — DOC-ENT-API-01

| Field | Value |
|-------|--------|
| **work_item_id** | `DOC-ENT-API-01` |
| **role** | sa (governance) |
| **date** | 2026-08-03 |
| **deliverable** | `docs/brand-new-documents-20270801/API_CONTRACT_NEW.md` **v1.1** |
| **ack_status** | `PASS_TO_PM` |
| **next_owner** | pm (intake) · optional **qc** docs gate · **ba-data** spot co-review DTO residual |

---

## spec_read_ack

| Artifact | Sections / use | Version note |
|----------|----------------|--------------|
| `DB_DESIGN_NEW.md` | §1.1–1.3 conventions/alias · §3–5 tables · §6 FR→table · gaps D-* | **v1.1 PASS** (`doc-ent-db-01.md`) |
| `docs/qa/evidence/doc-ent-db-01.md` | residuals API · physical names | intake |
| `docs/qa/evidence/doc-ent-ts-01.md` | §4 FR API×Diễn biến map · module TS-WF…TS-MOB-OFF | **v1.1 evidence** — disk `TECH_SPEC_NEW.md` **drift EN stub** (D-TS-DRIFT-01) |
| `TECH_SPEC_NEW.md` (disk) | §4 not usable as lean v1.1 | **drift** — paths lấy Nest + evidence TS |
| `SRS_NEW.md` (disk) | expected §3.2 eleven deep FRs | **drift EN stub** — Diễn biến working SoT §0.4 API_CONTRACT + Nest CODE-MEMORY + evidence SRS/TS/DB |
| `docs/qa/evidence/doc-ent-srs-01.md` | P0 FR list · HRM-21 #4–5 · H01 #8 · embed/mobile AC | cited |
| Nest controllers (READ-ONLY) | `workflow-engine` · `config-sync` · `auth` · `employees` · `attendance` leave · `payroll` · `contracts-insurance` · `decisions` · `catalog-sync` · `auth/mobile` · `idempotency.middleware` | path truth |
| OS `13` §F.1 | Mục đích · Nghiệp vụ · bước SRS · DTO↔cột · error | applied per endpoint |
| `no_prompt_echo` | Client body: no pipeline chat | **true** on API_CONTRACT narrative |

---

## Coverage — 11 P0 FR × F.1

| FR-UC | Endpoints (spine) | F.1 complete |
|-------|-------------------|--------------|
| B03 | WF instances/tasks complete/reject/detail (+ definitions phụ) | Yes |
| B04 | config-sync publish/apply · catalog-sync pull/get | Yes |
| H01 | employees POST/GET/GET:id/PATCH/archive/restore/summary | Yes |
| H03 | leave-balance · leave-requests CRUD-approve/reject | Yes |
| H04 | periods create/process/close · payslips/periods list | Yes · SM 3-state honest |
| HRM-21 | same GET list/detail employees + summary | Yes · scope_parity |
| HRM-25 | contracts list/get/post · insurance list/post | Yes · Q-INS-01 residual product |
| HRM-27 | decisions list/post/get/patch/delete (+ files) | Yes · live-empty honesty |
| M01 | xbos auth login/select/me · hrm mobile login/select/refresh | Yes |
| M03 | same leave paths (mobile AC cited) | Yes |
| M06 | Idempotency-Key middleware contract | Yes · no new table |

---

## ba-data co-review checklist (SA self-check DTO↔column)

| # | Check | Result |
|---|-------|--------|
| 1 | Alias TechSpec logic → physical §1.3 used (no `tenants`/`users`/`payslips` bare) | **PASS** |
| 2 | `employees` typed columns + `custom_fields` keys for CCCD/DOB/salary | **PASS** map · residual typed columns D-EMP-JSON-01 |
| 3 | Leave DTO snapshots (`employee_code/name`) ↔ `leave_requests` | **PASS** |
| 4 | Balance unique `(company_id,employee_id,leave_type,balance_year)` | **PASS** |
| 5 | Payroll period status only draft/processed/closed | **PASS** (no fake 6-step columns) |
| 6 | Payslip amounts ↔ `gross_amount`/`deduction_amount`/`net_amount` | **PASS** |
| 7 | Contracts/insurance physical tables | **PASS** |
| 8 | Decisions: `employee_name` required; soft-delete gap noted | **PASS** / D-DEC-SOFT-01 |
| 9 | Auth tables `xbos_portal_user` / membership / tenant_registry | **PASS** |
| 10 | M06 no invented `idempotency_keys` table | **PASS** |

### Mismatch / residual for ba-data (optional spot)

| ID | Issue | Severity | Owner |
|----|-------|----------|-------|
| **R-API-DTO-DEC-01** | DTO `decision_date` / `reason` không có cột 1:1 trên `hr_decisions` — map service → `effective_date`/`signing_date`/`notes`/`content` cần ba-data xác nhận runtime | P2 | ba-data |
| **R-API-CAT-ENV-01** | Success code pull HRM catalog (`HRM-SET-201` vs module-specific) — xác nhận envelope khi FE wire | P3 | ba-data / qa |
| **R-API-EMP-ARCHIVE-01** | Exact success code archive/restore — document “runtime-stable”; confirm vs OpenAPI nếu có | P3 | ba-data |

**SA verdict self-check:** không có mismatch P0 chặn SoT; P2/P3 ghi residual — **không** block PASS_TO_PM.

---

## Deliverable checklist (exit)

| # | Criteria | Status |
|---|----------|--------|
| 1 | Document control + version 1.1 | **PASS** |
| 2 | Group by FR / module + portal proxy short | **PASS** |
| 3 | Per endpoint: METHOD path · 4 F.1 · DTO↔columns · errors | **PASS** |
| 4 | Auth/scope once | **PASS** §0 |
| 5 | Out-of-scope deferred | **PASS** §11 |
| 6 | Lean P0 only (no Nest encyclopedia) | **PASS** |
| 7 | No edit forbidden paths / apps/** | **PASS** |

---

## Residual

| Residual | Owner | Note |
|----------|-------|------|
| Restore `SRS_NEW.md` + `TECH_SPEC_NEW.md` v1.1 on disk | PM / sa / ba-process | **D-SRS-DRIFT-01** · **D-TS-DRIFT-01** — API dùng working Diễn biến §0.4 |
| Q-INS-01 FE insurance list | Product / BA | Bảng + API GET insurance đã SoT |
| D-EMP-JSON-01 typed CCCD/DOB/salary | Future BE | API maps JSONB keys |
| D-PAY-SM-01 6-step vs 3 status | Kept honest in §5 | |
| D-DEC-SOFT-01 `deleted_at` | Optional density | |
| R-API-DTO-DEC-* / CAT-ENV / ARCHIVE codes | ba-data spot | Non-blocking |
| QC docs gate NEW pack | qc | After PM intake |

**Does not** claim Phase 1 DONE / e2e_pass / PROD-READY / Dev unlock.

---

## completion_report

**Closed:** Upgraded `API_CONTRACT_NEW.md` to lean physical API SoT **v1.1** for all eleven P0 FRs with OS 13 §F.1 (Mục đích · Nghiệp vụ · bước SRS · DTO↔cột vật lý DB v1.1 · stable errors); auth/scope once; Nest path drift documented; ba-data co-review self-check with P2/P3 residuals only.

**Residual:** SRS/TechSpec disk restore; Q-INS-01 product; JSONB employee fields; payroll SM honesty already documented; optional ba-data spot on decision_date mapping & catalog pull envelope codes; QC docs gate.

---

## next_dispatch_prompt (copy-ready)

```text
work_item_id: DOC-ENT-QC-DOCS-01 (or PM intake DOC-ENT-API-01)
role: qc (docs gate) — after pm bus INTAKE
Mission: Gate NEW pack triad physical readiness — DB_DESIGN_NEW v1.1 + API_CONTRACT_NEW v1.1 F.1 coverage for FR-UC-B03,B04,H01,H03,H04,HRM-21,HRM-25,HRM-27,M01,M03,M06. Verify evidence doc-ent-db-01 + doc-ent-api-01. Flag D-SRS-DRIFT-01 / D-TS-DRIFT-01 (SRS_NEW + TECH_SPEC_NEW disk stub vs evidence v1.1). No apps/**. No Phase 1 DONE claim. Optional parallel: ba-data spot-confirm R-API-DTO-DEC-01 decision_date mapping.

read_first:
1. docs/brand-new-documents-20270801/API_CONTRACT_NEW.md v1.1
2. docs/qa/evidence/doc-ent-api-01.md
3. docs/brand-new-documents-20270801/DB_DESIGN_NEW.md v1.1
4. docs/qa/evidence/doc-ent-db-01.md
5. docs/qa/evidence/doc-ent-ts-01.md (disk TECH_SPEC may drift)

exit: QC GO/GWC on docs pack with residual list; PASS_TO_PM; recommend restore SRS/TS v1.1 if still stub on disk.
```

**evidence_path:** `docs/qa/evidence/doc-ent-api-01.md`  
**ack_status:** `PASS_TO_PM`
