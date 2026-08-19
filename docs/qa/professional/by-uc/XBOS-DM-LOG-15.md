# UC — `XBOS-DM-LOG-15` · Công ty con yêu cầu bổ sung trường danh mục

| Meta | Value |
|------|--------|
| **uc_id** | `XBOS-DM-LOG-15` |
| **stt_phase1** | 112 |
| **mod** | M03 |
| **name_vi** | Công ty con yêu cầu bổ sung trường danh mục |
| **actors** | Member Catalog/HR Admin · Group approver |
| **surfaces** | web-portal (Command Center / catalog admin) / xbos-cc / api |
| **srs_old** | `docs/logistics/BANG_TONG_HOP_USECASE_LOGISTIC.md` STT local 1–22 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` §2.B STT 98–119 |
| **srs_new** | **N/A-DELTA** — `SRS_VN.md` chưa có FR riêng khối XBOS-DM-LOG; thiết kế từ tên UC + bang tong hop + TECHSPEC_M03 |
| **tech_spec** | `docs/logistics/TECHSPEC_M03_DM_LOG_P1.md` §2 (pattern reuse M01) · `TECHSPEC_HE_SINH_THAI_XEVN.md` §7.1 / §8.1 catalog pattern — **chưa** logistics TechSpec sâu từng UC |
| **api_contract** | `GET/POST /api/xbos/config-sync/catalog*` · `POST /api/xbos/catalog-governance/*` · OpenAPI xbos-api DM export/import delta — mã lỗi scope `SCOPE_CONTEXT_MISMATCH` / `XBOS-AUTH-001` |
| **author** | qa · PO-UC-TC-W1-S4-DM-LOG |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `UNKNOWN` — **không** = UAT PASS |
| **code_note** | TECHSPEC_M03 map `catalog-governance/extension-requests` — hiện bridge mạnh sang HRM settings-catalogs. Extension **Logistic** field có thể chưa tách domain → UNKNOWN/GAP vs HRM CAT-EXT. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. Squad **W1-S4-DM-LOG**.

---

## 1. Mục tiêu UC (1 đoạn)

CT thành viên tạo yêu cầu thêm field/giá trị mở rộng cho DM Logistic; chuyển duyệt tập đoàn (tương tự extension HRM).

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-01 | Tạo yêu cầu bổ sung trường | Tenant extension không tự ý đổi hub | Member admin |

**Đếm nghiệp vụ:** 1

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-01 | FN-EXT-REQ | Submit extension request | Yêu cầu bổ sung trường | Y |

**Đếm chức năng:** 1

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-EXT-REQ | 2 | 3 | 2 | 2 | 3 | 12 |
| **Tổng** | 2 | 3 | 2 | 2 | 3 | **12** |

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-DM-LOG-15-EXT-REQ-HP-001 | CAP-01 | FN-EXT-REQ | HP | P0 | member admin | Quyền yêu cầu; catalog LOG gán CT | 1. Điền field đề xuất 2. Gửi | 2xx; request pending; group inbox có việc (chuỗi FE) | UI/API | LOG-15 · extension-requests |
| TC-DM-LOG-15-EXT-REQ-FD-002 | CAP-01 | FN-EXT-REQ | FD | P0 | member | Thiếu tên field / trùng | 1. Submit invalid | 4xx validate | UI/API | FD |
| TC-DM-LOG-15-EXT-REQ-AU-003 | CAP-01 | FN-EXT-REQ | AU | P0 | NV thường | Không role | 1. POST extension | 403 | API | AU |
| TC-DM-LOG-15-EXT-REQ-UX-004 | CAP-01 | FN-EXT-REQ | UX | P1 | member | Pending | 1. Xem list yêu cầu của CT | Trạng thái rõ; không edit hub trực tiếp | UI | UX |
| TC-DM-LOG-15-EXT-REQ-FD-005 | CAP-01 | FN-EXT-REQ | FD | P1 | ceo@xe.vn | Payload thiếu field bắt buộc / sai kiểu | 1. Gửi request/UI thiếu field bắt buộc theo contract | 4xx deterministic + message VI; không ghi partial; không 500 | API/UI | fail-deep contract |
| TC-DM-LOG-15-EXT-REQ-BD-006 | CAP-01 | FN-EXT-REQ | BD | P1 | ceo@xe.vn | Biên độ nhập (độ dài mã/tên, page size) | 1. Nhập đúng biên cho phép 2. Nhập vượt biên | Biên hợp lệ 2xx; vượt biên 4xx/validate | UI/API | boundary |
| TC-DM-LOG-15-EXT-REQ-AU-007 | CAP-01 | FN-EXT-REQ | AU | P0 | anonymous / expired JWT | Không token hoặc token hết hạn | 1. Gọi API/UI thao tác UC | 401 XBOS-AUTH-001 hoặc redirect login; không lộ data | API | auth |
| TC-DM-LOG-15-EXT-REQ-UX-008 | CAP-01 | FN-EXT-REQ | UX | P1 | ceo@xe.vn | Network chậm / API error | 1. Thao tác khi BE 5xx hoặc timeout | Loading rồi error banner + retry; không trắng màn | UI | UX resilience |
| TC-DM-LOG-15-EXT-REQ-HP-009 | CAP-01 | FN-EXT-REQ | HP | P1 | ceo@xe.vn | Sau thao tác chính thành công | 1. F5 hoặc navigate away/back 2. Đối chiếu dữ liệu | State bền; list/detail khớp API | UI | U65 F5 persistence |
| TC-DM-LOG-15-EXT-REQ-FD-010 | CAP-01 | FN-EXT-REQ | FD | P1 | ceo@xe.vn | Trạng thái nghiệp vụ không cho phép (draft/pending/locked) | 1. Thực hiện action ở trạng thái sai | Chặn + message BR; không side-effect | UI/API | fail-deep state |
| TC-DM-LOG-15-EXT-REQ-BD-011 | CAP-01 | FN-EXT-REQ | BD | P2 | ceo@xe.vn | Empty / max batch | 1. Thao tác với tập rỗng 2. Tập max theo docs | Empty xử lý rõ; max không crash | API | boundary volume |
| TC-DM-LOG-15-EXT-REQ-UX-012 | CAP-01 | FN-EXT-REQ | UX | P2 | ceo@xe.vn | Keyboard / screen reader | 1. Tab tới control chính 2. Kích hoạt bằng phím | Focus visible; control reachable | UI | a11y baseline |

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
| BE API/DTO | extension-requests — HRM-centric | `TECHSPEC_M03_DM_LOG_P1.md` §2 · `catalog-governance` / `config-sync` |
| FE menu/nút/role | Form yêu cầu bổ sung field LOG — UNKNOWN | portal CC `moduleKey: logistics` (tab) — màn DM chi tiết cần HDSD |
| Mobile (nếu có) | N/A | — |
| RBAC / scope | Member create; group approve | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE |

**Verdict code_readiness:** `UNKNOWN`

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: XBOS-DM-LOG-15
cases_designed: 12
code_readiness: UNKNOWN
squad: W1-S4-DM-LOG
uat_done: false
```
