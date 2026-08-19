# PO-HRM-E2E-LINK-ATT-SPEC-01 — Spine liên kết E2E Chấm công + Nghỉ phép

| Field | Value |
|-------|--------|
| work_item_id | `PO-HRM-E2E-LINK-ATT-SPEC-01` |
| program | `PO-HRM-ALL-MENU-E2E-LINK-01` |
| lane | governance · ba-process |
| change_mode | ADD delta draft only · **NO CODE** `apps/**` |
| date | 2026-08-06 |
| SoT spine | `docs/program/PO_E2E_BUSINESS_SPINE_PROGRAM.md` **E2E-SPINE-02** · **E2E-SPINE-03** |
| SoT khách | `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` (FR-UC-BP-ATT-* · ATT-08/09/10/11) |
| SoT đội ngũ | `docs/hrm/SRS.md` UC-HRM-10 · UC-HRM-23 · **HRM-AT-14** · AC-ATT-SHEET-* |
| Linkage density | `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` §4.5 · §2.1 attendance |
| Journey / UF | J-HRM-06 · **06b** · **06c** · J-MOB-02/03/05/07/23..29 · UF-HRM-05 · **UF-HRM-16** · **UF-HRM-ATT-SIGN** |
| Prior BA ladder | `docs/qa/evidence/po-e2e-ba-case-matrix-01.md` · **LV-02 = WAIVED_P1** (PM `WAIVE_L2_PHASE1`) |
| Ladder N decision | `docs/program/specs/PO-HRM-ATT-LEAVE-LADDER-N-01.md` · DOCS merge `po-hrm-att-leave-ladder-docs-01.md` |
| honesty | `attendance_uat_ready=false` · Attendance **not CLOSED** · Face web HOLD · U65 zero-seed · **cấm** claim leave L2 LIVE |
| ack_status | **PASS_TO_PM** |

---

## 0. Verdict thẳng (cùng class lỗi REC)

Sponsor đúng khi mở rộng class REC sang **Chấm công + nghỉ**: không chỉ «màn load». Fail khi field/màn orphan, spine đứt, hoặc Diễn biến nông.

| Layer | Honesty |
|-------|---------|
| **Enterprise spine giấy** | Đã khóa: chấm theo ca → đơn phép (hold quỹ ATT-09) → tổng hợp bảng công (ATT-10) → ký chốt (ATT-11) → lương chỉ đọc bảng chốt (PAY-01). |
| **E2E-SPINE-02/03 program** | Leave: đăng ký → duyệt cấp → số dư/công cập nhật. Late ESS: đăng ký → duyệt → bản ghi phản ánh. |
| **AS-IS WF leave** | Catalog `hrm_leave_approval` = **1 bước** `direct_manager`. Phase-1 AC = L1-only (**WAIVE_L2_PHASE1**). Intent «hai cấp» / numeric day-cut = **WAIVED_P1** — Option A configurable **backlog** (không invent `N` / `T_L1=3`). |
| **FE embed `/attendance`** | Nhiều tab LIVE (records, leave, sheets, weekly, update/late-early, GPS work-sites, leave-balance panel) **và** nhiều surface orphan/alias/GĐ2 (leave-summary = cùng LeaveTab, export client-only, device tablet/proxy/auto stub, Face web HOLD, lịch phân ca GĐ2). |
| **UF đã 🟢** | UF-HRM-05 (records load) · UF-HRM-16 / J-HRM-06b (sheet create→list→weekly, no storm). **Không** = module ATT UAT-ready. |
| **UF còn ⬜** | UF-HRM-ATT-SIGN / J-HRM-06c (ký chốt) — spine sau 06b **chưa** nghiệm thu browser U65. |

**Kết luận BA:** Lõi quy trình giấy **có**; ladder L2 theo ngày = **WAIVED_P1** (Phase-1 = 1 bước QL trực tiếp — không invent N). Còn **impl_gap / orphan** (export, device, summary alias) + **spine break** (ký chốt chưa test; leave→bảng công funnel). **`attendance_uat_ready=false`** — cấm claim ATT UAT-ready.

---

## §1 Spine — Nút/tab → FR/UC → khóa mang → màn kế

> Gap class: `ok` | `impl_gap` | `spec_gap` | `console` | `out_mvp` | `broken`  
> Khóa mang = ID/kỳ/status user mang sang bước kế (không free-text SoT).

