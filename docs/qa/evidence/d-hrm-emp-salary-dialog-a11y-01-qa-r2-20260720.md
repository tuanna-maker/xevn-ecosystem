# D-HRM-EMP-SALARY-DIALOG-A11Y-01 — QA R2 evidence (2026-07-20)

| Field | Value |
|-------|--------|
| **work_item_id** | `D-HRM-EMP-SALARY-DIALOG-A11Y-01` |
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **PASS_TO_PM** |
| **persona** | `ceo@xe.vn` (Group CEO, `companyId=main`) |
| **sponsor_lock** | U65 zero-seed · no Phase1/PROD claim |
| **date** | 2026-07-20 |
| **FE R2 evidence** | `docs/qa/evidence/d-hrm-emp-salary-dialog-a11y-01-fe-r2-20260720.md` |
| **prior QA FAIL** | `docs/qa/evidence/d-hrm-emp-salary-dialog-a11y-01-qa-20260720.md` |
| **screenshot** | `d-hrm-emp-salary-dialog-a11y-01-qa-r2-dialog-open.png` (title «Thêm phụ cấp mới» visible) |

---

## Environment (L0)

| Check | Result |
|-------|--------|
| `pnpm run qc:dev-stack` | HRM `:28001` 200 · XBOS `:28002` 200 · portal `:5173` 200 |
| Seed | **None** (U65) |
| Unit (FE) | `vitest` `hrmDialogPortalA11y` + `employeeSalaryDialogA11y` + `formatDisplayDate` → **16/16 PASS** |

---

## Click path (browser)

1. Session `ceo@xe.vn` → `http://127.0.0.1:5173/command-center/hrm/employees/70275eaa-830c-462c-81fb-03d5823945bc`
2. Embed iframe `?portal=1&tenantId=xevn&companyId=main` — **Hoàng Văn An** `DVU-0005`
3. Tab **Lương & Phụ cấp**
4. Hook iframe `console.error` / `console.warn` **before** click
5. Click **Thêm phụ cấp** → dialog portals to **parent** `document.body`

---

## Exit criteria

| # | Criterion | Verdict | Evidence |
|---|-----------|---------|----------|
| 1 | iframe console **0×** `DialogContent` requires `DialogTitle` | **PASS** | After open: **0** iframe-error matching DialogTitle |
| 2 | iframe console **0×** Missing `Description` / `aria-describedby` | **PASS** | After open: **0** iframe-warn matching Description |
| 3 | `[data-xevn-hrm-dialog-a11y-mirror]` present (or ids resolve) | **PASS** | **2** mirrors (`radix-:rg:`, `radix-:rh:`); `doc.getElementById` both **true** |
| 4 | Visible title «Thêm phụ cấp mới» | **PASS** | Parent dialog `aria-labelledby=radix-:rg:` → «Thêm phụ cấp mới»; Description «Biểu mẫu thêm phụ cấp mới cho nhân viên.» (`aria-describedby=radix-:rh:`) |
| 5 | must_keep: no `Invalid time` regression | **PASS** | `Ngày trả` = `—` ×2; `Kỳ lương MM/yyyy — services` visible; 0 DOM/console `Invalid time` / `RangeError` |

### Console excerpt (iframe, after Thêm phụ cấp)

```
(empty) — logCount: 0 · titleWarnCount: 0 · descWarnCount: 0
```

Prior FAIL (R1): **2** warns (1× Title + 1× Description). R2 closed.

### Mirror probe (CDP)

| Probe | Result |
|-------|--------|
| `[data-xevn-hrm-dialog-a11y-mirror]` in iframe after open | **2** stubs |
| `doc.getElementById(labelledby/describedby)` after open | **true** / **true** |
| Parent dialog present | **true** |
| Title text | «Thêm phụ cấp mới» |

**Sửa phụ cấp:** not exercised — employee has 0 phụ cấp rows (empty list); create dialog covers same `DialogContent` a11y path.

---

## Residual

| ID | Severity | Item | Owner |
|----|----------|------|-------|
| — | — | None for this work_item exit | — |

**Not claimed:** Phase 1 / PROD DONE. **No seed.** Invalid time primary fix remains closed (must_keep verified).

---

## completion_report

Closed: Browser U65 R2 retest of D-HRM-EMP-SALARY-DIALOG-A11Y-01 after FE callback-ref `attachPortalDialogA11yMirror` — iframe console **0×** DialogTitle/Description; **2** a11y mirrors; title visible; Invalid time must_keep **PASS**; vitest **16/16**. Prior R1 FAIL closed. Recommend QC residual close / waive path for DialogTitle portal (parent GWC conditions if any).

**next_owner:** pm → **qc** (residual close; no Phase1/PROD)

**next_dispatch_prompt:**

```text
work_item_id: D-HRM-EMP-SALARY-DIALOG-A11Y-01
from_role: pm
to_role: qc
lane: governance
entry_criteria: QA R2 PASS docs/qa/evidence/d-hrm-emp-salary-dialog-a11y-01-qa-r2-20260720.md — iframe 0× DialogTitle/Description; mirrors×2; Invalid time must_keep PASS
exit_criteria: QC GO or GWC residual close for Dialog a11y; retain parent Invalid-date GWC product AC CLOSED; forbid Phase1/PROD; U65 no seed
cấm: seed · Phase1/PROD · reopen Invalid time
evidence_path: docs/qa/evidence/d-hrm-emp-salary-dialog-a11y-01-qc-r2-20260720.md
```

**ack_status:** PASS_TO_PM  
**evidence_path:** `docs/qa/evidence/d-hrm-emp-salary-dialog-a11y-01-qa-r2-20260720.md`
