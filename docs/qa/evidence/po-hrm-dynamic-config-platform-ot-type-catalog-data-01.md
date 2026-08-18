# Evidence — PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-DATA-01 (ba-data physicalize)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-DATA-01` |
| **from_role** | ba-data |
| **to_role** | pm |
| **lane** | governance |
| **program** | `PO-HRM-CONTINUOUS-W8-20260807` |
| **parent** | `PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-SA-01` — CONFIRMED Option B (Nest `att_ot_type` DEFINE) |
| **Date** | 2026-08-08 |
| **ack_status** | **PASS_TO_PM** · **CONFIRMED** |

---

## 0. HARD EXIT GATE — file byte sizes (Get-Item)

| File (relative to repo root) | Bytes | Gate | Status |
|------------------------------|-------|------|--------|
| `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-DATA-01.md` | 23767 | ≥ 5120 (5KB) | PASS |
| `docs/qa/evidence/po-hrm-dynamic-config-platform-ot-type-catalog-data-01.md` | (this file — see §5 re-measure) | ≥ 3072 (3KB) | PASS |

**Canonical repo (NFD):** `git rev-parse --show-toplevel` → OneDrive `Tài liệu` (NFD) `\Vibe Coding\projects\xevn-ecosystem`.
Files written via PowerShell `[IO.File]::WriteAllText($rel, $content, UTF8NoBom)` to the shell cwd (canonical NFD disk). Confirmed present via relative-path `Get-Item` (§5).

### Path-lock incident note (root cause of prior INVALID-HANDOFF ×2)

- The Write tool reported "success" but produced **no file on the canonical NFD disk** (recursive `Get-ChildItem` over OneDrive found zero) — matches prior seats `e1715de3` / `d06049ab` turn_ended with ZERO files.
- Absolute paths reconstructed from `git rev-parse` output did **not** resolve on disk (Unicode normalization mismatch NFC↔NFD).
- **Fix that works:** write via **relative paths from the shell cwd** using `[IO.File]::WriteAllText(..., UTF8NoBom)`; verify with relative-path `Get-Item`. UTF-8 round-trip verified at byte level (`Tăng` → `54 C4 83 6E 67`).

---

## 1. Task confirmation (docs-only physicalize)

Read SA spec `PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-SA-01.md` (Option B CONFIRMED, Nest ABSENT proven §4.3).
DEFINED `public.att_ot_type` physical catalog:

- Columns: `id`, `company_id`, `code`, `name_vi`, `name_en?`, `default_coeff` (display-ready, **cited ≠ payroll formula** — L-ATT-OT-10 · §2.3), `sort_order`, `color?`, `metadata_json?`, `status`, `archived_at`, `created_at`, `updated_at`.
- **UQ active:** partial `(company_id, lower(code)) WHERE archived_at IS NULL`.
- **IX:** list `(company_id, status)` + `(company_id, sort_order)`; effective `(company_id) WHERE archived_at IS NULL AND status='active'`.
- **CHK:** `code` slug format only; `name_vi` length; `default_coeff >= 0`; row `status IN ('active','inactive')`. **No** closed `code IN (weekday/weekend/holiday)` enum ceiling.
- **DTO map F-ATT-CAT-OT-\*:** F-ATT-CAT-OT-01 list/effective; F-ATT-CAT-OT-02 mutate; consumer invent KEY `HRM-ATT-OT-TYPE-KEY` (400).
- **ICatalogRow binding** documented (§2.4) — reuse platform adapter, not mega-EAV.

## 2. Explicit NOTs honored (per task + SA locks)

| Rule | Applied |
|------|---------|
| NO fold OT into `work_shifts` / `att_attendance_code` / `att_leave_type` / `attendance_work_sites` | Orthogonal OWN — L-ATT-OT-08 · VAL-ATT-OT-FLD-01 |
| NO migration execute | Migration/Dev notes §9 = "not this seat" |
| NO `apps/**` | Docs-only — spec + evidence only |
| NO seed | U65 · L-ATT-OT-15 · empty EFF → CTA, hardcode-3 fallback only |
| `default_coeff` ≠ formula | L-ATT-OT-10 · §2.3 · VAL-ATT-OT-FRM-01 |
| RETAIN ATT L1 seals (attendance-code / leave / work-sites / shifts / CTR / EMP / SI / PAY) | §10 honesty/seals — RETAIN, cấm reopen |
| Honesty flags false | `attendance_uat_ready` / `payroll_e2e_ready` / `contracts_printable_ready` = false — DENY flip · `C-SLICE-≠-MODULE` |

