# UC — `UC-XBOS-03` · Lấy danh mục theo tên danh mục và phân hệ đích

| Meta | Value |
|------|--------|
| **uc_id** | `UC-XBOS-03` |
| **stt_phase1** | 3 |
| **mod** | M01 |
| **name_vi** | Lấy danh mục theo tên danh mục và phân hệ đích |
| **actors** | Consumer API (HRM/XBOS FE) |
| **surfaces** | api |
| **srs_old** | `BANG_TONG_HOP_USECASE_XEVN.md` · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` · client-delivery SRS Có · STT 3 |
| **srs_new** | `SRS_VN.md` §3 Yêu cầu XBOS (catalog · WF · audit · RBAC · soft-delete) |
| **tech_spec** | `docs/ecosystem/TECHSPEC_HE_SINH_THAI_XEVN.md` §4–9 · `docs/xbos/TECHSPEC.md` M01 |
| **api_contract** | GET `/api/xbos/config-sync/catalog/:catalogKey` |
| **author** | ba-process · PO-UC-TC-W1-S1-XBOS-CORE |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_IMPL` |
| **code_note** | `config-sync.controller.ts` GET catalog/:catalogKey. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`.

---

## 1. Mục tiêu UC (1 đoạn)

Consumer lấy đúng payload danh mục theo catalogKey và phân hệ đích đã gán.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-GET-01 | Đọc theo khóa | Trả đúng catalog | API client |
| CAP-GET-02 | Lọc phân hệ | Chỉ dữ liệu gán module đích | API client |

**Đếm nghiệp vụ:** 2

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-GET-01 | FN-CAT-GET | GET catalog by key | GET catalog/:key | N |
| CAP-GET-02 | FN-CAT-GET-TARGET | GET kèm target module | query target | N |

**Đếm chức năng:** 2

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-CAT-GET | 1 | 1 | 0 | 1 | 1 | 4 |
| FN-CAT-GET-TARGET | 1 | 1 | 0 | 0 | 0 | 2 |
| **Tổng** | 2 | 2 | 0 | 1 | 1 | **6** |


---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-XBOS-03-GET-HP-001 | CAP-GET-01 | FN-CAT-GET | HP | P0 | service/admin JWT | catalog đã publish | 1. GET catalogKey hợp lệ | 200 · items khớp key | API | UC-XBOS-03 |
| TC-XBOS-03-GET-FD-001 | CAP-GET-01 | FN-CAT-GET | FD | P0 | service/admin JWT | — | 1. GET key không tồn tại | 404/4xx rõ mã | API |  |
| TC-XBOS-03-GET-AU-001 | CAP-GET-01 | FN-CAT-GET | AU | P0 | du-lich.ceo@xe.vn (member CEO) | member | 1. GET catalog ngoài scope | 403/409 hoặc empty theo policy | API | scope |
| TC-XBOS-03-TGT-HP-001 | CAP-GET-02 | FN-CAT-GET-TARGET | HP | P0 | service/admin JWT | đã gán HRM | 1. GET kèm target=hrm | chỉ items thuộc gán HRM | API | TECHSPEC |
| TC-XBOS-03-TGT-FD-001 | CAP-GET-02 | FN-CAT-GET-TARGET | FD | P1 | service/admin JWT | — | 1. target không hỗ trợ | 4xx | API |  |
| TC-XBOS-03-GET-UX-001 | CAP-GET-01 | FN-CAT-GET | UX | P1 | service/admin JWT | catalog rỗng | 1. GET key hợp lệ empty | 200 + [] · không 500 | API | empty OK |

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
| BE API/DTO | `config-sync.controller.ts` GET catalog/:catalogKey. | `apps/api/xbos-api/src/**` · matrix e2e_pass |
| FE menu/nút/role | Surface UI → portal/CC theo HDSD; API-only → N/A menu | `apps/web` (spot) |
| Mobile (nếu có) | N/A — XBOS core Phase1 | — |
| RBAC / scope | JWT + company/tenant ladder | SRS_VN §2–3 |

**Verdict code_readiness:** `LIKELY_IMPL` — thiết kế TC; **không** = UAT PASS.

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-XBOS-03
cases_designed: 6
code_readiness: LIKELY_IMPL
```
