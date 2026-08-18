# Evidence — PO-HRM-REC-IV-ONE-ACTIVE-DOCS-01

| Field | Value |
|-------|--------|
| work_item_id | `PO-HRM-REC-IV-ONE-ACTIVE-DOCS-01` |
| from_role | ba-docs |
| to_role | pm |
| lane | governance |
| change_mode | ADD-only |
| date | 2026-08-06 |
| SoT merged | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` |
| source draft | `docs/program/specs/PO-HRM-REC-INTERVIEW-ONE-ACTIVE-SPEC-01.md` §5.1 (Đề xuất A — 06a) |
| inventory | `docs/client-delivery/hrm-enterprise-blueprint/UC_INVENTORY.md` (+ `UC-BP-REC-06a`) |
| program stamp | `docs/program/PO_HRM_UC_MENU_COVERAGE_PROGRAM.md` |
| ack_status | **PASS_TO_PM** |
| sponsor | **DOC-DELTA sẵn sàng CONFIRM** — chưa claim khách đã ký |

## Honesty locks

| Flag | Value |
|------|-------|
| `recruitment_uat_ready` | **false** |
| Invent REC-03 / tin đăng / campaign schedule | **false** (OUT giữ) |
| U65 zero-seed | **true** (docs only) |
| Touched `apps/**` | **false** |
| Invent answers OPEN-Q1..Q4 | **false** — còn mở cho sa/sponsor |

## Before → After

| Delta | Before | After |
|-------|--------|-------|
| Cardinality lịch ACTIVE | REC-06 chỉ thư + đánh giá; «Nhiều vòng» nông | **ADD** `FR-UC-BP-REC-06a` đủ 7 mục + AC-REC-IV-01..06 |
| Badge list UV | Không FR | Diễn biến #3/#7 + BR-BP-REC-IV-04 |
| REC-06 | Giữ nguyên thân thư/đánh giá | ADD-only cross-ref → 06a (không wipe) |
| Inventory §3.A | Không 06a | Hàng `4a` · UC-BP-REC-06a **ADD** · MVP |
| Changelog | (trước wave) | Hàng **0.15** DOC-DELTA Lịch PV một ACTIVE (SRS hiện **v0.17** nền PROC-01 — không đè) |
| Menu coverage leaf Interviews + Candidates schedule | `SHALLOW` | Stamp **SPEC_READY** sau sponsor CONFIRM + Tech/DB/API |

## must_keep checklist

- [x] REC-03 / tin đăng OUT — không invent
- [x] no wipe REC-06 / REC-06b stubs
- [x] no_prompt_echo (prose khách không work_item / path code / chat sponsor)
- [x] `recruitment_uat_ready=false`
- [x] NO `apps/**`

## Spot-check FR 7 mục — FR-UC-BP-REC-06a

| Mục | Có |
|-----|-----|
| Thông tin chung | ✓ |
| Dữ liệu đầu vào | ✓ |
| Luồng chính | ✓ |
| Quy tắc nghiệp vụ (BR-BP-REC-IV-01..06) | ✓ |
| Trường hợp đặc biệt | ✓ |
| sequenceDiagram | ✓ |
| Diễn biến (+ bảng AC) | ✓ |

## OPEN questions — **không bịa** (handoff sa/sponsor)

| ID | Câu hỏi | BA default (draft paper — **chưa** khóa sponsor) | Owner |
|----|---------|--------------------------------------------------|-------|
| OPEN-Q1 | UV gắn nhiều YCTD: 1 ACTIVE / UV hay / liên kết YCTD? | Draft FR dùng **1 ACTIVE / ứng viên / pháp nhân** | sponsor |
| OPEN-Q2 | Reschedule: đổi trên chỗ (R-A) vs đóng cũ + tạo mới atomic (R-B)? | FR giữ **cả hai** trong Diễn biến #7 — sa chọn 1 SoT | **sa** |
| OPEN-Q3 | «Không đến» có kết thúc vòng (cho tạo lịch mới) không? | Draft BR-BP-REC-IV-02 gồm không đến — **chờ confirm** | sponsor / ba |
| OPEN-Q4 | Surface MVP mutate = catalog interviews hay spine recruitment_interviews? | **Không** ghi bảng vật lý trong SRS khách — sa chốt TechSpec | **sa** |

## Residual (không đóng bởi docs)

| Residual | Owner next |
|----------|------------|
| TechSpec F.1 + DB_DESIGN (partial unique ACTIVE) + API_DESIGN 409 + unify status | **sa** `PO-HRM-REC-IV-ONE-ACTIVE-SA-01` |
| FE Select.Item empty crash | **dev-fe** parallel — không claim one-active |
| Enforce create + badge FE | Dev sau Tech/DB/API confirm |

## Completion contract

- `completion_report`: ADD-only merge **FR-UC-BP-REC-06a** vào Enterprise SRS (changelog **0.15**); inventory stamp `UC-BP-REC-06a`; cross-ref REC-06; REC-03 OUT; OPEN-Q1..Q4 left open; `recruitment_uat_ready=false`; packet sẵn **sponsor CONFIRM** trước Dev.
- `next_owner`: **sa** (`PO-HRM-REC-IV-ONE-ACTIVE-SA-01`) — sau (hoặc song song hẹp) pm giữ Select.Item FE.
- `next_dispatch_prompt`: copy-ready bên dưới.
- `ack_status`: **PASS_TO_PM**
- `evidence_path`: `docs/qa/evidence/po-hrm-rec-iv-one-active-docs-01.md`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-REC-IV-ONE-ACTIVE-SA-01
from_role: pm
to_role: sa
lane: governance
change_mode: ADD
ack_target: PASS_TO_PM

read_first (ordered):
  1. docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md — FR-UC-BP-REC-06a (+ REC-06 cross-ref)
  2. docs/program/specs/PO-HRM-REC-INTERVIEW-ONE-ACTIVE-SPEC-01.md §1–§4 · §9 OPEN-Q1..Q4
  3. docs/client-delivery/hrm-enterprise-blueprint/TECHSPEC_HRM_ENTERPRISE.md (REC map · §17.6 dual surface nếu có)
  4. docs/qa/evidence/po-hrm-rec-iv-one-active-docs-01.md

task:
  - ADD TechSpec F.1 + DB_DESIGN (partial unique ACTIVE / candidate × company) + API_DESIGN
    mục đích · nghiệp vụ · tham chiếu bước SRS Diễn biến FR-UC-BP-REC-06a
  - Chốt OPEN-Q2 (R-A vs R-B) + OPEN-Q4 (một SoT mutate MVP); không invent OPEN-Q1/Q3 nếu chưa sponsor
  - Mã lỗi deterministic khi tạo trùng ACTIVE (vd. đề xuất HRM-REC-IV-409-ACTIVE)
  - Unify / bind status Lane A vs Lane B — một surface MVP
  - FORBIDDEN: apps/** · invent REC-03 / tin đăng · claim recruitment_uat_ready
  - honesty: recruitment_uat_ready=false

evidence_path: docs/qa/evidence/po-hrm-rec-iv-one-active-sa-01.md
exit: completion_report + next_dispatch_prompt (BE/FE hoặc ba-data) + PASS_TO_PM
```
