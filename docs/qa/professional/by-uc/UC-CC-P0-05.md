# UC — `UC-CC-P0-05` · Danh mục văn bản / đo lường / giá (Command Center)

| Meta | Value |
|------|--------|
| **uc_id** | `UC-CC-P0-05` |
| **stt_phase1** | 54 |
| **mod** | M00 |
| **name_vi** | Danh mục văn bản / đo lường / giá (Command Center) |
| **actors** | Group CEO |
| **surfaces** | xbos-cc / api |
| **srs_old** | `docs/xbos/BANG_TONG_HOP_USECASE_XBOS.md` STT 54 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` #54 · matrix SRS Có |
| **srs_new** | N/A-DELTA · command_center_catalogs |
| **tech_spec** | TECHSPEC_HE §8 · business-master |
| **api_contract** | GET/PUT `/api/xbos/business-master/command_center_catalogs/items*` |
| **author** | ba-process · PO-UC-TC-W1-S2-XBOS-ORG-WF |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_IMPL` |
| **code_note** | business-master domain command_center_catalogs; UF-XBOS-14. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. Squad **W1-S2-XBOS-ORG-WF**.

---

## 1. Mục tiêu UC (1 đoạn)

Xem và autosave danh mục CC (regulations|measurements|pricing) theo partition holding.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-CCC | Catalog CC | list+autosave | CEO |

**Đếm nghiệp vụ:** 1

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-CCC | FN-CCC-LIST | List kinds | GET items | N |
| CAP-CCC | FN-CCC-SAVE | Autosave item | PUT | Y |

**Đếm chức năng:** 2

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-CCC-LIST | 1 | 0 | 0 | 0 | 1 | 2 |
| FN-CCC-SAVE | 1 | 1 | 1 | 1 | 0 | 4 |
| **Tổng** | 2 | 1 | 1 | 1 | 1 | **6** |

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-CC-P0-05-CCC-LIST-HP-001 | CAP-CCC | FN-CCC-LIST | HP | P0 | ceo@xe.vn / Group CEO | login main | 1. Mở catalog CC | 200 holding | UI/API | UF-XBOS-14 |
| TC-CC-P0-05-CCC-LIST-UX-001 | CAP-CCC | FN-CCC-LIST | UX | P1 | ceo@xe.vn / Group CEO | empty kind | 1. Mở | empty/template | UI | empty |
| TC-CC-P0-05-CCC-SAVE-HP-001 | CAP-CCC | FN-CCC-SAVE | HP | P0 | ceo@xe.vn / Group CEO | list mở | 1. Sửa giá trị 2. Autosave 3. F5 | PUT 200 · version sticky | UI/API | UF-XBOS-14 |
| TC-CC-P0-05-CCC-SAVE-FD-001 | CAP-CCC | FN-CCC-SAVE | FD | P0 | ceo@xe.vn / Group CEO | — | 1. PUT kind không thuộc allow-list | 4xx | API | FD |
| TC-CC-P0-05-CCC-SAVE-AU-001 | CAP-CCC | FN-CCC-SAVE | AU | P0 | du-lich.ceo@xe.vn / Member CEO | member | 1. PUT holding catalogs | 403/409 | API | AU |
| TC-CC-P0-05-CCC-SAVE-BD-001 | CAP-CCC | FN-CCC-SAVE | BD | P2 | ceo@xe.vn / Group CEO | — | 1. Chuỗi rất dài | 4xx/truncate policy | API | BD |

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
| BE API/DTO | Controller/service tồn tại cho business-master/command_center_catalogs; response code theo OpenAPI/runtime. | apps/api/xbos-api/src/** · API_CONTRACT_VN.md |
| FE menu/nút/role | Portal CC / Settings — UF UF-XBOS-14; menu HDSD Command Center. | docs/qa/USER_FLOW_OPERABILITY_MATRIX.md · apps/web |
| Mobile (nếu có) | N/A — web/portal UC | — |
| RBAC / scope | JWT scope main vs member slug; 403/409 khi lệch scope. | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · scope-context |

**Verdict code_readiness:** `LIKELY_IMPL` — thiết kế only; không = UAT PASS.

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-CC-P0-05
cases_designed: 6
code_readiness: LIKELY_IMPL
work_item_id: PO-UC-TC-W1-S2-XBOS-ORG-WF
squad: W1-S2-XBOS-ORG-WF
uat_done: false
```
