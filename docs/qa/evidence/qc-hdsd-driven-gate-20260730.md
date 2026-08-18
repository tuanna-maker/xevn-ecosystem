# QC Gate — HDSD-driven UAT (governance, pre-QA execution)

| Field | Value |
|-------|-------|
| **work_item_id** | QC-HDSD-GATE-01 |
| **program** | P-HDSD-QA-SRS-01 |
| **gate_type** | L-HDSD doc governance (pre-browser) |
| **auditor** | QC |
| **date** | 2026-07-30 |
| **ack_status** | PASS_TO_PM |

## Verdict

**GO WITH CONDITIONS** — 12 chương HDSD + INDEX đủ nội dung Phase 1 Markdown để QA bắt đầu **43 TC** đã map; **không** claim full inventory Chương 1 (37 màn) hay Phase 1 DONE cho đến khi đóng conditions C1–C4.

**NOT:** Phase 1 DONE · UAT-PASS · PROD-READY · HOLD_DEPLOY unchanged.

---

## 1. Scope audited

| Artifact | Path | Result |
|----------|------|--------|
| INDEX + Chương 1 inventory | `docs/client-delivery/hdsd/HDSD_XEVN_ECOSYSTEM_INDEX.md` | PASS with notes |
| Chương 2–12 MD | `docs/client-delivery/hdsd/HDSD_XEVN_CH*.md` (11 files) | GWC — structure drift |
| PROMPT_HDSD_MASTER | `docs/program/HDSD_QA_PROGRAM.md` § Nguyên tắc | Reference SoT |
| Testcase matrix | `docs/qa/HDSD_SRS_TESTCASE_MATRIX.md` | GWC — 8/37 màn thiếu TC |
| UAT scenario | `docs/qa/HDSD_DRIVEN_UAT_SCENARIO.md` | Present (QA execution next) |

---

## 2. PROMPT_HDSD_MASTER — per-chapter structure audit

**Requirement (each screen):** mục đích · cách vào · bảng Nút · bảng Field (form) · bảng Cột · trạng thái · lỗi · placeholder ảnh.

| File | § màn | Nút | Field | Cột | Trạng thái | Lỗi | Hình | Notes |
|------|-------|-----|-------|-----|------------|-----|------|-------|
| CH02 | 6 | 4 | 4 | 4 | 4 | 4 | 5 | PASS — khớp §3 INDEX |
| CH03 | 9 | 7 | 7 | 7 | 7 | 7 | 7 | PASS |
| CH04 | 5 | 6 | 0* | 5 | 3 | 6 | 7 | GWC — field dùng tiêu đề «Trường cấu hình» thay «Bảng Hộp thoại» |
| CH05 | 5 | 1* | 0* | 1* | 1* | 3 | 4 | GWC — §5.2+ dùng «Bảng trường»; đủ nội dung, lệch header §3 |
| CH06 | multi | 3 | 0* | 3 | 2 | 2 | 8 | GWC — `#### Bảng — Nút/Cột`; § đánh số `## 1.`/`### 2.1` |
| CH07 | multi | 2 | 0* | 3 | 1 | 1 | 12 | GWC — tab-heavy; field inline trong form tables |
| CH08 | multi | 3 | 0* | 2 | 1 | 1 | 15 | GWC — same pattern CH06–09 |
| CH09 | multi | 3 | 0* | 5 | 1 | 1 | 14 | GWC |
| CH10 | 6 | 6 | 4 | 3 | 1 | 6 | 6 | PASS — near §3 |
| CH11 | 9 | 4 | 0* | 2 | 0* | 3 | 5 | GWC — thiếu «Trạng thái nghiệp vụ» nhiều tab |
| CH12 | 11 | 0* | 5* | 0* | 0* | 4 | 8 | GWC — mobile dùng bảng inline `Trường/Nút`; không header §3 |

\*Đếm regex header formal; nội dung tương đương có trong bảng con.

**Substance:** Mọi chương có mô tả nút/field/cột thực tế cho màn chính — **không NO-GO nội dung trống**.

---

## 3. Prompt-echo / meta pipeline audit

