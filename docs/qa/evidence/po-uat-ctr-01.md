# Evidence — `PO-UAT-CTR-01`

| Field | Value |
|-------|-------|
| **work_item_id** | `PO-UAT-CTR-01` |
| **from_role** | `qa` |
| **to_role** | `pm` |
| **date** | 2026-08-07 |
| **lane** | execution · UAT pack **Hợp đồng lao động in (printable)** |
| **program** | `PO-UAT-MODULES-PARALLEL-01` |
| **portal** | `http://127.0.0.1:5173` · HRM `:28001` · XBOS `:28002` |
| **persona** | `ceo@xe.vn` / `Xevn@2026` · `company_id=main` |
| **U65** | zero-seed · browser-only · **no** `pnpm seed:*` |
| **Verdict** | **PASS_WITH_OBS** |
| **ack_status** | `PASS_WITH_OBS` |
| **next** | `qc` · `PO-UAT-CTR-QC-01` |
| **Honesty** | **`contracts_printable_ready=false`** — **DENIED** set true this seat · await QC GO |

### Prior GWC (entry accepted)

| Seal | Evidence | Status |
|------|----------|--------|
| Print-spine | `po-hrm-contract-legal-print-qc-01.md` | GWC must_keep |
| Q-CTR-02 PDF binary | `po-hrm-contract-legal-print-qc-02.md` | CLOSED must_keep |
| Q-CTR-01 library publish | `po-hrm-contract-legal-print-qc-q-ctr-01.md` | CLOSED must_keep |

### L0 / health

| Check | Result |
|-------|--------|
| `qc:dev-stack` | hrm/xbos/portal **200** |
| `qc:fe-be-health` | **ALL PASS** (login + employees + catalog + proxy) |

---

## UAT pack matrix

| # | Pack item | AC / UF / J | Verdict | Evidence stamp / proof |
|---|-----------|-------------|---------|------------------------|
| 1a | Clause CRUD incl **LEGAL_BASIS** + activate + F5 | AC-CTR-CL-01 | 🟢 **PASS** | `CTRQA-ICFFU2` · codes `LEGAL_CTRQA-ICFFU2` + `JOB_CTRQA-ICFFU2` · POST **201** · Hiệu lực · F5 rows |
| 1b | Template DnD persist + reorder + F5 **Mở** canvas | AC-CTR-TPL-DND | 🟢 **PASS** | `_tmp-po-uat-ctr-01-dnd.FINAL.json` · placed=2 · reorder=true · orderMatch=true · dndStorm=0 · screens `po-uat-ctr-01/02-after-dnd.png` · `03-f5-canvas.png` |
| 2a | UF-HRM-02 create HĐ + `work_location` + F5 | UF-HRM-02 | 🟢 **PASS** | R3 `CTR3-ICBW7K` · `HD-CCEC8` · POST **201** `HRM-CON-201` · F5 list |
| 2b | Preview `can_issue=true` → print-version → PDF `%PDF` | AC-CTR-PRINT-SPINE + PDF | 🟢 **PASS** | Preview **201** `can_issue=true` · print-versions **201** `HRM-CTR-VER-201` · F5 versions=1 · GET pdf **200** `application/pdf` magic **`%PDF-`** · engine=pdfkit · stub=false · fresh vid `3e4aae59-…` len 14117 · QA-02 also `HD-QVQ6L` / `312255a9-…` toast **Đã tải PDF** |
| 3 | Holding publish → member pull/apply + origin badge | AC-HOLDING / MEMBER / ORIGIN | 🟢 **PASS** | QA-05 `CTR5-ICBYP8` · publish **201** v**4** · OU `trsport` pull **201** upserted=6 · apply **201** · badges `Tập đoàn · v4` (CL×4 TPL×2) · query-only `company_id` |
| 4 | J-HRM-03 Eye dialog | J-HRM-03 | 🟢 **PASS** | Eye testid → dialog open · code=`HD-BN37L` · populated · latch=1 |
| 5 | Process: no DnD storm / mojibake / Uncaught | PROCESS_GATE | 🟢 **PASS** | All harnesses: dndStorm=0 · uncaught=0 · mojibake=false (settings/list) · QA-05 console 400 = expected NOTHING-TO-APPLY neg |

