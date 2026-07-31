# QA-REC-HDSD-COVERAGE-01B-RET — Batch B HDSD Ch07 §3–§15 forms (retest)

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-REC-HDSD-COVERAGE-01B-RET` |
| **parent** | `QA-REC-HDSD-COVERAGE-01B` · program `P-REC-E2E-13STEP-01` · U76 · U65 |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **date** | 2026-08-01 (ICT) · wall 2026-07-31 local |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **portal_url** | `http://14.225.217.232:8088` |
| **entry** | `DO-REC-8088-JOBREQ-UI-EXPORT-01` READY_FOR_QA · VPS `e3d41b1` · `hasExport=1` |
| **prior_fail** | `docs/qa/evidence/qa-rec-hdsd-coverage-01b-20260801.md` |
| **ops_evidence** | `docs/ops/evidence/do-rec-8088-jobreq-ui-export-01-20260801.md` |
| **hdsd_align** | `true` · inventory `docs/qa/HDSD_REC_MENU_FUNCTION_INVENTORY.md` §1 ~L70–110 |
| **hdsd_sot** | `docs/client-delivery/hdsd/hrm/HDSD_XEVN_CH07_HRM_TUYEN_DUNG.md` |
| **harness** | `scripts/qa/qa-rec-hdsd-coverage-01b-browser.mjs` |
| **runtime** | `docs/qa/evidence/_tmp-qa-rec-hdsd-coverage-01b-ret-runtime.json` |
| **yctd_spot** | `docs/qa/evidence/_tmp-qa-rec-01b-ret-yctd-spot.json` |
| **screens** | `docs/qa/evidence/screens/qa-rec-hdsd-coverage-01b-ret-20260801/` |
| **ack_status** | **PASS_TO_PM** |

## Executive verdict

**PASS_TO_PM** — Prior P0 (Recruitment blank Lazy / missing `REQUISITION_EMPTY_JD_LIBRARY_HINT_VI`) is **CLOSED** on Dev8088. Recruitment **mounts**; Batch B **44/44** inventory rows verdicted; **0🔴**.

| Gate | Result |
|------|--------|
| L0 `:8088` | **200** |
| XBOS login | **201** |
| Vite `jobRequisitionUi.ts` `hasExport` | **1** (len≈30516 · not SPA) |
| `pageErrors` SyntaxError / missing export | **[]** |
| Empty-JD hint live in form | **PASS** — exact copy *«Chưa có JD trong thư viện — tạo JD trước…»* |
| SoftDel / BH | **OOS** (cấm) |
| Seed | **None** (U65) |

Mutate AC: YCTD **form opens**; **Lưu yêu cầu disabled** until JD selected — library empty → **no POST 2xx** (honest 🟡, not false 🟢). Orphan Offer → 🟡 `product_gap`. Inbox → 🟡 (no fake seed). Residual P1: `Gửi duyệt QT` → `POST …/submit-workflow?company_id=holding` **404**.

### Counts (Batch B RET)

| Verdict | Count | Notes |
|---------|------:|-------|
| 🟢 | **23** | Mounted tabs/CTAs/dialogs + policy rows; **+1** vs harness raw via YCTD spot (`Thêm yêu cầu` + form) |
| 🟡 | **20** | Empty JD blocks Lưu; validation; Inbox; Offer gap; submit-workflow 404 |
| 🔴 | **0** | Prior blank-page class cleared |
| ⬜ | **1** | FE-extra Import CTA not visible |
| **Total** | **44** | |

Harness raw JSON: `{ green:22, yellow:21, red:0, white:1 }` — spot promotes `CH07-§3-Tạo-yêu-cầu` 🟡→🟢 (tab click › `Thêm yêu cầu` › dialog).

---

## Spec says / code does

| Spec / prior FAIL | Observed RET |
|-------------------|--------------|
| VPS missing `REQUISITION_EMPTY_JD_LIBRARY_HINT_VI` → Lazy crash | **CLOSED** — module has export; form shows hint VI |
| HDSD §3 Tạo / Lưu YCTD operable | Tạo **🟢**; Lưu **🟡** disabled — empty JD library (U65, no seed) |
| Orphan Offer form | **🟡 product_gap** (inventory §2) |
| Inbox after Gửi duyệt without FE-spawned task | **🟡** — no seed |

---

## HDSD coverage table (Batch B RET)

Click path prefix: `login ceo@xe.vn` → `http://14.225.217.232:8088/hr/recruitment?portal=1&tenantId=xevn&companyId=main` › nav tab.

