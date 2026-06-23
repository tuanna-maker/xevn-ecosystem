# P1-HRM-DQ-DATA-CONTRACT-01 — HRM recruitment/dashboard data contract (incident 1OFFICE mock)

| Field | Value |
|-------|--------|
| **work_item_id** | `P1-HRM-DQ-DATA-CONTRACT-01` |
| **from_role** | ba-data |
| **to_role** | pm → dev-fe (`P1-HRM-DQ-REC-MOCK-01`) → qa (`P1-HRM-DQ-REC-AUDIT-01`) |
| **date** | 2026-06-07 (ICT) |
| **ack_status** | **PASS_TO_PM** |
| **incident_bus** | `docs/program/AGENT_MESSAGE_BUS.md` — `user -> pm | INCIDENT HRM recruitment mock 1OFFICE ≠ XBOS org` |
| **spec_ref** | `docs/hrm/HRM_DASHBOARD_DATA_QUALITY_RULES.md` (BR-DQ-01) · `docs/hrm/SRS.md` UC-HRM-22/30 · `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` · `docs/qa/PILOT_SCOPE_DATA_MATRIX.md` |
| **related_execution** | `P1-HRM-DQ-REC-MOCK-01` (dev-fe) · `P1-HRM-DQ-REC-AUDIT-01` (qa) |

---

## 1. Incident summary

| Symptom | Root cause (data contract) | User impact |
|---------|---------------------------|-------------|
| Recruitment **dashboard tab** bar chart hiển thị **CÔNG TY CỔ PHẦN 1OFFICE** và chi nhánh fiction | `RecruitmentBarChart.tsx` — `const data = [...]` static, không gọi API | User mất tin cậy UAT — nhãn ≠ XBOS org-foundation / HRM seed XeVN |
| Line chart trend 2023 cố định | `RecruitmentLineChart.tsx` — static `const data` | Trend không phản ánh `recruitment_candidates.created_at` |
| KPI chi phí tuyển dụng (990k, 13.395M, …) | `Recruitment.tsx` dashboard tab — literal VND | Không map spend catalog / campaign API |

**Passing patterns (reference impl):** `RecruitmentPieChart` (props từ candidates API), `CandidateSourceStats` (React Query → candidates), main `Dashboard.tsx` (`salaryRangeData` / `departmentSalaryData` từ employees + departments API).

---

## 2. BR-DQ-01 (authoritative)

> **HRM dashboard/chart labels MUST come from API aggregates tied to XBOS org-foundation legal entities + departments OR HRM departments synced from catalog — cấm static mock tenant names (`1OFFICE`, fictional branches, demo company strings).**

### 2.1 Data domain map

```text
XBOS org-foundation (legal_entities, dept tree)
        │ publish / tenant scope
        ▼
HRM departments (synced_catalogs pull) ──► GET /api/hrm/departments
        │
HRM recruitment_* tables ──► GET /api/hrm/recruitment/*
        │
        ▼
FE aggregate (groupBy company_slug | department_id) ──► join display name ──► chart axis/legend
```

### 2.2 Label resolution contract

| Axis type | Join key | Display name field | Scope filter |
|-----------|----------|-------------------|--------------|
| Company / legal entity | `company_id` slug hoặc `legal_entity_id` | `name` từ org-foundation hoặc `GroupMemberUnitRow.name` | JWT rollup (`main` + member slugs) |
| Department | `department_id` hoặc `custom_fields.department` | `departments.name` sau sync | `company_id` = active scope |
| Stage / source | enum từ candidate row | i18n key (`recruitment.applied`, …) | Không cần org join |
| Time bucket | `created_at` / `interview_at` | `format()` locale | Date range query param |

### 2.3 Deterministic error / empty behavior

| Condition | UI | HTTP |
|-----------|-----|------|
| API 200, zero rows | Empty chart + copy «Chưa có dữ liệu» | — |
| API 409 scope | Banner scope (existing HRM pattern) | 409 |
| API 5xx | Error state; **no mock fallback** | 5xx |
| Department id orphan (no join) | Bucket **«Khác»** + log telemetry — **not** invent branch name | — |

---

## 3. Validation matrix

