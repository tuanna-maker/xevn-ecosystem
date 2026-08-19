# UC — `XBOS-DM-01` · Xem tổng quan danh mục theo phân hệ

| Meta | Value |
|------|--------|
| **uc_id** | `XBOS-DM-01` |
| **stt_phase1** | 77 |
| **mod** | M01 |
| **name_vi** | Xem tổng quan danh mục theo phân hệ |
| **actors** | Catalog admin · Group CEO |
| **surfaces** | xbos-cc / api |
| **srs_old** | `docs/xbos/BANG_TONG_HOP_USECASE_XBOS.md` STT 77 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` #77 · matrix SRS Có |
| **srs_new** | N/A-DELTA · catalog overview |
| **tech_spec** | config-sync catalogs · TECHSPEC_HE |
| **api_contract** | GET `/api/xbos/config-sync/catalogs` |
| **author** | ba-process · PO-UC-TC-W1-S2-XBOS-ORG-WF |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_IMPL` |
| **code_note** | config-sync list catalogs; FE DM overview. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. Squad **W1-S2-XBOS-ORG-WF**.

---

## 1. Mục tiêu UC (1 đoạn)

Xem tổng quan danh mục theo phân hệ đích (HRM/XBOS/LOG…).

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-DM1 | Catalog overview | Đọc | Admin |

**Đếm nghiệp vụ:** 1

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-DM1 | FN-DM1-OV | Overview theo module | GET catalogs | N |
| CAP-DM1 | FN-DM1-NAV | Click nhóm → chi tiết | UI | N |

**Đếm chức năng:** 2

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-DM1-OV | 1 | 0 | 0 | 1 | 1 | 3 |
| FN-DM1-NAV | 1 | 1 | 0 | 0 | 0 | 2 |
| **Tổng** | 2 | 1 | 0 | 1 | 1 | **5** |

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-DM-DM-01-DM1-OV-HP-001 | CAP-DM1 | FN-DM1-OV | HP | P0 | ceo@xe.vn / Group CEO | login | 1. Mở quản trị danh mục | 200 overview | UI/API | DM-01 |
| TC-DM-DM-01-DM1-OV-UX-001 | CAP-DM1 | FN-DM1-OV | UX | P1 | ceo@xe.vn / Group CEO | module filter | 1. Filter HRM | subset | UI | filter |
| TC-DM-DM-01-DM1-NAV-HP-001 | CAP-DM1 | FN-DM1-NAV | HP | P0 | ceo@xe.vn / Group CEO | có nhóm | 1. Click nhóm | detail items load | UI | L2.5 |
| TC-DM-DM-01-DM1-NAV-FD-001 | CAP-DM1 | FN-DM1-NAV | FD | P1 | ceo@xe.vn / Group CEO | — | 1. catalogKey lạ | 404 | API | FD |
| TC-DM-DM-01-DM1-OV-AU-001 | CAP-DM1 | FN-DM1-OV | AU | P0 | du-lich.ceo@xe.vn / Member CEO | member | 1. Overview holding-only keys | 403 hoặc ẩn | API | AU |

---

## 6. Coverage check

| Check | Req | In design | GAP |
|-------|----------|-----------|-----|
| Mọi Cap có ≥1 FN | 1 | YES | — |
| Mọi FN mutate ≥1 HP + ≥1 FD | 0 | YES | — |
| Auth/scope nếu đa CT | required | YES | — |
| SPEC_GAP ghi rõ | — | none recorded | — |
| Self-approve FD (WF) | N/A | N/A | — |

---

## 7. FE / BE / Role (đánh giá thiết kế — chưa UAT)

| Layer | Finding | Evidence (path/#) |
|-------|---------|-------------------|
| BE API/DTO | Controller/service tồn tại cho config-sync/catalogs; response code theo OpenAPI/runtime. | apps/api/xbos-api/src/** · API_CONTRACT_VN.md |
| FE menu/nút/role | Portal CC / Settings — UF DM-01; menu HDSD Command Center. | docs/qa/USER_FLOW_OPERABILITY_MATRIX.md · apps/web |
| Mobile (nếu có) | N/A — web/portal UC | — |
| RBAC / scope | JWT scope main vs member slug; 403/409 khi lệch scope. | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · scope-context |

**Verdict code_readiness:** `LIKELY_IMPL` — thiết kế only; không = UAT PASS.

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: XBOS-DM-01
cases_designed: 5
code_readiness: LIKELY_IMPL
work_item_id: PO-UC-TC-W1-S2-XBOS-ORG-WF
squad: W1-S2-XBOS-ORG-WF
uat_done: false
```
