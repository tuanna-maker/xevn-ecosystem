# UC — `XBOS-DM-LOG-17` · Phát hành phiên bản danh mục mới

| Meta | Value |
|------|--------|
| **uc_id** | `XBOS-DM-LOG-17` |
| **stt_phase1** | 114 |
| **mod** | M03 |
| **name_vi** | Phát hành phiên bản danh mục mới |
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
| **code_note** | POST catalog-governance/publish → config-sync publish `XBOS-CFG-203`. G5 gate. Domain logistic items cần payload đúng. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. Squad **W1-S4-DM-LOG**.

---

## 1. Mục tiêu UC (1 đoạn)

Publish version mới (checksum) cho catalog key Logistic; spoke/consumer biết version mới.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-01 | Publish version | Chốt bản chuẩn hub | Group CEO |

**Đếm nghiệp vụ:** 1

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-01 | FN-PUBLISH | Phát hành phiên bản | Phát hành · xác nhận | Y |

**Đếm chức năng:** 1

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-PUBLISH | 1 | 2 | 2 | 2 | 1 | 8 |
| **Tổng** | 1 | 2 | 2 | 2 | 1 | **8** |

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-DM-LOG-17-PUBLISH-HP-001 | CAP-01 | FN-PUBLISH | HP | P0 | ceo@xe.vn | Draft changes sẵn; quyền publish | 1. Phát hành 2. Xác nhận | XBOS-CFG-203; version↑ + checksum; status PUBLISHED; F5 | UI/API | LOG-17 · TECHSPEC_HE §7.1 |
| TC-DM-LOG-17-PUBLISH-FD-002 | CAP-01 | FN-PUBLISH | FD | P0 | ceo@xe.vn | Items invalid / empty mandatory | 1. Publish | 4xx; version không tăng | API | FD |
| TC-DM-LOG-17-PUBLISH-AU-003 | CAP-01 | FN-PUBLISH | AU | P0 | member | Member | 1. Publish hub | 403/409 | API | AU |
| TC-DM-LOG-17-PUBLISH-UX-004 | CAP-01 | FN-PUBLISH | UX | P1 | ceo@xe.vn | Đang publish | 1. Double submit | Một version hoặc idempotent | UI | UX |
| TC-DM-LOG-17-PUBLISH-BD-005 | CAP-01 | FN-PUBLISH | BD | P2 | ceo@xe.vn | Publish không đổi nội dung | 1. Publish lại identical | No-op version hoặc version+1 documented | API | BD |
| TC-DM-LOG-17-PUBLISH-FD-006 | CAP-01 | FN-PUBLISH | FD | P1 | ceo@xe.vn | Payload thiếu field bắt buộc / sai kiểu | 1. Gửi request/UI thiếu field bắt buộc theo contract | 4xx deterministic + message VI; không ghi partial; không 500 | API/UI | fail-deep contract |
| TC-DM-LOG-17-PUBLISH-BD-007 | CAP-01 | FN-PUBLISH | BD | P1 | ceo@xe.vn | Biên độ nhập (độ dài mã/tên, page size) | 1. Nhập đúng biên cho phép 2. Nhập vượt biên | Biên hợp lệ 2xx; vượt biên 4xx/validate | UI/API | boundary |
| TC-DM-LOG-17-PUBLISH-AU-008 | CAP-01 | FN-PUBLISH | AU | P0 | anonymous / expired JWT | Không token hoặc token hết hạn | 1. Gọi API/UI thao tác UC | 401 XBOS-AUTH-001 hoặc redirect login; không lộ data | API | auth |

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
| BE API/DTO | publishCatalogVersion OK | `TECHSPEC_M03_DM_LOG_P1.md` §2 · `catalog-governance` / `config-sync` |
| FE menu/nút/role | Nút Phát hành phiên bản | portal CC `moduleKey: logistics` (tab) — màn DM chi tiết cần HDSD |
| Mobile (nếu có) | N/A | — |
| RBAC / scope | Group write/publish | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE |

**Verdict code_readiness:** `LIKELY_PARTIAL`

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: XBOS-DM-LOG-17
cases_designed: 8
code_readiness: LIKELY_PARTIAL
squad: W1-S4-DM-LOG
uat_done: false
```