| id | hdsd_ref | control | click_path | Network / FE / F5 | verdict | note |
|----|----------|---------|------------|-------------------|---------|------|
| CH07-§3-Tạo-yêu-cầu | CH07 §3 | Thêm yêu cầu | nav YCTD › Thêm yêu cầu | — | 🟢 | Spot: CTA + dialog «Tạo yêu cầu tuyển dụng» (harness early 🟡 CTA absent superseded) |
| CH07-§3-Lưu-YCTD | CH07 §3 | Lưu | form › Lưu yêu cầu | 0 POST | 🟡 | Submit **disabled** — JD thư viện trống + hint export live; U65 no seed JD |
| CH07-§3-Mở-JD | CH07 §3 | Mở JD | form «Mở Thư viện JD» / tab | — | 🟡 | Shortcut from form present; harness tab shortcut flaky |
| CH07-§3-Duyệt-từ-chối | CH07 §3 | Duyệt / từ chối WF | Inbox | — | 🟡 | Deferred — no spawned task |
| CH07-§3-Gửi-duyệt-QT | CH07 §3+FE | Gửi duyệt QT | row › Gửi duyệt QT | POST **404** | 🟡 | `…/requisitions/{id}/submit-workflow?company_id=holding` **404** |
| CH07-§3-Sửa-Chi-tiết | CH07 §3 | Sửa / Chi tiết | row | — | 🟢 | |
| CH07-§4-Sửa-Xóa-Dùng-tin | CH07 §4 | Sửa·Xóa·Dùng tin | `jd-library` | — | 🟢 | |
| CH07-§4-Tạo-Lưu-JD | CH07 §4 | Tạo / Lưu JD | jd-library › Tạo › Lưu | 0 | 🟡 | Create/validation blocked — blocks YCTD Lưu chain |
| CH07-§5-Xem-Sửa-Đóng | CH07 §5 | Xem·Sửa·Đóng | `jobs` | — | 🟢 | |
| CH07-§5-Form-tạo-sửa | CH07 §5 | Form tin | jobs › Tạo | 0 | 🟡 | Form open; save needs catalog deps |
| CH07-§5-Trạng-thái | CH07 §5 | Status labels | jobs observe | — | 🟡 | Empty / drift |
| CH07-§6-Thêm-ứng-viên | CH07 §6 | Thêm UV | candidates › Thêm › Lưu | 0 | 🟡 | CTA/form gap |
| CH07-§6-Xem-chi-tiết | CH07 §6 | Chi tiết | candidates › row | — | 🟡 | Empty list OK U65 |
| CH07-§6-Chuyển-giai-đoạn | CH07 §6 | Stage | candidates | — | 🟢 | |
| CH07-§6-§13-Liên-kết-NV | CH07 §6·§13 | Hire link | hired stage | — | 🟡 | No UV hired (no seed) |
| FE-extra-Import-UV | orphan FE | Import | candidates | — | ⬜ | CTA not visible |
| CH07-orphan-Offer-form | orphan | Offer form | dashboard/kanban | — | 🟡 | **product_gap** OK |
| CH07-§7-Tạo-đề-xuất | CH07 §7 | Tạo đề xuất | proposals | 0 | 🟡 | Form open; no 2xx |
| CH07-§7-Duyệt-Từ-chối | CH07 §7 | Duyệt/Từ chối | proposals | — | 🟢 | |
| CH07-§7-Tạo-tin-từ-đề-xuất | CH07 §7 | Shortcut tin | proposals | — | 🟡 | Needs approved proposal |
| CH07-§8-Chiến-dịch | CH07 §8 | Chiến dịch | campaigns | — | 🟢 | |
| CH07-§9-Sửa-Hủy-Ghi-nhận | CH07 §9 | Sửa·Hủy·Ghi nhận | interviews | — | 🟢 | |
| CH07-§9-Lên-lịch-PV | CH07 §9 | Lên lịch | interviews | — | 🟢 | Dialog open smoke |
| CH07-§10-Thẻ-KPI | CH07 §10 | KPI cards | evaluations | — | 🟢 | |
| CH07-§10-So-sánh | CH07 §10 | So sánh | evaluations | — | 🟢 | |
| CH07-§10-Chi-tiết-mắt | CH07 §10 | Eye detail | evaluations | — | 🟢 | |
| CH07-§13-EvaluationDialog | CH07 §13 | Eval dialog | evaluations | — | 🟢 | |
| CH07-§11.1-KPI | CH07 §11.1 | KPI plans | plans | — | 🟢 | |
| CH07-§11.1-Tạo-kế-hoạch | CH07 §11.1 | Tạo | plans | — | 🟢 | Dialog open |
| CH07-§11.2-Thêm-PB | CH07 §11.2 | Thêm PB | plans dialog | — | 🟢 | |
| CH07-§11.2-Thêm-vị-trí | CH07 §11.2 | Thêm vị trí | plans dialog | — | 🟢 | |
| CH07-§11.2-Thùng-rác | CH07 §11.2 | Trash | plans dialog | — | 🟢 | |
| CH07-§11.2-Form-fields | CH07 §11.2 | Fields | plans dialog | — | 🟢 | |
| CH07-§11.2-Lưu-nháp | CH07 §11.2 | Lưu nháp | plans dialog | none | 🟡 | Clicked; validation |
| CH07-§11.2-Submit-Tạo | CH07 §11.2 | Tạo kế hoạch | plans dialog | none | 🟡 | Submit blocked |
| CH07-§11.1-Xem-chi-tiết | CH07 §11.1 | Detail | plans row | — | 🟡 | detail=false |
| CH07-§11.3-Sửa | CH07 §11.3 | Sửa | plan detail | — | 🟡 | Need detail context |
| CH07-§11.3-Gửi-duyệt-QT | CH07 §11.3 | Gửi duyệt QT | plan detail | — | 🟡 | CTA not on state |
| CH07-§11.3-Từ-chối | CH07 §11.3 | Từ chối | plan detail | — | 🟡 | Observe |
| CH07-§11.3-Duyệt-kế-hoạch | CH07 §11.3 | Duyệt | plan detail | — | 🟢 | Observe |
| CH07-§12-Báo-cáo | CH07 §12 | Báo cáo | `reports` | — | 🟢 | KPI + chart shell (zeros OK U65) |
| CH07-§14-Trạng-thái-AC | CH07 §14 | Status AC | cross-tab | — | 🟢 | Empty OK U65 |
| CH07-§15-Lỗi-HDSD | CH07 §15 | No seed | policy | — | 🟢 | No seed / no fake inbox |
| CH04-§4.1-Inbox-after-Gửi-duyệt | CH04 §4.1 | Inbox | CC Inbox | — | 🟡 | No Hoàn thành path without reliable REC task — **no seed** |

