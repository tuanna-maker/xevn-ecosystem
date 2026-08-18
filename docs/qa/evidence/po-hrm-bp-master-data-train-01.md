# Evidence — PO-HRM-BP-MASTER-DATA-TRAIN-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-BP-MASTER-DATA-TRAIN-01` |
| **from_role** | pm |
| **to_role** | ba-data |
| **lane** | governance |
| **Date** | 2026-08-05 |
| **ack_status** | **PASS_TO_PM** |
| **SoT trained** | `docs/client-delivery/hrm-enterprise-blueprint/MASTER_DATA_CONFIG_CLASSIFICATION.md` |
| **ADR checked** | `docs/architecture/ADR-HRM-ATTENDANCE-CFG-PERSIST-20260804.md` (Accepted) |
| **CHOT §3** | `SPONSOR_CHOT_FILL_SHEET.md` §3 MD-S1..S5 (unfilled) |
| **Gap skim** | `UC_MEETING_PRODUCT_GAP_MATRIX.md` leave A3–A4 / PAY P1–P2 / Face #9 |
| **D7** | HOLD — no `apps/**`, no seed, no READY_FOR_TECHSPEC |

---

## 1. Validation — MASTER §1 vs ADR-HRM-ATTENDANCE-CFG-PERSIST

**Verdict: PASS** (no hard conflict). Soft wording delta recorded as DOC-DELTA APPEND on SoT file (late/early panel vs rule flags).

| # | MASTER §1 claim | ADR decision | Result |
|---|-----------------|--------------|--------|
| V1 | Ca instance **CFG** SoT = HRM `work_shifts`; XBOS `shifts` = **REF** only; cấm dual CRUD Ca modal | **D1** — `work_shifts` wins for ops/payroll coeff/OT base; catalog REF GĐ1 | **PASS** |
| V2 | GPS / geofence **CFG** SoT = `attendance_work_sites`; cấm write `attendance_rules.gps_locations` | **D3** — enforcement SoT work-sites; JSON deprecated for new writes | **PASS** |
| V3 | Quy tắc Chung / standard / device flags **CFG** = `attendance_rules` | **D2** — dedicated table 1 row / `company_id` TEXT; GET/PATCH `/attendance/rules` | **PASS** |
| V4 | Face #9 **GĐ2-HOLD** (stub honesty) | **D4** — FaceID OUT GĐ1; column false; UI disabled | **PASS** (`must_keep`) |
| V5 | Leave types REF = Settings catalog `leave_types` (+ company ladder CFG); cấm hardcode FE / CRUD trong modal đơn | **D4** — leave → catalog + `hrm_company_settings` ladder; stub redirect | **PASS** |
| V6 | PAY chỉ đọc bảng công **đã chốt/ký** | Gap matrix PAY-01 / DEC-D8 — bind signed sheet; MASTER §1.4 | **PASS** (`must_keep`) |
| V7 | Wording «đi muộn / OT / tự checkout» gộp một hàng `attendance_rules` | **D2** flags `notify_late` / `auto_checkout` = GĐ1; **D4** panel «Đi muộn về sớm» + OT type catalog = stub/GĐ2 / Settings REF | **SOFT DELTA** — clarify only (see DOC-DELTA) |

**Hard conflict list:** *(empty)* → **không** dispatch SA ADR rewrite.

**must_keep confirmed for team:**

1. `work_shifts` wins vs XBOS `shifts` REF  
2. Work-sites = geofence SoT  
3. PAY reads **signed/closed** timesheet only  
4. Face = **GĐ2**  

---

## 2. Member training card (≤1 page) — Dev-FE / Dev-BE / QA

### REF | CFG | TXN (nhớ 30 giây)

| Lớp | Nghĩa | Khi «Thêm mới» |
|-----|--------|----------------|
| **REF** | Danh mục chọn — không sinh kỳ | Dropdown từ catalog đã publish/pull |
| **CFG** | Rule / site / ca instance / formula theo CT | Load API scoped; một SoT CRUD |
| **TXN** | Đơn / bản ghi / kỳ / sheet | Chỉ **đọc** REF/CFG; FK; không tạo master chìm |

