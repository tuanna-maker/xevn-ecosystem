# PO-HRM-UI-BRAND-W4-REC-A-FIX-01 — Jobs title ≥20 Montserrat (stall#2 CLOSE)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-W4-REC-A-FIX-01` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **Date** | 2026-08-05 |
| **priority** | P0 |
| **stall** | #2 — prior seat died at n=1; this seat EXECUTE + WRITE evidence |
| **change_mode** | `UPGRADE` · preserve_default · code_memory APPEND |
| **ADR** | `ADR-XEVN-PRECISION-MOTION-TOKENS-20260805` **§16** |
| **QA FAIL intake** | `docs/qa/evidence/po-hrm-ui-brand-w4-rec-a-qa.md` · DEF R04 · `_tmp-po-hrm-ui-brand-w4-rec-a-qa-browser-final.json` jobs `fontSize: 17.5px` Source Sans |
| **ack_status** | **READY_FOR_QA** |
| **attendance_closed** | **false** |
| **face_live** | **false** |
| **remaster_program_done** | **false** |
| **ocr_invented** | **false** |
| **seed_used** | **false** (U65) |

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| QA DEF R04 | Jobs h2 «Tin tuyển dụng» computed **17.5px** Source Sans (`text-xl` @ html 14px root) — AC **≥20 Montserrat bold** |
| Root cause | Shell / missing page title used rem `text-xl` → 1.25rem×14px = **17.5px**; harness measures **first `h2` inside** `[data-testid=rec-jobs-tab-precision]` |
| Sibling pattern | `CandidatesTab` / `JobRequisitionsTab` / `InterviewsTab` → `font-display text-[20px] font-bold tracking-tight text-xevn-text` |
| Absolute floor | `index.css` `.xevn-type-title` — `font-size: max(20px, var(--xevn-type-title-min))` + Montserrat |
| Harness | `scripts/qa/_tmp-po-hrm-ui-brand-w4-rec-a-qa.mjs` |
| must_keep | Tab ids · Hire bind · CatalogSearchPicker · ViMoneyInput · WF · **R12/R15 dialog chrome PASS** · Reports S3=A · U65 |
| forbidden | remaster DONE · Face LIVE · Attendance CLOSED · OCR invent · seed · REC-B creep |

---

## 1. Fix summary

| Before (QA FAIL) | After (this seat) |
|------------------|-------------------|
| Jobs title measured **17.5px** / Source Sans 3 / weight 700 | **20px** / Montserrat / weight 700 |
| Shell `text-xl` outside / wrong measure node | Title is **first child `h2`** of `rec-jobs-tab-precision` in `JobPostingsTab` |
| — | Classes: `xevn-type-title font-display text-[20px] font-bold tracking-tight text-xevn-text` |
| `Recruitment.tsx` jobs mount | `<JobPostingsTab />` only — **no** shell `text-xl` h2 |

**Page title markup:**

```tsx
<div className="space-y-4" data-testid="rec-jobs-tab-precision">
  <h2 className="xevn-type-title font-display text-[20px] font-bold tracking-tight text-xevn-text">
    {t('recruitment.jobPostings')}
  </h2>
  …
</div>
```

---

## 2. Files touched

| Path | Change |
|------|--------|
| `apps/web/hrm/src/components/recruitment/JobPostingsTab.tsx` | CODE-MEMORY APPEND FIX-01 · page title h2 + `xevn-type-title` + `font-display text-[20px]` inside `rec-jobs-tab-precision` |
| `apps/web/hrm/src/pages/Recruitment.tsx` | CODE-MEMORY APPEND FIX-01 · jobs tab → `<JobPostingsTab />` only (no shell `text-xl` h2) |

**Not touched (must_keep):** Hire dialog · Job create/edit dialog chrome · CatalogSearchPicker · ViMoneyInput · WF · Reports honesty · other REC tabs · Face · Attendance.

---

## 3. Dev self-check (live probe — U65 zero-seed)

