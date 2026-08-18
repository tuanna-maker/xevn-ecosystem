# SA-U71-HRM-CO-HC-DESIGN-01 — Physical DB_DESIGN + API_DESIGN (Company headcount)

| Field | Value |
|-------|--------|
| **work_item_id** | `SA-U71-HRM-CO-HC-DESIGN-01` |
| **lane** | governance · U71 physical design write |
| **date** | 2026-07-27 |
| **change_mode** | ADD |
| **ack_status** | **PASS_TO_PM** |
| **gate** | `.cursor/rules/spec-db-api-design-gate.mdc` · OS `_vibe-team-os/13` §3.4.11.F / **F.1** |
| **cwd** | `C:\xevn-ecosystem` |

---

## 1. Deliverables (created)

| Artifact | Path | F.1 / physical |
|----------|------|----------------|
| **DB_DESIGN** | `docs/hrm/DB_DESIGN_HRM_CO_HC.md` | Plane B `employees.company_id` slug; indexes; dual-plane note; `ref_srs` UC-HRM-CO-01 / FR-HRM-CO-HC-01 |
| **API_DESIGN** | `docs/hrm/API_DESIGN_HRM_EMPLOYEES_SUMMARY.md` | `GET /api/hrm/employees/summary` — **Mục đích** · **Nghiệp vụ xử lý** · **Tham chiếu bước SRS** (Diễn biến #4–6) · DTO↔cột · errors · `by_company[]` · **cấm LE UUID** |
| TechSpec pointer | `docs/hrm/TECHSPEC.md` §19 header | ADD physical slice paths (discoverability; no rewrite of §19 body) |

**must_keep verified:** industry pair untouched (`DB_DESIGN_HRM_COMPANY_DISPLAY.md` · `API_DESIGN_HRM_COMPANY_LIST.md`); dual-plane doctrine preserved.

**forbidden verified:** no `apps/**` code; no wipe of existing design files.

---

## 2. F.1 checklist (API_DESIGN)

| Field | Present |
|-------|---------|
| Mục đích | ✅ card/cột NV + Dashboard SoT |
| Nghiệp vụ xử lý | ✅ scope, slug filter, zero-fill, anti-UUID |
| Tham chiếu bước SRS | ✅ UC-HRM-CO-01 Diễn biến #4 «GET employees summary…» · #5 «total và by_company» · #6 UI bind |
| DTO ↔ cột DB | ✅ `by_company[].company_id` → `employees.company_id` TEXT slug |
| Errors | ✅ 401/409/5xx → FE «—»; empty workforce → 0 |
| Cấm LE UUID as Plane B key | ✅ normative |

---

## 3. Spec alignment (facts)

| Source | Used |
|--------|------|
| Gap scan P0 row | `docs/qa/evidence/sa-u71-spec-gap-scan-01-20260727.md` §2.1 headcount |
| TECHSPEC §19 | Plane A/B · API contract · FE bind · error taxonomy |
| SRS UC-HRM-CO-01 | sequenceDiagram + AC-CO-EMP-01..06 |
| DATA_LINKAGE control | R2 dual-plane · §3 BE/FE contract |
| OpenAPI | `EmployeeSummary.by_company` enum slugs |
| Runtime schema | `EmployeesService.ensureSchema` TEXT `company_id` + scale indexes |

---

## 4. Residual (not this wave)

| Item | Owner |
|------|-------|
| Browser UF-HRM-CO-HC regression (U65) using new designs | **qa** |
| FE bind residual if still stub/`null\|\|0` | **dev-fe** (only if QA FAIL) |
| BE scope_parity / missing `by_company` on live | **dev-be** (only if L1 FAIL) |
| Next U71 P0 writes: Settings catalogs · Leave | **pm** → sa |
| G-RULE-11 / `docs/tech-spec/` bootstrap | Still OPEN (path convention) |

---

## 5. Handoff

### completion_report

**Closed:** U71 physical designs for Company headcount dual-plane — `DB_DESIGN_HRM_CO_HC.md` (Plane B slug keys, indexes, anti-join LE UUID, `ref_srs`) + `API_DESIGN_HRM_EMPLOYEES_SUMMARY.md` (F.1 triad on `GET …/employees/summary`, `by_company[]` aggregation, SRS Diễn biến steps, errors «—»). TECHSPEC §19 points to physical slices. Industry pair preserved.

**Residual:** QA browser UF-HRM-CO-HC against designs; Settings/Leave U71 write waves still MISSING; no apps/** changes this wave.

### next_owner

`pm`

### next_dispatch_prompt

```text
work_item_id: QA-U71-HRM-CO-HC-REGRESSION-01
role: qa
lane: execution · U65 zero-seed · browser-only
entry_criteria:
  - L0 qc:dev-stack PASS (hrm-api :28001 + portal)
  - read_first (ordered):
      1. docs/hrm/API_DESIGN_HRM_EMPLOYEES_SUMMARY.md
      2. docs/hrm/DB_DESIGN_HRM_CO_HC.md
      3. docs/hrm/TECHSPEC.md §19
      4. docs/hrm/SRS.md UC-HRM-CO-01 / AC-CO-EMP-01..06
      5. docs/program/DATA_LINKAGE_BE_FE_QA_CONTROL.md §3–§4
exit_criteria:
  - UF-HRM-CO-HC evidence block filled (persona ceo@xe.vn · /command-center/hrm/company)
  - Network: GET /api/hrm/employees/summary?company_id=main → 200; by_company.length=5; no LE UUID keys/query
  - Card + cột Số NV bind by_company / total; fail → «—»; F5 giữ số
  - AC-CO-EMP-01..06 verdict; matrix Dev8088 update if applicable
  - cấm: pnpm seed:* · PASS chỉ probe
evidence_path: docs/qa/evidence/qa-u71-hrm-co-hc-regression-01-YYYYMMDD.md
ack_status: PASS_TO_PM | FAIL_TO_PM (pm_dispatch_hint → dev-fe/dev-be)

Parallel (governance, max remaining quota): continue U71 P0 writes
  SA-U71-HRM-SETTINGS-CATALOG-DESIGN-01 · SA-U71-HRM-LEAVE-DESIGN-01
```

### ack_status

**PASS_TO_PM**

### evidence_path

`docs/qa/evidence/sa-u71-hrm-co-hc-design-01-20260727.md`

### pm_dispatch_hint

`QA-U71-HRM-CO-HC-REGRESSION-01` (browser headcount) · next design writes `SA-U71-HRM-SETTINGS-CATALOG-DESIGN-01` · `SA-U71-HRM-LEAVE-DESIGN-01`
