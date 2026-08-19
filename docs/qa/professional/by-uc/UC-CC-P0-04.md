# UC — `UC-CC-P0-04` · Ma trận phân quyền theo vai trò

| Meta | Value |
|------|--------|
| **uc_id** | `UC-CC-P0-04` |
| **stt_phase1** | 53 |
| **mod** | M00 |
| **name_vi** | Ma trận phân quyền theo vai trò |
| **actors** | Group CEO / Admin |
| **surfaces** | xbos-cc / api |
| **srs_old** | `docs/xbos/BANG_TONG_HOP_USECASE_XBOS.md` STT 53 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` #53 · matrix SRS Có |
| **srs_new** | N/A-DELTA · position-rbac |
| **tech_spec** | TECHSPEC_HE §8 · position-rbac |
| **api_contract** | GET/PUT `/api/xbos/position-rbac/*` (runtime flags) |
| **author** | ba-process · PO-UC-TC-W1-S2-XBOS-ORG-WF |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_IMPL` |
| **code_note** | position-rbac.controller; UF-XBOS-13 🟢. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. Squad **W1-S2-XBOS-ORG-WF**.

---

## 1. Mục tiêu UC (1 đoạn)

Bật/tắt quyền theo chức danh/vai trên ma trận Settings, Lưu sticky F5.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-RBAC | Ma trận position-rbac | CRUD flags | CEO |
| CAP-RBAC-CTRL | Chống escalate | AU | Hệ thống |

**Đếm nghiệp vụ:** 2

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-RBAC | FN-RBAC-OPEN | Mở ma trận | GET | N |
| CAP-RBAC | FN-RBAC-SAVE | Checkbox + Lưu | PUT | Y |
| CAP-RBAC-CTRL | FN-RBAC-AU | Member sửa ma trận tập đoàn | PUT | Y |

**Đếm chức năng:** 3

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-RBAC-OPEN | 1 | 0 | 0 | 0 | 1 | 2 |
| FN-RBAC-SAVE | 1 | 1 | 1 | 0 | 0 | 3 |
| FN-RBAC-AU | 0 | 1 | 0 | 1 | 0 | 2 |
| **Tổng** | 2 | 2 | 1 | 1 | 1 | **7** |

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-CC-P0-04-RBAC-OPEN-HP-001 | CAP-RBAC | FN-RBAC-OPEN | HP | P0 | ceo@xe.vn / Group CEO | login | 1. Settings → ma trận phân quyền | 200 grid | UI/API | UF-XBOS-13 |
| TC-CC-P0-04-RBAC-OPEN-UX-001 | CAP-RBAC | FN-RBAC-OPEN | UX | P1 | ceo@xe.vn / Group CEO | — | 1. Load chậm | loading | UI | UX |
| TC-CC-P0-04-RBAC-SAVE-HP-001 | CAP-RBAC | FN-RBAC-SAVE | HP | P0 | ceo@xe.vn / Group CEO | grid mở | 1. Đổi checkbox 2. Lưu 3. F5 | PUT 200 · sticky | UI/API | UF-XBOS-13 |
| TC-CC-P0-04-RBAC-SAVE-FD-001 | CAP-RBAC | FN-RBAC-SAVE | FD | P0 | ceo@xe.vn / Group CEO | grid | 1. PUT payload thiếu role/permission key | 4xx | API | FD |
| TC-CC-P0-04-RBAC-SAVE-BD-001 | CAP-RBAC | FN-RBAC-SAVE | BD | P2 | ceo@xe.vn / Group CEO | grid | 1. Bật tất cả / tắt tất cả | 200 deterministic | UI/API | BD |
| TC-CC-P0-04-RBAC-AU-AU-001 | CAP-RBAC-CTRL | FN-RBAC-AU | AU | P0 | du-lich.ceo@xe.vn / Member CEO | member | 1. PUT matrix holding | 403/409 | API | AU |
| TC-CC-P0-04-RBAC-AU-FD-001 | CAP-RBAC-CTRL | FN-RBAC-AU | FD | P1 | ceo@xe.vn / Group CEO | — | 1. Tự gán quyền vượt BR (nếu có) | reject hoặc audit | API | conflict |

---

## 6. Coverage check

| Check | Req | In design | GAP |
|-------|----------|-----------|-----|
| Mọi Cap có ≥1 FN | 2 | YES | — |
| Mọi FN mutate ≥1 HP + ≥1 FD | 2 | PARTIAL | — |
| Auth/scope nếu đa CT | required | YES | — |
| SPEC_GAP ghi rõ | — | none recorded | — |
| Self-approve FD (WF) | N/A | N/A | — |

---

## 7. FE / BE / Role (đánh giá thiết kế — chưa UAT)

| Layer | Finding | Evidence (path/#) |
|-------|---------|-------------------|
| BE API/DTO | Controller/service tồn tại cho position-rbac; response code theo OpenAPI/runtime. | apps/api/xbos-api/src/** · API_CONTRACT_VN.md |
| FE menu/nút/role | Portal CC / Settings — UF UF-XBOS-13; menu HDSD Command Center. | docs/qa/USER_FLOW_OPERABILITY_MATRIX.md · apps/web |
| Mobile (nếu có) | N/A — web/portal UC | — |
| RBAC / scope | JWT scope main vs member slug; 403/409 khi lệch scope. | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · scope-context |

**Verdict code_readiness:** `LIKELY_IMPL` — thiết kế only; không = UAT PASS.

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-CC-P0-04
cases_designed: 7
code_readiness: LIKELY_IMPL
work_item_id: PO-UC-TC-W1-S2-XBOS-ORG-WF
squad: W1-S2-XBOS-ORG-WF
uat_done: false
```
