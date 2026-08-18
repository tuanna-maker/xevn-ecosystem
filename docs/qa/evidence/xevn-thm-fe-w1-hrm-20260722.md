# XEVN-THM-FE-W1-HRM — HRM web pale contrast remaster

| Field | Value |
|-------|--------|
| **work_item_id** | `XEVN-THM-FE-W1-HRM` |
| **Date** | 2026-07-22 |
| **Owner** | Dev-FE |
| **Program** | `P1-XEVN-THEME-REMASTER` FE-W1-HRM |
| **spec_ref** | `XEVN_THEME_SCREEN_INVENTORY.md` §2 FE-W1-HRM · ADR sharp-ops · proposal §3.1 / L-CONTRAST |
| **Locks** | L-CONTRAST · L-TYPE · L-OPS |
| **ack_status** | `READY_FOR_QA` |
| **next_owner** | `qa` |

---

## 1. Verdict

HRM web pale-ban residual **cleared**: `verify:xevn:theme-contrast` **16 → 0** (STRICT PASS). Neutral status/role badges + OU filter chrome + payslip signature labels use `text-xevn-text|Secondary|Muted`. **Not** claiming full inventory density remaster DONE (P1/P2 rainbow tabs / payroll tutorial cards remain for later polish waves).

---

## 2. Exit criteria map

| # | Criterion | Evidence |
|---|-----------|----------|
| 1 | Replace pale slate/gray on readable HRM text | 9 files / 16 hits → xevn tokens |
| 2 | Ops-first per inventory AC (embed chrome, status badges) | `HrmOperatingUnitFilter` tokens + type ≥14; inactive/pending badges Secondary |
| 3 | Type floors | Payslip signature headers `text-sm`; `.saas-table th` `text-sm` + `text-xevn-textSecondary` |
| 4 | `verify:xevn:theme-contrast` ↓ toward 0 | hitCount **0**; baseline `XEVN-THM-FE-W1-HRM`; `--strict` PASS |
| 5 | No API/business logic | Token/CSS/chrome only |
| 6 | This evidence | `docs/qa/evidence/xevn-thm-fe-w1-hrm-20260722.md` |

---

## 3. Screens / surfaces touched (inventory)

| screen_id | Change |
|-----------|--------|
| **HRM-CO** | Company/members inactive + role badges → xevn |
| **WP-HRM-EMBED** / OU bar | `HrmOperatingUnitFilter` pale separators → textMuted; labels Secondary |
| **HRM-INDEX** | `HrmApiReminders` title Secondary + text-sm |
| **HRM-EMP-PROFILE** (assets) | `other` type chip → xevn |
| **HRM-PAY-PAYMENT** / payslip print | Signature section headers Secondary; hints Muted |
| **HRM-REC** / candidates / interviews / headcount | pending/cancelled/closed/no_show badges → xevn |

**Foundation:** `index.css` — `.saas-table th` type floor; dark `--muted-foreground` 72% (readable on dark shell).

---

## 4. Files touched

| Path | Change |
|------|--------|
| `CompanyManagement.tsx` | inactive badge |
| `CompanyMembersManagement.tsx` | employee/viewer/inactive badges |
| `HrmApiReminders.tsx` | section title |
| `EmployeeAssets.tsx` | other type color |
| `HrmOperatingUnitFilter.tsx` | full chrome tokens + CODE-MEMORY-CHANGE |
| `PayslipPrintDialog.tsx` | signature labels |
| `CandidateEvaluationDialog.tsx` | pending result |
| `HeadcountProposalTab.tsx` | cancelled + closed job badge |
| `InterviewsTab.tsx` | no_show + pending result |
| `index.css` | table th floor + dark muted |
| `scripts/verify-xevn-theme-contrast.mjs` | baseline metadata W1-HRM |
| `docs/qa/evidence/xevn-theme-contrast-baseline.json` | hitCount 0 |

---

## 5. Commands run

```bash
pnpm run verify:xevn:theme-contrast
# → PASS pale hits=0 ≤ baseline 0

pnpm run verify:xevn:theme-contrast -- --strict
# → STRICT PASS — 0 pale hits

node scripts/verify-xevn-theme-contrast.mjs --write-baseline
# → hitCount=0 (was 16)
```

---

## 6. QA browser checklist (U65 · zero-seed)

1. Login `ceo@xe.vn` / `Xevn@2026` → Command Center → HRM embed.
2. **OU bar:** ĐVTV + role chip readable (`#4B5563`+); separator not slate-300 pale.
3. **HRM-CO** members: inactive/viewer badges not gray-400.
4. **Recruitment** interviews/headcount: pending/cancelled/closed badges contrast OK.
5. Optional: open payslip print — signature headers `text-sm` Secondary.
6. Gate: `pnpm run verify:xevn:theme-contrast -- --strict` exit 0.
7. Do **not** FAIL this wave for remaining density clutter (rainbow rec tabs / payroll tutorial cards) — separate polish; pale gate is closed.

---

## 7. Residual

| ID | Owner | Note |
|----|-------|------|
| Inventory density P1/P2 | later FE wave | Rainbow tab icons, payroll step cards — ops-first demote still open |
| `text-muted-foreground` volume | optional | Light-mode var already Secondary; mass class→xevn sweep not required for pale gate |
| MOB-W2 | mobile | Separate work_item |
| Full program DONE | — | **Forbidden** this Task |

---

## 8. Handoff

```
ack_status: READY_FOR_QA
next_owner: qa
evidence_path: docs/qa/evidence/xevn-thm-fe-w1-hrm-20260722.md
pm_dispatch_hint: QA spot WP-HRM-EMBED + HRM-CO/REC badges + verify:xevn:theme-contrast --strict; then MOB-W2 or density polish
```
