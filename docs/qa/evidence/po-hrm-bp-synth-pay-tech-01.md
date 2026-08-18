# Evidence — PO-HRM-BP-SYNTH-PAY-TECH-01

| Field | Value |
|-------|--------|
| **work_item_id** | `PO-HRM-BP-SYNTH-PAY-TECH-01` |
| **from_role** | sa |
| **to_role** | pm |
| **lane** | governance |
| **date** | 2026-08-04 |
| **ack_status** | **PASS_TO_PM** |
| **SoT** | `docs/client-delivery/hrm-enterprise-blueprint/SYNTHESIS_MASTER_HRM_ENTERPRISE.md` §2.4 P1–P6 · D8 |

---

## 1. Mission closed

| # | Exit item | Result |
|---|-----------|--------|
| 1 | Remove HOLD «họp lương chưa xong / MEETING P1 unfinished» from TECHSPEC / API_DESIGN / OUTLINE | **PASS** — superseded wording; residual HOLD = Q-PAY-FORMULA authoring + D7 unsigned only |
| 2 | Open PAY TechSpec/API depth for meeting-locked rules P1–P6 | **PASS** — TechSpec §7 v0.3 · API §4 F.1 |
| 3 | Q-PAY-FORMULA remains open for *how* formula is authored | **PASS** — explicit HOLD authoring; ADR §10 Option A SA Recommended; drag-drop = GĐ2 not GĐ1 |
| 4 | Keep GW deny-list | **PASS** — API §5 GW-HRM-01..04 unchanged intent |
| 5 | No `apps/**` | **PASS** — docs only |
| 6 | Still DRAFT not customer-signed (D7) | **PASS** — status banners updated |

---

## 2. Artifacts touched

| Path | Version / delta |
|------|-----------------|
| `TECHSPEC_HRM_ENTERPRISE.md` | **0.3.0-DRAFT** — §1 PAY IN · §7 rewrite P1–P6 · §10/11/12 |
| `API_DESIGN_HRM_ENTERPRISE.md` | **0.3.0-DRAFT** — §4 F-PAY-* F.1 · error codes · §7.1–7.3 PAY matrix |
| `TECHSPEC_OUTLINE_HRM_ENTERPRISE.md` | Status + §7 + residuals; DOC-DELTA SYNTH-PAY-TECH-01 |

**Not in SA scope this wave:** `DB_DESIGN_*` (concurrent `PO-HRM-BP-SYNTH-PAY-DB-01` ba-data) — alias pointers kept to `pay_payroll_period` · `pay_payslip` · `pay_formula_definition`.

---

## 3. PAY F.1 inventory (meeting-locked)

| F-id | P* | FR | Verdict |
|------|----|----|---------|
| F-PAY-PERIOD-01 | P5 | PAY-01/06 | DRAFT |
| F-PAY-ATT-CLOSED-01 | P1 | PAY-01 | DRAFT |
| F-PAY-CB-READ-01 | P2 | PAY-01 #3 · CORE-02 | DRAFT |
| F-PAY-RD-APPLY-01 | P3 | CORE-08 · PAY-07 | DRAFT |
| F-PAY-PROCESS-01 | P1–P5 | PAY-01/02/06 | DRAFT |
| F-PAY-PAYSLIP-01 | — | PAY-08 | DRAFT |
| F-PAY-SPLIT-01 | P6 | PAY-04 | DRAFT pointer |
| F-PAY-TERM-SETTLE-01 | P6 | PAY-07 | DRAFT pointer |
| F-PAY-FORMULA-* | P4 | PAY-02 | **HOLD authoring** (Q-PAY-FORMULA) |

---

## 4. Grep self-check (SA trio)

Forbidden phrases in TECHSPEC / API_DESIGN / OUTLINE after edit:

- `họp lương chưa xong` → **0** (only as SUPERSEDED / cấm ghi)
- `MEETING P1 unfinished` → **0** as active HOLD reason
- `R-BP-PAY-MEETING` → marked **SUPERSEDED**

Active residual phrasing allowed: `Q-PAY-FORMULA`, `DRAFT`, `not customer-signed`, `D7`.

---

## 5. Non-claims / residuals

| Residual | Owner | Note |
|----------|-------|------|
| Q-PAY-FORMULA partner confirm | PM + partner | Before full formula author/publish F.1 + Dev formula |
| ba-data PAY column depth | ba-data | `PO-HRM-BP-SYNTH-PAY-DB-01` — align `split_segments_json` etc. |
| D7 customer paper sign | PM | No Dev unlock |
| SRS FR PAY-07 line still may say «họp lương» in places | ba-process SYNTH-SRS | Out of SA trio; flag for PM |

---

## 6. Handoff

```text
completion_report: Closed CORRECTION — PAY TechSpec/API/Outline v0.3 DRAFT depth for SYNTHESIS P1–P6 + FR PAY-01/02/04/07; removed meeting-unfinished HOLD; Q-PAY-FORMULA authoring HOLD kept; GW deny-list kept; D7 unsigned; no apps/**.
next_owner: pm
next_dispatch_prompt: |
  work_item_id: PO-HRM-BP-SYNTH-PAY-ALIGN-01
  from_role: pm
  to_role: ba-data (or sa spot-check)
  entry: after SYNTH-PAY-DB-01 PASS — align pay_* columns to API_DESIGN §4 F-PAY-* + TechSpec §7.5
  exit: alias matrix PASS; no «họp lương chưa xong» in DB_DESIGN; Q-PAY-FORMULA stub depth documented; evidence + PASS_TO_PM
  cấm: apps/** · invent drag-drop GĐ1 · claim customer signed
ack_status: PASS_TO_PM
evidence_path: docs/qa/evidence/po-hrm-bp-synth-pay-tech-01.md
```
