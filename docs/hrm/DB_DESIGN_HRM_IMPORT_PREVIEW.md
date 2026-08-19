# DB_DESIGN — HRM Import preview (IM-01) — **N/A · non-persist**

| Field | Value |
|-------|--------|
| **work_item_id** | `SA-U71-HRM-IMPORT-PREVIEW-DESIGN-01` |
| **change_mode** | ADD · preserve_default |
| **ref_srs** | khách `docs/client-delivery/hrm/SRS_HRM_KHACH.md` **§3.32** FR-HRM-IM-01 · UC **HRM-IM-01** |
| **ref_techspec** | `docs/hrm/TECHSPEC.md` **§16.2** row 32 · **§17.1** `*(import preview — no persist)*` |
| **ref_api** | `docs/hrm/API_DESIGN_HRM_IMPORT_PREVIEW.md` |
| **Template** | `_vibe-team-os/templates/TECHSPEC_PHYSICAL_DB_TABLE.md` — **intentionally unused (no table)** |
| **U71** | Physical-design closure for IM-01: document **why no DDL** (not invent persist) |
| **Date** | 2026-07-27 |

> **must_keep:** Do **not** rewrite Admin · Fleet · Operations · W2 · Payroll · Leave · ATT · Employees · XBOS Auth/RACI/WF/catalog-gov/KPI. U65 zero-seed.  
> **Cấm:** invent `import_preview_sessions` / staging tables / draft employee rows for this FR.

---

## 0. Verdict — no physical table

| Question | Answer |
|----------|--------|
| Does FR-HRM-IM-01 require a persist table? | **No.** TechSpec §16.2 / §17.1: *preview payload (no commit)* / *import preview — no persist*. |
| What is the SoT store? | **In-memory** parse + validation result returned in HTTP envelope (`SHEET-200`). |
| When do rows hit DB? | Only on **HRM-IM-02** commit (`POST …/import/commit` → `employees`) — **OUT** of FR-HRM-IM-01 DONE (**G-IM-01 CLOSED**). |
| SRS «bản nháp / mã phiên»? | Khách §3.32 success text — **LOCKED** BA-U71-IM-RESIDUAL-01: ephemeral HTTP payload only; «mã phiên» = **non-goal** IM-01 (**G-IM-SESSION-01 CLOSED**). **Cấm** invent session/staging DDL. |

```text
HCNS upload multipart
        │
        ▼
hrm-api SpreadsheetService.previewEmployeeImport
        │  parse buffer (csv/xlsx) · validate rows
        │  NO INSERT / UPDATE / staging table
        ▼
HTTP SHEET-200  { previewRows, errors, truncated, dryRun, … }
```

---

## 1. Explicit non-goals (DDL)

| Forbidden invent | Why |
|------------------|-----|
| `hrm_import_preview_*` | FR ends at preview; no commit |
| Temp `employees` / draft status | Would fake hồ sơ trước IM-02 |
| Preview session / Redis persist | Not in TechSpec ALIGNED path |
| Catalog snapshot table for preview | Cite Settings / catalog-sync pairs — do not duplicate |

---

## 2. Soft cites (read-only / future commit)

| Artifact | Role for IM-01 |
|----------|----------------|
| `DB_DESIGN_HRM_EMPLOYEES` | Commit target (IM-02) — **cite only**; preview must not write |
| `DB_DESIGN_HRM_SETTINGS_CATALOG` · catalog-sync | Catalog completeness (khách #4) — **OUT** hard-fail IM-01 (**G-IM-CATALOG-01 CLOSED spec**); hard checks on **IM-02** if product requires |
| `DB_DESIGN_HRM_ADMIN` | Privilege plane separate — must_keep |
| Team residual lock | `docs/hrm/SRS_HRM_IM_01_RESIDUAL_TEAM.md` |

---

## 3. Residual (DB / non-persist) — updated BA-U71-IM-RESIDUAL-01

| ID | Sev | Status | Owner | Note |
|----|-----|--------|-------|------|
| **G-IM-01** | Info | **CLOSED** | ba-process | Commit/export = IM-02/IM-03 — not IM-01 DDL |
| **G-IM-SESSION-01** | Info | **CLOSED** | ba-process | No session table / token — non-goal |
| **G-IM-CATALOG-01** | P2 | **CLOSED (spec)** | ba-process | No catalog snapshot table for preview; in-memory only |

**Pointer:** `docs/tech-spec/DB_DESIGN_HRM_IMPORT_PREVIEW.md` → this file.
