# QA-REC-HDSD-COVERAGE-01B — Batch B HDSD Ch07 §3–§15 forms

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-REC-HDSD-COVERAGE-01B` |
| **parent** | `QA-REC-HDSD-COVERAGE-01` (batch B — U69) |
| **program** | `P-REC-E2E-13STEP-01` · U76 · U65 |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **date** | 2026-08-01 (ICT) · wall 2026-07-31 local |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **portal_url** | `http://14.225.217.232:8088` (**primary SoT**) |
| **hdsd_align** | `true` · inventory `docs/qa/HDSD_REC_MENU_FUNCTION_INVENTORY.md` §1 ~L70–110 |
| **hdsd_sot** | `docs/client-delivery/hdsd/hrm/HDSD_XEVN_CH07_HRM_TUYEN_DUNG.md` (+ BA inventory) |
| **entry** | browser-only · zero-seed · no SoftDel/BH · no inbox seed |
| **harness** | `scripts/qa/qa-rec-hdsd-coverage-01b-browser.mjs` |
| **runtime** | `docs/qa/evidence/_tmp-qa-rec-hdsd-coverage-01b-runtime.json` |
| **vite_diag** | `docs/qa/evidence/_tmp-qa-rec-01b-vite-diag.json` |
| **screens** | `docs/qa/evidence/screens/qa-rec-hdsd-coverage-01b-20260801/` |
| **ack_status** | **FAIL_TO_PM** |

## Executive verdict

**FAIL_TO_PM** — Batch B inventory **table complete** (44 rows · every row has 🟢/🟡/🔴/⬜ + click path), but **HRM Tuyển dụng page does not mount on Dev8088**. Forms YCTD · JD · Tin · UV · Đề xuất · Chiến dịch · PV · Đánh giá · Kế hoạch · Báo cáo are **unreachable**. Mutate AC (Network 2xx + FE after + F5) **not executed** — honest, no false 🟢.

| Layer | Result |
|-------|--------|
| L0 portal `:8088` | **200** |
| XBOS login via portal | **201** |
| `GET /api/hrm/recruitment/requisitions` (unauth probe) | **401** (expected without token) |
| Browser `/hr/recruitment?tab=*` | **blank white** · React Lazy crash |
| Root cause | **Deploy skew** — `JobRequisitionsTab.tsx` imports `REQUISITION_EMPTY_JD_LIBRARY_HINT_VI` from `@/lib/jobRequisitionUi`, but VPS `jobRequisitionUi.ts` **lacks** that export |

```text
SyntaxError: The requested module '/hr/src/lib/jobRequisitionUi.ts'
does not provide an export named 'REQUISITION_EMPTY_JD_LIBRARY_HINT_VI'
```

| Probe | VPS `:8088` | Local workstation tree |
|-------|-------------|------------------------|
| `jobRequisitionUi.ts` has `REQUISITION_EMPTY_JD_LIBRARY_HINT_VI` | **false** (exports: `mapRequisitionStatus`, `REQUISITION_STATUS_LABEL_VI`, `EMPLOYMENT_TYPE_OPTIONS`, …) | **true** (`apps/web/hrm/src/lib/jobRequisitionUi.ts` L15) |
| `Recruitment.tsx` Vite body | **200** transform OK | OK |
| `labelMaps.ts` / `employeeCompanyDisplayName.ts` | **200** | OK |
| Page after goto recruitment | `body` text **empty** · screenshot blank white | N/A (secondary) |

**Root cause class:** incomplete FE sync / allow-list skew (importer on VPS newer than `jobRequisitionUi.ts` module) — same family as SoftDel Vite gaps (`qa-hdsd-mutate-softdel-bh-8088-smoke-*`).

**Secondary note:** Local `:5173` also failed to surface CTAs in this harness pass (auth/embed path + missing `embedWorkingContext.ts` / `hrmDialogPortalA11y.ts` 404 on that bind). **Does not demote** local matrix greens; **does not** substitute for Dev8088 U76 coverage.

---

## Counts (Batch B)