| Check | Result |
|-------|--------|
| Sponsor stamp / work_item trong prose khách | PASS — không có |
| Pipeline / DISPATCH / agent chat echo | PASS |
| «Draft for Sponsor» / AS-IS TO-BE meta | PASS |
| Phase 2 placeholder ảnh | PASS — đúng program Phase 1 MD |
| Ch1 citation `App.tsx` / matrix nội bộ | INFO — chỉ block inventory §2 (team SoT); không lẫn vào chương 2–12 |

---

## 4. Chương 1 inventory vs routes thật

**Sources:** `apps/web/web-portal/src/modules/hrm/registry.ts` · `paths.ts` · `apps/web/hrm/src/App.tsx`

| Inventory row | Route INDEX | Runtime | Match |
|---------------|-------------|---------|-------|
| HRM Tổng quan | `…/hrm` | `/command-center/hrm` → alias `dashboard` (`hrmPortalSuffixFromPathname`) | OK |
| Employees | `…/hrm/employees` | registry `employees` + `/employees` | OK |
| Internal services | `…/hrm/internal_services` | portal suffix underscore; iframe `/internal-services` | OK |
| Fleet | `…/hrm/fleet` | registry + App `/fleet` | OK |
| Login | `/login` | web-portal LoginPage | OK |
| Command Center | `/command-center` | CC page | OK |

**Inventory gaps (registry có, Ch1 chưa liệt kê):**

| View | Portal path | Severity |
|------|-------------|----------|
| performance | `/command-center/hrm/performance` | P2 — bổ sung inventory |
| hrm_ai | `/command-center/hrm/hrm_ai` | P2 |
| tools_equipment | `/command-center/hrm/tools_equipment` | P2 |

**Không phát hiện route phantom** (inventory trỏ path không tồn tại).

---

## 5. HDSD_SRS_TESTCASE_MATRIX vs inventory (≥1 TC/màn chính)

Inventory Chương 1: **37** màn (11 CC/XBOS + 17 HRM embed + 9 mobile).

| # | Màn (inventory) | TC ID | Coverage |
|---|-----------------|-------|----------|
| 1 | Đăng nhập | TC-HDSD-02-01-01 | OK |
| 2 | Command Center | TC-HDSD-02-02-01 | OK |
| 3 | Đơn vị thành viên | TC-HDSD-03-01-01 | OK |
| 4 | Chi tiết pháp nhân / cổ đông | TC-HDSD-03-02-01 | PARTIAL — chỉ mutate cổ đông, chưa read-only modal |
| 5 | Phòng ban | TC-HDSD-03-03-01 | OK |
| 6 | RBAC | TC-HDSD-03-04-01 | OK |
| 7 | Inbox WF | TC-HDSD-04-01-01 | OK |
| 8 | Canvas WF | TC-HDSD-04-02-01 | OK |
| 9 | RACI | TC-HDSD-04-04-01 | OK |
| 10 | Catalog | TC-HDSD-04-03-01 | OK |
| 11 | KPI rollup CC | — | **GAP** |
| 12 | Tổng quan HRM | TC-HDSD-02-03-01 | OK |
| 13–28 | HRM modules (NV…Fleet) | TC-HDSD-05..11-* | OK except row 27 |
| 27 | Hướng dẫn in-app | — | **GAP** |
| 29 | Mobile login | TC-HDSD-12-01-01 | OK |
| 30 | Mobile Home | — | **GAP** |
| 31 | Mobile chấm công/lịch sử | TC-HDSD-12-02-01 | PARTIAL — check-in only |
| 32 | Mobile nghỉ phép | TC-HDSD-12-03-01 | OK |
| 33 | Mobile phiếu lương | TC-HDSD-12-04-01 | OK |
| 34 | Mobile HĐ/BHXH | — | **GAP** |
| 35 | Mobile phê duyệt | TC-HDSD-12-05-01 | OK |
| 36 | Mobile hồ sơ | — | **GAP** |
| 37 | Mobile thông báo | — | **GAP** |

**Summary:** 43 TC defined · 0 PASS (pre-execution) · **8 màn** thiếu TC đủ (2 PARTIAL) → **78% inventory covered** — dưới ngưỡng program «100% màn có ≥1 TC».

---

## 6. Command table (QC audit — doc-only)

