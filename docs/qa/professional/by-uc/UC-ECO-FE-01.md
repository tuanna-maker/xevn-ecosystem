# UC — `UC-ECO-FE-01` · Thay thế dữ liệu giả lập trên Web Portal bằng API thật

| Meta | Value |
|------|--------|
| **uc_id** | `UC-ECO-FE-01` |
| **stt_phase1** | 97 |
| **mod** | M00 |
| **name_vi** | Thay thế dữ liệu giả lập trên Web Portal bằng API thật |
| **actors** | Platform admin · Group CEO · (tenant onboard) |
| **surfaces** | web-portal |
| **srs_old** | `BANG_TONG_HOP_USECASE_XEVN.md` STT 97 · PHASE1 matrix |
| **srs_new** | `SRS_VN.md` tenant/catalog inherit · TECHSPEC_HE §8 |
| **tech_spec** | `TECHSPEC_HE_SINH_THAI_XEVN.md` §8 · business-master UC-ECO-MASTER-01 note |
| **api_contract** | Portal → Vite proxy → xbos/hrm APIs |
| **author** | qa · PO-UC-TC-W1-S3-XBOS-CAT |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | LIKELY_PARTIAL |
| **code_note** | Matrix API P2 một phần; nhiều màn đã wire Nest — PARTIAL; cấm mock PASS khi API down. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. DESIGN only — chưa EVIDENCED.

---

## 1. Mục tiêu UC (1 đoạn)

Portal không phụ thuộc mock cứng cho master/catalog khi API sẵn; empty/error đúng sự thật.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-01 | Wire đọc API | List từ Nest | FE |
| CAP-02 | Wire ghi API | Mutate qua API | FE |
| CAP-03 | Loại bỏ mock im lặng | Không fake data | FE |
| CAP-04 | Health verify | Stack sống | QA/DevOps |

**Đếm nghiệp vụ:** 4

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-01 | FN-WIRE | Bind GET API | React Query/fetch | N |
| CAP-02 | FN-MUTATE-API | Bind mutate API | PUT/POST | Y |
| CAP-03 | FN-NO-MOCK | Không mock production path | FE | N |
| CAP-04 | FN-VERIFY | Health + F5 | UI | N |

**Đếm chức năng:** 4

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-WIRE | 1 | 1 | 0 | 1 | 0 | 3 |
| FN-MUTATE-API | 1 | 1 | 0 | 1 | 0 | 3 |
| FN-NO-MOCK | 1 | 1 | 0 | 0 | 1 | 3 |
| FN-VERIFY | 1 | 0 | 0 | 0 | 0 | 1 |
| **Tổng** | 4 | 3 | 0 | 2 | 1 | **10** |

> **cases_designed (SoT §5 rows):** **10** (fn Σ thiết kế = 10; nếu lệch nhẹ → Synth lấy §5)

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-ECO-FE-WIRE-HP-001 | CAP-01 | FN-WIRE | HP | P0 | ceo@xe.vn (Group CEO / main→holding) | APIs up | 1. Mở CC catalogs | Network GET API thật 2xx | UI | #97 · UF-14 |
| TC-ECO-FE-WIRE-FD-001 | CAP-01 | FN-WIRE | FD | P0 | ceo@xe.vn (Group CEO / main→holding) | Stop xbos-api | 1. Mở màn | Banner lỗi — không fake rows | UI | qc:fe-be-health |
| TC-ECO-FE-WIRE-AU-001 | CAP-01 | FN-WIRE | AU | P0 | du-lich.ceo@xe.vn (CEO thành viên) | Member | 1. Mở rollup | 403/409 — không mock full group | UI | AU |
| TC-ECO-FE-MUT-HP-001 | CAP-02 | FN-MUTATE-API | HP | P0 | ceo@xe.vn (Group CEO / main→holding) | API up | 1. Sửa + Lưu FE | PUT 2xx; F5 còn | UI/API | U65 |
| TC-ECO-FE-MUT-FD-001 | CAP-02 | FN-MUTATE-API | FD | P0 | ceo@xe.vn (Group CEO / main→holding) | Validation | 1. Submit invalid | 4xx FE hiện lỗi | UI | FD |
| TC-ECO-FE-MUT-AU-001 | CAP-02 | FN-MUTATE-API | AU | P0 | du-lich.ceo@xe.vn (CEO thành viên) | — | 1. Mutate ngoài scope | 403/409 | UI/API | AU |
| TC-ECO-FE-MOCK-HP-001 | CAP-03 | FN-NO-MOCK | HP | P0 | ceo@xe.vn (Group CEO / main→holding) | Devtools | 1. Inspect source | Không mock business rows path đã wire | UI | AC |
| TC-ECO-FE-MOCK-FD-001 | CAP-03 | FN-NO-MOCK | FD | P0 | ceo@xe.vn (Group CEO / main→holding) | Fallback mock | 1. Nếu còn | Phải banner mock — không im lặng | UI | observe |
| TC-ECO-FE-MOCK-UX-001 | CAP-03 | FN-NO-MOCK | UX | P1 | ceo@xe.vn (Group CEO / main→holding) | Empty API | 1. List 0 | Empty thật — không Test 123 | UI | U65 |
| TC-ECO-FE-VER-HP-001 | CAP-04 | FN-VERIFY | HP | P0 | ceo@xe.vn (Group CEO / main→holding) | — | 1. qc:fe-be-health + F5 | Consistent | UI | gate |

---

## 6. Coverage check

| Check | Req | In design | GAP |
|-------|----------|-----------|-----|
| Mọi Cap có ≥1 FN | Y | Y | |
| Mọi FN mutate ≥1 HP + ≥1 FD | Y | Y |  |
| Auth/scope nếu đa CT | Y | Y | |
| SPEC_GAP ghi rõ | Y | — | |

---

## 7. FE / BE / Role (đánh giá thiết kế — chưa UAT)

| Layer | Finding | Evidence (path/#) |
|-------|---------|-------------------|
| BE API/DTO | APIs must be up — 500 proxy ≠ FE bug | apps/api/xbos-api/src/business-master/business-master.controller.ts |
| FE menu/nút/role | CommandCenterPage + catalog APIs | apps/web Command Center / portal data hooks |
| Mobile (nếu có) | N/A — web/XBOS | — |
| RBAC / scope | tenant_id + company scope trên mọi master read/write | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · catalog-governance scope |

**Verdict code_readiness:** LIKELY_PARTIAL

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-ECO-FE-01
cases_designed: 10
code_readiness: LIKELY_PARTIAL
uat_done: false
```
