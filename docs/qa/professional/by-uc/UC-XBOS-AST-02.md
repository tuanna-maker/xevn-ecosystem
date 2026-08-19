# UC — `UC-XBOS-AST-02` · Theo dõi vòng đời tài sản

| Meta | Value |
|------|--------|
| **uc_id** | `UC-XBOS-AST-02` |
| **stt_phase1** | 42 |
| **mod** | M01 |
| **name_vi** | Theo dõi vòng đời tài sản |
| **actors** | Operations · Group CEO |
| **surfaces** | api / web-portal |
| **srs_old** | `docs/xbos/BANG_TONG_HOP_USECASE_XBOS.md` STT 42 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` #42 · matrix SRS Có |
| **srs_new** | N/A-DELTA (lifecycle AS-IS) |
| **tech_spec** | TECHSPEC_HE §4–9 · PATCH assets |
| **api_contract** | GET/PATCH `/api/xbos/assets/:assetId` · `ASSET-REG-200` |
| **author** | ba-process · PO-UC-TC-W1-S2-XBOS-ORG-WF |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_IMPL` |
| **code_note** | PATCH updateAsset + status transition trong AssetsService; FE lifecycle UI cần xác nhận menu. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. Squad **W1-S2-XBOS-ORG-WF**.

---

## 1. Mục tiêu UC (1 đoạn)

Cập nhật trạng thái/vòng đời tài sản (active/idle/disposed…) đúng scope và quan sát được sau F5.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-AST-LC | Cập nhật vòng đời | PATCH status/fields | Ops |
| CAP-AST-LC-CTRL | Chặn chuyển trạng thái sai | FD + scope | Hệ thống |

**Đếm nghiệp vụ:** 2

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-AST-LC | FN-AST-PATCH | Cập nhật tài sản | PATCH /assets/:id | Y |
| CAP-AST-LC | FN-AST-VIEW-LC | Xem trạng thái sau cập nhật | GET detail | N |
| CAP-AST-LC-CTRL | FN-AST-BAD-ST | Status không hợp lệ | PATCH | Y |
| CAP-AST-LC-CTRL | FN-AST-LC-SCOPE | Scope member | PATCH | Y |

**Đếm chức năng:** 4

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-AST-PATCH | 1 | 1 | 0 | 0 | 0 | 2 |
| FN-AST-VIEW-LC | 1 | 0 | 0 | 0 | 1 | 2 |
| FN-AST-BAD-ST | 0 | 1 | 1 | 0 | 0 | 2 |
| FN-AST-LC-SCOPE | 0 | 1 | 0 | 1 | 0 | 2 |
| **Tổng** | 2 | 3 | 1 | 1 | 1 | **8** |

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-DM-AST-02-AST-PATCH-HP-001 | CAP-AST-LC | FN-AST-PATCH | HP | P0 | ceo@xe.vn / Group CEO | Asset đã tạo từ FE/API trong scope | 1. PATCH status=active + tên 2. F5 detail | 200 `ASSET-REG-200` · status sticky | API/UI | AST-02 |
| TC-DM-AST-02-AST-PATCH-FD-001 | CAP-AST-LC | FN-AST-PATCH | FD | P0 | ceo@xe.vn / Group CEO | asset tồn tại | 1. PATCH body rỗng / field cấm | 4xx · không đổi version ảo | API | UpdateAssetDto |
| TC-DM-AST-02-AST-VIEW-LC-HP-001 | CAP-AST-LC | FN-AST-VIEW-LC | HP | P0 | ceo@xe.vn / Group CEO | sau PATCH HP | 1. GET by id | 200 khớp PATCH | API | get |
| TC-DM-AST-02-AST-VIEW-LC-UX-001 | CAP-AST-LC | FN-AST-VIEW-LC | UX | P1 | ceo@xe.vn / Group CEO | id không tồn tại | 1. GET fake id | 404 honest | API | 404 |
| TC-DM-AST-02-AST-BAD-ST-FD-001 | CAP-AST-LC-CTRL | FN-AST-BAD-ST | FD | P0 | ceo@xe.vn / Group CEO | asset active | 1. PATCH status=not_a_status | 4xx validation | API | enum |
| TC-DM-AST-02-AST-BAD-ST-BD-001 | CAP-AST-LC-CTRL | FN-AST-BAD-ST | BD | P1 | ceo@xe.vn / Group CEO | asset | 1. PATCH status biên hợp lệ cuối enum | 200 hoặc 4xx deterministic | API | BD |
| TC-DM-AST-02-AST-LC-SCOPE-AU-001 | CAP-AST-LC-CTRL | FN-AST-LC-SCOPE | AU | P0 | du-lich.ceo@xe.vn / Member CEO | asset CT khác | 1. PATCH | 403/409/404 | API | scope |
| TC-DM-AST-02-AST-LC-SCOPE-FD-001 | CAP-AST-LC-CTRL | FN-AST-LC-SCOPE | FD | P1 | ceo@xe.vn / Group CEO | module lệch | 1. PATCH x-module-code sai | `ASSET-MOD-409` | API | module |

---

## 6. Coverage check

| Check | Req | In design | GAP |
|-------|----------|-----------|-----|
| Mọi Cap có ≥1 FN | 2 | YES | — |
| Mọi FN mutate ≥1 HP + ≥1 FD | 3 | PARTIAL | — |
| Auth/scope nếu đa CT | required | YES | — |
| SPEC_GAP ghi rõ | — | none recorded | — |
| Self-approve FD (WF) | N/A | N/A | — |

---

## 7. FE / BE / Role (đánh giá thiết kế — chưa UAT)

| Layer | Finding | Evidence (path/#) |
|-------|---------|-------------------|
| BE API/DTO | Controller/service tồn tại cho PATCH /api/xbos/assets/:id; response code theo OpenAPI/runtime. | apps/api/xbos-api/src/** · API_CONTRACT_VN.md |
| FE menu/nút/role | Portal CC / Settings — UF AST-02; menu HDSD Command Center. | docs/qa/USER_FLOW_OPERABILITY_MATRIX.md · apps/web |
| Mobile (nếu có) | N/A — web/portal UC | — |
| RBAC / scope | JWT scope main vs member slug; 403/409 khi lệch scope. | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · scope-context |

**Verdict code_readiness:** `LIKELY_IMPL` — thiết kế only; không = UAT PASS.

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-XBOS-AST-02
cases_designed: 8
code_readiness: LIKELY_IMPL
work_item_id: PO-UC-TC-W1-S2-XBOS-ORG-WF
squad: W1-S2-XBOS-ORG-WF
uat_done: false
```
