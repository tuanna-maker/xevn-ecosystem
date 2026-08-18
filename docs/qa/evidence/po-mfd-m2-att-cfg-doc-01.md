# Evidence — `PO-MFD-M2-ATT-CFG-DOC-01`

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-MFD-M2-ATT-CFG-DOC-01` |
| **from_role** | `ba-process` |
| **to_role** | `pm` |
| **lane** | governance |
| **priority** | P2 |
| **date** | 2026-08-04 |
| **ack_status** | `PASS_TO_PM` |
| **change_mode** | DOC-DELTA only — **no** `apps/**` |
| **SoT** | [`ADR-HRM-ATTENDANCE-CFG-PERSIST-20260804.md`](../../architecture/ADR-HRM-ATTENDANCE-CFG-PERSIST-20260804.md) D2–D4 · M1 CFG GWC [`po-mfd-m1-att-p0-cfg-qc-01.md`](po-mfd-m1-att-p0-cfg-qc-01.md) · QA wire Chung PATCH 200 on commit `dc930c5` |
| **NOT claimed** | Phase 1 DONE · product UAT DONE · PROD-READY · Face model · OT approve · ScanFace · seed |

---

## Objective

Retire stale FE/governance wording that claims Rules→Chung save is `cfgNotPersisted` / in-memory / «rules not persisted» / Nest rules **NO_API**, after M1 CFG wave **GO WITH CONDITIONS** and browser **PATCH `/api/hrm/attendance/rules` → 200**.

---

## Grep inventory (stale → action)

| Path | Prior claim | Action |
|------|-------------|--------|
| `docs/qa/evidence/po-mfd-m2-att-wire-balance-01.md` | Settings → destructive toast `cfgNotPersisted` | **SUPERSEDED** → PATCH 200 + F5; residual D4/columns only |
| `docs/qa/evidence/po-mfd-m2-att-wire-balance-01-qa.md` | Residual R-M2-ATT-CFG-DOC OPEN | **CLOSED** → this work item |
| `docs/qa/evidence/po-mfd-m2-att-wire-balance-qc-01.md` | Condition + residual CFG-DOC OPEN; FE STALE; CFG QC absent | **CLOSED** residual · cross-ref M1 CFG GWC |
| `docs/qa/evidence/po-mfd-m1-att-cfg-ref-01.md` | Chung STUB_UI Save unwired | **SUPERSEDED** pointer |
| `docs/qa/professional/by-uc/HRM-AT-14.md` | Rules **NO_API** · in-memory GAP · BR-AT14-CFG-02 AS-IS setState | DOC-DELTA api_contract + BR + handoff; **`uat_done: false`** |
| `docs/qa/professional/menu-fidelity/HRM-ATTENDANCE_DATA_CLASS_MATRIX.md` | HARDCODED / NO_API / P0-1/2 open | DOC-DELTA §2.2 · §3 · §5 · P0-1/2 **CLOSED GWC** |
| `docs/qa/professional/menu-fidelity/HRM-ATTENDANCE_ENTERPRISE_API_MAP.md` | C7 in-memory / API not shipped · G-CFG-RULES P0 open | DOC-DELTA C7 + G-CFG-RULES closed slice |
| `docs/qa/professional/menu-fidelity/HRM-ATTENDANCE_FIDELITY_MATRIX.md` | Row 32 UNMAPPED / live without persist note | DOC-DELTA meta + row 32/33 → HRM-AT-14 · persist GWC |
| `docs/qa/professional/menu-fidelity/HRM-ATTENDANCE_M2_BACKLOG.md` | P0-CFG-BE/FE READY/QUEUED | Executive + P0 table → **GWC**; CFG-DOC-01 **CLOSED** |
| `docs/program/AGENT_MESSAGE_BUS.md` | Dispatch note only | Left as bus history (no product claim) |

**Out of scope (unchanged):** Face model URLs · OT approve · ScanFace · seed · sheet columns HARDCODED · tablet/proxy/auto stubs · GEO-001 check-in browser residual.

---

## Alignment statement (process truth)

| Topic | AS-IS (docs after DOC-01) |
|-------|---------------------------|
| Rules→Chung **Lưu** | Nest `PATCH /api/hrm/attendance/rules?company_id=…` **200** + F5/GET retain (M1 CFG QA/QC GWC · `dc930c5`) |
| Work-sites GPS admin | Nest work-sites CRUD (ADR D3 · M1 CFG GWC) |
| `cfgNotPersisted` | **Retired** as product/FE handoff claim; historical strike-through only |
| D4 sidebars / Face ID OUT GĐ1 | Still honest stubs / banners — **not** fake persist |
| Columns catalog | Still **HARDCODED** — P0-3 OPEN |
| UAT | **`uat_done: false`** everywhere touched |

---

## Residual after this seat

| ID | Status | Owner |
|----|--------|-------|
| R-M2-ATT-CFG-DOC | **CLOSED** | — |
| Sheet columns HARDCODED | OPEN | `PO-MFD-M2-ATT-CFG-COLUMNS-01` |
| Face model asset HTML | OPEN | `R-M2-ATT-FACE-MODELS` / dev-fe |
| Attendance full UAT | OPEN | program · not this DOC |

---

## completion_report

**Closed:** Governance DOC-DELTA `PO-MFD-M2-ATT-CFG-DOC-01` — grep + supersede `cfgNotPersisted` / rules-not-persisted / NO_API rules claims across FE wire evidence, QC residual, HRM-AT-14, DATA_CLASS, ENTERPRISE_API_MAP C7, fidelity matrix rows 32–33, M2 backlog. Aligned to ADR-HRM-ATTENDANCE-CFG-PERSIST + M1 CFG GWC PATCH 200. No product code. **Did not** claim UAT DONE.

**Open:** Columns catalog · Face models · remaining M2 P0/P1 seats (SHIFTS/SHEETS/…) · program UAT.

## next_owner

**pm**

## next_dispatch_prompt

```text
(none — DOC residual R-M2-ATT-CFG-DOC closed)

Optional PM only if program continues M2 Attendance:
- Keep backlog P0-5 SHIFTS-02 / P0-6 SHEETS / P1-6 CFG-COLUMNS as next execution; do not re-open CFG-DOC.
- Do not dispatch seed / Face / ScanFace from this close.
evidence_path: docs/qa/evidence/po-mfd-m2-att-cfg-doc-01.md
```

## ack_status

**PASS_TO_PM**
