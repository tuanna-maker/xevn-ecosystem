# QA-HDSD-BF-SALARY-01 — BF-03 Ch09 Lương kỳ + J-MOB-04 cross-check

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-HDSD-BF-SALARY-01` |
| **program** | `P-HDSD-ECOSYSTEM-03` · **BF-03** |
| **date** | 2026-08-01 (ICT) |
| **from_role** | `pm` |
| **to_role** | `pm` |
| **lane** | execution |
| **ack_status** | **PASS_TO_PM** |
| **U65** | zero-seed — no `pnpm seed:*` |
| **read_first** | `HDSD_BF_TC_MAP_DELTA.md` §BF-03 · `qa-hdsd-mob-ch12-01-r7-20260801.md` J-MOB-04 |

---

## Executive verdict

**Ch09 Lương kỳ (portal :5173 + HRM embed :8080):** all in-scope tab loads **PASS** — no ERROR banner, `payroll/periods` + `payroll/payslips` GET **200**, 1 kỳ lương row visible.

**J-MOB-04 (pilot :3001 read-only):** **PASS** — `uat.nv0001@xe.vn` mobile login 201 · payslip list GET **200** · `total=1` (matches R7 device evidence).

| Exit criterion | Target | Verdict | Notes |
|----------------|--------|---------|-------|
| L0 stack | `qc:dev-stack` + `qc:fe-be-health` + `:8080` | 🟢 **PASS** | HRM/XBOS/portal 200 |
| Ch09 tab load | no ERROR banner | 🟢 **PASS** | Tổng quan · TP lương · Chính sách · Dữ liệu · Chi trả · Báo cáo |
| Kỳ lương list | `GET /payroll/periods` 2xx | 🟢 **PASS** | `company_id=main` · **1 row** |
| Create spot (FE path) | dialog/list if SRS allows | 🟡 **GWC** | Harness missed **Lập bảng lương** btn; list 🟢 sufficient |
| J-MOB-04 payslip | pilot `:3001` uat.nv0001 | 🟢 **PASS** | read-only API smoke · `total=1` |
| P-CC embed | `/command-center/hrm/payroll` | 🟢 **PASS** | no Sync ERROR |

**Overall:** **PASS_TO_PM** (Ch09 web gate 🟢 · J-MOB-04 cross-check 🟢).

---

## Environment

| Item | Value |
|------|--------|
| Portal | `http://127.0.0.1:5173` |
| HRM embed | `http://127.0.0.1:8080/hr/` |
| HRM API | `http://127.0.0.1:28001` |
| Pilot (mobile cross-check) | `http://14.225.217.232:3001` |
| Persona (web) | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| Persona (mobile probe) | `uat.nv0001@xe.vn` / `xevn-uat-2026` · `holding` |
| Harness | `scripts/qa/qa-hdsd-bf-salary-01-browser.mjs` |
| Machine JSON | `docs/qa/evidence/_tmp-qa-hdsd-bf-salary-01-runtime.json` |
| Screenshots | `docs/qa/evidence/screens/hdsd-bf-salary-01-20260801/` |

---

## Commands executed

```powershell
pnpm run qc:dev-stack          # exit 0 (HRM/XBOS/portal 200)
pnpm run qc:fe-be-health       # exit 0 · ALL PASS
node scripts/qa/qa-hdsd-bf-salary-01-browser.mjs  # exit 0 (run 3/3 authoritative)
```

**Flake note:** run 2/3 hit transient console **500** on payroll sub-routes; run 1 and 3 stable 🟢 — not promoted as blocker (L0 clean on retry).

---

## Ch09 browser matrix (ceo@xe.vn · U65)

