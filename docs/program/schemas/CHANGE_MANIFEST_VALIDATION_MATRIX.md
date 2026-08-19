# Change Manifest — Validation Matrix (v0.1.1)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-BIZ-CHANGE-COMPILER-BA-DATA-01` |
| **SoT machine (Plane D)** | `docs/program/schemas/change-manifest.schema.json` **v0.1.1** |
| **Column map** | `docs/program/schemas/CHANGE_MANIFEST_EXCEL_COLUMNS.md` |
| **Dispatch sample** | `docs/program/schemas/change-manifest.dispatch.example.json` |
| **Batch ledger sample** | `docs/program/schemas/change-manifest.batch.example.json` (Plane B) |
| **ADR** | `docs/architecture/ADR-BUSINESS-CHANGE-COMPILER-20260805.md` Option **C** Hybrid |
| **Lock** | U77 — Excel/docs → Manifest JSON → Spec-first (Manifest **không** thay Spec-first) |
| **Evidence** | `docs/qa/evidence/po-biz-change-compiler-ba-data-01.md` |
| **Status** | LOCKED Phase A — ajv L1 + process L2 |

Khi sheet và JSON lệch: **Manifest JSON (Plane D) thắng**; BA re-compile từ sheet (`CM-VAL-006`).

---

## 1. Dual-plane lock (data integrity)

| Plane | Artifact role | Machine validate | Typical file |
|-------|---------------|------------------|--------------|
| **D — Dispatch Manifest** | SoT cho PM Task / slice / `spec_read_ack` / gates | **ajv** vs `change-manifest.schema.json` | `change-manifest.dispatch.example.json` / per-wave `*.dispatch.json` |
| **B — Batch Change Ledger** | Inventory quyết định chốt (nhiều `change_id` / UC) — feed BA expand → ≥1 Manifest D | **Process** §5 only (không ajv bằng schema Plane D) | `change-manifest.batch.example.json` |

| Rule | Condition | Expected | Error |
|------|-----------|----------|-------|
| VAL-CM-PLANE-01 | File claimed as `change_manifest_path` for PM/Dev | Must be **Plane D** and ajv-valid | `CM-VAL-008` |
| VAL-CM-PLANE-02 | File is Plane B (`changes[]`, `change_id`, …) | Không đưa vào ajv Plane D; map rows → ≥1 Manifest D | `CM-VAL-008` |
| VAL-CM-PLANE-03 | Docs-only / Phase A compiler wave | Plane D `forbidden_paths` **includes** `apps/**` | `CM-VAL-007` |

**Note:** `change-manifest.example.json` on disk may be a **samples bundle** index — not a Plane D instance. Use `.dispatch.example.json` / `.batch.example.json` explicitly.

---

## 2. Domain map (Plane D)

| Entity | Identity | Lifecycle / status | Relationships |
|--------|----------|--------------------|---------------|
| **DispatchManifest** | `work_item_id` + `manifest_version` | `pipeline_stage`: intake → srs → techspec → db_api → ready_for_dev → qa → qc → closed | 1 → N AC; N UC/BR; 1 sponsor_confirm; N neo_tags; optional `traceability` |
| **AcceptanceCriterion** | `ac[].id` (`AC-…`) | verify method fixed until re-compile | `uf_or_j` **required** when `verify=browser` |
| **SponsorConfirm** | nested | PENDING → CONFIRMED / REJECTED; hoặc WAIVED_HOTFIX_P0 | `date` required khi CONFIRMED/WAIVED |
| **PathBudget** | allowed / forbidden / must_keep | DoD: git diff ⊆ allowed ∧ ∅ forbidden | Slice `docs/program/slices/<slice_id>.md` |
| **TraceabilityPack** | optional `traceability` | Completeness by stage (process) | Points SRS→TS→DB→API→CODE-MEMORY paths |
| **SponsorOverride** | optional | REPLACE/REMOVE/ALIGN only | Never root `change_mode` |

### 2.1 Invalid lifecycle transitions

| From → To | Allowed? | On reject |
|-----------|----------|-----------|
| intake → ready_for_dev | **No** (skip Spec-first) | `CM-VAL-007` + PASS_TO_BA |
| PENDING → Dev `apps/**` | **No** | `CM-VAL-007` |
|PENDING → CONFIRMED / REJECTED → any mutate | **No** | new Manifest |
| closed → reopen | Only new `work_item_id` / FIX wave | bus note |
| FIX+empty `br_ids` without WAIVED | **No** | `CM-VAL-004` |

