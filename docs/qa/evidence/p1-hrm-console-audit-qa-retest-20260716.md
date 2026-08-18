# P1-HRM-CONSOLE-AUDIT-QA-RETEST — Employees duplicate-key retest (:8088)

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-HRM-CONSOLE-AUDIT-QA-RETEST` |
| **date** | 2026-07-17 (retest after BE deploy 2026-07-16) |
| **owner** | qa |
| **env** | `http://14.225.217.232:8088` (VPS Dev8088) |
| **persona** | `ceo@xe.vn` / Group CEO · `companyId=main` |
| **click path** | Login (session) → Command Center → HRM → Nhân sự (`/command-center/hrm/employees`) → row click → profile |
| **U65** | zero-seed · browser-only (API probe read-only with session Bearer; no seed) |
| **prior FAIL** | `docs/qa/evidence/p1-hrm-console-audit-20260716.md` |
| **deploy proof** | `docs/qa/evidence/p1-hrm-emp-dup-key-deploy-20260716.md` (commit `e4087ea`) |
| **ack_status** | **PASS_TO_PM** |

---

## Verdict

**PASS** — React duplicate-key on Employees DataTable **cleared** on live `:8088` after BE `ORDER BY created_at DESC, id DESC`. J-HRM-02 list→profile PASS at `company_id=main`.

| Gate | Result |
|------|--------|
| Console / fiber: no duplicate React keys on Employees list | **PASS** (0 colliding UUIDs) |
| Stable rows after F5 | **PASS** (1107 UI / 1107 unique keys) |
| List API id cardinality (`company_id=main`) | **PASS** (1109 rows / 1109 unique / 0 dups) |
| J-HRM-02 list → profile (no 404/409) | **PASS** (`GET …/employees/:id` **200** `HRM-EMP-200`) |
| P1 mount×2 API noise (non-gating) | **Noted** — still ×2–×4, non-erroring |

---

## Environment / session

| Item | Value |
|------|-------|
| Portal URL | `http://14.225.217.232:8088/command-center/hrm/employees` |
| HRM iframe | `http://14.225.217.232:8088/hr/employees?portal=1&tenantId=xevn&companyId=main&…` |
| UI title | «Danh sách nhân viên trong công ty - **1107**» |
| Storage | `hrm_current_company_id=main` |
| FE note | HRM FE **not** recreated in BE-only deploy — retest against currently-served FE (defense dedupe may or may not be live; BE alone sufficient for uniqueness) |

Screenshots (local agent capture):

- List: `p1-hrm-console-audit-qa-retest-list.png`
- Profile (J-HRM-02): `p1-hrm-console-audit-qa-retest-profile.png`

---

## Before → After (P0 duplicate key)

| Metric | Prior audit (FAIL) | This retest |
|--------|--------------------|-------------|
| UI title count | 1107 | **1107** |
| Fiber / row keys collected | 1107 | **1107** |
| Unique React keys | **996** | **1107** |
| IDs with key used >1× | **107** | **0** |
| Extra duplicate rows | **111** | **0** |
| Sample prior dup UUID | `221f23fe-…` (×2) | *(none)* |
| List API rows fetched | 1109 | **1109** |
| List API unique `id` | **998** | **1109** |
| List API ids appearing >1× | **107** | **0** |

### Console duplicate-key still present?

| Question | Answer |
|----------|--------|
| **Duplicate-key still present?** | **N** |
| Injected `console.warn` / `console.error` hooks (iframe) | **0** messages matching `Encountered two children` / `same key` |
| Deterministic fiber proof | **PASS** — `rowCount === uniqueKeys === 1107` after load, after F5, after back-from-profile |

*(Automation cannot surface a native DevTools Console panel screenshot; fiber + API cardinality are the same deterministic SoT used in the FAIL audit.)*

---

## F5 / stability

