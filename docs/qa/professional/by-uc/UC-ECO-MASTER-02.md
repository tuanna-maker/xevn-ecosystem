# UC — `UC-ECO-MASTER-02` · Mở rộng tenant mới với tenant master

| Meta | Value |
|------|--------|
| **uc_id** | `UC-ECO-MASTER-02` |
| **stt_phase1** | 96 |
| **mod** | M00 |
| **name_vi** | Mở rộng tenant mới với tenant master |
| **actors** | Platform admin · Group CEO · (tenant onboard) |
| **surfaces** | web-portal / api |
| **srs_old** | `BANG_TONG_HOP_USECASE_XEVN.md` STT 96 · PHASE1 matrix |
| **srs_new** | `SRS_VN.md` tenant/catalog inherit · TECHSPEC_HE §8 |
| **tech_spec** | `TECHSPEC_HE_SINH_THAI_XEVN.md` §8 · business-master UC-ECO-MASTER-01 note |
| **api_contract** | Tenant provision / catalog inherit (TECHSPEC_HE §8) |
| **author** | qa · PO-UC-TC-W1-S3-XBOS-CAT |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | LIKELY_PARTIAL |
| **code_note** | Matrix: Có endpoint; SRS_VN inherit catalog — map onboard API khi execute. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. DESIGN only — chưa EVIDENCED.

---

## 1. Mục tiêu UC (1 đoạn)

Onboard tenant mới kế thừa catalog master; không xóa platform-owned values.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-01 | Provision tenant | Tạo tenant | Platform admin |
| CAP-02 | Inherit master | Kế thừa catalog | Hệ thống |
| CAP-03 | Bảo vệ platform rows | Không hard-delete | Hệ thống |
| CAP-04 | Xác nhận | Tenant dùng được master | Admin |

**Đếm nghiệp vụ:** 4

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-01 | FN-PROVISION | Tạo tenant | API/UI onboard | Y |
| CAP-02 | FN-INHERIT | Inherit catalog | API | Y |
| CAP-03 | FN-PROTECT | Chặn hard-delete platform | API | Y |
| CAP-04 | FN-VERIFY | Verify tenant catalog | UI/API | N |

**Đếm chức năng:** 4

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-PROVISION | 1 | 1 | 0 | 1 | 0 | 3 |
| FN-INHERIT | 1 | 1 | 0 | 1 | 0 | 3 |
| FN-PROTECT | 1 | 1 | 0 | 1 | 0 | 3 |
| FN-VERIFY | 1 | 0 | 0 | 1 | 1 | 3 |
| **Tổng** | 4 | 3 | 0 | 4 | 1 | **12** |

> **cases_designed (SoT §5 rows):** **12** (fn Σ thiết kế = 12; nếu lệch nhẹ → Synth lấy §5)

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-ECO-M02-PROV-HP-001 | CAP-01 | FN-PROVISION | HP | P0 | ceo@xe.vn (Group CEO / main→holding) | Quyền platform | 1. Khởi tạo tenant mới đúng HDSD | 2xx created | API/UI | #96 |
| TC-ECO-M02-PROV-FD-001 | CAP-01 | FN-PROVISION | FD | P0 | ceo@xe.vn (Group CEO / main→holding) | Thiếu mã tenant | 1. Submit | 4xx | API | FD |
| TC-ECO-M02-PROV-AU-001 | CAP-01 | FN-PROVISION | AU | P0 | du-lich.ceo@xe.vn (CEO thành viên) | Member | 1. Provision | 403 | API | AU |
| TC-ECO-M02-INH-HP-001 | CAP-02 | FN-INHERIT | HP | P0 | ceo@xe.vn (Group CEO / main→holding) | Tenant mới | 1. Inherit master | Baseline platform rows | API | SRS inherit |
| TC-ECO-M02-INH-FD-001 | CAP-02 | FN-INHERIT | FD | P0 | ceo@xe.vn (Group CEO / main→holding) | Conflict re-inherit | 1. Chạy lại sai | 4xx hoặc idempotent documented | API | FD |
| TC-ECO-M02-INH-AU-001 | CAP-02 | FN-INHERIT | AU | P0 | du-lich.ceo@xe.vn (CEO thành viên) | — | 1. Inherit hộ tenant khác | 403 | API | AU |
| TC-ECO-M02-PRO-HP-001 | CAP-03 | FN-PROTECT | HP | P0 | ceo@xe.vn (Group CEO / main→holding) | Platform row | 1. Thử hard-delete | Chặn; soft only | API | SRS_VN |
| TC-ECO-M02-PRO-FD-001 | CAP-03 | FN-PROTECT | FD | P0 | ceo@xe.vn (Group CEO / main→holding) | — | 1. DELETE platform | 4xx | API | FD |
| TC-ECO-M02-PRO-AU-001 | CAP-03 | FN-PROTECT | AU | P0 | anonymous | — | 1. API | 401 | API | AU |
| TC-ECO-M02-VER-HP-001 | CAP-04 | FN-VERIFY | HP | P0 | ceo@xe.vn (Group CEO / main→holding) | Sau onboard | 1. List catalog tenant mới | Có data kế thừa | UI/API | AC |
| TC-ECO-M02-VER-UX-001 | CAP-04 | FN-VERIFY | UX | P1 | ceo@xe.vn (Group CEO / main→holding) | — | 1. Wizard | Steps + error recovery | UI | UX |
| TC-ECO-M02-VER-AU-001 | CAP-04 | FN-VERIFY | AU | P0 | du-lich.ceo@xe.vn (CEO thành viên) | Không membership | 1. Login list | 403/empty | UI/API | AU |

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
| BE API/DTO | Tenant master expand endpoints | apps/api/xbos-api/src/business-master/business-master.controller.ts |
| FE menu/nút/role | Portal onboard nếu có — else API-first | apps/web Command Center / portal data hooks |
| Mobile (nếu có) | N/A — web/XBOS | — |
| RBAC / scope | tenant_id + company scope trên mọi master read/write | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · catalog-governance scope |

**Verdict code_readiness:** LIKELY_PARTIAL

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-ECO-MASTER-02
cases_designed: 12
code_readiness: LIKELY_PARTIAL
uat_done: false
```
