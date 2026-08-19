# UC — `UC-CC-01` · Cấu hình phòng ban theo từng pháp nhân

| Meta | Value |
|------|--------|
| **uc_id** | `UC-CC-01` |
| **stt_phase1** | 58 |
| **mod** | M00 |
| **name_vi** | Cấu hình phòng ban theo từng pháp nhân |
| **actors** | Group CEO |
| **surfaces** | xbos-cc / api |
| **srs_old** | `docs/xbos/BANG_TONG_HOP_USECASE_XBOS.md` STT 58 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` #58 · matrix SRS Có |
| **srs_new** | N/A-DELTA |
| **tech_spec** | TECHSPEC_HE §8 · org-units per LE |
| **api_contract** | GET tree + POST org-units scoped entityId |
| **author** | ba-process · PO-UC-TC-W1-S2-XBOS-ORG-WF |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_IMPL` |
| **code_note** | org-foundation.controller.spec UC-CC-01; overlap P0-03 — cases tập trung per-LE switch. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. Squad **W1-S2-XBOS-ORG-WF**.

---

## 1. Mục tiêu UC (1 đoạn)

Chọn pháp nhân → cấu hình phòng ban chỉ của LE đó; không lẫn tree CT khác.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-CC01 | Dept per LE | scope LE | CEO |

**Đếm nghiệp vụ:** 1

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-CC01 | FN-CC01-SEL | Chọn pháp nhân | CC | N |
| CAP-CC01 | FN-CC01-CFG | Cấu hình PB | POST/PUT org-units | Y |

**Đếm chức năng:** 2

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-CC01-SEL | 1 | 0 | 0 | 0 | 1 | 2 |
| FN-CC01-CFG | 1 | 2 | 0 | 1 | 0 | 4 |
| **Tổng** | 2 | 2 | 0 | 1 | 1 | **6** |

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-CC-01-CC01-SEL-HP-001 | CAP-CC01 | FN-CC01-SEL | HP | P0 | ceo@xe.vn / Group CEO | ≥2 LE | 1. Chọn LE A vs B | tree đổi theo LE | UI/API | CC-01 |
| TC-CC-01-CC01-SEL-UX-001 | CAP-CC01 | FN-CC01-SEL | UX | P1 | ceo@xe.vn / Group CEO | — | 1. Đổi LE nhanh | không flash data LE cũ | UI | UX race |
| TC-CC-01-CC01-CFG-HP-001 | CAP-CC01 | FN-CC01-CFG | HP | P0 | ceo@xe.vn / Group CEO | LE A | 1. Thêm PB 2. F5 | 201 · chỉ trên LE A | UI/API | CC-01 |
| TC-CC-01-CC01-CFG-FD-001 | CAP-CC01 | FN-CC01-CFG | FD | P0 | ceo@xe.vn / Group CEO | LE A | 1. Lưu thiếu tên | 4xx | API | FD |
| TC-CC-01-CC01-CFG-AU-001 | CAP-CC01 | FN-CC01-CFG | AU | P0 | du-lich.ceo@xe.vn / Member CEO | member | 1. Cấu hình LE ngoài scope | 403/409 | API | AU |
| TC-CC-01-CC01-CFG-FD-002 | CAP-CC01 | FN-CC01-CFG | FD | P1 | ceo@xe.vn / Group CEO | LE A | 1. POST entityId của LE B trong context A | reject/scope fail | API | cross-LE |

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
| BE API/DTO | Controller/service tồn tại cho org-units per LE; response code theo OpenAPI/runtime. | apps/api/xbos-api/src/** · API_CONTRACT_VN.md |
| FE menu/nút/role | Portal CC / Settings — UF CC-01; menu HDSD Command Center. | docs/qa/USER_FLOW_OPERABILITY_MATRIX.md · apps/web |
| Mobile (nếu có) | N/A — web/portal UC | — |
| RBAC / scope | JWT scope main vs member slug; 403/409 khi lệch scope. | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · scope-context |

**Verdict code_readiness:** `LIKELY_IMPL` — thiết kế only; không = UAT PASS.

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-CC-01
cases_designed: 6
code_readiness: LIKELY_IMPL
work_item_id: PO-UC-TC-W1-S2-XBOS-ORG-WF
squad: W1-S2-XBOS-ORG-WF
uat_done: false
```
