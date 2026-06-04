# HRM Business Completeness Audit — vs SRS / UC Matrix

| Field | Value |
|-------|--------|
| **work_item_id** | `HRM-BA-AUDIT-20260524` |
| **author** | BA-Process (governance lane) |
| **date** | 2026-05-24 |
| **ack_status** | `PASS_TO_PM` |
| **spec_ref** | `docs/hrm/SRS.md` · `PHASE1_UC_SRS_TECHSPEC_MATRIX.md` §2.C · `HRM_MENU_DATA_LINKAGE_MATRIX.md` |

---

## 1. Executive summary

HRM Phase 1 tracks **119 UC** (Khối C: STT 248–366). Matrix `impl_status` shows **no `planned`** in Khối C — but **impl_status ≠ business complete**. Most transactional UCs are **`be` (70)** = API/controller exists; only **35** are **`e2e_pass`**; **13** catalog UCs are **`data`** (seed/sync only); **1** is **`waived`** (UC-HRM-27).

**Verdict for UAT / fidelity:**

| Layer | Status | Meaning |
|-------|--------|---------|
| **L2 tab load** (P-CC-03..08) | **PASS** (2026-05-24) | HTTP 200 / empty+200; no mandatory `:54321` on load |
| **L2.5 cross-nav** (J-HRM-01..07) | **FAIL / open** | 6/7 journeys ⏳; J-HRM-01 fix pending QA retest |
| **G-FID density** (AC-FID-01..16) | **FAIL** | Satellite tables ~1–9% vs 95% FK targets (1170 NV baseline) |
| **Embed 8 UC** (UC-HRM-20..27) | **Partial** | 3 e2e_pass · 4 be (API+load) · 1 waived mock · metadata e2e but low density |
| **Mobile 15 UC** | **Smoke-only** | Matrix `e2e_pass` on M-01..03; J-MOB-03..05 ⏳; SRS §9 AC not per-UC test mapped |

**Bottom line:** HRM is **integration-ready at L2**, **not business-complete** for group CEO fidelity or full SRS acceptance. Claiming Phase 1 HRM DONE requires closing G-FID, L2.5 J-*, insurance list API (R-FID-01), and promoting `be` → verified E2E with density evidence.

---

## 2. Audit method and sources

| Artifact | Role in audit |
|----------|---------------|
| [`docs/hrm/SRS.md`](../../hrm/SRS.md) | UC-HRM-01..12 (core API), §13 embed UC-HRM-20..27, §14 native app UC-HRM-28..32 |
| [`docs/hrm/SRS_MOBILE.md`](../../hrm/SRS_MOBILE.md) | UC-HRM-MOB-01..15 |
| [`docs/ecosystem/PHASE1_UC_SRS_TECHSPEC_MATRIX.md`](../../ecosystem/PHASE1_UC_SRS_TECHSPEC_MATRIX.md) | 119 UC × `impl_status` |
| [`docs/ecosystem/phase1-impl-status.json`](../../ecosystem/phase1-impl-status.json) | Overrides + evidence paths |
| [`docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md`](../../hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md) | Menu ↔ UC ↔ API ↔ FK ↔ AC-FID-* |
| [`docs/qa/PILOT_BUSINESS_FLOW_MATRIX.md`](../../qa/PILOT_BUSINESS_FLOW_MATRIX.md) | L2 P-CC-03..09 |
| [`docs/qa/PILOT_BUSINESS_FLOW_BA_TRACE.md`](../../qa/PILOT_BUSINESS_FLOW_BA_TRACE.md) | UC-HRM-22..25 branches |
| [`docs/program/PROGRAM_JOURNEY_MAP.md`](../PROGRAM_JOURNEY_MAP.md) | L2.5 J-HRM-* / J-MOB-* |
| [`docs/program/governance/PHASE1_UC_DELTA_AC_BR_20260524.md`](PHASE1_UC_DELTA_AC_BR_20260524.md) | Missing AC for Wave C |
| [`docs/ecosystem/FE_MOCK_TO_API_AUDIT.md`](../../ecosystem/FE_MOCK_TO_API_AUDIT.md) | Stub/mock surfaces |
| [`docs/program/HRM_FULL_FIDELITY_PROGRAM.md`](../HRM_FULL_FIDELITY_PROGRAM.md) | G-FID baseline counts |

