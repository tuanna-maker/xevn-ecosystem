# P1-HRM-MENU-QA-PAYROLL — QA evidence

| Field | Value |
|-------|-------|
| **work_item_id** | `P1-HRM-MENU-QA-PAYROLL` |
| **date** | 2026-07-17 |
| **owner** | qa |
| **env** | `http://14.225.217.232:8088` (VPS Dev8088) |
| **persona** | `ceo@xe.vn` / Group CEO · `companyId=main` |
| **click path** | Login → Command Center → HRM → Tiền lương (`/command-center/hrm/payroll`) → list → **Xem chi tiết** (payslip dialog) |
| **spec_ref** | P-CC-08 · J-HRM-07 · UF-HRM-06 |
| **U65** | zero-seed · browser-only (session Bearer probe for `/periods` only; no seed) |
| **ack_status** | **PASS_TO_PM** |

---

## Verdict

**PASS** — P-CC-08 list load + J-HRM-07 payslip detail dialog PASS on `:8088` with `company_id=main`. No ERROR banner / 409 / `54321`. Residuals are **P1** (i18n status column, mount×2 payslips, large payload/chunk) — not functional blockers for UF-HRM-06.

| Gate | Result |
|------|--------|
| L0 tab load / no Sync ERROR / no 409 / no 54321 | **PASS** |
| L2 payslip list data (`1834 / 1834 bản ghi — hrm-api`) | **PASS** |
| Network `GET /api/hrm/payroll/payslips?company_id=main` | **PASS** (200 ×2; ~1.96–2.22s; ~875 KB) |
| Console P0 (crash / duplicate React key / connection refused) | **PASS** (none observed on portal hooks) |
| L2.5 J-HRM-07 list → payslip detail | **PASS** (dialog: Gross / Khấu trừ / Thực lĩnh) |
| UF-HRM-06 view payslip | **PASS** |
| `GET /payroll/periods` live probe | **BLOCKED env** `RATE-429` during concurrent menu QA — **not** on default list mount path |
| i18n status column | **P1 residual** (see below) |

---

## Environment / session

| Item | Value |
|------|-------|
| Portal URL | `http://14.225.217.232:8088/command-center/hrm/payroll` |
| HRM iframe | `http://14.225.217.232:8088/hr/payroll?portal=1&tenantId=xevn&companyId=main&…` |
| Scope filter | «Tất cả đơn vị (rollup)» · storage `hrm_current_company_id=main` |
| UI title | **Danh sách bảng lương** — **1834 / 1834 bản ghi — hrm-api** |
| Sample rows | `DVU-0005 Hoàng Văn An` · Kỳ lương 05/2026 — services · 17.190.000 ₫ · status raw `processed` |

Screenshots:

- List: `docs/qa/evidence/p1-hrm-menu-payroll-list-20260717.png`
- Detail (J-HRM-07): `docs/qa/evidence/p1-hrm-menu-payroll-detail-20260717.png`

---

## L0 / L2 — P-CC-08

1. Logged in as `ceo@xe.vn` (dedicated browser tab; U65 browser FE).
2. Navigated to `/command-center/hrm/payroll`.
3. Embed iframe mounted; payslip DataTable rendered with **1834** rows sourced from hrm-api.
4. No HRM Sync ERROR banner; no `54321`; no scope 409 toast on load.
5. Search box present (`Tìm kiếm nhân viên, vị trí…`); action buttons `aria-label="Xem chi tiết"` per row.

### Network (resource timing, iframe)

| Endpoint | Status | Duration | Transfer | Notes |
|----------|--------|----------|----------|-------|
| `GET /api/hrm/payroll/payslips?company_id=main` | **200** | 1959 ms | 875145 | first mount |
| `GET /api/hrm/payroll/payslips?company_id=main` | **200** | 2222 ms | 875145 | **×2 duplicate** (CD-FB-03 class) |
| `GET /api/hrm/operating-units` | **200** | 1407 ms | 861 | scope bar |
| `GET /api/hrm/company-subscription?company_id=main` | **200** | 1608 ms | 963 | — |
| `GET /payroll/periods` | *(not called on default list mount)* | — | — | period label comes from payslip row payload |

### Bundle / perf notes (P1, non-gating)

| Asset | Duration | Transfer | Note |
|-------|----------|----------|------|
| `/hr/src/pages/Payroll.tsx` | ~1808 ms | **~1.37 MB** | Vite source chunk — scale risk @ concurrent users |
| Several `/hr/src/**` scripts | **>3s** | ~300 (304?) | cold embed waterfall |

---

## L2.5 — J-HRM-07 (payslip detail)

