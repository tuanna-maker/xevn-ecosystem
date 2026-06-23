# P1-UIUX-FE-FOUNDATION-COMBINED-QC — L3 gate (G-UX-01/02 P0 CC slice)

**work_item_id:** `P1-UIUX-FE-FOUNDATION-COMBINED-QC`  
**Date:** 2026-06-20  
**Role:** qc  
**PORTAL_DEV_URL:** `http://14.225.217.232:8088/`  
**Persona:** `ceo@xe.vn` / `Xevn@2026`  
**QA SoT (combined):**
- Foundation-01: `docs/qa/evidence/p1-uiux-fe-foundation-8088-20260620.md` (QA R1 + R2)
- Foundation-02: `docs/qa/evidence/p1-uiux-fe-foundation-02-8088-20260620.md` (QA retest)
**Baseline audit:** `docs/qa/evidence/p1-uiux-audit-8088-r1-20260620.md`  
**Prior QC:** `docs/qa/evidence/p1-uiux-fe-foundation-01-qc-r2-20260620.md`  
**Spec ref:** `docs/program/PHASE1_UIUX_REAUDIT_SPONSOR_20260620.md` — G-UX-01, G-UX-02, AC-UX-CFM-01, AC-UX-LOD-01

---

## Command table

| Command | Exit | Verdict | Notes |
|---------|------|---------|-------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/qc-p1-uiux-foundation-combined-8088-20260620.md` | 0 | PASS | This file (QC gate artifact) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-uiux-fe-foundation-8088-20260620.md` | 1 | FAIL 3/8 | Process format — substance audited by QC |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-uiux-fe-foundation-02-8088-20260620.md` | 1 | FAIL 3/8 | Process format — substance audited by QC |
| `pnpm run qc:dev-stack` | 0 | PASS | L0 spot — HRM :28001 + XBOS :28002 + portal :5173 |
| `cd apps/web/web-portal && pnpm test` | 0 | PASS | 256/256 (dev-fe handoff both waves) |
| `cd apps/web/web-portal && pnpm build` | 0 | PASS | dev-fe handoff both waves |

**portal_url:** `http://14.225.217.232:8088/` (VPS pilot — sponsor nghiệm thu)

---

## L2.5 J-* journeys

| Journey ID | Account | Click path | Expected | Actual | Verdict |
|------------|---------|------------|----------|--------|---------|
| J-CC-02 | ceo@xe.vn | CC → Đơn vị thành viên → Chỉnh sửa TẬP ĐOÀN → ✓ Lưu cổ đông | POST shareholders 201; Loader2 busy; F5 row persists | QA R2: POST **201**; MutationButton busy; F5 `QA-R2-SH-*` visible | **PASS** |
| J-CC-01 | ceo@xe.vn | Login → `/command-center` | Session + CC shell | Implicit in all QA sessions | **PASS** (context) |

L2.5 **not re-run** for CFM-only delete modals (UX-XBOS-04/05/08/12) — AC is AlertDialog presence + Hủy path per AC-UX-CFM-01.

---

## Classification (ENV vs PRODUCT)

| Class | Item | QC treatment |
|-------|------|--------------|
| **ENV (closed)** | `group-member-units` 403 blocked UX-XBOS-06 R1 | Closed R2 — BE fix (`p1-uiux-foundation-be-403-8088-20260620.md`) + QA 200 |
| **PRODUCT (closed P0 CC)** | G-UX-01 — DEF-UX-8088-01..04 (shareholder single/bulk, legal doc, catalog approve/reject) | **CLOSED** — foundation-01/02 browser `:8088` |
| **PRODUCT (closed P0 CC)** | G-UX-02 — DEF-UX-8088-05..07 (legal save, shareholder submit, catalog approve, WF save) | **CLOSED** — UX-XBOS-03/06/09/11 |
| **PRODUCT (closed P1→upgrade)** | UX-XBOS-12 dept template delete — was native `confirm` | **CLOSED** — `[role=alertdialog]` foundation-02 |
| **PRODUCT (open P1)** | G-UX-03 NAV — settings/HRM transitions >300ms, no skeleton | **OPEN** — audit R1 unchanged |
| **PRODUCT (open P1)** | UX-XBOS-13 Vendors/KPI — native `confirm` PARTIAL + no LOD | **OPEN** — next CC wave |
| **PRODUCT (open P1)** | HRM embed NAV/LOD — UX-HRM-01/09/10 | **OPEN** — `P1-UIUX-FE-HRM-02` |
| **PROCESS** | QA SoT packs 3/8 on foundation-01/02 MD | Non-blocking — substance cross-audited; normalize before next UX QC |

