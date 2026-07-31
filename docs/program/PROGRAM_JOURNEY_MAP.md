# Program journey map — PM orchestration SoT

**Owner:** PM (cập nhật sau mỗi incident / sprint)  
**Mục đích:** PM và QA **không** chỉ kiểm «tab load» — phải biết luồng user thật end-to-end.  
**Liên kết:** `PILOT_BUSINESS_FLOW_MATRIX.md` (L2), rule `uat-production-readiness-orchestration.mdc` (L2.5)

**Cập nhật:** 2026-07-27 — **J-HRM-IM-01** ADD (`BA-J-HRM-IM-01-JOURNEY-01` · FR-HRM-IM-01 preview); prior 2026-07-19 **J-REC-WF-01..06**; 2026-06-06 **J-XBOS-11** / **J-XBOS-01** + **J-XBOS-10**

**Program gate (nip.io):** **C-RBACQC-03 CLOSED** — `phase1:gate --strict` exit **0** (244/245 e2e_pass); A1 capabilities **2/2**; evidence [`p1-phase1-qc-program-gate-03-20260605.md`](../qa/evidence/p1-phase1-qc-program-gate-03-20260605.md). **NOT** Phase 1 DONE / **NOT** PROD-READY.

---

## Persona mặc định UAT

| Persona | Account | Scope JWT | Dùng cho |
|---------|---------|-----------|----------|
| Group CEO | `ceo@xe.vn` / `Xevn@2026` | `company_id=main`, tenant `xevn` | Command Center + HRM embed |
| Member CEO | `du-lich.ceo@xe.vn` / `Xevn@2026` (portal) | member slug (`xe-du-lich`) | Member slice + negatives; **không** `xevn-uat-2026` trên cổng web |
| Mobile NV | `uat.nv0001@xe.vn` / `xevn-uat-2026` | UUID company | HRM mobile **only** (`uat.nv####`) |

---

## Command Center — shell

| J-ID | Journey | From → To | API phụ thuộc | Status |
|------|---------|-----------|---------------|--------|
| J-CC-01 | Login tập đoàn | `/login` → `/command-center` | XBOS auth, JWT 86400 | ✅ L2 |
| J-CC-02 | Chọn đơn vị / holding shareholder | Settings → group-member-units → TẬP ĐOÀN → Chỉnh sửa → Danh sách Cổ đông → green ✓ POST | `tenant-scope/group-member-units` 200; POST `/legal-entities/{uuid}/shareholders` **201** `XBOS-SHR-201` | ✅ L2 · L2.5 browser :8088 **✅** 2026-06-20 §final2 (full src pscp + rail-ctx fix — [`p1-qa-8088-l25-cc-rail-20260620.md`](../qa/evidence/p1-qa-8088-l25-cc-rail-20260620.md)) |
| J-CC-03 | KPI rollup | CC dashboard load | kpi-engine rollup, không 409 | ✅ L2 |

---

## HRM embed — tab load (L2 = P-CC-03..08)

| P-CC | Route | Module |
|------|-------|--------|
| 03 | `/command-center/hrm/employees` | Nhân sự list |
| 04 | `/command-center/hrm/contracts` | Hợp đồng list |
| 05 | `/command-center/hrm/insurance` | Bảo hiểm |
| 06 | `/command-center/hrm/recruitment` | Tuyển dụng |
| 07 | `/command-center/hrm/attendance` | Chấm công |
| 08 | `/command-center/hrm/payroll` | Lương |

---

## HRM embed — cross-navigation (L2.5 = bắt buộc QA)

