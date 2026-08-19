# UC — `XBOS-DM-LOG-19` · Kiểm tra danh mục thiếu trước vận hành

| Meta | Value |
|------|--------|
| **uc_id** | `XBOS-DM-LOG-19` |
| **stt_phase1** | 116 |
| **mod** | M03 |
| **name_vi** | Kiểm tra danh mục thiếu trước vận hành |
| **actors** | Catalog Admin · QA/DevOps gate · Group CEO |
| **surfaces** | web-portal (Command Center / catalog admin) / xbos-cc / api |
| **srs_old** | `docs/logistics/BANG_TONG_HOP_USECASE_LOGISTIC.md` STT local 1–22 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` §2.B STT 98–119 |
| **srs_new** | **N/A-DELTA** — `SRS_VN.md` chưa có FR riêng khối XBOS-DM-LOG; thiết kế từ tên UC + bang tong hop + TECHSPEC_M03 |
| **tech_spec** | `docs/logistics/TECHSPEC_M03_DM_LOG_P1.md` §2 (pattern reuse M01) · `TECHSPEC_HE_SINH_THAI_XEVN.md` §7.1 / §8.1 catalog pattern — **chưa** logistics TechSpec sâu từng UC |
| **api_contract** | `GET/POST /api/xbos/config-sync/catalog*` · `POST /api/xbos/catalog-governance/*` · OpenAPI xbos-api DM export/import delta — mã lỗi scope `SCOPE_CONTEXT_MISMATCH` / `XBOS-AUTH-001` |
| **author** | qa · PO-UC-TC-W1-S4-DM-LOG |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `UNKNOWN` — **không** = UAT PASS |
| **code_note** | TECHSPEC_M03: `pnpm verify:phase1:logistic-catalog` G4 evidence. Đây là gate script nhiều hơn UI — DESIGN vẫn có case UI nếu có màn «Kiểm tra»; readiness UNKNOWN đến khi script/UI được spot. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. Squad **W1-S4-DM-LOG**.

---

## 1. Mục tiêu UC (1 đoạn)

Chạy kiểm tra pre-op: thiếu key/bắt buộc / cardinality → báo cáo chặn vận hành Logistic.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-01 | Chạy kiểm tra thiếu DM | Gate trước go-live LOG | Admin |

**Đếm nghiệp vụ:** 1

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-01 | FN-PRECHECK | Pre-op catalog completeness check | Nút Kiểm tra / CLI verify | N |

**Đếm chức năng:** 1

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-PRECHECK | 1 | 2 | 1 | 2 | 2 | 8 |
| **Tổng** | 1 | 2 | 1 | 2 | 2 | **8** |

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-DM-LOG-19-PRECHECK-HP-001 | CAP-01 | FN-PRECHECK | HP | P0 | ceo@xe.vn / devops agent | Bundle LOG đủ | 1. Chạy kiểm tra (UI hoặc verify script) | PASS report; 0 missing mandatory keys | API/CLI | LOG-19 · TECHSPEC_M03 G4 |
| TC-DM-LOG-19-PRECHECK-FD-002 | CAP-01 | FN-PRECHECK | FD | P0 | admin | Cố ý thiếu key bắt buộc | 1. Chạy check | FAIL + danh sách key thiếu; exit ≠0 | CLI/API | FD missing |
| TC-DM-LOG-19-PRECHECK-UX-003 | CAP-01 | FN-PRECHECK | UX | P1 | ceo@xe.vn | UI có màn | 1. Xem báo cáo thiếu | Bảng key thiếu + CTA mở LOG-02/03 | UI | UX |
| TC-DM-LOG-19-PRECHECK-AU-004 | CAP-01 | FN-PRECHECK | AU | P1 | member | Member | 1. Chạy check toàn tập đoàn | Chỉ scope CT hoặc 403 | API | AU |
| TC-DM-LOG-19-PRECHECK-FD-005 | CAP-01 | FN-PRECHECK | FD | P1 | ceo@xe.vn | Payload thiếu field bắt buộc / sai kiểu | 1. Gửi request/UI thiếu field bắt buộc theo contract | 4xx deterministic + message VI; không ghi partial; không 500 | API/UI | fail-deep contract |
| TC-DM-LOG-19-PRECHECK-BD-006 | CAP-01 | FN-PRECHECK | BD | P1 | ceo@xe.vn | Biên độ nhập (độ dài mã/tên, page size) | 1. Nhập đúng biên cho phép 2. Nhập vượt biên | Biên hợp lệ 2xx; vượt biên 4xx/validate | UI/API | boundary |
| TC-DM-LOG-19-PRECHECK-AU-007 | CAP-01 | FN-PRECHECK | AU | P0 | anonymous / expired JWT | Không token hoặc token hết hạn | 1. Gọi API/UI thao tác UC | 401 XBOS-AUTH-001 hoặc redirect login; không lộ data | API | auth |
| TC-DM-LOG-19-PRECHECK-UX-008 | CAP-01 | FN-PRECHECK | UX | P1 | ceo@xe.vn | Network chậm / API error | 1. Thao tác khi BE 5xx hoặc timeout | Loading rồi error banner + retry; không trắng màn | UI | UX resilience |

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
| BE API/DTO | verify script G4 | `TECHSPEC_M03_DM_LOG_P1.md` §2 · `catalog-governance` / `config-sync` |
| FE menu/nút/role | Màn pre-op check — optional P1 | portal CC `moduleKey: logistics` (tab) — màn DM chi tiết cần HDSD |
| Mobile (nếu có) | N/A | — |
| RBAC / scope | Admin | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE |

**Verdict code_readiness:** `UNKNOWN`

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: XBOS-DM-LOG-19
cases_designed: 8
code_readiness: UNKNOWN
squad: W1-S4-DM-LOG
uat_done: false
```
