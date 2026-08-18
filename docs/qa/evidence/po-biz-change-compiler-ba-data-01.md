# Evidence — PO-BIZ-CHANGE-COMPILER-BA-DATA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-BIZ-CHANGE-COMPILER-BA-DATA-01` |
| **from_role** | ba-data |
| **to_role** | pm |
| **date** | 2026-08-05 |
| **lane** | governance |
| **change_mode** | ADD |
| **ack_status** | **PASS_TO_PM** |
| **apps/** | none |

---

## 1. spec_read_ack

| Artifact | Status |
|----------|--------|
| ADR `docs/architecture/ADR-BUSINESS-CHANGE-COMPILER-20260805.md` §5–§8 | READ — Option C Hybrid; Plane D field set; Manifest wins on drift |
| `change-manifest.schema.json` (pre) | READ — v0.1.1 Plane D + if/then (browser / date / br_ids) |
| `CHANGE_MANIFEST_EXCEL_COLUMNS.md` | READ — sheet → Plane D columns |
| `change-manifest.dispatch.example.json` | READ — Plane D sample |
| `change-manifest.batch.example.json` | READ — Plane B ledger (`changes[]`) |
| U77 `TEAM_USER_REQUIREMENTS.md` | READ — Phase A docs only; cấm apps/** |
| OS Spec-first `02` / trace `14` / neo `22` | READ — Manifest feeds only |

---

## 2. Deliverables

| # | Path | Action |
|---|------|--------|
| A | `docs/program/schemas/CHANGE_MANIFEST_VALIDATION_MATRIX.md` | WRITE — Plane D/B; VAL-CM-S/P/B; CM-VAL-001..009; **TR-CM-01..16** Manifest→SRS→TechSpec→DB→API→CODE-MEMORY |
| B | `docs/program/schemas/change-manifest.schema.json` | ADD-only — optional `traceability` + `uf_or_j` allows `J-MOB-*`; keep prior if/then |
| C | `docs/qa/evidence/po-biz-change-compiler-ba-data-01.md` | WRITE (this file) |

**Not invented:** product Nest/Prisma DDL, HRM/XBOS API routes, OS chapter 34 promote.

---

## 3. Validation results

| Check | Result |
|-------|--------|
| ajv2020 + formats on `change-manifest.dispatch.example.json` vs schema v0.1.1 | **AJV_PASS** |
| Plane B `change-manifest.batch.example.json` vs Plane D schema | **LEDGER_FAIL_EXPECTED** (`CM-VAL-008` class — do not use as `change_manifest_path`) |
| TR-CM-01..16 present in matrix §7 | **PASS** |
| scope_parity (list↔get-by-id) for this wave | **N/A** (compiler docs) |
| apps/** | **PASS** (untouched) |

Repro:

```bash
node -e "const fs=require('fs'); const Ajv2020=require('ajv/dist/2020').default||require('ajv/dist/2020'); const addFormats=require('ajv-formats').default||require('ajv-formats'); const schema=JSON.parse(fs.readFileSync('docs/program/schemas/change-manifest.schema.json','utf8')); const data=JSON.parse(fs.readFileSync('docs/program/schemas/change-manifest.dispatch.example.json','utf8')); const ajv=new Ajv2020({allErrors:true,strict:false}); addFormats(ajv); console.log(ajv.validate(schema,data)?'AJV_PASS':'AJV_FAIL');"
```

---

## 4. Residuals

| ID | Item | Owner |
|----|------|-------|
| R-CM-BATCH-SCHEMA | Optional `change-batch-ledger.schema.json` (Plane B) | v0.2 / sa |
| R-CM-PROGRAM-MD | `BUSINESS_CHANGE_COMPILER_PROGRAM.md` missing | pm / ba-process |
| R-CM-PROD-SAMPLES | More Plane D Manifests from live SPONSOR_CHOT rows | ba-process |
| R-CM-OS-34 | Phase B promote chapter 34 | pm after A2 green |

---

## 5. completion_report

**Closed:** Validation matrix with dual-plane lock + VAL-CM-* + error catalog + full TR-CM-01..16 Spec-first→CODE-MEMORY; schema ADD `traceability` + J-MOB on `uf_or_j`; dispatch sample still AJV_PASS; evidence; no apps/**.

**Open:** program markdown; OS promote; optional Plane B machine schema; additional production dispatch samples.

---

## 6. next_owner

**pm**

---

## 7. next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-BIZ-CHANGE-COMPILER-BA-01-DISPATCH-SAMPLE
role: ba-process
lane: governance
sponsor_lock: U77
entry_criteria:
  - Schema v0.1.1 + CHANGE_MANIFEST_VALIDATION_MATRIX.md (TR-CM-01..16) on disk
  - change-manifest.dispatch.example.json AJV_PASS
  - cấm apps/**
read_first:
  1. docs/program/schemas/CHANGE_MANIFEST_VALIDATION_MATRIX.md §1 §7
  2. docs/program/schemas/change-manifest.schema.json
  3. docs/program/schemas/change-manifest.dispatch.example.json
  4. docs/program/schemas/change-manifest.batch.example.json
  5. docs/qa/evidence/po-biz-change-compiler-ba-data-01.md
  6. docs/client-delivery/hrm-enterprise-blueprint/SPONSOR_CHOT_FILL_SHEET.md
exit_criteria:
  A) Emit ≥1 production Plane D Manifest from real SPONSOR_CHOT_* (ajv-valid; forbidden_paths includes apps/**)
  B) Map Plane B change_id → Plane D work_item_id in evidence table
  C) Fill traceability.srs_refs (and tech/db/api when stage requires) per TR-CM-07..10
  D) Evidence docs/qa/evidence/po-biz-change-compiler-ba-01-dispatch-sample.md
  E) ack_status PASS_TO_PM
forbidden_paths: apps/**, packages/**
cấm: submit Plane B as change_manifest_path (CM-VAL-008) · invent UC/BR · claim product GO
pm_dispatch_hint_after: PO-BIZ-CHANGE-COMPILER-PROGRAM-01 if BUSINESS_CHANGE_COMPILER_PROGRAM.md still missing; else PO-BIZ-CHANGE-COMPILER-OS-PROMOTE-01
```

---

## 8. ack_status

**PASS_TO_PM**

## evidence_path

`docs/qa/evidence/po-biz-change-compiler-ba-data-01.md`
