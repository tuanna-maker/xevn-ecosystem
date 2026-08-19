# UC — `XBOS-DM-08` · Gán danh mục theo công ty

| Meta | Value |
|------|--------|
| **uc_id** | `XBOS-DM-08` |
| **stt_phase1** | 84 |
| **mod** | M01 |
| **name_vi** | Gán danh mục theo công ty |
| **actors** | Quản trị danh mục XBOS · Group CEO · (CEO CT thành viên khi request) |
| **surfaces** | xbos-cc / web-portal / api |
| **srs_old** | `BANG_TONG_HOP_USECASE_XEVN.md` STT 84 · `docs/xbos/BANG_TONG_HOP_USECASE_XBOS.md` · PHASE1 matrix row 84 |
| **srs_new** | `docs/brand-new-documents-20270801/SRS_VN.md` catalog/tenant (overlap) · **N/A-DELTA** nếu pack mới chưa tách FR-DM-05..18 |
| **tech_spec** | `docs/ecosystem/TECHSPEC_HE_SINH_THAI_XEVN.md` §4–9 · §8.1 catalog publish/pull · `docs/xbos/TECHSPEC.md` M01-Catalog |
| **api_contract** | HRM settings-catalogs · XBOS business-master · `HRM-SET-*` / `XBOS-MASTER-*` |
| **author** | qa · PO-UC-TC-W1-S3-XBOS-CAT |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | LIKELY_IMPL |
| **code_note** | Group HR / extension chọn công ty áp dụng; business-master partition by company. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. DESIGN only — chưa EVIDENCED.

---

## 1. Mục tiêu UC (1 đoạn)

Người quản trị danh mục thực hiện «Gán danh mục theo công ty» đúng phạm vi tenant/công ty, có kiểm soát validate/BR và scope; sau thao tác UI/API phản ánh đúng (F5). Phạm vi áp dụng danh mục theo pháp nhân (holding / member slug).

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-01 | Chuẩn bị ngữ cảnh danh mục | Mở đúng phân hệ / nhóm trước thao tác | Quản trị danh mục XBOS |
| CAP-02 | Gán danh mục theo công ty | Phạm vi áp dụng danh mục theo pháp nhân (holding / member slug). | Quản trị danh mục XBOS · (gov nếu nhạy cảm) |
| CAP-03 | Xác nhận sau thao tác | FE sau 2xx + F5 / consumer thấy đúng | Quản trị · phân hệ đích |

**Đếm nghiệp vụ:** 3

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-01 | FN-OPEN | Mở màn quản trị danh mục / settings liên quan | CC settings / catalog admin | N |
| CAP-02 | FN-ASSIGN-CO | Gán/bỏ gán công ty | Company chips | Y |
| CAP-03 | FN-VERIFY | Xác nhận list/detail sau mutate hoặc export | FE list + F5 / file | N |

**Đếm chức năng:** 3

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-OPEN | 1 | 0 | 0 | 1 | 1 | 3 |
| FN-ASSIGN-CO | 1 | 1 | 0 | 1 | 1 | 4 |
| FN-VERIFY | 1 | 0 | 0 | 0 | 1 | 2 |
| **Tổng** | 3 | 1 | 0 | 2 | 3 | **9** |

> **cases_designed (SoT §5 rows):** **12** (fn Σ thiết kế = 9; nếu lệch nhẹ → Synth lấy §5)

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-DM08-OPEN-HP-001 | CAP-01 | FN-OPEN | HP | P0 | ceo@xe.vn (Group CEO / main→holding) | Login main | 1. Mở gán theo CT | Danh sách pháp nhân | UI | #84 · UF-15 |
| TC-DM08-OPEN-AU-001 | CAP-01 | FN-OPEN | AU | P0 | du-lich.ceo@xe.vn (CEO thành viên) | Member | 1. Mở | Không gán hộ holding vượt quyền | UI/API | AU |
| TC-DM08-OPEN-UX-001 | CAP-01 | FN-OPEN | UX | P1 | ceo@xe.vn (Group CEO / main→holding) | Chưa chọn | 1. Mở | Hint chọn CT | UI | UX |
| TC-DM08-ACO-HP-001 | CAP-02 | FN-ASSIGN-CO | HP | P0 | ceo@xe.vn (Group CEO / main→holding) | Catalog FE | 1. Chọn CO-DL 2. Lưu | 2xx; F5 đúng tập CT | UI/API | J-XBOS-02 |
| TC-DM08-ACO-FD-001 | CAP-02 | FN-ASSIGN-CO | FD | P0 | ceo@xe.vn (Group CEO / main→holding) | UUID giả | 1. Gán companyId không tồn tại | 4xx | API | FD |
| TC-DM08-ACO-AU-001 | CAP-02 | FN-ASSIGN-CO | AU | P0 | du-lich.ceo@xe.vn (CEO thành viên) | Member CEO | 1. Gán CT khác | 403/409 | API | scope |
| TC-DM08-ACO-UX-001 | CAP-02 | FN-ASSIGN-CO | UX | P1 | ceo@xe.vn (Group CEO / main→holding) | Exclude chip | 1. Bỏ Visun nếu UI có | Chip cập nhật | UI | Primary CAT-DL neo |
| TC-DM08-VER-HP-001 | CAP-03 | FN-VERIFY | HP | P0 | ceo@xe.vn (Group CEO / main→holding) | Đã gán | 1. Đổi OU CT được/không gán | Thấy/không thấy đúng BR | UI | scope parity |
| TC-DM08-VER-UX-001 | CAP-03 | FN-VERIFY | UX | P2 | ceo@xe.vn (Group CEO / main→holding) | Loading companies | 1. Mở picker | Loading rồi list | UI | UX |
| TC-DM08-ACO-HP-002 | CAP-02 | FN-ASSIGN-CO | HP | P1 | ceo@xe.vn (Group CEO / main→holding) | Multi CT | 1. Gán ≥2 CT | F5 đủ tập | UI/API | HP |
| TC-DM08-ACO-FD-002 | CAP-02 | FN-ASSIGN-CO | FD | P1 | ceo@xe.vn (Group CEO / main→holding) | Empty set khi BR bắt buộc | 1. Clear hết CT | 4xx hoặc warning | UI/API | FD |
| TC-DM08-OPEN-AU-002 | CAP-01 | FN-OPEN | AU | P0 | anonymous | No token | 1. GET companies | 401 | API | AU |

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
| BE API/DTO | companyId scope · extension apply companies | apps/api/xbos-api · catalog-governance / business-master / config-sync |
| FE menu/nút/role | company_group_hr · extension dialog chips | apps/web CommandCenter · CatalogGovernancePanel · settings catalogs |
| Mobile (nếu có) | N/A — web/XBOS | — |
| RBAC / scope | JWT main→holding; member không ghi đè master platform; 403/409 ngoài scope | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · catalog-governance scope |

**Verdict code_readiness:** LIKELY_IMPL

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: XBOS-DM-08
cases_designed: 12
code_readiness: LIKELY_IMPL
uat_done: false
```
