# PO-HRM-UI-BRAND-W3-EMP-A — Employees list + create/import + profile shell remaster

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-UI-BRAND-W3-EMP-A` |
| **from_role** | `dev-fe` |
| **to_role** | `qa` |
| **Date** | 2026-08-05 |
| **ADR** | `docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md` §8–§10 |
| **Inventory** | `docs/program/HRM_UI_BRAND_SCREEN_INVENTORY.md` W3-EMP-A · E01–E08, E10–E11, E28 |
| **Foundation** | `docs/qa/evidence/po-hrm-ui-brand-fe-foundation-01.md` (+ FE-FOUND-01) QA PASS |
| **change_mode** | `UPGRADE` · preserve_default · stub honesty · Employees not CLOSED invent |
| **ack_status** | **READY_FOR_QA** |
| **Prior** | RE-DISPATCH after stall `e47da2ea` n=1 |

---

## spec_read_ack

| Artifact | Cite |
|----------|------|
| **ADR** | `ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md` §8 pale ban · §9 dual-surface iframe · §10 ops-dense modal |
| **Inventory** | E01 list · E02 search · E03 status filter · E04 dept filter · E05 pagination · E06 company col · E07 add/edit form · E08 Excel import · E10 profile shell · E11 Thông tin chung · E28 list→detail scope |
| **Program** | `HRM_UI_BRAND_REMASTER_PROGRAM.md` W3 FE-EMP slice A |
| **Skill** | `xevn-precision-motion-theme` — body `#111827` · secondary `#4B5563` · muted placeholder/icon only |
| **must_keep** | SoftDel archive path · `navigate(/employees/:id)` · CORE-04 OCR OUT · PROP-03e QR SKIP · stub honesty StatsCards · no Nest/seed · no Employees CLOSED invent |

---

## Surfaces remastered (11)

| surface_id | Path(s) | Change summary |
|------------|---------|----------------|
| E01 | `Employees.tsx` + `PageHeader.tsx` | List shell Card `border-xevn-border` / `bg-xevn-surface`; PageHeader title/subtitle sharp |
| E02 | Employees search Input | Icon `text-xevn-textMuted`; input `text-[15px] text-xevn-text` |
| E03 | Status Select filter | Kept Select chrome; filter labels inherit sharp PageHeader/card |
| E04 | Department Select filter | Same ops card row as E03 |
| E05 | Pagination footer | Range + page nums `text-xevn-text` / secondary |
| E06 | Company column | `text-sm text-xevn-text` via `resolveEmployeeCompanyColumnLabel` |
| E07 | `EmployeeFormDialog.tsx` + `form.tsx` | Dialog brand bar (shared); sticky CTA `xevn-dialog-footer-sticky`; FormLabel → `text-xevn-text`; FormDescription → secondary |
| E08 | `EmployeeImportDialog.tsx` | Template/upload/preview/progress → xevn tokens; instructions on light ops surface (no blue glass) |
| E10 | `EmployeeProfile.tsx` shell | Header/title/tabs; tab icon chrome **no indigo/purple/violet** → primary/cyan/DNA |
| E11 | Profile general + `InfoItem` + `EmployeeStatsCards` + `EmployeeWorkTimeline` | Labels secondary; skills legend xevn primary/success/accent; stats/timeline sharp; overtime chip cyan |
| E28 | List→detail | **Verified keep:** `navigate(/employees/${id})` + `getEmployeeById` main-first scope retry (U19); no navigate rewrite |

**CORE-04 OCR OUT:** no OCR dialog invent.  
**PROP-03e QR SKIP:** `EmployeeQRCard` / attendance QR not touched.  
**Stub honesty:** `EmployeeStatsCards` default demo numbers remain display chrome — not claimed LIVE API.

---

## CODE-MEMORY

APPEND / refresh `@CODE-MEMORY` / `@CODE-MEMORY-CHANGE` `PO-HRM-UI-BRAND-W3-EMP-A` on:

- `pages/Employees.tsx`
- `pages/EmployeeProfile.tsx`
- `components/employee/EmployeeFormDialog.tsx`
- `components/employee/EmployeeImportDialog.tsx`
- `components/employee/EmployeeStatsCards.tsx`
- `components/employee/EmployeeWorkTimeline.tsx`
- `components/common/PageHeader.tsx`
- `components/ui/form.tsx`

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

Pale grep on EMP-A paths (`Employees` / `EmployeeProfile` / Form / Import / StatsCards / WorkTimeline / PageHeader): **0** `text-muted-foreground` · **0** indigo/purple/violet tab chrome.