### 2.1 Completeness taxonomy (audit uses 5 tiers)

| Tier | Code | Definition | Matrix signal |
|------|------|------------|---------------|
| **A — E2E business done** | `E2E-DONE` | L1/L2 PASS + (where applicable) L2.5 + density AC-FID + no mock on prod path | `e2e_pass` + QA evidence |
| **B — API-only / load-only** | `API-ONLY` | Nest endpoints + jest/L1; embed **list load** PASS; CRUD/detail/cross-nav or fidelity **not** closed | `be` or `e2e_pass` without J-* / AC-FID |
| **C — Catalog / data layer** | `DATA-ONLY` | Publish/pull/seed; no full transactional UI journey | `data` |
| **D — Stub / mock / waived** | `STUB` | FE mock, no REST, or explicit waiver | `waived`, `HRM_MOCK_*`, SRS backlog |
| **E — Spec gap** | `SPEC-GAP` | SRS/FR exists; matrix TechSpec «Một phần»; AC missing in test pack | See §7 |

---

## 3. Khối C — 119 UC rollup

### 3.1 By `impl_status` (matrix §2.C)

| impl_status | Count | Audit tier mapping |
|-------------|------:|---------------------|
| `be` | **70** | Mostly **API-ONLY** (B) |
| `e2e_pass` | **35** | **15 mobile** + **20 HRM web/API** — mix of A and B (see §3.2) |
| `data` | **13** | **DATA-ONLY** (C) — XBOS-DM-HRM-01..08, 11..15 |
| `waived` | **1** | **STUB** (D) — UC-HRM-27 |
| **Total** | **119** | |

*Note: 7 UC `UC-XBOS-CAT-01..07` in matrix Owner `XBOS+HRM` are counted inside Khối C STT 367–373 in full catalog; this audit focuses STT 248–366 + mobile block.*

### 3.2 By domain — business maturity

| Domain | UC count | Matrix status mix | Audit tier | Business complete? |
|--------|----------|-------------------|------------|-------------------|
| XBOS-DM-HRM-01..15 | 15 | 13 `data`, 2 `be` | C + B | **No** — 66/72 HRM catalog keys unpublished (`p1-today-ba-d-delta`) |
| UC-HRM-01..08, 12 + HRM-NT | 11 | all `be` | B | **No** — platform/admin; L1 only |
| HRM-EM-01..05 | 5 | `be` | B | **Partial** — list e2e via UC-HRM-21; CRUD/detail L2.5 open |
| HRM-AT-01..13 | 13 | `be` | B | **No** — load PASS; density ~6%; leave/update lifecycle AC thin |
| HRM-SV-01..06 | 6 | `be` | B | **No** |
| HRM-PR-01..06 | 6 | `be` | B | **No** — payslip load PASS; periods/chốt kỳ not UAT-proven |
| HRM-RC-01..06 | 6 | `be` | B | **No** — ~1% requisition density |
| HRM-CI-01..07 | 7 | `be` | B | **No** — ~9% contract coverage; **no** `GET /insurance` list (R-FID-01) |
| HRM-SC-01..09 | 9 | `be` | B | **No** — sync API exists; AC-FID-10 (≥8 keys) not met |
| HRM-MD-01..05 | 5 | `e2e_pass` | A− | **Partial** — API e2e; queue density AC-FID-11 open |
| HRM-IM-01..04 | 4 | `e2e_pass` | A− | **Partial** — import e2e; pre-sync UC XBOS-DM-HRM-11 still `data` |
| HRM-OP-01..04 | 4 | `e2e_pass` | A− | **Partial** — AC-FID-12 density open |
| HRM-PF-01..04 | 4 | `e2e_pass` | A− | **Partial** — AC-FID-13 open |
| HRM-FL-01 | 1 | `be` | B | **No** — du lịch fleet; menu deferred |
| UC-HRM-20..27 (embed) | 8 | see §4 | Mixed | **Partial** |
| UC-HRM-MOB-01..15 | 15 | all `e2e_pass` | B (smoke) | **No** — see §5 |