**Luật vàng:** một khái niệm = một SoT CRUD · XBOS publish→HRM pull (trừ ADR: `work_shifts` thắng) · stub giữ honesty · D7 HOLD = không wire mới.

### Checklist 6 mục (trước READY_FOR_QA / mỗi form Thêm)

1. [ ] `spec_read_ack` + lớp **REF|CFG|TXN** trong evidence  
2. [ ] Dropdown **không** hardcode string nghiệp vụ  
3. [ ] Empty catalog = empty state hợp lệ (không spinner storm)  
4. [ ] Scope `companyId` = **cùng** resolver list API module (scope_parity)  
5. [ ] **Không** tạo master thứ hai trong modal TXN  
6. [ ] Stub / `featureInDev` / Face GĐ2 — **không** fake LIVE  

### Master-data ack template (dán vào evidence mỗi form)

```markdown
### Master-data ack
- concept: …
- class: REF | CFG | TXN
- SoT path: API/table/catalog key …
- create_form_loads: …
- must_not: …
```

### Anti-patterns (FAIL ngay)

| Sai | Đúng |
|-----|------|
| CRUD ca trong Attendance **và** XBOS `shifts` | Ops → `work_shifts`; catalog = REF |
| GPS vào `gps_locations` JSON rules | POST/PATCH `/attendance/work-sites` |
| PAY bind sheet **mở** / OT raw | Chỉ sheet **signed/closed** |
| Seed để có dropdown / inbox | U65 FE-only; empty = hợp lệ |
| Face #9 như MVP | GĐ2-HOLD |

**Spec pointers:** MASTER §1–2 · ADR D1–D4 · CHOT §3 MD-S* · Gap leave STUB CFG / PAY data-* STUB / Face MEETING_ONLY_GĐ2.

---

## 3. Top 10 create-forms → SoT API / catalog key

