# UC — `XBOS-DM-LOG-20` · Khai báo đủ 3 tầng dịch vụ vận tải

| Meta | Value |
|------|--------|
| **uc_id** | `XBOS-DM-LOG-20` |
| **stt_phase1** | 117 |
| **mod** | M03 |
| **name_vi** | Khai báo đủ 3 tầng dịch vụ vận tải |
| **actors** | Catalog Admin · Data steward |
| **surfaces** | web-portal (Command Center / catalog admin) / xbos-cc / api |
| **srs_old** | `docs/logistics/BANG_TONG_HOP_USECASE_LOGISTIC.md` STT local 1–22 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` §2.B STT 98–119 |
| **srs_new** | **N/A-DELTA** — `SRS_VN.md` chưa có FR riêng khối XBOS-DM-LOG; thiết kế từ tên UC + bang tong hop + TECHSPEC_M03 |
| **tech_spec** | `docs/logistics/TECHSPEC_M03_DM_LOG_P1.md` §2 (pattern reuse M01) · `TECHSPEC_HE_SINH_THAI_XEVN.md` §7.1 / §8.1 catalog pattern — **chưa** logistics TechSpec sâu từng UC |
| **api_contract** | `GET/POST /api/xbos/config-sync/catalog*` · `POST /api/xbos/catalog-governance/*` · OpenAPI xbos-api DM export/import delta — mã lỗi scope `SCOPE_CONTEXT_MISMATCH` / `XBOS-AUTH-001` |
| **author** | qa · PO-UC-TC-W1-S4-DM-LOG |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `UNKNOWN` — **không** = UAT PASS |
| **code_note** | TECHSPEC_M03: seed defs `seed:phase1:logistic-catalog` cardinality. U65: nghiệm thu sau này phải từ FE khai báo, không lấy seed evidence. Hiện **UNKNOWN** FE wizard 3 tầng. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. Squad **W1-S4-DM-LOG**.

---

## 1. Mục tiêu UC (1 đoạn)

Đảm bảo cây dịch vụ vận tải đủ 3 tầng (nhóm → loại → sản phẩm/dịch vụ) theo cardinality seed/BR; thiếu tầng = không PASS pre-op.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-01 | Khai báo 3 tầng dịch vụ | Master dịch vụ đủ sâu cho báo giá/điều phối P2 | Data steward |

**Đếm nghiệp vụ:** 1

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-01 | FN-SVC-3T | Tạo/đủ cây 3 tầng dịch vụ vận tải | Tree dịch vụ · thêm cấp | Y |

**Đếm chức năng:** 1

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-SVC-3T | 1 | 2 | 2 | 2 | 1 | 8 |
| **Tổng** | 1 | 2 | 2 | 2 | 1 | **8** |

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-DM-LOG-20-SVC-3T-HP-001 | CAP-01 | FN-SVC-3T | HP | P0 | ceo@xe.vn | Nhóm dịch vụ LOG tồn tại | 1. Tạo tầng 1–2–3 đủ quan hệ 2. Lưu/Publish 3. Chạy LOG-19 | Cardinality PASS; cây hiển thị 3 cấp; F5 | UI/API | LOG-20 · seed cardinality (design≠seed evidence) |
| TC-DM-LOG-20-SVC-3T-FD-002 | CAP-01 | FN-SVC-3T | FD | P0 | admin | Chỉ 2 tầng | 1. Publish / precheck | FAIL thiếu tầng 3; không claim đủ | API/CLI | FD incomplete |
| TC-DM-LOG-20-SVC-3T-BD-003 | CAP-01 | FN-SVC-3T | BD | P1 | admin | Cây | 1. Thêm tầng 4 | Chặn >3 hoặc BR documented | UI/API | BD depth |
| TC-DM-LOG-20-SVC-3T-AU-004 | CAP-01 | FN-SVC-3T | AU | P0 | member | Sai scope | 1. Sửa cây hub | 403/409 | API | AU |
| TC-DM-LOG-20-SVC-3T-UX-005 | CAP-01 | FN-SVC-3T | UX | P1 | admin | Thiếu tầng | 1. Indicator trên UI | Cảnh báo cấp thiếu — không chỉ màu | UI | UX |
| TC-DM-LOG-20-SVC-3T-FD-006 | CAP-01 | FN-SVC-3T | FD | P1 | ceo@xe.vn | Payload thiếu field bắt buộc / sai kiểu | 1. Gửi request/UI thiếu field bắt buộc theo contract | 4xx deterministic + message VI; không ghi partial; không 500 | API/UI | fail-deep contract |
| TC-DM-LOG-20-SVC-3T-BD-007 | CAP-01 | FN-SVC-3T | BD | P1 | ceo@xe.vn | Biên độ nhập (độ dài mã/tên, page size) | 1. Nhập đúng biên cho phép 2. Nhập vượt biên | Biên hợp lệ 2xx; vượt biên 4xx/validate | UI/API | boundary |
| TC-DM-LOG-20-SVC-3T-AU-008 | CAP-01 | FN-SVC-3T | AU | P0 | anonymous / expired JWT | Không token hoặc token hết hạn | 1. Gọi API/UI thao tác UC | 401 XBOS-AUTH-001 hoặc redirect login; không lộ data | API | auth |

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
| BE API/DTO | seed cardinality rules | `TECHSPEC_M03_DM_LOG_P1.md` §2 · `catalog-governance` / `config-sync` |
| FE menu/nút/role | Wizard/tree 3 tầng dịch vụ — UNKNOWN | portal CC `moduleKey: logistics` (tab) — màn DM chi tiết cần HDSD |
| Mobile (nếu có) | N/A | — |
| RBAC / scope | Group/data steward | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE |

**Verdict code_readiness:** `UNKNOWN`

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: XBOS-DM-LOG-20
cases_designed: 8
code_readiness: UNKNOWN
squad: W1-S4-DM-LOG
uat_done: false
```