| # | Criteria | Status | Evidence |
|---|----------|--------|----------|
| 1 | Source uses `font-display text-[20px]` (+ `xevn-type-title`), not `text-xl` | **PASS** | `JobPostingsTab.tsx` L517–520 |
| 2 | First `h2` inside `rec-jobs-tab-precision` | **PASS** | probe `inRoot: true` |
| 3 | HRM `:8080` computed ≥20 / 700 / Montserrat | **PASS** | `fs:20px` · `fw:700` · `Montserrat` · `ok:true` |
| 4 | Portal `:5173` `?portal=1&tab=jobs` same | **PASS** | same metrics · `ok:true` |
| 5 | `pnpm run verify:xevn:theme-contrast -- --strict` | **PASS** | exit **0** · 0 pale hits |
| 6 | R12 / R15 dialog paths unchanged | **PASS** | no dialog edits this seat |
| 7 | Evidence WRITE before handoff | **PASS** | this file |

**Probe commands (dev):**

```bash
node scripts/qa/_tmp-po-hrm-ui-brand-w4-rec-a-jobs-probe.mjs
node scripts/qa/_tmp-po-hrm-ui-brand-w4-rec-a-jobs-probe-portal.mjs
```

**Probe snapshot (2026-08-05 this seat):**

- `hrm8080`: `Tin tuyển dụng` · `20px` · `700` · `Montserrat` · classes include `xevn-type-title font-display text-[20px]`
- `portal5173`: identical · `ok:true`

---

## 4. Residual

| Item | Owner |
|------|--------|
| Full harness retest (all tabs + R12/R15 + Reports S3=A) | **qa** |
| Confirm Jobs AC1 no longer sole FAIL | **qa** |

---

## 5. next_dispatch_prompt (copy-ready)

```text
work_item_id: PO-HRM-UI-BRAND-W4-REC-A-FIX-01-QA
from_role: pm
to_role: qa
priority: P0
entry_criteria: FE READY_FOR_QA @ docs/qa/evidence/po-hrm-ui-brand-w4-rec-a-fix.md · U65 zero-seed · browser-only
persona: ceo@xe.vn / Xevn@2026 · company_id=main
read_first:
  - docs/qa/evidence/po-hrm-ui-brand-w4-rec-a-qa.md (prior FAIL AC1 Jobs 17.5px)
  - docs/qa/evidence/po-hrm-ui-brand-w4-rec-a-fix.md (FIX-01 stall#2)
  - docs/qa/evidence/_tmp-po-hrm-ui-brand-w4-rec-a-qa-browser-final.json (prior jobs titleOk:false)
exit_criteria:
  1) Re-run: node scripts/qa/_tmp-po-hrm-ui-brand-w4-rec-a-qa.mjs
  2) Jobs tab title «Tin tuyển dụng» computed ≥20px / 700 / Montserrat (AC1 PASS) — was 17.5px Source Sans
  3) Job create dialog R12 chrome stays PASS (bar 4px · wordmark · glass · title ≥20)
  4) Hire→Employee R15 chrome stays PASS
  5) Reports S3=A honesty stays PASS · theme-contrast --strict exit 0
  6) Other tab titles (Dashboard/YCTD/JD/Candidates/Interviews/Reports) stay PASS
  7) WRITE docs/qa/evidence/po-hrm-ui-brand-w4-rec-a-fix-qa.md · PASS_TO_PM or FAIL_TO_PM
cấm: seed · API invent · claim remaster DONE · Face LIVE · Attendance CLOSED · OCR
```

---

## completion_report

**Closed:** DEF R04 Jobs page title — `JobPostingsTab` first h2 inside `rec-jobs-tab-precision` uses `xevn-type-title font-display text-[20px] font-bold tracking-tight text-xevn-text`; `Recruitment.tsx` jobs mount has no shell `text-xl` h2. Live probe PASS on `:8080` and portal `:5173` (20px / 700 / Montserrat). theme-contrast --strict exit 0.

**Residual:** Full browser harness retest by QA (`scripts/qa/_tmp-po-hrm-ui-brand-w4-rec-a-qa.mjs`).

**ack_status:** READY_FOR_QA  
**next_owner:** qa  
**evidence_path:** `docs/qa/evidence/po-hrm-ui-brand-w4-rec-a-fix.md`
