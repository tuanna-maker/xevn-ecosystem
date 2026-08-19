# UC — `UC-XBOS-02` · Khởi tạo hoặc cập nhật danh mục dùng chung

| Meta | Value |
|------|--------|
| **uc_id** | `UC-XBOS-02` |
| **stt_phase1** | 2 |
| **mod** | M01 |
| **name_vi** | Khởi tạo hoặc cập nhật danh mục dùng chung |
| **actors** | Group admin · Config sync |
| **surfaces** | api / xbos-cc |
| **srs_old** | `BANG_TONG_HOP_USECASE_XEVN.md` · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` · client-delivery SRS Có · STT 2 |
| **srs_new** | `SRS_VN.md` §3 Yêu cầu XBOS (catalog · WF · audit · RBAC · soft-delete) · kế thừa catalog |
| **tech_spec** | `docs/ecosystem/TECHSPEC_HE_SINH_THAI_XEVN.md` §4–9 · `docs/xbos/TECHSPEC.md` M01 |
| **api_contract** | POST publish / apply-to-members · `config-sync.controller.ts` |
| **author** | ba-process · PO-UC-TC-W1-S1-XBOS-CORE |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_IMPL` |
| **code_note** | BE config-sync publish/apply; FE CC Hạ tầng danh mục. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`.

---

## 1. Mục tiêu UC (1 đoạn)

Khởi tạo hoặc cập nhật bản ghi danh mục dùng chung đúng khóa catalog và phân hệ đích.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-CAT-01 | Upsert danh mục | Tạo/cập nhật giá trị catalog | Admin |
| CAP-CAT-02 | Bảo vệ platform-owned | Không xóa cứng giá trị nền tảng | Hệ thống |
| CAP-CAT-03 | Phạm vi tenant | Ghi đúng tenant/company | Admin |

**Đếm nghiệp vụ:** 3

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-CAT-01 | FN-CAT-UPSERT | Khởi tạo/cập nhật catalog | API / CC Lưu | Y |
| CAP-CAT-01 | FN-CAT-VALIDATE | Validate payload | API 4xx | Y |
| CAP-CAT-02 | FN-CAT-PLATFORM-GUARD | Chặn hard-delete platform | API reject | Y |
| CAP-CAT-03 | FN-CAT-SCOPE | Scope tenant/company | JWT headers | N |

**Đếm chức năng:** 4

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-CAT-UPSERT | 2 | 1 | 0 | 1 | 1 | 5 |
| FN-CAT-VALIDATE | 0 | 2 | 1 | 0 | 0 | 3 |
| FN-CAT-PLATFORM-GUARD | 0 | 1 | 0 | 0 | 0 | 1 |
| FN-CAT-SCOPE | 0 | 0 | 0 | 1 | 0 | 1 |
| **Tổng** | 2 | 4 | 1 | 2 | 1 | **10** |


---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-XBOS-02-UPSERT-HP-001 | CAP-CAT-01 | FN-CAT-UPSERT | HP | P0 | ceo@xe.vn (group CEO) | đã login group | 1. Mở Hạ tầng / danh mục · 2. Sửa 1 giá trị · 3. Lưu | 2xx · FE cập nhật · F5 còn | UI/API | UC-XBOS-02 |
| TC-XBOS-02-UPSERT-HP-002 | CAP-CAT-01 | FN-CAT-UPSERT | HP | P1 | service/admin JWT | JWT admin | 1. API upsert hợp lệ | 201/200 · body có key | API | config-sync |
| TC-XBOS-02-UPSERT-FD-001 | CAP-CAT-01 | FN-CAT-VALIDATE | FD | P0 | ceo@xe.vn (group CEO) | form mở | 1. Lưu thiếu mã bắt buộc | 4xx · toast lỗi · không ghi | UI/API | validate |
| TC-XBOS-02-UPSERT-FD-002 | CAP-CAT-01 | FN-CAT-VALIDATE | FD | P0 | service/admin JWT | — | 1. catalogKey lạ | 4xx deterministic | API | BR |
| TC-XBOS-02-UPSERT-BD-001 | CAP-CAT-01 | FN-CAT-VALIDATE | BD | P1 | ceo@xe.vn (group CEO) | — | 1. mã độ dài 0 / max | 0 → lỗi; max → OK hoặc lỗi rõ | UI | BD |
| TC-XBOS-02-GUARD-FD-001 | CAP-CAT-02 | FN-CAT-PLATFORM-GUARD | FD | P0 | TENANT_ADMIN / SUPER_ADMIN | item platform-owned | 1. Thử xóa cứng | reject · soft-only · SRS_VN §2 | API | platform |
| TC-XBOS-02-SCOPE-AU-001 | CAP-CAT-03 | FN-CAT-SCOPE | AU | P0 | du-lich.ceo@xe.vn (member CEO) | member JWT | 1. Upsert catalog tập đoàn ngoài quyền | 403/409 · không ghi holding | API | scope |
| TC-XBOS-02-UPSERT-UX-001 | CAP-CAT-01 | FN-CAT-UPSERT | UX | P1 | ceo@xe.vn (group CEO) | list trống hợp lệ | 1. Mở màn danh mục | empty hợp lệ · không storm | UI | U65 |
| TC-XBOS-02-UPSERT-FD-003 | CAP-CAT-01 | FN-CAT-UPSERT | FD | P1 | ceo@xe.vn (group CEO) | API 500 | 1. Lưu khi lỗi server | banner lỗi · không toast success giả | UI | reliability |
| TC-XBOS-02-UPSERT-AU-001 | CAP-CAT-03 | FN-CAT-UPSERT | AU | P0 | EMPLOYEE (NV thường) | NV thường | 1. Gọi upsert | 403 | API | RBAC |

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
| BE API/DTO | BE config-sync publish/apply; FE CC Hạ tầng danh mục. | `apps/api/xbos-api/src/**` · matrix e2e_pass |
| FE menu/nút/role | Surface UI → portal/CC theo HDSD; API-only → N/A menu | `apps/web` (spot) |
| Mobile (nếu có) | N/A — XBOS core Phase1 | — |
| RBAC / scope | JWT + company/tenant ladder | SRS_VN §2–3 |

**Verdict code_readiness:** `LIKELY_IMPL` — thiết kế TC; **không** = UAT PASS.

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-XBOS-02
cases_designed: 10
code_readiness: LIKELY_IMPL
```
