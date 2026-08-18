# Evidence — PO-HRM-MVP-GD1-ATT-04B-CLUSTER-QA-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-MVP-GD1-ATT-04B-CLUSTER-QA-01` |
| **program** | `PO_HRM_MVP_GD1_CONTINUOUS` (U89 Wave-33 · UC-BP-ATT-04b) |
| **lane** | execution · **qa** |
| **Date** | 2026-08-10 |
| **stamp** | `ATT04BQA1-MSM3S8FG` |
| **ack_status** | **PASS_TO_PM** |
| **overall** | **PASS** |
| **uc_ids** | `UC-BP-ATT-04b` · `FR-UC-BP-ATT-04b` · `BR-BP-LV-07` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · embed `companyId=main` · runner OU `holding` (effective catalog) |
| **Honesty** | `attendance_uat_ready=false` · **≠ ATT-04b / FR-04b DONE** · **≠ ATT-04 DONE** · **≠ ATT UAT** · **C-SLICE** · printable **false** · PAY **OUT** · Nest `/core` **DENY** · U65 zero-seed |
| **depends_on** | FE-01 READY · BE-01 READY · BA `PO-HRM-MVP-GD1-ATT-04B-CLUSTER-BA-01` J-01..06 · must_keep **ATT04QC1-MSM22G4W** · **ATT09QC1-MSLUTL9D** · **ATT03DQC1-MSM1CR19** |
| **env** | portal `:5173` · hrm-api `:28001` · xbos `:28002` · commit `dc930c5` |
| **runner** | `scripts/qa/_tmp-po-hrm-mvp-gd1-att-04b-cluster-qa-01.mjs` |
| **raw JSON** | `docs/qa/evidence/_tmp-po-hrm-mvp-gd1-att-04b-cluster-qa-01.json` |
| **screens** | `docs/qa/evidence/screens/po-hrm-mvp-gd1-att-04b-cluster-qa-01/` |

---

## Verdict

| Gate | Result |
|------|--------|
| **Overall** | **PASS** · `PASS_TO_PM` · **C-SLICE** · **DENY** claim ATT-04b / FR-04b / ATT UAT DONE |
| **L0** | `qc:fe-be-health` exit **0** · hrm/xbos/portal **200** · Nest `/core/attendance/leave-*` probe **404** |
| **L2.5 J-*** | J-01..03 **PASS** (mandatory) · J-04/05 **PASS_WITH_HOLD** (BA-allowed) · J-06 **PASS** |
| **Nest `/core` leave SoT** | non-404 on run = **0** |
| **Seed** | **none** (U65) |

**Explicit ≠ DONE:** over-bal branch · cap CRUD browser E2E · F-ATT-LEAVE-04 offset · PAY bridge · **≠ FR-04b Diễn biến #1 DONE** until branch LIVE.

---

## Browser U65 — journeys

Persona: portal auth inject · `/hr/attendance` · **Thiết lập → Quy định nghỉ** / **Nghỉ phép → Tạo yêu cầu** · zero-seed.

**Harness note:** `sessionStorage['hrm:operating-unit-filter']='holding'` so `GET …/leave-types/effective?company_id=holding` populates `catalog-search-picker` (rollup `main` alone returns effective **0** — product residual for group CEO picker).

| J-* | Click path / assert | Network / FE | Verdict |
|-----|---------------------|--------------|---------|
| **J-HRM-ATT-04B-01** | Quy định nghỉ → tạo loại `TYPE_ADV` → **Cho phép ứng phép** ON → Lưu → GET verify | **PUT** `/api/hrm/attendance/leave-types` **200** · `allowsAdvance=true` · Nest `/core` **0** | **PASS** |
| **J-HRM-ATT-04B-02** | Nghỉ phép → Tạo → chọn NV → `leave-balance-panel` | Panel có nhãn **Ứng phép** · Nest **0** | **PASS** |
| **J-HRM-ATT-04B-03** | Tạo `annual` (FE) · ứng OFF · grant entitled **0** · 09–10/02/2026 → **Gửi** | **PUT** tracked-entitlement **200** · **POST** leave-requests **400** `HRM-LEAVE-VAL-BALANCE` · `att-04b-balance-reject` · dialog open · Nest **0** | **PASS** |
| **J-HRM-ATT-04B-04** | Tạo dialog · over-bal UX | Footer `att-04b-over-bal-hold` · no `att-04b-over-bal-dialog` LIVE (`ATT_04B_BALANCE_RESOLUTION_API_LIVE=false`) | **PASS_WITH_HOLD** |
| **J-HRM-ATT-04B-05** | Quy tắc quỹ · cap inputs | `hdsd-att-lvrule-advance-max-days` visible · browser policy POST not completed (409 duplicate) · `att-04b-cap-hold` | **PASS_WITH_HOLD** |
| **J-HRM-ATT-04B-06** | `att-04b-honesty` · F5 | `≠ ATT-04b/FR-04b/ATT UAT` · C-SLICE · peer seals **RETAIN** (not flipped in banner) · Nest **0** | **PASS** |

