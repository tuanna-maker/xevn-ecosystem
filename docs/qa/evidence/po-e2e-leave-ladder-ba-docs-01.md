# PO-E2E-LEAVE-LADDER-BA-DOCS-01 — SRS ADD BR-LEAVE-LADDER (Option A)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-E2E-LEAVE-LADDER-BA-DOCS-01` |
| **from_role** | ba-docs |
| **to_role** | pm |
| **lane** | governance |
| **priority** | P0 |
| **date** | 2026-08-03 |
| **ack_status** | **PASS_TO_PM** |
| **no_prompt_echo** | true (client SRS prose không stamp work_item) |
| **cấm** | `apps/**` · invent magic `N` production · wipe FR-UC-H03 |

---

## 0. Read ack

| Source | Outcome |
|--------|---------|
| `docs/qa/evidence/po-e2e-leave-ladder-sa-01.md` | Option A recommended — configurable `T_L1` + L2 in WF graph; pilot `T_L1=3` = ASSUMPTION only |
| `docs/qa/evidence/po-e2e-ba-case-matrix-01.md` § SPEC_GAP | `GAP-LEAVE-LADDER-01` / `BR-LEAVE-LADDER-01`; LV-02 🟡 until BR + impl |
| `docs/brand-new-documents-20270801/SRS_NEW.md` FR-UC-H03 + §3.7 (pre) | Intent «hai cấp»; sequence/Diễn biến 1 QL; không ngưỡng cắt L1/L2 |
| Skill client-delivery + no_prompt_echo | ADD-only; VI nghiệp vụ; không meta pipeline trong prose khách |

---

## 1. Delta applied (ADD-only)

| Artifact | Change |
|----------|--------|
| `SRS_NEW.md` | Version **1.2 → 1.3**; nhật ký v1.3 |
| FR-UC-H03 | Giữ bảng loại nghỉ + validation gửi đơn; **ADD** phân biệt báo trước / ốm-attach / thang L1–L2; sequenceDiagram 2 actor duyệt + nhánh skip L2; Diễn biến 1–9 (6a/6b); BR-LEAVE-LADDER-01/02 + NOTICE/ATT/WF-04; khung config `T_L1` / `leave_l1_max_days`; AC-H03-01..05 |
| §3.7.1 | Ghi chú thang L1/L2 trên hàng «Nộp & duyệt phép» |
| §3.7.2 | **ADD** `AC-MMAP-LV-LADDER` |
| §6 | **ADD** BR-LEAVE-LADDER-01/02 vào bảng tổng quát |
| §6.1 | **ADD** `Q-LEAVE-LADDER-01` — ASSUMPTION pilot/UAT `T_L1=3` **chờ chủ sản phẩm chốt**; tách khỏi BR production |
| §6.2 / footer | Ghi nhận v1.3 ADD vào H03 |

**Không** ghi số nguyên production cứng trong BR-LEAVE-LADDER-01.  
**Không** wipe FR-UC-H03 / leave-type table / notice≥3 / sick≥3.

---

## 2. BR locked in SRS (summary)

| ID | Rule |
|----|------|
| **BR-LEAVE-LADDER-01** | `T_L1` từ cấu hình công ty (`leave_l1_max_days`); ≤ → L1 đủ (skip L2); > → bắt buộc L2; reject bất kỳ cấp → rejected + hoàn số dư tạm |
| **BR-LEAVE-LADDER-02** | Stub: loại nghỉ `requires_l2` / «bắt buộc cấp 2» → luôn L2, bỏ qua so sánh `T_L1` |
| Tách | Báo trước 3 ngày lịch · ốm giấy ≥3 ngày · **≠** `T_L1` |

---

## 3. Open / residual

| Item | Status | Owner kế |
|------|--------|----------|
| Sponsor confirm Option A + giá trị pilot `T_L1` (ASSUMPTION) | OPEN nếu chưa có confirm chat | pm → sponsor |
| TechSpec / API / DB: settings key, spawn context `total_days`/`t_l1`/`requires_l2`, skip L2 | OPEN | sa / ba-data |
| HDSD bảng «Số ngày → người duyệt» (`BR-LEAVE-LADDER-HDSD-01`) | HOLD đến khi chốt số vận hành | ba-docs / ba-process |
| Dev WF 2 bước + bridge | HOLD đến SRS confirm + TechSpec | pm → dev-be |
| `R-PO-LEAVE-DAY-LADDER` / LV-02 | Vẫn OPEN / 🟡 cho đến impl + QA U65 | qa sau Dev |

---

## 4. Handoff

### completion_report

- **Closed:** SRS_NEW v1.3 ADD-only FR-UC-H03 — BR-LEAVE-LADDER-01 (configurable `T_L1`) + stub BR-LEAVE-LADDER-02; sequence/Diễn biến hai cấp; AC-H03-02/03 measurable; pilot `T_L1=3` chỉ ở §6.1 ASSUMPTION; §3.7 AC-MMAP-LV-LADDER; no wipe; no `apps/**`; no production magic number in BR.
- **Open:** Sponsor chốt giá trị pilot (nếu dùng ASSUMPTION); TechSpec/API delta; HDSD ngày→cấp; Dev; LV-02 QA.

### next_owner

`pm`

### next_dispatch_prompt

```text
work_item_id: PO-E2E-LEAVE-LADDER-TECHSPEC-01
role: sa (hoặc ba-data cho DB/API physical)
priority: P0
lane: governance

ENTRY: SRS_NEW v1.3 FR-UC-H03 đã ADD BR-LEAVE-LADDER-01/02 (Option A). Nếu sponsor CHƯA chốt số pilot T_L1 — vẫn được viết TechSpec khung (settings key leave_l1_max_days, spawn context, skipWhen L2); CẤM hardcode N=3 production. Nếu sponsor đã confirm ASSUMPTION pilot T_L1=3 — ghi pilot/UAT only trong TechSpec note, không nhầm BR production.

Mission: TECH_SPEC_NEW (+ API_DESIGN/DB_DESIGN delta) — WF hrm_leave_approval 2 bước; skip L2 khi total_days ≤ t_l1 && !requires_l2; company_settings leave_l1_max_days; bridge context fields; fail-closed thiếu T_L1; L2 resolver cùng company. Ref: docs/qa/evidence/po-e2e-leave-ladder-sa-01.md · po-e2e-leave-ladder-ba-docs-01.md.

EXIT: evidence TechSpec path; unlock Dev-BE; ack PASS_TO_PM
Cấm: apps/** implement trước TechSpec · invent N · wipe SRS FR
```

**Nếu sponsor chưa confirm pilot value:** PM có thể dispatch TechSpec khung ngay; **không** dispatch Dev claim LV-02 với số chưa chốt; LV-02 giữ 🟡.

### evidence_path

`docs/qa/evidence/po-e2e-leave-ladder-ba-docs-01.md`

### ack_status

**PASS_TO_PM**

### pm_dispatch_hint

`PO-E2E-LEAVE-LADDER-TECHSPEC-01` (sa/ba-data) — hoặc chờ sponsor confirm `Q-LEAVE-LADDER-01` trước khi Dev. **Không** `dev-be` trước TechSpec/API.
)
