# Evidence — PO-HRM-E2E-LINK-PAY-HIRE-QA-01

| Field | Value |
|-------|-------|
| work_item_id | `PO-HRM-E2E-LINK-PAY-HIRE-QA-01` |
| from_role | qa |
| to_role | pm |
| ack_status | **`FAIL_TO_PM`** |
| verdict | **FAIL** |
| date | 2026-08-06 |
| persona / URL | `ceo@xe.vn` / `Xevn@2026` · `http://127.0.0.1:5173/hr/payroll?portal=1&tenantId=xevn&companyId=main` |
| u65 | zero-seed · browser-only (no seed / no DB mutate) |
| honesty | `payroll_e2e_ready=false` |
| hdsd_align | HRM → **Tiền lương** → overview (1 phiếu UAT-MOB-PILOT) · **Tính lương** dropdown attempted |
| env | portal `:5173` · hrm-api `:28001` · xbos `:28002` · commit `dc930c5` |
| machine evidence | `docs/qa/evidence/_tmp-po-hrm-e2e-link-pay-hire-qa-01-browser.json` |

## L0 stack — PASS

| Service | Status |
|---------|--------|
| hrm-api | 200 |
| xbos-api | 200 |
| portal | 200 |

## UF / Journey (attempted)

| ID | Click path | Result |
|----|------------|--------|
| **UF-HRM-06** / **J-HRM-07** | Login → `/hr/payroll` → observe payslip row `HLD-0001` / Nguyễn Văn An | 🟡 **PARTIAL** — list+F5 only |
| **AC-PAY-HIRE-04** | Lập bảng → Thêm NV → list updates after 2xx | 🔴 **BLOCKED** — `PayrollBatchesTab` not mounted |
| **AC-PAY-HIRE-05** | F5 on payroll surface | 🟢 **PASS** (existing UAT row persists) |
| Enroll / process / 412 | Khóa bảng lương flow | 🔴 **NOT RUN** — no draft-period FE path |

## Acceptance criteria

| AC / Check | Verdict | Notes |
|------------|---------|-------|
| **AC-PAY-HIRE-04** post-2xx FE refresh | **BLOCKED** | No `Lập bảng lương` / `Thêm nhân viên` UI — `Payroll.tsx` renders `PayrollPayslipsApiTab` when `livePayslips.length >= 1` |
| **AC-PAY-HIRE-05** F5 persistence | **PASS** (partial) | Existing payslip `HLD-0001` visible before + after reload; GET payslips 200 |
| Enroll → payslip row (U65 FE) | **BLOCKED** | Zero `POST …/enroll` in browser Network |
| Process + closed sheet | **NOT RUN** | No draft period creatable from FE |
| **HRM-PAY-ATT-412** without closed sheet | **NOT RUN** | Blocked by missing enroll UI |
| Eligibility reasons **BE** | **FAIL** | `GET /payroll/periods/:id/eligibility` → **404** on live `:28001` (route not in running dist) |
| Eligibility reasons **FE** | **FAIL** | No `eligibility` wire in `apps/web/hrm` |
| Dual-SoT (FE = BE amounts) | **PARTIAL** | Existing row shows BE-sourced amounts via payslip list 200; no new enroll to verify post-mutate bind |

## Root causes (deterministic)

### P0 — FE: enroll surface gated off (`R-PAY-HIRE-BATCHES-HIDDEN`)

- `usePayrollPayslips()` returns **1** row (`UAT-MOB-PILOT` / `HLD-0001`).
- `Payroll.tsx` `calc-list`: `livePayslips.length > 0 ? PayrollPayslipsApiTab : PayrollBatchesTab`.
- **PayrollBatchesTab** (where `addRecord` → `POST enroll` lives) **never mounts** — cannot execute U65 enroll/process AC from FE.

### P0 — BE: new routes not on running API (`R-PAY-HIRE-BE-STALE`)

Live probes on `:28001` (same JWT as browser):

| Method | Path | Status | Code |
|--------|------|--------|------|
| GET | `/api/hrm/payroll/periods/{id}/eligibility` | **404** | `HRM-DATA-404` Cannot GET |
| POST | `/api/hrm/payroll/periods/{id}/enroll` | **404** | `HRM-DATA-404` Cannot POST |
| POST | `/api/hrm/payroll/periods/{id}/process` | 409 | `HRM-PAY-003` (legacy route; period already `processed`) |

