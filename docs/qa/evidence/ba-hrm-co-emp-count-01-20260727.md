# D-HRM-CO-EMP-COUNT-BA-01 — Company Management employee headcount AC delta

| Field | Value |
|-------|--------|
| **work_item_id** | `D-HRM-CO-EMP-COUNT-BA-01` |
| **date** | 2026-07-27 (ICT) |
| **from_role** | ba-process |
| **to_role** | pm → **dev-be** + **dev-fe** (parallel) → qa |
| **lane** | governance (AC / BR / matrix — **no** `apps/**`) |
| **ack_status** | **PASS_TO_PM** |
| **estimated_effort** | 0.5d |
| **no_prompt_echo** | true |

---

## 1. Incident (sponsor)

| Item | Observation |
|------|-------------|
| URL | `/command-center/hrm/company` (Company Management) |
| Card | «Tổng nhân viên» = **0** |
| Column | Mọi dòng «Số nhân viên» = **0** |
| Contrast | Dashboard Nhân sự «Tổng nhân viên» ≈ **1109** (cùng persona) |
| Business demand | NV phải thuộc ĐVTV XBOS đã khai báo — linkage đúng, không orphan / không fake 0 |

---

## 2. Spec says vs code does (diagnosed — not re-explored)

| Layer | Spec / SoT | Code does |
|-------|------------|-----------|
| Matrix `company` row (pre-delta) | ≥1 member unit visible | **No** `employee_count` AC |
| FE | — | `mapGroupMemberUnitsToHrmCompanies` → `employee_count: null`; UI `\|\| 0` |
| Data plane | Page loads XBOS `group-member-units` only | Never joins HRM employee counts |
| Plane A | XBOS legal entity UUID / ĐVTV | List rows |
| Plane B | `employees.company_id` ∈ `holding\|trsport\|logistics\|finance\|services` | Headcount SoT |
| QA prior | UF-HRM-MENU-15 / company load visibility | **PASS** without asserting headcount → **insufficient AC** |

```text
spec_gap (closed this wave): Company Management must show workforce counts via LE→slug bridge
code: XBOS list + null count coerced to 0
```

---

## 3. Spec_ref

| Artifact | Reference |
|----------|-----------|
| SRS | `docs/hrm/SRS.md` **UC-HRM-03** · **§15.4 BR-INT-05** (ĐVTV ↔ slug) |
| Matrix (updated) | `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` §2.1 `company` · §5 **AC-CO-EMP-01..06** · §6 **BR-INT-05 / BR-CO-EMP-01..02** |
| Dual-plane SoT | `docs/program/governance/p1-prod-int-ba-d-01-20260607.md` Plane A/B |
| Scope / rollup | `docs/architecture/ADR-GROUP-CEO-MAIN-HOLDING-SCOPE.md` `GROUP_MEMBER_SLUGS` |
| Headcount definition | `docs/hrm/HRM_DASHBOARD_DATA_QUALITY_RULES.md` AC-HC-03 · `GET /employees/summary` `total` |
| Registry (display + slug) | `apps/api/hrm-api/src/operating-units/hrm-operating-unit-registry.ts` `HRM_OPERATING_UNIT_DEFAULT_DISPLAY_NAMES` |
| Related AC (labels) | `docs/qa/evidence/ba-hrm-emp-company-col-01-20260722.md` AC-EMP-COL-* (nhãn; không thay headcount) |
| Journey / UF | Company surface · UF-HRM-MENU-15 (load) — **extend** assert AC-CO-EMP; proposed **J-HRM-CO-01** |

---

## 4. Registry bridge (LE / ĐVTV display → operating slug)

SoT interim BR-INT-05 (cite registry; SA may refine UUIDs — **slugs + names** lock for AC):

| Operating slug (`employees.company_id`) | ĐVTV / LE display name (Plane A) | Typical XBOS tenant / note |
|----------------------------------------|----------------------------------|----------------------------|
| `holding` | Tập đoàn XeVN | Holding root |
| `trsport` | Công ty Cổ phần Thương mại và Dịch vụ X.E | `xe-tmdv` |
| `logistics` | Công ty TNHH Du lịch Visun | `visun` (QA OU filter: Visun → `company_id=logistics`) |
| `finance` | Công ty TNHH Du lịch X.E Việt Nam | `xe-du-lich` |
| `services` | Công ty TNHH X.E Việt Nam | `xe-vietnam` |

Canonical set: `GROUP_MEMBER_SLUGS` = `holding`, `trsport`, `logistics`, `finance`, `services` (ADR + seed cardinality).

---

## 5. Acceptance criteria (copy-ready Dev/QA)

