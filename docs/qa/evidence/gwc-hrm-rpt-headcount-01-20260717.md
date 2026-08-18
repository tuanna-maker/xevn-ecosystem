# GWC-HRM-RPT-HEADCOUNT-01 — Reports vs Employees headcount semantics

| Field | Value |
|-------|-------|
| **work_item_id** | `GWC-HRM-RPT-HEADCOUNT-01` |
| **from_role** | `ba-data` |
| **to_role** | `pm` |
| **date** | 2026-07-17 |
| **lane** | governance 0.5d |
| **entry** | QC GWC `docs/qa/evidence/qc-p1-hrm-full-menu-retest-20260717.md` · QA `docs/qa/evidence/p1-hrm-full-menu-qa-retest-resume-20260717.md` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` · Dev8088 |
| **ack_status** | **PASS_TO_PM** |
| **verdict** | **CLOSE BY-DESIGN** — not dev-be defect |

---

## Symptom (QC P2)

| Surface | Observed | API source |
|---------|----------|------------|
| Reports → Biến động NS → «Nhân viên hiện tại» | **1041** | `GET /api/hrm/employees/summary` → `active_count` |
| Nhân sự list subtitle / pagination | **1107** | `GET /api/hrm/employees?page=1…` → `total` |
| Prior bug class (closed) | ~**95** | page-1 `page_size=100` length misuse — **not** this incident |

Screenshot: `docs/qa/evidence/p1-hrm-full-menu-qa-retest-resume-reports-20260717.png`

---

## Root cause (data semantics — not filter bug)

Live summary on Dev8088 (`p1-hrm-full-menu-fix-bundle-deploy-20260717.md`):

```json
{
  "total": 1107,
  "active_count": 1041,
  "inactive_count": 66,
  "archived_count": 0
}
```

**Reconciliation:** `1041 + 66 = 1107` · `archived_count = 0`.

| Term | Meaning | Rows |
|------|---------|------|
| **active_count** | Đang làm việc (`status='active'`, not archived) | 1041 |
| **inactive_count** | Ngừng làm việc nhưng chưa archive (`status='inactive'`, `archived_at IS NULL`) | 66 |
| **total** | All non-archived profiles (active + inactive) | 1107 |
| **archived_count** | Soft-deleted (`archived_at IS NOT NULL`) | 0 |

Reports turnover intentionally displays **active** headcount («Nhân viên hiện tại») via `useReportsData.ts` → `empSummary.active_count` → `buildTurnoverReportFromApi({ totalActiveOverride })`.

Employees list intentionally displays **list pagination total** — default list includes inactive non-archived rows (`employees.service.ts` `buildEmployeeListFilters`: no default `status` filter on embed list).

Dashboard (UC-HRM-20) already shows **both** metrics: «Tổng nhân viên» **1107** + «Đang làm việc» **1041** (`Dashboard.tsx`).

---

## Spec / matrix alignment

| Artifact | Rule |
|----------|------|
| `HRM_MENU_DATA_LINKAGE_MATRIX.md` §1.2 | `N_EMP` = **active** only (fidelity, satellite ratios) |
| `HRM_SEED_CARDINALITY_RULES.md` §3.1 | Seed **N** counts **active**; ~6% inactive pattern in workforce |
| `HRM_DASHBOARD_DATA_QUALITY_RULES.md` | **BR-DQ-HEADCOUNT-01** (this closure) |
| `d-dash-01-employees-summary.spec.ts` | Fixture `total=1107`, `active_count=1041`, `inactive_count=66` |

SRS does not previously spell cross-surface labels — delta captured in BR-DQ-HEADCOUNT-01 (governance, not SRS rewrite).

---

## Delta AC (QA retest when closing GWC)

| AC-ID | Pass criterion |
|-------|----------------|
| **AC-HC-01** | Reports Biến động NS «Nhân viên hiện tại» = `summary.active_count` (**1041** on pilot) |
| **AC-HC-02** | Employees list total = `GET /employees` `total` (**1107** on pilot) |
| **AC-HC-03** | `active_count + inactive_count = total` on summary (±0) |
| **AC-HC-04** | Comparing surfaces: document **66** inactive delta — **not** FAIL as cardinality bug |

**Probe (read-only, U65):**

```http
GET /api/hrm/employees/summary?company_id=main
→ active_count + inactive_count = total