`pnpm --filter hrm-api build` **FAIL** (unrelated blocker): `recruitment.service.ts:703` TS2322 — dist not refreshed with BE wave code despite unit tests PASS in source.

## Browser evidence (U65)

### UF — existing payslip list + F5

- **Before F5:** Row `HLD-0001` / Nguyễn Văn An visible on `/hr/payroll`.
- **Network:** `GET /api/hrm/payroll/payslips?company_id=main` → **200** `HRM-PAY-200`.
- **F5:** Same row still visible; payslip GET **200** again.
- **Verdict:** 🟢 AC-PAY-HIRE-05 partial (pre-existing data only).

### UF — enroll (blocked)

- **Expected:** Tính lương → Danh sách bảng lương → **Lập bảng lương** → detail → **Thêm nhân viên** → POST enroll 2xx → table row + `employee_count`.
- **Actual:** Overview shows 1 phiếu link; `PayrollBatchesTab` + create/enroll buttons **absent**; **0** enroll/process POST in Network.
- **Verdict:** 🔴 AC-PAY-HIRE-04 **FAIL/BLOCKED**.

## Residuals (PM dispatch)

| ID | Sev | Owner | Action |
|----|-----|-------|--------|
| **R-PAY-HIRE-BATCHES-HIDDEN** | P0 | dev-fe | Always expose batch/enroll UX (decouple from global `livePayslips.length` gate) — e.g. calc-list always includes `PayrollBatchesTab` or add enroll to payslip tab |
| **R-PAY-HIRE-BE-STALE** | P0 | dev-be | Fix `hrm-api` build (recruitment TS2322) + restart `:28001` so eligibility/enroll routes live |
| **R-PAY-HIRE-ELIGIBILITY-FE** | P1 | dev-fe | Wire `GET …/eligibility` + render `reasons[]` when NV not eligible |

## completion_report

- **Closed:** L0 PASS; browser U65 session executed; AC-PAY-HIRE-05 partial PASS on existing payslip F5; full hire→enroll→process matrix **not promotable**.
- **Open:** AC-PAY-HIRE-04 blocked (FE surface); enroll/eligibility/process-expand BE **404 on runtime**; ATT-412 / closed-sheet process not exercisable from FE.
- **Honesty:** `payroll_e2e_ready=false` — unchanged.

## next_owner

`dev-fe` (surface gate) **+** `dev-be` (runtime deploy) — parallel narrow fixes, then QA re-run.

## next_dispatch_prompt

```text
work_item_id: PO-HRM-E2E-LINK-PAY-HIRE-FE-02
from_role: pm
to_role: dev-fe
lane: execution
parent: PO-HRM-E2E-LINK-PAY-HIRE-QA-01
ack_target: READY_FOR_QA

read_first:
- docs/qa/evidence/po-hrm-e2e-link-pay-hire-qa-01.md (R-PAY-HIRE-BATCHES-HIDDEN)
- apps/web/hrm/src/pages/Payroll.tsx calc-list branch
- docs/qa/evidence/po-hrm-e2e-link-pay-hire-fe-01.md

task:
- Fix calc-list so C&B can always reach PayrollBatchesTab (Lập bảng + Thêm NV) even when global payslip count >= 1.
- Wire GET eligibility + display reasons[] for ineligible NV (P1).
- Preserve dual-SoT: no FE net calc authority.

exit: enroll UI reachable with ceo@xe.vn on :5173/:8088

---

work_item_id: PO-HRM-E2E-LINK-PAY-HIRE-BE-02
from_role: pm
to_role: dev-be
lane: execution

read_first:
- docs/qa/evidence/po-hrm-e2e-link-pay-hire-qa-01.md (R-PAY-HIRE-BE-STALE)
- apps/api/hrm-api/src/payroll/payroll.controller.ts

task:
- Unblock `pnpm --filter hrm-api build` (recruitment.service.ts TS2322).
- Restart hrm-api :28001; verify GET eligibility + POST enroll return 200/4xx (not 404).
- Re-run payroll.service.spec.ts.

exit: curl eligibility/enroll not 404 on live stack

---

work_item_id: PO-HRM-E2E-LINK-PAY-HIRE-QA-02
from_role: pm
to_role: qa
entry: FE-02 + BE-02 READY_FOR_QA
exit: re-run AC-PAY-HIRE-04/05 full browser matrix · evidence po-hrm-e2e-link-pay-hire-qa-01.md superseded
```
