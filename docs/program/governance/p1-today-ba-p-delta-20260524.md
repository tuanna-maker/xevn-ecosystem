# P1-TODAY-GOV-BA-P — Evidence (U18)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-TODAY-GOV-BA-P` |
| **from_role** | ba-process |
| **to_role** | pm |
| **lane** | governance |
| **ack_status** | **PASS_TO_PM** |
| **date** | 2026-05-24 |
| **spec_ref** | `GOV-SRS-DELTA` |

## Entry / exit

| | Criteria |
|---|----------|
| **entry** | U18 gov wave; SRS/UC matrix + pilot matrix + phase1 gate baseline |
| **exit** | Delta AC/BR published; 57 planned UC mapped to waves A/C/B + Dev/QA owners; no commit |

## Deliverables

| Artifact | Path |
|----------|------|
| Delta AC/BR (chi tiết) | [`PHASE1_UC_DELTA_AC_BR_20260524.md`](PHASE1_UC_DELTA_AC_BR_20260524.md) |
| Matrix pointer | [`PHASE1_UC_SRS_TECHSPEC_MATRIX.md`](../../ecosystem/PHASE1_UC_SRS_TECHSPEC_MATRIX.md) §1.1 |
| Pilot L2 (đủ — không sửa) | [`PILOT_BUSINESS_FLOW_MATRIX.md`](../../qa/PILOT_BUSINESS_FLOW_MATRIX.md) |
| BA trace embed (đủ) | [`PILOT_BUSINESS_FLOW_BA_TRACE.md`](../../qa/PILOT_BUSINESS_FLOW_BA_TRACE.md) |

## Baseline đếm `planned`

| Nguồn | planned | Ghi chú |
|-------|--------:|---------|
| `PHASE1_GATE_REPORT.md` (P1-S5-QA-01) | **63** | Snapshot trước BE-WAVE-FINAL |
| `pnpm phase1:gate` (matrix file 2026-05-24) | **57** | **SoT cho chia việc hôm nay** |
| Resolver + overrides (`_tmp-list-planned.mjs`) | **57** | Khớp gate |

**Chênh 6 UC:** đã promote trong `phase1-impl-status.json` overrides (config/WF/CC P0, embed 22–25, v.v.) — không còn `planned` trên resolver.

---

## Danh sách 57 UC `planned` (resolver SoT)

### Khối A — Wave A (34 UC) → G2 XBOS + Portal

| UC | Tên rút gọn |
|----|-------------|
| UC-XBOS-13 | Định nghĩa workflow |
| UC-XBOS-14 | Chạy workflow multi-hat |
| UC-XBOS-15 | Cấu hình tuyến báo cáo WF |
| UC-XBOS-16 | Yêu cầu tài sản — KT 5 bước |
| UC-XBOS-AR-01 | Danh sách yêu cầu tài sản |
| UC-XBOS-AR-02 | Tạo yêu cầu tài sản |
| UC-XBOS-AR-03 | Chuyển trạng thái yêu cầu |
| UC-XBOS-AST-01 | Đăng ký tài sản |
| UC-XBOS-AST-02 | Vòng đời tài sản |
| UC-ECO-SCOPE-01 | Truy cập chưa đăng nhập |
| UC-CC-01 | Cấu hình phòng ban theo pháp nhân |
| UC-CC-03 | Chi tiết đơn vị thành viên |
| UC-CC-04 | Lưu thông tin pháp nhân |
| UC-XBOS-CC-05 | Thanh điều hành KPI/tác vụ |
| UC-XBOS-CC-06 | Canvas quy trình |
| UC-XBOS-CC-07 | Hạ tầng danh mục nền |
| UC-XBOS-CC-08 | Phòng ban mẫu |
| UC-XBOS-DASH-01 | Cockpit KPI |
| UC-XBOS-DASH-02 | Bảng KPI theo công ty |
| UC-XBOS-DASH-03 | Chính sách KPI |
| UC-XBOS-INF-01 | Cấu hình hạ tầng DM |
| UC-XBOS-INF-02 | Mẫu siêu dữ liệu |
| UC-XBOS-INF-03 | Tóm tắt hạ tầng DM |
| XBOS-DM-10 | Xuất danh mục |
| XBOS-DM-11 | Nhập danh mục file |
| XBOS-DM-12 | Gửi phê duyệt nhạy cảm |
| XBOS-DM-13 | Phê duyệt/từ chối |
| XBOS-DM-14 | Lịch sử thay đổi |
| XBOS-DM-15 | Yêu cầu bổ sung trường |
| XBOS-DM-16 | Yêu cầu xóa trường |
| XBOS-DM-17 | Phát hành phiên bản DM |
| XBOS-DM-18 | Thông báo DM mới |
| UC-ECO-MASTER-01 | Master data tenant/company |
| UC-ECO-FE-01 | Thay mock portal bằng API |

