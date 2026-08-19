# UC — `UC-CC-P0-02` · Quản lý tài liệu pháp lý và tải / xem file

| Meta | Value |
|------|--------|
| **uc_id** | `UC-CC-P0-02` |
| **stt_phase1** | 51 |
| **mod** | M00 |
| **name_vi** | Quản lý tài liệu pháp lý và tải / xem file |
| **actors** | Group CEO |
| **surfaces** | xbos-cc / api |
| **srs_old** | `docs/xbos/BANG_TONG_HOP_USECASE_XBOS.md` STT 51 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` #51 · matrix SRS Có |
| **srs_new** | N/A-DELTA |
| **tech_spec** | TECHSPEC_HE §8 · documents upload |
| **api_contract** | POST/GET `/api/xbos/org-foundation/legal-entities/:id/documents` · upload · GET `/legal-documents/:id/file` |
| **author** | ba-process · PO-UC-TC-W1-S2-XBOS-ORG-WF |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_IMPL` |
| **code_note** | documents + upload + file GET; UF-XBOS-06 reference. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. Squad **W1-S2-XBOS-ORG-WF**.

---

## 1. Mục tiêu UC (1 đoạn)

Thêm tài liệu pháp lý, upload file, xem file 200, F5 còn metadata.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-DOC | CRUD tài liệu | metadata + file | CEO |

**Đếm nghiệp vụ:** 1

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-DOC | FN-DOC-LIST | List docs | GET documents | N |
| CAP-DOC | FN-DOC-ADD | Thêm + upload | POST + upload | Y |
| CAP-DOC | FN-DOC-VIEW | Xem file | GET …/file | N |
| CAP-DOC | FN-DOC-DEL | Xóa doc | DELETE | Y |

**Đếm chức năng:** 4

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-DOC-LIST | 1 | 0 | 0 | 0 | 1 | 2 |
| FN-DOC-ADD | 1 | 1 | 0 | 0 | 0 | 2 |
| FN-DOC-VIEW | 1 | 0 | 0 | 1 | 0 | 2 |
| FN-DOC-DEL | 1 | 1 | 0 | 0 | 0 | 2 |
| **Tổng** | 4 | 2 | 0 | 1 | 1 | **8** |

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-CC-P0-02-DOC-LIST-HP-001 | CAP-DOC | FN-DOC-LIST | HP | P0 | ceo@xe.vn / Group CEO | LE mở | 1. Tab tài liệu | 200 list | UI/API | P0-02 |
| TC-CC-P0-02-DOC-LIST-UX-001 | CAP-DOC | FN-DOC-LIST | UX | P1 | ceo@xe.vn / Group CEO | 0 docs | 1. Mở tab | empty | UI | empty |
| TC-CC-P0-02-DOC-ADD-HP-001 | CAP-DOC | FN-DOC-ADD | HP | P0 | ceo@xe.vn / Group CEO | LE | 1. + Thêm 2. upload file hợp lệ 3. Lưu | 2xx · F5 còn · UF-XBOS-06 | UI/API | UF-XBOS-06 |
| TC-CC-P0-02-DOC-ADD-FD-001 | CAP-DOC | FN-DOC-ADD | FD | P0 | ceo@xe.vn / Group CEO | form | 1. upload loại file cấm / quá size | 4xx · không metadata mồ côi | API | FD mime |
| TC-CC-P0-02-DOC-VIEW-HP-001 | CAP-DOC | FN-DOC-VIEW | HP | P0 | ceo@xe.vn / Group CEO | đã upload | 1. Xem file | GET file **200** | UI/API | file 200 |
| TC-CC-P0-02-DOC-VIEW-AU-001 | CAP-DOC | FN-DOC-VIEW | AU | P0 | du-lich.ceo@xe.vn / Member CEO | doc holding | 1. GET file | 403/404 | API | AU |
| TC-CC-P0-02-DOC-DEL-HP-001 | CAP-DOC | FN-DOC-DEL | HP | P1 | ceo@xe.vn / Group CEO | doc test | 1. Xóa | 2xx · F5 hết | UI/API | DEL |
| TC-CC-P0-02-DOC-DEL-FD-001 | CAP-DOC | FN-DOC-DEL | FD | P1 | ceo@xe.vn / Group CEO | id lạ | 1. DELETE | 404 | API | 404 |

---

## 6. Coverage check

| Check | Req | In design | GAP |
|-------|----------|-----------|-----|
| Mọi Cap có ≥1 FN | 1 | YES | — |
| Mọi FN mutate ≥1 HP + ≥1 FD | 2 | YES | — |
| Auth/scope nếu đa CT | required | YES | — |
| SPEC_GAP ghi rõ | — | none recorded | — |
| Self-approve FD (WF) | N/A | N/A | — |

---

## 7. FE / BE / Role (đánh giá thiết kế — chưa UAT)

| Layer | Finding | Evidence (path/#) |
|-------|---------|-------------------|
| BE API/DTO | Controller/service tồn tại cho documents/upload; response code theo OpenAPI/runtime. | apps/api/xbos-api/src/** · API_CONTRACT_VN.md |
| FE menu/nút/role | Portal CC / Settings — UF UF-XBOS-06; menu HDSD Command Center. | docs/qa/USER_FLOW_OPERABILITY_MATRIX.md · apps/web |
| Mobile (nếu có) | N/A — web/portal UC | — |
| RBAC / scope | JWT scope main vs member slug; 403/409 khi lệch scope. | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · scope-context |

**Verdict code_readiness:** `LIKELY_IMPL` — thiết kế only; không = UAT PASS.

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-CC-P0-02
cases_designed: 8
code_readiness: LIKELY_IMPL
work_item_id: PO-UC-TC-W1-S2-XBOS-ORG-WF
squad: W1-S2-XBOS-ORG-WF
uat_done: false
```
