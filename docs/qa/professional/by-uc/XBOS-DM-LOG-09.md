# UC — `XBOS-DM-LOG-09` · Sao chép bộ danh mục sang công ty mới

| Meta | Value |
|------|--------|
| **uc_id** | `XBOS-DM-LOG-09` |
| **stt_phase1** | 106 |
| **mod** | M03 |
| **name_vi** | Sao chép bộ danh mục sang công ty mới |
| **actors** | Group CEO · Catalog Admin · DevOps (bootstrap) |
| **surfaces** | web-portal (Command Center / catalog admin) / xbos-cc / api |
| **srs_old** | `docs/logistics/BANG_TONG_HOP_USECASE_LOGISTIC.md` STT local 1–22 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` §2.B STT 98–119 |
| **srs_new** | **N/A-DELTA** — `SRS_VN.md` chưa có FR riêng khối XBOS-DM-LOG; thiết kế từ tên UC + bang tong hop + TECHSPEC_M03 |
| **tech_spec** | `docs/logistics/TECHSPEC_M03_DM_LOG_P1.md` §2 (pattern reuse M01) · `TECHSPEC_HE_SINH_THAI_XEVN.md` §7.1 / §8.1 catalog pattern — **chưa** logistics TechSpec sâu từng UC |
| **api_contract** | `POST /api/xbos/config-sync/catalogs/clone-bundle` (`XBOS-CFG-205`) · domains filter · onConflict fail\|skip\|overwrite · `XBOS-CFG-008/009` · `XBOS-AUTH-001/003` · scope `SCOPE_CONTEXT_MISMATCH` |
| **author** | qa · PO-UC-TC-W1-S4-DM-LOG |
| **design_status** | DESIGNED |
| **execution** | browser dest-reload · PO-UC-TC-W3-QA-LOG09-DEST-RELOAD-01 · `docs/qa/evidence/po-uc-tc-w3-qa-log09-dest-reload-01.md` · prior R2 `po-uc-tc-w3-qa-log09-r2.md` · BE scope `po-uc-tc-w3-be-log09-scope.md` |
| **code_readiness** | `LIKELY_IMPL` — browser HP/FD/AU (R2) + dest reload GET logistics **200 XBOS-CFG-201** (DEST-RELOAD-01) — **không** = full UAT PASS |
| **code_note** | QA DEST-RELOAD-01 2026-08-04 U65: CEO deep-link LOG-09; «Tải lại khóa đích» → 14× GET `companyId=logistics` **200 CFG-201**, **0** SCOPE 409; FE dest keys 12× `log_dm_*`. Residual R-LOG09-R2-DEST-GET-SCOPE **CLOSED**. Prior R2: HP CFG-205 + FD CFG-009 + AU PASS. `uat_done: false`. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. Squad **W1-S4-DM-LOG**.

---

## 1. Mục tiêu UC (1 đoạn)

Copy nguyên bộ DM Logistic từ CT nguồn sang CT đích mới (onboarding) mà không nhân bản tay từng giá trị.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-01 | Sao chép bộ DM | Onboard CT mới nhanh | Group CEO |

**Đếm nghiệp vụ:** 1

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-01 | FN-COPY-BUNDLE | Copy catalog bundle CT→CT | Sao chép bộ danh mục | Y |

**Đếm chức năng:** 1

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-COPY-BUNDLE | 1 | 2 | 2 | 2 | 1 | 8 |
| **Tổng** | 1 | 2 | 2 | 2 | 1 | **8** |

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-DM-LOG-09-COPY-BUNDLE-HP-001 | CAP-01 | FN-COPY-BUNDLE | HP | P0 | ceo@xe.vn | CT nguồn có bộ LOG; CT đích trống | 1. Chọn nguồn 2. Chọn đích 3. Xác nhận copy | 2xx; đích có đủ keys/items; F5; nguồn không đổi | UI/API | LOG-09 · R2 PASS · dest reload DEST-RELOAD-01 **PASS** (GET logistics CFG-201) |
| TC-DM-LOG-09-COPY-BUNDLE-FD-002 | CAP-01 | FN-COPY-BUNDLE | FD | P0 | ceo@xe.vn | Đích đã có conflict keys | 1. Copy đè | Merge policy rõ (skip/overwrite) hoặc chặn; không half-copy | API | FD conflict |
| TC-DM-LOG-09-COPY-BUNDLE-BD-003 | CAP-01 | FN-COPY-BUNDLE | BD | P2 | ceo@xe.vn | Bundle lớn | 1. Copy full 183-subset logistic | Timeout/progress UX; không 500 im lặng | UI/API | BD size |
| TC-DM-LOG-09-COPY-BUNDLE-AU-004 | CAP-01 | FN-COPY-BUNDLE | AU | P0 | member | Member | 1. Copy sang CT khác | 403/409 | API | AU |
| TC-DM-LOG-09-COPY-BUNDLE-UX-005 | CAP-01 | FN-COPY-BUNDLE | UX | P1 | ceo@xe.vn | Job async | 1. Theo dõi tiến độ copy | Trạng thái running/done/fail | UI | UX |
| TC-DM-LOG-09-COPY-BUNDLE-FD-006 | CAP-01 | FN-COPY-BUNDLE | FD | P1 | ceo@xe.vn | Payload thiếu field bắt buộc / sai kiểu | 1. Gửi request/UI thiếu field bắt buộc theo contract | 4xx deterministic + message VI; không ghi partial; không 500 | API/UI | fail-deep contract |
| TC-DM-LOG-09-COPY-BUNDLE-BD-007 | CAP-01 | FN-COPY-BUNDLE | BD | P1 | ceo@xe.vn | Biên độ nhập (độ dài mã/tên, page size) | 1. Nhập đúng biên cho phép 2. Nhập vượt biên | Biên hợp lệ 2xx; vượt biên 4xx/validate | UI/API | boundary |
| TC-DM-LOG-09-COPY-BUNDLE-AU-008 | CAP-01 | FN-COPY-BUNDLE | AU | P0 | anonymous / expired JWT | Không token hoặc token hết hạn | 1. Gọi API/UI thao tác UC | 401 XBOS-AUTH-001 hoặc redirect login; không lộ data | API | auth |

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
| BE API/DTO | Live: CFG-205 overwrite 92 keys; CFG-009 fail; VAL-013; AUTH-001/003 | evidence `po-uc-tc-w3-qa-log09.md` · BE `po-uc-tc-w3-be-log09.md` |
| FE menu/nút/role | Browser R2 HP/FD/AU PASS; DEST-RELOAD-01 «Tải lại khóa đích» PASS (CFG-201 + dest keys) | evidence `po-uc-tc-w3-qa-log09-dest-reload-01.md` · R2 `po-uc-tc-w3-qa-log09-r2.md` |
| Mobile (nếu có) | N/A | — |
| RBAC / scope | Group CEO clone OK; member FE AU block; spot-GET `companyId=logistics` under JWT main → **200 XBOS-CFG-201** (BE LOG09-SCOPE + QA DEST-RELOAD-01) | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE · residual R-LOG09-R2-DEST-GET-SCOPE **CLOSED** |

**Verdict code_readiness:** `LIKELY_IMPL` (browser HP/FD/AU + dest reload PASS; design≠UAT; `uat_done: false`)

---

## 8. Handoff

```
ack_status: PASS_TO_PM
uc_id: XBOS-DM-LOG-09
cases_designed: 8
code_readiness: LIKELY_IMPL
squad: W1-S4-DM-LOG
work_item_id: PO-UC-TC-W3-QA-LOG09-DEST-RELOAD-01
uat_done: false
evidence_path: docs/qa/evidence/po-uc-tc-w3-qa-log09-dest-reload-01.md
residual_closed: R-LOG09-R2-DEST-GET-SCOPE
next: PM intake → next open P0 backlog (not re-open dest reload)
```