| Verdict | Count | Meaning |
|---------|------:|---------|
| 🔴 | **39** | Recruitment UI unreachable on `:8088` (env/deploy blocker) |
| 🟡 | **3** | Orphan Offer `product_gap` · Inbox no REC task (U65 no seed) · (reserved) |
| 🟢 | **2** | §14 status AC policy observe · §15 no-seed error policy |
| ⬜ | **1** | FE-extra Import — not visible (page blank; cannot confirm CTA) |
| **Total** | **44** | All inventory Batch B targets covered in table |

---

## HDSD coverage table (Batch B)

Click path prefix unless noted: `login ceo@xe.vn` → `http://14.225.217.232:8088/hr/recruitment?portal=1&tenantId=xevn&companyId=main&tab=<tab>`.

| id | hdsd_ref | control | click_path | Network / FE after / F5 | verdict | note |
|----|----------|---------|------------|-------------------------|---------|------|
| CH07-§3-Tạo-yêu-cầu | CH07 §3 | Tạo yêu cầu / Thêm yêu cầu | `tab=requisitions` › expect «Thêm yêu cầu» | — | 🔴 | CTA unreachable — blank page |
| CH07-§3-Lưu-YCTD | CH07 §3 | Lưu (form YCTD) | Thêm yêu cầu › fill › Lưu › F5 | 0 POST | 🔴 | Form never opened |
| CH07-§3-Mở-JD | CH07 §3 | Mở JD | requisitions › Mở JD / `jd-library` | — | 🔴 | Page blank |
| CH07-§3-Duyệt-từ-chối | CH07 §3 | Duyệt / từ chối WF | requisitions observe | — | 🔴 | UI unreachable; Inbox path separate |
| CH07-§3-Gửi-duyệt-QT | CH07 §3+FE | Gửi duyệt QT | requisitions › Gửi duyệt QT | 0 submit-workflow | 🔴 | CTA unreachable (not product absent) |
| CH07-§3-Sửa-Chi-tiết | CH07 §3 | Sửa / Chi tiết | row click | — | 🔴 | No rows / blank |
| CH07-§4-Sửa-Xóa-Dùng-tin | CH07 §4 | Sửa · Xóa · Dùng cho tin | `tab=jd-library` | — | 🔴 | Blank |
| CH07-§4-Tạo-Lưu-JD | CH07 §4 | Tạo / Lưu mẫu JD | jd-library › Tạo › Lưu › F5 | 0 | 🔴 | Blank |
| CH07-§5-Xem-Sửa-Đóng | CH07 §5 | Xem · Sửa · Đóng tin | `tab=jobs` | — | 🔴 | Blank |
| CH07-§5-Form-tạo-sửa | CH07 §5 Form | Form tạo/sửa tin | jobs › Tạo › Lưu/Đăng | 0 | 🔴 | Blank |
| CH07-§5-Trạng-thái | CH07 §5 | Nháp / Đang tuyển / Hết hạn | jobs observe | — | 🔴 | Blank |
| CH07-§6-Thêm-ứng-viên | CH07 §6 | Thêm ứng viên | `tab=candidates` › Thêm › Lưu | 0 | 🔴 | Blank |
| CH07-§6-Xem-chi-tiết | CH07 §6 | Xem chi tiết | candidates › row | — | 🔴 | Blank |
| CH07-§6-Chuyển-giai-đoạn | CH07 §6 | Chuyển giai đoạn | candidates observe | — | 🔴 | Blank |
| CH07-§6-§13-Liên-kết-NV | CH07 §6·§13 | Liên kết nhân viên | hired → HireEmployeeLinkDialog | — | 🔴 | Blank (would be 🟡 empty if page OK) |
| FE-extra-Import-UV | orphan FE §3 | Import ứng viên | candidates › Import | — | ⬜ | Cannot confirm Import CTA — page blank |
| CH07-orphan-Offer-form | CH07 §2 orphan | Form Offer / compensation riêng | dashboard/kanban | — | 🟡 | **product_gap** per inventory §2 — no dedicated offer letter form in FE SoT; page crash prevents live confirm |
| CH07-§7-Tạo-đề-xuất | CH07 §7 | Tạo đề xuất HC | `tab=proposals` › Tạo đề xuất | 0 | 🔴 | Blank |
| CH07-§7-Duyệt-Từ-chối | CH07 §7 | Duyệt / Từ chối | proposals observe | — | 🔴 | Blank |
| CH07-§7-Tạo-tin-từ-đề-xuất | CH07 §7 | Tạo tin từ đề xuất | proposals shortcut | — | 🔴 | Blank |
| CH07-§8-Chiến-dịch | CH07 §8 | Xem / tạo chiến dịch | `tab=campaigns` | — | 🔴 | Blank |
| CH07-§9-Sửa-Hủy-Ghi-nhận | CH07 §9 | Sửa · Hủy · Ghi nhận kết quả | `tab=interviews` | — | 🔴 | Blank |
| CH07-§9-Lên-lịch-PV | CH07 §9 | Lên lịch PV | interviews › Lên lịch | — | 🔴 | Blank |
| CH07-§10-Thẻ-KPI | CH07 §10 | Thẻ Tổng / Đạt / Không đạt / Chờ | `tab=evaluations` | — | 🔴 | Blank |
| CH07-§10-So-sánh | CH07 §10 | So sánh ứng viên | evaluations › So sánh | — | 🔴 | Blank |
| CH07-§10-Chi-tiết-mắt | CH07 §10 | Nút mắt → chi tiết | evaluations › eye | — | 🔴 | Blank |
| CH07-§13-EvaluationDialog | CH07 §13 | CandidateEvaluationDialog | evaluations dialog | — | 🔴 | Blank |
| CH07-§11.1-KPI | CH07 §11.1 | Thẻ KPI plans | `tab=plans` | — | 🔴 | Blank |
| CH07-§11.1-Tạo-kế-hoạch | CH07 §11.1 | Tạo kế hoạch (+) | plans › Tạo | — | 🔴 | Blank |
| CH07-§11.2-Thêm-PB | CH07 §11.2 | Thêm phòng ban | plans dialog | — | 🔴 | Dialog not open |
| CH07-§11.2-Thêm-vị-trí | CH07 §11.2 | Thêm vị trí | plans dialog | — | 🔴 | Dialog not open |
| CH07-§11.2-Thùng-rác | CH07 §11.2 | Thùng rác | plans dialog | — | 🔴 | Dialog not open |
| CH07-§11.2-Form-fields | CH07 §11.2 Form | tiêu đề · năm · tháng · ghi chú | plans dialog | — | 🔴 | Dialog not open |
| CH07-§11.2-Lưu-nháp | CH07 §11.2 | Lưu nháp | plans dialog › Lưu nháp | 0 | 🔴 | Dialog not open |
| CH07-§11.2-Submit-Tạo | CH07 §11.2 | Tạo kế hoạch submit | plans dialog › Tạo › F5 | 0 | 🔴 | Dialog not open |
| CH07-§11.1-Xem-chi-tiết | CH07 §11.1 | Xem chi tiết | plans › row | — | 🔴 | Blank |
| CH07-§11.3-Sửa | CH07 §11.3 | Sửa | plan detail | — | 🔴 | Blank |
| CH07-§11.3-Gửi-duyệt-QT | CH07 §11.3 | Gửi duyệt QT | plan detail › Gửi duyệt QT | — | 🔴 | Unreachable; smoke deferred |
| CH07-§11.3-Từ-chối | CH07 §11.3 | Từ chối | plan detail | — | 🔴 | Blank |
| CH07-§11.3-Duyệt-kế-hoạch | CH07 §11.3 | Duyệt kế hoạch | plan detail | — | 🔴 | Blank |
| CH07-§12-Báo-cáo | CH07 §12 | Báo cáo nguồn/funnel/chi phí/TTH | `tab=reports` | — | 🔴 | Blank |
| CH07-§14-Trạng-thái-AC | CH07 §14 | Quan sát trạng thái UV/tin/KH/PV/ĐG | cross-tab policy | — | 🟢 | U65: empty/crash documented; no seed to fabricate status |
| CH07-§15-Lỗi-HDSD | CH07 §15 | Không seed khi funnel=0 / inbox trống | policy observe | — | 🟢 | No seed; no fake inbox |
| CH04-§4.1-Inbox-after-Gửi-duyệt | CH04 §4.1 bridge | Inbox Hoàn thành after Gửi duyệt QT | CC Inbox observe | GET tasks **200** | 🟡 | Inbox reachable; **no REC task** — 🟡 not fake seed (U65). Gửi duyệt click smoke **blocked** by Recruitment crash |