---

## 4. Embed 8 routes — UC-HRM-20..27

**SRS:** [`docs/hrm/SRS.md`](../../hrm/SRS.md) §13.  
**Pilot L2:** P-CC-03..08 map to six transactional tabs; UC-HRM-20 (dashboard) and UC-HRM-26 (metadata) are adjacent embed views.

| UC | Embed view / P-CC | Primary API | Matrix | L2 | L2.5 J-* | FE surface | Data fidelity | **Audit tier** |
|----|-------------------|-------------|--------|-----|----------|------------|---------------|----------------|
| **UC-HRM-20** | Dashboard / `/command-center/hrm` | `GET /operations/reports/summary`, aggregates | `e2e_pass` | Implicit PASS | — | Panel API + mock fallback (FE audit **B**) | Counters often 0 vs 1170 NV | **API-ONLY** |
| **UC-HRM-21** | Employees **P-CC-03** | `GET /employees` | `e2e_pass` | **PASS** | J-HRM-02 ⏳ | Panel ✅; iframe may Supabase on detail | N_EMP≥1000 ✅; detail scope parity fix 2026-05-24 | **API-ONLY** → A when J-HRM-02 PASS |
| **UC-HRM-22** | Recruitment **P-CC-06** | `GET /recruitment/requisitions` | `be` | **PASS** | J-HRM-05 ⏳ | Panel ✅; iframe **no** `shouldSkipSupabase` (BA trace) | ~11 reqs / 1170 NV | **API-ONLY** |
| **UC-HRM-23** | Attendance **P-CC-07** | `GET /attendance/records`, leave | `be` | **PASS** | J-HRM-06 ⏳ | Panel ✅; iframe Supabase hooks | ~72 records (~6%) | **API-ONLY** |
| **UC-HRM-24** | Payroll **P-CC-08** | `GET /payroll/payslips` | `be` | **PASS** | J-HRM-07 ⏳ | Panel ✅; iframe Supabase risk | ~43 periods (~4%) | **API-ONLY** |
| **UC-HRM-25** | Contracts **P-CC-04** + Insurance **P-CC-05** | `GET /contracts-insurance/contracts`; **gap:** `GET /insurance` | `be` | **PASS** | J-HRM-01 🔧, J-HRM-03/04 ⏳ | Insurance tab proxies contracts / expiring | ~101 contracts (~9%) | **API-ONLY** + **SPEC-GAP** (insurance list) |
| **UC-HRM-26** | Metadata queue (decisions embed / settings) | `GET /employee-metadata/change-requests` | `e2e_pass` | Not in P-CC-03..08 | — | ✅ API mode | AC-FID-11 pending | **API-ONLY** |
| **UC-HRM-27** | Decisions / reports | **None** — SRS backlog | `waived` | N/A | N/A | `HRM_MOCK_DECISIONS/REPORTS` | N/A | **STUB** |

### 4.1 Embed — spec vs implementation gaps

| Gap ID | UC / route | SRS says | Actual | Missing AC / evidence |
|--------|------------|----------|--------|------------------------|
| **EG-01** | UC-HRM-25 / P-CC-05 | Dedicated BHXH list | No `GET /contracts-insurance/insurance`; proxy + expiring | AC-FID-04; Q-U18-03; R-FID-01 |
| **EG-02** | UC-HRM-21 | Detail from list same scope as list | Was 404 on `GET /employees/:id?company_id=main` (J-HRM-01 class) | AC-U18-21-02; scope parity ADR C2 |
| **EG-03** | UC-HRM-22..24 | No mock when API mode | `HrmWorkspacePanel` still has mock fallback (FE audit **B**) | AC-U18-FE-01; BR-MOCK-02 retest under API fail |
| **EG-04** | UC-HRM-22..24 iframe | Nest-only on load | Surface B (`/hr/*?portal=1`) still hits Supabase on some pages | BR-DATA-01; UC22-E4, UC23-E4, UC24-E3 |
| **EG-05** | UC-HRM-20 | Dashboard counters reflect workforce | Summary may show zeros with 1170 NV | AC-U18-20-01; AC-FID-01 satellite |
| **EG-06** | UC-HRM-27 | Backlog — no DONE claim | Mock decisions/reports | SRS §13 UC-HRM-27 acceptance explicit; waiver OK for P1 if labeled |
| **EG-07** | All embed lists | FK + catalog lineage | Orphan/coverage far below R_distinct≥0.95 | AC-FID-03..09, AC-FID-16 |

