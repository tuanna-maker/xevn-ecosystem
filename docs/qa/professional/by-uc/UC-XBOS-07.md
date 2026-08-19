# UC — `UC-XBOS-07` · Tiếp nhận cảnh báo từ phân hệ vệ tinh

| Meta | Value |
|------|--------|
| **uc_id** | `UC-XBOS-07` |
| **stt_phase1** | 7 |
| **mod** | M01 |
| **name_vi** | Tiếp nhận cảnh báo từ phân hệ vệ tinh |
| **actors** | Satellite service · XBOS alerts |
| **surfaces** | api |
| **srs_old** | `BANG_TONG_HOP_USECASE_XEVN.md` · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` · client-delivery SRS Có · STT 7 |
| **srs_new** | N/A-DELTA — pack mới không FR chi tiết từng UC; neo matrix + TECHSPEC_HE + xbos TECHSPEC |
| **tech_spec** | `docs/ecosystem/TECHSPEC_HE_SINH_THAI_XEVN.md` §4–9 · `docs/xbos/TECHSPEC.md` M01 |
| **api_contract** | POST `/api/xbos/alerts/violation-ingest` · `alerts.controller.ts` |
| **author** | ba-process · PO-UC-TC-W1-S1-XBOS-CORE |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_IMPL` |
| **code_note** | `alerts.controller.ts` violation-ingest. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`.

---

## 1. Mục tiêu UC (1 đoạn)

Tiếp nhận cảnh báo/vi phạm từ phân hệ vệ tinh vào XBOS để hiển thị điều hành.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-AL-01 | Ingest cảnh báo | Nhận payload vệ tinh | Satellite |
| CAP-AL-02 | Xác thực nguồn | Chỉ nguồn ủy quyền | Hệ thống |

**Đếm nghiệp vụ:** 2

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-AL-01 | FN-AL-INGEST | POST violation-ingest | API | Y |
| CAP-AL-02 | FN-AL-AUTH | Internal auth ingest | header internal | N |

**Đếm chức năng:** 2

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-AL-INGEST | 1 | 2 | 1 | 0 | 1 | 5 |
| FN-AL-AUTH | 0 | 0 | 0 | 1 | 0 | 1 |
| **Tổng** | 1 | 2 | 1 | 1 | 1 | **6** |


---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-XBOS-07-ING-HP-001 | CAP-AL-01 | FN-AL-INGEST | HP | P0 | service/admin JWT | internal auth OK | 1. POST payload hợp lệ | 2xx · lưu/queue alert | API | UC-XBOS-07 |
| TC-XBOS-07-ING-FD-001 | CAP-AL-01 | FN-AL-INGEST | FD | P0 | service/admin JWT | — | 1. Thiếu field bắt buộc | 4xx | API | validate |
| TC-XBOS-07-ING-FD-002 | CAP-AL-01 | FN-AL-INGEST | FD | P1 | service/admin JWT | — | 1. enum severity sai | 4xx | API |  |
| TC-XBOS-07-AUTH-AU-001 | CAP-AL-02 | FN-AL-AUTH | AU | P0 | anonymous | không internal key | 1. POST public | 401/403 | API | internal-auth |
| TC-XBOS-07-ING-BD-001 | CAP-AL-01 | FN-AL-INGEST | BD | P2 | service/admin JWT | — | 1. message cực dài | cắt/reject · không 500 | API | BD |
| TC-XBOS-07-ING-UX-001 | CAP-AL-01 | FN-AL-INGEST | UX | P1 | ceo@xe.vn (group CEO) | sau ingest | 1. Mở CC cảnh báo (nếu wire) | thấy alert hoặc SPEC_GAP FE ghi rõ | UI | CC alerts |

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
| BE API/DTO | `alerts.controller.ts` violation-ingest. | `apps/api/xbos-api/src/**` · matrix e2e_pass |
| FE menu/nút/role | Surface UI → portal/CC theo HDSD; API-only → N/A menu | `apps/web` (spot) |
| Mobile (nếu có) | N/A — XBOS core Phase1 | — |
| RBAC / scope | JWT + company/tenant ladder | SRS_VN §2–3 |

**Verdict code_readiness:** `LIKELY_IMPL` — thiết kế TC; **không** = UAT PASS.

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-XBOS-07
cases_designed: 6
code_readiness: LIKELY_IMPL
```