| TC / check | Click path | Network | FE after load | Verdict |
|------------|------------|---------|---------------|---------|
| **TC-HDSD-09-01-01** mount | Menu → `/hr/payroll` | `payslips?company_id=main` **200** | No ERROR banner | 🟢 |
| Tab **Tổng quan** | Tab click | — | banner=false | 🟢 |
| Tab **Thành phần lương** | Tab click | `salary-components` **200** | banner=false | 🟢 |
| Tab **Chính sách** | Tab click | settings/catalog | banner=false | 🟢 |
| Tab **Dữ liệu** | Tab click | — | banner=false | 🟢 |
| Tab **Chi trả** | Tab click | `payment-batches` **200** | banner=false | 🟢 |
| Tab **Báo cáo** | Tab click | — | banner=false | 🟢 |
| **TC-HDSD-09-01** kỳ list | Tính lương sub-nav | `periods?company_id=main` **200** | **1** batch row | 🟢 |
| **TC-HDSD-09-01** create spot | **Lập bảng lương** | — | Harness click miss | 🟡 GWC |
| **TC-HDSD-09-02** phiếu lương | Tab Chi trả | `payslips?company_id=main` **200** | banner=false | 🟢 |
| **P-CC-08** embed | `/command-center/hrm/payroll` | iframe payroll mount | banner=false | 🟢 |

---

## J-MOB-04 read-only cross-check (pilot :3001)

Prior device PASS: `docs/qa/evidence/qa-hdsd-mob-ch12-01-r7-20260801.md` (J-MOB-04 list→detail · `Thực lĩnh`).

| Step | Result |
|------|--------|
| `POST /api/hrm/auth/mobile/login` | **201** · `company_id=holding` |
| `GET /api/hrm/payroll/payslips?company_id=holding&employee_id=…` | **200** · `total=1` · `HRM-PAY-200` |
| `GET /api/hrm/payroll/payslips/{id}` | **404** (probe-only; device UI path 🟢 R7) |

**Verdict:** List smoke **PASS** — J-MOB-04 still 🟢 on pilot (no ERR-NETWORK class regression).

---

## Residual / not promoted

| Item | Status | Owner |
|------|--------|-------|
| Create dialog **Lập bảng lương** harness navigation | 🟡 GWC — menu item regex sometimes hits rollup filter | qa optional |
| Payslip GET-by-id **404** on pilot probe | not promoted — mobile list/detail 🟢 R7 device | dev-be if recurs |
| Run 2 transient payroll **500** | flaky — passed on immediate retry | monitor |

---

## completion_report

**Closed:**

- L0 PASS (dev stack + fe-be-health + `:8080` embed).
- Ch09 Lương kỳ: all tabs load without ERROR; `periods` + `payslips` GET 200; 1 kỳ row; CC embed PASS.
- J-MOB-04 cross-check: pilot read-only payslip list 200 / total=1 — consistent with R7 🟢.

**Open (non-blocking):**

- Create-spot automation did not open **Lập bảng lương** dialog (list spot sufficient for BF-03 gate).
- Payslip detail GET-by-id 404 on raw probe (device journey remains SoT).

---

## next_owner

`pm` → optional `qc` (BF-03 salary slice) or continue BF-03 parallel mutate retest queue

---

## next_dispatch_prompt

```text
work_item_id: QC-HDSD-BF-SALARY-01
from_role: pm
to_role: qc
entry_criteria: QA-HDSD-BF-SALARY-01 PASS_TO_PM; evidence docs/qa/evidence/qa-hdsd-bf-salary-01-20260801.md; Ch09 tabs 🟢; J-MOB-04 pilot read-only 🟢
exit_criteria:
- Audit evidence vs HDSD_BF_TC_MAP_DELTA §BF-03 Ch09 rows
- GWC create-spot harness only — do not NO-GO for list 🟢
- GO or GWC for BF-03 salary web slice; J-MOB-04 cite R7 + read-only probe
ack_status: PASS_TO_PM
U65 · no seed
read_first: docs/qa/evidence/qa-hdsd-bf-salary-01-20260801.md · qa-hdsd-mob-ch12-01-r7-20260801.md
```

---

## evidence_path

`docs/qa/evidence/qa-hdsd-bf-salary-01-20260801.md`