### Khối C — Wave C (23 UC) → G3 HRM 119

| UC | Tên rút gọn |
|----|-------------|
| HRM-MD-01..05 | Metadata change queue |
| HRM-SC-06..09 | Catalog batch / template init |
| HRM-IM-01..04 | Import/export nhân sự |
| HRM-OP-01..04 | Công việc vận hành |
| HRM-PF-01..04 | Đánh giá hiệu suất |
| UC-HRM-20 | Embed tổng quan |
| UC-HRM-21 | Embed danh sách NV |

### Khối B — Wave B (0 UC ở `planned`)

22 `XBOS-DM-LOG-*` đang `data` (seed/catalog) — Wave B owner **dev-be + devops + qa**, không nằm trong 57 planned.

---

## Chia viện — Waves A / C / B × Owner

| Wave | Mục tiêu G | UC (planned) | Dev-BE | Dev-FE | QA | Ưu tiên P0 |
|------|------------|-------------|--------|--------|-----|------------|
| **A** | G2 — XBOS 104 | 34 | WF engine, assets, DM-10..18, INF, CC BE, master API | CC-05..08 UI, DASH, canvas, ECO-FE-01 mock removal | `test:system:uat` XBOS clusters; `verify:capabilities` | CC-05 KPI 409; WF-13..14 |
| **C** | G3 — HRM 119 | 23 | MD, IM, OP, PF controllers + scope | UC-HRM-20/21 embed API mode | L2 P-CC-03 + `verify:hrm:menu-density`; `test:hrm-embed:audit` | UC-HRM-20/21 (L2 PASS → promote) |
| **B** | G4+G5 — DM-LOG + 183 | 0 planned (22× LOG = `data`) | DM-LOG APIs + seed scripts | Portal DM views (nếu có) | `verify:capabilities` DM; seed publish/pull | `seed:hrm:fidelity` naming (Q-U18-02) |

### PM dispatch gợi ý (max 3 Task song song)

| # | Task | work_item_id gợi ý | Scope |
|---|------|---------------------|-------|
| 1 | dev-be | `P1-TODAY-EXEC-A-BE` | Wave A: WF-13/14 + AR/AST + DM-12/13 |
| 2 | dev-fe | `P1-TODAY-EXEC-C-FE` | Wave C P0: UC-HRM-20/21 + ECO-FE-01 |
| 3 | qa | `P1-TODAY-EXEC-QA-02` | AC-U18-* retest; promote planned→e2e khi PASS |

---

## Delta AC/BR — tóm tắt

| Cụm | Số UC planned | Delta file § | Đã đủ SRS khác |
|-----|--------------|--------------|----------------|
| Embed P0 | 2 | §2.1 | UC-HRM-22..25 → BA trace |
| Workflow/Asset | 9 | §2.2–2.3 | — |
| CC/DASH/INF/DM | 23 | §2.4–2.5 | UC-XBOS-03..07 → S1 pack |
| HRM MD/IM/OP/PF | 21 | §2.6 | Menu linkage AC-FID |

**Tổng AC delta mới:** 45+ AC-ID (`AC-U18-*`) + 12 BR-ID (`BR-WF-*`, `BR-AR-*`, `BR-DM-*`) — chỉ cụm acceptance chưa rõ; không duplicate pilot trace.

---

## Rủi ro / defer

| ID | Rủi ro | defer_reason | trigger_to_reopen |
|----|--------|--------------|-------------------|
| R-U18-01 | Matrix file 57 vs gate report 63 gây nhầm KPI | Regenerate `pnpm docs:phase1:matrix` chưa chạy post-WAVE-FINAL | Sau QA-02 promotion |
| R-U18-02 | UC-HRM-21 density FAIL khi seed thấp | Chờ `seed:hrm:fidelity` | G-FID-07 PASS |
| R-U18-03 | Wave A 34 UC — không kịp trong ngày | PM slice P0 only | Deadline 23:59 ICT |

---

## Bus packet (copy-ready)

```text
2026-05-24T12:00:00Z | ba-process -> pm | P1-TODAY-GOV-BA-P
work_item_id: P1-TODAY-GOV-BA-P
lane: governance
ack_status: PASS_TO_PM
evidence_path: docs/program/governance/p1-today-ba-p-delta-20260524.md
summary: U18 delta AC/BR for 57 planned UC; waves A(34)/C(23)/B(0); dispatch map Dev-BE/FE/QA; pilot trace unchanged
```
