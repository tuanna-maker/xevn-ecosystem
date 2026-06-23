# P1-UIUX-FE-FOUNDATION-01-QC-R2 — L3 QC gate (G-UX-01 CFM slice)

**work_item_id:** `P1-UIUX-FE-FOUNDATION-01-QC-R2`  
**Date:** 2026-06-20  
**Role:** qc  
**PORTAL_DEV_URL:** `http://14.225.217.232:8088/`  
**Persona:** `ceo@xe.vn` / `Xevn@2026`  
**QA SoT:** `docs/qa/evidence/p1-uiux-fe-foundation-8088-20260620.md` (QA R1 + R2)  
**Baseline:** `docs/qa/evidence/p1-uiux-audit-8088-r1-20260620.md`  
**Spec ref:** `docs/program/PHASE1_UIUX_REAUDIT_SPONSOR_20260620.md` — G-UX-01, AC-UX-CFM-01 (CC shareholder + legal doc slice)

---

## Classification

| Class | Item | QC treatment |
|-------|------|--------------|
| **ENV (closed)** | `group-member-units` 403 blocked UX-XBOS-06 R1 | Closed R2 — BE fix + QA browser 200 (`p1-uiux-foundation-be-403-8088-20260620.md`) |
| **PRODUCT (closed)** | G-UX-01 CFM — immediate DELETE without modal on UX-XBOS-04/05/08 | Closed — `AlertDialog` + Hủy path verified browser `:8088` |
| **PRODUCT (closed)** | G-UX-02 LOD — UX-XBOS-06 no busy on ✓ submit | Closed R2 — Loader2 + POST **201** + F5 (`QA-R2-SH-*`) |
| **PRODUCT (open)** | G-UX-01 vendors (UX-XBOS-13) native confirm | **OPEN** — out of foundation-01/02 scope |
| **PRODUCT (open P1)** | G-UX-03 NAV — settings/HRM transitions | Out of foundation-01 scope — `P1-UIUX-FE-HRM-02` / NAV wave |
| **PROCESS** | QA pack `verify:qc:evidence-pack` on SoT | **3/8 FAIL** (command_table, portal_url regex, journey_l25) — substance audited; this QC file compliant |

---

## Independent verify commands

