# Phase 1 UX Benchmark Assessment — Command Center + HRM embed

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-EX-BA-02` (register reconciliation; supersedes §4 counts in `P1-EX-BA-01-R2`) |
| **trigger** | `P1-EX-QC-02` **C-EXQC2-04** — reconcile §4 P0 post FE-02 / BE-02 / QA-R4 |
| **program** | [`PHASE1_EXCELLENCE_PROGRAM.md`](PHASE1_EXCELLENCE_PROGRAM.md) (T5 — UI/UX vs enterprise HCM) |
| **authors** | BA-Process (process/AC/BR) + BA-Data (density/scope data — cross-ref) |
| **date** | 2026-05-26 |
| **ack_status** | `PASS_TO_PM` |
| **persona baseline** | Group CEO `ceo@xe.vn` / `Xevn@2026` · `company_id=main` rollup |
| **evidence pack** | [`docs/qa/evidence/p1-ex-ba-02-20260526.md`](../qa/evidence/p1-ex-ba-02-20260526.md) (prior: [`p1-ex-ba-01-20260526.md`](../qa/evidence/p1-ex-ba-01-20260526.md)) |
| **sources** | `p1-ex-fe-02-20260526.md` · `p1-ex-be-02-20260526.md` · `p1-ex-qa-01-r4-20260526.md` · `p1-ex-qa-02-r2-20260526.md` · `p1-ex-qc-02-20260526.md` · `PILOT_BUSINESS_FLOW_MATRIX.md` · `PROGRAM_JOURNEY_MAP.md` · code: `HrmWorkspacePanel.tsx`, `hrmApiClient.ts`, `commandCenterStrictMode.ts`, `legalEntityIdResolver.ts` |

### R2 delta (2026-05-26) — `P1-EX-BA-01-R2`

| Change | Detail |
|--------|--------|
| Evidence file | **`p1-ex-ba-01-20260526.md`** on disk — closes QC «file absent» for W-EX-A |
| BE insurance list | `GET /contracts-insurance/insurance` **exists** — Surface A portal cockpit still maps insurance → **contracts** (`HrmWorkspacePanel` L360–363) → **P0 retained** on BR-INS-01 |
| 360 embed guard | `EmbedGuardedTab` blocks Supabase satellite tabs in `?portal=1` — **P0 count −1** on profile (governed block vs silent 54321) |
| L2.5 runtime | QA W5B **J-HRM 7/7 PASS** — UX gaps remain; T5 **still NOT MET** until P0=0 |

### BA-02 delta (2026-05-26) — `P1-EX-BA-02` · closes **C-EXQC2-04**

| Theme | Pre §4 | Post §4 | Evidence |
|-------|--------|---------|----------|
| **Register math** | Header **10** P0 vs §4 row sum **7** | **0** blocking P0; header aligned to rows | [`p1-ex-ba-02-20260526.md`](../qa/evidence/p1-ex-ba-02-20260526.md) |
| **BR-ORG-LINK-01** | CC-ORG-01/02 **P0=1** each | **P0=0** | FE-02 resolver · QC-02 W3-1 / org legal **PASS** |
| **BR-INS-01** | HRM-INS-01 **P0=1** | **P0=0** | FE-02 `listHrmInsurance` (L367–369) · BE-02 · QA-R4 **200** · J-HRM-04 **PASS** |
| **BR-INBOX-01** | CC-INBOX-01 **P0=1** | **P0=0** (blocking) | FE-02 `resolveCommandCenterInboxTasks` vitest **PASS**; **CONDITION** strict browser → **C-EXQC2-05** (QA) |
| **Other P0 rows** | RACI, WF, ATT | **P0=0** | `p1-ex-be-02` · QC-02 §11 concurrence |
| **T5 blocking P0** | NOT MET | **MET** (register) | Program **GWC** until inbox manual + T4/T6 |

---

## 1. Purpose and benchmark frame

**Objective:** Compare XeVN Phase 1 **Command Center (XBOS shell)** and **HRM embed** against patterns in **Workday**, **SAP SuccessFactors (Employee Central / Time / Payroll)**, and **Oracle HCM Cloud** — not pixel parity, but **process completeness**, **deterministic business rules**, and **operator UX** (discoverability, density, cross-nav, empty/error states).

**In scope:** Org/legal entity, RACI governance, employee 360, time (attendance/leave), payroll, workflow/inbox surfaces listed in §3.

**Out of scope (Phase 1):** Full logistic UC block; mobile deep benchmark (summary only); localization beyond VI primary.

### 1.1 Reference capability map

| Domain | Workday (representative) | SAP SuccessFactors | Oracle HCM | XeVN Phase 1 surface |
|--------|-------------------------|-------------------|------------|----------------------|
| Org / legal entity | Org Studio, company hierarchy, cost centers | EC Foundation Objects, legal entity | Legal Employer, BU, departments | CC Settings → member units, org tree, legal profile |
| RACI / governance | Security + role-based job profiles (not RACI matrix native) | GRC / SPM process roles | GRC integrations | `CompanyRaciPanel`, permission matrix |
| Employee 360 | Worker profile unified timeline, all domains tabbed | Person/Employment/Comp/Benefits sub-areas | Person model + assignments | `EmployeeProfile.tsx` + embed list P-CC-03 |
| Time | Time Tracking, exceptions, approvals | Time Management, Time Off | Workforce Management Time | P-CC-07, mobile check-in |
| Payroll | Payroll interface, payslip, periods | Employee Central Payroll / Off-cycle | Payroll Calculation, payslips | P-CC-08 |
| Inbox | Unified inbox, actionable notifications | Workflow inbox, My Inbox | Worklist, notifications | CC rail, WF drawer, catalog-governance inbox |

### 1.2 Gap priority definitions

| Priority | Definition | Exit owner (Excellence program) |
|----------|------------|--------------------------------|
| **P0** | Blocks credible UAT for group CEO slice: broken cross-nav, wrong scope, mock masking API failure, missing BR for security/data isolation, or empty profile tabs with no explanation when satellite data exists | `P1-EX-FE-01` / `P1-EX-BE-01` |
| **P1** | Usable but below enterprise bar: low data density, dual data sources (Supabase vs Nest), incomplete BR in SRS, weak empty-state copy | Same + BA delta SRS |
| **P2** | Polish: i18n, visual density, advanced analytics, delegation rules | `P1-EX-FE-02` |

### 1.3 Assessment method

1. **As-is:** L2/L2.5 matrix + journey map status (2026-05-25).
2. **To-be (benchmark):** One primary reference per row (first product in §1.1 where feature is strongest).
3. **Per screen:** gap P0/P1/P2, missing BR, UX layout issue, linked UC/J-ID.
4. **P0 only:** business rule matrix snippets in §5 (implementation-ready).

**BA-Data companion (density/scope):** `HRM_MENU_DATA_LINKAGE_MATRIX.md` AC-FID-*; `PILOT_SCOPE_DATA_MATRIX.md`; baseline counts §2.1 HRM_MENU (contracts ~9%, attendance ~6% vs target 95% distinct employees).

---

## 2. Executive summary

| Tier | Count | Highlights |
|------|------:|------------|
| **P0 (blocking)** | **0** | Reconciled 2026-05-26 (**BA-02**): org-link, insurance Surface A, inbox strict code, RACI scope, WF PUT, attendance date — closed vs FE-02 / BE-02 / QA-R4 / QC-02 |
| **GWC (non-blocking)** | **1** | **BR-INBOX-01** strict-env browser UAT — owner QA (**C-EXQC2-05**) |
| **P1** | **15** | Low satellite density; dual Surface A/B on embed; employee 360 tab overload without timeline; attendance period UX; payroll period close; BHXH enrollment UX (non-blocking) |
| **P2** | **9** | CC visual density, i18n EN, KPI storytelling, RACI export |

**Verdict:** L2/L2.5 **PASS** (J-HRM **7/7**) with **blocking P0 register = 0** on group CEO slice. Enterprise UX bar (density, timeline, master-detail) remains **P1/P2**. T5 **blocking P0 register MET**; Excellence program tier still **GWC** per `p1-ex-qc-02` (T1 G2, T4, T6, inbox CONDITION).

**Recommended PM dispatch:** QA **C-EXQC2-05** (inbox strict browser); `P1-EX-QC-03` when conditions mature; seed/density via HRM fidelity — not §4 P0.

---

## 3. Per-screen benchmark findings

### 3.1 Command Center — Organization

#### CC-ORG-01 — Đơn vị thành viên (P-CC-02 / J-CC-02)

| | |
|--|--|
| **Route** | `/command-center` → Settings → `company_member_units` |
| **Reference** | Workday Org Studio — company list with status, hierarchy drill-down |
| **XeVN as-is** | `GET /tenant-scope/group-member-units` **200**, ≥1 row (L2 PASS) |
| **Gap** | ~~**P0**~~ → **Closed (BA-02)** — `legalEntityIdResolver` + W3-1 chain **PASS** (`p1-ex-fe-02`, QC-02); **P1** list health indicators remain |
| **Missing BR** | BR-ORG-LINK-01: UI row key MUST resolve to `xbos_legal_entity.id` before shareholders/documents/org-unit writes |
| **UX layout** | **P1** — List without health indicators (sync status, headcount, last publish); no breadcrumb to holding `main` vs member slug |
| **UC/J** | UC-CC-03, UC-ECO-MASTER-01 · J-CC-02 |

#### CC-ORG-02 — Chi tiết pháp nhân + org chart

| | |
|--|--|
| **Route** | Settings → member detail tabs; `OrgGradeOrgChart` |
| **Reference** | SAP EC — org unit tree with effective dating |
| **XeVN as-is** | Org tree API exists; **0** legal-entities for `main` in QA W3 |
| **Gap** | ~~**P0**~~ → **Closed (BA-02)** — legal profile probes **PASS** post seed/link (QC-02 #9); **P1** empty `main` legal-entity count / UX copy |
| **Missing BR** | BR-ORG-02: `PUT legal-entity` rejected for holding root (**PASS** 400); missing BR for «member unit without legal entity» → disable tabs + seed CTA |
| **UX layout** | **P1** — Two-pane settings dense but no sticky scope bar on scroll (Workday pattern: scope always visible) |
| **UC/J** | UC-CC-P0-01..03 |

#### CC-ORG-03 — Hệ thống phòng/ban (dept templates)

| | |
|--|--|
| **Route** | Settings → dept system templates |
| **Reference** | Oracle HCM — department tree templates |
| **XeVN as-is** | `INITIAL_DEPT_SYSTEM_TEMPLATES` mock (`FE_MOCK_TO_API_AUDIT`) |
| **Gap** | **P1** — No CRUD API; not blocking L2 embed |
| **Missing BR** | BR-DEPT-TPL-01 (publish template → org-units) — not in SRS |
| **UX layout** | **P2** — Template picker vs SF Fiori object list |

---

### 3.2 Command Center — RACI

#### CC-RACI-01 — Nhiệm vụ & RACI (catalog / matrix / capabilities / bindings)

| | |
|--|--|
| **Route** | Settings → company detail → `CompanyRaciPanel` |
| **Reference** | SAP GRC / ServiceNow SPM — activity catalog, responsibility matrix, control mapping |
| **XeVN as-is** | APIs `raci-governance/*` wired; coverage stats; column bindings localStorage |
| **Gap** | ~~**P0**~~ → **Closed (BA-02)** — member matrix **200** with resolver parity (QC-02 #6); **P1** — No export/version publish workflow |
| **Missing BR** | BR-RACI-SCOPE-01: matrix `company_id` must use same resolver as `group-member-units` rollup for group CEO |
| **UX layout** | **P1** — Horizontal scroll table OK; missing row filter by domain; SF uses facet filters + heatmap |
| **UC/J** | UC-RACI-01..06 |

#### CC-RACI-02 — Permission matrix (position RBAC)

| | |
|--|--|
| **Route** | Settings → `permission` |
| **Reference** | Workday — domain security policy grid |
| **XeVN as-is** | `GET/PUT /position-rbac/matrix` (P0 persist) |
| **Gap** | **P1** — Debounce save OK; no diff/history vs Oracle audit trail |
| **Missing BR** | BR-RBAC-01: matrix save must not call deprecated `publishVersionChange` as SoT (**met** per COMMAND_CENTER_P0_SRS) |
| **UX layout** | **P2** — Grid 12-col alignment per XEVN style guide — acceptable |

---

### 3.3 Command Center — Workflow & Inbox

#### CC-WF-01 — Workflow canvas (definitions)

| | |
|--|--|
| **Route** | Settings → workflow |
| **Reference** | ServiceNow Flow Designer — persisted graph, versioned |
| **XeVN as-is** | `workflow-engine/definitions` + prototype seed `workflow-graph.ts` |
| **Gap** | ~~**P0**~~ → **Closed (BA-02)** — `PUT` **200** `XBOS-WF-201` (`p1-ex-be-02` BR-WF-01); **P1** — simulation/history panel |
| **Missing BR** | BR-WF-01: after successful load from API, FE must not silently replace payload with local prototype |
| **UX layout** | **P1** — Canvas UX strong (Bezier, dots); missing simulation/run history panel (Workday business process) |
| **UC/J** | UC-XBOS-13..15 |

#### CC-INBOX-01 — Rail tasks / alerts (dashboard workspace)

| | |
|--|--|
| **Route** | Command Center main rail |
| **Reference** | Workday unified inbox — prioritized, SLA, bulk approve |
| **XeVN as-is** | Partial API + `VITE_ALLOW_MOCK_FALLBACK` (`UC-CC-P0-09`) |
| **Gap** | ~~**P0 blocking**~~ → **Closed code (BA-02)** — `resolveCommandCenterInboxTasks` + vitest; **GWC** strict-env browser proof pending (**C-EXQC2-05**); **P1** — No SLA/sort/filter |
| **Missing BR** | BR-INBOX-01: if `VITE_ALLOW_MOCK_FALLBACK=false` and API error/empty → show banner, **zero** mock rows |
| **UX layout** | **P1** — Rail density low vs SF Fiori work center; **P2** i18n |
| **UC/J** | UC-CC-P0-06, UC-CC-P0-09 · J-XBOS-01 partial |

#### CC-INBOX-02 — Hộp thư duyệt danh mục HRM (P-CC-09)

| | |
|--|--|
| **Route** | `/command-center?settings=hrm_catalog_governance` |
| **Reference** | SAP MDG / catalog approval inbox |
| **XeVN as-is** | `GET catalog-governance/inbox` **200** (L2 PASS); approve POST strict scope |
| **Gap** | **P1** — Approve E2E needs seeded pending task; **P2** — No delegation / comment thread |
| **Missing BR** | BR-CAT-GOV-01: approve requires write scope strict (ADR C2) — **documented** |
| **UX layout** | **P1** — Single list; benchmark uses split inbox + detail (master-detail) |
| **UC/J** | UC-XBOS-CAT-03/05 · J-HRM-08 ✅ |

#### CC-KPI-01 — Dashboard / KPI rollup (J-CC-03)

| | |
|--|--|
| **Route** | `/command-center` dashboard |
| **Reference** | Workday scorecards — drill to worker/transaction |
| **XeVN as-is** | kpi-engine rollup **200** post scope fixes; counters may be **0** with 1170 NV |
| **Gap** | **P1** — KPI cards empty misleading (EX-R05); **P2** — No drill-through to HRM lists |
| **Missing BR** | BR-KPI-01: rollup scope query params must match JWT `main` (no 409) — **met** on L2 |
| **UX layout** | **P1** — Empty states need «chưa có satellite seed» not silent zero |
| **UC/J** | J-CC-03 ✅ |

---

### 3.4 HRM embed — Lists (cockpit Surface A)

#### HRM-EMP-LIST — Danh sách nhân sự (P-CC-03)

| | |
|--|--|
| **Route** | `/command-center/hrm/employees` |
| **Reference** | SF Employee Central — advanced filters, saved searches, org chart entry |
| **XeVN as-is** | `GET /employees` **200**, N_EMP≥1000; L2 PASS; J-HRM-02 PASS |
| **Gap** | **P1** — `page_size` max 100 (BR-PAGE-01) vs enterprise 500+ paged export; **P2** — No saved views |
| **Missing BR** | BR-EMP-LIST-01: list scope rollup for `company_id=main` must match detail (parity **fixed** 2026-05-24) |
| **UX layout** | **P1** — `HrmWorkspacePanel` list OK; iframe Surface B may still hit Supabase on navigate |
| **UC/J** | UC-HRM-21 · J-HRM-02 ✅ |

#### HRM-CON-01 — Hợp đồng (P-CC-04)

| | |
|--|--|
| **Route** | `/command-center/hrm/contracts` |
| **Reference** | Workday contracts — linked worker, document gen |
| **XeVN as-is** | List **200**; ~9% employees with contracts; J-HRM-01/03 PASS |
| **Gap** | **P1** — Density; **P1** — Contract drawer BR for expiry alerts not in embed AC |
| **Missing BR** | BR-CON-01: contract list `company_id` rollup = employee list resolver |
| **UX layout** | **P1** — Master-detail not default (SF uses split pane) |
| **UC/J** | UC-HRM-25 · J-HRM-01 ✅ · J-HRM-03 ⏳→PASS in QA W3 |

#### HRM-INS-01 — Bảo hiểm (P-CC-05)

| | |
|--|--|
| **Route** | `/command-center/hrm/insurance` |
| **Reference** | Oracle Benefits — enrollment, BHXH lines per worker |
| **XeVN as-is** | BE: `GET /contracts-insurance/insurance` **200** + `social_insurance_number` (`p1-ex-be-02`). Surface A: `listHrmInsurance` (`HrmWorkspacePanel` L367–369). Surface B: `useInsuranceList` Nest path |
| **Gap** | ~~**P0**~~ → **Closed (BA-02)** — BR-INS-01 / J-HRM-04 **PASS** (QA-R4, QC-02); **P1** — enrollment density AC-FID-04 |
| **Missing BR** | BR-INS-01 — **met** Surface A + B |
| **UX layout** | **P1** — BHXH density / period UX vs Oracle Benefits (columns present, seed thin) |
| **UC/J** | UC-HRM-25 · J-HRM-04 |

#### HRM-REC-01 — Tuyển dụng (P-CC-06)

| | |
|--|--|
| **Route** | `/command-center/hrm/recruitment` |
| **Reference** | SF Recruiting — requisition → candidate pipeline kanban |
| **XeVN as-is** | Requisitions **200**; ~11 reqs / 1170 NV; J-HRM-05 PASS |
| **Gap** | **P1** — No pipeline board; **P1** — iframe Supabase (UC22-E4 class) |
| **Missing BR** | BR-REC-01: requisition status transitions (open/on-hold/closed) deterministic |
| **UX layout** | **P1** — Table-only vs kanban benchmark |
| **UC/J** | UC-HRM-22 · J-HRM-05 ✅ |

#### HRM-ATT-01 — Chấm công (P-CC-07)

| | |
|--|--|
| **Route** | `/command-center/hrm/attendance` |
| **Reference** | Workday Time Tracking — period lock, exceptions, manager approval queue |
| **XeVN as-is** | Records **200**; ~6% density; epoch date FAIL class in BA trace |
| **Gap** | ~~**P0**~~ → **Closed (BA-02)** — `HRM-ATT-DATE-001` on write; invalid read nulled (`p1-ex-be-02`); **P1** — No period lock UI |
| **Missing BR** | BR-ATT-DATE-01: reject display when `attendance_date` invalid / null |
| **UX layout** | **P1** — List without calendar heatmap (Workday time calendar) |
| **UC/J** | UC-HRM-23 · J-HRM-06 ✅ |

#### HRM-PAY-01 — Lương / phiếu lương (P-CC-08)

| | |
|--|--|
| **Route** | `/command-center/hrm/payroll` |
| **Reference** | ADP / SF Payroll — pay period calendar, gross-to-net breakdown |
| **XeVN as-is** | Payslips **200**; ~4% periods; J-HRM-07 PASS |
| **Gap** | **P1** — Period close / reconciliation not in embed; **P1** — iframe Supabase risk |
| **Missing BR** | BR-PAY-SCOPE-01: payslip list uses same rollup scope as employees |
| **UX layout** | **P1** — Payslip list lacks period selector prominent (Oracle payslip hub) |
| **UC/J** | UC-HRM-24 · J-HRM-07 ✅ |

---

### 3.5 HRM — Employee 360 (Worker Profile)

#### HRM-EMP-360 — Hồ sơ nhân viên (`/employees/:id`, embed + iframe)

| | |
|--|--|
| **Route** | From P-CC-03/04/… → detail; `EmployeeProfile.tsx` |
| **Reference** | **Workday Worker Profile** — single timeline, domain tabs fed by integrated APIs, no dead tabs |
| **XeVN as-is** | Core tabs Nest-backed; satellite tabs wrapped in **`EmbedGuardedTab`** — no Supabase mount in embed (`EmployeeProfile.tsx`) |
| **Gap** | **P1** — Governed amber block vs Workday unified timeline; Nest satellite APIs still thin / empty density; **P0** only if unguarded tab regresses (audit: `test:hrm-embed:audit` **9/9**) |
| **Missing BR** | BR-360-SOURCE-01: **partial met** on embed; extend Nest read APIs for degrees/training or keep guard + seed CTA |
| **UX layout** | **P1** — 4 main + 9 «More» tabs (ClickUp-style) exceeds SF 5–7 top domains; **P1** — No unified timeline (Workday «timeline» strip); **P2** — Pin/drag tabs clever but non-standard for enterprise HR |
| **UC/J** | UC-HRM-21 · J-HRM-01..02 |

#### HRM-EMP-360-CON — Tab Hợp đồng / Lương / BHXH (within 360)

| | |
|--|--|
| **Reference** | SF Person/Employment/Compensation tabs |
| **Gap** | **P1** — Contract tab Nest ✅; insurance needs `view_salary` gate — OK; training/degrees **P0** Supabase |
| **Missing BR** | BR-360-PERM-01: `view_salary` hides financial tabs — **met**; missing BR for tab visibility when satellite empty due to seed |
| **UX layout** | **P1** — Financial info duplicated in general column and salary tab (SF separates) |

---

### 3.6 Mobile (summary — not full benchmark)

| Screen | Gap | Priority |
|--------|-----|----------|
| MOB-ATT check-in | GPS OK; manager queue thin | P1 |
| MOB-PAY payslip | J-MOB-04 ⏳ | P1 |
| MOB-INBOX notifications | Inbox API exists; density low | P1 |

---

## 4. Consolidated gap register

| Screen ID | P0 | P1 | P2 | Primary owner | BA-02 note |
|-----------|----|----|-----|---------------|------------|
| CC-ORG-01 | 0 | 1 | 0 | devops (density) | BR-ORG-LINK **closed** |
| CC-ORG-02 | 0 | 1 | 0 | devops (seed) | legal profile **closed** |
| CC-ORG-03 | 0 | 1 | 1 | dev-be (later) | — |
| CC-RACI-01 | 0 | 1 | 0 | dev-fe | scope **closed** |
| CC-RACI-02 | 0 | 1 | 1 | dev-fe | — |
| CC-WF-01 | 0 | 1 | 0 | dev-be | PUT **closed** |
| CC-INBOX-01 | 0 | 1 | 1 | qa | code **closed**; **GWC** manual strict |
| CC-INBOX-02 | 0 | 1 | 1 | dev-fe | — |
| CC-KPI-01 | 0 | 1 | 1 | dev-fe + dev-be | — |
| HRM-EMP-LIST | 0 | 1 | 1 | dev-fe | — |
| HRM-CON-01 | 0 | 1 | 0 | dev-fe | — |
| HRM-INS-01 | 0 | 0 | 0 | devops (density) | BR-INS-01 **closed**; density → BA-Data AC-FID |
| HRM-REC-01 | 0 | 1 | 0 | dev-fe | — |
| HRM-ATT-01 | 0 | 1 | 0 | dev-be + dev-fe | date BR **closed** |
| HRM-PAY-01 | 0 | 1 | 0 | dev-fe | — |
| HRM-EMP-360 | 0 | 3 | 1 | dev-fe + dev-be (satellite APIs) | — |
| **Totals** | **0** | **15** | **9** | | Reconciled **C-EXQC2-04** |

**Governance CONDITION (not §4 P0):** UC-CC-P0-09 inbox strict-env browser — QA **C-EXQC2-05** · evidence `p1-ex-ba-02-20260526.md`.

---

## 5. Business rule matrix snippets (P0 gaps only)

> Format: `condition → action → outcome` (testable). IDs new for Excellence wave; map to SRS delta in governance.

### BR-ORG-LINK-01 — Member unit row → legal entity

| Field | Value |
|-------|--------|
| **Screens** | CC-ORG-01, CC-ORG-02 |
| **Condition** | User opens member unit from `group-member-units` where `row.id` is tenant slug or non-UUID |
| **Action** | FE resolves `legal_entity_id` via `GET /org-foundation/legal-entities?companyId=` or mapped field **before** shareholders/documents/org-unit calls |
| **Outcome** | **PASS:** subsequent GET legal-entity profile **200**; **FAIL:** disable profile tabs, show CTA «Chưa khởi tạo pháp nhân» — no **404** toast loop |
| **Test** | `p1-close-qa-w3` W3-1 probe → **200** after seed |

### BR-INS-01 — Insurance tab data contract

| Field | Value |
|-------|--------|
| **Screens** | HRM-INS-01, HRM-EMP-360 (insurance tab) |
| **Condition** | User opens «Bảo hiểm» with `company_id=main` |
| **Action** | Surface A (`HrmWorkspacePanel`): call `GET /api/hrm/contracts-insurance/insurance` with rollup scope — **not** reuse `listHrmContracts` for `view=insurance`. Surface B: keep `useInsuranceList` Nest path |
| **Outcome** | **PASS:** table shows BHXH fields per SRS; **FAIL:** if only contracts proxy, UI title must not read «Bảo hiểm» alone |
| **Test** | QA network: insurance list ≠ contracts columns; AC-FID-04 |

### BR-360-SOURCE-01 — Employee 360 data source in embed

| Field | Value |
|-------|--------|
| **Screens** | HRM-EMP-360 |
| **Condition** | `shouldSkipSupabaseDataFetches() === true` (portal embed `?portal=1`) |
| **Action** | Satellite tabs (degrees, training, certificates, skills, family, assets, rewards) use Nest endpoints **or** `EmbedGuardedTab` blocks with explicit reason |
| **Outcome** | **PASS:** zero requests to `:54321` on guarded tabs; amber `EmbedGuardedTab` visible; **FAIL:** unguarded tab mounts Supabase client |
| **Test** | `pnpm run test:hrm-embed:audit` **9/9**; console on `/hr/employees/:id?portal=1` |

### BR-ATT-DATE-01 — Attendance date display

| Field | Value |
|-------|--------|
| **Screens** | HRM-ATT-01 |
| **Condition** | `attendance_date` is null, 0, or invalid ISO |
| **Action** | UI shows «—» or «Chưa ghi nhận»; API validation rejects 0 on write |
| **Outcome** | **PASS:** never render 01/01/1970; **FAIL:** UC23-E2 |
| **Test** | QA row filter on P-CC-07 sample data |

### BR-INBOX-01 — No silent mock in production policy

| Field | Value |
|-------|--------|
| **Screens** | CC-INBOX-01 |
| **Condition** | `VITE_ALLOW_MOCK_FALLBACK=false` AND (inbox API empty OR error) |
| **Action** | Render empty state + `ApiLoadBanner`; do not inject `command-center-mock` tasks |
| **Outcome** | **PASS:** 0 mock rows; banner visible; **FAIL:** UC-CC-P0-09 |
| **Test** | Env flag off + stop workflow-engine → UI check |

### BR-RACI-SCOPE-01 — RACI matrix company scope

| Field | Value |
|-------|--------|
| **Screens** | CC-RACI-01 |
| **Condition** | Group CEO JWT `company_id=main` requests matrix for member legal UUID |
| **Action** | BE applies same group rollup resolver as KPI/catalog (ADR GROUP-CEO) **or** FE passes resolved scope key from `CompanyRaciPanel.scopeEntityId` |
| **Outcome** | **PASS:** matrix **200**; **FAIL:** **409** `SCOPE_CONTEXT_MISMATCH` |
| **Test** | `ceo@xe.vn` on member unit RACI tab; QC residual RACI matrix |

### BR-WF-01 — Workflow definition persistence

| Field | Value |
|-------|--------|
| **Screens** | CC-WF-01 |
| **Condition** | User saves workflow graph after load from API |
| **Action** | `PUT /workflow-engine/definitions/:id` with payload from canvas; no local prototype overwrite on success |
| **Outcome** | **PASS:** **200** + reload equals saved; **FAIL:** **500** `XBOS-SYS-001` |
| **Test** | W3-5 probe post-fix |

### BR-EMP-LIST-01 — List/detail scope parity (regression guard)

| Field | Value |
|-------|--------|
| **Screens** | HRM-EMP-LIST, HRM-EMP-360 |
| **Condition** | `GET /employees` returns row for `employee_id` under `company_id=main` rollup |
| **Action** | `GET /employees/:id?company_id=main` uses `resolveHrmListScope` parity |
| **Outcome** | **PASS:** **200** + UI profile; **FAIL:** **404** + «Không tìm thấy nhân viên» |
| **Test** | J-HRM-01, J-HRM-02 (QA W3 **PASS**) — **keep regression** |

---

## 6. UX layout patterns — cross-cutting (benchmark delta)

| Pattern | Enterprise (WD/SF/Oracle) | XeVN gap | Priority |
|---------|----------------------------|----------|----------|
| **Master-detail** | Default on lists | Full-page tab switch embed | P1 |
| **Unified worker timeline** | All events in one stream | Separate tabs, no timeline | P1 |
| **Scope bar** | Company/context always visible | `TenantConfigScopeBar` partial | P1 |
| **Empty state** | Reason + action (seed, sync, permission) | Generic «Không có dữ liệu» | P0/P1 |
| **Error vs empty** | Distinct copy and icon | BR-MOCK-02 exists — enforce on all tabs | P0 |
| **Density / seed** | Expect realistic population | 1–9% satellite vs 95% target | P1 (BA-Data) |
| **i18n** | EN/VI toggle | VI-primary | P2 |

---

## 7. Handoff package

| To | Expectation | Exit |
|----|-------------|------|
| **PM** | §4 **0** blocking P0 (**BA-02**); track **GWC** inbox manual + QC-02 conditions; sponsor line per `p1-ex-qc-02` | `C-EXQC2-04` **closed** |
| **SA** | ADR: legal-entity ID model; 360 data source policy (Nest-only embed) | Short ADR delta |
| **Dev-BE** | BR-ORG-LINK-01 seed; BR-INS-01 API; BR-WF-01; BR-RACI-SCOPE-01 | jest + probes |
| **Dev-FE** | BR-360-SOURCE-01; BR-INBOX-01; BR-INS-01 labels; master-detail P1 | embed audit green |
| **QA** | Extend L2 matrix with UX AC: no 1970 dates, no 54321 on 360, insurance columns | evidence `p1-ex-ux-qa-*.md` |
| **BA-Data** | AC-FID density tied to UX «empty» copy (linked) | `HRM_MENU_DATA_LINKAGE_MATRIX` |
| **QC** | T5 blocking register **0**; re-gate `P1-EX-QC-03` when C-EXQC2-02..07 mature | `p1-ex-qc-02` **GWC** |

**Suggested SRS delta path:** `docs/program/governance/p1-ex-ux-ac-br-delta-20260525.md` (PM dispatch BA narrow if needed).

**Journey map updates (BA-Process):** No new J-* IDs; existing J-HRM-04..06 should add UX step «profile satellite tab loads without 54321».

---

## 8. References

- [`PHASE1_EXCELLENCE_PROGRAM.md`](PHASE1_EXCELLENCE_PROGRAM.md) §2, §4 W-EX-A
- [`PROGRAM_JOURNEY_MAP.md`](PROGRAM_JOURNEY_MAP.md)
- [`docs/qa/PILOT_BUSINESS_FLOW_BA_TRACE.md`](../qa/PILOT_BUSINESS_FLOW_BA_TRACE.md)
- [`docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md`](../hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md)
- [`docs/ecosystem/FE_MOCK_TO_API_AUDIT.md`](../ecosystem/FE_MOCK_TO_API_AUDIT.md)
- [`docs/program/governance/hrm-business-completeness-audit-20260524.md`](governance/hrm-business-completeness-audit-20260524.md)
- [`docs/qa/evidence/p1-close-qa-w3-20260525.md`](../qa/evidence/p1-close-qa-w3-20260525.md)
- [`docs/qa/evidence/p1-close-qa-w5b-20260525.md`](../qa/evidence/p1-close-qa-w5b-20260525.md)
- [`docs/qa/evidence/p1-ex-ba-01-20260526.md`](../qa/evidence/p1-ex-ba-01-20260526.md)
- [`docs/qa/evidence/p1-ex-ba-02-20260526.md`](../qa/evidence/p1-ex-ba-02-20260526.md)
- [`docs/qa/evidence/p1-ex-fe-02-20260526.md`](../qa/evidence/p1-ex-fe-02-20260526.md)
- [`docs/qa/evidence/p1-ex-be-02-20260526.md`](../qa/evidence/p1-ex-be-02-20260526.md)
- [`docs/qa/evidence/p1-ex-qa-01-r4-20260526.md`](../qa/evidence/p1-ex-qa-01-r4-20260526.md)
- [`docs/qa/evidence/p1-ex-qa-02-r2-20260526.md`](../qa/evidence/p1-ex-qa-02-r2-20260526.md)
- [`docs/qa/evidence/p1-ex-qc-02-20260526.md`](../qa/evidence/p1-ex-qc-02-20260526.md)

---

*End of assessment — `P1-EX-BA-02` §4 reconciliation · `PASS_TO_PM` · closes **C-EXQC2-04** · no git commit per instruction.*
