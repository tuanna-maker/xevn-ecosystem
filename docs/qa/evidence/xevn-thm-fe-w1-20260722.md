# XEVN-THM-FE-W1 — Portal chrome + CC settings remaster (batch 1)

| Field | Value |
|-------|--------|
| **work_item_id** | `XEVN-THM-FE-W1` |
| **Date** | 2026-07-22 |
| **Owner** | Dev-FE |
| **Program** | `P1-XEVN-THEME-REMASTER` FE-W1 (portal) |
| **spec_ref** | `XEVN_THEME_SCREEN_INVENTORY.md` §1 FE-W1 P0 · `ADR-XEVN-THEME-SHARP-OPS-20260722` · proposal §4.1 |
| **Locks** | L-CONTRAST · L-TYPE · L-OPS |
| **ack_status** | `READY_FOR_QA` |
| **next_owner** | `qa` |

---

## 1. Verdict

Portal FE-W1 P0 chrome/settings remaster **PASS** for exit criteria. TopHeader mark+wordmark live; CC rail/settings pale debt cleared on portal; contrast baseline **62 → 16** (residual = HRM only → `XEVN-THM-FE-W1-HRM`). **Not** claiming full program remaster DONE.

---

## 2. Exit criteria map

| # | Criterion | Evidence |
|---|-----------|----------|
| 1 | TopHeader mark 40 + wordmark «XeVN»; sticky glass thin | `TopHeader.tsx` — `data-testid=portal-brand-mark`; `h-14` `bg-xevn-surface/80 backdrop-blur-md` |
| 2 | CC chrome/settings P0 batch | Module rail disabled contrast; `settings-form-pattern` captions; CommandCenterPage + Apply/Catalog/RACI/WF/Asset panels; HRM embed shell sidebar/workspace labels |
| 3 | Replace `text-slate-400` / `text-gray-400` / `text-slate-300` on touched portal files | Portal ops files **0** pale hits; placeholders → `placeholder:text-xevn-textMuted` |
| 4 | Lower `verify:xevn:theme-contrast` baseline | hitCount **62 → 16**; baseline work_item `XEVN-THM-FE-W1` |
| 5 | Ops-first density | No stats strip in header; UnifiedShell mark+2 CTA; no purple avatar gradient |
| 6 | This evidence | `docs/qa/evidence/xevn-thm-fe-w1-20260722.md` |

---

## 3. Screens remastered (inventory)

| screen_id | Change |
|-----------|--------|
| **WP-SHELL-HEADER** | Mark 40 + wordmark; membership/profile; tokens |
| **WP-SHELL-UNIFIED** | XeVN mark; sharp type; demote prototype fluff |
| **WP-CC-RAIL** | Disabled → `text-xevn-textMuted`; idle caption → textSecondary |
| **WP-CC-HOME / SET-*** | Pale ban cleared on CommandCenterPage + settings pattern + P0 panels |
| **WP-HRM-EMBED** (portal shell) | HrmSidebar section labels; workspace pay labels → textSecondary |
| **WP-SHELL-SIDEBAR** | Dark rail inactive → `text-white/55` (not pale slate on dark) |
| **WP-COCKPIT / dashboard settings** | Pale debt cleared (supporting FE-W1 portal scope) |

**Deferred (forbidden this Task):** `apps/web/hrm/**` → **XEVN-THM-FE-W1-HRM**.

---

## 4. Files touched (key)

| Path | Change |
|------|--------|
| `apps/web/web-portal/src/components/layout/TopHeader.tsx` | Remaster + CODE-MEMORY |
| `apps/web/web-portal/src/pages/unified/UnifiedShellPage.tsx` | Mark + tokens |
| `apps/web/web-portal/src/pages/command-center/CommandCenterPage.tsx` | Pale → xevn |
| `apps/web/web-portal/src/pages/command-center/CommandCenterModuleRail.tsx` | Disabled contrast |
| `apps/web/web-portal/src/pages/command-center/settings-form-pattern.tsx` | Caption + placeholder tokens |
| `…/ApplyCatalogToMembersPanel.tsx`, `CatalogGovernancePanel.tsx`, `CompanyRaciPanel.tsx`, `WorkflowCanvas.tsx`, `WorkflowTaskDetailDrawer.tsx`, `AssetRequestPanel.tsx` | Pale → xevn |
| `apps/web/web-portal/src/modules/hrm/HrmSidebar.tsx`, `HrmWorkspacePanel.tsx` | Labels secondary |
| `Sidebar.tsx` + dashboard/settings pale batch | Debt reduction |
| `scripts/verify-xevn-theme-contrast.mjs` | Baseline metadata FE-W1 |
| `docs/qa/evidence/xevn-theme-contrast-baseline.json` | hitCount 16 |

---

## 5. Commands run

```bash
pnpm run verify:xevn:theme-contrast
# → PASS (debt 16 ≤ baseline 16)

node scripts/verify-xevn-theme-contrast.mjs --write-baseline
# → hitCount=16 (was 62)
```

---

## 6. QA browser checklist (U65 · zero-seed)

1. Login `ceo@xe.vn` / `Xevn@2026` → Command Center.
2. **WP-SHELL-HEADER:** mark 40 + «XeVN» visible without sidebar; brand test PASS.
3. Membership switcher / profile readable (`#4B5563`+); no purple avatar.
4. CC module rail: selected primary; disabled muted but not AI-pale body.
5. Open settings P0 sample (`company_member_units` / workflow / permission): table labels not `slate-400`.
6. Gate: `pnpm run verify:xevn:theme-contrast` exit 0.
7. Do **not** FAIL this wave for remaining HRM `apps/web/hrm` pale hits (next work_item).

---

## 7. Residual

| ID | Owner | Note |
|----|-------|------|
| **XEVN-THM-FE-W1-HRM** | dev-fe | 16 pale hits in `apps/web/hrm/**` only |
| Full inventory rows | — | FE-W1 35 rows: P1/P2 density polish continues; this wave = P0 chrome + pale gate drop |
| `--strict` | program DoD | After FE-W1-HRM + remaining |

---

## 8. Handoff

```
ack_status: READY_FOR_QA
next_owner: qa
evidence_path: docs/qa/evidence/xevn-thm-fe-w1-20260722.md
pm_dispatch_hint: After QA spot PASS → XEVN-THM-FE-W1-HRM (HRM pale debt 16)
```
