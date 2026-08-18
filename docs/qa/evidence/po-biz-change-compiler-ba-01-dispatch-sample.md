# Evidence — PO-BIZ-CHANGE-COMPILER-BA-01-DISPATCH-SAMPLE

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-BIZ-CHANGE-COMPILER-BA-01-DISPATCH-SAMPLE` |
| **from_role** | ba-process |
| **to_role** | pm |
| **date** | 2026-08-05 |
| **lane** | governance |
| **ack_status** | **PASS_TO_PM** |
| **apps/** | **not touched** |
| **Plane** | **D — Dispatch Manifest** (ajv vs schema v0.1.1) |

---

## 1. spec_read_ack

| Artifact | Status |
|----------|--------|
| `CHANGE_MANIFEST_VALIDATION_MATRIX.md` | READ — VAL-CM-PLANE-* · VAL-CM-S-* · VAL-CM-P-05 apps/** · residual §8 BA emit Plane D sample |
| `change-manifest.schema.json` v0.1.1 | READ — Plane D required fields · browser→`uf_or_j` · CONFIRM→`date` · neo enum |
| `change-manifest.dispatch.example.json` | READ — shape reference (ba-data wave) |
| ADR-BUSINESS-CHANGE-COMPILER-20260805 | READ — Manifest ≠ Spec-first |
| `SPONSOR_UI_BRAND_OPEN_QUESTIONS.md` §3–§7.1 | READ — B1–B5 · S3=A LOCK |
| ADR-XEVN-PRECISION-MOTION-TOKENS §16 | READ — Montserrat + Source Sans 3 · B4 |
| `HRM_UI_BRAND_REMASTER_PROGRAM.md` · inventory W4 | READ — W4-MOB-A…C · FE W4 seats |
| UC gap matrix | READ — UC-BP-REC-02/04/07 · PAY-01 · ATT-10 · R-FACE-01 |

---

## 2. Deliverables

| # | Path | Notes |
|---|------|-------|
| A | `docs/program/examples/change-manifest.plane-d.hrm-brand.json` | Plane D instance · `manifest_version` **0.1.1** |
| B | This evidence | ajv + process gates |

**Touched:** `docs/program/examples/**` + `docs/qa/evidence/**` only.  
**Not touched:** `apps/**`, `packages/**`, remaster DONE claim, customer HTML body.

---

## 3. W4 brand work_item map (real IDs)

| work_item_id | Lane | Status (evidence on disk) | Manifest role |
|--------------|------|---------------------------|---------------|
| `PO-HRM-UI-BRAND-W4-PORT-LOGIN` | dev-fe | READY/QA PASS (`po-hrm-ui-brand-w4-port-login*.md`) | AC-02 · UF-XBOS-01 |
| `PO-HRM-UI-BRAND-W4-REC-A` | dev-fe | FE READY · FIX-01-QA PASS | `role_owners.dev_fe` · AC-03 · J-HRM-05 |
| `PO-HRM-UI-BRAND-W4-REC-A-FIX-01` (+ `-QA`) | dev-fe / qa | Jobs title 20px PASS | `role_owners.qa` |
| `PO-HRM-UI-BRAND-W4-PAY-A` (+ `-QA`) | dev-fe / qa | PAY chrome evidence | AC-04 · UF-HRM-06 |
| `PO-HRM-UI-BRAND-W4-ATT-DIALOG-EXT` (+ `-QA` / `-QA-DELTA`) | dev-fe / qa | ATT dialog chrome | AC-05 · J-HRM-06b |
| `PO-HRM-UI-BRAND-W4-MOB-A` | dev-mobile | **OPEN** (inventory slice) | `role_owners.dev_mobile` · AC-06 · J-MOB-01/02 |

Program umbrella: `PO-HRM-UI-BRAND-REMASTER-01`.

**apps/** note (VAL-CM-P-05 + dispatch brief):** FE W4 web seats **đã code** dưới sponsor authorize (work_item riêng). Manifest compiler sample **giữ** `forbidden_paths: apps/**` — không unlock thêm Dev apps từ wave BA này. Unlock MOB Face = Manifest D mới ở `ready_for_dev` khi PM mở `PO-HRM-UI-BRAND-W4-MOB-A`.

---

## 4. Ajv validation

```text
node -e "const fs=require('fs'); const Ajv2020=require('ajv/dist/2020').default||require('ajv/dist/2020'); const addFormats=require('ajv-formats').default||require('ajv-formats'); const schema=JSON.parse(fs.readFileSync('docs/program/schemas/change-manifest.schema.json','utf8')); const data=JSON.parse(fs.readFileSync('docs/program/examples/change-manifest.plane-d.hrm-brand.json','utf8')); const ajv=new Ajv2020({allErrors:true,strict:false}); addFormats(ajv); console.log(ajv.validate(schema,data)?'AJV_PASS':'AJV_FAIL');"
```

| Check | Result |
|-------|--------|
| Ajv2020 + formats vs schema v0.1.1 | **AJV_PASS** |
| `forbidden_paths` includes `apps/**` | **PASS** |
| browser AC have `uf_or_j` (UF-/J-) | **PASS** (UF-XBOS-01 · J-HRM-05 · UF-HRM-06 · J-HRM-06b) |
| `sponsor_confirm` CONFIRMED + `date` | **PASS** 2026-08-05 |
| `change_mode` ∈ ADD\|UPGRADE\|FIX | **PASS** UPGRADE |
| `neo_tags` ⊂ enum | **PASS** |
| `promote_os.chapter` const | **PASS** |
| Plane B ledger not used as change_manifest_path | **PASS** (this file is Plane D) |
| scope_parity | **N/A** (`scope_parity_ack=false` — chrome remaster, no list/get-by-id API change) |

---

## 5. Process gates (matrix)

| ID | Result |
|----|--------|
| VAL-CM-PLANE-01 | PASS — file is Plane D |
| VAL-CM-P-05 | PASS — `apps/**` forbidden on compiler sample |
| VAL-CM-P-08 | PASS — no remaster DONE / product GO claim |
| VAL-CM-P-13 | PASS — UC from gap matrix; BR mapped to Open Q B2/B4/B5 + R-FACE-01 |
| VAL-CM-S-10 / VAL-CM-064 | PASS — journey_ids ⊇ browser uf_or_j |

---

## 6. Residual

| ID | Item | Owner |
|----|------|-------|
| R1 | Slice file `docs/program/slices/HRM-UI-BRAND-W4.md` named in Manifest — **not created** this seat | pm / ba-process when MOB opens |
| R2 | `PO-HRM-UI-BRAND-W4-MOB-A` Dev-Mobile Face MVP still OPEN | pm → **dev-mobile** |
| R3 | W5 brand QC GWC after MOB + residual FE QA closed | qc |
| R4 | Optional CI hook ajv on `docs/program/examples/*.json` | devops later |

---

## 7. completion_report

**Closed:** Emitted ajv-valid Plane D Dispatch Manifest for HRM brand W4 from SPONSOR_CHOT / Open Q / inventory; mapped real W4 work_item_ids; `forbidden_paths` includes `apps/**`; evidence with AJV_PASS; no `apps/**` code.

**Open:** W4-MOB-A Face MVP execution; optional slice markdown; W5 QC — not this BA sample.

---

## 8. next_owner

`pm`

## 9. next_dispatch_prompt

```text
work_item_id: PO-HRM-UI-BRAND-W4-MOB-A
from_role: pm
to_role: dev-mobile
priority: P0
lane: execution
change_manifest_path: docs/program/examples/change-manifest.plane-d.hrm-brand.json

read_first:
1. docs/program/examples/change-manifest.plane-d.hrm-brand.json
2. docs/program/HRM_UI_BRAND_SCREEN_INVENTORY.md §6 W4-MOB-A
3. docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md §16
4. docs/qa/evidence/po-biz-change-compiler-ba-01-dispatch-sample.md

entry: sponsor brand LOCK B1–B5; R-FACE-01 Mobile only; web S17–S19 HOLD
exit: MOB-01/03/04/04b/05/13 Precision Motion chrome; J-MOB-01 + J-MOB-02 spot; theme tokens; face_live not claimed on web; evidence po-hrm-ui-brand-w4-mob-a.md; READY_FOR_QA
cấm: seed · remaster DONE · Attendance CLOSED · invent Face LIVE web · Nest invent · NFC path
note: Compiler Manifest keeps apps/** forbidden — open separate Plane D (or sponsor_confirm + ready_for_dev amend) before apps/mobile mutate if PM requires Manifest gate strict
```

### Parallel (compiler promote)

```text
work_item_id: PO-BIZ-CHANGE-COMPILER-OS-PROMOTE-01
from_role: pm
to_role: sa
priority: P1
read: docs/program/BIZ_COMPILER_OS_PROMOTE_PACKET.md + this evidence (Plane D brand sample AJV_PASS)
```

---

## 10. pm_dispatch_hint

`PO-HRM-UI-BRAND-W4-MOB-A` — Face MVP chrome next; attach `change_manifest_path` = `docs/program/examples/change-manifest.plane-d.hrm-brand.json`.

---

## 11. ack_status

**PASS_TO_PM**
