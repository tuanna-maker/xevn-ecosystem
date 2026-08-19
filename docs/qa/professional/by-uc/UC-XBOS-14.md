# UC — `UC-XBOS-14` · Chạy quy trình — phê duyệt từng vai (multi-hat)

| Meta | Value |
|------|--------|
| **uc_id** | `UC-XBOS-14` |
| **stt_phase1** | 29 |
| **mod** | M01 |
| **name_vi** | Chạy quy trình — phê duyệt từng vai (multi-hat) |
| **actors** | Requester · Approver multi-hat |
| **surfaces** | web-portal / api |
| **srs_old** | `BANG_TONG_HOP_USECASE_XEVN.md` · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` · client-delivery SRS Có · STT 29 |
| **srs_new** | `SRS_VN.md` §3 Yêu cầu XBOS (catalog · WF · audit · RBAC · soft-delete) · WF 2 cấp · chống tự duyệt · SLA |
| **tech_spec** | `docs/ecosystem/TECHSPEC_HE_SINH_THAI_XEVN.md` §4–9 · `docs/xbos/TECHSPEC.md` M01 |
| **api_contract** | POST instances/start · tasks complete/reject · API_CONTRACT_VN approve/reject |
| **author** | ba-process · PO-UC-TC-W1-S1-XBOS-CORE |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_IMPL` |
| **code_note** | workflow-engine instances/tasks · inbox catalog-governance. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`.

---

## 1. Mục tiêu UC (1 đoạn)

Chạy phiên quy trình và phê duyệt theo từng vai (multi-hat), không tự duyệt.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-WR-01 | Khởi chạy phiên | Start instance | Requester |
| CAP-WR-02 | Duyệt theo vai | Complete task đúng hat | Approver |
| CAP-WR-03 | Chống gian lận | Self-approve / sai scope | Hệ thống |

**Đếm nghiệp vụ:** 3

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-WR-01 | FN-WR-START | Start instance | Gửi / POST start | Y |
| CAP-WR-02 | FN-WR-APPROVE | Complete/approve task | Hộp thư · Duyệt | Y |
| CAP-WR-03 | FN-WR-SELF | Block self-approve | API reject | Y |
| CAP-WR-02 | FN-WR-INBOX | List tasks inbox | Hộp thư | N |

**Đếm chức năng:** 4

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-WR-START | 2 | 1 | 0 | 1 | 0 | 4 |
| FN-WR-APPROVE | 2 | 1 | 1 | 1 | 1 | 6 |
| FN-WR-SELF | 0 | 2 | 0 | 0 | 0 | 2 |
| FN-WR-INBOX | 1 | 0 | 0 | 0 | 1 | 2 |
| **Tổng** | 5 | 4 | 1 | 2 | 2 | **14** |


---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-XBOS-14-ST-HP-001 | CAP-WR-01 | FN-WR-START | HP | P0 | Employee / requester | definition active | 1. Khởi tạo phiên từ FE (không seed inbox) | 2xx · task L1 xuất hiện inbox người duyệt | UI/API | U65 chuỗi FE |
| TC-XBOS-14-ST-FD-001 | CAP-WR-01 | FN-WR-START | FD | P0 | Employee / requester | definition inactive | 1. Start | 4xx | API |  |
| TC-XBOS-14-AP-HP-001 | CAP-WR-02 | FN-WR-APPROVE | HP | P0 | Manager có quyền inbox WF | có task từ FE | 1. Mở Hộp thư · Duyệt | 2xx · trạng thái tiến · F5 | UI/API | API_CONTRACT approve |
| TC-XBOS-14-AP-HP-002 | CAP-WR-02 | FN-WR-APPROVE | HP | P0 | ceo@xe.vn (group CEO) | multi-hat cùng user | 1. Duyệt bằng đúng vai đang chọn | chỉ task của hat hiện tại | UI/API | multi-hat |
| TC-XBOS-14-AP-FD-001 | CAP-WR-02 | FN-WR-APPROVE | FD | P0 | Manager có quyền inbox WF | task đã xong | 1. Duyệt lại | 4xx | API |  |
| TC-XBOS-14-SELF-FD-001 | CAP-WR-03 | FN-WR-SELF | FD | P0 | Employee / requester | requester=approver | 1. Tự duyệt | 403/4xx BR chống tự duyệt | API | SRS_VN |
| TC-XBOS-14-AP-AU-001 | CAP-WR-02 | FN-WR-APPROVE | AU | P0 | du-lich.ceo@xe.vn (member CEO) | task CT khác | 1. Duyệt | 403/409 | API | scope |
| TC-XBOS-14-IN-HP-001 | CAP-WR-02 | FN-WR-INBOX | HP | P0 | Manager có quyền inbox WF | có task | 1. Mở Hộp thư | thấy task · không seed | UI | U65 |
| TC-XBOS-14-IN-UX-001 | CAP-WR-02 | FN-WR-INBOX | UX | P0 | Manager có quyền inbox WF | inbox trống | 1. Mở Hộp thư | empty · 🟡 không fake seed để PASS | UI | U65 BLOCKED path |
| TC-XBOS-14-ST-AU-001 | CAP-WR-01 | FN-WR-START | AU | P1 | EMPLOYEE (NV thường) | không quyền process | 1. Start | 403 | API |  |
| TC-XBOS-14-AP-UX-001 | CAP-WR-02 | FN-WR-APPROVE | UX | P1 | Manager có quyền inbox WF | sau duyệt | 1. badge/count giảm | UI cập nhật | UI |  |
| TC-XBOS-14-AP-BD-001 | CAP-WR-02 | FN-WR-APPROVE | BD | P2 | Manager có quyền inbox WF | SLA gần hết | 1. Duyệt đúng hạn | OK · (leo thang SPEC_GAP nếu chưa) | UI/API | SLA 24/48h |
| TC-XBOS-14-ST-HP-002 | CAP-WR-01 | FN-WR-START | HP | P1 | Employee / requester | 2 cấp | 1. Start · L1 duyệt · L2 (nếu có) | terminal đúng ladder hoặc SPEC_GAP L2 ghi | UI/API | SRS_VN 2 cấp |
| TC-XBOS-14-SELF-FD-002 | CAP-WR-03 | FN-WR-SELF | FD | P1 | Manager có quyền inbox WF | đổi hat | 1. chọn hat requester rồi duyệt | blocked | UI/API | multi-hat fraud |

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
| BE API/DTO | workflow-engine instances/tasks · inbox catalog-governance. | `apps/api/xbos-api/src/**` · matrix e2e_pass |
| FE menu/nút/role | Surface UI → portal/CC theo HDSD; API-only → N/A menu | `apps/web` (spot) |
| Mobile (nếu có) | N/A — XBOS core Phase1 | — |
| RBAC / scope | JWT + company/tenant ladder | SRS_VN §2–3 |

**Verdict code_readiness:** `LIKELY_IMPL` — thiết kế TC; **không** = UAT PASS.

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-XBOS-14
cases_designed: 14
code_readiness: LIKELY_IMPL
```
