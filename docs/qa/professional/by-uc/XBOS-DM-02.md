# UC — `XBOS-DM-02` · Tạo nhóm danh mục

| Meta | Value |
|------|--------|
| **uc_id** | `XBOS-DM-02` |
| **stt_phase1** | 78 |
| **mod** | M01 |
| **name_vi** | Tạo nhóm danh mục |
| **actors** | Catalog admin |
| **surfaces** | xbos-cc / api |
| **srs_old** | `docs/xbos/BANG_TONG_HOP_USECASE_XBOS.md` STT 78 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` #78 · matrix SRS Có |
| **srs_new** | N/A-DELTA |
| **tech_spec** | catalog group create |
| **api_contract** | POST catalog group (business-master / config-sync pattern) |
| **author** | ba-process · PO-UC-TC-W1-S2-XBOS-ORG-WF |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_PARTIAL` |
| **code_note** | Tạo nhóm — một phần pattern; verify endpoint cụ thể trước UAT. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. Squad **W1-S2-XBOS-ORG-WF**.

---

## 1. Mục tiêu UC (1 đoạn)

Tạo nhóm danh mục mới với mã/tên hợp lệ, F5 còn.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-DM2 | Create catalog group | POST group | Admin |

**Đếm nghiệp vụ:** 1

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-DM2 | FN-DM2-ADD | Tạo nhóm | POST | Y |
| CAP-DM2 | FN-DM2-LIST | Thấy nhóm sau tạo | GET | N |

**Đếm chức năng:** 2

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-DM2-ADD | 1 | 1 | 1 | 1 | 0 | 4 |
| FN-DM2-LIST | 1 | 0 | 0 | 0 | 1 | 2 |
| **Tổng** | 2 | 1 | 1 | 1 | 1 | **6** |

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-DM-DM-02-DM2-ADD-HP-001 | CAP-DM2 | FN-DM2-ADD | HP | P0 | ceo@xe.vn / Group CEO | overview mở | 1. Tạo nhóm mã/tên 2. Lưu | 2xx · F5 còn | UI/API | DM-02 |
| TC-DM-DM-02-DM2-ADD-FD-001 | CAP-DM2 | FN-DM2-ADD | FD | P0 | ceo@xe.vn / Group CEO | — | 1. Trùng mã nhóm | 409/4xx | API | FD |
| TC-DM-DM-02-DM2-ADD-BD-001 | CAP-DM2 | FN-DM2-ADD | BD | P1 | ceo@xe.vn / Group CEO | — | 1. Mã biên độ dài | deterministic | API | BD |
| TC-DM-DM-02-DM2-ADD-AU-001 | CAP-DM2 | FN-DM2-ADD | AU | P0 | du-lich.ceo@xe.vn / Member CEO | member | 1. Tạo nhóm tập đoàn | 403 | API | AU |
| TC-DM-DM-02-DM2-LIST-HP-001 | CAP-DM2 | FN-DM2-LIST | HP | P0 | ceo@xe.vn / Group CEO | sau HP create | 1. Overview | nhóm xuất hiện | UI | list |
| TC-DM-DM-02-DM2-LIST-UX-001 | CAP-DM2 | FN-DM2-LIST | UX | P1 | ceo@xe.vn / Group CEO | — | 1. Search nhóm | filter OK | UI | UX |

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
| BE API/DTO | Controller/service tồn tại cho catalog group create; response code theo OpenAPI/runtime. | apps/api/xbos-api/src/** · API_CONTRACT_VN.md |
| FE menu/nút/role | Portal CC / Settings — UF DM-02; menu HDSD Command Center. | docs/qa/USER_FLOW_OPERABILITY_MATRIX.md · apps/web |
| Mobile (nếu có) | N/A — web/portal UC | — |
| RBAC / scope | JWT scope main vs member slug; 403/409 khi lệch scope. | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · scope-context |

**Verdict code_readiness:** `LIKELY_PARTIAL` — thiết kế only; không = UAT PASS.

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: XBOS-DM-02
cases_designed: 6
code_readiness: LIKELY_PARTIAL
work_item_id: PO-UC-TC-W1-S2-XBOS-ORG-WF
squad: W1-S2-XBOS-ORG-WF
uat_done: false
```
