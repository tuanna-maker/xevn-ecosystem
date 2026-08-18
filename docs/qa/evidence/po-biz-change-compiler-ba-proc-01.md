# Evidence — PO-BIZ-CHANGE-COMPILER-BA-PROC-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-BIZ-CHANGE-COMPILER-BA-PROC-01` |
| **from_role** | ba-process |
| **to_role** | pm |
| **date** | 2026-08-05 |
| **lane** | governance |
| **ack_status** | **PASS_TO_PM** |
| **apps/** | **not touched** |

---

## 1. spec_read_ack / intake

| Artifact | Result |
|----------|--------|
| `change-manifest.schema.json` v0.1.1 | READ — if/then browser⇒`uf_or_j`; CONFIRMED/WAIVED⇒`date`; optional `traceability` (ba-data ADD) |
| `CHANGE_MANIFEST_EXCEL_COLUMNS.md` | READ — map `trace_srs` / `journey_ids` / `ac_uf_or_j` |
| `CHANGE_MANIFEST_VALIDATION_MATRIX.md` | READ — VAL-CM-S-10/16 · VAL-CM-064 · TR-CM-10 |
| `BUSINESS_CHANGE_COMPILER_PROGRAM.md` | READ — R1 CLOSED; artifact table updated |
| `change-manifest.example.json` (pre) | READ — Plane D `samples[]` missing `traceability`; no browser AC |
| U77 | Docs-only; cấm remaster / product GO claim |

---

## 2. Deliverables

| # | Path | Change |
|---|------|--------|
| A | `docs/program/schemas/change-manifest.example.json` | UPGRADE — `traceability` on all 3; ATT + browser AC `UF-HRM-ATT-SIGN`; CONFIRMED+`date` kept |
| B | `docs/program/examples/change-manifest.sample.json` | **ADD** — gold single-file Plane D (ATT) for PM `change_manifest_path` |
| C | `change-manifest.example-emp.json` · `example-rec.json` | FIX — drop illegal `batch_change_ids`; `kind: other`; +`traceability`; `manifest_version` 0.1.1 |
| D | `change-manifest.dispatch.example.json` | ADD optional `traceability` |
| E | `CHANGE_MANIFEST_EXCEL_COLUMNS.md` · `BUSINESS_CHANGE_COMPILER_PROGRAM.md` · matrix §9 | DOC-DELTA pointers to gold + BA-PROC-01 |
| F | This evidence | WRITE |

---

## 3. Process AC (measurable)

| AC | Rule | Result |
|----|------|--------|
| AC-PROC-01 | Every Plane D sample has `traceability.srs_refs` (non-empty) | **PASS** — ATT/EMP/REC + gold + emp/rec standalones |
| AC-PROC-02 | Any `ac.verify=browser` ⇒ `uf_or_j` present + pattern | **PASS** — `AC-ATT-SIGN-04` → `UF-HRM-ATT-SIGN` |
| AC-PROC-03 | `journey_ids` ⊇ browser `uf_or_j` (VAL-CM-064) | **PASS** — ATT/gold include `UF-HRM-ATT-SIGN` |
| AC-PROC-04 | `sponsor_confirm.status=CONFIRMED` ⇒ `date` `YYYY-MM-DD` | **PASS** — all samples `2026-08-05` |
| AC-PROC-05 | ajv vs schema v0.1.1 | **PASS** — TOTAL_FAIL 0 (7 instances) |
| AC-PROC-06 | `forbidden_paths` includes `apps/**` | **PASS** |
| AC-PROC-07 | No invent UC/BR | **PASS** — UC-BP-ATT-11 / CORE-02b / REC-07 / ATT-12 / REC-02b from chốt/gap |

### Plane B → Plane D map

| Plane B `change_id` | Plane D `work_item_id` | File |
|---------------------|------------------------|------|
| `CM-HRM-ATT-011` | `PO-HRM-BP-ATT-SIGN-TS-01` | `examples/change-manifest.sample.json` · `samples[0]` |
| `CM-HRM-EMP-012` | `PO-HRM-BP-EMP-LEAVE-OPEN-AC-01` | `example-emp.json` (standalone; bundle EMP = CORE-02b EXPAND) |
| `CM-HRM-REC-02B` | `PO-HRM-BP-REC-HEADCOUNT-TS-01` | `example-rec.json` (standalone; bundle REC = REC-07 EXPAND) |

**Note (carry):** Bundle EMP/REC ≠ batch EMP/REC feedstock — documented BA-01 R2; BA-PROC does **not** invent merge — PM/QA spot chooses SoT demo.

---

## 4. ajv repro

```bash
node -e "const fs=require('fs'); const Ajv2020=require('ajv/dist/2020').default||require('ajv/dist/2020'); const addFormats=require('ajv-formats').default||require('ajv-formats'); const schema=JSON.parse(fs.readFileSync('docs/program/schemas/change-manifest.schema.json','utf8')); const ajv=new Ajv2020({allErrors:true,strict:false}); addFormats(ajv); const v=ajv.compile(schema); const files=['docs/program/examples/change-manifest.sample.json','docs/program/schemas/change-manifest.dispatch.example.json','docs/program/schemas/change-manifest.example-emp.json','docs/program/schemas/change-manifest.example-rec.json']; for (const f of files){ console.log(f, v(JSON.parse(fs.readFileSync(f,'utf8')))?'AJV_PASS':'AJV_FAIL'); } JSON.parse(fs.readFileSync('docs/program/schemas/change-manifest.example.json','utf8')).samples.forEach((s,i)=>console.log('samples['+i+']',s.work_item_id,v(s)?'AJV_PASS':'AJV_FAIL'));"
```

**Run 2026-08-05:** `TOTAL_FAIL 0`.

---

## 5. Residual

| ID | Item | Owner |
|----|------|-------|
| R1 | Batch EMP/REC ≠ bundle EMP/REC (BA-01 R2) | qa spot / pm |
| R2 | `batch_change_ids` still ADR-recommended but **not** in schema — keep in `source_artifacts[].note` | ba-data (optional v0.1.2) |
| R3 | `UF-HRM-ATT-SIGN` = planned journey id for product wave (not yet matrix 🟢) — browser AC is compile-time contract only | qa when product opens |
| R4 | Slice markdown files named in samples may not exist yet | ba-process when Spec-first wave opens |
| R5 | OS promote Phase B | pm → `PO-BIZ-CHANGE-COMPILER-OS-PROMOTE-01` |

---

## 6. completion_report

**Closed:** Sample Manifests aligned to schema **v0.1.1** after ba-data `traceability` ADD — bundle ATT/EMP/REC + gold `docs/program/examples/change-manifest.sample.json` + emp/rec/dispatch fixes; ajv 7/7 PASS; CONFIRMED⇒date; browser⇒`uf_or_j` + journey cover; program/Excel/matrix pointers; **no `apps/**`**.

**Open:** QA spot optional; OS promote; product Spec-first waves use gold as `change_manifest_path` (not this seat).

---

## 7. next_owner

`pm`

## 8. next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-BIZ-CHANGE-COMPILER-QA-SPOT-01
from_role: pm
to_role: qa
priority: P1
lane: governance
entry_criteria: U65 N/A (docs-only); zero browser product claim
read_first:
  - docs/program/examples/change-manifest.sample.json
  - docs/program/schemas/change-manifest.example.json
  - docs/program/schemas/CHANGE_MANIFEST_VALIDATION_MATRIX.md
  - docs/client-delivery/hrm-enterprise-blueprint/UC_MEETING_PRODUCT_GAP_MATRIX.md
  - docs/qa/evidence/po-biz-change-compiler-ba-proc-01.md
exit_criteria:
  - Spot-check 3 bundle samples + gold vs phiếu/gap: PASS/FAIL từng dòng (uc_ids, decision_id, must_keep)
  - Confirm VAL-CM-064 on ATT (journey_ids ⊇ UF-HRM-ATT-SIGN)
  - Recommend keep vs merge for batch EMP/REC vs bundle EMP/REC (R1)
  - evidence: docs/qa/evidence/po-biz-change-compiler-qa-spot-01.md
  - ack_status PASS_TO_PM
cấm: apps/** · seed · claim product GO · ajv Plane B as Plane D
```

### Alternate (if PM opens Spec-first immediately)

```text
work_item_id: PO-HRM-BP-ATT-SIGN-TS-01
from_role: pm
to_role: sa
change_manifest_path: docs/program/examples/change-manifest.sample.json
exit_criteria: TechSpec path hoặc HOLD có lý do + ref_srs UC-BP-ATT-11; không apps/**
```

---

## 9. ack_status

**PASS_TO_PM**