### §1.1 E2E-SPINE-02 — Nghỉ phép

| # | Bước nghiệp vụ | Actor | UI nút / tab (FE skim) | FR / UC | Khóa mang | Màn kế / consumer | Gap | Owner next |
|---|----------------|-------|------------------------|---------|-----------|-------------------|-----|------------|
| L1 | Chọn loại phép + kỳ + NV (web) / self (mobile) | NV · HCNS | Tab **Nghỉ phép** / Requests→Leave · `LeaveTab` · **Tạo yêu cầu nghỉ**; Mobile My Leaves | **FR-UC-BP-ATT-09** · ATT-08 · UC-HRM-10 · FR-UC-H03 | `leave_request_id` · `employee_id` · `leave_type` (catalog) · `from/to` · `total_days` · `company_id` | Panel quỹ ATT-05b → submit | **ok** lõi form + panel (UF-ATT-05b GWC hẹp); loại phép phải picker catalog — **ok** nếu bind SC-LEAVE | — |
| L2 | Panel quỹ khi mở form | Hệ thống | `leave-balance/panel` trong dialog tạo | **FR-UC-BP-ATT-05b** · ATT-04 | `employee_id` + `year` → `items[]` entitled/used/pending/remaining | User thấy số dư trước Gửi | **ok** narrow (panel GET); year default TZ — **impl_gap** nếu FE year ≠ panel year | sa/dev nếu period wire lệch |
| L3 | Validate ốm ≥3 ngày đính kèm | Hệ thống | Upload file trên form leave | FR-UC-H03 · BR-LEAVE-ATT-01 | `attachment_url` path `/api/hrm/files/...` | Chặn create nếu thiếu | **ok** code `HRM-LEAVE-VAL-ATT` (LV-03) | qa retest web |
| L4 | Validate báo trước phép năm ≥3 ngày lịch | Hệ thống | Submit leave | FR-UC-H03 BR-LEAVE-NOTICE-01 | `from_date` vs today | 4xx nếu sát ngày | **spec_gap**/PARTIAL — SRS LOCKED; BE enforce = QA verify | qa LV + dev-be nếu FAIL |
| L5 | Hold quỹ khi nộp | Hệ thống | Sau POST leave 2xx | **FR-UC-BP-ATT-09** | `pending` hold trên balance | Số dư available giảm pending | **impl_gap** nếu FE balance không refetch sau 2xx+F5 | qa LV-01 |
| L6 | Spawn WF duyệt | Hệ thống · XBOS | Invisible / status «Chờ duyệt» | FR-UC-B03 · LeaveWorkflowBridge · WF `hrm_leave_approval` | `workflow_instance_id` · task assignee = `direct_manager` | Inbox XBOS **hoặc** Mobile Phê duyệt | **impl_gap** nếu SPAWN-MISSING; AS-IS **1 bước** | devops/be honesty banner |
| L7 | Duyệt L1 QL trực tiếp | QL | Mobile **Cần duyệt** tab Nghỉ · hoặc Portal **Hộp thư** task leave · web approve trên LeaveTab | J-MOB-05 · UF-XBOS-08 · UC-HRM-10 approve | `leave_request_id` + decision | Status `approved` / `rejected` | **ok** AS-IS L1 path (J-MOB-05 GWC); **không** = ladder L2 | — |
| L8 | Duyệt L2 khi vượt ngưỡng ngày | GĐ / cấp 2 | (không yêu cầu Phase-1) | Intent H03 «hai cấp» · **BR-LEAVE-LADDER-01 numeric = WAIVED_P1** | (không enforce `total_days ? N` Phase-1) | Không nghiệm thu L2 Phase-1 | **out_mvp / WAIVED_P1** — cấm 🟢 LV-02; reopen = sponsor `N` hoặc config-from-FE | HOLD Dev `PO-HRM-ATT-LEAVE-LADDER-WF-01` |
| L9 | Chặn tự duyệt | Hệ thống | Cùng user Duyệt đơn mình | **BR-WF-04** | submitter ≠ assignee | 4xx; không APPROVED | **impl_gap** residual nếu runtime cho phép (LV-05) | qa + dev-be |
| L10 | Scope pháp nhân | Approver | Approve với JWT/CT lệch | BR scope · E-ATT-409 | `company_id` parity list↔mutate | 403/409 | **impl_gap** nếu lệch (LV-06) | qa + dev-be |
| L11 | Sau duyệt → số dư + phễu công | Hệ thống · HCNS | Leave list status; balance panel; **Bảng công** kỳ | ATT-09 Thành công · ATT-10 «Công nghỉ phép» | `leave_request_id` approved → sheet line / records period | Sheet tổng hợp thấy phép đã duyệt | **impl_gap** / **C-SPINE-BREAK** nếu approved leave **không** vào lưới tuần / summary kỳ | sa map funnel + qa AT/LV after sheet |
| L12 | Cross-nav list→detail leave | NV · QL | Mobile J-MOB-03; web leave detail modal | J-MOB-03/09 · J-HRM-06 | `leave_request_id` | Detail load; back list | **ok** mobile PASS lịch sử; web modal — verify F5 | qa spot |

