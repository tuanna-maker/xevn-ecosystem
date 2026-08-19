# UC — `UC-XBOS-CC-07` · Hạ tầng — danh mục nền

| Meta | Value |
|------|--------|
| **uc_id** | `UC-XBOS-CC-07` |
| **stt_phase1** | 63 |
| **mod** | M01 |
| **name_vi** | Hạ tầng — danh mục nền |
| **actors** | Group CEO / Platform admin |
| **surfaces** | xbos-cc / api |
| **srs_old** | `docs/xbos/BANG_TONG_HOP_USECASE_XBOS.md` STT 63 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` #63 · matrix SRS Có |
| **srs_new** | N/A-DELTA |
| **tech_spec** | TECHSPEC_HE · infrastructure / config-sync catalogs |
| **api_contract** | GET/PUT infrastructure · GET config-sync/catalogs |
| **author** | ba-process · PO-UC-TC-W1-S2-XBOS-ORG-WF |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_PARTIAL` |
| **code_note** | infrastructure.controller + config-sync; FE Hạ tầng menu. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. Squad **W1-S2-XBOS-ORG-WF**.

---

## 1. Mục tiêu UC (1 đoạn)

Xem/cấu hình hạ tầng danh mục nền tập đoàn từ CC.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-CC07 | Infra catalog nền | Đọc/sửa | Admin |

**Đếm nghiệp vụ:** 1

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-CC07 | FN-CC07-VIEW | Xem hạ tầng | GET | N |
| CAP-CC07 | FN-CC07-SAVE | Sửa cấu hình | PUT | Y |

**Đếm chức năng:** 2

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-CC07-VIEW | 1 | 0 | 0 | 0 | 1 | 2 |
| FN-CC07-SAVE | 1 | 1 | 0 | 1 | 0 | 3 |
| **Tổng** | 2 | 1 | 0 | 1 | 1 | **5** |

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-DM-CC-07-CC07-VIEW-HP-001 | CAP-CC07 | FN-CC07-VIEW | HP | P0 | ceo@xe.vn / Group CEO | login | 1. Mở Hạ tầng | 200 summary | UI/API | CC-07 |
| TC-DM-CC-07-CC07-VIEW-UX-001 | CAP-CC07 | FN-CC07-VIEW | UX | P1 | ceo@xe.vn / Group CEO | — | 1. Empty bootstrap | empty/CTA bootstrap | UI | UX |
| TC-DM-CC-07-CC07-SAVE-HP-001 | CAP-CC07 | FN-CC07-SAVE | HP | P1 | ceo@xe.vn / Group CEO | form | 1. Sửa 2. Lưu 3. F5 | 2xx sticky | UI/API | INF overlap |
| TC-DM-CC-07-CC07-SAVE-FD-001 | CAP-CC07 | FN-CC07-SAVE | FD | P0 | ceo@xe.vn / Group CEO | — | 1. PUT key cấm | 4xx | API | FD |
| TC-DM-CC-07-CC07-SAVE-AU-001 | CAP-CC07 | FN-CC07-SAVE | AU | P0 | du-lich.ceo@xe.vn / Member CEO | member | 1. PUT infra holding | 403/409 | API | AU |

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
| BE API/DTO | Controller/service tồn tại cho infrastructure; response code theo OpenAPI/runtime. | apps/api/xbos-api/src/** · API_CONTRACT_VN.md |
| FE menu/nút/role | Portal CC / Settings — UF CC-07; menu HDSD Command Center. | docs/qa/USER_FLOW_OPERABILITY_MATRIX.md · apps/web |
| Mobile (nếu có) | N/A — web/portal UC | — |
| RBAC / scope | JWT scope main vs member slug; 403/409 khi lệch scope. | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · scope-context |

**Verdict code_readiness:** `LIKELY_PARTIAL` — thiết kế only; không = UAT PASS.

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-XBOS-CC-07
cases_designed: 5
code_readiness: LIKELY_PARTIAL
work_item_id: PO-UC-TC-W1-S2-XBOS-ORG-WF
squad: W1-S2-XBOS-ORG-WF
uat_done: false
```
