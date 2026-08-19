# UC — `UC-XBOS-INF-01` · Xem và sửa cấu hình hạ tầng danh mục nền

| Meta | Value |
|------|--------|
| **uc_id** | `UC-XBOS-INF-01` |
| **stt_phase1** | 74 |
| **mod** | M01 |
| **name_vi** | Xem và sửa cấu hình hạ tầng danh mục nền |
| **actors** | Platform admin · Group CEO |
| **surfaces** | api / xbos-cc |
| **srs_old** | `docs/xbos/BANG_TONG_HOP_USECASE_XBOS.md` STT 74 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` #74 · matrix SRS Có |
| **srs_new** | N/A-DELTA |
| **tech_spec** | infrastructure controller |
| **api_contract** | GET/PUT `/api/xbos/infrastructure/*` |
| **author** | ba-process · PO-UC-TC-W1-S2-XBOS-ORG-WF |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_IMPL` |
| **code_note** | infrastructure.controller tồn tại. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. Squad **W1-S2-XBOS-ORG-WF**.

---

## 1. Mục tiêu UC (1 đoạn)

Xem và sửa cấu hình hạ tầng danh mục nền; F5 sticky; chặn member.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-I1 | Infra config | CRUD config | Admin |

**Đếm nghiệp vụ:** 1

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-I1 | FN-I1-GET | Xem config | GET | N |
| CAP-I1 | FN-I1-PUT | Sửa config | PUT | Y |

**Đếm chức năng:** 2

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-I1-GET | 1 | 0 | 0 | 0 | 1 | 2 |
| FN-I1-PUT | 1 | 1 | 1 | 1 | 0 | 4 |
| **Tổng** | 2 | 1 | 1 | 1 | 1 | **6** |

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-DM-INF-01-I1-GET-HP-001 | CAP-I1 | FN-I1-GET | HP | P0 | ceo@xe.vn / Group CEO | login | 1. GET infra | 200 | API/UI | INF-01 |
| TC-DM-INF-01-I1-GET-UX-001 | CAP-I1 | FN-I1-GET | UX | P1 | ceo@xe.vn / Group CEO | — | 1. UI | loading/empty | UI | UX |
| TC-DM-INF-01-I1-PUT-HP-001 | CAP-I1 | FN-I1-PUT | HP | P0 | ceo@xe.vn / Group CEO | form | 1. Sửa 2. Lưu 3. F5 | 2xx sticky | UI/API | INF-01 |
| TC-DM-INF-01-I1-PUT-FD-001 | CAP-I1 | FN-I1-PUT | FD | P0 | ceo@xe.vn / Group CEO | — | 1. Key không hợp lệ | 4xx | API | FD |
| TC-DM-INF-01-I1-PUT-AU-001 | CAP-I1 | FN-I1-PUT | AU | P0 | du-lich.ceo@xe.vn / Member CEO | member | 1. PUT | 403/409 | API | AU |
| TC-DM-INF-01-I1-PUT-BD-001 | CAP-I1 | FN-I1-PUT | BD | P2 | ceo@xe.vn / Group CEO | — | 1. Payload lớn | 4xx/limit | API | BD |

---

## 6. Coverage check

| Check | Req | In design | GAP |
|-------|----------|-----------|-----|
| Mọi Cap có ≥1 FN | 1 | YES | — |
| Mọi FN mutate ≥1 HP + ≥1 FD | 1 | YES | — |
| Auth/scope nếu đa CT | required | YES | — |
| SPEC_GAP ghi rõ | — | none recorded | — |
| Self-approve FD (WF) | N/A | N/A | — |

---

## 7. FE / BE / Role (đánh giá thiết kế — chưa UAT)

| Layer | Finding | Evidence (path/#) |
|-------|---------|-------------------|
| BE API/DTO | Controller/service tồn tại cho infrastructure; response code theo OpenAPI/runtime. | apps/api/xbos-api/src/** · API_CONTRACT_VN.md |
| FE menu/nút/role | Portal CC / Settings — UF INF-01; menu HDSD Command Center. | docs/qa/USER_FLOW_OPERABILITY_MATRIX.md · apps/web |
| Mobile (nếu có) | N/A — web/portal UC | — |
| RBAC / scope | JWT scope main vs member slug; 403/409 khi lệch scope. | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · scope-context |

**Verdict code_readiness:** `LIKELY_IMPL` — thiết kế only; không = UAT PASS.

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-XBOS-INF-01
cases_designed: 6
code_readiness: LIKELY_IMPL
work_item_id: PO-UC-TC-W1-S2-XBOS-ORG-WF
squad: W1-S2-XBOS-ORG-WF
uat_done: false
```
