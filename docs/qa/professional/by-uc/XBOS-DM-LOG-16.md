# UC — `XBOS-DM-LOG-16` · Công ty con yêu cầu xóa trường — chuyển phê duyệt tập đoàn

| Meta | Value |
|------|--------|
| **uc_id** | `XBOS-DM-LOG-16` |
| **stt_phase1** | 113 |
| **mod** | M03 |
| **name_vi** | Công ty con yêu cầu xóa trường — chuyển phê duyệt tập đoàn |
| **actors** | Member admin · Group approver |
| **surfaces** | web-portal (Command Center / catalog admin) / xbos-cc / api |
| **srs_old** | `docs/logistics/BANG_TONG_HOP_USECASE_LOGISTIC.md` STT local 1–22 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` §2.B STT 98–119 |
| **srs_new** | **N/A-DELTA** — `SRS_VN.md` chưa có FR riêng khối XBOS-DM-LOG; thiết kế từ tên UC + bang tong hop + TECHSPEC_M03 |
| **tech_spec** | `docs/logistics/TECHSPEC_M03_DM_LOG_P1.md` §2 (pattern reuse M01) · `TECHSPEC_HE_SINH_THAI_XEVN.md` §7.1 / §8.1 catalog pattern — **chưa** logistics TechSpec sâu từng UC |
| **api_contract** | `GET/POST /api/xbos/config-sync/catalog*` · `POST /api/xbos/catalog-governance/*` · OpenAPI xbos-api DM export/import delta — mã lỗi scope `SCOPE_CONTEXT_MISMATCH` / `XBOS-AUTH-001` |
| **author** | qa · PO-UC-TC-W1-S4-DM-LOG |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `UNKNOWN` — **không** = UAT PASS |
| **code_note** | Pattern `hrm_catalog_field_removal_requests` — TECHSPEC_HE §7.2. Logistic removal plane **chưa** chứng minh riêng → UNKNOWN; hard-delete vẫn cấm. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. Squad **W1-S4-DM-LOG**.

---

## 1. Mục tiêu UC (1 đoạn)

CT con không tự xóa field hub; tạo removal request → group duyệt/từ chối; soft-delete only.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-01 | Yêu cầu xóa trường | Governance xóa field | Member admin |

**Đếm nghiệp vụ:** 1

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-01 | FN-REM-REQ | Tạo removal request | Yêu cầu xóa → gửi tập đoàn | Y |

**Đếm chức năng:** 1

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-REM-REQ | 3 | 3 | 2 | 2 | 2 | 12 |
| **Tổng** | 3 | 3 | 2 | 2 | 2 | **12** |

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-DM-LOG-16-REM-REQ-HP-001 | CAP-01 | FN-REM-REQ | HP | P0 | member admin | Field tồn tại trên CT | 1. Chọn field 2. Lý do 3. Gửi | pending; không xóa ngay; inbox group | UI/API | LOG-16 |
| TC-DM-LOG-16-REM-REQ-FD-002 | CAP-01 | FN-REM-REQ | FD | P0 | member | Field platform-locked / đang FK | 1. Xin xóa | Chặn hoặc approver thấy risk flag | UI/API | FD |
| TC-DM-LOG-16-REM-REQ-HP-003 | CAP-01 | FN-REM-REQ | HP | P0 | ceo@xe.vn | Removal pending | 1. Duyệt/Từ chối trên group | Duyệt → soft remove; Từ chối → giữ field + lý do | UI/API | LOG-16 · LOG-13 pattern |
| TC-DM-LOG-16-REM-REQ-AU-004 | CAP-01 | FN-REM-REQ | AU | P0 | member khác CT | Cross company | 1. Xóa field CT khác | 403/409 | API | AU |
| TC-DM-LOG-16-REM-REQ-UX-005 | CAP-01 | FN-REM-REQ | UX | P1 | member | After reject | 1. F5 list field | Field còn; trạng thái rejected visible | UI | UX |
| TC-DM-LOG-16-REM-REQ-FD-006 | CAP-01 | FN-REM-REQ | FD | P1 | ceo@xe.vn | Payload thiếu field bắt buộc / sai kiểu | 1. Gửi request/UI thiếu field bắt buộc theo contract | 4xx deterministic + message VI; không ghi partial; không 500 | API/UI | fail-deep contract |
| TC-DM-LOG-16-REM-REQ-BD-007 | CAP-01 | FN-REM-REQ | BD | P1 | ceo@xe.vn | Biên độ nhập (độ dài mã/tên, page size) | 1. Nhập đúng biên cho phép 2. Nhập vượt biên | Biên hợp lệ 2xx; vượt biên 4xx/validate | UI/API | boundary |
| TC-DM-LOG-16-REM-REQ-AU-008 | CAP-01 | FN-REM-REQ | AU | P0 | anonymous / expired JWT | Không token hoặc token hết hạn | 1. Gọi API/UI thao tác UC | 401 XBOS-AUTH-001 hoặc redirect login; không lộ data | API | auth |
| TC-DM-LOG-16-REM-REQ-UX-009 | CAP-01 | FN-REM-REQ | UX | P1 | ceo@xe.vn | Network chậm / API error | 1. Thao tác khi BE 5xx hoặc timeout | Loading rồi error banner + retry; không trắng màn | UI | UX resilience |
| TC-DM-LOG-16-REM-REQ-HP-010 | CAP-01 | FN-REM-REQ | HP | P1 | ceo@xe.vn | Sau thao tác chính thành công | 1. F5 hoặc navigate away/back 2. Đối chiếu dữ liệu | State bền; list/detail khớp API | UI | U65 F5 persistence |
| TC-DM-LOG-16-REM-REQ-FD-011 | CAP-01 | FN-REM-REQ | FD | P1 | ceo@xe.vn | Trạng thái nghiệp vụ không cho phép (draft/pending/locked) | 1. Thực hiện action ở trạng thái sai | Chặn + message BR; không side-effect | UI/API | fail-deep state |
| TC-DM-LOG-16-REM-REQ-BD-012 | CAP-01 | FN-REM-REQ | BD | P2 | ceo@xe.vn | Empty / max batch | 1. Thao tác với tập rỗng 2. Tập max theo docs | Empty xử lý rõ; max không crash | API | boundary volume |

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
| BE API/DTO | removal request + review | `TECHSPEC_M03_DM_LOG_P1.md` §2 · `catalog-governance` / `config-sync` |
| FE menu/nút/role | Yêu cầu xóa trường | portal CC `moduleKey: logistics` (tab) — màn DM chi tiết cần HDSD |
| Mobile (nếu có) | N/A | — |
| RBAC / scope | Member request; group decide | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE |

**Verdict code_readiness:** `UNKNOWN`

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: XBOS-DM-LOG-16
cases_designed: 12
code_readiness: UNKNOWN
squad: W1-S4-DM-LOG
uat_done: false
```
