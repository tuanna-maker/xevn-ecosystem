# SPEC ↔ CODE Traceability Gap Register

| Field | Value |
|-------|--------|
| **work_item_id** | `SPEC-CODE-TRACEABILITY-AUDIT-20260722` |
| **Date** | 2026-07-22 |
| **Sponsor ask** | (1) Rule BRD/SRS/TechSpec có bám `_vibe-team-os`? (2) Team rà code đúng chưa / bám đâu? (3) CODE-MEMORY có trỏ bước nghiệp vụ? (4) Liệt kê code không có trong SRS + SRS/TechSpec mơ hồ |
| **Status** | **IN PROGRESS** — governance baseline dưới đây; member waves append §4–§6 |
| **Deploy** | **CẤM** deploy cho đến sponsor «cho phép deploy» |

---

## 1. Rule BRD / SRS / TechSpec vs `_vibe-team-os` (PM + SA baseline)

> **Deepened:** `SA-SPEC-OS-ALIGN-01` · 2026-07-22 · evidence `docs/qa/evidence/sa-spec-os-align-01-20260722.md`  
> OS read: `projects/_vibe-team-os/13-BRD-SRS-TECHSPEC-QUALITY.md` (full §3.4) + `14-TRACEABILITY-SRS-TECHSPEC-CODE.md` (exists).

### 1.1 SoT OS

| Artifact | Path | Status |
|----------|------|--------|
| OS quality | `projects/_vibe-team-os/13-BRD-SRS-TECHSPEC-QUALITY.md` | **Confirmed on disk** |
| OS trace | `projects/_vibe-team-os/14-TRACEABILITY-SRS-TECHSPEC-CODE.md` | **Confirmed on disk** |
| Global skill | `~/.cursor/skills/client-delivery-brd-srs/SKILL.md` | Trích OS §13 + skeleton §3.4.8 + dual-doc |
| Global CODE-MEMORY | `~/.cursor/rules/code-memory-journal-full.mdc` | Mirror OS §14 (VI + read-before-edit) |
| XeVN standards | `docs/standards/BRD_SRS_WRITING_STANDARDS.md` | Updated SA-SPEC-OS-ALIGN-01 (OS links + brand + §3.1 MUST table) |
| XeVN rule | `.cursor/rules/client-delivery-docs.mdc` | 6 chương / 373×7 — **không** liệt kê OS §3.4.2/3.4.6/3.4.11 |
| XeVN profile | `.cursor/skills/client-delivery-docs/PROJECT_PROFILE.md` | Paths OK; không cite OS 13/14 |
| FR override template | `docs/srs-overrides/_TEMPLATE_FR.md` | **MISSING** OS §3.4.6 «Kết quả trả về» |
| Shell build SoT | `scripts/lib/doc-tscair-shell.mjs` | Footer **XeVN Group** (runtime đúng; standards đã sync) |

### 1.2 Alignment matrix (deep — OS MUST → XeVN)

| # | OS MUST (source) | XeVN surface | Verdict | Gap ID |
|---|------------------|--------------|---------|--------|
| A | §3.4.1 / skill — FR **7 mục** + sequence + Diễn biến 4 cột | `client-delivery-docs.mdc` + `docs:srs:audit` 373 | **ALIGNED** | — |
| B | §3.4.8A — SRS **6 chương** body (Ch.4–6 không chỉ TOC) | Generator Bateco + rule | **ALIGNED** (ecosystem HTML) | — |
| C | §3.4.2 + §3.4.5 — Diễn biến ratios auth≤2 / success≥40% / fail domain≥30% | Skill mention only; **audit không đếm** | **MISSING gate** | **G-RULE-02** |
| D | §3.4.3 — Fail domain checklist theo domain (không copy auth) | Không có trong XeVN standards / template | **MISSING** (principle áp HRM/XBOS) | **G-RULE-06** |
| E | §3.4.6 — **Kết quả trả về khi thành công** (5 cột) | Không trong `_TEMPLATE_FR.md`; standards §3.1 + checklist đã ADD pointer | **MISSING template** · **PARTIAL policy** | **G-RULE-05** |
| F | §3.4.7 — Remaster **ADD-only** (không giảm đầu vào/quy tắc) | Wave TechSpec ghi ADD-only; standards §3.1 pointer | **PARTIAL** — chưa QC diff gate | **G-RULE-07** |
| G | §3.4.8B — Inventory UC từ BRD (đóng băng catalog trước ba-docs song song) | Catalog 373 SoT; module khách có inventory riêng | **PARTIAL** — ecosystem OK; module waves ad-hoc | **G-RULE-08** |
| H | §3.4.9 — UI/UX: SRS = nhu cầu nghiệp vụ; TechSpec = token/pattern; cấm CSS trong SRS khách | Không trong XeVN standards | **MISSING** | **G-RULE-09** |
| I | §3.4.10 — Dual-doc khách = SoT đầy đủ; team = clone | Skill global + HRM/XBOS `*_KHACH`; ecosystem standards **ít** | **PARTIAL** | **G-RULE-10** |
| J | §3.4.11 A–C — TechSpec ERD + catalog + **ma trận bước→API→bảng** 100% UC | HRM §17 / XBOS §14 **PARTIAL** depth; standards §3.1 pointer | **PARTIAL** | **G-RULE-03** |
| K | §3.4.11 F — SoT kèm `DB_DESIGN_*` + `API_DESIGN_*` field-level | Path bootstrap **CLOSED**; **21** COMPLETE F.1 pairs (14 HRM incl. IM-01 N/A-DB + 7 XBOS); §3 U71 physical backlog **empty** · `TM-U71-PHYSICAL-BACKLOG-CLOSE-01` | **ALIGNED** (U71 scanned F.1) | **G-RULE-11 CLOSED** |
| L | §3.4.11 E — Squad ≥~40 UC (ba-p + ba-d + sa + qa → synth) | Global rule `team-squad-parallel`; XeVN standards không cite | **PARTIAL policy** (OS global) | **G-RULE-12** |
| M | §13 prompt-echo ban + Ctrl+F list | Standards anti-pattern meta + Ctrl+F UNICOM | **ALIGNED** (principle) | — |
| N | §13 ngôn ngữ 100% Việt khách | Standards + prose script | **ALIGNED** | — |
| O | OS §14 — mọi TechSpec block `ref_srs` | HRM/XBOS waves; chưa bắt buộc trong `client-delivery-docs.mdc` | **PARTIAL** | **G-RULE-03** (cùng depth) |
| P | OS §14 — CODE-MEMORY VI + SRS/TS path + bước | Global rule; coverage ≠100% | **ALIGNED policy** / **PARTIAL coverage** | §3 G-CM-* |
| Q | OS §14 — `spec_read_ack` + change_mode ADD\|UPGRADE\|REPLACE | Global `team-spec-before-code` | **ALIGNED policy** | — |
| R | Brand shell khách = XeVN (không UNICOM) | Build shell OK; standards **đã patch** SA-SPEC-OS-ALIGN-01 | **ALIGNED** (docs closed) | **G-RULE-01 CLOSED** |
| S | Link tường minh standards → OS 13/14 | Agent table + §10 standards | **ALIGNED** (docs closed) | **G-RULE-04 CLOSED** |
| T | BRD không lộ trình sprint | Standards §1 | **ALIGNED** | — |