---

## Combined UX matrix audit (foundation-01 + foundation-02)

| UF-ID | gap_id (R1) | Wave | CFM | LOD | QC promote |
|-------|-------------|------|-----|-----|------------|
| UX-XBOS-03 | G-UX-02 P0 | F-02 | N/A | **PASS** — 38 frames `aria-busy` + Loader2; PUT legal entity | **PROMOTED** |
| UX-XBOS-04 | G-UX-01 P0 | F-01 | **PASS** — modal «Xóa cổ đông» Hủy/Xóa | n/a | **PROMOTED** |
| UX-XBOS-05 | G-UX-01 P0 | F-01 | **PASS** — bulk «Xóa cổ đông đã chọn» | n/a | **PROMOTED** |
| UX-XBOS-06 | G-UX-02 P0 | F-01 R2 | n/a | **PASS** — busy + POST 201 + F5 | **PROMOTED** |
| UX-XBOS-08 | G-UX-01 P0 | F-01 | **PASS** — modal «Xóa tài liệu pháp lý» | n/a | **PROMOTED** |
| UX-XBOS-09 | G-UX-01/02 P0 | F-02 | **PASS** — Phê duyệt/Từ chối AlertDialog; `__confirmCalls=0` | **PASS** — MutationButton + inbox 105→104 | **PROMOTED** |
| UX-XBOS-11 | G-UX-02 P0 | F-02 | N/A | **PASS** — 39 frames busy; PUT workflow definition | **PROMOTED** |
| UX-XBOS-12 | G-UX-01 P1→closed | F-02 | **PASS** — `[role=alertdialog]` «Xóa khung phòng/ban»; not native confirm | n/a | **PROMOTED** |

**Not in combined P0 CC scope:** UX-XBOS-07 (upload LOD SKIP), UX-XBOS-01/02/10 (NAV/LOD inbox — G-UX-03), UX-XBOS-13 (vendors).

Screenshots (F-01): `screenshots/p1-uiux-fe-foundation-8088-20260620/ux-xbos-04-confirm-modal.png`, `ux-xbos-08-legal-doc-confirm.png`.

---

## Gap closure summary (P0 CC slice only)

| gap_id | R1 severity | P0 CC scope | Combined status on `:8088` |
|--------|-------------|-------------|------------------------------|
| **G-UX-01** | P0 (CC destructive/status mutate) | UX-XBOS-04,05,08,09 + dept 12 | **CLOSED** (P0 CC); **OPEN P1** UX-XBOS-13 vendors native confirm |
| **G-UX-02** | P0 (CC mutate LOD) | UX-XBOS-03,06,09,11 | **CLOSED** (P0 CC); **OPEN** UX-XBOS-01 inbox drawer LOD (P1 class with NAV) |

---

## QC verdict

**GO WITH CONDITIONS (scoped — G-UX-01 + G-UX-02 P0 Command Center closed on `:8088`)**

### Promoted (closed)

- **G-UX-01 P0 CC:** Confirm-before-mutate on shareholder single/bulk delete, legal doc delete, catalog Phê duyệt/Từ chối, dept template delete — luxury `AlertDialog`; U65 browser-only.
- **G-UX-02 P0 CC:** Loading/disable on legal profile save, shareholder row submit, catalog decision CTAs, workflow save — `MutationButton` + Loader2 verified with Network 2xx.

