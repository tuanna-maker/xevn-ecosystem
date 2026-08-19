# PO-HRM-REC-IV-ONE-ACTIVE-SA-01 — SA Tech/API/DB packet (one ACTIVE interview)

| Field | Value |
|-------|--------|
| work_item_id | `PO-HRM-REC-IV-ONE-ACTIVE-SA-01` |
| lane | governance · sa |
| change_mode | ADD-only docs · **NO CODE** `apps/**` |
| date | 2026-08-06 |
| ref_srs | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` v0.15 · `FR-UC-BP-REC-06a` |
| ref_ba_spec | `docs/program/specs/PO-HRM-REC-INTERVIEW-ONE-ACTIVE-SPEC-01.md` |
| ref_ba_evidence | `docs/qa/evidence/po-hrm-rec-iv-one-active-docs-01.md` |
| honesty | `recruitment_uat_ready=false` · U65 zero-seed · REC-03 OUT |
| ack_target | `PASS_TO_PM` |

---

## 0) Objective

Khóa packet kỹ thuật cho BR one-active:

1. Mỗi `candidate_id` trong cùng `company_id` chỉ có tối đa **1 interview ACTIVE**.
2. ACTIVE = `scheduled | confirmed`; TERMINAL cho phép tạo mới = `cancelled | completed`.
3. `no_show` và `rescheduled` giữ **OPEN** (chờ quyết định sản phẩm), không bịa.
4. API create/update/list có contract deterministic (code + message + display-ready fields).
5. List ứng viên có badge “đã có lịch” với datetime `dd/MM/yyyy HH:mm` (vi-VN).

---

## 1) Architecture boundaries and invariants

### 1.1 Scope and ownership

| Item | Rule |
|------|------|
| Data owner | Recruitment module (`company_id`, `candidate_id`) |
| Scope parity (U19) | list / get-by-id / create / update / cancel dùng cùng resolver scope |
| Cross-surface | Candidate list chỉ đọc projection, không tự tính ACTIVE từ dữ liệu ngoài scope |
| OUT | `job_postings`, campaign/tin đăng (REC-03) |

### 1.2 One-active invariants

| ID | Invariant |
|----|-----------|
| IV-I1 | Trong cùng `(company_id, candidate_id)`, số row ACTIVE ≤ 1 tại mọi thời điểm |
| IV-I2 | Create interview mới chỉ hợp lệ khi ACTIVE count = 0 |
| IV-I3 | Update status phải không vi phạm IV-I1 (kể cả race/concurrent requests) |
| IV-I4 | List badge phản ánh đúng ACTIVE row mới nhất theo `scheduled_at` |

---

## 2) DB_DESIGN delta (ADD-only logical contract)

> Ghi dưới dạng delta thiết kế; chưa mở migrate seat.

### 2.1 Entity mapping (MVP surface)

| Decision | Value |
|----------|-------|
| Mutate SoT MVP | **OPEN-Q4** (catalog `interviews` vs spine `recruitment_interviews`) |
| SA lock hiện tại | Chỉ cho phép **một SoT mutate** trong Dev wave; cấm dual-write |
| Candidate foreign key | `candidate_id` bắt buộc, cùng `company_id` |

### 2.2 Status normalization set

| Group | Status |
|-------|--------|
| ACTIVE | `scheduled`, `confirmed` |
| TERMINAL (locked) | `cancelled`, `completed` |
| OPEN decision | `no_show`, `rescheduled` |

### 2.3 Cardinality constraint (physical intent)

| Constraint | Intent |
|-----------|--------|
| Partial unique active | unique `(company_id, candidate_id)` where `status in ('scheduled','confirmed')` |
| Check status domain | status phải thuộc dictionary đã công bố trên API |
| Race safety | create/update status chạy trong transaction; conflict trả deterministic 409 |

### 2.4 Recommended index (read path)

| Index | Purpose |
|-------|---------|
| `(company_id, candidate_id, status, scheduled_at desc)` | lookup ACTIVE nhanh cho create gate + list projection |
| `(company_id, candidate_id, updated_at desc)` | audit và fallback đọc latest state |

---

## 3) API_DESIGN deterministic contracts

Envelope lỗi chuẩn: `{ code, message, details? }`

### 3.1 Create interview

| Item | Contract |
|------|----------|
| Endpoint (logical) | `POST /api/hrm/rec/interviews` |
| Mục đích | Tạo lịch phỏng vấn mới cho ứng viên khi chưa có ACTIVE |
| Tham chiếu SRS | `FR-UC-BP-REC-06a` Diễn biến #1–#3 |
| Preconditions | Candidate trong scope; ACTIVE count = 0 |
| Success | `201` + payload display-ready của lịch mới |
| Deterministic conflict | `409` + `code: HRM-REC-IV-409-ACTIVE` khi đã có ACTIVE |

`HRM-REC-IV-409-ACTIVE` response đề xuất:

```json
{
  "code": "HRM-REC-IV-409-ACTIVE",
  "message": "Ứng viên đã có lịch phỏng vấn đang hiệu lực",
  "details": {
    "candidate_id": "uuid",
    "active_interview_id": "uuid",
    "active_status": "scheduled",
    "active_at": "2026-08-06T09:30:00.000Z"
  }
}
```

### 3.2 Update interview status

| Item | Contract |
|------|----------|
| Endpoint (logical) | `PATCH /api/hrm/rec/interviews/{interview_id}` |
| Mục đích | Đổi trạng thái lịch và giữ invariant one-active |
| Tham chiếu SRS | `FR-UC-BP-REC-06a` Diễn biến #4–#7 |
| Allowed now | `scheduled -> confirmed`, `scheduled|confirmed -> cancelled|completed` |
| OPEN decision | transitions liên quan `no_show`, `rescheduled` |
| Conflict | `409 HRM-REC-IV-409-ACTIVE` nếu update tạo trạng thái ACTIVE thứ hai |
| Invalid transition | `400 HRM-REC-IV-400-INVALID-TRANSITION` |

### 3.3 List candidates with active interview badge

| Item | Contract |
|------|----------|
| Endpoint (logical) | `GET /api/hrm/rec/candidates` |
| Mục đích | Trả danh sách UV kèm projection badge ACTIVE |
| Tham chiếu SRS | `FR-UC-BP-REC-06a` Diễn biến #7, Thành công |
| Response field | `active_interview` object (nullable) |
| Empty behavior | Không có ACTIVE: `active_interview = null`, FE hiển thị `—` |

`active_interview` contract:

```json
{
  "has_active_interview": true,
  "active_interview_status": "scheduled",
  "active_interview_at": "2026-08-06T09:30:00.000Z",
  "active_interview_display_time_vi_vn": "06/08/2026 16:30",
  "active_interview_badge_label": "Đã có lịch"
}
```

### 3.4 List interviews by candidate (consumer path)

| Item | Contract |
|------|----------|
| Endpoint (logical) | `GET /api/hrm/rec/interviews?candidate_id=...` |
| Mục đích | Feed tab lịch PV và cross-nav từ badge |
| Rule | Nếu ACTIVE tồn tại thì row ACTIVE phải trả ở top theo `scheduled_at` gần nhất |
| Error | `404 HRM-REC-IV-404-CANDIDATE` khi candidate out-of-scope |

---

## 4) FE display-ready contract

| Field | Type | Meaning |
|-------|------|---------|
| `has_active_interview` | boolean | Có badge hay không |
| `active_interview_badge_label` | string | Mặc định: `Đã có lịch` |
| `active_interview_display_time_vi_vn` | string | `dd/MM/yyyy HH:mm` theo vi-VN |
| `active_interview_status` | enum | `scheduled | confirmed` khi badge bật |
| `active_interview_at` | ISO string | dùng cho sort/filter; FE không tự parse từ label |

Formatting lock:
- Không hợp lệ/null -> hiển thị `—`, không crash.
- FE không tự suy diễn ACTIVE từ status list cục bộ; dùng field BE trả về.

---

## 5) Error taxonomy (one-active slice)

| Code | HTTP | Meaning |
|------|------|---------|
| `HRM-REC-IV-409-ACTIVE` | 409 | Candidate đã có ACTIVE interview |
| `HRM-REC-IV-400-INVALID-TRANSITION` | 400 | Chuyển trạng thái không hợp lệ |
| `HRM-REC-IV-404-CANDIDATE` | 404 | Candidate không tồn tại / ngoài scope |
| `HRM-SCOPE-409` | 409 | `company_id` mismatch scope |

---

## 6) OPEN questions (product decision required)

> Các mục dưới đây **chưa khóa**, giữ OPEN để PM/sponsor quyết định.

| ID | Question | Current default | Status |
|----|----------|-----------------|--------|
| OPEN-Q1 | UV đa YCTD: one-active theo UV hay theo UV×YCTD? | Theo UV×pháp nhân (theo ba-docs draft) | **OPEN** |
| OPEN-Q2 | Reschedule dùng R-A (update cùng row) hay R-B (close old + create new atomic)? | Chưa chốt | **OPEN** |
| OPEN-Q3 | `no_show` có thuộc TERMINAL không? | Chưa chốt | **OPEN** |
| OPEN-Q4 | Mutate SoT MVP: `interviews` hay `recruitment_interviews`? | Chưa chốt | **OPEN** |

---

## 7) Narrow lane dispatch prompts

### 7.1 Next dispatch for dev-be

```text
work_item_id: PO-HRM-REC-IV-ONE-ACTIVE-BE-01
from_role: pm
to_role: dev-be
lane: execution
change_mode: ADD-only (narrow)
spec_ref:
  - docs/program/specs/PO-HRM-REC-IV-ONE-ACTIVE-SA-01.md §2 §3 §5
  - docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-REC-06a
