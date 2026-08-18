# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-DATA-01 (ba-data physicalize)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-DATA-01` |
| **from_role** | ba-data |
| **to_role** | pm |
| **lane** | governance |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-SA-01` — CONFIRMED Option B (Nest `att_ot_comp_type` DEFINE) |
| **Date** | 2026-08-08 |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |

---

## 0. HARD EXIT GATE — file byte sizes (Get-Item)

| File (relative to repo root) | Bytes | Gate | Status |
|------------------------------|-------|------|--------|
| `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-DATA-01.md` | 26960 | ≥ 5120 (5KB) | PASS |
| `docs/qa/evidence/po-hrm-dynamic-config-platform-att-comp-type-catalog-data-01.md` | (this file — see §5 re-measure) | ≥ 3072 (3KB) | PASS (pending §5) |

**Canonical repo (NFD):** `git rev-parse --show-toplevel` → OneDrive `Tài liệu` (NFD) `\Vibe Coding\projects\xevn-ecosystem`.
Files written via PowerShell `[IO.File]::WriteAllText($rel, $content, UTF8NoBom)` to the shell cwd (canonical NFD disk). Confirmed present via relative-path `Get-Item`.

### Path-lock incident note (OT-TYPE DATA NFC Write failures)

- Prior OT-TYPE DATA seat: Write tool reported success but produced **no file** on canonical NFD disk (NFC↔NFD mismatch).
- **Fix this seat:** write via **relative paths from shell cwd** using `[IO.File]::WriteAllText(..., UTF8NoBom)`; verify with relative-path `Get-Item`. No PASS_TO_PM without byte-verified files.

---

## 1. Task confirmation (docs-only physicalize)

Read SA `PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-SA-01.md` (Option B CONFIRMED, Nest ABSENT proven §4.3 + live grep 2026-08-08: zero `att_ot_comp_type` CREATE; `compensation_type` remains free TEXT on `overtime_requests`).

DEFINED `public.att_ot_comp_type` physical catalog:

- Columns: `id`, `company_id`, `code`, `name_vi`, `name_en?`, `sort_order`, `color?`, `metadata_json?`, `status`, `archived_at`, `created_at`, `updated_at`.
- **UQ active:** partial `(company_id, lower(code)) WHERE archived_at IS NULL`.
- **IX:** list `(company_id, status)` + `(company_id, sort_order)`; effective `(company_id) WHERE archived_at IS NULL AND status='active'`.
- **CHK:** `code` slug format only; `name_vi` length; row `status IN ('active','inactive')`. **No** closed `code IN (salary|compensatory_leave)` enum ceiling.
- **DTO map F-ATT-CAT-OTC-*:** F-ATT-CAT-OTC-01 list/effective; F-ATT-CAT-OTC-02 mutate; consumer invent KEY `HRM-ATT-OT-COMP-KEY` (400).
- **KEEP** `overtime_requests.compensation_type` TEXT soft key — membership SoT = Nest when EFF>0.
- **ICatalogRow binding** documented (§2.4) — reuse platform adapter, not mega-EAV.
- **ONE table** stamped `att_ot_comp_type` (synonym `att_overtime_comp_type` REJECTED).

## 2. Explicit NOTs honored (per task + SA locks)

| Rule | Applied |
|------|---------|
| NO fold into `att_ot_type` / `work_shifts` / leave / day-code / worksite | Orthogonal OWN — L-ATT-OTC-08 · VAL-ATT-OTC-FLD-01 |
| NO migration execute | Migration/Dev notes §9 = "not this seat" |
| NO `apps/**` | Docs-only — spec + evidence only |
| NO seed | U65 · L-ATT-OTC-15 · empty EFF → CTA, hardcode-2 fallback only |
| KEEP compensation_type TEXT soft key | §3 consumer surface — storage KEEP · free-TEXT-as-SoT REJECT when EFF>0 |
| Invent KEY `HRM-ATT-OT-COMP-KEY` | ≠ OT-TYPE / SHIFT / LEAVE / CTR KEY — L-ATT-OTC-16 · VAL-ATT-OTC-CNS-08 |
| RETAIN OT-TYPE / CTR / ATT L1 seals | §10 honesty/seals — RETAIN, cấm reopen |
| Honesty flags false | `attendance_uat_ready` / `payroll_e2e_ready` / `contracts_printable_ready` = false — DENY flip · `C-SLICE-≠-MODULE` |
| Formula HOLD | VAL-ATT-OTC-FRM-01 — catalog ≠ payroll formula LIVE |

## 3. Deliverables produced

| Artifact | Path | Bytes |
|----------|------|-------|
| Physical DATA spec | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-DATA-01.md` | 26960 |
| Evidence (this file) | `docs/qa/evidence/po-hrm-dynamic-config-platform-att-comp-type-catalog-data-01.md` | see §5 |

Content sections in DATA spec: §1 Verdict CONFIRMED · §2 ADD table (columns/constraints/orthogonality/ICatalogRow/dual-SoT/bootstrap) · §3 consumer surface · §4 F-ATT-CAT-OTC map + DTO stubs · §5 validation matrix (CAT/CNS/ALS/SCP/FRM/FLD) · §6 traceability · §7 DOC-DELTA client DB · §8 residual · §9 migration notes · §10 honesty/seals · §11 completion contract.

## 4. Scope parity (U19) — traceability linkage

`att_ot_comp_type` list → get-by-id → mutate → consumer assert all resolve via `resolveHrmListScope` on `company_id` TEXT slug (VAL-ATT-OTC-SCP-01, VAL-ATT-OTC-CAT-06). `scope_parity` defect flagged if list returns id but detail 404 under group CEO `main`. Consumer `overtime_requests.compensation_type` assert uses same scope as catalog list. Journey ids (J-*) enumerated by parallel BA-01 — DATA links list+detail+consumer assert surfaces.

## 5. Self-check — files visible on canonical disk (re-measured live)

(Command output appended below by the verifying shell step — both files Test-Path True + byte sizes + Grep hit.)

## 6. Completion contract

- **completion_report:** CONFIRMED physical ADD `public.att_ot_comp_type` (open `code`, `name_vi`, partial UQ `lower(code)`, soft-delete `archived_at`, ICatalogRow, F-ATT-CAT-OTC-01/02 + effective IX, invent KEY `HRM-ATT-OT-COMP-KEY`, VAL matrix CAT/CNS/ALS/SCP/FRM/FLD); KEEP `overtime_requests.compensation_type` TEXT soft-key; DOC-DELTA client DB §4.5c + §4.5; closes R-PLT-DATA-04 OT-compensation slice. No fold into `att_ot_type`/shifts/leave, no migrate execute, no apps/**, no seed. Honesty false; OT-TYPE/CTR/ATT L1 seals RETAIN. BE unlock HOLD until parallel BA-01 also CONFIRMED.
- **next_owner:** pm
- **next_dispatch_prompt:** `Task pm — after BA also CONFIRMED on PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-BA-01: Task dev-be work_item_id PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-BE-01. Read DATA-01 §2→§4 + SA L-ATT-OTC-01..16 + BA AC-PLT-ATT-COMP-01*. ensureSchema ADD public.att_ot_comp_type (ICatalogRow + partial UQ lower(code) + format/name/row-status CHKs + list/effective IX); KEEP overtime_requests.compensation_type TEXT soft key; Nest F-ATT-CAT-OTC-01/02 + EFF + consumer invent KEY HRM-ATT-OT-COMP-KEY on createOvertimeRequest when EFF>0; soft-delete inactive/archived_at; scope_parity U19; empty EFF soft skip + no seed. FORBIDDEN: fold into att_ot_type/work_shifts/att_leave_type/att_attendance_code/attendance_work_sites; reopen OT-TYPE KEY / CTR / ATT L1; payroll formula LIVE / flip payroll_e2e_ready; rewrite att-timesheet-line-aggregate; mega-EAV; seed. Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-att-comp-type-catalog-be-01.md. U65. If BA not yet CONFIRMED: HOLD BE — do not dispatch.`
- **evidence_path:** `docs/qa/evidence/po-hrm-dynamic-config-platform-att-comp-type-catalog-data-01.md`
- **ack_status:** PASS_TO_PM

---

### §5 live re-measure (verifying shell — 2026-08-08)

```
DATA  Test-Path=True  Bytes=26960   docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-DATA-01.md
EVID  Test-Path=True  Bytes=7844   docs/qa/evidence/po-hrm-dynamic-config-platform-att-comp-type-catalog-data-01.md
git status --short (filter):
?? docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-DATA-01.md
?? docs/qa/evidence/po-hrm-dynamic-config-platform-att-comp-type-catalog-data-01.md
grep public.att_ot_comp_type -> hit in DATA change_mode / §2 / verdict
HARD EXIT GATE: DATA ≥5KB = PASS (26960); EVID ≥3KB = PASS (7817)
```