| ID | Condition | Rule | Expected result |
|----|-----------|------|-----------------|
| VAL-DQ-01 | Render recruitment dept bar chart | Data series built from API aggregate | Every `name` ∈ legal entity or department API names for scope |
| VAL-DQ-02 | Static grep gate (see §5) | No banned literals in production components | Exit 0 |
| VAL-DQ-03 | Persona group CEO · seed XeVN | Chart labels | ⊆ {holding, trsport, logistics, finance, services} display names — **never** `1OFFICE` |
| VAL-DQ-04 | `company_id=main` list vs chart | scope_parity | Candidate count per dept on chart = SQL/API aggregate for same scope |
| VAL-DQ-05 | Line trend widget | Time series | Buckets derived from candidate `created_at` in selected year — no hardcoded 2023 array |
| VAL-DQ-06 | KPI «target» recruitment dashboard | Headcount | From `recruitment-plans` or requisition quota API — not literal `'86'` |
| VAL-DQ-07 | Cost KPI cards | Spend | From campaign/spend fields when API exists; else hide card — not fake VND |

---

## 4. Traceability matrix — recruitment dashboard widgets

| Widget | SRS / BR | API (primary) | DB / SoT | FE path | Test evidence (expected) | Journey |
|--------|----------|---------------|----------|---------|---------------------------|---------|
| KPI strip (target / CV / PV / hired) | HRM-RC-02, HRM-RC-04 · UC-HRM-30 | `GET …/recruitment/candidates` · plans/requisitions for **target** | `recruitment_candidates`, `job_requisitions`, `recruitment_plans` | `Recruitment.tsx` dashboard tab | Jest: KPI target from API; **FAIL today** target=`'86'` hardcode | J-HRM-05 |
| Cost cards (avg / TopCV / 24h) | HRM-RC campaign spend (catalog §37) | TBD campaign cost API or hide | `recruitment_campaigns` (when seeded) | `Recruitment.tsx` ~L889–924 | **FAIL today** — literal VND | J-HRM-05 |
| Line trend «recruitmentChart» | HRM-RC-04 aggregate | `listRecruitmentCandidates` + month bucket | `recruitment_candidates.created_at` | `RecruitmentLineChart.tsx` | **FAIL today** — static `const data` | J-HRM-05 |
| Pie «by status» | HRM-RC-04 | candidates → stage filter | `recruitment_candidates.status` | `RecruitmentPieChart.tsx` | **PASS** — API-driven via props | J-HRM-05 |
| Recent activity feed | HRM-RC-04 | kanban / candidates hook | same | `Recruitment.tsx` slice(0,5) | **PASS** | J-HRM-05 |
| **Bar «by dept»** | HRM-RC-02 + dept SoT | `GET /departments` + `GET …/candidates` group-by | departments ← XBOS; candidates FK | `RecruitmentBarChart.tsx` | **FAIL today** — **1OFFICE mock** | J-HRM-05 |
| Reports tab dept chart | UC-HRM-30 reports | `listRecruitmentCandidates` (wire fix pending) | same | `RecruitmentReportsTab.tsx` | **GWC** — queryFn stub `return null \|\| []` | J-HRM-05 |
| Source stats | HRM-RC-04 | candidates `source` field | `recruitment_candidates.source` | `CandidateSourceStats.tsx` | **PASS** | J-HRM-05 |
| Main HRM dashboard dept salary | UC-HRM-20 | employees + departments | `employees`, `departments` | `Dashboard.tsx` | **PASS** — pattern to copy | P-CC-02 |

**scope_parity flag:** Bar chart must use **same** `company_id` / rollup as `GET /recruitment/candidates` list on P-CC-06 (group CEO `main`).

---

## 5. QA probe checklist (grep — no code change in this wave)

Chạy từ repo root. **PASS** khi không còn hit production (ngoại trừ `@mock-allowed` test/fixture).

```bash
# P0 — banned demo tenant
rg -n "1OFFICE|1office|1Office" apps/web/hrm/src/components/recruitment apps/web/hrm/src/pages/Recruitment.tsx apps/web/hrm/src/pages/Dashboard.tsx apps/web/hrm/src/components/dashboard

# P0 — static chart arrays (recruitment)
rg -n "const data = \[" apps/web/hrm/src/components/recruitment

# P1 — mock keywords
rg -n "mockData|MOCK_|sampleData|fakeData|dummy" apps/web/hrm/src/components/recruitment apps/web/hrm/src/pages/Recruitment.tsx apps/web/hrm/src/pages/Dashboard.tsx apps/web/hrm/src/components/dashboard

# P1 — fictional branch names from incident file
rg -n "Echard Phong|Ban thu" apps/web/hrm/src
```

