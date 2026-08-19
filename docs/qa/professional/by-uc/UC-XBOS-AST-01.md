# UC — `UC-XBOS-AST-01` · Đăng ký tài sản

| Meta | Value |
|------|--------|
| **uc_id** | `UC-XBOS-AST-01` |
| **stt_phase1** | 41 |
| **mod** | M01 |
| **name_vi** | Đăng ký tài sản |
| **actors** | Operations / Asset owner · Group CEO (scope) |
| **surfaces** | api / web-portal |
| **srs_old** | `docs/xbos/BANG_TONG_HOP_USECASE_XBOS.md` STT 41 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` #41 · UF liên quan AR/AST |
| **srs_new** | `SRS_VN.md` — N/A-DELTA (asset registry AS-IS TECHSPEC_HE); map WF 2-level N/A trừ khi gắn AR |
| **tech_spec** | `TECHSPEC_HE` §4–9 · assets module |
| **api_contract** | POST/GET `/api/xbos/assets` · codes `ASSET-REG-201` / `ASSET-REG-200` · `ASSET-MOD-409` module mismatch |
| **author** | ba-process · PO-UC-TC-W1-S2-XBOS-ORG-WF |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_IMPL` |
| **code_note** | AssetsController create/list tồn tại; FE portal surface có thể mỏng so với API — verify menu trước UAT. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. Squad **W1-S2-XBOS-ORG-WF**.

---

## 1. Mục tiêu UC (1 đoạn)

Đăng ký tài sản mới thuộc đúng tenant/company và module owner (vehicle/it/…), validate bắt buộc, chống ghi sai scope.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-AST-REG | Đăng ký tài sản | Tạo bản ghi tài sản hợp lệ | Ops |
| CAP-AST-CTRL | Kiểm soát module & scope | Fail-closed module/JWT | Hệ thống |

**Đếm nghiệp vụ:** 2

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-AST-REG | FN-AST-CREATE | Tạo tài sản | POST /assets | Y |
| CAP-AST-REG | FN-AST-LIST | Liệt kê tài sản scope | GET /assets | N |
| CAP-AST-REG | FN-AST-GET | Xem chi tiết theo id | GET /assets/:id | N |
| CAP-AST-CTRL | FN-AST-MOD | Kiểm tra x-module-code vs token | header guard | Y |
| CAP-AST-CTRL | FN-AST-SCOPE | Chặn company ngoài JWT | scope-context | Y |