| J-ID | Journey | Steps | Scope note | Status |
|------|---------|-------|------------|--------|
| **J-HRM-01** | **Hợp đồng → Hồ sơ NV** | P-CC-04 list → click tên NV → `/employees/:id` | `GET /employees/:id?company_id=main` phải rollup như list (ADR C2) | ✅ PASS · [W5B L2.5](docs/qa/evidence/p1-close-qa-w5b-20260525.md#l25) · **W2a standalone** `:8080/hr/employees` mobile JWT **GWC** 2026-08-01 · [`qc-hrm-w2a-standalone-rbac-01-20260801.md`](../qa/evidence/qc-hrm-w2a-standalone-rbac-01-20260801.md) · R-W2A-RBAC-01 closed |
| **J-HRM-02** | Nhân sự list → Hồ sơ | P-CC-03 → row → detail | Same scope parity | ✅ API PASS · group CEO C/U/D nip.io 2026-06-05 · browser L2.5 **GWC** (**C-EMPGRPQC-01**) · [`p1-phase1-qc-hrm-emp-group-crud-20260604.md`](../qa/evidence/p1-phase1-qc-hrm-emp-group-crud-20260604.md) · **Scale FE W1** Dev8088 2026-07-17: T-FANOUT ≤1 + profile dedupe CLOSED · QC GWC [`qc-p1-hrm-scale-w1-20260717.md`](../qa/evidence/qc-p1-hrm-scale-w1-20260717.md) |
| J-HRM-03 | Hợp đồng → tab chi tiết HĐ | P-CC-04 → open contract drawer/modal | contracts-insurance API | ✅ PASS · H12 browser 2026-06-06 · [`p1-hrm-h12-journey-qa-20260606.md`](../qa/evidence/p1-hrm-h12-journey-qa-20260606.md) · QC H11 [`qc-p1-hrm-h11-closeout-20260606.md`](../qa/evidence/qc-p1-hrm-h11-closeout-20260606.md) |
| J-HRM-04 | Bảo hiểm → NV linked | P-CC-05 → employee link | insurance + employee scope | ✅ PASS · J04 retest 2026-06-06 · H13 ins-summary regression · [`p1-hrm-h13-ins-summary-qa-20260606.md`](../qa/evidence/p1-hrm-h13-ins-summary-qa-20260606.md) · QC H13 regate [`qc-p1-hrm-h13-regate-20260606.md`](../qa/evidence/qc-p1-hrm-h13-regate-20260606.md) |
| J-HRM-05 | Tuyển dụng → ứng viên/requisition | P-CC-06 → detail | recruitment API | ✅ PASS · [W5B L2.5](docs/qa/evidence/p1-close-qa-w5b-20260525.md#l25) · **must_keep** for REC-WF bridge |
| J-HRM-06 | Chấm công → bản ghi / yêu cầu | P-CC-07 → detail | attendance scope | ✅ PASS · [W5B L2.5](docs/qa/evidence/p1-close-qa-w5b-20260525.md#l25) · **HTTPS pilot** [R6](docs/qa/evidence/p1-ex-qa-https-j-hrm-06-01-r6-20260529.md) [QC GWC](docs/qa/evidence/qc-https-j-hrm-06-01-r6-20260529.md) · **local :5173** [QA+QC GWC r2 2026-07-30](docs/qa/evidence/p1-ex-qc-https-residual-03-r3-20260730-local5173.md) incl. dashboard C-RES03R3-06 |
| **J-HRM-06b** | **Bảng chấm công** tạo → list → mở lưới | P-CC-07 / `/attendance` → Thêm sheet (kỳ + Công chuẩn) → list → open weekly | `POST/GET attendance-sheets` + `GET records` kỳ; **cấm** reload storm | ✅ PASS · [QA AC 2026-07-21](../qa/evidence/qa-hrm-att-sheet-ac-01-20260721.md) · AC-ATT-SHEET-01..06 · [BA AC](../qa/evidence/ba-hrm-att-sheet-ac-01-20260721.md) · [QC GWC](../qa/evidence/qc-hrm-att-sheet-ac-01-20260721.md) · **UF-HRM-16 🟢** [promote](../qa/evidence/qa-uf-hrm-16-promote-01-20260721.md) |
| J-HRM-07 | Lương → phiếu lương | P-CC-08 → payslip detail | payroll scope | ✅ PASS · [W5B L2.5](docs/qa/evidence/p1-close-qa-w5b-20260525.md#l25) · H1–H7 browser retest 2026-06-06 · QC GWC [`qc-p1-hrm-h1-7-20260606.md`](../qa/evidence/qc-p1-hrm-h1-7-20260606.md) |
| J-HRM-08 | Catalog governance approve | P-CC-09 → inbox → approve | XBOS write scope strict | ✅ S2 |
| **J-HRM-CO-01** | **Company Management headcount + ngành nghề** | `/command-center/hrm/company` → card «Tổng nhân viên» + cột «Số nhân viên» + cột «Ngành nghề» → F5; optional row→detail back | LE→slug bridge · `summary?company_id=main` parity · **AC-CO-EMP-01..06** · **AC-CO-IND-01..04** (cấm `industry←entity_type`) | ✅ PASS local (2026-07-27) — headcount [`qa-hrm-co-emp-count-01`](../qa/evidence/qa-hrm-co-emp-count-01-20260727.md) · industry [`qa-hrm-co-industry-01`](../qa/evidence/qa-hrm-co-industry-01-20260727.md) · QC GWC [`qc-hrm-co-industry-01`](../qa/evidence/qc-hrm-co-industry-01-20260727.md); HOLD_DEPLOY / NOT :8088 |
| **J-HRM-IM-01** | **Nhân sự → Import Excel preview (non-persist)** | P-CC-03 Employees → Import Excel → upload sheet → preview table → **Cancel** → **F5** (host **J-HRM-02** list unchanged) | **FR-HRM-IM-01** · AC-IM-01-SCOPE/SESSION/VAL · `POST /api/hrm/spreadsheet/import/preview` → **HTTP 200** + **`SHEET-200`** · `dryRun` · **zero persist** (no employee INSERT; no commit IM-02) · U65 zero-seed · Group CEO `company_id=main` | ✅ **PASS local** (2026-07-27) — QA [`qa-hrm-im-01-preview-ac-01`](../qa/evidence/qa-hrm-im-01-preview-ac-01-20260727.md) · QC GWC [`qc-hrm-im-01-preview-ac-01`](../qa/evidence/qc-hrm-im-01-preview-ac-01-20260727.md) · BA map [`ba-j-hrm-im-01-journey-01`](../qa/evidence/ba-j-hrm-im-01-journey-01-20260727.md); **HOLD_DEPLOY** / **NOT :8088** / **NOT** IM-02 |
| **J-HRM-MENU-SWEEP** | **Full AppSidebar leaf sweep** | Login Group CEO → từng leaf sidebar (17) + deep Lương / Settings catalogs / metadata | Load OK · no tech chrome · no crash/console P0 · empty/stub OK · UF-HRM-MENU-01..17 | 🟡 Local GWC · Dev8088 ⬜ — [sweep](../qa/evidence/qa-hrm-menu-full-sweep-01-20260720.md) · [R2](../qa/evidence/qa-hrm-menu-full-sweep-01-r2-20260720.md) · [QC GWC](../qa/evidence/qc-hrm-menu-full-sweep-01-20260720.md) · [BA matrix](../qa/evidence/ba-hrm-menu-uf-matrix-01-20260720.md) · matrix §4b |

<a id="j-hrm-menu-sweep"></a>

**J-HRM-MENU-SWEEP notes:** Không thay J-HRM-01..08 (cross-nav mutate). Gate riêng cho **coverage sidebar**. Residual P3: metadata workflow id strings (`UF-HRM-MENU-17`). Promote Dev8088 = optional QA sau Local GWC.

**FAIL pattern (P0):** UI «Không tìm thấy nhân viên», console **404** trên `GET /employees/:id` với `company_id=main`.

---

## HRM ↔ XBOS — Recruitment workflow bridge (L2.5 draft — `XHRM-REC-WF-BA-01`)

**SoT delta:** [`docs/program/deltas/XBOS_HRM_REC_WF_BRIDGE_BA_DELTA.md`](./deltas/XBOS_HRM_REC_WF_BRIDGE_BA_DELTA.md) · Program `P1-XBOS-HRM-REC-WF-BRIDGE`  
**U65:** zero-seed; FE chain only. **must_keep:** UF-HRM-12 · J-HRM-05 · LeaveWorkflowBridge · F6 AC-CD-F6-*.

| J-ID | Journey | Steps | Scope note | Status |
|------|---------|-------|------------|--------|
| **J-REC-WF-01** | XBOS canvas QT tuyển dụng | Admin → Workflow canvas → save active `hrm_recruitment_*` definition → reload resolver còn | UC-HRM-REC-WF-01 · AC-REC-WF-01 | ✅ PASS 2026-07-22 `bm-qa-j-rec-wf-01-canvas-01` |
| **J-REC-WF-02** | Submit plan → spawn instance | P-CC-06 / HRM → tạo plan → Gửi duyệt → start 2xx **hoặc** banner `SPAWN-MISSING` + pending → F5 | UC-HRM-REC-WF-02 · Group CEO `company_id=main` rollup | ✅ PASS R2 2026-07-22 `bm-qa-rec-wf-spawn-r2` / QC GWC |
| **J-REC-WF-03** | Inbox duyệt → HRM sync | XBOS Inbox → task tuyển dụng → Duyệt → plan/req status sync → F5 | Maps J-XBOS-01 pattern · **cấm** seed inbox | ✅ PASS 2026-07-22 `bm-qa-j-rec-wf-03-inbox-01` |
| **J-REC-WF-04** | Roadmap bước ứng viên | Candidate detail roadmap → sau step inbox → stage chip = map F6 → cross-nav J-HRM-05 | UC-HRM-REC-WF-04 · unmapped = fail-closed | ✅ PASS R2 2026-07-22 `bm-qa-j-rec-wf-04-step-sync-r2` / QC GWC |
| **J-REC-WF-05** | Dashboard funnel sau WF sync | P-CC-06 dashboard → 6 cột = live aggregate; filter ĐVTV | Extends AC-CD-F6-03/04 · BR-DQ-01 | ✅ PASS 2026-07-22 `bm-qa-j-rec-wf-05-funnel-01` |
| **J-REC-WF-06** | Reject path | Inbox Từ chối + lý do → rejected + notify; không downgrade `hired` | UC-HRM-REC-WF-06 | ✅ PASS 2026-07-22 `bm-qa-j-rec-wf-06-reject-01` / QC GWC |

---

## HRM embed — avatar display (W4)

| J-ID | Journey | Status |
|------|---------|--------|
| **J-AVT-01** | Web — employees list + profile **holding `<img>`** (TCN-0954) | ✅ **PASS** nip.io L2.5 · QA R4 [`pcomp-w4-profile-avatar-01-qa-web-display-r4-20260607.md`](../qa/evidence/pcomp-w4-profile-avatar-01-qa-web-display-r4-20260607.md) · QC **GO (scoped)** [`pcomp-w4-qc-avatar-display-r4-20260607.md`](../qa/evidence/pcomp-w4-qc-avatar-display-r4-20260607.md) |
| J-AVT-02 | Mobile — avatar upload + display (native picker) | ✅ **device PASS** QC CLOSED · QA R4 [`pcomp-w8-mob-residual-r4-01-20260609.md`](../qa/evidence/pcomp-w8-mob-residual-r4-01-20260609.md) · QC [`qc-pcomp-w8-mob-residual-r4-01-20260609.md`](../qa/evidence/qc-pcomp-w8-mob-residual-r4-01-20260609.md) · **C-W4QC-AVT-MOB-01/02 CLOSED** · **C-W7QC-DEVICE-01 CLOSED** |

---

## Mobile (L2.5)

| J-ID | Journey | Status |
|------|---------|--------|
| J-MOB-01 | Login → scope select → home | ✅ smoke · health **200** · UUID on panel [W10-D02](docs/qa/evidence/p1-p100-w10-device-02-20260531.md) · localhost API H9/H11 2026-06-06 · QC H11 [`qc-p1-hrm-h11-closeout-20260606.md`](../qa/evidence/qc-p1-hrm-h11-closeout-20260606.md) · **umbrella MOB-UX-11 gate** [`qc-pcomp-w8-mob-ui-qc-01-20260609.md`](../qa/evidence/qc-pcomp-w8-mob-ui-qc-01-20260609.md) |
| J-MOB-02 | Check-in GPS | ✅ smoke · localhost API H9/H11 2026-06-06 · typography regate MOB-UX-03-GLOBAL [`qc-mob-ux-03-global-20260609.md`](../qa/evidence/qc-mob-ux-03-global-20260609.md) · **umbrella MOB-UX-11 gate** [`qc-pcomp-w8-mob-ui-qc-01-20260609.md`](../qa/evidence/qc-pcomp-w8-mob-ui-qc-01-20260609.md) |
| J-MOB-03 | Leave list → **row tap** → detail | ✅ **PASS** device R4 · `uat.nv0001@xe.vn` · [`p1-phase1-qa-mob-jmob-20260604-r4.md`](../qa/evidence/p1-phase1-qa-mob-jmob-20260604-r4.md) · typography regate MOB-UX-03-GLOBAL [`qc-mob-ux-03-global-20260609.md`](../qa/evidence/qc-mob-ux-03-global-20260609.md) |
| J-MOB-04 | Payslip list → **detail tap** | ✅ **PASS** strict R4 · Thực lĩnh · push-guard APK 2026-06-04 · typography regate MOB-UX-03-GLOBAL [`qc-mob-ux-03-global-20260609.md`](../qa/evidence/qc-mob-ux-03-global-20260609.md) |
| J-MOB-05 | Manager approvals → **Duyệt** | ✅ **PASS** strict R4 · Thành công (no raw **HRM-ATT-REQ-203**) · qual seed if `pending=0` · typography regate MOB-UX-03-GLOBAL [`qc-mob-ux-03-global-20260609.md`](../qa/evidence/qc-mob-ux-03-global-20260609.md) |
| J-MOB-06 | Login → Home **«Việc cần làm»** visible | ✅ **device PASS** scroll regression · [`pcomp-w8-mob-ess-dash-qc-01-20260608.md`](../qa/evidence/pcomp-w8-mob-ess-dash-qc-01-20260608.md) · MOB-UX-08 regate [`qc-mob-ux-08-p0-20260609.md`](../qa/evidence/qc-mob-ux-08-p0-20260609.md) · **umbrella MOB-UX-11 gate** [`qc-pcomp-w8-mob-ui-qc-01-20260609.md`](../qa/evidence/qc-pcomp-w8-mob-ui-qc-01-20260609.md) |
| J-MOB-07 | Manager Home **«Cần duyệt (n)»** card | ✅ **device PASS** mgr=2 · [`pcomp-w8-mob-ess-dash-qc-01-20260608.md`](../qa/evidence/pcomp-w8-mob-ess-dash-qc-01-20260608.md) · MOB-UX-08 regate [`qc-mob-ux-08-p0-20260609.md`](../qa/evidence/qc-mob-ux-08-p0-20260609.md) |
| J-MOB-08 | Home → **Sinh nhật hôm nay** (horizontal avatars, no birth year) | ✅ **device PASS** · [`pcomp-w8-mob-ess-dash-qc-01-20260608.md`](../qa/evidence/pcomp-w8-mob-ess-dash-qc-01-20260608.md) · MOB-UX-08 rich cards regate [`qc-mob-ux-08-p0-20260609.md`](../qa/evidence/qc-mob-ux-08-p0-20260609.md) · **umbrella MOB-UX-11 gate** [`qc-pcomp-w8-mob-ui-qc-01-20260609.md`](../qa/evidence/qc-pcomp-w8-mob-ui-qc-01-20260609.md) |
| J-MOB-09 | Home → **Ai nghỉ hôm nay** → tap → LeaveRequestDetail | ✅ **device PASS** QC CLOSED · [`pcomp-w7-qc-hub-r3-05-detail-20260609.md`](../qa/evidence/pcomp-w7-qc-hub-r3-05-detail-20260609.md) · MOB-UX-08 regate [`qc-mob-ux-08-p0-20260609.md`](../qa/evidence/qc-mob-ux-08-p0-20260609.md) · **umbrella MOB-UX-11 gate** [`qc-pcomp-w8-mob-ui-qc-01-20260609.md`](../qa/evidence/qc-pcomp-w8-mob-ui-qc-01-20260609.md) |
| J-MOB-17 | Profile **Hồ sơ** → segmented tabs **Thông tin / Công việc / Tài liệu** + task card | ✅ **device CLOSED** MOB-UX-09 [`qc-mob-ux-09-profile-tabs-20260609.md`](../qa/evidence/qc-mob-ux-09-profile-tabs-20260609.md) · QA [`mob-ux-09-profile-tabs-qa-20260609.md`](../qa/evidence/mob-ux-09-profile-tabs-qa-20260609.md) · Z-P06 SET E · GWC **D-MOB-UX09-IA-01** root tab relabel backlog · **umbrella MOB-UX-11 gate** [`qc-pcomp-w8-mob-ui-qc-01-20260609.md`](../qa/evidence/qc-pcomp-w8-mob-ui-qc-01-20260609.md) |
| J-MOB-11..15 | Home **portal shell** (header, carousel, grid, payslip feed) | ✅ **device PASS** J-MOB-11..15 · MOB-UX-08 U53 scroll+headers [`qc-mob-ux-08-p0-20260609.md`](../qa/evidence/qc-mob-ux-08-p0-20260609.md) · prior [`pcomp-w8-mob-home-portal-qc-02-20260608.md`](../qa/evidence/pcomp-w8-mob-home-portal-qc-02-20260608.md) · GWC **C-W8-DEVICE-01** + **D-W8-ESS-PROMISE-01** · **umbrella MOB-UX-11 gate** [`qc-pcomp-w8-mob-ui-qc-01-20260609.md`](../qa/evidence/qc-pcomp-w8-mob-ui-qc-01-20260609.md) |
| J-MOB-19..22 | Home **ESS layer** (role header, date, stats, 4 cards, announcements) | ✅ **device PASS** QC GWC · [`pcomp-w8-mob-ess-dash-qc-01-20260608.md`](../qa/evidence/pcomp-w8-mob-ess-dash-qc-01-20260608.md) · condition D-W8-ESS-PROMISE-01 · **umbrella MOB-UX-11 gate** [`qc-pcomp-w8-mob-ui-qc-01-20260609.md`](../qa/evidence/qc-pcomp-w8-mob-ui-qc-01-20260609.md) |
| J-MOB-23..29 | Leave UX polish (inline approve, My Leaves tabs+balance, form) | ✅ **device PASS** QC CLOSED · QA R4 [`pcomp-w8-mob-residual-r4-01-20260609.md`](../qa/evidence/pcomp-w8-mob-residual-r4-01-20260609.md) · QC [`qc-pcomp-w8-mob-residual-r4-01-20260609.md`](../qa/evidence/qc-pcomp-w8-mob-residual-r4-01-20260609.md) · prior R3 [`pcomp-w8-mob-ess-leave-01-r3-20260609.md`](../qa/evidence/pcomp-w8-mob-ess-leave-01-r3-20260609.md) · **D-W8-MOB-BAL-UI-01 CLOSED** J-MOB-25/28 numeric 8/3 · **umbrella MOB-UX-11 gate GWC** J-MOB-24/29 [`qc-pcomp-w8-mob-ui-qc-01-20260609.md`](../qa/evidence/qc-pcomp-w8-mob-ui-qc-01-20260609.md) |
| J-MOB-30 | Team directory tab + row→detail | ✅ **device CLOSED** MOB-W7-5 [`qc-mob-w7-5-directory-final-20260609.md`](../qa/evidence/qc-mob-w7-5-directory-final-20260609.md) — list + badges @ nip.io trsport · **ext ✅ row→detail CLOSED** R-DIR-DETAIL-01 [`qc-r-dir-detail-01-20260609.md`](../qa/evidence/qc-r-dir-detail-01-20260609.md) · prior UI [`qc-mob-ux-08-team-20260609.md`](../qa/evidence/qc-mob-ux-08-team-20260609.md) · **GWC-DIR-NIP-01** + **GWC-DIR-ROWS-01** lifted · **umbrella MOB-UX-11 gate** [`qc-pcomp-w8-mob-ui-qc-01-20260609.md`](../qa/evidence/qc-pcomp-w8-mob-ui-qc-01-20260609.md) |
| J-MOB-31..35 | ZenHR polish (pending strip, action grid, **FAB**, salary hero, timeline) | ✅ **umbrella MOB-UX-11 gate CLOSED** [`qc-pcomp-w8-mob-ui-qc-01-20260609.md`](../qa/evidence/qc-pcomp-w8-mob-ui-qc-01-20260609.md) · **J-MOB-31/33** MOB-UX-10-P0 [`qc-mob-ux-10-p0-20260609.md`](../qa/evidence/qc-mob-ux-10-p0-20260609.md) · **J-MOB-32 ✅ device CLOSED** MOB-UX-10a [`qc-mob-ux-10a-20260609.md`](../qa/evidence/qc-mob-ux-10a-20260609.md) · **J-MOB-34** MOB-UX-11a-10c [`qc-mob-ux-11a-10c-20260609.md`](../qa/evidence/qc-mob-ux-11a-10c-20260609.md) · **J-MOB-35 ✅ device CLOSED** MOB-UX-10d [`qc-mob-ux-10d-20260609.md`](../qa/evidence/qc-mob-ux-10d-20260609.md) · **J-MOB-35 ext ✅ device CLOSED** MOB-UX-11d SET F-4 [`qc-mob-ux-11d-20260609.md`](../qa/evidence/qc-mob-ux-11d-20260609.md) · **MOB-UX-11f** motion [`qc-mob-ux-11f-20260609.md`](../qa/evidence/qc-mob-ux-11f-20260609.md) |

---

## XBOS / workflow (Phase 1 partial)

| J-ID | Journey | Status |
|------|---------|--------|
| J-XBOS-01 | Workflow inbox → approve (`POST …/complete` **XBOS-WF-200**) | ✅ L2.5 PASS local browser · [`p1-xbos-w7-wf-qa-retest-20260606.md`](../qa/evidence/p1-xbos-w7-wf-qa-retest-20260606.md) · QC GWC [`qc-p1-xbos-w7-20260606.md`](../qa/evidence/qc-p1-xbos-w7-20260606.md) |
| J-XBOS-02 | Catalog publish → HRM sync | ✅ API L2.5 PASS · [`p1-s5-qa-jxbos-02-retest-20260605.md`](../qa/evidence/p1-s5-qa-jxbos-02-retest-20260605.md) |
| J-XBOS-03 | CC Settings → Đơn vị thành viên → legal save → F5 round-trip | ✅ L2 PASS local `:5173` · [`p1-xbos-w1-legal-audit-20260606.md`](../qa/evidence/p1-xbos-w1-legal-audit-20260606.md) · QC GWC [`qc-p1-xbos-w1-20260606.md`](../qa/evidence/qc-p1-xbos-w1-20260606.md) |
| J-XBOS-04 | Legal entity → Cổ đông + Tài liệu CRUD persist | ✅ L2 PASS local (SHR fix) · [`p1-xbos-w1-shr-qa-retest-20260606.md`](../qa/evidence/p1-xbos-w1-shr-qa-retest-20260606.md) · D-W1-SHR-01 closed |
| J-XBOS-05 | Infrastructure foundation → scope → sites + custom fields | ✅ L2 PASS `:8088` wizard wave · QC GWC [`p1-infra-fcat-qc-20260620.md`](../qa/evidence/p1-infra-fcat-qc-20260620.md) · QA [`p1-infra-fcat-wizard-qa-20260620.md`](../qa/evidence/p1-infra-fcat-wizard-qa-20260620.md) · prior local [`p1-xbos-w2-infra-fix-20260606.md`](../qa/evidence/p1-xbos-w2-infra-fix-20260606.md) |
| J-XBOS-06 | Dept template save → Chi tiết → Tham chiếu Khung đã lưu | ✅ L2 PASS local · QC GWC [`qc-p1-xbos-w3-20260606.md`](../qa/evidence/qc-p1-xbos-w3-20260606.md) · evidence [`p1-xbos-w3-dept-regression-20260606.md`](../qa/evidence/p1-xbos-w3-dept-regression-20260606.md) · D-U31-DEPT-REF-SYNC-01 closed |
| J-XBOS-07 | Phòng/Ban pháp nhân — add node → F5 persist | ✅ L2 PASS local R2 · [`p1-xbos-w4-dept-tree-retest-20260606.md`](../qa/evidence/p1-xbos-w4-dept-tree-retest-20260606.md) · QC GWC [`qc-p1-xbos-w4-20260606.md`](../qa/evidence/qc-p1-xbos-w4-20260606.md) |
| J-XBOS-08 | Danh mục NS sync → HRM read-back | ✅ L2 PASS local · QC GWC [`qc-p1-xbos-w5-hrm-cat-20260606.md`](../qa/evidence/qc-p1-xbos-w5-hrm-cat-20260606.md) · evidence [`p1-xbos-w5-hrm-cat-qa-retest-20260606.md`](../qa/evidence/p1-xbos-w5-hrm-cat-qa-retest-20260606.md) · D-W5-HRM-CAT-SYNC-01 closed |
| J-XBOS-09 | Phân quyền — toggle → debounce → F5 matrix sticky | ✅ L2 PASS local · [`p1-xbos-w6-rbac-audit-20260606.md`](../qa/evidence/p1-xbos-w6-rbac-audit-20260606.md) · QC GWC [`qc-p1-xbos-w6-20260606.md`](../qa/evidence/qc-p1-xbos-w6-20260606.md) |
| J-XBOS-10 | Workflow: tạo → lưu → list consumer sync (U34, no F5) | ✅ L2 PASS local · [`p1-xbos-w7-wf-qa-retest-20260606.md`](../qa/evidence/p1-xbos-w7-wf-qa-retest-20260606.md) · QC GWC [`qc-p1-xbos-w7-20260606.md`](../qa/evidence/qc-p1-xbos-w7-20260606.md) |
| J-XBOS-11 | Văn bản / Đo lường / Giá — edit → debounce → U34 + F5 DB persist | ✅ L2.5 PASS local · [`p1-xbos-w8-catalogs-qa-retest-20260606.md`](../qa/evidence/p1-xbos-w8-catalogs-qa-retest-20260606.md) · QC GWC [`qc-p1-xbos-w8-20260606.md`](../qa/evidence/qc-p1-xbos-w8-20260606.md) · D-W8-CAT-SCOPE-01 closed |
| J-XBOS-12 | Yêu cầu tài sản — create → U34 list sync → transition (KT 5 bước) | ✅ L2 PASS local · U34 consumer sync · [`p1-xbos-w9-asset-audit-20260606.md`](../qa/evidence/p1-xbos-w9-asset-audit-20260606.md) · QC GWC [`qc-p1-xbos-w9-20260606.md`](../qa/evidence/qc-p1-xbos-w9-20260606.md) |
| **J-XBOS-CTRL-01** | Holding publish `departments` → apply-to-members → HRM Settings sync/pull → list + F5 | 🟢 PASS · QA [`qa-xbos-ctrl-g1-01-20260729.md`](../qa/evidence/qa-xbos-ctrl-g1-01-20260729.md) · QC GWC [`qc-xbos-ctrl-g1-01-20260729.md`](../qa/evidence/qc-xbos-ctrl-g1-01-20260729.md) · sponsor Telegram «Chốt P0+P1» · HOLD_DEPLOY |
| **J-XBOS-CTRL-02** | Apply `leave_types` (+ `job_titles` regression) → HRM Settings → F5 | 🟢 PASS · same QA/QC pack · API CFG-204 leave_types · U65 |
| **J-XBOS-CTRL-03** | Apply key ngoài allow-list → **400** `XBOS-CFG-005`; member không đổi | 🟢 PASS · Tier C CFG-005 trong QA/QC G1 |

---

## PM dispatch checklist (mỗi wave QA)

- [ ] Liệt kê J-* in-scope trong Task prompt
- [ ] Account = `ceo@xe.vn` cho CC/HRM embed
- [ ] Evidence path + screenshot/console cho mỗi J-* FAIL
- [x] Cập nhật cột Status bảng này sau verdict (J-HRM-01..07 — `P1-EX-PM-01` 2026-05-26)

---

## Incident log

| Date | J-ID | Symptom | Root cause | Fix / governance |
|------|------|---------|------------|------------------|
| 2026-05-24 | J-HRM-01 | 404 employee from contracts | `getEmployeeById` exact `main`, list đã rollup | BE scope parity + rule U19 + matrix J-* |
| 2026-05-26 | J-HRM-01..07 | Map ⏳ vs QA **7/7 PASS** (EX-R07) | Governance drift post W5B | PM `P1-EX-PM-01` — SoT → ✅ PASS; evidence `p1-ex-pm-01-20260526.md` |
| 2026-05-31 | J-MOB-03..05 | Device empty + **HRM-AUTH-001** vs pilot data | Installed APK sends **`x-company-id: main`**; MOB-HEADER release APK not installed | `P1-P100-W10-DEVICE-01` FAIL → PM dispatch APK-01 + device retest |
| 2026-05-31 | J-MOB-03..05 | MOB-HEADER APK installed; lists still **HRM-AUTH-001** | Home panel shows UUID but outbound/list still **`main`** slug + 403 | `P1-P100-W10-DEVICE-02` FAIL → `P1-P100-W10-MOB-HEADER-02` dev-mobile |
| 2026-06-04 | J-MOB-03..05 | R1–R4 device waves | BE scope + FE payslip/approve + push guard + VPS qual hook | **PASS** strict R4 · [`p1-phase1-qa-mob-jmob-20260604-r4.md`](../qa/evidence/p1-phase1-qa-mob-jmob-20260604-r4.md) |
| 2026-06-05 | J-HRM-02 / J-XBOS-01 | Journey map vs matrix drift post strict gate | **C-RBACQC-05** — BA sync `P1-PHASE1-BA-JOURNEY-SYNC-06`; statuses unchanged (API PASS · browser GWC optional) |
| 2026-06-06 | J-XBOS-05 | QC f5ebebe1 4b GWC vs QA 392d4aa0 VISUN PASS | Duplicate evidence paths | PM SoT: authoritative retest on `p1-xbos-w2-infra-fix-20260606.md`; C-W2QC-01 waived — no dev dispatch |
| 2026-06-20 | J-XBOS-05 | FCAT wizard + consumer bind on `:8088` | Inline list pollution + missing consumer field | FE wizard + consumer bind; QC GWC `p1-infra-fcat-qc-20260620.md` — R-QA-FCAT-02 waived P2; R-QA-FCAT-03 deferred |
| 2026-06-06 | J-XBOS-12 | Row missing pre-W9 QC (**SPEC-GAP-J-XBOS-12**) | Wave plan referenced journey before map sync | QC gate `qc-p1-xbos-w9-20260606.md` added row; BA may enrich narrative |
| 2026-06-06 | J-HRM-07 / H1–H7 | Web audit FAIL → FE fix → tasks `page_size=300` 400 | `useTasks` over API max | Tasks fix + QA retest PASS · QC GWC `qc-p1-hrm-h1-7-20260606.md` — localhost U32 only |
| 2026-06-06 | J-MOB-01..05 | H9 func audit — no adb device | API probe + vitest only | **PASS** localhost API · device deferred **C-MOB-H9-DEVICE-01** · QC GWC `qc-p1-hrm-h1-7-20260606.md` |
| 2026-06-06 | J-HRM-04 | H12 browser FAIL → FE fix → retest PASS | `employee_id` absent on API row | **D-HRM-J04-CLICK-01 CLOSED** · `p1-hrm-h12-j04-qa-20260606.md` · **C-HRMQC-H11-J04 CLOSED** · QC regate `qc-p1-hrm-h11-regate-20260606.md` |
| 2026-06-06 | J-HRM-04 / P-CC-05 | H13 ins-summary + AC-FID slugs batch | Summary cards «-» · slug contract_ratio | **D-HRM-INS-SUMMARY-01 CLOSED** · **R-H10-01 CLOSED** · **AC-FID-03 CLOSED** · QC H13 regate `qc-p1-hrm-h13-regate-20260606.md` — J-HRM **7/7** localhost U32 |
| 2026-06-06 | J-HRM-03 | H12 browser PASS — contract Eye → detail | Prior drawer gap | **D-HRM-J03-DRAWER-01 CLOSED** · QC H11 closeout |
| 2026-07-20 | J-HRM-MENU-SWEEP | Sponsor: cover mọi HRM sidebar leaf (không chỉ UF-HRM-01..13) | Matrix gap load-only | BA `BA-HRM-MENU-UF-MATRIX-01` → UF-HRM-MENU-01..17 · Local GWC · Dev8088 ⬜ |
| 2026-07-27 | **J-HRM-IM-01** | QC GWC soft **C-IM01-JMAP-01** — dedicated import-preview journey missing | Map had host **J-HRM-02** only | BA `BA-J-HRM-IM-01-JOURNEY-01` ADD row · local PASS cite QC · HOLD_DEPLOY · **must_keep** J-HRM-02 · **cấm** invent IM-02 |
| 2026-08-01 | J-HRM-01 | W2a `:8080/hr/employees` «Không có quyền truy cập» standalone | PermissionRoute blocked mobile JWT path | **D-HRM-W2A-STANDALONE-RBAC-01 CLOSED** · QC GWC [`qc-hrm-w2a-standalone-rbac-01-20260801.md`](../qa/evidence/qc-hrm-w2a-standalone-rbac-01-20260801.md) · P2 R-HARNESS-RBAC deferred |




