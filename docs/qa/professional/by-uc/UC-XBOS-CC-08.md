# UC — `UC-XBOS-CC-08` · Hệ thống phòng ban mẫu

| Meta | Value |
|------|--------|
| **uc_id** | `UC-XBOS-CC-08` |
| **stt_phase1** | 64 |
| **mod** | M01 |
| **name_vi** | Hệ thống phòng ban mẫu |
| **actors** | Group CEO |
| **surfaces** | xbos-cc / api |
| **srs_old** | `docs/xbos/BANG_TONG_HOP_USECASE_XBOS.md` STT 64 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` #64 · matrix SRS Có |
| **srs_new** | N/A-DELTA |
| **tech_spec** | TECHSPEC_HE · dept_system_templates |
| **api_contract** | GET/PUT business-master domain `dept_system_templates` |
| **author** | ba-process · PO-UC-TC-W1-S2-XBOS-ORG-WF |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_PARTIAL` |
| **code_note** | business-master dept_system_templates; org-foundation.spec UC-XBOS-CC-08. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. Squad **W1-S2-XBOS-ORG-WF**.

---

## 1. Mục tiêu UC (1 đoạn)

Quản lý mẫu phòng ban hệ thống để áp cho pháp nhân mới.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-CC08 | Dept templates | CRUD mẫu | CEO |

**Đếm nghiệp vụ:** 1

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-CC08 | FN-CC08-LIST | List templates | GET | N |
| CAP-CC08 | FN-CC08-SAVE | Lưu mẫu | PUT | Y |

**Đếm chức năng:** 2

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-CC08-LIST | 1 | 0 | 0 | 0 | 1 | 2 |
| FN-CC08-SAVE | 1 | 1 | 0 | 1 | 0 | 3 |
| **Tổng** | 2 | 1 | 0 | 1 | 1 | **5** |

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-DM-CC-08-CC08-LIST-HP-001 | CAP-CC08 | FN-CC08-LIST | HP | P0 | ceo@xe.vn / Group CEO | login | 1. Mở hệ thống PB mẫu | 200 | UI/API | CC-08 |
| TC-DM-CC-08-CC08-LIST-UX-001 | CAP-CC08 | FN-CC08-LIST | UX | P1 | ceo@xe.vn / Group CEO | 0 template | 1. List | empty | UI | empty |
| TC-DM-CC-08-CC08-SAVE-HP-001 | CAP-CC08 | FN-CC08-SAVE | HP | P0 | ceo@xe.vn / Group CEO | form | 1. Thêm/sửa mẫu 2. Lưu 3. F5 | 2xx sticky | UI/API | CC-08 |
| TC-DM-CC-08-CC08-SAVE-FD-001 | CAP-CC08 | FN-CC08-SAVE | FD | P0 | ceo@xe.vn / Group CEO | — | 1. Trùng mã mẫu | 4xx | API | FD |
| TC-DM-CC-08-CC08-SAVE-AU-001 | CAP-CC08 | FN-CC08-SAVE | AU | P0 | du-lich.ceo@xe.vn / Member CEO | member | 1. Mutate template tập đoàn | 403/409 | API | AU |

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
| BE API/DTO | Controller/service tồn tại cho dept_system_templates; response code theo OpenAPI/runtime. | apps/api/xbos-api/src/** · API_CONTRACT_VN.md |
| FE menu/nút/role | Portal CC / Settings — UF CC-08; menu HDSD Command Center. | docs/qa/USER_FLOW_OPERABILITY_MATRIX.md · apps/web |
| Mobile (nếu có) | N/A — web/portal UC | — |
| RBAC / scope | JWT scope main vs member slug; 403/409 khi lệch scope. | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · scope-context |

**Verdict code_readiness:** `LIKELY_PARTIAL` — thiết kế only; không = UAT PASS.

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-XBOS-CC-08
cases_designed: 5
code_readiness: LIKELY_PARTIAL
work_item_id: PO-UC-TC-W1-S2-XBOS-ORG-WF
squad: W1-S2-XBOS-ORG-WF
uat_done: false
```
