# BA-HRM-SPEC-QUALITY-AUDIT-01 — Evidence

**work_item_id:** `BA-HRM-SPEC-QUALITY-AUDIT-01`  
**from_role:** ba-docs · **to_role:** pm  
**lane:** governance  
**date:** 2026-07-21  
**ack_status:** `PASS_TO_PM`

## 1. Mandate

Audit `docs/hrm` vs `_vibe-team-os/13-BRD-SRS-TECHSPEC-QUALITY.md` (§3.4 FR 7 mục, failure-first balance, §3.4.6 success outcome, §3.4.8 skeleton) + trace handoff `14` / templates SRS_FR / SRS-TO-TECHSPEC / E2E spine.

**Scope đọc:** `SRS.md`, `BRD.md`, `TECHSPEC.md`, catalog `BANG_TONG_HOP_USECASE_HRM.md`, attendance/leave/payroll UCs (UC-HRM-09/10/23/24/32, HRM-AT-*, HRM-PR-*).

**Cấm tuân thủ:** không sửa `apps/**` · không seed · không claim Phase1 DONE · remaster **ADD-only**.

## 2. Overall skeleton vs §3.4.8

| Check | Result | Note |
|-------|--------|------|
| Inventory BRD→UC freeze | **PASS** (mới) | `docs/hrm/UC_INVENTORY_BRD_SRS.md` |
| Bateco Ch.1–6 đồng nhất | **FAIL** | SRS HRM = tài liệu kỹ thuật nội bộ (nhiều § ISO), không 6 chương Bateco khách |
| E2E spine trước catalog | **FAIL** | Chỉ 1 sequence tổng quát §3; thiếu bảng phụ thuộc ngày/kỳ |
| Số «Mã UC» = số «Kết quả trả về» | **FAIL** | Hầu hết UC không có mục Kết quả trả về (trước wave); sau ADD: có cho HRM-AT-14 / UC-HRM-23 delta |
| Stub «Người dùng mở: menu» | **PASS** | Không thấy mẫu stub này; thay bằng if/else hoặc Purpose ngắn |
| Prompt-echo / Sponsor meta trong body khách | **PARTIAL** | Có work_item/ADR path (team SoT) — chấp nhận nội bộ; không build HTML khách trong wave này |

**Overall skeleton:** **FAIL** (cần remaster program riêng nếu gửi khách Bateco). Wave này **không** wipe — chỉ khóa inventory + ADD AC bảng công.

## 3. Gap matrix — sample UC (§3.4)

Legend: **P** = PASS · **F** = FAIL · **R** = PARTIAL

| UC / mã | (1) Meta bảng | (2) Đầu vào | (3) Luồng ≥4 NV | (4) BR | (5) sequence | (6) Diễn biến cân bằng | (7) Kết quả trả về §3.4.6 | Fail domain sâu | Verdict |
|---------|---------------|-------------|-----------------|--------|--------------|------------------------|---------------------------|------------------|---------|
| UC-HRM-01..08 | F | F | F | R | F | F | F | R (mã lỗi) | **FAIL** |
| UC-HRM-09 (đơn sửa chấm) | F | F | F | R | F | F | F | R (auth/scope) | **FAIL** |
| UC-HRM-10 (nghỉ phép) | F | F | F | R | F | F | F | R | **FAIL** |
| UC-HRM-23 (trước) | F | F | F | R | F | F | F | F | **FAIL** stub |
| UC-HRM-23 + HRM-AT-14 (sau ADD) | P | P | P | P | P | P | P | P | **PASS** (delta) |
| UC-HRM-24 lương embed | F | F | F | R | F | F | F | F | **FAIL** stub |
| UC-HRM-27 quyết định | R | R | R | P | P | R | R | P | **PARTIAL** (sâu hơn peers) |
| UC-HRM-28 lương NV | R | F | F | R | R | F | F | R | **PARTIAL** |
| UC-HRM-32 (trước) | F | F | F | F | F | F | F | F | **FAIL** 1 dòng |
| UC-HRM-32 (sau ADD) | R | R | R | P | (tham chiếu 23) | (tham chiếu 23) | P | P | **PARTIAL→PASS AC** |
| HRM-AT-01..13 | — | — | — | — | — | — | — | — | **FAIL** — chỉ catalog, không body SRS |
| HRM-PR-01..06 | — | — | — | — | — | — | — | — | **FAIL** — chỉ catalog / matrix |

**Balance §3.4.2 (sau ADD trên delta bảng công):** auth ≤2; bước thành công ≥40%; fail sâu ≥30% — **PASS** trên bảng Diễn biến UC-HRM-23/HRM-AT-14.

## 4. Inventory note — UC list vs BRD

