# QA-HRM-MENU-FULL-SWEEP-01-R2 — Retest FAIL rows only (2026-07-20)

| Field | Value |
|-------|--------|
| **work_item_id** | `QA-HRM-MENU-FULL-SWEEP-01-R2` |
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **parent** | `QA-HRM-MENU-FULL-SWEEP-01` FAIL · FE `D-HRM-UI-STRIP-TECH-CHROME-02` READY_FOR_QA |
| **persona** | `ceo@xe.vn` / `Xevn@2026` (Group CEO, `companyId=main`) |
| **sponsor_lock** | U65 zero-seed · browser-only · no Phase1/PROD claim |
| **date** | 2026-07-20 |
| **env** | portal `http://127.0.0.1:5173` · HRM iframe `/hr/*?portal=1` · hrm-api `:28001` · xbos-api `:28002` |
| **evidence_ref_fe** | `docs/qa/evidence/d-hrm-ui-strip-tech-chrome-02-fe-20260720.md` |
| **parent_fail** | `docs/qa/evidence/qa-hrm-menu-full-sweep-01-20260720.md` |

---

## L0 entry

| Check | Result |
|-------|--------|
| `pnpm run qc:dev-stack` | HRM `:28001` 200 · XBOS `:28002` 200 · portal `:5173` 200 |
| `pnpm run qc:fe-be-health` | **ALL PASS** (login + employees + catalog-sync + portal proxy) |
| Seed | **None** (U65) |

---

## Method

1. Session already authenticated as `ceo@xe.vn` on Command Center HRM embed.
2. Soft-nav iframe `src` for each FAIL menu; CDP `iframe.contentDocument` assert visible copy.
3. Employee Lương: deep-link DVU-0005 `70275eaa-830c-462c-81fb-03d5823945bc` → tab **Lương & Phụ cấp**.
4. Settings Danh mục: `/hr/settings` → Radix tab **Danh mục (XBOS + HRM)** + dedicated `/hr/settings-catalogs`.

**Assert patterns (must be absent):** `hrm-api`, badge text `API`, `XBOS-DM-*`, raw ISO-Z (`…T17:00:00.000Z` / `…132Z`), Dashboard `GET /employees` / `operations/reports` / `UC-HRM-*` / `Nest API`.

---

## Retest matrix (FAIL rows only)

| # | Menu / journey | URL | Observed | Verdict |
|---|----------------|-----|----------|---------|
| 1 | Payroll | `/hr/payroll?portal=1…` | Header `1834 / 1834 bản ghi` via `data-testid=payroll-payslips-count`; **0** `hrm-api` in iframe text; no Nest/UC chrome | **PASS** |
| 2 | Employee → Lương | `/hr/employees/70275eaa-…` tab Lương | Badge `data-testid=salary-grade-badge` **absent**; **0** literal `API` nodes; empty phụ cấp copy business VI (no hrm-api); periods `Kỳ lương 05/2026 — services`; net 17.190.000 ₫ | **PASS** |
| 3 | Processes | `/hr/processes?portal=1…` | Notice `data-testid=processes-readonly-notice`: «Thêm/sửa/xóa quy trình chưa hỗ trợ trên HRM. Cấu hình mã quy trình được quản lý tại Command Center.» — **0** `XBOS-DM-*` | **PASS** |
| 4a | Settings → Danh mục | `/hr/settings` tab catalogs | Stamps `governance · Đồng bộ XBOS: 17/07/2026 09:16` (dd/MM/yyyy HH:mm); **0** raw ISO-Z | **PASS** |
| 4b | Settings catalogs page | `/hr/settings-catalogs` | Same stamp format; 76 sync stamps; **0** ISO-Z | **PASS** |
| 5 | Performance | `/hr/performance?portal=1…` | Cycle rows e.g. `01/07/2026 – 30/09/2026 (draft)`; **0** `T17:00:00.000Z` / ISO-Z matches | **PASS** |
| Spot | Dashboard | `/hr/?portal=1…` | Tiles Nhân sự 1108 / Chấm công 13103 / Tuyển dụng 57 / Kỳ lương 80; title «Tổng quan HRM»; **no** GET/ops/UC/Nest/hrm-api chrome | **PASS** |

### Defect closure map

| Residual ID (parent FAIL) | Sev | R2 result |
|---------------------------|-----|-----------|
| `D-HRM-PAYROLL-STRIP-HRM-API-LABEL-01` | P1 | **CLOSED** |
| `D-HRM-EMP-SALARY-GRADE-API-BADGE-01` | P2 | **CLOSED** |
| `D-HRM-PROCESSES-STRIP-XBOS-DM-CODE-01` | P2 | **CLOSED** |
| `D-HRM-SETTINGS-SYNC-ISO-FORMAT-01` | P2 | **CLOSED** |
| `D-HRM-PERF-CYCLE-ISO-DISPLAY-01` | P2 | **CLOSED** |

---

## Residual (out of R2 batch — not blocking PASS)

| Item | Sev | Note |
|------|-----|------|
| Metadata queue workflow id strings (`xbos.employee_metadata.default`) | P3 | From parent sweep; FE batch explicitly deferred |
| Tools & equipment Phase 2 stub copy | — | Expected stub; not reopened |

---

## completion_report

**Closed:** All 5 FAIL rows from `QA-HRM-MENU-FULL-SWEEP-01` retested browser-only under U65 as Group CEO; L0 + fe-be-health PASS; payroll `hrm-api` gone; salaryGrade `API` badge gone; Processes XBOS-DM gone; Settings sync + Performance cycle dates humanized `dd/MM/yyyy` (+ HH:mm for sync); Dashboard tech chrome still absent.

**Open / residual:** P3 metadata workflow ids only (out of chrome-strip batch). No new P0/P1/P2 chrome defects.

**Overall:** **PASS_TO_PM** — ready for `QC-HRM-MENU-FULL-SWEEP-01`. No Phase1/PROD claim.

---

## next_owner

`qc`

## next_dispatch_prompt

```text
work_item_id: QC-HRM-MENU-FULL-SWEEP-01
from_role: pm
to_role: qc
lane: governance
entry_criteria: QA-HRM-MENU-FULL-SWEEP-01-R2 PASS_TO_PM; U65 zero-seed; no Phase1/PROD claim
evidence_ref:
  - docs/qa/evidence/qa-hrm-menu-full-sweep-01-r2-20260720.md
  - docs/qa/evidence/qa-hrm-menu-full-sweep-01-20260720.md (parent FAIL closed)
  - docs/qa/evidence/d-hrm-ui-strip-tech-chrome-02-fe-20260720.md
scope: Audit QA R2 closed the 5 chrome residuals (payroll hrm-api, salary API badge, Processes XBOS-DM, Settings sync stamp, Performance cycle dates) + Dashboard spot no GET/ops/UC/Nest; GO/GWC with residual P3 metadata ids only if any
exit_criteria: QC GO or GO WITH CONDITIONS; evidence_path docs/qa/evidence/qc-hrm-menu-full-sweep-01-20260720.md
cấm: seed · claim Phase1/PROD DONE
```

## ack_status

**PASS_TO_PM**