| Command | Result |
|---------|--------|
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-uiux-fe-foundation-01-qc-r2-20260620.md` | **PASS** (8/8 — this file) |
| `pnpm run verify:qc:evidence-pack -- --evidence docs/qa/evidence/p1-uiux-fe-foundation-8088-20260620.md` | **FAIL** 3/8 (process format — non-blocking for scoped substance audit) |
| `pnpm run qc:dev-stack` | **PASS** exit **0** (local L0 spot — HRM + XBOS 200) |

---

## L2.5 journey cross-check (CC shareholder path)

| Journey | Scope | Verdict | Evidence |
|---------|-------|---------|----------|
| **J-CC-02** | Settings → group-member-units → TẬP ĐOÀN → Chỉnh sửa → ✓ POST shareholder | **PASS** | QA R2: `group-member-units` 200; POST shareholders **201**; F5 row persists. Aligns with prior L2.5 close 2026-06-20 |

L2.5 **not re-run** for delete-only CFM rows (UX-XBOS-04/05/08) — CFM AC is modal presence, not CRUD journey id.

---

## UX interaction matrix audit (scoped slice)

| UF-ID | gap_id (R1) | CFM R2 | LOD R2 | QC promote |
|-------|-------------|--------|--------|------------|
| UX-XBOS-04 | G-UX-01 P0 | **PASS** — modal «Xóa cổ đông» Hủy/Xóa | n/a | **PROMOTED** |
| UX-XBOS-05 | G-UX-01 P0 | **PASS** — bulk «Xóa cổ đông đã chọn» | n/a | **PROMOTED** |
| UX-XBOS-08 | G-UX-01 P0 | **PASS** — modal «Xóa tài liệu pháp lý» | n/a | **PROMOTED** |
| UX-XBOS-06 | G-UX-02 P0 | n/a (submit — no CFM AC) | **PASS** — MutationButton busy + POST 201 + F5 | **PROMOTED** (LOD; linked J-CC-02) |
| UX-XBOS-07 | — | n/a | PARTIAL / SKIP upload | **NOT IN SCOPE** |

Screenshots: `screenshots/p1-uiux-fe-foundation-8088-20260620/ux-xbos-04-confirm-modal.png`, `ux-xbos-08-legal-doc-confirm.png`.

---

## foundation-02 status (parallel wave — QA done, QC not in this gate)

`docs/qa/evidence/p1-uiux-fe-foundation-02-8088-20260620.md` — **QA retest PASS** 2026-06-20 (`P1-UIUX-FE-FOUNDATION-02-QA`): UX-XBOS-03/09/11/12 🟢 on `:8088`. **Not audited in this QC R2** (scoped to foundation-01 shareholder/legal CFM); matrix rows promoted from QA evidence cross-check only. **foundation-02 QC gate** remains open for PM dispatch.

---

## QC verdict

**GO WITH CONDITIONS (scoped — G-UX-01 CFM CC shareholder + legal doc delete paths)**

### Promoted (closed on `:8088`)

- **G-UX-01 CFM slice:** UX-XBOS-04, UX-XBOS-05, UX-XBOS-08 — luxury `AlertDialog` before destructive delete; Hủy preserves row; U65 zero-seed browser evidence.
- **G-UX-02 LOD (bonus, same wave):** UX-XBOS-06 — Loader2 + disable + POST 201 + F5 after BE 403 fix.

### Conditions (carry — non-blocking for slice)

| ID | Condition | Owner | Trigger |
|----|-----------|-------|---------|
| **C1** | Confirm→**Xóa**→DELETE 2xx→F5 not documented for UX-XBOS-04/05/08 (Hủy-only CFM proof) | qa | Optional P2 spot on `:8088` holding form |
| **C2** | **foundation-02 QC gate** — QA PASS 03/09/11/12; L3 QC not run in this work_item | qc | `P1-UIUX-FE-FOUNDATION-02-QC` |
| **C3** | **G-UX-03 NAV P1** — settings/HRM jank unchanged (audit R1 FAIL) | dev-fe | `P1-UIUX-FE-HRM-02` / NAV wave |
| **C4** | **G-UX-01** vendors KPI delete (UX-XBOS-13) — native `confirm` PARTIAL | dev-fe | Next CC wave |
| **C5** | QA SoT pack format 3/8 — normalize before next QC dispatch | qa | Append command table + J-CC-02 + PORTAL_DEV_URL to foundation SoT |

### Explicitly NOT granted

- **NOT** full G-UX-01 program close (catalog 09 open).
- **NOT** UX interaction UAT-ready (audit R1 overall FAIL — NAV/FBK class).
- **NOT Phase 1 DONE** — Phase 1 gates / excellence program unchanged.

---

## Matrix update

`docs/qa/UIUX_INTERACTION_AUDIT_MATRIX_8088.md` — gap summary: G-UX-01 CFM rows UX-XBOS-04/05/08 **closed**; UX-XBOS-09/12/13 remain open pending foundation-02.

---

## Residual

- UX-XBOS-07 upload LOD — SKIP (U65 no file inject).
- Holding form cold-open ~2s hydrate (timing only — QA R2 note).
- foundation-02 QA PASS (03/09/11/12) — separate QC gate pending; not re-audited in R2 substance beyond matrix cross-check.

---

**ack_status:** `PASS_TO_PM`

**completion_report:** L3 QC closed scoped **G-UX-01 CFM** for CC shareholder single/bulk delete + legal doc delete on `:8088` — **GO WITH CONDITIONS**; UX-XBOS-06 LOD promoted; foundation-02 + G-UX-03 NAV remain P1 open; NOT Phase 1 DONE.

**next_owner:** `pm`

**next_dispatch_prompt:**

```text
work_item_id: P1-UIUX-FE-FOUNDATION-02-QC
entry: docs/qa/evidence/p1-uiux-fe-foundation-02-8088-20260620.md — QA PASS UX-XBOS-03/09/11/12 on :8088; foundation-01 QC R2 GWC closed CFM slice 04/05/08
exit: L3 QC audit foundation-02 — promote G-UX-01 catalog/dept + G-UX-02 LOD rows 03/09/11; verify:qc:evidence-pack 8/8; update matrix gap summary
evidence: docs/qa/evidence/p1-uiux-fe-foundation-02-qc-20260620.md
ack_status: GO or GO WITH CONDITIONS (scoped foundation-02)
cấm: seed
```
