# XEVN-THM-QA-W1-HRM — HRM theme contrast QA (W1-HRM)

| Field | Value |
|-------|--------|
| **work_item_id** | `XEVN-THM-QA-W1-HRM` |
| **Date** | 2026-07-22 |
| **Owner** | QA |
| **from_role** | pm |
| **entry** | `XEVN-THM-FE-W1-HRM` READY_FOR_QA — `docs/qa/evidence/xevn-thm-fe-w1-hrm-20260722.md` |
| **Locks** | U65 zero-seed · L-CONTRAST · do **not** FAIL density rainbow / payroll tutorial residual |
| **Persona** | `ceo@xe.vn` / `Xevn@2026` — portal HRM embed `localhost:5173` |
| **ack_status** | `PASS_TO_PM` |
| **next_owner** | `pm` |

---

## 1. Verdict

**PASS** for W1-HRM pale-contrast exit criteria.  
`verify:xevn:theme-contrast -- --strict` → **exit 0**, **hitCount 0**. Browser spot on fresh HRM Vite: OU filter bar uses `text-xevn-text|Secondary|Muted` (measured `#111827` / `#4B5563` / `#6B7280`), not pale slate. HRM-CO status pills readable; remastered CO/REC badge token classes confirmed in source + live OU chrome on REC. **Not** claiming full theme remaster / density DONE. Rainbow recruitment tabs observed and **waived** this wave (FE residual polish).

---

## 2. Exit criteria map

| # | Criterion | Result | Evidence |
|---|-----------|--------|----------|
| 1 | `pnpm run verify:xevn:theme-contrast -- --strict` exit 0 (hitCount 0) | **PASS** | scanned 715 files; pale hits=0; baseline `hitCount: 0` (`XEVN-THM-FE-W1-HRM`) |
| 2 | Browser: HRM embed OU filter + HRM-CO/REC badges readable (xevn tokens, not pale slate) | **PASS** | CDP computed styles below; screenshots `thm-qa-w1-hrm-ou-fresh.png`, `thm-qa-w1-hrm-rec.png` |
| 3 | Do **not** FAIL density rainbow tabs / payroll tutorial cards | **PASS (waived)** | Rainbow REC tabs visible; explicitly deferred per FE residual — not a FAIL |
| 4 | Evidence this file | **PASS** | `docs/qa/evidence/xevn-thm-qa-w1-hrm-20260722.md` |
| — | U65 zero-seed | **PASS** | No `pnpm seed:*`; login → CC → HRM embed only |
| — | Claim full remaster DONE | **Forbidden / not claimed** | Slice W1-HRM pale gate only |

---

## 3. Gate command

```text
pnpm run verify:xevn:theme-contrast -- --strict
# [xevn-theme-contrast] scanned 715 files; pale hits=0 files=0
# [xevn-theme-contrast] STRICT PASS — 0 pale hits
# exit 0
```

Baseline: `docs/qa/evidence/xevn-theme-contrast-baseline.json` — `work_item_id: XEVN-THM-FE-W1-HRM`, `hitCount: 0`.

---

## 4. Browser spot (U65 · local remaster)

**Env note:** First iframe load hit **stale** HRM Vite (OU still `text-slate-800` / `text-slate-300`). Restarted `vite_react_shadcn_ts` + `web-portal` + `xbos-api`; retested on fresh bundle. **PASS requires fresh Vite** — stale proxy ≠ FE debt.

| Step | Path / action | Observation |
|------|---------------|-------------|
| Login | `http://localhost:5173/login` → `ceo@xe.vn` | Command Center |
| HRM-CO | `/command-center/hrm/company` iframe `/hr/company?portal=1…` | OU compact + company list |
| HRM-REC | `/command-center/hrm/recruitment` | Full OU switcher + REC dashboard |

### 4.1 OU filter (CDP — iframe same-origin)

| Element | class | computed color | Token check |
|---------|-------|----------------|-------------|
| ĐVTV / «Đơn vị thành viên» | `text-xevn-text` | `rgb(17, 24, 39)` ≈ `#111827` | PASS |
| Role chip / «Đang xem» | `text-xevn-textSecondary` | `rgb(75, 85, 99)` ≈ `#4B5563` | PASS |
| Separator `·` | `text-xevn-textMuted` | `rgb(107, 114, 128)` ≈ `#6B7280` | PASS |
| Chrome | `border-xevn-border bg-xevn-background/90` | — | PASS |
| Pale classes `.text-slate-400/.text-gray-400/.text-slate-300` in OU chrome | — | **0 hits** | PASS |

### 4.2 HRM-CO badges

- Live status pills «Đang hiệu lực»: `rgb(21, 128, 61)` on `rgb(220, 252, 231)` — readable (not slate-400).
- Inactive/viewer rows: **0 inactive companies** in this persona slice → no live inactive pill. Source assert: `CompanyManagement` / `CompanyMembersManagement` use `bg-xevn-neutral/15 text-xevn-textSecondary` (no `text-gray-400` / `text-slate-400`).

### 4.3 HRM-REC

- OU bar on REC: same xevn token measurements (label / viewing / role / sep).
- Remastered badge configs (`InterviewsTab` pending/no_show, `HeadcountProposalTab` cancelled/closed): `text-xevn-textSecondary` + `xevn-neutral` — source PASS; no pale-gray-400 in served module.
- **Rainbow density tabs** (Dashboard / YCTD / JD / …): visible — **deferred polish, not FAIL**.

---

## 5. Residual (not promoted)

| ID | Owner | Note |
|----|-------|------|
| Inventory density P1/P2 | FE later | Rainbow REC tabs, payroll tutorial cards |
| MOB-W2 | mobile | Separate work_item |
| Stale Vite risk | DevOps / FE | Orphan portal + down HRM Vite showed pre-remaster slate — restart before UAT demos |
| Full program remaster DONE | — | **Forbidden** |

---

## 6. Handoff

```
work_item_id: XEVN-THM-QA-W1-HRM
from_role: qa
to_role: pm
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/xevn-thm-qa-w1-hrm-20260722.md
completion_report: STRICT contrast 0/0 PASS; OU filter CDP xevn tokens PASS; CO/REC badge remaster corroborated; density rainbow waived; full remaster NOT claimed; U65 no seed.
next_owner: pm
next_dispatch_prompt: |
  work_item_id: XEVN-THM-MOB-W2 (or density polish FE wave if PM prioritizes web)
  from_role: pm
  to_role: dev-mobile | qc
  entry_criteria: XEVN-THM-QA-W1-HRM PASS_TO_PM — docs/qa/evidence/xevn-thm-qa-w1-hrm-20260722.md; pale gate closed (strict 0)
  exit_criteria: Continue theme program per inventory — mobile W2 OR QC sample W1-HRM slice only; cấm claim full remaster DONE; U65.
  note: Optional QC spot-check OU filter on localhost with fresh HRM Vite (stale stack can show slate falsely).
```