### AC-CO-EMP-01 — Card «Tổng nhân viên»

| | |
|--|--|
| **Persona** | Group CEO `ceo@xe.vn` · JWT `company_id=main` · tenant `xevn` |
| **URL** | `/command-center/hrm/company` |
| **Pass** | Card value = sum of workforce headcount across **visible** ĐVTV rows; equals (or ≈) `GET /api/hrm/employees/summary?company_id=main` → **`total`** (non-archived; same definition as Dashboard «Tổng nhân viên») |
| **Fail** | Card shows `0` while summary/dashboard total > 0; or card never sourced from HRM |

### AC-CO-EMP-02 — Column «Số nhân viên» per row

| | |
|--|--|
| **Pass** | Each ĐVTV row shows count of employees where `company_id` = bridged operating slug for that row |
| **Fail** | All rows `0` when any slug has NV; count by LE UUID without bridge; hardcode |

### AC-CO-EMP-03 — Bridge correctness

| | |
|--|--|
| **Pass** | Holding → `holding`; Visun → `logistics`; X.E TMDV → `trsport`; X.E Du lịch → `finance`; X.E Việt Nam → `services` (registry §4) |
| **Fail** | Wrong slug; unmapped visible ĐVTV still shows fake `0` without «—» / error path |

### AC-CO-EMP-04 — Empty / null / API fail

| | |
|--|--|
| **Pass** | Headcount API fail → UI **«—»**; successful count of 0 only when slug truly has 0 NV |
| **Fail** | `null \|\| 0` when API missing/failed or when data exists elsewhere |

### AC-CO-EMP-05 — Dashboard parity

| | |
|--|--|
| **Pass** | Same session: Company card ≈ Dashboard «Tổng nhân viên» (±0; if status filter differs, document ≤1% and still ≠ all-zero) |
| **Fail** | Company=0 / Dashboard≈1109 |

### AC-CO-EMP-06 — Persist after F5

| | |
|--|--|
| **Pass** | F5 / re-enter menu → same counts; DevTools shows HRM summary and/or per-slug count **2xx** in addition to XBOS member-units |
| **Fail** | Reload returns all zeros; only XBOS calls |

### Cross-nav (L2.5)

| ID | Pass |
|----|------|
| **J-HRM-CO-01** (new) | Company list row → company detail / admin surface loads in-scope; headcount on list still correct after back |

---

## 6. Business rules

| BR ID | Condition | Action | Outcome |
|-------|-----------|--------|---------|
| **BR-INT-05** | Reconciliation XBOS ĐVTV ↔ HRM workforce | Map mỗi ĐVTV vận hành ↔ đúng 1 slug ∈ `GROUP_MEMBER_SLUGS`; Company UI dùng map này để đếm | Script/QA PASS hoặc gap có owner |
| **BR-CO-EMP-01** | Employee on master partition | `company_id` ∈ bridged slugs mapped to XBOS ĐVTV; **orphan slug/null = 0** trên pilot workforce | Thuộc ĐVTV nghiệp vụ, không «vô chủ» |
| **BR-CO-EMP-02** | DTO thiếu `employee_count` | FE **không** coerce `null→0`; bind HRM count hoặc «—» | Honest UI; AC-CO-EMP-04 |

---

## 7. Process note — prior QA PASS insufficient

| Prior evidence | Verdict then | Status now |
|----------------|--------------|------------|
| UF-HRM-MENU-15 Company `/company` «Load OK» (`USER_FLOW_OPERABILITY_MATRIX` §4b) | 🟢 load visibility | **INSUFFICIENT** for headcount / linkage — **do not** treat as AC-CO-EMP PASS |
| Any QA that accepted Company list with all employee counts = 0 while Dashboard total > 0 | Misleading PASS | **Superseded** — retest required under AC-CO-EMP-01..06 |

**PM/QA rule:** Company Management **DONE** chỉ khi AC-CO-EMP + list visibility; load-only ≠ business PASS.

---

## 8. As-is vs to-be (process)

| | As-is | To-be |
|--|-------|-------|
| Data sources | XBOS `group-member-units` only | XBOS ĐVTV **+** HRM counts via slug bridge |
| Card / column | `null→0` | Real counts or «—» on fail |
| Ownership | Looks like «no employees in companies» | NV belong to operating slug of ĐVTV |
| QA | Visibility PASS | Headcount + parity + F5 |

---

## 9. Option evaluation (BA — handoff)

