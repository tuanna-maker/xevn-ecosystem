# Evidence — PO-HRM-BP-ATT-SIGN-DB-API-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-BP-ATT-SIGN-DB-API-01` |
| **from_role** | ba-data |
| **to_role** | sa (recommended) · pm |
| **date** | 2026-08-05 |
| **lane** | governance · Spec-first Manifest pilot |
| **change_manifest_path** | `docs/program/examples/change-manifest.sample.json` |
| **ack_status** | **READY_FOR_SA** |
| **stall_recovery** | **YES** — re-sealed evidence + on-disk anchors after TR-CM-09/10 OPEN from `po-hrm-bp-att-sign-ts-01.md` |
| **apps/** | **not touched** |
| **Attendance CLOSED / product GO / D7 signed / Face LIVE** | **not claimed** |

---

## 1. Purpose

Close Manifest **TR-CM-09** and **TR-CM-10** for ATT-SIGN: physical logical table `att_timesheet_sign_step` (DB §4.6.1) and API F.1 **F-ATT-WF-SIGN-01/02**; align **F-ATT-SHEET-02** preconditions with **BR-BP-TS-02**; advance `pipeline_stage` → **`db_api`**.

Prior: `docs/qa/evidence/po-hrm-bp-att-sign-ts-01.md` (TechSpec §6.4 PASS_TO_PM).

---

## 2. spec_read_ack

| Artifact | Path / § | Status |
|----------|----------|--------|
| **Manifest** | `docs/program/examples/change-manifest.sample.json` | READ + UPDATED — `pipeline_stage=db_api`, `spec_targets.db_design` / `api_design` |
| **SRS** | `SRS_HRM_ENTERPRISE.md` **FR-UC-BP-ATT-11** · Luồng #1–#4 · Diễn biến #1–#3 · **BR-BP-TS-02** | READ |
| **TechSpec** | `TECHSPEC_HRM_ENTERPRISE.md` **§6.4** · §6.4.3–6.4.4 | READ · **UPDATED** db_api closure stamp |
| **DB_DESIGN** | `DB_DESIGN_HRM_ENTERPRISE.md` **§4.6.1** `att_timesheet_sign_step` | **ADD** |
| **API_DESIGN** | `API_DESIGN_HRM_ENTERPRISE.md` **F-ATT-WF-SIGN-01/02** · **F-ATT-SHEET-02** (preconditions) · F-ATT-SHEET-03 sign archive | **ADD/UPGRADE** |
| **Slice** | `docs/program/slices/HRM-ATT-SIGN-01.md` | **UPDATED** DoD |
| **Validation** | `CHANGE_MANIFEST_VALIDATION_MATRIX.md` TR-CM-09/10 · VAL-CM-P-11 | **PASS** (paths on disk) |

```markdown
## spec_read_ack (handoff)
- srs: `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` FR-UC-BP-ATT-11 · Diễn biến #1–#3 · BR-BP-TS-02 · R-SIGN-01
- tech_spec: `TECHSPEC_HRM_ENTERPRISE.md` §6.4 · FR-UC-BP-ATT-11 · WF XBOS consumer boundary
- db_design: `DB_DESIGN_HRM_ENTERPRISE.md` §4.6.1 · bảng `att_timesheet_sign_step` · FK header · UQ step/vòng · reopen archive
- api_design: `API_DESIGN_HRM_ENTERPRISE.md` · POST/GET signatures F.1 · F-ATT-SHEET-02 evaluator preconditions P1–P5
- sponsor_confirm: CONFIRMED 2026-08-05 · wave PO-HRM-BP-SRS-CHOT-01
- change_mode: ADD (logical design only)
```

---

## 3. Deliverables

| # | Artifact | Change |
|---|----------|--------|
| 1 | `DB_DESIGN_HRM_ENTERPRISE.md` | ADD **§4.6.1** · ERD · §9 catalog · DOC-DELTA stamp |
| 2 | `API_DESIGN_HRM_ENTERPRISE.md` | ADD **F-ATT-WF-SIGN-01/02** F.1; UPGRADE **F-ATT-SHEET-02/03**; §7 trace row; DOC-DELTA |
| 3 | `TECHSPEC_HRM_ENTERPRISE.md` | §6.4.3–6.4.4 align (F.1 PASS · DB SoT); header DOC-DELTA db_api |
| 4 | `change-manifest.sample.json` | `pipeline_stage=db_api` · `spec_targets` + `db_design_refs` / `api_design_refs` |
| 5 | `HRM-ATT-SIGN-01.md` | DoD db/api checked |
| 6 | This evidence | ba-data handoff |

---

## 4. BR-BP-TS-02 ↔ F-ATT-SHEET-02 alignment (evaluator)

| Rule (SRS BR-BP-TS-02) | DB §4.6.1 | API |
|------------------------|-----------|-----|
| Chưa đủ chữ ký bắt buộc WF → không mở PAY / không `closed` | Evaluator trên rows active; `rejected` → cấm close | F-ATT-SHEET-02 **P3** `409 HRM-ATT-SIGN-INCOMPLETE` |
| NV phải xác nhận (must_keep) | Rule `persona_role=employee` approved | **P4** + F-ATT-WF-SIGN-01 step (8) |
| Một bên từ chối → sheet không chốt | `outcome=rejected` active | **P2**; F-ATT-WF-SIGN-01 (6) |
| Chỉ `submitted` mới ký / chốt | Insert sign_step only when `submitted`; `closed` → 409 | F-ATT-WF-SIGN-01 (2); F-ATT-SHEET-02 **P1** |
| Reopen tách vòng ký | `archived_at` on active steps | F-ATT-SHEET-03 |

Manifest `BR-ATT-SIGN-01` = **alias** compiler id → cùng quy tắc **BR-BP-TS-02** (see TechSpec §6.4 meta).

---

## 5. TR-CM-09 / TR-CM-10

| ID | Verdict | Evidence |
|----|---------|----------|
| **TR-CM-09** | **PASS** | `spec_targets.db_design` → §4.6.1 on disk; columns/FK/UQ/IX + BR rules |
| **TR-CM-10** | **PASS** | `spec_targets.api_design` → F-ATT-WF-SIGN-01/02 full F.1; F-ATT-SHEET-02 ↔ BR-BP-TS-02 |
| **VAL-CM-P-11** | **PASS** | `pipeline_stage=db_api`; `traceability.db_design_refs` + `api_design_refs` resolve |

**Still OPEN (by design):** TR-CM-16 `scope_parity_ack: false` — SA/Dev at `ready_for_dev`.

---

## 6. On-disk verification (stall recovery anchors)

| Check | Path | Anchor |
|-------|------|--------|
| DB table | `DB_DESIGN_HRM_ENTERPRISE.md` | `#### 4.6.1 att_timesheet_sign_step` |
| DB DOC-DELTA | same | `DOC-DELTA PO-HRM-BP-ATT-SIGN-DB-API-01` |
| API POST sign | `API_DESIGN_HRM_ENTERPRISE.md` | `F-ATT-WF-SIGN-01` + `POST …/signatures` |
| API GET sign | same | `F-ATT-WF-SIGN-02` |
| Close preconditions | same | `F-ATT-SHEET-02` · `Preconditions (BR-BP-TS-02` · P1–P5 |
| Trace map | same §7.3 | `F-ATT-WF-SIGN-01/02` · `att_timesheet_sign_step` |
| Manifest stage | `change-manifest.sample.json` | `"pipeline_stage": "db_api"` |
| Slice DoD | `HRM-ATT-SIGN-01.md` | DB_DESIGN §4.6.1 checkbox **[x]** |

---

## 7. completion_report

**Closed:** Logical DB sign-step entity; WF signature POST/GET contracts; terminal close preconditions tied to BR-BP-TS-02 and active sign rows; Manifest stage **db_api**; slice DoD updated; evidence re-sealed with on-disk anchors.

**Open:** SA review (scope parity checklist, OpenAPI path naming vs Nest AS-IS); `ready_for_dev` gate; product UF-HRM-ATT-SIGN (AC-ATT-SIGN-04); no migrations/code.

---

## 8. next_owner / next_dispatch_prompt

| Field | Value |
|-------|--------|
| **next_owner** | `sa` |
| **ack_status target** | SA **PASS_TO_PM** or `READY_FOR_DEV` waiver note |

**next_dispatch_prompt (copy-ready):**

```text
work_item_id: PO-HRM-BP-ATT-SIGN-SA-01 (or extend PO-HRM-BP-ATT-SIGN-DB-API-01 SA lane)
role: sa
read_first: docs/qa/evidence/po-hrm-bp-att-sign-db-api-01.md · TECHSPEC §6.4 · DB §4.6.1 · API F-ATT-WF-SIGN + F-ATT-SHEET-02
entry_criteria: TR-CM-09/10 PASS on disk; pipeline_stage=db_api in Manifest
exit_criteria: Confirm scope_parity for GET/POST signatures vs list sheets; ADR note if Nest path differs; set traceability.scope_parity_ack plan; no apps/**
evidence_path: docs/qa/evidence/po-hrm-bp-att-sign-sa-01.md
forbidden: apps/** · migrations · claim Attendance CLOSED
```

---

## 9. pm_dispatch_hint

Promote Manifest gold sample **`pipeline_stage=db_api`** is set — PM may dispatch **SA** before any Dev unlock. Do **not** advance to `ready_for_dev` until SA signs scope parity + sponsor product wave for AC-ATT-SIGN-04.

---

*End evidence PO-HRM-BP-ATT-SIGN-DB-API-01.*
