# UC — `UC-XBOS-13` · Định nghĩa quy trình (workflow)

| Meta | Value |
|------|--------|
| **uc_id** | `UC-XBOS-13` |
| **stt_phase1** | 28 |
| **mod** | M01 |
| **name_vi** | Định nghĩa quy trình (workflow) |
| **actors** | Process admin · Group CEO |
| **surfaces** | web-portal / api |
| **srs_old** | `BANG_TONG_HOP_USECASE_XEVN.md` · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` · client-delivery SRS Có · STT 28 |
| **srs_new** | `SRS_VN.md` §3 Yêu cầu XBOS (catalog · WF · audit · RBAC · soft-delete) · máy trạng thái WF 2 cấp |
| **tech_spec** | `docs/ecosystem/TECHSPEC_HE_SINH_THAI_XEVN.md` §4–9 · `docs/xbos/TECHSPEC.md` M01 |
| **api_contract** | POST/PUT `/api/xbos/workflow-engine/definitions` · API_CONTRACT_VN Workflows |
| **author** | ba-process · PO-UC-TC-W1-S1-XBOS-CORE |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_IMPL` |
| **code_note** | workflow-engine.controller.ts definitions CRUD. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`.

---

## 1. Mục tiêu UC (1 đoạn)

Định nghĩa quy trình phê duyệt (steps/roles) để dùng khi chạy phiên.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-WD-01 | Tạo/sửa định nghĩa WF | Definitions | Admin |
| CAP-WD-02 | Validate sơ đồ | Chặn definition lỗi | Hệ thống |

**Đếm nghiệp vụ:** 2

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-WD-01 | FN-WD-LIST | List definitions | GET definitions | N |
| CAP-WD-01 | FN-WD-SAVE | Create/Update definition | POST/PUT · Canvas Lưu | Y |
| CAP-WD-02 | FN-WD-VAL | Validate definition | API | Y |

**Đếm chức năng:** 3

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-WD-LIST | 2 | 0 | 0 | 0 | 1 | 3 |
| FN-WD-SAVE | 2 | 0 | 0 | 2 | 1 | 5 |
| FN-WD-VAL | 0 | 3 | 1 | 0 | 0 | 4 |
| **Tổng** | 4 | 3 | 1 | 2 | 2 | **12** |


---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-XBOS-13-LIST-HP-001 | CAP-WD-01 | FN-WD-LIST | HP | P0 | ceo@xe.vn (group CEO) | login | 1. Mở danh sách quy trình | list 2xx | UI/API | UC-XBOS-13 |
| TC-XBOS-13-SAVE-HP-001 | CAP-WD-01 | FN-WD-SAVE | HP | P0 | ceo@xe.vn (group CEO) | canvas/form | 1. Định nghĩa ≥1 bước duyệt · Lưu | 2xx · F5 còn definition | UI/API | SRS_VN WF |
| TC-XBOS-13-SAVE-FD-001 | CAP-WD-02 | FN-WD-VAL | FD | P0 | ceo@xe.vn (group CEO) | — | 1. Lưu 0 bước | 4xx | UI/API | validate |
| TC-XBOS-13-SAVE-FD-002 | CAP-WD-02 | FN-WD-VAL | FD | P0 | ceo@xe.vn (group CEO) | — | 1. thiếu role bước | 4xx | API |  |
| TC-XBOS-13-SAVE-AU-001 | CAP-WD-01 | FN-WD-SAVE | AU | P0 | EMPLOYEE (NV thường) | NV | 1. POST definition | 403 | API | RBAC |
| TC-XBOS-13-SAVE-AU-002 | CAP-WD-01 | FN-WD-SAVE | AU | P0 | du-lich.ceo@xe.vn (member CEO) | member | 1. sửa WF tập đoàn | 403/409 | API | scope |
| TC-XBOS-13-LIST-UX-001 | CAP-WD-01 | FN-WD-LIST | UX | P1 | ceo@xe.vn (group CEO) | trống | 1. list | empty OK | UI | U65 |
| TC-XBOS-13-SAVE-HP-002 | CAP-WD-01 | FN-WD-SAVE | HP | P1 | ceo@xe.vn (group CEO) | đã có | 1. Sửa bước · Lưu | F5 | UI |  |
| TC-XBOS-13-SAVE-BD-001 | CAP-WD-02 | FN-WD-VAL | BD | P2 | ceo@xe.vn (group CEO) | — | 1. rất nhiều bước | limit rõ | API | BD |
| TC-XBOS-13-SAVE-UX-001 | CAP-WD-01 | FN-WD-SAVE | UX | P1 | ceo@xe.vn (group CEO) | đang lưu | 1. double Lưu | một version | UI |  |
| TC-XBOS-13-LIST-HP-002 | CAP-WD-01 | FN-WD-LIST | HP | P1 | ceo@xe.vn (group CEO) | có item | 1. mở detail definition | J-* OK | UI | cross-nav |
| TC-XBOS-13-SAVE-FD-003 | CAP-WD-02 | FN-WD-VAL | FD | P1 | ceo@xe.vn (group CEO) | self-approve path | 1. cấu hình cho phép tự duyệt | chặn theo BR-WF-04 hoặc SPEC_GAP ghi | API | SRS_VN chống tự duyệt |

---

## 6. Coverage check

| Check | Req | In design | GAP |
|-------|----------|-----------|-----|
| Mọi Cap có ≥1 FN | Yes | Yes | — |
| Mọi FN mutate ≥1 HP + ≥1 FD | Yes | Partial | — |
| Auth/scope nếu đa CT | Yes | Yes | — |
| SPEC_GAP ghi rõ | Yes | xem code_note / FD | — |

---

## 7. FE / BE / Role (đánh giá thiết kế — chưa UAT)

| Layer | Finding | Evidence (path/#) |
|-------|---------|-------------------|
| BE API/DTO | workflow-engine.controller.ts definitions CRUD. | `apps/api/xbos-api/src/**` · matrix e2e_pass |
| FE menu/nút/role | Surface UI → portal/CC theo HDSD; API-only → N/A menu | `apps/web` (spot) |
| Mobile (nếu có) | N/A — XBOS core Phase1 | — |
| RBAC / scope | JWT + company/tenant ladder | SRS_VN §2–3 |

**Verdict code_readiness:** `LIKELY_IMPL` — thiết kế TC; **không** = UAT PASS.

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-XBOS-13
cases_designed: 12
code_readiness: LIKELY_IMPL
```