### 4.2 Embed — acceptance criteria status

| AC source | Covered for embed 8? | Gap |
|-----------|---------------------|-----|
| SRS §13 per-UC (UC-HRM-21..25) | **Partial** | Happy/empty/error branches in BA trace; **cross-nav AC missing** in SRS §13 text |
| `PHASE1_UC_DELTA_AC_BR` §2.1 | UC-HRM-20, 21 only | UC-HRM-22..25 rely on BA trace — **no AC-U18-22..25-* IDs** |
| `HRM_MENU_DATA_LINKAGE` §4–§5 | Full branch catalog H-EMP..H-PAY | **Density AC-FID-* not in SRS.md** — separate doc only |
| `PROGRAM_JOURNEY_MAP` J-HRM-01..07 | **Required** | **6/7 not PASS** — blocks UAT-READY per U19 |

---

## 5. Mobile — UC-HRM-MOB-01..15

| UC | SRS focus | Matrix | Automated smoke | J-MOB / L2.5 | Density / business | **Audit tier** |
|----|-----------|--------|-----------------|--------------|-------------------|----------------|
| MOB-01..02 | Login, scope | `e2e_pass` | M-01 PASS | J-MOB-01 ✅ | — | **E2E-DONE** (auth only) |
| MOB-03 | Dashboard | `e2e_pass` | Partial | — | Aggregates not tied to AC-FID | **API-ONLY** |
| MOB-04..05 | Check-in, history | `e2e_pass` | M-02 PASS | — | ≥1 record/UAT user — **not** proven at scale | **API-ONLY** |
| MOB-06..08 | Leave/update + approve | `e2e_pass` | M-03 partial | J-MOB-03, J-MOB-05 ⏳ | Manager hat rules not in SRS AC table | **API-ONLY** |
| MOB-09..10 | Payslip, contract/insurance | `e2e_pass` | — | J-MOB-04 ⏳ | Needs NV with HĐ+payslip seed | **API-ONLY** |
| MOB-11 | Tasks / service | `e2e_pass` | Optional pilot | — | Optional | **API-ONLY** |
| MOB-12 | Profile | `e2e_pass` | — | — | PATCH metadata vs UC-HRM-26 linkage unclear | **API-ONLY** |
| MOB-13 | Notifications | `e2e_pass` | — | — | Realtime/push AC not mapped to test IDs | **SPEC-GAP** |
| MOB-14 | Offline | `e2e_pass` | — | — | Idempotent queue AC in TechSpec only | **SPEC-GAP** |
| MOB-15 | Logout | `e2e_pass` | — | — | — | **E2E-DONE** (smoke) |

### 5.1 Mobile — missing acceptance (vs SRS §9)

SRS Mobile §9 states generic criteria only — **no measurable AC per UC**. Gaps:

| Gap ID | Topic | Missing AC |
|--------|-------|------------|
| **MG-01** | MOB-08 manager approve | Pass: approver with hat → 200; Fail: wrong scope → 403; evidence: audit row |
| **MG-02** | MOB-09 payslip detail | Pass: `GET payslips?employee_id=self` 200 + amount>0 when seed; cross-nav list→detail |
| **MG-03** | MOB-10 insurance | Pass: expiring or contract linked; Fail: no orphan employee_id |
| **MG-04** | MOB-13 notifications | Pass: fanout after leave create → inbox ≥1; Socket join room |
| **MG-05** | MOB-14 offline | Pass: queue replay idempotent; Fail: duplicate POST rejected |
| **MG-06** | All MOB | Map each UC to **J-MOB-*** in QA matrix (only 01–02–04 smoke today) |

**Mobile auth path:** `POST /auth/mobile/login`, `select-membership`, `refresh` — implemented (`mobile-auth.controller.ts`); matrix `e2e_pass` **overstates** journey completeness.