| Phát hiện | Chi tiết |
|-----------|----------|
| BRD §7 hẹp | Chỉ UC-HRM-01..12 trong bảng chính (trước ADD) |
| Catalog rộng | 119 → **120** UC (`BANG_TONG_HOP_USECASE_HRM.md`) gồm AT/PR/RC/CI/embed/mobile |
| Lệch đếm | **Không** được báo «SRS đủ» chỉ vì §1–15 có chữ — phần lớn mã catalog **thiếu body FR** |
| ADD catalog | **HRM-AT-14** bảng chấm công |
| SoT inventory | `docs/hrm/UC_INVENTORY_BRD_SRS.md` |

## 5. ADD-only deltas applied (không wipe)

| File | Thay đổi |
|------|----------|
| `docs/hrm/SRS.md` | Mở rộng UC-HRM-23 (giữ Purpose cũ) + delta FR 7 mục + Kết quả trả về + AC-ATT-SHEET-01..05; mở rộng UC-HRM-32 |
| `docs/hrm/BRD.md` | ADD UC-HRM-23/24/32 + HRM-AT-14; ADD BR-ATT-SHEET-01..05; pointer inventory |
| `docs/hrm/BANG_TONG_HOP_USECASE_HRM.md` | ADD HRM-AT-14; tổng 120 |
| `docs/hrm/TECHSPEC.md` | §13 map SRS→API/FE attendance-sheets + `ref_srs` |
| `docs/hrm/UC_INVENTORY_BRD_SRS.md` | **Mới** — freeze inventory §3.4.8 |

**AC rõ cho coding + QA (bảng công):**

- Tạo bảng → dòng hiện trên danh sách **không** cần F5  
- Mở bảng → lưới kỳ / empty trung thực  
- Empty `total=0` ≠ lỗi  
- Không storm GET `attendance-sheets`  
- F5 vẫn còn bảng  

## 6. Traceability (§14) — attendance sheet

| Tầng | Path |
|------|------|
| BRD | BR-ATT-SHEET-01..05 |
| SRS | UC-HRM-23 / HRM-AT-14 / UC-HRM-32 |
| TechSpec | `TECHSPEC.md` §13 `ref_srs` |
| Code (đã có — không sửa wave này) | `attendance.controller.ts` sheets · `useAttendanceSheets.ts` · `Attendance.tsx` |

## 7. completion_report

| Đóng | Mở / residual |
|------|----------------|
| Gap matrix + skeleton verdict | Remaster toàn SRS HRM → Bateco 7 mục/UC (**FAIL** còn lại) |
| Inventory freeze + BRD pointer | Body FR cho HRM-AT-01..13, HRM-PR-*, UC-HRM-09/10, UC-HRM-24 |
| ADD AC bảng công đủ Dev/QA | SA confirm Zod/`packages/shared` nếu thiếu envelope sheets |
| TechSpec map sheets | QA browser AC-ATT-SHEET-01..05 (U65) |

**Không** claim Phase 1 DONE / product complete.

## 8. Handoff

- **next_owner:** `sa` (TechSpec Zod/schema confirm) **song song ưu tiên** `qa` sau khi SA ack hoặc Dev-FE smoke nếu code đã khớp AC  
- **ack_status:** `PASS_TO_PM`  
- **evidence_path:** `docs/qa/evidence/ba-hrm-spec-quality-audit-01-20260721.md`

### next_dispatch_prompt (copy-ready)

```text
work_item_id: SA-HRM-ATT-SHEET-TECHSPEC-01
from_role: pm
to_role: sa
lane: governance
entry_criteria: docs/hrm/SRS.md UC-HRM-23/HRM-AT-14 delta PASS §3.4.6; TECHSPEC.md §13; UC_INVENTORY_BRD_SRS.md
exit_criteria: Confirm Prisma/table attendance_sheets + Zod in/out (hoặc ghi gap); ref_srs ổn; không sửa apps trừ ghi rõ thiếu contract
evidence_path: docs/qa/evidence/sa-hrm-att-sheet-techspec-01-YYYYMMDD.md
ack_status: PASS_TO_PM | READY_FOR_DEV
next_after: QA-HRM-ATT-SHEET-AC-01 — browser U65 AC-ATT-SHEET-01..05 trên /attendance (cấm seed)
```

### pm_dispatch_hint (execution sau SA)

```text
work_item_id: QA-HRM-ATT-SHEET-AC-01
to_role: qa
UF/J: P-CC-07 · UC-HRM-23/32 · AC-ATT-SHEET-01..05
entry: L0 stack; U65 zero-seed; browser-only
exit: evidence click path tạo bảng → lưới/empty; Network không storm; F5 persist; PASS_TO_PM
cấm: seed · PASS chỉ curl
```
