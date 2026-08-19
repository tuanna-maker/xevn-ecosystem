# UC — `XBOS-DM-LOG-18` · Thông báo phân hệ Logistic có danh mục mới

| Meta | Value |
|------|--------|
| **uc_id** | `XBOS-DM-LOG-18` |
| **stt_phase1** | 115 |
| **mod** | M03 |
| **name_vi** | Thông báo phân hệ Logistic có danh mục mới |
| **actors** | System · Catalog Admin · (P2) Logistic spoke |
| **surfaces** | web-portal (Command Center / catalog admin) / xbos-cc / api |
| **srs_old** | `docs/logistics/BANG_TONG_HOP_USECASE_LOGISTIC.md` STT local 1–22 · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` §2.B STT 98–119 |
| **srs_new** | **N/A-DELTA** — `SRS_VN.md` chưa có FR riêng khối XBOS-DM-LOG; thiết kế từ tên UC + bang tong hop + TECHSPEC_M03 |
| **tech_spec** | `docs/logistics/TECHSPEC_M03_DM_LOG_P1.md` §2 (pattern reuse M01) · `TECHSPEC_HE_SINH_THAI_XEVN.md` §7.1 / §8.1 catalog pattern — **chưa** logistics TechSpec sâu từng UC |
| **api_contract** | `GET/POST /api/xbos/config-sync/catalog*` · `POST /api/xbos/catalog-governance/*` · OpenAPI xbos-api DM export/import delta — mã lỗi scope `SCOPE_CONTEXT_MISMATCH` / `XBOS-AUTH-001` |
| **author** | qa · PO-UC-TC-W1-S4-DM-LOG |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `GAP` — **không** = UAT PASS |
| **code_note** | TECHSPEC_M03: «Event on publish → future logistic pull (P2 stub OK)». Không logistic-api P1 → **GAP** consumer; có thể chỉ audit/event stub. |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. `uat_done: false`. Squad **W1-S4-DM-LOG**.

---

## 1. Mục tiêu UC (1 đoạn)

Sau publish, phát sự kiện/thông báo để phân hệ Logistic biết có DM mới (pull hoặc notify).

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-01 | Thông báo sau publish | Spoke/ops biết version mới | System |

**Đếm nghiệp vụ:** 1

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-01 | FN-NOTIFY | Emit notify / hiển thị thông báo | Thông báo portal / event | Y |

**Đếm chức năng:** 1

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-NOTIFY | 1 | 2 | 1 | 2 | 2 | 8 |
| **Tổng** | 1 | 2 | 1 | 2 | 2 | **8** |

---

## 5. Test cases (bảng đủ P0; P1/P2 có thể rút gọn 1 dòng/case)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-DM-LOG-18-NOTIFY-HP-001 | CAP-01 | FN-NOTIFY | HP | P0 | ceo@xe.vn | Vừa publish LOG-17 | 1. Quan sát kênh thông báo / event log | Có event catalog.published domain=logistic; hoặc stub documented P2 | API/UI | LOG-18 · TECHSPEC_M03 P2 stub |
| TC-DM-LOG-18-NOTIFY-FD-002 | CAP-01 | FN-NOTIFY | FD | P1 | system | Subscriber down | 1. Publish khi spoke unavailable | Hub publish vẫn OK; retry/DLQ — không rollback im lặng | API | FD resilience |
| TC-DM-LOG-18-NOTIFY-UX-003 | CAP-01 | FN-NOTIFY | UX | P2 | ops | Có notify UI | 1. Click thông báo | Deep link tới catalog version | UI | UX |
| TC-DM-LOG-18-NOTIFY-AU-004 | CAP-01 | FN-NOTIFY | AU | P1 | outsider | Không quyền | 1. Subscribe event stream | 401/403 | API | AU |
| TC-DM-LOG-18-NOTIFY-FD-005 | CAP-01 | FN-NOTIFY | FD | P1 | ceo@xe.vn | Payload thiếu field bắt buộc / sai kiểu | 1. Gửi request/UI thiếu field bắt buộc theo contract | 4xx deterministic + message VI; không ghi partial; không 500 | API/UI | fail-deep contract |
| TC-DM-LOG-18-NOTIFY-BD-006 | CAP-01 | FN-NOTIFY | BD | P1 | ceo@xe.vn | Biên độ nhập (độ dài mã/tên, page size) | 1. Nhập đúng biên cho phép 2. Nhập vượt biên | Biên hợp lệ 2xx; vượt biên 4xx/validate | UI/API | boundary |
| TC-DM-LOG-18-NOTIFY-AU-007 | CAP-01 | FN-NOTIFY | AU | P0 | anonymous / expired JWT | Không token hoặc token hết hạn | 1. Gọi API/UI thao tác UC | 401 XBOS-AUTH-001 hoặc redirect login; không lộ data | API | auth |
| TC-DM-LOG-18-NOTIFY-UX-008 | CAP-01 | FN-NOTIFY | UX | P1 | ceo@xe.vn | Network chậm / API error | 1. Thao tác khi BE 5xx hoặc timeout | Loading rồi error banner + retry; không trắng màn | UI | UX resilience |

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
| BE API/DTO | Event bus stub / no logistic pull | `TECHSPEC_M03_DM_LOG_P1.md` §2 · `catalog-governance` / `config-sync` |
| FE menu/nút/role | Bell/notify — UNKNOWN/GAP | portal CC `moduleKey: logistics` (tab) — màn DM chi tiết cần HDSD |
| Mobile (nếu có) | N/A P1 | — |
| RBAC / scope | System | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE |

**Verdict code_readiness:** `GAP`

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: XBOS-DM-LOG-18
cases_designed: 8
code_readiness: GAP
squad: W1-S4-DM-LOG
uat_done: false
```
