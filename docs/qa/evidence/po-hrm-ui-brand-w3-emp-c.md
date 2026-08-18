# PO-HRM-UI-BRAND-W3-EMP-C — Nested profile tabs remaster (E18, E20–E24)

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-W3-EMP-C` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **Date** | 2026-08-05 |
| **ADR** | `docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md` §8–§10 |
| **Inventory** | `docs/program/HRM_UI_BRAND_SCREEN_INVENTORY.md` W3-EMP-C · E18, E20–E24 |
| **Prior** | EMP-B QA PASS · `docs/qa/evidence/po-hrm-ui-brand-w3-emp-b-qa.md` |
| **RE-DISPATCH** | prior `8ac226cc` stalled n=1 · evidence MISS → this seat completes remaster + evidence |
| **Coordinate** | `dialog.tsx` DialogTitle floor **≥20px CLOSED** — not modified; consumers inherit |
| **change_mode** | `UPGRADE` · preserve_default · stub honesty · Employees not CLOSED invent |
| **ack_status** | **READY_FOR_QA** |

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| **ADR** | `ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md` §8 pale ban · §9 dual-surface iframe · §10 ops-dense modal |
| **Inventory** | E18 Việc làm (Job honesty PARTIAL) · E20 Tài sản · E21 KPI · E22 CV/bằng/CC/kỹ năng · E23 Khen thưởng/kỷ luật · E24 Gia đình |
| **Program** | `HRM_UI_BRAND_REMASTER_PROGRAM.md` W3 FE-EMP slice C |
| **Skill** | `xevn-precision-motion-theme` — body `#111827` · secondary `#4B5563` · muted placeholder/icon only |
| **must_keep** | SoftDel archive · `navigate(/employees/:id)` · stub honesty · CORE-04 OCR OUT · no QR invent · no Nest/seed · no Employees CLOSED invent · Dialog title ≥20 inherit |

---

## Surfaces remastered (6 inventory · 10 files)

| surface_id | Path(s) | Change summary |
|------------|---------|----------------|
| E18 | `EmployeeJobList.tsx` + `EmployeeJobProgressChart.tsx` | Honesty banner `data-testid=emp-job-honesty`; ops-dense KPI cards; DNA chart hex (`#1E40AF` / `#10B981` / `#EF4444`); priority boxes ops-dense; **fake Math.random trend removed** → `emp-job-trend-honesty` stub |
| E20 | `EmployeeAssets.tsx` | Category/KPI chrome blue/purple/pastel → xevn DNA; labels secondary; no slate-800/yellow-400 invent |
| E21 | `EmployeeKPI.tsx` | Pastel amber/emerald/blue-indigo/purple-violet gradients → ops-dense `border-xevn-border bg-xevn-surface`; icons DNA |
| E22 | `EmployeeResume.tsx` · `EmployeeDegrees.tsx` · `EmployeeCertificates.tsx` · `EmployeeSkills.tsx` | Purple/blue/rose/emerald/amber icons → xevn; skills soft `bg-yellow-500` → `bg-xevn-warning`; labels secondary |
| E23 | `EmployeeRewardsDiscipline.tsx` | KPI cards ops-dense; reward/discipline type chrome DNA; dark red/yellow invent cleaned |
| E24 | `EmployeeFamilyInfo.tsx` | Labels/empty → textSecondary; CODE-MEMORY APPEND |

**CORE-04 OCR OUT:** no OCR dialog invent.  
**PROP-03e QR SKIP:** not touched.  
**Stub honesty:** Job API + local fallback banner; trend chart honesty (no fake series); SoftDel + navigate preserved.  
**Dialog R1:** `components/ui/dialog.tsx` **not modified** this seat.

---

## CODE-MEMORY

APPEND / refresh `@CODE-MEMORY` / `@CODE-MEMORY-CHANGE` `PO-HRM-UI-BRAND-W3-EMP-C` · ADR-20260805 on:

- `components/employee/EmployeeJobList.tsx`
- `components/employee/EmployeeJobProgressChart.tsx`
- `components/employee/EmployeeAssets.tsx`
- `components/employee/EmployeeKPI.tsx`
- `components/employee/EmployeeResume.tsx`
- `components/employee/EmployeeDegrees.tsx`
- `components/employee/EmployeeCertificates.tsx`
- `components/employee/EmployeeSkills.tsx`
- `components/employee/EmployeeRewardsDiscipline.tsx`
- `components/employee/EmployeeFamilyInfo.tsx`

**Not touched:** `components/ui/dialog.tsx` (title floor CLOSED) · SoftDel AlertDialog in `Employees.tsx` (EMP-B CLOSED) · Nest / seed.

---

## Verify

```text
> pnpm run verify:xevn:theme-contrast
[xevn-theme-contrast] token lockstep PASS — primary #1E40AF · text #111827 · secondary #4B5563 · muted-fg OK (portal+HRM+TW)
[xevn-theme-contrast] scanned 598 files; pale hits=0 files=0
[xevn-theme-contrast] PASS (debt 0 ≤ baseline 0; use --strict for W3 DoD)
exit 0

> pnpm run verify:xevn:theme-contrast -- --strict
[xevn-theme-contrast] STRICT PASS — 0 pale hits
exit 0
```