---

## Wire preservation (spot)

| Wire | Status |
|------|--------|
| SoftDel ⋯→Xóa→AlertDialog→archive | kept |
| Row click / Xem → `/employees/:id` | kept (E28) |
| `getEmployeeById` multi-scope retry | kept |
| Form catalogs dept/position + manager picker | kept |
| Import preview→commit + spreadsheetScope gate | kept |
| Profile tab groups + pin localStorage | kept |
| CORE-04 OCR / PROP-03e QR | OUT / SKIP |

---

## Screenshots

Browser capture deferred to QA (U65 FE path). Recommended:

1. HRM Nhân sự list — sharp subtitle + search + company col + pagination
2. Thêm NV Dialog — thin primary bar + FormLabel `#111827` + sticky CTA
3. Nhập Excel — instructions on xevn surface; no pale helper copy
4. Profile shell → Thông tin chung — tab chrome primary (not purple); InfoItem labels secondary

---

## Residual

| ID | Item | Owner |
|----|------|-------|
| R1 | Browser U65 smoke E01→E08→E10→E11 (stack may be down this seat) | **QA** |
| R2 | W3-EMP-B (E09 export + lifecycle tabs E12–E17…) | **PM → dev-fe** after EMP-A QA |
| R3 | StatsCards demo numbers → real API (out of brand wave) | defer product / BE |
| R4 | Open Q §3 B1–B5 blank — A1–A5 interim | Sponsor / SA |

---

## Handoff

```yaml
work_item_id: PO-HRM-UI-BRAND-W3-EMP-A
from_role: dev-fe
to_role: qa
ack_status: READY_FOR_QA
evidence_path: docs/qa/evidence/po-hrm-ui-brand-w3-emp-a.md
completion_report: |
  W3-EMP-A: remastered E01–E08, E10–E11, E28 chrome to Precision Motion
  (ADR §8–§10). Shared PageHeader + FormLabel sharpened. Import/Form/Profile
  stats+timeline pale→xevn; no purple tab legend. theme-contrast soft+strict
  exit 0. OCR OUT · QR SKIP · SoftDel + list→detail navigate kept. No Nest/seed.
next_owner: qa
next_dispatch_prompt: |
  Task qa work_item_id=PO-HRM-UI-BRAND-W3-EMP-A-QA
  entry: L0 stack up; U65 zero-seed; foundation QA PASS; ADR §8–§10
  checks:
    1) pnpm run verify:xevn:theme-contrast -- --strict exit 0
    2) ceo@xe.vn → HRM Nhân sự list — sharp title/subtitle/search/company/pagination (E01–E06)
    3) Thêm NV Dialog — thin primary bar + sharp FormLabel; SoftDel path still reachable
    4) Nhập Excel — instructions readable; no pale muted body (E08)
    5) Row → profile shell + Thông tin chung — primary tab chrome (not purple); InfoItem secondary (E10–E11, E28)
  exit: evidence docs/qa/evidence/po-hrm-ui-brand-w3-emp-a-qa.md · PASS_TO_PM
  cấm: seed · OCR invent · QR invent · claim Employees CLOSED · Nest
pm_dispatch_hint: After EMP-A-QA PASS → W3-EMP-B (E09,E12–E17,E19,E25–E27) or QC wave if PORT/ATT QA also PASS
```

### next_dispatch_prompt (copy-ready)

```text
Task qa work_item_id=PO-HRM-UI-BRAND-W3-EMP-A-QA
role: qa · U65 browser-only · zero-seed
read_first: docs/qa/evidence/po-hrm-ui-brand-w3-emp-a.md · ADR-20260805 §8–§10 · inventory W3-EMP-A
entry: L0 portal+hrm; foundation theme gate green
checks:
  1) pnpm run verify:xevn:theme-contrast -- --strict exit 0
  2) ceo@xe.vn → HRM → Nhân sự list (E01–E06) sharp text / company col / pagination
  3) Thêm NV Dialog brand bar + FormLabel sharp; SoftDel ⋯→Xóa still opens AlertDialog
  4) Nhập Excel (E08) instructions on light ops surface — no pale body
  5) List row → /employees/:id (E28) → Thông tin chung (E10–E11) — primary tab chips, secondary InfoItem labels
exit: docs/qa/evidence/po-hrm-ui-brand-w3-emp-a-qa.md · PASS_TO_PM
cấm: seed · OCR invent · QR invent · Employees CLOSED invent
```
