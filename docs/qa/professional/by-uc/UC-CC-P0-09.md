# UC — `UC-CC-P0-09` · Chính sách hiển thị dữ liệu tạm khi API chưa sẵn sàng

| Meta | Value |
|------|--------|
| **uc_id** | `UC-CC-P0-09` |
| **stt_phase1** | 57 |
| **mod** | M00 |
| **name_vi** | Chính sách hiển thị dữ liệu tạm khi API chưa sẵn sàng |
| **actors** | FE runtime · QA |
| **surfaces** | web-portal |
| **srs_old** | `docs/xbos/BANG_TONG_HOP_USECASE_XBOS.md` STT 57 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` #57 · matrix SRS Có |
| **srs_new** | N/A-DELTA · mock vs live policy |
| **tech_spec** | TECHSPEC_HE §8 |
| **api_contract** | N/A — FE policy; API fail → không fake business rows |
| **author** | ba-process · PO-UC-TC-W1-S2-XBOS-ORG-WF |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_PARTIAL` |
| **code_note** | Policy sản phẩm: empty/error vs mock; cần spot FE flags — design cases bắt buộc honest UI. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. Squad **W1-S2-XBOS-ORG-WF**.

---

## 1. Mục tiêu UC (1 đoạn)

Khi API lỗi/chưa sẵn, UI không giả dữ liệu nghiệp vụ như thật; phân biệt mock demo vs live.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-MOCK | Honest empty/error | Không fake UAT | FE |

**Đếm nghiệp vụ:** 1

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-MOCK | FN-MOCK-ERR | API 5xx/down | banner | N |
| CAP-MOCK | FN-MOCK-EMPTY | API 200 empty | empty state | N |

**Đếm chức năng:** 2

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-MOCK-ERR | 1 | 1 | 0 | 1 | 0 | 3 |
| FN-MOCK-EMPTY | 1 | 0 | 0 | 0 | 1 | 2 |
| **Tổng** | 2 | 1 | 0 | 1 | 1 | **5** |

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-CC-P0-09-MOCK-ERR-HP-001 | CAP-MOCK | FN-MOCK-ERR | HP | P0 | ceo@xe.vn / Group CEO | tắt hrm/xbos proxy giả lập | 1. Mở màn CC phụ thuộc API | ERROR/banner · không bảng giả | UI | P0-09 |
| TC-CC-P0-09-MOCK-ERR-FD-001 | CAP-MOCK | FN-MOCK-ERR | FD | P0 | ceo@xe.vn / Group CEO | API 409 scope | 1. Mở KPI holding bằng member | hiện 409 · không mock series | UI | 409 |
| TC-CC-P0-09-MOCK-EMPTY-HP-001 | CAP-MOCK | FN-MOCK-EMPTY | HP | P0 | ceo@xe.vn / Group CEO | API 200 [] | 1. Mở list | empty hợp lệ · không spinner storm | UI | empty |
| TC-CC-P0-09-MOCK-EMPTY-UX-001 | CAP-MOCK | FN-MOCK-EMPTY | UX | P1 | ceo@xe.vn / Group CEO | — | 1. Toggle demo flag nếu còn | nhãn rõ «dữ liệu mẫu» hoặc tắt trên UAT | UI | demo label |
| TC-CC-P0-09-MOCK-ERR-AU-001 | CAP-MOCK | FN-MOCK-ERR | AU | P2 | (chưa đăng nhập) | — | 1. Protected | login redirect ≠ fake data | UI | AU |

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
| BE API/DTO | Controller/service tồn tại cho FE policy; response code theo OpenAPI/runtime. | apps/api/xbos-api/src/** · API_CONTRACT_VN.md |
| FE menu/nút/role | Portal CC / Settings — UF P0-09; menu HDSD Command Center. | docs/qa/USER_FLOW_OPERABILITY_MATRIX.md · apps/web |
| Mobile (nếu có) | N/A — web/portal UC | — |
| RBAC / scope | JWT scope main vs member slug; 403/409 khi lệch scope. | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · scope-context |

**Verdict code_readiness:** `LIKELY_PARTIAL` — thiết kế only; không = UAT PASS.

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-CC-P0-09
cases_designed: 5
code_readiness: LIKELY_PARTIAL
work_item_id: PO-UC-TC-W1-S2-XBOS-ORG-WF
squad: W1-S2-XBOS-ORG-WF
uat_done: false
```
