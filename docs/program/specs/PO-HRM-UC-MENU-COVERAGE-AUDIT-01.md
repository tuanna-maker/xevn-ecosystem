# PO-HRM-UC-MENU-COVERAGE-AUDIT-01 — UC × Menu leaf coverage stamps

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UC-MENU-COVERAGE-AUDIT-01` |
| **program** | `PO-HRM-UC-MENU-COVERAGE-01` |
| **from_role** | ba-process |
| **to_role** | pm |
| **lane** | governance |
| **date** | 2026-08-06 |
| **ack_status** | **PASS_TO_PM** |
| **honesty** | `*_uat_ready=false` · **no** module UAT claim · **no** `apps/**` · U65 |

## Sponsor process lock (echo)

```text
Rà từng module menu theo danh sách UC — chưa check = UC chưa đủ
  → xem lại BRD/SRS rồi tài liệu khác trước khi code / test / fix.
Every function they touch errors → stop shotgun Dev; stamp coverage first.
```

## Rule echo (Dev lock)

```text
Menu leaf / nút mutate P0
  → FR 7-mục + Diễn biến + khóa mang = SPEC_READY
  → TechSpec + DB_DESIGN + API_DESIGN
  → rồi mới Dev → QA browser U65
Cấm Dev/fix theo screenshot khi leaf còn UNCHECKED | SHALLOW.
IMPL_GAP = được Dev chỉ sau confirm + Tech đủ; không shotgun multi-leaf.
CHECKED_QA = browser U65 PASS đúng AC FR của leaf (≠ load MENU-*, ≠ J-* list→detail một mình).
```

## Sources (read — reuse, no duplicate spines)

| Artifact | Role in this audit |
|----------|-------------------|
| `docs/program/PO_HRM_UC_MENU_COVERAGE_PROGRAM.md` | Stamp vocabulary |
| `docs/program/PO_HRM_ALL_MENU_E2E_LINKAGE_PROGRAM.md` | Menu Wave A seats + C-* classes |
| `docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md` §3 + §3.A | FR/UC inventory (v0.13 tip) |
| `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` §2.1 | Sidebar `menu_key` ↔ route ↔ UC fidelity |
| `PO-HRM-REC-E2E-LINKAGE-SPEC-01` · `…-EMP-…` · `…-ATT-…` · `…-PAY-CFG-…` | E2E linkage scorecards (reuse) |
| `PROGRAM_JOURNEY_MAP.md` · `USER_FLOW_OPERABILITY_MATRIX.md` §4 / §4b | J-* / UF pointers — **not** auto-promote CHECKED_QA |

**Stamp definitions** (program SoT): `UNCHECKED` · `SHALLOW` · `SPEC_READY` · `IMPL_GAP` · `CHECKED_QA` · `OUT_MVP`.

**Note:** UF-HRM-MENU-* 🟢 = load/chrome only. UF-HRM-01..16 / J-HRM-* 🟢 = narrow journey — **does not** clear IMPL_GAP when E2E-LINK seats open P0 C-*.

---

## § Executive

| Metric | Value |
|--------|--------|
| Rows stamped (MVP sidebar + REC tabs + required ops) | **28** |
| **UNCHECKED + SHALLOW** | **10 / 28 = 36%** |
| IMPL_GAP | **14 / 28 = 50%** |
| SPEC_READY (docs đủ, chờ Tech/confirm narrow) | **1 / 28 = 4%** |
| CHECKED_QA (AC hẹp đã browser PASS; **không** = module UAT) | **1 / 28 = 4%** |
| OUT_MVP | **2 / 28 = 7%** |
| Module UAT flags | All **false** (`recruitment_uat_ready` · `hrm_personnel_uat_ready` · `attendance_uat_ready` · `payroll_e2e_ready` · `settings_catalog_e2e_ready` · `processes_catalog_bound`) |

### Ordered P0 backlog — **ba-docs** (not Dev)

| # | work_item_id (proposed) | Leaf / topic | Why docs first | Exit (ba-docs) |
|---|-------------------------|--------------|----------------|----------------|
| **1** | `PO-HRM-ATT-LEAVE-LADDER-DOCS-01` | Attendance · leave | SA `PO-HRM-ATT-LEAVE-LADDER-N-01` = **WAIVE L2 Phase-1**; Enterprise/HDSD chưa stamp WAIVE + AC L1-only; LV-02 cấm 🟢 | DOC-DELTA ATT-09 / H03: WAIVE L2 Phase-1 · AC LV-01; HDSD bảng ngày→cấp hoặc «Phase-1 một cấp» |
| **2** | `PO-HRM-PAY-ENROLL-DOCS-01` | Payroll · Hire→kỳ→phiếu | PAY-06 EXPAND v0.13 còn mỏng Diễn biến FE «đưa NV Active vào kỳ / generate phiếu»; P0-PAY-01 C-SPINE-BREAK | ADD Diễn biến + AC-PAY-HIRE FE/F5; khóa eligibility sheet chốt (PAY-01) |
| **3** | `PO-HRM-PROC-DEEPLINK-DOCS-01` | Processes | Fake CRUD removed nhưng hard `[]` + thiếu CTA XBOS; AC-PROC-05/06 | Bắt buộc deep-link CC WF + bind snapshot §55–58 (empty trung thực chỉ khi catalog trống) |
| 4 | `PO-HRM-REC-PLAN-TERM-DOCS-01` | REC · Kế hoạch/Định biên | REC-01 map thuật ngữ + picker catalog còn residual sau UV/compare merge | Nhãn đồng nghĩa Định biên; cấm free-text dept/position SoT |
| 5 | `PO-HRM-REC-INTERVIEW-ONE-ACTIVE-SPEC-01` | REC · Interviews | Wave A seat: one-active + list badge — **chưa** FR Diễn biến | ADD FR/AC one-active interview; **cấm** invent BR trong Dev-FE crash-only |
| 6 | `PO-HRM-EMP-DEC-WH-TEAM-SYNC-01` | Decisions ↔ WH | Enterprise CORE-01a merged; team `BR-DEC-05` optional `employee_id` còn mâu thuẫn | DOC-DELTA team SRS: loại bổ nhiệm/thuyên chuyển → `employee_id` required |
| 7 | Dashboard / Tasks / Internal services / Performance / Reports | Ops leaves | **UNCHECKED** — chưa scorecard nút↔FR E2E | Wave B ba-process scorecard (P1 trừ khi sponsor promote P0) |

**Cascade rule:** Items 1–3 → **sa** Tech/DB/API khi mutate P0 → Dev **chỉ** sau SPEC_READY+Tech. Items 4–6 same. Item 7 = inventory only until scorecard.

---

## § Coverage matrix

| # | Menu leaf (sidebar / tab) | Route / surface | Primary FR / UC IDs | Stamp | P0 blocker (1-line) | Next owner |
|---|---------------------------|-----------------|---------------------|-------|---------------------|------------|
| 1 | **Dashboard** | `/` · `…/dashboard` | UC-HRM-20 · ops summary; Enterprise REC-08 partial overlap | **UNCHECKED** | Chưa scorecard counter↔FR / spine Hire-to-Pay KPI | ba-process Wave B scorecard |
| 2 | **Employees** | `/employees` | FR-UC-BP-CORE-01 · 01a · 02 · 07 · UC-HRM-21 · HRM-EM-* | **IMPL_GAP** | Public form/tab còn lộ / nhập C&B (D1); WH position free-text (D2) | sa Tech residual → **dev-fe/be** after confirm (docs EMP v0.12 **merged**) |
| 3 | **Contracts** | `/contracts` | FR-UC-BP-CORE-09 · UC-HRM-25 · HRM-CI-* | **IMPL_GAP** | Mẫu HĐ / create AC browser còn nông vs CORE-09 Diễn biến (EMP D4/D9) | ba-docs AC-CTR-TPL residual → sa → Dev |
| 4 | **Insurance** | `/insurance` | FR-UC-BP-CORE-10 · UC-HRM-25 · HRM-CI-02/07 | **IMPL_GAP** | Thiếu action đóng/ngừng/tạm hoãn + timeline mức (D5) | sa API timeline → Dev (docs CORE-10 merged) |
| 5 | **Decisions** | `/decisions` | FR-UC-BP-CORE-01a · UC-HRM-27 · BR-DEC-05 | **IMPL_GAP** | QSĐ hiệu lực không bắt buộc `employee_id` / không sinh lịch sử công tác (D6) | **ba-docs** team BR-DEC-05 sync → sa → Dev |
| 6 | **Recruitment › Định biên / Kế hoạch** | `/recruitment` tab plans | FR-UC-BP-REC-01 · 01b | **IMPL_GAP** | UI «kế hoạch» free-text ≠ lưới Định biên Cần tuyển; spawn YCTD 1–1 ô yếu | **ba-docs** term map → sa → Dev |
| 7 | **Recruitment › Thư viện JD** | `/recruitment` JD | FR-UC-BP-REC-00 · 00a · 00b · 00c | **IMPL_GAP** | DnD/console storm; `jd_dynamic_done=false` dù J-HRM-JD GWC hẹp | dev-fe JD lane (spec Group/Dynamic **exists** — không invent) |
| 8 | **Recruitment › YCTD** | `/recruitment` Jobs/YCTD | FR-UC-BP-REC-02 · 02b · JD REF | **IMPL_GAP** | Status Hiệu lực gate / preview residual (REF cascade) | sa/Dev narrow YCTD-REF (cấm job_postings) |
| 9 | **Recruitment › Ứng viên (Thêm UV)** | `/recruitment` candidates | FR-UC-BP-REC-05a · 05 · 04 | **IMPL_GAP** | Position free-text; thiếu YCTD bắt buộc trên form (C-ORPHAN-FIELD) | sa UV-YCTD Tech/DB/API → Dev (**05a merged** Enterprise) |
| 10 | **Recruitment › So sánh UV** | Compare dialog | FR-UC-BP-REC-06b | **IMPL_GAP** | Stub empty + SoT `job_postings` (C-ORPHAN-SCREEN) | sa → Dev bind YCTD (**06b merged**) |
| 11 | **Recruitment › Phỏng vấn / Đánh giá** | Interviews / Evaluations | FR-UC-BP-REC-06 | **SHALLOW** | One-active + badge list **chưa** Diễn biến FR; Dev crash Select.Item ≠ BR | **ba-process/ba-docs** interview SPEC → rồi Dev |
| 12 | **Recruitment › Dashboard / Báo cáo** | REC reports tab | FR-UC-BP-REC-08 | **IMPL_GAP** | Drill YCTD / KH vs TT phụ thuộc spine UV–YCTD chưa đóng | after UV/YCTD P0 |
| 13 | **Recruitment › Chiến dịch / Tin đăng** | Campaigns · JobPostings | FR-UC-BP-REC-03 | **OUT_MVP** | GĐ2 OUT — cấm dual-write JD / nghiệm thu | pm governance (no GĐ1 Dev) |
| 14 | **Attendance › Nghỉ phép** | `/attendance` leave | FR-UC-BP-ATT-08 · 09 · 05b · ATT-04* | **SHALLOW** | Ladder L2 = **WAIVED_P1** (SRS/HDSD GĐ1=QL trực tiếp stamped); funnel leave→sheet AC mở; `attendance_uat_ready=false` | **sa** funnel · optional **qa** LV-01/03 honesty · **HOLD** Dev ladder |
| 15 | **Attendance › Bảng công / Ký chốt** | sheets · sign | FR-UC-BP-ATT-10 · 11 · J-HRM-06b/06c | **IMPL_GAP** | UF-16 sheet create 🟢; **ký chốt J-06c / UF-ATT-SIGN ⬜** = spine ATT→PAY gãy | Dev sign READY_FOR_QA → **qa** (không claim module UAT) |
| 16 | **Attendance › Bản ghi / Muộn ESS** | records · update-requests | FR-UC-BP-ATT-02 · ATT-03d | **IMPL_GAP** | Late approve → record kỳ chưa khóa AC; device stubs OUT | qa AT-* after BE; device = OUT honesty |
| 17 | **Payroll** | `/payroll` | FR-UC-BP-PAY-01 · 02 · 04 · 06 · 08 | **IMPL_GAP** | Hire→period→payslip C-SPINE-BREAK; TP free-text vs catalog; addRecord unsupported | **ba-docs** enroll Diễn biến → sa generate → Dev |
| 18 | **Processes** | `/processes` | XBOS-DM-HRM-14 · SRS §13.1 · AC-PROC-* | **IMPL_GAP** | Hard `[]` / không deep-link XBOS (P0-PROC-01/02) | **ba-docs** CTA+bind → sa GET snapshot → Dev-FE |
| 19 | **Settings / catalogs** | `/settings` · settings-catalogs | HRM-SC-01..09 · FR-HRM-SC-* · O4 picker | **IMPL_GAP** | UF-10 sync/item 🟢 hẹp; picker EMP/ATT/PAY key matrix + salary_components dual-SoT residual | ba-docs dual-SoT lock → qa CAT spot → Dev per key |
| 20 | **Tasks** | `/tasks` | HRM-OP-01..02 | **UNCHECKED** | Chưa E2E nút↔FR scorecard (load MENU-11 only) | ba-process Wave B |
| 21 | **Internal services** | `/internal-services` | HRM-SV-* | **UNCHECKED** | Chưa E2E linkage scorecard | ba-process Wave B |
| 22 | **Performance** | `/performance` | HRM-PF-01..04 | **UNCHECKED** | Ngoài Wave A E2E seats; load only | ba-process Wave B (P1) |
| 23 | **Company** | `/company` | UC-HRM-CO-01 · FR-HRM-CO-HC/IND · AC-CO-* | **CHECKED_QA** | Headcount + ngành nghề AC local PASS (J-HRM-CO-01); HOLD_DEPLOY / ≠ full HRM UAT | pm hold deploy; residual ngoài AC-CO = separate WI |
| 24 | **Reports** | `/reports` | HRM-PR-06 · HRM-OP-04 | **UNCHECKED** | Chưa scorecard mutate/report AC vs FR | ba-process Wave B |
| 25 | **AI** | `/ai` | — | **OUT_MVP** | Ngoài fidelity / không transactional UC MVP | pm defer |
| 26 | **Tools & equipment** | `/tools-equipment` | — | **OUT_MVP** | Matrix deferred / Phase-2 stub | pm defer |
| 27 | **Fleet** | `/fleet` | HRM-FL-01 (soft) | **UNCHECKED** | Chưa coverage stamp E2E | ba-process P2 |
| 28 | **Employee metadata (settings child)** | `/employee-metadata` | UC-HRM-26 · UF-HRM-11 | **SHALLOW** | Approve UF-11 🟢; MENU-17 metadata workflow id chrome P3; không E2E field-pack spine | ba-docs chrome honesty + Wave B nếu mutate pack |

### Recruitment shell rollup

| Rollup | Stamp | Note |
|--------|-------|------|
| Menu `recruitment` (leaf) | **IMPL_GAP** | Worst-child of tabs 6–12; REC-03 OUT không kéo nghiệm thu |
| `recruitment_uat_ready` | **false** | Until CHECKED_QA on P0 tabs 6–11 (except 13 OUT) |

### HR group rollup (employees + contracts + insurance + decisions)

| Rollup | Stamp | Note |
|--------|-------|------|
| Personnel cluster | **IMPL_GAP** | EMP-SPEC D1–D7; `hrm_personnel_uat_ready=false` |
| Docs Enterprise CORE | **merged** v0.12+ | Stamp leaf = IMPL_GAP (code), không SHALLOW master FR |

---

## § Pointers J-* / UF (do not confuse with CHECKED_QA)

| Leaf cluster | Journey / UF | Coverage meaning |
|--------------|--------------|------------------|
| Employees / contracts / insurance | J-HRM-01..04 · UF-HRM-01..04 🟢 | Cross-nav / CRUD hẹp — **≠** CORE C&B boundary / SI timeline CLOSED |
| Recruitment | J-HRM-05 · UF-HRM-12 🟢 · J-HRM-JD-01..03 GWC | Requisition/JD slice — **≠** UV/compare/plan spine CLOSED |
| Attendance | J-HRM-06 · 06b ✅ · 06c ⬜ · UF-HRM-16 🟢 · UF-ATT-SIGN ⬜ | Sheet create OK; **sign + leave ladder** open |
| Payroll | J-HRM-07 · UF-HRM-06 🟢 | Payslip shell — **≠** Hire-to-Pay bước 6 |
| Settings | UF-HRM-10 🟢 · MENU-17 🟡 | Sync/item — **≠** O4 picker + PAY component SoT |
| Full sidebar load | J-HRM-MENU-SWEEP · UF-HRM-MENU-01..17 | Load gate only |

---

## § Spec readiness gate (before Dev on mutate P0)

| Stamp on leaf | Dev allowed? |
|---------------|--------------|
| `UNCHECKED` / `SHALLOW` | **No** — ba-docs / ba-process first |
| `SPEC_READY` | **No code yet** — sa Tech+DB+API first |
| `IMPL_GAP` | **Yes only** after confirm + Tech for that WI; regression vùng 🟢 |
| `CHECKED_QA` | No feature Dev; only regression if touch |
| `OUT_MVP` | **No** GĐ1 Dev |

---

## § Handoff

### completion_report

- **Closed:** Full menu×UC coverage stamp table (28 rows) for dashboard, HR cluster, recruitment tabs, attendance slices, payroll, processes, settings, tasks, internal_services, plus performance/company/reports/ai/tools/fleet; executive % UNCHECKED+SHALLOW = **36%**; ordered ba-docs P0 backlog (top 7, Dev forbidden until SPEC_READY+Tech); rule echo Dev lock; reuse REC/EMP/ATT/PAY-CFG seats without duplicating spines; honesty all module UAT flags false.
- **Residual:** Wave B scorecards for UNCHECKED ops leaves; interview one-active SPEC still open; ladder WAIVE needs ba-docs stamp; no QA/UAT promotion from this seat.

### next_owner

**pm** — intake → dispatch **ba-docs** (top 3 below) + parallel **sa** only where IMPL_GAP already has merged FR (UV-YCTD / EMP CORE / PAY enroll Tech) — **not** shotgun Dev across leaves.

### next_dispatch_prompt

```text
work_item_id: PO-HRM-ATT-LEAVE-LADDER-DOCS-01
from_role: pm
to_role: ba-docs
lane: governance
parent: PO-HRM-UC-MENU-COVERAGE-AUDIT-01 · PO-HRM-ATT-LEAVE-LADDER-N-01
read_first:
  - docs/program/specs/PO-HRM-UC-MENU-COVERAGE-AUDIT-01.md (§ Executive #1 · row 14)
  - docs/program/specs/PO-HRM-ATT-LEAVE-LADDER-N-01.md (WAIVE L2 Phase-1)
  - docs/program/specs/PO-HRM-E2E-LINK-ATT-SPEC-01.md §4.1
  - docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-ATT-09
entry_criteria: SA WAIVE L2 Phase-1 recorded; attendance_uat_ready=false
exit_criteria: DOC-DELTA Enterprise + HDSD — Phase-1 leave = L1-only AC; WAIVE L2 explicit; no invent N; ADD-only; no_prompt_echo; no apps/**
evidence_path: docs/qa/evidence/po-hrm-att-leave-ladder-docs-01.md
ack_status: PASS_TO_PM
---
work_item_id: PO-HRM-PAY-ENROLL-DOCS-01
from_role: pm
to_role: ba-docs
lane: governance
parent: PO-HRM-UC-MENU-COVERAGE-AUDIT-01 · PO-HRM-E2E-LINK-PAY-CFG-SPEC-01
read_first:
  - docs/program/specs/PO-HRM-UC-MENU-COVERAGE-AUDIT-01.md (§ Executive #2 · row 17)
  - docs/program/specs/PO-HRM-E2E-LINK-PAY-CFG-SPEC-01.md §D P0-PAY-01
  - SRS_HRM_ENTERPRISE.md FR-UC-BP-PAY-06 · PAY-01 · PAY-02
entry_criteria: PAY-06 tip v0.13 exists; payroll_e2e_ready=false
exit_criteria: ADD Diễn biến FE enroll NV Active → kỳ → phiếu + AC-PAY-HIRE FE/F5; dual-SoT component lock cross-ref; no apps/**; no UAT claim
evidence_path: docs/qa/evidence/po-hrm-pay-enroll-docs-01.md
ack_status: PASS_TO_PM
---
work_item_id: PO-HRM-PROC-DEEPLINK-DOCS-01
from_role: pm
to_role: ba-docs
lane: governance
parallel_after_docs: sa PO-HRM-PROC-CATALOG-BIND-TECH-01 (GET snapshot §55–58 + deep-link CC)
parent: PO-HRM-UC-MENU-COVERAGE-AUDIT-01 · PAY-CFG P0-PROC-01/02
read_first:
  - docs/program/specs/PO-HRM-UC-MENU-COVERAGE-AUDIT-01.md (row 18)
  - docs/program/specs/PO-HRM-E2E-LINK-PAY-CFG-SPEC-01.md P0-PROC-*
  - docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md processes · AC-PROC-01..06
entry_criteria: HRM processes read-only lock; hard [] known
exit_criteria: DOC-DELTA — CTA deep-link XBOS bắt buộc; empty chỉ khi catalog trống; AC-PROC-05/06 testable; no invent HRM CRUD; no apps/**
evidence_path: docs/qa/evidence/po-hrm-proc-deeplink-docs-01.md
ack_status: PASS_TO_PM
```

### evidence_path

`docs/program/specs/PO-HRM-UC-MENU-COVERAGE-AUDIT-01.md`

### ack_status

**PASS_TO_PM**