### §1.2 E2E-SPINE-03 — Đi muộn / điều chỉnh công ESS

| # | Bước | Actor | UI | FR / UC | Khóa mang | Màn kế | Gap | Owner |
|---|------|-------|-----|---------|-----------|--------|-----|-------|
| A1 | NV tạo đơn đi muộn / điều chỉnh giờ | NV mobile | **Điều chỉnh chấm công** / update-request (ưu tiên ESS); web Requests→**Đi muộn về sớm** / **Cập nhật công** | UC-HRM-MOB-06..08 · UC-HRM-09 · LateEarly / Update tabs | `update_request_id` (hoặc late-early id) · `employee_id` · `date` · lý do | QL Cần duyệt | **impl_gap** dual surface late-early vs update-request — BA khóa **một** SoT ESS MVP = update-request trừ khi sponsor chọn late-early riêng | ba-docs terminology |
| A2 | Validate thiếu ngày/lý do | Hệ thống | Form | AT-02 | — | 4xx VI; không mutate | **ok** expect | qa |
| A3 | QL duyệt | QL | Mobile Phê duyệt / web Attendance requests | J-MOB-05/07 | request id → approved | Badge giảm | **ok** path tồn tại | qa-device AT-01 |
| A4 | Bản ghi / bảng công phản ánh | NV · HCNS | Mobile lịch sử · web **Bản ghi** / weekly sheet | AT-03 · ATT-10 | `attendance_record` kỳ + status late | FE sau 2xx + F5 thấy đúng kỳ; **≠ 1970** | **impl_gap** nếu approve không ghi record | dev-be + qa |
| A5 | Phạt muộn vào phễu | Hệ thống · CFG | Rules → phạt; sheet summary | **FR-UC-BP-ATT-02** | phút/block → sheet penalty field | PAY chỉ sau chốt | **impl_gap** nếu rules stub / không vào ATT-10 | sa + cfg seat |

### §1.3 Bảng công + ký chốt (spine ATT→PAY)

