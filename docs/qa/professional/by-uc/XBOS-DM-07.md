# UC — `XBOS-DM-07` · Gán danh mục cho phân hệ đích

| Meta | Value |
|------|--------|
| **uc_id** | `XBOS-DM-07` |
| **stt_phase1** | 83 |
| **mod** | M01 |
| **name_vi** | Gán danh mục cho phân hệ đích |
| **actors** | Quản trị danh mục XBOS · Group CEO · (CEO CT thành viên khi request) |
| **surfaces** | xbos-cc / web-portal / api |
| **srs_old** | `BANG_TONG_HOP_USECASE_XEVN.md` STT 83 · `docs/xbos/BANG_TONG_HOP_USECASE_XBOS.md` · PHASE1 matrix row 83 |
| **srs_new** | `docs/brand-new-documents-20270801/SRS_VN.md` catalog/tenant (overlap) · **N/A-DELTA** nếu pack mới chưa tách FR-DM-05..18 |
| **tech_spec** | `docs/ecosystem/TECHSPEC_HE_SINH_THAI_XEVN.md` §4–9 · §8.1 catalog publish/pull · `docs/xbos/TECHSPEC.md` M01-Catalog |
| **api_contract** | `POST …/catalog-governance/publish` · `XBOS-CFG-203` |
| **author** | qa · PO-UC-TC-W1-S3-XBOS-CAT |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | LIKELY_PARTIAL |
| **code_note** | assignedTo/domain trên publish & business-master; UI có thể gói trong publish. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. DESIGN only — chưa EVIDENCED.

---

## 1. Mục tiêu UC (1 đoạn)

Người quản trị danh mục thực hiện «Gán danh mục cho phân hệ đích» đúng phạm vi tenant/công ty, có kiểm soát validate/BR và scope; sau thao tác UI/API phản ánh đúng (F5). Chọn phân hệ (HRM/XBOS/LOG…) được phép tiêu thụ bộ danh mục.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-01 | Chuẩn bị ngữ cảnh danh mục | Mở đúng phân hệ / nhóm trước thao tác | Quản trị danh mục XBOS |
| CAP-02 | Gán danh mục cho phân hệ đích | Chọn phân hệ (HRM/XBOS/LOG…) được phép tiêu thụ bộ danh mục. | Quản trị danh mục XBOS · (gov nếu nhạy cảm) |
| CAP-03 | Xác nhận sau thao tác | FE sau 2xx + F5 / consumer thấy đúng | Quản trị · phân hệ đích |

**Đếm nghiệp vụ:** 3

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-01 | FN-OPEN | Mở màn quản trị danh mục / settings liên quan | CC settings / catalog admin | N |
| CAP-02 | FN-ASSIGN-MOD | Gán/bỏ gán module đích | Multi-select module | Y |
| CAP-03 | FN-VERIFY | Xác nhận list/detail sau mutate hoặc export | FE list + F5 / file | N |

**Đếm chức năng:** 3

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-OPEN | 1 | 0 | 0 | 1 | 1 | 3 |
| FN-ASSIGN-MOD | 1 | 1 | 0 | 1 | 1 | 4 |
| FN-VERIFY | 1 | 0 | 0 | 0 | 1 | 2 |
| **Tổng** | 3 | 1 | 0 | 2 | 3 | **9** |

> **cases_designed (SoT §5 rows):** **11** (fn Σ thiết kế = 9; nếu lệch nhẹ → Synth lấy §5)

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-DM07-OPEN-HP-001 | CAP-01 | FN-OPEN | HP | P0 | ceo@xe.vn (Group CEO / main→holding) | Login | 1. Mở gán phân hệ | UI module targets | UI | #83 |
| TC-DM07-OPEN-AU-001 | CAP-01 | FN-OPEN | AU | P0 | du-lich.ceo@xe.vn (CEO thành viên) | Member | 1. Mở | 403 hoặc chỉ CT | UI | AU |
| TC-DM07-OPEN-UX-001 | CAP-01 | FN-OPEN | UX | P1 | ceo@xe.vn (Group CEO / main→holding) | Chưa gán | 1. Mở | Empty assignment rõ | UI | UX |
| TC-DM07-ASN-HP-001 | CAP-02 | FN-ASSIGN-MOD | HP | P0 | ceo@xe.vn (Group CEO / main→holding) | Catalog draft FE | 1. Gán HRM 2. Lưu | 2xx; F5 còn gán | UI/API | XBOS-CFG-203 |
| TC-DM07-ASN-FD-001 | CAP-02 | FN-ASSIGN-MOD | FD | P0 | ceo@xe.vn (Group CEO / main→holding) | Module lạ | 1. Gán code invalid | 4xx | API | FD |
| TC-DM07-ASN-AU-001 | CAP-02 | FN-ASSIGN-MOD | AU | P0 | du-lich.ceo@xe.vn (CEO thành viên) | Member | 1. Gán master | 403/409 | API | AU |
| TC-DM07-ASN-UX-001 | CAP-02 | FN-ASSIGN-MOD | UX | P1 | ceo@xe.vn (Group CEO / main→holding) | Sau gán | 1. Chip module | Chip đúng | UI | UX |
| TC-DM07-VER-HP-001 | CAP-03 | FN-VERIFY | HP | P0 | ceo@xe.vn (Group CEO / main→holding) | Đã gán | 1. Consumer module | Thấy catalog được phép | UI/API | pull |
| TC-DM07-VER-UX-001 | CAP-03 | FN-VERIFY | UX | P2 | ceo@xe.vn (Group CEO / main→holding) | Clear all | 1. Bỏ hết module | Cảnh báo/empty | UI | UX |
| TC-DM07-ASN-FD-002 | CAP-02 | FN-ASSIGN-MOD | FD | P1 | ceo@xe.vn (Group CEO / main→holding) | Published locked | 1. Đổi assign khi khóa | 4xx hoặc confirm flow | UI/API | BR |
| TC-DM07-OPEN-HP-002 | CAP-01 | FN-OPEN | HP | P1 | ceo@xe.vn (Group CEO / main→holding) | Multi-domain | 1. Đổi domain catalog | Assign context đúng domain | UI | HP |

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
| BE API/DTO | publish/assign domain · assignedTo | apps/api/xbos-api · catalog-governance / business-master / config-sync |
| FE menu/nút/role | Settings / publish dialog module chips | apps/web CommandCenter · CatalogGovernancePanel · settings catalogs |
| Mobile (nếu có) | N/A — web/XBOS | — |
| RBAC / scope | JWT main→holding; member không ghi đè master platform; 403/409 ngoài scope | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · catalog-governance scope |

**Verdict code_readiness:** LIKELY_PARTIAL

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: XBOS-DM-07
cases_designed: 11
code_readiness: LIKELY_PARTIAL
uat_done: false
```