**hdsd_align:** `hdsd-att-leave-type-allows-advance` · `catalog-search-picker` · `att-04-grant-panel` · `hdsd-att-grant-save` · `att-04b-balance-reject` · `att-04b-over-bal-hold` · `att-04b-cap-hold` · `att-04b-honesty`.

---

## Network summary

| Metric | Value |
|--------|-------|
| SoT path | `/api/hrm/attendance/*` only on mutate evidence |
| Nest `/core` leave non-404 | **0** |
| Leave create (J-03) | **POST** **400** `HRM-LEAVE-VAL-BALANCE` (2 working days · available 0) |
| Grant (J-03) | **PUT** `/attendance/leave-balance/tracked-entitlement` **200** |
| LVT mutate (J-01) | **PUT** `/attendance/leave-types` **200** |

---

## Residual (PASS_WITH_HOLD — not seat FAIL)

| ID | Note |
|----|------|
| **R-ATT-04B-OVER-BAL** | `att-04b-over-bal-hold` · balance_resolution API not LIVE |
| **R-ATT-04B-CAP-CRUD** | Cap fields visible · browser policy save not E2E (duplicate policy 409 on API seed) |
| **R-MAIN-EFFECTIVE-EMPTY** | `leave-types/effective?company_id=main` → **0** rows · group CEO create picker empty unless OU `holding` or catalog bootstrap (FE product follow-up) |

---

## must_keep (RETAIN)

| Stamp | Status |
|-------|--------|
| **ATT04QC1-MSM22G4W** | RETAIN · no wipe LVT/LVRULE |
| **ATT09QC1-MSLUTL9D** | RETAIN · `pending_days` / DENY `att_leave_hold` |
| **ATT03DQC1-MSM1CR19** | RETAIN · no GPS regression |
| **C-SLICE** | honesty **false** for module UAT |
| **printable false** · **PAY OUT** | verified in honesty footer |

---

## completion_report

- **Closed:** J-HRM-ATT-04B-01..03 mandatory PASS · J-04/05 PASS_WITH_HOLD per BA · J-06 honesty · L0 · Nest `/core` 0 · U65 browser path for gate 400 + banner.
- **Open:** over-bal LIVE branch · cap policy browser E2E · effective catalog on rollup `main` for picker (residual above).

## next_owner

`qc`

## next_dispatch_prompt

```text
work_item_id: PO-HRM-MVP-GD1-ATT-04B-CLUSTER-QC-01
entry_criteria: docs/qa/evidence/po-hrm-mvp-gd1-att-04b-cluster-qa-01.md PASS_TO_PM stamp ATT04BQA1-MSM3S8FG; J-01..03 PASS; J-04/05 PASS_WITH_HOLD documented; Nest /core 0; C-SLICE; ≠ ATT-04b/FR-04b/ATT UAT DONE
exit_criteria: QC GWC C-SLICE on ATT-04b cluster; audit residuals R-ATT-04B-OVER-BAL · R-ATT-04B-CAP-CRUD · R-MAIN-EFFECTIVE-EMPTY; must_keep ATT04QC1-MSM22G4W · ATT09 · ATT03D; printable false PAY OUT; evidence docs/qa/evidence/po-hrm-mvp-gd1-att-04b-cluster-qc-01.md
ack_status: PASS_TO_PM or GO WITH CONDITIONS with explicit HOLD list (not module DONE)
```
