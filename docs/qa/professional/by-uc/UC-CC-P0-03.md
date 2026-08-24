# UC — `UC-CC-P0-03` · Lưu và xóa phòng ban

| Meta | Value |
|------|--------|
| **uc_id** | `UC-CC-P0-03` |
| **stt_phase1** | 52 |
| **mod** | M00 |
| **name_vi** | Lưu và xóa phòng ban |
| **actors** | Group CEO |
| **surfaces** | xbos-cc / api |
| **srs_old** | `docs/xbos/BANG_TONG_HOP_USECASE_XBOS.md` STT 52 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` #52 · matrix SRS Có |
| **srs_new** | N/A-DELTA · org-units |
| **tech_spec** | TECHSPEC_HE §8 · org-units |
| **api_contract** | POST/PUT/DELETE `/api/xbos/org-foundation/org-units` · tree GET |
| **author** | ba-process · PO-UC-TC-W1-S2-XBOS-ORG-WF |
| **design_status** | DESIGNED |
| **execution** | **UI_PASS (FD+HP ADD)** · W4-QA-DEPT-VAL-RET-01 2026-08-04 · empty Lưu → POST **400** `XBOS-VAL-014`; valid → **201** `XBOS-ORG-201` + F5 · residual `R-W4E1-DEPT-EMPTY-201` CLOSED · `uat_done: false` (full UC not claimed) |
| **code_readiness** | `LIKELY_IMPL` |
| **code_note** | Browser evidenced: FE blank posts empty; BE `XBOS-VAL-014`. Evidence `po-uc-tc-w4-qa-dept-val-ret-01.md` · prior fix `po-uc-tc-w4-dev-be-dept-val-01.md`. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. Squad **W1-S2-XBOS-ORG-WF**.

---

## 1. Mục tiêu UC (1 đoạn)

Thêm/sửa/xóa phòng ban (org-unit) theo pháp nhân, tree cập nhật sau F5. Giao diện dạng grid với các cột Mã, Tên, Đơn vị cấp trên, Trạng thái.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-DEPT | CRUD phòng ban | org-units | CEO |

**Đếm nghiệp vụ:** 1

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-DEPT | FN-DEPT-TREE | Xem tree | GET org-units/tree | N |
| CAP-DEPT | FN-DEPT-ADD | Thêm PB | POST org-units | Y |
| CAP-DEPT | FN-DEPT-EDIT | Sửa PB | PUT | Y |
| CAP-DEPT | FN-DEPT-DEL | Xóa PB | DELETE | Y |

**Đếm chức năng:** 4

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-DEPT-TREE | 1 | 0 | 0 | 0 | 1 | 2 |
| FN-DEPT-ADD | 1 | 1 | 1 | 1 | 0 | 4 |
| FN-DEPT-EDIT | 1 | 1 | 0 | 0 | 0 | 2 |
| FN-DEPT-DEL | 1 | 1 | 0 | 0 | 0 | 2 |
| **Tổng** | 4 | 3 | 1 | 1 | 1 | **10** |

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-CC-P0-03-DEPT-TREE-HP-001 | CAP-DEPT | FN-DEPT-TREE | HP | P0 | ceo@xe.vn / Group CEO | chọn LE | 1. Mở phòng ban | 200 tree | UI/API | UF-XBOS-12 |
| TC-CC-P0-03-DEPT-TREE-UX-001 | CAP-DEPT | FN-DEPT-TREE | UX | P1 | ceo@xe.vn / Group CEO | LE mới | 1. Tree | empty/root only | UI | empty |
| TC-CC-P0-03-DEPT-ADD-HP-001 | CAP-DEPT | FN-DEPT-ADD | HP | P0 | ceo@xe.vn / Group CEO | LE | 1. Thêm tên/mã 2. Lưu | 201 · F5 còn | UI/API | UF-XBOS-12 |
| TC-CC-P0-03-DEPT-ADD-FD-001 | CAP-DEPT | FN-DEPT-ADD | FD | P0 | ceo@xe.vn / Group CEO | form | 1. Trùng mã / thiếu tên | 4xx | API | FD |
| TC-CC-P0-03-DEPT-EDIT-HP-001 | CAP-DEPT | FN-DEPT-EDIT | HP | P0 | ceo@xe.vn / Group CEO | PB tồn tại | 1. Sửa tên 2. Lưu 3. F5 | 200 sticky | UI/API | PUT |
| TC-CC-P0-03-DEPT-EDIT-FD-001 | CAP-DEPT | FN-DEPT-EDIT | FD | P1 | ceo@xe.vn / Group CEO | — | 1. PUT id lạ | 404 | API | 404 |
| TC-CC-P0-03-DEPT-DEL-HP-001 | CAP-DEPT | FN-DEPT-DEL | HP | P0 | ceo@xe.vn / Group CEO | PB không con / policy cho xóa | 1. Xóa | 2xx · khỏi tree F5 | UI/API | DEL |
| TC-CC-P0-03-DEPT-DEL-FD-001 | CAP-DEPT | FN-DEPT-DEL | FD | P0 | ceo@xe.vn / Group CEO | PB có con | 1. Xóa | 4xx conflict honest | API | FK |
| TC-CC-P0-03-DEPT-ADD-AU-001 | CAP-DEPT | FN-DEPT-ADD | AU | P0 | du-lich.ceo@xe.vn / Member CEO | member | 1. POST org-unit LE khác | 403/409 | API | AU |
| TC-CC-P0-03-DEPT-ADD-BD-001 | CAP-DEPT | FN-DEPT-ADD | BD | P2 | ceo@xe.vn / Group CEO | form | 1. Tên dài max | accept/4xx deterministic | API | BD |

---

## 6. Coverage check

| Check | Req | In design | GAP |
|-------|----------|-----------|-----|
| Mọi Cap có ≥1 FN | 1 | YES | — |
| Mọi FN mutate ≥1 HP + ≥1 FD | 3 | YES | — |
| Auth/scope nếu đa CT | required | YES | — |
| SPEC_GAP ghi rõ | — | none recorded | — |
| Self-approve FD (WF) | N/A | N/A | — |

---

## 7. FE / BE / Role (đánh giá thiết kế — chưa UAT)

| Layer | Finding | Evidence (path/#) |
|-------|---------|-------------------|
| BE API/DTO | Controller/service tồn tại cho org-units; response code theo OpenAPI/runtime. | apps/api/xbos-api/src/** · API_CONTRACT_VN.md |
| FE menu/nút/role | Portal CC / Settings — UF UF-XBOS-12; menu HDSD Command Center. | docs/qa/USER_FLOW_OPERABILITY_MATRIX.md · apps/web |
| Mobile (nếu có) | N/A — web/portal UC | — |
| RBAC / scope | JWT scope main vs member slug; 403/409 khi lệch scope. | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · scope-context |

**Verdict code_readiness:** `LIKELY_IMPL` — thiết kế only; không = UAT PASS.

---

## 8. Handoff

```
ack_status: PASS_TO_PM
uc_id: UC-CC-P0-03
cases_designed: 10
code_readiness: LIKELY_IMPL
work_item_id: PO-UC-TC-W4-QA-DEPT-VAL-RET-01
execution_note: FD-ADD + HP-ADD browser PASS 2026-08-04; full UC EDIT/DEL/AU not re-claimed this WI
uat_done: false
```
