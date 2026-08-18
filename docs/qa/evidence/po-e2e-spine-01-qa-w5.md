# Evidence — PO-E2E-SPINE-01-QA-W5 (HP-05 harden + HP-06 payroll blank)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-E2E-SPINE-01-QA-W5` |
| **program** | `PO-E2E-BIZ-SPINE-01` · spine **E2E-SPINE-01** |
| **executor** | qa |
| **date** | 2026-08-03 |
| **env** | local NFD · portal `:5173` · hrm-api `:28001` · xbos-api `:28002` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `companyId=main` |
| **U65** | zero-seed · **no** `pnpm seed:*` · **no** invent hire/payroll rows |
| **prior** | W4-R1 `PASS_TO_PM` · cand stamp `SP4SDEKW49` hired · empId `5c3ea407-02cb-4cfa-a36c-9ada56908010` (UAT-0020) |
| **harness** | `scripts/qa/po-e2e-spine-01-qa-w5-browser.mjs` |
| **raw** | `docs/qa/evidence/_tmp-po-e2e-spine-01-qa-w5-browser.json` |
| **screens** | `docs/qa/evidence/screens/po-e2e-spine-01-qa-w5-20260803/` |
| **test_log** | `docs/qa/evidence/po-e2e-spine-01-qa-w5-test-log.md` + `.json` |
| **ack_status** | **FAIL_TO_PM** |

## spec_read_ack

- program: `PO_E2E_BUSINESS_SPINE_PROGRAM.md` § E2E-SPINE-01 · HP-05 / HP-06
- BA: `docs/qa/evidence/po-e2e-ba-case-matrix-01.md` HP-05 · HP-06
- journeys: **J-HRM-01** · **J-HRM-02** · **J-HRM-03** · **J-HRM-07**
- UF: UF-HRM-01/02/03 · UF-HRM-06 · FR-UC-H01 · FR-UC-H04
- hdsd_align (U76): HDSD Nhân viên (list/hồ sơ/tab Hợp đồng/tab Lương) · menu Hợp đồng · CC **Tiền lương** `/command-center/hrm/payroll`
- U65 · U78 · anti-idle
- **must_keep:** Leave / LV-03/04 · AUTH / EMP / CAT · HP-03/04 — **not** reopened (Approve UX GWC CLOSED)

## hdsd_inventory (this wave)

| HDSD | Control | Executed |
|------|---------|----------|
| Nhân viên · list | `/hr/employees` · search | 🟢 list 47 rows · search `5c3ea407` (no row by UUID — soft-link code `UAT-0020`) |
| Nhân viên · hồ sơ | deep-link `/hr/employees/{id}` | 🟢 GET **200** · UAT NV 0020 / UAT-0020 · no Sync ERROR |
| Nhân viên · tab Hợp đồng | click tab | 🟡 click observed · UI remained Thông tin chung; **Loại hợp đồng=`--`** |
| Menu Hợp đồng | `/hr/contracts` | 🔴 Vite **500** `Contracts.tsx` · blank pane · pageError dynamic import |
| CC Tiền lương | `/command-center/hrm/payroll` | 🔴 menu selected · **main pane blank** · no honest empty copy |
| Hồ sơ · tab Lương & Phụ cấp | emp profile tab | 🟢 honest empty «Chưa có dữ liệu lương» + subcopy (profile path only) |

## 0. L0

| Probe | Result |
|-------|--------|
| `GET :28001/api/hrm` | **200** |
| `GET :28002/api/xbos` | **200** |
| Portal `:5173` | **200** |
| `GET :5173/hr/src/pages/Contracts.tsx` | **500** |
| `GET :5173/hr/src/pages/Payroll.tsx` | **500** |

## 1. Browser HP-05 / HP-06 (12 clicks · idle_guard PASS · seed=false)

| Step | Case | Verdict | Evidence |
|------|------|---------|----------|
| **L0** | stack | 🟢 | hrm+xbos+portal 200 |
| **HP05_LIST** | NV list + search | 🟢 | `/hr/employees` · 47 NV · stamp `SP4SDEKW49` **absent** (expected soft-link) · UAT-0020 visible on list |
| **HP05_DETAIL** | open emp `5c3ea407` · J-HRM-02 | 🟢 | deep-link · GET `/api/hrm/employees/5c3ea407-…?company_id=main` **200** · profile UAT-0020 · no 404/409 |
| **HP05_HD** | contract / HĐ | 🔴 | profile Loại HĐ=`--` · `/hr/contracts` **whitescreen** · Vite `Contracts.tsx` **500** · **no** J-HRM-01 name→profile from contracts table |
| **HP06_CC** | CC payroll blank residual | 🔴 | `/command-center/hrm/payroll` · Tiền lương active · **blank content pane** · F5 still blank · `Payroll.tsx` Vite **500** |
| **HP06_EMP_TAB** | hồ sơ Lương | 🟢 honesty only | «Chưa có dữ liệu lương» — **does not** close CC blank residual |

### Click path (executed)