| Command | Purpose | Exit | Result |
|---------|---------|------|--------|
| `node -e "…HDSD chapter table counts…"` | Structure audit 11 CH files | 0 | PASS |
| `rg "Sponsor\|work_item\|DISPATCH" docs/client-delivery/hdsd/` | Prompt-echo scan | 0 | PASS (no matches) |
| Read `registry.ts` + `paths.ts` | Route parity Ch1 | — | PASS + 3 P2 gaps |
| Matrix row count | 43 TC · all verdict ⬜ | — | Pre-QA |

**Portal URL (QA next wave):** `http://127.0.0.1:5175` (local) · persona `ceo@xe.vn` / `Xevn@2026`

**L2.5 J-***: Deferred to QA execution — matrix already maps J-CC-HRM-01, J-HRM-EMP-01, J-MOB-01..05; **not evaluated in this governance gate**.

---

## 7. Conditions (GWC)

| ID | Condition | Owner | Blocks |
|----|-----------|-------|--------|
| C1 | Bổ sung ≥8 TC rows: KPI CC, Guide, MOB Home/History/Contracts/Profile/Notifications, legal entity read | ba-process | Full inventory QC sign-off |
| C2 | QA **may start** wave 1 on existing 43 TC (U65 browser) | qa | — |
| C3 | Ch1 inventory +3 views (performance, hrm_ai, tools_equipment) hoặc ghi OUT-OF-SCOPE | ba-docs | Complete route SoT |
| C4 | Normalize header §3 (optional P2) CH06–12 | ba-docs | Client HTML export only |

---

## Residual

| ID | Item | Severity | Owner |
|----|------|----------|-------|
| R-HDSD-TC-GAP | 8 inventory screens without dedicated TC | P1 | ba-process |
| R-HDSD-INV-3 | 3 HRM views missing from Ch1 | P2 | ba-docs |
| R-HDSD-FMT | Section header inconsistency CH06–12 | P2 | ba-docs |
| R-HDSD-EXEC | 43 TC all ⬜ — no browser evidence yet | Expected | qa |

No product defect residual — governance/doc lane only.

---

## 9. QC recommendation

| Decision | Scope |
|----------|-------|
| **GO WITH CONDITIONS** | Start QA-HDSD wave on 43 TC; parallel matrix delta C1 |
| **NOT GO** | Full 37-màn inventory sign-off until C1 closed |
| **NOT GO** | Phase 1 / UAT-PASS (all TC ⬜) |

**next_owner:** PM → dispatch `qa` (HDSD-driven UAT) + `ba-process` (TC delta C1) in parallel.

---

## 10. XBOS-DASH addendum — HDSD-QC-XBOS-DASH-01

| Field | Value |
|-------|-------|
| **work_item_id** | HDSD-QC-XBOS-DASH-01 |
| **program** | HDSD-P2-FULL-01 |
| **audits** | HDSD-BA-XBOS-DASH-01 (ba-docs spot-check) |
| **auditor** | QC |
| **date** | 2026-07-30 |
| **ack_status** | PASS_TO_PM |

### Verdict

**GO WITH CONDITIONS** — Ch.4 Dashboard + Ch.1 CC XBOS + HRM Ch.5–12 đủ substance cho Phase 2 MD; **không** prompt-echo pipeline; **chưa** đạt formal §4.0 inventory 16 dòng và vài header kỹ thuật trong prose khách.

**NOT:** Phase 1 DONE · HTML export sign-off · full PROMPT_HDSD_MASTER header parity on every §4.x slice.

---

### 10.1 HDSD_XBOS_CH04_DASHBOARD_VAN_HANH.md