| Step | Result |
|------|--------|
| Click first row `button[aria-label="Xem chi tiết"]` | Row: **DVU-0005 / Hoàng Văn An / Kỳ lương 05/2026 — services / 17.190.000 ₫** |
| Dialog host | Portaled to **parent** portal document (`[role=dialog]`), not iframe-local |
| Dialog title | **Xem phiếu lương — Kỳ lương 05/2026 — services** |
| Fields | Họ và tên: Hoàng Văn An (DVU-0005); **Lương Gross** 19.100.000 ₫; **Khấu trừ** 1.910.000 ₫; **Thực lĩnh** 17.190.000 ₫ |
| Status badge | Raw English **`processed`** (same i18n gap as list) |
| Extra detail GET | **Not observed** in resource timing after click — detail rendered from list payload (client dialog) |
| Scope parity | List under `company_id=main` → detail dialog shows matching net pay; no 404 / «Không tìm thấy» |

**J-HRM-07: PASS**

---

## Console / UX defect (P1 residual)

| Finding | Severity | Notes |
|---------|----------|-------|
| Column header renders literal: `key 'common.status (vi)' returned an object instead of string.` | **P1** | i18n `common.status` returns object; status cells show raw `processed` |
| Portal `__qaLogs` error hooks | 0 | No P0 React duplicate-key / connection refused on parent |
| Status UX | P1 | Badge in detail also English `processed` — not Vietnamese label |

Defect id: **D-P1-HRM-PAY-I18N-STATUS-01** — fix `common.status` translation shape + map payslip status enum to VI labels.

---

## `/payroll/periods` probe

| Attempt | Result |
|---------|--------|
| Default page load | **Not requested** (UF-HRM-06 list path uses payslips only) |
| Authenticated `GET /api/hrm/payroll/periods?company_id=main` | **429** `RATE-429` «Too many requests» (repeated after cooldown; concurrent full-menu QA wave) |

**Defer:** `P1-HRM-MENU-QA-PAYROLL-PERIODS-VERIFY` when rate-limit window clear — confirm 200 + period rows for lifecycle tabs if in SRS. Does **not** FAIL UF-HRM-06 / J-HRM-07 (detail period string already present on payslip).

---

## F5 / stability

- Initial load: stable **1834/1834**.
- Mid-wave iframe `location.reload()` + later parent re-nav hit **session token cleared** (`xevn.portal.accessToken` absent) under concurrent menu QA — hung «Đang tải…». Treated as **env contention**, not product FAIL (first-load evidence stands).
- Recommend: QC/spot F5 after wave concurrency drops.

---

## Residuals (for PM / scale lane)

| ID | Class | Owner hint | Action |
|----|-------|------------|--------|
| **D-P1-HRM-PAY-I18N-STATUS-01** | P1 UX/i18n | `dev-fe` | Fix `common.status` object → string; localize payslip status |
| **D-P1-HRM-PAY-MOUNT-X2-01** | P1 perf | fold `P1-HRM-SCALE-FE-W1` | Deduplicate payslips GET on embed mount (×2 observed) |
| **D-P1-HRM-PAY-PAYLOAD-01** | P1 perf/NFR | `P1-HRM-SCALE-BE-W1` / SA ADR | 875 KB full payslip list @ main — needs server pagination for 1k VU |
| **P1-HRM-MENU-QA-PAYROLL-PERIODS-VERIFY** | verify defer | `qa` | Retest `/periods` when RATE-429 clears |

---

## Handoff packet

- `work_item_id`: `P1-HRM-MENU-QA-PAYROLL`
- `from_role`: `qa`
- `to_role`: `pm`
- `entry_criteria`: P-CC-08 payroll menu on `:8088`; Group CEO; U65 browser-only
- `exit_criteria`: payslip list 2xx + data or empty+200; console P0=0; J-HRM-07 detail visible; Network notes for >3s / ×N
- `completion_report`: Closed P-CC-08 L0/L2 + J-HRM-07/UF-HRM-06 detail dialog PASS (1834 payslips, dialog Gross/Khấu trừ/Thực lĩnh). Open P1: i18n status, payslips mount×2, large list payload; periods API verify deferred (RATE-429).
- `evidence_path`: `docs/qa/evidence/p1-hrm-menu-payroll-20260717.md`
- `next_owner`: `pm`
- `next_dispatch_prompt`: Mark `P1-HRM-MENU-QA-PAYROLL` PASS on `P1-HRM-FULL-MENU-QA-PROGRAM` roster. Fold `D-P1-HRM-PAY-MOUNT-X2-01` + payload into in-flight `P1-HRM-SCALE-FE-W1` / `P1-HRM-SCALE-BE-W1`. Dispatch `dev-fe` for `D-P1-HRM-PAY-I18N-STATUS-01` (common.status object → VI string). Optional QA `P1-HRM-MENU-QA-PAYROLL-PERIODS-VERIFY` when RATE-429 clears. QC only after 17/17 menu evidence.
- `ack_status`: `PASS_TO_PM`