### 1.3 Gap rule cần đóng (governance)

| ID | Gap | Owner | Priority | Status 2026-07-22 |
|----|-----|-------|----------|-------------------|
| **G-RULE-01** | Standards cover/footer UNICOM drift | ba-docs / SA | P1 | **CLOSED** — `BRD_SRS_WRITING_STANDARDS.md` → XeVN Group + `XEVN/BRD-*` |
| **G-RULE-02** | Thiếu gate script tỷ lệ Diễn biến (OS §3.4.2/3.4.5) | ba-docs + SA | P1 | **OPEN** |
| **G-RULE-03** | TechSpec depth bước→API→DB chưa bắt buộc template XeVN (OS §3.4.11 A–C) | SA | P0 | **OPEN** — pointer trong standards §3.1; cần TechSpec template/checklist |
| **G-RULE-04** | Link standards → OS 13/14 | SA | P1 | **CLOSED** — Agent table + §10 |
| **G-RULE-05** | `_TEMPLATE_FR.md` thiếu mục **Kết quả trả về** (OS §3.4.6) | ba-docs | P0 | **OPEN** |
| **G-RULE-06** | Fail-domain checklist theo module (OS §3.4.3) chưa có trong standards/XeVN | ba-process + SA | P2 | **OPEN** |
| **G-RULE-07** | ADD-only remaster không có QC diff gate (OS §3.4.7) | qc + ba-docs | P2 | **OPEN** |
| **G-RULE-08** | Inventory freeze trước ba-docs song song chưa chuẩn hóa mọi module | PM + ba-docs | P2 | **OPEN** |
| **G-RULE-09** | UI/UX tách lớp SRS vs TechSpec (OS §3.4.9) chưa trong XeVN standards | SA + ba-docs | P1 | **OPEN** |
| **G-RULE-10** | Dual-doc bắt buộc trên ecosystem (không chỉ skill global) | ba-docs | P1 | **OPEN** |
| **G-RULE-11** | Thiếu `docs/tech-spec/DB_DESIGN_*` + `API_DESIGN_*` (OS §3.4.11 F) | SA | P0 | **CLOSED** (U71 scanned F.1) — path CLOSED + **21** COMPLETE pairs on disk (`docs/tech-spec/README.md` §2); §3 empty · `TM-U71-PHYSICAL-BACKLOG-CLOSE-01` 2026-07-27; OpenAPI/G-DTO/G-IM-* = execution P2–P3 **not** this gap |
| **G-RULE-12** | Cite squad doctrine trong XeVN TechSpec depth playbook khi inventory lớn | SA + PM | P2 | **OPEN** |

### 1.4 Proposed patches (concrete — list)