1. Inject portal auth `ceo@xe.vn` → `:5173`
2. `/hr/employees` → search `5c3ea407` → list miss UUID → deep-link emp id
3. Profile assert UAT-0020 · attempt tab **Hợp đồng**
4. `/hr/contracts` → observe blank + console 500
5. `/command-center/hrm/payroll` → blank pane → F5
6. emp profile → tab **Lương & Phụ cấp** → honest empty

### Network (key)

| Call | Status | Note |
|------|--------|------|
| `GET …/employees?company_id=main` | **200** | list |
| `GET …/employees/5c3ea407-02cb-4cfa-a36c-9ada56908010?company_id=main` | **200** | detail · scope OK |
| `GET …/payroll/payslips?company_id=main` | **200** | fired from emp Lương tab — not CC content mount |
| Vite `…/pages/Contracts.tsx` | **500** | blocks HĐ module |
| Vite `…/pages/Payroll.tsx` | **500** | blocks `/hr/payroll` embed; CC pane blank class |

### Soft-link / product_gap (honest)

Hire W4-R1 linked **existing** emp UAT-0020 (`employee_id=5c3ea407-…`). Candidate stamp `SP4SDEKW49` **not** expected on emp list/detail — **not** a hire regression. Residual for HP-05 harden is **HĐ surface** (Vite Contracts 500 + Loại HĐ `--`), not missing stamp.

## 2. Verdict matrix

| Gate | Result |
|------|--------|
| L0 stack | 🟢 PASS |
| HP-03/04 prior closed | 🟢 not reopened |
| HP-05 NV open / J-HRM-02 | 🟢 PASS (soft-link) |
| HP-05 HĐ / J-HRM-01/03 | 🔴 FAIL — Contracts.tsx 500 + Loại HĐ empty |
| HP-06 CC payroll blank | 🔴 FAIL — residual **OPEN** |
| HP-06 emp tab honest empty | 🟢 profile-only (not residual close) |
| Seed | 🟢 none |
| idle_guard | 🟢 12 clicks (≥6) |
| Leave / LV-03/04 / Approve UX | 🟢 **not** reopened |
| Phase1 / UAT DONE claim | 🟢 **not** claimed |

**Overall:** `FAIL_TO_PM` — harness auto-🟢 on HP-06 was **overridden by screenshot audit** (CC blank + Vite 500). Emp-tab honest empty ≠ CC residual CLOSED.

## 3. Residuals

| ID | Sev | Owner | Note |
|----|-----|-------|------|
| **R-PO-SPINE01-PAYROLL-BLANK** | **P1** | **dev-fe** | CC `/command-center/hrm/payroll` blank main pane · no honest empty · Vite `Payroll.tsx` **500** — same class as prior JobTemplatesTab mount |
| **R-PO-SPINE01-CONTRACTS-VITE** | **P1** | **dev-fe** | `/hr/contracts` whitescreen · Vite `Contracts.tsx` **500** — blocks HP-05 HĐ + J-HRM-01 |
| R-PO-SPINE01-HP05-SOFT | P2 | closed→superseded | stamp soft-link **accepted**; harden blocked by Contracts Vite |
| ~~R-PO-SPINE01-CAND-HIRE~~ | — | — | CLOSED W4-R1 — not reopened |
| must_keep | — | — | Leave / AUTH / EMP / CAT · HP-03/04 · LV-03/04 CLOSED |

## 4. Handoff

```
ack_status: FAIL_TO_PM
next_owner: pm → dev-fe
evidence_path: docs/qa/evidence/po-e2e-spine-01-qa-w5.md
test_log: docs/qa/evidence/po-e2e-spine-01-qa-w5-test-log.md + .json
```

### completion_report

- Closed this wave: L0; HP-05 emp deep-link GET **200** for hire-linked `5c3ea407` / UAT-0020; soft-link stamp honesty documented; emp tab Lương honest empty observed; no seed; Leave/Approve UX / HP-03/04 not reopened.
- Open / residual: **R-PO-SPINE01-PAYROLL-BLANK** OPEN (CC blank + Payroll.tsx 500); **R-PO-SPINE01-CONTRACTS-VITE** OPEN (Contracts.tsx 500 · HĐ list unusable · Loại HĐ `--`).
- Not claimed: Phase1 / UAT DONE · HP-06 PASS.

### next_dispatch_prompt

```text
work_item_id: PO-E2E-SPINE-01-FE-VITE-PAY-CON-01
from_role: pm
to_role: dev-fe
lane: execution
priority: P1
entry: docs/qa/evidence/po-e2e-spine-01-qa-w5.md FAIL · Contracts.tsx Vite 500 · Payroll.tsx Vite 500 · CC /command-center/hrm/payroll blank pane
mission: Fix Vite resolve/mount for apps/web/hrm Contracts.tsx + Payroll.tsx (same class as JobTemplatesTab W1/W2); CC Tiền lương must show content or honest empty copy (FR-UC-H04); /hr/contracts must render list/empty (J-HRM-01). U65 no seed. must_keep Leave/LV-03/04 · AUTH/EMP/CAT · HP-03/04 · Approve UX GWC.
exit: READY_FOR_QA · evidence docs/qa/evidence/po-e2e-spine-01-fe-vite-pay-con-01.md · then QA W5-R1 retest HP-05 HĐ + HP-06
cấm: seed · claim Phase1/UAT DONE · reopen leave approve
```