entry_criteria:
  - PM đã chốt OPEN-Q2 và OPEN-Q4 (hoặc ghi temporary decision trên bus)
task:
  - Enforce invariant one-active tại BE create/update (transaction + deterministic 409 HRM-REC-IV-409-ACTIVE)
  - Đồng bộ list/get/mutate cùng scope resolver (scope parity)
  - Trả projection fields active_interview cho candidate list theo contract §3.3 và §4
  - Không mở REC-03/campaign/tin đăng, không dual-write 2 SoT mutate
forbidden:
  - seed-based acceptance
  - invent status ngoài packet
exit_criteria:
  - Unit/integration tests cover: create blocked when ACTIVE exists, cancel->create success, list badge fields stable
  - completion_report + next_dispatch_prompt cho QA
evidence_path:
  - docs/qa/evidence/po-hrm-rec-iv-one-active-be-01.md
ack_status_target: READY_FOR_QA
```

### 7.2 Next dispatch for dev-fe

```text
work_item_id: PO-HRM-REC-IV-ONE-ACTIVE-FE-01
from_role: pm
to_role: dev-fe
lane: execution
change_mode: ADD-only (narrow)
spec_ref:
  - docs/program/specs/PO-HRM-REC-IV-ONE-ACTIVE-SA-01.md §3.3 §4
  - docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-REC-06a
