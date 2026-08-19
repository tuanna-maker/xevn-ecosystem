# UC — `UC-CC-P0-08` · Thông tin tổng quan không gian làm việc

| Meta | Value |
|------|--------|
| **uc_id** | `UC-CC-P0-08` |
| **stt_phase1** | 56 |
| **mod** | M00 |
| **name_vi** | Thông tin tổng quan không gian làm việc |
| **actors** | Group CEO |
| **surfaces** | xbos-cc / api |
| **srs_old** | `docs/xbos/BANG_TONG_HOP_USECASE_XBOS.md` STT 56 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` #56 · matrix SRS Có |
| **srs_new** | N/A-DELTA |
| **tech_spec** | TECHSPEC_HE §8 · command-center |
| **api_contract** | GET `/api/xbos/command-center/*` / cockpit widgets |
| **author** | ba-process · PO-UC-TC-W1-S2-XBOS-ORG-WF |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_PARTIAL` |
| **code_note** | Command-center controller + FE widgets; một phần pattern API trên matrix. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. Squad **W1-S2-XBOS-ORG-WF**.

---

## 1. Mục tiêu UC (1 đoạn)

Hiển thị tổng quan workspace (KPI/tác vụ/cảnh báo tóm tắt) đúng scope main.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-WS | Workspace overview | Đọc widgets | CEO |

**Đếm nghiệp vụ:** 1

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-WS | FN-WS-OPEN | Mở CC home | CC | N |
| CAP-WS | FN-WS-WIDGET | Load widgets | API widgets | N |

**Đếm chức năng:** 2

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-WS-OPEN | 1 | 0 | 0 | 0 | 1 | 2 |
| FN-WS-WIDGET | 1 | 1 | 0 | 1 | 0 | 3 |
| **Tổng** | 2 | 1 | 0 | 1 | 1 | **5** |

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-CC-P0-08-WS-OPEN-HP-001 | CAP-WS | FN-WS-OPEN | HP | P0 | ceo@xe.vn / Group CEO | login | 1. Vào Command Center | shell + overview | UI | P0-08 |
| TC-CC-P0-08-WS-OPEN-UX-001 | CAP-WS | FN-WS-OPEN | UX | P1 | ceo@xe.vn / Group CEO | — | 1. Reload | không trắng | UI | UX |
| TC-CC-P0-08-WS-WIDGET-HP-001 | CAP-WS | FN-WS-WIDGET | HP | P0 | ceo@xe.vn / Group CEO | login | 1. Quan sát KPI/task widgets | label VI · 2xx hoặc empty hợp lệ | UI/API | UF-XBOS-01/10 |
| TC-CC-P0-08-WS-WIDGET-AU-001 | CAP-WS | FN-WS-WIDGET | AU | P0 | du-lich.ceo@xe.vn / Member CEO | member | 1. Mở rollup tập đoàn | 403/409 không lộ holding rollup | UI/API | UF-XBOS-11 |
| TC-CC-P0-08-WS-WIDGET-FD-001 | CAP-WS | FN-WS-WIDGET | FD | P1 | ceo@xe.vn / Group CEO | BE down | 1. Mở CC | banner ERROR honest | UI | error |

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
| BE API/DTO | Controller/service tồn tại cho command-center; response code theo OpenAPI/runtime. | apps/api/xbos-api/src/** · API_CONTRACT_VN.md |
| FE menu/nút/role | Portal CC / Settings — UF P0-08; menu HDSD Command Center. | docs/qa/USER_FLOW_OPERABILITY_MATRIX.md · apps/web |
| Mobile (nếu có) | N/A — web/portal UC | — |
| RBAC / scope | JWT scope main vs member slug; 403/409 khi lệch scope. | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · scope-context |

**Verdict code_readiness:** `LIKELY_PARTIAL` — thiết kế only; không = UAT PASS.

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-CC-P0-08
cases_designed: 5
code_readiness: LIKELY_PARTIAL
work_item_id: PO-UC-TC-W1-S2-XBOS-ORG-WF
squad: W1-S2-XBOS-ORG-WF
uat_done: false
```
