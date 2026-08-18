# BA-HRM-BRD-YEUCAU-INVENTORY-01 — Evidence

**work_item_id:** `BA-HRM-BRD-YEUCAU-INVENTORY-01`  
**from_role:** ba-process · **to_role:** pm  
**lane:** governance  
**date:** 2026-07-21  
**ack_status:** `PASS_TO_PM`

## 1. Mandate

Coord ba-docs W1 / program `HRM_SPEC_REMASTER_BATECO_PROGRAM.md` W1b. Theo `_vibe-team-os/13` **§3.4.8.B**: khóa danh sách **Yêu cầu-N** từ thực tế nghiệp vụ + catalog; map mỗi Yêu cầu → ≥1 UC/NFR primary trong `docs/hrm/UC_INVENTORY_BRD_SRS.md`.

**Cấm tuân thủ:** không `apps/**` · không wipe · không Phase1 DONE · không seed · **không** viết full FR (ba-docs).

## 2. Nguồn đọc

| Artifact | Vai trò |
|----------|---------|
| `_vibe-team-os/13-BRD-SRS-TECHSPEC-QUALITY.md` §3.4.8.B | Gate inventory |
| `docs/program/HRM_SPEC_REMASTER_BATECO_PROGRAM.md` | Exit W1 BRD |
| `docs/hrm/BANG_TONG_HOP_USECASE_HRM.md` | Catalog **120** UC |
| `docs/hrm/BRD.md` | Mục tiêu, phạm vi, BR, UC lịch sử |
| `docs/hrm/UC_INVENTORY_BRD_SRS.md` | SoT freeze (trước = nhóm; sau = Yêu cầu-N) |
| `docs/qa/evidence/ba-hrm-spec-quality-audit-01-20260721.md` | Body §3.4 verdict mẫu |
| `docs/qa/USER_FLOW_OPERABILITY_MATRIX.md` §4 | Thực tế vận hành UF-HRM (ưu tiên Cao) |

## 3. Exit checklist

| # | Exit | Result |
|---|------|--------|
| 1 | Inventory freeze table: Yêu cầu-ID \| priority \| primary UC \| status | **PASS** — `UC_INVENTORY_BRD_SRS.md` §6 (30 Yêu cầu) |
| 2 | Flag Cao không có UC body = W1/W2 backlog | **PASS** — §6.2: 24 Cao `planned_W2`; 0 Cao thiếu primary map |
| 3 | Evidence path này | **PASS** |
| 4 | PASS_TO_PM; không full FR | **PASS** |

## 4. Freeze summary

| Metric | Value |
|--------|-------|
| Yêu cầu-N locked | **30** (Yêu cầu-01..30) |
| body_ready | **3** — Yêu cầu-10 (HRM-AT-14 / UC-HRM-23/32), Yêu cầu-27 (NFR), Yêu cầu-29 (bound) |
| planned_W2 | **27** |
| Cao thiếu primary UC/NFR map | **0** (OS §3.4.8.C map gate PASS) |
| Cao thiếu FR body §3.4 | **24** → backlog **W2** `BA-HRM-SRS-BATECO-W2-CATALOG-01` |

### 4.1 Trích bảng freeze (SoT đầy đủ ở inventory)

| Yêu cầu-ID | priority | primary UC / NFR | status |
|------------|----------|------------------|--------|
| Yêu cầu-01 | Cao | UC-HRM-SCOPE-01..03 | planned_W2 |
| Yêu cầu-06 | Cao | HRM-EM-01..05 | planned_W2 |
| Yêu cầu-10 | Cao | HRM-AT-14 · UC-HRM-23/32 | **body_ready** |
| Yêu cầu-13 | Cao | HRM-PR-01..06 | planned_W2 |
| Yêu cầu-14 | Cao | HRM-RC-01..06 | planned_W2 |
| Yêu cầu-15 | Cao | HRM-CI-01..07 | planned_W2 |
| Yêu cầu-22 | Cao | UC-HRM-20..27 | planned_W2 |
| Yêu cầu-23 | Cao | UC-HRM-MOB-01..15 | planned_W2 |
| Yêu cầu-27 | Cao | NFR-HRM-01..04 | **body_ready** |
| Yêu cầu-29 | Cao | NFR-HRM-BOUND | **body_ready** |
| … | … | … | xem inventory §6 |

## 5. Artifacts touched (ADD-only)

| File | Change |
|------|--------|
| `docs/hrm/UC_INVENTORY_BRD_SRS.md` | Remaster inventory: §6 Yêu cầu-N freeze + §6.2 Cao backlog |
| `docs/hrm/BRD.md` | ADD §7.1 bảng Yêu cầu-01..30 (pointer; không FR) |

**Không** sửa `apps/**` · không wipe AC-ATT-SHEET / UC body đã 🟢.

## 6. completion_report

| Đóng | Residual |
|------|----------|
| Yêu cầu-01..30 khóa + map primary | 27 Yêu cầu `planned_W2` cần FR remaster |
| Cao map gate PASS (0 thiếu primary) | Skeleton Bateco Ch.1–6 vẫn FAIL → ba-docs W1a |
| BRD §7.1 pointer | W2 batch theo inventory freeze — không mở mã ngoài freeze |
| Coord ba-docs: FR body = họ | Không claim Phase1 / PROD |

## 7. Handoff

- **next_owner:** `ba-docs` (W1a skeleton + E2E; sau PASS → W2 catalog FR)  
- **ack_status:** `PASS_TO_PM`  
- **evidence_path:** `docs/qa/evidence/ba-hrm-brd-yeucau-inventory-01-20260721.md`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: BA-HRM-BRD-SRS-BATECO-W1-01
from_role: pm
to_role: ba-docs
lane: governance
priority: P0
entry_criteria: docs/hrm/UC_INVENTORY_BRD_SRS.md §6 freeze Yêu cầu-01..30 PASS; BRD.md §7.1; program HRM_SPEC_REMASTER_BATECO_PROGRAM.md W1; OS §3.4.8.A+B
exit_criteria: SRS skeleton Ch.1–6 body (hoặc SoT khách đã chọn) + E2E spine bảng phụ thuộc; stub menu = 0; FR 7 mục + Kết quả trả về trên UC spine W1; map Yêu cầu body_ready giữ nguyên; cấm wipe AC-ATT-SHEET / Yêu cầu-10; cấm claim đủ 120 FR trong W1
evidence_path: docs/qa/evidence/ba-hrm-brd-srs-bateco-w1-01-YYYYMMDD.md
ack_status: PASS_TO_PM
cấm: apps/** · wipe · Phase1 DONE · seed · full catalog FR (để W2)
next_after_W1_PASS: BA-HRM-SRS-BATECO-W2-CATALOG-01 — remaster ADD-only planned_W2 theo inventory §6 (ưu tiên Cao: 01–09, 12–18, 22–24, 28)
```

### pm_dispatch_hint (parallel nếu W1a đã in-flight)

```text
Nếu BA-HRM-BRD-SRS-BATECO-W1-01 đã DISPATCHED: không trùng Task — chỉ INTAKE inventory PASS.
Sau W1 PASS → Task ba-docs W2 với danh sách Yêu cầu planned_W2 Cao từ UC_INVENTORY_BRD_SRS.md §6.2.
```