1. Loaded Employees embed (`companyId=main`) → fiber **1107/1107 unique**.
2. `location.reload()` (F5) → waited for pagination settle → again **1107/1107**, `dupCount=0`.
3. Navigated to profile then back to list → **1107/1107**, title still **1107**.

No duplicated or omitted-row symptom observed relative to unique-key identity (prior wave had same UI count but 107 colliding keys).

---

## J-HRM-02 — list → profile (`company_id=main`)

| Step | Result |
|------|--------|
| Click first DataTable row | Profile opened for **Phạm Đức Hùng** / `HLD-0996` |
| Iframe URL | `http://14.225.217.232:8088/hr/employees/ff16d855-41e4-4390-8381-9ec56262848c` |
| UI | Profile visible; status «Đang làm việc»; **no** 404 / «Không tìm thấy» / Sync ERROR banner |
| `GET /api/hrm/employees/{id}?company_id=main` | **200** `HRM-EMP-200` · `id=ff16d855-41e4-4390-8381-9ec56262848c` · `fullName=Phạm Đức Hùng` |
| Scope storage | `hrm_current_company_id=main` |
| Scope parity | List under `company_id=main` rollup → GET by id with same scope **200** (not 404/409) |

---

## List API cardinality (read-only, session Bearer)

`GET /api/hrm/employees?company_id=main&include_archived=true&page_size=100&page=N`

| Metric | Value |
|--------|-------|
| Pages | 12 (100×11 + 9) |
| HTTP | all **200** `HRM-EMP-200` |
| Rows fetched | **1109** |
| Unique `id` | **1109** |
| Ids appearing >1× | **0** |

UI shows **1107** vs API **1109** (Δ=2) — not a duplicate-key defect; uniqueness holds on both surfaces. Prior FAIL had API **1109** with only **998** unique.

---

## P1 residual noise (non-gating — confirm still non-erroring)

Performance resource timing on parent after Employees session (counts ≥ prior ×2 pattern):

| Signal | Count observed | Gate |
|--------|----------------|------|
| `tenant-scope` | 4 | P1 residual CD-FB-03 / `P1-HRM-PERF-*` — **not FAIL** |
| `kpi-engine` | 4 | same |
| `workflow-engine` | 4 | same |
| `catalog-governance` | 2 | same |
| `employees` | 16 | expected pagination fan-out + retest probes |

No error banners; duplicate mounts remain **noise**, not React key P0.

---

## Classification matrix

| Signal | Verdict | Evidence |
|--------|---------|----------|
| Download React DevTools / i18next Locize | **NOISE — ignore** | Unchanged policy |
| Duplicate React key on Employees DataTable | **CLOSED — PASS** | Fiber 1107/1107; API 1109/1109; 0 console dup-key matches |
| Duplicate API calls (CC mount ×2) | **P1 residual** (open) | Resource timing ×2–×4 — do not block this work item |

---

## Linked work items

| ID | Status after this retest |
|----|--------------------------|
| `P1-HRM-EMP-DUP-KEY-BE` | **Verified live** on `:8088` (deploy `e4087ea`) |
| `P1-HRM-EMP-DUP-KEY-FE` | Defense-in-depth optional; **not required** for PASS (BE uniqueness alone clears console key collisions) |
| `P1-HRM-PERF-*` / CD-FB-03 | **Still open** P1 residual (mount ×2 APIs) |

---

## Residual / not promoted

- **None for P0 duplicate-key.** Offending UUID list: *(empty)*.
- P1: CC parent duplicate mount APIs — track under existing perf backlog; **do not** re-open `P1-HRM-EMP-DUP-KEY-BE` for that.

---

## Handoff

```text
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/p1-hrm-console-audit-qa-retest-20260716.md
next_owner: pm
pm_dispatch_hint: Close P1-HRM-CONSOLE-AUDIT / P1-HRM-EMP-DUP-KEY-BE on bus; optional QC spot-check; keep P1-HRM-PERF mount×2 as separate residual
```