| Check | Result | Notes |
|-------|--------|-------|
| 16 routes documented | **GWC** | §4.6 liệt kê 8 settings + 7 màn §4.1–4.5,4.7 = **16 route** thực; **thiếu §4.0** — inventory cuối file chỉ **9 dòng** (gộp `settings/*`) |
| §4.1 Cockpit | PASS | Nút · Trạng thái/lỗi · [Hình] · UF-XBOS-10 |
| §4.2 Organization | GWC | Nút · Lỗi · [Hình] — **không** bảng Cột riêng |
| §4.3 Customers/Partners | PASS | Cột mẫu · Nút chung · [Hình] — partners dùng chung §, 1 placeholder |
| §4.4 KPI policy + dashboard | PASS | Nút · vùng/bảng KPI · Lỗi · [Hình] ×2 |
| §4.5 Catalog governance | PASS | Nút · [Hình] · ref Ch.3 |
| §4.6 Settings (8 routes) | PASS | Bảng route×8 · pattern CRUD (Nút/Field/Cột) · Lỗi · [Hình] |
| §4.7 HR stub | PASS | **≤1 màn hình** — 3 bullet + 1 [Hình] + ref HDSD HRM; không thay HRM |
| Prompt-echo scan | PASS | Không Sponsor/work_item/DISPATCH/AS-IS meta |
| Kỹ thuật trong prose | **P2** | `CapabilityActionButton`, `PageHeader` — đổi nhãn người dùng trước HTML |

**Route inventory (QC đếm — 16):**

| # | Route | § |
|---|-------|---|
| 1–7 | `/cockpit` … `/catalog-governance` | 4.1–4.5 |
| 8–15 | `/dashboard/settings/{positions,departments,regions,vehicles,vendors,expense-categories,kpi-metrics,kpi-formulas}` | 4.6 |
| 16 | `/dashboard/hr` | 4.7 |

---

### 10.2 HDSD_XBOS_CH01_COMMAND_CENTER.md §1.1

| Check | Result |
|-------|--------|
| §1.1 full (not stub) | **PASS** |
| Mục đích · Cách vào · Bảng Nút (rail + Action Cards) | PASS |
| Bảng Hộp thoại (drawer fields) | PASS |
| Bảng Cột (Action Cards) | PASS |
| Trạng thái nghiệp vụ · Lỗi · UF · [Hình] | PASS |

---

### 10.3 HRM HDSD_XEVN_CH05..CH12 — header & điều hướng

| File | Sản phẩm **HRM** | Standalone + embed | Result |
|------|------------------|--------------------|--------|
| CH05 Nhân sự | ✓ | ✓ `/employees` · embed | PASS |
| CH06 HĐ/BH | ✓ | ✓ contracts/insurance | PASS |
| CH07 Tuyển dụng | ✓ | ✓ recruitment | PASS |
| CH08 Chấm công | ✓ | ✓ attendance | PASS |
| CH09 Lương | ✓ | ✓ payroll | PASS |
| CH10 Công ty/QĐ/CV… | ✓ | ✓ company/decisions/… | PASS |
| CH11 Settings/Reports | ✓ | ✓ settings/reports/guide | PASS |
| CH12 Mobile | ✓ (Mobile ESS) | Mobile standalone + Web ref (không embed CC) | PASS |

---

### 10.4 Conditions (C-DASH)

| ID | Condition | Owner | Severity |
|----|-----------|-------|----------|
| C-DASH-1 | Thêm **§4.0 Inventory** — bảng **16 dòng** route (tách 8 settings; không gộp `*`) | ba-docs | P2 |
| C-DASH-2 | §4.2 thêm bảng Cột/ widget nếu có list; §4.3 [Hình] partners hoặc ghi «dùng layout §4.3» | ba-docs | P3 |
| C-DASH-3 | Thay tên component (`CapabilityActionButton`, `PageHeader`) bằng nhãn UI tiếng Việt | ba-docs | P2 |

**Không chặn:** QA HDSD wave trên UF-XBOS-10 / dashboard routes đã mô tả; parallel ba-docs delta trước HTML export.

---

### 10.5 Residual

| ID | Item | Severity |
|----|------|----------|
| R-HDSD-DASH-INV | §4.0 header missing; summary 9≠16 rows | P2 |
| R-HDSD-DASH-TECH | Component symbols in client MD | P2 |

No product/runtime defect — doc governance only.

**next_owner (this slice):** PM → `ba-docs` close C-DASH-1..3 (optional P3) before XBOS HTML bundle; no Dev/QA dispatch required for doc-only GWC.

---

## L3 Browser UAT audit

| Field | Value |
|-------|-------|
| **work_item_id** | QC-HDSD-DRIVEN-GATE-01 |
| **program** | P-HDSD-QA-SRS-01 |
| **gate_type** | L3 browser UAT (CH02–11 legacy TC wave) |
| **upstream** | QA-HDSD-DRIVEN-W1-03-01 |
| **auditor** | QC |
| **date** | 2026-07-30 |
| **ack_status** | PASS_TO_PM |

