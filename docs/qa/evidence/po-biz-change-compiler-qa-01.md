# Evidence — PO-BIZ-CHANGE-COMPILER-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-BIZ-CHANGE-COMPILER-QA-01` |
| **from_role** | qa |
| **to_role** | pm |
| **date** | 2026-08-05 |
| **stall** | **#2 CLOSED** — formal consolidate Phase A+B (U77 docs-only) |
| **lane** | governance · docs-only |
| **schema** | `docs/program/schemas/change-manifest.schema.json` **v0.1.1** |
| **ack_status** | **PASS_TO_PM** |
| **verdict** | **PASS_WITH_OBS** |
| **apps/** | **not touched** |
| **remaster / product GO / Phase 1 DONE** | **not claimed** |

---

## 1. Purpose

Formal QA gate consolidating Business Change Compiler **Plane D** machine validation + dual-plane process rules + OS promote SoT checks after:

| Prior seat | Evidence | Verdict |
|------------|----------|---------|
| BA-DATA / BA-PROC / BA-01 dispatch | `po-biz-change-compiler-ba-*` | Matrix LOCKED · samples · brand dispatch |
| QA-SPOT-01 | `po-biz-change-compiler-qa-spot-01.md` | PASS_TO_PM |
| OS-PROMOTE-01 | `po-biz-change-compiler-os-promote-01.md` | PASS_TO_PM · STALL #2 |
| OS-PROMOTE-QC-01 | `po-biz-change-compiler-os-promote-qc-01.md` | **GO WITH CONDITIONS** (OS scope) |

This seat **re-runs ajv** on every project sample that claims **AJV_PASS**, re-checks **Plane B ≠ `change_manifest_path`**, and confirms **full `_vibe-team-os`** (not repo stub) holds ch.34 + template pack.

---

## 2. spec_read_ack

| Artifact | Status |
|----------|--------|
| `docs/program/BUSINESS_CHANGE_COMPILER_PROGRAM.md` | CITED (Phase A+B substance CLOSED — not re-opened) |
| `docs/architecture/ADR-BUSINESS-CHANGE-COMPILER-20260805.md` | CITED — Option C Hybrid |
| `docs/program/schemas/change-manifest.schema.json` v0.1.1 | READ |
| `docs/program/schemas/CHANGE_MANIFEST_VALIDATION_MATRIX.md` | READ — VAL-CM-PLANE-01/02 · `CM-VAL-008` |
| `docs/qa/evidence/po-biz-change-compiler-ba-01-dispatch-sample.md` | READ — brand Plane D |
| `docs/qa/evidence/po-biz-change-compiler-os-promote-qc-01.md` | READ — GWC conditions |
| U65 / U77 | Docs-only · zero-seed N/A · no product GO |

---

## 3. Environment / tooling

| Item | Value |
|------|--------|
| Runtime | Node + `ajv` draft-2020-12 + `ajv-formats` |
| Options | `allErrors: true`, `strict: false` |
| Repro | **2026-08-05** (this seat — fresh run) |
| Product browser | **N/A** |

---

## 4. ajv L1 — all Plane D samples claiming AJV_PASS

### 4.1 Project repo (`docs/program/**`)

| # | Path | Result |
|---|------|--------|
| 1 | `docs/program/examples/change-manifest.sample.json` (gold) | **AJV_PASS** |
| 2 | `docs/program/examples/change-manifest.plane-d.hrm-brand.json` (BA-01 brand W4) | **AJV_PASS** |
| 3 | `docs/program/schemas/change-manifest.dispatch.example.json` | **AJV_PASS** |
| 4 | `docs/program/schemas/change-manifest.example-emp.json` | **AJV_PASS** |
| 5 | `docs/program/schemas/change-manifest.example-rec.json` | **AJV_PASS** |
| 6 | `change-manifest.example.json` → `samples[0]` `PO-HRM-BP-ATT-SIGN-TS-01` | **AJV_PASS** |
| 7 | `samples[1]` `PO-HRM-BP-EMP-CORE-02B-EXPAND-01` | **AJV_PASS** |
| 8 | `samples[2]` `PO-HRM-BP-REC-07-OFFER-HIRE-01` | **AJV_PASS** |

**Plane D score: 8/8 PASS**

### 4.2 Negative controls (expected fail — not counted in 8/8)

| Target | Expected | Result |
|--------|----------|--------|
| Bundle **root** `change-manifest.example.json` | Not a Dispatch Manifest | **AJV_FAIL** (missing `manifest_version`, `work_item_id`, …) |
| `change-manifest.batch.example.json` | Plane B ledger | **LEDGER_FAIL_EXPECTED** (`CM-VAL-008` / VAL-CM-PLANE-02) |

### 4.3 Full OS templates (promote pack — cite QC re-run)

| Path | Result |
|------|--------|
| `…/_vibe-team-os/templates/change-manifest.dispatch.example.json` | **AJV_PASS** |
| OS `change-manifest.example.json` `samples[0..2]` | **3/3 AJV_PASS** |

### 4.4 Repro command (project 8 + negatives)

```bash
node -e "const fs=require('fs'); const Ajv2020=require('ajv/dist/2020').default||require('ajv/dist/2020'); const addFormats=require('ajv-formats').default||require('ajv-formats'); const schema=JSON.parse(fs.readFileSync('docs/program/schemas/change-manifest.schema.json','utf8')); const ajv=new Ajv2020({allErrors:true,strict:false}); addFormats(ajv); const v=ajv.compile(schema); const files=['docs/program/examples/change-manifest.sample.json','docs/program/examples/change-manifest.plane-d.hrm-brand.json','docs/program/schemas/change-manifest.dispatch.example.json','docs/program/schemas/change-manifest.example-emp.json','docs/program/schemas/change-manifest.example-rec.json']; for (const f of files){ console.log(f, v(JSON.parse(fs.readFileSync(f,'utf8')))?'AJV_PASS':'AJV_FAIL'); } const bundle=JSON.parse(fs.readFileSync('docs/program/schemas/change-manifest.example.json','utf8')); bundle.samples.forEach((s,i)=>console.log('samples['+i+']',s.work_item_id,v(s)?'AJV_PASS':'AJV_FAIL')); console.log('bundle ROOT', v(bundle)?'UNEXPECTED_PASS':'AJV_FAIL_EXPECTED'); const batch=JSON.parse(fs.readFileSync('docs/program/schemas/change-manifest.batch.example.json','utf8')); console.log('batch', v(batch)?'LEDGER_UNEXPECTED_PASS':'LEDGER_FAIL_EXPECTED');"
```

---

## 5. Plane B ≠ `change_manifest_path` (Spec-first matrix)

| Rule | Check | QA-01 |
|------|-------|-------|
| **VAL-CM-PLANE-01** | File used as `change_manifest_path` for PM/Dev must be **Plane D** + ajv-valid | **PASS** — gold + brand + dispatch qualify |
| **VAL-CM-PLANE-02** | Plane B (`changes[]`, `change_id`, …) must **not** ajv as Plane D | **PASS** — `change-manifest.batch.example.json` → **LEDGER_FAIL_EXPECTED** |
| **CM-VAL-008** | Plane B treated as Plane D | **Not triggered** on valid paths; **would fire** if batch used as manifest path |
| Matrix §5 / §10 | Batch = process-only; compile → ≥1 Manifest D before Dev | **PASS** (process lock cited) |

**Verdict:** Plane B ledger path is **NOT** accepted as `change_manifest_path` for Spec-first dispatch.

---

## 6. OS promote SoT (full `_vibe-team-os` only)

| Check | Result | Notes |
|-------|--------|-------|
| Full OS path `…/projects/_vibe-team-os` has `13-BRD-SRS-TECHSPEC-QUALITY.md` | **PASS** | Doctrine anchor |
| `34-BUSINESS-CHANGE-COMPILER.md` on disk | **PASS** | Not in repo stub |
| `MANIFEST.json` lists `34-BUSINESS-CHANGE-COMPILER.md` | **PASS** | `docs[]` includes chapter |
| Six templates under `templates/` (schema, Excel, dispatch, example, validation matrix, compound) | **PASS** | QC spot matrix #6–8 |
| Repo stub `xevn-ecosystem/_vibe-team-os` | **PASS (no promote)** | Only 31/33 + templates QA rules — **no** ch.34 · **no** `MANIFEST.json` |
| NFC / alternate stub write | **PASS (absent)** | ch.34 not written outside full OS |

### 6.1 MANIFEST version (P3 OBS)

| Source | Version |
|--------|---------|
| `po-biz-change-compiler-os-promote-01.md` (STALL #2 stamp) | **1.12.7** |
| Disk SoT (this seat + QC-01) | **1.12.8** |
| QC GWC condition | Cite **1.12.8** forward; promote content still valid |

**OBS-P3-01:** Version string drift 1.12.7 ↔ 1.12.8 — **non-blocking**; chapter + templates present on full OS.

---

## 7. Process L2 (consolidated — no product browser)

| AC / check | Result |
|------------|--------|
| Gold + brand `forbidden_paths` ⊇ `apps/**` | **PASS** |
| `verify=browser` ⇒ `uf_or_j` (schema if/then) | **PASS** on gold ATT sample |
| CONFIRMED ⇒ `date` | **PASS** on samples reviewed |
| No invent UC/BR (U77) | **PASS** |
| Spec-first unchanged (Manifest feed only) | **PASS** (cite ADR + OS ch.34 + QC-01) |

---

## 8. Residuals

| ID | Severity | Item | Owner | Blocks QA-01? |
|----|----------|------|-------|---------------|
| OBS-P3-01 | P3 | MANIFEST cite 1.12.7 vs disk 1.12.8 | pm / ba-docs | No |
| R1 | P3 | Batch EMP/REC ≠ bundle EMP/REC demo paths | pm | No |
| R2 | P3 | Optional Plane B schema v0.2 | ba-data | No |
| R-QA-01 | P3 | CI ajv gate Plane D + negative Plane B | devops | No |
| R3 | P3 | Product UF/J browser when ATT wave opens | qa | No |

---

## 9. Verdict rollup

| Gate | Result |
|------|--------|
| ajv Plane D (all claimed samples) | **8/8 PASS** |
| Plane B negative (`CM-VAL-008`) | **PASS** |
| Plane B as `change_manifest_path` | **REJECTED (correct)** |
| OS ch.34 + templates on **full** OS | **PASS** |
| Stub OS not written | **PASS** |
| Product / remaster / Phase 1 | **not claimed** |
| **Overall** | **PASS_WITH_OBS** (OBS-P3-01 only) |

---

## 10. completion_report

**Closed:** Docs-only formal QA-01 for Business Change Compiler Phase A+B consolidate. Re-ran ajv draft-2020-12 on **8** Plane D instances (gold, brand W4, dispatch, emp, rec, 3× bundle samples) → **8/8 AJV_PASS**. Negative: bundle root **AJV_FAIL** (expected); batch ledger **LEDGER_FAIL_EXPECTED**. Confirmed **VAL-CM-PLANE-01/02** — Plane B **not** valid `change_manifest_path`. Confirmed full `_vibe-team-os` has **34-BUSINESS-CHANGE-COMPILER.md** + MANIFEST listing + ajv-valid OS dispatch/samples; **xevn-ecosystem/_vibe-team-os** stub has **no** ch.34 promote. **No `apps/**`.** OS-PROMOTE-QC-01 already **GO WITH CONDITIONS** — not re-run here.

**Open:** P3 residuals only (MANIFEST version cite harmonization optional).

---

## 11. next_owner

`pm`

---

## 12. next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-BP-ATT-SIGN-TS-01
from_role: pm
to_role: sa
change_manifest_path: docs/program/examples/change-manifest.sample.json
priority: P2
lane: governance → Spec-first
entry_criteria:
  - docs/qa/evidence/po-biz-change-compiler-qa-01.md ack PASS_TO_PM (PASS_WITH_OBS · ajv 8/8)
  - docs/qa/evidence/po-biz-change-compiler-os-promote-qc-01.md GO WITH CONDITIONS (OS promote closed)
  - gold manifest ajv-valid v0.1.1; Plane B not used as change_manifest_path
exit_criteria:
  - TechSpec path or explicit HOLD + ref_srs UC-BP-ATT-11 for ATT sign wave
  - spec_read_ack filled; no apps/** until sponsor_confirm + stage ≥ ready_for_dev
evidence_path: docs/qa/evidence/po-hrm-bp-att-sign-ts-01.md
cấm: apps/** · invent UC/BR · skip Spec-first · remaster DONE · product GO
```

### Alternate (brand / UI W4 compile follow-up)

```text
work_item_id: PO-HRM-BP-BRAND-W4-SPEC-01
from_role: pm
to_role: ba-process
change_manifest_path: docs/program/examples/change-manifest.plane-d.hrm-brand.json
priority: P2
lane: governance
entry_criteria: QA-01 PASS_WITH_OBS; brand sample ajv PASS
exit_criteria: Slice + AC trace to SPONSOR_CHOT / open questions inventory; forbidden_paths apps/**
evidence_path: docs/qa/evidence/po-hrm-bp-brand-w4-spec-01.md
cấm: apps/** · invent UC
```

---

## 13. pm_dispatch_hint

First Spec-first on gold `change-manifest.sample.json` (**PO-HRM-BP-ATT-SIGN-TS-01** → **sa**) unless sponsor prioritizes brand W4 (**ba-process** + brand manifest path).

---

## 14. ack_status

**PASS_TO_PM**

---

## evidence_path

`docs/qa/evidence/po-biz-change-compiler-qa-01.md`

### Cited prior evidence

- `docs/qa/evidence/po-biz-change-compiler-ba-proc-01.md`
- `docs/qa/evidence/po-biz-change-compiler-ba-01-dispatch-sample.md`
- `docs/qa/evidence/po-biz-change-compiler-qa-spot-01.md`
- `docs/qa/evidence/po-biz-change-compiler-os-promote-01.md`
- `docs/qa/evidence/po-biz-change-compiler-os-promote-qc-01.md`