| # | Patch | File | Apply? |
|---|-------|------|--------|
| P1 | OS SoT links + brand XeVN Group + §3.1 MUST table + checklist OS + fix «rubric 12 mục» | `docs/standards/BRD_SRS_WRITING_STANDARDS.md` | **DONE** SA-SPEC-OS-ALIGN-01 |
| P2 | ADD block **Kết quả trả về khi thành công** (5 cột OS) sau Diễn biến | `docs/srs-overrides/_TEMPLATE_FR.md` | Proposed → ba-docs |
| P3 | One-liner SoT OS 13/14 under global skill pointer | `.cursor/rules/client-delivery-docs.mdc` | Proposed → ba-docs |
| P4 | Extend `audit-srs-uc-quality.mjs` (or companion) đếm auth/success/fail ratios + flag FR thiếu «Kết quả trả về» | `scripts/audit-srs-uc-quality.mjs` (+ test) | Proposed → ba-docs + SA |
| P5 | ADD `docs/standards/TECHSPEC_DEPTH_CHECKLIST.md` (OS §3.4.11 A–C + F columns) + link từ standards §3.1 | `docs/standards/` | Proposed → SA follow-up |
| P6 | Bootstrap path convention `docs/tech-spec/DB_DESIGN_{module}.md` + `API_DESIGN_{module}.md` (spine HRM/XBOS first) | `docs/tech-spec/` | **DONE** `SA-U71-PATH-CONVENTION-01` — README index + thin pointers; canonical slices may live in `docs/hrm/` / `docs/xbos/` |
| P7 | PROJECT_PROFILE.yaml: `os_quality` / `os_trace` paths | `.cursor/skills/client-delivery-docs/PROJECT_PROFILE.md` | Proposed → ba-docs |

---


## 2. Team rà code **đúng** bằng cách nào? (SoT vận hành)

### 2.1 Chuỗi bắt buộc (đã có trong Cursor rules)

```text
SRS/UC/BR (khách hoặc team)
  → TechSpec ref_srs + OpenAPI/DTO
  → Dev: spec_read_ack + @CODE-MEMORY (UC/BR/SRS § / TechSpec § / FEActions / BEChain)
  → Test map UC/BR
  → QA: UF / J-* browser (U65) — không chỉ HTTP 200
  → QC: GO chỉ khi L0–L2.5 + evidence
```

| Cơ chế | Path / lệnh | Dùng để chắc gì |
|--------|-------------|-----------------|
| **spec_read_ack** | Handoff Dev mỗi wave | Đã đọc đúng § SRS/TechSpec trước sửa |
| **@CODE-MEMORY** | Đầu file/module business | Trỏ UC / BR / SRS path§ / TechSpec§ / bước Diễn biến / WorkItem |
| **ref_srs** trong TechSpec | `docs/hrm/TECHSPEC.md` §14–17 | FR ↔ endpoint ↔ table |
| **UC matrix** | `docs/ecosystem/PHASE1_UC_SRS_TECHSPEC_MATRIX.md` | Planned vs coded |
| **Journey / UF** | `PROGRAM_JOURNEY_MAP.md` · `USER_FLOW_OPERABILITY_MATRIX.md` | Nghiệm thu click |
| **SRS audit** | `pnpm docs:srs:audit` | 373 FR × 7 mục |
| **U65** | zero-seed FE-only | Nghiệm thu không fake DB |

### 2.2 Chưa đủ chắc (honest)

| Lỗ hổng | Hệ quả |
|---------|--------|
| CODE-MEMORY **không phủ 100%** service/FE | Có module chạy thật nhưng không trích được «bước Diễn biến #N» |
| QA nhiều wave còn probe/API | Dễ PASS kỹ thuật / FAIL nghiệp vụ (vd. cột «Khối» ≠ ĐVTV DB) |
| TechSpec thiếu ma trận bước→API | Dev đoán / hardcode registry (vd. `hrm-operating-unit-registry.ts`) |
| Không có CI fail khi file business thiếu `@CODE-MEMORY` | Preflight có thể chưa bật cứng trên mọi path |

**Cách rà «đúng nghiệp vụ» khuyến nghị (chuẩn hóa wave này):**

1. Chọn FR/UC → mở bảng **Diễn biến** SRS.  
2. Grep `ref_srs` / `@CODE-MEMORY` / OpenAPI path.  
3. Đối chiếu từng **# bước** → handler → API → bảng.  
4. QA U65 đúng click path FR.  
5. Mọi lệch → hàng trong §4 / §5 register này.

---

## 3. CODE-MEMORY — có trỏ bước nghiệp vụ chưa?

### 3.1 Baseline scan (2026-07-22)

| Metric | Quan sát |
|--------|----------|
| Files `apps/**` có `@CODE-MEMORY` | **190** / 1105 business `*.ts`/`*.tsx` (TM measure 2026-07-22) |
| `hrm-api` `*.service.ts` | **~41** files — **không** phải file nào cũng có block đầy đủ |
| Ví dụ **đúng chuẩn** (có UC + SRS § + TechSpec § + bước) | `apps/api/hrm-api/src/recruitment/hire-employee-link.ts` — FR-HRM-INT-01 Diễn biến #4/#5/#7 |
| Ví dụ **yếu / thiếu** | Nhiều controller/FE page không có `@CODE-MEMORY`; registry `hrm-operating-unit-registry.ts` **không** CODE-MEMORY + hardcode «Khối» |

### 3.2 Gap CODE-MEMORY (sẽ bổ sung bởi TM wave)