Pale/purple grep on EMP-C paths: **0** `text-muted-foreground` · **0** `purple-|indigo-|violet-|from-blue-|bg-yellow-500|text-rose-|Math.random` runtime (comment-only mentions of Math.random in honesty CODE-MEMORY).

---

## Wire preservation (spot)

| Wire | Status |
|------|--------|
| SoftDel ⋯→Xóa→AlertDialog→archive (Employees list) | kept (outside slice) |
| Row click / Xem → `navigate(/employees/${id})` | kept |
| Job list `useTasks` + createTask · local fallback on fail | kept + honesty banner |
| Assets / KPI / Rewards / Family / Degrees / Certificates / Skills API hooks | kept (chrome only) |
| Resume upload + gender/job_title label maps | kept |
| CORE-04 OCR / PROP-03e QR | OUT / SKIP |

---

## Screenshots

Browser capture deferred to QA (U65 FE path). Recommended:

1. Profile → Việc làm — honesty banner + ops-dense stats; trend honesty (no fake months) (E18)
2. Tài sản — DNA category chips; secondary labels (E20)
3. KPI — ops-dense cards, no pastel/purple gradients (E21)
4. CV / Bằng / CC / Kỹ năng — primary icons; soft skill warning token (E22)
5. Khen thưởng / kỷ luật — ops-dense KPI (E23)
6. Gia đình — sharp empty/table labels (E24)
7. SoftDel still reachable from list; list→detail navigate still works

---

## Residual

| ID | Item | Owner |
|----|------|-------|
| R1 | Browser U65 smoke E18, E20–E24 | **QA** |
| R2 | Job trend history API (replace honesty stub when Nest exists) | defer BE / product — not invent this wave |
| R3 | Open Q §3 B1–B5 blank — A1–A5 interim | Sponsor / SA |
| R4 | Remaster program DONE / Employees CLOSED | **forbidden** this wave |

---

## Handoff

```yaml
work_item_id: PO-HRM-UI-BRAND-W3-EMP-C
from_role: dev-fe
to_role: qa
ack_status: READY_FOR_QA
evidence_path: docs/qa/evidence/po-hrm-ui-brand-w3-emp-c.md
completion_report: |
  RE-DISPATCH close: remastered E18, E20–E24 nested profile tabs to Precision
  Motion (ADR §8–§10). KPI pastel gradients → ops-dense; Job honesty banner +
  trend stub (no Math.random invent); Assets/Rewards/CV/Skills/Family DNA
  chrome. theme-contrast soft+strict exit 0. SoftDel + navigate kept.
  dialog.tsx not touched. No Nest/seed. Not remaster DONE / Employees CLOSED.
next_owner: qa
next_dispatch_prompt: |
  Task qa work_item_id=PO-HRM-UI-BRAND-W3-EMP-C-QA
  entry: L0 stack up; U65 zero-seed; EMP-B QA PASS; ADR §8–§10
  checks:
    1) pnpm run verify:xevn:theme-contrast -- --strict exit 0
    2) ceo@xe.vn → list → /employees/:id → Việc làm — honesty banner + no fake trend (E18)
    3) Tài sản / KPI — ops-dense; no purple/pastel AI (E20–E21)
    4) CV / Bằng / CC / Kỹ năng — sharp labels; no purple/rose invent (E22)
    5) Khen thưởng / Gia đình — DNA chrome; secondary labels (E23–E24)
    6) SoftDel path still reachable; Dialog titles inherit ≥20
  exit: evidence docs/qa/evidence/po-hrm-ui-brand-w3-emp-c-qa.md · PASS_TO_PM
  cấm: seed · OCR invent · QR invent · claim Employees CLOSED · Nest · remaster DONE
pm_dispatch_hint: After EMP-C-QA PASS → QC brand GWC when PORT/ATT also PASS; not product GO
```

### next_dispatch_prompt (copy-ready)

```text
Task qa work_item_id=PO-HRM-UI-BRAND-W3-EMP-C-QA
role: qa · U65 browser-only · zero-seed
read_first: docs/qa/evidence/po-hrm-ui-brand-w3-emp-c.md · ADR-20260805 §8–§10 · inventory W3-EMP-C
entry: L0 portal+hrm; EMP-B QA PASS SoftDel 20px; theme foundation green; Dialog title floor CLOSED (do not regress)
checks:
  1) pnpm run verify:xevn:theme-contrast -- --strict exit 0
  2) ceo@xe.vn → HRM → Nhân sự → row → /employees/:id (navigate keep)
  3) Tab Việc làm (E18) — data-testid emp-job-honesty visible; emp-job-trend-honesty (no fake month series); purple/pastel=0
  4) Tab Tài sản (E20) + KPI (E21) — ops-dense cards; no purple/indigo/amber AI gradients
  5) Tabs CV/Bằng/CC/Kỹ năng (E22) — sharp secondary labels; soft skill = warning token not yellow-500 invent
  6) Tabs Khen thưởng (E23) + Gia đình (E24) — DNA chrome; DialogTitle inherit ≥20 on add dialogs
  7) SoftDel ⋯→Xóa still opens AlertDialog (cancel only — no archive mutate required)
exit: docs/qa/evidence/po-hrm-ui-brand-w3-emp-c-qa.md · PASS_TO_PM
cấm: seed · OCR invent · QR invent · Employees CLOSED invent · remaster DONE · regress DialogTitle floor · Nest
```
