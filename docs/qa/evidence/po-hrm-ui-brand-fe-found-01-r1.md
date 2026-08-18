# PO-HRM-UI-BRAND-FE-FOUND-01-R1 — DialogTitle absolute ≥20px floor

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-FE-FOUND-01-R1` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **Date** | 2026-08-05 |
| **Lane** | execution |
| **priority** | P0 |
| **ADR** | `docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md` §7 type floors · §10 modal title |
| **Entry FAIL** | `docs/qa/evidence/po-hrm-ui-brand-fe-found-01-qa.md` §4 — Import DialogTitle **17.5px** / weight 600 |
| **ack_status** | **READY_FOR_QA** |

---

## 1. Root cause

| Fact | Value |
|------|-------|
| HRM `html` font-size | `87.5%` → **14px** (when browser default 16px) |
| Prior `--xevn-type-title-min` | `1.25rem` → **17.5px** |
| Prior DialogTitle | `xevn-type-title text-xl font-bold` — `text-xl` = `1.25rem` = **17.5px** |
| Prior `.xevn-type-title` weight | **600** (won over `font-bold` in cascade) |
| ADR wants | title ≥**20px** absolute · bold ≥**700** · `#111827` |

---

## 2. Fix (narrow)

| Path | Change |
|------|--------|
| `apps/web/hrm/src/index.css` | `--xevn-type-title-min: 20px`; `.xevn-type-title` / `.page-title` → `max(20px, …)` + **font-weight 700** |
| `apps/web/web-portal/src/index.css` | Lockstep same title floor + weight 700 |
| `apps/web/hrm/src/components/ui/dialog.tsx` | DialogTitle: drop `text-xl` → `text-[20px]` + keep `xevn-type-title font-bold text-xevn-text` |

CODE-MEMORY APPEND on all three paths — cite ADR-20260805 + `PO-HRM-UI-BRAND-FE-FOUND-01-R1`.

**must_keep honored:** primary bar `#1E40AF` · pale gate · no Nest/API · no W3 remaster rewrite · no Attendance CLOSED invent.

---

## 3. Computed size under 14px root (expected)

| Property | Expected after fix |
|----------|-------------------|
| `html` | 14px |
| DialogTitle `font-size` | **20px** (`text-[20px]` + `max(20px, var(--xevn-type-title-min))`) |
| DialogTitle `font-weight` | **700** |
| DialogTitle `color` | `#111827` / `rgb(17, 24, 39)` |

Math: absolute `px` floor — **not** rem — so density root cannot collapse title below 20.

---

## 4. Gate

```bash
pnpm run verify:xevn:theme-contrast -- --strict
# exit 0 — token lockstep PASS · STRICT PASS 0 pale hits (scanned 598)
```

---

## 5. Residual / cấm

| Item | Status |
|------|--------|
| Remaster DONE invent | **not claimed** |
| Attendance CLOSED | **not claimed** |
| Seed | **none** |
| W3 seat duplicate | **none** |
| Scope beyond title floor | **none** |

---

## 6. Handoff

```yaml
work_item_id: PO-HRM-UI-BRAND-FE-FOUND-01-R1
from_role: dev-fe
to_role: qa
ack_status: READY_FOR_QA
evidence_path: docs/qa/evidence/po-hrm-ui-brand-fe-found-01-r1.md
completion_report: |
  Fixed DialogTitle / .xevn-type-title absolute ≥20px + font-weight 700 + #111827
  under html 14px ops density (was 17.5px from 1.25rem). HRM+portal lockstep.
  theme-contrast --strict exit 0. Narrow R1 only — bar chrome already PASS.
next_owner: qa
next_dispatch_prompt: |
  work_item_id: PO-HRM-UI-BRAND-FE-FOUND-01-QA
  from_role: pm
  to_role: qa
  lane: execution
  priority: P0
  entry: docs/qa/evidence/po-hrm-ui-brand-fe-found-01-r1.md READY_FOR_QA
  retest: EMP Import dialog «Import nhân viên từ Excel»
    — DialogTitle computed font-size ≥20px, font-weight ≥700, color #111827
    — keep prior PASS: .xevn-dialog-surface + 3px #1E40AF bar
  gate: pnpm run verify:xevn:theme-contrast -- --strict exit 0
  U65: browser-only; zero-seed
  exit: PASS_TO_PM or FAIL_TO_PM with computed px evidence
  cấm: remaster DONE · Attendance CLOSED · seed · reopen W3
```
