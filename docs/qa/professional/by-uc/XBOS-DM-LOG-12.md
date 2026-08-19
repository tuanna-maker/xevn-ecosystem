# UC — `XBOS-DM-LOG-12` · Gửi phê duyệt khi sửa danh mục nhạy cảm

| Meta | Value |
|------|--------|
| **uc_id** | `XBOS-DM-LOG-12` |
| **stt_phase1** | 109 |
| **mod** | M03 |
| **name_vi** | Gửi phê duyệt khi sửa danh mục nhạy cảm |
| **actors** | Catalog Admin member/tenant · Workflow |
| **surfaces** | web-portal (Command Center / catalog admin) / xbos-cc / api |
| **srs_old** | `docs/logistics/BANG_TONG_HOP_USECASE_LOGISTIC.md` STT local 1–22 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` §2.B STT 98–119 |
| **srs_new** | **N/A-DELTA** — `SRS_VN.md` chưa có FR riêng khối XBOS-DM-LOG; thiết kế từ tên UC + bang tong hop + TECHSPEC_M03 |
| **tech_spec** | `docs/logistics/TECHSPEC_M03_DM_LOG_P1.md` §2 (pattern reuse M01) · `TECHSPEC_HE_SINH_THAI_XEVN.md` §7.1 / §8.1 catalog pattern — **chưa** logistics TechSpec sâu từng UC |
| **api_contract** | `GET/POST /api/xbos/config-sync/catalog*` · `POST /api/xbos/catalog-governance/*` · OpenAPI xbos-api DM export/import delta — mã lỗi scope `SCOPE_CONTEXT_MISMATCH` / `XBOS-AUTH-001` |
| **author** | qa · PO-UC-TC-W1-S4-DM-LOG |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_PARTIAL` — **không** = UAT PASS |
| **code_note** | TECHSPEC_M03: `catalog-governance/workflows/start` — pattern CAT/HRM. Jest chỉ smoke inbox gắn label 22 UC LOG. Sensitive flag per logistic key **SPEC_GAP** nếu chưa cấu hình. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. Squad **W1-S4-DM-LOG**.

---

## 1. Mục tiêu UC (1 đoạn)

Thay đổi DM nhạy cảm không apply ngay — tạo yêu cầu + workflow instance tới inbox phê duyệt tập đoàn.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-01 | Gửi yêu cầu duyệt thay đổi nhạy cảm | Governance trước khi publish | Catalog Admin |

**Đếm nghiệp vụ:** 1

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-01 | FN-SENS-SUBMIT | Submit change → WF start | Gửi phê duyệt | Y |

**Đếm chức năng:** 1

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-SENS-SUBMIT | 2 | 3 | 2 | 2 | 3 | 12 |
| **Tổng** | 2 | 3 | 2 | 2 | 3 | **12** |

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-DM-LOG-12-SENS-SUBMIT-HP-001 | CAP-01 | FN-SENS-SUBMIT | HP | P0 | HR/Catalog member role | Catalog marked sensitive; WF def tồn tại (tạo từ FE designer — U65) | 1. Sửa giá trị nhạy cảm 2. Gửi phê duyệt | XBOS-CAT-211/2xx; wi tạo; inbox group có task; giá trị chưa apply production | UI/API | LOG-12 · catalog-governance start |
| TC-DM-LOG-12-SENS-SUBMIT-FD-002 | CAP-01 | FN-SENS-SUBMIT | FD | P0 | admin | Thiếu WF definition | 1. Gửi duyệt | 4xx rõ «chưa cấu hình QT»; không silent apply | UI/API | FD no WF |
| TC-DM-LOG-12-SENS-SUBMIT-AU-003 | CAP-01 | FN-SENS-SUBMIT | AU | P0 | user vô quyền | Role không được sửa DM | 1. Submit | 403 | API | AU |
| TC-DM-LOG-12-SENS-SUBMIT-UX-004 | CAP-01 | FN-SENS-SUBMIT | UX | P0 | requester | Đã submit | 1. Xem trạng thái pending | Badge chờ duyệt; edit khóa | UI | UX SM |
| TC-DM-LOG-12-SENS-SUBMIT-FD-005 | CAP-01 | FN-SENS-SUBMIT | FD | P1 | requester | Pending tồn tại | 1. Submit trùng change | Chặn duplicate WI hoặc gộp — deterministic | API | FD dup |
| TC-DM-LOG-12-SENS-SUBMIT-FD-006 | CAP-01 | FN-SENS-SUBMIT | FD | P1 | ceo@xe.vn | Payload thiếu field bắt buộc / sai kiểu | 1. Gửi request/UI thiếu field bắt buộc theo contract | 4xx deterministic + message VI; không ghi partial; không 500 | API/UI | fail-deep contract |
| TC-DM-LOG-12-SENS-SUBMIT-BD-007 | CAP-01 | FN-SENS-SUBMIT | BD | P1 | ceo@xe.vn | Biên độ nhập (độ dài mã/tên, page size) | 1. Nhập đúng biên cho phép 2. Nhập vượt biên | Biên hợp lệ 2xx; vượt biên 4xx/validate | UI/API | boundary |
| TC-DM-LOG-12-SENS-SUBMIT-AU-008 | CAP-01 | FN-SENS-SUBMIT | AU | P0 | anonymous / expired JWT | Không token hoặc token hết hạn | 1. Gọi API/UI thao tác UC | 401 XBOS-AUTH-001 hoặc redirect login; không lộ data | API | auth |
| TC-DM-LOG-12-SENS-SUBMIT-UX-009 | CAP-01 | FN-SENS-SUBMIT | UX | P1 | ceo@xe.vn | Network chậm / API error | 1. Thao tác khi BE 5xx hoặc timeout | Loading rồi error banner + retry; không trắng màn | UI | UX resilience |
| TC-DM-LOG-12-SENS-SUBMIT-HP-010 | CAP-01 | FN-SENS-SUBMIT | HP | P1 | ceo@xe.vn | Sau thao tác chính thành công | 1. F5 hoặc navigate away/back 2. Đối chiếu dữ liệu | State bền; list/detail khớp API | UI | U65 F5 persistence |
| TC-DM-LOG-12-SENS-SUBMIT-BD-011 | CAP-01 | FN-SENS-SUBMIT | BD | P2 | ceo@xe.vn | Empty / max batch | 1. Thao tác với tập rỗng 2. Tập max theo docs | Empty xử lý rõ; max không crash | API | boundary volume |
| TC-DM-LOG-12-SENS-SUBMIT-UX-012 | CAP-01 | FN-SENS-SUBMIT | UX | P2 | ceo@xe.vn | Keyboard / screen reader | 1. Tab tới control chính 2. Kích hoạt bằng phím | Focus visible; control reachable | UI | a11y baseline |

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
| BE API/DTO | startCatalogApprovalWorkflow + HRM batches bridge | `TECHSPEC_M03_DM_LOG_P1.md` §2 · `catalog-governance` / `config-sync` |
| FE menu/nút/role | Gửi duyệt thay vì Lưu thẳng | portal CC `moduleKey: logistics` (tab) — màn DM chi tiết cần HDSD |
| Mobile (nếu có) | N/A | — |
| RBAC / scope | Requester member; approver group | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE |

**Verdict code_readiness:** `LIKELY_PARTIAL`

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: XBOS-DM-LOG-12
cases_designed: 12
code_readiness: LIKELY_PARTIAL
squad: W1-S4-DM-LOG
uat_done: false
```
