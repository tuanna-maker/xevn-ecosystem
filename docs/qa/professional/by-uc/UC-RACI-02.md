# UC — `UC-RACI-02` · Xem và chỉnh ma trận RACI tại chi tiết pháp nhân

| Meta | Value |
|------|--------|
| **uc_id** | `UC-RACI-02` |
| **stt_phase1** | 66 |
| **mod** | M00 |
| **name_vi** | Xem và chỉnh ma trận RACI tại chi tiết pháp nhân |
| **actors** | Group CEO |
| **surfaces** | xbos-cc / api |
| **srs_old** | `docs/xbos/BANG_TONG_HOP_USECASE_XBOS.md` STT 66 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` #66 · matrix SRS Có |
| **srs_new** | N/A-DELTA |
| **tech_spec** | raci matrix cell upsert |
| **api_contract** | GET `/raci-governance/companies/:companyId/matrix` · PUT `…/matrix/cell` `XBOS-RACI-201` |
| **author** | ba-process · PO-UC-TC-W1-S2-XBOS-ORG-WF |
| **design_status** | DESIGNED |
| **execution** | **PASS** · W4-E1 2026-08-04 · LOAD+SAVE PUT `XBOS-RACI-201`+F5 · FD VAL-001 · AU 409 · `po-uc-tc-w4-qa-e1-xbos-rollup.md` · `uat_done: false` |
| **code_readiness** | `LIKELY_IMPL` |
| **code_note** | UF-XBOS-07 PUT cell sticky F5. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. Squad **W1-S2-XBOS-ORG-WF**.

---

## 1. Mục tiêu UC (1 đoạn)

Sửa ô RACI (R/A/C/I) tại chi tiết pháp nhân, lưu sticky; scope member vs holding.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-R2 | Matrix edit | upsert cell | CEO |

**Đếm nghiệp vụ:** 1

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-R2 | FN-R2-LOAD | Load matrix | GET matrix | N |
| CAP-R2 | FN-R2-SAVE | Lưu ô | PUT cell | Y |
| CAP-R2 | FN-R2-CLR | Clear letters | PUT raci_letters="" | Y |

**Đếm chức năng:** 3

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-R2-LOAD | 1 | 0 | 0 | 1 | 1 | 3 |
| FN-R2-SAVE | 1 | 1 | 1 | 1 | 0 | 4 |
| FN-R2-CLR | 1 | 1 | 0 | 0 | 0 | 2 |
| **Tổng** | 3 | 2 | 1 | 2 | 1 | **9** |

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-RACI-02-R2-LOAD-HP-001 | CAP-R2 | FN-R2-LOAD | HP | P0 | ceo@xe.vn / Group CEO | mở LE member | 1. Tab RACI | `XBOS-RACI-200` grid | UI/API | UF-XBOS-07 |
| TC-RACI-02-R2-LOAD-UX-001 | CAP-R2 | FN-R2-LOAD | UX | P1 | ceo@xe.vn / Group CEO | — | 1. Load | merge default ⊕ company cells | UI | merge |
| TC-RACI-02-R2-SAVE-HP-001 | CAP-R2 | FN-R2-SAVE | HP | P0 | ceo@xe.vn / Group CEO | grid | 1. Đổi I→R 2. Lưu 3. F5 | `XBOS-RACI-201` sticky | UI/API | UF-XBOS-07 |
| TC-RACI-02-R2-SAVE-FD-001 | CAP-R2 | FN-R2-SAVE | FD | P0 | ceo@xe.vn / Group CEO | — | 1. PUT thiếu activity_id | 4xx | API | DTO |
| TC-RACI-02-R2-SAVE-BD-001 | CAP-R2 | FN-R2-SAVE | BD | P1 | ceo@xe.vn / Group CEO | — | 1. Letters không thuộc RACI set | 4xx | API | BD |
| TC-RACI-02-R2-CLR-HP-001 | CAP-R2 | FN-R2-CLR | HP | P1 | ceo@xe.vn / Group CEO | ô có R | 1. Clear 2. F5 | 201 · ô trống | UI/API | clear |
| TC-RACI-02-R2-CLR-FD-001 | CAP-R2 | FN-R2-CLR | FD | P1 | ceo@xe.vn / Group CEO | — | 1. Clear activity không tồn tại | 404/4xx | API | FD |
| TC-RACI-02-R2-SAVE-AU-001 | CAP-R2 | FN-R2-SAVE | AU | P0 | du-lich.ceo@xe.vn / Member CEO | member | 1. PUT matrix LE khác | 403/409/`XBOS-RACI-404` | API | AU |
| TC-RACI-02-R2-LOAD-AU-001 | CAP-R2 | FN-R2-LOAD | AU | P0 | du-lich.ceo@xe.vn / Member CEO | — | 1. GET matrix holding nếu cấm | 403/404 | API | AU read |

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
| BE API/DTO | Controller/service tồn tại cho raci matrix/cell; response code theo OpenAPI/runtime. | apps/api/xbos-api/src/** · API_CONTRACT_VN.md |
| FE menu/nút/role | Portal CC / Settings — UF UF-XBOS-07; menu HDSD Command Center. | docs/qa/USER_FLOW_OPERABILITY_MATRIX.md · apps/web |
| Mobile (nếu có) | N/A — web/portal UC | — |
| RBAC / scope | JWT scope main vs member slug; 403/409 khi lệch scope. | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · scope-context |

**Verdict code_readiness:** `LIKELY_IMPL` — thiết kế only; không = UAT PASS.

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-RACI-02
cases_designed: 9
code_readiness: LIKELY_IMPL
work_item_id: PO-UC-TC-W1-S2-XBOS-ORG-WF
squad: W1-S2-XBOS-ORG-WF
uat_done: false
```