entry_criteria:
  - BE contract active_interview fields available on candidate list
task:
  - Render badge "Đã có lịch" + datetime `dd/MM/yyyy HH:mm` từ display-ready field BE
  - Gate create-interview action: nếu nhận 409 HRM-REC-IV-409-ACTIVE thì hiển thị lỗi nghiệp vụ rõ ràng, không crash
  - Null/invalid datetime hiển thị `—`
  - Không claim REC module UAT-ready; không gộp fix Select.Item crash vào verdict one-active
forbidden:
  - tự suy luận ACTIVE từ dữ liệu cục bộ khi BE đã trả projection
  - seed data để pass QA
exit_criteria:
  - FE test/QA evidence cho badge + conflict handling + F5 persistence
  - completion_report + next_dispatch_prompt cho QA
evidence_path:
  - docs/qa/evidence/po-hrm-rec-iv-one-active-fe-01.md
ack_status_target: READY_FOR_QA
```

---

## 8) Completion contract

- `completion_report`: Đã phát hành packet SA one-active gồm boundary + invariants, DB/API deterministic contracts cho create/update/list, list badge display-ready vi-VN, taxonomy lỗi, và prompt dispatch hẹp cho dev-be/dev-fe. Không đụng `apps/**`, không mở REC-03, không claim UAT.
- `next_owner`: `pm` (chốt OPEN-Q + dispatch `dev-be` và `dev-fe` narrow lanes).
- `next_dispatch_prompt`: Dùng 2 prompt copy-ready tại §7.1 và §7.2.
- `evidence_path`: `docs/program/specs/PO-HRM-REC-IV-ONE-ACTIVE-SA-01.md`
- `ack_status`: `PASS_TO_PM`

