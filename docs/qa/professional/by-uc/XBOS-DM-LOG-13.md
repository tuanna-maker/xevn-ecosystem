# UC — `XBOS-DM-LOG-13` · Phê duyệt hoặc từ chối thay đổi danh mục

| Meta | Value |
|------|--------|
| **uc_id** | `XBOS-DM-LOG-13` |
| **stt_phase1** | 110 |
| **mod** | M03 |
| **name_vi** | Phê duyệt hoặc từ chối thay đổi danh mục |
| **actors** | Group CEO · Approver catalog governance |
| **surfaces** | web-portal (Command Center / catalog admin) / xbos-cc / api |
| **srs_old** | `docs/logistics/BANG_TONG_HOP_USECASE_LOGISTIC.md` STT local 1–22 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` §2.B STT 98–119 |
| **srs_new** | **N/A-DELTA** — `SRS_VN.md` chưa có FR riêng khối XBOS-DM-LOG; thiết kế từ tên UC + bang tong hop + TECHSPEC_M03 |
| **tech_spec** | `docs/logistics/TECHSPEC_M03_DM_LOG_P1.md` §2 (pattern reuse M01) · `TECHSPEC_HE_SINH_THAI_XEVN.md` §7.1 / §8.1 catalog pattern — **chưa** logistics TechSpec sâu từng UC |
| **api_contract** | `GET/POST /api/xbos/config-sync/catalog*` · `POST /api/xbos/catalog-governance/*` · OpenAPI xbos-api DM export/import delta — mã lỗi scope `SCOPE_CONTEXT_MISMATCH` / `XBOS-AUTH-001` |
| **author** | qa · PO-UC-TC-W1-S4-DM-LOG |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_PARTIAL` — **không** = UAT PASS |
| **code_note** | catalog-governance approve/reject + inbox `XBOS-CAT-212`. Plane dùng chung HRM extension; logistic-specific task type chưa tách rõ → PARTIAL. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. Squad **W1-S4-DM-LOG**.

---

## 1. Mục tiêu UC (1 đoạn)

Approver xử lý task inbox: duyệt → apply/publish; từ chối → lý do, requester thấy rejected.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-01 | Duyệt thay đổi | Apply sau governance | Group CEO |
| CAP-02 | Từ chối thay đổi | Không apply + feedback | Group CEO |

**Đếm nghiệp vụ:** 2

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-01 | FN-APPR-OK | Phê duyệt task catalog | Inbox → Duyệt | Y |
| CAP-02 | FN-APPR-REJ | Từ chối + lý do | Inbox → Từ chối | Y |

**Đếm chức năng:** 2

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-APPR-OK | 2 | 2 | 2 | 2 | 1 | 9 |
| FN-APPR-REJ | 1 | 1 | 0 | 0 | 1 | 3 |
| **Tổng** | 3 | 3 | 2 | 2 | 2 | **12** |

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-DM-LOG-13-APPR-OK-HP-001 | CAP-01 | FN-APPR-OK | HP | P0 | ceo@xe.vn | Task pending từ LOG-12 (chuỗi FE) | 1. Mở inbox 2. Mở task 3. Duyệt | 2xx; catalog applied/published; F5 requester thấy giá trị mới | UI/API | LOG-13 · XBOS-CAT approve |
| TC-DM-LOG-13-APPR-OK-AU-002 | CAP-01 | FN-APPR-OK | AU | P0 | ceo@ holding mismatch | JWT companyId lệch query | 1. Approve với scope mismatch | SCOPE_CONTEXT_MISMATCH — đã có unit test pattern | API | catalog-governance.controller.spec |
| TC-DM-LOG-13-APPR-OK-FD-003 | CAP-01 | FN-APPR-OK | FD | P1 | ceo@xe.vn | Payload thiếu field bắt buộc / sai kiểu | 1. Gửi request/UI thiếu field bắt buộc theo contract | 4xx deterministic + message VI; không ghi partial; không 500 | API/UI | fail-deep contract |
| TC-DM-LOG-13-APPR-OK-BD-004 | CAP-01 | FN-APPR-OK | BD | P1 | ceo@xe.vn | Biên độ nhập (độ dài mã/tên, page size) | 1. Nhập đúng biên cho phép 2. Nhập vượt biên | Biên hợp lệ 2xx; vượt biên 4xx/validate | UI/API | boundary |
| TC-DM-LOG-13-APPR-OK-AU-005 | CAP-01 | FN-APPR-OK | AU | P0 | anonymous / expired JWT | Không token hoặc token hết hạn | 1. Gọi API/UI thao tác UC | 401 XBOS-AUTH-001 hoặc redirect login; không lộ data | API | auth |
| TC-DM-LOG-13-APPR-OK-UX-006 | CAP-01 | FN-APPR-OK | UX | P1 | ceo@xe.vn | Network chậm / API error | 1. Thao tác khi BE 5xx hoặc timeout | Loading rồi error banner + retry; không trắng màn | UI | UX resilience |
| TC-DM-LOG-13-APPR-OK-HP-007 | CAP-01 | FN-APPR-OK | HP | P1 | ceo@xe.vn | Sau thao tác chính thành công | 1. F5 hoặc navigate away/back 2. Đối chiếu dữ liệu | State bền; list/detail khớp API | UI | U65 F5 persistence |
| TC-DM-LOG-13-APPR-OK-FD-008 | CAP-01 | FN-APPR-OK | FD | P1 | ceo@xe.vn | Trạng thái nghiệp vụ không cho phép (draft/pending/locked) | 1. Thực hiện action ở trạng thái sai | Chặn + message BR; không side-effect | UI/API | fail-deep state |
| TC-DM-LOG-13-APPR-OK-BD-009 | CAP-01 | FN-APPR-OK | BD | P2 | ceo@xe.vn | Empty / max batch | 1. Thao tác với tập rỗng 2. Tập max theo docs | Empty xử lý rõ; max không crash | API | boundary volume |
| TC-DM-LOG-13-APPR-REJ-HP-001 | CAP-02 | FN-APPR-REJ | HP | P0 | ceo@xe.vn | Task pending | 1. Từ chối + lý do bắt buộc 2. F5 requester | rejected; production catalog không đổi; lý do visible | UI/API | LOG-13 |
| TC-DM-LOG-13-APPR-REJ-FD-002 | CAP-02 | FN-APPR-REJ | FD | P0 | ceo@xe.vn | Form từ chối | 1. Reject thiếu lý do | Validate chặn | UI/API | FD |
| TC-DM-LOG-13-APPR-REJ-UX-003 | CAP-02 | FN-APPR-REJ | UX | P1 | approver | Task đã xử lý | 1. Approve lại | Idempotent / 4xx already completed | UI/API | UX SM |

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
| BE API/DTO | actOnTask approve/reject · scope main/holding | `TECHSPEC_M03_DM_LOG_P1.md` §2 · `catalog-governance` / `config-sync` |
| FE menu/nút/role | CC Inbox Xử lý nhanh | portal CC `moduleKey: logistics` (tab) — màn DM chi tiết cần HDSD |
| Mobile (nếu có) | N/A | — |
| RBAC / scope | Approver JWT scope | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE |

**Verdict code_readiness:** `LIKELY_PARTIAL`

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: XBOS-DM-LOG-13
cases_designed: 12
code_readiness: LIKELY_PARTIAL
squad: W1-S4-DM-LOG
uat_done: false
```
