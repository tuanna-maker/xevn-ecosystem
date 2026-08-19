# UC — `XBOS-DM-LOG-03` · Thêm giá trị vào danh mục

| Meta | Value |
|------|--------|
| **uc_id** | `XBOS-DM-LOG-03` |
| **stt_phase1** | 100 |
| **mod** | M03 |
| **name_vi** | Thêm giá trị vào danh mục |
| **actors** | Catalog Admin · Data steward |
| **surfaces** | web-portal (Command Center / catalog admin) / xbos-cc / api |
| **srs_old** | `docs/logistics/BANG_TONG_HOP_USECASE_LOGISTIC.md` STT local 1–22 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` §2.B STT 98–119 |
| **srs_new** | **N/A-DELTA** — `SRS_VN.md` chưa có FR riêng khối XBOS-DM-LOG; thiết kế từ tên UC + bang tong hop + TECHSPEC_M03 |
| **tech_spec** | `docs/logistics/TECHSPEC_M03_DM_LOG_P1.md` §2 (pattern reuse M01) · `TECHSPEC_HE_SINH_THAI_XEVN.md` §7.1 / §8.1 catalog pattern — **chưa** logistics TechSpec sâu từng UC |
| **api_contract** | `GET/POST /api/xbos/config-sync/catalog*` · `POST /api/xbos/catalog-governance/*` · OpenAPI xbos-api DM export/import delta — mã lỗi scope `SCOPE_CONTEXT_MISMATCH` / `XBOS-AUTH-001` |
| **author** | qa · PO-UC-TC-W1-S4-DM-LOG |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_PARTIAL` — **không** = UAT PASS |
| **code_note** | TECHSPEC_M03: CRUD values via `POST …/catalog/{key}/publish` items[] — cùng XBOS-DM-03..05. Không API logistic riêng. FE thêm giá trị trên catalog panel generic = PARTIAL. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. Squad **W1-S4-DM-LOG**.

---

## 1. Mục tiêu UC (1 đoạn)

Thêm giá trị (code, label, sort, parent optional) vào nhóm DM Logistic đã có; giá trị usable sau publish/F5.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-01 | Thêm giá trị danh mục | Bổ sung mã dùng cho form Logistic | Catalog Admin |

**Đếm nghiệp vụ:** 1

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-01 | FN-VAL-ADD | Thêm giá trị vào nhóm | Chi tiết nhóm → Thêm giá trị → Lưu | Y |

**Đếm chức năng:** 1

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-VAL-ADD | 1 | 2 | 2 | 2 | 1 | 8 |
| **Tổng** | 1 | 2 | 2 | 2 | 1 | **8** |

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-DM-LOG-03-VAL-ADD-HP-001 | CAP-01 | FN-VAL-ADD | HP | P0 | ceo@xe.vn | Nhóm DM tồn tại (tạo từ LOG-02 hoặc đã có) | 1. Mở nhóm 2. Thêm code+label VI 3. Lưu/Publish theo UI | 2xx; giá trị hiện list; F5 còn | UI/API | LOG-03 · TECHSPEC_M03 |
| TC-DM-LOG-03-VAL-ADD-FD-002 | CAP-01 | FN-VAL-ADD | FD | P0 | ceo@xe.vn | Code trùng trong cùng key | 1. Thêm code trùng | 4xx; không ghi đè im lặng (trừ BR replace rõ) | UI/API | FD duplicate |
| TC-DM-LOG-03-VAL-ADD-BD-003 | CAP-01 | FN-VAL-ADD | BD | P1 | ceo@xe.vn | Form mở | 1. Label rỗng / code chỉ space | Validate chặn | UI/API | BD |
| TC-DM-LOG-03-VAL-ADD-AU-004 | CAP-01 | FN-VAL-ADD | AU | P0 | member CEO | Ngoài scope | 1. POST items companyId lệch JWT | SCOPE_CONTEXT_MISMATCH | API | ADR scope |
| TC-DM-LOG-03-VAL-ADD-UX-005 | CAP-01 | FN-VAL-ADD | UX | P1 | ceo@xe.vn | Nhóm locked pending approve (nếu WF) | 1. Thử thêm giá trị khi pending | UI khóa hoặc tạo change-request — không mutate lén | UI | LOG-12 related |
| TC-DM-LOG-03-VAL-ADD-FD-006 | CAP-01 | FN-VAL-ADD | FD | P1 | ceo@xe.vn | Payload thiếu field bắt buộc / sai kiểu | 1. Gửi request/UI thiếu field bắt buộc theo contract | 4xx deterministic + message VI; không ghi partial; không 500 | API/UI | fail-deep contract |
| TC-DM-LOG-03-VAL-ADD-BD-007 | CAP-01 | FN-VAL-ADD | BD | P1 | ceo@xe.vn | Biên độ nhập (độ dài mã/tên, page size) | 1. Nhập đúng biên cho phép 2. Nhập vượt biên | Biên hợp lệ 2xx; vượt biên 4xx/validate | UI/API | boundary |
| TC-DM-LOG-03-VAL-ADD-AU-008 | CAP-01 | FN-VAL-ADD | AU | P0 | anonymous / expired JWT | Không token hoặc token hết hạn | 1. Gọi API/UI thao tác UC | 401 XBOS-AUTH-001 hoặc redirect login; không lộ data | API | auth |

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
| BE API/DTO | publish items append — pattern | `TECHSPEC_M03_DM_LOG_P1.md` §2 · `catalog-governance` / `config-sync` |
| FE menu/nút/role | Form thêm giá trị trên catalog key | portal CC `moduleKey: logistics` (tab) — màn DM chi tiết cần HDSD |
| Mobile (nếu có) | N/A | — |
| RBAC / scope | Group write | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE |

**Verdict code_readiness:** `LIKELY_PARTIAL`

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: XBOS-DM-LOG-03
cases_designed: 8
code_readiness: LIKELY_PARTIAL
squad: W1-S4-DM-LOG
uat_done: false
```