### Verdict

**GO WITH CONDITIONS** — browser UAT wave CH02–11: **30/38 TC 🟢 PASS** (load + L2.5), **8/38 🟡 BLOCKED mutate** (honest — không fake 🟢), **0 🔴 FAIL**. L0 `qc:dev-stack` + `qc:fe-be-health` exit 0. U65 zero-seed — **không** phát hiện `pnpm seed:*` hoặc DB fake trong evidence.

**NOT:** Phase 1 DONE · UAT-PASS (mutate chưa đóng) · PROD-READY · full v2.0 matrix 360 TC · mobile CH12.

**Distinct from prior gate:** QC-HDSD-GATE-01 (§1–9) = doc governance GWC C1–C4 **pre-browser**. Section này = **post-QA browser execution** trên 38 legacy `TC-HDSD-*`.

---

### 1. Evidence audited

| Artifact | Path | QC read |
|----------|------|---------|
| CH02–4 browser | `docs/qa/evidence/hdsd-uat-ch02-04-20260730.md` | ✓ |
| CH05–9 browser | `docs/qa/evidence/hdsd-uat-ch05-09-20260730.md` | ✓ |
| CH10–11 browser | `docs/qa/evidence/hdsd-uat-ch10-11-20260730.md` | ✓ |
| Runtime JSON | `docs/qa/evidence/_tmp-qa-hdsd-driven-uat-ch02-11-runtime.json` | ✓ (38 TC reconciled) |
| Matrix (reference) | `docs/qa/HDSD_SRS_TESTCASE_MATRIX.md` **v2.0** (360 TC) | ✓ — QA run dùng **legacy** `TC-HDSD-02..11-*` (43 TC program v1.1); 38 executed (CH12 mobile **ngoài** lượt này) |
| Prior doc gate | §1–9 above (C1–C4) | Still open |

**Screenshots:** 36 PNG under `docs/qa/evidence/screens/hdsd-uat-20260730/` — spot paths match runtime `screens[]`.

---

### 2. L0 / U65 / evidence-pack gate

| Check | Result | Notes |
|-------|--------|-------|
| L0 stack | **PASS** | HRM+XBOS+portal 200; `qc:fe-be-health` exit 0 (ch02 evidence) |
| U65 zero-seed | **PASS** | Harness `u65: zero-seed`; login→menu→click; mutate 🟡 not faked |
| `verify:qc:evidence-pack` | **FAIL (process)** | Slice files: ch02 **6/8**, ch05 **4/8**, ch10 **3/8** — thiếu `ack_status`/`portal_url` regex/`command_table` trên slice 2–3; **substance đủ** qua 3 file + JSON |
| Undocumented 🔴 | **None** | Runtime `red: 0` |

**Classification console (không đổi verdict load PASS):**

| Signal | Class | Owner |
|--------|-------|-------|
| Early `tenant-scope.accessible` ECONNREFUSED | ENV startup | — |
| `CommandCenterPage` `.trim()` TypeError (transient) | P2 product | dev-fe |
| Insurance GET 500 → retry 200 `chk_contract_date_range` | P2 product | dev-be |
| `/internal_services` 404 embed alias | P2 route | dev-fe |

---

### 3. TC summary (38 legacy run)

| Verdict | Count | % |
|---------|-------|---|
| 🟢 PASS | 30 | 78.9% |
| 🟡 BLOCKED / partial | 8 | 21.1% |
| 🔴 FAIL | 0 | 0% |

**Chapters covered:** CH02–CH11 (portal `:5173`, persona `ceo@xe.vn`).

**Not in this run:** CH12 mobile (`TC-HDSD-12-*` / `TC-MOB-*`), v2.0 deep matrix rows, member CEO W5.

---

### 4. L2.5 journey audit (mandatory)

| Journey | TC | Evidence | Verdict |
|---------|-----|----------|---------|
| **J-CC-HRM-01** | TC-HDSD-02-03-02 | CC → HRM employees → row click → detail URL `/hr/employees/{id}` → back CC; GET by id **200** | **🟢 PASS** |
| **J-HRM-EMP-01** (embed) | TC-HDSD-05-02-01 | HRM embed list → row → detail GET **200**; screenshot `tc_hdsd_05_02_01.png` | **🟢 PASS** |