| Option | Summary | Risk | Recommend |
|--------|---------|------|-----------|
| **A** | BE: enrich member-units response with per-slug `employee_count` + rollup total (bridge server-side); FE bind fields | Needs bridge LE UUID→slug on BE | **YES** (preferred — single contract) |
| **B** | FE: after XBOS list, call `GET /employees/summary?company_id=main` + N× summary/list totals per slug | More FE round-trips; race | Acceptable interim |
| **C** | Change `employees.company_id` to LE UUID only | Large migration; out of scope | **REJECT** this wave |

**Recommended: A** (BE enrichment) with FE remove `\|\| 0` (B as interim if BE delayed).

---

## 10. Matrix / BA-trace updates (this wave)

| File | Change |
|------|--------|
| `docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md` | `company` / `/company` rows; AC-CO-EMP-01..06; BR-INT-05 (company UI) · BR-CO-EMP-01..02 |
| `docs/qa/PILOT_BUSINESS_FLOW_BA_TRACE.md` | §20 pointer + J-HRM-CO-01 |

---

## 11. Out of scope

- U65 seed to manufacture counts
- Rewriting UC-HRM-03 full SRS body (AC delta + matrix sufficient for execution)
- Changing partition model slug→UUID
- Reopening AC-EMP-COL label work except shared registry cite

---

## Completion contract

### completion_report

- **Closed:** Spec_gap Company Management headcount — AC-CO-EMP-01..06; BR-INT-05 (UI) + BR-CO-EMP-01..02; matrix + BA-trace; prior load-only QA marked insufficient.
- **Residual:** Implementation + QA retest; SA may refine LE UUID↔slug if registry drifts; orphan SQL probe on BE wave.

### next_owner

`pm` → dispatch **dev-be** + **dev-fe** (parallel), then **qa**

### next_dispatch_prompt

```text
Dispatch parallel execution for D-HRM-CO-EMP-COUNT after BA PASS_TO_PM.

(1) Task dev-be — work_item_id: D-HRM-CO-EMP-COUNT-BE-01
entry_criteria: Read docs/qa/evidence/ba-hrm-co-emp-count-01-20260727.md §4–§6; docs/hrm/HRM_MENU_DATA_LINKAGE_MATRIX.md AC-CO-EMP / BR-CO-EMP; registry hrm-operating-unit-registry.ts; ADR GROUP_MEMBER_SLUGS. U65 zero-seed.
exit_criteria: Company Management headcount contract — either enrich XBOS/HRM bridge API with per-ĐVTV employee_count + rollup total matching GET /employees/summary?company_id=main `total`, OR documented BE endpoint FE can call; bridge holding→holding, Visun→logistics, etc.; orphan probe employees.company_id NOT IN GROUP_MEMBER_SLUGS = 0 (or listed with owner). Jest/regression for count by slug. spec_read_ack + CODE-MEMORY APPEND. No seed in evidence.
evidence_path: docs/qa/evidence/dev-be-hrm-co-emp-count-01-20260727.md
ack_status: READY_FOR_QA or PASS_TO_PM with pm_dispatch_hint for FE if FE still open.
forbidden_paths: unrelated modules; do not break AC-EMP-COL LE display names.
must_keep: GROUP_MEMBER_SLUGS five values; scope main rollup; BR-INT-05.

(2) Task dev-fe — work_item_id: D-HRM-CO-EMP-COUNT-FE-01
entry_criteria: Same BA evidence; stop mapGroupMemberUnitsToHrmCompanies employee_count:null → UI || 0; bind HRM counts (BE enrich or parallel summary/per-slug). Card «Tổng nhân viên» + column «Số nhân viên». Fail → «—» not fake 0.
exit_criteria: AC-CO-EMP-01..06 met on /command-center/hrm/company for ceo@xe.vn; F5 keeps numbers; Network shows HRM count 2xx; vitest if applicable. spec_read_ack + CODE-MEMORY APPEND. No apps outside company/tenant-scope bind paths.
evidence_path: docs/qa/evidence/dev-fe-hrm-co-emp-count-01-20260727.md
ack_status: READY_FOR_QA

(3) After both READY_FOR_QA — Task qa — work_item_id: QA-HRM-CO-EMP-COUNT-01
entry_criteria: L0 stack; browser-only U65; AC-CO-EMP-01..06 + J-HRM-CO-01; compare Dashboard tổng vs Company card same session.
exit_criteria: Evidence block with click path, Network 2xx, before/after counts, F5; mark UF-HRM-MENU-15 load-only insufficient unless AC-CO-EMP also PASS; PASS_TO_PM.
evidence_path: docs/qa/evidence/qa-hrm-co-emp-count-01-20260727.md
cấm: seed; PASS on list visibility alone.
```

### evidence_path

`docs/qa/evidence/ba-hrm-co-emp-count-01-20260727.md`

### ack_status

**PASS_TO_PM**
