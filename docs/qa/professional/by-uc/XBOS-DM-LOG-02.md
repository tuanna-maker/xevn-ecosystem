# UC — `XBOS-DM-LOG-02` · Tạo nhóm danh mục mới

| Meta | Value |
|------|--------|
| **uc_id** | `XBOS-DM-LOG-02` |
| **stt_phase1** | 99 |
| **mod** | M03 |
| **name_vi** | Tạo nhóm danh mục mới |
| **actors** | Group CEO · Catalog Admin |
| **surfaces** | web-portal (Command Center / catalog admin) / xbos-cc / api |
| **srs_old** | `docs/logistics/BANG_TONG_HOP_USECASE_LOGISTIC.md` STT local 1–22 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` §2.B STT 98–119 |
| **srs_new** | **N/A-DELTA** — `SRS_VN.md` chưa có FR riêng khối XBOS-DM-LOG; thiết kế từ tên UC + bang tong hop + TECHSPEC_M03 |
| **tech_spec** | `docs/logistics/TECHSPEC_M03_DM_LOG_P1.md` §2 (pattern reuse M01) · `TECHSPEC_HE_SINH_THAI_XEVN.md` §7.1 / §8.1 catalog pattern — **chưa** logistics TechSpec sâu từng UC |
| **api_contract** | `GET/POST /api/xbos/config-sync/catalog*` · `POST /api/xbos/catalog-governance/*` · OpenAPI xbos-api DM export/import delta — mã lỗi scope `SCOPE_CONTEXT_MISMATCH` / `XBOS-AUTH-001` |
| **author** | qa · PO-UC-TC-W1-S4-DM-LOG |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_PARTIAL` — **không** = UAT PASS |
| **code_note** | Publish/create catalog qua config-sync pattern M01; TECHSPEC_M03 map LOG-02 vào CRUD publish — không có DTO/UI riêng «Tạo nhóm LOG». code_readiness PARTIAL; FE tạo nhóm logistic có thể GAP. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. Squad **W1-S4-DM-LOG**.

---

## 1. Mục tiêu UC (1 đoạn)

Tạo nhóm danh mục mới thuộc miền Logistic (mã, tên, mô tả, domain) trên hub XBOS; sau lưu thấy trên tổng quan và F5 còn.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-01 | Tạo nhóm DM mới | Đăng ký nhóm master cho Logistic | Catalog Admin |

**Đếm nghiệp vụ:** 1

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-01 | FN-GRP-CREATE | Lưu nhóm danh mục mới | Nút Thêm nhóm · form mã/tên/domain | Y |

**Đếm chức năng:** 1

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-GRP-CREATE | 1 | 2 | 2 | 2 | 1 | 8 |
| **Tổng** | 1 | 2 | 2 | 2 | 1 | **8** |

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-DM-LOG-02-GRP-CREATE-HP-001 | CAP-01 | FN-GRP-CREATE | HP | P0 | ceo@xe.vn | Quyền admin catalog; mã chưa tồn tại | 1. Thêm nhóm 2. Nhập mã `log_dm_*` hợp lệ + tên VI 3. Domain/logistic 4. Lưu | 2xx; row xuất hiện trên tổng quan; F5 còn; không seed ngoài FE | UI/API | LOG-02 · TECHSPEC_M03 CRUD |
| TC-DM-LOG-02-GRP-CREATE-FD-002 | CAP-01 | FN-GRP-CREATE | FD | P0 | ceo@xe.vn | Mã đã tồn tại hoặc thiếu mã bắt buộc | 1. Submit trùng mã / bỏ trống tên | 4xx validate; không tạo bản ghi; toast/inline lỗi | UI/API | fail-deep validate |
| TC-DM-LOG-02-GRP-CREATE-BD-003 | CAP-01 | FN-GRP-CREATE | BD | P1 | ceo@xe.vn | Form mở | 1. Mã max length / ký tự đặc biệt / khoảng trắng | Chặn hoặc normalize theo BR; không 500 | UI/API | boundary |
| TC-DM-LOG-02-GRP-CREATE-AU-004 | CAP-01 | FN-GRP-CREATE | AU | P0 | du-lich.ceo@xe.vn | Member CEO | 1. Thử tạo nhóm holding/logistic toàn tập đoàn | 403/409 — không tạo được nhóm tập đoàn | API | scope |
| TC-DM-LOG-02-GRP-CREATE-UX-005 | CAP-01 | FN-GRP-CREATE | UX | P1 | ceo@xe.vn | Submit đang pending | 1. Double-click Lưu | Idempotent / disabled button; không 2 row trùng | UI | UX |
| TC-DM-LOG-02-GRP-CREATE-FD-006 | CAP-01 | FN-GRP-CREATE | FD | P1 | ceo@xe.vn | Payload thiếu field bắt buộc / sai kiểu | 1. Gửi request/UI thiếu field bắt buộc theo contract | 4xx deterministic + message VI; không ghi partial; không 500 | API/UI | fail-deep contract |
| TC-DM-LOG-02-GRP-CREATE-BD-007 | CAP-01 | FN-GRP-CREATE | BD | P1 | ceo@xe.vn | Biên độ nhập (độ dài mã/tên, page size) | 1. Nhập đúng biên cho phép 2. Nhập vượt biên | Biên hợp lệ 2xx; vượt biên 4xx/validate | UI/API | boundary |
| TC-DM-LOG-02-GRP-CREATE-AU-008 | CAP-01 | FN-GRP-CREATE | AU | P0 | anonymous / expired JWT | Không token hoặc token hết hạn | 1. Gọi API/UI thao tác UC | 401 XBOS-AUTH-001 hoặc redirect login; không lộ data | API | auth |

---

## 6. Coverage check

| Check | Req | In design | GAP |
|-------|----------|-----------|-----|
| Mọi Cap có ≥1 FN | Y | Y | |
| Mọi FN mutate ≥1 HP + ≥1 FD | Y | Y (mutate FNs) | Sensitive/hierarchy nhánh có thể SPEC_GAP |
| Auth/scope nếu đa CT | Y | Y (AU cases) | |
| SPEC_GAP ghi rõ | Y | TechSpec mỏng M03 pattern; SRS_VN N/A-DELTA | logistics TechSpec sâu / FE HDSD LOG |

---

## 7. FE / BE / Role (đánh giá thiết kế — chưa UAT)

| Layer | Finding | Evidence (path/#) |
|-------|---------|-------------------|
| BE API/DTO | POST publish / catalog upsert pattern — generic | `TECHSPEC_M03_DM_LOG_P1.md` §2 · `catalog-governance` / `config-sync` |
| FE menu/nút/role | Form tạo nhóm domain=logistic — cần xác nhận menu HDSD | portal CC `moduleKey: logistics` (tab) — màn DM chi tiết cần HDSD |
| Mobile (nếu có) | N/A | — |
| RBAC / scope | Chỉ group write scope | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE |

**Verdict code_readiness:** `LIKELY_PARTIAL`

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: XBOS-DM-LOG-02
cases_designed: 8
code_readiness: LIKELY_PARTIAL
squad: W1-S4-DM-LOG
uat_done: false
```
