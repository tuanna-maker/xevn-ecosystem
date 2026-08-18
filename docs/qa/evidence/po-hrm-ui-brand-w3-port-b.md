# PO-HRM-UI-BRAND-W3-PORT-B — Portal PORT-09…10 + PORT-A residuals

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-W3-PORT-B` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **Date** | 2026-08-05 |
| **Priority** | P1 |
| **ADR** | `docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md` §8–§10 **Accepted** |
| **Inventory** | `docs/program/HRM_UI_BRAND_SCREEN_INVENTORY.md` PORT-09…PORT-10 + residual |
| **Entry** | PORT-A-QA PASS `docs/qa/evidence/po-hrm-ui-brand-w3-port-a-qa.md` |
| **ack_status** | **READY_FOR_QA** |

---

## 1. spec_read_ack

| Field | Citation |
|-------|----------|
| **srs** | N/A theme remaster — no SRS FR rewrite (program lock) |
| **tech_spec / ADR** | `docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md` **§8** pale-text locks · **§9** dual-surface · **§10** modal ops-dense |
| **db_design** | N/A (chrome/tokens only) |
| **api_design** | N/A (no Nest / contract change) |
| **uc_ids / inventory** | PORT-09 (HRM Index/Dashboard) · PORT-10 (Executive Cockpit `/cockpit`) · residual CC settings tables + AppHeader |
| **change_mode** | `UPGRADE` · `preserve_default: true` |
| **sponsor_confirm** | Chat remaster authorize · FILL UI-1=Có · UI-2=tất cả · ADR Accepted 2026-08-05 |
| **must_keep** | U65 zero-seed · honesty banners (`ApiLoadBanner`, sync stubs) · soft-nav · membership labels · inbox mark-read · EmptyState payroll · no Attendance CLOSED · no Face invent |
| **forbidden_paths** | Nest · Prisma · seed · ATT/EMP business screens · claim full remaster DONE |

**spec says / code does**

| ADR / residual | Code |
|----------------|------|
| §8 sharp text (`#111827` / `#4B5563`) | CC settings `text-slate-500` → `text-xevn-textSecondary`; AppHeader muted → `textMuted`/`textSecondary`; Dashboard labels → `textSecondary` |
| §8 ban purple AI | Cockpit purple KPI/avatar/demo gradient → `xevn-primary` / `#1E40AF`; Dashboard payroll/recruitment quick-actions no purple/indigo |
| §9 dual-surface | Cockpit light `bg-xevn-background`; HRM Index ops-dense (no marketing hero invent) |
| PORT-A-QA P2 | CC settings tables + AppHeader closed in this seat |

---

## 2. Batch PORT-B

| ID | Surface | Path | Remaster |
|----|---------|------|----------|
| PORT-09 | HRM Index / Dashboard | `apps/web/hrm/src/pages/Index.tsx` + `Dashboard.tsx` | CODE-MEMORY · muted→xevn · ban purple/indigo gradients on quick actions · EmptyState/PortalOperationsSummary kept |
| PORT-10 | Executive Cockpit | `apps/web/web-portal/src/pages/dashboard/ExecutiveDashboardPage.tsx` | Token-align chrome/KPI/alerts · purple→primary · `ApiLoadBanner` honesty kept · ModuleCard labels white on dark cards |
| Residual | CC settings tables | `CommandCenterPage.tsx` + `SETTINGS_TABLE_TH_CLASS` in `settings-form-pattern.tsx` | All `text-slate-500` → `text-xevn-textSecondary` |
| Residual | AppHeader | `apps/web/hrm/src/components/layout/AppHeader.tsx` | Icons `textMuted` · labels `textSecondary` · surface/border xevn · membership labels kept |

**Not touched:** Nest · seed · Face · Attendance CLOSED claim · W3-ATT/EMP business remaster paths · full remaster DONE invent.

---

## 3. Verify (reproducible)

```bash
pnpm run verify:xevn:theme-contrast
# → token lockstep PASS; pale hits=0; PASS (debt 0 <= baseline 0); exit 0

pnpm run verify:xevn:theme-contrast -- --strict
# → STRICT PASS — 0 pale hits; exit 0
```

| Mode | Exit | Notes |
|------|------|-------|
| default | **0** | scanned 598 files; pale hits=0 |
| `--strict` | **0** | STRICT PASS |

**Seed:** none (U65).

---

## 4. Residual

| Item | Severity | Owner |
|------|----------|-------|
| Open Questions §3 B1–B5 blank — A1–A5 interim palette | Governance | Sponsor / SA |
| Browser L2.5 visual smoke PORT-09/10 + CC settings table headers | P1 QA | this handoff |
| Cockpit demo metric cards still colorful gradients when demo layout enabled | OBS | token-aligned primary on purple only; demo flag unchanged |
| Parallel W3-ATT-B / EMP seats | Program | other seats |

---

## 5. Handoff

### completion_report

W3-PORT-B closed: remastered PORT-09 (HRM Index/Dashboard) + PORT-10 (Executive Cockpit token-align) and closed PORT-A-QA P2 residuals (CC settings table `slate-500` → `xevn-textSecondary`; AppHeader muted → Precision Motion tokens). CODE-MEMORY APPEND ADR-20260805. `verify:xevn:theme-contrast` + `--strict` exit **0**. Honesty banners / soft-nav / membership labels preserved. No Nest/seed/ATT/EMP screens; remaster program not claimed DONE.

### next_owner

`qa`

### next_dispatch_prompt

```text
work_item_id: PO-HRM-UI-BRAND-W3-PORT-B-QA
from_role: pm
to_role: qa
priority: P1
lane: execution
entry_criteria:
  - FE READY_FOR_QA — docs/qa/evidence/po-hrm-ui-brand-w3-port-b.md
  - ADR docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md §8–§10
  - inventory PORT-09…PORT-10 + residual (CC settings tables · AppHeader)
Browser U65 (zero-seed) — persona ceo@xe.vn / Xevn@2026:
1) PORT-09 HRM home `/` or `/hr/` (standalone or embed) — sharp labels; no purple/indigo quick-action chrome; EmptyState/honesty kept
2) PORT-10 `/cockpit` — light ops canvas; primary `#1E40AF`; ApiLoadBanner honesty visible; no purple KPI/avatar
3) CC settings table headers (Workspace settings panels) — headers use textSecondary sharpness (not slate-500)
4) AppHeader (HRM shell) — muted icons/hints use xevn tokens; membership/company switcher labels readable
5) Re-run: pnpm run verify:xevn:theme-contrast && pnpm run verify:xevn:theme-contrast -- --strict → exit 0
exit_criteria:
  - evidence docs/qa/evidence/po-hrm-ui-brand-w3-port-b-qa.md · click path + URL · PASS_TO_PM
cấm: seed · invent Face · Attendance CLOSED · claim full remaster DONE · Nest
```

### ack_status

**READY_FOR_QA**

### evidence_path

`docs/qa/evidence/po-hrm-ui-brand-w3-port-b.md`
