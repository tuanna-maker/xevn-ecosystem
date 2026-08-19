# UC — `XBOS-DM-04` · Sửa giá trị danh mục

| Meta | Value |
|------|--------|
| **uc_id** | `XBOS-DM-04` |
| **stt_phase1** | 80 |
| **mod** | M01 |
| **name_vi** | Sửa giá trị danh mục |
| **actors** | Catalog admin |
| **surfaces** | xbos-cc / api |
| **srs_old** | `docs/xbos/BANG_TONG_HOP_USECASE_XBOS.md` STT 80 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` #80 · matrix SRS Có |
| **srs_new** | N/A-DELTA |
| **tech_spec** | catalog items update |
| **api_contract** | PUT/PATCH catalog item |
| **author** | ba-process · PO-UC-TC-W1-S2-XBOS-ORG-WF |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_IMPL` |
| **code_note** | Update item; nhạy cảm có thể yêu cầu approve (DM-12) — FD ghi rõ. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. Squad **W1-S2-XBOS-ORG-WF**.

---

## 1. Mục tiêu UC (1 đoạn)

Sửa giá trị danh mục; F5 sticky; item nhạy cảm có thể khóa/WF.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-DM4 | Edit catalog value | PUT item | Admin |

**Đếm nghiệp vụ:** 1

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-DM4 | FN-DM4-EDIT | Sửa giá trị | PUT | Y |
| CAP-DM4 | FN-DM4-SENS | Sửa nhạy cảm → WF | PUT/submit | Y |

**Đếm chức năng:** 2

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-DM4-EDIT | 1 | 1 | 1 | 1 | 1 | 5 |
| FN-DM4-SENS | 1 | 1 | 0 | 0 | 0 | 2 |
| **Tổng** | 2 | 2 | 1 | 1 | 1 | **7** |

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-DM-DM-04-DM4-EDIT-HP-001 | CAP-DM4 | FN-DM4-EDIT | HP | P0 | ceo@xe.vn / Group CEO | item từ FE | 1. Sửa label 2. Lưu 3. F5 | 2xx sticky | UI/API | DM-04 |
| TC-DM-DM-04-DM4-EDIT-FD-001 | CAP-DM4 | FN-DM4-EDIT | FD | P0 | ceo@xe.vn / Group CEO | — | 1. PUT id lạ | 404 | API | FD |
| TC-DM-DM-04-DM4-EDIT-AU-001 | CAP-DM4 | FN-DM4-EDIT | AU | P0 | du-lich.ceo@xe.vn / Member CEO | member | 1. Sửa item holding | 403 | API | AU |
| TC-DM-DM-04-DM4-SENS-HP-001 | CAP-DM4 | FN-DM4-SENS | HP | P1 | ceo@xe.vn / Group CEO | item sensitive | 1. Sửa → gửi duyệt nếu bắt buộc | spawn WF hoặc 2xx theo BR | UI/API | DM-12 link |
| TC-DM-DM-04-DM4-SENS-FD-001 | CAP-DM4 | FN-DM4-SENS | FD | P0 | ceo@xe.vn / Group CEO | item locked WF | 1. Sửa trực tiếp | 4xx locked | API | FD lock |
| TC-DM-DM-04-DM4-EDIT-BD-001 | CAP-DM4 | FN-DM4-EDIT | BD | P2 | ceo@xe.vn / Group CEO | — | 1. Đổi mã khi đã publish | cấm hoặc version mới | API | BD |
| TC-DM-DM-04-DM4-EDIT-UX-001 | CAP-DM4 | FN-DM4-EDIT | UX | P1 | ceo@xe.vn / Group CEO | sau save | 1. UI | toast · không overlay | UI | UX |

---

## 6. Coverage check

| Check | Req | In design | GAP |
|-------|----------|-----------|-----|
| Mọi Cap có ≥1 FN | 1 | YES | — |
| Mọi FN mutate ≥1 HP + ≥1 FD | 2 | YES | — |
| Auth/scope nếu đa CT | required | YES | — |
| SPEC_GAP ghi rõ | — | none recorded | — |
| Self-approve FD (WF) | YES | CHECK | — |

---

## 7. FE / BE / Role (đánh giá thiết kế — chưa UAT)

| Layer | Finding | Evidence (path/#) |
|-------|---------|-------------------|
| BE API/DTO | Controller/service tồn tại cho catalog items PUT; response code theo OpenAPI/runtime. | apps/api/xbos-api/src/** · API_CONTRACT_VN.md |
| FE menu/nút/role | Portal CC / Settings — UF DM-04; menu HDSD Command Center. | docs/qa/USER_FLOW_OPERABILITY_MATRIX.md · apps/web |
| Mobile (nếu có) | N/A — web/portal UC | — |
| RBAC / scope | JWT scope main vs member slug; 403/409 khi lệch scope. | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · scope-context |

**Verdict code_readiness:** `LIKELY_IMPL` — thiết kế only; không = UAT PASS.

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: XBOS-DM-04
cases_designed: 7
code_readiness: LIKELY_IMPL
work_item_id: PO-UC-TC-W1-S2-XBOS-ORG-WF
squad: W1-S2-XBOS-ORG-WF
uat_done: false
```