**Deferred J-* (not blocking GWC load slice):** J-MOB-01..08 (CH12 not run); WF inbox approve mutate; catalog publish FE chain full.

---

### 5. Eight 🟡 mutate — GWC conditions (browser)

| ID | TC | HDSD / UF | Issue | Owner | Blocks |
|----|-----|-----------|-------|-------|--------|
| **C-B1** | TC-HDSD-03-02-01 | CH03 §3.2 · UF-XBOS-05 | Shareholder **Lưu** — no POST 2xx observed (`post=none`) | **dev-fe** | UF-XBOS-05 mutate 🟢 |
| **C-B2** | TC-HDSD-03-03-01 | CH03 §3.3 · UF-XBOS-03 | Phòng ban shell load OK; dept tree mutate / GET trace chưa assert | **dev-fe** + **qa** (settings query map) | UF-XBOS-03 deep mutate |
| **C-B3** | TC-HDSD-04-02-01 | CH04 §4.2 · UF-XBOS-10 | WF canvas dots/nodes not detected — wrong deep link | **dev-fe** | UF-XBOS-10 canvas |
| **C-B4** | TC-HDSD-05-03-01 | CH05 §5.3 · UF-HRM-02 | Create NV form opens; **POST 201 + F5** not completed (U65) | **dev-fe** → **qa** | UF-HRM-02 create |
| **C-B5** | TC-HDSD-05-04-01 | CH05 §5.4 | Edit dialog opens; **PATCH + F5** not asserted | **dev-fe** → **qa** | Employee update |
| **C-B6** | TC-HDSD-06-02-01 | CH06 §6.2 · UF-HRM-05 | Create HĐ form opens; **POST + F5** not completed | **dev-fe** → **qa** | UF-HRM-05 create |
| **C-B7** | TC-HDSD-07-02-01 | CH07 §7.2 | Tạo YCTD — create button path did not open form in harness | **dev-fe** → **qa** | Recruitment create |
| **C-B8** | TC-HDSD-08-02-01 | CH08 §8.2 · UF-HRM-09 | Leave request known **POST 400** (prior `qa-hrm-leave-req-create-01-20260727.md`); load-only | **dev-be** → **qa** | UF-HRM-09 mutate |

**Carry from prior doc gate (still open):** C1–C4 (§7) — matrix v2 gaps, mobile TC inventory, Ch1 +3 views.

---

### 6. Matrix mapping note

| Layer | Scope | Status |
|-------|-------|--------|
| Legacy run | 38 × `TC-HDSD-02..11-*` | 30 🟢 / 8 🟡 / 0 🔴 |
| Matrix v2.0 | 360 TC (`TC-ECO-*`, `TC-XBOS-HDSD-*`, `TC-HRM-HDSD-*`, `TC-MOB-*`) | Verdict columns still ⬜ — **wave kế** map legacy PASS → v2 rows |
| Prior inventory | 43 TC program (QC-HDSD-GATE-01 §5) | 38 executed this run; 5 mobile CH12 deferred |

---

### 7. QC recommendation

| Decision | Scope |
|----------|-------|
| **GO WITH CONDITIONS** | Browser load + L2.5 J-CC-HRM-01 + J-HRM-EMP embed for group CEO CH02–11 |
| **NOT GO** | UAT-PASS / mutate closure until C-B1..C-B8 closed + retest |
| **NOT GO** | Full HDSD v2.0 360 TC sign-off |
| **Process note** | QA publish **one** consolidated evidence MD passing `verify:qc:evidence-pack` before next QC gate |

**pm_dispatch_hint (P0):** `D-HDSD-MUTATE-FE-01` (C-B1,B3,B4,B5,B6,B7) · `D-HDSD-LEAVE-BE-01` (C-B8) · `QA-HDSD-MUTATE-RET-01` after Dev READY_FOR_QA · parallel `ba-process` close doc C1.

**next_owner:** PM → dispatch **dev-fe** (shareholder POST, WF canvas deep link, NV/HĐ/YCTD create flows) + **dev-be** (leave POST 400) + **qa** (mutate retest U65 + CH12 mobile wave + evidence pack consolidate).
