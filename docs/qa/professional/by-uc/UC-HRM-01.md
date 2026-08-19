# UC — `UC-HRM-01` · Kiểm tra trạng thái dịch vụ

| Meta | Value |
|------|--------|
| **uc_id** | `UC-HRM-01` |
| **stt_phase1** | 263 |
| **mod** | M05 |
| **name_vi** | Kiểm tra trạng thái dịch vụ |
| **actors** | Ops · any authed |
| **surfaces** | api |
| **srs_old** | BANG_TONG_HOP STT16 |
| **srs_new** | SRS_VN health |
| **tech_spec** | TECHSPEC_HE §9.3 |
| **api_contract** | GET /api/hrm/health → HRM-HEALTH-200 |
| **author** | qa · PO-UC-TC-W1-S5-HRM-A |
| **design_status** | DESIGNED |
| **execution** | not started |
| **code_readiness** | `LIKELY_IMPL` — **không** = UAT PASS |
| **code_note** | app.controller health ok payload. |
| **squad** | W1-S5-HRM-A |
| **uat_done** | false |

> Chuẩn: UC → Nghiệp vụ → Chức năng → Case (HP/FD/BD/AU/UX). Fail-deep trước/cùng happy. U65 không giả seed. Design ≠ UAT DONE.


---

## 1. Mục tiêu UC (1 đoạn)

Kiểm tra trạng thái dịch vụ: bảo đảm actor thực hiện đúng luồng HDSD trên surface nêu trên; hệ thống validate BR/DTO, tôn trọng scope đa pháp nhân, và phản hồi FE sau 2xx + F5 quan sát được. Wave này **chỉ thiết kế** test — chưa chạy browser.

---

## 2. Nghiệp vụ (capabilities)

| Cap-ID | Nghiệp vụ | Mục đích | Actor |
|--------|-----------|----------|-------|
| CAP-01 | Kiểm tra sức khỏe dịch vụ | Xác nhận HRM API sống trước UAT | Ops · any authed |

**Đếm nghiệp vụ:** 1

---

## 3. Chức năng (functions)

| Cap | FN-ID | Chức năng | UI/API | Mutate? |
|-----|-------|-----------|--------|---------|
| CAP-01 | FN-HEALTH | Gọi health endpoint | GET /api/hrm/health | N |

**Đếm chức năng:** 1

---

## 4. Số case theo chức năng

| FN-ID | HP | FD | BD | AU | UX | Σ |
|-------|---:|---:|---:|---:|---:|--:|
| FN-HEALTH | 2 | 0 | 0 | 1 | 1 | **4** |
| **Tổng (fn plan)** | 2 | 0 | 0 | 1 | 1 | **4** |
| **Tổng (bảng §5)** | | | | | | **4** |

> Σ bàn giao Synth = **số dòng TC §5** (`4`). Fn plan dùng để kiểm coverage; lệch nhỏ do gộp optional được chấp nhận nếu §6 GAP ghi rõ.

---

## 5. Test cases (P0 đủ cột; P1/P2 đủ định danh)

| TC-ID | Cap | FN | Type | Pri | Persona | Precond | Steps | Expected | Layer | Trace |
|-------|-----|-----|------|-----|---------|---------|-------|----------|-------|-------|
| TC-UC-HRM-01-HEALTH-HP-001 | CAP-01 | FN-HEALTH | HP | P0 | ops/any | Stack up | 1. GET /api/hrm/health | 200 HRM-HEALTH-200 + status ok | API | GET /api/hrm/health → HRM-HEALTH-200 |
| TC-UC-HRM-01-HEALTH-HP-002 | CAP-01 | FN-HEALTH | HP | P1 | portal proxy | Vite/portal proxy | 1. Mở portal → proxy health | Không 500 proxy khi :28001 up | UI/API | qc:fe-be-health |
| TC-UC-HRM-01-HEALTH-AU-001 | CAP-01 | FN-HEALTH | AU | P1 | anon | Không token (nếu policy public) | 1. GET không Authorization | 200 public HOẶC 401 theo OpenAPI — ghi contract | API | GET /api/hrm/health → HRM-HEALTH-200 |
| TC-UC-HRM-01-HEALTH-UX-001 | CAP-01 | FN-HEALTH | UX | P0 | ops | hrm-api down | 1. Stop API 2. Gọi health/proxy | ECONNREFUSED / portal báo lỗi rõ — không silent | API | pm-fe-be-live-health |

---

## 6. Coverage check

| Check | Req | In design | GAP |
|-------|----------|-----------|-----|
| Mọi Cap có ≥1 FN | Y | Y | |
| Mọi FN mutate ≥1 HP + ≥1 FD | Y (mutate) | Xem §4 | Optional FN ghi * |
| Auth/scope nếu đa CT | Y | AU cases | |
| SPEC_GAP ghi rõ | Y | | |
| — | — | — | Không giấu gap |

---

## 7. FE / BE / Role (đánh giá thiết kế — chưa UAT)

| Layer | Finding | Evidence (path/#) |
|-------|---------|-------------------|
| BE API/DTO | LIKELY_IMPL — app.controller health ok payload. | GET /api/hrm/health → HRM-HEALTH-200 |
| FE menu/nút/role | Cần map HDSD/menu pack khi execution; design neo SRS cũ | portal / hrm-embed |
| Mobile (nếu có) | N/A wave này trừ khi surfaces ghi mobile | |
| RBAC / scope | AU bắt buộc holding vs member | ADR-GROUP-CEO-MAIN-HOLDING-SCOPE |

**Verdict code_readiness:** `LIKELY_IMPL`

---

## 8. Handoff

```
ack_status: READY_FOR_SYNTH
uc_id: UC-HRM-01
cases_designed: 4
code_readiness: LIKELY_IMPL
work_item_id: PO-UC-TC-W1-S5-HRM-A
```