---

## Spec says / code does (Dev8088)

| Spec / inventory | Observed |
|------------------|----------|
| HDSD Ch07 §3–§12 forms operable from FE | Recruitment Lazy **crashes** before tab chrome |
| FE `JobRequisitionsTab` needs empty-JD hint export | Tab imports `REQUISITION_EMPTY_JD_LIBRARY_HINT_VI` |
| VPS `jobRequisitionUi.ts` | **Missing** export (stale module vs newer tab) |
| U65 zero-seed | Honored — no `pnpm seed:*`, no inbox seed |
| Orphan Offer form | 🟡 `product_gap` (inventory §2) |

---

## Residual / not promoted

| ID | Severity | Owner | Action |
|----|----------|-------|--------|
| **R-REC-01B-VITE-JOBREQ-UI-01** | **P0** | devops + dev-fe | Sync/deploy `apps/web/hrm/src/lib/jobRequisitionUi.ts` (include `REQUISITION_EMPTY_JD_LIBRARY_HINT_VI` + any sibling exports JobRequisitionsTab needs) to Dev8088; verify Vite transform + Recruitment mount |
| R-REC-01B-COVERAGE-RETEST | P0 | qa | Re-run `QA-REC-HDSD-COVERAGE-01B` after mount green — mutate YCTD/JD/UV/plans + Gửi duyệt QT open/click + Import FE-extra |
| R-REC-01B-OFFER-GAP | P2 | ba / product | Orphan Offer form remains 🟡 product_gap (S8) |
| SoftDel/BH | — | — | **Out of scope** this WI (cấm) |