---

## 6. Core API UC (UC-HRM-01..12) vs SRS

| UC | SRS §4 coverage | Implementation | Audit tier |
|----|-----------------|----------------|------------|
| UC-HRM-01..08 | Full if/else + error codes | Controllers exist; `be` | **API-ONLY** — L1 health/catalog |
| UC-HRM-09..11 | Attendance/service lifecycle + fanout | `be`; notifications pipeline in SRS | **API-ONLY** — UI embed does not expose full CRUD |
| UC-HRM-12 | Inbox read | `be` | **API-ONLY** — mobile MOB-13 partial |

**SRS gap:** §4 documents UC-HRM-01..12; §13–14 add embed/native UCs **not** in §2 table (UC-HRM-20..32) — traceability split across sections; matrix uses BANG_TONG_HOP 119 UC set.

---

## 7. Traceability gaps (requirement → impl → test)

| ID | Type | Description | Owner | Trigger |
|----|------|-------------|-------|---------|
| **TR-01** | Matrix vs fidelity | `impl_status=be` treated as «done» in WBS; **no column** for AC-FID or J-* | PM / BA-P | QC gate |
| **TR-02** | SRS structure | UC-HRM-28..32 in SRS §14 **outside** Phase 1 matrix 119 | BA-P | Native HRM app scope |
| **TR-03** | Insurance API | HRM-CI-02/07 SRS endpoints vs missing list route | Dev-BE | R-FID-01 |
| **TR-04** | Catalog SoT | 72 HRM catalog keys SRS vs 6 published `target=hrm` | DevOps / BA-D | G5 |
| **TR-05** | FE mock registry | `FE_MOCK_TO_API_AUDIT.md` dated 2026-05-16 vs L2 PASS 2026-05-24 — **stale** for Panel status | Dev-FE | AC-U18-FE-01 |
| **TR-06** | Mobile tests | Matrix `e2e_pass` cites `MOBILE_BACKLOG.md` not per-UC QA evidence | QA | UAT mobile sign-off |
| **TR-07** | Cross-nav | J-HRM-01..07 in journey map; **absent** from SRS §13 acceptance bullets | BA-P | U19 |
| **TR-08** | UC-HRM-09..12 | SRS notification fanout rules; **no** embed UC mapping to inbox UI | BA-P | Notification UX |
| **TR-09** | Performance module | HRM-PF e2e_pass but **no** P-CC embed row | PM | Menu scope |
| **TR-10** | Decisions/tools | UC-HRM-27 waived; `tools_equipment`, `hrm_ai` menus **unmapped** to UC in matrix | PM | Phase 2 CR |

---

## 8. Missing acceptance criteria — consolidated backlog

### 8.1 P0 — Embed 8 + pilot (dispatch QA with AC-ID)

| AC-ID (proposed) | Scope | Pass | Fail |
|------------------|-------|------|------|
| **AC-HRM-EMBED-01** | J-HRM-01..07 | Each journey: click path → detail API **200**, scope `main` rollup | 404, empty error banner |
| **AC-HRM-EMBED-02** | P-CC-03..08 | After `seed:hrm:fidelity`: each tab **≥1 row** OR explicit empty reason (not 200+mock) | All tabs empty @ 1170 NV |
| **AC-HRM-EMBED-03** | UC-HRM-25 insurance | `GET /insurance` **or** documented waiver + SQL fidelity on `employee_insurance_records` | UI-only proxy without BR-LINK-07 |
| **AC-HRM-EMBED-04** | iframe Surface B | `test:hrm-embed:audit`: 0× `:54321` required on load P-CC-03..08 | ERR_CONNECTION_REFUSED |
| **AC-HRM-EMBED-05** | UC-HRM-27 | UI shows «Chưa triển khai» — **no** mock data masquerading as live | Mock rows without badge |

*Existing delta:* AC-U18-20-01/02, AC-U18-21-01/02 (`PHASE1_UC_DELTA_AC_BR_20260524.md`) — **extend** with AC-HRM-EMBED-01..05.

### 8.2 P1 — Mobile

