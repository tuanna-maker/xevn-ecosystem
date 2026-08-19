# UC — `UC-RACI-05` · Nhập hoặc nâng phiên bản catalog RACI

| Meta | Value |
|------|--------|
| **uc_id** | `UC-RACI-05` |
| **stt_phase1** | 69 |
| **mod** | M00 |
| **name_vi** | Nhập hoặc nâng phiên bản catalog RACI |
| **actors** | Platform / Group CEO |
| **surfaces** | api / xbos-cc |
| **srs_old** | `docs/xbos/BANG_TONG_HOP_USECASE_XBOS.md` STT 69 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` #69 · matrix SRS Có |
| **srs_new** | N/A-DELTA |
| **tech_spec** | raci_activity_catalog version |
| **api_contract** | Catalog version bump — pattern import/publish (một phần API) |
| **author** | ba-process · PO-UC-TC-W1-S2-XBOS-ORG-WF |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_PARTIAL` |
| **code_note** | listCatalog có version; import/bump UI có thể GAP — cases ghi SPEC_GAP nếu thiếu endpoint. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. Squad **W1-S2-XBOS-ORG-WF**.

---

## 1. Mục tiêu UC (1 đoạn)

Nâng phiên bản / nhập catalog RACI; consumer thấy version mới.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-R5 | Version catalog | Bump/import | Admin |

**Đếm nghiệp vụ:** 1

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-R5 | FN-R5-VER | Xem version | GET catalog | N |
| CAP-R5 | FN-R5-UP | Nâng/import version | API admin | Y |

**Đếm chức năng:** 2

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-R5-VER | 1 | 0 | 0 | 0 | 1 | 2 |
| FN-R5-UP | 1 | 2 | 0 | 1 | 0 | 4 |
| **Tổng** | 2 | 2 | 0 | 1 | 1 | **6** |

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-RACI-05-R5-VER-HP-001 | CAP-R5 | FN-R5-VER | HP | P0 | ceo@xe.vn / Group CEO | login | 1. GET catalog | 200 + version field | API | RACI-05 |
| TC-RACI-05-R5-UP-HP-001 | CAP-R5 | FN-R5-UP | HP | P1 | ceo@xe.vn / Group CEO | có API/UI import | 1. Import/bump 2. GET lại | version tăng · F5 | API/UI | RACI-05 |
| TC-RACI-05-R5-UP-FD-001 | CAP-R5 | FN-R5-UP | FD | P0 | ceo@xe.vn / Group CEO | — | 1. Import schema sai | 4xx | API | FD |
| TC-RACI-05-R5-UP-AU-001 | CAP-R5 | FN-R5-UP | AU | P0 | du-lich.ceo@xe.vn / Member CEO | member | 1. Bump catalog tập đoàn | 403 | API | AU |
| TC-RACI-05-R5-UP-FD-002 | CAP-R5 | FN-R5-UP | FD | P0 | ceo@xe.vn / Group CEO | endpoint thiếu | 1. Ghi nhận SPEC_GAP | không fake PASS | API | SPEC_GAP |
| TC-RACI-05-R5-VER-UX-001 | CAP-R5 | FN-R5-VER | UX | P2 | ceo@xe.vn / Group CEO | — | 1. UI hiện version | label version visible | UI | UX |

---

## 6. Coverage check

| Check | Req | In design | GAP |
|-------|----------|-----------|-----|
| Mọi Cap có ≥1 FN | 1 | YES | — |
| Mọi FN mutate ≥1 HP + ≥1 FD | 1 | YES | — |
| Auth/scope nếu đa CT | required | YES | — |
| SPEC_GAP ghi rõ | — | Confirm dedicated import endpoint vs admin seed — không seed trong UAT | — |
| Self-approve FD (WF) | N/A | N/A | — |

---

## 7. FE / BE / Role (đánh giá thiết kế — chưa UAT)

| Layer | Finding | Evidence (path/#) |
|-------|---------|-------------------|
| BE API/DTO | Controller/service tồn tại cho raci catalog version; response code theo OpenAPI/runtime. | apps/api/xbos-api/src/** · API_CONTRACT_VN.md |
| FE menu/nút/role | Portal CC / Settings — UF RACI-05; menu HDSD Command Center. | docs/qa/USER_FLOW_OPERABILITY_MATRIX.md · apps/web |
| Mobile (nếu có) | N/A — web/portal UC | — |
| RBAC / scope | JWT scope main vs member slug; 403/409 khi lệch scope. | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · scope-context |

**Verdict code_readiness:** `LIKELY_PARTIAL` — thiết kế only; không = UAT PASS.

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-RACI-05
cases_designed: 6
code_readiness: LIKELY_PARTIAL
work_item_id: PO-UC-TC-W1-S2-XBOS-ORG-WF
squad: W1-S2-XBOS-ORG-WF
uat_done: false
```