### 2.2 CRUD / interaction

| Op | Actor | Allowed when | Forbidden when |
|----|-------|--------------|----------------|
| Create Manifest D | ba-process / ba-data | Sheet/docs cited | Invent UC/BR |
| Update (re-compile) | ba-* | Sheet delta / re-chốt | Silent overwrite CONFIRMED without DOC-DELTA |
| Read | all | Always | Memory recall as substitute |
| Transition stage | pm (+ evidence) | Prior exit met | Jump `ready_for_dev` without DB+API when impact needs them |
| Delete | pm only | Wave abandoned | Hide FAIL |

---

## 3. Schema-enforced rules (ajv — Plane D L1)

Aligned to `change-manifest.schema.json` **v0.1.1**.

| ID | Field / path | Condition | Rule | Expected (PASS) | Fail |
|----|--------------|-----------|------|-----------------|------|
| VAL-CM-S-01 | root | always | `additionalProperties: false` | No unknown keys | `CM-VAL-001` |
| VAL-CM-S-02 | `manifest_version` | required | `^0\\.1\\.\\d+$` | `0.1.0` / `0.1.1` | `CM-VAL-002` |
| VAL-CM-S-03 | `work_item_id` | required | `^[A-Za-z0-9][A-Za-z0-9._:-]*$` | Stable PO-/W-/P1- | `CM-VAL-002` |
| VAL-CM-S-04 | `uc_ids` | required | minItems 1; unique; `^(UC\\|FR)-` | ≥1 UC/FR | `CM-VAL-001`/`002` |
| VAL-CM-S-05 | `br_ids` | required array | unique; `^BR-`; **minItems 1** unless FIX+WAIVED (root if/then) | BR or waiver | `CM-VAL-004` |
| VAL-CM-S-06 | `ac` | required | minItems 1 | ≥1 AC | `CM-VAL-001` |
| VAL-CM-S-07 | `ac[].id` | required | `^AC-` | Stable id | `CM-VAL-002` |
| VAL-CM-S-08 | `ac[].statement` / `pass_when` | required | minLength 8 | Measurable VI | `CM-VAL-001` |
| VAL-CM-S-09 | `ac[].verify` | required | browser\|api\|jest\|doc_review\|gate_script | Known lane | `CM-VAL-002` |
| VAL-CM-S-10 | `ac[]` | `verify=browser` | required `uf_or_j` pattern `^(UF\\|J\\|J-MOB)-` | Journey linked | `CM-VAL-003` |
| VAL-CM-S-11 | `slice_id` | required | minLength 1 | Slice file target | `CM-VAL-001` |
| VAL-CM-S-12 | `allowed_paths` | required | minItems 1; unique | Non-empty budget | `CM-VAL-001` |
| VAL-CM-S-13 | `forbidden_paths` | required array | unique | Process requires `apps/**` Phase A | `CM-VAL-007` |
| VAL-CM-S-14 | `role_owners` | required | minProperties 1; allow-list keys | ≥1 owner | `CM-VAL-001` |
| VAL-CM-S-15 | `sponsor_confirm.status` | required | PENDING\|CONFIRMED\|WAIVED_HOTFIX_P0\|REJECTED | Known | `CM-VAL-002` |
| VAL-CM-S-16 | `sponsor_confirm` | CONFIRMED\|WAIVED | **required** `date` `YYYY-MM-DD` | Dated | `CM-VAL-001` |
| VAL-CM-S-17 | `change_mode` | required | ADD\|UPGRADE\|FIX | No REPLACE root | `CM-VAL-005` |
| VAL-CM-S-18 | `neo_tags` | required | minItems 1; OS `22` enum | ≥1 neo | `CM-VAL-002` |
| VAL-CM-S-19 | `sponsor_override` | present | extended + rationale≥8 | Explicit | `CM-VAL-001` |
| VAL-CM-S-20 | `promote_os.chapter` | present | const `34-BUSINESS-CHANGE-COMPILER.md` | Fixed | `CM-VAL-002` |
| VAL-CM-S-21 | `pipeline_stage` | optional | intake…closed | Known | `CM-VAL-002` |
| VAL-CM-S-22 | `compiler.mode` | optional | manual\|script\|hybrid | Known | `CM-VAL-002` |
| VAL-CM-S-23 | `traceability` | optional object | `additionalProperties: false`; array items minLength 1; `journey_ids` pattern UF\|J\|J-MOB | Explicit Spec-first refs | `CM-VAL-001`/`002` |
| VAL-CM-S-24 | `traceability.scope_parity_ack` | boolean optional | Process-required when API list+detail in wave | true when ack'd | process `CM-SCOPE-01` |