| AC-ID (proposed) | UC | Pass |
|------------------|-----|------|
| AC-HRM-MOB-J03 | MOB-06..07 | Create leave → appears in list → detail 200 |
| AC-HRM-MOB-J04 | MOB-09 | Payslip list → detail net_amount>0 |
| AC-HRM-MOB-J05 | MOB-08 | Manager approve → status change + notification |
| AC-HRM-MOB-J06 | MOB-14 | Offline queue → single server row on replay |

### 8.3 P1 — Fidelity (from AC-FID — promote into SRS §10)

Copy **AC-FID-01..16** from [`HRM_MENU_DATA_LINKAGE_MATRIX.md`](../../hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md) §5 into SRS or client FR pack — currently **orphaned** from SRS §10 (only UC-HRM-01..12 listed).

---

## 9. Stub / mock inventory (HRM-relevant)

| Location | Module | SRS UC | Tier |
|----------|--------|--------|------|
| `HrmWorkspacePanel` | Decisions, reports, AI, some tasks | UC-HRM-27, — | **STUB** |
| `HrmWorkspacePanel` fallback arrays | Recruitment, attendance, payroll, contracts | UC-HRM-22..25 | **STUB** (dev fallback — BR-MOCK-01 if API 200 empty) |
| `/hr/insurance`, `/hr/recruitment`, … iframe | Supabase reads | UC-HRM-22..25 Surface B | **STUB** risk on load |
| `apps/web/hrm` EmployeeSalary | mock salary chart | UC-HRM-28 (§14, out of matrix) | **STUB** |
| Embed `decisions`, `tools_equipment` routes | No API | UC-HRM-27, — | **STUB** / deferred |

---

## 10. Recommendations and handoff

| Priority | Action | Role | work_item_id |
|----------|--------|------|--------------|
| P0 | Run QA retest **J-HRM-01..07** after scope parity fix | QA | `HRM-L25-QA-01` |
| P0 | Execute `seed:hrm:fidelity` + `verify:hrm:menu-density` | Dev-BE / DevOps | `HRM-FIDELITY-BE` |
| P0 | Implement or waive **GET /contracts-insurance/insurance** with PM sign-off | Dev-BE | R-FID-01 |
| P1 | Add **AC-HRM-EMBED-*** + **AC-HRM-MOB-J*** to delta SRS / QA scripts | BA-P | `HRM-BA-AC-DELTA` |
| P1 | Refresh `FE_MOCK_TO_API_AUDIT.md` HrmWorkspacePanel rows post L2 PASS | Dev-FE | `P1-TODAY-EXEC-C-FE` |
| P1 | Publish remaining **66** HRM catalog keys (`target=hrm`) | DevOps | G5 wave B |
| P2 | UC-HRM-27 / tools / AI — PM scope CR or keep waived with USER_SERVICE_STATUS label | PM | — |

### Handoff packet

| to_role | entry_criteria | exit_criteria | evidence_path |
|---------|----------------|---------------|---------------|
| **QA** | This audit §4–§5 AC tables | L2.5 J-* PASS/FAIL logged | `docs/qa/evidence/hrm-completeness-*` |
| **Dev-BE** | EG-01, TR-03, AC-FID-03..09 | R-FID-01 closed or waived | seed log + SQL |
| **Dev-FE** | EG-03, EG-04, TR-05 | AC-HRM-EMBED-04 PASS | embed audit script |
| **PM** | Verdict §1 | Update `USER_SERVICE_STATUS` / `SERVICE_READINESS` — no UAT-READY until G-FID + L2.5 | bus + this file |

---

## 11. Document control

| Version | Date | Author | Change |
|---------|------|--------|--------|
| 1.0 | 2026-05-24 | BA-Process | Initial HRM business completeness audit |

**Related governance artifacts:**  
[`PHASE1_UC_DELTA_AC_BR_20260524.md`](PHASE1_UC_DELTA_AC_BR_20260524.md) · [`p1-today-ba-p-delta-20260524.md`](p1-today-ba-p-delta-20260524.md) · [`p1-today-ba-d-delta-20260524.md`](p1-today-ba-d-delta-20260524.md)

**ack_status:** `PASS_TO_PM` — governance only; **does not** claim Phase 1 HRM DONE.