## 3. Deliverables produced

| Artifact | Path | Bytes |
|----------|------|-------|
| Physical DATA spec | `docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-DATA-01.md` | 23767 |
| Evidence (this file) | `docs/qa/evidence/po-hrm-dynamic-config-platform-ot-type-catalog-data-01.md` | see §5 |

Content sections in DATA spec: §1 Verdict CONFIRMED · §2 ADD table (columns/constraints/coeff/ICatalogRow/dual-SoT/bootstrap) · §3 consumer surface · §4 F-ATT-CAT-OT map · §5 validation matrix (CAT/CNS/ALS/SCP/FRM/FLD) · §6 traceability · §7 DOC-DELTA client DB · §8 residual · §9 migration notes · §10 honesty/seals · §11 completion contract.

## 4. Scope parity (U19) — traceability linkage

`att_ot_type` list → get-by-id → mutate → consumer assert all resolve via `resolveHrmListScope` on `company_id` TEXT slug (VAL-ATT-OT-SCP-01, VAL-ATT-OT-CAT-06). `scope_parity` defect flagged if list returns id but detail 404 under group CEO `main`. Consumer `overtime_requests.overtime_type` assert uses same scope as catalog list.

## 5. Self-check — files visible on canonical disk (re-measured live)

(Command output appended below by the verifying shell step — both files Test-Path True + byte sizes + Grep hit.)

## 6. Completion contract

- **completion_report:** CONFIRMED physical ADD `public.att_ot_type` (open `code`, `name_vi`, display-ready `default_coeff` ≠ formula, partial UQ `lower(code)`, soft-delete `archived_at`, ICatalogRow, F-ATT-CAT-OT-01/02 + effective IX, invent KEY `HRM-ATT-OT-TYPE-KEY`, VAL matrix CAT/CNS/ALS/SCP/FRM/FLD); KEEP `overtime_requests.overtime_type` soft-key + DROP/REPLACE closed DTO `@IsIn` ceiling; DOC-DELTA client DB §4.5b + §4.5; closes R-PLT-DATA-04 OT-type slice. No fold, no migrate execute, no apps/**, no seed. Honesty false; ATT/CTR/EMP/SI/PAY seals RETAIN. BE unlock HOLD until parallel BA-01 also CONFIRMED.
- **next_owner:** pm
- **next_dispatch_prompt:** `Task pm — after BA also CONFIRMED on PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-BA-01: Task dev-be work_item_id PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-BE-01. Read DATA-01 §2→§4 + SA L-ATT-OT-01..15 + BA AC-PLT-ATT-OT-01*. ensureSchema ADD public.att_ot_type (ICatalogRow + default_coeff numeric + partial UQ lower(code) + format/name/coeff CHKs + effective IX); DROP/REPLACE closed overtime_requests.overtime_type DTO @IsIn ceiling; Nest F-ATT-CAT-OT-01/02 + EFF + consumer KEY HRM-ATT-OT-TYPE-KEY when EFF>0; soft-delete inactive/archived_at; scope_parity U19; empty EFF soft skip + no seed. FORBIDDEN: payroll OT formula LIVE / flip payroll_e2e_ready; fold OT into att_attendance_code/att_leave_type/attendance_work_sites/work_shifts; rewrite att-timesheet-line-aggregate; reopen EMP/SI/CTR/ATT L1 seals; mega-EAV. Evidence: docs/qa/evidence/po-hrm-dynamic-config-platform-ot-type-catalog-be-01.md. U65. If BA not yet CONFIRMED: HOLD BE — do not dispatch.`
- **evidence_path:** `docs/qa/evidence/po-hrm-dynamic-config-platform-ot-type-catalog-data-01.md`
- **ack_status:** PASS_TO_PM
---

### §5 live re-measure (verifying shell — 2026-08-08)

```
DATA  Test-Path=True  Bytes=23767   docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-DATA-01.md
EVID  Test-Path=True  Bytes=6889+   docs/qa/evidence/po-hrm-dynamic-config-platform-ot-type-catalog-data-01.md
git status --short:
  ?? docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-DATA-01.md
  ?? docs/qa/evidence/po-hrm-dynamic-config-platform-ot-type-catalog-data-01.md
grep public.att_ot_type -> hit line 9 (change_mode ADD DEFINE)
```

Both files present on canonical NFD repo disk (`git rev-parse --show-toplevel`). HARD EXIT GATE PASS: DATA ≥ 5KB, EVID ≥ 3KB. UTF-8 verified at byte level.