| # | Bước | Actor | UI | FR / UC | Khóa mang | Màn kế | Gap | Owner |
|---|------|-------|-----|---------|-----------|--------|-----|-------|
| S1 | Tạo bảng kỳ + Công chuẩn | HCNS | Attendance→**Bảng chấm công** → Thêm sheet | **HRM-AT-14** · UF-HRM-16 · J-HRM-06b | `attendance_sheet_id` · `period_from/to` · standard-work flag | List sheets | **ok** 🟢 UF-HRM-16 | must_keep |
| S2 | Mở lưới tuần / empty trung thực | HCNS | Open sheet → weekly | AC-ATT-SHEET-01..06 · BR-ATT-SHEET-07 | sheet id + `from_date`/`to_date` | Records GET ≤2/10s; **cấm** auto-reload storm | **ok** closed storm; **console** risk class nếu regress | qa regression |
| S3 | Tổng hợp phễu (chấm+phép+OT+phạt) | Hệ thống · HCNS | Summary / sheet lines | **FR-UC-BP-ATT-10** | sheet id + employee lines | Chờ ký | **impl_gap** / alias **summary≈records** (ACCEPTED_AS_IS #15 lịch sử) | out shallow RPT hoặc GĐ2 FR |
| S4 | Ký NV → QL → HCNS → Chốt | NV · QL · HCNS | `AttendanceSheetSignPanel` · J-HRM-06c | **FR-UC-BP-ATT-11** · UF-HRM-ATT-SIGN | `signature` rows + sheet status `closed` | PAY-01 đọc chốt | **C-SPINE-BREAK** · UF **⬜ UNTESTED** | Dev READY→**qa** U65 |
| S5 | Lương đọc bảng chốt | Payroll | Payroll kỳ | **FR-UC-BP-PAY-01** · BR-BP-TS-03 | `closed` sheet id kỳ | Không đọc leave/OT trực tiếp | Handoff **PAY seat** — ATT phải chốt trước | PAY-SPEC |

### §1.4 Cấu hình / surface phụ (orphan candidates)

| # | Surface FE (skim `Attendance.tsx`) | FR expect | Khóa mang | Gap class | Note |
|---|-----------------------------------|-----------|-----------|-----------|------|
| C1 | Settings→Rules **Chung / Công chuẩn / App** Lưu → `/attendance/rules` | ATT-01 · ATT-02 CFG | `company_id` + rules payload | **ok** partial LIVE (D3 ADR) | must_keep work-shifts |
| C2 | GPS **work-sites** CRUD | **ATT-03d** | `work_site_id` | **ok** UF-ATT-03d GWC hẹp | — |
| C3 | Rules tabs **tablet / proxy / auto** | — | — | **C-ORPHAN-SCREEN** / `out_mvp` | `featureInDev` stub — honesty; **cấm** fake LIVE |
| C4 | Settings sidebar **users / roles / system** | — | — | **C-ORPHAN-SCREEN** | stub placeholder |
| C5 | Face web registration/scanner | Face **mobile only** MVP | — | **out_mvp** web | HOLD; không claim Face LIVE web |
| C6 | Employee QR card | PROP-03e **OUT** | — | **out_mvp** | Unmounted / SKIP |
| C7 | Shifts→**Lịch phân ca / Ca làm thêm** | GĐ2 badge | — | **out_mvp** | featureInDev |
| C8 | Requests **leave-summary / compensatory-summary** | RPT riêng | — | **C-ORPHAN-SCREEN** | Cùng `LeaveTab` — ACCEPTED_AS_IS_P1 (#25–26); **cấm** claim RPT LIVE |
| C9 | **leave-plan** | GĐ2 | — | **out_mvp** | HOLD |
| C10 | Reports→**Xuất** `AttendanceExportDialog` | (không Diễn biến export Phase-1) | client XLSX / stub fetch | **C-ORPHAN-SCREEN** | ACCEPTED_AS_IS_P1 (#30); server PDF = GĐ2 candidate |
| C11 | Overview charts year | — | `year` query | **C-ORPHAN-FIELD** / OBS | year lag cosmetic ACCEPTED; drill GĐ2 |
| C12 | Customize columns non-persist | — | — | **C-ORPHAN-FIELD** | local UI only — honesty |

### §1.5 Thuật ngữ khóa (chống hiểu sai — class REC)

| UI / sponsor nói | SoT |
|------------------|-----|
| Duyệt nghỉ «hai cấp» | Intent deferred GĐ1.5; Phase-1 SoT = **1 bước QL trực tiếp** (`WAIVE_L2_PHASE1`); Option A configurable = backlog — **không** LIVE |
| Tổng hợp nghỉ / nghỉ bù (menu) | **Không** API RPT riêng Phase-1 — alias LeaveTab |
| Xuất báo cáo chấm công | Client dialog; **không** Nest export SoT Phase-1 |
| Đi muộn (mobile) | ESS SoT đề xuất = **update-request**; tab late-early web = sibling TXN |
| Bảng công chốt | Chỉ sau ATT-11 signatures + close — nguồn lương |
| Công chuẩn | Flag/kỳ trên sheet create (UF-HRM-16) — không nhầm «overview year» |

---

## §2 Scorecard C-* (ATT module)

| Class | ID | Evidence (spec vs FE/API) | Verdict | P0? |
|-------|-----|---------------------------|---------|-----|
| **C-ORPHAN-FIELD** | ATT-OF-01 | Overview / balance **year** vs sheet **period** — hai trục thời gian; chart year lag OBS | `impl_gap` (wire/honesty) | P1 (P0 nếu sai số dư năm) |
| **C-ORPHAN-FIELD** | ATT-OF-02 | Customize cột bảng công non-persist | `out_mvp` / honesty | No |
| **C-ORPHAN-FIELD** | ATT-OF-03 | Device rule fields trên tab tablet/proxy/auto không Lưu Nest | `out_mvp` stub | No (P0 nếu UI giả LIVE) |
| **C-ORPHAN-SCREEN** | ATT-OS-01 | leave-summary / compensatory-summary = LeaveTab | `ok` honesty ACCEPTED_AS_IS **hoặc** rename/hide | P1 |
| **C-ORPHAN-SCREEN** | ATT-OS-02 | Export dialog không Nest export | `out_mvp` / ACCEPTED | P1 |
| **C-ORPHAN-SCREEN** | ATT-OS-03 | users/roles/system settings stubs | `out_mvp` | No |
| **C-ORPHAN-SCREEN** | ATT-OS-04 | Face web / QR card / lịch phân ca GĐ2 | `out_mvp` | No |
| **C-SPINE-BREAK** | ATT-SB-01 | Leave L2 ladder intent vs WF 1 bước | `WAIVED_P1` (honesty) — **không** claim CLOSED as IMPLEMENTED | **P0 honesty** (cấm 🟢 LV-02); reopen → WF-01 |
| **C-SPINE-BREAK** | ATT-SB-02 | Approved leave → dòng bảng công / weekly (ATT-10 funnel) chưa khóa AC browser | `impl_gap` | **P0** khi mở UAT leave→pay |
| **C-SPINE-BREAK** | ATT-SB-03 | Ký chốt J-HRM-06c / UF-HRM-ATT-SIGN **UNTESTED** | `impl_gap` + gate | **P0** spine ATT→PAY |
| **C-SPINE-BREAK** | ATT-SB-04 | Late approve → record kỳ (AT-03) | `impl_gap` verify | P0 ESS |
| **C-CONSOLE-CRASH** | ATT-CC-01 | Empty grid + **auto-reload** / GET storm (BR-ATT-SHEET-07) | `ok` closed 06b; **console** regress = FAIL tức thì | P0 nếu regress |
| **C-CONSOLE-CRASH** | ATT-CC-02 | Dialog portal / Uncaught trên ATT dialogs (class REC dialog) | `console` — spot ATT | P0 nếu reproduce |
| **C-SPEC-SHALLOW** | ATT-SS-01 | Day-cut L1/L2 numeric | `WAIVED_P1` — Enterprise ATT-09 + HDSD GĐ1 = QL trực tiếp; **cấm** invent N | Closed as waived (not implemented) |
| **C-SPEC-SHALLOW** | ATT-SS-02 | HDSD bảng «Số ngày → người duyệt» | `WAIVED_P1` / HOLD — **không** ADD bảng đến reopen | P1 only on reopen |
| **C-SPEC-SHALLOW** | ATT-SS-03 | Self-approve / notice 3 ngày — Diễn biến web leave mỏng vs mobile | `spec_gap` partial | P1 ADD bullets |

**Module rollup:** `attendance_e2e_linkage = NOT_READY` · `attendance_uat_ready=false` — SB-02/03 còn mở; SB-01/SS-01 = **WAIVED_P1** (không đếm như IMPLEMENTED).

---

## §3 P0 known risk areas (chi tiết)

| Risk | Spec says | AS-IS / evidence | Class | Action (no code this wave) |
|------|-----------|------------------|-------|----------------------------|
| **Period / year wire** | Sheet kỳ `from/to`; balance `year`; overview year | Panel year default Asia/Ho_Chi_Minh; overview chart year lag OBS | C-ORPHAN-FIELD | AC: đổi year trên overview **không** đổi sheet period; balance year khớp form leave; QA stamp |
| **Empty grid + auto-reload** | AC-ATT-SHEET-04 · BR-ATT-SHEET-07 ≤2 GET/10s | UF-HRM-16 🟢 closed storm | C-CONSOLE | Regression bắt buộc mỗi wave ATT; FAIL nếu spinner/empty storm trở lại |
| **Leave ladder L1/L2 ngày cắt** | Intent hai cấp deferred | WF 1 step; **WAIVE_L2_PHASE1** stamped | ATT-SB-01 / SS-01 = **WAIVED_P1** | HOLD Dev ladder; reopen = sponsor `N` **or** config-from-FE → DOCS reopen → `PO-HRM-ATT-LEAVE-LADDER-WF-01`; Option A pack PRESERVED backlog; **cấm** invent N |
| **Self-approve** | BR-WF-04 | LV-05 case matrix | impl_gap verify | QA LV-05; Dev nếu 2xx approve self |
| **Company scope** | list↔approve parity; E-ATT-409 | LV-06; manager filter A-ATT-manager | impl_gap | QA member vs group; BE assertResourceInHrmScope |
| **Device rules orphan** | — | tablet/proxy/auto featureInDev | C-ORPHAN-SCREEN | Giữ stub honesty; **cấm** Lưu giả; optional hide GĐ2 |
| **Export orphan** | Không FR export Phase-1 | Client XLSX + stub monthly | C-ORPHAN-SCREEN | Giữ ACCEPTED_AS_IS; GĐ2 FR-ATT-EXPORT-* only if sponsor opens |

---

## §4 Draft SRS ADD bullets (ba-docs merge sau CONFIRM — no wipe · no_prompt_echo)

> Đề xuất mã tạm. Merge vào Enterprise SRS / team SRS bởi **ba-docs**. Không xóa FR ATT hiện có.

### §4.1 EXPAND — Thang duyệt phép theo số ngày (`BR-LEAVE-LADDER-01` / gắn FR-UC-H03 hoặc ATT-09)

> **DOC-DELTA 2026-08-06 — CHOSEN `WAIVE_L2_PHASE1`** (PM confirm · SA `PO-HRM-ATT-LEAVE-LADDER-N-01`). Merge Enterprise ATT-09 + HDSD §5.2–5.3: GĐ1 = QL trực tiếp. **Không** wipe khung Option A.

- **Phase-1 AC (LOCKED under WAIVE):** Mọi đơn nghỉ hợp lệ → L1 `direct_manager` → terminal `approved`/`rejected`. Khớp WF `hrm_leave_approval` 1 bước + FR-UC-BP-ATT-09 một QL.
- **Production `N` / `T_L1`:** **NOT_LOCKED** — **cấm** invent (ASSUMPTION `T_L1=3` ≠ SoT).
- **BR-LEAVE-LADDER-01 numeric cut:** **WAIVED_P1** — không enforce `total_days ? N` Phase-1.
- **Khung Option A (PRESERVE backlog GĐ1.5):** configurable `leave_l1_max_days` / `T_L1` + WF 2 bước + skipWhen — prior pack `po-e2e-leave-ladder-sa-01` … `qc-docs-01` · **HOLD implement** (`C-LEAVE-DEV-UNLOCK-01` · `PO-HRM-ATT-LEAVE-LADDER-WF-01` BLOCKED đến reopen).
- **HDSD Phase-1 (`BR-LEAVE-LADDER-HDSD-01`):** GĐ1 = QL trực tiếp; **không** bảng «Số ngày → người duyệt» đến reopen.
- **AC Phase-1:**
  - AC-ATT-LV-L1: đơn (mọi `total_days` AS-IS) → 1 complete L1 → approved + balance + F5 — **in-scope** U65.
  - AC-ATT-LV-L2: **WAIVED_P1** — verdict tối đa ⬜ / WAIVED_P1 — **cấm** 🟢.
  - AC-ATT-LV-SELF: submitter = approver → chặn (BR-WF-04) — vẫn in-scope.
- **QA rule Phase-1:** LV-02 = **WAIVED_P1** / ⬜ — **cấm** 🟢; LV-01 executable.
- **Reopen trigger:** Sponsor bus CONFIRM `N=<int>` **or** `config-from-FE unlock` → supersede WAIVE → DOCS reopen → WF-01.

### §4.2 ADD — Liên kết đơn phép đã duyệt → phễu bảng công kỳ

- **Mục đích:** Sau ATT-09 approved, kỳ sheet chứa khoảng nghỉ phải phản ánh «Công nghỉ phép» (ATT-10) trên lưới/summary — không chỉ status đơn.
- **Khóa mang:** `leave_request_id` + `employee_id` + date range → sheet line / record markers.
- **AC:** AC-ATT-LV-SHEET-01 — duyệt phép U65 → mở weekly cùng kỳ → thấy phép; F5 còn; không epoch 1970.

### §4.3 ADD/CONFIRM — ESS đi muộn SoT = update-request (trừ khi sponsor chọn late-early)

- **Mục đích:** Một spine AT-01..03; tránh orphan tab song song.
- **AC:** AT-01 mobile update-request → approve → records; web late-early nếu giữ = cùng state machine hoặc label GĐ2.

### §4.4 KEEP / seal — Ký chốt (đã có FR-UC-BP-ATT-11)

- Không ADD FR mới; **seal** UF-HRM-ATT-SIGN AC đã BA; bắt buộc QA browser trước claim ATT→PAY.

### §4.5 Honesty bullets (UI)

- Menu Tổng hợp nghỉ / nghỉ bù Phase-1 = cùng danh sách đơn (không RPT aggregate) **hoặc** ẩn đến GĐ2.
- Export = client; không khẳng định báo cáo máy chủ.
- Device tablet/proxy/auto = chưa vận hành — copy rõ.

---

## §5 P0_fix_queue (copy-ready PM — **NO CODE** đến confirm)

| Priority | work_item_id (đề xuất) | Owner | Entry | Exit | Depends |
|----------|------------------------|-------|-------|------|---------|
| P0-1 | `PO-HRM-ATT-LEAVE-LADDER-DOCS-01` | ba-docs | PM `WAIVE_L2_PHASE1` | WAIVE text trong SRS/HDSD/ATT §4.1; LV-02 WAIVED_P1; **không** bảng ngày→cấp; Option A pointer | **DONE** (this seat) |
| P0-2 | `PO-HRM-ATT-LEAVE-LADDER-WF-01` | sa → dev-be | **BLOCKED** — cần reopen N hoặc config-from-FE | WF 2 bước khi >N; bridge + jest | Reopen supersedes WAIVE |
| P0-3 | `PO-HRM-ATT-LEAVE-FUNNEL-SPEC-01` | sa (+ ba-data) | §4.2 confirm | TechSpec/API: approved leave → sheet/records fields | ATT-10 |
| P0-4 | `PO-HRM-ATT-SIGN-QA-01` | qa | Dev sign READY_FOR_QA · sheet submitted U65 | UF-HRM-ATT-SIGN · J-HRM-06c AC-ATT-SIGN-UF-01..07 PASS | UF-HRM-16 🟢 |
| P0-5 | `PO-HRM-ATT-SPINE-02-WEB-QA-01` | qa | L0; U65 | LV-01/03/04/05/06; **LV-02 = WAIVED_P1** (cấm 🟢) | case matrix |
| P0-6 | `PO-HRM-ATT-SPINE-03-MOB-QA-01` | qa-device | Emulator + manager hat | AT-01..03 + LV-01; U78 test-log | J-MOB-05 |
| P0-7 | `PO-HRM-ATT-SHEET-STORM-REG-01` | qa | Mỗi wave đụng Attendance.tsx / sheets | AC-ATT-SHEET-04 still PASS | must_keep 06b |
| P1-1 | `PO-HRM-ATT-ORPHAN-UI-HONESTY-01` | ba-docs → optional dev-fe | §4.5 confirm | Rename/hide summary alias · export/device copy | no fake LIVE |
| P1-2 | `PO-HRM-ATT-YEAR-PERIOD-AC-01` | ba-process delta → qa | §3 period/year | AC stamp overview≠sheet; balance year | ATT-OF-01 |

**FORBIDDEN queue:** `pnpm seed:*` để có leave/inbox; claim `attendance_uat_ready`; Dev mutate trước ba-docs/Tech khi đụng ladder/funnel; mở Face web / PROP-03e / REC-style dual SoT.

```text
Cascade (sau WAIVE_L2_PHASE1 docs):
  PO-HRM-ATT-LEAVE-LADDER-DOCS-01 (ba-docs)  [DONE under WAIVE]
  → PO-HRM-ATT-LEAVE-LADDER-WF-01  [HOLD / BLOCKED until reopen]
  → parallel ATT P0: FUNNEL-SPEC · SIGN-QA · SPINE web/mob (LV-01 honesty; LV-02 WAIVED_P1)
  → QC hẹp ATT — attendance_uat_ready=false đến SB-02/03 (+ funnel) đóng
```

---

## §6 Business rules (locked vs gap)

| BR | Điều kiện | Hành động | Outcome | Status |
|----|-----------|-----------|---------|--------|
| BR-LEAVE-ATT-01 | ốm ≥3 ngày thiếu file | Reject create | `HRM-LEAVE-VAL-ATT` | LOCKED |
| BR-LEAVE-NOTICE-01 | phép năm báo trước <3 ngày lịch | Reject create | theo FR-UC-H03 | SRS LOCKED · BE=QA |
| BR-WF-04 | assignee = submitter | Chặn duyệt | không APPROVED | LOCKED intent · verify LV-05 |
| BR-ATT-SHEET-02/07 | tab sheets/weekly open | Không storm GET | ≤2/10s | LOCKED AC · regress |
| BR-BP-TS-02/03 | ký chốt / PAY đọc | Đủ chữ ký → closed; PAY chỉ closed | ATT-11 · PAY-01 | LOCKED giấy · SIGN UF ⬜ |
| BR-CD-F4-02/04 | spawn leave | direct_manager · fallback hrbp | task QL | LOCKED AS-IS 1 bước |
| **BR-LEAVE-LADDER-01** | total_days vs N | L1-only vs L1+L2 | APPROVED đúng cấp | **WAIVED_P1** (numeric) · Option A khung = backlog |
| U65 | inbox trống | không seed | 🟡 BLOCKED | LOCKED sponsor |

---

## §7 Mapping case → J-* / UF-* (reuse matrix)

| Case | J-* / UF-* | FR | ATT seat note |
|------|------------|-----|---------------|
| LV-01 | J-MOB-03/05/07/23..29 · UF-HRM-05 | H03 · ATT-09 | AS-IS L1 PASS được |
| LV-02 | same | H03 + ladder | **WAIVED_P1** / ⬜ — cấm 🟢 |
| LV-03/04 | J-HRM-06 · UF-HRM-05 | H03 VAL-ATT | Web Attendance leave |
| LV-05/06 | UF-XBOS-08 / approve | BR-WF-04 · scope | P0 verify |
| AT-01..03 | J-MOB-02/05/07 · J-HRM-06 · UF-HRM-05 | MOB-06..08 | ESS spine |
| Sheet | J-HRM-06b · UF-HRM-16 | HRM-AT-14 | must_keep 🟢 |
| Sign | J-HRM-06c · UF-HRM-ATT-SIGN | ATT-11 | P0-4 |

---

## §8 Honesty locks

| Flag | Value |
|------|-------|
| `attendance_uat_ready` | **false** |
| Attendance module CLOSED | **false** |
| Face web LIVE | **false** (mobile MVP only) |
| Leave L2 ladder ready for QA 🟢 | **false** (**WAIVED_P1**) |
| Production `N` / `T_L1` | **NOT_LOCKED** |
| Option A backlog preserved | **true** |
| UF-HRM-16 / J-HRM-06b | **🟢 keep** — cấm regress storm |
| UF-HRM-ATT-SIGN | **⬜** |
| U65 zero-seed | **true** |
| Narrow GWC GPS/panel ≠ ATT UAT-ready | **true** |

---

## §9 BA accountability

1. Enterprise ATT spine (09→10→11→PAY) **đúng hướng** — không «không có nghiệp vụ».
2. **Depth ladder ngày** = spec_gap đã ghi từ `PO-E2E-BA-CASE-MATRIX-01` — seat này **neo vào E2E-LINK program** + orphan scorecard toàn menu ATT.
3. FE có **orphan/alias** giống class REC (summary, export, device) — BA phải honesty + optional hide; không bắt Dev «làm RPT» không FR.
4. **J-HRM-06b 🟢 ≠** spine leave/late/sign xong — PM không được đóng ATT seat chỉ vì sheet AC.

---

## Completion contract

- `completion_report`: Đã phát hành spine §1 (leave · late · sheet/sign · CFG orphan), scorecard C-* §2, P0 risks §3, draft SRS ADD §4, P0_fix_queue §5; honesty ATT not UAT-ready; **no apps/** · no seed · no UAT claim.
- `next_owner`: **pm** (intake) → ưu tiên **ba-docs** ladder/funnel confirm **hoặc** **qa** SIGN/SPINE web nếu Dev sign đã READY; **cấm** full Dev ladder trước docs.
- `next_dispatch_prompt`: (xem dưới)
- `ack_status`: **PASS_TO_PM**
- `evidence_path`: `docs/program/specs/PO-HRM-E2E-LINK-ATT-SPEC-01.md`