---

## Soft OBS (documented — not NO-GO)

| ID | Severity | Note |
|----|----------|------|
| **OBS-OU-CHIP-SETTINGS** | soft | Settings `/hr/settings` **hides** OU chip; member library path uses `sessionStorage['hrm:operating-unit-filter']` (prior Q-CTR-01). **Does not block** member pull/apply when filter set. Documented per entry. |
| **OBS-CODE-CONFLICT** | soft | Member-local CODE-CONFLICT not reproduced without invent collide (U65 forbid). Exit allowed. |
| **OBS-QA01-HARNESS-MO** | P3 harness | Legacy `_tmp-po-hrm-contract-legal-print-qa-01.mjs` looked for **Sửa** on template row; product load = **Mở**. Product + API `layout_json.clause_ids` OK — closed by focused DnD harness. |

---

## Honesty locks (mandatory)

| Flag | Value |
|------|-------|
| **contracts_printable_ready** | **false** — **not** set true this seat |
| Seed | **DENIED** |
| Phase 1 DONE | **NOT claimed** |
| Module printable GO | **DENIED** until **QC** `PO-UAT-CTR-QC-01` |

---

## Machine artifacts

| Artifact | Path |
|----------|------|
| DnD FINAL | `docs/qa/evidence/_tmp-po-uat-ctr-01-dnd.FINAL.json` |
| CL / UF (solo retest) | `docs/qa/evidence/_tmp-po-hrm-contract-legal-print-qa-01.FINAL.json` stamp `CTRQA-ICFFU2` |
| Print-spine R3 | `docs/qa/evidence/_tmp-po-hrm-contract-legal-print-qa-01-r3.FINAL.json` stamp `CTR3-ICBW7K` |
| PDF binary | `docs/qa/evidence/_tmp-po-hrm-contract-legal-print-qa-02.FINAL.json` stamp `CTR2-ICBY1V` |
| Library publish | `docs/qa/evidence/_tmp-po-hrm-contract-legal-print-qa-05.FINAL.json` stamp `CTR5-ICBYP8` |
| J-HRM-03 | `docs/qa/evidence/_tmp-po-hrm-e2e-link-emp-qa-j03-01.FINAL.json` |
| Screens DnD | `docs/qa/evidence/screens/po-uat-ctr-01/` |

---

## Residual (for QC)

| ID | Sev | Owner | Status |
|----|-----|-------|--------|
| OBS-OU-CHIP-SETTINGS | soft | product/UX | **OPEN soft** — accept or backlog discoverability |
| OBS-CODE-CONFLICT | soft | — | **OPEN soft** — U65 |
| P0/P1 product blockers | — | — | **none** this UAT pack |

---

## completion_report

**Closed:** Full UAT pack PO-UAT-CTR-01 browser-only — Settings LEGAL_BASIS CRUD + template DnD/F5; UF-HRM-02 + work_location → can_issue → print-version → PDF `%PDF`; holding→member library + origin badge; J-HRM-03 Eye; process clean. Honesty **false** retained.

**Residual:** Soft OU chip OBS + CODE-CONFLICT OBS only. No P0/P1 product FAIL.

**ack_status:** `PASS_WITH_OBS`

### next_owner

`qc`

### next_dispatch_prompt

```text
work_item_id: PO-UAT-CTR-QC-01
from_role: pm
to_role: qc
lane: governance
parent: PO-UAT-CTR-01 PASS_WITH_OBS
evidence_read: docs/qa/evidence/po-uat-ctr-01.md
machine: _tmp-po-uat-ctr-01-dnd.FINAL.json + R3/QA-02/QA-05/J03 FINALs cited in MD
entry: audit L0 + UAT pack matrix 1–5; soft OBS OU chip + CODE-CONFLICT
exit: GO | GO WITH CONDITIONS | NO-GO
honesty: contracts_printable_ready remains false unless QC explicitly GO printable module
cấm: seed · invent Phase1 DONE · flip ready without GO wording
```