| ID | Area | Finding | Priority |
|----|------|---------|----------|
| **G-CM-01** | Operating unit registry | Hardcode display «Khối * X.E» — không ref SRS bước; đang gây lệch cột công ty NV | **P0** (đang BA/BE) — *note 2026-07-22: file đã có CM UC+SRS+TechSpec nhưng vẫn thiếu `SRS bước` / Diễn biến #* |
| **G-CM-02** | Coverage | Service/FE không có block → không chứng minh map Diễn biến # | **P1** — **CONFIRMED** §3.3 (valid **21.8%** weighted) |
| **G-CM-03** | Preflight | Xác nhận `check-code-memory` có fail CI trên mọi business path | **P0** — **CONFIRMED ABSENT** §3.5 (OS docs gate; repo không có script/CI) |

### 3.3 TM-CODE-MEMORY-COVERAGE-01 — measured coverage (2026-07-22)

**Evidence:** `docs/qa/evidence/tm-code-memory-coverage-01-20260722.md`  
**Valid** = `@CODE-MEMORY` + labeled `UC:` + `SRS:` + `TechSpec:` in header.  
**Diễn biến** = literal `Diễn biến` or `SRS bước`.

| Scope | Total | with CM | valid % | Diễn biến % |
|-------|------:|--------:|--------:|------------:|
| hrm-api `*.service.ts` + `*.controller.ts` | 67 | 18 (26.9%) | **26.9%** | 22.4% (83.3% of CM files) |
| web critical (`web-portal/**/*Page.tsx` + `hrm/src/pages/*.tsx`) | 52 | 11 (21.2%) | **13.5%** | **0%** |
| hrm-mobile `src/features/**` | 23 | 7 (30.4%) | **26.1%** | **0%** |
| **Weighted** | **142** | **25.4%** | **21.8%** | **10.6%** |
| apps `*.ts`/`*.tsx` (context) | 1105 | 190 (17.2%) | — | — |

**Verdict:** Policy ALIGNED; **coverage FAIL** for release-grade traceability. W1 API spine has Diễn biến; FE/Mobile almost none.

### 3.4 Sample — 10 high-traffic gaps (NO_CM or incomplete / no Diễn biến)

| # | Path | Gap |
|---|------|-----|
| 1 | `apps/web/hrm/src/pages/Dashboard.tsx` | NO_CM |
| 2 | `apps/web/hrm/src/pages/Employees.tsx` | CM incomplete (no SRS/TechSpec); no Diễn biến |
| 3 | `apps/web/web-portal/src/pages/command-center/CommandCenterPage.tsx` | CHANGE-only; no UC/SRS/TechSpec header |
| 4 | `apps/web/web-portal/src/pages/auth/LoginPage.tsx` | NO_CM |
| 5 | `apps/api/hrm-api/src/attendance/attendance-requests.service.ts` | NO_CM |
| 6 | `apps/api/hrm-api/src/catalog-sync/catalog-sync.service.ts` | NO_CM |
| 7 | `apps/api/hrm-api/src/home/home.service.ts` | NO_CM |
| 8 | `apps/api/hrm-api/src/employees/employee-profile.service.ts` | NO_CM |
| 9 | `apps/mobile/hrm-mobile/src/features/attendance/CheckInScreen.tsx` | NO_CM |
| 10 | `apps/mobile/hrm-mobile/src/features/dashboard/DashboardScreen.tsx` | NO_CM |

### 3.5 Preflight enforcement (G-CM-03)

| Artifact | Status in xevn-ecosystem |
|----------|--------------------------|
| OS gate `check-code-memory.mjs` (`_vibe-team-os/04-CODE-MEMORY-JOURNAL.md`) | Documented |
| `scripts/preflight/check-code-memory.mjs` | **MISSING** |
| `pnpm` / `npm` `preflight` script | **MISSING** |
| Husky / lefthook | **MISSING** |
| CI (`hrm-quality-gate.yml`) | lint/test/build only — **no CODE-MEMORY check** |

**Next:** `DEVOPS-CODE-MEMORY-PREFLIGHT-01` + backfill `BE/FE/MOB-CM-BACKFILL-HT-01` (see evidence §5).

---

## 4. Code có / SRS không mô tả (orphan implementation)

> **BA-SPEC-CODE-GAP-HRM-01** merged web HRM (2026-07-22) · align `BA-HRM-EMP-COMPANY-COL-01`. MOB rows giữ.