**Đếm chức năng:** 5

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-AST-CREATE | 1 | 1 | 1 | 0 | 0 | 3 |
| FN-AST-LIST | 1 | 0 | 0 | 0 | 1 | 2 |
| FN-AST-GET | 1 | 0 | 0 | 1 | 0 | 2 |
| FN-AST-MOD | 1 | 1 | 0 | 0 | 0 | 2 |
| FN-AST-SCOPE | 0 | 1 | 0 | 1 | 0 | 2 |
| **Tổng** | 4 | 3 | 1 | 2 | 1 | **11** |

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-DM-AST-01-AST-CREATE-HP-001 | CAP-AST-REG | FN-AST-CREATE | HP | P0 | ceo@xe.vn / Group CEO | JWT hợp lệ + module claim operations | 1. POST body assetCode/Name/Type + company trong scope 2. Quan sát FE/list nếu có | 201 `ASSET-REG-201` · row xuất hiện · F5 còn | API/UI | UC-XBOS-AST-01 · assets.controller |
| TC-DM-AST-01-AST-CREATE-FD-001 | CAP-AST-REG | FN-AST-CREATE | FD | P0 | ceo@xe.vn / Group CEO | JWT OK | 1. POST thiếu assetCode hoặc assetType | 4xx validation · không tạo bản ghi | API | CreateAssetDto |
| TC-DM-AST-01-AST-CREATE-BD-001 | CAP-AST-REG | FN-AST-CREATE | BD | P1 | ceo@xe.vn / Group CEO | JWT OK | 1. assetCode độ dài biên / ký tự đặc biệt theo DTO | accept hoặc 4xx deterministic | API | DTO |
| TC-DM-AST-01-AST-LIST-HP-001 | CAP-AST-REG | FN-AST-LIST | HP | P0 | ceo@xe.vn / Group CEO | Có ≥0 asset trong CT | 1. GET /assets đúng scope | 200 `ASSET-REG-200` · items[] | API | list |
| TC-DM-AST-01-AST-LIST-UX-001 | CAP-AST-REG | FN-AST-LIST | UX | P1 | ceo@xe.vn / Group CEO | CT chưa có asset | 1. GET list | 200 empty hợp lệ · UI empty state (không ERROR banner) | UI/API | empty |
| TC-DM-AST-01-AST-GET-HP-001 | CAP-AST-REG | FN-AST-GET | HP | P0 | ceo@xe.vn / Group CEO | Biết assetId trong scope | 1. GET /assets/:id | 200 · đúng mã | API | getById |
| TC-DM-AST-01-AST-GET-AU-001 | CAP-AST-REG | FN-AST-GET | AU | P0 | du-lich.ceo@xe.vn / Member CEO | asset thuộc CT khác | 1. GET bằng JWT member | 403/404 scope · không lộ dữ liệu | API | scope parity |
| TC-DM-AST-01-AST-MOD-FD-001 | CAP-AST-CTRL | FN-AST-MOD | FD | P0 | ceo@xe.vn / Group CEO | token module ≠ header | 1. POST với x-module-code lệch claim | `ASSET-MOD-409` | API | resolveAuthoritativeModule |
| TC-DM-AST-01-AST-MOD-HP-001 | CAP-AST-CTRL | FN-AST-MOD | HP | P1 | ceo@xe.vn / Group CEO | module khớp | 1. POST header = claim | 201 | API | module ok |
| TC-DM-AST-01-AST-SCOPE-AU-001 | CAP-AST-CTRL | FN-AST-SCOPE | AU | P0 | du-lich.ceo@xe.vn / Member CEO | JWT member | 1. POST companyId holding/main | 403/409 companyId mismatches token scope | API | UF-XBOS-11 pattern |
| TC-DM-AST-01-AST-SCOPE-FD-001 | CAP-AST-CTRL | FN-AST-SCOPE | FD | P1 | ceo@xe.vn / Group CEO | thiếu token | 1. POST không Authorization | 401 `XBOS-AUTH-001` hoặc tương đương | API | auth |

---

## 6. Coverage check

| Check | Req | In design | GAP |
|-------|----------|-----------|-----|
| Mọi Cap có ≥1 FN | 2 | YES | — |
| Mọi FN mutate ≥1 HP + ≥1 FD | 3 | PARTIAL | — |
| Auth/scope nếu đa CT | required | YES | — |
| SPEC_GAP ghi rõ | — | none recorded | SRS_VN chưa FR asset chi tiết — N/A-DELTA |
| Self-approve FD (WF) | N/A | N/A | — |

---

## 7. FE / BE / Role (đánh giá thiết kế — chưa UAT)

| Layer | Finding | Evidence (path/#) |
|-------|---------|-------------------|
| BE API/DTO | Controller/service tồn tại cho /api/xbos/assets; response code theo OpenAPI/runtime. | apps/api/xbos-api/src/** · API_CONTRACT_VN.md |
| FE menu/nút/role | Portal CC / Settings — UF AST; menu HDSD Command Center. | docs/qa/USER_FLOW_OPERABILITY_MATRIX.md · apps/web |
| Mobile (nếu có) | N/A — web/portal UC | — |
| RBAC / scope | JWT scope main vs member slug; 403/409 khi lệch scope. | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · scope-context |

**Verdict code_readiness:** `LIKELY_IMPL` — thiết kế only; không = UAT PASS.

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-XBOS-AST-01
cases_designed: 11
code_readiness: LIKELY_IMPL
work_item_id: PO-UC-TC-W1-S2-XBOS-ORG-WF
squad: W1-S2-XBOS-ORG-WF
uat_done: false
```