### Baseline scan 2026-06-07 (pre-fix)

| Probe | Result | File:line |
|-------|--------|-----------|
| `1OFFICE` | **FAIL** | `RecruitmentBarChart.tsx:14,17,20` |
| `const data = [` | **FAIL** | `RecruitmentBarChart.tsx:13`, `RecruitmentLineChart.tsx:11` |
| `mock` keyword | PASS (comment only) | `PortalOperationsSummary.tsx:45` — anti-mock comment |
| Hardcoded KPI target `'86'` | **FAIL** | `Recruitment.tsx:~839` |
| Hardcoded cost VND | **FAIL** | `Recruitment.tsx:~900–922` |

### L2 / L2.5 manual (post dev-fe fix)

| Step | Account | Action | Pass |
|------|---------|--------|------|
| L2 | `ceo@xe.vn` | Open P-CC-06 → tab Dashboard | No 409; charts load |
| L2.5 | same | Inspect bar chart Y labels | Names match XBOS member units or HRM departments — **zero** `1OFFICE` |
| L2.5 | same | Network tab | Chart mount preceded by `/api/hrm/recruitment/candidates` and/or `/api/hrm/departments` 200 |

Evidence file QA: `docs/qa/evidence/p1-hrm-dq-rec-audit-20260607.md` (qa lane).

---

## 6. Dev-FE fix contract (handoff to P1-HRM-DQ-REC-MOCK-01)

1. Replace `RecruitmentBarChart` static array → props from parent aggregating candidates + department/legal entity names.
2. Replace `RecruitmentLineChart` → monthly buckets from API (`buildRecruitmentReportFromApi` pattern in `reportsApiAggregator.ts`).
3. Wire `RecruitmentReportsTab` queryFn to `listRecruitmentCandidates` / interviews APIs (remove `null || []` stub).
4. KPI target + cost cards → API or hide until API exists (BR-DQ-01 fail-closed).
5. Add unit test: rendered chart labels must not include `1OFFICE` when mock props absent.

**Reference aggregator:** `apps/web/hrm/src/hooks/reportsApiAggregator.ts` — `buildRecruitmentReportFromApi`.

**Reference org labels:** `apps/web/hrm/src/integrations/tenantScopeApi.ts` — `fetchGroupMemberUnits()`.

---

## 7. Residual / not in ba-data scope

| Item | Owner | Notes |
|------|-------|-------|
| FE implementation | dev-fe | `P1-HRM-DQ-REC-MOCK-01` |
| Grep + L2.5 retest | qa | `P1-HRM-DQ-REC-AUDIT-01` |
| Optional BE aggregate endpoint | dev-be | Only if FE client-side group-by perf insufficient — not blocking if candidates list paginated with sane page_size |
| SRS HTML customer doc | ba-docs | Optional delta UC-HRM-30 AC row citing BR-DQ-01 |

---

## 8. Handoff packet

**completion_report:** Published BR-DQ-01 in `docs/hrm/HRM_DASHBOARD_DATA_QUALITY_RULES.md`; validation matrix VAL-DQ-01..07; recruitment widget traceability table; QA grep checklist with baseline FAIL lines documented. No `apps/**` changes (governance-only).

**next_owner:** pm → dev-fe (in flight) → qa

**next_dispatch_prompt:**

```text
Task qa — work_item_id P1-HRM-DQ-REC-AUDIT-01. Entry: dev-fe READY_FOR_QA P1-HRM-DQ-REC-MOCK-01 merged. Exit: run §5 grep probes (expect 0 hits 1OFFICE + const data); L2 P-CC-06 + L2.5 J-HRM-05 bar chart labels match XBOS/HRM dept names for ceo@xe.vn; evidence docs/qa/evidence/p1-hrm-dq-rec-audit-20260607.md; ack_status PASS_TO_PM or FAIL with file:line.
```

**evidence_path:** `docs/program/governance/p1-hrm-dq-data-contract-20260607.md`

**ack_status:** **PASS_TO_PM**