| ID | Surface | Path / symbol | Hành vi quan sát | SRS/FR hiện có? | Đề xuất |
|----|---------|---------------|------------------|-----------------|---------|
| **G-ORPH-01** | HRM employees list «Thông tin công ty» | BE `hrm-operating-unit-registry.ts` (`HRM_OPERATING_UNIT_DEFAULT_DISPLAY_NAMES` «Khối * X.E») + `operating-units.service` seed `company_slug_map` + FE `Employees.tsx` → `resolveOperatingUnitDisplayName` | Cell hiện «Khối Tài chính/Logistics/Dịch vụ/Vận tải X.E» (+ «Tập đoàn XeVN») | **FR-HRM-21** / **UC-HRM-21** list/scope/empty — **không** FR bắt buộc nhãn «Khối»; DANH_MUC §2 + BR-INT-05 + BA-D-01 Plane A = tên pháp nhân/ĐVTV | **Sửa code** LE SoT (**AC-EMP-COL-01..07**); **cấm** đổi header giữ Khối. Wave `D-HRM-EMP-COMPANY-COL-BE/FE-01`. **HOLD_DEPLOY** |
| **G-ORPH-02** | FE web OU labels / fixtures | `hrmOperatingUnits.ts` TEST_FIXTURE «Khối …» (+ historical static risk); runtime resolve fail-closed empty per FE sample | Cells production lấy `display_name_vi` từ API OU map (seed registry) — fixture/test vẫn Khối | Không FR fiction «Khối» trên cột công ty | AC-EMP-COL-03/07; sửa API/DB SoT (G-ORPH-01); cập nhật vitest không assert Khối |
| **G-ORPH-03** | Leave workflow bridge | `leave-workflow.bridge.ts` + `LeaveWorkflowController` `POST …/leave-workflow/terminal` | Spawn/terminal XBOS WF đơn nghỉ | Khách AT-10/12/13 — **không** Diễn biến bridge; TechSpec `must_keep` only | ba-docs ADD Diễn biến **hoặc** TechSpec bước#→API |
| **G-ORPH-04** | Recruitment job-templates CRUD | `recruitment.controller` `job-templates` + DTOs | Catalog template YCTD | **G-DB-05** leftover — ngoài 52 FR Cao | Leftover inventory; **cấm** map giả FR Cao |
| **G-ORPH-05** | Compensation packages | `employee-compensation.service` / `…/compensation-packages` | F5 lương căn cứ tách contract salary | TechSpec annex CI-01 F5 — **không** FR khách W2 | Annex OK; UI customer-facing → FR ADD |
| **G-ORPH-06** | Advance / OT / assets | DDL/API `advance_requests`, overtime/trip/late/shift, `employee_assets` | Module/API tồn tại (TechSpec G-DB-05) | Không `ref_srs` khách | Leftover catalog |
| **G-ORPH-MOB-01** | Mobile Scope / Settings / Home / Payslip | `hrmOperatingUnits.ts` `PILOT_HRM_OPERATING_UNITS` + `companyDisplayVi.resolveCompanyDisplayVi` | Slug `trsport`… → «Khối * X.E» (API hoặc hardcode fallback) | `SRS_MOBILE` UC-HRM-MOB-02 chỉ khóa chọn `companyId` — **không** FR nhãn «Khối» | Cùng G-ORPH-01: BA khóa SoT nhãn **hoặc** bỏ hardcode Khối |
| **G-ORPH-MOB-02** | Mobile ScopeScreen OU picker | `ScopeScreen.tsx` + `fetchHrmOperatingUnits` + `scopeScreenCopy` | UI «Đơn vị vận hành» / rollup tập đoàn / «Lọc danh sách theo Khối…» | SRS_MOBILE **không** mô tả OU filter group-CEO | Spec delta MOB-02/ADR scope **hoặc** trace TechSpec_MOBILE |
| **G-ORPH-MOB-03** | Mobile Login toast | `LoginScreen.tsx` raw `membership.company_display` | Có thể hiện slug/EN; lệch Settings/Home đã resolve VI | UC-HRM-MOB-01 không khóa format nhãn | Thống nhất qua `resolveCompanyDisplayVi` sau khi SoT nhãn chốt |
| **G-ORPH-FE-01** | Employees company column (FE path) | `Employees.tsx` `getCompanyName` → `resolveOperatingUnitDisplayName(operatingUnitLabelMap)` **trước** membership name | Header «Thông tin công ty»; cells theo API OU `display_name_vi` (Khối*) | Same G-ORPH-01 / AC-EMP-COL-* | Prefer LE/`company_display_name`; do not prefer Khối map for this column |
| **G-ORPH-FE-02** | OU filter options/banner | `HrmOperatingUnitFilter.tsx` «Đơn vị thành viên» + `display_name_vi` | Copy ĐVTV nhưng option = Khối* khi API seed registry | FR-HRM-SCOPE-03 ĐVTV / «Tất cả» | AC-EMP-COL-07 — cùng SoT với cột công ty |
| **G-ORPH-FE-03** | Charts / attendance unit labels | `useRecruitmentDashboard`, `useWeeklyAttendanceSummary` + aggregators | Slice/dept label từ cùng `operatingUnitLabelMap` | Chart interim Plane B ≠ cột «công ty» | Update after LE sync; fix vitest asserting Khối |
| **G-ORPH-FE-04** | FE CODE-MEMORY coverage | HRM pages **9/32** CM; **23** thiếu (Dashboard, EmployeeProfile, Insurance, AttendanceEntry, SettingsCatalogs…). Portal pages **7/34** CM. `Employees.tsx` CM thin (no Diễn biến # / AC-EMP-COL) | Runtime screens without SRS bước trace | Policy CODE-MEMORY + OS §14 | `FE-CM-PAGES-BATCH-01`; thicken Employees CM |

*(BA-HRM / BE / FE / MOB append.)*

**FE sample (2026-07-22):** Evidence `docs/qa/evidence/fe-spec-orphan-code-sample-01-20260722.md`. Note: `hrmOperatingUnits.ts` runtime **fail-closed empty** (no live Khối static); Khối* only in **TEST_FIXTURE** + live API. G-ORPH-02 = test fixture / historical risk — production cells come from API map (G-ORPH-FE-01).

**MOB sample CODE-MEMORY (2026-07-22):** `*Screen.tsx` **7/23** có `@CODE-MEMORY`; helpers nhãn scope **0/5** (`companyDisplayVi`, `hrmOperatingUnits`, `scopeScreenCopy`, `dashboardHome`, `payslipDisplayVi`). ScopeScreen CM trỏ brand L3m — **không** Diễn biến # SRS_MOBILE. Evidence: `docs/qa/evidence/mob-spec-orphan-code-sample-01-20260722.md`.

**BA-P (HRM-01):** G-ORPH-01 + G-ORPH-02 + MOB-01 = cùng root class Plane A vs B; một SoT nhãn công ty sau bridge — web+mobile cùng wave label. Evidence: `docs/qa/evidence/ba-spec-code-gap-hrm-01-20260722.md`.

### 4.1 Dev-BE sample — `BE-SPEC-ORPHAN-CODE-SAMPLE-01` (hrm-api top 15)

> Grep `apps/api/hrm-api/src` for hardcoded business labels/registries **without** `@CODE-MEMORY` / `ref_srs`. Inventory only — **no** large refactor. **HOLD_DEPLOY.** Evidence: `docs/qa/evidence/be-spec-orphan-code-sample-01-20260722.md`.

| ID | Surface | Path / symbol | Hành vi quan sát | Likely FR / gap | Đề xuất |
|----|---------|---------------|------------------|-----------------|---------|
| **G-ORPH-BE-01** | Fleet field catalog seed | `settings-catalogs/tourism-fleet-catalog.ts` → `TOURISM_FLEET_CATALOGS` | Hardcode VI labels (BKS, TNDS, phù hiệu, SIM…) + catalog keys `hrm_fleet_*` for `xe-du-lich` | **FR-HRM-FL-01** = list vehicles only; **thiếu** FR field-schema SoT cho `fleet_fields` | BA delta FR fleet fields **hoặc** pull XBOS catalog; add `@CODE-MEMORY` |
| **G-ORPH-BE-02** | Group employee import fields | `settings-catalogs/group-employee-import-catalog.ts` → `GROUP_EMPLOYEE_IMPORT_CATALOGS` | Hardcode 6 domain catalogs + VI labels (`Trực thuộc quản lý`, `select:Nam\|Nữ\|Khác`, typo «thường chú») | **FR-HRM-IM-01** / **FR-HRM-SC-01** — thiếu bảng field SoT khớp Excel | Spec field matrix; CODE-MEMORY |
| **G-ORPH-BE-03** | Tenant position/dept registry | `settings-catalogs/tenant-position-catalog.ts` → `XE_TMDV`/`VISUN`/… | Hardcode phòng ban + chức danh theo tenant (comment: org-seed MD) | Thiếu **FR** «chức danh SoT = XBOS vs seed file» | Prefer XBOS catalog pull; CODE-MEMORY + `ref_srs` |
| **G-ORPH-BE-04** | Attendance dashboard agg | `attendance/attendance-overview.service.ts` → `MONTH_LABELS`, `LEAVE_TYPE_COLORS` | Hardcode «Tháng 1..12» + color map (`annual`/`Nghỉ phép` → `#3b82f6`) | **FR-HRM-20** — **không** khóa palette / leave-type display keys | FR chart AC + i18n; CODE-MEMORY |
| **G-ORPH-BE-05** | Employee salary buckets | `employees/employee-summary.ts` → `EMPLOYEE_SUMMARY_SALARY_RANGE_DEFS` | Hardcode bands 15/20/30 triệu VND | Dashboard/summary — **không** FR ngưỡng lương | FR/BR salary-band SoT or config table |
| **G-ORPH-BE-06** | Payroll component catalog | `payroll/payroll-catalog.service.ts` | Runtime `CREATE TABLE`; default `component_type = 'Lương'` | Payroll FR period/payslip; **thiếu** FR enum thành phần lương | OpenAPI + FR component catalog; CODE-MEMORY |
| **G-ORPH-BE-07** | HR decisions types | `decisions/decisions.service.ts` (+ DTO) | `decision_type` free `TEXT`, default `'appointment'`; no `@IsIn` catalog | **FR-HRM-27** / UC-HRM-27 — type list not locked | FR enum + DTO `@IsIn` |
| **G-ORPH-BE-08** | Spreadsheet kind + aliases | `spreadsheet/spreadsheet-kinds.ts`, `spreadsheet-employee-validation.ts` | `SPREADSHEET_KINDS` import/export only; EN header aliases | **FR-HRM-IM-01** PARTIAL — thiếu alias VI / template AC | FR alias table; CODE-MEMORY |
| **G-ORPH-BE-09** | Task status/priority enums | `operations/dto/create-task.dto.ts`, `update-task-status.dto.ts` (+ CHECK) | Hardcode `low\|medium\|high`, `todo\|in_progress\|done\|blocked` | OP-* task lifecycle — **no** CODE-MEMORY on ops service | Confirm `ref_srs` OP; add CODE-MEMORY |
| **G-ORPH-BE-10** | Interview status enum | `recruitment/dto/update-interview-status.dto.ts` → `INTERVIEW_STATUSES` | Hardcode `scheduled\|passed\|failed\|cancelled` | Recruitment interview FR — state machine may miss Diễn biến | FR interview states; link CODE-MEMORY |
| **G-ORPH-BE-11** | Mobile/home hub agg | `home/home.service.ts` | Birthday (`custom_fields`), who’s-out, celebration limits (5/50), HCM TZ | **UC-HRM-MOB-03** / **FR-HRM-20** — section rules shallow | FR hub sections + CODE-MEMORY |
| **G-ORPH-BE-12** | Scope slug + pilot UUID registry | `common/hrm-list-scope.ts` → `HRM_GROUP_MEMBER_COMPANY_SLUGS`, `HRM_COMPANY_UUID_BY_SLUG` | Hardcode 5 slugs + fixed UUIDs `10000000-…0001..5` | ADR scope ladder; **thiếu** FR «UUID SoT vs seed» in khách SRS | Keep ADR; document `ref_srs` |
| **G-ORPH-BE-13** | Leave balance defaults | `attendance/leave-balance.service.ts` | Default `leave_type = 'annual'`; entitled default 0 | UC-HRM-10 — **thiếu** FR leave-type catalog + entitlement | FR leave types + balance rules; CODE-MEMORY |
| **G-ORPH-BE-14** | Catalog WF tenant gate | `settings-catalogs/xbos-catalog-workflow.bridge.ts` | Hardcode WF start only `xe-du-lich` or `xevn`+`holding\|main` | UF-XBOS-09/15 in comment — **no** CODE-MEMORY / FR gate table | FR which tenants auto-start WF; CODE-MEMORY |
| **G-ORPH-BE-15** | Catalog extensions + plans | `catalog-extensions/catalog-extensions.service.ts` | Large mutate; `plan_name_vi`; **zero** `@CODE-MEMORY` | TechSpec **G-DB-06** — API outside 44 FR khách | Annex FR or team trace; CODE-MEMORY |

**BE scan notes:** ~100+ non-spec `hrm-api` `*.ts` lack `@CODE-MEMORY`; top-15 = highest business-label/registry risk. Company-col product fix **not** redone here (owned by `BE-HRM-EMP-COMPANY-COL-01` — registry already has CM + LE names).

---

## 5. SRS / TechSpec mơ hồ hoặc thiếu bước (unclear / shallow)

| ID | Artifact | § / FR | Vấn đề | Severity |
|----|----------|--------|--------|----------|
| **G-SPEC-01** | Khách `SRS_HRM_KHACH.md` + team `SRS.md` + TechSpec | **FR-HRM-21** / **UC-HRM-21** · cột công ty | Không khóa SoT nhãn «Thông tin công ty» = **legal entity / ĐVTV (Plane A)** vs operating-unit «Khối» (Plane B). Diễn biến #2–#7 không nhắc cột/company label | **P0** — AC-EMP-COL-* (`BA-HRM-EMP-COMPANY-COL-01`); TechSpec Bước#→resolve LE |
| **G-SPEC-04** | Team SRS §15 | **BR-INT-05** | Yêu cầu map 1:1 ĐVTV↔slug nhưng pilot **4 LE ≠ 5 slug** — không nói fail-closed khi thiếu bridge | **P0** — BR-EMP-COL-02; SA bridge |
| **G-SPEC-05** | BA-D-01 / DANH_MUC vs UI | Plane A vs B | Chart G-INT-02 từng lock «Khối … X.E»; cột/filter «công ty» nhiễm cùng chuỗi | **P0** — một SoT tên công ty; AC-EMP-COL-07 |
| **G-SPEC-06** | Khách FR Diễn biến (52 FR `SRS_HRM_KHACH`) | Samples shallow / domain-thin | `pnpm docs:srs:audit` **373/373** = 7 mục only — **không** OS §3.4.5. Heuristic: auth/scope ≥3 **hoặc** domainDeep=0. Samples: **FR-HRM-SC-01**, **AT-02**, **08**, **21**, **20**, **SCOPE-01/02/03**, **12**; PR-05 thiếu fail nghiệp vụ sâu | **P1** — ba-docs ADD; G-RULE-02 gate |
| **G-SPEC-07** | TechSpec §14.1 EM-01 | G-EM-01..04 | Spec vs DTO cứng — PARTIAL; chưa gắn AC FE cột công ty | P1 field / P0 cột = G-SPEC-01 |
| **G-SPEC-02** | OS vs XeVN | Diễn biến ratio | XeVN audit không enforce OS §3.4.2 (auth≤2 / success≥40% / domain-fail≥30%) | P1 |
| **G-SPEC-03** | TechSpec depth | nhiều FR | Thiếu ma trận Bước#→API→bảng OS §3.4.11 (đặc biệt EM list label) | P0/P1 theo module |
| **G-SPEC-XBOS-01** | `docs/client-delivery/xbos/SRS_XBOS_KHACH.md` | FR-CC-P0-04 Diễn biến | Auth-heavy / **0% fail domain** — FAIL OS §3.4.2 | P0 |
| **G-SPEC-XBOS-02** | same | FR-ORG-01, RACI-02, CC-P0-05, ORG-03 | FAIL_DOM ≪30% (shallow Diễn biến) | P1 |
| **G-SPEC-XBOS-03** | same | 8 FR BORDER (~29% fail) | Cần ≥1 deep fail đo được / FR | P1 |
| **G-SPEC-XBOS-04** | `docs/standards/BRD_SRS_WRITING_STANDARDS.md` | Cover / §9 | UNICOM footer & doc-code drift vs XeVN shell — **patched 2026-07-22** | P2 |
| **G-SPEC-XBOS-05** | client-delivery XBOS | HTML slice | Chưa có HTML XBOS từ MD W1/W2 (SoT = MD) | P2 |
| **G-SPEC-OS-01** | `_TEMPLATE_FR.md` | OS §3.4.6 | Thiếu mục **Kết quả trả về khi thành công** (5 cột) — template XeVN | **P0** — G-RULE-05 · SA-SPEC-OS-ALIGN-01 |
| **G-SPEC-OS-02** | `docs/tech-spec/` | OS §3.4.11 F | Path index + pointers **CLOSED**; canonical **21** F.1 pairs (HRM×14 + XBOS×7); U71 §3 physical backlog empty | **CLOSED** — G-RULE-11 · `TM-U71-PHYSICAL-BACKLOG-CLOSE-01` |
| **G-SPEC-OS-03** | XeVN standards | OS §3.4.9 | UI/UX tách lớp SRS vs TechSpec chưa mirror (chỉ global skill) | P1 — G-RULE-09 |

*(ba-docs BA-SPEC-CODE-GAP-XBOS-HTML-01 2026-07-22 — evidence `docs/qa/evidence/ba-spec-code-gap-xbos-html-01-20260722.md`.)*  
*(SA SA-SPEC-OS-ALIGN-01 2026-07-22 — evidence `docs/qa/evidence/sa-spec-os-align-01-20260722.md` · G-SPEC-OS-01..03 + §1 deepen.)*

---

## 6. Member evidence index (điền khi wave xong)

| Role | work_item_id | evidence_path | Merged? |
|------|--------------|---------------|---------|
| SA | SA-SPEC-OS-ALIGN-01 | `docs/qa/evidence/sa-spec-os-align-01-20260722.md` | **YES** §1 deepen + §5 G-SPEC-OS-* · 2026-07-22 |
| BA-P | BA-SPEC-CODE-GAP-HRM-01 | `docs/qa/evidence/ba-spec-code-gap-hrm-01-20260722.md` | **YES** §4–§5 2026-07-22 |
| ba-docs | BA-SPEC-CODE-GAP-XBOS-HTML-01 | `docs/qa/evidence/ba-spec-code-gap-xbos-html-01-20260722.md` | **merged §5** 2026-07-22 |
| TM | TM-CODE-MEMORY-COVERAGE-01 | `docs/qa/evidence/tm-code-memory-coverage-01-20260722.md` | **merged §3.3–§3.5** 2026-07-22 |
| Dev-BE | BE-SPEC-ORPHAN-CODE-SAMPLE-01 | `docs/qa/evidence/be-spec-orphan-code-sample-01-20260722.md` | **merged §4.1** 2026-07-22 |
| Dev-FE | FE-SPEC-ORPHAN-CODE-SAMPLE-01 | `docs/qa/evidence/fe-spec-orphan-code-sample-01-20260722.md` | **merged §4** 2026-07-22 |
| Dev-Mobile | MOB-SPEC-ORPHAN-CODE-SAMPLE-01 | `docs/qa/evidence/mob-spec-orphan-code-sample-01-20260722.md` | **yes** (2026-07-22) |

---

## 7. Kết luận tạm (cho sponsor)

1. **Rule viết:** Global skill + XeVN **ALIGNED** 6 chương / 7 mục FR. **SA-SPEC-OS-ALIGN-01** đóng **G-RULE-01/04** (UNICOM drift + link OS 13/14 trong standards). Còn **OPEN P0:** G-RULE-05 (Kết quả trả về template), G-RULE-03/11 (TechSpec depth + DB/API_DESIGN files). **OPEN P1:** G-RULE-02 (ratio gate), G-RULE-09/10 (UI layer / dual-doc). XBOS HTML + Diễn biến shallow vẫn trong §5 (ba-docs).
2. **Rà code đúng:** SoT = `spec_read_ack` + `@CODE-MEMORY` + `ref_srs` + UF/J-* U65 — đúng hướng; coverage CODE-MEMORY + ma trận bước chưa đủ.
3. **Comment nghiệp vụ:** Wave mới có; registry «Khối» / orphan FE-MOB samples = thiếu trace bước.
4. **Register:** §1 deepened (A–T); member waves §4–§6 đang merge; **không** Phase1/PROD; **cấm deploy**.

**Không** claim Phase 1 / PROD. **Không** deploy.