---

## 4. Process-enforced rules (L2)

| ID | Condition | Rule | Expected | Fail |
|----|-----------|------|----------|------|
| VAL-CM-P-01 | Sheet ≠ Manifest D | Manifest wins; re-compile | `source_artifacts` cites sheet | `CM-VAL-006` |
| VAL-CM-P-02 | Touch `apps/**` / migrate | status ∈ {CONFIRMED, WAIVED} **and** stage ≥ `ready_for_dev` | Dev OK | `CM-VAL-007` |
| VAL-CM-P-03 | status=PENDING | docs only; stage ≤ srs/techspec | No Dev | `CM-VAL-007` |
| VAL-CM-P-04 | status=REJECTED | no mutate | New Manifest | BLOCKED |
| VAL-CM-P-05 | Phase A / docs wave | `forbidden_paths` includes `apps/**` | Docs-only | `CM-VAL-007` |
| VAL-CM-P-06 | DoD / QC | diff ⊆ `allowed_paths` | Slice OK | QA/QC reject |
| VAL-CM-P-07 | Secret in sheet/JSON | Forbidden | Redact | Security FAIL |
| VAL-CM-P-08 | Claim product GO / remaster DONE | Forbidden (U77) | Governance only | QC NO-GO |
| VAL-CM-P-09 | Excel `change_mode`=REPLACE | Use `sponsor_override` | Root ADD/UPGRADE/FIX | `CM-VAL-005` |
| VAL-CM-P-10 | Memory/Compound | Loadout only | Not SoT | Process defect |
| VAL-CM-P-11 | stage ≥ `db_api` | `spec_targets` (+ `traceability.*_refs`) resolve on disk | Paths exist | PASS_TO_BA |
| VAL-CM-P-12 | `verify=browser` product | U65 FE-only zero-seed | Browser evidence | QA FAIL |
| VAL-CM-P-13 | Invent UC/BR | Forbidden | Trace sheet/SRS | BA reject |
| VAL-CM-P-14 | Plane B `impact.db_design=true` | Plane D must set `spec_targets.db_design` before Dev | TR-CM-09 | Gap residual |
| VAL-CM-P-15 | stage ≥ `ready_for_dev` + code paths | `traceability.code_memory_paths` non-empty **or** `neo_tags` includes CODE-MEMORY/DB-MEMORY/CONTRACT-MEMORY with matching allowed_paths | Neo stamp plan | `CM-VAL-009` |
| VAL-CM-P-16 | API journeys in scope | `traceability.scope_parity_ack=true` + list+get-by-id same resolver | U19 | `CM-SCOPE-01` |

---

## 5. Plane B — Batch ledger (process)

Applies to `change-manifest.batch.example.json` (`changes[]`).

| ID | Field | Rule | Fail |
|----|-------|------|------|
| VAL-CM-B-01 | `changes[].change_id` | Unique; recommend `CM-<MODULE>-…` | Reject row |
| VAL-CM-B-02 | `uc_id` | Exists in SRS/inventory when CLOSED/ANSWERED | HOLD |
| VAL-CM-B-03 | `change_mode` | ADD\|UPGRADE\|FIX only | `CM-VAL-005` |
| VAL-CM-B-04 | `decision_status` | OPEN/HOLD → no Dev | STOP |
| VAL-CM-B-05 | `impact.*` true | Plane D `spec_targets` / owners cover lane | Gap |
| VAL-CM-B-06 | `must_keep` | Recommended for RULE_LOCK | Warning |
| VAL-CM-B-07 | Ledger `forbidden_paths` prose | Do not ajv-merge into Plane D blindly | `CM-VAL-008` |
| VAL-CM-B-08 | `runtime` / `gap_class` | QA loadout ≠ product GO | U77 |
| VAL-CM-B-09 | Compile | ≥1 ajv-valid Plane D before Dev | Stall |

**v0.2 residual:** optional `change-batch-ledger.schema.json` — not Phase A blocker.

---

## 6. Deterministic error catalog

