# UC — `XBOS-DM-03` · Thêm giá trị danh mục

| Meta | Value |
|------|--------|
| **uc_id** | `XBOS-DM-03` |
| **stt_phase1** | 79 |
| **mod** | M01 |
| **name_vi** | Thêm giá trị danh mục |
| **actors** | Catalog admin |
| **surfaces** | xbos-cc / api |
| **srs_old** | `docs/xbos/BANG_TONG_HOP_USECASE_XBOS.md` STT 79 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` #79 · matrix SRS Có |
| **srs_new** | N/A-DELTA |
| **tech_spec** | catalog items create |
| **api_contract** | POST catalog items / business-master items |
| **author** | ba-process · PO-UC-TC-W1-S2-XBOS-ORG-WF |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_IMPL` |
| **code_note** | Items create paths trên config-sync/business-master; UF catalog related. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. Squad **W1-S2-XBOS-ORG-WF**.

---

## 1. Mục tiêu UC (1 đoạn)

Thêm giá trị (item) vào nhóm danh mục; validate mã; F5 còn.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-DM3 | Add catalog value | POST item | Admin |

**Đếm nghiệp vụ:** 1

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-DM3 | FN-DM3-ADD | Thêm giá trị | POST item | Y |
| CAP-DM3 | FN-DM3-LIST | List items | GET | N |

**Đếm chức năng:** 2

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-DM3-ADD | 1 | 1 | 1 | 1 | 0 | 4 |
| FN-DM3-LIST | 1 | 0 | 0 | 0 | 1 | 2 |
| **Tổng** | 2 | 1 | 1 | 1 | 1 | **6** |

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-DM-DM-03-DM3-ADD-HP-001 | CAP-DM3 | FN-DM3-ADD | HP | P0 | ceo@xe.vn / Group CEO | nhóm tồn tại | 1. Thêm mã/label 2. Lưu 3. F5 | 2xx · row | UI/API | DM-03 |
| TC-DM-DM-03-DM3-ADD-FD-001 | CAP-DM3 | FN-DM3-ADD | FD | P0 | ceo@xe.vn / Group CEO | — | 1. Thiếu mã / trùng mã | 4xx | API | FD |
| TC-DM-DM-03-DM3-ADD-BD-001 | CAP-DM3 | FN-DM3-ADD | BD | P1 | ceo@xe.vn / Group CEO | — | 1. Label max length | deterministic | API | BD |
| TC-DM-DM-03-DM3-ADD-AU-001 | CAP-DM3 | FN-DM3-ADD | AU | P0 | du-lich.ceo@xe.vn / Member CEO | member | 1. Thêm item catalog holding cấm | 403 hoặc chuyển governance approve | API | AU/gov |
| TC-DM-DM-03-DM3-LIST-HP-001 | CAP-DM3 | FN-DM3-LIST | HP | P0 | ceo@xe.vn / Group CEO | sau add | 1. List | thấy item · status_label nếu có | UI/API | list |
| TC-DM-DM-03-DM3-LIST-UX-001 | CAP-DM3 | FN-DM3-LIST | UX | P1 | ceo@xe.vn / Group CEO | 0 items | 1. List | empty | UI | empty |

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
| BE API/DTO | Controller/service tồn tại cho catalog items POST; response code theo OpenAPI/runtime. | apps/api/xbos-api/src/** · API_CONTRACT_VN.md |
| FE menu/nút/role | Portal CC / Settings — UF DM-03; menu HDSD Command Center. | docs/qa/USER_FLOW_OPERABILITY_MATRIX.md · apps/web |
| Mobile (nếu có) | N/A — web/portal UC | — |
| RBAC / scope | JWT scope main vs member slug; 403/409 khi lệch scope. | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · scope-context |

**Verdict code_readiness:** `LIKELY_IMPL` — thiết kế only; không = UAT PASS.

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: XBOS-DM-03
cases_designed: 6
code_readiness: LIKELY_IMPL
work_item_id: PO-UC-TC-W1-S2-XBOS-ORG-WF
squad: W1-S2-XBOS-ORG-WF
uat_done: false
```
