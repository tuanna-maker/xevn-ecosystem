# UC — `UC-XBOS-SYNC-01` · Bootstrap hệ sinh thái XEVN (danh mục nền)

| Meta | Value |
|------|--------|
| **uc_id** | `UC-XBOS-SYNC-01` |
| **stt_phase1** | 8 |
| **mod** | M01 |
| **name_vi** | Bootstrap hệ sinh thái XEVN (danh mục nền) |
| **actors** | DevOps · Platform admin |
| **surfaces** | api |
| **srs_old** | `BANG_TONG_HOP_USECASE_XEVN.md` · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` · client-delivery SRS Có · STT 8 |
| **srs_new** | N/A-DELTA — pack mới không FR chi tiết từng UC; neo matrix + TECHSPEC_HE + xbos TECHSPEC · TECHSPEC bootstrap env |
| **tech_spec** | `docs/ecosystem/TECHSPEC_HE_SINH_THAI_XEVN.md` §4–9 · `docs/xbos/TECHSPEC.md` M01 |
| **api_contract** | POST `/api/xbos/config-sync/bootstrap-xevn` |
| **author** | ba-process · PO-UC-TC-W1-S1-XBOS-CORE |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_IMPL` |
| **code_note** | `config-sync.controller.ts` bootstrap-xevn — **không** dùng làm evidence UAT U65. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`.

---

## 1. Mục tiêu UC (1 đoạn)

Bootstrap danh mục nền khi môi trường trống (ops) — tách khỏi nghiệm thu FE.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-BOOT-01 | Bootstrap danh mục nền | Tạo nền tảng catalog | DevOps |
| CAP-BOOT-02 | Idempotent / an toàn | Chạy lại không phá dữ liệu sống | Hệ thống |

**Đếm nghiệp vụ:** 2

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-BOOT-01 | FN-BOOT-RUN | POST bootstrap-xevn | API ops | Y |
| CAP-BOOT-02 | FN-BOOT-GUARD | Auth + idempotent | API | Y |

**Đếm chức năng:** 2

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-BOOT-RUN | 1 | 1 | 1 | 0 | 1 | 4 |
| FN-BOOT-GUARD | 1 | 1 | 0 | 2 | 0 | 4 |
| **Tổng** | 2 | 2 | 1 | 2 | 1 | **8** |


---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-XBOS-SYNC-01-BOOT-HP-001 | CAP-BOOT-01 | FN-BOOT-RUN | HP | P0 | service/admin JWT | env trống/dev được phép | 1. POST bootstrap-xevn auth ops | 2xx · catalogs nền tồn tại | API | **không** U65 evidence |
| TC-XBOS-SYNC-01-BOOT-FD-001 | CAP-BOOT-01 | FN-BOOT-RUN | FD | P0 | service/admin JWT | thiếu env MASTER_TENANT | 1. Bootstrap | lỗi cấu hình rõ | API | TECHSPEC bootstrap |
| TC-XBOS-SYNC-01-BOOT-AU-001 | CAP-BOOT-02 | FN-BOOT-GUARD | AU | P0 | EMPLOYEE (NV thường) | NV | 1. POST bootstrap | 403 | API | RBAC |
| TC-XBOS-SYNC-01-BOOT-HP-002 | CAP-BOOT-02 | FN-BOOT-GUARD | HP | P1 | service/admin JWT | đã bootstrap | 1. Chạy lại | idempotent · không nhân bản phá | API | idempotent |
| TC-XBOS-SYNC-01-BOOT-FD-002 | CAP-BOOT-02 | FN-BOOT-GUARD | FD | P0 | service/admin JWT | prod lock | 1. Bootstrap khi cấm | reject / guard | API | ops |
| TC-XBOS-SYNC-01-BOOT-UX-001 | CAP-BOOT-01 | FN-BOOT-RUN | UX | P2 | ceo@xe.vn (group CEO) | sau bootstrap (dev) | 1. Mở CC danh mục nền | thấy data — không dùng làm UF PASS | UI | U65 lock |
| TC-XBOS-SYNC-01-BOOT-BD-001 | CAP-BOOT-01 | FN-BOOT-RUN | BD | P2 | service/admin JWT | partial fail | 1. Lỗi giữa chừng | rollback/resume rõ | API | reliability |
| TC-XBOS-SYNC-01-BOOT-AU-002 | CAP-BOOT-02 | FN-BOOT-GUARD | AU | P1 | du-lich.ceo@xe.vn (member CEO) | member | 1. Bootstrap holding | 403/409 | API | scope |

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
| BE API/DTO | `config-sync.controller.ts` bootstrap-xevn — **không** dùng làm evidence UAT U65. | `apps/api/xbos-api/src/**` · matrix e2e_pass |
| FE menu/nút/role | Surface UI → portal/CC theo HDSD; API-only → N/A menu | `apps/web` (spot) |
| Mobile (nếu có) | N/A — XBOS core Phase1 | — |
| RBAC / scope | JWT + company/tenant ladder | SRS_VN §2–3 |

**Verdict code_readiness:** `LIKELY_IMPL` — thiết kế TC; **không** = UAT PASS.

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-XBOS-SYNC-01
cases_designed: 8
code_readiness: LIKELY_IMPL
```
