# D-FE-U72-LEAVE-NOTE-HYGIENE-01 — Leave note `seed:…` display hygiene

| Field | Value |
|-------|--------|
| **work_item_id** | `D-FE-U72-LEAVE-NOTE-HYGIENE-01` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **execution_date** | `2026-07-27` |
| **slice** | Close QC residual **C-U72-LEAVE-NOTE-HYGIENE** (ENV leave note residue) |
| **qc_source** | `docs/qa/evidence/qc-u72-soft-p2-01-r2-20260727.md` § C-U72-LEAVE-NOTE-HYGIENE |
| **ack_status** | **READY_FOR_QA** |
| **U65** | zero-seed · no seed in delivery |
| **HOLD_DEPLOY** | YES — local only · **NOT** Phase1 / PROD / `:8088` |

---

## 1. spec_read_ack

| Artifact | Cite |
|----------|------|
| QC residual | `qc-u72-soft-p2-01-r2-20260727.md` — note field may show legacy `seed:…`; **not** leave-type FAIL; hygiene only |
| QA runtime | `_tmp-qa-hrm-u72-leave-visible-runtime.json` — `reason: "seed:p1-hrm-h16-leave-density"` |
| Soft leave CLOSED | **C-U72-LEAVE-P3** kept — unknown leave type → `—` (no reopen) |
| must_keep | C-XBOS-U72-P2 · F-09/F-10/U02 · U65 |

**change_mode:** ADD (display hygiene only)

---

## 2. What changed

| Path | Change |
|------|--------|
| `apps/web/hrm/src/lib/labelMaps.ts` | ADD `sanitizeLeaveNoteDisplay` — trim; empty→`''`; starts with `seed:` (case-insensitive)→`—`; else keep text. CODE-MEMORY APPEND |
| `apps/web/hrm/src/lib/labelMaps.test.ts` | Unit: seed mask + business note keep + empty |
| `apps/web/hrm/src/components/attendance/LeaveTab.tsx` | Wire reason (calendar / table / pending / detail) + rejected_reason detail through sanitizer; form inputs **untouched**. CODE-MEMORY APPEND |

**Not changed:** leave-type maps · soft P2 CLOSED maps · create payload · seed scripts · PROD/:8088

---

## 3. AC (hygiene)

| AC | Expect | Unit |
|----|--------|------|
| **AC-LEAVE-NOTE-SEED** | `seed:p1-hrm-h16-leave-density` → `—` | PASS |
| **AC-LEAVE-NOTE-BUSINESS** | `Nghỉ khám bệnh` unchanged | PASS |
| **AC-LEAVE-NOTE-EMPTY** | null/'' → empty (no forced — on blank) | PASS |
| **AC-LEAVE-P3-KEPT** | `resolveLeaveTypeDisplayLabel` unknown→`—` untouched | PASS (suite) |

---

## 4. Verify commands

```text
pnpm exec vitest run src/lib/labelMaps.test.ts
→ Test Files  1 passed · Tests  21 passed · EXIT=0
```

cwd: `apps/web/hrm`

---

## 5. Residual

| Item | Note |
|------|------|
| Browser retest leave reason column / detail | QA — J-HRM-06 · assert no visible `seed:` |
| Soft CLOSED maps | **Do not reopen** |
| HOLD_DEPLOY / NOT Phase1/PROD/:8088 | Stands |

---

## completion_report

**Closed:** User-facing leave reason/note no longer renders raw `seed:…` markers; mask to `—`. Unit 21 PASS. LeaveTab display wired. Soft leave-type / XBOS soft maps **not** touched.

**Residual:** QA browser smoke on leave list+detail (U65, no seed).

### next_owner

`qa`

### next_dispatch_prompt

```text
work_item_id: QA-U72-LEAVE-NOTE-HYGIENE-01
from_role: pm
to_role: qa
lane: execution · browser + unit confirm C-U72-LEAVE-NOTE-HYGIENE
entry_criteria:
  - FE READY_FOR_QA: docs/qa/evidence/d-fe-u72-leave-note-hygiene-01-20260727.md
  - U65 zero-seed · local :5173 / HRM leave · persona ceo@xe.vn
  - must_keep: C-U72-LEAVE-P3 · C-XBOS-U72-P2 · F-09/F-10/U02 — no reopen
exit_criteria:
  1) Leave list/calendar/detail: no visible raw `seed:` in lý do/ghi chú; seed residue shows «—» or omitted
  2) Leave type still VI / unknown→— (C-U72-LEAVE-P3 kept)
  3) Evidence docs/qa/evidence/qa-u72-leave-note-hygiene-01-20260727.md · READY_FOR_QC or PASS_TO_PM
  4) HOLD_DEPLOY · NOT Phase1/PROD/:8088
cấm: seed · wipe soft CLOSED maps · Phase1/PROD/:8088
```

### evidence_path

`docs/qa/evidence/d-fe-u72-leave-note-hygiene-01-20260727.md`

### ack_status

**READY_FOR_QA**

### pm_dispatch_hint

`QA-U72-LEAVE-NOTE-HYGIENE-01` — browser leave note no `seed:` · keep soft CLOSED