### Conditions (carry — non-blocking for P0 CC slice)

| ID | Condition | Severity | Owner | Work item |
|----|-----------|----------|-------|-----------|
| **C1** | **G-UX-03 NAV** — CC settings panel swap ~1205ms; HRM list→detail ~2005ms; sidebar tab reload ~5500ms; no loading shell | P1 | dev-fe | `P1-UIUX-FE-HRM-02` / NAV wave |
| **C2** | **Vendors/KPI** UX-XBOS-13 — native `confirm` (PARTIAL CFM) + no delete LOD | P1 | dev-fe | Next CC wave (`P1-UIUX-FE-CC-02` planned) |
| **C3** | **HRM embed** — UX-HRM-01/09/10 NAV FAIL; iframe flash; member scope parity | P1 | dev-fe | `P1-UIUX-FE-HRM-02` |
| **C4** | CFM delete rows 04/05/08/12 — Hủy path proven; full Xóa→DELETE 2xx→F5 optional spot | P2 | qa | Optional holding-form spot |
| **C5** | UX-XBOS-07 upload LOD — not exercised (U65 no file inject) | P2 | qa | When upload UF in scope |
| **C6** | QA SoT pack format 3/8 on foundation MD files | Process | qa | Append command table + J-CC-02 + PORTAL_DEV_URL |

### Remaining P1 program (explicit NOT in this gate)

| Item | Rows | Owner |
|------|------|-------|
| G-UX-03 NAV | UX-XBOS-01,02,10; UX-HRM-01,09,10 | dev-fe |
| Vendors/KPI confirm + LOD | UX-XBOS-13 | dev-fe |
| HRM embed transition shell | UX-HRM-01,09,10; CC iframe | dev-fe |
| G-UX-04 FBK (banner vs toast) | UX-XBOS-03,09,11 | dev-fe (wave 2) |
| G-UX-05 number grouping | CC tables | dev-fe (P2) |

### Explicitly NOT granted

- **NOT** overall UX interaction UAT-ready (audit R1 executive FAIL — NAV class open).
- **NOT** full G-UX-01 program close (vendors P1 partial remains).
- **NOT** full G-UX-02 program close (inbox/HRM LOD-NAV rows open).
- **NOT Phase 1 DONE** — Phase 1 gates / excellence program unchanged.

---

## Matrix update

`docs/qa/UIUX_INTERACTION_AUDIT_MATRIX_8088.md` — gap summary already reflects foundation-01/02 QA PASS; this QC confirms **P0 CC promotion** for G-UX-01/02 scoped slice.

---

## Residual

- Holding form cold-open ~2s hydrate (timing only — QA R2 note).
- UX-XBOS-12 applies to `company_dept_system` template delete; `tenant_departments` row delete is separate path — not in Foundation-02 scope.
- Catalog approve busy window ~500ms — component parity verified on slower paths (03/11).

---

**ack_status:** `PASS_TO_PM`

**completion_report:** L3 QC combined gate — **G-UX-01 + G-UX-02 P0 CC Command Center CLOSED** on `:8088` (8 UX rows promoted); **GO WITH CONDITIONS** with P1 carry G-UX-03 NAV, Vendors/KPI, HRM embed; NOT Phase 1 DONE.

**next_owner:** `pm`

**next_dispatch_prompt:**

```text
work_item_id: P1-UIUX-FE-HRM-02
entry: QC GWC combined foundation — G-UX-01/02 P0 CC closed :8088; audit R1 G-UX-03 NAV + HRM embed still FAIL
exit: dev-fe NAV skeleton + HRM iframe transition shell; QA browser retest UX-HRM-01/09/10 + UX-XBOS-01/02 on :8088
evidence: docs/qa/evidence/p1-uiux-fe-hrm-02-8088-YYYYMMDD.md
spec_ref: PHASE1_UIUX_REAUDIT_SPONSOR_20260620.md G-UX-03; AC-UX-NAV-01
ack_status: READY_FOR_QA
cấm: seed; U65 browser-only
```
