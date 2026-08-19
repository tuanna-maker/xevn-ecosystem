# UC — `UC-XBOS-04` · Liệt kê danh mục theo phân hệ đích

| Meta | Value |
|------|--------|
| **uc_id** | `UC-XBOS-04` |
| **stt_phase1** | 4 |
| **mod** | M01 |
| **name_vi** | Liệt kê danh mục theo phân hệ đích |
| **actors** | Admin · Consumer |
| **surfaces** | api / xbos-cc |
| **srs_old** | `BANG_TONG_HOP_USECASE_XEVN.md` · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` · client-delivery SRS Có · STT 4 |
| **srs_new** | `SRS_VN.md` §3 Yêu cầu XBOS (catalog · WF · audit · RBAC · soft-delete) |
| **tech_spec** | `docs/ecosystem/TECHSPEC_HE_SINH_THAI_XEVN.md` §4–9 · `docs/xbos/TECHSPEC.md` M01 |
| **api_contract** | GET `/api/xbos/config-sync/catalogs` |
| **author** | ba-process · PO-UC-TC-W1-S1-XBOS-CORE |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_IMPL` |
| **code_note** | GET catalogs trong config-sync.controller.ts. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`.

---

## 1. Mục tiêu UC (1 đoạn)

Liệt kê các danh mục đã gán cho một phân hệ đích để vận hành/đồng bộ.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-LIST-01 | Liệt kê theo đích | Thấy đủ catalog của module | Admin |

**Đếm nghiệp vụ:** 1

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-LIST-01 | FN-CAT-LIST | List catalogs by target | GET catalogs | N |

**Đếm chức năng:** 1

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-CAT-LIST | 2 | 1 | 0 | 1 | 1 | 5 |
| **Tổng** | 2 | 1 | 0 | 1 | 1 | **5** |


---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-XBOS-04-LIST-HP-001 | CAP-LIST-01 | FN-CAT-LIST | HP | P0 | ceo@xe.vn (group CEO) | đã có gán | 1. Mở tổng quan danh mục theo phân hệ / GET | danh sách ≥0 · không ERROR banner | UI/API | UC-XBOS-04 |
| TC-XBOS-04-LIST-FD-001 | CAP-LIST-01 | FN-CAT-LIST | FD | P1 | service/admin JWT | — | 1. target thiếu/sai | 4xx | API |  |
| TC-XBOS-04-LIST-AU-001 | CAP-LIST-01 | FN-CAT-LIST | AU | P0 | du-lich.ceo@xe.vn (member CEO) | member | 1. List holding-only | không lộ catalog ngoài quyền | API | RBAC |
| TC-XBOS-04-LIST-UX-001 | CAP-LIST-01 | FN-CAT-LIST | UX | P0 | ceo@xe.vn (group CEO) | chưa gán | 1. Mở list | empty hợp lệ | UI | U65 |
| TC-XBOS-04-LIST-HP-002 | CAP-LIST-01 | FN-CAT-LIST | HP | P1 | service/admin JWT | nhiều module | 1. Đổi filter target hrm vs xbos | kết quả khác nhau đúng gán | API |  |

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
| BE API/DTO | GET catalogs trong config-sync.controller.ts. | `apps/api/xbos-api/src/**` · matrix e2e_pass |
| FE menu/nút/role | Surface UI → portal/CC theo HDSD; API-only → N/A menu | `apps/web` (spot) |
| Mobile (nếu có) | N/A — XBOS core Phase1 | — |
| RBAC / scope | JWT + company/tenant ladder | SRS_VN §2–3 |

**Verdict code_readiness:** `LIKELY_IMPL` — thiết kế TC; **không** = UAT PASS.

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-XBOS-04
cases_designed: 5
code_readiness: LIKELY_IMPL
```
