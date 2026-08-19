# UC — `UC-XBOS-01` · Kiểm tra trạng thái dịch vụ

| Meta | Value |
|------|--------|
| **uc_id** | `UC-XBOS-01` |
| **stt_phase1** | 1 |
| **mod** | M01 |
| **name_vi** | Kiểm tra trạng thái dịch vụ |
| **actors** | Ops · DevOps · Portal proxy |
| **surfaces** | api |
| **srs_old** | `BANG_TONG_HOP_USECASE_XEVN.md` · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` · client-delivery SRS Có · STT 1 |
| **srs_new** | `SRS_VN.md` §3 Yêu cầu XBOS (catalog · WF · audit · RBAC · soft-delete) · NFR sẵn sàng dịch vụ |
| **tech_spec** | `docs/ecosystem/TECHSPEC_HE_SINH_THAI_XEVN.md` §4–9 · `docs/xbos/TECHSPEC.md` M01 |
| **api_contract** | GET `/api/xbos` → `XBOS-HEALTH-200` · `app.controller.ts` |
| **author** | ba-process · PO-UC-TC-W1-S1-XBOS-CORE |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_IMPL` |
| **code_note** | BE: `apps/api/xbos-api/src/app.controller.ts` getHello trả ok + XBOS-HEALTH-200. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`.

---

## 1. Mục tiêu UC (1 đoạn)

Xác nhận dịch vụ XBOS API sẵn sàng phục vụ (health) trước mọi luồng nghiệp vụ portal/proxy.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-H-01 | Kiểm tra sống dịch vụ | API phản hồi 2xx đúng mã | Ops |
| CAP-H-02 | Phân biệt lỗi hạ tầng | Down vs lỗi nghiệp vụ | Ops |

**Đếm nghiệp vụ:** 2

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-H-01 | FN-HEALTH-GET | GET health root | GET /api/xbos | N |
| CAP-H-02 | FN-HEALTH-PROXY | Portal proxy tới XBOS | Vite/nginx proxy | N |

**Đếm chức năng:** 2

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-HEALTH-GET | 1 | 0 | 0 | 1 | 1 | 3 |
| FN-HEALTH-PROXY | 1 | 1 | 0 | 0 | 0 | 2 |
| **Tổng** | 2 | 1 | 0 | 1 | 1 | **5** |


---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-XBOS-01-HEALTH-HP-001 | CAP-H-01 | FN-HEALTH-GET | HP | P0 | service/admin JWT | xbos-api đang chạy | 1. GET /api/xbos | 200 · mã XBOS-HEALTH-200 · status ok | API | matrix UC-XBOS-01 |
| TC-XBOS-01-HEALTH-UX-001 | CAP-H-01 | FN-HEALTH-GET | UX | P0 | service/admin JWT | service dừng | 1. GET /api/xbos | ECONNREFUSED / 502 — không giả 200 | API | qc:dev-stack |
| TC-XBOS-01-HEALTH-AU-001 | CAP-H-01 | FN-HEALTH-GET | AU | P1 | service/admin JWT | không JWT | 1. GET /api/xbos không auth | 200 nếu public health AS-IS hoặc 401 nếu đổi policy — ghi thực tế | API | SRS_VN NFR |
| TC-XBOS-01-PROXY-HP-001 | CAP-H-02 | FN-HEALTH-PROXY | HP | P0 | ceo@xe.vn (group CEO) | portal + API up | 1. Mở portal · DevTools /api/xbos | 2xx qua proxy · không banner Sync ERROR | UI/API | L0 |
| TC-XBOS-01-PROXY-FD-001 | CAP-H-02 | FN-HEALTH-PROXY | FD | P0 | ceo@xe.vn (group CEO) | API down | 1. Reload màn dùng XBOS | UI báo lỗi kết nối rõ · không data giả | UI | U65 |

---

## 6. Coverage check

| Check | Req | In design | GAP |
|-------|----------|-----------|-----|
| Mọi Cap có ≥1 FN | Yes | Yes | — |
| Mọi FN mutate ≥1 HP + ≥1 FD | Yes | N/A (read-only) | — |
| Auth/scope nếu đa CT | Yes | Yes | — |
| SPEC_GAP ghi rõ | Yes | xem code_note / FD | — |

---

## 7. FE / BE / Role (đánh giá thiết kế — chưa UAT)

| Layer | Finding | Evidence (path/#) |
|-------|---------|-------------------|
| BE API/DTO | BE: `apps/api/xbos-api/src/app.controller.ts` getHello trả ok + XBOS-HEALTH-200. | `apps/api/xbos-api/src/**` · matrix e2e_pass |
| FE menu/nút/role | Surface UI → portal/CC theo HDSD; API-only → N/A menu | `apps/web` (spot) |
| Mobile (nếu có) | N/A — XBOS core Phase1 | — |
| RBAC / scope | JWT + company/tenant ladder | SRS_VN §2–3 |

**Verdict code_readiness:** `LIKELY_IMPL` — thiết kế TC; **không** = UAT PASS.

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-XBOS-01
cases_designed: 5
code_readiness: LIKELY_IMPL
```
