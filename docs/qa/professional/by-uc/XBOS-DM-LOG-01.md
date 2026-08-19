# UC — `XBOS-DM-LOG-01` · Xem tổng quan danh mục theo phân hệ Logistic

| Meta | Value |
|------|--------|
| **uc_id** | `XBOS-DM-LOG-01` |
| **stt_phase1** | 98 |
| **mod** | M03 |
| **name_vi** | Xem tổng quan danh mục theo phân hệ Logistic |
| **actors** | Group CEO · XBOS Catalog Admin · Data steward |
| **surfaces** | web-portal (Command Center / catalog admin) / xbos-cc / api |
| **srs_old** | `docs/logistics/BANG_TONG_HOP_USECASE_LOGISTIC.md` STT local 1–22 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` §2.B STT 98–119 |
| **srs_new** | **N/A-DELTA** — `SRS_VN.md` chưa có FR riêng khối XBOS-DM-LOG; thiết kế từ tên UC + bang tong hop + TECHSPEC_M03 |
| **tech_spec** | `docs/logistics/TECHSPEC_M03_DM_LOG_P1.md` §2 (pattern reuse M01) · `TECHSPEC_HE_SINH_THAI_XEVN.md` §7.1 / §8.1 catalog pattern — **chưa** logistics TechSpec sâu từng UC |
| **api_contract** | `GET/POST /api/xbos/config-sync/catalog*` · `POST /api/xbos/catalog-governance/*` · OpenAPI xbos-api DM export/import delta — mã lỗi scope `SCOPE_CONTEXT_MISMATCH` / `XBOS-AUTH-001` |
| **author** | qa · PO-UC-TC-W1-S4-DM-LOG |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_PARTIAL` — **không** = UAT PASS |
| **code_note** | BE: `GET /config-sync/catalogs` tồn tại; filter `log_dm_*` mô tả trong TECHSPEC_M03. Spec jest gắn cả 22 UC vào một call inbox — không chứng minh UI overview logistic. FE portal catalog admin logistic-specific: chưa spot-check → không claim full IMPL. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. Squad **W1-S4-DM-LOG**.

---

## 1. Mục tiêu UC (1 đoạn)

Người quản trị xem được bộ danh mục thuộc phân hệ Logistic (keys `log_dm_*` / assignment logistic), lọc theo công ty/tenant, nhận biết trạng thái publish/draft và số lượng giá trị — không mutate.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-01 | Mở tổng quan danh mục Logistic | Điều hướng đúng phân hệ và thấy danh sách nhóm DM | Catalog Admin |
| CAP-02 | Đọc chi tiết metadata nhóm | Xem version, số item, assignmentTargets | Catalog Admin |

**Đếm nghiệp vụ:** 2

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-01 | FN-OV-OPEN | Mở màn tổng quan DM Logistic | Portal → XBOS / Catalog · filter phân hệ Logistic | N |
| CAP-01 | FN-OV-FILTER | Lọc / tìm kiếm nhóm danh mục | ô tìm · filter status | N |
| CAP-02 | FN-OV-DETAIL | Mở chi tiết nhóm danh mục | click row → panel | N |

**Đếm chức năng:** 3

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-OV-OPEN | 1 | 1 | 1 | 0 | 1 | 4 |
| FN-OV-FILTER | 1 | 0 | 0 | 1 | 0 | 2 |
| FN-OV-DETAIL | 1 | 1 | 0 | 0 | 0 | 2 |
| **Tổng** | 3 | 2 | 1 | 1 | 1 | **8** |

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-DM-LOG-01-OV-OPEN-HP-001 | CAP-01 | FN-OV-OPEN | HP | P0 | ceo@xe.vn | Đã login tập đoàn; có ≥1 catalog key logistic (hoặc empty hợp lệ) | 1. Mở Portal catalog admin 2. Chọn phân hệ Logistic 3. Quan sát lưới nhóm DM | GET catalogs 2xx; lưới hiện nhóm `log_dm_*` hoặc empty state rõ; không banner ERROR | UI/API | BANG_TONG LOG-01 · TECHSPEC_M03 §2 List |
| TC-DM-LOG-01-OV-OPEN-UX-002 | CAP-01 | FN-OV-OPEN | UX | P0 | ceo@xe.vn | Tenant chưa có key logistic | 1. Mở tổng quan Logistic | Empty state hướng dẫn khai báo; không spinner vô hạn; không GET storm | UI | U65 FE-only · UX state |
| TC-DM-LOG-01-OV-OPEN-FD-003 | CAP-01 | FN-OV-OPEN | FD | P1 | ceo@xe.vn | Payload thiếu field bắt buộc / sai kiểu | 1. Gửi request/UI thiếu field bắt buộc theo contract | 4xx deterministic + message VI; không ghi partial; không 500 | API/UI | fail-deep contract |
| TC-DM-LOG-01-OV-OPEN-BD-004 | CAP-01 | FN-OV-OPEN | BD | P1 | ceo@xe.vn | Biên độ nhập (độ dài mã/tên, page size) | 1. Nhập đúng biên cho phép 2. Nhập vượt biên | Biên hợp lệ 2xx; vượt biên 4xx/validate | UI/API | boundary |
| TC-DM-LOG-01-OV-FILTER-HP-001 | CAP-01 | FN-OV-FILTER | HP | P1 | ceo@xe.vn | Có ≥2 nhóm DM | 1. Gõ mã/tên nhóm 2. Áp dụng filter draft/published | Lưới thu hẹp đúng; count khớp | UI | LOG-01 |
| TC-DM-LOG-01-OV-FILTER-AU-002 | CAP-01 | FN-OV-FILTER | AU | P0 | du-lich.ceo@xe.vn | Member CEO token scope CT thành viên | 1. Gọi list catalogs với companyId ngoài scope / rollup tập đoàn | 403/409 SCOPE — không lộ catalog holding ngoài quyền | API | ADR-GROUP-CEO · TECHSPEC_M03 §3 |
| TC-DM-LOG-01-OV-DETAIL-HP-001 | CAP-02 | FN-OV-DETAIL | HP | P0 | ceo@xe.vn | Có ≥1 nhóm trên list | 1. Click nhóm 2. Xem metadata version/checksum/targets | Detail load 2xx; `assignmentTargets` chứa logistic nếu đã gán; F5 giữ context | UI/API | LOG-01 · LOG-07 related |
| TC-DM-LOG-01-OV-DETAIL-FD-002 | CAP-02 | FN-OV-DETAIL | FD | P1 | ceo@xe.vn | catalogKey không tồn tại | 1. Deep link / GET by key giả | 404/4xx deterministic; UI lỗi rõ, không crash | UI/API | fail-deep |

---

## 6. Coverage check

| Check | Req | In design | GAP |
|-------|----------|-----------|-----|
| Mọi Cap có ≥1 FN | Y | Y | |
| Mọi FN mutate ≥1 HP + ≥1 FD | Y | N/A read-mostly | Sensitive/hierarchy nhánh có thể SPEC_GAP |
| Auth/scope nếu đa CT | Y | Y (AU cases) | |
| SPEC_GAP ghi rõ | Y | TechSpec mỏng M03 pattern; SRS_VN N/A-DELTA | logistics TechSpec sâu / FE HDSD LOG |

---

## 7. FE / BE / Role (đánh giá thiết kế — chưa UAT)

| Layer | Finding | Evidence (path/#) |
|-------|---------|-------------------|
| BE API/DTO | config-sync list catalogs — pattern OK; domain filter logistic cần xác nhận runtime | `TECHSPEC_M03_DM_LOG_P1.md` §2 · `catalog-governance` / `config-sync` |
| FE menu/nút/role | Portal CC moduleKey logistics có tab; màn «tổng quan DM LOG» riêng chưa neo HDSD | portal CC `moduleKey: logistics` (tab) — màn DM chi tiết cần HDSD |
| Mobile (nếu có) | N/A — XBOS catalog | — |
| RBAC / scope | Group CEO `main`/`holding` ADR; member CEO chỉ CT mình | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE |

**Verdict code_readiness:** `LIKELY_PARTIAL`

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: XBOS-DM-LOG-01
cases_designed: 8
code_readiness: LIKELY_PARTIAL
squad: W1-S4-DM-LOG
uat_done: false
```