---

## Residual / not promoted

| ID | Severity | Owner | Action |
|----|----------|-------|--------|
| **R-REC-01B-VITE-JOBREQ-UI-01** | — | — | **CLOSED** (DO-REC-8088-JOBREQ-UI-EXPORT-01) |
| **R-REC-01B-SUBMIT-WF-404-HOLDING** | **P1** | dev-be | `POST /api/hrm/recruitment/requisitions/{id}/submit-workflow?company_id=holding` → **404** on Gửi duyệt QT (Group CEO rollup) |
| **R-REC-01B-MUTATE-JD-YCTD-CHAIN** | P1 | qa (+dev-fe if create JD blocked) | FE-only chain: Tạo/Lưu JD → chọn JD → Lưu YCTD 2xx+F5 (U65); do not seed |
| R-REC-01B-OFFER-GAP | P2 | ba / product | Orphan Offer form remains 🟡 product_gap |
| SoftDel/BH | — | — | OOS |

**Matrix:** `UF-HRM-12` stays prior 🟢 — this RET does **not** demote; does **not** promote mutate Lưu YCTD to 🟢 without 2xx+F5.

---

## completion_report

**Closed**

- Browser-only U65/U76 Batch B RET on `:8088` after DO export sync (`e3d41b1`, `hasExport=1`).
- Prior blank Recruitment / missing export P0 **CLOSED** — mount + empty-JD hint VI proven in form.
- 44 inventory rows verdicted · **0🔴** · Offer 🟡 product_gap · Inbox 🟡 no seed.
- Evidence: runtime JSON, YCTD spot JSON, screens (requisitions/reports/YCTD form).

**Open / residual**

- YCTD/JD/plan mutate **not** 2xx+F5 (empty JD / validation) — follow-up chain WI.
- Gửi duyệt QT **404** `company_id=holding` — BE residual.

## next_owner

`pm` → **dev-be** `R-REC-01B-SUBMIT-WF-404-HOLDING` · parallel **qa** mutate chain after JD create path green (or **dev-fe** if JD create CTA blocked)

## next_dispatch_prompt (copy-ready)

```text
work_item_id: D-REC-01B-SUBMIT-WF-404-HOLDING-01
from_role: pm
to_role: dev-be
program: P-REC-E2E-13STEP-01
priority: P1
entry_criteria: QA-REC-HDSD-COVERAGE-01B-RET PASS_TO_PM · evidence docs/qa/evidence/qa-rec-hdsd-coverage-01b-ret-20260801.md
problem: ceo@xe.vn on :8088 Recruitment › YCTD › Gửi duyệt QT → POST /api/hrm/recruitment/requisitions/{id}/submit-workflow?company_id=holding returns 404
spec_ref: HDSD CH07 §3 Gửi duyệt QT · UF-HRM-12 / J-HRM-05 bridge Inbox
exit_criteria:
  - Browser Gửi duyệt QT → Network 2xx (or deterministic 4xx with FE message — not silent 404)
  - Jest/regression on submit-workflow scope (main vs holding rollup)
  - evidence + READY_FOR_QA
  - then QA-REC-01B-MUTATE-JD-YCTD-CHAIN (FE: Tạo JD → Lưu YCTD 2xx+F5, U65 zero-seed)
cấm: seed · SoftDel/BH
```

## pm_dispatch_hint

P1 `D-REC-01B-SUBMIT-WF-404-HOLDING-01` + follow-up QA mutate chain JD→YCTD; mount/export residual **closed**. Parallel OK with 01A-RET.
