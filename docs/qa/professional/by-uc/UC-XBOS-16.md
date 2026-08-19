# UC — `UC-XBOS-16` · Yêu cầu tài sản — quy trình xác nhận kế toán (5 bước)

| Meta | Value |
|------|--------|
| **uc_id** | `UC-XBOS-16` |
| **stt_phase1** | 37 |
| **mod** | M01 |
| **name_vi** | Yêu cầu tài sản — quy trình xác nhận kế toán (5 bước) |
| **actors** | Requester · Kế toán · Approvers |
| **surfaces** | web-portal / api |
| **srs_old** | `BANG_TONG_HOP_USECASE_XEVN.md` · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` · client-delivery SRS Có · STT 37 |
| **srs_new** | N/A-DELTA — pack mới không FR chi tiết từng UC; neo matrix + TECHSPEC_HE + xbos TECHSPEC · pattern API một phần (matrix) |
| **tech_spec** | `docs/ecosystem/TECHSPEC_HE_SINH_THAI_XEVN.md` §4–9 · `docs/xbos/TECHSPEC.md` M01 |
| **api_contract** | asset-request + WF bridge · `asset-request.controller.ts` |
| **author** | ba-process · PO-UC-TC-W1-S1-XBOS-CORE |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_PARTIAL` |
| **code_note** | AR API có list/create/transition; ladder 5 bước kế toán — độ sâu SM cần verify. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`.

---

## 1. Mục tiêu UC (1 đoạn)

Thực hiện yêu cầu tài sản đi qua quy trình xác nhận kế toán nhiều bước (đến 5 bước theo UC).

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-ARW-01 | Tạo yêu cầu tài sản | Create AR | Requester |
| CAP-ARW-02 | Chuyển bước kế toán | Transition SM | Kế toán/Approver |
| CAP-ARW-03 | Theo dõi 5 bước | Visibility ladder | All |

**Đếm nghiệp vụ:** 3

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-ARW-01 | FN-ARW-CREATE | POST asset-request | Tạo yêu cầu | Y |
| CAP-ARW-02 | FN-ARW-TRANS | POST transition | Chuyển trạng thái | Y |
| CAP-ARW-03 | FN-ARW-VIEW | Xem tiến độ bước | Detail AR | N |

**Đếm chức năng:** 3

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-ARW-CREATE | 1 | 1 | 1 | 1 | 0 | 4 |
| FN-ARW-TRANS | 2 | 2 | 0 | 1 | 1 | 6 |
| FN-ARW-VIEW | 1 | 0 | 0 | 0 | 1 | 2 |
| **Tổng** | 4 | 3 | 1 | 2 | 2 | **12** |


---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-XBOS-16-CR-HP-001 | CAP-ARW-01 | FN-ARW-CREATE | HP | P0 | Employee / requester | login | 1. Tạo yêu cầu tài sản từ FE · Lưu | 2xx · vào bước 1 · F5 | UI/API | UC-XBOS-16 |
| TC-XBOS-16-CR-FD-001 | CAP-ARW-01 | FN-ARW-CREATE | FD | P0 | Employee / requester | — | 1. thiếu loại/số lượng | 4xx | UI/API |  |
| TC-XBOS-16-TR-HP-001 | CAP-ARW-02 | FN-ARW-TRANS | HP | P0 | Manager có quyền inbox WF | AR ở bước hợp lệ | 1. Chuyển bước kế tiếp | 2xx · step+1 · F5 | UI/API | SM |
| TC-XBOS-16-TR-FD-001 | CAP-ARW-02 | FN-ARW-TRANS | FD | P0 | Manager có quyền inbox WF | sai thứ tự bước | 1. nhảy bước | 4xx SM | API |  |
| TC-XBOS-16-TR-HP-002 | CAP-ARW-02 | FN-ARW-TRANS | HP | P1 | TENANT_ADMIN / SUPER_ADMIN | đi đủ ladder | 1. chuyển đến bước cuối (≤5) | terminal approved/completed | UI/API | 5 bước |
| TC-XBOS-16-VIEW-HP-001 | CAP-ARW-03 | FN-ARW-VIEW | HP | P0 | Employee / requester | AR tồn tại | 1. mở detail | thấy bước hiện tại | UI |  |
| TC-XBOS-16-TR-AU-001 | CAP-ARW-02 | FN-ARW-TRANS | AU | P0 | EMPLOYEE (NV thường) | không role KT | 1. transition | 403 | API | RBAC |
| TC-XBOS-16-CR-AU-001 | CAP-ARW-01 | FN-ARW-CREATE | AU | P0 | du-lich.ceo@xe.vn (member CEO) | sai CT | 1. create | 409/403 | API | scope |
| TC-XBOS-16-VIEW-UX-001 | CAP-ARW-03 | FN-ARW-VIEW | UX | P1 | Employee / requester | giữa chừng | 1. F5 | giữ step | UI |  |
| TC-XBOS-16-TR-FD-002 | CAP-ARW-02 | FN-ARW-TRANS | FD | P1 | Manager có quyền inbox WF | đã terminal | 1. transition | 4xx | API |  |
| TC-XBOS-16-CR-BD-001 | CAP-ARW-01 | FN-ARW-CREATE | BD | P2 | Employee / requester | — | 1. số lượng 0 / max | validate · tiền vi-VN nếu có | UI | locale |
| TC-XBOS-16-TR-UX-001 | CAP-ARW-02 | FN-ARW-TRANS | UX | P1 | Manager có quyền inbox WF | SPEC_GAP nếu <5 bước AS-IS | 1. đếm bước thực tế | ghi PARTIAL nếu ladder <5 | UI/API | matrix một phần |

---

## 6. Coverage check

| Check | Req | In design | GAP |
|-------|----------|-----------|-----|
| Mọi Cap có ≥1 FN | Yes | Yes | — |
| Mọi FN mutate ≥1 HP + ≥1 FD | Yes | Yes | — |
| Auth/scope nếu đa CT | Yes | Yes | — |
| SPEC_GAP ghi rõ | Yes | xem code_note / FD | — |

---

## 7. FE / BE / Role (đánh giá thiết kế — chưa UAT)

| Layer | Finding | Evidence (path/#) |
|-------|---------|-------------------|
| BE API/DTO | AR API có list/create/transition; ladder 5 bước kế toán — độ sâu SM cần verify. | `apps/api/xbos-api/src/**` · matrix e2e_pass |
| FE menu/nút/role | Surface UI → portal/CC theo HDSD; API-only → N/A menu | `apps/web` (spot) |
| Mobile (nếu có) | N/A — XBOS core Phase1 | — |
| RBAC / scope | JWT + company/tenant ladder | SRS_VN §2–3 |

**Verdict code_readiness:** `LIKELY_PARTIAL` — thiết kế TC; **không** = UAT PASS.

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-XBOS-16
cases_designed: 12
code_readiness: LIKELY_PARTIAL
```