| # | Form «Thêm» / mutate | Class | SoT API / catalog key (GĐ1) | Note |
|---|----------------------|-------|-----------------------------|------|
| 1 | Đơn nghỉ | TXN ← REF/CFG | Catalog **`leave_types`** + balance API (+ leave ladder `hrm_company_settings`) | CFG leave-rules UI STUB (#41/S80); Q-LEAVE-* OPEN — không invent |
| 2 | Đơn OT | TXN ← REF/CFG | OT type **REF** (Settings catalog) + **`GET /attendance/work-shifts`** + OT rule CFG | OT rules panel stub per ADR D4 |
| 3 | Ca làm việc (CRUD) | CFG | **`/attendance/work-shifts`** (`public.work_shifts`) | Wins vs XBOS `shifts` |
| 4 | Phân ca / gán NV | TXN/CFG assign | Load **`work_shifts`** scoped | Không picker catalog làm SoT ca |
| 5 | Điểm GPS / geofence | CFG | **`/attendance/work-sites`** (`attendance_work_sites`) | Cấm `gps_locations` write; MD-S3 role OPEN |
| 6 | Quy tắc chấm (Chung/Công chuẩn/App flags) | CFG | **`GET/PATCH /attendance/rules`** (`attendance_rules`) | Lazy defaults server — không seed |
| 7 | YCTD / vị trí tuyển | TXN ← REF/CFG plan | Position catalog REF + org/dept + **headcount plan** | MD-S5 + Q-REC-HEADCOUNT OPEN |
| 8 | Nhân viên mới | TXN ← REF | Org/legal + position catalog + XBOS Group HR defs → **`settings-catalogs`** pull | Scope JWT |
| 9 | Công thức / biến / phụ cấp lương | CFG versioned | Formula engine / published formula — **HOLD** | MD-S4 ≡ Q-PAY-FORMULA — không invent |
| 10 | Kỳ lương / tính lương | TXN | ATT **sheets signed/closed** + formula **published** | PAY data-attendance STUB honesty; cấm sheet mở |

---

## 4. Residual — chỉ MD-S1..S5 (không invent)

| ID | Câu hỏi (CHOT §3) | Trạng thái team | Answer invent? |
|----|-------------------|-----------------|----------------|
| **MD-S1** | Ai được thêm loại phép ngoài 5 loại họp? | OPEN — checkbox CHOT trống | **No** (liên A3 / leave catalog; không trả lời Q-LEAVE-*) |
| **MD-S2** | SoT ca = `work_shifts` vs XBOS `shifts`? | Team+ADR đề xuất: **work_shifts thắng**; chờ ☐ Đồng ý sponsor | **No** — ADR Accepted nội bộ; CHOT vẫn cần tick |
| **MD-S3** | Role CRUD GPS sites? | OPEN — HR CTV / IT / QL vận hành | **No** |
| **MD-S4** | Biến/phụ cấp khi thêm trên UI? | OPEN — trùng **Q-PAY-FORMULA** | **No** |
| **MD-S5** | Số định biên khi tạo YCTD từ đâu? | OPEN — Kế hoạch HC / Org / Khác; Q-REC-HEADCOUNT | **No** |

**Không** mở residual Q-LEAVE-ACCRUAL / Q-LEAVE-UNIT / Q-PAY-FORMULA answers tại wave này — chỉ pointer MD-S*.

---

## 5. DOC-DELTA on MASTER file

| Action | Path |
|--------|------|
| APPEND | `MASTER_DATA_CONFIG_CLASSIFICATION.md` § DOC-DELTA — clarify late/early **panel GĐ2** vs `attendance_rules` **flags GĐ1**; no wipe §1 |

Hard ADR conflict: **none** → next lane = **PM hold** (sponsor fill CHOT §3), not SA.

---

## Handoff

| Field | Value |
|-------|--------|
| **completion_report** | Trained team SoT: ADR validation PASS (+ soft DOC-DELTA); member card + top-10 forms + MD-S1..S5 residual only. D7 HOLD. |
| **next_owner** | **pm** |
| **ack_status** | **PASS_TO_PM** |
| **evidence_path** | `docs/qa/evidence/po-hrm-bp-master-data-train-01.md` |

### next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-BP-MASTER-DATA-HOLD-01
from_role: pm
to_role: pm (self) / sponsor queue
lane: governance
priority: P1

CONTEXT: ba-data PO-HRM-BP-MASTER-DATA-TRAIN-01 PASS_TO_PM.
Evidence: docs/qa/evidence/po-hrm-bp-master-data-train-01.md
ADR-HRM-ATTENDANCE-CFG-PERSIST vs MASTER §1 = PASS (no hard conflict; soft DOC-DELTA only).
D7 HOLD — cấm apps/** · seed · READY_FOR_TECHSPEC.

ACTION:
1. Giữ SoT MASTER_DATA_CONFIG_CLASSIFICATION.md (+ DOC-DELTA) làm training bắt buộc mọi form Thêm.
2. Đưa SPONSOR_CHOT_FILL_SHEET.md §3 (MD-S1..S5) vào phiên chốt sponsor — không invent đáp án.
3. MD-S2: trình bày «team+ADR: work_shifts thắng; XBOS shifts = REF» để sponsor tick Đồng ý/Khác.
4. Sau khi sponsor điền MD-S* (+ Q-* liên quan trên §1): mới mở wave ba-process AC dropdown / SA nếu sponsor chọn Khác lệch ADR.
5. Cấm dispatch Dev wire catalog/master khi D7 HOLD trừ P0 crash.

must_keep: work_shifts wins · work-sites SoT · PAY signed timesheet only · Face GĐ2
exit: CHOT §3 có tick MD-S1..S5 hoặc bus BLOCKED-EXTERNAL chờ sponsor
```
