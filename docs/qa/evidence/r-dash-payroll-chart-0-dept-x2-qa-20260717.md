# P1-HRM-P2-RESIDUAL-QA-01 — R-DASH-PAYROLL-CHART-0 + R-DEPT-FETCH-X2

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-HRM-P2-RESIDUAL-QA-01` (`R-DASH-PAYROLL-CHART-0` + `R-DEPT-FETCH-X2`) |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **date** | 2026-07-17 |
| **env** | `http://14.225.217.232:8088` |
| **deploy** | FE live `7563c4d` (DevOps evidence) · repo HEAD note `51235ea` |
| **persona** | `ceo@xe.vn` / BOD · `companyId=main` |
| **U65** | zero-seed — browser-only · **no** seed |
| **phase1_done_claim** | **NO** |
| **prod_ready_claim** | **NO** |
| **ack_status** | **PASS_TO_PM** |

---

## Spec / prior evidence

| Item | Path |
|------|------|
| Deploy | `docs/qa/evidence/r-dash-payroll-chart-0-dept-x2-deploy-20260717.md` |
| Dev-FE | `docs/qa/evidence/r-dash-payroll-chart-0-dept-x2-20260717.md` |
| Program GWC | `docs/qa/evidence/qc-p1-hrm-full-menu-close-20260717.md` |
| SRS | UC-HRM-20 ops summary · dashboard payroll charts |

---

## Verdict summary

| Residual | AC | Result |
|----------|----|--------|
| **R-DASH-PAYROLL-CHART-0** | «Tổng hợp lương» no fake 0 VNĐ when no salary aggregate | **🟢 PASS** |
| **UC-HRM-20** Kỳ lương tile | Still OK after chart change | **🟢 PASS** |
| **R-DEPT-FETCH-X2** | Phòng ban rows load; `GET …/departments` **×1** per mount | **🟢 PASS** |
| Optional P3 schema | Note only | **N/A** — not touched |

**Overall:** **PASS_TO_PM** — both P2 residuals **CLOSED** for program GWC follow-up.

---

## 1) R-DASH-PAYROLL-CHART-0 — Dashboard «Tổng hợp lương»

**Path:** Login (session) → `/command-center/hrm/dashboard` · embed `companyId=main`

| Check | Evidence |
|-------|----------|
| Empty notice | `data-testid=dashboard-payroll-chart-empty` **present** (5 chart panels) |
| Copy | «Chưa có dữ liệu lương trên hồ sơ nhân sự — biểu đồ không hiển thị số 0 giả…» + link **Tính lương** |
| Fake 0 in chart section | **None** — section from «Tổng hợp lương» → before «Thống kê nhân sự» has **no** `0 VNĐ` |
| Fake 100% pie | **Absent** |

**UC-HRM-20:**

| Tile | Value observed |
|------|----------------|
| NHÂN SỰ | **1107** (`GET /employees/summary`) |
| CHẤM CÔNG | **13103** (`operations/reports/summary`) |
| KỲ LƯƠNG | **80** |

Screenshots (agent session): `p1-hrm-p2-residual-dashboard-20260717.png`, payroll empty via CDP text audit.

### Note (P3 — not blocking)

Side card **«Quỹ lương tháng này»** still renders `0 VNĐ` via raw `totalPayroll` format (outside chart empty gate). Chart AC for «Tổng hợp lương» is met; optional FE polish to reuse `renderPayrollAmount` / gate — **do not reopen P2** for GWC close.

---

## 2) R-DEPT-FETCH-X2 — Company → Phòng ban

**Path:** `/command-center/hrm/company` → tab **Phòng ban** · `companyId=main`

| Check | Evidence |
|-------|----------|
| Rows | **DEPT_01** Nhân sự · **DEPT_02** Vận hành · **DEPT_03** Kế toán · **DEPT_04** Kinh doanh |
| Network (remount) | `GET /api/hrm/departments?company_id=main` → **200** · **count = 1** |
| Stability | +2s after mount: still **×1** (fetch intercept + `PerformanceResourceTiming`) |
| First mount | iframe resource timings also **×1** for same URL |

Screenshot: `p1-hrm-p2-dept-x1-20260717.png`

**Method:** iframe `fetch` intercept + PerformanceResourceTiming (U65 browser; no seed / no API mutate).

---

## Residual closure vs program GWC

| ID | Status after QA |
|----|-----------------|
| `R-DASH-PAYROLL-CHART-0` | **CLOSED** |
| `R-DEPT-FETCH-X2` | **CLOSED** |
| Quỹ lương side card `0 VNĐ` | **P3 optional** (note only) |
| Tools CRUD / Phase 1 DONE / PROD | **Not claimed** |

---

## Handoff

```yaml
work_item_id: P1-HRM-P2-RESIDUAL-QA-01
from_role: qa
to_role: pm
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/r-dash-payroll-chart-0-dept-x2-qa-20260717.md
completion_report: |
  Browser U65 retest on :8088 (FE 7563c4d): Dashboard «Tổng hợp lương»
  shows honest empty (dashboard-payroll-chart-empty), no fake 0 VNĐ in
  chart section; UC-HRM-20 Kỳ lương=80 OK. Company Phòng ban loads
  DEPT_01..04; GET /api/hrm/departments?company_id=main ×1 per mount
  (not ×2). Both P2 residuals CLOSED for GWC. P3 note only: Quỹ lương
  side card still shows 0 VNĐ. No seed · no Phase1/PROD claim.
next_owner: pm
next_dispatch_prompt: |
  work_item_id: P1-HRM-P2-RESIDUAL-CLOSE-01
  from_role: pm
  to_role: qc
  entry_criteria: QA PASS evidence docs/qa/evidence/r-dash-payroll-chart-0-dept-x2-qa-20260717.md; U65; deploy 7563c4d
  exit_criteria: |
    Light QC: mark R-DASH-PAYROLL-CHART-0 + R-DEPT-FETCH-X2 CLOSED on program GWC;
    optional note Quỹ lương 0 VNĐ as P3; no Phase1 DONE / PROD; no Tools CRUD promotion.
  evidence_path: docs/qa/evidence/qc-p1-hrm-p2-residual-close-20260717.md
  cấm: seed · Phase 1 DONE · PROD · Tools CRUD
```