---

## completion_report

**Closed**

- Browser-only U65/U76 Batch B against `:8088` with `ceo@xe.vn`.
- Inventory §1 Batch B (CH07 §3–§15 forms + orphan Offer + FE-extra Import + Inbox bridge) — **44/44 rows** verdicted with click paths.
- Isolated P0: missing export `REQUISITION_EMPTY_JD_LIBRARY_HINT_VI` on VPS `jobRequisitionUi.ts` → Recruitment blank.
- Inbox GET tasks 200; no REC task → 🟡 (no seed).
- Orphan Offer → 🟡 `product_gap`.
- Evidence + harness + screens + vite diag artifacts.

**Open / residual**

- **Cannot** claim form 🟢 or mutate 2xx/F5 until Dev8088 Recruitment mounts.
- Local `:5173` not used as pass substitute for this WI URL.

## next_owner

`pm` → **devops** (redeploy / sync `jobRequisitionUi.ts`) + **dev-fe** (confirm export parity) → **qa** `QA-REC-HDSD-COVERAGE-01B-RET`

## next_dispatch_prompt (copy-ready)

```text
work_item_id: DO-REC-01B-JOBREQ-UI-SYNC-01
from_role: pm
to_role: devops
parallel: D-REC-01B-JOBREQ-UI-EXPORT-01 (dev-fe) confirm export list
program: P-REC-E2E-13STEP-01
priority: P0
entry_criteria: QA-REC-HDSD-COVERAGE-01B FAIL_TO_PM · evidence docs/qa/evidence/qa-rec-hdsd-coverage-01b-20260801.md
problem: Dev8088 /hr/recruitment blank — SyntaxError jobRequisitionUi.ts missing export REQUISITION_EMPTY_JD_LIBRARY_HINT_VI (JobRequisitionsTab imports it; VPS module stale)
exit_criteria:
  - VPS GET /hr/src/lib/jobRequisitionUi.ts body CONTAINS export REQUISITION_EMPTY_JD_LIBRARY_HINT_VI
  - Browser ceo@xe.vn → /hr/recruitment?tab=requisitions shows «Thêm yêu cầu» (not blank Lazy error)
  - evidence: docs/ops/evidence/do-rec-01b-jobreq-ui-sync-01-20260801.md
cấm: seed · SoftDel/BH scope creep
then: pm Task qa QA-REC-HDSD-COVERAGE-01B-RET same inventory Batch B mutate+F5
```

## pm_dispatch_hint

P0 `DO-REC-01B-JOBREQ-UI-SYNC-01` / `D-REC-01B-JOBREQ-UI-EXPORT-01` before any Batch B 🟢 claim; then `QA-REC-HDSD-COVERAGE-01B-RET`. Parallel OK with 01A/01C once mount fixed.
