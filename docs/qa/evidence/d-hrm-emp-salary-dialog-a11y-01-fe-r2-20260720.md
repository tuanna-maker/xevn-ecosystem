# D-HRM-EMP-SALARY-DIALOG-A11Y-01 — FE R2 evidence (2026-07-20)



| Field | Value |

|-------|--------|

| **work_item_id** | `D-HRM-EMP-SALARY-DIALOG-A11Y-01` |

| **from_role** | dev-fe |

| **to_role** | qa |

| **ack_status** | **READY_FOR_QA** |

| **change_mode** | FIX (R2) |

| **sponsor_lock** | U65 zero-seed · no Phase1/PROD · no reopen Invalid time |

| **date** | 2026-07-20 |

| **QA FAIL** | `docs/qa/evidence/d-hrm-emp-salary-dialog-a11y-01-qa-20260720.md` |



---



## Root cause (R2)



QA: manual `mirrorPortalDialogA11yIdsForRadixWarnings(dialog)` from iframe **PASS**; live open → **0** `[data-xevn-hrm-dialog-a11y-mirror]` stubs.



Radix `@radix-ui/react-presence` keeps Content **unmounted** until a **child-only** `send("MOUNT")` re-render. Parent `DialogContent` `useLayoutEffect` ran once with `contentRef.current === null` and **did not re-run** when Presence mounted `ContentImpl` → attrs existed on parent node, but iframe mirrors were never created before `TitleWarning` / `DescriptionWarning` `useEffect`.



---



## Fix (R2)



| File | Change |

|------|--------|

| `apps/web/hrm/src/lib/hrmDialogPortalA11y.ts` | Add `attachPortalDialogA11yMirror` — sync + `MutationObserver` + `queueMicrotask` (before paint / Radix warn `useEffect`) |

| `apps/web/hrm/src/components/ui/dialog.tsx` | Wire attach from **content callback ref** (fires on Presence mount even without parent re-render) |

| tests | Presence-safe attach + MO late-attrs + microtask ordering; source assert callback ref |



**must_keep:** `formatDisplayDate` / Invalid time path **untouched** (vitest still PASS).



---



## Unit evidence



```text

pnpm --filter vite_react_shadcn_ts exec vitest run \

  src/lib/hrmDialogPortalA11y.test.ts \

  src/components/employee/employeeSalaryDialogA11y.test.ts \

  src/lib/formatDisplayDate.test.ts

→ 16/16 PASS

```



---



## QA retest (narrow — browser, U65)



1. Login `ceo@xe.vn` → Command Center HRM employee embed (`companyId=main`)

2. Tab **Lương & Phụ cấp** → **Thêm phụ cấp** (optional: **Sửa phụ cấp**)

3. **Pass when:**

   - iframe console **0×** `DialogContent` requires `DialogTitle`

   - iframe console **0×** Missing `Description` / `aria-describedby`

   - After open: iframe has `[data-xevn-hrm-dialog-a11y-mirror]` for labelledby + describedby (or ids resolve via `getElementById`)

   - Visible title still «Thêm phụ cấp mới»

4. must_keep: payroll table **no** `Invalid time` / `RangeError`



**cấm:** seed · Phase1/PROD claim · reopen Invalid time fix



---



## completion_report



Closed: R2 portal a11y — callback-ref `attachPortalDialogA11yMirror` so Presence mount creates iframe stubs before Radix Title/Description warnings; vitest 16 PASS; Invalid time must_keep untouched. Residual: browser confirm console 0 warns (QA).



**next_owner:** qa



**next_dispatch_prompt:**



```text

work_item_id: D-HRM-EMP-SALARY-DIALOG-A11Y-01

from_role: pm

to_role: qa

lane: execution

entry_criteria: FE R2 READY_FOR_QA; evidence docs/qa/evidence/d-hrm-emp-salary-dialog-a11y-01-fe-r2-20260720.md

exit_criteria: Browser ceo@xe.vn → employee → Lương → Thêm phụ cấp — iframe console 0× DialogTitle/Description warn; [data-xevn-hrm-dialog-a11y-mirror] present (or ids resolve); title visible; no Invalid time regression; U65 no seed

cấm: seed · Phase1/PROD · reopen Invalid time

evidence_path: docs/qa/evidence/d-hrm-emp-salary-dialog-a11y-01-qa-r2-20260720.md

```



**ack_status:** READY_FOR_QA  

**evidence_path:** `docs/qa/evidence/d-hrm-emp-salary-dialog-a11y-01-fe-r2-20260720.md`


