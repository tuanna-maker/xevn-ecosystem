# Evidence — PO-HRM-BP-ATT-SIGN-TS-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-BP-ATT-SIGN-TS-01` |
| **from_role** | sa |
| **to_role** | pm |
| **date** | 2026-08-05 |
| **lane** | governance · Spec-first (U77 Manifest → pipeline pilot #1) |
| **change_manifest_path** | `docs/program/examples/change-manifest.sample.json` |
| **ack_status** | **PASS_TO_PM** |
| **apps/** | **not touched** |
| **Attendance CLOSED / product GO / D7 signed / Face LIVE** | **not claimed** |

---

## 1. Purpose

First **Spec-first** wave from gold Plane D Manifest (**ATT-SIGN**): lift `spec_targets.tech_spec` from HOLD; ADD TechSpec depth **only** where Manifest + existing SRS gap vs paper depth; map TR-CM-01..16; prepare `db_api` handoff without Dev unlock.

Prior gate: `docs/qa/evidence/po-biz-change-compiler-qa-01.md` — Plane D ajv 8/8 · GWC OS promote closed.

---

## 2. spec_read_ack

| Artifact | Path / § | Status |
|----------|----------|--------|
| **Manifest (gold)** | `docs/program/examples/change-manifest.sample.json` | READ — `work_item_id` PO-HRM-BP-ATT-SIGN-TS-01 · `pipeline_stage=techspec` · forbidden `apps/**` |
| **Schema** | `docs/program/schemas/change-manifest.schema.json` v0.1.1 | READ |
| **Validation matrix** | `docs/program/schemas/CHANGE_MANIFEST_VALIDATION_MATRIX.md` TR-CM-01..16 | READ |
| **ADR compiler** | `docs/architecture/ADR-BUSINESS-CHANGE-COMPILER-20260805.md` | CITED — Manifest feeds Spec-first |
| **SRS** | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` **FR-UC-BP-ATT-11** | READ — 7 mục · R-SIGN-01 · BR-BP-TS-02 |
| **TechSpec (before)** | `TECHSPEC_HRM_ENTERPRISE.md` §6.1–6.3 | READ — funnel A5 only; ATT-11 lumped in FR map |
| **TechSpec (after)** | `TECHSPEC_HRM_ENTERPRISE.md` **§6.4** | **ADD** DOC-DELTA this wave |
| **API (as-is)** | `API_DESIGN_HRM_ENTERPRISE.md` F-ATT-SHEET-01..04 | READ — close monolithic; thiếu WF step F.1 |
| **DB (as-is)** | `DB_DESIGN_HRM_ENTERPRISE.md` §4.6 `att_timesheet_*` | READ — thiếu bảng bước ký |
| **Gap matrix** | `UC_MEETING_PRODUCT_GAP_MATRIX.md` UC-BP-ATT-11 · R-SIGN-01 | CITED — ANSWERED |
| **Slice** | `docs/program/slices/HRM-ATT-SIGN-01.md` | **CREATED** |

### Manifest extract (pilot fields)

| Field | Value |
|-------|--------|
| `uc_ids` | `UC-BP-ATT-11` |
| `br_ids` | `BR-ATT-SIGN-01` (compiler id — **alias** SRS `BR-BP-TS-02`) |
| `slice_id` | `HRM-ATT-SIGN-01` |
| `uf_or_j` (browser AC) | `UF-HRM-ATT-SIGN` (`AC-ATT-SIGN-04`) |
| `journey_ids` | `UF-HRM-ATT-SIGN`, `J-HRM-06`, `J-HRM-06b` |
| `forbidden_paths` | `apps/**`, `packages/**`, `deploy/**` |
| `sponsor_confirm` | CONFIRMED 2026-08-05 · wave `PO-HRM-BP-SRS-CHOT-01` |

---

## 3. Gap analysis (Manifest vs SRS vs paper depth)

| Topic | SRS / chốt | Paper before | Action this wave |
|-------|------------|--------------|------------------|
| Ba bên NV+QL+HR | FR-UC-BP-ATT-11 | Implied in F-ATT-SHEET-02 | **§6.4** explicit + sequence |
| XBOS WF per tenant | R-SIGN-01 CLOSED | Not in TechSpec ATT | **§6.4.2** integration rules |
| Terminal close + PAY | A5 · I-6 | §6.2 funnel | **§6.4.1** state table |
| Per-step sign API/DB | Diễn biến #2 | Missing | **Residual** F-ATT-WF-SIGN + `att_timesheet_sign_step` → `db_api` |
| BR id in Manifest | BR-ATT-SIGN-01 | SRS uses BR-BP-TS-02 | **Alias note** — ba-process optional matrix row |

**No new UC invented** beyond Manifest `UC-BP-ATT-11` and SRS FR already present.

---

## 4. Deliverables (this seat)

| # | Artifact | Change |
|---|----------|--------|
| 1 | `TECHSPEC_HRM_ENTERPRISE.md` | ADD **§6.4** · header DOC-DELTA stamp |
| 2 | `change-manifest.sample.json` | `spec_targets.tech_spec` → §6.4 path; `tech_spec_refs` filled |
| 3 | `docs/program/slices/HRM-ATT-SIGN-01.md` | CREATE slice map |
| 4 | This evidence | SA sign-off techspec stage |

---

## 5. TR-CM-01..16 satisfaction

| ID | Status | Notes |
|----|--------|-------|
| TR-CM-01 | PASS | `work_item_id` on bus + evidence |
| TR-CM-02 | PASS | `uc_ids` → FR-UC-BP-ATT-11 |
| TR-CM-03 | PASS* | `BR-ATT-SIGN-01` = alias → **BR-BP-TS-02** (*ba-process matrix optional) |
| TR-CM-04 | PASS | AC-ATT-SIGN-01..04 mapped §6.4.5 |
| TR-CM-05 | PARTIAL | Browser AC compile-time only; journey not 🟢 in matrix yet |
| TR-CM-06 | N/A | No `verify=api` AC in Manifest |
| TR-CM-07 | PASS | `spec_targets.srs` + srs_refs resolve |
| TR-CM-08 | PASS | `spec_targets.tech_spec` + §6.4 + `ref_srs` |
| TR-CM-09 | **OPEN** | `spec_targets.db_design` not in Manifest — proposed table in §6.4.4 |
| TR-CM-10 | **OPEN** | F-ATT-WF-SIGN F.1 not written — pointer only |
| TR-CM-11 | N/A | stage `< ready_for_dev` |
| TR-CM-12 | PASS | slice + allowed/forbidden + must_keep |
| TR-CM-13 | PASS | CONFIRMED + techspec stage |
| TR-CM-14 | PASS | read_first order honored in spec_read_ack |
| TR-CM-15 | PASS | Plane B `CM-HRM-ATT-011` → this Plane D |
| TR-CM-16 | **OPEN** | `scope_parity_ack: false` — required at product API wave |

**Stage gate (§7.1 matrix):** `pipeline_stage=techspec` → srs + tech_spec **PASS**. Next stage **`db_api`** requires TR-CM-09/10 closure.

---

## 6. Manifest AC verdict (doc_review / gate)

| AC | Verdict | Evidence |
|----|---------|----------|
| AC-ATT-SIGN-01 | **PASS** | TechSpec path + §6.4 ref_srs FR-UC-BP-ATT-11 |
| AC-ATT-SIGN-02 | **PASS** | §6.4.2 XBOS configurable WF |
| AC-ATT-SIGN-03 | **PASS** | No apps/** in diff |
| AC-ATT-SIGN-04 | **DEFERRED** | Product browser — qa when `ready_for_dev` |

---

## 7. Architecture decision summary

**Option A (chosen):** Extend meeting-locked TechSpec with **§6.4** workflow layer; keep F-ATT-SHEET-02 as terminal; ADD logical F-ATT-WF-SIGN + sign-step table in **next** ba-data wave.

**Option B (rejected):** Treat F-ATT-SHEET-02 alone as full UC-11 — **FAIL** R-SIGN-01 (multi-step WF + audit).

**Option C (deferred):** Full XBOS WF TechSpec chapter — out of slice; pointer §6.4.2 enough for ATT sign.

---

## 8. Residual

| ID | Owner | Trigger |
|----|-------|---------|
| R-ATT-SIGN-DB-01 | **ba-data** | `att_timesheet_sign_step` + header rules in DB_DESIGN §4.6 |
| R-ATT-SIGN-API-01 | **ba-data** / sa review | F-ATT-WF-SIGN-01/02 F.1 (purpose · nghiệp vụ · bước SRS) |
| R-ATT-SIGN-BR-01 | **ba-process** | BR-ATT-SIGN-01 ↔ BR-BP-TS-02 alias row (optional) |
| R-ATT-SIGN-J-01 | **ba-process** | Register `UF-HRM-ATT-SIGN` in `PROGRAM_JOURNEY_MAP.md` when product scheduled |
| R-ATT-SIGN-SCOPE-01 | **dev-be** + qa | `scope_parity_ack` at Dev |

---

## 9. completion_report

**Closed:** First U77 Spec-first pilot — Manifest tech_spec HOLD cleared; TechSpec §6.4 ADD; gold sample traceability updated; slice HRM-ATT-SIGN-01 created; TR-CM-07/08 PASS for `techspec` stage.

**Open:** DB/API F.1 depth (TR-CM-09/10); browser UF-HRM-ATT-SIGN; scope parity; D7; Dev.

---

## 10. next_owner

**ba-data** (primary) — with **pm** dispatch `PO-HRM-BP-ATT-SIGN-DB-API-01` or equivalent.

---

## 11. next_dispatch_prompt

```text
work_item_id: PO-HRM-BP-ATT-SIGN-DB-API-01
from_role: pm
to_role: ba-data
lane: governance · Spec-first
priority: P0
change_manifest_path: docs/program/examples/change-manifest.sample.json

entry_criteria:
- docs/qa/evidence/po-hrm-bp-att-sign-ts-01.md PASS_TO_PM
- TECHSPEC_HRM_ENTERPRISE.md §6.4 READ (ref_srs FR-UC-BP-ATT-11)
- API_DESIGN F-ATT-SHEET-01..04 READ; DB_DESIGN §4.6 READ

mission:
1. ADD DB_DESIGN §4.6.1 `att_timesheet_sign_step` (columns/FK/index) per §6.4.4 — no invent UC beyond UC-BP-ATT-11
2. ADD API_DESIGN F-ATT-WF-SIGN-01/02 with full F.1 (Mục đích · Nghiệp vụ · Tham chiếu bước SRS Diễn biến #2)
3. Align F-ATT-SHEET-02 preconditions with WF completion (BR-BP-TS-02)
4. UPDATE slice HRM-ATT-SIGN-01.md DoD checkboxes + evidence docs/qa/evidence/po-hrm-bp-att-sign-db-api-01.md
5. Propose Manifest pipeline_stage → db_api when spec_targets.db_design + api_design paths filled

exit_criteria:
- TR-CM-09/10 PASS; VAL-CM-P-11 paths exist on disk
- ack_status READY_FOR_SA or PASS_TO_PM
- forbidden_paths: apps/** packages/**

cấm: migrations · claim Attendance CLOSED · seed · product GO
```

---

## 12. Handoff

| Field | Value |
|-------|--------|
| **evidence_path** | `docs/qa/evidence/po-hrm-bp-att-sign-ts-01.md` |
| **ack_status** | **PASS_TO_PM** |