| Code | Meaning | Emitter | Consumer |
|------|---------|---------|----------|
| `CM-VAL-001` | Missing required / empty minItems | ajv | Fix → re-emit |
| `CM-VAL-002` | Pattern / enum / const | ajv | Fix token |
| `CM-VAL-003` | browser AC without `uf_or_j` | ajv | Add UF-/J-/J-MOB- |
| `CM-VAL-004` | Empty `br_ids` without FIX+WAIVED | ajv if/then | Add BR or waiver |
| `CM-VAL-005` | Illegal root `change_mode` | ajv / process | `sponsor_override` |
| `CM-VAL-006` | Sheet ≠ Manifest drift | BA | Manifest wins |
| `CM-VAL-007` | Scope/stage/apps guard | PM/QA | STOP Dev |
| `CM-VAL-008` | Plane B treated as Plane D | ba-data / pm | Relabel; compile D |
| `CM-VAL-009` | Missing CODE-MEMORY / neo plan at ready_for_dev | process | Fill `traceability.code_memory_paths` |
| `CM-SCOPE-01` | API wave without scope_parity ack | process (U19) | Ack list↔get-by-id |

Envelope (compiler CLI later): `{ ok:false, code, path, message_vi }` — fail-closed, no partial Dev unlock.

---

## 7. Trace map — Manifest → SRS → TechSpec → DB → API → CODE-MEMORY

Governance Manifest **points** at Spec-first artifacts; it does **not** invent product DDL/API.

| ID | Manifest field / plane | SRS | TechSpec | DB_DESIGN | API_DESIGN | CODE-MEMORY / neo | Gate |
|----|------------------------|-----|----------|-----------|------------|-------------------|------|
| TR-CM-01 | `work_item_id` | Wave / bus id | Trace header | Trace header | Trace header | `WorkItem` in `@CODE-MEMORY` | bus DISPATCHED |
| TR-CM-02 | `uc_ids[]` | **Primary** FR/UC | `ref_srs` | FR→table rows | F.1 «Tham chiếu bước SRS» | `@CODE-MEMORY` **UC** | Spec-first entry |
| TR-CM-03 | `br_ids[]` | BR matrix | BR notes | Constraint/check | Error / rule ids | `@CODE-MEMORY` **BR** | VAL-CM-S-05 |
| TR-CM-04 | `ac[]` + `verify` | AC / Diễn biến | Verify method | Data AC iff any | Contract AC | `TEST-MEMORY` | QA matrix |
| TR-CM-05 | `ac[].verify=browser` + `uf_or_j` / `traceability.journey_ids` | UF/J AC | UI flow | — | — | `UI-MEMORY` / `ROUTE-MEMORY` | L2.5 |
| TR-CM-06 | `ac[].verify=api` | API AC | API map | — | **Primary** METHOD/path | `CONTRACT-MEMORY` | L1 |
| TR-CM-07 | `spec_targets.srs` + `traceability.srs_refs` | **Path SoT** | — | — | — | `DOC-DELTA` | stage≥srs |
| TR-CM-08 | `spec_targets.tech_spec` + `tech_spec_refs` | — | **Path SoT** + `ref_srs` | — | — | `DOC-DELTA` / `CONTRACT-MEMORY` | stage≥techspec |
| TR-CM-09 | `spec_targets.db_design` + `db_design_refs` | — | — | **Path SoT** + tables | DTO↔column | `DB-MEMORY` | stage≥db_api |
| TR-CM-10 | `spec_targets.api_design` + `api_design_refs` | — | — | — | **Path SoT** + F.1 | `CONTRACT-MEMORY` | stage≥db_api |
| TR-CM-11 | `traceability.code_memory_paths` + `neo_tags` | — | — | — | — | **Files must stamp neo** | stage≥ready_for_dev / `CM-VAL-009` |
| TR-CM-12 | `slice_id` + allowed/forbidden + `must_keep` | Story boundary | Slice scope | Tables in slice | Endpoints in slice | Feature slice OS `22` | DoD diff |
| TR-CM-13 | `sponsor_confirm` + `pipeline_stage` | Gate before confirm | Gate | Gate | Gate | No code without confirm | VAL-CM-P-02 |
| TR-CM-14 | `read_first[]` | SRS first | Then TS | Then DB | Then API | `spec_read_ack` order (`14`) | Task packet |
| TR-CM-15 | Plane B `change_id` → Plane D | Provenance | — | impact.db | impact.api | — | VAL-CM-B-09 |
| TR-CM-16 | `traceability.scope_parity_ack` | — | — | — | list↔get-by-id | BE test neo | `CM-SCOPE-01` / U19 |

