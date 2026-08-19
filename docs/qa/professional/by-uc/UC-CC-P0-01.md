# UC — `UC-CC-P0-01` · Quản lý cổ đông theo pháp nhân

| Meta | Value |
|------|--------|
| **uc_id** | `UC-CC-P0-01` |
| **stt_phase1** | 50 |
| **mod** | M00 |
| **name_vi** | Quản lý cổ đông theo pháp nhân |
| **actors** | Group CEO |
| **surfaces** | xbos-cc / api |
| **srs_old** | `docs/xbos/BANG_TONG_HOP_USECASE_XBOS.md` STT 50 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` #50 · matrix SRS Có |
| **srs_new** | N/A-DELTA · holding/member shareholders (UF-XBOS-04/05) |
| **tech_spec** | TECHSPEC_HE §8 · legal-entity-profile shareholders |
| **api_contract** | GET/POST/PUT/DELETE `/api/xbos/org-foundation/legal-entities/:entityId/shareholders` · `XBOS-SHR-201` (runtime) |
| **author** | ba-process · PO-UC-TC-W1-S2-XBOS-ORG-WF |
| **design_status** | DESIGNED |
| **execution** | **PARTIAL** · W4-E1 2026-08-04 · LIST/ADD HP+FD+AU PASS · VAL-% FD spot PARTIAL · evidence `po-uc-tc-w4-qa-e1-xbos-rollup.md` · `uat_done: false` |
| **code_readiness** | `LIKELY_IMPL` |
| **code_note** | legal-entity-profile.controller shareholders CRUD; UF-XBOS-05 holding 🟢 reference. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. Squad **W1-S2-XBOS-ORG-WF**.

---

## 1. Mục tiêu UC (1 đoạn)

Thêm/sửa/xóa cổ đông trên pháp nhân (holding hoặc member) với validate vốn/%, FE sau 2xx + F5.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-SHR-R | Xem danh sách cổ đông | List theo LE | CEO |
| CAP-SHR-C | Thêm cổ đông | POST | CEO |
| CAP-SHR-U | Sửa cổ đông | PUT | CEO |
| CAP-SHR-D | Xóa cổ đông | DELETE soft/hard theo policy | CEO |
| CAP-SHR-CTRL | Scope & validate | AU/FD | Hệ thống |

**Đếm nghiệp vụ:** 5

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-SHR-R | FN-SHR-LIST | List shareholders | GET …/shareholders | N |
| CAP-SHR-C | FN-SHR-ADD | Thêm + Lưu | POST …/shareholders | Y |
| CAP-SHR-U | FN-SHR-EDIT | Sửa + Lưu | PUT …/shareholders/:id | Y |
| CAP-SHR-D | FN-SHR-DEL | Xóa | DELETE …/shareholders/:id | Y |
| CAP-SHR-CTRL | FN-SHR-SCOPE | Member ngoài CT | mutate | Y |
| CAP-SHR-CTRL | FN-SHR-VAL | Validate %/MST | POST | Y |

**Đếm chức năng:** 6

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-SHR-LIST | 1 | 0 | 0 | 0 | 1 | 2 |
| FN-SHR-ADD | 1 | 1 | 1 | 0 | 0 | 3 |
| FN-SHR-EDIT | 1 | 1 | 0 | 0 | 0 | 2 |
| FN-SHR-DEL | 1 | 1 | 0 | 0 | 0 | 2 |
| FN-SHR-SCOPE | 0 | 0 | 0 | 1 | 0 | 1 |
| FN-SHR-VAL | 0 | 1 | 1 | 0 | 0 | 2 |
| **Tổng** | 4 | 4 | 2 | 1 | 1 | **12** |

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-CC-P0-01-SHR-LIST-HP-001 | CAP-SHR-R | FN-SHR-LIST | HP | P0 | ceo@xe.vn / Group CEO | mở LE holding hoặc member | 1. Tab Cổ đông | 200 list · VI | UI/API | UF-XBOS-05 |
| TC-CC-P0-01-SHR-LIST-UX-001 | CAP-SHR-R | FN-SHR-LIST | UX | P1 | ceo@xe.vn / Group CEO | LE mới 0 cổ đông | 1. Mở tab | empty hợp lệ | UI | empty |
| TC-CC-P0-01-SHR-ADD-HP-001 | CAP-SHR-C | FN-SHR-ADD | HP | P0 | ceo@xe.vn / Group CEO | TẬP ĐOÀN hoặc member detail | 1. + Thêm cổ đông 2. Điền tên/%/góp vốn vi-VN 3. Lưu | 201 · row · F5 còn (UF-XBOS-05) | UI/API | UF-XBOS-05 · XBOS-SHR-201 |
| TC-CC-P0-01-SHR-ADD-FD-001 | CAP-SHR-C | FN-SHR-ADD | FD | P0 | ceo@xe.vn / Group CEO | form mở | 1. Lưu thiếu tên hoặc % âm | 4xx/FE block · không row ảo | UI/API | FD |
| TC-CC-P0-01-SHR-ADD-BD-001 | CAP-SHR-C | FN-SHR-ADD | BD | P1 | ceo@xe.vn / Group CEO | form | 1. % = 0 và % = 100 | deterministic theo BR vốn | UI/API | BD % |
| TC-CC-P0-01-SHR-EDIT-HP-001 | CAP-SHR-U | FN-SHR-EDIT | HP | P0 | ceo@xe.vn / Group CEO | có row từ FE | 1. Sửa % 2. Lưu 3. F5 | 200 · sticky | UI/API | PUT |
| TC-CC-P0-01-SHR-EDIT-FD-001 | CAP-SHR-U | FN-SHR-EDIT | FD | P1 | ceo@xe.vn / Group CEO | row | 1. PUT id lạ | 404 | API | 404 |
| TC-CC-P0-01-SHR-DEL-HP-001 | CAP-SHR-D | FN-SHR-DEL | HP | P1 | ceo@xe.vn / Group CEO | row test | 1. Xóa + confirm | 2xx · biến khỏi list · F5 | UI/API | DELETE |
| TC-CC-P0-01-SHR-DEL-FD-001 | CAP-SHR-D | FN-SHR-DEL | FD | P1 | ceo@xe.vn / Group CEO | đã xóa | 1. Xóa lại | 404/no-op | API | idempotent |
| TC-CC-P0-01-SHR-SCOPE-AU-001 | CAP-SHR-CTRL | FN-SHR-SCOPE | AU | P0 | du-lich.ceo@xe.vn / Member CEO | login member | 1. POST shareholder holding | 403/409 | API | AU |
| TC-CC-P0-01-SHR-VAL-FD-001 | CAP-SHR-CTRL | FN-SHR-VAL | FD | P0 | ceo@xe.vn / Group CEO | form | 1. Tổng % > 100 nếu BR cấm | 4xx/banner | UI/API | BR vốn |
| TC-CC-P0-01-SHR-VAL-BD-001 | CAP-SHR-CTRL | FN-SHR-VAL | BD | P2 | ceo@xe.vn / Group CEO | form | 1. Số tiền góp có grouping vi-VN | parse đúng number API | UI | U72 money |

---

## 6. Coverage check

| Check | Req | In design | GAP |
|-------|----------|-----------|-----|
| Mọi Cap có ≥1 FN | 5 | YES | — |
| Mọi FN mutate ≥1 HP + ≥1 FD | 5 | PARTIAL | — |
| Auth/scope nếu đa CT | required | YES | — |
| SPEC_GAP ghi rõ | — | none recorded | — |
| Self-approve FD (WF) | N/A | N/A | — |

---

## 7. FE / BE / Role (đánh giá thiết kế — chưa UAT)

| Layer | Finding | Evidence (path/#) |
|-------|---------|-------------------|
| BE API/DTO | Controller/service tồn tại cho …/shareholders; response code theo OpenAPI/runtime. | apps/api/xbos-api/src/** · API_CONTRACT_VN.md |
| FE menu/nút/role | Portal CC / Settings — UF UF-XBOS-04/05; menu HDSD Command Center. | docs/qa/USER_FLOW_OPERABILITY_MATRIX.md · apps/web |
| Mobile (nếu có) | N/A — web/portal UC | — |
| RBAC / scope | JWT scope main vs member slug; 403/409 khi lệch scope. | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · scope-context |

**Verdict code_readiness:** `LIKELY_IMPL` — thiết kế only; không = UAT PASS.

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-CC-P0-01
cases_designed: 12
code_readiness: LIKELY_IMPL
work_item_id: PO-UC-TC-W1-S2-XBOS-ORG-WF
squad: W1-S2-XBOS-ORG-WF
uat_done: false
```