GET /api/hrm/employees?company_id=main&page=1&page_size=50
→ total = summary.total
```

---

## Owner lane adjudication

| Hypothesis | Verdict | Owner |
|------------|---------|-------|
| BE summary filter wrong | **REJECT** | — |
| FE page-1 undercount (~95) | **CLOSED** (prior wave) | dev-fe |
| Intentional active vs total | **ACCEPT** | ba-data BR |
| UX label clarity (optional P2) | **OPEN non-blocking** | dev-fe |

### Optional P2 (not required to close GWC)

1. **Reports overview** — `OverviewReportTab` may show `active_count` under label «Tổng nhân viên»; align label or bind `summary.total`.
2. **Employees subtitle** — append inactive hint e.g. «1107 hồ sơ (1041 đang làm việc)».

---

## Traceability matrix

| Requirement | API | DB predicate | FE | Test |
|-------------|-----|--------------|-----|------|
| BR-DQ-HEADCOUNT-01 / AC-HC-01 | `GET /employees/summary` `active_count` | `status='active' AND archived_at IS NULL` | `TurnoverReportTab` «Nhân viên hiện tại» | VAL-HC-02 · resume QA §7 |
| AC-HC-02 | `GET /employees` `total` | `archived_at IS NULL` | `Employees.tsx` subtitle | VAL-HC-03 · J-HRM-02 resume §6 |
| AC-HC-03 | summary `total` + `active_count` | see above | `Dashboard.tsx` dual tiles | `p1-hrm-menu-dashboard-20260717.md` |
| scope_parity | list + get-by-id | `resolveHrmListScope` | embed deep link | J-HRM-02 PASS |

---

## Handoff packet

- `work_item_id:` `GWC-HRM-RPT-HEADCOUNT-01`
- `from_role:` ba-data
- `to_role:` pm
- `ack_status:` **PASS_TO_PM**
- `evidence_path:` `docs/qa/evidence/gwc-hrm-rpt-headcount-01-20260717.md`
- `completion_report:` |
  Closed GWC P2 headcount gap as **by-design semantics**. Reports «Nhân viên hiện tại» (1041) = `active_count`; Employees list (1107) = non-archived `total` including 66 `inactive`. Identity `1041+66=1107` verified against deploy summary + BE spec. Published **BR-DQ-HEADCOUNT-01** in `HRM_DASHBOARD_DATA_QUALITY_RULES.md` + `N_EMP_TOTAL` note in linkage matrix. **No dev-be dispatch.** Optional P2 dev-fe label polish on Reports overview / Employees subtitle.
- `next_owner:` **pm** (close QC condition) · optional **dev-fe** P2
- `next_dispatch_prompt:` |
  ```text
  work_item_id: GWC-HRM-RPT-HEADCOUNT-01-CLOSE
  from_role: pm
  to_role: qc
  entry_criteria: docs/qa/evidence/gwc-hrm-rpt-headcount-01-20260717.md PASS_TO_PM; BR-DQ-HEADCOUNT-01 in docs/hrm/HRM_DASHBOARD_DATA_QUALITY_RULES.md
  task: Close QC condition GWC-HRM-RPT-HEADCOUNT-01 as BY-DESIGN. Re-run VAL-HC-01..03 on Dev8088 (summary identity + turnover active_count + list total). No dev-be fix required. Mark condition CLOSED in next QC gate unless sponsor requests P2 FE labels.
  exit_criteria: QC note on condition register CLOSED; optional dispatch dev-fe GWC-HRM-RPT-HEADCOUNT-FE-01 only if sponsor wants Employees subtitle breakdown
  ```

  Optional P2 (defer unless sponsor asks):

  ```text
  work_item_id: GWC-HRM-RPT-HEADCOUNT-FE-01
  from_role: pm
  to_role: dev-fe
  entry_criteria: BR-DQ-HEADCOUNT-01 §P2 UX polish; no BE change
  task: (1) Reports OverviewReportTab — bind summary.total for «Tổng nhân viên» OR relabel to «Đang làm việc». (2) Employees list subtitle — show total with optional «(X đang làm việc, Y ngừng)» from summary. Regression: reportsApiAggregator.test.ts + browser spot ceo@xe.vn.
  exit_criteria: READY_FOR_QA; evidence docs/qa/evidence/gwc-hrm-rpt-headcount-fe-01-*.md
  ```
