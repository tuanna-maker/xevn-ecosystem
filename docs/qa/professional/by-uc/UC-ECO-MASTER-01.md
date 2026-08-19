# UC — `UC-ECO-MASTER-01` · Quản lý master data theo tenant và công ty

| Meta | Value |
|------|--------|
| **uc_id** | `UC-ECO-MASTER-01` |
| **stt_phase1** | 95 |
| **mod** | M00 |
| **name_vi** | Quản lý master data theo tenant và công ty |
| **actors** | Platform admin · Group CEO · (tenant onboard) |
| **surfaces** | web-portal / api |
| **srs_old** | `BANG_TONG_HOP_USECASE_XEVN.md` STT 95 · PHASE1 matrix |
| **srs_new** | `SRS_VN.md` tenant/catalog inherit · TECHSPEC_HE §8 |
| **tech_spec** | `TECHSPEC_HE_SINH_THAI_XEVN.md` §8 · business-master UC-ECO-MASTER-01 note |
| **api_contract** | GET/PUT `/api/xbos/business-master/{domain}/items*` · `XBOS-MASTER-200/201` |
| **author** | qa · PO-UC-TC-W1-S3-XBOS-CAT |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | LIKELY_PARTIAL |
| **code_note** | Controller ghi UC-ECO-MASTER-01 minimal read path; matrix API P2 một phần — PARTIAL honest. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. DESIGN only — chưa EVIDENCED.

---

## 1. Mục tiêu UC (1 đoạn)

Đọc/ghi master data (domain catalogs) đúng tenant và pháp nhân; không lẫn partition.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-01 | Đọc master theo scope | List đúng tenant/CT | Admin |
| CAP-02 | Ghi master | Upsert items | Admin |
| CAP-03 | Cô lập tenant | Không cross-tenant | Hệ thống |
| CAP-04 | Xác nhận FE | F5 persist | Admin |

**Đếm nghiệp vụ:** 4

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-01 | FN-LIST | List master items | GET items | N |
| CAP-02 | FN-UPSERT | Upsert master items | PUT items | Y |
| CAP-03 | FN-TENANT-ISO | Kiểm tra cô lập tenant | API scope | N |
| CAP-04 | FN-VERIFY | F5 verify | UI | N |

**Đếm chức năng:** 4

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-LIST | 1 | 0 | 0 | 1 | 1 | 3 |
| FN-UPSERT | 1 | 1 | 0 | 1 | 1 | 4 |
| FN-TENANT-ISO | 1 | 1 | 0 | 1 | 0 | 3 |
| FN-VERIFY | 1 | 0 | 0 | 0 | 1 | 2 |
| **Tổng** | 4 | 2 | 0 | 3 | 3 | **12** |

> **cases_designed (SoT §5 rows):** **12** (fn Σ thiết kế = 12; nếu lệch nhẹ → Synth lấy §5)

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-ECO-M01-LIST-HP-001 | CAP-01 | FN-LIST | HP | P0 | ceo@xe.vn (Group CEO / main→holding) | Login main | 1. GET command_center_catalogs items | 200 + scope holding | API/UI | UC-ECO-MASTER-01 |
| TC-ECO-M01-LIST-AU-001 | CAP-01 | FN-LIST | AU | P0 | du-lich.ceo@xe.vn (CEO thành viên) | Member | 1. GET holding-only | 403/409 hoặc filter CT | API | AU |
| TC-ECO-M01-LIST-UX-001 | CAP-01 | FN-LIST | UX | P1 | ceo@xe.vn (Group CEO / main→holding) | Empty | 1. List | Empty OK | UI | U65 |
| TC-ECO-M01-PUT-HP-001 | CAP-02 | FN-UPSERT | HP | P0 | ceo@xe.vn (Group CEO / main→holding) | Row FE | 1. PUT items | 201/200; F5 | UI/API | XBOS-MASTER-201 |
| TC-ECO-M01-PUT-FD-001 | CAP-02 | FN-UPSERT | FD | P0 | ceo@xe.vn (Group CEO / main→holding) | Invalid payload | 1. PUT | 4xx | API | FD |
| TC-ECO-M01-PUT-AU-001 | CAP-02 | FN-UPSERT | AU | P0 | du-lich.ceo@xe.vn (CEO thành viên) | Wrong companyId | 1. PUT | 403/409 | API | AU |
| TC-ECO-M01-PUT-UX-001 | CAP-02 | FN-UPSERT | UX | P1 | ceo@xe.vn (Group CEO / main→holding) | Autosave | 1. Debounce | Banner đúng | UI | UF-14 |
| TC-ECO-M01-TEN-HP-001 | CAP-03 | FN-TENANT-ISO | HP | P0 | ceo@xe.vn (Group CEO / main→holding) | 2 tenants nếu có | 1. Đổi tenant context | Không leak rows | API | tenant_id |
| TC-ECO-M01-TEN-FD-001 | CAP-03 | FN-TENANT-ISO | FD | P0 | ceo@xe.vn (Group CEO / main→holding) | Sai tenant header | 1. GET | 4xx/empty | API | FD |
| TC-ECO-M01-TEN-AU-001 | CAP-03 | FN-TENANT-ISO | AU | P0 | token tenant A | Query tenant B | 1. GET | 403 | API | AU |
| TC-ECO-M01-VER-HP-001 | CAP-04 | FN-VERIFY | HP | P0 | ceo@xe.vn (Group CEO / main→holding) | Sau PUT | 1. F5 | Persist | UI | AC |
| TC-ECO-M01-VER-UX-001 | CAP-04 | FN-VERIFY | UX | P2 | ceo@xe.vn (Group CEO / main→holding) | 500 | 1. Fail | Banner | UI | UX |

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
| BE API/DTO | business-master domains incl. command_center_catalogs | apps/api/xbos-api/src/business-master/business-master.controller.ts |
| FE menu/nút/role | CC settings catalogs autosave | apps/web Command Center / portal data hooks |
| Mobile (nếu có) | N/A — web/XBOS | — |
| RBAC / scope | tenant_id + company scope trên mọi master read/write | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · catalog-governance scope |

**Verdict code_readiness:** LIKELY_PARTIAL

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-ECO-MASTER-01
cases_designed: 12
code_readiness: LIKELY_PARTIAL
uat_done: false
```
