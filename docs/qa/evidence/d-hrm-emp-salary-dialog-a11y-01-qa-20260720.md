# D-HRM-EMP-SALARY-DIALOG-A11Y-01 — QA evidence (2026-07-20)

| Field | Value |
|-------|--------|
| **work_item_id** | `D-HRM-EMP-SALARY-DIALOG-A11Y-01` |
| **from_role** | qa |
| **to_role** | pm |
| **ack_status** | **FAIL_TO_PM** |
| **persona** | `ceo@xe.vn` (Group CEO, `companyId=main`) |
| **sponsor_lock** | U65 zero-seed · no Phase1/PROD claim |
| **date** | 2026-07-20 |
| **FE evidence** | `docs/qa/evidence/d-hrm-emp-salary-dialog-a11y-01-20260720.md` |
| **screenshot** | `d-hrm-emp-salary-dialog-a11y-01-qa-dialog-open.png` (title «Thêm phụ cấp mới» visible) |

---

## Environment (L0)

| Check | Result |
|-------|--------|
| `pnpm run qc:dev-stack` | HRM `:28001` 200 · XBOS `:28002` 200 · portal `:5173` 200 |
| Seed | **None** (U65) |
| Unit (FE) | `vitest` `hrmDialogPortalA11y` + `employeeSalaryDialogA11y` + `formatDisplayDate` → **13/13 PASS** |

---

## Click path (browser)

1. Session `ceo@xe.vn` → `http://127.0.0.1:5173/command-center/hrm/employees/70275eaa-830c-462c-81fb-03d5823945bc`
2. Embed iframe `?portal=1&tenantId=xevn&companyId=main` — **Hoàng Văn An** `DVU-0005`
3. Tab **Lương & Phụ cấp**
4. Click **Thêm phụ cấp** → dialog portals to **parent** `document.body`
5. Console capture on **iframe** `console.error` / `console.warn` (hooked before click)

---

## Exit criteria

| # | Criterion | Verdict | Evidence |
|---|-----------|---------|----------|
| 1 | iframe console **0×** `DialogContent` requires `DialogTitle` | **FAIL** | After open: **1×** iframe-error (same message as prior R1) |
| 2 | iframe console **0×** Missing `Description` / `aria-describedby` | **FAIL** | After open: **1×** iframe-warn `Missing Description or aria-describedby={undefined}` |
| 3 | Visible title «Thêm phụ cấp mới» | **PASS** | Parent dialog `h2` text + `aria-labelledby=radix-:rg:` → «Thêm phụ cấp mới»; Description text present: «Biểu mẫu thêm phụ cấp mới cho nhân viên.» (`aria-describedby=radix-:rh:`) |
| 4 | must_keep: no `Invalid time` regression | **PASS** | Tab Lương: `Ngày trả` = `—` ×2; `Kỳ lương MM/yyyy — services` visible; 0 console `Invalid time` / `RangeError` |

### Console excerpt (iframe, after Thêm phụ cấp)

```
[iframe-error] `DialogContent` requires a `DialogTitle` for the component to be accessible...
[iframe-warn] Warning: Missing `Description` or `aria-describedby={undefined}` for {DialogContent}.
```

Count: **2** (exit requires **0**).

### Mirror probe (CDP)

| Probe | Result |
|-------|--------|
| `[data-xevn-hrm-dialog-a11y-mirror]` in iframe after auto-open | **0** stubs |
| `doc.getElementById(labelledby/describedby)` after auto-open | **false** / **false** |
| Manual `mirrorPortalDialogA11yIdsForRadixWarnings(dialog)` from **iframe** context | **PASS** — creates both mirrors; ids resolve |
| `getDialogPortalContainer()` from iframe | parent `BODY` (portal path active) |

**Defect class:** wiring timing — `DialogContent` `useLayoutEffect` does not create mirrors before Radix TitleWarning/DescriptionWarning `useEffect`. Pure helper + unit tests OK when attrs already present; live open leaves attrs on parent node but **no iframe mirrors** → false-positive console remains. DialogDescription is in React tree (PASS source + DOM) but Radix still warns due to cross-document `getElementById`.

---

## Residual / escalate

| ID | Severity | Item | Owner |
|----|----------|------|-------|
| R1 | **P2** (exit blocker for this work_item) | Portal a11y mirror not applied at dialog open — still 1× Title + 1× Description console. Fix: ensure mirror runs **after** `aria-labelledby`/`aria-describedby` exist (MutationObserver / rAF retry / read Title+Description ids), before or instead of relying on single `useLayoutEffect` with empty attrs. Re-prove: iframe console 0 warns on Thêm + Sửa phụ cấp. | **dev-fe** |
| R2 | P3 | Prior period_label → Ngày trả `—` polish (unchanged; out of scope) | defer |

**Not claimed:** Phase 1 / PROD DONE. **No seed.**

---

## completion_report

Closed: Browser U65 retest of D-HRM-EMP-SALARY-DIALOG-A11Y-01 — DialogTitle/Description **still warn** (2× iframe); visible title+description OK; Invalid time must_keep **PASS**; vitest 13 PASS; root cause narrowed to mirror effect timing (manual mirror from iframe works). Residual R1 → re-dispatch **dev-fe**. **FAIL_TO_PM**.

**next_owner:** pm → **dev-fe**

**next_dispatch_prompt:**

```text
work_item_id: D-HRM-EMP-SALARY-DIALOG-A11Y-01
from_role: pm
to_role: dev-fe
lane: execution
entry_criteria: QA FAIL docs/qa/evidence/d-hrm-emp-salary-dialog-a11y-01-qa-20260720.md — mirror helper OK, useLayoutEffect wiring fails live
exit_criteria: Fix DialogContent so parent-portal open creates iframe [data-xevn-hrm-dialog-a11y-mirror] for aria-labelledby + aria-describedby BEFORE Radix TitleWarning/DescriptionWarning; browser Thêm phụ cấp (+ optional Sửa) → iframe console 0× DialogTitle/Description warn; must_keep Invalid time untouched; vitest update for timing if needed
cấm: seed · Phase1/PROD · reopen Invalid time
evidence_path: docs/qa/evidence/d-hrm-emp-salary-dialog-a11y-01-fe-r2-20260720.md
```

**ack_status:** FAIL_TO_PM  
**evidence_path:** `docs/qa/evidence/d-hrm-emp-salary-dialog-a11y-01-qa-20260720.md`