### 7.1 Stage vs required targets (PROCESS)

| `pipeline_stage` | Must resolve |
|-------------------|--------------|
| `intake` | `source_artifacts` recommended |
| `srs` | `spec_targets.srs` (+ `srs_refs` if `traceability` present) |
| `techspec` | srs + tech_spec |
| `db_api` | srs + tech_spec + db_design + api_design |
| `ready_for_dev` | All four + slice file + CONFIRMED/WAIVED + neo/CODE-MEMORY plan (TR-CM-11) |
| `qa` / `qc` | + evidence paths in AC / dispatch |

**scope_parity:** For **this** compiler docs wave = **N/A** (no product list/get-by-id). For product Manifests with API journeys → VAL-CM-P-16 / TR-CM-16.

---

## 8. CHOT Excel → Manifest bridge (pilot)

Human plane: `SPONSOR_CHOT_FILL*.xlsx` sheet `00_Chot_Sponsor` (see `CHANGE_MANIFEST_EXCEL_COLUMNS.md`).

| CHOT column | Maps into |
|-------------|-----------|
| G QUYẾT ĐỊNH | `sponsor_confirm.status` (+ CONFIRMED) |
| H Ghi chú | `sponsor_confirm.notes` |
| I Ngày | `sponsor_confirm.date` (`dd/MM/yyyy` → `YYYY-MM-DD`) |
| C Mã / D Câu hỏi | AC statement / summary (BA rewrite measurable) |
| decision → UC | Plane B row → Plane D `uc_ids` via gap matrix — **không** invent |

Compiler **must not** treat CHOT as product DB.

---

## 9. Alignment checklist

| # | Check | Status |
|---|-------|--------|
| 1 | Schema Plane D title + v0.1.1 + if/then (browser, date, br_ids) | DONE |
| 2 | Optional `traceability` ADD (VAL-CM-S-23, TR-CM-07..11) | DONE (this seat) |
| 3 | Dispatch sample ajv PASS | DONE (`change-manifest.dispatch.example.json`) |
| 4 | Batch sample = Plane B only | DONE (`.batch.example.json`) |
| 5 | TR-CM-01..16 Spec-first chain | DONE |
| 6 | HRM Plane D samples + gold (`examples/change-manifest.sample.json`) ajv PASS with `traceability` + browser⇒`uf_or_j` + CONFIRMED⇒`date` | DONE BA-PROC-01 |
| 7 | No `apps/**` | PASS |

---

## 10. Data quality risks

| Risk | Mitigation |
|------|------------|
| Dual-write sheet↔JSON | VAL-CM-P-01 Manifest wins |
| Plane B as D | VAL-CM-PLANE-* / `CM-VAL-008` |
| Empty BR on ADD | VAL-CM-S-05 |
| Browser AC no journey | VAL-CM-S-10 |
| Premature apps/** | VAL-CM-P-02/05 |
| Ready_for_dev without neo plan | TR-CM-11 / `CM-VAL-009` |
| API without scope parity | TR-CM-16 / `CM-SCOPE-01` |

---

## 11. Acceptance (this work item)

| AC | Pass when |
|----|-----------|
| AC-CM-VAL-01 | Matrix on disk: Plane D/B + VAL-CM-* + CM-VAL-* + TR-CM-01..16 |
| AC-CM-VAL-02 | Schema v0.1.1 ADD `traceability` + prior if/then kept |
| AC-CM-VAL-03 | Evidence + PASS_TO_PM |
| AC-CM-VAL-04 | No `apps/**` |

---

## 12. References

- ADR — `docs/architecture/ADR-BUSINESS-CHANGE-COMPILER-20260805.md`
- Schema — `docs/program/schemas/change-manifest.schema.json`
- Excel — `docs/program/schemas/CHANGE_MANIFEST_EXCEL_COLUMNS.md`
- Compound — `docs/program/COMPOUND_MEMORY_INTEGRATION_CHECKLIST.md`
- OS `14` / `22` / Spec-first `02` / `13`
- U77 — `docs/program/TEAM_USER_REQUIREMENTS.md`
- Evidence — `docs/qa/evidence/po-biz-change-compiler-ba-data-01.md`


