# UC — `UC-XBOS-05` · Phát hành phiên bản hợp đồng dữ liệu

| Meta | Value |
|------|--------|
| **uc_id** | `UC-XBOS-05` |
| **stt_phase1** | 5 |
| **mod** | M01 |
| **name_vi** | Phát hành phiên bản hợp đồng dữ liệu |
| **actors** | Group admin catalog governance |
| **surfaces** | api / xbos-cc |
| **srs_old** | `BANG_TONG_HOP_USECASE_XEVN.md` · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` · client-delivery SRS Có · STT 5 |
| **srs_new** | `SRS_VN.md` §3 Yêu cầu XBOS (catalog · WF · audit · RBAC · soft-delete) · sự kiện CATALOG_UPDATED |
| **tech_spec** | `docs/ecosystem/TECHSPEC_HE_SINH_THAI_XEVN.md` §4–9 · `docs/xbos/TECHSPEC.md` M01 |
| **api_contract** | POST catalog publish · config-sync + catalog-governance |
| **author** | ba-process · PO-UC-TC-W1-S1-XBOS-CORE |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_IMPL` |
| **code_note** | POST publish trên config-sync + catalog-governance.controller.ts. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`.

---

## 1. Mục tiêu UC (1 đoạn)

Phát hành phiên bản hợp đồng dữ liệu danh mục để consumer kéo bản ổn định.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-PUB-01 | Phát hành phiên bản | Đóng băng + tăng version | Admin |
| CAP-PUB-02 | Thông báo consumer | Sự kiện sau publish | Hệ thống |

**Đếm nghiệp vụ:** 2

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-PUB-01 | FN-CAT-PUBLISH | Publish version | Nút Phát hành / POST | Y |
| CAP-PUB-01 | FN-CAT-PUBLISH-VAL | Validate trước publish | API | Y |
| CAP-PUB-02 | FN-CAT-PUBLISH-EVT | Emit CATALOG_UPDATED | event bus | Y |

**Đếm chức năng:** 3

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-CAT-PUBLISH | 1 | 1 | 0 | 2 | 1 | 5 |
| FN-CAT-PUBLISH-VAL | 0 | 1 | 1 | 0 | 0 | 2 |
| FN-CAT-PUBLISH-EVT | 1 | 1 | 0 | 0 | 0 | 2 |
| **Tổng** | 2 | 3 | 1 | 2 | 1 | **9** |


---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-XBOS-05-PUB-HP-001 | CAP-PUB-01 | FN-CAT-PUBLISH | HP | P0 | ceo@xe.vn (group CEO) | có thay đổi draft | 1. Phát hành phiên bản | 2xx · version tăng · FE hiện version · F5 | UI/API | UC-XBOS-05 |
| TC-XBOS-05-PUB-FD-001 | CAP-PUB-01 | FN-CAT-PUBLISH-VAL | FD | P0 | ceo@xe.vn (group CEO) | draft invalid | 1. Publish thiếu field | 4xx · không tăng version | API | validate |
| TC-XBOS-05-PUB-FD-002 | CAP-PUB-01 | FN-CAT-PUBLISH | FD | P0 | ceo@xe.vn (group CEO) | không đổi | 1. Publish lại y chang | idempotent OK hoặc 4xx business — AS-IS | API | idempotency |
| TC-XBOS-05-PUB-AU-001 | CAP-PUB-01 | FN-CAT-PUBLISH | AU | P0 | du-lich.ceo@xe.vn (member CEO) | member | 1. Publish catalog tập đoàn | 403/409 | API | scope |
| TC-XBOS-05-PUB-AU-002 | CAP-PUB-01 | FN-CAT-PUBLISH | AU | P0 | EMPLOYEE (NV thường) | NV | 1. POST publish | 403 | API | RBAC |
| TC-XBOS-05-EVT-HP-001 | CAP-PUB-02 | FN-CAT-PUBLISH-EVT | HP | P1 | service/admin JWT | sau publish OK | 1. Quan sát outbox/event | CATALOG_UPDATED hoặc tương đương | API | SRS_VN §7 |
| TC-XBOS-05-EVT-FD-001 | CAP-PUB-02 | FN-CAT-PUBLISH-EVT | FD | P2 | service/admin JWT | broker down | 1. Publish khi event fail | DB OK + retry/DLQ | API | NFR |
| TC-XBOS-05-PUB-UX-001 | CAP-PUB-01 | FN-CAT-PUBLISH | UX | P1 | ceo@xe.vn (group CEO) | đang publish | 1. Double-click Phát hành | không 2 version lệch · UI locked | UI | UX |
| TC-XBOS-05-PUB-BD-001 | CAP-PUB-01 | FN-CAT-PUBLISH-VAL | BD | P2 | service/admin JWT | nhiều lần | 1. Publish liên tiếp | version tăng đơn điệu | API | BD |

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
| BE API/DTO | POST publish trên config-sync + catalog-governance.controller.ts. | `apps/api/xbos-api/src/**` · matrix e2e_pass |
| FE menu/nút/role | Surface UI → portal/CC theo HDSD; API-only → N/A menu | `apps/web` (spot) |
| Mobile (nếu có) | N/A — XBOS core Phase1 | — |
| RBAC / scope | JWT + company/tenant ladder | SRS_VN §2–3 |

**Verdict code_readiness:** `LIKELY_IMPL` — thiết kế TC; **không** = UAT PASS.

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-XBOS-05
cases_designed: 9
code_readiness: LIKELY_IMPL
```
